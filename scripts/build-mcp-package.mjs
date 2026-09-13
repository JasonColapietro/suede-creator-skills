#!/usr/bin/env node
// Build the publishable `suede-skills-mcp` npm package into dist-npm/.
//
// The server resolves catalog.json from its own directory and skill bodies from
// ../skills, so the published tree mirrors the repo layout exactly rather than
// flattening it. Run `--check` in CI to fail on a stale or unbuildable package.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "dist-npm");

const MCP_NAME = "io.github.JasonColapietro/suede-skills-mcp";
const PKG_NAME = "suede-skills-mcp";
const REPO = "https://github.com/JasonColapietro/suede-creator-skills";

const check = process.argv.includes("--check");
const version = fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim();

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function buildPackageJson() {
  return {
    name: PKG_NAME,
    version,
    // Consumed by the MCP registry to prove this npm package belongs to the
    // io.github.JasonColapietro namespace. Must match server.json `name`.
    mcpName: MCP_NAME,
    description:
      "Read-only MCP server for Suede skills — discovery, install options, SEO/AEO/AI EO copy audits, visibility and code grading, and QA checklists.",
    type: "module",
    license: "MIT",
    author: "Jason Colapietro",
    homepage: `${REPO}#readme`,
    repository: { type: "git", url: `git+${REPO}.git`, directory: "mcp" },
    bugs: { url: `${REPO}/issues` },
    keywords: ["mcp", "modelcontextprotocol", "claude", "codex", "agent-skills", "suede"],
    engines: { node: ">=22" },
    bin: { [PKG_NAME]: "mcp/suede-skills-mcp.mjs" },
    files: ["mcp/", "skills/", "README.md", "LICENSE"],
  };
}

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  copyFile(path.join(ROOT, "mcp", "suede-skills-mcp.mjs"), path.join(OUT, "mcp", "suede-skills-mcp.mjs"));
  fs.chmodSync(path.join(OUT, "mcp", "suede-skills-mcp.mjs"), 0o755);
  copyFile(path.join(ROOT, "mcp", "catalog.json"), path.join(OUT, "mcp", "catalog.json"));
  copyFile(path.join(ROOT, "mcp", "README.md"), path.join(OUT, "README.md"));
  copyFile(path.join(ROOT, "LICENSE"), path.join(OUT, "LICENSE"));

  const skillsDir = path.join(ROOT, "skills");
  let skillCount = 0;
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const body = path.join(skillsDir, entry.name, "SKILL.md");
    if (!fs.existsSync(body)) continue;
    copyFile(body, path.join(OUT, "skills", entry.name, "SKILL.md"));
    skillCount += 1;
  }

  fs.writeFileSync(path.join(OUT, "package.json"), `${JSON.stringify(buildPackageJson(), null, 2)}\n`);
  return skillCount;
}

const skillCount = build();

// The catalog is the server's source of truth for discovery; a published tree
// missing skill bodies would list skills it cannot read.
const catalog = JSON.parse(fs.readFileSync(path.join(OUT, "mcp", "catalog.json"), "utf8"));
const catalogSkills = Array.isArray(catalog.skills) ? catalog.skills.length : null;
if (catalogSkills !== null && catalogSkills !== skillCount) {
  console.error(`Catalog lists ${catalogSkills} skills but ${skillCount} SKILL.md bodies were packaged.`);
  process.exit(1);
}

if (check) {
  const pkg = JSON.parse(fs.readFileSync(path.join(OUT, "package.json"), "utf8"));
  if (pkg.version !== version) {
    console.error(`dist-npm version ${pkg.version} does not match VERSION ${version}.`);
    process.exit(1);
  }
  if (pkg.mcpName !== MCP_NAME) {
    console.error(`dist-npm mcpName ${pkg.mcpName} does not match ${MCP_NAME}.`);
    process.exit(1);
  }
}

console.log(`Built ${PKG_NAME}@${version} into dist-npm/ (${skillCount} skill bodies).`);
