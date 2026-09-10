from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
HOL_URL = "https://hol.org/registry/plugins/suede-labs-ai%2Fsuede-skills"
PLUGINWORLD_URL = "https://pluginworld.ai/plugins/claude-code/jasoncolapietro/suede-creator-skills"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class ExternalTrustSignalsTest(unittest.TestCase):
    def test_primary_public_surfaces_link_independent_registry_scores(self) -> None:
        for path in ("README.md", "docs/index.html", "docs/plugins.html"):
            with self.subTest(path=path):
                text = read(path)
                self.assertIn(HOL_URL, text)
                self.assertIn(PLUGINWORLD_URL, text)
                self.assertIn("Trust 92", text)
                self.assertIn("Security 100", text)
                self.assertIn("PluginWorld", text)
                self.assertIn("90", text)

    def test_public_copy_does_not_call_registry_scores_certifications(self) -> None:
        text = "\n".join(read(path) for path in ("README.md", "docs/index.html", "docs/plugins.html"))
        lowered = text.lower()
        self.assertNotIn("hol certified", lowered)
        self.assertNotIn("pluginworld certified", lowered)
        self.assertNotIn("security certified by hol", lowered)
        self.assertNotIn("security certified by pluginworld", lowered)


if __name__ == "__main__":
    unittest.main()
