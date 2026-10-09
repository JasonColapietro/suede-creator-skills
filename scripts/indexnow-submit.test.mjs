import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  ENDPOINT, chunk, collectUrls, main, parseArgs, readKey, submitSite,
} from "./indexnow-submit.mjs";

const KEY = "0123456789abcdef0123456789abcdef";
const quiet = { log() {}, warn() {}, error() {} };

function response(status, body = "") {
  return { ok: status >= 200 && status < 300, status, text: async () => body };
}

/** A fake network: GETs answer from `pages`, POSTs to IndexNow are recorded. */
function fakeFetch(pages, postStatus = 200) {
  const posts = [];
  const impl = async (url, init = {}) => {
    if (init.method === "POST") {
      assert.equal(url, ENDPOINT);
      posts.push(JSON.parse(init.body));
      return response(postStatus);
    }
    return url in pages ? response(200, pages[url]) : response(404);
  };
  return { impl, posts };
}

const urlset = (...urls) => `<urlset>${urls.map((u) => `<url><loc>${u}</loc></url>`).join("")}</urlset>`;

test("collects same-host URLs from a urlset and drops off-host ones", async () => {
  const { impl } = fakeFetch({
    "https://example.com/sitemap.xml": urlset("https://example.com/", "https://example.com/a", "https://other.com/x", "https://example.com/a"),
  });
  const { urls, offHost } = await collectUrls(impl, "https://example.com", ["/sitemap.xml"]);
  assert.deepEqual(urls, ["https://example.com/", "https://example.com/a"]);
  assert.deepEqual(offHost, ["https://other.com/x"]);
});

test("follows a sitemap index one level, same host only", async () => {
  const { impl } = fakeFetch({
    "https://example.com/sitemap.xml": "<sitemapindex><sitemap><loc>https://example.com/s1.xml</loc></sitemap><sitemap><loc>https://cdn.other.com/s2.xml</loc></sitemap></sitemapindex>",
    "https://example.com/s1.xml": urlset("https://example.com/one", "https://example.com/two"),
  });
  const { urls, offHost } = await collectUrls(impl, "https://example.com", ["/sitemap.xml"]);
  assert.deepEqual(urls, ["https://example.com/one", "https://example.com/two"]);
  assert.deepEqual(offHost, ["https://cdn.other.com/s2.xml"]);
});

test("refuses to post when the live key file does not match", async () => {
  const { impl, posts } = fakeFetch({
    "https://example.com/sitemap.xml": urlset("https://example.com/"),
    [`https://example.com/${KEY}.txt`]: "a-different-key",
  });
  await assert.rejects(
    submitSite({ fetchImpl: impl, origin: "https://example.com", sitemaps: ["/sitemap.xml"], key: KEY, keyName: `${KEY}.txt`, log: quiet }),
    /does not serve the key/,
  );
  assert.equal(posts.length, 0);
});

test("refuses to post when the key file is not deployed", async () => {
  const { impl, posts } = fakeFetch({ "https://example.com/sitemap.xml": urlset("https://example.com/") });
  await assert.rejects(
    submitSite({ fetchImpl: impl, origin: "https://example.com", sitemaps: ["/sitemap.xml"], key: KEY, keyName: `${KEY}.txt`, log: quiet }),
    /not reachable/,
  );
  assert.equal(posts.length, 0);
});

test("posts host, key, keyLocation and the URL list", async () => {
  const { impl, posts } = fakeFetch({
    "https://example.com/sitemap.xml": urlset("https://example.com/", "https://example.com/b"),
    [`https://example.com/${KEY}.txt`]: KEY,
  });
  const result = await submitSite({ fetchImpl: impl, origin: "https://example.com", sitemaps: ["/sitemap.xml"], key: KEY, keyName: `${KEY}.txt`, log: quiet });
  assert.equal(result, "submitted");
  assert.deepEqual(posts, [{
    host: "example.com",
    key: KEY,
    keyLocation: `https://example.com/${KEY}.txt`,
    urlList: ["https://example.com/", "https://example.com/b"],
  }]);
});

test("a dry run sends nothing and does not need the live key", async () => {
  const { impl, posts } = fakeFetch({ "https://example.com/sitemap.xml": urlset("https://example.com/") });
  const result = await submitSite({ fetchImpl: impl, origin: "https://example.com", sitemaps: ["/sitemap.xml"], key: KEY, keyName: `${KEY}.txt`, dryRun: true, log: quiet });
  assert.equal(result, "dry-run");
  assert.equal(posts.length, 0);
});

test("429 is treated as busy, other errors as broken", async () => {
  const pages = {
    "https://example.com/sitemap.xml": urlset("https://example.com/"),
    [`https://example.com/${KEY}.txt`]: KEY,
  };
  const busy = fakeFetch(pages, 429);
  assert.equal(await submitSite({ fetchImpl: busy.impl, origin: "https://example.com", sitemaps: ["/sitemap.xml"], key: KEY, keyName: `${KEY}.txt`, log: quiet }), "throttled");
  const broken = fakeFetch(pages, 422);
  await assert.rejects(
    submitSite({ fetchImpl: broken.impl, origin: "https://example.com", sitemaps: ["/sitemap.xml"], key: KEY, keyName: `${KEY}.txt`, log: quiet }),
    /answered 422/,
  );
});

test("an empty sitemap is an error, not a silent success", async () => {
  const { impl } = fakeFetch({ "https://example.com/sitemap.xml": "<urlset></urlset>" });
  await assert.rejects(
    submitSite({ fetchImpl: impl, origin: "https://example.com", sitemaps: ["/sitemap.xml"], key: KEY, keyName: `${KEY}.txt`, dryRun: true, log: quiet }),
    /listed no URLs/,
  );
});

test("chunks at the 10,000 URL request ceiling", () => {
  const list = Array.from({ length: 20001 }, (_, i) => i);
  assert.deepEqual(chunk(list).map((c) => c.length), [10000, 10000, 1]);
});

test("the key file must hold exactly its own key", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "indexnow-"));
  const good = path.join(dir, `${KEY}.txt`);
  writeFileSync(good, KEY);
  assert.deepEqual(readKey(good), { key: KEY, name: `${KEY}.txt` });
  const bad = path.join(dir, "abcdefgh1234.txt");
  writeFileSync(bad, "something-else");
  assert.throws(() => readKey(bad), /exactly its own key/);
});

test("arguments: --site must be a bare https origin", () => {
  assert.throws(() => parseArgs(["--site", "http://example.com", "--key-file", "k.txt"]), /bare https origin/);
  assert.throws(() => parseArgs(["--site", "https://example.com/path", "--key-file", "k.txt"]), /bare https origin/);
  assert.deepEqual(parseArgs(["--site", "https://example.com", "--key-file", "k.txt"]).sitemaps, ["/sitemap.xml"]);
});

test("main submits every site and reports failure if any host fails", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "indexnow-"));
  const keyFile = path.join(dir, `${KEY}.txt`);
  writeFileSync(keyFile, KEY);
  const { impl, posts } = fakeFetch({
    "https://a.example/sitemap.xml": urlset("https://a.example/"),
    [`https://a.example/${KEY}.txt`]: KEY,
    "https://b.example/sitemap.xml": urlset("https://b.example/"),
  });
  const code = await main(["--site", "https://a.example", "--site", "https://b.example", "--key-file", keyFile], { fetchImpl: impl, log: quiet });
  assert.equal(code, 1);
  assert.deepEqual(posts.map((p) => p.host), ["a.example"]);
});
