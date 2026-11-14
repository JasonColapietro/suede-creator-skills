// Progressive enhancement: category links, skill tables and badge text work without JS.
// Every feature binds only to markup that is present, so any page may carry any subset.
// Nothing here calls the network except the hub's search-index fetch, and nothing tracks.

function node(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text) element.textContent = text;
  return element;
}
const numberOf = (value, fallback) => {
  const n = value === undefined || value === null || value === '' ? NaN : Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const dateOf = (value) => (/^\d{4}-\d{2}-\d{2}/.test(value || '') ? value : '');
const termsFor = (value) => value.toLowerCase().trim().split(/\s+/).filter(Boolean);
const markdownText = (text) => String(text).replace(/[\\`*_{}\[\]()<>#!|]/g, '\\$&').replace(/[\r\n]+/g, ' ');
const compactCount = (n) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(n));

// Shows a short confirmation on a button, then restores its idle label.
const flashTimers = new WeakMap();
function flash(btn, text, idle) {
  clearTimeout(flashTimers.get(btn));
  btn.textContent = text;
  flashTimers.set(btn, setTimeout(function () { btn.textContent = idle; }, 2000));
}
function selectText(target) {
  const range = document.createRange();
  range.selectNodeContents(target);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}
async function copyText(text) {
  if (!navigator.clipboard) throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(text);
}

// Copy buttons for badge snippets, shortlist and saved-list exports.
document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
  const idle = btn.textContent;
  btn.addEventListener('click', async function () {
    const src = document.getElementById(btn.dataset.copyTarget);
    if (!src) return;
    try {
      await copyText(src.textContent.trim());
      flash(btn, 'Copied', idle);
    } catch {
      selectText(src);
      flash(btn, 'Select text to copy', idle);
    }
  });
});

// Share row: copy the page address. Without clipboard access the address is
// printed beside the button and selected, so it can still be copied by hand.
document.querySelectorAll('[data-copy-url]').forEach(function (btn) {
  const idle = btn.textContent;
  btn.addEventListener('click', async function () {
    const url = btn.dataset.copyUrl || location.href;
    try {
      await copyText(url);
      flash(btn, 'Copied', idle);
    } catch {
      let shown = btn.nextElementSibling;
      if (!shown || !shown.classList.contains('share-url')) {
        shown = node('code', 'share-url');
        btn.after(shown);
      }
      shown.textContent = url;
      selectText(shown);
      flash(btn, 'Select text to copy', idle);
    }
  });
});

// Skill tables: one text filter plus optional sort select and facet chips per
// group. A row shows when it matches every text term and every facet in use;
// inside one facet the chosen values are alternatives. Sorting reorders the
// rows across the group's main table and its "more" table, keeping the main
// table's original row count. Sort and facets live in the URL query.
const tableGroups = new Set();
document.querySelectorAll('[data-filter-for], [data-table-tools]').forEach(function (el) {
  tableGroups.add(el.dataset.filterFor || el.dataset.tableTools);
});
tableGroups.forEach(function (group) {
  const input = document.querySelector('[data-filter-for="' + group + '"]');
  const tools = document.querySelector('[data-table-tools="' + group + '"]');
  const sort = document.querySelector('[data-sort-for="' + group + '"]');
  const chips = [...document.querySelectorAll('[data-facet-for="' + group + '"] [data-facet][data-value]')];
  const tables = [...document.querySelectorAll('table[data-filter-group="' + group + '"]')];
  const more = document.querySelector('details[data-filter-group="' + group + '"]');
  const main = tables.find((table) => table.id === group) || tables[0];
  if (!main) return;
  const spill = tables.find((table) => table !== main && table.id === group + '-more') || tables.find((table) => table !== main);
  const wrapper = input && input.closest('.table-filter');
  const status = document.getElementById((input && input.dataset.filterStatus) || group + '-status');
  const empty = wrapper && wrapper.querySelector('[data-table-empty]');
  const entries = tables.flatMap((table) => [...table.querySelectorAll('tbody tr')]).map(function (row, index) {
    const copy = row.cloneNode(true);
    copy.querySelectorAll('.row-badges, [data-save]').forEach((part) => part.remove());
    const link = row.querySelector('td a');
    return {
      row, index, facets: {},
      text: copy.textContent.toLowerCase(),
      name: row.dataset.name || (link ? link.textContent : row.textContent).trim(),
      score: numberOf(row.dataset.score, -1),
      cited: numberOf(row.dataset.cited, 0),
      updated: dateOf(row.dataset.updated),
      listed: dateOf(row.dataset.listed),
    };
  });
  if (!entries.length) return;
  const mainCount = main.querySelectorAll('tbody tr').length;
  const facets = [...new Set(chips.map((chip) => chip.dataset.facet))];
  const chosen = (facet) => chips.filter((chip) => chip.dataset.facet === facet && chip.getAttribute('aria-pressed') === 'true').map((chip) => chip.dataset.value);
  // data-lane holds one value, data-flags a space-separated list; any future facet works the same way.
  const facetValues = (row, facet) => new Set((row.dataset[facet + 's'] || row.dataset[facet] || '').split(/\s+/).filter(Boolean));
  const sortOptions = sort ? [...sort.options].map((option) => option.value) : [];
  const defaultSort = sortOptions.includes('listing') || !sortOptions.length ? 'listing' : sortOptions[0];
  const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || a.index - b.index;
  const sorters = {
    listing: (a, b) => a.index - b.index,
    name: byName,
    score: (a, b) => b.score - a.score || byName(a, b),
    cited: (a, b) => b.cited - a.cited || byName(a, b),
    updated: (a, b) => b.updated.localeCompare(a.updated) || byName(a, b),
    listed: (a, b) => b.listed.localeCompare(a.listed) || byName(a, b),
  };
  let searching = false;
  let priorOpen = more && more.open;

  function arrange() {
    const order = entries.slice().sort(sorters[sort ? sort.value : defaultSort] || sorters.listing);
    const mainBody = main.tBodies[0];
    const spillBody = spill && spill.tBodies[0];
    order.forEach((entry, position) => { (spillBody && position >= mainCount ? spillBody : mainBody).append(entry.row); });
  }
  function apply() {
    const terms = input ? termsFor(input.value) : [];
    const picks = facets.map((facet) => [facet, chosen(facet)]).filter(([, values]) => values.length);
    const wasSearching = searching;
    searching = terms.length > 0 || picks.length > 0;
    if (searching && !wasSearching) priorOpen = more && more.open;
    let shown = 0;
    entries.forEach(function (entry) {
      const visible = terms.every((term) => entry.text.includes(term)) && picks.every(function ([facet, values]) {
        const own = entry.facets[facet] || (entry.facets[facet] = facetValues(entry.row, facet));
        return values.some((value) => own.has(value));
      });
      entry.row.hidden = !visible;
      if (visible) shown++;
    });
    tables.forEach((table) => { (table.closest('.table-wrap') || table).hidden = ![...table.tBodies[0].rows].some((row) => !row.hidden); });
    if (more) {
      more.hidden = ![...more.querySelectorAll('tbody tr')].some((row) => !row.hidden);
      if (searching) more.open = !more.hidden;
      else if (wasSearching) more.open = priorOpen;
    }
    if (status) status.textContent = shown.toLocaleString() + ' of ' + entries.length.toLocaleString() + ' skills';
    if (empty) empty.hidden = shown > 0;
  }
  function readUrl() {
    const params = new URL(location.href).searchParams;
    const wantedSort = params.get('sort');
    if (sort && wantedSort && sortOptions.includes(wantedSort)) sort.value = wantedSort;
    facets.forEach(function (facet) {
      const wanted = new Set(params.getAll(facet).flatMap((value) => value.split(',')).map((value) => value.trim()).filter(Boolean));
      chips.forEach((chip) => { if (chip.dataset.facet === facet) chip.setAttribute('aria-pressed', String(wanted.has(chip.dataset.value))); });
    });
  }
  function writeUrl() {
    const url = new URL(location.href);
    if (sort && sort.value !== defaultSort) url.searchParams.set('sort', sort.value);
    else url.searchParams.delete('sort');
    facets.forEach(function (facet) {
      const values = chosen(facet);
      if (values.length) url.searchParams.set(facet, values.join(','));
      else url.searchParams.delete(facet);
    });
    history.replaceState(null, '', url);
  }

  if (wrapper) wrapper.hidden = false;
  if (tools) tools.hidden = false;
  readUrl();
  if (sort && sort.value !== defaultSort) arrange();
  apply();
  if (input) {
    input.addEventListener('input', apply);
    input.addEventListener('keydown', (event) => { if (event.key === 'Escape') { input.value = ''; apply(); } });
  }
  const clear = wrapper && wrapper.querySelector('[data-table-clear]');
  if (clear) clear.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
  if (sort) sort.addEventListener('change', () => { arrange(); apply(); writeUrl(); });
  chips.forEach((chip) => chip.addEventListener('click', function () {
    chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
    apply();
    writeUrl();
  }));
  const reset = tools && tools.querySelector('[data-tools-reset]');
  if (reset) reset.addEventListener('click', function () {
    if (sort) sort.value = defaultSort;
    chips.forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
    if (input) input.value = '';
    arrange();
    apply();
    writeUrl();
  });
});

// Save list: skills bookmarked in this browser's localStorage. No account, and
// the list never leaves the browser. Without storage the list lasts one page view.
const SAVED_KEY = 'suede-directory-saved';
let savedList = null;
function savedItems() {
  if (savedList) return savedList;
  let items = [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVED_KEY) || '[]');
    if (Array.isArray(parsed)) items = parsed.filter((item) => item && typeof item === 'object' && typeof item.id === 'string' && item.id);
  } catch {
    items = [];
  }
  savedList = items;
  return items;
}
function storeSaved(items) {
  savedList = items;
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(items));
  } catch {
    // Storage blocked or full: the page keeps the list in memory for this visit.
  }
  paintSaved();
}
function savedRecord(button) {
  const data = button.dataset;
  let href = data.saveHref || '';
  try {
    const url = new URL(href, location.href);
    href = url.pathname + url.search + url.hash;
  } catch {
    // Keep the raw href when the page has no usable base address.
  }
  return {
    id: data.save, name: data.saveName || data.save, href, repo: data.saveRepo || '',
    score: numberOf(data.saveScore, null), grade: data.saveGrade || '', category: data.saveCategory || '',
    license: data.saveLicense || '', saved: new Date().toISOString(),
  };
}
function toggleSaved(button) {
  const id = button.dataset.save;
  const items = savedItems();
  storeSaved(items.some((item) => item.id === id) ? items.filter((item) => item.id !== id) : [...items, savedRecord(button)]);
}
function savedMarkdown(items) {
  return ['# Saved skills', '', ...items.map(function (item) {
    let href = item.href;
    try { href = new URL(item.href, location.href).href; } catch { /* keep the stored path */ }
    const facts = [item.score === null || item.score === undefined ? '' : item.score + '/100', item.grade, item.license, item.repo, item.category];
    return '- [' + markdownText(item.name) + '](' + href + ')' + facts.filter(Boolean).map((part) => ' · ' + markdownText(part)).join('');
  }), '', 'Scores: Suede Skill Check, 100-point rubric; published scores capped at 99.'].join('\n');
}
function focusSavedRow(page, position) {
  const buttons = page.querySelectorAll('[data-saved-remove]');
  const target = buttons[Math.min(position, buttons.length - 1)] || page.querySelector('[data-saved-empty]');
  if (!target) return;
  if (!buttons.length) target.tabIndex = -1;
  target.focus();
}
function savedRow(page, item) {
  const row = document.createElement('tr');
  const name = node('td', 'name');
  const link = node('a', '', item.name);
  link.href = item.href;
  name.append(link);
  const grade = node('td', '');
  if (item.grade) grade.append(node('span', 'grade grade-' + String(item.grade).toLowerCase(), item.grade));
  const repo = node('td', 'meta');
  if (/^[\w.-]+\/[\w.-]+$/.test(item.repo || '')) {
    const source = node('a', '', item.repo);
    source.href = 'https://github.com/' + item.repo;
    source.target = '_blank';
    source.rel = 'noopener';
    repo.append(source);
  } else {
    repo.textContent = item.repo || '';
  }
  const actions = node('td', 'actions');
  const remove = node('button', 'saved-remove', 'Remove');
  remove.type = 'button';
  remove.setAttribute('aria-label', 'Remove ' + item.name + ' from saved skills');
  remove.setAttribute('data-saved-remove', item.id);
  remove.addEventListener('click', function () {
    const position = [...page.querySelectorAll('[data-saved-remove]')].indexOf(remove);
    storeSaved(savedItems().filter((entry) => entry.id !== item.id));
    focusSavedRow(page, position);
  });
  actions.append(remove);
  const score = node('td', 'num', item.score === null || item.score === undefined ? '' : item.score + '/100');
  row.append(name, score, grade, node('td', 'meta', item.category || ''), node('td', 'meta', item.license || ''), repo, actions);
  return row;
}
function renderSavedPage(page, items) {
  const table = page.querySelector('[data-saved-table]');
  if (!table) return;
  const body = table.tBodies[0] || table.createTBody();
  body.replaceChildren(...items.map((item) => savedRow(page, item)));
  (table.closest('.table-wrap') || table).hidden = items.length === 0;
  const empty = page.querySelector('[data-saved-empty]');
  if (empty) empty.hidden = items.length > 0;
  const clear = page.querySelector('[data-saved-clear]');
  if (clear) clear.hidden = items.length === 0;
  const exporter = page.querySelector('[data-saved-export]');
  if (exporter) exporter.hidden = items.length === 0;
  const markdown = page.querySelector('#saved-markdown');
  if (markdown) markdown.textContent = savedMarkdown(items);
}
function paintSaved() {
  const items = savedItems();
  const ids = new Set(items.map((item) => item.id));
  document.querySelectorAll('[data-save]').forEach(function (button) {
    const pressed = ids.has(button.dataset.save);
    button.setAttribute('aria-pressed', String(pressed));
    if (/^Saved?$/.test(button.textContent.trim())) button.textContent = pressed ? 'Saved' : 'Save';
  });
  document.querySelectorAll('[data-saved-count]').forEach(function (count) {
    count.textContent = items.length.toLocaleString();
    count.hidden = items.length === 0;
  });
  document.querySelectorAll('[data-saved-page]').forEach((page) => renderSavedPage(page, items));
}
// Delegated, so hub search results built later get the same toggle.
document.addEventListener('click', function (event) {
  const button = event.target.closest && event.target.closest('button[data-save]');
  if (button) toggleSaved(button);
});
document.querySelectorAll('[data-saved-page]').forEach(function (page) {
  const clear = page.querySelector('[data-saved-clear]');
  if (clear) clear.addEventListener('click', function () {
    storeSaved([]);
    focusSavedRow(page, 0);
  });
});
// Another tab changed the list: repaint from storage.
window.addEventListener('storage', function (event) {
  if (!event.key || event.key === SAVED_KEY) { savedList = null; paintSaved(); }
});
paintSaved();

const browser = document.querySelector('[data-directory-browser]');
if (browser) {
  const form = browser.querySelector('form');
  const query = form.elements.q;
  const category = form.elements.category;
  const grade = form.elements.grade;
  const sort = form.elements.sort;
  const lane = form.elements.lane;
  const flag = form.elements.flag;
  // Cost and capability selects ship with newer builds; older pages have neither.
  const selects = [category, grade, sort, lane, flag].filter(Boolean);
  const results = browser.querySelector('[data-search-results]');
  const status = browser.querySelector('[data-results-status]');
  const title = browser.querySelector('[data-result-title]');
  const empty = browser.querySelector('.search-empty');
  const loading = browser.querySelector('.search-loading');
  const error = browser.querySelector('[data-search-error]');
  const more = browser.querySelector('[data-load-more]');
  const categoryLinks = [...browser.querySelectorAll('[data-category]')];
  const shortlist = browser.querySelector('[data-shortlist]');
  const task = shortlist?.querySelector('[data-shortlist-task]');
  let selected = [];
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
    selected = [...new Set(params.getAll('pick'))].slice(0, 5);
    if (task) task.value = (params.get('task') || '').slice(0, 120);
    query.value = params.get('q') || '';
    for (const control of selects) {
      const value = params.get(control.name) || control.options[0].value;
      control.value = [...control.options].some((option) => option.value === value) ? value : control.options[0].value;
    }
  }
  function saveLocation() {
    const url = new URL(location.href);
    for (const control of [query, ...selects]) {
      const value = control.value.trim();
      if (value && !(control === sort && value === 'curated')) url.searchParams.set(control.name, value);
      else url.searchParams.delete(control.name);
    }
    url.searchParams.delete('pick');
    selected.forEach((href) => url.searchParams.append('pick', href));
    if (task?.value.trim()) url.searchParams.set('task', task.value.trim());
    else url.searchParams.delete('task');
    history.replaceState(null, '', url);
  }
  function renderShortlist() {
    if (!shortlist || !skills) return;
    shortlist.hidden = false;
    browser.querySelector('.shortlist-jump')?.removeAttribute('hidden');
    const picks = selected.map((href) => skills.find((skill) => skill.href === href)).filter(Boolean);
    selected = picks.map((skill) => skill.href);
    const list = shortlist.querySelector('[data-shortlist-items]');
    list.replaceChildren();
    for (const skill of picks) {
      const item = node('li', '');
      const link = node('a', '', skill.name + ' · ' + skill.score + '/100 · ' + skill.grade);
      link.href = skill.href;
      const remove = node('button', '', 'Remove');
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Remove ' + skill.name + ' from shortlist');
      remove.addEventListener('click', () => {
        selected = selected.filter((href) => href !== skill.href);
        render();
        task.focus();
      });
      item.append(link, node('span', 'muted', skill.repo + ' · ' + skill.license), remove);
      list.append(item);
    }
    shortlist.querySelector('[data-shortlist-count]').textContent = picks.length + ' of 5 skills';
    shortlist.querySelector('[data-shortlist-status]').textContent = picks.length === 5 ? 'Shortlist full. Remove a skill to add another.' : '';
    shortlist.querySelector('[data-shortlist-export]').hidden = !picks.length;
    const markdown = markdownText;
    shortlist.querySelector('#shortlist-markdown').textContent = [
      '# ' + markdown(task.value.trim() || 'My skill shortlist'), '',
      ...picks.map((skill) => '- [' + markdown(skill.name) + '](' + new URL(skill.href, location.href).href + ') · ' + skill.score + '/100 · ' + skill.grade + ' · ' + markdown(skill.license) + '\n  ' + markdown(skill.repo) + ' · [Report](' + new URL(skill.report, location.href).href + ') · Snapshot ' + skill.snapshot + ' · ' + skill.method),
      '', '100-point rubric; published scores capped at 99. Security scan: not scanned.',
      'Report and badge links follow the latest listing. Download a report to preserve its version.',
    ].join('\n');
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
    const installs = Number.isFinite(skill.installs) && skill.installs > 0 ? ' · ' + compactCount(skill.installs) + ' installs via skills.sh' : '';
    body.append(meta, heading, node('p', '', skill.description), node('p', 'result-foot', skill.license + ' · ' + (skill.full ? 'Full skill page' : 'Repository listing') + installs));
    const quality = node('div', 'result-quality');
    // Quality shields exist only for listed skills scoring 80-99.
    if (skill.score >= 80) {
      const shield = node('img', 'result-shield');
      shield.src = 'badges/score-' + skill.score + '.svg';
      shield.alt = 'Suede S shield';
      shield.width = 80; shield.height = 88; shield.loading = 'lazy';
      quality.append(shield);
    }
    if (skill.editorial_rating) {
      const rating = skill.editorial_rating;
      quality.append(node('span', 'grade grade-' + rating.grade.toLowerCase(), rating.score + '/100 · ' + rating.grade + ' · Editorial'));
      quality.append(node('small', 'muted', 'Skill Check: ' + skill.score + '/100 · ' + skill.grade));
    } else {
      quality.append(node('span', 'grade grade-' + skill.grade.toLowerCase(), skill.score + '/100 · ' + skill.grade));
    }
    // Save toggle for records that carry a directory id; older index records have none.
    if (skill.id) {
      const pressed = savedItems().some((item) => item.id === skill.id);
      const save = node('button', 'save-row', pressed ? 'Saved' : 'Save');
      save.type = 'button';
      const fields = { '': skill.id, name: skill.name, href: skill.href, repo: skill.repo, score: skill.score, grade: skill.grade, category: skill.label, license: skill.license };
      Object.entries(fields).forEach(([key, value]) => { if (value !== undefined && value !== null) save.setAttribute('data-save' + (key ? '-' + key : ''), String(value)); });
      save.setAttribute('aria-pressed', String(pressed));
      save.setAttribute('aria-label', 'Save ' + skill.name);
      quality.append(save);
    }
    if (shortlist) {
      const chosen = selected.includes(skill.href);
      const add = node('button', 'shortlist-add', chosen ? 'Added' : 'Shortlist');
      add.type = 'button'; add.disabled = !chosen && selected.length >= 5;
      add.setAttribute('aria-pressed', String(chosen));
      add.setAttribute('aria-label', (chosen ? 'Remove ' : 'Add ') + skill.name + (chosen ? ' from' : ' to') + ' shortlist');
      add.setAttribute('data-shortlist-href', skill.href);
      add.addEventListener('click', () => {
        selected = chosen ? selected.filter((href) => href !== skill.href) : [...selected, skill.href];
        render();
        [...results.querySelectorAll('[data-shortlist-href]')].find((button) => button.getAttribute('data-shortlist-href') === skill.href)?.focus();
      });
      quality.append(add);
    }
    article.append(body, quality);
    return article;
  }
  // Newest first by a YYYY-MM-DD field; records without the field sort last.
  const newestBy = (field) => (a, b) => String(b[field] || '').localeCompare(String(a[field] || '')) || a.name.localeCompare(b.name) || a.repo.localeCompare(b.repo);
  function render(writeUrl = true, focusIndex = -1) {
    renderShortlist();
    if (writeUrl) saveLocation();
    if (!skills) return;
    const terms = termsFor(query.value);
    const matches = skills.filter((skill) => (!category.value || skill.category === category.value)
      && (!grade.value || skill.grade === grade.value)
      && (!lane || !lane.value || skill.lane === lane.value)
      && (!flag || !flag.value || (Array.isArray(skill.flags) && skill.flags.includes(flag.value)))
      && terms.every((term) => skill.search.includes(term)));
    if (sort.value === 'name') matches.sort((a, b) => a.name.localeCompare(b.name) || a.repo.localeCompare(b.repo));
    if (sort.value === 'installs') matches.sort((a, b) => (b.installs || 0) - (a.installs || 0) || b.score - a.score || a.name.localeCompare(b.name));
    if (sort.value === 'score') matches.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name) || a.repo.localeCompare(b.repo));
    if (sort.value === 'listed') matches.sort(newestBy('listed'));
    if (sort.value === 'updated') matches.sort(newestBy('updated'));
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
      skills = data.map((skill) => ({ ...skill, search: [skill.name, skill.slug, skill.repo, skill.description, skill.label].join(' ').toLowerCase() }));
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
  task?.addEventListener('input', () => { renderShortlist(); saveLocation(); });
  query.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(update, 100); });
  selects.forEach((control) => control.addEventListener('change', update));
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


// Tab bars: a nav[data-tabs] of in-page links, each naming a [data-pane]
// section by its hash. Without this script every pane stays visible in
// order; with it, one pane shows at a time and the hash follows the choice.
document.querySelectorAll('[data-tabs]').forEach(function (bar) {
  const tabs = [...bar.querySelectorAll('a[href^="#"]')];
  const panes = tabs.map((tab) => document.getElementById(tab.hash.slice(1))).filter(Boolean);
  if (tabs.length < 2 || panes.length !== tabs.length) return;
  bar.closest('section, main')?.classList.add('js-tabs');
  function show(id, push) {
    tabs.forEach((tab, i) => {
      const on = tab.hash.slice(1) === id;
      if (on) tab.setAttribute('aria-current', 'true'); else tab.removeAttribute('aria-current');
      panes[i].hidden = !on;
    });
    if (push) history.replaceState(null, '', '#' + id);
  }
  const wanted = location.hash.slice(1);
  show(panes.some((p) => p.id === wanted) ? wanted : tabs[0].hash.slice(1), false);
  tabs.forEach((tab) => tab.addEventListener('click', (event) => {
    event.preventDefault();
    show(tab.hash.slice(1), true);
    document.getElementById(tab.hash.slice(1))?.querySelector('h2, h3')?.focus?.();
  }));
  window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (panes.some((p) => p.id === id)) show(id, false); });
});

// Compare two or three skills from the published index and their reports.
const compareForm = document.querySelector('form[data-compare]');
if (compareForm && compareForm.elements && typeof compareForm.getAttribute === 'function') {
  const base = compareForm.getAttribute('data-directory') || './';
  const results = document.querySelector('[data-compare-results]');
  const status = compareForm.querySelector('[data-compare-status]');
  const list = compareForm.querySelector('#compare-skills');
  const inputs = ['a', 'b', 'c'].map((name) => compareForm.elements[name]);
  let index = null;
  compareForm.hidden = false;
  const label = (s) => s.name + ' (' + s.repo + ')';
  function find(text) {
    const t = text.trim().toLowerCase();
    if (!t || !index) return null;
    return index.find((s) => label(s).toLowerCase() === t) || index.find((s) => s.id === t || s.href === t) || index.find((s) => s.name.toLowerCase() === t) || index.find((s) => (s.repo + '/' + s.name).toLowerCase() === t) || null;
  }
  async function load() {
    const r = await fetch(base + 'search-index.json');
    if (!r.ok) throw new Error('index');
    index = await r.json();
    list.replaceChildren(...index.map((s) => { const o = document.createElement('option'); o.value = label(s); return o; }));
  }
  function cell(text, cls) { const td = node('td', cls || ''); td.textContent = text; return td; }
  async function render(push) {
    const picks = inputs.map((input) => find(input.value)).filter(Boolean);
    const seen = new Set();
    const unique = picks.filter((s) => !seen.has(s.id) && seen.add(s.id));
    if (push) {
      const url = new URL(location.href);
      ['a', 'b', 'c'].forEach((k, i) => { if (unique[i]) url.searchParams.set(k, unique[i].id); else url.searchParams.delete(k); });
      history.replaceState(null, '', url);
    }
    if (unique.length < 2) { results.replaceChildren(); status.textContent = unique.length === 1 ? 'Pick one more skill to compare.' : 'Type a skill name and pick it from the list. The picks stay in this page\'s address.'; return; }
    status.textContent = 'Comparing ' + unique.map((s) => s.name).join(', ') + '…';
    const reports = await Promise.all(unique.map((s) => fetch(base + s.report.replace(/^\/directory\//, '')).then((r) => (r.ok ? r.json() : null)).catch(() => null)));
    const rows = [
      ['Score', (s) => s.score + '/100'],
      ['Grade', (s) => s.grade],
      ['Repository', (s) => s.repo],
      ['License', (s) => s.license],
      ['Cost lane', (s) => s.lane || ''],
      ['Capabilities', (s) => (s.flags || []).join(', ')],
      ['Topics', (s) => (s.topics || []).join(', ')],
      ['Category', (s) => s.label],
      ['Listed since', (s) => s.listed || ''],
      ['Last commit', (s) => s.updated || ''],
      ['Installs via skills.sh', (s) => (Number.isFinite(s.installs) && s.installs > 0 ? compactCount(s.installs) : 'no count')],
    ];
    const components = reports[0] && reports[0].quality && reports[0].quality.components ? reports[0].quality.components.map((c) => c.label || c.id) : [];
    const table = document.createElement('table');
    table.className = 'compare-grid';
    const thead = table.createTHead().insertRow();
    thead.append(node('th', '', 'Fact'));
    unique.forEach((s) => { const th = node('th', ''); const a = node('a', '', s.name); a.href = base + s.href.replace(/^\/directory\//, ''); th.append(a); thead.append(th); });
    const body = table.createTBody();
    rows.forEach(([name, get]) => {
      const tr = body.insertRow();
      tr.append(node('th', '', name));
      const values = unique.map(get);
      const best = name === 'Score' ? Math.max(...unique.map((s) => s.score)) : null;
      unique.forEach((s, i) => tr.append(cell(values[i], best !== null && s.score === best ? 'best' : '')));
    });
    components.forEach((name, ci) => {
      const tr = body.insertRow();
      tr.append(node('th', '', name));
      const pts = reports.map((r) => (r && r.quality && r.quality.components[ci] ? r.quality.components[ci].points : null));
      const best = Math.max(...pts.map((p) => (p === null ? -1 : p)));
      reports.forEach((r, i) => tr.append(cell(pts[i] === null ? '' : pts[i] + ' of ' + (r.quality.components[ci].max ?? ''), pts[i] !== null && pts[i] === best && best > 0 ? 'best' : '')));
    });
    const wrap = node('div', 'table-wrap');
    wrap.append(table);
    results.replaceChildren(wrap);
    status.textContent = 'Comparing ' + unique.length + ' skills from the ' + (unique[0].snapshot || '') + ' snapshot. Highlighted cells are the highest in their row.';
  }
  load().then(() => {
    const params = new URL(location.href).searchParams;
    ['a', 'b', 'c'].forEach((k, i) => { const s = index.find((x) => x.id === params.get(k)); if (s) inputs[i].value = label(s); });
    return render(false);
  }).catch(() => { status.textContent = 'The index could not load. Try again, or open two skill pages side by side.'; });
  compareForm.addEventListener('submit', (event) => { event.preventDefault(); render(true); });
  compareForm.addEventListener('change', () => render(true));
  compareForm.querySelector('[data-compare-clear]').addEventListener('click', () => { inputs.forEach((i) => { i.value = ''; }); render(true); inputs[0].focus(); });
}
