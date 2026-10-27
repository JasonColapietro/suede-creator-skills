# Berlin Job Search admission — October 26, 2026

Request: [#276](https://github.com/JasonColapietro/suede-creator-skills/issues/276).
Accepted source: [umutyesildal/berlin-job-search at 69a06e831e816943f8269a5c513a9d90ace87958](https://github.com/umutyesildal/berlin-job-search/tree/69a06e831e816943f8269a5c513a9d90ace87958).
Canonical path: `skills/berlin-job-search/SKILL.md`, version 0.1.2.
Evidence: [pinned source and tool digests](../intake/berlin-job-search-2026-10-26.json).

## Automated intake result — manual policy hold

The existing parser and curator select exactly `berlin-job-search` through an explicit name allowlist and canonical skill root. Required frontmatter and all seven graded checks pass (`11111111`). MIT license evidence, English instructions and the automated content/listing-policy filters pass. No exact-description or same-name near duplicate exists in the retained catalog. The prepared draft contains no unrequested skill or whole-repository installation route. These automated results do not resolve the manual policy finding below; admission remains on hold.

The unchanged Python `graded-v2` scorer returns **84/99 (B)**: structural checks 56, description length 5, body depth 7, references 3, scripts 2, maintenance 9, compatibility 2. No boundary/example, tool-permission or independent citation credit is claimed. Numeric and B-grade quality shields are eligible under the current rubric. This structural assessment does not certify runtime safety; `security_scan_status` remains `not_scanned`. No README-badge verification or promotional featured placement is activated. The individual editorial skill page is independent of promotional placement.

## Manual policy disposition — October 27, 2026

**Hold: unresolved site-block workaround guidance. Keep PR #288 draft and unmerged; passing CI does not clear this finding.** This corrects the earlier unqualified policy-pass statement, without changing the structural result or recording a new security vulnerability.

The existing [published listing rule](../../docs/directory/methodology/index.html#rules-title) excludes skills that “work around a site's blocks, CAPTCHAs or official API.” Its [curator implementation](../../scripts/directory/curate.py#L95-L145) has the same rule. The own-service exemption is limited to the [reviewed vendor repositories](../../scripts/directory/curate.py#L175-L183); `umutyesildal/berlin-job-search` is not one of them, and LinkedIn is not its own service. This review grants no exception.

At the pinned accepted upstream revision, [`scripts/linkedin.py` lines 78–80](https://github.com/umutyesildal/berlin-job-search/blob/69a06e831e816943f8269a5c513a9d90ace87958/skills/berlin-job-search/scripts/linkedin.py#L78-L80) raises `LinkedInBlockedError` on HTTP 999 with: “LinkedIn blocks datacenter/VPN IPs; run from a home connection or use the browser recipe”. The request stops; this is not evidence of an automatic IP switch, CAPTCHA bypass or a demonstrated exploit. The remaining concern is the instruction to rerun from a different connection in response to a site block, which conflicts with the existing listing rule.

There is relevant counterevidence: the [browser recipe](https://github.com/umutyesildal/berlin-job-search/blob/69a06e831e816943f8269a5c513a9d90ace87958/skills/berlin-job-search/references/browser-search.md#L1-L3) puts the user in control and says to stop at login, CAPTCHA, 2FA or access denial; its [safety instruction](https://github.com/umutyesildal/berlin-job-search/blob/69a06e831e816943f8269a5c513a9d90ace87958/skills/berlin-job-search/references/browser-search.md#L78) forbids evading blocks. The [API reference](https://github.com/umutyesildal/berlin-job-search/blob/69a06e831e816943f8269a5c513a9d90ace87958/skills/berlin-job-search/references/api-sources.md#L246-L250) also forbids bypassing blocked sources with rotating identities, cookies, CAPTCHA solving or hidden endpoints. Those safeguards support ordinary user-operated browsing, but do not withdraw or reconcile the separate home-connection advice. Upstream acceptance of the security corrections does not settle this directory policy conflict.

The automated pass is reproducible and narrower: [`policy_rule()`](../../scripts/directory/curate.py#L234-L259) scans name/description/repository text, selected SKILL.md body/file-name signals and a CAPTCHA-file flag. The [parser](../../scripts/directory/parse_skills.py#L187-L248) supplies at most 8,000 body characters and 200 file names; it does not supply this script error message to the policy matcher. A missing pattern match therefore cannot establish manual clearance.

Resolve the hold only with pinned evidence that reconciles the home-connection instruction with the existing rule, or a reviewed upstream correction removing that advice, followed by a fresh scoped policy review. No policy, allowlist, score, citation, security status, source revision or upstream file is changed by this documentation correction. The prepared catalog records remain draft review material, not an admission decision.

## Accepted corrections and verification

Umut approved the corrections on `7e60296` and merged [upstream PR #1](https://github.com/umutyesildal/berlin-job-search/pull/1) himself on October 26, 2026 at 22:06:37 UTC. Both upstream CI jobs, Python 3.9 and 3.12, passed. His approval records clean live BA, Arbeitnow, LinkedIn and Daily Berlin Jobs searches.

The accepted source retains public-destination validation, single-resolution DNS pinning, TLS hostname verification, redirect validation, HTTPS downgrade rejection, cross-origin header stripping, bounded response reads and posting-integrity warnings. The response cap is 20,000,000 bytes; LinkedIn handles OSError/DNS/timeouts as ordinary source errors; German discovery keywords Jobsuche, Bewerbung are restored. CSV formula neutralization and the malformed-events handler correction are also present.

The accepted merge revision was fetched and its full 157-test suite and validator passed again on Python 3.14.5. Before merge, the same corrected skill/scripts/tests passed 157 tests and validation on Python 3.9.6, 3.12.13 and 3.14.5. The accepted merge differs from the tested contribution only in unrelated upstream contribution templates, README and contribution guidance. Prior live hardened-transport checks returned Arbeitnow 300 jobs / 2,469,492 bytes, GitLab Greenhouse 239 jobs / 3,746,103 bytes, and one LinkedIn search result without errors. These are dated checks, not continuous availability claims.

Installation notes explain Python 3.9+, keyless public APIs, optional PDF browser requirements, local user data, the separately configured Daily Berlin Jobs MCP connector, LinkedIn guest-access terms, and user-controlled account/application actions.

## Snapshot scope

This is an October 26 scoped admission, following the catalog's existing scoped-intake model. The retained catalog snapshot date remains October 22; this repository records its own October 26 assessment date and exact accepted commit. Unrelated publisher records, revisions, scores, citations and editorial decisions are preserved byte-for-byte in their normalized JSON form; before/after digests match. The snapshot identifier rotates and generated reports use the new dataset bytes. No full-network refresh or new independent citation discovery is claimed.
