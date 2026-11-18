import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const script = readFileSync('docs/assets/visibility-scope.js', 'utf8');
test('third hero action links directly to the attributed SEO intake', () => {
  const html = readFileSync('docs/index.html', 'utf8');
  const hero = html.match(/<div id="hero-ctas"[\s\S]*?<\/div>/)[0];
  const actions = [...hero.matchAll(/<a id="([^"]+)" href="([^"]+)"/g)];
  assert.deepEqual(actions.map(a => a[1]), ['hero-cta-star', 'hero-cta-secondary', 'hero-cta-scope']);
  const url = new URL(actions[2][2].replaceAll('&amp;', '&'));
  assert.equal(url.origin + url.pathname + url.hash, 'https://suedeai.ai/seo#contact');
  assert.equal(url.searchParams.get('utm_campaign'), 'visibility-scope');
});
test('click emits its own event without collecting page query values; QA emits nothing', () => {
  for (const search of ['', '?qa=1']) {
    const calls = []; let click; let loaders = 0;
    const window = { location: { search }, va: (...args) => calls.push(args) };
    const document = { createElement: () => ({}), head: { appendChild: () => loaders++ }, getElementById: () => ({ addEventListener: (_, fn) => { click = fn; } }) };
    const context = { window, document, URL, URLSearchParams };
    vm.runInNewContext(script, context); vm.runInNewContext(script, context);
    if (search) { assert.equal(calls.length, 0); assert.equal(loaders, 0); continue; }
    click();
    assert.equal(loaders, 1);
    assert.equal(calls[1][1].name, 'visibility_scope_click');
    assert.equal(calls[1][1].data.source, 'skills-hero');
    assert.equal(calls[0][1]({ url: 'https://skills.suedeai.ai/?email=private#secret' }).url, 'https://skills.suedeai.ai/');
  }
});
