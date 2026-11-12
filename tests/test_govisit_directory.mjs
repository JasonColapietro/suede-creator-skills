import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { costLane, skillFlags } from '../scripts/directory/facets.mjs';
import { qualityScore } from '../scripts/directory/badges.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const repo = 'inhotel-io/govisit-toolkit';
const data = JSON.parse(read('directory/skills.json'));
const scope = JSON.parse(read('directory/inclusions.json'));
const notes = JSON.parse(read('directory/notes.json'));
const skills = data.skills.filter((s) => s.repo === repo);

test('GoVisit scope freezes 22 canonical packages and excludes native copies', () => {
  assert.equal(skills.length, 22);
  assert.equal(new Set(skills.map((s) => s.name)).size, 22);
  assert.deepEqual(new Set(skills.map((s) => s.name)), new Set(scope.skills[repo]));
  assert.deepEqual(scope.skill_roots[repo], ['skills']);
  assert.deepEqual(new Set(skills.map((s) => s.dir)), new Set(scope.skill_paths[repo]));
  assert.equal(data.repos[repo].commit_sha, '0b318f836fe1bb66ea45099d302e24fc0bd11d3d');
  assert.equal(skills.filter((s) => s.featured).length, 12);
  for (const s of skills) {
    assert.equal(s.dir, `skills/${s.name}`);
    assert.equal(s.license, 'MIT');
    assert.equal(s.security_scan_status, 'not_scanned');
    assert.equal(s.score, qualityScore(s, data.repos[repo], data.generated));
    assert.equal(costLane(s), 'free-with-service');
    assert.ok(skillFlags(s).includes('network'));
    assert.ok(!skillFlags(s).includes('no-setup'));
    assert.ok(!s.install.mcp);
    assert.deepEqual(s.install.hosts, ['govisit.ai']);
  }
});

test('publisher and separate data terms appear before installation on every GoVisit surface', () => {
  const repository = read(`docs/directory/${repo}/index.html`);
  assert.ok(repository.includes('GoVisit.ai / inHotel Sàrl'));
  assert.ok(repository.includes('Service and licensing'));
  assert.ok(!repository.includes(`npx skills add https://github.com/${repo}</code>`));
  assert.ok(read('awesome/publishers.md').includes('GoVisit.ai / inHotel Sàrl'));
  for (const s of skills) {
    const note = notes[`${repo}/${s.slug}`];
    const row = repository.split(`<tr id="${s.slug}" `)[1]?.split('</tr>')[0];
    assert.ok(row?.includes(note.notice), s.name);
    assert.ok(row.includes(note.source));
    assert.ok(read(`docs/directory/${s.category}/index.html`).includes(note.notice));
    assert.ok(read(`awesome/categories/${s.category}.md`).includes(note.notice));
    const report = JSON.parse(read(`docs/directory/${repo}/${s.slug}/report.json`));
    assert.equal(report.service_notice, note.notice);
    assert.equal(report.service_terms_url, note.source);
    assert.deepEqual(report.install.hosts, ['govisit.ai']);
    if (s.featured) {
      const page = read(`docs/directory/${repo}/${s.slug}/index.html`);
      assert.ok(page.includes(note.text));
      assert.ok(!page.includes('its scripts use an HTTP client'));
      assert.ok(page.includes('Source assessed'));
      assert.ok(page.includes('need credentials, an MCP server or network access?'));
      assert.ok(!page.includes('At the October 22, 2026 snapshot its files'));
      assert.ok(page.includes('At the November 11, 2026 assessment its files'));
      assert.ok(page.includes('November 11, 2026'));
      assert.ok(page.indexOf(note.text) < page.indexOf('id="install-cli"'));
    }
  }
});

test('scoped intake preserves every existing publisher record', () => {
  const receipt = JSON.parse(read('directory/reviews/2026-11-11-govisit/scoped-ingestion.json'));
  assert.equal(receipt.existing_before_sha256, receipt.existing_after_sha256);
  // First-party listings change through their own scoped intake
  // (scripts/directory/first_party.py), so compare only third-party records
  // against the 66 first-party listings present when GoVisit was ingested.
  const firstParty = 'JasonColapietro/suede-creator-skills';
  const firstPartyAtIntake = 66;
  const thirdParty = data.skills.filter((s) => s.repo !== repo && s.repo !== firstParty).length;
  assert.equal(receipt.unchanged_existing_skills, thirdParty + firstPartyAtIntake);
  assert.equal(receipt.unchanged_existing_repositories, Object.keys(data.repos).length - 1);
});


test('new GoVisit listings carry their assessment date without changing the global snapshot', () => {
  assert.equal(data.generated, '2026-10-22');
  const ledger = JSON.parse(read('directory/listed-since.json'));
  for (const s of skills) assert.equal(ledger.dates[`${repo}/${s.slug}`], '2026-11-11');
});

test('legacy full pages do not render an empty source assessment field', () => {
  const old = data.skills.find((s) => s.featured && !data.repos[s.repo].assessment_date);
  const page = read(`docs/directory/${old.repo}/${old.slug}/index.html`);
  assert.ok(!page.includes('<dt>Source assessed</dt><dd></dd>'));
});

test('all 22 accepted GoVisit skills have directory detail pages and collection links', () => {
  const collection = read(`docs/directory/${repo}/index.html`);
  for (const s of skills) {
    const page = read(`docs/directory/${repo}/${s.slug}/index.html`);
    assert.ok(page.includes(`https://suedeai.directory/${repo}/${s.slug}/`), s.slug);
    assert.ok(collection.includes(`href="${s.slug}/"`), s.slug);
    assert.ok(page.includes(notes[`${repo}/${s.slug}`].text), s.slug);
  }
});
