# Android Factory Pipeline

## Phase Map

| Phase | Goal | Output |
| --- | --- | --- |
| Keyword | Pick a winnable search phrase | `aso/keywords.md` |
| Scaffold | Generate or adapt the native app | Gradle project (Kotlin + Compose) |
| Core loop | Deliver one real user outcome | working feature screen |
| Monetize | Add Play Billing or choose free v1 | product checklist |
| Visuals | Icon, adaptive icon, palette, visual direction | `assets/` |
| Screens | Capture and frame Play Store screenshots + feature graphic | PNGs by form factor |
| Listing | Title, short description, full description | listing text files |
| Data Safety | Data collection/sharing disclosure, content rating | Play Console form answers |
| Grade | Implementation + listing scorecard | pass/block verdict |
| Release | Build AAB, sign, upload, roll out | release checklist |

## Human Touchpoints

Pause for the user at these points:

1. Target keyword approval.
2. Icon/visual direction approval.
3. Play Billing product setup if monetized.
4. Data Safety truth confirmation and privacy policy URL.
5. Track promotion / production rollout-percentage confirmation.

## Scaffold: Gradle + Kotlin + Compose (required pattern)

Never scaffold a bare Kotlin/JVM `main()` module for an Android app — it
produces a JAR, not an installable `.apk`/`.aab`. Use Android Studio's "Empty
Activity" (Compose) template, or a Gradle Kotlin DSL project with the Android
application plugin applied directly.

Minimum `build.gradle.kts` shape:

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.product"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.product"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }
}
```

Google Play requires `targetSdk` to track within roughly one platform version
of the current API level at submission time — this minimum moves yearly, so
check the current Play Console requirement before relying on a specific
number; an app or update below it is rejected at submission.

Verify the scaffold builds before continuing:

```bash
./gradlew assembleDebug
```

## Play Store Listing Limits

- App name (title): 30 characters.
- Short description: 80 characters.
- Full description: 4000 characters.
- There is no separate indexed "keyword field" like Apple's — Play's search
  ranking is driven by title, short description, full description, and
  install/engagement signals. Front-load the target keyword in the title or
  short description instead of stuffing a hidden field.
- Feature graphic: 1024x500 PNG/JPG, required for the store listing.
- Screenshots: 2-8 per supported form factor (phone required; 7" tablet,
  10" tablet, Wear OS, TV, or Chromebook only if the app targets that form
  factor), minimum 320px and maximum 3840px per side, aspect ratio between
  16:9 and 9:16.

## Signing and Release

- Enroll in Play App Signing (the default for new apps created in Play
  Console); Google holds the app signing key, you keep an upload key.
- Generate and keep the upload keystore outside the repo; never commit
  `*.jks`/`*.keystore` files or their passwords.
- The release artifact must be an Android App Bundle (`.aab`), not a raw
  `.apk` — Play Console requires AAB for new apps.

```bash
./gradlew bundleRelease
```

- Upload via the Play Console UI, `fastlane supply`, or the Google Play
  Developer API using a service-account JSON key kept in an env var or a
  local, gitignored file — never committed.
- Roll out through Internal testing -> Closed testing -> Open testing ->
  Production, with a staged rollout percentage on production before 100%.

## Ship Gate

Block release when any of these are true:

- build fails or the app crashes in the core flow,
- listing text exceeds Play Store character limits,
- screenshot set is missing a required form factor,
- Data Safety answers do not match actual SDK/data behavior,
- content rating questionnaire is incomplete or inconsistent with actual
  content,
- app claims features that are not implemented,
- keystore, keystore password, or service-account key are committed,
- public submission or production rollout lacks explicit user confirmation.
