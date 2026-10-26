# Image Optimization and Dynamic OG Images

Read this before exporting any web asset or building programmatic preview
images.

Image bytes and dimensions can affect page performance. Measure the actual page
before attributing search or conversion results to image changes.

## Format Guide

| Format | Best For | Compression |
|--------|----------|-------------|
| **WebP** | Photos and graphics when target browsers support it | Lossy + lossless |
| **AVIF** | High-compression delivery when target browsers support it | Lossy + lossless |
| **JPEG** | Broad photo compatibility | Lossy |
| **PNG** | Transparency and lossless screenshots | Lossless |
| **SVG** | Trusted vector logos, icons, and illustrations | Vector |

## Optimization Checklist

- [ ] **Use a supported delivery format** and fallback strategy for the target browser matrix
- [ ] **Resize to display size**: don't serve 4000px images in 800px containers
- [ ] **Compress**: choose quality from visual review and the page's measured byte budget
- [ ] **Lazy load** below-the-fold images (`loading="lazy"`)
- [ ] **Set explicit dimensions**: `width` and `height` attributes prevent layout shift (CLS)
- [ ] **Use verified CDN optimization** when the current stack supports it
- [ ] **Add alt text**: describe what the image shows in plain words, using the
  page's topic phrase only where it is the honest description
- [ ] **Name files descriptively**: `pricing-calculator-dashboard.webp`, not
  `IMG_2041.webp`
- [ ] **Keep important images crawlable**: a real `<img>` with `src`, not a CSS
  background, and not blocked in robots.txt
- [ ] **Place the image near the text it illustrates** and give charts a
  caption that states the finding, so search and AI answers can quote it

The LCP rule for the hero image stays in SKILL.md.

## Quick Optimization Commands

```bash
# Run only after confirming the named local utility is installed.
# Convert to WebP (using cwebp)
cwebp -q 80 input.png -o output.webp

# Batch convert with ImageMagick
mogrify -format webp -quality 80 *.png

# Optimize JPEG (using jpegoptim)
jpegoptim --max=80 --strip-all *.jpg
```

To inspect image references on a page, use the host's approved read-only HTTP
or browser tool against a verified public HTTPS URL. Refuse loopback,
link-local, or private-network destinations; do not attach ambient cookies or
authentication headers; and do not send local files, credentials, or workspace
content. Inspect the returned HTML for image `src` values and report a failed or
unsafe fetch as unverified.

## Dynamic OG Images

Generate OG images programmatically for dynamic pages only after verifying the
project's current framework, installed packages, and supported runtime:

- An installed framework-native image route
- A local HTML/SVG-to-image renderer
- An authorized media service with verified template and export capabilities

For repeated page types, a deterministic template can reduce manual work. Measure
preview correctness and production time; do not promise a search outcome.
