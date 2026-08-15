---
name: suede-marketing-psychology
description: "Suede-affiliated ethical application of behavioral science to marketing decisions, including framing, anchoring, social proof, loss aversion, choice architecture, and friction. Use when the user needs a named psychological model, an evidence-aware application, and a testable hypothesis. NOT FOR: clinical or mental-health advice, deceptive dark patterns, page implementation (use suede-site-alchemy), or pricing design (use suede-pricing)."
metadata:
  version: 2.0.0
---

# Suede Ethical Marketing Psychology

Suede applies behavioral models as ethical, testable hypotheses—not as universal explanations or permission to manipulate. Identify the relevant mechanism, state its evidence limits, translate it into a specific marketing application, and define how the user can measure whether it helped.

## How to Use This Skill

Read `.agents/product-marketing.md` first if it exists and ask only for what it does not cover; see `suede-product-marketing` for path fallbacks.

Then:

1. Use the Quick Reference table below to narrow the user's challenge to two or three candidate models.
2. Read only those entries from `references/model-catalog.md` — the full library, with an evidence tier on every entry. Read it whenever you are about to name a model; never recommend one from memory, because the tier is what bounds the claim you are allowed to make.
3. Emit one block per recommendation using the contract below. No recommendation ships without all four parts.

### Per-recommendation contract

```
**Mechanism:** [named model] — [the behavior it predicts, in one sentence]
**Evidence:** [Robust / Context-dependent / Contested / Folklore / Framework,
copied from the catalog entry] — [what that tier means for how hard you may
lean on it here]
**Application:** [the specific change to this product, page, price, or
sequence — not a generic tactic]
**Test:** [what changes, what you measure, the success threshold, and how long
it runs before you decide]
```

If the catalog entry is **Contested** or **Folklore**, say so inside the recommendation and present the application as an experiment to run, never as a reason the change will work. If nothing in the catalog fits, say that rather than stretching a model — an unevidenced behavioral claim is out of bounds no matter how plausible it sounds.

## Quick Reference

When facing a marketing challenge, consider these models, then pull their entries from `references/model-catalog.md`:

| Challenge | Relevant Models |
|-----------|-----------------|
| Low conversions | Hick's Law, Activation Energy, BJ Fogg Behavior Model |
| Price objections | Anchoring, Framing, Mental Accounting, Loss Aversion |
| Building trust | Authority, Social Proof, Reciprocity, Pratfall Effect |
| Increasing urgency | Scarcity, Loss Aversion, Zeigarnik Effect |
| Retention/churn | Endowment Effect, Switching Costs, Status-Quo Bias |
| Growth stalling | Theory of Constraints, Local vs Global Optima, Compounding |
| Decision paralysis | Paradox of Choice, Default Effect, Nudge Theory |
| Onboarding | Goal-Gradient, IKEA Effect, Commitment & Consistency |

---

## Task-Specific Questions

1. What specific behavior are you trying to influence?
2. What does your customer believe before encountering your marketing?
3. Where in the journey (awareness → consideration → decision) is this?
4. What's currently preventing the desired action?
5. Have you tested this with real customers?

---

## Boundaries

- Do not diagnose people, infer protected traits, or present marketing models as clinical or universal truths.
- Do not recommend deception, coercion, fake scarcity, hidden defaults, obstructive cancellation, or other dark patterns.
- Do not claim a behavioral effect will occur without evidence; express it as a hypothesis and define a test.
- Do not publish copy, change interfaces, or decide ethical and legal risk for the user.

## Routing

- Use `suede-site-alchemy` for page application and `suede-copy` for message framing.
- Use `suede-pricing` for pricing architecture and `suede-paywalls` for in-product upgrade moments.
- Use `suede-ab-testing` to test behavioral hypotheses.
