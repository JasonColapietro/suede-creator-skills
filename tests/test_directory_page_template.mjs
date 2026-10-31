// Page-template guarantees for SuedeAI.directory skill, task and category
// pages: the article in task Q&A questions, the skill page title template,
// one Suede AI call-to-action aside below each skill page's own content, and
// category ItemLists that match the table they describe. Reads the committed
// output in docs/directory/. Joined to `npm run test:directory` through an
// import in tests/test_directory_seo.mjs, since package.json is pinned by the
// first-party intake receipt.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { indefiniteArticle, withArticle, loadTaskConfig, planTasks } from "../scripts/directory/task-pages.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(repoRoot, "docs");
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&middot;/g, "·").replace(/&amp;/g, "&");
const read = (rel) => fs.readFileSync(path.join(docs, rel, "index.html"), "utf8");
const title = (html) => decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "");
const jsonld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "skill";

const data = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "skills.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "categories.json"), "utf8"));
const featuredRels = data.skills.filter((s) => s.featured).map((s) => {
  const [owner, name] = s.repo.split("/");
  return { s, rel: `directory/${slugify(owner)}/${slugify(name)}/${s.slug}/` };
});

for (const [phrase, article] of [
  ["SEO", "an"], ["SQL", "an"], ["AWS", "an"], ["LLM eval", "an"], ["MCP server", "an"], ["iOS", "an"],
  ["HTML email", "an"], ["XML", "an"], ["email", "an"], ["Excel sheet", "an"], ["hour", "an"],
  ["RAG", "a"], ["PDF", "a"], ["UI design", "a"], ["Git", "a"], ["SaaS", "a"], ["unit testing", "a"],
  ["user flow", "a"], ["Terraform", "a"], ["Word document", "a"], ["Kubernetes", "a"], ["one-shot", "a"],
]) {
  test(`indefinite article follows pronunciation: ${article} ${phrase}`, () => {
    assert.equal(indefiniteArticle(phrase), article);
    assert.equal(withArticle(phrase), `${article} ${phrase}`);
  });
}

test("task Q&A install questions use the article the job is pronounced with", () => {
  const config = loadTaskConfig(path.join(repoRoot, "directory", "task-pages.json"), new Set(categories.map((c) => c.slug)));
  const skills = data.skills.map((c) => {
    const [owner, name] = c.repo.split("/");
    const repoSlug = `${slugify(owner)}/${slugify(name)}`;
    return { ...c, id: `${repoSlug}/${c.slug}`, owner, repo_slug: repoSlug, featured: Boolean(c.featured), lists: data.repos[c.repo].lists };
  });
  const published = planTasks(config, skills).filter((t) => t.published);
  assert.ok(published.length >= 10, "fixture: task pages are published");
  for (const t of published) {
    const html = decode(read(`directory/for/${t.job.id}/`));
    const q = `How do I install ${withArticle(t.job.noun)} skill in Claude Code?`;
    assert.ok(html.includes(`<h3>${q}</h3>`), `${t.job.id}: missing "${q}"`);
    assert.doesNotMatch(html, /\ba (?:SEO|SQL|AWS|LLM|MCP|iOS|email)\b/, `${t.job.id}: wrong article`);
  }
  const seo = published.find((t) => t.job.id === "seo");
  if (seo) assert.ok(decode(read("directory/for/seo/")).includes("How do I install an SEO skill in Claude Code?"));
});

test("skill page titles read '<skill>: Claude Code Skill by <Publisher> (<score>/100)' when it fits", () => {
  const titles = new Map();
  let full = 0;
  for (const { s, rel } of featuredRels) {
    const html = read(rel);
    const t = title(html);
    assert.ok(t.length >= 20 && t.length <= 60, `${rel}: title is ${t.length} characters: ${t}`);
    titles.set(t.toLowerCase(), [...(titles.get(t.toLowerCase()) || []), rel]);
    if (s.display_name) { assert.equal(t, s.display_name, rel); continue; }
    // The publisher as the page's own facts table names it: the company for
    // official publishers, the GitHub owner otherwise.
    const publisher = decode(html.match(/<th scope="row">Publisher<\/th><td><a [^>]*>([^<]*)<\/a>/)[1]);
    const shared = /<span class="h1-sub">agent skill in /.test(html);
    const by = shared ? `in ${s.repo}` : `by ${publisher}`;
    const options = [`${s.name}: Claude Code Skill ${by} (${s.score}/100)`, `${s.name}: Claude Code Skill ${by}`, `${s.name}: Claude Code Skill`];
    const expected = options.find((o) => o.length <= 60);
    if (expected) assert.equal(t, expected, `${rel}: expected the template title`);
    else assert.ok(t.startsWith(s.name.split("-")[0]), `${rel}: fallback title should lead with the skill name: ${t}`);
    if (t === options[0]) full++;
    if (s.official && publisher !== s.repo.split("/")[0] && t.includes(" by ")) assert.ok(t.includes(`by ${publisher}`), `${rel}: official publisher display name`);
  }
  const dups = [...titles.entries()].filter(([, v]) => v.length > 1);
  assert.deepEqual(dups, [], `duplicate skill titles: ${JSON.stringify(dups.slice(0, 3))}`);
  assert.ok(full >= featuredRels.length * 0.5, `only ${full} of ${featuredRels.length} titles carry the full template`);
  const pdf = read("directory/anthropics/skills/pdf/");
  assert.match(title(pdf), /^pdf: Claude Code Skill by Anthropic \(\d+\/100\)$/);
});

test("skill pages carry one Suede AI aside, below the listing's own content", () => {
  for (const { rel } of featuredRels) {
    const html = read(rel);
    const main = html.match(/<main\b[\s\S]*<\/main>/)[0];
    const asides = [...main.matchAll(/<aside class="panel (?:svc-cta|cta-placement)/g)];
    assert.equal(asides.length, 1, `${rel}: expected one call-to-action aside`);
    const aside = main.slice(asides[0].index, main.indexOf("</aside>", asides[0].index));
    assert.match(aside, /data-services-cta="skill"/, `${rel}: the aside is the services module`);
    // The publisher note joined the aside; no standalone publisher panel remains.
    assert.match(aside, /class="svc-publisher" data-cta-placement="publisher-claim"/, `${rel}: publisher note`);
    assert.doesNotMatch(main, /<aside class="panel cta-placement"/, `${rel}: standalone placement panel`);
    // Every Suede AI link sits in the aside, after the listing's own sections.
    const before = main.slice(0, asides[0].index);
    assert.doesNotMatch(before, /data-cta="|suedeai\.(?:agency|app)\//, `${rel}: call to action above the aside`);
    for (const id of ["facts-title", "install-title", "author-title", "check-title", "cited-title"]) {
      if (main.includes(`id="${id}"`)) assert.ok(main.indexOf(`id="${id}"`) < asides[0].index, `${rel}: ${id} should lead the aside`);
    }
    for (const id of ["related-title", "siblings-title"]) {
      if (main.includes(`id="${id}"`)) assert.ok(main.indexOf(`id="${id}"`) < main.indexOf('id="badge"'), `${rel}: ${id} should lead the badge panel`);
    }
    assert.ok(main.indexOf('id="badge"') < asides[0].index, `${rel}: badge panel sits above the aside`);
    assert.ok(main.slice(asides[0].index).replace(/<\/main>$/, "").trim().endsWith("</aside>"), `${rel}: the aside closes the page`);
  }
});

test("category ItemLists list every table row and count what they list", () => {
  for (const c of categories) {
    const rel = `directory/${c.slug}/`;
    const html = read(rel);
    const page = jsonld(html).find((n) => n["@type"] === "CollectionPage");
    const list = page.mainEntity;
    assert.equal(list["@type"], "ItemList");
    const section = html.split('aria-labelledby="all-title"')[1].split("</section>")[0];
    const rows = [...section.matchAll(/<tr><td class="name"><a href="([^"]*)"[^>]*>([^<]*)<\/a>/g)].map((m) => ({ href: m[1], name: decode(m[2]) }));
    const stated = Number(decode(html.match(/<h2 id="all-title">All ([\d,]+) /)[1]).replace(/,/g, ""));
    assert.equal(rows.length, stated, `${rel}: table rows`);
    assert.equal(list.numberOfItems, list.itemListElement.length, `${rel}: numberOfItems matches the list`);
    assert.equal(list.itemListElement.length, rows.length, `${rel}: ItemList lists every row`);
    list.itemListElement.forEach((item, i) => {
      assert.equal(item.position, i + 1);
      assert.equal(item.name, rows[i].name, `${rel}: item ${i + 1} out of table order`);
      if (!/^https?:/.test(rows[i].href)) assert.equal(item.url, new URL(rows[i].href, `https://skills.suedeai.ai/${rel}`).href, `${rel}: item ${i + 1} url`);
      else assert.ok(item.url.startsWith("https://"), `${rel}: item ${i + 1} url`);
    });
  }
});
