import { recommendSkills } from "/assets/workflow-recommender.js";
import { startField } from "./field.js";

const input = document.querySelector("#prompt"),
  form = input.form;
const matches = document.querySelector(".matches"),
  grid = document.querySelector(".match-grid");
const feedback = document.querySelector(".feedback"),
  clear = form.querySelector(".clear");
const share = document.querySelector("[data-share]"),
  copy = document.querySelector("[data-copy]");
const tiles = JSON.parse(document.querySelector("#tile-data").textContent);
const icons = new Map(tiles.map((t) => [t.name.toLowerCase(), t.icon]));
let catalog,
  results = [],
  active = "",
  revision = 0;
const make = (tag, cls, label) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (label) el.textContent = label;
  return el;
};

function groupCard(owner, records) {
  const card = make("article"),
    header = make("header"),
    logo = make("img"),
    title = make("div", "publisher");
  logo.src =
    icons.get(owner.toLowerCase()) ||
    "/assets/discovery/categories/" + records[0].category + ".svg";
  logo.alt = "";
  title.append(make("b", "", owner), make("small", "", records[0].label));
  header.append(logo, title);
  card.append(header);
  const list = make("ul");
  for (const row of records) {
    const li = make("li"),
      link = make("a");
    link.href = row.href;
    link.title = row.description;
    link.append(
      make("span", "", row.name),
      make("small", "", row.score + "/100 · " + row.grade),
    );
    li.append(link);
    list.append(li);
  }
  card.append(list);
  return card;
}
async function run(query, historyMode = "") {
  query = query.trim().slice(0, 360);
  const token = ++revision;
  if (historyMode && query !== active) {
    const url = new URL(location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    history[historyMode](null, "", url);
  }
  active = query;
  input.value = query;
  results = [];
  feedback.textContent = "";
  document.body.classList.toggle("has-results", Boolean(query));
  matches.hidden = !query;
  clear.hidden = !query;
  grid.replaceChildren();
  if (!query) return;
  const heading = document.querySelector("#results-heading");
  heading.textContent = "Finding skills for " + query + "…";
  copy.disabled = true;
  try {
    catalog ||= fetch("/search-index.json").then((r) => {
      if (!r.ok) throw new Error();
      return r.json();
    });
    const index = await catalog;
    if (token !== revision) return;
    const ranked = recommendSkills(query, index, { limit: 12 });
    const publisher = query.toLowerCase();
    const direct = index
      .filter((s) =>
        [
          s.name.toLowerCase(),
          s.repo.toLowerCase(),
          s.repo.split("/")[0].toLowerCase(),
        ].includes(publisher),
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
    const groups = new Map();
    for (const row of new Map(
      [...direct, ...ranked].map((skill) => [skill.id, skill]),
    ).values()) {
      const owner = row.repo.split("/")[0];
      if (!groups.has(owner)) {
        if (groups.size === 3) continue;
        groups.set(owner, []);
      }
      if (groups.get(owner).length < 4) groups.get(owner).push(row);
    }
    results = [...groups.values()].flat();
    copy.disabled = !results.length;
    heading.textContent = "Best fit for " + query;
    if (results.length)
      grid.replaceChildren(
        ...[...groups].map(([owner, rows]) => groupCard(owner, rows)),
      );
    else {
      const card = make("p", "match-empty", "No skills matched that request. "),
        link = make("a", "", "Browse the catalog");
      link.href = "/catalog/";
      card.append(link);
      grid.append(card);
    }
  } catch {
    catalog = undefined;
    if (token !== revision) return;
    heading.textContent = "Could not load the skills index.";
    const retry = make("button", "load-more", "Try again");
    retry.type = "button";
    retry.addEventListener("click", () => run(active));
    grid.replaceChildren(retry);
  }
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  run(input.value, "pushState");
});
clear.addEventListener("click", () => {
  run("", "pushState");
  input.focus();
});
document.querySelectorAll(".sample-prompts a").forEach((link) =>
  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    run(link.textContent, "pushState");
  }),
);
async function toClipboard(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    feedback.textContent = message;
  } catch {
    const el = make("textarea");
    el.value = text;
    feedback.replaceChildren(el);
    el.select();
  }
}
share.addEventListener("click", () =>
  toClipboard(location.href, "Search link copied."),
);
copy.addEventListener("click", () =>
  toClipboard(
    [
      active,
      ...results.map(
        (s) =>
          "- " +
          s.name +
          " (" +
          s.score +
          "/100, " +
          s.license +
          ") " +
          new URL(s.href, location.origin).href,
      ),
    ].join("\n"),
    "Skill matches copied.",
  ),
);
window.addEventListener("popstate", () =>
  run(new URL(location.href).searchParams.get("q") || ""),
);
run(new URL(location.href).searchParams.get("q") || "");
if (window.Matter) startField(tiles);
