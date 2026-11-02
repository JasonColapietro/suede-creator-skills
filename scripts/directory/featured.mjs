// Editorial project selections are independent of skill scores and README-badge verification.
// Members are a separate schema: no scored-catalog, certification or badge fields.
// Publication is recorded in featured-projects.json, never inferred from review,
// upstream commit, snapshot or file-modification dates. Unknown dates go last.
export function newestPublishedFirst(entries) {
  const timestamp = ({ published_at }) => {
    if (typeof published_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(published_at)) return -Infinity;
    const time = Date.parse(published_at);
    return Number.isFinite(time) && new Date(time).toISOString() === published_at.replace('Z', '.000Z') ? time : -Infinity;
  };
  return [...entries].sort((a, b) => timestamp(b) - timestamp(a) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

const MEMBER_LINKS = new Map([
  ['arcmira/mcp', new Map([
    ['Website', 'https://arcmira.com'],
    ['MCP setup', 'https://arcmira.com/docs/mcp-server'],
    ['API docs', 'https://arcmira.com/docs'],
  ])],
  ['dustinliang666-blip/lava-mcp', new Map([
    ['Website', 'https://lava.ai-dolphin.com/subscribe'],
    ['API docs', 'https://lava.ai-dolphin.com/subscribe/docs'],
  ])],
]);

// A project entry is either reviewed (no status: pinned review, badge snippet)
// or "pending": featured while its scan and review are pending. Pending
// entries carry no review, score, grade or verdict, render this label where
// the review link and badge snippet would be, and never get a badge snippet.
export const PENDING_STATUS = 'pending';
export const PENDING_LABEL = 'Scan & review pending';
export const isPending = (project) => project?.status === PENDING_STATUS;
const PENDING_FORBIDDEN = ['review', 'skills', 'score', 'grade', 'verdict', 'certified', 'verified', 'badges', 'commands'];
const COPY_FIELDS = ['name', 'kind', 'headline', 'summary', 'setup'];

function httpsSite(value) {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password && !u.port && !u.search && !u.hash && u.href.replace(/\/$/, '') === value.replace(/\/$/, '');
  } catch {
    return false;
  }
}

export function featuredProjects(editorial) {
  const projects = editorial.projects === undefined ? [] : editorial.projects;
  if (!Array.isArray(projects)) throw new Error('Featured projects must be an array');
  const ids = new Set();
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const repoName = /^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/;
  for (const project of projects) {
    const fail = () => { throw new Error(`Invalid featured project: ${project?.id || 'unknown'}`); };
    if (!project || typeof project !== 'object' || Array.isArray(project) || !slug.test(project.id) || ids.has(project.id)) fail();
    if (COPY_FIELDS.some((k) => typeof project[k] !== 'string' || !project[k].trim())) fail();
    if (project.status !== undefined && project.status !== PENDING_STATUS) fail();
    if (project.license !== undefined && (typeof project.license !== 'string' || !project.license.trim())) fail();
    if (project.site !== undefined && !httpsSite(project.site)) fail();
    if (project.repo !== undefined && (typeof project.repo !== 'string' || !repoName.test(project.repo) || ['.', '..'].includes(project.repo.split('/')[1]))) fail();
    if ((project.repo !== undefined || project.commit !== undefined) && !/^[a-f0-9]{40}$/.test(project.commit)) fail();
    const items = project.skills || project.capabilities;
    if (!Array.isArray(items) || !items.length || items.some((item) => !item || typeof item.title !== 'string' || !item.title.trim() || typeof item.description !== 'string' || !item.description.trim())) fail();
    if (isPending(project)) {
      if (PENDING_FORBIDDEN.some((k) => k in project)) fail();
      if (project.repo === undefined && project.site === undefined) fail();
    } else {
      if (project.repo === undefined || typeof project.license !== 'string') fail();
      if (typeof project.review !== 'string' || !/^directory\/reviews\/[A-Za-z0-9_.-]+\.md$/.test(project.review)) fail();
    }
    ids.add(project.id);
  }
  return projects;
}

export function directoryMembers(editorial) {
  const members = editorial.members === undefined ? [] : editorial.members;
  if (!Array.isArray(members)) throw new Error('Directory members must be an array');
  const ids = new Set(['directory-members', 'featured-badge', 'nominate-title', 'selection-title', ...(editorial.projects || []).map((p) => p.id)]);
  const repos = new Set((editorial.projects || []).filter((p) => p.repo).map((p) => p.repo.toLowerCase()));
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const safePath = (s) => typeof s === 'string' && /^[A-Za-z0-9_./-]+$/.test(s) && s.split('/').every((p) => p && p !== '.' && p !== '..');
  const fields = new Set(['id', 'name', 'repo', 'commit', 'review', 'scope', 'license', 'license_file', 'headline', 'summary', 'setup', 'skills', 'links']);
  for (const member of members) {
    const fail = () => { throw new Error(`Invalid directory member: ${member?.id || 'unknown'}`); };
    if (!member || typeof member !== 'object' || Array.isArray(member) || Object.keys(member).some((key) => key !== 'published_at' && !fields.has(key))) fail();
    if ([...fields].filter((k) => k !== 'skills' && k !== 'links').some((k) => typeof member[k] !== 'string' || !member[k].trim())) fail();
    if (!slug.test(member.id) || ids.has(member.id) || !/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(member.repo) || ['.', '..'].includes(member.repo.split('/')[1]) || repos.has(member.repo.toLowerCase()) || !/^[a-f0-9]{40}$/.test(member.commit)) fail();
    if (!safePath(member.scope) || !safePath(member.license_file) || !safePath(member.review) || !member.review.startsWith('directory/reviews/') || !member.review.endsWith('.md')) fail();
    if (!Array.isArray(member.skills) || !member.skills.length) fail();
    if (member.scope === 'SKILL.md' && member.skills.length !== 1) fail();
    const skillIds = new Set();
    for (const skill of member.skills) {
      if (!skill || Object.keys(skill).some((key) => !['id', 'title', 'description'].includes(key)) || ['id', 'title', 'description'].some((key) => typeof skill[key] !== 'string' || !skill[key].trim()) || !slug.test(skill.id) || skillIds.has(skill.id)) fail();
      skillIds.add(skill.id);
    }
    if (member.links !== undefined) {
      if (!Array.isArray(member.links)) fail();
      const approved = MEMBER_LINKS.get(member.repo);
      const labels = new Set();
      for (const link of member.links) {
        if (!link || Object.keys(link).some((key) => !['label', 'url'].includes(key)) || typeof link.url !== 'string' || approved?.get(link.label) !== link.url || labels.has(link.label)) fail();
        labels.add(link.label);
      }
    }
    ids.add(member.id); repos.add(member.repo.toLowerCase());
  }
  return members;
}

export function memberSkillPath(member, skill) {
  return member.scope === 'SKILL.md' ? 'SKILL.md' : `${member.scope}/${skill.id}/SKILL.md`;
}

export function directoryMembersHtml(members, { esc, start = 0 }) {
  return members.map((member, index) => {
    const source = `https://github.com/${member.repo}`;
    const pinned = `${source}/blob/${member.commit}`;
    return `<article class="featured-project directory-member" id="${member.id}" data-directory-membership="member" aria-labelledby="${member.id}-title">
      <header class="featured-project-heading"><p class="featured-number" aria-hidden="true">${String(start + index + 1).padStart(2, '0')}</p><div><p class="featured-kind">Suede Directory Member</p><h2 id="${member.id}-title">${esc(member.name)}</h2></div><span class="featured-license">${esc(member.license)}</span></header>
      <div class="featured-project-body"><div><h3 class="featured-headline">${esc(member.headline)}</h3><p class="featured-summary">${esc(member.summary)}</p><ul class="featured-work">${member.skills.map((skill) => `<li><a href="${pinned}/${memberSkillPath(member, skill)}"><span>${esc(skill.title)}</span><span aria-hidden="true">↗</span></a><p>${esc(skill.description)}</p></li>`).join('\n')}</ul></div><aside class="featured-setup"><h3>Before you start</h3><p>${esc(member.setup)}</p></aside></div>
      <footer class="featured-project-footer">${(member.links || []).map((link) => `<a href="${esc(link.url)}" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join('')}<a href="${source}">Explore ${esc(member.name)} on GitHub ↗</a><a href="https://github.com/JasonColapietro/suede-creator-skills/blob/main/${member.review}">Read the skill review ↗</a><a href="${pinned}/${member.license_file}">${member.scope === 'SKILL.md' ? 'Source' : 'Plugin'} license ↗</a><a href="${source}/${member.scope === 'SKILL.md' ? 'blob' : 'tree'}/${member.commit}/${member.scope}">Reviewed ${member.scope === 'SKILL.md' ? 'skill' : 'skills'} <code>${member.commit.slice(0, 7)}</code> ↗</a></footer>
    </article>`;
  }).join('\n');
}

export const pendingStatusHtml = (esc) => `<span class="featured-status" data-featured-status="${PENDING_STATUS}">${esc(PENDING_LABEL)}</span>`;

// skillHref(project, item) may resolve a skill's listing (full page or its
// repository-page row); without one, links use the full-page route.
export function featuredProjectsHtml(projects, { esc, rel, here, slugify, skillHref }) {
  return projects.map((project, index) => {
    const pending = isPending(project);
    const source = project.repo ? `https://github.com/${project.repo}` : null;
    const route = project.repo ? project.repo.split('/').map(slugify).join('/') : null;
    const items = project.skills || project.capabilities;
    const work = items.map((item) => `<li>${project.skills
      ? `<a href="${skillHref?.(project, item) ? esc(skillHref(project, item)) : rel(here, `directory/${route}/${item.id}/`)}"><span>${esc(item.title)}</span><span aria-hidden="true">↗</span></a>`
      : `<h4>${esc(item.title)}</h4>`}<p>${esc(item.description)}</p></li>`).join("\n");
    const install = project.commands ? `<aside class="featured-install" aria-labelledby="${project.id}-install">
      <h3 id="${project.id}-install">Install the Claude Code plugin</h3>
      <p>${esc(project.setup)}</p>
      <div class="snippet"><div class="snippet-head"><span>Run these two commands</span><button type="button" class="snippet-copy" data-copy-target="${project.id}-commands">Copy commands</button></div><pre><code id="${project.id}-commands">${esc(project.commands.join("\n"))}</code></pre></div>
      <h4>What runs after installation</h4><p>${esc(project.behavior)}</p>
      <details><summary>Snapshot and token-check coverage</summary><p>${esc(project.guard_scope)}</p></details>
    </aside>` : `<aside class="featured-setup"><h3>Before you start</h3><p>${esc(project.setup)}</p></aside>`;
    const footer = [
      project.workflow_url ? `<a href="${esc(project.workflow_url)}">Read the workflow source ↗</a>` : "",
      project.site ? `<a href="${esc(project.site)}" rel="noopener noreferrer">Visit ${esc(project.name)} ↗</a>` : "",
      source ? `<a href="${source}">Explore ${esc(project.name)} on GitHub ↗</a>` : "",
      pending ? pendingStatusHtml(esc) : `<a href="https://github.com/JasonColapietro/suede-creator-skills/blob/main/${project.review}">Read the intake review ↗</a>`,
      source ? `<a href="${source}/tree/${project.commit}">${pending ? "Source at" : "Reviewed source"} <code>${project.commit.slice(0, 7)}</code> ↗</a>` : "",
    ].join("");
    return `<article class="featured-project" id="${project.id}"${pending ? ` data-featured-status="${PENDING_STATUS}"` : ""} aria-labelledby="${project.id}-title">
      <header class="featured-project-heading"><p class="featured-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</p><div><p class="featured-kind">${esc(project.kind)}</p><h2 id="${project.id}-title">${esc(project.name)}</h2></div>${project.license ? `<span class="featured-license">${esc(project.license)}</span>` : ""}</header>
      <div class="featured-project-body"><div><h3 class="featured-headline">${esc(project.headline)}</h3><p class="featured-summary">${esc(project.summary)}</p><ul class="featured-work">${work}</ul></div>${install}</div>
      <footer class="featured-project-footer">${footer}</footer>
    </article>`;
  }).join("\n");
}
