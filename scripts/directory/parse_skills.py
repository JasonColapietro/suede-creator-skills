"""Read every SKILL.md under the cloned third-party repos and emit one JSON record per skill.

Runs with `python3 -I`; it only reads files from the clones, never executes them.
"""
import collections
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
# The lists spell owner/repo the way GitHub does ("NVIDIA/skills"); keys are lowercase.
case_by_repo = {c["repo"]: c.get("case") or c["repo"] for c in CANDIDATES}

SKIP_DIRS = {".git", "node_modules", "vendor", "dist", "build", ".venv", "__pycache__"}

LICENSE_PATTERNS = [
    ("MIT", re.compile(r"\bMIT License\b|Permission is hereby granted, free of charge", re.I)),
    ("Apache-2.0", re.compile(r"Apache License,?\s+(Version\s+)?2\.0", re.I)),
    ("BSD-3-Clause", re.compile(r"Redistribution and use in source and binary forms.*?Neither the name", re.I | re.S)),
    ("BSD-2-Clause", re.compile(r"Redistribution and use in source and binary forms", re.I)),
    ("GPL-3.0", re.compile(r"GNU GENERAL PUBLIC LICENSE\s+Version 3", re.I)),
    ("AGPL-3.0", re.compile(r"GNU AFFERO GENERAL PUBLIC LICENSE", re.I)),
    ("LGPL", re.compile(r"GNU LESSER GENERAL PUBLIC LICENSE", re.I)),
    ("MPL-2.0", re.compile(r"Mozilla Public License,?\s+(v\.\s*|Version\s+)2\.0", re.I)),
    ("ISC", re.compile(r"\bISC License\b|Permission to use, copy, modify, and/or distribute", re.I)),
    ("CC-BY-4.0", re.compile(r"Creative Commons Attribution 4\.0", re.I)),
    ("CC-BY-NC-SA-4.0", re.compile(r"Attribution-NonCommercial-ShareAlike", re.I)),
    ("CC-BY-NC-ND-4.0", re.compile(r"Attribution-NonCommercial-NoDerivatives", re.I)),
    ("CC-BY-ND-4.0", re.compile(r"Attribution-NoDerivatives", re.I)),
    ("CC-BY-SA-4.0", re.compile(r"Attribution-ShareAlike 4\.0", re.I)),
    ("CC-BY-NC-4.0", re.compile(r"Attribution-NonCommercial", re.I)),
    ("Unlicense", re.compile(r"This is free and unencumbered software released into the public domain", re.I)),
    ("CC0-1.0", re.compile(r"CC0 1\.0", re.I)),
    # Checked last: permissive licenses often carry the phrase too.
    ("All rights reserved", re.compile(r"all rights reserved", re.I)),
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


# Facts a reader wants before installing, read from the files themselves.
SCRIPT_LANGS = {
    ".py": "Python", ".js": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript", ".ts": "TypeScript",
    ".sh": "Shell", ".bash": "Shell", ".zsh": "Shell", ".ps1": "PowerShell", ".rb": "Ruby", ".go": "Go",
    ".rs": "Rust", ".java": "Java", ".kt": "Kotlin", ".swift": "Swift", ".php": "PHP", ".r": "R", ".R": "R",
}
CRED_NAME = r"[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*_(?:API_KEY|APIKEY|TOKEN|SECRET|SECRET_KEY|ACCESS_KEY|ACCESS_TOKEN|CLIENT_ID|CLIENT_SECRET|PASSWORD|AUTH_TOKEN)"
ENV_RE = re.compile(rf"\b({CRED_NAME})\b")
# A credential counts as read only where code reads it from the environment.
ENV_READ_RE = re.compile(
    rf"""(?:os\.environ(?:\.get)?\s*[\[(]\s*["']({CRED_NAME})["']"""
    rf"""|os\.getenv\(\s*["']({CRED_NAME})["']"""
    rf"""|process\.env(?:\.|\[\s*["'])({CRED_NAME})\b"""
    rf"""|(?:Deno|Bun)\.env(?:\.get\(\s*["']|\.)({CRED_NAME})\b"""
    rf"""|os\.Getenv\(\s*"({CRED_NAME})"|ENV\[\s*["']({CRED_NAME})["']|env::var\(\s*"({CRED_NAME})\""""
    rf"""|\$\{{?({CRED_NAME})\b)"""
)
JUNK_CRED = re.compile(
    r"^(EXAMPLE|FOO|FAKE|DUMMY|PLACEHOLDER|SAMPLE|MOCK|XXX)"
    r"|^(BAR|BAZ|DEMO|TEST|MISSING|INVALID|REDACTED|NEW|DEV|PROD|DEFAULT|YOUR|MY|SOME)(_|$)"
    r"|^(API_KEY|ACCESS_TOKEN|AUTH_TOKEN|SECRET_KEY|SECRET|TOKEN)$"
)
CONST_RE = re.compile(rf"""^\s*(?:export\s+)?(?:const\s+|let\s+|var\s+)?({CRED_NAME})\s*[:=]\s*(?:r?["'/]|re\.compile|\d)""", re.M)
# Network use: HTTP libraries and cloud SDKs in code, comments stripped first.
NET_RE = re.compile(
    r"\b(requests\.(get|post|put|patch|delete|head|request|Session)|httpx\.|urllib\.request|urlopen\(|aiohttp|fetch\(|axios|got\(|node-fetch|http\.client|net/http|reqwest"
    r"|import boto3|boto3\.client|from openai|import openai|from anthropic|import anthropic|@anthropic-ai/sdk|from google\.cloud|google-cloud-|new OpenAI\(|websocket"
    r"|from google import genai|google\.genai|google\.generativeai|page\.goto\(|driver\.get\(|chromium\.launch|puppeteer\.launch"
    r"|\bcurl\s+-|\bcurl\s+https?:|\bwget\s+https?:)"
)
COMMENT_RE = {
    "hash": re.compile(r"(?m)^\s*#.*$|\s#\s.*$"),
    "block": re.compile(r"/\*.*?\*/", re.S),
    "slash": re.compile(r"(^|[^:])//[^\n]*", re.M),
}
URL_RE = re.compile(r"""["'`(]https?://([A-Za-z0-9.-]+\.[A-Za-z]{2,})""")
HOST_IGNORE = re.compile(
    r"(^|\.)(github\.com|githubusercontent\.com|github\.io|localhost|w3\.org|schema\.org|json-schema\.org|purl\.org|xmlns\.com|creativecommons\.org"
    r"|opensource\.org|apache\.org|mozilla\.org|python\.org|npmjs\.com|pypi\.org|stackoverflow\.com|wikipedia\.org|docs\.[a-z.]+)$"
    r"|\.(example|invalid|test|local|localhost)$|^example\.(com|org|net)$|(^|\.)your[a-z-]*\.|^127\.|^0\.0\.0\.0"
)
MCP_TOOL_RE = re.compile(r"\bmcp__([a-z0-9][a-z0-9_-]*?)__")
MCP_RE = re.compile(r"\bMCP server|\bmcpServers\b|\bmcp__", re.I)
SKIP_SCAN_DIRS = re.compile(r"(^|/)(tests?|__tests__|spec|examples?|fixtures?|samples?|testdata|mocks?)(/|$)", re.I)
HASH_COMMENT_EXT = {".py", ".sh", ".bash", ".zsh", ".rb", ".r", ".R", ".ps1"}


def strip_comments(text, ext):
    if ext in HASH_COMMENT_EXT:
        return COMMENT_RE["hash"].sub("", text)
    return COMMENT_RE["slash"].sub(r"\1", COMMENT_RE["block"].sub("", text))


RUN_PATTERNS = [
    ("curl | sh", re.compile(r"\bcurl\b[^\n|]*\|\s*(sudo\s+)?(ba)?sh\b")),
    ("npx", re.compile(r"(^|[\s;&|(])npx\s")),
    ("pip install", re.compile(r"\bpip3?\s+install\b|\buv\s+pip\s+install\b")),
    ("uvx", re.compile(r"(^|[\s;&|(])uvx\s")),
    ("npm install", re.compile(r"\b(npm|pnpm|yarn|bun)\s+(install|i|add)\b")),
    ("brew install", re.compile(r"\bbrew\s+install\b")),
    ("docker run", re.compile(r"\bdocker\s+(run|compose)\b")),
    ("go install", re.compile(r"\bgo\s+install\b")),
    ("cargo install", re.compile(r"\bcargo\s+install\b")),
]
FENCE_RE = re.compile(r"```[^\n]*\n(.*?)```", re.S)


def run_commands(body: str):
    code = "\n".join(FENCE_RE.findall(body))
    return [label for label, pat in RUN_PATTERNS if pat.search(code)]


def install_facts(skill_dir: Path, body: str):
    langs = collections.Counter()
    env_read, env_docs, consts = [], [], set()
    hosts = collections.Counter()
    network = False
    captcha_files = False
    scanned = 0
    for dp, dns, fns in os.walk(skill_dir):
        dns[:] = [d for d in dns if d not in SKIP_DIRS and not d.startswith(".")]
        rel_dir = str(Path(dp).relative_to(skill_dir))
        in_tests = bool(SKIP_SCAN_DIRS.search(rel_dir)) if rel_dir != "." else False
        for fn in fns:
            ext = os.path.splitext(fn)[1]
            is_code = ext in SCRIPT_LANGS
            if is_code:
                langs[SCRIPT_LANGS[ext]] += 1
            if "captcha" in fn.lower():
                captcha_files = True
            if not is_code or in_tests or re.search(r"\.(test|spec)\.", fn) or scanned > 200:
                continue
            path = Path(dp) / fn
            try:
                if path.stat().st_size > 300_000:
                    continue
                text = path.read_text(errors="ignore")
            except OSError:
                continue
            scanned += 1
            consts.update(CONST_RE.findall(text))
            code = strip_comments(text, ext)
            for m in ENV_READ_RE.finditer(code):
                v = next(g for g in m.groups() if g)
                if v not in env_read:
                    env_read.append(v)
            if NET_RE.search(code):
                network = True
            for h in URL_RE.findall(code):
                h = h.lower().rstrip(".")
                if not HOST_IGNORE.search(h):
                    hosts[h] += 1
    for m in ENV_RE.finditer(body):
        v = m.group(1)
        if v not in env_docs:
            env_docs.append(v)
    keep = lambda v: not JUNK_CRED.search(v) and v not in consts
    env_read = [v for v in env_read if keep(v)]
    env_docs = [v for v in env_docs if keep(v) and v not in env_read]
    mcp_tools = sorted(set(MCP_TOOL_RE.findall(body)))[:6]
    return {
        "script_langs": dict(langs.most_common()),
        "env_read": env_read[:8],
        "env_docs": env_docs[:8],
        "network": network,
        "api_hosts": [h for h, _ in hosts.most_common(4)],
        "mcp": bool(MCP_RE.search(body)),
        "mcp_tools": mcp_tools,
        "captcha_files": captcha_files,
        "run_commands": run_commands(body),
        # Kept for the listing-policy scan in curate.py, not published.
        "policy_text": body[:8000],
        "file_names": sorted({fn for _, _, fns in os.walk(skill_dir) for fn in fns})[:200],
    }


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
    rec.update(install_facts(skill_dir, body))
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
        # refresh.sh uses detached snapshots to avoid collisions when a remote
        # renames its default branch; retain that branch in generated URLs.
        branch = (git(repo_root, "config", "--get", "suede.directoryDefaultBranch")
                  or git(repo_root, "rev-parse", "--abbrev-ref", "HEAD") or "main")
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
                    "repo": case_by_repo.get(slug.lower()) or f"{real_owner}/{real_name}",
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
