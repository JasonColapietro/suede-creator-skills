(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const content = JSON.parse(byId('suede-content').textContent);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = byId('scene');
  const wheel = byId('rolewheel');
  const roleSlot = byId('roleslot');
  const agent = scene.querySelector('.aghead');
  const buttons = byId('sc-tools');
  const img = url => Object.assign(document.createElement('img'), {src: url, alt: '', decoding: 'async'});
  const el = (tag, text, className = '') => {
    const node = document.createElement(tag);
    node.textContent = text;
    node.className = className;
    return node;
  };

  let currentRole = 0;
  let rotation;
  function fitWord() {
    roleSlot.style.width = Math.ceil(wheel.children[currentRole].getBoundingClientRect().width) + 'px';
  }
  function updateScene(next) {
    currentRole = next % content.roles.length;
    const role = content.roles[currentRole];
    const [name, logo] = content.agents[currentRole % content.agents.length];
    roleSlot.setAttribute('aria-label',role.name);
    wheel.style.transform = 'translateY(-' + (currentRole * 1.28) + 'em)';
    fitWord();
    byId('sc-agimg').replaceChildren(img(logo));
    byId('sc-agname').textContent = name;
    byId('sc-agrole').textContent = role.tag;
    byId('sc-toollab').textContent = role.belt;
    byId('sc-foot').textContent = role.foot;
    byId('sc-cli').querySelector('code').textContent = role.cli;
    const steps = role.steps.map((label, index) => {
      const row = el('li','','hst');
      const icon = el('span','','step-icon');
      icon.setAttribute('aria-hidden','true');
      if (index === role.steps.length - 1) icon.textContent = '✓';
      else icon.append(img(content.logo));
      const tick = el('i','✓');
      tick.setAttribute('aria-hidden','true');
      row.append(icon, el('span',label), tick);
      return row;
    });
    const tools = role.tools.map(([name, logo], index) => {
      const button = el('button','','htool');
      button.type = 'button';
      button.dataset.tool = index;
      button.setAttribute('aria-pressed','false');
      button.setAttribute('aria-label','Highlight ' + name);
      button.append(img(logo),el('span',name));
      return button;
    });
    byId('sc-steps').replaceChildren(...steps);
    buttons.replaceChildren(...tools,el('span',role.more,'htool more'));
    if (!reduced.matches) {
      [...steps,...tools].forEach((node,index) => node.animate(
        [{opacity:0,translate:'0 6px'}, {opacity:1,translate:'0 0'}],
        {duration:400,delay:index*55,fill:'backwards',easing:'ease-out'}
      ));
    }
    window.dispatchEvent(new CustomEvent('suede:rolechange',{detail:{index:currentRole}}));
  }
  function startClock() {
    clearInterval(rotation);
    if (reduced.matches || content.roles.length < 2) return;
    rotation = setInterval(() => {
      if (document.hidden || byId('signin-scrim').open || scene.contains(document.activeElement) ||
          document.documentElement.classList.contains('opening-stage') || window.scrollY >= innerHeight * .8) return;
      updateScene(currentRole + 1);
    },3400);
  }
  wheel.replaceChildren(...content.roles.map(role => el('span',role.name)));
  updateScene(0);
  startClock();
  agent.addEventListener('click', () => {
    if (document.documentElement.classList.contains('opening-stage')) return;
    updateScene(currentRole + 1);
    if (!reduced.matches) agent.animate([{scale:'.986'},{scale:'1.01',offset:.45},{scale:'1'}],{duration:420});
    startClock();
  });
  window.addEventListener('resize',fitWord);
  document.fonts.ready.then(fitWord);
  reduced.addEventListener('change',startClock);
  window.addEventListener('pagehide',() => clearInterval(rotation));
  window.addEventListener('pageshow',startClock);

  const tabs = [...document.querySelectorAll('[role=tab]')];
  const narrow = matchMedia('(max-width: 700px)');
  let currentTab = 0;
  function selectTab(index, focus = false) {
    currentTab = index;
    tabs.forEach((tab,i) => {
      const selected = i === index;
      tab.tabIndex = selected ? 0 : -1;
      tab.setAttribute('aria-selected',selected);
      const panel = byId(tab.getAttribute('aria-controls'));
      if (narrow.matches) {
        panel.setAttribute('role','tabpanel');
        panel.setAttribute('aria-labelledby',tab.id);
      } else {
        panel.removeAttribute('role');
        panel.removeAttribute('aria-labelledby');
      }
    });
    document.querySelectorAll('.catwrap [data-cat]').forEach(panel => panel.classList.toggle('off', Number(panel.dataset.cat) !== index));
    if (focus) tabs[index].focus({preventScroll:true});
    if (narrow.matches && focus) tabs[index].scrollIntoView({block:'nearest',inline:'nearest',behavior: reduced.matches ? 'auto' : 'smooth'});
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener('click',() => selectTab(i));
    tab.addEventListener('keydown',event => {
      const dest = {ArrowLeft:(i + tabs.length - 1)%tabs.length,ArrowRight:(i+1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
      if (dest !== undefined) { event.preventDefault(); selectTab(dest,true); }
    });
  });
  selectTab(0);
  document.documentElement.classList.add('tabs-ready');
  narrow.addEventListener('change',() => selectTab(currentTab));

  const copy = byId('copybtn');
  let feedback;
  copy.addEventListener('click',async () => {
    const command = byId('cmd').textContent;
    let copied = false;
    try {
      if (!navigator.clipboard) throw new Error('No clipboard API');
      await navigator.clipboard.writeText(command);
      copied = true;
    } catch {
      const buffer = document.createElement('textarea');
      buffer.className = 'sr-only';
      buffer.value = command;
      document.body.append(buffer);
      buffer.select();
      try { copied = document.execCommand('copy'); } catch {}
      buffer.remove();
      copy.focus({preventScroll:true});
    }
    clearTimeout(feedback);
    copy.querySelector('.copy-result').textContent = copied ? '✓ copied' : 'retry';
    byId('copy-status').textContent = copied ? 'Copied agent command' : 'Copy failed. Select and copy the command.';
    copy.classList.add('copy-feedback');
    feedback = setTimeout(() => {
      copy.classList.remove('copy-feedback');
      byId('copy-status').textContent = '';
    },2200);
  });

  const dialog = byId('signin-scrim');
  document.querySelectorAll('[data-start]').forEach(trigger => trigger.addEventListener('click',event => {
    if (typeof dialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialog.showModal();
    dialog.classList.add('open');
    (dialog.querySelector('input') || dialog.querySelector('.modal-actions a')).focus();
  }));
  dialog.querySelector('.cls').addEventListener('click',() => dialog.close());
  dialog.addEventListener('click',event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close',() => dialog.classList.remove('open'));

  // A timeline only runs while the demo is in view. Changing motion preference
  // immediately presents the complete example or resumes the illustrated sequence.
  function animatedDemo(target, play, settle) {
    let timeouts = [];
    let visible = false;
    const schedule = (ms, fn) => { timeouts.push(setTimeout(fn,ms)); };
    function stop() {
      timeouts.forEach(clearTimeout);
      timeouts = [];
    }
    function update() {
      stop();
      if (reduced.matches) { settle(); return; }
      if (visible && !document.hidden) {
        const cycle = () => {
          timeouts = [];
          const duration = play(schedule);
          if (duration > 0) schedule(duration,cycle);
        };
        cycle();
      }
    }
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      update();
    },{threshold:.35}).observe(target);
    document.addEventListener('visibilitychange',update);
    reduced.addEventListener('change',update);
    window.addEventListener('pagehide',stop);
    window.addEventListener('pageshow',event => { if (event.persisted) update(); });
  }

  const cap = byId('cap');
  const q = byId('capq');
  let demoIndex = 0;
  function drawDemo(example) {
    const rows = example.items.map(item => {
      const row = el('div','','cap-row');
      const logo = el('span','','cap-logo');
      logo.append(img(item[3]));
      row.append(logo,el('b',item[0]),el('small',item[1]),el('em','✓'));
      return row;
    });
    byId('caprows').replaceChildren(...rows);
    byId('capt').textContent = example.title;
    byId('capn').textContent = example.items.length + ' matches';
    byId('caprestxt').textContent = example.result;
    return rows;
  }
  function finishCap(rows) {
    cap.classList.add('answered');
    rows[0].classList.add('picked');
    rows[0].querySelector('em').textContent = 'match ✓';
    cap.querySelector('.cap-h').classList.add('shown');
    rows.forEach(row => row.classList.add('shown'));
  }
  animatedDemo(cap, schedule => {
    const example = content.demos[demoIndex++ % content.demos.length];
    const rows = drawDemo(example);
    q.textContent = '';
    cap.classList.add('playing');
    cap.classList.remove('answered');
    cap.querySelector('.cap-h').classList.remove('shown');
    byId('capwf').classList.remove('shown');
    const chars = [...example.ask];
    chars.forEach((ch,i) => schedule(300 + i*36,() => { q.textContent += ch; }));
    const typed = 300 + chars.length*36;
    schedule(typed+320,() => cap.querySelector('.cap-h').classList.add('shown'));
    rows.forEach((row,i) => schedule(typed+700+i*140,() => row.classList.add('shown')));
    const scan = typed + 920 + rows.length*140;
    rows.forEach((row,i) => {
      schedule(scan+i*150,() => row.classList.add('scan'));
      schedule(scan+i*150+160,() => row.classList.remove('scan'));
    });
    const answer = scan + rows.length*150 + 190;
    schedule(answer,() => finishCap(rows));
    schedule(answer+900,() => byId('capwf').classList.add('shown'));
    return answer+4800;
  },() => {
    const example = content.demos[0];
    q.textContent = example.ask;
    finishCap(drawDemo(example));
    byId('capwf').classList.add('shown');
  });

  const ledger = byId('ledger');
  const ledgerRows = [...ledger.children];
  animatedDemo(ledger,schedule => {
    ledger.classList.add('playing');
    byId('lwf').classList.remove('shown');
    ledgerRows.forEach((row,i) => {
      row.classList.remove('shown','changed');
      schedule(250+i*170,() => row.classList.add('shown'));
    });
    const flip = 950 + 170*ledgerRows.length;
    ledgerRows.forEach((row,i) => schedule(flip+i*380,() => row.classList.add('changed')));
    const done = flip+ledgerRows.length*380+350;
    schedule(done,() => byId('lwf').classList.add('shown'));
    return done+4600;
  },() => {
    ledgerRows.forEach(row => row.classList.add('shown','changed'));
    byId('lwf').classList.add('shown');
  });

  const equation = byId('zeqtxt');
  const band = byId('zeroband');
  let letters = 0;
  const length = content.equation.join('').length;
  function equationAt(count) {
    let left = count;
    equation.replaceChildren(...content.equation.map((part,i) => {
      const visible = part.slice(0,Math.max(0,left));
      left -= part.length;
      return i === 1 ? el('b',visible) : document.createTextNode(visible);
    }));
    if (count === length) band.classList.add('complete');
  }
  if (!reduced.matches) equationAt(0);
  animatedDemo(band,schedule => {
    for (let i=letters+1; i<=length; i++) {
      schedule((i-letters)*38,() => { letters=i; equationAt(i); });
    }
    return 0;
  },() => { letters=length; equationAt(length); });
})();
