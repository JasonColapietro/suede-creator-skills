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
    def curate(self, scopes, exclusions=None, extra_records=(), roots=None, citations=None, language_exceptions=None, paths=None):
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
                "inclusions": {"repositories": ["publisher/skills"], "skills": scopes, "skill_roots": roots or {}, "citations": citations or {}, "language_exceptions": language_exceptions or {}, "skill_paths": paths or {}},
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
            for name in ("scripts/build-directory.mjs", "scripts/directory/installs.mjs", "scripts/directory/applications.mjs", "scripts/directory/pixel-icons.mjs", "scripts/directory/badges.mjs",
                         "scripts/directory/featured.mjs", "scripts/directory/editorial.mjs", "scripts/directory/editorial-ratings.mjs", "scripts/directory/metadata.mjs", "scripts/directory/check-client.js", "directory/featured-projects.json",
                         "scripts/directory/task-pages.mjs", "scripts/directory/versus.mjs", "directory/task-pages.json", "scripts/directory/topics.mjs", "scripts/directory/facets.mjs", "scripts/directory/listed-since.mjs", "directory/topics.json",
                         "directory/categories.json", "directory/notes.json",
                         "directory/promotion.json", "directory/services-cta.json", "docs/llms.txt"):
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

    def test_reviewed_citation_adds_one_point_without_changing_discovery_or_other_repositories(self):
        evidence = {"source": "community/awesome-skills", "commit": "a" * 40,
                    "path": "docs/list.md", "target": "https://github.com/publisher/skills",
                    "verified_at": "2026-10-17"}
        baseline = self.curate({})
        credited = self.curate({}, citations={"publisher/skills": [evidence]})
        self.assertEqual(credited["sources"], baseline["sources"])
        self.assertEqual(credited["repos"]["publisher/skills"]["supplementary_citations"], [evidence])
        self.assertEqual(credited["repos"]["publisher/skills"]["lists"], [evidence["source"]])
        for before, after in zip(baseline["skills"], credited["skills"]):
            self.assertEqual(after["score"] - before["score"], int(after["repo"] == "publisher/skills"))
        raw = {**record("publisher/skills", "cited-already"), "lists": ["Community_awesome-skills"]}
        once = self.curate({}, extra_records=(raw,), citations={"publisher/skills": [evidence]})
        self.assertEqual(len(once["repos"]["publisher/skills"]["lists"]), 1)

    def test_reviewed_major_scopes_withhold_policy_and_demonstration_skills(self):
        accepted = json.loads((ROOT / "directory/inclusions.json").read_text())
        cases = [
            ("apify/agent-skills", "apify-ultimate-scraper", "skills/apify-ultimate-scraper",
             "apify-actor-development", "skills/apify-actor-development"),
            ("aws/agent-toolkit-for-aws", "aws-social-messaging", "skills/specialized-skills/customer-communications-skills/aws-social-messaging",
             "aws-serverless", "skills/core-skills/aws-serverless"),
            ("anthropics/claude-plugins-official", "example-command", "plugins/example-plugin/skills/example-command",
             "agent-development", "plugins/plugin-dev/skills/agent-development"),
        ]
        candidates = []
        for repo, withheld, withheld_path, public, public_path in cases:
            # Deliberately well-formed, neutral metadata: reviewed name scope
            # must still hold these entries if upstream wording changes.
            candidates.extend({**record(repo, name), "dir": path}
                              for name, path in ((withheld, withheld_path), (public, public_path)))
        data = self.curate(accepted["skills"], extra_records=candidates, roots=accepted["skill_roots"])
        for repo, withheld, _, public, _ in cases:
            with self.subTest(repo=repo):
                self.assertEqual({s["name"] for s in data["skills"] if s["repo"] == repo}, {public})
                self.assertGreaterEqual(data["repos"][repo]["withheld"], 1)
                self.assertTrue(data["repos"][repo]["scoped_install"])

    def test_refresh_keeps_recorded_source_revision_without_inventing_legacy_revisions(self):
        revised = {**record("revision-publisher/skills", "recorded-skill"), "commit_sha": "a" * 40}
        data = self.curate({}, extra_records=(revised,))
        self.assertEqual(data["repos"]["revision-publisher/skills"]["commit_sha"], "a" * 40)
        self.assertNotIn("commit_sha", data["repos"]["publisher/skills"])

    def test_dual_license_choice_is_an_open_license(self):
        dual = {**record("dual-publisher/skills", "dual-skill"),
                "fm_license": None, "repo_license": "Apache-2.0 OR MIT", "license_file": "LICENSE-APACHE"}
        data = self.curate({}, extra_records=(dual,))
        skill = next(s for s in data["skills"] if s["repo"] == "dual-publisher/skills")
        self.assertEqual(skill["license"], "Apache-2.0 OR MIT")
        self.assertTrue(skill["open_license"])

    def test_apache_space_version_label_keeps_its_open_license_and_source_revision(self):
        revised = {**record("license-publisher/skills", "reviewed-skill"),
                   "fm_license": "Apache 2.0", "repo_license": "Apache-2.0",
                   "commit_sha": "a" * 40}
        data = self.curate({}, extra_records=(revised,))
        skill = next(s for s in data["skills"] if s["repo"] == "license-publisher/skills")
        self.assertEqual(skill["license"], "Apache-2.0")
        self.assertTrue(skill["open_license"])
        self.assertEqual(data["repos"]["license-publisher/skills"]["commit_sha"], "a" * 40)

    def test_reviewed_hidden_distribution_root_still_excludes_fixtures(self):
        root = ".github/plugins/published/skills"
        public = {**record("reviewed/skills", "public-skill"), "dir": root + "/public-skill"}
        fixture = {**record("reviewed/skills", "fixture-skill"), "dir": root + "/tests/fixture-skill"}
        outside = {**record("reviewed/skills", "outside-skill"), "dir": "unreviewed/outside-skill"}
        plain = self.curate({}, extra_records=(public, fixture))
        self.assertFalse(any(s["repo"] == "reviewed/skills" for s in plain["skills"]))
        reviewed = self.curate({}, extra_records=(public, fixture, outside), roots={"reviewed/skills": [root]})
        self.assertEqual([s["name"] for s in reviewed["skills"] if s["repo"] == "reviewed/skills"], ["public-skill"])

    def test_named_scope_never_offers_whole_repository_install_even_when_all_current_names_pass(self):
        names = ["accepted-one", "accepted-two", "not-requested", "future-skill"]
        scoped = self.curate({"publisher/skills": names})
        self.assertEqual(scoped["repos"]["publisher/skills"]["withheld"], 0)
        self.assertNotIn("Install every skill", self.repository_page(scoped))
        self.assertIn("Install every skill", self.repository_page(self.curate({})))

    def test_same_day_refresh_rotates_snapshot_even_when_skill_data_is_unchanged(self):
        first, second = self.curate({}), self.curate({})
        self.assertRegex(first['snapshot_id'], r'^[a-f0-9]{32}$')
        self.assertNotEqual(first.pop('snapshot_id'), second.pop('snapshot_id'))
        self.assertEqual(first, second)

    def test_listing_gate_is_structural_and_scores_come_from_published_fields(self):
        six = {**record("other/skills", "six-of-seven"), "folder": "renamed"}
        five = {**record("other/skills", "five-of-seven"), "folder": "renamed", "body_lines": 600}
        data = self.curate({}, extra_records=[six, five])
        self.assertEqual(data["score_method"], "graded-v2")
        by_name = {s["name"]: s for s in data["skills"]}
        self.assertNotIn("five-of-seven", by_name)
        # 7 checks x 8, description 50-99 chars 1, 100 body words 1, commit on the snapshot day 9.
        self.assertEqual({(s["score"], s["grade"]) for n, s in by_name.items() if n != "six-of-seven"}, {(67, "D")})
        # Six of seven stays listed below 80, but only all seven earn a page.
        self.assertEqual((by_name["six-of-seven"]["score"], by_name["six-of-seven"]["grade"]), (59, "D"))
        self.assertNotIn("featured", by_name["six-of-seven"])
        self.assertTrue(by_name["existing-skill"]["featured"])

    def test_language_exception_is_exact_scoped_and_preserves_checks_and_source(self):
        repo, name = "korey2028-prog/resume-claim-guard", "resume-claim-guard"
        chinese = "在准备简历和面试材料时使用。确认候选人的实际职责、交付阶段和证据，不编造指标或经历。" * 3
        accepted = {**record(repo, name), "dir": ".", "description": chinese}
        exceptions = {repo: [{"name": name, "path": ".",
                             "approval": "https://github.com/JasonColapietro/suede-creator-skills/issues/374#issuecomment-6779995466"}]}
        alternatives = [accepted, {**accepted, "dir": "copies/skill"},
                        {**accepted, "repo": "other/language-skill"},
                        {**accepted, "name": "future-skill", "folder": "future-skill"}]
        baseline = self.curate({repo: [name]}, extra_records=alternatives)
        self.assertFalse(any(s["repo"] == repo for s in baseline["skills"]))
        scoped = self.curate({repo: [name]}, extra_records=alternatives, language_exceptions=exceptions)
        matches = [s for s in scoped["skills"] if s["repo"] == repo]
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["dir"], ".")
        self.assertEqual(matches[0]["description"], chinese)
        self.assertEqual(matches[0]["checks"][4], "0", "English trigger detector is not rewritten")
        self.assertFalse(any(s["repo"] == "other/language-skill" for s in scoped["skills"]))
        for extra, exclusions in [([{**accepted, "body_lines": 600}], None),
                                  ([accepted], {"skills": [repo + "/" + name]})]:
            blocked = self.curate({repo: [name]}, exclusions, extra_records=extra, language_exceptions=exceptions)
            self.assertFalse(any(s["repo"] == repo for s in blocked["skills"]))
        # An exception does not create an acceptance scope by itself.
        unaccepted = self.curate({}, extra_records=[accepted], language_exceptions=exceptions)
        self.assertFalse(any(s["repo"] == repo for s in unaccepted["skills"]))

    def test_exact_root_acceptance_rejects_english_same_name_harness_copies(self):
        repo, name = "korey2028-prog/resume-claim-guard", "resume-claim-guard"
        root = {**record(repo, name), "dir": "."}
        mirror = {**root, "dir": ".claude/skills/resume-claim-guard"}
        data = self.curate({repo: [name]}, extra_records=[root, mirror], paths={repo: ["."]})
        matches = [s for s in data["skills"] if s["repo"] == repo]
        self.assertEqual([s["dir"] for s in matches], ["."])

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
