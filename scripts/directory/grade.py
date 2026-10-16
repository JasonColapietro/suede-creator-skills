"""The Suede Skill Check: eight structural checks on a parsed SKILL.md record.

Published on skills.suedeai.ai/directory/methodology/. Imported by curate.py;
run directly to print the grade distribution of a parsed snapshot.
"""
import collections
import datetime as dt
import json
import os
import re
import sys

# The snapshot date, so a rebuild of an old snapshot grades "maintained" the same way.
NOW = dt.datetime.fromisoformat(os.environ.get("SUEDE_DIRECTORY_DATE", dt.date.today().isoformat())).replace(tzinfo=dt.timezone.utc)
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
WHEN_RE = re.compile(
    r"\b("
    r"use\b[^.]{0,30}?\b(when|whenever)\b"  # "Use when", "Use only when", "Use this skill when"
    r"|use (it |this |this skill )?(when|for|to|whenever|if)\b"  # "Use for ...", "Use this skill to ..."
    r"|should be used (when|whenever|for|if|to)\b"  # "This skill should be used when ..."
    r"|when (the )?(user|you|asked|working|creating|building|writing|debugging|reviewing|a user)"
    r"|triggers? (on|when)|invoke when|activate when|helps? (you|users|with)"
    r"|for (creating|building|writing|generating|analy[sz]ing|reviewing|managing|working)"
    r")",
    re.I,
)

CHECKS = [
    ("frontmatter", "Frontmatter parses and declares a name and a description"),
    ("name_format", "Name uses lowercase letters, digits and hyphens, 64 characters or fewer"),
    ("name_matches_folder", "Name matches the skill's folder name"),
    ("description_length", "Description is between 50 and 1,024 characters"),
    ("description_trigger", "Description says when an agent should use the skill"),
    ("concise_body", "SKILL.md body is 500 lines or fewer"),
    ("license", "A license is declared in the frontmatter or the repository"),
    ("maintained", "Repository has a commit in the last 12 months"),
]


def run_checks(r):
    res = {}
    res["frontmatter"] = not r["fm_error"] and bool(r["name"]) and bool(r["description"])
    name = r["name"] or ""
    desc = r["description"] or ""
    res["name_format"] = bool(NAME_RE.match(name)) and len(name) <= 64
    res["name_matches_folder"] = name == r["folder"]
    res["description_length"] = 50 <= len(desc) <= 1024
    res["description_trigger"] = bool(WHEN_RE.search(desc))
    res["concise_body"] = r["body_lines"] <= 500
    fm_license = (r["fm_license"] or "").strip().lower()
    declared = fm_license not in ("", "unknown", "none", "n/a", "na", "tbd", "todo", "unlicensed")
    res["license"] = declared or bool(r["repo_license"])
    try:
        cd = dt.datetime.fromisoformat(r["commit_date"])
        res["maintained"] = (NOW - cd).days <= 365
    except Exception:
        res["maintained"] = False
    return res


def grade(res):
    if not res["frontmatter"]:
        return "F"
    passed = sum(1 for k, _ in CHECKS[1:] if res[k])
    total = len(CHECKS) - 1
    missed = total - passed
    return {0: "A", 1: "B", 2: "C"}.get(missed, "D")


if __name__ == "__main__":
    d = json.load(open(sys.argv[1]))
    g = collections.Counter()
    fails = collections.Counter()
    for r in d:
        res = run_checks(r)
        r["checks"] = res
        r["grade"] = grade(res)
        g[r["grade"]] += 1
        for k, v in res.items():
            if not v:
                fails[k] += 1
    print(g)
    print(fails)
    json.dump(d, open(sys.argv[2], "w"), indent=1)
