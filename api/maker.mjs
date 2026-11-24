import catalog from '../directory/featured-projects.json' with { type: 'json' };
import { createMakerRuntime } from '../scripts/directory/maker-runtime-v2.mjs';
import { createMakerOwnerService } from '../scripts/directory/maker-owner-v2.mjs';
import { makerSettings } from '../scripts/directory/maker-settings-v2.mjs';
import { createMakerStore } from '../scripts/directory/maker-store-v2.mjs';

export function buildMakerHandler(env, fetcher = fetch) {
  const settings = makerSettings(env);
  const enabled = Boolean(settings);
  const store = settings ? createMakerStore({ endpoint: env.MAKER_V2_DB_URL, key: env.MAKER_V2_DB_SECRET_KEY, fetch: fetcher }) : null;
  return createMakerRuntime({
    enabled, site: env.SUEDE_SITE, origin: settings?.origin,
    clientId: env.MAKER_V2_GITHUB_CLIENT_ID, clientSecret: env.MAKER_V2_GITHUB_CLIENT_SECRET,
    store, fetch: fetcher, makeService: github => createMakerOwnerService({
      enabled, site: env.SUEDE_SITE, projects: catalog.projects, github, store,
      isModerator: id => settings.moderators.has(id), hasReviewedClaim: record => store.hasReviewedClaim(record),
    }),
  });
}

const handler = buildMakerHandler(process.env);
export default { fetch: handler };
