#!/usr/bin/env node
// Stage the pack into the PyPI project under pypi/ so `python3 -m build pypi/`
// produces the `suede-creator-skills` sdist and wheel.
//
// The Python package bundles every skills/<name>/ folder as package data,
// mcp/catalog.json for one-line summaries and specialties, and VERSION for the
// distribution version. LICENSE, NOTICE.md and licenses/ go beside
// pyproject.toml so they ship in both the sdist and the wheel (adapted
// components keep their upstream notices). Every staged copy is gitignored;
// the repo root stays the single source of truth.
//
// `--check` rebuilds the stage and fails when it disagrees with the source: a
// skill missing from the stage, a catalog entry with no folder, a VERSION
// mismatch, or a missing license file.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PROJECT = path.join(ROOT, "pypi");
const PKG = path.join(PROJECT, "src", "suede_creator_skills");
const DIST_NAME = "suede-creator-skills";

// Never staged into the package: interpreter caches and OS metadata.
const IGNORED = new Set(["__pycache__", ".DS_Store"]);

const check = process.argv.includes("--check");
const version = fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim();

// PEP 440 public versions only; PyPI rejects anything else at upload time.
if (!/^\d+(\.\d+)*((a|b|rc)\d+)?(\.post\d+)?(\.dev\d+)?$/.test(version)) {
  console.error(`VERSION "${version}" is not a PEP 440 public version, so PyPI would refuse it.`);
  process.exit(1);
}

function copyTree(from, to) {
  fs.cpSync(from, to, {
    recursive: true,
    filter: (source) => !IGNORED.has(path.basename(source)) && !source.endsWith(".pyc"),
  });
}

function listFiles(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, base, out);
    else out.push(path.relative(base, full));
  }
  return out.sort();
}

function digestTree(dir) {
  const hash = crypto.createHash("sha256");
  for (const rel of listFiles(dir)) {
    hash.update(rel.split(path.sep).join("/"));
    hash.update("\0");
    hash.update(fs.readFileSync(path.join(dir, rel)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function stage() {
  const skillsSource = path.join(ROOT, "skills");
  const skillsStage = path.join(PKG, "skills");
  fs.rmSync(skillsStage, { recursive: true, force: true });
  fs.mkdirSync(skillsStage, { recursive: true });

  const skills = [];
  for (const entry of fs.readdirSync(skillsSource, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    if (!fs.existsSync(path.join(skillsSource, entry.name, "SKILL.md"))) continue;
    copyTree(path.join(skillsSource, entry.name), path.join(skillsStage, entry.name));
    skills.push(entry.name);
  }

  fs.copyFileSync(path.join(ROOT, "mcp", "catalog.json"), path.join(PKG, "catalog.json"));
  fs.writeFileSync(path.join(PKG, "VERSION"), `${version}\n`);

  for (const file of ["LICENSE", "NOTICE.md"]) {
    fs.copyFileSync(path.join(ROOT, file), path.join(PROJECT, file));
  }
  fs.rmSync(path.join(PROJECT, "licenses"), { recursive: true, force: true });
  copyTree(path.join(ROOT, "licenses"), path.join(PROJECT, "licenses"));

  // A previous build's artifacts carry the previous version; drop them so
  // `twine check pypi/dist/*` and the publish step only ever see this build.
  fs.rmSync(path.join(PROJECT, "dist"), { recursive: true, force: true });
  fs.rmSync(path.join(PROJECT, "build"), { recursive: true, force: true });
  return skills;
}

const skills = stage();
const problems = [];

const catalog = JSON.parse(fs.readFileSync(path.join(PKG, "catalog.json"), "utf8"));
const catalogNames = (Array.isArray(catalog.skills) ? catalog.skills : []).map((s) => s.name).sort();
const missingFolders = catalogNames.filter((name) => !skills.includes(name));
const missingEntries = skills.filter((name) => !catalogNames.includes(name));
if (missingFolders.length) problems.push(`catalog lists skills with no staged folder: ${missingFolders.join(", ")}`);
if (missingEntries.length) problems.push(`staged skills missing from mcp/catalog.json: ${missingEntries.join(", ")}`);

if (check) {
  for (const name of skills) {
    const source = path.join(ROOT, "skills", name);
    const staged = path.join(PKG, "skills", name);
    const sourceFiles = listFiles(source).filter((rel) => !rel.split(path.sep).some((part) => IGNORED.has(part)) && !rel.endsWith(".pyc"));
    const stagedFiles = listFiles(staged);
    if (sourceFiles.join("\n") !== stagedFiles.join("\n")) problems.push(`staged ${name} does not mirror skills/${name}`);
  }
  const stagedVersion = fs.readFileSync(path.join(PKG, "VERSION"), "utf8").trim();
  if (stagedVersion !== version) problems.push(`staged VERSION ${stagedVersion} does not match ${version}`);
  for (const file of ["LICENSE", "NOTICE.md", "README.md", "pyproject.toml"]) {
    if (!fs.existsSync(path.join(PROJECT, file))) problems.push(`pypi/${file} is missing`);
  }
  if (digestTree(path.join(ROOT, "licenses")) !== digestTree(path.join(PROJECT, "licenses"))) {
    problems.push("pypi/licenses does not mirror licenses/");
  }
  const pyproject = fs.readFileSync(path.join(PROJECT, "pyproject.toml"), "utf8");
  if (!pyproject.includes(`name = "${DIST_NAME}"`)) problems.push(`pypi/pyproject.toml no longer names ${DIST_NAME}`);
  const readme = fs.readFileSync(path.join(PROJECT, "README.md"), "utf8");
  if (readme.includes("\u2014")) problems.push("pypi/README.md contains an em dash; house style bans them");
}

if (problems.length) {
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Staged ${DIST_NAME} ${version} into pypi/ (${skills.length} skill folders). Build with: python3 -m build pypi/`);
