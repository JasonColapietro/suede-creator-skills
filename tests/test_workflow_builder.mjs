import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { rewriteText } from '../scripts/build-directory-site.mjs';
const home = fs.readFileSync(new URL('../docs/directory/index.html', import.meta.url), 'utf8');
test('homepage offers a labeled workflow brief before the rankings with honest progressive enhancement', () => {
  assert.ok(home.includes('id="workflow-brief"'), 'a build brief is available on the homepage');
  assert.ok(home.indexOf('id="workflow-builder"') < home.indexOf('id="board-title"'));
  assert.match(home, /<label[^>]+for="workflow-brief"/);
  assert.match(home, /<textarea[^>]+maxlength="2000"/);
  assert.match(home, /data-workflow-form hidden/);
  assert.match(home, /<noscript>[\s\S]*?stacks\//);
  assert.ok(home.includes('data-workflow-status'));
  assert.ok(home.includes('data-workflow-results hidden'));
  assert.ok(home.includes('type="module" src="../assets/workflow-builder.js"'));
  assert.ok(home.includes('href="../assets/workflow-builder.css"'));
});
test('standalone directory homepage keeps workflow assets local', () => {
  const standalone = rewriteText(home, '.html', 'https://skills.suedeai.ai/directory/index.html');
  assert.ok(standalone.includes('src="/assets/workflow-builder.js"'));
  assert.ok(standalone.includes('href="/assets/workflow-builder.css"'));
});
test('reading recommendations only publish verified user-authored sources with covered workflow intents', () => {
  const source = JSON.parse(fs.readFileSync(new URL('../directory/editorial/workflow-articles.json', import.meta.url), 'utf8'));
  const published = JSON.parse(fs.readFileSync(new URL('../docs/directory/workflow-articles.json', import.meta.url), 'utf8'));
  assert.equal(published.articles.length, source.articles.length);
  for (const item of published.articles) {
    assert.equal(item.author, 'Jason Colapietro');
    assert.ok(source.articles.some(article => article.href === item.href && article.authorship_source));
    assert.ok(item.intents.length || item.keywords.length, item.id);
    const url = new URL(item.href);
    // Directory stacks and guides, or Jason's blog posts and S-Tier chapters.
    const file = url.host === 'suedeai.directory' ? '../docs/directory' + url.pathname + 'index.html'
      : url.host === 'skills.suedeai.ai' && /^\/(blog|book)\//.test(url.pathname) ? '../docs' + url.pathname + (url.pathname.endsWith('/') ? 'index.html' : '')
      : null;
    assert.ok(file, item.href);
    const html = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.ok(html.includes('Jason Colapietro'), item.href);
  }
  assert.ok(published.articles.some(article => article.href.startsWith('https://skills.suedeai.ai/blog/')), 'blog posts are recommended');
  assert.ok(published.articles.some(article => article.href.startsWith('https://skills.suedeai.ai/book/')), 'book chapters are recommended');
  for (const intent of ['landing-page', 'web-app', 'seo-and-ai-search', 'content-and-social', 'agent-building', 'documents-and-data', 'research', 'video-and-creative']) assert.ok(published.articles.some(article => article.intents.includes(intent)), intent);
});

test('best-of topic charts appear before rankings and have a direct builder shortcut', () => {
  assert.ok(home.indexOf('id="best-of-title"') < home.indexOf('id="board-title"'));
  assert.match(home, /href="#best-of-title"[^>]*>Explore the best skills by topic/);
});

test('the homepage chat asks what the visitor is working on and shares the first screen with Best of', () => {
  assert.match(home, /<h2 id="workflow-title">What are you working on\?<\/h2>/);
  assert.match(home, /<label[^>]+for="workflow-brief">What are you doing, or trying to achieve\?<\/label>/);
  assert.ok(home.includes('data-workflow-suggestions hidden'), 'goal-based skill suggestions start hidden');
  assert.ok(home.includes('data-workflow-more hidden'), 'extra skills for a workflow start hidden');
  const start = home.indexOf('<div class="directory-start">');
  assert.ok(start !== -1 && start < home.indexOf('id="workflow-builder"'));
  assert.ok(home.indexOf('id="workflow-builder"') < home.indexOf('id="best-of-title"'));
  assert.ok(home.indexOf('id="best-of-title"') < home.indexOf('class="board-section"'));
  assert.ok(home.lastIndexOf('</div>', home.indexOf('class="board-section"')) > home.indexOf('id="best-of-title"'), 'Best of sits inside the shared start band');
});

test('recommended skills appear above the workflow steps in a ready plan', () => {
  assert.ok(home.indexOf('data-workflow-more hidden') < home.indexOf('data-workflow-steps'));
  assert.match(home, /<h4 id="workflow-more-title">Recommended skills for this goal<\/h4>/);
});
