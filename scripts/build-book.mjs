#!/usr/bin/env node
// Concatenates book/ into a single readable BOOK.md.
// Order: front matter, chapters 01..NN, appendices A1..
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bookDir = path.join(repoRoot, "book");

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

fs.writeFileSync(path.join(bookDir, "BOOK.md"), out);
const words = out.split(/\s+/).filter(Boolean).length;
console.log(`book/BOOK.md written — ${files.length} files, ${words.toLocaleString()} words`);
