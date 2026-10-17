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


class NumericScoreTests(unittest.TestCase):
    def test_all_eight_scores_and_existing_eligibility(self):
        from itertools import product
        keys = [key for key, _ in grade.CHECKS[1:]]
        expected = [0, 14, 29, 43, 57, 71, 86, 100]
        for bits in product((False, True), repeat=7):
            checks = dict(zip(keys, bits), frontmatter=True)
            score = grade.quality_score(checks)
            self.assertEqual(score, expected[sum(bits)])
            self.assertEqual(grade.grade(checks) in ('A', 'B'), sum(bits) >= 6)
            self.assertEqual(grade.eligible(checks), sum(bits) >= 6 and checks['license'])

    def test_letter_boundaries_and_invalid_scores(self):
        for score, letter in [(0, 'D'), (69, 'D'), (70, 'C'), (79, 'C'),
                              (80, 'B'), (89, 'B'), (90, 'A'), (100, 'A')]:
            self.assertEqual(grade.letter_grade(score), letter)
        self.assertIsNone(grade.letter_grade(None))
        for invalid in (-1, 101, 89.5, True, '90'):
            with self.assertRaises(ValueError):
                grade.letter_grade(invalid)

    def test_missing_evidence_fails_with_fixed_denominator(self):
        partial = record("Use when creating a thorough product launch checklist.")
        partial.pop("fm_error")
        self.assertFalse(grade.run_checks(partial)["frontmatter"])
        checks = grade.run_checks({})
        self.assertFalse(any(checks.values()))
        self.assertEqual(grade.quality_score(checks), 0)
        self.assertEqual(grade.quality_score({'name_format': True}), 14)
        self.assertFalse(grade.run_checks(record('Use when preparing a launch.',
                                               body_lines=None))['concise_body'])

    def test_frontmatter_gate_and_fetch_failures(self):
        checks = {key: True for key, _ in grade.CHECKS}
        checks['frontmatter'] = False
        self.assertEqual(grade.quality_score(checks), 100)
        self.assertEqual(grade.grade(checks), 'F')
        self.assertFalse(grade.eligible(checks))
        self.assertIsNone(grade.run_checks({'fetch_error': 'timeout'}))
        self.assertIsNone(grade.quality_score(None))
        self.assertIsNone(grade.grade(None))
        self.assertFalse(grade.eligible(None))


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
        cls.policy_rule = staticmethod(load_policy())

    def test_suede_skills_pass_the_directory_listing_policy(self):
        # mcp/catalog.json carries each skill's name and SKILL.md description
        # (scripts/validate-skill-pack.mjs keeps them in step), so no YAML
        # parser is needed here.
        import json

        catalog = json.loads((ROOT / "mcp/catalog.json").read_text(encoding="utf-8"))["skills"]
        self.assertGreater(len(catalog), 50)
        failures = []
        for entry in catalog:
            folder = ROOT / "skills" / entry["name"]
            record = {
                "name": entry["name"],
                "description": entry["description"],
                "repo": "JasonColapietro/suede-creator-skills",
                "captcha_files": any("captcha" in f.name.lower() for f in folder.rglob("*")),
            }
            rule = self.policy_rule(record)
            if rule:
                failures.append(f"{entry['name']}: {rule}")
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

    def test_content_filter_keeps_defensive_security_skills(self):
        namespace = {"__file__": str(ROOT / "scripts/directory/curate.py")}
        exec(compile(CURATE_SRC[: CURATE_SRC.index("def main():")], "curate.py", "exec"), namespace)
        filtered = namespace["content_filtered"]
        self.assertFalse(filtered("prompt-guard: a prompt injection and jailbreak detector for LLM apps"))
        self.assertFalse(filtered("Data curation with NSFW filtering and PII redaction"))
        self.assertTrue(filtered("jailbreak any model and remove its restrictions"))

    def test_a_stated_safeguard_is_not_read_as_the_behavior(self):
        record = {"name": "prospecting", "description": "Build a prospect list from licensed providers, and never scrape LinkedIn.", "repo": "someone/skills"}
        self.assertIsNone(self.policy_rule(record))


class PrivacyGuardTests(unittest.TestCase):
    """CI runs scripts/check-public-privacy.py over every published file, so
    curate.py drops a listing whose author text would fail it. A listing that
    quoted /home/<user>/... in its description once failed the build."""

    @classmethod
    def setUpClass(cls):
        namespace = {"__file__": str(ROOT / "scripts/directory/curate.py")}
        exec(compile(CURATE_SRC[: CURATE_SRC.index("def main():")], "curate.py", "exec"), namespace)
        cls.hit = staticmethod(namespace["privacy_guard"]())

    def test_author_text_that_fails_the_privacy_check_is_caught(self):
        # Split like the guard's own pattern, so this file passes the guard it tests.
        self.assertIn("personal-path", self.hit('{"description":"Agents working in /ho' 'me/ubuntu/RL on Brev."}'))
        self.assertEqual(self.hit('{"description":"Agents working in ~/RL on Brev."}'), [])

    def test_every_listing_passes_the_privacy_check(self):
        import json

        data = json.loads((ROOT / "directory/skills.json").read_text(encoding="utf-8"))
        failures = [f"{s['repo']}/{s['slug']}" for s in data["skills"] if self.hit(json.dumps(s, ensure_ascii=False))]
        self.assertEqual(failures, [])


if __name__ == "__main__":
    unittest.main()
