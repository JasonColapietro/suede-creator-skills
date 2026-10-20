// Every indexable skill page is a spoke of the /skills/ hub and must link to
// its neighbours, not only back up to the catalog. Before
// scripts/build-related-skills.mjs, 48 of the 76 skill pages linked to no
// other skill page.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSkills, computeRelated, renderPage, renderSection, MAX_RELATED } from "../scripts/build-related-skills.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skills = loadSkills(repoRoot);
const SIBLING_HREF = /href="(?:\.\/)?([a-z0-9-]+)\.html"/g;

test("every indexable skill page links at least two other skill pages", () => {
  const thin = [];
  for (const [name, s] of skills) {
    const html = fs.readFileSync(s.page, "utf8");
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    const linked = new Set([...main.matchAll(SIBLING_HREF)].map((m) => m[1]).filter((n) => n !== name && skills.has(n)));
    if (linked.size < 2) thin.push(`${name} (${linked.size})`);
  }
  assert.deepEqual(thin, [], `skill pages with fewer than two sibling links: ${thin.join(", ")}`);
});

test("related lists name only real skill pages, never the page itself, capped", () => {
  for (const [name, list] of computeRelated(skills)) {
    assert.ok(list.length <= MAX_RELATED, name);
    assert.ok(!list.includes(name), `${name} lists itself`);
    for (const n of list) assert.ok(skills.has(n), `${name} lists missing page ${n}`);
  }
});

test("rendering is idempotent and keeps hand-written sections", () => {
  const related = computeRelated(skills);
  for (const [name, s] of skills) {
    const once = renderPage(s.html, renderSection(related.get(name), skills));
    assert.equal(renderPage(once, renderSection(related.get(name), skills)), once, name);
  }
  const hand = "<main>\n      <section><h2>Related skills</h2><p>x</p></section>\n      <section class=\"install-block\"></section>\n    </main>";
  assert.equal(renderPage(hand, "GENERATED\n"), hand);
});
