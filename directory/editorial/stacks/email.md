# Which agent skills make the best AI email writer for marketing and transactional email?

By [Jason Colapietro](https://suedeai.ai/founder), Founder and CEO of Suede AI. Author of *Stake Your Claim*, *Proof as Infrastructure* and *The Human Authenticity Layer*, holder of the VoicePrint patent, and a builder of companies for two decades.

Reviewed November 3, 2026.

**Short answer:** for an AI email writer that also ships the mail, install [emails](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails) from coreyhaines31/marketingskills (88/100) to plan and write lifecycle sequences, [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) from resend/resend-skills (84/100) to send transactional email with idempotency keys and verified webhooks, and [react-email](https://skills.suedeai.ai/directory/resend/resend-skills/react-email/) (83/100) to build the HTML templates as React components. Add agent-email-inbox when inbound email triggers actions, converting-email-templates when you migrate templates to Mailtrap, and courier when email is one channel among SMS, push and Slack.

## The stack

Six skills, in score order. Scores come from the directory snapshot of October 22, 2026, and install counts are the figures skills.sh published on November 2, 2026.

| Skill | Repository | Score | What it does |
| --- | --- | --- | --- |
| [emails](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | Creates and optimizes email sequences, drip campaigns, automated flows and lifecycle email programs, without AI tells or fake "Re:" subject lines. |
| [agent-email-inbox](https://skills.suedeai.ai/directory/resend/resend-skills/agent-email-inbox/) | [resend/resend-skills](https://github.com/resend/resend-skills) | 86/100 | Guides building email-triggered systems like AI agent inboxes, using sender allowlists, content filtering and sandboxed processing to keep untrusted email from controlling the system. |
| [converting-email-templates](https://skills.suedeai.ai/directory/mailtrap/mailtrap-skills/converting-email-templates/) | [mailtrap/mailtrap-skills](https://github.com/mailtrap/mailtrap-skills) | 85/100 | Converts email templates from providers such as SendGrid, Mailgun, Postmark and Amazon SES into Mailtrap-compatible Handlebars syntax, singly or in bulk. |
| [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) | [resend/resend-skills](https://github.com/resend/resend-skills) | 84/100 | Guides work with the Resend email API, including sending transactional emails, inbound webhooks, templates, delivery tracking, domains, contacts, broadcasts and API keys. |
| [react-email](https://skills.suedeai.ai/directory/resend/resend-skills/react-email/) | [resend/resend-skills](https://github.com/resend/resend-skills) | 83/100 | Guides building HTML email templates with React components, rendering them to HTML, adding the visual email editor, and sending with Resend. |
| [courier](https://skills.suedeai.ai/directory/trycourier/courier-skills/courier/) | [trycourier/courier-skills](https://github.com/trycourier/courier-skills) | 83/100 | Guides building notifications with Courier across email, SMS, push, in-app inbox, Slack, Teams and WhatsApp, including templates, translations, journeys, routing and MCP. |

## Who this stack is for

This stack is for anyone who has to get email right on both sides of the product: what it says and whether it arrives. A founder adding a welcome sequence, a lifecycle marketer planning nurture and re-engagement flows, a developer wiring password resets and order confirmations, a team building an AI agent that reads its own inbox, an engineer moving templates off one provider: each has a skill here.

The split is deliberate. [emails](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails) writes the sequences. [react-email](https://skills.suedeai.ai/directory/resend/resend-skills/react-email/) turns them into templates. [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) sends them and receives replies. [agent-email-inbox](https://skills.suedeai.ai/directory/resend/resend-skills/agent-email-inbox/) handles inbound mail that triggers actions. [converting-email-templates](https://skills.suedeai.ai/directory/mailtrap/mailtrap-skills/converting-email-templates/) and [courier](https://skills.suedeai.ai/directory/trycourier/courier-skills/courier/) cover migration and multichannel delivery.

If you searched for an AI email writer, emails is the writing half, and it bans the tells that make generated email obvious. The rest of the stack is the half most writing tools skip: rendering, sending, receiving and debugging. A Claude email workflow that stops at the draft still leaves the sending to someone else.

All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md.

## The Suede AI skill built for this job

I built [suede-emails](https://skills.suedeai.ai/directory/jasoncolapietro/suede-creator-skills/#suede-emails) for exactly this job: designing lifecycle email flows that are ready to build. Ask it to "build a welcome email sequence," or to design a nurture, onboarding, win-back, post-purchase or trigger-based flow, and it returns the entry and exit criteria for each flow, the timing between sends, the exact copy, sender-rule checks and a measurement plan. Every flow comes back with who enters it, who leaves it, when each message goes out and what it says.

Start with it before you write a template or a line of sending code. It owns the flow design, and that makes the stack below work harder. [react-email](https://skills.suedeai.ai/directory/resend/resend-skills/react-email/) gets exact copy to place into components instead of placeholder text. [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) and [courier](https://skills.suedeai.ai/directory/trycourier/courier-skills/courier/) get timing and triggers to wire into sends and automations. [emails](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails) gets a finished spec to extend when the next sequence comes along, and the measurement plan says what to read once mail goes out. Cold outbound, SMS, in-product onboarding and broader lifecycle operations go to other skills, so it stays on lifecycle email.

It is Suede AI's skill, so it stays out of the ranking below. Install it first:

```bash
npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/skills/suede-emails
```

## The skills, one by one

### emails: the AI email writer for lifecycle sequences

[emails](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails) from coreyhaines31/marketingskills creates and optimizes email sequences, drip campaigns, automated email flows and lifecycle email programs. It is the top-scoring pick at 88/100 (grade B), MIT licensed, with about 82,000 installs recorded by skills.sh.

Its triggers cover the whole lifecycle vocabulary: nurture sequence, onboarding emails, welcome series, re-engagement emails, trigger-based emails, email funnel, email cadence, and the plain question "what emails should I send." It applies to any multi-email automated flow.

The description sets rules for the copy itself. Emails avoid "it's not X, it's Y" reveals, "no X, no Y, no Z" lists and fake "Re:" subject lines. I agree with that last rule: a fake reply subject trades the reader's trust for one open.

It also draws clear boundaries. Cold outreach and outbound sequences go to a sibling [cold-email](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/cold-email/) skill, and in-app onboarding goes to onboarding. The directory has no full page for emails yet, so its files are not summarized here; read its SKILL.md before you plan a full program with it.

Use it to decide what to send, when and why, and to write it. It does not send anything; that is what [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) and [courier](https://skills.suedeai.ai/directory/trycourier/courier-skills/courier/) are for.

Start with the flow, not one email:

```text
Plan a 5-email welcome sequence for new trial users of our scheduling app: trigger, timing, goal and subject line for each email, then write email 1 in full.
```

### agent-email-inbox: inbound email that triggers actions

[agent-email-inbox](https://skills.suedeai.ai/directory/resend/resend-skills/agent-email-inbox/) guides building any system where email content triggers actions: AI agent inboxes, automated support handlers, email-to-task pipelines, or any workflow that processes untrusted inbound email. It is an official skill from resend/resend-skills, scores 86/100 (grade B), is MIT licensed, and has about 14,000 installs recorded by skills.sh.

Its core is a set of security patterns, sender allowlists, content filtering and sandboxed processing, meant to keep untrusted email from controlling your system. The SKILL.md explains why it receives through webhooks, lays out the architecture and SDK version requirements, and walks through account and API key setup, including creating keys and their permissions. Domain setup offers two options: receiving on the domain, which it recommends, or forwarding. Security comes in levels, with a strict allowlist as the recommended level 1.

The files bundle no scripts. They document RESEND_API_KEY and RESEND_WEBHOOK_SECRET, and references cover advanced patterns, security levels and webhook setup.

Use it whenever email arrives and something acts on it, even if nobody calls it an agent. Skip it for outbound-only email.

Start from the strictest setting:

```text
Set up an inbox at support@example.com that turns emails from our three customer domains into Linear tasks. Use a strict sender allowlist and verify every webhook.
```

### converting-email-templates: moving templates to Mailtrap

[converting-email-templates](https://skills.suedeai.ai/directory/mailtrap/mailtrap-skills/converting-email-templates/) converts or migrates email templates from SendGrid, Mailgun, Mandrill, Postmark, Brevo or Amazon SES to Mailtrap-compatible Handlebars syntax. It handles a single file, a bulk directory or inline HTML. It is an official skill from mailtrap/mailtrap-skills, scores 85/100 (grade B), is MIT licensed, and has fewer than 1,000 installs recorded by skills.sh.

The SKILL.md is a five-step workflow: detect the mode, run the converter script, handle flags in deep mode, present the results, and a reminder about API field mapping. Inline conversion without a file and a set of rules round it out.

The files are concrete. They bundle 1 Python script, converter.py, with conversion rules, a migration guide, and test inputs with expected outputs for Brevo, Mandrill merge tags, Postmark and SendGrid templates. They make no network calls and read no environment variables.

Use it only when you are moving to Mailtrap. It is a narrow skill with a clear job, and it has nothing to offer if you are staying on your current provider or moving somewhere else.

Point it at the folder:

```text
Convert every SendGrid template in ./emails/templates to Mailtrap Handlebars syntax, flag anything the converter cannot map, and remind me which API fields change.
```

### resend: sending transactional email through the Resend API

[resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) guides work with the Resend email API: sending transactional emails singly or in batch, receiving inbound email through webhooks, templates, delivery events, domains, contacts, broadcasts, webhooks, API keys, inboxes, automations, API request logs, and account usage and quotas. It is an official skill from resend/resend-skills, scores 84/100 (grade B), is MIT licensed, and has about 24,000 installs recorded by skills.sh, the most of the Resend skills here.

Its description says it carries critical gotchas: idempotency keys, webhook verification and template variable syntax. The SKILL.md has quick-send sections for Node.js and Python, a single-versus-batch decision, a section titled "Idempotency Keys (Critical for Retries)," quick receive for Node.js, SDK version requirements, common setup, and common mistakes. Cross-cutting sections cover sending and receiving together, an AI agent inbox, marketing emails and domain warm-up.

The files bundle 1 JavaScript script, a helper that fetches all templates. They read RESEND_API_KEY and document RESEND_WEBHOOK_SECRET.

Use it whenever Resend is your provider, even for a one-line send; its description says so. Read the idempotency section before you write any retry logic.

Ask for the production version, not the demo:

```text
Add order confirmation emails to our Node checkout using Resend. Use an idempotency key per order, batch sends for bulk updates, and verify the delivery webhook.
```

### react-email: HTML email templates as React components

[react-email](https://skills.suedeai.ai/directory/resend/resend-skills/react-email/) guides building HTML email templates with React components, adding the React Email visual editor to an application, rendering emails to HTML, and sending with Resend. It covers welcome emails, password resets, notifications, order confirmations, newsletters and other transactional email. It is an official skill from resend/resend-skills, scores 83/100 (grade B), is MIT licensed, and has about 13,000 installs recorded by skills.sh.

The SKILL.md covers installation, including adding to an existing project, a basic template, behavioral guidelines, essential components, and what to settle before writing code. It handles static files and images, with separate dev and production URLs, and styling, with key rules, required classes and structure notes. Rendering converts to HTML and to plain text. References cover components, the editor, internationalization, patterns, sending and styling.

It bundles no scripts. It runs npx and npm install, and it documents RESEND_API_KEY for sending.

Use it whenever your app sends templated email and your team writes React. If you send through another provider, expect to adapt the sending guidance, which is written for Resend.

Give it a real template to build:

```text
Build a password reset email with React Email: logo, one-paragraph message, a reset button, and a plain-text version. Use production image URLs and render it to HTML.
```

### courier: email as one channel among many

[courier](https://skills.suedeai.ai/directory/trycourier/courier-skills/courier/) guides building notifications with Courier across email, SMS, push, in-app inbox, Slack, Teams and WhatsApp: sends, templates, translations, email client previews, Elemental, journeys, preferences, routing, CLI and MCP. It is an official skill from trycourier/courier-skills, scores 83/100 (grade B), is MIT licensed, and has fewer than 1,000 installs recorded by skills.sh.

The SKILL.md starts with the model, then how to use the skill, addressing a send, the canonical SDK shape (common operations and writing a user profile), and universal rules. Two sections earn their place in any notification system: "Debugging a Delivery Failure" and "Verifying Against Live Sources." Channel references cover email, the in-app inbox, Microsoft Teams, push, Slack, SMS and WhatsApp, and guides cover audiences, batching, brands and bulk sends.

It bundles no scripts and documents COURIER_API_KEY. Its scope also includes translations, email client previews, Elemental and journeys, which matter once notifications go out in more than one language.

Use it when a user should get the message on whichever channel they prefer, with email as one option. If email is your only channel, [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) is the simpler fit.

Describe the routing you want:

```text
Send a "payment failed" notification through Courier: email first, push if the email bounces, and respect each user's channel preferences. Show me how to debug a failed delivery.
```

## How to use the stack together

1. Plan the program with [**emails**](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails). Decide which flows you need, the trigger and timing for each, and write the copy without AI tells or fake reply subjects.
2. Build each message as a template with [**react-email**](https://skills.suedeai.ai/directory/resend/resend-skills/react-email/). Render to HTML and plain text, and settle image URLs for dev and production before launch.
3. If you are migrating to Mailtrap, convert the old templates with [**converting-email-templates**](https://skills.suedeai.ai/directory/mailtrap/mailtrap-skills/converting-email-templates/) instead of rebuilding them by hand. Check the API field mapping it reminds you about.
4. Wire sending with [**resend**](https://skills.suedeai.ai/directory/resend/resend-skills/resend/). Decide single or batch, add an idempotency key to every send that can retry, and verify webhooks.
5. If replies or inbound mail trigger actions, build the receiving side with [**agent-email-inbox**](https://skills.suedeai.ai/directory/resend/resend-skills/agent-email-inbox/). Start at the strict allowlist level and loosen it only with a reason.
6. When the message should reach people on SMS, push or Slack too, route it through [**courier**](https://skills.suedeai.ai/directory/trycourier/courier-skills/courier/) with user preferences and journeys.
7. Watch delivery after launch. Use the delivery events and request logs from **resend**, or the delivery-failure debugging section in **courier**, and send weak flows back to **emails** for a rewrite.

## Install the stack

```bash
npx skills add https://github.com/coreyhaines31/marketingskills/tree/main/skills/emails
npx skills add https://github.com/resend/resend-skills/tree/main/skills/agent-email-inbox
npx skills add https://github.com/mailtrap/mailtrap-skills/tree/main/skills/converting-email-templates
npx skills add https://github.com/resend/resend-skills/tree/main/skills/resend
npx skills add https://github.com/resend/resend-skills/tree/main/skills/react-email
npx skills add https://github.com/trycourier/courier-skills/tree/main/skills/courier
```

The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's page in the directory lists the copy-by-hand routes if you would rather not run npx.

## Alternatives worth knowing

| Skill | Repository | Score | Swap in when |
| --- | --- | --- | --- |
| [cold-email](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/cold-email/) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88/100 | The email is B2B cold outbound, not lifecycle: follow-ups, sending setup, cadences and reply handling. |
| [email-best-practices](https://skills.suedeai.ai/directory/resend/resend-skills/email-best-practices/) | [resend/resend-skills](https://github.com/resend/resend-skills) | 80/100 | Mail is going to spam or bouncing, or you need SPF, DKIM and DMARC, CAN-SPAM, GDPR and CASL compliance, or accessible email. |
| [resend-cli](https://skills.suedeai.ai/directory/resend/resend-skills/resend-cli/) | [resend/resend-skills](https://github.com/resend/resend-skills) | 83/100 | You want to run Resend from the terminal, scripts or CI/CD, including sending React Email .tsx templates. |
| [setting-up-sending-domain](https://skills.suedeai.ai/directory/mailtrap/mailtrap-skills/setting-up-sending-domain/) | [mailtrap/mailtrap-skills](https://github.com/mailtrap/mailtrap-skills) | 80/100 | You are on Mailtrap and need a sending domain added and verified, including DNS provider steps and click tracking. |
| [gmail](https://skills.suedeai.ai/directory/sanjay3290/ai-skills/#gmail) | [sanjay3290/ai-skills](https://github.com/sanjay3290/ai-skills) | 83/100 | The job is your own inbox: searching, reading, drafting and sending from Gmail, not product email. |

How I choose: the picks build product email, and the alternatives cover the problems around it. cold-email replaces [emails](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails) when the reader never signed up, and email-best-practices joins [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) once deliverability becomes the problem.

## Common mistakes

- Retrying sends without idempotency keys. [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) treats them as critical for retries.
- Letting any sender drive an agent. [agent-email-inbox](https://skills.suedeai.ai/directory/resend/resend-skills/agent-email-inbox/) starts from a strict allowlist and sandboxed processing.
- Fake "Re:" subject lines. [emails](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails) rules them out along with other AI tells.
- Shipping HTML without a plain-text version. [react-email](https://skills.suedeai.ai/directory/resend/resend-skills/react-email/) renders both.
- Dev image URLs in production email. react-email separates dev and production URLs for static files.
- Rebuilding templates by hand during a migration. [converting-email-templates](https://skills.suedeai.ai/directory/mailtrap/mailtrap-skills/converting-email-templates/) converts single files, folders or inline HTML.
- Mixing cold outbound into lifecycle flows. emails routes cold outreach to a separate skill for a reason.

## Licenses, costs and checks before you install

Licenses: all six picks are MIT: [emails](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails), [agent-email-inbox](https://skills.suedeai.ai/directory/resend/resend-skills/agent-email-inbox/), [converting-email-templates](https://skills.suedeai.ai/directory/mailtrap/mailtrap-skills/converting-email-templates/), [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/), [react-email](https://skills.suedeai.ai/directory/resend/resend-skills/react-email/) and [courier](https://skills.suedeai.ai/directory/trycourier/courier-skills/courier/).

Services and credentials: four of the six work against an email provider account. resend reads RESEND_API_KEY and documents RESEND_WEBHOOK_SECRET; agent-email-inbox documents both; react-email documents RESEND_API_KEY and runs npx and npm install; courier documents COURIER_API_KEY. converting-email-templates runs one local Python script with no network calls, and its output is Mailtrap-compatible Handlebars. emails' files are not summarized by the directory. Check each provider's own pricing before you send at volume.

The directory has not security scanned any listed skill, as the [trust page](https://skills.suedeai.ai/directory/trust/) explains. Read each SKILL.md before you enable it, give each API key the narrowest permissions it needs, and keep keys out of the repository.

## Related topics and stacks

The [Email](https://skills.suedeai.ai/directory/topics/email/) topic lists 36 skills, [Transactional Email](https://skills.suedeai.ai/directory/topics/email-sending/) 11, [Marketing Automation](https://skills.suedeai.ai/directory/topics/marketing-automation/) 8 and [Newsletters](https://skills.suedeai.ai/directory/topics/newsletters/) 6, and [React and Next.js](https://skills.suedeai.ai/directory/topics/react-nextjs/) (30) covers the template side. The [Marketing and SEO](https://skills.suedeai.ai/directory/marketing-seo/) category has the rest.

Pair this stack with the [copywriting stack](https://skills.suedeai.ai/directory/stacks/copywriting/) for the words, the [landing page stack](https://skills.suedeai.ai/directory/stacks/landing-page/) for where signups come from, and the [sales prospecting stack](https://skills.suedeai.ai/directory/stacks/sales-prospecting/) when the email is outbound.

## FAQ

### What is the best AI email writer for Claude Code?

As an agent skill, [emails](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails) from coreyhaines31/marketingskills (88/100). It plans and writes email sequences, drip campaigns and lifecycle flows, and its description rules out AI tells such as "it's not X, it's Y" reveals and fake "Re:" subject lines. For cold outbound, use [cold-email](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/cold-email/) from the same repository instead.

### Which skill should I use for AI email marketing sequences?

[emails](https://skills.suedeai.ai/directory/coreyhaines31/marketingskills/#emails), for welcome series, nurture, onboarding, re-engagement and any trigger-based flow. It has about 82,000 installs recorded by skills.sh. Pair it with [react-email](https://skills.suedeai.ai/directory/resend/resend-skills/react-email/) to build the templates and [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) to send them, so the sequence leaves the draft stage.

### Can Claude Code send transactional email?

Yes, with a provider skill. [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/) from resend/resend-skills (84/100) guides sending single and batch email through the Resend API, with idempotency keys, webhook verification and delivery tracking. It reads a RESEND_API_KEY. For multichannel notifications, [courier](https://skills.suedeai.ai/directory/trycourier/courier-skills/courier/) covers email alongside SMS, push and Slack.

### How should an AI agent handle inbound email?

As untrusted input. [agent-email-inbox](https://skills.suedeai.ai/directory/resend/resend-skills/agent-email-inbox/) from resend/resend-skills (86/100) guides building email-triggered systems with sender allowlists, content filtering and sandboxed processing, and it recommends a strict allowlist as the starting level. It receives through webhooks and documents RESEND_API_KEY and RESEND_WEBHOOK_SECRET.

### Do these email skills work in Codex and Cursor?

Yes. All six use the [Agent Skills](https://agentskills.io/) format, so the same folder works in Claude Code, Codex, Cursor and any other agent that reads a SKILL.md. The skills CLI installs for each of them, and every skill page in the directory shows the commands.

### Are these email skills free?

All six are MIT licensed. The providers they work with are separate accounts: [resend](https://skills.suedeai.ai/directory/resend/resend-skills/resend/), [react-email](https://skills.suedeai.ai/directory/resend/resend-skills/react-email/) and [agent-email-inbox](https://skills.suedeai.ai/directory/resend/resend-skills/agent-email-inbox/) work with Resend and its API key, [courier](https://skills.suedeai.ai/directory/trycourier/courier-skills/courier/) with a Courier API key, and [converting-email-templates](https://skills.suedeai.ai/directory/mailtrap/mailtrap-skills/converting-email-templates/) targets Mailtrap. Check each provider's pricing before you send at volume.

### How do I install the email stack in Claude Code?

Run the six `npx skills add` commands in the install section above, one per skill. The [skills CLI](https://skills.sh/) installs for Claude Code, Codex, Cursor and other agents, and each skill's directory page lists copy-by-hand routes. Set your provider API keys as environment variables before the first send.
