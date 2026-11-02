// The rebuilt SuedeAI.directory: the leaderboard and its skills.sh install
// snapshot, the kinds beyond skills, the trust page, the stacks, the compare,
// API and publishers pages, the shared navigation state and the stylesheet
// contract. Reads the committed output in docs/directory/. Joined to
// `npm run test:directory` through an import in tests/test_directory_seo.mjs,
// since package.json is pinned by the first-party intake receipt.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateInstalls } from "../scripts/directory/installs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(root, "docs");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const page = (rel) => read(`docs/${rel}index.html`);
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&middot;/g, "·").replace(/&amp;/g, "&");
const mainOf = (html) => (html.match(/<main\b[\s\S]*<\/main>/) || [""])[0];
const jsonld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const data = JSON.parse(read("directory/skills.json"));
const installs = JSON.parse(read("directory/installs.json"));
const kinds = JSON.parse(read("directory/kinds.json"));
const FIRST_PARTY = "jasoncolapietro/suede-creator-skills";
const BANNED = /—|\bdelve|game-changer|\bunlock|\belevate|\bseamless|\blandscape\b|\btapestry\b|\bmoreover\b|it's important to note|telegram/i;
const ownCopy = (html) => decode(mainOf(html).replace(/<(pre|code)\b[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ").replace(/[\w.-]+\/[\w.-]+/g, " "));

// --------------------------------------------------------------- installs

test("the install snapshot is well formed, dated and attributed to skills.sh", () => {
  validateInstalls(installs);
  assert.equal(installs.source.name, "skills.sh");
  assert.match(installs.source.method, /skills CLI/);
  // The snapshot keeps every skill skills.sh reports for a listed repository,
  // including skills the directory withholds; the build publishes listed ones.
  const listed = new Set(data.skills.map((s) => `${s.repo}/${s.name}`.toLowerCase()));
  const repos = new Set(data.skills.map((s) => s.repo.toLowerCase()));
  const keys = Object.keys(installs.skills);
  assert.ok(keys.filter((k) => listed.has(k)).length > 1000, "the snapshot covers the listed skills");
  for (const key of keys) assert.ok(repos.has(key.split("/").slice(0, 2).join("/")), `installs.json names a repository the directory does not list: ${key}`);
  const published = JSON.parse(read("docs/directory/installs.json"));
  assert.equal(published.fetched, installs.fetched);
  assert.equal(published.source.url, installs.source.url);
  for (const [key, n] of Object.entries(published.skills)) assert.equal(n, installs.skills[key].installs, key);
});

test("the hub leads with a tabbed leaderboard whose rows are in order and never rank a Suede AI skill", () => {
  const html = page("directory/");
  const main = mainOf(html);
  assert.ok(main.indexOf('class="board-section"') < main.indexOf('data-directory-browser'), "the leaderboard precedes the search");
  const tabs = [...main.matchAll(/<a class="tab" href="#([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(tabs.slice(0, 2), ["most-installed", "highest-scores"]);
  for (const id of tabs) assert.ok(main.includes(`<section class="board-pane" id="${id}"`), `pane ${id}`);
  const pane = main.split('id="most-installed"')[1].split("</section>")[0];
  const rows = [...pane.matchAll(/<a class="board-row" href="([^"]+)"[^>]*><span class="rank">(\d+)<\/span><span class="who"><b>([^<]+)<\/b><span>([^<]+)<\/span><\/span><span class="metric">([\s\S]*?)<\/span><span class="grade/g)];
  assert.equal(rows.length, 10, "ten rows on the hub pane");
  rows.forEach((r, i) => assert.equal(Number(r[2]), i + 1));
  const counts = rows.map((r) => (r[5].match(/<b>([\d.]+[KM]?)<\/b> installs/) || [])[1]);
  assert.ok(counts.every(Boolean), "every row quotes an install count");
  const raw = rows.map((r) => installs.skills[`${decode(r[4])}/${decode(r[3])}`.toLowerCase()]?.installs);
  for (let i = 1; i < raw.length; i++) assert.ok(raw[i] <= raw[i - 1], `row ${i + 1} out of install order`);
  assert.doesNotMatch(pane, new RegExp(FIRST_PARTY, "i"));
  assert.match(main, /Installs recorded by skills\.sh/);
  assert.match(html, /name="sort"[^>]*>[\s\S]*?<option value="installs">Most installed<\/option>/);
});

test("the search index carries an installs field that matches the snapshot", () => {
  const index = JSON.parse(read("docs/directory/search-index.json"));
  let matched = 0;
  for (const entry of index) {
    const key = `${entry.repo}/${entry.slug || entry.name}`.toLowerCase();
    const expected = installs.skills[key]?.installs ?? null;
    assert.equal(entry.installs, expected, key);
    if (expected !== null) matched++;
  }
  assert.ok(matched > 1000);
});

test("top/ carries the most installed board in install order beside the score table", () => {
  const html = page("directory/top/");
  const main = mainOf(html);
  const pane = main.split('id="most-installed"')[1].split("</section>")[0];
  const rows = [...pane.matchAll(/<span class="who"><b>([^<]+)<\/b><span>([^<]+)<\/span>/g)].map((m) => `${decode(m[2])}/${decode(m[1])}`.toLowerCase());
  assert.equal(rows.length, 100);
  const raw = rows.map((k) => installs.skills[k]?.installs);
  assert.ok(raw.every((n) => Number.isInteger(n)), "every board row has a snapshot count");
  for (let i = 1; i < raw.length; i++) assert.ok(raw[i] <= raw[i - 1]);
  assert.match(pane, /read on [A-Z][a-z]+ \d+, \d{4}/, "the pane dates the snapshot");
  assert.match(main, /The directory measures no installs of its own/);
});

// ------------------------------------------------------------------ kinds

test("every kind renders a hub with each entry, its install command and no grade", () => {
  for (const k of kinds.kinds) {
    const rel = `directory/${k.path}/`;
    const html = page(rel);
    const main = mainOf(html);
    const entries = k.sections.flatMap((s) => s.entries);
    for (const e of entries) {
      assert.ok(main.includes(`id="${e.id}"`), `${rel}: entry ${e.id}`);
      assert.ok(main.includes(`href="${e.url}"`), `${rel}: entry ${e.id} url`);
      if (e.install) assert.ok(main.includes(`<code>${decode(e.install).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`) || main.includes(`<code>${e.install}</code>`), `${rel}: ${e.id} install`);
    }
    assert.doesNotMatch(main, /class="grade|score\.svg|badge\.svg/, `${rel}: a kind entry must not carry a grade`);
    assert.match(main, /Listed, not graded/);
    const collection = jsonld(html).find((n) => n["@type"] === "CollectionPage");
    assert.equal(collection.mainEntity.numberOfItems, entries.length, rel);
    assert.deepEqual(collection.mainEntity.itemListElement.map((i) => i.url), entries.map((e) => e.url), rel);
    const faq = jsonld(html).find((n) => n["@type"] === "FAQPage");
    assert.ok(faq && faq.mainEntity.length >= 3, `${rel}: FAQ`);
    assert.doesNotMatch(ownCopy(html), BANNED, `${rel}: banned wording`);
    assert.ok(mainOf(page("directory/")).includes(`href="${k.path}/"`), `hub links ${k.path}`);
  }
  const published = JSON.parse(read("docs/directory/kinds.json"));
  assert.deepEqual(published.kinds.map((k) => k.path), kinds.kinds.map((k) => `/${k.path}/`));
});

test("no kind entry repository is listed twice within a kind, and official entries are marked", () => {
  for (const k of kinds.kinds) {
    const entries = k.sections.flatMap((s) => s.entries);
    const ids = entries.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, `${k.id}: duplicate entry id`);
    const main = mainOf(page(`directory/${k.path}/`));
    for (const e of entries.filter((x) => x.official)) {
      const card = main.split(`id="${e.id}"`)[1].split("</article>")[0];
      assert.match(card, /Official publisher/, `${k.id}/${e.id}`);
    }
  }
});

// ------------------------------------------------------------------ trust

test("the trust page states what is and is not checked, cites its three incidents and never claims a scan", () => {
  const html = page("directory/trust/");
  const main = mainOf(html);
  for (const text of ["No listed skill is security scanned by the directory", "No malware scan", "No runtime test", "Nothing runs", "Found a problem?"]) assert.ok(main.includes(text), text);
  for (const url of ["https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub", "https://koi.ai/blog/clawhavoc-341-malicious-clawedbot-skills-found-by-the-bot-they-were-targeting", "https://www.catonetworks.com/blog/cato-ctrl-weaponizing-claude-skills-with-medusalocker"]) assert.ok(main.includes(`href="${url}"`), url);
  assert.doesNotMatch(main, /security certified|security-scan-passed|scanned and safe/i);
  const full = data.skills.filter((s) => s.featured).length;
  assert.ok(main.includes(`<b>${full.toLocaleString("en-US")}</b>`), "full-page count");
  assert.doesNotMatch(ownCopy(html), BANNED);
  const faq = jsonld(html).find((n) => n["@type"] === "FAQPage");
  assert.ok(faq && faq.mainEntity.length >= 4);
  assert.ok(fs.existsSync(path.join(docs, "directory", "security", "index.html")), "the Security category keeps its own page");
  assert.match(page("directory/security/"), /<h2 id="all-title">All /, "the Security category page is a category page");
});

test("full skill pages carry a glance panel that repeats the install record and links skills.sh audits only when tracked", () => {
  let tracked = 0;
  let untracked = 0;
  for (const s of data.skills.filter((x) => x.featured).slice(0, 400)) {
    const [owner, name] = s.repo.split("/");
    const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "skill";
    const rel = `directory/${slug(owner)}/${slug(name)}/${s.slug}/`;
    const main = mainOf(page(rel));
    const glance = (main.match(/<dl class="glance"[\s\S]*?<\/dl>/) || [])[0];
    assert.ok(glance, `${rel}: glance panel`);
    assert.match(glance, /<dt>Security scan<\/dt><dd>Not scanned by the directory/, rel);
    assert.match(main, /class="score-card grade-[a-d]"/, rel);
    const key = `${s.repo}/${s.name}`.toLowerCase();
    if (installs.skills[key]) { tracked++; assert.ok(glance.includes(`https://skills.sh/${s.repo}/${s.name}`), `${rel}: skills.sh link`); }
    else { untracked++; assert.ok(!glance.includes("skills.sh/"), `${rel}: no skills.sh link for an untracked skill`); }
  }
  assert.ok(tracked > 0 && untracked >= 0);
});

// ----------------------------------------------------- compare, api, publishers

test("the compare, API and publishers pages exist, are indexable and are linked from the hub", () => {
  const hub = mainOf(page("directory/"));
  for (const rel of ["compare/", "api/", "publishers/", "trust/"]) {
    const html = page(`directory/${rel}`);
    assert.doesNotMatch(html, /noindex/);
    assert.ok(hub.includes(`href="${rel}"`), `hub links ${rel}`);
  }
  const compare = page("directory/compare/");
  assert.match(compare, /<form class="panel compare-form" data-compare data-directory="[^"]*" hidden>/);
  assert.match(compare, /<datalist id="compare-skills">/);
  const api = mainOf(page("directory/api/"));
  for (const file of ["search-index.json", "report.json", "score.svg", "installs.json", "kinds.json", "feed.xml", "llms.txt", "sitemap.xml"]) assert.ok(api.includes(file), `api lists ${file}`);
  const publishers = page("directory/publishers/");
  const rows = (mainOf(publishers).match(/<tr data-name="/g) || []).length;
  const repos = new Set(data.skills.map((s) => s.repo));
  assert.equal(rows, repos.size, "one row per repository");
  const collection = jsonld(publishers).find((n) => n["@type"] === "CollectionPage");
  assert.equal(collection.mainEntity.numberOfItems, repos.size);
});

// ------------------------------------------------------- navigation, assets

test("the shared navigation marks the current section and keeps Featured Skills, Stacks and Security reachable", () => {
  for (const [rel, current] of [["directory/", "Skills"], ["directory/top/", "Top 100"], ["directory/topics/seo/", "Topics"], ["directory/trust/", "Security"], ["directory/featured/", "Featured Skills"], ["directory/anthropics/skills/pdf/", "Skills"]]) {
    const html = page(rel);
    const nav = html.match(/<header class="nav">([\s\S]*?)<\/header>/)[1];
    const marked = [...nav.matchAll(/<a href="[^"]*" aria-current="page">([^<]*)<\/a>/g)].map((m) => m[1]);
    assert.deepEqual(marked, [current], rel);
    assert.match(nav, /<a href="[^"]*"(?: aria-current="page")?>Featured Skills<\/a>/, rel);
    assert.match(nav, /<details class="nav-disclosure" open>/, rel);
    assert.doesNotMatch(html, /assets\/site\.css|assets\/skill\.css|fonts\/fraunces|fonts\/plex/, `${rel}: the directory loads only its own stylesheet`);
    assert.match(html, /assets\/directory\.css/, rel);
  }
});

test("the directory stylesheet is self-contained: tokens, both themes, fonts and the legacy names other sheets read", () => {
  const css = read("docs/assets/directory.css");
  for (const token of ["--canvas", "--paper", "--ink", "--muted", "--accent", "--gold-fill", "--grade-a", "--grade-b", "--grade-c", "--grade-d", "--cream", "--gold", "--cool", "--surface", "--border"]) assert.ok(css.includes(`${token}:`), token);
  assert.match(css, /color-scheme: dark/);
  assert.match(css, /font-family: "Geist";/);
  assert.match(css, /font-family: "Geist Mono";/);
  assert.match(css, /font-family: "Pixelify Sans";/);
  assert.doesNotMatch(css, /JetBrains/);
  for (const f of ["geist-var-latin.woff2", "geist-var-italic-latin.woff2", "geist-mono-var-latin.woff2", "pixelify-sans-var-latin.woff2"]) assert.ok(fs.existsSync(path.join(docs, "assets", "fonts", f)), f);
  for (const f of ["geist-OFL.txt", "pixelify-sans-OFL.txt"]) assert.ok(fs.existsSync(path.join(root, "licenses", f)), f);
  assert.match(css, /\.nav-disclosure > summary\.nav-hamburger \{[^}]*width: 44px; height: 44px;/, "the 44px hamburger floor");
  assert.doesNotMatch(read("docs/assets/agents.css"), /Fraunces|#c8a96e|#080808/, "agents.css uses the shared tokens");
});
