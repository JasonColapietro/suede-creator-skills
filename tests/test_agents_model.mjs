import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const moduleUrl = new URL('../scripts/directory/agents-model.mjs', import.meta.url);
const hasModel = fs.existsSync(moduleUrl);
const model = hasModel ? await import(moduleUrl) : {};
test('published intake includes real repository and hosted editions with honest assessment states', () => {
  const m = model.loadAgentCatalog(new URL('..', import.meta.url).pathname);
  assert.ok(m, 'agent catalog must exist');
  assert.deepEqual(m.products.map(p => p.id).sort(), ['cline', 'devin', 'goose']);
  assert.ok(m.editions.some(e => e.source));
  assert.ok(m.editions.some(e => e.deployment === 'hosted' && e.terms_url));
  for (const e of m.editions) {
    assert.equal(e.performance.status, 'not_tested');
    assert.equal(e.security.status, 'not_assessed');
    for (const a of Object.values(e.assessments)) {
      assert.equal(a.total, 10);
      if (a.status !== 'assessed') assert.equal(a.score, null);
    }
  }
});
const DOC = ['tasks', 'boundaries', 'setup', 'prerequisites', 'models', 'example', 'tools', 'permissions', 'recovery', 'support'];
const REPO = ['license', 'attribution', 'revision', 'distribution', 'dependencies', 'resolved_dependencies', 'tests', 'ci', 'changes', 'security_policy'];
const HOST = ['terms', 'pricing', 'retention', 'training', 'authentication', 'permissions', 'audit_export', 'deletion_revocation', 'status', 'changes'];
const canonical = value => JSON.stringify(value, (_, v) => v && !Array.isArray(v) && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
const digest = value => createHash('sha256').update(canonical(value)).digest('hex');
const seal = value => ({ ...value, record_sha256: digest(value) });

function fixture({ hosted = false, source = true } = {}) {
  const revision = 'a'.repeat(40);
  const ids = { documentation: DOC, repository: REPO, hosted: HOST };
  const rubric = { version: 'agent-evidence-v1', ratings: Object.fromEntries(Object.entries(ids).map(([id, checks]) => [id, { label: id, checks: checks.map(id => ({ id, label: id, rule: `Reviewed ${id} evidence.` })) }])) };
  const receipt = seal({ id: 'example-cli-source', product_id: 'example', edition_id: 'cli', type: source ? 'source_inspection' : 'publisher_documentation', observed_at: '2026-10-27T04:00:00Z', reviewer: 'Fixture reviewer', source: { url: source ? `https://github.com/example/agent/blob/${revision}/README.md` : 'https://example.com/docs', locator: 'README: Setup', revision: source ? revision : null, blob_sha: source ? 'b'.repeat(40) : null, content_sha256: source ? 'c'.repeat(64) : null }, observations: ['Runnable agent with documented setup.'] });
  const checks = ids => Object.fromEntries(ids.map((id, i) => [id, { state: i < 8 ? 'supported' : 'absent', reason: i < 8 ? 'Specific evidence was reviewed.' : 'Absent in the reviewed material.', evidence: [receipt.id] }]));
  const edition = { id: 'cli', name: 'CLI', deployment: hosted ? 'hosted' : 'local', source: source ? { repository: 'example/agent', revision, license: 'MIT', license_url: `https://github.com/example/agent/blob/${revision}/LICENSE`, distribution_url: 'https://example.com/install', deployment_revision: hosted ? 'unknown' : 'not_applicable' } : null, terms_url: hosted ? 'https://example.com/terms' : null, access_url: 'https://example.com/install', requirements: ['A compatible model.'], permissions: ['Read the permissions guide.'], costs: ['Provider usage may be billed.'], reviewed_at: '2026-10-27', reviewer: 'Fixture reviewer', evidence_ids: [receipt.id], ratings: { documentation: checks(DOC), repository: source ? checks(REPO) : null, hosted: hosted ? checks(HOST) : null }, performance: { status: 'not_tested', results: [] }, security: { status: 'not_assessed', findings: [] } };
  const catalog = { schema_version: 1, methodology_version: 'agent-evidence-v1', generated: '2026-10-27', snapshot_id: 'd'.repeat(32), products: [{ id: 'example', name: 'Example', publisher: 'Example team', url: 'https://example.com/', summary: 'A runnable agent for coding tasks.', tags: ['coding'], review_status: 'published', editions: [edition] }] };
  return { catalog, receipts: { [receipt.id]: receipt }, rubric, edition, receipt };
}

test('agent evidence model is available as an independent module', () => assert.equal(typeof model.validateAgentCatalog, 'function'));
test('eight supported and two reviewed-absent criteria publish 8/10', { skip: !hasModel }, () => {
  const f = fixture(); const m = model.validateAgentCatalog(f.catalog, f.receipts, f.rubric);
  assert.deepEqual(m.editions[0].assessments.documentation, { status: 'assessed', score: 8, reviewed: 10, total: 10 });
  assert.equal(m.editions[0].assessments.hosted.status, 'not_applicable');
});
test('an unknown criterion keeps the total null without hiding review coverage', { skip: !hasModel }, () => {
  const f = fixture(); f.edition.ratings.documentation.support = { state: 'unknown', reason: 'Not reviewed yet.', evidence: [] };
  const a = model.validateAgentCatalog(f.catalog, f.receipts, f.rubric).editions[0].assessments.documentation;
  assert.deepEqual(a, { status: 'incomplete', score: null, reviewed: 9, total: 10 });
});
test('hosted source editions can have both evidence ratings without a deployment claim', { skip: !hasModel }, () => {
  const f = fixture({ hosted: true }); const e = model.validateAgentCatalog(f.catalog, f.receipts, f.rubric).editions[0];
  assert.equal(e.assessments.repository.score, 8); assert.equal(e.assessments.hosted.score, 8);
  assert.equal(e.source.deployment_revision, 'unknown');
  const hostedOnly = fixture({ hosted: true, source: false });
  assert.equal(model.validateAgentCatalog(hostedOnly.catalog, hostedOnly.receipts, hostedOnly.rubric).editions[0].assessments.repository.status, 'not_applicable');
});
test('altered receipt bytes cannot silently award points', { skip: !hasModel }, () => {
  const f = fixture(); f.receipt.observations.push('Invented result');
  assert.throws(() => model.validateAgentCatalog(f.catalog, f.receipts, f.rubric), /digest/);
});
test('source revision and edition mismatches reject even if the receipt is resealed', { skip: !hasModel }, () => {
  for (const change of [r => { r.source.revision = 'f'.repeat(40); }, r => { r.edition_id = 'desktop'; }]) {
    const f = fixture(); const { record_sha256, ...receipt } = structuredClone(f.receipt); change(receipt); f.receipts[receipt.id] = seal(receipt);
    assert.throws(() => model.validateAgentCatalog(f.catalog, f.receipts, f.rubric), /revision|edition/);
  }
});
test('scores require every criterion exactly once and cited evidence for measured states', { skip: !hasModel }, () => {
  for (const change of [e => { delete e.ratings.documentation.tasks; }, e => { e.ratings.documentation.tasks.evidence = []; }, e => { e.ratings.documentation.tasks.state = 'passed'; }]) {
    const f = fixture(); change(f.edition); assert.throws(() => model.validateAgentCatalog(f.catalog, f.receipts, f.rubric), /criterion|evidence|state/);
  }
});
test('unsafe links, reserved routes and unsupported measured claims reject', { skip: !hasModel }, () => {
  for (const change of [f => { f.edition.access_url = 'javascript:alert(1)'; }, f => { f.catalog.products[0].id = 'methodology'; }, f => { f.catalog.products.push(structuredClone(f.catalog.products[0])); }, f => { f.edition.performance = { status: 'tested', results: [{ score: 99 }] }; }, f => { f.edition.security.status = 'safe'; }, f => { f.edition.source.deployment_revision = 'verified'; }]) {
    const f = fixture(); change(f); assert.throws(() => model.validateAgentCatalog(f.catalog, f.receipts, f.rubric));
  }
});
test('review freshness expires after 30 days but does not rescore evidence', { skip: !hasModel }, () => {
  assert.equal(model.freshness('2026-10-27', '2026-11-26'), 'current');
  assert.equal(model.freshness('2026-10-27', '2026-11-27'), 'stale');
  assert.throws(() => model.freshness('2026-02-31', '2026-11-27'), /date/);
});
test('agent reports bind catalog, methodology and receipts and hash independently', { skip: !hasModel }, () => {
  const f = fixture(); const m = model.validateAgentCatalog(f.catalog, f.receipts, f.rubric);
  const report = model.agentReport(m, m.products[0], 'https://skills.suedeai.ai/directory/');
  const { report_version, ...body } = report;
  assert.equal(report.kind, 'agent');
  assert.equal(report_version, createHash('sha256').update(JSON.stringify(body)).digest('hex'));
  assert.equal(report.editions[0].performance.status, 'not_tested');
  assert.equal(report.evidence[0].record_sha256, f.receipt.record_sha256);
  assert.equal(report.listing_url, 'https://skills.suedeai.ai/directory/agents/example/');
});

test('source and license URLs cannot escape a pinned revision through dot segments', () => {
 for (const segment of ['..', '%2e%2e', '.%2e', '%2e.', '%2e%2e%2fmain']) {
  const f=fixture();const prefix=`https://github.com/example/agent/blob/${f.edition.source.revision}/`;
  const {record_sha256,...body}=structuredClone(f.receipt);
  body.source.url=prefix+segment+'/main/README.md';f.receipts[body.id]=seal(body);
  assert.throws(()=>model.validateAgentCatalog(f.catalog,f.receipts,f.rubric),/source URL/);
  const g=fixture();g.edition.source.license_url=prefix+segment+'/main/LICENSE';
  assert.throws(()=>model.validateAgentCatalog(g.catalog,g.receipts,g.rubric),/license URL/);
 }
});
