"""Inspect generated install commands as data; never execute publisher text."""

import copy
import html
import json
import re
import shlex
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def literal_word(word):
    """Decode an inert POSIX shell word, rejecting expansions and operators.

    Unlike shlex.split (which ignores shell expansion), this accepts only
    single-quoted text, escaped characters, and safe unquoted characters.
    Nothing is passed to a shell for evaluation.
    """
    result = ""
    i = 0
    while i < len(word):
        char = word[i]
        if char == "'":
            end = word.find("'", i + 1)
            if end < 0:
                raise AssertionError("unclosed single quote")
            result += word[i + 1:end]
            i = end + 1
        elif char == "\\" and i + 1 < len(word) and word[i + 1] != "\n":
            result += word[i + 1]
            i += 2
        elif re.fullmatch(r"[a-zA-Z0-9_./@:+-]", char):
            result += char
            i += 1
        else:
            raise AssertionError(f"active shell syntax in literal word: {char!r}")
    return result


class DirectoryInstallTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix="directory-install-")
        cls.addClassCleanup(cls.tmp.cleanup)
        cls.root = Path(cls.tmp.name)
        for name in ("scripts/build-directory.mjs", "directory/categories.json",
                     "directory/notes.json", "docs/llms.txt"):
            target = cls.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / name, target)
        (cls.root / "scripts/lib").mkdir()
        data = json.loads((ROOT / "directory/skills.json").read_text())
        template = next(s for s in data["skills"] if s.get("featured") and s["license"] == "MIT")
        cls.paths = [
            "skills/plain", "parent with spaces/skill", "parent'quote/skill",
            'parent"quote/skill', "$(printf unexpected)/skill",
            "`printf unexpected`/skill", "parent/$HOME/${USER}/skill",
            "parent; printf unexpected/skill", "parent&&other|pipe/skill",
            "parent<>redirect&background/skill", "parent*(glob)?[ab]/skill",
            "parent\\backslash/skill", "parent\nnewline\ttab/skill",
            "-leading-option/skill", "café/技能", "parent'$(printf unexpected)`x`/skill",
        ]
        data["skills"] = []
        for i, directory in enumerate(cls.paths + ["."]):
            entry = copy.deepcopy(template)
            entry.update(repo="fixture/skills", dir=directory, name=f"skill-{i}", slug=f"skill-{i}")
            data["skills"].append(entry)
        meta = copy.deepcopy(next(iter(data["repos"].values())))
        meta["branch"] = "release/$(printf unexpected)'`x`"
        data["repos"] = {"fixture/skills": meta}
        cls.branch = meta["branch"]
        (cls.root / "directory/skills.json").write_text(json.dumps(data))
        subprocess.run(["node", str(cls.root / "scripts/build-directory.mjs")],
                       check=True, capture_output=True, text=True)

    def snippet(self, index, route):
        page = (self.root / f"docs/directory/fixture/skills/skill-{index}/index.html").read_text()
        match = re.search(rf'<code id="install-{route}">([\s\S]*?)</code>', page)
        self.assertIsNotNone(match)
        return html.unescape(match[1])

    def test_claude_copy_paths_are_literal_shell_words(self):
        for i, directory in enumerate(self.paths):
            with self.subTest(directory=directory):
                command = self.snippet(i, "claude")
                source = re.search(r'\ncp -R ([\s\S]+?) \.claude/skills/\n', command)[1]
                # Only the trusted temporary directory variable may expand.
                prefix = '"$tmp/repo/"'
                self.assertTrue(source.startswith(prefix), source)
                self.assertEqual(literal_word(source[len(prefix):]), directory)
                self.assertEqual(shlex.split("cp -R " + source + " .claude/skills/"),
                                 ["cp", "-R", "$tmp/repo/" + directory, ".claude/skills/"])

    def test_other_routes_and_branch_arguments_remain_literal(self):
        for i, directory in enumerate(self.paths):
            with self.subTest(directory=directory):
                cli = self.snippet(i, "cli")
                self.assertEqual(literal_word(cli.removeprefix("npx skills add ")),
                                 f"https://github.com/fixture/skills/tree/{self.branch}/{directory}")
                codex = self.snippet(i, "codex")
                path_word, branch_word = codex.split("--path ", 1)[1].split(" \\\n    --ref ")
                self.assertEqual(literal_word(path_word), directory)
                self.assertEqual(literal_word(branch_word), self.branch)
                claude = self.snippet(i, "claude")
                branch_word = claude.split("--branch ", 1)[1].split(" https://github.com/", 1)[0]
                self.assertEqual(literal_word(branch_word), self.branch)

    def test_root_skill_and_all_rendered_commands_have_valid_syntax(self):
        root = self.snippet(len(self.paths), "claude")
        self.assertIn(f".claude/skills/skill-{len(self.paths)}", root)
        self.assertNotIn("cp -R", root)
        for i in range(len(self.paths) + 1):
            for route in ("cli", "claude", *(() if i == len(self.paths) else ("codex",))):
                # -n parses only. No command, substitution, or cloned code runs.
                result = subprocess.run(["bash", "--noprofile", "--norc", "-n"],
                                        input=self.snippet(i, route), text=True, capture_output=True)
                self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
