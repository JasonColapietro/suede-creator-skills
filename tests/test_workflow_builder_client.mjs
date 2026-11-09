import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as planner from '../docs/assets/workflow-recommender.js';
import { recommendWorkflow, recommendSkills, recommendArticles, isFirstParty, WORKFLOW_EXAMPLES } from '../docs/assets/workflow-recommender.js';
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
  const selectors = ['[data-workflow-form]', '#workflow-brief', '[type="submit"]', '[data-workflow-status]', '[data-workflow-results]', '[data-workflow-heading]', '[data-workflow-summary]', '[data-workflow-export]', '[data-workflow-steps]', '[data-workflow-tips]', '[data-workflow-reading]', '[data-workflow-copy-fallback]', '[data-workflow-examples]', '[data-workflow-refine]', '[data-workflow-copy]', '[data-workflow-mode]', '[data-workflow-free]', '[data-workflow-choices]', '[data-workflow-overview]', '[data-workflow-route]', '[data-workflow-progress]', '[data-workflow-progress-label]', '[data-workflow-reset-progress]',
    '[data-workflow-suggestions]', '[data-workflow-skill-list]', '#workflow-suggestions-title', '[data-workflow-suggestions-summary]', '[data-workflow-suggest-reading]', '[data-workflow-suggest-refine]', '[data-workflow-more]', '[data-workflow-more-list]'];
  const elements = Object.fromEntries(selectors.map(s => [s, element()]));
  elements['[data-workflow-form]'].querySelector = selector => elements[selector];
  doc = { querySelector: () => ({ querySelector: selector => elements[selector] }), createElement: element, createTextNode: text => ({ textContent: text }) };
  const requests = [];
  vm.runInNewContext(source, { document: doc, recommendWorkflow, planWorkflow: planner.planWorkflow, recommendSkills, recommendArticles, isFirstParty, WORKFLOW_EXAMPLES, URL,
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

test('planner shows a selectable roadmap and tracks completed steps in the copied AI brief', async () => {
  const c = client(); await c.build('Launch a SaaS landing page');
  const route = c.elements['[data-workflow-route]'];
  assert.ok(route.children.length >= 3, 'roadmap contains each stage');
  assert.match(c.elements['[data-workflow-progress-label]'].textContent, /0 of/);
  const steps = c.elements['[data-workflow-steps]'].children;
  assert.equal(steps[0].hidden, false); assert.equal(steps[1].hidden, true);
  route.children[1].dispatchEvent(new Event('click'));
  assert.equal(steps[0].hidden, true); assert.equal(steps[1].hidden, false);
  const find = (node, attr) => node.attributes?.has(attr) ? node : node.children?.map(child => find(child, attr)).find(Boolean);
  find(steps[1], 'data-workflow-complete').dispatchEvent(new Event('click'));
  assert.match(c.elements['[data-workflow-progress-label]'].textContent, /1 of/);
  assert.match(c.elements['[data-workflow-export]'].value, /\[done\]/);
  assert.match(c.elements['[data-workflow-export]'].value, /AI handoff/);
});

test('unsupported briefs offer actionable starting choices without pretending AI is connected', async () => {
  const c = client(); await c.build('help me build something amazing');
  assert.equal(c.results.hidden, true);
  assert.ok(c.elements['[data-workflow-choices]'].children.length >= 1);
  assert.doesNotMatch(c.status.textContent, /AI generated|AI powered/);
});

test('changing planner controls invalidates the previous plan without transmitting the brief', async () => {
  const c = client(); await c.build('Launch a SaaS landing page');
  c.elements['[data-workflow-mode]'].value = 'simple';
  c.elements['[data-workflow-mode]'].dispatchEvent(new Event('change'));
  assert.equal(c.results.hidden, true);
  assert.equal(c.brief.value, 'Launch a SaaS landing page');
  assert.equal(c.requests.length, 2);
});


test('combined goals keep both authored reading matches and an agent-ready export', async () => {
  const c = client(); await c.build('Build a landing page and create a social campaign');
  assert.equal(c.elements['[data-workflow-route]'].children.length, 8);
  const exported = c.elements['[data-workflow-export]'].value;
  assert.match(exported, /stacks\/landing-page/); assert.match(exported, /stacks\/content-and-social/);
  assert.match(exported, /Planning method: browser-local/);
  assert.equal(c.requests.length, 2);
});

test('article loading from a superseded result never overwrites the current plan', async () => {
  let resolve;
  const pending = new Promise(r => { resolve = r; });
  const c = client(async file => file === 'search-index.json' ? {ok:true,json:async()=>catalog} : pending);
  await c.build('Build a landing page');
  c.brief.value = 'Create a social campaign'; c.brief.dispatchEvent(new Event('input'));
  await c.build(); resolve({ok:true,json:async()=>articles}); await tick(); await tick();
  const exported = c.elements['[data-workflow-export]'].value;
  assert.match(exported, /stacks\/content-and-social/); assert.doesNotMatch(exported, /stacks\/landing-page/);
});

test('essential steps and open-source selection are applied by the controller, not just displayed', async () => {
  const c = client(); c.elements['[data-workflow-mode]'].value = 'simple';
  c.elements['[data-workflow-free]'].checked = true;
  await c.build('Build a landing page');
  assert.equal(c.elements['[data-workflow-steps]'].children.length, 3);
  assert.match(c.elements['[data-workflow-export]'].value, /Essential steps; open-source licenses only/);
});

const walk = (node, out = []) => { if (node && typeof node === 'object') { out.push(node); (node.children || []).forEach(child => walk(child, out)); } return out; };
const links = node => walk(node).filter(child => typeof child.href === 'string').map(child => child.href);

test('a goal outside the authored workflows still gets graded skills, workflow choices and Jason’s articles', async () => {
  const c = client(); await c.build('I’m a musician releasing a new single and want to plan the rollout');
  assert.equal(c.results.hidden, true, 'no preset workflow is claimed');
  assert.equal(c.elements['[data-workflow-suggestions]'].hidden, false);
  const skills = c.elements['[data-workflow-skill-list]'].children;
  assert.ok(skills.length >= 3, 'skills are recommended');
  assert.ok(links(c.elements['[data-workflow-skill-list]']).every(href => catalog.some(skill => skill.href === href)), 'every link is a real listing');
  assert.ok(c.elements['[data-workflow-choices]'].children.length >= 1, 'workflow choices stay available');
  assert.equal(c.elements['[data-workflow-suggest-reading]'].hidden, false);
  assert.ok(links(c.elements['[data-workflow-suggest-reading]']).length >= 1);
  assert.match(c.status.textContent, /Pick a goal/);
  assert.match(c.elements['[data-workflow-suggestions-summary]'].textContent, /Suede AI’s own skills first/);
  assert.match(links(c.elements['[data-workflow-skill-list]'])[0], /\/jasoncolapietro\/suede-creator-skills\//);
  c.brief.value = 'something else'; c.brief.dispatchEvent(new Event('input'));
  assert.equal(c.elements['[data-workflow-suggestions]'].hidden, true, 'editing clears stale suggestions');
});

test('a ready workflow adds extra matching skills that are not already steps or alternatives', async () => {
  const c = client(); await c.build('I run a small bakery and want more customers to find us on Google');
  assert.equal(c.results.hidden, false);
  assert.equal(c.elements['[data-workflow-more]'].hidden, false);
  const steps = links(c.elements['[data-workflow-steps]']);
  const more = links(c.elements['[data-workflow-more-list]']);
  assert.ok(more.length >= 1 && more.length <= 3);
  assert.ok(more.every(href => !steps.includes(href)));
  assert.match(c.elements['[data-workflow-export]'].value, /Recommended skills for this goal/);
  assert.match(more[0], /\/jasoncolapietro\/suede-creator-skills\//, 'a matching Suede AI skill leads');
  assert.match(c.elements['[data-workflow-export]'].value, /Read next: /);
});
