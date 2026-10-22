# Opsibyte next review

The contribution awaiting upstream acceptance is
[MelMayssonOwen/agent-skills#1](https://github.com/MelMayssonOwen/agent-skills/pull/1).
Current accepted source scores 73–79 (C); the proposed branch scores 82–88 (B)
under `graded-v2` on October 22. Refresh and reassess the actual upstream
commit after acceptance; those proposed scores are not published grades.

After the accepted source qualifies and the corresponding directory build is
live, the publisher can add these linked badges to its README. Review the
current generated badge snippets first because listing URLs follow the latest
accepted dataset. No README change or verification is claimed here.

```markdown
[![Suede Skill Check: social scheduler](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/timetopost-social-scheduler/badge.svg)](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/timetopost-social-scheduler/)
[![Suede Skill Check: AutoSEO blog](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/timetopost-autoseo-blog/badge.svg)](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/timetopost-autoseo-blog/)
[![Suede Skill Check: Toolfound launch](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/toolfound-launch-kit/badge.svg)](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/toolfound-launch-kit/)
[![Suede Skill Check: budget builder](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/sheetfolk-budget-builder/badge.svg)](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/sheetfolk-budget-builder/)
[![Suede Skill Check: listing checker](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/amazon-listing-checker/badge.svg)](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/amazon-listing-checker/)
[![Suede Skill Check: music tools](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/clef-music-tools/badge.svg)](https://skills.suedeai.ai/directory/melmayssonowen/agent-skills/clef-music-tools/)
```

Once those links are in a rendered upstream README, run the existing verifier
for each exact accepted skill ID, for example:

```sh
python3 scripts/directory/verify_badges.py melmayssonowen/agent-skills/timetopost-social-scheduler --readme README.md
npm run build:directory
```

Repeat for each of the other five names, inspect the ledger, run the repository
tests, publish, and verify the live placement. A fetch failure, missing badge,
unqualified score or changed dataset must keep promotion inactive. The
editorial feature is independent and does not satisfy this verification step.
