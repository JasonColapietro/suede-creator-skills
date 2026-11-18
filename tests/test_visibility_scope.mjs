import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const script = readFileSync('docs/assets/visibility-scope.js', 'utf8');
const destination = 'https://suedeai.ai/seo?utm_source=skills.suedeai.ai&utm_medium=referral&utm_campaign=visibility-scope&utm_content=hero#contact';
test('third hero action links directly to the attributed SEO intake', () => {
  const html = readFileSync('docs/index.html', 'utf8');
  const hero = html.match(/<div id="hero-ctas"[\s\S]*?<\/div>/)[0];
  const actions = [...hero.matchAll(/<a id="([^"]+)" href="([^"]+)"/g)];
  assert.deepEqual(actions.map(a => a[1]), ['hero-cta-star', 'hero-cta-secondary', 'hero-cta-scope']);
  assert.equal(actions[2][2].replaceAll('&amp;', '&'), destination);
});
test('only a hero activation marks the intake URL; QA and right clicks do not', () => {
  for (const search of ['', '?qa=1']) {
    const handlers = {};
    const link = { href: destination, addEventListener: (name, fn) => { handlers[name] = fn; } };
    const window = { location: { search } };
    const document = { getElementById: () => link };
    const context = { window, document, URL, URLSearchParams };
    vm.runInNewContext(script, context); vm.runInNewContext(script, context);
    assert.equal(new URL(link.href).searchParams.has('scope_click'), false);
    handlers.click?.({ button: 2 });
    assert.equal(new URL(link.href).searchParams.has('scope_click'), false);
    handlers.click?.({ button: 0 });
    assert.equal(new URL(link.href).searchParams.get('scope_click'), search ? null : 'hero');
    link.href = destination;
    handlers.auxclick?.({ button: 1 });
    assert.equal(new URL(link.href).searchParams.get('scope_click'), search ? null : 'hero');
    assert.equal(new URL(link.href).hash, '#contact');
  }
});
