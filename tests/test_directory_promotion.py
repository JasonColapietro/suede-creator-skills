import importlib.util
import unittest
from pathlib import Path

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


if __name__ == '__main__':
    unittest.main()
