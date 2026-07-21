#!/usr/bin/env node
// Regenerates docs/sitemap.xml from the pages actually on disk, with each
// <lastmod> pulled from that file's real git history. Run it after any docs/
// change so search engines see accurate recrawl signal instead of a sitemap
// that quietly falls behind (root cause of the 2026-07-21 staleness fix).
//
// Usage:
//   node scripts/generate-sitemap.mjs          # write docs/sitemap.xml
//   node scripts/generate-sitemap.mjs --check  # exit 1 if the file would change

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const docsRoot = path.join(repoRoot, "docs");
const sitemapPath = path.join(docsRoot, "sitemap.xml");
const checkOnly = process.argv.includes("--check");

const BASE_URL = "https://jasoncolapietro.github.io/suede-creator-skills";

// Priority is an editorial signal, not something derivable from disk, so it
// stays a deliberate list. Anything not named here (including every new
// skill page dropped into docs/skills/) defaults to the tier below rather
// than requiring a manual sitemap edit.
const FIXED_PAGES = [
  { file: "index.html", loc: "/", priority: "1.0", changefreq: "weekly" },
  { file: "guide.html", loc: "/guide.html", priority: "0.9", changefreq: "weekly" },
  { file: "skills/index.html", loc: "/skills/", priority: "0.9", changefreq: "weekly" },
  { file: "copy.html", loc: "/copy.html", priority: "0.8", changefreq: "weekly" },
  { file: "plugins.html", loc: "/plugins.html", priority: "0.8", changefreq: "weekly" },
];

const FLAGSHIP_SKILLS = [
  "suede-workflow-skills",
  "johnny-suede-write",
  "johnny-suede-design",
  "suede-visibility-grader",
  "suede-ai-eval",
  "suede-agent-teams",
  "suede-code-grader",
  "suede-rights-passport",
  "suede-release-linter",
  "suede-code",
  "suede-code-review",
  "suede-ship-gate",
  "suede-codex-fleet",
];
const FLAGSHIP_PRIORITY = "0.85";
const SKILL_DEFAULT_PRIORITY = "0.8";
const SKILL_CHANGEFREQ = "weekly";

const BLOG_INDEX_PRIORITY = "0.7";
const BLOG_INDEX_CHANGEFREQ = "weekly";
const BLOG_POST_PRIORITY = "0.7";
const BLOG_POST_CHANGEFREQ = "monthly";

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function isNoindex(absPath) {
  if (!fs.existsSync(absPath)) return false;
  const text = readText(absPath);
  const match = text.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  return !!match && /noindex/i.test(match[1]);
}

function lastCommitDate(relPath) {
  const result = spawnSync(
    "git",
    ["-C", repoRoot, "log", "-1", "--format=%ad", "--date=short", "--", relPath],
    { encoding: "utf8" }
  );
  const date = result.stdout.trim();
  if (date) return date;
  // Uncommitted or untracked (new page not yet committed): fall back to
  // today so the generated sitemap is still a well-formed date, not blank.
  return new Date().toISOString().slice(0, 10);
}

function listSkillFiles() {
  const skillsDir = path.join(docsRoot, "skills");
  return fs
    .readdirSync(skillsDir)
    .filter((f) => f.endsWith(".html") && f !== "index.html")
    .filter((f) => !isNoindex(path.join(skillsDir, f)))
    .map((f) => f.replace(/\.html$/, ""))
    .sort((a, b) => a.localeCompare(b));
}

function listBlogPostFiles() {
  const blogDir = path.join(docsRoot, "blog");
  if (!fs.existsSync(blogDir)) return [];
  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith(".html") && f !== "index.html")
    .filter((f) => !isNoindex(path.join(blogDir, f)))
    .sort((a, b) => a.localeCompare(b));
}

function buildEntries() {
  const entries = [];

  for (const page of FIXED_PAGES) {
    const abs = path.join(docsRoot, page.file);
    if (isNoindex(abs)) continue;
    entries.push({
      loc: `${BASE_URL}${page.loc}`,
      lastmod: lastCommitDate(path.join("docs", page.file)),
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  const skillNames = listSkillFiles();
  const flagship = FLAGSHIP_SKILLS.filter((name) => skillNames.includes(name));
  const rest = skillNames.filter((name) => !FLAGSHIP_SKILLS.includes(name));

  for (const name of [...flagship, ...rest]) {
    const relPath = path.join("docs", "skills", `${name}.html`);
    entries.push({
      loc: `${BASE_URL}/skills/${name}.html`,
      lastmod: lastCommitDate(relPath),
      changefreq: SKILL_CHANGEFREQ,
      priority: FLAGSHIP_SKILLS.includes(name) ? FLAGSHIP_PRIORITY : SKILL_DEFAULT_PRIORITY,
    });
  }

  const blogIndexAbs = path.join(docsRoot, "blog", "index.html");
  if (fs.existsSync(blogIndexAbs) && !isNoindex(blogIndexAbs)) {
    entries.push({
      loc: `${BASE_URL}/blog/`,
      lastmod: lastCommitDate(path.join("docs", "blog", "index.html")),
      changefreq: BLOG_INDEX_CHANGEFREQ,
      priority: BLOG_INDEX_PRIORITY,
    });
  }

  for (const file of listBlogPostFiles()) {
    entries.push({
      loc: `${BASE_URL}/blog/${file}`,
      lastmod: lastCommitDate(path.join("docs", "blog", file)),
      changefreq: BLOG_POST_CHANGEFREQ,
      priority: BLOG_POST_PRIORITY,
    });
  }

  return entries;
}

function renderXml(entries) {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const entries = buildEntries();
const generated = renderXml(entries);
const current = fs.existsSync(sitemapPath) ? readText(sitemapPath) : "";

if (checkOnly) {
  if (generated !== current) {
    console.error(
      `docs/sitemap.xml is out of date (${entries.length} URLs expected). Run: node scripts/generate-sitemap.mjs`
    );
    process.exit(1);
  }
  console.log(`docs/sitemap.xml is up to date (${entries.length} URLs).`);
  process.exit(0);
}

fs.writeFileSync(sitemapPath, generated);
console.log(`Wrote docs/sitemap.xml with ${entries.length} URLs.`);
