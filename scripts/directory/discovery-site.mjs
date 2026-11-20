import fs from "node:fs";
import path from "node:path";
import { pixelIcon } from "./pixel-icons.mjs";

const ORIGIN = "https://suedeai.directory";
const REPO = "https://github.com/JasonColapietro/suede-creator-skills";
const ASSETS = "/assets/discovery";
const esc = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const fmt = (n) => n.toLocaleString("en-US");
const jsonData = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

function nav(search) {
  return `<a class="skip" href="#main">Skip to content</a><header class="topbar"><a class="wordmark" href="/" aria-label="Suede directory home"><img src="/assets/suede-ai-logo-transparent.webp" alt="" width="28" height="28">suede</a><nav aria-label="Main navigation">
  ${search ? `<a class="wide-only" href="${REPO}">◉ &nbsp;Repo</a><a class="wide-only" href="${REPO}/issues">Community</a><a href="/search/" aria-current="page">Tools</a><a href="/catalog/">Catalog</a>` : `<a href="/catalog/" aria-current="page">Catalog</a><a class="wide-only" href="/guides/">Guides</a><a class="wide-only" href="/api/">API</a><a class="wide-only" href="${REPO}">GitHub ↗</a>`}
  <a class="saved-link" href="/saved/">Saved</a><a class="nav-action" href="${search ? "/finder/" : "/search/"}">${search ? "Get the finder" : "Find a skill"}</a></nav></header>`;
}

function page(route, title, description, content) {
  const search = route === "search";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Suede Skills Directory</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${ORIGIN}/${route}/"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:url" content="${ORIGIN}/${route}/"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${ORIGIN}/assets/social/directory-card-v2.png">
<link rel="icon" href="/assets/favicon-64.png"><link rel="stylesheet" href="/assets/suede-landing/fonts/fonts.css"><link rel="stylesheet" href="${ASSETS}/discovery.css">
${search ? `<script defer src="${ASSETS}/matter/matter.min.js"></script><script type="module" src="${ASSETS}/search.js"></script>` : `<script type="module" src="${ASSETS}/catalog.js"></script>`}
</head><body class="${route}-page">${nav(search)}${content}</body></html>`;
}

function iconFor(skill, icons) {
  const owner = skill.repo.split("/")[0].toLowerCase();
  if (owner === "jasoncolapietro")
    return "/assets/suede-ai-logo-transparent.webp";
  return icons[owner] || `${ASSETS}/categories/${skill.category}.svg`;
}

const examples = [
  "Audit my website for search engines",
  "Test a React application with Playwright",
  "Turn my notes into a presentation",
  "Review a pull request for security issues",
  "Build a workflow for video editing",
];

function searchPage(categories, skills, icons) {
  const publishers = new Map();
  for (const skill of skills) {
    const owner = skill.repo.split("/")[0].toLowerCase();
    if (icons[owner] && !publishers.has(owner))
      publishers.set(owner, {
        name: skill.repo.split("/")[0],
        icon: icons[owner],
        href: "/catalog/?q=" + encodeURIComponent(skill.repo.split("/")[0]),
        topic: skill.name,
      });
  }
  const tiles = [
    ...publishers.values(),
    ...categories.map((c) => ({
      name: c.label,
      icon: `${ASSETS}/categories/${c.slug}.svg`,
      href: `/catalog/?category=${c.slug}`,
      topic: c.label,
    })),
  ];
  return page(
    "search",
    "Find skills for your agent",
    "Describe your task and find matching agent skills in the Suede Skills Directory.",
    `
    <div class="search-stage"><canvas id="dot-field" aria-hidden="true"></canvas><div id="publisher-field" aria-hidden="true"></div></div>
    <main id="main" class="search-main">
      <div class="search-intro"><p class="inventory">${fmt(skills.length)} skills · ${fmt(new Set(skills.map((s) => s.repo)).size)} repositories · ${categories.length} categories</p><h1>What can your agent<br><span>do for you?</span></h1></div>
      <section class="matches" hidden aria-label="Skill matches"><div class="match-bar"><p id="results-heading" aria-live="polite"></p><div><button type="button" data-share>Share</button><button class="action" type="button" data-copy>Copy for your agent</button></div></div><div class="match-grid"></div></section>
      <form class="prompt-form" action="/browse/#browse" method="get"><label for="prompt" class="visually-hidden">Describe the job</label><input id="prompt" name="q" maxlength="360" required autocomplete="off" placeholder="Find a skill to review my code before I ship it"><button class="clear" type="button" aria-label="Clear search" hidden>×</button><button type="submit" class="go" aria-label="Find matching skills">→</button></form>
      <div class="sample-prompts" aria-label="Example searches">${examples.map((q) => `<a href="/search/?q=${encodeURIComponent(q)}">${esc(q)}</a>`).join("")}</div>
      <p class="feedback" role="status"></p>
      <noscript><p><a href="/catalog/">Browse skills by category</a></p></noscript>
    </main><script type="application/json" id="tile-data">${jsonData(tiles)}</script>`,
  );
}

function skillCard(skill, icons) {
  return `<a class="skill-card" href="${esc(skill.href)}"><span class="skill-icon"><img src="${esc(iconFor(skill, icons))}" alt="" loading="lazy" width="20" height="20"></span><span><b>${esc(skill.name)}</b><small>${esc(skill.repo)} · ${skill.score}/100</small></span></a>`;
}

function catalogPage(categories, skills, icons) {
  const groups = categories.map((c) => ({
    ...c,
    rows: skills.filter((s) => s.category === c.slug),
  }));
  const tabs = groups
    .map(
      (g) =>
        `<a href="?category=${esc(g.slug)}" data-category="${esc(g.slug)}">${esc(g.label)} <small>${fmt(g.rows.length)}</small></a>`,
    )
    .join("");
  const sections = groups
    .map(
      (g) =>
        `<section class="catalog-group"><h2>${esc(g.title)} <small>${fmt(g.rows.length)}</small></h2><p>${esc(g.meta.split(": ").at(-1))}</p><div class="card-grid">${g.rows
          .slice(0, 6)
          .map((s) => skillCard(s, icons))
          .join(
            "",
          )}</div><a class="more-link" href="/${esc(g.slug)}/">Browse all ${fmt(g.rows.length)} ${esc(g.lower)} skills →</a></section>`,
    )
    .join("");
  return page(
    "catalog",
    "The agent skills catalog",
    "Browse agent skills by category, publisher and task. Open a listing to read its score, license and source.",
    `
  <main class="catalog-main" id="main"><h1>${fmt(skills.length)} skills for agents</h1>
  <form class="catalog-form" action="/browse/#browse"><label for="catalog-search" aria-label="Search skills"><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.8"/><path d="m13 13 4 4"/></svg></label><input type="search" id="catalog-search" name="q" placeholder="Search a skill, publisher, or task" autocomplete="off"></form>
  <nav class="catalog-tabs" aria-label="Filter by category"><a href="/catalog/" data-category="" aria-current="page">All <small>${fmt(skills.length)}</small></a>${tabs}</nav>
  <p class="catalog-status" aria-live="polite"></p><div class="catalog-groups">${sections}</div><div class="filtered-grid card-grid" hidden></div><button class="load-more" type="button" hidden>Show more skills</button>
  <footer class="directory-links"><a href="/browse/#browse">Advanced filters</a><a href="/browse/#workflow-builder">Build a workflow</a><a href="/compare/">Compare skills</a><a href="/saved/">Saved skills</a><a href="/submit/">List your skill</a></footer>
  </main><script type="application/json" id="publisher-icons">${jsonData(icons)}</script>`,
  );
}

function archiveBrowse(home) {
  // The original homepage lives one level deeper. Resolve its old relative links
  // to their original target, except on-page anchors and filter query strings.
  return home
    .replace(/\b(href|src|action)="([^"]*)"/g, (match, kind, uri) => {
      if (kind === "href" && uri === ORIGIN + "/")
        return 'href="' + ORIGIN + '/browse/"';
      if (!uri || /^(?:[a-z]+:|[\/#?])/i.test(uri)) return match;
      return `${kind}="/${uri}"`;
    })
    .replaceAll(`content="${ORIGIN}/"`, `content="${ORIGIN}/browse/"`)
    .replaceAll(`"${ORIGIN}/#page"`, `"${ORIGIN}/browse/#page"`)
    .replace("<body>", '<body data-directory-data-root="/">');
}

export const discoveryRoutes = ["catalog", "search", "browse"];
export function publishDiscovery(source, out, siteNode) {
  const assets = path.join(source, "directory/site/assets");
  fs.cpSync(assets, path.join(out, ASSETS), { recursive: true });
  const icons = Object.fromEntries(
    fs
      .readdirSync(path.join(assets, "publishers"))
      .map((f) => [path.parse(f).name, `${ASSETS}/publishers/${f}`]),
  );
  const categories = JSON.parse(
    fs.readFileSync(path.join(source, "directory/categories.json"), "utf8"),
  );
  const skills = JSON.parse(
    fs.readFileSync(path.join(out, "search-index.json"), "utf8"),
  );
  const colors = [
    "#4d82bc",
    "#8458bc",
    "#bd6b3d",
    "#429479",
    "#497f9b",
    "#a8597b",
    "#d08b36",
    "#328d89",
  ];
  const glyphs = path.join(out, ASSETS, "categories");
  fs.mkdirSync(glyphs, { recursive: true });
  categories.forEach((category, index) =>
    fs.writeFileSync(
      path.join(glyphs, category.slug + ".svg"),
      pixelIcon(category.slug)
        .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')
        .replace("currentColor", colors[index % colors.length]),
    ),
  );
  for (const [route, html] of [
    [
      "browse",
      archiveBrowse(fs.readFileSync(path.join(out, "index.html"), "utf8")),
    ],
    ["search", searchPage(categories, skills, icons)],
    ["catalog", catalogPage(categories, skills, icons)],
  ]) {
    fs.mkdirSync(path.join(out, route), { recursive: true });
    fs.writeFileSync(path.join(out, route, "index.html"), html);
  }
  const oldHome = fs.readFileSync(path.join(out, "browse/index.html"), "utf8");
  const anchors = [...oldHome.matchAll(/ id="([a-z0-9_-]+)"/gi)]
    .map((match) => match[1])
    .filter((id) => id !== "main")
    .join(" ");
  const landing = fs
    .readFileSync(path.join(source, "directory/site/index.html"), "utf8")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, () =>
      '<script type="application/ld+json">' + JSON.stringify({ "@context": "https://schema.org", ...siteNode }, null, 2) + '</script>')
    .replaceAll("__SUEDE_SKILL_TOTAL__", fmt(skills.length))
    .replaceAll(
      "__SUEDE_REPO_TOTAL__",
      fmt(new Set(skills.map((s) => s.repo)).size),
    );
  fs.writeFileSync(
    path.join(out, "index.html"),
    landing.replace(
      "</head>",
      `<script src="${ASSETS}/bookmarks.js" data-anchors="${anchors}"></script></head>`,
    ),
  );
  fs.cpSync(
    path.join(source, "directory/site/suede-landing"),
    path.join(out, "assets/suede-landing"),
    { recursive: true },
  );
}
