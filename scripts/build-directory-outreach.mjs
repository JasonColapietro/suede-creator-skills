#!/usr/bin/env node
// Prepare, never send, a badge outreach queue from the published index.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { isFirstParty } from './directory/task-pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = JSON.parse(fs.readFileSync(path.join(root, 'docs/directory/search-index.json'), 'utf8'));
const source = JSON.parse(fs.readFileSync(path.join(root, 'directory/installs.json'), 'utf8'));
const absolute = p => `https://suedeai.directory${p.replace(/^\/directory/, '')}`;
const groups = new Map();
for (const s of index.filter(s => s.score >= 80 && !isFirstParty(s))) {
  if (!groups.has(s.repo)) groups.set(s.repo, []);
  groups.get(s.repo).push(s);
}
const queue = [...groups].map(([repo, skills]) => {
  skills.sort((a, b) => (b.installs || 0) - (a.installs || 0) || b.score - a.score || a.id.localeCompare(b.id));
  const s = skills[0];
  const report = absolute(s.report);
  const listing = absolute(s.href);
  return { repo, skill: s.name, score: s.score, grade: s.grade, eligible_skills: skills.length,
    recorded_eligible_installs: skills.reduce((n, s) => n + (s.installs || 0), 0), install_snapshot: source.fetched,
    listing, report, badge: `[![Suede Skill Check: ${s.score}/100](${report.replace(/report\.json$/, 'score.svg')})](${listing})`,
    status: 'draft; contact route and repository contribution policy need review',
  };
}).sort((a, b) => b.recorded_eligible_installs - a.recorded_eligible_installs || a.repo.localeCompare(b.repo)).slice(0, 25);
const markdown = ['# Badge outreach: first 25 repositories', '',
  `Prepared from the directory index (quality snapshot ${index[0].snapshot}; skills.sh install snapshot ${source.fetched}). Ordered by the sum of recorded installs for badge-eligible skills per repository. Missing install counts contribute no observed installs; they do not prove zero adoption.`, '',
  'Status: drafts only. Check directory/DISTRIBUTION.md and existing conversations for prior contact. Verify each maintainer’s published contact route and contribution policy before sending. Do not open unsolicited badge PRs. No featured-placement deadline or guaranteed promotion is asserted.', '',
  ...queue.flatMap((q, i) => [`## ${i + 1}. ${q.repo}`, '', `Eligible skills: ${q.eligible_skills}. Recorded eligible installs: ${q.recorded_eligible_installs.toLocaleString('en-US')}.`, '',
    `Subject: ${q.skill} scored ${q.score}/100 on Suede Skill Check`, '',
    `Hi ${q.repo.split('/')[0]} maintainers,`, '',
    `Your ${q.skill} skill scored ${q.score}/100 (grade ${q.grade}) in the Suede AI Skills Directory’s ${index[0].snapshot} assessment. The report shows every component and the source snapshot: ${q.report}`, '',
    `If that assessment is useful to your users, here is an optional README badge linking to the evidence:`, '', '```markdown', q.badge, '```', '',
    `Listing: ${q.listing}`, '', 'The badge reflects structural and documentation quality; it is not a security certification. If the source has changed, the listing has a recheck-request link.', '', 'Jason / Suede AI', '',
  ]),
].join('\n');
for (const [file, text] of [['badge-outreach.json', JSON.stringify(queue, null, 2) + '\n'], ['badge-outreach.md', markdown]]) {
  const dest = path.join(root, 'directory/growth', file);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(dest) || fs.readFileSync(dest, 'utf8') !== text) throw new Error(`${file} is stale; run node scripts/build-directory-outreach.mjs`);
  } else fs.writeFileSync(dest, text);
}
console.log(`Prepared ${queue.length} unsent badge outreach drafts.`);
