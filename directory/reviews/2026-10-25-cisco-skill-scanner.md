# Cisco AI Defense Skill Scanner: editorial source review

Reviewed October 25, 2026. Official source: [cisco-ai-defense/skill-scanner](https://github.com/cisco-ai-defense/skill-scanner), release **2.3.1**, commit [`c615acb70994cdf3f4ba54d955fef2e92ac84437`](https://github.com/cisco-ai-defense/skill-scanner/tree/c615acb70994cdf3f4ba54d955fef2e92ac84437). License: Apache-2.0. User-nominated editorial selection; no scored directory listing, structural certification, partnership or claim that external catalog entries are all scanned.

The useful capability is source review before installation: static YAML/YARA patterns, Python/Bash dataflow analysis and machine-readable JSON/SARIF findings. These analyzers inspect source without executing target skill scripts. They are best-effort detectors with false positives, false negatives and coverage limits. A no-findings result is evidence about the recorded coverage, not proof that a skill is benign.

## Dependency and runtime verification

The [2.3.1 release notes](https://github.com/cisco-ai-defense/skill-scanner/releases/tag/2.3.1) exclude hijacked `litellm==1.107.0` and disclose an older certifi in the attached release lock. Suede's separately reviewed integration uses [93 exact, hash-pinned Python dependencies](https://github.com/JasonColapietro/suede-creator-skills/blob/fe5dc1757cd6c8ff63aee853564249c00151778d/scripts/security/requirements.txt), including `litellm==1.89.7` and fixed `certifi==2026.10.19`. Lock SHA256: `f7e58c92968673145d6f6f36f3d685c28e836851f5766dd349c3ff8a5b655769`. Independent PyPI and OSV checks on October 25 returned no known advisories for those exact versions; every hash matched release metadata and no locked release was yanked. This is dated dependency evidence, not a blanket guarantee about future advisories or every installation.

Actual isolated Linux execution is retained in [run 40232990904](https://github.com/JasonColapietro/suede-creator-skills/actions/runs/40232990904), repair head `fe5dc1757cd6c8ff63aee853564249c00151778d`. The synthetic clean fixture completed with zero findings; the attack fixture produced blocking findings. All five configured analyzers executed. Two external samples at exact commit `dbd4588f9e1033efb41dad4bef2f7947c8993d44` completed with zero findings across six inventoried files. These samples do not establish whole-catalog coverage. First-party scanning retained blocking findings in three packages and incomplete binary coverage in one; the source-scan job remained failed. The feature does not relabel or suppress those results.

Runtime verification used an immutable Python 3.12 Linux image, hash-required wheels, an unprivileged container user, zero effective capabilities, no new privileges, a read-only source mount, resource limits and no network interface beyond loopback. No submitted skill, installer, script or hook executed. The adapter explicitly disabled behavioral alignment verification and did not enable hosted analyzers. Dependency API deprecation warnings remained in diagnostics; actual analysis warnings and errors prevented passes.

## Configuration and data boundary

Use the reviewed release and a verified dependency lock. For local deterministic review, keep hosted LLM, AI Defense, OSV and VirusTotal analyzers disabled and enforce network isolation. Those optional upstream routes can transmit source, metadata or files when enabled; the upstream project as a whole is not a blanket zero-egress tool. Preserve source revision, scanner version, time, file coverage, failures and all findings. Review sensitive source in an environment without personal credentials or unrelated filesystem access.

The historic API-server advisory affecting releases through 1.0.1 was fixed in 1.0.2; the reviewed use here is the local scanner, not an exposed API server. There is no evidence that Suede previously installed the hijacked dependency. Nothing in this review authorizes rotating credentials, starting services or changing production hosting.

## Placement

The verified live canonical page on October 25 is `https://skills.suedeai.ai/directory/featured/`; planned anchor: `#cisco-skill-scanner`. The separate hosting PR #277 is unmerged and is not evidence that `suedeai.directory` is live. This change preserves the other editorial selections and links Cisco's official repository.
