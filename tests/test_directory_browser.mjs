// CI installs the pinned browser tool outside the project's production dependencies.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.DIRECTORY_PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../docs/', import.meta.url));
const output = process.env.DIRECTORY_SCREENSHOTS || '/tmp/suede-directory-browser';
fs.mkdirSync(output, { recursive: true });
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const target = path.resolve(root, '.' + pathname, pathname.endsWith('/') ? 'index.html' : '');
  if (!target.startsWith(root) || !fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
  fs.createReadStream(target).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ headless: true, ...(process.env.DIRECTORY_CHROMIUM ? { executablePath: process.env.DIRECTORY_CHROMIUM } : {}), args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (err) => errors.push(err.message));
const index = JSON.parse(fs.readFileSync(path.join(root, 'directory/search-index.json')));
const sample = index.find((skill) => skill.full && skill.score >= 80);
const waitSearch = () => page.waitForFunction(() => document.querySelector('[data-shortlist]')?.hidden === false);
const noOverflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'page overflows viewport');

try {
  // Visitor: build, constrain, share and restore a task shortlist.
  await page.goto(base + '/directory/?utm_source=browser-test#browse');
  await waitSearch();
  await page.locator('[data-shortlist-task]').fill('Review React checkout <script>');
  for (let i = 0; i < 5; i++) await page.locator('[data-search-results] button[aria-pressed="false"]:enabled').first().click();
  assert.equal(await page.locator('[data-shortlist-items] li').count(), 5);
  assert.ok(await page.locator('[data-search-results] button[aria-pressed="false"]').first().isDisabled());
  const saved = page.url();
  assert.equal(new URL(saved).searchParams.getAll('pick').length, 5);
  assert.equal(new URL(saved).searchParams.get('utm_source'), 'browser-test');
  assert.equal(new URL(saved).hash, '#browse');
  await page.locator('input[name="q"]').fill('react');
  await page.waitForFunction(() => new URL(location.href).searchParams.get('q') === 'react');
  assert.equal(await page.locator('[data-shortlist-items] li').count(), 5);
  const markdown = await page.locator('#shortlist-markdown').textContent();
  assert.ok(markdown.includes('Review React checkout \\<script\\>'));
  assert.ok(markdown.includes('Security scan: not scanned'));
  assert.ok(markdown.includes('/report.json)'));
  await page.goto(saved);
  await waitSearch();
  assert.equal(await page.locator('[data-shortlist-items] li').count(), 5);
  assert.equal(await page.locator('[data-shortlist-task]').inputValue(), 'Review React checkout <script>');
  await page.locator('[data-shortlist-items] button').first().click();
  assert.equal(await page.locator('[data-shortlist-items] li').count(), 4);
  assert.equal(await page.locator('[data-shortlist-task]').evaluate((el) => el === document.activeElement), true);
  await page.locator('[data-shortlist]').screenshot({ path: path.join(output, '05-shortlist-desktop.png') });
  await page.goto(base + '/directory/?pick=https://example.com/bad&pick=' + encodeURIComponent(sample.href));
  await waitSearch();
  assert.equal(await page.locator('[data-shortlist-items] li').count(), 1, 'only current canonical listings can be selected');
  assert.equal(await page.locator('[data-shortlist-items] a').first().getAttribute('href'), sample.href);

  // Publisher: snapshot, report download, exact skill scope and manual recheck.
  await page.goto(base + sample.href + '#check');
  await page.locator('.report-summary').scrollIntoViewIfNeeded();
  const paletteContrast = await page.evaluate(() => {
    const probe = document.createElement('span'); document.body.append(probe);
    const context = document.createElement('canvas').getContext('2d');
    const luminance = (value) => {
      context.fillStyle = value; context.fillRect(0, 0, 1, 1);
      const channels = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const color = (token) => { probe.style.color = 'var(' + token + ')'; return luminance(getComputedStyle(probe).color); };
    const bg = color('--surface');
    const values = ['--cream', '--muted', '--gold', '--cool'].map((token) => {
      const foreground = color(token); return [token, (Math.max(bg, foreground) + 0.05) / (Math.min(bg, foreground) + 0.05)];
    });
    probe.remove(); return values;
  });
  for (const [token, ratio] of paletteContrast) assert.ok(ratio >= 4.5, token + ' contrast ' + ratio);
  assert.ok((await page.locator('.report-summary').textContent()).includes('published scores are capped at 99'));
  const request = new URL(await page.getByRole('link', { name: 'Request a fresh review', exact: true }).getAttribute('href'));
  assert.equal(request.searchParams.get('skill-scope'), sample.name);
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download report', exact: true }).click()]);
  const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  assert.equal(exported.quality.score, sample.score);
  assert.equal(exported.security_scan_status, 'not_scanned');
  await page.screenshot({ path: path.join(output, '01-report-desktop.png') });

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const [name, route] of [['02-category', '/directory/frontend-design/'], ['03-featured', '/directory/featured/'], ['04-submission', '/directory/submit/']]) {
      await page.goto(base + route); await page.evaluate(() => document.fonts.ready);
      await noOverflow();
      await page.screenshot({ path: path.join(output, name + '-' + width + '.png') });
    }
    await page.goto(saved); await waitSearch(); await noOverflow();
    await page.locator('[data-shortlist]').screenshot({ path: path.join(output, '05-shortlist-' + width + '.png') });
    await page.goto(base + sample.href + '#check'); await page.locator('.report-summary').scrollIntoViewIfNeeded(); await noOverflow();
    await page.screenshot({ path: path.join(output, '01-report-' + width + '.png') });
  }
  // Keyboard use and JavaScript-free routes remain usable.
  await page.goto(base + '/directory/'); await waitSearch();
  await page.keyboard.press('Control+k');
  assert.equal(await page.locator('input[name="q"]').evaluate((el) => el === document.activeElement), true);
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const fallback = await noJs.newPage();
  await fallback.goto(base + '/directory/frontend-design/');
  assert.ok(await fallback.locator('.skill-table tbody tr').count() > 0);
  await fallback.goto(base + sample.href);
  assert.equal(await fallback.getByRole('link', { name: 'Download report', exact: true }).count(), 1);
  await noJs.close();
  await page.route('**/search-index.json', (route) => route.abort());
  await page.goto(base + '/directory/');
  await page.locator('[data-search-error]').waitFor({ state: 'visible' });
  assert.ok(await page.locator('[data-shortlist]').isHidden());
  await page.locator('.category-rail summary').click();
  assert.ok(await page.getByRole('navigation', { name: 'Skill categories' }).isVisible());
  assert.deepEqual(errors, []);
  console.log('Directory browser checks passed: shortlist persistence/limits/export, report download/review scope, desktop/mobile overflow, palette contrast, keyboard, no-JS and fetch failure. Screenshots: ' + output);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
