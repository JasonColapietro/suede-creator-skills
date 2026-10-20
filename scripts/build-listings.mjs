#!/usr/bin/env node
// Renders every surface that links to the pack's third-party listings from one
// source, docs/listings.json:
//
//   docs/listings.html             the full page, one section per group
//   README.md                      the "Find it on" block between listings markers
//   docs/index.html                the "Listed on" strip between listings markers,
//                                  plus the SoftwareSourceCode node's `sameAs`
//
// The site linked to none of the ~28 pages that list it, so every listing was
// a one-way citation. Typing the links into three files by hand would be three
// copies of one list, and copies drift, so they are generated and --check
// fails when any of them disagrees with the JSON.
//
// Usage:
//   node scripts/build-listings.mjs          # write all three surfaces
//   node scripts/build-listings.mjs --check  # exit 1 if any would change

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_KEYWORDS } from "./lib/seo-keywords.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

const BASE = "https://skills.suedeai.ai/";
const PAGE_URL = `${BASE}listings.html`;
const REPO = "https://github.com/JasonColapietro/suede-creator-skills";
const START = "<!-- listings:start -->";
const END = "<!-- listings:end -->";

const files = {
  data: path.join(repoRoot, "docs", "listings.json"),
  page: path.join(repoRoot, "docs", "listings.html"),
  readme: path.join(repoRoot, "README.md"),
  home: path.join(repoRoot, "docs", "index.html"),
};

const fail = [];
const rel = (file) => path.relative(repoRoot, file);

// ------------------------------------------------------------------ data

const data = JSON.parse(fs.readFileSync(files.data, "utf8"));
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.verified ?? "")) {
  fail.push(`docs/listings.json "verified" must be a YYYY-MM-DD date, got ${JSON.stringify(data.verified)}`);
}
if (!Array.isArray(data.groups) || !data.groups.length) fail.push("docs/listings.json has no groups");
const seenUrls = new Set();
const seenIds = new Set();
for (const group of data.groups ?? []) {
  for (const key of ["id", "title", "intro"]) {
    if (typeof group[key] !== "string" || !group[key].trim()) fail.push(`a group is missing "${key}"`);
  }
  if (seenIds.has(group.id)) fail.push(`group id "${group.id}" is used twice`);
  seenIds.add(group.id);
  if (!Array.isArray(group.items) || !group.items.length) fail.push(`group "${group.id}" has no items`);
  for (const item of group.items ?? []) {
    for (const key of ["name", "url", "note"]) {
      if (typeof item[key] !== "string" || !item[key].trim()) fail.push(`an item in "${group.id}" is missing "${key}"`);
    }
    if (!/^https:\/\/[^\s"<>]+$/.test(item.url ?? "")) fail.push(`"${item.name}" has a non-https or malformed url`);
    if (seenUrls.has(item.url)) fail.push(`"${item.url}" is listed twice`);
    seenUrls.add(item.url);
  }
}
const allItems = (data.groups ?? []).flatMap((group) => group.items ?? []);
const featured = allItems.filter((item) => item.featured === true);
if (!featured.length) fail.push("docs/listings.json marks no listing as featured");
if (!SEO_KEYWORDS["listings.html"]) fail.push("scripts/lib/seo-keywords.mjs has no entry for listings.html");

if (fail.length) {
  console.error("docs/listings.json cannot be rendered:");
  for (const line of fail) console.error(`  - ${line}`);
  process.exit(1);
}

const allUrls = allItems.map((item) => item.url);
const total = allItems.length;
const [year, month, day] = data.verified.split("-").map(Number);
const verifiedLong = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ------------------------------------------------------------------ page

const TITLE = "Suede Creator Skills listings: directories, registries and lists";
const DESCRIPTION =
  `Every directory, registry and curated list that carries Suede Creator Skills: skills.sh, SkillsMP, ` +
  `the official MCP Registry, npm, MCP Market and more. ${total} listings, verified ${verifiedLong}.`;

function renderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#page`,
    name: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    dateModified: data.verified,
    isPartOf: { "@id": `${BASE}#website` },
    author: { "@type": "Person", "@id": "https://suedeai.ai/founder#person", name: "Jason Colapietro" },
    mainEntity: {
      "@type": "SoftwareSourceCode",
      name: "Suede Creator Skills",
      url: BASE,
      codeRepository: REPO,
      sameAs: allUrls,
    },
  };
  const jsonLdText = JSON.stringify(jsonLd, null, 2)
    .split("\n")
    .map((line) => `      ${line}`)
    .join("\n");

  const sections = data.groups
    .map((group) => {
      const items = group.items
        .map((item) => `        <li><a href="${esc(item.url)}" rel="noopener">${esc(item.name)}</a>: ${esc(item.note)}</li>`)
        .join("\n");
      return [
        `      <section id="${esc(group.id)}" aria-labelledby="${esc(group.id)}-heading">`,
        `        <h2 id="${esc(group.id)}-heading">${esc(group.title)}</h2>`,
        `        <p>${esc(group.intro)}</p>`,
        `        <ul>`,
        items,
        `        </ul>`,
        `      </section>`,
      ].join("\n");
    })
    .join("\n\n");

  const keywords = esc(SEO_KEYWORDS["listings.html"].join(", "));

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(TITLE)}</title>
    <meta name="description" content="${esc(DESCRIPTION)}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="Jason Colapietro">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${PAGE_URL}">
    <link rel="icon" href="assets/favicon-64.png" type="image/png">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Where to find Suede Creator Skills">
    <meta property="og:description" content="${esc(DESCRIPTION)}">
    <meta property="og:url" content="${PAGE_URL}">
    <meta property="og:image" content="https://skills.suedeai.ai/assets/og-image-v2.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Where to find Suede Creator Skills">
    <meta name="twitter:description" content="${esc(DESCRIPTION)}">
    <meta name="twitter:image" content="https://skills.suedeai.ai/assets/og-image-v2.png">
    <script type="application/ld+json">
${jsonLdText}
    </script>
    <link rel="preload" href="assets/fonts/fraunces-var.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="assets/site.css">
    <link rel="stylesheet" href="assets/prose.css">
</head>
  <body>
<a class="skip-link" href="#main">Skip to content</a>

    <header class="nav">
      <nav class="nav-inner" aria-label="Main navigation">
        <a href="./" class="nav-logo" aria-label="Suede Creator Skills home">
          <img src="assets/suede-ai-logo-transparent.webp" alt="Suede AI" width="28" height="28" onerror="this.style.display='none'">
          <span class="nav-logo-wordmark">Suede <span>Creator Skills</span></span>
        </a>
        <details class="nav-disclosure" open>
      <summary class="nav-hamburger" aria-label="Open navigation menu">
        <span></span>
        <span></span>
        <span></span>
      </summary>
      <div class="nav-links">
          <a href="./">Home</a>
          <a href="skills/">Skills</a>
          <a href="guide.html">Guide</a>
          <a href="book/">Book</a>
          <a href="blog/">Blog</a>
          <a href="copy.html">Copy Bank</a>
      <a href="cracked.html" class="nav-cracked">Cracked Devs</a>
          <a href="plugins.html" class="nav-cta">Install</a>
        </div>
    </details>
      </nav>
    </header>
    <main id="main" tabindex="-1" class="shell">
      <p class="eyebrow">Listings &middot; Verified ${esc(verifiedLong)}</p>
      <h1>Where to find Suede Creator Skills</h1>
      <p class="post-meta">${total} third-party pages carry the pack. Every link below was loaded and checked on ${esc(verifiedLong)}.</p>

      <p class="lead">Suede Creator Skills is listed in the skill directories that grade and count installs, the official MCP Registry and npm, the community awesome lists, and the open-source trackers. Pick the directory you already use, or install straight from GitHub with two commands.</p>

${sections}

      <div class="divider"></div>

      <p><a class="button" href="plugins.html">Install the pack</a> <a class="button secondary" href="skills/">Browse every skill</a></p>
    </main>
    <section class="ship-strip" aria-label="Install the pack">
      <div class="ship-strip-shell">
        <p class="ship-strip-head">Proof is part of the release.</p>
        <p class="ship-strip-sub">First install takes two commands. After the marketplace is added, install is one. Every skill is plain Markdown.</p>
        <div class="ship-strip-row">
          <code><span class="prompt">$</span> /plugin marketplace add JasonColapietro/suede-creator-skills &rarr; /plugin install suede-skills@suede</code>
          <a href="plugins.html">All install paths</a>
        </div>
      </div>
    </section>
    <footer>
      <div class="footer-shell">
        <p class="footer-note">Suede Creator Skills is an MIT-licensed pack for Claude Code and OpenAI Codex: outcome-bound orchestration, code review with an A-F ship grade, AI evals, design and copy, SEO/AEO/AI EO, iOS and Android app shipping, and a creator toolkit for music rights and release prep.</p>
        <div class="footer-inner">
          <div class="footer-brand">
            <img src="assets/suede-ai-logo-transparent.webp" alt="Suede AI" onerror="this.style.display='none'">
            <span>Built by <strong>Jason Colapietro</strong> / Suede AI</span>
          </div>
          <div class="footer-links">
            <a href="https://x.com/johnnysuede" target="_blank" rel="noopener">@johnnysuede</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="https://suedeai.ai" target="_blank" rel="noopener">suedeai.ai</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="${REPO}" target="_blank" rel="noopener">GitHub</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="https://suedeai.ai/privacy" target="_blank" rel="noopener">Privacy</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="https://suedeai.ai/contact" target="_blank" rel="noopener">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  <script>
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
</script>
</body>
</html>
`;
}

// ------------------------------------------------------------------ blocks

function renderReadmeBlock() {
  const links = featured.map((item) => `[${item.name}](${item.url})`).join(" · ");
  return [
    START,
    `Listed on ${links}.`,
    "",
    `All ${total} directories, registries and curated lists, verified ${verifiedLong}: [skills.suedeai.ai/listings.html](${PAGE_URL})`,
    END,
  ].join("\n");
}

function renderHomeBlock() {
  const items = featured
    .map((item) => `        <li><a href="${esc(item.url)}" rel="noopener">${esc(item.name)}</a></li>`)
    .join("\n");
  return [
    START,
    `    <div class="listed-on reveal reveal-d2">`,
    `      <p class="listed-on-label">Listed on</p>`,
    `      <ul class="listed-on-list">`,
    items,
    `      </ul>`,
    `      <a class="listed-on-all" href="listings.html">See all ${total} listings</a>`,
    `    </div>`,
    `    ${END}`,
  ].join("\n");
}

function replaceBlock(file, text, block) {
  const start = text.indexOf(START);
  const end = text.indexOf(END);
  if (start === -1 || end === -1 || end < start || text.indexOf(START, start + 1) !== -1) {
    fail.push(`${rel(file)} needs exactly one ${START} ... ${END} pair`);
    return text;
  }
  return text.slice(0, start) + block + text.slice(end + END.length);
}

// The homepage JSON-LD is one @graph block, serialized with two-space indent.
// Rewriting it through JSON.stringify reproduces the committed bytes exactly,
// so the write path only ever changes the sameAs array.
const JSON_LD_RE = /(<script type="application\/ld\+json">\n)([\s\S]*?)(<\/script>)/;

function sourceCodeNode(graph) {
  const nodes = (graph["@graph"] ?? [graph]).filter(
    (node) => node["@type"] === "SoftwareSourceCode" && node.codeRepository === REPO
  );
  return nodes.length === 1 ? nodes[0] : null;
}

function withSameAs(file, text) {
  const match = text.match(JSON_LD_RE);
  if (!match) {
    fail.push(`${rel(file)} has no JSON-LD block`);
    return text;
  }
  let graph;
  try {
    graph = JSON.parse(match[2]);
  } catch (error) {
    fail.push(`${rel(file)} JSON-LD does not parse: ${error.message}`);
    return text;
  }
  const node = sourceCodeNode(graph);
  if (!node) {
    fail.push(`${rel(file)} JSON-LD needs exactly one SoftwareSourceCode node for ${REPO}`);
    return text;
  }
  // Insert sameAs beside codeRepository rather than at the end of the node.
  const rebuilt = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "sameAs") continue;
    rebuilt[key] = value;
    if (key === "codeRepository") rebuilt.sameAs = allUrls;
  }
  for (const key of Object.keys(node)) delete node[key];
  Object.assign(node, rebuilt);
  return text.replace(JSON_LD_RE, (_, open, __, close) => `${open}${JSON.stringify(graph, null, 2)}\n${close}`);
}

// Order-insensitive on purpose: the guard is about which listings the entity
// claims, not the order the write path happened to emit them in.
function checkSameAs(file, text) {
  const match = text.match(JSON_LD_RE);
  let graph = null;
  try {
    graph = match ? JSON.parse(match[2]) : null;
  } catch {
    graph = null;
  }
  const node = graph && sourceCodeNode(graph);
  if (!node) {
    fail.push(`${rel(file)} JSON-LD has no parsable SoftwareSourceCode node for ${REPO}`);
    return;
  }
  const actual = new Set(Array.isArray(node.sameAs) ? node.sameAs : []);
  const missing = allUrls.filter((url) => !actual.has(url));
  const extra = [...actual].filter((url) => !seenUrls.has(url));
  const duplicated = Array.isArray(node.sameAs) && node.sameAs.length !== actual.size;
  if (missing.length || extra.length || duplicated) {
    const parts = [];
    if (missing.length) parts.push(`missing ${missing.join(", ")}`);
    if (extra.length) parts.push(`not in docs/listings.json: ${extra.join(", ")}`);
    if (duplicated) parts.push("duplicate entries");
    fail.push(`${rel(file)} SoftwareSourceCode sameAs disagrees with docs/listings.json (${parts.join("; ")})`);
  }
}

// ------------------------------------------------------------------ run

const outputs = [];
outputs.push({ file: files.page, next: renderPage() });

const readme = fs.readFileSync(files.readme, "utf8");
outputs.push({ file: files.readme, next: replaceBlock(files.readme, readme, renderReadmeBlock()) });

const home = fs.readFileSync(files.home, "utf8");
const homeNext = replaceBlock(files.home, home, renderHomeBlock());
if (checkOnly) {
  checkSameAs(files.home, home);
  outputs.push({ file: files.home, next: homeNext });
} else {
  outputs.push({ file: files.home, next: withSameAs(files.home, homeNext) });
}

if (fail.length) {
  console.error("Listings surfaces cannot be built:");
  for (const line of fail) console.error(`  - ${line}`);
  process.exit(1);
}

const stale = outputs.filter(({ file, next }) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "") !== next);

if (checkOnly) {
  if (stale.length) {
    console.error(
      `Listings surfaces are stale: ${stale.map(({ file }) => rel(file)).join(", ")}. Run: npm run build:listings`
    );
    process.exit(1);
  }
  console.log(`Listings are current: ${total} listings, ${featured.length} featured, verified ${data.verified}.`);
} else {
  for (const { file, next } of stale) fs.writeFileSync(file, next);
  console.log(
    `Listings written: ${total} listings, ${featured.length} featured` +
      (stale.length ? ` (updated ${stale.map(({ file }) => rel(file)).join(", ")}).` : " (no changes).")
  );
}
