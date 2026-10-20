import test from 'node:test';
import assert from 'node:assert/strict';
import { SCORE_METHOD, letterGrade, qualityScore, structuralPass, listed, qualifies, listingTarget, badgePair, badgeMarkdown, badgeHtml, shieldSvg, promotionActive } from '../scripts/directory/badges.mjs';
const skill = { repo: 'Publisher/Skills', slug: 'sample', checks: '11111111', score: 95, grade: 'A', featured: true };
const now = new Date('2026-10-17T12:00:00Z');
const config = { enabled: true, ends_at: null };
const snapshot = { date: '2026-10-17', sha256: 'c'.repeat(64) };
const verified = { status: 'verified', repo: skill.repo, score: 95, target: listingTarget(skill), badges: badgePair(skill).map((b) => b.src), commit: 'a'.repeat(40), rendered_sha256: 'b'.repeat(64), dataset_sha256: snapshot.sha256, readme_path: 'README.md', verified_at: '2026-10-17T10:00:00Z' };
const gen = '2026-10-17';
const full = { checks: '11111111', description: `Builds things. Use it when asked to "build a thing". Not for deployment.${'x'.repeat(100)}`, size: [0, 1000, 0], kinds: 'rs', allowed_tools: 'Read', compatibility: 'Node 22' };
const fullRepo = { commit_date: '2026-10-10', lists: ['a', 'b', 'c', 'd'] };
const bare = { checks: '10000000', description: '', size: [0, 0, 0], kinds: '' };
const bareRepo = { commit_date: '2020-01-01', lists: [] };
const pts = (patch = {}, repo = {}) => qualityScore({ ...bare, ...patch }, { ...bareRepo, ...repo }, gen);
const daysAgo = (n) => new Date(Date.parse(gen) - n * 864e5).toISOString().slice(0, 10);
test('graded-v2 score caps at 99 and maps null to null', () => {
  assert.equal(SCORE_METHOD, 'graded-v2');
  assert.equal(qualityScore(full, fullRepo, gen), 99);
  assert.equal(qualityScore({ ...full, compatibility: '' }, fullRepo, gen), 98);
  assert.equal(pts(), 0);
  assert.equal(qualityScore(null, fullRepo, gen), null);
  [0, 8, 16, 24, 32, 40, 48, 56].forEach((score, n) => assert.equal(pts({ checks: '1' + '1'.repeat(n) + '0'.repeat(7 - n) }), score));
  assert.equal(pts({ checks: '01111111' }), 56, 'frontmatter is a listing gate, not a scored check');
});
test('description length, body depth, files and declared fields use their band boundaries', () => {
  for (const [n, p] of [[49, 0], [50, 1], [99, 1], [100, 3], [149, 3], [150, 5], [600, 5], [601, 3], [900, 3], [901, 1], [1024, 1], [1025, 0]]) {
    assert.equal(pts({ description: 'x'.repeat(n) }), p, `length ${n}`);
  }
  assert.equal(pts({ description: '\u{1F600}'.repeat(150) }), 5, 'length counts code points');
  for (const [w, p] of [[99, 0], [100, 1], [249, 1], [250, 4], [499, 4], [500, 7], [3000, 7], [3001, 4], [4500, 4], [4501, 1]]) {
    assert.equal(pts({ size: [0, w, 0] }), p, `words ${w}`);
  }
  for (const [kinds, p] of [['r', 3], ['s', 2], ['rsa', 5], ['a', 0]]) assert.equal(pts({ kinds }), p);
  for (const [v, p] of [['Read', 2], ['', 0], [undefined, 0], [null, 0]]) assert.equal(pts({ allowed_tools: v, compatibility: v }), 2 * p);
});
test('boundary and example regexes match the Python patterns', () => {
  const sig = (description) => pts({ description }) - pts({ description: 'x'.repeat([...description].length) });
  for (const [d, hit] of [['Not for deployment', true], ['Do NOT use for builds', true], ["Don't use here", true], ['dont use here', true], ['not intended for prod', true],
    ['Use the deploy skill instead.', true], ['use it. Instead', false], ['use x insteadly', false], ['cannot for', false], ['knot for', false], ['not form', false],
    ['\u00e9not for', false], ['NOT \u0130NTENDED FOR', true], [`use ${'\u{1F600}'.repeat(59)} instead`, true], [`use ${'\u{1F600}'.repeat(60)} instead`, false]]) {
    assert.equal(sig(d), hit ? 4 : 0, d);
  }
  for (const [d, hit] of [['ask "build it"', true], ['ask “build it”', true], ["say 'ship'", true], ['"ab"', false], [`"${'x'.repeat(60)}"`, true], [`"${'x'.repeat(61)}"`, false], ['"\u{1F600}\u{1F600}"', false], [`"${'\u{1F600}'.repeat(60)}"`, true],
    ["says 'let's work on a track.'", true], ['says "my Newton iterations aren\'t converging."', true], ["It doesn't fit the user's needs.", false], ["it's working, what's next", false], ["a 'quote'd word", false], ["\u00e9'quoted'", false]]) {
    assert.equal(sig(d), hit ? 3 : 0, d);
  }
});
test('recency and adoption use whole-day and list-count boundaries', () => {
  for (const [n, p] of [[0, 9], [30, 9], [31, 6], [90, 6], [91, 3], [180, 3], [181, 1], [365, 1], [366, 0]]) assert.equal(pts({}, { commit_date: daysAgo(n) }), p, `${n} days`);
  assert.equal(pts({}, { commit_date: `${daysAgo(30)}T23:59:59Z` }), 9, 'only the date part counts');
  for (const [n, p] of [[0, 0], [1, 1], [2, 3], [3, 4], [4, 7], [9, 7]]) assert.equal(pts({}, { lists: Array(n).fill('x') }), p, `${n} lists`);
  assert.throws(() => pts({}, { commit_date: 'unknown' }));
});
test('letter grades run 0-99 and 100 is invalid', () => {
  for (const [n, g] of [[0,'D'], [69,'D'], [70,'C'], [79,'C'], [80,'B'], [89,'B'], [90,'A'], [99,'A']]) assert.equal(letterGrade(n), g);
  for (const n of [100, -1, 101, NaN, 90.5, '90', undefined, true]) assert.throws(() => letterGrade(n));
  assert.equal(letterGrade(null), null);
});
test('listing is structural and independent of the numeric score', () => {
  for (const [checks, pass] of [['11111111', true], ['11111110', true], ['10111111', true], ['01111111', false], ['11111100', false], ['10000000', false]]) {
    assert.equal(structuralPass(checks), pass, checks);
    assert.equal(structuralPass(Object.fromEntries(['frontmatter', 'name_format', 'name_matches_folder', 'description_length', 'description_trigger', 'concise_body', 'license', 'maintained'].map((id, i) => [id, checks[i] === '1']))), pass);
  }
  assert.equal(structuralPass('11111101'), true);
  assert.equal(listed({ checks: '11111101' }), false, 'license still required');
  const low = { ...skill, checks: '11111110', score: 72, grade: 'C' };
  assert.equal(pts({ checks: low.checks }) < 80, true);
  assert.equal(listed(low), true);
  assert.equal(qualifies(low), false);
  assert.throws(() => badgePair(low));
  assert.throws(() => badgeMarkdown(low));
  assert.equal(qualifies({ ...skill, checks: '11111110', score: 86, grade: 'B' }), true);
  assert.equal(qualifies({ ...skill, checks: '11111100', score: 86, grade: 'B' }), false);
  for (const patch of [{ score: 100 }, { score: 86 }, { score: 79, grade: 'C' }, { score: '95' }, { score: null }]) assert.equal(qualifies({ ...skill, ...patch }), false);
});
test('numeric and letter shields use preserved mark, gold at 90, and validated values', () => {
  for (const kind of ['score', 'grade']) {
    assert.match(shieldSvg(89, kind), /#c9bff3/);
    assert.match(shieldSvg(90, kind), /#ebc96d/);
    assert.match(shieldSvg(99, kind), /M86.40 202.96A113.10/);
    assert.throws(() => shieldSvg(79, kind));
    assert.throws(() => shieldSvg(100, kind));
  }
  assert.match(shieldSvg(86, 'score'), />86 \/ 100<\/text>/);
  assert.doesNotMatch(shieldSvg(86, 'score'), /SCORE/);
});
test('two distinct README badges link to the actual listing, including table rows', () => {
  assert.equal(new Set(badgePair(skill).map((b) => b.src)).size, 2);
  assert.equal(badgePair(skill)[0].alt, 'Suede Skill Check: 95/100');
  for (const s of [skill, { ...skill, featured: false }]) {
    assert.equal(badgeMarkdown(s).split(`](${listingTarget(s)})`).length - 1, 2);
    assert.equal(badgeHtml(s).split(`href="${listingTarget(s)}"`).length - 1, 2);
  }
  assert.match(listingTarget({ ...skill, featured: false }), /skills\/#sample$/);
});
test('promotion requires verified badge evidence, current score, gates, and admin window', () => {
  const active = (s = skill, r = verified, c = config) => promotionActive(s, r, c, snapshot, now);
  assert.equal(active(), true);
  assert.equal(active(skill, null), false);
  for (const patch of [{status:'pending'}, {badges:[]}, {score:86}, {repo:'other/skills'}, {target:'https://example.com'}, {commit:null}, {verified_at:'2026-10-16T12:00:00Z'}, {verified_at:'2026-10-18T12:00:00Z'}, {readme_path:'SKILL.md'}]) assert.equal(active(skill, {...verified,...patch}),false);
  assert.equal(active(skill, verified, { ...config, enabled: false }), false);
  assert.equal(active(skill, verified, { ...config, ends_at: '2026-10-17T12:00:00Z' }), false);
  assert.equal(active(skill, verified, { ...config, ends_at: 'invalid' }), false);
  for (const patch of [{checks:'01111111'}, {checks:'11111101',score:86,grade:'B'}, {score:null}, {score:100}, {score:86}, {checks:'11111110',score:72,grade:'C'}]) assert.equal(active({...skill,...patch}),false);
  const b = { ...skill, checks: '11111110', score: 86, grade: 'B' };
  assert.equal(active(b, { ...verified, score: 86, badges: badgePair(b).map((x) => x.src) }), true);
});
test('either numeric or letter badge qualifies, while invalid targets and stale evidence do not', () => {
  for (const badges of [[verified.badges[0]], [verified.badges[1]], verified.badges]) {
    const record = { ...verified, badges };
    assert.equal(promotionActive(skill, record, config, snapshot, now), true);
    assert.equal(promotionActive(skill, { ...record, target: 'https://example.com' }, config, snapshot, now), false);
    assert.equal(promotionActive(skill, { ...record, dataset_sha256: 'd'.repeat(64) }, config, snapshot, now), false);
    assert.equal(promotionActive(skill, { ...record, status: 'fetch_failed' }, config, snapshot, now), false);
  }
  for (const badges of [[], null, ['https://example.com/invalid.svg']]) {
    assert.equal(promotionActive(skill, { ...verified, badges }, config, snapshot, now), false);
  }
});
test('a later same-day dataset snapshot invalidates earlier README verification', () => {
  const refreshed = { ...snapshot, sha256: 'd'.repeat(64) };
  assert.equal(promotionActive(skill, verified, config, snapshot, now), true);
  assert.equal(promotionActive(skill, verified, config, refreshed, now), false);
  assert.equal(promotionActive(skill, { ...verified, dataset_sha256: refreshed.sha256 }, config, refreshed, now), true);
  for (const sha256 of [undefined, null, '', 'invalid']) {
    assert.equal(promotionActive(skill, { ...verified, dataset_sha256: sha256 }, config, snapshot, now), false);
    assert.equal(promotionActive(skill, { ...verified, dataset_sha256: sha256 }, config, { ...snapshot, sha256 }, now), false);
  }
  assert.equal(promotionActive(skill, undefined, config, refreshed, now), false);
});
