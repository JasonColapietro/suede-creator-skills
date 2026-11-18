# Visibility scope inquiry

Keep install and how-it-works first; append the requested commercial action using the same secondary styling. Link directly to the canonical SEO assessment form with fixed campaign tags. Use cookieless Vercel custom events for the click and first actual form input; suppress QA traffic and exclude personal fields.

1. Add the hero link and click tracker; test action order, destination, QA suppression and event payload.
2. Add attributed form-start measurement in suede-seo; test once-only behavior.
3. Owner ruling (2026-11-18): either a confirmed booking with Jason or a successful email request for visibility information qualifies the inquiry. Track qualified email submissions separately from booked calls. Booked calls need verified confirmation, deduplicated by booking ID; never infer a booking from a booking-link click. The remaining dependency is a verified calendar confirmation source.
4. Run repository tests and report actual results. Use a first-party /scope-insights proxy to the existing SEO analytics collector; verify the proxy and custom event collection on preview before release.

## Implemented events

- `visibility_scope_click`: skills hero action, fixed `source=skills-hero`.
- `visibility_scope_form_start`: first trusted input in the existing SEO `heroForm`, restricted to the fixed campaign tags and public field names; once per page load.
- `visibility_scope_qualified_submit`: once per successful attributed `heroForm` email inquiry; emits only after the API accepts it, with no suppression or error. Fixed qualification `email-inquiry`; no personal data is sent.
- Existing `Lead` remains the general accepted-inquiry event across forms.
- Existing `Booking click` remains calendar navigation, not a confirmed booking.

Before production: verify /scope-insights/script.js and event collection via the existing SEO analytics project. Publish both repositories together. Qualification is settled: either booking with Jason or requesting visibility information by email qualifies. Booking completion still requires an actual confirmation source; no fabricated conversions are emitted.
