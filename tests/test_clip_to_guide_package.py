import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
VALIDATOR_PATH = (
    ROOT / "skills" / "suede-clip-to-guide" / "scripts" / "validate_package.py"
)
EXAMPLE_PATH = (
    ROOT / "skills" / "suede-clip-to-guide" / "references" / "example-package.md"
)

SPEC = importlib.util.spec_from_file_location("clip_to_guide_validator", VALIDATOR_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"cannot load validator at {VALIDATOR_PATH}")
VALIDATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATOR)


def validate_text(text: str) -> list[str]:
    with tempfile.TemporaryDirectory() as temp_dir:
        path = Path(temp_dir) / "package.md"
        path.write_text(text, encoding="utf-8")
        return VALIDATOR.validate(path)


def with_mode(text: str, mode: str, certainty: str) -> str:
    return (
        text.replace('execution_mode: "standard"', f'execution_mode: "{mode}"')
        .replace(
            'certainty_status: "not-required"',
            f'certainty_status: "{certainty}"',
        )
    )


def with_proved_gate(text: str, check_2_process: str) -> str:
    original = """- Required: No; standard execution mode.
- Checked artifact version/hash: not required.
- Check 1 owner/process: not required.
- Check 1 evidence: not required.
- Check 1 verdict: NOT-REQUIRED.
- Check 2 owner/process: not required.
- Check 2 evidence: not required.
- Check 2 verdict: NOT-REQUIRED.
- Contradictions resolved: not required.
- Final certainty verdict: NOT-REQUIRED."""
    replacement = f"""- Required: Yes.
- Checked artifact version/hash: package-sha256-7af91d.
- Check 1 owner/process: fleet worker acceptance-criteria self-check.
- Check 1 evidence: Verified transcript timestamps, rights record, guide bridge, exact copy, and validator output.
- Check 1 verdict: PROVED.
- Check 2 owner/process: {check_2_process}
- Check 2 evidence: Reopened the source transcript and guide, then inspected the assembled package with an adversarial claim and rights lens.
- Check 2 verdict: PROVED.
- Contradictions resolved: No contradictions remained after comparing both evidence records.
- Final certainty verdict: PROVED."""
    return text.replace(original, replacement)


class ClipToGuidePackageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.example = EXAMPLE_PATH.read_text(encoding="utf-8")

    def test_standard_example_passes(self) -> None:
        self.assertEqual(validate_text(self.example), [])

    def test_max_effort_approved_requires_proved_status(self) -> None:
        package = with_mode(self.example, "max-effort", "pending").replace(
            'publication_status: "draft"',
            'publication_status: "approved"',
        )
        errors = validate_text(package)
        self.assertIn(
            "approved max-effort package needs certainty_status: proved",
            errors,
        )

    def test_proved_gate_rejects_same_process_twice(self) -> None:
        package = with_proved_gate(
            with_mode(self.example, "max-effort", "proved"),
            "fleet worker acceptance-criteria self-check.",
        )
        errors = validate_text(package)
        self.assertIn(
            "proved certainty gate needs two distinct check owners or processes",
            errors,
        )

    def test_proved_gate_rejects_duplicate_evidence(self) -> None:
        package = with_proved_gate(
            with_mode(self.example, "max-effort", "proved"),
            "Fresh-context adversarial review.",
        ).replace(
            "Reopened the source transcript and guide, then inspected the "
            "assembled package with an adversarial claim and rights lens.",
            "Verified transcript timestamps, rights record, guide bridge, "
            "exact copy, and validator output.",
        )
        errors = validate_text(package)
        self.assertIn(
            "proved certainty gate needs two distinct evidence records",
            errors,
        )

    def test_worker_fleet_proved_gate_accepts_controller_review(self) -> None:
        package = with_proved_gate(
            with_mode(self.example, "worker-fleet", "proved"),
            "Controller independent source-truth review.",
        )
        self.assertEqual(validate_text(package), [])

    def test_worker_fleet_rejects_second_worker_as_review(self) -> None:
        package = with_proved_gate(
            with_mode(self.example, "worker-fleet", "proved"),
            "Second fleet worker self-check.",
        )
        errors = validate_text(package)
        self.assertIn(
            "proved worker-fleet gate needs controller review as Check 2",
            errors,
        )


if __name__ == "__main__":
    unittest.main()
