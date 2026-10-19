import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { qualityScore } from '../scripts/directory/badges.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const data = JSON.parse(read('directory/featured-projects.json'));
const published = () => read('docs/directory/featured/index.html');

test('editorial projects preserve accepted scopes and resolve their reviewed evidence', () => {
  assert.deepEqual(data.projects.map((p) => p.repo), ['appierun/appie-mcp', 'TheColliery/CoalWash', 'costory-io/costory-finops-mcp-skills']);
  const page = published();
  const appie = page.split('id="appie"')[1].split('</article>')[0];
  const links = [...appie.matchAll(/href="(\.\.\/appierun\/appie-mcp\/[^"/]+\/)"/g)].map((m) => m[1]);
  assert.deepEqual(links, [
    '../appierun/appie-mcp/appie-article-writer/',
    '../appierun/appie-mcp/appie-chatbot/',
    '../appierun/appie-mcp/appie-url-shortener/',
  ]);
  for (const href of links) assert.ok(fs.existsSync(path.resolve(root, 'docs/directory/featured', href, 'index.html')));
  assert.doesNotMatch(appie, /linkedin|reddit|npx skills add/i);
  for (const project of data.projects) {
    assert.ok(fs.existsSync(path.join(root, project.review)));
    assert.match(project.commit, /^[a-f0-9]{40}$/);
    assert.ok(page.includes(`https://github.com/${project.repo}/tree/${project.commit}`));
  }
});

test('CoalWash publishes only the complete plugin route with material hook behavior', () => {
  const page = published();
  const commands = page.match(/<code id="coalwash-commands">([^<]+)<\/code>/)?.[1];
  assert.equal(commands, 'claude plugin marketplace add TheColliery/CoalWash\nclaude plugin install coalwash@coalwash');
  assert.doesNotMatch(page, /npx skills add|cp -R|lossless|security certified|security-scan-passed/i);
  for (const fact of ['SessionStart', 'Stop', 'PreToolUse', 'PostToolUse', 'without a new prompt', 'requires consent', 'Shell writes', 'semantic preservation']) assert.ok(page.includes(fact), fact);
  assert.ok(page.includes('data-copy-target="coalwash-commands"'));
  assert.ok(page.includes('Snapshot and token-check coverage</summary>'));
  assert.doesNotMatch(page, /class="grade|score\.svg|badge\.svg|aggregateRating|reviewRating/);
});

test('featured page has a discoverable route, truthful structured data and selection context', () => {
  const page = published();
  assert.match(read('docs/directory/index.html'), /class="featured-callout" href="featured\/"/);
  assert.match(page, /rel="canonical" href="https:\/\/skills\.suedeai\.ai\/directory\/featured\/"/);
  assert.equal((page.match(/<h1[ >]/g) || []).length, 1);
  const blocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const collection = blocks.find((x) => x['@type'] === 'CollectionPage');
  assert.equal(collection.mainEntity.numberOfItems, 3);
  assert.deepEqual(collection.mainEntity.itemListElement.map((p) => p.name), ['Appie', 'CoalWash', 'Costory']);
  assert.match(page, /README-badge verification is tracked separately/);
  assert.match(page, /href="\.\.\/submit\/"/);
  assert.match(page, /href="\.\.\/methodology\/"/);
});

test('Costory features only accepted upstream skills scoring above 80', () => {
  const catalog = JSON.parse(read('directory/skills.json'));
  const project = data.projects.find((p) => p.id === 'costory');
  assert.ok(project, 'Costory editorial selection');
  const records = catalog.skills.filter((s) => s.repo === project.repo);
  assert.deepEqual(records.map((s) => s.name), ['bigquery']);
  assert.deepEqual(project.skills.map((s) => s.id), records.map((s) => s.slug));
  assert.equal(project.commit, catalog.repos[project.repo].commit_sha);
  for (const record of records) {
    const score = qualityScore(record, catalog.repos[project.repo], catalog.generated);
    assert.ok(score > 80, `${record.name}: ${score}`);
    assert.equal(record.score, score);
    assert.ok(record.featured);
  }
  const page = published();
  const feature = page.split('id="costory"')[1].split('</article>')[0];
  assert.match(feature, /href="\.\.\/costory-io\/costory-finops-mcp-skills\/bigquery\/"/);
  assert.match(feature, /Costory workspace/);
  assert.match(feature, /OAuth/);
  assert.doesNotMatch(feature, /cost-change-investigation\/|virtual-dimensions\/|costory-finops\//);
  assert.match(page, /<meta name="description" content="[^"]*Costory/);
  const listing = read('docs/directory/costory-io/costory-finops-mcp-skills/bigquery/index.html');
  const installation = listing.split('id="install-title"')[1].split('</section>')[0];
  assert.match(installation, /href="https:\/\/docs\.costory\.io\/features\/mcp"/);
  assert.match(installation, /browser OAuth/);
  assert.match(installation, /Costory workspace with billing data connected/);
  assert.ok(installation.indexOf('docs.costory.io/features/mcp') < installation.indexOf('id="install-cli"'));
});
