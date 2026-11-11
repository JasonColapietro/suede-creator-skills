"""Declared HTTP operations are service dependencies, not documentation links."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import test_directory_inclusions as inclusions

ROOT = Path(__file__).resolve().parents[1]


class HttpInstructionTests(unittest.TestCase):
    def parse(self, body):
        with tempfile.TemporaryDirectory() as tmp:
            work = Path(tmp)
            repo = work / 'src/publisher__skills'
            skill = repo / 'skills/read-place'
            skill.mkdir(parents=True)
            (repo / '.git').mkdir()
            (repo / 'LICENSE').write_text('MIT License')
            (skill / 'SKILL.md').write_text(
                '---\nname: read-place\ndescription: Use when reading published place information for a traveler.\n---\n' + body)
            (work / 'candidates.json').write_text('[]')
            subprocess.run([sys.executable, '-I', str(ROOT / 'scripts/directory/parse_skills.py'),
                            str(work / 'src'), str(work / 'candidates.json'), str(work / 'out.json')],
                           check=True, capture_output=True, text=True)
            return json.loads((work / 'out.json').read_text())[0]

    def test_explicit_https_request_without_scripts_is_recorded(self):
        parsed = self.parse('Make one HTTPS POST request to `https://govisit.ai/api/tools/v1/search_places` with JSON.\n')
        self.assertTrue(parsed['network'])
        self.assertEqual(parsed['api_hosts'], ['govisit.ai'])
        self.assertFalse(parsed['mcp'])
        self.assertEqual(parsed['script_langs'], {})
        self.assertEqual(parsed['env_read'], [])

    def test_markdown_list_requests_are_recorded(self):
        for prefix in ('- ', '* ', '1. '):
            with self.subTest(prefix=prefix):
                parsed = self.parse(prefix + 'Make one HTTPS POST request to `https://govisit.ai/api/tools/v1/search_places`.\n')
                self.assertTrue(parsed['network'])
                self.assertEqual(parsed['api_hosts'], ['govisit.ai'])

    def test_documentation_and_negated_requests_are_not_dependencies(self):
        for body in ('Never\nmake one HTTPS POST request to `https://govisit.ai/api/tools/v1/search_places`.\n',
                     'Documentation example (do not execute):\n```text\nMake one HTTPS POST request to `https://govisit.ai/api/tools/v1/search_places`.\n```\n',
                     'Read documentation at https://govisit.ai/en/docs.\n',
                     'Never make one HTTPS POST request to `https://govisit.ai/api/tools/v1/search_places`.\n',
                     'Make one HTTPS GET request to `http://localhost/status`.\n'):
            with self.subTest(body=body):
                parsed = self.parse(body)
                self.assertFalse(parsed['network'])
                self.assertEqual(parsed['api_hosts'], [])

    def test_ordinary_listing_keeps_observed_network_facts(self):
        raw = {**inclusions.record('publisher/skills', 'service-reader'), 'folder': 'different-folder',
               'network': True, 'api_hosts': ['govisit.ai']}
        data = inclusions.DirectoryInclusionTests().curate({}, extra_records=(raw,))
        listed = next(s for s in data['skills'] if s['name'] == 'service-reader')
        self.assertNotIn('featured', listed)
        self.assertEqual(listed['install']['hosts'], ['govisit.ai'])
        self.assertTrue(listed['install']['net'])


if __name__ == '__main__':
    unittest.main()
