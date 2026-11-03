// Stack articles on SuedeAI.directory are long-form guides: each published
// stack answers first, explains every pick, offers alternatives and closes with
// a FAQ that ships as FAQPage structured data. Reads directory/editorial/ and
// the committed output in docs/directory/. Joined to `npm run test:directory`
// through an import in tests/test_directory_seo.mjs, since package.json is
// pinned by the first-party intake receipt. Scores and install counts are not
// pinned here: they move with every refresh, and each article names its
// snapshot date.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const doc = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "editorial", "stacks.json"), "utf8"));
const published = doc.stacks.filter((s) => s.status === "published");
const article = (st) => fs.readFileSync(path.join(repoRoot, st.source), "utf8");
const page = (st) => fs.readFileSync(path.join(repoRoot, "docs", "directory", "stacks", st.id, "index.html"), "utf8");
const jsonld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const SECTIONS = ["## The stack", "## Who this stack is for", "## The Suede AI skill built for this job", "## The skills, one by one", "## How to use the stack together", "## Install the stack", "## Alternatives worth knowing", "## Common mistakes", "## Licenses, costs and checks before you install", "## Related topics and stacks", "## FAQ"];

test("the directory publishes at least twenty stacks, each with a unique title and H1", () => {
  assert.ok(published.length >= 20, `only ${published.length} published stacks`);
  for (const k of ["id", "title", "h1"]) assert.equal(new Set(published.map((s) => s[k])).size, published.length, `duplicate ${k}`);
});

for (const st of published) {
  test(`stack ${st.id} is a long-form article with every section, in order`, () => {
    const md = article(st);
    const words = md.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
    assert.ok(words >= 2000, `${st.id}: ${words} words, want 2,000 or more`);
    const lines = md.split("\n");
    let last = -1;
    for (const h of SECTIONS) {
      const i = lines.indexOf(h);
      assert.ok(i > last, `${st.id}: "${h}" missing or out of order`);
      last = i;
    }
    assert.match(md, /^\*\*Short answer:\*\* /m, `${st.id}: no short answer`);
    // Suede AI's own skill gets one disclosed section and no place in the ranking.
    const sAt = lines.indexOf("## The Suede AI skill built for this job");
    const section = lines.slice(sAt, lines.findIndex((l, k) => k > sAt && l.startsWith("## "))).join("\n");
    assert.match(section, new RegExp(`\\[${st.suede.skill}\\]\\(`), `${st.id}: the Suede AI section must link ${st.suede.skill}`);
    assert.doesNotMatch(section, /\b\d{1,2}\/100\b/, `${st.id}: the Suede AI section gives no score`);
    const table = lines.slice(lines.indexOf("## The stack"), lines.indexOf("## Who this stack is for")).join("\n").replace(/\]\(https?:[^)\s]+\)/g, "]()");
    assert.doesNotMatch(table, /suede/i, `${st.id}: Suede AI's skill must not be in the ranking table`);
    const faqs = lines.slice(lines.indexOf("## FAQ")).filter((l) => /^### .+\?$/.test(l)).length;
    assert.ok(faqs >= 6, `${st.id}: ${faqs} FAQ questions, want 6 or more`);
  });

  test(`stack ${st.id} ships its picks and its FAQ as structured data`, () => {
    const md = article(st), ld = jsonld(page(st));
    const lines = md.split("\n");
    const from = lines.indexOf("## The stack"), to = lines.indexOf("## Who this stack is for");
    const rows = lines.slice(from, to).filter((l) => l.startsWith("| ["));
    const list = ld.find((n) => n["@type"] === "ItemList");
    assert.ok(list, `${st.id}: no ItemList`);
    assert.equal(list.numberOfItems, rows.length, `${st.id}: the ItemList must hold the stack table only, not the alternatives`);
    const faq = ld.find((n) => n["@type"] === "FAQPage");
    assert.ok(faq, `${st.id}: no FAQPage`);
    const questions = lines.slice(lines.indexOf("## FAQ")).filter((l) => l.startsWith("### ")).map((l) => l.slice(4));
    assert.deepEqual(faq.mainEntity.map((q) => q.name), questions, `${st.id}: FAQPage questions must match the visible ones`);
    for (const q of faq.mainEntity) assert.ok(q.acceptedAnswer.text.length > 60 && !/\]\(|\*\*/.test(q.acceptedAnswer.text), `${st.id}: answer to "${q.name}" is empty or still Markdown`);
  });
}

test("the stacks hub lists every published stack", () => {
  const hub = fs.readFileSync(path.join(repoRoot, "docs", "directory", "stacks", "index.html"), "utf8");
  for (const st of published) assert.ok(hub.includes(`href="${st.id}/"`), `hub misses ${st.id}`);
});
