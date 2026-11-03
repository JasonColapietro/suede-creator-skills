# What is the best Claude Code skill stack for building a mobile app?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** to make Claude Code a working AI app builder for Expo, iOS and Android, install [expo-module](https://skills.suedeai.ai/directory/expo/skills/expo-module/) (87/100) to write native Swift and Kotlin modules, [eas-simulator](https://skills.suedeai.ai/directory/expo/skills/eas-simulator/) (85/100) to run the app on a cloud simulator when your machine has none, and [eas-update-insights](https://skills.suedeai.ai/directory/expo/skills/eas-update-insights/) (85/100) to check crash rates after an over-the-air update. Add apollo-ios for GraphQL in Swift, firebase-remote-config-basics for feature flags, and [aso](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/aso/) (90/100, the top score here) to audit the store listing once the app ships.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [aso](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/aso/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 90/100 | Audits and optimizes App Store and Google Play listings to improve app visibility and store ranking. |
| [expo-module](https://skills.suedeai.ai/directory/expo/skills/expo-module/) | [expo/skills](https://github.com/expo/skills) | 87/100 | Guides creating Expo native modules and views in Swift, Kotlin and TypeScript, covering the module definition DSL, shared objects, config plugins and autolinking. |
| [apollo-ios](https://skills.suedeai.ai/directory/apollographql/skills/apollo-ios/) | [apollographql/skills](https://github.com/apollographql/skills) | 86/100 | Guides building Apple-platform apps with Apollo iOS, covering project setup, code generation, ApolloClient configuration, GraphQL operations from SwiftUI, and tests with generated mocks. |
| [firebase-remote-config-basics](https://skills.suedeai.ai/directory/firebase/skills/firebase-remote-config-basics/) | [firebase/skills](https://github.com/firebase/skills) | 86/100 | Manages Firebase Remote Config templates, feature flags, loading strategies, version history, in-app defaults, real-time listeners and SDK setup for Android and iOS. |
| [eas-update-insights](https://skills.suedeai.ai/directory/expo/skills/eas-update-insights/) | [expo/skills](https://github.com/expo/skills) | 85/100 | Checks the health of published EAS Updates, including crash rates, launch counts, unique users, payload size, and embedded versus OTA users per channel. |
| [eas-simulator](https://skills.suedeai.ai/directory/expo/skills/eas-simulator/) | [expo/skills](https://github.com/expo/skills) | 85/100 | Runs and controls an app on a remote iOS or Android simulator hosted on EAS cloud, for machines that cannot run a simulator locally. |

## Who this stack is for

This stack is for developers who already have, or are about to start, a real mobile codebase and want an agent that knows the platform. A React Native developer on Expo who needs one native Swift or Kotlin module. A solo founder on Linux or Windows who cannot run the iOS Simulator locally. A team shipping over-the-air updates that wants to know whether the last one raised the crash rate. An iOS developer wiring a GraphQL API into SwiftUI.

It is not a no-code tool. These skills make Claude Code, Codex or Cursor better at mobile work you direct: writing modules, running builds on a remote simulator, reading update health, managing flags and fixing the store listing. Five of the six come from the platform owners' own repositories: expo/skills, apollographql/skills and firebase/skills.

All six are in the [Agent Skills](https://agentskills.io/) format, so the same folders work in Claude Code, Codex and Cursor. If your question is how to build a Claude Code iOS app or a Claude Code React Native app, this is the toolkit I would start from.

## The Suede AI skill built for this job

I built [suede-aso](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-aso) for exactly this job: getting an app's store listing right before launch day, from evidence instead of guesswork. It prepares the prelaunch keyword, title, subtitle, description and screenshot fields from the app itself and from console evidence. When the request is "improve our App Store listing", this is the skill that takes it.

Start with it once the app runs and before you submit. The third-party [aso](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/aso/) pick below audits a listing that already exists from its store URL; suede-aso fills the fields before there is a URL to audit. Run them in that order and the listing is built from evidence, then scored once it is live.

It makes the build stack work harder. [expo-module](https://skills.suedeai.ai/directory/expo/skills/expo-module/), [eas-simulator](https://skills.suedeai.ai/directory/expo/skills/eas-simulator/) and [firebase-remote-config-basics](https://skills.suedeai.ai/directory/firebase/skills/firebase-remote-config-basics/) produce the features and screens; this skill turns them into the words and screenshots a store visitor sees first. It stays in its lane: app builds, release rollout, paid assets and install instrumentation belong to other skills.

It is my company's skill, so it stays out of the ranking. Install it before your first submission.

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-aso
```

## The skills, one by one

### aso: audit and fix an App Store or Google Play listing

[aso](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/aso/) audits and optimizes App Store and Google Play listings to improve visibility and store ranking. It fires on requests like "ASO audit", "optimize my app listing", "why aren't people downloading my app" and "compare my app to competitors", and whenever you share a store URL.

The SKILL.md is a scored audit. Phase 1 detects the store from the URL, fetches the listing and assesses the visual assets. Phase 1.5 assesses brand maturity in tiers that change how the listing is scored. Phase 2 scores each dimension with stated weights, Phase 3 is an optional competitor comparison, and Phase 4 writes the report. Its references hold Apple and Google Play specs, benchmarks, scoring criteria and a report template. There are no bundled scripts, and the file summary lists no credentials.

It is MIT licensed, scores 90/100, the top score in this stack, and has about 79,000 installs recorded by skills.sh. Reach for it after launch, when there is a live listing to audit. It does not build anything in the app.

A typical request.

```text
Audit this App Store listing and score each dimension. Then compare it with
the top two competitors and list the five changes worth making first.
```

### expo-module: native Swift and Kotlin for React Native

[expo-module](https://skills.suedeai.ai/directory/expo/skills/expo-module/), from Expo's own repository, guides creating Expo native modules and views with the Expo Modules API in Swift, Kotlin and TypeScript. It covers the module definition DSL, native views, shared objects, config plugins, lifecycle hooks, autolinking and the type system.

The SKILL.md has a quick start, a recommended workflow, practical scaffolding rules, core file shapes and a module structure reference for `expo-module.config.json`. Its references go deeper on config plugins, lifecycle, native modules and native views, and it closes with a section on submitting feedback. There are no bundled scripts; the files run `npx` commands. Read the scaffolding rules and core file shapes before the first prompt, so you know what layout to expect in review.

It is MIT licensed, scores 87/100 and has about 47,000 installs recorded by skills.sh. Use it when a React Native app needs something JavaScript cannot reach: a device API, a native SDK, a custom view. Do not use it to migrate an existing Swift module from the definition DSL to the Expo Modules API 2.0 macros; its own description points to expo-migrate-module for that.

A module request.

```text
Create an Expo native module that reads the device's battery temperature,
with a Swift implementation, a Kotlin implementation and TypeScript types.
```

### apollo-ios: GraphQL data for a Claude Code iOS app

[apollo-ios](https://skills.suedeai.ai/directory/apollographql/skills/apollo-ios/), from Apollo's repository, guides building Apple-platform apps with Apollo iOS, the strongly typed GraphQL client for Swift. Its description lists five jobs: adding Apollo iOS through Swift Package Manager or an Xcode project, configuring `apollo-codegen-config.json` and running code generation, configuring an `ApolloClient` with auth, interceptors and caching, writing queries, mutations and subscriptions from SwiftUI views, and testing against generated operation mocks.

The SKILL.md opens with a section on untrusted content, then process, reference files, scripts and key rules. It bundles one shell script, `list-apollo-ios-versions.sh`, and references on caching, codegen, custom scalars, interceptors, operations, setup, subscriptions and testing. The file summary shows it uses an MCP tool named xcode. I like that untrusted content is the first section: an agent reading schemas and server responses should treat them as data, not instructions.

It is MIT licensed, scores 86/100 and has about 1,000 installs recorded by skills.sh. Reach for it in a native Swift app with a GraphQL backend. Skip it for a REST API or a React Native app.

A setup request.

```text
Add Apollo iOS to this Xcode project with Swift Package Manager, configure
codegen for schema.graphqls, and write a SwiftUI view that runs GetProfile.
```

### firebase-remote-config-basics: feature flags and remote defaults

[firebase-remote-config-basics](https://skills.suedeai.ai/directory/firebase/skills/firebase-remote-config-basics/), from Firebase's repository, manages Remote Config templates, feature flags, loading strategies and the Android and iOS SDKs. It covers downloading and deploying `remoteconfig` JSON templates, version history, in-app defaults, `fetchAndActivate()`, real-time listeners and SDK setup. It is not for Hosting, Auth, Firestore, Data Connect, Crashlytics or App Hosting.

The SKILL.md covers prerequisites, troubleshooting (including npx 403 Forbidden errors and project context issues), SDK setup, fetching strategies and template management through the CLI. There are no bundled scripts; the files run `npx`, and the references hold separate Android and iOS setup notes. The 403 and project context sections save a round of guessing when the CLI refuses to run.

It is Apache-2.0 and scores 86/100; skills.sh publishes no install count for it. Use it when you want to change app behavior without a store release: turn a feature on for a segment, change a default, roll back a flag. Skip it if your project does not use Firebase.

A flag request.

```text
Download the current Remote Config template, add a boolean flag
new_checkout defaulting to false, set in-app defaults and deploy it.
```

### eas-update-insights: is the last update healthy

[eas-update-insights](https://skills.suedeai.ai/directory/expo/skills/eas-update-insights/) checks the health of a published EAS Update: crash rates, install and launch counts, unique users, payload size, and the split between embedded and over-the-air users per channel. Its description names the moments to use it: asking how an update is performing, whether a rollout is healthy, how many users are on the embedded build, or gating CI on update health.

The SKILL.md is command-first: discovering IDs, then `eas update:insights`, `eas update:view --insights` and `eas channel:insights`, each with flags, JSON output shape and errors, and a section of common workflows. There are no bundled scripts; the references document the JSON schemas. The embedded versus OTA split is the number I read first, because it shows how many users are still on the code that shipped inside the binary.

It is MIT licensed, scores 85/100 and has about 38,000 installs recorded by skills.sh. The CI gate is the use I would set up first, so an unhealthy update fails a check instead of passing quietly.

A health check.

```text
Show insights for the latest update group on the production channel. Compare
crash rate and launches with the previous group and flag any regression.
```

### eas-simulator: a cloud iOS or Android simulator for the agent

[eas-simulator](https://skills.suedeai.ai/directory/expo/skills/eas-simulator/) runs and controls your app on a remote iOS or Android simulator hosted on EAS cloud. Its description warns that the `eas simulator` commands are an experimental API, so the agent should read the skill before running them. It is the default on a host without a simulator (Linux, CI, a cloud sandbox), and on macOS it should fire only for a remote or shareable simulator, an iOS version you lack, or an agent-driven session.

The SKILL.md starts with "cloud vs local: decide this first", then prerequisites, session lifetime, the core loop, naming sessions, driving the device with agent-device, reading iOS device logs and crash reports, and stopping and cleaning up. The cleanup section matters: a cloud session left running is a session nobody is watching. It documents an `EXPO_TOKEN` and runs `npx`.

It is MIT licensed, scores 85/100 and has about 22,000 installs recorded by skills.sh. It is not for local simulators, EAS Build or Update, web previews or physical devices.

A test-drive request.

```text
Start a named EAS simulator session on iOS, install my dev build, tap
through onboarding and screenshot each screen. Stop the session after.
```

## How to use the stack together

1. Scaffold any native code with [**expo-module**](https://skills.suedeai.ai/directory/expo/skills/expo-module/). Write the Swift and Kotlin sides together, with TypeScript types, so both platforms stay in step.
2. On a native Swift app with a GraphQL backend, wire the data layer with [**apollo-ios**](https://skills.suedeai.ai/directory/apollographql/skills/apollo-ios/). Generate code from the schema and test against the generated mocks.
3. Put risky features behind flags with [**firebase-remote-config-basics**](https://skills.suedeai.ai/directory/firebase/skills/firebase-remote-config-basics/). Set in-app defaults first, so the app behaves when the fetch fails.
4. Run the app with [**eas-simulator**](https://skills.suedeai.ai/directory/expo/skills/eas-simulator/) when your machine cannot run the platform's simulator. Name the session and stop it when you are done.
5. After each over-the-air update, read [**eas-update-insights**](https://skills.suedeai.ai/directory/expo/skills/eas-update-insights/) for crash rate and launches per channel. Gate CI on it once the numbers are stable.
6. Once the app is live, audit the listing with [**aso**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/aso/). Fix the highest-weighted dimension first and rerun the audit after the change ships.

## Install the stack

```bash
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/aso
npx skills add https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-module
npx skills add https://github.com/apollographql/skills/tree/main/skills/apollo-ios
npx skills add https://github.com/firebase/skills/tree/main/skills/firebase-remote-config-basics
npx skills add https://github.com/expo/skills/tree/main/plugins/expo/skills/eas-update-insights
npx skills add https://github.com/expo/skills/tree/main/plugins/expo/skills/eas-simulator
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [expo-migrate-module](https://skills.suedeai.ai/directory/expo/skills/expo-migrate-module/) | [expo/skills](https://github.com/expo/skills) | 87/100 | You are moving an existing Swift module from the 1.0 definition DSL to the 2.0 macro API, not writing a new one. |
| [eas-app-stores](https://skills.suedeai.ai/directory/expo/skills/eas-app-stores/) | [expo/skills](https://github.com/expo/skills) | 83/100 | You need to build and submit to TestFlight, the App Store or Google Play, with eas.json, signing and build numbers. |
| [eas-update](https://skills.suedeai.ai/directory/expo/skills/#eas-update) | [expo/skills](https://github.com/expo/skills) | 86/100 | You are setting up over-the-air updates, or a build still shows old code after an update. |
| [expo-brownfield](https://skills.suedeai.ai/directory/expo/skills/expo-brownfield/) | [expo/skills](https://github.com/expo/skills) | 83/100 | You are adding React Native screens to an existing native SwiftUI, UIKit or Kotlin app. |
| [expo-examples](https://skills.suedeai.ai/directory/expo/skills/expo-examples/) | [expo/skills](https://github.com/expo/skills) | 85/100 | You want a version-matched pattern from about 70 official with-* examples, such as Stripe, Clerk or Supabase. |
| [detox-skill](https://skills.suedeai.ai/directory/lambdatest/agent-skills/detox-skill/) | [LambdaTest/agent-skills](https://github.com/LambdaTest/agent-skills) | 84/100 | You need Detox end-to-end tests for a React Native app, locally or on the TestMu AI cloud. |

The pairs are easy to read. expo-module writes a new module; expo-migrate-module moves an old one. eas-update-insights measures updates; eas-update sets them up and debugs them. eas-simulator runs the app; eas-app-stores ships it. I would add eas-app-stores the week you first submit, since this stack has no build-and-submit pick.

## Common mistakes

- Running eas-simulator on a Mac for a plain local run. Its own description says not to; use it for remote, shareable or agent-driven sessions.
- Shipping an over-the-air update without reading its health. eas-update-insights reports crash rate and launches per channel, and it can gate CI.
- Shipping a flag without in-app defaults. firebase-remote-config-basics covers defaults and `fetchAndActivate()`, so the app behaves when the fetch fails.
- Hand-editing generated GraphQL code. apollo-ios runs code generation from `apollo-codegen-config.json`; change the operation and regenerate.
- Using expo-module for a migration. Its description routes DSL-to-macro migrations to expo-migrate-module.
- Auditing a listing before it exists. aso fetches a live store URL; run it after launch.

## Licenses, costs and checks before you install

Five of the six picks are MIT licensed; firebase-remote-config-basics is Apache-2.0. All are open licenses, but confirm the license file in each repository.

On credentials and commands, from the files: eas-simulator documents an `EXPO_TOKEN` and runs on EAS cloud, so you need an Expo account. expo-module, eas-simulator, eas-update-insights and firebase-remote-config-basics run `npx` commands. apollo-ios bundles one shell script and uses an MCP tool named xcode. aso lists no credentials or scripts. firebase-remote-config-basics needs a Firebase project.

The directory has not security scanned any listed skill; its [trust page](https://skills.suedeai.ai/directory/trust/) explains what is and is not checked. Read each SKILL.md before you enable it, and read any skill that runs commands against your cloud accounts twice.

## Related topics and stacks

The [Expo and React Native](https://skills.suedeai.ai/directory/topics/expo-react-native/) topic lists 29 skills, [iOS and Swift](https://skills.suedeai.ai/directory/topics/ios-swift/) lists 19, [Android and Kotlin](https://skills.suedeai.ai/directory/topics/android-kotlin/) lists 16, and [Supabase and Firebase](https://skills.suedeai.ai/directory/topics/supabase-firebase/) lists 22. The [Developer Tools and Frameworks](https://skills.suedeai.ai/directory/developer-tools/) category holds the rest.

Pair this with the [testing and CI stack](https://skills.suedeai.ai/directory/stacks/testing-and-ci/) for test coverage, the [UI design stack](https://skills.suedeai.ai/directory/stacks/ui-design/) for screens, and the [landing page stack](https://skills.suedeai.ai/directory/stacks/landing-page/) for the site that sends people to the store.

## FAQ

### Can Claude Code be an AI app builder for iOS and Android?

Yes, if you mean an agent that writes and runs real code. With expo-module (87/100) it writes native Swift and Kotlin modules for Expo, with eas-simulator (85/100) it runs the app on a cloud iOS or Android simulator, and with eas-update-insights (85/100) it checks update health. It is not a no-code builder; you still direct the project and review every change.

### What is the best skill stack for a Claude Code mobile app?

For an Expo or React Native app, start with expo-module, eas-simulator and eas-update-insights, all from Expo's own repository. Add apollo-ios for a native Swift app with GraphQL, firebase-remote-config-basics for feature flags, and aso (90/100, the top score here) for the store listing once the app is live.

### Can I build a Claude Code iOS app without a Mac?

You can run and test one. eas-simulator runs your app on a remote iOS simulator hosted on EAS cloud, and its description names Linux, CI and cloud sandboxes as the hosts where it is the default. It documents an `EXPO_TOKEN`, so you need an Expo account. Submitting to the App Store is a separate job; eas-app-stores covers it.

### Does this stack work for a Claude Code React Native project?

Yes. expo-module, eas-simulator and eas-update-insights target Expo, which runs React Native. For a bare native app that wants React Native screens, expo-brownfield is the alternative, and detox-skill writes Detox end-to-end tests for React Native.

### Do these skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folders work in Claude Code, Codex, Cursor and other agents that read a SKILL.md. eas-simulator even names Cursor on Linux as a case it handles, when you need an iOS device you cannot run locally.

### Are these mobile app skills free?

The skills are open source: five are MIT and firebase-remote-config-basics is Apache-2.0. The services behind them are separate. eas-simulator runs on EAS cloud and documents an `EXPO_TOKEN`, firebase-remote-config-basics needs a Firebase project, and eas-update-insights reads update data from EAS. Check each provider's terms.

### How do I install mobile app skills in Claude Code?

Run the six `npx skills add` commands from the install section above, one per skill. The skills CLI installs for Claude Code, Codex, Cursor and other agents. Then set an `EXPO_TOKEN` for eas-simulator, connect your Firebase project before using firebase-remote-config-basics, and read each SKILL.md before the first run.
