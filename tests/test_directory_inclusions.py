"""Accepted requests can cover selected skills without accepting a whole repository."""

import json
import os
import shutil
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
    def curate(self, scopes, exclusions=None, extra_records=()):
        with tempfile.TemporaryDirectory(prefix="directory-inclusions-") as tmp:
            work = Path(tmp)
            records = [record("publisher/skills", name) for name in
                       ("accepted-one", "accepted-two", "not-requested", "future-skill")]
            records.append(record("other/skills", "existing-skill"))
            records.extend(extra_records)
            labels = {f"{r['repo']}/{r['name']}": {
                "category": "writing-content", "summary": r["description"]} for r in records
                if r.get("description")}
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

    def repository_page(self, data):
        with tempfile.TemporaryDirectory(prefix="directory-scoped-install-") as tmp:
            work = Path(tmp)
            for name in ("scripts/build-directory.mjs", "scripts/directory/badges.mjs",
                         "scripts/directory/featured.mjs", "directory/featured-projects.json",
                         "directory/categories.json", "directory/notes.json",
                         "directory/promotion.json", "docs/llms.txt"):
                target = work / name
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(ROOT / name, target)
            shutil.copytree(ROOT / "scripts/directory/badges", work / "scripts/directory/badges")
            (work / "scripts/lib").mkdir()
            (work / "directory/skills.json").write_text(json.dumps(data))
            result = subprocess.run(["node", str(work / "scripts/build-directory.mjs")],
                                    text=True, capture_output=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            return (work / "docs/directory/publisher/skills/index.html").read_text()

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

    def test_excluded_out_of_scope_skills_are_counted_once_across_harness_copies(self):
        duplicate = record("Publisher/Skills", "not-requested")
        duplicate["dir"] = ".claude/skills/not-requested"
        data = self.curate({"Publisher/Skills": ["accepted-one", "accepted-two"]},
                           {"skills": [{"id": "PUBLISHER/SKILLS/not-requested", "reason": "Removed by author."}]},
                           [duplicate])
        self.assertEqual(data["repos"]["publisher/skills"]["withheld"], 2)
        self.assertEqual({s["name"] for s in data["skills"]},
                         {"accepted-one", "accepted-two", "existing-skill"})

    def test_only_unaccepted_skill_is_excluded_and_blocks_repository_install(self):
        exclusions = {"skills": ["publisher/skills/future-skill"]}
        scoped = self.curate({"publisher/skills": ["accepted-one", "accepted-two", "not-requested"]},
                             exclusions)
        page = self.repository_page(scoped)
        bulk_command = "npx skills add https://github.com/publisher/skills</code>"
        self.assertNotIn("Install every skill", page)
        self.assertNotIn(bulk_command, page)
        self.assertEqual(scoped["repos"]["publisher/skills"]["withheld"], 1)
        self.assertEqual({s["name"] for s in scoped["skills"]},
                         {"accepted-one", "accepted-two", "not-requested", "existing-skill"})
        # Positive control: the builder still offers bulk installation when
        # every skill is accepted and no exclusion applies.
        complete_page = self.repository_page(self.curate({}))
        self.assertIn("Install every skill", complete_page)
        self.assertIn(bulk_command, complete_page)

    def test_unavailable_out_of_scope_skill_still_blocks_repository_install(self):
        unavailable = {"repo": "publisher/skills", "name": "unavailable-skill",
                       "fetch_error": "Source could not be fetched"}
        scopes = {"publisher/skills": ["accepted-one", "accepted-two", "not-requested", "future-skill"]}
        data = self.curate(scopes, {"skills": ["publisher/skills/unavailable-skill"]},
                           [unavailable, {"fetch_error": "Source could not be fetched"}])
        self.assertEqual(data["repos"]["publisher/skills"]["withheld"], 1)
        self.assertNotIn("unavailable-skill", {s["name"] for s in data["skills"]})

    def test_removal_overrides_prior_scope_for_repository_install(self):
        scopes = {"publisher/skills": ["accepted-one", "accepted-two", "not-requested", "future-skill"]}
        data = self.curate(scopes, {"skills": ["publisher/skills/accepted-two"]})
        page = self.repository_page(data)
        self.assertNotIn("npx skills add https://github.com/publisher/skills</code>", page)
        self.assertEqual(data["repos"]["publisher/skills"]["withheld"], 1)
        self.assertEqual({s["name"] for s in data["skills"]},
                         {"accepted-one", "not-requested", "future-skill", "existing-skill"})


if __name__ == "__main__":
    unittest.main()
