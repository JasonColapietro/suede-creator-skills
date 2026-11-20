(() => {
  'use strict';
  const assets = new URL('.', document.currentScript.src);
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const coarse = matchMedia('(pointer: coarse)');
  const clamp = (n, max = 1) => Math.max(0, Math.min(max, n));
  const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
  const svgElement = (tag, values = {}) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(values).forEach(([attribute, value]) => el.setAttribute(attribute, value));
    return el;
  };

  const frameTasks = [];
  let lenis, frame = 0, intro = null, model = null;
  function run(now) {
    frame = 0;
    if (document.hidden) return;
    if (root.classList.contains('motion-off') !== reduced.matches) scrolling();
    lenis?.raf(now);
    const movement = intro?.(now);
    model?.(now, movement);
    frameTasks.forEach(task => task(now, movement, reduced.matches));
    frame = requestAnimationFrame(run);
  }
  function wake() { if (!frame && !document.hidden) frame = requestAnimationFrame(run); }
  function sleep() { cancelAnimationFrame(frame); frame = 0; }
  document.addEventListener('visibilitychange', () => document.hidden ? sleep() : wake());
  window.addEventListener('pagehide', sleep);
  window.addEventListener('pageshow', wake);

  function scrolling() {
    lenis?.destroy();
    lenis = null;
    root.classList.toggle('motion-off', reduced.matches);
    if (!reduced.matches && !coarse.matches && window.Lenis) {
      lenis = new window.Lenis({
        lerp: .12, smoothWheel: true, anchors: true,
        prevent: node => Boolean(node.closest?.('dialog,.scrim'))
      });
    }
    if (reduced.matches) window.suedeOpening?.release();
  }
  scrolling();
  reduced.addEventListener('change', scrolling);
  coarse.addEventListener('change', scrolling);
  const dialog = document.querySelector('#signin-scrim');
  if (dialog) new MutationObserver(() => {
    if (dialog.open || dialog.classList.contains('open')) lenis?.stop();
    else lenis?.start();
  }).observe(dialog, { attributes: true, attributeFilter: ['class','open'] });

  function connectGateway() {
    const scene = document.querySelector('#scene');
    const routes = scene?.querySelector('.gateway-routes');
    const tools = scene?.querySelector('#sc-tools');
    const gateway = scene?.querySelector('.gateway-sculpture');
    const agent = scene?.querySelector('.aghead');
    if (!routes || !gateway || !tools || !agent) return;
    let paths = [], scheduled = false, selected;
    function active(tile) {
      selected = tile;
      for (const entry of paths) {
        const highlighted = entry.tile === tile;
        entry.tile.classList.toggle('route-active', highlighted);
        entry.tile.setAttribute('aria-pressed', String(highlighted));
        entry.group.classList.toggle('route-active', highlighted);
      }
    }
    function paint() {
      scheduled = false;
      const rect = scene.getBoundingClientRect(), start = agent.getBoundingClientRect();
      const mark = scene.querySelector('.hcore');
      const fallback = gateway.dataset.modelState === 'fallback' && mark;
      const center = (fallback ? mark : gateway).getBoundingClientRect();
      const vertical = innerWidth <= 640;
      const cx = center.left - rect.left + center.width * (fallback ? .5 : .57);
      const cy = center.top - rect.top + center.height * (fallback ? .5 : .52);
      const sx = start.left - rect.left + start.width * (vertical ? .5 : 1);
      const sy = start.top - rect.top + start.height * (vertical ? 0 : .5);
      const defs = svgElement('defs');
      const mask = svgElement('mask', { id: 'suede-route-clearance', maskUnits: 'userSpaceOnUse',
        x: 0, y: 0, width: rect.width, height: rect.height });
      mask.append(svgElement('rect', { x: 0, y: 0, width: rect.width, height: rect.height, fill: 'white' }));
      defs.append(mask);
      const wiring = svgElement('g', { mask: 'url(#suede-route-clearance)' });
      const tiles = Array.from(tools.querySelectorAll('.htool:not(.more)'));
      for (const surface of [agent,...tiles]) {
        const box = surface.getBoundingClientRect();
        mask.append(svgElement('rect', { x: box.x - rect.x, y: box.y - rect.y, width: box.width,
          height: box.height, rx: parseFloat(getComputedStyle(surface).borderRadius) || 0, fill: 'black' }));
      }
      paths = tiles.map(tile => {
        const end = tile.getBoundingClientRect();
        const ex = end.left - rect.left + (vertical ? end.width / 2 : 0);
        const ey = end.top - rect.top + (vertical ? 0 : end.height / 2);
        const path = vertical
          ? `M${sx} ${sy} C${sx} ${cy},${cx} ${sy - 50},${cx} ${cy} S${ex} ${cy + 40},${ex} ${ey}`
          : `M${sx} ${sy} C${sx + 90} ${sy},${cx - 100} ${cy},${cx} ${cy} C${cx + 110} ${cy},${ex - 75} ${ey},${ex} ${ey}`;
        const group = svgElement('g');
        group.append(svgElement('path', { d: path }), svgElement('path', { d: path, pathLength: 100, class: 'route-pulse' }));
        wiring.append(group);
        return { tile, group };
      });
      routes.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
      routes.replaceChildren(defs, wiring);
      active(selected?.isConnected ? selected : null);
    }
    function schedule() {
      if (!scheduled) { scheduled = true; requestAnimationFrame(paint); }
    }
    for (const type of ['pointerover','focusin','click']) tools.addEventListener(type, e => active(e.target.closest('.htool:not(.more)')));
    tools.addEventListener('pointerleave', () => active(tools.querySelector(':focus-visible')));
    tools.addEventListener('focusout', e => active(e.relatedTarget?.closest?.('.htool:not(.more)')));
    const observer = new ResizeObserver(schedule);
    [scene, agent, tools, gateway].forEach(node => observer.observe(node));
    new MutationObserver(schedule).observe(tools, { childList: true });
    new MutationObserver(schedule).observe(gateway, { attributes: true, attributeFilter: ['data-model-state'] });
    window.addEventListener('suede:opening-end', schedule);
    window.addEventListener('suede:rolechange', schedule);
    document.fonts.ready.then(schedule);
    paint();
  }

  function mountDrum() {
    const section = document.getElementById('catalog');
    const track = section?.querySelector('.catwrap');
    if (!track) return;
    const windowBox = document.createElement('div');
    windowBox.className = 'catalog-window';
    track.replaceWith(windowBox);
    windowBox.append(track);
    const rows = Array.from(track.querySelectorAll('.pcard,.pcat,.moreline'));
    let centers = [], range = 0, height = 0, enabled = false, lastScroll;
    function place() {
      if (enabled !== desktop.matches) { measure(); return; }
      if (!enabled || lastScroll === scrollY) return;
      lastScroll = scrollY;
      const travel = clamp(-section.getBoundingClientRect().top, range);
      const leading = height * .05 - travel;
      track.style.transform = `translateY(${leading}px)`;
      rows.forEach((row, index) => {
        const y = centers[index] + leading;
        const dist = y / height * 2 - 1;
        const remaining = dist > 0 ? range - travel : travel;
        const fold = clamp((Math.abs(dist) - .6) * 2.5) * clamp(remaining / (height * .18));
        row.style.transform = `perspective(950px) translateZ(${-160 * fold ** 2}px) rotateX(${-64 * fold * Math.sign(dist)}deg)`;
        row.style.opacity = String(1 - fold * .82);
        row.style.pointerEvents = y < 15 || y > height - 15 ? 'none' : '';
      });
    }
    function measure() {
      enabled = desktop.matches;
      section.classList.toggle('catalog-drum', enabled);
      track.style.removeProperty('transform');
      for (const row of rows) {
        for (const key of ['transform','opacity','pointer-events']) row.style.removeProperty(key);
      }
      if (!enabled) { section.style.removeProperty('height'); return; }
      height = windowBox.clientHeight;
      const origin = track.getBoundingClientRect().top;
      centers = rows.map(row => {
        const box = row.getBoundingClientRect();
        return box.top - origin + box.height / 2;
      });
      range = Math.max(0, track.offsetHeight - height * .8);
      section.style.height = innerHeight + range + 'px';
      lastScroll = null;
      place();
    }
    windowBox.addEventListener('focusin', e => {
      if (!enabled || e.target.matches(':focus-visible') === false) return;
      const index = rows.findIndex(row => row.contains(e.target));
      if (index < 0) return;
      const top = window.scrollY + section.getBoundingClientRect().top + clamp(centers[index] - height * .45, range);
      if (lenis) lenis.scrollTo(top, { immediate: true });
      else window.scrollTo({ top, behavior: 'instant' });
    });
    frameTasks.push(place);
    desktop.addEventListener('change', measure);
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    window.addEventListener('pageshow', measure);
    document.fonts.ready.then(measure);
    measure();
  }

  function revealSections() {
    const items = new Set(document.querySelectorAll('.bens .ben,.zeroband'));
    const children = el => el.matches('.ben') ? Array.from(el.children) : [el];
    function update() { items.forEach(el => el.classList.toggle('suede-entering', desktop.matches)); }
    update();
    desktop.addEventListener('change', update);
    function expose(el, animate) {
      if (!items.delete(el)) return;
      el.classList.remove('suede-entering');
      if (!animate || !desktop.matches) return;
      children(el).forEach(child => {
        const image = child.matches('.keywall,.win');
        child.animate([
          { opacity: 0, filter: 'blur(10px)', translate: '0 ' + (image ? 54 : 44) + 'px' },
          { opacity: 1, filter: 'blur(0px)', translate: '0 0' }
        ], { duration: 1450, delay: image ? 180 : 0, fill: 'backwards', easing: 'cubic-bezier(.2,.65,.3,1)' });
      });
    }
    const watch = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
        target.querySelector('.keywall')?.classList.toggle('motion-visible', isIntersecting);
        if (isIntersecting && intersectionRatio >= .3) expose(target, true);
      });
    }, { threshold: [0,.3], rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => {
      watch.observe(el);
      el.addEventListener('focusin', () => expose(el, false));
    });
  }

  function ending() {
    const reveal = document.querySelector('.ending-reveal');
    const close = reveal?.querySelector('.close'), footer = reveal?.querySelector('footer');
    const indicator = document.createElement('div');
    indicator.className = 'motion-progress';
    indicator.setAttribute('aria-hidden','true');
    document.body.append(indicator);
    let lastY, lastHeight, lastActive;
    frameTasks.push(() => {
      const height = innerHeight;
      const active = !coarse.matches && !reduced.matches && innerWidth > 640;
      if (lastY === scrollY && lastHeight === height && lastActive === active) return;
      lastY = scrollY; lastHeight = height; lastActive = active;
      indicator.style.transform = `scaleX(${clamp(scrollY / Math.max(1, root.scrollHeight - height))})`;
      if (!close || !footer) return;
      const edge = reveal.getBoundingClientRect();
      const anchor = Math.max(0, height - edge.height);
      const distance = active ? clamp(edge.top - anchor, height) : 0;
      reveal.style.setProperty('--reveal-offset', (-distance * .65) + 'px');
      const open = (top, itemHeight) => 1 - (1 - clamp((height - top) / Math.max(1, Math.min(height * .7, itemHeight)))) ** 2;
      const curtain = active ? open(edge.top, close.offsetHeight) : 1;
      const foot = active ? open(footer.getBoundingClientRect().top, footer.offsetHeight) : 1;
      reveal.style.setProperty('--curtain-open', curtain);
      reveal.style.setProperty('--closing-rise', (1 - curtain) * 90 + 'px');
      reveal.style.setProperty('--footer-rise', (1 - foot) * 60 + 'px');
      reveal.style.setProperty('--mark-drift', (1 - foot) * 80 + 'px');
      root.style.setProperty('--top-veil-opacity', 1 - clamp((height - edge.top) / (height * .45)));
      document.body.toggleAttribute('data-dark-nav', edge.top < 80);
    });
  }

  function commandGlow() {
    const host = document.querySelector('.gb-cmd');
    if (!host) return;
    const beam = svgElement('svg', { class: 'command-beam', 'aria-hidden': true, focusable: false });
    host.prepend(beam);
    const spectrum = ['#fc386d','#398bff','#30ca68','#22bdac','#634cfb','#ee49af','#ff8230'];
    function rebuild() {
      const w = host.clientWidth, h = host.clientHeight;
      if (w < 4 || h < 4) return;
      const r = Math.min(h / 2 - 1, parseFloat(getComputedStyle(host).borderRadius) || 16);
      beam.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const outline = svgElement('rect', { x: 1, y: 1, width: w - 2, height: h - 2, rx: r, pathLength: 100 });
      const perimeter = 2 * (w + h - 4) + (2 * Math.PI - 8) * r;
      beam.style.setProperty('--beam-period', perimeter / 180 + 's');
      const fragment = document.createDocumentFragment();
      for (const kind of ['wash','line']) {
        const group = svgElement('g', { class: 'beam-' + kind });
        for (let i = 0; i < 32; i++) {
          const segment = outline.cloneNode();
          const phase = (i + .5) / 32;
          segment.style.setProperty('--offset', String(-i * 52 / 32));
          segment.setAttribute('opacity', Math.sin(phase * Math.PI) ** 1.3);
          segment.setAttribute('stroke', spectrum[Math.floor(phase * spectrum.length)]);
          group.append(segment);
        }
        fragment.append(group);
      }
      beam.replaceChildren(fragment);
    }
    new ResizeObserver(rebuild).observe(host);
    rebuild();
  }

  function startIntro(host) {
    if (!root.classList.contains('opening-stage') || scrollY > innerHeight * .35) {
      window.suedeOpening?.release();
      return;
    }
    const timings = [
      ['.navwrap',0,.7],['.hero-particles',.05,.9],['.hero .kicker',1.95,.85],
      ['.hero-h1',2.05,.85],['.gateway-routes',2.2,1],['.hero .hcell:not(.mid) .sl',2.25,.85],
      ['.aghead',2.3,.85],['.hsteps',2.5,.85],['.hero .htool:not(.more)',2.4,.85],
      ['.hero .hfoot,.hero .htool.more',2.75,.85],['.hero .hcli',2.7,.85],['.hero .givebox',2.8,.9]
    ];
    const animated = timings.flatMap(([selector,start,duration]) => Array.from(document.querySelectorAll(selector), (el,i) => ({
      el, start: start + i * .055, duration
    })));
    const box = host.getBoundingClientRect();
    const x = innerWidth / 2 - box.x - box.width / 2;
    const y = innerHeight * .43 - box.y - box.height / 2;
    const began = performance.now();
    const cleanup = () => {
      intro = null;
      for (const { el } of animated) for (const prop of ['opacity','translate','filter','visibility','pointer-events']) el.style.removeProperty(prop);
      host.style.removeProperty('translate'); host.style.removeProperty('opacity');
      root.style.removeProperty('--opening-background');
      host.dataset.intro = 'complete';
      window.removeEventListener('resize', cancel);
    };
    const cancel = () => window.suedeOpening?.release();
    window.addEventListener('suede:opening-end', cleanup, { once: true });
    window.addEventListener('resize', cancel, { once: true });
    host.dataset.intro = 'running';
    intro = now => {
      const t = (now - began) / 1000;
      if (t >= 6.05 || scrollY > innerHeight * .35 || reduced.matches) { cancel(); return; }
      const mix = smooth(t / 3.6), inverse = 1 - mix;
      const dock = 3 * inverse ** 2 * mix * .05 + 3 * inverse * mix ** 2 * .92 + mix ** 3;
      host.style.translate = `${x * (1 - dock)}px ${y * (1 - dock)}px`;
      host.style.opacity = smooth(t / 1.2);
      for (const { el, start, duration } of animated) {
        const amount = smooth((t - start) / duration);
        el.style.opacity = amount;
        el.style.visibility = amount ? '' : 'hidden';
        el.style.pointerEvents = amount > .65 ? '' : 'none';
        el.style.translate = '0 ' + (1 - amount) * 24 + 'px';
        el.style.filter = 'blur(' + (1 - amount) * 7 + 'px)';
      }
      root.style.setProperty('--opening-background', 1 - smooth((t - 1.8) / 1.8));
      return { elapsed: t, remaining: inverse, spread: .65 * (1 - smooth((t - .45) / 2.05)),
        scale: .3 * inverse ** 3 + 3 * 1.3 * inverse ** 2 * mix + 3 * 1.12 * inverse * mix ** 2 + mix ** 3 };
    };
    intro(began);
    root.classList.remove('opening-pending');
  }

  async function gateway() {
    const host = document.querySelector('.gateway-sculpture');
    const fallback = () => {
      model = null;
      if (host) {
        host.dataset.modelState = 'fallback';
        host.classList.remove('model-ready');
      }
      window.suedeOpening?.release();
    };
    if (!host) { fallback(); return; }
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, failIfMajorPerformanceCaveat: true, powerPreference: 'low-power' });
    if (!gl) { fallback(); return; }
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const adapter = gl.getParameter(info?.UNMASKED_RENDERER_WEBGL || gl.RENDERER);
    if (/swiftshader|llvmpipe|softpipe|lavapipe|software|basic render/i.test(adapter)) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      fallback();
      return;
    }
    try {
      const [{ mountModel }, { attachField }] = await Promise.all([
        import(new URL('gateway-model.js', assets)), import(new URL('particles.js', assets))
      ]);
      for (const [selector, name, type] of [['.hero','hero-particles',0],['.bens','benefit-particles',1],['.ending-layer','ending-particles',2]]) {
        const region = document.querySelector(selector);
        if (!region) continue;
        const tick = attachField(region, name, type);
        if (tick) {
          frameTasks.push(tick);
          if (type === 2) region.classList.add('has-particles');
        }
      }
      model = mountModel(host, gl, canvas);
      host.removeAttribute('aria-hidden');
      canvas.addEventListener('webglcontextlost', () => { canvas.hidden = true; fallback(); });
      startIntro(host);
    } catch (error) {
      fallback();
      console.warn('The Suede gateway is using its static mark.', error);
    }
  }

  connectGateway();
  mountDrum();
  revealSections();
  ending();
  commandGlow();
  gateway();
  wake();
})();
