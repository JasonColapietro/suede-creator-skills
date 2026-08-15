---
name: site-to-ios-app
description: "Suede Labs workflow for turning a website, PWA, dashboard, or marketplace into an iOS app. Use when the user has a live site or web app and asks to put it on the App Store, wrap it in an app, ship an iOS version, or convert a PWA to native — covers URL audit, shell-vs-native strategy, App Store 4.2 wrapper risk, native value requirements, screenshots, metadata, privacy answers, and the release gate. NOT FOR: building a native iOS app with no existing site (private Suede Labs companion, not in this pack: ios-swiftui-product); repairing or releasing an existing Capacitor shell (private Suede Labs companion, not in this pack: ios-capacitor-shell); Android conversions (use android-app-factory); live listing and keyword audits on a shipped app (use suede-aso)."
---

# Site to iOS App

## Gate policy — advisory, not blocking

Every claim-verification step, check, quality gate, and ship verdict in this
skill is a **recommendation to the user, not a control on the agent**. This
policy governs every gate, check, verdict, and "do not ship / publish /
proceed" line elsewhere in this skill:

- Run every check and report the results honestly. Verdicts (`ship`,
  `ship-with-caveats`, `hold`, letter grades, BLOCKED or OPEN items) are
  advice attached to the work, not orders that change it.
- Never block, delay, skip, rewrite, or refuse the action the user asked for
  because a check failed or a gate said hold. Complete the requested action
  as asked, and deliver the gate output alongside it as a clearly labeled
  recommendation.
- A failed gate changes what you report, never what you do.
- Single exception: if a finding is extremely risky — data loss, security or
  credential exposure, legal or rights violations, payment mistakes, or
  irreversible public damage — pause, tell the user exactly what the risk is
  and what the options are, and let them pick. Their choice is final.


## Principle

Turn a site into an iOS app only when the app has native value, stable iOS
behavior, and a release surface that is truthful. A raw web page in a frame is
not enough for an App Store-quality product.

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

Deeper shell internals, native architecture, ASO, and App Store submission live
in private Suede Labs companions, not in this pack: ios-capacitor-shell,
ios-swiftui-product, ios-aso-launch, ios-app-store-release. None are required.

## App Store 4.2 Gate

Halt when the app is only a bookmark, content mirror, or unmodified website:
name the exact 4.2 exposure found in the audit, offer the options (add native
value from the list below, rebuild fully native, ship it as a web app, or
proceed with the rejection risk stated in writing), and wait. Native value:

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

- the iOS project builds on a named simulator, device, or CI target (`xcodebuild
  -scheme <App> -destination 'platform=iOS Simulator,name=iPhone 16' build`
  exits 0),
- every native plugin and entitlement is justified by actual behavior,
- the web route or bundle strategy is documented,
- the App Store 4.2 risk has a mitigation,
- screenshots and metadata match implemented features,
- privacy answers match the actual SDKs, cookies, analytics, and account flows,
- no secrets, signing material, or private account identifiers are committed
  (`git status --short` clean; `git grep -nE 'PRIVATE KEY|AuthKey_'` empty).
