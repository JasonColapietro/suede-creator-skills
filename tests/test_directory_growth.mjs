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

import os from 'node:os';
import path from 'node:path';
import { brief, parseInterests, main as briefMain } from '../directory/suede-directory/scripts/brief.mjs';
import { starGains, validateStars } from '../scripts/directory/github-stars.mjs';

const feed = JSON.parse(read('docs/directory/weekly.json'));

test('weekly feed excludes Suede AI, links only to the directory and reconciles topic installs', () => {
  const own = /^jasoncolapietro\/suede-creator-skills$|^suede-ai\//i;
  assert.ok(Object.values(feed.skills).every(s => !own.test(s.repo) && s.listing.startsWith('https://suedeai.directory/')));
  assert.ok(feed.repositories.every(r => !own.test(r.repo)));
  for (const list of ['rising', 'climbing', 'new_listings']) assert.ok(feed[list].every(id => feed.skills[id]), list);
  const w = feed.rising.map(id => feed.skills[id].weekly_installs);
  assert.deepEqual(w, [...w].sort((a, b) => b - a));
  assert.equal(feed.install_snapshot, JSON.parse(read('directory/installs.json')).fetched);
  assert.ok(feed.topics.every(t => t.best.every(id => feed.skills[id])));
});

test('briefing filters the feed to the reader’s interests and rejects foreign links', () => {
  const r = brief(feed, parseInterests('sales, video'), { limit: 3 });
  assert.deepEqual(r.interests, ['sales', 'video']);
  const sales = r.sections[0];
  assert.ok(sales.topics.some(t => /sales/i.test(t.name)));
  for (const c of [...sales.rising, ...sales.climbing, ...sales.new_listings]) assert.ok(c.listing.startsWith('https://suedeai.directory/'));
  assert.ok(sales.rising.length <= 3);
  assert.equal(brief(feed, ['zzqx-nothing-matches']).empty, true);
  const seo = brief(feed, ['seo'], { limit: 20 }).sections[0];
  const seoTopics = new Set(feed.topics.filter(t => /seo/i.test(`${t.id} ${t.name}`)).map(t => t.id));
  for (const c of [...seo.rising, ...seo.climbing]) assert.ok(c.topics.some(t => seoTopics.has(t)) || /seo/i.test(`${c.name} ${c.description}`), `${c.name} is not about SEO`);
  const bad = { ...feed, skills: { x: { ...Object.values(feed.skills)[0], listing: 'https://evil.example/x' } } };
  assert.throws(() => brief(bad, ['sales']), /Unexpected directory link/);
  assert.throws(() => parseInterests(' , '), /at least one interest/);
});

test('briefing saves interests locally and reuses them', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-'));
  const env = { XDG_CONFIG_HOME: dir };
  const feedFile = new URL('../docs/directory/weekly.json', import.meta.url).pathname;
  await assert.rejects(briefMain(['--feed', feedFile], env), /No saved interests/);
  const first = await briefMain(['--interests', 'Marketing, SEO', '--save', '--feed', feedFile], env);
  assert.equal(first.saved_to, path.join(dir, 'suede-directory', 'interests.json'));
  const again = await briefMain(['--feed', feedFile], env);
  assert.deepEqual(again.interests, ['marketing', 'seo']);
  await assert.rejects(briefMain(['--bogus'], env), /Unknown option/);
});

test('star snapshots validate and report gains between consecutive dates', () => {
  const doc = { snapshots: [{ date: '2026-11-01', stars: { 'a/b': 10 } }, { date: '2026-11-08', stars: { 'a/b': 25, 'c/d': 4 } }] };
  const g = starGains(validateStars(doc));
  assert.deepEqual(g.repos, { 'a/b': { stars: 25, gained: 15 }, 'c/d': { stars: 4, gained: null } });
  assert.equal(g.since, '2026-11-01');
  assert.throws(() => validateStars({ snapshots: [{ date: '2026-11-08', stars: {} }, { date: '2026-11-01', stars: {} }] }), /ascending/);
  validateStars(JSON.parse(read('directory/growth/github-stars.json')));
});

test('finder page ships the briefing script and explains weekly briefings', () => {
  assert.equal(read('docs/directory/finder/brief.mjs'), read('directory/suede-directory/scripts/brief.mjs'));
  assert.match(read('docs/directory/finder/index.html'), /id="briefing"/);
  assert.match(read('directory/suede-directory/SKILL.md'), /brief\.mjs/);
});

import { proxyRetryEnv } from '../directory/suede-directory/scripts/search.mjs';
import { spawnSync } from 'node:child_process';

test('finder scripts retry through the environment proxy when fetch cannot reach the directory', () => {
  const failed = new TypeError('fetch failed');
  assert.equal(proxyRetryEnv(failed, {}), null);
  assert.equal(proxyRetryEnv(new Error('Directory returned HTTP 500'), { HTTPS_PROXY: 'http://p:1' }), null);
  assert.equal(proxyRetryEnv(failed, { HTTPS_PROXY: 'http://p:1', NODE_USE_ENV_PROXY: '1' }), null);
  for (const key of ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY']) {
    const env = proxyRetryEnv(failed, { [key]: 'http://p:1' });
    assert.equal(env.NODE_USE_ENV_PROXY, '1', key);
    assert.equal(env[key], 'http://p:1');
  }
  // A proxy that refuses everything. With direct internet (CI runners) the first fetch
  // succeeds and exits 0; without it (sandboxes) the single retry fails. Either way the
  // script never loops and reports at most one error.
  for (const script of ['search.mjs', 'brief.mjs']) {
    const r = spawnSync(process.execPath, [new URL(`../directory/suede-directory/scripts/${script}`, import.meta.url).pathname, ...(script === 'search.mjs' ? ['react'] : ['--interests', 'sales'])],
      { env: { PATH: process.env.PATH, HOME: os.tmpdir(), XDG_CONFIG_HOME: os.tmpdir(), HTTPS_PROXY: 'http://127.0.0.1:9', HTTP_PROXY: 'http://127.0.0.1:9' }, encoding: 'utf8', timeout: 60000 });
    const errors = (r.stderr.match(/failed:/g) || []).length;
    assert.notEqual(r.status, null, `${script} timed out`);
    assert.equal(errors, r.status === 0 ? 0 : 1, `${script}: ${r.stderr}`);
  }
});

// Weekly newsletter generator and breakout picks
import { buildIssue, demandScore, toolsScore } from '../scripts/directory/newsletter-issue.mjs';
import { pickBreakouts, isLikelyLure, validateBreakout } from '../scripts/directory/breakout.mjs';

const readJson = (p) => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const nlIndex = readJson('docs/directory/search-index.json');
const nlFeed = readJson('docs/directory/weekly.json');
const playbook = readJson('directory/growth/newsletter-playbook.json');
const breakout = validateBreakout(readJson('directory/growth/breakout.json'));
const issue = buildIssue({ index: nlIndex, feed: nlFeed, breakout, playbook, date: breakout.date });

test('breakout picks drop forks, old repos, duplicates and malware-style lures', () => {
  const repo = (full_name, stars, extra = {}) => ({ full_name, stargazers_count: stars, html_url: `https://github.com/${full_name}`, created_at: '2026-11-03T00:00:00Z', description: 'An agent skill for SEO audits', fork: false, archived: false, ...extra });
  const picked = pickBreakouts([
    repo('a/real', 50), repo('b/fork', 900, { fork: true }), repo('c/old', 800, { created_at: '2026-10-01T00:00:00Z' }),
    repo('d/game-trainer', 700, { description: 'Aion 2 trainer tool, free download' }), repo('e/blank', 600, { description: '' }),
    repo('A/Real', 50), repo('f/top', 400),
  ], { since: '2026-11-01' });
  assert.deepEqual(picked.map((r) => r.repo), ['f/top', 'a/real']);
  assert.equal(isLikelyLure({ full_name: 'x/cheat-loader', description: 'Undetected aimbot' }), true);
  assert.equal(isLikelyLure({ full_name: 'x/seo-skill', description: 'Agent skill for SEO audits' }), false);
});

test('demand and tools scores follow the published thresholds', () => {
  assert.equal(demandScore([{ change_pct: 17, weekly_installs: 15000 }]).score, 5);
  assert.equal(demandScore([{ change_pct: 10, weekly_installs: 31513 }]).score, 5);
  assert.equal(demandScore([{ change_pct: 10, weekly_installs: 5000 }]).score, 4);
  assert.equal(demandScore([{ change_pct: -64, weekly_installs: 169962 }]).score, 1);
  assert.equal(demandScore([{ change_pct: null, weekly_installs: 0 }]), null);
  assert.equal(toolsScore([{ score: 90 }], false), 5);
  assert.equal(toolsScore([{ score: 88 }], true), 5);
  assert.equal(toolsScore([], false), 0);
});

test('playbook references only real skills and topics', () => {
  const ids = new Set(nlIndex.map((s) => s.id));
  const topics = new Set(nlFeed.topics.map((t) => t.id));
  for (const b of playbook.businesses) {
    for (const s of b.skills) assert.ok(ids.has(s), `${b.name}: ${s}`);
    for (const t of b.topics) assert.ok(topics.has(t), `${b.name}: ${t}`);
    for (const m of `${b.start} ${b.pitch}`.matchAll(/\{skill:([^}]+)\}/g)) assert.ok(ids.has(m[1]), m[1]);
  }
  for (const j of playbook.jobs) {
    if (j.pin) assert.ok(ids.has(j.pin), j.pin);
    for (const t of j.topics) assert.ok(topics.has(t), `${j.label}: ${t}`);
  }
  for (const t of playbook.money_topics) assert.ok(topics.has(t), t);
});

test('the generated issue keeps the approved structure, voice and data', () => {
  for (const heading of ['## This week in 60 seconds', 'AI businesses in two models, ranked by score', '## 🧰 Pick your stack', '## 🤖 Get this briefing from your own AI agent'])
    assert.ok(issue.includes(heading), heading);
  assert.match(issue, /🏆 most likely to succeed/);
  assert.match(issue, /not revenue forecasts/);
  assert.match(issue, /restricted license/);
  assert.equal((issue.match(/→ Open the .+ template\]/g) || []).length, 3);
  assert.ok(!/\{(studio|skill:)/.test(issue), 'unfilled placeholder');
  assert.ok(!/undefined|NaN/.test(issue));
  const scores = [...issue.matchAll(/\*\*#\d+ · .+? · (\d+)\/20/g)].map((m) => Number(m[1]));
  assert.equal(scores.length, playbook.businesses.length);
  for (const line of issue.matchAll(/Demand (\d) .*?· Tools (\d).*?· Autonomy (\d) · Buyers (\d)/g)) assert.ok(line.slice(1).every((n) => n >= 1 && n <= 5));
  const own = /suede-creator-skills\/|suede-ai\//i;
  for (const m of issue.matchAll(/https:\/\/suedeai\.directory\/([^)\s#]+)/g)) assert.ok(!own.test(m[1]), m[1]);
  if (breakout.repos[0]) assert.ok(issue.includes(breakout.repos[0].url));
});

test('GitHub star buttons appear on every directory page and in every outgoing message', () => {
  const repo = 'https://github.com/JasonColapietro/suede-creator-skills';
  const stars = JSON.parse(read('directory/growth/github-stars.json')).snapshots.at(-1).stars['JasonColapietro/suede-creator-skills'];
  const count = (html) => (html.match(/data-gh-star/g) || []).length;
  for (const page of ['docs/directory/coreyhaines31/marketingskills/cold-email/index.html', 'docs/directory/topics/sales/index.html']) {
    const html = read(page);
    assert.equal(count(html), 2, `${page}: nav + footer`);
    assert.ok(html.includes(`href="${repo}" target="_blank" rel="noopener" data-gh-star`), page);
    if (Number.isInteger(stars)) assert.match(html, new RegExp(`gh-star-count">${stars.toLocaleString('en-US')}<`));
  }
  for (const page of ['index', 'finder/index', 'badges/index', 'rising/index', 'state-of-agent-skills/index', 'submit/index'])
    assert.equal(count(read(`docs/directory/${page}.html`)), 3, `${page}: nav + panel + footer`);
  assert.ok(read(`directory/growth/issues/${breakout.date}.md`).includes(repo) || issue.includes(repo));
  assert.ok(issue.includes(`[Star the directory on GitHub](${repo})`));
  assert.ok(read('directory/growth/badge-outreach.md').includes(`P.S. The directory and its grading rubric are open source. A star on GitHub puts graded skills in front of more builders: ${repo}`));
  assert.equal(brief(feed, ['sales']).star, repo);
  assert.match(read('directory/suede-directory/SKILL.md'), /star the directory on\nGitHub/);
});
