import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { load } from 'js-yaml';
import { qualityScore } from '../scripts/directory/badges.mjs';

const root = process.env.SUEDE_TEST_REPO_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const repo = 'JasonColapietro/suede-creator-skills';
const datasetText = read('directory/skills.json');
const data = JSON.parse(datasetText);
const receiptText = read('directory/intake/2026-10-31-interface-quality.json');
const receipt = JSON.parse(receiptText);
const updatePath = 'directory/intake/first-party-listing-updates.json';
const updates = fs.existsSync(path.join(root, updatePath)) ? JSON.parse(read(updatePath)) : [];
const updated = new Map(updates.map(update => [update.listing.slug, update]));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (args) => {
  try {
    return execFileSync('git', args, { cwd: root, maxBuffer: 8 * 1024 * 1024, env: { ...process.env, GIT_NO_LAZY_FETCH: '1' } });
  } catch (error) {
    throw new Error('Scoped review requires its pinned source objects locally. In a shallow clone, fetch the reviewed commit and its tree before testing.', { cause: error });
  }
};
const reportFor = slug => JSON.parse(read(`docs/directory/jasoncolapietro/suede-creator-skills/${slug}/report.json`));
const effective = skill => updated.get(skill.slug)?.listing || skill;
const active = fs.readdirSync(path.join(root, 'skills')).filter(name => fs.existsSync(path.join(root, 'skills', name, 'SKILL.md'))).sort();
const own = data.skills.filter(s => s.repo === repo);

test('every maintained first-party package has an actual directory score above 90', () => {
  assert.deepEqual(own.map(s => s.name).sort(), active, 'first-party listing inventory must match the maintained source distribution');
  for (const baseline of own) {
    const skill = effective(baseline);
    assert.equal(skill.score, qualityScore(skill, data.repos[repo], data.generated), skill.name);
    assert.ok(skill.score >= 91, `${skill.name}: ${skill.score}`);
    assert.equal(skill.grade, 'A');
    assert.equal(skill.checks, '11111111', skill.name);
    if (skill.slug === 'suede-graph-flo-xr' && updated.has(skill.slug)) {
      assert.equal(skill.display_name, 'Suede Graph Flo XR');
    } else {
      assert.match(skill.display_name, /^Suede(?! AI\b| Labs\b)(?: .+)? Skills$/);
    }
  }
});

test('first-party reports and retained source inventories describe the exact reviewed source', () => {
  assert.ok(own.length > 0, 'first-party reports require actual listings');
  // This is dated evidence, not a manifest that gets rehashed against HEAD.
  // Its detached source commit may not be retained in ordinary CI checkouts.
  assert.equal(sha256(receiptText), '6083c907b8c72c9f609e5938c28d7fb2672ba29d226e20a14fcd05347b18107f');
  assert.equal(receipt.source_revision, data.repos[repo].commit_sha);
  assert.equal(receipt.assessment_date, data.repos[repo].assessment_date);
  assert.equal(updated.size, updates.length, 'each accepted listing may have only one active update');
  const expected = { ...receipt.source_files };
  const covered = new Map();
  for (const update of updates) {
    const { listing, source_revision: revision, source_files: files } = update;
    const baseline = own.find(s => s.slug === listing.slug);
    assert.ok(baseline, 'a revision cannot add a listing');
    for (const field of ['repo', 'name', 'slug', 'dir', 'featured']) {
      assert.equal(listing[field], baseline[field], `listing identity/route changed: ${field}`);
    }
    assert.equal(update.previous_source_revision, receipt.source_revision);
    assert.notEqual(revision, receipt.source_revision);
    assert.equal(git(['show', '-s', '--format=%cs', revision]).toString().trim(), update.source_commit_date || update.assessment_date);
    const skillFiles = git(['ls-tree', '-r', '--name-only', '-z', revision, '--', listing.dir + '/']).toString().split('\0').filter(Boolean);
    assert.deepEqual(Object.keys(files).filter(file => file.startsWith(listing.dir + '/')).sort(), skillFiles.sort(), 'the reassessment must cover the complete pinned skill package');
    for (const [relative, digest] of Object.entries(files)) {
      assert.ok(relative.startsWith(listing.dir + '/') || (Object.hasOwn(receipt.source_files, relative) && !relative.includes('/')), `out of scope: ${relative}`);
      if (covered.has(relative)) assert.equal(digest, covered.get(relative), relative);
      covered.set(relative, digest);
      assert.equal(sha256(git(['show', `${revision}:${relative}`])), digest, `updated pinned source ${relative}`);
      expected[relative] = digest;
    }
    // These two files combine the pinned Graph work and the independent Suede
    // brand refresh. Keep both historical receipts intact; verify their merged
    // bytes separately. The remaining Graph files must be byte-exact to the pin.
    // The README also changes for presentation alone after a pin: the
    // 2026-11-26 visual refresh regenerated its artwork and skill catalog
    // from mcp/catalog.json without touching any skill package, so its bytes
    // are pinned here rather than rewriting the reviewed receipt.
    const integrated = {
      '7ed35b1c61bd86f0ec7490ff976000e9ddf7d24d': {
        'README.md': '8bd8a7e858d4737023004c4f831f14fd66ab2d9d5a37f1bc49f9dfba7702d927',
        'skills/suede-graph-flo-xr/CARD.md': 'e32ce4ae7c6f6b06c19a5dc9a1d6910a263e9234ecce6edb98b12b2f92757c3e',
      },
      '323547f6bf0253069e2a846d74d8fa07d523780e': {
        'README.md': '64b0a87ec1bb262f8a1e195e45543e20ef4eb7afc2e97cfff9288c4c86a8d32f',
      },
    }[revision] || {};
    for (const [relative, digest] of Object.entries(integrated)) {
      if (!Object.hasOwn(files, relative)) continue;
      assert.ok(receipt.source_file_refreshes?.[relative], 'branding refresh must be recorded: ' + relative);
      expected[relative] = digest;
    }
    const skillSource = read(`${listing.dir}/SKILL.md`).match(/^---\r?\n([\s\S]+?)\r?\n---(?:\r?\n|$)/);
    assert.equal(load(skillSource?.[1] || '').description, listing.description, 'use the pinned skill metadata, not an invented listing description');
  }
  // Post-pin presentation edits (2026-11-27): LICENSE names the holder as
  // Suede with unchanged MIT terms, and COPY.md corrects its skill count.
  // Their bytes are pinned here rather than rewriting the reviewed receipts.
  const postPin = {
    LICENSE: "390c500d0f8982eb7da3e40aa2c69568c633e0bf248ba2e3f00d093afd0706a1",
    "COPY.md": "6127af77b879c2badba38896b523504730f9333ced37a42ca0d2ca5f2bca2e16",
  };
  for (const [relative, digest] of Object.entries(postPin)) {
    if (Object.hasOwn(expected, relative)) expected[relative] = digest;
  }
  for (const [relative, digest] of Object.entries(expected)) {
    assert.equal(sha256(fs.readFileSync(path.join(root, relative))), digest, relative);
  }
  for (const baseline of own) {
    const skill = effective(baseline);
    const update = updated.get(skill.slug);
    const report = reportFor(skill.slug);
    const revision = update?.source_revision || receipt.source_revision;
    assert.equal(report.skill.name, skill.name);
    assert.equal(report.skill.display_name, skill.display_name);
    assert.equal(report.source.revision, revision);
    assert.equal(report.source.assessment_date, update?.assessment_date || receipt.assessment_date);
    assert.equal(report.source.previous_revision, update?.previous_source_revision);
    assert.equal(report.source.listing_update_sha256, update ? sha256(JSON.stringify(update)) : undefined);
    assert.equal(report.snapshot.dataset_sha256, sha256(datasetText));
    assert.equal(report.snapshot.id, data.snapshot_id);
    assert.equal(report.quality.score, skill.score);
    assert.ok(report.source.skill_md_url.includes(`/blob/${revision}/skills/${skill.name}/SKILL.md`));
  }
});

test('Graph Flo XR source reassessment replaces the stable catalog row without adding a listing', () => {
  const slug = 'suede-graph-flo-xr';
  const update = updated.get(slug);
  if (!update) return;
  const index = JSON.parse(read('docs/directory/search-index.json'));
  assert.equal(index.length, data.skills.length);
  const rows = index.filter(s => s.repo === repo && s.slug === slug);
  assert.equal(rows.length, 1);
  const [row] = rows;
  const href = `/directory/jasoncolapietro/suede-creator-skills/#${slug}`;
  assert.equal(row.href, href);
  assert.equal(row.full, false);
  assert.equal(row.method, data.score_method);
  assert.equal(row.score, qualityScore(update.listing, data.repos[repo], data.generated));
  const report = reportFor(slug);
  assert.equal(report.listing_url, `https://skills.suedeai.ai${href}`);
  assert.equal(report.source.branch, update.source_branch || 'main');
  assert.equal(report.source.repository_commit_date, update.source_commit_date || update.assessment_date);
  assert.equal(report.security_scan_status, 'not_scanned');
  const collection = JSON.parse(read('docs/directory/jasoncolapietro/suede-creator-skills/collection.json'));
  assert.equal(collection.listed_skill_count, own.length);
  assert.equal(collection.skills.filter(s => s.id.endsWith(`/${slug}`)).length, 1);
  assert.deepEqual(collection.skills.find(s => s.id.endsWith(`/${slug}`)).source, report.source);
});

test('the first-party collection uses its public name and useful category search terms', () => {
  const html = read('docs/directory/jasoncolapietro/suede-creator-skills/index.html');
  assert.match(html, /<h1>Suede Skills\b/);
  assert.match(html, /<title>Suede Skills:/);
  const keywords = html.match(/<meta name="keywords" content="([^"]+)"/)[1].split(', ');
  assert.ok(!/suede/i.test(keywords[0]));
  assert.equal(keywords.filter(k => /suede/i.test(k)).length, 1);
});
