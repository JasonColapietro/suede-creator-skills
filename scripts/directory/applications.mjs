import { createHash } from 'node:crypto';
// A public submission register, separate from admission, scores and featuring.
// Never copy issue bodies, contact fields or profile details to the output.
const REPO = /^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/;
const HANDLE = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?(?:\[bot\])?$/i;
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ISSUE_BASE = 'https://github.com/JasonColapietro/suede-creator-skills/issues';
function field(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return body.match(new RegExp(`^### ${escaped}\\s*\\n([\\s\\S]*?)(?=^### |$(?![\\s\\S]))`, 'm'))?.[1]?.trim() || '';
}
function repository(value) {
  const match = value.match(/^https:\/\/github\.com\/([A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+)\/?(?:\s|$)/);
  const repo = match?.[1]?.replace(/\.git$/, '');
  return repo && REPO.test(repo) && !['.', '..'].includes(repo.split('/')[1]) ? repo : null;
}
// Historical forms omitted scope, or used the separate agent-listing form.
// These are explicit readings of public requests, never inferred repo-wide consent.
const HISTORICAL = {
  231: { repo: 'appierun/appie-mcp', scope: ['appie-article-writer', 'appie-chatbot', 'appie-url-shortener'] },

  317: { repo: 'vostride/agent-qa', kind: 'agent', scope: ['agent-qa'] },
};
function publicSite(value) {
  try {
    const site = new URL(value.split(/\s/)[0]);
    if (site.protocol !== 'https:' || site.username || site.password || site.search || site.hash) return null;
    return site.href;
  } catch { return null; }
}
export function importApplications(issues) {
  const applications = new Map();
  for (const issue of issues) {
    if (issue.pull_request) continue;
    const body = issue.body || '';
    const request = field(body, 'Request');
    let historical = HISTORICAL[issue.number];
    const isSkill = /^Add my skills(?:\s|$)/i.test(request) && /- \[[xX]\] I maintain this repository, or I am requesting a listing for a public repository on its maintainers' behalf\./.test(body);
    const isAgent = request === 'Add' && Boolean(field(body, 'Official product URL'));
    if (!isSkill && !isAgent) continue;
    const repo = repository(field(body, isAgent ? 'Public source repository and revision (if available)' : 'Public GitHub repository'));
    const site = isAgent ? publicSite(field(body, 'Official product URL')) : null;
    if (historical && historical.repo.toLowerCase() !== repo?.toLowerCase()) historical = null;
    const rawScope = field(body, 'Skill names or listing scope');
    // Read the whole scope, not just its first paragraph. Only these neutral
    // annotations can be dropped; unfamiliar prose stays source-linked/unknown.
    let scopeText = rawScope.replace(/^Selected skill only, not (?:the entire collection and not )?future additions\.\s*$/gm, '').trim();
    const canonical = scopeText.match(/^Canonical folder: ([a-zA-Z0-9_./-]+)\s*$/m);
    if (canonical && NAME.test(canonical[1].split('/').at(-1)) && scopeText.split(/\n/).some(line => line.trim() === canonical[1].split('/').at(-1))) scopeText = scopeText.replace(/^Canonical folder: [a-zA-Z0-9_./-]+\s*$/m, '').trim();
    // The original BulkPublish form lists its inventory immediately after all.
    if (issue.number === 304 && repo === 'azeemkafridi/bulkpublish-ai-toolkit' && scopeText === 'all\n(The repository contains: using-bulkpublish, schedule-post, bulk-publish, manage-channels, manage-inbox, get-analytics, check-quota, platform-reference)') scopeText = 'all';
    const scope = !scopeText && historical?.scope ? historical.scope : /^all$/i.test(scopeText) ? 'all' : scopeText.split(/\n/).map(s => s.trim()).filter(Boolean);
    const safeScope = isAgent && !historical ? null : scope === 'all' ? 'all' : scope.length && scope.every(name => NAME.test(name)) ? [...new Set(scope)] : null;
    const scope_version = createHash('sha256').update(JSON.stringify({repo, site, kind: isAgent ? 'agent' : 'skill', rawScope, scope: safeScope, edition: isAgent ? field(body, 'Exact product and edition') : null})).digest('hex');
    const applicant = issue.user?.login || issue.author?.login;
    if (!HANDLE.test(applicant || '')) throw new Error(`Application #${issue.number}: invalid public applicant handle`);
    applications.set(issue.number, { issue: issue.number, applicant, repo, ...(isAgent ? { site } : {}), scope_version, kind: isAgent ? 'agent' : 'skill', scope: safeScope, applied_at: issue.createdAt || issue.created_at, issue_state: issue.state.toLowerCase() });
  }
  return [...applications.values()].sort((a, b) => b.applied_at.localeCompare(a.applied_at) || b.issue - a.issue);
}
export function validateApplications(data) {
  if (data.schema_version !== 1 || !/^\d{4}-\d\d-\d\d$/.test(data.updated) || !Array.isArray(data.applications)) throw new Error('Invalid application register');
  const numbers = new Set();
  const fields = new Set(['issue', 'applicant', 'repo', 'site', 'scope_version', 'kind', 'scope', 'applied_at', 'issue_state']);
  for (const app of data.applications) {
    const fail = () => { throw new Error(`Invalid public application #${app?.issue}`); };
    if (!app || Object.keys(app).some(k => !fields.has(k))) fail();
    if (!Number.isSafeInteger(app.issue) || app.issue <= 0 || numbers.has(app.issue)) fail();
    if (!HANDLE.test(app.applicant || '')) fail();
    if (app.repo !== null && (!REPO.test(app.repo) || ['.', '..'].includes(app.repo.split('/')[1]))) fail();
    if (!/^[a-f0-9]{64}$/.test(app.scope_version || '')) fail();
    if (app.site !== undefined && (app.kind !== 'agent' || (app.site !== null && !publicSite(app.site || '')))) fail();
    if (!['skill','agent'].includes(app.kind) || !['open','closed'].includes(app.issue_state)) fail();
    if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(app.applied_at) || !Number.isFinite(Date.parse(app.applied_at))) fail();
    if (app.scope !== null && app.scope !== 'all' && (!Array.isArray(app.scope) || !app.scope.length || app.scope.some(n => !NAME.test(n)) || new Set(app.scope).size !== app.scope.length)) fail();
    numbers.add(app.issue);
  }
  return data;
}
export function applicationStatus(app, decision = {}, { skills = [], editorial = {}, agents = [] } = {}) {
  if (Object.keys(decision).some(k => !['feature_id', 'review', 'scope_version'].includes(k))) throw new Error(`Unknown application decision field #${app.issue}`);
  const scope_changed = Boolean((decision.feature_id || decision.review) && decision.scope_version !== app.scope_version);
  if (scope_changed) decision = {};
  const entries = [...(editorial.projects || []).map(p => ({...p, placement_label: 'Featured'})), ...(editorial.members || []).map(p => ({...p, placement_label: 'Directory member'}))];
  const feature = decision.feature_id ? entries.find(p => p.id === decision.feature_id) : null;
  if (decision.feature_id && !feature) throw new Error(`Missing application feature #${app.issue}`);
  if (feature && (app.repo ? feature.repo?.toLowerCase() !== app.repo.toLowerCase() : publicSite(feature.site || '') !== publicSite(app.site || ''))) throw new Error(`Application feature repository mismatch #${app.issue}`);
  const review = decision.review || (feature?.status !== 'pending' ? feature?.review : null) || null;
  if (review && !/^directory\/reviews\/[A-Za-z0-9_.-]+\.md$/.test(review)) throw new Error(`Invalid application review #${app.issue}`);
  const listed = app.kind === 'skill' && app.repo ? skills.filter(s => s.repo.toLowerCase() === app.repo.toLowerCase() && (app.scope === 'all' || app.scope?.includes(s.name))) : [];
  const agent = app.kind === 'agent' ? agents.find(a => (app.repo && a.repositoryUrl?.replace(/^https:\/\/github.com\//, '').replace(/\/$/,'').toLowerCase() === app.repo.toLowerCase()) || (app.site && publicSite(a.officialUrl || '') === publicSite(app.site))) : null;
  return { review, listed, agent, scope_changed, placement: feature ? { id: feature.id, label: feature.placement_label, pending: feature.status === 'pending' } : null };
}
export function renderApplications(data, decisions, model, { page, crumbs, rel, url, esc, setKeywords, publisher, directoryRef, exists }) {
  validateApplications(data);
  const here = 'directory/applications/';
  const bc = crumbs(here, [['directory/', 'Directory'], [null, 'Project applications']]);
  const title = 'Project Applications | Suede AI Skills Directory';
  const description = 'Track public project submissions to the Suede AI Skills Directory, with original applications, requested scope, review records and editorial placement.';
  const rows = data.applications.map(app => {
    const status = applicationStatus(app, decisions[app.issue], model);
    if (status.review && !exists(status.review)) throw new Error(`Missing review file ${status.review}`);
    const scope = app.scope === 'all' ? 'All skills requested' : app.scope === null ? 'See application for scope' : app.scope.join(', ');
    const review = status.review ? `<a href="https://github.com/JasonColapietro/suede-creator-skills/blob/main/${esc(status.review)}">Reviewed</a>` : status.scope_changed ? 'Scope updated · review pending' : 'Review pending';
    const listing = app.kind === 'agent' ? (status.agent ? 'Listed in ungraded agent discovery' : 'No agent listing recorded') : status.listed.length ? `${status.listed.length} requested skill${status.listed.length === 1 ? '' : 's'} in scored catalog` : 'No requested skills in scored catalog';
    const placement = status.placement ? `<a href="${rel(here, 'directory/featured/')}#${esc(status.placement.id)}">${esc(status.placement.label)}</a>${status.placement.pending ? ' · review pending' : ''}` : 'Not featured';
    return `<article class="panel" id="application-${app.issue}"><h2><a href="${esc(app.repo ? `https://github.com/${app.repo}` : app.site || `${ISSUE_BASE}/${app.issue}`)}">${esc(app.repo || (app.site ? new URL(app.site).hostname : `Application #${app.issue}`))}</a></h2>${!app.repo && !app.site ? '<p>Project URL needs clarification; see the original application.</p>' : ''}<p><b>Applicant:</b> <a href="https://github.com/${esc(app.applicant)}">@${esc(app.applicant)}</a></p><p><b>Requested scope:</b> ${esc(scope)}${app.kind === 'agent' ? ' (agent product)' : ''}</p><dl><dt>Applied</dt><dd><time datetime="${app.applied_at}">${app.applied_at.slice(0, 10)}</time> · <a href="${ISSUE_BASE}/${app.issue}">Application #${app.issue}</a> (${app.issue_state})</dd><dt>Review</dt><dd>${review}</dd><dt>Directory listing</dt><dd>${listing}</dd><dt>Placement</dt><dd>${placement}</dd></dl></article>`;
  }).join('\n');
  const body = `${bc.html}<p class="lead">A public record of projects submitted by their maintainers or on their behalf. Follow each application from submission to review and placement.</p><p><b>${data.applications.length} public applications</b> · Snapshot updated <time datetime="${data.updated}">${data.updated}</time>. <a href="${ISSUE_BASE}?q=is%3Aissue">See the latest requests on GitHub</a>.</p><details class="panel application-guide"><summary>About this register</summary><p><b>Applied</b> records the public request and its original scope. <b>Reviewed</b> links to a published review record. <b>Directory listing</b> counts only requested skills in the current scored catalog. <b>Featured</b> is an editorial placement, which can be granted independently of a quality grade. A Directory member is a separate placement.</p><p>Issue open/closed state is shown for reference, not as a review verdict. Reviews describe their checked snapshot and findings; an editorial feature or badge is not a security certification. A selected-skill request does not cover the rest of a repository or future additions.</p><p>This register covers public GitHub listing applications, including requests submitted with AI assistance. Discovered projects and private email or message submissions are not automatically included. Applicant names are the public GitHub handles on their source issues; a handle may represent a person, team or automation. Private contact details and profile data are not republished here. Repeat requests retain their own source issue; they do not create extra directory listings.</p><p><a href="${rel(here, 'directory/submit/')}">Submit your project</a> · <a href="${rel(here, 'directory/featured/')}">Browse featured projects</a></p></details>${rows}`;
  return page({ here, title, description, keywords: setKeywords(here, ['agent skill applications','directory submissions','public project applications']), h1Html: '<div class="eyebrow">Suede AI Skills Directory · Direct submissions</div><h1>Project applications</h1>', body, jsonld: [{ '@context':'https://schema.org', '@type':'CollectionPage', name:title, description, url:url(here), dateModified:data.updated, publisher, isPartOf:directoryRef, mainEntity:{ '@type':'ItemList', numberOfItems:data.applications.length, itemListElement:data.applications.map((app,i) => ({'@type':'ListItem',position:i+1,name:app.repo || (app.site ? new URL(app.site).hostname : `Application #${app.issue}`),url:`${ISSUE_BASE}/${app.issue}`})) } }, bc.ld], footerNote:'Public application records are separate from directory scoring and editorial selections.' });
}
