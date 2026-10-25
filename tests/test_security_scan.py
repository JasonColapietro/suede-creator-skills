import importlib.util
import io
import json
import tarfile
import tempfile
import unittest
import sys
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('source_scan', ROOT / 'scripts/security/scan.py')
scan = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scan)
worker_spec = importlib.util.spec_from_file_location('scan_worker', ROOT / 'scripts/security/worker.py')
worker = importlib.util.module_from_spec(worker_spec)
worker_spec.loader.exec_module(worker)


class PinnedSourceTests(unittest.TestCase):
    def test_source_writer_never_executes_and_refuses_escape_or_oversize(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            canary = b'raise AssertionError("must never execute")\n'
            scan.save_files({'SKILL.md': b'inert data', 'scripts/canary.py': canary}, root)
            self.assertEqual((root / 'scripts/canary.py').read_bytes(), canary)
            for files in ({'SKILL.md': b'x', '../escape': b'x'}, {'SKILL.md': b'x', 'link\\escape': b'x'}, {'no-manifest': b'x'}):
                with self.assertRaises(ValueError):
                    scan.save_files(files, root)
            with patch.object(scan, 'MAX_FILE', 2), self.assertRaises(ValueError):
                scan.save_files({'SKILL.md': b'abc'}, root)

    def test_pinned_archive_must_match_git_blob_inventory(self):
        content = b'---\nname: fixture\n---\nData, never instructions to this test.'
        digest = scan.hashlib.sha1(f'blob {len(content)}\0'.encode() + content).hexdigest()
        source = {'repository': 'publisher/skills', 'revision': 'a' * 40, 'path': 'skills/example'}
        tree = [{'path': 'skills/example/SKILL.md', 'type': 'blob', 'mode': '100644', 'size': len(content), 'sha': digest}]
        def archive(raw):
            output = io.BytesIO()
            with tarfile.open(fileobj=output, mode='w:gz') as tar:
                item = tarfile.TarInfo('skills-commit/skills/example/SKILL.md'); item.size = len(raw)
                tar.addfile(item, io.BytesIO(raw))
            return output.getvalue()
        self.assertEqual(scan.external_files(source, {('publisher/skills', 'a' * 40): (tree, archive(content))}), {'SKILL.md': content})
        with self.assertRaises(ValueError):
            scan.external_files(source, {('publisher/skills', 'a' * 40): (tree, archive(b'changed'))})
        for kind, mode in [('blob', '120000'), ('commit', '160000')]:
            with self.assertRaises(ValueError):
                scan.external_files(source, {('publisher/skills', 'a' * 40): ([{**tree[0], 'type': kind, 'mode': mode}], archive(content))})

    def test_branch_names_and_arbitrary_hosts_are_not_pinned_sources(self):
        for source in [dict(repository='publisher/skills', revision='main', path='skill'),
                       dict(repository='https://attacker.invalid/x', revision='a'*40, path='skill'),
                       dict(repository='publisher/skills', revision='a'*40, path='../skill')]:
            with self.assertRaises(ValueError):
                scan.external_files(source, {})

    def test_failed_acquisition_does_not_prevent_the_next_target(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'directory').mkdir(); (root / 'scripts/security').mkdir(parents=True)
            dataset = {'repos': {'publisher/skills': {'commit_sha': 'a' * 40}}, 'skills': [
                {'repo': 'publisher/skills', 'dir': 'one', 'slug': 'one'},
                {'repo': 'publisher/skills', 'dir': 'two', 'slug': 'two'}]}
            (root / 'directory/skills.json').write_text(json.dumps(dataset))
            (root / 'scripts/security/requirements.txt').write_bytes((ROOT / 'scripts/security/requirements.txt').read_bytes())
            with patch.object(scan, 'ROOT', root), patch.object(scan, 'external_files', side_effect=[ValueError(), {'SKILL.md': b'source'}]) as acquire, \
                 patch.object(scan, 'run', side_effect=FileNotFoundError('no runtime')), \
                 patch.object(scan, 'evaluate', side_effect=lambda record: {'status': record['state'], 'reason': record['reason']}), \
                 patch.object(sys, 'argv', ['scan', '--external', 'publisher/skills/one', 'publisher/skills/two', '--output', str(root / 'out')]):
                self.assertEqual(scan.main(), 1)
                self.assertEqual(acquire.call_count, 2)
                summary = json.loads((root / 'out/summary.json').read_text())
                self.assertEqual([row['reason'] for row in summary], ['source_acquisition_error', 'runtime_unavailable_or_no_result'])

    def test_worker_normalizes_success_shape_and_marks_unparsed_or_opaque_source_incomplete(self):
        class Result:
            def to_dict(self):
                return {'findings': [], 'findings_count': 0, 'analyzers_used': scan.PROFILE['analyzers']}
        class Scanner:
            def scan_skill(self, root):
                return Result()
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp); target = base / 'target-000'; target.mkdir()
            (target / 'SKILL.md').write_text('Source data')
            record = worker.scan_target({'directory': target.name, 'source': {}}, scan.PROFILE, Scanner(), worker.ScanLogs(), base)
            self.assertEqual(record['analysis']['analyzers_failed'], [])
            self.assertTrue(record['coverage']['complete'])
            (target / 'tool').write_text('#!/usr/bin/env python3\ndef invalid(:\n')
            (target / 'blob.zip').write_bytes(b'archive')
            record = worker.scan_target({'directory': target.name, 'source': {}}, scan.PROFILE, Scanner(), worker.ScanLogs(), base)
            self.assertFalse(record['coverage']['complete'])
            self.assertEqual({row['reason'] for row in record['coverage']['skipped']}, {'unparsed_source', 'opaque_or_archive_coverage'})

    def test_runtime_failure_retains_records_already_completed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); (root / 'scripts/security').mkdir(parents=True)
            (root / 'scripts/security/requirements.txt').write_bytes((ROOT / 'scripts/security/requirements.txt').read_bytes())
            def runtime(args, **kwargs):
                if args[:3] == ['docker', 'image', 'inspect']:
                    return scan.subprocess.CompletedProcess(args, 0, stdout='sha256:' + 'b' * 64)
                if args[:2] == ['docker', 'run']:
                    mounts = [args[index + 1] for index, value in enumerate(args) if value == '--mount']
                    source = Path(next(value.split('source=')[1].split(',')[0] for value in mounts if 'target=/source' in value))
                    output = Path(next(value.split('source=')[1].split(',')[0] for value in mounts if 'target=/output' in value))
                    manifest = json.loads((source / 'manifest.json').read_text())
                    (output / '0.json').write_text(json.dumps({'source': manifest['targets'][0]['source'], 'state': 'completed', 'analysis': {'findings': [{'severity': 'HIGH'}]}}))
                    raise scan.subprocess.CalledProcessError(137, args, stderr=b'synthetic OOM')
                return scan.subprocess.CompletedProcess(args, 0)
            with patch.object(scan, 'ROOT', root), patch.object(scan, 'run', side_effect=runtime), \
                 patch.object(scan, 'evaluate', side_effect=lambda record: {'status': record['state'], 'reason': 'test'}), \
                 patch.object(sys, 'argv', ['scan', '--self-test', '--output', str(root / 'out')]):
                self.assertEqual(scan.main(), 1)
            retained = [json.loads(file.read_text()) for file in (root / 'out').glob('*.json') if re_hash(file.stem)]
            complete = next(record for record in retained if record['state'] == 'completed')
            self.assertEqual(complete['analysis']['findings'], [{'severity': 'HIGH'}])


def re_hash(value):
    return len(value) == 64 and all(c in '0123456789abcdef' for c in value)


if __name__ == '__main__':
    unittest.main()
