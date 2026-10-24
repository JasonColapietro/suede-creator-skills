// The directory guides, the Skill AI-visibility check and the calls to action
// (all built by scripts/build-directory.mjs from directory/editorial/pages.json,
// directory/services-cta.json and directory/featured-projects.json). Every
// published guide must be uniquely titled, self-canonical and bylined to
// Jason Colapietro in its Article markup, and no guide, check page or CTA may
// link to an internal path that does not exist.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(root, "docs");
const BASE = "https://skills.suedeai.ai";
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const manifest = JSON.parse(read("directory/editorial/pages.json"));
const cta = JSON.parse(read("directory/services-cta.json"));
const featured = JSON.parse(read("directory/featured-projects.json"));
const published = manifest.pages.filter((g) => g.status === "published");
const pageHtml = (rel) => fs.readFileSync(path.join(docs, rel, "index.html"), "utf8");
const jsonld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// An href on a page under docs/ resolved to a file, or null for other sites.
function resolve(fromRel, href) {
  const raw = decode(href);
  if (/^(mailto|tel|javascript):/i.test(raw) || raw.startsWith("#")) return null;
  let target;
  if (/^https?:\/\//.test(raw)) {
    const u = new URL(raw);
    if (u.origin !== BASE) return null;
    target = { p: u.pathname.replace(/^\//, ""), frag: u.hash.slice(1) };
  } else {
    const [noHash, frag = ""] = raw.split("#");
    const clean = noHash.split("?")[0];
    const joined = clean.startsWith("/") ? clean.slice(1) : path.posix.normalize(path.posix.join(fromRel, clean));
    target = { p: clean === "" ? fromRel : joined === "." ? "" : joined + (clean.endsWith("/") && !joined.endsWith("/") ? "/" : ""), frag };
  }
  const file = target.p === "" || target.p.endsWith("/") ? `${target.p}index.html` : target.p;
  return { file, frag: target.frag };
}

function brokenLinks(fromRel, html) {
  const problems = [];
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    const t = resolve(fromRel, href);
    if (!t) continue;
    const abs = path.join(docs, t.file);
    if (!fs.existsSync(abs)) problems.push(`${fromRel}: ${href} -> missing ${t.file}`);
    else if (t.frag && t.file.endsWith(".html") && !fs.readFileSync(abs, "utf8").includes(`id="${t.frag}"`)) problems.push(`${fromRel}: ${href} -> no #${t.frag}`);
  }
  return problems;
}

function* indexFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* indexFiles(p);
    else if (e.name === "index.html") yield p;
  }
}

test("the editorial guides written to ship are published", () => {
  assert.ok(published.length >= 4, "every drafted guide is published");
  assert.ok(fs.existsSync(path.join(docs, "directory/guides/index.html")), "guides hub");
});

test("every guide page has a unique title, a self canonical and Article JSON-LD with its author", () => {
  const titles = new Map();
  for (const g of published) {
    const html = pageHtml(g.path);
    const title = decode(html.match(/<title>([^<]*)<\/title>/)[1]);
    assert.equal(title, g.title, `${g.id}: title from the manifest`);
    assert.ok(title.length <= 60, `${g.id}: title over 60 characters`);
    titles.set(title.toLowerCase(), [...(titles.get(title.toLowerCase()) || []), g.id]);
    assert.equal(html.match(/<link rel="canonical" href="([^"]*)"/)[1], `${BASE}/${g.path}`, `${g.id}: canonical`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${g.id}: one H1`);
    const blocks = jsonld(html);
    const article = blocks.find((b) => b["@type"] === "Article");
    assert.ok(article, `${g.id}: Article JSON-LD`);
    assert.equal(Object.hasOwn(article, "breadcrumb"), false, `${g.id}: breadcrumb belongs to the WebPage`);
    assert.equal(article.mainEntityOfPage.breadcrumb["@id"], `${BASE}/${g.path}#breadcrumb`);
    assert.equal(article.author["@type"], "Person");
    assert.equal(article.author.name, "Jason Colapietro");
    assert.equal(article.author["@id"], manifest.author["@id"]);
    assert.equal(article.publisher["@type"], "Organization");
    assert.equal(article.publisher["@id"], "https://suedeai.ai/#organization");
    assert.equal(article.publisher.name, "Suede AI");
    assert.equal(article.headline, g.h1);
    assert.equal(article.datePublished, g.date_published);
    assert.equal(article.dateModified, g.date_modified);
    assert.ok(blocks.some((b) => b["@type"] === "BreadcrumbList" && b.itemListElement.at(-1).item === `${BASE}/${g.path}`), `${g.id}: breadcrumb`);
    // Google limits FAQ rich results and the site does not mark FAQs up
    // consistently, so the FAQ stays visible and unmarked.
    assert.ok(!blocks.some((b) => b["@type"] === "FAQPage"), `${g.id}: FAQPage markup`);
    if (/^## FAQ$/m.test(read(g.source))) assert.match(html, /<section class="panel faq"/, `${g.id}: visible FAQ`);
    // Byline and Reviewed date come from the manifest, once.
    assert.equal((html.match(/rel="author">Jason Colapietro<\/a>/g) || []).length, 1, `${g.id}: one byline`);
    assert.ok(html.includes(`Reviewed <time datetime="${g.date_modified}">`), `${g.id}: Reviewed date`);
    assert.doesNotMatch(html, /—/, `${g.id}: em dash in a guide`);
  }
  const hubTitle = decode(pageHtml("directory/guides/").match(/<title>([^<]*)<\/title>/)[1]).toLowerCase();
  titles.set(hubTitle, [...(titles.get(hubTitle) || []), "hub"]);
  assert.deepEqual([...titles].filter(([, v]) => v.length > 1), [], "duplicate guide titles");
});

test("the best SEO skills guide lists its picks as an ItemList of live listings", () => {
  const g = published.find((x) => x.id === "best-seo-skills");
  const list = jsonld(pageHtml(g.path)).find((b) => b["@type"] === "ItemList");
  assert.ok(list, "ItemList");
  const rows = read(g.source).split("\n").filter((l) => /^\| [^-|]/.test(l) && /\]\(/.test(l));
  assert.equal(list.itemListElement.length, rows.length);
  list.itemListElement.forEach((it, i) => {
    assert.equal(it.position, i + 1);
    const t = resolve("", it.url);
    assert.ok(t && fs.existsSync(path.join(docs, t.file)), `${it.name}: ${it.url}`);
  });
});

test("no guide, check page or CTA links to an internal path that does not exist", () => {
  const problems = [];
  for (const rel of ["directory/guides/", "directory/check/", ...published.map((g) => g.path)]) {
    const html = pageHtml(rel);
    problems.push(...brokenLinks(rel, (html.match(/<main\b[\s\S]*<\/main>/) || [""])[0]));
  }
  let ctaBlocks = 0;
  for (const file of indexFiles(path.join(docs, "directory"))) {
    const rel = path.relative(docs, path.dirname(file)).split(path.sep).join("/") + "/";
    const html = fs.readFileSync(file, "utf8");
    for (const [block] of html.matchAll(/<aside class="panel (?:svc-cta|cta-placement)[\s\S]*?<\/aside>/g)) {
      ctaBlocks++;
      problems.push(...brokenLinks(rel, block));
    }
  }
  assert.ok(ctaBlocks > 1000, `only ${ctaBlocks} CTA blocks found`);
  assert.deepEqual(problems.slice(0, 10), [], `${problems.length} broken internal links`);
});

test("calls to action stay out of third-party descriptions, install blocks and credits", () => {
  for (const file of indexFiles(path.join(docs, "directory"))) {
    const html = fs.readFileSync(file, "utf8");
    const quote = html.match(/<blockquote class="author-quote"[\s\S]*?<\/blockquote>/)?.[0] || "";
    const install = html.match(/<section class="panel" aria-labelledby="install-title">[\s\S]*?<\/section>/)?.[0] || "";
    const before = html.match(/<section class="panel" aria-labelledby="before-title">[\s\S]*?<\/section>/)?.[0] || "";
    const facts = html.match(/<section class="panel" aria-labelledby="facts-title">[\s\S]*?<\/section>/)?.[0] || "";
    for (const part of [quote, install, before, facts]) assert.doesNotMatch(part, /suedeai\.(agency|app)|data-cta=/, path.relative(docs, file));
  }
  for (const project of featured.projects) {
    const card = pageHtml("directory/featured/").split(`id="${project.id}"`)[1].split("</article>")[0];
    assert.doesNotMatch(card, /suedeai\.(agency|app)|data-cta=/, `${project.id} card`);
  }
});

test("variants awaiting offer confirmation stay out of the live build", () => {
  const held = cta.campaigns.flatMap((c) => c.variants.filter((v) => v.confirm_offer));
  assert.ok(held.length, "fixture: at least one held variant");
  for (const rel of ["directory/check/", "directory/", "directory/marketing-seo/", ...published.map((g) => g.path)]) {
    const html = pageHtml(rel);
    for (const v of held) assert.ok(!html.includes(v.button), `${rel}: "${v.button}" is live`);
  }
});

test("each guide is linked from the pages its manifest entry names", () => {
  for (const g of published) {
    for (const entry of g.link_from) {
      const m = entry.match(/^(directory\/(?:[a-z0-9-]+\/)*)/);
      if (!m) continue;
      const html = pageHtml(m[1]);
      const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((x) => resolve(m[1], x[1])).filter(Boolean).map((t) => t.file);
      assert.ok(hrefs.includes(`${g.path}index.html`), `${m[1]} does not link to ${g.id}`);
    }
  }
});

test("the check is static: it reads only the directory's own files and collects nothing", () => {
  const html = pageHtml("directory/check/");
  const js = fs.readFileSync(path.join(docs, "directory/check/check.js"), "utf8");
  assert.doesNotMatch(html, /<form[^>]*\baction=/i, "no form posts anywhere");
  assert.doesNotMatch(html, /<input[^>]*type="(email|tel)"/i, "no personal-data fields");
  assert.doesNotMatch(js, /https?:\/\/|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie|WebSocket/, "no outside requests or storage");
  const fetches = [...js.matchAll(/fetch\((.*?)\)\.then/g)].map((m) => m[1].trim());
  assert.deepEqual(fetches, ["base + 'search-index.json'", "local(s.report)"]);
  assert.ok(fs.existsSync(path.join(docs, "directory/search-index.json")));
});

test("sitemap and llms.txt carry the guides and the check", () => {
  const sitemap = fs.readFileSync(path.join(docs, "sitemap.xml"), "utf8");
  const llms = fs.readFileSync(path.join(docs, "llms.txt"), "utf8");
  for (const rel of ["directory/guides/", "directory/check/", ...published.map((g) => g.path)]) {
    assert.ok(sitemap.includes(`<loc>${BASE}/${rel}</loc>`), `sitemap lacks ${rel}`);
    assert.ok(llms.includes(`](${BASE}/${rel})`), `llms.txt lacks ${rel}`);
  }
});

test("the featured page uses its editorial copy, nomination block and badge", () => {
  const html = pageHtml("directory/featured/");
  const page = featured.page;
  assert.equal(decode(html.match(/<title>([^<]*)<\/title>/)[1]), page.title);
  for (const text of [page.lede, page.intro, page.selection, page.nominate.headline, page.nominate.body, ...page.nominate.steps]) {
    assert.ok(decode(html).includes(text), `featured page lacks: ${text.slice(0, 40)}`);
  }
  assert.ok(html.includes(`data-cta-placement="${page.services_cta}"`), "services CTA after the projects");
  assert.ok(html.indexOf(`data-cta-placement="${page.services_cta}"`) > html.lastIndexOf("</article>"), "CTA renders after the project list");
  if (featured.featured_badge.status === "live") {
    assert.ok(fs.existsSync(path.join(docs, "directory/badges/featured.svg")));
    for (const p of featured.projects) assert.ok(decode(html).includes(featured.featured_badge.markdown_pattern.split("{id}").join(p.id)), p.id);
  }
});

test("the directory brand is Suede AI", () => {
  for (const rel of ["directory/", "directory/featured/", "directory/methodology/", "directory/submit/"]) {
    const html = pageHtml(rel);
    assert.doesNotMatch(html, /Suede Skills Directory|Suede Directory\b|Suede Labs/, rel);
  }
  assert.match(fs.readFileSync(path.join(docs, "directory/badge.svg"), "utf8"), /Suede AI Skills Directory: listed/);
});
