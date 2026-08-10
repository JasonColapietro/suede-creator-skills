#!/usr/bin/env node
// Concatenates book/ into a single readable BOOK.md.
// Order: front matter, chapters 01..NN, appendices A1..
//
// Usage:
//   node scripts/build-book.mjs          # write book/BOOK.md
//   node scripts/build-book.mjs --check  # exit 1 if BOOK.md would change
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bookDir = path.join(repoRoot, "book");
const checkOnly = process.argv.includes("--check");

const rank = (name) => {
  if (name.startsWith("00-")) return 0;
  if (/^\d\d-/.test(name)) return 1;
  if (/^A\d-/.test(name)) return 2;
  return 3;
};

const files = fs
  .readdirSync(bookDir)
  .filter((f) => f.endsWith(".md") && !["STYLE.md", "README.md", "BOOK.md"].includes(f))
  .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

const parts = files.map((f) => fs.readFileSync(path.join(bookDir, f), "utf8").trim());
const out = `${parts.join("\n\n---\n\n")}\n`;

const bookPath = path.join(bookDir, "BOOK.md");
const words = out.split(/\s+/).filter(Boolean).length;

// docs/book/ already fails validation when it drifts from the chapters. BOOK.md
// is the other generated view of the same source and had no such guard, so an
// edited chapter could ship with the single-file read silently stale.
if (checkOnly) {
  const existing = fs.existsSync(bookPath) ? fs.readFileSync(bookPath, "utf8") : null;
  if (existing !== out) {
    console.error("book/BOOK.md is stale — run: node scripts/build-book.mjs");
    process.exit(1);
  }
  console.log(`book/BOOK.md is current — ${files.length} files, ${words.toLocaleString()} words`);
} else {
  fs.writeFileSync(bookPath, out);
  console.log(`book/BOOK.md written — ${files.length} files, ${words.toLocaleString()} words`);
}
