"""The ``suede-skills`` command: list, show, and install the bundled skill folders."""

from __future__ import annotations

import argparse
import difflib
import json
import os
import re
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, TextIO

from . import BUNDLE_DIR, read_version

# Suede Graph Flo XR runs a bundled Claude workflow that needs these agent
# profiles in ~/.claude/agents, which is what install.sh and the Claude plugins
# do. Only the Claude target gets them; other agents read the skill contract.
AGENT_PROFILE_SKILL = "suede-graph-flo-xr"
AGENT_PROFILE_GLOB = "suede-graph-flo-xr-*.md"

IGNORED_NAMES = {"__pycache__", ".DS_Store"}
SUMMARY_LIMIT = 160


@dataclass(frozen=True)
class Skill:
    name: str
    path: Path
    description: str
    specialty: str = ""


@dataclass(frozen=True)
class Bundle:
    """Where the skill folders and their catalog live."""

    skills_dir: Path
    catalog_path: Optional[Path] = None
    version_dir: Path = BUNDLE_DIR

    @classmethod
    def packaged(cls) -> "Bundle":
        return cls(BUNDLE_DIR / "skills", BUNDLE_DIR / "catalog.json", BUNDLE_DIR)

    def catalog(self) -> Dict[str, object]:
        if self.catalog_path is None or not self.catalog_path.is_file():
            return {}
        try:
            data = json.loads(self.catalog_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return {}
        return data if isinstance(data, dict) else {}

    def specialties(self) -> List[Dict[str, str]]:
        raw = self.catalog().get("specialties")
        if not isinstance(raw, list):
            return []
        return [
            {"key": str(item.get("key", "")), "label": str(item.get("label", ""))}
            for item in raw
            if isinstance(item, dict) and item.get("key")
        ]

    def skills(self) -> List[Skill]:
        if not self.skills_dir.is_dir():
            raise BundleError(
                f"No bundled skills found at {self.skills_dir}. Reinstall the package with "
                "`pip install --force-reinstall suede-creator-skills`."
            )
        entries: Dict[str, Dict[str, object]] = {}
        raw = self.catalog().get("skills")
        if isinstance(raw, list):
            for item in raw:
                if isinstance(item, dict) and isinstance(item.get("name"), str):
                    entries[item["name"]] = item
        found = []
        for folder in sorted(self.skills_dir.iterdir(), key=lambda p: p.name):
            skill_md = folder / "SKILL.md"
            if not folder.is_dir() or not skill_md.is_file():
                continue
            entry = entries.get(folder.name, {})
            description = entry.get("description")
            if not isinstance(description, str) or not description.strip():
                description = frontmatter_description(skill_md.read_text(encoding="utf-8"))
            specialty = entry.get("specialty")
            found.append(
                Skill(
                    name=folder.name,
                    path=folder,
                    description=description,
                    specialty=specialty if isinstance(specialty, str) else "",
                )
            )
        return found


class BundleError(Exception):
    """A request the bundle cannot satisfy; reported to the user, exit code 2."""


def frontmatter_description(text: str) -> str:
    """Read ``description`` from SKILL.md frontmatter without a YAML dependency."""
    match = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.S)
    if not match:
        return ""
    lines = match.group(1).splitlines()
    for index, line in enumerate(lines):
        if not line.startswith("description:"):
            continue
        value = line[len("description:"):].strip()
        if value in {">", ">-", "|", "|-"}:
            folded = []
            for continuation in lines[index + 1:]:
                if continuation and not continuation[0].isspace():
                    break
                folded.append(continuation.strip())
            return " ".join(part for part in folded if part)
        if value.startswith('"') and value.endswith('"') and len(value) >= 2:
            try:
                return str(json.loads(value))
            except ValueError:
                return value[1:-1]
        if value.startswith("'") and value.endswith("'") and len(value) >= 2:
            return value[1:-1].replace("''", "'")
        return value
    return ""


def summarize(description: str, limit: int = SUMMARY_LIMIT) -> str:
    """First sentence of a description, trimmed to one terminal line."""
    text = " ".join(description.split())
    sentence = re.split(r"(?<=[.!?])\s", text, maxsplit=1)[0]
    if len(sentence) <= limit:
        return sentence
    return sentence[: limit - 3].rstrip(" ,;:") + "..."


def resolve_target(target: str) -> Path:
    lowered = target.lower()
    if lowered == "claude":
        return Path.home() / ".claude" / "skills"
    if lowered == "codex":
        codex_home = os.environ.get("CODEX_HOME")
        base = Path(codex_home).expanduser() if codex_home else Path.home() / ".codex"
        return base / "skills"
    return Path(target).expanduser()


def _ignore(_directory: str, names: Iterable[str]) -> List[str]:
    return [name for name in names if name in IGNORED_NAMES or name.endswith(".pyc")]


def _remove(path: Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink()
    else:
        shutil.rmtree(path)


def select_skills(bundle: Bundle, names: Sequence[str]) -> List[Skill]:
    skills = bundle.skills()
    if not names:
        return skills
    by_name = {skill.name: skill for skill in skills}
    unknown = [name for name in names if name not in by_name]
    if unknown:
        hints = []
        for name in unknown:
            close = difflib.get_close_matches(name, by_name, n=3)
            hints.append(f"{name} (did you mean: {', '.join(close)})" if close else name)
        raise BundleError(
            "Not in this pack: " + "; ".join(hints) + ". Run `suede-skills list` to see every skill."
        )
    seen = []
    for name in names:
        if by_name[name] not in seen:
            seen.append(by_name[name])
    return seen


def install(
    bundle: Bundle,
    target: str,
    names: Sequence[str] = (),
    force: bool = False,
    out: TextIO = sys.stdout,
) -> Dict[str, List[str]]:
    """Copy pack skill folders into ``target``.

    A folder that already exists is left exactly as it is unless ``force`` is
    set, and nothing outside the pack's own folder names is ever touched.
    """
    chosen = select_skills(bundle, names)
    destination = resolve_target(target)
    destination.mkdir(parents=True, exist_ok=True)
    result: Dict[str, List[str]] = {"installed": [], "replaced": [], "skipped": [], "agents": []}

    for skill in chosen:
        dest = destination / skill.name
        existed = dest.exists() or dest.is_symlink()
        if existed and not force:
            result["skipped"].append(skill.name)
            print(f"skipped    {skill.name} (already in {destination}; --force replaces it)", file=out)
            continue
        if existed:
            _remove(dest)
        shutil.copytree(skill.path, dest, ignore=_ignore)
        result["replaced" if existed else "installed"].append(skill.name)
        print(f"{'replaced ' if existed else 'installed'}  {skill.name} -> {dest}", file=out)

    if target.lower() == "claude" and any(s.name == AGENT_PROFILE_SKILL for s in chosen):
        profiles = sorted((bundle.skills_dir / AGENT_PROFILE_SKILL / "agents").glob(AGENT_PROFILE_GLOB))
        agents_dir = destination.parent / "agents"
        agents_dir.mkdir(parents=True, exist_ok=True)
        for profile in profiles:
            dest = agents_dir / profile.name
            if dest.exists() and not force:
                print(f"skipped    agent profile {profile.name} (already in {agents_dir})", file=out)
                continue
            shutil.copy2(profile, dest)
            result["agents"].append(profile.name)
            print(f"installed  agent profile {profile.name} -> {dest}", file=out)

    written = len(result["installed"]) + len(result["replaced"])
    summary = f"Installed {written} skill{'s' if written != 1 else ''} to {destination}"
    if result["skipped"]:
        summary += f"; kept {len(result['skipped'])} existing (add --force to replace them)"
    print(summary + ". Skills outside this pack were left untouched.", file=out)
    if written:
        print("Restart your agent session to load the new skills.", file=out)
    return result


def cmd_list(bundle: Bundle, specialty: Optional[str], out: TextIO) -> int:
    skills = bundle.skills()
    if specialty:
        wanted = specialty.strip().lower()
        known = bundle.specialties()
        keys = {item["key"].lower() for item in known}
        labels = {item["label"].lower(): item["key"].lower() for item in known}
        key = wanted if wanted in keys else labels.get(wanted)
        if key is None:
            options = ", ".join(item["key"] for item in known) or "none listed"
            raise BundleError(f"Unknown specialty '{specialty}'. Choose one of: {options}.")
        skills = [skill for skill in skills if skill.specialty.lower() == key]
    width = max((len(skill.name) for skill in skills), default=0)
    for skill in skills:
        print(f"{skill.name.ljust(width)}  {summarize(skill.description)}", file=out)
    noun = "skill" if len(skills) == 1 else "skills"
    print(f"\n{len(skills)} {noun}. `suede-skills show <name>` prints one in full.", file=out)
    return 0


def cmd_show(bundle: Bundle, name: str, out: TextIO) -> int:
    (skill,) = select_skills(bundle, [name])
    out.write((skill.path / "SKILL.md").read_text(encoding="utf-8"))
    return 0


def build_parser(version: str) -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="suede-skills",
        description=(
            "Install Suede Creator Skills into Claude Code, Codex, or any skills-compatible agent: "
            "SEO audits, AI search visibility, conversion copy, code review, and business-operations workflows."
        ),
        epilog="Docs: https://skills.suedeai.ai/plugins.html",
    )
    parser.add_argument("--version", action="version", version=f"suede-skills {version}")
    sub = parser.add_subparsers(dest="command", metavar="<command>")

    listing = sub.add_parser("list", help="list skills with a one-line description")
    listing.add_argument("--specialty", help="only skills in this specialty (for example: found, ship, revenue)")

    show = sub.add_parser("show", help="print a skill's SKILL.md")
    show.add_argument("name", help="skill folder name, for example suede-seo-audit")

    inst = sub.add_parser("install", help="copy skill folders into an agent's skills directory")
    inst.add_argument(
        "--target",
        default="claude",
        help="claude (~/.claude/skills, the default), codex ($CODEX_HOME/skills or ~/.codex/skills), or a directory path",
    )
    inst.add_argument(
        "--skill",
        action="append",
        default=[],
        metavar="NAME",
        help="install only this skill; repeat for several (default: every skill)",
    )
    inst.add_argument("--force", action="store_true", help="replace pack skill folders that already exist")

    sub.add_parser("path", help="print where the bundled skills live")
    return parser


def main(argv: Optional[Sequence[str]] = None, bundle: Optional[Bundle] = None, out: TextIO = sys.stdout) -> int:
    bundle = bundle or Bundle.packaged()
    parser = build_parser(read_version(bundle.version_dir))
    args = parser.parse_args(argv)
    try:
        if args.command == "list":
            return cmd_list(bundle, args.specialty, out)
        if args.command == "show":
            return cmd_show(bundle, args.name, out)
        if args.command == "install":
            install(bundle, args.target, args.skill, args.force, out)
            return 0
        if args.command == "path":
            print(bundle.skills_dir, file=out)
            return 0
    except BundleError as error:
        print(f"suede-skills: {error}", file=sys.stderr)
        return 2
    parser.print_help(out)
    return 0


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
