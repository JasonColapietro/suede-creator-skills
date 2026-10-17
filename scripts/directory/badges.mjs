import fs from 'node:fs';

export const BASE = 'https://skills.suedeai.ai';
export const CHECK_IDS = ['frontmatter', 'name_format', 'name_matches_folder', 'description_length', 'description_trigger', 'concise_body', 'license', 'maintained'];
export function letterGrade(score) {
  if (score === null) return null;
  if (!Number.isInteger(score) || score < 0 || score > 100) throw new Error('Quality score must be an integer from 0 to 100');
  return score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';
}
export function qualityScore(checks) {
  if (checks === null) return null;
  return Math.round(100 * CHECK_IDS.slice(1).filter((id, i) => typeof checks === 'string' ? checks[i + 1] === '1' : checks?.[id] === true).length / 7);
}
export function qualifies(s) {
  const checks = typeof s.checks === 'string' ? Object.fromEntries(CHECK_IDS.map((id, i) => [id, s.checks[i] === '1'])) : s.checks;
  return Number.isInteger(s.score) && s.score >= 80 && s.score <= 100 && checks?.frontmatter === true && checks?.license === true && qualityScore(s.checks) === s.score && letterGrade(s.score) === s.grade;
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
