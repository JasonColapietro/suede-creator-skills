"""The #proof-tape strip makes a promise about itself, in an HTML comment right
above it: "every number on this strip appears, sourced, further down the page."

It then shipped three numbers that broke that promise, each invisible on the
strip itself and only catchable by measuring the strip against the rest of the
page and the real artifacts it describes:

  1. "270 commits" while the ship log elsewhere on the same page said 282 (twice).
  2. "18-chapter book" while the /book/ artifact enumerates 14 chapters
     (book/01..14, and llms.txt says "14 chapters").
  3. "29,102 words of documentation" -- a figure that appears nowhere else on the
     page and counts nothing a reader can verify. An orphan.

These assertions are on the CLAIM, not on the fixed strings a grep found:

  * the strip's commit count equals the ship log's commit count in the same page;
  * the strip's chapter count equals the real book artifact, cross-checked
    against llms.txt -- add a 15th chapter file and the strip must move with it;
  * EVERY number on the strip is sourced: restated elsewhere on the page, or
    equal to a countable collection the page/artifact actually contains (the
    changelog's entries, the book's chapters). A number backed by neither -- the
    class the "29,102 words" figure belongs to -- fails as an orphan;
  * the pack size is stated as the true skill count wherever a page describes the
    CURRENT pack. The only "71"s left standing are the fixed essay headline
    ("71 skills installed. Your agent reads almost none of them.") and one
    past-tense changelog line ("41 of 71 skills were in the catalog"). A stale
    "71 skills stay cheap to carry" / "71-skill pack" / "installing all 71" is
    the same false claim in different wording, and is what this guards.

Each test names, in a comment, the edit that makes it fail -- the non-vacuous
proof was run by hand (revert the fix, watch it go red, restore, watch it pass).
"""

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
BOOK = ROOT / "book"
SKILLS = ROOT / "skills"
INDEX = DOCS / "index.html"

# The pages that describe the CURRENT pack size in prose. Every one is served at
# skills.suedeai.ai; each drifted to a stale "71" independently.
PACK_PAGES = (
    INDEX,
    DOCS / "skills" / "index.html",
    DOCS / "guide.html",
    DOCS / "plugins.html",
)

# The only two contexts in which a literal "71" is honest: a fixed, dated essay
# headline (a proper noun -- the title of a specific published post), and a
# past-tense changelog entry describing the pack when it genuinely had 71.
ESSAY_HEADLINE_71 = "71 skills installed. Your agent reads almost none of them."
HISTORICAL_71 = re.compile(r"\d+ of 71 skills")

# The shapes a stale CURRENT-pack "71" takes. Not the specific fixed strings --
# the defect class: a number-71 used as a live count of skills.
STALE_71 = re.compile(r"71[\s-]skills?\b|all 71\b")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def true_skill_count() -> int:
    """The real pack size: skills/*/SKILL.md on disk. Same definition the
    validator and the book-facts module use."""
    return sum(1 for d in SKILLS.iterdir() if d.is_dir() and (d / "SKILL.md").is_file())


def true_chapter_count() -> int:
    """The real book: numbered chapter files, excluding the 00 front matter and
    the letter-prefixed appendices (A1, A2). Add book/15-*.md and this grows."""
    return sum(
        1
        for f in BOOK.glob("*.md")
        if re.match(r"^\d\d-", f.name) and not f.name.startswith("00-")
    )


def proof_tape_block(html: str) -> str:
    """The #proof-tape div, both marquee tracks included."""
    m = re.search(r'<div id="proof-tape".*?</ul>\s*</div>\s*</div>', html, re.S)
    assert m, "the #proof-tape strip is gone from index.html"
    return m.group(0)


def tape_items(block: str):
    """(raw, label) for each <li>, deduped -- the two tracks are identical."""
    items = []
    seen = set()
    for li in re.findall(r"<li>(.*?)</li>", block, re.S):
        m = re.search(r"<b>(.*?)</b>(.*)", li, re.S)
        assert m, f"proof-tape item has no bolded number: {li!r}"
        raw = m.group(1).strip()
        label = re.sub(r"<[^>]*>", "", m.group(2)).strip()
        key = (raw, label)
        if key not in seen:
            seen.add(key)
            items.append(key)
    return items


class ProofTapeStructure(unittest.TestCase):
    """Discovery guards. Without these, a strip that stopped parsing would let
    every claim test below pass while measuring nothing."""

    def setUp(self):
        self.html = read(INDEX)
        self.block = proof_tape_block(self.html)
        self.items = tape_items(self.block)

    def test_the_strip_has_its_full_set_of_claims(self):
        # Seven distinct claims after the "29,102 words" orphan was removed.
        self.assertGreaterEqual(
            len(self.items), 7, f"proof-tape parsed too few items: {self.items}"
        )

    def test_the_strip_still_carries_a_commit_and_a_chapter_claim(self):
        labels = " ".join(label for _, label in self.items).lower()
        self.assertIn("commits", labels)
        self.assertIn("chapter", labels)


class ProofTapeNumbersAreSourced(unittest.TestCase):
    def setUp(self):
        self.html = read(INDEX)
        self.block = proof_tape_block(self.html)
        self.items = tape_items(self.block)
        # The rest of the page: the strip removed, so a number cannot "source"
        # itself from its own <li>.
        self.rest = self.html.replace(self.block, "")
        self.chapters = true_chapter_count()
        self.changelog_entries = self.html.count('class="clog-item"')

    def test_commit_count_reconciles_with_the_ship_log(self):
        # Fails if the strip says 270 again: the ship log elsewhere says 282.
        tape = re.search(r"<b>(\d+)</b>\s*commits in 10 weeks", self.block)
        self.assertIsNotNone(tape, "no commit count on the proof-tape")
        shiplog = re.findall(r"(\d+)\s*commits\s*&middot;\s*10 weeks", self.rest)
        self.assertTrue(
            shiplog, "no ship-log commit count found elsewhere on the page to source it"
        )
        for n in shiplog:
            self.assertEqual(
                int(n),
                int(tape.group(1)),
                "proof-tape commit count disagrees with the ship log on the same page",
            )

    def test_chapter_count_equals_the_real_book(self):
        # Fails if the strip says 18 again: book/ enumerates 14 chapters.
        tape = re.search(r"<b>(\d+)</b>-chapter", self.block)
        self.assertIsNotNone(tape, "no chapter count on the proof-tape")
        self.assertEqual(self.chapters, 14, "book artifact no longer has 14 chapters")
        self.assertEqual(
            int(tape.group(1)),
            self.chapters,
            "proof-tape chapter count disagrees with the real book (book/NN-*.md)",
        )
        # Cross-check the other artifact that states it, so the two cannot drift.
        llms = read(DOCS / "llms.txt")
        stated = re.search(r"(\d+)\s*chapters", llms)
        self.assertIsNotNone(stated, "llms.txt no longer states a chapter count")
        self.assertEqual(int(stated.group(1)), self.chapters)

    def test_no_number_on_the_strip_is_an_orphan(self):
        # The strip's own promise, enforced generically. Fails if the
        # "29,102 words of documentation" line (or any figure sourced by nothing)
        # is on the strip: 29,102 appears nowhere else and counts nothing.
        for raw, label in self.items:
            low = label.lower()
            if "chapter" in low:
                self.assertEqual(
                    int(re.sub(r"\D", "", raw)),
                    self.chapters,
                    f"{raw!r} ({label!r}) does not match the book's chapter count",
                )
            elif "changelog" in low:
                self.assertEqual(
                    int(re.sub(r"\D", "", raw)),
                    self.changelog_entries,
                    f"{raw!r} ({label!r}) does not match the page's changelog entry count",
                )
            else:
                self.assertIn(
                    raw,
                    self.rest,
                    f"proof-tape number {raw!r} ({label!r}) is an orphan: it is "
                    f"restated nowhere else on index.html and counts no collection "
                    f"on the page -- exactly the promise the strip makes about itself",
                )


class PackSizeIsCurrent(unittest.TestCase):
    def test_stale_71_pack_descriptions_are_gone(self):
        # Fails if "how 71 skills stay cheap to carry" (skills/index.html),
        # "the economics of a 71-skill pack" (skills, guide), or "installing all
        # 71" (plugins) comes back. The essay headline and the historical
        # changelog line are allowed to keep their 71.
        for page in PACK_PAGES:
            text = read(page)
            stripped = text.replace(ESSAY_HEADLINE_71, "")
            stripped = HISTORICAL_71.sub("", stripped)
            leftover = STALE_71.findall(stripped)
            self.assertEqual(
                leftover,
                [],
                f"{page.relative_to(ROOT)}: stale current-pack '71' reference(s) "
                f"{leftover} -- the pack is {true_skill_count()}",
            )

    def test_stay_cheap_lines_state_the_true_count(self):
        # The two "N skills stay cheap to carry" lines pin the number, so guard
        # them against restaling to anything but the real pack size. Fails if the
        # skills page (or the homepage) says any count other than the truth.
        count = true_skill_count()
        found = 0
        for page in (INDEX, DOCS / "skills" / "index.html"):
            for n in re.findall(r"how (\d+) skills stay cheap to carry", read(page)):
                found += 1
                self.assertEqual(
                    int(n),
                    count,
                    f"{page.relative_to(ROOT)}: 'stay cheap to carry' says {n}, "
                    f"pack is {count}",
                )
        self.assertGreaterEqual(found, 2, "expected the phrase on both pages")


if __name__ == "__main__":
    unittest.main()
