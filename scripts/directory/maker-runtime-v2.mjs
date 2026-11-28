import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const FLOW = '__Host-suede-maker-flow';
const SESSION = '__Host-suede-maker-session';
const FLOW_TTL = 600;
const SESSION_TTL = 900;
const allowedListing = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const opaque = /^[A-Za-z0-9_-]{43}$/;
const makeOpaque = () => randomBytes(32).toString('base64url');
const hash = value => createHash('sha256').update(value).digest('base64url');
const validUser = value => Number.isSafeInteger(value) && value > 0;
const httpPath = '/api/maker';
const noStore = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' };

function cookieLine(name, value, ttl) {
  return `${name}=${value}; Path=/; Max-Age=${ttl}; Secure; HttpOnly; SameSite=Lax`;
}
function readCookie(request, key) {
  const matches = (request.headers.get('Cookie') || '').split(';').map(part => part.trim()).filter(part => part.startsWith(key + '='));
  const value = matches[0]?.slice(key.length + 1) || '';
  return matches.length === 1 && opaque.test(value) ? value : '';
}
function error(status, code, cookies = []) {
  const response = Response.json({ error: code }, { status, headers: noStore });
  for (const line of cookies) response.headers.append('Set-Cookie', line);
  return response;
}
function redirect(location, ...cookies) {
  const response = new Response(null, { status: 303, headers: { ...noStore, Location: location } });
  for (const line of cookies) response.headers.append('Set-Cookie', line);
  return response;
}
async function boundedJson(request) {
  if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json' || !request.body) throw 0;
  const reader = request.body.getReader();
  let bytes = 0;
  const chunks = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 8192) { void reader.cancel(); throw 0; }
    chunks.push(Buffer.from(value));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function githubRepository(path, fetcher, reportMove=false) {
  const response = await fetcher('https://api.github.com/'+path, {
    headers:{Accept:'application/vnd.github+json'},redirect:reportMove?'manual':'error',signal:AbortSignal.timeout(3500),
  });
  // Do not follow Location. A bound repository may be rechecked via a fixed immutable-ID endpoint.
  if(reportMove && [301,302,307,308].includes(response.status)) return {moved:true};
  if(response.status===404 || response.status===410)return null;
  if(!response.ok)throw new Error('GitHub repository lookup unavailable');
  return response.json();
}
export async function fetchPublicMakerRepository(fullName, fetcher = fetch, { reportMove=false } = {}) {
  const parts=fullName.split('/');
  if(parts.length!==2 || parts.some(part=>!/^[\w.-]+$/.test(part) || part==='.' || part==='..'))return null;
  return githubRepository('repos/'+parts.map(encodeURIComponent).join('/'),fetcher,reportMove);
}
export async function fetchMakerRepositoryById(id,fetcher=fetch) {
  if(!validUser(id))return null;
  return githubRepository('repositories/'+id,fetcher);
}

/**
 * Server-only Request/Response handler for Vercel /api/maker. Never instantiate
 * with an in-memory or client-accessible adapter. consumeFlow must be atomic.
 * Durable adapter methods receive digests, not raw cookies; values have expiresAt (ms).
 */
export function createMakerRuntime({ enabled, site, origin, clientId, clientSecret, store, makeService, fetch: fetcher = fetch, now = Date.now } = {}) {
  let base;
  try { base = new URL(origin); } catch { /* disabled */ }
  if (enabled !== true || site !== 'directory' || base?.protocol !== 'https:' || base?.origin !== origin
    || base.hostname === 'skills.suedeai.ai' || typeof clientId !== 'string' || !clientId.trim()
    || typeof clientSecret !== 'string' || !clientSecret.trim() || store?.durable !== true || typeof makeService !== 'function'
    || ['saveFlow', 'consumeFlow', 'saveSession', 'readSession', 'deleteSession'].some(key => typeof store[key] !== 'function')) {
    return async () => error(503, 'maker_unavailable');
  }
  const user = async session => {
    if (typeof session !== 'string' || !opaque.test(session)) return null;
    const record = await store.readSession(hash(session));
    return validUser(record?.userId) && record.expiresAt > now() ? record.userId : null;
  };
  const service = makeService({ user, repository: (name,opts) => fetchPublicMakerRepository(name,fetcher,opts), repositoryById: id=>fetchMakerRepositoryById(id,fetcher) });
  if (!service) return async () => error(503, 'maker_unavailable');
  const callbackUri = origin + httpPath + '/?action=callback';
  const knownErrors = { sign_in_required: 401, listing_not_found: 404, ownership_not_verified: 403, listing_already_claimed: 409,
    edit_conflict: 409, recovery_conflict: 409, invalid_posts: 400, invalid_request: 400, nothing_to_withdraw: 409, already_pending: 409, stale_request: 409, moderator_required: 403, self_review_forbidden: 403, invalid_profile: 400, invalid_decision: 400, stale_revision: 409 };
  const post = ['claim', 'submit', 'review', 'ask', 'resolve-request', 'withdraw', 'recover', 'logout'];
  return async request => {
    const address = new URL(request.url);
    if (address.origin !== origin || !([httpPath, httpPath + '/'].includes(address.pathname))) return error(404, 'not_found');
    const action = address.searchParams.get('action') || '';
    if (![...post, 'sign-in', 'callback', 'listing', 'review-queue', 'inbox'].includes(action)) return error(404, 'not_found');
    if (request.method !== (post.includes(action) ? 'POST' : 'GET')) return error(405, 'method_not_allowed');
    if (post.includes(action) && request.headers.get('Origin') !== origin) return error(403, 'origin_required');
    const id = address.searchParams.get('id') || '';
    const validId = id.length <= 100 && allowedListing.test(id);
    const session = readCookie(request, SESSION);
    try {
      if (action === 'sign-in') {
        const state = makeOpaque();
        const verifier = makeOpaque();
        await store.saveFlow(hash(state), { verifier, listingId: validId ? id : '', expiresAt: now() + FLOW_TTL * 1000 });
        const github = new URL('https://github.com/login/oauth/authorize');
        github.search = new URLSearchParams({ client_id: clientId, redirect_uri: callbackUri, state, code_challenge_method: 'S256', code_challenge: hash(verifier), prompt: 'select_account' }).toString();
        return redirect(github.href, cookieLine(FLOW, state, FLOW_TTL));
      }
      if (action === 'callback') {
        const state = address.searchParams.get('state') || '', binding = readCookie(request, FLOW), code = address.searchParams.get('code') || '';
        const clear = cookieLine(FLOW, '', 0);
        if (!binding || !opaque.test(state) || !timingSafeEqual(Buffer.from(state), Buffer.from(binding)) || !code || code.length > 512) return error(400, 'invalid_oauth_callback', [clear]);
        const flow = await store.consumeFlow(hash(state));
        if (!flow || !(flow.expiresAt > now()) || !opaque.test(flow.verifier)) return error(400, 'invalid_oauth_callback', [clear]);
        try {
          const token = await fetcher('https://github.com/login/oauth/access_token', {
            method: 'POST', headers: { Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(8000),
            body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: callbackUri, code_verifier: flow.verifier }),
          });
          if (!token.ok) return error(502, 'github_sign_in_failed', [clear]);
          const creds = await token.json();
          if (creds.scope !== '' || creds.token_type !== 'bearer' || typeof creds.access_token !== 'string' || !/^[\w-]{1,512}$/.test(creds.access_token)) return error(502, 'github_sign_in_failed', [clear]);
          const identity = await fetcher('https://api.github.com/user', {
            headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + creds.access_token },
            redirect: 'error', signal: AbortSignal.timeout(8000),
          });
          if (!identity.ok) return error(502, 'github_sign_in_failed', [clear]);
          const { id: userId } = await identity.json();
          if (!validUser(userId)) return error(502, 'github_sign_in_failed', [clear]);
          if (session) await store.deleteSession(hash(session));
          const fresh = makeOpaque();
          await store.saveSession(hash(fresh), { userId, expiresAt: now() + SESSION_TTL * 1000 });
          const returnId = typeof flow.listingId === 'string' && flow.listingId.length <= 100 && allowedListing.test(flow.listingId) ? '?id=' + flow.listingId : '';
          return redirect('/maker/' + returnId, clear, cookieLine(SESSION, fresh, SESSION_TTL));
        } catch {
          return error(502, 'github_sign_in_failed', [clear]);
        }
      }
      if (action === 'logout') {
        if (session) await store.deleteSession(hash(session));
        return new Response(null, { status: 204, headers: { ...noStore, 'Set-Cookie': cookieLine(SESSION, '', 0) } });
      }
      if (!(await user(session))) return error(401, 'sign_in_required');
      if (!validId) return error(404, 'listing_not_found');
      let result;
      if (action === 'listing') result = await service.get(session, id);
      if (action === 'claim') result = await service.claim(session, id);
      if (action === 'inbox') result = await service.inbox(session,id);
      if (action === 'review-queue') result = await service.getForReview(session, id);
      if (['review','submit','ask','resolve-request','withdraw','recover'].includes(action)) {
        let body;
        try { body = await boundedJson(request); } catch { return error(400, 'invalid_json'); }
        if (action === 'submit') {
          if(!body || Object.keys(body).length!==2 || !Object.hasOwn(body,'profile') || !Object.hasOwn(body,'expected'))return error(400,'invalid_request');
          result = await service.submit(session,id,body.profile,body.expected);
        } else if (action === 'withdraw') {
          if(!body || Object.keys(body).length!==1 || !Object.hasOwn(body,'expected'))return error(400,'invalid_request');
          result = await service.withdraw(session,id,body.expected);
        } else if (action === 'recover') result = await service.recover(session,id,body);
        else if (action === 'ask') result = await service.ask(session,id,body);
        else if (action === 'resolve-request') result = await service.resolveRequest(session,id,body);
        else result = await service.review(session, id, body?.version, body?.decision);
      }
      return Response.json(result, { headers: noStore });
    } catch (caught) {
      const code = caught?.code;
      return Object.hasOwn(knownErrors, code) ? error(knownErrors[code], code) : error(503, 'maker_unavailable');
    }
  };
}
