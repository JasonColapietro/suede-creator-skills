import assert from 'node:assert/strict';
import path from 'node:path';

export async function verifyFeaturedNavigation(page, base, output, mount = '/directory') {
  const destination = mount + '/featured/';
  for (const width of [1280, 769, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width > 768 ? 900 : 844 });
    for (const route of ['/', '/frontend-design/', '/agents/', '/featured/'].map(route => mount + route)) {
      await page.goto(base + route);
      const featured = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Featured Skills', exact: true, includeHidden: true });
      assert.equal(await featured.count(), 1, route + ' exposes Featured Skills in shared navigation');
      assert.equal(await featured.evaluate(el => new URL(el.href).pathname), destination);
      if (width <= 768) {
        await page.locator('.nav-hamburger').focus();
        await page.keyboard.press('Enter');
      }
      assert.ok(await featured.isVisible());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route + ' has no overflow at ' + width);
      await featured.focus();
      assert.equal(await featured.evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
      await page.keyboard.press('Enter');
      await page.waitForURL(base + destination);
      assert.match(await page.locator('h1').innerText(), /Featured/);
    }
    await page.goto(base + mount + '/');
    const quickLink = page.locator('.directory-type-switch').getByRole('link', { name: 'Featured Skills', exact: true });
    assert.ok(await quickLink.isVisible(), 'homepage browse links expose Featured Skills');
    assert.equal(await quickLink.evaluate(el => new URL(el.href).pathname), destination);
    assert.ok(await quickLink.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), 'Featured Skills appears in the first viewport at ' + width);
    if (width === 1280 || width === 390) {
      await page.evaluate(() => document.activeElement?.blur());
      await page.screenshot({ path: path.join(output, 'directory-featured-' + width + '.png') });
      if (width === 390) {
        await page.locator('.nav-hamburger').click();
        await page.screenshot({ path: path.join(output, 'directory-featured-menu-390.png') });
      }
    }
  }
  console.log('Featured navigation passed: exact local destination, shared desktop/mobile navigation, keyboard activation, first-viewport homepage link and 320–1280px reflow.');
}
