"""The ship strip is one component rendered by ~100 hand-written pages.

Nothing here checks how it looks. These are the two ways it has actually
drifted, both of which were invisible on the page that introduced them and
only showed up when two page types were measured side by side.

1. Cascade order. `.ship-strip` and its mobile `@media (max-width: 720px)`
   overrides live in the same stylesheet at equal specificity, so the mobile
   block only wins if it is declared *after* the base rule. skill.css had them
   the other way round, which silently killed `padding: 48px` and
   `font-size: 14px` on 73 pages while the declarations sat there looking live.

2. Typography inheritance. `.ship-strip-sub` is a bare <p>. site.css sets no
   line-height on it originally, so it inherited whichever `p { line-height }`
   the host stylesheet happened to declare -- 1.6 on skill pages, 1.75 from
   prose.css -- and the same component rendered 7px taller on blog and book
   pages than everywhere else.

Both are the same underlying hazard: a shared component whose final rendering
is decided by the page that hosts it rather than by the stylesheet that
defines it.
"""

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
ASSETS = DOCS / "assets"

# The container width every ship strip is meant to render at.
STANDARD_SHELL = 1100

PAGES = sorted(
    p for p in DOCS.rglob("*.html") if 'class="ship-strip"' in p.read_text(encoding="utf-8")
)

# Properties the mobile block overrides. Each must survive the cascade, so for
# each one the base declaration has to come first in the file.
MOBILE_OVERRIDES = (
    (r"\.ship-strip\s*\{", "padding"),
    (r"\.ship-strip-row code\s*\{", "font-size"),
)


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


def shell_widths(css: str) -> list:
    """Every width `.shell` resolves to, following a `var(--shell)` indirection.

    Pages write this two ways: `width: min(1100px, 100%)` inline, or
    `width: min(calc(100% - 40px), var(--shell))` against a custom property.
    """
    widths = []
    for body in re.findall(r"\.shell\s*\{([^}]*)\}", css):
        decl = re.search(r"(?:^|;)\s*width:([^;]*)", body)
        if not decl:
            continue
        # Only the width declaration -- `padding: 0 40px` is not a width. And
        # lengths inside calc() are gutters subtracted from 100%, not caps:
        # min(calc(100% - 40px), var(--shell)) caps at --shell, not at 40px.
        expr = re.sub(r"calc\([^()]*\)", "", decl.group(1))
        widths += re.findall(r"(\d+)px", expr)
        if "var(--shell)" in expr:
            widths += re.findall(r"--shell:\s*(\d+)px", css)
    return widths


def mobile_blocks(css: str) -> list:
    """(start_index, body) for each `@media (max-width: 720px)` block."""
    out = []
    for match in re.finditer(r"@media\s*\(max-width:\s*720px\)\s*\{", css):
        depth = 1
        i = match.end()
        while i < len(css) and depth:
            if css[i] == "{":
                depth += 1
            elif css[i] == "}":
                depth -= 1
            i += 1
        out.append((match.start(), css[match.end() : i - 1]))
    return out


class ShipStripTests(unittest.TestCase):
    def test_every_page_with_a_ship_strip_was_found(self):
        # Guards discovery itself: an empty page list would let the rest of
        # this file pass while checking nothing.
        self.assertGreaterEqual(len(PAGES), 90)

    def test_the_sub_pins_its_own_line_height(self):
        # Without this the component inherits the host stylesheet's `p` rule,
        # which is exactly how blog and book pages drifted 7px taller.
        site = (ASSETS / "site.css").read_text(encoding="utf-8")
        rule = re.search(r"\.ship-strip-sub\s*\{([^}]*)\}", site)
        self.assertIsNotNone(rule, ".ship-strip-sub is no longer defined in site.css")
        self.assertIn(
            "line-height",
            rule.group(1),
            ".ship-strip-sub must set its own line-height or it inherits the "
            "host page's `p` rule and renders a different height per page type",
        )

    def test_mobile_overrides_are_declared_after_the_base_rule(self):
        # Equal specificity, so source order alone decides the winner.
        for css_name in ("skill.css", "prose.css"):
            css = (ASSETS / css_name).read_text(encoding="utf-8")
            for start, body in mobile_blocks(css):
                for selector, prop in MOBILE_OVERRIDES:
                    inside = re.search(selector + r"[^}]*" + prop, body)
                    if not inside:
                        continue
                    base = re.search(selector, css)
                    with self.subTest(css=css_name, selector=selector, prop=prop):
                        self.assertIsNotNone(base)
                        self.assertLess(
                            base.start(),
                            start,
                            f"{css_name}: the base rule for {selector!r} is declared "
                            f"after the 720px block, so the mobile {prop} is dead code",
                        )

    def test_the_strip_never_inherits_a_narrow_page_shell(self):
        # A page may narrow `.shell` for readable prose -- prose.css takes it
        # to 760px, docs/blog/index.html to 900px. When it does, the strip has
        # to use the dedicated .ship-strip-shell or it silently renders
        # narrower than the same strip on every other page. Only narrowing
        # matters; a bespoke page sitting slightly wider is not this bug.
        for page in PAGES:
            html = page.read_text(encoding="utf-8")
            wrapper = re.search(
                r'<section class="ship-strip"[^>]*>\s*<div class="([a-z-]+)"', html
            )
            if not wrapper or wrapper.group(1) != "shell":
                continue
            css = stylesheets_for(page, html)
            widths = [int(w) for w in shell_widths(css)]
            with self.subTest(page=page.relative_to(ROOT)):
                self.assertTrue(widths, f"{page.name}: no .shell width could be resolved")
                self.assertGreaterEqual(
                    min(widths),
                    STANDARD_SHELL,
                    f"{page.name} wraps its ship strip in .shell but narrows "
                    f".shell to {min(widths)}px -- the strip will render narrower "
                    f"than on every other page; use .ship-strip-shell instead",
                )


if __name__ == "__main__":
    unittest.main()
