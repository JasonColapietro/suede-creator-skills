---
name: site-to-ios-app
description: "Use when converting any website, web app, PWA, SaaS dashboard, content site, or marketplace into an iOS app using the public Suede-originated site-to-iOS workflow. Covers URL audit, App Store 4.2 wrapper-risk checks, Capacitor or native-shell strategy, native value requirements, iOS build scaffolding, screenshots, metadata, privacy, and release gating."
---

# Site to iOS App

## Principle

Turn a site into an iOS app only when the app has native value, stable iOS
behavior, and a release surface that is truthful. A raw web page in a frame is
not enough for an App Store-quality product.

This is the public Suede site-to-iOS workflow: audit first, choose the least
risky shell or native strategy, add iOS-specific value, and run an "impeccable"
ship gate before release.

## Start Here

Read `references/site-to-ios-runbook.md` before scaffolding or changing an
iOS wrapper.

If a URL is available, create `SITE_TO_IOS_AUDIT.md` directly. Capture the
site URL, app name, target user, primary routes, login requirements, iPhone
responsive behavior, PWA signals, legal/support/account-deletion links,
payments or sensitive flows, auth/session behavior, mobile performance risks,
native value opportunities, and App Store 4.2 wrapper risk.

Then create `SITE_TO_IOS_PLAN.md` directly. Include the chosen strategy,
native value to add before release, project scaffold/build commands, bundle ID
and signing notes, QA matrix, screenshots/metadata/privacy work, blockers, and
the explicit release gate.

## Strategy Decision

Choose one route and write down why:

- Capacitor remote shell: live site remains the product surface and web deploys
  should update most content and behavior.
- Capacitor bundled shell: static/SPA assets are packaged into the binary and
  updates require App Store release unless paired with live APIs.
- Native SwiftUI shell with WebView: native navigation, settings, auth, push,
  share, error, and account surfaces wrap a site view.
- Full native rebuild: use when the site is mostly content, has weak mobile UX,
  or carries high wrapper rejection risk.

This skill stands alone: the runbook covers audit, strategy, scaffold,
configuration, QA, and the release gate end to end. Private Suede companions
(ios-capacitor-shell, ios-swiftui-product, ios-aso-launch,
ios-app-store-release) go deeper on shell internals, native architecture, ASO,
and App Store submission; none are required.

## App Store 4.2 Gate

Block or redesign the app when it is only a bookmark, content mirror, or
unmodified website. Add native value before release:

- iOS-native onboarding, empty states, errors, offline, and retry.
- Native settings with support, privacy, terms, account deletion, restore, and
  notification controls where applicable.
- Universal links or deep links.
- Share sheet, widgets, push notifications, camera/media/file pickers, Apple
  Wallet, StoreKit, or other native capabilities only when they serve the app.
- Safe-area, keyboard, navigation, dark/light mode, and dynamic type handling.

## Conversion Flow

1. Audit the URL, responsive behavior, PWA assets, auth, payments, privacy,
   support, route depth, and mobile performance.
2. Pick the conversion strategy and write a `SITE_TO_IOS_PLAN.md`.
3. Scaffold or adapt the project using the repo's package manager and iOS
   project conventions.
4. Configure bundle ID, display name, app icon, launch screen, associated
   domains, Info.plist usage strings, and entitlements.
5. Implement native value and failure states before visual polish.
6. Run web build and `cap sync ios` for Capacitor shells.
7. Test on simulator or device across first launch, auth, deep links, tabs,
   keyboard, payments, offline, backgrounding, and account flows.
8. Produce App Store screenshots, metadata, privacy answers, and review notes.
9. Run the ship gate. Do not submit unless the user explicitly delegates public
   release and confirms the exact app, bundle ID, version, build, and account.

## Completion Bar

Do not call the app release-ready until:

- the iOS project builds on a named simulator, device, or CI target,
- every native plugin and entitlement is justified by actual behavior,
- the web route or bundle strategy is documented,
- the App Store 4.2 risk has a mitigation,
- screenshots and metadata match implemented features,
- privacy answers match the actual SDKs, cookies, analytics, and account flows,
- no secrets, signing material, or private account identifiers are committed.
