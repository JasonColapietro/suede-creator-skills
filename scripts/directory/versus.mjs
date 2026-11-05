// Brand comparison pages for the Agent Skills Directory: one
// "Suede AI Skills Directory vs <name>" page and one "<name> alternatives"
// page per competing directory in directory/editorial/competitors.json.
// This module loads and validates that file and fills its live-count tokens;
// scripts/build-directory.mjs renders the pages under directory/compare/.
//
// Competitor facts are editorial and sourced: every entry names the URLs it
// was checked against and the date. Suede AI's own figures are never typed
// into the file; tokens such as {skills} are filled from the live dataset.

import fs from "node:fs";

export const FACT_ROWS = [
  ["operator", "Who runs it"],
  ["lists", "What it lists"],
  ["ranking", "How it ranks skills"],
  ["signals", "Quality and safety signals"],
  ["install", "Install route"],
  ["price", "Price"],
];
export const TOKENS = ["skills", "repos", "categories", "full", "shielded", "tasks", "alternatives", "snapshot", "installs_matched", "installs_date", "others"];

// House style for public copy (CLAUDE.md and the org writing rules).
const BANNED = /—|\bmoreover\b|\bdelve\b|game-changer|\bunlock|\belevate|\bseamless|\blandscape\b|\btapestry\b|it's important to note|honest limits|not the first choice|not for everyone|best fit/i;

export const versusPath = (c) => `directory/compare/suede-vs-${c.id}/`;
export const altBrandPath = (c) => `directory/compare/${c.id}-alternatives/`;

function strings(c) {
  return [c.name, c.summary, c.vs_answer, c.angle, c.together, c.vs_meta, c.alt_answer, c.alt_meta,
    ...Object.values(c.facts), ...c.faq.flat(), ...c.alt_faq.flat(), ...c.sources.map((s) => s.title)].filter((x) => x !== null);
}

export function loadCompetitors(file) {
  if (!fs.existsSync(file)) return [];
  const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(cfg.competitors)) throw new Error("competitors.json: expected a competitors array");
  const ids = new Set();
  for (const c of cfg.competitors) {
    if (!/^[a-z0-9-]+$/.test(c.id) || ids.has(c.id)) throw new Error(`competitors.json: invalid or duplicate id ${c.id}`);
    ids.add(c.id);
    for (const k of ["name", "url", "checked", "summary", "vs_answer", "angle", "vs_meta", "alt_answer", "alt_meta"]) {
      if (typeof c[k] !== "string" || !c[k].trim()) throw new Error(`competitors.json: ${c.id} needs ${k}`);
    }
    if (!/^https:\/\//.test(c.url)) throw new Error(`competitors.json: ${c.id} url must be https`);
    if (!/^\d{4}-\d\d-\d\d$/.test(c.checked)) throw new Error(`competitors.json: ${c.id} checked must be an ISO date`);
    if (c.together !== null && (typeof c.together !== "string" || !c.together.trim())) throw new Error(`competitors.json: ${c.id} together must be text or null`);
    for (const [k] of FACT_ROWS) {
      if (!(k in c.facts) || (c.facts[k] !== null && (typeof c.facts[k] !== "string" || !c.facts[k].trim()))) throw new Error(`competitors.json: ${c.id} facts.${k} must be text or null`);
    }
    for (const key of ["faq", "alt_faq"]) {
      if (!Array.isArray(c[key]) || c[key].some((qa) => !Array.isArray(qa) || qa.length !== 2 || !/\?$/.test(qa[0]) || !qa[1].trim())) throw new Error(`competitors.json: ${c.id} ${key} must hold [question, answer] pairs`);
    }
    if (!Array.isArray(c.sources) || !c.sources.length || c.sources.some((s) => !s.title || !/^https:\/\//.test(s.url))) throw new Error(`competitors.json: ${c.id} needs https sources`);
    for (const t of strings(c)) {
      const bad = t.match(BANNED);
      if (bad) throw new Error(`competitors.json: ${c.id} uses "${bad[0]}", which the house style bans`);
      for (const m of t.matchAll(/\{([a-z_]+)\}/g)) if (!TOKENS.includes(m[1])) throw new Error(`competitors.json: ${c.id} uses unknown token {${m[1]}}`);
    }
  }
  return cfg.competitors;
}

// Replaces {token} with its live value; an unfilled token is an error.
export function fill(text, values) {
  return String(text).replace(/\{([a-z_]+)\}/g, (_, k) => {
    if (values[k] === undefined || values[k] === null) throw new Error(`competitors.json: no value for {${k}}`);
    return String(values[k]);
  });
}
