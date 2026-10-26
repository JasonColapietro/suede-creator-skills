// Editorial project selections are independent of skill scores and README-badge verification.
export function featuredProjectsHtml(projects, { esc, rel, here, listingHref }) {
  return projects.map((project, index) => {
    const source = `https://github.com/${project.repo}`;
    const review = `https://github.com/JasonColapietro/suede-creator-skills/blob/main/${project.review}`;
    const items = project.skills || project.capabilities;
    const work = items.map((item) => `<li>${project.skills
      ? `<a href="${esc(listingHref(project, item))}"><span>${esc(item.title)}</span><span aria-hidden="true">↗</span></a>`
      : `<h4>${esc(item.title)}</h4>`}<p>${esc(item.description)}</p></li>`).join("\n");
    const install = project.commands ? `<aside class="featured-install" aria-labelledby="${project.id}-install">
      <h3 id="${project.id}-install">Install the Claude Code plugin</h3>
      <p>${esc(project.setup)}</p>
      <div class="snippet"><div class="snippet-head"><span>Run these two commands</span><button type="button" class="snippet-copy" data-copy-target="${project.id}-commands">Copy commands</button></div><pre><code id="${project.id}-commands">${esc(project.commands.join("\n"))}</code></pre></div>
      <h4>What runs after installation</h4><p>${esc(project.behavior)}</p>
      <details><summary>Snapshot and token-check coverage</summary><p>${esc(project.guard_scope)}</p></details>
    </aside>` : `<aside class="featured-setup"><h3>Before you start</h3><p>${esc(project.setup)}</p></aside>`;
    return `<article class="featured-project" id="${project.id}" aria-labelledby="${project.id}-title">
      <header class="featured-project-heading"><p class="featured-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</p><div><p class="featured-kind">${esc(project.kind)}</p><h2 id="${project.id}-title">${esc(project.name)}</h2></div><span class="featured-license">${esc(project.license)}</span></header>
      <div class="featured-project-body"><div><h3 class="featured-headline">${esc(project.headline)}</h3><p class="featured-summary">${esc(project.summary)}</p><ul class="featured-work">${work}</ul></div>${install}</div>
      <footer class="featured-project-footer">${project.workflow_url ? `<a href="${esc(project.workflow_url)}">Read the workflow source ↗</a>` : ""}<a href="${source}">Explore ${esc(project.name)} on GitHub ↗</a><a href="${review}">Read the intake review ↗</a><a href="${source}/tree/${project.commit}">Reviewed source <code>${project.commit.slice(0, 7)}</code> ↗</a></footer>
    </article>`;
  }).join("\n");
}
