import { env } from "cloudflare:workers";

/**
 * Football data, served from football-data.org.
 *
 * API-Football's free plan is hard-limited to seasons 2022–2024 ("Free plans do not
 * have access to this season"), so it cannot serve 2026/27 at all. This module talks
 * to football-data.org instead but keeps the exact response shape the app already
 * parses — API-Football's `{ response: [...] }` layout — so app/BarcaManyak.jsx needs
 * no changes at all.
 *
 * Coverage: the free tier covers La Liga (PD) and the Supercopa (SDE). Champions
 * League and Copa del Rey are not on the plan. For those two gaps — Champions League
 * fixtures and line-ups (football-data's free tier exposes neither) — TheSportsDB's
 * free API (key "123", verified live: lookuplineup.php returns real starting-XI data,
 * and league 4480 "UEFA Champions League" carries the 2026-2027 season) is used as a
 * secondary provider. It only ever runs when football-data has nothing to offer, so a
 * quiet or unreachable TheSportsDB never breaks the primary path.
 */

const BASE_URL = "https://api.football-data.org/v4";
const FD_BARCELONA = 81;          // Barcelona's id at football-data.org
const APP_BARCELONA = 529;        // the id the app hardcodes; keep emitting it
const SEASON = 2026;              // the 2026/27 campaign
const DAILY_LIMIT = 1000;         // the real constraint here is per minute, not per day
const MINUTE_LIMIT = 9;           // free tier allows 10/min; leave one spare

/* ---------- TheSportsDB: secondary provider for Champions League + line-ups ---------- */
const SDB_BASE = "https://www.thesportsdb.com/api/v1/json/123";
const SDB_TEAM_ID = "133739";      // Barcelona at TheSportsDB (idAPIfootball 529 — same club)
const SDB_MINUTE_LIMIT = 25;       // documented free cap is 30/min; leave headroom

type CacheRow = { payload: string; expiresAt: number; updatedAt: number };

async function ensureTables() {
  await env.DB.batch([
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS api_cache (
        key TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS quota_usage (
        day TEXT PRIMARY KEY,
        requests INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      )
    `),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS api_locks (
        key TEXT PRIMARY KEY,
        expires_at INTEGER NOT NULL
      )
    `),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS api_calls (
        at INTEGER NOT NULL
      )
    `),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS sdb_calls (
        at INTEGER NOT NULL
      )
    `),
  ]);
}

const utcDay = () => new Date().toISOString().slice(0, 10);
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function cacheGet(key: string) {
  return env.DB.prepare(
    "SELECT payload, expires_at AS expiresAt, updated_at AS updatedAt FROM api_cache WHERE key = ?"
  ).bind(key).first<CacheRow>();
}

async function cachePut(key: string, payload: unknown, ttlMs: number) {
  const now = Date.now();
  await env.DB.prepare(`
    INSERT INTO api_cache (key, payload, expires_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET payload = excluded.payload, expires_at = excluded.expires_at, updated_at = excluded.updated_at
  `).bind(key, JSON.stringify(payload), now + ttlMs, now).run();
}

async function acquireLock(key: string) {
  const now = Date.now();
  await env.DB.prepare("DELETE FROM api_locks WHERE key = ? AND expires_at < ?").bind(key, now).run();
  const result = await env.DB.prepare("INSERT OR IGNORE INTO api_locks (key, expires_at) VALUES (?, ?)")
    .bind(key, now + 15_000).run();
  return (result.meta?.changes || 0) > 0;
}
const releaseLock = (key: string) =>
  env.DB.prepare("DELETE FROM api_locks WHERE key = ?").bind(key).run();

async function quotaCount() {
  const row = await env.DB.prepare("SELECT requests FROM quota_usage WHERE day = ?")
    .bind(utcDay()).first<{ requests: number }>();
  return row?.requests ?? 0;
}

async function incrementQuota() {
  await env.DB.prepare(`
    INSERT INTO quota_usage (day, requests, updated_at) VALUES (?, 1, ?)
    ON CONFLICT(day) DO UPDATE SET requests = requests + 1, updated_at = excluded.updated_at
  `).bind(utcDay(), Date.now()).run();
}

/* football-data.org limits by requests per minute rather than per day, so that is what
   has to be policed. A rolling window of call timestamps does the job. */
async function callsInLastMinute() {
  const cutoff = Date.now() - 60_000;
  await env.DB.prepare("DELETE FROM api_calls WHERE at < ?").bind(cutoff).run();
  const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM api_calls WHERE at >= ?")
    .bind(cutoff).first<{ n: number }>();
  return row?.n ?? 0;
}

async function footballData(path: string, params: Record<string, string | number> = {}) {
  const key = (env as unknown as { FOOTBALL_DATA_KEY?: string }).FOOTBALL_DATA_KEY;
  if (!key) throw new Error("FOOTBALL_DATA_KEY is not configured");

  if ((await callsInLastMinute()) >= MINUTE_LIMIT) {
    throw new Error("Per-minute rate limit reached; serving cached data");
  }

  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([name, value]) => url.searchParams.set(name, String(value)));

  // record the call before making it, so a timeout cannot hide usage
  await env.DB.prepare("INSERT INTO api_calls (at) VALUES (?)").bind(Date.now()).run();
  await incrementQuota();

  const response = await fetch(url, { headers: { "X-Auth-Token": key } });
  if (response.status === 429) throw new Error("football-data.org rate limit hit");
  if (response.status === 403) throw new Error("That competition is not on your football-data.org plan");
  if (!response.ok) throw new Error(`football-data.org returned ${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
}

/* rolling per-minute window for TheSportsDB, same technique as football-data's */
async function sdbCallsInLastMinute() {
  const cutoff = Date.now() - 60_000;
  await env.DB.prepare("DELETE FROM sdb_calls WHERE at < ?").bind(cutoff).run();
  const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM sdb_calls WHERE at >= ?")
    .bind(cutoff).first<{ n: number }>();
  return row?.n ?? 0;
}

async function sportsDb(path: string, params: Record<string, string> = {}) {
  if ((await sdbCallsInLastMinute()) >= SDB_MINUTE_LIMIT) {
    throw new Error("TheSportsDB per-minute rate limit reached");
  }
  const url = new URL(`${SDB_BASE}${path}`);
  Object.entries(params).forEach(([name, value]) => url.searchParams.set(name, value));
  await env.DB.prepare("INSERT INTO sdb_calls (at) VALUES (?)").bind(Date.now()).run();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`TheSportsDB returned ${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
}

/* ---------- translation into the layout the app already parses ---------- */

const COMPETITION_IDS: Record<string, number> = {
  PD: 140,    // La Liga
  CL: 2,      // Champions League
  CDR: 143,   // Copa del Rey
  SDE: 556,   // Supercopa
};

function statusShort(fd: string, minute: number | null) {
  switch (fd) {
    case "FINISHED": return "FT";
    case "AWARDED": return "AWD";
    case "IN_PLAY": return minute != null && minute > 45 ? "2H" : "1H";
    case "PAUSED": return "HT";
    case "POSTPONED": return "PST";
    case "CANCELLED": return "CANC";
    case "SUSPENDED": return "ABD";
    default: return "NS";                    // SCHEDULED, TIMED
  }
}

type FdTeam = { id?: number; name?: string; shortName?: string; crest?: string };
type FdMatch = {
  id: number; utcDate: string; status: string; matchday?: number; minute?: number;
  competition?: { code?: string; name?: string };
  homeTeam?: FdTeam; awayTeam?: FdTeam;
  score?: { fullTime?: { home: number | null; away: number | null } };
  goals?: Array<{
    minute?: number; type?: string; team?: FdTeam;
    scorer?: { name?: string }; assist?: { name?: string } | null;
  }>;
  bookings?: Array<{ minute?: number; team?: FdTeam; player?: { name?: string }; card?: string }>;
  substitutions?: Array<{ minute?: number; team?: FdTeam; playerIn?: { name?: string }; playerOut?: { name?: string } }>;
};

/* Barcelona keeps the id the app expects, so nothing downstream has to change. */
const team = (t?: FdTeam) => ({
  id: t?.id === FD_BARCELONA ? APP_BARCELONA : t?.id,
  name: t?.id === FD_BARCELONA ? "Barcelona" : (t?.shortName || t?.name),
  logo: t?.crest || null,
});

function toFixture(match: FdMatch) {
  const minute = match.minute ?? null;
  const code = match.competition?.code || "";
  return {
    fixture: {
      id: match.id,
      date: match.utcDate,
      status: { short: statusShort(match.status, minute), elapsed: minute },
    },
    league: {
      id: COMPETITION_IDS[code] ?? null,
      name: match.competition?.name || "",
      round: match.matchday ? `Regular Season - ${match.matchday}` : "",
    },
    teams: { home: team(match.homeTeam), away: team(match.awayTeam) },
    goals: {
      home: match.score?.fullTime?.home ?? null,
      away: match.score?.fullTime?.away ?? null,
    },
    /* the app reads events to derive scorers and assists */
    events: [
      ...(match.goals || []).map((g) => ({
        time: { elapsed: g.minute ?? null, extra: null },
        team: team(g.team),
        player: { name: g.scorer?.name || null },
        assist: { name: g.assist?.name || null },
        type: "Goal",
        detail: g.type === "OWN" ? "Own Goal" : g.type === "PENALTY" ? "Penalty" : "Normal Goal",
      })),
      ...(match.bookings || []).map((b) => ({
        time: { elapsed: b.minute ?? null, extra: null },
        team: team(b.team),
        player: { name: b.player?.name || null },
        assist: { name: null },
        type: "Card",
        detail: b.card === "RED_CARD" ? "Red Card" : "Yellow Card",
      })),
      ...(match.substitutions || []).map((s) => ({
        time: { elapsed: s.minute ?? null, extra: null },
        team: team(s.team),
        player: { name: s.playerIn?.name || null },
        assist: { name: s.playerOut?.name || null },
        type: "subst",
        detail: "Substitution",
      })),
    ].sort((a, b) => (a.time.elapsed ?? 0) - (b.time.elapsed ?? 0)),
    /* the free tier does not expose line-ups; the GET handler fills this from
       TheSportsDB when it can, otherwise the app keeps using manual entry */
    lineups: [] as unknown[],
  };
}

const wrap = (matches: FdMatch[]) => ({ response: matches.map(toFixture) });

/* ---------- TheSportsDB translation: same target shape as toFixture() above ---------- */

type SdbEvent = {
  idEvent: string; strHomeTeam?: string; strAwayTeam?: string; strLeague?: string;
  dateEvent?: string; strTime?: string; strTimestamp?: string; intRound?: string;
  intHomeScore?: string | null; intAwayScore?: string | null;
  strHomeTeamBadge?: string; strAwayTeamBadge?: string;
};
type SdbLineupRow = {
  strPlayer?: string; strTeam?: string; strHome?: string; strPosition?: string; intSquadNumber?: string; idPlayer?: string;
};

const isBarca = (name?: string) => /barcelona|bar[cç]a/i.test(name || "");

const sdbPos = (p?: string) => {
  const s = (p || "").toLowerCase();
  if (s.includes("goalkeep")) return "GK";
  if (s.includes("defen") || s.includes("back")) return "DF";
  if (s.includes("mid")) return "MF";
  return "FW";
};

/* a bare, TBD-style fixture — Champions League opponents/kick-offs are not confirmed
   until the group-stage draw, so anything unknown stays null rather than guessed */
/* The new (2024/25+) Champions League format has exactly 8 league-phase matchdays
   before the knockout rounds start — that much is fixed by UEFA's format regardless
   of season. TheSportsDB's free-tier event objects only expose a bare numeric
   intRound with no textual round name, and its knockout-round numbering isn't
   reliably documented (it appears to reuse codes like 170/180/400 for unrelated
   qualifying rounds in other competitions/seasons), so guessing specific knockout
   round numbers (R16 vs QF vs SF vs Final) risks mislabeling. Instead we rely on the
   one fact we're sure of: intRound > 8 always means knockout stage for this
   competition. The app's double-points rule only needs "knockout stage or not", so
   this is enough — verify against real fixtures once the 2026/27 knockout draw
   happens (~Feb 2027) and refine to real round names if TheSportsDB adds them. */
function sdbRoundLabel(intRound?: string) {
  if (!intRound) return "";
  const n = Number(intRound);
  if (Number.isFinite(n) && n > 0 && n <= 8) return `Matchday ${intRound}`;
  return "Knockout Stage";
}

function sdbEventToFixture(e: SdbEvent) {
  /* This function was written assuming every event has Barcelona on one side (true
     for the /eventsnext.php discovery path, which is scoped to Barcelona's team id).
     But the resource=match&fixture=sdb:<id> lookup path below calls this on ANY event
     id, with no such guarantee — checking both sides explicitly (rather than treating
     "home isn't Barcelona" as proof "away must be") stops a non-Barcelona match (e.g.
     a Fenerbahce vs Lyon fixture used to test the pipeline) from being mislabeled as
     if Barcelona were playing in it. */
  const homeIsBarca = isBarca(e.strHomeTeam);
  const awayIsBarca = isBarca(e.strAwayTeam);
  const date = e.strTimestamp
    ? new Date(Number(e.strTimestamp) * 1000).toISOString()
    : e.dateEvent
      ? `${e.dateEvent}T${(e.strTime || "00:00:00").slice(0, 8)}Z`
      : "";
  return {
    fixture: { id: `sdb:${e.idEvent}`, date, status: { short: "NS", elapsed: null } },
    league: { id: 2, name: "Champions League", round: sdbRoundLabel(e.intRound) },
    teams: {
      home: { id: homeIsBarca ? APP_BARCELONA : undefined, name: homeIsBarca ? "Barcelona" : e.strHomeTeam, logo: e.strHomeTeamBadge || null },
      away: { id: awayIsBarca ? APP_BARCELONA : undefined, name: awayIsBarca ? "Barcelona" : e.strAwayTeam, logo: e.strAwayTeamBadge || null },
    },
    goals: {
      home: e.intHomeScore != null ? Number(e.intHomeScore) : null,
      away: e.intAwayScore != null ? Number(e.intAwayScore) : null,
    },
    events: [] as unknown[],
    /* the app keys a lineup entry to team.id === 529 for "Barcelona" and anything
       else for the opponent (see normalizeLineups in BarcaManyak.jsx) */
    lineups: [] as unknown[],
  };
}

function sdbLineupsToApiShape(rows: SdbLineupRow[]) {
  if (!rows.length) return [] as unknown[];
  const side = (barca: boolean) => rows
    .filter((r) => isBarca(r.strTeam) === barca)
    .map((r) => ({
      player: {
        id: r.idPlayer ? Number(r.idPlayer) : undefined,
        name: r.strPlayer || null,
        number: r.intSquadNumber ? Number(r.intSquadNumber) : undefined,
        pos: sdbPos(r.strPosition),
        grid: null,
      },
    }));
  const barca = side(true);
  const opponent = side(false);
  const out: unknown[] = [];
  if (barca.length) out.push({ team: { id: APP_BARCELONA }, formation: "", startXI: barca });
  if (opponent.length) out.push({ team: { id: 0 }, formation: "", startXI: opponent });
  return out;
}

/* Champions League fixtures are not on football-data's free plan at all, so this is
   the only source for them. Best effort: an empty or unreachable TheSportsDB just
   means no Champions League rows get added, never an error surfaced to the app. */
async function sdbChampionsLeagueFixtures() {
  try {
    const data = await sportsDb("/eventsnext.php", { id: SDB_TEAM_ID });
    const events = ((data?.events as SdbEvent[]) || []).filter((e) => /champions league/i.test(e.strLeague || ""));
    return events.map(sdbEventToFixture);
  } catch {
    return [];
  }
}

/* football-data's match payload never carries line-ups (free tier). Look up the
   fixture by kick-off date on TheSportsDB and, if found, pull its line-up — used only
   to fill the gap left by the primary provider. */
async function sdbLineupsForFixture(date: string, opponentGuess: string) {
  try {
    const day = date.slice(0, 10);
    if (!day) return [];
    const data = await sportsDb("/eventsday.php", { d: day, s: "Soccer" });
    const events = (data?.events as SdbEvent[]) || [];
    const match = events.find((e) => isBarca(e.strHomeTeam) || isBarca(e.strAwayTeam))
      || events.find((e) => [e.strHomeTeam, e.strAwayTeam].some((n) => n && opponentGuess && n.toLowerCase().includes(opponentGuess.toLowerCase())));
    if (!match) return [];
    const lineupData = await sportsDb("/lookuplineup.php", { id: match.idEvent });
    return sdbLineupsToApiShape((lineupData?.lineup as SdbLineupRow[]) || []);
  } catch {
    return [];
  }
}

function jsonWithMeta(payload: unknown, cached: boolean, updatedAt: number, requests: number) {
  return Response.json({
    payload,
    meta: {
      cached, updatedAt, requests,
      dailyLimit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - requests),
      provider: "football-data.org",
    },
  });
}

export async function GET(request: Request) {
  await ensureTables();
  const url = new URL(request.url);
  const resource = url.searchParams.get("resource");
  const fixture = url.searchParams.get("fixture");

  let cacheKey: string;
  let ttlMs: number;
  let load: () => Promise<{ response: unknown[] }>;

  if (resource === "fixtures") {
    cacheKey = `fd:fixtures:${SEASON}`;
    ttlMs = 12 * 60 * 60 * 1000;
    load = async () => {
      const data = await footballData(`/teams/${FD_BARCELONA}/matches`, { season: SEASON });
      const primary = wrap((data.matches as FdMatch[]) || []);
      /* Champions League is not on football-data's free plan — TheSportsDB fills that
         gap only; a quiet or unreachable lookup here changes nothing about the rest. */
      const cl = await sdbChampionsLeagueFixtures();
      return { response: [...primary.response, ...cl] };
    };
  } else if (resource === "next") {
    cacheKey = "fd:next";
    ttlMs = 6 * 60 * 60 * 1000;
    load = async () => {
      const data = await footballData(`/teams/${FD_BARCELONA}/matches`, { status: "SCHEDULED", limit: 1 });
      return wrap(((data.matches as FdMatch[]) || []).slice(0, 1));
    };
  } else if (resource === "match" && /^\d+$/.test(fixture || "")) {
    cacheKey = `fd:match:${fixture}`;
    ttlMs = 110 * 1000;
    load = async () => {
      const data = await footballData(`/matches/${fixture}`);
      const fx = toFixture(data as unknown as FdMatch);
      /* football-data's free tier never returns line-ups; TheSportsDB is tried only
         because this one came back empty */
      if (!fx.lineups.length) {
        const opponentGuess = isBarca(fx.teams.home.name) ? (fx.teams.away.name || "") : (fx.teams.home.name || "");
        fx.lineups = await sdbLineupsForFixture(fx.fixture.date, opponentGuess);
      }
      return { response: [fx] };
    };
  } else if (resource === "match" && /^sdb:\d+$/.test(fixture || "")) {
    const idEvent = (fixture || "").slice(4);
    cacheKey = `sdb:match:${idEvent}`;
    ttlMs = 110 * 1000;
    load = async () => {
      const data = await sportsDb("/lookupevent.php", { id: idEvent });
      const e = ((data?.events as SdbEvent[]) || [])[0];
      if (!e) throw new Error("Match not found on TheSportsDB");
      const fx = sdbEventToFixture(e);
      const lineupData = await sportsDb("/lookuplineup.php", { id: idEvent }).catch(() => null);
      fx.lineups = sdbLineupsToApiShape((lineupData?.lineup as SdbLineupRow[]) || []);
      return { response: [fx] };
    };
  } else if (resource === "squad") {
    /* kept so older clients do not error; squad identities are local assets */
    return jsonWithMeta({ response: [] }, true, Date.now(), await quotaCount());
  } else {
    return Response.json({ error: "Unsupported football resource" }, { status: 400 });
  }

  const cached = await cacheGet(cacheKey);
  const used = await quotaCount();
  if (cached && cached.expiresAt > Date.now()) {
    return jsonWithMeta(JSON.parse(cached.payload), true, cached.updatedAt, used);
  }

  const ownsLock = await acquireLock(cacheKey);
  if (!ownsLock) {
    for (let attempt = 0; attempt < 12; attempt++) {
      await wait(500);
      const filled = await cacheGet(cacheKey);
      if (filled && filled.expiresAt > Date.now()) {
        return jsonWithMeta(JSON.parse(filled.payload), true, filled.updatedAt, await quotaCount());
      }
    }
    if (cached) return jsonWithMeta(JSON.parse(cached.payload), true, cached.updatedAt, await quotaCount());
    return Response.json({ error: "Football data is updating. Try again shortly." }, { status: 503 });
  }

  try {
    const payload = await load();
    if (resource === "match") {
      const code = (payload.response?.[0] as { fixture?: { status?: { short?: string } } })?.fixture?.status?.short;
      if (["FT", "AET", "PEN", "AWD"].includes(code || "")) ttlMs = 7 * 24 * 60 * 60 * 1000;
      else if (["NS", "TBD", "PST", "CANC"].includes(code || "")) ttlMs = 5 * 60 * 1000;
    }
    await cachePut(cacheKey, payload, ttlMs);
    return jsonWithMeta(payload, false, Date.now(), used + 1);
  } catch (error) {
    // stale beats nothing: a live match should not blank out over one bad call
    if (cached) return jsonWithMeta(JSON.parse(cached.payload), true, cached.updatedAt, used);
    const message = error instanceof Error ? error.message : "Football data unavailable";
    return Response.json({ error: message, meta: { requests: used, dailyLimit: DAILY_LIMIT } }, { status: 503 });
  } finally {
    await releaseLock(cacheKey);
  }
}
