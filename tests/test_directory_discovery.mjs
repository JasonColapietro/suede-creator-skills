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
    const found = index.find((entry) => entry.repo === skill.repo && (entry.slug || entry.name) === skill.name && entry.href.endsWith(skill.featured ? '/' + skill.slug + '/' : '#' + skill.slug));
    assert.ok(found, `missing ${skill.repo}/${skill.slug}`);
    assert.equal(found.name, skill.display_name || skill.name);
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

function directoryWithPendingIndex(fetch = () => new Promise(() => {})) {
  const element = (tagName = 'div') => Object.assign(new EventTarget(), {
    tagName, className: '', textContent: '', children: [],
    attributes: new Map(),
    setAttribute(name, value) { this.attributes.set(name, value); },
    removeAttribute(name) { this.attributes.delete(name); },
    append(...nodes) { this.children.push(...nodes); },
    replaceChildren(fragment) { this.children = [...(fragment?.children || [])]; },
    querySelectorAll: () => [],
  });
  const controls = Object.fromEntries(Object.entries({
    q: [''], category: ['', 'frontend-design'], grade: ['', 'A', 'B', 'C', 'D'], sort: ['curated', 'name', 'score'],
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
  const document = Object.assign(element(), {
    querySelector: () => browser, querySelectorAll: () => [],
    createElement: (tag) => element(tag), createDocumentFragment: () => element('#fragment'),
  });
  const location = { href: 'https://skills.suedeai.ai/directory/?utm_source=test#catalog' };
  vm.runInNewContext(read('docs/assets/directory.js'), {
    document, window: element(), navigator: { platform: 'MacIntel' }, location, URL,
    history: { replaceState(_state, _title, url) { location.href = String(url); } },
    matchMedia: () => Object.assign(element(), { matches: false }),
    // By default the real load() keeps awaiting its response while visitors operate the controls.
    fetch, setTimeout, clearTimeout,
  });
  return { controls, location, results: children['[data-search-results]'] };
}

test('directory search still finds stable machine slugs after public names change', async () => {
  const item = { name: 'Suede AI Paid Ads Skills', slug: 'suede-ads', repo: 'JasonColapietro/suede-creator-skills',
    description: 'Plan paid media campaigns', category: 'marketing-seo', label: 'Marketing',
    grade: 'A', score: 91, license: 'MIT', href: '/directory/jasoncolapietro/suede-creator-skills/#suede-ads' };
  const { controls, results } = directoryWithPendingIndex(async () => ({ ok: true, json: async () => [item] }));
  controls.q.value = 'suede-ads';
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(results.children.length, 1);
});

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

const exists = (name) => fs.existsSync(path.join(root, name));
const skillDir = (skill) => {
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'skill';
  return `docs/directory/${skill.repo.split('/').map(slug).join('/')}/${skill.slug}/`;
};

test('graded-v2 scores are 0–99 with letter grades, and every grade can be filtered', () => {
  assert.equal(data.score_method, 'graded-v2');
  for (const entry of index) {
    assert.ok(Number.isInteger(entry.score) && entry.score >= 0 && entry.score <= 99, `${entry.href} score ${entry.score}`);
    assert.equal(entry.grade, entry.score >= 90 ? 'A' : entry.score >= 80 ? 'B' : entry.score >= 70 ? 'C' : 'D');
  }
  const home = read('docs/directory/index.html');
  const select = home.split('<select name="grade">')[1].split('</select>')[0];
  for (const option of ['<option value="A">A · 90–99</option>', '<option value="B">B · 80–89</option>', '<option value="C">C · 70–79</option>', '<option value="D">D · 0–69</option>']) {
    assert.ok(select.includes(option), `grade filter missing ${option}`);
  }
  assert.doesNotMatch(home, /90–100|80–100/);
});

test('quality shields exist only for skills scoring 80–99; lower scores keep valid badge URLs with the listing badge', () => {
  const listingBadge = read('docs/directory/badge.svg');
  assert.match(listingBadge, /Suede AI Skills Directory: listed/);
  for (const skill of data.skills) {
    const dir = skillDir(skill);
    const badge = read(dir + 'badge.svg');
    const score = read(dir + 'score.svg');
    if (skill.score >= 80) {
      assert.match(badge, new RegExp(`Grade ${skill.grade}`));
      assert.match(score, new RegExp(`${skill.score} / 100`));
      assert.ok(exists(`docs/directory/badges/score-${skill.score}.svg`));
    } else {
      assert.equal(badge, listingBadge, `${dir}badge.svg must serve the listing badge`);
      assert.equal(score, listingBadge, `${dir}score.svg must serve the listing badge`);
    }
  }
  const shields = fs.readdirSync(path.join(root, 'docs/directory/badges')).filter((f) => f.startsWith('score-'));
  assert.ok(shields.length > 0);
  for (const f of shields) {
    const n = Number(f.slice(6, -4));
    assert.ok(n >= 80 && n <= 99, `unexpected shared shield ${f}`);
  }
});

test('skills below 80 offer the improve route instead of quality badges', () => {
  const low = data.skills.find((s) => s.featured && s.score < 80);
  assert.ok(low, 'snapshot has a full-page skill below 80');
  const page = read(skillDir(low) + 'index.html');
  assert.ok(page.includes(`${low.score}/100 · ${low.grade}`));
  assert.ok(page.includes('submit/#improve'));
  assert.ok(!page.includes('Two badges for'));
  assert.ok(!page.includes(`${low.slug}/score.svg`), 'no numeric shield snippet for a score below 80');
  const high = data.skills.find((s) => s.featured && s.score >= 80);
  assert.ok(read(skillDir(high) + 'index.html').includes('Two badges for'));
  // Repository rows: a row below 80 links to the improve route, never "Get badges".
  const row = data.skills.find((s) => !s.featured && s.score < 80);
  const repoPage = read(skillDir(row).replace(/[^/]+\/$/, '') + 'index.html');
  const tr = repoPage.split(`<tr id="${row.slug}">`)[1].split('</tr>')[0];
  assert.ok(tr.includes('Improve this score'));
  assert.ok(!tr.includes('Get badges'));
});

test('methodology publishes the graded-v2 rubric, the 99 cap and live distribution', () => {
  const html = read('docs/directory/methodology/index.html');
  for (const stale of ['round(100 × passed / 7)', 'All seven graded checks currently produce 100/100', 'Scores below 80 are not listed', '80–100', '90–100', 'The possible scores are']) {
    assert.ok(!html.includes(stale), `stale copy: ${stale}`);
  }
  assert.ok(html.includes('capped at 99'));
  assert.ok(html.includes('100 is reserved'));
  assert.ok(html.includes('does not measure runtime performance') || html.includes('It does not measure runtime performance'));
  const counts = Object.fromEntries(['A', 'B', 'C', 'D'].map((g) => [g, data.skills.filter((s) => s.grade === g).length]));
  for (const [g, n] of Object.entries(counts)) assert.match(html, new RegExp(`grade-${g.toLowerCase()}">${g}</span></td><td>[^<]+</td><td>${n.toLocaleString('en-US')}</td>`));
  const max = Math.max(...data.skills.map((s) => s.score));
  assert.ok(html.includes(`the highest score is ${max}`));
  const rubric = html.split('How the points are earned')[1].split('</table>')[0];
  const points = [...rubric.matchAll(/<tr><td>[^<]+<\/td><td>(\d+)<\/td>/g)].map((m) => Number(m[1]));
  assert.equal(points.length, 11);
  assert.equal(points.reduce((a, b) => a + b, 0), 100);
});

test('search results show a shield only for scores of 80–99 and sort by score with stable ties', async () => {
  const { controls, results } = directoryWithPendingIndex(async () => ({ ok: true, json: async () => index }));
  for (let i = 0; i < 5; i++) await new Promise((resolve) => setImmediate(resolve));
  const rendered = () => results.children.map((article) => {
    const quality = article.children[1];
    return { img: quality.children.find((c) => c.tagName === 'img'), chip: quality.children.find((c) => c.tagName === 'span') };
  });
  controls.sort.value = 'score';
  for (const grade of ['A', 'B', 'C', 'D']) {
    controls.grade.value = grade;
    controls.grade.dispatchEvent(new Event('change'));
    const rows = rendered();
    assert.ok(rows.length > 0, `grade ${grade} has results`);
    const scores = rows.map((r) => Number(r.chip.textContent.split('/')[0]));
    assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
    for (const [i, row] of rows.entries()) {
      assert.match(row.chip.className, new RegExp(`grade-${grade.toLowerCase()}`));
      if (scores[i] >= 80) {
        assert.ok(row.img, 'shield for a score of 80–99');
        assert.ok(exists('docs/directory/' + row.img.src), `missing ${row.img.src}`);
      } else {
        assert.equal(row.img, undefined, 'no shield below 80');
      }
    }
  }
});
