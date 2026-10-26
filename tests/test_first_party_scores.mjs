import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { qualityScore } from '../scripts/directory/badges.mjs';

const root = process.env.SUEDE_TEST_REPO_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const repo = 'JasonColapietro/suede-creator-skills';
const data = JSON.parse(read('directory/skills.json'));
const active = fs.readdirSync(path.join(root, 'skills')).filter(name => fs.existsSync(path.join(root, 'skills', name, 'SKILL.md'))).sort();
const own = data.skills.filter(s => s.repo === repo);

test('every maintained first-party package has an actual directory score above 90', () => {
  assert.deepEqual(own.map(s => s.name).sort(), active, 'first-party listing inventory must match the maintained source distribution');
  for (const skill of own) {
    assert.equal(skill.score, qualityScore(skill, data.repos[repo], data.generated), skill.name);
    assert.ok(skill.score >= 91, `${skill.name}: ${skill.score}`);
    assert.equal(skill.grade, 'A');
    assert.equal(skill.checks, '11111111', skill.name);
    assert.match(skill.display_name, /^Suede AI(?: .+)? Skills$/);
  }
});

test('first-party reports and retained source inventories describe the exact reviewed source', () => {
  assert.ok(own.length > 0, 'first-party reports require actual listings');
  const receipt = JSON.parse(read('directory/intake/2026-10-26-first-party.json'));
  assert.equal(receipt.source_revision, data.repos[repo].commit_sha);
  for (const [relative, expected] of Object.entries(receipt.source_files)) {
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, relative))).digest('hex'), expected, relative);
  }
  for (const skill of own) {
    const report = JSON.parse(read(`docs/directory/jasoncolapietro/suede-creator-skills/${skill.slug}/report.json`));
    assert.equal(report.skill.name, skill.name);
    assert.equal(report.skill.display_name, skill.display_name);
    assert.equal(report.source.revision, receipt.source_revision);
    assert.equal(report.quality.score, skill.score);
    assert.ok(report.source.skill_md_url.includes(`/blob/${receipt.source_revision}/skills/${skill.name}/SKILL.md`));
  }
});

test('the first-party collection uses its public name and useful category search terms', () => {
  const html = read('docs/directory/jasoncolapietro/suede-creator-skills/index.html');
  assert.match(html, /<h1>Suede AI Skills\b/);
  assert.match(html, /<title>Suede AI Skills:/);
  const keywords = html.match(/<meta name="keywords" content="([^"]+)"/)[1].split(', ');
  assert.ok(!/suede/i.test(keywords[0]));
  assert.equal(keywords.filter(k => /suede/i.test(k)).length, 1);
});
