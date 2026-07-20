# Google Play Policy Baseline

Verified against official Google sources on **2026-07-19**. This file is a
dated starting point, not a substitute for a release-day check. Record the live
result and timestamp in the release-gate artifact.

## Target API Timeline

General phone/tablet apps:

| Date | New app and update submission requirement | Factory action |
| --- | --- | --- |
| Through 2026-08-30 | API 35 or higher | Build and migration-test with API 36 now |
| Starting 2026-08-31 | Android 16 / API 36 or higher | `compileSdk = 36`, `targetSdk = 36` or later verified level |

Google's announced 2026 form-factor exceptions are:

- Wear OS and Android Automotive OS: API 35 or higher for new apps/updates;
- Android TV and Android XR: API 34 or higher for new apps/updates.

Existing-app availability and any extension use have separate rules. The
official page says eligible developers can request an extension to
2026-11-01. Do not assume the extension exists or applies; inspect the specific
app in Play Console.

Factory default on 2026-07-19: use API 36 for a general new app or update so the
release does not immediately age into the announced deadline. Before raising
`targetSdk`, review and test Android 16 behavior changes; changing the integer
without migration testing is not compliance.

Primary source:
<https://developer.android.com/google/play/requirements/target-sdk>

## Policy and Console Checks

Complete for the exact release build:

- target API and any form-factor exception;
- 16 KB memory page-size compatibility for 64-bit devices when targeting
  Android 15+; inspect direct and transitive native libraries and test the
  release in a 16 KB environment;
- developer identity verification and package registration status in Play
  Console, especially before the announced September 2026 regional rollout;
- app category, target audience, Families applicability, ads, and content
  rating;
- restricted permissions and declaration forms;
- app access/reviewer credentials for gated functionality;
- privacy policy and Data Safety answers;
- account deletion when an app account can be created in-app or through an
  out-of-app flow initiated by the app;
- payments policy and Play Billing applicability;
- health, financial, VPN, accessibility service, background location, media,
  generative-AI, news, or other category-specific rules when applicable;
- SDK policy status using the Google Play SDK Index and the actual release
  dependency graph;
- Play Console policy status, pre-launch report, device catalog exclusions,
  and unresolved review notices.

Do not infer a Console answer from source alone. Installed SDK configuration,
remote flags, backend flows, WebViews, and the Play listing can change the
answer.

## 16 KB Page-Size Baseline

Google's requirement applies to new apps and updates targeting Android 15+
submitted to Play: the release must support 16 KB page sizes on 64-bit devices.
Pure Java/Kotlin code is compatible by default, but an app can inherit native
code through an SDK. Inspect the final artifact, rebuild/update incompatible
native libraries, run Android Studio/lint alignment checks, and test in a 16 KB
environment. Confirm Play Console's release detail rather than relying only on
the source tree.

Primary source:
<https://developer.android.com/guide/practices/page-sizes>

## Developer Verification Baseline

Android's announced developer-verification rollout begins in select regions in
September 2026 for participating stores and certified devices. Google says most
Play apps are automatically registered, but developers should check Play
Console for any remaining package registration. Record the live account and
package state; never collect identity documents or private signing material in
the project artifact.

Primary source: <https://developer.android.com/developer-verification>

## Data Safety Baseline

Inventory first-party code, libraries/SDKs, and app-controlled WebViews. Google
defines off-device transmission by included libraries/SDKs as collection even
when the data goes directly to a third party. Locally processed data can be out
of scope for Data Safety, but it can still be sensitive and must be secured.

For every data type, record:

- collection and sharing status;
- required versus optional;
- purpose;
- ephemeral processing, retention, deletion, and user controls;
- transport encryption and any end-to-end-encryption claim;
- SDK/service-provider role and contract;
- evidence from runtime traffic, configuration, vendor documentation, and code.

Primary source:
<https://support.google.com/googleplay/android-developer/answer/10787469>

## Account Deletion Baseline

If the app offers account creation anywhere in its experience, provide:

1. an in-app path to initiate deletion, which may link to a deletion web
   resource; and
2. a functional web deletion resource declared in Play Console that works for
   users who no longer have the app.

Deletion covers the account and associated user data, including relevant data
held by service providers. Document narrowly required retention, reason, and
duration. The web resource must not force the user to reinstall the app.

Primary source:
<https://support.google.com/googleplay/android-developer/answer/13327111>

## Billing Baseline

For Play-distributed apps selling covered digital goods or subscriptions, use
the current required Play Billing path. Resolve the current Billing Library
version and deprecation deadline live; do not freeze a version number in this
skill.

Release evidence must cover:

- product/base-plan/offer IDs and environment;
- purchase connection and reconnect behavior;
- pending purchases and transition from `PENDING` to `PURCHASED`;
- purchase-token verification and entitlement idempotency;
- acknowledgement/consumption only in the correct state;
- restore/requery behavior across reinstall/device changes;
- cancellation, expiry, grace, hold, pause, refund, and revocation as relevant;
- Real-time Developer Notifications and Developer API reconciliation for a
  server-backed entitlement system;
- license testers and Play test tracks, not only local mocks.

Google's integration guidance says not to acknowledge a purchase in `PENDING`;
acknowledge after it becomes `PURCHASED`. Prefer secure-backend verification and
acknowledgement when a backend exists.

Primary source:
<https://developer.android.com/google/play/billing/integrate>

## Release-Day Verification Receipt

```text
checked_at_utc:
checker:
package_id:
play_app:
track:
release_version_code:
target_api_source_url:
observed_target_requirement:
build_compile_sdk:
build_target_sdk:
form_factor_exception:
supports_16kb_page_sizes_evidence:
developer_verification_and_package_registration:
data_safety_source_url:
account_deletion_source_url:
billing_source_url_and_library_status:
other_policy_urls:
play_console_status_and_evidence:
caveats:
```

If an official source and this baseline differ, follow the current official
source and update the copied project gate. Do not quietly rewrite history in a
completed release record.
