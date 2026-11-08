import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { recommendWorkflow, WORKFLOW_EXAMPLES } from '../docs/assets/workflow-recommender.js';
const catalog = JSON.parse(fs.readFileSync(new URL('../docs/directory/search-index.json', import.meta.url)));
const articles = JSON.parse(fs.readFileSync(new URL('../docs/directory/workflow-articles.json', import.meta.url)));
const source = fs.readFileSync(new URL('../docs/assets/workflow-builder.js', import.meta.url), 'utf8').replace(/^import[^\n]+\n/, '');
const tick = () => new Promise(resolve => setImmediate(resolve));
function client(fetcher = async file => ({ ok: true, json: async () => file === 'search-index.json' ? catalog : articles }), clipboard) {
  let doc;
  const element = () => Object.assign(new EventTarget(), {
    hidden: true, value: '', textContent: '', children: [], attributes: new Map(),
    setAttribute(k, v) { this.attributes.set(k, v); }, removeAttribute(k) { this.attributes.delete(k); },
    append(...children) { this.children.push(...children); }, replaceChildren(...children) { this.children = children; },
    focus() { doc.activeElement = this; }, scrollIntoView() {}, select() { this.selected = true; },
  });
  const selectors = ['[data-workflow-form]', '#workflow-brief', '[type="submit"]', '[data-workflow-status]', '[data-workflow-results]', '[data-workflow-heading]', '[data-workflow-summary]', '[data-workflow-export]', '[data-workflow-steps]', '[data-workflow-tips]', '[data-workflow-reading]', '[data-workflow-copy-fallback]', '[data-workflow-examples]', '[data-workflow-refine]', '[data-workflow-copy]'];
  const elements = Object.fromEntries(selectors.map(s => [s, element()]));
  elements['[data-workflow-form]'].querySelector = selector => elements[selector];
  doc = { querySelector: () => ({ querySelector: selector => elements[selector] }), createElement: element, createTextNode: text => ({ textContent: text }) };
  const requests = [];
  vm.runInNewContext(source, { document: doc, recommendWorkflow, WORKFLOW_EXAMPLES, URL,
    location: { href: 'https://suedeai.directory/?utm_source=test' }, navigator: { clipboard }, AbortController, setTimeout, clearTimeout,
    fetch: (...args) => { requests.push(args); return fetcher(...args); },
  });
  return { elements, doc, requests,
    brief: elements['#workflow-brief'], results: elements['[data-workflow-results]'], status: elements['[data-workflow-status]'],
    async build(text) { if (text !== undefined) elements['#workflow-brief'].value = text; elements['[data-workflow-form]'].dispatchEvent(new Event('submit', { cancelable: true })); await tick(); await tick(); },
  };
}
test('blank brief focuses the input without requesting any data', async () => {
  const c = client(); await c.build('  ');
  assert.equal(c.requests.length, 0); assert.equal(c.doc.activeElement, c.brief); assert.match(c.status.textContent, /Describe/);
});
test('workflow renders true catalog links, complete copy text, tips and a verified authored article', async () => {
  const c = client(); await c.build('Launch a SaaS landing page');
  assert.equal(c.results.hidden, false); assert.ok(c.elements['[data-workflow-steps]'].children.length >= 3);
  assert.equal(c.elements['[data-workflow-tips]'].children.length, 3);
  assert.match(c.elements['[data-workflow-export]'].value, /Carry forward:/);
  assert.match(c.elements['[data-workflow-export]'].value, /By Jason Colapietro/);
  assert.equal(c.elements['[data-workflow-reading]'].hidden, false);
  assert.deepEqual(c.requests.map(([file]) => file), ['search-index.json', 'workflow-articles.json']);
  assert.ok(c.requests.every(([file]) => !file.includes('SaaS')));
});
test('editing invalidates a pending response and the next submit uses the current brief', async () => {
  let resolve;
  const response = new Promise(r => { resolve = r; });
  const c = client(async file => file === 'search-index.json' ? response : { ok: true, json: async () => articles });
  await c.build('Launch a SaaS landing page'); c.brief.value = 'Turn one idea into a social campaign'; c.brief.dispatchEvent(new Event('input'));
  resolve({ ok: true, json: async () => catalog }); await tick();
  assert.equal(c.results.hidden, true); assert.equal(c.elements['[type="submit"]'].disabled, false);
  await c.build(); assert.match(c.elements['[data-workflow-heading]'].textContent, /social/i);
});
test('catalog failure preserves the brief and can be retried', async () => {
  let fails = true;
  const c = client(async file => { if (fails && file === 'search-index.json') throw new Error('offline'); return { ok: true, json: async () => file === 'search-index.json' ? catalog : articles }; });
  await c.build('Launch a SaaS landing page'); assert.match(c.status.textContent, /could not load/); assert.equal(c.brief.value, 'Launch a SaaS landing page');
  fails = false; await c.build(); assert.equal(c.results.hidden, false);
});
test('malformed or other-author reading data is omitted without breaking the usable workflow', async () => {
  for (const data of [null, { articles: {} }, { articles: [{ author: 'Someone else', intents: ['landing-page'], title: 'No', summary: 'No', href: 'https://example.com/' }] }]) {
    const c = client(async file => ({ ok: true, json: async () => file === 'search-index.json' ? catalog : data }));
    await c.build('Launch a SaaS landing page'); assert.equal(c.results.hidden, false); assert.equal(c.elements['[data-workflow-reading]'].hidden, true);
  }
});
test('refine preserves the brief and clipboard failure exposes selectable workflow text', async () => {
  const c = client(); await c.build('Launch a SaaS landing page');
  c.elements['[data-workflow-refine]'].dispatchEvent(new Event('click'));
  assert.equal(c.doc.activeElement, c.brief); assert.equal(c.brief.value, 'Launch a SaaS landing page');
  c.elements['[data-workflow-copy]'].dispatchEvent(new Event('click')); await tick();
  assert.equal(c.elements['[data-workflow-copy-fallback]'].open, true); assert.equal(c.elements['[data-workflow-export]'].selected, true);
});
test('service and license constraints accompany selected skills and the copied workflow', async () => {
  for (const [lane, expected] of [['free-with-service', /service may require an account or paid plan/], ['noncommercial', /Non-commercial use only/], ['restricted', /Check the publisher’s usage restrictions/]]) {
    const selected = recommendWorkflow('Launch a SaaS landing page', catalog).steps[0].skill.id;
    const data = catalog.map(skill => skill.id === selected ? { ...skill, lane } : skill);
    const c = client(async file => ({ ok: true, json: async () => file === 'search-index.json' ? data : articles }));
    await c.build('Launch a SaaS landing page'); assert.match(c.elements['[data-workflow-export]'].value, expected);
  }
});
