import test from 'node:test';
import assert from 'node:assert/strict';
import { request, parseListing, payload, route } from '../docs/directory/maker/client.mjs';

test('same-origin route and strict listing id validation', () => {
  assert.equal(route('sign-in','project-a'), '/api/maker/?action=sign-in&id=project-a');
  assert.throws(() => route('listing','a&action=logout'));
  assert.throws(() => route('bad','project-a'));
});
test('listing response is scoped and blank editor does not leak editorial data', () => {
  const raw = { listing:{id:'project-a',name:'A',repo:'own/repo',website:'https://editorial.example'},claimed:true,form:{website:'ignored'},revision:null };
  assert.equal(parseListing(raw,'project-a').listing.website,'https://editorial.example');
  assert.equal(Object.hasOwn(parseListing(raw,'project-a'),'form'),false);
  assert.throws(() => parseListing(raw,'project-b'));
});
test('only submitted maker fields are accepted, HTTPS only', () => {
  assert.deepEqual(payload(' https://new.example/path ',['','https://github.com/own'],' Say hello '),{website:'https://new.example/path',socials:['https://github.com/own'],statement:'Say hello'});
  assert.throws(() => payload('javascript:alert(1)', [], ''));
  assert.throws(() => payload('', [], '  '));
});
test('API offline and unauthenticated states differ; POST sends only specified JSON', async () => {
  await assert.rejects(request('listing','project-a', undefined, async () => new Response('',{status:404})),/maker_unavailable/);
  await assert.rejects(request('listing','project-a', undefined, async () => Response.json({error:'sign_in_required'},{status:401})),/sign_in_required/);
  await request('submit','project-a',{statement:'test'}, async (url, options) => {
    assert.equal(url,'/api/maker/?action=submit&id=project-a');
    assert.equal(options.method,'POST');
    assert.equal(options.credentials,'same-origin');
    assert.deepEqual(JSON.parse(options.body),{statement:'test'});
    return Response.json({status:'pending'});
  });
});
