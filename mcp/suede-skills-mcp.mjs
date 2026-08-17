#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_PROTOCOL_VERSIONS = new Set([PROTOCOL_VERSION, "2025-03-26", "2024-11-05"]);
const VALID_PROFILES = new Set(["all", "workflow", "artist", "creator", "marketing", "consumer"]);
const PROFILE_AREAS = {
  workflow: ["workflow"],
  artist: ["artist", "creator"],
  creator: ["artist", "creator"],
  marketing: ["marketing"],
  consumer: ["consumer"]
};
// Which plugin bundle installs a profile's skills. Kept explicit rather than
// inferred from plugin.skills: several bundles list the same skill, and a
// profile should point at the one bundle a reader is meant to install.
const PROFILE_PLUGINS = {
  workflow: ["suede-workflow-skills"],
  artist: ["suede-creator-skills"],
  creator: ["suede-creator-skills"],
  marketing: ["suede-marketing"],
  consumer: ["suede-workflow-skills"]
};
const AREA_ALIASES = { artist: ["artist", "creator"], creator: ["artist", "creator"] };
const AREA_ENUM = ["all", "workflow", "artist", "creator", "marketing", "consumer"];
// `area` decides which plugin bundle and MCP profile ships a skill; `specialty`
// decides how a human browses the pack. They are deliberately separate axes:
// re-cutting the browse structure must never move a skill between bundles.
const SPECIALTY_ENUM = ["all", "ship", "craft", "found", "earn", "position"];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = { profile: "all" };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--profile" && argv[i + 1]) {
      args.profile = argv[i + 1];
      i += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argv[i]}`);
    }
  }
  if (!VALID_PROFILES.has(args.profile)) {
    throw new Error(`Unknown profile: ${args.profile}. Expected one of: ${[...VALID_PROFILES].join(", ")}`);
  }
  return args;
}

let profile;
try {
  ({ profile } = parseArgs(process.argv));
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(2);
}
const catalogPath = path.join(__dirname, "catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const skillsDirPath = path.join(__dirname, "..", "skills");
const SKILLS_DIR = fs.existsSync(skillsDirPath) ? fs.realpathSync(skillsDirPath) : skillsDirPath;
const MAX_INPUT_BUFFER_BYTES = 1024 * 1024;
const MAX_TEXT_CHARS = 2000;
const MAX_BODY_CHARS = 24000;
const MAX_SEARCH_RESULTS = 25;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function rpcError(message, code = -32602, data) {
  const error = new Error(message);
  error.code = code;
  if (data !== undefined) error.data = data;
  return error;
}

function boundedString(value, fallback = "") {
  const raw = value === undefined || value === null ? fallback : String(value);
  return raw.length > MAX_TEXT_CHARS ? `${raw.slice(0, MAX_TEXT_CHARS)}...` : raw;
}

function profileCatalog() {
  const areas = PROFILE_AREAS[profile];
  if (!areas) return catalog;
  const pluginNames = new Set(PROFILE_PLUGINS[profile] || []);
  const areaSet = new Set(areas);
  return {
    ...catalog,
    plugins: catalog.plugins.filter((plugin) => pluginNames.has(plugin.name)),
    skills: catalog.skills.filter((skill) => areaSet.has(skill.area))
  };
}

function text(content) {
  return { type: "text", text: content };
}

function asMarkdownSkillList(data) {
  const line = (skill) => `- $${skill.name}: ${skill.description} Use when: ${skill.useWhen}`;
  // One flat list stops being readable somewhere under a hundred entries, so
  // group by specialty and sub-lane in catalog order. A skill with no
  // specialty still renders, ungrouped, rather than disappearing.
  const order = (profileCatalog().specialties || []).map((s) => s.key);
  const groups = new Map(order.map((key) => [key, []]));
  const ungrouped = [];
  for (const skill of data.skills) {
    if (groups.has(skill.specialty)) groups.get(skill.specialty).push(skill);
    else ungrouped.push(skill);
  }
  const labels = new Map((profileCatalog().specialties || []).map((s) => [s.key, s.label]));
  const blocks = [];
  for (const [key, skills] of groups) {
    if (!skills.length) continue;
    const lanes = [];
    for (const skill of skills) {
      const lane = skill.lane || "Other";
      if (!lanes.length || lanes.at(-1).lane !== lane) lanes.push({ lane, skills: [] });
      lanes.at(-1).skills.push(skill);
    }
    const body = lanes
      .map(({ lane, skills: laneSkills }) => `### ${lane}\n${laneSkills.map(line).join("\n")}`)
      .join("\n\n");
    blocks.push(`## ${labels.get(key) || key} (${skills.length})\n${body}`);
  }
  if (ungrouped.length) blocks.push(ungrouped.map(line).join("\n"));
  return blocks.join("\n\n");
}

function isSkillAvailable(name) {
  return profileCatalog().skills.some((skill) => skill.name === name);
}

// Read a skill's own instructions off disk. The name is only ever a value that
// already matched a catalog entry, so the join can never leave skills/.
function readSkillBody(name) {
  const bodyPath = path.join(SKILLS_DIR, name, "SKILL.md");
  if (!bodyPath.startsWith(`${SKILLS_DIR}${path.sep}`)) return null;
  let raw;
  try {
    raw = fs.readFileSync(bodyPath, "utf8");
  } catch {
    return null;
  }
  if (raw.length <= MAX_BODY_CHARS) return { text: raw, truncated: false };
  return {
    text: `${raw.slice(0, MAX_BODY_CHARS)}\n\n[truncated at ${MAX_BODY_CHARS} characters — read skills/${name}/SKILL.md for the rest]`,
    truncated: true
  };
}

function scopeByArea(skills, area) {
  if (!area || area === "all") return skills;
  const wanted = new Set(AREA_ALIASES[area] || [area]);
  return skills.filter((skill) => wanted.has(skill.area));
}

function scopeBySpecialty(skills, specialty) {
  if (!specialty || specialty === "all") return skills;
  return skills.filter((skill) => skill.specialty === specialty);
}

function tokenize(value) {
  return String(value).toLowerCase().match(/[a-z0-9]+/g) || [];
}

// People describe a task with a different inflection than the catalog uses.
// "my landing page is not converting" has to reach a skill whose text says
// "conversion", or the search returns incidental matches on "page" instead.
// Exact tokens still win; a shared stem counts for half.
// A bare length cut-off drops the short terms that carry the most routing
// signal in this pack — ai, qa, ux, seo, cro. Filter meaning, not length.
const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "did", "do", "does",
  "for", "from", "get", "had", "has", "have", "how", "i", "if", "in", "is", "it", "its",
  "me", "my", "need", "not", "of", "on", "or", "our", "out", "should", "so", "that", "the",
  "their", "them", "then", "there", "these", "they", "this", "to", "up", "us", "want",
  "was", "we", "were", "what", "when", "which", "who", "why", "will", "with", "you", "your"
]);
const STEM_MIN_PREFIX = 4;
function related(a, b) {
  if (a === b) return 1;
  const shorter = Math.min(a.length, b.length);
  if (shorter < STEM_MIN_PREFIX) return 0;
  let shared = 0;
  while (shared < shorter && a[shared] === b[shared]) shared += 1;
  return shared >= STEM_MIN_PREFIX && shared / shorter >= 0.6 ? 0.5 : 0;
}

function fieldMatch(term, tokens) {
  let best = 0;
  for (const token of tokens) {
    best = Math.max(best, related(term, token));
    if (best === 1) break;
  }
  return best;
}

// Rank skills against a free-text task description. The pack ships 71 skills,
// so listing them all is not routing; this scores name, useWhen, and
// description in that order of authority and drops anything that scores zero.
function searchSkills(skills, query, limit) {
  const terms = [...new Set(tokenize(query))].filter((term) => term.length > 1 && !STOPWORDS.has(term));
  if (!terms.length) return [];
  return skills
    .map((skill) => {
      const name = tokenize(skill.name);
      const useWhen = tokenize(skill.useWhen);
      const description = tokenize(skill.description);
      let score = 0;
      for (const term of terms) {
        score += 6 * fieldMatch(term, name);
        score += 3 * fieldMatch(term, useWhen);
        score += 1 * fieldMatch(term, description);
      }
      return { skill, score: Math.round(score * 10) / 10 };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name))
    .slice(0, limit)
    .map(({ skill, score }) => ({ ...skill, score }));
}

function installMarkdown(data, surface = "all") {
  const lines = [];
  if (surface === "all" || surface === "codex") {
    lines.push("## Public Codex skill install");
    for (const plugin of data.plugins) {
      if (plugin.publicInstall) lines.push(`- ${plugin.displayName}: \`${plugin.publicInstall}\``);
    }
    lines.push("");
    lines.push("Restart Codex after installing new public skills.");
  }
  if (surface === "all" || surface === "plugin") {
    lines.push("");
    lines.push("## Local plugin install");
    lines.push("Use this only on machines where the local personal marketplace already registers the Suede plugin sources.");
    for (const plugin of data.plugins) {
      if (plugin.localPluginInstall) lines.push(`- ${plugin.displayName}: \`${plugin.localPluginInstall}\``);
    }
  }
  if (surface === "all" || surface === "mcp") {
    lines.push("");
    lines.push("## MCP option");
    lines.push("Use the MCP when structured skill discovery, install options, visibility grading, code grading, SEO/AEO/AI EO copy audits, or QA checklists materially help the task.");
    for (const plugin of data.plugins) {
      lines.push(`- ${plugin.displayName} MCP server: \`${plugin.mcpServer}\``);
    }
  }
  if (surface === "all" || surface === "claude") {
    lines.push("");
    lines.push("## Claude Code skill install");
    lines.push("Copy the relevant skill folders into a project `.claude/skills` directory or user-level `~/.claude/skills` directory.");
  }
  return lines.join("\n");
}

function seoAuditTemplate(args = {}) {
  const target = boundedString(args.url || args.pageType, "the target page");
  const intent = boundedString(args.primaryIntent, "one clear search intent");
  const copy = boundedString(args.copy, "");
  const lines = [
    `# Suede SEO/AEO/AI EO Copy Audit: ${target}`,
    "",
    `Primary intent: ${intent}`,
    "",
    "SEO scope: includes AEO and AI EO for search snippets, answer engines, AI summaries, schema, sourceable claims, and citation-ready proof.",
    "",
    "## Crawl And Index Check",
    "- Confirm canonical URL, robots/indexability, sitemap presence, and internal links.",
    "- Flag redirects, duplicate URLs, missing titles, and missing descriptions.",
    "",
    "## On-Page Copy And Answer Check",
    "- Confirm one clear page-level heading or equivalent semantic main heading; judge hierarchy and accessibility, not H1 count alone.",
    "- Record title length as a preview diagnostic. Google publishes no fixed title character limit or ranking threshold.",
    "- Record meta-description length as a preview diagnostic. Google publishes no fixed character limit and may select page content instead.",
    "- H2/H3 structure matches actual page sections.",
    "- Durable Suede terms appear naturally, not stuffed.",
    "- Answer-ready definitions and FAQ copy are visible, sourceable, and backed by evidence.",
    "",
    "## Structured Data And AI EO Check",
    "- Match schema to visible content.",
    "- Validate JSON-LD syntax.",
    "- Use FAQPage only when the questions and answers are visible.",
    "- Check whether AI summaries can cite the page without inventing partners, metrics, legal clearance, payouts, or private access.",
    "",
    "## Conversion And Trust Check",
    "- One primary CTA.",
    "- Evidence boundaries are visible.",
    "- Proof links point to real docs, scripts, manifests, pages, or repos.",
    "",
    "## Anti-Slop Line Edit Check",
    "- Cut throat-clearing, adverb padding, binary setup, negative listing, Wh-starter crutches, narrator distance, fake intensity, passive actor-hiding, false agency, pull-quote slogans, generic AI phrasing, unsupported claims, and em dashes.",
    "- Score Directness, Rhythm, Trust, Specificity, Authenticity, Density, and Search/AI readability out of 70.",
    "",
    "## Output",
    "- Findings ranked HIGH, MEDIUM, LOW.",
    "- Exact rewrites for title, meta, H1, subhead, CTA, FAQ, and answer-ready summary.",
    "- Verification commands or live URLs to check.",
    "- Copy score out of 70."
  ];
  if (copy) {
    lines.push("", "## Supplied Copy", copy);
  }
  return lines.join("\n");
}

function visibilityGradeTemplate(args = {}) {
  const target = boundedString(args.url || args.pageType, "the target page");
  const action = boundedString(args.primaryAction, "one clear next action");
  const notes = boundedString(args.notes || args.copy, "");
  const lines = [
    `# Suede Visibility Grade: ${target}`,
    "",
    `Primary action: ${action}`,
    "",
    "Goal: decide whether the right person or agent can find this page, understand it, trust it, cite it, and take the intended next action.",
    "",
    "## Source Truth To Inspect",
    "- Live URL status, redirects, canonical, robots, sitemap, title, and description.",
    "- Rendered desktop and mobile first viewport.",
    "- Screenshot paths or URLs, viewport sizes, theme, state, and anything not visually checked.",
    "- H1, headings, body copy, proof links, screenshots, install commands, docs, and CTA targets.",
    "- Open Graph, Twitter card, schema/JSON-LD, image alt text, and internal links.",
    "- Google and Gemini result-surface receipts only when the receipts are actually available and named correctly.",
    "",
    "## Grade Lanes",
    "- Findability: A-F.",
    "- First-screen clarity: A-F.",
    "- CTA pull: A-F.",
    "- Proof and trust: A-F.",
    "- AI readability: A-F.",
    "- Design signal: A-F.",
    "- Overall: A-F.",
    "",
    "## Grade Caps",
    "- No live page or rendered source inspected caps Overall at C.",
    "- Broken primary CTA or false published statement caps promotion readiness at D/F.",
    "- Design signal D/F blocks promotion as polished even if metadata is decent.",
    "- Missing mobile/tablet/state checks prevents an A.",
    "",
    "## Required Output",
    "- Simple explanation for a non-coder.",
    "- Usual breakdown with checked URL or source, live/source status, screenshot evidence, viewport sizes, visual states checked/not checked, primary reader, primary action, and lane grades.",
    "- Top three fixes in priority order with severity, location, evidence, impact, and concrete patch.",
    "- CTA rewrite: primary CTA, secondary CTA, final CTA.",
    "- Verification: what was checked, what was not checked, and ship gate.",
    "- Cue Suede choices: change something, preserve what worked, or keep as-is by saying nothing.",
    "",
    "## Boundaries",
    "- Do not invent traffic, ranking, conversion, partner, legal, payout, or placement claims.",
    "- Do not treat the grade as an audited business metric.",
    "- Do not call screenshot receipts a surface they do not actually show."
  ];
  if (notes) {
    lines.push("", "## Supplied Notes Or Copy", notes);
  }
  return lines.join("\n");
}

function codeGradeTemplate(args = {}) {
  const target = boundedString(args.repo || args.diff || args.target, "the target code change");
  const intent = boundedString(args.intent || args.changeIntent, "the intended behavior");
  const notes = boundedString(args.notes || args.context || "");
  const lines = [
    `# Suede Code Grade: ${target}`,
    "",
    `Change intent: ${intent}`,
    "",
    "Goal: decide whether this code is ready to ship, why it earned the grade, and which upgrades would move the grade.",
    "",
    "## Source Truth To Inspect",
    "- Repo, branch, remote, dirty state, and relevant local guidance.",
    "- Diff, changed files, generated files, touched routes, APIs, scripts, MCP tools, or app surfaces.",
    "- Imports, callers, schemas, configs, env requirements, jobs, webhooks, tests, docs, and release paths.",
    "- Build, test, lint, typecheck, browser, simulator, MCP, or live/API evidence that exercises the changed behavior.",
    "- Suede published statements, rights/provenance, payment/wallet, registry, royalty, and agent-commerce contracts when relevant.",
    "",
    "## Grade Lanes",
    "- Correctness: A-F.",
    "- Security and permissions: A-F.",
    "- Data and state: A-F.",
    "- Suede truth: A-F.",
    "- UX and release behavior: A-F.",
    "- Tests and verification: A-F.",
    "- Deploy readiness: A-F.",
    "- Overall: A-F.",
    "",
    "## Required Output",
    "- Simple explanation for a non-coder.",
    "- Usual breakdown with target, change reviewed, runtime surfaces, and lane grades.",
    "- Why the overall grade landed there.",
    "- Required upgrades in priority order.",
    "- Verification: what was checked, what was not checked, and ship gate.",
    "- Cue Suede choices: change something, preserve what worked, or keep as-is by saying nothing.",
    "",
    "## Boundaries",
    "- Do not grade from memory when source or diff can be inspected.",
    "- Do not treat the grade as a certification or audited security result.",
    "- Do not invent tests, screenshots, live checks, deploy status, or evidence for published statements.",
    "- Do not ship a C, D, or F without naming the required upgrade."
  ];
  if (notes) {
    lines.push("", "## Supplied Notes Or Context", notes);
  }
  return lines.join("\n");
}

function qaChecklist(args = {}) {
  const scope = boundedString(args.scope, "full");
  const target = boundedString(args.target, "the changed Suede surface");
  return [
    `# Suede QA Checklist: ${target}`,
    "",
    `Scope: ${scope}`,
    "",
    "## Scout Lane",
    "- Verify exact repo, branch, remote, dirty state, target URL, and source docs.",
    "",
    "## MCP And Install Lane",
    "- Validate public skill folders, install commands, MCP behavior, and any local plugin manifests.",
    "- Validate `.mcp.json` and server startup.",
    "- Exercise `initialize`, `tools/list`, `tools/call`, `resources/list`, `resources/read`, `prompts/list`, and `prompts/get`.",
    "",
    "## SEO/AEO/AI EO And Copy Lane",
    "- Check title, description, H1, headings, canonical, sitemap, schema, internal links, answer-ready copy, CTA copy, and evidence boundaries.",
    "- Run the anti-slop line edit for actor clarity, proof artifacts, fake intensity, false agency, pull-quote slogans, generic phrasing, unsupported claims, and copy score.",
    "",
    "## Visibility And CTA Grade Lane",
    "- Grade findability, first-screen clarity, CTA pull, proof and trust, AI readability, design signal, and overall readiness from A-F.",
    "- Include screenshot/source evidence, viewport/state notes, and grade caps.",
    "- Verify Google and Gemini result-surface wording only names receipts for the surfaces they actually show.",
    "- Rewrite primary, secondary, and final CTAs when the action is vague or buried.",
    "",
    "## Code Grade Lane",
    "- Grade correctness, security and permissions, data/state, Suede truth, UX/release behavior, tests, deploy readiness, and overall readiness from A-F.",
    "- Explain why the grade landed there and name the required upgrades before ship.",
    "",
    "## Code And Security Lane",
    "- Check input validation, path handling, protocol errors, no secrets, no destructive operations, and safe failure behavior.",
    "- Convert weak code-grade lanes into fix briefs when the change should not ship yet.",
    "",
    "## Browser QA Lane",
    "- Serve locally, check desktop and mobile, run link sweep, verify text fit, and confirm no broken public routes.",
    "- For visual work, compare source visual truth and rendered implementation together with matched viewport, state, theme, auth/content conditions, full-view evidence, focused-region evidence, and pass/block status.",
    "",
    "## Skill Pack Integrity Lane",
    "- Validate frontmatter, folder/name match, OpenAI manifests, catalog/filesystem match, docs links, install paths, private-path leaks, secret-like text, unsupported statements, and generated docs drift.",
    "",
    "## Release Lane",
    "- Run validation commands, commit only scoped files, push, wait for Pages build, and verify live URLs before claiming public completion.",
    "",
    "## Cue Suede Lane",
    "- Accept feedback mid-workflow and use it immediately.",
    "- At final handoff, give two explanations first: a very simple non-coder explanation, then the usual breakdown.",
    "- At final handoff, ask: Cue Suede: 1. Change something. 2. Preserve this so I can mimic it later. 3. Keep as-is by saying nothing.",
    "- Do not block completion waiting for a feedback answer."
  ].join("\n");
}

const tools = [
  {
    name: "list_suede_skills",
    title: "List Suede Skills",
    description: "List Suede skills available through the current MCP profile.",
    inputSchema: {
      type: "object",
      properties: {
        area: {
          type: "string",
          enum: AREA_ENUM,
          description: "Optional area filter (which plugin bundle ships the skill)."
        },
        specialty: {
          type: "string",
          enum: SPECIALTY_ENUM,
          description: "Optional specialty filter (how the pack is browsed): ship, craft, found, earn, position."
        }
      }
    }
  },
  {
    name: "search_suede_skills",
    title: "Search Suede Skills",
    description: "Rank Suede skills against a task description and return the best-matching routes.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Task, problem, or intent to route." },
        area: { type: "string", enum: AREA_ENUM, description: "Optional area filter." },
        specialty: { type: "string", enum: SPECIALTY_ENUM, description: "Optional specialty filter: ship, craft, found, earn, position." },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: MAX_SEARCH_RESULTS,
          description: `Maximum matches to return, up to ${MAX_SEARCH_RESULTS}.`
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_suede_skill",
    title: "Get Suede Skill",
    description: "Return details for one Suede skill, optionally including its full SKILL.md instructions.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Skill name, with or without a leading dollar sign." },
        includeBody: {
          type: "boolean",
          description: "Include the skill's SKILL.md instructions instead of catalog metadata only."
        }
      },
      required: ["name"]
    }
  },
  {
    name: "suede_install_options",
    title: "Suede Install Options",
    description: "Return public Codex skill, local plugin, MCP, and skill-copy install options.",
    inputSchema: {
      type: "object",
      properties: {
        surface: {
          type: "string",
          enum: ["all", "codex", "plugin", "mcp", "claude"],
          description: "Install surface to explain."
        }
      }
    }
  },
  {
    name: "suede_copy_seo_audit",
    title: "Suede Copy SEO/AEO/AI EO Audit",
    description: "Create a Suede-specific SEO/AEO/AI EO copy audit scaffold for a page, repo, or docs surface.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional URL to audit." },
        pageType: { type: "string", description: "Page or docs type when no URL is available." },
        primaryIntent: { type: "string", description: "Primary search intent or reader action." },
        copy: { type: "string", description: "Optional pasted copy to audit." }
      }
    }
  },
  {
    name: "suede_visibility_grade",
    title: "Suede Visibility Grade",
    description: "Create a Suede A-F visibility and CTA grading scaffold for a public page, docs surface, repo page, launch page, or campaign page.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional URL to grade." },
        pageType: { type: "string", description: "Page or docs type when no URL is available." },
        primaryAction: { type: "string", description: "Main action the page should drive." },
        notes: { type: "string", description: "Optional context, screenshot notes, or constraints." },
        copy: { type: "string", description: "Optional pasted page copy." }
      }
    }
  },
  {
    name: "suede_code_grade",
    title: "Suede Code Grade",
    description: "Create a Suede A-F code grading scaffold for a diff, PR, branch, MCP server, plugin, API, app surface, public-site change, or release candidate.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Target repo, PR, branch, diff, file, or change to grade." },
        repo: { type: "string", description: "Optional repository or project path." },
        diff: { type: "string", description: "Optional pasted diff or change summary." },
        intent: { type: "string", description: "Intended behavior or release goal." },
        notes: { type: "string", description: "Optional constraints, verification notes, or risk context." },
        context: { type: "string", description: "Optional pasted context or review notes." }
      }
    }
  },
  {
    name: "suede_qa_checklist",
    title: "Suede QA Checklist",
    description: "Generate a multi-lane QA checklist for Suede skills, local plugin notes, MCP servers, docs, or public pages.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Target repo, URL, skill, MCP server, page, or change." },
        scope: { type: "string", description: "QA depth, such as fast, full, release, seo, or mcp." }
      }
    }
  }
];

const skillOutputSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    area: { type: "string" },
    specialty: { type: "string" },
    lane: { type: "string" },
    description: { type: "string" },
    useWhen: { type: "string" }
  },
  required: ["name", "area", "specialty", "lane", "description", "useWhen"],
  additionalProperties: false
};

const scoredSkillOutputSchema = {
  ...skillOutputSchema,
  properties: { ...skillOutputSchema.properties, score: { type: "number" } },
  required: [...skillOutputSchema.required, "score"]
};

const nullableString = { type: ["string", "null"] };
const toolOutputSchemas = {
  list_suede_skills: {
    type: "object",
    properties: { skills: { type: "array", items: skillOutputSchema } },
    required: ["skills"],
    additionalProperties: false
  },
  search_suede_skills: {
    type: "object",
    properties: {
      query: { type: "string" },
      matches: { type: "array", items: scoredSkillOutputSchema }
    },
    required: ["query", "matches"],
    additionalProperties: false
  },
  get_suede_skill: {
    type: "object",
    properties: {
      found: { type: "boolean" },
      skill: skillOutputSchema,
      body: { type: ["string", "null"] },
      bodyTruncated: { type: "boolean" }
    },
    required: ["found"],
    additionalProperties: false
  },
  suede_install_options: {
    type: "object",
    properties: {
      plugins: { type: "array", items: { type: "object" } },
      surface: { type: "string", enum: ["all", "codex", "plugin", "mcp", "claude"] }
    },
    required: ["plugins", "surface"],
    additionalProperties: false
  },
  suede_copy_seo_audit: {
    type: "object",
    properties: { target: nullableString, primaryIntent: nullableString },
    required: ["target", "primaryIntent"],
    additionalProperties: false
  },
  suede_visibility_grade: {
    type: "object",
    properties: { target: nullableString, primaryAction: nullableString },
    required: ["target", "primaryAction"],
    additionalProperties: false
  },
  suede_code_grade: {
    type: "object",
    properties: { target: nullableString, intent: nullableString },
    required: ["target", "intent"],
    additionalProperties: false
  },
  suede_qa_checklist: {
    type: "object",
    properties: { target: nullableString, scope: { type: "string" } },
    required: ["target", "scope"],
    additionalProperties: false
  }
};

for (const tool of tools) {
  tool.inputSchema.additionalProperties = false;
  for (const property of Object.values(tool.inputSchema.properties || {})) {
    if (property.type === "string" && !property.maxLength) property.maxLength = MAX_TEXT_CHARS;
  }
  tool.outputSchema = toolOutputSchemas[tool.name];
  tool.annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  };
}

const resources = [
  {
    uri: "suede://catalog",
    name: "catalog",
    title: "Suede Skill And Install Catalog",
    description: "Structured Suede skill, install, MCP, and public link catalog.",
    mimeType: "application/json"
  },
  {
    uri: "suede://plugins",
    name: "plugins",
    title: "Suede Public Install Options",
    description: "Public Codex skill installs, local plugin notes, and MCP options.",
    mimeType: "text/markdown"
  },
  {
    uri: "suede://copy-seo-audit",
    name: "copy-seo-audit",
    title: "Suede SEO/AEO/AI EO Copy Audit Template",
    description: "Full SEO/AEO/AI EO copy audit scaffold for Suede public pages, docs, repos, and skill pages.",
    mimeType: "text/markdown"
  },
  {
    uri: "suede://visibility-grade",
    name: "visibility-grade",
    title: "Suede Visibility Grade Template",
    description: "A-F website visibility and CTA grading scaffold for public pages, docs, repos, launch pages, and campaign pages.",
    mimeType: "text/markdown"
  },
  {
    uri: "suede://code-grade",
    name: "code-grade",
    title: "Suede Code Grade Template",
    description: "A-F code grading scaffold for diffs, PRs, branches, MCP servers, plugins, APIs, app surfaces, and release candidates.",
    mimeType: "text/markdown"
  },
  {
    uri: "suede://qa-checklist",
    name: "qa-checklist",
    title: "Suede Full QA Checklist",
    description: "Multi-agent QA checklist for skill, MCP, docs, local plugin notes, and public site changes.",
    mimeType: "text/markdown"
  }
];

const prompts = [
  {
    name: "suede-copy-seo-audit",
    title: "Run Suede SEO/AEO/AI EO Copy Audit",
    description: "Audit a Suede page, README, skill page, or docs surface for SEO, AEO, AI EO, and copy quality.",
    arguments: [
      { name: "target", description: "URL, file, repo, or page to audit.", required: true },
      { name: "intent", description: "Primary search intent or reader action.", required: false }
    ]
  },
  {
    name: "suede-plugin-install",
    title: "Explain Suede Installs",
    description: "Explain public skill, local plugin, MCP, and skill-copy install options.",
    arguments: [
      { name: "surface", description: "codex, mcp, claude, plugin, or all.", required: false }
    ]
  },
  {
    name: "suede-visibility-grade",
    title: "Run Suede Visibility Grade",
    description: "Grade a public page A-F for findability, CTA pull, proof, AI readability, design signal, and action clarity.",
    arguments: [
      { name: "target", description: "URL, file, repo, or page to grade.", required: true },
      { name: "action", description: "Primary action the page should drive.", required: false }
    ]
  },
  {
    name: "suede-code-grade",
    title: "Run Suede Code Grade",
    description: "Grade a code change A-F for ship risk, explain why, and list required upgrades.",
    arguments: [
      { name: "target", description: "Repo, PR, branch, diff, file, or change to grade.", required: true },
      { name: "intent", description: "Intended behavior or release goal.", required: false }
    ]
  },
  {
    name: "suede-full-qa",
    title: "Run Suede Full QA",
    description: "Create a multi-agent QA plan for a Suede skill, MCP, docs, local plugin note, or site change.",
    arguments: [
      { name: "target", description: "Target change or surface.", required: true },
      { name: "scope", description: "fast, full, release, seo, or mcp.", required: false }
    ]
  }
];

function validateToolArguments(tool, args) {
  if (!isObject(args)) throw rpcError(`Arguments for ${tool.name} must be an object`);
  const schema = tool.inputSchema;
  const allowed = new Set(Object.keys(schema.properties || {}));
  const extras = Object.keys(args).filter((key) => !allowed.has(key));
  if (extras.length) throw rpcError(`Unknown argument(s) for ${tool.name}: ${extras.sort().join(", ")}`);
  for (const required of schema.required || []) {
    if (!(required in args)) throw rpcError(`Missing required argument for ${tool.name}: ${required}`);
  }
  for (const [key, value] of Object.entries(args)) {
    const property = schema.properties[key];
    if (property.type === "string" && typeof value !== "string") {
      throw rpcError(`Argument ${key} for ${tool.name} must be a string`);
    }
    if (property.type === "boolean" && typeof value !== "boolean") {
      throw rpcError(`Argument ${key} for ${tool.name} must be a boolean`);
    }
    if (property.type === "integer") {
      if (!Number.isInteger(value)) throw rpcError(`Argument ${key} for ${tool.name} must be an integer`);
      if (property.minimum !== undefined && value < property.minimum) {
        throw rpcError(`Argument ${key} for ${tool.name} must be at least ${property.minimum}`);
      }
      if (property.maximum !== undefined && value > property.maximum) {
        throw rpcError(`Argument ${key} for ${tool.name} must be at most ${property.maximum}`);
      }
    }
    if (typeof value === "string" && property.maxLength && value.length > property.maxLength) {
      throw rpcError(`Argument ${key} for ${tool.name} exceeds ${property.maxLength} characters`);
    }
    if (property.enum && !property.enum.includes(value)) {
      throw rpcError(`Argument ${key} for ${tool.name} must be one of: ${property.enum.join(", ")}`);
    }
  }
}

function toolResult(humanText, structuredContent, extra = {}) {
  return {
    content: [text(humanText), text(JSON.stringify(structuredContent))],
    structuredContent,
    ...extra
  };
}

function callTool(name, args = {}) {
  const data = profileCatalog();
  const tool = tools.find((item) => item.name === name);
  if (!tool) throw rpcError(`Unknown tool: ${name}`);
  validateToolArguments(tool, args);
  if (name === "list_suede_skills") {
    const scoped = scopeBySpecialty(scopeByArea(data.skills, args.area), args.specialty);
    return toolResult(asMarkdownSkillList({ skills: scoped }), {
      skills: scoped
    });
  }
  if (name === "search_suede_skills") {
    const query = boundedString(args.query);
    const limit = args.limit === undefined ? 10 : args.limit;
    const matches = searchSkills(scopeBySpecialty(scopeByArea(data.skills, args.area), args.specialty), query, limit);
    const humanText = matches.length
      ? asMarkdownSkillList({ skills: matches })
      : `No Suede skill in this profile matches: ${query}`;
    return toolResult(humanText, { query, matches });
  }
  if (name === "get_suede_skill") {
    const requested = boundedString(args.name).replace(/^\$/, "");
    const skill = data.skills.find((item) => item.name === requested);
    if (!skill) {
      return toolResult(`Unknown Suede skill: ${requested}`, { found: false }, { isError: true });
    }
    const summary = `$${skill.name}: ${skill.description}\n\nUse when: ${skill.useWhen}`;
    if (!args.includeBody) return toolResult(summary, { found: true, skill });
    const body = readSkillBody(skill.name);
    if (!body) {
      return toolResult(
        `${summary}\n\nSKILL.md is not readable from this install.`,
        { found: true, skill, body: null, bodyTruncated: false }
      );
    }
    return toolResult(`${summary}\n\n---\n\n${body.text}`, {
      found: true,
      skill,
      body: body.text,
      bodyTruncated: body.truncated
    });
  }
  if (name === "suede_install_options") {
    return toolResult(
      installMarkdown(data, args.surface || "all"),
      { plugins: data.plugins, surface: args.surface || "all" }
    );
  }
  if (name === "suede_copy_seo_audit") {
    return toolResult(seoAuditTemplate(args), {
        target: args.url || args.pageType ? boundedString(args.url || args.pageType) : null,
        primaryIntent: args.primaryIntent ? boundedString(args.primaryIntent) : null
    });
  }
  if (name === "suede_visibility_grade") {
    return toolResult(visibilityGradeTemplate(args), {
        target: args.url || args.pageType ? boundedString(args.url || args.pageType) : null,
        primaryAction: args.primaryAction ? boundedString(args.primaryAction) : null
    });
  }
  if (name === "suede_code_grade") {
    return toolResult(codeGradeTemplate(args), {
        target: args.target || args.repo || args.diff ? boundedString(args.target || args.repo || args.diff) : null,
        intent: args.intent ? boundedString(args.intent) : null
    });
  }
  if (name === "suede_qa_checklist") {
    return toolResult(qaChecklist(args), {
        target: args.target ? boundedString(args.target) : null,
        scope: boundedString(args.scope, "full")
    });
  }
  throw rpcError(`Unknown tool: ${name}`);
}

function readResource(uri) {
  const data = profileCatalog();
  if (uri === "suede://catalog") {
    return { uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) };
  }
  if (uri === "suede://plugins") {
    return { uri, mimeType: "text/markdown", text: installMarkdown(data, "all") };
  }
  if (uri === "suede://copy-seo-audit") {
    return { uri, mimeType: "text/markdown", text: seoAuditTemplate({ pageType: "Suede public surface" }) };
  }
  if (uri === "suede://visibility-grade") {
    return { uri, mimeType: "text/markdown", text: visibilityGradeTemplate({ pageType: "Suede public surface" }) };
  }
  if (uri === "suede://code-grade") {
    return { uri, mimeType: "text/markdown", text: codeGradeTemplate({ target: "Suede code change" }) };
  }
  if (uri === "suede://qa-checklist") {
    return { uri, mimeType: "text/markdown", text: qaChecklist({ target: "Suede change", scope: "full" }) };
  }
  throw Object.assign(new Error(`Unknown resource URI: ${uri}`), { code: -32602 });
}

function validatePromptArguments(name, args) {
  const prompt = prompts.find((item) => item.name === name);
  if (!prompt) throw rpcError(`Unknown prompt: ${name}`);
  if (!isObject(args)) throw rpcError(`Arguments for prompt ${name} must be an object`);
  const allowed = new Set(prompt.arguments.map((argument) => argument.name));
  const extras = Object.keys(args).filter((key) => !allowed.has(key));
  if (extras.length) throw rpcError(`Unknown argument(s) for prompt ${name}: ${extras.sort().join(", ")}`);
  for (const argument of prompt.arguments) {
    if (argument.required && (!(argument.name in args) || typeof args[argument.name] !== "string" || !args[argument.name].trim())) {
      throw rpcError(`Missing required argument for prompt ${name}: ${argument.name}`);
    }
  }
  for (const [key, value] of Object.entries(args)) {
    if (typeof value !== "string") throw rpcError(`Argument ${key} for prompt ${name} must be a string`);
    if (value.length > MAX_TEXT_CHARS) throw rpcError(`Argument ${key} for prompt ${name} exceeds ${MAX_TEXT_CHARS} characters`);
  }
}

function getPrompt(name, args = {}) {
  validatePromptArguments(name, args);
  if (name === "suede-copy-seo-audit") {
    const skillRef = isSkillAvailable("suede-copy") ? "$suede-copy" : "the Suede SEO/AEO/AI EO copy audit MCP template";
    return {
      description: "Audit Suede public copy for SEO, AEO, AI EO, trust, specificity, schema, conversion, and anti-slop line quality.",
      messages: [
        {
          role: "user",
          content: text(`Use ${skillRef} to run a full SEO/AEO/AI EO copy audit for ${boundedString(args.target, "this surface")}. Primary intent: ${boundedString(args.intent, "identify the strongest search intent, answer intent, and reader action")}. Include technical SEO, answer-ready copy, schema, internal links, CTA truth, evidence boundaries, exact rewrites, anti-slop line edits, and the full copy score.`)
        }
      ]
    };
  }
  if (name === "suede-plugin-install") {
    return {
      description: "Explain Suede public skill, local plugin, and MCP install options.",
      messages: [
        {
          role: "user",
          content: text(`Use the Suede Skills MCP to explain ${boundedString(args.surface, "all")} install options. Lead with the public Codex skill install, include local plugin install only as an operator note, include MCP server availability, and explain when to use each bundled skill.`)
        }
      ]
    };
  }
  if (name === "suede-visibility-grade") {
    const graderRef = isSkillAvailable("suede-visibility-grader") ? "$suede-visibility-grader" : "the Suede visibility grade MCP template";
    return {
      description: "Grade Suede public-page visibility, CTA pull, proof, AI readability, rendered evidence, and design signal.",
      messages: [
        {
          role: "user",
          content: text(`Use ${graderRef} to grade ${boundedString(args.target, "this page")} A-F for findability, first-screen clarity, CTA pull, proof and trust, AI readability, rendered design signal, and overall readiness. Primary action: ${boundedString(args.action, "identify the intended next click")}. Include screenshot/source evidence, viewport/state notes, grade caps, CTA rewrites, verification notes, ship gate, and Cue Suede choices.`)
        }
      ]
    };
  }
  if (name === "suede-code-grade") {
    const graderRef = isSkillAvailable("suede-code-grader") ? "$suede-code-grader" : "the Suede code grade MCP template";
    return {
      description: "Grade Suede code readiness, ship risk, verification gaps, and required upgrades.",
      messages: [
        {
          role: "user",
          content: text(`Use ${graderRef} to grade ${boundedString(args.target, "this code change")} A-F for correctness, security and permissions, data and state, Suede truth, UX and release behavior, tests and verification, deploy readiness, and overall ship risk. Intent: ${boundedString(args.intent, "identify the intended behavior")}. Include a simple non-coder explanation, usual breakdown, why the grade landed there, required upgrades, verification notes, ship gate, and Cue Suede choices.`)
        }
      ]
    };
  }
  if (name === "suede-full-qa") {
    const teamRef = isSkillAvailable("suede-agent-teams") ? "$suede-agent-teams" : "the Suede QA checklist MCP template";
    const gradeRef = isSkillAvailable("suede-code-grader") ? ", $suede-code-grader" : "";
    const reviewRef = isSkillAvailable("suede-code-review") ? " and $suede-code-review" : "";
    return {
      description: "Run multi-lane Suede QA with no-missed quality gates.",
      messages: [
        {
          role: "user",
          content: text(`Use ${teamRef}${gradeRef}${reviewRef} to QA ${boundedString(args.target, "this Suede change")} at ${boundedString(args.scope, "full")} depth. Cover no-missed quality gates, MCP validation, public skill validation, local plugin notes, SEO/AEO/AI EO docs, public site links, rendered visual QA, browser QA, A-F code grade, code/security, recovery controls, and live verification where applicable.`)
        }
      ]
    };
  }
  throw Object.assign(new Error(`Unknown prompt: ${name}`), { code: -32602 });
}

let lifecyclePhase = "new";

function assertParamsObject(params, method) {
  if (!isObject(params)) throw rpcError(`${method} params must be an object`);
  return params;
}

function assertOnlyKeys(params, keys, method) {
  const allowed = new Set([...keys, "_meta"]);
  const extras = Object.keys(params).filter((key) => !allowed.has(key));
  if (extras.length) throw rpcError(`${method} received unknown param(s): ${extras.sort().join(", ")}`);
  if ("_meta" in params && !isObject(params._meta)) {
    throw rpcError(`${method} _meta must be an object`);
  }
}

function initialize(params) {
  if (lifecyclePhase !== "new") throw rpcError("MCP session is already initialized", -32600);
  assertParamsObject(params, "initialize");
  assertOnlyKeys(params, ["protocolVersion", "capabilities", "clientInfo"], "initialize");
  if (typeof params.protocolVersion !== "string" || !params.protocolVersion.trim()) {
    throw rpcError("initialize.params.protocolVersion must be a non-empty string");
  }
  if (!isObject(params.capabilities)) throw rpcError("initialize.params.capabilities must be an object");
  if (!isObject(params.clientInfo)) throw rpcError("initialize.params.clientInfo must be an object");
  if (typeof params.clientInfo.name !== "string" || !params.clientInfo.name.trim()) {
    throw rpcError("initialize.params.clientInfo.name must be a non-empty string");
  }
  if (typeof params.clientInfo.version !== "string" || !params.clientInfo.version.trim()) {
    throw rpcError("initialize.params.clientInfo.version must be a non-empty string");
  }

  lifecyclePhase = "awaiting_initialized";
  const negotiatedVersion = SUPPORTED_PROTOCOL_VERSIONS.has(params.protocolVersion)
    ? params.protocolVersion
    : PROTOCOL_VERSION;
  return {
    protocolVersion: negotiatedVersion,
    capabilities: {
      tools: { listChanged: false },
      resources: { subscribe: false, listChanged: false },
      prompts: { listChanged: false }
    },
    serverInfo: { name: "suede-skills-mcp", title: "Suede Skills MCP", version: catalog.version },
    instructions: "Use this read-only MCP when Suede skill discovery, install guidance, visibility grading, code grading, SEO/AEO/AI EO copy audits, or QA checklists will materially help the task."
  };
}

function handleNotification(message) {
  if (message.method === "notifications/initialized") {
    if (lifecyclePhase === "awaiting_initialized") lifecyclePhase = "ready";
  }
}

function handleRequest(message) {
  const { method } = message;
  const params = message.params === undefined ? {} : message.params;
  if (!method || typeof method !== "string") {
    throw rpcError("Invalid JSON-RPC request: method must be a string", -32600);
  }
  if (method === "initialize") return initialize(params);
  if (method === "ping") return {};
  if (lifecyclePhase !== "ready") throw rpcError("MCP server is not initialized", -32000);
  assertParamsObject(params, method);
  if (method === "tools/list") {
    assertOnlyKeys(params, ["cursor"], method);
    if ("cursor" in params && typeof params.cursor !== "string") throw rpcError("tools/list cursor must be a string");
    return { tools };
  }
  if (method === "tools/call") {
    assertOnlyKeys(params, ["name", "arguments"], method);
    if (typeof params.name !== "string" || !params.name.trim()) throw rpcError("tools/call name must be a non-empty string");
    if ("arguments" in params && !isObject(params.arguments)) throw rpcError("tools/call arguments must be an object");
    return callTool(params.name, params.arguments || {});
  }
  if (method === "resources/list") {
    assertOnlyKeys(params, ["cursor"], method);
    if ("cursor" in params && typeof params.cursor !== "string") throw rpcError("resources/list cursor must be a string");
    return { resources };
  }
  if (method === "resources/read") {
    assertOnlyKeys(params, ["uri"], method);
    if (typeof params.uri !== "string" || !params.uri.trim()) throw rpcError("resources/read uri must be a non-empty string");
    return { contents: [readResource(params.uri)] };
  }
  if (method === "prompts/list") {
    assertOnlyKeys(params, ["cursor"], method);
    if ("cursor" in params && typeof params.cursor !== "string") throw rpcError("prompts/list cursor must be a string");
    return { prompts };
  }
  if (method === "prompts/get") {
    assertOnlyKeys(params, ["name", "arguments"], method);
    if (typeof params.name !== "string" || !params.name.trim()) throw rpcError("prompts/get name must be a non-empty string");
    if ("arguments" in params && !isObject(params.arguments)) throw rpcError("prompts/get arguments must be an object");
    return getPrompt(params.name, params.arguments || {});
  }
  throw rpcError(`Unsupported MCP method: ${method}`, -32601);
}

function send(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function sendResult(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, error) {
  const details = {
    code: Number.isInteger(error && error.code) ? error.code : -32603,
    message: error instanceof Error ? error.message : String(error)
  };
  if (error && error.data !== undefined) details.data = error.data;
  send({
    jsonrpc: "2.0",
    id,
    error: details
  });
}

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  if (Buffer.byteLength(buffer, "utf8") > MAX_INPUT_BUFFER_BYTES) {
    buffer = "";
    sendError(null, Object.assign(new Error("MCP input buffer exceeded 1 MiB"), { code: -32600 }));
    return;
  }
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch (error) {
      sendError(null, Object.assign(new Error("Parse error"), { code: -32700 }));
      continue;
    }
    try {
      if (!message || typeof message !== "object" || message.jsonrpc !== "2.0") {
        throw rpcError("Invalid JSON-RPC request", -32600);
      }
      if (message.id === undefined) {
        handleNotification(message);
        continue;
      }
      sendResult(message.id, handleRequest(message));
    } catch (error) {
      sendError(message && Object.prototype.hasOwnProperty.call(message, "id") ? message.id : null, error);
    }
  }
});
