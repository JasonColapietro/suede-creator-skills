import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const repo = 'cwong5/extra-caffeine-mcp';
const id = 'extra-caffeine-workflow';

test('Extra Caffeine features one proprietary workflow without claiming catalog or security qualification', () => {
  const data = JSON.parse(read('directory/skills.json'));
  assert.equal(data.skills.filter((s) => s.repo === repo).length, 0, 'catalog intake is pending');
  const project = JSON.parse(read('directory/featured-projects.json')).projects.find((p) => p.id === 'extra-caffeine');
  assert.ok(project);
  assert.equal(project.skills, undefined);
  assert.equal(project.capabilities.length, 1);
  assert.ok(project.capabilities[0].title.includes(id));
  assert.equal(project.commit, '4e0ac32e685c5366ab487502173168470a42a178');
  assert.equal(project.workflow_url, `https://github.com/${repo}/blob/${project.commit}/skills/${id}/SKILL.md`);
  assert.deepEqual(JSON.parse(read('directory/inclusions.json')).skills[repo], [id]);
  assert.ok(!fs.existsSync(new URL(`../skills/${id}`, import.meta.url)), 'no proprietary files in MIT pack');
  const page = read('docs/directory/featured/index.html');
  const feature = page.split('id="extra-caffeine"')[1]?.split('</article>')[0];
  assert.ok(feature);
  assert.ok(feature.includes(`href="${project.workflow_url}"`));
  for (const fact of ['macOS 14+', 'Extra Caffeine 1.2+', 'paid', 'All rights reserved', 'not scanned', 'runtime-unverified', 'catalog listing is pending']) assert.ok(feature.includes(fact), fact);
  assert.doesNotMatch(feature, /npx skills add|git clone|cp -R|security certified|score\.svg/);
  assert.ok(page.includes('https://skills.suedeai.ai/directory/featured/#extra-caffeine'));
  assert.ok(page.includes('https://skills.suedeai.ai/directory/badges/featured.svg'));
});
