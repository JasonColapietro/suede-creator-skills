// Topic pages ("<Topic> skills for Claude Code and Codex") for the Agent
// Skills Directory: the subcategory and task layer that sits under the sixteen
// category directories, so a reader who browses by job, industry, format or
// tool finds a page for it. directory/topics.json holds the taxonomy (groups
// and topics with keyword patterns); this module decides which topics publish
// and which skills each one lists. Pure functions over the expanded skill
// records scripts/build-directory.mjs builds from directory/skills.json.
//
// Matching is deterministic: a skill belongs to a topic when its name (or
// display name) matches the topic's name pattern, when its folder path matches
// the optional path pattern, or when its summary (or, with scope "description",
// its whole description) matches the text pattern and its category is one the
// topic allows. Explicit exclusions remove skills that mention the topic only
// in passing. A skill can belong to several topics; the first match in
// topics.json order is its primary topic.

import fs from "node:fs";

export const TOPIC_GATE = { minListed: 3 };
export const TOPIC_CHIPS_MAX = 6;
export const RELATED_TOPICS_MAX = 8;

const firstSentence = (t) => (String(t || "").replace(/\s+/g, " ").trim().match(/^.*?[.!?](?=\s|$)/) || [String(t || "")])[0];
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function loadTopicConfig(file, categorySlugs) {
  const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(cfg.groups) || !cfg.groups.length) throw new Error("topics.json: expected a groups array");
  if (!Array.isArray(cfg.topics) || !cfg.topics.length) throw new Error("topics.json: expected a topics array");
  const groupIds = new Set();
  for (const g of cfg.groups) {
    if (!ID_RE.test(g.id || "") || groupIds.has(g.id)) throw new Error(`topics.json: invalid or duplicate group id ${g.id}`);
    groupIds.add(g.id);
    for (const k of ["name", "intro"]) if (typeof g[k] !== "string" || !g[k].trim()) throw new Error(`topics.json: group ${g.id} needs ${k}`);
    if (/—/.test(`${g.name}${g.intro}`)) throw new Error(`topics.json: group ${g.id} contains an em dash`);
    for (const c of g.categories || []) if (!categorySlugs.has(c)) throw new Error(`topics.json: group ${g.id} names unknown category ${c}`);
    g.futurepedia = g.futurepedia || [];
  }
  const ids = new Set();
  const names = new Set();
  for (const t of cfg.topics) {
    if (!ID_RE.test(t.id || "") || ids.has(t.id)) throw new Error(`topics.json: invalid or duplicate topic id ${t.id}`);
    ids.add(t.id);
    if (typeof t.name !== "string" || !t.name.trim()) throw new Error(`topics.json: ${t.id} needs a name`);
    if (names.has(t.name.toLowerCase())) throw new Error(`topics.json: duplicate topic name ${t.name}`);
    names.add(t.name.toLowerCase());
    if (!groupIds.has(t.group)) throw new Error(`topics.json: ${t.id} names unknown group ${t.group}`);
    if (!t.name_re && !t.text_re && !t.path_re) throw new Error(`topics.json: ${t.id} needs name_re, path_re or text_re`);
    if (t.text_re && !(t.categories || []).length) throw new Error(`topics.json: ${t.id} text matches need a category allowlist`);
    for (const c of [...(t.categories || []), ...(t.nameCategories || [])]) if (!categorySlugs.has(c)) throw new Error(`topics.json: ${t.id} names unknown category ${c}`);
    if (t.scope && !["summary", "description"].includes(t.scope)) throw new Error(`topics.json: ${t.id} scope must be summary or description`);
    for (const k of ["intro", "noun"]) if (t[k] !== undefined && (typeof t[k] !== "string" || !t[k].trim())) throw new Error(`topics.json: ${t.id} ${k} must be text`);
    if (t.guide !== undefined && (!Array.isArray(t.guide) || t.guide.some((p) => typeof p !== "string" || !p.trim()))) throw new Error(`topics.json: ${t.id} guide must be a list of paragraphs`);
    if (/—/.test(`${t.name}${t.intro || ""}${t.noun || ""}${(t.guide || []).join("")}`)) throw new Error(`topics.json: ${t.id} contains an em dash`);
    t.futurepedia = t.futurepedia || [];
    t.noun = t.noun || t.name;
    t.nameRe = t.name_re ? new RegExp(t.name_re, "i") : null;
    t.pathRe = t.path_re ? new RegExp(t.path_re, "i") : null;
    t.textRe = t.text_re ? new RegExp(t.text_re, "i") : null;
    t.excludeSet = new Set((t.exclude || []).map((x) => x.toLowerCase()));
  }
  return cfg;
}

// Why a skill matched a topic, or null. "name" outranks "path" outranks "text".
export function topicMatch(topic, s) {
  if (topic.excludeSet.has(`${s.repo}/${s.slug}`.toLowerCase())) return null;
  const nameFits = !topic.nameCategories || topic.nameCategories.includes(s.category);
  if (topic.nameRe && nameFits && topic.nameRe.test(`${s.name.replace(/[-_]+/g, " ")} ${s.display_name || ""}`)) return "name";
  if (topic.pathRe && nameFits && s.dir !== "." && topic.pathRe.test(String(s.dir).replace(/[-_/]+/g, " "))) return "path";
  if (topic.textRe && topic.categories.includes(s.category)) {
    const text = topic.scope === "description" ? String(s.description || "") : s.summary || firstSentence(s.description);
    if (topic.textRe.test(text)) return "text";
  }
  return null;
}

// Table order matches the category pages: full pages first, then by name.
const byListing = (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name) || a.repo.localeCompare(b.repo);

// Every topic with its matches, gate result and table rows, grouped.
export function planTopics(cfg, skills) {
  const topics = cfg.topics.map((topic) => {
    const reasons = new Map();
    for (const s of skills) {
      const r = topicMatch(topic, s);
      if (r) reasons.set(s.id, r);
    }
    const rows = skills.filter((s) => reasons.has(s.id)).sort(byListing);
    const strong = rows.filter((s) => s.featured && s.score >= 80);
    const published = rows.length >= TOPIC_GATE.minListed;
    const categories = [...new Set(rows.map((s) => s.category))];
    return { topic, rows, reasons, strong, published, categories };
  });
  const byGroup = new Map(cfg.groups.map((g) => [g.id, { group: g, topics: [] }]));
  for (const t of topics) byGroup.get(t.topic.group).topics.push(t);
  return { topics, groups: [...byGroup.values()] };
}

// The topics that list a skill, in topics.json order; the first is primary.
export function topicsBySkill(plan) {
  const m = new Map();
  for (const t of plan.topics) {
    if (!t.published) continue;
    for (const s of t.rows) m.set(s.id, [...(m.get(s.id) || []), t]);
  }
  return m;
}

// Skills that share the most topics with `s` (then the highest score), from
// other repositories, for a "similar skills" panel.
export function similarByTopic(s, bySkill, max = 6) {
  const mine = bySkill.get(s.id) || [];
  if (!mine.length) return [];
  const counts = new Map();
  for (const t of mine) for (const o of t.rows) {
    if (o.id === s.id || o.repo_slug === s.repo_slug || !o.featured) continue;
    counts.set(o.id, { s: o, n: (counts.get(o.id)?.n || 0) + 1 });
  }
  return [...counts.values()].sort((a, b) => b.n - a.n || b.s.score - a.s.score || a.s.id.localeCompare(b.s.id)).slice(0, max).map((x) => x.s);
}
