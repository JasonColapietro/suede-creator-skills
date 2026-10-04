"""Guards the two house rules that skill text drifts away from.

1. Suede-owned public copy uses no em dashes (book/STYLE.md, and the deslop
   kill list). Skill folders are public copy: they ship on GitHub, over MCP,
   and on skills.sh.
2. The Suede sales-copy standard (AGENTS.md, CLAUDE.md, COPY.md) bans
   self-undermining phrases in reusable copy.
"""

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EM_DASH = "—"

# An em dash may stay only where the dash itself is the subject: a regex that
# matches it, or a quoted "before" example of slop. Keyed by path, valued by a
# substring of the line that keeps it.
EM_DASH_KEEPS = {
    "skills/suede-code/references/worked-example.md": ["(?: — private)?"],
    "skills/suede-deslop/SKILL.md": ["Before: \"Here's the thing —"],
}

BANNED_SALES_PHRASES = [
    "honest limits",
    "not the first choice",
    "not for everyone",
    "may not be the best fit",
    "honest weaknesses",
    "who should use something else",
]


# Reusable copy ships as Markdown, agent metadata, and HTML or CSV templates a
# user opens or adapts. Fixture data files are script test inputs and LICENSE
# files are upstream legal text, so neither is house copy; Markdown inside a
# fixtures folder is documentation and stays covered.
COPY_SUFFIXES = {".md", ".html", ".csv"}


def skill_text_files():
    for path in sorted((ROOT / "skills").rglob("*")):
        if not path.is_file() or path.name == "CARD.md":
            continue
        if path.name.startswith("LICENSE"):
            continue
        if "fixtures" in path.parts and path.suffix != ".md":
            continue
        if path.suffix in COPY_SUFFIXES or path.name == "openai.yaml":
            yield path


class HouseStyleTests(unittest.TestCase):
    def test_skill_text_has_no_em_dashes(self) -> None:
        offenders = []
        for path in skill_text_files():
            rel = path.relative_to(ROOT).as_posix()
            keeps = EM_DASH_KEEPS.get(rel, [])
            for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
                if EM_DASH in line and not any(keep in line for keep in keeps):
                    offenders.append(f"{rel}:{number}")
        self.assertEqual(
            offenders,
            [],
            "Em dashes in public skill text; use a comma, colon, period, or parentheses:\n"
            + "\n".join(offenders[:50]),
        )

    def test_skill_text_avoids_self_undermining_sales_phrases(self) -> None:
        offenders = []
        for path in skill_text_files():
            text = path.read_text(encoding="utf-8").lower()
            for phrase in BANNED_SALES_PHRASES:
                if phrase in text:
                    offenders.append(f"{path.relative_to(ROOT).as_posix()}: {phrase}")
        self.assertEqual(offenders, [], "\n".join(offenders))

    def test_claude_md_carries_the_sales_copy_standard(self) -> None:
        heading = "## Suede sales-copy standard (all repositories)"
        agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
        claude = (ROOT / "CLAUDE.md").read_text(encoding="utf-8")
        self.assertIn(heading, agents)
        self.assertIn(heading, claude)
        self.assertEqual(
            agents[agents.index(heading):].strip(),
            claude[claude.index(heading):].strip(),
            "CLAUDE.md and AGENTS.md disagree on the sales-copy standard",
        )


if __name__ == "__main__":
    unittest.main()
