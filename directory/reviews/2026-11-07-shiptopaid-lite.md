# ShipToPaid Lite: scoped editorial feature

Submission: [issue #344](https://github.com/JasonColapietro/suede-creator-skills/issues/344). Reviewed source: [`shiptopaid/shiptopaid-lite@b508f878086491518709a2d17761821abfd4b084`](https://github.com/shiptopaid/shiptopaid-lite/tree/b508f878086491518709a2d17761821abfd4b084), the default-branch snapshot read on November 7, 2026.

## Accepted editorial scope

The three instruction-based skills under `skills/`: `polar-checkout`, `polar-webhooks` and `launch-audit-lite`. They guide Polar subscription checkout, signed webhook processing and pre-launch checks in an existing Next.js App Router application. The separately sold ShipToPaid pack, its eleven-skill scope, starter and Stripe support are outside this feature.

The root [MIT license](https://github.com/shiptopaid/shiptopaid-lite/blob/b508f878086491518709a2d17761821abfd4b084/LICENSE), copyright 2026 ShipToPaid, covers this source. All three SKILL.md frontmatter records parse, declare matching names, and have descriptions within the Agent Skills length limit. The source inventory and SHA-256 hashes are retained in [the intake evidence](../intake/2026-11-07-newest-applicants.json).

## Setup and data use

Use Node.js 22+ and a Polar sandbox organization. Examples use Next.js 15, TypeScript, Better Auth and PostgreSQL/Drizzle; adapt to the existing application's authentication and database. The instructions target a versioned Polar SDK and require checking the installed exports and API version rather than assuming interchangeable payloads.

Applying these instructions creates billing code and may create products, checkouts, webhook endpoints and database migrations in the user's own systems. Polar receives the customer's email, external user ID and checkout metadata. The instructions keep tokens server-side, verify the raw webhook body, atomically record delivery IDs with entitlement updates, allowlist products, and compare subscription timestamps. Entitlement storage assumes one subscription per user; multiple subscriptions need explicit reconciliation. Use an email address you control for sandbox checkout tests rather than the example address.

The launch checklist includes production configuration and a restricted 100% discount-code test. This feature performs none of those account actions or transactions and supplies no authorization to do them. Real sandbox delivery and payment behavior still need application-specific verification.

## Review method and outcome

The README, license and three SKILL.md files were read as data from a pinned shallow clone. Metadata and file hashes were checked independently. No submitted code was executed, no package was installed from this project, no credential was used and no payment was attempted. This editorial review is not a security certification or a runtime test.

Accepted for an editorial feature at `/featured/#shiptopaid-lite` with a featured README badge. This does not admit new scored-catalog records, assign scores or grades, verify a publisher's installed badge, or change any security status. The directory's existing score, license and promotion-verification safeguards remain unchanged.
