// Progressive enhancement: category links, skill tables and badge text work without JS.
document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
  btn.addEventListener('click', async function () {
    const src = document.getElementById(btn.dataset.copyTarget);
    if (!src) return;
    const idle = btn.textContent;
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(src.textContent.trim());
      btn.textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(src);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      btn.textContent = 'Select text to copy';
    }
    setTimeout(function () { btn.textContent = idle; }, 2200);
  });
});

const termsFor = (value) => value.toLowerCase().trim().split(/\s+/).filter(Boolean);
document.querySelectorAll('[data-filter-for]').forEach(function (input) {
  const group = input.dataset.filterFor;
  const status = document.getElementById(input.dataset.filterStatus);
  const wrapper = input.closest('.table-filter');
  const tables = [...document.querySelectorAll('table[data-filter-group="' + group + '"]')];
  const more = document.querySelector('details[data-filter-group="' + group + '"]');
  const rows = tables.flatMap((table) => [...table.querySelectorAll('tbody tr')]);
  if (!rows.length) return;
  const searchText = rows.map(function (row) {
    const copy = row.cloneNode(true);
    copy.querySelectorAll('.row-badges').forEach((badges) => badges.remove());
    return copy.textContent.toLowerCase();
  });
  if (wrapper) wrapper.hidden = false;
  let priorOpen = more && more.open;
  let searching = false;
  function filter() {
    const terms = termsFor(input.value);
    if (terms.length && !searching) priorOpen = more && more.open;
    searching = terms.length > 0;
    let shown = 0;
    rows.forEach((row, index) => {
      row.hidden = !terms.every((term) => searchText[index].includes(term));
      if (!row.hidden) shown++;
    });
    tables.forEach((table) => { table.closest('.table-wrap').hidden = ![...table.tBodies[0].rows].some((row) => !row.hidden); });
    if (more) {
      more.hidden = ![...more.querySelectorAll('tbody tr')].some((row) => !row.hidden);
      more.open = searching ? !more.hidden : priorOpen;
    }
    status.textContent = shown.toLocaleString() + ' of ' + rows.length.toLocaleString() + ' skills';
    if (wrapper) wrapper.querySelector('[data-table-empty]').hidden = shown > 0;
  }
  input.addEventListener('input', filter);
  input.addEventListener('keydown', (event) => { if (event.key === 'Escape') { input.value = ''; filter(); } });
  if (wrapper) wrapper.querySelector('[data-table-clear]').addEventListener('click', () => { input.value = ''; filter(); input.focus(); });
  filter();
});

const browser = document.querySelector('[data-directory-browser]');
if (browser) {
  const form = browser.querySelector('form');
  const query = form.elements.q;
  const category = form.elements.category;
  const grade = form.elements.grade;
  const sort = form.elements.sort;
  const results = browser.querySelector('[data-search-results]');
  const status = browser.querySelector('[data-results-status]');
  const title = browser.querySelector('[data-result-title]');
  const empty = browser.querySelector('.search-empty');
  const loading = browser.querySelector('.search-loading');
  const error = browser.querySelector('[data-search-error]');
  const more = browser.querySelector('[data-load-more]');
  const categoryLinks = [...browser.querySelectorAll('[data-category]')];
  let skills = null;
  let limit = 12;
  let debounce;
  form.hidden = false;
  form.querySelector('kbd').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
  const rail = browser.querySelector('.category-rail details');
  const mobile = matchMedia('(max-width: 900px)');
  const setRail = () => { rail.open = !mobile.matches; };
  setRail();
  mobile.addEventListener('change', setRail);

  function readLocation() {
    const params = new URL(location.href).searchParams;
    query.value = params.get('q') || '';
    for (const control of [category, grade, sort]) {
      const value = params.get(control.name) || control.options[0].value;
      control.value = [...control.options].some((option) => option.value === value) ? value : control.options[0].value;
    }
  }
  function saveLocation() {
    const url = new URL(location.href);
    for (const control of [query, category, grade, sort]) {
      const value = control.value.trim();
      if (value && !(control === sort && value === 'curated')) url.searchParams.set(control.name, value);
      else url.searchParams.delete(control.name);
    }
    history.replaceState(null, '', url);
  }
  function node(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    if (text) element.textContent = text;
    return element;
  }
  function resultRow(skill) {
    const article = node('article', 'discovery-row');
    const body = node('div', 'result-body');
    const meta = node('p', 'result-meta', skill.label);
    meta.append(node('span', '', ' / ' + skill.repo));
    const heading = node('h3', '');
    const link = node('a', '', skill.name);
    link.href = skill.href;
    heading.append(link);
    body.append(meta, heading, node('p', '', skill.description), node('p', 'result-foot', skill.license + ' · ' + (skill.full ? 'Full skill page' : 'Repository listing')));
    const shield = node('img', 'result-shield');
    shield.src = 'badges/score-' + skill.score + '.svg';
    shield.alt = 'Suede S shield';
    shield.width = 80; shield.height = 88; shield.loading = 'lazy';
    const quality = node('div', 'result-quality');
    quality.append(shield, node('span', 'grade grade-' + skill.grade.toLowerCase(), skill.score + '/100 · ' + skill.grade));
    article.append(body, quality);
    return article;
  }
  function render(writeUrl = true, focusIndex = -1) {
    if (!skills) return;
    const terms = termsFor(query.value);
    const matches = skills.filter((skill) => (!category.value || skill.category === category.value) && (!grade.value || skill.grade === grade.value) && terms.every((term) => skill.search.includes(term)));
    if (sort.value === 'name') matches.sort((a, b) => a.name.localeCompare(b.name) || a.repo.localeCompare(b.repo));
    if (sort.value === 'score') matches.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    const fragment = document.createDocumentFragment();
    matches.slice(0, limit).forEach((skill) => fragment.append(resultRow(skill)));
    results.replaceChildren(fragment);
    results.hidden = matches.length === 0;
    empty.hidden = matches.length !== 0;
    more.hidden = matches.length <= limit;
    const shown = Math.min(limit, matches.length);
    title.textContent = terms.length ? 'Search results' : category.value ? category.selectedOptions[0].textContent : 'All skills';
    status.textContent = 'Showing ' + shown.toLocaleString() + ' of ' + matches.length.toLocaleString() + ' skills';
    more.textContent = 'Show ' + Math.min(12, matches.length - shown) + ' more skills';
    categoryLinks.forEach((link) => { if (link.dataset.category === category.value) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current'); });
    if (writeUrl) saveLocation();
    if (focusIndex >= 0) results.querySelectorAll('h3 a')[focusIndex]?.focus();
  }
  async function load() {
    loading.hidden = false; error.hidden = true; results.hidden = true;
    status.textContent = 'Loading skill search…';
    results.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('search-index.json');
      if (!response.ok) throw new Error('Search unavailable');
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) throw new Error('Invalid search index');
      skills = data.map((skill) => ({ ...skill, search: [skill.name, skill.repo, skill.description, skill.label].join(' ').toLowerCase() }));
      render(false);
    } catch {
      error.hidden = false; results.hidden = false;
      status.textContent = 'Search unavailable. Browse the categories or skills below.';
    } finally {
      loading.hidden = true;
      results.removeAttribute('aria-busy');
    }
  }
  const update = () => { limit = 12; render(); };
  query.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(update, 100); });
  [category, grade, sort].forEach((control) => control.addEventListener('change', update));
  form.addEventListener('submit', (event) => { event.preventDefault(); clearTimeout(debounce); update(); });
  form.querySelector('[data-clear]').addEventListener('click', () => { query.value = ''; update(); query.focus(); });
  browser.querySelector('[data-reset]').addEventListener('click', () => { form.reset(); update(); query.focus(); });
  browser.querySelector('[data-retry]').addEventListener('click', load);
  more.addEventListener('click', () => { const next = limit; limit += 12; render(false, next); });
  categoryLinks.forEach((link) => link.addEventListener('click', (event) => {
    if (!skills || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); category.value = link.dataset.category; update();
    if (mobile.matches) { rail.open = false; title.tabIndex = -1; title.focus(); }
  }));
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); query.focus();
    }
    if (event.key === 'Escape' && event.target === query) { query.value = ''; update(); }
  });
  window.addEventListener('popstate', () => { readLocation(); limit = 12; render(false); });
  readLocation();
  load();
}

for (const section of document.querySelectorAll('[data-promotion-end]')) {
  const end = section.dataset.promotionEnd;
  if (end && (!Number.isFinite(Date.parse(end)) || Date.now() >= Date.parse(end))) section.hidden = true;
}
