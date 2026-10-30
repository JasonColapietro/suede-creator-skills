"""Inspect generated install commands as data; never execute publisher text."""

import copy
import hashlib
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
                     "directory/notes.json", "directory/promotion.json", "directory/featured-projects.json", "directory/services-cta.json",
                     "scripts/directory/featured.mjs", "scripts/directory/badges.mjs", "scripts/directory/editorial.mjs", "scripts/directory/metadata.mjs",
                     "scripts/directory/check-client.js", "scripts/directory/task-pages.mjs", "directory/task-pages.json", "docs/llms.txt"):
            target = cls.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / name, target)
        shutil.copytree(ROOT / "scripts/directory/badges", cls.root / "scripts/directory/badges")
        (cls.root / "scripts/lib").mkdir()
        data = json.loads((ROOT / "directory/skills.json").read_text())
        # graded-v2 scores read the repository's commit date and citations, so
        # each fixture keeps its template's repository facts and its score.
        template = next(s for s in data["skills"] if s.get("featured") and s["license"] == "MIT" and s["grade"] == "A")
        low = next(s for s in data["skills"] if s.get("featured") and s["license"] == "MIT" and s["score"] < 80)
        cls.score = template["score"]
        cls.low_score, cls.low_grade = low["score"], low["grade"]
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
            if i == 0:
                entry["display_name"] = "Suede AI Example Skills"
            data["skills"].append(entry)
        for name, featured in (("low-page", True), ("low-row", False)):
            entry = copy.deepcopy(low)
            entry.update(repo="fixture/low", dir=f"skills/{name}", name=name, slug=name)
            if not featured:
                entry.pop("featured", None)
            data["skills"].append(entry)
        meta = copy.deepcopy(data["repos"][template["repo"]])
        meta["branch"] = "release/$(printf unexpected)'`x`"
        data["repos"] = {"fixture/skills": meta, "fixture/low": copy.deepcopy(data["repos"][low["repo"]])}
        cls.branch = meta["branch"]
        (cls.root / "directory/skills.json").write_text(json.dumps(data))
        subprocess.run(["node", str(cls.root / "scripts/build-directory.mjs")],
                       check=True, capture_output=True, text=True)

    def test_quality_badges_security_and_schema_render_together(self):
        page = (self.root / 'docs/directory/fixture/skills/skill-0/index.html').read_text()
        self.assertIn(f'{self.score}/100 · A', page)
        self.assertIn('Two badges for Suede AI Example Skills', page)
        self.assertIn('Security scan: not scanned.', page)
        self.assertIn('Not scanned', page)
        # The feature offer renders its copy from directory/promotion.json.
        offer = json.loads((ROOT / 'directory/promotion.json').read_text())['copy']['offer_long']
        self.assertIn(f'Limited-time feature offer: {offer}', page)
        snippets = [html.unescape(re.search(rf'<code id="badge-{kind}">([\s\S]*?)</code>', page)[1]) for kind in ('md', 'html')]
        for snippet in snippets:
            self.assertEqual(snippet.count('](https://skills.suedeai.ai/directory/fixture/skills/skill-0/)') if snippet.startswith('[!') else snippet.count('href="https://skills.suedeai.ai/directory/fixture/skills/skill-0/"'), 2)
            self.assertIn('/skill-0/score.svg', snippet)
            self.assertIn('/skill-0/badge.svg', snippet)
        legacy = (self.root / 'docs/directory/fixture/skills/skill-0/badge.svg').read_text()
        self.assertIn('M86.40 202.96A113.10', legacy)
        self.assertIn('Grade A', legacy)
        self.assertIn(f'{self.score} / 100', (self.root / 'docs/directory/fixture/skills/skill-0/score.svg').read_text())
        self.assertTrue((self.root / f'docs/directory/badges/score-{self.score}.svg').is_file())
        home = (self.root / 'docs/directory/index.html').read_text()
        self.assertNotIn('id="badge-partners"', home)

    def test_skills_below_80_keep_badge_urls_without_quality_shields(self):
        listing = (self.root / 'docs/directory/badge.svg').read_text()
        self.assertIn('Suede AI Skills Directory: listed', listing)
        for name in ('low-page', 'low-row'):
            for svg in ('badge.svg', 'score.svg'):
                with self.subTest(skill=name, svg=svg):
                    self.assertEqual((self.root / f'docs/directory/fixture/low/{name}/{svg}').read_text(), listing)
        self.assertFalse((self.root / f'docs/directory/badges/score-{self.low_score}.svg').exists())
        page = (self.root / 'docs/directory/fixture/low/low-page/index.html').read_text()
        self.assertIn(f'{self.low_score}/100 · {self.low_grade}', page)
        self.assertNotIn('Two badges for', page)
        self.assertNotIn('low-page/score.svg', page)
        self.assertIn('submit/#improve', page)
        self.assertIn('Points', page)
        repo = (self.root / 'docs/directory/fixture/low/index.html').read_text()
        row = repo.split('<tr id="low-row">', 1)[1].split('</tr>', 1)[0]
        self.assertIn('Improve this score', row)
        self.assertNotIn('Get badges', row)
        self.assertNotIn('Get badges', repo.split('<tr id="low-page">', 1)[1].split('</tr>', 1)[0])

    def test_builder_rejects_invented_score_or_security_result(self):
        path = self.root / 'directory/skills.json'
        original = path.read_text()
        try:
            for patch in ({'score': 99}, {'score': 100}, {'score': self.score + 1},
                          {'grade': 'B'}, {'checks': '11100111'}, {'security_scan_status': 'passed'}):
                data = json.loads(original)
                data['skills'][0].update(patch)
                path.write_text(json.dumps(data))
                result = subprocess.run(['node', str(self.root / 'scripts/build-directory.mjs')], capture_output=True, text=True)
                self.assertNotEqual(result.returncode, 0)
        finally:
            path.write_text(original)

    def test_verified_promotion_links_to_listing_and_preserves_editorial_page(self):
        path = self.root / 'directory/promotion.json'
        original = path.read_text()
        dataset_path = self.root / 'directory/skills.json'
        dataset_original = dataset_path.read_bytes()
        from datetime import datetime, timezone
        target = 'https://skills.suedeai.ai/directory/fixture/skills/skill-0/'
        record = {'repo': 'fixture/skills', 'score': self.score, 'status': 'verified',
                  'target': target, 'readme_path': 'README.md', 'commit': 'a' * 40,
                  'rendered_sha256': 'b' * 64, 'verified_at': datetime.now(timezone.utc).isoformat(),
                  'dataset_sha256': hashlib.sha256(dataset_original).hexdigest(),
                  'badges': ['https://skills.suedeai.ai/directory/fixture/skills/skill-0/score.svg',
                             'https://skills.suedeai.ai/directory/fixture/skills/skill-0/badge.svg']}
        try:
            both = record['badges']
            for state, badges, visible in [('pending', both, False), ('verified', both[:1], True),
                                           ('verified', both[1:], True), ('verified', both, True)]:
                record['status'] = state
                record['badges'] = badges
                path.write_text(json.dumps({'enabled': True, 'ends_at': None, 'verifications': {'fixture/skills/skill-0': record}}))
                subprocess.run(['node', str(self.root / 'scripts/build-directory.mjs')], check=True, capture_output=True)
                home = (self.root / 'docs/directory/index.html').read_text()
                self.assertEqual('id="badge-partners"' in home, visible)
                if visible:
                    section = home.split('id="badge-partners"', 1)[1].split('</section>', 1)[0]
                    self.assertIn('href="' + target + '"', section)
                    self.assertNotIn('href="https://github.com/', section)
                self.assertTrue((self.root / 'docs/directory/fixture/skills/skill-0/index.html').is_file())
            # The README was verified at 10am, then a later refresh on the same
            # calendar date found no skill changes. Its old evidence must expire.
            data = json.loads(dataset_original)
            data['snapshot_id'] = 'd' * 32
            dataset_path.write_text(json.dumps(data))
            subprocess.run(['node', str(self.root / 'scripts/build-directory.mjs')], check=True, capture_output=True)
            self.assertNotIn('id="badge-partners"', (self.root / 'docs/directory/index.html').read_text())
            record['dataset_sha256'] = hashlib.sha256(dataset_path.read_bytes()).hexdigest()
            path.write_text(json.dumps({'enabled': True, 'ends_at': None, 'verifications': {'fixture/skills/skill-0': record}}))
            subprocess.run(['node', str(self.root / 'scripts/build-directory.mjs')], check=True, capture_output=True)
            self.assertIn('id="badge-partners"', (self.root / 'docs/directory/index.html').read_text())
        finally:
            path.write_text(original)
            dataset_path.write_bytes(dataset_original)
            subprocess.run(['node', str(self.root / 'scripts/build-directory.mjs')], check=True, capture_output=True)

    def snippet(self, index, route):
        page = (self.root / f"docs/directory/fixture/skills/skill-{index}/index.html").read_text()
        match = re.search(rf'<code id="install-{route}">([\s\S]*?)</code>', page)
        self.assertIsNotNone(match)
        return html.unescape(match[1])

    def test_display_name_is_public_while_machine_identity_and_install_stay_stable(self):
        page = (self.root / "docs/directory/fixture/skills/skill-0/index.html").read_text()
        self.assertRegex(page, r"<h1>Suede AI Example Skills\b")
        report = json.loads((self.root / "docs/directory/fixture/skills/skill-0/report.json").read_text())
        self.assertEqual(report["skill"]["name"], "skill-0")
        self.assertEqual(report["skill"]["display_name"], "Suede AI Example Skills")
        search = json.loads((self.root / "docs/directory/search-index.json").read_text())
        entry = next(s for s in search if s.get("slug") == "skill-0")
        self.assertEqual(entry["name"], "Suede AI Example Skills")
        self.assertIn("/skill-0/", entry["report"])
        self.assertIn("skills/plain", self.snippet(0, "cli"))

    def test_claude_and_codex_copy_paths_are_literal_shell_words(self):
        # Codex reads repository skills from .agents/skills (OpenAI Codex docs).
        for route, target in (("claude", ".claude/skills/"), ("codex", ".agents/skills/")):
            for i, directory in enumerate(self.paths):
                with self.subTest(route=route, directory=directory):
                    command = self.snippet(i, route)
                    source = re.search(r'\ncp -R ([\s\S]+?) ' + re.escape(target) + r'\n', command)[1]
                    # Only the trusted temporary directory variable may expand.
                    prefix = '"$tmp/repo/"'
                    self.assertTrue(source.startswith(prefix), source)
                    self.assertEqual(literal_word(source[len(prefix):]), directory)
                    self.assertEqual(shlex.split("cp -R " + source + " " + target),
                                     ["cp", "-R", "$tmp/repo/" + directory, target])
                    self.assertNotIn(".codex/skills", command)

    def test_other_routes_and_branch_arguments_remain_literal(self):
        for i, directory in enumerate(self.paths):
            with self.subTest(directory=directory):
                cli = self.snippet(i, "cli")
                self.assertEqual(literal_word(cli.removeprefix("npx skills add ")),
                                 f"https://github.com/fixture/skills/tree/{self.branch}/{directory}")
                for route in ("claude", "codex"):
                    command = self.snippet(i, route)
                    branch_word = command.split("--branch ", 1)[1].split(" https://github.com/", 1)[0]
                    self.assertEqual(literal_word(branch_word), self.branch)

    def test_root_skill_and_all_rendered_commands_have_valid_syntax(self):
        for route, target in (("claude", ".claude/skills"), ("codex", ".agents/skills")):
            root = self.snippet(len(self.paths), route)
            self.assertIn(f"{target}/skill-{len(self.paths)}", root)
            self.assertNotIn("cp -R", root)
        for i in range(len(self.paths) + 1):
            for route in ("cli", "claude", "codex"):
                # -n parses only. No command, substitution, or cloned code runs.
                result = subprocess.run(["bash", "--noprofile", "--norc", "-n"],
                                        input=self.snippet(i, route), text=True, capture_output=True)
                self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
