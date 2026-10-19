// Read-only verification of the deployed directory. No external skill code runs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const site = 'https://skills.suedeai.ai';
const output = process.env.DIRECTORY_SCREENSHOTS || '/tmp/directory-production-evidence';
fs.mkdirSync(output, { recursive: true });
const expectedIndex = JSON.parse(fs.readFileSync('docs/directory/search-index.json'));
const manifest = JSON.parse(fs.readFileSync('directory/intake/major-coverage-2026-10-19.json'));
const requests = [];
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');

async function get(route, expectedStatus = 200) {
  const url = new URL(route, site);
  assert.equal(url.origin, site, 'verification stays on the production origin');
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  const body = await response.text();
  requests.push({ path: url.pathname, status: response.status, sha256: digest(body), etag: response.headers.get('etag') });
  assert.equal(response.status, expectedStatus, url.href);
  return body;
}

let index;
for (let attempt = 0; attempt < 12; attempt++) {
  index = JSON.parse(await get('/directory/search-index.json'));
  try {
    assert.deepEqual(index, expectedIndex);
    break;
  } catch (error) {
    if (attempt === 11) throw error;
    console.log('Waiting for canonical production search index to match the deployed snapshot.');
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
}
assert.equal(index.length, 3794);
assert.equal(new Set(index.map((s) => s.repo.toLowerCase())).size, 158);
assert.equal(new Set(index.map((s) => s.category)).size, 16);
assert.equal(manifest.snapshot_id, 'ada0c6157c754c7f8e78c4019690b7f7');
assert.equal(manifest.projects.length, 19);

for (const route of ['/directory/', '/directory/featured/', '/directory/submit/', '/directory/methodology/', '/directory/frontend-design/', '/sitemap.xml']) {
  await get(route);
}
for (const route of ['/assets/directory.js', '/assets/directory.css']) {
  assert.equal(digest(await get(route)), digest(fs.readFileSync(path.join('docs', route))));
}

const projects = [];
for (const project of manifest.projects) {
  const members = index.filter((s) => s.repo.toLowerCase() === project.repository.toLowerCase());
  assert.equal(members.length, project.skill_count, project.repository);
  const sample = members.find((s) => s.full) || members[0];
  const repoRoute = sample.report.split('/').slice(0, -2).join('/') + '/';
  // Single-skill sources can use the individual listing as their landing page.
  const landingRoute = fs.existsSync(path.join('docs', repoRoute, 'index.html')) ? repoRoute : sample.href;
  const html = await get(landingRoute);
  assert.ok(!html.includes('Install every skill'), project.repository + ' must preserve scoped installation');
  const report = JSON.parse(await get(sample.report));
  assert.equal(report.source.revision, project.source_revision);
  assert.equal(report.snapshot.id, manifest.snapshot_id);
  assert.equal(report.snapshot.dataset_sha256, manifest.dataset_sha256);
  assert.equal(report.methodology.version, 'graded-v2');
  assert.equal(report.methodology.rubric_total, 100);
  assert.equal(report.methodology.published_cap, 99);
  assert.equal(report.security_scan_status, 'not_scanned');
  assert.equal(report.quality.score, sample.score);
  assert.equal(report.listing_url, site + sample.href);
  projects.push({ repository: project.repository, skills: members.length, report: sample.report, revision: report.source.revision });
}

const withheld = [
  ['github/awesome-copilot', 'x-twitter-scraper'],
  ['github/awesome-copilot', 'latchshot-page-capture'],
  ['apify/agent-skills', 'apify-actorization'],
  ['apify/agent-skills', 'apify-ultimate-scraper'],
  ['aws/agent-toolkit-for-aws', 'aws-social-messaging'],
  ['anthropics/claude-plugins-official', 'example-command'],
];
for (const [repo, name] of withheld) {
  assert.ok(!index.some((s) => s.repo.toLowerCase() === repo && s.name === name));
  await get('/directory/' + repo + '/' + name + '/report.json', 404);
}

const impeccableRoute = '/directory/pbakaus/impeccable/impeccable/';
const impeccable = JSON.parse(await get(impeccableRoute + 'report.json'));
assert.deepEqual(impeccable, JSON.parse(fs.readFileSync('docs' + impeccableRoute + 'report.json')));
assert.equal(impeccable.quality.score, 86);
assert.equal(impeccable.quality.grade, 'B');
assert.equal(impeccable.source.revision, '2f46b7a8b059af00d20dd13b64dbe165e7c6a742');
for (const badge of impeccable.badges) {
  const route = new URL(badge.src).pathname;
  assert.equal(await get(route), fs.readFileSync('docs' + route, 'utf8'));
}

// Reuse the reviewed browser flow against the real origin. Its temporary local
// static server is unused; the product files and production origin are unchanged.
const browserSource = fs.readFileSync('tests/test_directory_browser.mjs', 'utf8');
const marker = "const base = 'http://127.0.0.1:' + server.address().port;";
assert.equal(browserSource.split(marker).length, 2, 'browser harness base must be unique');
const temporaryBrowserTest = 'tests/.directory-production-browser.mjs';
try {
  fs.writeFileSync(temporaryBrowserTest, browserSource.replace(marker, `const base = '${site}';`));
  const result = spawnSync(process.execPath, [temporaryBrowserTest], {
    stdio: 'inherit', env: { ...process.env, DIRECTORY_SCREENSHOTS: output }, timeout: 240000,
  });
  assert.equal(result.status, 0, 'production browser flows must pass');
} finally {
  fs.rmSync(temporaryBrowserTest, { force: true });
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 } });
    const response = await page.goto(site + impeccableRoute + '#check');
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    const text = await page.locator('#check').innerText();
    assert.match(text, /86\/100 · B/);
    assert.match(text, /2f46b7a8b059/);
    assert.match(text, /not scanned/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const review = new URL(await page.getByRole('link', { name: 'Request a fresh review', exact: true }).getAttribute('href'));
    assert.equal(review.searchParams.get('skill-scope'), 'impeccable');
    assert.ok(review.searchParams.get('details').includes(manifest.snapshot_id));
    await page.locator('#check').screenshot({ path: path.join(output, 'impeccable-live-' + width + '.png') });
    await page.close();
  }
} finally {
  await browser.close();
}

const receipt = {
  checked_at: new Date().toISOString(), site,
  deployed_commit: process.env.DIRECTORY_DEPLOYED_SHA,
  verification_commit: process.env.GITHUB_SHA,
  snapshot_id: manifest.snapshot_id, dataset_sha256: manifest.dataset_sha256,
  skills: index.length, repositories: 158, categories: 16,
  reviewed_projects: projects, withheld_names_absent: withheld,
  impeccable: { score: 86, grade: 'B', revision: impeccable.source.revision, report_version: impeccable.report_version },
  browser_flows: 'passed on production: reports/downloads/recheck scope; shortlist limits, persistence and export; desktop/mobile layouts; keyboard; no-JS and failed-search recovery',
  external_directory_skill_code_executed: false,
  requests, passed: true,
};
fs.writeFileSync(path.join(output, 'verification-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ passed: true, site, skills: 3794, repositories: 158, projects: 19, impeccable: '86/B', receipt: path.join(output, 'verification-receipt.json') }));
