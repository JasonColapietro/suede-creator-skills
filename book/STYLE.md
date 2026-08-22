# Book style brief (read before writing)

You are writing one or two chapters of a book called **S-Tier: The Builder's Book
Behind the Suede Skills**. It is a real book about how agent skills work and how a
person becomes an exceptional builder using them. Repo root:
`/Users/jasoncolapietro/code/suede-creator-skills`.

## Audience

Working builders. Solo founders, AI engineers, product people who already use
Claude Code or Codex and have hit the ceiling of prompting well. They are smart,
busy, and allergic to being sold to.

## Voice

Composed operator. Direct, concrete, a little dry. Think a senior engineer
explaining how a system actually behaves, not a thought leader explaining why the
future is exciting.

- Second person. "You" and "your repo," not "one" or "the user."
- Short paragraphs, 2 to 5 sentences. Vary sentence length deliberately.
- Every abstract claim gets a concrete example within three sentences.
- Dry humor is allowed, roughly once a chapter. Never a joke in a safety passage.
- Show real file paths, real skill names, real commands, real output shapes.

## Hard bans (this repo ships an anti-slop skill; do not violate it)

- No em dashes. Use commas, colons, periods, or parentheses.
- No "it's not just X, it's Y" or "isn't merely" constructions.
- No "In today's fast-paced world," "Let's dive in," "In conclusion,"
  "At the end of the day," "game-changer," "unlock," "leverage" as a verb,
  "seamless," "robust," "powerful," "revolutionize," "delve."
- No manufactured enthusiasm, no exclamation points, no emoji.
- No rhetorical question openers ("What if I told you...").
- No tricolon padding ("faster, cleaner, better").
- No bullet list where a paragraph works. Lists are for genuinely enumerable
  things: checklists, tiers, lanes, steps.
- No fabricated statistics, benchmarks, survey results, or user quotes. If you
  want a number, take it from the repo or leave it out.

## Facts you may use (verified in-repo)

- 71 public skill folders, each a `skills/<name>/SKILL.md`, MIT licensed.
- Install: `/plugin marketplace add JasonColapietro/suede-creator-skills` then
  `/plugin install suede-skills@suede`. Also `install.sh`, `npx skills add`,
  and a Codex-native plugin.
- The MCP server at `mcp/` exposes 8 tools, 6 resources, 5 prompts.
- Author: Jason Colapietro, founder of Suede Labs AI. Solo founder. The pack came
  out of watching hired marketing firms skip fundamentals on his own products.
- House line of `suede-full-send`: "Never end your allocation above zero." It is
  a dry joke about already-authorized compute, not a literal token counter.
- 40 of the marketing skills are adapted from `marketingskills` by Corey Haines
  under MIT. Credit belongs there. Say so if marketing skills come up.
- `amazon-returns-recovery` has recovered $448.31 against a real account.
- Design palette: background `#080808`, gold `#c8a96e`, risk red `#8b1a1a`.

Anything else numeric, verify by reading the repo before you write it.

## Method

1. Read the SKILL.md files your brief names. Quote their actual mechanics.
2. Write the chapter to the exact path in your brief.
3. Markdown. `# Chapter N. Title` at the top, `##` for sections, no `#` elsewhere.
4. 1,400 to 2,200 words unless your brief says otherwise.
5. Open with a specific scene, a failure, or a blunt claim. Never open with
   throat-clearing about the topic's importance.
6. Close with something that lands: a rule, a test the reader can apply, or a
   line that reframes what came before. No summary paragraph that restates the
   chapter.
7. End every chapter with a short section `### The move` containing one
   actionable practice, stated in one or two sentences.

## Continuity

The book runs on a few repeated ideas. Use them where they fit, do not explain
them from scratch every time (Chapter 1 through 3 establish them):

- **Progressive disclosure**: the agent loads a skill's body only when the
  description matches. Description is the router; the body is the payload.
- **Evidence or it did not ship**: a claim without a command output, a URL, or a
  diff is a guess.
- **Bring a decision, not a workshop**: the operator's attention is the scarce
  resource, not compute.
- **The S-tier ladder**: C-tier builders produce output, B-tier produce working
  output, A-tier produce verified output, S-tier produce systems that keep
  producing verified output without them.

Do not write a preface, a table of contents, or cross-chapter navigation. The
editor assembles those.
