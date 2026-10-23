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
const byRel = new Map(pages.map((p) => [p.rel, p]));
const indexable = pages.filter((p) => p.indexable);
const parsed = (p) => p.jsonld.map((b) => JSON.parse(b));
const kindOf = (p) => {
  const depth = p.rel.split("/").filter(Boolean).length;
  if (p.rel === "directory/") return "hub";
  if (categories.some((c) => p.rel === `directory/${c.slug}/`)) return "category";
  if (["directory/methodology/", "directory/submit/", "directory/featured/"].includes(p.rel)) return p.rel.split("/")[1];
  return depth === 3 ? "repository" : "skill";
};

test("the directory has hundreds of indexable pages to check", () => {
  assert.ok(indexable.length > 500, `only ${indexable.length} indexable pages found`);
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

test("every indexable page has one H1 and a self-referencing canonical and og:url", () => {
  for (const p of indexable) {
    assert.equal(p.h1Count, 1, `${p.rel}: ${p.h1Count} H1 elements`);
    assert.equal(p.canonical, p.url, `${p.rel}: canonical ${p.canonical}`);
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
    if (kind === "category" || kind === "repository" || kind === "hub") {
      assert.equal(main["@type"], "CollectionPage", p.rel);
      assert.equal(main.mainEntity["@type"], "ItemList", p.rel);
      assert.ok(main.mainEntity.itemListElement.length > 0, `${p.rel}: empty ItemList`);
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
  for (const u of ["https://suedeai.agency/", "https://suedeai.app/", "https://github.com/Suede-AI"]) assert.ok(hub.publisher.sameAs.includes(u), `hub sameAs lacks ${u}`);
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
  const xml = fs.readFileSync(path.join(docs, "sitemap.xml"), "utf8");
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
    for (const o of Object.values(cta.offers)) {
      assert.ok(p.html.includes(o.heading.replace(/&/g, "&amp;")), `${p.rel}: missing "${o.heading}"`);
      assert.ok(p.html.includes(`href="${o.url}?utm_source=`), `${p.rel}: ${o.url} link lacks UTM tags`);
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
