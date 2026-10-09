# Suede Creator Skills

**SEO audits, AI search visibility, conversion copy and business-operations workflows for Claude Code, Codex and any skills-compatible agent.** One `pip` install puts the whole open-source pack on your machine, and one command loads it into your agent.

```bash
pipx install suede-creator-skills
suede-skills install
```

Prefer plain pip? `pip install suede-creator-skills`, then `suede-skills install`. Restart your agent session and every skill is ready to trigger by name or by request.

## What you get

Each skill is a plain Markdown `SKILL.md` folder your agent reads on demand: an installed skill costs its name and description, and the full body loads only when a request matches. The pack covers:

- **Get found:** technical SEO audits, AEO and GEO for AI answer engines, programmatic SEO, and an A-F visibility grade for any page.
- **Revenue and retention:** pricing, offers, paywalls, signup and onboarding flows, churn prevention, and attribution.
- **Demand channels:** paid ads, cold email, lifecycle messaging, and ad creative.
- **Craft:** design systems, conversion copy, and an anti-slop writing pass.
- **Ship:** one-pass code review with an A-F ship grade, CI gates, AI evals, agent-team orchestration, and iOS and Android delivery.
- **Strategy and rights:** market and competitor research, positioning, and creator-rights tooling.

## Commands

```bash
suede-skills list                          # every skill with a one-line summary
suede-skills list --specialty found        # one specialty: ship, craft, found, demand, revenue, position
suede-skills show suede-seo-audit          # print a skill's SKILL.md
suede-skills install                       # all skills into ~/.claude/skills
suede-skills install --target codex        # $CODEX_HOME/skills, or ~/.codex/skills
suede-skills install --target ./.claude/skills --skill suede-seo-audit --skill suede-code
suede-skills install --force               # refresh pack folders you already installed
suede-skills path                          # where the bundled skills live
suede-skills --version
```

Installs are safe to repeat. A skill folder that already exists stays exactly as it is until you pass `--force`, and folders outside the pack (your own skills, other packs) are never touched. Every run prints what it installed.

The Claude target also installs the six `suede-graph-flo-xr-*` agent profiles into `~/.claude/agents`, which the bundled Suede Graph Flo XR workflow uses.

## Requirements

Python 3.9 or newer. Zero dependencies: the package is the standard library plus the skill folders.

## Other install routes

The same pack installs as a Claude Code plugin (`/plugin marketplace add JasonColapietro/suede-creator-skills`), a Codex plugin, a Hermes Agent skills tap, and through `npx skills add JasonColapietro/suede-creator-skills`. Every route is on the [install page](https://skills.suedeai.ai/plugins.html).

## Links

- Homepage and skill catalog: https://skills.suedeai.ai
- Install guide and MCP server: https://skills.suedeai.ai/plugins.html
- Source: https://github.com/JasonColapietro/suede-creator-skills
- Changelog: https://skills.suedeai.ai/#changelog
- Issues: https://github.com/JasonColapietro/suede-creator-skills/issues

## License

Original work is MIT licensed. Adapted components keep their upstream notices: `NOTICE.md` and the `licenses/` folder ship inside every sdist and wheel. Built by Jason Colapietro.
