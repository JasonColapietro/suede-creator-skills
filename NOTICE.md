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

---

Everything else in this repository is © 2026 Suede Labs AI, MIT licensed — see [`LICENSE`](LICENSE).
