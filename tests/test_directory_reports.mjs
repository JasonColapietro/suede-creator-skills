import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const read = (file) => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const bytes = read('directory/skills.json');
const data = JSON.parse(bytes);
const index = JSON.parse(read('docs/directory/search-index.json'));
const digest = (text) => createHash('sha256').update(text).digest('hex');
const datasetDigest = digest(bytes);

test('every listed skill exports a verifiable report tied to the saved evidence and existing badges', () => {
  for (const entry of index) {
    assert.match(entry.report, /^\/directory\/[a-z0-9/-]+\/report\.json$/);
    const report = JSON.parse(read('docs' + entry.report));
    const { report_version, ...evidence } = report;
    assert.equal(report_version, digest(JSON.stringify(evidence)));
    assert.equal(report.schema_version, 1);
    assert.equal(report.snapshot.dataset_sha256, datasetDigest);
    assert.equal(report.snapshot.id, data.snapshot_id);
    assert.equal(report.snapshot.date, data.generated);
    assert.equal(entry.snapshot, data.generated);
    assert.equal(entry.method, data.score_method);
    assert.equal(report.methodology.version, data.score_method);
    assert.equal(report.methodology.rubric_total, 100);
    assert.equal(report.methodology.published_cap, 99);
    assert.equal(report.quality.score, entry.score);
    assert.equal(report.quality.grade, entry.grade);
    assert.equal(Math.min(99, report.quality.components.reduce((n, c) => n + c.points, 0)), entry.score);
    assert.equal(report.listing_url, 'https://skills.suedeai.ai' + entry.href);
    assert.equal(report.security_scan_status, 'not_scanned');
    const repo = data.repos[entry.repo];
    assert.equal(report.source.revision, repo.commit_sha || null);
    assert.equal(report.source.revision_status, repo.commit_sha ? 'recorded' : 'not_recorded_in_snapshot');
    if (repo.commit_sha) assert.ok(report.source.skill_md_url.includes('/blob/' + repo.commit_sha + '/'));
    for (const badge of report.badges) {
      const svg = read('docs' + new URL(badge.src).pathname);
      if (badge.kind === 'score') assert.ok(svg.includes(entry.score + ' / 100'));
      if (entry.score < 80) assert.equal(badge.kind, 'listing');
    }
  }
});

test('review requests preserve one exact skill, its previous snapshot and manual review path', () => {
  for (const full of [true, false]) {
    const entry = index.find((s) => s.full === full);
    const listing = new URL('https://skills.suedeai.ai' + entry.href);
    const html = read('docs' + listing.pathname + 'index.html');
    const links = [...html.matchAll(/href="([^"]+)"[^>]*>Request a fresh review<\/a>/g)].map((m) => new URL(m[1].replaceAll('&amp;', '&')));
    const link = links.find((u) => u.searchParams.get('skill-scope') === entry.name);
    assert.ok(link, entry.href);
    assert.equal(link.searchParams.get('repository'), 'https://github.com/' + entry.repo);
    assert.equal(link.searchParams.get('request'), 'Recheck my updated skill');
    assert.ok(link.searchParams.get('details').includes(data.snapshot_id));
    assert.ok(link.searchParams.get('details').includes('Updated source commit or PR:'));
  }
  const html = read('docs/directory/submit/index.html');
  assert.ok(html.includes('rechecks accepted changes at a directory refresh'));
  assert.ok(read('.github/ISSUE_TEMPLATE/directory-listing.yml').includes('- Recheck my updated skill'));
});
