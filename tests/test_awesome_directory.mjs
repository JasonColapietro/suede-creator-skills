import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadInputs, generateCatalog, syncCatalog, excerpt } from '../scripts/build-awesome-directory.mjs';
import { listingTarget, qualityScore } from '../scripts/directory/badges.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputs = loadInputs(root);
const pages = generateCatalog(inputs);
const categories = [...pages].filter(([name]) => name.startsWith('categories/'));

test('0–99 quality scoring leads the catalog and every listing, with higher scores first per publisher', () => {
  const index = pages.get('README.md');
  assert.ok(index.includes('# Suede Awesome Everything\n\n**AI agent skills, scored 0–99.**'));
  assert.ok(index.indexOf('0–99 quality scores') >= 0 && index.indexOf('0–99 quality scores') < index.indexOf('## Contents'));
  assert.ok(index.includes('## Compare 0–99 quality scores'));
  assert.ok(index.includes('The rubric totals **100 points**'));
  assert.ok(index.includes('published scores are capped at 99; 100 is reserved'));
  for (const grade of ['A', 'B', 'C', 'D']) {
    const count = inputs.data.skills.filter((s) => s.grade === grade).length;
    const row = index.split('\n').find((l) => l.includes(`sort=score&grade=${grade}`));
    assert.ok(row.includes(`| ${count.toLocaleString('en-US')} |`));
  }
  for (const [, body] of categories) {
    assert.ok(body.includes('0–99 quality scale'));
    for (const group of body.split(/^## /m).slice(1)) {
      const entries = group.split('\n').filter((l) => l.includes('[Suede]('));
      const scores = entries.map((line) => Number(line.match(/^- \*\*(\d+)\/100 · [ABCD]\*\*/)?.[1]));
      assert.ok(scores.every(Number.isInteger));
      assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
    }
  }
});

test('every accepted skill appears exactly once in its category with its verified score and source', () => {
  const targets = categories.flatMap(([, body]) => [...body.matchAll(/\[Suede\]\(([^)]+)\)/g)].map((m) => m[1]));
  assert.equal(targets.length, inputs.data.skills.length);
  assert.equal(new Set(targets).size, targets.length);
  assert.deepEqual(new Set(targets), new Set(inputs.data.skills.map(listingTarget)));
  assert.equal(categories.length, inputs.categories.length);
  for (const s of inputs.data.skills) {
    const page = pages.get(`categories/${s.category}.md`);
    const line = page.split('\n').find((l) => l.includes(`[Suede](${listingTarget(s)})`));
    assert.ok(line.includes(`**${qualityScore(s, inputs.data.repos[s.repo], inputs.data.generated)}/100 · ${s.grade}**`));
    const encode = (p) => p.split('/').map(encodeURIComponent).join('/');
    const source = `https://github.com/${s.repo}/blob/${encode(inputs.data.repos[s.repo].branch)}/${s.dir === '.' ? '' : `${encode(s.dir)}/`}SKILL.md`;
    assert.ok(line.includes(`](${source})`), `${s.repo}/${s.slug}: source path`);
    if (!s.open_license) assert.ok(line.includes('review terms'), `${s.repo}/${s.slug}`);
  }
});

test('all generated Markdown links resolve locally or to an existing website route and anchor', () => {
  const cache = new Map();
  for (const [name, body] of pages) {
    for (const match of body.matchAll(/\]\(([^)\s]+)\)|(?:href|src)="([^"]+)"/g)) {
      const href = match[1] || match[2];
      if (/^https?:/.test(href) && !href.startsWith('https://skills.suedeai.ai/')) continue;
      const url = href.startsWith('https://skills.suedeai.ai/') ? new URL(href) : null;
      const [relative, fragment] = url ? [url.pathname, url.hash.slice(1)] : href.split('#');
      let target = url ? path.join(root, 'docs', relative) : path.resolve(root, 'awesome', path.dirname(name), relative || path.basename(name));
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
      assert.ok(fs.existsSync(target), `${name}: ${href}`);
      if (!fragment) continue;
      if (!cache.has(target)) cache.set(target, fs.readFileSync(target, 'utf8'));
      const text = cache.get(target);
      const headings = [...text.matchAll(/^#+ (.+)$/gm)].map((m) => m[1].toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replace(/ /g, '-'));
      assert.ok(text.includes(`id="${fragment}"`) || headings.includes(fragment), `${name}: missing anchor ${href}`);
    }
  }
});

test('allowlists and exclusions fail closed even if a stale dataset still contains the record', () => {
  const scoped = structuredClone(inputs);
  const appie = scoped.data.skills.find((s) => s.repo === 'appierun/appie-mcp');
  appie.name = 'unapproved-skill';
  assert.throws(() => generateCatalog(scoped), /accepted scope/);
  for (const scope of ['repositories', 'skills']) {
    const excluded = structuredClone(inputs), s = excluded.data.skills[0];
    excluded.exclusions[scope].push({ id: scope === 'repositories' ? s.repo.toUpperCase() : `${s.repo}/${s.name}`.toUpperCase() });
    assert.throws(() => generateCatalog(excluded), /excluded/);
  }
});

test('duplicate IDs, unknown categories, invalid grades and unsupported security claims are rejected', () => {
  for (const [mutate, expected] of [
    [(x) => x.data.skills.push(x.data.skills[0]), /Duplicate/],
    [(x) => x.data.skills[0].category = 'missing', /Unknown category/],
    [(x) => x.data.skills[0].score++, /score/],
    [(x) => x.data.skills[0].checks = '01111111', /eligibility/],
    [(x) => x.data.skills[0].security_scan_status = 'passed', /security/],
    [(x) => x.data.score_method = 'legacy', /method/],
  ]) {
    const input = structuredClone(inputs);
    mutate(input);
    assert.throws(() => generateCatalog(input), expected);
  }
});

test('featured Appie scope and CoalWash full-plugin instructions retain their evidence and boundaries', () => {
  const page = pages.get('featured.md');
  assert.deepEqual(inputs.data.skills.filter((s) => s.repo === 'appierun/appie-mcp').map((s) => s.name).sort(), [
    'appie-article-writer', 'appie-chatbot', 'appie-url-shortener',
  ]);
  assert.doesNotMatch(page, /appie-linkedin|appie-reddit|npx skills add|cp -R|score\.svg|badge\.svg/);
  for (const fact of ['claude plugin marketplace add TheColliery/CoalWash', 'claude plugin install coalwash@coalwash', 'SessionStart', 'PreToolUse', 'PostToolUse', 'without a new prompt', 'requires consent', 'Shell writes', 'semantic preservation']) assert.ok(page.includes(fact), fact);
  assert.ok(page.includes('Editorial selection'));
  assert.ok(page.includes('Accepted scope: **3 skills**'));
  assert.ok(page.includes('security certification'));
  for (const p of inputs.editorial.projects) assert.ok(page.includes(`/tree/${p.commit}`));
  const invalid = structuredClone(inputs);
  invalid.editorial.projects[0].skills.push({ id: 'unapproved-skill', title: 'unapproved', description: 'unapproved' });
  assert.throws(() => generateCatalog(invalid), /accepted scope/);
});

test('freshness checks detect missing, edited and orphaned output without writing; regeneration is deterministic', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'suede-awesome-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  assert.ok(syncCatalog(dir, pages, true).length);
  assert.equal(fs.readdirSync(dir).length, 0);
  syncCatalog(dir, pages);
  assert.deepEqual(syncCatalog(dir, generateCatalog(inputs), true), []);
  fs.appendFileSync(path.join(dir, 'README.md'), '\nStale copy\n');
  assert.ok(syncCatalog(dir, pages, true).includes('README.md'));
  assert.match(fs.readFileSync(path.join(dir, 'README.md'), 'utf8'), /Stale copy/);
  fs.copyFileSync(path.join(dir, 'README.md'), path.join(dir, 'categories/removed.md'));
  assert.ok(syncCatalog(dir, pages, true).includes('categories/removed.md'));
  fs.writeFileSync(path.join(dir, 'CONTRIBUTING.md'), 'Maintainer prose\n');
  syncCatalog(dir, pages);
  assert.deepEqual(syncCatalog(dir, pages, true), []);
  assert.equal(fs.readFileSync(path.join(dir, 'CONTRIBUTING.md'), 'utf8'), 'Maintainer prose\n');
  const updated = structuredClone(inputs);
  updated.data.skills[0].summary = 'An updated editorial summary.';
  assert.ok(syncCatalog(dir, generateCatalog(updated), true).includes(`categories/${updated.data.skills[0].category}.md`));
});

test('external descriptions are plain text and concise, and every publisher receives credit', () => {
  const text = excerpt('<img src=x> [click](javascript:bad) **claim**\nSecond line');
  assert.doesNotMatch(text, /<img|\[click\]\(javascript/);
  assert.ok(text.includes('&lt;img'));
  assert.ok(excerpt('word '.repeat(200)).length < 260);
  const index = pages.get('publishers.md');
  for (const repo of new Set(inputs.data.skills.map((s) => s.repo))) {
    assert.ok(index.includes(`https://github.com/${repo})`), repo);
    assert.ok(index.includes(`https://github.com/${repo.split('/')[0]})`), repo);
  }
});

test('guides link drafts to their source and published pages to the site; service links stay outside listings', () => {
  const index = pages.get('README.md');
  assert.ok(inputs.guides.pages.length > 0);
  for (const g of inputs.guides.pages) {
    const href = g.status === 'published' ? `https://skills.suedeai.ai/${g.path}` : `../${g.source}`;
    assert.ok(index.includes(`](${href})`), g.id);
  }
  const published = structuredClone(inputs);
  published.guides.pages[0].status = 'published';
  assert.ok(generateCatalog(published).get('README.md').includes(`](https://skills.suedeai.ai/${published.guides.pages[0].path})`));
  for (const g of inputs.guides.pages.filter((x) => x.category)) {
    assert.ok(pages.get(`categories/${g.category}.md`).includes('**Guide:**'), g.id);
  }
  assert.match(index, /## Add your badge[\s\S]*skills\.suedeai\.ai\/directory\/badge\.svg/);
  for (const [name, body] of pages) {
    for (const line of body.split('\n')) {
      // Publisher descriptions are quoted as written; only the catalog's own prose is checked for em dashes.
      if (line.includes('[Suede](')) {
        assert.doesNotMatch(line, /suedeai\.(agency|app)/, `${name}: service link inside a listing`);
        assert.match(line, /^- \*\*\d+\/100 · [ABCD]\*\* · \[[^\]]+\]\(\S+\): /, `${name}: listing separator`);
      } else assert.doesNotMatch(line, /—/, `${name}: em dash in catalog prose`);
    }
  }
  const plain = generateCatalog({ ...structuredClone(inputs), guides: { pages: [] }, ctas: { placements: [], routing: {} } }).get('README.md');
  assert.doesNotMatch(plain, /## Guides|## Work with Suede AI|suedeai\.agency/);
});
