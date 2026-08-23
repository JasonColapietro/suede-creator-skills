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

test("PDF builder stages output and verifies a stable input snapshot", () => {
  const builder = fs.readFileSync(path.join(repoRoot, "scripts", "build-book-pdf.mjs"), "utf8");
  const before = builder.indexOf("const inputDigestBefore = bookPdfInputDigest(repoRoot)");
  const snapshot = builder.indexOf("const sources = loadSources()")
  const after = builder.indexOf("const inputDigestAfter = bookPdfInputDigest(repoRoot)");
  const rename = builder.indexOf("fs.renameSync(tempPdf, outPdf)");
  assert.ok(before >= 0 && before < snapshot);
  assert.ok(after > snapshot && rename > after);
  assert.match(builder, /--print-to-pdf=\$\{tempPdf\}/);
  assert.match(builder, /inputDigestAfter !== inputDigestBefore/);
  assert.match(builder, /inputSha256: inputDigestBefore/);
});

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

test("packaged validation requires the exact traveling Graph of Thoughts BSD license", (t) => {
  const missingRoot = createPackagedFixture(t, "suede-validator-got-license-missing-");
  const travelingPath = path.join(missingRoot, "skills", "suede-graph-flo-xr", "LICENSE.graph-of-thoughts-BSD.txt");
  fs.rmSync(travelingPath, { force: true });
  const missing = runValidator(missingRoot);
  assert.notEqual(missing.status, 0, `${missing.stdout}\n${missing.stderr}`);
  assert.match(missing.stderr, /traveling Graph of Thoughts BSD license is missing/);

  const driftRoot = createPackagedFixture(t, "suede-validator-got-license-drift-");
  const driftPath = path.join(driftRoot, "skills", "suede-graph-flo-xr", "LICENSE.graph-of-thoughts-BSD.txt");
  fs.mkdirSync(path.dirname(driftPath), { recursive: true });
  fs.writeFileSync(driftPath, "truncated license fixture\n");
  const drift = runValidator(driftRoot);
  assert.notEqual(drift.status, 0, `${drift.stdout}\n${drift.stderr}`);
  assert.match(drift.stderr, /traveling Graph of Thoughts BSD license does not match/);
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
  const citationOriginal = fs.readFileSync(citationPath, "utf8");
  const citation = citationOriginal.replace(
    /^(version:\s*[^\n]+)$/m,
    "$1\ndate-released: 2099-01-01"
  );
  assert.notEqual(citation, citationOriginal, "test fixture must add a false prepared-release date");
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
  assert.match(validation.stderr, /CITATION\.cff must omit date-released while catalog version .* is prepared/);
  assert.match(validation.stderr, /changelog has no entry for catalog version/);
});

test("packaged validation rejects stale or replaced book PDF bytes", (t) => {
  const packagedRoot = createPackagedFixture(t, "suede-validator-book-pdf-");
  fs.appendFileSync(path.join(packagedRoot, "docs", "book", "s-tier.pdf"), "stale-pdf-fixture");
  fs.appendFileSync(path.join(packagedRoot, "scripts", "build-book-pdf.mjs"), "\n// stale-input-fixture\n");
  fs.appendFileSync(path.join(packagedRoot, "skills", "suede-graph-flo-xr", "SKILL.md"), "\nStale corpus fixture.\n");

  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /Book PDF input digest is stale/);
  assert.match(validation.stderr, /Book PDF digest does not match its provenance/);
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

// The prepared base the site currently advertises. Tests poison THIS value
// rather than whatever `merge-base HEAD origin/main` resolves to: the two are
// no longer required to be equal, so deriving the search string from git would
// make these fixtures silently match nothing the first time the site's stamp
// and the merge base diverged.
function preparedBaseIn(checkoutRoot) {
  const docs = fs.readFileSync(path.join(checkoutRoot, "docs", "index.html"), "utf8");
  const base = docs.match(/class="[^"]*\bclog-base\b[^"]*"[^>]*>base ([0-9a-f]{7,40})</)?.[1];
  assert.ok(base, "docs/index.html must advertise a prepared .clog-base commit");
  return base;
}

// Idempotent on purpose: a fixture may ask for the base the pages already
// advertise. The post-condition, not the presence of a diff, is what proves the
// fixture landed.
function restampPreparedBase(checkoutRoot, replacement) {
  const current = preparedBaseIn(checkoutRoot);
  for (const relative of ["docs/index.html", "docs/skills/index.html", "docs/guide.html"]) {
    const file = path.join(checkoutRoot, relative);
    const original = fs.readFileSync(file, "utf8");
    const restamped = current === replacement ? original : original.replaceAll(current, replacement);
    if (current !== replacement) {
      assert.notEqual(restamped, original, `test fixture must replace the prepared base in ${relative}`);
    }
    assert.ok(restamped.includes(replacement), `test fixture must stamp ${replacement} into ${relative}`);
    fs.writeFileSync(file, restamped);
  }
  assert.equal(preparedBaseIn(checkoutRoot), replacement, "test fixture must leave the pages advertising the new base");
}

// Points the fixture's origin/main at its own HEAD, which is the state these
// tests are about: main, just after something merged. Deriving it from the real
// remote instead makes the fixtures depend on a branch other people are pushing
// to — `origin/main~1` stops being an ancestor of the checkout the moment two
// pull requests land while the suite is running, and the test fails for a
// reason that has nothing to do with the validator. That happened.
function checkoutWithOriginMainAtHead(t, prefix) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));

  const checkoutRoot = path.join(tempRoot, "checkout");
  cloneWithCurrentValidator(checkoutRoot);
  const head = spawnSync("git", ["-C", checkoutRoot, "rev-parse", "HEAD^{commit}"], { encoding: "utf8" });
  assert.equal(head.status, 0, head.stderr);
  const alignOriginMain = spawnSync(
    "git",
    ["-C", checkoutRoot, "update-ref", "refs/remotes/origin/main", head.stdout.trim()],
    { encoding: "utf8" }
  );
  assert.equal(alignOriginMain.status, 0, alignOriginMain.stderr);
  return checkoutRoot;
}

function commitsBehindOriginMain(checkoutRoot, revision) {
  const probe = spawnSync(
    "git",
    ["-C", checkoutRoot, "rev-list", "--count", `${revision}..origin/main`],
    { encoding: "utf8" }
  );
  assert.equal(probe.status, 0, probe.stderr);
  return Number.parseInt(probe.stdout.trim(), 10);
}

// `HEAD~N` is N commits behind HEAD only when the history is linear. GitHub
// builds a pull request from a MERGE ref, so in CI HEAD is a merge commit:
// HEAD~1 is main's tip, and reaching HEAD from it costs the merge commit plus
// every commit on the branch. `HEAD~1` measured 2 behind and `HEAD~41` measured
// 42, and both fixtures below failed on every pull request while passing on a
// linear local checkout.
//
// Nor can a fixture demand a literal distance: no ancestor of a merge commit is
// exactly 1 behind it, because dropping either parent still leaves the other
// reachable. So ask for the nearest commit at least this far back, and let the
// test assert against the distance it actually got.
function baseBehindOriginMain(checkoutRoot, minimum) {
  const listing = spawnSync(
    "git",
    ["-C", checkoutRoot, "rev-list", "--topo-order", "origin/main"],
    { encoding: "utf8" }
  );
  assert.equal(listing.status, 0, listing.stderr);
  const commits = listing.stdout.trim().split("\n").filter(Boolean);
  // Topological order lists a commit before every one of its ancestors, and
  // distance to origin/main only grows as you walk back, so the first candidate
  // that clears the minimum is the closest one worth using.
  for (const candidate of commits) {
    const distance = commitsBehindOriginMain(checkoutRoot, candidate);
    if (distance >= minimum) {
      return { rev: shortRev(checkoutRoot, candidate), distance };
    }
  }
  assert.fail(
    `no commit sits at least ${minimum} commits behind origin/main ` +
    `(${commits.length} reachable) — the fixture cannot exercise this distance`
  );
}

function shortRev(checkoutRoot, revision) {
  const probe = spawnSync(
    "git",
    ["-C", checkoutRoot, "rev-parse", "--short=7", revision],
    { encoding: "utf8" }
  );
  assert.equal(probe.status, 0, probe.stderr);
  return probe.stdout.trim();
}

test("validator accepts a prepared changelog anchored to the current merge base", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-validator-prepared-");
  // Exactly what `npm run build:shiplog` writes: the merge base, which in this
  // fixture is HEAD itself. Drift is zero, the strictest case the guard allows.
  restampPreparedBase(checkoutRoot, shortRev(checkoutRoot, "HEAD"));

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.equal(validation.status, 0, diagnostics);
});

// The regression this whole guard was rebuilt around. The check used to demand
// the cited base equal `merge-base HEAD origin/main`, which on main is main's
// own tip — so the first merge after any ship-log refresh turned main red and
// every branch cut from it inherited the failure. A base origin/main has since
// moved past is normal, not a defect, and must pass.
test("validator accepts a prepared changelog base that origin/main has moved past", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-validator-prepared-behind-");
  const overtaken = baseBehindOriginMain(checkoutRoot, 1);
  assert.notEqual(overtaken.rev, shortRev(checkoutRoot, "origin/main"));
  assert.ok(
    overtaken.distance >= 1 && overtaken.distance <= 40,
    `fixture must sit behind origin/main but inside the bound (${overtaken.distance})`
  );
  restampPreparedBase(checkoutRoot, overtaken.rev);

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.equal(validation.status, 0, diagnostics);
});

test("validator rejects a prepared changelog base that has fallen far behind origin/main", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-validator-prepared-stale-");
  const depth = spawnSync(
    "git",
    ["-C", checkoutRoot, "rev-list", "--count", "origin/main"],
    { encoding: "utf8" }
  );
  assert.equal(depth.status, 0, depth.stderr);
  const available = Number.parseInt(depth.stdout.trim(), 10);
  assert.ok(available > 41, `history is too short to exercise the drift bound (${available} commits)`);
  const stale = baseBehindOriginMain(checkoutRoot, 41);
  assert.ok(stale.distance > 40, `fixture must sit past the limit (${stale.distance})`);
  restampPreparedBase(checkoutRoot, stale.rev);

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(
    validation.stderr,
    new RegExp(`is ${stale.distance} commits behind origin/main \\(limit 40\\)`)
  );
});

test("validator rejects a prepared changelog base unreachable from origin/main", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-validator-prepared-unreachable-");
  const tree = spawnSync(
    "git",
    ["-C", checkoutRoot, "rev-parse", "HEAD^{tree}"],
    { encoding: "utf8" }
  );
  assert.equal(tree.status, 0, tree.stderr);
  const unreachable = spawnSync(
    "git",
    ["-C", checkoutRoot, "commit-tree", tree.stdout.trim(), "-m", "unreachable prepared base fixture"],
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
  restampPreparedBase(checkoutRoot, unreachable.stdout.trim().slice(0, 7));

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /prepared changelog base [0-9a-f]{7} is not reachable from origin\/main/);
});

test("validator rejects an unresolvable prepared changelog base", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-validator-prepared-missing-");
  restampPreparedBase(checkoutRoot, "0000001");

  const validation = runValidator(checkoutRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /changelog cites commit 0000001 which does not resolve to a commit in this repo/);
});

// The ship-log generator. These assertions are deliberately markup-level rather
// than a validator round trip: the point is that one hand edit to the newest
// changelog entry propagates to all three cards intact, which is the step that
// used to be four hand edits and drifted.
test("build-shiplog propagates one changelog edit to every ship-log card", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-build-shiplog-");
  const indexPath = path.join(checkoutRoot, "docs", "index.html");

  // A title carrying an internal period, because the card's aria-label reads as
  // a sentence and a naive anchor on the first ". " truncates it there.
  const newTitle = "Ship logs stop chasing main. Again";
  const source = fs.readFileSync(indexPath, "utf8");
  const dated = source.replace(/(<span class="clog-date">)\d{4}-\d{2}-\d{2}(<)/, "$12026-09-04$2");
  assert.notEqual(dated, source, "fixture must restamp the newest entry date");
  const retitled = dated.replace(/(<h3 class="clog-title">)[^<]*(<\/h3>)/, `$1${newTitle}$2`);
  assert.notEqual(retitled, dated, "fixture must retitle the newest entry");
  fs.writeFileSync(indexPath, retitled);

  const build = spawnSync(process.execPath, [path.join(checkoutRoot, "scripts", "build-shiplog.mjs")], {
    cwd: checkoutRoot,
    encoding: "utf8"
  });
  assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);

  const mergeBase = spawnSync(
    "git",
    ["-C", checkoutRoot, "merge-base", "HEAD", "origin/main"],
    { encoding: "utf8" }
  );
  assert.equal(mergeBase.status, 0, mergeBase.stderr);
  const expectedBase = shortRev(checkoutRoot, mergeBase.stdout.trim());

  for (const relative of ["docs/index.html", "docs/skills/index.html", "docs/guide.html"]) {
    const text = fs.readFileSync(path.join(checkoutRoot, relative), "utf8");
    const card = text.match(/id="hero-shiplog"[\s\S]*?<\/a>/)?.[0];
    assert.ok(card, `${relative} must still carry a ship-log card`);
    assert.match(card, new RegExp(`class="hero-shiplog-top">Prepared Sep 4 <b>&middot; base ${expectedBase}</b>`));
    assert.match(card, new RegExp(`class="hero-shiplog-title">${newTitle}<`));
    // The date is the changelog ENTRY date, not the base commit's date.
    assert.match(card, new RegExp(`aria-label="Ship log\\. Prepared entry September 4, 2026: ${newTitle}\\.`));
    // Each page keeps its own closing sentence.
    assert.match(card, /aria-label="[^"]*(Jump to the full changelog\.|Jump to the changelog\.|Read the full changelog on the homepage\.)"/);
    // No doubled terminal punctuation from appending a period to a title.
    assert.doesNotMatch(card, /\.\.\s/, `${relative} aria-label must not double the sentence period`);
  }

  // The homepage entry itself must now advertise the generated base.
  assert.equal(preparedBaseIn(checkoutRoot), expectedBase);

  // Idempotent: a second run changes nothing and --check agrees.
  const before = ["docs/index.html", "docs/skills/index.html", "docs/guide.html"]
    .map((relative) => fs.readFileSync(path.join(checkoutRoot, relative), "utf8"));
  const rerun = spawnSync(process.execPath, [path.join(checkoutRoot, "scripts", "build-shiplog.mjs")], {
    cwd: checkoutRoot,
    encoding: "utf8"
  });
  assert.equal(rerun.status, 0, `${rerun.stdout}\n${rerun.stderr}`);
  const after = ["docs/index.html", "docs/skills/index.html", "docs/guide.html"]
    .map((relative) => fs.readFileSync(path.join(checkoutRoot, relative), "utf8"));
  assert.deepEqual(after, before, "a second build-shiplog run must be a no-op");

  const checked = spawnSync(
    process.execPath,
    [path.join(checkoutRoot, "scripts", "build-shiplog.mjs"), "--check"],
    { cwd: checkoutRoot, encoding: "utf8" }
  );
  assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
});

// Loud failure is the whole safety model: the generator rewrites by anchoring on
// markup, so an anchor that stops matching must abort rather than silently leave
// a page stale.
test("build-shiplog refuses to run when a ship-log card is missing", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-build-shiplog-missing-");
  const guidePath = path.join(checkoutRoot, "docs", "guide.html");
  const guide = fs.readFileSync(guidePath, "utf8");
  const stripped = guide.replace('id="hero-shiplog"', 'id="hero-shiplog-renamed"');
  assert.notEqual(stripped, guide, "fixture must break the guide's card anchor");
  fs.writeFileSync(guidePath, stripped);

  const build = spawnSync(process.execPath, [path.join(checkoutRoot, "scripts", "build-shiplog.mjs")], {
    cwd: checkoutRoot,
    encoding: "utf8"
  });
  assert.notEqual(build.status, 0, `${build.stdout}\n${build.stderr}`);
  assert.match(build.stderr, /docs\/guide\.html: expected exactly one .*found 0 — the markup changed/);
});

function originMainCommitCount(checkoutRoot) {
  const probe = spawnSync("git", ["-C", checkoutRoot, "rev-list", "--count", "origin/main"], { encoding: "utf8" });
  assert.equal(probe.status, 0, probe.stderr);
  return Number.parseInt(probe.stdout.trim(), 10);
}

// Restates the whole advertised claim at `total` while keeping the four
// surfaces agreeing with each other, so that a validator failure can only come
// from the comparison against git and not from one of the internal
// cross-checks. The delta lands on the busiest week because that is the one
// with the headroom to absorb it without going negative.
function restateAdvertisedTotal(checkoutRoot, total) {
  const indexPath = path.join(checkoutRoot, "docs", "index.html");
  let text = fs.readFileSync(indexPath, "utf8");
  const spoken = text.match(/oldest to newest: ([^"]*?) commits\./);
  assert.ok(spoken, "fixture must carry a spoken sparkline series");
  const weekly = spoken[1].split(/,\s*(?:and\s*)?/).map(Number);
  const busiest = weekly.indexOf(Math.max(...weekly));
  weekly[busiest] += total - weekly.reduce((sum, n) => sum + n, 0);
  assert.ok(weekly[busiest] >= 0, `cannot restate the series at ${total} commits`);
  const series = `${weekly.slice(0, -1).join(", ")}, and ${weekly[weekly.length - 1]}`;
  text = text.replace(spoken[0], `oldest to newest: ${series} commits.`);
  fs.writeFileSync(indexPath, text.replace(/>\d+ commits &middot; (\d+) weeks/g, `>${total} commits &middot; $1 weeks`));
  for (const relative of ["docs/skills/index.html", "docs/guide.html"]) {
    const page = path.join(checkoutRoot, relative);
    const card = fs.readFileSync(page, "utf8");
    fs.writeFileSync(page, card.replace(/>\d+ commits &middot; (\d+) weeks/g, `>${total} commits &middot; $1 weeks`));
  }
}

// The count, the week span and the bars were three hand-copied numbers with no
// common source, so they did not merely go stale together -- they disagreed.
// The cards read "282 commits, 10 weeks" against a repo that had shipped 308
// over 14, above ten bars fitted to that caption by dropping three opening
// weeks and folding their commits onto the newest bar. Generating all of it
// from one measurement is the fix; this asserts the surfaces come out agreeing.
test("build-shiplog regenerates the commit-activity series on every ship-log surface", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-shiplog-activity-");
  const indexPath = path.join(checkoutRoot, "docs", "index.html");

  // Stale the fixture the way the real thing was found: a caption describing a
  // repo that no longer exists, over a bar column matching neither.
  const staleChart = fs.readFileSync(indexPath, "utf8").replace(
    /(<div class="clog-spark[^>]*>)[\s\S]*?(\n[ \t]*<\/div>)/,
    '$1\n        <span style="height:40%"></span>\n        <span style="height:100%"></span>$2'
  );
  assert.match(staleChart, /<span style="height:40%"><\/span>/, "fixture must shorten the chart");
  fs.writeFileSync(indexPath, staleChart);
  for (const relative of ["docs/index.html", "docs/skills/index.html", "docs/guide.html"]) {
    const page = path.join(checkoutRoot, relative);
    const before = fs.readFileSync(page, "utf8");
    const after = before.replace(/>\d+ commits &middot; \d+ weeks/g, ">282 commits &middot; 10 weeks");
    assert.notEqual(after, before, `fixture must stale ${relative}`);
    fs.writeFileSync(page, after);
  }

  const build = spawnSync(process.execPath, [path.join(checkoutRoot, "scripts", "build-shiplog.mjs")], {
    cwd: checkoutRoot,
    encoding: "utf8"
  });
  assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);

  const text = fs.readFileSync(indexPath, "utf8");
  const caption = text.match(/class="clog-spark-caption[^"]*">(\d+) commits &middot; (\d+) weeks/);
  assert.ok(caption, "the homepage caption must survive the rewrite");
  const total = Number(caption[1]);
  const weeks = Number(caption[2]);
  assert.equal(total, originMainCommitCount(checkoutRoot), "the caption must advertise what origin/main carries");
  assert.ok(weeks > 10, `the fixture's history should span more than the stale ten weeks (${weeks})`);

  // The chart, the series a screen reader hears, and the caption are one claim.
  const chart = text.match(/<div class="clog-spark[^>]*>[\s\S]*?<\/div>/)[0];
  assert.equal((chart.match(/style="height:\d+%"/g) || []).length, weeks, "one bar per advertised week");
  const spoken = chart.match(/oldest to newest: ([^"]*?) commits\./);
  assert.ok(spoken, "the chart must restate its series for screen readers");
  const weekly = spoken[1].split(/,\s*(?:and\s*)?/).map(Number);
  assert.equal(weekly.length, weeks, "the spoken series must name every week");
  assert.equal(weekly.reduce((sum, n) => sum + n, 0), total, "the spoken series must total the advertised count");
  // Normalized to the busiest week, so exactly one bar reaches full height.
  assert.equal((chart.match(/style="height:100%"/g) || []).length, 1);

  for (const relative of ["docs/index.html", "docs/skills/index.html", "docs/guide.html"]) {
    const card = fs.readFileSync(path.join(checkoutRoot, relative), "utf8").match(/id="hero-shiplog"[\s\S]*?<\/a>/)[0];
    assert.match(card, new RegExp(`class="hero-shiplog-more">${total} commits &middot; ${weeks} weeks`));
    const bars = card.match(/<span class="hero-spark"[\s\S]*?<\/span>\s*<\/span>/)[0];
    assert.equal((bars.match(/style="height:\d+%"/g) || []).length, weeks, `${relative} must draw one bar per week`);
  }

  const validation = runValidator(checkoutRoot);
  assert.equal(validation.status, 0, `${validation.stdout}\n${validation.stderr}`);
});

test("validator rejects a sparkline drawing fewer bars than the weeks it advertises", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-shiplog-bars-");
  const guidePath = path.join(checkoutRoot, "docs", "guide.html");
  const guide = fs.readFileSync(guidePath, "utf8");
  const dropped = guide.replace(/[ \t]*<span style="height:\d+%"><\/span>\n/, "");
  assert.notEqual(dropped, guide, "fixture must drop one bar");
  fs.writeFileSync(guidePath, dropped);

  const validation = runValidator(checkoutRoot);
  assert.notEqual(validation.status, 0, `${validation.stdout}\n${validation.stderr}`);
  assert.match(validation.stderr, /docs\/guide\.html: tiny ship-log sparkline draws \d+ bars but the card advertises \d+ weeks/);
});

test("validator rejects a spoken sparkline series that does not total the advertised count", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-shiplog-spoken-");
  const indexPath = path.join(checkoutRoot, "docs", "index.html");
  const text = fs.readFileSync(indexPath, "utf8");
  // Speak one week louder than it shipped. The bars still match the weeks, so
  // only the total can catch this -- and a screen reader is the one reader who
  // would be told the wrong history.
  const skewed = text.replace(/(oldest to newest: )(\d+)/, (_, lead, first) => `${lead}${Number(first) + 7}`);
  assert.notEqual(skewed, text, "fixture must skew the spoken series");
  fs.writeFileSync(indexPath, skewed);

  const validation = runValidator(checkoutRoot);
  assert.notEqual(validation.status, 0, `${validation.stdout}\n${validation.stderr}`);
  assert.match(validation.stderr, /sparkline aria-label totals \d+ commits but the caption advertises \d+/);
});

// The anti-regression control. The advertised count moves on every merge, so a
// check that failed here would turn main red the next time anything landed --
// which is the exact failure the prepared-base guard was rewritten to remove.
// Sitting the fixture squarely ON the bound is the point: it must pass.
test("validator accepts an advertised commit count the default branch has moved past", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-shiplog-count-lag-");
  const shipped = originMainCommitCount(checkoutRoot);
  assert.ok(shipped > 41, `history is too short to exercise the tolerance (${shipped} commits)`);
  restateAdvertisedTotal(checkoutRoot, shipped - 40);

  const validation = runValidator(checkoutRoot);
  assert.equal(validation.status, 0, `${validation.stdout}\n${validation.stderr}`);
});

test("validator rejects an advertised commit count past the drift tolerance", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-shiplog-count-stale-");
  const shipped = originMainCommitCount(checkoutRoot);
  assert.ok(shipped > 42, `history is too short to exercise the tolerance (${shipped} commits)`);
  restateAdvertisedTotal(checkoutRoot, shipped - 41);

  const validation = runValidator(checkoutRoot);
  assert.notEqual(validation.status, 0, `${validation.stdout}\n${validation.stderr}`);
  assert.match(validation.stderr, /41 behind, past the 40 tolerance/);
});

// The other direction of the same tolerance. A page may lag the branch it
// describes; it may not describe a history that does not exist.
test("validator rejects an advertised commit count far above what has shipped", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-shiplog-count-invented-");
  const shipped = originMainCommitCount(checkoutRoot);
  restateAdvertisedTotal(checkoutRoot, shipped + 41);

  const validation = runValidator(checkoutRoot);
  assert.notEqual(validation.status, 0, `${validation.stdout}\n${validation.stderr}`);
  assert.match(validation.stderr, /41 more than have shipped, past the 40 tolerance/);
});

test("validator rejects an existing released hash unreachable from the default branch", completeSourceHistoryTest, (t) => {
  const checkoutRoot = checkoutWithOriginMainAtHead(t, "suede-validator-released-unreachable-");

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
