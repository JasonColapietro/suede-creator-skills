---
name: android-app-factory
description: "Use when planning, creating, or orchestrating a complete Android app-development workflow from a one-line idea or target keyword through Play Store submission — the entry point for any 'build/ship/submit an Android app' request. Covers keyword-first product selection, native Kotlin/Jetpack Compose scaffolding via Gradle, Play Billing monetization, Play Store screenshots and ASO listing copy, Data Safety and content-rating disclosure, signing and release through Google Play Console or Fastlane supply, and ship-gate discipline. NOT FOR: iOS work (use site-to-ios-app); reviewing or grading an existing app's code instead of building a new one (use suede-code-review)."
---

# Android App Factory

## Principle

Build the app and its Play Store listing together. A useful app nobody can
find fails; a great listing on a broken app also fails. Treat implementation
and store listing as equal halves of the product.

## Default Pipeline

1. Choose a winnable target keyword before building.
2. Scaffold native Kotlin + Jetpack Compose unless the user explicitly asks
   for a wrapper (Trusted Web Activity or Capacitor).
3. Build the core loop: input, processing, structured result, history, saved
   set.
4. Add monetization (Play Billing) only when it does not block the v1 review
   flow.
5. Produce Play Store screenshots, feature graphic, and listing copy as
   first-class artifacts.
6. Complete the Data Safety form and content rating questionnaire truthfully.
7. Run the ship gate: build, listing, screenshots, signing, secrets, feature
   truth.
8. Release only after explicit user confirmation, starting on internal or
   closed testing before any production rollout.

Read `references/android-factory-pipeline.md` for the detailed phase map,
Gradle scaffold shape, Play Store listing limits, and signing/release steps.

## Public-Safe Defaults

- Use placeholder application IDs like `com.example.product`.
- Use environment variables or a local, gitignored service-account JSON key
  for Play Console API access.
- Do not include upload keystores, keystore passwords, real package names tied
  to a live production app, or Play Console account IDs in outputs.
- For first versions, prefer a free v1 if Play Billing setup would delay
  validation.

## Routing

Android does not yet have a split sibling family the way some platforms do —
this skill stays self-contained across scaffolding, ASO, screenshots, and
release until real usage volume justifies splitting it into focused
specialists the same way. For the iOS counterpart that wraps an existing site
instead of building a new app, use `site-to-ios-app`. For reviewing an
existing Android codebase's quality instead of building a new one, use
`suede-code-review`. For a CI gate around this repo's builds, use
`suede-ship-gate`.

## Completion Bar

Do not call an app ship-ready until:

- the app builds via `./gradlew assembleRelease` / `bundleRelease` on a named
  device, emulator, or CI target,
- the core flow works with real or deterministic demo data,
- the Play Store listing passes title/short-description/full-description
  character limits,
- screenshots exist for phone and any declared tablet/Wear/TV form factor,
- the Data Safety form and content rating match actual SDK and data behavior,
- the release is signed through Play App Signing (or a real upload key) and
  no keystore, keystore password, or service-account key is committed,
- the user has explicitly confirmed any outward submission action (track
  promotion, production rollout percentage).
