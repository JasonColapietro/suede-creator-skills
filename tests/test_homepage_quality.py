import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "docs" / "index.html").read_text(encoding="utf-8")


def css_block(selector: str) -> str:
    match = re.search(re.escape(selector) + r"\s*\{([^}]*)\}", HOME, re.S)
    if not match:
        raise AssertionError(f"missing CSS block: {selector}")
    return match.group(1)


class HomepageQualityTests(unittest.TestCase):
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
