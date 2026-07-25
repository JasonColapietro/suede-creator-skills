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

test("full-send intent stays in the existing orchestration group and focused plugin subset", () => {
  const contract = loadContract();
  const orchestration = contract.groups.find(({ id }) => id === "teams-fleet-workflow");
  assert.ok(orchestration);
  assert.ok(orchestration.skills.includes("suede-full-send"));
  const route = orchestration.routes.find(({ skill }) => skill === "suede-full-send");
  assert.ok(route);
  assert.ok(route.positive.includes("full send"));
  assert.ok(route.positive.includes("never end your allocation above zero"));

  const marketplace = JSON.parse(
    fs.readFileSync(path.join(ROOT, ".claude-plugin", "marketplace.json"), "utf8")
  );
  const subset = marketplace.plugins.find(({ name }) => name === "suede-agent-workflows");
  assert.ok(subset);
  assert.ok(subset.skills.includes("./skills/suede-full-send"));
});
