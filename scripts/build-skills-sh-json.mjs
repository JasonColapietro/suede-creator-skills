#!/usr/bin/env node
// Generates the repo-root skills.sh.json: the cross-ecosystem grouping sidecar
// (https://skills.sh/schemas/skills.sh.schema.json) that gives this repo real
// section titles instead of tag-derived guesses on two surfaces at once —
// the skills.sh repo page, and the Hermes Agent Skills Hub, which fetches
// skills.sh.json from the root of any GitHub tap it indexes
// (tools/skills_hub_github.py::_get_skillsh_groupings in NousResearch/hermes-agent)
// and flattens {"groupings": [{title, skills}]} to {skill name: category pill}.
//
// Source of truth is mcp/catalog.json, the same partition the site catalog
// renders: one grouping per lane, ordered by specialty then lane. Typing the
// groups by hand would be a second copy of the partition, and second copies
// drift.
//
// Usage:
//   node scripts/build-skills-sh-json.mjs          # write skills.sh.json
//   node scripts/build-skills-sh-json.mjs --check  # exit 1 if it would change
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = path.join(repoRoot, "skills");
const outPath = path.join(repoRoot, "skills.sh.json");
const checkOnly = process.argv.includes("--check");

const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, "mcp", "catalog.json"), "utf8"));
const fail = [];

// Lane labels become the section title and the Hermes category pill, so a label
// reused under two specialties would silently merge two lanes into one pill.
const laneOwner = new Map();
for (const specialty of catalog.specialties) {
  for (const lane of specialty.lanes) {
    if (laneOwner.has(lane.label)) {
      fail.push(
        `Lane label "${lane.label}" appears under both ${laneOwner.get(lane.label).key} and ` +
          `${specialty.key}; titles must be unique or the two lanes share one category pill`
      );
      continue;
    }
    laneOwner.set(lane.label, specialty);
  }
}

// Catalog order, not alphabetical: the site renders the same sequence.
const members = new Map([...laneOwner.keys()].map((label) => [label, []]));
for (const skill of catalog.skills) {
  const specialty = catalog.specialties.find((entry) => entry.key === skill.specialty);
  if (!specialty) {
    fail.push(`Skill ${skill.name} names specialty "${skill.specialty}", which the catalog does not define`);
    continue;
  }
  if (!members.has(skill.lane)) {
    fail.push(`Skill ${skill.name} names lane "${skill.lane}", which no specialty declares`);
    continue;
  }
  if (laneOwner.get(skill.lane) !== specialty) {
    fail.push(
      `Skill ${skill.name} is in specialty ${specialty.key} but lane "${skill.lane}" belongs to ` +
        `${laneOwner.get(skill.lane).key}`
    );
    continue;
  }
  members.get(skill.lane).push(skill.name);
}

// A skill missing from the sidecar still installs; it just falls into the
// ungrouped tail with no category. Missing means the catalog is wrong, so fail.
const onDisk = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !entry.name.startsWith("_"))
  .map((entry) => entry.name)
  .sort();
const grouped = [...members.values()].flat();
const missing = onDisk.filter((name) => !grouped.includes(name));
const unknown = grouped.filter((name) => !onDisk.includes(name));
if (missing.length) fail.push(`Skills absent from every grouping: ${missing.join(", ")}`);
if (unknown.length) fail.push(`Groupings name skills that do not exist: ${unknown.join(", ")}`);
for (const [label, names] of members) {
  if (!names.length) fail.push(`Lane "${label}" has no skills; skills.sh rejects an empty group`);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length) fail.push(`Lane "${label}" lists ${duplicates.join(", ")} more than once`);
}
for (const specialty of catalog.specialties) {
  for (const lane of specialty.lanes) {
    const actual = members.get(lane.label)?.length ?? 0;
    if (actual !== lane.count) {
      fail.push(`Lane "${lane.label}" holds ${actual} skills but catalog.specialties says ${lane.count}`);
    }
  }
}

if (fail.length) {
  console.error("skills.sh.json cannot be generated from mcp/catalog.json:");
  for (const line of fail) console.error(`  - ${line}`);
  process.exit(1);
}

const payload = {
  $schema: "https://skills.sh/schemas/skills.sh.schema.json",
  notGrouped: "bottom",
  groupings: [...members].map(([label, names]) => ({
    title: label,
    description: `${laneOwner.get(label).label}: ${laneOwner.get(label).summary}`,
    skills: names,
  })),
};
const serialized = `${JSON.stringify(payload, null, 2)}\n`;

if (checkOnly) {
  const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : "";
  if (current !== serialized) {
    console.error("skills.sh.json is stale — run: node scripts/build-skills-sh-json.mjs");
    process.exit(1);
  }
  console.log(
    `skills.sh.json is current — ${payload.groupings.length} groupings covering ${grouped.length} skills.`
  );
} else {
  fs.writeFileSync(outPath, serialized);
  console.log(
    `skills.sh.json written — ${payload.groupings.length} groupings covering ${grouped.length} skills.`
  );
}
