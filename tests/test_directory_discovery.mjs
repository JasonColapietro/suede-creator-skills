import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const data = JSON.parse(read('directory/skills.json'));
const index = JSON.parse(read('docs/directory/search-index.json'));

test('search covers every eligible skill exactly once with unchanged score, category and license', () => {
  assert.equal(index.length, data.skills.length);
  assert.equal(new Set(index.map((skill) => skill.href)).size, data.skills.length);
  for (const skill of data.skills) {
    const found = index.find((entry) => entry.repo === skill.repo && entry.name === skill.name && entry.href.endsWith(skill.featured ? '/' + skill.slug + '/' : '#' + skill.slug));
    assert.ok(found, `missing ${skill.repo}/${skill.slug}`);
    for (const field of ['grade', 'score', 'category', 'license']) assert.equal(found[field], skill[field]);
    assert.equal(found.full, Boolean(skill.featured));
  }
});

test('every search result resolves to a real listing and existing anchor', () => {
  for (const skill of index) {
    assert.match(skill.href, /^\/directory\/[a-z0-9/-]+\/(?:#[a-z0-9-]+)?$/);
    const [url, anchor] = skill.href.split('#');
    const html = read('docs' + url + 'index.html');
    if (anchor) assert.ok(html.includes(`id="${anchor}"`), `${skill.href} anchor missing`);
  }
});

test('category browsing remains available without JavaScript and precedes recommendation content', () => {
  const home = read('docs/directory/index.html');
  const categories = JSON.parse(read('directory/categories.json'));
  for (const category of categories) {
    assert.ok(home.includes(`href="${category.slug}/"`));
    const html = read(`docs/directory/${category.slug}/index.html`);
    assert.ok(html.indexOf('id="all-title"') < html.indexOf('id="choose-title"'));
    assert.ok(html.includes('class="table-filter" hidden'));
    assert.ok(html.includes('data-table-empty hidden'));
  }
  assert.ok(home.includes('<noscript>'));
  assert.ok(home.includes('data-search-error hidden'));
});
