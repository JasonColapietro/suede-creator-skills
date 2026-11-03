// The SuedeAI.directory page shell carries the home page's design to every
// page: a kind bar under the header that links every catalog the directory
// keeps (skills, featured projects, agents, plugins, Grok bots, MCP servers,
// rules, stacks), the pixel display H1, and Best of topic tiles drawn from the
// dataset. Reads the committed output in docs/directory/. Joined to
// `npm run test:directory` through an import in tests/test_directory_seo.mjs,
// since package.json is pinned by the first-party intake receipt.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirRoot = path.join(repoRoot, "docs", "directory");
const read = (rel) => fs.readFileSync(path.join(dirRoot, rel, "index.html"), "utf8");
const css = fs.readFileSync(path.join(repoRoot, "docs", "assets", "directory.css"), "utf8");
const kinds = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "kinds.json"), "utf8")).kinds;
const bestOf = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "editorial", "best-of.json"), "utf8")).topics;
const topicIds = new Set(JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "topics.json"), "utf8")).topics.map((t) => t.id));

function* pages(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* pages(p);
    else if (e.name === "index.html") yield p;
  }
}
const kindBar = (html) => (html.match(/<nav class="kind-bar"[\s\S]*?<\/nav>/) || [""])[0];
// The labels of the kind-bar links marked current on a page, counts stripped.
const lit = (rel) => [...kindBar(read(rel)).matchAll(/<a [^>]*aria-current="page"[^>]*>([\s\S]*?)<\/a>/g)]
  .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().replace(/\s[\d,]+$/, ""));

test("every directory page carries the kind bar with every catalog linked", () => {
  const targets = ["featured/", "agents/", "stacks/", ...kinds.map((k) => `${k.path}/`)];
  let n = 0;
  for (const file of pages(dirRoot)) {
    const html = fs.readFileSync(file, "utf8");
    const bar = kindBar(html);
    const rel = path.relative(dirRoot, file);
    assert.ok(bar, `${rel}: no kind bar`);
    // Links are relative to the page; resolve them to directory paths.
    const pageUrl = new URL(`https://x/${path.relative(dirRoot, path.dirname(file)).split(path.sep).join("/")}/`.replace(/\/\/$/, "/"));
    const hrefs = new Set([...bar.matchAll(/href="([^"]+)"/g)].map((m) => new URL(m[1], pageUrl).pathname.replace(/^\//, "")));
    for (const t of targets) assert.ok(hrefs.has(t), `${rel}: kind bar misses ${t} (has ${[...hrefs].join(", ")})`);
    assert.ok(html.indexOf(bar) < html.indexOf('<main id="main"'), `${rel}: kind bar must sit above the page content`);
    n++;
  }
  assert.ok(n > 1000, `fixture: walked ${n} pages`);
});

test("the kind bar lights the catalog the page belongs to", () => {
  assert.deepEqual(lit(""), ["Skills"]);
  for (const k of kinds) assert.deepEqual(lit(k.path), [k.short], `${k.path}: wrong current kind`);
  assert.deepEqual(lit("agents"), ["AI agents"]);
  assert.deepEqual(lit("agents/methodology"), ["AI agents"]);
  assert.deepEqual(lit("featured"), ["Featured Skills"]);
  assert.deepEqual(lit("stacks"), ["Stacks"]);
  assert.deepEqual(lit("topics/copywriting"), ["Skills"]);
  assert.deepEqual(lit("methodology"), [], "meta pages light no catalog");
});

test("the home hero no longer repeats the kind bar", () => {
  assert.doesNotMatch(read(""), /class="directory-type-switch"/);
});

test("every page H1 is set in the pixel display face with the cursor", () => {
  assert.match(css, /\.directory h1[^{]*\{[^}]*font-family:\s*var\(--display\)/, "page H1s use the display face");
  assert.match(css, /\.directory h1::after[^{]*\{[^}]*cursor-blink/, "page H1s end in the blinking cursor");
  assert.match(css, /prefers-reduced-motion[\s\S]*\.directory h1::after/, "the cursor freezes under reduced motion");
});

test("agent pages use the directory page head, not their own", () => {
  for (const rel of ["agents", "agents/methodology", "agents/submit", "agents/ungraded"]) {
    const html = read(rel);
    assert.doesNotMatch(html, /class="agent-hero"/, `${rel}: still renders the agent hero`);
    assert.match(html, /<div class="eyebrow">[^<]*Agents/, `${rel}: no directory eyebrow`);
  }
  const tabs = (read("agents").match(/<nav class="agent-tabs"[\s\S]*?<\/nav>/) || [""])[0];
  assert.doesNotMatch(tabs, />Skills<\/a>/, "the Skills/Agents toggle moved into the kind bar");
});

test("Best of topics are published topics", () => {
  assert.ok(bestOf.length >= 8, "fixture: at least eight Best of topics");
  for (const id of bestOf) {
    assert.ok(topicIds.has(id), `best-of.json names unknown topic ${id}`);
    assert.ok(fs.existsSync(path.join(dirRoot, "topics", id, "index.html")), `best-of.json names unpublished topic ${id}`);
  }
});

const tiles = (html) => [...html.matchAll(/<a class="topic-tile[^"]*"[\s\S]*?<\/a>/g)].map((m) => m[0]);

test("the home page shows a Best of wall of data tiles, in best-of.json order", () => {
  const html = read("");
  const wall = (html.match(/<section class="panel best-of"[\s\S]*?<\/section>/) || [""])[0];
  assert.ok(wall, "no Best of wall on the home page");
  const found = tiles(wall);
  assert.equal(found.length, bestOf.length);
  found.forEach((tile, i) => {
    assert.match(tile, new RegExp(`href="topics/${bestOf[i]}/"`), `tile ${i + 1} should link ${bestOf[i]}`);
    const count = Number((tile.match(/data-count="(\d+)"/) || [])[1]);
    assert.match(read(`topics/${bestOf[i]}`), new RegExp(`<b>${count}</b>\\s*listed skills`), `${bestOf[i]}: tile count ${count} does not match its page`);
    assert.match(tile, /<svg class="tile-matrix"[^>]*role="img"[^>]*aria-label="[^"]+"/, `${bestOf[i]}: no labelled dot matrix`);
    assert.match(tile, /class="tile-top"/, `${bestOf[i]}: no top pick`);
  });
});

test("the topics hub turns every topic into a tile with its grade mix", () => {
  const html = read("topics");
  assert.match(html, /<section class="panel best-of"/, "topics hub leads with the Best of wall");
  const compact = tiles(html).filter((t) => t.includes("topic-tile is-compact"));
  const published = fs.readdirSync(path.join(dirRoot, "topics"), { withFileTypes: true }).filter((e) => e.isDirectory()).length;
  assert.equal(compact.length, published, "one compact tile per published topic");
  for (const t of compact) {
    const mix = t.match(/style="--a:([\d.]+)%;--b:([\d.]+)%;--c:([\d.]+)%;--d:([\d.]+)%"/);
    assert.ok(mix, `compact tile without a grade mix: ${t.slice(0, 120)}`);
    const sum = mix.slice(1).map(Number).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 100) < 0.5, `grade mix sums to ${sum}`);
  }
});

test("tile motion is decorative and switches off under reduced motion", () => {
  assert.match(css, /\.topic-tile:is\(:hover, :focus-visible\) \.tile-scan/, "the scan line runs on hover or focus");
  assert.match(css, /prefers-reduced-motion[\s\S]*\.tile-scan/, "the scan line is removed under reduced motion");
});
