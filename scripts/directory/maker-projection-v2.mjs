import { featuredWebsite, loadMakerProfiles, makerProfileHtml, PLATFORMS } from './maker-profiles.mjs';

function eligible(items) {
  return new Map(items.filter(p => p.status !== 'pending' && (p.canonical_repo || p.repo)).map(p => [(p.kind === 'skill' ? 'skill:' : 'featured:') + p.id, p.canonical_repo || p.repo]));
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

export async function buildFeaturedMakerProjection(projects, getApproved, approvedIds = null) {
  const profiles = [];
  for (const [listing, repository] of eligible(projects)) {
    const id = listing.slice(listing.indexOf(':') + 1);
    if (approvedIds && !approvedIds.has(id)) continue;
    const approved = await getApproved(id);
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

// A compact skill shares its repository page with sibling skills.
// Place its controls and profile inside its own named table row.
export function skillMakerRenderer(targets, profiles, showLinks) {
  const pages = new Map();
  const expected = new Set();
  for (const target of targets) {
    const profile = profiles.get('skill:' + target.id);
    if (!showLinks && !profile) continue;
    const [page, fragment] = target.href.slice('/directory/'.length).split('#');
    const key = page + 'index.html';
    if (!pages.has(key)) pages.set(key, new Map());
    pages.get(key).set(fragment || '', target);
    expected.add(target.id);
  }

  function claimButton(target) {
    return '<a class="button" href="/maker/?id=' + target.id + '" data-maker-claim>Claim or manage this skill</a>';
  }

  function content(target, compact) {
    expected.delete(target.id);
    return makerProfileHtml(profiles.get('skill:' + target.id), { esc: escape, headingLevel: compact ? 3 : 2 });
  }

  return {
    render(key, html) {
      const page = pages.get(key);
      if (!page) return html;
      const full = page.get('');
      if (full) {
        const pageHtml = showLinks
          ? html.replace('<div class="skill-actions listing-actions">', actions => actions + claimButton(full) + ' ')
            .replace(/<p class="svc-publisher"[^>]*>[\s\S]*?<\/p>/, '')
          : html;
        return pageHtml.replace(/<aside\b[^>]*data-services-cta="skill"[^>]*>|<\/main>/, anchor => content(full, false) + anchor);
      }
      return html.replace(/(<tr id="([^"]+)" data-id="([^"]+)"[^>]*>[\s\S]*?<td class="name">[\s\S]*?)(<\/td>)/g, (whole, cell, fragment, id, end) => {
        const target = page.get(fragment);
        if (target?.listingPath !== id) return whole;
        const action = showLinks ? '<p>' + claimButton(target) + '</p>' : '';
        return cell + action + content(target, true) + end;
      });
    },
    verify() {
      if (expected.size) throw new Error('Missing maker listing on generated page: ' + [...expected][0]);
    },
  };
}
