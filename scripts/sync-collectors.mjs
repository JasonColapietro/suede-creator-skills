#!/usr/bin/env node
// Keeps every bundled copy of the public-source collector byte-identical to
// the canonical file. Skills install one folder at a time, so each adopting
// skill ships its own copy instead of importing from another skill.
//
//   node scripts/sync-collectors.mjs          write the copies
//   node scripts/sync-collectors.mjs --check  exit 1 if any copy has drifted

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const CANONICAL = "skills/suede-reverse-engineer-anyone/scripts/collect.mjs";
export const COPIES = [
  "skills/suede-competitor-profiling/scripts/collect.mjs",
  "skills/suede-prospecting/scripts/collect.mjs",
  "skills/suede-aso/scripts/collect.mjs",
  "skills/suede-customer-research/scripts/collect.mjs",
];

export function driftedCopies(root = repoRoot) {
  const source = fs.readFileSync(path.join(root, CANONICAL));
  return COPIES.filter((copy) => {
    const target = path.join(root, copy);
    return !fs.existsSync(target) || !fs.readFileSync(target).equals(source);
  });
}

export function main(argv = process.argv.slice(2)) {
  const check = argv.includes("--check");
  const drifted = driftedCopies();
  if (check) {
    if (drifted.length) {
      for (const copy of drifted) process.stderr.write(`ERROR: ${copy} differs from ${CANONICAL}\n`);
      process.stderr.write("Run `node scripts/sync-collectors.mjs` to rewrite the copies.\n");
      return 1;
    }
    process.stdout.write(`Collector copies current: ${COPIES.length} copies of ${CANONICAL}\n`);
    return 0;
  }
  const source = fs.readFileSync(path.join(repoRoot, CANONICAL));
  for (const copy of drifted) {
    fs.mkdirSync(path.dirname(path.join(repoRoot, copy)), { recursive: true });
    fs.writeFileSync(path.join(repoRoot, copy), source);
    process.stdout.write(`wrote ${copy}\n`);
  }
  if (!drifted.length) process.stdout.write("Collector copies already current.\n");
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main();
