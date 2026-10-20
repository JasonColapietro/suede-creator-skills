// Two indexable directory pages must not share an H1. Before 2026-10-18 the
// skill pages rendered "<name> agent skill", so a skill name published by two
// owners (code-review, skill-creator, playwright-skill and five more) produced
// eight pairs of identical headings competing for the same query.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "docs", "directory");

function* pages(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* pages(p);
    else if (e.name === "index.html") yield p;
  }
}

test("indexable directory pages have unique H1s", () => {
  const seen = new Map();
  for (const file of pages(dirRoot)) {
    const html = fs.readFileSync(file, "utf8");
    if (/<meta name="robots" content="[^"]*noindex/i.test(html)) continue;
    const h1 = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
    if (!h1) continue;
    const text = h1.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    seen.set(text, [...(seen.get(text) || []), path.relative(dirRoot, file)]);
  }
  const dups = [...seen].filter(([, files]) => files.length > 1);
  assert.deepEqual(dups, [], `duplicate H1s: ${JSON.stringify(dups.slice(0, 5))}`);
});
