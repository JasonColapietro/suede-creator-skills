import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { planWorkflow, recommendWorkflow, recommendSkills, recommendArticles, isPublishableArticle, isFirstParty, WORKFLOW_EXAMPLES } from '../docs/assets/workflow-recommender.js';

const catalog = JSON.parse(readFileSync(new URL('../docs/directory/search-index.json', import.meta.url)));
const byId = new Map(catalog.map(skill => [skill.id, skill]));
const ids = result => result.steps.map(step => step.skill.id);
const briefs = [
  ['Launch a SaaS landing page for a new invoicing product', 'landing-page', 'agiwhitelist/auteur/auteur'],
  ['Build a web app with Next.js for tracking team tasks', 'web-app', 'jeffallan/claude-skills/nextjs-developer'],
  ['Get my business found in AI search and improve SEO', 'seo-and-ai-search', 'jasoncolapietro/suede-creator-skills/suede-ai-seo'],
  ['Turn one idea into a social campaign for our launch', 'content-and-social', 'jasoncolapietro/suede-creator-skills/suede-social'],
  ['Build an AI agent with MCP tools for customer support', 'agent-building', 'anthropics/skills/mcp-builder'],
  ['Analyze a CSV of sales data and create a report', 'documents-and-data', 'tronghieu/agent-skills/data-scientist'],
  ['Research competitors and compare companies in our market', 'research', 'jasoncolapietro/suede-creator-skills/suede-competitor-profiling'],
  ['Create an explainer video with captions for a product launch', 'video-and-creative', 'jasoncolapietro/suede-creator-skills/suede-video'],
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
  assert.ok(order.indexOf('jasoncolapietro/suede-creator-skills/suede-copy') !== -1);
  assert.ok(order.indexOf('jasoncolapietro/suede-creator-skills/suede-copy') < order.indexOf('agiwhitelist/auteur/auteur'));
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

test('planner composes independent landing-page and social goals with shared measurement last', () => {
  const result = planWorkflow('Launch a SaaS landing page and create a social campaign for it', catalog);
  assert.equal(result.status, 'ready');
  assert.deepEqual(result.intents.map(intent => intent.id), ['landing-page', 'content-and-social']);
  assert.ok(ids(result).includes('agiwhitelist/auteur/auteur'));
  assert.ok(ids(result).includes('jasoncolapietro/suede-creator-skills/suede-social'));
  assert.equal(ids(result).at(-1), 'jasoncolapietro/suede-creator-skills/suede-analytics');
  assert.equal(new Set(ids(result)).size, result.steps.length);
  assert.ok(result.steps.length <= 10);
  assert.deepEqual(result.steps.at(-1).intentIds, ['landing-page', 'content-and-social']);
  assert.ok(result.matchedTerms.includes('landing page'));
  assert.ok(result.matchedTerms.includes('social campaign'));
});

test('planner recognizes independent noun goals, sentence goals, and ordered next steps', () => {
  for (const prompt of [
    'I need a landing page plus a social campaign',
    'Build a landing page. Then create a social campaign.',
    'Build a landing page + social posts',
    'Build a landing page, create a social campaign',
    'Not just a landing page but also a social campaign',
  ]) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'ready', prompt);
    assert.deepEqual(result.intents.map(intent => intent.id), ['landing-page', 'content-and-social'], prompt);
  }
});

test('planner keeps purpose clauses and website subjects subordinate', () => {
  for (const [prompt, intent] of [
    ['Build a web app for a social campaign', 'web-app'],
    ['Build a web app to analyze sales data from CSV spreadsheets', 'web-app'],
    ['Create a social campaign for AI search visibility', 'content-and-social'],
    ['Build a social media website', 'web-app'],
    ['Build an AI agent for data analysis', 'agent-building'],
  ]) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'ready', prompt);
    assert.deepEqual(result.intents.map(item => item.id), [intent], prompt);
  }
});

test('planner asks a useful question for alternatives, unknown tasks, and unsupported extra tasks', () => {
  for (const prompt of [
    'Build a landing page or create a social campaign',
    'qzxy blorp snorpf', 'buy a sofa', 'help me build something amazing',
    'Build a landing page and book a flight to Rome',
    'Create a social campaign and build a nuclear reactor',
  ]) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'clarify', prompt);
    assert.deepEqual(result.steps, []);
    assert.ok(result.choices.length > 0 && result.choices.length <= 8);
    for (const choice of result.choices) {
      assert.ok(choice.label.length > 3);
      assert.equal(planWorkflow(choice.prompt, catalog).status, 'ready', choice.prompt);
    }
  }
});

test('planner keeps empty and underspecified briefs distinct without throwing', () => {
  for (const value of ['', ' \n\t ', null, undefined, [], {}, 24]) {
    const result = planWorkflow(value, catalog);
    assert.equal(result.status, 'empty');
    assert.deepEqual(result.steps, []);
    assert.deepEqual(result.intents, []);
  }
  assert.equal(planWorkflow('seo', catalog).status, 'clarify');
  assert.doesNotThrow(() => planWorkflow('Build a landing page', catalog, null));
});

test('planner handles negated goals and rejects excluded required capabilities', () => {
  for (const prompt of ['Not a landing page. Create an explainer video instead.', 'Not SEO. Landing page please.']) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'ready');
    assert.equal(result.intents.length, 1);
  }
  for (const prompt of ['No need for a landing page', 'Build a chatbot without an MCP server', 'Create a social campaign without analytics']) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'clarify', prompt);
    assert.deepEqual(result.steps, []);
  }
});

test('planner free-only filter uses catalog lanes and never implies that runtime services are free', () => {
  const result = planWorkflow('Build a landing page', catalog, { freeOnly: true });
  assert.equal(result.status, 'ready');
  assert.equal(result.constraints.freeOnly, true);
  assert.ok(!ids(result).includes('agiwhitelist/auteur/auteur'));
  for (const step of result.steps) for (const skill of [step.skill, ...step.alternatives]) {
    assert.equal(skill.lane, 'free-open-source');
  }
  assert.match(result.notices.join(' '), /service|runtime/i);
  const restricted = planWorkflow('Analyze CSV sales data and prepare a report', catalog, { freeOnly: true });
  assert.equal(restricted.status, 'clarify');
  assert.deepEqual(restricted.steps, []);
});

test('planner simple mode keeps a short buildable sequence rather than dropping the core skill', () => {
  const full = planWorkflow('Launch a landing page', catalog);
  const simple = planWorkflow('Launch a landing page', catalog, { mode: 'simple' });
  assert.equal(simple.status, 'ready');
  assert.equal(simple.constraints.mode, 'simple');
  assert.equal(simple.steps.length, 3);
  assert.ok(simple.steps.length < full.steps.length);
  assert.deepEqual(ids(simple), [
    'jasoncolapietro/suede-creator-skills/suede-copy', 'agiwhitelist/auteur/auteur', 'anthropics/skills/webapp-testing',
  ]);
  assert.match(simple.notices.join(' '), /short|simple|essential/i);
  assert.doesNotMatch(simple.summary, /measure signups/i, 'Shortened plans cannot claim omitted measurement work');
});

test('planner keeps all goals or asks to narrow instead of silently truncating beyond ten steps', () => {
  const prompt = 'Build a web app and create a social campaign and build an AI agent and create an explainer video';
  const result = planWorkflow(prompt, catalog);
  assert.equal(result.status, 'clarify');
  assert.deepEqual(result.steps, []);
  assert.ok(result.choices.length >= 2);
  assert.match(result.summary, /narrow|fewer|one|two|10|ten/i);
  const simple = planWorkflow('Build a landing page and create a social campaign and create an explainer video', catalog, { mode: 'simple' });
  assert.equal(simple.status, 'ready');
  assert.equal(simple.intents.length, 3);
  assert.ok(simple.steps.length <= 10);
});

test('planner returns role-specific alternatives from the actual catalog without repeating planned skills', () => {
  const result = planWorkflow('Build a landing page and create a social campaign', catalog);
  const build = result.steps.find(step => step.skill.id === 'agiwhitelist/auteur/auteur');
  assert.ok(build.alternatives.some(skill => skill.id === 'anthropics/skills/frontend-design'));
  const selected = new Set(ids(result));
  for (const step of result.steps) {
    assert.ok(step.id && step.intentIds.length);
    assert.deepEqual(step.skill, byId.get(step.skill.id));
    for (const skill of step.alternatives) {
      assert.deepEqual(skill, byId.get(skill.id));
      assert.ok(!selected.has(skill.id), `${skill.id} already has a workflow role`);
    }
  }
});

test('planner preserves explicit platform suitability rather than recommending an arbitrary high score', () => {
  const result = planWorkflow('Build a Next.js web app and create a social campaign', catalog);
  assert.equal(result.status, 'ready');
  assert.ok(ids(result).includes('jeffallan/claude-skills/nextjs-developer'));
  const generic = planWorkflow('Build a web app', catalog);
  assert.ok(!generic.steps.flatMap(step => step.alternatives).some(skill => skill.id === 'jeffallan/claude-skills/nextjs-developer'));
});

test('planner never fills catalog gaps with invented or unrelated skills', () => {
  for (const source of [undefined, null, {}, [], catalog.filter(skill => skill.category === 'security')]) {
    const result = planWorkflow('Build a landing page and create a social campaign', source);
    assert.equal(result.status, 'clarify');
    assert.deepEqual(result.steps, []);
    assert.deepEqual(result.choices, []);
  }
  const missingAnchor = catalog.filter(skill => !['coreyhaines31/marketingskills/content-strategy', 'jasoncolapietro/suede-creator-skills/suede-content-strategy'].includes(skill.id));
  const result = planWorkflow('Build a landing page and create a social campaign', missingAnchor);
  assert.equal(result.status, 'clarify');
  assert.deepEqual(result.steps, []);
  assert.ok(result.choices.every(choice => planWorkflow(choice.prompt, missingAnchor).status === 'ready'));
});

test('planner refuses malicious navigation values for both selected skills and alternatives', () => {
  for (const field of ['href', 'report']) for (const value of ['javascript:alert(1)', '//evil.example/path', '/directory/../evil/', '/%2f%2fevil.example']) {
    const poisoned = catalog.map(skill => ({ ...skill, [field]: value }));
    const result = planWorkflow('Build a landing page', poisoned);
    assert.equal(result.status, 'clarify');
    assert.deepEqual(result.steps, []);
    assert.deepEqual(result.choices, []);
  }
  const onePoisoned = catalog.map(skill => skill.id === 'anthropics/skills/frontend-design' ? { ...skill, href: 'javascript:alert(1)' } : skill);
  const safe = planWorkflow('Build a landing page', onePoisoned);
  assert.equal(safe.status, 'ready');
  assert.ok(!safe.steps.flatMap(step => step.alternatives).some(skill => skill.id === 'anthropics/skills/frontend-design'));
});

test('planner bounds and normalizes input without reflecting arbitrary markup or unknown constraints', () => {
  const plain = planWorkflow('Launch a SaaS landing page', catalog);
  assert.deepEqual(planWorkflow('Launch a SaaS landing page' + ' '.repeat(2000) + ' and build an AI agent', catalog), plain);
  assert.equal(planWorkflow(' '.repeat(2000) + 'Build a landing page', catalog).status, 'empty');
  assert.deepEqual(planWorkflow('ＬＡＵＮＣＨ a ＳａａＳ landing—page!', catalog), plain);
  const injected = planWorkflow('<img src=x onerror=alert(1)> Launch a landing page under $50 by Friday with HIPAA compliance', catalog);
  assert.equal(injected.status, 'ready');
  assert.doesNotMatch(JSON.stringify(injected), /onerror|<img|\$50|Friday|HIPAA/);
  assert.match(injected.notices.join(' '), /budget|cost|timing|constraint/i);
});

test('planner is deterministic and does not mutate supplied options or catalog', () => {
  const before = JSON.stringify(catalog);
  const options = Object.freeze({ mode: 'simple', freeOnly: true });
  const prompt = 'Build a landing page and create a social campaign';
  const result = planWorkflow(prompt, catalog, options);
  assert.deepEqual(planWorkflow(prompt, [...catalog].reverse(), options), result);
  assert.deepEqual(planWorkflow(prompt, [...catalog, ...catalog, null, {}, 3], options), result);
  assert.equal(JSON.stringify(catalog), before);
  assert.deepEqual(options, { mode: 'simple', freeOnly: true });
});

test('planner keeps the original eight supported workflows usable with their natural output requests', () => {
  for (const [prompt, intent, required] of briefs) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'ready', prompt);
    assert.deepEqual(result.intents.map(item => item.id), [intent], prompt);
    assert.ok(ids(result).includes(required), prompt);
  }
});

test('planner does not promise omitted phases when a valid catalog has only partial supporting coverage', () => {
  const reduced = catalog.filter(skill => !['coreyhaines31/marketingskills/analytics', 'pbakaus/impeccable/impeccable', 'jasoncolapietro/suede-creator-skills/suede-analytics', 'jasoncolapietro/suede-creator-skills/suede-design'].includes(skill.id));
  const result = planWorkflow('Build a landing page', reduced);
  assert.equal(result.status, 'ready');
  assert.equal(result.steps.length, 3);
  assert.doesNotMatch(result.summary, /measure signups/i);
  assert.match(result.notices.join(' '), /missing|available|omitted|coverage/i);
});

test('planner does not attach platform-specific handoffs to an incompatible alternative', () => {
  const result = planWorkflow('Research competitors and compare companies', catalog);
  const source = result.steps[0];
  assert.equal(source.skill.id, 'jasoncolapietro/suede-creator-skills/suede-competitor-profiling');
  assert.ok(source.alternatives.some(skill => skill.id === 'browserbase/skills/company-research'));
  assert.deepEqual(source.skill, byId.get(source.skill.id));
  const scientific = planWorkflow('Create a scientific research report', catalog);
  assert.equal(scientific.status, 'ready');
  assert.equal(scientific.steps[0].skill.id, 'k-dense-ai/claude-scientific-skills/literature-review');
  assert.ok(!scientific.steps[0].alternatives.some(skill => ['browserbase/skills/company-research', 'jasoncolapietro/suede-creator-skills/suede-competitor-profiling'].includes(skill.id)));
});

test('planner keeps coordinated negation scoped until a new positive instruction', () => {
  for (const prompt of ['Do not create a landing page and a social campaign', 'Avoid SEO and social media']) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'clarify', prompt);
    assert.deepEqual(result.steps, []);
  }
  const positive = planWorkflow('Not a landing page and create a social campaign instead', catalog);
  assert.equal(positive.status, 'ready');
  assert.deepEqual(positive.intents.map(intent => intent.id), ['content-and-social']);
});

test('planner clarifies unsupported coordinated noun goals rather than hiding them', () => {
  for (const prompt of ['Build a landing page plus a flight booking', 'Create a social campaign and a nuclear reactor']) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'clarify', prompt);
    assert.deepEqual(result.steps, []);
  }
});

test('planner preserves purpose scope across coordinated nouns until a new explicit action', () => {
  for (const prompt of [
    'Build a web app to analyze CSV and sales data',
    'Build a web app for SEO and social media',
    'Build a web app for SEO, social media and sales data',
  ]) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'ready', prompt);
    assert.deepEqual(result.intents.map(intent => intent.id), ['web-app'], prompt);
  }
  const independent = planWorkflow('Build a web app for SEO and create a social campaign', catalog);
  assert.equal(independent.status, 'ready');
  assert.deepEqual(independent.intents.map(intent => intent.id), ['web-app', 'content-and-social']);
});

test('planner clarifies unsupported writing, design and analysis tasks rather than silently dropping them', () => {
  for (const suffix of ['write an email', 'design a logo', 'analyze our sales', 'analyse our sales']) {
    const result = planWorkflow(`Build a landing page and ${suffix}`, catalog);
    assert.equal(result.status, 'clarify', suffix);
    assert.deepEqual(result.steps, []);
  }
  for (const prompt of ['Build a landing page and write copy', 'Analyze CSV sales data and write a report']) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'ready', prompt);
    assert.equal(result.intents.length, 1, prompt);
  }
});

test('planner ranks role choices using their own goal rather than unrelated company or platform context', () => {
  const scientific = planWorkflow('Create a scientific research report and build a landing page for my company', catalog);
  assert.equal(scientific.status, 'ready');
  assert.ok(ids(scientific).includes('k-dense-ai/claude-scientific-skills/literature-review'));
  assert.ok(!ids(scientific).includes('browserbase/skills/company-research'));
  assert.ok(!scientific.steps.flatMap(step => step.alternatives).some(skill => skill.id === 'browserbase/skills/company-research'));
  const app = planWorkflow('Build a landing page for a Next.js library and build a web app with Vue', catalog);
  assert.equal(app.status, 'ready');
  assert.ok(ids(app).includes('agiwhitelist/auteur/auteur'));
  assert.ok(!ids(app).includes('jeffallan/claude-skills/nextjs-developer'));
  assert.ok(!app.steps.flatMap(step => step.alternatives).some(skill => skill.id === 'jeffallan/claude-skills/nextjs-developer'));
});

test('planner keeps explicit exclusions across sentences when selecting clause-local skills', () => {
  for (const prompt of ['Build an AI agent. Do not use MCP.', 'Create an explainer video. Avoid CapCut.']) {
    const result = planWorkflow(prompt, catalog);
    assert.ok(!result.steps.some(step => ['anthropics/skills/mcp-builder', 'renezander030/capcut-cli/capcut-edit'].includes(step.skill.id)), prompt);
  }
});

test('planner keeps explicit action lists negated across and and or without a clear replacement', () => {
  for (const prompt of [
    'Do not build a landing page or create a social campaign',
    "Don't build a landing page or build an AI agent",
    'Do not create a landing page and create a social campaign',
  ]) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'clarify', prompt);
    assert.deepEqual(result.steps, []);
  }
  const contrast = planWorkflow('Do not build a landing page but create a social campaign', catalog);
  assert.equal(contrast.status, 'ready');
  assert.deepEqual(contrast.intents.map(intent => intent.id), ['content-and-social']);
});

test('planner keeps an excluded modifier from negating the next positive goal', () => {
  for (const prompt of [
    'Build a landing page without SEO and create a social campaign',
    'Build a landing page with no video and create a social campaign',
  ]) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'ready', prompt);
    assert.deepEqual(result.intents.map(intent => intent.id), ['landing-page', 'content-and-social'], prompt);
  }
  const excludedNouns = planWorkflow('Build a landing page without SEO and a social campaign', catalog);
  assert.deepEqual(excludedNouns.intents.map(intent => intent.id), ['landing-page']);
});

test('planner treats then as an explicit new outcome after a purpose clause', () => {
  for (const prompt of [
    'Build a web app for my team, then a landing page',
    'Build a web app for my team and then a landing page',
    'Build a web app for SEO then a social campaign',
  ]) {
    const result = planWorkflow(prompt, catalog);
    assert.equal(result.status, 'ready', prompt);
    assert.equal(result.intents.length, 2, prompt);
  }
});

test('planner handles strong unknown directives consistently instead of dropping unlisted verbs', () => {
  for (const prefix of ['Build a landing page and ', 'Build a web app for my team and ']) {
    for (const task of ['prepare an email', 'fix a security vulnerability', 'draft an email', 'debug my application', 'organize our files']) {
      const result = planWorkflow(prefix + task, catalog);
      assert.equal(result.status, 'clarify', prefix + task);
      assert.deepEqual(result.steps, []);
    }
  }
  const report = planWorkflow('Analyze CSV sales data and prepare a report', catalog);
  assert.equal(report.status, 'ready');
  assert.equal(report.intents.length, 1);
});

const articleData = JSON.parse(readFileSync(new URL('../docs/directory/workflow-articles.json', import.meta.url), 'utf8')).articles;

test('goal-phrased briefs reach the matching workflow', () => {
  for (const [prompt, intent] of [
    ['I run a small bakery and want more customers to find us on Google', 'seo-and-ai-search'],
    ['I want to grow my audience on TikTok', 'content-and-social'],
    ['I need more signups from my site visitors with a better landing page', 'landing-page'],
  ]) {
    const plan = planWorkflow(prompt, catalog);
    assert.equal(plan.status, 'ready', prompt);
    assert.equal(plan.intents[0].id, intent, prompt);
  }
});

test('skill recommendations follow the goal, use real listings and respect filters', () => {
  const cases = [
    ['trying to get my app into the App Store', /\b(app store|ios|aso)\b/i],
    ['I want to automate my email inbox', /\b(email|inbox|gmail)\b/i],
    ['code review for my team’s pull requests', /\b(review|pull request|pr)\b/i],
    ['seo', /\bseo\b/i],
  ];
  for (const [prompt, pattern] of cases) {
    const skills = recommendSkills(prompt, catalog);
    assert.ok(skills.length >= 3, prompt);
    assert.ok(skills.length <= 6);
    for (const skill of skills) assert.ok(catalog.includes(skill), 'returns catalog entries');
    assert.match(`${skills[0].name} ${skills[0].description} ${(skills[0].topics || []).join(' ')}`, pattern, prompt);
    assert.equal(new Set(skills.map(skill => skill.name.toLowerCase())).size, skills.length, 'no duplicate names');
  }
  const free = recommendSkills('seo audit', catalog, { freeOnly: true, limit: 12 });
  assert.ok(free.length && free.every(skill => skill.lane === 'free-open-source'));
  const first = recommendSkills('seo audit', catalog)[0];
  assert.ok(!recommendSkills('seo audit', catalog, { exclude: [first.id] }).some(skill => skill.id === first.id));
});

test('everyday wording is mapped to what skills describe', () => {
  const bakery = recommendSkills('I run a small bakery and want more customers to find us on Google', catalog);
  assert.ok(!bakery.some(skill => skill.repo === 'google/skills'), 'Google Cloud skills are not an SEO answer');
  const music = recommendSkills('I’m a musician releasing a new single', catalog);
  assert.ok(music.some(skill => /music|song|album/i.test(`${skill.name} ${skill.description}`)));
});

test('skill recommendations ignore empty, filler and malformed input', () => {
  for (const prompt of ['', '   ', null, 42, 'help me with something', 'I want to do it']) assert.deepEqual(recommendSkills(prompt, catalog), [], String(prompt));
  assert.deepEqual(recommendSkills('seo audit', null), []);
  const hostile = [{ id: '../../x/y', name: 'seo', repo: 'x', description: 'seo audit', href: 'https://evil.example/' }];
  assert.deepEqual(recommendSkills('seo audit', hostile), []);
});

test('article picks lead with each matched workflow, then the visitor’s own words', () => {
  const titles = (prompt, intents) => recommendArticles(prompt, intents, articleData).map(article => article.href);
  const both = titles('Build a landing page and create a social campaign', ['landing-page', 'content-and-social']);
  assert.equal(both[0], 'https://suedeai.directory/stacks/landing-page/');
  assert.equal(both[1], 'https://suedeai.directory/stacks/content-and-social/');
  assert.ok(titles('how do I write my own skill', []).includes('https://skills.suedeai.ai/book/write-your-own.html'));
  assert.ok(titles('I’m new to Claude Code and want to get started', []).includes('https://suedeai.directory/guides/install-agent-skills/'));
  assert.ok(titles('trying to get my app into the App Store', []).includes('https://skills.suedeai.ai/book/shipping-into-the-real-world.html'));
  assert.deepEqual(titles('', []), []);
  assert.ok(recommendArticles('seo', ['seo-and-ai-search'], articleData, 2).length <= 2);
});

test('only Jason’s published articles on approved paths can be recommended', () => {
  const base = { author: 'Jason Colapietro', title: 'T', summary: 'S', intents: ['research'], keywords: [] };
  assert.ok(isPublishableArticle({ ...base, href: 'https://suedeai.directory/stacks/research/' }));
  assert.ok(isPublishableArticle({ ...base, href: 'https://skills.suedeai.ai/book/full-send.html' }));
  assert.ok(isPublishableArticle({ ...base, href: 'https://skills.suedeai.ai/blog/why-breadth-is-free.html' }));
  for (const bad of [
    { ...base, author: 'Someone else', href: 'https://suedeai.directory/stacks/research/' },
    { ...base, href: 'https://example.com/stacks/research/' },
    { ...base, href: 'javascript:alert(1)' },
    { ...base, href: 'https://skills.suedeai.ai/blog/../../x' },
    { ...base, intents: [], keywords: [], href: 'https://suedeai.directory/stacks/research/' },
  ]) assert.equal(isPublishableArticle(bad), false, JSON.stringify(bad));
  assert.ok(articleData.every(isPublishableArticle), 'every published article passes');
});

test('Suede AI skills lead the recommendations when they match the goal', () => {
  for (const prompt of ['seo', 'I’m a musician releasing a new single', 'write a cold email to investors', 'trying to get my app into the App Store', 'I want better analytics on my website']) {
    const skills = recommendSkills(prompt, catalog);
    assert.ok(isFirstParty(skills[0]), `${prompt}: ${skills[0]?.id}`);
    const firstOther = skills.findIndex(skill => !isFirstParty(skill));
    assert.ok(firstOther === -1 || skills.slice(firstOther).every(skill => !isFirstParty(skill)), `${prompt}: Suede skills are grouped first`);
    assert.ok(skills.some(skill => !isFirstParty(skill)), `${prompt}: other publishers still appear`);
  }
  // No Suede skill fits an inbox goal, so none is pushed in.
  assert.ok(!recommendSkills('I want to automate my email inbox', catalog).some(isFirstParty));
});

test('display-named listings match on their slug, and a NOT FOR clause is never a match', () => {
  const listing = (over = {}) => ({ id: 'acme/pack/inbox-tool', name: 'Acme Inbox Tool Skills', slug: 'inbox-tool', repo: 'acme/pack',
    href: '/directory/acme/pack/inbox-tool/', description: 'Triages an email inbox and drafts replies.', score: 80, ...over });
  assert.equal(recommendSkills('triage my email inbox', [listing()]).length, 1);
  assert.equal(recommendSkills('triage my email inbox', [listing({ slug: 'other-tool' })]).length, 0, 'slug must match the id');
  assert.equal(recommendSkills('triage my email inbox', [listing({ slug: undefined })]).length, 0, 'a display name alone is not an id');
  const negative = listing({ description: 'Plans SEO audits for websites. NOT FOR: email inbox triage or replies.' });
  assert.equal(recommendSkills('triage my email inbox', [negative]).length, 0);
});

test('Suede AI skills lead the workflow steps they cover, with the earlier picks kept as alternatives', () => {
  const cases = [
    ['Launch a SaaS landing page', 'Write the offer and call to action', 'suede-copy', 'coreyhaines31/marketingskills/copywriting'],
    ['Launch a SaaS landing page', 'Polish hierarchy and accessibility', 'suede-design', 'pbakaus/impeccable/impeccable'],
    ['Launch a SaaS landing page', 'Measure the conversion path', 'suede-analytics', 'coreyhaines31/marketingskills/analytics'],
    ['Build a web app for tracking team tasks', 'Review security before release', 'suede-code', 'getsentry/skills/security-review'],
    ['Get my business found in AI search and improve SEO', 'Audit search access and demand', 'suede-seo-audit', 'mblode/agent-skills/seo'],
    ['Get my business found in AI search and improve SEO', 'Make answers clear and supportable', 'suede-ai-seo', 'coreyhaines31/marketingskills/ai-seo'],
    ['Turn one idea into a social campaign', 'Draft the posts in a consistent voice', 'suede-social', 'mblode/agent-skills/ghostwriter'],
    ['Turn one idea into a social campaign', 'Edit for clarity and specificity', 'suede-deslop', 'danjdewhurst/story-skills/line-editing'],
    ['Build an AI agent with MCP tools', 'Define behavior and evaluation cases', 'suede-ai-eval', 'getsentry/skills/prompt-optimizer'],
    ['Create an explainer video', 'Plan and produce the video scenes', 'suede-video', 'coreyhaines31/marketingskills/video'],
  ];
  for (const [prompt, title, suede, previous] of cases) {
    const step = planWorkflow(prompt, catalog).steps.find(item => item.title === title);
    assert.ok(step, `${prompt}: ${title}`);
    assert.equal(step.skill.id, 'jasoncolapietro/suede-creator-skills/' + suede, title);
    assert.ok(isFirstParty(step.skill));
    assert.ok(step.alternatives.some(skill => skill.id === previous), `${title} keeps ${previous} as an alternative`);
  }
  // Open-source mode keeps the Suede picks: the pack is MIT licensed.
  const free = planWorkflow('Get my business found in AI search and improve SEO', catalog, { freeOnly: true });
  assert.ok(free.steps.every(step => isFirstParty(step.skill)));
});
