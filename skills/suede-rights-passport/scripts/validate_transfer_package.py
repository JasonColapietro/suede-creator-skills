#!/usr/bin/env python3
"""Validate the structure of a Suede rights transfer package.

Checks that a package folder produced by create_transfer_package.py (or
hand-assembled to the same standard) is structurally complete:

- All 7 required report files are present.
- suede-intake.json is valid JSON and matches the documented top-level and
  nested shape from references/intake-schema.md.
- Every asset entry in suede-intake.json carries a sha256 hash.

This is a structural/completeness check only. It does not evaluate rights
facts, ownership claims, split confirmations, or risk-flag severity. A
package can be structurally valid while still carrying open, high-severity
risk flags (unconfirmed ownership, unconfirmed splits, unknown sample
status, etc.) -- that is expected and correct for a package documenting a
project with real open questions. See SKILL.md and
references/package-standard.md for what "valid" does and does not mean
here.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


REQUIRED_FILES = [
    "RIGHTS_PASSPORT.md",
    "suede-intake.json",
    "provenance.md",
    "credits-and-splits.md",
    "license-notes.md",
    "optimization-brief.md",
    "missing-info-report.md",
]

# Top-level keys documented in references/intake-schema.md.
REQUIRED_TOP_LEVEL_KEYS = [
    "schema_version",
    "package_type",
    "generated_at",
    "project",
    "creator",
    "assets",
    "rights",
    "provenance",
    "optimization",
    "missing_information",
    "risk_flags",
]

# Nested object/array keys, keyed by their parent top-level field.
REQUIRED_NESTED_KEYS: dict[str, list[str]] = {
    "project": ["title", "artist_name", "work_type", "description", "release_status", "public_urls"],
    "creator": ["name", "email", "wallet_address", "organization", "confirmation_status"],
    "rights": [
        "owner_claim",
        "ownership_status",
        "contributors_confirmed",
        "splits_confirmed",
        "contains_samples",
        "sample_clearance_status",
        "cover_or_interpolation",
        "license_restrictions",
    ],
    "provenance": ["source_root", "creation_notes", "chain_of_custody", "registry_status"],
    "optimization": ["requested_services", "recommended_services", "priority", "notes"],
}

# Required fields per-item for list-shaped sections.
REQUIRED_ASSET_KEYS = [
    "id",
    "relative_path",
    "category",
    "role",
    "mime_guess",
    "size_bytes",
    "sha256",
]
REQUIRED_MISSING_INFO_KEYS = ["field", "question", "blocks", "severity"]
REQUIRED_RISK_FLAG_KEYS = ["label", "severity", "detail", "recommended_action"]


class ValidationError(Exception):
    """Raised for a structural problem; message is shown to the user."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Validate that a Suede rights transfer package folder is "
            "structurally complete: all 7 required report files are present, "
            "suede-intake.json is valid JSON matching the documented schema, "
            "and every asset entry has a sha256 hash. This does not evaluate "
            "rights facts or risk-flag severity -- a structurally valid "
            "package can still carry open, high-severity risk flags."
        )
    )
    parser.add_argument(
        "package",
        help="Path to a transfer package folder (e.g. output of create_transfer_package.py).",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress the pass summary; print nothing on success.",
    )
    return parser.parse_args()


def check_required_files(package: Path) -> list[str]:
    missing = [name for name in REQUIRED_FILES if not (package / name).is_file()]
    if missing:
        return [f"Missing required file: {name}" for name in missing]
    return []


def load_intake_json(package: Path) -> tuple[dict[str, Any] | None, list[str]]:
    intake_path = package / "suede-intake.json"
    if not intake_path.is_file():
        # Already reported by check_required_files; do not double-report.
        return None, []
    text = intake_path.read_text(encoding="utf-8")
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        return None, [f"suede-intake.json is not valid JSON: {exc}"]
    if not isinstance(data, dict):
        return None, ["suede-intake.json must contain a JSON object at the top level."]
    return data, []


def check_top_level_shape(data: dict[str, Any]) -> list[str]:
    errors = []
    for key in REQUIRED_TOP_LEVEL_KEYS:
        if key not in data:
            errors.append(f"suede-intake.json missing top-level field: {key}")
    return errors


def check_nested_shape(data: dict[str, Any]) -> list[str]:
    errors = []
    for parent, keys in REQUIRED_NESTED_KEYS.items():
        section = data.get(parent)
        if not isinstance(section, dict):
            # Missing-top-level-field already reported; skip nested check
            # rather than raising a redundant/confusing error.
            if parent in data:
                errors.append(f"suede-intake.json field '{parent}' must be a JSON object.")
            continue
        for key in keys:
            if key not in section:
                errors.append(f"suede-intake.json '{parent}.{key}' is missing.")
    return errors


def check_list_shaped_sections(data: dict[str, Any]) -> list[str]:
    errors = []
    for field in ("assets", "missing_information", "risk_flags"):
        if field in data and not isinstance(data[field], list):
            errors.append(f"suede-intake.json field '{field}' must be a JSON array.")
    return errors


def check_assets(data: dict[str, Any]) -> list[str]:
    errors = []
    assets = data.get("assets")
    if not isinstance(assets, list):
        return errors  # already reported above
    for index, asset in enumerate(assets):
        label = f"assets[{index}]"
        if not isinstance(asset, dict):
            errors.append(f"suede-intake.json {label} must be a JSON object.")
            continue
        asset_id = asset.get("id")
        if isinstance(asset_id, str) and asset_id:
            label = f"assets[{index}] ({asset_id})"
        for key in REQUIRED_ASSET_KEYS:
            if key not in asset:
                errors.append(f"suede-intake.json {label} missing field: {key}")
        sha = asset.get("sha256")
        if "sha256" in asset:
            if not isinstance(sha, str) or not sha.strip():
                errors.append(f"suede-intake.json {label} has an empty or non-string sha256 field.")
            elif len(sha) != 64 or any(c not in "0123456789abcdefABCDEF" for c in sha):
                errors.append(
                    f"suede-intake.json {label} sha256 field does not look like a 64-char hex digest: {sha!r}"
                )
    return errors


def check_missing_information(data: dict[str, Any]) -> list[str]:
    errors = []
    items = data.get("missing_information")
    if not isinstance(items, list):
        return errors
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            errors.append(f"suede-intake.json missing_information[{index}] must be a JSON object.")
            continue
        for key in REQUIRED_MISSING_INFO_KEYS:
            if key not in item:
                errors.append(f"suede-intake.json missing_information[{index}] missing field: {key}")
    return errors


def check_risk_flags(data: dict[str, Any]) -> list[str]:
    errors = []
    items = data.get("risk_flags")
    if not isinstance(items, list):
        return errors
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            errors.append(f"suede-intake.json risk_flags[{index}] must be a JSON object.")
            continue
        for key in REQUIRED_RISK_FLAG_KEYS:
            if key not in item:
                errors.append(f"suede-intake.json risk_flags[{index}] missing field: {key}")
    return errors


def summarize_risk_posture(data: dict[str, Any]) -> str:
    """Describe risk-flag posture for the pass summary. Informational only --
    never affects the exit code. Structural validity and business-logic
    confirmation status are independent axes; see module docstring."""
    flags = data.get("risk_flags")
    if not isinstance(flags, list) or not flags:
        return "no risk flags recorded"
    high = sum(1 for f in flags if isinstance(f, dict) and f.get("severity") == "high")
    medium = sum(1 for f in flags if isinstance(f, dict) and f.get("severity") == "medium")
    low = sum(1 for f in flags if isinstance(f, dict) and f.get("severity") == "low")
    parts = []
    if high:
        parts.append(f"{high} high")
    if medium:
        parts.append(f"{medium} medium")
    if low:
        parts.append(f"{low} low")
    other = len(flags) - high - medium - low
    if other:
        parts.append(f"{other} other")
    return f"{len(flags)} risk flag(s) recorded ({', '.join(parts)}) -- structural validity is unaffected"


def main() -> int:
    args = parse_args()
    package = Path(args.package).expanduser().resolve()

    if not package.exists() or not package.is_dir():
        print(f"Package folder not found: {package}", file=sys.stderr)
        return 2

    errors: list[str] = []
    errors += check_required_files(package)

    data, load_errors = load_intake_json(package)
    errors += load_errors

    if data is not None:
        errors += check_top_level_shape(data)
        errors += check_nested_shape(data)
        errors += check_list_shaped_sections(data)
        errors += check_assets(data)
        errors += check_missing_information(data)
        errors += check_risk_flags(data)

    if errors:
        print(f"FAIL: {package} is not a structurally valid transfer package.", file=sys.stderr)
        print("", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        print("", file=sys.stderr)
        print(
            "Structural validity means the required files exist and "
            "suede-intake.json matches the documented schema. It says "
            "nothing about whether rights facts are confirmed.",
            file=sys.stderr,
        )
        return 1

    if not args.quiet:
        asset_count = len(data.get("assets", [])) if data else 0
        missing_count = len(data.get("missing_information", [])) if data else 0
        print(f"PASS: {package}")
        print(f"- All {len(REQUIRED_FILES)} required report files present.")
        print("- suede-intake.json is valid JSON and matches the documented schema.")
        print(f"- {asset_count} asset(s) inventoried, each with a sha256 hash.")
        print(f"- {missing_count} open missing-information item(s) recorded.")
        if data is not None:
            print(f"- Risk posture: {summarize_risk_posture(data)}.")
        print(
            "\nThis confirms structural completeness only. Confirm rights facts "
            "with the creator before registry, licensing, or royalty routing."
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
