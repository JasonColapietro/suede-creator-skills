"""Exercise refresh.sh against local Git remotes, without network or skill execution."""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class DirectoryRefreshTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="directory-refresh-")
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.project = self.root / "project"
        shutil.copytree(ROOT / "scripts/directory", self.project / "scripts/directory")
        (self.project / "directory").mkdir()
        (self.project / "directory/inclusions.json").write_text('{"repositories": []}')
        self.work = self.root / "cache with spaces"
        self.remotes = self.root / "remotes"
        self.upstream = self.root / "upstream"
        self.upstream.mkdir()
        self.env = {**os.environ, "GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": os.devnull,
                    "GIT_CONFIG_COUNT": "1", "GIT_CONFIG_KEY_0": f"url.{self.remotes.as_uri()}/.insteadOf",
                    "GIT_CONFIG_VALUE_0": "https://github.com/", "GIT_TERMINAL_PROMPT": "0"}
        self.git("init", "-q", "-b", "main", str(self.upstream))
        self.git("-C", str(self.upstream), "config", "user.name", "Fixture")
        self.git("-C", str(self.upstream), "config", "user.email", "fixture@example.invalid")
        (self.upstream / "README.md").write_text("https://github.com/fixture/skills\n")
        (self.upstream / "LICENSE").write_text("MIT License\n")
        (self.upstream / "old-skill").mkdir()
        (self.upstream / "old-skill/SKILL.md").write_text("old description\n")
        self.commit("initial")
        script = (ROOT / "scripts/directory/refresh.sh").read_text()
        self.lists = re.search(r"LISTS=\(([\s\S]*?)\)", script)[1].split()
        for repo in self.lists + ["fixture/skills"]:
            remote = self.remotes / repo
            remote.parent.mkdir(parents=True, exist_ok=True)
            self.git("clone", "-q", "--bare", str(self.upstream), str(remote))
        # Run the real parser as well as Git/link extraction/source selection.
        # These fixtures deliberately have no YAML frontmatter, so an empty
        # yaml module is enough to run this metadata test without PyYAML in CI.
        # Only curation and site writes are stubbed at the output boundary.
        bin_dir = self.root / "bin"
        bin_dir.mkdir()
        proxy = bin_dir / "python3"
        proxy.write_text(f"#!{sys.executable}\n" + r'''
import json, os, pathlib, runpy, subprocess, sys, types
args = sys.argv[1:]
if any(a.endswith("parse_skills.py") for a in args):
    source = pathlib.Path(args[-3])
    sys.modules["yaml"] = types.ModuleType("yaml")
    sys.argv = args[1:] if args[0] == "-I" else args
    runpy.run_path(sys.argv[0], run_name="__main__")
    raw = json.loads(pathlib.Path(args[-1]).read_text())
    records = {}
    for repo in source.iterdir():
        if not (repo / ".git").exists():
            continue
        records[repo.name] = {
            "files": {str(p.relative_to(repo)): p.read_text() for p in repo.rglob("*")
                      if p.is_file() and ".git" not in p.relative_to(repo).parts},
            "branch": next(r["branch"] for r in raw if r["repo_key"] == repo.name.replace("__", "/", 1)),
            "parsed": [r for r in raw if r["repo_key"] == repo.name.replace("__", "/", 1)],
        }
    pathlib.Path(os.environ["REFRESH_SNAPSHOT"]).write_text(json.dumps(records))
elif not any(a.endswith("curate.py") for a in args):
    os.execv(sys.executable, [sys.executable, *args])
''')
        proxy.chmod(0o755)
        node = bin_dir / "node"
        node.write_text("#!/bin/sh\nexit 0\n")
        node.chmod(0o755)
        self.snapshot = self.root / "parsed.json"
        self.env.update(PATH=f"{bin_dir}:{os.environ['PATH']}", REFRESH_SNAPSHOT=str(self.snapshot))

    def git(self, *args):
        result = subprocess.run(["git", *args], env=self.env, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.strip()

    def commit(self, message):
        self.git("-C", str(self.upstream), "add", "-A")
        self.git("-C", str(self.upstream), "commit", "-qm", message)

    def refresh(self, succeeds=True):
        self.snapshot.unlink(missing_ok=True)
        result = subprocess.run(["bash", str(self.project / "scripts/directory/refresh.sh"), str(self.work)],
                                env=self.env, capture_output=True, text=True, timeout=45)
        if succeeds:
            self.assertEqual(result.returncode, 0, result.stderr)
            return json.loads(self.snapshot.read_text())
        self.assertNotEqual(result.returncode, 0, "refresh published after an upstream failure")
        self.assertFalse(self.snapshot.exists(), "parser ran on stale data")
        return result

    def test_reviewed_hidden_roots_skip_other_distribution_and_system_copies(self):
        for relative in ("skills/.curated/public/SKILL.md", "skills/.system/internal/SKILL.md", "mirror/other/SKILL.md"):
            target = self.upstream / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text("published source data\n")
        self.commit("add distributions")
        self.git("-C", str(self.upstream), "push", "-q", str(self.remotes / "fixture/skills"), "main")
        (self.project / "directory/inclusions.json").write_text(json.dumps({"repositories": [], "skill_roots": {"fixture/skills": ["skills/.curated"]}}))
        snapshot = self.refresh()
        self.assertEqual([r["dir"] for r in snapshot["fixture__skills"]["parsed"]], ["skills/.curated/public"])

    def test_reviewed_root_cannot_escape_source_checkout_or_disappear_silently(self):
        for root in ("../outside", "skills/.missing"):
            with self.subTest(root=root):
                (self.project / "directory/inclusions.json").write_text(json.dumps({"repositories": [], "skill_roots": {"fixture/skills": [root]}}))
                result = self.refresh(succeeds=False)
                self.assertIn("reviewed skill root", result.stderr)

    def test_explicit_readme_license_and_uppercase_per_skill_license_are_detected(self):
        (self.upstream / "LICENSE").unlink()
        (self.upstream / "README.md").write_text("https://github.com/fixture/skills\n\n## License\n\nMIT\n")
        self.commit("declare README license")
        self.git("-C", str(self.upstream), "push", "-q", str(self.remotes / "fixture/skills"), "main")
        parsed = self.refresh()["fixture__skills"]["parsed"][0]
        self.assertEqual((parsed["repo_license"], parsed["license_file"]), ("MIT", "README.md"))
        (self.upstream / "old-skill/LICENSE.TXT").write_text("Apache License Version 2.0\n")
        self.commit("declare per-skill license")
        self.git("-C", str(self.upstream), "push", "-q", str(self.remotes / "fixture/skills"), "main")
        parsed = self.refresh()["fixture__skills"]["parsed"][0]
        self.assertEqual((parsed["repo_license"], parsed["license_file"]), ("Apache-2.0", "old-skill/LICENSE.TXT"))

    def test_reused_checkouts_read_updates_deletions_and_new_default_branch(self):
        initial = self.refresh()
        self.assertIn("old-skill/SKILL.md", initial["fixture__skills"]["files"])
        self.git("-C", str(self.upstream), "checkout", "-qb", "release/current")
        shutil.rmtree(self.upstream / "old-skill")
        (self.upstream / "new-skill").mkdir()
        (self.upstream / "new-skill/SKILL.md").write_text("new description\n")
        (self.upstream / "LICENSE").write_text("Apache License Version 2.0\n")
        self.commit("replace skill and license")
        remote = self.remotes / "fixture/skills"
        self.git("-C", str(self.upstream), "push", str(remote), "release/current")
        self.git("--git-dir", str(remote), "symbolic-ref", "HEAD", "refs/heads/release/current")
        current = self.refresh()["fixture__skills"]
        self.assertEqual(current["branch"], "release/current")
        self.assertEqual(current["files"]["LICENSE"], "Apache License Version 2.0\n")
        self.assertEqual(current["files"]["new-skill/SKILL.md"], "new description\n")
        self.assertNotIn("old-skill/SKILL.md", current["files"])
        self.assertEqual([s["dir"] for s in current["parsed"]], ["new-skill"])
        self.assertEqual(current["parsed"][0]["repo_license"], "Apache-2.0")

    def test_updated_lists_remove_unselected_cached_repositories(self):
        self.refresh()
        (self.upstream / "README.md").write_text("No repositories selected.\n")
        self.commit("remove source")
        for repo in self.lists:
            self.git("-C", str(self.upstream), "push", str(self.remotes / repo), "main")
        self.assertEqual(self.refresh(), {})
        for repo in self.lists:
            readme = self.work / "lists" / repo.replace("/", "_") / "README.md"
            self.assertEqual(readme.read_text(), "No repositories selected.\n")
        self.assertTrue((self.work / "src/fixture__skills/.git").is_dir())

    def test_failed_source_fetch_stops_before_parsing(self):
        self.refresh()
        (self.remotes / "fixture/skills").rename(self.remotes / "fixture/unavailable")
        self.refresh(succeeds=False)

    def test_default_branch_namespace_renames_preserve_old_local_refs(self):
        self.refresh()
        cache = self.work / "src/fixture__skills"
        original = self.git("-C", str(cache), "rev-parse", "refs/heads/main")
        remote = self.remotes / "fixture/skills"
        for branch, old in (("main/current", "main"), ("main", "main/current")):
            self.git("-C", str(self.upstream), "branch", "-m", branch)
            (self.upstream / "README.md").write_text(f"default branch {branch}\n")
            self.commit("rename default branch")
            self.git("--git-dir", str(remote), "symbolic-ref", "HEAD", "refs/heads/temporary")
            self.git("-C", str(self.upstream), "push", str(remote), f":refs/heads/{old}")
            self.git("-C", str(self.upstream), "push", str(remote), branch)
            self.git("--git-dir", str(remote), "symbolic-ref", "HEAD", f"refs/heads/{branch}")
            current = self.refresh()["fixture__skills"]
            self.assertEqual(current["branch"], branch)
            self.assertEqual(current["files"]["README.md"], f"default branch {branch}\n")
        self.assertEqual(self.git("-C", str(cache), "rev-parse", "refs/heads/main"), original)

    def test_failed_list_fetch_stops_before_parsing(self):
        self.refresh()
        remote = self.remotes / self.lists[0]
        remote.rename(remote.with_name("unavailable"))
        self.refresh(succeeds=False)

    def test_dirty_cache_is_preserved_and_not_published(self):
        self.refresh()
        dirty = self.work / "src/fixture__skills/README.md"
        dirty.write_text("local work\n")
        self.refresh(succeeds=False)
        self.assertEqual(dirty.read_text(), "local work\n")


if __name__ == "__main__":
    unittest.main()
