import { letterGrade } from './badges.mjs';
// Editorial judgments are separate from reproducible graded-v2 measurements.
// They never alter technical scores, eligibility, ranking or badge verification.
export function editorialRating(skill, ratings) {
  const r = ratings[skill.id];
  if (!r) return null;
  if (!Number.isInteger(r.score) || r.score < 0 || r.score > 99 || !/^\d{4}-\d{2}-\d{2}$/.test(r.date || '') || !Number.isFinite(Date.parse(r.date)) || typeof r.basis !== 'string' || !r.basis.trim() || !/^[a-f0-9]{40}$/.test(r.source_revision || '')) throw new Error(`Invalid editorial rating: ${skill.id}`);
  return { ...r, grade: letterGrade(r.score), method: 'owner-editorial-v1' };
}
