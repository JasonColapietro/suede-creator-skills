import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const skill = fs.readFileSync(new URL('skills/suede-influencer-outreach/SKILL.md', root), 'utf8');
const evals = JSON.parse(fs.readFileSync(new URL('skills/suede-influencer-outreach/evals/evals.json', root), 'utf8')).evals;

test('supplied creator facts are accepted and research is limited to missing or agent-introduced evidence', () => {
  assert.doesNotMatch(skill, /read the creator's two or three most recent posts and confirm the fit evidence yourself/);
  assert.match(skill, /Accept requester-supplied fit evidence as given/);
  assert.match(skill, /Research only missing evidence or facts you introduce/);
});
test('complete briefs proceed through the recommended angle without a mandatory approval turn', () => {
  assert.doesNotMatch(skill, /Wait for the user to pick one/);
  assert.match(skill, /Select the strongest supported angle and draft/);
  assert.doesNotMatch(JSON.stringify(evals), /wait for a pick/i);
  assert.ok(evals.some(e => /complete brief/i.test(e.prompt) && /without.*(?:approval|confirm)/i.test(e.expected_output)));
});
test('quality checks report unresolved recommendations and preserve requester choices', () => {
  assert.doesNotMatch(skill, /Redraft until every item passes|Do not hand over a draft with a caveat/);
  assert.match(skill, /Report unresolved checks as recommendations/);
  assert.match(skill, /Preserve explicit requester choices/);
  assert.ok(evals.some(e => /formal/i.test(e.prompt) && /advisory/i.test(e.expected_output)));
  assert.match(skill, /Do not send, DM, schedule, or follow up with anyone without explicit authorization for the exact recipient and message/);
});
