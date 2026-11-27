// Maker-submitted fields are displayed only after editorial review.
import { curatedPosts } from "../../docs/directory/maker/post-links.mjs";
import { isIP } from "node:net";

export const PLATFORMS = {
  github: ["GitHub", ["github.com", "www.github.com"], /^\/[\w-]+\/?$/i],
  linkedin: ["LinkedIn", ["linkedin.com", "www.linkedin.com"], /^\/(?:in|company|showcase)\/[\w-]+\/?$/i],
  x: ["X", ["x.com", "www.x.com", "twitter.com", "www.twitter.com"], /^\/[a-z\d_]{1,15}\/?$/i],
  youtube: ["YouTube", ["youtube.com", "www.youtube.com"], /^\/(?:@[\w.-]+|(?:c|channel|user)\/[\w.-]+)\/?$/i],
  instagram: ["Instagram", ["instagram.com", "www.instagram.com"], /^\/[a-z\d_.]+\/?$/i],
  bluesky: ["Bluesky", ["bsky.app"], /^\/profile\/(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z][a-z\d-]{1,62}\/?$/i],
};
const reservedSocial = /^(?:i|about|intent|explore|search|home|login|share|signup|settings|notifications|direct|topics|reel|stories|marketplace|accounts|compose|organizations|features|security|pricing|events|trending|sponsors|collections|codespaces|enterprise|customers|copilot|developer|developer-settings)$/i;
const LINK = /^https:\/\/[^\s\\\p{Cc}\p{Cf}]+$/u;
const invalidEncoded = /%(?:0[0-9a-f]|1[0-9a-f]|7f|5c)/i;
const obj = (x) => x && typeof x === "object" && !Array.isArray(x);
const nonText = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
const fail = () => { throw new Error("maker profiles: invalid public profile or listing scope"); };

function publicHttps(value) {
  if (typeof value !== "string" || value.length > 400 || !LINK.test(value) || !/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(value) || /[?#]/.test(value) || invalidEncoded.test(value)) fail();
  let url;
  try { url = new URL(value); } catch { fail(); }
  const host = url.hostname;
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash ||
      isIP(host) || !/^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z][a-z\d-]{1,62}$/.test(host) ||
      /\.(?:localhost|local|internal|test|invalid|onion|example|lan|home|corp|alt)$/.test(host)) fail();
  return url;
}

export function loadMakerProfiles(input, knownListings) {
  const out = new Map();
  if (!obj(input) || Object.keys(input).length !== 2 || input.schema_version !== 1 || !Array.isArray(input.profiles)) fail();
  for (const row of input.profiles) {
    if (!obj(row) || Object.keys(row).some((k) => !["listing", "repository", "statement", "website", "socials","demo","posts"].includes(k))) fail();
    const { listing, repository, statement, website, socials } = row;
    if (!knownListings.has(listing) || out.has(listing)) fail();
    if (/^(?:featured|skill):/.test(listing) ? repository !== knownListings.get(listing) : repository !== undefined) fail();
    if (statement !== undefined && (typeof statement !== "string" || !statement || statement !== statement.trim() ||
        [...statement].length > 320 || nonText.test(statement))) fail();
    const links = [];
    if (website !== undefined) links.push({ label: "Maker website", href: publicHttps(website).href, website: true });
    if (row.demo !== undefined) links.push({ label:"Product demo", href: typeof row.demo === "string" && /^https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}$/.test(row.demo) && !/[\r\n]/.test(row.demo) ? row.demo : publicHttps(row.demo).href });
    const posts = row.posts === undefined ? [] : curatedPosts(row.posts);
    if (socials !== undefined) {
      if (!obj(socials) || Object.keys(socials).length < 1 || Object.keys(socials).length > 4) fail();
      for (const key of Object.keys(PLATFORMS)) {
        if (!Object.hasOwn(socials, key)) continue;
        const [label, hosts, profilePath] = PLATFORMS[key], u = publicHttps(socials[key]);
        if (!hosts.includes(u.hostname) || u.search || !profilePath.test(u.pathname) ||
            reservedSocial.test(u.pathname.split("/").filter(Boolean).at(-1))) fail();
        links.push({ label, href: u.href });
      }
      if (Object.keys(socials).some((k) => !Object.hasOwn(PLATFORMS, k))) fail();
    }
    if (!statement && !links.length && !posts.length) fail();
    out.set(listing, { statement, links, posts });
  }
  return out;
}

export function featuredWebsite(project) {
  return project.site || project.links?.find((link) => /^website$/i.test(link.label.trim()))?.url || "";
}

export function makerProfileHtml(profile, { esc, existingWebsite = "", headingLevel = 2, className = "panel" }) {
  if (!profile) return "";
  let canonicalWebsite = existingWebsite;
  try { if (existingWebsite) canonicalWebsite = new URL(existingWebsite).href; } catch { /* Keep exact editorial value. */ }
  const links = profile.links.filter((item) => !item.website || item.href !== canonicalWebsite);
  if (!profile.statement && !links.length && !profile.posts?.length) return "";
  const heading = headingLevel === 3 ? "h3" : "h2";
  const feed = profile.posts?.length ? `<h${headingLevel === 3 ? 4 : 3}>Selected posts</h${headingLevel === 3 ? 4 : 3}><ol>${profile.posts.map(({href,label},i)=>`<li><a href="${esc(href)}" rel="ugc noopener noreferrer">${esc(label)} post ${i+1}</a></li>`).join("")}</ol>` : "";
  return `<section class="${className}" data-maker-profile><${heading}>From the maker</${heading}>${profile.statement ? `<p>${esc(profile.statement)}</p>` : ""}${links.length ? `<p class="muted">Maker links: ${links.map(({ label, href }) => `<a href="${esc(href)}" rel="ugc noopener noreferrer">${esc(label)}</a>`).join(" &middot; ")}</p>` : ""}${feed}</section>`;
}
