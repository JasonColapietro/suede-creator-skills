(function expose(factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else window.SuedeDemo=api;
})(function(){
  'use strict';
  const keys=['website','social1','social2','statement'];
  const empty=()=>Object.fromEntries(keys.map(key=>[key,'']));
  const initial=()=>({step:'listing',fields:empty()});
  const normalize=(values={})=>Object.fromEntries(keys.map(k=>[k,typeof values[k]==='string'?values[k].trim():'']));
  const publicHttps=(input)=>{
    try {
      const u=new URL(input);
      const host=u.hostname;
      return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&host.includes('.')&&
        !/^[\d.]+$/.test(host)&& !host.includes(':') && !/\.(local|internal|localhost)$/.test(host);
    } catch { return false; }
  };
  const validate=(values)=>{
    const v=normalize(values), errors={};
    if(!Object.values(v).some(Boolean)) errors.statement='Add at least one detail to preview your profile.';
    for(const k of keys.slice(0,3)) if(v[k]&&(v[k].length>400||!publicHttps(v[k]))) errors[k]='Enter a public HTTPS link.';
    if(v.social1&&v.social2&&v.social1.replace(/\/$/,'')===v.social2.replace(/\/$/,'')) errors.social2='Use a different profile or leave this blank.';
    if(v.statement.length>320) errors.statement='Keep your statement to 320 characters.';
    return errors;
  };
  function advance(state,action,fields){
    if(action==='reset') return initial();
    const next={ listing:{start:'signin'},signin:{signin:'claim'},claim:{claim:'edit'},edit:{preview:'preview'},preview:{edit:'edit',submit:'pending'},pending:{'needs-changes':'changes','show-approved':'live'},changes:{edit:'edit'} }[state.step]?.[action];
    if(!next) return state;
    if(action==='preview'){
      const values=normalize(fields);
      if(Object.keys(validate(values)).length) return state;
      return {step:next,fields:values};
    }
    return {...state,step:next};
  }
  const badge=()=> '[![Featured in Suede Skills Directory](https://directory.example/badges/featured.svg)](https://directory.example/featured/#tideline-studio)';
  return {initial,advance,validate,badge};
});
