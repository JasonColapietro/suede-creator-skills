"""Keep public installation claims and search entry points aligned with the pack."""
import json
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
from urllib.parse import urljoin, urlparse, unquote
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
BASE = 'https://skills.suedeai.ai/'


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def meta(self, name):
        return [a.get('content', '') for tag, a in self.tags
                if tag == 'meta' and (a.get('name') == name or a.get('property') == name)]


def visible_text(path):
    return unescape(re.sub(r'<[^>]+>', '', path.read_text()))


class PublicDiscoveryTests(unittest.TestCase):
    def test_install_copy_matches_registered_mcp_surface(self):
        manifest = json.loads((ROOT / '.codex-plugin/plugin.json').read_text())
        catalog = json.loads((ROOT / 'mcp/catalog.json').read_text())
        servers = len(manifest['mcpServers'])
        tools = len(catalog['mcp']['tools'])
        for name in ['README.md', 'docs/plugins.html', 'docs/guide.html', 'docs/llms.txt']:
            with self.subTest(surface=name):
                text = visible_text(ROOT / name)
                # A shared, explicit claim ties the prose to the shipped contract.
                self.assertIn(f'{servers} read-only MCP server with {tools} tools', text)
                self.assertNotRegex(text, r'three (?:read-only )?MCP (?:discovery )?profiles')

    def test_marketing_subset_counts_match_manifest(self):
        manifest = json.loads((ROOT / '.claude-plugin/marketplace.json').read_text())
        count = len(next(p for p in manifest['plugins'] if p['name'] == 'suede-marketing')['skills'])
        for name in ['README.md', 'docs/index.html', 'docs/plugins.html', 'docs/llms.txt']:
            with self.subTest(surface=name):
                claim = re.search(r'suede-marketing@suede`?\s*\((\d+)', visible_text(ROOT / name))
                self.assertIsNotNone(claim)
                self.assertEqual(int(claim[1]), count)

    def test_render_templates_are_not_search_landing_pages(self):
        templates = list((DOCS / 'assets/social').glob('*.html'))
        self.assertTrue(templates)
        for path in templates:
            with self.subTest(template=path.name):
                self.assertTrue(any('noindex' in value.lower() for value in Page(path.read_text()).meta('robots')))

    def test_sitemap_pages_have_consistent_search_metadata_and_working_links(self):
        sitemap = ET.parse(DOCS / 'sitemap.xml')
        urls = [node.text for node in sitemap.findall('.//{*}loc')]
        self.assertEqual(len(urls), len(set(urls)), 'duplicate sitemap URLs')
        for url in urls:
            with self.subTest(url=url):
                self.assertTrue(url.startswith(BASE))
                rel = url.removeprefix(BASE)
                path = DOCS / (rel + 'index.html' if not rel or rel.endswith('/') else rel)
                self.assertTrue(path.is_file(), url)
                if path.suffix != '.html':
                    continue
                source = path.read_text()
                page = Page(source)
                canonical = [a.get('href') for tag, a in page.tags if tag == 'link' and a.get('rel') == 'canonical']
                self.assertEqual(canonical, [url])
                self.assertFalse(any('noindex' in value.lower() for value in page.meta('robots')))
                self.assertEqual(page.meta('og:url'), [url])
                self.assertTrue(page.meta('description'))
                self.assertRegex(source, r'<title>[^<]+</title>')
                self.assertTrue(any(tag == 'h1' for tag, _ in page.tags))
                for block in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', source, re.S):
                    json.loads(block)
                for tag, attrs in page.tags:
                    if tag != 'a' or not attrs.get('href'):
                        continue
                    target = urlparse(urljoin(url, attrs['href']))
                    if target.netloc != urlparse(BASE).netloc:
                        continue
                    linked = DOCS / unquote(target.path.lstrip('/'))
                    if linked.is_dir():
                        linked /= 'index.html'
                    self.assertTrue(linked.is_file(), f'{url} links to missing {attrs["href"]}')
                    if target.fragment and linked.suffix == '.html':
                        anchors = Page(linked.read_text()).tags
                        self.assertTrue(any(a.get('id') == unquote(target.fragment) or a.get('name') == unquote(target.fragment)
                                            for _, a in anchors), f'{url} links to missing anchor {attrs["href"]}')


if __name__ == '__main__':
    unittest.main()
