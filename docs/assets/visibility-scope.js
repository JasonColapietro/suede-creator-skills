/* Deliver the hero activation marker with navigation to the existing SEO collector.
 * The intake records the click on arrival. No cookies, storage or form values. */
(function (w, d) {
  if (new URLSearchParams(w.location.search).get('qa') === '1' || w.__scopeClickHandoffLoaded) return;
  w.__scopeClickHandoffLoaded = true;
  var link = d.getElementById('hero-cta-scope');
  if (!link) return;
  function markClick(event) {
    if (event.button > 1) return;
    try {
      var url = new URL(link.href);
      if (url.origin !== 'https://suedeai.ai' || url.pathname !== '/seo') return;
      url.searchParams.set('scope_click', 'hero');
      link.href = url.toString();
    } catch (_) { /* Never prevent navigation. */ }
  }
  link.addEventListener('click', markClick);
  link.addEventListener('auxclick', markClick);
})(window, document);
