const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.FEATURED_URL||'http://127.0.0.1:8126';
const out=path.resolve(process.env.FEATURED_EVIDENCE||'output/featured-projects');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage(); page.setDefaultTimeout(10000);
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const results=[];const check=(condition,name)=>{assert.ok(condition,name);results.push(name);console.log('PASS '+name)};
 const shot=async name=>{await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(out,name+'.png')})};
 try{
  if(!process.env.FEATURED_URL&&!fs.existsSync(path.join(out,'before-directory-desktop.png'))){await page.goto('https://skills.suedeai.ai/directory/');await page.locator('h1').waitFor();console.log('Before page:',await page.title(),await page.locator('[data-results-status]').allTextContents());await shot('before-directory-desktop')}
  await page.goto(base+'/directory/');await page.locator('.featured-callout').waitFor();
  await shot('after-directory-desktop');await page.locator('.featured-callout').click();
  check(new URL(page.url()).pathname==='/directory/featured/','directory entry opens featured page');
  await shot('featured-desktop');
  check(await page.locator('.featured-project').count()===2,'exactly two accepted projects');
  check(await page.locator('#appie .featured-work a').count()===3,'Appie links exactly three skill pages');
  for(const a of await page.locator('#appie .featured-work a').all()){
    const href=await a.getAttribute('href');const response=await context.request.get(new URL(href,page.url()).href);check(response.ok(),'Appie route resolves: '+href)
  }
  const copy=page.locator('[data-copy-target=coalwash-commands]');
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copiedCommands=text}}}));
  await copy.focus(); await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[data-copy-target=coalwash-commands]').textContent==='Copied');
  check(await copy.textContent()==='Copied','keyboard activates command copy');
  check(await page.evaluate(()=>window.__copiedCommands)==='claude plugin marketplace add TheColliery/CoalWash\nclaude plugin install coalwash@coalwash','copy handler receives only required plugin commands');
  const disclosure=page.locator('#coalwash summary');await disclosure.focus();await page.keyboard.press('Enter');
  check(await disclosure.evaluate(e=>e.parentElement.open),'keyboard opens coverage disclosure');
  check(await page.locator('#coalwash details p').isVisible(),'coverage details visible');
  check(await disclosure.evaluate(e=>getComputedStyle(e).outlineStyle!=='none'),'keyboard focus is visible');
  await page.locator('#coalwash').scrollIntoViewIfNeeded();await shot('featured-coalwash-desktop');
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow at '+width);
   const small=await page.locator('.featured-jump a,.featured-work a,.featured-project-footer a,.featured-install button,.featured-install summary,.featured-submit').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().height<44).map(e=>e.textContent));
   check(!small.length,'44px project controls at '+width);
  }
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/directory/featured/');await shot('featured-mobile');
  await page.getByRole('link',{name:'CoalWash',exact:true}).click();await shot('featured-coalwash-mobile');
  await page.locator('#coalwash .featured-install').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollBy(0,-88));await shot('featured-install-mobile');
  await page.emulateMedia({reducedMotion:'reduce'});check(await page.locator('#appie').isVisible(),'content remains available with reduced motion');
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const staticPage=await nojs.newPage();
  await staticPage.goto(base+'/directory/featured/');check(await staticPage.locator('#coalwash-commands').textContent()==='claude plugin marketplace add TheColliery/CoalWash\nclaude plugin install coalwash@coalwash','install text available without JavaScript');
  await staticPage.locator('#coalwash summary').click();check(await staticPage.locator('#coalwash details p').isVisible(),'coverage disclosure works without JavaScript');await nojs.close();
  check(!errors.length,'no browser script errors');
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({base,checks:results.length,results},null,2)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
