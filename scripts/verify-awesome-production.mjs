// Read-only verification of the approved Awesome release on the public site.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
const site='https://skills.suedeai.ai';
const out=process.env.DIRECTORY_SCREENSHOTS || '/tmp/awesome-production-evidence';
fs.mkdirSync(out,{recursive:true});
const requests=[];
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
async function get(route){
 const url=new URL(route,site);
 assert.equal(url.origin,site);
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
 const body=await response.text();
 requests.push({path:url.pathname,status:response.status,sha256:digest(body),etag:response.headers.get('etag')});
 assert.equal(response.status,200,url.href);
 return body;
}
for(const route of ['/','/skills/','/guide.html']){
 const file=path.join('docs',route,route.endsWith('/')?'index.html':'');
 const expected=fs.readFileSync(file,'utf8');
 for(let attempt=0;attempt<6;attempt++){
  const actual=await get(route);
  if(actual===expected)break;
  if(attempt===5)assert.equal(digest(actual),digest(expected),'deployed page must match the approved source: '+route);
  console.log('Waiting for canonical deployed page: '+route);
  await new Promise(resolve=>setTimeout(resolve,10000));
 }
}
const index=JSON.parse(await get('/directory/search-index.json'));
assert.deepEqual(index,JSON.parse(fs.readFileSync('docs/directory/search-index.json')));
assert.equal(index.length,3794);
assert.equal(new Set(index.map(s=>s.repo.toLowerCase())).size,158);
const reportRoute='/directory/pbakaus/impeccable/impeccable/report.json';
const report=JSON.parse(await get(reportRoute));
assert.deepEqual(report,JSON.parse(fs.readFileSync('docs'+reportRoute)));
assert.equal(report.quality.score,86);
assert.equal(report.quality.grade,'B');
assert.equal(report.methodology.rubric_total,100);
assert.equal(report.methodology.published_cap,99);
assert.equal(report.security_scan_status,'not_scanned');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const cases=[];
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:1000}});
  for(const [name,route] of [['home','/'],['skills','/skills/'],['guide','/guide.html']]){
   const response=await page.goto(site+route);
   assert.equal(response.status(),200);
   await page.evaluate(()=>document.fonts.ready);
   const card=page.locator('#hero-shiplog');
   assert.equal(await card.locator('.hero-spark span').count(),22);
   assert.match(await card.innerText(),/432 commits/);
   assert.match(await card.getAttribute('aria-label'),/432 commits/);
   assert.ok(await card.evaluate(el=>el.scrollWidth<=el.clientWidth+1),name+' card overflow at '+width);
   await card.screenshot({path:path.join(out,name+'-'+width+'.png')});
   if(name==='home'){
    assert.equal(await page.locator('.clog-spark span').count(),22);
    await page.locator('.clog-spark').screenshot({path:path.join(out,'activity-'+width+'.png')});
   }
   cases.push({page:route,width,bars:22,commits:432,card_overflow:false});
  }
  await page.close();
 }
}finally{await browser.close();}
const receipt={passed:true,checked_at:new Date().toISOString(),site,deployed_commit:process.env.DIRECTORY_DEPLOYED_SHA,verification_commit:process.env.GITHUB_SHA,catalog:'https://github.com/JasonColapietro/suede-creator-skills/tree/main/awesome',skills:3794,repositories:158,impeccable:'86/B',cases,requests,external_directory_skill_code_executed:false};
fs.writeFileSync(path.join(out,'verification-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({passed:true,site,skills:3794,repositories:158,browser_cases:cases.length,screenshots:8,deployed_commit:receipt.deployed_commit}));
