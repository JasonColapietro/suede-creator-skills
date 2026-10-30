import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {build} from '../scripts/build-directory-site.mjs';
import {loadAgentCatalog} from '../scripts/directory/agents-model.mjs';
const root=new URL('..',import.meta.url).pathname;
const read=p=>fs.readFileSync(path.join(root,'docs/directory/agents',p),'utf8');
test('agent routes are public, separate and evidence-scoped',()=>{
 for(const p of ['', 'ungraded/','goose/','cline/','devin/','methodology/','submit/']){
  const html=read(p+'index.html');
  assert.match(html,new RegExp(`rel="canonical" href="https://suedeai.directory/agents/${p}"`));
  assert.match(html,/index, follow/);assert.doesNotMatch(html,/aggregateRating|"ratingValue"/);
 }
 const hub=read('index.html');assert.match(hub,/3 products/);assert.match(hub,/3 editions/);
 assert.match(hub,/Documentation/);assert.match(hub,/Repository evidence/);assert.match(hub,/Hosted disclosures/);
 assert.match(hub,/Not tested/);assert.match(hub,/Not assessed/);assert.match(hub,/Incomplete/);
 const cline=read('cline/index.html');assert.match(cline,/10\/10/);assert.match(cline,/auto-approve/);
 assert.match(cline,/Report version <code>[a-f0-9]{12}<\/code>/);
});
test('agent index has one row per edition and does not enter skill search',()=>{
 const index=JSON.parse(read('search-index.json'));const m=loadAgentCatalog(root);
 assert.equal(index.kind,'agent');assert.equal(index.editions.length,m.editions.length);
 assert.ok(index.editions.every(e=>e.url.startsWith('/directory/agents/')));
 const skill=JSON.parse(fs.readFileSync(path.join(root,'docs/directory/search-index.json')));
 assert.ok((skill.skills||skill).every(e=>!e.url?.startsWith('/directory/agents/')));
 assert.equal(index.editions.find(e=>e.product_id==='devin').assessments.repository.score,null);
});
test('standalone agent reports rehash and retain receipt identity and untested states',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'agent-site-'));
 try{build(out);for(const id of ['goose','cline','devin']){
  const report=JSON.parse(fs.readFileSync(path.join(out,'agents',id,'report.json')));
  const original=JSON.parse(read(id+'/report.json'));
  const {report_version,...body}=report;
  assert.equal(report.kind,'agent');assert.equal(report_version,createHash('sha256').update(JSON.stringify(body)).digest('hex'));
  assert.equal(report.listing_url,`https://suedeai.directory/agents/${id}/`);
  assert.deepEqual(report.evidence,original.evidence);
  assert.ok(report.editions.every(e=>e.performance.status==='not_tested'&&e.security.status==='not_assessed'));
  assert.match(fs.readFileSync(path.join(out,'agents',id,'index.html'),'utf8'),new RegExp(report_version.slice(0,12)));
  assert.ok(fs.readFileSync(path.join(out,'sitemap.xml'),'utf8').includes(report.listing_url));
 }
 assert.ok(fs.existsSync(path.join(out,'agents/catalog.schema.json')));
 const ungraded=JSON.parse(read('ungraded/search-index.json'));
 const ungradedHtml=fs.readFileSync(path.join(out,'agents/ungraded/index.html'),'utf8');
 assert.equal(ungraded.kind,'ungraded-agent');
 assert.match(ungradedHtml,new RegExp(`${ungraded.entries.length} ungraded agents`));
 assert.match(ungradedHtml,/rel="canonical" href="https:\/\/suedeai.directory\/agents\/ungraded\/"/);
 assert.ok(fs.readFileSync(path.join(out,'sitemap.xml'),'utf8').includes('https://suedeai.directory/agents/ungraded/'));
 assert.ok(fs.existsSync(path.join(out,'agents/ungraded/catalog.schema.json')));
 assert.doesNotMatch(ungradedHtml,/class="agent-rating|ratingValue|aggregateRating/);
 }finally{fs.rmSync(out,{recursive:true,force:true});}
});

test('agent rendering ages reviews, escapes content and orders each product before its editions', async()=>{
 const {renderAgents}=await import('../scripts/directory/agents-render.mjs');
 const model=loadAgentCatalog(root);const cline=model.products.find(p=>p.id==='cline');
 cline.name='Cline <script>alert(1)</script>';
 const aaa=structuredClone(model.editions.find(e=>e.product_id==='cline'));aaa.id='aaa';aaa.name='AAA';
 const cli=model.editions.find(e=>e.product_id==='cline');cli.product_name=cline.name;aaa.product_name=cline.name;
 model.editions.push(aaa);cline.editions.push(aaa);
 const files=renderAgents(model,{root,page:o=>o.h1Html+o.body+'<script>'+JSON.stringify(o.jsonld).replace(/</g,'\\u003c')+'</script>',crumbs:()=>({html:'',ld:{}}),rel:(h,p)=>p,url:p=>'https://skills.suedeai.ai/'+p,setKeywords:(h,k)=>k,pageDate:'2026-12-01',reviewDate:'2026-12-01'});
 const hub=files.get('directory/agents/index.html');
 assert.match(hub,/Review overdue/);assert.match(files.get('directory/agents/cline/index.html'),/Review overdue/);
 assert.ok(hub.indexOf('data-edition-name="AAA"')<hub.indexOf('data-edition-name="CLI"'));
 assert.match(hub,/Cline &lt;script&gt;/);assert.doesNotMatch(hub,/<script>alert\(1\)/);
 assert.match(hub,/"@type":"CollectionPage"/);assert.match(hub,/"@type":"ItemList"/);
});
