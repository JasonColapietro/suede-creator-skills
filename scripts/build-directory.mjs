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
import { fileURLToPath } from "node:url";

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

const data = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "skills.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "categories.json"), "utf8"));
const CHECKS = data.checks;
const NOTES = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "notes.json"), "utf8"));

for (const c of categories) {
  if (c.seo_title.length > 60) throw new Error(`categories.json: seo_title over 60 characters for ${c.slug}`);
  if (c.meta.length > 160) throw new Error(`categories.json: meta over 160 characters for ${c.slug}`);
}

// skills.json is stored compact (see scripts/directory/curate.py): expand each
// record with its repository facts, slugs and GitHub URLs. slugify matches the
// Python one that keyed directory/labels.json.
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "skill";
data.skills = data.skills.map((c) => {
  const meta = data.repos[c.repo];
  if (!meta) throw new Error(`skills.json: no repos entry for ${c.repo}`);
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
    body_lines: c.size[0],
    body_words: c.size[1],
    file_count: c.size[2],
    has_references: c.kinds.includes("r"),
    has_scripts: c.kinds.includes("s"),
    has_assets: c.kinds.includes("a"),
    allowed_tools: c.allowed_tools || null,
    compatibility: c.compatibility || null,
    install: c.install || null,
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
  const licCounts = new Map();
  for (const s of r.skills) licCounts.set(s.license, (licCounts.get(s.license) || 0) + 1);
  r.licenseCounts = [...licCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const RESERVED = new Set(["methodology", "submit", ...categories.map((c) => c.slug)]);
for (const r of repos.values()) {
  const owner = r.slug.split("/")[0];
  if (RESERVED.has(owner)) throw new Error(`owner slug "${owner}" collides with a reserved directory path`);
}

const featured = data.skills.filter((s) => s.featured);
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

const gradeChip = (g) => `<span class="grade grade-${g.toLowerCase()}" title="Suede Skill Check grade ${g}">${g}</span>`;
const listLink = (l) => `<a href="https://github.com/${esc(l)}" target="_blank" rel="noopener">${esc(l)}</a>`;
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
  return `            <tr${id}><td class="name">${nameCell} ${gradeChip(s.grade)}</td><td class="meta">${second}</td><td class="desc">${esc(desc)}</td></tr>`;
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
  return `        <p><label class="filter-label" for="${id}-filter">Filter by name, repository or task</label></p>
        <p><input id="${id}-filter" class="filter" type="search" placeholder="Filter ${fmt(total)} ${noun}" data-filter-for="${id}" data-filter-status="${id}-status" autocomplete="off"> <span id="${id}-status" class="muted" role="status" aria-live="polite"></span></p>`;
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
  return `      <section class="panel" aria-labelledby="install-title">
        <h2 id="install-title">Install ${esc(s.name)}</h2>
        <p>The skills CLI works with Claude Code, Codex, Cursor and other agents; the other routes copy the folder by hand.</p>
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
  const passed = CHECKS.filter((c) => s.checks[c.id]).length;
  return passed === CHECKS.length ? "Passes all eight checks" : `Passes ${["zero", "one", "two", "three", "four", "five", "six", "seven"][passed]} of eight checks`;
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
    ["Suede Skill Check", `${gradeChip(s.grade)} <a href="#check">${checkSummary(s)}</a>`],
    ["README badge", `<a href="#badge">Get the badge for this listing</a>`],
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
        <h2 id="check-title">Suede Skill Check: grade ${s.grade}</h2>
        <p>${esc(s.name)} ${checkSummary(s).toLowerCase()}: the eight cover the SKILL.md format, a declared license and a commit in the last year. <a href="${rel(here, "directory/methodology/")}">How the check works</a>.</p>
        <details class="check-details">
          <summary>See the eight checks</summary>
          <div class="table-wrap">
            <table class="checks">
              <thead><tr><th scope="col">Check</th><th scope="col">Result</th></tr></thead>
              <tbody>
${checks}
              </tbody>
            </table>
          </div>
        </details>
      </section>
${badgeBlock(here, {
  badgePath: `${here}badge.svg`,
  value: `Grade ${s.grade}`,
  target: url(here),
  heading: `Badge for ${esc(s.name)}`,
  lede: `Maintainers of ${esc(s.repo)} can show this listing in the skill's README. The badge links back to this page and shows the grade from the latest directory build.`,
})}
      <section class="panel" aria-labelledby="cited-title">
        <h2 id="cited-title">Where this skill is cited</h2>
        <p>${s.lists.length ? `${esc(s.repo)} appears in ${plural(s.lists.length, "curated list")}: ${s.lists.map(listLink).join(", ")}.` : `${esc(s.repo)} is listed from its publisher's official collection or a listing request.`}</p>
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
    description: ensureSentence(s.summary),
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
      <h1>${esc(s.name)} <span class="h1-sub">agent skill</span></h1>`,
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
  files.set(`${here}badge.svg`, badgeSvg(`Grade ${s.grade}`).svg);
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
    ["Categories", catLinks.join(", ")],
    ["License", esc(licenseText)],
    ["Last commit", longDate(r.commit)],
    // A root SKILL.md hides the nested skills from the skills CLI, so a
    // whole-repository install would bring only that one.
    // Hidden when it would also install a skill the directory withholds, one
    // whose license restricts copying, or only a root skill that hides the rest.
    ["Install every skill", r.withheld || r.skills.some((s) => licenseKind(s) === "restricted") || (r.hasRootSkill && r.skills.length > 1) ? "" : `<code>npx skills add https://github.com/${esc(r.repo)}</code>`],
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
  lede: `Maintainers of ${esc(r.repo)} can add this badge to the repository README. It links to this page, where visitors see every listed skill, its license and its source.`,
})}
      <section class="panel" aria-labelledby="skills-title">
        <h2 id="skills-title">Skills in ${esc(r.repo)}</h2>
        <p class="muted">Linked names open the skill's directory page; the rest open the skill folder on GitHub. Descriptions on rows without a page are quoted from each SKILL.md.</p>
${r.skills.length > 30 ? filterField("repo-skills", r.skills.length, "skills") : ""}
${skillTable(here, r.skills, { id: "repo-skills", showRepo: false, caption: "skills", showLicense: r.licenseCounts.length > 1 })}
      </section>
      <section class="panel" aria-labelledby="cited-title">
        <h2 id="cited-title">Where this repository is cited</h2>
        <p>${r.lists.length ? `${esc(r.repo)} appears in ${plural(r.lists.length, "curated list")}: ${r.lists.map(listLink).join(", ")}.` : `${esc(r.repo)} is listed as its publisher's official collection or from a listing request.`}</p>
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
            <span class="dir-card-head"><b>${esc(s.name)}</b>${gradeChip(s.grade)}</span>
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
      <section class="panel" aria-labelledby="all-title">
        <h2 id="all-title">All ${fmt(all.length)} ${esc(c.short)} skills</h2>
${filterField("all-skills", all.length, "skills")}
${skillTable(here, sorted, { id: "all-skills", showRepo: true, caption: `${c.short} skills` })}
      </section>
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
    "The directory reads repositories cited by at least two of eight curated skill lists, plus the official collections those lists name and accepted listing requests. Each skill runs through the Suede Skill Check: six checks on the SKILL.md format, plus a declared license and a commit in the last year. Skills that pass at least seven checks, declare a license and meet the listing rules are listed.",
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
  const catCards = categories
    .map((c) => {
      const n = skillsByCat.get(c.slug).length;
      return `          <a class="dir-card cat-card" href="${rel(here, catPath(c.slug))}">
            <span class="dir-card-head"><b>${esc(c.title)}</b><span class="count-chip">${fmt(n)}</span></span>
            <span class="dir-card-text">${esc(c.meta.replace(/ for Claude Code and Codex/, ""))}</span>
          </a>`;
    })
    .join("\n");
  const official = linkedRepos.filter((r) => r.official).sort((a, b) => b.skills.length - a.skills.length || a.slug.localeCompare(b.slug));
  const repoRow = (r) =>
    `          <a class="link-row" href="${rel(here, r.target)}"><b>${esc(r.repo)}</b><span>${plural(r.skills.length, "skill")} &middot; ${esc(catBySlug.get(r.primary).label)}${r.lists.length ? ` &middot; in ${plural(r.lists.length, "list")}` : ""}</span></a>`;
  const allRepos = [...linkedRepos].sort((a, b) => a.repo.toLowerCase().localeCompare(b.repo.toLowerCase()));
  const body = `${bc.html}
      <p class="lead">${fmt(data.skills.length)} skills for Claude Code, Codex, Cursor and every agent that reads SKILL.md, from ${fmt(repos.size)} public GitHub repositories, sorted into ${categories.length} directories by what they do. Every listing passed the Suede Skill Check, links straight to its source and states its license, and every full skill page summarizes what the skill's files contain before you install it.</p>
      <ul class="stat-row" aria-label="Directory size">
        <li><b>${fmt(data.skills.length)}</b> listed skills</li>
        <li><b>${fmt(repos.size)}</b> repositories</li>
        <li><b>${fmt(featured.length)}</b> full skill pages</li>
        <li><b>${openPct}%</b> openly licensed</li>
      </ul>
      <p><a class="button" href="#categories">Browse by category</a> <a class="button secondary" href="${rel(here, "directory/submit/")}">List your skill</a></p>
      <section aria-labelledby="categories">
        <h2 id="categories">Skill directories by category</h2>
        <div class="dir-cards">
${catCards}
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
        <p>The directory reads every SKILL.md in the repositories cited by at least two of ${plural(data.sources.length, "curated list")}, including ${data.sources.slice(0, 3).map(listLink).join(", ")}, plus the official collections those lists name and accepted listing requests. Each skill runs through eight checks. Skills with a license and at least seven passing checks are listed, one listing per skill: when a copy of a skill appears in several repositories, the copy in the most-cited repository keeps the listing. <a href="${rel(here, "directory/methodology/")}">Read the full method</a>.</p>
      </section>
${badgeBlock(here, {
  badgePath: "directory/badge.svg",
  value: "listed",
  target: DIR_URL,
  heading: "For skill authors: show your listing",
  lede: `Every listing has a page with its own README badge: the repository's page, or the skill's page when a repository's single listed skill has one. Find it under <b>README badge</b> on the page. <a href="${rel(here, "directory/submit/")}">Request a listing</a> if your skill is not here yet.`,
})}
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

function renderMethodology() {
  const here = "directory/methodology/";
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Methodology"]]);
  const total = data.skills.length;
  const gradeCounts = { A: data.skills.filter((s) => s.grade === "A").length, B: data.skills.filter((s) => s.grade === "B").length };
  const rows = CHECKS.map((c) => `            <tr><td><code>${esc(c.id)}</code></td><td>${esc(c.label)}</td><td>${fmt(data.skills.filter((s) => s.checks[c.id]).length)} of ${fmt(total)}</td></tr>`).join("\n");
  const body = `${bc.html}
      <p class="lead">The directory lists public Agent Skills that pass a published, mechanical check. This page is the whole method: where skills come from, what is checked, what gets a page of its own, and how to change a listing.</p>
      <section class="panel" aria-labelledby="sources-title">
        <h2 id="sources-title">Where the skills come from</h2>
        <p>The directory reads the repositories cited by at least two of these ${plural(data.sources.length, "curated list")}: ${data.sources.map(listLink).join(", ")}. It adds the official collections those lists name and repositories accepted through <a href="${rel(here, "directory/submit/")}">listing requests</a>. Every SKILL.md in those repositories is read from the default branch, except in hidden folders and dependency or build folders (node_modules, vendor, dist, build), and nothing in them is executed. This snapshot was taken on ${longDate(data.generated)}.</p>
      </section>
      <section class="panel" aria-labelledby="check-title">
        <h2 id="check-title">The Suede Skill Check</h2>
        <p>Eight checks: six on the SKILL.md format, following the <a href="https://agentskills.io/specification" target="_blank" rel="noopener">Agent Skills format</a>, plus a declared license and a commit to the repository in the last year. The first check is required; the grade counts the other seven.</p>
        <div class="table-wrap">
          <table class="checks">
            <thead><tr><th scope="col">Check</th><th scope="col">What passes</th><th scope="col">Listed skills passing</th></tr></thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>
        <ul>
          <li><b>Grade A</b>: all seven graded checks pass (${fmt(gradeCounts.A)} listed skills).</li>
          <li><b>Grade B</b>: six of seven pass (${fmt(gradeCounts.B)} listed skills).</li>
          <li>Grades C and below are not listed.</li>
        </ul>
        <p>A skill that passes all eight is well-formed, licensed and maintained. Read its SKILL.md to confirm it fits your task.</p>
      </section>
      <section class="panel" aria-labelledby="rules-title">
        <h2 id="rules-title">Listing rules</h2>
        <ul>
          <li>Grade A or B on the Suede Skill Check.</li>
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
        <p>Every listed skill appears in its category directory and on its repository's page. Grade A skills get a page of their own once the directory's editors have written their one-sentence summary, up to twelve per repository, chosen by how much ships with the skill: reference files, scripts, assets and a structured SKILL.md. A skill keeps its page while it stays listed, so its README badge and link keep working. Each page carries the summary, a pre-install list of the scripts, commands, environment variables and network use found in the skill's files, install steps (or, where the license restricts copying, the publisher's terms), and a README badge. ${fmt(featured.length)} skills have a full page in this snapshot. A repository whose single listed skill has a page is listed through that page.</p>
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
  const description = "The method behind the Suede Skills Directory: source lists, the eight-part Suede Skill Check, grades, listing rules, full pages and how to change a listing.";
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
          <li><b>Open a listing request</b> with the repository URL. One request covers every skill in the repository.</li>
          <li><b>The request is reviewed by hand.</b> An accepted repository is read at the next directory refresh and runs through the <a href="${rel(here, "directory/methodology/")}">Suede Skill Check</a> and the listing rules; skills graded A or B are listed.</li>
          <li><b>Add the badge.</b> Every listing page has a README badge that links back to it: your repository's page, or your skill's page when the repository holds a single skill with a page of its own.</li>
        </ol>
      </section>
      <section class="panel" aria-labelledby="pass-title">
        <h2 id="pass-title">Pass the check on the first try</h2>
        <ul>
          <li>Start SKILL.md with YAML frontmatter that declares <code>name</code> and <code>description</code>.</li>
          <li>Use a lowercase, hyphenated name that matches the folder name, 64 characters or fewer.</li>
          <li>Write a description between 50 and 1,024 characters that says what the skill does and when to use it, for example "Use when ...".</li>
          <li>Keep SKILL.md to 500 lines or fewer; move long reference material into a <code>references/</code> folder.</li>
          <li>Declare a license in the frontmatter or ship a LICENSE file in the repository.</li>
        </ul>
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
renderMethodology();
renderSubmit();
render404();
for (const c of categories) renderCategory(c);
for (const r of repos.values()) if (r.hasPage) renderRepo(r);
for (const s of featured) renderSkill(s);
files.set("directory/badge.svg", badgeSvg("listed").svg);

// llms.txt carries one line about the directory, with live counts.
const llmsPath = path.join(docsRoot, "llms.txt");
const llmsLine = `- [Agent Skills Directory](${DIR_URL}): A curated index of ${fmt(data.skills.length)} public Agent Skills (${openPct}% under an open-source or open-content license) from ${repos.size} other GitHub repositories, in ${categories.length} category directories. Every listing links to the author's repository, is graded A or B on the eight-part Suede Skill Check, and states its license; full skill pages summarize the scripts, credentials and network calls found in the skill's files; [how skills are listed](${DIR_URL}methodology/).`;
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
