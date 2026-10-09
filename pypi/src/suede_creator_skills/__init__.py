"""Suede Creator Skills: open-source agent skills for Claude Code, Codex, and any skills-compatible agent.

The skill folders ship inside this package as data. The ``suede-skills`` command
lists them, prints any one of them, and copies them into an agent's skills
directory.
"""

from __future__ import annotations

from pathlib import Path

BUNDLE_DIR = Path(__file__).resolve().parent


def read_version(bundle_dir: Path = BUNDLE_DIR) -> str:
    """Return the pack version staged from the repository VERSION file."""
    try:
        return (bundle_dir / "VERSION").read_text(encoding="utf-8").strip()
    except OSError:
        try:
            from importlib.metadata import version

            return version("suede-creator-skills")
        except Exception:  # noqa: BLE001 - an unbuilt source tree has no metadata
            return "0+unknown"


__version__ = read_version()

__all__ = ["BUNDLE_DIR", "__version__", "read_version"]
