#!/usr/bin/env node
/**
 * Copies the whole league — profiles, bets, results, badges, line-ups, fixtures —
 * from one BarcaManyak deployment to another, using the app's own storage API.
 *
 * Nothing is deleted from the source; it only reads.
 *
 * Usage:
 *   node scripts/migrate-data.mjs \
 *     --from https://barcamanyak-friends.empire-media-2222.chatgpt.site \
 *     --to   https://barcamanyak.<your-subdomain>.workers.dev
 *
 * Add --dry-run to see what would be copied without writing anything.
 * Add --backup league-backup.json to also save a local copy of everything.
 */
const args = process.argv.slice(2);
const opt = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const FROM = (opt("from") || "").replace(/\/+$/, "");
const TO = (opt("to") || "").replace(/\/+$/, "");
const DRY = args.includes("--dry-run");
const BACKUP = opt("backup");

if (!FROM || (!TO && !DRY && !BACKUP)) {
  console.error("Usage: node scripts/migrate-data.mjs --from <old-url> --to <new-url> [--dry-run] [--backup file.json]");
  process.exit(1);
}

const BASE_KEYS = ["bm:users", "bm:results", "bm:badges", "bm:lineups", "bm:seasonresult", "bm:fixtures", "bm:wipe"];

async function readOne(origin, key) {
  const r = await fetch(`${origin}/api/storage?key=${encodeURIComponent(key)}&shared=1`);
  if (!r.ok) throw new Error(`read failed (${r.status}) for ${key}`);
  const data = await r.json();
  return data?.value ?? null;
}

/* The batch endpoint only exists on newer deployments. Older ones answer 400,
   so fall back to reading one key at a time — slower but works everywhere. */
async function readKeys(origin, keys) {
  const out = {};
  try {
    const url = `${origin}/api/storage?keys=${keys.map(encodeURIComponent).join(",")}&shared=1`;
    const r = await fetch(url);
    if (r.ok) {
      const data = await r.json();
      if (data?.values) {
        for (const k of keys) out[k] = data.values[k]?.value ?? null;
        return out;
      }
    }
  } catch { /* fall through to one-at-a-time */ }

  for (const k of keys) {
    out[k] = await readOne(origin, k);
    await new Promise((r) => setTimeout(r, 60));
  }
  return out;
}

async function writeKey(origin, key, value) {
  const r = await fetch(`${origin}/api/storage`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value, shared: true }),
  });
  if (!r.ok) throw new Error(`write failed (${r.status}) for ${key}`);
}

const size = (s) => (s ? `${(s.length / 1024).toFixed(1)} KB` : "empty");

try {
  console.log(`reading from ${FROM}`);
  const base = await readKeys(FROM, BASE_KEYS);

  // the users list tells us which per-player bet records exist
  let users = [];
  try { users = JSON.parse(base["bm:users"] || "[]"); } catch { users = []; }
  const betKeys = users.map((u) => `bm:bets:${u.id}`);
  const bets = betKeys.length ? await readKeys(FROM, betKeys) : {};

  const all = { ...base, ...bets };
  const present = Object.entries(all).filter(([, v]) => v != null);

  console.log(`\nfound ${users.length} profiles: ${users.map((u) => u.name).join(", ") || "(none)"}`);
  console.log(`${present.length} keys to copy:\n`);
  for (const [k, v] of present) console.log(`  ${k.padEnd(26)} ${size(v)}`);

  if (BACKUP) {
    const fs = await import("node:fs");
    fs.writeFileSync(BACKUP, JSON.stringify(all, null, 1));
    console.log(`\n✓ backup written to ${BACKUP}`);
  }

  if (DRY) { console.log("\n--dry-run: nothing written."); process.exit(0); }

  console.log(`\nwriting to ${TO}`);
  let done = 0;
  for (const [k, v] of present) {
    await writeKey(TO, k, v);
    done++;
    console.log(`  ✓ ${k}`);
    await new Promise((r) => setTimeout(r, 120));   // be gentle with the write endpoint
  }
  console.log(`\n✓ copied ${done} keys. Open the new site and check the league is intact.`);
} catch (err) {
  console.error(`\n✗ ${err.message}`);
  console.error("Nothing was deleted from the source. Fix the problem and run it again.");
  process.exit(1);
}
