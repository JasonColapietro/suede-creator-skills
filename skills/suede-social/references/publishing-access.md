# Publishing Paths, Schedulers, and API Access

Use this when a plan depends on scheduling, an API, or a listening tool. Checked
2026-10-25. Nothing here changes the approval rule: a scheduler queues content
only after exact-content approval, and a queued item is not a published post.

## Pick the publishing path

| Path | Use when | Watch for |
|---|---|---|
| Native app or web composer | The post needs a feature the scheduler lacks (polls, AI label toggle, long X video, trial reels in some tools) | Manual readback still required |
| Scheduler (Buffer or similar) | Approved posts on a steady calendar across several networks | The tool's own limits, which can be tighter than the platform's |
| Direct API | An approved, owned integration already exists | Per-call pricing, audit status, and rate caps below |

## Buffer network support

Buffer's network guides cover Instagram, Facebook, TikTok, LinkedIn, X, YouTube
Shorts, Bluesky, Threads, Google Business Profiles, Pinterest, and Mastodon.
Source: https://support.buffer.com/category/500-buffer-social-network-guides

Known X limits inside Buffer (https://support.buffer.com/articles/using-xtwitter-with-buffer-nA84XnWtuU.md):

- Threads up to 25 posts, created on web only.
- Long posts up to 25,000 characters only for paid X accounts; the first 280
  show in the timeline, so keep any previewed link inside them.
- Video 0.5 to 140 seconds. Premium long video works only natively.
- Polls are not supported.
- X does not return impressions or views to Buffer, so reach must come from
  native X analytics.

## API access that affects cost or feasibility

| Platform | What changed or applies | Source |
|---|---|---|
| X | Pay-per-use pricing replaced fixed monthly entry plans in February 2026. Listed rates on the check date: post read $0.005, user read $0.010, post create $0.015, post create with a URL $0.200, owned reads $0.001. Reads dedupe within a 24-hour UTC window; pay-per-use caps at 3 million post reads per month. | https://docs.x.com/x-api/getting-started/pricing ; MediaNama, Feb 7, 2026 |
| TikTok | Unaudited API clients can only post privately. Direct Post allows 6 init requests per minute per user token, plus daily per-user caps. | https://developers.tiktok.com/doc/content-posting-api-reference-direct-post |
| Instagram | Rolling 24-hour publish cap per account; read `content_publishing_limit` for the live value. Trial reels and image alt text (since Mar 24, 2025) are API fields. | https://developers.facebook.com/docs/instagram-platform/content-publishing/ |
| Threads | 250 posts and 1,000 replies per profile per rolling 24 hours; more than 5 links fails. | https://developers.facebook.com/documentation/threads/overview |
| LinkedIn | Marketing API version 202511 sunsets Nov 16, 2026; integrations pinned to it need an upgrade. | https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/documents-api |
| Bluesky | Public read API for search needs no key (see [listening.md](listening.md)). | https://public.api.bsky.app |

## Planning consequences

- On X, a scheduled post that carries a URL costs about 13 times a plain post
  through the API at listed rates. When the user pays for API use directly,
  estimate monthly cost from the calendar before approving an API workflow.
- Keyword listening on X through the API is billed per post read. Size the
  lookback and query count first; a browser review of saved searches costs
  nothing but time.
- Record the publishing path in the approval packet, since the readback and the
  AI label setting depend on it.
