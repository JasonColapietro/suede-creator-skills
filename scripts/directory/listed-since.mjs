// When each skill first appeared in the directory. directory/listed-since.json
// is a ledger keyed by skill id (owner/repo/slug slugs) with the snapshot date
// that first listed it. The build adds every skill the ledger does not know
// with the current snapshot date and drops skills that left the dataset, so
// "listed since" on a skill page and the "new this month" page come from one
// committed source. The first entries carry 2026-10-19, the earliest snapshot
// in the repository's history, which means "listed since at least that date".

import fs from "node:fs";

export const NEW_DAYS = 30;
const DATE_RE = /^\d{4}-\d\d-\d\d$/;

export function loadListedSince(file) {
  if (!fs.existsSync(file)) return { dates: {} };
  const ledger = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!ledger.dates || typeof ledger.dates !== "object" || Array.isArray(ledger.dates)) throw new Error("listed-since.json: expected a dates map");
  for (const [id, d] of Object.entries(ledger.dates)) if (!DATE_RE.test(d)) throw new Error(`listed-since.json: ${id} has no ISO date`);
  return ledger;
}

// The ledger for the current dataset: known skills keep their date, new ones
// take the snapshot date, departed ones leave. Returns the next ledger and the
// ids it added, and sets listed_since on every skill.
export function applyListedSince(ledger, skills, snapshotDate) {
  if (!DATE_RE.test(snapshotDate)) throw new Error("listed-since: snapshot date must be ISO");
  const dates = {};
  const added = [];
  for (const s of skills) {
    const d = ledger.dates[s.id];
    if (d && d <= snapshotDate) dates[s.id] = d;
    else {
      dates[s.id] = snapshotDate;
      added.push(s.id);
    }
    s.listed_since = dates[s.id];
  }
  return { next: { _comment: ledger._comment || "Snapshot date that first listed each skill; maintained by scripts/build-directory.mjs. 2026-10-19 is the earliest snapshot on record.", dates }, added };
}

export const serializeLedger = (ledger) => `${JSON.stringify({ _comment: ledger._comment, dates: Object.fromEntries(Object.entries(ledger.dates).sort(([a], [b]) => a.localeCompare(b))) }, null, 1)}\n`;

export const daysBetween = (from, to) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);

// Listed within NEW_DAYS of the snapshot, excluding the first recorded snapshot
// (every skill in it would otherwise read as new).
export const isNewListing = (s, snapshotDate, floorDate) => s.listed_since > floorDate && daysBetween(s.listed_since, snapshotDate) <= NEW_DAYS;
export const isRecentlyUpdated = (s, snapshotDate) => daysBetween(s.commit_date, snapshotDate) <= NEW_DAYS;
