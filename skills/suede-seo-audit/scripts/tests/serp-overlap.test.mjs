import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

const api = await import("../lib/serp-overlap.mjs").catch(() => ({}));
const row = (keyword, urls) => ({ keyword, organic: urls.map((url, i) => ({ rank: i + 1, url })) });
const u = (name) => `https://results.test/${name}`;
function clusters(rows, options = {}) {
  assert.equal(typeof api.clusterSerpOverlap, "function", "offline SERP-overlap clustering is absent");
  return api.clusterSerpOverlap(rows, { depth: 2, threshold: 0.5, context: "Synthetic fixture, same engine/locale/device/time", ...options });
}

test("SERP overlap joins matching result URLs across seeds and preserves pair evidence", () => {
  const result = clusters([row("query alpha", [u("a"), u("b")]), row("query beta", [u("a"), u("c")]), row("query gamma", [u("x"), u("y")])]);
  assert.deepEqual(result.clusters.map((c) => c.keywords), [["query alpha", "query beta"], ["query gamma"]]);
  assert.equal(result.pairs[0].overlap, 0.5);
  assert.deepEqual(result.pairs[0].sharedUrls, [u("a")]);
  assert.equal(result.clusters[0].minimumPairOverlap, 0.5);
  assert.equal(result.clusters[1].minimumPairOverlap, null);
});

test("complete-link grouping avoids transitive chains and is stable under input reordering", () => {
  const rows = [row("a", [u("x"), u("y")]), row("b", [u("x"), u("z")]), row("c", [u("z"), u("w")])];
  const report = clusters(rows);
  assert.deepEqual(report.clusters.map((c) => c.keywords), [["a", "b"], ["c"]]);
  assert.deepEqual(clusters([...rows].reverse()), report);
});

test("short, duplicate-URL and gapped-rank samples are explicitly excluded", () => {
  const gap = row("gap", [u("a"), u("b")]); gap.organic[1].rank = 3;
  const result = clusters([row("short", [u("a")]), row("duplicate", [u("a"), `${u("a")}#section`]), gap]);
  assert.equal(result.samples.length, 0);
  assert.equal(result.excluded.length, 3);
  assert.deepEqual(result.clusters, []);
  assert.ok(result.excluded.every((r) => r.reason));
});

test("URL identity retains host, query, slash and protocol while stripping document fragments", () => {
  const result = clusters([row("a", [u("x"), u("y")]), row("b", [`${u("x")}#part`, "https://other.test/y"]), row("c", [`${u("x")}/`, `${u("y")}?v=2`]), row("d", ["http://results.test/x", "http://results.test/y"])]);
  assert.deepEqual(result.pairs.map((p) => [p.left, p.right]), [["a", "b"]]);
});

test("bad boundaries, duplicate keywords, mixed context and malformed rankings fail closed", () => {
  for (const options of [{ depth: 0 }, { depth: 101 }, { threshold: 0 }, { threshold: 1.1 }, { context: "" }]) assert.throws(() => clusters([], options));
  assert.throws(() => clusters([row("same", [u("a"), u("b")]), row(" SAME ", [u("a"), u("b")])]), /duplicate/i);
  const bad = row("bad", ["javascript:alert(1)", u("b")]);
  assert.throws(() => clusters([bad]), /URL|organic/i);
  const mixed = { ...row("mixed", [u("a"), u("b")]), collectionContext: "Another locale" };
  assert.throws(() => clusters([mixed]), /context/i);
});

test("a deeper incomplete export can still prove a fully observed top-K sample", () => {
  const input = { ...row("a", [u("a"), u("b")]), serpDepthComplete: false };
  const report = clusters([input]);
  assert.equal(report.samples.length, 1);
  assert.equal(report.samples[0].exportDepthComplete, false);
  assert.equal(report.depth, 2);
});

test("dense allowed-size inputs stop at an explicit evidence budget rather than crashing or silently sampling", () => {
  const one = Array.from({ length: 500 }, (_, i) => row(`query ${String(i).padStart(3, "0")}`, [u("shared")]));
  assert.throws(() => clusters(one, { depth: 1, threshold: 1 }), /evidence budget.*reduce|reduce.*evidence budget/i);
  const urls = Array.from({ length: 100 }, (_, i) => u(`result-${i}-${"x".repeat(60)}`));
  const dense = Array.from({ length: 100 }, (_, i) => row(`query ${i}`, urls));
  assert.throws(() => clusters(dense, { depth: 100, threshold: 1 }), /evidence budget.*reduce|reduce.*evidence budget/i);
});

test("overlap reports escape malicious keywords and describe review-only source scope", () => {
  const result = clusters([row("![x](https://evil.test)", [u("a"), u("b")])]);
  const md = api.renderSerpOverlap(result);
  assert.ok(!md.includes("![x]("));
  assert.match(md, /user-supplied|User-supplied/);
  assert.match(md, /No requests/);
});
