"""The Suede Skill Check: eight structural checks on a parsed SKILL.md record,
and the graded quality score (score_method "graded-v2") of a published listing.

Published on skills.suedeai.ai/directory/methodology/. Imported by curate.py;
run directly to print the score distribution of a published skills.json.
"""
import collections
import datetime as dt
import json
import os
import re
import sys

# The snapshot date, so a rebuild of an old snapshot grades "maintained" the same way.
NOW = dt.datetime.fromisoformat(os.environ.get("SUEDE_DIRECTORY_DATE", dt.date.today().isoformat())).replace(tzinfo=dt.timezone.utc)
SCORE_METHOD = "graded-v2"
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}")
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

# Description signals for the graded score; same semantics as JavaScript /i.
BOUNDARY_RE = re.compile(r"\b(not for|do not use|don'?t use|not intended for|use [^.]{0,60}\binstead)\b", re.I)
EXAMPLE_RE = re.compile(r"[\"“'‘][^\"”'’]{3,60}[\"”'’]")

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


def _graded(res):
    """Graded checks passed: a run_checks dict or a published "checks" string."""
    if isinstance(res, str):
        res = {k: c == "1" for (k, _), c in zip(CHECKS, res)}
    return sum(res.get(k) is True for k, _ in CHECKS[1:])


def structural_pass(res):
    """The listing gate: frontmatter plus at least six of the seven graded checks."""
    if isinstance(res, str):
        return len(res) == len(CHECKS) and res[0] == "1" and _graded(res) >= 6
    return bool(res) and res.get("frontmatter") is True and _graded(res) >= 6


def all_checks_pass(res):
    """Frontmatter plus all seven graded checks: the full-page candidate rule."""
    if isinstance(res, str):
        return res == "1" * len(CHECKS)
    return bool(res) and res.get("frontmatter") is True and _graded(res) == 7


def _date(value):
    """The calendar date in a YYYY-MM-DD prefix, or None."""
    try:
        return dt.date.fromisoformat(value[:10]) if type(value) is str and DATE_RE.match(value) else None
    except ValueError:
        return None


def quality_score(rec, repo, generated):
    """Graded quality score 0-99 from the published record, its repository
    meta and the snapshot date (the builder recomputes it the same way).

    None means the source could not be fetched, not a measured zero. A missing
    signal earns no points, but a record without checks, size or valid dates
    cannot be scored and raises. The scale tops out at 99 because structural
    evidence cannot show a skill is perfect.
    """
    if rec is None:
        return None
    if repo is None:
        raise ValueError(f"No repository metadata for {rec.get('repo')}")
    checks = rec.get("checks")
    if type(checks) is not str or len(checks) != len(CHECKS) or set(checks) - {"0", "1"}:
        raise ValueError("checks must be a string of one 0/1 per check")
    pts = 8 * _graded(checks)
    desc = rec.get("description") or ""
    n = len(desc)
    pts += 5 if 150 <= n <= 600 else 3 if 100 <= n <= 900 else 1 if 50 <= n <= 1024 else 0
    pts += 4 if BOUNDARY_RE.search(desc) else 0
    pts += 3 if EXAMPLE_RE.search(desc) else 0
    size = rec.get("size")
    if type(size) is not list or len(size) < 2 or type(size[1]) is not int:
        raise ValueError("size must be [body_lines, body_words, file_count]")
    w = size[1]
    pts += 7 if 500 <= w <= 3000 else 4 if 250 <= w <= 4500 else 1 if w >= 100 else 0
    kinds = rec.get("kinds") or ""
    pts += (3 if "r" in kinds else 0) + (2 if "s" in kinds else 0)
    snapshot, commit = _date(generated), _date(repo.get("commit_date"))
    if snapshot is None or commit is None:
        raise ValueError("generated and commit_date must start with a YYYY-MM-DD date")
    days = (snapshot - commit).days
    pts += 9 if days <= 30 else 6 if days <= 90 else 3 if days <= 180 else 1 if days <= 365 else 0
    lists = len(repo.get("lists") or [])
    pts += 7 if lists >= 4 else 4 if lists == 3 else 3 if lists == 2 else 1 if lists == 1 else 0
    pts += (2 if rec.get("allowed_tools") else 0) + (2 if rec.get("compatibility") else 0)
    return min(pts, 99)


def letter_grade(score):
    if score is None:
        return None
    if type(score) is not int or not 0 <= score <= 99:
        raise ValueError("Quality score must be an integer from 0 to 99")
    return "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "D"


def grade(res, score):
    if res is None:
        return None
    if res.get("frontmatter") is not True:
        return "F"
    return letter_grade(score)


def eligible(res):
    return bool(res and structural_pass(res) and res.get("license") is True)


if __name__ == "__main__":
    # Score distribution of a published dataset: grade.py directory/skills.json
    d = json.load(open(sys.argv[1]))
    scores = [quality_score(s, d["repos"].get(s["repo"]), d["generated"]) for s in d["skills"]]
    print(SCORE_METHOD, "on", d["generated"], "-", len(scores), "skills")
    print(collections.Counter(letter_grade(x) for x in scores))
    print(dict(sorted(collections.Counter(scores).items(), reverse=True)))
    print("max", max(scores), "median", sorted(scores)[len(scores) // 2])
