import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { search, fetchIndex, main } from '../directory/suede-directory/scripts/search.mjs';
import { comparisonPairs, badgeHubStats } from '../scripts/directory/growth.mjs';

const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const index = JSON.parse(read('docs/directory/search-index.json'));
const snapshot = JSON.parse(read('directory/skills.json'));
const manifest = JSON.parse(read('directory/growth/full-pages.json'));
const item = (id, extra = {}) => ({ id, slug: id, name: 'react testing', repo: `${id}/skills`, description: 'Test React applications',
  category: 'testing', score: 85, grade: 'B', license: 'MIT', lane: 'free-open-source', install_reviewed: true,
  href: `/${id}/skills/test/`, report: `/${id}/skills/test/report.json`, topics: ['testing'], ...extra });

test('finder ranks task relevance, filters score and cost, and excludes its publisher', () => {
  const data = [item('low', { score: 70 }), item('suede', { repo: 'JasonColapietro/suede-creator-skills', score: 99 }),
    item('service', { lane: 'free-with-service' }), item('unreviewed', { install_reviewed: false }),
    item('good'), item('better', { score: 90, grade: 'A' }), item('irrelevant', { name: 'postgres', description: 'Database tuning', score: 99 })];
  assert.deepEqual(search(data, 'react testing', { minScore: 80, free: true }).map(s => s.repository), ['better/skills', 'good/skills']);
  assert.equal(search(data, 'no matching task').length, 0);
  assert.throws(() => search(data, '', {}), /Provide a task/);
  assert.throws(() => search(data, 'react', { limit: 100 }), /limit/);
  assert.throws(() => search(data, 'react', { minScore: NaN }), /min-score/);
});

test('finder rejects foreign result links, HTTP failures and invalid CLI flags', async () => {
  assert.throws(() => search([item('external', { report: 'https://evil.example/report' })], 'react'), /Unexpected directory link/);
  await assert.rejects(fetchIndex(async () => ({ ok: false, status: 503 })), /HTTP 503/);
  await assert.rejects(main(['react', '--unknown']), /Unknown option/);
  await assert.rejects(main(['react', '--limit']), /Missing value/);
  const result = await fetchIndex(async (url, options) => {
    assert.equal(url, 'https://suedeai.directory/search-index.json');
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal);
    return new Response(JSON.stringify([item('fixture')]));
  });
  assert.equal(result.length, 1);
});

test('500 selected assessments resolve from search to indexable evidence pages', () => {
  assert.equal(new Set(manifest.skills).size, 500);
  for (const id of manifest.skills) {
    const s = index.find(s => s.id === id);
    assert.ok(s?.full, id);
    assert.ok(!s.href.includes('#'), id);
    const html = read(`docs${s.href}index.html`);
    assert.ok(html.includes('Points earned') && html.includes('Available'), id);
    assert.ok(html.includes(`Suede Skill Check: ${s.score}/100`), id);
    assert.ok(html.includes('Report version <code>'), id);
    assert.match(html, /name="robots" content="index, follow/);
    const canonical = s.href.replace('/directory', 'https://suedeai.directory');
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`), id);
    assert.ok(html.includes('not scanned'), id);
  }
});

test('comparison selection requires shared topics and separate third-party publishers', () => {
  const a = item('a'), b = item('b'), own = item('suede', { repo: 'JasonColapietro/suede-creator-skills' });
  const plan = comparisonPairs([{ topic: { id: 'testing', name: 'Testing' }, rows: [a, b, own] }], () => ({ installs: 50 }));
  assert.equal(plan.length, 1);
  assert.deepEqual([plan[0].a.id, plan[0].b.id], ['a', 'b']);
  const retained = comparisonPairs([], () => null, 50, [{ skills: ['a', 'b'], topics: ['testing'] }], [a, b]);
  assert.equal(retained[0].slug, plan[0].slug, 'a popularity or topic refresh must not retire a published comparison');
  const pairs = JSON.parse(read('docs/directory/comparisons.json'));
  assert.equal(pairs.length, 50);
  for (const p of pairs) {
    const html = read(`docs${p.href}index.html`);
    assert.match(html, /Where the scores differ/);
    for (const id of p.skills) assert.ok(index.some(s => s.id === id));
    assert.ok(p.topics.length);
  }
});

test('report totals reconcile to third-party source data and charts are downloadable', () => {
  const report = JSON.parse(read('docs/directory/state-of-agent-skills/data.json'));
  const rows = snapshot.skills.filter(s => !/^jasoncolapietro\/suede-creator-skills$|^suede-ai\//i.test(s.repo));
  assert.equal(report.total, rows.length);
  assert.equal(report.snapshot, snapshot.generated);
  for (const grade of ['A', 'B', 'C', 'D']) assert.equal(report.grades[grade], rows.filter(s => s.grade === grade).length);
  assert.equal(report.cost_lanes.reduce((n, [, count]) => n + count, 0), rows.length);
  assert.equal(report.categories.reduce((n, [, count]) => n + count, 0), rows.length);
  assert.match(read('docs/directory/state-of-agent-skills/grades.svg'), /<title/);
  assert.match(read('docs/directory/state-of-agent-skills/grades.csv'), /^grade,skills,percent/);
});

test('finder is distributed with matching source and email availability is truthful', () => {
  assert.equal(read('docs/directory/finder/search.mjs'), read('directory/suede-directory/scripts/search.mjs'));
  const newsletter = JSON.parse(read('directory/growth/newsletter.json'));
  const html = read('docs/directory/rising/index.html');
  if (!newsletter.signup_url) {
    assert.match(html, /Email signup is not open yet/);
    assert.doesNotMatch(html, /type="email"|successfully subscribed/);
  }
});

test('badge hub counts eligible third-party skills and links every repository it ranks', () => {
  const rows = snapshot.skills.filter(s => !/^jasoncolapietro\/suede-creator-skills$|^suede-ai\//i.test(s.repo));
  const stats = badgeHubStats(rows);
  assert.equal(stats.eligible, rows.filter(s => s.score >= 80 && s.score <= 99).length);
  assert.equal(stats.gradeA + stats.gradeB, stats.eligible);
  assert.ok(stats.repos.every(r => !/suede/i.test(r.repo)));
  const html = read('docs/directory/badges/index.html');
  assert.match(html, new RegExp(`${stats.eligible.toLocaleString('en-US')} third-party skills qualify`));
  for (const r of stats.repos.slice(0, 25)) {
    const href = html.match(new RegExp(`<a href="([^"]+)">${r.repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</a>`))?.[1];
    assert.ok(href, `badge hub links ${r.repo}`);
    assert.ok(fs.existsSync(new URL(`../docs/directory/badges/${href}index.html`, import.meta.url)), `${href} resolves`);
  }
  assert.match(read('docs/directory/submit/index.html'), /href="[^"]*badges\/">how badges work/);
});

test('a configured newsletter shows the signup CTA on Rising Skills and the home page', () => {
  const { signup_url } = JSON.parse(read('directory/growth/newsletter.json'));
  if (!signup_url) return;
  assert.equal(new URL(signup_url).protocol, 'https:');
  const href = signup_url.replaceAll('&', '&amp;');
  for (const page of ['docs/directory/rising/index.html', 'docs/directory/index.html']) {
    assert.match(read(page), new RegExp(`<a class="button" href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">Get Rising Skills by email</a>`), page);
  }
  assert.doesNotMatch(read('docs/directory/rising/index.html'), /Email signup is not open yet/);
});
