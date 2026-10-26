// The standalone suedeai.directory build: URL rewrites and a full internal link check.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, rewriteUrl, rewriteText, OLD, NEW } from "../scripts/build-directory-site.mjs";

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
      else if (e.name === "report.json") originals.set(path.relative(source, p), fs.readFileSync(p, "utf8"));
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
