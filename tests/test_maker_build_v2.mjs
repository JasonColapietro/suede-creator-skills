import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build, NEW } from '../scripts/build-directory-site.mjs';
import catalog from '../directory/featured-projects.json' with { type: 'json' };

const enabled = {
  SUEDE_SITE: 'directory', MAKER_V2_ENABLED: 'true', MAKER_V2_FEATURED_LINKS: 'true', MAKER_V2_ORIGIN: NEW,
  MAKER_V2_DB_URL: 'https://fixture.supabase.co', MAKER_V2_DB_SECRET_KEY: 'sb_secret_fixture_only',
  MAKER_V2_GITHUB_CLIENT_ID: 'fixture-oauth-client', MAKER_V2_GITHUB_CLIENT_SECRET: 'fixture-oauth-secret',
  MAKER_V2_MODERATOR_IDS: '123',
};
function output(env, callback) {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'maker-site-build-'));
  try { build(dir, { env }); callback(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
const read = (dir, filename) => fs.readFileSync(path.join(dir, filename), 'utf8');
test('maker routes build without injected third-party scripts, stay private, and links are off by default', () => {
  output({}, dir => {
    for (const file of ['maker/index.html', 'maker/demo/index.html', 'maker/guide/index.html']) {
      const html = read(dir, file);
      assert.match(html, /content="noindex/);
      assert.doesNotMatch(html, /agent-view\.js|<script\b[^>]+src="https?:/);
    }
    assert.doesNotMatch(read(dir, 'featured/index.html'), /data-maker-claim/);
    assert.doesNotMatch(read(dir, 'sitemap.xml'), /<loc>[^<]+\/maker\//);
  });
});
test('config plus explicit rollout adds exactly one link to every featured project, no pending entries or secret output', () => {
  output(enabled, dir => {
    const html = read(dir, 'featured/index.html');
    const linked = [...html.matchAll(/href="\/maker\/\?id=([a-z0-9-]+)" data-maker-claim/g)].map(match => match[1]).sort();
    assert.deepEqual(linked, catalog.projects.filter(entry => entry.status !== 'pending').map(entry => entry.id).sort());
    assert.doesNotMatch(html, /fixture_only|fixture-oauth-secret/);
  });
  output({ ...enabled, MAKER_V2_GITHUB_CLIENT_SECRET: '' }, dir => assert.doesNotMatch(read(dir, 'featured/index.html'), /data-maker-claim/));
});

test('reviewed overlay reaches static featured edition without changing the editorial card', () => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'maker-reviewed-build-'));
  try {
    const makerProjection = { schema_version: 1, profiles: [{
      listing: 'featured:appie', repository: 'appierun/appie-mcp', statement: 'A reviewed fixture statement.',
    }] };
    build(dir, { env: { MAKER_V2_PUBLISH_PROFILES: 'true' }, makerProjection });
    const html = read(dir, 'featured/index.html');
    assert.match(html, /A reviewed fixture statement\./);
    assert.match(html, /data-maker-profile/);
    assert.match(html, /Explore Appie on GitHub/);
    assert.doesNotMatch(html, /data-maker-claim/);
    build(dir,{env:enabled,makerProjection});
    const after=read(dir,'featured/index.html');
    assert.doesNotMatch(after,/data-maker-profile|A reviewed fixture statement/);
    assert.match(after,/data-maker-claim/);
    assert.match(after,/Explore Appie on GitHub/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
