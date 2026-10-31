import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const names = ['suede-design', 'suede-component-lab', 'suede-interface-explain'];
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const guidance = name => walk(path.join(root, 'skills', name))
  .filter(p => p.endsWith('.md') && !p.endsWith('CARD.md')).map(p => fs.readFileSync(p, 'utf8')).join('\n');

// These are packaging and instruction-contract regressions, not model-behavior
// or rendered-interface tests. Independent scenario runs supply that evidence.
test('new entry points contain no executable or asset payload and preserve attribution', () => {
  for (const name of names) {
    assert.equal(read(`skills/${name}/LICENSE.jakubkrehel-skills-MIT.txt`), read('licenses/jakubkrehel-skills-MIT.txt'));
  }
  for (const name of names.slice(1)) {
    for (const file of walk(path.join(root, 'skills', name))) {
      assert.ok(/\.(md|yaml|txt)$/.test(file), `unexpected executable/asset: ${file}`);
      assert.ok(!fs.lstatSync(file).isSymbolicLink(), `unexpected link: ${file}`);
    }
    assert.match(read(`skills/${name}/agents/openai.yaml`), /allow_implicit_invocation:\s*false/);
  }
});

test('review contract retains scope, attribution, shared causes and rendered evidence boundaries', () => {
  const text = guidance('suede-design');
  for (const pattern of [/read.only/i, /base/i, /head/i, /introduced/i, /regression/i,
    /pre.existing/i, /shared/i, /root cause/i, /approved/i, /sales copy/i,
    /source.only/i, /recapture/i, /standards?/i, /conventions?/i, /suggestions?/i]) {
    assert.match(text, pattern);
  }
  assert.doesNotMatch(text, /at most 3 passes|compare both in one pass|never pure\s*#000/i);
});

test('component contract contains isolation, real components, representative states and safe cleanup', () => {
  const text = guidance('suede-component-lab');
  for (const pattern of [/import/i, /production component/i, /synthetic/i, /dev.only/i,
    /production (?:build|artifact)/i, /non.mutating/i, /payment/i, /booking/i,
    /lead/i, /analytics/i, /credential/i, /permission/i, /loading/i, /empty/i,
    /error/i, /success/i, /focus/i, /disabled/i, /cleanup|clean up/i,
    /unrelated/i, /recapture/i]) assert.match(text, pattern);
});

test('explanation contract separates source from render and evidence from authority', () => {
  const text = guidance('suede-interface-explain');
  for (const pattern of [/read.only/i, /source/i, /inference/i, /unknown/i,
    /viewport/i, /line/i, /source.only/i, /authority/i, /credential/i,
    /rebuild/i]) assert.match(text, pattern);
});

test('pinned provenance maps every upstream entry exactly once and excludes teardown execution', () => {
  const text = read('docs/interface-quality-adaptation.md');
  assert.match(text, /592aedc44d7d5b3e29740984252902f3e5402a1c/);
  for (const name of ['better-interface', 'better-accessibility', 'better-layout',
    'better-writing', 'better-typography', 'better-colors', 'better-ui',
    'interface-review', 'break', 'state-machine', 'variant', 'explain-interface',
    'build-design', 'teardown']) {
    assert.equal(text.split(`| \`${name}\` |`).length - 1, 1, name);
  }
  assert.match(text, /teardown[^\n]+Omit/i);
  assert.match(text, /no endorsement/i);
});

test('umbrella component fallback establishes isolation before imports or server startup', () => {
  const text = read('skills/suede-workflow-skills/references/condensed-workflows.md')
    .split('## Component Lab Workflow')[1].split('## Interface Explanation Workflow')[0].replace(/\s+/g, ' ');
  assert.match(text, /before importing[\s\S]{0,100}starting[\s\S]{0,40}server/i);
  for (const pattern of [/transitive/i, /import.time/i, /module/i, /server.side/i,
    /storage/i, /analytics/i, /credentials/i, /synthetic/i]) assert.match(text, pattern);
  assert.match(text, /request.blocking alone is insufficient/i);
  assert.match(text, /unresolved[\s\S]{0,80}stop execution/i);
  assert.match(text, /only after[\s\S]{0,80}isolation[\s\S]{0,80}import/i);
});

test('umbrella UI diff fallback records exact comparison scope and unavailable evidence', () => {
  const text = read('skills/suede-workflow-skills/references/condensed-workflows.md')
    .split('## Design Workflow')[1].split('## Component Lab Workflow')[0].replace(/\s+/g, ' ');
  assert.match(text, /resolve[\s\S]{0,100}base[\s\S]{0,100}head/i);
  assert.match(text, /working.tree inventory/i);
  for (const pattern of [/staged/i, /unstaged/i, /untracked/i, /introduced/i,
    /regression/i, /pre.existing/i, /shared[\s\S]{0,50}consumers/i]) assert.match(text, pattern);
  assert.match(text, /unavailable[\s\S]{0,100}attribution unknown/i);
  assert.match(text, /never invent[\s\S]{0,100}(?:ref|commit)/i);
  assert.match(text, /read.only/i);
});

test('loaded quality gates preserve deliberate styles and the interface evidence loop', () => {
  const text = read('skills/suede-workflow-skills/references/no-missed-quality-gates.md').replace(/\s+/g, ' ');
  const design = text.split('## Design Gate')[1].split('## Design-System Gate')[0];
  for (const pattern of [/existing[\s\S]{0,60}brand/i, /standards/i, /conventions/i,
    /suggestions/i, /read.only/i, /approved copy/i]) assert.match(design, pattern);
  assert.doesNotMatch(design, /tint neutrals|hierarchy ratio of at least 1\.25|Avoid lazy cards, nested cards|no viewport-based font scaling/i);
  const loop = text.split('## Agent-Team Loop Gate')[1];
  assert.match(loop, /for interface validation/i);
  assert.match(loop, /reproduce[\s\S]{0,100}authorized[\s\S]{0,100}recapture[\s\S]{0,100}inspect/i);
  assert.match(loop, /fixed pass count cannot substitute for evidence/i);
  assert.match(loop, /(?:other|non.interface) workflows[\s\S]{0,300}three/i);
  assert.match(text, /source.only[\s\S]{0,100}(?:rendered|visual) pass/i);
});
