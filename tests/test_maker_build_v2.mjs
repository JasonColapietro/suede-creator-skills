import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build, NEW } from '../scripts/build-directory-site.mjs';
import catalog from '../directory/featured-projects.json' with { type: 'json' };

import searchIndex from '../docs/directory/search-index.json' with { type: 'json' };

const claimId = entry => 'skill-' + createHash('sha256').update(entry.id).digest('hex');
const enabled = {
  SUEDE_SITE: 'directory', MAKER_V2_ENABLED: 'true', MAKER_V2_FEATURED_LINKS: 'true', MAKER_V2_ORIGIN: NEW,
  MAKER_V2_DB_URL: 'https://fixture.supabase.co', MAKER_V2_DB_SECRET_KEY: 'sb_secret_' + randomBytes(24).toString('base64url'),
  MAKER_V2_GITHUB_CLIENT_ID: 'fixture-oauth-client', MAKER_V2_GITHUB_CLIENT_SECRET: randomBytes(24).toString('hex'),
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
test('configured rollout links every skill and eligible featured project without exposing secrets', () => {
  output(enabled, dir => {
    const html = read(dir, 'featured/index.html');
    const linked = [...html.matchAll(/href="\/maker\/\?id=([a-z0-9-]+)" data-maker-claim/g)].map(match => match[1]).sort();
    assert.deepEqual(linked, catalog.projects.filter(entry => entry.status !== 'pending').map(entry => entry.id).sort());
    const pages = new Map();
    for (const entry of searchIndex) {
      const [page] = entry.href.slice('/directory/'.length).split('#');
      if (!pages.has(page)) pages.set(page, read(dir, page + 'index.html'));
      assert.ok(pages.get(page).includes('href="/maker/?id=' + claimId(entry) + '"'), entry.id);
    }
    assert.equal(html.includes(enabled.MAKER_V2_DB_SECRET_KEY), false, 'database fixture key must not enter the built page');
    assert.equal(html.includes(enabled.MAKER_V2_GITHUB_CLIENT_SECRET), false, 'OAuth fixture secret must not enter the built page');
  });
  output({ ...enabled, MAKER_V2_GITHUB_CLIENT_SECRET: '' }, dir => assert.doesNotMatch(read(dir, 'featured/index.html'), /data-maker-claim/));
});

test('approved profiles render on featured cards, standalone skills and compact rows', () => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'maker-reviewed-build-'));
  try {
    const makerProjection = { schema_version: 1, profiles: [{
      listing: 'featured:appie', repository: 'appierun/appie-mcp', statement: 'A reviewed fixture statement.',
    }] };
    const compact = searchIndex.find(entry => !entry.full);
    const full = searchIndex.find(entry => entry.full);
    for (const entry of [compact, full]) {
      makerProjection.profiles.push({ listing: 'skill:' + claimId(entry), repository: entry.repo, statement: 'Reviewed ' + entry.id });
    }
    build(dir, { env: { MAKER_V2_PUBLISH_PROFILES: 'true' }, makerProjection });
    const html = read(dir, 'featured/index.html');
    for (const entry of [compact, full]) {
      const [page] = entry.href.slice('/directory/'.length).split('#');
      assert.ok(read(dir, page + 'index.html').includes('Reviewed ' + entry.id));
    }
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
