"""Supplementary citations need current, exact links and reproducible receipts."""
import copy
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("citations", ROOT / "scripts/directory/citations.py")
citations = importlib.util.module_from_spec(spec)
spec.loader.exec_module(citations)


class CitationTests(unittest.TestCase):
    def setUp(self):
        self.entry = {"source": "community/awesome", "commit": "a" * 40, "path": "docs/cloud.md",
                      "target": "https://github.com/publisher/skills", "verified_at": "2026-10-18"}
        self.inclusions = {"repositories": ["publisher/skills"],
                           "citations": {"publisher/skills": [self.entry]}}

    def test_refresh_records_current_revision_and_snapshot_date_without_mutating_input(self):
        with patch.object(citations, "current_revision", return_value="b" * 40), \
                patch.object(citations, "fetch_document", return_value="- [Skill](https://github.com/publisher/skills)"):
            result = citations.verify(self.inclusions, "2026-10-19")
        receipt = citations.receipts(result, "2026-10-19")["publisher/skills"][0]
        self.assertEqual(receipt["commit"], "b" * 40)
        self.assertEqual(self.entry["commit"], "a" * 40)
        with self.assertRaisesRegex(ValueError, "Reverify"):
            citations.receipts(result, "2026-10-20")

    def test_removed_links_and_lookalike_repositories_fail_closed(self):
        for body in ("removed", "[Wrong](https://github.com/publisher/skills-other)",
                     "[Wrong](https://github.com/publisher/skills/blob/main/README.md)"):
            with self.subTest(body=body), patch.object(citations, "current_revision", return_value="b" * 40), \
                    patch.object(citations, "fetch_document", return_value=body), \
                    self.assertRaisesRegex(ValueError, "no longer links"):
                citations.verify(self.inclusions, "2026-10-19")

    def test_fetch_failure_does_not_return_a_receipt(self):
        with patch.object(citations, "current_revision", return_value="b" * 40), \
                patch.object(citations, "fetch_document", side_effect=OSError("unavailable")), \
                self.assertRaises(OSError):
            citations.verify(self.inclusions, "2026-10-19")

    def test_comments_and_code_examples_do_not_count_as_visible_citations(self):
        link = "[Skill](https://github.com/publisher/skills)"
        for body in (f"<!-- {link} -->", f"<!-- {link}", f"```md\n{link}\n```",
                     f"~~~\n{link}\n~~~", f"`{link}`", f"    {link}",
                     f"<code>{link}</code>", f"<pre>{link}</pre>"):
            with self.subTest(body=body):
                self.assertEqual(citations.visible_links(body), [])
        self.assertEqual(citations.visible_links(f"```\nliteral\n```\n- {link}"), [self.entry["target"]])

    def test_self_citations_duplicate_sources_and_invalid_receipts_are_rejected(self):
        for change in ({"source": "publisher/awesome"}, {"path": "../README.md"},
                       {"commit": "main"}, {"target": "https://github.com/another/repo"}):
            data = copy.deepcopy(self.inclusions)
            data["citations"]["publisher/skills"][0].update(change)
            with self.subTest(change=change), self.assertRaises(ValueError):
                citations.receipts(data)
        self.inclusions["citations"]["publisher/skills"].append({**self.entry, "source": "COMMUNITY/awesome"})
        with self.assertRaises(ValueError):
            citations.receipts(self.inclusions)


if __name__ == "__main__":
    unittest.main()
