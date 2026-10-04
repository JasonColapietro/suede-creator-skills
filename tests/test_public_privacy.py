"""Privacy regressions use invented data and never expose match values."""
import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('public_privacy', ROOT / 'scripts/check-public-privacy.py')
privacy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(privacy)


class PublicPrivacyTests(unittest.TestCase):
    def setUp(self):
        self.value = '731' + '.28'  # Invented regression value, not a customer amount.
        self.contact = 'support' + '@' + 'business.tld'
        self.policy = {
            'recovery_surface_path_pattern': r'docs/.*|dist-npm/.*',
            'intentional_public_contacts': [{
                'sha256': privacy.digest(self.contact),
                'path_pattern': r'SECURITY\.md',
            }],
        }

    def check(self, text, path='docs/example.html'):
        return privacy.check_text(text, path, self.policy)

    def test_visible_metadata_clipboard_and_encoded_json_are_checked(self):
        encoded = ''.join('\\u%04x' % ord(c) for c in self.value)
        samples = ['<p>Recovered $'+self.value+'</p>', '<meta content="Recovered $'+self.value+'">',
                   '<button data-copy="Recovered &#36;'+self.value+'">Copy</button>',
                   json.dumps({'description': 'Recovered $'+self.value}), '{"description":"Recovered $'+encoded+'"}']
        for sample in samples:
            with self.subTest(surface=samples.index(sample)):
                rows = self.check(sample)
                self.assertEqual(rows[0]['category'], 'account-recovery-financial-example')
                self.assertNotIn(self.value, json.dumps(rows))

    def test_obvious_credentials_and_private_identifiers_are_rejected(self):
        samples = [('ghp_'+'a'*36, 'provider-token'),
                   ('-----BEGIN '+'PRIVATE KEY-----', 'private-key'),
                   ('/Us'+'ers/fictional-person/private.txt', 'personal-path'),
                   ('C:\\Us'+'ers\\fictional-person\\private.txt', 'personal-path'),
                   ('123'+'-1234567'+'-1234567', 'order-identifier'),
                   ('123'+'-45'+'-6789', 'ssn-shaped-identifier'),
                   ('api_key = "'+'z'*24+'"', 'credential-assignment'),
                   ('202'+'-555'+'-0200', 'unreviewed-phone')]
        for sample, category in samples:
            with self.subTest(category=category):
                rows = self.check(sample)
                self.assertIn(category, [r['category'] for r in rows])
                self.assertNotIn(sample, json.dumps(rows))

    def test_wrapped_recovery_claims_are_rejected(self):
        samples = ['Recovered\n$'+self.value,
                   '$'+self.value+'\nwas recovered',
                   'Real recoveries:\n$'+self.value,
                   '<p>Real recoveries:</p>\n<p>$'+self.value+'</p>',
                   '<p>$'+self.value+'</p>\n<p>refunded</p>']
        for index, sample in enumerate(samples):
            with self.subTest(surface=index):
                rows = self.check(sample)
                self.assertIn('account-recovery-financial-example', [r['category'] for r in rows])
                self.assertNotIn(self.value, json.dumps(rows))

    def test_quoted_json_credentials_and_encoded_attributes_are_rejected(self):
        secret = 'fictional' + 'x'*24
        payload = json.dumps({'password': secret})
        samples = [payload, payload.replace('password', 'access_token'),
                   '<div data-config="'+payload.replace('"', '&quot;')+'"></div>']
        for index, sample in enumerate(samples):
            with self.subTest(surface=index):
                rows = self.check(sample)
                self.assertIn('credential-assignment', [r['category'] for r in rows])
                self.assertNotIn(secret, json.dumps(rows))

    def test_reserved_examples_and_material_disclosures_pass(self):
        text = 'person@example.com; fake@example.test; 202'+'-555'+'-0100. No legal clearance. Unknown rights stay unknown. MIT.'
        self.assertEqual(self.check(text), [])

    def test_public_contact_exception_is_value_and_path_scoped(self):
        self.assertEqual(self.check(self.contact, 'SECURITY.md'), [])
        self.assertEqual(self.check(self.contact)[0]['category'], 'unreviewed-email')
        self.assertEqual(self.check('different'+'@'+'business.tld', 'SECURITY.md')[0]['category'], 'unreviewed-email')

    def test_generated_package_is_checked_and_diagnostics_are_redacted(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); package = root / 'package'; package.mkdir()
            (package/'package.json').write_text('{}')
            (package/'catalog.json').write_text(json.dumps({'description': 'Recovered $'+self.value}))
            policy = root/'policy.json'; policy.write_text(json.dumps(self.policy))
            output = io.StringIO()
            with patch.object(privacy, 'POLICY', policy), patch.object(privacy.subprocess, 'check_output', return_value=b''), patch('sys.argv', ['guard','--root',str(root),'--package',str(package)]), contextlib.redirect_stdout(output):
                result = privacy.main()
            self.assertEqual(result, 1)
            self.assertNotIn(self.value, output.getvalue())
            self.assertIn('dist-npm/catalog.json', output.getvalue())

    def test_pdf_text_is_checked_and_extraction_failure_is_not_a_pass(self):
        result = type('Result', (), {'returncode': 0, 'stdout': ('Recovered $'+self.value).encode()})()
        with patch.object(privacy.subprocess, 'run', return_value=result):
            rows, kind = privacy.scan_file(Path('book.pdf'), 'docs/book.pdf', self.policy)
        self.assertEqual(kind, 'pdf')
        self.assertEqual(rows[0]['category'], 'account-recovery-financial-example')
        with patch.object(privacy.subprocess, 'run', side_effect=FileNotFoundError):
            rows, kind = privacy.scan_file(Path('book.pdf'), 'docs/book.pdf', self.policy)
        self.assertEqual(kind, 'unreadable')
        self.assertEqual(rows[0]['category'], 'pdf-extraction-unavailable')

    def test_recovery_examples_are_synthetic_and_cannot_hold_money_records(self):
        text = (ROOT/'skills/amazon-returns-recovery/references/example-cases.md').read_text()
        self.assertIn('# Synthetic example cases', text)
        self.assertIn('They are not customer records', text)
        self.assertIsNone(privacy.MONEY.search(text))
        for skill in ('amazon-returns-recovery', 'subscription-recovery'):
            self.assertIn('private session', (ROOT/'skills'/skill/'SKILL.md').read_text())


if __name__ == '__main__':
    unittest.main()
