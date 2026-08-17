#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { measureBookFacts, measureSkillFile } from "./lib/book-facts.mjs";
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
    let text;
    try {
      text = readText(file);
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
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
      parsed.interface.default_prompt.length > 1024
    ) {
      issues.push(
        `interface.default_prompt is ${parsed.interface.default_prompt.length} characters; maximum is 1024`
      );
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
const codexPluginPath = path.join(repoRoot, ".codex-plugin", "plugin.json");
const codexPluginJson = fs.existsSync(codexPluginPath)
  ? JSON.parse(readText(codexPluginPath))
  : null;
const codexMarketplacePath = path.join(repoRoot, ".agents", "plugins", "marketplace.json");
const codexMarketplaceJson = fs.existsSync(codexMarketplacePath)
  ? JSON.parse(readText(codexMarketplacePath))
  : null;
const citationText = readText(path.join(repoRoot, "CITATION.cff"));
const citationVersion = citationText.match(/^version:\s*["']?([^"'#\s]+)["']?\s*$/m)?.[1] ?? null;
const citationReleaseDate = citationText.match(/^date-released:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m)?.[1] ?? null;

if (typeof catalog.version !== "string" || !SEMVER_RE.test(catalog.version)) {
  fail.push(`catalog.json version is not valid semantic versioning: ${catalog.version}`);
}
if (packageJson.version !== catalog.version) {
  fail.push(`package.json version (${packageJson.version}) does not match catalog.json version (${catalog.version})`);
}
// npm stamps the version in two places, and `npm ci` validates only the
// dependency tree -- a stale root version sails through CI and is then
// silently rewritten by the next `npm install`, dropping an unrelated
// lockfile diff into whichever branch happened to install. Releases 0.11.0
// and 0.11.1 both drifted this way. Check both fields: a hand-edit that
// fixes one and misses the other leaves the same trap.
const packageLockPath = path.join(repoRoot, "package-lock.json");
if (!fs.existsSync(packageLockPath)) {
  fail.push("package-lock.json missing — run npm install --package-lock-only to generate it");
} else {
  const packageLockJson = JSON.parse(readText(packageLockPath));
  const lockRootVersion = packageLockJson.version;
  const lockPackageVersion = packageLockJson.packages?.[""]?.version;
  if (lockRootVersion !== catalog.version) {
    fail.push(`package-lock.json version (${lockRootVersion ?? "missing"}) does not match catalog.json version (${catalog.version}) — run npm install --package-lock-only`);
  }
  if (lockPackageVersion !== catalog.version) {
    fail.push(`package-lock.json packages[""] version (${lockPackageVersion ?? "missing"}) does not match catalog.json version (${catalog.version}) — run npm install --package-lock-only`);
  }
}
if (pluginJson.version !== catalog.version) {
  fail.push(`plugin.json version (${pluginJson.version}) does not match catalog.json version (${catalog.version})`);
}
if (citationVersion !== catalog.version) {
  fail.push(`CITATION.cff version (${citationVersion || "missing"}) does not match catalog.json version (${catalog.version})`);
}
if (citationReleaseDate !== catalog.updated) {
  fail.push(`CITATION.cff date-released (${citationReleaseDate || "missing"}) does not match catalog.json updated (${catalog.updated})`);
}
if (!codexPluginJson) {
  fail.push(".codex-plugin/plugin.json is missing");
} else {
  if (codexPluginJson.name !== pluginJson.name) {
    fail.push(`Codex plugin name (${codexPluginJson.name}) does not match Claude plugin name (${pluginJson.name})`);
  }
  if (codexPluginJson.version !== catalog.version) {
    fail.push(`Codex plugin version (${codexPluginJson.version}) does not match catalog.json version (${catalog.version})`);
  }
  if (codexPluginJson.skills !== "./skills/") {
    fail.push('Codex plugin skills path must be "./skills/"');
  }
  const codexMcpServers = codexPluginJson.mcpServers;
  const expectedCodexMcpProfiles = {
    suede_creator_mcp: "creator",
    suede_workflow_mcp: "workflow",
    suede_marketing_mcp: "marketing",
  };
  if (!isObject(codexMcpServers)) {
    fail.push("Codex plugin mcpServers must be an inline object with root-relative paths");
  } else {
    const actualServerNames = Object.keys(codexMcpServers).sort();
    const expectedServerNames = Object.keys(expectedCodexMcpProfiles).sort();
    if (JSON.stringify(actualServerNames) !== JSON.stringify(expectedServerNames)) {
      fail.push(`Codex plugin MCP servers must be exactly: ${expectedServerNames.join(", ")}`);
    }
    if (JSON.stringify(codexMcpServers).includes("CLAUDE_PLUGIN_ROOT")) {
      fail.push("Codex plugin MCP config must not contain Claude-only path variables");
    }
    for (const [serverName, profile] of Object.entries(expectedCodexMcpProfiles)) {
      const server = codexMcpServers[serverName];
      if (!isObject(server)) continue;
      if (server.cwd !== "." || server.command !== "node") {
        fail.push(`Codex plugin MCP server ${serverName} must use cwd "." and command "node"`);
      }
      const expectedArgs = ["./mcp/suede-skills-mcp.mjs", "--profile", profile];
      if (JSON.stringify(server.args) !== JSON.stringify(expectedArgs)) {
        fail.push(`Codex plugin MCP server ${serverName} has non-portable args`);
      }
    }
  }
  const codexInterface = codexPluginJson.interface;
  for (const field of ["displayName", "shortDescription", "longDescription", "developerName", "category"]) {
    if (!isObject(codexInterface) || typeof codexInterface[field] !== "string" || !codexInterface[field].trim()) {
      fail.push(`Codex plugin interface.${field} must be a non-empty string`);
    }
  }
  const defaultPrompts = codexInterface?.defaultPrompt;
  if (
    !Array.isArray(defaultPrompts) ||
    defaultPrompts.length < 1 ||
    defaultPrompts.length > 3 ||
    defaultPrompts.some((prompt) => typeof prompt !== "string" || !prompt.trim() || prompt.length > 128)
  ) {
    fail.push("Codex plugin interface.defaultPrompt must contain 1-3 non-empty strings of at most 128 characters");
  }
}
if (!codexMarketplaceJson) {
  fail.push(".agents/plugins/marketplace.json is missing");
} else {
  if (codexMarketplaceJson.name !== "suede-codex") {
    fail.push('Codex marketplace name must be "suede-codex"');
  }
  if (
    !Array.isArray(codexMarketplaceJson.plugins) ||
    codexMarketplaceJson.plugins.length !== 1
  ) {
    fail.push("Codex marketplace must expose exactly one plugin");
  } else {
    const [codexMarketplacePlugin] = codexMarketplaceJson.plugins;
    if (!isObject(codexMarketplacePlugin)) {
      fail.push("Codex marketplace plugin must be a mapping");
    } else {
      if (codexMarketplacePlugin.name !== codexPluginJson?.name) {
        fail.push("Codex marketplace plugin must match .codex-plugin/plugin.json");
      }
      if (codexMarketplacePlugin.source !== "./") {
        fail.push('Codex marketplace plugin source must be "./"');
      }
      if ("skills" in codexMarketplacePlugin || "mcpServers" in codexMarketplacePlugin) {
        fail.push("Codex marketplace must defer component discovery to the root plugin manifest");
      }
    }
  }
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
// Read the whole skill, not just its entrypoint. The readback moved into
// references/ when suede-mcp-qa was split for progressive disclosure, and a
// guard anchored to SKILL.md alone would have reported it missing rather than
// stale — a gate that fails open the moment a skill is reorganized.
const mcpQaDir = path.join(repoRoot, "skills", "suede-mcp-qa");
const mcpQaText = [
  path.join(mcpQaDir, "SKILL.md"),
  ...(fs.existsSync(path.join(mcpQaDir, "references"))
    ? fs
        .readdirSync(path.join(mcpQaDir, "references"))
        .filter((entry) => entry.endsWith(".md"))
        .sort()
        .map((entry) => path.join(mcpQaDir, "references", entry))
    : [])
].map((file) => readText(file)).join("\n");
const mcpQaExpectedVersion = mcpQaText.match(/server version\s*\n`([^`]+)`/)?.[1] ?? null;
if (mcpQaExpectedVersion !== catalog.version) {
  fail.push(`suede-mcp-qa manual readback version (${mcpQaExpectedVersion || "missing"}) does not match catalog.json version (${catalog.version})`);
}
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
  "suede-roadmap", "suede-slides", "suede-visual-qa", "suede-git-hygiene",
  "suede-skill-forge", "suede-verification-law", "suede-execute",
  "suede-install-support"].filter((n) => !skillNames.includes(n));

for (const file of publicSkillFiles) {
  const rel = path.relative(repoRoot, file);
  if (!rel.startsWith("skills/")) continue;
  const text = readText(file);
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;
  for (const privateName of knownPrivateSkills) {
    const wholeName = new RegExp(`(?<![a-z0-9-])${privateName}(?![a-z0-9-])`);
    if (wholeName.test(fm[1])) {
      fail.push(`Private skill name '${privateName}' appears in frontmatter of ${rel}`);
    }
  }
  // The body may cite a private companion, but only as a disclosed dead end.
  // An undisclosed "-> suede-x" in a Routing Reference sends a public installer
  // after a skill they do not have and cannot get, with nothing marking it as
  // unavailable. Every other citation in the pack already carries the phrase;
  // two in suede-codex-fleet did not, because the guard only read frontmatter.
  const body = text.slice(fm[0].length);
  body.split("\n").forEach((line, index) => {
    const disclosed = /not in this pack/i.test(line) || /private suede/i.test(line);
    if (disclosed) return;
    for (const privateName of knownPrivateSkills) {
      if (new RegExp(`(?<![a-z0-9-])${privateName}(?![a-z0-9-])`).test(line)) {
        fail.push(`${rel}:${index + 2} routes to private skill '${privateName}' without marking it unavailable — add "(private Suede Labs companion, not in this pack: ${privateName})"`);
      }
    }
  });
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
// Marketing-area size, read from the catalog itself. It used to be scraped
// from a "Marketing & growth" lane badge on the skills page; the five-specialty
// re-cut split those skills across three browse specialities, so the badge is
// gone while `area` -- which still decides plugin and MCP-profile membership --
// is unchanged. Prose that quotes the marketing lane hangs off the same number
// the bundles do.
const marketingSkillCount = catalog.skills.filter((skill) => skill.area === "marketing").length;

// The five browse specialities and their sub-lanes, read from the catalog's own
// index. Every count-bearing surface below is checked against these, so a skill
// moved between specialities cannot leave a stale chart, badge, or lead behind.
const specialtyIndex = Array.isArray(catalog.specialties) ? catalog.specialties : [];
if (specialtyIndex.length === 0) {
  fail.push("catalog.json has no `specialties` index — the browse structure is unguarded");
}
const specialtyCounts = new Map(specialtyIndex.map((s) => [s.key, s.count]));
for (const spec of specialtyIndex) {
  const members = catalog.skills.filter((skill) => skill.specialty === spec.key);
  if (members.length !== spec.count) {
    fail.push(`catalog.json specialty "${spec.key}" claims ${spec.count} skills but ${members.length} carry that specialty`);
  }
  const laneCounts = new Map(spec.lanes.map((lane) => [lane.label, lane.count]));
  const actualLanes = new Map();
  for (const member of members) {
    actualLanes.set(member.lane, (actualLanes.get(member.lane) || 0) + 1);
  }
  for (const [label, count] of laneCounts) {
    if ((actualLanes.get(label) || 0) !== count) {
      fail.push(`catalog.json specialty "${spec.key}" lane "${label}" claims ${count} skills but ${actualLanes.get(label) || 0} carry it`);
    }
  }
  for (const label of actualLanes.keys()) {
    if (!laneCounts.has(label)) {
      fail.push(`catalog.json specialty "${spec.key}" has skills in unindexed lane "${label}"`);
    }
  }
}
for (const skill of catalog.skills) {
  if (!specialtyCounts.has(skill.specialty)) {
    fail.push(`catalog.json skill ${skill.name} has unknown specialty "${skill.specialty ?? "(missing)"}"`);
  }
  if (typeof skill.lane !== "string" || skill.lane.length === 0) {
    fail.push(`catalog.json skill ${skill.name} is missing a lane label`);
  }
}
const specialtyTotal = [...specialtyCounts.values()].reduce((sum, n) => sum + n, 0);
if (specialtyIndex.length > 0 && specialtyTotal !== catalog.skills.length) {
  fail.push(`catalog.json specialties cover ${specialtyTotal} skills but the catalog holds ${catalog.skills.length}`);
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const numberWords = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
const tensWords = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };

// Accepts "sixty-seven" or a bare "sixty". Previously hard-coded to 20 + n,
// which silently capped the pack at twenty-nine skills.
function wordNumber(word) {
  const parts = String(word).toLowerCase().split("-");
  // Bare single digits ("three") for small counts such as the number of
  // focused subset plugins. Tens callers are unaffected.
  if (parts.length === 1 && numberWords[parts[0]] !== undefined) return numberWords[parts[0]];
  const tens = tensWords[parts[0]];
  if (tens === undefined) return null;
  if (parts.length === 1) return tens;
  const ones = numberWords[parts[1]];
  return ones === undefined ? null : tens + ones;
}

const countChecks = [
  { file: "docs/index.html", label: "title tag", re: /<title>Suede Creator Skills \| (\d+) Open-Source Agent Skills/, expected: totalSkillCount },
  { file: "docs/index.html", label: "og:title", re: /property="og:title" content="Suede Creator Skills \| (\d+) Open-Source Agent Skills/, expected: totalSkillCount },
  { file: "docs/index.html", label: "twitter:title", re: /name="twitter:title" content="Suede Creator Skills \| (\d+) Open-Source Agent Skills/, expected: totalSkillCount },
  { file: "docs/index.html", label: "JSON-LD numberOfItems", re: /"numberOfItems":\s*(\d+)/, expected: totalSkillCount },
  // The 71->73 growth left these index.html surfaces stale while the guarded
  // ones above stayed correct — every count-bearing phrase needs its own entry
  // here, or it drifts silently on the next pack-size change.
  { file: "docs/index.html", label: "og:image:alt", re: /property="og:image:alt" content="Suede Creator Skills: (\d+) open-source agent skills/, expected: totalSkillCount },
  { file: "docs/index.html", label: "twitter:image:alt", re: /name="twitter:image:alt" content="Suede Creator Skills: (\d+) open-source agent skills/, expected: totalSkillCount },
  { file: "docs/index.html", label: "JSON-LD ItemList description", re: /"The (\d+) public skills in the Suede Creator Skills pack\."/, expected: totalSkillCount },
  { file: "docs/index.html", label: "stat counter data-count", re: /<span class="count" data-count="(\d+)">/, expected: totalSkillCount },
  { file: "docs/index.html", label: "stat counter no-JS text", re: /<span class="count" data-count="\d+">(\d+)<\/span>/, expected: totalSkillCount },
  { file: "docs/index.html", label: "clone-route label", re: /copies all (\d+) into ~\/\.claude\/skills\//, expected: totalSkillCount },
  { file: "docs/guide.html", label: "guide description phrase", re: /Read the guide to (\d+) open-source agent skills/, expected: totalSkillCount, every: true },
  { file: "docs/guide.html", label: "twitter:description", re: /(\d+) MIT-licensed agent skills for Claude Code and Codex/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "JSON-LD WebPage description", re: /"(\d+) public, MIT-licensed agent skills for Claude Code and Codex/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "TOC disclosure entry", re: /Why (\d+) skills cost you almost nothing/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "disclosure headline first number", re: /Installing (\d+) skills does not cost you \d+ skills/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "disclosure headline second number", re: /does not cost you (\d+) skills\./, expected: totalSkillCount },
  { file: "docs/guide.html", label: "disclosure diagram desc", re: /All (\d+) skills sit on disk\./, expected: totalSkillCount },
  { file: "docs/guide.html", label: "marginal-cost note", re: /marginal cost of the (\d+)(?:st|nd|rd|th) skill/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "Codex install-all line", re: /install all (\d+) skills and both read-only MCP profiles/, expected: totalSkillCount },
  { file: "docs/plugins.html", label: "pathmap diagram desc", re: /land the same (\d+) skills/, expected: totalSkillCount },
  { file: "docs/plugins.html", label: "clone-route paragraph", re: /copies all (\d+) skills into/, expected: totalSkillCount },
  { file: "docs/plugins.html", label: "Codex plugin section-sub", re: /installs all (\d+) skills and registers/, expected: totalSkillCount },
  { file: "docs/plugins.html", label: "MCP search row", re: /instead of all (\d+)\./, expected: totalSkillCount },
  { file: "docs/plugins.html", label: "context-cost section-sub", re: /What (\d+) skills actually cost you in context/, expected: totalSkillCount },
  { file: "docs/copy.html", label: "announcement copy block", re: /live: (\d+) open-source agent skills/, expected: totalSkillCount, every: true },
  { file: "docs/llms.txt", label: "guide link description", re: /complete list of all (\d+)/, expected: totalSkillCount },
  // Rendered data visualizations count too: the catalog's lane chart shipped
  // a marketing bar of 39 under a "Where the 73 live" headline.
  // The catalog page's specialty chart, its lead, and the homepage's lane index
  // all publish the same five numbers. Each gets its own guard below (built from
  // the catalog's specialty index), so a re-cut cannot leave one surface stale.
  { file: "docs/skills/index.html", label: "start-here marketing count", re: /<h3>(\d+) marketing &amp; growth skills<\/h3>/, expected: marketingSkillCount },
  { file: "docs/copy.html", label: "full-description marketing count", re: /(\d+) marketing and growth skills including account-specific/, expected: marketingSkillCount },
  { file: "docs/blog/memory-belongs-in-skills.html", label: "blog post footer pack size", re: /is a (\d+)-skill, MIT-licensed pack/, expected: totalSkillCount },
  { file: "docs/skills/suede-full-send.html", label: "install headline", re: /Install the (\d+)-skill pack\./, expected: totalSkillCount },
  { file: "docs/guide.html", label: "title tag", re: /<title>Suede Creator Skills Guide \| (\d+) Agent Skills/, expected: totalSkillCount },
  // The guide's hero no longer carries the homepage's four-metric strip: the
  // page opens on its own table of contents so a reader can tell the guide
  // apart from the homepage at a glance. The pack size is still guarded on
  // this page by the title tag, the h2 heading, the hero "N skills, MIT
  // licensed" line, the disclosure headline, and the browse-all link label.
  // Numerals, not wordNumber: both headings used to spell the count out
  // ("Seventy-one skills"), which reads as marketing prose on a technical
  // page and drifts independently of every numeral elsewhere on the site.
  { file: "docs/guide.html", label: "h2 heading", re: /<h2[^>]*>(\d+) skills, one portable/, expected: totalSkillCount },
  { file: "docs/copy.html", label: "og:description agent skills count", re: /og:description" content="Use this copy when explaining Suede Creator Skills: (\d+) agent skills/, expected: totalSkillCount },
  { file: "docs/copy.html", label: "N-skill pack copy block", re: /A (\d+)-skill, MIT-licensed pack/, expected: totalSkillCount },
  { file: "docs/copy.html", label: "Twenty-N public skills paragraph", re: /([A-Za-z]+(?:-[A-Za-z]+)?) public skills your agent loads/, expected: totalSkillCount, wordNumber: true },
  { file: "docs/plugins.html", label: "lead paragraph", re: /(\d+) public skills your agent can load/, expected: totalSkillCount },
  { file: "docs/dav/index.html", label: "meta description", re: /Install (\d+) public Codex and Claude skills/, expected: totalSkillCount },
  { file: "docs/dav/index.html", label: "og:description", re: /property="og:description" content="(\d+) public skills for Suedify/, expected: totalSkillCount },
  { file: "docs/dav/index.html", label: "twitter:description", re: /name="twitter:description" content="(\d+) public skills for Suedify/, expected: totalSkillCount },
  { file: "docs/dav/index.html", label: "JSON-LD description", re: /"description":\s*"A (\d+)-skill public workflow/, expected: totalSkillCount },
  { file: "docs/dav/index.html", label: "hero-subline", re: /([A-Za-z]+(?:-[A-Za-z]+)?) public skills for Suedify/, expected: totalSkillCount, wordNumber: true },
  { file: "docs/skills/suede-workflow-skills.html", label: "meta description", re: /routes the agent across all (\d+) skills/, expected: totalSkillCount },
  { file: "docs/skills/suede-workflow-skills.html", label: "og:description", re: /Public Suede umbrella skill for (\d+) installable skills/, expected: totalSkillCount },
  { file: "docs/skills/suede-workflow-skills.html", label: "twitter:description", re: /umbrella workflow skill for (\d+) public Johnny Suede/, expected: totalSkillCount },
  { file: "docs/skills/suede-workflow-skills.html", label: "JSON-LD description", re: /umbrella entry point for (\d+) public Suede skill folders/, expected: totalSkillCount },
  { file: "docs/skills/suede-workflow-skills.html", label: "lead paragraph", re: /route the agent across all (\d+) Suede skills/, expected: totalSkillCount },
  { file: "docs/skills/suede-workflow-skills.html", label: "folders heading", re: /<h2>All (\d+) public skill folders<\/h2>/, expected: totalSkillCount },
  { file: ".claude-plugin/plugin.json", label: "description", re: /Installs all (\d+) skills/, expected: totalSkillCount },
  { file: ".codex-plugin/plugin.json", label: "description", re: /([A-Za-z]+(?:-[A-Za-z]+)?) public Suede skills/, expected: totalSkillCount, wordNumber: true },
  { file: "skills/suede-workflow-skills/references/install.md", label: "install reference skill count", re: /all (\d+) skills/, expected: totalSkillCount },
  { file: "skills/suede-workflow-skills/agents/openai.yaml", label: "short_description", re: /Umbrella workflow across (\d+) public skills/, expected: totalSkillCount },
  { file: "COPY.md", label: "subhead", re: /Install the (\d+)-skill Suede pack/, expected: totalSkillCount },
  { file: "PROMO.md", label: "companion skill count", re: /with ([A-Za-z]+(?:-[A-Za-z]+)?) companion skills/, expected: companionSkillCount, wordNumber: true },
  { file: "PRODUCT.md", label: "public skills count", re: /(\d+) public skills/, expected: totalSkillCount },
  { file: ".agents/plugins/marketplace.json", label: "Codex catalog skill count", re: /(\d+) public Suede skills/, expected: totalSkillCount },
  { file: ".claude-plugin/marketplace.json", label: "marketplace description", re: /(\d+) MIT-licensed skills/, expected: totalSkillCount },
  { file: ".claude-plugin/marketplace.json", label: "umbrella plugin description", re: /Installs all (\d+) skills/, expected: totalSkillCount },
  { file: "PROMO.md", label: "README intro pack size", re: /public (\d+)-skill agent workflow pack/, expected: totalSkillCount },
  // The shields.io badge is the first thing a visitor sees on the GitHub
  // landing page, and its URL value drifted to 29 while the alt text, the
  // README prose, and every other surface said 67. Guard both halves — the
  // rendered number lives in the URL, so alt text alone proves nothing.
  { file: "README.md", label: "skills badge URL value", re: /img\.shields\.io\/badge\/skills-(\d+)-c8a96e/, expected: totalSkillCount },
  { file: "README.md", label: "skills badge alt text", re: /!\[Skills: (\d+)\]/, expected: totalSkillCount },
  { file: "README.md", label: "hero alt skill count", re: /(\d+) open-source skills for Claude Code and Codex/, expected: totalSkillCount },
  // Homepage prose counts. All five of these sat at stale values (70, 28,
  // "six disciplines"-era lane math) while the guarded phrases said 71 —
  // every count a visitor can read must be pinned, not just the meta tags.
  { file: "docs/index.html", label: "hero subline skill count", re: /(\d+) open-source skills that read every diff/, expected: totalSkillCount },
  // Keyed to the stable half of the sentence. Anchoring on the leading word
  // ("Seven disciplines" -> "Five specialities" -> "Six specialities") made an
  // ordinary copy edit break the guard three times; the count is what this
  // check is actually about.
  { file: "docs/index.html", label: "lanes sub skill count", re: /specialities, (\d+) skills, one install/, expected: totalSkillCount },
  { file: "docs/index.html", label: "catalog headline skill count", re: /All (\d+) skills\./, expected: totalSkillCount },
  { file: "docs/index.html", label: "stats band public skills count", re: /data-count="(\d+)"/, expected: totalSkillCount },
  { file: "docs/index.html", label: "router headline command count", re: /memorize (\d+) commands/, expected: totalSkillCount },
  // Catalog page. Its h1 and og:description sat at 70 while the <title> and
  // meta description said 71 — the number a browsing visitor actually reads
  // was the stale one.
  { file: "docs/skills/index.html", label: "catalog h1 skill count", re: /<h1>(\d+) skills\. One honest line each\./, expected: totalSkillCount },
  { file: "docs/skills/index.html", label: "catalog og:description count", re: /public docs for all (\d+) Suede skills/, expected: totalSkillCount },
  { file: "docs/skills/index.html", label: "catalog section heading count", re: /All (\d+) skill folders/, expected: totalSkillCount },
  { file: "docs/skills/index.html", label: "catalog lane-map graphic count", re: /Where the (\d+) live/, expected: totalSkillCount },
  // Prose and structured-data counts that sat at 70 across four pages while
  // the guarded surfaces said 71. Every count a visitor or a crawler reads
  // gets a guard; historical changelog entries ("the pack moves 68 -> 70")
  // are deliberately not matched, since those record what was true then.
  { file: "docs/index.html", label: "pack-ships prose count", re: /This pack ships (\d+) of them under the MIT license/, expected: totalSkillCount, every: true },
  { file: "docs/index.html", label: "structured-data pack size", re: /pack of (\d+) installable Agent Skills/, expected: totalSkillCount, every: true },
  { file: "docs/guide.html", label: "guide pack size", re: /pack of (\d+) installable Agent Skills/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "guide skill-docs link count", re: /Browse all (\d+) installable skill folders/, expected: totalSkillCount },
  { file: "docs/plugins.html", label: "install page meta count", re: /Install all (\d+) Suede Creator Skills/, expected: totalSkillCount },
  { file: "docs/copy.html", label: "copy bank folder count", re: /It ships (\d+) public SKILL\.md folders/, expected: totalSkillCount },
  // Link labels. "Browse all N skills" is a button on three pages (five
  // instances) that pointed at a catalog page reading a different number —
  // the one count a visitor sees immediately before clicking through to be
  // contradicted. `every` because the phrase repeats within a page.
  { file: "docs/index.html", label: "browse-all link label", re: /Browse all (\d+) skills/, expected: totalSkillCount, every: true },
  { file: "docs/guide.html", label: "browse-all link label", re: /Browse all (\d+) skills/, expected: totalSkillCount, every: true },
  { file: "docs/plugins.html", label: "browse-all link label", re: /Browse all (\d+) skills/, expected: totalSkillCount, every: true },
  { file: "docs/guide.html", label: "guide title skill count", re: /Suede Creator Skills Guide \| (\d+) Agent Skills/, expected: totalSkillCount, every: true },
  { file: "docs/plugins.html", label: "umbrella install count", re: /installs all (\d+) skills\./, expected: totalSkillCount },
  // New guide and install-page surfaces. The h2 heading and plugins lead are
  // already guarded above; these cover the copy and graphics added alongside.
  { file: "docs/guide.html", label: "guide hero pack size", re: /(\d+) skills, MIT licensed/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "disclosure headline", re: /Installing (\d+) skills does not cost you/, expected: totalSkillCount },
  { file: "docs/guide.html", label: "disclosure description count", re: /(\d+) one-line descriptions/, expected: totalSkillCount },
  { file: "docs/plugins.html", label: "path-map graphic count", re: /Every path lands the same (\d+) skills/, expected: totalSkillCount },
  // Derived count: the diagram loads one skill, so the rest stay unread.
  // Guarded against total-1 so it tracks the pack instead of going stale.
  { file: "docs/guide.html", label: "disclosure unread count", re: /(\d+) stay unread/, expected: totalSkillCount - 1 },
  // The README hero and pack-map are SVGs with the count baked into the
  // artwork — the rendered number lives in the SVG text node, so README
  // prose alone proves nothing. Guard both graphics.
  { file: "docs/assets/readme/hero.svg", label: "hero graphic skill count", re: /letter-spacing="-12">(\d+)</, expected: totalSkillCount },
  { file: "docs/assets/readme/pack-map.svg", label: "pack-map title skill count", re: /(\d+) skills, seven lanes/, expected: totalSkillCount },
  // The install sections repeat "all N skills" five times — plugin, Codex
  // plugin, install.sh, Codex clone, and the Claude Code heading. All five sat
  // at 70 while the badge and intro said 71, because nothing guarded them and
  // a first-match check would have cleared the file on occurrence one.
  { file: "README.md", label: "install-section pack size", re: /[Aa]ll (\d+) skills/, expected: totalSkillCount, every: true },
  { file: "README.md", label: "public skill folders", re: /\*\*(\d+) public skill folders\*\*/, expected: totalSkillCount },
  { file: "CITATION.cff", label: "abstract skill count", re: /pack of (\d+) installable Agent Skills/, expected: totalSkillCount },
  { file: "docs/llms.txt", label: "summary skill count", re: /pack of (\d+) installable Agent Skills/, expected: totalSkillCount },
  { file: "docs/llms.txt", label: "skill index line", re: /Browse all (\d+) skills\./, expected: totalSkillCount },
  { file: "docs/skills/suede-full-send.html", label: "footer skill count", re: /is one of (\d+) public, MIT-licensed Agent Skills/, expected: totalSkillCount },
  // docs/skills/index.html is the catalog page — the one surface a visitor
  // browses to decide what the pack contains — and it had no count check at
  // all. Its title, twitter:description, and catalog heading sat at 28 while
  // the meta description on the same page said 67. Guard every count on it.
  { file: "docs/skills/index.html", label: "title tag", re: /<title>Suede Creator Skills Docs \| (\d+) Agent Skills/, expected: totalSkillCount },
  { file: "docs/skills/index.html", label: "meta description", re: /Browse all (\d+) Suede Creator Skills/, expected: totalSkillCount },
  { file: "docs/skills/index.html", label: "twitter:description", re: /Public docs for (\d+) Claude Code and Codex skills/, expected: totalSkillCount },
  { file: "docs/skills/index.html", label: "catalog heading", re: /<h2 id="catalog">All (\d+) skill folders<\/h2>/, expected: totalSkillCount },
  // The social card is the image attached to every share of every page, so a
  // stale number there is the most-viewed lie the repo can tell. Guard the SVG
  // source; the PNG is rendered from it by scripts/render-social-card.py.
  { file: "docs/assets/og-image-v2.svg", label: "social card headline number", re: /letter-spacing="-18">(\d+)<\/text>/, expected: totalSkillCount },
  { file: "docs/assets/og-image-v2.svg", label: "social card accessible desc", re: /<desc id="desc">(\d+) open-source agent skills/, expected: totalSkillCount },
  { file: "docs/skills/suede-full-send.html", label: "og:image:alt", re: /og:image:alt" content="Suede Creator Skills: (\d+) open-source Agent Skills/, expected: totalSkillCount },
  { file: "docs/skills/suede-full-send.html", label: "twitter:image:alt", re: /twitter:image:alt" content="Suede Creator Skills: (\d+) open-source Agent Skills/, expected: totalSkillCount },
];

// book/ is prose, so its counts are written inline rather than in a fixed
// template. Enumerate the files at validation time and guard every numeric
// skill-count phrase in each one, so a chapter that says "71 of them" fails
// the same way a stale meta tag does. Word-number spellings ("Seventy-one")
// are guarded separately below.
const bookDir = path.join(repoRoot, "book");
if (fs.existsSync(bookDir)) {
  // Deliberately narrow. The book quotes historical drift verbatim ("said
  // 'all 70 skills'") and counts unrelated things ("Thirty-eight of them add a
  // metadata block"), so a loose number-next-to-"skills" pattern fails on
  // correct prose. Guard only the canonical pack-size phrasings.
  const bookDigitCount = /\b(\d{2,})(?:[ -](?:public |installable |MIT-licensed )skills?\b|-skill\b| skill folders\b)/;
  const bookWordCount = /\b([A-Z][a-z]+-[a-z]+) public skills?\b/;
  for (const name of fs.readdirSync(bookDir).filter((f) => f.endsWith(".md") && f !== "STYLE.md")) {
    const text = readText(path.join(bookDir, name));
    if (bookDigitCount.test(text)) {
      countChecks.push({ file: `book/${name}`, label: "skill count in prose", re: bookDigitCount, expected: totalSkillCount, every: true });
    }
    if (bookWordCount.test(text)) {
      countChecks.push({ file: `book/${name}`, label: "spelled skill count in prose", re: bookWordCount, expected: totalSkillCount, every: true, wordNumber: true });
    }
  }
}

// The book states more about the pack than its size: byte totals, how many
// descriptions close with a NOT FOR: clause, how many carry a metadata block,
// how long one named skill is. The patterns above match none of those, so all
// of them sat at their 71-skill values through two releases while every
// guarded surface moved to 73. Each number below is recomputed from disk by
// scripts/lib/book-facts.mjs, whose definitions reproduce the figures the book
// shipped with. Run `node scripts/measure-book-facts.mjs` to see them.
const bookFacts = measureBookFacts();
const grader = measureSkillFile("suede-code-grader");
const deslop = measureSkillFile("suede-deslop");
const commaNumber = (value) => parseInt(String(value).replace(/,/g, ""), 10);
// "twenty-fourth" -> 24. The corpus-to-description ratio is written as an
// ordinal, which wordNumber() cannot read.
const ORDINAL_ONES = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9 };
function wordOrdinal(word) {
  const parts = String(word).toLowerCase().split("-");
  const last = parts.pop();
  const ones = ORDINAL_ONES[last];
  const tens = tensWords[last.replace(/ieth$/, "y")];
  const base = parts.length ? wordNumber(parts.join("-")) : 0;
  if (ones !== undefined) return base === null ? null : base + ones;
  return tens === undefined ? null : tens;
}

countChecks.push(
  { file: "book/01-the-competence-gap.md", label: "SKILL.md folder count", re: /SKILL\.md`, (\d+) of them, MIT licensed/, expected: totalSkillCount },
  { file: "book/01-the-competence-gap.md", label: "progressive-disclosure heading", re: /why (\d+) skills fit/, expected: totalSkillCount },
  { file: "book/01-the-competence-gap.md", label: "corpus file count", re: /The (\d+) `SKILL\.md` files in this/, expected: totalSkillCount },
  { file: "book/01-the-competence-gap.md", label: "corpus byte total", re: /repo total ([\d,]+) bytes/, expected: bookFacts.totalBytes, parse: commaNumber },
  { file: "book/01-the-competence-gap.md", label: "resident description count", re: /all (\d+) descriptions together come to/, expected: totalSkillCount },
  { file: "book/01-the-competence-gap.md", label: "resident description bytes", re: /descriptions together come to ([\d,]+) bytes/, expected: bookFacts.descriptionBytes, parse: commaNumber },
  { file: "book/01-the-competence-gap.md", label: "corpus-to-description ratio", re: /roughly a\s+([a-z]+(?:-[a-z]+)?) of the corpus/, expected: bookFacts.corpusToDescriptionRatio, parse: wordOrdinal },
  { file: "book/01-the-competence-gap.md", label: "NOT FOR: description count", re: /that (\d+) of the \d+ descriptions in this repo use/, expected: bookFacts.notForColonCount },
  { file: "book/01-the-competence-gap.md", label: "NOT FOR: denominator", re: /that \d+ of the (\d+) descriptions in this repo use/, expected: totalSkillCount },
  { file: "book/01-the-competence-gap.md", label: "suede-code-grader line count", re: /`skills\/suede-code-grader\/SKILL\.md` is\s+(\d+) lines/, expected: grader.lines },
  { file: "book/02-anatomy-of-a-skill.md", label: "frontmatter survey skill count", re: /Across all (\d+) skills, the frontmatter carries/, expected: totalSkillCount },
  { file: "book/02-anatomy-of-a-skill.md", label: "name key count", re: /carries `name` (\d+) times/, expected: totalSkillCount },
  { file: "book/02-anatomy-of-a-skill.md", label: "description key count", re: /and `description`\s+(\d+) times/, expected: totalSkillCount },
  { file: "book/02-anatomy-of-a-skill.md", label: "metadata block count", re: /([A-Z][a-z]+(?:-[a-z]+)?) of them add a `metadata` block/, expected: bookFacts.metadataBlocks, wordNumber: true },
  { file: "book/02-anatomy-of-a-skill.md", label: "corpus file count", re: /In this repo the (\d+) files total/, expected: totalSkillCount },
  { file: "book/02-anatomy-of-a-skill.md", label: "corpus byte total", re: /files total ([\d,]+) bytes;/, expected: bookFacts.totalBytes, parse: commaNumber },
  { file: "book/02-anatomy-of-a-skill.md", label: "resident description count", re: /the (\d+) descriptions together are/, expected: totalSkillCount },
  { file: "book/02-anatomy-of-a-skill.md", label: "resident description bytes", re: /descriptions together are ([\d,]+)\./, expected: bookFacts.descriptionBytes, parse: commaNumber },
  { file: "book/02-anatomy-of-a-skill.md", label: "suede-code-grader description length", re: /does with ([\d,]+) characters/, expected: grader.descriptionCharacters, parse: commaNumber },
  { file: "book/02-anatomy-of-a-skill.md", label: "suede-deslop description length", re: /same job in ([\d,]+) characters/, expected: deslop.descriptionCharacters, parse: commaNumber },
  { file: "book/02-anatomy-of-a-skill.md", label: "NOT FOR: description count", re: /([A-Z][a-z]+-[a-z]+) of the \d+ descriptions in this repo end with/, expected: bookFacts.notForColonCount, wordNumber: true },
  { file: "book/02-anatomy-of-a-skill.md", label: "NOT FOR: denominator", re: /[A-Z][a-z]+-[a-z]+ of the (\d+) descriptions in this repo end with/, expected: totalSkillCount },
  // The pairwise figure the sentence quotes is a floor ("more than two thousand
  // six hundred"), which only breaks if the pack shrinks. Guard the count.
  { file: "book/03-the-description-contract.md", label: "namespace collision skill count", re: /([A-Z][a-z]+-[a-z]+) have more\s+than two thousand/, expected: totalSkillCount, wordNumber: true },
  { file: "book/14-the-first-ninety-days.md", label: "anti-goal skill count", re: /Do not read all (\d+) skills/, expected: totalSkillCount },
  { file: "book/README.md", label: "skill index appendix count", re: /all (\d+) skills, grouped by/, expected: totalSkillCount },
  { file: "book/00-front-matter.md", label: "progressive-disclosure pack size", re: /grow to ([a-z]+-[a-z]+) skills/, expected: totalSkillCount, wordNumber: true },
  { file: "book/00-front-matter.md", label: "marketingskills attribution count", re: /([A-Z][a-z]+(?:-[a-z]+)?) of the marketing and growth skills are/, expected: bookFacts.marketingAdapted, wordNumber: true },
  { file: "book/A1-skill-index.md", label: "marketingskills attribution count", re: /([A-Z][a-z]+(?:-[a-z]+)?) of these are adapted from/, expected: bookFacts.marketingAdapted, wordNumber: true },
  // STYLE.md is the brief the book is written against, so a stale fact there
  // seeds stale prose in the next chapter someone writes. It is excluded from
  // the loop above because it quotes counts as bare facts, not prose.
  { file: "book/STYLE.md", label: "skill folder count", re: /(\d+) public skill folders/, expected: totalSkillCount },
  { file: "book/STYLE.md", label: "marketingskills attribution count", re: /(\d+) of the marketing skills are adapted/, expected: bookFacts.marketingAdapted },
);

// Every specialty's number, on every surface that prints it. Built from the
// catalog rather than hand-listed, so adding a sixth specialty extends the
// guard automatically instead of shipping an unguarded chart.
for (const spec of specialtyIndex) {
  const label = spec.label.replace(/&/g, "&amp;");
  const descLabel = spec.label.replace(/&/g, "and");
  countChecks.push(
    {
      file: "docs/skills/index.html",
      label: `lanemap bar value: ${spec.key}`,
      re: new RegExp(`>${escapeRegExp(label)}</text>\\s*<rect[^>]*/>\\s*<text[^>]*>(\\d+)</text>`),
      expected: spec.count
    },
    {
      file: "docs/skills/index.html",
      label: `lanemap desc: ${spec.key}`,
      re: new RegExp(`${escapeRegExp(descLabel)} (\\d+)[,.]`),
      expected: spec.count
    },
    {
      file: "docs/skills/index.html",
      label: `catalog specialty badge: ${spec.key}`,
      re: new RegExp(`id="spec-${spec.key}-h">[^<]*</h3><span class="spec-count">(\\d+)</span>`),
      expected: spec.count
    },
    {
      file: "docs/skills/index.html",
      label: `catalog lead: ${spec.key}`,
      re: new RegExp(`${escapeRegExp(spec.label.toLowerCase().replace(/&/g, "&amp;"))} \\((\\d+)\\)`),
      expected: spec.count
    },
    {
      file: "docs/index.html",
      label: `homepage lane index: ${spec.key}`,
      re: new RegExp(`<span class="lane-name">${escapeRegExp(label)}</span>\\s*<span class="lane-desc">[^<]*</span>\\s*<span class="lane-count">(\\d+) skills</span>`),
      expected: spec.count
    },
    {
      file: "docs/index.html",
      label: `homepage catalog badge: ${spec.key}`,
      re: new RegExp(`<span class="catalog-lane-name">${escapeRegExp(label)}</span>\\s*<span class="catalog-lane-count">(\\d+) skills</span>`),
      expected: spec.count
    }
  );
}

for (const check of countChecks) {
  const filePath = path.join(repoRoot, check.file);
  if (!fs.existsSync(filePath)) {
    warn.push(`Count check skipped — ${check.file} does not exist (${check.label})`);
    continue;
  }
  const text = readText(filePath);
  // Most checks guard a phrase that appears once. `every: true` guards a phrase
  // that repeats — every occurrence is validated, not just the first. Without
  // it, a repeated sentence drifts silently past the first hit: README said
  // "71" in three places and "all 70 skills" in five others, and a first-match
  // check on either phrasing would have reported the file clean.
  const matches = check.every
    ? [...text.matchAll(new RegExp(check.re.source, `${check.re.flags.replace(/g/g, "")}g`))]
    : [text.match(check.re)].filter(Boolean);
  if (matches.length === 0) {
    warn.push(`Count check pattern not found in ${check.file} (${check.label}) — copy may have moved; update scripts/validate-skill-pack.mjs`);
    continue;
  }
  matches.forEach((match, i) => {
    const where = check.every ? ` [occurrence ${i + 1} of ${matches.length}]` : "";
    const found = check.parse ? check.parse(match[1]) : check.wordNumber ? wordNumber(match[1]) : parseInt(match[1], 10);
    if (found === null || Number.isNaN(found)) {
      warn.push(`Count check could not parse a number in ${check.file} (${check.label})${where}: "${match[1]}"`);
      return;
    }
    if (found !== check.expected) {
      fail.push(`Stale skill count in ${check.file} (${check.label})${where}: says ${found}, expected ${check.expected}`);
    }
  });
}

// Structural guard for the book's skill index. book/README.md calls the
// appendix "all N skills", and the count check above only proves N matches the
// directory — not that the appendix lists them. It listed 71 of 73 for two
// releases: suede-ai-seo and suede-attribution shipped and nothing noticed.
{
  const indexPath = path.join(repoRoot, "book/A1-skill-index.md");
  if (fs.existsSync(indexPath)) {
    const listed = new Set((readText(indexPath).match(/`[a-z0-9][a-z0-9-]*`/g) || []).map((s) => s.replace(/`/g, "")));
    const missing = skillNames.filter((name) => !listed.has(name));
    if (missing.length > 0) {
      fail.push(`book/A1-skill-index.md is missing ${missing.length} skill(s) it claims to index: ${missing.join(", ")}`);
    }
  }
}

// Structural guard for the docs catalog page. String checks above prove the
// stated numbers are 67; this proves the page actually *lists* 67 skills and
// that each lane badge matches the rows under it. The "Design & copy" badge
// read 4 above 5 rows, which no count-string check would ever have caught.
{
  const catalogPath = path.join(repoRoot, "docs/skills/index.html");
  if (fs.existsSync(catalogPath)) {
    const fullText = readText(catalogPath);
    // Scope every row check to the catalog <section> itself. Counting rows
    // file-wide passes even when a whole lane has escaped into another
    // section: 38 rows once sat inside the gold install band, rendering gold
    // text on a gold background, and a file-wide count saw all 67 and passed.
    // The catalog now nests a <section class="spec"> per specialty, so slicing
    // to the first </section> would stop at the end of "Ship" and report the
    // other four specialities as escaped rows. Walk the tags and close on the
    // matching one instead.
    const catalogStart = fullText.indexOf('aria-labelledby="catalog"');
    const catalogText = catalogStart === -1 ? "" : (() => {
      let depth = 1;
      const tagRe = /<\/?section\b/g;
      tagRe.lastIndex = catalogStart;
      let m;
      while ((m = tagRe.exec(fullText))) {
        depth += m[0] === "<section" ? 1 : -1;
        if (depth === 0) return fullText.slice(catalogStart, m.index);
      }
      return fullText.slice(catalogStart);
    })();
    if (!catalogText) {
      fail.push('docs/skills/index.html has no <section aria-labelledby="catalog"> to validate');
    }
    const strayRows = (fullText.match(/class="row" href=/g) || []).length
      - (catalogText.match(/class="row" href=/g) || []).length;
    if (strayRows > 0) {
      fail.push(`docs/skills/index.html has ${strayRows} catalog row(s) outside the catalog section — a lane has escaped its container`);
    }
    const rowNames = [...catalogText.matchAll(/class="row" href="\.?\/?([a-z0-9-]+)\.html"/g)]
      .map((m) => m[1]);
    const missingRows = skillNames.filter((name) => !rowNames.includes(name));
    const orphanRows = rowNames.filter((name) => !skillNames.includes(name));
    if (missingRows.length) {
      fail.push(`docs/skills/index.html catalog is missing rows for: ${missingRows.join(", ")}`);
    }
    if (orphanRows.length) {
      fail.push(`docs/skills/index.html catalog links skills that do not exist: ${orphanRows.join(", ")}`);
    }
    // Split on the opening tag without its closing bracket: every lane carries
    // an id attribute, so `<div class="lane">` matched nothing and this loop sat
    // inert for as long as the ids have existed.
    for (const lane of catalogText.split('<div class="lane" ').slice(1)) {
      const heading = lane.match(/<h4>(.*?)<\/h4>/)?.[1] ?? "(unnamed lane)";
      const claimed = Number(lane.match(/lane-count">(\d+)/)?.[1]);
      const actual = (lane.match(/class="row" href=/g) || []).length;
      if (Number.isNaN(claimed)) {
        warn.push(`docs/skills/index.html lane "${heading}" has no lane-count badge`);
      } else if (claimed !== actual) {
        fail.push(`docs/skills/index.html lane "${heading}" badge says ${claimed} but has ${actual} rows`);
      }
    }
    // Same check one level up: a specialty badge must match the rows nested
    // under all of its lanes, and the page must carry exactly the specialities
    // the catalog indexes.
    const specBlocks = catalogText.split('<section class="spec" ').slice(1);
    const seenSpecs = new Set();
    for (const block of specBlocks) {
      const key = block.match(/id="spec-([a-z-]+)"/)?.[1] ?? "(unnamed)";
      seenSpecs.add(key);
      const claimed = Number(block.match(/spec-count">(\d+)</)?.[1]);
      const actual = (block.match(/class="row" href=/g) || []).length;
      if (Number.isNaN(claimed)) {
        fail.push(`docs/skills/index.html specialty "${key}" has no spec-count badge`);
      } else if (claimed !== actual) {
        fail.push(`docs/skills/index.html specialty "${key}" badge says ${claimed} but has ${actual} rows`);
      }
    }
    for (const spec of specialtyIndex) {
      if (!seenSpecs.has(spec.key)) {
        fail.push(`docs/skills/index.html has no section for catalog specialty "${spec.key}"`);
      }
    }
    for (const key of seenSpecs) {
      if (!specialtyIndex.some((spec) => spec.key === key)) {
        fail.push(`docs/skills/index.html publishes specialty "${key}" that the catalog does not index`);
      }
    }
  } else {
    fail.push("docs/skills/index.html is missing — the docs catalog page cannot be validated");
  }
}

// Dangling in-page anchor guard. Re-cutting the catalog twice left a button
// pointing at #lane-marketing and then at #spec-earn after both ids were gone:
// the link renders fine and silently does nothing. Every same-page href="#..."
// must resolve to an id on that page.
{
  const anchorPages = ["docs/index.html", "docs/skills/index.html", "docs/guide.html", "docs/plugins.html"];
  for (const page of anchorPages) {
    const pagePath = path.join(repoRoot, page);
    if (!fs.existsSync(pagePath)) continue;
    const pageText = readText(pagePath);
    const ids = new Set([...pageText.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const targets = new Set(
      [...pageText.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).filter((target) => target && target !== "main")
    );
    const dangling = [...targets].filter((target) => !ids.has(target));
    if (dangling.length) {
      fail.push(`${page} has in-page link(s) pointing at ids that do not exist: ${dangling.join(", ")}`);
    }
  }
}

// Competitive-claim guard. The hero benchmark strip summarizes the scorecard
// table further down the same page. The two drifted once: the strip asserted
// an outright win over both comparison packs while the table's own summary
// row did not support it. Any published assertion about a named third-party
// project must be recomputed from that table, never hand-written beside it.
{
  const gradeRank = { "A+": 6, A: 5, "A-": 4, "B+": 3, B: 2, "B-": 1, "C+": 0.5, C: 0 };
  // Anchor on the details element's class, not the summary copy — the copy
  // ("See the full 15-category scorecard") drifted once and silently skipped
  // this guard while the scorecard table was still on the page.
  const detailBlock = docsRootText.split('class="scorecard-details')[1]?.split("</details>")[0];
  if (!detailBlock) {
    fail.push("docs/index.html scorecard detail table not found — the competitive-claim guard cannot run");
  } else {
    const scored = [...detailBlock.matchAll(/<tr>(.*?)<\/tr>/gs)]
      .map((m) => [...m[1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)].map((c) => c[1].replace(/<[^>]+>/g, "").trim()))
      .filter((cells) => cells.length === 4 && !["Category", "Overall"].includes(cells[0]));
    const unknown = scored.filter(([, ...g]) => g.some((grade) => !(grade in gradeRank)));
    if (unknown.length) {
      fail.push(`docs/index.html scorecard has unrecognized grades in: ${unknown.map((r) => r[0]).join(", ")}`);
    }
    const beatsBoth = scored.filter(([, s, g, p]) => gradeRank[s] > gradeRank[g] && gradeRank[s] > gradeRank[p]);
    const losesBoth = scored.filter(([, s, g, p]) => gradeRank[s] < gradeRank[g] && gradeRank[s] < gradeRank[p]);
    const overallRow = [...detailBlock.matchAll(/<tr>(.*?)<\/tr>/gs)]
      .map((m) => [...m[1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)].map((c) => c[1].replace(/<[^>]+>/g, "").trim()))
      .find((cells) => cells.length === 4 && cells[0] === "Overall");
    // Current strip copy: "Self-graded on the Suede ship-gate rubric: Suede
    // takes <N of M categories> outright, and loses Overall to Superpowers,
    // <their grade> to <our grade>." Every number in it is a published
    // assertion about named third-party packs, so all four are re-derived
    // from the table: the win count, the category total, and both Overall
    // grades. The self-graded basis and the Overall loss must stay in the
    // strip itself — that is the only benchmark copy above the fold.
    const claim = docsRootText.match(
      /Self-graded on the Suede ship-gate rubric: Suede takes <span class="bench-highlight">(\d+) of (\d+) categories<\/span> outright, and loses Overall to <a href="#scorecard">Superpowers, (\S+) to (\S+)<\/a>/
    );
    if (!claim) {
      fail.push("docs/index.html hero benchmark claim not found or reworded — it must be re-derived from the scorecard table and must keep the self-graded disclosure");
    } else {
      const wins = Number(claim[1]);
      const total = Number(claim[2]);
      if (wins !== beatsBoth.length) {
        fail.push(`docs/index.html hero claims it beats both in ${wins} categories; the scorecard shows ${beatsBoth.length} (${beatsBoth.map((r) => r[0]).join(", ")})`);
      }
      if (total !== scored.length) {
        fail.push(`docs/index.html hero claims ${total} graded categories; the scorecard table has ${scored.length}`);
      }
      if (losesBoth.length === 0) {
        warn.push("docs/index.html scorecard shows no lose-both categories — confirm the table still publishes losses");
      }
      if (!overallRow) {
        fail.push("docs/index.html scorecard has no Overall row — the hero's Overall-loss claim cannot be re-derived");
      } else {
        const [, suedeOverall, , powersOverall] = overallRow;
        if (claim[3] !== powersOverall || claim[4] !== suedeOverall) {
          fail.push(`docs/index.html hero states Overall "Superpowers, ${claim[3]} to ${claim[4]}"; the scorecard Overall row reads Superpowers ${powersOverall}, Suede ${suedeOverall}`);
        }
        if (gradeRank[suedeOverall] >= gradeRank[powersOverall]) {
          fail.push(`docs/index.html hero says Suede loses Overall to Superpowers, but the scorecard Overall row reads Suede ${suedeOverall} vs Superpowers ${powersOverall} — reword the strip`);
        }
      }
    }
    // The four hero tiles must be exactly the beat-both categories, or the
    // strip cherry-picks wins while claiming to be the whole picture.
    const heroStrip = docsRootText.split('id="hero-bench"')[1]?.split("</div>\n\n  </div>")[0] ?? "";
    for (const [category] of beatsBoth) {
      const tileLabel = category.split(" / ")[0];
      if (!heroStrip.includes(tileLabel) && !heroStrip.toLowerCase().includes(tileLabel.toLowerCase())) {
        warn.push(`docs/index.html hero strip omits beat-both category "${category}"`);
      }
    }
  }
}

// Lane-math guard. Three surfaces publish a per-lane breakdown of the pack —
// the homepage lanes overview, the homepage catalog lane heads, and the skill
// catalog page's own lane badges. The first two drifted to 27 and 28 while
// every other number on the page said 71. Each set must sum to the pack size,
// which also catches a lane added to the prose but not to the breakdown.
{
  const catalogPagePath = path.join(repoRoot, "docs/skills/index.html");
  const catalogPageText = fs.existsSync(catalogPagePath) ? readText(catalogPagePath) : "";
  const laneSets = [
    { file: "docs/index.html", label: "lanes overview", re: /class="lane-count">(\d+) skills/g, text: docsRootText },
    { file: "docs/index.html", label: "catalog lane heads", re: /class="catalog-lane-count">(\d+) skills/g, text: docsRootText },
    // The catalog page's lane badges are bare numbers, not "N skills".
    { file: "docs/skills/index.html", label: "lane heads", re: /<span class="lane-count">(\d+)<\/span>/g, text: catalogPageText },
  ];
  for (const { file, label, re, text } of laneSets) {
    const counts = [...text.matchAll(re)].map((m) => Number(m[1]));
    if (counts.length === 0) {
      warn.push(`${file} ${label} counts not found — lane-math guard skipped`);
      continue;
    }
    const sum = counts.reduce((a, b) => a + b, 0);
    if (sum !== totalSkillCount) {
      fail.push(`${file} ${label} counts sum to ${sum} (${counts.join("+")}), not ${totalSkillCount}`);
    }
  }
}

// Discoverability guard. Every plugin the marketplace ships is installable by
// name, so a plugin that appears in no install copy is a product nobody can
// find. suede-marketing bundles 38 of the skills and went unmentioned on every
// page while both 4-skill subsets were advertised. Each subset's advertised
// skill count must match the manifest too, or the copy oversells the bundle.
{
  const marketplacePath = path.join(repoRoot, ".claude-plugin/marketplace.json");
  const installPagePath = path.join(repoRoot, "docs/plugins.html");
  if (fs.existsSync(marketplacePath) && fs.existsSync(installPagePath)) {
    const manifest = JSON.parse(readText(marketplacePath));
    const installText = readText(installPagePath);
    const umbrella = "suede-skills";
    // llms.txt is the file agents read to learn what the pack contains, so a
    // plugin missing there is as undiscoverable as one missing from the install
    // page. Guarding only plugins.html let llms.txt keep advertising two
    // subsets after a third shipped.
    const llmsPath = path.join(repoRoot, "docs/llms.txt");
    const llmsText = fs.existsSync(llmsPath) ? readText(llmsPath) : "";
    for (const plugin of manifest.plugins ?? []) {
      if (plugin.name === umbrella) continue;
      if (llmsText && !llmsText.includes(`${plugin.name}@suede`)) {
        fail.push(`docs/llms.txt never mentions the ${plugin.name} plugin — agents reading it cannot discover the subset`);
      }
      if (!installText.includes(`${plugin.name}@suede`)) {
        fail.push(`docs/plugins.html never advertises the ${plugin.name} plugin, so nobody can discover it`);
        continue;
      }
      const bundled = Array.isArray(plugin.skills) ? plugin.skills.length : null;
      if (bundled === null) continue;
      const advertised = installText.match(
        new RegExp(`${plugin.name}@suede</code>\\s*\\((\\d+)\\s+skills`)
      );
      if (advertised && Number(advertised[1]) !== bundled) {
        fail.push(`docs/plugins.html says ${plugin.name} bundles ${advertised[1]} skills; the manifest lists ${bundled}`);
      }
      for (const entry of plugin.skills) {
        const dir = path.join(repoRoot, entry.replace(/^\.\//, ""));
        if (!fs.existsSync(dir)) {
          fail.push(`${plugin.name} bundles a skill that does not exist: ${entry}`);
        }
      }
    }
    const subsetCount = (manifest.plugins ?? []).filter((p) => p.name !== umbrella).length;
    const wordClaim = installText.match(/([A-Za-z]+) focused subsets install the same way/);
    if (wordClaim && wordNumber(wordClaim[1]) !== subsetCount) {
      fail.push(`docs/plugins.html claims "${wordClaim[1]}" focused subsets; the manifest ships ${subsetCount}`);
    }
  }
}

// Every rule a page is styled by, inline or linked. Interior pages load their
// CSS from docs/assets/*.css, so a guard that reads only the HTML would see no
// styles at all and either fire on every page or, worse, stop checking.
const linkedStyleCache = new Map();
function pageStyles(pagePath, text) {
  let all = text;
  for (const match of text.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)) {
    const href = match[0].match(/href="([^"]+)"/i)?.[1];
    if (!href || /^(https?:)?\/\//.test(href)) continue;
    const resolved = path.resolve(path.dirname(pagePath), href.split(/[?#]/)[0]);
    if (!linkedStyleCache.has(resolved)) {
      linkedStyleCache.set(resolved, fs.existsSync(resolved) ? readText(resolved) : null);
    }
    const css = linkedStyleCache.get(resolved);
    if (css === null) {
      fail.push(`${path.relative(repoRoot, pagePath)} links a stylesheet that does not exist: ${href}`);
      continue;
    }
    all += "\n" + css;
  }
  return all;
}

// Bypass-blocks guard (WCAG 2.4.1, Level A). Every page carries the same nav,
// so without a skip link a keyboard or screen-reader user tabs through it on
// every one. Two pages had the pattern and the other 72 never got it. A skip
// link also has to actually work: the target needs tabindex="-1" or focus stays
// on the nav after activation and the link is decorative.
{
  const a11y = [];
  for (const pagePath of walk(path.join(repoRoot, "docs")).filter((f) => f.endsWith(".html"))) {
    const text = readText(pagePath);
    const relative = path.relative(repoRoot, pagePath);
    if (text.includes('content="noindex') || !text.includes("<main")) continue;
    if (!/href="#main"/.test(text)) {
      a11y.push(`${relative} has no skip link (add <a class="skip-link" href="#main">)`);
      continue;
    }
    const mainTag = text.match(/<main[^>]*>/)?.[0] ?? "";
    if (!/id="main"/.test(mainTag)) {
      a11y.push(`${relative} has a skip link but no element with id="main" to land on`);
    } else if (!/tabindex="-1"/.test(mainTag)) {
      a11y.push(`${relative} skip-link target is not focusable — add tabindex="-1" to <main id="main">`);
    }
    if (!pageStyles(pagePath, text).includes(".skip-link")) {
      a11y.push(`${relative} has a skip link with no .skip-link styles, so it cannot be revealed on focus`);
    }
  }
  for (const problem of a11y) fail.push(problem);
}

// Contrast-token guard (WCAG 1.4.3). The palette has a deep red for fills and
// borders and a lighter red for text; the homepage used the fill red as text
// on four section labels, landing at ~2.1:1 against the near-black background.
// The lighter values below are the measured AA-passing ones -- they clear 4.5:1
// on every surface these labels sit on, from the page base to the lightest
// panel. Raw literals are what drifted, so text colours must go through tokens.
{
  const FILL_ONLY_RED = "#8b1a1a";
  const TEXT_TOKENS = {
    "--red-text": "#c6625a",
    "--color-accent-red-text": "#c6625a",
    "--color-text-dim": "#7f7a70"
  };
  for (const pagePath of walk(path.join(repoRoot, "docs")).filter((f) => f.endsWith(".html") || f.endsWith(".css"))) {
    const text = readText(pagePath);
    const relative = path.relative(repoRoot, pagePath);
    // "border-color:" must not count as a text colour
    const asText = text.match(new RegExp(String.raw`(?<![-\w])color:\s*${FILL_ONLY_RED}`, "gi")) || [];
    if (asText.length) {
      fail.push(`${relative} uses the fill-only red ${FILL_ONLY_RED} as a text colour ${asText.length}x — it fails contrast; use a text token`);
    }
    for (const [token, expected] of Object.entries(TEXT_TOKENS)) {
      const declared = text.match(new RegExp(String.raw`${token}:\s*(#[0-9a-f]{6})`, "i"));
      if (declared && declared[1].toLowerCase() !== expected) {
        fail.push(`${relative} sets ${token} to ${declared[1]}; the AA-passing value is ${expected}`);
      }
    }
  }
}

// Shared-stylesheet guard. The interior pages used to each carry their own copy
// of the same template in an inline <style>, plus a second copy of the install
// block: 1.88MB across the site, none of it cacheable, so a reader opening a
// second skill page re-downloaded CSS the browser already had. The copies had
// also drifted -- 43 skill pages carried table styles the other 27 lacked, and
// those 27 carried link-row and hero-grid styles the 43 lacked -- which is what
// one template living in 73 files turns into. They now link docs/assets/*.css.
// Re-inlining starts that over, so require the links and cap any page block.
{
  const SHARED = [
    { dir: "docs/skills", sheets: ["assets/site.css", "assets/skill.css"] },
    { dir: "docs/blog", sheets: ["assets/site.css", "assets/prose.css"] },
    { dir: "docs/book", sheets: ["assets/site.css", "assets/prose.css", "assets/book.css"] },
  ];
  // Bespoke pages: their own design, not the interior-page template. Linking an
  // archetype sheet would restyle them, so they keep their CSS inline.
  const BESPOKE = new Set([
    "docs/skills/index.html",
    "docs/skills/suede-full-send.html",
    "docs/skills/suede-instagram-growth.html",
    "docs/blog/index.html",
  ]);
  const MAX_INLINE = 2000;
  for (const { dir, sheets } of SHARED) {
    const abs = path.join(repoRoot, dir);
    if (!fs.existsSync(abs)) continue;
    for (const file of fs.readdirSync(abs).filter((f) => f.endsWith(".html"))) {
      const relative = `${dir}/${file}`;
      if (BESPOKE.has(relative)) continue;
      const text = readText(path.join(abs, file));
      for (const sheet of sheets) {
        if (!text.includes(`rel="stylesheet" href="../${sheet}"`)) {
          fail.push(`${relative} does not link ${sheet} — interior pages share the extracted stylesheets instead of inlining the template`);
        }
      }
      const inlineBytes = [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
        .reduce((n, m) => n + m[1].length, 0);
      if (inlineBytes > MAX_INLINE) {
        fail.push(`${relative} carries ${inlineBytes} bytes of inline CSS (limit ${MAX_INLINE}) — page overrides stay small; shared rules belong in docs/assets/*.css`);
      }
    }
  }
}

// llms.txt coverage. This file exists so an agent can learn what the pack
// contains without crawling; a skill absent from it is invisible to exactly
// the audience the pack is built for. It listed 29 of 67 -- the whole
// marketing lane was missing -- while the count line above it said 67, so no
// count check could have caught the gap. Every link must also resolve, since a
// 404 in this file teaches an agent a URL that does not exist.
{
  const llmsPath = path.join(repoRoot, "docs/llms.txt");
  if (!fs.existsSync(llmsPath)) {
    fail.push("docs/llms.txt is missing");
  } else {
    const llmsText = readText(llmsPath);
    const uncovered = skillNames.filter((name) => !llmsText.includes(name));
    if (uncovered.length) {
      fail.push(`docs/llms.txt does not reference ${uncovered.length} of ${skillNames.length} skills: ${uncovered.join(", ")}`);
    }
    // Completeness claims must be true of the page they describe. llms.txt
    // called guide.html "Complete documentation of every skill" while that page
    // covers the core workflow skills only, so an agent following the link to
    // enumerate the pack would come away with a fraction of it. A claim like
    // this is only allowed when the linked page actually references every skill.
    const COMPLETENESS = /\b(complete documentation of every skill|documentation of every skill|every skill|all \d+ skills)\b/i;
    for (const entry of llmsText.split("\n").filter((line) => line.trim().startsWith("- ["))) {
      if (!COMPLETENESS.test(entry)) continue;
      const linked = entry.match(/\]\((https:\/\/skills\.suedeai\.ai\/[^)]*)\)/)?.[1];
      if (!linked) continue;
      const rel = linked.slice("https://skills.suedeai.ai/".length) || "index.html";
      const target = path.join(repoRoot, "docs", rel.endsWith("/") ? `${rel}index.html` : rel);
      if (!fs.existsSync(target)) continue;
      const pageText = readText(target);
      const absent = skillNames.filter((name) => !pageText.includes(name));
      if (absent.length) {
        fail.push(`docs/llms.txt claims completeness for ${rel} but that page omits ${absent.length} of ${skillNames.length} skills`);
      }
    }
    const siteBase = "https://skills.suedeai.ai/";
    const blobBase = "https://github.com/JasonColapietro/suede-creator-skills/blob/main/";
    for (const rawUrl of llmsText.match(/https:\/\/[^\s)\]]+/g) || []) {
      const url = rawUrl.replace(/[.,)]+$/, "");
      let target = null;
      if (url.startsWith(siteBase)) {
        const rel = url.slice(siteBase.length) || "index.html";
        target = path.join(repoRoot, "docs", rel.endsWith("/") ? `${rel}index.html` : rel);
      } else if (url.startsWith(blobBase)) {
        target = path.join(repoRoot, url.slice(blobBase.length));
      }
      if (target && !fs.existsSync(target)) {
        fail.push(`docs/llms.txt links to a path that does not exist: ${url}`);
      }
    }
  }
}

// The MCP surface counts are published as prose in two docs. The test suite
// already pins mcp/catalog.json against the live server, so the numbers are
// true at the source; what was unguarded is the sentence quoting them. Adding
// a tool would update the server, the catalog, and the test while leaving both
// pages advertising the old figure -- the same drift that stranded the skill
// count on unguarded surfaces.
{
  const mcpCatalogPath = path.join(repoRoot, "mcp/catalog.json");
  if (fs.existsSync(mcpCatalogPath)) {
    const mcp = JSON.parse(readText(mcpCatalogPath)).mcp ?? {};
    const expected = {
      tools: mcp.tools?.length,
      resources: mcp.resources?.length,
      prompts: mcp.prompts?.length
    };
    for (const surface of ["docs/llms.txt", "docs/plugins.html"]) {
      const surfacePath = path.join(repoRoot, surface);
      if (!fs.existsSync(surfacePath)) continue;
      const claim = readText(surfacePath).match(/(\d+) tools?, (\d+) resources?, (\d+) prompts?/);
      if (!claim) {
        warn.push(`${surface} no longer states the MCP tool/resource/prompt counts — guard may need updating`);
        continue;
      }
      const [, tools, resources, prompts] = claim.map(Number);
      const actual = { tools, resources, prompts };
      for (const key of ["tools", "resources", "prompts"]) {
        if (expected[key] !== undefined && actual[key] !== expected[key]) {
          fail.push(`${surface} advertises ${actual[key]} MCP ${key}; mcp/catalog.json declares ${expected[key]}`);
        }
      }
    }
  }
}

const indexJsonLdItemMatches = docsRootText.match(/"@type":\s*"ListItem"/g) || [];
if (indexJsonLdItemMatches.length !== totalSkillCount) {
  fail.push(`docs/index.html JSON-LD ItemList has ${indexJsonLdItemMatches.length} entries, expected ${totalSkillCount}`);
}

// Release-log guard: the homepage #changelog section cites real commits by
// short hash and stamps the current version's release date. A fabricated hash,
// stale release pill, or out-of-order entry would ship a page that quietly lies
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
  // Prefer the remote-tracking ref: in a worktree cut from origin/main, local
  // `main` can sit behind and would flag freshly landed entries as unreachable.
  const defaultBranchRef = ["origin/main", "main", "HEAD"].find((ref) =>
    spawnSync("git", ["-C", repoRoot, "rev-parse", "--verify", "--quiet", `${ref}^{commit}`], { stdio: "ignore" }).status === 0
  ) ?? "HEAD";
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
        continue;
      }
      // Object existence is not enough. Every PR here lands squashed, so a
      // pre-squash branch commit still resolves in the maintainer's clone
      // (the branch object is right there) while being unreachable from the
      // published history — a reader following the link gets nothing. 0.13.0
      // shipped exactly that. Require reachability from the default branch.
      const reachable = spawnSync(
        "git",
        ["-C", repoRoot, "merge-base", "--is-ancestor", entry.hash, defaultBranchRef],
        { stdio: "ignore" }
      );
      if (reachable.status !== 0) {
        fail.push(`docs/index.html changelog cites commit ${entry.hash}, which exists but is not reachable from ${defaultBranchRef} — a squash merge rewrites branch commits, so cite the commit that landed`);
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

  const freshMatch = docsRootText.match(/Version ([^\s]+) released ([^<]+?)\s*<span id="clog-fresh-rel"[^>]*data-iso="(\d{4}-\d{2}-\d{2})"/);
  if (!freshMatch) {
    fail.push('docs/index.html: could not find the versioned release pill (id="clog-fresh-rel" with a data-iso date)');
  } else {
    const pillVersion = freshMatch[1].trim();
    const pillText = freshMatch[2].trim();
    const pillIso = freshMatch[3];
    const newestDate = clogEntries.map((e) => e.date).filter(Boolean).sort().at(-1);
    if (pillVersion !== catalog.version) {
      fail.push(`docs/index.html release pill version (${pillVersion}) does not match catalog version (${catalog.version})`);
    }
    if (newestDate && pillIso !== newestDate) {
      fail.push(`docs/index.html release pill data-iso (${pillIso}) does not match the newest changelog entry date (${newestDate})`);
    }
    const monthAbbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [y, m, d] = pillIso.split("-").map(Number);
    const expectedPillText = `${monthAbbr[m - 1]} ${d}, ${y}`;
    if (pillText !== expectedPillText) {
      fail.push(`docs/index.html release pill text ("${pillText}") does not match its data-iso ${pillIso} (expected "${expectedPillText}")`);
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
    const top = box[0].match(/class="hero-shiplog-top">Released ([A-Z][a-z]{2} \d{1,2}) <b>&middot; ([0-9a-f]{7,40})<\/b>/);
    const title = (box[0].match(/class="hero-shiplog-title">([^<]+)</) || [])[1]?.trim() ?? null;
    const commits = (box[0].match(/class="hero-shiplog-more">(\d+) commits/) || [])[1] ?? null;
    if (!top) {
      fail.push(`${page.file}: tiny release-log box header is malformed (expected 'Released Mon D <b>&middot; hash</b>')`);
    } else {
      if (expectedBoxDate && top[1] !== expectedBoxDate) {
        fail.push(`${page.file}: tiny release-log box says "Released ${top[1]}" but the newest changelog entry is ${newestClogDate} (expected "Released ${expectedBoxDate}")`);
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

  const releaseClogItem = clogItems.find((item) => item.includes(`Version ${catalog.version}`));
  if (!releaseClogItem) {
    fail.push(`docs/index.html changelog has no release entry for catalog version ${catalog.version}`);
  } else {
    const releaseDate = releaseClogItem.match(/class="clog-date">(\d{4}-\d{2}-\d{2})</)?.[1] ?? null;
    if (releaseDate !== catalog.updated) {
      fail.push(`docs/index.html release entry for ${catalog.version} is dated ${releaseDate || "missing"}, expected catalog updated date ${catalog.updated}`);
    }
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
