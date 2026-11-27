import {route, validId, request, parseListing, payload, publicURL} from './client.mjs';
const get = id => document.getElementById(id);
const id = new URL(location.href).searchParams.get('id');
const actions = get('actions'), title = get('stage-title'), status = get('status');
const listingPanel = get('listing');
let busy = false, canWithdraw=false, editVersion=null;
const helpPanel=get('help'), helpStatus=get('help-status'), helpBody=get('help-body');
const errors = {
  maker_unavailable:'Maker access is not available right now. Try again, or open the offline demo to see how it works.',
  listing_not_found:'This project is not eligible for a maker profile. Choose a listing from the directory.',
  ownership_not_verified:'This GitHub account could not verify ownership for this listing. Use the repository owner account or contact Suede about organization access.',
  listing_already_claimed:'This listing already has a verified maker.',
  invalid_posts:'Use up to three different post permalinks from the supported sites. Remove tracking, fragments and share parameters.',
  invalid_request:'Enter a short plain-text message, up to 1,000 bytes. Do not include HTML or private credentials.',
  already_pending:'You already have an open request of this kind. It has not been replaced.',
  edit_conflict:'This profile changed in another tab or was reviewed. Copy any unsaved text, then reload before trying again.',
  recovery_conflict:'This claim has changed or no longer qualifies. Reopen the review queue before trying again.',
  nothing_to_withdraw:'There is no approved maker profile to remove.',
  stale_request:'This request changed. Refresh before replying.',
  stale_revision:'The profile was updated. Refresh before moderating it.',
  invalid_profile:'Add at least one detail. Use official HTTPS links with no tracking parameters and a plain-text statement of up to 320 characters.',
};
const revisionCopy = {
  pending:['Awaiting review','Suede will review this submission before it appears on your listing.'],
  rejected:['Changes requested','This submission was not approved. Submit a revised profile for review.'],
  approved:['Approved','Suede approved these details. They appear after the next directory publication.'],
};
const removalCopy = {
  pending:['Removal awaiting review','Your public maker details are unchanged while Suede reviews the removal.'],
  rejected:['Removal not approved','Your existing maker details remain unchanged. You can ask Suede for feedback.'],
  approved:['Removal approved','Your maker details will be removed on the next verified directory publication. Suede’s editorial review stays in place.'],
};
const node = (tag,text,props={}) => Object.assign(document.createElement(tag),{textContent:text,...props});
function link(text,href,cls='') { return node('a',text,{href,className:cls}); }
function button(text,onClick,secondary=false) {
  const el=node('button',text,{type:'button',className:'button'+(secondary?' secondary':'')});
  el.addEventListener('click',onClick); return el;
}
function screen(heading,message,focus=false) {
  title.textContent=heading; status.textContent=message; actions.replaceChildren();
  if(focus) title.focus();
}
function problem(error) { status.textContent=errors[error.message] || errors.maker_unavailable; }
function lockControls(value) {
  busy=value;
  for(const box of [actions,helpBody]) box.querySelectorAll('button').forEach(item=>{item.disabled=value;});
}
async function run(work) {
  if(busy) return;
  lockControls(true);
  try { await work(); } catch(error) { if(error.message==='sign_in_required')await load(true);else problem(error); } finally { lockControls(false); }
}
function directoryLink() { return link('Browse the directory','/','small-action'); }
function renderListing(listing) {
  listingPanel.hidden=false; get('listing-title').textContent=listing.name;
  const facts=get('facts'); facts.replaceChildren();
  if(/^[\w.-]+\/[\w.-]+$/.test(listing.repo) && !listing.repo.split('/').some(part=>part==='.'||part==='..')) facts.append(link('GitHub repository','https://github.com/'+listing.repo));
  const url=publicURL(listing.website);
  if(url) facts.append(link('Website currently listed',url));
  facts.append(node('h3','Suede’s editorial review'));
  if (typeof listing.reviewUrl==='string' && /^https:\/\/github\.com\/JasonColapietro\/suede-creator-skills\/blob\/main\/directory\/reviews\/[a-zA-Z0-9._-]+\.md$/.test(listing.reviewUrl)) facts.append(link('Read Suede’s published review',listing.reviewUrl));
  else facts.append(node('p','No published review is linked for this listing.'));
}
function renderDetails(box,data,interactive=false) {
  box.replaceChildren();
  if(typeof data?.statement==='string'&&data.statement) box.append(node('p',data.statement));
  [data?.website,data?.demo,...(Array.isArray(data?.socials)?data.socials:[])].slice(0,6).forEach(raw=>{
    const url=publicURL(raw);
    if(url) box.append(interactive ? link(url,url) : node('p',url));
  });
  if(data?.posts?.length) {
    box.append(node('h3','Selected posts'));
    const list=node('ol','');
    for(const raw of data.posts) {const url=publicURL(raw); if(url){const li=node('li','');li.append(interactive?link(url,url):node('span',url));list.append(li);}}
    box.append(list);
  }
}
function logout() {
  const el=button('Sign out',()=>run(async()=>{
    await request('logout',id);
    listingPanel.hidden=true; helpPanel.hidden=true; helpBody.replaceChildren();
    signedOut(true);
  }),true);
  el.classList.add('small-action'); actions.append(el);
}
function signedOut(focus) {
  screen('Sign in to manage this listing','Continue with GitHub to see your existing listing and verify ownership.',focus);
  actions.append(link('Continue with GitHub',route('sign-in',id),'button'));
}
function fields(form,own={}) {
  const field=(key,label,value,{lines=0,max=400}={})=>{
    const wrapper=node('div',''), el=node(lines?'textarea':'input','',{id:key,name:key,maxLength:max,value:value||'',...(lines?{rows:lines}:{type:'url',autocomplete:'off'})});
    wrapper.append(node('label',label,{htmlFor:key}),el); form.append(wrapper); return el;
  };
  const statement=field('statement','What should visitors know about your project?',own.statement,{lines:3,max:320});
  const website=field('website','Official website',own.website);
  const demo=field('demo','Product demo link',own.demo);
  form.append(node('p','Use a public HTTPS link without tracking, or a YouTube watch or youtu.be link.',{className:'field-note'}));
  const socials=field('socials','Social profiles (one link per line)',own.socials?.join('\n'),{lines:2,max:1700});
  form.append(node('p','Up to four profiles: GitHub, LinkedIn, X, YouTube, Instagram or Bluesky.',{className:'field-note'}));
  const posts=field('posts','Selected posts (one link per line)',own.posts?.join('\n'),{lines:3,max:1250});
  form.append(node('p','Choose up to three posts in the order visitors should see them. Use X, Bluesky, LinkedIn, Instagram or a youtu.be video link. Posts open on their original site; nothing is embedded.',{className:'field-note'}));
  return ()=>payload(website.value,socials.value.split(/\r?\n/),statement.value,demo.value,posts.value.split(/\r?\n/));
}
function editor(focus=false,own={}) {
  screen('Edit your maker profile','Every field is optional. Add at least one detail, then preview it before submitting to Suede.',focus);
  const form=node('form','',{className:'edit-form'});
  const read=fields(form,own);
  const preview=node('section','',{className:'maker-preview',hidden:true});
  const previewHeading=node('h3','Visitor preview',{tabIndex:-1});
  const details=node('div','');
  const submit=button('Submit for review',()=>run(async()=>{
    const profile=read();
    const revision=await request('submit',id,{profile,expected:editVersion});
    if(revision?.status!=='pending') throw new Error('maker_unavailable');
    editVersion=revision.version;showRevision(revision,true);
  }));
  preview.append(previewHeading,details,submit);
  form.addEventListener('input',()=>{preview.hidden=true;});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    try {
      const profile=read();
      status.textContent='Preview your details below, then submit when ready.';
      renderDetails(details,profile); preview.hidden=false; previewHeading.focus();
    } catch(error) { problem(error); }
  });
  form.append(node('button','Preview update',{type:'submit',className:'button'}),preview);
  actions.append(form); logout();
}
function showRevision(revision,focus) {
  screen(...(revision.profile===null?removalCopy:revisionCopy)[revision.status],focus);
  const summary=node('div','',{className:'maker-preview'});
  if (revision.profile===null) summary.append(node('p','Remove all maker details from the public listing. Suede’s review stays in place.'));
  else renderDetails(summary,revision.profile,true);
  actions.append(summary);
  actions.append(button(revision.status==='pending'?'Check review status':'Start a new update',
    revision.status==='pending'?()=>run(()=>load(true)):()=>editor(true,revision.profile||{}),true));
  if(canWithdraw && !(revision.status==='pending' && revision.profile===null)){
    const disclosure=node('details','');disclosure.append(node('summary','Remove my public maker profile'),node('p','This asks Suede to remove all maker-added details after review. Your editorial listing stays public.'));
    disclosure.append(button('Request profile removal',()=>run(async()=>{await request('withdraw',id,{expected:editVersion});await load(true);}),true));actions.append(disclosure);
  }
  logout();
}
const kinds={'re-review':'Re-review',improvement:'Improvement feedback'};
function messageField(form,key,label) {
  const el=node('textarea','',{name:key,id:key,maxLength:1000,rows:3,required:true});
  form.append(node('label',label,{htmlFor:key}),el);return el;
}
function helpSubmit(form,label,work) {
  const submit=node('button',label,{type:'submit'});form.append(submit);
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||submit.disabled)return;lockControls(true);
    try{await work();}catch(e){if(e.message==='sign_in_required')await load(true);else helpStatus.textContent=errors[e.message]||errors.maker_unavailable;}
    finally{lockControls(false);}
  });
}
function showHelp(value){
  helpBody.replaceChildren();helpStatus.textContent='';
  helpPanel.hidden=!value.claimed&&!value.moderator;
  if(helpPanel.hidden)return;
  get('help-title').textContent=value.claimed?'Ask Suede':'Listing moderation';
  if(value.moderator){
    const all=button('Find pending listings',()=>run(async()=>{
      const list=await request('inbox',id);
      if(!Array.isArray(list))throw new Error('maker_unavailable');
      const result=node('div',''), heading=node('h3','Listings awaiting Suede',{tabIndex:-1});
      result.append(heading);const links=node('ul','');
      for(const v of list)if(validId(v.id)&&typeof v.name==='string'){const li=node('li','');li.append(link(v.name,'/maker/?id='+v.id));
        if(v.ownership==='stale')li.append(' (ownership recovery needed)');
        if(v.ownership==='unavailable')li.append(' (ownership check unavailable)');
        links.append(li);}
      result.append(links.children.length?links:node('p','No listings are awaiting review.'));
      helpBody.replaceChildren(result,open);heading.focus();
    }),true);
    const open=button('Open review queue',()=>run(async()=>{
      const queue=await request('review-queue',id);const heading=node('h3','Review queue for this listing',{tabIndex:-1});helpBody.replaceChildren(heading,all);heading.focus();
      if(queue.ownership==='unavailable'){
        helpBody.append(node('p','Repository ownership could not be verified. Try again later or check the listed repository. No private details are shown.'));
        return;
      }
      if(queue.recovery){
        const form=node('form','');
        form.append(node('p','The existing account no longer controls this repository. Verify the successor before moving this claim. The previous profile, drafts and requests will not follow them.'));
        const nominee=node('input','',{id:'recovery-account',type:'text',inputMode:'numeric',required:true,value:queue.recovery.nominee||''});
        const evidence=node('input','',{id:'recovery-case',type:'text',required:true,maxLength:96});
        form.append(node('label','Verified successor’s numeric GitHub ID',{htmlFor:nominee.id}),nominee,
          node('label','Internal case reference (not the evidence itself)',{htmlFor:evidence.id}),evidence);
        helpSubmit(form,'Transfer verified claim',async()=>{
          const parsed=Number(nominee.value);
          if(!/^[1-9][0-9]*$/.test(nominee.value) || !Number.isSafeInteger(parsed)){
            helpStatus.textContent='Enter the successor’s numeric GitHub account ID, not a username.';nominee.focus();return;
          }
          if(!/^[A-Za-z0-9][A-Za-z0-9:._-]{2,95}$/.test(evidence.value.trim())){
            helpStatus.textContent='Use an internal case reference, such as CASE-123. Do not paste evidence or credentials.';evidence.focus();return;
          }
          await request('recover',id,{expected:queue.recovery.expected,nominee:parsed,evidence:evidence.value.trim()});
          await load(false);helpStatus.textContent='Claim transferred. The successor starts with an empty profile.';helpStatus.focus();
        });
        helpBody.append(form);return;
      }
      const r=queue.revision;
      if (r?.status==='pending'){
        helpBody.append(node('h3','Submitted maker profile'));const box=node('div','');if(r.profile===null)box.append(node('p','The maker requests removal of all maker details. The editorial listing stays public.'));else renderDetails(box,r.profile,true);helpBody.append(box);
        ['approve','reject'].forEach(decision=>helpBody.append(button(decision==='approve'?'Approve this revision':'Reject this revision',()=>run(async()=>{
          await request('review',id,{version:r.version,decision});await load(false);helpStatus.textContent='Moderation decision saved.';helpStatus.focus();
        }),true)));
      }
      const pending=queue.requests.filter(r=>r.status==='pending');
      if(!pending.length && r?.status!=='pending')helpBody.append(node('p','Nothing is awaiting review on this listing.'));
      for(const req of pending){
        const form=node('form','');form.append(node('h3',kinds[req.kind]),node('p',req.note));
        const reply=messageField(form,'answer-'+req.kind,'Private reply to the maker');
        helpSubmit(form,'Reply and close request',async()=>{
          await request('resolve-request',id,{kind:req.kind,version:req.version,reply:reply.value});await load(false);helpStatus.textContent='Reply saved for the maker.';helpStatus.focus();
        });helpBody.append(form);
      }
    }),true);helpBody.append(open,all);return;
  }
  helpBody.append(node('p','Ask for a fresh look at a change or advice on what to improve. Your request and Suede’s reply stay private. Requests do not change your listing or score.'));
  for(const req of value.requests){
    if (!Object.hasOwn(kinds,req.kind))continue;
    const summary=node('details','');summary.append(node('summary',kinds[req.kind]+': '+(req.status==='resolved'?'answered':'awaiting Suede')),node('p',req.note));
    if(req.reply)summary.append(node('strong','Suede’s reply'),node('p',req.reply));helpBody.append(summary);
  }
  const available=Object.entries(kinds).filter(([kind])=>!value.requests.some(r=>r.kind===kind&&r.status==='pending'));
  if(!available.length){helpBody.append(node('p','Both requests are open. You can send another request of the same type after Suede replies.'));return;}
  const form=node('form',''),select=node('select','',{id:'request-kind'});
  for(const [kind,label] of available)select.append(node('option',label,{value:kind}));
  form.append(node('label','Request type',{htmlFor:'request-kind'}),select);
  const note=messageField(form,'request-note','What should Suede look at?');
  helpSubmit(form,'Send private request',async()=>{
    await request('ask',id,{kind:select.value,note:note.value});
    // Refresh only this panel; a request must not discard in-progress profile edits.
    showHelp(parseListing(await request('listing',id),id));helpStatus.textContent='Request received. Your listing has not changed.';helpStatus.focus();
  });
  helpBody.append(form);
}
async function load(focus=false) {
  let value;
  try { value=parseListing(await request('listing',id),id); }
  catch(error) {
    listingPanel.hidden=true; helpPanel.hidden=true; helpBody.replaceChildren();
    if(error.message==='sign_in_required') {signedOut(focus); return;}
    screen(error.message==='listing_not_found'?'Choose a directory listing':'Maker access unavailable',errors[error.message]||errors.maker_unavailable,focus);
    actions.append(directoryLink(),link('Open offline demo','./demo/','small-action')); return;
  }
  canWithdraw=value.canWithdraw;editVersion=value.editVersion;renderListing(value.listing); showHelp(value);
  if(value.revision) {showRevision(value.revision,focus); return;}
  if(value.claimed) {editor(focus); return;}
  screen('Verify ownership','Review the existing listing, then verify your GitHub ownership. This does not change the listing.',focus);
  actions.append(button('Verify listing ownership',()=>run(async()=>{
    if(await request('claim',id)!==true) throw new Error('maker_unavailable');
    await load(true);
  }))); logout();
}
if(validId(id)) {
  screen('Opening maker workspace','Looking up the listing.');
  void load();
} else {
  screen('Choose your listing','Open the claim link on your skill or featured project to manage its listing.');
  actions.append(directoryLink());
}
