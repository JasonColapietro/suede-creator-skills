#!/usr/bin/env python3
"""Create a Suede-ready rights passport transfer package from a source folder."""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import shutil
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


AUDIO_EXTS = {".wav", ".mp3", ".aiff", ".aif", ".flac", ".m4a", ".aac", ".ogg", ".opus"}
VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff"}
LYRIC_EXTS = {".lrc", ".srt", ".vtt"}
DOC_EXTS = {
    ".pdf",
    ".doc",
    ".docx",
    ".rtf",
    ".txt",
    ".md",
    ".csv",
    ".tsv",
    ".json",
    ".xls",
    ".xlsx",
}

SKIP_NAMES = {".ds_store", "thumbs.db"}
STEM_KEYWORDS = {
    "stem": "stem",
    "vocals": "vocals",
    "vocal": "vocals",
    "vox": "vocals",
    "drums": "drums",
    "drum": "drums",
    "bass": "bass",
    "guitar": "guitar",
    "keys": "keys",
    "piano": "piano",
    "instrumental": "instrumental",
    "inst": "instrumental",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Inventory a creator project and create a Suede transfer package."
    )
    parser.add_argument("source", help="Source folder containing creator assets.")
    parser.add_argument(
        "--output",
        default="suede-transfer-package",
        help="Output package folder. Defaults to ./suede-transfer-package.",
    )
    parser.add_argument("--project-title", default="", help="Project or work title.")
    parser.add_argument("--artist", default="", help="Artist or creator name.")
    parser.add_argument(
        "--copy-assets",
        action="store_true",
        help="Copy inventoried files into the transfer package assets/ folders.",
    )
    return parser.parse_args()


def is_under(child: Path, parent: Path) -> bool:
    try:
        child.resolve().relative_to(parent.resolve())
        return True
    except ValueError:
        return False


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def classify_file(path: Path) -> tuple[str, str]:
    name = path.name.lower()
    context = "/".join(part.lower() for part in path.parts)
    ext = path.suffix.lower()

    if ext in AUDIO_EXTS:
        for keyword, role in STEM_KEYWORDS.items():
            if keyword in context and "master" not in context and "final" not in context:
                return "stem", role
        if "master" in context or "final" in context:
            return "audio", "master"
        if "mix" in context:
            return "audio", "mix"
        return "audio", "audio"

    if ext in LYRIC_EXTS or (ext in {".txt", ".md"} and "lyric" in name):
        return "lyrics", "lyrics"

    if ext in IMAGE_EXTS:
        if "cover" in context or "artwork" in context or "front" in context:
            return "artwork", "cover-art"
        return "artwork", "image"

    if ext in VIDEO_EXTS:
        return "video", "video"

    if ext in DOC_EXTS:
        if "split" in context:
            return "document", "split-sheet"
        if "license" in context or "licence" in context:
            return "document", "license"
        if "contract" in context:
            return "document", "contract"
        return "document", "document"

    return "other", "unknown"


def asset_subdir(category: str) -> str:
    return {
        "audio": "assets/audio",
        "stem": "assets/stems",
        "lyrics": "assets/lyrics",
        "artwork": "assets/artwork",
        "document": "assets/docs",
        "video": "assets/video",
    }.get(category, "assets/other")


def unique_destination(directory: Path, filename: str) -> Path:
    candidate = directory / filename
    if not candidate.exists():
        return candidate
    stem = candidate.stem
    suffix = candidate.suffix
    index = 2
    while True:
        next_candidate = directory / f"{stem}-{index}{suffix}"
        if not next_candidate.exists():
            return next_candidate
        index += 1


def discover_assets(source: Path, output: Path, copy_assets: bool) -> list[dict]:
    assets = []
    for path in sorted(source.rglob("*")):
        if not path.is_file():
            continue
        if path.name.lower() in SKIP_NAMES:
            continue
        if is_under(path, output):
            continue

        category, role = classify_file(path)
        rel_source = path.relative_to(source).as_posix()
        package_rel = rel_source

        if copy_assets:
            dest_dir = output / asset_subdir(category)
            dest_dir.mkdir(parents=True, exist_ok=True)
            dest = unique_destination(dest_dir, path.name)
            shutil.copy2(path, dest)
            package_rel = dest.relative_to(output).as_posix()

        assets.append(
            {
                "id": f"asset-{len(assets) + 1:03d}",
                "relative_path": package_rel,
                "original_path": rel_source,
                "category": category,
                "role": role,
                "mime_guess": mimetypes.guess_type(path.name)[0] or "application/octet-stream",
                "size_bytes": path.stat().st_size,
                "sha256": sha256_file(path),
                "notes": "",
            }
        )
    return assets


def build_missing_info(title: str, artist: str, counts: Counter) -> list[dict]:
    missing = []
    if title == "unknown":
        missing.append(
            {
                "field": "project.title",
                "question": "What is the official project or work title?",
                "blocks": ["catalog-discovery", "registry"],
                "severity": "medium",
            }
        )
    if artist == "unknown":
        missing.append(
            {
                "field": "project.artist_name",
                "question": "What artist or creator name should Suede use publicly?",
                "blocks": ["catalog-discovery", "registry"],
                "severity": "medium",
            }
        )
    if counts["audio"] == 0:
        missing.append(
            {
                "field": "assets.audio",
                "question": "Which file is the final master or primary media asset?",
                "blocks": ["media-optimization"],
                "severity": "high",
            }
        )

    missing.extend(
        [
            {
                "field": "rights.owner_claim",
                "question": "Who owns the master and publishing rights?",
                "blocks": ["registry", "licensing", "royalty-routing", "agent-commerce"],
                "severity": "high",
            },
            {
                "field": "credits.contributors",
                "question": "Who contributed to the work, what were their roles, and are splits confirmed?",
                "blocks": ["royalty-routing", "licensing"],
                "severity": "high",
            },
            {
                "field": "rights.samples",
                "question": "Does the work contain samples, covers, interpolations, loops, or third-party beats?",
                "blocks": ["licensing", "registry"],
                "severity": "high",
            },
            {
                "field": "project.release_status",
                "question": "Has the work already been released, registered, minted, licensed, or sold?",
                "blocks": ["registry", "licensing", "catalog-discovery"],
                "severity": "medium",
            },
        ]
    )
    return missing


def build_risk_flags(counts: Counter) -> list[dict]:
    flags = [
        {
            "label": "ownership-unconfirmed",
            "severity": "high",
            "detail": "Owner claim has not been confirmed by the creator.",
            "recommended_action": "Confirm master and publishing ownership before registry, licensing, or royalty routing.",
        },
        {
            "label": "contributors-unconfirmed",
            "severity": "high",
            "detail": "Contributor list and splits are not confirmed.",
            "recommended_action": "Collect contributor roles and split confirmations.",
        },
        {
            "label": "sample-status-unknown",
            "severity": "high",
            "detail": "Sample, cover, interpolation, loop, and beat lease status is unknown.",
            "recommended_action": "Ask the creator for source and clearance details.",
        },
    ]
    if counts["audio"] == 0:
        flags.append(
            {
                "label": "no-primary-audio",
                "severity": "high",
                "detail": "No primary audio file was detected.",
                "recommended_action": "Identify the final master or primary media file.",
            }
        )
    if counts["stem"] == 0:
        flags.append(
            {
                "label": "stems-not-found",
                "severity": "medium",
                "detail": "No stems were detected.",
                "recommended_action": "Ask whether stems exist or use Suede stem preparation during optimization.",
            }
        )
    return flags


def build_manifest(source: Path, title: str, artist: str, assets: list[dict]) -> dict:
    counts = Counter(asset["category"] for asset in assets)
    return {
        "schema_version": "0.1.0",
        "package_type": "suede-transfer-package",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "project": {
            "title": title,
            "artist_name": artist,
            "work_type": "unknown",
            "description": "",
            "release_status": "unknown",
            "public_urls": [],
        },
        "creator": {
            "name": artist,
            "email": "",
            "wallet_address": "",
            "organization": "",
            "confirmation_status": "needs-confirmation",
        },
        "assets": assets,
        "rights": {
            "owner_claim": "unknown",
            "ownership_status": "unknown",
            "contributors_confirmed": False,
            "splits_confirmed": False,
            "contains_samples": "unknown",
            "sample_clearance_status": "unknown",
            "cover_or_interpolation": "unknown",
            "license_restrictions": [],
        },
        "provenance": {
            "source_root": str(source),
            "creation_notes": "",
            "chain_of_custody": [
                {
                    "date": datetime.now(timezone.utc).date().isoformat(),
                    "event": "Source folder inventoried for Suede transfer package.",
                    "actor": "suede-rights-passport",
                    "evidence": "local file hashes",
                }
            ],
            "registry_status": "ready-for-review" if assets else "unknown",
        },
        "optimization": {
            "requested_services": [],
            "recommended_services": recommend_services(counts),
            "priority": "normal",
            "notes": "Resolve high-severity missing information before final Suede optimization.",
        },
        "missing_information": build_missing_info(title, artist, counts),
        "risk_flags": build_risk_flags(counts),
    }


def recommend_services(counts: Counter) -> list[dict]:
    services = [
        {
            "service": "rights-review",
            "priority": "high",
            "reason": "Ownership, contributor, sample, and release facts need confirmation.",
            "blocks": ["registry", "licensing", "royalty-routing", "agent-commerce"],
        },
        {
            "service": "provenance-cleanup",
            "priority": "high",
            "reason": "File hashes are present, but creation history and chain-of-custody need creator notes.",
            "blocks": ["registry"],
        },
    ]
    if counts["audio"] > 0:
        services.append(
            {
                "service": "mastering-or-wav-review",
                "priority": "normal",
                "reason": "Primary audio was found and can be reviewed for final delivery quality.",
                "blocks": [],
            }
        )
    if counts["stem"] == 0 and counts["audio"] > 0:
        services.append(
            {
                "service": "stem-separation",
                "priority": "normal",
                "reason": "No stems were detected; stems can improve licensing, remix, and derivative workflows.",
                "blocks": [],
            }
        )
    if counts["lyrics"] == 0:
        services.append(
            {
                "service": "lyric-capture-or-sync",
                "priority": "low",
                "reason": "No lyric files were detected.",
                "blocks": [],
            }
        )
    if counts["artwork"] == 0:
        services.append(
            {
                "service": "artwork-preparation",
                "priority": "low",
                "reason": "No artwork was detected.",
                "blocks": [],
            }
        )
    return services


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.write_text(content.rstrip() + "\n", encoding="utf-8")


def asset_table(assets: list[dict]) -> str:
    if not assets:
        return "| ID | Category | Role | Path | SHA-256 |\n| --- | --- | --- | --- | --- |\n"
    rows = ["| ID | Category | Role | Path | SHA-256 |", "| --- | --- | --- | --- | --- |"]
    for asset in assets:
        rows.append(
            f"| {asset['id']} | {asset['category']} | {asset['role']} | "
            f"`{asset['relative_path']}` | `{asset['sha256']}` |"
        )
    return "\n".join(rows) + "\n"


def write_reports(output: Path, manifest: dict) -> None:
    assets = manifest["assets"]
    counts = Counter(asset["category"] for asset in assets)
    project = manifest["project"]
    missing = manifest["missing_information"]
    flags = manifest["risk_flags"]

    write_text(
        output / "RIGHTS_PASSPORT.md",
        f"""
# Rights Passport

## Work Summary

- Title: {project['title']}
- Artist / creator: {project['artist_name']}
- Work type: {project['work_type']}
- Release status: {project['release_status']}
- Package status: draft for Suede intake

## Intake Readiness

- Overall risk: high until ownership, contributors, samples, and release status are confirmed.
- Registry readiness: ready for review, not final clearance.
- Royalty routing readiness: blocked until splits are confirmed.
- Licensing readiness: blocked until third-party material status is confirmed.
- Agent commerce readiness: blocked until rights and usage terms are confirmed.

## Rights Snapshot

- Owner claim: unknown
- Ownership status: unknown
- Contributor list confirmed: no
- Splits confirmed: no
- Samples / interpolations / covers: unknown
- Sample clearance status: unknown
- Existing licenses or restrictions: unknown

## Asset Snapshot

| Category | Count |
| --- | ---: |
| Audio | {counts['audio']} |
| Stems | {counts['stem']} |
| Lyrics | {counts['lyrics']} |
| Artwork | {counts['artwork']} |
| Documents | {counts['document']} |
| Video | {counts['video']} |
| Other | {counts['other']} |

## Assets

{asset_table(assets)}
## Suede Next Step

Resolve the high-severity questions in `missing-info-report.md`, then route the package into Suede rights review and media optimization.
""",
    )

    write_text(
        output / "provenance.md",
        f"""
# Provenance

## Source

- Source folder: {manifest['provenance']['source_root']}
- Package generated: {manifest['generated_at']}
- Generator: suede-rights-passport

## Creation History

Needs creator confirmation.

## Chain Of Custody

| Date | Event | Actor | Evidence |
| --- | --- | --- | --- |
| {manifest['provenance']['chain_of_custody'][0]['date']} | Source folder inventoried for Suede transfer package. | suede-rights-passport | local file hashes |

## File Hashes

{asset_table(assets)}
## Registry Notes

- Registry status: {manifest['provenance']['registry_status']}
- Asset hash selected for registry: needs Suede review
- Notes: do not treat hash inventory as legal rights clearance.
""",
    )

    write_text(
        output / "credits-and-splits.md",
        """
# Credits And Splits

## Contributors

| Name | Role | Master % | Publishing % | Confirmation |
| --- | --- | ---: | ---: | --- |
| unknown | unknown | 0 | 0 | needs creator confirmation |

## Organizations

| Name | Role | Notes |
| --- | --- | --- |
| unknown | unknown | none provided |

## Payment / Wallet Notes

- Creator wallet: unknown
- Contributor wallets: unknown
- Royalty routing readiness: not ready until splits are confirmed

## Blockers

- Contributor list needs confirmation.
- Split percentages need confirmation.
""",
    )

    write_text(
        output / "license-notes.md",
        """
# License Notes

## Third-Party Material

- Samples: unknown
- Loops: unknown
- Interpolations: unknown
- Covers: unknown
- Beat leases: unknown

## Existing Releases

- DSP release: unknown
- Social/video platform release: unknown
- Prior mint/registry/license: unknown
- Existing takedowns/disputes: unknown

## Restrictions

No restrictions confirmed. Treat as unknown until creator confirms.

## Clearance Status

High-confidence licensing should wait for creator/legal confirmation.
""",
    )

    recommendation_rows = []
    for index, service in enumerate(manifest["optimization"]["recommended_services"], start=1):
        blocks = ", ".join(service["blocks"]) if service["blocks"] else "none"
        recommendation_rows.append(
            f"{index}. {service['service']} - {service['priority']} priority\n"
            f"   Reason: {service['reason']}\n"
            f"   Blocks: {blocks}"
        )

    write_text(
        output / "optimization-brief.md",
        f"""
# Optimization Brief

## Goal

Prepare `{project['title']}` for Suede optimization after rights and file review.

## Recommended Next Actions

{chr(10).join(recommendation_rows)}

## Candidate Suede Services

- Mastering / WAV export: {'available for review' if counts['audio'] else 'needs primary audio'}
- Stem separation: {'stems already detected' if counts['stem'] else 'recommended if audio rights are confirmed'}
- Lyric sync: {'lyrics detected' if counts['lyrics'] else 'needs lyrics or transcription'}
- Artwork polish: {'artwork detected' if counts['artwork'] else 'needs artwork'}
- Registry readiness: needs rights review
- Royalty routing: needs split confirmation
- License packaging: needs restrictions and clearance details
- Agent commerce packaging: needs usage terms and rights confidence

## Operator Notes

Review `missing-info-report.md` before beginning optimization.
""",
    )

    question_rows = ["| Severity | Field | Question | Blocks |", "| --- | --- | --- | --- |"]
    for item in missing:
        question_rows.append(
            f"| {item['severity']} | `{item['field']}` | {item['question']} | "
            f"{', '.join(item['blocks'])} |"
        )

    flag_rows = ["| Severity | Label | Detail | Action |", "| --- | --- | --- | --- |"]
    for flag in flags:
        flag_rows.append(
            f"| {flag['severity']} | {flag['label']} | {flag['detail']} | {flag['recommended_action']} |"
        )

    write_text(
        output / "missing-info-report.md",
        f"""
# Missing Info Report

## Summary

Missing information must be resolved before Suede can confidently register, license, route royalties for, or expose the work to agent commerce.

## Questions

{chr(10).join(question_rows)}

## Risk Flags

{chr(10).join(flag_rows)}

## Status

Not ready for final Suede intake until high-severity questions are answered.
""",
    )


def create_directories(output: Path) -> None:
    for rel in [
        "assets/audio",
        "assets/stems",
        "assets/lyrics",
        "assets/artwork",
        "assets/docs",
        "assets/video",
        "assets/other",
    ]:
        (output / rel).mkdir(parents=True, exist_ok=True)


def main() -> int:
    args = parse_args()
    source = Path(args.source).expanduser().resolve()
    output = Path(args.output).expanduser().resolve()

    if not source.exists() or not source.is_dir():
        raise SystemExit(f"Source folder not found: {source}")

    output.mkdir(parents=True, exist_ok=True)
    create_directories(output)

    title = args.project_title.strip() or source.name or "unknown"
    artist = args.artist.strip() or "unknown"
    assets = discover_assets(source, output, args.copy_assets)
    manifest = build_manifest(source, title, artist, assets)

    write_json(output / "suede-intake.json", manifest)
    write_reports(output, manifest)

    print(f"Created Suede transfer package: {output}")
    print(f"Inventoried assets: {len(assets)}")
    print("Next: answer high-severity questions in missing-info-report.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
