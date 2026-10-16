"""The Suede Skill Check that grades the Agent Skills Directory.

scripts/directory/grade.py decides which third-party skills are listed and
which grade their badge shows, so a phrasing it misreads costs an author a
grade. These pin the description phrasings real skills use.
"""

import importlib.util
import os
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault("SUEDE_DIRECTORY_DATE", "2026-10-16")
SPEC = importlib.util.spec_from_file_location("directory_grade", ROOT / "scripts/directory/grade.py")
grade = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(grade)


def record(description, **overrides):
    base = {
        "fm_error": None,
        "name": "sample-skill",
        "folder": "sample-skill",
        "description": description,
        "body_lines": 120,
        "fm_license": "MIT",
        "repo_license": "MIT",
        "commit_date": "2026-10-01T00:00:00+00:00",
    }
    base.update(overrides)
    return base


class DescriptionTriggerTests(unittest.TestCase):
    def test_trigger_phrasings_used_by_published_skills_pass(self):
        phrasings = [
            "This skill should be used whenever a user wants to create a new Angular application.",
            "This skill should be used when the user asks to plan a database migration.",
            "This skill should be used for evaluating retrieval quality in RAG systems.",
            "Use this skill for loading and transforming Hugging Face datasets.",
            "Use this skill to evaluate a Google Cloud workload against the security pillar.",
            "Use this skill when reviewing pull requests for performance regressions.",
            "Use when planning a new article from a target keyword.",
            "Use for auditing Terraform modules before a release.",
            "Use only when another skill directs you to the shared workflow.",
            "Generates release notes. Triggers on 'changelog' or 'release notes'.",
        ]
        for text in phrasings:
            with self.subTest(text=text):
                self.assertTrue(grade.run_checks(record(text))["description_trigger"])

    def test_a_description_with_no_trigger_fails(self):
        self.assertFalse(grade.run_checks(record("Google Chat: manage Chat spaces and messages."))["description_trigger"])

    def test_all_checks_pass_for_a_well_formed_skill(self):
        checks = grade.run_checks(record("Use this skill to draft a launch checklist for a mobile app release."))
        self.assertTrue(all(checks.values()), checks)
        self.assertEqual(grade.grade(checks), "A")


class LicenseCheckTests(unittest.TestCase):
    def test_unknown_frontmatter_license_with_no_license_file_fails(self):
        checks = grade.run_checks(record("Use when drafting a press release for a launch.", fm_license="Unknown", repo_license=None))
        self.assertFalse(checks["license"])

    def test_license_file_alone_passes(self):
        checks = grade.run_checks(record("Use when drafting a press release for a launch.", fm_license=None, repo_license="Apache-2.0"))
        self.assertTrue(checks["license"])


CURATE_SRC = (ROOT / "scripts/directory/curate.py").read_text(encoding="utf-8")


def load_policy():
    namespace = {"__file__": str(ROOT / "scripts/directory/curate.py")}
    exec(compile(CURATE_SRC[: CURATE_SRC.index("def main():")], "curate.py", "exec"), namespace)
    return namespace["policy_rule"]


class ListingPolicyTests(unittest.TestCase):
    """The methodology page says Suede's own pack passes the rules it applies."""

    @classmethod
    def setUpClass(cls):
        import yaml

        cls.policy_rule = staticmethod(load_policy())
        cls.yaml = yaml

    def test_suede_skills_pass_the_directory_listing_policy(self):
        failures = []
        for path in sorted((ROOT / "skills").glob("*/SKILL.md")):
            text = path.read_text(encoding="utf-8")
            front = self.yaml.safe_load(text.split("---", 2)[1])
            record = {
                "name": front.get("name"),
                "description": str(front.get("description")),
                "repo": "JasonColapietro/suede-creator-skills",
                "captcha_files": any("captcha" in f.name.lower() for f in path.parent.rglob("*")),
            }
            rule = self.policy_rule(record)
            if rule:
                failures.append(f"{path.parent.name}: {rule}")
        self.assertEqual(failures, [])

    def test_policy_catches_the_behaviors_it_publishes(self):
        cases = {
            "x-keyword-comment": "X (Twitter) keyword-based reply posting: search tweets by keyword and post replies.",
            "reddit-fetch": "Fetch content from Reddit. Use when Reddit returns 403/blocked errors.",
            "engager-export": "Pull the people who liked or commented on LinkedIn posts. Powered by Apify.",
            "maps-contacts": "Extracts business contact emails and phones from Google Maps listings.",
        }
        for name, description in cases.items():
            with self.subTest(name=name):
                self.assertIsNotNone(self.policy_rule({"name": name, "description": description, "repo": "someone/skills"}))

    def test_a_stated_safeguard_is_not_read_as_the_behavior(self):
        record = {"name": "prospecting", "description": "Build a prospect list from licensed providers, and never scrape LinkedIn.", "repo": "someone/skills"}
        self.assertIsNone(self.policy_rule(record))


if __name__ == "__main__":
    unittest.main()
