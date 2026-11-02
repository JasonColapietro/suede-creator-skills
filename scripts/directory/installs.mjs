#!/usr/bin/env node
// Snapshots install counts published by skills.sh for the skills the directory
// lists, into directory/installs.json. The directory never measures installs
// itself: skills.sh counts installs made with the skills CLI (npx skills add)
// from anonymous, deduplicated telemetry, as its documentation describes, and
// publishes them per skill. This script reads two public surfaces:
//
//   https://www.skills.sh/api/search?q=<owner/repo>&limit=200   one query per
//     listed repository; results whose source matches the repository are kept
//   https://skills.sh/                                           the all-time
//     leaderboard embedded in the page, for the eight-week install history of
//     the skills on it
//
// Usage:
//   node scripts/directory/installs.mjs            # rewrite directory/installs.json
//   node scripts/directory/installs.mjs --check    # exit 1 if the file is missing or malformed
//
// The snapshot records the fetch date and the source so every page that quotes
// a count can say where it came from. Run it before a directory build when a
// fresh leaderboard is wanted; the build reads the committed file only.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(repoRoot, "directory", "installs.json");
const SEARCH = "https://www.skills.sh/api/search";
const HOME = "https://skills.sh/";
const SOURCE = {
  name: "skills.sh",
  url: "https://skills.sh/",
  about: "https://skills.sh/about",
  method: "Install counts published by skills.sh for installs made with the skills CLI (npx skills add), from anonymous, deduplicated telemetry as skills.sh documents it. Read from its public search endpoint and the leaderboard on its home page.",
};

export function validateInstalls(doc) {
  if (!doc || typeof doc !== "object") throw new Error("installs.json: not an object");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.fetched || "")) throw new Error("installs.json: fetched must be YYYY-MM-DD");
  if (!doc.source || doc.source.name !== SOURCE.name || doc.source.url !== SOURCE.url) throw new Error("installs.json: source must name skills.sh");
  if (!Number.isInteger(doc.all_time_total) || doc.all_time_total <= 0) throw new Error("installs.json: all_time_total");
  if (!doc.skills || typeof doc.skills !== "object" || Array.isArray(doc.skills)) throw new Error("installs.json: skills map");
  for (const [key, v] of Object.entries(doc.skills)) {
    if (!/^[a-z0-9_.-]+\/[a-z0-9_.-]+\/[a-z0-9_.-]+$/.test(key)) throw new Error(`installs.json: bad key ${key}`);
    if (!Number.isInteger(v.installs) || v.installs < 0) throw new Error(`installs.json: ${key} installs`);
    if (v.weekly !== undefined && (!Array.isArray(v.weekly) || v.weekly.some((n) => !Number.isInteger(n) || n < 0))) throw new Error(`installs.json: ${key} weekly`);
  }
  return doc;
}

const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// skills.sh rate-limits bursts (HTTP 429): space the queries and back off.
async function getJson(url, attempt = 0) {
  const r = await fetch(url, { headers: { accept: "application/json" } });
  if (r.status === 429 && attempt < 6) {
    await sleep(1500 * 2 ** attempt);
    return getJson(url, attempt + 1);
  }
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}

// The home page embeds its leaderboard inside script strings, with quotes
// escaped. A regular expression over the raw page is enough: each entry has
// the same five fields in the same order.
function parseHome(html) {
  const rows = new Map();
  const re = /\\"source\\":\\"([^"\\]+)\\",\\"skillId\\":\\"([^"\\]+)\\",\\"name\\":\\"([^"\\]+)\\",\\"installs\\":(\d+),\\"weeklyInstalls\\":\[([\d,]*)\]/g;
  let m;
  while ((m = re.exec(html))) {
    rows.set(`${m[1]}/${m[2]}`.toLowerCase(), { installs: Number(m[4]), weekly: m[5] ? m[5].split(",").map(Number) : [] });
  }
  const total = html.match(/\\"allTimeTotal\\":(\d+)/);
  const count = html.match(/\\"totalSkills\\":(\d+)/);
  return { rows, total: total ? Number(total[1]) : null, count: count ? Number(count[1]) : null };
}

async function main() {
  if (process.argv.includes("--check")) {
    if (!fs.existsSync(OUT)) { console.error("directory/installs.json is missing"); process.exit(1); }
    validateInstalls(JSON.parse(fs.readFileSync(OUT, "utf8")));
    console.log("directory/installs.json is well formed");
    return;
  }
  const data = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "skills.json"), "utf8"));
  const repos = [...new Set(data.skills.map((s) => s.repo))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const skills = {};
  let matched = 0;
  for (const repo of repos) {
    const url = `${SEARCH}?q=${encodeURIComponent(repo)}&limit=200`;
    let body;
    await sleep(400);
    try { body = await getJson(url); } catch (e) { console.error(`skip ${repo}: ${e.message}`); continue; }
    for (const s of body.skills || []) {
      if (String(s.source).toLowerCase() !== repo.toLowerCase() || !Number.isInteger(s.installs)) continue;
      const key = `${repo}/${s.skillId}`.toLowerCase();
      skills[key] = { installs: s.installs };
      matched++;
    }
  }
  const home = parseHome(await (await fetch(HOME)).text());
  for (const [key, row] of home.rows) {
    if (skills[key]) skills[key].weekly = row.weekly;
  }
  const doc = {
    source: SOURCE,
    fetched: today(),
    all_time_total: home.total,
    leaderboard_skills: home.count,
    listed_matches: matched,
    skills: Object.fromEntries(Object.entries(skills).sort(([a], [b]) => a.localeCompare(b))),
  };
  validateInstalls(doc);
  fs.writeFileSync(OUT, `${JSON.stringify(doc, null, 1)}\n`);
  console.log(`Wrote directory/installs.json: ${matched} listed skills matched across ${repos.length} repositories; skills.sh all-time total ${home.total}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
