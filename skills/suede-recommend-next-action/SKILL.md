---
name: suede-recommend-next-action
description: "Next-action selector for the Suede pack: inspects current repo, terminal, plan, or handoff state read-only and returns one recommended next move plus a short, self-contained copy/paste prompt for it. Use when the user asks 'what's next', 'what should I do next', 'recommend the next move', 'give me the prompt', 'expand prompt', or 'make it granular', especially after a review, audit, plan, or stalled task. NOT FOR: executing the recommended action without the user's separate authorization, or coordinating a multi-lane build across specialists (use suede-agent-teams)."
---

# Suede Recommend Next Action

Recommend one action and package it as a short runnable prompt. Inspect
current state read-only; do not execute the recommended action unless the
user separately authorizes execution. Keep the full operator contract hidden
until the user asks to expand it.

## Recommendation Workflow

1. Resolve the target and the user's actual done outcome from the current
   request, conversation, handoff, plan, repo, or live surface.
2. Check only the evidence needed to distinguish the next move. Prefer, in
   order: current terminal/repo/live state, current source documents, current
   plans or handoffs, then older memory. Run the reads, don't assume them:
   `git -C <target-repo> status --short --branch` for dirty files and
   ahead/behind, `git -C <target-repo> log --oneline -5` for what actually
   landed, a direct read of the named plan/STATE/handoff file at its exact
   path, and — when a live surface is in scope — a fetch of the URL itself
   (`curl -sS -o /dev/null -w '%{http_code}' <url>`) instead of trusting the
   last recorded deploy. Skip any read that cannot change which candidate wins.
3. Generate 2-4 candidate actions internally. Exclude work already verified as
   complete, adjacent cleanup, and actions outside the user's authorized scope.
4. Score each candidate from 0-2 on every criterion below. Recommend the
   highest total.

| Criterion | 2 points | 1 point | 0 points |
|---|---|---|---|
| Goal alignment | Directly produces the user's done signal | Required prerequisite | Merely adjacent |
| Unblocking | Unlocks a core path or at least two downstream steps | Unlocks one step | Unlocks nothing known |
| Evidence | Confirmed by current source | Confirmable with one read-only check | Depends on an assumption |
| Urgency | Active failure, deadline, security risk, or release gate | Needed for the active milestone | No current pressure |
| Leverage | Fits one focused session and prevents rework or creates a reusable result | Bounded work with moderate payoff | Unscoped, multi-day, or low-payoff work |

5. Break ties by preferring a required prerequisite, then current-evidence
   verification, then the more reversible action. If the top two remain within
   one point and target ambiguity would change the answer, run at most three
   additional read-only checks. If still tied, show both choices and state the
   single fact that decides between them.
6. Turn the recommendation into a 2-4 sentence quick prompt. Keep the scoring
   and full operator contract internal unless the user asks to compare choices,
   `expand prompt`, or `make it granular`.

## Routing Rules

- If a repo or task already has its own plan, progress doc, issue tracker, or
  project board, do not create a second one. Treat its recorded next step as
  one candidate, verify it against current source, and recommend the winner —
  don't replace the existing tracker.
- If the user needs options explored before a commitment can be made, say so
  and offer to brainstorm instead of forcing a single recommendation.
- If missing evidence is the real blocker, make the smallest read-only check
  the recommended action and generate a prompt for that check.

## Prompt Levels

The three prompt depths — short copy/paste, full operator prompt, granular steps —
are in `references/prompt-levels.md`. The default is the short prompt; read this
only when the user asks to expand or make it granular.

## Output Format

```text
Recommended action: <one sentence>
Why now: <one evidence-backed sentence>

Quick prompt: <2-4 runnable sentences>

Say "expand prompt" for the full operator version or "make it granular" for exact steps and commands.
```

Show the route, score, evidence list, confidence, or alternatives only when the
user asks for rationale or when the unresolved tie rule requires them. When the
recommendation is an evidence-gathering step, state that in `Why now` without
loading the expanded prompt.

## Boundaries

- Do not mutate files, repos, deployments, accounts, messages, or live systems
  while recommending.
- Do not load the expanded or granular prompt by default.
- Do not repeat a broad audit when one current execution lane can be selected.
- Do not invent paths, URLs, skill availability, status, metrics, owners, or
  completion evidence.
- Do not recommend vague actions such as "keep working", "improve the app", or
  "do more research". Name a command, artifact, decision, edit, or verification
  result.
- Do not hide a blocker. If authority or a decisive fact is missing, make its
  resolution the next action.

## Routing

- Need multi-lane coordination across specialists -> use `suede-agent-teams`.
- Need help picking which single skill fits a request -> read this pack's
  router (`suede-workflow-skills`) or ask directly.
- Need idea exploration before selecting a move -> brainstorm directly with
  the user instead of forcing a single recommendation.
- Need execution -> use the specialist named in the generated prompt.
