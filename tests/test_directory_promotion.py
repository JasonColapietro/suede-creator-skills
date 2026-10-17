import importlib.util
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

spec = importlib.util.spec_from_file_location('verify_badges', Path(__file__).resolve().parents[1] / 'scripts/directory/verify_badges.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
TARGET = 'https://skills.suedeai.ai/directory/example/skills/sample/'
IMAGES = ['https://skills.suedeai.ai/directory/badges/score-86.svg', 'https://skills.suedeai.ai/directory/badges/grade-b.svg']
HTML = ''.join(f'<a href="{TARGET}"><img src="{src}" width="160" height="175"></a>' for src in IMAGES)


class EmbeddingTests(unittest.TestCase):
    def test_both_rendered_images_are_required(self):
        self.assertEqual(mod.embedded_badges(HTML, TARGET, IMAGES), sorted(IMAGES))
        one = HTML[:HTML.index('</a>') + 4]
        self.assertEqual(len(mod.embedded_badges(one + one, TARGET, IMAGES)), 1)
        self.assertEqual(mod.embedded_badges(HTML.replace(TARGET, 'https://example.com'), TARGET, IMAGES), [])
        self.assertEqual(mod.embedded_badges(HTML.replace('score-86', 'score-100'), TARGET, IMAGES), [IMAGES[1]])

    def test_code_comments_hidden_images_and_plain_links_do_not_count(self):
        for wrapper in ['<pre>{}</pre>', '<code>{}</code>', '<!-- {} -->', '<div hidden>{}</div>',
                        '<div style="display:none">{}</div>', '<details>{}</details>', '<span aria-hidden="true">{}</span>', '<picture>{}</picture>']:
            self.assertEqual(mod.embedded_badges(wrapper.format(HTML), TARGET, IMAGES), [])
        self.assertEqual(mod.embedded_badges(HTML.replace('width="160"', 'width="1"'), TARGET, IMAGES), [])
        self.assertEqual(mod.embedded_badges(HTML.replace('<img ', '&lt;img '), TARGET, IMAGES), [])

    def test_spoofed_canonical_url_does_not_count(self):
        spoof = HTML.replace('src="', 'src="https://example.com/fake.svg" data-canonical-src="')
        self.assertEqual(mod.embedded_badges(spoof, TARGET, IMAGES), [])

    def test_github_image_proxy_preserves_canonical_source(self):
        proxied = HTML.replace('src="', 'src="https://camo.githubusercontent.com/example" data-canonical-src="')
        self.assertEqual(mod.embedded_badges(proxied, TARGET, IMAGES), sorted(IMAGES))

    def test_verification_binds_to_dataset_read_before_network_requests(self):
        with tempfile.TemporaryDirectory(prefix='directory-verification-') as tmp:
            root = Path(tmp)
            (root / 'directory').mkdir()
            dataset = root / 'directory/skills.json'
            original = json.dumps({'snapshot_id': 'a' * 32, 'skills': [
                {'repo': 'example/skills', 'slug': 'sample', 'score': 86}]}).encode()
            dataset.write_bytes(original)
            ledger = root / 'directory/promotion.json'
            ledger.write_text(json.dumps({'enabled': True, 'ends_at': None, 'verifications': {}}))
            responses = iter([json.dumps({'default_branch': 'main'}), json.dumps({'sha': 'a' * 40}), HTML])

            def fetch(*args):
                # A concurrent refresh cannot bind old verification to new data.
                dataset.write_bytes(original.replace(b'a' * 32, b'b' * 32))
                return next(responses)

            contract = SimpleNamespace(stdout=json.dumps({'target': TARGET, 'badges': IMAGES}))
            with mock.patch.object(mod, 'ROOT', root), mock.patch.object(mod, 'gh', side_effect=fetch), \
                 mock.patch.object(mod.subprocess, 'run', return_value=contract), \
                 mock.patch('sys.argv', ['verify_badges.py', 'example/skills/sample']):
                self.assertEqual(mod.main(), 0)
            record = json.loads(ledger.read_text())['verifications']['example/skills/sample']
            self.assertEqual(record['dataset_sha256'], hashlib.sha256(original).hexdigest())
            self.assertNotEqual(record['dataset_sha256'], hashlib.sha256(dataset.read_bytes()).hexdigest())


if __name__ == '__main__':
    unittest.main()
