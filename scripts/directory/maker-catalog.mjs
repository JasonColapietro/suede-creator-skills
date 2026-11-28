import { createHash } from 'node:crypto';
import featured from '../../directory/featured-projects.json' with { type: 'json' };
import index from '../../docs/directory/search-index.json' with { type: 'json' };

// The published search index knows whether a skill has its own page or a row
// on a repository page. Both must resolve to the same server-owned claim target.
export const skillTargets = index.map(entry => ({
  id: 'skill-' + createHash('sha256').update(entry.id).digest('hex'),
  kind: 'skill',
  name: entry.name,
  repo: entry.repo,
  href: entry.href,
  listingPath: entry.id,
}));
export const makerCatalog = [...featured.projects, ...skillTargets];
