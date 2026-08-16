"""The mobile nav is one pattern repeated across 100+ hand-written pages.

Nothing here checks how it looks. These are the invariants that decay quietly:
a page that drops the `open` attribute and becomes unreachable without
JavaScript, a touch target shrunk back under 44px, a page that never got the
pattern at all, and a mobile link list that drifts away from the desktop row
sitting a few lines above it in the same file.

The design is deliberately inverted: <details> ships `open`, so the browser
renders every link with no script, and JS *collapses* it at mobile widths.
That makes `open` load-bearing rather than cosmetic, which is why it gets its
own test.
"""

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

# The only page under docs/ without the site nav is a Google verification stub.
PAGES = sorted(
    p for p in DOCS.rglob("*.html") if 'class="nav-logo"' in p.read_text(encoding="utf-8")
)

# These two carry a second, mobile-only copy of the link list, so their two
# lists can drift apart. Every other page wraps its single .nav-links row.
DUPLICATED_LIST_PAGES = {DOCS / "index.html", DOCS / "dav" / "index.html"}


def stylesheets_for(page: Path, html: str) -> str:
    """Inline <style> blocks plus every local stylesheet the page links."""
    css = "\n".join(re.findall(r"<style>(.*?)</style>", html, re.S))
    for href in re.findall(r'<link rel="stylesheet" href="([^"]+)"', html):
        if href.startswith(("http://", "https://", "//")):
            continue
        resolved = (page.parent / href).resolve()
        if resolved.is_file():
            css += "\n" + resolved.read_text(encoding="utf-8")
    return css


def slice_div(html: str, opening: str) -> str:
    """Markup of the div starting at `opening`, tags included, depth-aware."""
    start = html.index(opening)
    depth = 0
    for match in re.finditer(r"<div\b|</div>", html[start:]):
        depth += 1 if match.group(0) == "<div" else -1
        if depth == 0:
            return html[start : start + match.end()]
    raise AssertionError(f"unterminated div for {opening!r}")


def hrefs(markup: str) -> list:
    return re.findall(r'<a\b[^>]*\bhref="([^"]*)"', markup)


class MobileNavTests(unittest.TestCase):
    def test_every_page_with_a_nav_was_found(self):
        # Guards discovery itself: an empty page list would let every other
        # test here pass while checking nothing.
        self.assertGreaterEqual(len(PAGES), 100)

    def test_every_nav_is_a_details_disclosure(self):
        for page in PAGES:
            with self.subTest(page=page.relative_to(ROOT)):
                html = page.read_text(encoding="utf-8")
                self.assertRegex(html, r'<details class="nav-disclosure"')
                self.assertRegex(html, r'<summary class="nav-hamburger"')

    def test_the_disclosure_ships_open(self):
        # The whole no-JS story rests on this attribute. Drop it and the menu
        # renders closed, with only script able to open it again.
        for page in PAGES:
            with self.subTest(page=page.relative_to(ROOT)):
                html = page.read_text(encoding="utf-8")
                tag = re.search(r"<details class=\"nav-disclosure\"[^>]*>", html)
                self.assertIsNotNone(tag)
                self.assertRegex(
                    tag.group(0),
                    r"\bopen\b",
                    "the disclosure must ship open or the nav needs JS to be reachable",
                )

    def test_the_control_clears_the_44px_touch_floor(self):
        # Resolved through linked stylesheets too, since most pages keep their
        # nav CSS in assets/ rather than inline.
        for page in PAGES:
            with self.subTest(page=page.relative_to(ROOT)):
                css = stylesheets_for(page, page.read_text(encoding="utf-8"))
                rules = re.findall(
                    r"\.nav-hamburger[^{;]*\{([^}]*)\}", css, re.S
                )
                sized = [r for r in rules if "width:" in r and "height:" in r]
                self.assertTrue(sized, "no .nav-hamburger rule sets a size")
                self.assertTrue(
                    any("44px" in r for r in sized),
                    "the hamburger must be at least 44px in both directions",
                )

    def test_pages_with_two_link_lists_keep_them_in_step(self):
        for page in sorted(DUPLICATED_LIST_PAGES):
            with self.subTest(page=page.relative_to(ROOT)):
                html = page.read_text(encoding="utf-8")
                desktop = slice_div(html, '<div class="nav-right">')
                # The disclosure lives inside .nav-right on these two, so drop
                # it before reading the desktop row.
                desktop = re.sub(r"<details\b.*?</details>", "", desktop, flags=re.S)
                panel = slice_div(html, '<div id="nav-mobile-menu"')
                self.assertEqual(
                    hrefs(desktop),
                    hrefs(panel),
                    "mobile menu drifted from the desktop nav",
                )

    def test_single_list_pages_never_grew_a_second_copy(self):
        # The other 99 pages wrap one .nav-links row, which is why they cannot
        # drift. A stray #nav-mobile-menu would reintroduce that risk.
        for page in PAGES:
            if page in DUPLICATED_LIST_PAGES:
                continue
            with self.subTest(page=page.relative_to(ROOT)):
                html = page.read_text(encoding="utf-8")
                self.assertNotIn('id="nav-mobile-menu"', html)
                self.assertIn('<div class="nav-links">', html)

    def test_the_script_keeps_the_label_honest(self):
        for page in PAGES:
            with self.subTest(page=page.relative_to(ROOT)):
                html = page.read_text(encoding="utf-8")
                self.assertIn("'Close navigation menu'", html)
                self.assertIn("'Open navigation menu'", html)


if __name__ == "__main__":
    unittest.main()
