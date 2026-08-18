import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the BarcaManyak application", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>BarcaManyak<\/title>/i);
  assert.match(html, /BarcaManyak/);
  assert.match(html, /Loading the league/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("ships local football identities instead of fetching static data at startup", async () => {
  const [source, playerFiles, teamFiles] = await Promise.all([
    readFile(new URL("../app/BarcaManyak.jsx", import.meta.url), "utf8"),
    readdir(new URL("../public/assets/players/", import.meta.url)),
    readdir(new URL("../public/assets/teams/", import.meta.url)),
  ]);

  assert.match(source, /const TEAM_BADGES = \{/);
  assert.match(source, /const PLAYER_ALIASES = \{/);
  // photos stay local; players may also carry an explicit local filename
  assert.match(source, /photo: player\.photo \|\| `\/assets\/players\/\$\{player\.id\}\.png`/);
  assert.doesNotMatch(source, /photo: "https?:\/\//);
  assert.match(source, /MON_HE = \["ינואר"/);
  assert.match(source, /viewLastLineup: "צפייה בהרכב האחרון"/);
  assert.match(source, /src="\/assets\/brand\/messi\.jpeg"/);
  assert.doesNotMatch(source, /footballGet\("squad"\)/);
  assert.ok(playerFiles.filter((file) => file.endsWith(".png")).length >= 27);
  assert.ok(teamFiles.filter((file) => file.endsWith(".png")).length >= 50);
});

test("publishes an installable home-screen identity", async () => {
  const [layout, manifest, appleIcon] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../public/apple-touch-icon.png", import.meta.url)),
  ]);

  assert.match(layout, /apple-touch-icon\.png/);
  assert.match(layout, /manifest\.webmanifest/);
  assert.equal(JSON.parse(manifest).display, "standalone");
  assert.ok(appleIcon.length > 1_000);
});
