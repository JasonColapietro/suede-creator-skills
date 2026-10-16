#!/usr/bin/env node
// Builds the Agent Skills Directory at skills.suedeai.ai/directory/ from
// directory/skills.json (the curated dataset) and directory/categories.json
// (the category copy). Every page under docs/directory/ is generated: edit the
// data or this script, never the HTML.
//
// Usage:
//   node scripts/build-directory.mjs          # write docs/directory/ and the keyword map
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
const OG_IMAGE = `${BASE}/assets/og-image-v2.png`;

const data = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "skills.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "categories.json"), "utf8"));
const GENERATED = data.generated;
const CHECKS = data.checks;

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
    body_lines: c.size[0],
    body_words: c.size[1],
    file_count: c.size[2],
    has_references: c.kinds.includes("r"),
    has_scripts: c.kinds.includes("s"),
    has_assets: c.kinds.includes("a"),
    allowed_tools: c.allowed_tools || null,
    compatibility: c.compatibility || null,
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

const monthYear = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
};

const plural = (n, one, many = `${one}s`) => `${fmt(n)} ${n === 1 ? one : many}`;

// URL path (no leading slash, trailing slash) for every page type.
const catPath = (slug) => `directory/${slug}/`;
const repoPath = (s) => `directory/${s.repo_slug}/`;
const skillPath = (s) => `directory/${s.repo_slug}/${s.slug}/`;
const url = (p) => `${BASE}/${p}`;

function rel(fromPath, toPath) {
  // Both are directory-style paths relative to docs/ ("" is the site root).
  const from = fromPath.split("/").filter(Boolean);
  const to = toPath.split("/").filter(Boolean);
  let i = 0;
  while (i < from.length && i < to.length && from[i] === to[i]) i++;
  const up = from.length - i;
  const down = to.slice(i).join("/");
  const prefix = "../".repeat(up);
  const out = prefix + (down ? `${down}${toPath.endsWith("/") ? "/" : ""}` : "");
  return out || "./";
}

// ------------------------------------------------------------------ model

const catBySlug = new Map(categories.map((c) => [c.slug, c]));
for (const s of data.skills) {
  if (!catBySlug.has(s.category)) throw new Error(`unknown category ${s.category} on ${s.id}`);
}

const repos = new Map();
for (const s of data.skills) {
  if (!repos.has(s.repo_slug)) {
    repos.set(s.repo_slug, { slug: s.repo_slug, repo: s.repo, owner: s.owner, name: s.repo.split("/")[1], skills: [] });
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
}

const RESERVED = new Set(["methodology", "submit", ...categories.map((c) => c.slug)]);
for (const r of repos.values()) {
  const owner = r.slug.split("/")[0];
  if (RESERVED.has(owner)) throw new Error(`owner slug "${owner}" collides with a reserved directory path`);
}

const featured = data.skills.filter((s) => s.featured);
const openPct = Math.round((100 * data.skills.filter((s) => s.open_license).length) / data.skills.length);
// One owner can publish the same skill name in two repositories; their pages
// then lead with the repository, so every page keeps a distinct lead keyword.
const ownerNameCount = new Map();
for (const s of featured) {
  const k = `${s.owner}/${s.name}`.toLowerCase();
  ownerNameCount.set(k, (ownerNameCount.get(k) || 0) + 1);
}
const skillsByCat = new Map(categories.map((c) => [c.slug, data.skills.filter((s) => s.category === c.slug)]));
const reposByScore = [...repos.values()].sort(
  (a, b) => b.lists.length - a.lists.length || b.skills.length - a.skills.length || a.slug.localeCompare(b.slug)
);

// ------------------------------------------------------------------ badges (sizes)

const badgeTextWidth = (t) =>
  Math.round([...t].reduce((n, ch) => n + (/[il.:|]/.test(ch) ? 3.5 : /[mwMW]/.test(ch) ? 9.5 : /[A-Z]/.test(ch) ? 7.6 : 6.6), 0)) + 12;
const BADGE_LABEL = "Suede Skills Directory";
const BADGE_WIDTH = {
  listed: badgeTextWidth(BADGE_LABEL) + badgeTextWidth("listed"),
  grade: badgeTextWidth(BADGE_LABEL) + badgeTextWidth("Grade A"),
};

// ------------------------------------------------------------------ chrome

const NAV_LINKS = [
  ["", "Home"],
  ["skills/", "Skills"],
  ["directory/", "Directory"],
  ["guide.html", "Guide"],
  ["book/", "Book"],
  ["blog/", "Blog"],
  ["copy.html", "Copy Bank"],
  ["cracked.html", "Cracked Devs"],
];

function nav(here) {
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
          <a href="${rel(here, "plugins.html")}" class="nav-cta">Install</a>
        </div>
    </details>
      </nav>
    </header>`;
}

function footer(here, note) {
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

const SCRIPTS = `  <script>
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

function page({ here, title, description, keywords, h1Html, body, jsonld, ogType = "website", footerNote }) {
  const canonical = url(here);
  const a = rel(here, "assets/");
  const blocks = jsonld
    .map((obj) => `    <script type="application/ld+json">\n${JSON.stringify(obj, null, 2).replace(/^/gm, "      ")}\n    </script>`)
    .join("\n");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="keywords" content="${esc(keywords.join(", "))}">
    <meta name="author" content="Jason Colapietro">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="${a}favicon-64.png" type="image/png">
    <meta property="og:type" content="${ogType}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${OG_IMAGE}">
${blocks}
    <link rel="preload" href="${a}fonts/fraunces-var.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="${a}site.css">
    <link rel="stylesheet" href="${a}skill.css">
    <link rel="stylesheet" href="${a}directory.css">
    <script src="${a}directory.js" defer></script>
</head>
  <body>
<a class="skip-link" href="#main">Skip to content</a>

${nav(here)}
    <main id="main" tabindex="-1" class="shell directory">
${h1Html}
${body}
    </main>
${footer(here, footerNote)}
${SCRIPTS}
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
    itemListElement: items.map(([p, label], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: label,
      item: url(p === null ? here : p),
    })),
  };
  return { html: `      <nav class="crumbs" aria-label="Breadcrumb">${html}</nav>`, ld };
}

const gradeChip = (g) => `<span class="grade grade-${g.toLowerCase()}" title="Suede Skill Check grade ${g}">${g}</span>`;

function badgeBlock(here, { idBase, target, grade, heading = "Add the badge to your README", lede }) {
  const img = grade ? `${DIR_URL}badge-grade-${grade.toLowerCase()}.svg` : `${DIR_URL}badge.svg`;
  const alt = grade ? `Suede Skills Directory: Grade ${grade}` : "Listed on Suede Skills Directory";
  const md = `[![${alt}](${img})](${target})`;
  const htmlSnippet = `<a href="${target}"><img src="${img}" alt="${alt}" height="20"></a>`;
  const local = rel(here, `directory/${grade ? `badge-grade-${grade.toLowerCase()}.svg` : "badge.svg"}`);
  return `      <section class="panel badge-panel" aria-labelledby="${idBase}-title">
        <h2 id="${idBase}-title">${heading}</h2>
        <p>${lede}</p>
        <p class="badge-preview"><img src="${local}" alt="${esc(alt)}" width="${grade ? BADGE_WIDTH.grade : BADGE_WIDTH.listed}" height="20"></p>
        <div class="snippet">
          <div class="snippet-head"><span>Markdown</span><button type="button" class="snippet-copy" data-copy-target="${idBase}-md">Copy</button></div>
          <pre><code id="${idBase}-md">${esc(md)}</code></pre>
        </div>
        <div class="snippet">
          <div class="snippet-head"><span>HTML</span><button type="button" class="snippet-copy" data-copy-target="${idBase}-html">Copy</button></div>
          <pre><code id="${idBase}-html">${esc(htmlSnippet)}</code></pre>
        </div>
      </section>`;
}

const listLink = (l) => `<a href="https://github.com/${esc(l)}" target="_blank" rel="noopener">${esc(l)}</a>`;

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
  let lead = list[0].toLowerCase();
  if (leadSeen.has(lead)) throw new Error(`lead keyword "${lead}" used by ${leadSeen.get(lead)} and ${relFile}`);
  leadSeen.set(lead, relFile);
  keywordMap[relFile] = list.slice(0, 10);
  return keywordMap[relFile];
}

// ------------------------------------------------------------------ pages

const files = new Map(); // path relative to docs/ -> content

function skillTitle(s) {
  const shared = ownerNameCount.get(`${s.owner}/${s.name}`.toLowerCase()) > 1;
  const by = shared ? `in ${s.repo}` : `by ${s.owner}`;
  const options = [
    `${s.name} Agent Skill ${by} | Suede Directory`,
    `${s.name} Agent Skill ${by}`,
    `${s.name} Agent Skill`,
  ];
  return options.find((t) => t.length <= 60) || `${trimTo(s.name, 46)} Agent Skill`;
}

function skillDescription(s, withName = descriptionNeedsName.has(s.id)) {
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

function factsRows(rows) {
  return rows
    .filter(([, v]) => v)
    .map(([k, v]) => `            <tr><th scope="row">${k}</th><td>${v}</td></tr>`)
    .join("\n");
}

function renderSkill(s) {
  const here = skillPath(s);
  const cat = catBySlug.get(s.category);
  const r = repos.get(s.repo_slug);
  const bc = crumbs(here, [
    ["directory/", "Directory"],
    [catPath(cat.slug), cat.title],
    [repoPath(s), s.repo],
    [null, s.name],
  ]);
  const kinds = [s.has_references && "references", s.has_scripts && "scripts", s.has_assets && "assets or templates"].filter(Boolean);
  const fileNames = (s.files_sample || []).filter((f) => !REJECTED.test(f));
  const heads = (s.headings || []).filter(([, h]) => !REJECTED.test(h));
  const facts = factsRows([
    ["Publisher", `<a href="https://github.com/${esc(s.owner)}" target="_blank" rel="noopener">${esc(s.owner)}</a>${s.official ? ' <span class="tag">Official</span>' : ""}`],
    ["Repository", `<a href="${rel(here, repoPath(s))}">${esc(s.repo)}</a> (${plural(r.skills.length, "listed skill")})`],
    ["Category", `<a href="${rel(here, catPath(cat.slug))}">${esc(cat.title)}</a>`],
    ["License", `<a href="${esc(s.license_url)}" target="_blank" rel="noopener">${esc(s.license)}</a>${s.open_license ? "" : ' <span class="muted">Not an open-source license: read the terms before you reuse it.</span>'}`],
    ["Last commit", `${monthYear(s.commit_date)} (repository)`],
    ["SKILL.md", `${plural(s.body_lines, "line")}, ${plural(s.body_words, "word")}`],
    ["Bundled files", `${plural(s.file_count, "file")}${kinds.length ? `, including ${kinds.join(", ")}` : ""}`],
    ["Allowed tools", s.allowed_tools ? `<code>${esc(trimTo(s.allowed_tools, 160))}</code>` : ""],
    ["Compatibility", s.compatibility ? esc(trimTo(s.compatibility, 200)) : ""],
    ["Suede Skill Check", `${gradeChip(s.grade)} <a href="#check">See the eight checks</a>`],
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
  const checks = CHECKS.map(
    (c) => `            <tr><td>${esc(c.label)}</td><td class="${s.checks[c.id] ? "pass" : "miss"}">${s.checks[c.id] ? "Pass" : "Not met"}</td></tr>`
  ).join("\n");
  const sameCat = featured
    .filter((o) => o.category === s.category && o.repo_slug !== s.repo_slug)
    .sort((a, b) => b.lists.length - a.lists.length || a.id.localeCompare(b.id));
  // Rotate the start by a stable hash so related links spread across the category.
  const h = [...s.id].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const related = sameCat.length ? Array.from({ length: Math.min(6, sameCat.length) }, (_, i) => sameCat[(h + i * 7) % sameCat.length]) : [];
  const uniqRelated = [...new Map(related.map((o) => [o.id, o])).values()];
  const siblings = r.skills.filter((o) => o.featured && o.id !== s.id).slice(0, 6);
  const relatedHtml = (items) =>
    items
      .map(
        (o) => `          <a class="link-row" href="${rel(here, skillPath(o))}"><b>${esc(o.name)}</b><span>${esc(trimTo(o.summary, 110))}</span></a>`
      )
      .join("\n");
  const installNpx = `npx skills add https://github.com/${s.repo} --skill ${s.name}`;
  const repoName = s.repo.split("/")[1];
  // A skill at the repository root is the whole repository: clone it straight
  // into place. A skill in a subfolder is copied out of a temporary clone.
  const installClaude =
    s.dir === "."
      ? `mkdir -p .claude/skills
git clone --depth 1 https://github.com/${s.repo}.git .claude/skills/${s.name}
rm -rf .claude/skills/${s.name}/.git`
      : `git clone --depth 1 https://github.com/${s.repo}.git /tmp/${repoName}
mkdir -p .claude/skills
cp -R /tmp/${repoName}/${s.dir} .claude/skills/`;
  const installCodex =
    s.dir === "."
      ? null
      : `python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \\
    --repo ${s.repo} \\
    --path ${s.dir}`;
  const body = `${bc.html}
      <p class="lead">${esc(ensureSentence(s.summary))}</p>
      <p><a class="button" href="${esc(s.folder_url)}" target="_blank" rel="noopener">View on GitHub</a> <a class="button secondary" href="${esc(s.skill_md_url)}" target="_blank" rel="noopener">Read SKILL.md</a></p>
      <section class="panel" aria-labelledby="facts-title">
        <h2 id="facts-title">At a glance</h2>
        <div class="table-wrap">
          <table class="facts">
            <tbody>
${facts}
            </tbody>
          </table>
        </div>
      </section>
      <section class="panel" aria-labelledby="author-title">
        <h2 id="author-title">How the author describes it</h2>
        <blockquote class="author-quote" cite="${esc(s.skill_md_url)}">
          <p>${esc(s.description)}</p>
        </blockquote>
        <p class="muted">From the <code>description</code> field of <a href="${esc(s.skill_md_url)}" target="_blank" rel="noopener">SKILL.md</a>. Agents read this line to decide when to load the skill.</p>
${outline}
${fileList}
      </section>
      <section class="panel" aria-labelledby="install-title">
        <h2 id="install-title">Install ${esc(s.name)}</h2>
        <p><strong>Skills CLI</strong> (Claude Code, Codex, Cursor and other agents):</p>
        <pre><code>${esc(installNpx)}</code></pre>
        <p><strong>Claude Code</strong>, project-level copy:</p>
        <pre><code>${esc(installClaude)}</code></pre>
${installCodex ? `        <p><strong>Codex</strong> installer:</p>
        <pre><code>${esc(installCodex)}</code></pre>` : "        <p>For Codex, the skills CLI line above installs it.</p>"}
        <p class="muted">${esc(s.repo)} is third-party code. Suede lists it and links to the source; read SKILL.md and any bundled scripts before you install it.</p>
      </section>
      <section class="panel" id="check" aria-labelledby="check-title">
        <h2 id="check-title">Suede Skill Check: grade ${s.grade}</h2>
        <p>Eight structural checks against the Agent Skills format, run on the published SKILL.md. ${s.grade === "A" ? "This skill passes every check." : "This skill passes all but one."} <a href="${rel(here, "directory/methodology/")}">How the check works</a>.</p>
        <div class="table-wrap">
          <table class="checks">
            <thead><tr><th scope="col">Check</th><th scope="col">Result</th></tr></thead>
            <tbody>
${checks}
            </tbody>
          </table>
        </div>
      </section>
${badgeBlock(here, {
  idBase: "badge",
  target: url(here),
  grade: s.grade,
  heading: `Badge for ${esc(s.name)}`,
  lede: `Maintainers of ${esc(s.repo)} can show this listing in the skill's README. The badge links back to this page.`,
})}
      <section class="panel" aria-labelledby="cited-title">
        <h2 id="cited-title">Where this skill is cited</h2>
        <p>${s.lists.length ? `${esc(s.repo)} appears in ${plural(s.lists.length, "curated list")}: ${s.lists.map(listLink).join(", ")}.` : `${esc(s.repo)} was added from the directory's own review.`}</p>
      </section>
${uniqRelated.length ? `      <section class="panel" aria-labelledby="related-title">
        <h2 id="related-title">More ${esc(cat.short)} skills</h2>
        <div class="links">
${relatedHtml(uniqRelated)}
        </div>
        <p><a href="${rel(here, catPath(cat.slug))}">All ${esc(cat.title.toLowerCase())} skills</a></p>
      </section>` : ""}
${siblings.length ? `      <section class="panel" aria-labelledby="siblings-title">
        <h2 id="siblings-title">More from ${esc(s.repo)}</h2>
        <div class="links">
${relatedHtml(siblings)}
        </div>
        <p><a href="${rel(here, repoPath(s))}">All ${plural(r.skills.length, "skill")} in ${esc(s.repo)}</a></p>
      </section>` : ""}`;
  const description = skillDescription(s);
  const sharedName = ownerNameCount.get(`${s.owner}/${s.name}`.toLowerCase()) > 1;
  const keywords = setKeywords(here, [
    sharedName ? `${s.name} skill in ${s.repo}` : `${s.name} skill by ${s.owner}`,
    `${s.name} skill`,
    `${s.name} agent skill`,
    `${s.name} claude skill`,
    `${s.owner} skills`,
    `${cat.short} agent skills`,
    "SKILL.md",
  ]);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url(here)}#page`,
      name: skillTitle(s),
      description,
      url: url(here),
      dateModified: GENERATED,
      isPartOf: { "@id": `${DIR_URL}#directory` },
      breadcrumb: { "@id": `${url(here)}#breadcrumb` },
      mainEntity: {
        "@type": "SoftwareSourceCode",
        name: s.name,
        description: ensureSentence(s.summary),
        codeRepository: s.folder_url,
        programmingLanguage: "Markdown",
        license: s.license_url,
        dateModified: s.commit_date,
        keywords: [cat.title, "Agent Skills", "SKILL.md"],
      },
    },
    { ...bc.ld, "@id": `${url(here)}#breadcrumb` },
  ];
  files.set(`${here}index.html`, page({
    here,
    title: skillTitle(s),
    description,
    keywords,
    ogType: "article",
    h1Html: `      <div class="eyebrow">Agent skill &middot; ${esc(cat.label)} &middot; ${esc(s.owner)}</div>
      <h1>${esc(s.name)} <span class="h1-sub">agent skill</span></h1>`,
    body,
    jsonld: ld,
    footerNote: `${esc(s.name)} is published by ${esc(s.owner)} in ${esc(s.repo)} and listed in the Suede Skills Directory, a curated index of public Agent Skills.`,
  }));
}

function skillRow(here, s, { showRepo = true, showCategory = false } = {}) {
  const cat = catBySlug.get(s.category);
  const nameCell = s.featured
    ? `<a href="${rel(here, skillPath(s))}">${esc(s.name)}</a>`
    : `<a href="${esc(s.folder_url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`;
  const desc = s.featured ? s.summary : trimTo(s.description, 150);
  const repoCell = showRepo ? `<td><a href="${rel(here, repoPath(s))}#${esc(s.slug)}">${esc(s.repo)}</a></td>` : "";
  const catCell = showCategory ? `<td><a href="${rel(here, catPath(cat.slug))}">${esc(cat.label)}</a></td>` : "";
  return `            <tr id="${showRepo ? "" : esc(s.slug)}"><td class="name">${nameCell}</td>${repoCell}${catCell}<td>${esc(desc)}</td><td class="g">${gradeChip(s.grade)}</td></tr>`.replace(' id=""', "");
}

function renderRepo(r) {
  const here = `directory/${r.slug}/`;
  const primary = catBySlug.get(r.primary);
  const bc = crumbs(here, [
    ["directory/", "Directory"],
    [catPath(primary.slug), primary.title],
    [null, r.repo],
  ]);
  const catLinks = r.categories.map((c) => `<a href="${rel(here, catPath(c))}">${esc(catBySlug.get(c).title)}</a>`);
  const licenseText = r.licenses.length === 1 ? r.licenses[0] : `${r.licenses.slice(0, 3).join(", ")}${r.licenses.length > 3 ? " and others" : ""}`;
  const lead = `${plural(r.skills.length, "skill")} from ${r.repo} ${r.skills.length === 1 ? "is" : "are"} listed in the directory, ${r.categories.length === 1 ? `in ${catBySlug.get(r.primary).title.toLowerCase()}` : `across ${plural(r.categories.length, "category", "categories")}`}. ${r.featuredCount ? `${plural(r.featuredCount, "skill")} ${r.featuredCount === 1 ? "has" : "have"} a full page with install commands and check results.` : ""}`;
  const facts = factsRows([
    ["Publisher", `<a href="https://github.com/${esc(r.owner)}" target="_blank" rel="noopener">${esc(r.owner)}</a>${r.official ? ' <span class="tag">Official</span>' : ""}`],
    ["Repository", `<a href="https://github.com/${esc(r.repo)}" target="_blank" rel="noopener">github.com/${esc(r.repo)}</a>`],
    ["Listed skills", fmt(r.skills.length)],
    ["Categories", catLinks.join(", ")],
    ["License", esc(licenseText)],
    ["Last commit", monthYear(r.commit)],
    ["Install all", `<code>npx skills add https://github.com/${esc(r.repo)}</code>`],
  ]);
  const rows = r.skills.map((s) => skillRow(here, s, { showRepo: false, showCategory: true })).join("\n");
  const relatedRepos = reposByScore.filter((o) => o.primary === r.primary && o.slug !== r.slug).slice(0, 6);
  const body = `${bc.html}
      <p class="lead">${esc(lead)}</p>
      <p><a class="button" href="https://github.com/${esc(r.repo)}" target="_blank" rel="noopener">View ${esc(r.repo)} on GitHub</a></p>
      <section class="panel" aria-labelledby="facts-title">
        <h2 id="facts-title">At a glance</h2>
        <div class="table-wrap">
          <table class="facts">
            <tbody>
${facts}
            </tbody>
          </table>
        </div>
      </section>
      <section class="panel" aria-labelledby="skills-title">
        <h2 id="skills-title">Skills in ${esc(r.repo)}</h2>
        <p class="muted">Linked names open the skill's directory page; the rest open the skill folder on GitHub. Descriptions on pageless rows come from each SKILL.md.</p>
        <div class="table-wrap">
          <table class="skill-table">
            <thead><tr><th scope="col">Skill</th><th scope="col">Category</th><th scope="col">What it does</th><th scope="col">Grade</th></tr></thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>
      </section>
${badgeBlock(here, {
  idBase: "badge",
  target: url(here),
  grade: null,
  heading: "Show the listing in your README",
  lede: `Maintainers of ${esc(r.repo)} can add this badge to the repository README. It links to this page, where visitors see every listed skill and how to install it.`,
})}
      <section class="panel" aria-labelledby="cited-title">
        <h2 id="cited-title">Where this repository is cited</h2>
        <p>${r.lists.length ? `${esc(r.repo)} appears in ${plural(r.lists.length, "curated list")}: ${r.lists.map(listLink).join(", ")}.` : `${esc(r.repo)} was added from the directory's own review.`}</p>
      </section>
${relatedRepos.length ? `      <section class="panel" aria-labelledby="related-title">
        <h2 id="related-title">More ${esc(primary.short)} collections</h2>
        <div class="links">
${relatedRepos.map((o) => `          <a class="link-row" href="${rel(here, `directory/${o.slug}/`)}"><b>${esc(o.repo)}</b><span>${plural(o.skills.length, "listed skill")}</span></a>`).join("\n")}
        </div>
      </section>` : ""}`;
  const title = [
    `${r.repo} Agent Skills (${r.skills.length}) | Suede Directory`,
    `${r.repo} Agent Skills (${r.skills.length})`,
    `${r.name} Agent Skills by ${r.owner}`,
    `${trimTo(r.repo, 46)} Agent Skills`,
  ].find((t) => t.length <= 60);
  const top = r.skills.slice(0, 3).map((s) => s.name).join(", ");
  const description = trimTo(
    `${plural(r.skills.length, "agent skill")} from ${r.repo}${top ? `, including ${top}` : ""}. Install commands, Suede Skill Check grades and a README badge.`,
    158
  );
  const keywords = setKeywords(here, [`${r.repo} skills`, `${r.name} skills`, `${r.owner} agent skills`, `${r.name} claude skills`, `${primary.short} agent skills`, "agent skills directory"]);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${url(here)}#page`,
      name: title,
      description,
      url: url(here),
      dateModified: GENERATED,
      isPartOf: { "@id": `${DIR_URL}#directory` },
      breadcrumb: { "@id": `${url(here)}#breadcrumb` },
      about: { "@type": "SoftwareSourceCode", name: r.repo, codeRepository: `https://github.com/${r.repo}` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: r.skills.length,
        itemListElement: r.skills.slice(0, 50).map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.name,
          url: s.featured ? url(skillPath(s)) : s.folder_url,
        })),
      },
    },
    { ...bc.ld, "@id": `${url(here)}#breadcrumb` },
  ];
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Skill collection &middot; ${esc(r.owner)}</div>
      <h1>${esc(r.name)} <span class="h1-sub">agent skills by ${esc(r.owner)}</span></h1>`,
    body,
    jsonld: ld,
    footerNote: `${esc(r.repo)} is listed in the Suede Skills Directory, a curated index of public Agent Skills for Claude Code, Codex and other agents.`,
  }));
}

function renderCategory(c) {
  const here = catPath(c.slug);
  const all = skillsByCat.get(c.slug);
  const feat = all.filter((s) => s.featured).sort((a, b) => b.lists.length - a.lists.length || a.id.localeCompare(b.id));
  const bc = crumbs(here, [["directory/", "Directory"], [null, c.title]]);
  const repoCounts = new Map();
  for (const s of all) repoCounts.set(s.repo_slug, (repoCounts.get(s.repo_slug) || 0) + 1);
  const topRepos = [...repoCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12);
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
  const rows = sorted.map((s) => skillRow(here, s, { showRepo: true })).join("\n");
  const others = categories.filter((o) => o.slug !== c.slug);
  const body = `${bc.html}
      <p class="lead">${esc(c.intro)}</p>
      <ul class="stat-row" aria-label="Category size">
        <li><b>${fmt(all.length)}</b> listed skills</li>
        <li><b>${fmt(repoCounts.size)}</b> repositories</li>
        <li><b>${fmt(feat.length)}</b> with full pages</li>
      </ul>
${feat.length ? `      <section aria-labelledby="featured-title">
        <h2 id="featured-title">Featured ${esc(c.short)} skills</h2>
        <div class="dir-cards">
${cards}
        </div>
      </section>` : ""}
      <section class="panel" aria-labelledby="all-title">
        <h2 id="all-title">All ${fmt(all.length)} ${esc(c.short)} skills</h2>
        <p><label class="filter-label" for="filter">Filter by name, repository or task</label></p>
        <p><input id="filter" class="filter" type="search" placeholder="Filter ${fmt(all.length)} skills" data-filter-for="all-skills" data-filter-status="filter-status" autocomplete="off"> <span id="filter-status" class="muted" role="status" aria-live="polite"></span></p>
        <div class="table-wrap">
          <table class="skill-table" id="all-skills">
            <thead><tr><th scope="col">Skill</th><th scope="col">Repository</th><th scope="col">What it does</th><th scope="col">Grade</th></tr></thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>
      </section>
      <section class="panel" aria-labelledby="repos-title">
        <h2 id="repos-title">Top ${esc(c.short)} collections</h2>
        <div class="links">
${topRepos.map(([slug, n]) => `          <a class="link-row" href="${rel(here, `directory/${slug}/`)}"><b>${esc(repos.get(slug).repo)}</b><span>${plural(n, `${c.short} skill`)}</span></a>`).join("\n")}
        </div>
      </section>
      <section class="panel" aria-labelledby="other-title">
        <h2 id="other-title">Other skill directories</h2>
        <p class="cat-links">${others.map((o) => `<a href="${rel(here, catPath(o.slug))}">${esc(o.title)}</a>`).join(" &middot; ")}</p>
      </section>`;
  const title = [`${c.title} Agent Skills | Suede Directory`, `${c.title} Agent Skills`].find((t) => t.length <= 60);
  const description = trimTo(`${fmt(all.length)} ${c.short} skills for Claude Code, Codex and other agents. ${c.intro}`, 158);
  const keywords = setKeywords(here, [
    `${c.short} agent skills`,
    `${c.short} claude skills`,
    `${c.short} skills for codex`,
    `best ${c.short} skills`,
    "agent skills directory",
  ]);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${url(here)}#page`,
      name: title,
      description,
      url: url(here),
      dateModified: GENERATED,
      isPartOf: { "@id": `${DIR_URL}#directory` },
      breadcrumb: { "@id": `${url(here)}#breadcrumb` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: all.length,
        itemListElement: feat.slice(0, 30).map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: url(skillPath(s)) })),
      },
    },
    { ...bc.ld, "@id": `${url(here)}#breadcrumb` },
  ];
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Skill directory &middot; ${esc(c.label)}</div>
      <h1>${esc(c.title)} <span class="h1-sub">agent skills</span></h1>`,
    body,
    jsonld: ld,
    footerNote: `The ${esc(c.title.toLowerCase())} directory lists public Agent Skills that pass the Suede Skill Check, with links to every source repository.`,
  }));
}

const FAQ = [
  [
    "What is an agent skill?",
    "An agent skill is a folder with a SKILL.md file: a name, a one-line description of when to use it, and instructions the agent loads on demand. Claude Code, Codex, Cursor and other agents that support the Agent Skills format can install the same folder.",
  ],
  [
    "How do I install a skill from this directory?",
    "Every skill page lists three routes: the skills CLI (npx skills add with the repository and skill name), a project-level copy into .claude/skills for Claude Code, and the Codex skill installer. Each route installs the folder straight from the author's GitHub repository.",
  ],
  [
    "How are skills chosen and graded?",
    "Skills are read from public GitHub repositories cited in the major curated skill lists, then run through the Suede Skill Check: eight structural checks covering the frontmatter, name, description, length, license and maintenance. Skills that pass at least seven checks and declare a license are listed.",
  ],
  [
    "How do I get my skill listed or updated?",
    "Open a listing request on GitHub with the repository URL. The directory is rebuilt from the source repositories, so changes you push to SKILL.md appear at the next refresh.",
  ],
  [
    "Can I remove my skill from the directory?",
    "Yes. Open a removal request on GitHub and the skill comes out of the next build.",
  ],
];

function renderHub() {
  const here = "directory/";
  const bc = crumbs(here, [["", "Home"], [null, "Directory"]]);
  const catCards = categories
    .map((c) => {
      const n = skillsByCat.get(c.slug).length;
      return `          <a class="dir-card cat-card" href="${rel(here, catPath(c.slug))}">
            <span class="dir-card-head"><b>${esc(c.title)}</b><span class="count-chip">${fmt(n)}</span></span>
            <span class="dir-card-text">${esc(trimTo(c.intro, 120))}</span>
          </a>`;
    })
    .join("\n");
  const cited = reposByScore.slice(0, 18);
  const official = [...repos.values()].filter((r) => r.official).sort((a, b) => b.skills.length - a.skills.length || a.slug.localeCompare(b.slug));
  const repoRow = (r) =>
    `          <a class="link-row" href="${rel(here, `directory/${r.slug}/`)}"><b>${esc(r.repo)}</b><span>${plural(r.skills.length, "skill")} &middot; ${esc(catBySlug.get(r.primary).label)}${r.lists.length ? ` &middot; in ${plural(r.lists.length, "list")}` : ""}</span></a>`;
  const allRepos = [...repos.values()].sort((a, b) => a.repo.toLowerCase().localeCompare(b.repo.toLowerCase()));
  const body = `${bc.html}
      <p class="lead">${fmt(data.skills.length)} skills for Claude Code, Codex, Cursor and every agent that reads SKILL.md, from ${fmt(repos.size)} public GitHub repositories. Each one passed the Suede Skill Check, links straight to its source, states its license, and installs with one command.</p>
      <ul class="stat-row" aria-label="Directory size">
        <li><b>${fmt(data.skills.length)}</b> listed skills</li>
        <li><b>${fmt(repos.size)}</b> repositories</li>
        <li><b>${fmt(categories.length)}</b> category directories</li>
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
${cited.map(repoRow).join("\n")}
        </div>
      </section>
      <section class="panel" aria-labelledby="official-title">
        <h2 id="official-title">Skills published by the platform teams</h2>
        <p>Collections maintained by the company behind the product the skill works with.</p>
        <div class="links">
${official.slice(0, 24).map(repoRow).join("\n")}
        </div>
      </section>
      <section class="panel" aria-labelledby="how-title">
        <h2 id="how-title">How a skill gets listed</h2>
        <p>The directory reads every SKILL.md in the repositories cited by ${plural(data.sources.length, "curated list")}, including ${data.sources.slice(0, 3).map(listLink).join(", ")}. Each skill runs through eight structural checks. Skills with a license and at least seven passing checks are listed; exact copies of a skill already listed are dropped, so the original author keeps the listing. <a href="${rel(here, "directory/methodology/")}">Read the full method</a>.</p>
      </section>
${badgeBlock(here, {
  idBase: "badge",
  target: DIR_URL,
  grade: null,
  heading: "For skill authors: show your listing",
  lede: `Every listed repository and skill page carries a ready-made README badge that links to its listing. <a href="${rel(here, "directory/submit/")}">Request a listing</a> if your skill is not here yet.`,
})}
      <section class="panel" aria-labelledby="all-repos-title">
        <h2 id="all-repos-title">All ${fmt(repos.size)} listed repositories</h2>
        <p class="repo-index">${allRepos.map((r) => `<a href="${rel(here, `directory/${r.slug}/`)}">${esc(r.repo)}</a>`).join(" &middot; ")}</p>
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
  const description = trimTo(
    `Browse ${fmt(data.skills.length)} agent skills for Claude Code, Codex and Cursor from ${fmt(repos.size)} GitHub repositories, sorted into ${categories.length} categories with install commands.`,
    158
  );
  const keywords = setKeywords(here, ["agent skills directory", "claude skills directory", "SKILL.md directory", "best claude skills", "ai agent skills list", "Suede Skills Directory"]);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${DIR_URL}#directory`,
      name: SITE_NAME,
      headline: title,
      description,
      url: DIR_URL,
      dateModified: GENERATED,
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
    { ...bc.ld, "@id": `${DIR_URL}#breadcrumb` },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${DIR_URL}#faq`,
      mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede Skills Directory</div>
      <h1>Agent Skills Directory</h1>`,
    body,
    jsonld: ld,
    footerNote: "The Suede Skills Directory is a curated index of public Agent Skills. Every listing links to the author's repository; Suede hosts no third-party code.",
  }));
}

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
        <p>The directory starts from the repositories cited in ${plural(data.sources.length, "curated list")} of agent skills: ${data.sources.map(listLink).join(", ")}, plus the official skill collections those lists name. Every SKILL.md file in those repositories is read from the default branch. Nothing is executed. The current snapshot was taken on ${monthYear(GENERATED)}.</p>
      </section>
      <section class="panel" aria-labelledby="check-title">
        <h2 id="check-title">The Suede Skill Check</h2>
        <p>Eight checks against the <a href="https://agentskills.io/specification" target="_blank" rel="noopener">Agent Skills format</a>. The first is required; the grade counts the other seven.</p>
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
        <p>The check measures structure, not usefulness: a well-formed skill can still be the wrong tool for your task. Read the SKILL.md before you install.</p>
      </section>
      <section class="panel" aria-labelledby="rules-title">
        <h2 id="rules-title">Listing rules</h2>
        <ul>
          <li>Grade A or B on the Suede Skill Check.</li>
          <li>A license declared in the SKILL.md frontmatter or the repository. Every page states it; ${openPct}% of listed skills use an open-source or open-content license, and pages for the rest say so next to the license.</li>
          <li>A description written mainly in English, so the directory's pages read consistently.</li>
          <li>Templates, examples and test fixtures are skipped.</li>
          <li>When the same skill (same name and description) appears in several repositories, the copy in the most-cited repository is listed and the copies are dropped, so the original author keeps the listing.</li>
          <li>Skills built for scraping, evading platform rules or adult content are not listed.</li>
        </ul>
      </section>
      <section class="panel" aria-labelledby="pages-title">
        <h2 id="pages-title">Which skills get a full page</h2>
        <p>Every listed skill appears on its repository's page and in its category directory. Grade A skills get a page of their own with install commands, the check results and a README badge, up to twelve per repository, chosen by how much the skill ships with it: reference files, scripts, assets and a structured SKILL.md. ${fmt(featured.length)} skills have a full page in this snapshot.</p>
      </section>
      <section class="panel" aria-labelledby="cat-title">
        <h2 id="cat-title">Categories</h2>
        <p>Each skill sits in one of ${categories.length} categories, chosen from its name and description by what the skill is mainly for. A category is a browsing aid, not a claim about the author's intent.</p>
      </section>
      <section class="panel" aria-labelledby="change-title">
        <h2 id="change-title">Changing a listing</h2>
        <p>The directory is rebuilt from the source repositories. Push a change to your SKILL.md and it appears at the next refresh. To request a listing, a correction or a removal, use the <a href="${rel(here, "directory/submit/")}">listing request page</a>.</p>
      </section>`;
  const title = "How the Agent Skills Directory Lists Skills";
  const description = "The full method behind the Suede Skills Directory: source lists, the eight-part Suede Skill Check, grades, listing rules and how to change a listing.";
  const keywords = setKeywords(here, ["agent skill quality check", "SKILL.md best practices", "agent skills specification", "skill grading", "Suede Skill Check"]);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url(here)}#page`,
      name: title,
      description,
      url: url(here),
      dateModified: GENERATED,
      isPartOf: { "@id": `${DIR_URL}#directory` },
      breadcrumb: { "@id": `${url(here)}#breadcrumb` },
    },
    { ...bc.ld, "@id": `${url(here)}#breadcrumb` },
  ];
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede Skills Directory &middot; Method</div>
      <h1>How skills are listed and graded</h1>`,
    body,
    jsonld: ld,
    footerNote: "The Suede Skill Check is a structural check of public SKILL.md files. It runs on published files only and executes nothing.",
  }));
}

const ISSUE_URL = "https://github.com/JasonColapietro/suede-creator-skills/issues/new?template=directory-listing.yml";

function renderSubmit() {
  const here = "directory/submit/";
  const bc = crumbs(here, [["directory/", "Directory"], [null, "List your skill"]]);
  const body = `${bc.html}
      <p class="lead">Get your skill in front of people browsing for exactly what it does. Listing is free: send the repository, and once the skill passes the Suede Skill Check it gets a directory entry, a category placement and a README badge that links to it.</p>
      <p><a class="button" href="${ISSUE_URL}" target="_blank" rel="noopener">Request a listing on GitHub</a></p>
      <section class="panel" aria-labelledby="steps-title">
        <h2 id="steps-title">How it works</h2>
        <ol class="steps">
          <li><b>Publish the skill</b> in a public GitHub repository as a folder with a SKILL.md, a license and a description that says when to use it.</li>
          <li><b>Open a listing request</b> with the repository URL. One request covers every skill in the repository.</li>
          <li><b>The next refresh reads it</b> and runs the <a href="${rel(here, "directory/methodology/")}">Suede Skill Check</a>. Skills with a grade of A or B are listed.</li>
          <li><b>Add the badge</b> from your listing page to your README so visitors can find the listing.</li>
        </ol>
      </section>
      <section class="panel" aria-labelledby="pass-title">
        <h2 id="pass-title">Pass the check on the first try</h2>
        <ul>
          <li>Start SKILL.md with YAML frontmatter that declares <code>name</code> and <code>description</code>.</li>
          <li>Use a lowercase, hyphenated name that matches the folder name, 64 characters or fewer.</li>
          <li>Write a description between 50 and 1,024 characters that says what the skill does and when to use it.</li>
          <li>Keep SKILL.md to 500 lines or fewer; move long reference material into a <code>references/</code> folder.</li>
          <li>Declare a license in the frontmatter or ship a LICENSE file in the repository.</li>
        </ul>
      </section>
${badgeBlock(here, {
  idBase: "badge",
  target: DIR_URL,
  grade: null,
  heading: "The directory badge",
  lede: "Listed repositories and skills each get a badge that links to their own page. This generic version links to the directory home.",
})}
      <section class="panel" aria-labelledby="changes-title">
        <h2 id="changes-title">Corrections and removals</h2>
        <p>Use the same <a href="${ISSUE_URL}" target="_blank" rel="noopener">request form</a> to correct a category, update details or remove a listing. Removals take effect at the next build.</p>
      </section>`;
  const title = "List Your Agent Skill | Suede Skills Directory";
  const description = "Request a free listing for your agent skill. Pass the Suede Skill Check, get a category placement and a README badge that links to your listing.";
  const keywords = setKeywords(here, ["submit agent skill", "list claude skill", "agent skill badge", "skill directory submission", "Suede Skills Directory badge"]);
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url(here)}#page`,
      name: title,
      description,
      url: url(here),
      dateModified: GENERATED,
      isPartOf: { "@id": `${DIR_URL}#directory` },
      breadcrumb: { "@id": `${url(here)}#breadcrumb` },
    },
    { ...bc.ld, "@id": `${url(here)}#breadcrumb` },
  ];
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede Skills Directory &middot; For authors</div>
      <h1>List your agent skill</h1>`,
    body,
    jsonld: ld,
    footerNote: "Listing in the Suede Skills Directory is free. The directory links to your repository and hosts none of your code.",
  }));
}

// ------------------------------------------------------------------ badges

function badgeSvg(label, value) {
  // Widths approximate Verdana 11px, the shields.io convention.
  const w = badgeTextWidth;
  const lw = w(label);
  const vw = w(value);
  const total = lw + vw;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${total}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="20" fill="#080808"/>
    <rect x="${lw}" width="${vw}" height="20" fill="#c8a96e"/>
    <rect width="${total}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${lw / 2}" y="14" fill="#f0ece4">${label}</text>
    <text x="${lw + vw / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${lw + vw / 2}" y="14" fill="#080808">${value}</text>
  </g>
</svg>
`;
}

// ------------------------------------------------------------------ run

renderHub();
renderMethodology();
renderSubmit();
for (const c of categories) renderCategory(c);
for (const r of repos.values()) renderRepo(r);
for (const s of featured) renderSkill(s);
files.set("directory/badge.svg", badgeSvg("Suede Skills Directory", "listed"));
files.set("directory/badge-grade-a.svg", badgeSvg("Suede Skills Directory", "Grade A"));
files.set("directory/badge-grade-b.svg", badgeSvg("Suede Skills Directory", "Grade B"));

// llms.txt carries one line about the directory, with live counts.
const llmsPath = path.join(docsRoot, "llms.txt");
const llmsLine = `- [Agent Skills Directory](${DIR_URL}): A curated index of ${fmt(data.skills.length)} public Agent Skills (${openPct}% under an open-source or open-content license) from ${repos.size} other GitHub repositories, in ${categories.length} category directories. Every listing links to the author's repository, passed the eight-part Suede Skill Check, and has install commands; [how skills are listed](${DIR_URL}methodology/).`;
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

const expected = new Map([...files.entries()].map(([p, c]) => [path.join(docsRoot, p), c]));
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
console.log(`Wrote ${files.size} files under docs/directory and ${Object.keys(keywordMap).length} keyword entries.`);
