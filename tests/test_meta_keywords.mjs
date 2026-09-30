// Guard: every indexable page on skills.suedeai.ai ships a non-empty
// <meta name="keywords"> that matches scripts/lib/seo-keywords.mjs.
// Indexable = has a canonical link and no noindex robots directive.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { SEO_KEYWORDS } from "../scripts/lib/seo-keywords.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = path.join(repoRoot, "docs");

function listHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) return listHtml(abs);
    return entry.name.endsWith(".html") ? [abs] : [];
  });
}

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

function isIndexable(html) {
  if (!/<link\s+rel="canonical"/i.test(html)) return false;
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  return !(robots && /noindex/i.test(robots[1]));
}

function keywordsOf(html) {
  const tags = [...html.matchAll(/<meta\s+name="keywords"\s+content="([^"]*)"\s*\/?>/gi)];
  return { count: tags.length, content: tags.length ? decode(tags[0][1]) : null };
}

const pages = listHtml(docsRoot)
  .map((abs) => ({ rel: path.relative(docsRoot, abs).split(path.sep).join("/"), html: fs.readFileSync(abs, "utf8") }))
  .filter((p) => isIndexable(p.html));

test("there are indexable pages to check", () => {
  assert.ok(pages.length > 50, `expected the full site, found ${pages.length} indexable pages`);
});

test("every indexable page has exactly one non-empty keywords tag from the map", () => {
  const failures = [];
  for (const { rel, html } of pages) {
    const expected = SEO_KEYWORDS[rel];
    const { count, content } = keywordsOf(html);
    if (!expected) failures.push(`${rel}: no entry in scripts/lib/seo-keywords.mjs`);
    else if (count !== 1) failures.push(`${rel}: expected one <meta name="keywords">, found ${count}`);
    else if (!content || !content.trim()) failures.push(`${rel}: keywords tag is empty`);
    else if (content !== expected.join(", ")) failures.push(`${rel}: keywords tag is out of sync with the map`);
  }
  assert.deepEqual(failures, [], `\n${failures.join("\n")}\nRun: node scripts/apply-seo-keywords.mjs && node scripts/build-book-site.mjs`);
});

test("every map entry points at an indexable page", () => {
  const indexable = new Set(pages.map((p) => p.rel));
  const orphans = Object.keys(SEO_KEYWORDS).filter((rel) => !indexable.has(rel));
  assert.deepEqual(orphans, [], `map entries with no indexable page: ${orphans.join(", ")}`);
});

test("keyword lists follow the rules: 4-10 unique, non-empty terms", () => {
  const failures = [];
  for (const [rel, list] of Object.entries(SEO_KEYWORDS)) {
    if (list.length < 4 || list.length > 10) failures.push(`${rel}: ${list.length} terms (want 4-10)`);
    const seen = new Set();
    for (const term of list) {
      if (!term.trim() || term !== term.trim()) failures.push(`${rel}: blank or padded term "${term}"`);
      if (term.includes(",")) failures.push(`${rel}: term contains a comma "${term}"`);
      const key = term.toLowerCase();
      if (seen.has(key)) failures.push(`${rel}: duplicate term "${term}"`);
      seen.add(key);
      if (/suede labs ai/i.test(term)) failures.push(`${rel}: use "Suede AI", not "${term}"`);
    }
  }
  assert.deepEqual(failures, [], `\n${failures.join("\n")}`);
});

test("apply-seo-keywords --check passes", () => {
  const run = spawnSync(process.execPath, [path.join(repoRoot, "scripts", "apply-seo-keywords.mjs"), "--check"], {
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr || run.stdout);
});
