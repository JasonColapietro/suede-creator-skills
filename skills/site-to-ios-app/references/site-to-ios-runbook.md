# Site-to-iOS Runbook

## 1. URL Audit

Start with facts about the site:

- URL, app name, target user, and core job.
- Primary routes and whether they require login.
- Responsive behavior on iPhone widths.
- PWA signals: manifest, theme color, apple touch icon, service worker.
- Legal links: privacy, terms, support, contact, account deletion if accounts
  exist.
- Sensitive flows: payments, subscriptions, user-generated content, messaging,
  uploads, camera, microphone, location, health, finance, or minors.
- Auth behavior: OAuth redirects, Sign in with Apple need, cookies, session
  persistence, same-site restrictions, universal links.

When a URL is reachable, write `SITE_TO_IOS_AUDIT.md` directly from current
evidence. Include the URL checked, route map, auth and payment behavior, PWA
signals, legal/support/account-deletion links, responsive findings at iPhone
widths, performance risks, sensitive permissions, native value opportunities,
and App Store 4.2 wrapper-risk notes.

## 2. Strategy Matrix

| Site Type | Default Strategy | Notes |
| --- | --- | --- |
| Existing SaaS or dashboard | Capacitor remote shell | Add native settings, deep links, offline/error states, and auth stability. |
| Static marketing or content site | Full native rebuild or native content app | A thin wrapper is high risk under App Store 4.2. |
| PWA with strong mobile UX | Capacitor bundled or remote shell | Keep update route explicit and preserve PWA assets. |
| Marketplace or commerce site | Capacitor remote plus native account/support | Verify payments policy, Stripe web checkout, account deletion, and support. |
| Media or creator app | Native shell or SwiftUI rebuild | Add media pickers, share, library, notifications, or offline where useful. |

## 3. Native Value Requirements

Add enough iOS-specific product surface that the binary is more than a browser:

- native launch, onboarding, empty state, loading, error, offline, and retry;
- native tab/navigation shell when the site has multiple primary sections;
- native account/settings with support, privacy, terms, delete account, restore
  purchases, and notification settings when relevant;
- universal links or deep links for important routes;
- share sheet, push, media picker, camera, files, contacts, calendar, widgets,
  StoreKit, or Sign in with Apple only when the product needs them;
- polished safe-area, keyboard, dark mode, and dynamic type behavior.

## 4. Capacitor Scaffold

Use the repo's locked package manager. For a new shell, the common shape is:

```bash
pnpm create vite site-ios --template react-ts
cd site-ios
pnpm add @capacitor/core @capacitor/ios
pnpm exec cap init
pnpm build
pnpm exec cap add ios
pnpm exec cap sync ios
```

For a remote web app, configure the server URL only when the release policy
accepts remote-delivered behavior. For a bundled app, build local assets and
ship updates through binary releases unless using a governed live-update
system.

## 5. Native Configuration

Check these before release:

- `capacitor.config.*` app ID, display name, webDir, and server routing.
- Xcode bundle identifier, version, build number, signing team, and deployment
  target.
- App icon, launch screen, status bar, orientation, and safe areas.
- Associated domains and universal links.
- Info.plist usage descriptions for every native permission.
- Entitlements for Sign in with Apple, push, associated domains, iCloud, or
  Apple Pay only when implemented.

## 6. QA Matrix

Run on a named simulator or device:

- first launch and return launch,
- login, logout, expired session, OAuth redirect,
- primary route navigation,
- keyboard forms and scroll-to-focused-field behavior,
- network offline, slow network, API failure, retry,
- file/media permission denial and later approval,
- deep link from cold and warm start,
- dark/light mode,
- background/foreground,
- payment or subscription flow if present,
- account deletion/support/privacy/terms links.

## 7. Release Gate

Produce:

- `SITE_TO_IOS_AUDIT.md`
- `SITE_TO_IOS_PLAN.md` with strategy, native value, build/run commands, QA
  matrix, screenshots/metadata/privacy work, blockers, and release gate
- build command output or CI link
- simulator/device QA notes
- screenshots and metadata
- privacy questionnaire inputs
- reviewer notes

Block release if the site cannot pass the wrapper-risk gate, if privacy/legal
links are missing, if payments violate policy, if the app does not build, or if
the user has not explicitly delegated public submission.
