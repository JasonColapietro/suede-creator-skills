import assert from 'node:assert/strict';
import path from 'node:path';

// Exercise the visitor's route from explanation to a skill or install, including
// the desktop link that was lost while it remained in the mobile menu/footer.
export async function verifySkillsLanding(page, base, output) {
  // Capture at document coordinates from the top, so a sticky header does not
  // cover the section when Playwright scrolls a tall locator into view.
  const captureSection = async (id, filename) => {
    await page.evaluate(() => { document.activeElement?.blur(); scrollTo({ top: 0, behavior: 'instant' }); });
    const clip = await page.locator(id).evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { x: 0, y: rect.top + scrollY, width: innerWidth, height: rect.height };
    });
    await page.screenshot({ path: path.join(output, filename), fullPage: true, clip });
  };
  for (const route of ['/', '/skills/']) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + route);
    const cracked = page.locator(route === '/' ? '.nav-right > .nav-cracked' : '.nav-links > .nav-cracked');
    assert.equal(await cracked.count(), 1, route + ' needs a direct desktop Cracked Devs link');
    assert.ok(await cracked.isVisible(), route + ' desktop Cracked Devs link must be visible');
    await cracked.focus();
    assert.equal(await cracked.evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
    await page.keyboard.press('Enter');
    await page.waitForURL(base + '/cracked.html');
    assert.match(await page.locator('h1').innerText(), /Agentic Adderall Stack/);
  }

  for (const width of [1280, 769, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width > 768 ? 900 : 844 });
    await page.goto(base + '/');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').count(), 1);
    const example = page.locator('#hero-example');
    assert.ok(await example.isVisible(), 'worked example must not require opening a disclosure');
    assert.match(await example.innerText(), /grade my landing page/i);
    for (const id of ['how-it-works', 'use-cases', 'install']) {
      assert.ok(await page.locator('#' + id).isVisible(), id + ' must be exposed on the landing page');
      assert.ok(await page.locator('#' + id).evaluate(el => !!(el.compareDocumentPosition(document.querySelector('#lanes')) & Node.DOCUMENT_POSITION_FOLLOWING)), id + ' must precede the full specialty map');
    }
    assert.match(await page.locator('#install').innerText(), /codex plugin add suede-skills@suede-codex/);
    assert.ok(await page.locator('#use-cases a[href="cracked.html"]').isVisible());
    assert.ok(await page.locator('#how-it-works a[href="guide.html"]').isVisible());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + 'px landing must reflow');
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: path.join(output, 'landing-home-' + width + '.png') });
    if (width === 1280 || width === 390) {
      await captureSection('#how-it-works', 'landing-how-' + width + '.png');
      await captureSection('#use-cases', 'landing-tasks-' + width + '.png');
      await captureSection('#install', 'landing-install-' + width + '.png');
    }
    if (width <= 768) {
      const menu = page.locator('.nav-hamburger');
      await menu.focus(); await page.keyboard.press('Enter');
      const mobileCracked = page.locator('.nav-mobile-link.nav-cracked');
      assert.ok(await mobileCracked.isVisible());
      await mobileCracked.focus(); await page.keyboard.press('Enter');
      await page.waitForURL(base + '/cracked.html');
    }
  }

  // Install commands stay literal and copy by keyboard without executing them.
  await page.goto(base + '/');
  await page.evaluate(() => {
    globalThis.landingCopiedText = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async text => { globalThis.landingCopiedText = text; }
    } });
  });
  for (const [button, command] of [['#copy-btn', '#install-cmd'], ['#codex-copy-btn', '#codex-install-cmd']]) {
    await page.locator(button).focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator(button).innerText(), 'Copied');
    assert.equal(await page.evaluate(() => globalThis.landingCopiedText), await page.locator(command).textContent());
  }

  const noScriptContext = await page.context().browser().newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    await noScriptContext.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    const noScript = await noScriptContext.newPage();
    await noScript.goto(base + '/');
    for (const id of ['hero-example', 'how-it-works', 'use-cases', 'install-cmd', 'codex-install-cmd']) {
      assert.ok(await noScript.locator('#' + id).isVisible(), id + ' remains available without JavaScript');
    }
    await noScript.locator('.nav-mobile-link.nav-cracked').click();
    await noScript.waitForURL(base + '/cracked.html');
  } finally {
    await noScriptContext.close();
  }

  await page.goto(base + '/');
  const links = await page.locator('#hero a, #how-it-works a, #use-cases a, #install a').evaluateAll(els => [...new Set(els.map(el => el.href))]);
  for (const href of links) {
    const url = new URL(href);
    if (url.origin !== base) continue;
    const response = await page.request.get(url.origin + url.pathname + url.search);
    assert.equal(response.status(), 200, href + ' must resolve locally');
    await page.goto(href);
    if (url.hash) assert.equal(await page.locator(url.hash).count(), 1, href + ' fragment must resolve');
  }
  console.log('Skills landing checks passed: visible desktop/mobile Cracked routes, early workflow and use cases, Claude/Codex install and clipboard parity, keyboard focus, no-JS, local links and 320–1280px reflow.');
}
