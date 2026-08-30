# Founder-led content loop

Use this mode when a founder interview, voice note, or operator debrief is the
recurring source, or when personal and company accounts need different editorial
jobs. It extends the newsroom pipeline; it does not replace the six role
contracts, campaign record, evidence gates, entryways, approval boundary, or
Keep/Test/Stop review in `SKILL.md`.

## Contents

1. [Mode contract](#mode-contract)
2. [Founder intake](#founder-intake)
3. [Weekly operating rhythm](#weekly-operating-rhythm)
4. [Account lanes](#account-lanes)
5. [Distribution and collision rules](#distribution-and-collision-rules)
6. [Measurement](#measurement)
7. [Routing boundaries](#routing-boundaries)
8. [Pilot size](#pilot-size)
9. [Output contract](#output-contract)

## Mode contract

The founder supplies judgment, firsthand observations, decisions, language, and
proof leads. The newsroom turns that material into an evidence-backed campaign.
The founder is a source of experience, not automatic verification for a factual
claim.

Complete the mode setup when these fields are written:

```text
setup path:           .agents/newsroom/founder-loop.md
primary outcome:       the business or reputation action the loop should create
founder voice:         who speaks and which account represents that person
company proof lane:    which account represents the company or product
durable themes:        supplied upstream; 3-5 only when strategy supports that range
weekly source:         interview | voice note | operator debrief
capture window:        duration and owner
approval owner:        person who approves angle, claims, copy, account, and media
measurement window:    when the performance record becomes reviewable
capacity:              maximum campaigns and public assets the human can review
```

Write those fields to `.agents/newsroom/founder-loop.md`. Each campaign record
points to that file through `mode-setup-path`, so a restart never asks the next
role to reconstruct an identity, owner, capacity, or outcome from conversation.
Update the setup file only after the human approves the changed field.

Carry supplied values exactly. Write `open` for a missing duration, identity,
measurement window, or capacity. A pilot may recommend a starting test only
after the open value is shown; the recommendation stays labelled `proposed` and
does not become the operating rule without human approval.

An empty primary outcome, approval owner, or account lane halts setup. Ask for
the missing field; do not choose a public identity or success measure by
inference.

## Founder intake

Create the `Founder intake` section in the campaign record before the signal
stage. Store the source beside the record and write its path into `source-path`.
The record carries extracted decisions; it does not carry a full transcript.

Capture these prompts in the founder's natural words:

1. What happened, changed, broke, or became clearer this week?
2. Which decision did you make, and what tradeoff drove it?
3. What have you observed firsthand?
4. What is the industry getting wrong or leaving unexplained?
5. What could a stranger inspect: source, screenshot, demo, dataset, workflow,
   result, or before-and-after?
6. Which statement still needs verification?
7. Which phrase, analogy, or opinion sounds unmistakably like you?
8. Which detail is private, off-limits, or too early to publish?

Sort the answers into five buckets:

| Bucket | Meaning | Next owner |
|---|---|---|
| Firsthand observation | what the founder directly saw or did | scout and strategist |
| Decision or lesson | the founder's judgment and reasoning | strategist and writer |
| Voice marker | phrasing, analogy, rhythm, or conviction to preserve | writer and editor |
| Proof lead | an object or source that may support a claim | researcher |
| Claim to verify | a factual statement with consequence | researcher |

`Proof lead` and `claim to verify` remain separate until the researcher supplies
the source, scope, date, and limits. A founder-supplied result, customer outcome,
ranking, percentage, or market claim is not verified because it appears in a
recording.

The intake is complete when every answer appears in one bucket, `off-limits` is
explicit, and the source path resolves to the stored recording or transcript.

## Weekly operating rhythm

This rhythm is a manual editorial playbook. Days are labels the operator may
shift; they are not a scheduler or an instruction to publish.

### 1. Select inputs

Read the durable themes, current conversation evidence, last performance review,
and Stop list. Generate a bounded prompt set for the founder interview. The
prompt set may contain 5-10 questions when the capture window can answer them;
cut it until every question fits the stated window.

The signal scout still returns at most three campaign candidates. A long topic
list is interview preparation, not approval to open ten campaigns.

Complete this stage when every selected question maps to a durable theme, a
current conversation, a customer question, or a prior Test hypothesis.

### 2. Capture founder judgment

Run the interview or ingest the voice note. Fill the Founder intake section and
mark claims that need research. Preserve exact wording only when the recording
supports it; attach a timestamp to any direct quote.

Complete this stage when all intake fields pass the criteria above.

### 3. Run the newsroom

Move the record through signal, research, angle, flagship, distribution, and
review using the existing role contracts. One founder intake can yield several
signal candidates, but each approved campaign gets its own record and exactly
one recommended angle.

Complete this stage when the editor returns an approval-ready package or the
record is halted at the field that blocks it.

### 4. Release through the human boundary

Present final copy, supporting source, media, target account, visible identity,
and the exact decision required. The newsroom publishes and schedules nothing.

Complete this stage when the human has approved or rejected every public asset;
an unanswered item remains pending.

### 5. Learn

After the measurement window closes, update the campaign performance section
and run Keep/Test/Stop. One result remains a Test. The human approves any
standing-rule change.

Complete this stage when every proposal names its supporting campaigns and the
approval state is recorded.

## Account lanes

The accounts share evidence and positioning. They do not share a central claim,
opening, or shortened version of the same draft.

### Founder recognition lane

The founder account makes the operator's judgment recognizable. Its asset should
teach one of these:

- a mechanism the founder can explain from experience;
- a workflow or decision rule another operator can use;
- a risk and the condition that triggers it;
- a critique supported by evidence;
- a lesson from a named decision or failure.

The asset is complete when the reader can name what the founder believes or does
differently and the packet supports every consequential claim.

### Company proof lane

The company account makes the work inspectable. Its asset should carry one of
these:

- a proof object a stranger can check;
- a result with scope, conditions, and measurement source;
- a documented workflow or product behavior;
- a compressed diagram or model grounded in the campaign;
- a company update whose relevance does not depend on the founder post.

The asset is complete when it stands alone, names what can be inspected, and
does not ask the reader to trust the founder's authority as proof.

Use only the lanes the user supplied. A solo founder without a company account
can run the recognition lane alone. A company-led campaign without a public
founder can run the proof lane alone.

## Distribution and collision rules

Apply the normal entryway and standalone scoring rules to every asset. Add
`account lane` to each row in the Distribution section:

```text
surface | visible identity | account lane | entryway | central claim |
standalone reason | score | claims used | approval state
```

Reduce the full cross-account set to one sentence per asset, then run claim,
opening, and entryway collision checks. The account name does not make two
colliding assets distinct.

Resolve a collision by assigning an unused supported entryway, cutting the
weaker asset, or recording a deliberate repeat with a reason. Rewording the same
claim does not resolve it.

The set is complete when every asset scores 3, every lane is named, and the
collision field is clean or records the human-approved resolution.

## Measurement

Set the primary outcome before choosing metrics. Record the goal-linked action
first and platform diagnostics second.

| Outcome | Goal-linked actions to consider |
|---|---|
| Qualified inbound | relevant replies, introductions, calls, demos, or inquiries |
| Category recognition | invitations, citations, mentions, or follows from the named audience |
| Product adoption | artifact views, qualified visits, trials, installs, or activated accounts |
| Community depth | substantive replies, repeat contributors, or useful user questions |

Use only measures the platform or connected analytics actually expose. Reach,
likes, and follower count can diagnose distribution; they do not replace the
primary outcome.

Compare by campaign, account lane, entryway, and surface. A Keep needs two or
more campaigns and continued strategy fit. One promising result is a Test. A
Stop requires the thresholds in `SKILL.md` Step 6.

## Routing boundaries

- Pillar discovery, topic ownership, and portfolio allocation belong to
  `suede-content-strategy`. This mode consumes the approved themes.
- Listening, platform mix, calendar design, and surface conventions belong to
  `suede-social`. This mode consumes those inputs and assigns distinct arguments.
- Scheduled execution, state, retries, idempotency, and stop conditions belong
  to `suede-marketing-loops`.
- Analytics instrumentation and attribution belong to `suede-analytics`.
- Cross-platform publishing, scheduling, replies, and other account actions
  route to `suede-social`; Instagram-specific actions route to
  `suede-instagram-growth`. Each still requires approval of exact content and
  visible identity, plus an authorized platform tool.

Route the missing capability; keep the founder intake, account lanes, evidence
record, and editorial gates in this mode.

## Pilot size

Set the pilot count from the capacity field. When capacity is `open`, return a
`proposed` pilot shape without an exact campaign or asset count and wait for the
human to approve the operating limit. The generic newsroom's three-idea
calibration is not a founder-mode capacity default.

The pilot is complete when its approved campaign count has crossed every gate
and each campaign is measured or explicitly `unmeasured`.

## Output contract

Return the installed operating system in this shape:

```text
Mode setup:
Founder intake contract:
Weekly operating rhythm:
Newsroom role map:
Founder recognition lane:
Company proof lane:
Campaign record changes:
Human approval queue:
Measurement and Keep/Test/Stop:
Routed dependencies:
Capacity-sized pilot:
Open fields:
```

The output is complete when every supplied account has one job, every weekly
stage ends on a checkable criterion, the campaign record can carry the founder
intake, and publishing remains outside the newsroom.
