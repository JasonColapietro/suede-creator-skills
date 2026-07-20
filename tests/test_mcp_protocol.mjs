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

test("catalog, resources, prompts, and profile filters match the live server", async () => {
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
  }, "creator");
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
