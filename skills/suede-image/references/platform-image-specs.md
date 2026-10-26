# Platform Image Specs and Brand Assets

Read this before sizing or exporting a social graphic, profile or listing
banner, or brand asset, or when choosing between a design tool and generation.
Every size here is a planning default that can drift: verify the platform's
current official specification, safe zones, and file limits on the work date.
The brand-mark rule and halt contract in SKILL.md still apply.

## Social Media Graphics

Platform-specific images for organic posts.

The values below are planning defaults, not current platform guarantees. Check the
platform's official specification on the work date and use its current safe zones,
file limits, and format rules.

| Platform | Planning size | Aspect ratio | Notes |
|----------|-------------|:---:|-------|
| X | 1200x675 | 16:9 | Large image card |
| LinkedIn | 1200x627 | 1.91:1 | Feed image |
| Instagram Feed | 1080x1350 | 4:5 | Profile grid crops to 3:4 since January 2025; keep the subject centered |
| Instagram Stories | 1080x1920 | 9:16 | Full screen vertical |
| Facebook | 1200x630 | 1.91:1 | Link share image |

**Workflow:**
1. Create the hero concept at highest resolution needed
2. Use a verified resize/export feature or manual crop for platform variants
3. Add text overlays deterministically when accurate text is required
4. Export at platform-specific dimensions

## Profile & Listing Banners

Banners for profiles, directory listings, and marketplace pages. Often the first visual impression.

These are planning references and can drift. Verify current official dimensions,
cropping behavior, safe zones, file limits, and format rules before production.

| Platform | Planning size | Notes |
|----------|------|-------|
| LinkedIn personal cover | 1584x396 | 4:1, safe zone center |
| LinkedIn company cover | 1128x191 | 5.9:1; LinkedIn recommends up to 4200x700 |
| Twitter/X header | 1500x500 | 3:1, partially obscured by avatar |
| Product Hunt gallery | 1270x760 | 5:3, up to 6 images |
| G2 profile | 1280x720 | 16:9, product screenshots preferred |
| GitHub social preview | 1280x640 | 2:1, shows in link cards |
| App Store screenshots | Varies by device | See suede-aso skill for full specs |
| Google Play feature graphic | 1024x500 | ~2:1, required for store listing |

**Best practices:**
- **Keep text minimal**: banners are seen at small sizes on mobile
- **Center critical content**: edges get cropped differently per device
- **Show the product truthfully**: use real UI screenshots when the listing is
  meant to demonstrate the interface
- **Match your brand**: use consistent colors, fonts, logo placement
- **Update deliberately**: refresh when the product, campaign, or positioning changes

**Workflow:**
1. Pick the platform(s) and note exact dimensions
2. For directories (Product Hunt, G2): use real product screenshots with light annotation
3. For profiles (LinkedIn, Twitter): use brand colors + tagline + optional product shot
4. Produce with a verified callable template workflow; add text deterministically
5. Test at actual display size: zoom out to check readability

## Brand Assets

Logos, icons, and illustrations. AI generation has limits here.

| Asset | AI Generation | Design Tool | Notes |
|-------|:-:|:-:|-------|
| Logo | Poor: inconsistent, not vector | Yes | Always design or commission logos |
| App icon | Concept exploration only | Yes | Refine manually and verify store rules |
| Illustrations | Good for style exploration | Depends | AI for concepts, finalize in design tool |
| Favicons | No | Yes | Derive from logo |
| Social icons | No | Yes | Use platform-provided assets |

## Design Tools

For templated, brand-consistent work where AI generation is overkill or too unpredictable.

### Canva

Can be a candidate for template-driven social graphics, presentations, email
headers, and banners. Verify the connected account, current features, export
rights, plan limits, API availability, and callable integration before routing
work to it. Keep a human review gate for brand output.

### Figma

Can be a candidate when an authorized design file or component system exists.
Verify current account access and whether the available integration can read,
edit, export, or only inspect. Do not claim write access or create files merely
because a connector exists.

### When to Use Design Tools vs. AI Generation

| Scenario | Design Tool | AI Generation |
|----------|:-:|:-:|
| Exact brand guidelines must be followed | Yes | Maybe (with strong ref images) |
| Need many size variants of one design | Yes, if current resize/export capability is verified | Usually no |
| Unique hero image for a blog post | No | Yes |
| Recurring social media template | Yes | No |
| Product mockup with real UI | No (use screenshots) | No (hallucinated UI) |
| Abstract/creative visual | No | Yes |
