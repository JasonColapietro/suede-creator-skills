#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const contractPath = path.join(repoRoot, "tests", "fixtures", "trigger-routing.json");
const catalogPath = path.join(repoRoot, "mcp", "catalog.json");

export function normalize(value) {
  return String(value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function loadContract() {
  return JSON.parse(fs.readFileSync(contractPath, "utf8"));
}

export function loadCatalog() {
  return JSON.parse(fs.readFileSync(catalogPath, "utf8"));
}

function includesSignal(prompt, signal) {
  const normalizedSignal = normalize(signal);
  return normalizedSignal.length > 0 && ` ${prompt} `.includes(` ${normalizedSignal} `);
}

export function routePrompt(group, prompt) {
  const normalizedPrompt = normalize(prompt);
  const scored = group.routes.map((route) => {
    const positives = route.positive.filter((signal) => includesSignal(normalizedPrompt, signal));
    const negatives = route.negative.filter((signal) => includesSignal(normalizedPrompt, signal));
    return {
      skill: route.skill,
      score: positives.length * 2 - negatives.length * 3,
      positives,
      negatives,
    };
  });
  const highest = Math.max(...scored.map(({ score }) => score));
  const leaders = scored.filter(({ score }) => score === highest);
  const selected = highest > 0 && leaders.length === 1 ? leaders[0].skill : group.fallback;
  return { selected, scored };
}

export function validateContract(contract = loadContract(), catalog = loadCatalog()) {
  const errors = [];
  const expectedGroups = new Set([
    "code-review-grader",
    "teams-fleet-workflow",
    "design-visibility",
    "rights-audit-passport",
    "android-ios",
    "amazon-subscription",
  ]);
  const catalogByName = new Map(catalog.skills.map((skill) => [skill.name, skill]));
  const seenGroups = new Set();
  const seenCases = new Set();

  if (contract.version !== 1 || !Array.isArray(contract.groups)) {
    return ["contract must declare version 1 and a groups array"];
  }

  for (const group of contract.groups) {
    if (!expectedGroups.has(group.id)) errors.push(`unexpected trigger group: ${group.id}`);
    if (seenGroups.has(group.id)) errors.push(`duplicate trigger group: ${group.id}`);
    seenGroups.add(group.id);

    const skills = new Set(group.skills ?? []);
    const routes = new Set((group.routes ?? []).map(({ skill }) => skill));
    for (const skill of skills) {
      if (!catalogByName.has(skill)) errors.push(`${group.id}: unknown catalog skill ${skill}`);
      if (!routes.has(skill)) errors.push(`${group.id}: missing route rules for ${skill}`);
      const skillFile = path.join(repoRoot, "skills", skill, "SKILL.md");
      if (!fs.existsSync(skillFile)) errors.push(`${group.id}: missing ${skillFile}`);
    }
    if (group.fallback !== "clarify" && !skills.has(group.fallback)) {
      errors.push(`${group.id}: fallback must be a group skill or clarify`);
    }

    for (const route of group.routes ?? []) {
      if (!skills.has(route.skill)) errors.push(`${group.id}: route references non-member ${route.skill}`);
      if (!Array.isArray(route.positive) || !Array.isArray(route.negative)) {
        errors.push(`${group.id}/${route.skill}: positive and negative must be arrays`);
      }
      const catalogSkill = catalogByName.get(route.skill);
      const metadata = normalize(`${catalogSkill?.description ?? ""} ${catalogSkill?.useWhen ?? ""}`);
      for (const signal of route.metadataMustContain ?? []) {
        if (!includesSignal(metadata, signal)) {
          errors.push(`${group.id}/${route.skill}: catalog metadata is missing routing signal '${signal}'`);
        }
      }
    }

    const modes = new Set();
    for (const testCase of group.cases ?? []) {
      if (seenCases.has(testCase.id)) errors.push(`duplicate trigger case: ${testCase.id}`);
      seenCases.add(testCase.id);
      modes.add(testCase.mode);
      if (!['positive', 'negative', 'ambiguous'].includes(testCase.mode)) {
        errors.push(`${testCase.id}: invalid mode ${testCase.mode}`);
      }
      if (testCase.expected !== "clarify" && !skills.has(testCase.expected)) {
        errors.push(`${testCase.id}: expected route is outside its group`);
      }
      if (testCase.mode === "negative" && !(testCase.forbidden?.length > 0)) {
        errors.push(`${testCase.id}: negative case must declare a forbidden route`);
      }
      const result = routePrompt(group, testCase.prompt);
      if (result.selected !== testCase.expected) {
        errors.push(`${testCase.id}: expected ${testCase.expected}, got ${result.selected}`);
      }
      if ((testCase.forbidden ?? []).includes(result.selected)) {
        errors.push(`${testCase.id}: selected forbidden route ${result.selected}`);
      }
    }
    for (const mode of ["positive", "negative", "ambiguous"]) {
      if (!modes.has(mode)) errors.push(`${group.id}: missing ${mode} case`);
    }
  }

  for (const id of expectedGroups) {
    if (!seenGroups.has(id)) errors.push(`missing trigger group: ${id}`);
  }
  return errors;
}

export function main() {
  const errors = validateContract();
  if (errors.length > 0) {
    for (const error of errors) process.stderr.write(`ERROR: ${error}\n`);
    process.exitCode = 1;
    return;
  }
  const contract = loadContract();
  const caseCount = contract.groups.reduce((count, group) => count + group.cases.length, 0);
  process.stdout.write(`Trigger routing contract OK: ${contract.groups.length} groups, ${caseCount} cases\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
