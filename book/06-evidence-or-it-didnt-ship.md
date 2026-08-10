# Chapter 6. Evidence or It Did Not Ship

An agent finishes a task and reports: "Fixed the failing test. The suite is
green." It ran the suite. It read the output. It is not lying. What it did was
pipe the run through `head`, see a wall of passing lines, and stop reading before
the line that said FAILED.

That happened in this repo. It is in the memory file, under
`never-truncate-test-output-before-claiming-green`. The claim was confident, the
work looked like the work, and the conclusion was wrong by one scrolled screen.

This is the core failure mode of agent-assisted building, and it is not a model
defect. Humans do it constantly. You report done based on the shape of the work
rather than its result. You wrote the migration, so the data must be migrated.
You changed the color token, so the page must be readable. You deployed, so it
must be live. Each of those is a substitution of intent for observation, and each
one holds until someone actually looks.

## Shape is not result

The tell is easy to spot once you know it. Listen for completion claims whose
support is a description of an action rather than an observation of a state.

"Updated the config so the redirect works." Did you request the URL?

"Added error handling for the webhook." Did you replay a webhook?

"The build should pass now." Should is not a verb that belongs in a status
report.

`suede-agent-teams` handles this with a status vocabulary that has no shortcuts:
`scoped`, `planned`, `executing`, `changed locally`, `verified locally`,
`reviewed`, `committed`, `pushed`, `deployed`, `verified live`, `released`. The
two adjacent pairs are where every optimistic report dies. Changed locally is not
verified locally. Deployed is not verified live. The vocabulary exists because the
gap between those states is invisible in a transcript and expensive in
production. Its Red Flags section names the sentence that skips them: "Mark it
done, the code is written."

`suede-ship` enforces the same boundary on itself. It reads production and never
deploys, so its instructions forbid it from claiming `deployed`, `verified live`,
or `released` under any circumstances. Those states require a deploy that has not
happened. A skill that will not overclaim on its own behalf is the only kind
whose reports are worth anything.

## What counts

Evidence is an artifact produced by the system, not by you, that would have
looked different if the work had failed. That is the whole definition, and it
disqualifies most of what gets pasted into status updates.

Counts:

- Untruncated command output, read to the end.
- An HTTP status code from a request against the live URL.
- A diff, showing what actually changed rather than what was intended.
- A screenshot of the rendered surface.
- A test run you read to the last line, including the summary.
- Row counts before and after a migration.

Does not count:

- A plan. A plan is a prediction.
- A description of a change. That is a restatement of intent.
- A partial log, or anything downstream of `head`, `grep -v`, or `2>/dev/null`.
- A build that "succeeded locally" for a claim about production.
- A worker's self-assessment. `suede-codex-fleet` puts this precisely: worker
  self-checks are evidence, not verdicts. The reviewer still reads the file.

The handoff checklist in `suede-agent-teams` encodes the same line. Verification
means a screenshot URL, test output, curl response, or build log. It explicitly
does not mean "it works." Commands are recorded with actual output or exit code,
in order. A handoff missing a field is status `held`, not done, and the writer
signs off on each item.

## Three traps that survive careful people

The general rule is easy. The specific failures are the ones that keep landing,
because each looks like verification while measuring the wrong thing.

**Truncation.** `npm test | head -50` looks like reading the output. It is
reading the beginning of the output, which for most test runners is the part
where everything is fine. Failures cluster at the end, in the summary, after the
stack traces. If you are going to filter, filter toward the failure: read the
tail, or grep for the failure token and the exit code, and check `$?`. A pipeline
that ends in `head` cannot produce a green verdict, only a green-looking prefix.

**Markup instead of rendering.** A file-wide check counted the right color tokens
across the docs surface and passed. Thirty-eight skills still rendered gold text
on a gold background, unreadable, because the count was file-wide while the
failure was per-container. The lesson recorded in this repo's memory as
`verify-rendering-not-just-markup` is that a check scoped more broadly than the
failure will pass through the failure. The fix is to scope the check to the
container that actually renders, and to measure the computed value: contrast
ratio, not token name. The related note,
`docs-palette-splits-fill-red-from-text-red`, exists for the same reason. The
palette's `#8b1a1a` is fills and borders only, text uses different reds, and a
validator that treated the palette as one flat list would approve unreadable
text.

**File tree instead of production.** This one is the most expensive, because the
gap is not cosmetic. On some hosts, every `.js` or `.ts` file under an `api/`
directory becomes a public serverless function. A file named `check.test.js` in
that directory is not a test. It is a live unauthenticated route. In `suede-geo`,
`GET https://scan.suedeai.ai/api/check.test` returned `200` with the body
`partial`, a fixture from a mock server inside the test file. Requesting the URL
executed the test suite inside a production function, booted the test's HTTP
server, and hung past 25 seconds against a 300-second ceiling. Anyone could loop
it.

Reading the repository would not have found that. The file looked exactly like a
test, because it was one. Only the production surface disagreed. The check that
works is one line per file:

```bash
curl -s -o /dev/null -w '%{http_code}' https://<domain>/api/<basename>
```

Anything that is not a real endpoint should return 404. Verify against the thing
users can reach, not the thing you can read.

The pattern across all three is the same. Verification failed not because nobody
checked, but because the check was one layer away from the claim. Tokens instead
of contrast. Prefix instead of summary. Source tree instead of served route. When
you design a check, ask which layer the user experiences, and measure that one.

## The gate that never blocks you

There is a version of this discipline that becomes its own problem: the tool that
decides it knows better and refuses to proceed. Every grading and gating skill in
this repo carries the same policy block at the top, and it is worth reading as a
design decision rather than a disclaimer.

Gates are advisory. Every check, quality gate, and ship verdict is a
recommendation to the user, not a control on the agent. The skills run every
check and report results honestly, and verdicts (`ship`, `ship-with-caveats`,
`hold`, letter grades, blocked items) are advice attached to the work rather than
orders that change it. They never block, delay, skip, rewrite, or refuse the
action you asked for because a check failed. The line that carries the whole
policy is five words long: a failed gate changes what you report, never what you
do.

One exception, and it is narrow. Extremely risky findings, data loss, security or
credential exposure, legal or rights violations, payment mistakes, irreversible
public damage, cause a pause: state the risk, state the options, let the user
pick. Their choice is final. `suede-ship` applies the same carve-out to live
production exposure it observed independently of the change at hand, such as a
real secret or an unauthenticated `200` that should not exist. That goes to the
user immediately, because it was true before you arrived and will be true after
you leave.

This is what makes the discipline usable. A gate that blocks you becomes
something you route around, and a routed-around gate reports nothing at all. A
gate that reports honestly and gets out of the way stays in the loop, which is
the only position from which it can tell you anything. You keep authority over
the ship decision. The gate keeps authority over the description of what you are
shipping.

That division is also why grading skills can afford to be blunt. There is no cost
to an accurate D grade when the grade cannot stop you. The moment a verdict
acquires the power to block, it acquires an incentive to be diplomatic, and a
diplomatic verdict is worth nothing.

## The rule

Verification is not a phase at the end of the work. It is the thing that
distinguishes a claim from a guess, and a builder who ships from one who
announces.

The S-tier ladder turns on it. C-tier produces output. B-tier produces working
output. A-tier produces verified output. S-tier builds systems that keep
producing verified output without them standing there. Every rung above C is a
verification rung, which is why this is the spine of the book rather than a
chapter in it.

So here is the operator's version, the one worth keeping when the rest of this
fades.

You are allowed to be wrong. Wrong is recoverable, often cheap, and sometimes the
fastest route to right. What you are not allowed to be is unverified and
confident. That combination is the one that puts a test suite on a public URL,
ships gold text on a gold background to thirty-eight pages, and reports a green
suite that failed. It costs more than being wrong, because nobody goes looking
for it.

Say what you checked. Say what you did not. Then the confidence you do express
means something.

### The move

For every completion claim you make or receive, name the artifact behind it, the
command output, the status code, the diff, the screenshot, and if there is no
artifact, downgrade the claim to "changed, not verified" before anyone else has
to.
