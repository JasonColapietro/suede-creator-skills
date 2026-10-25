import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const SCANNER_PROFILE = JSON.parse(fs.readFileSync(new URL('./profile.json', import.meta.url), 'utf8'));
const sha = (v) => createHash('sha256').update(v).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const safePath = (p) => typeof p === 'string' && p.length > 0 && !p.includes('\\') && !p.startsWith('/') && p.split('/').every(c => c && c !== '.' && c !== '..');

// Security state is derived from retained evidence, never a quality grade or an upstream is_safe flag.
export function securityStatus(record, source, now = new Date()) {
  const outcome = (status, reason, extra = {}) => ({ status, reason,
    ...(record ? { source: record.source, scanner: record.scanner, started_at: record.started_at, completed_at: record.completed_at,
      evaluated_on: now.toISOString().slice(0, 10), valid_until: Number.isFinite(Date.parse(record.completed_at)) ? new Date(Date.parse(record.completed_at) + 30 * 864e5).toISOString() : null,
      files_scanned: Array.isArray(record.coverage?.files) ? record.coverage.files.length : 0,
      coverage_complete: record.coverage?.complete === true, skipped: record.coverage?.skipped || [] } : {}), ...extra });
  if (!record) return outcome('not_scanned', 'no_evidence');
  if (record.schema_version !== 1 || !same(record.source, source)) return outcome('stale', 'source_changed');
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(source.repository || '') || !/^[a-f0-9]{40}$/.test(source.revision || '') || (source.path !== '.' && !safePath(source.path))) return outcome('error', 'invalid_pinned_source');
  if (record.state === 'error' || record.state === 'skipped') return outcome(record.state, record.reason || 'scan_incomplete');
  if (record.state !== 'completed' || !same(record.scanner, SCANNER_PROFILE)) return outcome('error', 'unsupported_or_incomplete_scan');
  const start = Date.parse(record.started_at), end = Date.parse(record.completed_at);
  if (!record.started_at || !record.completed_at || !Number.isFinite(start) || !Number.isFinite(end) || start > end || end > now.getTime()) return outcome('error', 'invalid_scan_time');
  if (now.getTime() - end > 30 * 864e5) return outcome('stale', 'older_than_30_days');
  const coverage = record.coverage, analysis = record.analysis;
  if (!coverage?.complete || !Array.isArray(coverage.files) || !coverage.files.length || !Array.isArray(coverage.skipped) || coverage.skipped.length) return outcome('error', 'incomplete_file_coverage');
  const paths = new Set();
  for (const file of coverage.files) {
    if (!safePath(file.path) || paths.has(file.path) || !Number.isSafeInteger(file.size) || file.size < 0 || (file.path === 'SKILL.md' && file.size === 0) || !/^[a-f0-9]{64}$/.test(file.sha256 || '')) return outcome('error', 'invalid_file_inventory');
    paths.add(file.path);
  }
  if (!paths.has('SKILL.md') || !analysis || !Array.isArray(analysis.findings) || analysis.findings_count !== analysis.findings.length || !Array.isArray(analysis.analyzers_failed) || analysis.analyzers_failed.length || !Array.isArray(analysis.analyzers_used) || !SCANNER_PROFILE.analyzers.every(a => analysis.analyzers_used.includes(a))) return outcome('error', 'incomplete_analyzer_coverage');
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
  for (const finding of analysis.findings) {
    if (!Object.hasOwn(counts, finding.severity)) return outcome('error', 'unknown_finding_severity');
    counts[finding.severity]++;
  }
  if (analysis.suppressed_findings?.length) return outcome('error', 'suppressed_findings_present');
  const status = counts.CRITICAL + counts.HIGH ? 'failed' : analysis.findings.length ? 'findings' : 'passed';
  return outcome(status, status === 'passed' ? 'no_findings_in_recorded_coverage' : 'review_retained_findings', {
    source: record.source, scanner: record.scanner, started_at: record.started_at, completed_at: record.completed_at,
    files_scanned: coverage.files.length, findings: counts,
  });
}

export function readSecurityEvidence(root, skill, revision, ledger = {}, now) {
  const source = { repository: skill.repo, path: skill.dir, revision: revision || null };
  const id = skill.repo.toLowerCase() + '/' + skill.slug;
  const pointer = ledger[id];
  if (!pointer) return securityStatus(null, source, now);
  if (!/^security\/[a-f0-9]{64}\.json$/.test(pointer.file || '') || !/^[a-f0-9]{64}$/.test(pointer.sha256 || '')) return { status: 'error', reason: 'invalid_evidence_pointer' };
  try {
    const file = path.join(root, 'directory', pointer.file);
    if (fs.lstatSync(file).isSymbolicLink()) throw new Error('symlink');
    const bytes = fs.readFileSync(file);
    if (sha(bytes) !== pointer.sha256) throw new Error('digest');
    return { ...securityStatus(JSON.parse(bytes), source, now), evidence_url: `https://github.com/JasonColapietro/suede-creator-skills/blob/main/directory/${pointer.file}`, evidence_sha256: pointer.sha256 };
  } catch {
    return { status: 'error', reason: 'missing_or_invalid_evidence' };
  }
}

export const securityLabel = (status) => ({ not_scanned: 'not scanned', passed: 'completed, no findings in recorded coverage', findings: 'findings require review', failed: 'failed, blocking findings', error: 'error, scan incomplete', skipped: 'skipped', stale: 'stale, rescan required' })[status] || 'error, invalid status';
