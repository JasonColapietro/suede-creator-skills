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
    if r.get("fetch_error") or r.get("source_status") == "fetch_failed":
        return None
    res = {}
    res["frontmatter"] = "fm_error" in r and not r.get("fm_error") and bool(r.get("name")) and bool(r.get("description"))
    name = r.get("name") or ""
    desc = r.get("description") or ""
    res["name_format"] = bool(NAME_RE.match(name)) and len(name) <= 64
    res["name_matches_folder"] = bool(name) and name == r.get("folder")
    res["description_length"] = 50 <= len(desc) <= 1024
    res["description_trigger"] = bool(WHEN_RE.search(desc))
    res["concise_body"] = type(r.get("body_lines")) is int and 0 <= r["body_lines"] <= 500
    fm_license = (r.get("fm_license") or "").strip().lower()
    declared = fm_license not in ("", "unknown", "none", "n/a", "na", "tbd", "todo", "unlicensed")
    res["license"] = declared or bool(r.get("repo_license"))
    try:
        cd = dt.datetime.fromisoformat(r.get("commit_date"))
        res["maintained"] = (NOW - cd).days <= 365
    except Exception:
        res["maintained"] = False
    return res


def quality_score(res):
    """Seven equally weighted checks; missing evidence earns no points.

    None means the source could not be fetched, not a measured zero.
    Frontmatter remains a separate required eligibility gate.
    """
    if res is None:
        return None
    return round(100 * sum(res.get(k) is True for k, _ in CHECKS[1:]) / 7)


def letter_grade(score):
    if score is None:
        return None
    if type(score) is not int or not 0 <= score <= 100:
        raise ValueError("Quality score must be an integer from 0 to 100")
    return "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "D"


def grade(res):
    if res is None:
        return None
    if res.get("frontmatter") is not True:
        return "F"
    return letter_grade(quality_score(res))


def eligible(res):
    return bool(res and res.get("frontmatter") is True and
                res.get("license") is True and quality_score(res) >= 80)


if __name__ == "__main__":
    d = json.load(open(sys.argv[1]))
    g = collections.Counter()
    fails = collections.Counter()
    for r in d:
        res = run_checks(r)
        r["checks"] = res
        r["grade"] = grade(res)
        r["score"] = quality_score(res)
        g[r["grade"]] += 1
        for k, v in (res or {}).items():
            if not v:
                fails[k] += 1
    print(g)
    print(fails)
    json.dump(d, open(sys.argv[2], "w"), indent=1)
