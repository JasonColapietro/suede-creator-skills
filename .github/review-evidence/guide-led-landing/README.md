# Guide-led landing review

Local Chromium captures of the public skills site, using repository HTML/CSS and
assets. These are review evidence, not golden-image test baselines. They are
outside `docs/` and are not served by either production site build.

Before: `e85ef42c60080726db6effd46033869a2f3f2f2d`.
After: the landing changes on this branch. Desktop: 1280 × 900. Mobile:
390 × 844. The final three images capture complete sections at their rendered
document coordinates; no page elements were hidden or edited for the capture.

| Before | Proposed |
| --- | --- |
| ![Previous desktop landing](before-desktop.png) | ![Proposed desktop landing](after-desktop.png) |
| ![Previous mobile landing](before-mobile.png) | ![Proposed mobile landing](after-mobile.png) |

## Explanation and useful starting points

![Workflow explanation on desktop](workflow-desktop.png)

| Mobile use cases | Mobile installation |
| --- | --- |
| ![Task-specific skills and Cracked Devs](use-cases-mobile.png) | ![Claude Code and Codex installation](install-mobile.png) |

The proposal exposes the Guide's worked example in the hero, then explains the
request-to-evidence workflow, links useful first tasks including Cracked Devs,
and shows both native install paths before the full specialty map. Guide remains
the detailed reference. The existing catalog, skill records, directory links,
benchmarks, design palette and Cracked page are retained.

## Verification scope

- New browser regression fails on the original missing desktop Cracked Devs link.
- Browser checks cover visible desktop/mobile Cracked links, keyboard activation
  and focus, local links/fragments, section order, literal clipboard contents,
  no-JavaScript navigation/content, and 320/390/768/769/1280px reflow.
- Independent review reproduced keyboard, clipboard and reflow checks, and
  measured Cracked Devs text contrast in its initial desktop states (home 4.91:1
  default/focus; catalog 7.20:1 default/focus).
- The production build preserves Guide, Cracked Devs, the new interface skills,
  and links to the separate directory host. No install command was executed.
- The full suite and CI status are reported in the PR, rather than frozen here.

Known pre-existing limits: increased text spacing at 320px makes two unchanged
statistics cells extend the homepage by 5px; the detailed Guide also has existing
320px overflow and older five-lane grader wording. These were reproduced or
source-attributed and are outside this landing change. No screen reader,
Safari/Firefox, physical mobile device, live-edge visual check, or conversion
uplift was established. Screenshots prove only the captured local renders.

This is a draft proposal. Merge and production deployment require approval of
the revised landing scope. `vercel.json` disables automatic deployments for
`feat/guide-led-landing` only, using Vercel's documented
[`git.deploymentEnabled`](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled)
setting. Other branches keep their normal behavior. Review images are provided
here without starting a hosted preview.
