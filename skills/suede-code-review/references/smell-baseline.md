# Design Smell Baseline

A fixed maintainability baseline the review carries even when the repo documents
no coding standards: twelve code smells from Martin Fowler's _Refactoring_
(ch. 3), as adapted in [mattpocock/skills](https://github.com/mattpocock/skills)
(MIT, © 2026 Matt Pocock — see `NOTICE.md`). Match each against the diff, not
the whole file: flag only smells the change introduces or makes worse.

## Binding rules

1. **The repo overrides.** A documented project rule always wins; where the repo
   endorses a pattern this baseline would flag, suppress the smell. This is the
   same precedence as Project Rules and Learnings in the skill body.
2. **Always a judgment call.** Every smell finding is a labeled heuristic —
   "possible Feature Envy" — never a hard violation. Severity is P3 by default;
   P2 only when the smell sits on a changed critical path and demonstrably
   raises defect risk (name the path). Confidence is `medium` at best — these
   are read from the code, not executed.
3. **Skip what tooling enforces.** If a linter, formatter, or type checker
   already catches it, it is that gate's job, not a manual finding.
4. **Diff-scoped.** Pre-existing smells outside the changed lines are not
   findings; at most one "residual risk" line if the change builds on them.

## The twelve smells

Each reads *what it is* → *how to fix*:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal
  what it does or holds. → Rename it; if no honest name comes, the design is
  murky — say that instead.
- **Duplicated Code** — the same logic shape appears in more than one hunk or
  file in the change. → Extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than
  its own. → Move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep traveling together (a
  type wanting to be born). → Bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain
  concept that deserves its own type. → Give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type
  recurs across the change. → Replace with polymorphism, or one map both sites
  share.
- **Shotgun Surgery** — one logical change forces scattered edits across many
  files in the diff. → Gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated
  reasons. → Split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for
  needs the spec doesn't have. → Delete it; inline back until a real need
  shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't
  depend on. → Hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. →
  Cut it, call the real target directly.
- **Refused Bequest** — a subclass or implementer that ignores or overrides
  most of what it inherits. → Drop the inheritance, use composition.

## Output shape

Report a smell as a normal P2/P3 finding with the smell named and the hunk
quoted:

```
[P3] lib/orders.ts:88 — possible Data Clumps: (currency, amount, region) travel
together through 3 signatures in this diff; bundle as a Money type. Confidence: medium
```

Never let smell findings outnumber or outrank correctness findings — they feed
the Technical Debt lane, not the Ship Gate, unless rule 2's P2 condition is
met.
