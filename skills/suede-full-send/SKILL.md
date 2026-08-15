---
name: suede-full-send
description: "Suede Labs AI full-send router for outcome-bound work. Use for full send, max effort, max agents, max agent teams, spare no compute, throw tokens at it, burn tokens, burn max tokens, \"never end your allocation above zero,\" strongest useful reasoning, adversarial review, fix everything, do not stop, or end-to-end completion. Select one controller, fill useful non-colliding lanes, and close with concise proof. Token and allocation language, including the house line, is a dry joke about already-authorized host compute, never a literal counter, external spend, or permission to pad output. Explicit Full Send still routes atomic work to one specialist with no parallel lanes. NOT FOR: padding, filler, duplicate lanes, hidden-reasoning dumps, unauthorized spend, or unauthorized high-impact mutation; planning, audit, review, diagnosis, and verification stay non-mutating unless implementation is separately authorized."
---

# Suede Full Send

Turn maximum-effort language into one finished, authorized outcome.

Use depth where uncertainty is expensive. Use parallel capacity where the work
really splits. Keep the user's attention for decisions only they can make.

House line: **"Never end your allocation above zero."**

Use it once, dryly, then return to business. It is not a measurable completion
condition, permission to pad output, or a claim that an agent can see or
control a hidden host counter.

This skill is a policy router. It does not change model limits, expose hidden
reasoning, create external spending authority, or replace the selected
controller's own workflow.

## The Standard

Bring the user a decision, not a workshop.

1. Lead with the recommended course.
2. Execute routine, reversible, in-scope decisions without returning them as
   homework.
3. Ask only when the answer changes the desired outcome, grants new authority,
   crosses a serious risk boundary, or chooses between materially different
   irreversible results.
4. Put the strongest useful reasoning on consequential calls.
5. Report technical detail as consequence, proof, and the next move.
6. Keep progress updates brief. Do not narrate token use, lane chatter, or
   methodology unless asked.

Write with restraint and command. Use exact nouns and verbs. Avoid hype, faux
luxury, guru language, exclamation points, emoji confetti, and process theater.
Do not imitate a television character. The register is composed operator, not
costumed role-play.

## Freeze The Mission

Before mutation, establish this transient record. Keep it in the controller's
working context unless the project already prescribes a durable handoff:

```text
FULL_SEND_MISSION:
objective=<one user-visible outcome>
targets=<repos-folders-routes-urls-docs-platforms-or-accounts>
required_surfaces=<surfaces necessary to prove the outcome>
candidate_surfaces=<safe read-only surfaces that may matter>
excluded_surfaces=<adjacent work outside the request>
authorized_read_surfaces=<relevant public-private-or authenticated sources already in scope>
authorized_actions=<actions tied to exact targets>
unauthorized_actions=<external mutations not granted; infer none>
working_premises=<user facts accepted for this run>
source_truth=<current files-live surfaces-platform records-or source docs>
protected_wip=<dirty files-branches-and people not to disturb>
sensitive_source_rules=<redaction-and minimum-necessary handling for secrets-personal data-and private content>
controller=<one workflow owner>
controller_state_ref=<team contract-brief set-lane plan-or specialist state>
incremental_external_spend_cap=<0 unless category and maximum are explicit>
done_signals=<commands-readbacks-screenshots-urls-or platform states>
risk_halts=<data loss-security-privacy-legal-payment-or irreversible impact>
handoff_surface=<project-prescribed location or none>
```

Treat "everything" as every required surface for the stated objective. Safe
read-only discovery may add candidate surfaces; it does not silently expand
mutation authority.

"Full send," "fix everything," and "do not stop" increase persistence and
coverage. They do not authorize purchases, paid APIs, cloud spend, deletion,
publishing, third-party messages, credential handling, access changes, or
irreversible external actions that were not already in scope.

The incremental external spend cap is zero until the user names the category
and maximum amount. "Authorized host compute" means the included in-session
model and agent capacity available under the host's existing controls. It does
not include separately billed APIs or tools, credit purchases, quota increases,
cloud jobs, or other metered work. Included host capacity may be used
aggressively when it buys speed, coverage, independent confidence, or less user
attention.

Read authenticated or private sources only when the target is relevant and the
user already has access authority. Use the minimum necessary content. Never
put secrets, personal data, temporary credentials, or unnecessary private
material into worker briefs, widgets, logs, public artifacts, or final reports.

Treat the user's stated intent, decisions, ownership, firsthand facts, and
direction as working premises unless verification is requested or current
truth is needed to operate the target. Do not re-litigate those premises. A
premise is not proof that code passed, a deployment is live, a payment
settled, a legal right exists, or a published statement was independently
verified.

## Select One Controller

Choose exactly one:

| Work shape | Controller |
| --- | --- |
| Broad work with multiple judgment, implementation, or verification lanes | `suede-agent-teams` |
| A multi-file or multi-surface change to one repo, built and reviewed as one DAG | `suede-ship` |
| High-volume independent units that need worker briefs and review | `suede-codex-fleet` |
| One contained outcome with no useful split | the smallest relevant public Suede specialist |

If a batch is one lane inside a broader product or release job,
`suede-agent-teams` remains the controller and `suede-codex-fleet` is
subordinate. Never assign the same units to both.

Do not run two controllers, two plans, or two progress stores for one mission.
The selected controller owns decomposition, lane maps, file ownership, agent
roster, retries, fix loops, reconciliation, and handoff.

## Maximum Useful Effort

Pass these operating instructions to the controller:

1. Front-load safe read-only exploration when ambiguity could cause rework.
2. Fill every useful non-colliding lane, then refill capacity while
   independent work remains.
3. Name the model on every dispatch. A lane that is not given a model inherits
   the session model, which is how an unpriced fan-out happens. Before the
   first dispatch, state a numeric roster cap — at most 4 concurrent agents
   unless the user names both a larger cap and the model to run it on — and
   state the rough consumption the run will incur. At the cap, escalate to the
   user or decompose the remaining work into a later wave; never grind more
   lanes against the same signal.
4. Give each lane a bounded artifact that can change a done signal, decision,
   risk, required-surface map, or critical-path duration.
5. Use the strongest reasoning on irreversible, security-sensitive,
   architectural, published-statement, and release decisions.
6. Independently reproduce consequential proof with a different method,
   evidence source, failure lens, or acceptance criterion.
7. For public, production, security, payment, migration, or release work, keep
   the builder and adversarial reviewer separate.
8. Reject duplicate prose, ceremonial votes, filler agents, and semantically
   identical lanes.

Negative evidence is useful. More words are not.

Every worker result is provisional. The controller must inspect the actual
artifact, diff, command output, or live behavior and mark it `accepted`,
`rejected`, or `fix brief`. A worker's final message never closes the mission.

## Reconciliation Loop

1. Inspect exact targets, current source truth, dirty work, authority, and live
   behavior before editing.
2. Run the selected controller with the mission record and maximum-useful-
   effort instructions.
3. Collect bounded artifacts and direct evidence.
4. Merge duplicate findings and resolve contradictions against current source
   truth.
5. Collect the round's supported failures into one fix brief per controller.
   One brief per round, not one dispatch per finding.
6. Re-run the smallest check that can prove the fix, then the relevant
   regression or release gate.
7. Repeat only while a named authorized action targets a specific unresolved
   signal and has a plausible material effect. Cap it at three genuinely
   different fixes per unresolved signal: each attempt must change the
   diagnosis or the strategy, never rerun the last one. Stop early when the
   same root cause repeats across attempts. At the cap, report the repeating
   cause and either escalate with `FULL_SEND_BLOCKER` or decompose the signal
   into smaller checks; never grind a fourth attempt at the same diagnosis.

For code, plugin, MCP, docs, or public-site work, dispatch the review lanes
named in Routing below, and keep the builder and the adversarial reviewer
separate.

Checks are evidence and recommendations. They do not silently cancel an
authorized action. Pause before a specific step only when it presents serious
risk of data loss, credential or privacy exposure, legal or rights violation,
payment error, or irreversible public damage. Continue unrelated authorized
work when possible.

## Proof Standard

Match every completion claim to current evidence:

- changed code -> inspect the diff and run the relevant build, test, lint, or
  focused behavior check;
- plugin or skill -> validate manifests, discovery metadata, install paths, and
  a fresh invocation;
- MCP -> exercise JSON-RPC initialization plus current tools, resources,
  prompts, and catalog output;
- public page -> inspect the built or live URL at the relevant desktop and
  mobile states;
- deployment -> verify the exact production domain and intended route;
- external platform state -> use a current authenticated readback.

Use these verdicts:

- `PROVED`: direct evidence matches the done signal.
- `UNPROVED`: the signal is unchecked or supported only indirectly.
- `BLOCKED`: access, authority, data, or external state prevents the check.

Missing proof narrows the final claim; it does not erase separately completed
work.

Use the four terminal statuses precisely:

- `verified complete`: every required done signal is `PROVED` and no required
  in-scope work remains.
- `complete with named caveats`: every required done signal is `PROVED` and
  only optional non-critical gaps remain.
- `action complete, verification incomplete`: authorized actions are complete,
  but at least one required signal remains `UNPROVED`.
- `blocked`: a required signal remains `BLOCKED` after authorized alternatives
  outside the risk halts are exhausted.

If one required signal remains blocked after safe in-scope alternatives are
exhausted, return:

```text
FULL_SEND_BLOCKER:
condition=<one blocking fact>
evidence=<current command-readback-or platform result>
attempts=<distinct strategies tried>
remaining_options=<two to four real options>
minimum_external_action=<smallest change that unblocks work>
authorized_work_completed=<independent work already finished>
next_action=<exact continuation>
```

Do not reset a failed retry by renaming the same check. Do not run an infinite
loop.

## Continuity

Conversation length is not a stop condition. At compaction, branch, deploy,
approval, or handoff boundaries, record:

- objective and exact targets;
- controller and protected WIP;
- accepted and rejected approaches;
- files changed and commands run;
- proof, unresolved signals, and current blocker;
- branch, remote, live URL, and exact next action.

Use the project's prescribed handoff location. If none exists and packaging is
material, route the handoff through `suede-launch-packaging`.

When the host supports a user-authorized task handoff, transfer only after
reading the record back. The successor must reread it and rerun status,
remote, log, and affected live or platform readbacks before any mutation.
Current source truth overrides the handoff.

When transfer happens before a terminal state, label the handoff `in progress,
checkpointed`. Never substitute that label for one of the four terminal
statuses.

## Final Brief

```text
Outcome:
Decision:
Executed:
Proof:
Adversarial reconciliation:
Unproved or blocked:
Source state:
Handoff:
Next move:
Status: verified complete | complete with named caveats | action complete, verification incomplete | blocked
```

Keep it compact unless detail changes the decision. Do not print lane chatter,
hidden reasoning, token counts, padded logs, or a diary of the process.
For one atomic job, use at most three sentences. For broad work, omit empty
fields and use at most eight bullets unless the user asks for a deeper report.
When blocked, use only the blocker schema plus independently completed work.

## Boundaries

1. Spend tokens and agents aggressively when they buy speed, coverage,
   independent confidence, or less user attention. Never spend them on padded
   prose, duplicate work, filler agents, ceremonial reviews, or
   hidden-reasoning dumps.
2. Do not bypass permissions, approvals, spend limits, safety rules, legal
   boundaries, privacy, or third-party impact controls.
3. Do not expose, print, store, or hand credentials to worker lanes.
4. Do not run two controllers or two progress stores for the same work.
5. Do not convert a user premise, agent report, summary, or old handoff into
   completion proof.
6. Do not mutate on audit-only, review-only, diagnosis-only, planning-only, or
   verification-only requests unless implementation is separately authorized.
7. Do not invoke a paid reviewer or remote beta planner merely to appear
   exhaustive.
8. Do not declare done because the budget is low or the conversation is long.
   Persist state and hand off cleanly instead.
9. Do not treat aggressive internal compute as authority for external spend,
   deployment, publication, messaging, account changes, or irreversible
   action.

## Routing

- Broad multi-lane work -> `suede-agent-teams`.
- Multi-file or multi-surface repo change as one DAG -> `suede-ship`.
- Independent high-volume batches -> `suede-codex-fleet`.
- End-to-end public workflow -> `suede-workflow-skills` may be a subordinate
  lane; it never owns the plan or progress store when `suede-agent-teams` is
  the selected controller.
- Code review and readiness -> `suede-code`, or `suede-code-review` for
  findings only and `suede-code-grader` for an A-F verdict.
- CI and merge protection -> `suede-ci-gate`.
- MCP verification -> `suede-mcp-qa`.
- Public visibility and AI readability -> `suede-visibility-grader`.
- SEO, AEO, GEO, and AI citation audit -> `suede-seo-audit`.
- Public install, docs, launch, and handoff -> `suede-launch-packaging`.
- One narrow job -> the smallest matching public specialist.

Umbrella routers send equivalent maximum-effort intent here; the trigger list
in this skill's description is the one canonical copy of those phrasings.
