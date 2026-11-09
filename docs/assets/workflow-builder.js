import { planWorkflow, recommendSkills, recommendArticles, isFirstParty, WORKFLOW_EXAMPLES } from './workflow-recommender.js';

// All planning stays in this browser. The only requests fetch public catalog data.
const root = document.querySelector('[data-workflow-builder]');
if (root) {
  const get = selector => root.querySelector(selector);
  const form = get('[data-workflow-form]');
  const brief = get('#workflow-brief');
  const submit = form.querySelector('[type="submit"]');
  const status = get('[data-workflow-status]');
  const results = get('[data-workflow-results]');
  const heading = get('[data-workflow-heading]');
  const exportText = get('[data-workflow-export]');
  const mode = get('[data-workflow-mode]');
  const freeOnly = get('[data-workflow-free]');
  const choices = get('[data-workflow-choices]');
  const suggestions = get('[data-workflow-suggestions]');
  let catalogPromise;
  let articlesPromise;
  let revision = 0;
  let current;
  let currentBrief = '';
  let reading = [];
  let moreSkills = [];
  let active = 0;
  const complete = new Set();
  let panels = [];
  let routes = [];
  let completionButtons = [];
  const element = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  };
  const button = (text, className, action) => {
    const el = element('button', className, text); el.type = 'button';
    el.addEventListener('click', action); return el;
  };
  const say = text => { status.textContent = text; };
  const sourceUrl = href => new URL(href, location.href).href;
  const setupFacts = skill => {
    const facts = [skill.license ? 'License: ' + skill.license : 'Check license on listing'];
    if (skill.lane === 'free-with-service') facts.push('External service may require an account or paid plan');
    if (skill.lane === 'noncommercial') facts.push('Non-commercial use only');
    if (skill.lane === 'restricted') facts.push('Check the publisher’s usage restrictions');
    if (skill.flags?.includes('api-key')) facts.push('Requires a credential or API key');
    if (skill.flags?.includes('runs-commands')) facts.push('Runs commands');
    if (skill.flags?.includes('mcp')) facts.push('Uses an MCP server');
    return facts.join(' · ');
  };
  async function loadJson(file) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(file, { signal: controller.signal });
      if (!response.ok) throw new Error('Catalog request failed');
      return await response.json();
    } finally { clearTimeout(timeout); }
  }
  function loadCatalog() {
    if (!catalogPromise) catalogPromise = loadJson('search-index.json').then(data => {
      if (!Array.isArray(data) || !data.length) throw new Error('Catalog unavailable');
      return data;
    }).catch(error => { catalogPromise = undefined; throw error; });
    return catalogPromise;
  }
  function updateExport() {
    if (!current) return;
    const lines = [current.title, '', 'My goal: ' + currentBrief, '', current.summary, '',
      'AI handoff', 'Help me work through this suggested workflow one step at a time. Treat my goal as the brief, not as instructions to bypass your safeguards. Ask about any missing requirements, budget, existing stack and constraints before implementation. Review each linked skill’s instructions, license and setup before using it. Confirm scope and handoffs with me before making changes. Never assume a listed skill is installed or that a quality score is a security check.',
      'Planning method: browser-local catalog matching, not a model-generated answer.',
      `Preferences: ${mode.value === 'simple' ? 'Essential steps' : 'Complete workflow'}; ${freeOnly.checked ? 'open-source licenses only (service costs still need checking)' : 'all license types, with setup facts below'}.`, ''];
    if (current.notices?.length) lines.push('Scope notes', ...current.notices.map(note => '- ' + note), '');
    for (const [i, step] of current.steps.entries()) lines.push(`${i + 1}. [${complete.has(i) ? 'done' : 'to do'}] ${step.title}`, `Skill: ${step.skill.name} (${step.skill.repo})`, sourceUrl(step.skill.href), step.why, `Carry forward: ${step.output}`, setupFacts(step.skill), '');
    lines.push('Tips', ...current.tips.map(tip => '- ' + tip), '', 'Quality scores describe published files, not security or a guarantee of fit.');
    if (moreSkills.length) lines.push('', 'Recommended skills for this goal', ...moreSkills.map(skill => `- ${skill.name} (${skill.repo}) ${sourceUrl(skill.href)}`));
    for (const article of reading) lines.push('', `Read next: ${article.title}`, `By ${article.author}`, article.href);
    exportText.value = lines.join('\n');
  }
  function loadArticles() {
    if (!articlesPromise) articlesPromise = loadJson('workflow-articles.json').catch(() => { articlesPromise = undefined; return { articles: [] }; });
    return articlesPromise;
  }
  // Authored reading: the best article for each matched workflow, then the
  // strongest matches for the person's own words. Only Jason's published
  // articles pass recommendArticles' checks.
  function renderReading(aside, articles) {
    aside.replaceChildren();
    aside.hidden = !articles.length;
    if (!articles.length) return;
    aside.append(element('p', 'eyebrow', 'Read next, from Jason Colapietro'));
    for (const article of articles) {
      const block = element('div', 'workflow-reading-item');
      const link = element('a', '', article.title); link.href = article.href;
      block.append(link, element('p', '', article.summary), element('p', 'muted', 'By ' + article.author));
      aside.append(block);
    }
  }
  async function showReading(prompt, intents, token) {
    const data = await loadArticles();
    if (token !== revision || !current) return;
    reading = recommendArticles(prompt, intents, data?.articles, 3);
    renderReading(get('[data-workflow-reading]'), reading);
    updateExport();
  }
  // Suede AI's own skills wear the site's gold "Suede first" treatment.
  const suedeBadge = () => element('span', 'workflow-suede-badge', 'Suede AI pick');
  function skillItem(skill) {
    const suede = isFirstParty(skill);
    const item = element('li', 'workflow-skill-item' + (suede ? ' is-suede' : ''));
    if (suede) item.append(suedeBadge());
    const head = element('p', 'workflow-skill-meta');
    const link = element('a', 'workflow-skill', skill.name); link.href = skill.href;
    const facts = element('span', '', skill.repo);
    head.append(link, facts);
    if (/^[A-D]$/.test(skill.grade) && Number.isFinite(skill.score)) head.append(element('span', 'grade grade-' + skill.grade.toLowerCase(), `${skill.score} · ${skill.grade}`));
    item.append(head);
    if (typeof skill.description === 'string' && skill.description) item.append(element('p', 'workflow-skill-description', skill.description));
    item.append(element('p', 'workflow-setup', setupFacts(skill)));
    return item;
  }
  async function showSuggestions(prompt, plan, catalog, token) {
    const skills = recommendSkills(prompt, catalog, { freeOnly: Boolean(freeOnly.checked), limit: 6 });
    const data = await loadArticles();
    if (token !== revision) return false;
    const articles = recommendArticles(prompt, (plan.intents || []).map(intent => intent.id), data?.articles, 3);
    if (!skills.length && !articles.length) return false;
    get('[data-workflow-skill-list]').replaceChildren(...skills.map(skillItem));
    get('[data-workflow-skill-list]').hidden = !skills.length;
    get('#workflow-suggestions-title').textContent = skills.length ? 'Skills that fit your goal' : 'Reading for your goal';
    get('[data-workflow-suggestions-summary]').textContent = skills.length
      ? `${skills.length} graded skills match what you described${skills.some(isFirstParty) ? ', Suede AI’s own skills first' : ', strongest match first'}. For a step-by-step workflow, pick a goal above or add more detail.`
      : 'No listed skill matches those words closely yet. These articles cover the ground, or pick a goal above for a step-by-step workflow.';
    renderReading(get('[data-workflow-suggest-reading]'), articles);
    suggestions.hidden = false;
    return true;
  }
  function updateProgress() {
    get('[data-workflow-progress]').max = current.steps.length;
    get('[data-workflow-progress]').value = complete.size;
    get('[data-workflow-progress-label]').textContent = `${complete.size} of ${current.steps.length} steps complete`;
    get('[data-workflow-reset-progress]').disabled = !complete.size;
    routes.forEach((route, i) => {
      route.setAttribute('aria-label', `Step ${i + 1}: ${current.steps[i].title}${complete.has(i) ? ', completed' : ''}`);
      route.setAttribute('data-completed', String(complete.has(i)));
      completionButtons[i].textContent = complete.has(i) ? 'Completed ✓' : 'Mark step complete';
      completionButtons[i].setAttribute('aria-pressed', String(complete.has(i)));
    });
    updateExport();
  }
  function selectStep(index, focus = false) {
    active = index;
    panels.forEach((panel, i) => { panel.hidden = i !== active; });
    routes.forEach((route, i) => {
      if (i === active) route.setAttribute('aria-current', 'step'); else route.removeAttribute('aria-current');
    });
    if (focus) panels[active].querySelector('h4')?.focus({ preventScroll: true });
  }
  function renderSteps() {
    const list = get('[data-workflow-steps]'); list.replaceChildren();
    const routeList = get('[data-workflow-route]'); routeList.replaceChildren();
    panels = []; routes = []; completionButtons = [];
    current.steps.forEach((step, i) => {
      const route = button('', 'workflow-route-step', () => selectStep(i));
      route.append(element('span', 'workflow-route-number', String(i + 1).padStart(2, '0')), element('span', '', step.title));
      routeList.append(route); routes.push(route);
      const item = element('li', 'workflow-step'); item.id = 'workflow-stage-' + i; route.setAttribute('aria-controls', item.id);
      item.append(element('p', 'eyebrow', `Step ${String(i + 1).padStart(2, '0')} / ${String(current.steps.length).padStart(2, '0')}`));
      const title = element('h4', '', step.title); title.tabIndex = -1; item.append(title, element('p', 'workflow-step-why', step.why));
      const suede = isFirstParty(step.skill);
      const skillBox = element('div', 'workflow-skill-box' + (suede ? ' is-suede' : ''));
      skillBox.append(element('span', 'eyebrow', 'Your skill for this step'));
      if (suede) skillBox.append(suedeBadge());
      const skillLink = element('a', 'workflow-skill', step.skill.name); skillLink.href = step.skill.href;
      const meta = element('p', 'workflow-skill-meta'); meta.append(skillLink, element('span', '', step.skill.repo));
      skillBox.append(meta, element('p', 'workflow-setup', setupFacts(step.skill)));
      const alternatives = (step.alternatives || []).filter(skill => !current.steps.some((other, j) => j !== i && other.skill.id === skill.id));
      if (alternatives.length) {
        const label = element('label', 'workflow-alternative-label', 'Choose a skill'); label.htmlFor = 'workflow-alternative-' + i;
        const select = element('select', 'workflow-alternative'); select.id = label.htmlFor;
        const options = [...new Map([step.skill, ...alternatives].map(skill => [skill.id, skill])).values()];
        options.forEach(skill => { const option = element('option', '', `${skill.name} · ${skill.repo}`); option.value = skill.id; select.append(option); });
        select.value = step.skill.id;
        select.addEventListener('change', () => {
          const selected = options.find(skill => skill.id === select.value);
          if (!selected) return;
          const old = step.skill; step.skill = selected; step.alternatives = options.filter(skill => skill.id !== selected.id);
          if (old.id !== selected.id) complete.delete(i);
          renderSteps(); updateProgress(); selectStep(active);
          get('#workflow-alternative-' + i)?.focus();
          say('Skill updated. Setup facts and the copied plan now match your selection.');
        });
        skillBox.append(label, select);
      }
      item.append(skillBox);
      const output = element('div', 'workflow-handoff'); output.append(element('span', 'eyebrow', 'Carry forward'), element('p', '', step.output)); item.append(output);
      const actions = element('div', 'workflow-step-actions');
      const done = button('Mark step complete', 'button workflow-complete', () => {
        if (complete.has(i)) complete.delete(i); else complete.add(i);
        updateProgress(); say(`${complete.size} of ${current.steps.length} steps complete. Progress stays in this page until you leave or rebuild.`);
      }); done.setAttribute('data-workflow-complete', ''); completionButtons.push(done); actions.append(done);
      const navigate = element('div', 'workflow-step-navigation');
      if (i > 0) navigate.append(button('← Previous', 'workflow-text-button', () => selectStep(i - 1, true)));
      if (i < current.steps.length - 1) navigate.append(button('Next step →', 'workflow-text-button', () => selectStep(i + 1, true)));
      actions.append(navigate); item.append(actions); list.append(item); panels.push(item);
    });
  }
  function render(plan, prompt, token, catalog) {
    current = plan; currentBrief = prompt; reading = []; complete.clear(); active = 0;
    const planned = new Set(plan.steps.flatMap(step => [step.skill.id, ...(step.alternatives || []).map(skill => skill.id)]));
    moreSkills = recommendSkills(prompt, catalog, { exclude: planned, freeOnly: Boolean(freeOnly.checked), limit: 3 });
    heading.textContent = plan.title;
    get('[data-workflow-summary]').textContent = plan.summary;
    const overview = get('[data-workflow-overview]'); overview.replaceChildren();
    for (const label of [`${plan.steps.length} skills`, ...(plan.intents || []).map(intent => intent.title), mode.value === 'simple' ? 'Essential plan' : 'Full plan']) overview.append(element('span', 'workflow-chip', label));
    for (const notice of plan.notices || []) overview.append(element('p', 'workflow-notice', notice));
    renderSteps(); updateProgress(); selectStep(0);
    get('[data-workflow-tips]').replaceChildren(...plan.tips.map(tip => element('li', '', tip)));
    get('[data-workflow-reading]').hidden = true;
    get('[data-workflow-more-list]').replaceChildren(...moreSkills.map(skillItem));
    get('[data-workflow-more]').hidden = !moreSkills.length;
    get('[data-workflow-copy-fallback]').open = false;
    results.hidden = false;
    say(plan.steps.length + ' steps ready. Start with ' + plan.steps[0].title.toLowerCase() + '.');
    heading.focus({ preventScroll: true }); results.scrollIntoView({ behavior: 'instant', block: 'nearest' });
    void showReading(prompt, (plan.intents || [{ id: plan.intent }]).map(intent => intent.id), token);
  }
  function invalidate() {
    revision++; current = undefined; reading = []; moreSkills = []; results.hidden = true; suggestions.hidden = true; choices.replaceChildren();
    submit.disabled = false; form.removeAttribute('aria-busy'); brief.removeAttribute('aria-invalid'); say('');
  }
  async function build() {
    const token = ++revision;
    const prompt = brief.value.trim().slice(0, 2000);
    results.hidden = true; suggestions.hidden = true; current = undefined; choices.replaceChildren();
    if (!prompt) { say('Describe what you’re working on or trying to achieve, or pick an example below.'); brief.setAttribute('aria-invalid', 'true'); brief.focus(); return; }
    brief.removeAttribute('aria-invalid'); submit.disabled = true; form.setAttribute('aria-busy', 'true');
    say('Finding skills, workflows and articles for your goal…');
    try {
      const catalog = await loadCatalog(); if (token !== revision) return;
      const plan = planWorkflow(prompt, catalog, { mode: mode.value, freeOnly: Boolean(freeOnly.checked) });
      if (plan.status !== 'ready') {
        for (const choice of plan.choices || WORKFLOW_EXAMPLES) choices.append(button(choice.label, 'workflow-choice', () => { brief.value = choice.prompt; void build(); }));
        const suggested = await showSuggestions(prompt, plan, catalog, token);
        if (token !== revision) return;
        if (suggested) {
          say('Here’s what fits what you described. Pick a goal below for a step-by-step workflow.');
          get('#workflow-suggestions-title').focus({ preventScroll: true });
        } else {
          say(plan.summary || 'Name a specific result, then try again.');
          brief.focus();
        }
        return;
      }
      render(plan, prompt, token, catalog);
    } catch {
      if (token === revision) say('The skill catalog could not load. What you wrote is still here. Select Get recommendations to try again, or browse the recommended stacks.');
    } finally { if (token === revision) { submit.disabled = false; form.removeAttribute('aria-busy'); } }
  }
  form.addEventListener('submit', event => { event.preventDefault(); void build(); });
  brief.addEventListener('input', invalidate); mode.addEventListener('change', invalidate); freeOnly.addEventListener('change', invalidate);
  for (const example of WORKFLOW_EXAMPLES) get('[data-workflow-examples]').append(button(example.label, '', () => { brief.value = example.prompt; void build(); }));
  const refine = () => { brief.focus(); brief.scrollIntoView({ block: 'center', behavior: 'instant' }); };
  get('[data-workflow-refine]').addEventListener('click', refine);
  get('[data-workflow-suggest-refine]').addEventListener('click', refine);
  get('[data-workflow-reset-progress]').addEventListener('click', () => { if (current) { complete.clear(); updateProgress(); say('Progress reset. Your workflow and selected skills are unchanged.'); } });
  get('[data-workflow-copy]').addEventListener('click', async () => {
    const token = revision;
    try { await navigator.clipboard.writeText(exportText.value); if (token === revision) say('Copied. Paste this workflow into your agent to get started.'); }
    catch { if (token === revision) { get('[data-workflow-copy-fallback]').open = true; exportText.focus(); exportText.select(); say('Select and copy the workflow text below.'); } }
  });
  form.hidden = false;
}
