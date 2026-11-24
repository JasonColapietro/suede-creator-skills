// Strict, link-only permalinks. No provider API, embed, preview or network access.
const formats = [
  ['X', /^https:\/\/x\.com\/([A-Za-z0-9_]{1,15})\/status\/[1-9][0-9]{0,19}$/],
  ['Bluesky', /^https:\/\/bsky\.app\/profile\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\/post\/[234567a-z]{13}$/],
  ['LinkedIn', /^https:\/\/www\.linkedin\.com\/posts\/[\w-]+-activity-[0-9]{10,20}-[\w-]+\/?$/],
  ['Instagram', /^https:\/\/www\.instagram\.com\/(?:p|reel)\/[\w-]{3,32}\/?$/],
  ['YouTube', /^https:\/\/youtu\.be\/[A-Za-z0-9_-]{11}$/],
];
const reservedX=/^(?:home|search|explore|compose|intent|share|i|settings|messages|notifications)$/i;
export function curatedPosts(input) {
  const invalid=()=>{throw new Error('invalid_posts');};
  if (!Array.isArray(input) || input.length>3) invalid();
  const seen=new Set();
  return input.map(href=>{
    if(typeof href!=='string'||href.length>400||/[^\x21-\x7e]/.test(href)) invalid();
    const entry=formats.find(([label, pattern])=>{const m=pattern.exec(href); return m && (label!=='X'||!reservedX.test(m[1]));});
    if(!entry) invalid();
    const key=href.replace(/\/$/,'').replace(/^https:\/\/x\.com\/[^/]+\/status\//,'x-status:');
    if (seen.has(key)) invalid(); seen.add(key);
    return {label:entry[0],href};
  });
}
