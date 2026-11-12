import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CANONICAL, COPIES, driftedCopies } from "../scripts/sync-collectors.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("every bundled collector copy is byte-identical to the canonical file", () => {
  assert.deepEqual(driftedCopies(repoRoot), []);
});

test("each collector copy runs from a lone copy of its skill folder", async () => {
  for (const copy of [CANONICAL, ...COPIES]) {
    const skillDir = path.join(repoRoot, path.dirname(path.dirname(copy)));
    const lone = fs.mkdtempSync(path.join(os.tmpdir(), "collector-copy-"));
    try {
      const target = path.join(lone, path.basename(skillDir));
      fs.cpSync(skillDir, target, { recursive: true });
      const mod = await import(pathToFileURL(path.join(target, "scripts", "collect.mjs")).href);
      const out = [];
      const code = await mod.main(["--help"], { log: (...a) => out.push(a.join(" ")), error: () => {} });
      assert.equal(code, 0, copy);
      assert.match(out.join("\n"), /suede-collect\/1\.0/, copy);
    } finally {
      fs.rmSync(lone, { recursive: true, force: true });
    }
  }
});
