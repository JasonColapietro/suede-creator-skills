import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def public_repo_text() -> str:
    paths = [
        ROOT / "README.md",
        ROOT / "mcp" / "catalog.json",
        *sorted((ROOT / "docs").rglob("*.html")),
        *sorted((ROOT / "docs").rglob("*.txt")),
        *sorted((ROOT / "skills").glob("*/SKILL.md")),
        *sorted((ROOT / "skills").glob("*/agents/openai.yaml")),
    ]
    return "\n".join(path.read_text(encoding="utf-8") for path in paths).lower()


class NeutralOssPositioningTests(unittest.TestCase):
    def test_primary_public_surfaces_present_neutral_open_source_tooling(self) -> None:
        public_copy = "\n".join(
            [
                read("README.md"),
                read("docs/index.html"),
                json.dumps(json.loads(read("mcp/catalog.json")), sort_keys=True),
            ]
        ).lower()

        required_phrases = [
            "open-source",
            "mit",
            "public install",
            "installable",
            "bring your own company",
            "do not upload files",
            "broadly reusable",
        ]
        for phrase in required_phrases:
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, public_copy)

    def test_rejection_trigger_phrases_stay_out_of_public_repo_surfaces(self) -> None:
        public_copy = public_repo_text()

        rejected_phrases = [
            "passport stamp",
            "stampable",
            "points-ready",
            "future rewards",
            "airdrop",
            "suede holder",
            "patented signing device",
            "join discord",
            "follow on x",
            "telegram",
            "ambassador",
            "suede-ready",
            "suede intake",
            "suede transfer",
            "stamping api",
            "passport signal",
        ]
        for phrase in rejected_phrases:
            with self.subTest(phrase=phrase):
                self.assertNotIn(phrase, public_copy)

    def test_creator_utility_metadata_is_reusable_not_suede_intake_only(self) -> None:
        metadata_paths = [
            "skills/suede-release-linter/SKILL.md",
            "skills/suede-release-linter/agents/openai.yaml",
            "skills/suede-rights-passport/SKILL.md",
            "skills/suede-rights-passport/agents/openai.yaml",
            "docs/skills/suede-release-linter.html",
            "docs/skills/suede-rights-passport.html",
        ]
        forbidden = [
            "suede-ready",
            "suede intake",
            "suede transfer",
            "stamping api",
            "passport signal",
            "passport stamp",
            "suede holder",
        ]
        for metadata_path in metadata_paths:
            text = read(metadata_path).lower()
            with self.subTest(path=metadata_path):
                for phrase in forbidden:
                    self.assertNotIn(phrase, text)
                self.assertRegex(text, r"(downstream|local|broadly reusable|creator)")

    def test_skill_count_copy_matches_catalog_and_folders(self) -> None:
        catalog = json.loads(read("mcp/catalog.json"))
        skill_dirs = sorted(path for path in (ROOT / "skills").iterdir() if path.is_dir())
        self.assertEqual(21, len(skill_dirs))
        self.assertEqual(21, len(catalog["skills"]))
        self.assertIn("21-skill", read("README.md"))
        self.assertIn("21-skill", read("docs/index.html"))

    def test_docs_index_references_existing_local_assets(self) -> None:
        page = read("docs/index.html")
        asset_paths = sorted(set(re.findall(r'(?:src|href)="\./(assets/[^"]+)"', page)))
        self.assertTrue(asset_paths)
        for asset_path in asset_paths:
            with self.subTest(asset=asset_path):
                self.assertTrue((ROOT / "docs" / asset_path).exists())


if __name__ == "__main__":
    unittest.main()
