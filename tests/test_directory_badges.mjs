import test from 'node:test';
import assert from 'node:assert/strict';
import { letterGrade, qualityScore, qualifies, listingTarget, badgePair, badgeMarkdown, badgeHtml, shieldSvg, promotionActive } from '../scripts/directory/badges.mjs';
const skill = { repo: 'Publisher/Skills', slug: 'sample', checks: '11111111', score: 100, grade: 'A', featured: true };
const now = new Date('2026-10-17T12:00:00Z');
const config = { enabled: true, ends_at: null };
const verified = { status: 'verified', repo: skill.repo, score: 100, target: listingTarget(skill), badges: badgePair(skill).map((b) => b.src), commit: 'a'.repeat(40), rendered_sha256: 'b'.repeat(64), readme_path: 'README.md', verified_at: '2026-10-17T10:00:00Z' };
test('all seven-check score outcomes and letter boundaries', () => {
  [0, 14, 29, 43, 57, 71, 86, 100].forEach((score, n) => assert.equal(qualityScore('1' + '1'.repeat(n) + '0'.repeat(7 - n)), score));
  for (const [n, g] of [[0,'D'], [69,'D'], [70,'C'], [79,'C'], [80,'B'], [89,'B'], [90,'A'], [100,'A']]) assert.equal(letterGrade(n), g);
  for (const n of [-1, 101, NaN, 90.5, '90', undefined, true]) assert.throws(() => letterGrade(n));
  assert.equal(qualityScore(null), null);
  assert.equal(qualityScore({}), 0);
});
test('numeric and letter shields use preserved mark, gold at 90, and validated values', () => {
  for (const kind of ['score', 'grade']) {
    assert.match(shieldSvg(89, kind), /#c9bff3/);
    assert.match(shieldSvg(90, kind), /#ebc96d/);
    assert.match(shieldSvg(100, kind), /M86.40 202.96A113.10/);
    assert.throws(() => shieldSvg(79, kind));
    assert.throws(() => shieldSvg(101, kind));
  }
  assert.match(shieldSvg(86, 'score'), />86 \/ 100<\/text>/);
  assert.doesNotMatch(shieldSvg(86, 'score'), /SCORE/);
});
test('two distinct README badges link to the actual listing, including table rows', () => {
  assert.equal(new Set(badgePair(skill).map((b) => b.src)).size, 2);
  for (const s of [skill, { ...skill, featured: false }]) {
    assert.equal(badgeMarkdown(s).split(`](${listingTarget(s)})`).length - 1, 2);
    assert.equal(badgeHtml(s).split(`href="${listingTarget(s)}"`).length - 1, 2);
  }
  assert.match(listingTarget({ ...skill, featured: false }), /skills\/#sample$/);
});
test('promotion requires verified pair, current score, gates, and admin window', () => {
  const active = (s = skill, r = verified, c = config) => promotionActive(s, r, c, '2026-10-17', now);
  assert.equal(active(), true);
  assert.equal(active(skill, null), false);
  for (const patch of [{status:'pending'}, {badges:verified.badges.slice(0,1)}, {score:86}, {repo:'other/skills'}, {target:'https://example.com'}, {commit:null}, {verified_at:'2026-10-16T12:00:00Z'}, {verified_at:'2026-10-18T12:00:00Z'}, {readme_path:'SKILL.md'}]) assert.equal(active(skill, {...verified,...patch}),false);
  assert.equal(active(skill, verified, { ...config, enabled: false }), false);
  assert.equal(active(skill, verified, { ...config, ends_at: '2026-10-17T12:00:00Z' }), false);
  assert.equal(active(skill, verified, { ...config, ends_at: 'invalid' }), false);
  for (const patch of [{checks:'01111111'}, {checks:'11111101',score:86,grade:'B'}, {score:null}, {score:101}, {score:86}]) assert.equal(active({...skill,...patch}),false);
  assert.equal(qualifies({...skill, checks:'11111110',score:86,grade:'B'}),true);
});
