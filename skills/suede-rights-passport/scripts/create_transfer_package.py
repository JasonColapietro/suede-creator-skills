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
from typing import Any


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
DENY_DIR_NAMES = {
    ".aws",
    ".azure",
    ".cache",
    ".config",
    ".docker",
    ".gnupg",
    ".gcloud",
    ".git",
    ".hg",
    ".kube",
    ".mypy_cache",
    ".next",
    ".nuxt",
    ".pytest_cache",
    ".ruff_cache",
    ".ssh",
    ".svn",
    ".turbo",
    ".venv",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "env",
    "node_modules",
    "venv",
}
DENY_FILENAMES = {
    ".env",
    ".env.development",
    ".env.local",
    ".env.production",
    ".env.test",
    ".envrc",
    ".netrc",
    ".npmrc",
    ".pypirc",
    "credentials",
    "credentials.json",
    "id_ed25519",
    "id_rsa",
    "kubeconfig",
    "secrets.json",
    "wallet.json",
}
DENY_SUFFIXES = {".env", ".key", ".pem", ".p12", ".pfx"}
SECRET_NAME_TOKENS = {
    "access_token",
    "api_key",
    "apikey",
    "auth_token",
    "client_secret",
    "credential",
    "credentials",
    "password",
    "private_key",
    "private-key",
    "privatekey",
    "refresh_token",
    "secret",
    "seed_phrase",
    "seed-phrase",
    "service_account",
}
GENERATED_FILENAMES = {
    "RIGHTS_PASSPORT.md",
    "credits-and-splits.md",
    "license-notes.md",
    "missing-info-report.md",
    "optimization-brief.md",
    "provenance.md",
    "suede-intake.json",
}
METADATA_CANDIDATES = {
    "metadata.json",
    "release.json",
    "suede-intake.json",
    "metadata.yaml",
    "metadata.yml",
    "release.yaml",
    "release.yml",
}
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
        help="Output package folder. Defaults to ./suede-transfer-package. Must be outside the source folder.",
    )
    parser.add_argument("--project-title", default="", help="Project or work title.")
    parser.add_argument("--artist", default="", help="Artist or creator name.")
    parser.add_argument(
        "--metadata",
        default="",
        help="Optional metadata file: JSON, YAML/YML with PyYAML, or key=value text.",
    )
    parser.add_argument(
        "--copy-assets",
        action="store_true",
        help="Copy inventoried files into the transfer package assets/ folders.",
    )
    parser.add_argument(
        "--include-hidden",
        action="store_true",
        help="Include hidden files and folders. Secret-like files are still skipped.",
    )
    parser.add_argument(
        "--include-other",
        action="store_true",
        help="Include unrecognized file types in the inventory and optional asset copy.",
    )
    parser.add_argument(
        "--include-absolute-paths",
        action="store_true",
        help="Write absolute local paths into reports. Off by default for public-safe sharing.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing generated package files in the output folder.",
    )
    return parser.parse_args()


def load_yaml_if_available(text: str) -> dict[str, Any]:
    try:
        import yaml  # type: ignore
    except Exception as exc:  # pragma: no cover - dependency-dependent
        raise ValueError("YAML metadata requires PyYAML") from exc
    data = yaml.safe_load(text)
    return data if isinstance(data, dict) else {}


def load_key_value(text: str) -> dict[str, Any]:
    data: dict[str, Any] = {}
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data


def load_metadata(path: Path | None) -> dict[str, Any]:
    if path is None:
        return {}
    text = path.read_text(encoding="utf-8")
    suffix = path.suffix.lower()
    if suffix == ".json":
        data = json.loads(text)
        if not isinstance(data, dict):
            raise ValueError(f"Metadata JSON must be an object: {path}")
        return data
    if suffix in {".yaml", ".yml"}:
        return load_yaml_if_available(text)
    return load_key_value(text)


def discover_metadata(source: Path, explicit: str) -> Path | None:
    if explicit:
        path = Path(explicit).expanduser().resolve()
        if not path.exists():
            raise SystemExit(f"Metadata file not found: {path}")
        if is_denied_path(path, source):
            raise SystemExit("Refusing to use a secret-like metadata path. Use a public-safe metadata JSON, YAML, or key=value text file.")
        return path
    for name in METADATA_CANDIDATES:
        candidate = source / name
        if candidate.exists() and candidate.is_file():
            return candidate
    return None


def scoped_value(metadata: dict[str, Any], scope_name: str, keys: str | list[str], default: Any = None) -> Any:
    aliases = [keys] if isinstance(keys, str) else keys
    scoped = metadata.get(scope_name)
    if isinstance(scoped, dict):
        for key in aliases:
            if key in scoped and scoped[key] not in (None, ""):
                return scoped[key]
    for key in aliases:
        if key in metadata and metadata[key] not in (None, ""):
            return metadata[key]
    return default


def project_value(metadata: dict[str, Any], keys: str | list[str], default: Any = None) -> Any:
    return scoped_value(metadata, "project", keys, default)


def creator_value(metadata: dict[str, Any], keys: str | list[str], default: Any = None) -> Any:
    return scoped_value(metadata, "creator", keys, default)


def rights_value(metadata: dict[str, Any], keys: str | list[str], default: Any = None) -> Any:
    return scoped_value(metadata, "rights", keys, default)


def suede_value(metadata: dict[str, Any], keys: str | list[str], default: Any = None) -> Any:
    return scoped_value(metadata, "suede", keys, default)


def boolish(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "y", "confirmed", "claimed", "cleared"}


def confirmed_status(value: Any) -> bool:
    return boolish(value) or str(value).strip().lower() in {"confirmed", "claimed", "cleared"}


def unknown_status(value: Any) -> bool:
    return str(value).strip().lower() in {"", "unknown", "unconfirmed", "needs-confirmation", "needs_confirmation"}


def positive_status(value: Any) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "y", "contains-samples", "contains_samples", "sampled"}


def list_value(value: Any) -> list[Any]:
    if value in (None, ""):
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return [value]


def string_list(value: Any) -> list[str]:
    return [str(item) for item in list_value(value)]


def contributor_confirmed(contributor: Any) -> bool:
    if not isinstance(contributor, dict):
        return False
    explicit = contributor.get("confirmed")
    if explicit not in (None, ""):
        return boolish(explicit)
    return confirmed_status(contributor.get("confirmation_status", ""))


def contributors_all_confirmed(contributors: list[Any]) -> bool:
    return bool(contributors) and all(contributor_confirmed(contributor) for contributor in contributors)


def display_path(path: Path, source: Path, include_absolute: bool) -> str:
    if include_absolute:
        return str(path)
    try:
        return path.relative_to(source).as_posix()
    except ValueError:
        return path.name


def is_under(child: Path, parent: Path) -> bool:
    try:
        child.resolve().relative_to(parent.resolve())
        return True
    except ValueError:
        return False


def is_hidden_path(path: Path, source: Path) -> bool:
    try:
        relative = path.relative_to(source)
    except ValueError:
        relative = path
    return any(part.startswith(".") for part in relative.parts)


def is_denied_path(path: Path, source: Path) -> bool:
    try:
        relative = path.relative_to(source)
        within_source = True
    except ValueError:
        relative = path
        within_source = False
    lowered_parts = [part.lower() for part in relative.parts]
    # Only apply the directory-name denylist to ancestors inside the source
    # folder. For an explicit out-of-source --metadata path, the absolute path
    # may pass through benign dirs (build, .config, coverage, ...) that would
    # otherwise trigger a false "secret-like path" rejection.
    if within_source and any(part in DENY_DIR_NAMES for part in lowered_parts[:-1]):
        return True
    filename = lowered_parts[-1]
    if filename in DENY_FILENAMES or filename.startswith(".env"):
        return True
    if path.suffix.lower() in DENY_SUFFIXES:
        return True
    normalized = filename.replace(".", "_")
    return any(token in normalized for token in SECRET_NAME_TOKENS)


def validate_output(source: Path, output: Path, force: bool) -> None:
    if output == source:
        raise SystemExit("Output folder must be separate from the source folder.")
    if is_under(output, source):
        raise SystemExit("Output folder must be outside the source folder.")
    existing = [output / filename for filename in GENERATED_FILENAMES if (output / filename).exists()]
    if existing and not force:
        names = ", ".join(path.name for path in existing)
        raise SystemExit(f"Refusing to overwrite existing package files ({names}); pass --force to replace them.")


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


def display_source_root(source: Path, include_absolute: bool) -> str:
    return str(source) if include_absolute else source.name


def discover_assets(
    source: Path,
    output: Path,
    copy_assets: bool,
    include_hidden: bool,
    include_other: bool,
) -> list[dict]:
    assets = []
    for path in sorted(source.rglob("*")):
        if not path.is_file():
            continue
        if path.name.lower() in SKIP_NAMES:
            continue
        if is_under(path, output):
            continue
        if is_denied_path(path, source):
            continue
        if not include_hidden and is_hidden_path(path, source):
            continue

        category, role = classify_file(path)
        if category == "other" and not include_other:
            continue
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


def build_missing_info(title: str, artist: str, counts: Counter, project: dict, rights: dict) -> list[dict]:
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

    owner_claim = rights.get("owner_claim", "unknown")
    ownership_status = rights.get("ownership_status", "unknown")
    contributors = rights.get("contributors", [])
    contains_samples = rights.get("contains_samples", "unknown")
    sample_clearance = rights.get("sample_clearance_status", "unknown")
    cover_or_interpolation = rights.get("cover_or_interpolation", "unknown")
    release_status = project.get("release_status", "unknown")

    if unknown_status(owner_claim) or not confirmed_status(ownership_status):
        missing.append(
            {
                "field": "rights.owner_claim",
                "question": "Who owns the master and publishing rights?",
                "blocks": ["registry", "licensing", "royalty-routing", "agent-commerce"],
                "severity": "high",
            }
        )
    if not contributors or not rights.get("contributors_confirmed") or not rights.get("splits_confirmed"):
        missing.append(
            {
                "field": "credits.contributors",
                "question": "Who contributed to the work, what were their roles, and are splits confirmed?",
                "blocks": ["royalty-routing", "licensing"],
                "severity": "high",
            }
        )
    if unknown_status(contains_samples) and unknown_status(cover_or_interpolation):
        missing.append(
            {
                "field": "rights.samples",
                "question": "Does the work contain samples, covers, interpolations, loops, or third-party beats?",
                "blocks": ["licensing", "registry"],
                "severity": "high",
            }
        )
    elif (positive_status(contains_samples) or positive_status(cover_or_interpolation)) and not confirmed_status(sample_clearance):
        missing.append(
            {
                "field": "rights.sample_clearance_status",
                "question": "Are all samples, loops, interpolations, or third-party beats cleared?",
                "blocks": ["licensing", "registry"],
                "severity": "high",
            }
        )
    if unknown_status(release_status):
        missing.append(
            {
                "field": "project.release_status",
                "question": "Has the work already been released, registered, minted, licensed, or sold?",
                "blocks": ["registry", "licensing", "catalog-discovery"],
                "severity": "medium",
            }
        )
    return missing


def build_risk_flags(counts: Counter, rights: dict) -> list[dict]:
    flags = []
    if unknown_status(rights.get("owner_claim", "unknown")) or not confirmed_status(
        rights.get("ownership_status", "unknown")
    ):
        flags.append(
            {
                "label": "ownership-unconfirmed",
                "severity": "high",
                "detail": "Owner claim has not been confirmed by the creator.",
                "recommended_action": "Confirm master and publishing ownership before registry, licensing, or royalty routing.",
            }
        )
    if not rights.get("contributors_confirmed") or not rights.get("splits_confirmed"):
        flags.append(
            {
                "label": "contributors-unconfirmed",
                "severity": "high",
                "detail": "Contributor list and splits are not confirmed.",
                "recommended_action": "Collect contributor roles and split confirmations.",
            }
        )
    contains_samples = rights.get("contains_samples", "unknown")
    sample_clearance = rights.get("sample_clearance_status", "unknown")
    cover_or_interpolation = rights.get("cover_or_interpolation", "unknown")
    if unknown_status(contains_samples) and unknown_status(cover_or_interpolation):
        flags.append(
            {
                "label": "sample-status-unknown",
                "severity": "high",
                "detail": "Sample, cover, interpolation, loop, and beat lease status is unknown.",
                "recommended_action": "Ask the creator for source and clearance details.",
            }
        )
    elif (positive_status(contains_samples) or positive_status(cover_or_interpolation)) and not confirmed_status(sample_clearance):
        flags.append(
            {
                "label": "sample-clearance-unconfirmed",
                "severity": "high",
                "detail": "Samples or third-party material are indicated, but clearance is not confirmed.",
                "recommended_action": "Collect clearance records or remove uncleared material before licensing.",
            }
        )
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


def build_manifest(
    source: Path,
    title: str,
    artist: str,
    assets: list[dict],
    include_absolute_paths: bool,
    metadata: dict[str, Any],
    metadata_source: str,
) -> dict:
    counts = Counter(asset["category"] for asset in assets)
    project = {
        "title": title,
        "artist_name": artist,
        "work_type": str(project_value(metadata, ["work_type", "type"], "unknown")),
        "description": str(project_value(metadata, ["description", "summary", "notes"], "")),
        "release_status": str(
            project_value(
                metadata,
                ["release_status", "release_history", "distribution_status", "registry_status"],
                rights_value(metadata, ["release_history", "release_status"], "unknown"),
            )
        ),
        "public_urls": string_list(project_value(metadata, ["public_urls", "urls", "links"], [])),
    }
    contributors = list_value(rights_value(metadata, ["contributors", "credits"], []))
    contributor_confirmation = rights_value(metadata, ["contributors_confirmed", "credits_confirmed"], None)
    rights = {
        "owner_claim": str(
            rights_value(metadata, ["owner_claim", "owner", "rights_owner", "master_owner", "publishing_owner"], "unknown")
        ),
        "ownership_status": str(
            rights_value(metadata, ["ownership_status", "owner_status", "ownership_confirmed", "owner_confirmed"], "unknown")
        ),
        "contributors": contributors,
        "contributors_confirmed": (
            boolish(contributor_confirmation)
            if contributor_confirmation is not None
            else contributors_all_confirmed(contributors)
        ),
        "splits_confirmed": boolish(rights_value(metadata, ["splits_confirmed", "split_confirmed"], False)),
        "contains_samples": str(
            rights_value(metadata, ["contains_samples", "samples", "sample_status", "third_party_material"], "unknown")
        ),
        "sample_clearance_status": str(
            rights_value(metadata, ["sample_clearance_status", "sample_clearance", "clearance_status"], "unknown")
        ),
        "cover_or_interpolation": str(
            rights_value(metadata, ["cover_or_interpolation", "cover", "interpolation_status"], "unknown")
        ),
        "license_restrictions": string_list(
            rights_value(metadata, ["license_restrictions", "restrictions", "usage_restrictions"], [])
        ),
    }
    provenance_notes = str(
        scoped_value(
            metadata,
            "provenance",
            ["creation_notes", "provenance_notes", "chain_of_custody", "source_notes"],
            suede_value(metadata, ["provenance_notes", "creation_notes", "chain_of_custody", "source_notes"], ""),
        )
    )
    manifest = {
        "schema_version": "0.1.0",
        "package_type": "suede-transfer-package",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "metadata_source": metadata_source,
        "project": project,
        "creator": {
            "name": str(creator_value(metadata, ["name", "artist", "artist_name"], artist)),
            "email": str(creator_value(metadata, ["email", "contact_email"], "")),
            "wallet_address": str(
                creator_value(
                    metadata,
                    ["wallet_address", "wallet", "payment_destination", "payment_address", "royalty_destination"],
                    suede_value(metadata, ["wallet_address", "wallet", "payment_destination"], ""),
                )
            ),
            "organization": str(creator_value(metadata, ["organization", "company", "label"], "")),
            "confirmation_status": str(creator_value(metadata, ["confirmation_status", "status"], "needs-confirmation")),
        },
        "assets": assets,
        "rights": rights,
        "provenance": {
            "source_root": display_source_root(source, include_absolute_paths),
            "metadata_source": metadata_source,
            "creation_notes": provenance_notes,
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
            "requested_services": string_list(suede_value(metadata, ["requested_services", "services"], [])),
            "recommended_services": recommend_services(counts),
            "priority": "normal",
            "notes": str(
                suede_value(
                    metadata,
                    ["optimization_notes", "notes"],
                    "Resolve high-severity missing information before final Suede optimization.",
                )
            ),
        },
    }
    manifest["missing_information"] = build_missing_info(title, artist, counts, project, rights)
    manifest["risk_flags"] = build_risk_flags(counts, rights)
    return manifest


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


def contributors_table(contributors: list[Any]) -> str:
    rows = ["| Name | Role | Master % | Publishing % | Confirmation |", "| --- | --- | ---: | ---: | --- |"]
    if not contributors:
        rows.append("| unknown | unknown | 0 | 0 | needs creator confirmation |")
        return "\n".join(rows) + "\n"
    for contributor in contributors:
        if isinstance(contributor, dict):
            name = contributor.get("name", "unknown")
            role = contributor.get("role", "unknown")
            master = contributor.get("master_percent", contributor.get("master_share", 0))
            publishing = contributor.get("publishing_percent", contributor.get("publishing_share", 0))
            confirmation = contributor.get("confirmation_status", contributor.get("confirmed", "needs creator confirmation"))
        else:
            name = str(contributor)
            role = "unknown"
            master = 0
            publishing = 0
            confirmation = "needs creator confirmation"
        rows.append(f"| {name} | {role} | {master} | {publishing} | {confirmation} |")
    return "\n".join(rows) + "\n"


def restrictions_text(restrictions: list[str]) -> str:
    if not restrictions:
        return "No restrictions confirmed. Treat as unknown until creator confirms."
    return "\n".join(f"- {restriction}" for restriction in restrictions)


def write_reports(output: Path, manifest: dict) -> None:
    assets = manifest["assets"]
    counts = Counter(asset["category"] for asset in assets)
    project = manifest["project"]
    creator = manifest["creator"]
    rights = manifest["rights"]
    provenance = manifest["provenance"]
    missing = manifest["missing_information"]
    flags = manifest["risk_flags"]
    rights_risk = "low" if not flags else "high until listed risk flags are resolved"
    contributor_ready = "yes" if rights["contributors_confirmed"] else "no"
    splits_ready = "yes" if rights["splits_confirmed"] else "no"
    restrictions = rights.get("license_restrictions", [])

    write_text(
        output / "RIGHTS_PASSPORT.md",
        f"""
# Rights Passport

Private draft: review and redact before publishing, committing, or sharing
outside the intended Suede intake workflow.

## Work Summary

- Title: {project['title']}
- Artist / creator: {project['artist_name']}
- Work type: {project['work_type']}
- Release status: {project['release_status']}
- Package status: draft for Suede intake

## Intake Readiness

- Overall risk: {rights_risk}.
- Registry readiness: ready for review, not final clearance.
- Royalty routing readiness: {'ready for review' if rights['splits_confirmed'] else 'blocked until splits are confirmed'}.
- Licensing readiness: {'ready for review' if not flags else 'blocked until high-severity rights flags are resolved'}.
- Agent commerce readiness: blocked until rights and usage terms are confirmed.

## Rights Snapshot

- Owner claim: {rights['owner_claim']}
- Ownership status: {rights['ownership_status']}
- Contributor list confirmed: {contributor_ready}
- Splits confirmed: {splits_ready}
- Samples / interpolations / covers: {rights['contains_samples']} / {rights['cover_or_interpolation']}
- Sample clearance status: {rights['sample_clearance_status']}
- Existing licenses or restrictions: {', '.join(restrictions) if restrictions else 'unknown'}

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

Private draft: file names, hashes, source notes, and creator context may be
sensitive. Review before sharing.

## Source

- Source folder: {provenance['source_root']}
- Metadata source: {provenance['metadata_source'] or 'none'}
- Package generated: {manifest['generated_at']}
- Generator: suede-rights-passport

## Creation History

{provenance['creation_notes'] or 'Needs creator confirmation.'}

## Chain Of Custody

| Date | Event | Actor | Evidence |
| --- | --- | --- | --- |
| {provenance['chain_of_custody'][0]['date']} | Source folder inventoried for Suede transfer package. | suede-rights-passport | local file hashes |

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
        f"""
# Credits And Splits

Private draft: contributor, split, wallet, and organization notes may be
sensitive. Review before sharing.

## Contributors

{contributors_table(rights.get('contributors', []))}

## Organizations

| Name | Role | Notes |
| --- | --- | --- |
| {creator['organization'] or 'unknown'} | owner / label | needs creator confirmation |

## Payment / Wallet Notes

- Creator wallet: {creator['wallet_address'] or 'unknown'}
- Contributor wallets: unknown
- Royalty routing readiness: {'ready for review' if rights['splits_confirmed'] else 'not ready until splits are confirmed'}

## Blockers

- {'Contributor list confirmed.' if rights['contributors_confirmed'] else 'Contributor list needs confirmation.'}
- {'Split percentages confirmed.' if rights['splits_confirmed'] else 'Split percentages need confirmation.'}
""",
    )

    write_text(
        output / "license-notes.md",
        f"""
# License Notes

Private draft: rights, restrictions, and third-party material notes may be
sensitive. Review before sharing.

## Third-Party Material

- Samples: {rights['contains_samples']}
- Loops: unknown
- Interpolations: {rights['cover_or_interpolation']}
- Covers: {rights['cover_or_interpolation']}
- Beat leases: unknown

## Existing Releases

- DSP release: {project['release_status']}
- Social/video platform release: unknown
- Prior mint/registry/license: unknown
- Existing takedowns/disputes: unknown

## Restrictions

{restrictions_text(restrictions)}

## Clearance Status

Sample clearance status: {rights['sample_clearance_status']}.
High-confidence licensing should wait for creator/legal confirmation when any rights fact is uncertain.
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

Private draft: review rights and creator details before sharing outside the
intended Suede workflow.

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

Private draft: unresolved rights and creator questions may be sensitive. Review
before sharing.

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

    validate_output(source, output, args.force)
    output.mkdir(parents=True, exist_ok=True)
    create_directories(output)

    metadata_path = discover_metadata(source, args.metadata)
    try:
        metadata = load_metadata(metadata_path)
    except Exception as exc:
        raise SystemExit(f"Could not load metadata: {exc}") from exc
    metadata_source = display_path(metadata_path, source, args.include_absolute_paths) if metadata_path else ""

    title = (
        args.project_title.strip()
        or str(project_value(metadata, ["title", "project_title", "work_title", "name"], "")).strip()
        or source.name
        or "unknown"
    )
    artist = (
        args.artist.strip()
        or str(project_value(metadata, ["artist_name", "artist"], "")).strip()
        or str(creator_value(metadata, ["name", "artist", "artist_name"], "")).strip()
        or "unknown"
    )
    assets = discover_assets(source, output, args.copy_assets, args.include_hidden, args.include_other)
    manifest = build_manifest(source, title, artist, assets, args.include_absolute_paths, metadata, metadata_source)

    write_json(output / "suede-intake.json", manifest)
    write_reports(output, manifest)

    print(f"Created Suede transfer package: {output}")
    print(f"Inventoried assets: {len(assets)}")
    print("Next: answer high-severity questions in missing-info-report.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
