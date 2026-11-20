import { findSkills } from './skill-matches.js';

const panes = Array.from(document.querySelectorAll('[data-home-pane]'));
const tabs = Array.from(document.querySelectorAll('[data-home-tab]'));
function showPane(name) {
  for (const pane of panes) pane.hidden = pane.dataset.homePane !== name;
  for (const tab of tabs) {
    if (tab.dataset.homeTab === name) tab.setAttribute('aria-current', 'true');
    else tab.removeAttribute('aria-current');
  }
}
function syncPane() {
  const target = document.getElementById(location.hash.slice(1));
  const pane = target?.closest('[data-home-pane]');
  showPane(pane?.dataset.homePane || 'browse');
  if (pane && target) target.scrollIntoView();
}
window.addEventListener('hashchange', syncPane);
for (const tab of tabs) {
  tab.addEventListener('click', event => {
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) showPane(tab.dataset.homeTab);
  });
}
syncPane();

const form = document.querySelector('[data-home-ask]');
const prompt = form.elements.q;
const panel = document.getElementById('ai-matches');
const note = panel.querySelector('[data-match-note]');
const results = panel.querySelector('[data-match-list]');
const fullSearch = panel.querySelector('.full-search');
let currentQuery = '';
let revision = 0;

function node(type, text, cls) {
  const el = document.createElement(type);
  if (text) el.textContent = text;
  if (cls) el.className = cls;
  return el;
}

function resultCard(row) {
  const item = node('li');
  const content = node('div');
  const title = node('a', row.name, 'match-name');
  title.href = row.href;
  content.append(node('small', row.label + ' · ' + row.repo.split('/')[0]), title, node('p', row.description));
  const actions = node('div', '', 'match-actions');
  const grade = node('span', row.grade + ' · ' + row.score + '/100');
  const save = node('button', 'Save');
  save.type = 'button';
  Object.assign(save.dataset, {save: row.id, saveName: row.name, saveHref: row.href, saveRepo: row.repo,
    saveScore: row.score, saveGrade: row.grade, saveCategory: row.label, saveLicense: row.license || ''});
  actions.append(grade, save);
  item.append(content, actions);
  return item;
}

async function search(value, remember = false) {
  const query = value.trim().slice(0, 360);
  const tick = ++revision;
  if (remember && currentQuery !== query) {
    const url = new URL(location.href);
    if (query) url.searchParams.set('ask', query);
    else url.searchParams.delete('ask');
    history.pushState(null, '', url);
  }
  currentQuery = query;
  prompt.value = query;
  panel.hidden = !query;
  results.replaceChildren();
  if (!query) return;
  note.textContent = 'Searching graded skills…';
  results.setAttribute('aria-busy', 'true');
  fullSearch.href = '/search/?q=' + encodeURIComponent(query);
  try {
    const { items, mode } = await findSkills(query, 6);
    if (tick !== revision) return;
    note.textContent = !items.length ? 'No matching skills. Try a different task or browse the directories below.'
      : mode === 'semantic' ? 'Ranked by semantic similarity and task keywords.' : 'Matched by task keywords and skill names.';
    results.replaceChildren(...items.map(resultCard));
    globalThis.paintSaved?.();
  } catch {
    if (tick !== revision) return;
    note.textContent = 'The skill index could not load. ';
    const retry = node('button', 'Try again');
    retry.type = 'button';
    retry.addEventListener('click', () => search(query));
    note.append(retry);
  } finally {
    if (tick === revision) results.removeAttribute('aria-busy');
  }
}
form.addEventListener('submit', event => {
  event.preventDefault();
  search(prompt.value, true);
});
for (const example of document.querySelectorAll('[data-ask-example]')) {
  example.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    search(example.dataset.askExample, true);
  });
}
panel.querySelector('[data-clear-ask]').addEventListener('click', () => { search('', true); prompt.focus(); });
function readQuery() { search(new URL(location.href).searchParams.get('ask') || ''); }
window.addEventListener('popstate', readQuery);
readQuery();
