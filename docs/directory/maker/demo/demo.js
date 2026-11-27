(() => {
  'use strict';
  const {initial,advance,validate,badge}=window.SuedeDemo;
  const screen=document.querySelector('#screen'), stepper=document.querySelector('#steps'), status=document.querySelector('#status'), preview=document.querySelector('#maker-preview');
  const tags={listing:'Listing',signin:'Sign in',claim:'Verify',edit:'Edit',preview:'Preview',pending:'Review',changes:'Review',live:'Live example'};
  const exampleKeys=['listing','signin','claim','edit','preview','pending','live'];
  let state=initial();
  const box=(tag,value,cls)=>{
    const e=document.createElement(tag);
    if(value)e.textContent=value;
    if(cls)e.className=cls;
    return e;
  };
  function title(text){
    const h=box('h2',text); h.id='stage-title';h.tabIndex=-1;screen.append(h);
  }
  function act(text,action,group,secondary=false){
    const b=box('button',text,secondary?'secondary':null); b.type='button';
    b.addEventListener('click',()=>go(action));group.append(b);return b;
  }
  function actions(...items){
    const group=box('div',null,'actions');
    for(const [text,action,secondary] of items)act(text,action,group,secondary);
    screen.append(group);
  }
  function body(s){screen.append(box('p',s));}
  function showFields(){
    preview.replaceChildren();preview.hidden=true;
    if(!['preview','pending','live'].includes(state.step))return;
    preview.hidden=false;
    preview.append(box('p',state.step==='live'?'APPROVED EXAMPLE':'NOT PUBLIC · PREVIEW','eyebrow'),box('h3','From the maker'));
    const values=state.fields;
    if(values.statement)preview.append(box('p',values.statement));
    const dt=box('dl');
    for(const [key,label] of [['website','Official website'],['social1','Social link'],['social2','Second social link']]){
      if(!values[key])continue;
      dt.append(box('dt',label),box('dd',values[key]));
    }
    if(dt.children.length) preview.append(dt);
    if(!Object.values(values).some(Boolean))preview.append(box('p','No details entered in this run.'));
  }
  function form(){
    const f=box('form');f.noValidate=true;
    const fb=[
      ['website','Official website','url','https://your-project.example'],
      ['social1','Public social profile','url','https://social.example/your-project'],
      ['social2','Second public social profile','url','https://another-social.example/your-project'],
      ['statement','Maker statement','text','What did you build, and who is it for?']
    ];
    for(const [key,label,type,placeholder] of fb){
      const l=box('label',label+' (optional)');l.htmlFor=key;
      const input=box(key==='statement'?'textarea':'input');input.id=input.name=key;if(key!=='statement')input.type=type;input.placeholder=placeholder;input.maxLength=key==='statement'?320:400;
      input.value=state.fields[key];
      input.setAttribute('aria-describedby',key+'-error');
      const error=box('p',null,'field-error');error.id=key+'-error';error.hidden=true;
      f.append(l,input,error);
    }
    const count=box('p','0 / 320 characters','field-note');
    const stmt=f.elements.statement; const updateCount=()=>{count.textContent=stmt.value.length+' / 320 characters';};stmt.addEventListener('input',updateCount);updateCount();
    const b=box('button','Preview changes');b.type='submit';
    f.append(count,b);screen.append(f);
    f.addEventListener('submit',event=>{
      event.preventDefault();
      const values=Object.fromEntries(new FormData(f));
      const errors=validate(values);
      for(const input of [...f.elements].filter(x=>x.name)){
        const problem=errors[input.name];
        input.setAttribute('aria-invalid',String(!!problem));
        const note=document.getElementById(input.name+'-error');
        note.textContent=problem||'';note.hidden=!problem;
      }
      if(Object.keys(errors).length){status.textContent='Check the highlighted fields.';f.elements[Object.keys(errors)[0]].focus();return;}
      go('preview',values);
    });
  }
  function share(){
    const fig=box('figure',null,'share-card');fig.append(box('p','SUEDE SKILLS DIRECTORY  ·  FEATURED'),box('strong','Tideline Studio'),box('figcaption','Share card example · Fictional project'));screen.append(fig);
    const pre=box('pre',badge());pre.tabIndex=0;pre.setAttribute('aria-label','Sample Markdown badge snippet');screen.append(pre);
    const group=box('div',null,'actions');
    const cp=box('button','Copy sample badge');cp.type='button';
    cp.addEventListener('click',async()=>{
      try { await navigator.clipboard.writeText(badge());status.textContent='Copied sample badge.'; }
      catch { const range=document.createRange();range.selectNodeContents(pre);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);pre.focus();status.textContent='Sample badge selected. Use your keyboard to copy.'; }
    });
    group.append(cp);act('Restart demo','reset',group,true);screen.append(group);
  }
  function render(focus=false){
    screen.replaceChildren();stepper.replaceChildren();status.textContent='';
    for(const step of exampleKeys){const e=box('span',tags[step]);if(step===state.step||(step==='pending'&&state.step==='changes'))e.setAttribute('aria-current','step');stepper.append(e);}
    switch(state.step){
      case 'listing':title('Start with your existing listing');body('The current page stays as it is while you add or correct your project details. The live version of this workflow will start from your real listing.');actions(['Start demo','start']);break;
      case 'signin':title('Sign in with GitHub');body('Use the account that belongs to your project. This demo does not open GitHub or use your account.');actions(['Simulate GitHub sign-in','signin']);break;
      case 'claim':title('Verify the exact listing');body('Sign-in identifies your account. Access is confirmed separately for each listing. Organization projects may need a manual ownership check.');actions(['Simulate verified claim','claim']);break;
      case 'edit':title('Add your details');body('These fields start blank. Use your official links and tell visitors what they can do with the project. Use sample text here; nothing is sent or saved.');form();break;
      case 'preview':title('Check the visitor view');body('Your changes appear separately from Suede’s editorial write-up. Check each detail before submitting it for review.');actions(['Simulate submit for review','submit'],['Back to edit','edit',true]);break;
      case 'pending':title('Changes in review');body('The existing listing remains public. A reviewer checks your proposed details and may send them back for a correction. See how each outcome looks below.');actions(['Show approved example','show-approved'],['Show requested changes','needs-changes',true]);break;
      case 'changes':title('A reviewer asks for a correction');body('Example: “Please confirm this is your project’s official website.” Your draft is still editable. Nothing has been published.');actions(['Return to draft','edit']);break;
      case 'live':title('Approved and visible');body('Example only. Here’s what an approved profile and share assets could look like. A real maker will get their actual listing link and badge.');share();break;
    }
    showFields();
    if(!preview.hidden){
      const mobile=preview.cloneNode(true);mobile.removeAttribute('id');mobile.classList.add('mobile-preview');
      screen.insertBefore(mobile,screen.querySelector('.actions')||screen.querySelector('.share-card')||null);
    }
    if(focus)document.getElementById('stage-title').focus();
  }
  function go(action,fields){const next=advance(state,action,fields);if(next!==state){state=next;render(true);}}
  render();
})();
