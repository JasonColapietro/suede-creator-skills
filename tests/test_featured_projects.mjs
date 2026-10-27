import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { qualityScore } from '../scripts/directory/badges.mjs';
import * as featured from '../scripts/directory/featured.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const data = JSON.parse(read('directory/featured-projects.json'));
const published = () => read('docs/directory/featured/index.html');

test('Arcmira membership links only six pinned plugin skills and carries no certification', () => {
  const members = featured.directoryMembers(data);
  assert.deepEqual(members.map((m) => m.repo), ['arcmira/mcp']);
  const member = members[0];
  assert.equal(member.scope, 'plugins/arcmira/skills');
  assert.equal(member.license_file, 'plugins/arcmira/LICENSE');
  assert.equal(member.commit, '557fc76b697a2eaf1fee3bbfae90f25181ae2e93');
  assert.deepEqual(member.skills.map((s) => s.id), ['arcmira', 'company-watch', 'compare-shows', 'find-quotes', 'person-research', 'sponsor-research']);
  assert.ok(!data.projects.some((p) => p.repo === member.repo));
  assert.ok(!JSON.parse(read('directory/skills.json')).skills.some((s) => s.repo === member.repo));
  assert.ok(!JSON.stringify(JSON.parse(read('directory/promotion.json'))).includes(member.repo));
  const page = published();
  const card = page.split('id="arcmira"')[1]?.split('</article>')[0];
  assert.ok(card, 'member card exists');
  assert.match(card, /Suede Directory Member/);
  assert.match(page, /id="directory-members"/);
  assert.ok(page.indexOf('id="directory-members"') < page.indexOf('id="arcmira"'));
  for (const skill of member.skills) assert.ok(card.includes(`href="https://github.com/${member.repo}/blob/${member.commit}/${member.scope}/${skill.id}/SKILL.md"`));
  assert.ok(card.includes('href="https://github.com/arcmira/mcp"'));
  assert.ok(card.includes(`/blob/${member.commit}/plugins/arcmira/LICENSE`));
  assert.ok(fs.existsSync(path.join(root, member.review)));
  assert.doesNotMatch(card, /certified|verified|score\.svg|badge\.svg|npx skills add|git clone/i);
  assert.doesNotMatch(page, /featured-badge-arcmira/);
  const awesome = read('awesome/featured.md').split('## Directory members')[1];
  assert.match(awesome, /\*\*Suede Directory Member\*\*/);
  for (const skill of member.skills) assert.ok(awesome.includes(`/blob/${member.commit}/${member.scope}/${skill.id}/SKILL.md`));
  const ld = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => [JSON.parse(m[1])].flat());
  const collection = ld.find((item) => item['@type'] === 'CollectionPage');
  assert.equal(collection.mainEntity.numberOfItems, data.projects.length + members.length);
  assert.equal(collection.mainEntity.itemListElement.at(-1).url, 'https://skills.suedeai.ai/directory/featured/#arcmira');
});

test('membership schema rejects qualification fields, ambiguous identities and unpinned paths', () => {
  assert.equal(typeof featured.directoryMembers, 'function');
  for (const patch of [{ score: 99 }, { grade: 'A' }, { certified: true }, { verified: true }, { badges: ['score'] }, { skills: [{ id: '../server', title: 'Server', description: 'Server' }] }, { scope: '.' }, { scope: 'plugins/../src' }, { commit: 'master' }, { id: data.projects[0].id }]) {
    const invalid = structuredClone(data);
    Object.assign(invalid.members[0], patch);
    assert.throws(() => featured.directoryMembers(invalid), /member/i);
  }
  const duplicate = structuredClone(data);
  duplicate.members.push(structuredClone(duplicate.members[0]));
  assert.throws(() => featured.directoryMembers(duplicate), /member/i);
});

test('Arcmira review preserves original scores and every raw scan finding', () => {
  const prefix = 'directory/reviews/2026-10-27-arcmira';
  const quality = JSON.parse(read(`${prefix}/quality-scores.json`));
  for (const [file, digest] of Object.entries(JSON.parse(read(`${prefix}/SHA256.json`)))) {
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, prefix, file))).digest('hex'), digest, file);
  }
  assert.deepEqual(quality.map((s) => [s.name, s.python_score, s.grade]), [
    ['arcmira', 77, 'C'], ['company-watch', 69, 'D'], ['compare-shows', 67, 'D'],
    ['find-quotes', 69, 'D'], ['person-research', 69, 'D'], ['sponsor-research', 67, 'D'],
  ]);
  for (const skill of quality) {
    const scan = JSON.parse(read(`${prefix}/security/${skill.name}.json`));
    assert.equal(scan.source.revision, '557fc76b697a2eaf1fee3bbfae90f25181ae2e93');
    assert.equal(scan.scanner.version, '2.3.1');
    assert.equal(scan.coverage.complete, true);
    assert.equal(scan.analysis.findings_count, 1);
    assert.equal(scan.analysis.findings[0].rule_id, 'MANIFEST_MISSING_LICENSE');
    assert.equal(scan.analysis.findings[0].severity, 'INFO');
    assert.deepEqual(scan.analysis.analyzers_failed, []);
  }
});

test('editorial projects preserve accepted scopes and resolve their reviewed evidence', () => {
  assert.deepEqual(data.projects.map((p) => p.repo), ['appierun/appie-mcp', 'TheColliery/CoalWash', 'costory-io/costory-finops-mcp-skills', 'cwong5/extra-caffeine-mcp', 'MelMayssonOwen/agent-skills', 'cisco-ai-defense/skill-scanner']);
  const page = published();
  const appie = page.split('id="appie"')[1].split('</article>')[0];
  const links = [...appie.matchAll(/href="(\.\.\/appierun\/appie-mcp\/[^"/]+\/)"/g)].map((m) => m[1]);
  assert.deepEqual(links, [
    '../appierun/appie-mcp/appie-article-writer/',
    '../appierun/appie-mcp/appie-chatbot/',
    '../appierun/appie-mcp/appie-url-shortener/',
  ]);
  for (const href of links) assert.ok(fs.existsSync(path.resolve(root, 'docs/directory/featured', href, 'index.html')));
  assert.doesNotMatch(appie, /linkedin|reddit|npx skills add/i);
  for (const project of data.projects) {
    assert.ok(fs.existsSync(path.join(root, project.review)));
    assert.match(project.commit, /^[a-f0-9]{40}$/);
    assert.ok(page.includes(`https://github.com/${project.repo}/tree/${project.commit}`));
  }
});

test('CoalWash publishes only the complete plugin route with material hook behavior', () => {
  const page = published();
  const commands = page.match(/<code id="coalwash-commands">([^<]+)<\/code>/)?.[1];
  assert.equal(commands, 'claude plugin marketplace add TheColliery/CoalWash\nclaude plugin install coalwash@coalwash');
  assert.doesNotMatch(page, /npx skills add|cp -R|lossless|security certified|security-scan-passed/i);
  for (const fact of ['SessionStart', 'Stop', 'PreToolUse', 'PostToolUse', 'without a new prompt', 'requires consent', 'Shell writes', 'semantic preservation']) assert.ok(page.includes(fact), fact);
  assert.ok(page.includes('data-copy-target="coalwash-commands"'));
  assert.ok(page.includes('Snapshot and token-check coverage</summary>'));
  assert.doesNotMatch(page, /class="grade|score\.svg|badge\.svg|aggregateRating|reviewRating/);
});

test('featured page has a discoverable route, truthful structured data and selection context', () => {
  const page = published();
  assert.match(read('docs/directory/index.html'), /class="featured-callout" href="featured\/"/);
  assert.match(page, /rel="canonical" href="https:\/\/skills\.suedeai\.ai\/directory\/featured\/"/);
  assert.equal((page.match(/<h1[ >]/g) || []).length, 1);
  const blocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const collection = blocks.find((x) => x['@type'] === 'CollectionPage');
  assert.equal(collection.mainEntity.numberOfItems, 7);
  assert.deepEqual(collection.mainEntity.itemListElement.map((p) => p.name), ['Appie', 'CoalWash', 'Costory', 'Extra Caffeine', 'Opsibyte', 'Cisco AI Defense Skill Scanner', 'Arcmira']);
  assert.match(page, /README-badge verification is tracked separately/);
  assert.match(page, /href="\.\.\/submit\/"/);
  assert.match(page, /href="\.\.\/methodology\/"/);
});

test('Opsibyte publishes only six accepted upstream skills with current grades and disclosed fixes', () => {
  const catalog = JSON.parse(read('directory/skills.json'));
  const evidence = JSON.parse(read('directory/intake/opsibyte-2026-10-22.json'));
  const inclusions = JSON.parse(read('directory/inclusions.json'));
  const project = data.projects.find((p) => p.id === 'opsibyte');
  const records = catalog.skills.filter((s) => s.repo === project.repo);
  assert.deepEqual(records.map((s) => s.name).sort(), [...evidence.accepted_names].sort());
  assert.deepEqual(inclusions.skills[project.repo], evidence.accepted_names);
  assert.deepEqual(project.skills.map((s) => s.id), evidence.accepted_names);
  assert.equal(catalog.repos[project.repo].commit_sha, evidence.revision);
  assert.equal(project.commit, evidence.revision);
  assert.equal(catalog.repos[project.repo].scoped_install, true);
  const feature = published().split('id="opsibyte"')[1].split('</article>')[0];
  assert.match(feature, /OAuth/);
  assert.match(feature, /not exercised/);
  assert.match(feature, /Upstream PR #1/);
  for (const record of records) {
    const assessed = evidence.assessments.find((s) => s.name === record.name);
    assert.equal(record.checks, '11111111');
    assert.equal(record.security_scan_status, 'not_scanned');
    assert.equal(record.score, assessed.score);
    assert.equal(record.score, qualityScore(record, catalog.repos[project.repo], catalog.generated));
    assert.equal(record.grade, 'C');
    assert.equal(record.license, 'MIT');
    assert.ok(record.featured);
    const folder = `docs/directory/melmayssonowen/agent-skills/${record.slug}/`;
    const report = JSON.parse(read(folder + 'report.json'));
    assert.equal(report.source.revision, evidence.revision);
    assert.deepEqual(report.badges.map((b) => b.kind), ['listing']);
    assert.ok(feature.includes(`href="../melmayssonowen/agent-skills/${record.slug}/"`));
    assert.match(read(folder + 'index.html'), /Before you install/);
  }
  const budget = read('docs/directory/melmayssonowen/agent-skills/sheetfolk-budget-builder/index.html');
  assert.match(budget, /overwrites an existing output path/);
  assert.match(budget, /TOTAL row adds income/);
  const social = read('docs/directory/melmayssonowen/agent-skills/timetopost-social-scheduler/index.html');
  assert.match(social, /replaces existing UTM attribution/);
  const repoPage = read('docs/directory/melmayssonowen/agent-skills/index.html');
  assert.doesNotMatch(repoPage, /<code[^>]*>npx skills add MelMayssonOwen\/agent-skills<\/code>/);
  const promotion = JSON.parse(read('directory/promotion.json'));
  assert.ok(!Object.keys(promotion.verifications).some((id) => id.startsWith('melmayssonowen/agent-skills/')));
});

test('Costory features the four requested upstream skills with their source-derived ratings', () => {
  const catalog = JSON.parse(read('directory/skills.json'));
  const project = data.projects.find((p) => p.id === 'costory');
  assert.ok(project, 'Costory editorial selection');
  const records = catalog.skills.filter((s) => s.repo === project.repo);
  const expected = { bigquery: 85, 'cost-change-investigation': 81, 'costory-finops': 80, 'virtual-dimensions': 81 };
  const evidence = catalog.repos[project.repo].supplementary_citations;
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].source, 'TensorBlock/awesome-mcp-servers');
  assert.equal(evidence[0].verified_at, catalog.generated);
  assert.ok(!catalog.sources.includes(evidence[0].source), 'supplementary evidence is not a discovery source');
  assert.deepEqual(records.map((s) => s.name).sort(), Object.keys(expected).sort());
  assert.deepEqual(project.skills.map((s) => s.id).sort(), records.map((s) => s.slug).sort());
  assert.equal(project.commit, catalog.repos[project.repo].commit_sha);
  for (const record of records) {
    const score = qualityScore(record, catalog.repos[project.repo], catalog.generated);
    assert.equal(score, expected[record.name], record.name);
    assert.equal(record.score, score);
    assert.equal(record.checks, '11111111');
    assert.ok(record.featured);
  }
  const page = published();
  const feature = page.split('id="costory"')[1].split('</article>')[0];
  assert.match(feature, /Costory workspace/);
  assert.match(feature, /OAuth/);
  assert.doesNotMatch(feature, /model drift|compensation|proposed score|source improvement/i);
  assert.match(page, /<meta name="description" content="[^"]*Costory/);
  for (const record of records) {
    assert.ok(feature.includes(`href="../${project.repo}/${record.slug}/"`), record.name);
    const listing = read(`docs/directory/${project.repo}/${record.slug}/index.html`);
    const installation = listing.split('id="install-title"')[1].split('</section>')[0];
    assert.match(installation, /href="https:\/\/docs\.costory\.io\/features\/mcp"/);
    assert.match(installation, /browser OAuth/);
    assert.match(installation, /Costory workspace with billing data connected/);
    assert.ok(installation.indexOf('docs.costory.io/features/mcp') < installation.indexOf('id="install-cli"'));
    const report = JSON.parse(read(`docs/directory/${project.repo}/${record.slug}/report.json`));
    assert.equal(report.quality.score, expected[record.name]);
    assert.deepEqual(report.supplementary_citations, evidence);
    assert.deepEqual(report.badges.map((badge) => badge.kind), ['score', 'grade']);
    assert.ok(listing.includes(`https://github.com/${evidence[0].source}/blob/${evidence[0].commit}/${evidence[0].path}`));
    assert.match(read(`docs/directory/${project.repo}/${record.slug}/badge.svg`), /Suede Skill Check: Grade B/);
  }
});
