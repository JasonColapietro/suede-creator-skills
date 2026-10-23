#!/usr/bin/env node
// Writes a redirect stub at docs/skills/<slug>.html for every skill that left
// the public pack, from the map in scripts/retired-skills.json.
//
// GitHub Pages cannot send a server-side 301, so each stub combines the
// signals search engines honor on a static host: a zero-delay meta refresh,
// rel=canonical to the successor page, and a JS location.replace for
// browsers. The stub carries noindex, so generate-sitemap.mjs and
// build-related-skills.mjs both skip it.
//
// Usage:
//   node scripts/build-retired-skill-pages.mjs          # write the stubs
//   node scripts/build-retired-skill-pages.mjs --check  # exit 1 if a stub would change

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = "https://skills.suedeai.ai";

export function loadRetired(root = repoRoot) {
  const data = JSON.parse(fs.readFileSync(path.join(root, "scripts", "retired-skills.json"), "utf8"));
  return data.pages;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderStub(slug, { target, reason }) {
  const url = target ? `${BASE_URL}/skills/${target}.html` : `${BASE_URL}/skills/`;
  const label = target ?? "the skill catalog";
  const title = target ? `${slug} moved to ${target}` : `${slug} left the Suede AI skill pack`;
  const sentence = target
    ? `The ${slug} skill ${reason} ${target}.`
    : `The ${slug} skill ${reason}.`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="${url}">
    <meta http-equiv="refresh" content="0; url=${url}">
    <link rel="icon" href="../assets/favicon-64.png" type="image/png">
    <link rel="stylesheet" href="../assets/site.css">
    <link rel="stylesheet" href="../assets/skill.css">
    <script>location.replace(${JSON.stringify(url)} + location.hash);</script>
  </head>
  <body>
    <p>${esc(sentence)} <a href="${url}">Continue to ${esc(label)}</a>.</p>
  </body>
</html>
`;
}

function run() {
  const check = process.argv.includes("--check");
  const retired = loadRetired();
  const skillsDir = path.join(repoRoot, "skills");
  const stale = [];
  for (const [slug, entry] of Object.entries(retired)) {
    if (fs.existsSync(path.join(skillsDir, slug, "SKILL.md"))) {
      console.error(`${slug} is listed in scripts/retired-skills.json but skills/${slug}/SKILL.md still exists`);
      process.exit(1);
    }
    if (entry.target && !fs.existsSync(path.join(skillsDir, entry.target, "SKILL.md"))) {
      console.error(`${slug} redirects to ${entry.target}, which is not a skill in the pack`);
      process.exit(1);
    }
    const file = path.join(repoRoot, "docs", "skills", `${slug}.html`);
    const next = renderStub(slug, entry);
    const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
    if (current === next) continue;
    stale.push(slug);
    if (!check) fs.writeFileSync(file, next);
  }
  if (check && stale.length) {
    console.error(`Retired skill stubs are stale: ${stale.join(", ")}`);
    console.error("Run: node scripts/build-retired-skill-pages.mjs");
    process.exit(1);
  }
  const total = Object.keys(retired).length;
  console.log(check ? `Retired skill stubs are up to date (${total} pages).` : `Wrote ${stale.length} of ${total} retired skill stubs.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
