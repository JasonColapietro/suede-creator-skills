# Connector Map and Send Preflight

Which official MCP servers a campaign can use, what each lane does with them,
and the email checks to run before any list send. Every server below was
confirmed on the vendor's own docs on 2026-10-25. Do not add a server to this
table from a third-party directory; community servers for the same tools exist
and are not covered here.

## Default posture

- Connect read access first. Turn on writes only for the step that needs them.
- Writes create drafts. A human reviews the draft in the vendor's own UI and
  sends, publishes, or launches it there, or approves the exact action in the
  conversation.
- One account per connection. If the artist and the label use different
  workspaces, say which one is connected before pulling numbers.

## Official servers

| Tool | Official source | What it can do (per vendor docs) | Campaign use | Approval note |
|---|---|---|---|---|
| Buffer | `https://mcp.buffer.com/mcp` ([docs](https://developers.buffer.com/guides/integrations/mcp.html)) | Create posts as drafts, queue, custom schedule, or share now; edit, list by status (draft, needs_approval, scheduled, sent); per-post and aggregate metrics | Load the Lane 0 content calendar as drafts; pull post metrics for check-ins | `create_post` can publish immediately. Use `saveToDraft` only. Buffer's docs say keep client approval prompts on. A connection gets access to every channel in the account. |
| Klaviyo | `https://mcp.klaviyo.com/mcp` ([docs](https://developers.klaviyo.com/en/docs/klaviyo_mcp_server), [connect](https://developers.klaviyo.com/en/docs/connect_to_the_klaviyo_mcp_server)) | Campaign creation through flow performance reports | Draft announce and release-week emails; read flow and campaign results | Append `?read-only=true` for check-ins. Remote server needs Owner, Admin, or Manager role. Claude's listed connector ignores query params, so use a custom connector for read-only. |
| Mailchimp | Claude connector ([help article](https://mailchimp.com/help/use-mailchimp-connector-claude)) | Multi-channel campaign plans, email and social layouts, edits, saved as drafts in the account | Draft fan emails and repurpose one announce into email and social versions | Mailchimp's article does not describe sending or scheduling. Treat it as draft-only. |
| HubSpot | `mcp.hubspot.com` ([docs](https://developers.hubspot.com/mcp)) | Read and write contacts, companies, deals, lists (segments); read-only campaigns, landing pages, blog posts | Lane 11 outreach tracking; segment lists for press or venue contacts | Requires a user-level app on HubSpot's Developer Platform; an admin connects first. |
| Meta Ads | `https://mcp.facebook.com/ads` ([docs](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-overview), [announcement](https://developers.facebook.com/blog/post/2026/07/16/meta-ads-mcp-server/)) | Reporting, signal health, create and edit campaigns, ad sets, ads, A/B tests | Read results of paid pushes on teasers and release-week clips | Can create and edit live ads. The docs do not say new ads start paused. Never create or change an ad or budget without the user approving the exact change. |
| Google Ads | [github.com/googleads/google-ads-mcp](https://github.com/googleads/google-ads-mcp) ([docs](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server)) | Read-only: list accounts, GAQL search for metrics, budgets, status | YouTube and search campaign reporting during check-ins | Read-only in the current release; it cannot change bids, pause campaigns, or create assets. |
| Canva | Canva MCP server ([docs](https://canva.dev/docs/mcp/)) | Generate and edit designs, search designs, upload assets, brand kits and templates, export to PDF, PNG, JPG, PPTX, MP4, resize for channels | Lane 7 teaser frames and Lane 8 merch mockups, resized per channel | The approved Suede S mark rule in SKILL.md still applies: never generate or recolor a replacement mark. |
| Figma | Figma remote MCP server ([setup](https://help.figma.com/hc/en-us/articles/35281350665623)) | Reads design context from a pasted file or layer link; newer tools can edit Figma files | Pull era board and cover specs into Lane 2 and Lane 7 briefs | Needs a full or dev seat and access to the file. Supports Claude Code and Codex. |
| Notion | Notion hosted MCP ([docs](https://developers.notion.com/docs/mcp)) | Search, read, update, create pages and databases | Store the campaign plan, asset tracker, and check-in notes | Supports Claude Code and Codex. Workspace owners control client access. |
| Google Drive | Claude Google Workspace connector ([help](https://support.claude.com/en/articles/10166901)) | Search and read Drive files from Claude | Read the artist's press kit, lyric docs, and credits sheets | Credits and split sheets are inputs, not proof of clearance. Route gaps to `suede-rights-passport`. |

## Lane to connector quick map

| Lane | Reads from | Drafts into |
|---|---|---|
| 0 Full Campaign Package | Drive, Notion, last campaign metrics (Buffer, Klaviyo, Mailchimp) | Buffer drafts, Klaviyo or Mailchimp drafts, Notion plan |
| 2 Era Builder, 7 Visualizer | Figma, Canva brand kit | Canva designs |
| 8 Merch Object Lab | Canva brand kit | Canva mockups |
| 11 Collab Matchmaker | HubSpot contacts | HubSpot notes and tasks |
| Check-ins | Buffer, Klaviyo, Meta Ads, Google Ads (all read) | A status note only |

## Email send preflight (run before any list send)

Lane 0 produces fan email copy. Before the artist sends it to a list, check
these mailbox-provider rules. They apply by volume, and a small list today can
cross the line on release day.

| Check | Gmail | Yahoo | Outlook.com / Hotmail / Live |
|---|---|---|---|
| Who it applies to | Close to 5,000+ messages a day to personal Gmail; bulk status is permanent | Bulk senders | More than 5,000 messages a day |
| SPF and DKIM | Both required | Both required | Both must pass |
| DMARC | Published, at least `p=none`, From aligned with SPF or DKIM | At least `p=none`, must pass, aligned | At least `p=none`, aligned with SPF or DKIM |
| One-click unsubscribe | RFC 8058 List-Unsubscribe header for marketing mail | One-click List-Unsubscribe header plus a visible link in the body | Working, easy-to-find unsubscribe recommended |
| Honor unsubscribes | Within 48 hours | Within 2 days | |
| Spam complaint rate | Keep under 0.1%; never reach 0.3% | Keep under 0.3% | |
| Enforcement | Since Feb 2024; rejections of non-compliant traffic ramped up in Nov 2025 | In effect | Since May 5, 2025; non-compliant mail can be rejected with `550; 5.7.515 Access denied` |

Sources: https://support.google.com/a/answer/14229414,
https://senders.yahooinc.com/best-practices/,
https://techcommunity.microsoft.com/blog/outlook/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730

Preflight output for the Lane 0 package:

```text
Sending domain and platform:
SPF / DKIM / DMARC status (checked by: user / platform dashboard / UNKNOWN):
One-click unsubscribe header present:
List source and consent (opt-in date range):
Expected peak daily volume on release day:
Spam rate last 30 days (Postmaster Tools / platform):
Send owner and approval:
```

Mark any line the user has not confirmed as UNKNOWN. Do not mark authentication
as passing from inference. The send itself stays with the human.
