#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
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
const RESERVED_SEQUENCE_DIGESTS = new Map([
  [2, new Set([
    "30331762bad45927395243bbdb471a76ba664f3b93529b0f988cead7bdd66db1",
    "353fb85247026e9f2bd471bb9ab4ad0d8c618992239bd789bd9c2714cc302bb4",
    "3fb3be3178c44dcd76bed81b7450c5b1623f100290a0df39b079325da1262dab",
    "91be52acbd03655d58e927da43f79ed6a0c2153c664577e509c26713e2186258",
    "aa6c771bc69d8037987d060c234fc45dd6044bef30e622347a8b867988829c13",
    "c848f62d5d40526d5d6d55bd94d9e72566ea353fb43a0976c53a68c411823951",
    "dbc2157aeea1da74d815d8f86baa449bdd957cb6989c197ae0bb1910e29a618c",
    "ede3b624bd1af3fcfc9d195289488d1e4392ebefcc933fd406e9837a56922420",
    "f01cc17c78d94430898d6f45addaf772845d621777ac5dded9100e9e3f8458a5",
  ])],
  [3, new Set([
    "0d192efa9c16773708ee072ee3a1225ccfbfd40669d0652ed14c0665cc8e243d",
    "6935ccddd8ce0093e3866225b941c2229811e2569bf97daf00c4e6f98f82b7ee",
  ])],
  [4, new Set([
    "e0575bd14845514197b759a88037f3e9428cae85947339611f29e2f8e67c4c5a",
  ])],
  [6, new Set([
    "623a2824ee1885d2255e03e09b1d709ab8093f1673f3475a90fe329ffc939dbb",
  ])],
]);

function inspectGitHistory(root) {
  if (!fs.existsSync(path.join(root, ".git"))) {
    return { state: "packaged" };
  }

  const topLevelProbe = spawnSync("git", ["-C", root, "rev-parse", "--show-toplevel"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });
  if (topLevelProbe.error || topLevelProbe.status !== 0) {
    return { state: "error", detail: topLevelProbe.error?.code || `git rev-parse exited ${topLevelProbe.status}` };
  }
  if (path.resolve(topLevelProbe.stdout.trim()) !== path.resolve(root)) {
    return { state: "error", detail: "Git top-level does not match the skill-pack root" };
  }

  const shallowProbe = spawnSync("git", ["-C", root, "rev-parse", "--is-shallow-repository"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });
  if (shallowProbe.error || shallowProbe.status !== 0) {
    return { state: "error", detail: shallowProbe.error?.code || `shallow-history probe exited ${shallowProbe.status}` };
  }
  const shallowValue = shallowProbe.stdout.trim();
  if (shallowValue === "true") return { state: "shallow" };
  if (shallowValue === "false") return { state: "complete" };
  return { state: "error", detail: `unexpected shallow-history response: ${JSON.stringify(shallowValue)}` };
}

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

function loadReservedSignatures() {
  const signaturePath = path.join(repoRoot, "scripts", "reserved-signatures.json");
  let payload;
  try {
    payload = JSON.parse(readText(signaturePath));
  } catch (error) {
    throw new Error(`Invalid reserved signature data: ${error.message}`);
  }
  const digestListIsValid = (value) =>
    Array.isArray(value) && value.length > 0 && value.every((digest) => /^[0-9a-f]{64}$/.test(digest));
  if (
    !digestListIsValid(payload.body_digests) ||
    !digestListIsValid(payload.shingle_digests) ||
    !Number.isInteger(payload.shingle_window) ||
    payload.shingle_window < 2 ||
    !Number.isInteger(payload.shingle_minimum) ||
    payload.shingle_minimum < 2 ||
    payload.shingle_minimum > payload.shingle_digests.length
  ) {
    throw new Error("Invalid reserved signature data: malformed policy");
  }
  return payload;
}

const reservedSignatures = loadReservedSignatures();
const RESERVED_BODY_DIGESTS = new Set(reservedSignatures.body_digests);
const RESERVED_SHINGLE_DIGESTS = new Set(reservedSignatures.shingle_digests);
const RESERVED_SHINGLE_WINDOW = reservedSignatures.shingle_window;
const RESERVED_SHINGLE_MINIMUM = reservedSignatures.shingle_minimum;

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

function normalizedTokens(value) {
  const normalized = value
    .normalize("NFKC")
    .replace(/\p{Cf}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return normalized ? normalized.split(/\s+/) : [];
}

function digestText(value) {
  return createHash("sha256").update(value).digest("hex");
}

function containsReservedSequence(value) {
  const tokens = normalizedTokens(value);
  for (const [length, digests] of RESERVED_SEQUENCE_DIGESTS) {
    for (let index = 0; index <= tokens.length - length; index += 1) {
      const candidate = tokens.slice(index, index + length).join(" ");
      const digest = digestText(candidate);
      if (digests.has(digest)) return true;
    }
  }
  return false;
}

function containsReservedBodySignature(value) {
  const body = value.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
  const tokens = normalizedTokens(body);
  if (RESERVED_BODY_DIGESTS.has(digestText(tokens.join(" ")))) return true;

  const matches = new Set();
  for (let index = 0; index <= tokens.length - RESERVED_SHINGLE_WINDOW; index += 1) {
    const shingle = tokens.slice(index, index + RESERVED_SHINGLE_WINDOW).join(" ");
    const digest = digestText(shingle);
    if (!RESERVED_SHINGLE_DIGESTS.has(digest)) continue;
    matches.add(digest);
    if (matches.size >= RESERVED_SHINGLE_MINIMUM) return true;
  }
  return false;
}

function runReservedSequencePreflight(files) {
  const findings = [];
  for (const file of files) {
    const relative = path.relative(repoRoot, file);
    if (containsReservedSequence(relative)) {
      findings.push(digestText(relative).slice(0, 12));
      continue;
    }
    if (!PUBLIC_TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
    const text = readText(file);
    if (containsReservedSequence(text) || containsReservedBodySignature(text)) {
      findings.push(digestText(relative).slice(0, 12));
    }
  }
  if (findings.length === 0) return;

  console.error("Reserved semantic sequence detected:");
  for (const finding of findings) console.error(`- source ${finding}`);
  process.exit(1);
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

const repoFiles = walk(repoRoot);
runReservedSequencePreflight(repoFiles);
const skillsDir = path.join(repoRoot, "skills");
const skillNames = listDirs(skillsDir);
const catalog = JSON.parse(readText(path.join(repoRoot, "mcp", "catalog.json")));
const catalogSkillNames = [...catalog.skills.map((skill) => skill.name)].sort();
const packageJson = JSON.parse(readText(path.join(repoRoot, "package.json")));
const pluginJson = JSON.parse(readText(path.join(repoRoot, ".claude-plugin", "plugin.json")));

if (typeof catalog.version !== "string" || !SEMVER_RE.test(catalog.version)) {
  fail.push(`catalog.json version is not valid semantic versioning: ${catalog.version}`);
}
if (packageJson.version !== catalog.version) {
  fail.push(`package.json version (${packageJson.version}) does not match catalog.json version (${catalog.version})`);
}
if (pluginJson.version !== catalog.version) {
  fail.push(`plugin.json version (${pluginJson.version}) does not match catalog.json version (${catalog.version})`);
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

const publicFiles = repoFiles.filter((file) => {
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

// Ship-log changelog guard: the homepage #changelog section cites real commits
// by short hash and stamps a "Last shipped" freshness pill. A fabricated hash,
// a stale pill, or an out-of-order entry would ship a page that quietly lies
// about the repo's own history — fail the build instead.
const clogItems = [...docsRootText.matchAll(/<li class="clog-item"[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
if (clogItems.length === 0) {
  fail.push("docs/index.html: no .clog-item entries found — the #changelog ship-log is missing or its markup changed");
} else {
  const clogEntries = clogItems.map((item, i) => {
    const date = item.match(/class="clog-date">(\d{4}-\d{2}-\d{2})</);
    const hash = item.match(/class="clog-hash"[^>]*>([0-9a-f]{7,40})</);
    if (!date) fail.push(`docs/index.html changelog entry ${i + 1}: missing or malformed .clog-date (expected YYYY-MM-DD)`);
    if (!hash) fail.push(`docs/index.html changelog entry ${i + 1}: missing .clog-hash short commit hash`);
    return { date: date ? date[1] : null, hash: hash ? hash[1] : null };
  });

  const gitHistory = inspectGitHistory(repoRoot);
  if (gitHistory.state === "complete") {
    for (const entry of clogEntries) {
      if (!entry.hash) continue;
      const probe = spawnSync("git", ["-C", repoRoot, "cat-file", "-e", `${entry.hash}^{commit}`], { stdio: "ignore" });
      if (probe.error) {
        warn.push(`Changelog hash check skipped — could not run git (${probe.error.code || probe.error.message})`);
        break;
      }
      if (probe.status !== 0) {
        fail.push(`docs/index.html changelog cites commit ${entry.hash} which does not resolve to a commit in this repo`);
      }
    }
  } else if (gitHistory.state === "packaged" || gitHistory.state === "shallow") {
    console.log(`Changelog commit resolution skipped: ${gitHistory.state} skill-pack checkout.`);
  } else {
    warn.push(`Changelog hash check unavailable — ${gitHistory.detail}`);
  }

  for (let i = 1; i < clogEntries.length; i++) {
    const prev = clogEntries[i - 1].date;
    const curr = clogEntries[i].date;
    if (prev && curr && curr > prev) {
      fail.push(`docs/index.html changelog entries out of date order: entry ${i + 1} (${curr}) is newer than entry ${i} (${prev}) — newest must come first`);
    }
  }

  const freshMatch = docsRootText.match(/Last shipped ([^<]+?)\s*<span id="clog-fresh-rel"[^>]*data-iso="(\d{4}-\d{2}-\d{2})"/);
  if (!freshMatch) {
    fail.push('docs/index.html: could not find the "Last shipped" pill (id="clog-fresh-rel" with a data-iso date)');
  } else {
    const pillText = freshMatch[1].trim();
    const pillIso = freshMatch[2];
    const newestDate = clogEntries.map((e) => e.date).filter(Boolean).sort().at(-1);
    if (newestDate && pillIso !== newestDate) {
      fail.push(`docs/index.html "Last shipped" pill data-iso (${pillIso}) does not match the newest changelog entry date (${newestDate})`);
    }
    const monthAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [y, m, d] = pillIso.split("-").map(Number);
    const expectedPillText = `${monthAbbr[m - 1]} ${d}, ${y}`;
    if (pillText !== expectedPillText) {
      fail.push(`docs/index.html "Last shipped" pill text ("${pillText}") does not match its data-iso ${pillIso} (expected "${expectedPillText}")`);
    }
  }

  // Tiny ship-log box guard: the #hero-shiplog cards on the homepage, skills
  // catalog, and guide repeat the newest changelog entry by hand. If any card
  // drifts from the newest #changelog entry (date, hash, or title) or the
  // cards disagree with each other on the commit count, the site advertises a
  // ship that never happened — fail the build instead.
  const newestClogItem = clogItems[0] || "";
  const newestClogTitle = (newestClogItem.match(/class="clog-title">([^<]+)</) || [])[1]?.trim() ?? null;
  const newestClogDate = clogEntries[0]?.date ?? null;
  const newestClogHash = clogEntries[0]?.hash ?? null;
  const monthAbbrBox = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let expectedBoxDate = null;
  if (newestClogDate) {
    const [by, bm, bd] = newestClogDate.split("-").map(Number);
    expectedBoxDate = `${monthAbbrBox[bm - 1]} ${bd}`;
  }
  const shiplogPages = [
    { file: "docs/index.html", text: docsRootText },
    { file: "docs/skills/index.html", text: docsIndexText },
    { file: "docs/guide.html", text: readText(path.join(repoRoot, "docs", "guide.html")) },
  ];
  const boxCounts = [];
  for (const page of shiplogPages) {
    const box = page.text.match(/id="hero-shiplog"[\s\S]*?<\/a>/);
    if (!box) {
      fail.push(`${page.file}: tiny ship-log box (id="hero-shiplog") is missing`);
      continue;
    }
    const top = box[0].match(/class="hero-shiplog-top">Shipped ([A-Z][a-z]{2} \d{1,2}) <b>&middot; ([0-9a-f]{7,40})<\/b>/);
    const title = (box[0].match(/class="hero-shiplog-title">([^<]+)</) || [])[1]?.trim() ?? null;
    const commits = (box[0].match(/class="hero-shiplog-more">(\d+) commits/) || [])[1] ?? null;
    if (!top) {
      fail.push(`${page.file}: tiny ship-log box header is malformed (expected 'Shipped Mon D <b>&middot; hash</b>')`);
    } else {
      if (expectedBoxDate && top[1] !== expectedBoxDate) {
        fail.push(`${page.file}: tiny ship-log box says "Shipped ${top[1]}" but the newest changelog entry is ${newestClogDate} (expected "Shipped ${expectedBoxDate}")`);
      }
      if (newestClogHash && top[2] !== newestClogHash) {
        fail.push(`${page.file}: tiny ship-log box cites ${top[2]} but the newest changelog entry is ${newestClogHash}`);
      }
    }
    if (!title) {
      fail.push(`${page.file}: tiny ship-log box is missing its .hero-shiplog-title line`);
    } else if (newestClogTitle && title !== newestClogTitle) {
      fail.push(`${page.file}: tiny ship-log box title ("${title}") does not match the newest changelog entry title ("${newestClogTitle}")`);
    }
    if (!commits) {
      fail.push(`${page.file}: tiny ship-log box is missing its "N commits" line`);
    } else {
      boxCounts.push({ file: page.file, commits });
    }
  }
  if (boxCounts.length > 1 && new Set(boxCounts.map((b) => b.commits)).size > 1) {
    fail.push(`Tiny ship-log boxes disagree on the commit count: ${boxCounts.map((b) => `${b.file}=${b.commits}`).join(", ")}`);
  }
  const sparkCaption = (docsRootText.match(/class="clog-spark-caption[^"]*">(\d+) commits/) || [])[1] ?? null;
  if (sparkCaption && boxCounts[0] && sparkCaption !== boxCounts[0].commits) {
    fail.push(`docs/index.html sparkline caption says ${sparkCaption} commits but the tiny ship-log boxes say ${boxCounts[0].commits}`);
  }
}

// Correction-policy drift guard: the two orchestration specs, their picker
// prompts, public examples, and umbrella workflow must agree that the budget is
// failure-reason-aware. Three is a ceiling for distinct fixes, not permission to
// repeat the same failed strategy three times.
const correctionPolicyChecks = [
  { file: "skills/suede-codex-fleet/SKILL.md", label: "Fable Fleet spec" },
  { file: "skills/suede-codex-fleet/agents/openai.yaml", label: "Fable Fleet picker prompt" },
  { file: "docs/skills/suede-codex-fleet.html", label: "Fable Fleet public docs and example" },
  { file: "skills/suede-agent-teams/SKILL.md", label: "Agent Teams spec" },
  { file: "skills/suede-agent-teams/agents/openai.yaml", label: "Agent Teams picker prompt" },
  { file: "docs/skills/suede-agent-teams.html", label: "Agent Teams public docs and example" },
  { file: "skills/suede-workflow-skills/SKILL.md", label: "umbrella agent-team workflow" },
  { file: "skills/suede-workflow-skills/references/no-missed-quality-gates.md", label: "agent-team quality gate" },
  { file: "docs/skills/suede-workflow-skills.html", label: "umbrella public docs and example" },
];

for (const check of correctionPolicyChecks) {
  const filePath = path.join(repoRoot, check.file);
  if (!fs.existsSync(filePath)) {
    fail.push(`Correction policy missing surface: ${check.file} (${check.label})`);
    continue;
  }
  const text = readText(filePath).toLowerCase().replace(/\s+/g, " ");
  const allowsThreeDistinctFixes = text.includes("up to three genuinely different fixes");
  const stopsOnRepeatedRootCause = text.includes("same root cause repeats");
  if (!allowsThreeDistinctFixes || !stopsOnRepeatedRootCause) {
    fail.push(`${check.label} must allow up to three genuinely different fixes and stop early when the same root cause repeats (${check.file})`);
  }
}

// Sitemap freshness guard: docs/sitemap.xml is generated (scripts/generate-
// sitemap.mjs) from real git history, not hand-edited. If a page's <lastmod>
// (or the URL set itself) has drifted from what the generator would produce
// right now, the site is quietly telling search engines a stale story.
const sitemapCheck = spawnSync("node", [path.join(repoRoot, "scripts", "generate-sitemap.mjs"), "--check"], {
  encoding: "utf8",
});
if (sitemapCheck.error) {
  warn.push(`Sitemap freshness check skipped — could not run generate-sitemap.mjs (${sitemapCheck.error.code || sitemapCheck.error.message})`);
} else if (sitemapCheck.status !== 0) {
  fail.push("docs/sitemap.xml is out of date — run `node scripts/generate-sitemap.mjs` and commit the result");
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
