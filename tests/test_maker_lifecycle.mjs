import test from 'node:test';
import assert from 'node:assert/strict';
import { createMakerOwnerService } from '../scripts/directory/maker-owner-v2.mjs';

function fixture(canExport) {
  let row=null, version=0, owner=1, check;
  const archive=[];
  const store={
    canExport,
    async transact(_id, fn){const result=fn(structuredClone(row),version);if('write' in result){row=structuredClone(result.write);version++;}return structuredClone(result.result);},
    async pendingListings(){return ['example'];},
    async recover(_id,expected,next,audit){if(expected!==version)return false;archive.push({row,audit});row=structuredClone(next);version++;return true;},
  };
  const service=createMakerOwnerService({enabled:true,site:'directory',projects:[{id:'example',repo:'old/example'}],store,
    isModerator:async user=>user===99,github:{user:async session=>session,repository:async()=>{if(check)await check();return {id:20,private:false,full_name:'old/example',owner:{id:owner,type:'User'}};}}});
  return {service,archive,transfer(){owner=2;},check(fn){check=fn;}};
}

test('two edit tabs cannot silently replace each other or turn withdrawal into an unrelated approval', async()=>{
 const {service:s}=fixture(); await s.claim(1,'example');
 const A=await s.get(1,'example'),B=await s.get(1,'example');
 const v=await s.submit(1,'example',{statement:'A'},A.editVersion);
 await assert.rejects(s.submit(1,'example',{statement:'B'},B.editVersion),{code:'edit_conflict'});
 await s.review(99,'example',v.version,'approve');
 await assert.rejects(s.withdraw(1,'example',v.version),{code:'edit_conflict'});
});

test('read after provider wait suppresses an approval withdrawn while export was in flight', async()=>{
 const f=fixture(),s=f.service;await s.claim(1,'example');
 const v=await s.submit(1,'example',{statement:'approved first'},0);await s.review(99,'example',v.version,'approve');
 const w=await s.withdraw(1,'example',(await s.get(1,'example')).editVersion);
 let hold,seen;const waiting=new Promise(r=>{seen=r;});const release=new Promise(r=>{hold=r;});
 f.check(async()=>{f.check(null);seen();await release;});
 const old=s.getApproved('example');await waiting;await s.review(99,'example',w.version,'approve');hold();
 assert.equal(await old,null);
});

test('a moderator can rebind verified transferred control without handing the successor old state',async()=>{
 const {service:s,archive,transfer}=fixture();await s.claim(1,'example');
 const old=await s.submit(1,'example',{statement:'old private draft'},0);await s.ask(1,'example',{kind:'re-review',note:'old private request'});
 transfer();await assert.rejects(s.claim(2,'example'),{code:'listing_already_claimed'});
 assert.equal((await s.inbox(99,'example'))[0].ownership,'stale');
 const review=await s.getForReview(99,'example');assert.equal(review.revision,null);assert.deepEqual(review.requests,[]);
 const form={expected:review.recovery.expected,nominee:2,evidence:'staff-case-17'};
 await assert.rejects(s.recover(1,'example',form),{code:'moderator_required'});
 await s.recover(99,'example',form);assert.equal(archive.length,1);
 assert.equal(archive[0].row.revision.profile.statement,'old private draft');
 assert.equal(archive[0].audit.moderator,99);
 await assert.rejects(s.recover(99,'example',form),{code:'recovery_conflict'});
 const fresh=await s.get(2,'example');assert.equal(fresh.claimed,true);assert.equal(fresh.revision,null);assert.deepEqual(fresh.requests,[]);
 const prepared=await s.submit(2,'example',{statement:'New owner'},fresh.editVersion);
 assert.ok(prepared.version>old.version);
 await assert.rejects(s.review(99,'example',old.version,'approve'),{code:'stale_revision'});
});

test('provider outage hides prior private state and refuses recovery without proof',async()=>{
 const f=fixture(),s=f.service;await s.claim(1,'example');await s.submit(1,'example',{statement:'private'},0);f.transfer();
 const {recovery}=await s.getForReview(99,'example');
 f.check(async()=>{throw new Error('provider timeout');});
 const queue=await s.getForReview(99,'example');assert.equal(queue.ownership,'unavailable');assert.equal(queue.recovery,null);assert.equal(queue.revision,null);
 await assert.rejects(s.recover(99,'example',{expected:recovery.expected,nominee:2,evidence:'case-1'}));
 assert.equal(f.archive.length,0);
});

test('provider moves are rechecked only for a bound repository by previously verified immutable ID',async()=>{
 const {fetchPublicMakerRepository,fetchMakerRepositoryById}=await import('../scripts/directory/maker-runtime-v2.mjs');
 const urls=[];
 const provider=async (url,opts)=>{urls.push([url,opts.redirect]);return url.includes('/repos/')
   ? new Response('',{status:301,headers:{location:'https://untrusted.invalid/'}})
   : Response.json({id:20,private:false,full_name:'new/example',owner:{id:2,type:'User'}});};
 const g={user:async x=>x,repository:(name,opts)=>fetchPublicMakerRepository(name,provider,opts),repositoryById:id=>fetchMakerRepositoryById(id,provider)};
 const row={owner:1,repoId:20,githubOwnerType:'User',githubOwnerId:1};
 const s=createMakerOwnerService({enabled:true,site:'directory',projects:[{id:'example',repo:'old/example'}],github:g,isModerator:async x=>x===99,
   store:{transact:async(_id,fn)=>fn(row,1).result}});
 const q=await s.getForReview(99,'example');assert.equal(q.recovery.nominee,2);
 assert.deepEqual(urls,[['https://api.github.com/repos/old/example','manual'],['https://api.github.com/repositories/20','error']]);
});

test('HTTP submit and withdraw use an explicit version envelope; unversioned client must refresh',async()=>{
 const {createMakerRuntime}=await import('../scripts/directory/maker-runtime-v2.mjs');
 const origin='https://directory.example';
 const attempts=[];
 const api=createMakerRuntime({site:'directory',enabled:true,origin,clientId:'oauth',clientSecret:'secret',store:{durable:true,saveFlow(){},consumeFlow(){},saveSession(){},deleteSession(){},
    readSession:async()=>({userId:1,expiresAt:Date.now()+100000})},makeService:()=>({submit:async (...p)=>{attempts.push(p.slice(1));return true;},withdraw:async (...p)=>{attempts.push(p.slice(1));return true;}})});
 const write=(action,body)=>api(new Request(origin+'/api/maker/?action='+action+'&id=example',{method:'POST',headers:{origin,'Content-Type':'application/json',
   cookie:'__Host-suede-maker-session='+'x'.repeat(43)},body:JSON.stringify(body)}));
 assert.equal((await write('submit',{statement:'unversioned'})).status,400);
 assert.equal((await write('withdraw',{})).status,400);
 assert.equal((await write('submit',{profile:{statement:'updated'},expected:4})).status,200);
 assert.equal((await write('withdraw',{expected:7})).status,200);
 assert.deepEqual(attempts,[['example',{statement:'updated'},4],['example',7]]);
});

test('final export stamp refuses to serialize a now-unpublishable snapshot',async()=>{
 const f=fixture(async (id,expected)=>{assert.equal(id,'example');assert.equal(expected,3);return false;});
 const s=f.service;await s.claim(1,'example');
 const v=await s.submit(1,'example',{statement:'prior snapshot'},0);
 await s.review(99,'example',v.version,'approve');
 await assert.rejects(s.getApproved('example'),{code:'snapshot_changed'});
});
