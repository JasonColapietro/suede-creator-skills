# Futurepedia parity ledger

Written November 1, 2026. Dataset snapshot: October 22, 2026.

This ledger records how every classification and site feature of Futurepedia (futurepedia.io, an AI tools directory) maps to suedeai.directory. Futurepedia lists AI tools; the directory lists agent skills, so each Futurepedia label maps to the skills that do that job.

## How the inventory was gathered

futurepedia.io blocks fetches from the build environment, so the inventory comes from 197 web searches across eight research sweeps (page titles, URLs and snippets from futurepedia.io and third-party reviews) plus recall of the site. Labels confirmed by a search result are marked `search` in the sweep data; the rest are `recall`. Recheck recalled labels against the live site before quoting them.

## Classifications

222 topics in 12 groups live in `topics.json`. Each carries a `futurepedia` array naming the labels it stands in for. A topic publishes a page at `/topics/<id>/` once 3 listed skills match; 192 do today. The rest stay on the topics hub as "no page yet" with their match count and a listing link.

| Group | Futurepedia labels it covers | Topics | With pages |
| --- | --- | ---: | ---: |
| Business | AI Business Tools, Operations | 11 | 10 |
| Marketing | AI Marketing Tools, Growth & Marketing, Growth and Marketing | 17 | 17 |
| Productivity | AI Productivity Tools | 15 | 14 |
| Writing and Text | AI Text Generators, AI Writing Tools, Writing & Editing | 12 | 12 |
| Code and Developer | AI Code Tools, AI Developer Tools, Technology & IT | 64 | 63 |
| Automation and Agents | AI Automation Tools, AI Agents, Workflows, Automations | 18 | 17 |
| Image, Art and Design | AI Image Tools, AI Art Generators, AI Design Tools, Design & Creative, Art Generators | 20 | 17 |
| Video | AI Video Tools | 13 | 12 |
| Audio and Music | AI Audio Generators, AI Music Tools | 10 | 9 |
| Data and Research | AI Research Tools, AI Data Tools | 12 | 12 |
| Education and Lifestyle | AI Education Tools, AI Lifestyle Tools, Fun Tools | 13 | 3 |
| Other | Misc AI Tools | 17 | 6 |

Every category label the research sweeps found maps to a group or topic. Compound research notes (for example "Talking Head / Talking Photo") are split into their parts in the aliases.

Futurepedia's pricing filter (Free, Freemium, Free Trial, Paid, Contact for pricing, Deals) maps to cost and license lanes at `/pricing/`. Its feature filter (API, Open Source, Browser Extension, Mobile App, Discord Community, Waitlist, No Signup Required) maps to capability filters at `/features/`. Both come from `scripts/directory/facets.mjs` and use only published dataset fields.

## Site features

| Futurepedia feature | suedeai.directory |
| --- | --- |
| Top-level categories | 16 category directories plus 12 topic groups at `/topics/` |
| Subcategories, hashtag tags, tasks | Topic pages at `/topics/<id>/`; ranked task shortlists at `/for/` |
| Pricing filter | Cost and license lanes at `/pricing/`; chips on category, topic, lane and capability tables; a Cost select in hub search |
| Features filter | 14 capability filters at `/features/`; chips on tables; a Capability select in hub search |
| Sort (popular, newest, rating, verified) | Table sort: full pages first, score, name, recently updated, newest listings, most cited. Hub search adds newest and recently updated |
| Verified badge | Official tag, README badges and the verification ledger (existing) |
| Featured, editor picks, sponsored | Featured projects, Where to start and promotion placements (existing) |
| New and trending | `/new/` for new listings and recently updated skills; most-cited collections on the hub |
| Top or leaderboard | `/top/`, the 100 highest-scoring third-party skills |
| Save or bookmark | Save on every full skill page and in hub search results; `/saved/` page with Markdown export, stored in the browser with no account |
| Ratings and reviews | Suede Skill Check score, a Strengths and open points panel, and reader reviews through the `directory-review.yml` GitHub issue form. No rating markup, per the existing policy |
| Tool page sections | Skill pages add Topics, Cost, Capabilities and Listed since rows, a share row, a Q&A section with FAQPage markup and a similar-skills panel |
| Alternatives | Alternatives pages (existing) plus similar skills by shared topics |
| Newsletter | RSS feed at `/feed.xml` with new listings and guides |
| Guides, tutorials | Guides hub (existing) |
| Submit a tool | Submit page and listing form (existing) |

## Not carried over

These Futurepedia items have no counterpart because an agent skill is a SKILL.md folder, not a hosted product: Free Trial, Paid and Contact for pricing tiers, Deals, Mobile App, Browser Extension, Discord Community, Waitlist and user accounts. Paid listing tiers are also left out: listings stay free, and commercial relationships never touch scores or rankings.

## Keeping it current

- `node scripts/directory/topics-count.mjs` prints every topic's match count; add a topic id for its matches, or `--unmatched` for skills no published topic claims.
- `directory/listed-since.json` is maintained by the build and dates new listings.
- Rankings on `/top/`, `/new/` and in topic answers exclude Suede AI's own skills, the same rule as the task pages.
