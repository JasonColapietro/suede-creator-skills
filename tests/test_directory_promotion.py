import importlib.util
import contextlib
import hashlib
import io
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
IMAGES = [TARGET + 'score.svg', TARGET + 'badge.svg']
HTML = ''.join(f'<a href="{TARGET}"><img src="{src}" width="160" height="175"></a>' for src in IMAGES)


class EmbeddingTests(unittest.TestCase):
    def test_detects_each_expected_rendered_image(self):
        self.assertEqual(mod.embedded_badges(HTML, TARGET, IMAGES), sorted(IMAGES))
        one = HTML[:HTML.index('</a>') + 4]
        self.assertEqual(len(mod.embedded_badges(one + one, TARGET, IMAGES)), 1)
        self.assertEqual(mod.embedded_badges(HTML.replace(TARGET, 'https://example.com'), TARGET, IMAGES), [])
        self.assertEqual(mod.embedded_badges(HTML.replace('score.svg', 'invalid.svg'), TARGET, IMAGES), [IMAGES[1]])

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


class VerificationTests(unittest.TestCase):
    def verify(self, rendered, concurrent_refresh=False, fail_fetch=False):
        with tempfile.TemporaryDirectory(prefix='directory-verification-') as tmp:
            root = Path(tmp)
            (root / 'directory').mkdir()
            dataset = root / 'directory/skills.json'
            original = json.dumps({'snapshot_id': 'a' * 32, 'skills': [
                {'repo': 'example/skills', 'slug': 'sample', 'score': 86}]}).encode()
            dataset.write_bytes(original)
            ledger = root / 'directory/promotion.json'
            ledger.write_text(json.dumps({'enabled': True, 'ends_at': None,
                                         'verifications': {'example/skills/sample': {'status': 'verified'}}}))
            responses = iter([json.dumps({'default_branch': 'main'}), json.dumps({'sha': 'a' * 40}), rendered])

            def fetch(*args):
                if concurrent_refresh:
                    dataset.write_bytes(original.replace(b'a' * 32, b'b' * 32))
                if fail_fetch:
                    raise mod.subprocess.CalledProcessError(1, ['gh', 'api'])
                return next(responses)

            contract = SimpleNamespace(stdout=json.dumps({'target': TARGET, 'badges': IMAGES}))
            with mock.patch.object(mod, 'ROOT', root), mock.patch.object(mod, 'gh', side_effect=fetch), \
                 mock.patch.object(mod.subprocess, 'run', return_value=contract), \
                 mock.patch('sys.argv', ['verify_badges.py', 'example/skills/sample']), \
                 contextlib.redirect_stdout(io.StringIO()):
                result = mod.main()
            record = json.loads(ledger.read_text())['verifications']['example/skills/sample']
            self.assertEqual(record['dataset_sha256'], hashlib.sha256(original).hexdigest())
            return result, record, hashlib.sha256(dataset.read_bytes()).hexdigest()

    def test_numeric_letter_or_both_valid_badges_verify(self):
        for images in [IMAGES[:1], IMAGES[1:], IMAGES]:
            with self.subTest(images=images):
                rendered = ''.join(f'<a href="{TARGET}"><img src="{src}"></a>' for src in images)
                result, record, _ = self.verify(rendered)
                self.assertEqual(result, 0)
                self.assertEqual(record['status'], 'verified')
                self.assertEqual(record['badges'], sorted(images))

    def test_invalid_images_targets_or_missing_badges_replace_prior_verification(self):
        invalid = HTML
        for src in IMAGES:
            invalid = invalid.replace(src, 'https://example.com/invalid.svg')
        for rendered in [invalid, HTML.replace(f'href="{TARGET}"', 'href="https://example.com"'), '', '<code>' + HTML + '</code>']:
            with self.subTest(rendered=rendered):
                result, record, _ = self.verify(rendered)
                self.assertEqual(result, 1)
                self.assertEqual(record['status'], 'missing_badges')
                self.assertEqual(record['badges'], [])

    def test_fetch_failure_replaces_prior_verification(self):
        result, record, _ = self.verify(HTML, fail_fetch=True)
        self.assertEqual(result, 1)
        self.assertEqual(record['status'], 'fetch_failed')
        self.assertEqual(record['badges'], [])

    def test_verification_binds_to_dataset_read_before_network_requests(self):
        result, record, current_hash = self.verify(HTML, concurrent_refresh=True)
        self.assertEqual(result, 0)
        self.assertNotEqual(record['dataset_sha256'], current_hash)


if __name__ == '__main__':
    unittest.main()
