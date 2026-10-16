"""Read every SKILL.md under the cloned third-party repos and emit one JSON record per skill.

Runs with `python3 -I`; it only reads files from the clones, never executes them.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import yaml

SRC = Path(sys.argv[1])
CANDIDATES = json.load(open(sys.argv[2]))
OUT = sys.argv[3]

lists_by_repo = {c["repo"]: c["lists"] for c in CANDIDATES}

SKIP_DIRS = {".git", "node_modules", "vendor", "dist", "build", ".venv", "__pycache__"}

LICENSE_PATTERNS = [
    ("MIT", re.compile(r"\bMIT License\b|Permission is hereby granted, free of charge", re.I)),
    ("Apache-2.0", re.compile(r"Apache License,?\s+Version 2\.0", re.I)),
    ("BSD-3-Clause", re.compile(r"Redistribution and use in source and binary forms.*?Neither the name", re.I | re.S)),
    ("BSD-2-Clause", re.compile(r"Redistribution and use in source and binary forms", re.I)),
    ("GPL-3.0", re.compile(r"GNU GENERAL PUBLIC LICENSE\s+Version 3", re.I)),
    ("AGPL-3.0", re.compile(r"GNU AFFERO GENERAL PUBLIC LICENSE", re.I)),
    ("LGPL", re.compile(r"GNU LESSER GENERAL PUBLIC LICENSE", re.I)),
    ("MPL-2.0", re.compile(r"Mozilla Public License,?\s+(v\.\s*|Version\s+)2\.0", re.I)),
    ("ISC", re.compile(r"\bISC License\b|Permission to use, copy, modify, and/or distribute", re.I)),
    ("CC-BY-4.0", re.compile(r"Creative Commons Attribution 4\.0", re.I)),
    ("CC-BY-SA-4.0", re.compile(r"Attribution-ShareAlike 4\.0", re.I)),
    ("CC-BY-NC-4.0", re.compile(r"Attribution-NonCommercial", re.I)),
    ("Unlicense", re.compile(r"This is free and unencumbered software released into the public domain", re.I)),
    ("CC0-1.0", re.compile(r"CC0 1\.0", re.I)),
]


def detect_license_text(text):
    for spdx, pat in LICENSE_PATTERNS:
        if pat.search(text[:20000]):
            return spdx
    return None


def find_license(start: Path, repo_root: Path):
    """Nearest LICENSE file walking up from the skill dir to the repo root."""
    cur = start
    while True:
        for name in ("LICENSE", "LICENSE.md", "LICENSE.txt", "LICENCE", "LICENSE.MD", "license", "License.txt", "COPYING"):
            p = cur / name
            if p.is_file():
                try:
                    lic = detect_license_text(p.read_text(errors="ignore"))
                except OSError:
                    lic = None
                return lic or "Other", str(p.relative_to(repo_root))
        if cur == repo_root:
            return None, None
        cur = cur.parent


def git(repo_root, *args):
    try:
        return subprocess.run(["git", "-C", str(repo_root), *args], capture_output=True, text=True, timeout=30).stdout.strip()
    except Exception:
        return ""


FM_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*(?:\n|\Z)", re.S)


def parse_skill(path: Path, repo_root: Path):
    try:
        raw = path.read_text(errors="replace")
    except OSError:
        return None
    rec = {"skill_md_bytes": len(raw.encode("utf-8", "replace"))}
    m = FM_RE.match(raw.lstrip("﻿"))
    fm = {}
    fm_error = None
    if m:
        try:
            loaded = yaml.safe_load(m.group(1))
            if isinstance(loaded, dict):
                fm = loaded
            else:
                fm_error = "frontmatter is not a mapping"
        except yaml.YAMLError as e:
            fm_error = f"yaml: {str(e).splitlines()[0][:120]}"
        body = raw.lstrip("﻿")[m.end():]
    else:
        fm_error = "no frontmatter"
        body = raw
    def s(v):
        if v is None:
            return None
        if isinstance(v, (str, int, float)):
            return str(v).strip()
        return None
    rec["fm_error"] = fm_error
    rec["name"] = s(fm.get("name"))
    rec["description"] = s(fm.get("description"))
    rec["fm_license"] = s(fm.get("license"))
    rec["compatibility"] = s(fm.get("compatibility"))
    at = fm.get("allowed-tools") or fm.get("allowed_tools")
    if isinstance(at, list):
        at = ", ".join(str(x) for x in at)
    rec["allowed_tools"] = s(at)
    meta = fm.get("metadata") if isinstance(fm.get("metadata"), dict) else {}
    rec["fm_version"] = s(meta.get("version") or fm.get("version"))
    rec["fm_author"] = s(meta.get("author") or fm.get("author"))
    lines = body.splitlines()
    rec["body_lines"] = len(lines)
    rec["body_words"] = len(re.findall(r"\S+", body))
    heads = []
    in_code = False
    for ln in lines:
        if ln.strip().startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        hm = re.match(r"^(#{1,3})\s+(.+?)\s*#*\s*$", ln)
        if hm:
            heads.append([len(hm.group(1)), re.sub(r"[`*_\[\]]", "", hm.group(2))[:90]])
    rec["headings"] = heads[:40]
    skill_dir = path.parent
    rec["dir"] = str(skill_dir.relative_to(repo_root)) if skill_dir != repo_root else "."
    rec["folder"] = skill_dir.name if skill_dir != repo_root else repo_root.name.split("__", 1)[-1]
    files = []
    for dp, dns, fns in os.walk(skill_dir):
        dns[:] = [d for d in dns if d not in SKIP_DIRS and not d.startswith(".")]
        for fn in fns:
            if fn.startswith("."):
                continue
            files.append(str((Path(dp) / fn).relative_to(skill_dir)))
        if len(files) > 400:
            break
    files.sort()
    rec["file_count"] = len(files)
    rec["files_sample"] = files[:40]
    rec["has_scripts"] = any(f.startswith("scripts/") for f in files)
    rec["has_references"] = any(f.startswith(("references/", "reference/", "docs/")) for f in files)
    rec["has_assets"] = any(f.startswith(("assets/", "templates/")) for f in files)
    lic, lic_file = find_license(skill_dir, repo_root)
    rec["repo_license"] = lic
    rec["license_file"] = lic_file
    return rec


def main():
    out = []
    for repo_root in sorted(SRC.iterdir()):
        if not (repo_root / ".git").exists():
            continue
        owner, _, name = repo_root.name.partition("__")
        slug = f"{owner}/{name}"
        branch = git(repo_root, "rev-parse", "--abbrev-ref", "HEAD") or "main"
        commit_date = git(repo_root, "log", "-1", "--format=%cI")
        sha = git(repo_root, "rev-parse", "HEAD")
        canonical = git(repo_root, "config", "--get", "remote.origin.url")
        cm = re.match(r"https://github\.com/([^/]+)/([^/]+?)(?:\.git)?$", canonical)
        real_owner, real_name = (cm.group(1), cm.group(2)) if cm else (owner, name)
        for dp, dns, fns in os.walk(repo_root):
            dns[:] = [d for d in dns if d not in SKIP_DIRS and not d.startswith(".")]
            if "SKILL.md" in fns:
                rec = parse_skill(Path(dp) / "SKILL.md", repo_root)
                if rec is None:
                    continue
                rec.update({
                    "repo": f"{real_owner}/{real_name}",
                    "repo_key": slug,
                    "branch": branch,
                    "commit_date": commit_date,
                    "commit_sha": sha,
                    "lists": lists_by_repo.get(slug, []),
                })
                out.append(rec)
    json.dump(out, open(OUT, "w"), indent=1)
    print(f"{len(out)} SKILL.md files")


main()
