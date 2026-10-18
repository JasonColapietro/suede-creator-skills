"""Re-apply the current score method to directory/skills.json in place.

    python3 -I scripts/directory/rescore.py [directory/skills.json]

Recomputes every listing's score and grade from its published fields, sets
score_method and rotates snapshot_id, without re-fetching any repository.
Everything else, including `generated` and the listed set, is unchanged, and
the file keeps curate.py's byte format. Any record that cannot be scored
stops the run before the file is written. A new snapshot_id means badge
verifications made against the old scores no longer match.
"""
import collections
import json
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from curate import REPO_ROOT, dataset_text, score_listing  # noqa: E402
from grade import SCORE_METHOD, structural_pass  # noqa: E402


def rescore(data):
    errors = []
    for s in data["skills"]:
        sid = f"{s.get('repo')}/{s.get('slug')}"
        try:
            if not structural_pass(s.get("checks")):
                raise ValueError("fails the listing gate")
            s["score"], s["grade"] = score_listing(s, data["repos"].get(s["repo"]), data["generated"])
        except (KeyError, TypeError, ValueError) as e:
            errors.append(f"{sid}: {e}")
    if errors:
        raise SystemExit("cannot score:\n  " + "\n  ".join(errors))
    data["score_method"] = SCORE_METHOD
    data["snapshot_id"] = uuid.uuid4().hex
    return data


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO_ROOT, "directory", "skills.json")
    data = rescore(json.load(open(path, encoding="utf-8")))
    open(path, "w", encoding="utf-8").write(dataset_text(data))
    grades = collections.Counter(s["grade"] for s in data["skills"])
    scores = sorted(s["score"] for s in data["skills"])
    print(f"rescored {len(scores)} skills with {SCORE_METHOD}: {dict(sorted(grades.items()))}, "
          f"max {scores[-1]}, median {scores[len(scores) // 2]}", file=sys.stderr)


if __name__ == "__main__":
    main()
