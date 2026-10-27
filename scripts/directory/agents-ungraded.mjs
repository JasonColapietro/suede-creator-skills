// Discovery facts only. Admission here does not create an assessment or rating.
import fs from 'node:fs';
import path from 'node:path';
const need=(condition,message)=>{if(!condition)throw new Error(`Ungraded agents: ${message}`);};
const exact=(value,keys,label)=>need(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join('|')===[...keys].sort().join('|'),`${label} has invalid fields`);
const text=(value,label,max=500)=>need(typeof value==='string'&&value.trim()===value&&value.length>0&&value.length<=max,`${label} must be nonempty text`);
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function date(value,label){need(typeof value==='string'&&/^\d{4}-\d\d-\d\d$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value,`${label} must be a valid date`);}
function safeUrl(value){
 text(value,'source URL',1500);let u;try{u=new URL(value);}catch{need(false,'source URL must be public HTTPS');}
 need(u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&[...u.searchParams.keys()].every(k=>['id','language','type'].includes(k))&&!/[\u0000-\u0020\u007f\\]/.test(value)&&u.hostname.includes('.')&&!/^(?:localhost|\[|\d+\.)/i.test(u.hostname)&&! /\.(?:local|localhost|internal)$/i.test(u.hostname),'source URL must be public HTTPS without credentials or unsupported query parameters');
 return u;
}
function urlKey(value){const u=new URL(value);return (u.hostname.replace(/^www\./,'')+u.pathname.replace(/\/+$/,'').replace(/\.git$/,'')).toLowerCase();}
const nameKey=value=>value.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
export function validateUngradedCatalog(catalog,assessedProducts=[],now=new Date().toISOString().slice(0,10)){
 exact(catalog,['schema_version','generated','entries'],'catalog');need(catalog.schema_version===1,'unsupported schema version');date(catalog.generated,'catalog date');date(now,'current date');need(catalog.generated<=now,'catalog date is in the future');need(Array.isArray(catalog.entries),'entries must be an array');
 const ids=new Set(assessedProducts.map(p=>p.id)),names=new Set(assessedProducts.map(p=>nameKey(p.name))),urls=new Set(assessedProducts.flatMap(p=>[urlKey(p.url),...p.editions.filter(e=>e.source).map(e=>urlKey('https://github.com/'+e.source.repository))]));
 for(const e of catalog.entries){
  exact(e,['id','name','summary','tasks','deployments','sourceAvailability','officialUrl','repositoryUrl','sourceUrls','observedAt'],'entry');
  need(typeof e.id==='string'&&slug.test(e.id)&&!['ungraded','methodology','submit','evidence','search-index'].includes(e.id),'invalid entry ID');text(e.name,'name',100);text(e.summary,'summary');
  need(Array.isArray(e.tasks)&&e.tasks.length>0&&e.tasks.length<=6&&e.tasks.every(t=>typeof t==='string'&&slug.test(t))&&new Set(e.tasks).size===e.tasks.length,'tasks must be unique slugs');
  need(Array.isArray(e.deployments)&&e.deployments.length>0&&e.deployments.every(d=>['local','self-hosted','hosted'].includes(d))&&new Set(e.deployments).size===e.deployments.length,'invalid deployments');need(['public-source','not-reviewed'].includes(e.sourceAvailability),'invalid source availability');safeUrl(e.officialUrl);
  if(e.repositoryUrl!==null){const u=safeUrl(e.repositoryUrl);need(['github.com','gitlab.com'].includes(u.hostname)&&/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(u.pathname)&&!u.hash,'repository must be a canonical public repository URL');}
  need((e.sourceAvailability==='public-source')===(e.repositoryUrl!==null),'public source requires a repository; unreviewed source must not imply one');
  need(Array.isArray(e.sourceUrls)&&e.sourceUrls.length>0&&e.sourceUrls.length<=8&&new Set(e.sourceUrls).size===e.sourceUrls.length,'source URLs must be nonempty and unique');e.sourceUrls.forEach(safeUrl);
  date(e.observedAt,'source observation date');need(e.observedAt<=catalog.generated,'source observation date is in the future');
  const links=[e.officialUrl,e.repositoryUrl].filter(Boolean).map(urlKey);
  need(!ids.has(e.id)&&!names.has(nameKey(e.name))&&!links.some(k=>urls.has(k)),`duplicate product: ${e.name}`);
  ids.add(e.id);names.add(nameKey(e.name));links.forEach(k=>urls.add(k));
 }
 return structuredClone(catalog);
}
export function loadUngradedCatalog(root,assessedProducts=[]){
 const file=path.join(root,'directory/agents/ungraded.json');
 return fs.existsSync(file)?validateUngradedCatalog(JSON.parse(fs.readFileSync(file,'utf8')),assessedProducts):null;
}
