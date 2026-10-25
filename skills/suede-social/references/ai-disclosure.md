# AI Content Labels by Platform

Every approval packet that contains AI-generated or AI-altered media records
which label rule applies and how the label will be set. Checked 2026-10-25.
Re-read the linked page before relying on a row; these policies are revised
often.

## Rules that require the creator to act

| Platform | What triggers a label | How to set it | Source |
|---|---|---|---|
| YouTube (incl. Shorts uploads) | Realistic AI-generated or altered content: a real person saying or doing something they didn't, altered footage of real events or places, realistic made-up scenes, AI music as the main focus. Not required for unrealistic content, beauty filters, color fixes, captions, upscaling, AI-written scripts or titles, or cloning your own voice for voiceover. | YouTube Studio upload flow (desktop or mobile): Attributes, "AI use" set to Yes. YouTube may also label from C2PA metadata, its own tools, or detection; those labels usually cannot be switched off. Repeated failure to disclose can lead to removal or YPP suspension. Disclosure alone does not limit reach or monetization per YouTube. | https://support.google.com/youtube/answer/14328491 |
| TikTok | Realistic AI-generated content. TikTok reads C2PA Content Credentials and auto-labels; it is testing an invisible watermark and a viewer control for how much AIGC appears in For You. Labels show whether they came from the creator, detection, or a TikTok tool. Guidelines effective Sept 13, 2025 say a label does not make harmful or misleading AI content acceptable. | In-app AI-generated content toggle; via the Content Posting API set `is_aigc: true` ("Creator labeled as AI-generated"). | https://newsroom.tiktok.com/more-ways-to-spot-shape-and-understand-ai-generated-content?lang=en-GB (Nov 24, 2025); https://developers.tiktok.com/doc/content-posting-api-reference-direct-post ; MediaPost, Aug 15, 2025 |
| Instagram, Facebook, Threads | Organic posts with photorealistic video or realistic-sounding audio that was digitally created or altered. Meta "may apply penalties" for failing to disclose. Meta also labels from C2PA and IPTC signals. Label reads "AI info"; content only edited with AI shows it in the post menu rather than on the post (since Sept 2024). | The AI label option in the composer before sharing. | https://about.fb.com/news/2024/02/labeling-ai-generated-images-on-facebook-instagram-and-threads/ ; https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/ |

## Platforms that label from metadata, without a creator duty

| Platform | Behavior | Source |
|---|---|---|
| LinkedIn | Shows a "Cr" Content Credentials icon on images and video carrying C2PA metadata (since May 2024). No user disclosure requirement was found. | MediaPost, May 21, 2024: https://www.mediapost.com/publications/article/396225/linkedin-begins-labeling-ai-generated-content.html |
| X | No creator labeling duty. X may label, limit, or remove significantly and deceptively altered media likely to cause harm. | https://help.x.com/en/rules-and-policies/manipulated-media |

Bluesky and Pinterest rules were not checked in this pass.

## How to apply this in the skill

1. During QA, classify each asset: no AI media, AI-assisted edit only, realistic
   AI or altered media, AI voice of a real person other than the speaker.
2. For "realistic" or a cloned third-party voice, set the native label on every
   platform that requires it, and record it in the approval packet as
   `AI label: <platform setting> | not required (reason)`.
3. Keep C2PA metadata on exported files when the tool writes it. Stripping it to
   avoid a label is evasion; do not do it.
4. A label does not cure a deceptive claim, a fake endorsement, or a likeness used
   without consent. Those stop at the halt contract.
5. Schedulers may not expose the label toggle. If the tool cannot set it, post
   natively or confirm the setting in the live readback.
