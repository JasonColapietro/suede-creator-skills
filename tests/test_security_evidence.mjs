import test from 'node:test';
import assert from 'node:assert/strict';
import { securityStatus, SCANNER_PROFILE } from '../scripts/security/evidence.mjs';

const source = { repository: 'publisher/skills', path: 'skills/example', revision: 'a'.repeat(40) };
const now = new Date('2026-10-25T12:00:00Z');
const result = () => ({
  schema_version: 1, source, scanner: SCANNER_PROFILE,
  started_at: '2026-10-25T11:00:00Z', completed_at: '2026-10-25T11:01:00Z',
  state: 'completed', coverage: { complete: true, files: [{ path: 'SKILL.md', size: 20, sha256: 'b'.repeat(64) }], skipped: [] },
  analysis: { findings: [], findings_count: 0, analyzers_used: [...SCANNER_PROFILE.analyzers], analyzers_failed: [] },
});

test('security pass requires completed evidence for the exact source and configured analyzers', () => {
  assert.equal(securityStatus(null, source, now).status, 'not_scanned');
  assert.equal(securityStatus(result(), source, now).status, 'passed');
  for (const patch of [{ completed_at: null }, { scanner: {} }, { analysis: { findings: [] } }, { coverage: { complete: false, files: [], skipped: ['scripts/run.py'] } }]) {
    assert.equal(securityStatus({ ...result(), ...patch }, source, now).status, 'error');
  }
  const stale = result(); stale.source = { ...source, revision: 'c'.repeat(40) };
  assert.equal(securityStatus(stale, source, now).status, 'stale');
  assert.equal(securityStatus(result(), source, new Date('2026-12-25')).status, 'stale');
});

test('findings and analyzer errors cannot become approvals even if upstream is_safe says true', () => {
  for (const [severity, expected] of [['HIGH', 'failed'], ['CRITICAL', 'failed'], ['MEDIUM', 'findings'], ['LOW', 'findings']]) {
    const record = result(); record.analysis = { ...record.analysis, is_safe: true, findings_count: 1, findings: [{ severity }] };
    assert.equal(securityStatus(record, source, now).status, expected);
  }
  const record = result(); record.analysis.analyzers_failed = [{ analyzer: 'static', error: 'timeout' }];
  assert.equal(securityStatus(record, source, now).status, 'error');
  record.analysis.analyzers_failed = []; record.analysis.findings = [{ severity: 'UNKNOWN' }];
  assert.equal(securityStatus(record, source, now).status, 'error');
});

test('error, skipped, future timestamps and missing skill coverage remain explicit', () => {
  assert.equal(securityStatus({ ...result(), state: 'error', reason: 'runtime_unavailable' }, source, now).status, 'error');
  assert.equal(securityStatus({ ...result(), state: 'skipped', reason: 'batch_limit' }, source, now).status, 'skipped');
  const record = result(); record.completed_at = '2027-01-01T00:00:00Z';
  assert.equal(securityStatus(record, source, now).status, 'error');
  record.completed_at = '2026-10-25T11:01:00Z'; record.coverage.files[0].path = '../SKILL.md';
  assert.equal(securityStatus(record, source, now).status, 'error');
});

test('a null revision, branch or empty manifest cannot receive a security pass', () => {
  for (const revision of [null, 'main', 'a'.repeat(39)]) {
    const record = result(); record.source = { ...source, revision };
    assert.equal(securityStatus(record, record.source, now).status, 'error');
  }
  const record = result(); record.coverage.files[0].size = 0;
  assert.equal(securityStatus(record, source, now).status, 'error');
});
