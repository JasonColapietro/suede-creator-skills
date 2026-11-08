import { recommendWorkflow, WORKFLOW_EXAMPLES } from './workflow-recommender.js';

// Browser-only recommendation: no prompt, account, analytics or model API request.
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
  let catalogPromise;
  let articlesPromise;
  let revision = 0;
  let current;
  let currentBrief = '';
  const element = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  };
  const say = text => { status.textContent = text; };
  const sourceUrl = href => new URL(href, location.href).href;
  const setupFacts = skill => {
    const facts = [skill.license ? 'License: ' + skill.license : 'Check license on listing'];
    if (skill.lane === 'free-with-service') facts.push('External service may require an account or paid plan');
    if (skill.lane === 'noncommercial') facts.push('Non-commercial use only');
    if (skill.lane === 'restricted') facts.push("Check the publisher’s usage restrictions");
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
  function updateExport(article) {
    if (!current) return;
    const lines = [current.title, '', 'My goal: ' + currentBrief, '', current.summary, '',
      'Starter prompt: Help me work through this suggested workflow one step at a time. Review each skill’s instructions, license and setup before using it. Confirm scope and handoffs with me before making changes.', ''];
    for (const [i, step] of current.steps.entries()) lines.push(`${i + 1}. ${step.title}`, `Skill: ${step.skill.name} (${step.skill.repo})`, sourceUrl(step.skill.href), step.why, `Carry forward: ${step.output}`, setupFacts(step.skill), '');
    lines.push('Tips', ...current.tips.map(tip => '- ' + tip), '', 'Suggested from directory task matches. Quality scores describe published files, not security or a guarantee of fit.');
    if (article) lines.push('', `Go deeper: ${article.title}`, `By ${article.author}`, article.href);
    exportText.value = lines.join('\n');
  }
  async function showReading(intent, token) {
    if (!articlesPromise) articlesPromise = loadJson('workflow-articles.json').catch(() => ({ articles: [] }));
    const data = await articlesPromise;
    if (token !== revision) return;
    const article = (Array.isArray(data?.articles) ? data.articles : []).find(item => item && item.author === 'Jason Colapietro' && Array.isArray(item.intents) && item.intents.includes(intent) && /^https:\/\/suedeai\.directory\/(stacks|guides)\/[a-z0-9-]+\/$/.test(item.href) && item.title && item.summary);
    if (!article) return;
    const aside = get('[data-workflow-reading]');
    const link = element('a', '', article.title); link.href = article.href;
    aside.replaceChildren(element('p', 'eyebrow', 'Go deeper with Jason'), link, element('p', '', article.summary), element('p', 'muted', 'By ' + article.author));
    aside.hidden = false;
    updateExport(article);
  }
  function render(plan, prompt, token) {
    current = plan; currentBrief = prompt;
    heading.textContent = plan.title;
    get('[data-workflow-summary]').textContent = plan.summary;
    const steps = get('[data-workflow-steps]'); steps.replaceChildren();
    for (const [i, step] of plan.steps.entries()) {
      const item = element('li', 'workflow-step');
      const number = element('span', 'workflow-step-number', String(i + 1).padStart(2, '0')); number.setAttribute('aria-hidden', 'true');
      const body = element('div', 'workflow-step-body');
      body.append(element('h4', '', step.title));
      const skillLink = element('a', 'workflow-skill', step.skill.name); skillLink.href = step.skill.href;
      const meta = element('p', 'workflow-skill-meta');
      meta.append(skillLink, element('span', '', step.skill.repo));
      body.append(meta, element('p', '', step.why));
      const output = element('p', 'workflow-handoff'); output.append(element('b', '', 'Carry forward: '), document.createTextNode(step.output));
      body.append(output, element('p', 'workflow-setup', setupFacts(step.skill)));
      item.append(number, body); steps.append(item);
    }
    get('[data-workflow-tips]').replaceChildren(...plan.tips.map(tip => element('li', '', tip)));
    get('[data-workflow-reading]').hidden = true;
    get('[data-workflow-copy-fallback]').open = false;
    updateExport(); results.hidden = false;
    say(plan.steps.length + ' steps ready. Start with ' + plan.steps[0].title.toLowerCase() + '.');
    heading.focus({ preventScroll: true });
    results.scrollIntoView({ behavior: 'instant', block: 'nearest' });
    void showReading(plan.intent, token);
  }
  async function build() {
    const token = ++revision;
    const prompt = brief.value.trim();
    results.hidden = true; current = undefined;
    if (!prompt) { say('Describe what you want to build, or choose a starting idea below.'); brief.setAttribute('aria-invalid', 'true'); brief.focus(); return; }
    brief.removeAttribute('aria-invalid');
    submit.disabled = true; form.setAttribute('aria-busy', 'true');
    say('Finding complementary skills in the directory…');
    try {
      const catalog = await loadCatalog();
      if (token !== revision) return;
      const plan = recommendWorkflow(prompt, catalog);
      if (plan.status !== 'ready') {
        say('We could not match that brief to a complete workflow yet. Name a specific result, such as a landing page, a social campaign or an AI agent. You can also browse all skills below.');
        brief.focus(); return;
      }
      render(plan, prompt, token);
    } catch {
      if (token === revision) say('The skill catalog could not load. Your brief is still here. Select Build my workflow to try again, or browse the recommended stacks.');
    } finally {
      if (token === revision) { submit.disabled = false; form.removeAttribute('aria-busy'); }
    }
  }
  form.addEventListener('submit', event => { event.preventDefault(); void build(); });
  brief.addEventListener('input', () => {
    revision++; current = undefined; results.hidden = true;
    submit.disabled = false; form.removeAttribute('aria-busy'); brief.removeAttribute('aria-invalid'); say('');
  });
  for (const example of WORKFLOW_EXAMPLES) {
    const button = element('button', '', example.label); button.type = 'button';
    button.addEventListener('click', () => { brief.value = example.prompt; void build(); });
    get('[data-workflow-examples]').append(button);
  }
  get('[data-workflow-refine]').addEventListener('click', () => { brief.focus(); brief.scrollIntoView({ block: 'center', behavior: 'instant' }); });
  get('[data-workflow-copy]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(exportText.value); say('Copied. Paste this workflow into your agent to get started.'); }
    catch {
      get('[data-workflow-copy-fallback]').open = true; exportText.focus(); exportText.select(); say('Select and copy the workflow text below.');
    }
  });
  form.hidden = false;
}
