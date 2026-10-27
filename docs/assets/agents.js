/* Progressive enhancement: static evidence remains usable if this script fails. */
(() => {
 const form=document.getElementById('agent-filters');
 const now=new Date(new Date().toISOString().slice(0,10)+'T00:00:00Z');const stale=date=>now-new Date(date+'T00:00:00Z')>30*86400000;
 document.querySelectorAll('[data-reviewed-at]').forEach(el=>{if(stale(el.dataset.reviewedAt)&&!el.textContent.includes('Review overdue'))el.append(' · Review overdue');});
 if(!form)return;
 const container=document.getElementById('agent-results');
 const cards=[...container.querySelectorAll('.agent-card')];
 const keys=['q','task','deployment','source','license','evidence','sort'];
 function restore(){const params=new URLSearchParams(location.search);for(const k of keys){const el=form.elements.namedItem(k);const value=params.get(k)|| (k==='sort'?'name':'');el.value=value;if(el.tagName==='SELECT'&&el.selectedIndex<0)el.value=k==='sort'?'name':'';}}
 function update(write){
  const values=Object.fromEntries(keys.map(k=>[k,form.elements.namedItem(k).value]));
  const terms=values.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const sort=values.sort;const scored=sort!=='name';
  const shown=cards.filter(c=>{
   const d=c.dataset;
   return terms.every(t=>d.search.includes(t))&&(!values.task||d.task.split(' ').includes(values.task))&&['deployment','source','license'].every(k=>!values[k]||values[k]===d[k])&&(!values.evidence||(values.evidence==='stale'?stale(d.reviewed):values.evidence===d.evidence))&&(!scored||d[sort+'Status']!=='not_applicable');
  }).sort((a,b)=>{if(scored){const x=a.dataset[sort],y=b.dataset[sort];if(x===''&&y!=='')return 1;if(y===''&&x!=='')return -1;if(x!==y)return Number(y)-Number(x);}return a.dataset.productName.localeCompare(b.dataset.productName)||a.dataset.editionName.localeCompare(b.dataset.editionName);});
  cards.forEach(c=>{c.hidden=true;});shown.forEach(c=>{c.hidden=false;container.append(c);});
  document.getElementById('agent-count').textContent=`${new Set(shown.map(c=>c.dataset.product)).size} products · ${shown.length} editions`;
  document.getElementById('agent-empty').hidden=shown.length!==0;
  const names={documentation:'Documentation',repository:'Repository evidence',hosted:'Hosted disclosures'};
  document.getElementById('agent-sort-note').textContent=scored?`${names[sort]}: applicable editions only; incomplete reviews last. Evidence coverage is not runtime quality.`:'Ordered by name. Missing evidence never becomes a zero.';
  if(write){const params=new URLSearchParams();for(const k of keys)if(values[k]&&(k!=='sort'||values[k]!=='name'))params.set(k,values[k]);history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);}
 }
 restore();update(false);form.hidden=false;
 form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',()=>update(true));form.addEventListener('change',()=>update(true));
 form.addEventListener('reset',()=>setTimeout(()=>update(true),0));window.addEventListener('popstate',()=>{restore();update(false);});
})();

/* Ungraded product discovery never joins the assessed-edition score ranking. */
(() => {
 const form=document.getElementById('ungraded-filters');if(!form)return;
 const cards=[...document.querySelectorAll('#ungraded-results .ungraded-card')];
 const keys=['q','task','deployment','source'];
 function restore(){const params=new URLSearchParams(location.search);for(const k of keys){const el=form.elements.namedItem(k);el.value=params.get(k)||'';if(el.tagName==='SELECT'&&el.selectedIndex<0)el.value='';}}
 function update(write){
  const values=Object.fromEntries(keys.map(k=>[k,form.elements.namedItem(k).value]));
  const terms=values.q.toLowerCase().trim().split(/\s+/).filter(Boolean);let count=0;
  for(const card of cards){const d=card.dataset;card.hidden=!(terms.every(t=>d.search.includes(t))&&(!values.task||d.task.split(' ').includes(values.task))&&(!values.deployment||d.deployment.split(' ').includes(values.deployment))&&(!values.source||d.source===values.source));if(!card.hidden)count++;}
  document.getElementById('ungraded-count').textContent=`${count} ungraded agent${count===1?'':'s'}`;
  document.getElementById('ungraded-empty').hidden=count!==0;
  if(write){const params=new URLSearchParams();for(const k of keys)if(values[k])params.set(k,values[k]);history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);}
 }
 restore();update(false);form.hidden=false;
 form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',()=>update(true));form.addEventListener('change',()=>update(true));
 form.addEventListener('reset',()=>setTimeout(()=>update(true),0));window.addEventListener('popstate',()=>{restore();update(false);});
})();
