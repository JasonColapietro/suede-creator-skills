# Content Ideation Sources

Per-source extraction guide for `suede-content-strategy`. Run the Research
Surface Check in SKILL.md first; use only the sources that are supplied or
actually callable, and label anything unverified as a hypothesis. AI answer
gaps from a `suede-ai-seo` prompt panel are covered in SKILL.md.

## 1. Keyword Data

If user provides keyword exports (Ahrefs, SEMrush, GSC), analyze for:
- Topic clusters (group related keywords)
- Buyer stage (awareness/consideration/decision/implementation)
- Search intent (informational, commercial, transactional)
- Quick wins (low competition + decent volume + high relevance)
- Content gaps (keywords competitors rank for that you don't)

Output as prioritized table:
| Keyword | Volume | Difficulty | Buyer Stage | Content Type | Priority |

## 2. Call Transcripts

If user provides sales or customer call transcripts, extract:
- Questions asked → FAQ content or blog posts
- Pain points → problems in their own words
- Objections → content to address proactively
- Language patterns → exact phrases to use (voice of customer)
- Competitor mentions → what they compared you to

Output content ideas with supporting quotes.

## 3. Survey Responses

If user provides survey data, mine for:
- Open-ended responses (topics and language)
- Common themes, with sample count and observed proportion recorded
- Resource requests (what they wish existed)
- Content preferences (formats they want)

## 4. Forum Research

If an authorized browser or search surface is currently callable, use it to find
recent first-party community evidence. Otherwise ask for relevant URLs or provide
the queries below for manual collection.

**Reddit:** `site:reddit.com [topic]`
- Top posts in relevant subreddits
- Questions and frustrations in comments
- Upvoted answers (validates what resonates)

**Quora:** `site:quora.com [topic]`
- Most-followed questions
- Highly upvoted answers

**Other:** Indie Hackers, Hacker News, Product Hunt, industry Slack/Discord

For each item, capture the source URL, publication date, retrieval date, community
context, and a short evidence excerpt. Distinguish engagement signals from proof
of customer demand.

## 5. Competitor Analysis

Use a currently callable, authorized browser/search surface or user-supplied
competitor URLs. If neither is available, produce a manual research checklist and
do not invent page inventories, rankings, engagement, or gaps.

**Find their content:** `site:competitor.com/blog`

**Analyze:**
- Observable posts and dated engagement signals
- Topics covered repeatedly
- Gaps they haven't covered
- Case studies (customer problems, use cases, results)
- Content structure (pillars, categories, formats)

**Identify hypotheses to validate:**
- Topics you can cover better
- Angles they're missing
- Outdated content to improve on, based on a visible date or stale claim

## 6. Sales and Support Input

Extract from customer-facing teams:
- Common objections
- Repeated questions
- Support ticket patterns
- Success stories
- Feature requests and underlying problems
