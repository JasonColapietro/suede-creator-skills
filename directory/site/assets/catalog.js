const field = document.querySelector("#catalog-search");
const groups = document.querySelector(".catalog-groups");
const grid = document.querySelector(".filtered-grid");
const status = document.querySelector(".catalog-status");
const more = document.querySelector(".load-more");
const tabs = [...document.querySelectorAll("[data-category]")];
const icons = JSON.parse(
  document.querySelector("#publisher-icons").textContent,
);
let source,
  limit = 48,
  revision = 0,
  selected = "";
function card(skill) {
  const link = document.createElement("a"),
    badge = document.createElement("span"),
    img = document.createElement("img");
  const text = document.createElement("span"),
    name = document.createElement("b"),
    meta = document.createElement("small");
  link.className = "skill-card";
  link.href = skill.href;
  name.textContent = skill.name;
  meta.textContent = skill.repo + " · " + skill.score + "/100";
  badge.className = "skill-icon";
  img.src =
    icons[skill.repo.split("/")[0].toLowerCase()] ||
    "/assets/discovery/categories/" + skill.category + ".svg";
  img.alt = "";
  img.width = 20;
  img.height = 20;
  img.loading = "lazy";
  badge.append(img);
  text.append(name, meta);
  link.append(badge, text);
  return link;
}
async function show() {
  const token = ++revision;
  const query = field.value.trim();
  const filtering = Boolean(selected || query);
  tabs.forEach((tab) => {
    if (tab.dataset.category === selected)
      tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });
  groups.hidden = filtering;
  grid.hidden = !filtering;
  more.hidden = true;
  grid.replaceChildren();
  if (!filtering) {
    status.textContent = "";
    return;
  }
  status.textContent = "Loading skills…";
  try {
    source ||= fetch("/search-index.json")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((rows) =>
        rows.map((skill) => ({
          skill,
          search: [
            skill.name,
            skill.repo,
            skill.description,
            skill.label,
            ...skill.topics,
          ]
            .join(" ")
            .toLowerCase(),
        })),
      );
    const rows = await source;
    if (token !== revision) return;
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = rows.filter(
      ({ skill, search }) =>
        (!selected || selected === skill.category) &&
        terms.every((term) => search.includes(term)),
    );
    grid.replaceChildren(
      ...matches.slice(0, limit).map((row) => card(row.skill)),
    );
    status.textContent = matches.length
      ? matches.length.toLocaleString() +
        (matches.length === 1 ? " skill" : " skills")
      : "No skills match. Try another term or choose All.";
    more.hidden = matches.length <= limit;
  } catch {
    source = undefined;
    if (token === revision) {
      status.textContent =
        "Search data could not load. Browse a category below or try again.";
      groups.hidden = false;
    }
  }
}
function navigate() {
  const params = new URLSearchParams();
  if (selected) params.set("category", selected);
  if (field.value.trim()) params.set("q", field.value.trim());
  history.replaceState(
    null,
    "",
    location.pathname + (params.size ? "?" + params : ""),
  );
  limit = 48;
  show();
}
tabs.forEach((tab) =>
  tab.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    selected = tab.dataset.category;
    navigate();
  }),
);
field.addEventListener("input", navigate);
field.form.addEventListener("submit", (e) => {
  e.preventDefault();
  navigate();
});
more.addEventListener("click", () => {
  limit += 48;
  show();
});
function readUrl() {
  const params = new URLSearchParams(location.search);
  selected = tabs.some((t) => t.dataset.category === params.get("category"))
    ? params.get("category")
    : "";
  field.value = params.get("q") || "";
  limit = 48;
  show();
}
window.addEventListener("popstate", readUrl);
readUrl();
