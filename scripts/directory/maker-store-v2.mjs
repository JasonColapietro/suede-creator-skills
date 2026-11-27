/** Backend-only Supabase RPC client for a dedicated Maker project. */
export function createMakerStore({ endpoint, key, fetch: fetcher = fetch } = {}) {
  if (typeof endpoint !== 'string' || !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(endpoint)
    || typeof key !== 'string' || !/^sb_secret_[A-Za-z0-9_-]+$/.test(key)) return null;

  const invoke = async (procedure, payload) => {
    const out = await fetcher(endpoint + '/rest/v1/rpc/maker_v2_' + procedure, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(6500),
      headers: { apikey: key, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    // Neither server responses nor credentials belong in the caller's errors.
    if (!out.ok) throw new Error('Maker store unavailable');
    return out.status === 204 ? null : out.json();
  };

  return Object.freeze({
    durable: true,
    async approvedListings() {
      const ids = await invoke('approved_listings', {});
      if (!Array.isArray(ids) || !ids.every(id => typeof id === 'string')) throw new Error('Invalid approved listings');
      return ids;
    },
    saveFlow: (key, value) => invoke('flow_save', { p_key: key, p_value: value }),
    consumeFlow: key => invoke('flow_consume', { p_key: key }),
    saveSession: (key, value) => invoke('session_save', { p_key: key, p_value: value }),
    readSession: key => invoke('session_read', { p_key: key }),
    deleteSession: key => invoke('session_delete', { p_key: key }),
    canExport: (listing,expected) => invoke('can_export',{p_listing:listing,p_expected:expected}),
    recover: (listing, expected, successor, audit) => invoke('owner_recover',{p_listing:listing,p_expected:expected,p_successor:successor,p_audit:audit}),
    pendingListings: moderator => invoke('pending_listings',{p_moderator:moderator}),
    async hasReviewedClaim({ listingId, userId, repositoryId, ownerId }) {
      return (await invoke('has_reviewed_claim', { p_listing: listingId, p_user: userId, p_repo: repositoryId, p_owner: ownerId })) === true;
    },
    async transact(listingId, reduce) {
      for (let attempt = 0; attempt < 4; attempt++) {
        const current = await invoke('owner_read', { p_listing: listingId });
        if (current !== null && (!Number.isSafeInteger(current?.version) || current.version < 1
          || typeof current.value !== 'object' || current.value === null || Array.isArray(current.value))) {
          throw new Error('Invalid Maker store record');
        }
        const outcome = reduce(current?.value ?? null,current?.version ?? 0);
        if (!Object.hasOwn(outcome, 'write')) return outcome.result;
        const result = await invoke('owner_cas', { p_listing: listingId, p_expected: current?.version ?? 0, p_value: outcome.write });
        if (result === true) return outcome.result;
        if (result !== false) throw new Error('Invalid Maker store write result');
      }
      throw new Error('Maker store changed concurrently');
    },
  });
}
