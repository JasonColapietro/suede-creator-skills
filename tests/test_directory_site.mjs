import './test_agents_model.mjs';
import './test_agents_site.mjs';
import './test_agents_ungraded.mjs';
// The standalone suedeai.directory build: URL rewrites and a full internal link check.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, rewriteUrl, rewriteText, rehomeWebsite, SITE_NODE, OLD, NEW } from "../scripts/build-directory-site.mjs";

const page = `${OLD}/directory/obra/superpowers/index.html`;

test("links inside the directory keep their relative form", () => {
  assert.equal(rewriteUrl("../../", page), "../../");
  assert.equal(rewriteUrl("writing-plans/#badge", page), "writing-plans/#badge");
});

test("links that leave the directory point back to skills.suedeai.ai, except shared assets", () => {
  assert.equal(rewriteUrl("../../../", page), `${OLD}/`);
  assert.equal(rewriteUrl("../../../skills/suede-seo-audit.html#run", page), `${OLD}/skills/suede-seo-audit.html#run`);
  assert.equal(rewriteUrl("../../../assets/site.css", page), "/assets/site.css");
});

test("absolute and root-absolute directory URLs move to the new host", () => {
  assert.equal(rewriteUrl(`${OLD}/directory/badge.svg`, page), `${NEW}/badge.svg`);
  assert.equal(rewriteUrl("/directory/ai-agents-llm/", `${OLD}/404.html`), "/ai-agents-llm/");
  assert.equal(rewriteUrl("directory/", `${OLD}/404.html`), "/");
  assert.equal(rewriteUrl("https://github.com/obra/superpowers", page), "https://github.com/obra/superpowers");
});

test("canonical tags, JSON-LD and search-index paths are rewritten", () => {
  const html = `<link rel="canonical" href="${OLD}/directory/obra/superpowers/"><script type="application/ld+json">{"url":"${OLD}/directory/"}</script>`;
  const out = rewriteText(html, ".html", page);
  assert.ok(out.includes(`href="${NEW}/obra/superpowers/"`));
  assert.ok(out.includes(`"url":"${NEW}/"`));
  assert.equal(rewriteText('{"href":"/directory/a/b/"}', ".json", page), '{"href":"/a/b/"}');
});

test("directory link rewrites preserve encoded queries, repeated values and fragments", () => {
  const tail = "?q=anthropics%2Fskills&pick=a&pick=b&utm_source=shared#results";
  assert.equal(rewriteUrl(`${OLD}/directory/check/${tail}`, page), `${NEW}/check/${tail}`);
  assert.equal(rewriteUrl(`/directory/check/${tail}`, page), `/check/${tail}`);
  assert.equal(rewriteUrl(`../../check/${tail}`, page), `../../check/${tail}`);
  const html = `<link rel="canonical" href="${NEW}/check/"><a href="${OLD}/directory/check/${tail}">Check</a>`;
  assert.equal(rewriteText(html, ".html", page), `<link rel="canonical" href="${NEW}/check/"><a href="${NEW}/check/${tail}">Check</a>`);
});

test("the built site has no old directory URLs and no broken internal links", () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "suedeai-directory-"));
  try {
    build(out);
    for (const f of ["index.html", "robots.txt", "sitemap.xml", "llms.txt", "404.html", "assets/site.css", "search-index.json"]) {
      assert.ok(fs.existsSync(path.join(out, f)), `missing ${f}`);
    }
    assert.match(fs.readFileSync(path.join(out, "robots.txt"), "utf8"), /^Sitemap: https:\/\/suedeai\.directory\/sitemap\.xml$/m);
    const keys = fs.readdirSync(out).filter((f) => /^[A-Za-z0-9-]{8,128}\.txt$/.test(f) && f !== "llms.txt" && f !== "robots.txt");
    assert.equal(keys.length, 1, `expected one IndexNow key file at the site root, found ${keys.join(", ") || "none"}`);
    assert.equal(fs.readFileSync(path.join(out, keys[0]), "utf8").trim(), keys[0].slice(0, -4));
    const sitemap = fs.readFileSync(path.join(out, "sitemap.xml"), "utf8");
    assert.ok(sitemap.includes(`<loc>${NEW}/</loc>`));
    assert.ok(!sitemap.includes(OLD));
    const featured = fs.readFileSync(path.join(out, 'featured/index.html'), 'utf8');
    assert.ok(sitemap.includes(`<loc>${NEW}/featured/</loc>`));
    assert.ok(featured.includes(`rel="canonical" href="${NEW}/featured/"`));
    assert.doesNotMatch(featured, /noindex/);
    const member = featured.split('id="arcmira"')[1]?.split('</article>')[0];
    assert.ok(member, 'standalone site retains the Arcmira member entry');
    assert.match(member, /Suede Directory Member/);
    assert.equal((member.match(/\/SKILL\.md"/g) || []).length, 6);
    assert.doesNotMatch(featured, /featured-badge-arcmira/);
    const broken = [];
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { walk(p); continue; }
        if (!/\.(html|json|xml|txt|js)$/.test(e.name)) continue;
        const text = fs.readFileSync(p, "utf8");
        assert.ok(!text.includes(`${OLD}/directory`), `${path.relative(out, p)} still links to ${OLD}/directory`);
        if (!e.name.endsWith(".html")) continue;
        const rel = path.relative(out, p).split(path.sep).join("/");
        if (e.name === "index.html" && !/<meta name="robots" content="[^"]*noindex/i.test(text)) {
          const canonical = `${NEW}/${rel.replace(/index\.html$/, "")}`;
          assert.equal(text.match(/<link rel="canonical" href="([^"]*)"/)?.[1], canonical, rel);
          assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), `${rel}: missing from sitemap`);
          assert.doesNotMatch(text, /http-equiv=["']refresh["']/i, `${rel}: refresh would lose shared query state`);
        }
        for (const m of text.matchAll(/\b(?:href|src|action)="([^"]*)"/g)) {
          if (!m[1] || /^(#|mailto:|tel:|data:|javascript:)/.test(m[1])) continue;
          const u = new URL(m[1], `${NEW}/${rel}`);
          if (u.origin !== NEW) continue;
          const target = path.join(out, decodeURIComponent(u.pathname));
          const ok = u.pathname.endsWith("/") ? fs.existsSync(path.join(target, "index.html")) : fs.existsSync(target) || fs.existsSync(path.join(target, "index.html"));
          if (!ok) broken.push(`${rel} -> ${u.pathname}`);
        }
      }
    };
    walk(out);
    assert.deepEqual(broken.slice(0, 10), []);
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});

test("standalone reports verify independently and match their displayed versions", async () => {
  const { createHash } = await import("node:crypto");
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "suedeai-reports-"));
  const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../docs/directory");
  const originals = new Map();
  const remember = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) remember(p);
      else if (e.name === "report.json" && JSON.parse(fs.readFileSync(p, "utf8")).kind !== "agent") originals.set(path.relative(source, p), fs.readFileSync(p, "utf8"));
    }
  };
  remember(source);
  try {
    build(out);
    const index = JSON.parse(fs.readFileSync(path.join(out, "search-index.json"), "utf8"));
    assert.ok(index.length > 0);
    assert.equal(index.length, originals.size);
    assert.deepEqual(new Set(index.map(e => e.report.slice(1))), new Set(originals.keys()));
    const htmlByPath = new Map();
    for (const entry of index) {
      const rel = entry.report.replace(/^\//, "");
      const sourceFile = path.join(source, rel);
      const before = originals.get(rel);
      const original = JSON.parse(before);
      const report = JSON.parse(fs.readFileSync(path.join(out, rel), "utf8"));
      const { report_version, ...evidence } = report;
      const expected = createHash("sha256").update(JSON.stringify(evidence)).digest("hex");
      assert.equal(report_version, expected, rel);
      assert.notEqual(report_version, original.report_version, rel);
      assert.equal(report.listing_url, NEW + entry.href);
      assert.ok(report.methodology.url.startsWith(NEW + "/"));
      for (const badge of report.badges) assert.ok(badge.src.startsWith(NEW + "/"));
      assert.deepEqual(report.snapshot, original.snapshot);
      assert.deepEqual(report.source, original.source);
      assert.deepEqual(report.quality, original.quality);
      assert.equal(report.security_scan_status, original.security_scan_status);
      const htmlPath = path.join(out, new URL(report.listing_url).pathname, "index.html");
      if (!htmlByPath.has(htmlPath)) htmlByPath.set(htmlPath, fs.readFileSync(htmlPath, "utf8"));
      const html = htmlByPath.get(htmlPath);
      if (entry.full) assert.ok(html.includes(`Report version <code>${expected.slice(0, 12)}</code>`), rel);
      assert.ok(!html.includes(`Report version <code>${original.report_version.slice(0, 12)}</code>`), rel);
      assert.equal(fs.readFileSync(sourceFile, "utf8"), before);
    }
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test("the standalone home names suedeai.directory as its own WebSite", () => {
  const html = `<script type="application/ld+json">\n    {"@type":"CollectionPage","isPartOf":{"@type":"WebSite","@id":"${OLD}/#website","name":"Suede AI Skills","url":"${OLD}/"}}\n  </script>`;
  const out = rehomeWebsite(html);
  const ld = JSON.parse(out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(ld.isPartOf, SITE_NODE);
  assert.equal(SITE_NODE["@id"], `${NEW}/#website`);
  assert.ok(!out.includes(`${OLD}/#website`));
  const other = `<script type="application/ld+json">{"@type":"WebPage"}</script>`;
  assert.equal(rehomeWebsite(other), other, "JSON-LD without the old WebSite stays byte-identical");
  const out2 = fs.mkdtempSync(path.join(os.tmpdir(), "suedeai-directory-site-"));
  try {
    build(out2);
    const home = fs.readFileSync(path.join(out2, "index.html"), "utf8");
    assert.ok(home.includes(`"@id": "${NEW}/#website"`), "home page JSON-LD names the directory WebSite");
    assert.ok(!home.includes(`${OLD}/#website`), "home page still names the skills site as its WebSite");
    const repo = fs.readFileSync(path.join(out2, "anthropics", "skills", "index.html"), "utf8");
    assert.match(repo, /<link rel="canonical" href="https:\/\/suedeai\.directory\/anthropics\/skills\/">/);
    const notFound = fs.readFileSync(path.join(out2, "404.html"), "utf8");
    assert.ok(notFound.includes("This page is not on suedeai.directory."));
    assert.ok(!notFound.includes("This page is not on skills.suedeai.ai."));
  } finally { fs.rmSync(out2, { recursive: true, force: true }); }
});
