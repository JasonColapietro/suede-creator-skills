#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { load: yamlLoad } = require("js-yaml");

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");

const fail = [];
const warn = [];

const internalPhrases = [
  "suede internal",
  "not for public",
  "private skill",
  "jason only",
  "do not distribute",
  "internal use only",
];

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function listDirs(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function extractNotForRedirects(text) {
  // A NOT FOR clause can name several redirect targets in one sentence,
  // separated by semicolons (e.g. "NOT FOR: X (use a); Y (use b)."). Find
  // the full clause span first (NOT FOR: up to the next ". "), then collect
  // every "(use X)" inside that span — anchoring per-match on a repeated
  // "NOT FOR:" would silently stop after the first redirect target.
  const matches = [];
  const clauseRe = /NOT FOR:([^.]*)\./g;
  let clauseMatch;
  while ((clauseMatch = clauseRe.exec(text)) !== null) {
    const useRe = /\(use ([a-z][a-z0-9-]+)(?: — private)?\)/g;
    let m;
    while ((m = useRe.exec(clauseMatch[1])) !== null) {
      matches.push({ name: m[1], private: m[0].includes(' — private') });
    }
  }
  return matches;
}

const allowedExternalSkills = new Set();

function frontmatterName(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const name = match[1].match(/^name:\s*("?)([^"\n]+)\1\s*$/m);
  return name ? name[2].trim() : null;
}

function frontmatterDescription(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const desc = match[1].match(/^description:\s*("?)([^"\n]+)\1\s*$/m);
  return desc ? desc[2].trim() : null;
}

function descriptionsDiffer(a, b) {
  const stopwords = new Set(["a","an","the","and","or","of","to","in","for","with","on","at","by","from","that","this","is","are","as","it","its","be","use","when","you","not","any"]);
  const words = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !stopwords.has(w)));
  const wa = words(a);
  const wb = words(b);
  if (wa.size === 0 || wb.size === 0) return false;
  const intersection = [...wa].filter((w) => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return intersection / union < 0.15;
}

// The skill loader parses frontmatter as strict YAML. The most common break is an
// unquoted plain scalar that contains a colon-space (e.g. `description: Runs here: then`)
// or a trailing colon — YAML reads those as a nested mapping and the load throws
// "mapping values are not allowed in this context". Catch that class before it ships.
function frontmatterYamlIssues(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return ["missing or malformed frontmatter block"];
  const issues = [];
  match[1].split("\n").forEach((line, i) => {
    if (!line.trim() || line.trimStart().startsWith("#")) return;
    const kv = line.match(/^([A-Za-z0-9_-]+):(?:\s(.*))?$/);
    if (!kv) {
      issues.push(`line ${i + 1}: not a "key: value" pair`);
      return;
    }
    const value = (kv[2] ?? "").trim();
    if (!value) return;
    const quoted =
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1);
    if (quoted) return;
    const colonSpace = line.indexOf(": ", line.indexOf(":") + 1);
    if (colonSpace !== -1) {
      issues.push(`line ${i + 1} col ${colonSpace + 1}: unquoted "${kv[1]}" value contains ': ' — wrap the value in double quotes`);
    } else if (value.endsWith(":")) {
      issues.push(`line ${i + 1}: unquoted "${kv[1]}" value ends with ':' — wrap the value in double quotes`);
    }
  });
  return issues;
}

function openaiYamlStructureIssues(text) {
  const issues = [];
  let parsed;
  try {
    parsed = yamlLoad(text);
  } catch (e) {
    return [`YAML parse error — ${e.message}`];
  }
  if (!parsed || typeof parsed !== "object") {
    issues.push('file does not parse as a YAML mapping');
    return issues;
  }
  if (!("interface" in parsed)) {
    issues.push('missing root "interface" key');
  } else if (parsed.interface === null || typeof parsed.interface !== "object") {
    issues.push('"interface" key is null or not a mapping');
  }
  for (const field of ["display_name", "short_description", "default_prompt", "brand_color"]) {
    if (field in parsed) {
      issues.push(`"${field}" is a root-level key — must be nested under "interface"`);
    }
  }
  return issues;
}


const skillsDir = path.join(repoRoot, "skills");
const skillNames = listDirs(skillsDir);
const catalog = JSON.parse(readText(path.join(repoRoot, "mcp", "catalog.json")));
const catalogSkillNames = [...catalog.skills.map((skill) => skill.name)].sort();

const versionFile = path.join(repoRoot, "VERSION");
if (!fs.existsSync(versionFile)) {
  fail.push("VERSION file missing — add a VERSION file whose content matches catalog.json version");
} else {
  const versionFileContent = readText(versionFile).trim();
  if (versionFileContent !== catalog.version) {
    fail.push(`VERSION file (${versionFileContent}) does not match catalog.json version (${catalog.version})`);
  }
}

const docsIndexText = readText(path.join(repoRoot, "docs", "skills", "index.html"));
const requiredDocsPages = new Set([
  "johnny-suede-design",
  "johnny-suede-write",
  "suede-release-linter",
  "suede-agent-teams",
  "suede-code-grader",
  "suede-rights-passport",
  "suede-visibility-grader",
  "suede-workflow-skills"
]);

for (const skillName of skillNames) {
  const skillDir = path.join(skillsDir, skillName);
  const skillFile = path.join(skillDir, "SKILL.md");
  const agentFile = path.join(skillDir, "agents", "openai.yaml");
  const docsFile = path.join(repoRoot, "docs", "skills", `${skillName}.html`);

  if (!fs.existsSync(skillFile)) {
    fail.push(`Missing SKILL.md for ${skillName}`);
    continue;
  }
  const skillText = readText(skillFile);
  const declaredName = frontmatterName(skillText);
  if (declaredName !== skillName) {
    fail.push(`Frontmatter name mismatch for ${skillName}: ${declaredName || "missing"}`);
  }
  for (const issue of frontmatterYamlIssues(skillText)) {
    fail.push(`Frontmatter YAML issue in ${skillName}: ${issue}`);
  }
  const bodyStart = skillText.indexOf('\n---\n', skillText.indexOf('---\n') + 4);
  const body = bodyStart !== -1 ? skillText.slice(bodyStart + 5).trim() : '';
  if (body.length < 50) {
    fail.push(`SKILL.md body is empty or near-empty for ${skillName} (${body.length} chars after frontmatter)`);
  }
  const skillFmDesc = frontmatterDescription(skillText);
  const catalogEntry = catalog.skills.find((s) => s.name === skillName);
  if (skillFmDesc && catalogEntry?.description && descriptionsDiffer(skillFmDesc, catalogEntry.description)) {
    warn.push(`Description drift in ${skillName}: SKILL.md frontmatter and catalog.json descriptions differ significantly`);
  }
  if (!skillFmDesc) {
    fail.push(`${skillName}: frontmatter description is missing`);
  } else {
    if (skillFmDesc.length < 20) {
      fail.push(`${skillName}: description too short (${skillFmDesc.length} chars, min 20)`);
    }
    const normDesc = skillFmDesc.toLowerCase();
    const normName = skillName.toLowerCase();
    if (normDesc === normName || normDesc === normName.replace(/-/g, " ")) {
      fail.push(`${skillName}: description is identical to skill name`);
    }
    for (const phrase of internalPhrases) {
      if (normDesc.includes(phrase)) {
        fail.push(`${skillName}: description contains internal phrase "${phrase}"`);
      }
    }
  }
  if (!fs.existsSync(agentFile)) {
    fail.push(`Missing agents/openai.yaml for ${skillName}`);
  } else {
    const agentText = readText(agentFile);
    let parsedAgent = null;
    try {
      parsedAgent = yamlLoad(agentText);
    } catch {
      // openaiYamlStructureIssues records the parse failure with the YAML error.
    }
    for (const issue of openaiYamlStructureIssues(agentText)) {
      fail.push(`${skillName} agents/openai.yaml: ${issue}`);
    }
    const sdMatch = agentText.match(/^\s*short_description:\s*"?([^"\n]+)"?\s*$/m);
    if (!sdMatch) {
      fail.push(`${skillName} agents/openai.yaml: missing interface.short_description`);
    } else {
      const sd = sdMatch[1].trim();
      if (sd.length < 25 || sd.length > 64) {
        fail.push(`${skillName} agents/openai.yaml: short_description length ${sd.length} outside 25-64 chars`);
      }
    }
    const ifaceDefaultPrompt = typeof parsedAgent?.interface?.default_prompt === "string"
      ? parsedAgent.interface.default_prompt
      : "";
    const rootDefaultPrompt = Boolean(parsedAgent && Object.hasOwn(parsedAgent, "default_prompt"));
    if (!ifaceDefaultPrompt.trim()) {
      if (rootDefaultPrompt) {
        fail.push(`${skillName} agents/openai.yaml: default_prompt at root level (should be nested under interface)`);
      } else {
        warn.push(`${skillName} agents/openai.yaml: interface.default_prompt is missing`);
      }
    } else {
      const camelName = skillName.replace(/-/g, "");
      if (!ifaceDefaultPrompt.includes(`$${skillName}`) && !ifaceDefaultPrompt.includes(`$${camelName}`)) {
        warn.push(`${skillName} agents/openai.yaml: interface.default_prompt does not reference $${skillName}`);
      }
    }
  }
  if (requiredDocsPages.has(skillName) && !fs.existsSync(docsFile)) {
    fail.push(`Missing required flagship docs/skills/${skillName}.html`);
  }
  if (!docsIndexText.includes(skillName)) {
    fail.push(`docs/skills/index.html does not mention ${skillName}`);
  }
  for (const redirect of extractNotForRedirects(skillText)) {
    if (!redirect.private && !skillNames.includes(redirect.name) && !allowedExternalSkills.has(redirect.name)) {
      fail.push(`NOT FOR redirect in ${skillName}: named skill ${redirect.name} does not exist in skill pack`);
    }
  }
}

const missingFromCatalog = skillNames.filter((name) => !catalogSkillNames.includes(name));
const missingFromFilesystem = catalogSkillNames.filter((name) => !skillNames.includes(name));
if (missingFromCatalog.length) fail.push(`Skills missing from catalog: ${missingFromCatalog.join(", ")}`);
if (missingFromFilesystem.length) fail.push(`Catalog skills missing folders: ${missingFromFilesystem.join(", ")}`);

const pluginSkillUnion = new Set();
for (const plugin of catalog.plugins) {
  for (const name of plugin.skills || []) {
    pluginSkillUnion.add(name);
    if (!skillNames.includes(name)) {
      fail.push(`Plugin ${plugin.name} references missing skill ${name}`);
    }
  }
  if (plugin.publicInstall && !plugin.publicInstall.includes("--repo JasonColapietro/suede-creator-skills")) {
    fail.push(`Plugin ${plugin.name} public install does not use the public repo`);
  }
}
for (const skill of catalog.skills) {
  if (!pluginSkillUnion.has(skill.name)) {
    warn.push(`Catalog skill not in any plugin: ${skill.name}`);
  }
}

const publicFiles = walk(repoRoot).filter((file) => {
  const rel = path.relative(repoRoot, file);
  if (rel.startsWith("audits/")) return false;
  if (rel.startsWith("scripts/")) return false;
  return /\.(md|html|json|yaml|yml|mjs|js|txt)$/.test(file);
});

const privatePathPatterns = [
  /\/Users\/(jason|jasoncolapietro)\//,
  /GoogleDrive-jasoncola1@gmail\.com/,
  /johnnysuedes@gmail\.com/,
  /team_[A-Za-z0-9]{8,}/
];
const secretPatterns = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bsk_live_[A-Za-z0-9_]{20,}\b/,
  /\bsk_test_[A-Za-z0-9_]{20,}\b/,
  /\brk_live_[A-Za-z0-9_]{20,}\b/,
  /\bwhsec_[A-Za-z0-9]{20,}\b/,
  /\bvc_[A-Za-z0-9]{20,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bghp_[A-Za-z0-9_]{20,}\b/,
  /\bgho_[A-Za-z0-9_]{20,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  /-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----/
];
const publicSkillFiles = publicFiles.filter((file) => {
  const rel = path.relative(repoRoot, file);
  return rel.startsWith("skills/") || rel.startsWith("mcp/") || rel.startsWith("docs/") || ["README.md", "COPY.md", "PROMO.md", "PASSPORT.md"].includes(rel);
});

for (const file of publicSkillFiles) {
  const rel = path.relative(repoRoot, file);
  const text = readText(file);
  for (const pattern of privatePathPatterns) {
    if (pattern.test(text)) fail.push(`Private path/account leak pattern in ${rel}: ${pattern}`);
  }
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) fail.push(`Secret-like token pattern in ${rel}: ${pattern}`);
  }
}

const knownPrivateSkills = ["suede-map", "suede-deslop", "suede-debug", "suede-docs",
  "suede-think", "suede-plan", "suede-spec", "suede-arch", "suede-ui",
  "suede-product", "suede-growth", "suede-verify", "suede-progress",
  "suede-roadmap", "suede-slides", "suede-visual-qa"].filter((n) => !skillNames.includes(n));

for (const file of publicSkillFiles) {
  const rel = path.relative(repoRoot, file);
  if (!rel.startsWith("skills/")) continue;
  const text = readText(file);
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;
  for (const privateName of knownPrivateSkills) {
    if (fm[1].includes(privateName)) {
      fail.push(`Private skill name '${privateName}' appears in frontmatter of ${rel}`);
    }
  }
}

const installShPath = path.join(repoRoot, "install.sh");
if (!fs.existsSync(installShPath)) {
  fail.push("install.sh is missing from repo root");
} else {
  const installMode = fs.statSync(installShPath).mode;
  if (!(installMode & 0o111)) {
    fail.push("install.sh is not executable (chmod +x install.sh)");
  }
  const installText = readText(installShPath);
  for (const pattern of privatePathPatterns) {
    if (pattern.test(installText)) fail.push(`Private path/account leak pattern in install.sh: ${pattern}`);
  }
  for (const pattern of secretPatterns) {
    if (pattern.test(installText)) fail.push(`Secret-like token pattern in install.sh: ${pattern}`);
  }
}

const readmeText = readText(path.join(repoRoot, "README.md"));
const readmeCountMatch = readmeText.match(/\*\*(\d+)\s+public skill folders\*\*/);
if (readmeCountMatch) {
  const readmeCount = parseInt(readmeCountMatch[1], 10);
  if (readmeCount !== skillNames.length) {
    fail.push(`README skill count (${readmeCount}) does not match actual skill folder count (${skillNames.length})`);
  }
} else {
  fail.push("README first paragraph: could not find skill count (expected pattern: **N public skill folders**)");
}

const docsRootText = readText(path.join(repoRoot, "docs", "index.html"));
const docsCountMatch = docsRootText.match(/Install (\d+) (?:public|free)/);
if (docsCountMatch) {
  const docsCount = parseInt(docsCountMatch[1], 10);
  if (docsCount !== skillNames.length) {
    fail.push(`docs/index.html skill count (${docsCount}) does not match actual skill folder count (${skillNames.length})`);
  }
} else {
  fail.push("docs/index.html: could not find skill count (expected pattern: Install N public/free ...)");
}

if (fail.length || warn.length) {
  if (warn.length) {
    console.error("Warnings:");
    for (const item of warn) console.error(`- ${item}`);
  }
  if (fail.length) {
    console.error("Failures:");
    for (const item of fail) console.error(`- ${item}`);
    process.exit(1);
  }
}

console.log(`Validated ${skillNames.length} skills against ${catalogSkillNames.length} catalog entries.`);
