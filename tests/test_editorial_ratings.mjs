import test from 'node:test';
import assert from 'node:assert/strict';
import { editorialRating } from '../scripts/directory/editorial-ratings.mjs';
test('owner editorial rating preserves independently computed grade and score', () => {
 const s = {id:'klingai-tech/claude-plugin/kling-ai',score:72,grade:'C'};
 const r=editorialRating(s,{[s.id]:{score:88,date:'2026-11-14',basis:'Owner editorial assessment',source_revision:'f470369fb0c275edcd1f10eae23341fb0a8773ec'}});
 assert.equal(r.score,88); assert.equal(r.grade,'B'); assert.equal(s.score,72); assert.equal(s.grade,'C');
 assert.equal(editorialRating({id:'unrelated/skill'},{}),null);
});
test('editorial records require traceable valid metadata', () => {
 for(const record of [{score:100},{score:88},{score:88,date:'2026-11-14',basis:'',source_revision:'f'.repeat(40)}]) assert.throws(()=>editorialRating({id:'x'},{x:record}));
});

test('Kling intake keeps all three requested editorial values and service context', async () => {
 const {readFileSync}=await import('node:fs');
 const data=JSON.parse(readFileSync('directory/skills.json','utf8'));
 const overrides=JSON.parse(readFileSync('directory/editorial-ratings.json','utf8'));
 const {costLane}=await import('../scripts/directory/facets.mjs');
 const rows=data.skills.filter(s=>s.repo==='klingai-tech/claude-plugin');
 assert.equal(rows.length,3);
 assert.deepEqual(rows.map(s=>editorialRating({id:s.repo+'/'+s.slug},overrides).score),[88,89,88]);
 assert.deepEqual(rows.map(s=>s.score),[72,80,80]);
 for(const s of rows){assert.equal(s.featured,undefined);assert.equal(costLane(s),'free-with-service');}
});

test('published Kling rows and reports distinguish editorial ratings from measured scores', async()=>{
 const {readFileSync}=await import('node:fs');
 const html=readFileSync('docs/directory/klingai-tech/claude-plugin/index.html','utf8');
 for(const [slug,score,computed] of [['kling-ai',88,72],['kling-ai-generate-image',89,80],['kling-ai-generate-video',88,80]]) {
  const report=JSON.parse(readFileSync(`docs/directory/klingai-tech/claude-plugin/${slug}/report.json`,'utf8'));
  assert.equal(report.editorial_rating.score,score);assert.equal(report.quality.score,computed);
  assert.match(html,new RegExp(`${score}/100 · B · Editorial`));
 }
 assert.match(readFileSync('docs/assets/directory.js','utf8'),/skill\.editorial_rating/);
});
