import { curatedPosts } from './post-links.mjs';
export const validId = id => typeof id === 'string' && id.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
const actions = ['sign-in','listing','claim','submit','logout','ask','resolve-request','review-queue','review','withdraw','inbox','recover'];
export function route(action,id) {
  if (!actions.includes(action) || !validId(id)) throw new Error('listing_not_found');
  return '/api/maker/?' + new URLSearchParams({action,id});
}
export async function request(action,id,data,fetcher=fetch) {
  const method = ['listing','review-queue','inbox'].includes(action) ? 'GET' : 'POST';
  let response;
  try {
    response = await fetcher(route(action,id),{method,credentials:'same-origin',cache:'no-store',redirect:'error',
      ...(data ? {headers:{'Content-Type':'application/json'},body:JSON.stringify(data)} : {})});
    if (response.status === 204 && action === 'logout') return;
    if (!response.headers.get('content-type')?.startsWith('application/json')) throw new Error();
  } catch { throw new Error('maker_unavailable'); }
  let value;
  try { value = await response.json(); } catch { throw new Error('maker_unavailable'); }
  if (!response.ok) {
    const allowed={401:['sign_in_required'],404:['listing_not_found'],403:['ownership_not_verified'],409:['listing_already_claimed','edit_conflict','recovery_conflict','nothing_to_withdraw','already_pending','stale_request','stale_revision'],400:['invalid_profile','invalid_request','invalid_posts']};
    throw new Error(allowed[response.status]?.includes(value?.error) ? value.error : 'maker_unavailable');
  }
  return value;
}
export function parseListing(value,id) {
  if (value?.listing?.id !== id || typeof value.listing.name !== 'string' || typeof value.claimed !== 'boolean') throw new Error('maker_unavailable');
  const revision=value.claimed && ['pending','approved','rejected'].includes(value.revision?.status) ? value.revision : null;
  return {listing:value.listing,claimed:value.claimed,revision,moderator:value.moderator===true,canWithdraw:value.claimed&&value.canWithdraw===true,editVersion:value.claimed?value.editVersion:null,requests:value.claimed && Array.isArray(value.requests) ? value.requests : []};
}
function cleanURL(s) {
  if (!s) return '';
  if (typeof s !== 'string') throw new Error('invalid_profile');
  let url;
  try { url = new URL(s); } catch { throw new Error('invalid_profile'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !url.hostname.includes('.') ||
      s.length > 512 || /\s/u.test(s)) throw new Error('invalid_profile');
  return s;
}
export function payload(website,socials,statement,demo='',posts=[]) {
  const data={website:cleanURL(website.trim()),socials:[...new Set(socials.map(s=>cleanURL(s.trim())).filter(Boolean))],statement:statement.trim()};
  if (demo.trim()) data.demo=cleanURL(demo.trim());
  const curated=curatedPosts(posts.map(s=>s.trim()).filter(Boolean));
  if (curated.length) data.posts=curated.map(p=>p.href);
  if ((!data.demo && !data.posts?.length && !data.website && !data.socials.length && !data.statement) || [...data.statement].length > 320 ||
      /[<>]/u.test(data.statement) || data.socials.length > 4) throw new Error('invalid_profile');
  return data;
}
export function publicURL(s) {
  try { return cleanURL(s); } catch { return ''; }
}
