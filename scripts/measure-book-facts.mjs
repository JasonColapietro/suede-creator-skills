#!/usr/bin/env node
// Print every measurement the book states about the pack, recomputed from disk.
// Run this before editing a stated number in book/, and paste the output into
// the pull request so the old -> new pairs are on the record.
//
//   node scripts/measure-book-facts.mjs            human-readable
//   node scripts/measure-book-facts.mjs --json     machine-readable
//   node scripts/measure-book-facts.mjs --skills <dir>   measure another tree
//
// Measuring a checked-out historical tree is how the definitions in
// scripts/lib/book-facts.mjs were verified against the figures the book
// shipped with. See that file's header.

import path from "node:path";
import { measureBookFacts, measureSkillFile, repoRoot } from "./lib/book-facts.mjs";

const argv = process.argv.slice(2);
const skillsArg = argv.indexOf("--skills");
const skillsDir = skillsArg === -1 ? path.join(repoRoot, "skills") : path.resolve(argv[skillsArg + 1]);

const facts = measureBookFacts({ skillsDir });
const grader = measureSkillFile("suede-code-grader", { skillsDir });

if (argv.includes("--json")) {
  console.log(JSON.stringify({ ...facts, names: undefined, suedeCodeGrader: { lines: grader.lines, descriptionCharacters: grader.descriptionCharacters } }, null, 2));
  process.exit(0);
}

const n = (value) => value.toLocaleString("en-US");
const rows = [
  ["skills/*/SKILL.md files", n(facts.skillCount)],
  ["total bytes of those files", n(facts.totalBytes)],
  ["body bytes (frontmatter excluded)", n(facts.bodyBytes)],
  ["description bytes (resident catalog)", n(facts.descriptionBytes)],
  ["corpus / descriptions", `${facts.corpusToDescriptionRatio}x`],
  ["descriptions ending in NOT FOR:", n(facts.notForColonCount)],
  ["descriptions ending in a NOT FOR clause", n(facts.notForAnyCaseCount)],
  ["frontmatter with a metadata block", n(facts.metadataBlocks)],
  ["pairwise routing collisions", n(facts.pairwiseCollisions)],
  ["skills adapted from marketingskills", n(facts.marketingAdapted)],
  ["suede-code-grader SKILL.md lines", n(grader.lines)],
  ["suede-code-grader description chars", n(grader.descriptionCharacters)],
];

const width = Math.max(...rows.map(([label]) => label.length));
for (const [label, value] of rows) console.log(`${label.padEnd(width)}  ${value}`);

if (facts.notForAnyCaseCount !== facts.notForColonCount) {
  const colonless = facts.notForAnyCaseCount - facts.notForColonCount;
  console.log(`\n${colonless} description(s) close with the marker but no colon, so they count in the second NOT FOR row and not the first.`);
}
if (facts.withoutNotFor.length > 0) {
  console.log(`\nNo NOT FOR clause: ${facts.withoutNotFor.join(", ")}`);
}
