import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  loadCatalog,
  loadContract,
  routePrompt,
  validateContract,
} from "../scripts/validate-trigger-routing.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("routing contract is complete and references live catalog skills", () => {
  assert.deepEqual(validateContract(), []);
});

test("positive, negative, and ambiguous prompts route deterministically", async (t) => {
  const contract = loadContract();
  for (const group of contract.groups) {
    for (const testCase of group.cases) {
      await t.test(testCase.id, () => {
        const result = routePrompt(group, testCase.prompt);
        assert.equal(result.selected, testCase.expected, JSON.stringify(result.scored));
        assert.ok(!(testCase.forbidden ?? []).includes(result.selected));
      });
    }
  }
});

test("every routed skill remains installed and publicly cataloged", () => {
  const catalogNames = new Set(loadCatalog().skills.map(({ name }) => name));
  for (const group of loadContract().groups) {
    for (const skill of group.skills) assert.ok(catalogNames.has(skill), skill);
  }
});

test("retired orchestration skills stay out of the routing contract and plugin subsets", () => {
  const retired = ["suede-full-send", "suede-codex-fleet"];
  const contract = loadContract();
  for (const group of contract.groups) {
    for (const name of retired) {
      assert.ok(!group.skills.includes(name), `${group.id} still lists ${name}`);
      assert.ok(!group.routes.some(({ skill }) => skill === name), `${group.id} still routes ${name}`);
    }
  }

  const orchestration = contract.groups.find(({ id }) => id === "teams-workflow");
  assert.ok(orchestration);
  assert.ok(orchestration.skills.includes("suede-agent-teams"));
  assert.ok(orchestration.skills.includes("suede-workflow-skills"));

  const marketplace = JSON.parse(
    fs.readFileSync(path.join(ROOT, ".claude-plugin", "marketplace.json"), "utf8")
  );
  for (const plugin of marketplace.plugins) {
    for (const name of retired) {
      assert.ok(!(plugin.skills ?? []).includes(`./skills/${name}`), `${plugin.name} still lists ${name}`);
    }
  }
});
