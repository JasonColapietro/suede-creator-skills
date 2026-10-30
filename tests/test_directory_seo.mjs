// Template-level SEO guarantees for the generated Agent Skills Directory
// (docs/directory/, built by scripts/build-directory.mjs). Every indexable page
// must be uniquely titled and described, self-canonical, carry parseable
// JSON-LD with a breadcrumb, sit within three clicks of the hub and appear in
// the sitemap; noindex pages must stay out of it. The services module, entity
// markup, robots.txt policy and llms.txt category lines are pinned here too.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fitSentences } from "../scripts/directory/metadata.mjs";

for (const [name, text, max, expected] of [
  ["Next.js", "Builds Next.js apps. Deploys them with detailed setup instructions.", 20, "Builds Next.js apps."],
  ["domain", "Uses qdrant.tech docs. Covers performance and deployment advice.", 25, "Uses qdrant.tech docs."],
  ["filename and version", "Reads SKILL.md on Node.js v22.4.1. Checks all required fields and reports failures.", 35, "Reads SKILL.md on Node.js v22.4.1."],
  ["abbreviation", "Supports tools, e.g. Next.js and Node.js. Provides complete setup instructions.", 45, "Supports tools, e.g. Next.js and Node.js."],
  ["abbreviation cannot end a snippet", "Supports tools, e.g. Next.js and Node.js. Provides complete setup instructions.", 22, null],
  ["title", "Helps Dr. Smith write docs. Includes complete reference examples.", 12, null],
  ["quoted abbreviation", 'Uses "e.g." in prose. More follows.', 12, null],
  ["parenthesized abbreviation", "Uses examples (e.g.) in prose. More follows.", 20, null],
  ["initialism", "Explains U.S. privacy rules. Includes complete reference examples.", 15, null],
  ["quoted sentence", 'Says "ready." Deploys the app with a complete setup guide.', 15, 'Says "ready."'],
  ["punctuation", "Ready? Ship it! Detailed instructions follow for every environment.", 15, "Ready? Ship it!"],
  ["whitespace", "  Builds\napps.  Ships\tcode. More detailed instructions follow.", 24, "Builds apps. Ships code."],
  ["overlong first sentence", "Builds Next.js apps with comprehensive deployment and monitoring instructions. Short.", 30, null],
  ["unfinished sentence", "Builds Next.js applications with comprehensive setup instructions", 22, null],
  ["exact budget", "Builds apps. More instructions follow.", 12, "Builds apps."],
  ["short summary", "Builds apps", 12, "Builds apps."],
]) {
  test(`sentence fitting preserves the summary prefix: ${name}`, () => {
    assert.equal(fitSentences(text, max), expected);
  });
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(repoRoot, "docs");
const BASE = "https://skills.suedeai.ai";
const categories = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "categories.json"), "utf8"));
const cta = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "services-cta.json"), "utf8"));

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

function* indexFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* indexFiles(p);
    else if (e.name === "index.html") yield p;
  }
}

// Parse every page once; the tests below share the result.
const pages = [];
for (const file of indexFiles(path.join(docs, "directory"))) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(docs, path.dirname(file)).split(path.sep).join("/") + "/";
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || "";
  const jsonld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  // Only the content area: nav and footer links are the same on every page.
  const main = (html.match(/<main\b[\s\S]*<\/main>/) || [""])[0];
  pages.push({
    rel,
    url: `${BASE}/${rel}`,
    html,
    indexable: !/noindex/i.test(robots),
    title: decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || ""),
    description: decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ""),
    canonical: (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1],
    ogUrl: (html.match(/<meta property="og:url" content="([^"]*)"/) || [])[1],
    h1Count: (html.match(/<h1[\s>]/g) || []).length,
    jsonld,
    hrefs: [...main.matchAll(/href="([^"#?]*)/g)].map((m) => m[1]).filter((h) => h && !/^[a-z]+:/i.test(h) && !h.startsWith("/")),
  });
}
// The directory moved to suedeai.directory; the GitHub Pages copy at
// skills.suedeai.ai/directory/ names its new URL as canonical.
const moved = (u) => u.replace(`${BASE}/directory`, "https://suedeai.directory");
const byRel = new Map(pages.map((p) => [p.rel, p]));
const indexable = pages.filter((p) => p.indexable);
const parsed = (p) => p.jsonld.map((b) => JSON.parse(b));
const kindOf = (p) => {
  if (["directory/agents/", "directory/agents/ungraded/"].includes(p.rel)) return "agent-hub";
  if (["directory/agents/methodology/", "directory/agents/submit/"].includes(p.rel)) return "agent-info";
  if (p.rel.startsWith("directory/agents/")) return "agent";
  const depth = p.rel.split("/").filter(Boolean).length;
  if (p.rel === "directory/") return "hub";
  if (categories.some((c) => p.rel === `directory/${c.slug}/`)) return "category";
  if (["directory/methodology/", "directory/submit/", "directory/featured/", "directory/check/", "directory/guides/"].includes(p.rel)) return p.rel.split("/")[1];
  if (p.rel.startsWith("directory/guides/")) return "guide";
  return depth === 3 ? "repository" : "skill";
};

test("the directory has hundreds of indexable pages to check", () => {
  assert.ok(indexable.length > 500, `only ${indexable.length} indexable pages found`);
});

test("published repository pages stay indexable even with one listed skill", () => {
  const data = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "skills.json"), "utf8"));
  const counts = new Map();
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "skill";
  for (const skill of data.skills) {
    const rel = `directory/${skill.repo.split("/").map(slug).join("/")}/`;
    counts.set(rel, (counts.get(rel) || 0) + 1);
  }
  const sitemap = new Set([...fs.readFileSync(path.join(docs, "directory-sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const published = [...counts].filter(([rel]) => byRel.has(rel));
  assert.ok(published.some(([, count]) => count === 1), "exercise a published one-skill repository");
  for (const [rel, count] of published) {
    const page = byRel.get(rel);
    assert.ok(page.indexable, `${rel}: a published repository with ${count} listed skill(s) must be indexable`);
    assert.equal(page.canonical, moved(page.url), `${rel}: published repository must be canonical on suedeai.directory`);
    assert.ok(sitemap.has(page.url), `${rel}: published repository must appear in the sitemap`);
  }
});

test("every indexable page has a unique title of at most 60 characters", () => {
  const seen = new Map();
  for (const p of indexable) {
    assert.ok(p.title.length >= 20 && p.title.length <= 60, `${p.rel}: title is ${p.title.length} characters: ${p.title}`);
    seen.set(p.title.toLowerCase(), [...(seen.get(p.title.toLowerCase()) || []), p.rel]);
  }
  const dups = [...seen].filter(([, v]) => v.length > 1);
  assert.deepEqual(dups, [], `duplicate titles: ${JSON.stringify(dups.slice(0, 5))}`);
});

test("every indexable page has a unique meta description of 70 to 160 characters", () => {
  const seen = new Map();
  for (const p of indexable) {
    assert.ok(p.description.length >= 70 && p.description.length <= 160, `${p.rel}: description is ${p.description.length} characters`);
    seen.set(p.description, [...(seen.get(p.description) || []), p.rel]);
  }
  const dups = [...seen].filter(([, v]) => v.length > 1);
  assert.deepEqual(dups, [], `duplicate descriptions: ${JSON.stringify(dups.slice(0, 5))}`);
});

for (const [rel, prefix] of [
  ["directory/cloudflare/skills/nextjs-on-cloudflare/", "Builds, migrates, and deploys Next.js"],
  ["directory/qdrant/skills/qdrant-advisor/", "Diagnoses, troubleshoots, and advises on Qdrant deployments"],
]) {
  test(`generated search and social descriptions retain the capability: ${rel}`, () => {
    const p = byRel.get(rel);
    assert.ok(p.description.startsWith(prefix), p.description);
    for (const tag of ['property="og:description"', 'name="twitter:description"']) {
      const value = p.html.match(new RegExp(`<meta ${tag} content="([^"]*)"`))?.[1];
      assert.equal(decode(value || ""), p.description, tag);
    }
  });
}

test("every indexable page has one H1, a canonical on suedeai.directory, and its og:url", () => {
  for (const p of indexable) {
    assert.equal(p.h1Count, 1, `${p.rel}: ${p.h1Count} H1 elements`);
    assert.equal(p.canonical, moved(p.url), `${p.rel}: canonical ${p.canonical}`);
    assert.doesNotMatch(p.html, /http-equiv="refresh"/, `${p.rel}: a refresh would move browser sessions off the page`);
    assert.equal(p.ogUrl, p.url, `${p.rel}: og:url ${p.ogUrl}`);
  }
});

test("every indexable page carries valid JSON-LD with a breadcrumb that ends at the page", () => {
  for (const p of indexable) {
    let blocks;
    assert.doesNotThrow(() => { blocks = parsed(p); }, `${p.rel}: JSON-LD does not parse`);
    assert.ok(blocks.length >= 2, `${p.rel}: expected a page node and a BreadcrumbList`);
    for (const b of blocks) assert.equal(b["@context"], "https://schema.org", `${p.rel}: missing @context`);
    const bc = blocks.find((b) => b["@type"] === "BreadcrumbList");
    assert.ok(bc, `${p.rel}: no BreadcrumbList`);
    assert.equal(bc.itemListElement.at(-1).item, p.url, `${p.rel}: breadcrumb does not end at the page`);
    bc.itemListElement.forEach((it, i) => assert.equal(it.position, i + 1));
  }
});

test("no directory page publishes rating or review markup", () => {
  // Scores are Suede's own editorial check, not reviews of a product Suede
  // sells, so self-serving review snippets would break Google's policy.
  for (const p of pages) {
    for (const block of p.jsonld) assert.doesNotMatch(block, /"(AggregateRating|Review|Rating)"|"aggregateRating"|"review"/, `${p.rel}: rating markup`);
  }
});

test("hubs list their items and listings describe the third-party source code", () => {
  for (const p of indexable) {
    const kind = kindOf(p);
    const main = parsed(p)[0];
    if (kind === "category" || kind === "repository" || kind === "hub" || kind === "agent-hub") {
      assert.equal(main["@type"], "CollectionPage", p.rel);
      assert.equal(main.mainEntity["@type"], "ItemList", p.rel);
      assert.ok(main.mainEntity.itemListElement.length > 0, `${p.rel}: empty ItemList`);
    }
    if (kind === "agent") {
      assert.equal(main.mainEntity["@type"], "SoftwareApplication", p.rel);
      assert.ok(main.mainEntity.publisher.name, `${p.rel}: actual publisher credit`);
      assert.ok(p.html.includes(main.mainEntity.publisher.name), `${p.rel}: visible publisher credit`);
    }
    if (kind === "skill") {
      assert.equal(main.mainEntity["@type"], "SoftwareSourceCode", p.rel);
      assert.match(main.mainEntity.codeRepository, /^https:\/\/github\.com\//, p.rel);
    }
    if (kind !== "hub") assert.equal(main.publisher?.["@id"], "https://suedeai.ai/#organization", `${p.rel}: publisher`);
  }
});

test("listings keep the third-party publisher credit", () => {
  for (const p of indexable.filter((x) => kindOf(x) === "skill")) {
    const owner = p.rel.split("/")[1];
    assert.match(p.html, /<th scope="row">Publisher<\/th><td><a href="https:\/\/github\.com\/[^"]+"/, `${p.rel}: no Publisher row`);
    assert.match(p.html, /<th scope="row">Repository<\/th>/, `${p.rel}: no Repository row`);
    assert.ok(p.html.toLowerCase().includes(`agent skill &middot;`) && p.html.includes("h1-sub"), `${p.rel}: eyebrow or h1 credit missing (${owner})`);
  }
});

test("the hub declares Suede AI with sameAs, and the methodology names its author", () => {
  const hub = parsed(byRel.get("directory/"))[0];
  assert.equal(hub.publisher["@id"], "https://suedeai.ai/#organization");
  assert.equal(hub.publisher.name, "Suede AI");
  for (const u of ["https://www.wikidata.org/wiki/Q141169484", "https://suedeai.org/", "https://github.com/Suede-AI"]) assert.ok(hub.publisher.sameAs.includes(u), `hub sameAs lacks ${u}`);
  for (const rel of ["directory/", "directory/methodology/"]) {
    const graph = parsed(byRel.get(rel));
    const publisher = graph[0].publisher;
    for (const alias of ["https://suedeai.app/", "https://suedeai.agency/"]) {
      assert.ok(!publisher.sameAs.includes(alias), `${rel}: product/practice alias is not the company`);
    }
    const app = graph.find((node) => node["@id"] === "https://agents.suedeai.ai/#app");
    assert.equal(app?.["@type"], "SoftwareApplication");
    assert.equal(app.url, "https://agents.suedeai.ai");
    assert.deepEqual(app.sameAs, ["https://suedeai.app/"]);
    assert.equal(app.publisher["@id"], publisher["@id"]);
    const practice = graph.find((node) => node["@id"] === "https://seo.suedeai.ai/#organization");
    assert.equal(practice?.["@type"], "ProfessionalService");
    assert.equal(practice.url, "https://seo.suedeai.ai/");
    assert.deepEqual(practice.sameAs, ["https://suedeai.agency/"]);
    assert.equal(practice.parentOrganization["@id"], publisher["@id"]);
  }
  const method = byRel.get("directory/methodology/");
  const node = parsed(method)[0];
  assert.equal(node.author["@type"], "Person");
  assert.equal(node.author.name, "Jason Colapietro");
  assert.equal(node.author["@id"], "https://suedeai.ai/founder#person");
  assert.ok(node.author.sameAs.includes("https://www.linkedin.com/in/jasoncolapietro"));
  assert.equal(node.editor["@id"], node.author["@id"]);
  assert.match(method.html, /rel="author">Jason Colapietro<\/a>/, "visible byline matches the markup");
});

test("indexable pages are within three clicks of the hub", () => {
  const depth = new Map([["directory/", 0]]);
  const queue = ["directory/"];
  while (queue.length) {
    const rel = queue.shift();
    const p = byRel.get(rel);
    if (!p || depth.get(rel) >= 3) continue;
    for (const h of p.hrefs) {
      const target = path.posix.normalize(path.posix.join(rel, h)).replace(/\/?$/, "/");
      if (byRel.has(target) && !depth.has(target)) {
        depth.set(target, depth.get(rel) + 1);
        queue.push(target);
      }
    }
  }
  const deep = indexable.filter((p) => !depth.has(p.rel)).map((p) => p.rel);
  assert.deepEqual(deep.slice(0, 10), [], `${deep.length} indexable pages are more than three clicks from the hub`);
});

test("the sitemap lists every indexable page with its declared date and no noindex page", () => {
  // Directory URLs live in docs/directory-sitemap.xml, the source of the
  // suedeai.directory sitemap; the skills.suedeai.ai sitemap no longer lists them.
  const xml = fs.readFileSync(path.join(docs, "directory-sitemap.xml"), "utf8");
  assert.doesNotMatch(fs.readFileSync(path.join(docs, "sitemap.xml"), "utf8"), /<loc>https:\/\/skills\.suedeai\.ai\/directory\//, "skills.suedeai.ai sitemap still lists moved directory URLs");
  const entries = new Map([...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));
  for (const p of pages) {
    if (!p.indexable) {
      assert.ok(!entries.has(p.url), `noindex page in sitemap: ${p.url}`);
      continue;
    }
    assert.ok(entries.has(p.url), `missing from sitemap: ${p.url}`);
    const declared = (p.html.match(/"dateModified": "(\d{4}-\d{2}-\d{2})"/) || [])[1];
    assert.equal(entries.get(p.url), declared, `${p.url}: sitemap lastmod differs from dateModified`);
  }
});

test("the services module follows directory/services-cta.json on every placement", () => {
  const banned = /—|\bmoreover\b|\bdelve|game-changer|\bunlock|\belevate|\bseamless|\blandscape\b|\btapestry\b|it's important to note/i;
  for (const o of Object.values(cta.offers)) assert.doesNotMatch(`${o.heading} ${o.body} ${o.cta}`, banned);
  assert.doesNotMatch(cta.kicker, banned);
  assert.match(cta.offers.search.url, /^https:\/\/suedeai\.agency\//);
  assert.match(cta.offers.agents.url, /^https:\/\/suedeai\.app\//);
  for (const p of indexable) {
    const kind = kindOf(p);
    const modules = (p.html.match(/data-services-cta="/g) || []).length;
    if (!cta.enabled || !cta.placements[kind]) {
      assert.equal(modules, 0, `${p.rel}: module shown on a ${kind} page`);
      continue;
    }
    assert.equal(modules, 1, `${p.rel}: expected one services module`);
    const module = p.html.split(`data-services-cta="`)[1].split("</aside>")[0];
    assert.equal((module.match(/class="svc-card[ "]/g) || []).length, Object.keys(cta.offers).length, `${p.rel}: one card per offer`);
    for (const o of Object.values(cta.offers)) {
      assert.ok(module.includes(`href="${o.url}?utm_source=`), `${p.rel}: ${o.url} link lacks UTM tags`);
    }
    // The second card is always the plain offer; the lead card may carry a
    // routed campaign variant from the same file.
    const cards = [...module.matchAll(/data-offer="([^"]+)">\s*<h3>([^<]*)<\/h3>/g)].map((m) => ({ id: m[1], heading: decode(m[2]) }));
    assert.equal(cards[1].heading, cta.offers[cards[1].id].heading, `${p.rel}: second card is not the plain offer`);
  }
  // Every rendered CTA comes from services-cta.json, and none that awaits
  // offer confirmation reaches the live build.
  const known = new Set(cta.campaigns.flatMap((c) => c.variants.map((v) => `${c.id}:${v.id}`)));
  const held = new Set(cta.campaigns.flatMap((c) => c.variants.filter((v) => v.confirm_offer).map((v) => `${c.id}:${v.id}`)));
  for (const p of pages) {
    for (const [, tag] of p.html.matchAll(/data-cta="([^"]+)"/g)) {
      assert.ok(!held.has(tag), `${p.rel}: ${tag} waits for offer confirmation`);
      if (tag.includes(":") && !/:(plain|listed-services)$/.test(tag)) assert.ok(known.has(tag), `${p.rel}: unknown CTA ${tag}`);
      else if (!tag.includes(":")) assert.ok(cta.offers[tag], `${p.rel}: unknown offer ${tag}`);
    }
  }
  const seo = byRel.get("directory/marketing-seo/").html;
  assert.ok(seo.indexOf('data-offer="search"') < seo.indexOf('data-offer="agents"'), "marketing-seo leads with search services");
  const agents = byRel.get("directory/ai-agents-llm/").html;
  assert.ok(agents.indexOf('data-offer="agents"') < agents.indexOf('data-offer="search"'), "ai-agents-llm leads with Agent Studio");
});

test("robots.txt allows search, answer and user-triggered AI fetchers", () => {
  const robots = fs.readFileSync(path.join(docs, "robots.txt"), "utf8");
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m, "no blanket Disallow");
  for (const ua of ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User"]) {
    assert.match(robots, new RegExp(`^User-agent: ${ua}$`, "m"), `${ua} not named`);
  }
  assert.match(robots, /^Sitemap: https:\/\/skills\.suedeai\.ai\/sitemap\.xml$/m);
});

test("llms.txt points answer engines at every category directory", () => {
  const llms = fs.readFileSync(path.join(docs, "llms.txt"), "utf8");
  for (const c of categories) assert.ok(llms.includes(`](${BASE}/directory/${c.slug}/)`), `llms.txt lacks ${c.slug}`);
  assert.doesNotMatch(llms, /Suede Labs/);
});

test("the 404 page stays out of the index", () => {
  const html = fs.readFileSync(path.join(docs, "404.html"), "utf8");
  assert.match(html, /<meta name="robots" content="noindex">/);
  assert.doesNotMatch(html, /rel="canonical"/);
});

test("meta descriptions fit a result snippet and rarely end mid-sentence", () => {
  const all = indexable.filter((p) => p.description);
  const over = all.filter((p) => p.description.length > 155).map((p) => p.rel);
  assert.deepEqual(over, [], `descriptions over 155 characters: ${over.slice(0, 5).join(", ")}`);
  const repoCut = all.filter((p) => p.rel.split("/").length === 4 && p.description.includes("\u2026")).map((p) => p.rel);
  assert.deepEqual(repoCut, [], `repository descriptions cut mid-sentence: ${repoCut.slice(0, 5).join(", ")}`);
  const cut = all.filter((p) => p.description.includes("\u2026")).length;
  assert.ok(cut <= all.length * 0.1, `${cut} of ${all.length} descriptions end mid-sentence`);
});

test("repository H1s read owner/repo with a graded skill count", () => {
  const html = fs.readFileSync(path.join(docs, "directory", "anthropics", "skills", "index.html"), "utf8");
  assert.match(html, /<h1>anthropics\/skills <span class="h1-sub">\d+ graded agent skills from Anthropic<\/span><\/h1>/);
  assert.doesNotMatch(html, /agent skills by anthropics/);
});
