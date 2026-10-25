"""Verify locally built Python archives against the influencer skill source.

Run after staging/building: python tests/check_package_archives.py pypi/dist
No archive is uploaded or installed by this check.
"""
import json
import sys
import tarfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILL = "suede-influencer-outreach"


def verify(archives):
    version = (ROOT / "VERSION").read_text().strip()
    source = ROOT / "skills" / SKILL
    expected = {
        p.relative_to(source).as_posix(): p.read_bytes()
        for p in source.rglob("*")
        if p.is_file() and "__pycache__" not in p.parts and not p.name.endswith(".pyc")
    }
    assert "SKILL.md" in expected and "evals/evals.json" in expected
    for archive in archives:
        if archive.suffix == ".whl":
            with zipfile.ZipFile(archive) as z:
                contents = {name: z.read(name) for name in z.namelist() if not name.endswith("/")}
            prefix = "suede_creator_skills/"
        else:
            with tarfile.open(archive) as tar:
                contents = {m.name: tar.extractfile(m).read() for m in tar if m.isfile()}
            prefix = f"suede_creator_skills-{version}/src/suede_creator_skills/"
        for rel, body in expected.items():
            name = f"{prefix}skills/{SKILL}/{rel}"
            assert contents.get(name) == body, f"{archive.name}: missing or changed {name}"
        assert contents[prefix + "VERSION"].decode().strip() == version
        catalog = json.loads(contents[prefix + "catalog.json"])
        assert catalog["version"] == version
        assert any(s["name"] == SKILL for s in catalog["skills"])
        notices = ["LICENSE", "NOTICE.md", *["licenses/" + p.name for p in (ROOT / "licenses").iterdir() if p.is_file()]]
        for rel in notices:
            matches = [body for name, body in contents.items() if name.endswith("/" + rel)]
            assert (ROOT / rel).read_bytes() in matches, f"{archive.name}: missing/changed {rel}"
        print(f"Verified influencer files, catalog, VERSION and licenses in {archive.name}")


if __name__ == "__main__":
    dist = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "pypi" / "dist"
    wheels = sorted(dist.glob("*.whl"))
    sdists = sorted(dist.glob("*.tar.gz"))
    assert len(wheels) == len(sdists) == 1, "Expected exactly one wheel and one sdist"
    verify(wheels + sdists)
