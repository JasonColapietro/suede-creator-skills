import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFeaturedMakerProjection, renderFeaturedMakerProfiles } from '../scripts/directory/maker-projection-v2.mjs';
const projects = [
  { id: 'listed', repo: 'Owner/Old', canonical_repo: 'Owner/Current', site: 'https://official.example.org/' },
  { id: 'pending', repo: 'Owner/Pending', status: 'pending' },
  { id: 'also-listed', repo: 'Owner/Current' },
];
const profile = { website: 'https://new.example.org/', socials: ['https://github.com/Owner'], statement: 'Maker & partners' };
test('projection reads only an approved getter, strips internal data, and never asks about pending listings', async () => {
  const read = [];
  const next = await buildFeaturedMakerProjection(projects, async id => {
    read.push(id);
    return id === 'listed' ? profile : null;
  });
  assert.deepEqual(read, ['listed', 'also-listed']);
  assert.deepEqual(next, { schema_version: 1, profiles: [{
    listing: 'featured:listed', repository: 'Owner/Current', website: profile.website,
    socials: { github: profile.socials[0] }, statement: profile.statement,
  }] });
  await assert.rejects(() => buildFeaturedMakerProjection(projects, async () => ({ ...profile, privateReviewer: 100 })));
});
test('exact current approved projection renders separately without altering editorial site or pending card', async () => {
  const initial = '<article class="featured-project" id="listed"><p>Editorial description & rating</p><footer><a href="https://official.example.org/">Website</a></footer></article>'
    + '<article class="featured-project" id="pending"><footer>Pending editorial</footer></article>';
  const projection = await buildFeaturedMakerProjection(projects, async id => id === 'listed' ? profile : null);
  const html = renderFeaturedMakerProfiles(initial, projection, projects);
  assert.match(html, /Editorial description & rating/);
  assert.match(html, /data-maker-profile/);
  assert.match(html, /Maker &amp; partners/);
  assert.match(html, /rel="ugc noopener noreferrer"/);
  assert.match(html, /https:\/\/new.example.org\/[^>]*>Maker website/);
  assert.match(html, /id="pending"><footer>Pending editorial/);
  projection.profiles[0].repository = 'Owner/Old';
  assert.throws(() => renderFeaturedMakerProfiles(initial, projection, projects));
});

test('distinct approved website-only edit stays visible, exact duplicate does not make a second link', async () => {
  const initial = '<article class="featured-project" id="listed"><footer><a href="https://official.example.org/">Website</a></footer></article>';
  const websiteOnly = website => ({ website, socials: [], statement: '' });
  const updated = await buildFeaturedMakerProjection(projects, async id => id === 'listed' ? websiteOnly('https://new.example.org/') : null);
  const distinct = renderFeaturedMakerProfiles(initial, updated, projects);
  assert.match(distinct, /https:\/\/new.example.org\/[^>]*>Maker website/);
  assert.match(distinct, /https:\/\/official.example.org\/[^>]*>Website/);
  const same = await buildFeaturedMakerProjection(projects, async id => id === 'listed' ? websiteOnly('https://official.example.org/') : null);
  assert.equal(renderFeaturedMakerProfiles(initial, same, projects), initial);
});
