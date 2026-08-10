# Chapter 10. Shipping Into the Real World

The last mile is where builders stall, and it is almost never for lack of
skill. It stalls because the last mile is the first place your assumptions meet
an institution that does not care about them. A compiler tells you immediately.
App Review tells you in four days. Google Play tells you after the staged
rollout has already reached 5% of users. The feedback loop stretches from
seconds to days, and every unverified assumption you carried through the build
gets billed at the new exchange rate.

You can feel this the first time you wrap a website in a shell and submit it.
The build works. The app runs. Rejection arrives citing guideline 4.2, minimum
functionality, and now you are two weeks out from a launch date because the
thing you shipped was a bookmark with an icon.

## The wrapper gate

`site-to-ios-app` puts that failure at the front instead of the end. Its
principle is stated before any command: turn a site into an iOS app only when
the app has native value, stable iOS behavior, and a release surface that is
truthful. A raw web page in a frame is not enough for an App Store-quality
product.

The workflow begins with an artifact, not a scaffold. You write
`SITE_TO_IOS_AUDIT.md` capturing the site URL, target user, primary routes,
login requirements, iPhone responsive behavior, PWA signals,
legal/support/account-deletion links, payments and sensitive flows, session
behavior, mobile performance risks, native value opportunities, and the 4.2
wrapper risk. Only then `SITE_TO_IOS_PLAN.md`, with the chosen strategy, the
native value to add before release, scaffold and build commands, bundle ID and
signing notes, QA matrix, screenshots and metadata and privacy work, blockers,
and the explicit release gate.

The strategy decision is four options and a requirement to write down why.
Capacitor remote shell keeps the live site as the product surface, so web
deploys update most behavior. Capacitor bundled shell packages static assets
into the binary, which means updates need an App Store release unless paired
with live APIs. A native SwiftUI shell wraps a web view in real navigation,
settings, auth, push, share, and error surfaces. Full native rebuild is for
sites that are mostly content, have weak mobile UX, or carry high wrapper
rejection risk.

The 4.2 gate itself is the honest part. Block or redesign the app when it is
only a bookmark, content mirror, or unmodified website. The remedies are
specific: iOS-native onboarding, empty states, errors, offline, and retry.
Native settings with support, privacy, terms, account deletion, restore, and
notification controls. Universal links. Share sheet, widgets, push, media
pickers, StoreKit, but only when they serve the app. Safe-area, keyboard,
navigation, dark and light mode, and dynamic type handling.

Then a completion bar that does not let you round up. The project builds on a
named simulator, device, or CI target. Every plugin and entitlement is
justified by actual behavior. The 4.2 risk has a mitigation. Screenshots and
metadata match implemented features. Privacy answers match the actual SDKs,
cookies, analytics, and account flows. No secrets or signing material are
committed. Submission itself requires the user to explicitly delegate public
release and confirm the exact app, bundle ID, version, build, and account.

## The Android version of the same lesson

`android-app-factory` runs the same discipline against a platform with more
moving policy. Its principle: build the product, policy evidence, and Play
listing together, because a successful release is an installable app whose
claims, disclosures, entitlements, privacy behavior, and store configuration
agree with each other.

It refuses to answer policy from memory. Every release-oriented run identifies
the repo, application ID, branch, Play app, target track, and whether the
checkout is dirty, reads a dated policy baseline, then re-opens the linked
official Google sources for anything submission-sensitive and records the URL,
observed requirement, and check time. The baseline is treated as a baseline,
not as permanent law. The skill even states its own dates carefully: as of
2026-07-19 the default is `compileSdk` and `targetSdk` 36, with Play's
announced enforcement for new apps and updates moving to API 36 on 2026-08-31
and API 35 enforced until then, plus an instruction not to misstate an
announced deadline as an enforced one.

The pipeline is ten phases. Validate the product. Verify policy. Design
architecture and risk with the smallest maintainable shape that preserves
unidirectional state, lifecycle safety, offline and error and loading states,
and test seams. Scaffold native Kotlin and Jetpack Compose by default,
resolving current stable versions from official sources into a version catalog,
and prove a debug build before feature work. Build one complete core loop. Prove
quality across unit, repository, ViewModel, Compose UI, accessibility, and
end-to-end tests, plus static analysis, release build, device and API matrix,
baseline profile, and Macrobenchmark. Add Play Billing for covered digital
goods, processing pending purchases, verifying and acknowledging after
entitlement handling, restoring ownership, and keeping server verification off
the device. Complete trust surfaces: privacy policy, Data Safety, permission
rationale, in-app and web account deletion when accounts exist, content rating,
ads declarations, app access instructions. Build store artifacts. Release
through evidence gates.

The release gate is a template you copy into the app repo and complete with
links or command output. It blocks on a list that reads like a catalog of
things people assume: policy not checked live, a build targeting the wrong API,
an Android 15+ release not verified for 16 KB page-size compatibility including
transitive native SDKs, failing tests or lint or `bundleRelease`, a core loop
that fails on the declared matrix or offline path, launch-critical
accessibility failures under TalkBack or large text, missing performance
evidence, disagreement between Data Safety and actual behavior, unproven
billing restore or acknowledgement, committed secrets, listing screenshots
showing behavior the release build does not have, or a rollout without explicit
user confirmation.

One line in there is the whole chapter compressed: a caveat must have an owner,
a risk, and a next action, and policy, security, privacy, billing, crash, and
core-task blockers cannot be downgraded to cosmetic caveats. That is the
sentence that stops a release checklist from becoming a formality.

## Packaging is an artifact

`suede-launch-packaging` handles the surface between finished work and a
stranger. Its core principle: a release nobody can install is not a launch.
Nothing is live until you fetched it yourself, and no install path ships until
the exact command ran from a clean temporary directory.

That second clause is the one that catches people. Your install command works
because your local checkout has files you never pushed. The skill's failure
table names it directly: "works locally, fails for a public user" usually means
the command references a local plugin alias, and "install command 404s" usually
means the skill folder was never pushed to `main`. The fix is not to read the
command more carefully. It is to run it somewhere that has none of your
context.

The skill starts with an inventory, because one launch is usually several
surfaces. A skill launch is a repo plus a README plus an install command plus
social copy, and each row needs its own proof artifact: repo URL and commit
hash, live URL and screenshot, install command transcript, MCP `tools/list`
output, live route readback, link sweep results. Its hard gates are ordering
rules. No launch copy until the live surface is verified. No install doc until
the command ran from a clean temp dir after pushing. Ship gate set before any
announcement, including a soft one.

## The lane that proves the point

The sharpest example in the pack does not touch a repo at all.

`amazon-returns-recovery` started as a test of a general-purpose
contract-negotiation procedure. The question was whether the discipline held up
in a dispute. Pointed at a live Amazon account, it surfaced two restocking fees
of $44.99 and $28.50 on returns processed weeks earlier, charges the account
owner did not know existed. Both were waived in one sitting. The first refunded
exactly $44.99, the second came back at $30.63 because the associate rounded up
past the fee. Then a third case outside the skill's default scope: a $372.69
electric shaver on which a refund had already been denied once, while still
inside the return window. Re-disputed two days after the window closed, it
ended in a full $372.69 refund with no return required. Total across the
documented cases: $448.31.

Notice what carried over. Not domain knowledge about Amazon. The procedure
knew nothing about restocking fees before it went looking. What carried over
was the shape: read the evidence first, itemize before arguing, build the case
from facts you can point at, ask for one specific outcome, confirm the result
in writing. That is the same shape as a code review, a release gate, and an SEO
audit. A procedure that works outside its home domain is evidence that the
procedure, not the domain knowledge, was doing the work.

`subscription-recovery` is the generalization, pointed at App Store, Google
Play, PayPal, bank statements, and direct-bill services. It exists because
somebody noticed the discipline had nothing to do with Amazon.

## Safety, stated plainly

Both recovery skills draw the same line, and it is worth reading as written
rather than paraphrased. Read-only discovery first. Report the findings as a
plain list. Stop. Do not open the dispute chat yet. Confirmation before any
cancellation or refund contact, one item at a time. The skill describes itself
as a metal detector, not an autopilot.

Truthfulness is a hard constraint, not a preference. State only true facts:
order number, item, price, fee amount. Do not invent a prior contact attempt or
a return reason that did not happen, because the ask is reasonable on its own
and does not need embellishment to land. Accept one polite counteroffer round
at most, then report back rather than escalating with anything untrue. Some
fees are legitimate, some subscriptions are still wanted, and the skill
instructs you to say so when a finding looks earned rather than mistaken.

Credentials are never handled. The stretch goal for automated statement parsing
is explicitly deferred because no validated path exists that avoids touching
credentials, which conflicts with the skill's own rules. A capability was left
unbuilt rather than built unsafely, and that decision is written down in the
skill where the next person will read it.

## The reframe

Shipping is not the phase after building. It is a separate skill with its own
gates, its own evidence requirements, and its own failure modes, and you get
better at it the same way you got better at everything else: by doing it
enough times that the checklist stops surprising you. The builders who stall at
the last mile are not worse engineers. They have just practiced the first mile
a thousand times and the last mile twice.

### The move

Take the thing you shipped most recently and run its install command from a
fresh temporary directory on a machine that has never seen the project. Whatever
breaks is what your users have been hitting.
