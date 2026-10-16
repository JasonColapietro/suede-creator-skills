"""Turn parsed SKILL.md records into directory/skills.json.

    SUEDE_DIRECTORY_DATE=2026-10-16 python3 -I scripts/directory/curate.py \
        --raw skills-raw.json --labels directory/labels.json --out directory/skills.json

Listing rules (published on /directory/methodology/):
  * Suede Skill Check grade A or B, and a declared license
  * a description written mainly in English
  * not a template, example, draft or test fixture
  * one listing per skill: exact copies across repositories keep the copy in
    the most-cited repository, and a repository that ships the same skill
    name in several harness folders keeps one
  * nothing the site's public-copy guards reject

directory/labels.json holds the editorial layer: a category for every skill
and, for featured skills, a one-sentence summary in the directory's words.
A skill with no label falls back to keyword classification and is not
featured until it has a summary.
"""
import argparse
import collections
import datetime as dt
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from grade import CHECKS, grade, run_checks  # noqa: E402

CATEGORIES = [
    ("documents-office", [r"\bdocx?\b", r"\bpdf", r"\bpptx?\b", r"\bxlsx?\b", r"spreadsheet", r"powerpoint", r"\bexcel\b", r"word document", r"\bslides?\b", r"presentation"]),
    ("frontend-design", [r"\bdesign", r"\bui\b", r"\bux\b", r"frontend", r"\bcss\b", r"tailwind", r"figma", r"component", r"animation", r"typograph", r"accessib"]),
    ("testing-qa", [r"\btests?\b", r"testing", r"playwright", r"\be2e\b", r"\bqa\b", r"\btdd\b", r"debug"]),
    ("code-review-quality", [r"code review", r"pull request", r"refactor", r"\blint", r"code quality", r"best practices"]),
    ("devops-cloud", [r"deploy", r"docker", r"kubernetes", r"terraform", r"\baws\b", r"\bgcp\b", r"azure", r"cloudflare", r"ci/cd", r"infrastructure", r"observab", r"incident"]),
    ("data-databases", [r"\bsql\b", r"database", r"analytics", r"bigquery", r"postgres", r"mongodb", r"redis", r"dashboard", r"warehouse"]),
    ("ai-agents-llm", [r"\bagents?\b", r"\bllms?\b", r"prompt", r"\bmcp\b", r"\brag\b", r"embedding", r"fine-?tun", r"\bevals?\b", r"inference"]),
    ("marketing-seo", [r"\bseo\b", r"marketing", r"\bads?\b", r"advertis", r"copywrit", r"growth", r"campaign", r"social media", r"conversion"]),
    ("writing-content", [r"writing", r"prose", r"humani[sz]", r"\bblog", r"editing", r"story", r"novel"]),
    ("product-management", [r"product manag", r"\bprd\b", r"roadmap", r"user stor", r"\bokrs?\b", r"prioriti"]),
    ("security", [r"securit", r"vulnerab", r"pentest", r"threat", r"fuzz", r"semgrep", r"codeql"]),
    ("media-creative", [r"video", r"\bimage", r"audio", r"music", r"\bgif", r"remotion", r"blender", r"photo", r"diagram"]),
    ("productivity-knowledge", [r"notion", r"obsidian", r"calendar", r"gmail", r"\bemail", r"google workspace", r"\bslack\b", r"jira", r"meeting"]),
    ("science-research", [r"scientif", r"biolog", r"chemi", r"physic", r"bioinformat", r"genom", r"protein", r"academic", r"clinical"]),
    ("business-finance", [r"financ", r"crypto", r"trading", r"\bsales\b", r"legal", r"contract", r"accounting", r"e-?commerce", r"payment", r"career"]),
    ("developer-tools", [r"\bgit\b", r"\bcli\b", r"\bapi\b", r"\bsdk\b", r"typescript", r"python", r"\brust\b", r"golang", r"swift", r"android", r"flutter", r"framework"]),
]
CAT_RES = [(slug, [re.compile(k, re.I) for k in kws]) for slug, kws in CATEGORIES]

REJECT_TERMS = re.compile(
    r"telegram|join discord|follow on x|airdrop|passport stamp|suede|jailbreak|bypass|nsfw|porn|onlyfans|keylogger|\bcrack(ed|ing)?\b|"
    r"honest limits|not the first choice|not for everyone|may not be the best fit|scrap(e|er|ing)",
    re.I,
)
TEMPLATE_RE = re.compile(r"^(template|example|example-skill|sample|test|my-skill|skill-template|hello-world|your-skill-name)$", re.I)
TEMPLATE_PATH_RE = re.compile(r"(^|/)(templates?|examples?|fixtures?|tests?|__tests__|testdata|archive|deprecated|drafts?|internal|_[a-z-]+|\.github)(/|$)", re.I)
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"\(?\b[2-9]\d{2}\)?[ .-][2-9]\d{2}[ .-]\d{4}\b")

OFFICIAL_OWNERS = {
    "anthropics", "openai", "microsoft", "google", "google-gemini", "google-labs-code", "googleworkspace", "huggingface",
    "supabase", "vercel-labs", "cloudflare", "stripe", "hashicorp", "trailofbits", "getsentry", "expo", "resend",
    "coderabbitai", "firebase", "flutter", "netlify", "mongodb", "neondatabase", "clickhouse", "duckdb", "redis",
    "nvidia", "figma", "makenotion", "apollographql", "auth0", "better-auth", "browserbase", "brave", "coinbase",
    "datadog-labs", "remotion-dev", "replicate", "sanity-io", "serpapi", "tinybirdco", "typefully", "wordpress",
    "greensock", "fal-ai-community", "minimax-ai", "callstackincubator", "firecrawl", "composiohq", "binance",
    "crawlbase", "voltagent", "addyosmani", "garrytan", "qdrant", "transloadit", "mailtrap", "trycourier", "video-db",
}


OPEN_LICENSE = re.compile(r"^(MIT(-0)?|Apache-2\.0|BSD(-[23]-Clause)?|0BSD|(A|L)?GPL-[23]\.0(-or-later|-only)?|MPL-2\.0|ISC|Unlicense|CC0-1\.0|CC-BY(-SA)?-4\.0)( AND (MIT|Apache-2\.0|CC-BY-4\.0|CC-BY-SA-4\.0))*$")


def normalize_license(raw, repo_license, license_file):
    """A short, consistent license label for display; free text becomes a pointer to the file."""
    t = re.sub(r"\s+", " ", (raw or "").strip())
    low = t.lower()
    table = [
        (r"^mit( license)?$", "MIT"),
        (r"^mit-0$", "MIT-0"),
        (r"^apache(-| license,? version )2\.0( license)?$", "Apache-2.0"),
        (r"^(bsd-3-clause|3[- ]clause bsd)( license)?$", "BSD-3-Clause"),
        (r"^bsd-2-clause( license)?$", "BSD-2-Clause"),
        (r"^bsd( license)?$", "BSD"),
        (r"^gpl-?v?3(\.0)?( license)?$", "GPL-3.0"),
        (r"^gpl-3\.0-or-later$", "GPL-3.0-or-later"),
        (r"^gpl-2\.0( license)?$", "GPL-2.0"),
        (r"^cc by-nc-sa 4\.0$", "CC-BY-NC-SA-4.0"),
        (r"^https?://creativecommons\.org/licenses/by/4\.0/?$", "CC-BY-4.0"),
        (r"^license$", ""),
    ]
    for pat, label in table:
        if re.match(pat, low):
            t = label
            break
    m = re.match(r"^(CC-BY(-SA|-NC|-NC-SA)?-4\.0|MIT|Apache-2\.0)\b", t)
    if m and len(t) > 40:
        t = m.group(1)
    if re.search(r"https?://|license\.txt|complete terms|see license", low) and not re.match(r"^CC-BY", t):
        t = ""
    if len(t) > 40 or low in ("unknown", "none", "n/a", "na", "tbd", "todo", "unlicensed"):
        t = ""
    if re.match(r"^(nvidia )?proprietary", low):
        t = "Proprietary"
    if not t:
        if repo_license and repo_license != "Other":
            t = repo_license
        else:
            t = "See LICENSE file" if license_file else "See repository"
    return t


def mostly_english(text):
    letters = [c for c in text or "" if c.isalpha()]
    return bool(letters) and sum(1 for c in letters if ord(c) < 128) / len(letters) >= 0.9


def classify(name, desc):
    hay = f"{name.replace('-', ' ')} {desc}"
    best = max((sum(len(p.findall(hay)) for p in pats), -i, slug) for i, (slug, pats) in enumerate(CAT_RES))
    return best[2] if best[0] > 0 else "developer-tools"


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "skill"


def norm(s):
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def richness(r):
    return (
        (2 if r["has_references"] else 0)
        + (1 if r["has_scripts"] else 0)
        + (1 if r["has_assets"] else 0)
        + min(len(r["headings"]), 12) / 6
        + min(len(r["description"] or ""), 400) / 200
    )


def harness_rank(r):
    """Within one repository, which copy of a same-named skill to keep."""
    d = r["dir"].lower()
    return (0 if "claude" in d else 1, d.count("/"), d)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", required=True)
    ap.add_argument("--labels", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--cap", type=int, default=12, help="featured pages per repository")
    ap.add_argument("--exclusions", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "directory", "exclusions.json"))
    args = ap.parse_args()
    generated = os.environ.get("SUEDE_DIRECTORY_DATE", dt.date.today().isoformat())

    raw = json.load(open(args.raw))
    labels = json.load(open(args.labels))
    # Removals: author requests, and skills whose text the pack's public-source guards reject.
    # Whole repositories ("owner/repo") or single skills ("owner/repo/skill-name").
    excl = json.load(open(args.exclusions)) if os.path.exists(args.exclusions) else {}
    excluded_repos = {r.lower() for r in excl.get("repositories", [])}
    excluded_skills = {s.lower() for s in excl.get("skills", [])}
    reasons = collections.Counter()
    eligible = []
    for r in raw:
        r["checks"] = run_checks(r)
        r["grade"] = grade(r["checks"])
        name, desc = r["name"] or "", r["description"] or ""
        if r["repo"].lower() in excluded_repos or f"{r['repo']}/{name}".lower() in excluded_skills:
            reasons["listed in directory/exclusions.json"] += 1
        elif r["grade"] not in ("A", "B"):
            reasons["grade C or below"] += 1
        elif not r["checks"]["license"]:
            reasons["no license"] += 1
        elif not mostly_english(desc):
            reasons["not English"] += 1
        elif TEMPLATE_RE.match(name) or TEMPLATE_PATH_RE.search(r["dir"]):
            reasons["template, example or draft"] += 1
        elif REJECT_TERMS.search(f"{name} {desc} {r['repo']}") or EMAIL_RE.search(desc) or PHONE_RE.search(desc):
            reasons["content rule"] += 1
        else:
            eligible.append(r)

    # Same skill name shipped in several harness folders of one repository: keep one.
    by_name = collections.defaultdict(list)
    for r in eligible:
        by_name[(r["repo"].lower(), r["name"])].append(r)
    single = []
    for group in by_name.values():
        group.sort(key=harness_rank)
        single.append(group[0])
        reasons["same name in one repository"] += len(group) - 1

    # Exact copies across repositories: the most-cited repository keeps the listing.
    single.sort(key=lambda r: (-len(r["lists"]), r["repo"].split("/")[0].lower() not in OFFICIAL_OWNERS, r["repo"].lower(), r["dir"]))
    seen = set()
    kept = []
    for r in single:
        key = hashlib.sha1(f"{norm(r['name'])}|{norm(r['description'])}".encode()).hexdigest()
        if key in seen:
            reasons["copy of a listed skill"] += 1
            continue
        seen.add(key)
        kept.append(r)
    print("excluded:", dict(reasons), file=sys.stderr)

    by_repo = collections.defaultdict(list)
    for r in kept:
        by_repo[r["repo"]].append(r)
    out = []
    repo_meta = {}
    unlabeled = 0
    for repo, items in by_repo.items():
        owner, name = repo.split("/", 1)
        repo_slug = f"{slugify(owner)}/{slugify(name)}"
        used = set()
        items.sort(key=lambda r: (r["name"], r["dir"]))
        ids = {}
        for r in items:
            base = slugify(r["name"])
            slug, n = base, 2
            while slug in used:
                slug, n = f"{base}-{n}", n + 1
            used.add(slug)
            ids[id(r)] = (slug, f"{repo_slug}/{slug}")
        candidates = [r for r in items if r["grade"] == "A" and (labels.get(ids[id(r)][1]) or {}).get("summary")]
        featured = {id(r) for r in sorted(candidates, key=lambda r: (-richness(r), r["name"]))[: args.cap]}
        for r in items:
            slug, sid = ids[id(r)]
            label = labels.get(sid) or {}
            if not label:
                unlabeled += 1
            license_label = normalize_license(r["fm_license"], r["repo_license"], r["license_file"])
            # Compact record: per-repository facts live in "repos", URLs and
            # slugs are derived by scripts/build-directory.mjs. The validator
            # hashes every token of this file, so each field here has a cost.
            rec = {
                "repo": repo,
                "slug": slug,
                "name": r["name"],
                "description": re.sub(r"\s+", " ", r["description"]).strip(),
                "category": label.get("category") or classify(r["name"], r["description"]),
                "grade": r["grade"],
                "checks": "".join("1" if r["checks"][k] else "0" for k, _ in CHECKS),
                "dir": r["dir"],
                "license": license_label,
                "open_license": bool(OPEN_LICENSE.match(license_label)),
                "license_file": r["license_file"],
                "size": [r["body_lines"], r["body_words"], r["file_count"]],
                "kinds": ("r" if r["has_references"] else "") + ("s" if r["has_scripts"] else "") + ("a" if r["has_assets"] else ""),
            }
            if r["allowed_tools"]:
                rec["allowed_tools"] = r["allowed_tools"]
            if r["compatibility"]:
                rec["compatibility"] = r["compatibility"]
            if id(r) in featured:
                rec["featured"] = True
                rec["summary"] = label["summary"]
                rec["headings"] = [h for h in r["headings"] if h[0] in (2, 3)][:16]
                rec["files_sample"] = r["files_sample"][:24]
            out.append((sid, rec))
            repo_meta[repo] = {
                "branch": r["branch"],
                "commit_date": r["commit_date"][:10],
                "lists": [l.replace("_", "/", 1) for l in r["lists"]],
                "official": owner.lower() in OFFICIAL_OWNERS,
            }
    out.sort(key=lambda pair: pair[0])
    sources = sorted({l for m in repo_meta.values() for l in m["lists"]})
    head = {"generated": generated, "sources": sources, "checks": [{"id": k, "label": v} for k, v in CHECKS]}
    text = "{\n" + ",\n".join(f" {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}" for k, v in head.items())
    text += ',\n "repos": {\n' + ",\n".join(f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False, separators=(',', ':'))}" for k, v in sorted(repo_meta.items())) + "\n }"
    text += ',\n "skills": [\n' + ",\n".join(json.dumps(rec, ensure_ascii=False, separators=(",", ":")) for _, rec in out) + "\n ]\n}\n"
    json.loads(text)
    open(args.out, "w").write(text)
    out = [rec for _, rec in out]
    print(f"listed {len(out)} skills from {len(by_repo)} repositories; {sum(1 for s in out if s.get('featured'))} featured; {unlabeled} without labels", file=sys.stderr)


main()
