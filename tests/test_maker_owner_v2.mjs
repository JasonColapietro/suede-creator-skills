import test from 'node:test';
import assert from 'node:assert/strict';
import { createMakerOwnerService } from '../scripts/directory/maker-owner-v2.mjs';

const projects = [
  { id: 'project-a', name: 'Alpha', repo: 'Owner/Repo', site: 'https://old.example' },
  { id: 'project-b', name: 'Beta', repo: 'Owner/Repo' },
  { id: 'pending', repo: 'Owner/Repo', status: 'pending' },
];
const valid = { id: 20, full_name: 'Owner/Repo', owner: { id: 10, type: 'User' }, private: false };
const draft = { website: 'https://new.example.com/', socials: ['https://github.com/Owner'], statement: 'The maker statement.' };
function fixture(overrides = {}) {
  let repo = valid;
  let state = new Map();
  const opts = {
    site: 'directory', enabled: true, projects,
    github: { user: async session => ({ owner: 10, outsider: 11, mod: 12 })[session] || null, repository: async () => repo },
    isModerator: async user => user === 12,
    store: { transact: async (key, fn) => {
      const outcome = fn(structuredClone(state.get(key) || null));
      if (outcome.write) state.set(key, structuredClone(outcome.write));
      return structuredClone(outcome.result);
    } },
    ...overrides,
  };
  return { s: createMakerOwnerService(opts), repo: value => { repo = value; }, state };
}
const expectError = (promise, code) => assert.rejects(promise, { code });

test('misconfigured, explicitly disabled, or sibling site is fail-closed', () => {
  for (const opts of [{ site: 'skills' }, { enabled: false }, { github: null }, { isModerator: null }, { store: null }]) {
    assert.equal(fixture(opts).s, null);
  }
});
test('session and precise live listing required; read-only editorial content never prefills fields', async () => {
  const { s } = fixture();
  await expectError(s.get('bad', 'project-a'), 'sign_in_required');
  await expectError(s.get('owner', 'pending'), 'listing_not_found');
  assert.deepEqual((await s.get('owner', 'project-a')).form, { website: '', socials: [], statement: '' });
  assert.equal((await s.get('owner', 'project-a')).listing.website, 'https://old.example');
});
test('claims require genuine GitHub account owner and are scoped to one listing even for a shared repo', async () => {
  const { s, repo } = fixture();
  await expectError(s.claim('outsider', 'project-a'), 'ownership_not_verified');
  repo({ ...valid, owner: { id: 10, type: 'Organization' } });
  await expectError(s.claim('owner', 'project-a'), 'ownership_not_verified');
  repo({ ...valid, full_name: 'Different/Repo' });
  await expectError(s.claim('owner', 'project-a'), 'ownership_not_verified');
  repo(valid);
  await s.claim('owner', 'project-a');
  assert.equal((await s.get('owner', 'project-a')).claimed, true);
  assert.equal((await s.get('owner', 'project-b')).claimed, false);
  await expectError(s.submit('owner', 'project-b', draft), 'ownership_not_verified');
});
test('submission allowlists fields, moderator approves exact current revision, outsiders cannot read or submit', async () => {
  const { s } = fixture();
  await s.claim('owner', 'project-a');
  for (const input of [{ ...draft, rating: 100 }, { ...draft, website: 'javascript:alert(1)' }, { ...draft, socials: ['https://127.0.0.1'] }, { ...draft, statement: '<b>pretend</b>' }]) {
    await expectError(s.submit('owner', 'project-a', input, (await s.get('owner','project-a')).editVersion), 'invalid_profile');
  }
  const v1 = await s.submit('owner', 'project-a', draft, (await s.get('owner','project-a')).editVersion);
  const v2 = await s.submit('owner', 'project-a', { ...draft, statement: 'New.' }, (await s.get('owner','project-a')).editVersion);
  assert.equal((await s.get('outsider', 'project-a')).revision, null);
  await expectError(s.submit('outsider', 'project-a', draft), 'ownership_not_verified');
  await expectError(s.review('owner', 'project-a', v2.version, 'approve'), 'moderator_required');
  await expectError(s.review('mod', 'project-a', v1.version, 'approve'), 'stale_revision');
  const approved = await s.review('mod', 'project-a', v2.version, 'approve');
  assert.equal(approved.status, 'approved');
  assert.equal(approved.profile.statement, 'New.');
  await expectError(s.review('mod', 'project-a', v2.version, 'approve'), 'stale_revision');
});
test('repository replacement invalidates a previously verified claim', async () => {
  const { s, repo } = fixture();
  await s.claim('owner', 'project-a');
  repo({ ...valid, id: 21 });
  await expectError(s.submit('owner', 'project-a', draft, (await s.get('owner','project-a')).editVersion), 'ownership_not_verified');
});
test('organization claim requires listing-bound server proof, not a blanket repository grant', async () => {
  const { s, repo } = fixture({ hasReviewedClaim: async evidence => evidence.listingId === 'project-a'
    && evidence.userId === 10 && evidence.repositoryId === 20 && evidence.ownerId === 50 });
  repo({ ...valid, owner: { id: 50, type: 'Organization' } });
  await s.claim('owner', 'project-a');
  await expectError(s.claim('owner', 'project-b'), 'ownership_not_verified');
  assert.equal((await s.submit('owner', 'project-a', draft, (await s.get('owner','project-a')).editVersion)).status, 'pending');
});
test('pending replacement or rejection does not alter last approved projection', async () => {
  const { s } = fixture();
  await s.claim('owner', 'project-a');
  const v1 = await s.submit('owner', 'project-a', draft, (await s.get('owner','project-a')).editVersion);
  await s.review('mod', 'project-a', v1.version, 'approve');
  const v2 = await s.submit('owner', 'project-a', { ...draft, statement: 'New pending.' }, (await s.get('owner','project-a')).editVersion);
  assert.deepEqual(await s.getApproved('project-a'), draft);
  await s.review('mod', 'project-a', v2.version, 'reject');
  assert.deepEqual(await s.getApproved('project-a'), draft);
});
test('revoked organization proof cannot yield a review approval', async () => {
  let verified = true;
  const { s, repo } = fixture({ hasReviewedClaim: async () => verified });
  repo({ ...valid, owner: { id: 50, type: 'Organization' } });
  await s.claim('owner', 'project-a');
  const revision = await s.submit('owner', 'project-a', draft, (await s.get('owner','project-a')).editVersion);
  await expectError(s.getForReview('outsider', 'project-a'), 'moderator_required');
  assert.equal((await s.getForReview('mod', 'project-a')).revision.version, revision.version);
  verified = false;
  await expectError(s.review('mod', 'project-a', revision.version, 'approve'), 'stale_revision');
  assert.equal(await s.getApproved('project-a'), null);
});
test('an editorially approved canonical repository alias preserves the stable listing ID', async () => {
  const { s, repo } = fixture({ projects: [{ ...projects[0], canonical_repo: 'Current/Repo' }] });
  assert.equal((await s.get('owner', 'project-a')).listing.repo, 'Current/Repo');
  await expectError(s.claim('owner', 'project-a'), 'ownership_not_verified');
  repo({ ...valid, full_name: 'Current/Repo' });
  await s.claim('owner', 'project-a');
  assert.equal((await s.get('owner', 'project-a')).listing.id, 'project-a');
});
test('transferred ownership redacts old private revision and removes approved projection', async () => {
  const { s, repo } = fixture();
  await s.claim('owner', 'project-a');
  const revision = await s.submit('owner', 'project-a', draft, (await s.get('owner','project-a')).editVersion);
  await s.review('mod', 'project-a', revision.version, 'approve');
  repo({ ...valid, owner: { id: 11, type: 'User' } });
  const stale = await s.get('owner', 'project-a');
  assert.equal(stale.claimed, false);
  assert.equal(stale.revision, null);
  assert.equal(await s.getApproved('project-a'), null);
  await expectError(s.claim('outsider', 'project-a'), 'listing_already_claimed');
});
test('revoked organization permission redacts existing revisions and removes previous public approval', async () => {
  let verified = true;
  const { s, repo } = fixture({ hasReviewedClaim: async () => verified });
  repo({ ...valid, owner: { id: 50, type: 'Organization' } });
  await s.claim('owner', 'project-a');
  const revision = await s.submit('owner', 'project-a', draft, (await s.get('owner','project-a')).editVersion);
  await s.review('mod', 'project-a', revision.version, 'approve');
  verified = false;
  const stale = await s.get('owner', 'project-a');
  assert.equal(stale.claimed, false);
  assert.equal(stale.revision, null);
  assert.equal(await s.getApproved('project-a'), null);
});
test('moderator cannot approve their own maker submission', async () => {
  const { s } = fixture({ isModerator: async user => user === 10 || user === 12 });
  await s.claim('owner', 'project-a');
  const revision = await s.submit('owner', 'project-a', draft, (await s.get('owner','project-a')).editVersion);
  await expectError(s.review('owner', 'project-a', revision.version, 'approve'), 'self_review_forbidden');
  assert.equal((await s.review('mod', 'project-a', revision.version, 'approve')).status, 'approved');
});
