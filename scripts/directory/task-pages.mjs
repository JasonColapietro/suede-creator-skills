// Task pages ("Claude Code skills for <job>") and "<skill> alternatives" pages
// for the Agent Skills Directory. Pure functions over the expanded skill
// records scripts/build-directory.mjs builds from directory/skills.json; the
// keyword map lives in directory/task-pages.json. The build renders the pages;
// this module decides which pages exist and which skills each one ranks.
//
// Matching is deterministic: a skill belongs to a job when its name matches the
// job's name pattern, or when its one-sentence summary (the first sentence of
// its description when it has no full page) matches the job's text pattern and
// its category is one the job allows (`nameCategories` narrows name matches
// the same way for broad words such as "review"). Explicit exclusions remove skills whose
// summary mentions the job only in passing.

import fs from "node:fs";

// Suede AI publishes the directory, so its own skills never appear in a
// ranking or as an alternative: the directory promises neutrality.
export const FIRST_PARTY_REPOS = new Set(["jasoncolapietro/suede-creator-skills"]);
export const isFirstParty = (s) => FIRST_PARTY_REPOS.has(String(s.repo).toLowerCase()) || /^suede-ai\//i.test(String(s.repo));

export const TASK_GATE = { minListed: 5, minStrongPages: 3, strongScore: 80 };
export const TABLE_MAX = 15;
export const PER_REPO_MAX = 3;
export const ALTERNATIVES_MIN_PEERS = 3;
export const ALTERNATIVES_MAX = 8;

const firstSentence = (t) => (String(t || "").replace(/\s+/g, " ").trim().match(/^.*?[.!?](?=\s|$)/) || [String(t || "")])[0];

export function loadTaskConfig(file, categorySlugs) {
  const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(cfg.jobs) || !cfg.jobs.length) throw new Error("task-pages.json: expected a jobs array");
  const ids = new Set();
  for (const j of cfg.jobs) {
    if (!/^[a-z0-9-]+$/.test(j.id) || ids.has(j.id)) throw new Error(`task-pages.json: invalid or duplicate id ${j.id}`);
    ids.add(j.id);
    for (const k of ["job", "topic", "noun", "name"]) if (typeof j[k] !== "string" || !j[k].trim()) throw new Error(`task-pages.json: ${j.id} needs ${k}`);
    if (/—/.test(`${j.job}${j.topic}${j.noun}`)) throw new Error(`task-pages.json: ${j.id} contains an em dash`);
    for (const c of [...(j.categories || []), ...(j.nameCategories || [])]) if (!categorySlugs.has(c)) throw new Error(`task-pages.json: ${j.id} names unknown category ${c}`);
    if (j.text && !(j.categories || []).length) throw new Error(`task-pages.json: ${j.id} text matches need a category allowlist`);
    j.nameRe = new RegExp(j.name, "i");
    j.textRe = j.text ? new RegExp(j.text, "i") : null;
    j.excludeSet = new Set((j.exclude || []).map((x) => x.toLowerCase()));
  }
  return cfg;
}

// Why a skill matched, or null. "name" outranks "text" when two skills tie.
export function matchReason(job, s) {
  if (isFirstParty(s) || job.excludeSet.has(`${s.repo}/${s.slug}`.toLowerCase())) return null;
  const nameFits = !job.nameCategories || job.nameCategories.includes(s.category);
  if (nameFits && job.nameRe.test(`${s.name.replace(/[-_]+/g, " ")} ${s.display_name || ""}`)) return "name";
  if (job.textRe && job.categories.includes(s.category) && job.textRe.test(s.summary || firstSentence(s.description))) return "text";
  return null;
}

const rank = (a, b) =>
  b.s.score - a.s.score || (a.reason === "name" ? 0 : 1) - (b.reason === "name" ? 0 : 1) || Number(b.s.featured) - Number(a.s.featured) || b.s.lists.length - a.s.lists.length || a.s.id.localeCompare(b.s.id);

// Every job with its matches, gate result and the ranked table rows.
export function planTasks(cfg, skills) {
  return cfg.jobs.map((job) => {
    const matches = skills.map((s) => ({ s, reason: matchReason(job, s) })).filter((m) => m.reason).sort(rank);
    const strong = matches.filter((m) => m.s.featured && m.s.score >= TASK_GATE.strongScore);
    const published = matches.length >= TASK_GATE.minListed && strong.length >= TASK_GATE.minStrongPages;
    // The table keeps the ranking but caps each repository, so one large
    // collection cannot fill a comparison on its own.
    const perRepo = new Map();
    const rows = [];
    for (const m of matches) {
      const n = perRepo.get(m.s.repo_slug) || 0;
      if (n >= PER_REPO_MAX) continue;
      perRepo.set(m.s.repo_slug, n + 1);
      rows.push(m.s);
      if (rows.length === TABLE_MAX) break;
    }
    return { job, matches: matches.map((m) => m.s), reasons: new Map(matches.map((m) => [m.s.id, m.reason])), strong: strong.map((m) => m.s), published, rows };
  });
}

// One alternatives page per full-page skill scoring 80 or more that appears in
// a published task table and has at least three full-page peers from other
// repositories in the same category and the same primary job. The primary job
// is the first published job, in task-pages.json order, whose name pattern
// matches the skill, else the first that lists it. Sharing a job and a
// category keeps peers to skills that do the same work.
export function planAlternatives(tasks) {
  const live = tasks.filter((t) => t.published);
  const primary = new Map();
  for (const pass of ["name", "text"]) {
    for (const t of live) {
      for (const s of t.rows) {
        if (!s.featured || s.score < TASK_GATE.strongScore || primary.has(s.id)) continue;
        if (pass === "name" && t.reasons.get(s.id) !== "name") continue;
        primary.set(s.id, t);
      }
    }
  }
  const out = [];
  for (const [id, t] of primary) {
    const s = t.rows.find((o) => o.id === id);
    const peers = t.matches.filter((o) => o.featured && o.repo_slug !== s.repo_slug && o.category === s.category);
    if (peers.length < ALTERNATIVES_MIN_PEERS) continue;
    // Peers in score order, one per repository first, so the list compares
    // publishers rather than one collection's siblings.
    const seen = new Set();
    const first = [];
    const rest = [];
    for (const o of peers) {
      (seen.has(o.repo_slug) ? rest : first).push(o);
      seen.add(o.repo_slug);
    }
    out.push({ s, task: t, peers: [...first, ...rest].slice(0, ALTERNATIVES_MAX).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)) });
  }
  return out.sort((a, b) => a.s.id.localeCompare(b.s.id));
}
