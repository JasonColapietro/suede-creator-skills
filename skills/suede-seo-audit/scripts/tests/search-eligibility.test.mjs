import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parsePage, runAudit, renderAudit } from "../lib/audit.mjs";

const scripts = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://example.test";
const page = (head = "", body = "", route = "/page") =>
  parsePage(`<html><head><title>Useful page</title>${head}</head><body><h1>Useful page</h1><p>Plain answer.</p>${body}</body></html>`, `${origin}${route}`);
const ld = (data) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
const row = (p) => runAudit([p]).eligibility[0];
const codes = (r) => r.issues.map((i) => i.code);

test("robots meta in the body is honored as Google Search does", () => {
  const p = page("", '<meta name="robots" content="noindex">');
  assert.equal(p.technical.noindex, true);
  assert.equal(p.technical.robots.length, 1);
  assert.ok(codes(row(p)).includes("robots-outside-head"));
  assert.ok(!codes(row(page('<meta name="robots" content="noindex">'))).includes("robots-outside-head"));
  const en = `${origin}/en`, fr = `${origin}/fr`;
  const alt = `<link rel="alternate" hreflang="en" href="${en}"><link rel="alternate" hreflang="fr" href="${fr}">`;
  const pages = [parsePage(`<head>${alt}</head><body>x</body>`, en), parsePage(`<head>${alt}</head><body><meta name="googlebot" content="noindex">x</body>`, fr)];
  assert.ok(runAudit(pages).hreflang[0].issues.some((i) => i.code === "target-noindex"));
});

test("retired rich result markup is reported once per feature, including @graph and full type URLs", () => {
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "https://schema.org/FAQPage", mainEntity: [] }, { "@type": "FAQPage" },
    { "@type": "HowTo", name: "Glaze a bowl" }, { "@type": "Quiz" }, { "@type": "ClaimReview" }, { "@type": "SpecialAnnouncement" },
    { "@type": "WebSite", url: `${origin}/`, potentialAction: [{ "@type": "SearchAction", target: `${origin}/s?q={q}` }] },
    { "@type": "Occupation", name: "Potter", estimatedSalary: { "@type": "MonetaryAmountDistribution" } },
  ] };
  const found = row(page(ld(graph))).issues.filter((i) => i.code === "retired-rich-result").map((i) => i.target);
  assert.deepEqual(found.sort(), ["ClaimReview", "FAQPage", "HowTo", "Occupation", "Quiz", "SpecialAnnouncement", "WebSite"]);
  const supported = [{ "@type": "Product", name: "Bowl" }, { "@type": "WebSite", url: `${origin}/` }, { "@type": "Occupation", name: "Potter" }, { "@type": "Article", headline: "Bowl care" }];
  assert.ok(!codes(row(page(ld(supported)))).includes("retired-rich-result"));
  assert.ok(row(page(ld({ "@type": "FAQPage" }))).issues.every((i) => i.severity === "info"));
});

test("nosnippet and max-snippet:0 are flagged; ordinary snippet limits are not", () => {
  for (const content of ["nosnippet", "index, NoSnippet", "max-snippet:0", "max-snippet: 0"]) {
    assert.ok(codes(row(page(`<meta name="googlebot" content="${content}">`))).includes("snippet-restricted"), content);
  }
  for (const content of ["max-snippet:-1", "max-snippet:50", "index, follow", "max-image-preview:large"]) {
    assert.ok(!codes(row(page(`<meta name="robots" content="${content}">`))).includes("snippet-restricted"), content);
  }
  const r = row(page("", "<p data-nosnippet>Private note.</p><div data-nosnippet=\"\">x</div>"));
  assert.equal(r.issues.find((i) => i.code === "data-nosnippet-review").message.startsWith("2 "), true);
});

test("back-button trap pattern is a review warning; routing-only or inert scripts are not", () => {
  const trap = row(page("", '<script>history.pushState(null,"",location.href);window.onpopstate=()=>{location.href="/offer"};</script>'));
  const finding = trap.issues.find((i) => i.code === "back-button-review");
  assert.equal(finding.severity, "warn");
  assert.match(finding.remediation, /third-party/);
  for (const body of [
    '<script>history.pushState({}, "", "/next");</script>',
    '<script>window.addEventListener("popstate", render);</script>',
    '<script type="text/template">history.pushState(); popstate</script>',
    '<!-- <script>history.pushState(); onpopstate</script> -->',
    '<script src="/app.js"></script>',
  ]) assert.ok(!codes(row(page("", body))).includes("back-button-review"), body);
  const counts = row(page('<script src="https://ads.example.test/a.js"></script>' + ld({ "@type": "Article" }), "<script>let a = 1;</script>"));
  assert.equal(counts.externalScripts, 1);
  assert.equal(counts.inlineScripts, 1);
});

test("Googlebot 2MB fetch limit: oversize pages name what falls past the cutoff", () => {
  const filler = `<p>${"a".repeat(2_000_100)}</p>`;
  const over = page('<link rel="canonical" href="https://example.test/page">', filler + ld({ "@type": "Article", headline: "Late" }) + "<h2>Late section</h2>");
  const finding = row(over).issues.find((i) => i.code === "fetch-limit-exceeded");
  assert.equal(finding.severity, "error");
  assert.ok(finding.message.includes("JSON-LD"));
  assert.ok(finding.message.includes("headings"));
  assert.ok(!finding.message.includes("canonical"));
  assert.equal(row(page("", `<p>${"a".repeat(1_600_000)}</p>`)).issues[0].code, "fetch-limit-review");
  assert.ok(!codes(row(page())).some((c) => c.startsWith("fetch-limit")));
  const multibyte = page("", `<p>${"é".repeat(1_000_100)}</p>`);
  assert.ok(multibyte.technical.fetchBudget.bytes > 2_000_000);
});

test("report section states unmeasured scope and escapes untrusted text", () => {
  const md = renderAudit(runAudit([page(ld({ "@type": "FAQPage" }), "<script>history.pushState(1);onpopstate=1</script>", "/a|b")]));
  const section = md.split("## 11. Search eligibility")[1];
  assert.ok(section);
  assert.match(section, /Search generative AI control/);
  assert.match(section, /not a spam verdict/);
  assert.ok(!section.includes("/a|b"));
});

test("CLI eligibility fixture produces the new findings without any network call", () => {
  const root = mkdtempSync(path.join(tmpdir(), "seo-eligibility-"));
  try {
    const out = path.join(root, "run");
    const r = spawnSync(process.execPath, [path.join(scripts, "seo-review.mjs"), "audit", "--input", path.join(scripts, "fixtures", "eligibility.json"), "--out", out], { encoding: "utf8", cwd: scripts });
    assert.equal(r.status, 0, r.stderr);
    const report = JSON.parse(readFileSync(path.join(out, "seo-audit.json"), "utf8"));
    const [care, old] = report.eligibility;
    assert.deepEqual(codes(care).sort(), ["back-button-review", "retired-rich-result", "retired-rich-result"]);
    assert.equal(care.externalScripts, 1);
    assert.deepEqual(codes(old).sort(), ["data-nosnippet-review", "robots-outside-head", "snippet-restricted"]);
    const snapshot = JSON.parse(readFileSync(path.join(out, "metadata-snapshot.json"), "utf8"));
    assert.equal(snapshot.pages.find((p) => p.url.endsWith("/old-offer")).metadata.noindex, true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
