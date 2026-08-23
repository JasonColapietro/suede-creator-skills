#!/usr/bin/env node
// Writes the ship-log stamp into the four places that carry it: the newest
// #changelog entry on docs/index.html, and the tiny #hero-shiplog card on the
// homepage, the skills catalog, and the guide.
//
// It exists because those four were hand-copied. The prepared entry's base
// commit went stale the moment anything merged, and the fix was three or four
// identical edits in three files — so in practice it was refreshed late, or in
// one file and not the others, and the validator caught the drift after the
// fact instead of the build preventing it.
//
// Two sources feed the stamp, and they are NOT the same source. The base commit
// comes from git (`merge-base HEAD origin/main`). Everything else — status,
// date, title — comes from the hand-authored newest entry in docs/index.html
// and is only propagated outward. In particular the date is the changelog
// ENTRY date, not the base commit's date: the entry is prose about a release,
// written on the day it was written, and the validator checks it against the
// entry. Deriving it from the commit instead looks equivalent and fails.
//
// Usage:
//   node scripts/build-shiplog.mjs            rewrite the stamp in place
//   node scripts/build-shiplog.mjs --check    report drift, exit 1 if stale
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function die(message) {
  console.error(`build-shiplog: ${message}`);
  process.exit(1);
}

function git(...args) {
  const result = spawnSync("git", ["-C", repoRoot, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.error) die(`could not run git (${result.error.code || result.error.message})`);
  if (result.status !== 0) die(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  return result.stdout.trim();
}

// Read the newest #changelog entry. This is the hand-authored source of truth
// for status, date and title; the generator never invents any of them.
const indexPath = path.join(repoRoot, "docs", "index.html");
const indexText = fs.readFileSync(indexPath, "utf8");
const newestItem = indexText.match(/<li class="clog-item"([^>]*)>([\s\S]*?)<\/li>/);
if (!newestItem) die("docs/index.html has no .clog-item entries — the #changelog markup changed");

const status = newestItem[1].match(/\bdata-status="([^"]+)"/)?.[1] ?? "released";
if (status !== "prepared" && status !== "released") die(`unsupported newest entry data-status ${JSON.stringify(status)}`);
const entryDate = newestItem[2].match(/class="clog-date">(\d{4}-\d{2}-\d{2})</)?.[1];
if (!entryDate) die("newest changelog entry has no YYYY-MM-DD .clog-date");
const title = newestItem[2].match(/class="clog-title">([^<]+)</)?.[1]?.trim();
if (!title) die("newest changelog entry has no .clog-title");

// The commit the stamp cites: git decides it for a prepared entry, the entry's
// own landing hash decides it for a released one.
let stamp;
if (status === "prepared") {
  git("rev-parse", "--verify", "--quiet", "origin/main^{commit}");
  stamp = git("rev-parse", "--short=7", git("merge-base", "HEAD", "origin/main"));
} else {
  stamp = newestItem[2].match(/class="clog-hash"[^>]*>([0-9a-f]{7,40})</)?.[1];
  if (!stamp) die("newest changelog entry is released but carries no .clog-hash landing commit");
}

const [year, month, day] = entryDate.split("-").map(Number);
const shortDate = `${MONTHS_SHORT[month - 1]} ${day}`;
const longDate = `${MONTHS_LONG[month - 1]} ${day}, ${year}`;
const statusWord = status === "prepared" ? "Prepared" : "Released";
// The aria-label reads as a sentence, so the title needs terminal punctuation —
// but only if it does not already end in some.
const spokenTitle = /[.!?]$/.test(title) ? title : `${title}.`;
const citation = status === "prepared" ? `base ${stamp}` : stamp;

// Every rewrite is anchored on markup that must already exist. A silently
// unmatched replace would leave a page stale while the run reported success,
// so each one asserts it changed exactly the region it aimed at.
const edits = [];
function rewrite(file, label, pattern, replacer) {
  const matches = [...file.text.matchAll(new RegExp(pattern, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`))];
  if (matches.length !== 1) {
    die(`${file.relative}: expected exactly one ${label}, found ${matches.length} — the markup changed`);
  }
  file.text = file.text.replace(pattern, replacer);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function loadPage(relative) {
  const absolute = path.join(repoRoot, relative);
  return { relative, absolute, text: fs.readFileSync(absolute, "utf8"), original: fs.readFileSync(absolute, "utf8") };
}

const pages = ["docs/index.html", "docs/skills/index.html", "docs/guide.html"].map(loadPage);

// 1. The changelog entry's own base anchor, on the homepage only.
if (status === "prepared") {
  const home = pages[0];
  rewrite(
    home,
    'prepared .clog-base anchor',
    /(<a class="clog-hash clog-base" href="[^"]*\/commit\/)[0-9a-f]{7,40}("[^>]*aria-label="View base commit )[0-9a-f]{7,40}( on GitHub">base )[0-9a-f]{7,40}(<\/a>)/,
    (_, hrefLead, ariaLead, textLead, tail) => `${hrefLead}${stamp}${ariaLead}${stamp}${textLead}${stamp}${tail}`
  );
}

// 2. The tiny card on all three pages. Its aria-label tail differs per page
//    ("Jump to the full changelog." / "Jump to the changelog." / "Read the full
//    changelog on the homepage."), so only the sentence carrying the stamp is
//    rewritten and the tail is preserved.
for (const page of pages) {
  rewrite(
    page,
    'hero-shiplog data-status',
    /(<a id="hero-shiplog"[^>]*?\bdata-status=")[^"]*(")/,
    (_, lead, tail) => `${lead}${status}${tail}`
  );
  // Anchored on the title the card currently shows, not on the first ". " in
  // the label: each page ends the label with its own sentence ("Jump to the
  // full changelog.", "Read the full changelog on the homepage."), and a title
  // containing a period would otherwise cut the match short and leave a
  // mangled label behind. Requiring the exact previous title also means a card
  // whose label and heading have already drifted apart fails loudly here
  // instead of being half-rewritten.
  const previousTitle = page.text.match(/class="hero-shiplog-title">([^<]*)</)?.[1] ?? "";
  rewrite(
    page,
    'hero-shiplog aria-label',
    new RegExp(`(<a id="hero-shiplog"[^>]*\\baria-label=")Ship log\\. (?:Prepared|Released) entry [^:]*: ${escapeRegExp(previousTitle)}\\.?`),
    (_, lead) => `${lead}Ship log. ${statusWord} entry ${longDate}: ${spokenTitle}`
  );
  rewrite(
    page,
    'hero-shiplog-top line',
    /(<span class="hero-shiplog-top">)(?:Released|Prepared) [A-Z][a-z]{2} \d{1,2} <b>&middot; (?:base )?[0-9a-f]{7,40}(<\/b>)/,
    (_, lead, tail) => `${lead}${statusWord} ${shortDate} <b>&middot; ${citation}${tail}`
  );
  rewrite(
    page,
    'hero-shiplog-title line',
    /(<span class="hero-shiplog-title">)[^<]*(<\/span>)/,
    (_, lead, tail) => `${lead}${title}${tail}`
  );
  if (page.text !== page.original) edits.push(page);
}

if (checkOnly) {
  if (edits.length === 0) {
    console.log(`Ship-log stamp is current: ${statusWord} ${shortDate} · ${citation}.`);
    process.exit(0);
  }
  console.error(`build-shiplog --check: the ship-log stamp is not current in ${edits.map((p) => p.relative).join(", ")}.`);
  console.error(`Expected ${statusWord} ${shortDate} · ${citation}. Run \`npm run build:shiplog\`.`);
  // Deliberately stricter than CI. `npm run validate` only asks whether the
  // stamp has fallen badly behind; this asks whether it is exactly current,
  // which is a release-prep question. A non-zero exit here is a prompt to
  // refresh, not a broken build, which is why it is not wired into validate.
  process.exit(1);
}

for (const page of edits) fs.writeFileSync(page.absolute, page.text);
if (edits.length === 0) {
  console.log(`Ship-log stamp already current: ${statusWord} ${shortDate} · ${citation}.`);
} else {
  console.log(`Ship-log stamp set to ${statusWord} ${shortDate} · ${citation} in ${edits.map((p) => p.relative).join(", ")}.`);
}
