import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import http from 'node:http';
import { build } from '../scripts/build-directory-site.mjs';
export async function verifyWorkflowBuilder(page, base, output, route = '/directory/') {
  await page.goto(base + route + '?utm_source=workflow-test');
  const brief = page.getByRole('textbox', { name: 'What do you want to build?' });
  await brief.waitFor({ state: 'visible', timeout: 5000 });
  const submit = page.getByRole('button', { name: 'Build my workflow', exact: true });
  await submit.click();
  assert.match(await page.locator('[data-workflow-status]').textContent(), /Describe/);
  assert.equal(await brief.evaluate(el => el === document.activeElement), true);
  await brief.fill('Launch a SaaS landing page'); await submit.click();
  await page.locator('[data-workflow-results]').waitFor({ state: 'visible' });
  assert.ok(await page.locator('.workflow-step').count() >= 3);
  await page.locator('[data-workflow-reading]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-workflow-reading] a').getAttribute('href'), 'https://suedeai.directory/stacks/landing-page/');
  assert.match(await page.locator('[data-workflow-reading]').textContent(), /By Jason Colapietro/);
  assert.equal(await page.locator('[data-workflow-tips] li').count(), 3);
  assert.match(await page.locator('[data-workflow-results]').textContent(), /Carry forward/);
  assert.equal(new URL(page.url()).searchParams.has('prompt'), false);
  assert.equal(new URL(page.url()).searchParams.get('utm_source'), 'workflow-test');
  assert.match(await page.locator('[data-workflow-export]').inputValue(), /Launch a SaaS landing page/);
  await page.getByRole('button', { name: 'Refine this workflow', exact: true }).click();
  assert.equal(await brief.inputValue(), 'Launch a SaaS landing page');
  assert.equal(await brief.evaluate(el => el === document.activeElement), true);
  await brief.fill('Turn one idea into a social campaign');
  assert.ok(await page.locator('[data-workflow-results]').isHidden(), 'editing a brief clears the stale recommendation');
  await submit.click(); await page.locator('[data-workflow-results]').waitFor({ state: 'visible' });
  assert.match(await page.locator('[data-workflow-heading]').textContent(), /social|content|campaign/i);
  await brief.fill('zzzzfrobnicate qqqqqq'); await submit.click();
  assert.ok(await page.locator('[data-workflow-results]').isHidden());
  assert.match(await page.locator('[data-workflow-status]').textContent(), /Choose the result/i);
  assert.ok(await page.locator('[data-workflow-choices] button').count() >= 1);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.locator('[data-workflow-examples] button').first().click();
    await page.locator('[data-workflow-results]').waitFor({ state: 'visible' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'workflow does not overflow');
    assert.equal(await page.locator('[data-workflow-heading]').evaluate(el => el === document.activeElement), true, 'the result heading receives focus');
    assert.ok(await page.evaluate(() => document.querySelector('[data-workflow-heading]').getBoundingClientRect().top >= document.querySelector('.nav').getBoundingClientRect().bottom), 'sticky navigation does not cover the focused result heading');
    // A tall locator screenshot scrolls midway through the module and captures
    // sticky navigation there. Capture document coordinates from the page top
    // instead, preserving the actual layout without hiding any elements.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    const clip = await page.locator('#workflow-builder').boundingBox();
    assert.ok(clip, 'workflow module has a capture area');
    await page.screenshot({ fullPage: true, clip, path: path.join(output, 'workflow-' + (route === '/' ? 'standalone-' : '') + width + '.png') });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await brief.fill('Build a landing page and create a social campaign'); await submit.click();
  await page.locator('[data-workflow-results]').waitFor({ state: 'visible' });
  assert.match(await page.locator('[data-workflow-heading]').textContent(), /Landing page \+ Social campaign/);
  const roadmap = page.locator('[data-workflow-route] button');
  assert.equal(await roadmap.count(), 8);
  await roadmap.nth(1).focus(); await page.keyboard.press('Enter');
  assert.equal(await roadmap.nth(1).getAttribute('aria-current'), 'step');
  assert.equal(await page.locator('.workflow-step:not([hidden])').count(), 1);
  const activeStage = page.locator('.workflow-step:not([hidden])');
  await activeStage.getByRole('button', { name: 'Mark step complete', exact: true }).click();
  assert.match(await page.locator('[data-workflow-progress-label]').textContent(), /^1 of 8/);
  assert.match(await page.locator('[data-workflow-export]').inputValue(), /\[done\]/);
  const alternative = activeStage.getByLabel('Choose a skill', { exact: true });
  await alternative.selectOption('anthropics/skills/frontend-design');
  assert.match(await activeStage.locator('.workflow-skill').textContent(), /frontend-design/);
  assert.match(await page.locator('[data-workflow-export]').inputValue(), /Skill: frontend-design/);
  assert.match(await page.locator('[data-workflow-progress-label]').textContent(), /^0 of 8/);
  assert.equal(await page.locator('#workflow-alternative-1').evaluate(el => el === document.activeElement), true);
  await activeStage.getByRole('button', { name: 'Next step', exact: false }).click();
  assert.equal(await roadmap.nth(2).getAttribute('aria-current'), 'step');
  assert.equal(await page.locator('.workflow-step:not([hidden]) h4').evaluate(el => el === document.activeElement), true);
  await page.getByLabel('Plan depth', { exact: false }).selectOption('simple');
  assert.ok(await page.locator('[data-workflow-results]').isHidden());
  await submit.click(); await page.locator('[data-workflow-results]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.workflow-step').count(), 6);
  await page.getByLabel('Open-source licenses only', { exact: true }).check();
  await submit.click(); await page.locator('[data-workflow-results]').waitFor({ state: 'visible' });
  assert.match(await page.locator('[data-workflow-export]').inputValue(), /open-source licenses only/);
  await page.getByLabel('Open-source licenses only', { exact: true }).uncheck();
  await page.getByLabel('Plan depth', { exact: false }).selectOption('full');
  await brief.fill('Build a landing page <img src=x onerror=alert(1)>'); await submit.click();
  await page.locator('[data-workflow-results]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#workflow-builder img').count(), 0);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy workflow', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-workflow-status]').textContent.includes('Copied'));
  assert.match(await page.evaluate(() => navigator.clipboard.readText()), /Carry forward|Output/);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } }));
  await page.getByRole('button', { name: 'Copy workflow', exact: true }).click();
  await page.locator('[data-workflow-export]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-workflow-export]').evaluate(el => el.selectionEnd - el.selectionStart), (await page.locator('[data-workflow-export]').inputValue()).length);
  await page.route('**/search-index.json', route => route.abort());
  await page.reload(); await brief.fill('Launch a SaaS landing page'); await submit.click();
  await page.waitForFunction(() => document.querySelector('[data-workflow-status]').textContent.includes('could not load'));
  assert.equal(await brief.inputValue(), 'Launch a SaaS landing page');
  await page.unroute('**/search-index.json'); await submit.click();
  await page.locator('[data-workflow-results]').waitFor({ state: 'visible' });
  const noJs = await page.context().browser().newContext({ javaScriptEnabled: false });
  try {
    const fallback = await noJs.newPage(); await fallback.goto(base + route);
    assert.ok(await fallback.locator('[data-workflow-form]').isHidden());
    assert.ok(await fallback.locator('#workflow-builder').getByRole('link', { name: 'Explore recommended stacks', exact: true }).isVisible());
  } finally { await noJs.close(); }
}

export async function verifyStandaloneWorkflow(page, output) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suede-workflow-standalone-'));
  build(root);
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(root, '.' + pathname, pathname.endsWith('/') ? 'index.html' : '');
    if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
    fs.createReadStream(target).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await verifyWorkflowBuilder(page, 'http://127.0.0.1:' + server.address().port, output, '/'); }
  finally { await new Promise(resolve => server.close(resolve)); fs.rmSync(root, { recursive: true, force: true }); }
}
