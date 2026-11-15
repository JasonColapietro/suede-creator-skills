import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => JSON.parse(fs.readFileSync(new URL('../'+p, import.meta.url)));
const ids=['resume-tribunal','siebly-crypto-exchange-api','deed-page','tecadrise-bot'];
test('November 13 applicants have pinned editorial features and neutral badges',()=>{
 const catalog=read('directory/featured-projects.json');
 for(const id of ids){
  const matches=catalog.projects.filter(p=>p.id===id);assert.equal(matches.length,1,id);const p=matches[0];
  assert.match(p.commit,/^[a-f0-9]{40}$/);assert.ok(p.capabilities.length>=3);assert.ok(fs.existsSync(new URL('../'+p.review,import.meta.url)));
  assert.equal(p.score,undefined);assert.equal(p.grade,undefined);assert.equal(p.status,undefined);
 }
 assert.equal(catalog.featured_badge.status,'live');
});
test('TecAdRise is discoverable without inventing a skill grade or xAI affiliation',()=>{
 const agents=read('directory/agents/ungraded.json');const entry=agents.entries.find(e=>e.id==='tecadrise-bot');assert.ok(entry);assert.deepEqual(entry.deployments,['local']);assert.equal(entry.sourceAvailability,'public-source');
 const grok=read('directory/kinds.json').kinds.find(k=>k.id==='grok');const section=grok.sections.find(s=>s.id==='alternatives');assert.ok(section);const bot=section.entries.find(e=>e.id==='tecadrise-bot');assert.equal(bot.official,false);assert.match(bot.summary,/Cursor SDK or BYOK/);
});
test('Public GitHub applications point to their exact editorial features',()=>{
 const apps=read('directory/applications.json');const decisions=read('directory/application-decisions.json');
 for(const n of [390,384,378]){const app=apps.applications.find(x=>x.issue===n);assert.ok(app);assert.equal(decisions[n].scope_version,app.scope_version);assert.ok(ids.includes(decisions[n].feature_id));}
});
