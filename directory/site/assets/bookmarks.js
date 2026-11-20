// Keep links to the original catalog's search, workflow and shortlist state working.
const savedParams = new URLSearchParams(location.search);
const legacyFields = [
  "q",
  "category",
  "grade",
  "sort",
  "lane",
  "flag",
  "pick",
  "task",
];
if (
  legacyFields.some((field) => savedParams.has(field)) ||
  document.currentScript.dataset.anchors
    ?.split(" ")
    .includes(location.hash.slice(1))
) {
  location.replace("/browse/" + location.search + location.hash);
}
