#!/usr/bin/env node
// Every measurement the book states about the pack itself, recomputed from
// skills/ and NOTICE.md. The book quotes byte totals and clause counts in
// prose; those went stale when the pack moved 71 -> 73 and nothing recomputed
// them, so the numbers now come from here and are guarded by
// scripts/validate-skill-pack.mjs.
//
// The definitions below are not invented. Each one was reverse-engineered from
// the figures the book shipped with and reproduces them exactly against
// commit da4ce97, the 71-skill tree the author measured:
//
//   totalBytes        1,079,688   sum of every skills/*/SKILL.md on disk
//   descriptionBytes     28,469   the description: block, key and newline included
//   metadataBlocks           38   frontmatter carrying a metadata: key
//
// Keep them stable. A changed definition silently rewrites history in the
// prose, which is the failure this module exists to prevent.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
// The description block runs from the key to the next top-level key or the end
// of the frontmatter, so a folded or wrapped description counts every line.
const DESCRIPTION_BLOCK_RE = /^description:[ \t]*[\s\S]*?(?=\n[A-Za-z_][A-Za-z0-9_-]*:|$)/m;

function readSkillDirs(skillsDir) {
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(skillsDir, name, "SKILL.md")))
    .sort();
}

// "Ends with a NOT FOR: clause" means the marker opens the final sentence of
// the description: everything after it is the clause. A marker buried
// mid-description would be a different thing, so check the tail explicitly.
function endsWithNotFor(description, marker) {
  const at = description.lastIndexOf(marker);
  if (at === -1) return false;
  const tail = description.slice(at + marker.length);
  // A sentence break followed by a new capitalized sentence means the clause
  // closed and prose continued after it.
  return !/[.!?]\s+[A-Z]/.test(tail);
}

export function measureBookFacts({ skillsDir = path.join(repoRoot, "skills"), noticeFile = path.join(repoRoot, "NOTICE.md") } = {}) {
  const names = readSkillDirs(skillsDir);

  let totalBytes = 0;
  let bodyBytes = 0;
  let descriptionBytes = 0;
  let metadataBlocks = 0;
  const notForColon = [];
  const notForAnyCase = [];
  const withoutNotFor = [];

  for (const name of names) {
    const file = path.join(skillsDir, name, "SKILL.md");
    const buffer = fs.readFileSync(file);
    const text = buffer.toString("utf8");
    totalBytes += buffer.length;

    const frontmatter = text.match(FRONTMATTER_RE);
    if (!frontmatter) throw new Error(`${file} has no YAML frontmatter`);
    bodyBytes += Buffer.byteLength(text.slice(frontmatter[0].length), "utf8");
    if (/^metadata:/m.test(frontmatter[1])) metadataBlocks += 1;

    const block = frontmatter[1].match(DESCRIPTION_BLOCK_RE);
    if (!block) throw new Error(`${file} frontmatter has no description`);
    // Plus the newline the block regex stops short of: the description costs
    // the file its own line, and that is what the resident catalog carries.
    descriptionBytes += Buffer.byteLength(block[0], "utf8") + 1;

    const description = block[0].replace(/^description:[ \t]*/, "").trim().replace(/^["']|["']$/g, "");
    if (endsWithNotFor(description, "NOT FOR:")) notForColon.push(name);
    if (endsWithNotFor(description, "NOT FOR")) notForAnyCase.push(name);
    else withoutNotFor.push(name);
  }

  // The count NOTICE.md attributes to Corey Haines's marketingskills. Read from
  // the attribution list rather than its prose, so the two cannot disagree.
  let marketingAdapted = 0;
  if (fs.existsSync(noticeFile)) {
    const section = fs.readFileSync(noticeFile, "utf8").split(/^### Skills adapted from this source$/m)[1] ?? "";
    const listed = new Set((section.split(/^#{2,3} /m)[0].match(/`[a-z0-9][a-z0-9-]*`/g) ?? []).map((s) => s.replace(/`/g, "")));
    marketingAdapted = [...listed].filter((name) => names.includes(name)).length;
  }

  const skillCount = names.length;
  return {
    names,
    skillCount,
    totalBytes,
    bodyBytes,
    descriptionBytes,
    // How many times the whole corpus outweighs the descriptions that stay
    // resident. The book states this as an ordinal ("a twenty-fourth").
    corpusToDescriptionRatio: Math.round(totalBytes / descriptionBytes),
    metadataBlocks,
    notForColonCount: notForColon.length,
    notForAnyCaseCount: notForAnyCase.length,
    withoutNotFor,
    // Every unordered pair of skills the router has to tell apart.
    pairwiseCollisions: (skillCount * (skillCount - 1)) / 2,
    marketingAdapted,
  };
}

// A handful of the book's measurements are about one named file rather than the
// pack. Measured the same way, for the same reason.
export function measureSkillFile(name, { skillsDir = path.join(repoRoot, "skills") } = {}) {
  const text = fs.readFileSync(path.join(skillsDir, name, "SKILL.md"), "utf8");
  const frontmatter = text.match(FRONTMATTER_RE);
  const block = frontmatter[1].match(DESCRIPTION_BLOCK_RE);
  const description = block[0].replace(/^description:[ \t]*/, "").trim().replace(/^["']|["']$/g, "");
  return {
    name,
    lines: text.replace(/\n$/, "").split("\n").length,
    descriptionCharacters: description.length,
    description,
  };
}
