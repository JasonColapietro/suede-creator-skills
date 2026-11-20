(() => {
  const desktop = matchMedia('(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (!desktop.matches || (location.hash && location.hash !== '#top')) return;

  const root = document.documentElement;
  root.classList.add('opening-stage', 'opening-pending');
  const cancelInput = new AbortController();
  const timeout = setTimeout(release, 10000);
  function release() {
    if (!root.classList.contains('opening-stage')) return;
    clearTimeout(timeout);
    cancelInput.abort();
    root.classList.remove('opening-stage', 'opening-pending');
    window.dispatchEvent(new Event('suede:opening-end'));
  }
  window.suedeOpening = { release };
  for (const kind of ['wheel', 'keydown', 'touchstart', 'pagehide']) {
    window.addEventListener(kind, release, { passive: true, signal: cancelInput.signal });
  }
})();
