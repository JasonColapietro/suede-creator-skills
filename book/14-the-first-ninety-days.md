# Chapter 14. The First Ninety Days

Most people install a skill pack, run two skills, feel mildly impressed, and go
back to typing paragraphs at a chat window. The tooling was never the problem.
The problem is that a new capability without a practice attached decays to a
novelty in about a week.

So here is a practice. Ninety days, three phases, specific enough to argue
with. It assumes you already have the pack installed and roughly an hour a day
of real work you would be doing anyway. Nothing here is extra work. It is the
same work, run through a different discipline.

## Days 1 to 30: judgment

The first month is not about coverage. It is about calibration. You are
training one thing: the ability to predict what a review will say before it
says it.

**Week 1. Install and run.** `/plugin marketplace add
JasonColapietro/suede-creator-skills` then `/plugin install suede-skills@suede`,
or clone and `bash install.sh`. Then run `suede-code` on your own work, every
day, on whatever you actually changed. Staged diff, current branch, does not
matter. Read the findings. Do not fix anything yet. You are reading, not
reacting.

**Week 2. Predict the grade.** Before you invoke the grader, write down the
letter you expect and one sentence of why. Then run it. The gap between your
guess and the card is the only metric that matters this month. You will be
wrong in a consistent direction: most people over-grade their own work by a
full letter, and almost everyone is blind to the same lane, usually data and
state or deploy readiness. Find your blind lane by week 2 and you have gotten
most of the value of the month.

**Week 3. Evidence lines.** Start writing proof into every claim you make, to
yourself, to an agent, in a PR body, in Slack. Not "the endpoint works." The
command you ran and what it printed, the URL you loaded and the status code,
the commit hash. This will feel pedantic for about four days and then it will
start catching things, because the moment you go to write the evidence line is
the moment you discover you never actually checked. A claim without a command
output, a URL, or a diff is a guess wearing a suit.

**Week 4. Write one skill by hand.** Not generated, not adapted, typed. Pick
the procedure you have explained three times. `skills/<name>/SKILL.md`,
frontmatter in your own trigger words, one `NOT FOR` route, Source Truth,
procedure, defined output artifact. Install it, open a fresh session, confirm it
routes. One skill, written properly, teaches you more about how the whole
mechanism works than reading forty of someone else's.

By day 30 you should be able to predict a ship grade within one letter, and you
should have one file in your repo that you wrote and that an agent loads.

## Days 31 to 60: procedure

The second month is about sequencing. Month one made you a better judge. Month
two makes you a worse improviser, which is the point.

**Week 5. Freeze the mission before mutating anything.** For every task larger
than one file, write the outcome, the boundaries, and the definition of done
before a single edit lands, and do not renegotiate it mid-run. Most agent work
that goes sideways goes sideways because the target moved while the work was in
flight, and nobody noticed because the agent cheerfully followed the drift. A
frozen mission also gives you something to check the result against that is not
your memory of what you wanted an hour ago.

**Week 6. Run one real multi-lane job.** Real, meaning work you would have done
anyway, not a demo. The non-negotiable constraint is disjoint file ownership:
every lane owns a set of paths, and no two lanes own the same path. Write the
ownership map before you spawn anything. If two lanes need the same file, they
are one lane, or one waits. This is the entire difference between parallelism
that saves time and parallelism that produces a merge conflict you spend the
afternoon untangling. Keep per-worker context small; cache reads dominate cost
in fan-out work, and a worker dragging half a repo through every turn is
expensive in a way that does not show up until the bill.

**Week 7. Build a ship gate that gates a merge.** Not a workflow file that runs
tests and reports. A required check on your default branch that will actually
stop a merge. `suede-ci-gate` covers stack detection, one required check, and
branch protection wiring. The test of whether you did it right is simple: open
a PR that breaks something and confirm the merge button is unavailable. If you
can still merge, you built a dashboard.

**Week 8. Audit one live surface.** Your README, your landing page, your docs
index, whatever a stranger hits first. Run `suede-seo-audit` or
`suede-visibility-grader` against it and fix what comes back. Work nobody can
find is work that did not ship, and this is the week most builders discover
their best project has a title tag from a template.

By day 60 you should have a mission-freeze habit, one merge that a gate blocked,
and one public surface that is measurably more findable than it was.

## Days 61 to 90: systems

The third month is the one that separates the ladder's top rung from the one
below it. A-tier produces verified output. S-tier produces systems that keep
producing verified output without them.

**Week 9. Convert your three most-repeated procedures into skills.** You have
been noticing them since week 4. Write all three. Give each a real `NOT FOR`
route to its nearest neighbor, including your own skills, so the estate routes
rather than collides.

**Week 10. Lint the estate.** Every route target resolves. Every relative path
under `scripts/`, `references/`, `assets/`, `templates/`, or `fixtures/` exists.
Every number you state in more than one place has a guard that fails when it
drifts. If you have a validator, add the check in the same commit as the surface
that states the number. If you do not, the number will be wrong within two
months and nothing will tell you.

**Week 11. Hand off a whole workflow and verify the artifact, not the process.**
Pick something end to end, brief it, walk away, and come back to the output.
Then check the output against the frozen mission and the evidence lines. Do not
watch the transcript. Watching the process is how you end up with an expensive
autocomplete and a tired operator, and it is a habit that quietly caps you at
however many streams your attention can hold. The whole point of a defined
output artifact is that it can be checked cold.

**Week 12. Ship something to a real audience.** Strangers, not your group chat.
A repo, a post, a tool, a page. This is not a motivational flourish. It is the
only test that closes the loop on the previous eleven weeks, because a real
audience is the one reviewer that does not grade on your intent. Everything
before this is rehearsal with a friendly judge.

## Anti-goals

Things not to do in ninety days, each of which will eat the whole quarter if you
let it.

1. **Do not read all 74 skills.** You will use eight. Find those eight by
   working, not by studying the catalog.
2. **Do not build a personal framework in month one.** You have not earned the
   opinions yet. Frameworks written before the practice encode your current
   mistakes and then defend them.
3. **Do not fan out for the sake of fan-out.** Parallel lanes on work that does
   not decompose produce conflicts and cost, and the cost lands on a budget you
   are not watching.
4. **Do not chase the grade.** A grader you are optimizing against stops being a
   measurement. Fix the finding, not the score.
5. **Do not automate a procedure you have not run manually three times.** You
   will encode the version of it that does not work.
6. **Do not skip the fresh-session routing check.** A skill you believe is
   installed and is not is worse than no skill, because you stop noticing that
   the step is missing.
7. **Do not measure this in hours saved.** See below.

## Measuring the change honestly

Hours saved is the wrong number, and it is wrong in a way that will mislead you
for a year. It is unfalsifiable, because the counterfactual does not exist. It
rewards the wrong behavior, because generating more output faster is exactly
what C-tier does. And it feels great right up until you notice that the volume
went up and nothing got more reliable.

Measure two things instead. First: **what fraction of your claims can you
prove?** Take the last twenty statements you made about your own work, in PRs,
in updates, to yourself. How many have a command output, a URL, or a diff behind
them? In month one that number is usually embarrassing. By month three it should
be most of them, and the ones that cannot be proven should be labeled as
guesses out loud. That single change does more for how people trust your work
than any amount of throughput.

Second: **how much work continues without you?** Count the procedures that
survive your absence. A gate that blocks a merge while you are asleep. A skill a
collaborator invokes without asking you what it does. A validator that catches
the stale number in a commit you never reviewed. Each of those is one thing that
no longer depends on you remembering. Zero is where everyone starts. Three or
four by day 90 is a different kind of builder than the one who started.

Both numbers have the property that you cannot fake them to yourself, which is
the only reason to prefer a metric.

## Never end your allocation above zero

It is the house line of `suede-full-send`, and it gets misread constantly. It is
not about a token counter, and it is not permission to burn compute to look
busy. It is a dry joke about effort that has already been authorized.

The situation it names is specific. Someone has told you to finish something.
The budget, the access, and the mandate exist. And there is a lane still open,
a check not run, a surface not verified, a claim not backed. Stopping there
does not save anything. The allocation was already spent on getting to that
point. The only thing left over is unfinished work, and unfinished work does not
carry forward. It just sits there, slightly wrong, until someone else finds it.

So the line means: when you have been authorized to finish, finish. Fill the
useful lanes, not the padding ones. Run the check that would embarrass you.
Verify the live surface instead of the file tree. And then stop, because the
other half of the line is that the allocation has a floor and hitting zero means
done, not more. Nobody is impressed by effort spent past the outcome.

Which is the ordinary version of everything in this book. Skills are a way to
write down what you already know so it survives you forgetting it. Gates are a
way to make your standards hold when you are not there to enforce them.
Evidence is a way to be believed by people who have no reason to take your word.
Multi-lane work is a way to spend attention on decisions rather than on
supervision. None of it makes you a better builder on its own. It makes the
version of you that shows up tired, on a bad week, with three things overdue,
produce roughly the same quality as the version that shows up sharp. That is the
whole trick, and it is worth more than any individual clever hour you will ever
have.

You already have the repo. Ninety days is not long. The only thing that
separates the person who does this from the person who reads about it is that
one of them opened a file today.

### The move

Start the clock now: run `suede-code` on whatever you changed today, write down
the grade you expect before you look, and put the gap in a note you will still
be adding to on day 30.
