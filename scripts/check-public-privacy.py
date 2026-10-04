#!/usr/bin/env python3
"""Detect specific public-data regressions; print locations, never matched values.

Scans tracked source (including installable references), generated packages and
PDF text. This is a bounded regression check, not a complete PII classifier.
"""
import argparse
import hashlib
import html
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
POLICY = Path(__file__).with_name('public-privacy-policy.json')
EMAIL = re.compile(r'\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b')
PATTERNS = {
    'private-key': re.compile(r'-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY'),
    'provider-token': re.compile(r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}|(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{12,}|xox[baprs]-[A-Za-z0-9-]{20,}|sb_secret_[A-Za-z0-9_-]{20,}|A[KS]IA[A-Z0-9]{16})\b'),
    'jwt': re.compile(r'\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\b'),
    'personal-path': re.compile(r'(?:/Us' r'ers/|/ho' r'me/)[A-Za-z0-9._-]+|[A-Za-z]:\\Us' r'ers\\[^\s"\x27<>`]+'),
    'order-identifier': re.compile(r'\b\d{3}-\d{7}-\d{7}\b'),
    'ssn-shaped-identifier': re.compile(r'(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)'),
    'credential-assignment': re.compile(r'''(?i)\b(?:api[_-]?key|secret|password|access[_-]?token|auth[_-]?token)\s*[:=]\s*["']([^"'\n]{12,})["']'''),
}
MONEY = re.compile(r'(?<![\w.])\d[\d,]*\.\d{2}(?!\d)')
RECOVERY_PROOF = re.compile(r'(?:\$\d[\d,.]*.{0,100}\b(?:recovered|refunded|restocking|argued)\b|\b(?:recovered|refunded|restocking|argued)\b.{0,100}\$\d)', re.I)
PHONE = re.compile(r'(?<![\w\d])(?:\+1[ .-]?)?\(?([2-9]\d{2})\)?[ .-]([2-9]\d{2})[ .-](\d{4})(?!\d)')


def decode(text):
    # Public HTML attributes, JSON-LD/JS strings, and percent-encoded URLs.
    for _ in range(2):
        text = html.unescape(unquote(text))
        text = re.sub(r'\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})',
                      lambda m: chr(int(m[1] or m[2], 16)), text)
        text = text.replace(r'\/', '/')
    return text


def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()


def check_text(text, label, policy):
    text = decode(text)
    findings = []

    def add(category, match):
        findings.append({'file': label, 'line': text.count('\n', 0, match.start()) + 1,
                         'category': category})

    for category, pattern in PATTERNS.items():
        for match in pattern.finditer(text):
            add(category, match)
    # Do not store private amounts or their enumerable hashes in public policy.
    # Strip tags without removing newlines, preserving useful source line numbers.
    plain = re.sub(r'<[^>]+>', lambda m: '\n' * m[0].count('\n') or ' ', text)
    for surface in (text, plain):  # Keep attributes as well as rendered text.
        for match in RECOVERY_PROOF.finditer(surface):
            context = surface[max(0, match.start()-160):match.end()+160]
            if re.fullmatch(policy['recovery_surface_path_pattern'], label) or re.search(r'(?i)amazon|restocking', context):
                finding = {'file': label, 'line': surface.count('\n', 0, match.start()) + 1,
                           'category': 'account-recovery-financial-example'}
                if finding not in findings:
                    findings.append(finding)
    for match in PHONE.finditer(text):
        # NANP's reserved fictional subscriber range is suitable for examples.
        if match[2] != '555' or not 100 <= int(match[3]) <= 199:
            add('unreviewed-phone', match)
    for match in EMAIL.finditer(text):
        domain = match[1].lower()
        if domain in ('example.com', 'example.net', 'example.org') or domain.endswith(('.test', '.example', '.invalid')):
            continue
        if any(digest(match[0].lower()) == entry['sha256'] and
               re.fullmatch(entry['path_pattern'], label)
               for entry in policy['intentional_public_contacts']):
            continue
        add('unreviewed-email', match)
    return findings


def scan_file(path, label, policy):
    if path.suffix.lower() == '.pdf':
        try:
            result = subprocess.run(['pdftotext', '-layout', str(path), '-'],
                                    capture_output=True, timeout=60)
        except (OSError, subprocess.TimeoutExpired):
            return [{'file': label, 'category': 'pdf-extraction-unavailable'}], 'unreadable'
        if result.returncode:
            return [{'file': label, 'category': 'pdf-extraction-failed'}], 'unreadable'
        return check_text(result.stdout.decode('utf-8'), label, policy), 'pdf'
    try:
        data = path.read_bytes()
        if b'\0' in data: return [], 'binary-not-inspected'
        text = data.decode('utf-8')
    except UnicodeDecodeError:
        return [], 'binary-not-inspected'
    except OSError:
        return [{'file': label, 'category': 'unreadable-file'}], 'unreadable'
    return check_text(text, label, policy), 'text'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--package', type=Path, help='Also scan an existing generated package directory')
    args = parser.parse_args()
    policy = json.loads(POLICY.read_text())
    tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=args.root).decode().split('\0')
    files = [(args.root / name, name) for name in tracked if name]
    if args.package:
        if not (args.package / 'package.json').is_file():
            print(json.dumps({'category': 'missing-generated-package'}))
            return 1
        files += [(p, 'dist-npm/' + p.relative_to(args.package).as_posix())
                  for p in args.package.rglob('*') if p.is_file()]
    findings = []; coverage = {}
    for path, label in files:
        rows, kind = scan_file(path, label, policy)
        findings.extend(rows); coverage[kind] = coverage.get(kind, 0) + 1
    print(json.dumps({'coverage': coverage, 'findings': findings}, indent=2))
    return int(bool(findings))


if __name__ == '__main__':
    sys.exit(main())
