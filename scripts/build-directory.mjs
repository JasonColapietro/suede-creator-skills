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
import { featuredProjectsHtml, featuredProjects, directoryMembers, directoryMembersHtml, newestPublishedFirst, isPending, pendingStatusHtml } from "./directory/featured.mjs";
import { parseGuide, renderGuideBody } from "./directory/editorial.mjs";
import { fitSentences } from "./directory/metadata.mjs";
import { loadTaskConfig, planTasks, planAlternatives, isFirstParty, withArticle, TASK_GATE } from "./directory/task-pages.mjs";
import { loadTopicConfig, planTopics, topicsBySkill, similarByTopic, TOPIC_GATE } from "./directory/topics.mjs";
import { LANES, FLAGS, laneById, flagById, costLane, skillFlags, planFacets } from "./directory/facets.mjs";
import { loadListedSince, applyListedSince, serializeLedger, isNewListing, isRecentlyUpdated, NEW_DAYS } from "./directory/listed-since.mjs";
import { validateInstalls } from "./directory/installs.mjs";
import { loadCompetitors, fill as fillVersus, FACT_ROWS, PRICING_VARIES, versusPath, altBrandPath } from "./directory/versus.mjs";
import { pixelIcon, dotMatrix } from "./directory/pixel-icons.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = path.join(repoRoot, "docs");
const outRoot = path.join(docsRoot, "directory");
const keywordsPath = path.join(repoRoot, "scripts", "lib", "directory-keywords.json");
const checkOnly = process.argv.includes("--check");

const BASE = "https://skills.suedeai.ai";
const DIR_URL = `${BASE}/directory/`;
const SITE_NAME = "Suede AI Skills Directory";
const OG_IMAGE = `${BASE}/assets/social/directory-card-v2.png`;
const ISSUE_URL = "https://github.com/JasonColapietro/suede-creator-skills/issues/new?template=directory-listing.yml";
const FULL_TABLE_ROWS = 100;

const datasetBytes = fs.readFileSync(path.join(repoRoot, "directory", "skills.json"));
const data = JSON.parse(datasetBytes.toString("utf8"));
const snapshot = { date: data.generated, sha256: createHash("sha256").update(datasetBytes).digest("hex") };
if (!/^[a-f0-9]{32}$/.test(data.snapshot_id || "")) throw new Error("skills.json: missing refresh snapshot_id");
const categories = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "categories.json"), "utf8"));
const GROWTH_FILE = path.join(repoRoot, 'directory/growth/full-pages.json');
const GROWTH = fs.existsSync(GROWTH_FILE) ? JSON.parse(fs.readFileSync(GROWTH_FILE, 'utf8')) : null;
const FULL_PAGES = new Set(GROWTH?.skills || []);
const NEWSLETTER_FILE = path.join(repoRoot, 'directory/growth/newsletter.json');
const NEWSLETTER = fs.existsSync(NEWSLETTER_FILE) ? JSON.parse(fs.readFileSync(NEWSLETTER_FILE, 'utf8')) : { signup_url: null };
if (NEWSLETTER.signup_url !== null) {
  const signup = new URL(NEWSLETTER.signup_url);
  if (signup.protocol !== 'https:' || signup.username || signup.password) throw new Error('Newsletter signup must use a public HTTPS URL');
}
const CHECKS = data.checks;
const PROMOTION = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "promotion.json"), "utf8"));
if (typeof PROMOTION.enabled !== "boolean" || !PROMOTION.verifications || typeof PROMOTION.verifications !== "object" || Array.isArray(PROMOTION.verifications)) throw new Error("promotion.json: expected enabled and a verification map");
// Template copy lives in promotion.json; a file without it (a test fixture)
// falls back to the same facts in plain words.
PROMOTION.copy = {
  offer_long: "Display either quality badge in your repository or skill README, linked to your listing, then request verification. Eligible skills scoring 80–99 with a verified badge can receive a featured placement while the offer is open.",
  partners_intro: "Publishers who show their quality badge in their README, verified by Suede AI against the rendered page. Scores follow the published rubric.",
  button: "Request badge verification",
  ...(PROMOTION.copy || {}),
};
for (const k of ["offer_long", "partners_intro", "button"]) if (typeof PROMOTION.copy[k] !== "string" || !PROMOTION.copy[k].trim() || /—/.test(PROMOTION.copy[k])) throw new Error(`promotion.json: copy.${k} must be text without an em dash`);
if (PROMOTION.ends_at !== null && (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(PROMOTION.ends_at) || !Number.isFinite(Date.parse(PROMOTION.ends_at)))) throw new Error("promotion.json: ends_at must be null or a UTC timestamp");
if (SCORE_METHOD !== "graded-v2" || data.score_method !== SCORE_METHOD || CHECKS.map((c) => c.id).join() !== "frontmatter,name_format,name_matches_folder,description_length,description_trigger,concise_body,license,maintained") throw new Error("Unsupported directory score method");
const NOTES = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "notes.json"), "utf8"));
const EDITORIAL = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "featured-projects.json"), "utf8"));
const PROJECTS = featuredProjects(EDITORIAL);
const MEMBERS = directoryMembers(EDITORIAL);
// The README badge for featured publishers, rendered with the other badges
// once featured-projects.json marks it live.
const FEATURED_BADGE = (() => {
  const b = EDITORIAL.featured_badge;
  if (!b || b.status !== "live") return null;
  if (b.image !== "https://skills.suedeai.ai/directory/badges/featured.svg" || b.href_pattern !== "https://skills.suedeai.ai/directory/featured/#{id}" || !b.markdown_pattern.includes(b.image) || !b.markdown_pattern.includes(b.href_pattern)) throw new Error("featured-projects.json: featured_badge must point at directory/badges/featured.svg and the featured page");
  return b;
})();
const CTA = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "services-cta.json"), "utf8"));
{
  if (typeof CTA.enabled !== "boolean" || !CTA.offers || !CTA.offers[CTA.default_lead]) throw new Error("services-cta.json: expected enabled, offers and a default_lead that names an offer");
  for (const [id, o] of Object.entries(CTA.offers)) {
    for (const k of ["heading", "body", "cta", "url"]) if (typeof o[k] !== "string" || !o[k].trim()) throw new Error(`services-cta.json: offer ${id} needs ${k}`);
    if (!/^https:\/\//.test(o.url)) throw new Error(`services-cta.json: offer ${id} url must be https`);
    // House style for public copy: no em dashes in anything the module prints.
    if (/—/.test(o.heading + o.body + o.cta + CTA.kicker)) throw new Error(`services-cta.json: offer ${id} contains an em dash`);
  }
  for (const [cat, lead] of Object.entries(CTA.lead_by_category || {})) if (!CTA.offers[lead]) throw new Error(`services-cta.json: ${cat} leads with unknown offer ${lead}`);
  const ids = new Set();
  for (const c of CTA.campaigns || []) {
    if (!/^[a-z0-9-]+$/.test(c.id) || ids.has(c.id) || !Array.isArray(c.variants) || !c.variants.length) throw new Error(`services-cta.json: invalid campaign ${c.id}`);
    ids.add(c.id);
    if (c.routes && !CTA.offers[c.routes]) throw new Error(`services-cta.json: campaign ${c.id} routes to unknown offer ${c.routes}`);
    for (const v of c.variants) {
      for (const k of ["headline", "body", "button", "url"]) if (typeof v[k] !== "string" || !v[k].trim()) throw new Error(`services-cta.json: ${c.id}:${v.id} needs ${k}`);
      if (v.routes && !CTA.offers[v.routes]) throw new Error(`services-cta.json: ${c.id}:${v.id} routes to unknown offer ${v.routes}`);
      if (!/^https:\/\/(suedeai\.agency|suedeai\.app|skills\.suedeai\.ai)\//.test(v.url)) throw new Error(`services-cta.json: ${c.id}:${v.id} links outside Suede AI`);
      if (/—/.test(`${v.eyebrow || ""}${v.headline}${v.body}${v.button}`)) throw new Error(`services-cta.json: ${c.id}:${v.id} contains an em dash`);
    }
  }
}
const CAMPAIGNS = new Map((CTA.campaigns || []).map((c) => [c.id, c]));

// The directory guides: optional, so a checkout without directory/editorial/
// still builds the directory. Only entries marked "published" render.
const EDITORIAL_PAGES = (() => {
  const file = path.join(repoRoot, "directory", "editorial", "pages.json");
  if (!fs.existsSync(file)) return null;
  const m = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const g of m.pages) {
    if (!/^[a-z0-9-]+$/.test(g.id) || !["draft", "published"].includes(g.status)) throw new Error(`pages.json: invalid guide ${g.id}`);
    if (g.path !== `directory/guides/${g.id}/`) throw new Error(`pages.json: ${g.id} path must be directory/guides/${g.id}/`);
    if (g.title.length > 60) throw new Error(`pages.json: ${g.id} title over 60 characters`);
    if (g.meta_description.length < 70 || g.meta_description.length > 160) throw new Error(`pages.json: ${g.id} meta_description must be 70–160 characters`);
    if (!/^\d{4}-\d\d-\d\d$/.test(g.date_modified) || (g.status === "published" && !/^\d{4}-\d\d-\d\d$/.test(g.date_published || ""))) throw new Error(`pages.json: ${g.id} needs ISO dates once published`);
    g.markdown = fs.readFileSync(path.join(repoRoot, g.source), "utf8");
  }
  return m;
})();
const GUIDES = EDITORIAL_PAGES ? EDITORIAL_PAGES.pages.filter((g) => g.status === "published").sort((a, b) => a.priority - b.priority) : [];

// The publisher and editor of the directory, as the homepage declares them
// (docs/index.html). Same @id values, so search engines and answer engines
// join every directory page to one entity.
const ORG_ID = "https://suedeai.ai/#organization";
const PERSON_ID = "https://suedeai.ai/founder#person";
const ORGANIZATION = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Suede AI",
  url: "https://suedeai.ai",
  logo: `${BASE}/assets/suede-ai-logo-transparent.webp`,
  founder: { "@id": PERSON_ID },
  sameAs: [
    "https://suedeai.org/",
    "https://github.com/Suede-AI",
    "https://x.com/AISUEDE",
    "https://www.youtube.com/@aisuede",
    "https://www.linkedin.com/company/suede-labs",
    "https://www.crunchbase.com/organization/suede-labs-ai",
    "https://www.wikidata.org/wiki/Q141169484",
  ],
};
// Product and practice aliases identify their own entities, with the company
// linked as publisher or parent. Keep the IDs used by their canonical sites.
const RELATED_ENTITIES = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://agents.suedeai.ai/#app",
    name: "Suede AI Agent Studio",
    url: "https://agents.suedeai.ai",
    sameAs: ["https://suedeai.app/"],
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    publisher: { "@id": ORG_ID },
  },
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": "https://seo.suedeai.ai/#organization",
    name: "Suede AI SEO",
    url: "https://seo.suedeai.ai/",
    sameAs: ["https://suedeai.agency/"],
    parentOrganization: { "@id": ORG_ID },
  },
];
const PERSON = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Jason Colapietro",
  url: "https://suedeai.ai/founder",
  jobTitle: "Founder and CEO, Suede AI",
  worksFor: { "@id": ORG_ID },
  sameAs: [
    "https://jasoncolapietro.com/",
    "https://github.com/JasonColapietro",
    "https://www.linkedin.com/in/jasoncolapietro",
    "https://x.com/johnnysuede",
    "https://www.crunchbase.com/person/jason-colapietro-d83e",
    "https://apps.apple.com/us/developer/jason-colapietro/id1895958699",
    "https://www.wikidata.org/wiki/Q140235755",
  ],
};
const PUBLISHER_REF = { "@type": "Organization", "@id": ORG_ID, name: "Suede AI", url: "https://suedeai.ai" };
// Pages other than the hub describe the directory they belong to in full, so
// the reference never dangles on a page that does not define it.
const DIRECTORY_REF = { "@type": "CollectionPage", "@id": `${DIR_URL}#directory`, name: SITE_NAME, url: DIR_URL };

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
    full_page: FULL_PAGES.has(`${c.repo}/${c.slug}`.toLowerCase()),
    checks: Object.fromEntries(CHECKS.map((k, i) => [k.id, c.checks[i] === "1"])),
    folder_url: c.dir === "." ? `https://github.com/${c.repo}` : `https://github.com/${c.repo}/tree/${meta.branch}/${c.dir}`,
    skill_md_url: blob(`${tree}SKILL.md`),
    license_url: c.license_evidence?.length > 1 ? `https://github.com/${c.repo}/tree/${meta.branch}/${c.license_file}` : c.license_file ? blob(c.license_file) : blob(`${tree}SKILL.md`),
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
const DIRECTORY_HOST = "https://suedeai.directory";
const movedUrl = (u) => (u === `${BASE}/directory` || u.startsWith(`${BASE}/directory/`) ? `${DIRECTORY_HOST}${u.slice(`${BASE}/directory`.length) || "/"}` : u);

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
  angular: "Angular", "cypress-io": "Cypress", lambdatest: "LambdaTest", veniceai: "Venice", github: "GitHub",
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
  // page. A repository without a full skill page gets its own public page
  // with repository facts, the skill summary and a badge to link to.
  // A repository page, once published, stays while the repository is listed,
  // so a README badge that points at it keeps working. Every published page
  // is indexable regardless of how many skills the repository lists.
  r.hasPage = r.skills.length >= 2 || !r.skills[0].featured || fs.existsSync(path.join(outRoot, ...r.slug.split("/"), "index.html"));
  r.indexable = r.hasPage;
  r.target = r.hasPage ? `directory/${r.slug}/` : skillPath(r.skills[0]);
  r.publisher = publisherName(r.owner, r.official);
  r.hasRootSkill = r.skills.some((s) => s.dir === ".");
  r.withheld = r.skills[0].repo_withheld;
  r.scopedInstall = r.skills[0].repo_scoped_install;
  const licCounts = new Map();
  for (const s of r.skills) licCounts.set(s.license, (licCounts.get(s.license) || 0) + 1);
  r.licenseCounts = [...licCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const RESERVED = new Set(["agents", "methodology", "submit", "badges", "featured", "guides", "check", "finder", "rising", "state-of-agent-skills", "for", "topics", "pricing", "features", "new", "top", "saved", "trust", "stacks", "compare", "api", "publishers", "mcp-servers", "plugins", "grok", "rules", "bots", ...categories.map((c) => c.slug)]);
for (const r of repos.values()) {
  const owner = r.slug.split("/")[0];
  if (RESERVED.has(owner)) throw new Error(`owner slug "${owner}" collides with a reserved directory path`);
}
// The directory's own page roots must never shadow a category directory.
for (const root of ["trust", "stacks", "compare", "api", "publishers", "mcp-servers", "plugins", "grok", "rules"]) {
  if (categories.some((c) => c.slug === root)) throw new Error(`page root "${root}" collides with the ${root} category`);
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
for (const s of data.skills.filter(s => s.featured || s.full_page)) {
  const k = `${s.owner}/${s.name}`.toLowerCase();
  ownerNameCount.set(k, (ownerNameCount.get(k) || 0) + 1);
}
const displayName = (s) => s.display_name || s.name;
const sharedName = (s) => ownerNameCount.get(`${s.owner}/${s.name}`.toLowerCase()) > 1;

// ------------------------------------------------------------------ task plan

// Task pages ("What are the best Claude Code skills for <topic>?") and
// "<skill> alternatives" pages. directory/task-pages.json holds the keyword
// map; scripts/directory/task-pages.mjs applies the publishing gate and keeps
// Suede AI's own skills out of every ranking.
const TASKS_PATH = "directory/for/";
const TASK_CONFIG = loadTaskConfig(path.join(repoRoot, "directory", "task-pages.json"), new Set(categories.map((c) => c.slug)));
const TASK_PLAN = planTasks(TASK_CONFIG, data.skills);
const TASKS = TASK_PLAN.filter((t) => t.published);
const ALTERNATIVES = planAlternatives(TASK_PLAN);
for (const t of TASKS) if (t.rows.some(isFirstParty)) throw new Error(`task ${t.job.id}: a Suede AI skill reached a ranking`);
for (const a of ALTERNATIVES) if (isFirstParty(a.s) || a.peers.some(isFirstParty)) throw new Error(`alternatives for ${a.s.id}: a Suede AI skill reached a ranking`);
const taskPath = (t) => `${TASKS_PATH}${t.job.id}/`;
const altPath = (s) => `${skillPath(s)}alternatives/`;
// The task pages whose table lists a skill, and the alternatives page for it.
const tasksBySkill = new Map();
for (const t of TASKS) for (const s of t.rows) tasksBySkill.set(s.id, [...(tasksBySkill.get(s.id) || []), t]);
const altBySkill = new Map(ALTERNATIVES.map((a) => [a.s.id, a]));
// Two alternatives pages for skills that share a name lead with the owner.
const altNameCount = new Map();
for (const a of ALTERNATIVES) altNameCount.set(a.s.name.toLowerCase(), (altNameCount.get(a.s.name.toLowerCase()) || 0) + 1);
const altName = (s) => (altNameCount.get(s.name.toLowerCase()) > 1 ? `${displayName(s)} by ${s.owner}` : displayName(s));

// ------------------------------------------------------------------ browse plan

// Topic pages (the subcategory and task layer under the categories), cost
// lanes, capability flags and listing dates. directory/topics.json holds the
// taxonomy; scripts/directory/facets.mjs derives lanes and flags from
// published fields; directory/listed-since.json records when each skill was
// first listed.
const TOPICS_PATH = "directory/topics/";
const PRICING_PATH = "directory/pricing/";
const FEATURES_PATH = "directory/features/";
const NEW_PATH = "directory/new/";
const TOP_PATH = "directory/top/";
const SAVED_PATH = "directory/saved/";
const FEED_PATH = "directory/feed.xml";
const SECURITY_PATH = "directory/trust/";
const STACKS_PATH = "directory/stacks/";
const COMPARE_PATH = "directory/compare/";
// Brand comparison pages ("Suede AI Skills Directory vs <name>" and
// "<name> alternatives") under the compare hub. directory/editorial/
// competitors.json holds the sourced facts; scripts/directory/versus.mjs
// validates them.
const COMPETITORS = loadCompetitors(path.join(repoRoot, "directory", "editorial", "competitors.json"));
const API_PATH = "directory/api/";
const PUBLISHERS_PATH = "directory/publishers/";
const TOP_MAX = 100;
const FACET_TABLE_MAX = 400;
for (const s of data.skills) {
  s.lane = costLane(s);
  s.flags = skillFlags(s);
}
const TOPIC_CONFIG = loadTopicConfig(path.join(repoRoot, "directory", "topics.json"), new Set(categories.map((c) => c.slug)));
const TOPIC_PLAN = planTopics(TOPIC_CONFIG, data.skills);
const TOPICS = TOPIC_PLAN.topics.filter((t) => t.published);
const TOPICS_BY_SKILL = topicsBySkill(TOPIC_PLAN);
const topicPath = (t) => `${TOPICS_PATH}${t.topic.id}/`;
const groupById = new Map(TOPIC_CONFIG.groups.map((g) => [g.id, g]));
const FACETS = planFacets(data.skills);
const LANES_LIVE = FACETS.lanes.filter((l) => l.rows.length);
const FLAGS_LIVE = FACETS.flags.filter((f) => f.rows.length);
const lanePath = (id) => `${PRICING_PATH}${id}/`;
const flagPath = (id) => `${FEATURES_PATH}${id}/`;
const LISTED_FILE = path.join(repoRoot, "directory", "listed-since.json");
const LISTED_NEXT = applyListedSince(loadListedSince(LISTED_FILE), data.skills, data.generated).next;
const LISTED_FLOOR = Object.values(LISTED_NEXT.dates).reduce((m, d) => (d < m ? d : m), data.generated);
const byScore = (a, b) => b.score - a.score || b.lists.length - a.lists.length || a.id.localeCompare(b.id);
const NEW_LISTINGS = data.skills.filter((s) => !isFirstParty(s) && isNewListing(s, data.generated, LISTED_FLOOR)).sort((a, b) => b.listed_since.localeCompare(a.listed_since) || byScore(a, b));
const RECENTLY_UPDATED = data.skills.filter((s) => !isFirstParty(s) && isRecentlyUpdated(s, data.generated)).sort((a, b) => b.commit_date.localeCompare(a.commit_date) || byScore(a, b));
const TOP_SKILLS = data.skills.filter((s) => !isFirstParty(s)).sort(byScore).slice(0, TOP_MAX);

// ------------------------------------------------------------------ installs (skills.sh)

// Install counts are not measured by the directory. directory/installs.json
// is a dated snapshot of the counts skills.sh publishes for installs made with
// the skills CLI, written by scripts/directory/installs.mjs. Every number
// quoted from it names the source and the date.
const INSTALLS_FILE = path.join(repoRoot, "directory", "installs.json");
const INSTALLS = fs.existsSync(INSTALLS_FILE) ? validateInstalls(JSON.parse(fs.readFileSync(INSTALLS_FILE, "utf8"))) : null;
const installKey = (s) => `${s.repo}/${s.name}`.toLowerCase();
const installsFor = (s) => (INSTALLS && INSTALLS.skills[installKey(s)]) || null;
const lastWeek = (s) => { const w = installsFor(s)?.weekly; return w && w.length ? w[w.length - 1] : 0; };
const compact = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "")}M` : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, "")}K` : fmt(n));
const TOP_INSTALLED = INSTALLS ? data.skills.filter((s) => !isFirstParty(s) && installsFor(s)).sort((a, b) => installsFor(b).installs - installsFor(a).installs || byScore(a, b)).slice(0, TOP_MAX) : [];
const RISING = INSTALLS ? data.skills.filter((s) => !isFirstParty(s) && lastWeek(s) > 0).sort((a, b) => lastWeek(b) - lastWeek(a) || byScore(a, b)).slice(0, TOP_MAX) : [];
const INSTALLS_MATCHED = INSTALLS ? data.skills.filter((s) => installsFor(s)).length : 0;
const installsSource = (here) => (INSTALLS ? `Install counts come from <a href="${esc(INSTALLS.source.url)}" target="_blank" rel="noopener">skills.sh</a>, which counts installs made with the skills CLI from anonymous telemetry, read on ${longDate(INSTALLS.fetched)}. The directory measures no installs of its own. <a href="${rel(here, API_PATH)}#installs">How the snapshot is taken</a>.` : "");
const skillsShUrl = (s) => `https://skills.sh/${s.repo}/${s.name}`;

// ------------------------------------------------------------------ kinds (directory/kinds.json)

// The directory kinds beyond skills: plugins and mods, Grok, MCP servers,
// rules and prompts. Listed, never graded: the file carries no scores.
const KINDS_FILE = path.join(repoRoot, "directory", "kinds.json");
function loadKinds(doc) {
  const kinds = doc.kinds || [];
  const noDash = (t, where) => { if (/—/.test(String(t))) throw new Error(`kinds.json: ${where} contains an em dash`); return t; };
  const ids = new Set();
  for (const k of kinds) {
    for (const f of ["id", "path", "name", "short", "title", "meta", "h1", "lead"]) if (typeof k[f] !== "string" || !k[f].trim()) throw new Error(`kinds.json: kind ${k.id || "?"} needs ${f}`);
    if (!/^[a-z0-9-]+$/.test(k.path) || ids.has(k.id)) throw new Error(`kinds.json: invalid or duplicate kind ${k.id}`);
    ids.add(k.id);
    if (k.title.length > 60 || k.meta.length < 70 || k.meta.length > 155) throw new Error(`kinds.json: ${k.id} title or meta out of range`);
    if (k.keywords !== undefined && (!Array.isArray(k.keywords) || k.keywords.length < 1 || k.keywords.length > 8 || k.keywords.some((t) => typeof t !== "string" || !t.trim() || t !== t.trim() || t.includes(",")))) throw new Error(`kinds.json: ${k.id} keywords must be 1 to 8 trimmed terms without commas`);
    for (const t of [k.name, k.title, k.meta, k.h1, k.lead, ...(k.intro || []), ...(k.faq || []).flat()]) noDash(t, k.id);
    const seen = new Set();
    for (const sec of k.sections || []) {
      if (!/^[a-z0-9-]+$/.test(sec.id) || !sec.name) throw new Error(`kinds.json: ${k.id} has an invalid section`);
      for (const e of sec.entries || []) {
        for (const f of ["id", "name", "url", "publisher", "summary"]) if (typeof e[f] !== "string" || !e[f].trim()) throw new Error(`kinds.json: ${k.id}/${sec.id} entry ${e.id || "?"} needs ${f}`);
        if (!/^https:\/\//.test(e.url) || seen.has(e.id)) throw new Error(`kinds.json: ${k.id} entry ${e.id} has a bad url or duplicate id`);
        if (e.repo !== undefined && !/^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9_.-]+$/.test(e.repo)) throw new Error(`kinds.json: ${k.id} entry ${e.id} repo`);
        seen.add(e.id);
        noDash(`${e.name} ${e.summary} ${e.install || ""}`, `${k.id}/${e.id}`);
      }
    }
    for (const d of k.docs || []) if (!/^https:\/\//.test(d.url) || !d.label) throw new Error(`kinds.json: ${k.id} docs`);
  }
  return kinds;
}
const KINDS_DOC = fs.existsSync(KINDS_FILE) ? JSON.parse(fs.readFileSync(KINDS_FILE, "utf8")) : { kinds: [], updated: data.generated };
const KINDS = loadKinds(KINDS_DOC);
const KINDS_UPDATED = /^\d{4}-\d{2}-\d{2}$/.test(KINDS_DOC.updated || "") ? KINDS_DOC.updated : data.generated;
const kindPath = (k) => `directory/${k.path}/`;
const kindEntries = (k) => k.sections.flatMap((sec) => sec.entries);

// ------------------------------------------------------------------ stacks (directory/editorial/stacks.json)

// Jason's recommended stacks: one article per task. Each names one Suede AI
// skill above the article; the article body itself recommends third-party
// skills only, and the build refuses a body that names a Suede skill.
const STACKS_FILE = path.join(repoRoot, "directory", "editorial", "stacks.json");
const STACKS_DOC = fs.existsSync(STACKS_FILE) ? JSON.parse(fs.readFileSync(STACKS_FILE, "utf8")) : null;
const STACKS = (() => {
  if (!STACKS_DOC) return [];
  const out = [];
  for (const st of STACKS_DOC.stacks) {
    if (!/^[a-z0-9-]+$/.test(st.id) || !["draft", "published"].includes(st.status)) throw new Error(`stacks.json: invalid stack ${st.id}`);
    if (st.status !== "published") continue;
    for (const f of ["title", "h1", "meta_description", "task", "summary", "source", "date_published", "date_modified"]) if (typeof st[f] !== "string" || !st[f].trim()) throw new Error(`stacks.json: ${st.id} needs ${f}`);
    if (st.title.length > 60 || st.meta_description.length < 70 || st.meta_description.length > 155) throw new Error(`stacks.json: ${st.id} title or meta out of range`);
    if (!st.suede || !/^suede-[a-z0-9-]+$/.test(st.suede.skill) || typeof st.suede.pitch !== "string") throw new Error(`stacks.json: ${st.id} needs a suede pick`);
    if (!data.skills.some((x) => isFirstParty(x) && x.name === st.suede.skill)) throw new Error(`stacks.json: ${st.id} names a Suede skill the directory does not list: ${st.suede.skill}`);
    const markdown = fs.readFileSync(path.join(repoRoot, st.source), "utf8");
    if (/—/.test(markdown)) throw new Error(`${st.source}: em dash`);
    // The byline and the directory's own link targets may name Suede; the prose may not.
    const body = markdown.split("\n").slice(1).join("\n").replace(/^\s*By \[Jason Colapietro\][^\n]*\n/m, "").replace(/\]\(https?:[^)\s]+\)/g, "]()");
    if (/suede/i.test(body)) throw new Error(`${st.source}: the article body must not name Suede or a Suede skill`);
    out.push({ ...st, markdown });
  }
  return out.sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
})();
const stackPath = (st) => `${STACKS_PATH}${st.id}/`;

// ------------------------------------------------------------------ leaderboard rows

const sparkline = (weekly) => {
  if (!weekly || weekly.length < 2) return "";
  const max = Math.max(...weekly, 1);
  const pts = weekly.map((v, i) => `${((i / (weekly.length - 1)) * 60 + 2).toFixed(1)},${(16 - (v / max) * 13).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 64 18" width="64" height="18" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" points="${pts}"/></svg>`;
};
const installMetric = (s) => { const r = installsFor(s); return r ? `${sparkline(r.weekly)}<b>${compact(r.installs)}</b> installs` : `<b>${s.score}</b>/100`; };


// ------------------------------------------------------------------ chrome

const HAS_AGENTS = fs.existsSync(path.join(repoRoot, "directory/agents.json"));
const NAV_LINKS = [
  ["directory/", "Skills"],
  ["directory/top/", "Top 100"],
  ["directory/new/", "New"],
  ["directory/topics/", "Topics"],
  ["directory/featured/", "Featured Skills"],
  ...(HAS_AGENTS ? [["directory/agents/", "Agents"]] : []),
  ["directory/stacks/", "Stacks"],
  [SECURITY_PATH, "Security"],
];
// The nav link that owns the current page: exact match, else the nearest
// prefix (a topic page lights Topics; a skill page lights Skills).
function navCurrent(here) {
  const exact = NAV_LINKS.find(([p]) => p === here);
  if (exact) return exact[0];
  const prefixed = NAV_LINKS.filter(([p]) => p !== "directory/" && here.startsWith(p)).sort((a, b) => b[0].length - a[0].length)[0];
  return prefixed ? prefixed[0] : "directory/";
}

// Absolute links serve the 404 page, which GitHub Pages returns at any path.
const link = (here, p, absolute) => (absolute ? `/${p}` : rel(here, p));

// GitHub star button: the directory's own repository, with the star count
// from the latest saved snapshot (directory/growth/github-stars.json), so the
// page needs no third-party script and no request at view time.
const STAR_REPO = "JasonColapietro/suede-creator-skills";
const STAR_URL = `https://github.com/${STAR_REPO}`;
const STAR_COUNT = (() => {
  const f = path.join(repoRoot, "directory/growth/github-stars.json");
  if (!fs.existsSync(f)) return null;
  const snap = JSON.parse(fs.readFileSync(f, "utf8")).snapshots.at(-1)?.stars || {};
  const hit = Object.entries(snap).find(([r]) => r.toLowerCase() === STAR_REPO.toLowerCase());
  return hit ? hit[1] : null;
})();
const STAR_ICON = `<svg class="gh-star-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>`;
function starButton(variant = "") {
  const count = Number.isInteger(STAR_COUNT) ? STAR_COUNT.toLocaleString("en-US") : null;
  return `<a class="gh-star${variant ? ` gh-star--${variant}` : ""}" href="${STAR_URL}" target="_blank" rel="noopener" data-gh-star aria-label="Star Suede AI Skills on GitHub${count ? `, ${count} stars` : ""}">${STAR_ICON}<span>Star</span>${count ? `<span class="gh-star-count">${count}</span>` : ""}</a>`;
}
const STAR_PAGES = new Set(["directory/", "directory/finder/", "directory/badges/", "directory/rising/", "directory/state-of-agent-skills/", "directory/submit/", "directory/featured/", "directory/check/"]);
const starPanel = () => `<section class="panel star-panel" aria-labelledby="star-title"><div><h2 id="star-title">Star Suede AI Skills on GitHub</h2><p>Free, graded agent skills for Claude Code, Codex and Cursor. Every star puts them in front of more builders.</p></div>${starButton("lg")}</section>`;

function nav(here, absolute = false) {
  const rel = (h, p) => link(h, p, absolute);
  const current = here.startsWith("directory/") ? navCurrent(here) : null;
  const links = NAV_LINKS.map(([p, label]) => `          <a href="${rel(here, p)}"${p === current ? ' aria-current="page"' : ""}>${label}</a>`).join("\n");
  return `    <header class="nav">
      <nav class="shell nav-inner" aria-label="Main navigation">
        <a href="${rel(here, "directory/")}" class="nav-logo" aria-label="Suede AI Skills Directory home">
          <img src="${rel(here, "assets/")}suede-ai-logo-transparent.webp" alt="Suede AI" width="28" height="28" onerror="this.style.display='none'">
          <span class="nav-logo-wordmark">SuedeAI<span>.directory</span></span>
        </a>
        ${starButton("nav")}
        <details class="nav-disclosure" open>
      <summary class="nav-hamburger" aria-label="Open navigation menu">
        <span></span>
        <span></span>
        <span></span>
      </summary>
      <div class="nav-links">
${links}
          <a href="${rel(here, "directory/saved/")}" data-saved-link>Saved <span class="count-chip" data-saved-count hidden></span></a>
          <a href="${rel(here, "directory/submit/")}" class="nav-cta">List your skill</a>
        </div>
    </details>
      </nav>
    </header>`;
}

// The kind bar: one row under the header on every page, holding every catalog
// the directory keeps, so Grok bots, MCP servers, plugins and rules are one
// click from anywhere instead of only from the home hero and the footer. Each
// entry is [path, label, count, pixel icon]. agentCounts is set before any
// page renders, so the agent count is known by the time this is called.
const kindBarItems = () => [
  ["directory/", "Skills", data.skills.length, "skills"],
  ["directory/featured/", "Featured Skills", EDITORIAL.projects.length + MEMBERS.length, "featured"],
  ...(HAS_AGENTS ? [["directory/agents/", "AI agents", agentCounts ? agentCounts.products + agentCounts.ungraded : null, "ai-agents-llm"]] : []),
  ...KINDS.map((k) => [kindPath(k), k.short, kindEntries(k).length, k.id]),
  ...(STACKS.length ? [[STACKS_PATH, "Stacks", STACKS.length, "stacks"]] : []),
];
// Pages about the directory itself light no catalog; every other page that
// no catalog claims is a skills page (categories, topics, rankings, listings).
const KIND_BAR_NEUTRAL = ["directory/methodology/", "directory/submit/", "directory/saved/", "directory/check/", "directory/guides/", "directory/api/", "directory/trust/"];
function kindBarCurrent(here, items) {
  if (!here.startsWith("directory/")) return null;
  const owner = items.filter(([p]) => p !== "directory/" && here.startsWith(p)).sort((a, b) => b[0].length - a[0].length)[0];
  if (owner) return owner[0];
  return KIND_BAR_NEUTRAL.some((p) => here.startsWith(p)) ? null : "directory/";
}
// One-word labels the bar shows when it runs short of room.
const KIND_BAR_SHORT = { "Featured Skills": "Featured", "AI agents": "Agents", "Plugins and mods": "Plugins", "Grok bots": "Grok", "MCP servers": "MCP", "Rules and prompts": "Rules" };
function kindBar(here, absolute = false) {
  const items = kindBarItems();
  const current = absolute ? null : kindBarCurrent(here, items);
  const links = items.map(([p, label, count, icon]) => `        <a href="${link(here, p, absolute)}"${p === current ? ' aria-current="page"' : ""}>${pixelIcon(icon, { size: 14 })}<span class="kind-label" data-short="${esc(KIND_BAR_SHORT[label] || label)}">${esc(label)}</span>${count === null ? "" : `<span class="count-chip">${fmt(count)}</span>`}</a>`).join("\n");
  return `    <nav class="kind-bar" aria-label="Directory catalogs">
      <div class="shell kind-bar-inner">
${links}
      </div>
    </nav>`;
}

const FOOTER_LINKS = [
  ...(GROWTH ? [["directory/finder/", "Find skills in your agent"], ["directory/state-of-agent-skills/", "State of Agent Skills"], ["directory/rising/", "Rising Skills"], ["directory/badges/", "Skill badges"]] : []),
  ["directory/", "Skills"], ["directory/top/", "Top 100"], ["directory/new/", "New"], ["directory/topics/", "Topics"], ["directory/for/", "By task"],
  ["directory/featured/", "Featured projects"], ...(HAS_AGENTS ? [["directory/agents/", "AI agents"]] : []),
  ["directory/mcp-servers/", "MCP servers"], ["directory/plugins/", "Plugins and mods"], ["directory/grok/", "Grok bots"],
  ["directory/stacks/", "Stacks"], ["directory/security/", "Security"], ["directory/publishers/", "Publishers"], ["directory/compare/", "Compare"], ["directory/api/", "API and data"],
  ["directory/methodology/", "How skills are listed"], ["directory/submit/", "List your skill"], ["directory/feed.xml", "RSS feed"], ["skills/", "Suede AI skills pack"],
];
function footer(here, note, absolute = false) {
  const rel = (h, p) => link(h, p, absolute);
  const a = rel(here, "assets/");
  return `    <footer>
      <div class="shell">
        <p class="footer-note">${note}</p>
        <div class="footer-star"><p>Star Suede AI Skills on GitHub so more builders find graded skills.</p>${starButton("lg")}</div>
        <div class="footer-inner">
          <div class="footer-brand">
            <img src="${a}suede-ai-logo-transparent.webp" alt="Suede AI" width="24" height="24" onerror="this.style.display='none'">
            <span>Built by <strong>Jason Colapietro</strong> / Suede AI</span>
          </div>
          <div class="footer-links">
${FOOTER_LINKS.map(([p, label]) => `            <a href="${rel(here, p)}">${label}</a>`).join(`\n            <span class="footer-divider" aria-hidden="true">|</span>\n`)}
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
    <div class="trendshift-recognition" style="width:250px;max-width:100%;margin:24px auto;text-align:center"><p style="margin:0 0 8px;font-size:13px">Suede AI Skills on Trendshift</p><a href="https://trendshift.io/repositories/82031?utm_source=trendshift-badge&amp;utm_medium=badge&amp;utm_campaign=badge-trendshift-82031" target="_blank" rel="noopener noreferrer"><img src="https://trendshift.io/api/badge/trendshift/repositories/82031/daily?language=Python" alt="JasonColapietro%2Fsuede-creator-skills | Trendshift" width="250" height="55" loading="lazy" style="display:block;max-width:100%;height:auto"/></a></div>
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
    .map((obj) => `    <script type="application/ld+json">\n${JSON.stringify(obj, null, 2).replace(/</g, "\\u003c").replace(/^/gm, "      ")}\n    </script>`)
    .join("\n");
  const head = [
    `    <meta charset="utf-8">`,
    `    <meta name="viewport" content="width=device-width, initial-scale=1">`,
    `    <title>${esc(title)}</title>`,
    `    <meta name="description" content="${esc(description)}">`,
    keywords ? `    <meta name="keywords" content="${esc(keywords.join(", "))}">` : null,
    `    <meta name="robots" content="${robots}">`,
    // The directory lives at suedeai.directory. GitHub Pages still serves this
    // copy at skills.suedeai.ai/directory/ and cannot send a 301, so each
    // indexable page names its suedeai.directory URL as canonical and search
    // engines consolidate there.
    canonical ? `    <link rel="canonical" href="${movedUrl(pageUrl)}">` : null,
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
    `    <meta name="twitter:site" content="@AISUEDE">`,
    `    <meta name="twitter:title" content="${esc(title)}">`,
    `    <meta name="twitter:description" content="${esc(description)}">`,
    `    <meta name="twitter:image" content="${OG_IMAGE}">`,
    blocks || null,
    `    <meta name="theme-color" content="#000000">`,
    `    <link rel="preload" href="${a}fonts/geist-var-latin.woff2" as="font" type="font/woff2" crossorigin>`,
    `    <link rel="preload" href="${a}fonts/geist-mono-var-latin.woff2" as="font" type="font/woff2" crossorigin>`,
    `    <link rel="preload" href="${a}fonts/pixelify-sans-var-latin.woff2" as="font" type="font/woff2" crossorigin>`,
    `    <link rel="stylesheet" href="${a}directory.css">`,
    `    <script src="${a}directory.js" defer></script>`,
    here === "directory/" ? `    <link rel="stylesheet" href="${a}workflow-builder.css">\n    <script type="module" src="${a}workflow-builder.js"></script>` : null,
    `    <link rel="alternate" type="application/rss+xml" title="Suede AI Skills Directory: new listings and guides" href="${absolute ? "/directory/feed.xml" : rel(here, "directory/feed.xml")}">`,
    here.startsWith("directory/agents/") ? `    <link rel="stylesheet" href="${a}agents.css">\n    <script src="${a}agents.js" defer></script>` : null,
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
${kindBar(here, absolute)}
    <main id="main" tabindex="-1" class="shell directory">
${h1Html}
${body}
${GROWTH && (here === "directory/" || here === "directory/top/" || here === "directory/check/" || here.startsWith("directory/topics/") || categories.some(c => here === `directory/${c.slug}/`)) ? `<section class="panel" aria-labelledby="rising-signup"><h2 id="rising-signup">Find your next useful skill</h2><p>Explore Rising Skills with quality scores and source reports, or search from inside your agent.</p><p>${NEWSLETTER.signup_url ? `<a class="button" href="${esc(NEWSLETTER.signup_url)}">Get Rising Skills by email</a> · ` : ""}<a href="${rel(here, 'directory/rising/')}">Read Rising Skills</a> · <a href="${rel(here, 'directory/finder/')}">Install the finder</a> · <a href="${rel(here, 'directory/state-of-agent-skills/')}">State of Agent Skills</a></p></section>` : ""}
${STAR_PAGES.has(here) ? starPanel() : ""}
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
const BADGE_LABEL = "Suede AI Skills Directory";

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
        <p>Choose the numeric badge, the letter badge, or both. Each links to this skill’s Suede AI listing; either valid linked badge can qualify for the feature offer.</p>
        <div class="snippet"><div class="snippet-head"><span>Markdown</span><button type="button" class="snippet-copy" data-copy-target="${id}-md">Copy both badges</button></div><pre><code id="${id}-md">${esc(badgeMarkdown(s))}</code></pre></div>
        <div class="snippet"><div class="snippet-head"><span>HTML</span><button type="button" class="snippet-copy" data-copy-target="${id}-html">Copy both badges</button></div><pre><code id="${id}-html">${esc(badgeHtml(s))}</code></pre></div>`;
}
function promotionOffer(here) {
  const ended = PROMOTION.ends_at && Date.now() >= Date.parse(PROMOTION.ends_at);
  if (!PROMOTION.enabled || ended) return "";
  // Copy from promotion.json; no end date is shown until ends_at is set.
  return `<p class="badge-offer" data-promotion-end="${esc(PROMOTION.ends_at || "")}">Limited-time feature offer: ${esc(PROMOTION.copy.offer_long)} <a href="${rel(here, "directory/submit/")}">${esc(PROMOTION.copy.button)}</a>.${PROMOTION.ends_at ? ` Available until ${esc(PROMOTION.ends_at)}.` : ""}</p>`;
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
    lede: `${esc(displayName(s))} is listed with ${s.score}/100 · ${s.grade}. This badge links to its Suede AI listing. Skills scoring 80–99 add a numeric and a letter quality shield${open.length ? `; the largest open points for ${esc(displayName(s))} are ${listPhrase(open.map((p) => `${esc(p.label.toLowerCase())} (${p.max - p.points})`))}` : ""}. <a href="${rel(here, "directory/submit/")}#improve">Send your repository and the points you want to raise</a>, then request a fresh review after updating the skill.${publisherGuideLine(here)}`,
  });
}
function qualityBadgeBlock(here, s) {
  if (!s.shielded) return improveBlock(here, s);
  return `<section class="panel badge-panel" id="badge" aria-labelledby="badge-title"><h2 id="badge-title">Two badges for ${esc(displayName(s))}</h2>
        ${qualityBadgeContent(s)}
        <p class="muted">Suede Certified on the shield refers to this published structural quality check. Security scan: not scanned. Read the <a href="${rel(here, "directory/methodology/")}">methodology</a>.</p>
        ${promotionOffer(here)}${publisherGuideLine(here) ? `\n        <p>${publisherGuideLine(here).trim()}</p>` : ""}</section>`;
}
// The "claim your listing" panel beside the badge on skill and repository pages.
const publisherClaim = (here) => campaignVariant("publisher-claim", here);
// The publisher guide, linked from the badge panel on every skill page.
function publisherGuideLine(here) {
  return guideLinksTo.skillBadge.length ? ` Publishers: read ${listPhrase(guideLinksTo.skillBadge.map((g) => guideAnchor(here, g)))}.` : "";
}
function promotionSection(here, skills) {
  if (!skills.length) return "";
  return `<section class="panel badge-promotion" id="badge-partners" aria-labelledby="badge-partners-title" data-promotion-end="${esc(PROMOTION.ends_at || "")}"><h2 id="badge-partners-title">Featured badge partners</h2><p>${esc(PROMOTION.copy.partners_intro)}</p><div class="dir-cards">${skills.map((s) => `<a class="dir-card" href="${listingTarget(s)}"><span class="dir-card-head"><b>${esc(displayName(s))}</b>${gradeChip(s)}</span><span class="dir-card-repo">${esc(s.repo)}</span><span class="dir-card-text">${esc(s.summary || trimTo(s.description, 150))}</span></a>`).join("")}</div></section>`;
}

// ------------------------------------------------------------------ services module

// One module per page, copy and routing from directory/services-cta.json. The
// offer that fits the page's category leads; the other follows. Outbound links
// carry UTM tags naming the page type so the services sites can attribute visits.
const routeFor = (category) => (category && CTA.lead_by_category?.[category]) || CTA.default_lead;
const stableHash = (s) => [...s].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
// Every internal link a CTA or guide prints, checked against the generated
// site before anything is written: [page it is on, path, fragment].
const internalLinks = [];
// The directory pages a CTA may point at. A variant whose destination is not
// built (a guide still in draft, say) is skipped rather than printed as a 404.
const CHECK_PATH = "directory/check/";
const GUIDES_PATH = "directory/guides/";
const plannedPages = new Set(["directory/", "directory/featured/", "directory/methodology/", "directory/submit/", CHECK_PATH, ...categories.map((c) => catPath(c.slug)), ...(GUIDES.length ? [GUIDES_PATH, ...GUIDES.map((g) => g.path)] : []), ...(TASKS.length ? [TASKS_PATH, ...TASKS.map(taskPath)] : [])]);
const reachable = (href) => {
  const u = new URL(href);
  return u.origin !== BASE || plannedPages.has(u.pathname.replace(/^\//, ""));
};

// One variant from a campaign in services-cta.json. A variant carrying a
// confirm_offer note is never rendered. Where several variants fit, the page
// path picks one, so variants rotate across pages and stay fixed per page.
function campaignVariant(campaignId, here, { routes = null, id = null } = {}) {
  const c = CAMPAIGNS.get(campaignId);
  if (!c) throw new Error(`services-cta.json: no campaign ${campaignId}`);
  const pool = c.variants.filter((v) => !v.confirm_offer && reachable(v.url) && (id ? v.id === id : !routes || !v.routes || v.routes === routes));
  if (id && !c.variants.some((v) => v.id === id)) throw new Error(`services-cta.json: no variant ${campaignId}:${id}`);
  return pool.length ? { campaign: c, variant: pool[stableHash(here) % pool.length] } : null;
}

// A Suede AI URL as this page should print it. Internal destinations become
// relative links without UTM tags (the site runs no analytics, and tagged
// internal URLs only split one page into several); outbound ones keep theirs.
function ctaHref(here, href) {
  const u = new URL(href);
  if (u.origin !== BASE) return { href: u.toString(), external: true };
  const p = u.pathname.replace(/^\//, "");
  internalLinks.push([here, p, u.hash.slice(1)]);
  return { href: `${rel(here, p)}${u.hash}`, external: false };
}

const ctaLink = (here, href, label, cls = "button", attrs = "") => {
  const h = ctaHref(here, href);
  return `<a class="${cls}" href="${esc(h.href)}"${attrs}${h.external ? ' target="_blank" rel="noopener"' : ""}>${esc(label)}</a>`;
};

// A single placement from a campaign, as its own panel.
function campaignPanel(here, picked, { quiet = false } = {}) {
  if (!CTA.enabled || !picked) return "";
  const { campaign, variant: v } = picked;
  const id = `cta-${campaign.id}-${v.id}`;
  return `      <aside class="panel cta-placement${quiet ? " cta-quiet" : ""}" aria-labelledby="${id}" data-cta-placement="${esc(campaign.id)}" data-cta-variant="${esc(v.id)}">
        ${v.eyebrow ? `<p class="svc-kicker">${esc(v.eyebrow)}</p>\n        ` : ""}<h2 id="${id}">${esc(v.headline)}</h2>
        <p>${esc(v.body)}</p>
        <p>${ctaLink(here, v.url, v.button, quiet ? "button secondary" : "button", ` data-cta="${esc(campaign.id)}:${esc(v.id)}"`)}</p>
      </aside>`;
}

// The services module: two cards, the offer that fits the page's category
// first. On category and skill pages the lead card takes its copy from the
// routed campaign variant; the second card is always the plain offer.
const LEAD_CAMPAIGN = {
  category: (lead) => (lead === "agents" ? "category-agent-studio" : "category-agency"),
  skill: () => "skill-page-aside",
};
// compact (skill pages): the lead card keeps its short routed copy, the second
// card shows its heading and button, and `publisher` (a campaign variant) adds
// a one-line note for the skill's author, so every Suede AI call to action on
// the page sits in this one aside below the listing's own content.
function servicesCta(kind, category = null, here = "", { compact = false, publisher = null } = {}) {
  if (!CTA.enabled || !CTA.placements?.[kind]) return "";
  const lead = routeFor(category);
  const order = [lead, ...Object.keys(CTA.offers).filter((k) => k !== lead)];
  const href = (o) => {
    const u = new URL(o.url);
    for (const [k, v] of Object.entries(CTA.utm || {})) u.searchParams.set(k, v);
    u.searchParams.set("utm_content", category ? `${kind}-${category}` : kind);
    return u.toString();
  };
  const leadVariant = LEAD_CAMPAIGN[kind] ? campaignVariant(LEAD_CAMPAIGN[kind](lead), here, { routes: lead }) : null;
  const cards = order.map((id, i) => {
    const o = CTA.offers[id];
    const v = i === 0 && leadVariant ? leadVariant.variant : null;
    const copy = v ? { heading: v.headline, body: v.body, cta: v.button, href: v.url, tag: `${leadVariant.campaign.id}:${v.id}` } : { heading: o.heading, body: o.body, cta: o.cta, href: href(o), tag: id };
    const body = compact && i > 0 ? "" : `\n            <p>${esc(copy.body)}</p>`;
    return `          <div class="svc-card${i === 0 ? " svc-lead" : ""}" data-offer="${esc(id)}">
            <h3>${esc(copy.heading)}</h3>${body}
            <p>${ctaLink(here, copy.href, copy.cta, i === 0 ? "button" : "button secondary", ` data-cta="${esc(copy.tag)}"`)}</p>
          </div>`;
  }).join("\n");
  const note = publisher
    ? `\n        <p class="svc-publisher" data-cta-placement="${esc(publisher.campaign.id)}" data-cta-variant="${esc(publisher.variant.id)}"><b>${esc(publisher.variant.headline)}</b> ${ctaLink(here, publisher.variant.url, publisher.variant.button, "svc-publisher-link", ` data-cta="${esc(publisher.campaign.id)}:${esc(publisher.variant.id)}"`)}</p>`
    : "";
  return `      <aside class="panel svc-cta${compact ? " svc-compact" : ""}" aria-labelledby="svc-title" data-services-cta="${esc(kind)}">
        <h2 class="svc-kicker" id="svc-title">${esc(CTA.kicker)}</h2>
        <div class="svc-cards">
${cards}
        </div>${note}
      </aside>`;
}

// ------------------------------------------------------------------ guide links

// Where each guide is linked from, read from its link_from entries. An entry
// the build cannot place is an error, so the manifest never promises a link
// that does not exist.
const guideLinksTo = { pages: new Map(), skillCategory: new Map(), skillInstall: [], skillMcp: [], skillBadge: [], hubFaqInstall: null };
for (const g of GUIDES) {
  for (const entry of g.link_from || []) {
    let m;
    if (/^awesome\//.test(entry)) continue; // scripts/build-awesome-directory.mjs and awesome/CONTRIBUTING.md
    if ((m = entry.match(/^(directory\/(?:[a-z0-9-]+\/)*)(?: \((.+)\))?$/))) {
      if (m[1] === "directory/" && /FAQ answer/.test(m[2] || "")) guideLinksTo.hubFaqInstall = g;
      else guideLinksTo.pages.set(m[1], [...(guideLinksTo.pages.get(m[1]) || []), g]);
    } else if ((m = entry.match(/^every full skill page whose category is ([a-z0-9-]+)$/))) {
      if (!catBySlug.has(m[1])) throw new Error(`pages.json: ${g.id} links from unknown category ${m[1]}`);
      guideLinksTo.skillCategory.set(m[1], [...(guideLinksTo.skillCategory.get(m[1]) || []), g]);
    } else if (/^the install section of every full skill page$/.test(entry)) guideLinksTo.skillInstall.push(g);
    else if (/^every full skill page whose install record mentions MCP$/.test(entry)) guideLinksTo.skillMcp.push(g);
    else if (/^the badge panel on every skill page$/.test(entry)) guideLinksTo.skillBadge.push(g);
    else throw new Error(`pages.json: ${g.id} has a link_from entry the build cannot place: ${entry}`);
  }
}
const guideAnchor = (here, g) => `<a href="${rel(here, g.path)}">${esc(g.h1)}</a>`;
function guideLinksPanel(here, guides, heading = "Guides") {
  const list = [...new Map(guides.map((g) => [g.id, g])).values()];
  if (!list.length) return "";
  return `      <section class="panel guide-links" aria-labelledby="guides-title">
        <h2 id="guides-title">${esc(heading)}</h2>
        <div class="links">
${list.map((g) => `          <a class="link-row" href="${rel(here, g.path)}"><b>${esc(g.h1)}</b><span>${esc(g.meta_description)}</span></a>`).join("\n")}
        </div>
      </section>`;
}
const pageGuides = (here) => guideLinksTo.pages.get(here) || [];
function skillGuides(s) {
  const mcp = s.install && (s.install.mcp || (s.install.mcp_tools || []).length);
  return [...(guideLinksTo.skillCategory.get(s.category) || []), ...(mcp ? guideLinksTo.skillMcp : [])];
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
    schema_version: 1, skill: { name: s.name, ...(s.display_name ? { display_name: s.display_name } : {}), repository: s.repo, path: s.dir, license: s.license },
    listing_url: listingTarget(s),
    snapshot: { date: snapshot.date, id: data.snapshot_id, dataset_sha256: snapshot.sha256 },
    source: { branch: s.branch, revision, revision_status: revision ? "recorded" : "not_recorded_in_snapshot", repository_commit_date: s.commit_date,
      ...(data.repos[s.repo].assessment_date ? { assessment_date: data.repos[s.repo].assessment_date } : {}),
      skill_md_url: revision ? `https://github.com/${s.repo}/blob/${revision}/${s.dir === "." ? "" : s.dir + "/"}SKILL.md` : s.skill_md_url },
    methodology: { version: SCORE_METHOD, url: `${DIR_URL}methodology/#score`, rubric_total: RUBRIC_MAX, published_cap: SCORE_CAP },
    quality: { score: s.score, grade: s.grade, components: s.score_parts, checks: s.checks },
    ...(data.repos[s.repo].supplementary_citations ? { supplementary_citations: data.repos[s.repo].supplementary_citations } : {}),
    security_scan_status: "not_scanned",
    badges: s.shielded ? badgePair(s) : [{ kind: "listing", src: `${BASE}/${skillPath(s)}badge.svg`, alt: `${BADGE_LABEL}: listed` }],
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

// Sort and facet data for the table tools in docs/assets/directory.js.
const rowData = (s) => `data-id="${esc(s.id)}" data-name="${esc(displayName(s).toLowerCase())}" data-score="${s.score}" data-updated="${s.commit_date}" data-listed="${s.listed_since}" data-cited="${s.lists.length}" data-lane="${s.lane}" data-flags="${s.flags.join(" ")}" data-featured="${s.featured ? 1 : 0}"`;
const TABLE_SORTS = [["listing", "Full pages first, then name"], ["score", "Quality score"], ["name", "Name A to Z"], ["updated", "Recently updated"], ["listed", "Newest listings"], ["cited", "Most cited"]];
function tableTools(id, rows) {
  const chip = (facet, value, label, n) => `<button type="button" class="facet-chip" data-facet="${facet}" data-value="${value}" aria-pressed="false">${esc(label)} <span class="count-chip">${fmt(n)}</span></button>`;
  const lanes = LANES.map((l) => [l, rows.filter((s) => s.lane === l.id).length]).filter(([, n]) => n);
  const flags = FLAGS.map((f) => [f, rows.filter((s) => s.flags.includes(f.id)).length]).filter(([, n]) => n);
  return `        <div class="table-tools" data-table-tools="${id}" hidden>
          <label class="tools-label" for="${id}-sort">Sort by</label>
          <select id="${id}-sort" data-sort-for="${id}">${TABLE_SORTS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("")}</select>
${lanes.length > 1 ? `          <fieldset class="facet-chips" data-facet-for="${id}"><legend>Cost</legend>${lanes.map(([l, n]) => chip("lane", l.id, l.label, n)).join("")}</fieldset>\n` : ""}${flags.length ? `          <fieldset class="facet-chips" data-facet-for="${id}"><legend>Capabilities</legend>${flags.map(([f, n]) => chip("flag", f.id, f.label, n)).join("")}</fieldset>\n` : ""}          <button type="button" class="tools-reset" data-tools-reset>Reset</button>
        </div>`;
}

function skillRow(here, s, { showRepo, showLicense = false }) {
  const cat = catBySlug.get(s.category);
  const nameCell = (s.featured || s.full_page)
    ? `<a href="${rel(here, skillPath(s))}">${esc(displayName(s))}</a>`
    : `<a href="${esc(s.folder_url)}" target="_blank" rel="noopener">${esc(displayName(s))}</a>`;
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
  return `            <tr${id} ${rowData(s)}><td class="name">${nameCell} ${gradeChip(s)}</td><td class="meta">${second}</td><td class="desc">${esc(desc)}${badges}${report}</td></tr>`;
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

// "<skill>: Claude Code Skill by <Publisher> (<score>/100)" when it fits in 60
// characters, then without the score, then without the publisher. The
// publisher is the company name for official publishers and the GitHub owner
// otherwise. A skill whose owner publishes the same name in two repositories
// names the repository instead. Product names (display_name) stay as they are.
const TITLE_MAX = 60;
function skillTitleCandidates(s) {
  const n = s.name;
  const by = sharedName(s) ? `in ${s.repo}` : `by ${publisherName(s.owner, s.official)}`;
  // Cut a very long name at a hyphen so the title never ends mid-word.
  let cut = s.name;
  while (`${cut} Skill`.length > TITLE_MAX && cut.includes("-")) cut = cut.slice(0, cut.lastIndexOf("-"));
  return {
    preferred: [`${n}: Claude Code Skill ${by} (${s.score}/100)`, `${n}: Claude Code Skill ${by}`, `${n}: Claude Code Skill`],
    // Used only when the preferred title would repeat another page's.
    distinct: [`${n} Skill ${by}`, `${n} ${by}`, `${cut} ${by}`, `${n}: Claude Code Skill in ${s.repo}`, `${n} in ${s.repo}`],
    last: [`${n} Claude Code Skill`, `${n} Skill`, `${cut} Skill`],
  };
}
const SKILL_TITLES = (() => {
  const fits = (t) => t.length <= TITLE_MAX;
  const chosen = new Map();
  for (const s of data.skills.filter(s => s.featured || s.full_page)) {
    if (s.display_name) { chosen.set(s.id, s.display_name); continue; }
    const c = skillTitleCandidates(s);
    chosen.set(s.id, [...c.preferred, ...c.last].find(fits));
  }
  const taken = new Map();
  for (const [id, t] of chosen) taken.set(t.toLowerCase(), [...(taken.get(t.toLowerCase()) || []), id]);
  for (const ids of taken.values()) {
    if (ids.length < 2) continue;
    for (const id of ids) {
      const s = data.skills.find((o) => o.id === id);
      const c = skillTitleCandidates(s);
      const t = [...c.preferred, ...c.distinct].find((x) => fits(x) && !(taken.get(x.toLowerCase()) || []).some((o) => o !== id));
      if (!t) throw new Error(`no unique title fits for ${id}`);
      const prev = chosen.get(id).toLowerCase();
      taken.set(prev, taken.get(prev).filter((o) => o !== id));
      taken.set(t.toLowerCase(), [...(taken.get(t.toLowerCase()) || []), id]);
      chosen.set(id, t);
    }
  }
  return chosen;
})();
const skillTitle = (s) => SKILL_TITLES.get(s.id);

const META_MAX = 155;
const META_MIN = 70;
function skillDescription(s, withName) {
  const credit = /^See /.test(s.license) ? `${s.repo}` : `${s.repo}, ${s.license}`;
  const tail = ` From ${credit}.`;
  const head = withName ? `${displayName(s)}: ` : "";
  // Prefer whole sentences with a "Claude Code skill" credit naming the repo
  // (and license when it fits), then the plain credit, then whole sentences
  // alone. A first sentence too long for a result snippet ends at its last
  // clause break, so the description still reads as a whole sentence.
  for (const t of [` A Claude Code skill from ${credit}.`, ` A Claude Code skill from ${s.repo}.`, tail, ""]) {
    const whole = fitSentences(s.summary, META_MAX - t.length - head.length);
    if (whole && `${head}${whole}${t}`.length >= META_MIN) return `${head}${whole}${t}`;
  }
  const t = String(s.summary || "").replace(/\s+/g, " ").trim();
  for (const end of [` A Claude Code skill from ${s.repo}.`, tail, ""]) {
    const room = META_MAX - end.length - head.length - 1;
    const window = t.slice(0, room);
    const at = Math.max(window.lastIndexOf(", "), window.lastIndexOf(" and "), window.lastIndexOf(" with "), window.lastIndexOf(" for "), window.lastIndexOf(" using "), window.lastIndexOf(" from "), window.lastIndexOf(" in "));
    if (at > room * 0.5) {
      const d = `${head}${t.slice(0, at).replace(/[\s,;:(-]+$/, "")}.${end}`;
      if (d.length >= META_MIN) return d;
    }
  }
  return `${head}${trimTo(ensureSentence(s.summary), META_MAX - tail.length - head.length)}${tail}`.replace(/…\./, "…");
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
// The GitHub URL of a skill folder, as the skills CLI takes it.
const skillTreeUrl = (s) => (s.dir === "." ? (s.branch === "main" ? `https://github.com/${s.repo}` : `https://github.com/${s.repo}/tree/${s.branch}`) : `https://github.com/${s.repo}/tree/${s.branch}/${s.dir}`);

function codeBlock(id, text) {
  return `        <div class="snippet">
          <div class="snippet-head"><span>${id.label}</span><button type="button" class="snippet-copy" data-copy-target="${id.key}">Copy</button></div>
          <pre><code id="${id.key}">${esc(text)}</code></pre>
        </div>`;
}

function installSection(here, s) {
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
        <h2 id="install-title">How to use ${esc(displayName(s))}</h2>
        <p>${esc(who)} publishes ${esc(displayName(s))} under its own license terms, which restrict copying the files.</p>
${route}
      </section>`;
  }
  const treeUrl = skillTreeUrl(s);
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
  // Codex reads repository skills from .agents/skills and user skills from
  // ~/.agents/skills (developers.openai.com/codex/skills, checked 2026-10-23).
  const codex =
    s.dir === "."
      ? `mkdir -p .agents/skills
git clone --depth 1${s.branch === "main" ? "" : ` --branch ${shq(s.branch)}`} https://github.com/${s.repo}.git .agents/skills/${shq(s.name)}
rm -rf .agents/skills/${shq(s.name)}/.git`
      : `tmp="$(mktemp -d)"
git clone --depth 1${s.branch === "main" ? "" : ` --branch ${shq(s.branch)}`} https://github.com/${s.repo}.git "$tmp/repo"
mkdir -p .agents/skills
cp -R "$tmp/repo/"${shq(s.dir)} .agents/skills/
rm -rf "$tmp"`;
  const note =
    kind === "noncommercial"
      ? `<p class="muted">${esc(s.license)} allows non-commercial use only. ${esc(s.repo)} is third-party code: read SKILL.md and any bundled scripts before you install it.</p>`
      : `<p class="muted">${esc(s.repo)} is third-party code. Read SKILL.md and any bundled scripts before you install it.</p>`;
  const setup = NOTES[s.id];
  const prerequisites = setup
    ? `        <p>${esc(setup.text)} <a href="${esc(setup.source)}" target="_blank" rel="noopener">Publisher setup instructions</a>.</p>\n`
    : "";
  return `      <section class="panel" aria-labelledby="install-title">
        <h2 id="install-title">Install ${esc(displayName(s))}</h2>
${prerequisites}        <p>The skills CLI works with Claude Code, Codex, Cursor and other agents; the other routes copy the folder by hand.</p>
${codeBlock({ label: "Skills CLI", key: "install-cli" }, npx)}
${codeBlock({ label: "Claude Code, project-level copy", key: "install-claude" }, claude)}
${codeBlock({ label: "Codex, project-level copy", key: "install-codex" }, codex)}
        <p class="muted">For a user-level install, copy the folder to <code>~/.claude/skills/</code> (Claude Code) or <code>~/.agents/skills/</code> (Codex). Inside Codex, <code>$skill-installer</code> can also fetch a skill from GitHub.${guideLinksTo.skillInstall.length ? ` New to skills? Read ${listPhrase(guideLinksTo.skillInstall.map((g) => guideAnchor(here, g)))}.` : ""}</p>
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

// The "Directory summary" on every full skill page: what the skill does, who
// it is for, its score and what earned it, its license and the agents that
// install it, all from the dataset. It sits above the author's own words.
function directorySummary(here, s) {
  const cat = catBySlug.get(s.category);
  const name = displayName(s);
  const who = publisherName(s.owner, s.official);
  const verb = /^[A-Z][a-z]+[^s\W]s\b/.test(s.summary) ? `${name} ${s.summary[0].toLowerCase()}${s.summary.slice(1)}` : `${name}: ${s.summary}`;
  const drivers = fullPointDrivers(s);
  const kind = licenseKind(s);
  const license = {
    open: `${who} publishes it under ${s.license}, an open-source or open-content license, so you can use and adapt it at no cost under those terms.`,
    noncommercial: `${who} publishes it under ${s.license}, which allows non-commercial use.`,
    restricted: `${who} publishes it under its own terms, which restrict copying; the install section shows the publisher's route.`,
    unknown: `${who} publishes it under ${s.license}; read the terms before you reuse the files.`,
  }[kind];
  const agents = kind === "restricted" ? "" : " It installs in Claude Code, Codex, Cursor and other agents that read the Agent Skills format.";
  const text = `${ensureSentence(verb)} Listed in ${cat.title}, it is built for Claude Code users working on ${cat.lower.replace(/ and creative$/, " and creative work")}. It scores ${s.score}/100, grade ${s.grade}, on the Suede Skill Check${drivers.length ? `, with full points for ${listPhrase(drivers)}` : ""}. ${license}${agents}`;
  const tasks = tasksBySkill.get(s.id) || [];
  const alt = altBySkill.get(s.id);
  const links = [
    tasks.length ? `<p class="also-ranked">Also ranked in: ${tasks.map((t) => `<a href="${rel(here, taskPath(t))}">Best Claude Code skills for ${esc(t.job.topic)}</a>`).join(" &middot; ")}</p>` : "",
    alt ? `<p><a href="${rel(here, altPath(s))}">Compare ${plural(alt.peers.length, "alternative")} to ${esc(displayName(s))}</a></p>` : "",
  ].filter(Boolean).join("\n        ");
  return `      <section class="panel" id="summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Directory summary</h2>
        <p>${esc(text)}</p>${links ? `\n        ${links}` : ""}
      </section>`;
}

// The score card beside the lead: the number, the grade and a meter.
const scoreCard = (s) => `        <div class="score-card grade-${s.grade.toLowerCase()}" role="img" aria-label="Suede Skill Check ${s.score} out of 100, grade ${s.grade}">${s.shielded ? `<img class="shield" src="score.svg" alt="" width="54" height="60">` : ""}<span class="score">${s.score}<small>/100</small></span><span class="score-label">Suede Skill Check</span><span class="score-meter"><span style="width:${s.score}%"></span></span><span class="grade grade-${s.grade.toLowerCase()}">Grade ${s.grade}</span></div>`;

// Safety and provenance at a glance, read from the install record. Every
// cell repeats a fact the page states in full lower down.
function glancePanel(here, s) {
  const i = s.install || {};
  const creds = [...new Set([...(i.env_read || []), ...(i.env_docs || [])])];
  const scripts = Object.values(i.langs || {}).reduce((n, c) => n + c, 0);
  const inst = installsFor(s);
  const cells = [
    ["Publisher", `${esc(publisherName(s.owner, s.official))}${officialTag(s.official)}`],
    ["License", `${esc(s.license)}`],
    ["Cost", `<a href="${rel(here, lanePath(s.lane))}">${esc(laneById.get(s.lane).label)}</a>`],
    inst ? ["Installs via skills.sh", `<a href="${esc(skillsShUrl(s))}" target="_blank" rel="noopener">${esc(compact(inst.installs))}</a>`] : null,
    ["Bundled scripts", scripts ? `<span class="warn">${plural(scripts, "file")}</span>` : `<span class="ok">None</span>`],
    ["Credentials", creds.length ? `<span class="warn">${esc(creds.slice(0, 3).join(", "))}${creds.length > 3 ? ` and ${creds.length - 3} more` : ""}</span>` : `<span class="ok">None named</span>`],
    ["Outside hosts", (i.hosts || []).length ? `<span class="warn">${esc(i.hosts.slice(0, 2).join(", "))}${i.hosts.length > 2 ? ` and ${i.hosts.length - 2} more` : ""}</span>` : i.net ? `<span class="warn">HTTP client or cloud SDK</span>` : `<span class="ok">None</span>`],
    ["MCP server", i.mcp || (i.mcp_tools || []).length ? `<span class="warn">Yes</span>` : `<span class="ok">No</span>`],
    ["Security scan", `Not scanned by the directory${inst ? `. <a href="${esc(skillsShUrl(s))}" target="_blank" rel="noopener">Third-party audits on skills.sh</a>` : ""}`],
    ["Listed since", s.listed_since === LISTED_FLOOR ? `${longDate(s.listed_since)} or earlier` : longDate(s.listed_since)],
  ].filter(Boolean);
  return `      <dl class="glance" aria-label="At a glance">
${cells.map(([k, v]) => `        <div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("\n")}
      </dl>`;
}

function renderSkill(s) {
  const here = skillPath(s);
  const cat = catBySlug.get(s.category);
  const r = repos.get(s.repo_slug);
  const trail = [["directory/", "Directory"], [catPath(cat.slug), cat.title]];
  if (r.hasPage) trail.push([r.target, s.repo]);
  trail.push([null, displayName(s)]);
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
    ["Topics", (TOPICS_BY_SKILL.get(s.id) || []).slice(0, 6).map((t) => `<a href="${rel(here, topicPath(t))}">${esc(t.topic.name)}</a>`).join(", ")],
    ["Cost", `<a href="${rel(here, lanePath(s.lane))}">${esc(laneById.get(s.lane).label)}</a>`],
    ["Capabilities", s.flags.filter((f) => f !== "full-page").map((f) => `<a href="${rel(here, flagPath(f))}">${esc(flagById.get(f).label)}</a>`).join(", ")],
    ["License", `<a href="${esc(s.license_url)}" target="_blank" rel="noopener">${esc(s.license)}</a>${s.license_evidence?.length > 1 ? "<ul>" + s.license_evidence.map(e => `<li><a href="https://github.com/${esc(s.repo)}/blob/${esc(s.branch)}/${esc(e.file)}" target="_blank" rel="noopener">${esc(e.label)} (${esc(e.file)})</a></li>`).join("") + "</ul>" : ""}`],
    ["Last commit", `${longDate(s.commit_date)} (repository)`],
    ["Listed since", s.listed_since === LISTED_FLOOR ? `${longDate(s.listed_since)} or earlier` : longDate(s.listed_since)],
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
  const skillFaq = faqBlock(here, skillFaqItems(s));
  const body = `${bc.html}
      <div class="skill-head">
        <div>
          <p class="lead">${esc(ensureSentence(s.summary))}</p>
          <div class="skill-actions">${licenseKind(s) !== "restricted" ? `<button type="button" class="button" data-copy-target="install-cli">Copy install command</button> ` : ""}<a class="button secondary" href="${esc(s.folder_url)}" target="_blank" rel="noopener">View on GitHub</a> <a class="button secondary" href="${esc(s.skill_md_url)}" target="_blank" rel="noopener">Read SKILL.md</a> ${saveButton(s)}</div>
        </div>
${scoreCard(s)}
      </div>
${glancePanel(here, s)}
${shareRow(here, `${displayName(s)}: agent skill by ${publisherName(s.owner, s.official)}`)}
      <section class="panel" aria-labelledby="facts-title">
        <h2 id="facts-title">At a glance</h2>
${facts}
      </section>
${beforeInstall(s)}
${installSection(here, s)}
${directorySummary(here, s)}
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
        <p>${esc(displayName(s))} passes the required frontmatter check and ${checkSummary(s).replace(/^Passes /, "")}, which cover the SKILL.md format, a declared license and a commit in the last year. Those checks earn ${s.score_parts[0].points} of the score’s points; the rest come from description quality, instruction depth, bundled files, maintenance and curated-list citations${rawPoints > SCORE_CAP ? `, capped at ${SCORE_CAP}` : ""}. <a href="${rel(here, "directory/methodology/")}">How the score works</a>.</p>
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
      <section class="panel" aria-labelledby="cited-title">
        <h2 id="cited-title">Where this skill is cited</h2>
        <p>${s.lists.length ? `${esc(s.repo)} appears in ${plural(s.lists.length, "curated list")}: ${s.lists.map(listLink).join(", ")}.` : `${esc(s.repo)} is listed from its publisher's official collection or a listing request.`}</p>${citationEvidence(s.repo)}
      </section>
${strengthsPanel(s)}
${reviewsPanel(here, s)}
${skillFaq.html}
${similarPanel(here, s)}
${guideLinksPanel(here, skillGuides(s), "Read next")}
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
      </section>` : ""}
${qualityBadgeBlock(here, s)}
${servicesCta("skill", s.category, here, { compact: true, publisher: publisherClaim(here) })}`;
  const description = skillDescription(s, descriptionNeedsName.has(s.id));
  const ownSkill = s.repo.toLowerCase() === "jasoncolapietro/suede-creator-skills";
  const taskName = s.name.replace(/^suede-/, "").replaceAll("-", " ");
  const keywords = setKeywords(here, ownSkill ? [
    `${taskName} agent skill`,
    `${taskName} workflow`,
    `${cat.short} agent skills`,
    "SKILL.md",
    displayName(s),
  ] : [
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
    name: displayName(s),
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
      <h1>${esc(displayName(s))} <span class="h1-sub">agent skill ${esc(sharedName(s) ? `in ${s.repo}` : `by ${s.owner}`)}</span></h1>`,
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
        isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF,
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        mainEntity: code,
      },
      bc.ld,
      skillFaq.ld,
    ],
    footerNote: `${esc(displayName(s))} is published by ${esc(s.owner)} in ${esc(s.repo)} and listed in the Suede AI Skills Directory, a curated index of public Agent Skills.`,
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
${campaignPanel(here, publisherClaim(here))}
      <section class="panel" aria-labelledby="skills-title">
        <h2 id="skills-title">Skills in ${esc(r.repo)}</h2>
        <p class="muted">Linked names open the skill's directory page; the rest open the skill folder on GitHub. Descriptions on rows without a page are quoted from each SKILL.md.</p>
${r.skills.length > 30 ? filterField("repo-skills", r.skills.length, "skills") : ""}
${skillTable(here, r.skills, { id: "repo-skills", showRepo: false, caption: "skills", showLicense: r.licenseCounts.length > 1 })}
      </section>
${servicesCta("repository", r.primary, here)}
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
  const ownCollection = r.repo.toLowerCase() === "jasoncolapietro/suede-creator-skills";
  const title = ownCollection ? `Suede AI Skills: ${r.skills.length} Agent Skills` : [`${r.repo} Agent Skills (${r.skills.length}) | Suede AI`, `${r.repo} Agent Skills (${r.skills.length})`, `${r.name} Agent Skills by ${r.owner}`, `${trimTo(r.repo, 46)} Agent Skills`].find((t) => t.length <= 60);
  const top = r.skills.slice(0, 3).map((s) => displayName(s)).join(", ");
  // Name as many top skills as fit, so the description stays a whole sentence.
  const repoLead = `${plural(r.skills.length, "agent skill")} from ${r.repo}`;
  const repoTail = "Install steps, Suede Skill Check grades and a README badge.";
  const description = [3, 2, 1].map((k) => `${repoLead}, including ${r.skills.slice(0, k).map((s) => displayName(s)).join(", ")}. ${repoTail}`)
    .concat(`${repoLead}. ${repoTail}`)
    .find((d) => d.length <= META_MAX) || trimTo(`${repoLead}, including ${top}. ${repoTail}`, META_MAX);
  const keywords = r.indexable ? setKeywords(here, ownCollection ? ["marketing and workflow agent skills", "code review agent skills", "creator tools", "agent skills directory", "Suede AI Skills"] : [`${r.repo} skills`, `${r.name} skills`, `${r.owner} agent skills`, `${r.name} claude skills`, `${primary.short} agent skills`, "agent skills directory"]) : null;
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url(here)}#page`,
    name: title,
    description,
    url: url(here),
    dateModified: PAGE_DATE,
    isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF,
    breadcrumb: { "@id": `${url(here)}#breadcrumb` },
    about: { "@type": "SoftwareSourceCode", name: r.repo, codeRepository: `https://github.com/${r.repo}` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: r.skills.length,
      itemListElement: r.skills.slice(0, 50).map((s, i) => ({ "@type": "ListItem", position: i + 1, name: displayName(s), url: (s.featured || s.full_page) ? url(skillPath(s)) : s.folder_url })),
    },
  };
  if (r.official) collection.about.author = { "@type": "Organization", name: r.publisher, url: `https://github.com/${r.owner}` };
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Skill collection &middot; ${esc(r.owner)}</div>
      <h1>${esc(ownCollection ? "Suede AI Skills" : r.repo)} <span class="h1-sub">${plural(r.skills.length, "graded agent skill")} from ${esc(r.official && r.publisher ? r.publisher : r.owner)}</span></h1>`,
    body,
    jsonld: [collection, bc.ld],
    robots: r.indexable ? undefined : "noindex, follow",
    footerNote: `${esc(r.repo)} is listed in the Suede AI Skills Directory, a curated index of public Agent Skills for Claude Code, Codex and other agents.`,
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

// Where a table row's name points: the full skill page, else the row on its
// repository page, else the skill folder on GitHub.
function listItemUrl(s) {
  if (s.featured || s.full_page) return url(skillPath(s));
  const r = repos.get(s.repo_slug);
  return r.hasPage ? `${url(r.target)}#${s.slug}` : s.folder_url;
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
            <span class="dir-card-head"><b>${esc(displayName(s))}</b>${gradeChip(s)}</span>
            <span class="dir-card-repo">${esc(s.repo)}</span>
            <span class="dir-card-text">${esc(trimTo(s.summary, 140))}</span>
          </a>`
    )
    .join("\n");
  const sorted = [...all].sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name) || a.repo.localeCompare(b.repo));
  const others = categories.filter((o) => o.slug !== c.slug);
  // A one-sentence, quotable answer to "best <category> skills for Claude":
  // the highest Suede Skill Check scores among skills with a full page, one
  // per repository, with the snapshot date so the claim carries its own scope.
  const best = [];
  for (const s of [...feat].sort((a, b) => b.score - a.score || b.lists.length - a.lists.length || a.id.localeCompare(b.id))) {
    if (best.some((o) => o.repo_slug === s.repo_slug)) continue;
    best.push(s);
    if (best.length === 3) break;
  }
  const answer = best.length
    ? `      <p class="answer"><b>Highest-scoring ${esc(c.short)} skills</b> in the ${longDate(data.generated)} snapshot: ${listPhrase(best.map((s) => `<a href="${rel(here, skillPath(s))}">${esc(displayName(s))}</a> from ${esc(s.repo)} (${s.score}/100)`))}. Scores come from the <a href="${rel(here, "directory/methodology/")}">Suede Skill Check</a>.</p>`
    : "";
  const matrixSize = heroMatrixSize(all.length);
  const hero = pageHero(`          <div class="eyebrow">Skill directory &middot; ${esc(c.label)}</div>
          <div class="hero-row">${pixelIcon(c.slug, { size: 56, className: "pix page-icon" })}<div><h1>${esc(c.title)} <span class="h1-sub">agent skills</span></h1></div></div>
${bc.html}
          <p class="lead">${esc(c.intro)}</p>
          <ul class="stat-row" aria-label="Category size">
            <li><b>${fmt(all.length)}</b> listed skills</li>
            <li><b>${fmt(repoCounts.size)}</b> repositories</li>
            <li><b>${fmt(feat.length)}</b> with full pages</li>
          </ul>`, `        <figure class="hero-figure" style="--figure-w:${matrixSize.width + 22}px"><img class="matrix" src="matrix.svg" width="${matrixSize.width}" height="${matrixSize.height}" alt="${fmt(all.length)} ${esc(c.lower)} skills as a grid of dots, one per skill, sorted by score and colored by grade" loading="eager" decoding="async">${matrixCaption(`Every dot is a listed ${esc(c.lower)} skill, sorted by score.`)}</figure>`);
  const body = `${answer}
      <p><a class="button secondary" href="${rel(here, "directory/")}?category=${esc(c.slug)}#browse">Build a shortlist for your task →</a></p>
      <section class="panel" aria-labelledby="all-title">
        <h2 id="all-title">All ${fmt(all.length)} ${esc(c.short)} skills</h2>
${tableTools("all-skills", all)}
${filterField("all-skills", all.length, "skills")}
${skillTable(here, sorted, { id: "all-skills", showRepo: true, caption: `${c.short} skills` })}
      </section>
      <section class="panel" aria-labelledby="choose-title">
        <h2 id="choose-title">How to choose ${esc(c.lower)} skills</h2>
${c.guide.map((p) => `        <p>${esc(p)}</p>`).join("\n")}
      </section>
${topicChipsPanel(here, c)}
${tasksPanel(here, TASKS.filter((t) => t.rows.some((s) => s.category === c.slug)), `Best ${c.short} skills by task`)}
${guideLinksPanel(here, pageGuides(here), `${c.short[0].toUpperCase()}${c.short.slice(1)} guides`)}
${picks.length ? `      <section class="panel" aria-labelledby="picks-title">
        <h2 id="picks-title">Where to start</h2>
        <div class="links">
${picks.map(({ s, why }) => `          <a class="link-row" href="${rel(here, skillPath(s))}"><b>${esc(displayName(s))}</b><span>${esc(trimTo(s.summary, 120))} ${esc(why)}</span></a>`).join("\n")}
        </div>
      </section>` : ""}
${servicesCta("category", c.slug, here)}
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
  files.set(`${here}matrix.svg`, skillMatrix(all, { cols: matrixSize.cols, title: `${fmt(all.length)} ${c.lower} skills, one dot each, colored by Suede Skill Check grade` }));
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: hero,
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
        isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF,
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        // Every row of the "All N skills" table, in table order, so the list
        // and its numberOfItems match what the page shows.
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: sorted.length,
          itemListElement: sorted.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: displayName(s), url: listItemUrl(s) })),
        },
      },
      bc.ld,
    ],
    footerNote: `The ${esc(c.lower)} directory lists public Agent Skills that pass the Suede Skill Check, with links to every source repository.`,
  }));
}

// ------------------------------------------------------------------ task and alternatives pages

const wordCount = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;
const DIRECTORY_SITE = { "@type": "WebSite", "@id": `${BASE}/#website`, name: "Suede AI Skills", url: `${BASE}/`, publisher: { "@id": ORG_ID } };
const SITE_LABEL = "SuedeAI.directory";

// The rubric components a skill earns in full, largest first, for sentences
// such as "full points for structural checks, recent maintenance and ...".
function fullPointDrivers(s, n = 3) {
  return s.score_parts.filter((p) => p.points === p.max && p.max > 0).sort((a, b) => b.max - a.max || a.label.localeCompare(b.label)).slice(0, n).map((p) => p.label.toLowerCase());
}

// "MIT (4), Apache-2.0 (2) and CC-BY-4.0 (1)", most common first.
function licenseCounts(rows) {
  const m = new Map();
  for (const s of rows) m.set(s.license, (m.get(s.license) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const countWord = (n, one, many) => `${fmt(n)} ${n === 1 ? one : many}`;

function freeAnswer(rows, subject) {
  const kinds = { open: [], noncommercial: [], restricted: [], unknown: [] };
  for (const s of rows) kinds[licenseKind(s)].push(s);
  const total = rows.length;
  const names = (xs) => listPhrase(xs.map((s) => displayName(s)));
  const parts = [`All ${fmt(total)} ${subject} are published in public GitHub repositories and cost nothing to download.`];
  if (kinds.open.length) {
    const lic = licenseCounts(kinds.open).slice(0, 4).map(([l, n]) => `${l} (${fmt(n)})`);
    parts.push(`${kinds.open.length === total ? "Every one uses" : kinds.open.length === 1 ? "One uses" : `${fmt(kinds.open.length)} use`} an open-source or open-content license, led by ${listPhrase(lic)}, so you can use and adapt the files at no cost under those terms.`);
  }
  if (kinds.noncommercial.length) parts.push(`${names(kinds.noncommercial)} ${kinds.noncommercial.length === 1 ? "allows" : "allow"} non-commercial use only.`);
  if (kinds.restricted.length) parts.push(`${names(kinds.restricted)} ${kinds.restricted.length === 1 ? "is" : "are"} published under the publisher's own terms, which restrict copying; read them before you install.`);
  if (kinds.unknown.length) parts.push(`${names(kinds.unknown)} ${kinds.unknown.length === 1 ? "uses" : "use"} custom license terms; read them before you reuse the files.`);
  const creds = rows.filter((s) => s.featured && s.install && ((s.install.env_read || []).length || (s.install.env_docs || []).length));
  if (creds.length) parts.push(`${creds.length === 1 ? "One skill names" : `${fmt(creds.length)} skills name`} credentials for an outside service; each full page lists them under Before you install.`);
  return parts.join(" ");
}

function agentsAnswer(rows, subject) {
  const restricted = rows.filter((s) => licenseKind(s) === "restricted");
  const routes = rows.length - restricted.length;
  const compat = rows.filter((s) => s.compatibility);
  const parts = [`Yes. Each of the ${fmt(rows.length)} ${subject} is a SKILL.md folder in the Agent Skills format, which Claude Code, Codex and Cursor all read.`];
  parts.push(`The skills CLI (npx skills add) installs ${routes === rows.length ? "every one of them" : `${fmt(routes)} of them`} into Claude Code, Codex, Cursor and other agents, and each full skill page adds a project-level copy into .claude/skills for Claude Code and .agents/skills for Codex.`);
  if (restricted.length) parts.push(`${listPhrase(restricted.map((s) => displayName(s)))} ${restricted.length === 1 ? "follows" : "follow"} the publisher's own install route, shown on ${restricted.length === 1 ? "its" : "their"} page.`);
  if (compat.length) parts.push(`${compat.length === 1 ? `${displayName(compat[0])} declares` : `${fmt(compat.length)} of them declare`} compatibility in the SKILL.md frontmatter.`);
  return parts.join(" ");
}

function installAnswer(rows, noun) {
  const pick = rows.find((s) => licenseKind(s) !== "restricted");
  if (!pick) return `Each ${noun} skill on this page is published under its publisher's own terms. Open its listing to follow the publisher's install route.`;
  return `Run npx skills add with the skill folder's GitHub URL from your project, or copy the folder into .claude/skills/ and Claude Code loads it when a request matches its description. For ${displayName(pick)}, run: npx skills add ${skillTreeUrl(pick)}. Each full skill page on ${SITE_LABEL} lists the same steps for Claude Code and Codex.`;
}

// Visible Q&A and its FAQPage node, built from the same strings so the two
// never drift. Answers are plain text.
function faqBlock(here, faq) {
  const html = `      <section class="panel faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Questions and answers</h2>
${faq.map(([q, a]) => `        <h3>${esc(q)}</h3>\n        <p>${esc(a)}</p>`).join("\n")}
      </section>`;
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", "@id": `${url(here)}#faq`, mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return { html, ld };
}

// One comparison row: skill, publisher, score, license, what it does.
function compareRow(here, s, { subject = false } = {}) {
  const r = repos.get(s.repo_slug);
  const name = s.featured
    ? `<a href="${rel(here, skillPath(s))}">${esc(displayName(s))}</a>`
    : r.hasPage
      ? `<a href="${rel(here, r.target)}#${esc(s.slug)}">${esc(displayName(s))}</a>`
      : `<a href="${esc(s.folder_url)}" target="_blank" rel="noopener">${esc(displayName(s))}</a>`;
  const repoLink = r.hasPage ? `<a href="${rel(here, r.target)}">${esc(s.repo)}</a>` : `<a href="https://github.com/${esc(s.repo)}" target="_blank" rel="noopener">${esc(s.repo)}</a>`;
  return `            <tr${subject ? ' class="compare-subject"' : ""}><td class="name">${name}${subject ? " <span class=\"tag\">Compared skill</span>" : ""}</td><td class="meta">${esc(publisherName(s.owner, s.official))}${officialTag(s.official)}<br><span class="row-license">${repoLink}</span></td><td>${gradeChip(s)}</td><td>${esc(s.license)}</td><td class="desc">${esc(s.featured ? s.summary : trimTo(s.description, 150))}</td></tr>`;
}

function compareTable(here, rows, { id, subject = null }) {
  return `        <div class="table-wrap">
          <table class="skill-table compare-table" id="${id}">
            <thead><tr><th scope="col">Skill</th><th scope="col">Publisher</th><th scope="col">Suede Skill Check</th><th scope="col">License</th><th scope="col">What it does</th></tr></thead>
            <tbody>
${[...(subject ? [compareRow(here, subject, { subject: true })] : []), ...rows.map((s) => compareRow(here, s))].join("\n")}
            </tbody>
          </table>
        </div>`;
}

function fitMeta(candidates, label) {
  const d = candidates.find((c) => c.length >= META_MIN && c.length <= META_MAX);
  if (!d) throw new Error(`${label}: no meta description fits ${META_MIN}-${META_MAX} characters`);
  return d;
}

function taskTitle(t) {
  const n = t.rows.length;
  const options = [`Best Claude Code Skills for ${t.job.job}: ${n} Graded Picks`, `Best Claude Code Skills for ${t.job.job}: ${n} Picks`, `Claude Code Skills for ${t.job.job}: ${n} Graded`, `Claude Code Skills for ${t.job.job}`];
  return options.find((x) => x.length <= 60) || trimTo(options.at(-1), 60);
}

// The direct answer under each Q&A-style H1: 40 to 60 words, the length an
// answer engine quotes whole. The first candidate that fits wins.
function answerWithin(candidates, label) {
  const fit = candidates.find((c) => wordCount(c) >= 40 && wordCount(c) <= 60);
  if (!fit) throw new Error(`${label}: no direct answer fits 40-60 words (${candidates.map(wordCount).join(", ")})`);
  return fit;
}

function taskDirectAnswer(t) {
  const top = t.rows[0];
  const repoCount = new Set(t.rows.map((s) => s.repo_slug)).size;
  const of = t.rows.length === t.matches.length ? `all ${fmt(t.matches.length)}` : `the top ${fmt(t.rows.length)} of ${fmt(t.matches.length)}`;
  const lead = `${displayName(top)} from ${top.repo} is the highest-scoring Claude Code skill for ${t.job.topic}, at ${top.score}/100 (grade ${top.grade}) on the Suede Skill Check.`;
  const table = `The table below compares ${of} listed ${t.job.noun} skills from ${plural(repoCount, "repository", "repositories")} by score, publisher and license, using the ${longDate(data.generated)} snapshot of ${SITE_LABEL}.`;
  return answerWithin([`${lead} ${table}`, `${lead} ${table} Every score follows the published rubric.`, `${lead.replace(/ \(grade [A-D]\)/, "")} ${table}`], `task ${t.job.id}`);
}

function taskFaq(t) {
  const top = t.rows[0];
  const drivers = fullPointDrivers(top);
  const subject = `${t.job.noun} skills on this page`;
  const faq = [
    [`Which ${t.job.noun} skill has the highest Suede Skill Check score?`, `${displayName(top)} from ${top.repo} scores ${top.score}/100, grade ${top.grade}, the highest of the ${fmt(t.matches.length)} listed ${t.job.noun} skills in the ${longDate(data.generated)} snapshot.${drivers.length ? ` It earns full points for ${listPhrase(drivers)}.` : ""}${t.rows[1] ? ` ${displayName(t.rows[1])} from ${t.rows[1].repo} follows at ${t.rows[1].score}/100.` : ""}`],
    [`How do I install ${withArticle(t.job.noun)} skill in Claude Code?`, installAnswer(t.rows, t.job.noun)],
    [`Are these ${t.job.noun} skills free?`, freeAnswer(t.rows, subject)],
    [`Do these ${t.job.noun} skills work with Codex and Cursor?`, agentsAnswer(t.rows, subject)],
    [`How does ${SITE_LABEL} rank ${t.job.noun} skills?`, `By Suede Skill Check score from 0 to 99, which adds structure, description quality, instruction depth, bundled files, maintenance and curated-list citations, all read from each skill's published files. A skill joins this page when its name or summary matches the ${t.job.topic} keyword map; each repository fills at most three rows, so the table compares publishers.`],
  ];
  const official = t.rows.filter((s) => s.official);
  if (official.length) {
    const byPublisher = new Map();
    for (const s of official) byPublisher.set(publisherName(s.owner, true), [...(byPublisher.get(publisherName(s.owner, true)) || []), displayName(s)]);
    faq.push([`Which ${t.job.noun} skills come from official publishers?`, `${listPhrase([...byPublisher].map(([p, names]) => `${listPhrase(names)} from ${p}`))} ${official.length === 1 ? "is" : "are"} published by the company behind the tool, marked Official in the table.`]);
  }
  return faq;
}

const taskCategories = (t) => [...new Set(t.rows.map((s) => s.category))];

function renderTask(t) {
  const here = taskPath(t);
  const top = t.rows[0];
  const bc = crumbs(here, [["directory/", "Directory"], [TASKS_PATH, "Skills by task"], [null, `Skills for ${t.job.topic}`]]);
  const answer = taskDirectAnswer(t);
  const faq = faqBlock(here, taskFaq(t));
  const alts = t.rows.map((s) => altBySkill.get(s.id)).filter(Boolean);
  const cats = taskCategories(t);
  const others = TASKS.filter((o) => o !== t);
  const body = `${bc.html}
      <p class="answer" id="answer">${esc(answer)}</p>
      <ul class="stat-row" aria-label="Task page size">
        <li><b>${fmt(t.matches.length)}</b> listed ${esc(t.job.noun)} skills</li>
        <li><b>${fmt(t.strong.length)}</b> full pages scoring 80+</li>
        <li><b>${fmt(new Set(t.matches.map((s) => s.repo_slug)).size)}</b> repositories</li>
      </ul>
      <section class="panel" aria-labelledby="compare-title">
        <h2 id="compare-title">Compare ${fmt(t.rows.length)} Claude Code skills for ${esc(t.job.topic)}</h2>
        <p class="muted">Ranked by Suede Skill Check score. Linked names open the directory listing; scores come from the <a href="${rel(here, "directory/methodology/")}#score">published rubric</a>.</p>
${compareTable(here, t.rows, { id: "task-skills" })}
      </section>
${faq.html}
${alts.length ? `      <section class="panel" aria-labelledby="alts-title">
        <h2 id="alts-title">Compare alternatives</h2>
        <div class="links">
${alts.map((a) => `          <a class="link-row" href="${rel(here, altPath(a.s))}"><b>${esc(altName(a.s))} alternatives</b><span>${plural(a.peers.length, "similar skill")} from other publishers</span></a>`).join("\n")}
        </div>
      </section>` : ""}
${servicesCta("task", cats[0], here)}
      <section class="panel" aria-labelledby="more-title">
        <h2 id="more-title">More Claude Code skills by task</h2>
        <p class="cat-links">${others.map((o) => `<a href="${rel(here, taskPath(o))}">${esc(o.job.job)}</a>`).join(" &middot; ")}</p>
        <p>Browse by category: ${cats.map((c) => `<a href="${rel(here, catPath(c))}">${esc(catBySlug.get(c).title)}</a>`).join(" &middot; ")}.</p>
      </section>`;
  const title = taskTitle(t);
  const n = t.rows.length;
  const description = fitMeta([
    `Compare ${n} graded Claude Code skills for ${t.job.topic}. ${displayName(top)} from ${top.repo} leads at ${top.score}/100 on the Suede Skill Check.`,
    `Compare ${n} graded Claude Code skills for ${t.job.topic}. ${displayName(top)} leads at ${top.score}/100 on the Suede Skill Check.`,
    `${displayName(top)} leads ${n} graded Claude Code skills for ${t.job.topic} at ${top.score}/100. Compare scores, licenses and installs.`,
    `${displayName(top)} leads ${n} Claude Code skills for ${t.job.topic} at ${top.score}/100.`,
  ], `task ${t.job.id}`);
  const keywords = setKeywords(here, [`claude code skills for ${t.job.topic}`, `best ${t.job.noun} skills for claude code`, `${t.job.noun} claude skills`, `${t.job.noun} agent skills`, `${t.job.noun} skills for codex`, `best claude skills for ${t.job.topic}`]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Skills by task &middot; ${esc(t.job.job)}</div>
      <h1>What are the best Claude Code skills for ${esc(t.job.topic)}?</h1>`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${url(here)}#page`,
        name: title,
        headline: `What are the best Claude Code skills for ${t.job.topic}?`,
        description,
        url: url(here),
        dateModified: PAGE_DATE,
        inLanguage: "en",
        isPartOf: DIRECTORY_SITE,
        publisher: PUBLISHER_REF,
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          "@id": `${url(here)}#list`,
          name: `Claude Code skills for ${t.job.topic}`,
          numberOfItems: t.rows.length,
          itemListElement: t.rows.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: displayName(s), url: (s.featured || s.full_page) ? url(skillPath(s)) : s.folder_url })),
        },
      },
      bc.ld,
      faq.ld,
    ],
    footerNote: `Claude Code skills for ${esc(t.job.topic)}, ranked by the Suede Skill Check on ${SITE_LABEL}. Every skill belongs to its publisher and links to its source.`,
  }));
}

function renderTaskHub() {
  const here = TASKS_PATH;
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Skills by task"]]);
  const title = `Claude Code Skills by Task: ${TASKS.length} Graded Shortlists`;
  const description = fitMeta([`Find the best Claude Code skills for ${TASKS.slice(0, 4).map((t) => t.job.topic).join(", ")} and ${fmt(TASKS.length - 4)} more tasks, ranked by the Suede Skill Check.`, `Find the best Claude Code skills for ${fmt(TASKS.length)} tasks, each a shortlist ranked by the Suede Skill Check with scores and licenses.`], "task hub");
  const body = `${bc.html}
      <p class="lead">Pick the job, get the shortlist. Each page answers one question, such as which skills are best for ${esc(listPhrase(TASKS.slice(0, 3).map((t) => t.job.topic)))}, with a comparison table ranked by the Suede Skill Check and answers on install, licenses and agent support.</p>
      <section class="panel" aria-labelledby="tasks-title">
        <h2 id="tasks-title">${plural(TASKS.length, "task")}</h2>
        <div class="links">
${TASKS.map((t) => `          <a class="link-row" href="${rel(here, taskPath(t))}"><b>Best Claude Code skills for ${esc(t.job.topic)}</b><span>Top pick: ${esc(displayName(t.rows[0]))} (${t.rows[0].score}/100) &middot; ${plural(t.rows.length, "skill")} compared</span></a>`).join("\n")}
        </div>
      </section>
      <section class="panel" aria-labelledby="gate-title">
        <h2 id="gate-title">How a task gets a page</h2>
        <p>A task gets its own page when at least ${TASK_GATE.minListed} listed skills match it and at least ${TASK_GATE.minStrongPages} of them have full directory pages scoring ${TASK_GATE.strongScore} or more. Suede AI's own skills are never ranked here. <a href="${rel(here, "directory/methodology/")}">How skills are scored</a>.</p>
      </section>`;
  const keywords = setKeywords(here, ["claude code skills by task", "best claude code skills for every task", "agent skills by use case", "claude skills shortlist"]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; Skills by task</div>
      <h1>Which Claude Code skills fit your task?</h1>`,
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
        inLanguage: "en",
        isPartOf: DIRECTORY_SITE,
        publisher: PUBLISHER_REF,
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: TASKS.length,
          itemListElement: TASKS.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: `Best Claude Code skills for ${t.job.topic}`, url: url(taskPath(t)) })),
        },
      },
      bc.ld,
    ],
    footerNote: `Task shortlists from ${SITE_LABEL}, built from the directory's published scores.`,
  }));
}

function altTitle(a) {
  const n = altName(a.s);
  const k = a.peers.length;
  const options = [`${n} Alternatives: ${k} Similar Claude Code Skills`, `${n} Alternatives: ${k} Claude Code Skills`, `${n} Alternatives (${k} Skills)`, `${n} Alternatives`];
  const fit = options.find((x) => x.length <= 60);
  if (fit) return fit;
  // A very long skill name is cut at a hyphen so the title never ends mid-word.
  let short = n;
  while (`${short} Alternatives`.length > 60 && short.includes("-")) short = short.slice(0, short.lastIndexOf("-"));
  if (`${short} Alternatives`.length > 60) throw new Error(`alternatives ${a.s.id}: no title fits 60 characters`);
  return `${short} Alternatives`;
}

function altDirectAnswer(a) {
  const s = a.s;
  const best = a.peers[0];
  const cat = catBySlug.get(s.category);
  const lead = `The highest-scoring alternative to ${altName(s)} is ${displayName(best)} from ${best.repo}, at ${best.score}/100 (grade ${best.grade}) on the Suede Skill Check; ${altName(s)} scores ${s.score}/100.`;
  const table = `The table compares ${plural(a.peers.length, `${a.task.job.noun} skill`)} in ${cat.lower} from other publishers, each with a full ${SITE_LABEL} page.`;
  return answerWithin([`${lead} ${table}`, `${lead} ${table} Every score follows the published rubric.`, `${lead.replace(/ \(grade [A-D]\)/, "")} ${table}`], `alternatives ${s.id}`);
}

function altFaq(a) {
  const s = a.s;
  const name = altName(s);
  const best = a.peers[0];
  const higher = a.peers.filter((o) => o.score > s.score).length;
  const tie = a.peers.filter((o) => o.score === s.score).length;
  const lower = a.peers.length - higher - tie;
  const scores = a.peers.map((o) => o.score);
  const spread = [higher && `${higher === 1 ? "one scores" : `${fmt(higher)} score`} higher`, tie && `${tie === 1 ? "one ties" : `${fmt(tie)} tie`}`, lower && `${lower === 1 ? "one scores" : `${fmt(lower)} score`} lower`].filter(Boolean);
  const subject = `alternatives to ${name}`;
  const drivers = fullPointDrivers(best);
  return [
    [`What is the highest-scoring alternative to ${name}?`, `${displayName(best)} from ${best.repo}, at ${best.score}/100, grade ${best.grade}.${drivers.length ? ` It earns full points for ${listPhrase(drivers)}.` : ""} ${ensureSentence(best.summary)}`],
    [`How does ${name} compare with its alternatives?`, `${name} scores ${s.score}/100, grade ${s.grade}. Of the ${fmt(a.peers.length)} alternatives, ${listPhrase(spread)}; their scores run from ${Math.min(...scores)} to ${Math.max(...scores)}. All of them sit in ${catBySlug.get(s.category).lower} and match the ${a.task.job.topic} keyword map.`],
    [`Are the ${subject} free?`, freeAnswer(a.peers, subject)],
    [`Do the ${subject} work in Claude Code, Codex and Cursor?`, agentsAnswer(a.peers, subject)],
  ];
}

function renderAlternatives(a) {
  const s = a.s;
  const here = altPath(s);
  const cat = catBySlug.get(s.category);
  const name = altName(s);
  const bc = crumbs(here, [["directory/", "Directory"], [catPath(cat.slug), cat.title], [skillPath(s), displayName(s)], [null, "Alternatives"]]);
  const answer = altDirectAnswer(a);
  const faq = faqBlock(here, altFaq(a));
  const more = a.peers.map((o) => altBySkill.get(o.id)).filter(Boolean);
  const body = `${bc.html}
      <p class="answer" id="answer">${esc(answer)}</p>
      <section class="panel" aria-labelledby="compare-title">
        <h2 id="compare-title">${esc(name)} and ${plural(a.peers.length, "alternative")}</h2>
        <p class="muted">Alternatives share ${esc(name)}'s category and task, come from other publishers and each have a full directory page. Ranked by Suede Skill Check score.</p>
${compareTable(here, a.peers, { id: "alternatives", subject: s })}
      </section>
${faq.html}
      <section class="panel" aria-labelledby="next-title">
        <h2 id="next-title">Keep comparing</h2>
        <div class="links">
          <a class="link-row" href="${rel(here, skillPath(s))}"><b>${esc(displayName(s))}</b><span>Install steps, score breakdown and README badge</span></a>
          <a class="link-row" href="${rel(here, taskPath(a.task))}"><b>Best Claude Code skills for ${esc(a.task.job.topic)}</b><span>${plural(a.task.rows.length, "skill")} ranked by the Suede Skill Check</span></a>
${more.map((o) => `          <a class="link-row" href="${rel(here, altPath(o.s))}"><b>${esc(altName(o.s))} alternatives</b><span>${plural(o.peers.length, "similar skill")}</span></a>`).join("\n")}
        </div>
      </section>`;
  const title = altTitle(a);
  const best = a.peers[0];
  const description = fitMeta([
    `Compare ${a.peers.length} alternatives to ${name} for Claude Code. ${displayName(best)} from ${best.repo} scores ${best.score}/100 on the Suede Skill Check.`,
    `Compare ${a.peers.length} alternatives to ${name} for Claude Code. ${displayName(best)} scores ${best.score}/100 on the Suede Skill Check.`,
    `${a.peers.length} alternatives to ${name} for Claude Code, led by ${displayName(best)} at ${best.score}/100.`,
  ], `alternatives ${s.id}`);
  const keywords = setKeywords(here, [`${name} alternatives`, `${s.name} skill alternatives${altNameCount.get(s.name.toLowerCase()) > 1 ? ` ${s.owner}` : ""}`, `skills like ${name}`, `${a.task.job.noun} skills for claude code`]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Alternatives &middot; ${esc(cat.label)} &middot; ${esc(s.owner)}</div>
      <h1>What are the best alternatives to ${esc(name)}?</h1>`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${url(here)}#page`,
        name: title,
        headline: `What are the best alternatives to ${name}?`,
        description,
        url: url(here),
        dateModified: PAGE_DATE,
        inLanguage: "en",
        isPartOf: DIRECTORY_SITE,
        publisher: PUBLISHER_REF,
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        about: { "@type": "SoftwareSourceCode", name: displayName(s), codeRepository: s.folder_url, url: url(skillPath(s)) },
        mainEntity: {
          "@type": "ItemList",
          "@id": `${url(here)}#list`,
          name: `Alternatives to ${name}`,
          numberOfItems: a.peers.length,
          itemListElement: a.peers.map((o, i) => ({ "@type": "ListItem", position: i + 1, name: displayName(o), url: url(skillPath(o)) })),
        },
      },
      bc.ld,
      faq.ld,
    ],
    footerNote: `Alternatives to ${esc(name)} from ${SITE_LABEL}. Every skill belongs to its publisher and links to its source.`,
  }));
}

// Task pages listed on a category page: those whose table lists a skill in it.
function tasksPanel(here, list, heading) {
  if (!list.length) return "";
  return `      <section class="panel" aria-labelledby="task-links-title">
        <h2 id="task-links-title">${esc(heading)}</h2>
        <div class="links">
${list.map((t) => `          <a class="link-row" href="${rel(here, taskPath(t))}"><b>Best Claude Code skills for ${esc(t.job.topic)}</b><span>Top pick: ${esc(displayName(t.rows[0]))} (${t.rows[0].score}/100) &middot; ${plural(t.rows.length, "skill")} compared</span></a>`).join("\n")}
        </div>
        <p><a href="${rel(here, TASKS_PATH)}">All Claude Code skills by task</a></p>
      </section>`;
}

// ------------------------------------------------------------------ hub

const POLICY_RULES = [
  "automate posting, messaging or account activity on a social platform (skills that draft posts or replies for a person to approve are listed);",
  "work around a site's blocks, CAPTCHAs or official API;",
  "have scraping a third-party site as their main job;",
  "collect people's personal data by scraping a social network or map listings (skills that use licensed B2B data providers within their terms are listed).",
]

// Answer-first questions for the hub. The "best" answer is computed from the
// live dataset so the figures in it never drift from the pages.
function bestSkillsAnswer() {
  const top = [...featured].sort((a, b) => b.score - a.score || b.lists.length - a.lists.length || a.id.localeCompare(b.id));
  const picks = [];
  for (const s of top) {
    if (picks.some((o) => o.repo_slug === s.repo_slug)) continue;
    picks.push(s);
    if (picks.length === 3) break;
  }
  return `The directory ranks ${fmt(data.skills.length)} public Claude Code skills by the Suede Skill Check, a 0 to 99 score for structure, description quality, instruction depth, bundled files, maintenance and curated-list citations. ${fmt(dist.grades.A)} skills earn grade A (90 to 99). In the ${longDate(data.generated)} snapshot the highest-scoring skills with full pages include ${listPhrase(picks.map((s) => `${displayName(s)} from ${s.repo} (${s.score}/100)`))}. The best skill for a task depends on the job, so each category directory lists its own top scores.`;
}

const FAQ = [
  ["What are the best Claude Code skills?", bestSkillsAnswer()],
  [
    "What is an agent skill?",
    "An agent skill is a folder with a SKILL.md file: a name, a one-line description of when to use it, and instructions the agent loads on demand. Claude Code, Codex, Cursor and other agents that support the Agent Skills format can install the same folder.",
  ],
  [
    "How do I install a skill from this directory?",
    "Each skill page lists three routes: the skills CLI (npx skills add with the skill folder's GitHub URL), a project-level copy into .claude/skills for Claude Code, and a project-level copy into .agents/skills for Codex. Each route installs the folder from the author's GitHub repository. Skills published under license terms that restrict copying show those terms instead.",
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
  const catCards = categories.map((c) => `<a href="${rel(here, catPath(c.slug))}" data-category="${esc(c.slug)}">${pixelIcon(c.slug, { size: 14 })}<span>${esc(c.title)}</span><span class="count-chip">${fmt(skillsByCat.get(c.slug).length)}</span></a>`).join("\n");
  // Reading cards use only verified, already-published writing by Jason.
  const articleFile = path.join(repoRoot, "directory/editorial/workflow-articles.json");
  const articleSource = fs.existsSync(articleFile) ? JSON.parse(fs.readFileSync(articleFile, "utf8")) : { articles: [] };
  const articles = articleSource.articles.map((article) => {
    if (article.author !== "Jason Colapietro" || !article.authorship_source || !/^https:\/\/suedeai\.directory\/(stacks|guides)\/[a-z0-9-]+\/$/.test(article.href) || !Array.isArray(article.intents) || !article.intents.length || !article.title || !article.summary) throw new Error(`Invalid workflow article: ${article.id}`);
    const { id, intents, title, summary, href, author } = article;
    return { id, intents, title, summary, href, author };
  });
  files.set("directory/workflow-articles.json", JSON.stringify({ articles }, null, 2) + "\n");
  files.set("directory/skill-matrix.svg", skillMatrix(data.skills, { cols: 96, title: `${fmt(data.skills.length)} listed skills, one dot each, colored by Suede Skill Check grade` }));
  const discovery = [...data.skills].sort((a, b) => b.lists.length - a.lists.length || Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
  files.set("directory/search-index.json", JSON.stringify(discovery.map((s) => ({
    name: displayName(s), ...(s.display_name ? { slug: s.name } : {}), repo: s.repo, description: s.summary || trimTo(s.description, 180),
    category: s.category, label: catBySlug.get(s.category).label, license: s.license,
    grade: s.grade, score: s.score, href: listingTarget(s).replace(BASE, ""), full: s.featured || s.full_page,
    install: licenseKind(s) === "restricted" ? null : `npx skills add ${shq(skillTreeUrl(s))}`,
    install_reviewed: Boolean(s.install),
    report: `/${skillPath(s)}report.json`, snapshot: snapshot.date, method: SCORE_METHOD,
    id: s.id, lane: s.lane, flags: s.flags, topics: (TOPICS_BY_SKILL.get(s.id) || []).map((t) => t.topic.id), listed: s.listed_since, updated: s.commit_date,
    installs: installsFor(s)?.installs ?? null,
  }))) + "\n");
  const starters = categories.slice(0, 8).map((c) => discovery.find((s) => s.featured && s.category === c.slug)).filter(Boolean);
  const starterRows = starters.map((s) => `<article class="discovery-row"><div><p class="result-meta">${esc(catBySlug.get(s.category).label)} <span> / ${esc(s.repo)}</span></p><h3><a href="${rel(here, skillPath(s))}">${esc(displayName(s))}</a></h3><p>${esc(s.summary || trimTo(s.description, 180))}</p><p class="result-foot">${esc(s.license)} · Full skill page</p></div><div class="result-quality">${s.shielded ? `<img class="result-shield" src="badges/score-${s.score}.svg" alt="Suede S shield" width="80" height="88" loading="lazy">` : ""}<span class="grade grade-${s.grade.toLowerCase()}">${s.score}/100 · ${s.grade}</span></div></article>`).join("\n");
  const official = linkedRepos.filter((r) => r.official).sort((a, b) => b.skills.length - a.skills.length || a.slug.localeCompare(b.slug));
  const repoRow = (r) =>
    `          <a class="link-row" href="${rel(here, r.target)}"><b>${esc(r.repo)}</b><span>${plural(r.skills.length, "skill")} &middot; ${esc(catBySlug.get(r.primary).label)}${r.lists.length ? ` &middot; in ${plural(r.lists.length, "list")}` : ""}</span></a>`;
  const allRepos = [...linkedRepos].sort((a, b) => a.repo.toLowerCase().localeCompare(b.repo.toLowerCase()));

  // The leaderboard: one pane per ranking, the first ten rows of each, with
  // tabs that directory.js turns into a switcher. Without JavaScript every
  // pane shows in order.
  const panes = [
    TOP_INSTALLED.length ? { id: "most-installed", label: "Most installed", rows: TOP_INSTALLED, metric: installMetric, note: `Installs recorded by skills.sh for the skills CLI, read ${longDate(INSTALLS.fetched)}.`, foot: `<a href="${rel(here, TOP_PATH)}#most-installed">The 100 most installed skills</a>` } : null,
    { id: "highest-scores", label: "Highest scores", rows: TOP_SKILLS, metric: (s) => (installsFor(s) ? `<b>${compact(installsFor(s).installs)}</b> installs` : `cited by <b>${s.lists.length}</b>`), note: "Suede Skill Check scores, 0 to 99, from each skill's published files.", foot: `<a href="${rel(here, TOP_PATH)}#highest-scores">The top 100 by score</a>` },
    RISING.length ? { id: "rising", label: "Rising this week", rows: RISING, metric: (s) => `${sparkline(installsFor(s).weekly)}<b>${compact(lastWeek(s))}</b> this week`, note: "Installs in the latest week skills.sh reports, among the skills it keeps history for.", foot: `<a href="${rel(here, TOP_PATH)}#rising">The 100 rising skills</a>` } : null,
    NEW_LISTINGS.length ? { id: "new-listings", label: "New", rows: NEW_LISTINGS, metric: (s) => `Listed ${longDate(s.listed_since)}`, note: `Skills first listed in the ${NEW_DAYS} days before the ${longDate(data.generated)} snapshot.`, foot: `<a href="${rel(here, NEW_PATH)}">All new and updated skills</a>` } : null,
    RECENTLY_UPDATED.length ? { id: "recently-updated", label: "Updated", rows: RECENTLY_UPDATED, metric: (s) => `Commit ${longDate(s.commit_date)}`, note: `Listed skills whose repository changed in the ${NEW_DAYS} days before the snapshot.`, foot: `<a href="${rel(here, NEW_PATH)}#updated-title">All recently updated skills</a>` } : null,
  ].filter(Boolean);
  const boardHtml = `      <section class="board-section" aria-labelledby="board-title">
        <div class="board-head"><h2 id="board-title">Top 100</h2><p class="muted">${INSTALLS ? "Ranked by installs recorded by skills.sh, by Suede Skill Check score, and by what is new. Suede AI's own skills are not ranked." : "Ranked by Suede Skill Check score and by what is new. Suede AI's own skills are not ranked."}</p></div>
        <nav class="tabs" data-tabs aria-label="Rankings">${panes.map((p, i) => `<a class="tab" href="#${p.id}"${i === 0 ? ' aria-current="true"' : ""}>${esc(p.label)}</a>`).join("")}</nav>
${panes.map((p) => `        <section class="board-pane" id="${p.id}" data-pane aria-labelledby="${p.id}-title">
          <h3 id="${p.id}-title">${esc(p.label)}</h3>
${board(here, p.rows, p.metric, 10)}
          <p class="board-foot"><span>${p.note}</span>${p.foot}</p>
        </section>`).join("\n")}
      </section>`;

  const featuredNewest = newestPublishedFirst(EDITORIAL.projects.filter((p) => !isPending(p))).slice(0, 3);
  const featuredHtml = `      <section class="panel" aria-labelledby="featured-strip-title">
        <div class="board-head"><h2 id="featured-strip-title">Featured projects</h2><a class="featured-callout" href="featured/">All ${fmt(EDITORIAL.projects.length + MEMBERS.length)} featured projects and members</a></div>
        <p class="muted">The editorial selection, newest first: reviewed source, reviewed scope and the setup each one needs.</p>
        <div class="dir-cards">
${featuredNewest.map((p) => `          <a class="dir-card" href="featured/#${p.id}"><span class="dir-card-head"><b>${esc(p.name)}</b></span><span class="dir-card-repo">${esc(p.kind)}</span><span class="dir-card-text">${esc(trimTo(p.headline, 140))}</span></a>`).join("\n")}
        </div>
      </section>`;

  const stacksHtml = STACKS.length ? `      <section class="panel" aria-labelledby="stacks-strip-title">
        <div class="board-head"><h2 id="stacks-strip-title">Recommended stacks by task</h2><a href="${rel(here, STACKS_PATH)}">All ${plural(STACKS.length, "stack")}</a></div>
        <p class="muted">Jason Colapietro's picks: the third-party skills to combine for one job, with the install commands, and the Suede AI skill that covers the task named up front.</p>
        <div class="stack-grid">
${STACKS.slice(0, 6).map((st) => `          <a class="stack-card" href="${rel(here, stackPath(st))}">${pixelIcon("stacks", { size: 24 })}<b>${esc(st.h1)}</b><span>${esc(st.summary)}</span><span class="suede-pick">Suede pick: <code>${esc(st.suede.skill)}</code></span></a>`).join("\n")}
        </div>
      </section>` : "";

  const kindCards = [
    ...(HAS_AGENTS ? [[`directory/agents/`, "AI agents", `${agentCounts.products} products and ${agentCounts.editions} runnable editions with separate documentation, repository and hosted disclosure ratings, plus ${agentCounts.ungraded} ungraded agents with official sources.`, `${fmt(agentCounts.products + agentCounts.ungraded)} agents`, "ai-agents-llm"]] : []),
    ...KINDS.map((k) => [kindPath(k), k.name, trimTo(k.lead, 170), `${fmt(kindEntries(k).length)} listed`, k.id]),
  ];
  const kindsHtml = kindCards.length ? `      <section class="panel" aria-labelledby="kinds-title">
        <h2 id="kinds-title">Beyond skills</h2>
        <p class="muted">The other things an agent setup is made of. Listed from their publishers' repositories; only skills carry a Suede Skill Check score.</p>
        <div class="kind-grid">
${kindCards.map(([p, name, text, count, icon]) => `          <a class="kind-card" href="${rel(here, p)}">${pixelIcon(icon, { size: 28 })}<b>${esc(name)}</b><span>${esc(text)}</span><span class="count-chip">${esc(count)}</span></a>`).join("\n")}
        </div>
      </section>` : "";

  const flagCount = (id) => FLAGS_LIVE.find((f) => f.flag.id === id)?.rows.length || 0;
  const securityHtml = `      <section class="panel" aria-labelledby="security-strip-title">
        <div class="board-head"><h2 id="security-strip-title">Security: what the directory checks</h2><a href="${rel(here, SECURITY_PATH)}">How to review a skill before you install it</a></div>
        <p>Every full page lists what the skill's files touch before you install: bundled scripts, commands, credentials, outside hosts and MCP servers. The directory does not security scan any listed skill, and every listing says so.</p>
        <div class="stat-grid">
          <div class="stat"><b>${fmt(featured.length)}</b><span>skills whose files the directory reads in full</span></div>
          <div class="stat"><b>${fmt(flagCount("no-setup"))}</b><span>of them read no credential, call no outside host and run no command</span></div>
          <div class="stat"><b>${fmt(flagCount("api-key"))}</b><span>read an API key or other credential</span></div>
          <div class="stat"><b>${fmt(flagCount("runs-commands"))}</b><span>run package managers, CLIs or other commands</span></div>
        </div>
      </section>`;

  const workflowHtml = `      <section class="workflow-builder" id="workflow-builder" aria-labelledby="workflow-title" data-workflow-builder>
        <div class="workflow-intro"><div><p class="eyebrow">From idea to first step</p><h2 id="workflow-title">Your next idea. A way to build it.</h2><p>Describe the result. Get a step-by-step workflow with complementary skills and a few tips to get moving.</p></div><span class="workflow-mark" aria-hidden="true">01 → 02 → 03</span></div>
        <form data-workflow-form hidden novalidate>
          <label for="workflow-brief">What do you want to build?</label>
          <div class="workflow-composer"><textarea id="workflow-brief" rows="3" maxlength="600" placeholder="A landing page for my SaaS, with clear copy and a polished design…" aria-describedby="workflow-help workflow-status"></textarea><div class="workflow-submit-row"><span id="workflow-help">Task-based matches from the directory. Your brief stays in this browser.</span><button type="submit" class="button workflow-submit">Build my workflow <span aria-hidden="true">↗</span></button></div></div>
          <div class="workflow-examples"><span>Start with an idea</span><div data-workflow-examples></div></div>
        </form>
        <p id="workflow-status" class="workflow-status" role="status" aria-live="polite" data-workflow-status></p>
        <section class="workflow-results" aria-labelledby="workflow-result-title" data-workflow-results hidden>
          <div class="workflow-result-head"><div><p class="eyebrow">Suggested workflow</p><h3 id="workflow-result-title" tabindex="-1" data-workflow-heading></h3><p class="muted" data-workflow-summary></p></div><button type="button" class="button" data-workflow-copy>Copy workflow</button></div>
          <ol class="workflow-steps" data-workflow-steps></ol>
          <aside class="workflow-tips"><h4>A few tips before you start</h4><ul data-workflow-tips></ul></aside>
          <aside class="workflow-reading" data-workflow-reading hidden></aside>
          <div class="workflow-result-footer"><p>Review each skill’s setup and license before installing. Quality scores describe published files, not security or a guarantee of fit.</p><button type="button" data-workflow-refine>Refine this workflow <span aria-hidden="true">↑</span></button></div>
          <details class="workflow-export" data-workflow-copy-fallback><summary>View the complete workflow</summary><label for="workflow-export">Workflow text, ready for your agent</label><textarea id="workflow-export" rows="12" readonly data-workflow-export></textarea></details>
        </section>
        <noscript><p><a href="stacks/">Explore recommended stacks</a> for step-by-step skill combinations. Turn on JavaScript to match a brief here.</p></noscript>
      </section>`;
  const body = `${workflowHtml}
${boardHtml}
${bestOfSection(here)}
      <section class="directory-browser" id="browse" aria-labelledby="browse-title" data-directory-browser>
        <div class="browse-heading"><h2 id="browse-title">Find your next skill</h2><a class="shortlist-jump" href="#task-shortlist" hidden>Your shortlist <span aria-hidden="true">↓</span></a></div>
        <form class="discovery-controls" role="search" hidden>
          <label for="directory-query">Search skills</label>
          <div class="search-line"><span aria-hidden="true" class="search-icon">⌕</span><input id="directory-query" name="q" type="search" placeholder="Try SEO audits, React, or code review" autocomplete="off" aria-describedby="search-help" aria-keyshortcuts="Control+k Meta+k"><button type="button" data-clear>Clear</button><kbd aria-hidden="true">Ctrl K</kbd></div>
          <p id="search-help" class="muted">Search by task, skill name or publisher.</p>
          <div class="discovery-filters"><label>Category<select name="category"><option value="">All categories</option>${categories.map((c) => `<option value="${esc(c.slug)}">${esc(c.title)}</option>`).join("")}</select></label><label>Quality grade<select name="grade"><option value="">All grades</option>${GRADE_BANDS.map(([g, band]) => `<option value="${g}">${g} · ${band}</option>`).join("")}</select></label><label>Cost<select name="lane"><option value="">Any cost or license</option>${LANES_LIVE.map((l) => `<option value="${l.lane.id}">${esc(l.lane.label)}</option>`).join("")}</select></label><label>Capability<select name="flag"><option value="">Any capability</option>${FLAGS_LIVE.map((f) => `<option value="${f.flag.id}">${esc(f.flag.label)}</option>`).join("")}</select></label><label>Sort by<select name="sort"><option value="curated">Most-cited collections</option>${INSTALLS ? `<option value="installs">Most installed</option>` : ""}<option value="name">Name A–Z</option><option value="score">Quality score</option><option value="listed">Newest listings</option><option value="updated">Recently updated</option></select></label></div>
        </form>
        <div class="discovery-layout">
          <aside class="category-rail"><details open><summary id="categories">Browse ${categories.length} categories</summary><nav aria-label="Skill categories"><a href="./" data-category="" aria-current="true"><span>All skills</span><span class="count-chip">${fmt(data.skills.length)}</span></a>${catCards}</nav></details></aside>
          <div class="discovery-content"><div class="result-heading"><h3 data-result-title>Start exploring</h3><span class="muted" role="status" aria-live="polite" data-results-status>${starters.length} skills to explore</span></div><div data-search-error hidden><p>Search could not load. Try again, or browse a category.</p><button type="button" data-retry>Try again</button></div><div class="search-loading" hidden aria-hidden="true"><span></span><span></span><span></span></div><div data-search-results>${starterRows}</div><div class="search-empty" hidden><h3>No skills match these filters</h3><p>Try fewer words or a broader category.</p><button type="button" data-reset>Clear all filters</button></div><button type="button" class="load-more" data-load-more hidden>Show more skills</button><noscript><p>Choose a category to browse every listed skill. Search is available with JavaScript enabled.</p></noscript></div>
        </div>
        <section class="task-shortlist" id="task-shortlist" aria-labelledby="shortlist-title" data-shortlist hidden>
          <div class="browse-heading"><h3 id="shortlist-title">Your task shortlist</h3><span class="muted" data-shortlist-count>0 of 5 skills</span></div>
          <label for="shortlist-task">What are you working on?</label>
          <input id="shortlist-task" type="text" maxlength="120" placeholder="For example: review a React checkout" data-shortlist-task>
          <p class="muted">Choose up to five skills from the results. Your shortlist stays in this page’s URL, ready to bookmark or share.</p>
          <ul data-shortlist-items></ul>
          <p role="status" aria-live="polite" data-shortlist-status></p>
          <details data-shortlist-export hidden><summary>Copy your shortlist as Markdown</summary><div class="snippet"><div class="snippet-head"><span>Task, scores and report links</span><button type="button" data-copy-target="shortlist-markdown">Copy shortlist</button></div><pre><code id="shortlist-markdown"></code></pre></div></details>
        </section>
      </section>
${featuredHtml}
${stacksHtml}
${kindsHtml}
${securityHtml}
${browseWaysPanel(here)}
      <aside class="directory-scoring" aria-label="Suede AI quality grades"><p><b>Structure. Description. Depth. Maintenance.</b> Every skill has a published quality score from 0–99.</p><a href="methodology/">What the scores measure →</a></aside>
${campaignPanel(here, campaignVariant("home-hero-secondary", here), { quiet: true })}
${tasksPanel(here, TASKS, "Best Claude Code skills by task")}
${guideLinksPanel(here, GUIDES, "Guides")}${GUIDES.length ? `\n      <p><a href="${rel(here, GUIDES_PATH)}">All agent skills guides</a></p>` : ""}
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
${servicesCta("hub", null, here)}
      <a class="florida-recognition" href="https://themanifest.com/artificial-intelligence/consulting/deployment/companies/florida">
        <strong>#1 in Palm Beach County</strong>
        <span class="florida-category">#25 in Florida · AI deployment</span>
        <span class="florida-detail">Suede AI SEO · The Manifest · October 30, 2026</span>
        <span class="florida-detail">County position derived from listed locations in The Manifest’s Florida AI Deployment directory.</span>
        <span class="florida-source">View ranking <span aria-hidden="true">↗</span></span>
      </a>
${badgeBlock(here, {
  badgePath: "directory/badge.svg",
  value: "listed",
  target: DIR_URL,
  heading: "For skill authors: show your listing",
  lede: `Every skill scoring 80–99 has two README shields: its numeric quality score and its A/B grade. Both link to its Suede AI listing. Find <b>Get badges</b> on a repository page or <b>README badge</b> on a full skill page. <a href="${rel(here, "directory/submit/")}">Request a listing</a> if your skill is not here yet, or <a href="${rel(here, CHECK_PATH)}">run the free Skill AI-visibility check</a> to see the points your skill can still earn.`,
})}
${promotionOffer(here)}
${promotionSection(here, promoted)}
      <section class="panel" aria-labelledby="all-repos-title">
        <div class="board-head"><h2 id="all-repos-title">All listed repositories</h2><a href="${rel(here, PUBLISHERS_PATH)}">Publishers, with skill counts and best scores</a></div>
        <p class="repo-index">${allRepos.map((r) => `<a href="${rel(here, r.target)}">${esc(r.repo)}</a>`).join(" &middot; ")}</p>
      </section>
      <section class="panel" aria-labelledby="pack-title">
        <h2 id="pack-title">Suede AI's own skills</h2>
        <p>The <a href="${rel(here, "skills/")}">Suede AI Skills</a> pack offers a page per skill and a one-command install for the whole pack. Its accepted directory entries use the same published scoring method.</p>
      </section>
      <section class="panel faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Questions</h2>
${FAQ.map(([q, a]) => `        <h3>${esc(q)}</h3>\n        <p>${esc(a)}${q === "How do I install a skill from this directory?" && guideLinksTo.hubFaqInstall ? ` Step by step: ${guideAnchor(here, guideLinksTo.hubFaqInstall)}.` : ""}</p>`).join("\n")}
      </section>`;
  // Led by the phrases people search for ("Claude Code skills directory",
  // "best Claude skills"); the counts come from the live dataset.
  const title = "Claude Code Skills Directory: Best Agent Skills, Graded";
  const description = trimTo(`Find the best Claude Code skills: ${fmt(data.skills.length)} agent skills for Claude, Codex and Cursor from ${fmt(repos.size)} GitHub repositories, graded and linked to source.`, 158);
  const keywords = setKeywords(here, ["claude code skills directory", "agent skills directory", "claude skills directory", "best claude skills", "SKILL.md directory", "ai agent skills list", "most installed agent skills", "Suede AI Skills Directory"]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <header class="directory-hero">
        <div>
          <p class="eyebrow">SuedeAI.directory, by Suede AI</p>
          <h1>Agent skills, graded and ready to install</h1>
          <p class="lead">${fmt(data.skills.length)} skills for Claude Code, Codex, Cursor and other agents, scored 0 to 99 from their published files and linked to source, with the install command for each.</p>
          <p class="directory-snapshot"><span><b>${fmt(repos.size)}</b> repositories</span><span><b>${categories.length}</b> categories</span><span><b>${openPct}%</b> openly licensed</span><span>Snapshot <b>${longDate(data.generated)}</b></span></p>
        </div>
        <figure class="hero-figure">
          <img class="matrix" src="skill-matrix.svg" width="960" height="${Math.ceil(data.skills.length / 96) * 10}" alt="${fmt(data.skills.length)} listed skills as a grid of dots, one per skill, sorted by score and colored by grade" loading="eager" decoding="async">
          ${matrixCaption(`Every dot is a listed skill, sorted by score.`)}
        </figure>
      </header>`,
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
        isPartOf: { "@type": "WebSite", "@id": `${BASE}/#website`, name: "Suede AI Skills", url: `${BASE}/`, publisher: { "@id": ORG_ID } },
        publisher: ORGANIZATION,
        breadcrumb: { "@id": `${DIR_URL}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: categories.length,
          itemListElement: categories.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, url: url(catPath(c.slug)) })),
        },
      },
      bc.ld,
      ...RELATED_ENTITIES,
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${DIR_URL}#faq`,
        mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
    footerNote: "The Suede AI Skills Directory is a curated index of public Agent Skills. Every listing links to the author's repository; Suede AI hosts no third-party code.",
  }));
}

// ------------------------------------------------------------------ methodology and submit

function renderFeaturedProjects() {
  const here = "directory/featured/";
  const copy = EDITORIAL.page || {};
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Featured projects"]]);
  const title = copy.title || "Featured Agent Skill Projects | Suede AI";
  const projects = newestPublishedFirst(PROJECTS);
  const members = newestPublishedFirst(MEMBERS);
  const entries = [...projects, ...members];
  // Name every entry while the description fits a result snippet; past that,
  // name the newest and count the rest.
  const describe = (names) => `Meet ${names}: featured agent projects with source and setup.`;
  let description = describe(listPhrase(entries.map((p) => p.name)));
  for (let k = entries.length - 1; k > 0 && description.length > 155; k--) description = describe(`${entries.slice(0, k).map((p) => p.name).join(", ")} and ${entries.length - k} more`);
  const catalogSkill = (project, item) => data.skills.find((s) => s.repo === project.repo && s.slug === item.id);
  const keywords = setKeywords(here, ["featured agent projects", ...entries.map((p) => `${p.name} agent workflows`), "Suede AI Skills Directory"]);
  const badge = FEATURED_BADGE;
  const nominate = copy.nominate
    ? `      <section class="panel featured-nominate" aria-labelledby="nominate-title">
        <h2 id="nominate-title">${esc(copy.nominate.headline)}</h2>
        <p>${esc(copy.nominate.body)}</p>
        <ol class="steps">
${copy.nominate.steps.map((step) => `          <li>${esc(step)}</li>`).join("\n")}
        </ol>
        <p>${ctaLink(here, copy.nominate.url, copy.nominate.button)}</p>
      </section>`
    : "";
  const badgePanel = badge
    ? `      <section class="panel badge-panel" id="featured-badge" aria-labelledby="featured-badge-title">
        <h2 id="featured-badge-title">Badge for featured projects</h2>
        <p>Featured publishers can link their README to their section on this page.</p>
        <p class="badge-preview"><img src="${rel(here, "directory/badges/featured.svg")}" alt="${esc(badge.alt)}" width="${badgeSvg("featured").width}" height="20"></p>
${projects.map((p) => isPending(p)
    ? `        <p class="featured-badge-pending" data-featured-badge-pending="${p.id}"><strong>${esc(p.name)}</strong> ${pendingStatusHtml(esc)}</p>`
    : codeBlock({ label: `${esc(p.name)}, Markdown`, key: `featured-badge-${p.id}` }, badge.markdown_pattern.split("{id}").join(p.id))).join("\n")}
      </section>`
    : "";
  files.set(`${here}index.html`, page({
    here, title, description, keywords,
    h1Html: `<div class="eyebrow">Suede AI Skills Directory · Editorial selection</div><h1>Featured projects</h1>`,
    body: `${bc.html}
      <div class="featured-intro"><p class="lead">${esc(copy.lede || "Good tools deserve a closer look.")}</p>${copy.intro ? `<p>${esc(copy.intro)}</p>` : ""}</div>
      <nav class="featured-jump" aria-label="Featured project navigation"><a href="../">← Browse all skills</a>${entries.map((p) => `<a href="#${p.id}">${esc(p.name)} <span aria-hidden="true">↓</span></a>`).join("")}</nav>
      ${featuredProjectsHtml(projects, { esc, rel, here, slugify, skillHref: (project, item) => { const s = catalogSkill(project, item); return s ? listingHref(here, s) : null; } })}
${members.length ? `      <section id="directory-members" aria-label="Directory members"><h2>Directory members</h2><p>Publisher membership with a defined skill scope. Linked reviews retain quality scores and scan findings.</p>${directoryMembersHtml(members, { esc, start: projects.length })}</section>` : ""}
${copy.services_cta ? campaignPanel(here, campaignVariant(copy.services_cta, here)) : ""}
${nominate}
${badgePanel}
      <section class="panel featured-about" aria-labelledby="selection-title"><div><p class="featured-kind">How this page works</p><h2 id="selection-title">Selected for a closer look.</h2></div><div><p>${esc(copy.selection || "These editorial features introduce accepted project submissions and their reviewed scope. Individual skill pages carry the directory’s quality scores.")} README-badge verification is tracked separately.</p><p><a href="../methodology/">How directory checks work →</a></p><a class="featured-submit" href="../submit/">Submit your project →</a></div></section>
${guideLinksPanel(here, pageGuides(here), "Guides")}`,
    jsonld: [{
      "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url(here)}#featured`,
      name: "Featured projects", headline: title, description, url: url(here), dateModified: PAGE_DATE,
      inLanguage: "en", breadcrumb: { "@id": `${url(here)}#breadcrumb` },
      isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF,
      mainEntity: { "@type": "ItemList", numberOfItems: entries.length,
        itemListElement: entries.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${url(here)}#${p.id}` })) },
    }, bc.ld],
    footerNote: "Editorial project selections from the Suede AI Skills Directory. Source and installation details belong to each publisher.",
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
      <p class="byline muted">Method written and maintained by <a href="https://suedeai.ai/founder" rel="author">Jason Colapietro</a>, Founder and CEO of <a href="https://suedeai.ai">Suede AI</a>. Figures on this page come from the <time datetime="${data.generated}">${longDate(data.generated)}</time> snapshot.</p>
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
        <p>External directory skills are marked <b>not scanned</b>. The HOL/Cisco CI scanners run on Suede AI’s own repository; their results do not certify the external repositories listed here. The shields’ “Suede Certified” label refers to the published structural quality check. A security result needs its own per-skill scan evidence.</p>
      </section>
      <section class="panel" aria-labelledby="authors-title">
        <h2 id="authors-title">Two README badges and a limited-time feature offer</h2>
        <p>Skills scoring 80–${SCORE_CAP} receive separate numeric and A/B shields, each linking to their actual Suede AI listing. Scores from 90–${SCORE_CAP} and grade A use gold; scores from 80–89 and grade B use cool metallic styling. The Suede S remains the main mark on both shields. Every listed skill, at any score, keeps its listing badge, and its existing <code>badge.svg</code> and <code>score.svg</code> links keep working.</p>
        <p>Display either the numeric or letter badge in your repository or skill README, linked to your Suede AI listing, then request verification. Displaying both also qualifies. Suede AI checks the rendered README at a recorded commit before a feature placement is activated. An unverified request, no valid linked badge or failed fetch cannot activate promotion. Verification is checked again after a dataset refresh. Existing editorial full pages keep their separate rules.</p>
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
          <li>Suede AI's own skills are catalogued separately on this site and pass the same rules; a test in the repository checks every one of them against the policy.</li>
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
      </section>
${guideLinksPanel(here, pageGuides(here), "Guides for publishers and installers")}
${servicesCta("methodology", null, here)}`;
  const title = "How Agent Skills Are Scored and Listed | Suede AI";
  const description = "How the Suede AI Skills Directory grades agent skills: source lists, the Suede Skill Check, the 0–99 quality score, letter grades and listing rules.";
  const keywords = setKeywords(here, ["agent skill quality check", "SKILL.md best practices", "agent skills specification", "skill grading", "Suede Skill Check"]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; Method</div>
      <h1>How skills are listed and graded</h1>`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url(here)}#page`,
        name: title,
        headline: "How skills are listed and graded",
        description,
        url: url(here),
        dateModified: PAGE_DATE,
        inLanguage: "en",
        isPartOf: DIRECTORY_REF,
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        author: PERSON,
        editor: { "@id": PERSON_ID },
        publisher: ORGANIZATION,
        about: { "@type": "Thing", name: "Agent Skills", url: "https://agentskills.io/specification" },
      },
      bc.ld,
      ...RELATED_ENTITIES,
    ],
    footerNote: "The Suede Skill Check reads published SKILL.md files and the files beside them. It executes nothing.",
  }));
}

// The submit page's closing call to action, plus any guide link_from asks for
// that the call to action does not already link.
function submitSuccessPanel(here) {
  const picked = campaignVariant("submit-success", here);
  const linked = picked ? new URL(picked.variant.url).pathname.replace(/^\//, "") : null;
  return `${campaignPanel(here, picked)}
${guideLinksPanel(here, pageGuides(here).filter((g) => g.path !== linked), "Guides for publishers")}`;
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
          <li><b>Add either badge.</b> Listed skills scoring 80–99 get two shields: a numeric score and an A/B grade, each linking to their Suede AI listing. Choose either badge or both from the listing${GROWTH ? ` (<a href="${rel(here, "directory/badges/")}">how badges work</a>)` : ""} and request README verification for the limited-time feature offer.</li>
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
        <p>Choose <b>Request a fresh review</b> on the skill’s report or repository listing. The form carries the exact skill name and previous snapshot. Add the changed commit or pull request and the points you improved. Suede AI reviews requests by hand and rechecks accepted changes at a directory refresh.</p>
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
      </section>
      <section class="panel" aria-labelledby="check-link-title">
        <h2 id="check-link-title">Already listed?</h2>
        <p>The free <a href="${rel(here, CHECK_PATH)}">Skill AI-visibility check</a> finds your listing, shows its score by component and names the points still open. It runs in your browser.</p>
      </section>
${submitSuccessPanel(here)}`;
  const title = "List Your Agent Skill | Suede AI Skills Directory";
  const description = "Request a free listing for your agent skill. Pass the Suede Skill Check to get a category placement and a README badge that links to your listing.";
  const keywords = setKeywords(here, ["submit agent skill", "list claude skill", "agent skill badge", "skill directory submission", "Suede AI Skills Directory badge"]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; For authors</div>
      <h1>List your agent skill</h1>`,
    body,
    jsonld: [
      { "@context": "https://schema.org", "@type": "WebPage", "@id": `${url(here)}#page`, name: title, description, url: url(here), dateModified: PAGE_DATE, isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF, breadcrumb: { "@id": `${url(here)}#breadcrumb` } },
      bc.ld,
    ],
    footerNote: "Listing in the Suede AI Skills Directory is free. The directory links to your repository and hosts none of your code.",
  }));
}

// ------------------------------------------------------------------ guides

// Byline and dateline come from directory/editorial/pages.json, never from
// the Markdown body, so every guide credits its author the same way.
function guideByline(g) {
  const a = EDITORIAL_PAGES.author;
  let text = esc(a.byline);
  if (!text.includes(esc(a.name))) throw new Error("pages.json: author.byline must name the author");
  text = text.replace(esc(a.name), `<a href="${esc(a.url)}" rel="author">${esc(a.name)}</a>`);
  for (const b of a.books || []) text = text.split(esc(b)).join(`<cite>${esc(b)}</cite>`);
  const snap = g.data_snapshot ? ` Scores and counts come from the directory snapshot of <time datetime="${g.data_snapshot}">${longDate(g.data_snapshot)}</time>.` : "";
  return `      <p class="byline muted">${text}</p>
      <p class="dateline muted">Reviewed <time datetime="${g.date_modified}">${longDate(g.date_modified)}</time>.${snap}</p>`;
}

// Links in a guide body: Suede AI's own pages become relative links and are
// checked against the generated site; everything else opens in a new tab.
function guideHref(here, target) {
  if (!/^https:\/\//.test(target)) throw new Error(`${here}: guide links must be absolute https URLs (${target})`);
  const u = new URL(target);
  if (u.origin !== BASE) return { href: target, external: true };
  const p = u.pathname.replace(/^\//, "");
  internalLinks.push([here, p, u.hash.slice(1)]);
  return { href: `${rel(here, p)}${u.search}${u.hash}`, external: false };
}

const GOAL_ROUTE = { agency: "search", agent_studio: "agents" };
// The closing call to action a guide's manifest entry names. A variant held
// back by confirm_offer falls back to the plain services offer.
function guideFooterCta(here, g) {
  const [campaign, id] = (g.cta?.footer || "").split(":");
  const picked = campaign ? campaignVariant(campaign, here, { id }) : null;
  if (picked) return campaignPanel(here, picked);
  const o = CTA.offers[GOAL_ROUTE[g.business_goal] || CTA.default_lead];
  const u = new URL(o.url);
  for (const [k, v] of Object.entries({ ...CTA.utm, utm_medium: "guide", utm_campaign: "guide-footer", utm_content: g.id })) u.searchParams.set(k, v);
  return campaignPanel(here, { campaign: { id: "guide-footer" }, variant: { id: "plain", headline: o.heading, body: o.body, button: o.cta, url: u.toString() } });
}

const ORGANIZATION_PUBLISHER = { "@type": "Organization", "@id": ORG_ID, name: "Suede AI", url: "https://suedeai.ai", logo: { "@type": "ImageObject", url: ORGANIZATION.logo } };

function renderGuide(g) {
  const here = g.path;
  if (EDITORIAL_PAGES.author.name !== "Jason Colapietro" || EDITORIAL_PAGES.author["@id"] !== PERSON_ID) throw new Error("pages.json: guides are bylined to Jason Colapietro");
  const { blocks } = parseGuide(g.markdown);
  const { html, tableLinks } = renderGuideBody(blocks, (t) => guideHref(here, t));
  const bc = crumbs(here, [["directory/", "Directory"], [GUIDES_PATH, "Guides"], [null, g.h1]]);
  const others = GUIDES.filter((o) => o.id !== g.id);
  const body = `${bc.html}
${guideByline(g)}
${html}
${guideFooterCta(here, g)}
${guideLinksPanel(here, others, "More guides")}
      <p><a href="${rel(here, GUIDES_PATH)}">All guides</a> · <a href="${rel(here, "directory/")}">Browse the directory</a> · <a href="${rel(here, "directory/methodology/")}">How skills are scored</a></p>`;
  const keywords = setKeywords(here, [g.primary_keyword, ...(g.secondary_keywords || [])]);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url(here)}#article`,
    headline: g.h1,
    name: g.title,
    description: g.meta_description,
    url: url(here),
    mainEntityOfPage: { "@type": "WebPage", "@id": url(here), breadcrumb: { "@id": `${url(here)}#breadcrumb` } },
    datePublished: g.date_published,
    dateModified: g.date_modified,
    inLanguage: "en",
    image: OG_IMAGE,
    keywords: [g.primary_keyword, ...(g.secondary_keywords || [])].join(", "),
    author: PERSON,
    publisher: ORGANIZATION_PUBLISHER,
    isPartOf: DIRECTORY_REF,
  };
  const jsonld = [article, bc.ld];
  if ((g.schema_types || []).includes("ItemList")) {
    if (!tableLinks.length) throw new Error(`${g.id}: ItemList needs a table of linked rows`);
    jsonld.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${url(here)}#picks`,
      name: g.h1,
      numberOfItems: tableLinks.length,
      itemListElement: tableLinks.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: t.target })),
    });
  }
  files.set(`${here}index.html`, page({
    here,
    title: g.title,
    description: g.meta_description,
    keywords,
    ogType: "article",
    h1Html: `      <div class="eyebrow">Guide &middot; Suede AI Skills Directory</div>
      <h1>${esc(g.h1)}</h1>`,
    body,
    jsonld,
    footerNote: `A guide from the Suede AI Skills Directory by ${esc(EDITORIAL_PAGES.author.name)}. Third-party skills named here belong to their publishers and link to their source.`,
  }));
}

function renderGuidesHub() {
  const here = GUIDES_PATH;
  const hub = EDITORIAL_PAGES.hub;
  if (hub.path !== here || hub.title.length > 60 || hub.meta_description.length > 160) throw new Error("pages.json: invalid guides hub");
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Guides"]]);
  const modified = GUIDES.map((g) => g.date_modified).sort().at(-1);
  const body = `${bc.html}
      <p class="lead">${esc(hub.intro)}</p>
      <section class="panel" aria-labelledby="all-guides-title">
        <h2 id="all-guides-title">${plural(GUIDES.length, "guide")}</h2>
        <div class="links">
${GUIDES.map((g) => `          <a class="link-row" href="${rel(here, g.path)}"><b>${esc(g.h1)}</b><span>${esc(g.meta_description)} Reviewed ${longDate(g.date_modified)}.</span></a>`).join("\n")}
        </div>
      </section>
      <section class="panel" aria-labelledby="tools-title">
        <h2 id="tools-title">Check your own skill</h2>
        <p>Publish a skill? The free <a href="${rel(here, CHECK_PATH)}">Skill AI-visibility check</a> shows its score, the points still open and what to fix on its README. Every score follows the published <a href="${rel(here, "directory/methodology/")}">methodology</a>.</p>
      </section>`;
  const keywords = setKeywords(here, ["agent skills guides", "agent skills how-to guides", "skill publisher guides"]);
  files.set(`${here}index.html`, page({
    here,
    title: hub.title,
    description: hub.meta_description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; Guides</div>
      <h1>${esc(hub.h1)}</h1>`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${url(here)}#page`,
        name: hub.title,
        description: hub.meta_description,
        url: url(here),
        dateModified: modified,
        inLanguage: "en",
        isPartOf: DIRECTORY_REF,
        publisher: PUBLISHER_REF,
        author: { "@id": PERSON_ID },
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: GUIDES.length,
          itemListElement: GUIDES.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g.h1, url: url(g.path) })),
        },
      },
      bc.ld,
    ],
    footerNote: "Guides from the Suede AI Skills Directory, built on its published data.",
  }));
}

// ------------------------------------------------------------------ check

// The Skill AI-visibility check (directory/STRATEGY.md section 5, version 1):
// static, no backend and no data collection. The browser reads the published
// search index and the listing's report.json; nothing typed leaves the page.
const CHECK_CLIENT = fs.readFileSync(path.join(repoRoot, "scripts", "directory", "check-client.js"), "utf8");
function renderCheck() {
  const here = CHECK_PATH;
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Skill AI-visibility check"]]);
  const plain = CTA.offers.search;
  const listedHref = (() => {
    const u = new URL(plain.url);
    for (const [k, v] of Object.entries({ ...CTA.utm, utm_medium: "tool", utm_campaign: "check-result", utm_content: "listed-services" })) u.searchParams.set(k, v);
    return u.toString();
  })();
  const listedCta = campaignPanel(here, { campaign: { id: "check-result" }, variant: { id: "listed-services", headline: plain.heading, body: plain.body, button: plain.cta, url: listedHref } });
  const missingCta = campaignPanel(here, campaignVariant("check-result", here, { id: "b-not-found" }));
  const guide = GUIDES.find((g) => g.id === "skill-ai-visibility");
  const body = `${bc.html}
      <p class="lead">See how your skill scores, what it is missing, and what to fix so people and AI assistants can find it. Free, no signup.</p>
      <form class="check-form panel" data-skill-check data-directory="${rel(here, "directory/")}" hidden>
        <label for="check-q">GitHub URL of the repository or skill folder, or the skill name</label>
        <div class="search-line"><input id="check-q" name="q" type="search" placeholder="https://github.com/owner/repo/tree/main/skills/my-skill" autocomplete="off" required><button type="submit">Check my skill</button></div>
        <p class="muted">The check runs in your browser and reads only this directory’s published files. Nothing you type is sent to Suede AI or anyone else.</p>
      </form>
      <noscript><p class="panel">The check needs JavaScript. Without it, <a href="${rel(here, "directory/")}">search the directory</a> for your skill: every listing shows its score by component.</p></noscript>
      <p role="status" aria-live="polite" data-check-status></p>
      <div data-check-results></div>
      <div data-check-cta="listed" hidden>
${listedCta}
      </div>
      <div data-check-cta="missing" hidden>
${missingCta}
      </div>
      <section class="panel" aria-labelledby="checklist-title">
        <h2 id="checklist-title">Checklist for your README and home page</h2>
        <p>The score reads your skill’s files. People and AI assistants read the page around it. Check each item yourself:</p>
        <ol class="steps">
          <li>One sentence at the top says what the skill does and for whom.</li>
          <li>Copy-ready install commands for every agent you support.</li>
          <li>Two or three example prompts that should load the skill.</li>
          <li>What the skill reads, runs and sends: scripts, credentials and outside hosts.</li>
          <li>The license, stated in the README and in the SKILL.md frontmatter.</li>
          <li>Your listing badge, linked to your listing.</li>
          <li>The page is indexable and can show a snippet, the requirement <a href="https://developers.google.com/search/docs/appearance/ai-features" target="_blank" rel="noopener">Google Search Central</a> states for appearing in AI Overviews and AI Mode.</li>
        </ol>
      </section>
      <section class="panel" aria-labelledby="how-check-title">
        <h2 id="how-check-title">How the check works</h2>
        <p>It looks your skill up in the directory’s ${longDate(data.generated)} snapshot of ${fmt(data.skills.length)} listed skills, then reads that listing’s report: the ${SCORE_METHOD} score, each component’s points and the three largest open points a publisher controls. Curated-list citations are left out of the suggestions because other people award them. <a href="${rel(here, "directory/methodology/")}#score">Read the scoring rubric</a>.${guide ? ` For the full approach, read ${guideAnchor(here, guide)}.` : ""}</p>
      </section>
      <script type="application/json" id="check-rubric">${JSON.stringify(Object.fromEntries(RUBRIC.map((r) => [r.id, r.rule]))).replace(/</g, "\\u003c")}</script>
      <script src="check.js" defer></script>`;
  const title = "Skill AI-Visibility Check: Score Your Agent Skill";
  const description = "Free check for skill publishers: see your directory score, the points still open and what to fix so people and AI assistants find your skill.";
  const keywords = setKeywords(here, ["skill ai visibility check", "agent skill score check", "check my claude skill", "skill description best practices"]);
  files.set(`${here}index.html`, page({
    here,
    title,
    description,
    keywords,
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; Free tool</div>
      <h1>Skill AI-visibility check</h1>`,
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
        inLanguage: "en",
        isPartOf: DIRECTORY_REF,
        publisher: PUBLISHER_REF,
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
      },
      bc.ld,
    ],
    footerNote: "The Skill AI-visibility check reads the directory’s published listing data in your browser. It stores and sends nothing.",
  }));
  files.set(`${here}check.js`, CHECK_CLIENT);
}

// Every internal link a guide or CTA printed must land on a generated page or
// an existing file under docs/, and a fragment must name an id on that page.
function verifyInternalLinks() {
  const problems = [];
  for (const [from, p, frag] of internalLinks) {
    const key = p === "" || p.endsWith("/") ? `${p}index.html` : p;
    const content = files.get(key) ?? (fs.existsSync(path.join(docsRoot, key)) ? fs.readFileSync(path.join(docsRoot, key), "utf8") : null);
    if (content === null) problems.push(`${from} links to missing /${p}`);
    else if (frag && !content.includes(`id="${frag}"`)) problems.push(`${from} links to missing #${frag} on /${p}`);
  }
  if (problems.length) throw new Error(`Broken internal links:\n  ${[...new Set(problems)].slice(0, 20).join("\n  ")}`);
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
    title: "Page not found | Suede AI Skills",
    description: "This page is not on skills.suedeai.ai. Browse the Suede AI Skills Directory or the Suede AI Skills pack instead.",
    keywords: null,
    h1Html: `      <div class="eyebrow">404</div>
      <h1>This page is not here</h1>`,
    body: `      <p class="lead">The address may be mistyped, or the listing may have left the directory at a refresh. Everything still listed is one click away.</p>
      <p><a class="button" href="/directory/">Browse the Agent Skills Directory</a> <a class="button secondary" href="/skills/">Suede AI Skills</a></p>
      <section class="panel" aria-labelledby="cats-title">
        <h2 id="cats-title">Skill directories</h2>
        <p class="cat-links">${categories.map((c) => `<a href="/directory/${c.slug}/">${esc(c.title)}</a>`).join(" &middot; ")}</p>
      </section>`,
    jsonld: [],
    footerNote: "Suede AI Skills and the Agent Skills Directory are published at skills.suedeai.ai.",
  }));
}

// ------------------------------------------------------------------ browse pages

const REVIEW_FORM = "https://github.com/JasonColapietro/suede-creator-skills/issues/new?template=directory-review.yml";
const REVIEW_SEARCH = "https://github.com/JasonColapietro/suede-creator-skills/issues";
const titleTaken = new Set([...categories.map((c) => c.seo_title.toLowerCase())]);
function pickTitle(candidates, label) {
  const t = candidates.find((x) => x.length <= 60 && !titleTaken.has(x.toLowerCase()));
  if (!t) throw new Error(`${label}: no unique title fits 60 characters`);
  titleTaken.add(t.toLowerCase());
  return t;
}
const listingHref = (here, s) => {
  if (s.featured || s.full_page) return rel(here, skillPath(s));
  const r = repos.get(s.repo_slug);
  return r.hasPage ? `${rel(here, r.target)}#${s.slug}` : s.folder_url;
};
const listingLink = (here, s) => {
  const h = listingHref(here, s);
  return /^https:/.test(h) ? `<a href="${esc(h)}" target="_blank" rel="noopener">${esc(displayName(s))}</a>` : `<a href="${h}">${esc(displayName(s))}</a>`;
};

function boardRow(here, s, i, metric) {
  const h = listingHref(here, s);
  const ext = /^https:/.test(h);
  return `          <a class="board-row" href="${esc(h)}"${ext ? ' target="_blank" rel="noopener"' : ""}><span class="rank">${String(i + 1).padStart(2, "0")}</span><span class="who"><b>${esc(displayName(s))}</b><span>${esc(s.repo)}</span></span><span class="metric">${metric}</span>${gradeChip(s)}</a>`;
}
// Focal graphics: a dot per skill, colored by grade, and a bar chart of installs.
const GRADE_COLORS = { A: "#00ca52", B: "#50a8ff", C: "#ffb200", D: "#454545" };
const gradeDot = (s) => GRADE_COLORS[s.grade] || GRADE_COLORS.D;
function skillMatrix(rows, { cols, title }) {
  const sorted = [...rows].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return dotMatrix(sorted, { cols, cell: 10, dot: 8, colorOf: gradeDot, title, legend: Object.entries(GRADE_COLORS).map(([g, c]) => [c, `grade ${g}`]) });
}
// The home page's hero layout for any page with a focal graphic: copy on the
// left, the graphic on the right, one column under 900px. Hero matrices are
// shaped to the column (about 2.4 dots wide per dot tall) and drawn with
// cells of at most 16px, so a small category reads as a smaller block rather
// than a stretched one.
const heroMatrixCols = (n) => Math.max(16, Math.min(48, Math.round(Math.sqrt(n * 2.4))));
const heroMatrixSize = (n) => { const cols = heroMatrixCols(n); return { cols, width: cols * 16, height: Math.ceil(n / cols) * 16 }; };
const pageHero = (copy, figure) => `      <header class="directory-hero page-hero">
        <div>
${copy}
        </div>
${figure}
      </header>`;
const matrixCaption = (what) => `<p class="matrix-caption"><span>${what}</span>${["A", "B", "C", "D"].map((g) => `<span><i style="background:${GRADE_COLORS[g]}"></i>${g}</span>`).join("")}</p>`;
function installChart(rows, here) {
  const top = rows.slice(0, 20);
  const max = Math.max(...top.map((s) => installsFor(s).installs), 1);
  const rowH = 22, labelW = 250, w = 900, barW = w - labelW - 90;
  const h = top.length * rowH + 12;
  const bars = top.map((s, i) => {
    const y = i * rowH + 6;
    const bw = Math.max(2, Math.round((installsFor(s).installs / max) * barW));
    return `<a href="${esc(listingHref(here, s))}"><text class="bar-label" x="${labelW - 10}" y="${y + 15}" text-anchor="end">${esc(trimTo(displayName(s), 28))}</text><rect class="bar" x="${labelW}" y="${y + 3}" width="${bw}" height="${rowH - 8}" rx="1"/><text class="bar-value" x="${labelW + bw + 8}" y="${y + 15}">${esc(compact(installsFor(s).installs))}</text></a>`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Installs recorded by skills.sh for the 20 most installed listed skills">${bars}</svg>`;
}
const board = (here, rows, metric, limit = rows.length) => `        <div class="board">\n${rows.slice(0, limit).map((s, i) => boardRow(here, s, i, metric(s))).join("\n")}\n        </div>`;

function saveButton(s) {
  return `<button type="button" class="save-button" data-save="${esc(s.id)}" data-save-name="${esc(displayName(s))}" data-save-href="./" data-save-repo="${esc(s.repo)}" data-save-score="${s.score}" data-save-grade="${s.grade}" data-save-category="${esc(catBySlug.get(s.category).label)}" data-save-license="${esc(s.license)}" aria-pressed="false">Save</button>`;
}

function shareRow(here, text) {
  const u = movedUrl(url(here));
  const x = `https://x.com/intent/post?url=${encodeURIComponent(u)}&text=${encodeURIComponent(text)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`;
  return `      <div class="share" data-share><span class="share-label">Share</span><a href="${esc(x)}" target="_blank" rel="noopener">X</a><a href="${esc(li)}" target="_blank" rel="noopener">LinkedIn</a><button type="button" data-copy-url="${esc(u)}">Copy link</button></div>`;
}

// What earns the skill its score and what a reader should check, from the
// rubric and the install record only.
function strengthsPanel(s) {
  const good = [];
  const parts = s.score_parts;
  for (const p of parts.filter((p) => p.points === p.max && p.max > 0).sort((a, b) => b.max - a.max)) good.push(`Full points for ${p.label.toLowerCase()} (${p.points} of ${p.max}).`);
  if (s.official) good.push(`Published by ${publisherName(s.owner, true)}, the company behind the tool it works with.`);
  if (s.lists.length >= 2) good.push(`Its repository is cited by ${plural(s.lists.length, "curated list")}.`);
  if (s.flags.includes("no-setup")) good.push("Its files read no credential, call no outside host, connect to no MCP server and run no command.");
  const check = [];
  for (const p of parts.filter((p) => p.points < p.max && p.id !== "adoption").sort((a, b) => b.max - b.points - (a.max - a.points))) check.push(`${p.label}: ${p.points} of ${p.max} points.`);
  const i = s.install || {};
  const creds = [...new Set([...(i.env_read || []), ...(i.env_docs || [])])];
  if (creds.length) check.push(`Needs ${listPhrase(creds.slice(0, 4))}${creds.length > 4 ? " and more" : ""} set in your environment.`);
  if (i.mcp || (i.mcp_tools || []).length) check.push("Connects to an MCP server you configure separately.");
  if (s.lane === "noncommercial") check.push(`${s.license} allows non-commercial use only.`);
  if (s.lane === "restricted") check.push(`${s.license}: read the terms at the source before you install.`);
  check.push("Security scan: not scanned by the directory. Read SKILL.md and any scripts before you install.");
  return `      <section class="panel" id="strengths" aria-labelledby="strengths-title">
        <h2 id="strengths-title">Strengths and open points</h2>
        <div class="pros-cons">
          <div><h3>What it does well</h3><ul>${good.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
          <div><h3>What to check</h3><ul>${check.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
        </div>
      </section>`;
}

function reviewsPanel(here, s) {
  const write = `${REVIEW_FORM}&title=${encodeURIComponent(`Review: ${s.id}`)}&skill=${encodeURIComponent(s.id)}&listing=${encodeURIComponent(movedUrl(url(here)))}`;
  const read = `${REVIEW_SEARCH}?q=${encodeURIComponent(`is:issue label:review "${s.id}"`)}`;
  return `      <section class="panel" id="reviews" aria-labelledby="reviews-title">
        <h2 id="reviews-title">Reviews and ratings</h2>
        <p><b>Directory rating:</b> ${gradeChip(s)} on the <a href="${rel(here, "directory/methodology/")}#score">Suede Skill Check</a>, computed from the skill's published files.</p>
        <p>Used ${esc(displayName(s))}? Reader reviews are published on GitHub as issues credited to their authors. They never change the score.</p>
        <p><a class="button secondary" href="${esc(write)}" target="_blank" rel="noopener">Write a review</a> <a href="${esc(read)}" target="_blank" rel="noopener">Read reviews of ${esc(displayName(s))}</a></p>
      </section>`;
}

function skillFaqItems(s) {
  const name = displayName(s);
  const who = publisherName(s.owner, s.official);
  const cat = catBySlug.get(s.category);
  const i = s.install || {};
  const creds = [...new Set([...(i.env_read || []), ...(i.env_docs || [])])];
  const mcpTools = i.mcp_tools || [];
  const needs = [
    creds.length ? `reads ${listPhrase(creds.slice(0, 4))}${creds.length > 4 ? " and other variables" : ""}` : "",
    mcpTools.length ? `calls tools from the ${listPhrase(mcpTools)} MCP server${mcpTools.length > 1 ? "s" : ""}` : i.mcp ? "mentions an MCP server" : "",
    (i.hosts || []).length ? `names ${listPhrase(i.hosts.slice(0, 3))}` : i.net ? "uses an HTTP client or cloud SDK" : "",
  ].filter(Boolean);
  const free = {
    "free-open-source": `Yes. ${who} publishes ${name} under ${s.license}, an open-source or open-content license, and its files name no paid service, API key or hosted account.`,
    "free-with-service": `The skill is free under ${s.license}. Its files ${listPhrase(needs.length ? needs : ["connect to an outside service"])}, so the service it talks to may need an account or a paid plan.`,
    noncommercial: `${name} is free for non-commercial use under ${s.license}. Check the license before using it in paid work.`,
    restricted: `${who} publishes ${name} under its own terms (${s.license}). Read them at the source before you install.`,
  }[s.lane];
  const install = s.lane === "restricted"
    ? `Follow ${who}'s install route shown on this page; its license restricts copying the files.`
    : `Run npx skills add ${skillTreeUrl(s)} from your project, or copy the folder into .claude/skills/ for Claude Code or .agents/skills/ for Codex. The install section lists each route.`;
  const faq = [
    [`What does ${name} do?`, `${ensureSentence(s.summary)} It is listed in ${cat.title} on ${SITE_LABEL}.`],
    [`Is ${name} free?`, free],
    [`How do I install ${name}?`, install],
    [`Does ${name} need an API key or MCP server?`, needs.length ? `Yes. At the ${longDate(data.generated)} snapshot its files ${listPhrase(needs)}. The Before you install section lists the details.` : `No. At the ${longDate(data.generated)} snapshot its files read no credential, connect to no MCP server and call no outside host.`],
    [`How good is ${name}?`, `It scores ${s.score}/100, grade ${s.grade}, on the Suede Skill Check, which adds structure, description quality, instruction depth, bundled files, maintenance and curated-list citations from its published files.`],
  ];
  const alt = altBySkill.get(s.id);
  const similar = similarByTopic(s, TOPICS_BY_SKILL, 3).filter((o) => !isFirstParty(o));
  if (!isFirstParty(s) && alt) faq.push([`What are alternatives to ${name}?`, `${listPhrase(alt.peers.slice(0, 3).map((o) => `${displayName(o)} from ${o.repo}`))} do similar work. Its alternatives page compares ${plural(alt.peers.length, "skill")} from other publishers.`]);
  else if (!isFirstParty(s) && similar.length) faq.push([`What are alternatives to ${name}?`, `Skills that share its topics include ${listPhrase(similar.map((o) => `${displayName(o)} from ${o.repo}`))}.`]);
  return faq;
}

function similarPanel(here, s) {
  if (isFirstParty(s)) return "";
  const list = similarByTopic(s, TOPICS_BY_SKILL, 6).filter((o) => !isFirstParty(o));
  if (!list.length) return "";
  return `      <section class="panel" aria-labelledby="similar-title">
        <h2 id="similar-title">Similar skills</h2>
        <p class="muted">Skills from other publishers that share the most topics with ${esc(displayName(s))}.</p>
        <div class="links">
${list.map((o) => `          <a class="link-row" href="${rel(here, skillPath(o))}"><b>${esc(displayName(o))}</b><span>${esc(o.repo)} &middot; ${o.score}/100</span></a>`).join("\n")}
        </div>
      </section>`;
}

const topicChip = (here, t, n) => `<a href="${rel(here, topicPath(t))}">${esc(t.topic.name)} <span class="count-chip">${fmt(n)}</span></a>`;

// ------------------------------------------------------------ topic tiles
// Best of: the topics the home page and the topics hub feature as data tiles,
// in the order directory/editorial/best-of.json gives. Each tile draws its
// topic's skills as a dot matrix colored by grade and names the top pick, so
// the tile is a small chart of the page it opens rather than a label.
const BEST_OF_FILE = path.join(repoRoot, "directory", "editorial", "best-of.json");
const BEST_OF = (() => {
  if (!fs.existsSync(BEST_OF_FILE)) return [];
  const ids = JSON.parse(fs.readFileSync(BEST_OF_FILE, "utf8")).topics || [];
  return ids.map((id) => {
    const t = TOPICS.find((x) => x.topic.id === id);
    if (!t) throw new Error(`best-of.json: ${id} is not a published topic`);
    return t;
  });
})();
const TILE_COLS = 24;
const TILE_MAX_DOTS = TILE_COLS * 6;
const gradeCounts = (rows) => Object.fromEntries(["A", "B", "C", "D"].map((g) => [g, rows.filter((s) => s.grade === g).length]));
const gradeSummary = (rows) => { const n = gradeCounts(rows); return `${n.A} grade A, ${n.B} grade B, ${n.C} grade C and ${n.D} grade D`; };
function topPick(t) {
  const ranked = t.rows.filter((s) => !isFirstParty(s)).sort((a, b) => Number(b.featured) - Number(a.featured) || byScore(a, b));
  return ranked[0] || null;
}
// One 4px dot on a 6px cell per skill, best score first, one path per grade.
function tileMatrix(t) {
  const dots = [...t.rows].sort(byScore).slice(0, TILE_MAX_DOTS);
  const rows = Math.max(1, Math.ceil(dots.length / TILE_COLS));
  const byGrade = new Map();
  dots.forEach((s, i) => byGrade.set(s.grade, `${byGrade.get(s.grade) || ""}M${(i % TILE_COLS) * 6} ${Math.floor(i / TILE_COLS) * 6}h4v4h-4z`));
  const label = `${fmt(t.rows.length)} ${t.topic.noun.toLowerCase()} skills by Suede Skill Check grade: ${gradeSummary(t.rows)}`;
  return `<svg class="tile-matrix" viewBox="0 0 ${TILE_COLS * 6} ${rows * 6}" width="${TILE_COLS * 6}" height="${rows * 6}" shape-rendering="crispEdges" role="img" aria-label="${esc(label)}">${[...byGrade].map(([g, d]) => `<path fill="${GRADE_COLORS[g] || GRADE_COLORS.D}" d="${d}"/>`).join("")}</svg>`;
}
function topicTile(here, t) {
  const top = topPick(t);
  const extra = t.rows.length > TILE_MAX_DOTS ? `<span class="tile-more">+${fmt(t.rows.length - TILE_MAX_DOTS)}</span>` : "";
  return `          <a class="topic-tile" href="${rel(here, topicPath(t))}" data-count="${t.rows.length}">
            <span class="tile-head"><span>${esc(groupById.get(t.topic.group).name)}</span><span class="tile-count">${fmt(t.rows.length)}<span class="visually-hidden"> skills</span></span></span>
            <b class="tile-name">${esc(t.topic.name)}</b>
            <span class="tile-field">${tileMatrix(t)}${extra}<span class="tile-scan" aria-hidden="true"></span></span>
            ${top ? `<span class="tile-top"><span class="tile-top-label">Top</span><span class="tile-top-name">${esc(displayName(top))}</span><span class="grade grade-${top.grade.toLowerCase()}">${top.score} · ${top.grade}</span></span>` : `<span class="tile-top"><span class="tile-top-label">Top</span><span class="tile-top-name">No ranked pick yet</span></span>`}
          </a>`;
}
// The grade mix as a four-stop bar: percentages of the topic's skills at each
// grade, rounded to a tenth, the last stop taking the remainder.
function gradeMix(rows) {
  const n = gradeCounts(rows);
  const total = rows.length || 1;
  const a = Math.round((n.A / total) * 1000) / 10, b = Math.round((n.B / total) * 1000) / 10, c = Math.round((n.C / total) * 1000) / 10;
  const d = Math.max(0, Math.round((100 - a - b - c) * 10) / 10);
  return `--a:${a}%;--b:${b}%;--c:${c}%;--d:${d}%`;
}
const compactTile = (here, t) => `<a class="topic-tile is-compact" href="${rel(here, topicPath(t))}" data-count="${t.rows.length}"><b class="tile-name">${esc(t.topic.name)}</b><span class="tile-count">${fmt(t.rows.length)}<span class="visually-hidden"> skills</span></span><span class="tile-mix" style="${gradeMix(t.rows)}" title="${esc(gradeSummary(t.rows))}" aria-hidden="true"></span></a>`;
function bestOfSection(here) {
  if (!BEST_OF.length) return "";
  const onHub = here === TOPICS_PATH;
  return `      <section class="panel best-of" aria-labelledby="best-of-title">
        <div class="board-head"><h2 id="best-of-title">Best of</h2>${onHub ? "" : `<a href="${rel(here, TOPICS_PATH)}">All ${fmt(TOPICS.length)} topics</a>`}</div>
        <p class="muted">Each tile charts its topic: one dot per listed skill, best score first, colored by grade, with the top pick named. Suede AI's own skills are not ranked.</p>
        <div class="tile-grid">
${BEST_OF.map((t) => topicTile(here, t)).join("\n")}
        </div>
      </section>`;
}
function topicChipsPanel(here, c) {
  const list = TOPICS.map((t) => [t, t.rows.filter((s) => s.category === c.slug).length]).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1] || a[0].topic.name.localeCompare(b[0].topic.name)).slice(0, 30);
  if (!list.length) return "";
  return `      <section class="panel" aria-labelledby="topics-title">
        <h2 id="topics-title">${esc(c.short[0].toUpperCase() + c.short.slice(1))} skills by topic</h2>
        <p class="topic-chips">${list.map(([t, n]) => topicChip(here, t, n)).join("")}</p>
        <p><a href="${rel(here, TOPICS_PATH)}">All topics</a> &middot; <a href="${rel(here, PRICING_PATH)}">Skills by cost and license</a> &middot; <a href="${rel(here, FEATURES_PATH)}">Skills by capability</a></p>
      </section>`;
}

function browseWaysPanel(here) {
  const rows = [
    TOPICS.length ? [TOPICS_PATH, "Topics", `${TOPICS.length} topics in ${TOPIC_CONFIG.groups.length} groups, from ${listPhrase(TOPICS.slice(0, 3).map((t) => t.topic.name))} to ${TOPICS.at(-1).topic.name}`] : null,
    [PRICING_PATH, "Cost and license", LANES_LIVE.map((l) => `${l.lane.label} (${fmt(l.rows.length)})`).join(" &middot; ")],
    [FEATURES_PATH, "Capabilities", `${FLAGS_LIVE.length} filters: official publishers, MCP servers, API keys, no setup required and more`],
    [NEW_PATH, "New and updated", `${plural(NEW_LISTINGS.length, "new listing")} and ${plural(RECENTLY_UPDATED.length, "skill")} updated in the last ${NEW_DAYS} days`],
    TOP_SKILLS.length ? [TOP_PATH, "Top 100", INSTALLS ? "The most installed skills, by skills.sh counts, and the highest-scoring third-party skills" : "The highest-scoring third-party skills"] : null,
    [SAVED_PATH, "Saved skills", "Your saved list, kept in this browser"],
    [COMPARE_PATH, "Compare two skills", "Scores by component, licenses, cost lanes and capabilities side by side"],
    [PUBLISHERS_PATH, "Publishers", `${fmt(repos.size)} repositories with skill counts, best scores and official status`],
    [SECURITY_PATH, "Security", "What the directory checks before listing, and how to review a skill yourself"],
    ...KINDS.map((k) => [kindPath(k), k.name, trimTo(k.lead, 120)]),
    ...(STACKS.length ? [[STACKS_PATH, "Recommended stacks", `${plural(STACKS.length, "stack")} by task, from Jason Colapietro`]] : []),
    [API_PATH, "API and data", "The search index, per-skill reports, badges, the RSS feed and the install snapshot, all as static files"],
  ].filter(Boolean);
  return `      <section class="panel browse-ways" aria-labelledby="browse-ways-title">
        <h2 id="browse-ways-title">More ways to browse</h2>
        <div class="links">
${rows.map(([p, label, text]) => `          <a class="link-row" href="${rel(here, p)}"><b>${label}</b><span>${text}</span></a>`).join("\n")}
        </div>
      </section>`;
}

// One page shape for every browse page: crumbs, an optional lead and the
// body, a CollectionPage with its ItemList, and the breadcrumb.
function browsePage({ here, trail, title, description, keywords, eyebrow, h1, body, items, footerNote, extraLd = [] }) {
  const bc = crumbs(here, trail);
  files.set(`${here}index.html`, page({
    here, title, description, keywords: setKeywords(here, keywords),
    h1Html: `      <div class="eyebrow">${eyebrow}</div>
      <h1>${h1}</h1>`,
    body: `${bc.html}\n${body}`,
    jsonld: [
      {
        "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url(here)}#page`,
        name: title, description, url: url(here), dateModified: PAGE_DATE, inLanguage: "en",
        isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF, breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        mainEntity: { "@type": "ItemList", numberOfItems: items.length, itemListElement: items.map(([name, u], i) => ({ "@type": "ListItem", position: i + 1, name, url: u })) },
      },
      bc.ld,
      ...extraLd,
    ],
    footerNote,
  }));
}

function bestOf(rows, n = 3) {
  const best = [];
  for (const s of rows.filter((x) => x.featured && !isFirstParty(x)).sort(byScore)) {
    if (best.some((o) => o.repo_slug === s.repo_slug)) continue;
    best.push(s);
    if (best.length === n) break;
  }
  return best;
}

function allTable(here, id, rows, caption) {
  return `${tableTools(id, rows)}
${filterField(id, rows.length, "skills")}
${skillTable(here, rows, { id, showRepo: true, caption })}`;
}

function renderTopic(t) {
  const here = topicPath(t);
  const g = groupById.get(t.topic.group);
  const { name, noun } = t.topic;
  const rows = t.rows;
  const repoCount = new Set(rows.map((s) => s.repo_slug)).size;
  const full = rows.filter((s) => s.featured).length;
  const best = bestOf(rows);
  const intro = t.topic.intro || `Agent skills for ${noun} work in Claude Code, Codex and Cursor, collected from ${plural(repoCount, "repository", "repositories")} across the directory's categories.`;
  const catCounts = t.categories.map((c) => [c, rows.filter((s) => s.category === c).length]).sort((a, b) => b[1] - a[1]);
  const scripts = rows.filter((s) => s.has_scripts).length;
  const service = rows.filter((s) => s.lane === "free-with-service").length;
  const official = rows.filter((s) => s.official).length;
  const related = TOPICS.filter((o) => o !== t).map((o) => [o, o.rows.filter((s) => t.reasons.has(s.id)).length]).filter(([o, n]) => n >= 2 || (o.topic.group === t.topic.group && n >= 1)).sort((a, b) => b[1] - a[1] || a[0].topic.name.localeCompare(b[0].topic.name)).slice(0, 8);
  const tasks = TASKS.filter((k) => k.rows.filter((s) => t.reasons.has(s.id)).length >= 2);
  const body = `      <p class="lead">${esc(intro)}</p>
${best.length ? `      <p class="answer"><b>Highest-scoring ${esc(noun)} skills</b> in the ${longDate(data.generated)} snapshot: ${listPhrase(best.map((s) => `<a href="${rel(here, skillPath(s))}">${esc(displayName(s))}</a> from ${esc(s.repo)} (${s.score}/100)`))}. Scores come from the <a href="${rel(here, "directory/methodology/")}">Suede Skill Check</a>.</p>` : ""}
      <ul class="stat-row" aria-label="Topic size">
        <li><b>${fmt(rows.length)}</b> listed skills</li>
        <li><b>${fmt(repoCount)}</b> repositories</li>
        <li><b>${fmt(full)}</b> with full pages</li>
      </ul>
      <p class="muted">${official ? `${fmt(official)} from official publishers. ` : ""}${fmt(scripts)} bundle scripts. ${fmt(service)} connect to an outside service. Listed in ${catCounts.map(([c, n]) => `<a href="${rel(here, catPath(c))}">${esc(catBySlug.get(c).title)}</a> (${fmt(n)})`).join(", ")}.</p>
      <section class="panel" aria-labelledby="all-title">
        <h2 id="all-title">All ${fmt(rows.length)} ${esc(noun)} skills</h2>
${allTable(here, "topic-skills", rows, `${noun} skills`)}
      </section>
${t.topic.guide ? `      <section class="panel" aria-labelledby="choose-title">
        <h2 id="choose-title">How to choose ${esc(noun)} skills</h2>
${t.topic.guide.map((p) => `        <p>${esc(p)}</p>`).join("\n")}
      </section>` : ""}
${tasksPanel(here, tasks, `Ranked ${noun} shortlists`)}
${related.length ? `      <section class="panel" aria-labelledby="related-topics-title">
        <h2 id="related-topics-title">Related topics</h2>
        <p class="topic-chips">${related.map(([o, n]) => topicChip(here, o, o.rows.length)).join("")}</p>
        <p><a href="${rel(here, TOPICS_PATH)}#group-${g.id}">More ${esc(g.name.toLowerCase())} topics</a></p>
      </section>` : ""}
${servicesCta("browse", catCounts[0][0], here)}`;
  const top = best[0];
  const n = rows.length;
  browsePage({
    here,
    trail: [["directory/", "Directory"], [TOPICS_PATH, "Topics"], [null, name]],
    title: pickTitle([`${name} Skills for Claude Code and Codex`, `${name} Agent Skills for Claude Code`, `${name} Agent Skills`, `${name} Skills | Suede AI`], `topic ${t.topic.id}`),
    description: fitMeta([
      `Browse ${fmt(n)} ${noun} skills for Claude Code and Codex from ${plural(repoCount, "repository", "repositories")}, graded 0 to 99 and linked to source.${top ? ` ${displayName(top)} leads at ${top.score}/100.` : ""}`,
      `Browse ${fmt(n)} ${noun} skills for Claude Code and Codex from ${plural(repoCount, "repository", "repositories")}, graded 0 to 99 and linked to source.`,
      `${fmt(n)} ${noun} skills for Claude Code and Codex, graded 0 to 99.`,
      `${fmt(n)} ${noun} agent skills for Claude Code, Codex and Cursor, each graded 0 to 99 on the Suede Skill Check.`,
    ], `topic ${t.topic.id}`),
    keywords: [`${name.toLowerCase()} skills for claude code and codex`, `${noun} agent skills`, `${noun} claude skills`, `best ${noun} skills`, `${noun} skills for codex`],
    eyebrow: `Topic &middot; ${esc(g.name)}`,
    h1: `${esc(name)} skills <span class="h1-sub">for Claude Code and Codex</span>`,
    body,
    items: rows.map((s) => [displayName(s), listItemUrl(s)]),
    footerNote: `${esc(name)} skills on ${SITE_LABEL}. Every skill belongs to its publisher and links to its source.`,
  });
}

function renderTopicsHub() {
  const here = TOPICS_PATH;
  const groups = TOPIC_PLAN.groups.map(({ group: g, topics }) => {
    const live = topics.filter((t) => t.published).sort((a, b) => b.rows.length - a.rows.length || a.topic.name.localeCompare(b.topic.name));
    const waiting = topics.filter((t) => !t.published);
    return `      <section class="panel" id="group-${g.id}" aria-labelledby="group-${g.id}-title">
        <h2 id="group-${g.id}-title">${esc(g.name)}</h2>
        <p>${esc(g.intro)}</p>
${live.length ? `        <div class="tile-grid is-compact">${live.map((t) => compactTile(here, t)).join("")}</div>` : `        <p class="muted">No topic in this group has three listed skills yet.</p>`}
${waiting.length ? `        <p class="muted">No page yet: ${waiting.map((t) => `${esc(t.topic.name)} (${fmt(t.rows.length)})`).join(", ")}. Publish a skill for one of these? <a href="${rel(here, "directory/submit/")}">Request a listing</a>.</p>` : ""}
      </section>`;
  }).join("\n");
  const covered = TOPICS_BY_SKILL.size;
  browsePage({
    here,
    trail: [["directory/", "Directory"], [null, "Topics"]],
    title: pickTitle([`Agent Skills by Topic: ${TOPICS.length} Topics, Graded`, "Agent Skills by Topic"], "topics hub"),
    description: fitMeta([`Browse agent skills for Claude Code and Codex by topic: ${TOPICS.length} topics in ${TOPIC_CONFIG.groups.length} groups, from ${listPhrase(TOPICS.slice(0, 3).map((t) => t.topic.name))} to video and voice.`, `Browse agent skills for Claude Code and Codex by topic: ${TOPICS.length} topics in ${TOPIC_CONFIG.groups.length} groups, each graded and linked to source.`], "topics hub"),
    keywords: ["agent skills by topic", "claude code skills by use case", "claude skills categories", "ai agent skills list by topic"],
    eyebrow: "Suede AI Skills Directory &middot; Topics",
    h1: "Agent skills by topic",
    body: `      <p class="lead">Find skills by the job they do. ${fmt(TOPICS.length)} topics in ${TOPIC_CONFIG.groups.length} groups cover ${fmt(covered)} of the ${fmt(data.skills.length)} listed skills; each topic page lists every match with its score, license and source. A topic gets a page once ${TOPIC_GATE.minListed} listed skills match it.</p>
      <nav class="topic-chips" aria-label="Topic groups">${TOPIC_CONFIG.groups.map((g) => `<a href="#group-${g.id}">${esc(g.name)}</a>`).join("")}</nav>
${bestOfSection(here)}
${groups}
      <section class="panel" aria-labelledby="other-ways-title">
        <h2 id="other-ways-title">Other ways to browse</h2>
        <p class="cat-links">${categories.map((c) => `<a href="${rel(here, catPath(c.slug))}">${esc(c.title)}</a>`).join(" &middot; ")}</p>
        <p><a href="${rel(here, PRICING_PATH)}">By cost and license</a> &middot; <a href="${rel(here, FEATURES_PATH)}">By capability</a> &middot; <a href="${rel(here, TASKS_PATH)}">Ranked shortlists by task</a></p>
      </section>
${servicesCta("browse-hub", null, here)}`,
    items: TOPICS.map((t) => [`${t.topic.name} skills`, url(topicPath(t))]),
    footerNote: `Topics on ${SITE_LABEL} group listed skills by the job they do. Every skill belongs to its publisher.`,
  });
}

function facetRows(rows) {
  return rows.length <= FACET_TABLE_MAX ? { rows, ranked: false } : { rows: rows.filter((s) => !isFirstParty(s)).sort(byScore).slice(0, TOP_MAX), ranked: true };
}
function categoryBreakdown(here, rows, param, value) {
  const counts = categories.map((c) => [c, rows.filter((s) => s.category === c.slug).length]).filter(([, n]) => n).sort((a, b) => b[1] - a[1]);
  return `<p class="cat-links">${counts.map(([c, n]) => `<a href="${rel(here, catPath(c.slug))}?${param}=${value}#all-title">${esc(c.title)}</a> (${fmt(n)})`).join(" &middot; ")}</p>`;
}

const PRICING_FAQ = () => {
  const by = Object.fromEntries(FACETS.lanes.map((l) => [l.lane.id, l.rows.length]));
  return [
    ["Are Claude Code skills free?", `Every listed skill is published in a public GitHub repository and costs nothing to download. In the ${longDate(data.generated)} snapshot, ${fmt(by["free-open-source"])} use an open license and name no paid service, ${fmt(by["free-with-service"])} use an open license but connect to an outside service, ${fmt(by.noncommercial)} allow non-commercial use only and ${fmt(by.restricted)} use restricted terms.`],
    ["How does the directory decide a skill needs a service?", "For skills with full pages, from the install record the refresh reads from the skill's files: environment variables, MCP servers, outside hosts and HTTP clients. For other skills, from the compatibility line the author wrote in SKILL.md."],
    ["Can I use these skills in commercial work?", "Skills under open-source or open-content licenses allow it under their terms. Non-commercial licenses do not, and restricted licenses need the publisher's permission. Each listing links to its license file."],
  ];
};

function renderPricingHub() {
  const here = PRICING_PATH;
  const faq = faqBlock(here, PRICING_FAQ());
  browsePage({
    here,
    trail: [["directory/", "Directory"], [null, "Cost and license"]],
    title: pickTitle(["Free Agent Skills by License and Cost", "Agent Skills by Cost and License"], "pricing hub"),
    description: fitMeta([`Which Claude Code skills are free? ${fmt(FACETS.lanes[0].rows.length)} use an open license with no paid service. Browse every listed skill by cost and license.`, "Browse Claude Code and Codex skills by cost and license: free and open source, needs a service, non-commercial and restricted."], "pricing hub"),
    keywords: ["free claude code skills", "free agent skills", "open source claude skills", "agent skills license"],
    eyebrow: "Suede AI Skills Directory &middot; Cost and license",
    h1: "Free and open-source agent skills, by license",
    body: `      <p class="lead">Every listed skill is free to download. What it costs to run depends on its license and on the services its files connect to. Four lanes sort all ${fmt(data.skills.length)} listed skills.</p>
      <section class="panel" aria-labelledby="lanes-title">
        <h2 id="lanes-title">Cost and license lanes</h2>
        <div class="links">
${LANES_LIVE.map((l) => `          <a class="link-row" href="${rel(here, lanePath(l.lane.id))}"><b>${esc(l.lane.label)} (${fmt(l.rows.length)})</b><span>${esc(l.lane.lede)}</span></a>`).join("\n")}
        </div>
      </section>
${faq.html}
${servicesCta("browse-hub", null, here)}`,
    items: LANES_LIVE.map((l) => [l.lane.label, url(lanePath(l.lane.id))]),
    footerNote: `Cost and license lanes on ${SITE_LABEL}, derived from each listing's license and install record.`,
    extraLd: [faq.ld],
  });
}

function renderLane({ lane, rows }) {
  const here = lanePath(lane.id);
  const shown = facetRows(rows);
  const best = bestOf(rows);
  browsePage({
    here,
    trail: [["directory/", "Directory"], [PRICING_PATH, "Cost and license"], [null, lane.label]],
    title: pickTitle([lane.title, `${lane.label} Agent Skills`], `lane ${lane.id}`),
    description: fitMeta([`${fmt(rows.length)} ${lane.noun} agent skills for Claude Code and Codex. ${lane.lede}`, `${fmt(rows.length)} ${lane.noun} agent skills for Claude Code and Codex, graded 0 to 99 and linked to source.`], `lane ${lane.id}`),
    keywords: [`${lane.noun} claude code skills`, `${lane.noun} agent skills`, `${lane.short} skills for codex`],
    eyebrow: "Cost and license",
    h1: `${esc(lane.label)} <span class="h1-sub">agent skills</span>`,
    body: `      <p class="lead">${esc(lane.lede)}</p>
${best.length ? `      <p class="answer"><b>Highest-scoring</b> in this lane: ${listPhrase(best.map((s) => `<a href="${rel(here, skillPath(s))}">${esc(displayName(s))}</a> from ${esc(s.repo)} (${s.score}/100)`))}.</p>` : ""}
      <ul class="stat-row" aria-label="Lane size"><li><b>${fmt(rows.length)}</b> listed skills</li><li><b>${fmt(new Set(rows.map((s) => s.repo_slug)).size)}</b> repositories</li></ul>
      <section class="panel" aria-labelledby="by-cat-title">
        <h2 id="by-cat-title">By category</h2>
        ${categoryBreakdown(here, rows, "lane", lane.id)}
      </section>
      <section class="panel" aria-labelledby="all-title">
        <h2 id="all-title">${shown.ranked ? `The ${TOP_MAX} highest-scoring of ${fmt(rows.length)}` : `All ${fmt(rows.length)}`} ${esc(lane.short)} skills</h2>
${shown.ranked ? `        <p class="muted">Ranked by Suede Skill Check score; Suede AI's own skills are not ranked. Open a category above for the full list, filtered to this lane.</p>\n` : ""}${allTable(here, "lane-skills", shown.rows, `${lane.short} skills`)}
      </section>
      <p><a href="${rel(here, PRICING_PATH)}">All cost and license lanes</a></p>
${servicesCta("browse", null, here)}`,
    items: shown.rows.map((s) => [displayName(s), listItemUrl(s)]),
    footerNote: `${esc(lane.label)} skills on ${SITE_LABEL}. Licenses belong to each publisher; read them at the source.`,
  });
}

function renderFeaturesHub() {
  const here = FEATURES_PATH;
  browsePage({
    here,
    trail: [["directory/", "Directory"], [null, "Capabilities"]],
    title: pickTitle(["Agent Skills by Capability: MCP, Scripts, No Setup", "Agent Skills by Capability"], "features hub"),
    description: fitMeta([`Filter Claude Code skills by capability: official publishers, MCP servers, API keys, bundled scripts, no setup required and ${FLAGS_LIVE.length - 5} more.`, "Filter Claude Code and Codex skills by capability: official publishers, MCP servers, bundled scripts and no setup required."], "features hub"),
    keywords: ["claude code skills with mcp", "agent skills capabilities", "official claude skills", "claude skills no setup"],
    eyebrow: "Suede AI Skills Directory &middot; Capabilities",
    h1: "Agent skills by capability",
    body: `      <p class="lead">Each capability is a yes or no fact read from a skill's published files. Pick the ones your setup needs. Filters marked "full pages" count the ${fmt(featured.length)} skills whose files the directory reads in full.</p>
      <section class="panel" aria-labelledby="flags-title">
        <h2 id="flags-title">${FLAGS_LIVE.length} capabilities</h2>
        <div class="links">
${FLAGS_LIVE.map((f) => `          <a class="link-row" href="${rel(here, flagPath(f.flag.id))}"><b>${esc(f.flag.label)} (${fmt(f.rows.length)}${f.flag.scope === "install" ? ` of ${fmt(f.universe)} full pages` : ""})</b><span>${esc(f.flag.lede)}</span></a>`).join("\n")}
        </div>
      </section>
${servicesCta("browse-hub", null, here)}`,
    items: FLAGS_LIVE.map((f) => [f.flag.label, url(flagPath(f.flag.id))]),
    footerNote: `Capability filters on ${SITE_LABEL}, read from each skill's published files.`,
  });
}

function renderFlag({ flag, rows, universe }) {
  const here = flagPath(flag.id);
  const shown = facetRows(rows);
  const best = bestOf(rows);
  const scope = flag.scope === "install" ? ` Counted among the ${fmt(universe)} skills with full pages, whose files the directory reads in full.` : "";
  browsePage({
    here,
    trail: [["directory/", "Directory"], [FEATURES_PATH, "Capabilities"], [null, flag.label]],
    title: pickTitle([`${flag.label}: Agent Skills for Claude Code`, `${flag.label}: Agent Skills`, `${flag.label} | Suede AI`], `flag ${flag.id}`),
    description: fitMeta([`${fmt(rows.length)} agent skills for Claude Code and Codex. ${flag.lede}`, `${fmt(rows.length)} agent skills for Claude Code and Codex: ${flag.label.toLowerCase()}, graded 0 to 99 and linked to source.`], `flag ${flag.id}`),
    keywords: [`${flag.label.toLowerCase()} agent skills`, `claude code skills ${flag.label.toLowerCase()}`, `${flag.label.toLowerCase()} skills for codex`],
    eyebrow: "Capability",
    h1: `${esc(flag.label)} <span class="h1-sub">agent skills</span>`,
    body: `      <p class="lead">${esc(flag.lede)}${esc(scope)}</p>
${best.length ? `      <p class="answer"><b>Highest-scoring</b> with this capability: ${listPhrase(best.map((s) => `<a href="${rel(here, skillPath(s))}">${esc(displayName(s))}</a> from ${esc(s.repo)} (${s.score}/100)`))}.</p>` : ""}
      <ul class="stat-row" aria-label="Filter size"><li><b>${fmt(rows.length)}</b> listed skills</li><li><b>${fmt(new Set(rows.map((s) => s.repo_slug)).size)}</b> repositories</li></ul>
      <section class="panel" aria-labelledby="by-cat-title">
        <h2 id="by-cat-title">By category</h2>
        ${categoryBreakdown(here, rows, "flag", flag.id)}
      </section>
      <section class="panel" aria-labelledby="all-title">
        <h2 id="all-title">${shown.ranked ? `The ${TOP_MAX} highest-scoring of ${fmt(rows.length)}` : `All ${fmt(rows.length)}`} skills</h2>
${shown.ranked ? `        <p class="muted">Ranked by Suede Skill Check score; Suede AI's own skills are not ranked. Open a category above for the full list with this filter on.</p>\n` : ""}${allTable(here, "flag-skills", shown.rows, "skills")}
      </section>
      <p><a href="${rel(here, FEATURES_PATH)}">All capabilities</a></p>
${servicesCta("browse", null, here)}`,
    items: shown.rows.map((s) => [displayName(s), listItemUrl(s)]),
    footerNote: `${esc(flag.label)}: a capability filter on ${SITE_LABEL}, read from each skill's published files.`,
  });
}

function datedTable(here, id, rows, key, label) {
  return `        <div class="table-wrap">
          <table class="skill-table" id="${id}">
            <thead><tr><th scope="col">Skill</th><th scope="col">Repository</th><th scope="col">${label}</th><th scope="col">What it does</th></tr></thead>
            <tbody>
${rows.map((s) => `            <tr ${rowData(s)}><td class="name">${listingLink(here, s)} ${gradeChip(s)}</td><td class="meta">${esc(s.repo)}</td><td><time datetime="${s[key]}">${longDate(s[key])}</time></td><td class="desc">${esc(s.featured ? s.summary : trimTo(s.description, 150))}</td></tr>`).join("\n")}
            </tbody>
          </table>
        </div>`;
}

function renderNew() {
  const here = NEW_PATH;
  const updated = RECENTLY_UPDATED.slice(0, TOP_MAX);
  const items = [...NEW_LISTINGS, ...updated.filter((s) => !NEW_LISTINGS.includes(s))];
  browsePage({
    here,
    trail: [["directory/", "Directory"], [null, "New and updated"]],
    title: pickTitle(["New Agent Skills for Claude Code and Codex", "New and Updated Agent Skills"], "new"),
    description: fitMeta([`${plural(NEW_LISTINGS.length, "new agent skill")} and ${plural(RECENTLY_UPDATED.length, "skill")} updated in the ${NEW_DAYS} days before the ${longDate(data.generated)} snapshot, graded and linked to source.`, `New and recently updated agent skills for Claude Code and Codex, graded 0 to 99 and linked to source.`], "new"),
    keywords: ["new claude code skills", "new agent skills", "latest claude skills", "recently updated agent skills"],
    eyebrow: "Suede AI Skills Directory &middot; New",
    h1: "New and updated agent skills",
    body: `      <p class="lead">What changed in the directory: skills listed for the first time in the ${NEW_DAYS} days before the ${longDate(data.generated)} snapshot, and listed skills whose repository changed in that window. Follow along with the <a href="${rel(here, FEED_PATH)}">RSS feed</a>.</p>
      <section class="panel" aria-labelledby="new-title">
        <h2 id="new-title">${plural(NEW_LISTINGS.length, "new listing")}</h2>
${NEW_LISTINGS.length ? datedTable(here, "new-skills", NEW_LISTINGS, "listed_since", "Listed") : `        <p>No skill joined the directory in this window. The next refresh adds accepted listing requests; <a href="${rel(here, "directory/submit/")}">request a listing</a>.</p>`}
      </section>
      <section class="panel" aria-labelledby="updated-title">
        <h2 id="updated-title">Recently updated</h2>
        <p class="muted">${fmt(RECENTLY_UPDATED.length)} listed skills sit in a repository with a commit in the ${NEW_DAYS} days before the snapshot${RECENTLY_UPDATED.length > TOP_MAX ? `; the ${TOP_MAX} most recent are shown` : ""}. Suede AI's own skills are listed in <a href="${rel(here, "skills/")}">their own section</a>.</p>
${datedTable(here, "updated-skills", updated, "commit_date", "Last commit")}
      </section>
${servicesCta("browse-hub", null, here)}`,
    items: items.map((s) => [displayName(s), listItemUrl(s)]),
    footerNote: `New and updated listings on ${SITE_LABEL}. Every skill belongs to its publisher and links to its source.`,
  });
}

function renderTop() {
  const here = TOP_PATH;
  const top = TOP_SKILLS[0];
  const rowsHtml = TOP_SKILLS.map((s, i) => `            <tr ${rowData(s)}><td>${i + 1}</td><td class="name">${listingLink(here, s)}</td><td class="meta">${esc(publisherName(s.owner, s.official))}${officialTag(s.official)}<br><span class="row-license">${esc(s.repo)}</span></td><td>${gradeChip(s)}</td><td>${esc(s.license)}</td><td class="desc">${esc(s.featured ? s.summary : trimTo(s.description, 150))}</td></tr>`).join("\n");
  const mostInstalled = TOP_INSTALLED[0];
  const panes = [
    TOP_INSTALLED.length ? { id: "most-installed", label: "Most installed" } : null,
    { id: "highest-scores", label: "Highest scores" },
    RISING.length ? { id: "rising", label: "Rising this week" } : null,
  ].filter(Boolean);
  const tabs = panes.length > 1 ? `      <nav class="tabs" data-tabs aria-label="Rankings">${panes.map((p, i) => `<a class="tab" href="#${p.id}"${i === 0 ? ' aria-current="true"' : ""}>${esc(p.label)}</a>`).join("")}</nav>` : "";
  const installed = TOP_INSTALLED.length ? `      <section class="board-pane" id="most-installed" data-pane aria-labelledby="most-installed-title">
        <h2 id="most-installed-title">The ${TOP_INSTALLED.length} most installed skills</h2>
        <p class="muted">${installsSource(here)} ${fmt(INSTALLS_MATCHED)} of the ${fmt(data.skills.length)} listed skills have a count there; the rest are not tracked by skills.sh. The sparkline is eight weeks of installs where skills.sh publishes it.</p>
${installChart(TOP_INSTALLED, here)}
${board(here, TOP_INSTALLED, installMetric)}
      </section>` : "";
  const rising = RISING.length ? `      <section class="board-pane" id="rising" data-pane aria-labelledby="rising-title">
        <h2 id="rising-title">Rising this week</h2>
        <p class="muted">The ${RISING.length} listed skills with the most installs in the latest week skills.sh reports, among the ${fmt(data.skills.filter((s) => installsFor(s)?.weekly?.length).length)} skills it keeps eight weeks of history for.</p>
${board(here, RISING, (s) => `${sparkline(installsFor(s).weekly)}<b>${compact(lastWeek(s))}</b> this week`)}
      </section>` : "";
  browsePage({
    here,
    trail: [["directory/", "Directory"], [null, "Top 100"]],
    title: pickTitle(["Top 100 Agent Skills: Most Installed and Highest Scored", "Top 100 Agent Skills for Claude Code, Graded", "Top 100 Agent Skills"], "top"),
    description: fitMeta([
      mostInstalled ? `The 100 most installed agent skills by skills.sh counts and the 100 highest Suede Skill Check scores. ${displayName(mostInstalled)} leads installs; ${displayName(top)} leads at ${top.score}/100.` : "",
      `The 100 highest-scoring agent skills for Claude Code and Codex. ${displayName(top)} from ${top.repo} leads at ${top.score}/100 on the Suede Skill Check.`,
      `The 100 highest-scoring agent skills for Claude Code and Codex on the Suede Skill Check, with publishers and licenses.`,
    ].filter(Boolean), "top"),
    keywords: ["top claude code skills", "top 100 agent skills", "most installed agent skills", "best agent skills ranked", "highest rated claude skills"],
    eyebrow: "Suede AI Skills Directory &middot; Top 100",
    h1: "Top 100 agent skills",
    body: `      <p class="answer">${mostInstalled ? `${esc(displayName(mostInstalled))} from ${esc(mostInstalled.repo)} is the most installed listed skill, with ${fmt(installsFor(mostInstalled).installs)} installs recorded by skills.sh as of ${longDate(INSTALLS.fetched)}. ` : ""}${esc(displayName(top))} from ${esc(top.repo)} has the highest Suede Skill Check score among third-party skills in the ${longDate(data.generated)} snapshot, at ${top.score}/100. Suede AI's own skills are not ranked.</p>
${tabs}
${installed}
      <section class="board-pane panel" id="highest-scores" data-pane aria-labelledby="top-title">
        <h2 id="top-title">The ${TOP_MAX} highest-scoring skills</h2>
        <p class="muted">Ranked by score, then by curated-list citations. Scores measure structural evidence from published files, as the <a href="${rel(here, "directory/methodology/")}#score">rubric</a> describes.</p>
        <div class="table-wrap">
          <table class="skill-table compare-table" id="top-skills">
            <thead><tr><th scope="col">Rank</th><th scope="col">Skill</th><th scope="col">Publisher</th><th scope="col">Suede Skill Check</th><th scope="col">License</th><th scope="col">What it does</th></tr></thead>
            <tbody>
${rowsHtml}
            </tbody>
          </table>
        </div>
        <p class="muted">Browse <a href="${rel(here, TASKS_PATH)}">ranked shortlists by task</a> for the best skill for a specific job.</p>
      </section>
${rising}
${servicesCta("browse-hub", null, here)}`,
    items: TOP_SKILLS.map((s) => [displayName(s), listItemUrl(s)]),
    footerNote: `Top 100 on ${SITE_LABEL}: install counts from skills.sh where published, scores from the Suede Skill Check. Every skill belongs to its publisher.`,
  });
}

function renderSaved() {
  const here = SAVED_PATH;
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Saved skills"]]);
  files.set(`${here}index.html`, page({
    here,
    canonical: false,
    robots: "noindex, follow",
    title: "Saved Skills | Suede AI Skills Directory",
    description: "Your saved agent skills from the Suede AI Skills Directory. The list stays in this browser and never leaves your device.",
    keywords: null,
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; Saved</div>
      <h1>Saved skills</h1>`,
    body: `${bc.html}
      <section class="panel" data-saved-page aria-labelledby="saved-title">
        <h2 id="saved-title">Your list</h2>
        <p class="muted">Press Save on any skill page to add it here. The list is kept in this browser only; nothing is sent to Suede AI.</p>
        <div data-saved-empty><p>No saved skills yet. <a href="${rel(here, "directory/")}">Browse the directory</a> or start from the <a href="${rel(here, TOP_PATH)}">top 100</a>.</p></div>
        <div class="table-wrap"><table class="skill-table" data-saved-table><thead><tr><th scope="col">Skill</th><th scope="col">Score</th><th scope="col">Grade</th><th scope="col">Category</th><th scope="col">License</th><th scope="col">Repository</th><th scope="col"><span class="visually-hidden">Remove</span></th></tr></thead><tbody></tbody></table></div>
        <p><button type="button" class="button secondary" data-saved-clear>Clear all</button></p>
        <details data-saved-export hidden><summary>Copy as Markdown</summary><div class="snippet"><div class="snippet-head"><span>Saved skills</span><button type="button" data-copy-target="saved-markdown">Copy list</button></div><pre><code id="saved-markdown"></code></pre></div></details>
        <noscript><p>Saving skills needs JavaScript.</p></noscript>
      </section>`,
    jsonld: [],
    footerNote: "Saved lists on the Suede AI Skills Directory stay in your browser.",
  }));
}

function renderFeed() {
  const rfc = (d) => new Date(`${d}T00:00:00Z`).toUTCString();
  const x = (s) => esc(s).replace(/'/g, "&apos;");
  const items = [
    ...GUIDES.map((g) => ({ title: g.h1, link: movedUrl(url(g.path)), date: g.date_modified || g.date_published, text: g.meta_description })),
    ...NEW_LISTINGS.map((s) => ({ title: `New listing: ${displayName(s)} from ${s.repo}`, link: movedUrl(listItemUrl(s)), date: s.listed_since, text: `${ensureSentence(s.summary || trimTo(s.description, 200))} Suede Skill Check: ${s.score}/100, grade ${s.grade}.` })),
  ].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title)).slice(0, 60);
  const last = items.length ? items[0].date : data.generated;
  files.set(FEED_PATH, `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Suede AI Skills Directory</title>
    <link>${DIRECTORY_HOST}/</link>
    <atom:link href="${DIRECTORY_HOST}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>New agent skill listings and guides from the Suede AI Skills Directory, a graded index of public Agent Skills for Claude Code, Codex and Cursor.</description>
    <language>en-us</language>
    <lastBuildDate>${rfc(last)}</lastBuildDate>
${items.map((i) => `    <item>
      <title>${x(i.title)}</title>
      <link>${x(i.link)}</link>
      <guid isPermaLink="true">${x(i.link)}</guid>
      <pubDate>${rfc(i.date)}</pubDate>
      <description>${x(i.text)}</description>
    </item>`).join("\n")}
  </channel>
</rss>
`);
}


// ------------------------------------------------------------------ security

// What the directory checks, what it leaves to the reader, and what has gone
// wrong in other registries. Every figure comes from the dataset; every
// incident cites its primary source.
const TOUCH_COLORS = { none: "#00ca52", service: "#ffb200", runs: "#ff5e63", mcp: "#50a8ff" };
const touchOf = (s) => (s.flags.includes("runs-commands") ? "runs" : s.flags.includes("mcp") ? "mcp" : s.flags.includes("api-key") || s.flags.includes("network") ? "service" : "none");
function renderSecurity() {
  const here = SECURITY_PATH;
  const trustMatrix = heroMatrixSize(featured.length);
  files.set(`${here}matrix.svg`, dotMatrix([...featured].sort((a, b) => ["none", "service", "mcp", "runs"].indexOf(touchOf(a)) - ["none", "service", "mcp", "runs"].indexOf(touchOf(b)) || b.score - a.score), { cols: trustMatrix.cols, cell: 10, dot: 8, colorOf: (s) => TOUCH_COLORS[touchOf(s)], title: `${fmt(featured.length)} full-page skills colored by what their files touch`, legend: Object.entries(TOUCH_COLORS).map(([k, c]) => [c, k]) }));
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Security"]]);
  const flag = (id) => FLAGS_LIVE.find((f) => f.flag.id === id);
  const flagLink = (id, text) => (flag(id) ? `<a href="${rel(here, flagPath(id))}">${text}</a>` : text);
  const n = (id) => fmt(flag(id)?.rows.length || 0);
  const scanners = [["getsentry/skills", "skill-scanner"], ["Tencent/AI-Infra-Guard", "aig-scanner"], ["trailofbits/skills", "codeql"]]
    .map(([repo, name]) => data.skills.find((x) => x.repo === repo && x.name === name && x.featured)).filter(Boolean);
  const cisco = EDITORIAL.projects.find((x) => x.id === "cisco-skill-scanner");
  const tracked = INSTALLS ? fmt(INSTALLS_MATCHED) : null;
  const cases = [
    { name: "ToxicSkills", who: "Snyk, February 2026", url: "https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub", text: "Snyk's researchers scanned 3,984 agent skills from ClawHub and skills.sh. Human review confirmed 76 skills with malicious payloads written into their Markdown instructions, and the audit found 1,467 skills, 36.82 percent of the set, with at least one security flaw; 13.4 percent carried critical-severity issues." },
    { name: "ClawHavoc", who: "Koi Security, early 2026", url: "https://koi.ai/blog/clawhavoc-341-malicious-clawedbot-skills-found-by-the-bot-they-were-targeting", text: "An audit of 2,857 skills on ClawHub, the OpenClaw registry, found 341 malicious skills. 335 of them posed as crypto trading tools and told macOS users to paste a command into Terminal that installed the Atomic macOS Stealer. Koi later counted 824 malicious skills as the registry passed 10,700." },
    { name: "A Claude Skill carrying MedusaLocker", who: "Cato CTRL, December 2, 2025", url: "https://www.catonetworks.com/blog/cato-ctrl-weaponizing-claude-skills-with-medusalocker", text: "A proof of concept, not an attack in the wild. Cato's researchers added a hidden helper to a copy of Anthropic's GIF creator skill. The user approved the visible script; the helper fetched and ran a ransomware payload under that same approval, which Cato calls the consent gap." },
  ];
  const checklist = [
    ["Code execution", "Dynamic code evaluation, shell spawning and pipes that run whatever arrives on them."],
    ["Network", "Hardcoded addresses, HTTP calls, sockets and DNS lookups that the skill's purpose does not explain."],
    ["File system", "Paths that climb out of the project, and reads of home, SSH or browser profile folders."],
    ["Obfuscation", "Base64 blobs, character-code strings and hex-encoded text where plain code would do."],
    ["Credentials", "Key file reads, keychain access and loops over environment variables."],
    ["Persistence", "Scheduled jobs, login items, startup scripts and service registrations."],
    ["Prompt injection", "Instructions that override the user, impersonate the system or hide text in unusual characters."],
    ["Exfiltration", "Environment variables or files sent to a URL the skill names."],
    ["Hidden helpers", "Downloads at runtime, password-protected archives and files encrypted before use."],
    ["Supply chain", "Remote scripts piped to a shell, package installs at runtime and post-install hooks."],
  ];
  const faq = faqBlock(here, [
    ["Does the directory scan skills for malware?", `No. Every listing is marked "Security scan: not scanned". The directory reads each skill's published files to check structure, license and maintenance, and on full pages it lists what those files touch, but it runs no malware scanner over third-party code and executes nothing from any repository.`],
    ["What does the Before you install panel show?", `For the ${fmt(featured.length)} skills with full pages, the refresh reads every file in the skill folder and records bundled scripts by language, commands its SKILL.md runs, environment variables its scripts read, credential names it mentions, outside hosts and HTTP clients, MCP tools, and the tool permissions its frontmatter requests. The panel on each page prints that record as of the snapshot date.`],
    ["Which skills are the safest to start with?", `Start with the ${n("no-setup")} full-page skills marked No setup required: their files read no credential, call no outside host, connect to no MCP server and run no command. They are still third-party text that an agent will follow, so read the SKILL.md first.`],
    ["How do I report a skill?", "Open a listing request on GitHub and choose a correction or removal; describe what you found and link the file. Reports about Suede AI's own skills go through the repository's security policy."],
  ]);
  const hero = pageHero(`          <div class="eyebrow">Suede AI Skills Directory &middot; Security</div>
          <div class="hero-row">${pixelIcon("trust", { size: 56, className: "pix page-icon" })}<div><h1>Security: what the directory checks, and what you should</h1></div></div>
${bc.html}
          <p class="lead">No listed skill is security scanned by the directory, and every listing says so. This page explains what the directory does check before a skill is listed, what it leaves to you, what has gone wrong in other registries, and how to review a skill in a few minutes.</p>`, `        <figure class="hero-figure" style="--figure-w:${trustMatrix.width + 22}px"><img class="matrix" src="matrix.svg" width="${trustMatrix.width}" height="${trustMatrix.height}" alt="${fmt(featured.length)} full-page skills as a grid of dots colored by what their files touch" loading="eager" decoding="async"><p class="matrix-caption"><span>Every dot is a skill whose files the directory read in full.</span><span><i style="background:${TOUCH_COLORS.none}"></i>No credential, host or command</span><span><i style="background:${TOUCH_COLORS.service}"></i>Credential or outside host</span><span><i style="background:${TOUCH_COLORS.runs}"></i>Runs commands</span><span><i style="background:${TOUCH_COLORS.mcp}"></i>MCP server</span></p></figure>`);
  const body = `
      <section class="panel" aria-labelledby="checks-title">
        <h2 id="checks-title">What is checked before a skill is listed</h2>
        <ul>
          <li><b>Structure and license.</b> Every SKILL.md passes a required frontmatter check and at least six of seven graded checks, declares a license and sits in a repository with a commit in the last year. <a href="${rel(here, "directory/methodology/")}">The full method</a>.</li>
          <li><b>Listing policy.</b> Skills whose job is to automate accounts on a social platform, work around CAPTCHAs or blocks, scrape third-party sites or collect personal data are not listed, nor are skills whose text trips the site's malware, jailbreak and adult-content filters.</li>
          <li><b>What the files touch.</b> For the ${fmt(featured.length)} skills with full pages, the refresh reads every file in the folder and publishes a Before you install panel: bundled scripts, commands in SKILL.md, environment variables read, credential names mentioned, outside hosts, MCP tools and requested tool permissions.</li>
          <li><b>Nothing runs.</b> The refresh reads files only. No script from any listed repository is executed, and no skill is installed into an agent.</li>
        </ul>
        <div class="stat-grid">
          <div class="stat"><b>${fmt(featured.length)}</b><span>skills whose files are read in full</span></div>
          <div class="stat"><b>${n("no-setup")}</b><span>${flagLink("no-setup", "read no credential, call no host, run no command")}</span></div>
          <div class="stat"><b>${n("scripts")}</b><span>${flagLink("scripts", "listed skills bundle scripts")}</span></div>
          <div class="stat"><b>${n("api-key")}</b><span>${flagLink("api-key", "read an API key or account credential")}</span></div>
          <div class="stat"><b>${n("network")}</b><span>${flagLink("network", "call outside services")}</span></div>
          <div class="stat"><b>${n("runs-commands")}</b><span>${flagLink("runs-commands", "run package managers, CLIs or other commands")}</span></div>
        </div>
        <p class="muted">Counts from the ${longDate(data.generated)} snapshot. Filters marked full pages count only the skills whose files the directory reads in full.</p>
      </section>
      <section class="panel" aria-labelledby="not-title">
        <h2 id="not-title">What is not checked</h2>
        <ul>
          <li><b>No malware scan.</b> The directory does not run a pattern scanner, a dependency audit or a sandbox over third-party skills. A listing says what the files touch, never that they are safe.</li>
          <li><b>No runtime test.</b> Scores measure structural evidence in the published files. They say nothing about what a skill does once an agent follows it.</li>
          <li><b>No certification.</b> The Suede S shields are quality badges for scores of 80 to 99 on that structural rubric. They are not a security result, and the HOL and Cisco scanners that run on Suede AI's own repository in CI do not run on the listings.</li>
        </ul>
        ${tracked ? `<p>skills.sh, which tracks ${tracked} of the listed skills, publishes audit results from several scanning partners for the skills it indexes. Each full page here links to its skills.sh page when the skill is tracked there, so you can read those results beside the directory's own record. They are third-party results and the directory does not repeat them as its own.</p>` : ""}
      </section>
      <section class="panel" aria-labelledby="cases-title">
        <h2 id="cases-title">Documented attacks on skill registries</h2>
        <p>Three reports from the last year, each linked to its source. They are the reason every listing here says what its files touch, and the reason you should read a skill before an agent does.</p>
        <div class="case-grid">
${cases.map((c) => `          <article class="case"><h3>${esc(c.name)}</h3><p class="muted">${esc(c.who)}</p><p>${esc(c.text)}</p><p><a href="${esc(c.url)}" target="_blank" rel="noopener">Read the report</a></p></article>`).join("\n")}
        </div>
      </section>
      <section class="panel" aria-labelledby="review-title">
        <h2 id="review-title">How to review a skill before you install it</h2>
        <ol class="steps">
          <li>Open the skill's page here and read the Before you install panel. Scripts, commands, credentials and outside hosts should all be explained by what the skill is for.</li>
          <li>Read SKILL.md on GitHub. It is instructions an agent will follow: look for text that tells the agent to fetch and run something, to ignore earlier rules, or to send data anywhere.</li>
          <li>Open any bundled script. Short scripts are quick to read; long or obfuscated ones deserve a scanner or a pass.</li>
          <li>Check the license and the publisher. Official publishers are marked; for everyone else, the repository's history and the curated lists that cite it are the context you have.</li>
          <li>Install into a project, not globally, and run the agent with its normal permission prompts on. Treat the first session as a test.</li>
        </ol>
        <h3>What the scanners look for</h3>
        <p>The categories below are what automated skill scanners flag. Reading for them by hand catches most of what they catch.</p>
        <div class="table-wrap"><table class="checks"><thead><tr><th scope="col">Category</th><th scope="col">Signals</th></tr></thead><tbody>
${checklist.map(([k, v]) => `          <tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("\n")}
        </tbody></table></div>
        <h3>Scanners you can run yourself</h3>
        <ul>
${cisco ? `          <li><a href="${rel(here, "directory/featured/")}#${cisco.id}">${esc(cisco.name)}</a>, a featured project: ${esc(cisco.headline)}</li>` : ""}
${scanners.map((x) => `          <li><a href="${rel(here, skillPath(x))}">${esc(displayName(x))}</a> from ${esc(x.repo)} (${x.score}/100): ${esc(ensureSentence(x.summary))}</li>`).join("\n")}
          <li>The <a href="https://github.com/hashgraph-online/ai-plugin-scanner-action" target="_blank" rel="noopener">HOL plugin scanner</a>, which runs on Suede AI's own repository in CI with the Cisco skill scanner pinned alongside it.</li>
        </ul>
      </section>
      <section class="panel" aria-labelledby="report-title">
        <h2 id="report-title">Found a problem?</h2>
        <p><a href="${ISSUE_URL}" target="_blank" rel="noopener">Open a listing request</a> and choose a correction or a removal. Describe what you found and link the file; removals take effect at the next build. For Suede AI's own skills, follow the <a href="https://github.com/JasonColapietro/suede-creator-skills/blob/main/SECURITY.md" target="_blank" rel="noopener">repository security policy</a>.</p>
      </section>
${faq.html}`;
  const title = "Agent Skill Security: What the Directory Checks";
  const description = "What the Suede AI Skills Directory checks before listing a skill, documented registry attacks, and how to review a skill yourself.";
  const keywords = setKeywords(here, ["agent skill security", "are claude skills safe", "malicious agent skills", "skill.md security scan", "review a skill before installing"]);
  files.set(`${here}index.html`, page({
    here, title, description, keywords,
    h1Html: hero,
    body,
    jsonld: [
      { "@context": "https://schema.org", "@type": "WebPage", "@id": `${url(here)}#page`, name: title, headline: "Security: what the directory checks, and what you should", description, url: url(here), dateModified: PAGE_DATE, inLanguage: "en", isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF, author: PERSON, breadcrumb: { "@id": `${url(here)}#breadcrumb` } },
      bc.ld,
      faq.ld,
    ],
    footerNote: "The Suede AI Skills Directory reads published files and executes nothing. No listing is a security result.",
  }));
}

// ------------------------------------------------------------------ stacks

// The Suede AI skill that covers a stack's task, named above the article.
function suedePick(here, st) {
  const own = data.skills.find((x) => isFirstParty(x) && x.name === st.suede.skill);
  const pagePath = `skills/${st.suede.skill}.html`;
  const hasPage = fs.existsSync(path.join(docsRoot, pagePath));
  const links = [
    hasPage ? `<a href="${rel(here, pagePath)}">Skill page</a>` : "",
    own ? `<a href="${listingHref(here, own)}">Directory listing${own.score ? ` (${own.score}/100)` : ""}</a>` : "",
    `<a href="https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/${esc(st.suede.skill)}" target="_blank" rel="noopener">Source</a>`,
  ].filter(Boolean);
  return `      <aside class="suede-first" aria-label="Suede AI's skill for this task">
        <img src="${rel(here, "assets/")}suede-ai-logo-transparent.webp" alt="" width="40" height="40">
        <p class="kicker">The Suede AI skill that covers this task</p>
        <b>${esc(st.suede.skill)}</b>
        <p>${esc(st.suede.pitch)} The article below leaves Suede AI's own skills out and recommends third-party skills only.</p>
        <p class="suede-first-links">${links.join("")}</p>
      </aside>`;
}

function renderStacksHub() {
  const here = STACKS_PATH;
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Stacks"]]);
  const hub = STACKS_DOC.hub;
  const modified = STACKS.map((st) => st.date_modified).sort().at(-1);
  const body = `${bc.html}
      <p class="lead">${esc(hub.intro)}</p>
      <div class="stack-grid">
${STACKS.map((st) => `        <a class="stack-card" href="${rel(here, stackPath(st))}">${pixelIcon("stacks", { size: 24 })}<b>${esc(st.h1)}</b><span>${esc(st.summary)}</span><span class="suede-pick">Suede pick: <code>${esc(st.suede.skill)}</code> &middot; Reviewed ${longDate(st.date_modified)}</span></a>`).join("\n")}
      </div>
      <section class="panel" aria-labelledby="how-stacks-title">
        <h2 id="how-stacks-title">How a stack is chosen</h2>
        <p>${esc(hub.method)}</p>
      </section>
${servicesCta("browse-hub", null, here)}`;
  files.set(`${here}index.html`, page({
    here, title: hub.title, description: hub.meta_description, keywords: setKeywords(here, hub.keywords || ["agent skill stacks", "best skills by task", "claude code skill stack"]),
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; Stacks</div>
      <h1>${esc(hub.h1)}</h1>`,
    body,
    jsonld: [
      { "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url(here)}#page`, name: hub.title, description: hub.meta_description, url: url(here), dateModified: modified, inLanguage: "en", isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF, author: { "@id": PERSON_ID }, breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        mainEntity: { "@type": "ItemList", numberOfItems: STACKS.length, itemListElement: STACKS.map((st, i) => ({ "@type": "ListItem", position: i + 1, name: st.h1, url: url(stackPath(st)) })) } },
      bc.ld,
    ],
    footerNote: "Recommended stacks from the Suede AI Skills Directory. Third-party skills named here belong to their publishers and link to their source.",
  }));
}

function renderStack(st) {
  const here = stackPath(st);
  const { blocks } = parseGuide(st.markdown);
  const { html, tableLinks } = renderGuideBody(blocks, (t) => guideHref(here, t));
  const bc = crumbs(here, [["directory/", "Directory"], [STACKS_PATH, "Stacks"], [null, st.h1]]);
  const others = STACKS.filter((o) => o.id !== st.id);
  const body = `${bc.html}
${guideByline({ date_modified: st.date_modified, data_snapshot: st.data_snapshot })}
${suedePick(here, st)}
      <div class="article">
${html}
      </div>
${guideFooterCta(here, { cta: { footer: "guide-footer:agency" }, business_goal: "agency", id: `stack-${st.id}` })}
${others.length ? `      <section class="panel" aria-labelledby="more-stacks-title">
        <h2 id="more-stacks-title">More stacks</h2>
        <div class="links">
${others.map((o) => `          <a class="link-row" href="${rel(here, stackPath(o))}"><b>${esc(o.h1)}</b><span>${esc(o.summary)}</span></a>`).join("\n")}
        </div>
      </section>` : ""}
      <p><a href="${rel(here, STACKS_PATH)}">All stacks</a> · <a href="${rel(here, "directory/")}">Browse the directory</a> · <a href="${rel(here, "directory/methodology/")}">How skills are scored</a></p>`;
  const jsonld = [
    { "@context": "https://schema.org", "@type": "Article", "@id": `${url(here)}#article`, headline: st.h1, name: st.title, description: st.meta_description, url: url(here),
      mainEntityOfPage: { "@type": "WebPage", "@id": url(here), breadcrumb: { "@id": `${url(here)}#breadcrumb` } },
      datePublished: st.date_published, dateModified: st.date_modified, inLanguage: "en", image: OG_IMAGE, keywords: (st.keywords || []).join(", "), author: PERSON, publisher: ORGANIZATION_PUBLISHER, isPartOf: DIRECTORY_REF },
    bc.ld,
  ];
  if (tableLinks.length) jsonld.push({ "@context": "https://schema.org", "@type": "ItemList", "@id": `${url(here)}#picks`, name: st.h1, numberOfItems: tableLinks.length, itemListElement: tableLinks.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: t.target })) });
  files.set(`${here}index.html`, page({
    here, title: st.title, description: st.meta_description, keywords: setKeywords(here, [`${st.task} skill stack`, ...(st.keywords || [])]), ogType: "article",
    h1Html: `      <div class="eyebrow">Stack &middot; ${esc(st.task)}</div>
      <h1>${esc(st.h1)}</h1>`,
    body, jsonld,
    footerNote: `A recommended stack from the Suede AI Skills Directory by ${esc(EDITORIAL_PAGES.author.name)}. Third-party skills named here belong to their publishers and link to their source.`,
  }));
}

// ------------------------------------------------------------------ kinds

function renderKind(k) {
  const here = kindPath(k);
  const bc = crumbs(here, [["directory/", "Directory"], [null, k.name]]);
  const entries = kindEntries(k);
  const entryHtml = (e) => `          <article class="kind-entry" id="${esc(e.id)}">
            <div><h3><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.name)}</a></h3><p class="kind-meta">${esc(e.repo || new URL(e.url).hostname)}${e.license ? ` &middot; ${esc(e.license)}` : ""}</p><p>${esc(e.summary)}</p></div>
            <div class="kind-side"><span class="status-chip${e.official ? " is-official" : ""}">${e.official ? "Official publisher" : "Community"}</span><span>Listed, not graded</span>${e.repo ? `<a href="https://github.com/${esc(e.repo)}" target="_blank" rel="noopener">GitHub</a>` : ""}</div>
${e.install ? `            <pre><code>${esc(e.install)}</code></pre>` : ""}
          </article>`;
  const mcpFeatured = k.id === "mcp-servers" ? [...EDITORIAL.projects, ...MEMBERS].filter((x) => /mcp/i.test(`${x.kind || ""} ${x.repo}`)) : [];
  const mcpFlag = k.id === "mcp-servers" ? FLAGS_LIVE.find((f) => f.flag.id === "mcp") : null;
  const faq = faqBlock(here, k.faq || []);
  const body = `${bc.html}
      <p class="lead">${esc(k.lead)}</p>
      <ul class="stat-row" aria-label="Kind size"><li><b>${fmt(entries.length)}</b> listed repositories</li><li><b>${fmt(entries.filter((e) => e.official).length)}</b> from official publishers</li><li><b>${k.sections.length}</b> sections</li></ul>
${(k.intro || []).map((t) => `      <p>${esc(t)}</p>`).join("\n")}
      <section class="panel" aria-labelledby="install-title">
        <h2 id="install-title">${esc(k.install.heading)}</h2>
        <p>${esc(k.install.text)}</p>
${codeBlock({ label: "Commands", key: `install-${k.id}` }, k.install.commands.join("\n"))}
        <p class="muted">Documentation: ${k.docs.map((d) => `<a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.label)}</a>`).join(" &middot; ")}</p>
      </section>
${k.sections.map((sec) => `      <section class="panel" id="${esc(sec.id)}" aria-labelledby="${esc(sec.id)}-title">
        <h2 id="${esc(sec.id)}-title">${esc(sec.name)}</h2>
        <p class="muted">${esc(sec.intro || "")}</p>
        <div class="kind-list">
${sec.entries.map(entryHtml).join("\n")}
        </div>
      </section>`).join("\n")}
${mcpFeatured.length ? `      <section class="panel" aria-labelledby="mcp-featured-title">
        <h2 id="mcp-featured-title">Featured projects built on MCP servers</h2>
        <p class="muted">Reviewed by the directory's editors, each pairing a server with the skills that know how to use it.</p>
        <div class="links">
${mcpFeatured.map((x) => `          <a class="link-row" href="${rel(here, "directory/featured/")}#${esc(x.id)}"><b>${esc(x.name)}</b><span>${esc(x.kind || "Directory member")} &middot; ${esc(x.repo)}</span></a>`).join("\n")}
        </div>
      </section>` : ""}
${mcpFlag ? `      <section class="panel" aria-labelledby="mcp-skills-title">
        <h2 id="mcp-skills-title">Skills that use an MCP server</h2>
        <p>${fmt(mcpFlag.rows.length)} listed skills with full pages connect to an MCP server or name MCP tools in their files. <a href="${rel(here, flagPath("mcp"))}">Browse them with their scores</a>.</p>
      </section>` : ""}
      <section class="panel" aria-labelledby="listing-title">
        <h2 id="listing-title">How this list is kept</h2>
        <p>Entries are added by hand from their publisher's repository, checked to exist on ${longDate(KINDS_UPDATED)}, and described from what the publisher documents. They carry no Suede Skill Check score, no security result and no verification badge: the score applies to SKILL.md skills only. To suggest a repository or a correction, <a href="${ISSUE_URL}" target="_blank" rel="noopener">open a listing request</a>.</p>
      </section>
${faq.html}`;
  const keywords = setKeywords(here, [k.name.toLowerCase(), `${k.short.toLowerCase()} directory`, ...(k.keywords || [])]);
  files.set(`${here}index.html`, page({
    here, title: k.title, description: k.meta, keywords,
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; ${esc(k.short)}</div>
      <div class="hero-row">${pixelIcon(k.id, { size: 56, className: "pix page-icon" })}<div><h1>${esc(k.h1)}</h1></div></div>`,
    body,
    jsonld: [
      { "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url(here)}#page`, name: k.title, description: k.meta, url: url(here), dateModified: PAGE_DATE, inLanguage: "en", isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF, breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        mainEntity: { "@type": "ItemList", numberOfItems: entries.length, itemListElement: entries.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.name, url: e.url })) } },
      bc.ld,
      faq.ld,
    ],
    footerNote: `${esc(k.name)} on ${SITE_LABEL}: listed from their publishers' repositories, not graded. Every entry belongs to its publisher.`,
  }));
}

// ------------------------------------------------------------------ compare, API, publishers
let GROWTH_MODULE = null;
let COMPARISON_PLAN = [];
if (GROWTH) {
  GROWTH_MODULE = await import('./directory/growth.mjs');
  const selected = JSON.parse(fs.readFileSync(path.join(repoRoot, 'directory/growth/comparisons.json'), 'utf8'));
  COMPARISON_PLAN = GROWTH_MODULE.comparisonPairs(TOPICS, installsFor, 50, selected.pairs, data.skills);
}
function staticComparisonsPanel(here) {
  return `<section class="panel"><h2>Compare skills for the same task</h2><p>Saved comparisons with score components, licenses and source links. Read any comparison without JavaScript.</p><div class="links">${COMPARISON_PLAN.map(p => `<a class="link-row" href="${rel(here, `directory/compare/skills/${p.slug}/`)}"><b>${esc(displayName(p.a))} vs ${esc(displayName(p.b))}</b><span>${esc(p.a.repo)} · ${esc(p.b.repo)} · ${esc(p.topics[0].name)}</span></a>`).join('')}</div></section>`;
}


function renderCompare() {
  const here = COMPARE_PATH;
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Compare"]]);
  const body = `${bc.html}
      <p class="lead">Pick two listed skills and read their scores by component, licenses, cost lanes, capabilities and topics side by side. The comparison runs in your browser from the directory's published index and reports; nothing you type leaves the page.</p>
      <form class="panel compare-form" data-compare data-directory="${rel(here, "directory/")}" hidden>
        <div class="compare-pick">
          <label>First skill<input name="a" type="text" list="compare-skills" placeholder="Skill name or owner/repo" autocomplete="off"></label>
          <label>Second skill<input name="b" type="text" list="compare-skills" placeholder="Skill name or owner/repo" autocomplete="off"></label>
          <label>Third skill (optional)<input name="c" type="text" list="compare-skills" placeholder="Skill name or owner/repo" autocomplete="off"></label>
        </div>
        <datalist id="compare-skills"></datalist>
        <p><button type="submit" class="button">Compare</button> <button type="button" class="button secondary" data-compare-clear>Clear</button></p>
        <p class="muted" role="status" aria-live="polite" data-compare-status>Type a skill name and pick it from the list. The picks stay in this page's address.</p>
      </form>
      <noscript><p class="panel">Comparing needs JavaScript. Without it, open two skill pages side by side; each shows the same facts.</p></noscript>
      <div data-compare-results></div>
      <section class="panel" aria-labelledby="compare-how-title">
        <h2 id="compare-how-title">What the comparison shows</h2>
        <p>Each column reads the skill's record from the ${longDate(data.generated)} snapshot: the Suede Skill Check score and the points behind it, the letter grade, the license and cost lane, the capability flags, the topics it is listed under, its repository and the dates it was listed and last changed. Ranked task pages do the same for a whole job: <a href="${rel(here, TASKS_PATH)}">skills by task</a>.</p>
      </section>${GROWTH ? staticComparisonsPanel(here) : ""}${versusPanel(here)}`;
  const title = "Compare Agent Skills Side by Side | Suede AI";
  const description = "Compare two or three listed agent skills side by side: Suede Skill Check scores by component, licenses, cost lanes, capabilities and topics.";
  files.set(`${here}index.html`, page({
    here, title, description, keywords: setKeywords(here, ["compare agent skills", "compare claude code skills", "skill comparison"]),
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; Tool</div>
      <h1>Compare skills side by side</h1>`,
    body,
    jsonld: [
      { "@context": "https://schema.org", "@type": "WebPage", "@id": `${url(here)}#page`, name: title, description, url: url(here), dateModified: PAGE_DATE, inLanguage: "en", isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF, breadcrumb: { "@id": `${url(here)}#breadcrumb` } },
      bc.ld,
    ],
    footerNote: "The comparison reads the directory's published index and reports in your browser. It stores and sends nothing.",
  }));
}

// ------------------------------------------------------------------ brand comparisons

// Live figures for the comparison copy; competitors.json never types them.
function versusValues(c) {
  return {
    skills: fmt(data.skills.length),
    repos: fmt(repos.size),
    categories: fmt(categories.length),
    full: fmt(featured.length),
    shielded: fmt(dist.shielded),
    tasks: fmt(TASKS.length),
    alternatives: fmt(ALTERNATIVES.length),
    snapshot: longDate(data.generated),
    installs_matched: INSTALLS ? fmt(INSTALLS_MATCHED) : null,
    installs_date: INSTALLS ? longDate(INSTALLS.fetched) : null,
    others: listPhrase(COMPETITORS.filter((o) => o.id !== c.id).map((o) => o.name)),
  };
}

// The Suede AI column of every comparison table, from the live dataset.
function suedeFacts() {
  const KIND_NOUNS = { plugins: "Claude Code plugins", "mcp-servers": "MCP servers", grok: "Grok bots", rules: "rules files" };
  const catalogs = [...KINDS.map((k) => KIND_NOUNS[k.id] || k.short), ...(HAS_AGENTS ? ["AI agents"] : [])];
  return {
    operator: "Suede AI, edited by Jason Colapietro",
    lists: `${fmt(data.skills.length)} agent skills from ${fmt(repos.size)} GitHub repositories in ${categories.length} categories${catalogs.length ? `, plus catalogs of ${listPhrase(catalogs)}` : ""}`,
    ranking: `Suede Skill Check score from 0 to 99 on a published 100-point rubric, with ${plural(TASKS.length, "task shortlist")}`,
    signals: `A structural listing gate, the license on every listing, a verifiable report per skill, and the scripts, credentials and network calls summarized on ${fmt(featured.length)} full pages`,
    install: "Install command on every listing for Claude Code, Codex and Cursor",
    price: "Free with no account; listing a skill is free",
  };
}
const NOT_STATED = "Not stated in the sources below";

// One competitor cell as HTML. Price always reads "Pricing varies" and links to
// the competitor's own site (owner direction, 2026-11-05); every other fact is
// the sourced text from competitors.json.
function competitorCell(c, k) {
  if (k === "price") return `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(PRICING_VARIES)}</a>`;
  return esc(c.facts[k] === null ? NOT_STATED : fillVersus(c.facts[k], versusValues(c)));
}

function suedeReasons(here) {
  return `        <ul>
          <li>Every one of the ${fmt(data.skills.length)} listings carries a Suede Skill Check score from 0 to 99, built from the skill's own files on a <a href="${rel(here, "directory/methodology/")}">published rubric</a>, with a report.json you can verify.</li>
          <li>${fmt(featured.length)} full skill pages summarize the scripts, credentials and network calls found in the skill, so you know what it touches before you install it.</li>
          <li><a href="${rel(here, TASKS_PATH)}">${plural(TASKS.length, "task shortlist")}</a> and ${plural(ALTERNATIVES.length, "alternatives page")} compare skills from different publishers that do the same job.</li>
          <li>Every listing states its license and gives the install command for Claude Code, Codex and Cursor.</li>
          <li>The <a href="${rel(here, API_PATH)}">search index, per-skill reports and RSS feed</a> are static files with no key and no account.</li>
        </ul>`;
}

const SCORE_QA = ["How does the Suede AI Skills Directory score skills?", "Every listed skill gets a Suede Skill Check score from 0 to 99, read from its published files: structure, description quality, instruction depth, bundled files, maintenance and curated-list citations. The rubric is public on the methodology page."];
const FREE_QA = ["Is the Suede AI Skills Directory free?", "Yes. Browsing, comparing and the static data files need no account, and listing a skill in the directory is free."];

function versusSources(here, list) {
  return `      <section class="panel" id="sources" aria-labelledby="sources-title">
        <h2 id="sources-title">Where do these facts come from?</h2>
${list.map((c) => `        <p>${esc(c.name)}, checked ${longDate(c.checked)}:</p>
        <ul>
${c.sources.map((s) => `          <li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join("\n")}
        </ul>`).join("\n")}
        <p>Suede AI Skills Directory figures come from the directory's ${longDate(data.generated)} snapshot and update with every refresh. <a href="${rel(here, "directory/methodology/")}">How skills are listed and scored</a>.</p>
      </section>`;
}

function versusMoreLinks(here, c, { onAlternatives }) {
  const rows = [
    onAlternatives ? [versusPath(c), `Suede AI Skills Directory vs ${c.name}`, "Side by side, with sourced facts"] : [altBrandPath(c), `${c.name} alternatives`, `${plural(COMPETITORS.length, "directory", "directories")} compared`],
    ...COMPETITORS.filter((o) => o.id !== c.id).map((o) => [versusPath(o), `Suede AI Skills Directory vs ${o.name}`, `${o.name} and the Suede AI Skills Directory, side by side`]),
    [COMPARE_PATH, "Compare skills side by side", "Pick two or three listed skills and read their scores by component"],
  ];
  return `      <section class="panel" aria-labelledby="more-title">
        <h2 id="more-title">More comparisons</h2>
        <div class="links">
${rows.map(([p, b, s]) => `          <a class="link-row" href="${rel(here, p)}"><b>${esc(b)}</b><span>${esc(s)}</span></a>`).join("\n")}
        </div>
      </section>`;
}

const fitTitle = (options, label) => {
  const t = options.find((x) => x.length >= 20 && x.length <= 60);
  if (!t) throw new Error(`${label}: no title fits 20-60 characters`);
  return t;
};

function renderVersus(c) {
  const here = versusPath(c);
  const v = versusValues(c);
  const f = (s) => fillVersus(s, v);
  const label = `Suede AI vs ${c.name}`;
  const bc = crumbs(here, [["directory/", "Directory"], [COMPARE_PATH, "Compare"], [null, label]]);
  const answer = answerWithin([f(c.vs_answer)], `versus ${c.id}`);
  const faq = faqBlock(here, [...c.faq.map(([q, a]) => [f(q), f(a)]), SCORE_QA, FREE_QA]);
  const suede = suedeFacts();
  const body = `${bc.html}
      <p class="answer" id="answer">${esc(answer)}</p>
      <section class="panel" aria-labelledby="table-title">
        <h2 id="table-title">How do the Suede AI Skills Directory and ${esc(c.name)} compare?</h2>
        <div class="table-wrap"><table class="checks" id="versus-table"><thead><tr><th scope="col">Question</th><th scope="col">Suede AI Skills Directory</th><th scope="col">${esc(c.name)}</th></tr></thead><tbody>
${FACT_ROWS.map(([k, l]) => `          <tr><th scope="row">${esc(l)}</th><td>${esc(suede[k])}</td><td>${competitorCell(c, k)}</td></tr>`).join("\n")}
        </tbody></table></div>
      </section>
      <section class="panel" aria-labelledby="what-title">
        <h2 id="what-title">What is ${esc(c.name)}?</h2>
        <p>${esc(f(c.summary))}</p>
      </section>
      <section class="panel" aria-labelledby="why-title">
        <h2 id="why-title">Why choose the Suede AI Skills Directory over ${esc(c.name)}?</h2>
        <p>${esc(f(c.angle))}</p>
${suedeReasons(here)}
        <p><a class="button" href="${rel(here, "directory/")}">Browse ${fmt(data.skills.length)} graded skills</a> <a class="button secondary" href="${rel(here, "directory/submit/")}">List your skill free</a></p>
      </section>${c.together ? `
      <section class="panel" aria-labelledby="together-title">
        <h2 id="together-title">Can you use ${esc(c.name)} and the Suede AI Skills Directory together?</h2>
        <p>${esc(f(c.together))}</p>
      </section>` : ""}
${faq.html}
${versusSources(here, [c])}
${versusMoreLinks(here, c, { onAlternatives: false })}`;
  const title = fitTitle([`Suede AI Skills Directory vs ${c.name}: Compared`, `Suede AI Skills Directory vs ${c.name}`, `Suede AI Directory vs ${c.name}`], `versus ${c.id}`);
  const description = fitMeta([f(c.vs_meta)], `versus ${c.id}`);
  const h1 = `How does the Suede AI Skills Directory compare with ${c.name}?`;
  files.set(`${here}index.html`, page({
    here, title, description,
    keywords: setKeywords(here, [`${c.name} comparison`, `${c.name} vs suede ai skills directory`, `${c.name} features`, "agent skill directory comparison", "graded agent skills directory"]),
    h1Html: `      <div class="eyebrow">Compare &middot; Suede AI Skills Directory vs ${esc(c.name)}</div>
      <h1>${esc(h1)}</h1>`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url(here)}#page`,
        name: title,
        headline: h1,
        description,
        url: url(here),
        dateModified: PAGE_DATE,
        inLanguage: "en",
        isPartOf: DIRECTORY_REF,
        publisher: PUBLISHER_REF,
        author: { "@id": PERSON_ID },
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        about: [
          { "@type": "WebSite", name: SITE_NAME, url: DIR_URL, publisher: { "@id": ORG_ID } },
          { "@type": "WebSite", name: c.name, url: c.url },
        ],
        citation: c.sources.map((s) => s.url),
      },
      bc.ld,
      faq.ld,
    ],
    footerNote: `A comparison from ${SITE_LABEL}. Facts about ${esc(c.name)} come from the public pages linked under the sources, checked ${longDate(c.checked)}.`,
  }));
}

function renderBrandAlternatives(c) {
  const here = altBrandPath(c);
  const v = versusValues(c);
  const f = (s) => fillVersus(s, v);
  const others = COMPETITORS.filter((o) => o.id !== c.id);
  const bc = crumbs(here, [["directory/", "Directory"], [COMPARE_PATH, "Compare"], [null, `${c.name} alternatives`]]);
  const answer = answerWithin([f(c.alt_answer)], `alternatives ${c.id}`);
  const ranking = c.facts.ranking ? `How ${c.name} ranks skills: ${ensureSentence(f(c.facts.ranking))} ` : "";
  const faq = faqBlock(here, [
    [`What is the best alternative to ${c.name}?`, `The Suede AI Skills Directory. It grades ${v.skills} agent skills from ${v.repos} GitHub repositories on a published 0 to 99 rubric, states each license and gives the install command for Claude Code, Codex and Cursor on every listing.`],
    [`How is the Suede AI Skills Directory different from ${c.name}?`, `${ranking}How the Suede AI Skills Directory ranks them: by the Suede Skill Check score, built from each skill's own files, with the points behind it shown on every listing.`],
    ...c.alt_faq.map(([q, a]) => [f(q), f(a)]),
    FREE_QA,
  ]);
  const suede = suedeFacts();
  const cols = FACT_ROWS.filter(([k]) => ["operator", "lists", "ranking", "price"].includes(k));
  const body = `${bc.html}
      <p class="answer" id="answer">${esc(answer)}</p>
      <section class="panel" aria-labelledby="alts-table-title">
        <h2 id="alts-table-title">Which directories are the best ${esc(c.name)} alternatives?</h2>
        <div class="table-wrap"><table class="checks" id="brand-alternatives"><thead><tr><th scope="col">Directory</th>${cols.map(([, l]) => `<th scope="col">${esc(l)}</th>`).join("")}</tr></thead><tbody>
          <tr class="compare-subject"><th scope="row"><a href="${rel(here, "directory/")}">Suede AI Skills Directory</a> <span class="tag">Top pick</span></th>${cols.map(([k]) => `<td>${esc(suede[k])}</td>`).join("")}</tr>
${others.map((o) => `          <tr><th scope="row"><a href="${rel(here, versusPath(o))}">${esc(o.name)}</a></th>${cols.map(([k]) => `<td>${competitorCell(o, k)}</td>`).join("")}</tr>`).join("\n")}
        </tbody></table></div>
        <p class="muted">${esc(c.name)} at a glance. ${cols.map(([k, l]) => `${esc(l)}: ${ensureSentence(competitorCell(c, k))}`).join(" ")} <a href="${rel(here, versusPath(c))}">Read the full comparison with the Suede AI Skills Directory</a>.</p>
      </section>
      <section class="panel" aria-labelledby="why-title">
        <h2 id="why-title">Why is the Suede AI Skills Directory the top ${esc(c.name)} alternative?</h2>
        <p>${esc(f(c.angle))}</p>
${suedeReasons(here)}
        <p><a class="button" href="${rel(here, "directory/")}">Browse ${fmt(data.skills.length)} graded skills</a> <a class="button secondary" href="${rel(here, "directory/submit/")}">List your skill free</a></p>
      </section>
${faq.html}
${versusSources(here, [c, ...others])}
${versusMoreLinks(here, c, { onAlternatives: true })}`;
  const n = COMPETITORS.length;
  const title = fitTitle([`${c.name} Alternatives: ${n} Agent Skill Directories`, `${c.name} Alternatives: ${n} Skill Directories`, `${c.name} Alternatives (2026)`], `alternatives ${c.id}`);
  const description = fitMeta([f(c.alt_meta)], `alternatives ${c.id}`);
  const h1 = `What are the best ${c.name} alternatives?`;
  files.set(`${here}index.html`, page({
    here, title, description,
    keywords: setKeywords(here, [`${c.name} alternatives`, `${c.name} alternative`, `sites like ${c.name}`, `${c.name} competitors`, "agent skill directories"]),
    h1Html: `      <div class="eyebrow">Alternatives &middot; Agent skill directories</div>
      <h1>${esc(h1)}</h1>`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${url(here)}#page`,
        name: title,
        headline: h1,
        description,
        url: url(here),
        dateModified: PAGE_DATE,
        inLanguage: "en",
        isPartOf: DIRECTORY_REF,
        publisher: PUBLISHER_REF,
        author: { "@id": PERSON_ID },
        breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        about: { "@type": "WebSite", name: c.name, url: c.url },
        mainEntity: {
          "@type": "ItemList",
          "@id": `${url(here)}#list`,
          name: `Alternatives to ${c.name}`,
          numberOfItems: 1 + others.length,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE_NAME, url: DIR_URL },
            ...others.map((o, i) => ({ "@type": "ListItem", position: i + 2, name: o.name, url: o.url })),
          ],
        },
        citation: [c, ...others].flatMap((o) => o.sources.map((s) => s.url)),
      },
      bc.ld,
      faq.ld,
    ],
    footerNote: `Alternatives to ${esc(c.name)} from ${SITE_LABEL}. Facts about each directory come from the public pages linked under the sources.`,
  }));
}

function versusPanel(here) {
  if (!COMPETITORS.length) return "";
  return `
      <section class="panel" aria-labelledby="versus-title">
        <h2 id="versus-title">How does the Suede AI Skills Directory compare with other skill directories?</h2>
        <p>Side-by-side comparisons with the directories people check next, each with sourced facts and a table of alternatives.</p>
        <div class="links">
${COMPETITORS.map((c) => `          <a class="link-row" href="${rel(here, versusPath(c))}"><b>Suede AI Skills Directory vs ${esc(c.name)}</b><span>${esc(fillVersus(c.vs_meta, versusValues(c)))}</span></a>
          <a class="link-row" href="${rel(here, altBrandPath(c))}"><b>${esc(c.name)} alternatives</b><span>${esc(fillVersus(c.alt_meta, versusValues(c)))}</span></a>`).join("\n")}
        </div>
      </section>`;
}

function renderApi() {
  const here = API_PATH;
  const bc = crumbs(here, [["directory/", "Directory"], [null, "API and data"]]);
  const host = DIRECTORY_HOST;
  const sample = featured.find((x) => x.shielded) || featured[0];
  const rows = [
    ["Search index", `${host}/search-index.json`, `One record per listed skill (${fmt(data.skills.length)}): name, repo, description, category, license, grade, score, href, full, report, lane, flags, topics, listed, updated${INSTALLS ? ", installs" : ""}.`],
    ["Skill report", `${host}/${skillPath(sample).replace(/^directory\//, "")}report.json`, "A verifiable report per listing: snapshot id and dataset hash, score by component, source revision, badges and the methodology version. Every listed skill has one at its listing path."],
    ["Quality badges", `${host}/${skillPath(sample).replace(/^directory\//, "")}score.svg`, "score.svg and badge.svg per listing. Skills scoring 80 to 99 get the numeric and letter shields; others serve the general listing badge."],
    INSTALLS ? ["Install snapshot", `${host}/installs.json`, `Install counts for ${fmt(INSTALLS_MATCHED)} listed skills as published by skills.sh, with the fetch date and the method. The directory measures no installs of its own.`] : null,
    ["Kinds", `${host}/kinds.json`, "The plugins, Grok, MCP server and rules listings as one JSON document."],
    GROWTH ? ["Finder skill", `${host}/finder/`, "Install the read-only directory search skill for Claude Code, Codex or Cursor."] : null,
    GROWTH ? ["Weekly feed", `${host}/weekly.json`, "Rising and climbing skills, topic growth, new listings and repository stars for the latest snapshots; read by the finder’s weekly briefing. Suede AI excluded."] : null,
    GROWTH ? ["State of Agent Skills", `${host}/state-of-agent-skills/data.json`, "Snapshot-based grade distribution, category and license counts, and score-component gaps; Suede AI excluded."] : null,
    ["RSS feed", `${host}/feed.xml`, "New listings and guides, RSS 2.0."],
    ["llms.txt", `${host}/llms.txt`, "The directory described for answer engines, with every browse page."],
    ["Sitemap", `${host}/sitemap.xml`, "Every indexable page with its last-modified date."],
  ].filter(Boolean);
  const body = `${bc.html}
      <p class="lead">Everything the directory publishes is a static file on this host. There is no key, no rate limit and no account; please link back to the listing when you quote a score, and name skills.sh when you quote an install count.</p>
      <section class="panel" aria-labelledby="files-title">
        <h2 id="files-title">Files</h2>
        <div class="table-wrap"><table class="checks"><thead><tr><th scope="col">File</th><th scope="col">URL</th><th scope="col">What it holds</th></tr></thead><tbody>
${rows.map(([n, u, t]) => `          <tr><td>${esc(n)}</td><td><a href="${esc(u)}">${esc(u.replace(host, ""))}</a></td><td>${esc(t)}</td></tr>`).join("\n")}
        </tbody></table></div>
      </section>
      <section class="panel" id="installs" aria-labelledby="installs-title">
        <h2 id="installs-title">Where install counts come from</h2>
        <p>${INSTALLS ? `The directory does not measure installs. <code>installs.json</code> is a snapshot of counts published by <a href="${esc(INSTALLS.source.url)}" target="_blank" rel="noopener">skills.sh</a>, which records installs made with the skills CLI (<code>npx skills add</code>) from anonymous, deduplicated telemetry as its documentation describes. The snapshot was read on ${longDate(INSTALLS.fetched)} from its public search endpoint, one query per listed repository, and its home page leaderboard for eight weeks of history. ${fmt(INSTALLS_MATCHED)} listed skills matched; skills without a count are not tracked there. The script is <a href="https://github.com/JasonColapietro/suede-creator-skills/blob/main/scripts/directory/installs.mjs" target="_blank" rel="noopener">scripts/directory/installs.mjs</a>.` : "No install snapshot is published in this build."}</p>
      </section>
      <section class="panel" aria-labelledby="score-api-title">
        <h2 id="score-api-title">Recomputing a score</h2>
        <p>Scores are computed only from published fields, so a report can be checked. <code>scripts/directory/badges.mjs</code> and <code>scripts/directory/grade.py</code> in the repository recompute the same value from <code>skills.json</code>; the <a href="${rel(here, "directory/methodology/")}#score">methodology</a> lists every component and its points.</p>
      </section>`;
  const title = "Directory API and Data: Index, Reports, Badges, Feed";
  const description = "Every file the directory publishes: the search index, per-skill reports, badges, the skills.sh install snapshot, the RSS feed and the sitemap.";
  files.set(`${here}index.html`, page({
    here, title, description, keywords: setKeywords(here, ["agent skills api", "skills directory json", "skill score api", "agent skills dataset"]),
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; Data</div>
      <h1>API and data</h1>`,
    body,
    jsonld: [
      { "@context": "https://schema.org", "@type": "WebPage", "@id": `${url(here)}#page`, name: title, description, url: url(here), dateModified: PAGE_DATE, inLanguage: "en", isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF, breadcrumb: { "@id": `${url(here)}#breadcrumb` } },
      bc.ld,
    ],
    footerNote: "The directory's data is published as static files. Scores follow the published methodology; install counts are skills.sh's.",
  }));
}

function renderPublishers() {
  const here = PUBLISHERS_PATH;
  const bc = crumbs(here, [["directory/", "Directory"], [null, "Publishers"]]);
  const list = [...repos.values()].filter((r) => r.target).map((r) => ({
    r, best: Math.max(...r.skills.map((x) => x.score)), installs: INSTALLS ? r.skills.reduce((n, x) => n + (installsFor(x)?.installs || 0), 0) : null,
  })).sort((a, b) => (b.installs || 0) - (a.installs || 0) || b.r.skills.length - a.r.skills.length || a.r.repo.toLowerCase().localeCompare(b.r.repo.toLowerCase()));
  const rowsHtml = list.map(({ r, best, installs }) => `            <tr data-name="${esc(r.repo.toLowerCase())}"><td class="name"><a href="${rel(here, r.target)}">${esc(r.repo)}</a>${officialTag(r.official)}</td><td class="meta">${esc(r.publisher)}</td><td class="num">${fmt(r.skills.length)}</td><td class="num">${best}</td>${INSTALLS ? `<td class="num">${installs ? compact(installs) : ""}</td>` : ""}<td class="desc">${r.categories.slice(0, 3).map((c) => `<a href="${rel(here, catPath(c))}">${esc(catBySlug.get(c).label)}</a>`).join(", ")}</td></tr>`).join("\n");
  const body = `${bc.html}
      <p class="lead">${fmt(list.length)} repositories publish the ${fmt(data.skills.length)} listed skills. ${fmt(list.filter((x) => x.r.official).length)} are official publishers, the companies behind the tools their skills work with.${INSTALLS ? " Install totals add up each repository's skills.sh counts." : ""}</p>
      <section class="panel" aria-labelledby="publishers-title">
        <h2 id="publishers-title">All publishers</h2>
        <div class="table-filter" hidden><label class="filter-label" for="publishers-filter">Filter by publisher or repository</label>
        <div class="search-line"><input id="publishers-filter" class="filter" type="search" placeholder="Search ${fmt(list.length)} publishers" data-filter-for="publishers" data-filter-status="publishers-status" autocomplete="off"><button type="button" data-table-clear>Clear</button></div><p id="publishers-status" class="muted" role="status" aria-live="polite"></p><p data-table-empty hidden>No matching publishers. Try fewer words or clear your search.</p></div>
        <div class="table-wrap">
          <table class="skill-table" id="publishers" data-filter-group="publishers">
            <thead><tr><th scope="col">Repository</th><th scope="col">Publisher</th><th scope="col" class="num">Skills</th><th scope="col" class="num">Best score</th>${INSTALLS ? `<th scope="col" class="num">Installs</th>` : ""}<th scope="col">Categories</th></tr></thead>
            <tbody>
${rowsHtml}
            </tbody>
          </table>
        </div>
        <p class="muted">${INSTALLS ? `Install totals come from skills.sh, read ${longDate(INSTALLS.fetched)}; repositories it does not track show no total. ` : ""}Best score is the highest Suede Skill Check score among the repository's listed skills; a repository is never averaged into a grade.</p>
      </section>
      <section class="panel" aria-labelledby="claim-title">
        <h2 id="claim-title">Publish here</h2>
        <p>Listing is free. <a href="${rel(here, "directory/submit/")}">Request a listing</a> with the repository URL; accepted repositories are read at the next refresh and every skill that passes the Suede Skill Check gets a listing, a score and README badges. Already listed? Each repository page offers its badge, and the <a href="${rel(here, CHECK_PATH)}">Skill AI-visibility check</a> shows the points a skill can still earn.</p>
      </section>
${servicesCta("browse-hub", null, here)}`;
  const title = "Agent Skill Publishers: Every Listed Repository";
  const description = `${fmt(list.length)} repositories behind the ${fmt(data.skills.length)} listed agent skills, with skill counts, best Suede Skill Check scores, official status and categories.`;
  files.set(`${here}index.html`, page({
    here, title, description, keywords: setKeywords(here, ["agent skill publishers", "claude code skill repositories", "official agent skills publishers"]),
    h1Html: `      <div class="eyebrow">Suede AI Skills Directory &middot; Publishers</div>
      <h1>Publishers</h1>`,
    body,
    jsonld: [
      { "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url(here)}#page`, name: title, description, url: url(here), dateModified: PAGE_DATE, inLanguage: "en", isPartOf: DIRECTORY_REF, publisher: PUBLISHER_REF, breadcrumb: { "@id": `${url(here)}#breadcrumb` },
        mainEntity: { "@type": "ItemList", numberOfItems: list.length, itemListElement: list.map(({ r }, i) => ({ "@type": "ListItem", position: i + 1, name: r.repo, url: url(r.target) })) } },
      bc.ld,
    ],
    footerNote: `Publishers on ${SITE_LABEL}. Every repository belongs to its publisher; the directory links to it and hosts none of its code.`,
  }));
}

// ------------------------------------------------------------------ run

let agentCounts = null;
if (fs.existsSync(path.join(repoRoot, "directory/agents.json"))) {
  const { loadAgentCatalog } = await import("./directory/agents-model.mjs");
  const { renderAgents } = await import("./directory/agents-render.mjs");
  const { loadUngradedCatalog } = await import("./directory/agents-ungraded.mjs");
  const agentModel = loadAgentCatalog(repoRoot);
  const ungraded = loadUngradedCatalog(repoRoot, agentModel.products);
  agentCounts = { products: agentModel.products.length, editions: agentModel.editions.length, ungraded: ungraded?.entries.length || 0 };
  const agentFiles = renderAgents(agentModel, { page, crumbs, rel, url, setKeywords, pageDate: PAGE_DATE, root: repoRoot, ungraded });
  for (const [key, value] of agentFiles) files.set(key, value);
}
renderHub();
renderFeaturedProjects();
renderMethodology();
renderSubmit();
renderCheck();
if (GUIDES.length) {
  renderGuidesHub();
  for (const g of GUIDES) renderGuide(g);
}
render404();
for (const c of categories) renderCategory(c);
if (TASKS.length) {
  renderTaskHub();
  for (const t of TASKS) renderTask(t);
}
for (const a of ALTERNATIVES) renderAlternatives(a);
if (TOPICS.length) renderTopicsHub();
for (const t of TOPICS) renderTopic(t);
renderPricingHub();
for (const l of LANES_LIVE) renderLane(l);
renderFeaturesHub();
for (const f of FLAGS_LIVE) renderFlag(f);
renderNew();
if (TOP_SKILLS.length) renderTop();
renderSaved();
renderFeed();
renderSecurity();
if (STACKS.length && EDITORIAL_PAGES) {
  renderStacksHub();
  for (const st of STACKS) renderStack(st);
}
for (const k of KINDS) renderKind(k);
renderCompare();
for (const c of COMPETITORS) {
  renderVersus(c);
  renderBrandAlternatives(c);
}
renderApi();
renderPublishers();
if (KINDS.length) files.set("directory/kinds.json", `${JSON.stringify({ updated: KINDS_UPDATED, kinds: KINDS.map((k) => ({ id: k.id, path: `/${k.path}/`, name: k.name, entries: kindEntries(k).map((e) => ({ id: e.id, name: e.name, repo: e.repo || null, url: e.url, publisher: e.publisher, official: Boolean(e.official), summary: e.summary, install: e.install || null, license: e.license || null })) })) }, null, 1)}\n`);
if (INSTALLS) files.set("directory/installs.json", `${JSON.stringify({ source: INSTALLS.source, fetched: INSTALLS.fetched, all_time_total: INSTALLS.all_time_total, listed_matches: INSTALLS_MATCHED, skills: Object.fromEntries(data.skills.filter((x) => installsFor(x)).map((x) => [installKey(x), installsFor(x).installs])) }, null, 1)}\n`);
for (const r of repos.values()) if (r.hasPage) renderRepo(r);
for (const s of featured) renderSkill(s);
if (GROWTH_MODULE) GROWTH_MODULE.renderGrowth({ root: repoRoot, files, data, page, crumbs, rel, url, esc, fmt, setKeywords,
  pageDate: PAGE_DATE, publisher: PUBLISHER_REF, directoryRef: DIRECTORY_REF, skillPath, listingTarget, reportPanel,
  qualityBadgeBlock, installSection, factsTable, skillTitle, servicesCta, publisherClaim, installsFor, installsDate: INSTALLS?.fetched,
  topics: TOPICS, comparisonPlan: COMPARISON_PLAN, newsletter: NEWSLETTER, skillReport });
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
if (FEATURED_BADGE) files.set("directory/badges/featured.svg", badgeSvg("featured").svg);
verifyInternalLinks();

// llms.txt carries one line about the directory, with live counts.
const llmsPath = path.join(docsRoot, "llms.txt");
const llmsLine = `- [Agent Skills Directory](${DIR_URL}): A curated index of ${fmt(data.skills.length)} public Agent Skills (${openPct}% under an open-source or open-content license) from ${repos.size} other GitHub repositories, in ${categories.length} category directories. Every listing links to the author's repository, passes the Suede Skill Check's structural listing gate, shows a 0–99 quality score and letter grade, and states its license; the ${fmt(dist.shielded)} skills scoring 80–99 offer numeric and letter README badges (either valid linked badge can qualify for verified promotion); security scan status is separately marked not scanned; full skill pages summarize the scripts, credentials and network calls found in the skill's files; [how skills are listed](${DIR_URL}methodology/). Edited by Jason Colapietro, Suede AI. Category directories:`;
// Under it, one indented line per category hub, so an answer engine can cite
// the page that matches a query ("SEO skills for Claude") instead of the hub.
const llmsCategoryLines = categories.map((c) => `  - [${c.seo_title}](${url(catPath(c.slug))}): ${fmt(skillsByCat.get(c.slug).length)} listed ${c.short} skills.`);
// Then the guides and the check, so answer engines can cite the page that
// answers a how-to or comparison question directly.
const llmsGuideLines = GUIDES.length
  ? [`- [Agent skills guides](${url(GUIDES_PATH)}): Guides by Jason Colapietro, Suede AI, built on the directory's published data:`, ...GUIDES.map((g) => `  - [${g.h1}](${url(g.path)}): ${g.meta_description}`)]
  : [];
const llmsCheckLine = `- [Skill AI-visibility check](${url(CHECK_PATH)}): A free, in-browser check for skill publishers that shows a listed skill's 0–99 score by component and its largest open points. It sends nothing to Suede AI.`;
const llmsAgents = fs.existsSync(path.join(repoRoot, "directory/agents.json")) ? [`- [AI Agents](${DIR_URL}agents/): ${agentCounts.products} products and ${agentCounts.editions} runnable repository and hosted editions, with separate documentation, repository evidence and hosted disclosure ratings /10.${agentCounts.ungraded ? ` Browse [${agentCounts.ungraded} ungraded agents](${DIR_URL}agents/ungraded/) with official sources.` : ""}`] : [];
// Then the task pages, so "best Claude Code skills for <task>" has a page to cite.
const llmsTaskLines = TASKS.length
  ? [`- [Claude Code skills by task](${url(TASKS_PATH)}): ${TASKS.length} graded shortlists, one per task, each with a comparison table and answers on install, licenses and agent support:`, ...TASKS.map((t) => `  - [Best Claude Code skills for ${t.job.topic}](${url(taskPath(t))}): ${displayName(t.rows[0])} from ${t.rows[0].repo} leads at ${t.rows[0].score}/100; ${t.rows.length} skills compared.`)]
  : [];
const llmsMoreLines = [
  `- [Security](${url(SECURITY_PATH)}): What the directory checks before listing a skill (structure, license, policy, what the files touch on ${fmt(featured.length)} full pages), three documented registry attacks with sources, and a review checklist.`,
  ...(STACKS.length ? [`- [Recommended stacks by task](${url(STACKS_PATH)}): ${plural(STACKS.length, "stack")} by Jason Colapietro, each naming the Suede AI skill for the task and recommending third-party skills only:`, ...STACKS.map((st) => `  - [${st.h1}](${url(stackPath(st))}): ${st.meta_description}`)] : []),
  ...KINDS.map((k) => `- [${k.name}](${url(kindPath(k))}): ${k.meta} ${fmt(kindEntries(k).length)} repositories, listed and not graded.`),
  `- [Publishers](${url(PUBLISHERS_PATH)}): ${fmt(repos.size)} repositories with skill counts, best scores and official status.`,
  ...(COMPETITORS.length ? [`- [Compare](${url(COMPARE_PATH)}): compare listed skills side by side, and the Suede AI Skills Directory compared with other agent skill directories:`, ...COMPETITORS.flatMap((c) => [`  - [Suede AI Skills Directory vs ${c.name}](${url(versusPath(c))}): ${fillVersus(c.vs_meta, versusValues(c))}`, `  - [${c.name} alternatives](${url(altBrandPath(c))}): ${fillVersus(c.alt_meta, versusValues(c))}`])] : []),
  `- [API and data](${url(API_PATH)}): the search index, per-skill reports, badges, ${INSTALLS ? "the install snapshot from skills.sh, " : ""}the RSS feed and the sitemap, all static files.`,
];
const llmsBrowseLines = [
  `- [Agent skills by topic](${url(TOPICS_PATH)}): ${TOPICS.length} topic pages in ${TOPIC_CONFIG.groups.length} groups, each listing every matching skill with its score, license and source:`,
  ...TOPICS.map((t) => `  - [${t.topic.name} skills](${url(topicPath(t))}): ${fmt(t.rows.length)} listed skills.`),
  `- [Skills by cost and license](${url(PRICING_PATH)}): ${LANES_LIVE.map((l) => `${l.lane.label.toLowerCase()} (${fmt(l.rows.length)})`).join(", ")}.`,
  `- [Skills by capability](${url(FEATURES_PATH)}): ${FLAGS_LIVE.length} capability filters, including official publishers, MCP servers, API keys and no-setup skills.`,
  `- [New agent skills](${url(NEW_PATH)}): ${fmt(NEW_LISTINGS.length)} skills newly listed and ${fmt(RECENTLY_UPDATED.length)} updated in the ${NEW_DAYS} days before the ${longDate(data.generated)} snapshot.`,
  `- [Top 100 agent skills](${url(TOP_PATH)}): the highest Suede Skill Check scores among third-party skills.`,
];
const llmsBlock = [llmsLine, ...llmsCategoryLines, ...llmsTaskLines, ...llmsBrowseLines, ...llmsMoreLines, ...llmsGuideLines, llmsCheckLine, ...llmsAgents].join("\n");
const llmsCurrent = fs.readFileSync(llmsPath, "utf8");
const LLMS_RE = /^- \[Agent Skills Directory\]\(.*$(?:\n  - \[.*$)*(?:\n- \[Claude Code skills by task\]\(.*$(?:\n  - \[.*$)*)?(?:\n- \[Agent skills by topic\]\(.*$(?:\n  - \[.*$)*)?(?:\n- \[Skills by cost and license\]\(.*$)?(?:\n- \[Skills by capability\]\(.*$)?(?:\n- \[New agent skills\]\(.*$)?(?:\n- \[Top 100 agent skills\]\(.*$)?(?:\n- \[[^\]]+\]\(https:\/\/skills\.suedeai\.ai\/directory\/(?:trust|stacks|plugins|grok|mcp-servers|rules|publishers|compare|api)\/\).*$(?:\n  - \[.*$)*)*(?:\n- \[Agent skills guides\]\(.*$(?:\n  - \[.*$)*)?(?:\n- \[Skill AI-visibility check\]\(.*$)?(?:\n- \[AI Agents\]\(.*$)?/m;
if (!LLMS_RE.test(llmsCurrent)) throw new Error("docs/llms.txt has no Agent Skills Directory line to keep current");
const llmsNext = llmsCurrent.replace(LLMS_RE, llmsBlock);

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
expected.set(LISTED_FILE, serializeLedger(LISTED_NEXT));
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
