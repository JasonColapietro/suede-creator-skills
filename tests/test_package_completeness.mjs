import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const skill = 'suede-influencer-outreach';
const run = (cmd, args, cwd = root) => {
  const result = spawnSync(cmd, args, {cwd, encoding: 'utf8', maxBuffer: 10_000_000});
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout;
};

test('influencer contents advance beyond 0.19.3 with coherent release state and historical receipt', () => {
  const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
  const parts = version.split('.').map(Number);
  assert.ok(parts[0] > 0 || parts[1] > 19 || (parts[1] === 19 && parts[2] > 3), `New contents must not reuse 0.19.3: ${version}`);
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'mcp/catalog.json'), 'utf8'));
  assert.equal(catalog.version, version);
  const html = fs.readFileSync(path.join(root, 'docs/index.html'), 'utf8');
  const escapedVersion = version.replaceAll('.', '\\.');
  const status = html.match(new RegExp(`Version ${escapedVersion} (prepared|released)`))?.[1];
  assert.ok(status, `Missing current release state for ${version}`);
  assert.match(html, /Version 0\.19\.3 landed on main/);
  assert.match(html, /PyPI 0\.19\.3 is published/);
  assert.match(html, /registry latest remains 0\.19\.0/);
  const citation = fs.readFileSync(path.join(root, 'CITATION.cff'), 'utf8');
  const released = citation.match(/^date-released: (\d{4}-\d{2}-\d{2})$/m)?.[1];
  if (status === 'prepared') assert.equal(released, undefined);
  else assert.equal(released, catalog.updated);
});

test('actual npm tarball contains every influencer file and traveling licenses, with byte-identical contents', () => {
  run(process.execPath, ['scripts/build-mcp-package.mjs', '--check']);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'influencer-package-'));
  try {
    const archive = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--cache', path.join(temp, 'cache'), '--pack-destination', temp], path.join(root, 'dist-npm')))[0];
    const files = archive.files.map(f => f.path);
    run('tar', ['-xzf', path.join(temp, archive.filename), '-C', temp]);
    const source = path.join(root, 'skills', skill);
    const expected = fs.readdirSync(source, {recursive: true}).filter(rel => fs.statSync(path.join(source, rel)).isFile() && path.basename(rel) !== 'CARD.md');
    assert.ok(expected.includes('SKILL.md') && expected.includes('evals/evals.json'));
    for (const rel of expected) {
      const packaged = `skills/${skill}/${rel}`;
      assert.ok(files.includes(packaged), `npm archive missing ${packaged}`);
      assert.deepEqual(fs.readFileSync(path.join(temp, 'package', packaged)), fs.readFileSync(path.join(source, rel)), packaged);
    }
    const packedCatalog = JSON.parse(fs.readFileSync(path.join(temp, 'package/mcp/catalog.json'), 'utf8'));
    assert.ok(packedCatalog.skills.some(s => s.name === skill));
    for (const rel of ['LICENSE', 'NOTICE.md', ...fs.readdirSync(path.join(root, 'licenses')).map(n => `licenses/${n}`)]) {
      assert.deepEqual(fs.readFileSync(path.join(temp, 'package', rel)), fs.readFileSync(path.join(root, rel)), rel);
    }
  } finally { fs.rmSync(temp, {recursive: true, force: true}); }
});
