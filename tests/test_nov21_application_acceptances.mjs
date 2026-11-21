import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applicationStatus,validateApplications} from '../scripts/directory/applications.mjs';
const read = p => JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const register=validateApplications(read('directory/applications.json'));
const decisions=read('directory/application-decisions.json'), inc=read('directory/inclusions.json');
const cases=[
  [413,'StalkC/stalkchain-plugin',['trader-check','token-check','smart-money-radar']],
  [414,'jangtrinh/design-os',['design-os','design-os-designer']],
  [428,'kochetkov-ma/brewpage-publish-plugins',['brewpage-publish']],
  [430,'skillsforbots/grok-bot-skills',['bot-safety-rules-starter','reminder-basics']],
];
for (const [issue,repo,names] of cases) test('accepted scope #'+issue,()=>{
  const app=register.applications.find(a=>a.issue===issue);
  assert.equal(app?.repo,repo); assert.deepEqual(app.scope,names);
  const decision=decisions[issue]; assert.equal(decision?.scope_version,app.scope_version);
  assert.ok(decision.review); assert.ok(applicationStatus(app,decision).review);
  const review=readFileSync(new URL('../'+decision.review, import.meta.url),'utf8');
  for(const n of names) assert.ok(review.includes('/skills/'+n+'/SKILL.md'),n);
  if(issue===414) {
    assert.ok(!inc.repositories.includes(repo)); assert.equal(inc.skills[repo],undefined);
    assert.match(review,/editorial only/i); assert.match(review,/PolyForm Shield/);
  } else {
    assert.ok(inc.repositories.includes(repo)); assert.deepEqual(inc.skills[repo],names);
    assert.deepEqual(inc.skill_paths[repo],names.map(n=>'skills/'+n));
  }
});
