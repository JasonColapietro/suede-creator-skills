"""Scoped first-party intake uses real Git/source parsing and preserves external data."""
import copy
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
REPO = "JasonColapietro/suede-creator-skills"


class FirstPartyDirectoryTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="first-party-intake-")
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.project = self.base / "project"
        shutil.copytree(ROOT / "scripts/directory", self.project / "scripts/directory")
        for name in ("check-public-privacy.py", "public-privacy-policy.json"):
            shutil.copy2(ROOT / "scripts" / name, self.project / "scripts" / name)
        (self.project / "directory").mkdir()
        original = json.loads((ROOT / "directory/skills.json").read_text())
        external = next(s for s in original["skills"] if s["repo"] != REPO)
        self.dataset = {**original, "skills": [external], "repos": {external["repo"]: original["repos"][external["repo"]]}}
        self.data = self.project / "directory/skills.json"
        self.data.write_text(json.dumps(self.dataset))
        self.scope = {"repositories": [REPO], "skills": {REPO: ["suede-review-brief"]}, "skill_roots": {REPO: ["skills"]}}
        self.scope_path = self.project / "directory/inclusions.json"
        self.scope_path.write_text(json.dumps(self.scope))
        (self.project / "directory/labels.json").write_text("{}")
        (self.project / "directory/exclusions.json").write_text("{}")
        self.source = self.base / "source"
        self.source.mkdir()
        self.git("init", "-q", "-b", "main")
        self.git("config", "user.name", "Fixture")
        self.git("config", "user.email", "fixture@example.invalid")
        self.git("remote", "add", "origin", f"https://github.com/{REPO}.git")
        (self.source / "LICENSE").write_text("MIT License\n")
        skill = self.source / "skills/suede-review-brief/SKILL.md"
        skill.parent.mkdir(parents=True)
        skill.write_text('---\nname: suede-review-brief\ndescription: Use when a user asks to review a product draft, such as "review this draft". Not for deploying applications. Read supplied material and return actionable findings.\n---\n\n# Sample\n' + 'Useful guidance for a concrete review. ' * 100)
        self.commit()
        self.citations = self.base / "citations.json"
        rows = []
        for index, repo in enumerate(original["sources"]):
            content = f"[Suede](https://github.com/{REPO})\n" if index < 3 else "No Suede entry.\n"
            payload = content.encode()
            rows.append({"repo": repo, "branch": "main", "commit": "a" * 40, "path": "README.md", "blob": hashlib.sha1(f"blob {len(payload)}\0".encode() + payload).hexdigest(), "content": content})
        self.citations.write_text(json.dumps(rows))
        self.receipt = self.base / "receipt.json"

    def git(self, *args):
        result = subprocess.run(["git", "-C", str(self.source), *args], capture_output=True, text=True,
                                env={**os.environ, "GIT_AUTHOR_DATE": "2026-10-25T12:00:00Z", "GIT_COMMITTER_DATE": "2026-10-25T12:00:00Z"})
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.strip()

    def commit(self):
        self.git("add", "-A")
        self.git("commit", "-qm", "fixture")
        self.revision = self.git("rev-parse", "HEAD")

    def run_intake(self, succeeds=True):
        result = subprocess.run([sys.executable, "-I", str(self.project / "scripts/directory/first_party.py"),
                                 "--source", str(self.source), "--revision", self.revision,
                                 "--citations", str(self.citations), "--assessment-date", "2026-10-26",
                                 "--receipt", str(self.receipt)], capture_output=True, text=True)
        if succeeds:
            self.assertEqual(result.returncode, 0, result.stderr)
            return json.loads(self.data.read_text()), json.loads(self.receipt.read_text())
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(json.loads(self.data.read_text()), self.dataset)
        self.assertFalse(self.receipt.exists())
        return result

    def test_explicit_first_party_acceptance_is_selected(self):
        candidates = self.base / "candidates.json"
        candidates.write_text(json.dumps([{"repo": REPO.lower(), "n": 3}]))
        readme = self.base / "README.md"
        readme.write_text("")
        result = subprocess.run([sys.executable, "-I", str(ROOT / "scripts/directory/select_repos.py"),
                                 str(candidates), str(readme), str(self.scope_path)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(REPO.lower(), result.stdout.splitlines())

    def test_scoped_intake_preserves_external_records_and_computes_source_evidence(self):
        output, receipt = self.run_intake()
        self.assertEqual(output["generated"], self.dataset["generated"])
        self.assertEqual(output["skills"][0], self.dataset["skills"][0])
        for repo, meta in self.dataset["repos"].items():
            self.assertEqual(output["repos"][repo], meta)
        first = next(s for s in output["skills"] if s["repo"] == REPO)
        self.assertEqual(first["name"], "suede-review-brief")
        self.assertEqual(first["security_scan_status"], "not_scanned")
        self.assertEqual(output["repos"][REPO]["commit_sha"], self.revision)
        self.assertEqual(len(output["repos"][REPO]["lists"]), 3)
        self.assertEqual(receipt["assessment_date"], "2026-10-26")
        self.assertEqual(receipt["external_before_sha256"], receipt["external_after_sha256"])
        payload = (self.source / "skills/suede-review-brief/SKILL.md").read_bytes()
        self.assertEqual(receipt["source_files"]["skills/suede-review-brief/SKILL.md"], hashlib.sha256(payload).hexdigest())
        self.assertNotIn("content", json.dumps(receipt["citations"]))
        for citation in receipt["citations"]:
            self.assertNotIn("verified_at", citation)
            self.assertEqual(citation["evidence_status"], "caller_supplied_pinned_document")
            self.assertEqual(citation["local_validation"], "git_blob_integrity_only")

    def test_scores_change_when_real_source_depth_changes(self):
        first, _ = self.run_intake()
        score = next(s["score"] for s in first["skills"] if s["repo"] == REPO)
        self.data.write_text(json.dumps(self.dataset))
        self.receipt.unlink()
        skill = self.source / "skills/suede-review-brief/SKILL.md"
        skill.write_text(skill.read_text().split('# Sample')[0] + '# Sample\nBrief instructions.\n')
        self.commit()
        second, _ = self.run_intake()
        self.assertLess(next(s["score"] for s in second["skills"] if s["repo"] == REPO), score)

    def test_dirty_source_is_refused(self):
        (self.source / "skills/suede-review-brief/SKILL.md").write_text("uncommitted")
        self.assertIn("clean", self.run_intake(False).stderr)

    def test_missing_wrong_origin_and_revision_are_refused(self):
        self.git("remote", "set-url", "origin", "https://github.com/third-party/other.git")
        self.assertIn("origin", self.run_intake(False).stderr)
        self.git("remote", "set-url", "origin", f"https://github.com/{REPO}.git")
        self.revision = "b" * 40
        self.assertIn("revision", self.run_intake(False).stderr)
        self.source = self.base / "missing"
        self.run_intake(False)

    def test_traversal_scope_and_source_symlink_are_refused(self):
        self.scope["skill_roots"][REPO] = ["../outside"]
        self.scope_path.write_text(json.dumps(self.scope))
        self.run_intake(False)
        self.scope["skill_roots"][REPO] = ["skills"]
        self.scope_path.write_text(json.dumps(self.scope))
        (self.source / "skills/suede-review-brief/link").symlink_to(self.data)
        self.commit()
        self.assertIn("symlink", self.run_intake(False).stderr)

    def test_missing_scope_member_and_tampered_citation_are_refused(self):
        self.scope["skills"][REPO].append("missing")
        self.scope_path.write_text(json.dumps(self.scope))
        self.run_intake(False)
        self.scope["skills"][REPO].remove("missing")
        self.scope_path.write_text(json.dumps(self.scope))
        rows = json.loads(self.citations.read_text())
        rows[0]["content"] += "tampered"
        self.citations.write_text(json.dumps(rows))
        self.assertIn("blob", self.run_intake(False).stderr)

    def test_ignored_reference_cannot_change_committed_score_or_inventory(self):
        (self.source / ".gitignore").write_text("*.tmp\n")
        self.commit()
        baseline, first_receipt = self.run_intake()
        self.data.write_text(json.dumps(self.dataset))
        self.receipt.unlink()
        ignored = self.source / "skills/suede-review-brief/references/local.tmp"
        ignored.parent.mkdir()
        ignored.write_text("Uncommitted local reference must not earn points.\n")
        self.assertEqual(self.git("status", "--porcelain", "--untracked-files=all"), "")
        with_ignored, second_receipt = self.run_intake()
        before = next(s for s in baseline["skills"] if s["repo"] == REPO)
        after = next(s for s in with_ignored["skills"] if s["repo"] == REPO)
        self.assertEqual(before, after)
        self.assertEqual(first_receipt["source_files"], second_receipt["source_files"])
        self.assertNotIn("skills/suede-review-brief/references/local.tmp", second_receipt["source_files"])

    def test_existing_external_copy_is_refused_without_replacing_its_listing(self):
        import re
        body = (self.source / "skills/suede-review-brief/SKILL.md").read_text()
        self.dataset["skills"][0]["description"] = re.search(r"description: (.+)", body)[1]
        self.data.write_text(json.dumps(self.dataset))
        self.assertIn("copy", self.run_intake(False).stderr)

    def test_existing_exclusion_still_stops_intake(self):
        exclusions = {"skills": [{"id": f"{REPO}/suede-review-brief", "reason": "fixture removal"}]}
        (self.project / "directory/exclusions.json").write_text(json.dumps(exclusions))
        self.assertIn("curator policies", self.run_intake(False).stderr)

    def test_unaccepted_vendorable_source_is_not_ingested(self):
        target = self.source / "vendorable/other/SKILL.md"
        target.parent.mkdir(parents=True)
        target.write_text((self.source / "skills/suede-review-brief/SKILL.md").read_text().replace("name: suede-review-brief", "name: other"))
        self.commit()
        output, _ = self.run_intake()
        self.assertEqual([s["name"] for s in output["skills"] if s["repo"] == REPO], ["suede-review-brief"])


if __name__ == "__main__":
    unittest.main()
