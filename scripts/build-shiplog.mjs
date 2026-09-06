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
// It also writes the commit-activity series -- the advertised commit count, the
// week span, and the sparkline bars -- everywhere the page repeats it, which is
// more places than the stamp: the three hero cards, the #changelog chart with
// its caption and its spoken aria-label, and both marquee copies of the
// #proof-tape claim. Those were hand-copied numbers with no common source, so
// they did not merely go stale together, they disagreed. See the block below.
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

const [, month, day] = entryDate.split("-").map(Number);
const shortDate = `${MONTHS_SHORT[month - 1]} ${day}`;
const statusWord = status === "prepared" ? "Prepared" : "Released";
const citation = status === "prepared" ? `base ${stamp}` : stamp;

// ---- Commit activity -------------------------------------------------------
// The advertised commit count, the week span, and the sparkline bars above them
// are one measurement -- not three numbers that happen to sit near each other.
// Hand-copied, they did not just go stale, they disagreed: the cards read
// "282 commits, 10 weeks" against a repo that had shipped 308 over 14, and the
// ten bars had been fitted to that caption by dropping the three quiet opening
// weeks and adding their six commits onto the newest bar so the aria-label
// would still sum to 282. A chart contradicting its own label is the failure
// this section removes -- bars, count and span now leave one function together
// or not at all.
const HISTORY_REF = ["origin/main", "main", "HEAD"].find((ref) =>
  spawnSync("git", ["-C", repoRoot, "rev-parse", "--verify", "--quiet", `${ref}^{commit}`], { stdio: "ignore" }).status === 0
);
if (!HISTORY_REF) die("no origin/main, main or HEAD to measure commit activity from");

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen", "twenty"
];

function measureCommitActivity(ref) {
  const log = git("log", "--reverse", "--pretty=format:%cI", ref);
  const stamps = log ? log.split("\n") : [];
  if (stamps.length === 0) die(`${ref} has no commits to measure`);
  // Bucket on the commit's own calendar date -- the date `git log --date=short`
  // prints. Parsing to a timestamp first would re-bin every commit by UTC and
  // walk evening commits west of Greenwich into the following week.
  const dayOf = (iso) => {
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    return Date.UTC(y, m - 1, d) / 86400000;
  };
  const days = stamps.map(dayOf);
  const newest = days[days.length - 1];
  const weeks = Math.floor((newest - days[0]) / 7) + 1;
  const perWeek = new Array(weeks).fill(0);
  // Seven-day windows counted back from the newest commit, so the last bar is
  // always the current week and the partial window is the oldest one.
  for (const day of days) perWeek[weeks - 1 - Math.floor((newest - day) / 7)] += 1;
  const busiest = Math.max(...perWeek);
  return {
    total: stamps.length,
    weeks,
    perWeek,
    // Normalized to the busiest week, so the tallest bar is always full height
    // and the shape reads the same whatever the absolute volume. A quiet week
    // can round to 0; CSS min-height still draws it as a stub, which is the
    // honest mark for "nothing shipped".
    heights: perWeek.map((n) => Math.round((n / busiest) * 100))
  };
}

const activity = measureCommitActivity(HISTORY_REF);
const activityLine = `${activity.total} commits &middot; ${activity.weeks} weeks`;

function sparkAriaLabel() {
  const counts = activity.perWeek;
  const list = counts.length === 1
    ? `${counts[0]}`
    : `${counts.slice(0, -1).join(", ")}, and ${counts[counts.length - 1]}`;
  const span = NUMBER_WORDS[activity.weeks] ?? String(activity.weeks);
  return `Commit activity per week over the last ${span} weeks, oldest to newest: ${list} commits.`;
}

// Rewrites a bar column that sits between an opening tag on its own line and a
// closing tag on its own line, reusing whatever indentation the first existing
// bar carries -- the three pages nest this markup at three different depths.
function rewriteBars(page, label, pattern) {
  rewrite(page, label, pattern, (_, open, body, close) => {
    const indent = body.match(/^[ \t]*/)?.[0] ?? "";
    const bars = activity.heights.map((height) => `${indent}<span style="height:${height}%"></span>`);
    return `${open}${bars.join("\n")}${close}`;
  });
}

// Every rewrite is anchored on markup that must already exist. A silently
// unmatched replace would leave a page stale while the run reported success,
// so each one asserts it changed exactly the region it aimed at.
const edits = [];
// `expected` is the number of copies the markup is known to carry. It is almost
// always one, but the proof-tape marquee duplicates its whole track so the strip
// can scroll seamlessly, and both copies state the claim. Asserting the count
// rather than replacing blindly is what makes a markup change fail loudly here
// instead of leaving one copy of a number silently behind.
function rewrite(file, label, pattern, replacer, expected = 1) {
  const global = new RegExp(pattern, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  const matches = [...file.text.matchAll(global)];
  if (matches.length !== expected) {
    die(`${file.relative}: expected exactly ${expected === 1 ? "one" : expected} ${label}, found ${matches.length} — the markup changed`);
  }
  file.text = file.text.replace(global, replacer);
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

// 2. The commit-activity sparkline and its caption, on the homepage only. The
//    aria-label restates the same series in words for screen readers, so it is
//    regenerated from the same numbers instead of being left to hand-editing --
//    it was the surface that had drifted furthest.
{
  const home = pages[0];
  rewriteBars(home, 'clog-spark bar column', /(<div class="clog-spark[^>]*>\n)([\s\S]*?)(\n[ \t]*<\/div>)/);
  rewrite(
    home,
    'clog-spark aria-label',
    /(<div class="clog-spark[^"]*"[^>]*\baria-label=")[^"]*(")/,
    (_, lead, tail) => `${lead}${sparkAriaLabel()}${tail}`
  );
  rewrite(
    home,
    'clog-spark caption',
    /(<p class="clog-spark-caption[^"]*">)\d+ commits &middot; \d+ weeks( &middot; [^<]*<\/p>)/,
    (_, lead, tail) => `${lead}${activityLine}${tail}`
  );
  // The #proof-tape strip states the same claim again, in its own wording, and
  // promises in a comment above itself that every number on it is sourced from
  // further down the page. It was the surface that gave this away: it still read
  // "282 commits in 10 weeks" with nothing on the page left to source it.
  rewrite(
    home,
    'proof-tape commit claim',
    /(<li><b>)\d+(<\/b> commits in )\d+( weeks<\/li>)/,
    (_, lead, middle, tail) => `${lead}${activity.total}${middle}${activity.weeks}${tail}`,
    2
  );
  // The strip also tallies the changelog itself ("N changelog entries: L landed
  // + P prepared"). That line was hand-copied and went stale on every release
  // (the 0.17.0 entry turned CI red), so it is now counted from the entries on
  // this page: every .clog-item, and how many of them carry data-status="prepared".
  const entryTotal = (home.text.match(/class="clog-item"/g) || []).length;
  const entryPrepared = (home.text.match(/class="clog-item"[^>]*data-status="prepared"/g) || []).length;
  rewrite(
    home,
    "proof-tape changelog tally",
    /(<li><b>)\d+(<\/b> changelog entries: )\d+( landed \+ )\d+( prepared<\/li>)/,
    (_, lead, middle, plus, tail) => `${lead}${entryTotal}${middle}${entryTotal - entryPrepared}${plus}${entryPrepared}${tail}`,
    2
  );
}

// 3. The tiny card on all three pages. The card is one link, so its accessible
//    name has to CONTAIN the text a sighted reader sees. It did not: the label
//    named the entry and its date and stopped, while the card on screen also
//    carries the landing commit and the commit count, so a screen reader was
//    handed different facts than the page shows and Lighthouse failed the page
//    on `label-content-name-mismatch`. The label is therefore composed from the
//    card's own rendered lines instead of being written a second time in other
//    words, which makes the two unable to drift rather than merely checked for
//    drift. Only the closing call to action is written per page.
const SHIPLOG_TAIL = {
  "docs/index.html": "Jump to the full changelog.",
  "docs/skills/index.html": "Jump to the changelog.",
  "docs/guide.html": "Read the full changelog on the homepage."
};

// The card's three visible lines, in the order a reader meets them, with the
// markup inside them (the <b> around the commit) flattened to a space the way a
// browser flattens it when it works out the element's text.
function spokenCard(page) {
  const card = page.text.match(/<a id="hero-shiplog"[\s\S]*?<\/a>/);
  if (!card) die(`${page.relative}: no #hero-shiplog card to read back`);
  return ["top", "title", "more"]
    .map((line) => {
      const shown = card[0].match(new RegExp(`class="hero-shiplog-${line}">([\\s\\S]*?)<\\/span>`));
      if (!shown) die(`${page.relative}: #hero-shiplog card has no .hero-shiplog-${line} line`);
      return shown[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    })
    .join(" ");
}

for (const page of pages) {
  rewrite(
    page,
    'hero-shiplog data-status',
    /(<a id="hero-shiplog"[^>]*?\bdata-status=")[^"]*(")/,
    (_, lead, tail) => `${lead}${status}${tail}`
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
  rewriteBars(page, 'hero-spark bar column', /(<span class="hero-spark"[^>]*>\n)([\s\S]*?)(\n[ \t]*<\/span>)/);
  // The trailing call to action differs per page, so only the two numbers move.
  rewrite(
    page,
    'hero-shiplog-more line',
    /(<span class="hero-shiplog-more">)\d+ commits &middot; \d+ weeks( &middot; [^<]*<\/span>)/,
    (_, lead, tail) => `${lead}${activityLine}${tail}`
  );
  // Last, so it reads back lines that are already current. Replacing the whole
  // attribute rather than one sentence inside it is what keeps the spoken name
  // from carrying a hash or a count the rewrites above have just moved on.
  const closing = SHIPLOG_TAIL[page.relative];
  if (!closing) die(`${page.relative}: no ship-log call to action registered for this page`);
  rewrite(
    page,
    'hero-shiplog aria-label',
    /(<a id="hero-shiplog"[^>]*\baria-label=")[^"]*(")/,
    (_, lead, close) => `${lead}Ship log. ${spokenCard(page)}. ${closing}${close}`
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
