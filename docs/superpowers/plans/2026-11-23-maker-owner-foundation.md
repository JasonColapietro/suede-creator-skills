> Historical foundation design. The implemented workflow and remaining live setup are in [the staging runbook](2026-11-23-maker-staging-runbook.md).

# Maker Owner Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permit a verified maker to propose changes for one featured directory listing for moderator review.

**Architecture:** A server-only service accepts trusted session and repository facts through explicit adapters. A durable store must serialize listing ownership/revision changes; only a separately approved projection is public.

**Tech Stack:** Node ESM, native test runner, repository featured catalog.

**Spec:** Approved Nov 23 scope: GitHub sign-in, all featured projects eligible, initial form blank, current listing read-only, website/socials/statement, moderator review before publication.

- [x] Test exact featured targets, provider and identity isolation, strict profile fields, blank proposals, revision review and stale decisions.
- [x] Implement provider/config seam and atomic persistence contract, without enabling a live route.
- [x] Integrate the focused suite and verify locally.

## Integration contract

- Keep the authenticated console at `/maker/`; guide and walkthrough may use `/maker/guide/` and `/maker/demo/`.
- Instantiate the service only on the Directory host with explicit enablement and properly scoped adapters. Store edits in a private DB, keyed by the stable slug from `directory/featured-projects.json`. Mirror the server-side listing seed; never accept a repository target from an HTTP client.
- `github.user` resolves a server-validated session to the immutable numeric GitHub account ID; it must not trust a browser-supplied ID. `github.repository` resolves the configured exact public repository to trusted GitHub facts and returns its immutable repository and owner IDs. For organizations, add a private moderated claim proof store, keyed by all four binding values and checked on each submission. Do not treat a GitHub sign-in, submitted URL, badge, star, or a name match as proof of organizational control.
- Private durable `store.transact` must use row locking or compare-and-swap with retries, not a read followed by an unrelated write. Its keys/transactions are server-only. Rules for revoked claims, organizational approval revocation, repo transfer, and ownership recovery need explicit durable workflows and adapter integration tests before launch.
- Only the distinct approved projection is eligible to flow into the public static build. Avoid exposing draft/session/moderator records, and never replace editorial ratings, badges, review text, or verified site fields with maker copy. Render maker statements as escaped plain text and maker links as link data only, not URLs for server fetch.
- Live implementation remains gated on actual OAuth security, scoped account setup, durable storage, reviewer queue, public projection renderer, and staging checks with two accounts. This change intentionally deploys no routes or new runtime behavior.

### HTTP runtime slice
Mount `createMakerRuntime` as an exact Node Request/Response handler at `/api/maker` only after a durable adapter exists. Instantiate with explicit exact HTTPS origin (never derived from a request header), a new dedicated least-privilege GitHub OAuth app, and the private owner-service factory. Its flow store must consume entries atomically and purge expired flows and sessions. The cookies contain opaque secrets, session/flow keys in storage are SHA-256 digests, and authorization codes, access tokens, verifier and raw cookies must never be logged; configure hosting logs and telemetry accordingly. No refresh token is persisted. The adapter does not receive any broad GitHub grant; an unexpected token scope fails closed.

Browser contract:
- GET `?action=sign-in&id=<listing>` and `?action=callback` for OAuth; callback returns to `/maker/?id=<listing>`.
- GET `?action=listing&id=<listing>` for editorial listing, blank form and the verified owner's current private revision.
- POST same-origin `?action=claim&id=<listing>` and `?action=submit&id=<listing>`, the latter with the editable profile JSON.
- GET `?action=review-queue&id=<listing>` for one authorized moderator review item; POST `?action=review&id=<listing>` with `{version, decision}`. The global moderator queue remains to be built.
- POST same-origin `?action=logout` invalidates the session.

This patch does not mount a production route. Test the real callback registration and actual GitHub scope response in a dedicated staging environment before enabling.
