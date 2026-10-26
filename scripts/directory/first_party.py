"""Ingest the explicitly accepted Suede source scope without refreshing other publishers.

This reads committed source files; it never imports or executes code from that source.
Citation documents are locally retained, independently fetched pinned README inputs.
"""
import argparse
import copy
import datetime as dt
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import tarfile
import uuid

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / "scripts/directory"
REPO = "JasonColapietro/suede-creator-skills"
SHA = re.compile(r"[a-f0-9]{40}")
sys.path.insert(0, str(TOOLS))
from curate import dataset_text, jaccard, norm, shingles  # noqa: E402


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def file_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git(source, *args):
    return subprocess.run(["git", "-c", "core.hooksPath=/dev/null", "-C", str(source), *args],
                          check=True, capture_output=True, text=True, timeout=30).stdout.strip()


def external(data):
    return {"repos": {k: v for k, v in data["repos"].items() if k.lower() != REPO.lower()},
            "skills": [s for s in data["skills"] if s["repo"].lower() != REPO.lower()]}


def checked_source(source, revision, inclusions):
    if not SHA.fullmatch(revision):
        raise ValueError("source revision must be a full lowercase Git SHA")
    if not source.is_dir() or Path(git(source, "rev-parse", "--show-toplevel")).resolve() != source.resolve():
        raise ValueError("source must be an available Git checkout root")
    if git(source, "rev-parse", "HEAD") != revision:
        raise ValueError("source revision does not match checkout HEAD")
    origin = git(source, "remote", "get-url", "origin")
    if origin.rstrip("/") not in (f"https://github.com/{REPO}", f"https://github.com/{REPO}.git", f"git@github.com:{REPO}.git"):
        raise ValueError("source origin is not the canonical Suede repository")
    if git(source, "status", "--porcelain", "--untracked-files=all"):
        raise ValueError("source checkout must be clean, including untracked files")
    if REPO not in inclusions.get("repositories", []):
        raise ValueError("canonical repository is not accepted")
    roots = inclusions.get("skill_roots", {}).get(REPO)
    names = inclusions.get("skills", {}).get(REPO)
    if roots != ["skills"] or not isinstance(names, list) or not names or len(set(names)) != len(names):
        raise ValueError("source scope requires the skills root and a nonempty unique explicit allowlist")
    if any(not isinstance(n, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", n) for n in names):
        raise ValueError("invalid source scope member")
    files = {}
    for item in git(source, "ls-files", "-z").split("\0"):
        if not item or not (item.startswith("skills/") or "/" not in item):
            continue
        path = source / item
        if path.is_symlink() or any(p.is_symlink() for p in path.parents if p != source.parent):
            raise ValueError(f"source symlink is unsupported: {item}")
        if not path.is_file() or not path.resolve().is_relative_to(source.resolve()):
            raise ValueError(f"source file unavailable: {item}")
        files[item] = file_hash(path)
    for name in names:
        if f"skills/{name}/SKILL.md" not in files:
            raise ValueError(f"accepted source scope member is missing: {name}")
    return files, names


def citation_inputs(path, sources, work):
    rows = json.loads(path.read_text())
    if not isinstance(rows, list) or len(rows) != len(sources):
        raise ValueError("citation inputs must cover every indexed curated list exactly once")
    seen, receipts = set(), []
    for row in rows:
        repo, content = row["repo"], row["content"]
        if repo not in sources or repo.lower() in seen or row["path"] != "README.md" or not isinstance(content, str):
            raise ValueError("unrecognized, duplicate or malformed citation source")
        if not SHA.fullmatch(row["commit"]) or not SHA.fullmatch(row["blob"]):
            raise ValueError("citation requires exact commit and blob revisions")
        seen.add(repo.lower())
        payload = content.encode()
        blob = hashlib.sha1(f"blob {len(payload)}\0".encode() + payload).hexdigest()
        if blob != row["blob"]:
            raise ValueError(f"citation blob does not match retained document: {repo}")
        target = work / "lists" / repo.replace("/", "_")
        target.mkdir(parents=True)
        (target / "README.md").write_text(content)
        receipts.append({"source": repo, "commit": row["commit"], "path": row["path"], "blob": blob,
                         "document_sha256": hashlib.sha256(payload).hexdigest(),
                         "evidence_status": "caller_supplied_pinned_document",
                         "local_validation": "git_blob_integrity_only"})
    return receipts


def run(args):
    assessment = dt.date.fromisoformat(args.assessment_date).isoformat()
    data_path = ROOT / "directory/skills.json"
    original_bytes = data_path.read_bytes()
    data = json.loads(original_bytes)
    inclusions = json.loads((ROOT / "directory/inclusions.json").read_text())
    source = args.source.resolve()
    source_files, names = checked_source(source, args.revision, inclusions)
    if not args.source_branch or git(source, "check-ref-format", "--branch", args.source_branch) != args.source_branch:
        raise ValueError("invalid source branch")
    with tempfile.TemporaryDirectory(prefix="suede-first-party-") as tmp:
        work = Path(tmp)
        receipts = citation_inputs(args.citations, data["sources"], work)
        def tool(name, *argv):
            return subprocess.run([sys.executable, "-I", str(TOOLS / name), *map(str, argv)], check=True,
                           capture_output=True, text=True, timeout=120,
                           env={**os.environ, "SUEDE_DIRECTORY_DATE": data["generated"],
                                "SUEDE_DIRECTORY_PRUNE_LABELS": "", "SUEDE_DIRECTORY_LABEL_QUEUE": "",
                                "SUEDE_DIRECTORY_POLICY_REPORT": ""})
        tool("extract_links.py", work / "lists", work / "candidates.json")
        candidates = json.loads((work / "candidates.json").read_text())
        citation_lists = next((r["lists"] for r in candidates if r["repo"] == REPO.lower()), [])
        cited = {n.replace("_", "/", 1).lower() for n in citation_lists}
        receipts = [r for r in receipts if r["source"].lower() in cited]
        for receipt in receipts:
            receipt["target"] = f"https://github.com/{REPO}"
        (work / "src").mkdir()
        snapshot = work / "src" / REPO.lower().replace("/", "__")
        snapshot.mkdir()
        # The parser walks physical files, including ignored local files. Read
        # only the committed tree so every observed byte belongs to revision.
        roots = ["skills"] + [name for name in source_files if "/" not in name]
        archive = subprocess.run(["git", "-C", str(source), "archive", "--format=tar", args.revision, "--", *roots],
                                 check=True, capture_output=True, timeout=30).stdout
        with tarfile.open(fileobj=io.BytesIO(archive)) as tree:
            for member in tree.getmembers():
                relative = Path(member.name)
                if relative.is_absolute() or ".." in relative.parts or not (member.isfile() or member.isdir()):
                    raise ValueError(f"unsupported committed tree member: {member.name}")
                target = snapshot / relative
                if member.isdir():
                    target.mkdir(parents=True, exist_ok=True)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(tree.extractfile(member).read())
        archived_files = {str(p.relative_to(snapshot)): file_hash(p) for p in snapshot.rglob("*") if p.is_file()}
        if archived_files != source_files:
            raise ValueError("committed archive differs from the retained source inventory (check export attributes)")
        # Existing parser Git calls read only metadata (revision/date/origin).
        # No source program or checkout hook is executed.
        (snapshot / ".git").symlink_to(source / ".git", target_is_directory=(source / ".git").is_dir())
        tool("parse_skills.py", work / "src", work / "candidates.json", work / "raw.json")
        raw = json.loads((work / "raw.json").read_text())
        raw = [r for r in raw if r["dir"] in {f"skills/{name}" for name in names}]
        if len(raw) != len(names) or {r["name"] for r in raw} != set(names):
            raise ValueError("parsed source inventory differs from the accepted scope")
        for row in raw:
            row["branch"] = args.source_branch
        (work / "raw.json").write_text(json.dumps(raw))
        # Unrelated dated citation receipts belong to their original snapshot.
        scoped = {"repositories": [REPO], "skills": {REPO: names}, "skill_roots": {REPO: ["skills"]}}
        (work / "inclusions.json").write_text(json.dumps(scoped))
        curated = tool("curate.py", "--raw", work / "raw.json", "--labels", ROOT / "directory/labels.json",
             "--inclusions", work / "inclusions.json", "--out", work / "scoped.json")
        scoped_data = json.loads((work / "scoped.json").read_text())
        if {s["name"] for s in scoped_data["skills"]} != set(names):
            missing = sorted(set(names) - {s["name"] for s in scoped_data["skills"]})
            raise ValueError(f"source scope did not pass existing curator policies: {missing}; {curated.stderr.strip()}")
        output = copy.deepcopy(data)
        untouched = external(data)
        # Scoped curation cannot replace another publisher's retained listing.
        # Apply the existing cross-repository copy predicate and stop for review.
        for candidate in scoped_data["skills"]:
            desc = norm(candidate["description"])
            grams = shingles(candidate["description"])
            for existing in untouched["skills"]:
                if ((len(candidate["description"]) >= 80 and desc == norm(existing["description"]))
                        or (norm(candidate["name"]) == norm(existing["name"])
                            and jaccard(grams, shingles(existing["description"])) >= 0.6)):
                    raise ValueError(f"source is a copy of an existing external listing: {candidate['name']}")
        output["repos"] = {**untouched["repos"], **scoped_data["repos"]}
        output["skills"] = untouched["skills"] + scoped_data["skills"]
        output["snapshot_id"] = uuid.uuid4().hex
        if external(output) != untouched:
            raise ValueError("external publisher data changed during scoped intake")
        # Detect source/index movement during parsing before producing either file.
        if checked_source(source, args.revision, inclusions)[0] != source_files:
            raise ValueError("source changed during intake")
        if data_path.read_bytes() != original_bytes:
            raise ValueError("directory snapshot changed during intake")
        receipt = {"schema_version": 1, "repository": REPO, "source_revision": args.revision,
                   "source_branch": args.source_branch, "source_status": "proposed_draft_revision",
                   "assessment_date": assessment, "external_snapshot_date": data["generated"],
                   "scope": sorted(names), "source_files": source_files,
                   "tools": {name: file_hash(TOOLS / name) for name in
                             ("first_party.py", "parse_skills.py", "curate.py", "grade.py", "badges.mjs", "extract_links.py")},
                   "citations": receipts, "external_before_sha256": digest(untouched),
                   "external_after_sha256": digest(external(output)), "security_scan_status": "not_scanned",
                   "dataset_before_sha256": hashlib.sha256(original_bytes).hexdigest()}
        rendered = dataset_text(output)
        receipt["dataset_after_sha256"] = hashlib.sha256(rendered.encode()).hexdigest()
        args.receipt.parent.mkdir(parents=True, exist_ok=True)
        args.receipt.write_text(json.dumps(receipt, indent=2) + "\n")
        data_path.write_text(rendered)
        print(f"Ingested {len(names)} first-party skills at {args.revision}; {len(untouched['skills'])} external records preserved")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--source", type=Path, required=True)
    ap.add_argument("--revision", required=True)
    ap.add_argument("--source-branch", default="main")
    ap.add_argument("--citations", type=Path, required=True, help="Pinned README inputs from all indexed curated lists")
    ap.add_argument("--assessment-date", required=True)
    ap.add_argument("--receipt", type=Path, required=True)
    args = ap.parse_args()
    try:
        run(args)
    except (ValueError, OSError, KeyError, subprocess.SubprocessError) as exc:
        detail = exc.stderr if isinstance(exc, subprocess.CalledProcessError) else str(exc)
        ap.exit(1, f"First-party intake refused: {detail}\n")


if __name__ == "__main__":
    main()
