import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "..");
const hasSourceCheckout = fs.existsSync(path.join(repoRoot, ".git"));
const shallowProbe = hasSourceCheckout
  ? spawnSync("git", ["-C", repoRoot, "rev-parse", "--is-shallow-repository"], { encoding: "utf8" })
  : null;
const hasCompleteSourceHistory = shallowProbe?.status === 0 && shallowProbe.stdout.trim() === "false";
const codexAvailable = spawnSync("codex", ["--version"], { encoding: "utf8" }).status === 0;
const sourceCheckoutTest = hasSourceCheckout
  ? {}
  : { skip: "requires the source checkout Git history" };
const completeSourceHistoryTest = hasCompleteSourceHistory
  ? {}
  : { skip: "requires a complete source checkout Git history" };

function runValidator(targetRoot, extraEnv = {}) {
  const nodePath = [path.join(repoRoot, "node_modules"), process.env.NODE_PATH]
    .filter(Boolean)
    .join(path.delimiter);
  return spawnSync(
    process.execPath,
    [path.join(targetRoot, "scripts", "validate-skill-pack.mjs"), "--strict"],
    {
      cwd: targetRoot,
      encoding: "utf8",
      env: { ...process.env, NODE_PATH: nodePath, ...extraEnv }
    }
  );
}

function startCodexAppServer(t) {
  // Isolate CODEX_HOME. Codex discovers marketplaces from the cwd *and* from
  // the ones registered in the developer's own config, and when a name appears
  // in both the registered copy wins and the local one is hidden. A maintainer
  // who has installed this pack in their own Codex -- the expected thing to do
  // -- therefore shadows the repo checkout and this test fails on a working
  // tree. The isolated home keeps discovery limited to what the repo ships.
  const codexHome = fs.mkdtempSync(path.join(os.tmpdir(), "suede-codex-home-"));
  t.after(() => fs.rmSync(codexHome, { recursive: true, force: true }));
  const child = spawn("codex", ["app-server", "--stdio"], {
    cwd: repoRoot,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, CODEX_HOME: codexHome }
  });
  const lines = readline.createInterface({ input: child.stdout });
  const pending = new Map();
  let nextId = 1;
  let stderr = "";

  child.stderr.on("data", (chunk) => {
    stderr = `${stderr}${chunk}`.slice(-20000);
  });
  lines.on("line", (line) => {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      return;
    }
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    clearTimeout(entry.timeout);
    if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
    else entry.resolve(message.result);
  });
  child.on("exit", (code, signal) => {
    for (const entry of pending.values()) {
      clearTimeout(entry.timeout);
      entry.reject(
        new Error(
          `codex app-server exited (${code ?? signal ?? "unknown"})\n${stderr}`
        )
      );
    }
    pending.clear();
  });

  t.after(() => {
    lines.close();
    if (child.exitCode === null) child.kill("SIGTERM");
  });

  function request(method, params) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`${method} timed out\n${stderr}`));
      }, 20000);
      pending.set(id, { reject, resolve, timeout });
      child.stdin.write(`${JSON.stringify({ id, method, params })}\n`);
    });
  }

  return { request };
}

function removePathsMissingFromSource(sourceRoot, targetRoot, relative = "") {
  const targetDir = path.join(targetRoot, relative);
  for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const childRelative = path.join(relative, entry.name);
    const sourcePath = path.join(sourceRoot, childRelative);
    const targetPath = path.join(targetRoot, childRelative);
    if (!fs.existsSync(sourcePath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } else if (entry.isDirectory()) {
      removePathsMissingFromSource(sourceRoot, targetRoot, childRelative);
    }
  }
}

function cloneWithCurrentValidator(targetRoot, extraArgs = []) {
  const clone = spawnSync(
    "git",
    ["clone", "--quiet", ...extraArgs, pathToFileURL(repoRoot).href, targetRoot],
    { encoding: "utf8" }
  );
  assert.equal(clone.status, 0, clone.stderr);
  removePathsMissingFromSource(repoRoot, targetRoot);
  fs.cpSync(repoRoot, targetRoot, {
    recursive: true,
    filter(source) {
      const relative = path.relative(repoRoot, source);
      return !relative.split(path.sep).some((part) => part === ".git" || part === "node_modules");
    }
  });
}

function createPackagedFixture(t, prefix) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const parentRepo = path.join(tempRoot, "dotfiles");
  const packagedRoot = path.join(parentRepo, "plugins", "cache", "suede-skills");
  fs.mkdirSync(parentRepo, { recursive: true });
  const init = spawnSync("git", ["init", "--quiet", parentRepo], { encoding: "utf8" });
  assert.equal(init.status, 0, init.stderr);

  fs.cpSync(repoRoot, packagedRoot, {
    recursive: true,
    filter(source) {
      const relative = path.relative(repoRoot, source);
      return !relative.split(path.sep).some((part) => part === ".git" || part === "node_modules");
    }
  });
  return packagedRoot;
}

function digestText(value) {
  return createHash("sha256").update(value).digest("hex");
}

test("validator rejects a reserved semantic sequence before normal validation", (t) => {
  const packagedRoot = createPackagedFixture(t, "suede-validator-reserved-");
  const encodedPath = [115, 117, 101, 100, 101, 45, 112, 117, 98, 108, 105, 99, 45, 99, 108, 97, 105, 109, 45, 99, 104, 101, 99, 107]
    .map((codePoint) => String.fromCodePoint(codePoint))
    .join("");
  const encodedContent = [99, 108, 97, 105, 109, 32, 115, 97, 102, 101, 116, 121]
    .map((codePoint) => String.fromCodePoint(codePoint))
    .join("");
  const encodedFormatContent = [99, 8203, 108, 97, 105, 109, 32, 115, 97, 102, 101, 8203, 116, 121]
    .map((codePoint) => String.fromCodePoint(codePoint))
    .join("");
  fs.writeFileSync(path.join(packagedRoot, `${encodedPath}.md`), "fixture\n");
  fs.writeFileSync(path.join(packagedRoot, "reserved-fixture.txt"), `${encodedContent}\n`);
  fs.writeFileSync(path.join(packagedRoot, "format-fixture.txt"), `${encodedFormatContent}\n`);

  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /Reserved semantic sequence detected/);
  assert.equal((validation.stderr.match(/^- source [0-9a-f]{12}$/gm) || []).length, 3);
  assert.doesNotMatch(validation.stdout, /Validated \d+ skills/);
});

test("validator rejects exact and lightly edited reserved documents", (t) => {
  const packagedRoot = createPackagedFixture(t, "suede-validator-signature-");
  const tokens = Array.from({ length: 24 }, (_, index) => `unit${index}`);
  const body = tokens.join(" ");
  const shingleWindow = 5;
  const shingleDigests = Array.from(
    { length: tokens.length - shingleWindow + 1 },
    (_, index) => digestText(tokens.slice(index, index + shingleWindow).join(" "))
  );
  const signaturePath = path.join(packagedRoot, "scripts", "reserved-signatures.json");
  fs.writeFileSync(signaturePath, `${JSON.stringify({
    body_digests: [digestText(body)],
    shingle_digests: shingleDigests,
    shingle_minimum: 8,
    shingle_window: shingleWindow,
    version: 1
  }, null, 2)}\n`);

  const fixturePath = path.join(packagedRoot, "document-fixture.md");
  fs.writeFileSync(fixturePath, `---\nname: document-fixture\n---\n${body}\n`);
  const exactValidation = runValidator(packagedRoot);
  assert.notEqual(exactValidation.status, 0, `${exactValidation.stdout}\n${exactValidation.stderr}`);
  assert.match(exactValidation.stderr, /Reserved semantic sequence detected/);

  const editedBody = `${body} unit-extra`;
  assert.notEqual(digestText(editedBody), digestText(body));
  fs.writeFileSync(fixturePath, `---\nname: renamed-fixture\n---\n${editedBody}\n`);
  const editedValidation = runValidator(packagedRoot);
  assert.notEqual(editedValidation.status, 0, `${editedValidation.stdout}\n${editedValidation.stderr}`);
  assert.match(editedValidation.stderr, /Reserved semantic sequence detected/);
});

test("validator ignores an unrelated parent Git repository in a packaged plugin cache", (t) => {
  const packagedRoot = createPackagedFixture(t, "suede-validator-runtime-");
  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.equal(validation.status, 0, diagnostics);
  assert.match(validation.stdout, /packaged skill-pack checkout/);
});

test("packaged validation rejects plugin and catalog version drift", (t) => {
  const packagedRoot = createPackagedFixture(t, "suede-validator-version-");
  const pluginPath = path.join(packagedRoot, ".claude-plugin", "plugin.json");
  const plugin = JSON.parse(fs.readFileSync(pluginPath, "utf8"));
  plugin.version = "9.9.9";
  fs.writeFileSync(pluginPath, `${JSON.stringify(plugin, null, 2)}\n`);

  const catalogPath = path.join(packagedRoot, "mcp", "catalog.json");
  const catalogVersion = JSON.parse(fs.readFileSync(catalogPath, "utf8")).version;

  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(
    validation.stderr,
    new RegExp(`plugin\\.json version \\(9\\.9\\.9\\) does not match catalog\\.json version \\(${catalogVersion.replace(/\./g, "\\.")}\\)`)
  );
});

test("packaged validation rejects package-lock version drift", (t) => {
  const packagedRoot = createPackagedFixture(t, "suede-validator-lockfile-");
  const lockPath = path.join(packagedRoot, "package-lock.json");
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  lock.version = "9.9.9";
  lock.packages[""].version = "9.9.9";
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const catalogPath = path.join(packagedRoot, "mcp", "catalog.json");
  const catalogVersion = JSON.parse(fs.readFileSync(catalogPath, "utf8")).version;
  const escaped = catalogVersion.replace(/\./g, "\\.");

  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(
    validation.stderr,
    new RegExp(`package-lock\\.json version \\(9\\.9\\.9\\) does not match catalog\\.json version \\(${escaped}\\)`)
  );
  assert.match(
    validation.stderr,
    new RegExp(`package-lock\\.json packages\\[""\\] version \\(9\\.9\\.9\\) does not match catalog\\.json version \\(${escaped}\\)`)
  );
});

test("packaged validation rejects a package-lock whose two version fields disagree", (t) => {
  // The real 0.11.x drift left one field stale. A fix that touches only the
  // root object still leaves the next npm install rewriting the lockfile, so
  // each field has to fail on its own.
  const packagedRoot = createPackagedFixture(t, "suede-validator-lockfile-partial-");
  const lockPath = path.join(packagedRoot, "package-lock.json");
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  lock.packages[""].version = "9.9.9";
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const catalogPath = path.join(packagedRoot, "mcp", "catalog.json");
  const catalogVersion = JSON.parse(fs.readFileSync(catalogPath, "utf8")).version;
  const escaped = catalogVersion.replace(/\./g, "\\.");

  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(
    validation.stderr,
    new RegExp(`package-lock\\.json packages\\[""\\] version \\(9\\.9\\.9\\) does not match catalog\\.json version \\(${escaped}\\)`)
  );
});

test("packaged validation rejects Codex plugin version and MCP portability drift", (t) => {
  const packagedRoot = createPackagedFixture(t, "suede-validator-codex-version-");
  const pluginPath = path.join(packagedRoot, ".codex-plugin", "plugin.json");
  const plugin = JSON.parse(fs.readFileSync(pluginPath, "utf8"));
  plugin.version = "9.9.9";
  plugin.mcpServers.suede_creator_mcp.cwd = "${CLAUDE_PLUGIN_ROOT}";
  fs.writeFileSync(pluginPath, `${JSON.stringify(plugin, null, 2)}\n`);

  const catalogPath = path.join(packagedRoot, "mcp", "catalog.json");
  const catalogVersion = JSON.parse(fs.readFileSync(catalogPath, "utf8")).version;

  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(
    validation.stderr,
    new RegExp(`Codex plugin version \\(9\\.9\\.9\\) does not match catalog\\.json version \\(${catalogVersion.replace(/\./g, "\\.")}\\)`)
  );
  assert.match(
    validation.stderr,
    /Codex plugin MCP config must not contain Claude-only path variables/
  );
});

test("packaged validation rejects MCP QA and release metadata drift", (t) => {
  const packagedRoot = createPackagedFixture(t, "suede-validator-release-drift-");
  // The readback lives wherever suede-mcp-qa currently keeps it. Pinning this
  // to SKILL.md meant that splitting the skill turned the mutation into a
  // silent no-op and the assertion below started passing vacuously.
  const mcpQaDir = path.join(packagedRoot, "skills", "suede-mcp-qa");
  const mcpQaCandidates = [
    path.join(mcpQaDir, "SKILL.md"),
    ...(fs.existsSync(path.join(mcpQaDir, "references"))
      ? fs
          .readdirSync(path.join(mcpQaDir, "references"))
          .filter((entry) => entry.endsWith(".md"))
          .sort()
          .map((entry) => path.join(mcpQaDir, "references", entry))
      : [])
  ];
  const mcpQaPath = mcpQaCandidates.find((candidate) =>
    /server version\s*\n`[^`]+`/.test(fs.readFileSync(candidate, "utf8"))
  );
  assert.ok(mcpQaPath, "test fixture must contain the suede-mcp-qa version readback");
  const mcpQaOriginal = fs.readFileSync(mcpQaPath, "utf8");
  const mcpQa = mcpQaOriginal.replace(/server version\s*\n`[^`]+`/, "server version\n`9.9.9`");
  assert.notEqual(mcpQa, mcpQaOriginal, "test fixture must rewrite the version readback");
  fs.writeFileSync(mcpQaPath, mcpQa);

  const citationPath = path.join(packagedRoot, "CITATION.cff");
  const citation = fs.readFileSync(citationPath, "utf8").replace(
    /^date-released:\s*\d{4}-\d{2}-\d{2}$/m,
    "date-released: 2099-01-01"
  );
  fs.writeFileSync(citationPath, citation);

  const docsPath = path.join(packagedRoot, "docs", "index.html");
  const docs = fs.readFileSync(docsPath, "utf8");
  const catalog = JSON.parse(
    fs.readFileSync(path.join(packagedRoot, "mcp", "catalog.json"), "utf8")
  );
  const poisonedDocs = docs.replace(
    `<p class="clog-detail">Version ${catalog.version}`,
    `<p class="clog-detail">Release ${catalog.version}`
  );
  assert.notEqual(poisonedDocs, docs, "test fixture must remove the release-version marker");
  fs.writeFileSync(docsPath, poisonedDocs);

  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /suede-mcp-qa manual readback version \(9\.9\.9\)/);
  assert.match(validation.stderr, /CITATION\.cff date-released \(2099-01-01\)/);
  assert.match(validation.stderr, /changelog has no entry for catalog version/);
});

test("packaged validation rejects additional Codex marketplace entries", (t) => {
  const packagedRoot = createPackagedFixture(t, "suede-validator-codex-marketplace-");
  const marketplacePath = path.join(packagedRoot, ".agents", "plugins", "marketplace.json");
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));
  marketplace.plugins.push({
    name: "suede-code",
    source: "./",
    skills: ["./skills/suede-code"]
  });
  fs.writeFileSync(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`);

  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /Codex marketplace must expose exactly one plugin/);
});

test("packaged validation rejects an OpenAI skill default prompt over 1024 characters", (t) => {
  const packagedRoot = createPackagedFixture(t, "suede-validator-default-prompt-");
  const manifestPath = path.join(
    packagedRoot,
    "skills",
    "suede-launch-packaging",
    "agents",
    "openai.yaml"
  );
  const manifest = fs.readFileSync(manifestPath, "utf8");
  const oversizedPrompt = `Use $suede-launch-packaging ${"x".repeat(1024)}`;
  const poisoned = manifest.replace(
    /  default_prompt: \|[\s\S]*?(?=^policy:)/m,
    `  default_prompt: ${JSON.stringify(oversizedPrompt)}\n`
  );
  assert.notEqual(poisoned, manifest, "test fixture must replace the default prompt");
  fs.writeFileSync(manifestPath, poisoned);

  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(
    validation.stderr,
    /interface\.default_prompt is \d+ characters; maximum is 1024/
  );
});

test(
  "Codex discovers only the full public entry and reads its complete runtime inventory",
  { skip: codexAvailable ? false : "codex CLI is unavailable" },
  async (t) => {
    const marketplacePath = path.join(repoRoot, ".agents", "plugins", "marketplace.json");
    const { request } = startCodexAppServer(t);
    await request("initialize", {
      clientInfo: {
        name: "suede-plugin-runtime-test",
        title: "Suede plugin runtime test",
        version: "0.1.0"
      }
    });

    const listed = await request("plugin/list", {
      cwds: [repoRoot],
      marketplaceKinds: ["local"]
    });
    const repoMarketplaces = listed.marketplaces.filter(
      ({ path: discoveredPath }) =>
        discoveredPath && path.resolve(discoveredPath).startsWith(`${repoRoot}${path.sep}`)
    );
    assert.deepEqual(
      repoMarketplaces.map(({ path: discoveredPath }) => path.resolve(discoveredPath)),
      [marketplacePath],
      JSON.stringify(
        listed.marketplaces.map(({ name, path: discoveredPath, plugins }) => ({
          name,
          path: discoveredPath,
          plugins: plugins.map(({ name: pluginName }) => pluginName)
        }))
      )
    );
    assert.deepEqual(
      repoMarketplaces[0].plugins.map(({ name }) => name),
      ["suede-skills"]
    );

    const { plugin } = await request("plugin/read", {
      marketplacePath,
      pluginName: "suede-skills"
    });
    const expectedSkills = fs
      .readdirSync(path.join(repoRoot, "skills"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `suede-skills:${entry.name}`)
      .sort();
    assert.deepEqual(
      plugin.skills.map(({ name }) => name).sort(),
      expectedSkills
    );
    assert.deepEqual(
      [...plugin.mcpServers].sort(),
      ["suede_creator_mcp", "suede_marketing_mcp", "suede_workflow_mcp"]
    );
    const launchPackaging = plugin.skills.find(
      ({ name }) => name === "suede-skills:suede-launch-packaging"
    );
    assert.equal(typeof launchPackaging?.interface?.defaultPrompt, "string");
    assert.ok(launchPackaging.interface.defaultPrompt.length <= 1024);
  }
);

test("validator accepts a prepared changelog anchored to the current merge base", completeSourceHistoryTest, (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "suede-validator-prepared-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const checkoutRoot = path.join(tempRoot, "checkout");
  cloneWithCurrentValidator(checkoutRoot);
  const sourceOriginMain = spawnSync(
    "git",
    ["-C", repoRoot, "rev-parse", "origin/main^{commit}"],
    { encoding: "utf8" }
  );
  assert.equal(sourceOriginMain.status, 0, sourceOriginMain.stderr);
  const alignOriginMain = spawnSync(
    "git",
    ["-C", checkoutRoot, "update-ref", "refs/remotes/origin/main", sourceOriginMain.stdout.trim()],
    { encoding: "utf8" }
  );
  assert.equal(alignOriginMain.status, 0, alignOriginMain.stderr);
  const mergeBase = spawnSync(
    "git",
    ["-C", checkoutRoot, "merge-base", "HEAD", "origin/main"],
    { encoding: "utf8" }
  );
  assert.equal(mergeBase.status, 0, mergeBase.stderr);
  const baseHash = mergeBase.stdout.trim().slice(0, 7);

  const docsPath = path.join(checkoutRoot, "docs", "index.html");
  const docs = fs.readFileSync(docsPath, "utf8");
  let prepared = docs;
  if (!prepared.includes('class="clog-item" data-type="new" data-status="prepared"')) {
    prepared = prepared.replace(
      '<li class="clog-item" data-type="new">',
      '<li class="clog-item" data-type="new" data-status="prepared">'
    );
  }
  if (!/class="[^"]*\bclog-base\b[^"]*"/.test(prepared)) {
    prepared = prepared.replace(
      '<span class="clog-tag">Orchestration</span>',
      `<span class="clog-tag">Orchestration</span>\n            <a class="clog-base" href="https://github.com/JasonColapietro/suede-creator-skills/commit/${baseHash}">base ${baseHash}</a>`
    );
  }
  assert.match(prepared, /data-status="prepared"/);
  assert.match(prepared, new RegExp(`class="[^"]*\\bclog-base\\b[^"]*"[^>]*>base ${baseHash}<`));
  fs.writeFileSync(docsPath, prepared);

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.equal(validation.status, 0, diagnostics);
});

test("validator rejects a prepared changelog anchored before the current merge base", completeSourceHistoryTest, (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "suede-validator-prepared-base-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const checkoutRoot = path.join(tempRoot, "checkout");
  cloneWithCurrentValidator(checkoutRoot);
  const sourceOriginMain = spawnSync(
    "git",
    ["-C", repoRoot, "rev-parse", "origin/main^{commit}"],
    { encoding: "utf8" }
  );
  assert.equal(sourceOriginMain.status, 0, sourceOriginMain.stderr);
  const alignOriginMain = spawnSync(
    "git",
    ["-C", checkoutRoot, "update-ref", "refs/remotes/origin/main", sourceOriginMain.stdout.trim()],
    { encoding: "utf8" }
  );
  assert.equal(alignOriginMain.status, 0, alignOriginMain.stderr);

  const mergeBase = spawnSync(
    "git",
    ["-C", checkoutRoot, "merge-base", "HEAD", "origin/main"],
    { encoding: "utf8" }
  );
  assert.equal(mergeBase.status, 0, mergeBase.stderr);
  const currentBase = mergeBase.stdout.trim().slice(0, 7);
  const priorBase = spawnSync(
    "git",
    ["-C", checkoutRoot, "rev-parse", "origin/main^"],
    { encoding: "utf8" }
  );
  assert.equal(priorBase.status, 0, priorBase.stderr);
  const wrongBase = priorBase.stdout.trim().slice(0, 7);
  assert.notEqual(wrongBase, currentBase);

  for (const relative of ["docs/index.html", "docs/skills/index.html", "docs/guide.html"]) {
    const file = path.join(checkoutRoot, relative);
    const original = fs.readFileSync(file, "utf8");
    const poisoned = original.replaceAll(currentBase, wrongBase);
    assert.notEqual(poisoned, original, `test fixture must replace the prepared base in ${relative}`);
    fs.writeFileSync(file, poisoned);
  }

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /does not match current branch merge-base/);
});

test("validator rejects an unresolvable prepared changelog base", completeSourceHistoryTest, (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "suede-validator-prepared-missing-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const checkoutRoot = path.join(tempRoot, "checkout");
  cloneWithCurrentValidator(checkoutRoot);
  const sourceOriginMain = spawnSync(
    "git",
    ["-C", repoRoot, "rev-parse", "origin/main^{commit}"],
    { encoding: "utf8" }
  );
  assert.equal(sourceOriginMain.status, 0, sourceOriginMain.stderr);
  const alignOriginMain = spawnSync(
    "git",
    ["-C", checkoutRoot, "update-ref", "refs/remotes/origin/main", sourceOriginMain.stdout.trim()],
    { encoding: "utf8" }
  );
  assert.equal(alignOriginMain.status, 0, alignOriginMain.stderr);

  const mergeBase = spawnSync(
    "git",
    ["-C", checkoutRoot, "merge-base", "HEAD", "origin/main"],
    { encoding: "utf8" }
  );
  assert.equal(mergeBase.status, 0, mergeBase.stderr);
  const currentBase = mergeBase.stdout.trim().slice(0, 7);
  const missingBase = "0000001";

  for (const relative of ["docs/index.html", "docs/skills/index.html", "docs/guide.html"]) {
    const file = path.join(checkoutRoot, relative);
    const original = fs.readFileSync(file, "utf8");
    const poisoned = original.replaceAll(currentBase, missingBase);
    assert.notEqual(poisoned, original, `test fixture must replace the prepared base in ${relative}`);
    fs.writeFileSync(file, poisoned);
  }

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /changelog cites commit 0000001 which does not resolve to a commit in this repo/);
});

test("validator rejects an existing released hash unreachable from the default branch", completeSourceHistoryTest, (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "suede-validator-released-unreachable-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const checkoutRoot = path.join(tempRoot, "checkout");
  cloneWithCurrentValidator(checkoutRoot);
  const sourceOriginMain = spawnSync(
    "git",
    ["-C", repoRoot, "rev-parse", "origin/main^{commit}"],
    { encoding: "utf8" }
  );
  assert.equal(sourceOriginMain.status, 0, sourceOriginMain.stderr);
  const alignOriginMain = spawnSync(
    "git",
    ["-C", checkoutRoot, "update-ref", "refs/remotes/origin/main", sourceOriginMain.stdout.trim()],
    { encoding: "utf8" }
  );
  assert.equal(alignOriginMain.status, 0, alignOriginMain.stderr);

  const tree = spawnSync(
    "git",
    ["-C", checkoutRoot, "rev-parse", "HEAD^{tree}"],
    { encoding: "utf8" }
  );
  assert.equal(tree.status, 0, tree.stderr);
  const unreachable = spawnSync(
    "git",
    ["-C", checkoutRoot, "commit-tree", tree.stdout.trim(), "-m", "unreachable release fixture"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_EMAIL: "validator@example.invalid",
        GIT_AUTHOR_NAME: "Validator Fixture",
        GIT_COMMITTER_EMAIL: "validator@example.invalid",
        GIT_COMMITTER_NAME: "Validator Fixture"
      }
    }
  );
  assert.equal(unreachable.status, 0, unreachable.stderr);
  const unreachableHash = unreachable.stdout.trim().slice(0, 7);

  const docsPath = path.join(checkoutRoot, "docs", "index.html");
  const docs = fs.readFileSync(docsPath, "utf8");
  const poisoned = docs.replace(
    /(class="clog-hash"[^>]*>)[0-9a-f]{7,40}(<)/,
    `$1${unreachableHash}$2`
  );
  assert.notEqual(poisoned, docs, "test fixture must replace a released landing hash");
  fs.writeFileSync(docsPath, poisoned);

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(
    validation.stderr,
    new RegExp(`changelog cites commit ${unreachableHash}, which exists but is not reachable from origin/main`)
  );
});

test("validator rejects a prepared changelog item below the newest entry", completeSourceHistoryTest, (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "suede-validator-prepared-order-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const checkoutRoot = path.join(tempRoot, "checkout");
  cloneWithCurrentValidator(checkoutRoot);
  const docsPath = path.join(checkoutRoot, "docs", "index.html");
  const docs = fs.readFileSync(docsPath, "utf8");
  let seen = 0;
  const poisoned = docs.replace(/<li class="clog-item" data-type="new">/g, (match) => {
    seen += 1;
    return seen === 1
      ? '<li class="clog-item" data-type="new" data-status="prepared">'
      : match;
  });
  assert.ok(seen >= 1, "test fixture must contain a released changelog item after the prepared entry");
  fs.writeFileSync(docsPath, poisoned);

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /prepared item must be the newest entry/);
});

test("validator rejects a nonexistent changelog hash in a full-history checkout", completeSourceHistoryTest, (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "suede-validator-full-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const checkoutRoot = path.join(tempRoot, "checkout");
  cloneWithCurrentValidator(checkoutRoot);
  const docsPath = path.join(checkoutRoot, "docs", "index.html");
  const docs = fs.readFileSync(docsPath, "utf8");
  const poisoned = docs.replace(
    /(class="clog-hash"[^>]*>)[0-9a-f]{7,40}(<)/,
    "$10000000000000000000000000000000000000001$2"
  );
  assert.notEqual(poisoned, docs, "test fixture must replace a changelog hash");
  fs.writeFileSync(docsPath, poisoned);

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /does not resolve to a commit in this repo/);
});

test("strict source validation fails when Git history cannot be interrogated", sourceCheckoutTest, (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "suede-validator-git-error-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const checkoutRoot = path.join(tempRoot, "checkout");
  cloneWithCurrentValidator(checkoutRoot);
  const validation = runValidator(checkoutRoot, { PATH: "" });
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /Changelog hash check unavailable/);
});

test("shallow checkouts skip history resolution but retain structural guards", sourceCheckoutTest, (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "suede-validator-shallow-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const checkoutRoot = path.join(tempRoot, "checkout");
  cloneWithCurrentValidator(checkoutRoot, ["--depth", "1"]);
  const initialValidation = runValidator(checkoutRoot);
  const initialDiagnostics = `${initialValidation.stdout}\n${initialValidation.stderr}`;
  assert.equal(initialValidation.status, 0, initialDiagnostics);
  assert.match(initialValidation.stdout, /shallow skill-pack checkout/);

  const docsPath = path.join(checkoutRoot, "docs", "index.html");
  const docs = fs.readFileSync(docsPath, "utf8");
  let seenDates = 0;
  const malformed = docs.replace(/class="clog-date">\d{4}-\d{2}-\d{2}</g, (match) => {
    seenDates += 1;
    return seenDates === 2 ? 'class="clog-date">2099-01-01<' : match;
  });
  assert.ok(seenDates >= 2, "test fixture must contain at least two changelog dates");
  fs.writeFileSync(docsPath, malformed);

  const structuralValidation = runValidator(checkoutRoot);
  const structuralDiagnostics = `${structuralValidation.stdout}\n${structuralValidation.stderr}`;
  assert.notEqual(structuralValidation.status, 0, structuralDiagnostics);
  assert.match(structuralValidation.stderr, /changelog entries out of date order/);
});
