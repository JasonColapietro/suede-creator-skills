"""Accepted requests can cover selected skills without accepting a whole repository."""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def record(repo, name):
    return {
        "repo": repo, "name": name, "folder": name, "dir": f"skills/{name}",
        "description": f"Use when preparing a {name} workflow for a project and reviewing its results.",
        "fm_error": None, "fm_license": "MIT", "repo_license": "MIT", "license_file": "LICENSE",
        "commit_date": "2026-10-17T00:00:00+00:00", "branch": "main", "lists": [],
        "body_lines": 20, "body_words": 100, "file_count": 1,
        "has_references": False, "has_scripts": False, "has_assets": False,
        "allowed_tools": None, "compatibility": None, "headings": [], "files_sample": ["SKILL.md"],
    }


class DirectoryInclusionTests(unittest.TestCase):
    def curate(self, scopes, exclusions=None):
        with tempfile.TemporaryDirectory(prefix="directory-inclusions-") as tmp:
            work = Path(tmp)
            records = [record("publisher/skills", name) for name in
                       ("accepted-one", "accepted-two", "not-requested", "future-skill")]
            records.append(record("other/skills", "existing-skill"))
            labels = {f"{r['repo']}/{r['name']}": {
                "category": "writing-content", "summary": r["description"]} for r in records}
            inputs = {
                "raw": records, "labels": labels,
                "inclusions": {"repositories": ["publisher/skills"], "skills": scopes},
                "exclusions": exclusions or {},
            }
            for name, value in inputs.items():
                (work / f"{name}.json").write_text(json.dumps(value))
            result = subprocess.run(
                [sys.executable, "-I", str(ROOT / "scripts/directory/curate.py"),
                 *[arg for name in inputs for arg in (f"--{name}", str(work / f"{name}.json"))],
                 "--out", str(work / "out.json")],
                env={**os.environ, "SUEDE_DIRECTORY_DATE": "2026-10-17"},
                text=True, capture_output=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            return json.loads((work / "out.json").read_text())

    def test_scoped_acceptance_keeps_only_requested_skills_and_existing_classifications(self):
        data = self.curate({"Publisher/Skills": ["accepted-one", "accepted-two"]})
        self.assertEqual({s["name"] for s in data["skills"]},
                         {"accepted-one", "accepted-two", "existing-skill"})
        self.assertTrue(all(s["category"] == "writing-content" for s in data["skills"]))
        self.assertEqual(data["repos"]["publisher/skills"]["withheld"], 2,
                         "Whole-repository installs must be hidden when skills are outside the request.")
        self.assertEqual(data["repos"]["other/skills"]["withheld"], 0)

    def test_unscoped_repositories_keep_existing_behavior(self):
        data = self.curate({})
        self.assertEqual(len(data["skills"]), 5)
        self.assertEqual(data["repos"]["publisher/skills"]["withheld"], 0)

    def test_same_day_refresh_rotates_snapshot_even_when_skill_data_is_unchanged(self):
        first, second = self.curate({}), self.curate({})
        self.assertRegex(first['snapshot_id'], r'^[a-f0-9]{32}$')
        self.assertNotEqual(first.pop('snapshot_id'), second.pop('snapshot_id'))
        self.assertEqual(first, second)

    def test_acceptance_does_not_override_exclusions(self):
        data = self.curate({"publisher/skills": ["accepted-one", "accepted-two"]},
                           {"skills": [{"id": "publisher/skills/accepted-two", "reason": "Removed by author."}]})
        self.assertEqual({s["name"] for s in data["skills"]}, {"accepted-one", "existing-skill"})


if __name__ == "__main__":
    unittest.main()
