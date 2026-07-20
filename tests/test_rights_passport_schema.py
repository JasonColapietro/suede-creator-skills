from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "suede-rights-passport"
CREATE = SKILL / "scripts" / "create_transfer_package.py"
VALIDATE = SKILL / "scripts" / "validate_transfer_package.py"
MIGRATE = SKILL / "scripts" / "migrate_intake_v1_to_v2.py"
SCHEMA = SKILL / "assets" / "suede-intake.schema.json"
LEGACY_FIXTURE = SKILL / "scripts" / "fixtures" / "sample-complete-package"


def load_validator_module():
    spec = importlib.util.spec_from_file_location("suede_rights_validator", VALIDATE)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load {VALIDATE}")
    module = importlib.util.module_from_spec(spec)
    script_dir = str(VALIDATE.parent)
    sys.path.insert(0, script_dir)
    try:
        spec.loader.exec_module(module)
    finally:
        sys.path.remove(script_dir)
    return module


class RightsPassportSchemaTests(unittest.TestCase):
    def test_formal_schema_declares_current_interoperability_contract(self) -> None:
        schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
        self.assertEqual(schema["$schema"], "https://json-schema.org/draft/2020-12/schema")
        self.assertEqual(schema["properties"]["schema_version"]["const"], "0.2.0")
        required = set(schema["required"])
        self.assertTrue(
            {
                "parties",
                "works",
                "recordings",
                "releases",
                "rights_claims",
                "licenses",
                "consents",
                "privacy",
            }.issubset(required)
        )

    def test_published_schema_is_executed_not_only_documented(self) -> None:
        validator = load_validator_module()
        template = json.loads(
            (SKILL / "assets" / "suede-intake.template.json").read_text(encoding="utf-8")
        )
        errors = validator.check_published_json_schema(template)
        self.assertTrue(any("/generated_at" in error and "expected type string" in error for error in errors))

    def test_legacy_package_is_inspectable_but_not_strict_current(self) -> None:
        normal = subprocess.run(
            [sys.executable, str(VALIDATE), str(LEGACY_FIXTURE)],
            check=False,
            capture_output=True,
            text=True,
        )
        strict = subprocess.run(
            [sys.executable, str(VALIDATE), "--strict-current", str(LEGACY_FIXTURE)],
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertEqual(normal.returncode, 0, normal.stderr)
        self.assertIn("Schema 0.1.0 (legacy)", normal.stdout)
        self.assertNotEqual(strict.returncode, 0)
        self.assertIn("requires 0.2.0", strict.stderr)

    def test_generator_emits_strict_current_package(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            temp = Path(tmp)
            source = temp / "source"
            source.mkdir()
            (source / "Example Master.wav").write_bytes(b"synthetic-test-audio")
            metadata = {
                "project": {"title": "Example", "artist_name": "Example Artist", "work_type": "song"},
                "rights": {
                    "owner_claim": "Example Artist",
                    "ownership_status": "claimed",
                    "contributors": [
                        {
                            "name": "Example Artist",
                            "role": "writer, performer",
                            "master_percent": 100,
                            "publishing_percent": 100,
                            "confirmed": False,
                        }
                    ],
                    "contains_samples": "no",
                    "sample_clearance_status": "not-needed",
                    "cover_or_interpolation": "no",
                },
            }
            metadata_path = source / "metadata.json"
            metadata_path.write_text(json.dumps(metadata), encoding="utf-8")
            package = temp / "package"
            create = subprocess.run(
                [
                    sys.executable,
                    str(CREATE),
                    str(source),
                    "--output",
                    str(package),
                    "--metadata",
                    str(metadata_path),
                ],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(create.returncode, 0, create.stderr)
            validate = subprocess.run(
                [sys.executable, str(VALIDATE), "--strict-current", str(package)],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(validate.returncode, 0, validate.stderr)
            manifest = json.loads((package / "suede-intake.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["schema_version"], "0.2.0")
            self.assertEqual(manifest["privacy"]["default_classification"], "private-draft")
            self.assertEqual(manifest["works"][0]["id"], "work-001")
            self.assertEqual(manifest["recordings"][0]["id"], "recording-001")
            self.assertEqual(manifest["rights_claims"][0]["status"], "unconfirmed")

    def test_legacy_migration_is_non_destructive_and_strict_current(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "suede-intake.v0.2.json"
            source = LEGACY_FIXTURE / "suede-intake.json"
            before = source.read_bytes()
            result = subprocess.run(
                [sys.executable, str(MIGRATE), str(source), "--output", str(output)],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(source.read_bytes(), before)
            migrated = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(migrated["schema_version"], "0.2.0")
            self.assertTrue(
                any(
                    "sha256:" in str(event.get("evidence", ""))
                    for event in migrated["provenance"]["chain_of_custody"]
                    if isinstance(event, dict)
                )
            )
            validator = load_validator_module()
            self.assertEqual(validator.check_v2_interoperability(migrated), [])
            self.assertEqual(validator.check_published_json_schema(migrated), [])

    def test_migration_preserves_custody_and_does_not_invent_manager_roles(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            temp = Path(tmp)
            legacy = json.loads((LEGACY_FIXTURE / "suede-intake.json").read_text(encoding="utf-8"))
            legacy["rights"]["contributors"].append(
                {"name": "Morgan Manager", "role": "manager", "confirmed": True}
            )
            signed_event = {
                "date": "2025-06-01",
                "event": "Signed catalog transfer received.",
                "actor": "creator",
                "evidence": "docs/signed-transfer.pdf",
            }
            legacy["provenance"]["chain_of_custody"].append(signed_event)
            source = temp / "suede-intake.json"
            output = temp / "suede-intake.v0.2.json"
            source.write_text(json.dumps(legacy), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(MIGRATE), str(source), "--output", str(output)],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            migrated = json.loads(output.read_text(encoding="utf-8"))
            self.assertIn(signed_event, migrated["provenance"]["chain_of_custody"])
            manager = next(party for party in migrated["parties"] if party["name"] == "Morgan Manager")
            self.assertNotIn(manager["id"], migrated["works"][0]["writer_party_ids"])
            self.assertNotIn(manager["id"], migrated["recordings"][0]["performer_party_ids"])

    def test_builder_rejects_symlinks_before_hash_or_copy(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            temp = Path(tmp)
            source = temp / "source"
            source.mkdir()
            outside = temp / "private-license.pdf"
            outside.write_bytes(b"external-private-evidence")
            (source / "license.pdf").symlink_to(outside)
            package = temp / "package"
            result = subprocess.run(
                [sys.executable, str(CREATE), str(source), "--output", str(package), "--copy-assets"],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Refusing symlink inside source tree", result.stderr)
            self.assertFalse(any(path.name == "license.pdf" for path in package.rglob("*") if path.is_file()))

    def test_confirmed_without_evidence_and_oversubscribed_shares_fail(self) -> None:
        validator = load_validator_module()
        manifest = json.loads((SKILL / "assets" / "suede-intake.template.json").read_text(encoding="utf-8"))
        manifest["parties"] = [
            {
                "id": "party-001",
                "name": "Example",
                "roles": ["writer"],
                "identifiers": [],
                "organization": "",
                "status": "confirmed",
                "evidence_refs": [],
                "privacy_classification": "private-draft",
            }
        ]
        manifest["works"][0]["writer_party_ids"] = ["party-001"]
        manifest["rights_claims"] = [
            {
                "id": "claim-001",
                "subject_type": "work",
                "subject_id": "work-001",
                "right_type": "publishing",
                "party_id": "party-001",
                "share_percent": 60,
                "territories": [],
                "start_date": None,
                "end_date": None,
                "status": "claimed",
                "evidence_refs": [],
                "conflict_notes": "",
            },
            {
                "id": "claim-002",
                "subject_type": "work",
                "subject_id": "work-001",
                "right_type": "publishing",
                "party_id": "party-001",
                "share_percent": 50,
                "territories": [],
                "start_date": None,
                "end_date": None,
                "status": "claimed",
                "evidence_refs": [],
                "conflict_notes": "",
            },
        ]
        errors = validator.check_v2_interoperability(manifest)
        self.assertTrue(any("confirmed but has no evidence_refs" in error for error in errors))
        self.assertTrue(any("above 100%" in error for error in errors))

        manifest["rights_claims"][0]["territories"] = ["US"]
        manifest["rights_claims"][1]["territories"] = ["GB"]
        scoped_errors = validator.check_v2_interoperability(manifest)
        self.assertFalse(any("above 100%" in error for error in scoped_errors))


if __name__ == "__main__":
    unittest.main()
