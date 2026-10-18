# Featured Projects visual review

Built from the installed Impeccable guidance and the repository's PRODUCT.md / DESIGN.md.
The directory's existing warm palette, Fraunces headings, native disclosures and
copy controls carry through to a separate editorial page.

- `before-directory-desktop.png`: deployed directory before the featured entry.
- `after-directory-desktop.png`: local directory with the featured entry.
- `featured-desktop.png`, `featured-mobile.png`: editorial page, 1440px and 390px.
- `featured-coalwash-desktop.png`, `featured-coalwash-mobile.png`: plugin feature.
- `featured-install-mobile.png`: commands and automatic hook behavior at 390px.
- `results.json`: 25 passing browser checks.

Checks cover the route from the directory, the three Appie skill links, exact
CoalWash command text, keyboard copy and disclosure operation, visible focus,
44px controls, no horizontal overflow at 320/390/768/1024/1440px, reduced motion,
no-JavaScript content/disclosures, and script errors. Clipboard writes are
intercepted in the test page so the system clipboard remains unchanged.

An independent review found a fixed accessible name masking the copy button's
feedback. That label was removed; keyboard copy and feedback were rechecked.
Privacy checks over new source and generated content found no issues.

The browser is a fresh headless process with a temporary profile. It does not
attach to the user's shared browser or install browser dependencies.
`check-featured.cjs` accepts `PLAYWRIGHT_MODULE` for an existing installation,
`FEATURED_URL` for a preview/live origin, and `FEATURED_EVIDENCE` for its output.
