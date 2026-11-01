// Client behaviour of docs/assets/directory.js against the browse contract
// markup (table tools, save list, share row, hub facets), driven in Chromium.
// Fixtures are built inline so the test does not depend on generated pages;
// the renderer emits the same attributes and classes used here.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// ESM import ignores NODE_PATH; fall back to require for a globally installed Playwright.
const { chromium } = await import(process.env.DIRECTORY_PLAYWRIGHT_MODULE || 'playwright').catch(() => createRequire(import.meta.url)('playwright'));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(root, 'docs/assets/directory.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'docs/assets/directory.css'), 'utf8');
assert.ok(!/<\/script/i.test(script), 'the script can be inlined');

const origin = 'https://suede.test';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const gradeOf = (score) => (score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D');

// Six rows: three in the main table, three behind the "more" details.
const skills = [
  { id: 'owner/repo/alpha-audit', name: 'alpha-audit', score: 72, updated: '2026-09-01', listed: '2026-05-01', cited: 4, lane: 'free-open-source', flags: 'scripts official', featured: 1, desc: 'Audits a site for search problems.' },
  { id: 'owner/repo/beta-build', name: 'beta-build', score: 91, updated: '2026-10-20', listed: '2026-10-01', cited: 1, lane: 'free-with-service', flags: 'mcp api-key', featured: 1, desc: 'Builds a React checkout.' },
  { id: 'owner/repo/gamma-guide', name: 'gamma-guide', score: 85, updated: '2026-07-15', listed: '2026-03-10', cited: 9, lane: 'free-open-source', flags: 'references', featured: 1, desc: 'Writes guides for React teams.' },
  { id: 'owner/repo/delta-deploy', name: 'delta-deploy', score: 64, updated: '2026-10-28', listed: '2026-10-25', cited: 0, lane: 'restricted', flags: 'runs-commands', featured: 0, desc: 'Deploys to Vercel.' },
  { id: 'owner/repo/epsilon-email', name: 'epsilon-email', score: 88, updated: '2026-01-05', listed: '2025-12-01', cited: 2, lane: 'noncommercial', flags: 'scripts', featured: 0, desc: 'Drafts email sequences.' },
  { id: 'owner/repo/zeta-zip', name: 'zeta-zip', score: 79, updated: '2026-06-30', listed: '2026-02-14', cited: 7, lane: 'free-open-source', flags: 'markdown-only', featured: 0, desc: 'Packs a React component library.' },
];
const saveAttrs = (s) => `data-save="${esc(s.id)}" data-save-name="${esc(s.name)}" data-save-href="../owner/repo/${s.name}/" data-save-repo="owner/repo" data-save-score="${s.score}" data-save-grade="${gradeOf(s.score)}" data-save-category="Marketing" data-save-license="MIT"`;
const row = (s) => `<tr id="${s.name}" data-id="${esc(s.id)}" data-name="${s.name}" data-score="${s.score}" data-updated="${s.updated}" data-listed="${s.listed}" data-cited="${s.cited}" data-lane="${s.lane}" data-flags="${s.flags}" data-featured="${s.featured}">`
  + `<td class="name"><a href="../owner/repo/${s.name}/">${s.name}</a> <span class="grade grade-${gradeOf(s.score).toLowerCase()}">${s.score}/100 · ${gradeOf(s.score)}</span> `
  + `<button type="button" class="save-row" ${saveAttrs(s)} aria-pressed="false" aria-label="Save ${s.name}">Save</button></td>`
  + `<td class="meta"><a href="../owner/repo/">owner/repo</a></td>`
  + `<td class="desc">${esc(s.desc)}<details class="row-badges"><summary>Get badges</summary><code>badge-${s.name}</code></details></td></tr>`;
const table = (id, rows) => `<div class="table-wrap"><table class="skill-table" id="${id}" data-filter-group="all-skills"><thead><tr><th scope="col">Skill</th><th scope="col">Repository</th><th scope="col">What it does</th></tr></thead><tbody>\n${rows.map(row).join('\n')}\n</tbody></table></div>`;
const chip = (facet, value, label, count) => `<button type="button" class="facet-chip" data-facet="${facet}" data-value="${value}" aria-pressed="false">${label} <span class="count-chip">${count}</span></button>`;
const lanes = [['free-open-source', 'Free and open source'], ['free-with-service', 'Free skill, needs a service'], ['noncommercial', 'Non-commercial license'], ['restricted', 'Restricted license']];
const flags = [['official', 'Official publisher'], ['scripts', 'Bundles scripts'], ['references', 'Bundles reference files'], ['mcp', 'Uses an MCP server'], ['markdown-only', 'SKILL.md only']];

const shell = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>`
  + `<style>:root{--gold:#c8a96e;--cream:#f0ece4;--muted:#888880;--bg:#080808;--surface:#111111;--border:#222222;--hairline:#292824;--mono:monospace;--card:#161615;}body{background:#080808;color:#f0ece4;}${css}</style></head>`
  + `<body><header><nav class="nav-links"><a href="/directory/">Skills</a><a href="/directory/saved/" data-saved-link>Saved <span class="count-chip" data-saved-count hidden></span></a></nav></header>`
  + `<main class="directory">${body}</main><script>${script}</script></body></html>`;

const categoryPage = shell('Marketing skills', `
  <h1>Marketing skills</h1>
  <button type="button" class="save-button" data-save="owner/repo/eta-extra" data-save-name="eta-extra" data-save-href="./eta-extra/" data-save-repo="owner/repo" data-save-score="83" data-save-grade="B" data-save-category="Marketing" data-save-license="Apache-2.0" aria-pressed="false">Save</button>
  <div class="share" data-share><span class="share-label">Share</span><a href="https://x.com/intent/post?url=${encodeURIComponent(origin + '/directory/marketing-seo/')}" target="_blank" rel="noopener">X</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(origin + '/directory/marketing-seo/')}" target="_blank" rel="noopener">LinkedIn</a><button type="button" data-copy-url="${origin}/directory/marketing-seo/">Copy link</button></div>
  <div class="table-tools" data-table-tools="all-skills" hidden>
    <label class="tools-label" for="all-skills-sort">Sort by</label>
    <select id="all-skills-sort" data-sort-for="all-skills">
      <option value="listing">Full pages first, then name</option><option value="score">Quality score</option>
      <option value="name">Name A to Z</option><option value="updated">Recently updated</option>
      <option value="listed">Newest listings</option><option value="cited">Most cited</option>
    </select>
    <fieldset class="facet-chips" data-facet-for="all-skills"><legend>Cost</legend>${lanes.map(([value, label]) => chip('lane', value, label, skills.filter((s) => s.lane === value).length)).join('')}</fieldset>
    <fieldset class="facet-chips" data-facet-for="all-skills"><legend>Capabilities</legend>${flags.map(([value, label]) => chip('flag', value, label, skills.filter((s) => s.flags.split(' ').includes(value)).length)).join('')}</fieldset>
    <button type="button" class="tools-reset" data-tools-reset>Reset</button>
  </div>
  <div class="table-filter" hidden><label class="filter-label" for="all-skills-filter">Filter by name, repository or task</label>
  <div class="search-line"><input id="all-skills-filter" class="filter" type="search" placeholder="Search 6 skills" data-filter-for="all-skills" data-filter-status="all-skills-status" autocomplete="off"><button type="button" data-table-clear>Clear</button></div><p id="all-skills-status" class="muted" role="status" aria-live="polite"></p><p data-table-empty hidden>No matching skills. Try fewer words or clear your search.</p></div>
  ${table('all-skills', skills.slice(0, 3))}
  <details class="more-rows" data-filter-group="all-skills"><summary>Show the other 3 marketing skills</summary>${table('all-skills-more', skills.slice(3))}</details>
`);

const savedPage = shell('Saved skills', `
  <h1>Saved skills</h1>
  <section data-saved-page>
    <p data-saved-empty>Nothing saved yet. Use Save on any skill page or table row.</p>
    <div class="table-wrap"><table class="skill-table" data-saved-table><thead><tr><th scope="col">Skill</th><th scope="col">Score</th><th scope="col">Grade</th><th scope="col">Category</th><th scope="col">License</th><th scope="col">Repository</th><th scope="col">Remove</th></tr></thead><tbody></tbody></table></div>
    <button type="button" data-saved-clear>Clear all</button>
    <details data-saved-export hidden><summary>Copy as Markdown</summary><div class="snippet"><div class="snippet-head"><span>Markdown</span><button type="button" class="snippet-copy" data-copy-target="saved-markdown">Copy</button></div><pre><code id="saved-markdown"></code></pre></div></details>
  </section>
`);

const hubPage = shell('Skills directory', `
  <section class="directory-browser" id="browse" data-directory-browser>
    <form class="discovery-controls" role="search" hidden>
      <label for="directory-query">Search skills</label>
      <div class="search-line"><input id="directory-query" name="q" type="search" autocomplete="off"><button type="button" data-clear>Clear</button><kbd aria-hidden="true">Ctrl K</kbd></div>
      <div class="discovery-filters">
        <label>Category<select name="category"><option value="">All categories</option><option value="marketing-seo">Marketing</option></select></label>
        <label>Quality grade<select name="grade"><option value="">All grades</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></label>
        <label>Cost<select name="lane"><option value="">All</option>${lanes.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>
        <label>Capability<select name="flag"><option value="">All</option>${flags.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>
        <label>Sort by<select name="sort"><option value="curated">Most-cited collections</option><option value="name">Name A to Z</option><option value="score">Quality score</option><option value="listed">Newest listings</option><option value="updated">Recently updated</option></select></label>
      </div>
    </form>
    <div class="discovery-layout">
      <aside class="category-rail"><details open><summary>Browse categories</summary><nav aria-label="Skill categories"><a href="./" data-category="" aria-current="true">All skills</a><a href="marketing-seo/" data-category="marketing-seo">Marketing</a></nav></details></aside>
      <div class="discovery-content">
        <div class="result-heading"><h3 data-result-title>Start exploring</h3><span class="muted" role="status" aria-live="polite" data-results-status></span></div>
        <div data-search-error hidden><p>Search could not load.</p><button type="button" data-retry>Try again</button></div>
        <div class="search-loading" hidden aria-hidden="true"><span></span></div>
        <div data-search-results></div>
        <div class="search-empty" hidden><h3>No skills match these filters</h3><button type="button" data-reset>Clear all filters</button></div>
        <button type="button" class="load-more" data-load-more hidden>Show more skills</button>
      </div>
    </div>
  </section>
`);

const record = (name, score, extra) => ({ id: 'owner/repo/' + name, name, slug: name, repo: 'owner/repo', description: 'Does ' + name, category: 'marketing-seo', label: 'Marketing', license: 'MIT', grade: gradeOf(score), score, href: '/directory/owner/repo/' + name + '/', full: true, report: '/directory/owner/repo/' + name + '/report.json', snapshot: '2026-10-22', method: 'graded-v2', ...extra });
const searchIndex = [
  record('alpha-audit', 72, { lane: 'free-open-source', flags: ['scripts', 'official'], topics: ['seo'], listed: '2026-05-01', updated: '2026-10-30' }),
  record('beta-build', 91, { lane: 'free-with-service', flags: ['mcp'], topics: ['react'], listed: '2026-10-01', updated: '2026-10-20' }),
  { ...record('old-record', 80, {}), id: undefined }, // an index entry from before the id and facet fields existed
];

const routes = { '/directory/marketing-seo/': categoryPage, '/directory/saved/': savedPage, '/directory/': hubPage };
let browser;
let context;
let page;
const errors = [];
const trackErrors = (target) => target.on('pageerror', (err) => errors.push(err.message));
const names = (target, selector, visibleOnly = false) => target.$$eval(selector + ' tbody tr', (rows, visibleOnly) => rows.filter((r) => !visibleOnly || !r.hidden).map((r) => r.dataset.name), visibleOnly);
const status = (target) => target.locator('#all-skills-status').textContent();
const url = (target) => new URL(target.url());
const stored = (target) => target.evaluate(() => JSON.parse(localStorage.getItem('suede-directory-saved') || 'null'));
// Copy labels change after the async clipboard call settles.
const labelBecomes = (locator, text) => locator.evaluate((el, text) => new Promise((resolve, reject) => {
  const done = () => el.textContent === text;
  if (done()) return resolve();
  const observer = new MutationObserver(() => { if (done()) { observer.disconnect(); resolve(); } });
  observer.observe(el, { childList: true, characterData: true, subtree: true });
  setTimeout(() => { observer.disconnect(); reject(new Error('label stayed ' + JSON.stringify(el.textContent) + ', wanted ' + text)); }, 3000);
}), text);
const toolsReady = (target) => target.waitForFunction(() => document.querySelector('[data-table-tools]')?.hidden === false);
async function serve(target) {
  await target.route('**/*', (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === '/directory/search-index.json') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(searchIndex) });
    if (routes[pathname]) return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: routes[pathname] });
    return route.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' });
  });
}

before(async () => {
  browser = await chromium.launch({ headless: true, ...(process.env.DIRECTORY_CHROMIUM ? { executablePath: process.env.DIRECTORY_CHROMIUM } : {}), args: ['--no-sandbox'] });
  context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  await serve(context);
  page = await context.newPage();
  trackErrors(page);
});
after(async () => { await browser.close(); });

test('sorting by score reorders rows across the main and more tables; listing restores the build order', async () => {
  await page.goto(origin + '/directory/marketing-seo/');
  await toolsReady(page);
  assert.ok(await page.locator('.table-filter').isVisible());
  assert.deepEqual(await names(page, '#all-skills'), ['alpha-audit', 'beta-build', 'gamma-guide']);
  assert.deepEqual(await names(page, '#all-skills-more'), ['delta-deploy', 'epsilon-email', 'zeta-zip']);
  assert.equal(await status(page), '6 of 6 skills');
  await page.selectOption('[data-sort-for="all-skills"]', 'score');
  assert.deepEqual(await names(page, '#all-skills'), ['beta-build', 'epsilon-email', 'gamma-guide']);
  assert.deepEqual(await names(page, '#all-skills-more'), ['zeta-zip', 'alpha-audit', 'delta-deploy']);
  assert.equal(url(page).searchParams.get('sort'), 'score');
  assert.equal(await page.locator('details[data-filter-group="all-skills"]').evaluate((el) => el.open), false, 'sorting alone does not open the more rows');
  await page.selectOption('[data-sort-for="all-skills"]', 'updated');
  assert.deepEqual(await names(page, '#all-skills'), ['delta-deploy', 'beta-build', 'alpha-audit']);
  await page.selectOption('[data-sort-for="all-skills"]', 'listed');
  assert.deepEqual(await names(page, '#all-skills'), ['delta-deploy', 'beta-build', 'alpha-audit']);
  assert.deepEqual(await names(page, '#all-skills-more'), ['gamma-guide', 'zeta-zip', 'epsilon-email']);
  await page.selectOption('[data-sort-for="all-skills"]', 'cited');
  assert.deepEqual(await names(page, '#all-skills'), ['gamma-guide', 'zeta-zip', 'alpha-audit']);
  await page.selectOption('[data-sort-for="all-skills"]', 'name');
  assert.deepEqual(await names(page, '#all-skills'), ['alpha-audit', 'beta-build', 'delta-deploy']);
  await page.selectOption('[data-sort-for="all-skills"]', 'listing');
  assert.deepEqual(await names(page, '#all-skills'), ['alpha-audit', 'beta-build', 'gamma-guide']);
  assert.deepEqual(await names(page, '#all-skills-more'), ['delta-deploy', 'epsilon-email', 'zeta-zip']);
  assert.equal(url(page).searchParams.has('sort'), false, 'the default sort leaves the URL clean');
  // Row anchors travel with the rows, so deep links keep working after a sort.
  assert.equal(await page.locator('#all-skills-more tr#delta-deploy').count(), 1);
  assert.deepEqual(errors, []);
});

test('a lane chip hides non-matching rows, combines with text terms, ORs inside a facet and ANDs across facets', async () => {
  await page.goto(origin + '/directory/marketing-seo/');
  await toolsReady(page);
  const lane = (value) => page.locator(`[data-facet="lane"][data-value="${value}"]`);
  const flag = (value) => page.locator(`[data-facet="flag"][data-value="${value}"]`);
  for (const button of await page.locator('.facet-chip, .tools-reset, .save-row, .save-button, [data-copy-url]').all()) {
    if (!await button.isVisible()) continue;
    const box = await button.boundingBox();
    assert.ok(box && box.height >= 44, 'tap target of 44px for ' + await button.textContent());
  }
  await lane('free-open-source').click();
  assert.equal(await lane('free-open-source').getAttribute('aria-pressed'), 'true');
  assert.deepEqual(await names(page, '#all-skills', true), ['alpha-audit', 'gamma-guide']);
  assert.deepEqual(await names(page, '#all-skills-more', true), ['zeta-zip']);
  assert.equal(await status(page), '3 of 6 skills');
  assert.equal(url(page).searchParams.get('lane'), 'free-open-source');
  assert.equal(await page.locator('details[data-filter-group="all-skills"]').evaluate((el) => el.open), true, 'matches behind the more rows are revealed');
  await page.fill('[data-filter-for="all-skills"]', 'react');
  assert.deepEqual(await names(page, '#all-skills', true), ['gamma-guide']);
  assert.deepEqual(await names(page, '#all-skills-more', true), ['zeta-zip']);
  assert.equal(await status(page), '2 of 6 skills');
  await lane('noncommercial').click();
  assert.equal(url(page).searchParams.get('lane'), 'free-open-source,noncommercial');
  assert.equal(await status(page), '2 of 6 skills', 'a second lane widens the facet but the text term still applies');
  await flag('scripts').click();
  assert.equal(url(page).searchParams.get('flag'), 'scripts');
  assert.equal(await status(page), '0 of 6 skills');
  assert.ok(await page.locator('[data-table-empty]').isVisible());
  assert.equal(await page.locator('#all-skills').evaluate((el) => el.closest('.table-wrap').hidden), true);
  assert.equal(await page.locator('details[data-filter-group="all-skills"]').evaluate((el) => el.hidden), true);
  await page.click('[data-table-clear]');
  assert.equal(await page.locator('[data-filter-for="all-skills"]').inputValue(), '');
  assert.deepEqual(await names(page, '#all-skills', true), ['alpha-audit']);
  assert.deepEqual(await names(page, '#all-skills-more', true), ['epsilon-email']);
  assert.ok(await page.locator('[data-table-empty]').isHidden());
  assert.equal(url(page).searchParams.get('lane'), 'free-open-source,noncommercial', 'clearing the text keeps the facets');
  // Badge snippets and save buttons stay out of the searchable text.
  await page.click('[data-tools-reset]');
  for (const noise of ['badge', 'save']) {
    await page.fill('[data-filter-for="all-skills"]', noise);
    assert.equal(await status(page), '0 of 6 skills', noise + ' is not searchable');
  }
  await page.keyboard.press('Escape');
  assert.equal(await status(page), '6 of 6 skills');
  assert.deepEqual(errors, []);
});

test('URL state is read on load and reset restores sort, facets and the text filter', async () => {
  await page.goto(origin + '/directory/marketing-seo/?sort=score&lane=free-open-source&flag=scripts,official&utm_source=test#all-skills');
  await toolsReady(page);
  assert.equal(await page.locator('[data-sort-for="all-skills"]').inputValue(), 'score');
  assert.deepEqual(await page.$$eval('.facet-chip[aria-pressed="true"]', (chips) => chips.map((c) => c.dataset.facet + '=' + c.dataset.value)), ['lane=free-open-source', 'flag=official', 'flag=scripts']);
  assert.equal(await status(page), '1 of 6 skills');
  assert.deepEqual(await names(page, '#all-skills', true), []);
  assert.deepEqual(await names(page, '#all-skills-more', true), ['alpha-audit']);
  assert.equal(await page.locator('#all-skills').evaluate((el) => el.closest('.table-wrap').hidden), true);
  assert.equal(await page.locator('details[data-filter-group="all-skills"]').evaluate((el) => el.open), true);
  await page.fill('[data-filter-for="all-skills"]', 'audit');
  await page.click('[data-tools-reset]');
  assert.equal(await page.locator('[data-sort-for="all-skills"]').inputValue(), 'listing');
  assert.equal(await page.locator('.facet-chip[aria-pressed="true"]').count(), 0);
  assert.equal(await page.locator('[data-filter-for="all-skills"]').inputValue(), '');
  assert.equal(await status(page), '6 of 6 skills');
  assert.deepEqual(await names(page, '#all-skills'), ['alpha-audit', 'beta-build', 'gamma-guide']);
  assert.deepEqual(await names(page, '#all-skills-more'), ['delta-deploy', 'epsilon-email', 'zeta-zip']);
  assert.equal(await page.locator('details[data-filter-group="all-skills"]').evaluate((el) => el.open), false, 'the more rows close again once no filter is active');
  const after = url(page);
  assert.deepEqual([...after.searchParams.keys()], ['utm_source'], 'reset drops sort, lane and flag and keeps other params');
  assert.equal(after.hash, '#all-skills');
  // Unknown values in the URL are ignored rather than breaking the page.
  await page.goto(origin + '/directory/marketing-seo/?sort=bogus&lane=bogus&flag=');
  await toolsReady(page);
  assert.equal(await page.locator('[data-sort-for="all-skills"]').inputValue(), 'listing');
  assert.equal(await status(page), '6 of 6 skills');
  assert.deepEqual(errors, []);
});

test('saving a skill updates aria-pressed, the nav count and localStorage, and survives a reload', async () => {
  await page.goto(origin + '/directory/marketing-seo/');
  await toolsReady(page);
  await page.evaluate(() => localStorage.removeItem('suede-directory-saved'));
  await page.reload();
  await toolsReady(page);
  const count = page.locator('[data-saved-count]');
  assert.ok(await count.isHidden());
  const rowButton = page.locator('.save-row[data-save="owner/repo/beta-build"]');
  await rowButton.click();
  assert.equal(await rowButton.getAttribute('aria-pressed'), 'true');
  assert.equal(await rowButton.textContent(), 'Saved');
  assert.ok(await count.isVisible());
  assert.equal(await count.textContent(), '1');
  const [item] = await stored(page);
  assert.deepEqual({ ...item, saved: undefined }, { id: 'owner/repo/beta-build', name: 'beta-build', href: '/directory/owner/repo/beta-build/', repo: 'owner/repo', score: 91, grade: 'A', category: 'Marketing', license: 'MIT', saved: undefined });
  assert.ok(Number.isFinite(Date.parse(item.saved)));
  const pageButton = page.locator('.save-button');
  await pageButton.click();
  assert.equal(await pageButton.getAttribute('aria-pressed'), 'true');
  assert.equal(await pageButton.textContent(), 'Saved');
  assert.equal(await count.textContent(), '2');
  assert.deepEqual((await stored(page)).map((s) => s.href), ['/directory/owner/repo/beta-build/', '/directory/marketing-seo/eta-extra/']);
  await rowButton.click();
  assert.equal(await rowButton.getAttribute('aria-pressed'), 'false');
  assert.equal(await rowButton.textContent(), 'Save');
  assert.equal(await count.textContent(), '1');
  await page.reload();
  await toolsReady(page);
  assert.equal(await page.locator('.save-button').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('.save-button').textContent(), 'Saved');
  assert.equal(await page.locator('.save-row[data-save="owner/repo/beta-build"]').getAttribute('aria-pressed'), 'false');
  assert.equal(await page.locator('[data-saved-count]').textContent(), '1');
  assert.deepEqual(errors, []);
});

test('the saved page renders the saved rows with Markdown export; remove and clear all work', async () => {
  await page.goto(origin + '/directory/marketing-seo/');
  await toolsReady(page);
  await page.evaluate(() => localStorage.removeItem('suede-directory-saved'));
  await page.reload();
  await toolsReady(page);
  await page.locator('.save-row[data-save="owner/repo/gamma-guide"]').click();
  await page.locator('.save-button').click();
  await page.locator('[data-saved-link]').click();
  await page.waitForURL(origin + '/directory/saved/');
  await page.waitForFunction(() => document.querySelector('[data-saved-empty]')?.hidden === true);
  const rows = page.locator('[data-saved-table] tbody tr');
  assert.equal(await rows.count(), 2);
  assert.deepEqual(await page.$$eval('[data-saved-table] tbody tr', (trs) => trs.map((tr) => [...tr.cells].map((td) => td.textContent.trim()))), [
    ['gamma-guide', '85/100', 'B', 'Marketing', 'MIT', 'owner/repo', 'Remove'],
    ['eta-extra', '83/100', 'B', 'Marketing', 'Apache-2.0', 'owner/repo', 'Remove'],
  ]);
  assert.equal(await rows.first().locator('a').first().getAttribute('href'), '/directory/owner/repo/gamma-guide/');
  assert.equal(await rows.first().locator('td.meta a').getAttribute('href'), 'https://github.com/owner/repo');
  assert.ok(await page.locator('[data-saved-table]').isVisible());
  assert.ok(await page.locator('[data-saved-clear]').isVisible());
  assert.ok(await page.locator('[data-saved-export]').isVisible());
  const markdown = await page.locator('#saved-markdown').textContent();
  assert.ok(markdown.startsWith('# Saved skills\n\n- [gamma-guide](https://suede.test/directory/owner/repo/gamma-guide/) · 85/100 · B · MIT · owner/repo · Marketing\n- [eta-extra](https://suede.test/directory/marketing-seo/eta-extra/) · 83/100 · B · Apache-2.0 · owner/repo · Marketing'), markdown);
  assert.ok(!markdown.includes('\u2014'), 'no em dash in the export');
  await page.locator('[data-saved-export] > summary').click();
  await page.locator('[data-copy-target="saved-markdown"]').click();
  await labelBecomes(page.locator('[data-copy-target="saved-markdown"]'), 'Copied');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), markdown.trim());
  await rows.first().locator('[data-saved-remove]').click();
  assert.equal(await rows.count(), 1);
  assert.equal(await rows.first().locator('a').first().textContent(), 'eta-extra');
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-saved-remove')), 'owner/repo/eta-extra', 'focus moves to the next remove button');
  assert.equal(await page.locator('[data-saved-count]').textContent(), '1');
  assert.deepEqual((await stored(page)).map((s) => s.id), ['owner/repo/eta-extra']);
  await page.locator('[data-saved-clear]').click();
  assert.equal(await rows.count(), 0);
  assert.ok(await page.locator('[data-saved-empty]').isVisible());
  assert.ok(await page.locator('[data-saved-table]').isHidden());
  assert.ok(await page.locator('[data-saved-clear]').isHidden());
  assert.ok(await page.locator('[data-saved-export]').isHidden());
  assert.ok(await page.locator('[data-saved-count]').isHidden());
  assert.deepEqual(await stored(page), []);
  assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute('data-saved-empty')), true);
  // Corrupt storage is treated as an empty list.
  await page.evaluate(() => localStorage.setItem('suede-directory-saved', '{not json'));
  await page.reload();
  await page.waitForFunction(() => document.querySelector('[data-saved-empty]')?.hidden === false);
  assert.equal(await rows.count(), 0);
  assert.deepEqual(errors, []);
});

test('the page works when localStorage is blocked: saving lasts the page view and nothing throws', async () => {
  const blocked = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await serve(blocked);
  await blocked.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } });
  });
  const target = await blocked.newPage();
  const blockedErrors = [];
  target.on('pageerror', (err) => blockedErrors.push(err.message));
  await target.goto(origin + '/directory/marketing-seo/');
  await toolsReady(target);
  const button = target.locator('.save-row[data-save="owner/repo/alpha-audit"]');
  await button.click();
  assert.equal(await button.getAttribute('aria-pressed'), 'true');
  assert.equal(await target.locator('[data-saved-count]').textContent(), '1');
  await target.locator('[data-facet="flag"][data-value="official"]').click();
  assert.equal(await target.locator('#all-skills-status').textContent(), '1 of 6 skills');
  assert.ok(await target.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal overflow at phone width');
  assert.deepEqual(blockedErrors, []);
  await blocked.close();
});

test('copy link changes the button text and falls back to selectable text without a clipboard', async () => {
  await page.goto(origin + '/directory/marketing-seo/');
  await toolsReady(page);
  const copy = page.locator('[data-copy-url]');
  await copy.click();
  await labelBecomes(copy, 'Copied');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), origin + '/directory/marketing-seo/');
  assert.equal(await page.locator('.share-url').count(), 0);
  await page.waitForFunction(() => document.querySelector('[data-copy-url]').textContent === 'Copy link', null, { timeout: 5000 });
  const noClipboard = await browser.newContext();
  await serve(noClipboard);
  await noClipboard.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: undefined }); });
  const target = await noClipboard.newPage();
  const fallbackErrors = [];
  target.on('pageerror', (err) => fallbackErrors.push(err.message));
  await target.goto(origin + '/directory/marketing-seo/');
  await toolsReady(target);
  await target.locator('[data-copy-url]').click();
  await labelBecomes(target.locator('[data-copy-url]'), 'Select text to copy');
  assert.equal(await target.locator('.share-url').textContent(), origin + '/directory/marketing-seo/');
  assert.equal(await target.evaluate(() => String(window.getSelection())), origin + '/directory/marketing-seo/');
  await target.locator('[data-copy-url]').click();
  assert.equal(await target.locator('.share-url').count(), 1, 'a second click reuses the printed address');
  assert.deepEqual(fallbackErrors, []);
  await noClipboard.close();
  assert.deepEqual(errors, []);
});

test('hub search filters by cost lane and capability, sorts by listed and updated, keeps URL state and tolerates old records', async () => {
  const ready = (text) => page.waitForFunction((text) => document.querySelector('[data-results-status]')?.textContent === text, text);
  const shown = () => page.$$eval('[data-search-results] h3 a', (links) => links.map((a) => a.textContent));
  await page.goto(origin + '/directory/');
  await ready('Showing 3 of 3 skills');
  await page.selectOption('select[name="lane"]', 'free-open-source');
  await ready('Showing 1 of 1 skills');
  assert.deepEqual(await shown(), ['alpha-audit']);
  assert.equal(url(page).searchParams.get('lane'), 'free-open-source');
  await page.selectOption('select[name="lane"]', '');
  await page.selectOption('select[name="flag"]', 'mcp');
  await ready('Showing 1 of 1 skills');
  assert.deepEqual(await shown(), ['beta-build']);
  assert.equal(url(page).searchParams.get('flag'), 'mcp');
  assert.equal(url(page).searchParams.has('lane'), false);
  await page.selectOption('select[name="flag"]', '');
  await page.selectOption('select[name="sort"]', 'listed');
  await ready('Showing 3 of 3 skills');
  assert.deepEqual(await shown(), ['beta-build', 'alpha-audit', 'old-record'], 'newest listings first, records without a date last');
  await page.selectOption('select[name="sort"]', 'updated');
  assert.deepEqual(await shown(), ['alpha-audit', 'beta-build', 'old-record']);
  assert.equal(url(page).searchParams.get('sort'), 'updated');
  await page.goto(origin + '/directory/?lane=free-with-service&flag=mcp&sort=listed');
  await ready('Showing 1 of 1 skills');
  assert.deepEqual(await shown(), ['beta-build']);
  assert.equal(await page.locator('select[name="lane"]').inputValue(), 'free-with-service');
  assert.equal(await page.locator('select[name="flag"]').inputValue(), 'mcp');
  assert.equal(await page.locator('select[name="sort"]').inputValue(), 'listed');
  await page.selectOption('select[name="lane"]', 'restricted');
  await ready('Showing 0 of 0 skills');
  await page.locator('[data-reset]').click();
  await ready('Showing 3 of 3 skills');
  assert.deepEqual([...url(page).searchParams.keys()], []);
  // Save toggles on result rows share the store and the nav count; records without an id get none.
  await page.evaluate(() => localStorage.removeItem('suede-directory-saved'));
  await page.reload();
  await ready('Showing 3 of 3 skills');
  assert.equal(await page.locator('[data-search-results] .save-row').count(), 2);
  const save = page.locator('[data-search-results] .save-row[data-save="owner/repo/beta-build"]');
  await save.click();
  assert.equal(await save.getAttribute('aria-pressed'), 'true');
  assert.equal(await save.textContent(), 'Saved');
  assert.equal(await page.locator('[data-saved-count]').textContent(), '1');
  const [item] = await stored(page);
  assert.deepEqual({ ...item, saved: undefined }, { id: 'owner/repo/beta-build', name: 'beta-build', href: '/directory/owner/repo/beta-build/', repo: 'owner/repo', score: 91, grade: 'A', category: 'Marketing', license: 'MIT', saved: undefined });
  await page.selectOption('select[name="sort"]', 'name');
  assert.equal(await page.locator('[data-search-results] .save-row[data-save="owner/repo/beta-build"]').getAttribute('aria-pressed'), 'true', 'saved state survives a re-render');
  await page.locator('[data-search-results] .save-row[data-save="owner/repo/beta-build"]').click();
  assert.ok(await page.locator('[data-saved-count]').isHidden());
  assert.deepEqual(await stored(page), []);
  assert.deepEqual(errors, []);
});
