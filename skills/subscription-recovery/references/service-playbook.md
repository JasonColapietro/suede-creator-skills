# Service playbook — validated click-paths per subscription

This file grows over time. Each entry should only be added after the flow has been
run live and confirmed — don't pre-fill entries from general knowledge without
marking them clearly as unvalidated. Until a service has an entry here, treat its
flow as unknown and discover it live during Phase 3.

## Format for new entries

```
## <Service name>

- **Discovery**: where it showed up (App Store hub / Play Store hub / PayPal / bank
  statement / user-named directly)
- **Billing page**: exact URL for viewing/canceling the subscription
- **Cancel path**: click-by-click steps, including any retention-offer screens
- **Refund/dispute path**: how to reach support (chat URL, phone, email), and what
  worked or didn't when tried
- **Gotchas**: anything non-obvious (popups, redirects, session timeouts, "are you
  sure" loops designed to be annoying)
- **Validated**: date last confirmed working

## Notes on the three platform hubs (unvalidated as of this writing)

These are documented in SKILL.md Phase 1a from general knowledge, not yet confirmed
live in this skill's own runs:

- Apple App Store: `https://apps.apple.com/account/subscriptions`
- Google Play: `https://play.google.com/store/account/subscriptions`
- PayPal: `https://www.paypal.com/myaccount/autopay/`

Confirm these live on first use and move this note into a proper dated entry above,
or correct the URLs if they've moved.
