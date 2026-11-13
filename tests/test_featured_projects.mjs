import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { qualityScore, shieldSvg } from '../scripts/directory/badges.mjs';
import * as featured from '../scripts/directory/featured.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const data = JSON.parse(read('directory/featured-projects.json'));
const published = () => read('docs/directory/featured/index.html');
const recentIds = ['deed-page', 'resume-tribunal', 'siebly-crypto-exchange-api', 'tecadrise-bot', 'govisit', 'datacircle', 'resume-claim-guard', 'socratic-story-cartographer', 'agentswarm-work', 'cloudgpu', 'poptin-email-marketing', 'shiptopaid-lite', 'video-director', 'agent-qa', 'berlin-job-search', 'bulkpublish', 'empacer', 'frametell', 'inkroom', 'lfr', 'trong-hieu', 'geekflare', 'cisco-skill-scanner', 'opsibyte', 'extra-caffeine', 'costory', 'appie', 'coalwash', 'lava', 'arcmira'];
const pendingIds = ['berlin-job-search', 'bulkpublish', 'empacer', 'inkroom', 'lfr'];
const reviewedIds = recentIds.filter((id) => !pendingIds.includes(id) && data.projects.some((p) => p.id === id));
const cardOf = (html, id) => html.split(`id="${id}"`)[1]?.split('</article>')[0];
const articleIds = (html) => [...html.matchAll(/<article class="featured-project[^"]*" id="([^"]+)"/g)].map((m) => m[1]);

test('featured sorting uses publication timestamps descending without mutating source order', () => {
  assert.equal(typeof featured.newestPublishedFirst, 'function');
  const entries = Object.freeze([
    Object.freeze({ id: 'alpha', published_at: '2026-10-18T04:48:30Z' }),
    Object.freeze({ id: 'zulu', published_at: '2026-10-31T00:34:27Z' }),
    Object.freeze({ id: 'middle', published_at: '2026-10-31T00:34:26Z' }),
  ]);
  assert.deepEqual(featured.newestPublishedFirst(entries).map((p) => p.id), ['zulu', 'middle', 'alpha']);
  assert.deepEqual(entries.map((p) => p.id), ['alpha', 'zulu', 'middle']);
});

test('featured sorting breaks equal dates by stable ID independent of input order or display name', () => {
  assert.equal(typeof featured.newestPublishedFirst, 'function');
  const entries = [
    { id: 'beta', name: 'A', published_at: '2026-10-18T04:48:30Z' },
    { id: 'alpha', name: 'Z', published_at: '2026-10-18T04:48:30Z' },
  ];
  for (const input of [entries, [...entries].reverse()]) {
    assert.deepEqual(featured.newestPublishedFirst(input).map((p) => p.id), ['alpha', 'beta']);
  }
});

test('missing and invalid publication dates sort last without inferred chronology', () => {
  assert.equal(typeof featured.newestPublishedFirst, 'function');
  const entries = [undefined, null, '', 'yesterday', '2026-02-30T00:00:00Z', '2026-10-31', '2026-10-31T12:00:00', 1793404800000]
    .map((published_at, i) => ({ id: `unknown-${i}`, published_at, updated: '2099-01-01', commit_date: '2099-01-01', review: 'directory/reviews/2099-01-01-example.md' }));
  entries.push({ id: 'dated', published_at: '1960-01-01T00:00:00Z' });
  const expected = ['dated', 'unknown-0', 'unknown-1', 'unknown-2', 'unknown-3', 'unknown-4', 'unknown-5', 'unknown-6', 'unknown-7'];
  assert.deepEqual(featured.newestPublishedFirst(entries.reverse()).map((p) => p.id), expected);
  assert.deepEqual(featured.newestPublishedFirst([]), []);
});

test('featured cards, navigation, numbering, badge snippets and structured data share publication order', () => {
  const page = published();
  assert.deepEqual(articleIds(page), recentIds);
  const nav = page.match(/<nav class="featured-jump"[^>]*>([\s\S]*?)<\/nav>/)[1];
  assert.deepEqual([...nav.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]), recentIds);
  assert.deepEqual([...page.matchAll(/class="featured-number"[^>]*>(\d+)</g)].map((m) => Number(m[1])), recentIds.map((_, i) => i + 1));
  assert.deepEqual([...page.matchAll(/<code id="featured-badge-([^"]+)"/g)].map((m) => m[1]), reviewedIds);
  assert.deepEqual([...page.matchAll(/data-featured-badge-pending="([^"]+)"/g)].map((m) => m[1]), pendingIds);
  const collection = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).find((x) => x['@type'] === 'CollectionPage');
  assert.deepEqual(collection.mainEntity.itemListElement.map((p) => new URL(p.url).hash.slice(1)), recentIds);
});

test('a newly published project comes first across regeneration and shuffled source order', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'featured-recency-'));
  try {
    for (const dir of ['scripts', 'directory', 'docs']) fs.cpSync(path.join(root, dir), path.join(fixture, dir), { recursive: true });
    const editorial = structuredClone(data);
    editorial.projects.push({ ...editorial.projects.find((p) => p.id === 'coalwash'), id: 'z-new-feature', name: 'Z New Feature', repo: 'example/new-feature', published_at: '2098-11-03T12:00:00Z' });
    const metadata = path.join(fixture, 'directory/featured-projects.json');
    const output = path.join(fixture, 'docs/directory/featured/index.html');
    const build = () => execFileSync(process.execPath, [path.join(fixture, 'scripts/build-directory.mjs')], { stdio: 'pipe' });
    fs.writeFileSync(metadata, JSON.stringify(editorial));
    build();
    const first = fs.readFileSync(output, 'utf8');
    assert.deepEqual(articleIds(first), ['z-new-feature', ...recentIds]);
    editorial.projects.reverse(); editorial.members.reverse();
    fs.writeFileSync(metadata, JSON.stringify(editorial));
    fs.utimesSync(metadata, new Date('2099-01-01'), new Date('2099-01-01'));
    build();
    assert.equal(fs.readFileSync(output, 'utf8'), first, 'regeneration and input order cannot change the Featured default');
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('Geekflare has one pinned 80/B listing, an editorial feature and accurate service disclosures', () => {
  const repo = 'geekflare/geekflare-skills';
  const revision = 'b2429403c4b7e4f8f2a55773b161ef19643cd12b';
  const catalog = JSON.parse(read('directory/skills.json'));
  const inclusions = JSON.parse(read('directory/inclusions.json'));
  const project = data.projects.find((p) => p.id === 'geekflare');
  assert.ok(project);
  assert.equal(project.commit, revision);
  assert.deepEqual(project.skills.map((s) => s.id), ['geekflare']);
  assert.deepEqual(inclusions.skills[repo], ['geekflare']);
  assert.deepEqual(inclusions.skill_roots[repo], ['skills/geekflare']);
  const records = catalog.skills.filter((s) => s.repo === repo);
  assert.equal(records.length, 1);
  const [record] = records;
  assert.equal(record.dir, 'skills/geekflare');
  assert.equal(record.score, 80);
  assert.equal(record.grade, 'B');
  assert.equal(record.score, qualityScore(record, catalog.repos[repo], '2026-10-30'));
  assert.equal(record.license, 'MIT');
  assert.equal(record.checks, '11111111');
  assert.equal(record.security_scan_status, 'not_scanned');
  assert.equal(catalog.repos[repo].commit_sha, revision);
  assert.equal(catalog.repos[repo].scoped_install, true);
  assert.deepEqual(catalog.repos[repo].lists, []);
  const folder = `docs/directory/${repo}/geekflare/`;
  const listing = read(folder + 'index.html');
  const report = JSON.parse(read(folder + 'report.json'));
  assert.equal(report.source.revision, revision);
  assert.equal(report.quality.score, 80);
  assert.deepEqual(report.badges.map((b) => b.kind), ['score', 'grade']);
  assert.equal(read(folder + 'badge.svg'), shieldSvg(80, 'grade'));
  assert.equal(read(folder + 'score.svg'), shieldSvg(80, 'score'));
  const page = published();
  const card = page.split('id="geekflare"')[1]?.split('</article>')[0];
  assert.ok(card.includes('href="../geekflare/geekflare-skills/geekflare/"'));
  for (const surface of [listing, card]) {
    for (const fact of ['GEEKFLARE_API_KEY', 'account credits', 'URL path', 'unpinned', 'CAPTCHA', 'proxyCountry', 'unspecified', 'were not tested']) assert.ok(surface.includes(fact), fact);
    assert.doesNotMatch(surface, /security certified|security-scan-passed/i);
  }
  assert.ok(listing.includes('npx skills add https://github.com/geekflare/geekflare-skills/tree/main/skills/geekflare</code>'));
  assert.match(page, /featured-badge-geekflare/);
  assert.ok(!Object.keys(JSON.parse(read('directory/promotion.json')).verifications).some((id) => id.startsWith(repo + '/')));
});

test('Geekflare evidence keeps all findings, complete skill coverage and incomplete packaging coverage', () => {
  const prefix = 'directory/reviews/2026-10-30-geekflare';
  for (const [file, digest] of Object.entries(JSON.parse(read(`${prefix}/SHA256.json`)))) {
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, prefix, file))).digest('hex'), digest, file);
  }
  const quality = JSON.parse(read(`${prefix}/quality.json`));
  assert.equal(quality.python_score, 80);
  assert.equal(quality.javascript_score, 80);
  assert.equal(quality.javascript_points.adoption, 0);
  const scan = JSON.parse(read(`${prefix}/security-skill.json`));
  assert.equal(scan.coverage.complete, true);
  assert.equal(scan.coverage.files.length, 2);
  assert.deepEqual(scan.coverage.skipped, []);
  assert.deepEqual(scan.analysis.analyzers_failed, []);
  assert.deepEqual(scan.analysis.findings.map((f) => [f.rule_id, f.severity]), [['MANIFEST_MISSING_LICENSE', 'INFO']]);
  const outcomes = JSON.parse(read(`${prefix}/security-summary.json`));
  assert.equal(outcomes.skill.status, 'findings');
  assert.equal(outcomes.packaging.status, 'error');
  assert.equal(outcomes.packaging.reason, 'incomplete_file_coverage');
  assert.deepEqual(outcomes.packaging.skipped, [{ path: '.gitignore', reason: 'extensionless_source_coverage' }]);
  assert.equal(outcomes.clean.status, 'passed');
  assert.equal(outcomes.exfil.status, 'failed');
});

test('single root SKILL.md membership links the exact file and rejects broader scopes', () => {
  const sample = structuredClone(data);
  sample.members = [{ ...sample.members[0], scope: 'SKILL.md', skills: [{ id: 'lava-news-heat', title: 'Lava', description: 'News-flow heat.' }] }];
  const member = featured.directoryMembers(sample)[0];
  const html = featured.directoryMembersHtml([member], { esc: (s) => s });
  assert.ok(html.includes(`/blob/${member.commit}/SKILL.md`));
  assert.ok(!html.includes('SKILL.md/lava-news-heat'));
  assert.ok(!html.includes(`/tree/${member.commit}/SKILL.md`));
  sample.members[0].skills.push({ id: 'other', title: 'Other', description: 'Unrequested.' });
  assert.throws(() => featured.directoryMembers(sample), /member/i);
});

const arcmiraLinks = [
  { label: 'Website', url: 'https://arcmira.com' },
  { label: 'MCP setup', url: 'https://arcmira.com/docs/mcp-server' },
  { label: 'API docs', url: 'https://arcmira.com/docs' },
];

test('Arcmira member resources render only the three approved informational links', () => {
  const member = data.members.find((m) => m.id === 'arcmira');
  assert.deepEqual(member.links, arcmiraLinks);
  const card = published().split('id="arcmira"')[1].split('</article>')[0];
  const awesome = read('awesome/featured.md').split('## Directory members')[1];
  for (const { label, url } of arcmiraLinks) {
    assert.ok(card.includes(`<a href="${url}" rel="noopener noreferrer">${label} ↗</a>`));
    assert.ok(awesome.includes(`[${label}](${url})`));
  }
  assert.doesNotMatch(card, /<(?:script|iframe|object|embed|img)\b|\son\w+=/i);
});

test('member resource URLs and labels are allowlisted and cannot carry extra behavior', () => {
  const withLinks = structuredClone(data);
  withLinks.members[0].links = arcmiraLinks;
  assert.doesNotThrow(() => featured.directoryMembers(withLinks));
  const withoutLinks = structuredClone(withLinks);
  delete withoutLinks.members[0].links;
  assert.doesNotThrow(() => featured.directoryMembers(withoutLinks));
  for (const links of [
    null, {},
    ...['http://arcmira.com', 'javascript:alert(1)', '//arcmira.com', 'https://arcmira.com.evil.example', 'https://arcmira.com@evil.example', 'https://arcmira.com/docs?redirect=https://evil.example', 'https://arcmira.com/docs/../account', 'https://arcmira.com/#x'].map((url) => [{ label: 'Website', url }]),
    [{ label: '<img src=x onerror=alert(1)>', url: 'https://arcmira.com' }],
    [{ ...arcmiraLinks[0], onclick: 'alert(1)' }],
    [arcmiraLinks[0], arcmiraLinks[0]],
  ]) {
    const invalid = structuredClone(withLinks);
    invalid.members[0].links = links;
    assert.throws(() => featured.directoryMembers(invalid), /member/i);
  }
});

test('Arcmira membership links only six pinned plugin skills and carries no certification', () => {
  const members = featured.directoryMembers(data);
  assert.deepEqual(members.map((m) => m.repo), ['arcmira/mcp', 'dustinliang666-blip/lava-mcp']);
  const member = members.find((m) => m.id === 'arcmira');
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
  assert.ok(collection.mainEntity.itemListElement.some((item) => item.url === 'https://skills.suedeai.ai/directory/featured/#arcmira'));
});

test('Lava membership admits only its pinned Chinese root skill with accurate setup', () => {
  const member = featured.directoryMembers(data).find((m) => m.id === 'lava');
  assert.equal(member.scope, 'SKILL.md');
  assert.equal(member.commit, 'f9369732c3956024666c80835b72dc7d22df5a43');
  assert.deepEqual(member.skills.map((s) => s.id), ['lava-news-heat']);
  const skillUrl = `https://github.com/${member.repo}/blob/${member.commit}/SKILL.md`;
  const card = published().split('id="lava"')[1]?.split('</article>')[0];
  assert.ok(card.includes(`href="${skillUrl}"`));
  assert.ok(read('awesome/featured.md').includes(`](${skillUrl})`));
  for (const fact of ['original Chinese', 'API key', 'metered', 'runtime have not been tested', 'Suede Directory Member']) assert.ok(card.includes(fact), fact);
  assert.doesNotMatch(card, /certified|verified|score\.svg|badge\.svg|subscribe\/v1\/skill|npx skills add|git clone/i);
  assert.ok(!JSON.parse(read('directory/skills.json')).skills.some((s) => s.repo === member.repo));
  assert.ok(!JSON.stringify(JSON.parse(read('directory/promotion.json'))).includes(member.repo));
  assert.ok(!data.projects.some((p) => p.repo === member.repo));
  const quality = JSON.parse(read('directory/reviews/2026-10-28-lava/quality.json'));
  assert.equal(quality.python_score, 51);
  assert.equal(quality.javascript_score, 51);
  assert.equal(quality.grade, 'D');
  assert.equal(quality.structurally_eligible, false);
  const invalid = structuredClone(data);
  invalid.members.find((m) => m.id === 'lava').links.push({ label: 'Hosted skill', url: 'https://lava.ai-dolphin.com/subscribe/v1/skill' });
  assert.throws(() => featured.directoryMembers(invalid), /member/i);
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
  assert.deepEqual(data.projects.map((p) => p.repo), ['appierun/appie-mcp', 'TheColliery/CoalWash', 'costory-io/costory-finops-mcp-skills', 'cwong5/extra-caffeine-mcp', 'MelMayssonOwen/agent-skills', 'cisco-ai-defense/skill-scanner', 'geekflare/geekflare-skills', 'tronghieu/agent-skills', 'vostride/agent-qa', 'sitor-ai/frametell', 'azeemkafridi/bulkpublish-ai-toolkit', 'InkRoom-AI/inkroom-client', undefined, 'umutyesildal/berlin-job-search', 'Anonyfox/lfr', 'shiptopaid/shiptopaid-lite', 'aakashH242/video-director', 'email-marketing-skills-hub/email-marketing-skills', 'mrhy7176/cloudgpu-agent-skills', 'andrewsiah/agentswarm-work-skill', 'waynehamadi/datacircle', 'korey2028-prog/resume-claim-guard', 'OakcoderX/awesome-agent-skills', 'inhotel-io/govisit-toolkit', 'mohiddin7/resume-tribunal', 'sieblyio/agent-skills', 'f-o-x11/deed-page-skill', 'tecadrise-ai/TecAdRiseBot']);
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
  for (const project of data.projects.filter((p) => p.status !== 'pending')) {
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
  assert.match(page, /rel="canonical" href="https:\/\/suedeai\.directory\/featured\/"/);
  assert.equal((page.match(/<h1[ >]/g) || []).length, 1);
  const blocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const collection = blocks.find((x) => x['@type'] === 'CollectionPage');
  assert.equal(collection.mainEntity.numberOfItems, 30);
  assert.deepEqual(collection.mainEntity.itemListElement.map((p) => p.name), ['deed.page', 'Resume Tribunal', 'Siebly Crypto Exchange API', 'TecAdRise Bot', 'GoVisit Agent Skills', 'Datacircle', 'Resume Claim Guard', 'Socratic Story Cartographer', 'agentswarm-work', 'CloudGPU', 'Email Marketing Skills by Poptin', 'ShipToPaid Lite', 'Video Director', 'agent-qa CLI by Vostride', 'Berlin Job Search', 'BulkPublish', 'Empacer', 'Frametell', 'InkRoom', 'lfr', 'Trong Hieu agent skills', 'Geekflare', 'Cisco AI Defense Skill Scanner', 'Opsibyte', 'Extra Caffeine', 'Costory', 'Appie', 'CoalWash', 'Lava', 'Arcmira']);
  const description = page.match(/<meta name="description" content="([^"]*)"/)[1];
  assert.ok(description.length >= 70 && description.length <= 155, description);
  assert.match(description, /^Meet deed\.page, .* and \d+ more: featured agent projects with source and setup\.$/);
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
  assert.ok(page.includes('<a href="#costory">Costory <span aria-hidden="true">↓</span></a>'), 'Costory in featured navigation');
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

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const renderOptions = { esc, rel: (_from, to) => `../${to.replace(/^directory\//, '')}`, here: 'directory/featured/', slugify: (s) => s.toLowerCase() };
const pendingSample = {
  id: 'sample-pending', status: 'pending', published_at: '2026-11-02T00:00:00Z', name: 'Sample', repo: 'example/sample', commit: 'a'.repeat(40), license: 'MIT',
  kind: 'One skill', headline: 'Do the work.', summary: 'Sample summary.', setup: 'Sample setup.', capabilities: [{ title: 'Work', description: 'Does the work.' }],
};

test('pending entries render the scan and review label in place of the review link', () => {
  const reviewed = { ...pendingSample, id: 'sample-reviewed', status: undefined, review: 'directory/reviews/2026-11-02-sample.md' };
  const html = featured.featuredProjectsHtml([pendingSample, reviewed], renderOptions);
  const pending = cardOf(html, 'sample-pending');
  assert.match(pending, /<span class="featured-status" data-featured-status="pending">Scan &amp; review pending<\/span>/);
  assert.match(html, /<article class="featured-project" id="sample-pending" data-featured-status="pending"/);
  assert.doesNotMatch(pending, /intake review|Reviewed source|directory\/reviews|undefined/);
  assert.ok(pending.includes(`https://github.com/example/sample/tree/${'a'.repeat(40)}">Source at <code>aaaaaaa</code>`));
  const done = cardOf(html, 'sample-reviewed');
  assert.ok(done.includes('Read the intake review ↗') && done.includes('Reviewed source <code>'));
  assert.doesNotMatch(done, /featured-status|Scan &amp; review pending/);
  const hosted = { ...pendingSample, id: 'sample-hosted', repo: undefined, commit: undefined, license: undefined, site: 'https://example.com' };
  const site = cardOf(featured.featuredProjectsHtml([hosted], renderOptions), 'sample-hosted');
  assert.ok(site.includes('<a href="https://example.com" rel="noopener noreferrer">Visit Sample ↗</a>'));
  assert.match(site, /Scan &amp; review pending/);
  assert.doesNotMatch(site, /github\.com|featured-license|undefined/);
  assert.equal(featured.PENDING_LABEL, 'Scan & review pending');
});

test('pending status is an explicit, bounded schema addition', () => {
  assert.equal(featured.featuredProjects(data), data.projects);
  const withEntry = (entry) => ({ ...structuredClone(data), projects: [...structuredClone(data.projects), entry] });
  assert.doesNotThrow(() => featured.featuredProjects(withEntry(pendingSample)));
  assert.doesNotThrow(() => featured.featuredProjects(withEntry({ ...pendingSample, repo: undefined, commit: undefined, site: 'https://example.com' })));
  for (const patch of [
    { status: 'review-pending' }, { status: 'live' }, { status: true },
    { review: 'directory/reviews/2026-11-02-sample.md' }, { score: 90 }, { grade: 'A' }, { verdict: 'accepted' }, { certified: true }, { verified: true },
    { skills: [{ id: 'sample', title: 'Sample', description: 'Sample.' }] }, { commands: ['npx sample'] },
    { repo: undefined, commit: undefined }, { commit: 'main' }, { repo: '../escape', commit: 'a'.repeat(40) },
    { repo: undefined, commit: undefined, site: 'http://example.com' }, { repo: undefined, commit: undefined, site: 'javascript:alert(1)' }, { repo: undefined, commit: undefined, site: 'https://example.com/?ref=x' },
    { capabilities: [] }, { headline: '' }, { id: 'geekflare' },
  ]) {
    assert.throws(() => featured.featuredProjects(withEntry({ ...pendingSample, ...patch })), /featured project/i, JSON.stringify(patch));
  }
  const unreviewed = structuredClone(data);
  delete unreviewed.projects.find((p) => p.id === 'geekflare').review;
  assert.throws(() => featured.featuredProjects(unreviewed), /featured project: geekflare/);
});

test('published pending features show the label, no badge snippet and no score or verdict', () => {
  const page = published();
  const pending = data.projects.filter((p) => p.status === 'pending');
  assert.deepEqual(pending.map((p) => p.id).sort(), [...pendingIds].sort());
  const panel = page.match(/<section class="panel badge-panel"[\s\S]*?<\/section>/)[0];
  for (const project of pending) {
    const card = cardOf(page, project.id);
    assert.ok(card, project.id);
    assert.equal((card.match(/Scan &amp; review pending/g) || []).length, 1, project.id);
    assert.doesNotMatch(card, /Read the intake review|Reviewed source|directory\/reviews\/|class="grade|score\.svg|badge\.svg|\/100|certified|verified/i, project.id);
    assert.ok(!panel.includes(`featured-badge-${project.id}`), `${project.id}: no badge snippet`);
    assert.ok(!page.includes(`featured/#${project.id})`), `${project.id}: no badge Markdown`);
    assert.match(panel, new RegExp(`data-featured-badge-pending="${project.id}"><strong>[^<]+</strong> <span class="featured-status" data-featured-status="pending">Scan &amp; review pending</span>`));
    if (project.repo) assert.ok(card.includes(`https://github.com/${project.repo}/tree/${project.commit}">Source at <code>${project.commit.slice(0, 7)}</code>`), project.id);
  }
  for (const id of reviewedIds) {
    assert.ok(panel.includes(`<code id="featured-badge-${id}">`), id);
    assert.doesNotMatch(cardOf(page, id), /Scan &amp; review pending/, id);
  }
  const empacer = cardOf(page, 'empacer');
  assert.ok(empacer.includes('<a href="https://empacer.com" rel="noopener noreferrer">Visit Empacer ↗</a>'));
  assert.doesNotMatch(empacer, /github\.com|Product Hunt|#1/);
  const strip = read('docs/directory/index.html').match(/<section class="panel" aria-labelledby="featured-strip-title">[\s\S]*?<\/section>/)[0];
  const stripIds = [...strip.matchAll(/href="featured\/#([a-z0-9-]+)"/g)].map((m) => m[1]);
  assert.equal(stripIds.length, 3);
  for (const id of stripIds) assert.notEqual(data.projects.find((p) => p.id === id)?.status, 'pending', id);
  const awesome = read('awesome/featured.md');
  for (const project of pending) {
    const section = awesome.split(`<a id="${project.id}"></a>`)[1].split('\n---\n')[0];
    assert.match(section, /\*\*Scan &amp; review pending\*\*/);
    assert.doesNotMatch(section, /Intake review|Reviewed source/);
  }
  for (const project of data.projects.filter((p) => ['trong-hieu', 'agent-qa', 'frametell', 'bulkpublish', 'inkroom', 'empacer', 'berlin-job-search', 'lfr'].includes(p.id))) assert.equal(project.published_at, '2026-11-02T00:00:00Z', project.id);
  assert.doesNotMatch(read('directory/featured-projects.json'), /—/);
});

test('Trong Hieu features exactly thirteen cleared skills scoring 80 or more with resolvable listings', () => {
  const accepted = ['brainstorm-coach', 'critical-thinking', 'cv-scorer', 'data-scientist', 'design-thinking', 'fiction-studio', 'market-researcher', 'problem-solver', 'product-manager', 'project-manager', 'scrum-master', 'socratic-questor', 'strategy-board'];
  const project = data.projects.find((p) => p.id === 'trong-hieu');
  assert.equal(project.repo, 'tronghieu/agent-skills');
  assert.equal(project.commit, '831d1ae5c686a81b10f9c5b9cca04a7b8b97303d');
  assert.equal(project.license, 'MIT');
  assert.equal(project.status, undefined);
  assert.deepEqual(project.skills.map((s) => s.id), accepted);
  const catalog = JSON.parse(read('directory/skills.json'));
  const records = catalog.skills.filter((s) => s.repo === project.repo);
  assert.equal(records.length, 19, 'the other six skills stay listed');
  for (const id of accepted) {
    const record = records.find((s) => s.slug === id);
    assert.ok(record.score >= 80 && record.checks === '11111111', id);
  }
  const card = cardOf(published(), 'trong-hieu');
  const hrefs = [...card.matchAll(/<li><a href="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(hrefs.length, accepted.length);
  for (const [i, href] of hrefs.entries()) {
    const record = records.find((s) => s.slug === accepted[i]);
    const [target, anchor] = href.split('#');
    assert.ok(fs.existsSync(path.resolve(root, 'docs/directory/featured', target, 'index.html')), href);
    const fullPages = JSON.parse(read('directory/growth/full-pages.json')).skills;
    if (record.featured || fullPages.includes(`${record.repo}/${record.slug}`.toLowerCase())) assert.equal(href, `../tronghieu/agent-skills/${record.slug}/`);
    else assert.ok(read(path.relative(root, path.resolve(root, 'docs/directory/featured', target, 'index.html'))).includes(`id="${anchor}"`), href);
  }
  for (const held of records.filter((s) => !accepted.includes(s.slug))) assert.ok(!card.includes(held.slug), held.slug);
  assert.ok(published().includes('<code id="featured-badge-trong-hieu">'));
  const review = read(project.review);
  for (const fact of ['831d1ae5c686a81b10f9c5b9cca04a7b8b97303d', '25 raw warnings', '13 absent license fields', '12 descriptions over 512 characters', '1,024', 'ZIP packages excluded', 'root MIT license']) assert.ok(review.includes(fact), fact);
});

test('agent-qa and Frametell carry exact license facts, reviews and badge snippets', () => {
  const page = published();
  const qa = data.projects.find((p) => p.id === 'agent-qa');
  assert.equal(qa.license, 'FSL-1.1-ALv2');
  assert.equal(qa.commit, '2b848e3f094c3c81a9004eb63c236c32adc55da6');
  const discovery = JSON.parse(read('directory/agents/ungraded.json')).entries.find((e) => e.id === 'agent-qa');
  assert.equal(discovery.repositoryUrl, 'https://github.com/vostride/agent-qa');
  const frametell = data.projects.find((p) => p.id === 'frametell');
  assert.equal(frametell.commit, '63d598fa9aed1e6fe0cf8ef37a32a5a8eb437e74');
  assert.match(frametell.license, /^AGPL-3\.0/);
  for (const project of [qa, frametell]) {
    const card = cardOf(page, project.id);
    assert.ok(fs.existsSync(path.join(root, project.review)), project.review);
    assert.ok(card.includes(`<span class="featured-license">${esc(project.license)}</span>`));
    assert.ok(card.includes('Read the intake review ↗'));
    assert.ok(page.includes(`<code id="featured-badge-${project.id}">`));
    assert.doesNotMatch(card, /open[- ]source/i);
  }
  for (const fact of ['FSL-1.1-ALv2', 'Node.js 24']) assert.ok(cardOf(page, 'agent-qa').includes(fact), fact);
  for (const fact of ['Apple Silicon', 'ElevenLabs', '1080p', 'AGPL-3.0']) assert.ok(cardOf(page, 'frametell').includes(fact), fact);
});


test('November applicants have pinned editorial features without invented scores or promotion verification', () => {
  const expected = {
    'shiptopaid-lite': ['shiptopaid/shiptopaid-lite', 'b508f878086491518709a2d17761821abfd4b084'],
    'video-director': ['aakashH242/video-director', '1d0ed60aa9bfffa36302d9042a87a2b1fcb8aeeb'],
    'poptin-email-marketing': ['email-marketing-skills-hub/email-marketing-skills', '13ea992854c4b3cbd93d2a427b391161be23b033'],
  };
  for (const [id, [repo, commit]] of Object.entries(expected)) {
    const project = data.projects.find((p) => p.id === id);
    assert.ok(project, id);
    assert.equal(project.repo, repo);
    assert.equal(project.commit, commit);
    assert.ok(project.capabilities.length >= 3);
    assert.equal(project.status, undefined);
    for (const key of ['score', 'grade', 'skills', 'certified', 'verified']) assert.ok(!(key in project), `${id}: ${key}`);
    const review = read(project.review);
    assert.ok(review.includes(commit));
    assert.match(review, /not (?:a )?security certification/i);
    const card = cardOf(published(), id);
    assert.ok(card.includes(commit));
    assert.ok(card.includes(project.review));
    assert.ok(published().includes(`featured-badge-${id}`));
    assert.ok(!Object.keys(JSON.parse(read('directory/promotion.json')).verifications).some((key) => key.startsWith(repo + '/')));
  }
  assert.match(data.projects.find((p) => p.id === 'video-director').setup, /22\.20\+/);
  assert.match(data.projects.find((p) => p.id === 'video-director').setup, /media.*separate/i);
  assert.match(data.projects.find((p) => p.id === 'poptin-email-marketing').setup, /consent/i);
  assert.match(data.projects.find((p) => p.id === 'shiptopaid-lite').setup, /sandbox/i);
});


test('November 9 editorial features preserve authentic scores and pending catalog scope', () => {
  const intake = JSON.parse(read('directory/intake/2026-11-09-cloudgpu-agentswarm.json'));
  const inclusions = JSON.parse(read('directory/inclusions.json'));
  const catalog = JSON.parse(read('directory/skills.json'));
  assert.equal(intake.repositories.length, 2);
  for (const [repo, score, count] of [['mrhy7176/cloudgpu-agent-skills', 77, 5], ['andrewsiah/agentswarm-work-skill', 79, 1]]) {
    const record = intake.repositories.find((r) => r.repo === repo);
    assert.equal(record.skills.length, count);
    assert.equal(record.security_scan_status, 'not_scanned');
    assert.ok(record.skills.every((s) => s.score === score && s.grade === 'C'));
    assert.deepEqual([...inclusions.skills[repo]].sort(), record.skills.map((s) => s.name).sort());
    assert.equal(catalog.skills.filter((s) => s.repo === repo).length, 0);
    const project = data.projects.find((p) => p.repo === repo);
    assert.equal(project.commit, record.commit);
    assert.ok(project.capabilities.length === count);
    assert.match(project.setup, /pending the next regular scored-catalog refresh/);
    assert.match(read(project.review), new RegExp(score + ', grade C'));
    assert.ok(published().includes('featured-badge-' + project.id));
  }
});

test('November 10 editorial exceptions use neutral badges and preserve source assessment', () => {
  const intake = JSON.parse(read('directory/intake/2026-11-10-three-applicants.json'));
  const inclusions = JSON.parse(read('directory/inclusions.json'));
  for (const [id, repo, score, grade] of [
    ['datacircle', 'waynehamadi/datacircle', 63, 'D'],
    ['resume-claim-guard', 'korey2028-prog/resume-claim-guard', 72, 'C'],
    ['socratic-story-cartographer', 'OakcoderX/awesome-agent-skills', 72, 'C'],
  ]) {
    const project = data.projects.find((p) => p.id === id);
    assert.ok(project, id);
    const record = intake.repositories.find((r) => r.repo === repo);
    assert.equal(project.repo, repo);
    assert.equal(project.commit, record.commit);
    assert.equal(record.score, score);
    assert.equal(record.grade, grade);
    assert.equal(record.security_scan_status, 'not_scanned');
    for (const key of ['score', 'grade', 'verified', 'certified', 'skills']) assert.ok(!(key in project));
    assert.match(read(project.review), /owner-selected editorial feature/i);
    assert.match(read(project.review), /neutral Featured badge/i);
    assert.ok(cardOf(published(), id).includes(project.review));
    assert.ok(published().includes(`featured-badge-${id}`));
    assert.match(project.workflow_url, new RegExp(record.commit));
  }
  assert.deepEqual(inclusions.skills['waynehamadi/datacircle'], ['datacircle']);
  assert.deepEqual(inclusions.skills['OakcoderX/awesome-agent-skills'], ['socratic-story-cartographer']);
  assert.ok(inclusions.repositories.includes('korey2028-prog/resume-claim-guard'));
  assert.deepEqual(inclusions.skills['korey2028-prog/resume-claim-guard'], ['resume-claim-guard']);
  assert.deepEqual(inclusions.skill_paths['korey2028-prog/resume-claim-guard'], ['.']);
  assert.deepEqual(inclusions.language_exceptions['korey2028-prog/resume-claim-guard'], [{ name: 'resume-claim-guard', path: '.', approval: 'https://github.com/JasonColapietro/suede-creator-skills/issues/374#issuecomment-6779995466' }]);
  const resume = data.projects.find((p) => p.id === 'resume-claim-guard');
  assert.match(resume.setup, /written in Chinese/);
  assert.match(resume.setup, /accepted for the next regular scored-catalog refresh/i);
  assert.doesNotMatch(resume.setup, /awaits.*English|translation is required/i);
  const record = intake.repositories.find((r) => r.repo === resume.repo);
  assert.equal(record.catalog_disposition, 'accepted_next_regular_refresh');
  assert.equal(record.english_description_policy_pass, false);
  assert.match(read(resume.review), /Translation is not a condition/i);
  assert.doesNotMatch(read(resume.review), /does not waive|mainly English.*requirement/i);
});
