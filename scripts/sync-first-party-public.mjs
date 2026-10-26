#!/usr/bin/env node
// Synchronize maintained first-party public identities from SKILL.md metadata.
// Machine names, install paths, grouping, editorial benefits and retired pages
// remain independent of display names. --check performs the same build in memory.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { load } = createRequire(import.meta.url)('js-yaml');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const packBrand = value => value.replaceAll('Suede Creator Skills', 'Suede AI Skills').replaceAll('Suede Workflow Skills', 'Suede AI Workflow Skills');
const pattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function skillPage(html, displayName) {
  const title = esc(displayName);
  if (!/<h1\b[^>]*>[\s\S]*?<span class="h1-task">/.test(html)) throw new Error(`Missing public H1 task span: ${displayName}`);
  html = html.replace(/(<h1\b[^>]*>[\s\S]*?<span class="h1-task">)[\s\S]*?(<\/span>)/, (_, open, close) => open + title + close);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  for (const key of ['og:title', 'twitter:title']) {
    const re = new RegExp(`(<meta (?:property|name)="${key}" content=")[^"]*(">)`);
    html = html.replace(re, (_, open, close) => open + title + close);
  }
  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (_, open, text, close) => {
    // Change only the article identity string, retaining all other JSON-LD bytes.
    const node = JSON.parse(text);
    if (node['@type'] !== 'TechArticle') return open + text + close;
    if (typeof node.headline !== 'string') throw new Error(`Missing article headline: ${displayName}`);
    text = text.replace(/("headline"\s*:\s*)"(?:\\.|[^"\\])*"/, (_, prefix) => prefix + JSON.stringify(displayName));
    if (typeof node.name === 'string') {
      const nameField = new RegExp(`("name"\\s*:\\s*)${pattern(JSON.stringify(node.name))}`);
      text = text.replace(nameField, (_, prefix) => prefix + JSON.stringify(displayName));
    }
    return open + text + close;
  });
  html = packBrand(html);
  // The split wordmark is HTML, so it is not covered by the literal brand above.
  return html.replaceAll('Suede <span>Creator Skills</span>', 'Suede <span>AI Skills</span>');
}

export function syncFirstPartyPublic(root = ROOT, { check = false } = {}) {
  const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
  const catalog = JSON.parse(read('mcp/catalog.json'));
  const changes = new Map();
  const sources = new Map();
  const active = fs.readdirSync(path.join(root, 'skills')).filter(name => fs.existsSync(path.join(root, 'skills', name, 'SKILL.md'))).sort();
  const identities = catalog.skills.map(s => s.name).sort();
  if (JSON.stringify(active) !== JSON.stringify(identities)) throw new Error('First-party catalog/source identity mismatch');
  for (const skill of catalog.skills) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name)) throw new Error('Invalid first-party machine name');
    const source = read(`skills/${skill.name}/SKILL.md`);
    const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!block) throw new Error(`Missing frontmatter: ${skill.name}`);
    const fm = load(block[1]);
    const displayName = fm.metadata?.['display-name'];
    if (fm.name !== skill.name) throw new Error(`Source/catalog identity mismatch: ${skill.name}`);
    if (typeof displayName !== 'string' || !/^Suede AI(?: .+)? Skills$/.test(displayName)) throw new Error(`Invalid first-party display name: ${skill.name}`);
    if (typeof fm.description !== 'string' || !fm.description.trim()) throw new Error(`Missing description: ${skill.name}`);
    const heading = source.slice(block[0].length).match(/^# (.+)$/m)?.[1];
    if (heading !== displayName) throw new Error(`Source H1/display name mismatch: ${skill.name}`);
    sources.set(skill.name, { displayName, description: fm.description });
  }
  // Validate every source before queuing any writes.
  catalog.name = 'Suede AI Skills';
  for (const plugin of catalog.plugins) {
    if (plugin.name === 'suede-workflow-skills') plugin.displayName = 'Suede AI Workflow Skills';
    if (plugin.name === 'suede-creator-skills') plugin.displayName = 'Suede AI Skills';
    if (plugin.name === 'suede-marketing') plugin.displayName = 'Suede AI Marketing Skills';
  }
  for (const skill of catalog.skills) Object.assign(skill, sources.get(skill.name));
  changes.set('mcp/catalog.json', packBrand(JSON.stringify(catalog, null, 2) + '\n'));
  for (const [name, { displayName }] of sources) changes.set(`docs/skills/${name}.html`, skillPage(read(`docs/skills/${name}.html`), displayName));
  let index = packBrand(read('docs/skills/index.html')).replaceAll('Suede <span>Creator Skills</span>', 'Suede <span>AI Skills</span>');
  for (const [name, { displayName }] of sources) {
    const re = new RegExp(`(<a\\b[^>]*href="(?:\\./)?${pattern(name)}\\.html"[^>]*>)([\\s\\S]*?)(<\\/a>)`, 'g');
    index = index.replace(re, (_, open, contents, close) => {
      const title = esc(displayName);
      if (/<b>/.test(contents)) contents = contents.replace(/<b>[\s\S]*?<\/b>/, `<b>${title}</b>`);
      else if (!/<[a-z]/i.test(contents)) contents = title;
      return open + contents + close;
    });
  }
  changes.set('docs/skills/index.html', index);
  const stale = [...changes].filter(([relative, content]) => read(relative) !== content);
  if (!check) for (const [relative, content] of stale) fs.writeFileSync(path.join(root, relative), content);
  return stale.map(([relative]) => relative);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const check = process.argv.includes('--check');
    const stale = syncFirstPartyPublic(ROOT, { check });
    if (check && stale.length) {
      console.error('First-party public identities are stale:\n' + stale.map(p => '  ' + p).join('\n'));
      process.exitCode = 1;
    } else console.log(`${check ? 'Checked' : 'Synchronized'} first-party public identities (${stale.length} files ${check ? 'stale' : 'updated'}).`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
