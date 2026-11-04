import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SERVER = path.join(ROOT, "mcp", "suede-skills-mcp.mjs");
const VALIDATOR = path.join(ROOT, "scripts", "validate-skill-pack.mjs");
const CI_WORKFLOW = path.join(ROOT, ".github", "workflows", "skill-pack-ci.yml");
const CATALOG = JSON.parse(fs.readFileSync(path.join(ROOT, "mcp", "catalog.json"), "utf8"));
const MCP_CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, ".mcp.json"), "utf8"));
const CODEX_PLUGIN = JSON.parse(
  fs.readFileSync(path.join(ROOT, ".codex-plugin", "plugin.json"), "utf8")
);
const REQUEST_TIMEOUT_MS = 3000;

class McpSession {
  constructor(profile = "all", env = {}) {
    this.child = spawn(process.execPath, [SERVER, "--profile", profile], {
      cwd: ROOT,
      env: { ...process.env, SUEDE_MCP_OFFLINE: "", SUEDE_MCP_ALLOW_PRIVATE_HOSTS: "", ...env },
      stdio: ["pipe", "pipe", "pipe"]
    });
    this.buffer = "";
    this.stderr = "";
    this.messages = [];
    this.waiters = [];
    this.parseErrors = [];
    this.nextId = 1;

    this.child.stdout.setEncoding("utf8");
    this.child.stderr.setEncoding("utf8");
    this.child.stderr.on("data", (chunk) => {
      this.stderr += chunk;
    });
    this.child.stdout.on("data", (chunk) => {
      this.buffer += chunk;
      const lines = this.buffer.split("\n");
      this.buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          this.#push(JSON.parse(line));
        } catch (error) {
          this.parseErrors.push({ line, error });
        }
      }
    });
  }

  #push(message) {
    const waiter = this.waiters.shift();
    if (waiter) waiter.resolve(message);
    else this.messages.push(message);
  }

  async nextMessage() {
    if (this.messages.length) return this.messages.shift();
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject };
      this.waiters.push(waiter);
      const timer = setTimeout(() => {
        const index = this.waiters.indexOf(waiter);
        if (index !== -1) this.waiters.splice(index, 1);
        reject(new Error(`Timed out waiting for MCP output. stderr: ${this.stderr}`));
      }, REQUEST_TIMEOUT_MS);
      waiter.resolve = (message) => {
        clearTimeout(timer);
        resolve(message);
      };
    });
  }

  async sendRaw(raw) {
    if (!this.child.stdin.write(raw)) await once(this.child.stdin, "drain");
  }

  async request(method, params) {
    const id = this.nextId++;
    const message = { jsonrpc: "2.0", id, method };
    if (params !== undefined) message.params = params;
    await this.sendRaw(`${JSON.stringify(message)}\n`);
    const response = await this.nextMessage();
    assert.equal(response.id, id);
    assert.equal(response.jsonrpc, "2.0");
    return response;
  }

  async notify(method, params) {
    const message = { jsonrpc: "2.0", method };
    if (params !== undefined) message.params = params;
    await this.sendRaw(`${JSON.stringify(message)}\n`);
  }

  async initialize(protocolVersion = "2025-06-18") {
    const response = await this.request("initialize", {
      protocolVersion,
      capabilities: {},
      clientInfo: { name: "suede-mcp-test", version: "1.0.0" }
    });
    assert.ok(response.result);
    await this.notify("notifications/initialized");
    return response.result;
  }

  async close() {
    if (this.child.exitCode === null) {
      this.child.stdin.end();
      await Promise.race([
        once(this.child, "exit"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("MCP server did not exit after stdin closed")), REQUEST_TIMEOUT_MS))
      ]);
    }
    assert.deepEqual(this.parseErrors, [], "stdout must contain newline-delimited JSON only");
    assert.equal(this.stderr, "", "healthy server sessions must not write to stderr");
  }
}

async function withSession(run, profile = "all", env = {}) {
  const session = new McpSession(profile, env);
  try {
    await run(session);
  } finally {
    await session.close();
  }
}

test("enforces initialization and negotiates supported protocol versions", async () => {
  await withSession(async (session) => {
    const premature = await session.request("tools/list", {});
    assert.equal(premature.error.code, -32000);

    const malformed = await session.request("initialize", {});
    assert.equal(malformed.error.code, -32602);

    const initialized = await session.initialize("2025-03-26");
    assert.equal(initialized.protocolVersion, "2025-03-26");
    assert.equal(initialized.serverInfo.name, "suede-skills-mcp");
    assert.equal(initialized.serverInfo.version, CATALOG.version);
    assert.deepEqual(initialized.capabilities, {
      tools: { listChanged: false },
      resources: { subscribe: false, listChanged: false },
      prompts: { listChanged: false },
      completions: {}
    });

    const ping = await session.request("ping", {});
    assert.deepEqual(ping.result, {});
    const repeated = await session.request("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "duplicate", version: "1.0.0" }
    });
    assert.equal(repeated.error.code, -32600);
  });

  await withSession(async (session) => {
    const initialized = await session.initialize("2099-01-01");
    assert.equal(initialized.protocolVersion, "2025-11-25");
  });

  for (const version of ["2025-11-25", "2025-06-18", "2024-11-05"]) {
    await withSession(async (session) => {
      const initialized = await session.initialize(version);
      assert.equal(initialized.protocolVersion, version);
    });
  }
});

test("publishes closed input schemas, output schemas, and read-only annotations", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const response = await session.request("tools/list", {});
    const tools = response.result.tools;
    assert.deepEqual(tools.map((tool) => tool.name), CATALOG.mcp.tools);
    assert.equal(new Set(tools.map((tool) => tool.name)).size, tools.length);
    for (const tool of tools) {
      assert.equal(tool.inputSchema.type, "object");
      assert.equal(tool.inputSchema.additionalProperties, false);
      assert.equal(tool.outputSchema.type, "object");
      assert.equal(tool.outputSchema.additionalProperties, false);
      assert.deepEqual(tool.annotations, {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        // The live page audit is the one tool that reaches the network.
        openWorldHint: tool.name === "suede_live_page_audit"
      });
    }
  });
});

test("accepts reserved MCP request metadata without opening arbitrary params", async () => {
  for (const profile of ["creator", "workflow"]) {
    await withSession(async (session) => {
      await session.initialize();

      const withMetadata = await session.request("tools/list", {
          _meta: { progressToken: "run-1" }
      });
      assert.deepEqual(withMetadata.result.tools.map((tool) => tool.name), CATALOG.mcp.tools);
    }, profile);
  }

  await withSession(async (session) => {
    await session.initialize();
    const unknown = await session.request("tools/list", {
        _meta: { progressToken: "run-1" },
      unexpected: true
    });
    assert.equal(unknown.error.code, -32602);
    assert.match(unknown.error.message, /unexpected/);

    const invalidMetadata = await session.request("tools/list", { _meta: "not-an-object" });
    assert.equal(invalidMetadata.error.code, -32602);
    assert.match(invalidMetadata.error.message, /_meta must be an object/);
  });
});

test("returns structured content with a backwards-compatible text fallback", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const response = await session.request("tools/call", {
      name: "suede_install_options",
      arguments: { surface: "mcp" }
    });
    assert.equal(response.result.content[0].type, "text");
    assert.match(response.result.content[0].text, /MCP option/);
    assert.deepEqual(JSON.parse(response.result.content[1].text), response.result.structuredContent);
    assert.equal(response.result.structuredContent.surface, "mcp");

    const missing = await session.request("tools/call", {
      name: "get_suede_skill",
      arguments: {}
    });
    assert.equal(missing.error.code, -32602);

    const extra = await session.request("tools/call", {
      name: "list_suede_skills",
      arguments: { unexpected: true }
    });
    assert.equal(extra.error.code, -32602);

    const unknown = await session.request("tools/call", { name: "not_a_real_tool", arguments: {} });
    assert.equal(unknown.error.code, -32602);
  });
});

test("SEO audit output treats metadata lengths and heading counts as diagnostics", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const response = await session.request("tools/call", {
      name: "suede_copy_seo_audit",
      arguments: { pageType: "public documentation" }
    });
    const audit = response.result.content[0].text;
    assert.match(audit, /no fixed title character limit/i);
    assert.match(audit, /no fixed character limit/i);
    assert.match(audit, /not H1 count alone/i);
    assert.doesNotMatch(audit, /under 60|120-160|one H1/i);
  });
});

test("public-pack leak validation scans Python and shell source", () => {
  const fixtureDir = path.join(ROOT, "tests", "fixtures");
  const suffix = `${process.pid}-${Date.now()}`;
  const pythonProbe = path.join(fixtureDir, `validator-private-path-${suffix}.py`);
  const shellProbe = path.join(fixtureDir, `validator-secret-${suffix}.sh`);
  fs.mkdirSync(fixtureDir, { recursive: true });
  try {
    fs.writeFileSync(pythonProbe, `SOURCE = ${JSON.stringify("/Users/" + "jasoncolapietro/private-source")}\n`);
      const syntheticSecret = ["gh", "p_", "a".repeat(24)].join("");
      fs.writeFileSync(shellProbe, ["TOKEN=", syntheticSecret, "\n"].join(""));
    const result = spawnSync(process.execPath, [VALIDATOR, "--strict"], {
      cwd: ROOT,
      encoding: "utf8"
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(path.basename(pythonProbe)));
    assert.match(result.stderr, new RegExp(path.basename(shellProbe)));
  } finally {
    fs.rmSync(pythonProbe, { force: true });
    fs.rmSync(shellProbe, { force: true });
  }
});

test("CI whitespace gate compares the event commit range", () => {
  const workflow = fs.readFileSync(CI_WORKFLOW, "utf8");
  assert.match(workflow, /fetch-depth:\s*0/);
  assert.match(workflow, /git diff --check "\$PR_BASE_SHA\.\.\.\$PR_HEAD_SHA"/);
  assert.match(workflow, /git diff --check "\$PUSH_BEFORE_SHA" "\$GITHUB_SHA"/);
});

test("every catalog area is reachable through a shipped profile", async () => {
  // Marketing skills once existed in the catalog with no profile that could
  // reach them, so 41 of 71 skills were dead weight behind the MCP. `consumer`
  // is a legacy alias of `workflow` and must keep returning skills.
  const areas = new Set(CATALOG.skills.map((skill) => skill.area));
  const reached = new Set();
  for (const profile of ["workflow", "creator", "marketing", "consumer"]) {
    await withSession(async (session) => {
      await session.initialize();
      const response = await session.request("tools/call", {
        name: "list_suede_skills",
        arguments: {}
      });
      const skills = response.result.structuredContent.skills;
      assert.ok(skills.length > 0, `${profile} profile exposes no skills`);
      for (const skill of skills) reached.add(skill.area);
    }, profile);
  }
  assert.deepEqual([...areas].sort(), [...reached].sort());

  const registered = Object.values(MCP_CONFIG.mcpServers).map((server) => server.args.at(-1)).sort();
  assert.deepEqual(registered, ["all"]);
});

test("search ranks skills by task intent and refuses to guess", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const churn = await session.request("tools/call", {
      name: "search_suede_skills",
      arguments: { query: "reduce churn when subscribers cancel", limit: 3 }
    });
    const matches = churn.result.structuredContent.matches;
    assert.ok(matches.length <= 3);
    assert.ok(
      matches.some((match) => match.name === "suede-churn-prevention"),
      `churn query routed to ${matches.map((match) => match.name).join(", ")}`
    );
    assert.ok(matches.every((match) => typeof match.score === "number" && match.score > 0));

    const nothing = await session.request("tools/call", {
      name: "search_suede_skills",
      arguments: { query: "zzzqqq" }
    });
    assert.deepEqual(nothing.result.structuredContent.matches, []);

    const overLimit = await session.request("tools/call", {
      name: "search_suede_skills",
      arguments: { query: "seo", limit: 999 }
    });
    assert.equal(overLimit.error.code, -32602);

    const scoped = await session.request("tools/call", {
      name: "search_suede_skills",
      arguments: { query: "review a diff for security bugs", area: "marketing" }
    });
    assert.ok(scoped.result.structuredContent.matches.every((match) => match.area === "marketing"));
  });
});

// Routing eval. A lexical scorer regresses silently: the pack shipped one that
// missed "my landing page is not converting" entirely, because the catalog says
// "conversion" and incidental "page" matches outranked it. These are real
// phrasings, scored as a set — a single reshuffle is tolerable, a broad
// collapse is not.
const ROUTING_EVAL = [
  ["my landing page is not converting", "suede-site-alchemy"],
  ["reduce churn when subscribers cancel", "suede-churn-prevention"],
  ["review a pull request diff for security bugs", "suede-code"],
  ["write a cold outbound email sequence", "suede-cold-email"],
  ["my app store listing needs better keywords", "suede-aso"],
  ["set up branch protection and required checks", "suede-ci-gate"],
  ["price my subscription tiers", "suede-pricing"],
  ["strip the AI tells out of this blog post", "suede-deslop"],
  ["plan an A/B test on the signup flow", "suede-ab-testing"],
  ["audit my site for search visibility", "suede-seo-audit"],
  ["package a song for sync licensing pitches", "suede-sync-packaging"],
  ["build an iOS app from my website", "site-to-ios-app"],
  ["find the rights gaps before I hand off a release", "suede-rights-passport"],
  ["design evals that catch model regressions", "suede-ai-eval"],
  ["grow my instagram account", "suede-social"],
  ["audit my landing page for AI search", "suede-seo-audit"],
  ["get my business cited by ChatGPT", "suede-ai-seo"],
  ["why don't I rank on Google", "suede-seo-audit"],
  ["grade this page before I promote it", "suede-visibility-grader"],
  ["show up in perplexity answers", "suede-ai-seo"],
  ["write copy for my homepage hero", "suede-copy"]
];

test("search routes real task phrasings to the owning skill", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const misses = [];
    for (const [query, expected] of ROUTING_EVAL) {
      const response = await session.request("tools/call", {
        name: "search_suede_skills",
        arguments: { query, limit: 3 }
      });
      const ranked = response.result.structuredContent.matches.map((match) => match.name);
      if (!ranked.includes(expected)) misses.push(`"${query}" wanted ${expected}, got ${ranked.join(", ") || "nothing"}`);
    }
    assert.ok(
      misses.length <= 1,
      `${misses.length}/${ROUTING_EVAL.length} routing cases fell out of the top 3:\n${misses.join("\n")}`
    );
  });
});

test("skill bodies are served from the pack and cannot escape skills/", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const withBody = await session.request("tools/call", {
      name: "get_suede_skill",
      arguments: { name: "$suede-graph-flo-xr", includeBody: true }
    });
    const structured = withBody.result.structuredContent;
    assert.equal(structured.found, true);
    assert.match(structured.body, /^---\nname: suede-graph-flo-xr/);
    assert.equal(structured.bodyTruncated, false);

    const withoutBody = await session.request("tools/call", {
      name: "get_suede_skill",
      arguments: { name: "suede-graph-flo-xr" }
    });
    assert.equal(withoutBody.result.structuredContent.body, undefined);

    const traversal = await session.request("tools/call", {
      name: "get_suede_skill",
      arguments: { name: "../../etc/passwd", includeBody: true }
    });
    assert.equal(traversal.result.structuredContent.found, false);
    assert.equal(traversal.result.isError, true);

    const badType = await session.request("tools/call", {
      name: "get_suede_skill",
      arguments: { name: "suede-graph-flo-xr", includeBody: "yes" }
    });
    assert.equal(badType.error.code, -32602);
  }, "workflow");
});

test("specialty profiles narrow the server and the specialties tool describes them", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const skills = await session.request("tools/call", { name: "list_suede_skills", arguments: {} });
    const names = skills.result.structuredContent.skills.map((skill) => skill.name);
    assert.ok(names.length > 0 && names.length < CATALOG.skills.length);
    assert.ok(skills.result.structuredContent.skills.every((skill) => skill.specialty === "revenue"));

    const specialties = await session.request("tools/call", { name: "list_suede_specialties", arguments: {} });
    const listed = specialties.result.structuredContent.specialties;
    assert.equal(listed.length, 1);
    assert.equal(listed[0].key, "revenue");
    assert.equal(listed[0].count, names.length);
  }, "revenue");

  await withSession(async (session) => {
    await session.initialize();
    const specialties = await session.request("tools/call", { name: "list_suede_specialties", arguments: {} });
    const listed = specialties.result.structuredContent.specialties;
    assert.equal(listed.length, CATALOG.specialties.length);
    assert.equal(
      listed.reduce((sum, spec) => sum + spec.count, 0),
      CATALOG.skills.length
    );
    for (const spec of listed) {
      assert.equal(spec.lanes.reduce((sum, lane) => sum + lane.count, 0), spec.count);
    }
  }, "all");
});

test("catalog, resources, prompts, and profile filters match the live server", async () => {
  assert.equal(CATALOG.mcp.tools.length, 12);
  assert.equal(CATALOG.mcp.resources.length, 7);
  assert.equal(CATALOG.mcp.prompts.length, 5);

  await withSession(async (session) => {
    await session.initialize();
    const resources = await session.request("resources/list", {});
    assert.deepEqual(resources.result.resources.map((resource) => resource.uri), CATALOG.mcp.resources);
    const resource = await session.request("resources/read", { uri: "suede://catalog" });
    assert.equal(resource.result.contents[0].mimeType, "application/json");
    assert.equal(JSON.parse(resource.result.contents[0].text).version, CATALOG.version);
    const missingResource = await session.request("resources/read", { uri: "suede://missing" });
    assert.equal(missingResource.error.code, -32602);

    const prompts = await session.request("prompts/list", {});
    assert.deepEqual(prompts.result.prompts.map((prompt) => prompt.name), CATALOG.mcp.prompts);
    const prompt = await session.request("prompts/get", {
      name: "suede-full-qa",
      arguments: { target: "current pack", scope: "release" }
    });
    assert.match(prompt.result.messages[0].content.text, /current pack/);
    const missingArgument = await session.request("prompts/get", {
      name: "suede-full-qa",
      arguments: {}
    });
    assert.equal(missingArgument.error.code, -32602);
  });

  await withSession(async (session) => {
    await session.initialize();
    const response = await session.request("tools/call", {
      name: "list_suede_skills",
      arguments: { area: "all" }
    });
    assert.ok(response.result.structuredContent.skills.length > 0);
    assert.ok(response.result.structuredContent.skills.every((skill) => ["artist", "creator"].includes(skill.area)));
    assert.ok(!response.result.structuredContent.skills.some((skill) => skill.name === "suede-graph-flo-xr"));
  }, "creator");

  await withSession(async (session) => {
    await session.initialize();
    const response = await session.request("tools/call", {
      name: "list_suede_skills",
      arguments: { area: "all" }
    });
    assert.ok(
      response.result.structuredContent.skills.every((skill) => skill.area === "workflow")
    );
    assert.ok(response.result.structuredContent.skills.some((skill) => skill.name === "suede-graph-flo-xr"));

    const ship = await session.request("tools/call", {
      name: "get_suede_skill",
      arguments: { name: "suede-graph-flo-xr" }
    });
    assert.equal(ship.result.structuredContent.found, true);
    assert.match(
      ship.result.structuredContent.skill.useWhen,
      /evidence-gated orchestration contract.*Suede Thought Graph workflow/
    );
  }, "workflow");
});

test("Claude and Codex plugins register exactly one full-catalog MCP server", () => {
  assert.deepEqual(Object.keys(MCP_CONFIG.mcpServers), ["suede_skills_mcp"]);
  const server = MCP_CONFIG.mcpServers.suede_skills_mcp;
  assert.equal(server.command, "node");
  assert.equal(server.cwd, "${CLAUDE_PLUGIN_ROOT}");
  assert.deepEqual(server.args, ["${CLAUDE_PLUGIN_ROOT}/mcp/suede-skills-mcp.mjs", "--profile", "all"]);

  assert.deepEqual(Object.keys(CODEX_PLUGIN.mcpServers), ["suede_skills_mcp"]);
  const codexServer = CODEX_PLUGIN.mcpServers.suede_skills_mcp;
  assert.deepEqual(codexServer.args, ["./mcp/suede-skills-mcp.mjs", "--profile", "all"]);
  assert.equal(codexServer.cwd, ".");
  assert.doesNotMatch(JSON.stringify(CODEX_PLUGIN.mcpServers), /CLAUDE_PLUGIN_ROOT/);

  for (const [serverName, server] of Object.entries(CODEX_PLUGIN.mcpServers)) {
    const initialization = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "codex-plugin-smoke", version: "1.0.0" }
      }
    };
    const launched = spawnSync(server.command, server.args, {
      cwd: path.resolve(ROOT, server.cwd),
      encoding: "utf8",
      input: `${JSON.stringify(initialization)}\n`
    });
    assert.equal(launched.status, 0, `${serverName}\n${launched.stderr}`);
    const response = JSON.parse(launched.stdout.trim());
    assert.equal(response.result.serverInfo.version, CATALOG.version);
  }
});

test("recovers from malformed input and rejects unsupported methods", async () => {
  await withSession(async (session) => {
    await session.sendRaw("not-json\n");
    const parseError = await session.nextMessage();
    assert.equal(parseError.id, null);
    assert.equal(parseError.error.code, -32700);

    await session.initialize();
    const unsupported = await session.request("totally/bogus", {});
    assert.equal(unsupported.error.code, -32601);
  });
});

test("bounds input and rejects unknown profiles without stdout leakage", async () => {
  await withSession(async (session) => {
    await session.sendRaw("x".repeat(1024 * 1024 + 1));
    const oversized = await session.nextMessage();
    assert.equal(oversized.id, null);
    assert.equal(oversized.error.code, -32600);
    assert.match(oversized.error.message, /1 MiB/);
    await session.initialize();
  });

  const invalid = spawnSync(process.execPath, [SERVER, "--profile", "unknown"], {
    cwd: ROOT,
    encoding: "utf8"
  });
  assert.equal(invalid.status, 2);
  assert.equal(invalid.stdout, "");
  assert.match(invalid.stderr, /Unknown profile/);
});

// ---------------------------------------------------------------------------
// Live page audit, copy check, workflow planner, skill resources, completions.

const GOOD_PAGE = `<!doctype html><html lang="en"><head>
<title>Free SEO and AI search audits for local businesses</title>
<meta name="description" content="Find out why customers cannot find you on Google and ChatGPT, with the exact fix for each problem and a free A-F grade.">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="/">
<meta property="og:title" content="Free AI search audit"><meta property="og:description" content="A-F grade in two minutes">
<meta property="og:image" content="https://cdn.example.com/og.png"><meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Example"},{"@type":"FAQPage"}]}</script>
</head><body><h1>Get found on Google and ChatGPT</h1><h2>What the audit checks</h2><h2>How long does it take?</h2>
<p>${"Customers search before they call. ".repeat(60)}</p>
<a href="/audit">Get my free audit</a> <a href="mailto:hello@example.com">Email us</a><img src="/a.png" alt="Audit report"></body></html>`;
const CLIENT_RENDERED_NOINDEX = `<html><head><meta name="robots" content="noindex"></head><body><div id="root"></div><script src="/app.js"></script></body></html>`;

async function withSite(run) {
  const server = http.createServer((req, res) => {
    if (req.url === "/robots.txt") {
      res.setHeader("content-type", "text/plain");
      res.end("User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: PerplexityBot\nDisallow: /app\n\nSitemap: /sitemap.xml\n");
      return;
    }
    if (req.url === "/sitemap.xml") {
      res.setHeader("content-type", "application/xml");
      res.end('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      return;
    }
    if (req.url === "/llms.txt") {
      res.setHeader("content-type", "text/plain");
      res.end("# Example\n- [Audit](/audit)\n");
      return;
    }
    if (req.url === "/moved") {
      res.writeHead(301, { location: "/" });
      res.end();
      return;
    }
    if (req.url === "/gone") {
      res.writeHead(404, { "content-type": "text/html" });
      res.end("<html><body>Not found</body></html>");
      return;
    }
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(req.url.startsWith("/app") ? CLIENT_RENDERED_NOINDEX : GOOD_PAGE);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

const ALLOW_LOCAL = { SUEDE_MCP_ALLOW_PRIVATE_HOSTS: "1" };

test("live page audit grades what the page actually serves", async () => {
  await withSite(async (base) => {
    await withSession(async (session) => {
      await session.initialize();
      const good = await session.request("tools/call", {
        name: "suede_live_page_audit",
        arguments: { url: `${base}/moved`, primaryAction: "free audit" }
      });
      assert.equal(good.result.isError, undefined);
      const report = good.result.structuredContent;
      assert.equal(report.ok, true);
      assert.equal(report.finalUrl, `${base}/`);
      assert.equal(report.status, 200);
      const byId = Object.fromEntries(report.checks.map((check) => [check.id, check]));
      for (const id of ["status", "indexable", "robots-google", "canonical", "title", "description", "sitemap", "answer-bots", "h1", "text", "schema", "answers", "llms", "cta", "primary-action", "og-image"]) {
        assert.equal(byId[id]?.status, "pass", `${id}: ${JSON.stringify(byId[id])}`);
      }
      // Training crawlers are reported, never penalized; answer engines are scored.
      assert.deepEqual(report.robots.blockedTrainingBots, ["GPTBot"]);
      assert.deepEqual(report.robots.blockedAnswerBots, []);
      assert.equal(byId["training-bots"].status, "info");
      assert.deepEqual(report.page.schemaTypes.sort(), ["FAQPage", "Organization"]);
      assert.ok(["A", "B"].includes(report.overall.grade), `good page graded ${report.overall.grade}`);
      assert.equal(report.lanes.length, 4);
      assert.match(good.result.content[0].text, /^# Suede Live Page Audit/);

      const bad = await session.request("tools/call", {
        name: "suede_live_page_audit",
        arguments: { url: `${base}/app` }
      });
      const badReport = bad.result.structuredContent;
      assert.equal(badReport.overall.grade, "F");
      const badById = Object.fromEntries(badReport.checks.map((check) => [check.id, check]));
      assert.equal(badById.indexable.status, "fail");
      assert.equal(badById.text.status, "fail");
      assert.equal(badById.h1.status, "fail");
      assert.equal(badById["answer-bots"].status, "fail");
      assert.deepEqual(badReport.robots.blockedAnswerBots, ["PerplexityBot"]);
      assert.ok(badReport.topFixes.length > 0 && badReport.topFixes.length <= 5);

      const missing = await session.request("tools/call", {
        name: "suede_live_page_audit",
        arguments: { url: `${base}/gone` }
      });
      assert.equal(missing.result.structuredContent.status, 404);
      assert.equal(missing.result.structuredContent.overall.grade, "F");
    }, "all", ALLOW_LOCAL);
  });
});

test("live page audit refuses private hosts, bad schemes and offline mode as tool errors", async () => {
  await withSite(async (base) => {
    await withSession(async (session) => {
      await session.initialize();
      const local = await session.request("tools/call", { name: "suede_live_page_audit", arguments: { url: base } });
      assert.equal(local.result.isError, true);
      assert.equal(local.result.structuredContent.ok, false);
      assert.match(local.result.structuredContent.error, /private or reserved address/);

      const fileUrl = await session.request("tools/call", { name: "suede_live_page_audit", arguments: { url: "file:///etc/passwd" } });
      assert.equal(fileUrl.result.isError, true);
      assert.match(fileUrl.result.structuredContent.error, /Only http and https/);

      const empty = await session.request("tools/call", { name: "suede_live_page_audit", arguments: { url: "  " } });
      assert.equal(empty.error.code, -32602);
    });
  });

  await withSession(async (session) => {
    await session.initialize();
    const offline = await session.request("tools/call", {
      name: "suede_live_page_audit",
      arguments: { url: "https://example.com" }
    });
    assert.equal(offline.result.isError, true);
    assert.equal(offline.result.structuredContent.error, "offline");
  }, "all", { SUEDE_MCP_OFFLINE: "1" });
});

test("copy check scores copy against the house rules", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const bad = await session.request("tools/call", {
      name: "suede_copy_check",
      arguments: {
        copy: "We help you grow your business with innovative solutions. Our world-class team can help you unlock seamless growth! We believe it is basically a game-changer \u2014 here\u2019s the thing.",
        primaryAction: "free audit"
      }
    });
    const result = bad.result.structuredContent;
    assert.equal(result.grade, "F");
    const rules = result.findings.map((finding) => finding.rule);
    for (const rule of ["House ban: Em dash", 'House ban: "unlock/unleash"', 'House ban: "seamless"', 'House ban: "game-changer"', "Hedge or softener", "Vague or buzzword claim", "No call to action", "Primary action missing", "Promotional exclamation point"]) {
      assert.ok(rules.includes(rule), `missing finding ${rule}; got ${rules.join(", ")}`);
    }
    assert.ok(result.findings.every((finding) => ["high", "medium", "low"].includes(finding.severity)));

    const good = await session.request("tools/call", {
      name: "suede_copy_check",
      arguments: {
        copy: "You get a free A-F grade for your site in two minutes. The audit checks 26 signals, from your title tag to whether ChatGPT can read the page, and lists the exact fix for each one. Run your free audit now.",
        primaryAction: "free audit"
      }
    });
    assert.equal(good.result.structuredContent.grade, "A");
    assert.deepEqual(good.result.structuredContent.findings, []);
    assert.equal(good.result.structuredContent.metrics.hasCallToAction, true);

    // Several problems packed into one short line must not score like a page.
    const shortLine = await session.request("tools/call", {
      name: "suede_copy_check",
      arguments: { copy: "Unlock seamless growth with our innovative solutions!" }
    });
    assert.equal(shortLine.result.structuredContent.grade, "F");

    const otherBrand = await session.request("tools/call", {
      name: "suede_copy_check",
      arguments: { copy: "Seamless onboarding \u2014 sign up today.", houseStyle: false }
    });
    assert.ok(!otherBrand.result.structuredContent.findings.some((finding) => finding.rule.startsWith("House ban")));

    const empty = await session.request("tools/call", { name: "suede_copy_check", arguments: { copy: "   " } });
    assert.equal(empty.error.code, -32602);
    const tooLong = await session.request("tools/call", { name: "suede_copy_check", arguments: { copy: "a".repeat(20001) } });
    assert.equal(tooLong.error.code, -32602);
  });
});

test("workflow planner orders matching skills by phase", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const plan = await session.request("tools/call", {
      name: "plan_suede_workflow",
      arguments: { goal: "get my business cited by ChatGPT and fix a landing page that gets no signups", maxSteps: 6 }
    });
    const { steps } = plan.result.structuredContent;
    const names = steps.map((step) => step.name);
    assert.ok(names.includes("suede-ai-seo"), names.join(", "));
    assert.ok(names.includes("suede-site-alchemy"), names.join(", "));
    assert.ok(steps.length <= 6);
    assert.deepEqual(steps.map((step) => step.step), steps.map((_, index) => index + 1));
    const phases = ["position", "craft", "ship", "found", "demand", "revenue"];
    const order = steps.map((step) => phases.indexOf(step.specialty));
    assert.deepEqual(order, [...order].sort((a, b) => a - b), "steps must run in phase order");
    assert.match(plan.result.content[0].text, /Start with step 1: call get_suede_skill/);

    const ios = await session.request("tools/call", { name: "plan_suede_workflow", arguments: { goal: "launch my iOS app and get downloads" } });
    const iosNames = ios.result.structuredContent.steps.map((step) => step.name);
    assert.ok(iosNames.includes("site-to-ios-app") && iosNames.includes("suede-aso"), iosNames.join(", "));
    assert.ok(!iosNames.includes("android-app-factory"), `iOS plan pulled in Android: ${iosNames.join(", ")}`);

    const nothing = await session.request("tools/call", { name: "plan_suede_workflow", arguments: { goal: "zzzqqq" } });
    assert.deepEqual(nothing.result.structuredContent.steps, []);
    const tooMany = await session.request("tools/call", { name: "plan_suede_workflow", arguments: { goal: "seo", maxSteps: 99 } });
    assert.equal(tooMany.error.code, -32602);
  });
});

test("every skill's instructions are readable through the skill resource template", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const templates = await session.request("resources/templates/list", {});
    assert.deepEqual(templates.result.resourceTemplates.map((template) => template.uriTemplate), ["suede://skill/{name}"]);

    const read = await session.request("resources/read", { uri: "suede://skill/suede-copy" });
    assert.equal(read.result.contents[0].mimeType, "text/markdown");
    assert.match(read.result.contents[0].text, /^---\nname: suede-copy/);

    for (const uri of ["suede://skill/not-a-skill", "suede://skill/..%2F..%2Fetc%2Fpasswd", "suede://skill/%E0%A4%A"]) {
      const refused = await session.request("resources/read", { uri });
      assert.equal(refused.error.code, -32602, uri);
    }
  });

  // A narrowed profile only serves its own skills.
  await withSession(async (session) => {
    await session.initialize();
    const outside = await session.request("resources/read", { uri: "suede://skill/suede-graph-flo-xr" });
    assert.equal(outside.error.code, -32602);
  }, "creator");
});

test("completions suggest skill names and prompt argument values", async () => {
  await withSession(async (session) => {
    await session.initialize();
    const skills = await session.request("completion/complete", {
      ref: { type: "ref/resource", uri: "suede://skill/{name}" },
      argument: { name: "name", value: "suede-ai" }
    });
    const values = skills.result.completion.values;
    assert.ok(values.includes("suede-ai-seo") && values.includes("suede-ai-eval"), values.join(", "));
    assert.ok(values.every((value) => value.includes("suede-ai")));
    assert.equal(skills.result.completion.total, values.length);
    assert.equal(skills.result.completion.hasMore, false);

    const surface = await session.request("completion/complete", {
      ref: { type: "ref/prompt", name: "suede-plugin-install" },
      argument: { name: "surface", value: "c" }
    });
    assert.deepEqual(surface.result.completion.values, ["codex", "claude"]);

    const freeText = await session.request("completion/complete", {
      ref: { type: "ref/prompt", name: "suede-full-qa" },
      argument: { name: "target", value: "x" }
    });
    assert.deepEqual(freeText.result.completion.values, []);

    const unknownPrompt = await session.request("completion/complete", {
      ref: { type: "ref/prompt", name: "nope" },
      argument: { name: "surface", value: "" }
    });
    assert.equal(unknownPrompt.error.code, -32602);
  });
});

test("regressions: specialties resource shape, ranked search text, specialty hints", async () => {
  await withSession(async (session) => {
    await session.initialize();
    // suede://specialties used to come back as contents[0].contents (double wrapped).
    const specialties = await session.request("resources/read", { uri: "suede://specialties" });
    assert.equal(specialties.result.contents.length, 1);
    assert.equal(specialties.result.contents[0].uri, "suede://specialties");
    const parsed = JSON.parse(specialties.result.contents[0].text);
    assert.deepEqual(parsed.map((entry) => entry.key), CATALOG.specialties.map((entry) => entry.key));

    // The text result used to regroup matches by specialty, printing a weaker
    // match above the best one. It must read best-first.
    const search = await session.request("tools/call", {
      name: "search_suede_skills",
      arguments: { query: "audit my landing page for AI search", limit: 5 }
    });
    const best = search.result.structuredContent.matches[0].name;
    assert.match(search.result.content[0].text, new RegExp(`^1\\. \\$${best} `));

    // The schemas advertised a specialty ("earn") that the server rejects.
    const tools = (await session.request("tools/list", {})).result.tools;
    for (const tool of tools) {
      const property = tool.inputSchema.properties.specialty;
      if (!property) continue;
      for (const key of property.enum.filter((value) => value !== "all")) {
        assert.ok(property.description.includes(key), `${tool.name} specialty hint omits ${key}`);
      }
      assert.ok(!/\bearn\b/.test(property.description), `${tool.name} still advertises "earn"`);
    }
  });
});

test("handles a client that pipelines initialize, initialized and a request in one write", async () => {
  await withSession(async (session) => {
    const lines = [
      { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "pipeline", version: "1" } } },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }
    ].map((message) => JSON.stringify(message)).join("\n");
    await session.sendRaw(`${lines}\n`);
    const first = await session.nextMessage();
    const second = await session.nextMessage();
    assert.equal(first.id, 1);
    assert.equal(second.id, 2);
    assert.equal(second.result.tools.length, CATALOG.mcp.tools.length);
    session.nextId = 3;
  });
});

test("the server runs from the minimal layout the Dockerfile and npm package ship", async () => {
  const dockerfile = fs.readFileSync(path.join(ROOT, "Dockerfile"), "utf8");
  assert.match(dockerfile, /^FROM node:22/m);
  assert.match(dockerfile, /COPY mcp\/ \.\/mcp\//);
  assert.match(dockerfile, /COPY skills\/ \.\/skills\//);
  assert.match(dockerfile, /ENTRYPOINT \["node", "mcp\/suede-skills-mcp\.mjs"\]/);

  const tmp = fs.mkdtempSync(path.join(ROOT, "tests", "fixtures", "image-"));
  try {
    fs.cpSync(path.join(ROOT, "mcp"), path.join(tmp, "mcp"), { recursive: true });
    fs.cpSync(path.join(ROOT, "skills"), path.join(tmp, "skills"), { recursive: true });
    const child = spawn(process.execPath, [path.join(tmp, "mcp", "suede-skills-mcp.mjs"), "--profile", "all"], { cwd: tmp, stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (chunk) => { out += chunk; });
    child.stderr.on("data", (chunk) => { err += chunk; });
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "image", version: "1" } } })}\n`);
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "get_suede_skill", arguments: { name: "suede-copy", includeBody: true } } })}\n`);
    child.stdin.end();
    await once(child, "exit");
    assert.equal(err, "");
    const responses = out.trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(responses[1].result.structuredContent.found, true);
    assert.match(responses[1].result.structuredContent.body, /^---\nname: suede-copy/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
