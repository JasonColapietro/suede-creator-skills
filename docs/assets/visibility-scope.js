/* Cookieless funnel actions; never send form contents or arbitrary URLs. */
(function (w, d) {
  if (new URLSearchParams(w.location.search).get('qa') === '1' || w.__scopeAnalyticsLoaded) return;
  w.__scopeAnalyticsLoaded = true;
  w.va = w.va || function () { (w.vaq = w.vaq || []).push(arguments); };
  w.va('beforeSend', function (event) {
    try {
      var url = new URL(event.url);
      url.search = ''; url.hash = '';
      return Object.assign({}, event, { url: url.toString() });
    } catch (_) { return null; }
  });
  var loader = d.createElement('script');
  loader.defer = true;
  loader.src = '/scope-insights/script.js';
  loader.setAttribute('data-endpoint', '/scope-insights');
  d.head.appendChild(loader);
  var link = d.getElementById('hero-cta-scope');
  if (link) link.addEventListener('click', function () {
    try { w.va('event', { name: 'visibility_scope_click', data: { source: 'skills-hero' } }); }
    catch (_) { /* Analytics must never prevent navigation. */ }
  });
})(window, document);
