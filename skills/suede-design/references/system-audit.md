# System Audit

Read this for System mode: a reusable app shell, launch system, component
family, or design-system review. The mode table, the pass threshold, and the
ship gate stay in SKILL.md.

## Deliverables and drift

For a reusable app shell, launch system, or component family, produce at the
smallest useful fidelity: a token map (color roles, type scale, spacing, radii,
shadows, motion, z-layers, semantic states) in `DESIGN.md` or
`design-tokens.json`; a state matrix (default, hover, focus, active, disabled,
loading, empty, success, warning, error, permission-denied); an interface
vocabulary; a screenshot contract with seeded demo data; an accessibility pass
(contrast, focus order, touch targets, keyboard paths, reduced motion); and
migration notes.

Raise a system issue when a token, component, spacing pattern, or state repeats
three or more times or controls a high-visibility surface. Name the drift cause:
token missing, token ignored, component gap, content pressure, platform
convention, or legacy debt.

## Scorecard

```text
Color consistency: /10      Typography hierarchy: /10
Spacing rhythm: /10         Component consistency: /10
Responsive behavior: /10    Dark/light behavior: /10
Motion restraint: /10       Accessibility: /10
Information density: /10    Polish: /10
Total: /100
```

Below 70: fix the two lowest dimensions before styling new features there. Any
dimension at 4 or lower is a P1 finding.
