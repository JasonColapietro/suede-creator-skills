import re
import hashlib
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "docs" / "index.html").read_text(encoding="utf-8")
SOCIAL_CARD_SVG = (ROOT / "docs" / "assets" / "og-image-v2.svg").read_text(encoding="utf-8")
APPROVED_SUEDE_MARK = ROOT / "docs" / "assets" / "suede-ai-logo-transparent.png"


def css_block(selector: str) -> str:
    match = re.search(re.escape(selector) + r"\s*\{([^}]*)\}", HOME, re.S)
    if not match:
        raise AssertionError(f"missing CSS block: {selector}")
    return match.group(1)


class HomepageQualityTests(unittest.TestCase):
    def test_approved_suede_mark_is_pixel_locked(self):
        digest = hashlib.sha256(APPROVED_SUEDE_MARK.read_bytes()).hexdigest()
        self.assertEqual(
            digest,
            "83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa",
        )

    def test_social_card_uses_approved_mark_without_redrawing_it(self):
        mark_group = re.search(
            r'<g id="suede-mark"[^>]*>(.*?)</g>', SOCIAL_CARD_SVG, re.S
        )
        self.assertIsNotNone(mark_group)
        self.assertIn('data-approved-suede-mark="true"', mark_group.group(1))
        self.assertIn('href="suede-ai-logo-transparent.png"', mark_group.group(1))
        self.assertNotIn("<path", mark_group.group(1))

    def test_social_renderer_locks_approved_mark_hash(self):
        renderer = (ROOT / "scripts/render-social-card.py").read_text()
        self.assertIn(
            "83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa",
            renderer,
        )
        self.assertIn(
            'APPROVED_MARK = ROOT / "docs/assets/suede-ai-logo-transparent.png"',
            renderer,
        )

    def test_social_card_describes_the_current_product(self):
        self.assertIn("assets/og-image-v2.png", HOME)
        self.assertNotIn('content="https://jasoncolapietro.github.io/suede-creator-skills/assets/og-image.png"', HOME)
        self.assertIn('property="og:image:width" content="1200"', HOME)
        self.assertIn('property="og:image:height" content="630"', HOME)
        self.assertIn('name="twitter:image:alt"', HOME)

    def test_has_skip_link_and_main_landmark(self):
        self.assertIn('class="skip-link" href="#main"', HOME)
        self.assertIn('<main id="main" tabindex="-1">', HOME)

    def test_keyboard_focus_is_visible(self):
        self.assertIn("a:focus-visible", HOME)
        self.assertIn("button:focus-visible", HOME)
        self.assertIn("summary:focus-visible", HOME)

    def test_motion_never_hides_content(self):
        self.assertNotIn("opacity: 0", css_block(".hero-anim"))
        self.assertNotIn("opacity: 0", css_block(".js-on .reveal"))
        self.assertNotIn(
            "opacity: 0",
            css_block(".js-on .features-grid.reveal-group .feature-card"),
        )

    def test_homepage_has_no_gradient_text(self):
        self.assertNotRegex(HOME, r"background-clip\s*:\s*text")

    def test_primary_mobile_controls_meet_touch_target_floor(self):
        self.assertIn("width: 44px;", css_block(".nav-hamburger"))
        self.assertIn("height: 44px;", css_block(".nav-hamburger"))
        self.assertIn("min-height: 44px;", css_block("#hero-cta-secondary"))
        self.assertIn("min-height: 44px;", css_block(".copy-btn"))

    def test_mobile_menu_label_tracks_state(self):
        self.assertIn("'Close navigation menu'", HOME)
        self.assertIn("'Open navigation menu'", HOME)


if __name__ == "__main__":
    unittest.main()
