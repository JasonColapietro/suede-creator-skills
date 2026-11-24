import { featuredWebsite, loadMakerProfiles, makerProfileHtml, PLATFORMS } from './maker-profiles.mjs';

function eligible(items) {
  return new Map(items.filter(p => p.status !== 'pending' && (p.canonical_repo || p.repo)).map(p => ['featured:' + p.id, p.canonical_repo || p.repo]));
}

export function publicationRow(listing, repository, profile) {
  if (!profile || Object.keys(profile).some(key => !['website', 'socials', 'statement','demo','posts'].includes(key))) throw new Error('Invalid maker publication profile');
  const row = { listing, repository };
  if (profile.website) row.website = profile.website;
  if (profile.demo) row.demo = profile.demo;
  if (profile.posts !== undefined) row.posts = profile.posts;
  if (profile.statement) row.statement = profile.statement;
  if (profile.socials?.length) {
    row.socials = {};
    for (const raw of profile.socials) {
      const host = new URL(raw).hostname;
      const key = Object.keys(PLATFORMS).find(k => PLATFORMS[k][1].includes(host));
      if (!key || Object.hasOwn(row.socials, key)) throw new Error('Unsupported or repeated maker social');
      row.socials[key] = raw;
    }
  }
  loadMakerProfiles({ schema_version: 1, profiles: [row] }, new Map([[listing, repository]]));
  return row;
}

export async function buildFeaturedMakerProjection(projects, getApproved) {
  const profiles = [];
  for (const [listing, repository] of eligible(projects)) {
    const approved = await getApproved(listing.slice('featured:'.length));
    if (approved !== null) profiles.push(publicationRow(listing, repository, approved));
  }
  return { schema_version: 1, profiles };
}

const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export function renderFeaturedMakerProfiles(html, projection, projects) {
  const profiles = loadMakerProfiles(projection, eligible(projects));
  if (!profiles.size) return html;
  const byId = new Map(projects.map(p => [p.id, p]));
  const rendered = new Set();
  const renderedHtml = html.replace(/(<article class="featured-project" id="([a-z0-9-]+)"[^>]*>[\s\S]*?)(<\/article>)/g, (whole, card, id, close) => {
    if (!profiles.has('featured:' + id)) return whole;
    const extra = makerProfileHtml(profiles.get('featured:' + id), { esc: escape, headingLevel: 3, existingWebsite: featuredWebsite(byId.get(id)) });
    if (!card.includes('<footer class="featured-project-footer">') && !card.includes('<footer>')) throw new Error('Featured maker profile card has no footer');
    rendered.add(id);
    return card.replace(/<footer(?:\b[^>]*)?>/, footer => extra + footer) + close;
  });
  if (rendered.size !== profiles.size) throw new Error('Missing approved featured maker target');
  return renderedHtml;
}
