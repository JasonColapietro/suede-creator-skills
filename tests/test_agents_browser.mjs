import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.DIRECTORY_PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../docs/',import.meta.url));
const output=process.env.DIRECTORY_SCREENSHOTS||'/tmp/suede-agent-browser';
fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const target=path.resolve(root,'.'+pathname,pathname.endsWith('/')?'index.html':'');
 if(!target.startsWith(root)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2'})[path.extname(target)]||'application/octet-stream');fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,...(process.env.DIRECTORY_CHROMIUM?{executablePath:process.env.DIRECTORY_CHROMIUM}:{}),args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1080}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const visible=()=>page.locator('.agent-card:visible');
const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
try{
 await page.goto(base+'/directory/agents/');await page.locator('#agent-filters').waitFor({state:'visible'});
 assert.equal(await visible().count(),3);await noOverflow();
 const tabContrast=await page.locator('.agent-tabs [aria-current]').evaluate(el=>{
  const luminance=color=>{const channels=color.match(/\d+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];};
  const style=getComputedStyle(el),a=luminance(style.color),b=luminance(style.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 });
 assert.ok(tabContrast>=4.5,'active Agents tab must have readable text contrast');
 await page.locator('input[name=q]').fill('Cline');assert.equal(await visible().count(),1);
 assert.equal(new URL(page.url()).searchParams.get('q'),'Cline');const saved=page.url();
 await page.goto(saved);assert.equal(await visible().count(),1);
 await page.locator('input[name=q]').fill('<script>window.pwned=true</script>');assert.equal(await visible().count(),0);assert.equal(await page.evaluate(()=>window.pwned),undefined);assert.equal(await page.locator('#agent-empty').isVisible(),true);
 await page.getByRole('button',{name:'Reset',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.agent-card:not([hidden])').length===3);
 await page.locator('select[name=sort]').selectOption('hosted');assert.equal(await visible().count(),1);assert.match(await visible().textContent(),/Devin/);assert.match(await page.locator('#agent-sort-note').textContent(),/applicable editions only/);
 await page.locator('select[name=sort]').selectOption('repository');assert.equal(await visible().count(),2);
 await page.locator('select[name=sort]').selectOption('documentation');assert.match(await visible().first().textContent(),/Cline/);
 await page.locator('select[name=deployment]').selectOption('hosted');assert.equal(await visible().count(),1);
 await page.locator('select[name=source]').selectOption('public');assert.equal(await visible().count(),0);
 await page.getByRole('button',{name:'Reset',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.agent-card:not([hidden])').length===3);
 await page.locator('input[name=q]').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('select[name=task]').evaluate(el=>el===document.activeElement),true);
 await page.screenshot({path:path.join(output,'agents-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await noOverflow();await page.screenshot({path:path.join(output,'agents-mobile.png'),fullPage:true});
 await page.goto(base+'/directory/agents/cline/');await page.locator('.agent-checks summary').first().click();await noOverflow();assert.match(await page.locator('.agent-edition').textContent(),/auto-approve by default/);
 await page.screenshot({path:path.join(output,'cline-mobile.png'),fullPage:true});
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const fallback=await nojs.newPage();await fallback.goto(base+'/directory/agents/?q=Devin');assert.equal(await fallback.locator('.agent-card').count(),3);assert.equal(await fallback.locator('#agent-filters').isVisible(),false);await nojs.close();
 const failed=await browser.newPage();await failed.route('**/agents.js',route=>route.abort());await failed.goto(base+'/directory/agents/');assert.equal(await failed.locator('.agent-card:visible').count(),3);await failed.close();
 assert.deepEqual(errors,[]);console.log('Agent browser checks passed: search, URL restoration, scoped sorting, filters, keyboard, mobile, no-JS and script failure fallback.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
