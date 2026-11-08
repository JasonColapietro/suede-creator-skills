import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { rewriteText } from '../scripts/build-directory-site.mjs';
const home = fs.readFileSync(new URL('../docs/directory/index.html', import.meta.url), 'utf8');
test('homepage offers a labeled workflow brief before the rankings with honest progressive enhancement', () => {
  assert.ok(home.includes('id="workflow-brief"'), 'a build brief is available on the homepage');
  assert.ok(home.indexOf('id="workflow-builder"') < home.indexOf('id="board-title"'));
  assert.match(home, /<label[^>]+for="workflow-brief"/);
  assert.match(home, /<textarea[^>]+maxlength="600"/);
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
    assert.match(item.href, /^https:\/\/suedeai\.directory\//);
    const url = new URL(item.href);
    const html = fs.readFileSync(new URL('../docs/directory' + url.pathname + 'index.html', import.meta.url), 'utf8');
    assert.ok(html.includes('Jason Colapietro'));
  }
  for (const intent of ['landing-page', 'web-app', 'seo-and-ai-search', 'content-and-social', 'agent-building', 'documents-and-data', 'research', 'video-and-creative']) assert.ok(published.articles.some(article => article.intents.includes(intent)), intent);
});
