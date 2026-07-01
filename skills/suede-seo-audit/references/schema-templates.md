# Lane 5: Schema Markup — Checklist and Templates

Detailed checklist and JSON-LD templates for suede-seo-audit Lane 5.
Grade-drop rules and scoring live in SKILL.md.

## Checklist

- [ ] At least one `<script type="application/ld+json">` block present
- [ ] Schema validates at schema.org/validator (or equivalent) with no errors
- [ ] Schema type matches the page purpose:
  - FAQ page or page with Q&A section → `FAQPage`
  - Blog post or article → `Article` or `BlogPosting`
  - Product or app page → `SoftwareApplication` or `Product`
  - Docs or reference page → `TechArticle` or `WebPage`
  - Organization root page → `Organization`
  - Breadcrumb present for deep pages → `BreadcrumbList`
- [ ] FAQ schema items match the visible FAQ text exactly (no hallucinated Q&A)
- [ ] `Organization` schema includes: `name`, `url`, `logo`, `sameAs` (GitHub,
      LinkedIn, App Store, or other authoritative profiles)
- [ ] `SoftwareApplication` schema includes: `name`, `applicationCategory`,
      `operatingSystem`, `offers` (even if free; use `price: "0"`)
- [ ] `Article` schema includes: `headline`, `author`, `datePublished`,
      `dateModified`

When schema is missing or broken, provide the exact corrected JSON-LD block
inline in the findings. Do not describe it in prose. Populate every field from
visible page content or verified facts — never invent values.

## Minimum templates

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Suede",
  "url": "https://suedeai.ai",
  "logo": "https://suedeai.ai/logo.png",
  "sameAs": [
    "https://github.com/Suede-AI",
    "https://www.linkedin.com/company/suedeai"
  ]
}
```

### SoftwareApplication

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[Product name]",
  "applicationCategory": "[e.g. DeveloperApplication]",
  "operatingSystem": "[e.g. macOS, Web]",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### FAQPage

Every `name` and `text` value must match the visible FAQ word-for-word.

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
