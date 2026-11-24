import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createMakerRuntime } from '../scripts/directory/maker-runtime-v2.mjs';

const origin = 'https://suedeai.directory';
const req = (query, init) => new Request(origin + '/api/maker?' + query, init);
const url = 'https://github.com/login/oauth/access_token';
const fixture = (override = {}) => {
  const flows = new Map(), sessions = new Map(), calls = [];
  const config = {
    enabled: true, site: 'directory', origin, clientId: 'fake-client', clientSecret: 'fixture-only',
    store: { durable: true,
      async saveFlow(key, value) { flows.set(key, value); },
      async consumeFlow(key) { const value = flows.get(key); flows.delete(key); return value; },
      async saveSession(key, value) { sessions.set(key, value); },
      async readSession(key) { return sessions.get(key); },
      async deleteSession(key) { sessions.delete(key); } },
    makeService: ({ user }) => ({ async get(session, id) { return { user: await user(session), id }; } }),
    fetch: async (target, options) => {
      calls.push([target, options]);
      if (target === url) return Response.json({ access_token: 'test-provider-token', token_type: 'bearer', scope: '' });
      if (target === 'https://api.github.com/user') return Response.json({ id: 100, login: 'tester' });
      throw new Error('unexpected URL');
    }, ...override,
  };
  return { handle: createMakerRuntime(config), config, calls, sessions };
};
const cookie = (response, name) => response.headers.getSetCookie()
  .find(value => value.startsWith(name + '=')).split(';')[0];

test('disabled, missing durable store, and wrong host never contact GitHub', async () => {
  for (const override of [{ enabled: false }, { store: null }, { site: 'skills' }]) {
    const { handle, calls } = fixture(override);
    assert.equal((await handle(req('action=sign-in&id=project-a'))).status, 503);
    assert.deepEqual(calls, []);
  }
  const { handle } = fixture();
  assert.equal((await handle(new Request('https://skills.suedeai.ai/api/maker?action=sign-in&id=project-a'))).status, 404);
  assert.equal((await handle(req('action=listing&id=project-a'))).status, 401);
  assert.equal((await handle(req('action=claim&id=project-a', { method: 'POST', headers: { origin: 'https://other.example' } }))).status, 403);
});
test('state cookie, S256 verifier, fixed GitHub endpoints, opaque session and logout', async () => {
  const { handle, calls, sessions } = fixture();
  const start = await handle(req('action=sign-in&id=project-a'));
  assert.equal(start.status, 303);
  const auth = new URL(start.headers.get('Location'));
  assert.equal(auth.href.split('?')[0], 'https://github.com/login/oauth/authorize');
  assert.equal(auth.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(auth.searchParams.has('scope'), false);
  assert.match(start.headers.get('Set-Cookie'), /Secure; HttpOnly; SameSite=Lax/);
  const flow = cookie(start, '__Host-suede-maker-flow');
  const state = auth.searchParams.get('state');
  assert.equal((await handle(req('action=callback&code=test&state=wrong', { headers: { cookie: flow } }))).status, 400);
  const callback = () => handle(req('action=callback&code=test&state=' + state, { headers: { cookie: flow } }));
  const done = await callback();
  assert.equal(done.status, 303);
  assert.equal(done.headers.get('Location'), '/maker/?id=project-a');
  assert.equal(done.headers.get('Cache-Control'), 'no-store');
  assert.equal((await callback()).status, 400);
  const session = cookie(done, '__Host-suede-maker-session');
  assert.equal(session.includes('test-provider-token'), false);
  assert.equal([...sessions.keys()].includes(session.split('=')[1]), false);
  assert.equal(calls[0][0], url);
  assert.equal(calls[0][1].redirect, 'error');
  const params = calls[0][1].body;
  assert.equal(createHash('sha256').update(params.get('code_verifier')).digest('base64url'), auth.searchParams.get('code_challenge'));
  assert.equal(calls[1][0], 'https://api.github.com/user');
  assert.deepEqual(await (await handle(req('action=listing&id=project-a', { headers: { cookie: session } }))).json(), { user: 100, id: 'project-a' });
  assert.equal((await handle(req('action=logout', { method: 'POST', headers: { cookie: session, origin } }))).status, 204);
  assert.equal((await handle(req('action=listing&id=project-a', { headers: { cookie: session } }))).status, 401);
});
test('rejects an over-scoped provider token without requesting identity or issuing a session', async () => {
  let attempts = 0;
  const { handle } = fixture({ fetch: async () => { attempts++; return Response.json({ token_type: 'bearer', access_token: 'fake', scope: 'repo' }); } });
  const start = await handle(req('action=sign-in&id=project-a'));
  const state = new URL(start.headers.get('Location')).searchParams.get('state');
  const failed = await handle(req('action=callback&code=test&state=' + state, { headers: { cookie: cookie(start, '__Host-suede-maker-flow') } }));
  assert.equal(failed.status, 502);
  assert.equal(failed.headers.getSetCookie().some(value => value.startsWith('__Host-suede-maker-session=')), false);
  assert.equal(attempts, 1);
});

test('public repository lookup treats provider failures as unknown, not ownership revocation', async () => {
  const { fetchPublicMakerRepository } = await import('../scripts/directory/maker-runtime-v2.mjs');
  assert.equal(await fetchPublicMakerRepository('Owner/Repo', async () => new Response(null, { status: 404 })), null);
  await assert.rejects(fetchPublicMakerRepository('Owner/Repo', async () => new Response(null, { status: 429 })));
});
