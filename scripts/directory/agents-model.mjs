// Agent evidence is independent of the SKILL.md rubric. No network or agent execution.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const AGENT_METHOD = 'agent-evidence-v1';
export const CRITERIA = {
  documentation: ['tasks', 'boundaries', 'setup', 'prerequisites', 'models', 'example', 'tools', 'permissions', 'recovery', 'support'],
  repository: ['license', 'attribution', 'revision', 'distribution', 'dependencies', 'resolved_dependencies', 'tests', 'ci', 'changes', 'security_policy'],
  hosted: ['terms', 'pricing', 'retention', 'training', 'authentication', 'permissions', 'audit_export', 'deletion_revocation', 'status', 'changes'],
};
const RESERVED = new Set(['ungraded', 'methodology', 'submit', 'search-index', 'evidence']);
const HASH = /^[a-f0-9]{64}$/;
const SHA = /^[a-f0-9]{40}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fail = message => { throw new Error(`Agent catalog: ${message}`); };
const need = (condition, message) => { if (!condition) fail(message); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value, label) => need(typeof value === 'string' && value.trim().length > 0 && value.length <= 4000, `${label} must be nonempty text`);
const list = (value, label) => { need(Array.isArray(value), `${label} must be an array`); value.forEach(v => text(v, label)); };
const exact = (value, keys, label) => need(object(value) && Object.keys(value).sort().join('|') === [...keys].sort().join('|'), `${label} has invalid fields`);
const unique = (values, label) => need(new Set(values).size === values.length, `${label} contains duplicates`);

export const canonicalJson = value => JSON.stringify(value, (_, v) => object(v)
  ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const recordDigest = value => sha256(canonicalJson(value));

function date(value, label) {
  need(typeof value === 'string' && /^\d{4}-\d\d-\d\d$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, `${label} must be a valid date`);
  return Date.parse(value);
}
function safeUrl(value, label) {
  text(value, label);
  let u;
  try { u = new URL(value); } catch { fail(`${label} must be a public HTTPS URL`); }
  need(u.protocol === 'https:' && !u.username && !u.password && !u.port && !/[\u0000-\u0020\u007f]/.test(value)
    && u.hostname.includes('.') && !/^(?:localhost|\[|\d+\.)/i.test(u.hostname) && !/\.(?:local|localhost|internal)$/i.test(u.hostname), `${label} must be a public HTTPS URL`);
  return u;
}
function pinnedUrl(value, prefix, label) {
  const parsed = safeUrl(value, label);
  const rawPath = value.split('?')[0].split('#')[0];
  need(!/[\\\\]/.test(value) && !/%(?:2f|5c)/i.test(value)
    && !rawPath.split('/').some(part => /^(?:\.|%2e){1,2}$/i.test(part))
    && parsed.href.startsWith(prefix) && value.startsWith(prefix) && parsed.pathname.length > new URL(prefix).pathname.length,
    `${label} must bind the exact repository/revision`);
}

function checkRubric(rubric) {
  exact(rubric, ['version', 'ratings'], 'rubric');
  need(rubric.version === AGENT_METHOD, 'unsupported methodology');
  exact(rubric.ratings, Object.keys(CRITERIA), 'rubric ratings');
  for (const [id, keys] of Object.entries(CRITERIA)) {
    const r = rubric.ratings[id]; exact(r, ['label', 'checks'], `rubric ${id}`); text(r.label, 'rating label');
    need(Array.isArray(r.checks) && r.checks.map(c => c.id).join('|') === keys.join('|'), `rubric ${id} criterion IDs differ`);
    for (const c of r.checks) { exact(c, ['id', 'label', 'rule'], 'rubric criterion'); text(c.label, 'criterion label'); text(c.rule, 'criterion rule'); }
  }
}

export function freshness(assessedAt, now = new Date().toISOString().slice(0, 10)) {
  return date(now, 'current date') - date(assessedAt, 'assessment date') > 30 * 86400000 ? 'stale' : 'current';
}

function validateReceipt(receipt, product, edition, generated) {
  exact(receipt, ['id', 'product_id', 'edition_id', 'type', 'observed_at', 'reviewer', 'source', 'observations', 'record_sha256'], 'receipt');
  need(SLUG.test(receipt.id), 'invalid receipt id');
  const { record_sha256, ...body } = receipt;
  need(HASH.test(record_sha256) && recordDigest(body) === record_sha256, `receipt digest mismatch: ${receipt.id}`);
  need(receipt.product_id === product.id && receipt.edition_id === edition.id, `receipt product/edition mismatch: ${receipt.id}`);
  need(['source_inspection', 'publisher_documentation'].includes(receipt.type), 'unsupported evidence type');
  need(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(receipt.observed_at) && Number.isFinite(Date.parse(receipt.observed_at)), 'invalid observation timestamp');
  const observedDate = receipt.observed_at.slice(0, 10); date(observedDate, 'observation date');
  need(observedDate <= generated && observedDate <= edition.reviewed_at, 'observation after assessment/snapshot date');
  text(receipt.reviewer, 'reviewer'); list(receipt.observations, 'observations'); need(receipt.observations.length > 0, 'receipt needs observations');
  exact(receipt.source, ['url', 'locator', 'revision', 'blob_sha', 'content_sha256'], 'receipt source');
  safeUrl(receipt.source.url, 'evidence URL'); text(receipt.source.locator, 'source locator');
  if (receipt.type === 'source_inspection') {
    need(edition.source && receipt.source.revision === edition.source.revision && SHA.test(receipt.source.revision), 'source revision mismatch');
    const prefix = `https://github.com/${edition.source.repository}/blob/${edition.source.revision}/`;
    pinnedUrl(receipt.source.url, prefix, 'source URL');
    need(SHA.test(receipt.source.blob_sha) && HASH.test(receipt.source.content_sha256), 'source needs blob and content digests');
  } else {
    need(receipt.source.revision === null && receipt.source.blob_sha === null && receipt.source.content_sha256 === null, 'hosted/document observations must not claim retained full-page or revision digests');
  }
}

export function validateAgentCatalog(catalog, receipts, rubric) {
  checkRubric(rubric);
  exact(catalog, ['schema_version', 'methodology_version', 'generated', 'snapshot_id', 'products'], 'catalog');
  need(catalog.schema_version === 1 && catalog.methodology_version === AGENT_METHOD, 'unsupported catalog version');
  date(catalog.generated, 'snapshot date'); need(/^[a-f0-9]{32}$/.test(catalog.snapshot_id), 'invalid snapshot id');
  need(Array.isArray(catalog.products) && object(receipts), 'products/receipts missing');
  unique(catalog.products.map(p => p.id), 'product IDs');
  const products = structuredClone(catalog.products); const editions = [];
  for (const p of products) {
    exact(p, ['id', 'name', 'publisher', 'url', 'summary', 'tags', 'review_status', 'editions'], 'product');
    need(SLUG.test(p.id) && !RESERVED.has(p.id), 'invalid or reserved product route');
    for (const key of ['name', 'publisher', 'summary']) text(p[key], `product ${key}`);
    safeUrl(p.url, 'official URL'); list(p.tags, 'task tags'); unique(p.tags, 'task tags');
    need(p.tags.length && p.tags.every(t => SLUG.test(t)), 'task tags must be slugs');
    need(p.review_status === 'published' && Array.isArray(p.editions) && p.editions.length > 0, 'only admitted products with editions can be published');
    unique(p.editions.map(e => e.id), `${p.id} edition IDs`);
    for (const e of p.editions) {
      exact(e, ['id', 'name', 'deployment', 'source', 'terms_url', 'access_url', 'requirements', 'permissions', 'costs', 'reviewed_at', 'reviewer', 'evidence_ids', 'ratings', 'performance', 'security'], 'edition');
      need(SLUG.test(e.id), 'invalid edition id'); text(e.name, 'edition name');
      need(['local', 'self-hosted', 'hosted'].includes(e.deployment), 'invalid deployment');
      safeUrl(e.access_url, 'access URL');
      if (e.source !== null) {
        exact(e.source, ['repository', 'revision', 'license', 'license_url', 'distribution_url', 'deployment_revision'], 'edition source');
        need(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(e.source.repository) && SHA.test(e.source.revision), 'source needs repository and exact revision');
        text(e.source.license, 'license'); safeUrl(e.source.license_url, 'license URL'); safeUrl(e.source.distribution_url, 'distribution URL');
        pinnedUrl(e.source.license_url, `https://github.com/${e.source.repository}/blob/${e.source.revision}/`, 'license URL');
        need(e.source.deployment_revision === (e.deployment === 'hosted' ? 'unknown' : 'not_applicable'), 'unsupported deployment revision equivalence claim');
      }
      need(e.source !== null || e.deployment === 'hosted', 'a non-hosted edition requires public source');
      if (e.deployment === 'hosted') safeUrl(e.terms_url, 'service terms'); else need(e.terms_url === null, 'non-hosted service terms must be null');
      for (const key of ['requirements', 'permissions', 'costs']) { list(e[key], key); need(e[key].length > 0, `${key} needs disclosure`); }
      date(e.reviewed_at, 'assessment date'); need(e.reviewed_at <= catalog.generated, 'assessment after snapshot'); text(e.reviewer, 'reviewer');
      list(e.evidence_ids, 'evidence IDs'); unique(e.evidence_ids, 'evidence IDs'); need(e.evidence_ids.length > 0, 'edition needs evidence');
      for (const id of e.evidence_ids) { need(SLUG.test(id) && receipts[id]?.id === id, `missing or invalid evidence: ${id}`); validateReceipt(receipts[id], p, e, catalog.generated); }
      exact(e.ratings, Object.keys(CRITERIA), 'ratings');
      const assessments = {};
      for (const [kind, keys] of Object.entries(CRITERIA)) {
        const applicable = kind === 'documentation' || (kind === 'repository' ? e.source !== null : e.deployment === 'hosted');
        const checks = e.ratings[kind];
        if (!applicable) { need(checks === null, `${kind} must be not applicable`); assessments[kind] = { status: 'not_applicable', score: null, reviewed: 0, total: 10 }; continue; }
        need(object(checks) && Object.keys(checks).sort().join('|') === [...keys].sort().join('|'), `${kind} needs every criterion exactly once`);
        let reviewed = 0; let points = 0;
        for (const id of keys) {
          const c = checks[id]; exact(c, ['state', 'reason', 'evidence'], `${kind}/${id} criterion`);
          need(['supported', 'absent', 'unknown'].includes(c.state), 'invalid criterion state'); text(c.reason, 'criterion reason');
          list(c.evidence, 'criterion evidence'); unique(c.evidence, 'criterion evidence');
          need(c.evidence.every(ref => e.evidence_ids.includes(ref)), 'criterion evidence belongs to another edition or is missing');
          if (c.state !== 'unknown') { need(c.evidence.length > 0, 'measured criterion requires evidence'); reviewed++; }
          if (c.state === 'supported') points++;
          if (kind === 'repository' && c.state === 'supported') need(c.evidence.some(ref => receipts[ref].type === 'source_inspection'), 'repository criterion requires pinned source evidence');
        }
        assessments[kind] = { status: reviewed === 10 ? 'assessed' : 'incomplete', score: reviewed === 10 ? points : null, reviewed, total: 10 };
      }
      exact(e.performance, ['status', 'results'], 'performance');
      need(e.performance.status === 'not_tested' && Array.isArray(e.performance.results) && e.performance.results.length === 0, 'runtime results require a separately reviewed test pipeline');
      exact(e.security, ['status', 'findings'], 'security');
      need(e.security.status === 'not_assessed' && Array.isArray(e.security.findings), 'security status requires a separately reviewed assessment pipeline');
      for (const finding of e.security.findings) {
        exact(finding, ['id', 'severity', 'summary', 'url'], 'security finding'); text(finding.id, 'finding id'); text(finding.summary, 'finding summary');
        need(['unknown', 'info', 'low', 'medium', 'high', 'critical'].includes(finding.severity), 'invalid finding severity'); safeUrl(finding.url, 'finding source');
      }
      e.assessments = assessments;
      editions.push({ ...e, product_id: p.id, product_name: p.name, publisher: p.publisher, summary: p.summary, tags: p.tags });
    }
  }
  return { catalog: structuredClone(catalog), products, editions, receipts: structuredClone(receipts), rubric: structuredClone(rubric), catalog_sha256: recordDigest(catalog), rubric_sha256: recordDigest(rubric) };
}

export function loadAgentCatalog(root) {
  const file = path.join(root, 'directory/agents.json');
  if (!fs.existsSync(file)) return null; // Legacy isolated skill fixtures remain valid.
  const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rubric = JSON.parse(fs.readFileSync(path.join(root, 'directory/agents/rubric-v1.json'), 'utf8'));
  const refs = catalog.products?.flatMap(p => p.editions?.flatMap(e => e.evidence_ids || []) || []) || [];
  const receipts = {};
  for (const id of new Set(refs)) {
    need(typeof id === 'string' && SLUG.test(id), 'invalid evidence file ID');
    const target = path.join(root, 'directory/agents/evidence', `${id}.json`);
    need(!fs.lstatSync(target).isSymbolicLink(), 'evidence must not be a symlink');
    receipts[id] = JSON.parse(fs.readFileSync(target, 'utf8'));
  }
  return validateAgentCatalog(catalog, receipts, rubric);
}

export function agentReport(model, product, baseUrl) {
  const root = baseUrl.replace(/\/$/, '') + '/';
  const ids = [...new Set(product.editions.flatMap(e => e.evidence_ids))];
  const body = {
    schema_version: 1, kind: 'agent', product: { id: product.id, name: product.name, publisher: product.publisher, url: product.url },
    listing_url: `${root}agents/${product.id}/`,
    snapshot: { date: model.catalog.generated, id: model.catalog.snapshot_id, dataset_sha256: model.catalog_sha256 },
    methodology: { version: AGENT_METHOD, url: `${root}agents/methodology/`, rubric_sha256: model.rubric_sha256, scope: 'Documentation and evidence coverage; no runtime or safety rating' },
    editions: product.editions, evidence: ids.map(id => model.receipts[id]),
  };
  return { ...body, report_version: sha256(JSON.stringify(body)) };
}
