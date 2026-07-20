import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "..");
const hasSourceCheckout = fs.existsSync(path.join(repoRoot, ".git"));
const shallowProbe = hasSourceCheckout
  ? spawnSync("git", ["-C", repoRoot, "rev-parse", "--is-shallow-repository"], { encoding: "utf8" })
  : null;
const hasCompleteSourceHistory = shallowProbe?.status === 0 && shallowProbe.stdout.trim() === "false";
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

  const validation = runValidator(packagedRoot);
  const diagnostics = `${validation.stdout}\n${validation.stderr}`;
  assert.notEqual(validation.status, 0, diagnostics);
  assert.match(validation.stderr, /plugin\.json version \(9\.9\.9\) does not match catalog\.json version \(0\.6\.0\)/);
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
