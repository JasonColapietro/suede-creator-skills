// Skill AI-visibility check, served at /directory/check/check.js by
// scripts/build-directory.mjs. It reads only the directory's own published
// files (search-index.json and each listing's report.json). Nothing typed
// into the form is sent anywhere.
(function () {
  'use strict';
  var form = document.querySelector('[data-skill-check]');
  if (!form) return;
  var input = form.querySelector('input[name="q"]');
  var status = document.querySelector('[data-check-status]');
  var results = document.querySelector('[data-check-results]');
  var ctaListed = document.querySelector('[data-check-cta="listed"]');
  var ctaMissing = document.querySelector('[data-check-cta="missing"]');
  var rubric = JSON.parse(document.getElementById('check-rubric').textContent);
  var base = form.getAttribute('data-directory'); // relative path to /directory/
  var index = null;
  form.hidden = false;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    (children || []).forEach(function (c) { node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }
  // Root-absolute directory paths from the index, made relative to this page.
  function local(href) { return href.replace(/^\/directory\//, base); }

  function loadIndex() {
    if (index) return Promise.resolve(index);
    return fetch(base + 'search-index.json').then(function (r) {
      if (!r.ok) throw new Error('index');
      return r.json();
    }).then(function (data) { index = data; return data; });
  }

  // A GitHub URL to a repository or skill folder, "owner/repo", or a skill name.
  function parse(q) {
    var text = q.trim();
    var gh = text.match(/github\.com\/([^\/\s]+)\/([^\/\s#?]+)(?:\/(?:tree|blob)\/[^\/\s]+\/([^\s#?]*))?/i);
    if (gh) {
      var tail = (gh[3] || '').replace(/\/?SKILL\.md$/i, '').replace(/\/+$/, '');
      return { repo: (gh[1] + '/' + gh[2].replace(/\.git$/i, '')).toLowerCase(), name: tail ? tail.split('/').pop().toLowerCase() : null };
    }
    if (/^[\w.-]+\/[\w.-]+$/.test(text)) return { repo: text.toLowerCase(), name: null };
    return { repo: null, name: text.toLowerCase() };
  }

  function find(data, q) {
    var want = parse(q);
    var exact = data.filter(function (s) {
      return (!want.repo || s.repo.toLowerCase() === want.repo) && (!want.name || s.name.toLowerCase() === want.name || (s.slug && s.slug.toLowerCase() === want.name));
    });
    if (exact.length) return exact;
    // A folder name that differs from the skill's name: offer the repository's skills.
    if (want.repo) return data.filter(function (s) { return s.repo.toLowerCase() === want.repo; });
    return data.filter(function (s) {
      return s.name.toLowerCase().indexOf(want.name) !== -1 || (s.slug && s.slug.toLowerCase().indexOf(want.name) !== -1);
    }).slice(0, 20);
  }

  function reset() {
    results.textContent = '';
    ctaListed.hidden = true;
    ctaMissing.hidden = true;
  }

  function notFound(q) {
    results.appendChild(el('div', { class: 'panel check-result' }, [
      el('h2', {}, ['No listing found']),
      el('p', {}, ['Nothing in the directory matches “' + q + '”. Check the repository URL or the skill name. A skill that is not listed yet can be submitted for a free listing.']),
    ]));
    ctaMissing.hidden = false;
    status.textContent = 'No listing found.';
  }

  function choose(matches) {
    var list = el('div', { class: 'links' });
    matches.slice(0, 20).forEach(function (s) {
      var b = el('button', { type: 'button', class: 'link-row check-pick' }, [el('b', {}, [s.name]), el('span', {}, [s.repo + ' · ' + s.score + '/100 · ' + s.grade])]);
      b.addEventListener('click', function () { show(s); });
      list.appendChild(b);
    });
    results.appendChild(el('div', { class: 'panel check-result' }, [
      el('h2', {}, [matches.length + ' listed skills match']),
      el('p', {}, [matches.length > 20 ? 'Showing the first 20. Add the skill folder to the URL to go straight to one.' : 'Choose one to see its score and open points.']),
      list,
    ]));
    status.textContent = matches.length + ' listed skills match. Choose one.';
  }

  function show(s) {
    reset();
    status.textContent = 'Loading the report for ' + s.name + '…';
    fetch(local(s.report)).then(function (r) {
      if (!r.ok) throw new Error('report');
      return r.json();
    }).then(function (report) {
      var parts = report.quality.components;
      var open = parts.filter(function (p) { return p.points < p.max && p.id !== 'adoption'; })
        .sort(function (a, b) { return (b.max - b.points) - (a.max - a.points) || a.label.localeCompare(b.label); }).slice(0, 3);
      var rows = parts.map(function (p) {
        return el('tr', {}, [el('td', {}, [p.label]), el('td', {}, [p.points + ' of ' + p.max]), el('td', {}, [String(p.max - p.points)])]);
      });
      var table = el('div', { class: 'table-wrap' }, [el('table', { class: 'checks' }, [
        el('thead', {}, [el('tr', {}, [el('th', { scope: 'col' }, ['Component']), el('th', { scope: 'col' }, ['Points']), el('th', { scope: 'col' }, ['Open'])])]),
        el('tbody', {}, rows),
      ])]);
      var next = open.length
        ? el('ol', {}, open.map(function (p) { return el('li', {}, [el('b', {}, [p.label + ' (' + (p.max - p.points) + ' points open). ']), (rubric[p.id] || '') + '.']); }))
        : el('p', {}, ['Every component a publisher controls is at full points.']);
      results.appendChild(el('div', { class: 'panel check-result' }, [
        el('p', { class: 'result-meta' }, [s.repo + ' · ' + s.label + ' · ' + s.license]),
        el('h2', {}, [s.name + ': ' + report.quality.score + '/100 · grade ' + report.quality.grade]),
        el('p', {}, ['Listed in the directory. Snapshot of ' + report.snapshot.date + ', method ' + report.methodology.version + '. ', el('a', { href: local(s.href) }, ['Open the listing']), '.']),
        el('h3', {}, ['The largest open points']),
        next,
        el('h3', {}, ['Score by component']),
        table,
      ]));
      ctaListed.hidden = false;
      status.textContent = s.name + ' scores ' + report.quality.score + '/100.';
    }).catch(function () {
      status.textContent = 'The report could not load. Try again, or open the listing.';
    });
  }

  function run(q) {
    reset();
    if (!q.trim()) { status.textContent = 'Enter a GitHub URL or a skill name.'; return; }
    status.textContent = 'Searching the directory…';
    loadIndex().then(function (data) {
      var matches = find(data, q);
      if (!matches.length) notFound(q);
      else if (matches.length === 1) show(matches[0]);
      else choose(matches);
    }).catch(function () {
      status.textContent = 'The directory index could not load. Try again in a moment.';
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var q = input.value;
    try {
      var u = new URL(window.location.href);
      if (q.trim()) u.searchParams.set('q', q.trim()); else u.searchParams.delete('q');
      window.history.replaceState(null, '', u.toString());
    } catch (e) { /* the check still runs without a shareable URL */ }
    run(q);
  });
  var initial = new URLSearchParams(window.location.search).get('q');
  if (initial) { input.value = initial; run(initial); }
})();
