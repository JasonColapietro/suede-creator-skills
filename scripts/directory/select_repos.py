"""Pick the repositories the directory reads, from the links the curated lists cite.

    python3 -I select_repos.py candidates.json VoltAgent-README.md [inclusions.json] > repos.txt

A repository qualifies when two or more curated lists cite it, or when it is an
official collection the VoltAgent list names (its officialskills.sh links map
to github.com/<owner>/skills), or when an author asked for a listing and it was
accepted into directory/inclusions.json. The lists themselves and asset hosts
are skipped.
"""
import json
import re
import sys

candidates = json.load(open(sys.argv[1]))
voltagent = open(sys.argv[2], encoding="utf-8", errors="ignore").read()

SKIP = {"user-attachments/assets", "jasoncolapietro/suede-creator-skills"}
accepted = {repo.strip().lower() for repo in json.load(open(sys.argv[3])).get("repositories", [])} if len(sys.argv) > 3 else set()


def wanted(repo):
    return repo not in SKIP and ("awesome" not in repo or repo in accepted)


repos = [c["repo"] for c in candidates if c["n"] >= 2 and wanted(c["repo"])]
official_part = voltagent[: voltagent.find("### Community Skills")]
for m in re.finditer(r"https?://github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)", official_part):
    repos.append(f"{m.group(1)}/{re.sub(r'.git$', '', m.group(2))}".lower())
for owner in sorted({m.group(1).lower() for m in re.finditer(r"officialskills\.sh/([A-Za-z0-9_.-]+)/skills/", voltagent)}):
    repos.append(f"{owner}/skills")

if len(sys.argv) > 3:
    repos.extend(sorted(accepted))

seen = []
for r in repos:
    if wanted(r) and r not in seen:
        seen.append(r)
print("\n".join(seen))
