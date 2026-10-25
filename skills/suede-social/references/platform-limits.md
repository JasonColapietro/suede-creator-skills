# Platform Limits and Verified Facts

Platform limits, composer behavior, and account entitlements change often. Each
row below carries the date it was last checked and the page it was checked
against. A row marked **unverified** was not confirmed from an official or
developer page in that check: read the current help page or the authenticated
composer before you rely on it.

In every run:

1. Check the official help page, developer doc, or the authenticated composer.
2. Record account tier, surface (app, web, API, scheduler), locale, and the check date.
3. Keep copy under the verified hard limit with room for links and disclosure.
4. Preview truncation and attachments before approval.
5. Treat hashtag count and placement as test variables, not reach levers.

A limit that applies to the native app can differ from the API or a scheduler.
When a post goes through Buffer or another tool, the tool's limit wins. See
[publishing-access.md](publishing-access.md).

## Verified limits (checked 2026-10-25)

### Instagram

| Fact | Source |
|---|---|
| Carousel posts hold up to 20 photos and videos. | https://help.instagram.com/269314186824048 ; API: https://developers.facebook.com/docs/instagram-platform/content-publishing/ |
| At most 5 hashtags per post or Reel caption, rolled out gradually from December 2025. Instagram: fewer targeted tags beat many generic ones. | Instagram @creators on Threads, reported by Social Media Today, Dec 18, 2025: https://www.socialmediatoday.com/news/instagram-implements-new-limits-on-hashtag-use/808309/ |
| Reels can run up to 3 minutes; grid previews use a taller 3:4 crop. | Instagram announcement, January 2025 |
| Public posts and Reels from professional accounts of adults can appear in Google and other search engines, on by default since July 10, 2025. Opt out under Settings, Privacy. | Instagram Help Center; PPC Land, "Instagram content becomes searchable on Google" |
| Trial reels (shown only to non-followers first) can be published through the API with a manual or performance-based graduation setting. | https://developers.facebook.com/docs/instagram-platform/content-publishing/ |
| API publishing is capped per account per rolling 24 hours. The doc gives both 100 and 50; read `GET /<IG_ID>/content_publishing_limit` for the live number. | Same page |

### Facebook

| Fact | Source |
|---|---|
| All Facebook videos are shared as Reels, with no length or format restriction on Facebook Reels. The Video tab became the Reels tab. Meta said recommendations did not change. Announced June 17, 2025, rolled out gradually. | https://about.fb.com/news/2025/06/making-it-easier-create-videos-facebook/ |

### Threads

| Fact | Source |
|---|---|
| Text posts: 500 characters. Emoji count as UTF-8 bytes. | https://developers.facebook.com/documentation/threads/overview |
| Text attachments add up to 10,000 characters with basic formatting (since Sept 4, 2025). Attached text is not indexed by Google and not federated. | TechCrunch, Sept 4, 2025: https://techcrunch.com/2025/09/04/threads-challenges-x-by-offering-free-support-for-up-to-10k-characters-plus-prominent-links |
| Carousels: 2 to 20 items. Video up to 5 minutes (300 seconds), 1 GB. | https://developers.facebook.com/documentation/threads/overview |
| One topic tag per post, 1 to 50 characters. API posts with more than 5 links fail (from Dec 22, 2025). | https://developers.facebook.com/documentation/threads/posts |
| API: 250 published posts and 1,000 replies per profile per rolling 24 hours. | https://developers.facebook.com/documentation/threads/overview |

### X

| Fact | Source |
|---|---|
| 280 characters by default. Premium subscribers can write up to 25,000 characters; everyone can read long posts. Only the first 280 characters show in the timeline. | https://help.x.com/en/using-x/x-premium ; Buffer X guide |
| Premium video uploads up to about 3 hours and 8 GB at 1080p, on x.com and iOS only. | https://help.x.com/en/using-x/x-premium |
| Through Buffer: video 0.5 to 140 seconds, one video per post, threads up to 25 posts, polls not supported. | https://support.buffer.com/articles/using-xtwitter-with-buffer-nA84XnWtuU.md |

### LinkedIn

| Fact | Source |
|---|---|
| Document posts: PDF, PPT, PPTX, DOC, or DOCX, up to 100 MB and 300 pages. | https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/documents-api |
| Video: 3 seconds to 30 minutes per the Videos API. File size ceiling is stated as both 500 MB and 5 GB in the same doc; test before relying on more than 500 MB. | https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/videos-api |
| Post text limit: **unverified**. 3,000 characters is widely reported; LinkedIn's help pages blocked automated reading in this check and the Posts API doc names no number. | Composer readback required |

### TikTok

| Fact | Source |
|---|---|
| Photo posts: up to 35 images; title up to 90 and description up to 4,000 UTF-16 units. | https://developers.tiktok.com/doc/content-posting-api-reference-photo-post |
| Video caption through the API: up to 2,200 UTF-16 units. | https://developers.tiktok.com/doc/content-posting-api-reference-direct-post |
| Upload length depends on the account: 3 minutes standard, some accounts 5 or 10 minutes through the API; files up to 4 GB. In-app maximums are **unverified** in this check. | https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide |

### YouTube Shorts

| Fact | Source |
|---|---|
| Square or vertical uploads up to 3 minutes count as Shorts (on or after Oct 15, 2024; Official Artist Channels from Dec 8, 2025). | https://support.google.com/youtube/answer/15424877 |
| A Short over 1 minute with any active copyright claim, manual claims included, is blocked globally until the claim is resolved. No channel penalty. | Same page |

### Bluesky

| Fact | Source |
|---|---|
| Posts: 300 graphemes (an emoji counts as one). | https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/post.json |
| Up to 4 images per post, 2 MB each. | https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/embed/images.json |
| Video up to 3 minutes (since March 10, 2025). | TechCrunch, Mar 10, 2025: https://techcrunch.com/2025/03/10/bluesky-now-lets-users-upload-videos-that-are-up-to-3-minutes-long/ |

## Still unverified (do not quote as fact)

- Instagram caption character limit (2,200 is widely reported; Meta help pages
  blocked automated reading in this check).
- Instagram 20-minute Reels recording. Only third-party blogs describe it, as a
  limited test, with no Meta source.
- LinkedIn post text limit and the "see more" truncation point.
- TikTok in-app caption and upload maximums outside the API.
- Pinterest pin title and description limits.

## Per-platform preflight

| Platform | Check before approval | Starting hypothesis |
|---|---|---|
| Instagram | Caption length in composer, 5-hashtag cap, Reel length, 3:4 grid crop, AI label | 0 to 3 topic hashtags; search term in the first caption line and on-screen text |
| Facebook | Reel cover, audience setting (Feed and Reels share one default), link preview | Native context before any link |
| Threads | 500 characters or a text attachment, one topic tag, link count | Premise in the opening line; long text in an attachment won't be found by Google |
| X | Account tier, first 280 characters, thread length, scheduler video cap | First post self-contained; link inside the first 280 characters if it must preview |
| LinkedIn | Composer truncation, document page count and size | Opening two lines stand alone before "see more" |
| TikTok | Account upload length, caption units, photo count, AI label | Search phrase spoken and shown in the first seconds |
| YouTube | Shorts length, claimed music on anything over 1 minute, AI use attribute | Title states the promise and the search phrase |
| Bluesky | 300 graphemes, 4 images, alt text | Concise post; link card or thread for detail |

## Evidence rules

- A hard limit needs a current official source or an authenticated composer
  readback.
- A recommendation needs current account or campaign evidence.
- A starting range is labeled a hypothesis and compared with a baseline.
- Never claim fewer hashtags, a placement choice, or a feature improves reach
  without a controlled comparison on the current account.
