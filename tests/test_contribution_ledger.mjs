import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = path.join(ROOT, "skills", "suede-agent-teams", "scripts", "contribution-ledger.mjs");

function workspace(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "suede-contributions-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return { directory, ledger: path.join(directory, "ledger.json") };
}

function cli(args, options = {}) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    input: options.input,
  });
}

function success(args, options) {
  const result = cli(args, options);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function runAsync(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SCRIPT, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

function add(ledger, overrides = {}) {
  const disclosure = overrides.disclosure ?? "not-required";
  return success([
    "add",
    "--ledger", ledger,
    "--repo", overrides.repo ?? "example/project",
    "--ref", overrides.ref ?? "123",
    "--title", overrides.title ?? "Handle empty metadata",
    "--scope", overrides.scope ?? "owned",
    "--disclosure", disclosure,
    "--impact", String(overrides.impact ?? 3),
    "--confidence", String(overrides.confidence ?? 3),
    "--effort", String(overrides.effort ?? 3),
    "--risk", String(overrides.risk ?? 3),
    ...(overrides.scope === "external" ? [] : [
      "--ownership-evidence", overrides.ownershipEvidence ?? "Repository owner supplied the target",
    ]),
    ...(disclosure === "unknown" ? [] : [
      "--disclosure-source", overrides.disclosureSource ?? "Checked repository contribution instructions",
    ]),
    ...(disclosure === "required" ? [
      "--disclosure-statement", overrides.disclosureStatement ?? "Assistance disclosure: tooling was used.",
    ] : []),
  ]).task;
}

function transition(ledger, task, worker, to, options = []) {
  return success([
    "transition",
    "--ledger", ledger,
    "--id", task.id,
    "--worker", worker,
    "--to", to,
    ...options,
  ]).task;
}

function advanceToReviewed(ledger, task, worker = "builder") {
  let current = success(["claim", "--ledger", ledger, "--id", task.id, "--worker", worker]).task;
  for (const status of ["changed_locally", "verified_locally", "reviewed"]) {
    current = transition(ledger, current, worker, status);
  }
  return current;
}

function recordArtifacts(directory, ledger, task, worker = "builder", overrides = {}) {
  const artifacts = {
    branch: overrides.branch ?? "feature/empty-metadata\n",
    commit: overrides.commit ?? "fix(parser): handle empty metadata\n",
    pr: overrides.pr ?? [
      "## Summary", "Handle empty metadata.", "",
      "## Why", "Avoid a parser crash.", "",
      "## Testing", "npm test", "",
      "## Scope", "Parser validation only.", "",
      "## Risks", "Low; malformed input now returns an error.", "",
    ].join("\n"),
  };
  const results = {};
  for (const [kind, text] of Object.entries(artifacts)) {
    const inputPath = path.join(directory, `${kind}.txt`);
    fs.writeFileSync(inputPath, text);
    const result = cli([
      "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", worker,
      "--kind", kind, "--input", inputPath,
    ]);
    assert.ok([0, 3].includes(result.status), result.stderr);
    results[kind] = JSON.parse(result.stdout).artifact;
  }
  return results;
}

test("scores owned work, returns the highest priority task, and rejects duplicates", (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const external = add(ledger, { repo: "other/project", ref: "9", scope: "external" });
  const owned = add(ledger, { ref: "10", scope: "owned" });

  assert.ok(owned.score > external.score);
  assert.equal(success(["next", "--ledger", ledger]).task.id, owned.id);

  const duplicate = cli([
    "add", "--ledger", ledger, "--repo", "https://github.com/example/project.git",
    "--ref", "10", "--title", "Duplicate",
  ]);
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /Duplicate repo\/ref task/);

  const safeDefault = success([
    "add", "--ledger", ledger, "--repo", "another/project",
    "--ref", "11", "--title", "Check safe defaults",
  ]).task;
  assert.equal(safeDefault.scope, "external");
  assert.equal(safeDefault.disclosure, "unknown");

  const zero = cli([
    "add", "--ledger", ledger, "--repo", "another/project",
    "--ref", "#0", "--title", "Invalid issue",
  ]);
  assert.equal(zero.status, 1);
  assert.match(zero.stderr, /positive integers/);
});

test("an atomic lease allows only one worker to claim a task", async (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const task = add(ledger);

  const base = ["claim", "--ledger", ledger, "--id", task.id, "--lease-minutes", "30", "--worker"];
  const results = await Promise.all([
    runAsync([...base, "worker-a"]),
    runAsync([...base, "worker-b"]),
  ]);

  assert.equal(results.filter(({ status }) => status === 0).length, 1);
  assert.equal(results.filter(({ status }) => status !== 0).length, 1);
  const state = success(["list", "--ledger", ledger]);
  assert.equal(state.items[0].status, "claimed");
  assert.ok(["worker-a", "worker-b"].includes(state.items[0].lease.worker));
});

test("symlink aliases share one canonical ledger lock", async (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const task = add(ledger);
  const alias = path.join(directory, "ledger-alias.json");
  fs.symlinkSync(ledger, alias);
  const results = await Promise.all([
    runAsync(["claim", "--ledger", ledger, "--id", task.id, "--worker", "worker-a"]),
    runAsync(["claim", "--ledger", alias, "--id", task.id, "--worker", "worker-b"]),
  ]);
  assert.equal(results.filter(({ status }) => status === 0).length, 1);
  assert.equal(fs.lstatSync(alias).isSymbolicLink(), true);
  assert.equal(success(["list", "--ledger", ledger]).items[0].status, "claimed");
});

test("hard-linked ledger aliases fail closed before claims", async (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const task = add(ledger);
  const alias = path.join(directory, "ledger-hardlink.json");
  fs.linkSync(ledger, alias);
  const results = await Promise.all([
    runAsync(["claim", "--ledger", ledger, "--id", task.id, "--worker", "worker-a"]),
    runAsync(["claim", "--ledger", alias, "--id", task.id, "--worker", "worker-b"]),
  ]);
  assert.equal(results.filter(({ status }) => status === 0).length, 0);
  assert.ok(results.every(({ stderr }) => /Hard-linked ledgers are unsupported/.test(stderr)));
  fs.unlinkSync(alias);
  assert.equal(success(["list", "--ledger", ledger]).items[0].status, "queued");
});

test("concurrent equivalent issue references create only one task", async (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const base = ["add", "--ledger", ledger, "--repo", "example/project", "--title", "Same issue"];
  const results = await Promise.all([
    runAsync([...base, "--ref", "123"]),
    runAsync([...base, "--ref", "#123"]),
  ]);
  assert.equal(results.filter(({ status }) => status === 0).length, 1);

  const retry = cli([...base, "--ref", "Issue #123"]);
  assert.equal(retry.status, 1);
  assert.match(retry.stderr, /Duplicate repo\/ref task/);
  const urlRetry = cli([...base, "--ref", "https://github.com/example/project/issues/123"]);
  assert.equal(urlRetry.status, 1);
  assert.match(urlRetry.stderr, /Duplicate repo\/ref task/);
  const state = success(["list", "--ledger", ledger]);
  assert.equal(state.count, 1);
  assert.equal(state.items[0].ref, "issue:123");
});

test("expired leases requeue cleanly and can be reclaimed", (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const task = add(ledger);
  success(["claim", "--ledger", ledger, "--id", task.id, "--worker", "worker-a"]);

  const state = JSON.parse(fs.readFileSync(ledger, "utf8"));
  state.items[0].lease.expiresAt = "2000-01-01T00:00:00.000Z";
  fs.writeFileSync(ledger, `${JSON.stringify(state, null, 2)}\n`);

  const next = success(["next", "--ledger", ledger]);
  assert.equal(next.task.id, task.id);
  assert.equal(next.task.status, "queued");
  const reclaimed = success(["claim", "--ledger", ledger, "--id", task.id, "--worker", "worker-b"]);
  assert.equal(reclaimed.task.lease.worker, "worker-b");
});

test("publication requires task-specific one-shot grants for every remote action", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  let task = add(ledger, { scope: "owned" });
  const worker = "builder";
  task = advanceToReviewed(ledger, task, worker);
  recordArtifacts(directory, ledger, task, worker);
  task = transition(ledger, task, worker, "packet_ready");

  const publicationArgs = [
    "--action", "push",
    "--authority-target", "refs/heads/feature/empty-metadata",
    "--remote-url", "https://github.com/example/project/tree/feature/empty-metadata",
    "--performed-by", "publisher",
  ];
  const disabled = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published", ...publicationArgs,
  ]);
  assert.equal(disabled.status, 1);
  assert.match(disabled.stderr, /Publishing is disabled/);

  const noAuthority = cli(["configure", "--ledger", ledger, "--publish-mode", "owned"]);
  assert.equal(noAuthority.status, 1);
  assert.match(noAuthority.stderr, /Missing --authority-note|Missing --actor/);

  success([
    "configure", "--ledger", ledger, "--publish-mode", "owned",
    "--actor", "owner",
    "--authority-note", "Owner approved this branch for the current run",
  ]);
  const noTaskGrant = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published", ...publicationArgs,
  ]);
  assert.equal(noTaskGrant.status, 1);
  assert.match(noTaskGrant.stderr, /unused push grant/);

  const pushGrant = success([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "push",
    "--actor", "owner", "--authority-note", "Push this named branch only",
    "--target", "refs/heads/feature/empty-metadata",
  ]).grant;
  assert.equal(pushGrant.packetSha256, task.packet.sha256);
  const alteredState = JSON.parse(fs.readFileSync(ledger, "utf8"));
  alteredState.items.find(({ id }) => id === task.id).packet.sha256 = "f".repeat(64);
  fs.writeFileSync(ledger, `${JSON.stringify(alteredState, null, 2)}\n`);
  const staleGrant = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published", ...publicationArgs,
  ]);
  assert.equal(staleGrant.status, 1);
  assert.match(staleGrant.stderr, /does not match the current reviewed packet/);
  alteredState.items.find(({ id }) => id === task.id).packet.sha256 = task.packet.sha256;
  fs.writeFileSync(ledger, `${JSON.stringify(alteredState, null, 2)}\n`);

  const wrongRepo = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published",
    "--action", "push", "--authority-target", "refs/heads/feature/empty-metadata",
    "--remote-url", "https://github.com/another/project/tree/feature/empty-metadata",
    "--performed-by", "publisher",
  ]);
  assert.equal(wrongRepo.status, 1);
  assert.match(wrongRepo.stderr, /authorized repository and branch target/);

  const wrongBranch = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published",
    "--action", "push", "--authority-target", "refs/heads/feature/empty-metadata",
    "--remote-url", "https://github.com/example/project/tree/feature/different-branch",
    "--performed-by", "publisher",
  ]);
  assert.equal(wrongBranch.status, 1);
  assert.match(wrongBranch.stderr, /authorized repository and branch target/);

  task = transition(ledger, task, worker, "published", publicationArgs);
  assert.equal(task.publications[0].action, "push");
  assert.ok(task.grants.push.usedAt);

  const directReady = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published",
    "--action", "ready_pr",
    "--authority-target", "https://github.com/example/project/pull/50",
    "--remote-url", "https://github.com/example/project/pull/50",
    "--performed-by", "publisher",
  ]);
  assert.equal(directReady.status, 1);
  assert.match(directReady.stderr, /requires a separately authorized draft_pr action/);

  for (const [capability, target, remoteUrl] of [
    ["draft_pr", "pull request for feature/empty-metadata", "https://github.com/example/project/pull/50"],
    ["ready_pr", "https://github.com/example/project/pull/50", "https://github.com/example/project/pull/50"],
    ["merge", "https://github.com/example/project/pull/50", "https://github.com/example/project/pull/50"],
  ]) {
    success([
      "grant", "--ledger", ledger, "--id", task.id, "--capability", capability,
      "--actor", "owner", "--authority-note", `Approve ${capability}`,
      "--target", target,
    ]);
    task = transition(ledger, task, worker, capability === "merge" ? "merged" : "published", [
      "--action", capability,
      "--authority-target", target,
      "--remote-url", remoteUrl,
      "--performed-by", "publisher",
    ]);
  }
  assert.equal(task.status, "merged");
  assert.deepEqual(task.publications.map(({ action }) => action), ["push", "draft_pr", "ready_pr", "merge"]);
});

test("a grant for one owned task cannot authorize another task", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  success([
    "configure", "--ledger", ledger, "--publish-mode", "owned",
    "--actor", "owner", "--authority-note", "Enable the owned-repository kill switch",
  ]);
  let first = add(ledger, { ref: "201" });
  let second = add(ledger, { ref: "202" });
  first = advanceToReviewed(ledger, first, "first-builder");
  recordArtifacts(directory, ledger, first, "first-builder");
  first = transition(ledger, first, "first-builder", "packet_ready");
  second = advanceToReviewed(ledger, second, "second-builder");
  recordArtifacts(directory, ledger, second, "second-builder");
  second = transition(ledger, second, "second-builder", "packet_ready");

  const target = "refs/heads/fix/first-task";
  success([
    "grant", "--ledger", ledger, "--id", first.id, "--capability", "push",
    "--actor", "owner", "--authority-note", "Approve only the first task", "--target", target,
  ]);
  const result = cli([
    "transition", "--ledger", ledger, "--id", second.id, "--to", "published",
    "--action", "push", "--authority-target", target,
    "--remote-url", "https://github.com/example/project/tree/fix/first-task",
    "--performed-by", "publisher",
  ]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /requires an unused push grant/);
});

test("disabling the publication kill switch revokes unused grants from the prior run", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  success([
    "configure", "--ledger", ledger, "--publish-mode", "owned",
    "--actor", "owner-a", "--authority-note", "First publication run",
  ]);
  let task = add(ledger, { ref: "301" });
  task = advanceToReviewed(ledger, task);
  recordArtifacts(directory, ledger, task);
  task = transition(ledger, task, "builder", "packet_ready");
  const target = "refs/heads/fix/run-boundary";
  success([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "push",
    "--actor", "owner-a", "--authority-note", "First-run approval", "--target", target,
  ]);

  success(["configure", "--ledger", ledger, "--publish-mode", "disabled"]);
  const disabledState = success(["list", "--ledger", ledger]).items[0];
  assert.equal(disabledState.grants.push, undefined);
  success([
    "configure", "--ledger", ledger, "--publish-mode", "owned",
    "--actor", "owner-b", "--authority-note", "Second publication run",
  ]);
  const stale = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published",
    "--action", "push", "--authority-target", target,
    "--remote-url", "https://github.com/example/project/tree/fix/run-boundary",
    "--performed-by", "publisher",
  ]);
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /requires an unused push grant/);
});

test("state transitions cannot bypass a claim lease", (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const task = add(ledger);

  const bypass = cli([
    "transition", "--ledger", ledger, "--id", task.id,
    "--worker", "worker-a", "--to", "claimed",
  ]);
  assert.equal(bypass.status, 1);
  assert.match(bypass.stderr, /Invalid transition/);
});

test("packet_ready is blocked until all task-bound artifact dispositions exist", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  let task = add(ledger);
  task = advanceToReviewed(ledger, task);

  const missing = cli([
    "transition", "--ledger", ledger, "--id", task.id,
    "--worker", "builder", "--to", "packet_ready",
  ]);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /branch, commit, pr/);

  const checks = recordArtifacts(directory, ledger, task);
  task = transition(ledger, task, "builder", "packet_ready");
  assert.equal(task.packet.disposition, "ready");
  assert.equal(task.packet.artifacts.commit.sha256, checks.commit.sha256);
});

test("owned scoring requires explicit ownership evidence", (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const result = cli([
    "add", "--ledger", ledger, "--repo", "example/project", "--ref", "owned-without-evidence",
    "--title", "Unsafe ownership assumption", "--scope", "owned",
  ]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /require --ownership-evidence/);
});

test("initialization cannot enable publication without a recorded actor", (t) => {
  const { ledger } = workspace(t);
  const result = cli(["init", "--ledger", ledger, "--publish-mode", "owned"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must be one of: disabled/);
  assert.equal(fs.existsSync(ledger), false);
});

test("owned-only publication mode cannot grant external work", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  success([
    "configure", "--ledger", ledger, "--publish-mode", "owned",
    "--actor", "owner",
    "--authority-note", "Owner approved owned targets for this run",
  ]);
  let task = add(ledger, { scope: "external" });
  const worker = "builder";
  task = advanceToReviewed(ledger, task, worker);
  recordArtifacts(directory, ledger, task, worker);
  task = transition(ledger, task, worker, "packet_ready");

  const result = cli([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "push",
    "--actor", "owner", "--authority-note", "Approve this external branch",
    "--target", "refs/heads/feature/contribution-workflow",
  ]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /reviewed publication mode/);
});

test("reviewed publication mode lets granted external work reach ready review but never merge", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  success([
    "configure", "--ledger", ledger, "--publish-mode", "reviewed",
    "--actor", "owner",
    "--authority-note", "Approve separately granted external publication through ready review",
  ]);
  let task = add(ledger, { scope: "external" });
  const worker = "builder";
  task = advanceToReviewed(ledger, task, worker);
  recordArtifacts(directory, ledger, task, worker);
  task = transition(ledger, task, worker, "packet_ready");

  const branch = "publisher/project@refs/heads/fix/empty-metadata";
  success([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "push",
    "--actor", "owner", "--authority-note", "Push this reviewed branch", "--target", branch,
  ]);
  task = transition(ledger, task, worker, "published", [
    "--action", "push", "--authority-target", branch,
    "--remote-url", "https://github.com/publisher/project/tree/fix/empty-metadata",
    "--performed-by", "publisher",
  ]);

  const prUrl = "https://github.com/example/project/pull/50";
  const draftTarget = "pull request for fix/empty-metadata";
  success([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "draft_pr",
    "--actor", "owner", "--authority-note", "Open this reviewed draft", "--target", draftTarget,
  ]);
  task = transition(ledger, task, worker, "published", [
    "--action", "draft_pr", "--authority-target", draftTarget,
    "--remote-url", prUrl, "--performed-by", "publisher",
  ]);
  success([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "ready_pr",
    "--actor", "owner", "--authority-note", "Move this reviewed PR to ready", "--target", prUrl,
  ]);
  task = transition(ledger, task, worker, "published", [
    "--action", "ready_pr", "--authority-target", prUrl,
    "--remote-url", prUrl, "--performed-by", "publisher",
  ]);

  assert.deepEqual(task.publications.map(({ action }) => action), ["push", "draft_pr", "ready_pr"]);
  const mergeGrant = cli([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "merge",
    "--actor", "owner", "--authority-note", "Attempt external merge", "--target", prUrl,
  ]);
  assert.equal(mergeGrant.status, 1);
  assert.match(mergeGrant.stderr, /External tasks cannot receive merge grants/);
});

test("task-bound artifact checks accept conventional copy and flag tool-origin markers", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  let task = add(ledger);
  task = advanceToReviewed(ledger, task);
  const cleanPath = path.join(directory, "clean.txt");
  const markedPath = path.join(directory, "marked.txt");
  const branchPath = path.join(directory, "branch.txt");
  fs.writeFileSync(cleanPath, [
    "fix(parser): handle empty metadata", "", "Testing: npm test", "",
    "Co-authored-by: Gail Example <gail@example.com>",
    "Co-authored-by: Devin Smith <devin@example.com>",
    "Co-authored-by: Claude Martin <claude@example.com>",
    "Co-authored-by: Ai Tanaka <ai@example.com>", "",
  ].join("\n"));
  fs.writeFileSync(markedPath, "Generated by Codex\n\nCo-authored-by: Cursor <bot@example.com>\n");
  fs.writeFileSync(branchPath, "codex/parser-empty-metadata\n");

  const clean = success([
    "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", "builder",
    "--kind", "commit", "--input", cleanPath,
  ]);
  assert.equal(clean.ok, true);
  assert.match(clean.artifact.sha256, /^[a-f0-9]{64}$/);

  const marked = cli([
    "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", "builder",
    "--kind", "pr", "--input", markedPath,
  ]);
  assert.equal(marked.status, 4);
  assert.match(marked.stderr, /generated-by-footer/);
  assert.match(marked.stderr, /coauthor-tool-trailer/);

  const branch = cli([
    "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", "builder",
    "--kind", "branch", "--input", branchPath,
  ]);
  assert.equal(branch.status, 4);
  assert.match(branch.stderr, /automation-branch-prefix/);

  fs.writeFileSync(branchPath, "feature/valid\nsecond-line\n");
  const invalidBranch = cli([
    "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", "builder",
    "--kind", "branch", "--input", branchPath,
  ]);
  assert.equal(invalidBranch.status, 4);
  assert.match(invalidBranch.stderr, /invalid-branch-ref/);

  fs.writeFileSync(cleanPath, "x\n");
  const invalidCommit = cli([
    "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", "builder",
    "--kind", "commit", "--input", cleanPath,
  ]);
  assert.equal(invalidCommit.status, 4);
  assert.match(invalidCommit.stderr, /invalid-conventional-commit-subject/);

  const validPr = [
    "## Summary", "Handle empty metadata.", "",
    "## Why", "Avoid a parser crash.", "",
    "## Testing", "npm test", "",
    "## Scope", "Parser validation only.", "",
    "## Risks", "Low risk.", "",
  ].join("\n");
  for (const footer of [
    "Built with Cursor",
    "Assisted by Aider",
    "AI-assisted contribution",
    "Implemented using Claude",
  ]) {
    fs.writeFileSync(markedPath, `${validPr}${footer}\n`);
    const footerResult = cli([
      "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", "builder",
      "--kind", "pr", "--input", markedPath,
    ]);
    assert.equal(footerResult.status, 4);
    assert.match(footerResult.stderr, /tool-origin-footer/);
  }

  fs.writeFileSync(cleanPath, `${validPr}Built with Jason Colapietro.\nThe cursor pagination feature was implemented using offset tokens.\nAI-assisted composition is a product setting.\nImages generated by OpenAI now preserve metadata.\nThe Codex agent integration now retries timeouts.\n`);
  const humanAndProductCopy = success([
    "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", "builder",
    "--kind", "pr", "--input", cleanPath,
  ]);
  assert.equal(humanAndProductCopy.artifact.outcome, "pass");

  const unknownTask = add(ledger, { ref: "unknown", disclosure: "unknown" });
  advanceToReviewed(ledger, unknownTask, "unknown-worker");
  const unknown = cli([
    "artifact-check", "--ledger", ledger, "--id", unknownTask.id, "--worker", "unknown-worker",
    "--kind", "commit", "--input", cleanPath,
  ]);
  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /inspect upstream instructions/);
});

test("required disclosure is preserved exactly and returns owner review disposition", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const statement = "Generated with AI assistance as required by this repository.";
  let task = add(ledger, {
    ref: "required-disclosure",
    disclosure: "required",
    disclosureStatement: statement,
  });
  task = advanceToReviewed(ledger, task);
  const missingPath = path.join(directory, "missing.txt");
  const requiredPath = path.join(directory, "required.txt");
  fs.writeFileSync(missingPath, "Summary without the required statement.\n");
  const requiredPr = [
    "## Summary", "Preserve the required disclosure.", "",
    "## Why", "Follow repository policy.", "",
    "## Testing", "npm test", "",
    "## Scope", "PR copy only.", "",
    "## Risks", "Owner review is required.", "",
    statement, "",
  ].join("\n");
  fs.writeFileSync(requiredPath, requiredPr);

  const missing = cli([
    "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", "builder",
    "--kind", "pr", "--input", missingPath,
  ]);
  assert.equal(missing.status, 3);
  assert.match(missing.stderr, /exact required disclosure statement/);

  fs.writeFileSync(missingPath, `${statement}\n${statement}\n`);
  const duplicated = cli([
    "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", "builder",
    "--kind", "pr", "--input", missingPath,
  ]);
  assert.equal(duplicated.status, 3);
  assert.match(duplicated.stderr, /exact required disclosure statement once/);

  const preservedResult = cli([
    "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", "builder",
    "--kind", "pr", "--input", requiredPath,
  ]);
  assert.equal(preservedResult.status, 3);
  const preserved = JSON.parse(preservedResult.stdout);
  assert.equal(preserved.ok, false);
  assert.equal(preserved.artifact.outcome, "owner_review_required");

  const checks = recordArtifacts(directory, ledger, task, "builder", {
    pr: requiredPr,
  });
  const beforeReview = cli([
    "transition", "--ledger", ledger, "--id", task.id,
    "--worker", "builder", "--to", "packet_ready",
  ]);
  assert.equal(beforeReview.status, 1);
  assert.match(beforeReview.stderr, /unresolved artifact checks: pr/);

  const wrongHash = cli([
    "review-artifact", "--ledger", ledger, "--id", task.id, "--kind", "pr",
    "--sha256", "0".repeat(64), "--decision", "approve", "--actor", "owner",
    "--review-note", "Reviewed the required statement",
  ]);
  assert.equal(wrongHash.status, 1);
  assert.match(wrongHash.stderr, /does not match the current artifact/);

  success([
    "review-artifact", "--ledger", ledger, "--id", task.id, "--kind", "pr",
    "--sha256", checks.pr.sha256, "--decision", "approve", "--actor", "owner",
    "--review-note", "Required disclosure is present exactly once",
  ]);
  task = transition(ledger, task, "builder", "packet_ready");
  assert.equal(task.packet.disposition, "owner_review_approved");
});

test("writes refuse an oversized ledger without replacing the readable file", (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const state = JSON.parse(fs.readFileSync(ledger, "utf8"));
  state.padding = Array(800_000).fill(0);
  const original = JSON.stringify(state);
  assert.ok(Buffer.byteLength(original) < 5_000_000);
  fs.writeFileSync(ledger, original);

  const result = cli(["configure", "--ledger", ledger, "--lease-minutes", "46"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing to write ledger larger than 5000000 bytes/);
  assert.equal(fs.readFileSync(ledger, "utf8"), original);
  assert.equal(success(["list", "--ledger", ledger]).count, 0);
});

test("task history is capped while preserving a trimmed-event count", (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const task = add(ledger);
  success(["claim", "--ledger", ledger, "--id", task.id, "--worker", "builder"]);
  const state = JSON.parse(fs.readFileSync(ledger, "utf8"));
  state.items[0].history = Array.from({ length: 100 }, (_, index) => ({
    at: "2026-08-01T00:00:00.000Z",
    type: `test_${index}`,
  }));
  fs.writeFileSync(ledger, `${JSON.stringify(state, null, 2)}\n`);

  const heartbeat = success([
    "heartbeat", "--ledger", ledger, "--id", task.id, "--worker", "builder",
  ]).task;
  assert.equal(heartbeat.history.length, 100);
  assert.equal(heartbeat.historyTrimmedCount, 1);
  assert.equal(heartbeat.history.at(-1).type, "heartbeat");
});

test("explicit lock recovery removes only a verifiably stale local process lock", (t) => {
  const { ledger } = workspace(t);
  const lockPath = `${ledger}.lock`;
  const processStartedAt = spawnSync("ps", ["-p", String(process.pid), "-o", "lstart="], {
    encoding: "utf8",
  }).stdout.trim();
  fs.writeFileSync(lockPath, `${JSON.stringify({
    pid: process.pid,
    host: os.hostname(),
    token: "live-token",
    processStartedAt,
    createdAt: "2001-01-01T00:00:00.000Z",
  })}\n`);

  const wrongToken = cli([
    "recover-lock", "--ledger", ledger, "--expected-token", "wrong-token",
  ]);
  assert.equal(wrongToken.status, 1);
  assert.match(wrongToken.stderr, /does not match --expected-token/);
  assert.equal(fs.existsSync(lockPath), true);

  const live = cli(["recover-lock", "--ledger", ledger, "--expected-token", "live-token"]);
  assert.equal(live.status, 1);
  assert.match(live.stderr, /still running/);
  assert.equal(fs.existsSync(lockPath), true);

  fs.writeFileSync(lockPath, `${JSON.stringify({
    pid: 999_999_999,
    host: os.hostname(),
    token: "stale-token",
    processStartedAt: "Mon Jan  1 00:00:00 2001",
    createdAt: "2001-01-01T00:00:00.000Z",
  })}\n`);
  const recovered = success([
    "recover-lock", "--ledger", ledger, "--expected-token", "stale-token",
  ]);
  assert.equal(recovered.recovered, true);
  assert.equal(fs.existsSync(lockPath), false);
});

// The guards below were all deletable with the suite still green (mutation
// testing, 2026-08-05). Each test targets one of them directly.

test("a spent publication grant cannot be replayed or re-issued", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  let task = add(ledger, { scope: "owned" });
  const worker = "builder";
  task = advanceToReviewed(ledger, task, worker);
  recordArtifacts(directory, ledger, task, worker);
  task = transition(ledger, task, worker, "packet_ready");
  success([
    "configure", "--ledger", ledger, "--publish-mode", "owned",
    "--actor", "owner", "--authority-note", "Owner approved this run",
  ]);
  const target = "refs/heads/feature/empty-metadata";
  const publicationArgs = [
    "--action", "push",
    "--authority-target", target,
    "--remote-url", "https://github.com/example/project/tree/feature/empty-metadata",
    "--performed-by", "publisher",
  ];
  success([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "push",
    "--actor", "owner", "--authority-note", "Push this named branch only",
    "--target", target,
  ]);
  success(["transition", "--ledger", ledger, "--id", task.id, "--to", "published", ...publicationArgs]);

  // Replaying the spent grant must fail rather than record a second push.
  const replay = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published", ...publicationArgs,
  ]);
  assert.equal(replay.status, 1);
  assert.match(replay.stderr, /Push was already recorded/);

  // A fresh push grant must not be obtainable once the task has published.
  const regrant = cli([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "push",
    "--actor", "owner", "--authority-note", "Try again", "--target", target,
  ]);
  assert.equal(regrant.status, 1);
  assert.match(regrant.stderr, /can only be recorded while task is packet_ready/);

  const state = JSON.parse(fs.readFileSync(ledger, "utf8"));
  const stored = state.items.find(({ id }) => id === task.id);
  assert.equal(stored.publications.filter((entry) => entry.action === "push").length, 1);
  assert.ok(stored.grants.push.usedAt);
});

test("a publication grant is bound to its exact authority target", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  let task = add(ledger, { scope: "owned" });
  const worker = "builder";
  task = advanceToReviewed(ledger, task, worker);
  recordArtifacts(directory, ledger, task, worker);
  task = transition(ledger, task, worker, "packet_ready");
  success([
    "configure", "--ledger", ledger, "--publish-mode", "owned",
    "--actor", "owner", "--authority-note", "Owner approved this run",
  ]);
  success([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "push",
    "--actor", "owner", "--authority-note", "Push this named branch only",
    "--target", "refs/heads/feature/empty-metadata",
  ]);

  const wrongTarget = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published",
    "--action", "push",
    "--authority-target", "refs/heads/feature/something-else",
    "--remote-url", "https://github.com/example/project/tree/feature/something-else",
    "--performed-by", "publisher",
  ]);
  assert.equal(wrongTarget.status, 1);
  assert.match(wrongTarget.stderr, /--authority-target does not match the recorded push grant/);

  // Evidence must also match the granted branch, not merely be well-formed.
  const wrongEvidence = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published",
    "--action", "push",
    "--authority-target", "refs/heads/feature/empty-metadata",
    "--remote-url", "https://github.com/example/project/tree/feature/something-else",
    "--performed-by", "publisher",
  ]);
  assert.equal(wrongEvidence.status, 1);
  assert.match(wrongEvidence.stderr, /Push evidence does not match the authorized repository and branch target/);
});

test("a lease can only be operated by the worker holding it", (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const task = add(ledger, { scope: "owned" });
  success(["claim", "--ledger", ledger, "--id", task.id, "--worker", "holder"]);

  for (const args of [
    ["heartbeat", "--ledger", ledger, "--id", task.id, "--worker", "intruder"],
    ["release", "--ledger", ledger, "--id", task.id, "--worker", "intruder"],
    ["transition", "--ledger", ledger, "--id", task.id, "--worker", "intruder", "--to", "changed_locally"],
  ]) {
    const result = cli(args);
    assert.equal(result.status, 1, `${args[0]} should reject a non-owner`);
    assert.match(result.stderr, /is leased to holder/);
  }

  // The rightful holder is unaffected.
  success(["heartbeat", "--ledger", ledger, "--id", task.id, "--worker", "holder"]);
});

test("an owner rejection blocks the packet and cannot be overwritten by an approval", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const statement = "Generated with AI assistance as required by this repository.";
  let task = add(ledger, {
    ref: "reject-is-durable",
    disclosure: "required",
    disclosureStatement: statement,
  });
  const worker = "builder";
  task = advanceToReviewed(ledger, task, worker);
  // Record the branch and commit artifacts so packet_ready is gated on the
  // rejected pr artifact alone, not on missing checks.
  for (const [kind, text] of [
    ["branch", "feature/empty-metadata\n"],
    ["commit", "fix(parser): handle empty metadata\n"],
  ]) {
    const inputPath = path.join(directory, `${kind}.txt`);
    fs.writeFileSync(inputPath, text);
    const recorded = cli([
      "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", worker,
      "--kind", kind, "--input", inputPath,
    ]);
    assert.ok([0, 3].includes(recorded.status), recorded.stderr);
  }
  const prPath = path.join(directory, "pr.txt");
  fs.writeFileSync(prPath, [
    "## Summary", "Preserve the required disclosure.", "",
    "## Why", "Follow repository policy.", "",
    "## Testing", "npm test", "",
    "## Scope", "PR copy only.", "",
    "## Risks", "Owner review is required.", "",
    statement, "",
  ].join("\n"));
  const checked = cli([
    "artifact-check", "--ledger", ledger, "--id", task.id, "--worker", worker,
    "--kind", "pr", "--input", prPath,
  ]);
  assert.equal(checked.status, 3);
  const artifact = JSON.parse(checked.stdout).artifact;
  assert.equal(artifact.outcome, "owner_review_required");

  success([
    "review-artifact", "--ledger", ledger, "--id", task.id, "--kind", "pr",
    "--sha256", artifact.sha256, "--decision", "reject",
    "--actor", "owner", "--review-note", "Do not ship this copy",
  ]);

  // The party under review must not be able to overturn the veto on identical
  // content by simply re-running the command with --decision approve.
  const overwrite = cli([
    "review-artifact", "--ledger", ledger, "--id", task.id, "--kind", "pr",
    "--sha256", artifact.sha256, "--decision", "approve",
    "--actor", worker, "--review-note", "Actually fine",
  ]);
  assert.equal(overwrite.status, 1);
  assert.match(overwrite.stderr, /already rejected by owner/);

  const stored = JSON.parse(fs.readFileSync(ledger, "utf8"))
    .items.find(({ id }) => id === task.id);
  assert.equal(stored.artifacts.pr.ownerReview.decision, "reject");

  // A rejected artifact must also keep the packet closed.
  const blocked = cli([
    "transition", "--ledger", ledger, "--id", task.id, "--worker", worker, "--to", "packet_ready",
  ]);
  assert.equal(blocked.status, 1);
  assert.match(blocked.stderr, /unresolved artifact checks: pr/);
});

test("the CLI runs when invoked through a symlinked path", (t) => {
  const { directory, ledger } = workspace(t);
  const linkPath = path.join(directory, "ledger-cli.mjs");
  fs.symlinkSync(SCRIPT, linkPath);

  // path.resolve() does not follow symlinks, so an entrypoint guard comparing
  // it against import.meta.url exits 0 without running main() — a silent no-op
  // that reads as success to any caller checking the exit code.
  const result = spawnSync(process.execPath, [linkPath, "init", "--ledger", ledger], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).ok, true);
  assert.ok(fs.existsSync(ledger), "init through a symlink must actually write the ledger");

  const bogus = spawnSync(process.execPath, [linkPath, "not-a-command"], { encoding: "utf8" });
  assert.equal(bogus.status, 1);
  assert.match(bogus.stderr, /Unknown command/);
});

test("the required disclosure statement cannot be used as a lint kill switch", (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  const base = [
    "add", "--ledger", ledger, "--repo", "up/project", "--title", "Add the listing",
    "--scope", "external", "--disclosure", "required",
    "--disclosure-source", "Checked repository contribution instructions",
    "--impact", "3", "--confidence", "3", "--effort", "3", "--risk", "3",
  ];

  // The statement is masked out of the PR artifact before linting, so an
  // unbounded one exempts whatever it covers. Declaring the whole PR body as
  // the statement would disable every outward-copy rule.
  const wholeBody = [
    "## Summary", "Add the listing.", "", "## Why", "Useful.", "",
    "## Testing", "npm test", "", "## Scope", "Docs only.", "",
    "## Risks", "Low.", "", "\u{1F916} Generated with Claude Code", "",
    "Co-Authored-By: Claude <noreply@anthropic.com>", "",
  ].join("\n");
  const swallowed = cli([...base, "--ref", "42", "--disclosure-statement", wholeBody]);
  assert.equal(swallowed.status, 1);
  assert.match(swallowed.stderr, /at most 4 lines/);

  const tooLong = cli([...base, "--ref", "43", "--disclosure-statement", "d".repeat(401)]);
  assert.equal(tooLong.status, 1);
  assert.match(tooLong.stderr, /at most 400 characters/);

  // A short statement must not smuggle the exact markers masking would delete.
  const smuggled = cli([...base, "--ref", "44", "--disclosure-statement", [
    "Disclosure: assisted.",
    "\u{1F916} Generated with Claude Code",
    "Co-Authored-By: Claude <noreply@anthropic.com>",
  ].join("\n")]);
  assert.equal(smuggled.status, 1);
  assert.match(smuggled.stderr, /coauthor-tool-trailer|robot-marker/);

  // A genuine upstream-mandated disclosure is still accepted.
  const accepted = success([
    ...base, "--ref", "45",
    "--disclosure-statement", "Generated with AI assistance as required by this repository.",
  ]);
  assert.equal(accepted.task.disclosure, "required");
});

test("one repository cannot be tracked under two scopes", (t) => {
  const { ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  add(ledger, { repo: "upstream/project", ref: "42", scope: "external" });

  // Scope is a property of the repository. An "owned" twin for a repository
  // already classified as external could take a merge grant, defeating the
  // external-merge prohibition in substance while honouring it per task.
  const laundered = cli([
    "add", "--ledger", ledger, "--repo", "upstream/project", "--ref", "43",
    "--title", "Owned twin", "--scope", "owned",
    "--ownership-evidence", "trust me",
    "--disclosure", "not-required",
    "--disclosure-source", "Checked repository contribution instructions",
  ]);
  assert.equal(laundered.status, 1);
  assert.match(laundered.stderr, /already tracked as external/);

  // A second task on the same repo with the same scope is still fine.
  const sameScope = add(ledger, { repo: "upstream/project", ref: "44", scope: "external" });
  assert.equal(sameScope.scope, "external");
});

test("requeuing a published task preserves what was actually published", (t) => {
  const { directory, ledger } = workspace(t);
  success(["init", "--ledger", ledger]);
  let task = add(ledger, { scope: "owned" });
  const worker = "builder";
  task = advanceToReviewed(ledger, task, worker);
  recordArtifacts(directory, ledger, task, worker);
  task = transition(ledger, task, worker, "packet_ready");
  success([
    "configure", "--ledger", ledger, "--publish-mode", "owned",
    "--actor", "owner", "--authority-note", "Owner approved this run",
  ]);
  success([
    "grant", "--ledger", ledger, "--id", task.id, "--capability", "push",
    "--actor", "owner", "--authority-note", "Push this named branch only",
    "--target", "refs/heads/feature/empty-metadata",
  ]);
  const remoteUrl = "https://github.com/example/project/tree/feature/empty-metadata";
  success([
    "transition", "--ledger", ledger, "--id", task.id, "--to", "published",
    "--action", "push", "--authority-target", "refs/heads/feature/empty-metadata",
    "--remote-url", remoteUrl, "--performed-by", "publisher",
  ]);

  // published -> queued needs no authority at all, and `history` is FIFO-capped,
  // so this path used to erase the last trace of a real upstream push.
  success(["transition", "--ledger", ledger, "--id", task.id, "--to", "queued"]);

  const stored = JSON.parse(fs.readFileSync(ledger, "utf8"))
    .items.find(({ id }) => id === task.id);
  assert.equal(stored.publications.length, 0, "working state is reset");
  assert.equal(stored.publicationLog.length, 1, "the published action survives");
  assert.equal(stored.publicationLog[0].action, "push");
  assert.equal(stored.publicationLog[0].remoteUrl, remoteUrl);
  assert.ok(stored.publicationLog[0].clearedAt);
});
