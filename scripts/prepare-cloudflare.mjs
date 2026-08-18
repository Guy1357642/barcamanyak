#!/usr/bin/env node
/**
 * Prepares `dist/server/wrangler.json` for a direct `wrangler deploy` to your own
 * Cloudflare account, instead of going through OpenAI Sites.
 *
 * The build emits a wrangler config with a placeholder D1 id, so this patches in
 * the real one and names the ASSETS binding the worker expects.
 *
 * Usage:
 *   D1_DATABASE_ID=<uuid> node scripts/prepare-cloudflare.mjs [--name barcamanyak]
 */
import fs from "node:fs";
import path from "node:path";

const CONFIG = path.join("dist", "server", "wrangler.json");
const PLACEHOLDER = "00000000-0000-4000-8000-000000000000";

const args = process.argv.slice(2);
const nameArg = args.indexOf("--name");
const workerName = nameArg !== -1 ? args[nameArg + 1] : "barcamanyak";
let dbId = process.env.D1_DATABASE_ID;
if (!dbId && fs.existsSync(".env.deploy")) {           // remembered from the first deploy
  const m = fs.readFileSync(".env.deploy", "utf8").match(/D1_DATABASE_ID=([0-9a-f-]{36})/i);
  if (m) dbId = m[1];
}
const dbName = process.env.D1_DATABASE_NAME || "barcamanyak";

if (!fs.existsSync(CONFIG)) {
  console.error(`✗ ${CONFIG} not found. Run \`pnpm build\` first.`);
  process.exit(1);
}
if (!dbId) {
  console.error("✗ D1_DATABASE_ID is not set.\n" +
    "  Create the database first:\n" +
    "    npx wrangler d1 create barcamanyak\n" +
    "  then re-run with the uuid it prints:\n" +
    "    D1_DATABASE_ID=<uuid> node scripts/prepare-cloudflare.mjs");
  process.exit(1);
}
if (!/^[0-9a-f-]{36}$/i.test(dbId)) {
  console.error(`✗ D1_DATABASE_ID does not look like a uuid: ${dbId}`);
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(CONFIG, "utf8"));

cfg.name = workerName;
cfg.topLevelName = workerName;

// point the DB binding at the real database
const d1 = (cfg.d1_databases || []).find((d) => d.binding === "DB");
if (!d1) {
  console.error("✗ no D1 binding named DB in the built config — did the build change?");
  process.exit(1);
}
if (d1.database_id !== PLACEHOLDER && d1.database_id !== dbId) {
  console.warn(`! DB id was already set to ${d1.database_id}; overwriting with ${dbId}`);
}
d1.database_id = dbId;
d1.database_name = dbName;

// worker/index.ts reads env.ASSETS for the image endpoint; name the binding so it exists
cfg.assets = { ...(cfg.assets || {}), directory: "../client", binding: "ASSETS" };

// dev-only noise that wrangler deploy does not need
delete cfg.dev;
delete cfg.build;

fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));

console.log("✓ patched", CONFIG);
console.log(`  worker name : ${cfg.name}`);
console.log(`  d1 binding  : ${d1.binding} -> ${d1.database_name} (${d1.database_id})`);
console.log(`  assets      : ${cfg.assets.directory} (binding ${cfg.assets.binding})`);
console.log(`  main        : ${cfg.main}`);
console.log("\nNext:");
console.log(`  npx wrangler deploy -c ${CONFIG}`);
console.log("  npx wrangler secret put FOOTBALL_DATA_KEY");
