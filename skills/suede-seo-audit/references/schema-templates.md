# Lane 5: Schema Markup — Checklist and Templates

Detailed checklist and JSON-LD templates for suede-seo-audit Lane 5.
Grade-drop rules and scoring live in SKILL.md.

## Checklist

- [ ] Decide whether a Google-supported structured-data feature fits the page.
      `No supported feature identified` is a valid result; schema is not
      mandatory for every page.
- [ ] Existing schema vocabulary and shape validate at schema.org/validator
- [ ] Markup intended for a Google feature passes the Rich Results Test and
      meets that feature's current required properties
- [ ] Schema type matches the page purpose:
  - Visible site-authored FAQ → `FAQPage` is valid schema.org vocabulary, but
    Google generally shows FAQ rich results only for authoritative government
    and health sites. Do not promise visibility.
  - One user-submitted question with user-submitted answers → `QAPage`
  - Blog post or article → `Article` or `BlogPosting`
  - Product or app page → `SoftwareApplication` or `Product`
  - Docs or reference page → `TechArticle` or `WebPage`
  - Organization root page → `Organization`
  - Breadcrumb present for deep pages → `BreadcrumbList`
- [ ] FAQ schema represents the complete visible question/answer content (no
      hidden or hallucinated Q&A)
- [ ] `Organization` properties contain only verified facts. Add `logo` or
      `sameAs` only when the URLs are real, public, and identify the same entity.
- [ ] `SoftwareApplication` schema includes: `name`, `applicationCategory`,
      `operatingSystem`; include `offers` only when visible price/currency facts
      are verified and the targeted Google feature calls for them
- [ ] `Article` schema includes: `headline`, `author`, `datePublished`,
      `dateModified`

When warranted schema is missing or existing markup is broken, provide the
exact corrected JSON-LD block inline in the findings. Do not describe it only
in prose. Populate every field from visible page content or verified facts.
Never invent values, and never say valid markup guarantees a rich result.

For Google eligibility and policy, use:

- https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/test/rich-results

## Minimum templates

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Verified organization name]",
  "url": "[Canonical organization URL]"
}
```

Add `logo` and `sameAs` only when each URL is verified, public, and identifies
the same organization. They are not filler fields.

### SoftwareApplication

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[Product name]",
  "applicationCategory": "[e.g. DeveloperApplication]",
  "operatingSystem": "[e.g. macOS, Web]"
}
```

Add an `offers` object only when the offer is visible and verified. Never infer
that an app is free because no public price was found.

### FAQPage

Every `name` and `text` value must match the visible FAQ. This template
expresses schema.org vocabulary; it does not imply Google FAQ rich-result
eligibility for an ordinary commercial site.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Visible question text]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Visible answer text]"
      }
    }
  ]
}
```

### Article

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Visible headline]",
  "author": { "@type": "Person", "name": "[Author name]" },
  "datePublished": "[YYYY-MM-DD]",
  "dateModified": "[YYYY-MM-DD]"
}
```
