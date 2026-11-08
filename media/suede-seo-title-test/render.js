const { chromium } = require('playwright');
const path=require('path'); const {spawn}=require('child_process');
(async()=>{
  const dir=process.argv[2], out=process.argv[3], only=process.argv[4];
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await p.goto('file://'+path.join(dir,'index.html')); await p.waitForLoadState('networkidle'); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(500);
  const {TOTAL,FPS}=await p.evaluate(()=>({TOTAL:window.TOTAL,FPS:window.FPS}));
  if(only){ for(const t of only.split(',')){await p.evaluate(x=>render(x),+t); await p.screenshot({path:`${out}-${t}.png`});} await b.close(); return; }
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS),'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
  const N=Math.round(TOTAL*FPS);
  for(let i=0;i<N;i++){ await p.evaluate(x=>render(x),i/FPS); const buf=await p.screenshot({type:'jpeg',quality:95}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close(); console.log('frames',N);
})();
