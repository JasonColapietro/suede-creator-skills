// Follow the repository's existing isolated headless-browser QA convention.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.DIRECTORY_PLAYWRIGHT_MODULE || 'playwright');
const root=fileURLToPath(new URL('../docs/',import.meta.url));
const output=process.env.SEO_SCREENSHOTS || '/tmp/suede-seo-browser';
fs.mkdirSync(output,{recursive:true});
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const target=path.resolve(root,'.'+decodeURIComponent(url.pathname),url.pathname.endsWith('/')?'index.html':'');
 if(!target.startsWith(root)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.DIRECTORY_CHROMIUM?{executablePath:process.env.DIRECTORY_CHROMIUM}:{}),args:['--no-sandbox']});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:1000});
  for(const [name,url,selector,count] of [
   ['skill','/skills/suede-seo-audit.html','.seo-toolkit-gallery',6],
   ['changelog','/#changelog','.clog-item:first-child',1]]) {
   await page.goto(`http://127.0.0.1:${server.address().port}${url}`);
   const section=page.locator(selector);await section.scrollIntoViewIfNeeded();
   await page.evaluate(()=>document.fonts.ready);
   const images=section.locator('img[src*="seo-toolkit/"]');assert.equal(await images.count(),count);
   for(const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(el=>el.decode());
    const state=await image.evaluate(el=>({alt:el.alt,w:el.naturalWidth,h:el.naturalHeight,box:el.getBoundingClientRect().toJSON(),fit:getComputedStyle(el).objectFit}));
    assert.ok(state.alt.length>40);assert.ok(Math.abs(state.w/state.h-0.8)<0.002);
    assert.ok(Math.abs(state.box.width/state.box.height-0.8)<0.01,'artwork must not crop');
    assert.equal(state.fit,'contain');
   }
   const bounds=await section.boundingBox();
   assert.ok(bounds.x>=0 && bounds.x+bounds.width<=width+1,'artwork section escapes viewport');
   await section.scrollIntoViewIfNeeded();
   await page.waitForFunction(selector=>{ let el=document.querySelector(selector); while(el){if(Number(getComputedStyle(el).opacity)<0.99)return false;el=el.parentElement;}return true;},selector);
   await section.screenshot({animations:'disabled',path:path.join(output,`${name}-${width}.png`),style:'.nav, .skip-link, .back-top { visibility: hidden !important; }'});
  }
 }
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 const newest=page.locator('.clog-item').first();
 const status=await newest.getAttribute('data-status') || 'released';
 assert.equal(await page.locator('.clog-item[data-status="prepared"]').count(),status==='prepared'?1:0);
 assert.match(await newest.textContent(),status==='prepared'?/0\.19\.3 prepared/:/0\.19\.3 (released|landed)/);
 assert.match(await page.locator('#hero-shiplog').textContent(),/Five offline SEO tools/);
 assert.deepEqual(errors,[]);
 console.log('SEO site QA passed: desktop/mobile, seven image placements, accurate release state, no artwork clipping/overflow or page errors.');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
