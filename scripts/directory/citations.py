"""Reviewed citations supplement discovery lists without changing score weights.

Refresh verifies each approved document against its current default-branch
revision. Curation accepts only receipts verified for its snapshot date.
"""
import argparse
import copy
import datetime as dt
import json
import os
import re
import subprocess
import urllib.request
from urllib.parse import quote


REPO = re.compile(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+")
SHA = re.compile(r"[a-f0-9]{40}")


def receipts(inclusions, generated=None):
    accepted = {r.lower() for r in inclusions.get("repositories", [])}
    result = {}
    for target, entries in inclusions.get("citations", {}).items():
        if not REPO.fullmatch(target) or target.lower() not in accepted:
            raise ValueError(f"Citation target is not an accepted repository: {target}")
        if not isinstance(entries, list) or not entries:
            raise ValueError(f"Citation evidence must be a nonempty list: {target}")
        seen = set()
        for entry in entries:
            source, path = entry["source"], entry["path"]
            if (not REPO.fullmatch(source) or source.split('/')[0].lower() == target.split('/')[0].lower()
                    or source.lower() in seen):
                raise ValueError(f"Citation must have a distinct independent source: {target}")
            if (not re.fullmatch(r"[A-Za-z0-9_./-]+", path)
                    or any(part in ('', '.', '..') for part in path.split('/'))):
                raise ValueError(f"Invalid citation document path: {path}")
            if not SHA.fullmatch(entry["commit"]):
                raise ValueError(f"Invalid citation revision: {source}")
            if entry["target"].lower() != f"https://github.com/{target}".lower():
                raise ValueError(f"Citation target mismatch: {target}")
            verified = dt.date.fromisoformat(entry["verified_at"]).isoformat()
            if generated is not None and verified != generated:
                raise ValueError(f"Reverify citation for snapshot {generated}: {target}")
            seen.add(source.lower())
        result[target.lower()] = entries
    return result


def current_revision(source):
    result = subprocess.run(
        ["git", "ls-remote", f"https://github.com/{source}.git", "HEAD"],
        check=True, capture_output=True, text=True, timeout=30,
    )
    sha = result.stdout.split()[0]
    if not SHA.fullmatch(sha):
        raise ValueError(f"Invalid remote HEAD: {source}")
    return sha


def fetch_document(source, revision, path):
    url = f"https://raw.githubusercontent.com/{source}/{revision}/{quote(path, safe='/')}"
    with urllib.request.urlopen(url, timeout=30) as response:
        data = response.read(2_000_001)
    if len(data) > 2_000_000:
        raise ValueError(f"Citation document is too large: {source}/{path}")
    return data.decode("utf-8")


def visible_links(body):
    """Ignore removed entries in comments and literal code examples."""
    body = re.sub(r"<!--[\s\S]*?(?:-->|$)", "", body)
    body = re.sub(r"<(code|pre)\b[^>]*>[\s\S]*?</\1>", "", body, flags=re.I)
    prose, fence = [], None
    for line in body.splitlines():
        marker = re.match(r"^ {0,3}(`{3,}|~{3,})(.*)$", line)
        if fence:
            if marker and marker[1][0] == fence[0] and len(marker[1]) >= len(fence) and not marker[2].strip():
                fence = None
        elif marker:
            fence = marker[1]
        elif not line.startswith(("    ", "\t")):
            prose.append(line)
    text = re.sub(r"(`+)[\s\S]*?\1", "", "\n".join(prose))
    return re.findall(r"(?<!\\)\]\((https://github\.com/[^\s)]+)\)", text, re.I)


def verify(inclusions, generated):
    refreshed = copy.deepcopy(inclusions)
    revisions = {}
    for entries in receipts(refreshed).values():
        for entry in entries:
            source = entry["source"]
            if source not in revisions:
                revisions[source] = current_revision(source)
            revision = revisions[source]
            body = fetch_document(source, revision, entry["path"])
            links = visible_links(body)
            if entry["target"].lower() not in {link.rstrip('/').lower() for link in links}:
                raise ValueError(f"Reviewed citation no longer links to {entry['target']}")
            entry.update(commit=revision, verified_at=generated)
    receipts(refreshed, generated)
    return refreshed


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inclusions", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    generated = os.environ.get("SUEDE_DIRECTORY_DATE", dt.date.today().isoformat())
    with open(args.inclusions) as handle:
        refreshed = verify(json.load(handle), generated)
    with open(args.out, "w") as handle:
        json.dump(refreshed, handle, indent=1)
        handle.write("\n")
