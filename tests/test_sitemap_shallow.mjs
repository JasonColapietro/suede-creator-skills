// A shallow clone (CI's default fetch depth) answers `git log -1 -- <file>`
// with the graft commit for every file. Regenerating the sitemap there used to
// stamp every unchanged page with that commit's date, a false recrawl signal
// on hundreds of URLs. A clean file must keep its committed lastmod.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function git(cwd, args, date) {
  const env = { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date };
  const r = spawnSync("git", ["-c", "user.name=Test", "-c", "user.email=test@example.com", "-c", "commit.gpgsign=false", ...args], { cwd, env, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

function lastmod(xml, loc) {
  const m = xml.match(new RegExp(`<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>\\s*<lastmod>([^<]+)</lastmod>`));
  return m && m[1];
}

test("a shallow clone keeps committed lastmod values for unchanged pages", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-shallow-"));
  try {
    const origin = path.join(tmp, "origin");
    fs.mkdirSync(path.join(origin, "scripts"), { recursive: true });
    fs.mkdirSync(path.join(origin, "docs", "skills"), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, "scripts", "generate-sitemap.mjs"), path.join(origin, "scripts", "generate-sitemap.mjs"));
    fs.writeFileSync(path.join(origin, "docs", "index.html"), "<!doctype html><title>home</title>\n");
    fs.writeFileSync(path.join(origin, "docs", "skills", "index.html"), "<!doctype html><title>skills</title>\n");
    fs.writeFileSync(path.join(origin, "docs", "skills", "alpha.html"), "<!doctype html><title>alpha</title>\n");
    git(origin, ["init", "-q", "-b", "main"]);
    git(origin, ["add", "."]);
    git(origin, ["commit", "-q", "-m", "pages"], "2026-01-05T12:00:00Z");
    const gen = spawnSync(process.execPath, ["scripts/generate-sitemap.mjs"], { cwd: origin, encoding: "utf8" });
    assert.equal(gen.status, 0, gen.stderr);
    fs.writeFileSync(path.join(origin, "unrelated.txt"), "later\n");
    git(origin, ["add", "."]);
    git(origin, ["commit", "-q", "-m", "sitemap and an unrelated file"], "2026-02-09T12:00:00Z");
    const committed = fs.readFileSync(path.join(origin, "docs", "sitemap.xml"), "utf8");
    assert.equal(lastmod(committed, "https://skills.suedeai.ai/skills/alpha.html"), "2026-01-05");

    const shallow = path.join(tmp, "shallow");
    git(tmp, ["clone", "-q", "--depth", "1", `file://${origin}`, shallow]);
    assert.equal(git(shallow, ["rev-parse", "--is-shallow-repository"]).trim(), "true");
    const run = spawnSync(process.execPath, ["scripts/generate-sitemap.mjs"], { cwd: shallow, encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    const regenerated = fs.readFileSync(path.join(shallow, "docs", "sitemap.xml"), "utf8");
    for (const loc of ["https://skills.suedeai.ai/", "https://skills.suedeai.ai/skills/", "https://skills.suedeai.ai/skills/alpha.html"]) {
      assert.equal(lastmod(regenerated, loc), "2026-01-05", `${loc} took the graft commit's date`);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
