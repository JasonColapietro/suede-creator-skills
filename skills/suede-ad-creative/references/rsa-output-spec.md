# Google RSA Output Spec

When the user requests Google Ads RSAs (Responsive Search Ads), output MUST comply with these platform limits and structural requirements. Do not output any RSA that violates them. `suede-ad-creative` owns this spec; `suede-ads` routes RSA generation here and keeps campaign, keyword, and budget decisions.

## Hard limits per RSA (enforce before responding)

Per-field **character** limits come from the Platform Specs section of this skill's SKILL.md
and [platform-specs.md](platform-specs.md); use those numbers so the copies cannot drift. This spec adds the stricter **quantity** mandate on top:
Google permits "up to" 15 headlines and 4 descriptions; a Suede AI RSA ships all of them.

- **Headlines:** exactly **15** per RSA, each within the headline character limit in SKILL.md Platform Specs (count characters, including spaces). Render as `1. ... (NN chars)` so the reader can verify.
- **Descriptions:** exactly **4** per RSA, each within the stated description character limit.
- **Paths:** up to 2 path fields, each within the stated path character limit.
- **Final URL:** present, https.
- **Pinning:** state any pinned positions explicitly. Default = unpinned unless user asks.
- **Per-account guardrail:** Google enforces **3 RSAs max per ad group**. When the user asks for >3, group them by ad group.

## Required sidecar artifacts (always include with RSA request)

1. **Ad group structure**, labeled `Ad group structure:`: list each ad group with its theme, target keywords (match types), and which RSAs map to it.
2. **Negative keyword list**, labeled `Negative keywords:`: minimum **8** entries, group-level vs campaign-level called out.
3. **Sitelinks** (≥ 4), **Callouts** (≥ 4 ≤25 chars), **Structured snippets** if relevant.

## Regulated verticals

When `.agents/product-marketing.md` names a regulated vertical (medical, legal,
financial, alcohol, and similar), load its compliance list of banned claims,
required disclaimers, and required geo modifiers, and enforce it in headlines,
descriptions, sitelinks, and callouts. Never hardcode one client's list into
another account's ads. With no list supplied, avoid superlatives, outcome
guarantees, and comparative claims, and flag that the vertical's rules are
unverified.

## Output ORDER (mandatory: emit in this order to avoid truncation)

1. **Ad group structure** (short)
2. **Negative keywords** (≥8, MANDATORY: emit BEFORE RSAs so it isn't dropped if output runs long)
3. **Sitelinks** (≥4)
4. **Callouts** (≥4)
5. **RSA1, RSA2, RSA3** (largest section, last: safe to truncate gracefully)

## Output template (mandatory shape)

```
Ad group structure:
- AG1 [theme]: keywords (match types) → RSA1, RSA2
- AG2 [theme]: ...

Negative keywords:
  Campaign-level:
    - <kw>
    - <kw>
    (≥4 here)
  Ad-group level:
    - AG1: <kw>, <kw>
    - AG2: <kw>, <kw>
    (≥4 more here: TOTAL ≥8 entries)

Sitelinks (≥4):
  - <title (≤25)> | <desc1 (≤35)> | <desc2 (≤35)> | URL

Callouts (≥4, each ≤25 chars):
  - <callout>

RSA1: [ad group name]
  Final URL: https://...
  Path1: ...   Path2: ...
  Headlines (15, each ≤30 chars):
    1. <headline> (NN chars)
    ...
    15. <headline> (NN chars)
  Descriptions (4, each ≤90 chars):
    1. <description> (NN chars)
    ...
    4. <description> (NN chars)
  Pinning: H1=none; H2=none; ...   (or explicit pins)

RSA2: ...
RSA3: ...
```

## Self-check before responding

Before sending the output, run this checklist mentally:

- [ ] Each RSA has exactly 15 headlines, exactly 4 descriptions.
- [ ] Every headline is ≤30 chars; every description is ≤90 chars. Character counts printed.
- [ ] Negative keyword list labeled and ≥8 entries.
- [ ] Ad group structure labeled.
- [ ] If the vertical is regulated: the supplied compliance list is enforced, required geo modifiers and disclaimers are present, and the language matches the market.

If any check fails, rewrite before responding. Do not ship partial RSAs.
