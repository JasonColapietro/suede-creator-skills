import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=new URL('../scripts/directory/agents-ungraded.mjs',import.meta.url);
const model=fs.existsSync(url)?await import(url):{};
const fixture=()=>({schema_version:1,generated:'2026-10-27',entries:[{id:'example',name:'Example',summary:'An agent that edits code in a local workspace.',tasks:['coding'],deployments:['local','self-hosted'],sourceAvailability:'public-source',officialUrl:'https://example.com/agent',repositoryUrl:'https://github.com/example/agent',sourceUrls:['https://example.com/agent','https://github.com/example/agent'],observedAt:'2026-10-27'}]});
test('ungraded catalog keeps discovery facts without assessment fields',()=>{
 assert.equal(typeof model.validateUngradedCatalog,'function');
 const input=fixture();const result=model.validateUngradedCatalog(input,[]);
 assert.deepEqual(result.entries,input.entries);
 assert.doesNotMatch(JSON.stringify(result.entries),/"(?:score|ratings|security|verified|performance)"/);
});
test('ungraded records reject invented grades, badges, missing evidence and future dates',()=>{
 for(const change of [e=>e.id=123,e=>e.score=10,e=>e.verified=true,e=>e.security='safe',e=>e.sourceUrls=[],e=>e.observedAt='2026-10-28',e=>e.observedAt='2026-02-31',e=>e.repositoryUrl=null,e=>e.tasks=['Coding'],e=>e.sourceAvailability='open-source']){
  const input=fixture();change(input.entries[0]);assert.throws(()=>model.validateUngradedCatalog(input,[]));
 }
});
test('public documentation article query parameters are retained while credential parameters reject',()=>{
 const input=fixture();input.entries[0].sourceUrls=['https://help.salesforce.com/s/articleView?id=service.article&language=en_US&type=5'];
 assert.deepEqual(model.validateUngradedCatalog(input).entries[0].sourceUrls,input.entries[0].sourceUrls);
 input.entries[0].sourceUrls=['https://example.com/docs?access_token=secret'];assert.throws(()=>model.validateUngradedCatalog(input));
});
test('real product discovery retains documented local and self-hosted access modes',()=>{
 const catalog=model.loadUngradedCatalog(new URL('..',import.meta.url).pathname);
 assert.ok(catalog.entries.find(e=>e.id==='factory-droid').deployments.includes('local'));
 assert.ok(catalog.entries.find(e=>e.id==='qodo-git').deployments.includes('self-hosted'));
});
test('ungraded catalog rejects unsafe URLs and duplicate products across both directories',()=>{
 for(const value of ['javascript:alert(1)','http://example.com','https://user:secret@example.com','https://127.0.0.1','https://example.local','https://example.com/?token=secret']){
  const input=fixture();input.entries[0].officialUrl=value;assert.throws(()=>model.validateUngradedCatalog(input,[]));
 }
 for(const change of [e=>{},e=>{e.id='different';},e=>{e.id='different';e.name='Different';e.officialUrl+='/'},e=>{e.id='different';e.name='Different';e.officialUrl='https://different.example.com';e.repositoryUrl='https://github.com/EXAMPLE/AGENT.git/';}]){
  const input=fixture();const extra=structuredClone(input.entries[0]);change(extra);input.entries.push(extra);assert.throws(()=>model.validateUngradedCatalog(input,[]),/duplicate/i);
 }
 for(const p of [{id:'example',name:'Existing',url:'https://existing.com',editions:[]},{id:'existing',name:'EXAMPLE',url:'https://existing.com',editions:[]},{id:'existing',name:'Existing',url:'https://example.com/agent/',editions:[]},{id:'existing',name:'Existing',url:'https://existing.com',editions:[{source:{repository:'example/agent'}}]}])assert.throws(()=>model.validateUngradedCatalog(fixture(),[p]),/duplicate/i);
});
test('ungraded discovery renders searchable static facts and source dates without ratings',async()=>{
 const {renderAgents}=await import('../scripts/directory/agents-render.mjs');
 const {loadAgentCatalog}=await import('../scripts/directory/agents-model.mjs');
 const root=new URL('..',import.meta.url).pathname;
 const catalog=fixture();catalog.entries[0].name='Example <script>alert(1)</script>';
 const files=renderAgents(loadAgentCatalog(root),{root,ungraded:catalog,page:o=>o.h1Html+o.body+'<script>'+JSON.stringify(o.jsonld).replace(/</g,'\\u003c')+'</script>',crumbs:()=>({html:'',ld:{}}),rel:(h,p)=>p,url:p=>'https://skills.suedeai.ai/'+p,setKeywords:(h,k)=>k,pageDate:'2026-10-27'});
 const html=files.get('directory/agents/ungraded/index.html');
 assert.ok(html,'ungraded page is generated');
 assert.match(html,/1 ungraded agent/);assert.match(html,/Example &lt;script&gt;/);assert.doesNotMatch(html,/<script>alert\(1\)/);
 assert.match(html,/Source checked 2026-10-27/);assert.match(html,/id="ungraded-filters"/);assert.match(html,/class="ungraded-card"/);
 assert.match(html,/"@type":"CollectionPage"/);assert.match(html,/"numberOfItems":1/);
 assert.doesNotMatch(html,/agent-rating|ratingValue|aggregateRating|verified-badge|security-badge|\d+\/10/);
 const index=JSON.parse(files.get('directory/agents/ungraded/search-index.json'));
 assert.equal(index.kind,'ungraded-agent');assert.equal(index.entries.length,1);assert.deepEqual(index.entries[0].sourceUrls,catalog.entries[0].sourceUrls);
 assert.match(files.get('directory/agents/index.html'),/Browse 1 ungraded agent/);
});
