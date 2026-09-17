// The pack is installable on Hermes Agent (Nous Research) as a GitHub tap:
//
//   hermes skills tap add JasonColapietro/suede-creator-skills
//   hermes skills install JasonColapietro/suede-creator-skills/skills/<name>
//
// Nothing in the Hermes toolchain runs in this repo's CI, so the tap contract
// is unenforced unless these assertions hold it. Each one mirrors a rule in
// NousResearch/hermes-agent that fails quietly rather than loudly:
//
// - tools/skills_hub_github.py::_list_skills_in_repo skips any directory whose
//   name starts with "." or "_", and probes every other one for SKILL.md. A
//   skill with no SKILL.md is simply absent from the hub listing.
// - tools/skills_hub_models.py::_parse_frontmatter returns {} for frontmatter
//   that does not start at byte 0 or does not close with a "---" line, and an
//   entry with no name/description is dropped from search results.
// - The install slug is the DIRECTORY name, while _list_skills_in_repo looks up
//   the category pill by the frontmatter name first. A mismatch installs fine
//   and loses its grouping.
// - tools/skills_hub_github.py::_collect_tree_files rejects the whole bundle on
//   a symlinked file, and _skip_bundle_file drops dotfiles from it.
// - _get_skillsh_groupings reads skills.sh.json from the repo root and flattens
//   it first-grouping-wins, so a skill listed twice takes the earlier title.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(ROOT, "skills");

// Hermes' own frontmatter gate: content starts with "---" and the block closes
// on a line that is "---" plus optional trailing whitespace.
function hermesFrontmatterBlock(content) {
  if (!content.startsWith("---")) return null;
  const match = /\n---[ \t]*\n/.exec(content.slice(3));
  return match ? content.slice(3, match.index + 3) : null;
}

function scalar(block, key) {
  const match = new RegExp(`^${key}:[ \\t]*(.+)$`, "m").exec(block);
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, "");
}

const tapDirs = fs
  .readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

test("every skill directory is visible to a Hermes tap listing", () => {
  const hidden = tapDirs.filter((name) => name.startsWith(".") || name.startsWith("_"));
  assert.deepEqual(hidden, [], "Hermes skips skill directories that start with . or _");
  const noSkillMd = tapDirs.filter((name) => !fs.existsSync(path.join(SKILLS_DIR, name, "SKILL.md")));
  assert.deepEqual(noSkillMd, [], "a directory under skills/ without SKILL.md is invisible in the hub");
  assert.ok(tapDirs.length > 0, "the tap path skills/ must not be empty");
});

test("every SKILL.md parses under Hermes' frontmatter rule with a name and description", () => {
  const broken = [];
  for (const name of tapDirs) {
    const content = fs.readFileSync(path.join(SKILLS_DIR, name, "SKILL.md"), "utf8");
    const block = hermesFrontmatterBlock(content);
    if (block === null) {
      broken.push(`${name}: frontmatter does not start at byte 0 or never closes`);
      continue;
    }
    if (!scalar(block, "name")) broken.push(`${name}: no name in frontmatter`);
    if (!scalar(block, "description")) broken.push(`${name}: no description in frontmatter`);
  }
  assert.deepEqual(broken, []);
});

test("frontmatter name matches the directory name, so the category pill resolves", () => {
  const mismatched = [];
  for (const dir of tapDirs) {
    const block = hermesFrontmatterBlock(fs.readFileSync(path.join(SKILLS_DIR, dir, "SKILL.md"), "utf8"));
    const declared = block && scalar(block, "name");
    if (declared !== dir) mismatched.push(`${dir}: frontmatter name is ${declared}`);
  }
  assert.deepEqual(mismatched, []);
});

test("no symlink or dotfile ships inside a skill bundle", () => {
  const symlinks = [];
  const dotfiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        symlinks.push(path.relative(ROOT, full));
      } else if (entry.isDirectory()) {
        if (entry.name.startsWith(".")) dotfiles.push(path.relative(ROOT, full));
        else walk(full);
      } else if (entry.name.startsWith(".")) {
        dotfiles.push(path.relative(ROOT, full));
      }
    }
  };
  walk(SKILLS_DIR);
  assert.deepEqual(symlinks, [], "a symlink under skills/ makes Hermes reject the whole bundle");
  assert.deepEqual(dotfiles, [], "Hermes drops dotfiles from a bundle, so a skill must not depend on one");
});

test("skills.sh.json groups every skill exactly once under a schema-legal title", () => {
  const sidecar = JSON.parse(fs.readFileSync(path.join(ROOT, "skills.sh.json"), "utf8"));
  assert.ok(Array.isArray(sidecar.groupings) && sidecar.groupings.length > 0);
  assert.ok(sidecar.groupings.length <= 50, "the skills.sh schema caps groupings at 50");

  const seen = new Map();
  for (const group of sidecar.groupings) {
    assert.equal(typeof group.title, "string");
    assert.ok(group.title.length > 0 && group.title.length <= 120, `illegal title: ${group.title}`);
    assert.ok(Array.isArray(group.skills) && group.skills.length > 0, `empty group: ${group.title}`);
    if (group.description !== undefined) {
      assert.ok(group.description.length <= 500, `description over 500 chars: ${group.title}`);
    }
    for (const name of group.skills) {
      assert.ok(!seen.has(name), `${name} is grouped twice (${seen.get(name)} wins in Hermes)`);
      seen.set(name, group.title);
    }
  }
  assert.deepEqual([...seen.keys()].sort(), tapDirs, "every installable skill needs exactly one grouping");
});
