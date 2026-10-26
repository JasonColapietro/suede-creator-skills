"""The published first-party matrix must describe its retained, exact-source scan."""

from collections import Counter
import hashlib
import json
from pathlib import Path
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[1]
INTAKE = ROOT / "directory/intake"
EVIDENCE = INTAKE / "first-party-2026-10-26/final-source-scan"


def read_json(path):
    return json.loads(path.read_text())


class FirstPartyScanEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.receipt = read_json(INTAKE / "2026-10-26-first-party.json")
        self.manifest = read_json(EVIDENCE / "manifest.json")
        self.inventory = read_json(EVIDENCE / "target-inventory.json")
        self.verified = read_json(EVIDENCE / "verified-summary.json")
        self.matrix = read_json(INTAKE / "first-party-2026-10-26/baseline-to-final.json")
        self.summary = read_json(EVIDENCE / "raw/security-first-party/summary.json")

    def test_scan_revision_and_every_package_hash_match_the_intake(self):
        revision = self.receipt["source_revision"]
        for actual in (self.manifest["target_source_revision"], self.inventory["revision"],
                       self.verified["target_revision"], self.matrix["source_revision"]):
            self.assertEqual(actual, revision)
        expected = {p: digest for p, digest in self.receipt["source_files"].items()
                    if p.startswith("skills/")}
        scanned = {f"skills/{name}/{p}": digest
                   for name, files in self.inventory["packages"].items()
                   for p, digest in files.items()}
        self.assertEqual(scanned, expected)
        self.assertEqual(len(scanned), 634)
        self.assertEqual(self.manifest["inventory_files_verified"], len(scanned))
        self.assertEqual(self.verified["package_files_hash_matched"], len(scanned))
        self.assertEqual(self.manifest["inventory_mismatches"], 0)
        self.assertEqual(self.verified["mismatches"], 0)

    def test_retained_artifact_and_all_public_evidence_hashes_are_verifiable(self):
        # A public manifest must not claim that unavailable operational logs are retained here.
        actual_files = {p.relative_to(EVIDENCE).as_posix()
                        for p in EVIDENCE.rglob("*") if p.is_file() and p.name != "manifest.json"}
        self.assertEqual(set(self.manifest["files"]), actual_files)
        for relative, expected in self.manifest["files"].items():
            with self.subTest(file=relative):
                self.assertEqual(hashlib.sha256((EVIDENCE / relative).read_bytes()).hexdigest(), expected)
        archives = list(EVIDENCE.glob("*.zip"))
        self.assertEqual(len(archives), 1)
        digest = hashlib.sha256(archives[0].read_bytes()).hexdigest()
        self.assertEqual(digest, self.manifest["artifact_sha256"])
        self.assertEqual(digest, self.verified["artifact_sha256"])
        with zipfile.ZipFile(archives[0]) as archive:
            raw_files = {p.relative_to(EVIDENCE / "raw").as_posix()
                         for p in (EVIDENCE / "raw").rglob("*") if p.is_file()}
            self.assertEqual(set(archive.namelist()), raw_files)
            for relative in raw_files:
                self.assertEqual(archive.read(relative), (EVIDENCE / "raw" / relative).read_bytes(), relative)

    def test_every_matrix_row_preserves_raw_findings_even_when_coverage_is_incomplete(self):
        rows = {r["name"]: r for r in self.matrix["rows"]}
        records = {r["source"]["path"].removeprefix("skills/"): r for r in self.summary}
        self.assertEqual(len(rows), len(self.matrix["rows"]))
        self.assertEqual(len(records), len(self.summary))
        self.assertEqual(set(rows), set(self.receipt["scope"]))
        self.assertEqual(set(records), set(rows))
        statuses, severities, rules = Counter(), Counter(), Counter()
        for name, row in rows.items():
            record = records[name]
            digest = record["evidence_sha256"]
            raw_bytes = (EVIDENCE / "raw/security-first-party" / f"{digest}.json").read_bytes()
            self.assertEqual(hashlib.sha256(raw_bytes).hexdigest(), digest, name)
            raw = json.loads(raw_bytes)
            self.assertEqual(raw["source"], record["source"], name)
            self.assertEqual(raw["source"]["revision"], self.receipt["source_revision"], name)
            covered = {f["path"]: f["sha256"] for f in raw["coverage"]["files"]}
            self.assertEqual(len(covered), len(raw["coverage"]["files"]), name)
            self.assertEqual(covered, self.inventory["packages"][name], name)
            self.assertEqual(raw["coverage"]["complete"], record["coverage_complete"], name)
            self.assertEqual(raw["coverage"]["skipped"], record["skipped"], name)
            findings = raw["analysis"]["findings"]
            counts = Counter(f["severity"] for f in findings)
            with self.subTest(skill=name):
                # The adapter omits summary.findings on coverage errors; the raw analysis retains them.
                self.assertEqual(row["final_source_scan_severities"], dict(counts))
                self.assertEqual(row["final_source_scan_status"], record["status"])
                self.assertEqual(row["final_source_scan_evidence_sha256"], digest)
                self.assertEqual(raw["analysis"]["findings_count"], len(findings))
            severities.update(counts)
            rules.update(f["rule_id"] for f in findings)
            statuses.update([record["status"]])
        self.assertEqual(dict(statuses), self.verified["security_status"])
        self.assertEqual(dict(severities), self.verified["findings_by_severity"])
        self.assertEqual(dict(rules), self.verified["findings_by_rule"])
        self.assertEqual(dict(statuses), {"findings": 60, "failed": 3, "error": 1})
        self.assertEqual(dict(severities), {"CRITICAL": 16, "MEDIUM": 19, "LOW": 20, "INFO": 64})
        self.assertEqual(sum(severities.values()), 119)
        self.assertEqual(rows["suede-release-linter"]["final_source_scan_severities"], {"MEDIUM": 10, "INFO": 1})
        self.assertEqual(self.manifest["job_conclusion"], "failure")
        self.assertEqual(self.receipt["security_scan_status"], "not_scanned")


if __name__ == "__main__":
    unittest.main()
