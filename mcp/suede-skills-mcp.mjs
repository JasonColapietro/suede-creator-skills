#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROTOCOL_VERSION = "2025-06-18";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = { profile: "all" };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--profile" && argv[i + 1]) {
      args.profile = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

const { profile } = parseArgs(process.argv);
const catalogPath = path.join(__dirname, "catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const MAX_INPUT_BUFFER_CHARS = 1024 * 1024;
const MAX_TEXT_CHARS = 2000;

function boundedString(value, fallback = "") {
  const raw = value === undefined || value === null ? fallback : String(value);
  return raw.length > MAX_TEXT_CHARS ? `${raw.slice(0, MAX_TEXT_CHARS)}...` : raw;
}

function profileCatalog() {
  if (profile === "workflow" || profile === "artist" || profile === "creator") {
    const areaSet = profile === "creator" ? new Set(["artist", "creator"]) : new Set([profile]);
    return {
      ...catalog,
      plugins: catalog.plugins.filter((plugin) =>
        plugin.name.includes(profile) || (profile === "artist" && plugin.name === "suede-creator-skills")
      ),
      skills: catalog.skills.filter((skill) => areaSet.has(skill.area))
    };
  }
  return catalog;
}

function text(content) {
  return { type: "text", text: content };
}

function asMarkdownSkillList(data) {
  return data.skills
    .map((skill) => `- $${skill.name}: ${skill.description} Use when: ${skill.useWhen}`)
    .join("\n");
}

function isSkillAvailable(name) {
  return profileCatalog().skills.some((skill) => skill.name === name);
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
  return [
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
    "- One H1 that names the outcome.",
    "- Search-ready title under 60 characters when practical.",
    "- Meta description around 120-160 characters when practical.",
    "- H2/H3 structure matches actual page sections.",
    "- Durable Suede terms appear naturally, not stuffed.",
    "- Answer-ready definitions and FAQ copy are visible, sourceable, and claim-safe.",
    "",
    "## Structured Data And AI EO Check",
    "- Match schema to visible content.",
    "- Validate JSON-LD syntax.",
    "- Use FAQPage only when the questions and answers are visible.",
    "- Check whether AI summaries can cite the page without inventing partners, metrics, legal clearance, payouts, or private access.",
    "",
    "## Conversion And Trust Check",
    "- One primary CTA.",
    "- Claim boundaries are visible.",
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
  ].join("\n");
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
    "- Broken primary CTA or false public claim caps promotion readiness at D/F.",
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
    "- Suede public claims, rights/provenance, payment/wallet, registry, royalty, and agent-commerce contracts when relevant.",
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
    "- Do not invent tests, screenshots, live checks, deploy status, or public claim evidence.",
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
    "- Check title, description, H1, headings, canonical, sitemap, schema, internal links, answer-ready copy, CTA copy, and claim boundaries.",
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
    "- Validate frontmatter, folder/name match, OpenAI manifests, catalog/filesystem match, docs links, install paths, private-path leaks, secret-like text, unsupported public claims, and generated docs drift.",
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
          enum: ["all", "workflow", "artist", "creator"],
          description: "Optional area filter."
        }
      }
    }
  },
  {
    name: "get_suede_skill",
    title: "Get Suede Skill",
    description: "Return details for one Suede skill.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Skill name, with or without a leading dollar sign." }
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

function callTool(name, args = {}) {
  const data = profileCatalog();
  if (name === "list_suede_skills") {
    const area = args.area || (profile === "creator" ? "all" : profile);
    const scoped = area === "all" ? data.skills : data.skills.filter((skill) => skill.area === area);
    return {
      content: [text(asMarkdownSkillList({ skills: scoped }))],
      structuredContent: { skills: scoped }
    };
  }
  if (name === "get_suede_skill") {
    const requested = boundedString(args.name).replace(/^\$/, "");
    const skill = data.skills.find((item) => item.name === requested);
    if (!skill) {
      return { content: [text(`Unknown Suede skill: ${requested}`)], structuredContent: { found: false }, isError: true };
    }
    return {
      content: [text(`$${skill.name}: ${skill.description}\n\nUse when: ${skill.useWhen}`)],
      structuredContent: { found: true, skill }
    };
  }
  if (name === "suede_install_options") {
    return {
      content: [text(installMarkdown(data, args.surface || "all"))],
      structuredContent: { plugins: data.plugins, surface: args.surface || "all" }
    };
  }
  if (name === "suede_copy_seo_audit") {
    return {
      content: [text(seoAuditTemplate(args))],
      structuredContent: {
        target: args.url || args.pageType ? boundedString(args.url || args.pageType) : null,
        primaryIntent: args.primaryIntent ? boundedString(args.primaryIntent) : null
      }
    };
  }
  if (name === "suede_visibility_grade") {
    return {
      content: [text(visibilityGradeTemplate(args))],
      structuredContent: {
        target: args.url || args.pageType ? boundedString(args.url || args.pageType) : null,
        primaryAction: args.primaryAction ? boundedString(args.primaryAction) : null
      }
    };
  }
  if (name === "suede_code_grade") {
    return {
      content: [text(codeGradeTemplate(args))],
      structuredContent: {
        target: args.target || args.repo || args.diff ? boundedString(args.target || args.repo || args.diff) : null,
        intent: args.intent ? boundedString(args.intent) : null
      }
    };
  }
  if (name === "suede_qa_checklist") {
    return {
      content: [text(qaChecklist(args))],
      structuredContent: {
        target: args.target ? boundedString(args.target) : null,
        scope: boundedString(args.scope, "full")
      }
    };
  }
  throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32602 });
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

function getPrompt(name, args = {}) {
  if (name === "suede-copy-seo-audit") {
    const skillRef = isSkillAvailable("suede-copy") ? "$suede-copy" : "the Suede SEO/AEO/AI EO copy audit MCP template";
    return {
      description: "Audit Suede public copy for SEO, AEO, AI EO, trust, specificity, schema, conversion, and anti-slop line quality.",
      messages: [
        {
          role: "user",
          content: text(`Use ${skillRef} to run a full SEO/AEO/AI EO copy audit for ${boundedString(args.target, "this surface")}. Primary intent: ${boundedString(args.intent, "identify the strongest search intent, answer intent, and reader action")}. Include technical SEO, answer-ready copy, schema, internal links, CTA truth, claim boundaries, exact rewrites, anti-slop line edits, and the full copy score.`)
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

function handleRequest(message) {
  const { id, method, params = {} } = message;
  if (!method || typeof method !== "string") {
    throw Object.assign(new Error("Invalid JSON-RPC request: method must be a string"), { code: -32600 });
  }
  if (method === "initialize") {
    return {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {}, resources: {}, prompts: {} },
      serverInfo: { name: "suede-skills-mcp", version: catalog.version },
      instructions: "Use this MCP when Suede skill discovery, install guidance, visibility grading, code grading, SEO/AEO/AI EO copy audits, or QA checklists will materially help the task."
    };
  }
  if (method === "ping") return {};
  if (method === "tools/list") return { tools };
  if (method === "tools/call") return callTool(params.name, params.arguments || {});
  if (method === "resources/list") return { resources };
  if (method === "resources/read") return { contents: [readResource(params.uri)] };
  if (method === "prompts/list") return { prompts };
  if (method === "prompts/get") return getPrompt(params.name, params.arguments || {});
  throw Object.assign(new Error(`Unsupported MCP method: ${method}`), { code: -32601 });
}

function send(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function sendResult(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, error) {
  send({
    jsonrpc: "2.0",
    id,
    error: {
      code: Number.isInteger(error && error.code) ? error.code : -32603,
      message: error instanceof Error ? error.message : String(error)
    }
  });
}

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  if (buffer.length > MAX_INPUT_BUFFER_CHARS) {
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
        throw Object.assign(new Error("Invalid JSON-RPC request"), { code: -32600 });
      }
      if (message.id === undefined) {
        continue;
      }
      sendResult(message.id, handleRequest(message));
    } catch (error) {
      sendError(message && Object.prototype.hasOwnProperty.call(message, "id") ? message.id : null, error);
    }
  }
});
