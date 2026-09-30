#!/usr/bin/env node
// Writes <meta name="keywords"> into every hand-authored page listed in
// scripts/lib/seo-keywords.mjs, directly after the page's meta description.
// docs/book/ is skipped: scripts/build-book-site.mjs renders it from the map.
//
// Usage:
//   node scripts/apply-seo-keywords.mjs          # write the tags
//   node scripts/apply-seo-keywords.mjs --check  # exit 1 if any page would change

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_KEYWORDS } from "./lib/seo-keywords.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = path.join(repoRoot, "docs");
const checkOnly = process.argv.includes("--check");

const escapeAttr = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const KEYWORDS_RE = /^[ \t]*<meta\s+name="keywords"[^>]*>\r?\n/m;
const DESCRIPTION_RE = /^([ \t]*)<meta\s+name="description"[^>]*>\r?\n/m;

export function withKeywords(html, keywords) {
  const content = escapeAttr(keywords.join(", "));
  const stripped = html.replace(KEYWORDS_RE, "");
  const match = stripped.match(DESCRIPTION_RE);
  if (!match) return null;
  const tag = `${match[1]}<meta name="keywords" content="${content}">\n`;
  const at = match.index + match[0].length;
  return stripped.slice(0, at) + tag + stripped.slice(at);
}

const stale = [];
const broken = [];
for (const [page, keywords] of Object.entries(SEO_KEYWORDS)) {
  if (page.startsWith("book/")) continue;
  const file = path.join(docsRoot, page);
  if (!fs.existsSync(file)) {
    broken.push(`${page}: file not found`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const next = withKeywords(html, keywords);
  if (next === null) {
    broken.push(`${page}: no <meta name="description"> to anchor the keywords tag`);
    continue;
  }
  if (next === html) continue;
  stale.push(page);
  if (!checkOnly) fs.writeFileSync(file, next);
}

if (broken.length) {
  console.error(broken.join("\n"));
  process.exit(1);
}
if (checkOnly && stale.length) {
  console.error(
    `${stale.length} page(s) have a missing or stale <meta name="keywords">:\n  ${stale.join("\n  ")}\nRun: node scripts/apply-seo-keywords.mjs`
  );
  process.exit(1);
}
console.log(checkOnly ? "Meta keywords are up to date." : `Updated meta keywords on ${stale.length} page(s).`);
