#!/usr/bin/env node
// Builds the Agent Skills Directory at skills.suedeai.ai/directory/ from
// directory/skills.json (the curated dataset) and directory/categories.json
// (the category copy). Every page under docs/directory/, docs/404.html, the
// directory keyword map and the directory line in docs/llms.txt are generated:
// edit the data or this script, never the output.
//
// Usage:
//   node scripts/build-directory.mjs          # write the generated files
//   node scripts/build-directory.mjs --check  # exit 1 if any generated file would change
//
// The dataset is refreshed by scripts/directory/refresh.sh, which reads public
// GitHub repositories. This build reads only local files.

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { SCORE_METHOD, qualityScore, scorePoints, letterGrade, listed, qualifies, badgePair, badgeMarkdown, badgeHtml, shieldSvg, listingTarget, promotionActive } from "./directory/badges.mjs";
import { featuredProjectsHtml } from "./directory/featured.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = path.join(repoRoot, "docs");
const outRoot = path.join(docsRoot, "directory");
const keywordsPath = path.join(repoRoot, "scripts", "lib", "directory-keywords.json");
const checkOnly = process.argv.includes("--check");

const BASE = "https://skills.suedeai.ai";
const DIR_URL = `${BASE}/directory/`;
const SITE_NAME = "Suede Skills Directory";
const OG_IMAGE = `${BASE}/assets/social/directory-card.png`;
const ISSUE_URL = "https://github.com/JasonColapietro/suede-creator-skills/issues/new?template=directory-listing.yml";
const FULL_TABLE_ROWS = 100;

const datasetBytes = fs.readFileSync(path.join(repoRoot, "directory", "skills.json"));
const data = JSON.parse(datasetBytes.toString("utf8"));
const snapshot = { date: data.generated, sha256: createHash("sha256").update(datasetBytes).digest("hex") };
if (!/^[a-f0-9]{32}$/.test(data.snapshot_id || "")) throw new Error("skills.json: missing refresh snapshot_id");
const categories = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "categories.json"), "utf8"));
const CHECKS = data.checks;
const PROMOTION = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "promotion.json"), "utf8"));
if (typeof PROMOTION.enabled !== "boolean" || !PROMOTION.verifications || typeof PROMOTION.verifications !== "object" || Array.isArray(PROMOTION.verifications)) throw new Error("promotion.json: expected enabled and a verification map");
if (PROMOTION.ends_at !== null && (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(PROMOTION.ends_at) || !Number.isFinite(Date.parse(PROMOTION.ends_at)))) throw new Error("promotion.json: ends_at must be null or a UTC timestamp");
if (SCORE_METHOD !== "graded-v2" || data.score_method !== SCORE_METHOD || CHECKS.map((c) => c.id).join() !== "frontmatter,name_format,name_matches_folder,description_length,description_trigger,concise_body,license,maintained") throw new Error("Unsupported directory score method");
const NOTES = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "notes.json"), "utf8"));
const EDITORIAL = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "featured-projects.json"), "utf8"));

for (const c of categories) {
  if (c.seo_title.length > 60) throw new Error(`categories.json: seo_title over 60 characters for ${c.slug}`);
  if (c.meta.length > 160) throw new Error(`categories.json: meta over 160 characters for ${c.slug}`);
}

// The graded-v2 rubric, component by component, so a skill page can show
// where each point came from. badges.mjs owns the points; the build fails if
// they ever sum to anything other than the published score.
const SCORE_CAP = 99;
const RUBRIC_MAX = 100;
const RUBRIC = [
  { id: "structure", label: "Structural checks", max: 56, rule: "8 points for each of the seven graded checks" },
  { id: "description_length", label: "Description length", max: 5, rule: "5 for 150–600 characters; 3 for 100–900; 1 for 50–1,024" },
  { id: "boundary", label: "Boundary clause", max: 4, rule: "4 when the description says when not to use the skill (“Not for …”, “Do not use …”, “Use … instead”)" },
  { id: "example", label: "Example request", max: 3, rule: "3 when the description quotes an example request (3–60 characters in quotation marks)" },
  { id: "depth", label: "Instruction depth", max: 7, rule: "7 for a SKILL.md body of 500–3,000 words; 4 for 250–4,500; 1 for 100 or more" },
  { id: "references", label: "Reference files", max: 3, rule: "3 when the skill folder ships a references/, reference/ or docs/ folder" },
  { id: "scripts", label: "Bundled scripts", max: 2, rule: "2 when the skill folder ships a scripts/ folder" },
  { id: "recency", label: "Recent maintenance", max: 9, rule: "9 for a repository commit within 30 days of the snapshot; 6 within 90; 3 within 180; 1 within 365" },
  { id: "adoption", label: "Curated-list citations", max: 7, rule: "7 for a repository cited by four or more curated lists; 4 for three; 3 for two; 1 for one" },
  { id: "allowed_tools", label: "Tool permissions declared", max: 2, rule: "2 when the frontmatter declares allowed-tools" },
  { id: "compatibility", label: "Compatibility declared", max: 2, rule: "2 when the frontmatter declares compatibility" },
];
if (RUBRIC.reduce((n, r) => n + r.max, 0) !== RUBRIC_MAX) throw new Error("graded-v2 rubric must total 100 points");
function scoreParts(c, repo, generated) {
  const points = scorePoints(c, repo, generated);
  return RUBRIC.map((r) => ({ id: r.id, label: r.label, max: r.max, points: points[r.id] }));
}

// skills.json is stored compact (see scripts/directory/curate.py): expand each
// record with its repository facts, slugs and GitHub URLs. slugify matches the
// Python one that keyed directory/labels.json.
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "skill";
data.skills = data.skills.map((c) => {
  const meta = data.repos[c.repo];
  if (!meta) throw new Error(`skills.json: no repos entry for ${c.repo}`);
  if (!listed(c) || c.score !== qualityScore(c, meta, data.generated) || letterGrade(c.score) !== c.grade) throw new Error(`skills.json: inconsistent score or eligibility for ${c.repo}/${c.slug}`);
  if (c.security_scan_status !== "not_scanned") throw new Error("Per-skill security results require a separate reviewed evidence pipeline");
  const parts = scoreParts(c, meta, data.generated);
  if (Math.min(SCORE_CAP, parts.reduce((n, p) => n + p.points, 0)) !== c.score) throw new Error(`skills.json: score breakdown disagrees with the published score for ${c.repo}/${c.slug}`);
  const [owner, name] = c.repo.split("/");
  const repoSlug = `${slugify(owner)}/${slugify(name)}`;
  const tree = c.dir === "." ? "" : `${c.dir}/`;
  const blob = (p) => `https://github.com/${c.repo}/blob/${meta.branch}/${p}`;
  return {
    ...c,
    id: `${repoSlug}/${c.slug}`,
    owner,
    repo_name: name,
    repo_slug: repoSlug,
    featured: Boolean(c.featured),
    checks: Object.fromEntries(CHECKS.map((k, i) => [k.id, c.checks[i] === "1"])),
    folder_url: c.dir === "." ? `https://github.com/${c.repo}` : `https://github.com/${c.repo}/tree/${meta.branch}/${c.dir}`,
    skill_md_url: blob(`${tree}SKILL.md`),
    license_url: c.license_file ? blob(c.license_file) : blob(`${tree}SKILL.md`),
    branch: meta.branch,
    commit_date: meta.commit_date,
    lists: meta.lists,
    official: meta.official,
    repo_withheld: meta.withheld || 0,
    repo_scoped_install: Boolean(meta.scoped_install),
    body_lines: c.size[0],
    body_words: c.size[1],
    file_count: c.size[2],
    has_references: c.kinds.includes("r"),
    has_scripts: c.kinds.includes("s"),
    has_assets: c.kinds.includes("a"),
    allowed_tools: c.allowed_tools || null,
    compatibility: c.compatibility || null,
    install: c.install || null,
    score_parts: parts,
    // Quality shields (numeric and letter) are for listed skills scoring 80-99.
    shielded: qualifies(c),
  };
});

// Phrases the public-copy guards reject anywhere under docs/ (see
// tests/test_neutral_oss_positioning.py). Third-party headings and file names
// are dropped rather than rendered when they carry one.
const REJECTED = /telegram|join discord|follow on x|airdrop|passport stamp|stampable|points-ready|future rewards|suede holder|suede-ready|suede intake|suede transfer|stamping api|passport signal|patented signing device|suede ambassador/i;

// ------------------------------------------------------------------ helpers

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fmt = (n) => n.toLocaleString("en-US");

function trimTo(text, max) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.(-]+$/, "")}…`;
}

function ensureSentence(text) {
  const t = String(text || "").trim();
  return /[.!?…]$/.test(t) ? t : `${t}.`;
}

const longDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

const plural = (n, one, many = `${one}s`) => `${fmt(n)} ${n === 1 ? one : many}`;

function listPhrase(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function localToday() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// URL path (no leading slash, trailing slash) for every page type.
const catPath = (slug) => `directory/${slug}/`;
const skillPath = (s) => `directory/${s.repo_slug}/${s.slug}/`;
const url = (p) => `${BASE}/${p}`;

function rel(fromPath, toPath) {
  // Both are paths relative to docs/ ("" is the site root).
  const from = fromPath.split("/").filter(Boolean);
  const to = toPath.split("/").filter(Boolean);
  let i = 0;
  while (i < from.length && i < to.length && from[i] === to[i]) i++;
  const down = to.slice(i).join("/");
  const out = "../".repeat(from.length - i) + (down ? `${down}${toPath.endsWith("/") ? "/" : ""}` : "");
  return out || "./";
}

// Company names for the official publishers, so pages say "Anthropic"
// rather than the GitHub handle "anthropics".
const DISPLAY_NAMES = {
  anthropics: "Anthropic", openai: "OpenAI", microsoft: "Microsoft", google: "Google", "google-gemini": "Google Gemini",
  "google-labs-code": "Google Labs", googleworkspace: "Google Workspace", huggingface: "Hugging Face", supabase: "Supabase",
  "vercel-labs": "Vercel", cloudflare: "Cloudflare", stripe: "Stripe", hashicorp: "HashiCorp", trailofbits: "Trail of Bits",
  getsentry: "Sentry", expo: "Expo", resend: "Resend", coderabbitai: "CodeRabbit", firebase: "Firebase", flutter: "Flutter",
  netlify: "Netlify", mongodb: "MongoDB", neondatabase: "Neon", clickhouse: "ClickHouse", duckdb: "DuckDB", redis: "Redis",
  nvidia: "NVIDIA", figma: "Figma", makenotion: "Notion", apollographql: "Apollo GraphQL", auth0: "Auth0", "better-auth": "Better Auth",
  browserbase: "Browserbase", brave: "Brave", coinbase: "Coinbase", "datadog-labs": "Datadog", "remotion-dev": "Remotion",
  replicate: "Replicate", "sanity-io": "Sanity", serpapi: "SerpApi", tinybirdco: "Tinybird", typefully: "Typefully",
  wordpress: "WordPress", greensock: "GSAP", "fal-ai-community": "fal", "minimax-ai": "MiniMax", callstackincubator: "Callstack",
  firecrawl: "Firecrawl", composiohq: "Composio", binance: "Binance", crawlbase: "Crawlbase", voltagent: "VoltAgent",
  qdrant: "Qdrant", transloadit: "Transloadit", mailtrap: "Mailtrap", trycourier: "Courier", "video-db": "VideoDB",
  angular: "Angular", "cypress-io": "Cypress", lambdatest: "LambdaTest", veniceai: "Venice",
};
const publisherName = (owner, official) => (official && DISPLAY_NAMES[owner.toLowerCase()]) || owner;

// What the license lets a reader do with the files, for the install section.
function licenseKind(s) {
  if (s.open_license) return "open";
  if (/proprietary|all rights reserved/i.test(s.license)) return "restricted";
  if (/\bNC\b|-NC-|non-?commercial/i.test(s.license)) return "noncommercial";
  return "unknown";
}

// ------------------------------------------------------------------ model

const catBySlug = new Map(categories.map((c) => [c.slug, c]));
for (const s of data.skills) {
  if (!catBySlug.has(s.category)) throw new Error(`unknown category ${s.category} on ${s.id}`);
}

const repos = new Map();
for (const s of data.skills) {
  if (!repos.has(s.repo_slug)) {
    repos.set(s.repo_slug, { slug: s.repo_slug, repo: s.repo, owner: s.owner, name: s.repo_name, skills: [] });
  }
  repos.get(s.repo_slug).skills.push(s);
}
for (const r of repos.values()) {
  r.skills.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
  r.lists = [...new Set(r.skills.flatMap((s) => s.lists))].sort();
  r.official = r.skills.some((s) => s.official);
  r.licenses = [...new Set(r.skills.map((s) => s.license))];
  r.commit = r.skills.reduce((m, s) => (s.commit_date > m ? s.commit_date : m), "");
  const counts = new Map();
  for (const s of r.skills) counts.set(s.category, (counts.get(s.category) || 0) + 1);
  r.categories = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([c]) => c);
  r.primary = r.categories[0];
  r.featuredCount = r.skills.filter((s) => s.featured).length;
  // A one-skill repository whose skill has a full page is listed through that
  // page, so the two never restate each other. A one-skill repository without
  // one still gets a page (and a badge to link to), kept out of the index
  // because it would hold a single quoted row.
  // A repository page, once published, stays while the repository is listed,
  // so a README badge that points at it keeps working.
  r.hasPage = r.skills.length >= 2 || !r.skills[0].featured || fs.existsSync(path.join(outRoot, ...r.slug.split("/"), "index.html"));
  r.indexable = r.skills.length >= 2;
  r.target = r.hasPage ? `directory/${r.slug}/` : skillPath(r.skills[0]);
  r.publisher = publisherName(r.owner, r.official);
  r.hasRootSkill = r.skills.some((s) => s.dir === ".");
  r.withheld = r.skills[0].repo_withheld;
  r.scopedInstall = r.skills[0].repo_scoped_install;
  const licCounts = new Map();
  for (const s of r.skills) licCounts.set(s.license, (licCounts.get(s.license) || 0) + 1);
  r.licenseCounts = [...licCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const RESERVED = new Set(["methodology", "submit", "badges", "featured", ...categories.map((c) => c.slug)]);
for (const r of repos.values()) {
  const owner = r.slug.split("/")[0];
  if (RESERVED.has(owner)) throw new Error(`owner slug "${owner}" collides with a reserved directory path`);
}

const featured = data.skills.filter((s) => s.featured);
// Live score distribution, quoted on the methodology page and in llms.txt.
const GRADE_BANDS = [["A", "90–99"], ["B", "80–89"], ["C", "70–79"], ["D", "0–69"]];
const dist = (() => {
  const scores = data.skills.map((s) => s.score).sort((a, b) => a - b);
  const mid = scores.length >> 1;
  return {
    grades: Object.fromEntries(GRADE_BANDS.map(([g]) => [g, data.skills.filter((s) => s.grade === g).length])),
    max: scores[scores.length - 1],
    min: scores[0],
    median: scores.length % 2 ? scores[mid] : Math.floor((scores[mid - 1] + scores[mid]) / 2),
    top: data.skills.filter((s) => s.score >= 96).length,
    shielded: data.skills.filter((s) => s.shielded).length,
  };
})();
const promoted = data.skills.filter((s) => promotionActive(s, PROMOTION.verifications[s.id], PROMOTION, snapshot));
const openPct = Math.round((100 * data.skills.filter((s) => s.open_license).length) / data.skills.length);
const skillsByCat = new Map(categories.map((c) => [c.slug, data.skills.filter((s) => s.category === c.slug)]));
const reposByScore = [...repos.values()].sort(
  (a, b) => b.lists.length - a.lists.length || b.skills.length - a.skills.length || a.slug.localeCompare(b.slug)
);
const linkedRepos = reposByScore.filter((r) => r.target);

// One owner can publish the same skill name in two repositories; their pages
// lead with the repository, so titles and lead keywords stay distinct.
const ownerNameCount = new Map();
for (const s of featured) {
  const k = `${s.owner}/${s.name}`.toLowerCase();
  ownerNameCount.set(k, (ownerNameCount.get(k) || 0) + 1);
}
const sharedName = (s) => ownerNameCount.get(`${s.owner}/${s.name}`.toLowerCase()) > 1;

// A short generic name ("work", "query", "node") reads better in a title with
// the repository in front of it.
function titleName(s) {
  const generic = s.name.length <= 8 && !s.name.includes("-");
  return generic && slugify(s.repo_name) !== s.name ? `${s.repo_name} ${s.name}` : s.name;
}

// ------------------------------------------------------------------ chrome

const NAV_LINKS = [
  ["", "Home"],
  ["directory/", "Directory"],
  ["directory/methodology/", "How listing works"],
  ["skills/", "Suede skills"],
  ["blog/", "Blog"],
];

// Absolute links serve the 404 page, which GitHub Pages returns at any path.
const link = (here, p, absolute) => (absolute ? `/${p}` : rel(here, p));

function nav(here, absolute = false) {
  const rel = (h, p) => link(h, p, absolute);
  const links = NAV_LINKS.map(([p, label]) => `          <a href="${rel(here, p)}">${label}</a>`).join("\n");
  return `    <header class="nav">
      <nav class="shell nav-inner" aria-label="Main navigation">
        <a href="${rel(here, "")}" class="nav-logo" aria-label="Suede Creator Skills home">
          <img src="${rel(here, "assets/")}suede-ai-logo-transparent.webp" alt="Suede AI" width="28" height="28" onerror="this.style.display='none'">
          <span class="nav-logo-wordmark">Suede <span>Creator Skills</span></span>
        </a>
        <details class="nav-disclosure" open>
      <summary class="nav-hamburger" aria-label="Open navigation menu">
        <span></span>
        <span></span>
        <span></span>
      </summary>
      <div class="nav-links">
${links}
          <a href="${rel(here, "directory/submit/")}" class="nav-cta">List your skill</a>
        </div>
    </details>
      </nav>
    </header>`;
}

function footer(here, note, absolute = false) {
  const rel = (h, p) => link(h, p, absolute);
  const a = rel(here, "assets/");
  return `    <footer>
      <div class="shell">
        <p class="footer-note">${note}</p>
        <div class="footer-inner">
          <div class="footer-brand">
            <img src="${a}suede-ai-logo-transparent.webp" alt="Suede AI" width="24" height="24" onerror="this.style.display='none'">
            <span>Built by <strong>Jason Colapietro</strong> / Suede AI</span>
          </div>
          <div class="footer-links">
            <a href="${rel(here, "directory/")}">Directory</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="${rel(here, "directory/methodology/")}">How skills are listed</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="https://suedeai.ai" target="_blank" rel="noopener">suedeai.ai</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="https://github.com/JasonColapietro/suede-creator-skills" target="_blank" rel="noopener">GitHub</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="https://suedeai.ai/privacy" target="_blank" rel="noopener">Privacy</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="https://suedeai.ai/contact" target="_blank" rel="noopener">Contact</a>
          </div>
        </div>
      </div>
    </footer>`;
}

const NAV_SCRIPT = `  <script>
  // Mobile nav disclosure. The markup ships <details open> so a no-JS visit
  // still reaches every link; this collapses it at mobile widths only and
  // keeps the summary label in sync with the state.
  (function () {
    var box = document.querySelector('.nav-disclosure');
    if (!box) return;
    var summary = box.querySelector('summary');
    var mq = window.matchMedia('(max-width: 768px)');
    function collapseForViewport() { box.open = !mq.matches; }
    function syncLabel() {
      if (summary) summary.setAttribute('aria-label', box.open ? 'Close navigation menu' : 'Open navigation menu');
    }
    collapseForViewport();
    syncLabel();
    box.addEventListener('toggle', syncLabel);
    if (mq.addEventListener) mq.addEventListener('change', collapseForViewport);
    else if (mq.addListener) mq.addListener(collapseForViewport);
    box.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () { if (mq.matches) box.open = false; });
    });
  })();
</script>`;

// The page's own dateModified is a placeholder until write time: a page that
// renders the same as the committed one keeps its committed date; a page whose
// content changed gets today's (the rule docs/book uses).
const PAGE_DATE = "__DIRECTORY_PAGE_DATE__";

function page({ here, title, description, keywords, h1Html, body, jsonld, ogType = "website", footerNote, robots = "index, follow, max-image-preview:large, max-snippet:-1", canonical = true, absolute = false, extraStyle = null }) {
  const pageUrl = url(here);
  const a = absolute ? "/assets/" : rel(here, "assets/");
  const blocks = jsonld
    .map((obj) => `    <script type="application/ld+json">\n${JSON.stringify(obj, null, 2).replace(/^/gm, "      ")}\n    </script>`)
    .join("\n");
  const head = [
    `    <meta charset="utf-8">`,
    `    <meta name="viewport" content="width=device-width, initial-scale=1">`,
    `    <title>${esc(title)}</title>`,
    `    <meta name="description" content="${esc(description)}">`,
    keywords ? `    <meta name="keywords" content="${esc(keywords.join(", "))}">` : null,
    `    <meta name="robots" content="${robots}">`,
    canonical ? `    <link rel="canonical" href="${pageUrl}">` : null,
    `    <link rel="icon" href="${a}favicon-64.png" type="image/png">`,
    `    <meta property="og:type" content="${ogType}">`,
    `    <meta property="og:site_name" content="${SITE_NAME}">`,
    `    <meta property="og:title" content="${esc(title)}">`,
    `    <meta property="og:description" content="${esc(description)}">`,
    canonical ? `    <meta property="og:url" content="${pageUrl}">` : null,
    `    <meta property="og:image" content="${OG_IMAGE}">`,
    `    <meta property="og:image:width" content="1200">`,
    `    <meta property="og:image:height" content="630">`,
    `    <meta name="twitter:card" content="summary_large_image">`,
    `    <meta name="twitter:title" content="${esc(title)}">`,
    `    <meta name="twitter:description" content="${esc(description)}">`,
    `    <meta name="twitter:image" content="${OG_IMAGE}">`,
    blocks || null,
    `    <link rel="preload" href="${a}fonts/fraunces-var.woff2" as="font" type="font/woff2" crossorigin>`,
    `    <link rel="stylesheet" href="${a}site.css">`,
    `    <link rel="stylesheet" href="${a}skill.css">`,
    `    <link rel="stylesheet" href="${a}directory.css">`,
    `    <script src="${a}directory.js" defer></script>`,
    extraStyle ? `    <style>${extraStyle}</style>` : null,
  ].filter(Boolean);
  return `<!doctype html>
<html lang="en">
  <head>
${head.join("\n")}
</head>
  <body>
<a class="skip-link" href="#main">Skip to content</a>

${nav(here, absolute)}
    <main id="main" tabindex="-1" class="shell directory">
${h1Html}
${body}
    </main>
${footer(here, footerNote, absolute)}
${NAV_SCRIPT}
  </body>
</html>
`;
}

function crumbs(here, items) {
  // items: [[path, label], ...] ending with the current page (path null).
  const html = items
    .map(([p, label]) => (p === null ? `<span aria-current="page">${esc(label)}</span>` : `<a href="${rel(here, p)}">${esc(label)}</a>`))
    .join(' <span class="crumb-sep" aria-hidden="true">/</span> ');
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url(here)}#breadcrumb`,
    itemListElement: items.map(([p, label], i) => ({ "@type": "ListItem", position: i + 1, name: label, item: url(p === null ? here : p) })),
  };
  return { html: `      <nav class="crumbs" aria-label="Breadcrumb">${html}</nav>`, ld };
}

const gradeChip = (s) => `<span class="grade grade-${s.grade.toLowerCase()}" title="Suede Skill Check: ${s.score}/100, grade ${s.grade}">${s.score}/100 · ${s.grade}</span>`;
const listLink = (l) => `<a href="https://github.com/${esc(l)}" target="_blank" rel="noopener">${esc(l)}</a>`;
const citationEvidence = (repo) => (data.repos[repo].supplementary_citations || []).map((c) =>
  `\n        <p>Verified citation: <a href="https://github.com/${esc(c.source)}/blob/${esc(c.commit)}/${esc(c.path)}" target="_blank" rel="noopener">${esc(c.source)}</a>, checked ${esc(c.verified_at)}.</p>`).join("");
const officialTag = (yes) => (yes ? ' <span class="tag">Official</span>' : "");

// ------------------------------------------------------------------ badges

const badgeTextWidth = (t) =>
  Math.round([...t].reduce((n, ch) => n + (/[il.:|]/.test(ch) ? 3.5 : /[mwMW]/.test(ch) ? 9.5 : /[A-Z]/.test(ch) ? 7.6 : 6.6), 0)) + 12;
const BADGE_LABEL = "Suede Skills Directory";

function badgeSvg(value) {
  // Widths approximate Verdana 11px, the shields.io convention. The label half
  // is lifted off pure black and outlined so it reads on GitHub's dark theme.
  const lw = badgeTextWidth(BADGE_LABEL);
  const vw = badgeTextWidth(value);
  const total = lw + vw;
  return {
    width: total,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${BADGE_LABEL}: ${value}">
  <title>${BADGE_LABEL}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="20" fill="#1c1c1a"/>
    <rect x="${lw}" width="${vw}" height="20" fill="#c8a96e"/>
    <rect width="${total}" height="20" fill="url(#s)"/>
  </g>
  <rect x=".5" y=".5" width="${total - 1}" height="19" rx="2.5" fill="none" stroke="#c8a96e" stroke-opacity=".55"/>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${lw / 2}" y="14" fill="#f0ece4">${BADGE_LABEL}</text>
    <text x="${lw + vw / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${lw + vw / 2}" y="14" fill="#080808">${value}</text>
  </g>
</svg>
`,
  };
}

function badgeBlock(here, { badgePath, value, target, heading, lede }) {
  const { width } = badgeSvg(value);
  const img = url(badgePath);
  const alt = `${BADGE_LABEL}: ${value}`;
  const md = `[![${alt}](${img})](${target})`;
  const htmlSnippet = `<a href="${target}"><img src="${img}" alt="${alt}" height="20"></a>`;
  return `      <section class="panel badge-panel" id="badge" aria-labelledby="badge-title">
        <h2 id="badge-title">${heading}</h2>
        <p>${lede}</p>
        <p class="badge-preview"><img src="${rel(here, badgePath)}" alt="${esc(alt)}" width="${width}" height="20"></p>
        <div class="snippet">
          <div class="snippet-head"><span>Markdown</span><button type="button" class="snippet-copy" data-copy-target="badge-md">Copy</button></div>
          <pre><code id="badge-md">${esc(md)}</code></pre>
        </div>
        <div class="snippet">
          <div class="snippet-head"><span>HTML</span><button type="button" class="snippet-copy" data-copy-target="badge-html">Copy</button></div>
          <pre><code id="badge-html">${esc(htmlSnippet)}</code></pre>
        </div>
      </section>`;
}

// The two badges always point to the skill's listing, including a repository
// table anchor when the editorial rules have not awarded a full skill page.
function qualityBadgeContent(s, suffix = "") {
  if (!s.shielded) throw new Error(`${s.id} has no quality shields: only listed skills scoring 80–99 get them`);
  const id = `badge${suffix}`;
  return `<div class="shield-pair">${badgePair(s).map((b) => `<a href="${listingTarget(s)}"><img src="${b.src.replace(BASE, "")}" alt="${esc(b.alt)}" width="160" height="175" loading="lazy"></a>`).join("")}</div>
        <p>Choose the numeric badge, the letter badge, or both. Each links to this skill’s Suede listing; either valid linked badge can qualify for the feature offer.</p>
        <div class="snippet"><div class="snippet-head"><span>Markdown</span><button type="button" class="snippet-copy" data-copy-target="${id}-md">Copy both badges</button></div><pre><code id="${id}-md">${esc(badgeMarkdown(s))}</code></pre></div>
        <div class="snippet"><div class="snippet-head"><span>HTML</span><button type="button" class="snippet-copy" data-copy-target="${id}-html">Copy both badges</button></div><pre><code id="${id}-html">${esc(badgeHtml(s))}</code></pre></div>`;
}
function promotionOffer(here) {
  const ended = PROMOTION.ends_at && Date.now() >= Date.parse(PROMOTION.ends_at);
  if (!PROMOTION.enabled || ended) return "";
  return `<p class="badge-offer" data-promotion-end="${esc(PROMOTION.ends_at || "")}">Limited-time feature offer: display either the numeric or letter badge in your repository or skill README (both also qualify), then <a href="${rel(here, "directory/submit/")}">request badge verification</a>. Eligible skills scoring 80–99 can receive a featured placement after Suede verifies at least one valid badge linked to the skill’s listing.${PROMOTION.ends_at ? ` Available until ${esc(PROMOTION.ends_at)}.` : " Suede has not announced an end date."}</p>`;
}
// The route for a listed skill below 80: the general listing badge (the same
// SVG its per-skill badge.svg and score.svg URLs serve) and a review request.
function improveBlock(here, s) {
  // Citations come from curated lists, not the author, so they are not suggested.
  const open = s.score_parts.filter((p) => p.points < p.max && p.id !== "adoption").sort((a, b) => b.max - b.points - (a.max - a.points) || a.label.localeCompare(b.label)).slice(0, 3);
  return badgeBlock(here, {
    badgePath: "directory/badge.svg",
    value: "listed",
    target: listingTarget(s),
    heading: `Show the listing and raise the score`,
    lede: `${esc(s.name)} is listed with ${s.score}/100 · ${s.grade}. This badge links to its Suede listing. Skills scoring 80–99 add a numeric and a letter quality shield${open.length ? `; the largest open points for ${esc(s.name)} are ${listPhrase(open.map((p) => `${esc(p.label.toLowerCase())} (${p.max - p.points})`))}` : ""}. <a href="${rel(here, "directory/submit/")}#improve">Send your repository and the points you want to raise</a>, then request a fresh review after updating the skill.`,
  });
}
function qualityBadgeBlock(here, s) {
  if (!s.shielded) return improveBlock(here, s);
  return `<section class="panel badge-panel" id="badge" aria-labelledby="badge-title"><h2 id="badge-title">Two badges for ${esc(s.name)}</h2>
        ${qualityBadgeContent(s)}
        <p class="muted">Suede Certified on the shield refers to this published structural quality check. Security scan: not scanned. Read the <a href="${rel(here, "directory/methodology/")}">methodology</a>.</p>
        ${promotionOffer(here)}</section>`;
}
function promotionSection(here, skills) {
  if (!skills.length) return "";
  return `<section class="panel badge-promotion" id="badge-partners" aria-labelledby="badge-partners-title" data-promotion-end="${esc(PROMOTION.ends_at || "")}"><h2 id="badge-partners-title">Featured badge partners</h2><p>README badges verified by Suede. Quality scores follow the published structural checks.</p><div class="dir-cards">${skills.map((s) => `<a class="dir-card" href="${listingTarget(s)}"><span class="dir-card-head"><b>${esc(s.name)}</b>${gradeChip(s)}</span><span class="dir-card-repo">${esc(s.repo)}</span><span class="dir-card-text">${esc(s.summary || trimTo(s.description, 150))}</span></a>`).join("")}</div></section>`;
}

// ------------------------------------------------------------------ keywords

const keywordMap = {};
const leadSeen = new Map();
function setKeywords(here, terms) {
  const relFile = `${here}index.html`;
  const seen = new Set();
  const list = [];
  for (const t of terms) {
    const term = String(t).replace(/,/g, " ").replace(/\s+/g, " ").trim();
    const key = term.toLowerCase();
    if (!term || seen.has(key)) continue;
    seen.add(key);
    list.push(term);
  }
  const lead = list[0].toLowerCase();
  if (leadSeen.has(lead)) throw new Error(`lead keyword "${lead}" used by ${leadSeen.get(lead)} and ${relFile}`);
  leadSeen.set(lead, relFile);
  keywordMap[relFile] = list.slice(0, 10);
  return keywordMap[relFile];
}

// ------------------------------------------------------------------ shared pieces

const files = new Map(); // path relative to docs/ -> content

function factsTable(rows) {
  return `        <div class="table-wrap">
          <table class="facts">
            <tbody>
${rows
  .filter(([, v]) => v)
  .map(([k, v]) => `            <tr><th scope="row">${k}</th><td>${v}</td></tr>`)
  .join("\n")}
            </tbody>
          </table>
        </div>`;
}

// Portable evidence describes the saved snapshot, never a fresh scan of upstream.
function skillReport(s) {
  const revision = data.repos[s.repo].commit_sha || null;
  if (revision !== null && !/^[a-f0-9]{40}$/.test(revision)) throw new Error(`Invalid source revision for ${s.repo}`);
  const report = {
    schema_version: 1, skill: { name: s.name, repository: s.repo, path: s.dir, license: s.license },
    listing_url: listingTarget(s),
    snapshot: { date: snapshot.date, id: data.snapshot_id, dataset_sha256: snapshot.sha256 },
    source: { branch: s.branch, revision, revision_status: revision ? "recorded" : "not_recorded_in_snapshot", repository_commit_date: s.commit_date,
      skill_md_url: revision ? `https://github.com/${s.repo}/blob/${revision}/${s.dir === "." ? "" : s.dir + "/"}SKILL.md` : s.skill_md_url },
    methodology: { version: SCORE_METHOD, url: `${DIR_URL}methodology/#score`, rubric_total: RUBRIC_MAX, published_cap: SCORE_CAP },
    quality: { score: s.score, grade: s.grade, components: s.score_parts, checks: s.checks },
    ...(data.repos[s.repo].supplementary_citations ? { supplementary_citations: data.repos[s.repo].supplementary_citations } : {}),
    security_scan_status: "not_scanned",
    badges: s.shielded ? badgePair(s) : [{ kind: "listing", src: `${BASE}/${skillPath(s)}badge.svg`, alt: "Suede Skills Directory: listed" }],
  };
  return { ...report, report_version: createHash("sha256").update(JSON.stringify(report)).digest("hex") };
}
function reviewRequest(s) {
  const request = new URL(ISSUE_URL);
  request.searchParams.set("request", "Recheck my updated skill");
  request.searchParams.set("repository", `https://github.com/${s.repo}`);
  request.searchParams.set("skill-scope", s.name);
  request.searchParams.set("details", `Listing: ${listingTarget(s)}\nPrevious report: ${url(skillPath(s))}report.json\nSnapshot: ${snapshot.date} (${data.snapshot_id}); methodology: ${SCORE_METHOD}\n\nUpdated source commit or PR:\nChanges to review:\n`);
  return request.toString();
}
function reportLinks(here, s) {
  return `<a href="${rel(here, `${skillPath(s)}report.json`)}" download="${esc(s.slug)}-suede-report-${snapshot.date}.json">Download report</a> · <a href="${esc(reviewRequest(s))}" target="_blank" rel="noopener">Request a fresh review</a>`;
}
function reportPanel(here, s) {
  const report = skillReport(s);
  const open = s.score_parts.filter((p) => p.points < p.max && p.id !== "adoption").sort((a, b) => (b.max - b.points) - (a.max - a.points)).slice(0, 3);
  return `<div class="report-summary">
          <p class="report-kicker">Report snapshot · <time datetime="${snapshot.date}">${longDate(snapshot.date)}</time> · ${SCORE_METHOD}</p>
          <p>The rubric totals 100 points; published scores are capped at 99. Security scan: not scanned.</p>
          <p class="muted">Source revision: ${report.source.revision ? `<a href="${esc(report.source.skill_md_url)}" target="_blank" rel="noopener"><code>${report.source.revision.slice(0, 12)}</code></a>` : "not recorded in this snapshot"}. Report version <code>${report.report_version.slice(0, 12)}</code>. Badge URLs follow the latest listing; save the report to keep this version.</p>
          <p class="report-actions">${reportLinks(here, s)}</p>
          ${open.length ? `<h3>What to review next</h3><ul>${open.map((p) => `<li><b>${esc(p.label)}</b>: ${p.points} of ${p.max} points. ${esc(RUBRIC.find((r) => r.id === p.id).rule)}.</li>`).join("")}</ul><p class="muted">Add declarations and bundled files when they describe the skill’s actual needs. Update the source, then request a fresh review with the changed commit or PR.</p>` : ""}
        </div>`;
}

function skillRow(here, s, { showRepo, showLicense = false }) {
  const cat = catBySlug.get(s.category);
  const nameCell = s.featured
    ? `<a href="${rel(here, skillPath(s))}">${esc(s.name)}</a>`
    : `<a href="${esc(s.folder_url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`;
  const desc = s.featured ? s.summary : trimTo(s.description, 150);
  const r = repos.get(s.repo_slug);
  const repoTarget = r.hasPage ? `${rel(here, r.target)}#${esc(s.slug)}` : null;
  const second = showRepo
    ? repoTarget
      ? `<a href="${repoTarget}">${esc(s.repo)}</a>`
      : `<a href="${esc(`https://github.com/${s.repo}`)}" target="_blank" rel="noopener">${esc(s.repo)}</a>`
    : `<a href="${rel(here, catPath(cat.slug))}">${esc(cat.label)}</a>${showLicense ? `<br><span class="row-license">${esc(s.license)}</span>` : ""}`;
  const id = showRepo ? "" : ` id="${esc(s.slug)}"`;
  const badges = showRepo
    ? ""
    : !s.shielded
      ? `<p><a href="${s.featured ? `${rel(here, skillPath(s))}#badge` : `${rel(here, "directory/submit/")}#improve`}">Improve this score</a></p>`
      : s.featured
        ? `<p><a href="${rel(here, skillPath(s))}#badge">Get badges</a></p>`
        : `<details class="row-badges"><summary>Get badges</summary>${qualityBadgeContent(s, `-${s.slug}`)}</details>`;
  const report = showRepo ? "" : `<p class="row-report">${reportLinks(here, s)}</p>`;
  return `            <tr${id}><td class="name">${nameCell} ${gradeChip(s)}</td><td class="meta">${second}</td><td class="desc">${esc(desc)}${badges}${report}</td></tr>`;
}

function skillTable(here, rows, { id, showRepo, caption, showLicense = false }) {
  const head = `<thead><tr><th scope="col">Skill</th><th scope="col">${showRepo ? "Repository" : "Category"}</th><th scope="col">What it does</th></tr></thead>`;
  const render = (list, tid) => `        <div class="table-wrap">
          <table class="skill-table" id="${tid}" data-filter-group="${id}">
            ${head}
            <tbody>
${list.map((s) => skillRow(here, s, { showRepo, showLicense })).join("\n")}
            </tbody>
          </table>
        </div>`;
  if (rows.length <= FULL_TABLE_ROWS + 20) return render(rows, id);
  return `${render(rows.slice(0, FULL_TABLE_ROWS), id)}
        <details class="more-rows" data-filter-group="${id}">
          <summary>Show the other ${fmt(rows.length - FULL_TABLE_ROWS)} ${caption}</summary>
${render(rows.slice(FULL_TABLE_ROWS), `${id}-more`)}
        </details>`;
}

function filterField(id, total, noun) {
  return `        <div class="table-filter" hidden><label class="filter-label" for="${id}-filter">Filter by name, repository or task</label>
        <div class="search-line"><input id="${id}-filter" class="filter" type="search" placeholder="Search ${fmt(total)} ${noun}" data-filter-for="${id}" data-filter-status="${id}-status" autocomplete="off"><button type="button" data-table-clear>Clear</button></div><p id="${id}-status" class="muted" role="status" aria-live="polite"></p><p data-table-empty hidden>No matching skills. Try fewer words or clear your search.</p></div>`;
}

// ------------------------------------------------------------------ skill pages

function skillTitle(s) {
  const n = titleName(s);
  const by = sharedName(s) ? `in ${s.repo}` : `by ${s.owner}`;
  const options = [`${n} Agent Skill ${by} | Suede Directory`, `${n} Agent Skill ${by}`, `${n} Agent Skill`, `${n} Skill`];
  const fit = options.find((t) => t.length <= 60);
  if (fit) return fit;
  // Cut a very long name at a hyphen so the title never ends mid-word.
  let name = s.name;
  while (`${name} Skill`.length > 60 && name.includes("-")) name = name.slice(0, name.lastIndexOf("-"));
  return `${name} Skill`;
}

function skillDescription(s, withName) {
  const tail = /^See /.test(s.license) ? ` From ${s.repo}.` : ` From ${s.repo}, ${s.license}.`;
  const head = withName ? `${s.name}: ` : "";
  const room = 158 - tail.length - head.length;
  return `${head}${trimTo(ensureSentence(s.summary), room)}${tail}`.replace(/…\./, "…");
}
// Two skills whose trimmed summaries match would share a meta description;
// those lead with their own name instead.
const descriptionNeedsName = new Set();
{
  const seen = new Map();
  for (const s of featured) {
    const d = skillDescription(s, false);
    seen.set(d, [...(seen.get(d) || []), s.id]);
  }
  for (const ids of seen.values()) if (ids.length > 1) ids.forEach((id) => descriptionNeedsName.add(id));
}

function beforeInstall(s) {
  const i = s.install || { langs: {}, env_read: [], env_docs: [], net: false, hosts: [], mcp: false, mcp_tools: [] };
  const langs = Object.entries(i.langs || {});
  const codeList = (xs) => xs.map((e) => `<code>${esc(e)}</code>`).join(", ");
  const items = [];
  if (langs.length) {
    const total = langs.reduce((n, [, c]) => n + c, 0);
    items.push(`<b>Bundled scripts:</b> ${plural(total, "script file")} (${langs.map(([l, c]) => `${fmt(c)} ${esc(l)}`).join(", ")}). Your agent may run them, so read them first.`);
  } else {
    items.push(`<b>Bundled scripts:</b> none.`);
  }
  if (i.runs && i.runs.length) {
    items.push(`<b>Commands in SKILL.md:</b> its code blocks run ${listPhrase(i.runs.map((c) => `<code>${esc(c)}</code>`))}, which ${i.runs.length === 1 ? "fetches or runs" : "fetch or run"} software from outside the skill folder.`);
  }
  if (i.env_read && i.env_read.length) {
    items.push(`<b>Environment variables its scripts read:</b> ${codeList(i.env_read)}. Check SKILL.md for which ones it needs.`);
  }
  if (i.env_docs && i.env_docs.length) {
    items.push(`<b>Credential names SKILL.md mentions:</b> ${codeList(i.env_docs)}.`);
  }
  if (i.net) {
    items.push(`<b>Network:</b> its scripts use an HTTP client or a cloud SDK${i.hosts && i.hosts.length ? `, and name ${listPhrase(i.hosts.map((h) => `<code>${esc(h)}</code>`))}` : ""}.`);
  }
  if (i.mcp_tools && i.mcp_tools.length) {
    items.push(`<b>MCP:</b> SKILL.md calls tools from the ${listPhrase(i.mcp_tools.map((t) => `<code>${esc(t)}</code>`))} MCP server${i.mcp_tools.length > 1 ? "s" : ""}.`);
  } else if (i.mcp) {
    items.push(`<b>MCP:</b> SKILL.md mentions an MCP server.`);
  }
  if (s.allowed_tools) {
    items.push(`<b>Tool permissions requested:</b> <code>${esc(trimTo(s.allowed_tools, 160))}</code> (the <code>allowed-tools</code> field of SKILL.md).`);
  }
  const kind = licenseKind(s);
  const lic = `<a href="${esc(s.license_url)}" target="_blank" rel="noopener">${esc(s.license)}</a>`;
  items.push(
    {
      open: `<b>License:</b> ${lic}, an open-source or open-content license.`,
      noncommercial: `<b>License:</b> ${lic}, which allows non-commercial use only.`,
      restricted: `<b>License:</b> ${lic}. Its terms restrict copying the files; read them before you use the skill.`,
      unknown: `<b>License:</b> ${lic}. Read the terms before you reuse the files.`,
    }[kind]
  );
  return `      <section class="panel" aria-labelledby="before-title">
        <h2 id="before-title">Before you install</h2>
        <p class="muted">Read from the skill's files at the directory's ${longDate(data.generated)} snapshot: what ships with it, what its code reads, and the terms it is published under.</p>
        <ul class="before-list">
${items.map((t) => `          <li>${t}</li>`).join("\n")}
        </ul>
      </section>`;
}

const shq = (v) => (/^[\w./@:+-]+$/.test(v) ? v : `'${String(v).replace(/'/g, "'\\''")}'`);

function codeBlock(id, text) {
  return `        <div class="snippet">
          <div class="snippet-head"><span>${id.label}</span><button type="button" class="snippet-copy" data-copy-target="${id.key}">Copy</button></div>
          <pre><code id="${id.key}">${esc(text)}</code></pre>
        </div>`;
}

function installSection(s) {
  const kind = licenseKind(s);
  const who = publisherName(s.owner, s.official);
  if (kind === "restricted") {
    const note = NOTES[s.id];
    const route = note
      ? `        <p>${esc(note.text)}</p>
${codeBlock({ label: "Claude Code", key: "install-publisher" }, note.commands.join("\n"))}
        <p class="muted">Source: <a href="${esc(note.source)}" target="_blank" rel="noopener">${esc(who)}'s documentation</a>.</p>`
      : `        <p>The directory shows no install commands for it. Read the <a href="${esc(s.license_url)}" target="_blank" rel="noopener">license terms</a> before you use the skill.</p>`;
    return `      <section class="panel" aria-labelledby="install-title">
        <h2 id="install-title">How to use ${esc(s.name)}</h2>
        <p>${esc(who)} publishes ${esc(s.name)} under its own license terms, which restrict copying the files.</p>
${route}
      </section>`;
  }
  const treeUrl = s.dir === "." ? (s.branch === "main" ? `https://github.com/${s.repo}` : `https://github.com/${s.repo}/tree/${s.branch}`) : `https://github.com/${s.repo}/tree/${s.branch}/${s.dir}`;
  const npx = `npx skills add ${shq(treeUrl)}`;
  const claude =
    s.dir === "."
      ? `mkdir -p .claude/skills
git clone --depth 1${s.branch === "main" ? "" : ` --branch ${shq(s.branch)}`} https://github.com/${s.repo}.git .claude/skills/${shq(s.name)}
rm -rf .claude/skills/${shq(s.name)}/.git`
      : `tmp="$(mktemp -d)"
git clone --depth 1${s.branch === "main" ? "" : ` --branch ${shq(s.branch)}`} https://github.com/${s.repo}.git "$tmp/repo"
mkdir -p .claude/skills
cp -R "$tmp/repo/"${shq(s.dir)} .claude/skills/
rm -rf "$tmp"`;
  const codex =
    s.dir === "."
      ? null
      : `python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \\
    --repo ${s.repo} \\
    --path ${shq(s.dir)}${s.branch === "main" ? "" : ` \\\n    --ref ${shq(s.branch)}`}`;
  const note =
    kind === "noncommercial"
      ? `<p class="muted">${esc(s.license)} allows non-commercial use only. ${esc(s.repo)} is third-party code: read SKILL.md and any bundled scripts before you install it.</p>`
      : `<p class="muted">${esc(s.repo)} is third-party code. Read SKILL.md and any bundled scripts before you install it.</p>`;
  const setup = NOTES[s.id];
  const prerequisites = setup
    ? `        <p>${esc(setup.text)} <a href="${esc(setup.source)}" target="_blank" rel="noopener">Publisher setup instructions</a>.</p>\n`
    : "";
  return `      <section class="panel" aria-labelledby="install-title">
        <h2 id="install-title">Install ${esc(s.name)}</h2>
${prerequisites}        <p>The skills CLI works with Claude Code, Codex, Cursor and other agents; the other routes copy the folder by hand.</p>
${codeBlock({ label: "Skills CLI", key: "install-cli" }, npx)}
${codeBlock({ label: "Claude Code, project-level copy", key: "install-claude" }, claude)}
${codex ? codeBlock({ label: "Codex installer", key: "install-codex" }, codex) : "        <p>For Codex, the skills CLI line above installs it.</p>"}
        ${note}
      </section>`;
}

function relatedRows(here, items) {
  return items
    .map((o) => `          <a class="link-row" href="${rel(here, skillPath(o))}"><b>${esc(o.name)}</b><span>${esc(o.repo)}</span></a>`)
    .join("\n");
}

function checkSummary(s) {
  const passed = CHECKS.slice(1).filter((c) => s.checks[c.id]).length;
  return passed === CHECKS.length - 1 ? "Passes all seven graded checks" : `Passes ${["zero", "one", "two", "three", "four", "five", "six"][passed]} of seven graded checks`;
}

function renderSkill(s) {
  const here = skillPath(s);
  const cat = catBySlug.get(s.category);
  const r = repos.get(s.repo_slug);
  const trail = [["directory/", "Directory"], [catPath(cat.slug), cat.title]];
  if (r.hasPage) trail.push([r.target, s.repo]);
  trail.push([null, s.name]);
  const bc = crumbs(here, trail);
  const kinds = [s.has_references && "references", s.has_scripts && "scripts", s.has_assets && "assets or templates"].filter(Boolean);
  const fileNames = (s.files_sample || []).filter((f) => !REJECTED.test(f));
  const heads = (s.headings || []).filter(([, h]) => !REJECTED.test(h));
  const repoCell = r.hasPage
    ? `<a href="${rel(here, r.target)}">${esc(s.repo)}</a> (${plural(r.skills.length, "listed skill")})`
    : `<a href="https://github.com/${esc(s.repo)}" target="_blank" rel="noopener">github.com/${esc(s.repo)}</a>`;
  const facts = factsTable([
    ["Publisher", `<a href="https://github.com/${esc(s.owner)}" target="_blank" rel="noopener">${esc(publisherName(s.owner, s.official))}</a>${officialTag(s.official)}`],
    ["Repository", repoCell],
    ["Category", `<a href="${rel(here, catPath(cat.slug))}">${esc(cat.title)}</a>`],
    ["License", `<a href="${esc(s.license_url)}" target="_blank" rel="noopener">${esc(s.license)}</a>`],
    ["Last commit", `${longDate(s.commit_date)} (repository)`],
    ["SKILL.md", `${plural(s.body_lines, "line")}, ${plural(s.body_words, "word")}`],
    ["Bundled files", `${plural(s.file_count, "file")}${kinds.length ? `, including ${kinds.join(", ")}` : ""}`],
    ["Quality score", `${gradeChip(s)} <a href="#check">${checkSummary(s)}</a>`],
    ["Security scan", "Not scanned"],
    ["README badge", s.shielded ? `<a href="#badge">Get the badges for this listing</a>` : `<a href="#badge">Get the listing badge and raise the score</a>`],
  ]);
  const authorFacts = factsTable([
    ["Compatibility", s.compatibility ? esc(trimTo(s.compatibility, 200)) : ""],
  ]);
  const outline = heads.length
    ? `        <h3>Sections in SKILL.md</h3>
        <ul class="outline">
${heads.map(([lvl, h]) => `          <li class="lvl-${lvl}">${esc(h)}</li>`).join("\n")}
        </ul>`
    : "";
  const fileList = fileNames.length
    ? `        <h3>Files in the skill folder</h3>
        <ul class="file-list">
${fileNames.map((f) => `          <li><code>${esc(f)}</code></li>`).join("\n")}
        </ul>${s.file_count > fileNames.length ? `\n        <p class="muted">Showing ${fileNames.length} of ${fmt(s.file_count)} files. <a href="${esc(s.folder_url)}" target="_blank" rel="noopener">Browse the folder on GitHub</a>.</p>` : ""}`
    : "";
  const checks = CHECKS.map((c) => `              <tr><td>${esc(c.label)}</td><td class="${s.checks[c.id] ? "pass" : "miss"}">${s.checks[c.id] ? "Pass" : "Not met"}</td></tr>`).join("\n");
  const rawPoints = s.score_parts.reduce((n, p) => n + p.points, 0);
  const pointRows = s.score_parts.map((p) => `              <tr><td>${esc(p.label)}</td><td${p.points === p.max ? ' class="pass"' : p.points ? "" : ' class="miss"'}>${p.points} of ${p.max}</td></tr>`).join("\n");
  const sameCat = featured
    .filter((o) => o.category === s.category && o.repo_slug !== s.repo_slug)
    .sort((a, b) => b.lists.length - a.lists.length || a.id.localeCompare(b.id));
  const h = [...s.id].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const related = [...new Map(Array.from({ length: Math.min(6, sameCat.length) }, (_, k) => sameCat[(h + k * 7) % sameCat.length]).map((o) => [o.id, o])).values()];
  const siblings = r.skills.filter((o) => o.featured && o.id !== s.id).slice(0, 6);
  const body = `${bc.html}
      <p class="lead">${esc(ensureSentence(s.summary))}</p>
      <p><a class="button" href="${esc(s.folder_url)}" target="_blank" rel="noopener">View on GitHub</a> <a class="button secondary" href="${esc(s.skill_md_url)}" target="_blank" rel="noopener">Read SKILL.md</a></p>
      <section class="panel" aria-labelledby="facts-title">
        <h2 id="facts-title">At a glance</h2>
${facts}
      </section>
${beforeInstall(s)}
${installSection(s)}
      <section class="panel" aria-labelledby="author-title">
        <h2 id="author-title">How the author describes it</h2>
        <blockquote class="author-quote" cite="${esc(s.skill_md_url)}">
          <p>${esc(s.description)}</p>
        </blockquote>
        <p class="muted">From the <code>description</code> field of <a href="${esc(s.skill_md_url)}" target="_blank" rel="noopener">SKILL.md</a>. Agents read this line to decide when to load the skill.</p>
${s.compatibility ? `        <h3>Compatibility, from SKILL.md</h3>\n${authorFacts}` : ""}
${outline}
${fileList}
      </section>
      <section class="panel" id="check" aria-labelledby="check-title">
        <h2 id="check-title">Suede Skill Check: ${s.score}/100 · ${s.grade}</h2>
${reportPanel(here, s)}
        <p>${esc(s.name)} passes the required frontmatter check and ${checkSummary(s).replace(/^Passes /, "")}, which cover the SKILL.md format, a declared license and a commit in the last year. Those checks earn ${s.score_parts[0].points} of the score’s points; the rest come from description quality, instruction depth, bundled files, maintenance and curated-list citations${rawPoints > SCORE_CAP ? `, capped at ${SCORE_CAP}` : ""}. <a href="${rel(here, "directory/methodology/")}">How the score works</a>.</p>
        <details class="check-details">
          <summary>See the checks and points</summary>
          <div class="table-wrap">
            <table class="checks">
              <thead><tr><th scope="col">Check</th><th scope="col">Result</th></tr></thead>
              <tbody>
${checks}
              </tbody>
            </table>
          </div>
          <div class="table-wrap">
            <table class="checks">
              <thead><tr><th scope="col">Score component</th><th scope="col">Points</th></tr></thead>
              <tbody>
${pointRows}
              </tbody>
            </table>
          </div>
        </details>
      </section>
${qualityBadgeBlock(here, s)}
      <section class="panel" aria-labelledby="cited-title">
        <h2 id="cited-title">Where this skill is cited</h2>
        <p>${s.lists.length ? `${esc(s.repo)} appears in ${plural(s.lists.length, "curated list")}: ${s.lists.map(listLink).join(", ")}.` : `${esc(s.repo)} is listed from its publisher's official collection or a listing request.`}</p>${citationEvidence(s.repo)}
      </section>
${related.length ? `      <section class="panel" aria-labelledby="related-title">
        <h2 id="related-title">More ${esc(cat.short)} skills</h2>
        <div class="links">
${relatedRows(here, related)}
        </div>
        <p><a href="${rel(here, catPath(cat.slug))}">All ${esc(cat.lower)} skills</a></p>
      </section>` : ""}
${siblings.length ? `      <section class="panel" aria-labelledby="siblings-title">
        <h2 id="siblings-title">More from ${esc(s.repo)}</h2>
        <div class="links">
${relatedRows(here, siblings)}
        </div>
        <p><a href="${rel(here, r.target)}">All ${plural(r.skills.length, "skill")} in ${esc(s.repo)}</a></p>
      </section>` : ""}`;
  const description = skillDescription(s, descriptionNeedsName.has(s.id));
  const keywords = setKeywords(here, [
    sharedName(s) ? `${s.name} skill in ${s.repo}` : `${s.name} skill by ${s.owner}`,
    `${s.name} skill`,
    `${s.name} agent skill`,
    `${s.name} claude skill`,
    `${s.owner} skills`,
    `${cat.short} agent skills`,
    "SKILL.md",
  ]);
  const code = {
    "@type": "SoftwareSourceCode",
    name: s.name,
    description: `${ensureSentence(s.summary)} Suede Skill Check: ${s.score}/100, grade ${s.grade}. Security scan: not scanned.`,
    codeRepository: s.folder_url,
    programmingLanguage: "Markdown",
    license: s.license_url,
    dateModified: s.commit_date,
    keywords: [cat.title, "Agent Skills", "SKILL.md"],
  };
  // The publisher is named as an author only where it is a company: a GitHub
  // owner name alone does not say whether it is a person or an organization.
  if (s.official) code.author = { "@type": "Organization", name: publisherName(s.owner, true), url: `https://github.com/${s.owner}` };
  const title = skillTitle(s);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    ogType: "article",
    h1Html: `      <div class="eyebrow">Agent skill &middot; ${esc(cat.label)} &middot; ${esc(s.owner)}</div>
      <h1>${esc(s.name)} <span class="h1-sub">agent skill ${esc(sharedName(s) ? `in ${s.repo}` : `by ${s.owner}`)}</span></h1>`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url(here)}#page`,
        name: title,
        description,
        url: url(here),
        dateModified: PAGE_DATE,
        isPartOf: { "@id": `${DIR_URL}#directory` },
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        mainEntity: code,
      },
      bc.ld,
    ],
    footerNote: `${esc(s.name)} is published by ${esc(s.owner)} in ${esc(s.repo)} and listed in the Suede Skills Directory, a curated index of public Agent Skills.`,
  }));
}

// ------------------------------------------------------------------ repository pages

function renderRepo(r) {
  const here = `directory/${r.slug}/`;
  const primary = catBySlug.get(r.primary);
  const bc = crumbs(here, [["directory/", "Directory"], [catPath(primary.slug), primary.title], [null, r.repo]]);
  const catLinks = r.categories.map((c) => `<a href="${rel(here, catPath(c))}">${esc(catBySlug.get(c).title)}</a>`);
  const licenseText = r.licenseCounts.length === 1 ? r.licenseCounts[0][0] : r.licenseCounts.map(([l, n]) => `${l} (${fmt(n)})`).join(", ");
  const where = r.categories.length === 1 ? `in ${catBySlug.get(r.primary).lower}` : `across ${plural(r.categories.length, "category", "categories")}`;
  const lead = `${plural(r.skills.length, "skill")} from ${r.repo} ${r.skills.length === 1 ? "is" : "are"} listed in the directory, ${where}.${r.featuredCount ? ` ${plural(r.featuredCount, "skill")} ${r.featuredCount === 1 ? "has" : "have"} a full page with install steps and a pre-install summary.` : ""}`;
  const facts = factsTable([
    ["Publisher", `<a href="https://github.com/${esc(r.owner)}" target="_blank" rel="noopener">${esc(r.publisher)}</a>${officialTag(r.official)}`],
    ["Repository", `<a href="https://github.com/${esc(r.repo)}" target="_blank" rel="noopener">github.com/${esc(r.repo)}</a>`],
    ["Listed skills", fmt(r.skills.length)],
    ["Security scan", "Not scanned"],
    ["Categories", catLinks.join(", ")],
    ["License", esc(licenseText)],
    ["Last commit", longDate(r.commit)],
    // A root SKILL.md hides the nested skills from the skills CLI, so a
    // whole-repository install would bring only that one.
    // Hidden when it would also install a skill the directory withholds, one
    // whose license restricts copying, or only a root skill that hides the rest.
    ["Install every skill", r.scopedInstall || r.withheld || r.skills.some((s) => licenseKind(s) === "restricted") || (r.hasRootSkill && r.skills.length > 1) ? "" : `<code>npx skills add https://github.com/${esc(r.repo)}</code>`],
    ["README badge", `<a href="#badge">Get the badge for this listing</a>`],
  ]);
  const relatedRepos = linkedRepos.filter((o) => o.primary === r.primary && o.slug !== r.slug && (o.indexable || !o.hasPage)).slice(0, 6);
  const body = `${bc.html}
      <p class="lead">${esc(lead)}</p>
      <p><a class="button" href="https://github.com/${esc(r.repo)}" target="_blank" rel="noopener">View ${esc(r.repo)} on GitHub</a></p>
      <section class="panel" aria-labelledby="facts-title">
        <h2 id="facts-title">At a glance</h2>
${facts}
      </section>
${badgeBlock(here, {
  badgePath: `${here}badge.svg`,
  value: "listed",
  target: url(here),
  heading: "Show the listing in your README",
  lede: r.skills.some((s) => s.shielded)
    ? `This general badge links to the repository listing. For the two quality badges and feature offer, choose <b>Get badges</b> beside a skill below. Each skill keeps its own score and grade.`
    : `This general badge links to the repository listing. Each skill keeps its own score and grade; skills scoring 80–99 add a numeric and a letter quality badge. Choose <b>Improve this score</b> beside a skill below to request a fresh review.`,
})}
${promotionOffer(here)}
      <section class="panel" aria-labelledby="skills-title">
        <h2 id="skills-title">Skills in ${esc(r.repo)}</h2>
        <p class="muted">Linked names open the skill's directory page; the rest open the skill folder on GitHub. Descriptions on rows without a page are quoted from each SKILL.md.</p>
${r.skills.length > 30 ? filterField("repo-skills", r.skills.length, "skills") : ""}
${skillTable(here, r.skills, { id: "repo-skills", showRepo: false, caption: "skills", showLicense: r.licenseCounts.length > 1 })}
      </section>
      <section class="panel" aria-labelledby="cited-title">
        <h2 id="cited-title">Where this repository is cited</h2>
        <p>${r.lists.length ? `${esc(r.repo)} appears in ${plural(r.lists.length, "curated list")}: ${r.lists.map(listLink).join(", ")}.` : `${esc(r.repo)} is listed as its publisher's official collection or from a listing request.`}</p>${citationEvidence(r.repo)}
      </section>
${relatedRepos.length ? `      <section class="panel" aria-labelledby="related-title">
        <h2 id="related-title">More ${esc(primary.short)} collections</h2>
        <div class="links">
${relatedRepos.map((o) => `          <a class="link-row" href="${rel(here, o.target)}"><b>${esc(o.repo)}</b><span>${plural(o.skills.length, "listed skill")}</span></a>`).join("\n")}
        </div>
      </section>` : ""}`;
  const title = [`${r.repo} Agent Skills (${r.skills.length}) | Suede Directory`, `${r.repo} Agent Skills (${r.skills.length})`, `${r.name} Agent Skills by ${r.owner}`, `${trimTo(r.repo, 46)} Agent Skills`].find((t) => t.length <= 60);
  const top = r.skills.slice(0, 3).map((s) => s.name).join(", ");
  const description = trimTo(`${plural(r.skills.length, "agent skill")} from ${r.repo}, including ${top}. Install steps, Suede Skill Check grades and a README badge.`, 158);
  const keywords = r.indexable ? setKeywords(here, [`${r.repo} skills`, `${r.name} skills`, `${r.owner} agent skills`, `${r.name} claude skills`, `${primary.short} agent skills`, "agent skills directory"]) : null;
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url(here)}#page`,
    name: title,
    description,
    url: url(here),
    dateModified: PAGE_DATE,
    isPartOf: { "@id": `${DIR_URL}#directory` },
    breadcrumb: { "@id": `${url(here)}#breadcrumb` },
    about: { "@type": "SoftwareSourceCode", name: r.repo, codeRepository: `https://github.com/${r.repo}` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: r.skills.length,
      itemListElement: r.skills.slice(0, 50).map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: s.featured ? url(skillPath(s)) : s.folder_url })),
    },
  };
  if (r.official) collection.about.author = { "@type": "Organization", name: r.publisher, url: `https://github.com/${r.owner}` };
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Skill collection &middot; ${esc(r.owner)}</div>
      <h1>${esc(r.name)} <span class="h1-sub">agent skills by ${esc(r.owner)}</span></h1>`,
    body,
    jsonld: [collection, bc.ld],
    robots: r.indexable ? undefined : "noindex, follow",
    footerNote: `${esc(r.repo)} is listed in the Suede Skills Directory, a curated index of public Agent Skills for Claude Code, Codex and other agents.`,
  }));
  files.set(`${here}badge.svg`, badgeSvg("listed").svg);
}

// ------------------------------------------------------------------ category pages

function topPicks(c, feat) {
  // Up to five featured skills from different repositories, the most-cited
  // first, each with the reason it is on the list.
  const picks = [];
  const usedRepos = new Set();
  const ordered = [...feat].sort((a, b) => Number(b.official) - Number(a.official) || b.lists.length - a.lists.length || a.id.localeCompare(b.id));
  for (const s of ordered) {
    if (usedRepos.has(s.repo_slug)) continue;
    usedRepos.add(s.repo_slug);
    picks.push(s);
    if (picks.length === 5) break;
  }
  return picks.map((s) => {
    const why = s.official
      ? `Published by ${publisherName(s.owner, true)}.`
      : s.lists.length
        ? `From ${s.repo}, cited by ${plural(s.lists.length, "curated list")}.`
        : `From ${s.repo}.`;
    return { s, why };
  });
}

function renderCategory(c) {
  const here = catPath(c.slug);
  const all = skillsByCat.get(c.slug);
  const feat = all.filter((s) => s.featured).sort((a, b) => b.lists.length - a.lists.length || a.id.localeCompare(b.id));
  const bc = crumbs(here, [["directory/", "Directory"], [null, c.title]]);
  const repoCounts = new Map();
  for (const s of all) repoCounts.set(s.repo_slug, (repoCounts.get(s.repo_slug) || 0) + 1);
  const topRepos = [...repoCounts.entries()]
    .filter(([slug]) => repos.get(slug).target)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12);
  const picks = topPicks(c, feat);
  const cards = feat
    .slice(0, 24)
    .map(
      (s) => `          <a class="dir-card" href="${rel(here, skillPath(s))}">
            <span class="dir-card-head"><b>${esc(s.name)}</b>${gradeChip(s)}</span>
            <span class="dir-card-repo">${esc(s.repo)}</span>
            <span class="dir-card-text">${esc(trimTo(s.summary, 140))}</span>
          </a>`
    )
    .join("\n");
  const sorted = [...all].sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name) || a.repo.localeCompare(b.repo));
  const others = categories.filter((o) => o.slug !== c.slug);
  const body = `${bc.html}
      <p class="lead">${esc(c.intro)}</p>
      <ul class="stat-row" aria-label="Category size">
        <li><b>${fmt(all.length)}</b> listed skills</li>
        <li><b>${fmt(repoCounts.size)}</b> repositories</li>
        <li><b>${fmt(feat.length)}</b> with full pages</li>
      </ul>
      <p><a class="button secondary" href="${rel(here, "directory/")}?category=${esc(c.slug)}#browse">Build a shortlist for your task →</a></p>
      <section class="panel" aria-labelledby="all-title">
        <h2 id="all-title">All ${fmt(all.length)} ${esc(c.short)} skills</h2>
${filterField("all-skills", all.length, "skills")}
${skillTable(here, sorted, { id: "all-skills", showRepo: true, caption: `${c.short} skills` })}
      </section>
      <section class="panel" aria-labelledby="choose-title">
        <h2 id="choose-title">How to choose ${esc(c.lower)} skills</h2>
${c.guide.map((p) => `        <p>${esc(p)}</p>`).join("\n")}
      </section>
${picks.length ? `      <section class="panel" aria-labelledby="picks-title">
        <h2 id="picks-title">Where to start</h2>
        <div class="links">
${picks.map(({ s, why }) => `          <a class="link-row" href="${rel(here, skillPath(s))}"><b>${esc(s.name)}</b><span>${esc(trimTo(s.summary, 120))} ${esc(why)}</span></a>`).join("\n")}
        </div>
      </section>` : ""}
${feat.length ? `      <section aria-labelledby="featured-title">
        <h2 id="featured-title">Featured ${esc(c.short)} skills</h2>
        <div class="dir-cards">
${cards}
        </div>
      </section>` : ""}
${topRepos.length ? `      <section class="panel" aria-labelledby="repos-title">
        <h2 id="repos-title">Top ${esc(c.short)} collections</h2>
        <div class="links">
${topRepos.map(([slug, n]) => `          <a class="link-row" href="${rel(here, repos.get(slug).target)}"><b>${esc(repos.get(slug).repo)}</b><span>${plural(n, `${c.short} skill`)}</span></a>`).join("\n")}
        </div>
      </section>` : ""}
      <section class="panel" aria-labelledby="other-title">
        <h2 id="other-title">Other skill directories</h2>
        <p class="cat-links">${others.map((o) => `<a href="${rel(here, catPath(o.slug))}">${esc(o.title)}</a>`).join(" &middot; ")}</p>
      </section>`;
  const title = c.seo_title;
  const description = c.meta;
  const keywords = setKeywords(here, [`${c.short} agent skills`, `${c.short} claude skills`, `${c.short} skills for codex`, `best ${c.short} skills`, "agent skills directory"]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Skill directory &middot; ${esc(c.label)}</div>
      <h1>${esc(c.title)} <span class="h1-sub">agent skills</span></h1>`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${url(here)}#page`,
        name: title,
        description,
        url: url(here),
        dateModified: PAGE_DATE,
        isPartOf: { "@id": `${DIR_URL}#directory` },
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: all.length,
          itemListElement: feat.slice(0, 30).map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: url(skillPath(s)) })),
        },
      },
      bc.ld,
    ],
    footerNote: `The ${esc(c.lower)} directory lists public Agent Skills that pass the Suede Skill Check, with links to every source repository.`,
  }));
}

// ------------------------------------------------------------------ hub

const POLICY_RULES = [
  "automate posting, messaging or account activity on a social platform (skills that draft posts or replies for a person to approve are listed);",
  "work around a site's blocks, CAPTCHAs or official API;",
  "have scraping a third-party site as their main job;",
  "collect people's personal data by scraping a social network or map listings (skills that use licensed B2B data providers within their terms are listed).",
]

const FAQ = [
  [
    "What is an agent skill?",
    "An agent skill is a folder with a SKILL.md file: a name, a one-line description of when to use it, and instructions the agent loads on demand. Claude Code, Codex, Cursor and other agents that support the Agent Skills format can install the same folder.",
  ],
  [
    "How do I install a skill from this directory?",
    "Each skill page lists up to three routes: the skills CLI (npx skills add with the skill folder's GitHub URL), a project-level copy into .claude/skills for Claude Code, and the Codex skill installer. Each route installs the folder from the author's GitHub repository. Skills published under license terms that restrict copying show those terms instead.",
  ],
  [
    "How are skills chosen and graded?",
    "The directory reads repositories cited by at least two of eight curated skill lists, plus the official collections those lists name and accepted listing requests. Each skill runs through the Suede Skill Check: a required frontmatter check and seven graded checks (five on the SKILL.md format, a declared license and a commit in the last year). Skills that pass the frontmatter check, declare a license, pass at least six of the seven graded checks and meet the listing rules are listed. Each listed skill then receives a quality score from 0 to 99 that adds description quality, instruction depth, bundled files, maintenance and curated-list citations to the structural checks, and a letter grade from that score.",
  ],
  [
    "How do I get my skill listed?",
    "Open a listing request on GitHub with the repository URL. Requests are reviewed by hand; an accepted repository is read at the next directory refresh, and its skills are listed if they pass the check.",
  ],
  ["Can I remove my skill from the directory?", "Yes. Open a removal request on GitHub and the skill comes out at the next build."],
];

function renderHub() {
  const here = "directory/";
  const bc = crumbs(here, [["", "Home"], [null, "Directory"]]);
  const catCards = categories.map((c) => `<a href="${rel(here, catPath(c.slug))}" data-category="${esc(c.slug)}"><span>${esc(c.title)}</span><span class="count-chip">${fmt(skillsByCat.get(c.slug).length)}</span></a>`).join("\n");
  const discovery = [...data.skills].sort((a, b) => b.lists.length - a.lists.length || Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
  files.set("directory/search-index.json", JSON.stringify(discovery.map((s) => ({
    name: s.name, repo: s.repo, description: s.summary || trimTo(s.description, 180),
    category: s.category, label: catBySlug.get(s.category).label, license: s.license,
    grade: s.grade, score: s.score, href: listingTarget(s).replace(BASE, ""), full: s.featured,
    report: `/${skillPath(s)}report.json`, snapshot: snapshot.date, method: SCORE_METHOD,
  }))) + "\n");
  const starters = categories.slice(0, 8).map((c) => discovery.find((s) => s.featured && s.category === c.slug)).filter(Boolean);
  const starterRows = starters.map((s) => `<article class="discovery-row"><div><p class="result-meta">${esc(catBySlug.get(s.category).label)} <span> / ${esc(s.repo)}</span></p><h3><a href="${rel(here, skillPath(s))}">${esc(s.name)}</a></h3><p>${esc(s.summary || trimTo(s.description, 180))}</p><p class="result-foot">${esc(s.license)} · Full skill page</p></div><div class="result-quality">${s.shielded ? `<img class="result-shield" src="badges/score-${s.score}.svg" alt="Suede S shield" width="80" height="88" loading="lazy">` : ""}<span class="grade grade-${s.grade.toLowerCase()}">${s.score}/100 · ${s.grade}</span></div></article>`).join("\n");
  const official = linkedRepos.filter((r) => r.official).sort((a, b) => b.skills.length - a.skills.length || a.slug.localeCompare(b.slug));
  const repoRow = (r) =>
    `          <a class="link-row" href="${rel(here, r.target)}"><b>${esc(r.repo)}</b><span>${plural(r.skills.length, "skill")} &middot; ${esc(catBySlug.get(r.primary).label)}${r.lists.length ? ` &middot; in ${plural(r.lists.length, "list")}` : ""}</span></a>`;
  const allRepos = [...linkedRepos].sort((a, b) => a.repo.toLowerCase().localeCompare(b.repo.toLowerCase()));
  const body = `${bc.html}
      <div class="directory-intro">
        <div><p class="lead">Find the right skill for your next task.</p><p>Search ${fmt(data.skills.length)} agent skills for Claude Code, Codex and Cursor. Inspect the source. Choose what to install.</p><p class="directory-snapshot">${fmt(repos.size)} repositories <span aria-hidden="true"> / </span> ${categories.length} categories <span aria-hidden="true"> / </span> ${openPct}% openly licensed</p></div>
        <aside class="grade-guide" aria-label="Suede quality grades"><div class="grade-guide-shields"><img src="badges/grade-a.svg" alt="Suede grade A: 90–99" width="96" height="105"><img src="badges/grade-b.svg" alt="Suede grade B: 80–89" width="96" height="105"></div><p><b>Structure. Description. Depth. Maintenance.</b><br>Scored 0–99. <a href="methodology/">What the scores measure →</a></p></aside>
      </div>
      <a class="featured-callout" href="featured/"><span><span class="featured-kind">The editorial selection</span><strong>Featured projects</strong><span>${EDITORIAL.projects.map((p) => esc(p.name)).join(" &amp; ")} — meet the latest directory applicants.</span></span><span aria-hidden="true">↗</span></a>
      <section class="directory-browser" id="browse" aria-labelledby="browse-title" data-directory-browser>
        <div class="browse-heading"><h2 id="browse-title">Explore the directory</h2><span class="muted">Public source. Clear license.</span></div>
        <form class="discovery-controls" role="search" hidden>
          <label for="directory-query">Search skills</label>
          <div class="search-line"><span aria-hidden="true" class="search-icon">⌕</span><input id="directory-query" name="q" type="search" placeholder="Try SEO audits, React, or code review" autocomplete="off" aria-describedby="search-help" aria-keyshortcuts="Control+k Meta+k"><button type="button" data-clear>Clear</button><kbd aria-hidden="true">Ctrl K</kbd></div>
          <p id="search-help" class="muted">Search by task, skill name or publisher.</p>
          <div class="discovery-filters"><label>Category<select name="category"><option value="">All categories</option>${categories.map((c) => `<option value="${esc(c.slug)}">${esc(c.title)}</option>`).join("")}</select></label><label>Quality grade<select name="grade"><option value="">All grades</option>${GRADE_BANDS.map(([g, band]) => `<option value="${g}">${g} · ${band}</option>`).join("")}</select></label><label>Sort by<select name="sort"><option value="curated">Most-cited collections</option><option value="name">Name A–Z</option><option value="score">Quality score</option></select></label></div>
        </form>
        <section class="task-shortlist" aria-labelledby="shortlist-title" data-shortlist hidden>
          <div class="browse-heading"><h3 id="shortlist-title">Your task shortlist</h3><span class="muted" data-shortlist-count>0 of 5 skills</span></div>
          <label for="shortlist-task">What are you working on?</label>
          <input id="shortlist-task" type="text" maxlength="120" placeholder="For example: review a React checkout" data-shortlist-task>
          <p class="muted">Choose up to five skills from the results. Your shortlist stays in this page’s URL, ready to bookmark or share.</p>
          <ul data-shortlist-items></ul>
          <p role="status" aria-live="polite" data-shortlist-status></p>
          <details data-shortlist-export hidden><summary>Copy your shortlist as Markdown</summary><div class="snippet"><div class="snippet-head"><span>Task, scores and report links</span><button type="button" data-copy-target="shortlist-markdown">Copy shortlist</button></div><pre><code id="shortlist-markdown"></code></pre></div></details>
        </section>
        <div class="discovery-layout">
          <aside class="category-rail"><details open><summary id="categories">Browse ${categories.length} categories</summary><nav aria-label="Skill categories"><a href="./" data-category="" aria-current="true"><span>All skills</span><span class="count-chip">${fmt(data.skills.length)}</span></a>${catCards}</nav></details></aside>
          <div class="discovery-content"><div class="result-heading"><h3 data-result-title>Start exploring</h3><span class="muted" role="status" aria-live="polite" data-results-status>${starters.length} skills to explore</span></div><div data-search-error hidden><p>Search could not load. Try again, or browse a category.</p><button type="button" data-retry>Try again</button></div><div class="search-loading" hidden aria-hidden="true"><span></span><span></span><span></span></div><div data-search-results>${starterRows}</div><div class="search-empty" hidden><h3>No skills match these filters</h3><p>Try fewer words or a broader category.</p><button type="button" data-reset>Clear all filters</button></div><button type="button" class="load-more" data-load-more hidden>Show more skills</button><noscript><p>Choose a category to browse every listed skill. Search is available with JavaScript enabled.</p></noscript></div>
        </div>
      </section>
      <section class="panel" aria-labelledby="cited-title">
        <h2 id="cited-title">Most-cited skill collections</h2>
        <p>Repositories that appear in the most curated skill lists.</p>
        <div class="links">
${linkedRepos.slice(0, 18).map(repoRow).join("\n")}
        </div>
      </section>
      <section class="panel" aria-labelledby="official-title">
        <h2 id="official-title">Skills from the companies behind the tools</h2>
        <p>Collections published by the company that makes the product, framework or service the skills work with.</p>
        <div class="links">
${official.slice(0, 24).map(repoRow).join("\n")}
        </div>
      </section>
      <section class="panel" aria-labelledby="how-title">
        <h2 id="how-title">How a skill gets listed</h2>
        <p>The directory reads every SKILL.md in the repositories cited by at least two of ${plural(data.sources.length, "curated list")}, including ${data.sources.slice(0, 3).map(listLink).join(", ")}, plus the official collections those lists name and accepted listing requests. Each skill runs through the Suede Skill Check. Skills that pass the required frontmatter check, declare a license and pass at least six of seven graded checks are listed with a quality score from 0 to 99, one listing per skill: when a copy of a skill appears in several repositories, the copy in the most-cited repository keeps the listing. <a href="${rel(here, "directory/methodology/")}">Read the full method</a>.</p>
      </section>
${badgeBlock(here, {
  badgePath: "directory/badge.svg",
  value: "listed",
  target: DIR_URL,
  heading: "For skill authors: show your listing",
  lede: `Every skill scoring 80–99 has two README shields: its numeric quality score and its A/B grade. Both link to its Suede listing. Find <b>Get badges</b> on a repository page or <b>README badge</b> on a full skill page. <a href="${rel(here, "directory/submit/")}">Request a listing</a> if your skill is not here yet.`,
})}
${promotionOffer(here)}
${promotionSection(here, promoted)}
      <section class="panel" aria-labelledby="all-repos-title">
        <h2 id="all-repos-title">All listed repositories</h2>
        <p class="repo-index">${allRepos.map((r) => `<a href="${rel(here, r.target)}">${esc(r.repo)}</a>`).join(" &middot; ")}</p>
      </section>
      <section class="panel" aria-labelledby="pack-title">
        <h2 id="pack-title">Suede's own skills</h2>
        <p>The <a href="${rel(here, "skills/")}">Suede Creator Skills</a> pack is catalogued separately, with a page per skill and a one-command install for the whole pack.</p>
      </section>
      <section class="panel faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Questions</h2>
${FAQ.map(([q, a]) => `        <h3>${esc(q)}</h3>\n        <p>${esc(a)}</p>`).join("\n")}
      </section>`;
  const title = "Agent Skills Directory: Claude and Codex Skills";
  const description = trimTo(`Browse ${fmt(data.skills.length)} agent skills for Claude Code, Codex and Cursor from ${fmt(repos.size)} GitHub repositories, in ${categories.length} categories, each graded and linked to its source.`, 158);
  const keywords = setKeywords(here, ["agent skills directory", "claude skills directory", "SKILL.md directory", "best claude skills", "ai agent skills list", "Suede Skills Directory"]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede Skills Directory</div>
      <h1>Agent Skills Directory</h1>`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${DIR_URL}#directory`,
        name: SITE_NAME,
        headline: title,
        description,
        url: DIR_URL,
        dateModified: PAGE_DATE,
        inLanguage: "en",
        isPartOf: { "@type": "WebSite", "@id": `${BASE}/#website`, name: "Suede Creator Skills", url: `${BASE}/` },
        publisher: { "@type": "Organization", "@id": "https://suedeai.ai/#organization", name: "Suede AI", url: "https://suedeai.ai" },
        breadcrumb: { "@id": `${DIR_URL}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: categories.length,
          itemListElement: categories.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, url: url(catPath(c.slug)) })),
        },
      },
      bc.ld,
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${DIR_URL}#faq`,
        mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
    footerNote: "The Suede Skills Directory is a curated index of public Agent Skills. Every listing links to the author's repository; Suede hosts no third-party code.",
  }));
}

// ------------------------------------------------------------------ methodology and submit

function renderFeaturedProjects() {
  const here = "directory/featured/";
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Featured projects"]]);
  const title = "Featured Projects | Suede Skills Directory";
  const description = `Meet ${EDITORIAL.projects.map((p) => p.name).join(", ")}: explore selected agent workflows, reviewed source and setup in the Suede Skills Directory.`;
  const keywords = setKeywords(here, ["featured agent projects", ...EDITORIAL.projects.map((p) => `${p.name} agent workflows`), "Suede Skills Directory"]);
  files.set(`${here}index.html`, page({
    here, title, description, keywords,
    h1Html: `<div class="eyebrow">Suede Skills Directory · Editorial selection</div><h1>Featured projects</h1>`,
    body: `${bc.html}
      <div class="featured-intro"><p class="lead">Good tools deserve a closer look.</p><p>Meet the latest accepted applicants and their selected workflows. Choose a project, inspect its reviewed source, and start with the right setup.</p></div>
      <nav class="featured-jump" aria-label="Featured project navigation"><a href="../">← Browse all skills</a>${EDITORIAL.projects.map((p) => `<a href="#${p.id}">${esc(p.name)} <span aria-hidden="true">↓</span></a>`).join("")}</nav>
      ${featuredProjectsHtml(EDITORIAL.projects, { esc, rel, here })}
      <section class="panel featured-about" aria-labelledby="selection-title"><div><p class="featured-kind">How this page works</p><h2 id="selection-title">Selected for a closer look.</h2></div><div><p>These editorial features introduce accepted project submissions and their reviewed scope. Individual skill pages carry the directory’s quality scores. README-badge verification is tracked separately.</p><p><a href="../methodology/">How directory checks work →</a></p><a class="featured-submit" href="../submit/">Submit your project →</a></div></section>`,
    jsonld: [{
      "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url(here)}#featured`,
      name: "Featured projects", headline: title, description, url: url(here), dateModified: PAGE_DATE,
      inLanguage: "en", breadcrumb: { "@id": `${url(here)}#breadcrumb` },
      isPartOf: { "@type": "CollectionPage", "@id": `${DIR_URL}#directory`, url: DIR_URL, name: SITE_NAME },
      mainEntity: { "@type": "ItemList", numberOfItems: EDITORIAL.projects.length,
        itemListElement: EDITORIAL.projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${url(here)}#${p.id}` })) },
    }, bc.ld],
    footerNote: "Editorial project selections from the Suede Skills Directory. Source and installation details belong to each publisher.",
  }));
}

function renderMethodology() {
  const here = "directory/methodology/";
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Methodology"]]);
  const total = data.skills.length;
  const rubricRows = RUBRIC.map((r) => `            <tr><td>${esc(r.label)}</td><td>${r.max}</td><td>${esc(r.rule)}</td></tr>`).join("\n");
  const gradeRows = GRADE_BANDS.map(([g, band]) => `            <tr><td><span class="grade grade-${g.toLowerCase()}">${g}</span></td><td>${band}</td><td>${fmt(dist.grades[g])}</td></tr>`).join("\n");
  const rows = CHECKS.map((c) => `            <tr><td><code>${esc(c.id)}</code></td><td>${esc(c.label)}</td><td>${fmt(data.skills.filter((s) => s.checks[c.id]).length)} of ${fmt(total)}</td></tr>`).join("\n");
  const body = `${bc.html}
      <p class="lead">The directory lists public Agent Skills that pass a published, mechanical check. This page is the whole method: where skills come from, what is checked, what gets a page of its own, and how to change a listing.</p>
      <section class="panel" aria-labelledby="sources-title">
        <h2 id="sources-title">Where the skills come from</h2>
        <p>The directory reads the repositories cited by at least two of these ${plural(data.sources.length, "curated list")}: ${data.sources.map(listLink).join(", ")}. It adds the official collections those lists name and repositories accepted through <a href="${rel(here, "directory/submit/")}">listing requests</a>. Every SKILL.md in those repositories is read from the default branch, except in hidden folders and dependency or build folders (node_modules, vendor, dist, build), and nothing in them is executed. Accepted requests may name exact canonical skill folders, including a publisher’s hidden distribution folder; only those reviewed roots and skill names are included. System skills, unreviewed mirrors and fixtures remain excluded. This snapshot was taken on ${longDate(data.generated)}.</p>
      </section>
      <section class="panel" aria-labelledby="check-title">
        <h2 id="check-title">The Suede Skill Check</h2>
        <p>Reviewed listings may also supply supplementary citations from independent curated collections. Each document is pinned to a commit, checked for a direct repository link and reverified on refresh. These citations use the same scoring rubric and do not expand the discovery lists above.</p>
        <p>Every SKILL.md runs through a required frontmatter check and seven graded checks: five on the SKILL.md format, following the <a href="https://agentskills.io/specification" target="_blank" rel="noopener">Agent Skills format</a>, plus a declared license and a commit to the repository in the last year. These checks decide the listing. The quality score then measures how much each listed skill gives an agent to work with.</p>
        <div class="table-wrap">
          <table class="checks">
            <thead><tr><th scope="col">Check</th><th scope="col">What passes</th><th scope="col">Listed skills passing</th></tr></thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>
        <h3 id="score">How the quality score is built</h3>
        <p>The score adds whole points from eleven components, all read from published evidence: the SKILL.md frontmatter, description and body, the files in the skill folder, the repository’s last commit and the curated lists that cite it. The rubric totals 100 points.</p>
        <div class="table-wrap">
          <table class="checks">
            <thead><tr><th scope="col">Component</th><th scope="col">Points</th><th scope="col">How the points are earned</th></tr></thead>
            <tbody>
${rubricRows}
            </tbody>
          </table>
        </div>
        <p>The published score is the total, capped at ${SCORE_CAP}. 100 is reserved: structural evidence can show that a skill is well formed, well described, documented and maintained, but it cannot prove a skill perfect, so the scale tops out at ${SCORE_CAP}. All arithmetic uses whole numbers; nothing is rounded. Missing evidence earns zero points for its component. A source fetch failure is unscored and stops a refresh from replacing the published snapshot.</p>
        <h3 id="grades">Grades in this snapshot</h3>
        <div class="table-wrap">
          <table class="checks">
            <thead><tr><th scope="col">Grade</th><th scope="col">Score</th><th scope="col">Listed skills</th></tr></thead>
            <tbody>
${gradeRows}
            </tbody>
          </table>
        </div>
        <p>Across ${fmt(total)} listed skills, the highest score is ${dist.max} and the median is ${dist.median}. ${dist.top ? `${plural(dist.top, "listed skill")} ${dist.top === 1 ? "scores" : "score"} 96–${SCORE_CAP}` : `No listed skill scores 96–${SCORE_CAP}`}, and ${fmt(dist.shielded)} score 80–${SCORE_CAP} and carry the quality shields. Failed required frontmatter receives grade F and is not listed.</p>
        <p>The score measures the recorded SKILL.md structure and description, instruction depth, bundled files, license declaration, maintenance and citation evidence. It does not measure runtime performance. Frontmatter is a separate required gate; a declared license and all listing-policy rules still apply.</p>
        <h3>Security scan status is separate</h3>
        <p>External directory skills are marked <b>not scanned</b>. The HOL/Cisco CI scanners run on Suede’s own repository; their results do not certify the external repositories listed here. The shields’ “Suede Certified” label refers to the published structural quality check. A security result needs its own per-skill scan evidence.</p>
      </section>
      <section class="panel" aria-labelledby="authors-title">
        <h2 id="authors-title">Two README badges and a limited-time feature offer</h2>
        <p>Skills scoring 80–${SCORE_CAP} receive separate numeric and A/B shields, each linking to their actual Suede listing. Scores from 90–${SCORE_CAP} and grade A use gold; scores from 80–89 and grade B use cool metallic styling. The Suede S remains the main mark on both shields. Every listed skill, at any score, keeps its listing badge, and its existing <code>badge.svg</code> and <code>score.svg</code> links keep working.</p>
        <p>Display either the numeric or letter badge in your repository or skill README, linked to your Suede listing, then request verification. Displaying both also qualifies. Suede checks the rendered README at a recorded commit before a feature placement is activated. An unverified request, no valid linked badge or failed fetch cannot activate promotion. Verification is checked again after a dataset refresh. Existing editorial full pages keep their separate rules.</p>
        ${promotionOffer(here)}
        <p><b>Scored below 80?</b> We welcome authors who want help improving their skills. Each full skill page lists its points by component. <a href="${rel(here, "directory/submit/")}#improve">Send your repository and the points you want to raise</a>, then request a new review after updating the skill.</p>
      </section>
      <section class="panel" aria-labelledby="rules-title">
        <h2 id="rules-title">Listing rules</h2>
        <ul>
          <li>The required frontmatter check, a declared license and at least six of the seven graded checks on the Suede Skill Check. Every listed skill shows its quality score and grade.</li>
          <li>A license declared in the SKILL.md frontmatter or the repository. Every listing states it; ${openPct}% of listed skills use an open-source or open-content license, and pages for the rest flag the terms next to the license.</li>
          <li>A description written mainly in English, so the directory's pages read consistently.</li>
          <li>Templates, examples, drafts, test fixtures and folders named archive, deprecated, internal or prompts, or starting with an underscore, are skipped.</li>
          <li>One listing per skill. A copy is the same skill name with a mostly matching description, or a description repeated word for word under another name. When copies appear in several repositories, the copy in the repository cited by the most lists keeps the listing.</li>
          <li>Skills are not listed when they:
            <ul>
${POLICY_RULES.map((r) => `              <li>${esc(r)}</li>`).join("\n")}
            </ul>
            A vendor's skills for its own service are listed under the second and third rules. A repository whose product is one of these behaviors is left out as a whole.
          </li>
          <li>Skills are also left out when their name or description trips the site's content filters: adult content, malware terms, jailbreaks outside a defensive context, the short list of terms the site's own public-copy guard rejects, and listing text that fails the site's public-privacy check (an email address, a phone number or a home-directory path). The exact terms are in <a href="https://github.com/JasonColapietro/suede-creator-skills/blob/main/scripts/directory/curate.py" target="_blank" rel="noopener">curate.py</a>. Removals at an author's request, and skills whose text matches the pack's reserved-text guard, are recorded with their reason in <a href="https://github.com/JasonColapietro/suede-creator-skills/blob/main/directory/exclusions.json" target="_blank" rel="noopener">exclusions.json</a>.</li>
          <li>Suede's own skills are catalogued separately on this site and pass the same rules; a test in the repository checks every one of them against the policy.</li>
        </ul>
      </section>
      <section class="panel" aria-labelledby="pages-title">
        <h2 id="pages-title">Which skills get a full page</h2>
        <p>Every listed skill appears in its category directory and on its repository's page. Skills that pass all seven graded checks get a page of their own once the directory's editors have written their one-sentence summary, up to twelve per repository, chosen by how much ships with the skill: reference files, scripts, assets and a structured SKILL.md. A skill keeps its page while it stays listed, so its README badge and link keep working. Each page carries the summary, a pre-install list of the scripts, commands, environment variables and network use found in the skill's files, install steps (or, where the license restricts copying, the publisher's terms), and a README badge. ${fmt(featured.length)} skills have a full page in this snapshot. A repository whose single listed skill has a page is listed through that page.</p>
      </section>
      <section class="panel" aria-labelledby="cat-title">
        <h2 id="cat-title">Categories</h2>
        <p>Categories group skills by their main task, so you can compare alternatives side by side. Each skill sits in one of ${categories.length} categories, assigned from its name and description.</p>
      </section>
      <section class="panel" aria-labelledby="change-title">
        <h2 id="change-title">Refreshes and changes</h2>
        <p>Each refresh re-reads the source repositories, so quoted descriptions, file facts and check results follow the published SKILL.md. To request a listing, a correction or a removal, use the <a href="${rel(here, "directory/submit/")}">listing request page</a>; requests are reviewed by hand.</p>
      </section>`;
  const title = "How the Agent Skills Directory Lists Skills";
  const description = "The method behind the Suede Skills Directory: source lists, the Suede Skill Check, the 0–99 quality score, grades, listing rules and full pages.";
  const keywords = setKeywords(here, ["agent skill quality check", "SKILL.md best practices", "agent skills specification", "skill grading", "Suede Skill Check"]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede Skills Directory &middot; Method</div>
      <h1>How skills are listed and graded</h1>`,
    body,
    jsonld: [
      { "@context": "https://schema.org", "@type": "WebPage", "@id": `${url(here)}#page`, name: title, description, url: url(here), dateModified: PAGE_DATE, isPartOf: { "@id": `${DIR_URL}#directory` }, breadcrumb: { "@id": `${url(here)}#breadcrumb` } },
      bc.ld,
    ],
    footerNote: "The Suede Skill Check reads published SKILL.md files and the files beside them. It executes nothing.",
  }));
}

function renderSubmit() {
  const here = "directory/submit/";
  const bc = crumbs(here, [["directory/", "Directory"], [null, "List your skill"]]);
  const body = `${bc.html}
      <p class="lead">Put your skill in front of people browsing for exactly what it does. Listing is free: send the repository, and skills that pass the Suede Skill Check get a category placement and a listing page with a README badge that links to it.</p>
      <p><a class="button" href="${ISSUE_URL}" target="_blank" rel="noopener">Request a listing on GitHub</a></p>
      <section class="panel" aria-labelledby="steps-title">
        <h2 id="steps-title">How it works</h2>
        <ol class="steps">
          <li><b>Publish the skill</b> in a public GitHub repository as a folder with a SKILL.md, a license and a description that says when to use it.</li>
          <li><b>Open a listing request</b> with the repository URL. One request can cover the repository or specific named skills; a request naming selected skills covers only those accepted names.</li>
          <li><b>The request is reviewed by hand.</b> An accepted repository is read at the next directory refresh and runs through the <a href="${rel(here, "directory/methodology/")}">Suede Skill Check</a> and the listing rules. Skills that pass the frontmatter check, declare a license and pass at least six of seven graded checks are listed with their quality score and grade.</li>
          <li><b>Add either badge.</b> Listed skills scoring 80–99 get two shields: a numeric score and an A/B grade, each linking to their Suede listing. Choose either badge or both from the listing and request README verification for the limited-time feature offer.</li>
        </ol>
      </section>
      <section class="panel" id="improve" aria-labelledby="pass-title">
        <h2 id="pass-title">Improve your score</h2>
        <p>Below 80? Send your repository and ask for help with the points you want to raise. Authors are welcome to improve their skill and request a fresh review; skills that reach 80 add the numeric and letter quality shields.</p>
        ${promotionOffer(here)}
        <ul>
          <li>Start SKILL.md with YAML frontmatter that declares <code>name</code> and <code>description</code>.</li>
          <li>Use a lowercase, hyphenated name that matches the folder name, 64 characters or fewer.</li>
          <li>Write a description of 150 to 600 characters that says what the skill does and when to use it, for example "Use when ...", names when not to use it ("Not for ..."), and quotes an example request.</li>
          <li>Give the agent 500 to 3,000 words of instructions, in 500 lines or fewer; move long reference material into a <code>references/</code> folder and helper scripts into a <code>scripts/</code> folder.</li>
          <li>Declare <code>allowed-tools</code> and <code>compatibility</code> in the frontmatter.</li>
          <li>Declare a license in the frontmatter or ship a LICENSE file in the repository, and keep the repository maintained: recent commits earn up to 9 points.</li>
        </ul>
        <p>The <a href="${rel(here, "directory/methodology/")}#score">scoring rubric</a> lists every component and its points.</p>
        <h3>Updated your skill?</h3>
        <p>Choose <b>Request a fresh review</b> on the skill’s report or repository listing. The form carries the exact skill name and previous snapshot. Add the changed commit or pull request and the points you improved. Suede reviews requests by hand and rechecks accepted changes at a directory refresh.</p>
        <p>Each listing offers a downloadable JSON report with its snapshot date, report version, score breakdown and methodology. Source commit IDs appear when recorded by the refresh; older snapshots say when the revision was not recorded. External skills remain marked <b>not scanned</b>.</p>
      </section>
${badgeBlock(here, {
  badgePath: "directory/badge.svg",
  value: "listed",
  target: DIR_URL,
  heading: "The directory badge",
  lede: "Each listing has its own badge on its page. This general version links to the directory home.",
})}
      <section class="panel" aria-labelledby="changes-title">
        <h2 id="changes-title">Corrections and removals</h2>
        <p>Use the same <a href="${ISSUE_URL}" target="_blank" rel="noopener">request form</a> to correct a category, update details or remove a listing. Removals take effect at the next build.</p>
      </section>`;
  const title = "List Your Agent Skill | Suede Skills Directory";
  const description = "Request a free listing for your agent skill. Pass the Suede Skill Check to get a category placement and a README badge that links to your listing.";
  const keywords = setKeywords(here, ["submit agent skill", "list claude skill", "agent skill badge", "skill directory submission", "Suede Skills Directory badge"]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede Skills Directory &middot; For authors</div>
      <h1>List your agent skill</h1>`,
    body,
    jsonld: [
      { "@context": "https://schema.org", "@type": "WebPage", "@id": `${url(here)}#page`, name: title, description, url: url(here), dateModified: PAGE_DATE, isPartOf: { "@id": `${DIR_URL}#directory` }, breadcrumb: { "@id": `${url(here)}#breadcrumb` } },
      bc.ld,
    ],
    footerNote: "Listing in the Suede Skills Directory is free. The directory links to your repository and hosts none of your code.",
  }));
}

// A site-wide 404 so a removed listing, or any mistyped URL, lands somewhere
// useful. GitHub Pages serves docs/404.html at whatever path was requested,
// so every link on it is root-absolute. The inline rule repeats skill.css's
// 44px hamburger size for checks that read only the page's own styles.
function render404() {
  files.set("404.html", page({
    here: "",
    absolute: true,
    canonical: false,
    robots: "noindex",
    extraStyle: "@media (max-width: 768px) { .nav-disclosure > summary.nav-hamburger { width: 44px; height: 44px; } }",
    title: "Page not found | Suede Creator Skills",
    description: "This page is not on skills.suedeai.ai. Browse the Agent Skills Directory or the Suede Creator Skills pack instead.",
    keywords: null,
    h1Html: `      <div class="eyebrow">404</div>
      <h1>This page is not here</h1>`,
    body: `      <p class="lead">The address may be mistyped, or the listing may have left the directory at a refresh. Everything still listed is one click away.</p>
      <p><a class="button" href="/directory/">Browse the Agent Skills Directory</a> <a class="button secondary" href="/skills/">Suede Creator Skills</a></p>
      <section class="panel" aria-labelledby="cats-title">
        <h2 id="cats-title">Skill directories</h2>
        <p class="cat-links">${categories.map((c) => `<a href="/directory/${c.slug}/">${esc(c.title)}</a>`).join(" &middot; ")}</p>
      </section>`,
    jsonld: [],
    footerNote: "Suede Creator Skills and the Agent Skills Directory are published at skills.suedeai.ai.",
  }));
}

// ------------------------------------------------------------------ run

renderHub();
renderFeaturedProjects();
renderMethodology();
renderSubmit();
render404();
for (const c of categories) renderCategory(c);
for (const r of repos.values()) if (r.hasPage) renderRepo(r);
for (const s of featured) renderSkill(s);
for (const s of data.skills) files.set(`${skillPath(s)}report.json`, JSON.stringify(skillReport(s)) + "\n");
// Quality shields only for listed skills scoring 80-99. A listed skill below
// 80 keeps valid badge.svg and score.svg URLs, which serve the general listing
// badge (the repository-level badge.svg) until its score qualifies.
const listingBadge = badgeSvg("listed").svg;
for (const s of data.skills) {
  if (s.shielded) {
    files.set(`${skillPath(s)}score.svg`, shieldSvg(s.score, "score"));
    files.set(`${skillPath(s)}badge.svg`, shieldSvg(s.score, "grade"));
    files.set(`directory/badges/score-${s.score}.svg`, shieldSvg(s.score, "score"));
  } else {
    files.set(`${skillPath(s)}score.svg`, listingBadge);
    files.set(`${skillPath(s)}badge.svg`, listingBadge);
  }
}
// The shared grade previews on the directory home and in authors' docs.
files.set("directory/badges/grade-a.svg", shieldSvg(90, "grade"));
files.set("directory/badges/grade-b.svg", shieldSvg(80, "grade"));
files.set("directory/badge.svg", listingBadge);

// llms.txt carries one line about the directory, with live counts.
const llmsPath = path.join(docsRoot, "llms.txt");
const llmsLine = `- [Agent Skills Directory](${DIR_URL}): A curated index of ${fmt(data.skills.length)} public Agent Skills (${openPct}% under an open-source or open-content license) from ${repos.size} other GitHub repositories, in ${categories.length} category directories. Every listing links to the author's repository, passes the Suede Skill Check's structural listing gate, shows a 0–99 quality score and letter grade, and states its license; the ${fmt(dist.shielded)} skills scoring 80–99 offer numeric and letter README badges (either valid linked badge can qualify for verified promotion); security scan status is separately marked not scanned; full skill pages summarize the scripts, credentials and network calls found in the skill's files; [how skills are listed](${DIR_URL}methodology/).`;
const llmsCurrent = fs.readFileSync(llmsPath, "utf8");
const LLMS_RE = /^- \[Agent Skills Directory\]\(.*$/m;
if (!LLMS_RE.test(llmsCurrent)) throw new Error("docs/llms.txt has no Agent Skills Directory line to keep current");
const llmsNext = llmsCurrent.replace(LLMS_RE, llmsLine);

const keywordsJson = `${JSON.stringify(Object.fromEntries(Object.entries(keywordMap).sort(([a], [b]) => a.localeCompare(b))), null, 1)}\n`;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const abs = path.join(dir, e.name);
    return e.isDirectory() ? walk(abs) : [abs];
  });
}

// Resolve each page's date: keep the committed date when nothing else changed.
const DATE_RE = /"dateModified": "(\d{4}-\d{2}-\d{2})"/;
function dated(abs, content) {
  if (!content.includes(PAGE_DATE)) return content;
  const existing = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
  const m = existing && existing.match(DATE_RE);
  if (m && content.split(PAGE_DATE).join(m[1]) === existing) return existing;
  return content.split(PAGE_DATE).join(localToday());
}

const expected = new Map([...files.entries()].map(([p, c]) => [path.join(docsRoot, p), c]));
for (const [abs, c] of expected) expected.set(abs, dated(abs, c));
expected.set(keywordsPath, keywordsJson);
expected.set(llmsPath, llmsNext);
const onDisk = walk(outRoot);

if (checkOnly) {
  const problems = [];
  for (const [abs, content] of expected) {
    if (!fs.existsSync(abs)) problems.push(`missing ${path.relative(repoRoot, abs)}`);
    else if (fs.readFileSync(abs, "utf8") !== content) problems.push(`stale ${path.relative(repoRoot, abs)}`);
  }
  for (const abs of onDisk) if (!expected.has(abs)) problems.push(`orphan ${path.relative(repoRoot, abs)}`);
  if (problems.length) {
    console.error(`docs/directory is out of date (${problems.length} files). Run: node scripts/build-directory.mjs`);
    for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log(`docs/directory is up to date (${files.size} files).`);
  process.exit(0);
}

for (const abs of onDisk) if (!expected.has(abs)) fs.rmSync(abs);
for (const [abs, content] of expected) {
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (!fs.existsSync(abs) || fs.readFileSync(abs, "utf8") !== content) fs.writeFileSync(abs, content);
}
// Drop directories emptied by a skill or repository that left the dataset.
function pruneEmpty(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) pruneEmpty(path.join(dir, e.name));
  }
  if (dir !== outRoot && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}
pruneEmpty(outRoot);
console.log(`Wrote ${files.size} files (docs/directory and docs/404.html) and ${Object.keys(keywordMap).length} keyword entries.`);
