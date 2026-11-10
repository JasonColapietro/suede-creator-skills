import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modulePath = path.join(root, 'scripts/directory/applications.mjs');
const getModule = async () => {
  assert.ok(fs.existsSync(modulePath), 'public application model must exist');
  return import(modulePath);
};
const issue = (extra = {}) => ({ number: 11, title: 'Directory: example', body: '### Request\n\nAdd my skills\n\n### Public GitHub repository\n\nhttps://github.com/maker/project\n\n### Skill names or listing scope\n\none-skill\n\n### Details\n\nContact private@example.com\n\n### Confirmation\n\n- [x] I maintain this repository, or I am requesting a listing for a public repository on its maintainers\' behalf.', state: 'OPEN', createdAt: '2026-11-10T01:00:00Z', author: { login: 'public-maker', name: 'Do not republish this field', email: 'private@example.com' }, ...extra });
test('only public submission fields enter the register, only the public applicant handle, never contacts or profile details', async () => {
  const { importApplications } = await getModule();
  const apps = importApplications([issue()]);
  assert.match(apps[0].scope_version, /^[a-f0-9]{64}$/);
  assert.deepEqual(apps.map(({scope_version, ...app}) => app), [{ issue: 11, applicant: 'public-maker', repo: 'maker/project', kind: 'skill', scope: ['one-skill'], applied_at: '2026-11-10T01:00:00Z', issue_state: 'open' }]);
  assert.doesNotMatch(JSON.stringify(apps), /private@example|Do not republish|Details|body/);
});
test('selected scope stays narrow and corrections, PRs and unconfirmed requests stay out', async () => {
  const { importApplications } = await getModule();
  assert.equal(importApplications([issue({ pull_request: {} }), issue({ number: 12, body: issue().body.replace('Add my skills', 'Correct a listing') }), issue({ number: 13, body: issue().body.replace('[x]', '[ ]') })]).length, 0);
  const selected = issue({ body: issue().body.replace('one-skill\n\n### Details', 'one-skill\n\nSelected skill only, not future additions.\n\n### Details') });
  assert.deepEqual(importApplications([selected])[0].scope, ['one-skill']);
  assert.deepEqual(importApplications([issue({ body: issue().body.replace('one-skill', 'all') })])[0].scope, 'all');
});
test('one source issue appears once and malformed scopes are never broadened', async () => {
  const { importApplications } = await getModule();
  assert.equal(importApplications([issue(), issue()]).length, 1);
  assert.equal(importApplications([issue({ body: issue().body.replace('one-skill', 'contact person@example.com') })])[0].scope, null);
});
test('closed applications and featured-pending records do not imply a completed review', async () => {
  const { applicationStatus } = await getModule();
  const app = { issue: 11, repo: 'maker/project', kind: 'skill', scope: ['one-skill'], issue_state: 'closed' };
  const none = applicationStatus(app, {}, { skills: [], editorial: {} });
  assert.equal(none.review, null); assert.equal(none.placement, null); assert.equal(none.listed.length, 0);
  const pending = applicationStatus(app, { feature_id: 'example' }, { skills: [{repo: 'maker/project', name: 'unrequested-skill'}], editorial: {projects: [{id: 'example', repo: 'maker/project', status: 'pending'}]} });
  assert.equal(pending.review, null); assert.equal(pending.placement.label, 'Featured'); assert.equal(pending.listed.length, 0);
});
test('editorial placement and selected scored listing are independent', async () => {
  const { applicationStatus } = await getModule();
  const app = { issue: 11, repo: 'maker/project', kind: 'skill', scope: ['one-skill'] };
  const status = applicationStatus(app, { feature_id: 'example' }, { skills: [{repo: 'maker/project', name: 'one-skill', score: 63}], editorial: {projects: [{id: 'example', repo: 'maker/project', review: 'directory/reviews/example.md'}]} });
  assert.equal(status.review, 'directory/reviews/example.md'); assert.equal(status.placement.label, 'Featured'); assert.equal(status.listed[0].score, 63);
  assert.throws(() => applicationStatus(app, {feature_id: 'other'}, {skills: [], editorial: {projects: [{id: 'other',repo: 'other/project'}]}}), /repository/);
});
test('the public application page is linked, indexable, source-linked and in the sitemap', () => {
  const p = path.join(root, 'docs/directory/applications/index.html');
  assert.ok(fs.existsSync(p), 'application page must exist');
  const html = fs.readFileSync(p, 'utf8');
  assert.match(html, /<h1>Project applications<\/h1>/);
  assert.match(html, /rel="canonical" href="https:\/\/suedeai.directory\/applications\/"/);
  assert.doesNotMatch(html, /content="noindex/);
  assert.match(html, /issues\/375/); assert.match(html, /Review pending|Reviewed/);
  for (const page of ['submit', 'featured']) assert.match(fs.readFileSync(path.join(root, `docs/directory/${page}/index.html`), 'utf8'), /href="\.\.\/applications\/"/);
  assert.ok(fs.readFileSync(path.join(root, 'docs/directory-sitemap.xml'), 'utf8').includes('/applications/'), 'application URL in sitemap');
});

test('the importer accepts only safe public GitHub handles', async () => {
  const { importApplications } = await getModule();
  assert.equal(importApplications([issue({ author: undefined, user: {login: 'public-maker'} })])[0].applicant, 'public-maker');
  assert.throws(() => importApplications([issue({author: {login: 'contact@example.com'}})]), /applicant/);
});
test('application records precede expanded explanatory copy on small screens', () => {
  const html = fs.readFileSync(path.join(root, 'docs/directory/applications/index.html'), 'utf8');
  assert.ok(html.includes('<details class="panel application-guide"><summary>About this register</summary>'), 'long status explanations should be collapsed initially');
});
test('future agent-form submissions include hosted products without broadening edition scope', async () => {
  const { importApplications, validateApplications, applicationStatus } = await getModule();
  const body = '### Request\n\nAdd\n\n### Official product URL\n\nhttps://example.com/agent\n\n### Exact product and edition\n\nExample hosted edition\n\n### Public source repository and revision (if available)\n\n_No response_\n\n### Evidence and requested change\n\nPlease add this agent.';
  const app = importApplications([issue({number: 500, title: '[Agent] Example',body})])[0];
  assert.ok(app, 'new agent application is tracked'); assert.equal(app.repo, null); assert.equal(app.site, 'https://example.com/agent'); assert.equal(app.scope, null);
  validateApplications({schema_version:1,updated:'2026-11-10',applications:[app]});
  const status = applicationStatus(app, {}, {agents:[{officialUrl:'https://example.com/agent'}]});
  assert.ok(status.agent); assert.equal(status.listed.length,0);
  const withRepo=importApplications([issue({number:501,title:'[Agent] Example',body:body.replace('_No response_','https://github.com/maker/agent')})])[0];
  assert.equal(withRepo.repo,'maker/agent'); assert.equal(withRepo.scope,null);
});
test('qualified all scopes are never turned into whole-repository requests', async () => {
  const { importApplications } = await getModule();
  for (const scope of ['all except private-skill', 'all\nexcept private-skill', 'all\n(except private-skill)']) assert.equal(importApplications([issue({body: issue().body.replace('one-skill',scope)})])[0].scope, null);
});
test('scope parsing considers every paragraph, including restrictions and more names', async () => {
  const { importApplications } = await getModule();
  assert.equal(importApplications([issue({body:issue().body.replace('one-skill','all\n\nexcept private-skill')})])[0].scope,null);
  assert.deepEqual(importApplications([issue({body:issue().body.replace('one-skill','first-skill\n\nsecond-skill')})])[0].scope,['first-skill','second-skill']);
});
test('editing the requested scope invalidates its previous review and feature association', async () => {
  const { importApplications, applicationStatus } = await getModule();
  const app = importApplications([issue()])[0];
  const changed = importApplications([issue({body:issue().body.replace('one-skill','one-skill\nsecond-skill')})])[0];
  assert.ok(app.scope_version); assert.notEqual(changed.scope_version,app.scope_version);
  const model={skills:[],editorial:{projects:[{id:'example',repo:'maker/project',review:'directory/reviews/example.md'}]}};
  const decision={feature_id:'example',scope_version:app.scope_version};
  assert.equal(applicationStatus(app,decision,model).review,'directory/reviews/example.md');
  const status=applicationStatus(changed,decision,model);assert.equal(status.review,null);assert.equal(status.placement,null);assert.equal(status.scope_changed,true);
});
test('one malformed project URL remains source-linked without blocking other applications', async () => {
  const { importApplications, validateApplications, applicationStatus } = await getModule();
  const apps = importApplications([issue(),issue({number:12,body:issue().body.replace('https://github.com/maker/project','github.com/maker/project')})]);
  assert.equal(apps.length,2);assert.equal(apps.find(a=>a.issue===12).repo,null);
  validateApplications({schema_version:1,updated:'2026-11-10',applications:apps});
  assert.equal(applicationStatus(apps.find(a=>a.issue===12), {}, {skills:[]}).listed.length,0);
});
test('site-only agent listings and features normalize root URL slashes', async () => {
  const {applicationStatus}=await getModule();
  const app={issue:600,repo:null,site:'https://example.com/',kind:'agent',scope:null,scope_version:'a'.repeat(64)};
  const model={agents:[{officialUrl:'https://example.com'}],editorial:{projects:[{id:'hosted',site:'https://example.com',status:'pending'}]}};
  const result=applicationStatus(app,{feature_id:'hosted',scope_version:app.scope_version},model);
  assert.ok(result.agent);assert.equal(result.placement.id,'hosted');
});
test('changing an agent request title does not hide a valid application form', async () => {
  const {importApplications}=await getModule();
  const body='### Request\n\nAdd\n\n### Official product URL\n\nhttps://example.com\n\n### Exact product and edition\n\nHosted';
  assert.equal(importApplications([issue({number:700,title:'Please consider my agent',body})]).length,1);
});
test('the three direct applicants have their approved editorial placement, independently of catalog scores', async () => {
  const { applicationStatus } = await getModule();
  const read = file => JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  const apps=read('directory/applications.json').applications;
  const decisions=read('directory/application-decisions.json');
  const model={skills:read('directory/skills.json').skills,editorial:read('directory/featured-projects.json')};
  for (const [issue,id] of [[375,'datacircle'],[374,'resume-claim-guard'],[371,'socratic-story-cartographer']]) {
    const result=applicationStatus(apps.find(a=>a.issue===issue), decisions[issue], model);
    assert.equal(result.placement?.id,id);
    assert.equal(result.review,`directory/reviews/2026-11-10-${id}.md`);
  }
});
