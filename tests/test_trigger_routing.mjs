import assert from "node:assert/strict";
import { test } from "node:test";

import {
  loadCatalog,
  loadContract,
  routePrompt,
  validateContract,
} from "../scripts/validate-trigger-routing.mjs";

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
