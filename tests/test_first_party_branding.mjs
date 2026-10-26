import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { syncFirstPartyPublic } from '../scripts/sync-first-party-public.mjs';
const { load } = createRequire(import.meta.url)('js-yaml');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(p, 'utf8');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suede-branding-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const dir of ['skills/suede-example', 'mcp', 'docs/skills']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(path.join(root, 'skills/suede-example/SKILL.md'), '---\nname: suede-example\ndescription: Use when asked to inspect a workflow.\nmetadata:\n  display-name: Suede AI Example Skills\n---\n# Suede AI Example Skills\n');
  const catalog = { name: 'Suede Skills MCP', version: '1.2.3', specialties: [{ key: 'example', lanes: ['stable'] }], plugins: [{ name: 'suede-workflow-skills', displayName: 'Suede Workflow Skills', skills: ['suede-example'] }], skills: [{ name: 'suede-example', specialty: 'example', lane: 'stable', description: 'Old description', useWhen: 'Keep benefit' }] };
  fs.writeFileSync(path.join(root, 'mcp/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  const page = '<title>Old task</title><meta property="og:title" content="Old task"><meta name="twitter:title" content="Old task"><link rel="canonical" href="https://skills.suedeai.ai/skills/suede-example.html"><script type="application/ld+json">{"@type":"TechArticle","headline":"Old task","author":{"name":"Jason Colapietro"},"name":"Old article identity","isPartOf":{"name":"Suede Creator Skills"}}</script><h1><span class="h1-task">Old task</span> Benefit stays.</h1><p>Manual editorial copy stays.</p><code>suede-example</code>';
  fs.writeFileSync(path.join(root, 'docs/skills/suede-example.html'), page);
  fs.writeFileSync(path.join(root, 'docs/skills/retired.html'), '<title>Historical title</title>');
  fs.writeFileSync(path.join(root, 'docs/skills/index.html'), '<h1>Suede Creator Skills for founders</h1><a href="./suede-example.html"><b>suede-example</b><span>Benefit stays.</span></a><code>suede-example</code>');
  return { root, catalog, page };
}
test('sync updates public identities while preserving machine routing and manual page copy', t => {
  const { root, catalog, page } = fixture(t);
  const before = read(path.join(root, 'mcp/catalog.json'));
  assert.ok(syncFirstPartyPublic(root, { check: true }).length > 0);
  assert.equal(read(path.join(root, 'mcp/catalog.json')), before, '--check must not write');
  syncFirstPartyPublic(root);
  const after = JSON.parse(read(path.join(root, 'mcp/catalog.json')));
  assert.equal(after.name, 'Suede AI Skills');
  assert.deepEqual(after.specialties, catalog.specialties);
  assert.deepEqual(after.plugins.map(p => [p.name, p.skills]), catalog.plugins.map(p => [p.name, p.skills]));
  assert.deepEqual(after.skills.map(s => [s.name, s.specialty, s.lane, s.useWhen]), catalog.skills.map(s => [s.name, s.specialty, s.lane, s.useWhen]));
  assert.equal(after.skills[0].displayName, 'Suede AI Example Skills');
  assert.equal(after.skills[0].description, 'Use when asked to inspect a workflow.');
  const html = read(path.join(root, 'docs/skills/suede-example.html'));
  assert.match(html, /<span class="h1-task">Suede AI Example Skills<\/span> Benefit stays/);
  assert.match(html, /<title>Suede AI Example Skills<\/title>/);
  assert.ok(html.includes('<p>Manual editorial copy stays.</p><code>suede-example</code>'));
  assert.ok(html.includes(page.match(/<link rel="canonical"[^>]+>/)[0]));
  const ld = JSON.parse(html.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld.headline, 'Suede AI Example Skills');
  assert.equal(ld.author.name, 'Jason Colapietro');
  assert.equal(ld.name, 'Suede AI Example Skills');
  assert.equal(read(path.join(root, 'docs/skills/retired.html')), '<title>Historical title</title>');
  assert.match(read(path.join(root, 'docs/skills/index.html')), /<b>Suede AI Example Skills<\/b><span>Benefit stays/);
  assert.deepEqual(syncFirstPartyPublic(root, { check: true }), [], 'sync is idempotent');
});
test('rejects an identity mismatch before writing any catalog or page', t => {
  const { root } = fixture(t); const file = path.join(root, 'skills/suede-example/SKILL.md');
  fs.writeFileSync(file, read(file).replace('name: suede-example', 'name: renamed-machine'));
  const before = read(path.join(root, 'mcp/catalog.json'));
  assert.throws(() => syncFirstPartyPublic(root), /identity|name/i);
  assert.equal(read(path.join(root, 'mcp/catalog.json')), before);
});
test('all active first-party sources, catalog entries, and public titles share their declared brand', () => {
  const catalog = JSON.parse(read(path.join(ROOT, 'mcp/catalog.json')));
  assert.equal(catalog.name, 'Suede AI Skills');
  assert.equal(catalog.skills.length, 64);
  for (const skill of catalog.skills) {
    const source = read(path.join(ROOT, 'skills', skill.name, 'SKILL.md'));
    const fm = load(source.match(/^---\n([\s\S]*?)\n---/)[1]);
    assert.equal(fm.name, skill.name);
    assert.match(fm.metadata['display-name'], /^Suede AI(?: .+)? Skills$/);
    assert.equal(skill.displayName, fm.metadata['display-name']);
    assert.equal(skill.description, fm.description);
    const html = read(path.join(ROOT, 'docs/skills', skill.name + '.html'));
    assert.ok(html.includes(`<span class="h1-task">${skill.displayName.replaceAll('&', '&amp;')}</span>`), skill.name);
  }
  assert.deepEqual(syncFirstPartyPublic(ROOT, { check: true }), []);
});
