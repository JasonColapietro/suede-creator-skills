#!/usr/bin/env node
// The GitHub repository description is the one skill-count surface that is not
// a tracked file, so validate-skill-pack.mjs cannot reach it. It drifted to 69
// while all 40+ in-repo surfaces correctly said 70 — nothing in CI could see
// the gap, because the number lives in repository settings, not the tree.
//
// This runs separately from the validator on purpose: the validator is
// hermetic and offline, and `npm test` must stay that way. This one talks to
// the API, so it is wired into CI as its own step.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.env.GITHUB_REPOSITORY || "JasonColapietro/suede-creator-skills";

// Same source of truth the validator uses: directories under skills/.
const skillsDir = path.join(repoRoot, "skills");
const totalSkillCount = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .length;

if (totalSkillCount === 0) {
  console.error("check-repo-description: found no skill folders — refusing to assert a count of 0");
  process.exit(1);
}

// A network or rate-limit failure must not present as a count mismatch, and
// must not turn into a flaky red X on unrelated PRs. Skip loudly instead.
function skip(reason) {
  console.log(`check-repo-description: SKIPPED (${reason})`);
  process.exit(0);
}

const headers = { accept: "application/vnd.github+json", "user-agent": "suede-skill-pack-ci" };
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

let response;
try {
  response = await fetch(`https://api.github.com/repos/${slug}`, {
    headers,
    signal: AbortSignal.timeout(20000),
  });
} catch (error) {
  skip(`could not reach the GitHub API: ${error.message}`);
}

if (response.status === 403 || response.status === 429) skip("GitHub API rate limit");
if (!response.ok) skip(`GitHub API returned ${response.status}`);

const description = (await response.json()).description || "";

// Mirrors the validator's convention: a missing pattern is a failure, not a
// pass. Otherwise a reworded description would silently disable the guard.
const match = description.match(/(\d+)\s+open-source Agent Skills/);

if (!match) {
  console.error(
    `check-repo-description: FAIL — could not find a skill count in the description of ${slug}.\n` +
      `  description: ${description || "(empty)"}\n` +
      `  Expected it to contain "<N> open-source Agent Skills".\n` +
      `  If the wording changed deliberately, update the regex in this script to match.`,
  );
  process.exit(1);
}

const stated = Number(match[1]);
if (stated !== totalSkillCount) {
  const fixed = description.replace(match[0], `${totalSkillCount} open-source Agent Skills`);
  console.error(
    `check-repo-description: FAIL — description says ${stated} skills, repository has ${totalSkillCount}.\n` +
      `  Fix with:\n` +
      `    gh api -X PATCH repos/${slug} -f description=${JSON.stringify(fixed)}`,
  );
  process.exit(1);
}

console.log(`check-repo-description: OK — description and skills/ both say ${totalSkillCount}`);
