// Guards scripts/build-listings.mjs --check, the gate that keeps the homepage
// JSON-LD sameAs, the README "Find it on" block and docs/listings.html in step
// with docs/listings.json, keeping editorial links separate from software
// identity. Each test copies only the files the builder reads
// into a temp dir, breaks exactly one thing, and requires --check to refuse it.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES = [
  "scripts/build-listings.mjs",
  "scripts/lib/seo-keywords.mjs",
  "scripts/lib/directory-keywords.json",
  "docs/listings.json",
  "docs/listings.html",
  "docs/index.html",
  "README.md",
];

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "listings-check-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const rel of FILES) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, rel), path.join(dir, rel));
  }
  return dir;
}

function check(dir) {
  return spawnSync(process.execPath, [path.join(dir, "scripts", "build-listings.mjs"), "--check"], {
    cwd: dir,
    encoding: "utf8",
  });
}

const JSON_LD_RE = /(<script type="application\/ld\+json">\n)([\s\S]*?)(<\/script>)/;
const listingUrls = () =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, "docs", "listings.json"), "utf8")).groups.flatMap((group) =>
    group.items.map((item) => item.url)
  );
const identityUrls = () =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, "docs", "listings.json"), "utf8")).groups.flatMap((group) =>
    group.items.filter((item) => item.sameAs === true).map((item) => item.url)
  );

function editHomeSameAs(dir, edit) {
  const file = path.join(dir, "docs", "index.html");
  const html = fs.readFileSync(file, "utf8");
  const [, , body] = html.match(JSON_LD_RE);
  const graph = JSON.parse(body);
  const node = graph["@graph"].find((entry) => entry["@type"] === "SoftwareSourceCode");
  node.sameAs = edit(node.sameAs);
  fs.writeFileSync(file, html.replace(JSON_LD_RE, (_, open, __, close) => `${open}${JSON.stringify(graph, null, 2)}\n${close}`));
}

test("the committed surfaces pass --check", (t) => {
  const run = check(fixture(t));
  assert.equal(run.status, 0, run.stderr || run.stdout);
});

test("software identity excludes author profiles and curated collections", () => {
  const mismatchedEntities = [
    "https://www.skillsdirectory.com/authors/jasoncolapietro",
    "https://claudskills.com/author/jasoncolapietro/",
    "https://github.com/VoltAgent/awesome-agent-skills",
    "https://www.skillsdirectory.com/skills/jasoncolapietro-suede-seo-audit",
    "https://www.npmjs.com/package/suede-skills-mcp",
  ];
  for (const page of ["index.html", "listings.html"]) {
    const html = fs.readFileSync(path.join(repoRoot, "docs", page), "utf8");
    const graph = JSON.parse(html.match(JSON_LD_RE)[2]);
    const node = graph.mainEntity ?? graph["@graph"].find((entry) => entry["@type"] === "SoftwareSourceCode");
    assert.equal(node.codeRepository, "https://github.com/JasonColapietro/suede-creator-skills");
    assert.ok(node.sameAs.includes("https://pypi.org/project/suede-creator-skills/"));
    for (const url of mismatchedEntities) {
      assert.ok(!node.sameAs.includes(url), `${page} must not identify the pack as ${url}`);
    }
  }
});

test("the homepage sameAs carries only explicitly verified pack identities", () => {
  const html = fs.readFileSync(path.join(repoRoot, "docs", "index.html"), "utf8");
  const graph = JSON.parse(html.match(JSON_LD_RE)[2]);
  const node = graph["@graph"].find((entry) => entry["@type"] === "SoftwareSourceCode");
  assert.deepEqual([...node.sameAs].sort(), [...identityUrls()].sort());
  const listings = fs.readFileSync(path.join(repoRoot, "docs", "listings.html"), "utf8");
  for (const url of listingUrls()) {
    assert.ok(listings.includes(`href="${url.replace(/&/g, "&amp;")}"`), `editorial link must remain: ${url}`);
  }
});

test("--check fails when a verified identity is removed from the homepage sameAs", (t) => {
  const dir = fixture(t);
  const dropped = identityUrls()[3];
  editHomeSameAs(dir, (sameAs) => sameAs.filter((url) => url !== dropped));
  const run = check(dir);
  assert.equal(run.status, 1, "a sameAs missing a verified identity must fail the check");
  assert.match(run.stderr, /sameAs disagrees with docs\/listings\.json/);
  assert.ok(run.stderr.includes(dropped), "the failure names the missing URL");
});

test("--check accepts the homepage sameAs in any order", (t) => {
  const dir = fixture(t);
  editHomeSameAs(dir, (sameAs) => [...sameAs].reverse());
  const run = check(dir);
  assert.equal(run.status, 0, run.stderr || run.stdout);
});

test("--check fails when the homepage sameAs names a URL that is not a listing", (t) => {
  const dir = fixture(t);
  editHomeSameAs(dir, (sameAs) => [...sameAs, "https://example.com/not-a-listing"]);
  const run = check(dir);
  assert.equal(run.status, 1);
  assert.match(run.stderr, /not verified pack identities in docs\/listings\.json/);
});

test("--check rejects a curated collection even when it is an existing listing", (t) => {
  const dir = fixture(t);
  editHomeSameAs(dir, (sameAs) => [...sameAs, "https://github.com/VoltAgent/awesome-agent-skills"]);
  const run = check(dir);
  assert.equal(run.status, 1);
  assert.match(run.stderr, /not verified pack identities/);
});

test("new listings remain editorial links unless explicitly identified as the pack", (t) => {
  const dir = fixture(t);
  const file = path.join(dir, "docs", "listings.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const url = "https://example.com/authors/new-author";
  data.groups[0].items.push({ name: "Author directory", url, note: "An author profile", featured: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  const run = spawnSync(process.execPath, [path.join(dir, "scripts", "build-listings.mjs")], { cwd: dir, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  for (const page of ["index.html", "listings.html"]) {
    const html = fs.readFileSync(path.join(dir, "docs", page), "utf8");
    assert.ok(html.includes(`href="${url}"`), `${page} retains the editorial link`);
    const graph = JSON.parse(html.match(JSON_LD_RE)[2]);
    const node = graph.mainEntity ?? graph["@graph"].find((entry) => entry["@type"] === "SoftwareSourceCode");
    assert.ok(!node.sameAs.includes(url), `${page} must not silently promote a citation to an identity`);
  }
  assert.equal(check(dir).status, 0);
});

test("sameAs opt-in must be an explicit boolean", (t) => {
  const dir = fixture(t);
  const file = path.join(dir, "docs", "listings.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  data.groups[0].items[0].sameAs = "true";
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  const run = check(dir);
  assert.equal(run.status, 1);
  assert.match(run.stderr, /sameAs must be a boolean/);
});

test("--check fails when the README listings block is stale", (t) => {
  const dir = fixture(t);
  const file = path.join(dir, "README.md");
  const readme = fs.readFileSync(file, "utf8");
  const stale = readme.replace(/(<!-- listings:start -->\n)Listed on \[[^\]]+\]\([^)]+\) · /, "$1Listed on ");
  assert.notEqual(stale, readme, "fixture edit must remove the first featured listing");
  fs.writeFileSync(file, stale);
  const run = check(dir);
  assert.equal(run.status, 1, "a README block missing a featured listing must fail the check");
  assert.match(run.stderr, /stale: README\.md/);
});

test("--check fails when the README loses its listings markers", (t) => {
  const dir = fixture(t);
  const file = path.join(dir, "README.md");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("<!-- listings:end -->", ""));
  const run = check(dir);
  assert.equal(run.status, 1);
  assert.match(run.stderr, /README\.md needs exactly one/);
});

test("--check fails when the listings page drifts from the JSON", (t) => {
  const dir = fixture(t);
  const file = path.join(dir, "docs", "listings.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  data.groups[0].items[0].note = "A note the rendered page does not carry";
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  const run = check(dir);
  assert.equal(run.status, 1);
  assert.match(run.stderr, /docs\/listings\.html/);
});
