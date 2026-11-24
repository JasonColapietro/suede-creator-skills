#!/usr/bin/env node
// Read-only remote operation. Redirect stdout to a local file for editorial
// diff/review; never add an automatic deployment or email from this exporter.
import { readFile } from 'node:fs/promises';
import catalog from '../directory/featured-projects.json' with { type: 'json' };
import { createMakerOwnerService } from './directory/maker-owner-v2.mjs';
import { fetchPublicMakerRepository, fetchMakerRepositoryById } from './directory/maker-runtime-v2.mjs';
import { createMakerStore } from './directory/maker-store-v2.mjs';
import { buildFeaturedMakerProjection } from './directory/maker-projection-v2.mjs';

async function main(env) {
  if (env.SUEDE_SITE !== 'directory' || env.MAKER_V2_EXPORT_APPROVED !== 'true') throw Error('Maker export disabled');
  const store = createMakerStore({ endpoint: env.MAKER_V2_DB_URL, key: env.MAKER_V2_DB_SECRET_KEY });
  if (!store) throw Error('Maker export store not configured');
  const approvals = createMakerOwnerService({
    store, site: 'directory', enabled: true, projects: catalog.projects,
    github: { user: () => null, repository: (name,opts) => fetchPublicMakerRepository(name,fetch,opts), repositoryById: id=>fetchMakerRepositoryById(id) },
    isModerator: () => false, hasReviewedClaim: record => store.hasReviewedClaim(record),
  });
  const collect=()=>buildFeaturedMakerProjection(catalog.projects,id=>approvals.getApproved(id));
  const first=JSON.stringify(await collect(),null,2)+'\n';
  const verified=JSON.stringify(await collect(),null,2)+'\n';
  if(first!==verified)throw Error('Maker projection changed during export');
  return verified;
}
try {
  const args=process.argv.slice(2);
  if(args.length && (args.length!==2 || args[0]!=='--verify-file')) throw Error('Invalid arguments');
  const projection=await main(process.env);
  if(args.length) {
    if(await readFile(args[1],'utf8')!==projection)throw Error('Approved projection has changed');
    process.stderr.write('Exact reviewed Maker projection still matches.\n');
  } else process.stdout.write(projection);
} catch {
  // Do not emit upstream URLs, payloads, or credentials into logs.
  console.error('Maker export stopped. Check explicit config, the approved revision and canonical ownership. No output written.');
  process.exitCode = 1;
}
