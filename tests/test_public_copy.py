"""Focused copy-bank guard; technical/legal negatives are intentionally allowed."""
import re
import unittest
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def normalize(text):
    return re.sub(r"\s+", " ", unescape(text)).strip()


class CopyPage(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.posts = []
        self.payloads = []
        self.text = []
        self.metadata = []
        self.in_title = False
        self.current_post = None
        self.hidden_depth = 0
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta" and "content" in attrs:
            self.metadata.append(attrs["content"])
        if tag == "title":
            self.in_title = True
        if tag in ("script", "style", "head"):
            self.hidden_depth += 1
        if tag == "pre":
            self.current_post = []
        if tag == "button" and "data-copy" in attrs:
            self.payloads.append(attrs["data-copy"])

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag in ("script", "style", "head"):
            self.hidden_depth -= 1
        if tag == "pre" and self.current_post is not None:
            self.posts.append("".join(self.current_post))
            self.current_post = None

    def handle_data(self, data):
        if self.in_title:
            self.metadata.append(data)
        if not self.hidden_depth:
            self.text.append(data)
        if self.current_post is not None:
            self.current_post.append(data)


class PublicCopyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.markdown = (ROOT / "COPY.md").read_text()
        cls.html = (ROOT / "docs/copy.html").read_text()
        cls.page = CopyPage(cls.html)

    def test_known_self_undermining_copy_stays_out_of_copy_bank(self):
        # Named regressions on these two sales surfaces, not a global word ban.
        phrases = [
            "the label is a joke",
            "before you trust it",
            "not a separate marketing site",
            "routing is not guesswork",
            "disagree with them before you run",
            "no one will ever care as much",
            "name the one that should lose",
        ]
        surfaces = {
            "COPY.md": self.markdown,
            "docs/copy.html visible text": " ".join(self.page.text),
            "docs/copy.html clipboard payloads": " ".join(self.page.payloads),
            "docs/copy.html metadata": " ".join(self.page.metadata),
        }
        for surface, text in surfaces.items():
            for phrase in phrases:
                with self.subTest(surface=surface, phrase=phrase):
                    self.assertNotIn(phrase, normalize(text).lower(),
                                     f"{surface}: remove {phrase!r}")

    def test_copy_buttons_match_visible_posts(self):
        self.assertEqual(len(self.page.posts), 4, "Check every social post")
        self.assertEqual(len(self.page.payloads), len(self.page.posts))
        for post, payload in zip(self.page.posts, self.page.payloads):
            with self.subTest(post=post[:70]):
                self.assertEqual(payload, post)

    def test_shared_blocks_match_canonical_copy(self):
        # Only blocks explicitly mirrored here, not every independently written section.
        for heading in ["One-line description", "Full description", "Hero",
                        "Subhead", "Hero proof line", "GitHub Pages proof",
                        "Founder context", "Cracked stack post"]:
            with self.subTest(heading=heading):
                match = re.search(r"^### " + re.escape(heading) + r"\n\n(.*?)(?=\n\n|\Z)",
                                  self.markdown, re.M | re.S)
                self.assertIsNotNone(match)
                expected = normalize(match[1].replace("`", ""))
                self.assertIn(expected, normalize(" ".join(self.page.text)))

    def test_evidence_boundaries_remain_visible(self):
        # Keep real qualifications; a benefit-led rewrite must not erase them.
        boundaries = [
            "Public v1 runs offline and writes local files. It ships no binaries and no telemetry.",
            "Generated reports are drafts until a creator or operator reviews them.",
            "These skills organize evidence. They do not provide legal clearance.",
            "The scripts skip hidden files, dependency folders, build outputs, caches, and secret-like files by default.",
            "Unknown rights facts stay marked as unknown.",
            "Original work is MIT licensed; adapted components retain their upstream notices.",
            "It reads production for evidence and never deploys, and it does not expand permissions, spend authority, or model limits.",
        ]
        for boundary in boundaries:
            with self.subTest(boundary=boundary):
                self.assertIn(boundary, normalize(self.markdown))
                self.assertIn(boundary, normalize(" ".join(self.page.text)))


if __name__ == "__main__":
    unittest.main()
