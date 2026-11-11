// Browse pages for SuedeAI.directory: topic pages (/topics/), cost lanes
// (/pricing/), capability flags (/features/), new listings (/new/), the top
// 100 (/top/), the save list (/saved/), the RSS feed (/feed.xml) and the new
// rows, buttons and sections on skill, category and hub pages. Unit tests
// cover scripts/directory/topics.mjs, facets.mjs and listed-since.mjs; page
// tests read the committed output in docs/directory/ and derive every
// expectation from directory/skills.json the way scripts/build-directory.mjs
// does. Joined to `npm run test:directory` through an import in
// tests/test_directory_seo.mjs, since package.json is pinned by the
// first-party intake receipt.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadTopicConfig, topicMatch, planTopics, topicsBySkill, similarByTopic, TOPIC_GATE } from "../scripts/directory/topics.mjs";
import { LANES, FLAGS, costLane, needsService, skillFlags, planFacets } from "../scripts/directory/facets.mjs";
import { loadListedSince, applyListedSince, serializeLedger, isNewListing, isRecentlyUpdated, daysBetween, NEW_DAYS } from "../scripts/directory/listed-since.mjs";
import { isFirstParty } from "../scripts/directory/task-pages.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(repoRoot, "docs");
const BASE = "https://skills.suedeai.ai";
const NEW = "https://suedeai.directory";
const FIRST_PARTY = "jasoncolapietro/suede-creator-skills";

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&middot;/g, "·").replace(/&amp;/g, "&");
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "skill";
const fmt = (n) => n.toLocaleString("en-US");
const longDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

// ------------------------------------------------------------ unit fixtures

function tmpJson(name, value) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "suede-browse-"));
  const file = path.join(dir, name);
  fs.writeFileSync(file, typeof value === "string" ? value : JSON.stringify(value));
  return file;
}
const CATS = new Set(["marketing-seo", "writing-content", "developer-tools"]);
const group = { id: "marketing", name: "Marketing", intro: "Skills for search and content." };
const topicCfg = (topics, groups = [group]) => ({ groups, topics });
const loadTopics = (topics, groups) => loadTopicConfig(tmpJson("topics.json", topicCfg(topics, groups)), CATS);

// A small expanded record, shaped like the build's.
function rec(over) {
  const repo = over.repo || "acme/skills";
  const [owner, name] = repo.split("/");
  const repoSlug = `${slugify(owner)}/${slugify(name)}`;
  const slug = over.slug || over.name;
  return {
    repo, slug, name: over.name, display_name: null, dir: `skills/${slug}`, category: "marketing-seo", summary: "", description: "",
    featured: false, score: 70, license: "MIT", open_license: true, compatibility: null, install: null,
    official: false, shielded: false, has_scripts: false, has_references: false, has_assets: false, file_count: 2, allowed_tools: null,
    id: `${repoSlug}/${slug}`, owner, repo_slug: repoSlug, ...over,
  };
}
const emptyInstall = { langs: {}, env_read: [], env_docs: [], net: false, hosts: [], mcp: false, mcp_tools: [], runs: [] };

// ------------------------------------------------------------ topics.mjs

test("loadTopicConfig accepts a valid config and compiles its patterns", () => {
  const cfg = loadTopics([{ id: "seo", name: "SEO", group: "marketing", name_re: "\\bseo\\b", text_re: "search rankings?", categories: ["marketing-seo"], exclude: ["Acme/Skills/seo-lite"] }]);
  const t = cfg.topics[0];
  assert.ok(t.nameRe.test("SEO audit"), "name pattern is case-insensitive");
  assert.ok(t.textRe.test("Improves search rankings."));
  assert.equal(t.pathRe, null);
  assert.equal(t.noun, "SEO", "noun defaults to the name");
  assert.ok(t.excludeSet.has("acme/skills/seo-lite"), "exclusions are lowercased");
  assert.deepEqual(t.futurepedia, []);
});

test("loadTopicConfig rejects a duplicate topic id", () => {
  assert.throws(() => loadTopics([
    { id: "seo", name: "SEO", group: "marketing", name_re: "seo" },
    { id: "seo", name: "Search", group: "marketing", name_re: "search" },
  ]), /invalid or duplicate topic id seo/);
});

test("loadTopicConfig rejects a text_re without a category allowlist", () => {
  assert.throws(() => loadTopics([{ id: "seo", name: "SEO", group: "marketing", text_re: "seo" }]), /text matches need a category allowlist/);
  assert.throws(() => loadTopics([{ id: "seo", name: "SEO", group: "marketing", text_re: "seo", categories: [] }]), /text matches need a category allowlist/);
});

test("loadTopicConfig rejects an em dash in topic or group copy", () => {
  assert.throws(() => loadTopics([{ id: "seo", name: "SEO \u2014 search", group: "marketing", name_re: "seo" }]), /seo contains an em dash/);
  assert.throws(() => loadTopics([{ id: "seo", name: "SEO", group: "marketing", name_re: "seo", intro: "Rank \u2014 then convert." }]), /em dash/);
  assert.throws(() => loadTopics([{ id: "seo", name: "SEO", group: "marketing", name_re: "seo" }], [{ ...group, intro: "Search \u2014 content." }]), /group marketing contains an em dash/);
});

test("loadTopicConfig rejects other malformed entries", () => {
  assert.throws(() => loadTopics([{ id: "seo", name: "SEO", group: "nope", name_re: "seo" }]), /unknown group nope/);
  assert.throws(() => loadTopics([{ id: "seo", name: "SEO", group: "marketing" }]), /needs name_re, path_re or text_re/);
  assert.throws(() => loadTopics([{ id: "seo", name: "SEO", group: "marketing", text_re: "seo", categories: ["not-a-category"] }]), /unknown category not-a-category/);
  assert.throws(() => loadTopics([{ id: "Bad_Id", name: "SEO", group: "marketing", name_re: "seo" }]), /invalid or duplicate topic id/);
  assert.throws(() => loadTopics([
    { id: "seo", name: "SEO", group: "marketing", name_re: "seo" },
    { id: "seo-2", name: "seo", group: "marketing", name_re: "seo" },
  ]), /duplicate topic name/);
  assert.throws(() => loadTopics([{ id: "seo", name: "SEO", group: "marketing", text_re: "seo", categories: ["marketing-seo"], scope: "body" }]), /scope must be summary or description/);
});

test("topicMatch prefers name, then path, then text", () => {
  const [t] = loadTopics([{ id: "seo", name: "SEO", group: "marketing", name_re: "\\bseo\\b", path_re: "\\bseo\\b", text_re: "search rankings?", categories: ["marketing-seo"] }]).topics;
  // Hyphens in the name read as spaces, so "seo-audit" matches \bseo\b.
  assert.equal(topicMatch(t, rec({ name: "seo-audit" })), "name");
  assert.equal(topicMatch(t, rec({ name: "audit", display_name: "SEO Audit" })), "name", "display name counts as the name");
  assert.equal(topicMatch(t, rec({ name: "audit", dir: "skills/seo_tools/audit" })), "path");
  assert.equal(topicMatch(t, rec({ name: "audit", dir: "." })), null, "a root skill has no folder path to match");
  assert.equal(topicMatch(t, rec({ name: "audit", summary: "Lifts search rankings for a site." })), "text");
  assert.equal(topicMatch(t, rec({ name: "audit", summary: "Lifts search rankings.", category: "developer-tools" })), null, "text matches respect the category allowlist");
  assert.equal(topicMatch(t, rec({ name: "audit", summary: "Formats code." })), null);
});

test("topicMatch reads the first sentence without a summary, and the whole description with scope description", () => {
  const [summaryScope, descScope] = loadTopics([
    { id: "seo", name: "SEO", group: "marketing", text_re: "search rankings", categories: ["marketing-seo"] },
    { id: "seo-desc", name: "SEO Deep", group: "marketing", text_re: "search rankings", categories: ["marketing-seo"], scope: "description" },
  ]).topics;
  const late = rec({ name: "writer", description: "Writes blog posts. Also tunes search rankings." });
  assert.equal(topicMatch(summaryScope, late), null, "only the first sentence counts by default");
  assert.equal(topicMatch(descScope, late), "text");
  const early = rec({ name: "writer", description: "Tunes search rankings. Writes blog posts." });
  assert.equal(topicMatch(summaryScope, early), "text");
  const withSummary = rec({ name: "writer", summary: "Writes blog posts.", description: "Tunes search rankings." });
  assert.equal(topicMatch(summaryScope, withSummary), null, "the editorial summary replaces the description");
});

test("topicMatch honours exclusions and nameCategories", () => {
  const [t, narrow] = loadTopics([
    { id: "seo", name: "SEO", group: "marketing", name_re: "\\bseo\\b", exclude: ["Acme/Skills/seo-lite"] },
    { id: "review", name: "Review", group: "marketing", name_re: "review", nameCategories: ["developer-tools"] },
  ]).topics;
  assert.equal(topicMatch(t, rec({ name: "seo-lite" })), null, "excluded owner/repo/slug, matched case-insensitively");
  assert.equal(topicMatch(t, rec({ name: "seo-lite", repo: "other/skills" })), "name", "the exclusion names one repository");
  assert.equal(topicMatch(narrow, rec({ name: "code-review", category: "developer-tools" })), "name");
  assert.equal(topicMatch(narrow, rec({ name: "code-review", category: "marketing-seo" })), null);
});

test("planTopics publishes a topic at three matches and orders rows like a category table", () => {
  assert.deepEqual(TOPIC_GATE, { minListed: 3 });
  const cfg = loadTopics([
    { id: "seo", name: "SEO", group: "marketing", name_re: "\\bseo\\b" },
    { id: "email", name: "Email", group: "marketing", name_re: "\\bemail\\b" },
  ]);
  const skills = [
    rec({ name: "seo-zeta" }),
    rec({ name: "seo-alpha" }),
    rec({ name: "seo-mid", featured: true, score: 90 }),
    rec({ name: "email-one" }),
    rec({ name: "email-two", featured: true, score: 85 }),
    rec({ name: "unrelated" }),
  ];
  const plan = planTopics(cfg, skills);
  const [seo, email] = plan.topics;
  assert.equal(seo.published, true);
  assert.equal(email.published, false, "two matches stay below the gate");
  assert.deepEqual(seo.rows.map((s) => s.name), ["seo-mid", "seo-alpha", "seo-zeta"], "full pages first, then by name");
  assert.deepEqual(seo.strong.map((s) => s.name), ["seo-mid"]);
  assert.equal(seo.reasons.get(seo.rows[0].id), "name");
  assert.deepEqual(seo.categories, ["marketing-seo"]);
  assert.equal(plan.groups.length, 1);
  assert.deepEqual(plan.groups[0].topics.map((t) => t.topic.id), ["seo", "email"]);
});

test("topicsBySkill lists published topics only, in config order", () => {
  const cfg = loadTopics([
    { id: "seo", name: "SEO", group: "marketing", name_re: "\\bseo\\b" },
    { id: "audit", name: "Audit", group: "marketing", name_re: "\\baudit\\b" },
    { id: "rare", name: "Rare", group: "marketing", name_re: "\\brare\\b" },
  ]);
  const skills = [rec({ name: "seo-audit-rare" }), rec({ name: "seo-audit-b" }), rec({ name: "seo-audit-c" }), rec({ name: "lonely" })];
  const by = topicsBySkill(planTopics(cfg, skills));
  assert.deepEqual(by.get(skills[0].id).map((t) => t.topic.id), ["seo", "audit"], "the unpublished topic is left out; the first is primary");
  assert.equal(by.has(skills[3].id), false);
});

test("similarByTopic ranks other repositories' full pages by shared topics, then score", () => {
  const cfg = loadTopics([
    { id: "seo", name: "SEO", group: "marketing", name_re: "\\bseo\\b" },
    { id: "audit", name: "Audit", group: "marketing", name_re: "\\baudit\\b" },
  ]);
  const me = rec({ name: "seo-audit", repo: "me/skills", featured: true, score: 90 });
  const sibling = rec({ name: "seo-audit-2", repo: "me/skills", featured: true, score: 99 });
  const both = rec({ name: "seo-audit-pro", repo: "b/skills", featured: true, score: 70 });
  const oneHigh = rec({ name: "seo-high", repo: "c/skills", featured: true, score: 95 });
  const oneLow = rec({ name: "audit-low", repo: "d/skills", featured: true, score: 60 });
  const listingOnly = rec({ name: "seo-audit-listing", repo: "e/skills", featured: false, score: 99 });
  const by = topicsBySkill(planTopics(cfg, [me, sibling, both, oneHigh, oneLow, listingOnly]));
  assert.deepEqual(similarByTopic(me, by).map((s) => s.name), ["seo-audit-pro", "seo-high", "audit-low"]);
  assert.deepEqual(similarByTopic(me, by, 1).map((s) => s.name), ["seo-audit-pro"]);
  assert.deepEqual(similarByTopic(rec({ name: "no-topic" }), by), []);
});

// ------------------------------------------------------------ facets.mjs

test("costLane sorts open, non-commercial, restricted and service-backed records", () => {
  assert.equal(costLane(rec({ name: "a", license: "MIT", install: emptyInstall })), "free-open-source");
  assert.equal(costLane(rec({ name: "a", license: "Apache-2.0" })), "free-open-source", "no install record and no compatibility line");
  assert.equal(costLane(rec({ name: "a", license: "CC-BY-NC-4.0" })), "noncommercial");
  assert.equal(costLane(rec({ name: "a", license: "CC-BY-NC-SA-4.0", open_license: false })), "noncommercial", "non-commercial wins over restricted");
  assert.equal(costLane(rec({ name: "a", license: "PolyForm Noncommercial 1.0.0" })), "noncommercial");
  assert.equal(costLane(rec({ name: "a", license: "Proprietary", open_license: false })), "restricted");
  assert.equal(costLane(rec({ name: "a", install: { ...emptyInstall, env_read: ["OPENAI_API_KEY"] } })), "free-with-service");
  assert.equal(costLane(rec({ name: "a", install: { ...emptyInstall, mcp: true } })), "free-with-service");
  assert.equal(costLane(rec({ name: "a", install: { ...emptyInstall, hosts: ["api.example.com"] } })), "free-with-service");
  assert.equal(costLane(rec({ name: "a", compatibility: "Requires an API key from the provider." })), "free-with-service");
  assert.equal(costLane(rec({ name: "a", compatibility: "Claude Code and Codex." })), "free-open-source");
  // The install record outranks the compatibility line when both exist.
  assert.equal(needsService(rec({ name: "a", compatibility: "Requires an account.", install: emptyInstall })), false);
});

test("skillFlags reports every flag that applies, in FLAGS order", () => {
  const ids = FLAGS.map((f) => f.id);
  const full = rec({ name: "a", official: true, featured: true, shielded: true, has_scripts: true, has_references: true, has_assets: true, file_count: 9, allowed_tools: "Read", compatibility: "Claude Code", install: { ...emptyInstall, mcp_tools: ["x"], env_docs: ["KEY"], net: true, runs: ["npm"] } });
  const got = skillFlags(full);
  assert.deepEqual(got, ids.filter((id) => id !== "markdown-only" && id !== "no-setup"));
  assert.deepEqual(got, [...got].sort((a, b) => ids.indexOf(a) - ids.indexOf(b)));
  assert.deepEqual(skillFlags(rec({ name: "b", file_count: 1 })), ["markdown-only"]);
  assert.deepEqual(skillFlags(rec({ name: "c", featured: true, install: emptyInstall })), ["full-page", "no-setup"]);
  // Install-scoped flags need an install record.
  assert.deepEqual(skillFlags(rec({ name: "d" })), []);
});

test("planFacets partitions skills into lanes and counts flags against their universe", () => {
  const skills = [
    rec({ name: "open", install: emptyInstall, featured: true }),
    rec({ name: "svc", install: { ...emptyInstall, net: true }, featured: true }),
    rec({ name: "nc", license: "CC-BY-NC-4.0" }),
    rec({ name: "closed", license: "Proprietary", open_license: false, file_count: 1 }),
    rec({ name: "also-open" }),
  ];
  const { lanes, flags } = planFacets(skills);
  assert.deepEqual(lanes.map((l) => l.lane.id), LANES.map((l) => l.id));
  assert.deepEqual(Object.fromEntries(lanes.map((l) => [l.lane.id, l.rows.map((s) => s.name)])), {
    "free-open-source": ["open", "also-open"],
    "free-with-service": ["svc"],
    noncommercial: ["nc"],
    restricted: ["closed"],
  });
  assert.equal(lanes.reduce((n, l) => n + l.rows.length, 0), skills.length);
  const flag = Object.fromEntries(flags.map((f) => [f.flag.id, f]));
  assert.equal(flag["full-page"].rows.length, 2);
  assert.equal(flag["full-page"].universe, 5);
  assert.equal(flag.network.rows.length, 1);
  assert.equal(flag.network.universe, 2, "install-scoped flags count skills with an install record");
  assert.deepEqual(flag["no-setup"].rows.map((s) => s.name), ["open"]);
  assert.deepEqual(flag["markdown-only"].rows.map((s) => s.name), ["closed"]);
});

// ------------------------------------------------------------ listed-since.mjs

test("applyListedSince keeps known dates, adds new ids at the snapshot date and drops departed ids", () => {
  const ledger = { _comment: "kept", dates: { "a/b/kept": "2026-10-19", "a/b/gone": "2026-10-19", "a/b/future": "2026-12-01" } };
  const skills = [{ id: "a/b/kept" }, { id: "a/b/new" }, { id: "a/b/future" }];
  const { next, added } = applyListedSince(ledger, skills, "2026-10-22");
  assert.deepEqual(next.dates, { "a/b/kept": "2026-10-19", "a/b/new": "2026-10-22", "a/b/future": "2026-10-22" });
  assert.deepEqual(added, ["a/b/new", "a/b/future"], "a date after the snapshot is not trusted");
  assert.equal(next._comment, "kept");
  assert.deepEqual(skills.map((s) => s.listed_since), ["2026-10-19", "2026-10-22", "2026-10-22"]);
  assert.throws(() => applyListedSince(ledger, skills, "Oct 22"), /snapshot date must be ISO/);
});

test("scoped intake dates new rows at assessment and preserves existing dates", () => {
  const skills = [{ id: "old", assessment_date: "2026-11-11" }, { id: "new", assessment_date: "2026-11-11" }];
  const first = applyListedSince({ dates: { old: "2026-10-19" } }, skills, "2026-10-22");
  assert.deepEqual(first.next.dates, { old: "2026-10-19", new: "2026-11-11" });
  const second = applyListedSince(first.next, skills, "2026-10-22");
  assert.deepEqual(second.next.dates, first.next.dates);
  assert.deepEqual(second.added, []);
  assert.throws(() => applyListedSince({ dates: {} }, [{ id: "bad", assessment_date: "Nov 11" }], "2026-10-22"), /assessment date must be ISO/);
});

test("serializeLedger sorts keys and round-trips", () => {
  const text = serializeLedger({ _comment: "c", dates: { "z/z/z": "2026-10-19", "a/a/a": "2026-10-22", "m/m/m": "2026-10-20" } });
  assert.ok(text.endsWith("}\n"));
  const back = JSON.parse(text);
  assert.deepEqual(Object.keys(back), ["_comment", "dates"]);
  assert.deepEqual(Object.keys(back.dates), ["a/a/a", "m/m/m", "z/z/z"]);
  assert.equal(serializeLedger(back), text, "serializing is stable");
});

test("loadListedSince tolerates a missing file and rejects bad dates", () => {
  assert.deepEqual(loadListedSince(path.join(os.tmpdir(), "no-such-ledger.json")), { dates: {} });
  assert.throws(() => loadListedSince(tmpJson("ledger.json", { dates: { "a/b/c": "yesterday" } })), /a\/b\/c has no ISO date/);
  assert.throws(() => loadListedSince(tmpJson("ledger.json", { dates: [] })), /expected a dates map/);
});

test("isNewListing excludes the floor date and anything older than 30 days", () => {
  assert.equal(NEW_DAYS, 30);
  const floor = "2026-10-19";
  assert.equal(isNewListing({ listed_since: floor }, "2026-10-22", floor), false, "the first snapshot is not new");
  assert.equal(isNewListing({ listed_since: "2026-10-22" }, "2026-10-22", floor), true);
  assert.equal(isNewListing({ listed_since: "2026-10-20" }, "2026-11-19", floor), true, "exactly 30 days");
  assert.equal(isNewListing({ listed_since: "2026-10-20" }, "2026-11-20", floor), false, "31 days");
  assert.equal(daysBetween("2026-10-19", "2026-10-22"), 3);
  assert.equal(isRecentlyUpdated({ commit_date: "2026-09-22" }, "2026-10-22"), true);
  assert.equal(isRecentlyUpdated({ commit_date: "2026-09-21" }, "2026-10-22"), false);
});

// ------------------------------------------------------------ the dataset, expanded like the build

const data = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "skills.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "categories.json"), "utf8"));
const skills = data.skills.map((c) => {
  const meta = data.repos[c.repo];
  const [owner, name] = c.repo.split("/");
  const repoSlug = `${slugify(owner)}/${slugify(name)}`;
  return {
    ...c,
    id: `${repoSlug}/${c.slug}`,
    owner,
    repo_slug: repoSlug,
    featured: Boolean(c.featured),
    lists: meta.lists,
    official: meta.official,
    commit_date: meta.commit_date,
    assessment_date: meta.assessment_date || null,
    file_count: c.size[2],
    has_references: c.kinds.includes("r"),
    has_scripts: c.kinds.includes("s"),
    has_assets: c.kinds.includes("a"),
    allowed_tools: c.allowed_tools || null,
    compatibility: c.compatibility || null,
    install: c.install || null,
    shielded: c.score >= 80,
  };
});
const byId = new Map(skills.map((s) => [s.id, s]));
const snapshotDate = data.generated;
const ledger = loadListedSince(path.join(repoRoot, "directory", "listed-since.json"));
// The floor is the first recorded snapshot: the earliest date in the ledger.
const floorDate = Object.values(ledger.dates).sort()[0];
applyListedSince(ledger, skills, snapshotDate);
const topicConfig = loadTopicConfig(path.join(repoRoot, "directory", "topics.json"), new Set(categories.map((c) => c.slug)));
const topicPlan = planTopics(topicConfig, skills);
const publishedTopics = topicPlan.topics.filter((t) => t.published);
const bySkill = topicsBySkill(topicPlan);
const facets = planFacets(skills);
const flagsWithSkills = facets.flags.filter((f) => f.rows.length > 0);
// "Most cited" counts the curated lists that cite the repository.
const cited = (s) => s.lists.length;

const skillRel = (s) => `directory/${s.repo_slug}/${s.slug}/`;
const topicRel = (id) => `directory/topics/${id}/`;
const laneRel = (id) => `directory/pricing/${id}/`;
const flagRel = (id) => `directory/features/${id}/`;
const hubs = ["directory/topics/", "directory/pricing/", "directory/features/", "directory/new/", "directory/top/"];
const browsePages = [
  ...hubs,
  ...publishedTopics.map((t) => topicRel(t.topic.id)),
  ...LANES.map((l) => laneRel(l.id)),
  ...flagsWithSkills.map((f) => flagRel(f.flag.id)),
];

// ------------------------------------------------------------ page helpers

const file = (rel) => path.join(docs, rel, "index.html");
const exists = (rel) => fs.existsSync(file(rel));
const MISSING = "docs/directory/topics/index.html is not built yet: run node scripts/build-directory.mjs, then rerun these tests";
// Every page test calls this first, so an unbuilt site fails each test once
// with a clear message instead of crashing the file.
const built = () => assert.ok(exists("directory/topics/"), MISSING);
const read = (rel) => {
  assert.ok(exists(rel), `${rel}index.html is missing`);
  return fs.readFileSync(file(rel), "utf8");
};
const jsonld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const title = (html) => decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "");
const meta = (html) => decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
const mainOf = (html) => (html.match(/<main\b[\s\S]*<\/main>/) || [""])[0];
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].slice(1).map((m) => [m[1], decode(m[2] ?? "")]));

// Hrefs inside <main>, resolved to docs-relative directory paths.
function links(rel, html) {
  return new Set([...mainOf(html).matchAll(/href="([^"#?]*)/g)].map((m) => m[1]).filter((h) => h && !/^[a-z]+:/i.test(h) && !h.startsWith("/")).map((h) => path.posix.normalize(path.posix.join(rel, h)).replace(/\/?$/, "/")));
}
const resolve = (rel, href) => path.posix.normalize(path.posix.join(rel, href.replace(/[?#].*$/, ""))).replace(/\/?$/, "/");

// Rows (tr[data-id]) of the filterable tables (table[data-filter-group]) in
// document order, with their data attributes and first link text. Pages
// without a filterable table (new/, top/) use every table.
function tableRows(html) {
  const out = [];
  const filtered = /<table\b[^>]*data-filter-group="/.test(html);
  const tables = filtered ? /<table\b[^>]*data-filter-group="[^"]*"[^>]*>([\s\S]*?)<\/table>/g : /<table\b[^>]*>([\s\S]*?)<\/table>/g;
  for (const t of html.matchAll(tables)) {
    for (const r of t[1].matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)) {
      const a = attrs(`<tr ${r[1]}`);
      if (!a["data-id"]) continue;
      const link = r[2].match(/<td class="name"><a href="([^"]*)"[^>]*>([^<]*)<\/a>/);
      out.push({ ...a, href: link?.[1], name: link ? decode(link[2]) : undefined });
    }
  }
  return out;
}
const collection = (html) => jsonld(html).find((n) => n["@type"] === "CollectionPage");

// The visible Q&A section: each h3 and the paragraph that answers it.
function visibleFaq(html) {
  const section = (html.match(/<section class="[^"]*\bfaq\b[^"]*"[\s\S]*?<\/section>/) || [""])[0];
  return [...section.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => [decode(m[1].replace(/<[^>]+>/g, "")), decode(m[2].replace(/<[^>]+>/g, ""))]);
}

// ------------------------------------------------------------ page tests

test("the dataset exercises every browse page", () => {
  assert.ok(publishedTopics.length >= 10, `only ${publishedTopics.length} topics publish`);
  assert.equal(facets.lanes.reduce((n, l) => n + l.rows.length, 0), skills.length, "lanes partition the dataset");
  assert.ok(skills.some((s) => isNewListing(s, snapshotDate, floorDate)), "expected new listings after the ledger floor");
  for (const t of topicPlan.topics) assert.equal(t.published, t.rows.length >= TOPIC_GATE.minListed, t.topic.id);
});

test("every indexable browse page has a unique title, a meta in range and a canonical on suedeai.directory", () => {
  built();
  const titles = new Map();
  const metas = new Map();
  for (const rel of browsePages) {
    const html = read(rel);
    const t = title(html);
    const d = meta(html);
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/, `${rel}: browse pages are indexable`);
    assert.ok(t.length >= 20 && t.length <= 60, `${rel}: title is ${t.length} characters: ${t}`);
    assert.ok(d.length >= 70 && d.length <= 155, `${rel}: meta is ${d.length} characters`);
    assert.doesNotMatch(`${t} ${d}`, /\u2026|\u2014/, `${rel}: cut or em dash in title or meta`);
    assert.match(html, new RegExp(`<link rel="canonical" href="${NEW}/${rel.replace(/^directory\//, "")}">`), `${rel}: canonical on suedeai.directory`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${rel}: one H1`);
    titles.set(t.toLowerCase(), [...(titles.get(t.toLowerCase()) || []), rel]);
    metas.set(d, [...(metas.get(d) || []), rel]);
  }
  assert.deepEqual([...titles].filter(([, v]) => v.length > 1), [], "duplicate titles");
  assert.deepEqual([...metas].filter(([, v]) => v.length > 1), [], "duplicate metas");
});

test("browse pages carry a CollectionPage with an ItemList, a breadcrumb ending at the page and no rating markup", () => {
  built();
  for (const rel of browsePages) {
    const html = read(rel);
    const nodes = jsonld(html);
    const page = collection(html);
    assert.ok(page, `${rel}: no CollectionPage`);
    assert.equal(page.mainEntity?.["@type"], "ItemList", `${rel}: no ItemList`);
    assert.ok(page.mainEntity.itemListElement.length > 0, `${rel}: empty ItemList`);
    assert.equal(page.mainEntity.numberOfItems, page.mainEntity.itemListElement.length, `${rel}: numberOfItems`);
    page.mainEntity.itemListElement.forEach((it, i) => assert.equal(it.position, i + 1, `${rel}: item ${i + 1} position`));
    const bc = nodes.find((n) => n["@type"] === "BreadcrumbList");
    assert.ok(bc, `${rel}: no BreadcrumbList`);
    assert.equal(bc.itemListElement.at(-1).item, `${BASE}/${rel}`, `${rel}: breadcrumb does not end at the page`);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      assert.doesNotMatch(m[1], /"(AggregateRating|Review|Rating)"|"aggregateRating"|"review"/, `${rel}: rating markup`);
    }
  }
});

test("every published topic has a page, every unpublished topic has none, and the hub links them all", () => {
  built();
  const dirs = fs.readdirSync(path.join(docs, "directory", "topics"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  assert.deepEqual(dirs, publishedTopics.map((t) => t.topic.id).sort(), "docs/directory/topics/ holds exactly the published topics");
  for (const t of topicPlan.topics) assert.equal(exists(topicRel(t.topic.id)), t.published, `${t.topic.id}: ${t.rows.length} matches`);
  const hub = links("directory/topics/", read("directory/topics/"));
  for (const t of publishedTopics) assert.ok(hub.has(topicRel(t.topic.id)), `topics hub lacks ${t.topic.id}`);
  for (const t of topicPlan.topics.filter((x) => !x.published)) assert.ok(!hub.has(topicRel(t.topic.id)), `topics hub links unpublished ${t.topic.id}`);
});

test("each topic page lists its matches in table order and its ItemList follows the table", () => {
  built();
  for (const t of publishedTopics) {
    const rel = topicRel(t.topic.id);
    const html = read(rel);
    const rows = tableRows(html);
    assert.deepEqual(rows.map((r) => r["data-id"]), t.rows.map((s) => s.id), `${rel}: table rows differ from planTopics`);
    const list = collection(html).mainEntity;
    assert.equal(list.numberOfItems, rows.length, `${rel}: numberOfItems must equal the table rows`);
    list.itemListElement.forEach((item, i) => {
      assert.equal(item.name, rows[i].name, `${rel}: item ${i + 1} out of table order`);
      if (rows[i].href && !/^https?:/.test(rows[i].href)) assert.equal(item.url, new URL(rows[i].href, `${BASE}/${rel}`).href, `${rel}: item ${i + 1} url`);
    });
  }
});

test("lane pages exist for all four lanes and list only their lane", () => {
  built();
  assert.equal(LANES.length, 4);
  for (const l of facets.lanes) {
    const rel = laneRel(l.lane.id);
    const rows = tableRows(read(rel));
    assert.ok(rows.length > 0, `${rel}: no rows`);
    for (const r of rows) assert.equal(r["data-lane"], l.lane.id, `${rel}: ${r["data-id"]} is in another lane`);
  }
});

test("the pricing hub links every lane and its counts add up to the dataset size", () => {
  built();
  const rel = "directory/pricing/";
  const html = read(rel);
  const main = mainOf(html);
  const hub = links(rel, html);
  let total = 0;
  for (const l of facets.lanes) {
    assert.ok(hub.has(laneRel(l.lane.id)), `pricing hub lacks ${l.lane.id}`);
    const at = main.search(new RegExp(`href="[^"]*${l.lane.id}/"`));
    const near = decode(main.slice(at, at + 800).replace(/<[^>]+>/g, " "));
    assert.ok(new RegExp(`(^|[^\\d,])${fmt(l.rows.length)}([^\\d,]|$)`).test(near), `pricing hub: ${l.lane.id} should show ${fmt(l.rows.length)} near its link`);
    total += l.rows.length;
  }
  assert.equal(total, skills.length, "lane counts must add up to the dataset");
});

test("flag pages exist for every flag with skills and list only flagged skills", () => {
  built();
  const dirs = fs.readdirSync(path.join(docs, "directory", "features"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  assert.deepEqual(dirs, flagsWithSkills.map((f) => f.flag.id).sort(), "docs/directory/features/ holds exactly the flags with skills");
  const hub = links("directory/features/", read("directory/features/"));
  for (const f of flagsWithSkills) {
    const rel = flagRel(f.flag.id);
    assert.ok(hub.has(rel), `features hub lacks ${f.flag.id}`);
    const rows = tableRows(read(rel));
    assert.ok(rows.length > 0, `${rel}: no rows`);
    for (const r of rows) assert.ok((r["data-flags"] || "").split(/\s+/).includes(f.flag.id), `${rel}: ${r["data-id"]} lacks the flag`);
  }
});

test("new/ lists exactly the skills first listed after the ledger floor within 30 days", () => {
  built();
  const rows = tableRows(read("directory/new/"));
  const expected = skills.filter((s) => isNewListing(s, snapshotDate, floorDate));
  const listedNew = [...new Set(rows.filter((r) => r["data-listed"] > floorDate).map((r) => r["data-id"]))].sort();
  const thirdParty = expected.filter((s) => !isFirstParty(s)).map((s) => s.id).sort();
  // Suede AI's own new skills may be shown or held back, but all or nothing.
  const all = expected.map((s) => s.id).sort();
  assert.ok(JSON.stringify(listedNew) === JSON.stringify(all) || JSON.stringify(listedNew) === JSON.stringify(thirdParty), `new/ lists ${listedNew.length} new skills; expected ${all.length} (or ${thirdParty.length} without Suede AI's own)`);
  for (const r of rows) {
    const s = byId.get(r["data-id"]);
    assert.ok(s, `new/: unknown skill ${r["data-id"]}`);
    assert.equal(r["data-listed"], s.listed_since, `new/: ${s.id} listed date`);
    assert.ok(isNewListing(s, snapshotDate, floorDate) || isRecentlyUpdated(s, snapshotDate), `new/: ${s.id} is neither new nor recently updated`);
  }
});

test("top/ lists 100 third-party skills in non-increasing score order", () => {
  built();
  const html = read("directory/top/");
  const rows = tableRows(html);
  assert.equal(rows.length, 100, "top/ lists 100 skills");
  const scores = rows.map((r) => Number(r["data-score"]));
  for (let i = 1; i < rows.length; i++) {
    assert.ok(scores[i] <= scores[i - 1], `top/: row ${i + 1} scores above row ${i}`);
    if (scores[i] === scores[i - 1]) assert.ok(Number(rows[i]["data-cited"]) <= Number(rows[i - 1]["data-cited"]), `top/: row ${i + 1} ties on score but is cited more than row ${i}`);
  }
  for (const r of rows) {
    const s = byId.get(r["data-id"]);
    assert.ok(s, `top/: unknown skill ${r["data-id"]}`);
    assert.ok(!isFirstParty(s), `top/: Suede AI skill ${s.id} in a ranking`);
    assert.equal(Number(r["data-score"]), s.score, `top/: ${s.id} score`);
  }
  // Every third-party skill scoring above the 100th row's score must be listed.
  const cutoff = scores.at(-1);
  const ids = new Set(rows.map((r) => r["data-id"]));
  for (const s of skills.filter((x) => !isFirstParty(x) && x.score > cutoff)) assert.ok(ids.has(s.id), `top/: ${s.id} (${s.score}) missing`);
  assert.doesNotMatch(mainOf(html), new RegExp(FIRST_PARTY.replace("/", "\\/"), "i"), "top/ names a Suede AI skill");
  for (const item of collection(html).mainEntity.itemListElement) assert.doesNotMatch(item.url, /jasoncolapietro\/suede-creator-skills/i);
});

test("saved/ is a noindex, client-rendered page", () => {
  built();
  const html = read("directory/saved/");
  assert.match(html, /<meta name="robots" content="[^"]*noindex/, "saved/ must be noindex");
  assert.match(html, /<section\b[^>]*data-saved-page/, "saved/ lacks section[data-saved-page]");
  assert.match(html, /<table\b[^>]*data-saved-table/, "saved/ lacks table[data-saved-table]");
  assert.match(html, /data-saved-empty/);
  assert.match(html, /data-saved-clear/);
  const xml = fs.readFileSync(path.join(docs, "directory-sitemap.xml"), "utf8");
  assert.ok(!xml.includes(`${BASE}/directory/saved/`), "saved/ must stay out of the sitemap");
});

test("feed.xml is RSS 2.0 with a channel and items on the directory", () => {
  built();
  const feedFile = path.join(docs, "directory", "feed.xml");
  assert.ok(fs.existsSync(feedFile), "docs/directory/feed.xml is missing");
  const xml = fs.readFileSync(feedFile, "utf8");
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/i);
  assert.match(xml, /<rss\b[^>]*version="2\.0"/, "not RSS 2.0");
  const channel = (xml.match(/<channel>([\s\S]*)<\/channel>/) || [])[1];
  assert.ok(channel, "no channel");
  const head = channel.split("<item>")[0];
  assert.ok((head.match(/<title>([^<]+)<\/title>/) || [])[1]?.trim(), "channel has no title");
  assert.match(head, /<link>https:\/\/(?:suedeai\.directory|skills\.suedeai\.ai\/directory)\/?[^<]*<\/link>/, "channel link");
  assert.ok((head.match(/<description>([^<]+)<\/description>/) || [])[1]?.trim(), "channel has no description");
  const items = [...channel.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  assert.ok(items.length >= 1, "feed has no items");
  for (const it of items) {
    const link = (it.match(/<link>([^<]+)<\/link>/) || [])[1];
    assert.ok(link, "item without a link");
    assert.match(decode(link), /^https:\/\/(?:suedeai\.directory\/|skills\.suedeai\.ai\/directory\/)/, `item link off the directory: ${link}`);
    assert.ok((it.match(/<title>([^<]+)<\/title>/) || [])[1], `item without a title: ${link}`);
  }
  assert.ok(items.some((it) => /<link>[^<]*\/guides\/[^<]+<\/link>/.test(it)), "feed lists no guide");
  assert.doesNotMatch(xml, /\u2014/, "em dash in the feed");
});

test("llms.txt names the browse pages", () => {
  built();
  const lines = fs.readFileSync(path.join(docs, "llms.txt"), "utf8").split("\n");
  for (const start of ["- [Agent skills by topic](", "- [Skills by cost and license](", "- [Skills by capability](", "- [New agent skills](", "- [Top 100 agent skills]("]) {
    assert.ok(lines.some((l) => l.startsWith(start)), `llms.txt lacks a line starting "${start}"`);
  }
});

test("the hub links the browse pages and offers lane and flag filters", () => {
  built();
  const html = read("directory/");
  const hub = links("directory/", html);
  for (const rel of [...hubs, "directory/saved/"]) assert.ok(hub.has(rel), `hub main content lacks ${rel}`);
  const select = (name) => (html.match(new RegExp(`<select name="${name}"[^>]*>([\\s\\S]*?)<\\/select>`)) || [])[1] || "";
  const values = (name) => [...select(name).matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(values("lane"), ["", ...LANES.map((l) => l.id)], "lane select: All, then the lanes");
  assert.deepEqual(values("flag"), ["", ...FLAGS.map((f) => f.id)], "flag select: All, then the flags");
  for (const v of ["listed", "updated"]) assert.ok(values("sort").includes(v), `sort select lacks ${v}`);
});

test("search-index.json records carry lane, flags, topics, listed and updated", () => {
  built();
  const records = JSON.parse(fs.readFileSync(path.join(docs, "directory", "search-index.json"), "utf8"));
  assert.equal(records.length, skills.length);
  // Records name a skill by its display name when it has one.
  const byRepoName = new Map(skills.flatMap((s) => [[`${s.repo}/${s.name}`, s], [`${s.repo}/${s.display_name || s.name}`, s]]));
  for (const r of records) {
    const s = byRepoName.get(`${r.repo}/${r.name}`);
    assert.ok(s, `search index: unknown record ${r.repo}/${r.name}`);
    assert.equal(r.lane, costLane(s), `${s.id}: lane`);
    assert.deepEqual([...r.flags].sort(), skillFlags(s).sort(), `${s.id}: flags`);
    assert.deepEqual(r.topics, (bySkill.get(s.id) || []).map((t) => t.topic.id), `${s.id}: topics`);
    assert.equal(r.listed, s.listed_since, `${s.id}: listed`);
    assert.equal(r.updated, s.commit_date, `${s.id}: updated`);
  }
});

test("every full skill page carries the new facts rows, save button, share row, reviews and Q&A", () => {
  built();
  assert.ok(fs.existsSync(path.join(repoRoot, ".github", "ISSUE_TEMPLATE", "directory-review.yml")), "the reader-review issue form is missing");
  for (const s of skills.filter((x) => x.featured)) {
    const rel = skillRel(s);
    const html = read(rel);
    const main = mainOf(html);
    const row = (label) => (main.match(new RegExp(`<th scope="row">${label}</th><td>([\\s\\S]*?)</td></tr>`)) || [])[1];
    const rowLinks = (label) => [...(row(label) || "").matchAll(/href="([^"]*)"/g)].map((m) => resolve(rel, m[1]));

    const listed = row("Listed since");
    assert.ok(listed !== undefined, `${rel}: no Listed since row`);
    assert.ok(listed.includes(s.listed_since) || decode(listed).includes(longDate(s.listed_since)), `${rel}: Listed since should show ${s.listed_since}`);

    assert.ok(row("Cost") !== undefined, `${rel}: no Cost row`);
    assert.deepEqual(rowLinks("Cost"), [laneRel(costLane(s))], `${rel}: Cost must link its lane page`);

    const flags = skillFlags(s);
    assert.ok(row("Capabilities") !== undefined || !flags.length, `${rel}: no Capabilities row`);
    const capLinks = rowLinks("Capabilities");
    if (flags.length) assert.ok(capLinks.length > 0, `${rel}: Capabilities links no flag page`);
    for (const l of capLinks) assert.ok(flags.some((f) => l === flagRel(f)), `${rel}: Capabilities links ${l}, which is not one of its flags`);

    const topics = (bySkill.get(s.id) || []).map((t) => topicRel(t.topic.id));
    if (topics.length) {
      assert.ok(row("Topics") !== undefined, `${rel}: no Topics row`);
      const tl = rowLinks("Topics");
      assert.ok(tl.includes(topics[0]), `${rel}: Topics must link its primary topic ${topics[0]}`);
      for (const l of tl) assert.ok(topics.includes(l), `${rel}: Topics links ${l}, which does not list it`);
    } else {
      assert.equal(row("Topics"), undefined, `${rel}: Topics row without a topic`);
    }

    const save = main.match(/<button\b[^>]*class="save-button"[^>]*>/);
    assert.ok(save, `${rel}: no save button`);
    const sa = attrs(save[0]);
    assert.equal(sa["data-save"], s.id, `${rel}: data-save should be the skill id`);
    assert.ok(sa["data-save-href"] && sa["data-save-name"], `${rel}: save button lacks href or name`);
    assert.equal(sa["aria-pressed"], "false");

    const share = (main.match(/<div class="share" data-share>([\s\S]*?)<\/div>/) || [])[1];
    assert.ok(share, `${rel}: no share row`);
    const copy = (share.match(/data-copy-url="([^"]*)"/) || [])[1];
    assert.ok(copy, `${rel}: share row lacks a copy-link button`);
    assert.ok([`${NEW}/${rel.replace(/^directory\//, "")}`, `${BASE}/${rel}`].includes(decode(copy)), `${rel}: copy link ${copy} is not this page`);

    assert.match(main, />Strengths and open points</, `${rel}: no Strengths and open points section`);
    assert.match(main, />Reviews and ratings</, `${rel}: no Reviews and ratings section`);
    assert.match(main, /href="https:\/\/github\.com\/JasonColapietro\/suede-creator-skills\/issues\/new\?template=directory-review\.yml[^"]*"/i, `${rel}: no reader-review link`);

    const faq = jsonld(html).find((n) => n["@type"] === "FAQPage");
    assert.ok(faq, `${rel}: no FAQPage`);
    const visible = visibleFaq(html);
    assert.ok(visible.length >= 2, `${rel}: ${visible.length} visible questions`);
    assert.deepEqual(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]), visible, `${rel}: FAQPage drifts from the visible Q&A`);
  }
});

test("category pages carry table tools and rows with their facet data", () => {
  built();
  for (const c of categories) {
    const rel = `directory/${c.slug}/`;
    const html = read(rel);
    const tools = html.match(/<div class="table-tools" data-table-tools="([^"]+)"[^>]*>([\s\S]*?)<button type="button" class="tools-reset"/);
    assert.ok(tools, `${rel}: no table tools`);
    const groupId = tools[1];
    const sort = (tools[2].match(new RegExp(`<select id="${groupId}-sort" data-sort-for="${groupId}">([\\s\\S]*?)</select>`)) || [])[1];
    assert.ok(sort, `${rel}: no sort select for ${groupId}`);
    assert.deepEqual([...sort.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]), ["listing", "score", "name", "updated", "listed", "cited"], `${rel}: sort options`);
    assert.match(tools[2], /data-facet="lane"/, `${rel}: no cost chips`);
    assert.match(tools[2], /data-facet="flag"/, `${rel}: no capability chips`);
    assert.match(html, new RegExp(`<table\\b[^>]*data-filter-group="${groupId}"`), `${rel}: tools name no table group`);

    const rows = tableRows(html);
    const expected = skills.filter((s) => s.category === c.slug);
    assert.equal(rows.length, expected.length, `${rel}: table rows`);
    for (const r of rows) {
      const s = byId.get(r["data-id"]);
      assert.ok(s, `${rel}: unknown row ${r["data-id"]}`);
      for (const k of ["data-lane", "data-flags", "data-score", "data-updated", "data-listed", "data-cited"]) assert.ok(k in r, `${rel}: ${s.id} lacks ${k}`);
      assert.equal(r["data-lane"], costLane(s), `${rel}: ${s.id} lane`);
      assert.deepEqual(r["data-flags"].split(/\s+/).filter(Boolean).sort(), skillFlags(s).sort(), `${rel}: ${s.id} flags`);
      assert.equal(Number(r["data-score"]), s.score, `${rel}: ${s.id} score`);
      assert.equal(r["data-updated"], s.commit_date, `${rel}: ${s.id} updated`);
      assert.equal(r["data-listed"], s.listed_since, `${rel}: ${s.id} listed`);
      assert.equal(Number(r["data-cited"]), cited(s), `${rel}: ${s.id} cited`);
      assert.match(r["data-updated"], /^\d{4}-\d\d-\d\d$/);
    }
  }
});

test("browse page copy avoids em dashes and the banned AI-tell words", () => {
  built();
  const banned = /\u2014|\bdelve|game-changer|\bunlock|\belevate|\bseamless|\blandscape\b|\btapestry\b|\bmoreover\b|it's important to note/i;
  for (const rel of [...browsePages, "directory/saved/"]) {
    const main = mainOf(read(rel));
    // Only Suede AI's own sentences: third-party summaries, skill names and
    // repository names sit in table cells.
    const own = main.replace(/<td class="(?:desc|meta|name)">[\s\S]*?<\/td>/g, "").replace(/<[^>]+>/g, " ")
      // Third-party owner/repo names (for example tapestry-skills-for-claude-code) are not our copy.
      .replace(/[\w.-]+\/[\w.-]+/g, " ");
    assert.doesNotMatch(decode(own), banned, `${rel}: banned wording`);
  }
});
