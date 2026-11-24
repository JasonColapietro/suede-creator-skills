import test from 'node:test';
import assert from 'node:assert/strict';
import { createMakerStore } from '../scripts/directory/maker-store-v2.mjs';
import { buildMakerHandler } from '../api/maker.mjs';

const fakeKey = 'sb_secret_fixtureOnlyWhichIsNotARealKey';
const endpoint = 'https://projectref.supabase.co';
const config = { endpoint, key: fakeKey };
test('store refuses non-Supabase hosts and missing or publishable keys', () => {
  for (const options of [{ endpoint: 'https://supabase.co.other.com' }, { endpoint: endpoint + '/extra' }, { key: 'sb_publishable_key' }]) {
    assert.equal(createMakerStore({ ...config, ...options }), null);
  }
});
test('store makes exact scoped RPC calls without passing secret as a Bearer JWT', async () => {
  const seen = [];
  const store = createMakerStore({ ...config, fetch: async (url, init) => {
    seen.push([url, init]);
    return Response.json(url.endsWith('owner_read') ? null : true);
  } });
  assert.equal(store.durable, true);
  await store.saveFlow('digest', { expiresAt: 456 });
  assert.equal(await store.transact('listing', value => ({ write: { info: value }, result: 'saved' })), 'saved');
  assert.equal(seen[0][0], endpoint + '/rest/v1/rpc/maker_v2_flow_save');
  assert.equal(seen[0][1].headers.apikey, fakeKey);
  assert.equal(seen[0][1].headers.Authorization, undefined);
  assert.equal(seen[0][1].redirect, 'error');
  assert.deepEqual(JSON.parse(seen[2][1].body), { p_listing: 'listing', p_expected: 0, p_value: { info: null } });
});
test('store retries a lost CAS with fresh state and only returns a committed result', async () => {
  let reads = 0, writes = 0;
  const store = createMakerStore({ ...config, fetch: async url => {
    if (url.endsWith('owner_read')) return Response.json({ version: ++reads, value: { n: reads } });
    return Response.json(++writes > 1);
  } });
  assert.equal(await store.transact('listing', ({ n }) => ({ write: { n: n + 1 }, result: n + 1 })), 3);
  assert.equal(writes, 2);
});
test('mounted handler is disabled on default, missing settings, and sibling deployment', async () => {
  const req = new Request('https://suedeai.directory/api/maker/?action=sign-in&id=appie');
  for (const env of [{}, { SUEDE_SITE: 'skills', MAKER_V2_ENABLED: 'true' }, { SUEDE_SITE: 'directory', MAKER_V2_ENABLED: 'true' }]) {
    assert.equal((await buildMakerHandler(env)(req)).status, 503);
  }
});
