// Evidence-backed discovery surfaces. All values come from the saved dataset;
// these pages never imply a fresh scan, runtime test or editorial endorsement.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isFirstParty } from './task-pages.mjs';
import { starGains, validateStars } from './github-stars.mjs';

export function comparisonPairs(topics, installsFor, limit = 50, retained = null, skills = []) {
  const candidates = new Map();
  for (const t of topics) {
    const rows = t.rows.filter(s => !isFirstParty(s))
      .sort((a, b) => (installsFor(b)?.installs || 0) - (installsFor(a)?.installs || 0) || b.score - a.score || a.id.localeCompare(b.id)).slice(0, 5);
    for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
      if (rows[i].repo === rows[j].repo) continue;
      const [a, b] = [rows[i], rows[j]].sort((x, y) => x.id.localeCompare(y.id));
      const key = `${a.id}|${b.id}`;
      if (!candidates.has(key)) candidates.set(key, { a, b, topics: [], demand: Math.min(installsFor(a)?.installs || 0, installsFor(b)?.installs || 0) });
      candidates.get(key).topics.push(t.topic);
    }
  }
  let chosen = [...candidates.values()].sort((a, b) => b.demand - a.demand || a.a.id.localeCompare(b.a.id) || a.b.id.localeCompare(b.b.id)).slice(0, limit);
  if (retained) {
    const byId = new Map(skills.map(s => [s.id, s]));
    const topicById = new Map(topics.map(t => [t.topic.id, t.topic]));
    chosen = retained.map(p => ({ a: byId.get(p.skills[0]), b: byId.get(p.skills[1]),
      topics: p.topics.map(id => topicById.get(id) || { id, name: id.replaceAll('-', ' ') }) }))
      .filter(p => p.a && p.b && !isFirstParty(p.a) && !isFirstParty(p.b));
  }
  return chosen
    .map(p => ({ ...p, slug: `${p.a.slug.slice(0, 35)}-vs-${p.b.slug.slice(0, 35)}-${createHash('sha256').update(`${p.a.id}|${p.b.id}`).digest('hex').slice(0, 8)}` }));
}


// The machine-readable weekly feed agents read for personal briefings: what
// moved in the recorded week, by topic, plus new listings and repository stars.
// Every figure comes from the saved snapshots; nothing is fetched at build time.
export function weeklyFeed({ skills, topics, installsFor, installsDate, generated, stars, href }) {
  const third = skills.filter(s => !isFirstParty(s));
  const week = s => { const w = installsFor(s)?.weekly; return w && w.length >= 2 ? { last: w.at(-1), prev: w.at(-2) } : null; };
  const pct = (a, b) => (b > 0 ? Math.round((a - b) / b * 100) : null);
  const card = s => ({ id: s.id, name: s.display_name || s.name, repo: s.repo, description: String(s.description || '').slice(0, 220), score: s.score, grade: s.grade, category: s.category,
    topics: topicIds.get(s.id) || [], license: s.license, cost_lane: s.lane, listing: href(s), ...(week(s) ? { weekly_installs: week(s).last, change_pct: pct(week(s).last, week(s).prev) } : {}) });
  const topicIds = new Map(); for (const t of topics) for (const s of t.rows) topicIds.set(s.id, [...(topicIds.get(s.id) || []), t.topic.id]);
  const moving = third.filter(week);
  const topicRows = topics.map(t => {
    const rows = t.rows.filter(s => !isFirstParty(s));
    const w = rows.filter(week); const last = w.reduce((n, s) => n + week(s).last, 0), prev = w.reduce((n, s) => n + week(s).prev, 0);
    const best = [...rows].sort((a, b) => b.score - a.score || (installsFor(b)?.installs || 0) - (installsFor(a)?.installs || 0) || a.id.localeCompare(b.id)).slice(0, 3);
    return { id: t.topic.id, name: t.topic.name, skills: rows.length, weekly_installs: last, change_pct: pct(last, prev), best: best.map(s => s.id) };
  }).filter(t => t.skills).sort((a, b) => b.weekly_installs - a.weekly_installs || a.id.localeCompare(b.id));
  const newest = [...third].filter(s => s.listed_since).sort((a, b) => b.listed_since.localeCompare(a.listed_since) || b.score - a.score).slice(0, 50);
  const g = stars ? starGains(stars) : null;
  const repoStars = g ? Object.entries(g.repos).filter(([r]) => !isFirstParty({ repo: r })).map(([repo, v]) => ({ repo, ...v }))
    .sort((a, b) => (b.gained ?? -1) - (a.gained ?? -1) || b.stars - a.stars) : [];
  const ids = new Set([...moving.map(s => s.id), ...newest.map(s => s.id), ...topicRows.flatMap(t => t.best)]);
  return {
    about: 'Weekly feed of the Suede AI Skills Directory for agents and newsletters. Suede AI is excluded from every list. Quality scores measure published files, not runtime or security.',
    quality_snapshot: generated, install_snapshot: installsDate || null, install_source: 'https://skills.sh/',
    stars_snapshot: g?.date || null, stars_since: g?.since || null,
    rising: [...moving].sort((a, b) => week(b).last - week(a).last || a.id.localeCompare(b.id)).slice(0, 25).map(s => s.id),
    climbing: moving.filter(s => week(s).last >= 1000 && week(s).prev > 0).sort((a, b) => pct(week(b).last, week(b).prev) - pct(week(a).last, week(a).prev) || a.id.localeCompare(b.id)).slice(0, 25).map(s => s.id),
    new_listings: newest.map(s => s.id),
    topics: topicRows,
    repositories: repoStars,
    skills: Object.fromEntries(third.filter(s => ids.has(s.id)).sort((a, b) => a.id.localeCompare(b.id)).map(s => [s.id, card(s)])),
  };
}

export function renderGrowth(c) {
  const { root, files, data, page, crumbs, rel, url, esc, fmt, setKeywords, pageDate, publisher, directoryRef,
    skillPath, listingTarget, reportPanel, qualityBadgeBlock, installSection, factsTable, skillTitle, servicesCta, publisherClaim,
    installsFor, installsDate, topics, comparisonPlan, newsletter, skillReport } = c;
  const name = s => s.display_name || s.name;
  const link = (here, s) => `<a href="${rel(here, listingTarget(s).replace('https://skills.suedeai.ai/', ''))}">${esc(name(s))}</a>`;
  const reportLink = (here, s) => `<a href="${rel(here, `${skillPath(s)}report.json`)}">Score report</a>`;
  const table = (heads, rows) => `<div class="table-wrap"><table class="checks"><thead><tr>${heads.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  function emit({ here, title, description, heading = title, body, trail = [], mainEntity, type = 'WebPage', keywords, h1Html }) {
    const bc = crumbs(here, [['directory/', 'Directory'], ...trail, [null, heading]]);
    files.set(`${here}index.html`, page({ here, title, description, keywords: setKeywords(here, keywords || [heading.toLowerCase(), 'graded agent skills', 'Suede AI Skills Directory']),
      h1Html: h1Html || `<div class="eyebrow">Suede AI Skills Directory</div><h1>${esc(heading)}</h1>`, body: `${bc.html}\n${body}`,
      jsonld: [{ '@context': 'https://schema.org', '@type': type, '@id': `${url(here)}#page`, name: title, description, url: url(here), dateModified: pageDate, publisher, isPartOf: directoryRef,
        breadcrumb: { '@id': `${url(here)}#breadcrumb` }, ...(mainEntity ? { mainEntity } : {}) }, bc.ld],
      footerNote: `Published by Suede AI from the ${esc(data.generated)} directory snapshot. Source repositories belong to their publishers.`,
    }));
  }

  for (const s of data.skills.filter(s => s.full_page && !s.featured)) {
    const here = skillPath(s);
    const title = skillTitle(s);
    const description = `${name(s)} by ${s.owner}: ${s.score}/100 (${s.grade}). Read the score breakdown, source, license and installation route.`;
    const meta = description.length > 160 ? `${name(s).slice(0, 65)}: ${s.score}/100 (${s.grade}). ${s.repo.slice(0, 45)}. Read the score, license and source report.` : description;
    emit({ here, title, description: meta, heading: name(s), keywords: [`${s.name} skill by ${s.repo}`, `${s.category} skills`, "agent skill assessment"], trail: [[`directory/${s.category}/`, s.category]],
      h1Html: `<div class="eyebrow">Agent skill &middot; ${esc(s.category)} &middot; ${esc(s.owner)}</div><h1>${esc(name(s))} <span class="h1-sub">agent skill by ${esc(s.owner)}</span></h1>`,
      body: `<p class="lead">${esc(s.description)}</p>
<section class="panel"><h2>Source and license</h2>${factsTable([
        ['Publisher', `<a href="https://github.com/${esc(s.owner)}">${esc(s.owner)}</a>`],
        ['Repository', `<a href="${esc(s.folder_url)}">${esc(s.repo)}</a>`],
        ['License', `<a href="${esc(s.license_url)}">${esc(s.license)}</a>`],
        ['Snapshot', esc(data.generated)], ['Last repository commit', esc(s.commit_date)],
        ['Instruction size', `${fmt(s.body_words)} words; ${fmt(s.body_lines)} lines`], ['Bundled files', fmt(s.file_count)],
      ])}<p><a href="${esc(s.skill_md_url)}">Read the publisher’s SKILL.md</a></p></section>
<section class="panel" id="check"><h2>Suede Skill Check: ${s.score}/100 · ${s.grade}</h2>${reportPanel(here, s)}
${table(['Component', 'Points earned', 'Available'], s.score_parts.map(p => [esc(p.label), p.points, p.max]))}
<p>The published score is capped at 99. It measures the published files, documentation and maintenance signals. Security scan: not scanned. This assessment does not include a runtime test or a full installation-dependency review.</p></section>
${installSection(here, s)}${qualityBadgeBlock(here, s)}${servicesCta("skill", s.category, here, { compact: true, publisher: publisherClaim(here) })}
<section class="panel"><h2>Compare skills for this task</h2><p><a href="${rel(here, `directory/${s.category}/`)}">Browse ${esc(s.category)} skills</a> or <a href="${rel(here, 'directory/compare/')}">compare scores side by side</a>.</p></section>`,
      mainEntity: { '@type': 'SoftwareSourceCode', name: name(s), description: s.description, codeRepository: s.folder_url, license: s.license_url, programmingLanguage: 'Markdown' },
    });
  }

  const comparisonTitles = new Set();
  const pairLinks = comparisonPlan.map(p => [p, `directory/compare/skills/${p.slug}/`]);
  for (const [p, here] of pairLinks) {
    const { a, b } = p;
    const heading = `${name(a)} vs ${name(b)}`;
    const baseTitle = `${name(a).slice(0, 25)} vs ${name(b).slice(0, 25)}`;
    let title = baseTitle.length < 20 ? `${baseTitle} | Skill comparison` : baseTitle;
    if (comparisonTitles.has(title.toLowerCase())) title = `${name(a).slice(0, 16)} vs ${name(b).slice(0, 16)}: ${a.owner.slice(0, 16)}`;
    if (comparisonTitles.has(title.toLowerCase())) throw new Error(`Duplicate comparison title: ${title}`);
    comparisonTitles.add(title.toLowerCase());
    emit({ here, title: title.length < 20 ? `${title} skills` : title, description: `Compare ${name(a).slice(0, 35)} and ${name(b).slice(0, 35)}: quality scores, licenses, install routes and component evidence from the directory.`, heading, keywords: [`${p.a.id} vs ${p.b.id}`, "compare agent skills", "agent skill quality"],
      trail: [['directory/compare/', 'Compare']],
      body: `<p class="lead">A comparison selected for ${esc(p.topics.map(t => t.name).join(', '))}. Compare the task description and license first, then use the score breakdown to inspect their published files.</p>
<p>Quality snapshot: ${esc(data.generated)}. Install counts: skills.sh, ${esc(installsDate || 'unavailable')}. This pair was selected from shared topics and recorded installs; it is not a claim about joint search volume.</p>
<section class="panel"><h2>At a glance</h2>${table(['Evidence', `${name(a)} (${a.repo})`, `${name(b)} (${b.repo})`], [
        ['Listing', link(here, a), link(here, b)], ['Task', esc(a.description), esc(b.description)],
        ['Quality score', `${a.score}/100 · ${a.grade}`, `${b.score}/100 · ${b.grade}`],
        ['License', esc(a.license), esc(b.license)], ['Cost lane', esc(a.lane), esc(b.lane)],
        ['Recorded installs', installsFor(a) ? fmt(installsFor(a).installs) : 'Not recorded', installsFor(b) ? fmt(installsFor(b).installs) : 'Not recorded'],
        ['Report', reportLink(here, a), reportLink(here, b)],
      ])}</section>
<section class="panel"><h2>Where the scores differ</h2>${table(['Component', name(a), name(b)], a.score_parts.map((part, i) => [esc(part.label), `${part.points} / ${part.max}`, `${b.score_parts[i].points} / ${part.max}`]))}
<p>${a.score === b.score ? 'Both skills have the same total score.' : `${esc(name(a.score > b.score ? a : b))} has the higher structural-quality score by ${Math.abs(a.score - b.score)} points.`} Use the task descriptions above to judge fit. These scores do not measure runtime performance or security.</p></section>
<section class="panel"><h2>Inspect before installing</h2><p>${link(here, a)} and ${link(here, b)} link to their publishers, licenses and installation routes. Read the source before giving either skill access to your project.</p></section>`,
    });
  }
  files.set('directory/comparisons.json', JSON.stringify(pairLinks.map(([p, here]) => ({ skills: [p.a.id, p.b.id], topics: p.topics.map(t => t.id), href: `/${here}`, snapshot: data.generated })), null, 2) + '\n');

  const here = 'directory/state-of-agent-skills/';
  const thirdParty = data.skills.filter(s => !isFirstParty(s));
  const grades = Object.fromEntries(['A', 'B', 'C', 'D'].map(g => [g, thirdParty.filter(s => s.grade === g).length]));
  const pct = n => (100 * n / thirdParty.length).toFixed(1);
  const laneLabel = id => ({ 'free-open-source': 'Free and open source', 'free-with-service': 'Free skill, needs a service', noncommercial: 'Non-commercial license', restricted: 'Restricted license' }[id] || id);
  const counts = key => Object.entries(thirdParty.reduce((acc, s) => { acc[s[key]] = (acc[s[key]] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const components = thirdParty[0]?.score_parts.map((p, i) => ({ name: p.label, max: p.max, missing: thirdParty.filter(s => s.score_parts[i].points < p.max).length,
    lost: thirdParty.reduce((n, s) => n + p.max - s.score_parts[i].points, 0) })).sort((a, b) => b.lost - a.lost) || [];
  const popular = [...thirdParty].filter(s => installsFor(s)).sort((a, b) => installsFor(b).installs - installsFor(a).installs || a.id.localeCompare(b.id)).slice(0, 10);
  const top = [...thirdParty].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 10);
  const overlap = popular.filter(s => top.some(t => t.id === s.id)).length;
  const stats = { snapshot: data.generated, install_snapshot: installsDate, scope: 'Third-party listed skills; Suede AI excluded', total: thirdParty.length, grades, cost_lanes: counts('lane'), categories: counts('category'), components, top_ten_overlap: overlap };
  files.set(`${here}data.json`, JSON.stringify(stats, null, 2) + '\n');
  files.set(`${here}grades.csv`, 'grade,skills,percent\n' + Object.entries(grades).map(([g, n]) => `${g},${n},${pct(n)}`).join('\n') + '\n');
  const colors = { A: '#00ca52', B: '#50a8ff', C: '#ffb200', D: '#a0a0a0' };
  files.set(`${here}grades.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="390" viewBox="0 0 960 390" role="img" aria-labelledby="title desc"><title id="title">Agent skill grade distribution</title><desc id="desc">${Object.entries(grades).map(([g, n]) => `${g}: ${n} skills`).join('; ')}. Snapshot ${esc(data.generated)}; Suede AI excluded.</desc><rect width="960" height="390" fill="#000"/><g font-family="sans-serif" fill="#ededed"><text x="32" y="42" font-size="26">State of Agent Skills · ${esc(data.generated)}</text>${Object.entries(grades).map(([g, n], i) => `<text x="32" y="${100 + i * 62}" font-size="20">${g}</text><rect x="75" y="${77 + i * 62}" width="${Math.round(n / Math.max(...Object.values(grades)) * 630)}" height="32" fill="${colors[g]}"/><text x="730" y="${100 + i * 62}" font-size="19">${fmt(n)} (${pct(n)}%)</text>`).join('')}<text x="32" y="365" font-size="15">Source: suedeai.directory · ${fmt(thirdParty.length)} third-party skills · structural quality</text></g></svg>`);
  const ranking = rows => table(['Skill', 'Quality score', 'Recorded installs'], rows.map(s => [link(here, s), `${s.score}/100 · ${s.grade}`, installsFor(s) ? fmt(installsFor(s).installs) : 'Not recorded']));
  emit({ here, title: 'State of Agent Skills: Quality, Adoption and Licenses', heading: 'State of Agent Skills',
    description: `${fmt(thirdParty.length)} third-party agent skills assessed: ${pct(grades.A)}% earn an A. Explore grades, licenses, missing points and popularity versus quality.`,
    body: `<p class="lead">${fmt(grades.A)} of ${fmt(thirdParty.length)} third-party agent skills earn an A (${pct(grades.A)}%). Every grade comes from the published files and the same 0–99 rubric.</p>
<p>Quality snapshot: <time datetime="${data.generated}">${data.generated}</time>. Install snapshot: ${esc(installsDate || 'unavailable')}. This is the directory’s listed sample, not a census of all agent skills. Suede AI’s own skills are excluded from every figure and ranking in this report.</p>
<section class="panel"><h2>How the grades fall</h2><img src="grades.svg" alt="${esc(Object.entries(grades).map(([g, n]) => `${g}: ${fmt(n)} skills (${pct(n)}%)`).join('; '))}" width="960" height="390" style="width:100%;height:auto">${table(['Grade', 'Skills', 'Share'], Object.entries(grades).map(([g, n]) => [g, fmt(n), `${pct(n)}%`]))}<p><a href="grades.svg" download>Download chart (SVG)</a> · <a href="grades.csv" download>Download grade data (CSV)</a> · <a href="data.json">Report data (JSON)</a></p></section>
<section class="panel"><h2>Where skills leave points on the table</h2>${table(['Score component', 'Skills below maximum', 'Total unearned points'], components.map(p => [esc(p.name), fmt(p.missing), fmt(p.lost)]))}<p>Unearned rubric points are opportunities to improve the published assessment. They are not evidence that a skill fails at its task. <a href="${rel(here, 'directory/check/')}">Check your own skill</a>.</p></section>
<section class="panel"><h2>Popularity and quality answer different questions</h2><p>The ten most installed skills and the ten highest-scoring skills share ${overlap} ${overlap === 1 ? 'entry' : 'entries'}. Equal quality scores are ordered by listing ID, so this overlap depends on the stated tie-break. Install counts come from skills.sh; missing counts are not zero.</p><h3>Most installed</h3>${ranking(popular)}<h3>Highest scores</h3>${ranking(top)}</section>
<section class="panel"><h2>Licenses and service requirements</h2>${table(['Cost and license lane', 'Skills'], counts('lane').map(([k, n]) => [esc(laneLabel(k)), fmt(n)]))}<p>Cost lanes use recorded license and installation evidence. Compact assessments may not include a full service-dependency review; always check the publisher’s terms.</p></section>
<section class="panel"><h2>The largest categories</h2>${table(['Category', 'Skills'], counts('category').map(([k, n]) => [`<a href="${rel(here, `directory/${k}/`)}">${esc(k.replaceAll('-', ' '))}</a>`, fmt(n)]))}</section>
<section class="panel"><h2>Read the evidence</h2><p><a href="${rel(here, 'directory/methodology/')}">Published grading rubric</a> · <a href="${rel(here, 'directory/api/')}">Open index and per-skill reports</a> · <a href="${rel(here, 'directory/finder/')}">Find skills inside your agent</a></p><p>Scores measure structure, documentation, bundled files, maintenance and curated-list citations. No third-party code was executed; no runtime or security results are inferred.</p></section>`,
  });

  const finder = 'directory/finder/';
  emit({ here: finder, title: 'Find Graded Agent Skills from Claude Code or Codex', heading: 'Find graded skills inside your agent',
    description: 'Install the Suede directory finder for Claude Code, Codex or Cursor. Search by task and compare quality scores, licenses, reports and install commands.',
    body: `<p class="lead">Ask “find a graded skill for React testing” and get a shortlist with scores, licenses, source reports and install commands.</p>
<section class="panel"><h2>Install the finder</h2><pre><code id="finder-install">npx skills add https://github.com/JasonColapietro/suede-creator-skills/tree/main/directory/suede-directory</code></pre><button class="button" type="button" data-copy-target="finder-install">Copy install command</button><p>Choose your agent when the skills CLI asks. The finder requires Node.js 22 or later and reads the public index over HTTPS.</p><p><a href="https://github.com/JasonColapietro/suede-creator-skills/tree/main/directory/suede-directory">Inspect the source and SKILL.md</a> · <a href="SKILL.md" download>Download SKILL.md</a> · <a href="search.mjs" download>Download the search script</a></p></section>
<section class="panel"><h2>Try these requests</h2><ul><li>Find a free, graded skill for React testing.</li><li>Compare the best-scoring PostgreSQL skills and show their licenses.</li><li>Find a security-review skill scoring at least 80 and show its report.</li></ul><p>Searches run locally against the downloaded index. The finder returns commands for you to inspect; it does not install or execute a discovered skill. Suede AI’s own skills are excluded from its rankings.</p></section>
<section class="panel" id="briefing"><h2>Get a weekly briefing on what you care about</h2><p>Tell your agent your interests once, and it summarizes each week’s rising skills, fastest-growing topics, new listings and repository stars for just those areas.</p><p>Try: “Brief me on agent skills for marketing, sales and video, and remember those interests.”</p><p>The finder saves your interests on your own machine and reads the public <a href="${rel(finder, 'directory/weekly.json')}">weekly feed</a>. To get it every week, ask your agent to schedule the briefing, for example with <code>/loop 7d brief me on agent skills</code> in Claude Code or a scheduled task in Codex or Cursor.</p><pre><code>node brief.mjs --interests "marketing, sales, video" --save</code></pre><p><a href="brief.mjs" download>Download the briefing script</a></p></section>
<section class="panel"><h2>Use it without an agent</h2><p>Save the search script, then run:</p><pre><code>node search.mjs "react testing" --min-score 80 --limit 5</code></pre><p>Scores describe structural quality in the dated snapshot. They do not certify runtime performance or security. <a href="${rel(finder, 'directory/api/')}">Read the API documentation</a>.</p></section>`,
  });
  const finderSource = path.join(root, 'directory/suede-directory');
  files.set(`${finder}SKILL.md`, fs.readFileSync(path.join(finderSource, 'SKILL.md'), 'utf8'));
  files.set(`${finder}search.mjs`, fs.readFileSync(path.join(finderSource, 'scripts/search.mjs'), 'utf8'));
  files.set(`${finder}brief.mjs`, fs.readFileSync(path.join(finderSource, 'scripts/brief.mjs'), 'utf8'));

  const risingHere = 'directory/rising/';
  const rising = thirdParty.filter(s => (installsFor(s)?.weekly?.at(-1) || 0) > 0)
    .sort((a, b) => installsFor(b).weekly.at(-1) - installsFor(a).weekly.at(-1) || a.id.localeCompare(b.id)).slice(0, 5);
  const risingRows = rising.map(s => [link(risingHere, s), `${s.score}/100 · ${s.grade}`, fmt(installsFor(s).weekly.at(-1))]);
  const issue = [`# Rising Skills`, ``, `Install snapshot: ${installsDate}. Quality snapshot: ${data.generated}.`, ``,
    `The five listed skills with the most recorded installs in the final week of the saved skills.sh history. These are snapshot figures, not a live leaderboard.`, ``,
    ...rising.map(s => `- ${name(s)} (${s.repo}): ${s.score}/100, ${s.grade}; ${installsFor(s).weekly.at(-1)} installs in the recorded week. ${listingTarget(s).replace("https://skills.suedeai.ai/directory", "https://suedeai.directory")}`),
    ``, `Explore: https://suedeai.directory/top/`, `Read the report: https://suedeai.directory/state-of-agent-skills/`, ``,
  ].join('\n');
  files.set(`${risingHere}issue.md`, issue);
  emit({ here: risingHere, title: 'Rising Skills: Five Agent Skills to Explore Next', heading: 'Rising Skills',
    description: 'Explore five rising agent skills with their quality scores, licenses and sources. Read the latest saved weekly install snapshot from skills.sh.',
    body: `<p class="lead">Five skills to explore next, with quality scores and source reports alongside recorded adoption.</p><p>Install snapshot: ${esc(installsDate || 'unavailable')}. Quality snapshot: ${esc(data.generated)}. “Rising” means installs in the final recorded week of the saved skills.sh history, not growth since your last visit.</p>
<section class="panel"><h2>Top five in the recorded week</h2>${rising.length ? table(['Skill', 'Quality score', 'Weekly installs'], risingRows) : '<p>No weekly install history is available in this snapshot.</p>'}<p><a href="issue.md" download>Download this issue</a> · <a href="${rel(risingHere, 'directory/top/')}#rising">Explore the rising leaderboard</a></p></section>
<section class="panel"><h2>Follow new skills</h2>${newsletter.signup_url ? `<p><a class="button" href="${esc(newsletter.signup_url)}">Get Rising Skills by email</a></p>` : '<p>Email signup is not open yet. Follow new listings and guides through the RSS feed.</p>'}<p><a href="${rel(risingHere, 'directory/feed.xml')}">Subscribe by RSS</a></p></section>`,
  });

  renderBadgesHub({ data, emit, rel, esc, fmt, link, thirdParty });
  const starsFile = path.join(root, 'directory/growth/github-stars.json');
  const stars = fs.existsSync(starsFile) ? validateStars(JSON.parse(fs.readFileSync(starsFile, 'utf8'))) : null;
  files.set('directory/weekly.json', JSON.stringify(weeklyFeed({ skills: data.skills, topics, installsFor, installsDate, generated: data.generated, stars,
    href: s => listingTarget(s).replace('https://skills.suedeai.ai/directory', 'https://suedeai.directory') }), null, 2) + '\n');
}

// One page to send a publisher: what the quality badges are, who earns them,
// where to copy the snippet, and the repositories with the most eligible skills.
export function badgeHubStats(skills) {
  const eligible = skills.filter(s => Number.isInteger(s.score) && s.score >= 80 && s.score <= 99 && ['A', 'B'].includes(s.grade));
  const byRepo = new Map();
  for (const s of eligible) {
    const r = byRepo.get(s.repo) || { repo: s.repo, count: 0, best: null };
    r.count++;
    if (!r.best || s.score > r.best.score || (s.score === r.best.score && `${s.repo}/${s.name}`.localeCompare(`${r.best.repo}/${r.best.name}`) < 0)) r.best = s;
    byRepo.set(s.repo, r);
  }
  const repos = [...byRepo.values()].sort((a, b) => b.count - a.count || b.best.score - a.best.score || a.repo.localeCompare(b.repo));
  return { eligible: eligible.length, gradeA: eligible.filter(s => s.grade === 'A').length, gradeB: eligible.filter(s => s.grade === 'B').length, repos };
}

function renderBadgesHub({ data, emit, rel, esc, fmt, link, thirdParty }) {
  const here = 'directory/badges/';
  const st = badgeHubStats(thirdParty);
  const below = thirdParty.length - st.eligible;
  const rows = st.repos.slice(0, 25).map(r => [`<a href="${rel(here, `directory/${r.repo.split('/').map(seg => seg.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'skill').join('/')}/`)}">${esc(r.repo)}</a>`, fmt(r.count), `${link(here, r.best)} · ${r.best.score}/100 · ${r.best.grade}`]);
  emit({ here, title: 'Suede Skill Check Badges for Agent Skill READMEs', heading: 'Quality badges for your agent skill',
    keywords: ['agent skill badge', 'Claude Code skill badge', 'Suede Skill Check badge', 'README quality badge'],
    description: `${fmt(st.eligible)} listed agent skills qualify for a Suede Skill Check badge. Show your score in your README and link readers to the full report.`,
    body: `<p class="lead">Show readers your skill’s Suede Skill Check score right in your README. Each badge links to your listing, with the score breakdown, license, source and install command.</p>
<section class="panel"><h2>Two shields for skills scoring 80–99</h2><p class="shield-pair"><img src="${rel(here, 'directory/badges/grade-a.svg')}" alt="Suede Skill Check: Grade A" width="160" height="175" loading="lazy"> <img src="${rel(here, 'directory/badges/grade-b.svg')}" alt="Suede Skill Check: Grade B" width="160" height="175" loading="lazy"></p>
<p>Grade A (90–99) shows a gold shield; grade B (80–89) shows the standard shield. Each skill also gets a numeric score shield. In the ${esc(data.generated)} snapshot, ${fmt(st.eligible)} third-party skills qualify: ${fmt(st.gradeA)} at grade A and ${fmt(st.gradeB)} at grade B, across ${fmt(st.repos.length)} repositories.</p></section>
<section class="panel" id="get"><h2>Add your badge in three steps</h2><ol>
<li><b>Find your skill.</b> Search the <a href="${rel(here, 'directory/')}">directory</a> or run the <a href="${rel(here, 'directory/check/')}">free skill check</a> with your repository URL.</li>
<li><b>Copy the snippet.</b> Every eligible listing has a Badge section with Markdown and HTML for the score shield, the grade shield, or both.</li>
<li><b>Paste it into your README.</b> The image updates when the directory refreshes, so the badge always shows your current score.</li></ol>
<p>Display a linked badge, then <a href="${rel(here, 'directory/submit/')}">request badge verification</a>: eligible verified skills can receive a featured placement while the offer is open.</p></section>
<section class="panel"><h2>Repositories with the most badge-ready skills</h2><div class="table-wrap"><table class="checks"><thead><tr><th scope="col">Repository</th><th scope="col">Skills scoring 80+</th><th scope="col">Top skill</th></tr></thead><tbody>${rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p>Suede AI’s own skills are excluded from this list.</p></section>
<section class="panel" id="improve"><h2>Raise your score to 80</h2><p>${fmt(below)} listed skills score below 80. Your listing names the components with the most points still open, such as description length, examples, references and recent maintenance. Update your skill, then <a href="${rel(here, 'directory/submit/')}#improve">request a fresh review</a>.</p><p><a href="${rel(here, 'directory/methodology/')}">Read the scoring rubric</a></p></section>`,
  });
}
