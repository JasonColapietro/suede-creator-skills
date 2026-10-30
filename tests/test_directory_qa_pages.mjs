// Task pages ("What are the best Claude Code skills for <topic>?") and
// "<skill> alternatives" pages in the Agent Skills Directory, plus the
// Directory summary on every full skill page. scripts/build-directory.mjs
// renders them from directory/task-pages.json through
// scripts/directory/task-pages.mjs; these tests read the committed output.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadTaskConfig, planTasks, planAlternatives, matchReason, isFirstParty, TASK_GATE } from "../scripts/directory/task-pages.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(repoRoot, "docs");
const BASE = "https://skills.suedeai.ai";
const NEW = "https://suedeai.directory";
const FIRST_PARTY = "jasoncolapietro/suede-creator-skills";

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&middot;/g, "·").replace(/&amp;/g, "&");
const read = (rel) => fs.readFileSync(path.join(docs, rel, "index.html"), "utf8");
const exists = (rel) => fs.existsSync(path.join(docs, rel, "index.html"));
const jsonld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const title = (html) => decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "");
const meta = (html) => decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
const h1 = (html) => decode(((html.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || "").replace(/<[^>]+>/g, ""));
const words = (t) => t.trim().split(/\s+/).filter(Boolean).length;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "skill";

// The dataset, expanded the way the build expands it for matching.
const data = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "skills.json"), "utf8"));
const skills = data.skills.map((c) => {
  const [owner, name] = c.repo.split("/");
  const repoSlug = `${slugify(owner)}/${slugify(name)}`;
  return { ...c, id: `${repoSlug}/${c.slug}`, owner, repo_slug: repoSlug, featured: Boolean(c.featured), lists: data.repos[c.repo].lists };
});
const categories = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "categories.json"), "utf8"));
const config = loadTaskConfig(path.join(repoRoot, "directory", "task-pages.json"), new Set(categories.map((c) => c.slug)));
const plan = planTasks(config, skills);
const published = plan.filter((t) => t.published);
const alternatives = planAlternatives(plan);
const skillRel = (s) => `directory/${s.repo_slug}/${s.slug}/`;
const taskRel = (t) => `directory/for/${t.job.id}/`;
const altRel = (s) => `${skillRel(s)}alternatives/`;
const newPages = [
  "directory/for/",
  ...published.map(taskRel),
  ...alternatives.map((a) => altRel(a.s)),
];

// The visible Q&A section: each h3 and the paragraph that answers it.
function visibleFaq(html) {
  const section = (html.match(/<section class="panel faq"[\s\S]*?<\/section>/) || [""])[0];
  return [...section.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)].map((m) => [decode(m[1]), decode(m[2])]);
}

// Hrefs inside <main>, resolved to docs-relative directory paths.
function links(rel, html) {
  const main = (html.match(/<main\b[\s\S]*<\/main>/) || [""])[0];
  return new Set([...main.matchAll(/href="([^"#?]*)/g)].map((m) => m[1]).filter((h) => h && !/^[a-z]+:/i.test(h) && !h.startsWith("/")).map((h) => path.posix.normalize(path.posix.join(rel, h)).replace(/\/?$/, "/")));
}

test("the gate decides which task pages exist", () => {
  assert.ok(published.length >= 10, `only ${published.length} task pages pass the gate`);
  assert.ok(plan.some((t) => !t.published), "the keyword map should exercise the gate with at least one skipped job");
  const built = fs.readdirSync(path.join(docs, "directory", "for"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  assert.deepEqual(built, published.map((t) => t.job.id).sort(), "docs/directory/for/ must hold exactly the jobs that pass the gate");
  for (const t of plan) {
    // Recount from the matches rather than trusting the published flag.
    const strong = t.matches.filter((s) => s.featured && s.score >= 80).length;
    const passes = t.matches.length >= 5 && strong >= 3;
    assert.equal(t.published, passes, `${t.job.id}: ${t.matches.length} matches, ${strong} full pages scoring 80+`);
    assert.equal(exists(taskRel(t)), passes, `${t.job.id}: page ${passes ? "missing" : "published below the gate"}`);
  }
  assert.deepEqual(TASK_GATE, { minListed: 5, minStrongPages: 3, strongScore: 80 });
});

test("no Suede AI skill reaches a task ranking or an alternatives list", () => {
  const own = skills.find((s) => s.repo.toLowerCase() === FIRST_PARTY);
  assert.ok(own, "the dataset should list Suede AI's own skills to exercise this rule");
  assert.ok(isFirstParty(own));
  for (const job of config.jobs) assert.equal(matchReason(job, { ...own, name: job.id, display_name: job.job }), null, `${job.id} matched a Suede AI skill`);
  for (const rel of newPages) {
    const html = read(rel);
    const main = (html.match(/<main\b[\s\S]*<\/main>/) || [""])[0];
    assert.doesNotMatch(main, /JasonColapietro\/suede-creator-skills|jasoncolapietro\/suede-creator-skills/i, `${rel}: lists a Suede AI skill`);
    for (const node of jsonld(html)) {
      for (const item of node.mainEntity?.itemListElement || []) assert.doesNotMatch(item.url, /jasoncolapietro\/suede-creator-skills/i, `${rel}: ItemList names a Suede AI skill`);
    }
  }
});

test("new pages have unique whole-sentence titles and metas within limits", () => {
  const titles = new Map();
  const metas = new Map();
  for (const rel of newPages) {
    const html = read(rel);
    const t = title(html);
    const d = meta(html);
    assert.ok(t.length >= 20 && t.length <= 60, `${rel}: title is ${t.length} characters: ${t}`);
    assert.ok(d.length >= 70 && d.length <= 155, `${rel}: meta is ${d.length} characters`);
    assert.doesNotMatch(`${t} ${d}`, /…|—/, `${rel}: cut or em dash in title or meta`);
    assert.match(d, /[.!?]$/, `${rel}: meta must end a sentence`);
    titles.set(t.toLowerCase(), [...(titles.get(t.toLowerCase()) || []), rel]);
    metas.set(d, [...(metas.get(d) || []), rel]);
  }
  assert.deepEqual([...titles].filter(([, v]) => v.length > 1), []);
  assert.deepEqual([...metas].filter(([, v]) => v.length > 1), []);
});

test("task pages ask the question, answer it in 40 to 60 words and name the top pick", () => {
  for (const t of published) {
    const html = read(taskRel(t));
    const top = t.rows[0];
    const name = top.display_name || top.name;
    assert.equal(h1(html), `What are the best Claude Code skills for ${t.job.topic}?`);
    assert.match(title(html), new RegExp(`Claude Code Skills for ${t.job.job.replace(/[.]/g, "\\.")}`));
    const answer = decode((html.match(/<p class="answer" id="answer">([\s\S]*?)<\/p>/) || [])[1] || "");
    assert.ok(words(answer) >= 40 && words(answer) <= 60, `${t.job.id}: direct answer is ${words(answer)} words`);
    assert.ok(answer.startsWith(`${name} from ${top.repo}`) && answer.includes(`${top.score}/100`), `${t.job.id}: answer must lead with the top pick and its score`);
    assert.ok(meta(html).includes(name) && meta(html).includes(`${top.score}/100`), `${t.job.id}: meta must name the top pick and its score`);
    // The comparison table: one row per ranked skill, in score order.
    const table = (html.match(/<table class="skill-table compare-table" id="task-skills">[\s\S]*?<\/table>/) || [""])[0];
    assert.match(table, /<th scope="col">Skill<\/th><th scope="col">Publisher<\/th><th scope="col">Suede Skill Check<\/th><th scope="col">License<\/th><th scope="col">What it does<\/th>/);
    const tbody = (table.match(/<tbody>[\s\S]*<\/tbody>/) || [""])[0];
    assert.equal((tbody.match(/<tr>/g) || []).length, t.rows.length, `${t.job.id}: table rows`);
    const scores = [...table.matchAll(/title="Suede Skill Check: (\d+)\/100/g)].map((m) => Number(m[1]));
    assert.deepEqual(scores, [...scores].sort((a, b) => b - a), `${t.job.id}: table not in score order`);
    assert.ok(visibleFaq(html).length >= 4 && visibleFaq(html).length <= 6, `${t.job.id}: expected 4 to 6 questions`);
  }
});

test("FAQPage JSON-LD matches the visible questions and answers", () => {
  for (const rel of [...published.map(taskRel), ...alternatives.map((a) => altRel(a.s))]) {
    const html = read(rel);
    const faq = jsonld(html).find((n) => n["@type"] === "FAQPage");
    assert.ok(faq, `${rel}: no FAQPage`);
    const visible = visibleFaq(html);
    assert.ok(visible.length >= 3, `${rel}: ${visible.length} visible questions`);
    assert.deepEqual(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]), visible, `${rel}: FAQPage drifts from the page`);
  }
});

test("task and alternatives pages carry CollectionPage, ItemList and BreadcrumbList on the directory WebSite", () => {
  for (const rel of newPages) {
    const html = read(rel);
    const nodes = jsonld(html);
    const page = nodes.find((n) => n["@type"] === "CollectionPage");
    assert.ok(page, `${rel}: no CollectionPage`);
    assert.equal(page.isPartOf["@type"], "WebSite", `${rel}: isPartOf must be the directory WebSite`);
    assert.equal(page.isPartOf["@id"], `${BASE}/#website`, `${rel}: the standalone build rehomes this WebSite node to suedeai.directory`);
    assert.equal(page.mainEntity["@type"], "ItemList");
    assert.equal(page.mainEntity.numberOfItems, page.mainEntity.itemListElement.length);
    const bc = nodes.find((n) => n["@type"] === "BreadcrumbList");
    assert.equal(bc.itemListElement.at(-1).item, `${BASE}/${rel}`);
    assert.match(html, new RegExp(`<link rel="canonical" href="${NEW}/${rel.replace(/^directory\//, "")}">`), `${rel}: canonical on suedeai.directory`);
  }
});

test("every ranked skill page links back to its task pages and alternatives page", () => {
  for (const t of published) {
    for (const s of t.rows.filter((x) => x.featured)) {
      const rel = skillRel(s);
      assert.ok(links(rel, read(rel)).has(taskRel(t)), `${rel}: no "Also ranked in" link to ${taskRel(t)}`);
    }
  }
  for (const a of alternatives) {
    const rel = skillRel(a.s);
    assert.ok(links(rel, read(rel)).has(altRel(a.s)), `${rel}: no link to its alternatives page`);
  }
});

test("task pages are linked from the hub, the task index and their category pages", () => {
  const hub = links("directory/", read("directory/"));
  const index = links("directory/for/", read("directory/for/"));
  assert.ok(hub.has("directory/for/"), "hub lacks the task index");
  for (const t of published) {
    assert.ok(hub.has(taskRel(t)), `hub lacks ${t.job.id}`);
    assert.ok(index.has(taskRel(t)), `task index lacks ${t.job.id}`);
    for (const c of new Set(t.rows.map((s) => s.category))) {
      assert.ok(links(`directory/${c}/`, read(`directory/${c}/`)).has(taskRel(t)), `category ${c} lacks ${t.job.id}`);
    }
  }
});

test("alternatives pages compare at least three full-page peers from other publishers", () => {
  assert.ok(alternatives.length > 0, "expected alternatives pages");
  const built = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      if (e.name === "alternatives") built.push(path.relative(docs, path.join(dir, e.name)).split(path.sep).join("/") + "/");
      else walk(path.join(dir, e.name));
    }
  };
  walk(path.join(docs, "directory"));
  assert.deepEqual(built.sort(), alternatives.map((a) => altRel(a.s)).sort(), "built alternatives pages match the plan");
  for (const a of alternatives) {
    assert.ok(a.s.featured && a.s.score >= 80, `${a.s.id}: alternatives pages are for full pages scoring 80+`);
    assert.ok(a.peers.length >= 3, `${a.s.id}: ${a.peers.length} peers`);
    for (const o of a.peers) {
      assert.ok(o.featured && o.repo_slug !== a.s.repo_slug && o.category === a.s.category, `${a.s.id}: ${o.id} is not a same-category peer from another repository`);
    }
    const html = read(altRel(a.s));
    assert.match(h1(html), /^What are the best alternatives to .+\?$/);
    assert.match(title(html), /Alternatives/);
    const answer = decode((html.match(/<p class="answer" id="answer">([\s\S]*?)<\/p>/) || [])[1] || "");
    assert.ok(words(answer) >= 40 && words(answer) <= 60, `${a.s.id}: direct answer is ${words(answer)} words`);
    assert.ok(visibleFaq(html).length >= 3 && visibleFaq(html).length <= 4, `${a.s.id}: expected 3 or 4 questions`);
  }
});

test("new pages sit in the directory sitemap and llms.txt names every task page", () => {
  const xml = fs.readFileSync(path.join(docs, "directory-sitemap.xml"), "utf8");
  const entries = new Map([...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>[^<]+<\/lastmod>\s*<changefreq>([^<]+)<\/changefreq>\s*<priority>([^<]+)<\/priority>/g)].map((m) => [m[1], m[3]]));
  for (const rel of newPages) assert.ok(entries.has(`${BASE}/${rel}`), `${rel} missing from docs/directory-sitemap.xml`);
  for (const t of published) assert.equal(entries.get(`${BASE}/${taskRel(t)}`), "0.8", `${t.job.id}: task pages share the category tier`);
  for (const a of alternatives) assert.equal(entries.get(`${BASE}/${altRel(a.s)}`), "0.6");
  const llms = fs.readFileSync(path.join(docs, "llms.txt"), "utf8");
  assert.ok(llms.includes(`](${BASE}/directory/for/)`), "llms.txt lacks the task index");
  for (const t of published) assert.ok(llms.includes(`](${BASE}/${taskRel(t)})`), `llms.txt lacks ${t.job.id}`);
});

test("every full skill page carries a Directory summary above the author's words and a whole-sentence meta", () => {
  const metas = new Map();
  let withClaudeCode = 0;
  for (const s of skills.filter((x) => x.featured)) {
    const html = read(skillRel(s));
    const summary = html.indexOf('id="summary"');
    assert.ok(summary > 0, `${s.id}: no Directory summary`);
    assert.ok(summary < html.indexOf('id="author-title"'), `${s.id}: Directory summary must sit above the author quote`);
    const text = decode((html.slice(summary).match(/<p>([\s\S]*?)<\/p>/) || [])[1] || "");
    assert.ok(text.includes(`${s.score}/100, grade ${s.grade}`), `${s.id}: summary must state the score`);
    assert.ok(text.includes("Claude Code"), `${s.id}: summary must name Claude Code`);
    // The first sentence restates the editors' summary; the rest is the directory's own copy.
    const own = text.slice(text.indexOf(" Listed in "));
    assert.ok(own.length > 0 && text.indexOf(" Listed in ") > 0, `${s.id}: summary must name its category`);
    assert.doesNotMatch(own, /—|\bdelve|game-changer|\bunlock|\belevate|\bseamless|\blandscape\b|\btapestry\b|\bmoreover\b/i, `${s.id}: banned wording`);
    const d = meta(html);
    assert.ok(d.length >= 70 && d.length <= 155, `${s.id}: meta is ${d.length} characters`);
    assert.doesNotMatch(d, /…/, `${s.id}: meta cut mid-sentence`);
    if (d.includes("Claude Code")) withClaudeCode++;
    metas.set(d, [...(metas.get(d) || []), s.id]);
  }
  assert.deepEqual([...metas].filter(([, v]) => v.length > 1), [], "duplicate skill metas");
  assert.ok(withClaudeCode > skills.filter((x) => x.featured).length / 3, `only ${withClaudeCode} skill metas name Claude Code`);
});

test("new page copy avoids em dashes and the banned AI-tell words", () => {
  const banned = /—|\bdelve|game-changer|\bunlock|\belevate|\bseamless|\blandscape\b|\btapestry\b|\bmoreover\b|it's important to note/i;
  for (const rel of newPages) {
    const html = read(rel);
    const main = (html.match(/<main\b[\s\S]*<\/main>/) || [""])[0];
    // Only Suede AI's own sentences: quoted third-party summaries sit in table cells.
    const own = main.replace(/<td class="desc">[\s\S]*?<\/td>/g, "").replace(/<[^>]+>/g, " ");
    assert.doesNotMatch(decode(own), banned, `${rel}: banned wording`);
    assert.match(main, /SuedeAI\.directory|Suede Skill Check/, `${rel}: names the directory or its score`);
  }
});
