# Suede AI Skills: first-party quality and source review

Reviewed source: `016c0afd1f98cb3f6caa91419bdb569fdee38777`. Assessment: October 26, 2026. The intake and retained final scan refer to this same immutable source.

The accepted October 22 catalog had 3,804 imported skills across 160 repositories and zero first-party listings: its selector deliberately skipped the canonical repository. All 64 maintained canonical packages were absent. Their unchanged-rubric source measurements were 72–88; these were provisional measurements, not published catalog grades. The stale 21-skill Suede-AI fork is a duplicate distribution with pull-only connector access, not a second set of maintained packages. The separate unlisted ios-app-dev-skills repository is outside this canonical package scope.

The reviewed sources now produce 64 accepted first-party listings: **57 score 91 and seven score 93**, all eight checks pass. The original 3,804 external records and 160 repository metadata records remain identical. Public titles and all 64 installed UI labels use Suede AI Skills or Suede AI [product/category] Skills; machine identities and install paths remain stable.

The rubric, cutoffs, exclusions and score implementations are unchanged. Improvements include actual invocation/routing descriptions, accurate runtime compatibility in body prose, concrete worked input/output/recovery/validation examples, preserved detailed guidance in required references, and corrected unsupported SMS benchmark claims. No optional ClaimCheck or source-upload analyzer was enabled.

## Reproducible source and scoring evidence

The scoped intake reads a clean exact commit archive and compares every archived file to its retained source inventory. Ignored files cannot influence grades: a regression reproduced 88→91 at one SHA before the fix and remains 88→88 afterward. Citation receipts retain three independently fetched indexed-list revisions; local receipt validation is explicitly Git-blob integrity, not a claim of a new upstream fetch. The October 26 scoped assessment is separate from the unchanged October 22 external snapshot date.

The [intake receipt](../intake/2026-10-26-first-party.json) retains source and tool hashes, citations and matching external preservation digests. The [machine-readable matrix](../intake/first-party-2026-10-26/baseline-to-final.json) retains each baseline/final category, score and historical security flags. Reports and badges are regenerated from the accepted source-derived records.

## Security

All 558 original scan inventory hashes match baseline main. The retained original scan records report ten CRITICAL process-execution signatures across three packages and incomplete binary coverage in release-linter. Capability signatures alone did not prove shell injection. Bounded review did reproduce two separate outside-file overwrites: linked patch staging and predictable Gate shim creation. Descriptor/no-follow checks and private exclusive shim creation fix those defects; 11 new regressions and 31 workflow tests pass. Independent special-file probes also reject FIFOs and directories.

Original severities and failed/error states remain intact in [raw original records](../intake/first-party-2026-10-26/original-scan-records.json). Fresh exact-source Linux scanning completed in [verification run 40265716834](https://github.com/JasonColapietro/suede-creator-skills/actions/runs/40265716834) using PR278’s reviewed, pinned pipeline: all 634 package-file hashes match source `016c0afd`; 60 packages retain nonblocking findings, three fail and one retains incomplete binary coverage. Synthetic clean/attack checks, exact-source acquisition, two external samples and artifact retention passed. The scanner reports 16 CRITICAL process-capability signatures: the original ten plus six in the new regression-test files. All 63 overlong-description findings are eliminated. No severity, gate or exclusion was lowered. This quality change does not merge PR278 or PR281, and directory security fields remain not_scanned while the separate evidence pipeline is unmerged. The [raw final records and provenance](../intake/first-party-2026-10-26/final-source-scan/manifest.json) are retained, including artifact SHA256 `0ff02322ec16721e6f6dec55e24e85a8a6b26467fb91fc3c850734d2bdf14055`.

The raw final analysis retains **119 findings: 16 CRITICAL, 19 MEDIUM, 20 LOW and 64 INFO**. The matrix counts `analysis.findings` in each content-addressed raw record. In particular, release-linter retains **10 MEDIUM and one INFO** alongside its `error` status and incomplete binary coverage; the adapter summary omits its finding counts on that error path. An empty summary count is not evidence of zero findings.

The forward evidence correction reuses the retained exact-source scan from draft PR283 without merging its other changes. Regression checks bind all 634 raw coverage hashes to the intake, verify all 75 retained file hashes and 71 ZIP members, and reconcile every matrix row with its raw findings. The earlier `1c039ab9` scan remains in Git history; its source delta is retained in `final-source-scan/whitespace-delta.json`.

## Baseline to final

| Public skill name | Stable identity | Baseline | Final | Category |
|---|---|---:|---:|---|
| Suede AI Android App Factory Skills | `android-app-factory` | 86 | 91 | developer-tools |
| Suede AI Site to iOS App Skills | `site-to-ios-app` | 86 | 91 | developer-tools |
| Suede AI A/B Testing Skills | `suede-ab-testing` | 88 | 91 | testing-qa |
| Suede AI Ad Creative Skills | `suede-ad-creative` | 86 | 91 | marketing-seo |
| Suede AI Ads Skills | `suede-ads` | 83 | 91 | marketing-seo |
| Suede AI Agent Teams Skills | `suede-agent-teams` | 85 | 93 | ai-agents-llm |
| Suede AI Eval Skills | `suede-ai-eval` | 86 | 91 | testing-qa |
| Suede AI Answer Engine Optimization Skills | `suede-ai-seo` | 84 | 91 | ai-agents-llm |
| Suede AI Analytics Skills | `suede-analytics` | 88 | 91 | data-databases |
| Suede AI App Store Optimization Skills | `suede-aso` | 86 | 91 | marketing-seo |
| Suede AI Attribution Skills | `suede-attribution` | 83 | 91 | marketing-seo |
| Suede AI Campaign in a Box Skills | `suede-campaign-in-a-box` | 86 | 91 | marketing-seo |
| Suede AI Churn Prevention Skills | `suede-churn-prevention` | 88 | 91 | marketing-seo |
| Suede AI CI Gate Skills | `suede-ci-gate` | 86 | 91 | devops-cloud |
| Suede AI Clip to Guide Skills | `suede-clip-to-guide` | 88 | 93 | media-creative |
| Suede AI Co-Marketing Skills | `suede-co-marketing` | 86 | 91 | marketing-seo |
| Suede AI Code Skills | `suede-code` | 83 | 93 | code-review-quality |
| Suede AI Cold Email Skills | `suede-cold-email` | 88 | 91 | productivity-knowledge |
| Suede AI Community Marketing Skills | `suede-community-marketing` | 83 | 91 | marketing-seo |
| Suede AI Competitor Profiling Skills | `suede-competitor-profiling` | 88 | 91 | marketing-seo |
| Suede AI Competitor Comparison Skills | `suede-competitors` | 88 | 91 | marketing-seo |
| Suede AI Content Strategy Skills | `suede-content-strategy` | 88 | 91 | marketing-seo |
| Suede AI Copy Skills | `suede-copy` | 84 | 91 | writing-content |
| Suede AI Customer Research Skills | `suede-customer-research` | 88 | 91 | product-management |
| Suede AI Design Skills | `suede-design` | 84 | 91 | frontend-design |
| Suede AI Slop Stop Skills | `suede-deslop` | 83 | 91 | writing-content |
| Suede AI Directory Submissions Skills | `suede-directory-submissions` | 88 | 91 | marketing-seo |
| Suede AI Lifecycle Email Skills | `suede-emails` | 86 | 91 | productivity-knowledge |
| Suede AI Free Tools Skills | `suede-free-tools` | 88 | 91 | marketing-seo |
| Suede AI Graph Flo XR Skills | `suede-graph-flo-xr` | 83 | 91 | ai-agents-llm |
| Suede AI Image Skills | `suede-image` | 88 | 91 | media-creative |
| Suede AI Influencer Outreach Skills | `suede-influencer-outreach` | 84 | 91 | productivity-knowledge |
| Suede AI Launch Packaging Skills | `suede-launch-packaging` | 84 | 91 | marketing-seo |
| Suede AI Lead Magnet Skills | `suede-lead-magnets` | 86 | 91 | marketing-seo |
| Suede AI Marketing Council Skills | `suede-marketing-council` | 86 | 91 | marketing-seo |
| Suede AI Marketing Loop Skills | `suede-marketing-loops` | 86 | 91 | marketing-seo |
| Suede AI Marketing Planning Skills | `suede-marketing-plan` | 84 | 91 | marketing-seo |
| Suede AI Newsroom Skills | `suede-newsroom` | 84 | 91 | writing-content |
| Suede AI Offer Design Skills | `suede-offers` | 86 | 91 | business-finance |
| Suede AI Onboarding Skills | `suede-onboarding` | 86 | 91 | product-management |
| Suede AI Operations Architecture Skills | `suede-ops-architecture` | 84 | 91 | ai-agents-llm |
| Suede AI Operations Assessment Skills | `suede-ops-assessment` | 84 | 91 | business-finance |
| Suede AI Parity Contract Skills | `suede-parity-contract` | 81 | 91 | developer-tools |
| Suede AI Paywall Skills | `suede-paywalls` | 86 | 91 | marketing-seo |
| Suede AI Google Play Release Skills | `suede-play-release` | 85 | 93 | developer-tools |
| Suede AI Pricing Skills | `suede-pricing` | 86 | 91 | business-finance |
| Suede AI Product Marketing Skills | `suede-product-marketing` | 83 | 91 | marketing-seo |
| Suede AI Programmatic SEO Skills | `suede-programmatic-seo` | 86 | 91 | marketing-seo |
| Suede AI Prospecting Skills | `suede-prospecting` | 86 | 91 | business-finance |
| Suede AI Public Relations Skills | `suede-public-relations` | 84 | 91 | marketing-seo |
| Suede AI Referral Skills | `suede-referrals` | 86 | 91 | marketing-seo |
| Suede AI Release Linter Skills | `suede-release-linter` | 86 | 93 | media-creative |
| Suede AI Revenue Operations Skills | `suede-revops` | 86 | 91 | data-databases |
| Suede AI Rights Passport Skills | `suede-rights-passport` | 86 | 93 | business-finance |
| Suede AI Sales Enablement Skills | `suede-sales-enablement` | 86 | 91 | business-finance |
| Suede AI SEO Audit Skills | `suede-seo-audit` | 88 | 93 | marketing-seo |
| Suede AI Ship Copy Skills | `suede-ship-copy` | 72 | 91 | writing-content |
| Suede AI Site Alchemy Skills | `suede-site-alchemy` | 83 | 91 | marketing-seo |
| Suede AI SMS Skills | `suede-sms` | 86 | 91 | marketing-seo |
| Suede AI Social Skills | `suede-social` | 86 | 91 | marketing-seo |
| Suede AI Sync Packaging Skills | `suede-sync-packaging` | 84 | 91 | marketing-seo |
| Suede AI Video Skills | `suede-video` | 86 | 91 | media-creative |
| Suede AI Visibility Grader Skills | `suede-visibility-grader` | 78 | 91 | marketing-seo |
| Suede AI Workflow Skills | `suede-workflow-skills` | 84 | 91 | ai-agents-llm |

## Validation

Strict source validation passes for all 64 packages. Focused source, branding, real browser-client lookup, immutable-source ingestion, source-to-report and security regressions pass. Exact-head full CI results are recorded in [draft PR283](https://github.com/JasonColapietro/suede-creator-skills/pull/283). Initial CI exposed branding/SEO integration regressions; installed labels and keyword metadata are corrected, and all 14 focused source/report/branding/SEO checks pass. Local baseline npm test was stopped after its native validator-runtime process ran for more than 20 minutes; its partial log is not claimed as a pass.
