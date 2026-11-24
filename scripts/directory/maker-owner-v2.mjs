import { curatedPosts } from '../../docs/directory/maker/post-links.mjs';
import { isIP } from 'node:net';
import { publicationRow } from './maker-projection-v2.mjs';

const blank = () => ({ website: '', socials: [], statement: '' });
const githubId = value => Number.isSafeInteger(value) && value > 0;
const deny = code => { throw Object.assign(new Error(code), { code }); };
const privateMatch = /(?:^|\.)(?:localhost|internal|local|test|invalid|onion|home\.arpa)$/i;

function link(input) {
  if (typeof input !== 'string' || input.length > 512 || /[\s\u0000-\u001f\u007f]/u.test(input)) return deny('invalid_profile');
  let url;
  try { url = new URL(input); } catch { return deny('invalid_profile'); }
  const host = url.hostname.replace(/\.$/, '').replace(/^\[|\]$/g, '');
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !host.includes('.') || isIP(host) || privateMatch.test(host)) return deny('invalid_profile');
  return url.href;
}

function profile(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).some(key => !['website', 'socials', 'statement', 'demo', 'posts'].includes(key))) return deny('invalid_profile');
  const { website = '', socials = [], statement = '' } = input;
  if (!Array.isArray(socials) || socials.length > 4 || typeof statement !== 'string' || [...statement].length > 320
    || /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(statement)) return deny('invalid_profile');
  const out = { website: website === '' ? '' : link(website), socials: [...new Set(socials.map(link))], statement: statement.trim() };
  if (input.demo !== undefined && input.demo !== '') out.demo = link(input.demo);
  if (input.posts !== undefined) {
    try { const posts = curatedPosts(input.posts); if (posts.length) out.posts = posts.map(p => p.href); }
    catch { return deny('invalid_posts'); }
  }
  if (!out.website && !out.socials.length && !out.statement && !out.demo && !out.posts?.length) return deny('invalid_profile');
  return out;
}

/**
 * Server only. github.user authenticates an opaque session, not client-provided IDs.
 * github.repository fetches repository facts for the catalog-owned repo name.
 * store.transact(listingId, reducer) must be atomic; reducer returns { write?, result }.
 * This module does not mount an HTTP route, grant credentials, render, or publish.
 */
const requestKinds = ['re-review', 'improvement'];
const exactObject = (body, keys) => body && typeof body === 'object' && !Array.isArray(body)
  && Object.keys(body).length === keys.length && keys.every(k => Object.hasOwn(body,k));
function noteText(value) {
  if (typeof value !== 'string' || !value.trim() || Buffer.byteLength(value.trim()) > 1000 || /[<>\p{Cc}\p{Cf}]/u.test(value.replace(/\r?\n/g,' '))) return deny('invalid_request');
  return value.trim();
}
const requestList = state => requestKinds.map(k => state?.requests?.[k]).filter(Boolean);
export function createMakerOwnerService({ site, enabled, projects, github, store, isModerator, hasReviewedClaim } = {}) {
  if (site !== 'directory' || enabled !== true || !Array.isArray(projects)
    || typeof github?.user !== 'function' || typeof github?.repository !== 'function'
    || typeof store?.transact !== 'function' || typeof isModerator !== 'function') return null;
  const targets = new Map();
  for (const item of projects) {
    if (item?.status === 'pending') continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item?.id ?? '') || targets.has(item.id)) throw new Error('Invalid or duplicate maker listing ID');
    targets.set(item.id, Object.freeze({ id: item.id, name: item.name || item.id, repo: item.canonical_repo || item.repo || '', website: item.site || '', reviewUrl: /^directory\/reviews\/[a-zA-Z0-9._-]+\.md$/.test(item.review || '')
      ? 'https://github.com/JasonColapietro/suede-creator-skills/blob/main/' + item.review : null }));
  }
  const context = async (session, listingId) => {
    const user = await github.user(session);
    if (!githubId(user)) return deny('sign_in_required');
    const listing = targets.get(listingId);
    if (!listing) return deny('listing_not_found');
    return { user, listing };
  };
  const repository = async (listing, bound = null) => {
    if (!/^[\w.-]+\/[\w.-]+$/.test(listing.repo)) return deny('ownership_not_verified');
    // A reviewed repository transfer. Preserve the editorial link; only accept the same immutable repository.
    const cloudTransfer = listing.id === 'cloudgpu' && listing.repo === 'mrhy7176/cloudgpu-agent-skills';
    const proofName = cloudTransfer ? 'cloudgpu-app/cloudgpu-agent-skills' : listing.repo;
    const atName = await github.repository(proofName, { reportMove: Boolean(bound) });
    const moved = atName?.moved === true;
    const fact = moved && githubId(bound?.repoId) && typeof github.repositoryById === 'function'
      ? await github.repositoryById(bound.repoId) : atName;
    if (moved && fact?.id !== bound?.repoId) return deny('ownership_not_verified');
    if (cloudTransfer && fact?.id !== 1449190655) return deny('ownership_not_verified');
    if (!githubId(fact?.id) || fact?.private !== false || typeof fact.full_name !== 'string'
      || (!moved && fact.full_name.toLowerCase() !== proofName.toLowerCase())) return deny('ownership_not_verified');
    if (!githubId(fact.owner?.id) || !['User', 'Organization'].includes(fact.owner.type)) return deny('ownership_not_verified');
    return fact;
  };
  const claimant = async (listing, user, fact) => {
    if (fact.owner.type === 'User') return fact.owner.id === user;
    return typeof hasReviewedClaim === 'function' && await hasReviewedClaim({
      listingId: listing.id, userId: user, repositoryId: fact.id, ownerId: fact.owner.id,
    }) === true;
  };
  const currentRepository = async (listing,bound) => {
    try { return await repository(listing,bound); } catch (error) {
      if (error?.code === 'ownership_not_verified') return null;
      throw error;
    }
  };
  const activeOwner = (state, user, fact) => state?.owner === user && state?.repoId === fact.id
    && state?.githubOwnerId === fact.owner?.id && state?.githubOwnerType === fact.owner?.type;
  const read = (id) => store.transact(id, (state, version) => ({result:{state,version}}));
  const editVersion = state => state?.editVersion ?? state?.revision?.version ?? 0;
  const nextSequence = state => Math.max(editVersion(state),state?.sequence ?? 0,state?.revision?.version ?? 0,
    ...requestList(state).map(r=>r.version))+1;
  const expectEdit = (state, expected) => {
    if (!Number.isSafeInteger(expected) || expected<0) return deny('invalid_request');
    if (editVersion(state)!==expected) return deny('edit_conflict');
  };
  const repoForClaim = async listing => repository(listing,(await read(listing.id)).state);
  const inspect = async (listing, state) => {
    if (!state) return { ownership:'unclaimed' };
    const fact = await currentRepository(listing,state);
    if (!fact || fact.id!==state.repoId) return {ownership:'unavailable'};
    if (!activeOwner(state,state.owner,fact) || !(await claimant(listing,state.owner,fact))) return {ownership:'stale',fact};
    return {ownership:'current',fact};
  };
  const bind = (listingId, user, fact) => store.transact(listingId, state => {
    if (state && !activeOwner(state, user, fact)) return deny('listing_already_claimed');
    return state ? { result: true } : {
      write: { owner: user, repoId: fact.id, githubOwnerId: fact.owner?.id, githubOwnerType: fact.owner?.type, revision: null, approved: null },
      result: true,
    };
  });

  return {
    async get(session, listingId) {
      const { user, listing } = await context(session, listingId);
      const initial = await read(listingId);
      const check = initial.state?.owner===user ? await inspect(listing,initial.state) : null;
      const latest = await read(listingId), state=latest.state;
      const claimed = Boolean(check?.ownership==='current' && initial.version===latest.version && activeOwner(state,user,check.fact));
      return { listing, claimed, editVersion:claimed ? editVersion(state) : null, form: blank(), canWithdraw: Boolean(claimed && state.approved?.profile), requests: claimed ? requestList(state) : [], moderator: !claimed && await isModerator(user) === true && state?.owner !== user, revision: claimed ? state.revision : null };
    },
    async claim(session, listingId) {
      const { user, listing } = await context(session, listingId);
      const fact = await repoForClaim(listing);
      if (!(await claimant(listing, user, fact))) return deny('ownership_not_verified');
      return bind(listingId, user, fact);
    },
    async submit(session, listingId, input, expected) {
      const { user, listing } = await context(session, listingId);
      const fact = await repoForClaim(listing);
      if (!(await claimant(listing, user, fact))) return deny('ownership_not_verified');
      return store.transact(listingId, state => {
        if (!activeOwner(state, user, fact)) return deny('ownership_not_verified');
        expectEdit(state,expected);
        const values = profile(input);
        try { publicationRow('featured:' + listing.id, listing.repo, values); } catch { return deny('invalid_profile'); }
        const revision = { version: nextSequence(state), status: 'pending', profile: values };
        return { write: { ...state, revision, editVersion: revision.version }, result: revision };
      });
    },
    async withdraw(session, listingId, expected) {
      const {user,listing}=await context(session,listingId);
      const fact=await repoForClaim(listing);
      if (!(await claimant(listing,user,fact))) return deny('ownership_not_verified');
      return store.transact(listingId,state=>{
        if (!activeOwner(state,user,fact)) return deny('ownership_not_verified');
        expectEdit(state,expected);
        if (!state.approved?.profile) return deny('nothing_to_withdraw');
        if (state.revision?.profile===null && state.revision.status==='pending') return {result:state.revision};
        const revision={version:nextSequence(state),status:'pending',profile:null};
        return {write:{...state,revision,editVersion:revision.version},result:revision};
      });
    },
    async recover(session, listingId, body) {
      const {user,listing}=await context(session,listingId);
      if (await isModerator(user)!==true) return deny('moderator_required');
      if (!exactObject(body,['expected','nominee','evidence']) || !githubId(body.nominee) || !githubId(body.expected)
        || typeof body.evidence!=='string' || !/^[A-Za-z0-9][A-Za-z0-9:._-]{2,95}$/.test(body.evidence)) return deny('invalid_request');
      if (body.nominee===user) return deny('self_review_forbidden');
      const snapshot=await read(listingId);
      if (!snapshot.state || snapshot.version!==body.expected) return deny('recovery_conflict');
      if (snapshot.state.owner===user || snapshot.state.owner===body.nominee) return deny('self_review_forbidden');
      const current=await inspect(listing,snapshot.state);
      if(current.ownership!=='stale') return deny('recovery_conflict');
      const {fact}=current;
      if(!(await claimant(listing,body.nominee,fact))) return deny('ownership_not_verified');
      const version=nextSequence(snapshot.state);
      const next={owner:body.nominee,repoId:fact.id,githubOwnerId:fact.owner.id,githubOwnerType:fact.owner.type,
        sequence:version,editVersion:version,revision:null,approved:null};
      const recovered=await store.recover(listingId,body.expected,next,{moderator:user,evidence:body.evidence});
      if(recovered!==true) return deny('recovery_conflict');
      return true;
    },
    async inbox(session, listingId) {
      const {user}=await context(session,listingId);
      if (await isModerator(user)!==true) return deny('moderator_required');
      const keys=await store.pendingListings(user);
      if(!Array.isArray(keys)) throw new Error('Invalid moderation queue');
      const listings=[];
      const candidates=keys.filter(id=>targets.has(id)).slice(0,100);
      const deadline=Date.now()+5500;
      for(let i=0;i<candidates.length;i+=6) {
        listings.push(...await Promise.all(candidates.slice(i,i+6).map(async id=>{
          const target=targets.get(id);
          if(Date.now()>deadline)return {id,name:target.name,ownership:'check_required'};
          const {state}=await read(id);
          if(!state || state.owner===user) return null;
          let ownership='unavailable';
          try { ({ownership}=await inspect(target,state)); } catch { /* Outages are not evidence of an ownership transfer. */ }
          return {id,name:target.name,ownership};
        })));
      }
      return listings.filter(Boolean);
    },
    async ask(session, listingId, body) {
      const { user, listing } = await context(session, listingId);
      const fact = await repoForClaim(listing);
      if (!(await claimant(listing,user,fact))) return deny('ownership_not_verified');
      if (!exactObject(body,['kind','note']) || !requestKinds.includes(body.kind)) return deny('invalid_request');
      const note = noteText(body.note);
      return store.transact(listingId, state => {
        if (!activeOwner(state,user,fact)) return deny('ownership_not_verified');
        const prior = state.requests?.[body.kind];
        if (prior?.status === 'pending') return prior.note === note ? {result:prior} : deny('already_pending');
        const item = { kind:body.kind, note, version:nextSequence(state), status:'pending', requestedAt:new Date().toISOString() };
        return {write:{...state,requests:{...state.requests,[body.kind]:item}},result:item};
      });
    },
    async resolveRequest(session, listingId, body) {
      const { user, listing } = await context(session, listingId);
      if (await isModerator(user) !== true) return deny('moderator_required');
      if (!exactObject(body,['kind','version','reply']) || !requestKinds.includes(body.kind) || !Number.isSafeInteger(body.version)) return deny('invalid_request');
      const reply = noteText(body.reply);
      const owner = await store.transact(listingId, state => ({result:state?.owner}));
      if (owner === user) return deny('self_review_forbidden');
      const fact = await repoForClaim(listing);
      if (!githubId(owner) || !(await claimant(listing,owner,fact))) return deny('stale_request');
      return store.transact(listingId, state => {
        const item=state?.requests?.[body.kind];
        if (!activeOwner(state,owner,fact) || !item || item.status !== 'pending' || item.version !== body.version) return deny('stale_request');
        const result={...item,status:'resolved',reply,resolvedAt:new Date().toISOString()};
        return {write:{...state,requests:{...state.requests,[body.kind]:result}},result};
      });
    },
    async getForReview(session, listingId) {
      const { user, listing } = await context(session, listingId);
      if (await isModerator(user) !== true) return deny('moderator_required');
      const initial=await read(listingId);
      if(initial.state?.owner===user) return deny('self_review_forbidden');
      let observed={ownership:'unavailable'};
      try { observed=await inspect(listing,initial.state); } catch { /* Return unknown without exposing private state. */ }
      const latest=await read(listingId), stable=latest.version===initial.version;
      const current=stable && observed.ownership==='current';
      const ownership=stable ? observed.ownership : 'unavailable';
      return {listing,ownership, revision: current ? latest.state.revision : null,
        requests:current ? requestList(latest.state) : [],
        recovery:ownership==='stale' ? {expected:latest.version,
          nominee:observed.fact.owner.type==='User' ? observed.fact.owner.id : null, repositoryId:observed.fact.id} : null};
    },
    async review(session, listingId, version, decision) {
      const { user, listing } = await context(session, listingId);
      if (await isModerator(user) !== true) return deny('moderator_required');
      if (!['approve', 'reject'].includes(decision)) return deny('invalid_decision');
      const fact = await repoForClaim(listing);
      const owner = await store.transact(listingId, state => ({ result: state?.owner ?? null }));
      if (!githubId(owner) || !(await claimant(listing, owner, fact))) return deny('stale_revision');
      if (owner === user) return deny('self_review_forbidden');
      return store.transact(listingId, state => {
        if (!state?.revision || !activeOwner(state, owner, fact) || state.revision.status !== 'pending' || state.revision.version !== version) {
          return deny('stale_revision');
        }
        const revision = { ...state.revision, status: decision === 'approve' ? 'approved' : 'rejected', reviewedBy: user };
        return { write: { ...state, revision, editVersion: nextSequence(state), approved: decision === 'approve' ? revision : state.approved }, result: revision };
      });
    },
    async getApproved(listingId) {
      const listing = targets.get(listingId);
      if (!listing) return deny('listing_not_found');
      const initial=await read(listingId);
      if (!initial.state?.approved?.profile) return null;
      const observed=await inspect(listing,initial.state);
      if(observed.ownership!=='current') return null;
      const latest=await read(listingId);
      if (!latest.state?.approved?.profile) return null;
      if (!activeOwner(latest.state,initial.state.owner,observed.fact)
        || latest.state.approved.version!==initial.state.approved.version) return deny('snapshot_changed');
      if (typeof store.canExport==='function' && await store.canExport(listingId,latest.version)!==true) {
        return deny('snapshot_changed');
      }
      return latest.state.approved.profile;
    },
  };
}
