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
        self.assertTrue(grade.all_checks_pass(checks) and grade.structural_pass(checks))


GENERATED = "2026-10-17"


def listing(checks="10000000", description="", words=0, kinds="", commit_date="2020-01-01", lists=(), **extra):
    """A published-shape record and its repository meta; the defaults earn no points."""
    rec = {"repo": "someone/skills", "slug": "sample", "checks": checks, "description": description,
           "size": [10, words, 1], "kinds": kinds, **extra}
    return rec, {"commit_date": commit_date, "lists": list(lists)}


def score(**kw):
    rec, repo = listing(**kw)
    return grade.quality_score(rec, repo, GENERATED)


def signal(text):
    """Points a description earns beyond its length band."""
    return score(description=text) - score(description="x" * len(text))


def days_ago(n):
    import datetime as dt
    return (dt.date.fromisoformat(GENERATED) - dt.timedelta(days=n)).isoformat()


class GradedScoreTests(unittest.TestCase):
    def test_no_signals_scores_zero_and_every_signal_is_capped_at_99(self):
        self.assertEqual(score(), 0)
        desc = 'Use when drafting release notes, e.g. "summarize this diff". Not for marketing copy. ' * 2
        best = dict(checks="11111111", description=desc, words=1200, kinds="rsa", commit_date=GENERATED,
                    lists=["a", "b", "c", "d"], allowed_tools="Read Bash", compatibility="Claude Code")
        self.assertTrue(150 <= len(desc) <= 600)
        self.assertEqual(score(**best), 99, "raw maximum is 100; the scale tops out at 99")
        self.assertEqual(grade.letter_grade(score(**best)), "A")
        best.pop("compatibility")
        self.assertEqual(score(**best), 98)

    def test_each_graded_check_is_worth_eight_and_frontmatter_none(self):
        self.assertEqual(score(checks="00000000"), 0)
        for i in range(1, 8):
            with self.subTest(check=grade.CHECKS[i][0]):
                self.assertEqual(score(checks="1" + "0" * (i - 1) + "1" + "0" * (7 - i)), 8)
        self.assertEqual(score(checks="11111111"), 56)
        self.assertEqual(score(checks="01111111"), 56)

    def test_description_length_bands_count_code_points(self):
        for n, pts in [(0, 0), (49, 0), (50, 1), (99, 1), (100, 3), (149, 3), (150, 5), (600, 5),
                       (601, 3), (900, 3), (901, 1), (1024, 1), (1025, 0)]:
            with self.subTest(n=n):
                self.assertEqual(score(description="x" * n), pts)
        # Code points, not UTF-16 units: JavaScript must use [...desc].length.
        self.assertEqual(score(description="\U0001F600" * 150), 5)

    def test_boundary_clause_hits_and_misses(self):
        for text in ["Not for billing.", "NOT FOR: invoices", "Do not use on prod.", "Don't use for drafts.",
                     "dont use for drafts", "Not intended for clinical use.", "Use the pdf skill instead.",
                     "For big files use a streaming parser instead"]:
            with self.subTest(text=text):
                self.assertEqual(signal(text), 4)
        for text in ["Notable for speed.", "Do not user-test.", "Use it. Instead, try the CLI.",
                     "Cannot format.", "Use " + "x" * 61 + " instead"]:
            with self.subTest(text=text):
                self.assertEqual(signal(text), 0)

    def test_example_phrase_hits_and_misses(self):
        for text in ['Try "make a chart".', "Say \u201cdraft a tweet\u201d.", "Triggers on 'release notes'.",
                     "Say \u2018fix it now\u2019.", '"abc"', '"' + "x" * 60 + '"',
                     "when the user says 'let's work on a track.'", 'says "my Newton iterations aren\'t converging."']:
            with self.subTest(text=text):
                self.assertEqual(signal(text), 3)
        for text in ['"ab"', '"' + "x" * 61 + '"', 'An "unclosed quote', "Don't panic.", "No quotes at all",
                     "It doesn't fit the user's needs.", "it's working, what's next", "a 'quote'd word"]:
            with self.subTest(text=text):
                self.assertEqual(signal(text), 0)

    def test_body_word_bands(self):
        for w, pts in [(0, 0), (99, 0), (100, 1), (249, 1), (250, 4), (499, 4), (500, 7), (3000, 7),
                       (3001, 4), (4500, 4), (4501, 1), (100000, 1)]:
            with self.subTest(words=w):
                self.assertEqual(score(words=w), pts)

    def test_reference_and_script_files(self):
        for kinds, pts in [("", 0), ("a", 0), ("r", 3), ("s", 2), ("rs", 5), ("rsa", 5)]:
            with self.subTest(kinds=kinds):
                self.assertEqual(score(kinds=kinds), pts)

    def test_recency_boundary_days(self):
        for n, pts in [(-3, 9), (0, 9), (30, 9), (31, 6), (90, 6), (91, 3), (180, 3), (181, 1),
                       (365, 1), (366, 0), (2000, 0)]:
            with self.subTest(days=n):
                self.assertEqual(score(commit_date=days_ago(n)), pts)
        self.assertEqual(score(commit_date=days_ago(30) + "T23:59:59+00:00"), 9, "whole calendar days")

    def test_adoption_bands(self):
        for n, pts in [(0, 0), (1, 1), (2, 3), (3, 4), (4, 7), (8, 7)]:
            with self.subTest(lists=n):
                self.assertEqual(score(lists=[f"list-{i}" for i in range(n)]), pts)

    def test_declared_tools_and_compatibility(self):
        self.assertEqual(score(allowed_tools="Read"), 2)
        self.assertEqual(score(compatibility="Requires Python 3.11"), 2)
        self.assertEqual(score(allowed_tools="Read", compatibility="Claude Code"), 4)
        self.assertEqual(score(allowed_tools="", compatibility=None), 0)

    def test_unscored_and_invalid_inputs(self):
        self.assertIsNone(grade.quality_score(None, None, GENERATED))
        rec, repo = listing()
        for bad in (None, "", "2026-10", "20261017", "2026-1-17", "2026-02-30", "2026-13-01", "yesterday"):
            with self.subTest(date=bad), self.assertRaises(ValueError):
                grade.quality_score(rec, repo, bad)
            with self.subTest(commit_date=bad), self.assertRaises(ValueError):
                grade.quality_score(rec, {**repo, "commit_date": bad}, GENERATED)
        with self.assertRaises(ValueError):
            grade.quality_score(rec, None, GENERATED)
        for checks in (None, "1111111", "111111111", "1111111x"):
            with self.subTest(checks=checks), self.assertRaises(ValueError):
                grade.quality_score({**rec, "checks": checks}, repo, GENERATED)
        with self.assertRaises(ValueError):
            grade.quality_score({**rec, "size": [10]}, repo, GENERATED)


class ListingGateTests(unittest.TestCase):
    def test_structural_pass_is_six_of_seven_plus_frontmatter(self):
        from itertools import product
        keys = [key for key, _ in grade.CHECKS[1:]]
        for fm in (False, True):
            for bits in product((False, True), repeat=7):
                checks = dict(zip(keys, bits), frontmatter=fm)
                text = "".join("1" if checks[k] else "0" for k, _ in grade.CHECKS)
                self.assertEqual(grade.structural_pass(checks), fm and sum(bits) >= 6)
                self.assertEqual(grade.structural_pass(text), fm and sum(bits) >= 6)
                self.assertEqual(grade.all_checks_pass(checks), fm and all(bits))
                self.assertEqual(grade.all_checks_pass(text), fm and all(bits))
                self.assertEqual(grade.eligible(checks), fm and sum(bits) >= 6 and checks["license"])
        self.assertFalse(grade.structural_pass(None))
        self.assertFalse(grade.eligible(None))

    def test_a_six_of_seven_skill_stays_listed_whatever_its_score(self):
        checks = grade.run_checks(record("Use when drafting a launch checklist for a mobile app.", folder="other"))
        self.assertFalse(checks["name_matches_folder"])
        self.assertTrue(grade.structural_pass(checks) and grade.eligible(checks))
        self.assertFalse(grade.all_checks_pass(checks))
        low = score(checks="11011111")
        self.assertEqual(low, 48)
        self.assertEqual(grade.grade(checks, low), "D")

    def test_letter_boundaries_and_invalid_scores(self):
        for value, letter in [(0, 'D'), (69, 'D'), (70, 'C'), (79, 'C'),
                              (80, 'B'), (89, 'B'), (90, 'A'), (99, 'A')]:
            self.assertEqual(grade.letter_grade(value), letter)
        self.assertIsNone(grade.letter_grade(None))
        for invalid in (-1, 100, 101, 89.5, True, '90'):
            with self.assertRaises(ValueError):
                grade.letter_grade(invalid)

    def test_frontmatter_gate_and_fetch_failures(self):
        checks = {key: True for key, _ in grade.CHECKS}
        checks['frontmatter'] = False
        self.assertEqual(grade.grade(checks, 95), 'F')
        self.assertFalse(grade.structural_pass(checks))
        self.assertFalse(grade.eligible(checks))
        self.assertIsNone(grade.run_checks({'fetch_error': 'timeout'}))
        self.assertIsNone(grade.grade(None, None))

    def test_missing_evidence_fails_checks(self):
        partial = record("Use when creating a thorough product launch checklist.")
        partial.pop("fm_error")
        self.assertFalse(grade.run_checks(partial)["frontmatter"])
        self.assertFalse(any(grade.run_checks({}).values()))
        self.assertFalse(grade.run_checks(record('Use when preparing a launch.',
                                               body_lines=None))['concise_body'])


class PublishedScoreTests(unittest.TestCase):
    """directory/skills.json carries the current method's scores (scripts/directory/rescore.py)."""

    def test_every_listing_carries_its_recomputed_score(self):
        import json

        data = json.loads((ROOT / "directory/skills.json").read_text(encoding="utf-8"))
        self.assertEqual(data["score_method"], grade.SCORE_METHOD)
        stale = [f"{s['repo']}/{s['slug']}" for s in data["skills"]
                 if s["score"] != grade.quality_score(s, data["repos"][s["repo"]], data["generated"])
                 or s["grade"] != grade.letter_grade(s["score"]) or not grade.structural_pass(s["checks"])]
        self.assertEqual(stale, [])
        self.assertLessEqual(max(s["score"] for s in data["skills"]), 99)


class RescoreTests(unittest.TestCase):
    def run_rescore(self, data):
        import json, subprocess, sys, tempfile

        spec = importlib.util.spec_from_file_location("directory_curate", ROOT / "scripts/directory/curate.py")
        curate = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(curate)
        with tempfile.TemporaryDirectory(prefix="directory-rescore-") as tmp:
            path = Path(tmp) / "skills.json"
            before = curate.dataset_text(data)
            path.write_text(before, encoding="utf-8")
            result = subprocess.run([sys.executable, "-I", str(ROOT / "scripts/directory/rescore.py"), str(path)],
                                    capture_output=True, text=True)
            return result, before, path.read_text(encoding="utf-8"), curate.dataset_text

    def dataset(self):
        rec, repo = listing(checks="11111111", description="Use when testing a rescore \u2014 caf\u00e9.", words=600,
                            commit_date=GENERATED, lists=["a/list"])
        rec.update(grade="A", score=100, security_scan_status="not_scanned")
        return {"generated": GENERATED, "snapshot_id": "a" * 32, "score_method": "seven-checks-v1",
                "sources": ["a/list"], "checks": [], "repos": {"someone/skills": repo}, "skills": [rec]}

    def test_rescore_changes_only_score_grade_method_and_snapshot(self):
        import json

        result, before, after, dataset_text = self.run_rescore(self.dataset())
        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(after)
        self.assertEqual(data["skills"][0]["score"], 56 + 7 + 9 + 1)
        self.assertEqual(data["skills"][0]["grade"], "C")
        self.assertEqual(data["score_method"], "graded-v2")
        self.assertRegex(data["snapshot_id"], r"^[a-f0-9]{32}$")
        self.assertNotEqual(data["snapshot_id"], "a" * 32)
        self.assertEqual(data["generated"], GENERATED)
        self.assertEqual(dataset_text(data), after, "curate.py's byte format")
        restored = {**data, "snapshot_id": "a" * 32, "score_method": "seven-checks-v1",
                    "skills": [{**data["skills"][0], "grade": "A", "score": 100}]}
        self.assertEqual(dataset_text(restored), before)

    def test_an_unscorable_record_stops_before_writing(self):
        data = self.dataset()
        data["skills"].append({**data["skills"][0], "slug": "orphan", "repo": "missing/repo"})
        result, before, after, _ = self.run_rescore(data)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("missing/repo/orphan", result.stderr)
        self.assertEqual(after, before)


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

    def test_reviewed_vendor_owner_keeps_social_account_and_personal_data_rules(self):
        record = {"name": "actor-development", "description": "Use when developing an Apify scraper service for your own project.", "repo": "apify/agent-skills"}
        self.assertIsNone(self.policy_rule(record))
        self.assertIsNotNone(self.policy_rule({**record, "repo": "someone/skills"}))
        self.assertIsNotNone(self.policy_rule({**record, "name": "reddit-automation", "description": "Use when sending messages on Reddit."}))
        self.assertIsNotNone(self.policy_rule({**record, "description": "Use when scraping LinkedIn profiles."}))

    def test_official_collections_do_not_exempt_third_party_integrations(self):
        self.assertIn("github", self.policy_rule.__globals__["OFFICIAL_OWNERS"])
        cases = [
            ("x-twitter-scraper", "Build GitHub Copilot workflows with Xquik X API SDKs, REST endpoints, hosted Apify Actor runs, MCP tools, TweetClaw OpenClaw plugin installs, signed webhooks, tweet search, user lookup, follower exports, media actions, and agent automation."),
            ("latchshot-page-capture", "Use this skill when a user needs a screenshot, website thumbnail, full-page capture, or PDF of a public HTTP(S) webpage saved as a local artifact through Latchshot, including report, QA, archive, and social-preview workflows. Do not use it for private or authenticated pages, raw HTML, scraping or extraction, arbitrary browser actions, CAPTCHA or anti-bot bypass, or local-file capture."),
        ]
        for repo in ("github/awesome-copilot", "anthropics/claude-plugins-official", "apify/community-integrations"):
            for name, description in cases:
                with self.subTest(repo=repo, name=name):
                    self.assertIsNotNone(self.policy_rule({"repo": repo, "name": name, "description": description}))

    def test_official_collections_do_not_exempt_file_or_body_signals(self):
        record = {"repo": "github/awesome-copilot", "name": "page-capture", "description": "Use when capturing a webpage screenshot."}
        self.assertIsNotNone(self.policy_rule({**record, "captcha_files": True}))
        self.assertIsNotNone(self.policy_rule({**record, "policy_text": "Use 2captcha to solve the challenge."}))
        self.assertIsNotNone(self.policy_rule({**record, "name": "scrape-page"}))

    def test_vendor_exemption_does_not_skip_personal_data_body_signals(self):
        record = {"repo": "apify/agent-skills", "name": "actor-development", "description": "Use when developing an Apify Actor.", "policy_text": "Run the example/twitter-scraper actor."}
        self.assertEqual(self.policy_rule(record), "collects people's personal data by scraping a social network or map listings")


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
