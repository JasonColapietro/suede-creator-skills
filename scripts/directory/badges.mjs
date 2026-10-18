import fs from 'node:fs';

export const BASE = 'https://skills.suedeai.ai';
export const CHECK_IDS = ['frontmatter', 'name_format', 'name_matches_folder', 'description_length', 'description_trigger', 'concise_body', 'license', 'maintained'];
export const SCORE_METHOD = 'graded-v2';
// Python re.I semantics: \b over Unicode \w ([\p{L}\p{N}_]); "i" also matches U+0130/U+0131; /u counts code points.
const W = '[\\p{L}\\p{N}_]', I = '[i\\u0130\\u0131]';
const BOUNDARY = new RegExp(`(?<!${W})(not for|do not use|don'?t use|not ${I}ntended for|use [^.]{0,60}(?<!${W})${I}nstead)(?!${W})`, 'iu');
const EXAMPLE = /["“'‘][^"”'’]{3,60}["”'’]/iu;
const bits = (checks) => CHECK_IDS.map((id, i) => typeof checks === 'string' ? checks[i] === '1' : checks?.[id] === true);
const declared = (v) => v != null && v !== false && v !== 0 && v !== '' && !(typeof v === 'object' && !Object.keys(v).length);
export function letterGrade(score) {
  if (score === null) return null;
  if (!Number.isInteger(score) || score < 0 || score > 99) throw new Error('Quality score must be an integer from 0 to 99');
  return score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';
}
export function structuralPass(checks) {
  const b = bits(checks);
  return b[0] && b.slice(1).filter(Boolean).length >= 6;
}
export function qualityScore(s, repo, generated) {
  if (s == null) return null;
  const desc = s.description, len = [...desc].length, words = s.size[1];
  const days = (Date.parse(generated.slice(0, 10)) - Date.parse(repo.commit_date.slice(0, 10))) / 864e5, n = repo.lists.length;
  if (!Number.isInteger(days)) throw new Error('Quality score needs YYYY-MM-DD generated and commit dates');
  const pts = 8 * bits(s.checks).slice(1).filter(Boolean).length +
    (len >= 150 && len <= 600 ? 5 : len >= 100 && len <= 900 ? 3 : len >= 50 && len <= 1024 ? 1 : 0) +
    (BOUNDARY.test(desc) ? 4 : 0) + (EXAMPLE.test(desc) ? 3 : 0) +
    (words >= 500 && words <= 3000 ? 7 : words >= 250 && words <= 4500 ? 4 : words >= 100 ? 1 : 0) +
    (s.kinds.includes('r') ? 3 : 0) + (s.kinds.includes('s') ? 2 : 0) +
    (days <= 30 ? 9 : days <= 90 ? 6 : days <= 180 ? 3 : days <= 365 ? 1 : 0) +
    (n >= 4 ? 7 : n === 3 ? 4 : n === 2 ? 3 : n === 1 ? 1 : 0) +
    (declared(s.allowed_tools) ? 2 : 0) + (declared(s.compatibility) ? 2 : 0);
  return Math.min(pts, 99);
}
export function listed(s) {
  return structuralPass(s.checks) && bits(s.checks)[CHECK_IDS.indexOf('license')];
}
export function qualifies(s) {
  return listed(s) && Number.isInteger(s.score) && s.score >= 80 && s.score <= 99 && letterGrade(s.score) === s.grade;
}
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'skill';
export function listingTarget(s) {
  const repoSlug = s.repo.split('/').map(slugify).join('/');
  return `${BASE}/directory/${repoSlug}/${s.featured ? `${s.slug}/` : `#${s.slug}`}`;
}
export function badgePair(s) {
  if (!qualifies(s)) throw new Error('Only eligible, scored listings receive quality badges');
  const repoSlug = s.repo.split('/').map(slugify).join('/');
  const assetBase = `${BASE}/directory/${repoSlug}/${s.slug}/`;
  return [
    { kind: 'score', src: `${assetBase}score.svg`, alt: `Suede Skill Check: ${s.score}/100` },
    { kind: 'grade', src: `${assetBase}badge.svg`, alt: `Suede Skill Check: Grade ${s.grade}` },
  ];
}
export function badgeMarkdown(s) {
  return badgePair(s).map((b) => `[![${b.alt}](${b.src})](${listingTarget(s)})`).join('\n');
}
export function badgeHtml(s) {
  return badgePair(s).map((b) => `<a href="${listingTarget(s)}"><img src="${b.src}" alt="${b.alt}" width="160" height="175"></a>`).join('\n');
}
export function shieldSvg(score, kind) {
  const grade = letterGrade(score);
  if (!['A', 'B'].includes(grade) || !['score', 'grade'].includes(kind)) throw new Error('A shield requires a qualifying score and badge kind');
  const file = kind === 'grade' ? (grade === 'A' ? 'suede-certified-shield-gold-grade-a.svg' : 'suede-certified-shield-grade-b.svg') : (grade === 'A' ? 'suede-certified-shield-gold-score-template.svg' : 'suede-certified-shield-score-template.svg');
  let svg = fs.readFileSync(new URL(`./badges/${file}`, import.meta.url), 'utf8');
  const label = kind === 'score' ? `Suede Skill Check: ${score}/100; structural quality` : `Suede Skill Check: Grade ${grade}; structural quality`;
  svg = svg.replace(/aria-label="[^"]*"/, `aria-label="${label}"`).replace(/<title>.*?<\/title>/, `<title>${label}</title>`);
  if (kind === 'score') svg = svg.replace(/<!-- Replace SCORE[\s\S]*?-->/, '').replace('SCORE / 100', `${score} / 100`);
  return svg;
}
export function promotionActive(s, record, config, snapshot, now = new Date()) {
  if (!config.enabled || !qualifies(s) || record?.status !== 'verified') return false;
  if (!/^[a-f0-9]{64}$/.test(snapshot?.sha256 || '') || record.dataset_sha256 !== snapshot.sha256) return false;
  if (config.ends_at !== null && (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(config.ends_at) || !Number.isFinite(Date.parse(config.ends_at)) || now >= new Date(config.ends_at))) return false;
  const verified = Date.parse(record.verified_at);
  const generated = Date.parse(snapshot.date);
  const readme = record.readme_path;
  if (!Number.isFinite(generated) || !Number.isFinite(verified) || verified > now.getTime() || verified < generated) return false;
  if (typeof readme !== 'string' || !/(^|\/)README(?:\.(?:md|markdown|rst))?$/i.test(readme) || readme.split('/').some((p) => p === '..' || !p)) return false;
  const expected = badgePair(s).map((b) => b.src);
  return record.repo === s.repo && record.score === s.score && record.target === listingTarget(s) &&
    /^[a-f0-9]{40}$/.test(record.commit || '') && /^[a-f0-9]{64}$/.test(record.rendered_sha256 || '') &&
    Array.isArray(record.badges) && expected.some((b) => record.badges.includes(b));
}
