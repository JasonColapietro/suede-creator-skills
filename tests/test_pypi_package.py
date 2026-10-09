"""Guards the `suede-creator-skills` PyPI package and its `suede-skills` CLI.

The tests run the CLI against the repository's own skills/ and mcp/catalog.json,
the same files scripts/build-pypi-package.mjs stages into the wheel, so they need
no build step and see exactly what a release would ship.
"""

import contextlib
import io
import os
import re
import shutil
import sys
import tempfile
import tomllib
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "pypi" / "src"))

from suede_creator_skills import cli  # noqa: E402

SKILL_NAMES = sorted(
    p.name for p in (ROOT / "skills").iterdir() if p.is_dir() and (p / "SKILL.md").is_file()
)


def repo_bundle():
    return cli.Bundle(ROOT / "skills", ROOT / "mcp" / "catalog.json", ROOT)


def run(*argv):
    out = io.StringIO()
    err = io.StringIO()
    with contextlib.redirect_stderr(err):
        code = cli.main(list(argv), bundle=repo_bundle(), out=out)
    return code, out.getvalue(), err.getvalue()


def tree(path):
    return sorted(
        p.relative_to(path).as_posix()
        for p in path.rglob("*")
        if p.is_file() and "__pycache__" not in p.parts and not p.name.endswith(".pyc")
    )


class ListAndShowTests(unittest.TestCase):
    def test_list_prints_every_skill_with_a_one_line_summary(self):
        code, out, _ = run("list")
        self.assertEqual(code, 0)
        rows = [line for line in out.splitlines() if line and not line.startswith(str(len(SKILL_NAMES)))]
        listed = [row.split()[0] for row in rows if not row.startswith("`")]
        self.assertEqual(listed, SKILL_NAMES)
        for row in rows:
            self.assertGreater(len(row.split(None, 1)), 1, f"no summary on: {row}")
        self.assertIn(f"{len(SKILL_NAMES)} skills.", out)

    def test_list_filters_by_specialty_key_or_label(self):
        catalog = repo_bundle().catalog()
        expected = sorted(s["name"] for s in catalog["skills"] if s["specialty"] == "found")
        for value in ("found", "Get found"):
            with self.subTest(specialty=value):
                code, out, _ = run("list", "--specialty", value)
                self.assertEqual(code, 0)
                listed = [line.split()[0] for line in out.splitlines() if line.startswith(("suede-", "johnny-"))]
                self.assertEqual(listed, expected)

    def test_unknown_specialty_names_the_real_ones(self):
        code, _, err = run("list", "--specialty", "nope")
        self.assertEqual(code, 2)
        self.assertIn("found", err)

    def test_show_prints_the_skill_md_verbatim(self):
        code, out, _ = run("show", "suede-seo-audit")
        self.assertEqual(code, 0)
        self.assertEqual(out, (ROOT / "skills" / "suede-seo-audit" / "SKILL.md").read_text(encoding="utf-8"))

    def test_show_unknown_skill_suggests_close_names(self):
        code, out, err = run("show", "suede-seo-audt")
        self.assertEqual(code, 2)
        self.assertEqual(out, "")
        self.assertIn("suede-seo-audit", err)

    def test_path_points_at_the_bundled_skills(self):
        code, out, _ = run("path")
        self.assertEqual(code, 0)
        self.assertEqual(out.strip(), str(ROOT / "skills"))

    def test_version_comes_from_the_version_file(self):
        out = io.StringIO()
        with contextlib.redirect_stdout(out), self.assertRaises(SystemExit) as exit_:
            cli.main(["--version"], bundle=repo_bundle())
        self.assertEqual(exit_.exception.code, 0)
        self.assertEqual(out.getvalue().strip(), f"suede-skills {(ROOT / 'VERSION').read_text().strip()}")


class FrontmatterTests(unittest.TestCase):
    def test_reads_quoted_plain_and_folded_descriptions(self):
        cases = {
            '---\nname: a\ndescription: "Quoted, with \\"escapes\\"."\n---\nbody': 'Quoted, with "escapes".',
            "---\nname: a\ndescription: Plain words here.\n---\n": "Plain words here.",
            "---\nname: a\ndescription: >-\n  Folded first\n  and second.\nmetadata: x\n---\n": "Folded first and second.",
            "no frontmatter": "",
        }
        for text, expected in cases.items():
            with self.subTest(text=text[:30]):
                self.assertEqual(cli.frontmatter_description(text), expected)

    def test_every_skill_has_a_description_without_the_catalog(self):
        bundle = cli.Bundle(ROOT / "skills", None, ROOT)
        missing = [s.name for s in bundle.skills() if not s.description.strip()]
        self.assertEqual(missing, [])


class InstallTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="suede-skills-test-"))
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.target = self.tmp / "skills"

    def test_install_copies_every_skill_folder_intact(self):
        code, out, _ = run("install", "--target", str(self.target))
        self.assertEqual(code, 0)
        self.assertEqual(sorted(p.name for p in self.target.iterdir()), SKILL_NAMES)
        for name in ("suede-seo-audit", "suede-graph-flo-xr", "suede-release-linter"):
            with self.subTest(skill=name):
                self.assertEqual(tree(self.target / name), tree(ROOT / "skills" / name))
        self.assertIn(f"Installed {len(SKILL_NAMES)} skills to {self.target}", out)
        self.assertIn("installed  suede-seo-audit", out)

    def test_install_selected_skills_only(self):
        code, out, _ = run("install", "--target", str(self.target), "--skill", "suede-code", "--skill", "suede-copy")
        self.assertEqual(code, 0)
        self.assertEqual(sorted(p.name for p in self.target.iterdir()), ["suede-code", "suede-copy"])
        self.assertIn("Installed 2 skills", out)

    def test_unknown_skill_installs_nothing(self):
        code, _, err = run("install", "--target", str(self.target), "--skill", "suede-code", "--skill", "nope")
        self.assertEqual(code, 2)
        self.assertIn("nope", err)
        self.assertEqual(list(self.target.iterdir()) if self.target.exists() else [], [])

    def test_existing_pack_folder_is_kept_without_force(self):
        existing = self.target / "suede-code"
        existing.mkdir(parents=True)
        (existing / "SKILL.md").write_text("my local edits\n")
        code, out, _ = run("install", "--target", str(self.target))
        self.assertEqual(code, 0)
        self.assertEqual((existing / "SKILL.md").read_text(), "my local edits\n")
        self.assertEqual(tree(existing), ["SKILL.md"])
        self.assertIn("skipped    suede-code", out)
        self.assertIn("kept 1 existing", out)
        self.assertIn(f"Installed {len(SKILL_NAMES) - 1} skills", out)

    def test_force_replaces_pack_folders_and_leaves_others_alone(self):
        existing = self.target / "suede-code"
        existing.mkdir(parents=True)
        (existing / "stale.md").write_text("old release\n")
        personal = self.target / "my-own-skill"
        personal.mkdir()
        (personal / "SKILL.md").write_text("mine\n")
        stray = self.target / "notes.txt"
        stray.write_text("keep me\n")

        code, out, _ = run("install", "--target", str(self.target), "--force")
        self.assertEqual(code, 0)
        self.assertEqual(tree(existing), tree(ROOT / "skills" / "suede-code"))
        self.assertIn("replaced   suede-code", out)
        self.assertEqual((personal / "SKILL.md").read_text(), "mine\n")
        self.assertEqual(stray.read_text(), "keep me\n")

    def test_claude_target_installs_skills_and_agent_profiles_under_home(self):
        with mock.patch.dict(os.environ, {"HOME": str(self.tmp), "USERPROFILE": str(self.tmp)}):
            code, _, _ = run("install", "--skill", "suede-graph-flo-xr")
        self.assertEqual(code, 0)
        self.assertTrue((self.tmp / ".claude" / "skills" / "suede-graph-flo-xr" / "SKILL.md").is_file())
        expected = sorted(p.name for p in (ROOT / "skills" / "suede-graph-flo-xr" / "agents").glob("suede-graph-flo-xr-*.md"))
        self.assertTrue(expected)
        self.assertEqual(sorted(p.name for p in (self.tmp / ".claude" / "agents").iterdir()), expected)

    def test_codex_target_honors_codex_home(self):
        codex_home = self.tmp / "codex-home"
        with mock.patch.dict(os.environ, {"HOME": str(self.tmp), "CODEX_HOME": str(codex_home)}):
            code, _, _ = run("install", "--target", "codex", "--skill", "suede-code")
        self.assertEqual(code, 0)
        self.assertTrue((codex_home / "skills" / "suede-code" / "SKILL.md").is_file())
        self.assertFalse((self.tmp / ".claude").exists())

    def test_codex_target_defaults_to_dot_codex(self):
        env = {k: v for k, v in os.environ.items() if k != "CODEX_HOME"}
        env.update(HOME=str(self.tmp), USERPROFILE=str(self.tmp))
        with mock.patch.dict(os.environ, env, clear=True):
            self.assertEqual(cli.resolve_target("codex"), self.tmp / ".codex" / "skills")


class PackageMetadataTests(unittest.TestCase):
    def setUp(self):
        self.pyproject = tomllib.loads((ROOT / "pypi" / "pyproject.toml").read_text(encoding="utf-8"))
        self.readme = (ROOT / "pypi" / "README.md").read_text(encoding="utf-8")

    def test_metadata_names_the_package_script_and_links(self):
        project = self.pyproject["project"]
        self.assertEqual(project["name"], "suede-creator-skills")
        self.assertEqual(project["scripts"], {"suede-skills": "suede_creator_skills.cli:main"})
        self.assertEqual(project["dependencies"], [])
        self.assertEqual(project["authors"], [{"name": "Jason Colapietro"}])
        self.assertEqual(
            project["urls"],
            {
                "Homepage": "https://skills.suedeai.ai",
                "Repository": "https://github.com/JasonColapietro/suede-creator-skills",
                "Documentation": "https://skills.suedeai.ai/plugins.html",
                "Changelog": "https://skills.suedeai.ai/#changelog",
                "Issues": "https://github.com/JasonColapietro/suede-creator-skills/issues",
            },
        )
        self.assertIn("version", project["dynamic"])
        self.assertEqual(
            self.pyproject["tool"]["setuptools"]["dynamic"]["version"],
            {"file": "src/suede_creator_skills/VERSION"},
        )

    def test_license_files_ship_with_every_distribution(self):
        self.assertEqual(self.pyproject["project"]["license-files"], ["LICENSE", "NOTICE.md", "licenses/*"])
        manifest = (ROOT / "pypi" / "MANIFEST.in").read_text()
        for line in ("include LICENSE NOTICE.md README.md", "graft licenses", "graft src/suede_creator_skills/skills"):
            self.assertIn(line, manifest)

    def test_readme_follows_house_style(self):
        for text, label in ((self.readme, "README.md"), (self.pyproject["project"]["description"], "description")):
            with self.subTest(surface=label):
                self.assertNotIn("\u2014", text)
                self.assertNotRegex(text.lower(), r"\bmoreover\b")
                for phrase in ("honest limits", "not the first choice", "not for everyone", "may not be the best fit"):
                    self.assertNotIn(phrase, text.lower())
        # The pack resizes; a hardcoded total in this README would go stale on PyPI.
        self.assertIsNone(re.search(r"\b\d+\s+(?:open-source\s+)?skills\b", self.readme))
        for command in ("pipx install suede-creator-skills", "pip install suede-creator-skills", "suede-skills install"):
            self.assertIn(command, self.readme)


if __name__ == "__main__":
    unittest.main()
