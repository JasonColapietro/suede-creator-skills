import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { recommendWorkflow, WORKFLOW_EXAMPLES } from '../docs/assets/workflow-recommender.js';

const catalog = JSON.parse(readFileSync(new URL('../docs/directory/search-index.json', import.meta.url)));
const byId = new Map(catalog.map(skill => [skill.id, skill]));
const ids = result => result.steps.map(step => step.skill.id);
const briefs = [
  ['Launch a SaaS landing page for a new invoicing product', 'landing-page', 'agiwhitelist/auteur/auteur'],
  ['Build a web app with Next.js for tracking team tasks', 'web-app', 'jeffallan/claude-skills/nextjs-developer'],
  ['Get my business found in AI search and improve SEO', 'seo-and-ai-search', 'coreyhaines31/marketingskills/ai-seo'],
  ['Turn one idea into a social campaign for our launch', 'content-and-social', 'mblode/agent-skills/ghostwriter'],
  ['Build an AI agent with MCP tools for customer support', 'agent-building', 'anthropics/skills/mcp-builder'],
  ['Analyze a CSV of sales data and create a report', 'documents-and-data', 'tronghieu/agent-skills/data-scientist'],
  ['Research competitors and compare companies in our market', 'research', 'browserbase/skills/company-research'],
  ['Create an explainer video with captions for a product launch', 'video-and-creative', 'coreyhaines31/marketingskills/video'],
];

for (const [brief, intent, required] of briefs) {
  test(`matches ${intent} to a chronological, catalog-backed workflow`, () => {
    const result = recommendWorkflow(brief, catalog);
    assert.equal(result.status, 'ready');
    assert.equal(result.intent, intent);
    assert.ok(ids(result).includes(required), `${required} should support this task`);
    assert.ok(result.steps.length >= 3 && result.steps.length <= 5);
    assert.equal(new Set(ids(result)).size, result.steps.length);
    assert.equal(result.tips.length, 3);
    assert.match(result.summary, /task-based/i);
    assert.ok(result.matchedTerms.length > 0);
    for (const step of result.steps) {
      assert.deepEqual(step.skill, byId.get(step.skill.id), 'Return current metadata without invented scores, licenses, links or commands');
      for (const value of [step.title, step.why, step.output]) assert.ok(value.length > 15);
    }
  });
}

test('different goals select different skills and place writing before build before testing', () => {
  const landing = recommendWorkflow(briefs[0][0], catalog);
  const order = ids(landing);
  assert.ok(order.indexOf('coreyhaines31/marketingskills/copywriting') < order.indexOf('agiwhitelist/auteur/auteur'));
  assert.ok(order.indexOf('agiwhitelist/auteur/auteur') < order.indexOf('anthropics/skills/webapp-testing'));
  const signatures = briefs.map(([brief]) => ids(recommendWorkflow(brief, catalog)).join('|'));
  assert.equal(new Set(signatures).size, briefs.length);
});

test('examples are three usable and distinct starting briefs', () => {
  assert.equal(WORKFLOW_EXAMPLES.length, 3);
  const results = WORKFLOW_EXAMPLES.map(example => {
    assert.ok(example.label.length > 5);
    return recommendWorkflow(example.prompt, catalog);
  });
  assert.ok(results.every(result => result.status === 'ready'));
  assert.equal(new Set(results.map(result => result.intent)).size, 3);
});

test('blank and non-string input return an empty state without skills', () => {
  for (const prompt of ['', ' \n\t ', null, undefined, 24, {}, []]) {
    const result = recommendWorkflow(prompt, catalog);
    assert.equal(result.status, 'empty');
    assert.deepEqual(result.steps, []);
    assert.deepEqual(result.matchedTerms, []);
  }
});

test('unknown tasks and underspecified briefs do not get an arbitrary generic workflow', () => {
  for (const prompt of ['qzxy blorp snorpf', 'help me build something amazing', 'app', 'seo', 'book a flight to Rome', 'buy a sofa', 'not a landing page', 'a campaign of military conquest']) {
    const result = recommendWorkflow(prompt, catalog);
    assert.equal(result.status, 'no-match', prompt);
    assert.deepEqual(result.steps, []);
  }
});

test('invalid, missing and sparse catalogs never invent skills or substitute unrelated high scores', () => {
  const brief = briefs[0][0];
  for (const source of [undefined, null, {}, [], [byId.get('agiwhitelist/auteur/auteur')], catalog.filter(x => x.category === 'security')]) {
    const result = recommendWorkflow(brief, source);
    assert.equal(result.status, 'no-match');
    assert.deepEqual(result.steps, []);
  }
});

test('removing a workflow anchor does not turn a support-only selection into a ready workflow', () => {
  const withoutBuilders = catalog.filter(x => !['agiwhitelist/auteur/auteur', 'anthropics/skills/frontend-design', 'mblode/agent-skills/ui-design'].includes(x.id));
  assert.equal(recommendWorkflow(briefs[0][0], withoutBuilders).status, 'no-match');
});

test('normalizes Unicode, mixed casing and punctuation without changing the match', () => {
  const baseline = recommendWorkflow('Launch a SaaS landing page', catalog);
  for (const prompt of ['ＬＡＵＮＣＨ a ＳａａＳ landing—page!', 'Launch a SÁAS LANDING / PAGE', '🚀 Launch a SaaS landing-page…']) {
    const result = recommendWorkflow(prompt, catalog);
    assert.equal(result.intent, baseline.intent);
    assert.deepEqual(ids(result), ids(baseline));
  }
});

test('matches whole terms and ignores negated goals instead of substring collisions', () => {
  assert.equal(recommendWorkflow('repair my airplane videoport', catalog).status, 'no-match');
  const result = recommendWorkflow('Not a landing page. Create an explainer video instead.', catalog);
  assert.equal(result.intent, 'video-and-creative');
});

test('bounds prompt processing and does not reflect arbitrary prompt markup into its output', () => {
  const prefix = 'Launch a SaaS landing page';
  assert.deepEqual(recommendWorkflow(prefix + ' '.repeat(2000) + 'AI agent MCP '.repeat(10000), catalog), recommendWorkflow(prefix, catalog));
  assert.equal(recommendWorkflow(' '.repeat(2000) + prefix, catalog).status, 'empty');
  const result = recommendWorkflow('<img src=x onerror=alert(1)> Launch a SaaS landing page', catalog);
  assert.equal(result.status, 'ready');
  assert.doesNotMatch(JSON.stringify(result), /onerror|<img/);
});

test('task relevance outranks quality scores and does not force a vendor-specific implementation', () => {
  const changed = catalog.map(skill => ({ ...skill, score: skill.id === 'jeffallan/claude-skills/nextjs-developer' ? 1 : 100 }));
  const explicit = recommendWorkflow('Build a Next.js web app for team tasks', changed);
  assert.ok(ids(explicit).includes('jeffallan/claude-skills/nextjs-developer'));
  const generic = recommendWorkflow('Build a web app for team tasks', changed);
  assert.ok(ids(generic).includes('agiwhitelist/auteur/auteur'));
  assert.ok(!ids(generic).includes('zxkane/aws-skills/aws-agentic-ai'));
});

test('keeps restricted licenses, flags, null install commands and actual quality grades', () => {
  const result = recommendWorkflow('Analyze CSV sales data and prepare a report', catalog);
  const spreadsheet = result.steps.find(step => step.skill.id === 'anthropics/skills/xlsx').skill;
  assert.equal(spreadsheet.license, 'Proprietary');
  assert.equal(spreadsheet.install, null);
  assert.equal(spreadsheet.score, 85);
  assert.equal(spreadsheet.grade, 'B');
  assert.ok(spreadsheet.flags.includes('scripts'));
  assert.equal(spreadsheet.lane, 'restricted');
});

test('rejects unsafe or noncanonical href/report values instead of exposing navigable attacks', () => {
  const unsafe = [
    'javascript:alert(1)', '//evil.example/a', 'https://evil.example/a',
    '/directory/../evil/', '/directory/%2e%2e/evil/', '/directory/anthropics/skills/../../evil/',
    '/directory/agiwhitelist/auteur/auteur/?redirect=https://evil.example',
    '/directory/agiwhitelist/auteur/auteur/\\evil', '/directory/somebody/else/skill/',
    '/directory/agiwhitelist/auteur/auteur/\n',
  ];
  for (const field of ['href', 'report']) {
    for (const value of unsafe) {
      const malicious = catalog.map(skill => ({ ...skill, [field]: value }));
      const result = recommendWorkflow(briefs[0][0], malicious);
      assert.equal(result.status, 'no-match', `${field}: ${JSON.stringify(value)}`);
      assert.deepEqual(result.steps, []);
    }
  }
});

test('accepts canonical full and repository-fragment listings on both directory hosts', () => {
  for (const prefix of ['/directory/', '/']) {
    for (const fragment of [false, true]) {
      const source = catalog.map(skill => ({ ...skill,
        href: fragment ? `${prefix}${skill.repo}/#${skill.name}` : `${prefix}${skill.id}/`,
        report: `${prefix}${skill.id}/report.json`,
      }));
      const result = recommendWorkflow(briefs[0][0], source);
      assert.equal(result.status, 'ready');
      for (const step of result.steps) {
        assert.ok(step.skill.href.startsWith(prefix));
        assert.equal(step.skill.href.includes('#'), fragment);
      }
    }
  }
});

test('is deterministic, tolerates malformed entries and duplicates, and never mutates the catalog', () => {
  const before = JSON.stringify(catalog);
  const first = recommendWorkflow(briefs[0][0], catalog);
  assert.deepEqual(recommendWorkflow(briefs[0][0], [...catalog].reverse()), first);
  assert.deepEqual(recommendWorkflow(briefs[0][0], [...catalog, ...catalog, null, {}, 3, { id: 'bad' }]), first);
  assert.equal(JSON.stringify(catalog), before);
});

test('focuses on the requested artifact rather than its secondary purpose', () => {
  assert.equal(recommendWorkflow('Build a web app for a social campaign', catalog).intent, 'web-app');
  assert.equal(recommendWorkflow('Build an AI agent for data analysis', catalog).intent, 'agent-building');
  assert.equal(recommendWorkflow('Create a social campaign for AI search visibility', catalog).intent, 'content-and-social');
});

test('asks for a narrower outcome when two equally strong independent goals conflict', () => {
  for (const prompt of ['Build a web app and create a social campaign', 'Build an AI agent and launch a landing page']) {
    assert.equal(recommendWorkflow(prompt, catalog).status, 'no-match');
  }
});

test('does not let a negated different topic suppress the following goal', () => {
  assert.equal(recommendWorkflow('Not SEO. Landing page please.', catalog).intent, 'landing-page');
});

test('handles longer and sentence-scoped negation without recommending the rejected task', () => {
  assert.equal(recommendWorkflow('I do not want to build a landing page. I want a web app.', catalog).intent, 'web-app');
  assert.equal(recommendWorkflow('No need for a landing page', catalog).status, 'no-match');
  assert.equal(recommendWorkflow('Not a landing page but a web app', catalog).intent, 'web-app');
});

test('does not recommend a required platform the brief explicitly excludes', () => {
  const result = recommendWorkflow('Build a chatbot without an MCP server.', catalog);
  assert.equal(result.status, 'no-match');
  assert.deepEqual(result.steps, []);
});

test('keeps the explicit app-building goal ahead of a data-analysis purpose clause', () => {
  for (const prompt of ['Build a web app to analyze sales data from CSV spreadsheets', 'I want to build a web app to analyze sales data from CSV spreadsheets']) {
    const result = recommendWorkflow(prompt, catalog);
    assert.equal(result.intent, 'web-app');
    assert.ok(ids(result).includes('agiwhitelist/auteur/auteur'));
  }
});

test('accepts actual mixed-case repository metadata while preserving its display casing', () => {
  const agent = recommendWorkflow('Build an AI agent with MCP tools', catalog);
  for (const id of ['muratcankoylan/agent-skills-for-context-engineering/tool-design', 'muratcankoylan/agent-skills-for-context-engineering/context-optimization']) {
    assert.ok(ids(agent).includes(id));
    assert.deepEqual(agent.steps.find(step => step.skill.id === id).skill, byId.get(id));
  }
  const video = recommendWorkflow('Create an explainer video', catalog);
  assert.ok(ids(video).includes('huangchihhungleo/claude-real-video/claude-real-video-for-agents'));
});

test('treats an explicitly built website as the deliverable even with social-media adjectives', () => {
  const result = recommendWorkflow('Build a social media website', catalog);
  assert.equal(result.intent, 'web-app');
  assert.ok(ids(result).includes('agiwhitelist/auteur/auteur'));
});

test('does not claim a ready preset that includes an explicitly excluded capability', () => {
  for (const prompt of ['Create a social campaign without analytics', 'Create a social campaign. Do not include analytics.']) {
    const result = recommendWorkflow(prompt, catalog);
    assert.equal(result.status, 'no-match');
    assert.deepEqual(result.steps, []);
  }
});
