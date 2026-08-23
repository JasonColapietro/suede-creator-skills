# Notice — third-party content

## marketingskills — Corey Haines

Forty skills in this pack cover paid acquisition, outbound, monetization, lifecycle, and
marketing operations. They are **adapted from [marketingskills](https://github.com/coreyhaines31/marketingskills)
by Corey Haines**, used and redistributed under the MIT License.

The upstream project is the origin of this material. If these skills are useful to you, the
credit belongs there — go look at the original.

**Upstream:** https://github.com/coreyhaines31/marketingskills
**Upstream license:** MIT, Copyright (c) 2025 Corey Haines — full text in
[`licenses/marketingskills-MIT.txt`](licenses/marketingskills-MIT.txt)

### What changed in adaptation

The source material was substantially adapted into Suede-owned workflows while
preserving useful domain substance. The adaptation includes:

- frontmatter rewritten to this pack's `description` convention (trigger phrasing plus
  `NOT FOR:` routing, so the router can disambiguate them)
- skill names prefixed `suede-` to sit alongside the existing pack without collisions
- Suede-native titles, operating guidance, boundaries, routing, UI metadata, and eval identities
- conditional tool discovery, authorization gates, evidence requirements, and manual fallbacks
- repaired local references and removal of source-repository-specific paths and assumptions
- internal cross-references repointed at this pack's equivalents, so each skill stands alone
- light framing pass on each `SKILL.md` for a consistent voice across the pack

### Skills adapted from this source

`suede-ab-testing`, `suede-ad-creative`, `suede-ads`, `suede-ai-seo`, `suede-analytics`,
`suede-aso`, `suede-attribution`, `suede-churn-prevention`, `suede-co-marketing`,
`suede-cold-email`, `suede-community-marketing`,
`suede-competitor-profiling`, `suede-competitors`, `suede-content-strategy`,
`suede-customer-research`, `suede-directory-submissions`, `suede-emails`, `suede-free-tools`,
`suede-image`, `suede-lead-magnets`, `suede-marketing-council`, `suede-marketing-ideas`,
`suede-marketing-loops`, `suede-marketing-plan`, `suede-marketing-psychology`, `suede-offers`,
`suede-onboarding`, `suede-paywalls`, `suede-pricing`, `suede-product-marketing`,
`suede-programmatic-seo`, `suede-prospecting`, `suede-public-relations`, `suede-referrals`,
`suede-revops`, `suede-sales-enablement`, `suede-signup`, `suede-sms`, `suede-social`,
`suede-video`

---

## skills — Matt Pocock

The Design Smell Baseline in `suede-code-review` (`references/smell-baseline.md`,
routed from `suede-code`) — a twelve-smell maintainability catalog with
repo-overrides / judgment-call / skip-tooling binding rules — is **adapted from
[skills](https://github.com/mattpocock/skills) by Matt Pocock** (itself drawing
on Martin Fowler's _Refactoring_, ch. 3), used and redistributed under the MIT
License. The spec-source discovery order and reviewability pre-flight in
`suede-code-review` are adapted from the same source.

**Upstream:** https://github.com/mattpocock/skills
**Upstream license:** MIT, Copyright (c) 2026 Matt Pocock — full text in
[`licenses/mattpocock-skills-MIT.txt`](licenses/mattpocock-skills-MIT.txt)

The adaptation rescopes the material to this pack's review contract: findings
carry P-levels and confidence labels, smells are diff-scoped and feed the
Technical Debt lane rather than the Ship Gate, and the two-axis
standards/spec separation is folded into the existing Intent Compliance
section instead of shipping as a separate skill.

The **Agent-Facing Docs lane** in `johnny-suede-write`
(`references/writing-for-agents.md`) is adapted from the same upstream project's
`writing-for-agents` skill (`SKILL.md` and `SKILL-MECHANICS.md`). The borrowed
material is the lever set: context pointers with their branch and trigger rules,
the context-load versus cognitive-load split, the information hierarchy with
progressive disclosure and co-location, completion criteria (clarity, demand,
premature completion, legwork), the sequence and invocation cuts of splitting,
leading words, prompt-the-positive, the pruning tests (single source of truth,
environment-as-cache, relevance, sediment, no-ops), and the model-invoked versus
user-invoked trade-off with router skills.

The adaptation folds the levers into this pack's existing writing stack as one
lane rather than a standalone skill: a six-lever ordered summary in `SKILL.md`
with the full method disclosed to `references/`, bound to Suede's placement
thresholds (the ~100-line reference split and the 500-line `SKILL.md` ceiling)
and scored by the stack's existing 70-point ship gate.

---

## Graph of Thoughts — ETH Zurich

The operation graph and thought-state model in
`skills/suede-ship/workflows/suede-ship.js` are adapted from
[Graph of Thoughts](https://github.com/spcl/graph-of-thoughts) by ETH Zurich,
pinned at commit `3d9d9dbd8937d47a4441f681b8b40e3c5b054f16`.

**Upstream:** https://github.com/spcl/graph-of-thoughts at
`3d9d9dbd8937d47a4441f681b8b40e3c5b054f16`

**Adapted operation file:** `skills/suede-ship/workflows/suede-ship.js`

**Upstream license:** BSD terms in
[`licenses/graph-of-thoughts-BSD.txt`](licenses/graph-of-thoughts-BSD.txt)
and the byte-identical traveling copy at
[`skills/suede-ship/LICENSE.graph-of-thoughts-BSD.txt`](skills/suede-ship/LICENSE.graph-of-thoughts-BSD.txt).
The traveling copy is included by single-skill installers with the adapted
workflow source.

**Paper:** Maciej Besta et al. (2024), “Graph of Thoughts: Solving Elaborate
Problems with Large Language Models,” _Proceedings of the AAAI Conference on
Artificial Intelligence_, 38(16), 17682–17690.

---

Except for the third-party adaptations listed above, everything else in this
repository is © 2026 Suede Labs AI, MIT licensed — see [`LICENSE`](LICENSE).
