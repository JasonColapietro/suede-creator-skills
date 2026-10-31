"""License evidence must retain unknown terms and avoid inferred choices."""
import ast
import re
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def definitions(path, names):
    tree = ast.parse(path.read_text())
    nodes = [n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.Assign)) and
             (getattr(n, 'name', None) in names or any(getattr(t, 'id', None) in names for t in getattr(n, 'targets', [])))]
    env = {'re': re, 'Path': Path}
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(path), 'exec'), env)
    return env

class LicenseEvidenceTests(unittest.TestCase):
    def test_multiple_files_keep_unknown_terms(self):
        env = definitions(ROOT / 'scripts/directory/parse_skills.py', {'LICENSE_PATTERNS', 'detect_license_text', 'find_license', 'license_evidence'})
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'LICENSE-MIT').write_text('MIT License')
            (root / 'LICENSE-CUSTOM').write_text('Commercial use requires written permission.')
            self.assertEqual(env['find_license'](root, root), ('Multiple license files; review terms', '.'))
            self.assertEqual(env['license_evidence'](root, root), [
                {'label': 'Other', 'file': 'LICENSE-CUSTOM'}, {'label': 'MIT', 'file': 'LICENSE-MIT'}])
            (root / 'LICENSE').write_text('MIT License')
            self.assertEqual(len(env['license_evidence'](root, root)), 3)

    def test_expression_and_conflicting_filename(self):
        env = definitions(ROOT / 'scripts/directory/parse_skills.py', {'LICENSE_PATTERNS', 'detect_license_text', 'find_license', 'license_evidence'})
        for expression in ('MIT OR Apache-2.0', 'MIT AND LicenseRef-Custom', '(MIT OR Apache-2.0) AND LicenseRef-Custom'):
            self.assertEqual(env['detect_license_text']('SPDX-License-Identifier: ' + expression), expression)
        self.assertEqual(env['detect_license_text']('SPDX-License-Identifier: MIT\nSPDX-License-Identifier: LicenseRef-Custom'), 'Other')
        self.assertEqual(env['detect_license_text']('SPDX-License-Identifier:\nMIT License'), 'Other')
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'LICENSE-MIT').write_text('Apache License Version 2.0')
            self.assertEqual(env['find_license'](root, root), ('Apache-2.0', 'LICENSE-MIT'))

    def test_frontmatter_cannot_relabel_license_file(self):
        env = definitions(ROOT / 'scripts/directory/curate.py', {'normalize_license'})
        self.assertEqual(env['normalize_license']('MIT AND LicenseRef-CommercialOnly-LongRestrictionName', None, None), 'See repository')
        self.assertEqual(env['normalize_license']('MIT', 'Other', 'LICENSE-CUSTOM'), 'See LICENSE file')
        self.assertEqual(env['normalize_license']('MIT', 'Apache-2.0', 'LICENSE'), 'Apache-2.0')
        self.assertEqual(env['normalize_license']('MIT', 'MIT AND LicenseRef-Custom', 'LICENSE'), 'MIT AND LicenseRef-Custom')

    def test_mixed_evidence_survives_curation_and_rendering(self):
        import json
        import shutil
        import subprocess
        from test_directory_inclusions import DirectoryInclusionTests, record
        evidence = [{'label': 'Other', 'file': 'LICENSE-CUSTOM'},
                    {'label': 'MIT', 'file': 'LICENSE-MIT'}]
        raw = {**record('publisher/skills', 'mixed-license'),
               'repo_license': 'Multiple license files; review terms',
               'license_file': '.', 'license_evidence': evidence}
        data = DirectoryInclusionTests().curate({}, extra_records=(raw,))
        skill = next(s for s in data['skills'] if s['name'] == 'mixed-license')
        self.assertFalse(skill['open_license'])
        self.assertEqual(skill['license_evidence'], evidence)
        with tempfile.TemporaryDirectory() as tmp:
            work = Path(tmp)
            for name in ('scripts/build-directory.mjs', 'directory/featured-projects.json',
                         'directory/categories.json', 'directory/notes.json',
                         'directory/promotion.json', 'directory/services-cta.json', 'directory/task-pages.json', 'docs/llms.txt'):
                target = work / name
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(ROOT / name, target)
            shutil.copytree(ROOT / 'scripts/directory', work / 'scripts/directory')
            (work / 'scripts/lib').mkdir()
            (work / 'directory/skills.json').write_text(json.dumps(data))
            result = subprocess.run(['node', str(work / 'scripts/build-directory.mjs')],
                                    capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            html = (work / 'docs/directory/publisher/skills/mixed-license/index.html').read_text()
            self.assertIn('https://github.com/publisher/skills/tree/main/.', html)
            self.assertIn('https://github.com/publisher/skills/blob/main/LICENSE-CUSTOM', html)
            self.assertIn('Other (LICENSE-CUSTOM)', html)
            self.assertIn('MIT (LICENSE-MIT)', html)
            self.assertIn('Multiple license files; review terms', html)
