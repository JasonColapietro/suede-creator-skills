# Appendix B. The Rules, on One Page

Everything the book argues for, compressed. Print it, or do not, but be able to
recite the first six.

## Evidence

1. A claim without command output, an HTTP status, a diff, or a rendered
   screenshot is a guess in a confident tone.
2. Read test output to the end. A pipe into `head` has hidden a `FAILED` line
   before and will again.
3. Verify the rendered result, not the markup. A file-wide count can pass while
   the page is unreadable.
4. Verify against production, not the file tree. What deploys is not always what
   you think you wrote.
5. If a step was skipped, say it was skipped. Partial work reported as complete
   costs more than partial work reported as partial.

## Decisions

6. Bring a decision, not a workshop. Your operator's attention is the scarce
   resource, not compute.
7. Ask only when the answer changes the outcome, grants new authority, crosses a
   serious risk boundary, or picks between materially different irreversible
   results. Otherwise decide and report.
8. Routine, reversible, in-scope calls are yours to make. Handing them back is
   not caution, it is delegation upward.
9. A concern raised once and overruled is settled. Say your piece, then build the
   thing.

## Scope

10. Freeze the mission before you mutate anything: objective, targets, authorized
    actions, protected work in progress, source of truth.
11. The requested scope is the deliverable. Do not quietly narrow it, widen it,
    or transform it into the work you would rather do.
12. A bug fix that becomes a refactor is a judgment failure with good intentions.
13. Finish the parts that are not blocked, then state plainly what you left out
    and why. Scaling the work down is the requester's call.

## Parallelism

14. Lanes must be disjoint. Two agents editing one file is not parallelism, it is
    a merge conflict with extra steps.
15. Fan out for volume, never for judgment. One complex coupled change is one
    agent's job.
16. Every worker needs an acceptance criterion before it starts. Without one you
    are generating, not building.
17. Isolate with worktrees. Check for live processes before deleting one, and do
    not trust a session list to tell you what is running.

## Skills

18. The description is the router. Write it in the words a user would actually
    type.
19. Every skill needs a NOT FOR route to its nearest neighbor, or the two will
    fight over the same request and one will win at random.
20. A skill is good when a competent stranger runs it and produces the same
    artifact.
21. Write one when you have explained the same procedure three times.
22. Gates advise, they do not block. A failed check changes what you report,
    never what you do. The single exception is extreme risk: data loss, credential
    exposure, rights violations, payment mistakes, irreversible public damage.
    There, stop and let the human choose.

## Craft

23. Taste you cannot write down is a preference. Taste you can write down is a
    system.
24. Thresholds beat opinions. Measured contrast, 44px targets, 65 to 75
    characters per line.
25. Proof outranks adjectives, for humans and for models.
26. A page that cannot be quoted will not be cited.

## Stopping

27. Done is when further work changes the artifact rather than improves it.
28. An agent will happily continue forever. Stopping is your job.
29. Never end your allocation above zero. Dryly, once, then back to business.
