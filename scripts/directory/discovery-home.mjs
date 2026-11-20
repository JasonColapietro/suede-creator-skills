const DISCOVERY = '/assets/discovery';
const BRAND = '/assets/suede-ai-logo-transparent.webp';
const tab = (label, id, panel, selected = false) => `<a href="#${id}" data-home-tab="${panel}"${selected ? ' aria-current="true"' : ''}>${label}</a>`;

function homeHero(total, publishers, originalHero) {
  const figure = originalHero.match(/<figure\b[\s\S]*?<\/figure>/)?.[0] || '';
  return `<header class="directory-hero home-hero">
    <div class="home-copy"><p class="home-kicker">SUEDE AI <span>/</span> SKILLS DIRECTORY</p>
    <h1>Find a skill for <em>your agent.</em></h1>
    <p class="home-subtitle">Search ${total} graded skills for Claude Code, Codex and Cursor.</p>
    <form class="home-ask" data-home-ask action="/search/" method="get">
      <label for="home-prompt">AI skill search</label>
      <div class="ask-input"><span class="ask-symbol" aria-hidden="true">✦</span><input id="home-prompt" name="q" type="search" autocomplete="off" maxlength="360" placeholder="Describe your task…" required><button type="submit" aria-label="Search for matching skills">Search <span aria-hidden="true">→</span></button></div>
    </form>
    <div class="home-examples"><span>Try</span><a href="/search/?q=Review+a+pull+request" data-ask-example="Review a pull request">Review a pull request</a><a href="/search/?q=Turn+meeting+notes+into+slides" data-ask-example="Turn meeting notes into slides">Make slides from notes</a><a href="/search/?q=Find+technical+SEO+issues" data-ask-example="Find technical SEO issues">Audit a website</a></div></div>
    <aside class="index-overview" aria-label="Directory snapshot"><div class="index-overview-top"><strong>Skill index</strong><a href="/methodology/">How grading works ↗</a></div>
    <div class="index-flow" aria-hidden="true"><span class="flow-agent"><img src="/assets/suede-landing/assets/claudecode-color.svg" alt=""><img src="/assets/suede-landing/assets/codex-color.svg" alt=""></span><i></i><span class="flow-brand"><img src="${BRAND}" alt=""></span><i></i><span class="flow-terminal">SKILL.md</span></div>
    <div class="index-facts"><span><b>${total}</b> graded skills</span><span><b>${publishers}</b> repositories</span></div>
    <div class="index-links"><a href="/tour/">Explore the skill map →</a><details class="score-distribution"><summary>Score distribution</summary>${figure}</details></div></aside>
  </header>
  <section class="home-matches" id="ai-matches" aria-labelledby="home-match-heading" hidden><div class="match-title"><div><h2 id="home-match-heading">Skill matches</h2><p data-match-note aria-live="polite"></p></div><button type="button" data-clear-ask>Clear</button></div><ol data-match-list></ol><a class="full-search" href="/search/">Open full search →</a></section>`;
}

const HOME_TOOLS = `<nav class="home-tools" aria-label="Directory tools">
  <div>${tab('Browse & filter', 'browse', 'browse', true)}${tab('Workflow builder', 'workflow-builder', 'workflow')}${tab('Rankings', 'board-title', 'rankings')}</div>
  <div><a href="/compare/">Compare</a><a href="/saved/">Saved</a><a href="/publishers/">Publishers</a><a href="/submit/">List your skill ↗</a></div>
</nav>`;

function homeModule(source, from, until) {
  const start = source.indexOf(from);
  const end = source.indexOf(until, start + from.length);
  if (start < 0 || end < 0) throw new Error('Directory homepage module is missing: ' + from);
  return source.slice(start, end);
}

export function directoryHome(original, total, publishers) {
  // Recompose the generated, first-party homepage. Every result, workflow, tab,
  // progress control, and index below the hero remains the native directory UI.
  const hero = homeModule(original, '<header class="directory-hero">', '<div class="directory-start">');
  const workflows = homeModule(original, '<div class="directory-start">', '<section class="board-section"');
  const rankings = homeModule(original, '<section class="board-section"', '<section class="directory-browser"');
  const browse = homeModule(original, '<section class="directory-browser"', '<section class="panel" aria-labelledby="featured-strip-title">');
  const catalogs = original.match(/<nav class="kind-bar"[\s\S]*?<\/nav>/)?.[0];
  if (!catalogs) throw new Error('Directory catalog navigation is missing');
  const catalogsOnHome = catalogs.replace(/href="(?:\.\/|\/)"/, 'href="#browse"');
  const filteredBrowse = browse.replace('>Search skills</label>', '>Filter by keyword</label>');
  const sections = [
    homeHero(total, publishers, hero),
    `<section class="catalog-switcher" aria-labelledby="home-catalogs"><div class="catalog-title"><h2 id="home-catalogs">Directories</h2><a href="/catalog/">All skills →</a></div>${catalogsOnHome}</section>`,
    HOME_TOOLS,
    `<div data-home-pane="browse">${filteredBrowse}</div>`,
    `<div data-home-pane="workflow">${workflows}</div>`,
    `<div data-home-pane="rankings">${rankings}</div>`
  ].join('\n');
  return original.replace(catalogs, '').replace(hero + workflows + rankings + browse, () => sections)
    .replace('<details class="nav-disclosure" open>', '<details class="nav-disclosure">')
    .replace('<body>', '<body class="discovery-home" data-directory-data-root="/">')
    .replace('<script src="/assets/directory.js"', '<script defer src="/assets/discovery/index-source.js"></script>\n<script src="/assets/directory.js"')
    .replace('</head>', `<link rel="stylesheet" href="${DISCOVERY}/home.css"><link rel="stylesheet" href="/assets/suede-landing/support.css"><script type="module" src="${DISCOVERY}/home.js"></script><script defer src="/assets/suede-landing/support.js"></script></head>`);
}
