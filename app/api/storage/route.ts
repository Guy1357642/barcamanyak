import { env } from "cloudflare:workers";

async function ensureTable() {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT NOT NULL,
      scope TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (key, scope)
    )
  `).run();
}

function scopeFor(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("shared") === "0" ? "local" : "shared";
}

export async function GET(request: Request) {
  await ensureTable();
  const url = new URL(request.url);
  const scope = scopeFor(request);

  // batch read: ?keys=a,b,c returns every value in one round trip
  const keysParam = url.searchParams.get("keys");
  if (keysParam) {
    const keys = keysParam.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 50);
    if (!keys.length) return Response.json({ error: "keys is empty" }, { status: 400 });
    const placeholders = keys.map(() => "?").join(",");
    const { results } = await env.DB.prepare(
      `SELECT key, value, updated_at AS updatedAt FROM app_state WHERE scope = ? AND key IN (${placeholders})`
    ).bind(scope, ...keys).all<{ key: string; value: string; updatedAt: number }>();
    const values: Record<string, { value: string | null; updatedAt: number | null }> = {};
    keys.forEach((k) => { values[k] = { value: null, updatedAt: null }; });
    (results || []).forEach((row) => { values[row.key] = { value: row.value, updatedAt: row.updatedAt }; });
    return Response.json({ values });
  }

  const key = url.searchParams.get("key")?.trim();
  if (!key) return Response.json({ error: "key is required" }, { status: 400 });

  const row = await env.DB.prepare(
    "SELECT value, updated_at AS updatedAt FROM app_state WHERE key = ? AND scope = ?"
  ).bind(key, scope).first<{ value: string; updatedAt: number }>();

  return Response.json({ value: row?.value ?? null, updatedAt: row?.updatedAt ?? null });
}

export async function PUT(request: Request) {
  await ensureTable();
  const body = await request.json() as { key?: string; value?: string; shared?: boolean };
  const key = body.key?.trim();
  if (!key || typeof body.value !== "string") {
    return Response.json({ error: "key and value are required" }, { status: 400 });
  }

  await env.DB.prepare(`
    INSERT INTO app_state (key, scope, value, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key, scope) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).bind(key, body.shared === false ? "local" : "shared", body.value, Date.now()).run();

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  await ensureTable();
  const url = new URL(request.url);
  const key = url.searchParams.get("key")?.trim();
  if (!key) return Response.json({ error: "key is required" }, { status: 400 });

  await env.DB.prepare("DELETE FROM app_state WHERE key = ? AND scope = ?")
    .bind(key, scopeFor(request)).run();
  return Response.json({ ok: true });
}
