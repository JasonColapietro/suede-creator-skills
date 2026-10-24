import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const skill='suede-seo-audit';
const files=['SKILL.md','references/offline-tools.md','scripts/seo-review.mjs',
 'scripts/fixtures/pages.json','scripts/fixtures/serp.json',
 ...['audit','page-technical','metadata-drift','merchant-schema','offline-reports','serp-overlap'].map(n=>`scripts/lib/${n}.mjs`)];
const run=(cmd,args,cwd=root)=>spawnSync(cmd,args,{cwd,encoding:'utf8',maxBuffer:10_000_000});
test('npm and Python stages contain byte-identical offline runtime, references and fixtures',()=>{
 for(const builder of ['build-mcp-package.mjs','build-pypi-package.mjs']) {
  const r=run(process.execPath,[`scripts/${builder}`,'--check']);
  assert.equal(r.status,0,r.stderr);
 }
 const sourceRoot=path.join(root,'skills');
 const runtimeFiles=fs.readdirSync(sourceRoot,{recursive:true,withFileTypes:true})
  .filter(e=>e.isFile() && e.name!=='.DS_Store' && e.name!=='CARD.md' && !e.name.endsWith('.pyc') && !e.parentPath.split(path.sep).includes('__pycache__'))
  .map(e=>path.relative(sourceRoot,path.join(e.parentPath,e.name)));
 for(const stage of ['dist-npm/skills' ,'pypi/src/suede_creator_skills/skills']) {
  for(const rel of runtimeFiles) assert.deepEqual(fs.readFileSync(path.join(root,stage,rel)),fs.readFileSync(path.join(sourceRoot,rel)),`${stage}/${rel}`);
  for(const file of files) assert.deepEqual(fs.readFileSync(path.join(root,stage,skill,file)),fs.readFileSync(path.join(root,'skills',skill,file)),`${stage}/${file}`);
  const cli=path.join(root,stage,skill,'scripts/seo-review.mjs');
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'seo-package-'));
  try {
   const r=run(process.execPath,[cli,'audit','--input',path.join(root,stage,skill,'scripts/fixtures/pages.json'),'--out',path.join(temp,'report')]);
   assert.equal(r.status,0,r.stderr);
   assert.ok(fs.existsSync(path.join(temp,'report','metadata-snapshot.json')));
  } finally {fs.rmSync(temp,{recursive:true,force:true});}
 }
 for(const file of ['NOTICE.md','LICENSE']) assert.deepEqual(fs.readFileSync(path.join(root,'dist-npm',file)),fs.readFileSync(path.join(root,file)));
 const npm=process.platform==='win32'?'npm.cmd':'npm';
 const cache=fs.mkdtempSync(path.join(os.tmpdir(),'seo-npm-cache-'));
 let packed;
 try { packed=run(npm,['pack','--dry-run','--json','--ignore-scripts','--cache',cache],path.join(root,'dist-npm')); }
 finally { fs.rmSync(cache,{recursive:true,force:true}); }
 assert.equal(packed.status,0,packed.stderr);
 const listing=JSON.parse(packed.stdout)[0].files.map(f=>f.path);
 for(const file of files) assert.ok(listing.includes(`skills/${skill}/${file}`),`npm tarball missing ${file}`);
 assert.ok(listing.includes('NOTICE.md'));
 assert.ok(listing.some(p=>p.startsWith('licenses/')));
});
