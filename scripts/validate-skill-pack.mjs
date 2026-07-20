#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { load: yamlLoad } = require("js-yaml");

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const strictWarnings = process.argv.includes("--strict") || process.env.CI === "true";

const fail = [];
const warn = [];
const SKILL_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const OPENAI_SKILL_KEYS = new Set(["name", "description", "license", "allowed-tools", "metadata"]);
const OPENAI_AGENT_ROOT_KEYS = new Set(["interface", "dependencies", "policy"]);
const OPENAI_INTERFACE_KEYS = new Set([
  "display_name",
  "short_description",
  "icon_small",
  "icon_large",
  "brand_color",
  "default_prompt"
]);
const PUBLIC_TEXT_EXTENSIONS = new Set([
  ".bash",
  ".cfg",
  ".cjs",
  ".css",
  ".csv",
  ".html",
  ".ini",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".mts",
  ".py",
  ".sh",
  ".sql",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
  ".yaml",
  ".yml",
  ".zsh",
]);

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
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "__pycache__") continue;
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      fail.push(`Symbolic link is not allowed in the public pack: ${path.relative(repoRoot, full)}`);
    } else if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function unexpectedKeys(value, allowed) {
  if (!isObject(value)) return [];
  return Object.keys(value).filter((key) => !allowed.has(key)).sort();
}

function parseSkillFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return { value: null, issues: ["missing or malformed frontmatter block"] };
  try {
    const value = yamlLoad(match[1]);
    return isObject(value)
      ? { value, issues: [] }
      : { value: null, issues: ["frontmatter must parse as a YAML mapping"] };
  } catch (error) {
    return { value: null, issues: [`YAML parse error — ${error.message}`] };
  }
}

function skillFrontmatterIssues(frontmatter, folderName) {
  const issues = [];
  const extras = unexpectedKeys(frontmatter, OPENAI_SKILL_KEYS);
  if (extras.length) issues.push(`unsupported OpenAI frontmatter key(s): ${extras.join(", ")}`);

  const name = frontmatter.name;
  if (typeof name !== "string" || !name.trim()) {
    issues.push('"name" must be a non-empty string');
  } else {
    if (name !== folderName) issues.push(`name "${name}" does not match folder "${folderName}"`);
    if (name.length > 64) issues.push(`name is ${name.length} characters; maximum is 64`);
    if (!SKILL_NAME_RE.test(name)) issues.push("name must be lowercase hyphen-case without leading, trailing, or repeated hyphens");
  }

  const description = frontmatter.description;
  if (typeof description !== "string" || !description.trim()) {
    issues.push('"description" must be a non-empty string');
  } else {
    if (description.length > 1024) issues.push(`description is ${description.length} characters; maximum is 1024`);
    if (description.includes("<") || description.includes(">")) issues.push("description cannot contain angle brackets");
  }

  if ("license" in frontmatter && typeof frontmatter.license !== "string") {
    issues.push('"license" must be a string when present');
  }
  if ("metadata" in frontmatter && !isObject(frontmatter.metadata)) {
    issues.push('"metadata" must be a mapping when present');
  }
  if (
    "allowed-tools" in frontmatter &&
    typeof frontmatter["allowed-tools"] !== "string" &&
    !(Array.isArray(frontmatter["allowed-tools"]) && frontmatter["allowed-tools"].every((item) => typeof item === "string"))
  ) {
    issues.push('"allowed-tools" must be a string or an array of strings when present');
  }
  return issues;
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

function openaiYamlStructureIssues(text, skillName, skillDir) {
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
  const rootExtras = unexpectedKeys(parsed, OPENAI_AGENT_ROOT_KEYS);
  if (rootExtras.length) issues.push(`unsupported root key(s): ${rootExtras.join(", ")}`);
  if (!("interface" in parsed)) {
    issues.push('missing root "interface" key');
  } else if (!isObject(parsed.interface)) {
    issues.push('"interface" key is null or not a mapping');
  } else {
    const interfaceExtras = unexpectedKeys(parsed.interface, OPENAI_INTERFACE_KEYS);
    if (interfaceExtras.length) issues.push(`unsupported interface key(s): ${interfaceExtras.join(", ")}`);
    for (const field of ["display_name", "short_description", "default_prompt"]) {
      if (typeof parsed.interface[field] !== "string" || !parsed.interface[field].trim()) {
        issues.push(`interface.${field} must be a non-empty string`);
      }
    }
    if (typeof parsed.interface.display_name === "string" && parsed.interface.display_name.length > 64) {
      issues.push(`interface.display_name is ${parsed.interface.display_name.length} characters; maximum is 64`);
    }
    if (typeof parsed.interface.short_description === "string") {
      const length = parsed.interface.short_description.trim().length;
      if (length < 25 || length > 64) {
        issues.push(`interface.short_description length ${length} is outside 25-64 characters`);
      }
    }
    if (
      typeof parsed.interface.default_prompt === "string" &&
      !parsed.interface.default_prompt.includes(`$${skillName}`)
    ) {
      issues.push(`interface.default_prompt must explicitly reference $${skillName}`);
    }
    if (
      "brand_color" in parsed.interface &&
      (typeof parsed.interface.brand_color !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(parsed.interface.brand_color))
    ) {
      issues.push("interface.brand_color must be a six-digit hex color");
    }
    for (const field of ["icon_small", "icon_large"]) {
      if (!(field in parsed.interface)) continue;
      const assetPath = parsed.interface[field];
      if (typeof assetPath !== "string" || !assetPath.startsWith("./assets/") || assetPath.includes("..")) {
        issues.push(`interface.${field} must be a contained ./assets/ path`);
        continue;
      }
      const resolved = path.resolve(skillDir, assetPath);
      if (!resolved.startsWith(`${path.resolve(skillDir)}${path.sep}`) || !fs.existsSync(resolved)) {
        issues.push(`interface.${field} points to a missing or uncontained asset: ${assetPath}`);
      }
    }
  }
  for (const field of ["display_name", "short_description", "default_prompt", "brand_color"]) {
    if (field in parsed) {
      issues.push(`"${field}" is a root-level key — must be nested under "interface"`);
    }
  }
  if ("policy" in parsed) {
    if (!isObject(parsed.policy)) {
      issues.push('"policy" must be a mapping');
    } else {
      const extras = unexpectedKeys(parsed.policy, new Set(["allow_implicit_invocation"]));
      if (extras.length) issues.push(`unsupported policy key(s): ${extras.join(", ")}`);
      if (
        "allow_implicit_invocation" in parsed.policy &&
        typeof parsed.policy.allow_implicit_invocation !== "boolean"
      ) {
        issues.push("policy.allow_implicit_invocation must be boolean");
      }
    }
  }
  if ("dependencies" in parsed) {
    if (!isObject(parsed.dependencies)) {
      issues.push('"dependencies" must be a mapping');
    } else {
      const extras = unexpectedKeys(parsed.dependencies, new Set(["tools"]));
      if (extras.length) issues.push(`unsupported dependencies key(s): ${extras.join(", ")}`);
      if (!Array.isArray(parsed.dependencies.tools)) {
        issues.push("dependencies.tools must be an array");
      } else {
        parsed.dependencies.tools.forEach((tool, index) => {
          if (!isObject(tool)) {
            issues.push(`dependencies.tools[${index}] must be a mapping`);
            return;
          }
          const toolExtras = unexpectedKeys(tool, new Set(["type", "value", "description", "transport", "url"]));
          if (toolExtras.length) issues.push(`dependencies.tools[${index}] unsupported key(s): ${toolExtras.join(", ")}`);
          if (tool.type !== "mcp") issues.push(`dependencies.tools[${index}].type must be "mcp"`);
          for (const field of ["value", "description"]) {
            if (typeof tool[field] !== "string" || !tool[field].trim()) {
              issues.push(`dependencies.tools[${index}].${field} must be a non-empty string`);
            }
          }
          for (const field of ["transport", "url"]) {
            if (field in tool && typeof tool[field] !== "string") {
              issues.push(`dependencies.tools[${index}].${field} must be a string`);
            }
          }
        });
      }
    }
  }
  return issues;
}


const skillsDir = path.join(repoRoot, "skills");
const skillNames = listDirs(skillsDir);
const catalog = JSON.parse(readText(path.join(repoRoot, "mcp", "catalog.json")));
const catalogSkillNames = [...catalog.skills.map((skill) => skill.name)].sort();
const packageJson = JSON.parse(readText(path.join(repoRoot, "package.json")));

if (typeof catalog.version !== "string" || !SEMVER_RE.test(catalog.version)) {
  fail.push(`catalog.json version is not valid semantic versioning: ${catalog.version}`);
}
if (packageJson.version !== catalog.version) {
  fail.push(`package.json version (${packageJson.version}) does not match catalog.json version (${catalog.version})`);
}
if (new Set(catalogSkillNames).size !== catalogSkillNames.length) {
  fail.push("mcp/catalog.json contains duplicate skill names");
}
for (const [index, skill] of catalog.skills.entries()) {
  if (!isObject(skill)) {
    fail.push(`catalog.skills[${index}] must be a mapping`);
    continue;
  }
  if (typeof skill.name !== "string" || !SKILL_NAME_RE.test(skill.name) || skill.name.length > 64) {
    fail.push(`catalog.skills[${index}].name is not a valid Agent Skills name`);
  }
  for (const field of ["area", "description", "useWhen"]) {
    if (typeof skill[field] !== "string" || !skill[field].trim()) {
      fail.push(`catalog skill ${skill.name || index}: ${field} must be a non-empty string`);
    }
  }
  if (typeof skill.description === "string" && skill.description.length > 1024) {
    fail.push(`catalog skill ${skill.name}: description is ${skill.description.length} characters; maximum is 1024`);
  }
  if (typeof skill.useWhen === "string" && skill.useWhen.length > 1024) {
    fail.push(`catalog skill ${skill.name}: useWhen is ${skill.useWhen.length} characters; maximum is 1024`);
  }
}

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
  const parsedFrontmatter = parseSkillFrontmatter(skillText);
  for (const issue of parsedFrontmatter.issues) {
    fail.push(`Frontmatter YAML issue in ${skillName}: ${issue}`);
  }
  const frontmatter = parsedFrontmatter.value || {};
  for (const issue of skillFrontmatterIssues(frontmatter, skillName)) {
    fail.push(`Frontmatter issue in ${skillName}: ${issue}`);
  }
  const declaredName = typeof frontmatter.name === "string" ? frontmatter.name.trim() : null;
  if (declaredName !== skillName) {
    fail.push(`Frontmatter name mismatch for ${skillName}: ${declaredName || "missing"}`);
  }
  const bodyStart = skillText.indexOf('\n---\n', skillText.indexOf('---\n') + 4);
  const body = bodyStart !== -1 ? skillText.slice(bodyStart + 5).trim() : '';
  if (body.length < 50) {
    fail.push(`SKILL.md body is empty or near-empty for ${skillName} (${body.length} chars after frontmatter)`);
  }
  const skillFmDesc = typeof frontmatter.description === "string" ? frontmatter.description.trim() : null;
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
    for (const issue of openaiYamlStructureIssues(agentText, skillName, skillDir)) {
      fail.push(`${skillName} agents/openai.yaml: ${issue}`);
    }
    // Keep the parsed object in scope so js-yaml parsing itself is exercised in
    // addition to the structural checks above.
    if (!parsedAgent) fail.push(`${skillName} agents/openai.yaml: could not parse manifest`);
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
const pluginNames = catalog.plugins.map((plugin) => plugin.name);
if (new Set(pluginNames).size !== pluginNames.length) fail.push("mcp/catalog.json contains duplicate plugin names");
for (const plugin of catalog.plugins) {
  if (!isObject(plugin) || typeof plugin.name !== "string" || !SKILL_NAME_RE.test(plugin.name)) {
    fail.push("Every catalog plugin must have a valid lowercase hyphen-case name");
    continue;
  }
  if (!Array.isArray(plugin.skills) || new Set(plugin.skills).size !== plugin.skills.length) {
    fail.push(`Plugin ${plugin.name} must contain a unique skills array`);
    continue;
  }
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

if (!isObject(catalog.mcp)) {
  fail.push("mcp/catalog.json is missing the mcp surface map");
} else {
  for (const field of ["tools", "resources", "prompts"]) {
    const values = catalog.mcp[field];
    if (!Array.isArray(values) || !values.every((value) => typeof value === "string" && value.trim())) {
      fail.push(`catalog.mcp.${field} must be an array of non-empty strings`);
    } else if (new Set(values).size !== values.length) {
      fail.push(`catalog.mcp.${field} contains duplicates`);
    }
  }
}

const publicFiles = walk(repoRoot).filter((file) => {
  const rel = path.relative(repoRoot, file);
  if (rel.startsWith("audits/")) return false;
  return PUBLIC_TEXT_EXTENSIONS.has(path.extname(file).toLowerCase());
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
  return rel.startsWith("skills/") ||
    rel.startsWith("mcp/") ||
    rel.startsWith("docs/") ||
    rel.startsWith("scripts/") ||
    rel.startsWith("tests/") ||
    rel.startsWith(".github/") ||
    ["README.md", "COPY.md", "PROMO.md", "PASSPORT.md", "package.json", "package-lock.json"].includes(rel);
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

// Count-drift guard: every public-facing surface that states the pack size
// in prose, metadata, or schema must agree with the real skills/ directory.
// This is the guard the 2026-07-05 audit found missing — a published skill
// went in without a matching sweep of titles, OG/Twitter tags, JSON-LD, the
// plugin manifest, the umbrella skill's own docs, and the copy bank.
const totalSkillCount = skillNames.length;
const companionSkillCount = totalSkillCount - 1; // total minus suede-workflow-skills itself
const numberWords = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };

function wordNumberAfterTwenty(word) {
  const n = numberWords[word.toLowerCase()];
  return n === undefined ? null : 20 + n;
}

const countChecks = [
  { file: "docs/index.html", label: "title tag", re: /<title>Suede Creator Skills \| (\d+) Open-Source Agent Skills/, expected: totalSkillCount },
  { file: "docs/index.html", label: "og:title", re: /property="og:title" content="Suede Creator Skills \| (\d+) Open-Source Agent Skills/, expected: totalSkillCount },
  { file: "docs/index.html", label: "twitter:title", re: /name="twitter:title" content="Suede Creator Skills \| (\d+) Open-Source Agent Skills/, expected: totalSkillCount },
  { file: "docs/index.html", label: "JSON-LD numberOfItems", re: /"numberOfItems":\s*(\d+)/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "title tag", re: /<title>Suede Creator Skills Guide \| (\d+) Agent Skills/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "public skills metric", re: /<div class="metric"><b>(\d+)<\/b><span>public skills<\/span><\/div>/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "h2 heading", re: /<h2>Twenty-(\w+) skills, one portable/, expected: totalSkillCount, wordNumber: true },
  { file: "docs/copy.html", label: "og:description agent skills count", re: /og:description" content="Use this copy when explaining Suede Creator Skills: (\d+) agent skills/, expected: totalSkillCount },
  { file: "docs/copy.html", label: "N-skill pack copy block", re: /A (\d+)-skill, MIT-licensed pack/, expected: totalSkillCount },
  { file: "docs/copy.html", label: "Twenty-N public skills paragraph", re: /Twenty-(\w+) public skills your agent loads/, expected: totalSkillCount, wordNumber: true },
  { file: "docs/plugins.html", label: "lead paragraph", re: /Twenty-(\w+) public skills your agent can load/, expected: totalSkillCount, wordNumber: true },
  { file: "docs/dav/index.html", label: "meta description", re: /Install (\d+) public Codex and Claude skills/, expected: totalSkillCount },
  { file: "docs/dav/index.html", label: "og:description", re: /property="og:description" content="(\d+) public skills for Suedify/, expected: totalSkillCount },
  { file: "docs/dav/index.html", label: "twitter:description", re: /name="twitter:description" content="(\d+) public skills for Suedify/, expected: totalSkillCount },
  { file: "docs/dav/index.html", label: "JSON-LD description", re: /"description":\s*"A (\d+)-skill public workflow/, expected: totalSkillCount },
  { file: "docs/dav/index.html", label: "hero-subline", re: /Twenty-(\w+) public skills for Suedify/, expected: totalSkillCount, wordNumber: true },
  { file: "docs/skills/suede-workflow-skills.html", label: "meta description", re: /routes the agent across all (\d+) skills/, expected: totalSkillCount },
  { file: "docs/skills/suede-workflow-skills.html", label: "og:description", re: /Public Suede umbrella skill for (\d+) installable skills/, expected: totalSkillCount },
  { file: "docs/skills/suede-workflow-skills.html", label: "twitter:description", re: /umbrella workflow skill for (\d+) public Johnny Suede/, expected: totalSkillCount },
  { file: "docs/skills/suede-workflow-skills.html", label: "JSON-LD description", re: /umbrella entry point for (\d+) public Suede skill folders/, expected: totalSkillCount },
  { file: "docs/skills/suede-workflow-skills.html", label: "lead paragraph", re: /route the agent across all (\d+) Suede skills/, expected: totalSkillCount },
  { file: "docs/skills/suede-workflow-skills.html", label: "folders heading", re: /<h2>All (\d+) public skill folders<\/h2>/, expected: totalSkillCount },
  { file: ".claude-plugin/plugin.json", label: "description", re: /Installs all (\d+) skills/, expected: totalSkillCount },
  { file: "mcp/catalog.json", label: "umbrella description", re: /Umbrella workflow for (\d+) public skills/, expected: totalSkillCount },
  { file: "skills/suede-workflow-skills/SKILL.md", label: "frontmatter description", re: /Umbrella workflow for (\d+) public skills/, expected: totalSkillCount },
  { file: "skills/suede-workflow-skills/agents/openai.yaml", label: "short_description", re: /Umbrella workflow across (\d+) public skills/, expected: totalSkillCount },
  { file: "COPY.md", label: "subhead", re: /Install the (\d+)-skill Suede pack/, expected: totalSkillCount },
  { file: "PROMO.md", label: "companion skill count", re: /Twenty-(\w+) public Suede skills, led by one/, expected: companionSkillCount, wordNumber: true },
  { file: "PROMO.md", label: "README intro pack size", re: /public (\d+)-skill agent workflow pack/, expected: totalSkillCount },
];

for (const check of countChecks) {
  const filePath = path.join(repoRoot, check.file);
  if (!fs.existsSync(filePath)) {
    warn.push(`Count check skipped — ${check.file} does not exist (${check.label})`);
    continue;
  }
  const text = readText(filePath);
  const match = text.match(check.re);
  if (!match) {
    warn.push(`Count check pattern not found in ${check.file} (${check.label}) — copy may have moved; update scripts/validate-skill-pack.mjs`);
    continue;
  }
  const found = check.wordNumber ? wordNumberAfterTwenty(match[1]) : parseInt(match[1], 10);
  if (found === null || Number.isNaN(found)) {
    warn.push(`Count check could not parse a number in ${check.file} (${check.label}): "${match[1]}"`);
    continue;
  }
  if (found !== check.expected) {
    fail.push(`Stale skill count in ${check.file} (${check.label}): says ${found}, expected ${check.expected}`);
  }
}

const indexJsonLdItemMatches = docsRootText.match(/"@type":\s*"ListItem"/g) || [];
if (indexJsonLdItemMatches.length !== totalSkillCount) {
  fail.push(`docs/index.html JSON-LD ItemList has ${indexJsonLdItemMatches.length} entries, expected ${totalSkillCount}`);
}

if (fail.length || warn.length) {
  if (warn.length) {
    console.error("Warnings:");
    for (const item of warn) console.error(`- ${item}`);
  }
  if (fail.length) {
    console.error("Failures:");
    for (const item of fail) console.error(`- ${item}`);
  }
}

if (fail.length || (strictWarnings && warn.length)) process.exit(1);

console.log(`Validated ${skillNames.length} skills against ${catalogSkillNames.length} catalog entries.`);
