import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

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

function directoryWithPendingIndex() {
  const element = () => Object.assign(new EventTarget(), {
    attributes: new Map(),
    setAttribute(name, value) { this.attributes.set(name, value); },
  });
  const controls = Object.fromEntries(Object.entries({
    q: [''], category: ['', 'frontend-design'], grade: ['', 'A', 'B'], sort: ['curated', 'name', 'score'],
  }).map(([name, values]) => [name, Object.assign(element(), {
    name, value: values[0], options: values.map((value) => ({ value })),
  })]));
  const formChildren = Object.fromEntries(['kbd', '[data-clear]'].map((selector) => [selector, element()]));
  const form = Object.assign(element(), { elements: controls, querySelector: (selector) => formChildren[selector] });
  const children = Object.fromEntries([
    '[data-search-results]', '[data-results-status]', '[data-result-title]', '.search-empty',
    '.search-loading', '[data-search-error]', '[data-load-more]', '.category-rail details',
    '[data-reset]', '[data-retry]',
  ].map((selector) => [selector, element()]));
  children.form = form;
  const browser = { querySelector: (selector) => children[selector], querySelectorAll: () => [] };
  const document = Object.assign(element(), { querySelector: () => browser, querySelectorAll: () => [] });
  const location = { href: 'https://skills.suedeai.ai/directory/?utm_source=test#catalog' };
  vm.runInNewContext(read('docs/assets/directory.js'), {
    document, window: element(), navigator: { platform: 'MacIntel' }, location, URL,
    history: { replaceState(_state, _title, url) { location.href = String(url); } },
    matchMedia: () => Object.assign(element(), { matches: false }),
    // Keep the real load() awaiting its response while visitors operate the controls.
    fetch: () => new Promise(() => {}), setTimeout, clearTimeout,
  });
  return { controls, location, results: children['[data-search-results]'] };
}

test('filters changed while the search index loads persist in the URL', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { controls, location, results } = directoryWithPendingIndex();
  assert.equal(results.attributes.get('aria-busy'), 'true');
  for (const [name, value] of Object.entries({ q: 'design audit', category: 'frontend-design', grade: 'B', sort: 'name' })) {
    controls[name].value = value;
    controls[name].dispatchEvent(new Event(name === 'q' ? 'input' : 'change'));
    t.mock.timers.tick(100);
    assert.equal(new URL(location.href).searchParams.get(name), value, `${name} must persist before loading finishes`);
  }
  const url = new URL(location.href);
  assert.equal(url.searchParams.get('utm_source'), 'test');
  assert.equal(url.hash, '#catalog');
  for (const name of ['q', 'category', 'grade', 'sort']) {
    controls[name].value = controls[name].options[0].value;
    controls[name].dispatchEvent(new Event(name === 'q' ? 'input' : 'change'));
    t.mock.timers.tick(100);
    assert.equal(new URL(location.href).searchParams.has(name), false, `clearing ${name} must also persist while loading`);
  }
});
