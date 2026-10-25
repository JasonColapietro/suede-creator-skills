"""Trusted scanner adapter. Runs only inside the network-disabled container.

The target is source data: no imports, target commands, hooks, or target policy.
Opaque files, syntax failures, warnings and scanner truncation prevent a pass.
"""
import ast
import hashlib
import importlib.metadata
import json
import logging
import os
import warnings
from datetime import datetime, timezone
from pathlib import Path


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def inventory(root):
    files, skipped = [], []
    for file in sorted(root.rglob('*')):
        if file.is_symlink() or (not file.is_file() and not file.is_dir()):
            raise ValueError('non_regular_source')
        if not file.is_file():
            continue
        relative = file.relative_to(root).as_posix()
        raw = file.read_bytes()
        files.append({'path': relative, 'size': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
        try:
            text = raw.decode('utf-8')
            if b'\0' in raw or file.suffix.lower() in {'.zip', '.tar', '.gz', '.tgz', '.7z', '.rar', '.pdf', '.docx', '.xlsx', '.pptx', '.pyc'}:
                skipped.append({'path': relative, 'reason': 'opaque_or_archive_coverage'})
            elif file.suffix.lower() in {'.py', '.pyw'} or ('python' in text.split('\n', 1)[0] and text.startswith('#!')):
                ast.parse(text, filename=relative)
            elif not file.suffix and file.name not in {'SKILL', 'LICENSE', 'NOTICE', 'README', 'Makefile', 'Dockerfile'}:
                skipped.append({'path': relative, 'reason': 'extensionless_source_coverage'})
        except (UnicodeError, SyntaxError, ValueError):
            skipped.append({'path': relative, 'reason': 'unparsed_source'})
    if len(files) > 50:
        skipped.append({'reason': 'strict_policy_file_count_limit'})
    return files, skipped


class ScanLogs(logging.Handler):
    def __init__(self):
        super().__init__(logging.WARNING)
        self.events = []

    def emit(self, record):
        # Retain diagnostics as data; stdout never prints submitted skill text.
        self.events.append({'logger': record.name, 'level': record.levelname, 'message': record.getMessage()[:2000]})


def scan_target(target, profile, scanner, logs, source_base=Path('/source')):
    record = {'schema_version': 1, 'source': target['source'], 'scanner': profile, 'started_at': utc_now(), 'state': 'error'}
    logs.events = []
    try:
        root = source_base / target['directory']
        if root.parent != source_base or root.is_symlink():
            raise ValueError('invalid_target_root')
        files, skipped = inventory(root)
        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter('always')
            result = scanner.scan_skill(root).to_dict()
        # Cisco omits this field on successful scans; only this trusted SDK adapter normalizes it.
        result.setdefault('analyzers_failed', [])
        for warning in caught:
            # Dependency API deprecations are retained as maintenance diagnostics.
            # They do not indicate skipped target analysis; all other warnings block.
            logs.events.append({'logger': 'python', 'level': 'WARNING', 'category': warning.category.__name__,
                                'blocking': not issubclass(warning.category, DeprecationWarning), 'message': str(warning.message)[:2000]})
        for finding in result.get('findings', []):
            rule = finding.get('rule_id', '')
            if any(token in rule for token in ('INCOMPLETE', 'LIMIT', 'LOAD_FAILED', 'LOAD_REJECTED', 'UNANALYZABLE')):
                skipped.append({'reason': 'scanner_coverage_finding', 'rule': rule})
        after, _ = inventory(root)
        if files != after:
            raise ValueError('source_changed_during_scan')
        if any(event.get('blocking', True) for event in logs.events):
            skipped.append({'reason': 'scanner_warnings_or_errors'})
        record.update(state='completed', analysis=result, diagnostics=logs.events,
                      coverage={'complete': not skipped, 'files': files, 'skipped': skipped})
    except Exception as error:
        record.update(reason='analyzer_error', error_type=type(error).__name__, diagnostics=logs.events)
    record['completed_at'] = utc_now()
    return record


def main():
    # Verify the isolation the host requested, before any target is opened.
    if os.getuid() != 65534 or set(path.name for path in Path('/sys/class/net').iterdir()) != {'lo'}:
        raise ValueError('runtime_isolation_not_established')
    status = Path('/proc/self/status').read_text()
    if 'NoNewPrivs:\t1' not in status or 'CapEff:\t0000000000000000' not in status:
        raise ValueError('runtime_privileges_not_restricted')
    mounts = [line.split() for line in Path('/proc/mounts').read_text().splitlines()]
    if not any(row[1] == '/source' and 'ro' in row[3].split(',') for row in mounts):
        raise ValueError('source_mount_not_read_only')
    profile = json.loads(Path('/opt/scan/profile.json').read_text())
    if importlib.metadata.version(profile['name']) != profile['version']:
        raise ValueError('scanner_version_mismatch')
    if hashlib.sha256(Path('/opt/scan/requirements.txt').read_bytes()).hexdigest() != profile['lock_sha256']:
        raise ValueError('dependency_lock_mismatch')
    logs = ScanLogs()
    logging.getLogger().addHandler(logs)
    # The trusted installed SDK is imported; no path under /source enters sys.path.
    from skill_scanner.core.analyzer_factory import build_core_analyzers
    from skill_scanner.core.analyzers.behavioral_analyzer import BehavioralAnalyzer
    from skill_scanner.core.scan_policy import ScanPolicy
    from skill_scanner.core.scanner import SkillScanner
    from skill_scanner.core.cel.models import CelMode
    policy = ScanPolicy.from_preset('strict')
    policy.cel.mode = CelMode.SHADOW
    if policy.suppressions or policy.disabled_rules:
        raise ValueError('unexpected_suppressions')
    analyzers = build_core_analyzers(policy)
    behavioral = BehavioralAnalyzer(use_alignment_verification=False)
    behavioral.policy = policy
    analyzers.append(behavioral)
    if [analyzer.get_name() for analyzer in analyzers] != profile['analyzers']:
        raise ValueError('analyzer_configuration_mismatch')
    scanner = SkillScanner(analyzers=analyzers, policy=policy)
    manifest = json.loads(Path('/source/manifest.json').read_text())
    for index, target in enumerate(manifest['targets']):
        record = scan_target(target, profile, scanner, logs)
        Path(f'/output/{index}.json').write_text(json.dumps(record, indent=2) + '\n')


if __name__ == '__main__':
    main()
