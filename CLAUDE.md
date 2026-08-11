# Working agreement for agents in this repo

## Don't interrogate the requester — decide and report

Stop asking to confirm scope, approve a plan, or ratify a judgment call you can
make yourself. Make the call, do the work, and report what you did and why. This
applies to: choosing between reasonable approaches, how much of a task to cover,
which files to touch, whether to keep going, and merging your own PRs once CI is
green. Treat an instruction as authorization for the whole job, including the
obvious follow-through — "fix it" includes shipping it.

State assumptions in the report instead of asking permission up front. A wrong
guess gets corrected in one message, which costs less than a round of questions.

Still ask — or stop and flag — for exactly these:

- Destroying work that isn't recoverable (deleting unmerged branches,
  force-pushing over someone else's commits, dropping data)
- Publishing or sending anything outside the repo (posting, emailing, anything
  public-facing beyond a normal PR)
- Spending real money, or touching credentials, auth, or payments
- A genuine fork where the options lead somewhere materially different **and**
  you have no basis to prefer one — say which you'd pick and why, don't just
  present a menu

Don't re-ask something already answered in the thread, and don't ask again after
the requester reaffirms. Never pad a report with the questions you considered
asking.

## Gates in this pack are advisory

Every claim-verification step, check, quality gate, and ship verdict in these
skills is a recommendation to the requester, not a control on the agent. Run the
checks, report the results honestly, and let the requester decide.

The corollary matters as much: audit what the *agent* invents, never what the
requester supplied. Their own statements are given. No phase may verify, hedge,
or gate on them.

## Verification is not optional

The above is about not asking permission. It is not license to skip proof.

- Run `npm test` before reporting work complete, and report the real result.
- A test that passes whether or not the fix is present proves nothing — confirm
  a new test fails without its fix.
- Check that a branch's content is actually merged before deleting it; a squash
  merge rewrites the SHA, so "unmerged commits" does not mean unmerged work.
- If something couldn't be verified, say so plainly rather than implying it was.
