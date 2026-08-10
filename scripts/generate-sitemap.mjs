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

const BASE_URL = "https://skills.suedeai.ai";

function ownsGitHistory() {
  const result = spawnSync(
    "git",
    ["-C", repoRoot, "rev-parse", "--show-toplevel"],
    { encoding: "utf8" }
  );
  if (result.status !== 0) return false;
  return path.resolve(result.stdout.trim()) === repoRoot;
}

const hasOwnGitHistory = ownsGitHistory();

function hasCompleteHistory() {
  if (!hasOwnGitHistory) return false;
  const result = spawnSync(
    "git",
    ["-C", repoRoot, "rev-parse", "--is-shallow-repository"],
    { encoding: "utf8" }
  );
  return result.status === 0 && result.stdout.trim() === "false";
}

const canVerifyGitDates = hasCompleteHistory();

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
  "suede-ci-gate",
  "suede-codex-fleet",
];
const FLAGSHIP_PRIORITY = "0.85";
const SKILL_DEFAULT_PRIORITY = "0.8";
const SKILL_CHANGEFREQ = "weekly";

const BLOG_INDEX_PRIORITY = "0.7";
const BLOG_INDEX_CHANGEFREQ = "weekly";
const BLOG_POST_PRIORITY = "0.7";
const BLOG_POST_CHANGEFREQ = "monthly";

// The book index sits with the guide and skill index as a primary entry point;
// chapters are long-lived reference pages that change only when the Markdown
// they are generated from changes.
const BOOK_INDEX_PRIORITY = "0.85";
const BOOK_INDEX_CHANGEFREQ = "monthly";
const BOOK_CHAPTER_PRIORITY = "0.7";
const BOOK_CHAPTER_CHANGEFREQ = "monthly";

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
  if (!hasOwnGitHistory) {
    return new Date().toISOString().slice(0, 10);
  }
  const status = spawnSync(
    "git",
    ["-C", repoRoot, "status", "--porcelain", "--", relPath],
    { encoding: "utf8" }
  );
  if (status.status === 0 && status.stdout.trim()) {
    return new Date().toISOString().slice(0, 10);
  }
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

  // docs/book/ is generated by scripts/build-book-site.mjs, so enumerate it
  // from disk the same way skills and blog posts are. A chapter added to the
  // book lands in the sitemap on the next run without a manual edit here.
  const bookIndexAbs = path.join(docsRoot, "book", "index.html");
  if (fs.existsSync(bookIndexAbs) && !isNoindex(bookIndexAbs)) {
    entries.push({
      loc: `${BASE_URL}/book/`,
      lastmod: lastCommitDate(path.join("docs", "book", "index.html")),
      changefreq: BOOK_INDEX_CHANGEFREQ,
      priority: BOOK_INDEX_PRIORITY,
    });

    const chapters = fs
      .readdirSync(path.join(docsRoot, "book"))
      .filter((f) => f.endsWith(".html") && f !== "index.html")
      .filter((f) => !isNoindex(path.join(docsRoot, "book", f)))
      .sort((a, b) => a.localeCompare(b));

    for (const file of chapters) {
      entries.push({
        loc: `${BASE_URL}/book/${file}`,
        lastmod: lastCommitDate(path.join("docs", "book", file)),
        changefreq: BOOK_CHAPTER_CHANGEFREQ,
        priority: BOOK_CHAPTER_PRIORITY,
      });
    }

    // Search engines index PDFs, and the print edition is a real destination
    // rather than a byproduct, so list it beside the chapters it duplicates.
    const printEdition = path.join(docsRoot, "book", "s-tier.pdf");
    if (fs.existsSync(printEdition)) {
      entries.push({
        loc: `${BASE_URL}/book/s-tier.pdf`,
        lastmod: lastCommitDate(path.join("docs", "book", "s-tier.pdf")),
        changefreq: BOOK_CHAPTER_CHANGEFREQ,
        priority: BOOK_CHAPTER_PRIORITY,
      });
    }
  }

  return entries;
}

// A sitemap regenerated after a squash merge differs only in <lastmod>, so the
// check separates structural drift (a URL, priority, or changefreq that no
// longer matches the site — always a failure) from date lag (tolerated briefly,
// failed once it rots). Grace is deliberately short: long enough to absorb a
// merge, far too short to let recrawl signal go stale unnoticed.
const LASTMOD_GRACE_DAYS = 30;

function parseSitemapEntries(xml) {
  const parsed = new Map();
  const blockPattern = /<url>([\s\S]*?)<\/url>/g;
  let block;
  while ((block = blockPattern.exec(xml)) !== null) {
    const field = (name) => (block[1].match(new RegExp(`<${name}>([^<]*)</${name}>`)) || [])[1];
    const loc = field("loc");
    if (loc) parsed.set(loc, { lastmod: field("lastmod"), changefreq: field("changefreq"), priority: field("priority") });
  }
  return parsed;
}

function daysBetween(earlier, later) {
  const from = Date.parse(`${earlier}T00:00:00Z`);
  const to = Date.parse(`${later}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return Number.POSITIVE_INFINITY;
  return Math.round((to - from) / 86_400_000);
}

function compareSitemaps(currentXml, expectedEntries) {
  const committed = parseSitemapEntries(currentXml);
  const structural = [];
  const staleWithinGrace = [];
  const staleBeyondGrace = [];
  const expectedLocs = new Set();

  for (const entry of expectedEntries) {
    expectedLocs.add(entry.loc);
    const found = committed.get(entry.loc);
    if (!found) {
      structural.push(`missing URL: ${entry.loc}`);
      continue;
    }
    if (found.changefreq !== entry.changefreq || found.priority !== entry.priority) {
      structural.push(`changefreq/priority drift: ${entry.loc}`);
      continue;
    }
    if (found.lastmod === entry.lastmod) continue;
    const lag = daysBetween(found.lastmod, entry.lastmod);
    if (lag < 0 || !Number.isFinite(lag)) {
      // Committed date is newer than Git, or unparseable — a hand edit, not lag.
      structural.push(`lastmod is not derived from Git history: ${entry.loc}`);
    } else if (lag > LASTMOD_GRACE_DAYS) {
      staleBeyondGrace.push(`${entry.loc} (${lag} days behind)`);
    } else {
      staleWithinGrace.push(entry.loc);
    }
  }
  for (const loc of committed.keys()) {
    if (!expectedLocs.has(loc)) structural.push(`stale URL no longer on the site: ${loc}`);
  }
  return { structural, staleWithinGrace, staleBeyondGrace };
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
  if (!canVerifyGitDates) {
    const reason = hasOwnGitHistory
      ? "shallow checkout has incomplete Git history"
      : "packaged checkout has no repository-local Git history";
    console.log(`Sitemap freshness check skipped: ${reason}.`);
    process.exit(0);
  }
  const drift = compareSitemaps(current, entries);
  if (drift.structural.length > 0) {
    console.error(
      `docs/sitemap.xml is out of date (${entries.length} URLs expected). Run: node scripts/generate-sitemap.mjs`
    );
    for (const problem of drift.structural) console.error(`  ${problem}`);
    process.exit(1);
  }
  if (drift.staleBeyondGrace.length > 0) {
    console.error(
      `docs/sitemap.xml has <lastmod> values more than ${LASTMOD_GRACE_DAYS} days behind Git. Run: node scripts/generate-sitemap.mjs`
    );
    for (const problem of drift.staleBeyondGrace) console.error(`  ${problem}`);
    process.exit(1);
  }
  if (drift.staleWithinGrace.length > 0) {
    // A squash merge gives every file it touched a new commit date, so the
    // committed sitemap goes stale the instant the merge lands — and no
    // pre-merge check can catch it, because the commit that changes the date
    // is created by the merge itself. Failing here would red main on every
    // docs-touching PR. Structure is still enforced exactly; only a short
    // date lag is tolerated, and it is reported rather than hidden.
    console.log(
      `docs/sitemap.xml <lastmod> lags Git by up to ${LASTMOD_GRACE_DAYS} days on ${drift.staleWithinGrace.length} URL(s) — within grace. Run: node scripts/generate-sitemap.mjs to refresh.`
    );
  }
  console.log(`docs/sitemap.xml is up to date (${entries.length} URLs).`);
  process.exit(0);
}

fs.writeFileSync(sitemapPath, generated);
console.log(`Wrote docs/sitemap.xml with ${entries.length} URLs.`);
