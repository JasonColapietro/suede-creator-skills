import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
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
  constructor(profile = "all") {
    this.child = spawn(process.execPath, [SERVER, "--profile", profile], {
      cwd: ROOT,
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

async function withSession(run, profile = "all") {
  const session = new McpSession(profile);
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
      prompts: { listChanged: false }
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
    assert.equal(initialized.protocolVersion, "2025-06-18");
  });
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
        openWorldHint: false
      });
    }
  });
});

test("accepts reserved MCP request metadata without opening arbitrary params", async () => {
  for (const profile of ["creator", "workflow"]) {
    await withSession(async (session) => {
      await session.initialize();

      const withMetadata = await session.request("tools/list", {
        _meta: { progressToken: "codex-startup" }
      });
      assert.deepEqual(withMetadata.result.tools.map((tool) => tool.name), CATALOG.mcp.tools);
    }, profile);
  }

  await withSession(async (session) => {
    await session.initialize();
    const unknown = await session.request("tools/list", {
      _meta: { progressToken: "codex-startup" },
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
    fs.writeFileSync(shellProbe, `TOKEN=${"ghp_" + "a".repeat(24)}\n`);
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
  // Marketing and consumer skills existed in the catalog with no profile that
  // could reach them, so 41 of 71 skills were dead weight behind the MCP.
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
  assert.deepEqual(registered, ["creator", "marketing", "workflow"]);
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
  ["review a pull request diff for security bugs", "suede-code-review"],
  ["write a cold outbound email sequence", "suede-cold-email"],
  ["my app store listing needs better keywords", "suede-aso"],
  ["set up branch protection and required checks", "suede-ci-gate"],
  ["price my subscription tiers", "suede-pricing"],
  ["strip the AI tells out of this blog post", "suede-deslop"],
  ["plan an A/B test on the signup flow", "suede-ab-testing"],
  ["audit my site for search visibility", "suede-seo-audit"],
  ["package a song for sync licensing pitches", "suede-sync-packaging"],
  ["build an iOS app from my website", "site-to-ios-app"],
  ["find the rights gaps before I hand off a release", "suede-rights-audit"],
  ["design evals that catch model regressions", "suede-ai-eval"],
  ["grow my instagram account", "suede-instagram-growth"]
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
      misses.length <= 2,
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
  assert.equal(CATALOG.mcp.tools.length, 9);
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
    // The workflow profile deliberately carries `consumer` too. Those two skills
    // shipped in the catalog and on the site behind no registered server, so no
    // MCP client could reach them; folding them in here beat running a fourth
    // server for two skills.
    assert.ok(
      response.result.structuredContent.skills.every((skill) => ["workflow", "consumer"].includes(skill.area))
    );
    assert.ok(response.result.structuredContent.skills.some((skill) => skill.name === "suede-graph-flo-xr"));
    assert.ok(response.result.structuredContent.skills.some((skill) => skill.name === "amazon-returns-recovery"));

    const ship = await session.request("tools/call", {
      name: "get_suede_skill",
      arguments: { name: "suede-graph-flo-xr" }
    });
    assert.equal(ship.result.structuredContent.found, true);
    assert.match(
      ship.result.structuredContent.skill.useWhen,
      /evidence-gated orchestration contract.*Graph-of-Thoughts workflow/
    );
  }, "workflow");
});

test("Claude and Codex MCP registrations retain both portable profiles", () => {
  const creator = MCP_CONFIG.mcpServers.suede_creator_mcp;
  const workflow = MCP_CONFIG.mcpServers.suede_workflow_mcp;
  assert.ok(creator);
  assert.ok(workflow);
  assert.deepEqual(creator.args.slice(-2), ["--profile", "creator"]);
  assert.deepEqual(workflow.args.slice(-2), ["--profile", "workflow"]);
  assert.equal(creator.command, "node");
  assert.equal(workflow.command, "node");
  assert.equal(creator.cwd, "${CLAUDE_PLUGIN_ROOT}");
  assert.equal(workflow.cwd, "${CLAUDE_PLUGIN_ROOT}");

  const marketing = MCP_CONFIG.mcpServers.suede_marketing_mcp;
  assert.ok(marketing);
  assert.deepEqual(marketing.args.slice(-2), ["--profile", "marketing"]);
  assert.equal(marketing.command, "node");
  assert.equal(marketing.cwd, "${CLAUDE_PLUGIN_ROOT}");

  const codexCreator = CODEX_PLUGIN.mcpServers.suede_creator_mcp;
  const codexWorkflow = CODEX_PLUGIN.mcpServers.suede_workflow_mcp;
  assert.deepEqual(CODEX_PLUGIN.mcpServers.suede_marketing_mcp.args, [
    "./mcp/suede-skills-mcp.mjs",
    "--profile",
    "marketing"
  ]);
  assert.deepEqual(codexCreator.args, [
    "./mcp/suede-skills-mcp.mjs",
    "--profile",
    "creator"
  ]);
  assert.deepEqual(codexWorkflow.args, [
    "./mcp/suede-skills-mcp.mjs",
    "--profile",
    "workflow"
  ]);
  assert.equal(codexCreator.cwd, ".");
  assert.equal(codexWorkflow.cwd, ".");
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
