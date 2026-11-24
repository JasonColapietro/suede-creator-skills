import test from 'node:test';
import assert from 'node:assert/strict';
import { curatedPosts } from '../docs/directory/maker/post-links.mjs';
import { createMakerOwnerService } from '../scripts/directory/maker-owner-v2.mjs';
import { publicationRow, renderFeaturedMakerProfiles } from '../scripts/directory/maker-projection-v2.mjs';

const posts=['https://x.com/maker/status/12345','https://bsky.app/profile/maker.social/post/3lg4225jcit2k'];
const projects=[{id:'first',repo:'Maker/One',review:'directory/reviews/2026-10-12-verified.md'}, {id:'second',repo:'Maker/Two'}];
function setup(){
 const rows=new Map(); let owner=1;
 const s=createMakerOwnerService({projects,enabled:true,site:'directory', github:{user:async n=>n, repository:async name=>({id:name.endsWith('One')?20:21, full_name:name,private:false,owner:{id:owner,type:'User'}})},store:{async transact(id,fn){const v=fn(structuredClone(rows.get(id)));if(v.write) rows.set(id,v.write);return structuredClone(v.result);}},isModerator:async n=>n===3});
 return {s,transfer(){owner=2;}};
}
test('canonical curated public posts reject off-host, account, tracking, duplicate and excessive URLs',()=>{
 assert.deepEqual(curatedPosts(posts).map(p=>p.href),posts);
 for(const value of [['https://x.com/maker'],['https://x.com.evil.org/m/status/23'],[posts[0]+'?tracking=1'],[posts[0]+'#frag'],['https://x.com/any/../maker/status/123'],['https://x.com:443/maker/status/123'],['https://x.com@localhost/maker/status/123'],['https://x.com/share/status/123'],['<script>'],[...posts,posts[0]],Array(4).fill(posts[0])]) assert.throws(()=>curatedPosts(value));
});
test('prior approved feed stays visible; private requests survive profile changes, cannot change review or leak after transfer',async()=>{
 const {s,transfer}=setup(); await s.claim(1,'first');
 const snapshot=await s.get(1,'first'); assert.match(snapshot.listing.reviewUrl,/github\.com\/JasonColapietro\/suede-creator-skills\/blob\/main\/directory\/reviews\//);
 assert.equal((await s.get(1,'second')).listing.reviewUrl,null);
 const draft=await s.submit(1,'first',{posts,demo:'https://demo.maker.org/play'},(await s.get(1,'first')).editVersion);assert.equal(await s.getApproved('first'),null);
 const req=await s.ask(1,'first',{kind:'re-review',note:'Please check the new release.'});assert.equal(req.status,'pending');
 const same=await s.ask(1,'first',{kind:'re-review',note:req.note});assert.equal(req.version,same.version);
 await assert.rejects(s.ask(1,'first',{kind:'re-review',note:'Other note'}),{code:'already_pending'});
 await assert.rejects(s.ask(1,'second',{kind:'improvement',note:'Not claimed'}),{code:'ownership_not_verified'});
 await assert.rejects(s.ask(2,'first',{kind:'improvement',note:'Not owner'}),{code:'ownership_not_verified'});
 await assert.rejects(s.ask(1,'first',{kind:'improvement',note:'My note',score:100}),{code:'invalid_request'});
 assert.deepEqual((await s.get(2,'first')).requests,[]);
 assert.equal((await s.getForReview(3,'first')).requests[0].note,req.note);
 await s.review(3,'first',draft.version,'approve');
 await s.submit(1,'first',{statement:'pending change'},(await s.get(1,'first')).editVersion);
 const pub=publicationRow('featured:first','Maker/One',await s.getApproved('first'));
 const html=renderFeaturedMakerProfiles('<article class="featured-project" id="first"><p>Original grade: A</p><footer></footer></article>',{schema_version:1,profiles:[pub]},projects);
 assert.match(html,/Original grade: A/);assert.match(html,/From the maker/);assert.match(html,/Selected posts/);assert.match(html,/https:\/\/demo.maker.org\/play/);assert.ok(html.indexOf(posts[0])<html.indexOf(posts[1]));assert.doesNotMatch(html,/Please check|pending change|iframe|<script/);
 await assert.rejects(s.resolveRequest(2,'first',{kind:'re-review',version:req.version,reply:'Hello'}),{code:'moderator_required'});
 const resolved=await s.resolveRequest(3,'first',{kind:'re-review',version:req.version,reply:'We reviewed your update.'});assert.equal(resolved.status,'resolved');
 const another=await s.ask(1,'first',{kind:'re-review',note:'Another release.'});assert.ok(another.version>req.version);
 await assert.rejects(s.resolveRequest(3,'first',{kind:'re-review',version:req.version,reply:'Old reply'}),{code:'stale_request'});
 transfer();assert.deepEqual((await s.get(1,'first')).requests,[]);assert.equal(await s.getApproved('first'),null);
});
test('withdrawal is a reviewed edit, not a fresh empty submission, and cannot change editorial data',async()=>{
 const {s}=setup();await s.claim(1,'first');await assert.rejects(s.withdraw(1,'first',(await s.get(1,'first')).editVersion),{code:'nothing_to_withdraw'});
 const draft=await s.submit(1,'first',{posts},(await s.get(1,'first')).editVersion);await s.review(3,'first',draft.version,'approve');
 await assert.rejects(s.withdraw(2,'first'),{code:'ownership_not_verified'});
 const removal=await s.withdraw(1,'first',(await s.get(1,'first')).editVersion);assert.equal(removal.profile,null);
 assert.equal((await s.withdraw(1,'first',(await s.get(1,'first')).editVersion)).version,removal.version);
 assert.deepEqual((await s.getApproved('first')).posts,posts);
 await s.review(3,'first',removal.version,'reject');assert.deepEqual((await s.getApproved('first')).posts,posts);
 const retry=await s.withdraw(1,'first',(await s.get(1,'first')).editVersion);await s.review(3,'first',retry.version,'approve');assert.equal(await s.getApproved('first'),null);
 assert.match((await s.get(1,'first')).listing.reviewUrl,/verified.md$/);
});
test('canonical YouTube demo watch URL is accepted without allowing arbitrary query strings',()=>{
 const row=publicationRow('featured:first','Maker/One',{demo:'https://www.youtube.com/watch?v=abcdefghijk'});assert.ok(row.demo);
 for(const demo of ['https://www.youtube.com/watch?v=abcdefghijk&tracking=1','https://other.org/watch?v=abcdefghijk','https://www.youtube.com/watch?v=short']) assert.throws(()=>publicationRow('featured:first','Maker/One',{demo}));
});
test('only moderators discover pending listing names; stale catalog IDs and request contents never appear',async()=>{
 let queried=0;const s=createMakerOwnerService({site:'directory',enabled:true,projects,github:{user:async n=>n,repository:async()=>null},store:{async transact(_id,read){return read({owner:1},1).result;},pendingListings:async user=>{queried++;assert.equal(user,3);return ['first','gone'];}},isModerator:async n=>n===3});
 await assert.rejects(s.inbox(1,'first'),{code:'moderator_required'});assert.equal(queried,0);
 assert.deepEqual(await s.inbox(3,'first'),[{id:'first',name:'first',ownership:'unavailable'}]);
});
test('retained CloudGPU alias is verified by immutable ID without changing the published record',async()=>{
 const item={id:'cloudgpu',repo:'mrhy7176/cloudgpu-agent-skills'}, full_name='cloudgpu-app/cloudgpu-agent-skills';
 let repoID=1,state=null;const s=createMakerOwnerService({site:'directory',enabled:true,projects:[item],isModerator:async()=>false,github:{user:async()=>42,repository:async name=>{assert.equal(name,full_name);return {id:repoID,full_name,private:false,owner:{id:42,type:'User'}};}},store:{async transact(id,fn){const v=fn(state);if(v.write)state=v.write;return v.result;}}});
 await assert.rejects(s.claim('maker','cloudgpu'),{code:'ownership_not_verified'});repoID=1449190655;await s.claim('maker','cloudgpu');assert.equal((await s.get('maker','cloudgpu')).listing.repo,item.repo);
});
test('fictional demo cannot approve a completely blank profile',async()=>{
 const {readFileSync}=await import('node:fs'),{runInNewContext}=await import('node:vm');const sandbox={window:{}};
 runInNewContext(readFileSync(new URL('../docs/directory/maker/demo/flow.js',import.meta.url),'utf8'),sandbox);
 const {validate,advance}=sandbox.window.SuedeDemo;const state={step:'edit',fields:{}};
 assert.match(validate({}).statement,/at least one/);assert.equal(advance(state,'preview',{}),state);assert.equal(advance(state,'preview',{statement:'Made this'}).step,'preview');
});
