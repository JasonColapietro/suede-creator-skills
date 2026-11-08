#!/usr/bin/env node
// Builds the weekly Rising Skills newsletter draft from the directory's saved
// data: docs/directory/weekly.json, docs/directory/search-index.json,
// directory/growth/breakout.json and directory/growth/newsletter-playbook.json.
//
//   node scripts/directory/newsletter-issue.mjs   # writes directory/growth/issues/<date>.md
//
// Every number comes from those files. The playbook carries the owner-approved
// voice; the editor may sharpen hooks but keeps claims at full strength.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isFirstParty } from './task-pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = 'https://suedeai.directory';
const fmt = (n) => Number(n).toLocaleString('en-US');
const clip = (s, n = 130) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(' ', n)).replace(/[,;:]$/, '')}…`);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const pct = (n) => `${n > 0 ? '+' : ''}${n}%`;
const longDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });

export function demandScore(topics) {
  const rows = topics.filter((t) => t && t.change_pct !== null && t.weekly_installs > 0);
  if (!rows.length) return null;
  const last = rows.reduce((n, t) => n + t.weekly_installs, 0);
  const prev = rows.reduce((n, t) => n + t.weekly_installs / (1 + t.change_pct / 100), 0);
  const change = Math.round((last - prev) / prev * 100);
  const score = change >= 15 || (change >= 10 && last >= 20000) ? 5 : change >= 10 ? 4 : change >= 5 ? 3 : change >= 0 ? 2 : 1;
  return { score, change, installs: last };
}

export function toolsScore(skills, hasWorkflow) {
  const best = Math.max(0, ...skills.map((s) => s?.score || 0));
  const base = best >= 90 ? 5 : best >= 85 ? 4 : best >= 80 ? 3 : best ? 2 : 0;
  return Math.min(5, base + (hasWorkflow ? 1 : 0));
}

export function buildIssue({ index, feed, breakout, playbook, date }) {
  const studio = playbook.studio;
  const third = index.filter((s) => !isFirstParty(s));
  const byId = new Map(index.map((s) => [s.id, s]));
  const topic = new Map(feed.topics.map((t) => [t.id, t]));
  const url = (s) => `${SITE}${s.href.replace(/^\/directory/, '')}`;
  const link = (s) => `[${s.name}](${url(s)})`;
  const fill = (text) => text.replaceAll('{studio}', studio).replace(/\{skill:([^}]+)\}/g, (_, id) => (byId.get(id) ? url(byId.get(id)) : SITE));
  const tpl = ([slug, name]) => `[${name}](${studio}/build/new?template=${slug})`;
  const installs = (s) => s.installs || 0;

  const ideas = playbook.businesses.map((b) => {
    const d = demandScore(b.topics.map((t) => topic.get(t)));
    const skills = b.skills.map((id) => byId.get(id)).filter(Boolean);
    const hasWorkflow = /\/build\/new\?template=|\/company/.test(b.start);
    const demand = d ? d.score : b.demand_floor ?? 3;
    const tools = Math.max(toolsScore(skills, hasWorkflow), b.tools_floor || 0);
    const best = [...skills].sort((a, c) => c.score - a.score)[0];
    return { ...b, d, demand, tools, best, total: demand + tools + b.autonomy + b.buyers };
  });
  const rank = (m) => ideas.filter((i) => i.model === m).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  const ordered = [...rank('autonomous'), ...rank('service')];
  const top = [...ideas].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))[0];
  const ctaTpl = top.cta || ['seo-studio-ai-visibility-audit', 'AI Visibility Audit'];
  const cta = `**[→ Open the ${ctaTpl[1]} template](${studio}/build/new?template=${ctaTpl[0]})**`;

  const moving = feed.topics.filter((t) => playbook.money_topics.includes(t.id) && t.change_pct > 0 && t.weekly_installs >= 3000).sort((a, b) => b.change_pct - a.change_pct || b.weekly_installs - a.weekly_installs).slice(0, 10);
  const money = ['sales', 'lead-generation', 'landing-pages', 'seo', 'ads', 'crm', 'email', 'marketing-analytics', 'affiliate-referral', 'social-media-graphics']
    .map((id) => topic.get(id)).filter((t) => t && t.change_pct > 0).sort((a, b) => b.change_pct - a.change_pct).slice(0, 3);
  const rising = feed.rising.map((id) => feed.skills[id]).filter(Boolean);
  const lowGraded = rising.find((s) => s.grade === 'D') || rising.find((s) => s.grade === 'C');
  const aCount = third.filter((s) => s.grade === 'A').length;
  const topInstalled = [...third].sort((a, b) => installs(b) - installs(a)).slice(0, 10).map((s) => s.id);
  const topScored = [...third].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 10).map((s) => s.id);
  const overlap = topInstalled.filter((id) => topScored.includes(id)).length;
  const climbers = feed.climbing.map((id) => feed.skills[id]).filter(Boolean);
  const leadRepo = Object.entries(climbers.reduce((m, s) => ({ ...m, [s.repo]: [...(m[s.repo] || []), s] }), {})).sort((a, b) => b[1].length - a[1].length)[0];
  const repos = feed.repositories || [];
  const gainers = repos.filter((r) => r.gained > 0).sort((a, b) => b.gained - a.gained).slice(0, 5);
  const free = third.filter((s) => s.lane === 'free-open-source' && s.install_reviewed && s.score >= 90 && playbook.free_categories.includes(s.category)).sort((a, b) => installs(b) - installs(a)).slice(0, 5);
  const hero = breakout.repos[0];

  const job = (j) => {
    const hits = third.filter((s) => (s.topics || []).some((t) => j.topics.includes(t)));
    const best = j.no_skill ? null : (j.pin && byId.get(j.pin)) || hits.filter((s) => installs(s) >= 500).sort((a, b) => b.score - a.score || installs(b) - installs(a))[0];
    const popular = j.no_skill ? null : [...hits].sort((a, b) => installs(b) - installs(a))[0];
    const warn = (s) => (s && /restricted/.test(s.lane) ? ' ⚠️' : '');
    const parts = [];
    if (best) parts.push(`${link(best)} ${best.score} ${best.grade}${warn(best)}`);
    else parts.push('no strong skill yet');
    if (popular && best && popular.id !== best.id) parts.push(`most used ${link(popular)} ${popular.score} ${popular.grade}${warn(popular)}`);
    return `- **${j.label}:** ${parts.join(', ')}${j.template ? ` · run it: ${tpl(j.template)}` : ''}`;
  };
  const restricted = playbook.jobs.some((j) => /⚠️/.test(job(j)));

  const card = (i, n) => [
    `**#${n} · ${i.name} · ${i.total}/20${i === top ? ' 🏆 most likely to succeed' : ''}**`,
    `- **What it is:** ${fill(i.pitch)}`,
    `- **Start with:** ${fill(i.start)}`,
    `- **Score:** Demand ${i.demand}${i.d ? ` (${i.topics.map((t) => topic.get(t)?.name).filter(Boolean).join(', ')}: ${pct(i.d.change)}, ${fmt(i.d.installs)} weekly installs)` : ''} · Tools ${i.tools}${i.best ? ` (${i.best.name} ${i.best.score} ${i.best.grade})` : ''} · Autonomy ${i.autonomy} · Buyers ${i.buyers}`,
    ...(i === top ? ['', `${cta} Building and previewing are free. Live runs bill from prepaid credit, with packs starting at $1.`] : []),
    '',
  ].join('\n');

  const L = [];
  L.push(`**Subject (A):** ${ideas.length} AI businesses you can launch this week`);
  L.push(`**Subject (B, test against A):** The AI business that scored ${top.total}/20 this week`, '');
  L.push(`**Preview text:** Ranked, with the template to start #1 today.${lowGraded ? ` Plus: a skill with ${fmt(lowGraded.weekly_installs)} installs this week got a ${lowGraded.grade} grade.` : ''}`, '', '---', '');
  L.push('# Rising Skills', '', `*Week of ${longDate(date)} · for builders using AI to make money*`, '', '## This week in 60 seconds', '');
  L.push(`- **The business most likely to succeed this week: ${top.name}.** ${cap(fill(top.pitch))} It scored **${top.total}/20** on our launch checklist. ${cta}`);
  if (money.length) L.push(`- **Money skills are climbing.** ${money.map((t) => `${t.name} ${pct(t.change_pct)}`).join(', ')} week over week.`);
  if (hero) L.push(`- **A new repo hit ${fmt(hero.stars)} stars in its first week.** [${hero.repo}](${hero.url}) leads the breakout list.`);
  if (lowGraded) L.push(`- **Popular isn't the same as good.** [${lowGraded.name}](${lowGraded.listing}) drew ${fmt(lowGraded.weekly_installs)} installs this week with a ${lowGraded.grade} grade, and only ${fmt(aCount)} of ${fmt(third.length)} skills earn an A. The 10 most-installed and the 10 best-graded skills have ${overlap === 0 ? 'zero' : overlap} in common.`);
  L.push('', '---', '', `## 💼 ${ideas.length} AI businesses in two models, ranked by score: start with #1`, '');
  L.push('We scored each idea on four questions, 1–5 each, and ranked them by score within each business model:',
    '- **Demand:** is this week\'s install growth rising for this kind of work?',
    '- **Tools:** are B-grade or better skills and a ready-made workflow available?',
    '- **Autonomy:** can it run without you?',
    '- **Buyers:** do businesses already pay people to do this job?', '',
    '*These are our editorial scores from this week\'s data, not revenue forecasts.*', '');
  L.push('### Autonomous: the agent does the work and charges per job', '',
    `These start from Agent Studio's [self-running companies](${studio}/company), where each "employee" agent has a job and a price it charges per call. Every price below is the template's default charge, and you set your own.`, '');
  ordered.forEach((i, k) => {
    if (k === rank('autonomous').length) L.push('### You sell it, agents do the heavy lifting', '');
    L.push(card(i, k + 1));
  });
  L.push(`> **Know someone picking an AI side business? Forward them #1.**`, '', '---', '');
  L.push('## 🧰 Pick your stack: the best-graded tool for each money job', '', 'The best-graded skill people actually use (500+ installs), then the Agent Studio workflow that runs the job for you.', '');
  L.push(...playbook.jobs.map(job), '');
  if (restricted) L.push('⚠️ Anthropic\'s document skills (docx, pdf, xlsx) use a restricted license. Read the terms before using them in paid client work.', '');
  L.push('**Rule of thumb:** use skills when you\'re at the keyboard with Claude Code, Codex or Cursor. Use an Agent Studio workflow when the job should run on a schedule, or for a paying customer, without you.', '');
  if (moving.length) {
    L.push(`## 📈 Where buyers' work is moving: ${pct(moving.at(-1).change_pct)} to ${pct(moving[0].change_pct)} this week`, '', 'Weekly installs for each use case, compared with the week before:', '');
    L.push(...moving.map((t) => `- [${t.name}](${SITE}/topics/${t.id}/): ${pct(t.change_pct)} (${fmt(t.weekly_installs)})`), '');
    if (leadRepo) L.push(`**Leading the climb:** ${leadRepo[1].length} skills from [${leadRepo[0]}](${SITE}/${leadRepo[0].toLowerCase()}/), up ${Math.min(...leadRepo[1].map((s) => s.change_pct))}–${Math.max(...leadRepo[1].map((s) => s.change_pct))}%.`, '');
  }
  if (breakout.repos.length) {
    L.push('## 🚀 Breakout repos: new this week, ranked by stars', '', `Created ${shortDate(breakout.since)} – ${shortDate(breakout.date)} and starred fastest. These are too new to be graded, so read the source before you install.`, '');
    L.push(...breakout.repos.slice(0, 8).map((r) => `- **[${r.repo}](${r.url})** · ${fmt(r.stars)} ⭐: ${r.description}`), '');
  }
  if (gainers.length) L.push(`**Most stars gained this week:** ${gainers.map((r) => `${r.repo} (+${fmt(r.gained)})`).join(', ')}.`, '');
  else if (repos.length) L.push(`**All-time leaders:** ${repos.slice(0, 2).map((r) => `${r.repo} (${fmt(r.stars)} stars)`).join(' and ')}. Starting next week, this spot shows who gained the most stars that week.`, '');
  if (free.length) {
    L.push(`## 🆓 ${free.length} A-grade skills you can use free`, '', 'Open-source license and no paid service required:', '');
    L.push(...free.map((s) => `- ${link(s)} · ${s.score} ${s.grade}. ${clip(s.description)}`), '');
  }
  L.push('---', '', '## 🤖 Get this briefing from your own AI agent', '', 'Install the free finder skill once:', '', '```',
    'npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/directory/suede-directory', '```', '',
    `Then ask your agent: **"Brief me on agent skills for sales, video and SEO, and remember those interests."** Each week it pulls the rising skills, fastest-growing topics, new listings and repo stars for just what you care about. Your interests stay on your machine. [How it works →](${SITE}/finder/#briefing)`, '',
    `**Ready to start #1? [→ Open the ${ctaTpl[1]} template](${studio}/build/new?template=${ctaTpl[0]})**`, '',
    `**Next week:** a new ranking, plus who gained the most GitHub stars that week. Got this forwarded? [Subscribe](${playbook.subscribe}) so you get the next one.`, '', '---', '',
    `*Install counts come from skills.sh and cover installs made with the skills CLI during the week ending ${shortDate(feed.install_snapshot)}. Grades come from the ${longDate(feed.quality_snapshot)} Suede AI Skills Directory snapshot. Star counts are from GitHub on ${shortDate(feed.stars_snapshot || date)}. Suede AI's own skills are excluded from every directory ranking. Agent Studio prices are template defaults; live runs bill from prepaid credit, with packs starting at $1. Publish skills? If yours scores 80 or higher, [add a quality badge to your README](${SITE}/badges/).*`, '');
  return L.join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
  const breakout = read('directory/growth/breakout.json');
  const md = buildIssue({ index: read('docs/directory/search-index.json'), feed: read('docs/directory/weekly.json'), breakout, playbook: read('directory/growth/newsletter-playbook.json'), date: breakout.date });
  const out = path.join(root, 'directory/growth/issues', `${breakout.date}.md`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, md);
  console.log(`Wrote ${path.relative(root, out)}`);
}
