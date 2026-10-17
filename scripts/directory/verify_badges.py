#!/usr/bin/env python3
"""Verify the two displayed README badges before enabling a feature placement.

Fetches one accepted repository's README through GitHub's HTML renderer at a
pinned commit. No clone, publisher code execution, or security claim is involved.
An unsuccessful attempt replaces any old verification with a non-active status.
"""
import argparse
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = 'https://skills.suedeai.ai/directory/'


class BadgeParser(HTMLParser):
    """Read rendered HTML only: code examples are text, never image evidence."""
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
    def __init__(self, target, expected):
        super().__init__(convert_charrefs=True)
        self.target, self.expected = target, set(expected)
        self.stack, self.found = [], set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        parent_hidden = any(entry[2] for entry in self.stack)
        hidden = parent_hidden or tag in {'pre', 'code', 'script', 'style', 'template', 'details', 'picture'} or 'hidden' in attrs or (attrs.get('aria-hidden') or '').lower() == 'true'
        # GitHub sanitizes arbitrary styles. Reject any remaining style rather
        # than attempting to interpret CSS visibility, dimensions or clipping.
        hidden = hidden or bool(attrs.get('style'))
        for dim in ('width', 'height'):
            if dim in attrs and re.fullmatch(r'\d+(?:\.\d+)?(?:px)?', attrs[dim] or ''):
                hidden = hidden or float(attrs[dim].removesuffix('px')) < 20
        if tag == 'img' and not hidden:
            anchor = next((a for t, a, _ in reversed(self.stack) if t == 'a'), {})
            source = attrs.get('src')
            if (source or '').startswith('https://camo.githubusercontent.com/'):
                source = attrs.get('data-canonical-src')
            if anchor.get('href') == self.target and source in self.expected:
                self.found.add(source)
        if tag not in self.VOID:
            self.stack.append((tag, attrs, hidden))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break


def embedded_badges(rendered, target, expected):
    parser = BadgeParser(target, expected)
    parser.feed(rendered)
    return sorted(parser.found)


def gh(endpoint, accept='application/vnd.github+json'):
    return subprocess.run(['gh', 'api', '--method', 'GET', endpoint, '-H', f'Accept: {accept}'],
                          check=True, capture_output=True, text=True, timeout=30).stdout


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('skill_id', help='Directory id: owner/repository/skill-slug')
    parser.add_argument('--readme', default='README.md', help='Repository or skill README path')
    args = parser.parse_args()
    if not re.fullmatch(r'(?:[^/]+/)*README(?:\.(?:md|markdown|rst))?', args.readme, re.I) or any(p in ('.', '..') for p in args.readme.split('/')):
        parser.error('--readme must name a README inside the repository')
    data = json.loads((ROOT / 'directory/skills.json').read_text())
    slugify = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') or 'skill'
    matches = [s for s in data['skills'] if '/'.join(map(slugify, s['repo'].split('/'))) + '/' + s['slug'] == args.skill_id]
    if len(matches) != 1:
        parser.error('Skill must already be accepted in directory/skills.json')
    skill = matches[0]
    # Reuse the builder's exact eligibility, URL and badge contract.
    contract = json.loads(subprocess.run(['node', '--input-type=module', '-e',
        "import {badgePair,listingTarget} from './scripts/directory/badges.mjs'; let s=JSON.parse(process.argv[1]); console.log(JSON.stringify({target:listingTarget(s),badges:badgePair(s).map(b=>b.src)}));", json.dumps(skill)],
        cwd=ROOT, check=True, capture_output=True, text=True).stdout)
    config_path = ROOT / 'directory/promotion.json'
    config = json.loads(config_path.read_text())
    record = {'repo': skill['repo'], 'score': skill['score'], 'target': contract['target'], 'readme_path': args.readme,
              'verified_at': datetime.now(timezone.utc).isoformat(), 'status': 'fetch_failed', 'badges': []}
    from urllib.parse import quote
    try:
        meta = json.loads(gh(f"repos/{skill['repo']}"))
        commit = json.loads(gh(f"repos/{skill['repo']}/commits/{quote(meta['default_branch'], safe='')}"))['sha']
        if not re.fullmatch('[a-f0-9]{40}', commit):
            raise ValueError('Invalid source commit')
        rendered = gh(f"repos/{skill['repo']}/contents/{quote(args.readme, safe='/')}?ref={commit}", 'application/vnd.github.html+json')
        record.update(commit=commit, rendered_sha256=hashlib.sha256(rendered.encode()).hexdigest(),
                      badges=embedded_badges(rendered, contract['target'], contract['badges']))
        record['status'] = 'verified' if set(record['badges']) == set(contract['badges']) else 'missing_badges'
    except (subprocess.SubprocessError, ValueError, KeyError) as exc:
        # Do not copy upstream error content, credentials or README text into
        # the public ledger. A failed fetch cannot retain a prior promotion.
        print(f'Readme verification failed ({type(exc).__name__}); promotion disabled.')
    config.setdefault('verifications', {})[args.skill_id] = record
    config_path.write_text(json.dumps(config, indent=2) + '\n')
    print(f"{args.skill_id}: {record['status']}. Rebuild the directory to apply.")
    return 0 if record['status'] == 'verified' else 1


if __name__ == '__main__':
    raise SystemExit(main())
