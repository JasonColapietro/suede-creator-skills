import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { PAGES, repoRoot } from "./book.mjs";

export const PDF_PROVENANCE_RELATIVE = "docs/book/s-tier.pdf.provenance.json";

const digestFile = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

export function bookPdfInputDigest(root = repoRoot) {
  const hash = createHash("sha256");
  const inputs = [
    "scripts/build-book-pdf.mjs",
    "scripts/lib/book.mjs",
    "scripts/lib/book-pdf-provenance.mjs",
    ...PAGES.map((page) => path.posix.join("book", page.file)),
  ];
  const skillNames = fs
    .readdirSync(path.join(root, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  inputs.push(...skillNames.map((name) => path.posix.join("skills", name, "SKILL.md")));

  for (const relative of inputs) {
    const bytes = fs.readFileSync(path.join(root, relative));
    hash.update(relative);
    hash.update("\0");
    hash.update(String(bytes.length));
    hash.update("\0");
    hash.update(bytes);
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function bookPdfDigest(root = repoRoot) {
  return digestFile(path.join(root, "docs", "book", "s-tier.pdf"));
}
