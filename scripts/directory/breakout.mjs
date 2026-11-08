#!/usr/bin/env node
// Finds the week's breakout agent repositories: created in the last seven days
// and ranked by GitHub stars, for the Rising Skills newsletter.
//
//   GITHUB_TOKEN=... node scripts/directory/breakout.mjs   # writes directory/growth/breakout.json
//   node scripts/directory/breakout.mjs --check            # validates the committed file
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(root, 'directory/growth/breakout.json');
export const QUERIES = ['claude skills', 'agent skills', 'claude code', 'mcp server', 'ai agent', 'codex', 'cursor', 'n8n', 'ai automation', 'agentic'];

// Lures that impersonate tools to spread malware share a look: game cheats,
// trainers, cracks and keygens, or a description that names no real function.
const LURE = /\b(trainer|cheats?|crack(ed)?|keygen|activator|loader|injector|executor|spoofer|aimbot|unlocker|free[- ]download|mod menu)\b/i;
export function isLikelyLure(repo) {
  const text = `${repo.full_name} ${repo.description || ''}`;
  return LURE.test(text) || !(repo.description || '').trim();
}

export function pickBreakouts(items, { limit = 12, since } = {}) {
  const seen = new Set();
  return items
    .filter((r) => !r.fork && !r.archived && (!since || r.created_at.slice(0, 10) >= since) && !isLikelyLure(r))
    .sort((a, b) => b.stargazers_count - a.stargazers_count || a.full_name.localeCompare(b.full_name))
    .filter((r) => (seen.has(r.full_name.toLowerCase()) ? false : seen.add(r.full_name.toLowerCase())))
    .slice(0, limit)
    .map((r) => ({ repo: r.full_name, url: r.html_url, stars: r.stargazers_count, created: r.created_at.slice(0, 10),
      language: r.language || null, license: r.license?.spdx_id || null, description: (r.description || '').replace(/\s+/g, ' ').trim().slice(0, 220) }));
}

export function validateBreakout(doc) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(doc?.date || '') || !/^\d{4}-\d{2}-\d{2}$/.test(doc?.since || '') || !Array.isArray(doc.repos)) throw new Error('breakout.json: date, since and repos are required');
  for (const r of doc.repos) {
    if (!/^[\w.-]+\/[\w.-]+$/.test(r.repo) || !r.url?.startsWith('https://github.com/') || !Number.isInteger(r.stars)) throw new Error(`breakout.json: bad entry ${r.repo}`);
  }
  return doc;
}

async function search(q, since) {
  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/search/repositories?sort=stars&order=desc&per_page=30&q=${encodeURIComponent(`${q} created:>=${since}`)}`;
  const res = await fetch(url, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'suede-directory-breakout', ...(token ? { authorization: `Bearer ${token}` } : {}) }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`GitHub search returned HTTP ${res.status}`);
  await new Promise((r) => setTimeout(r, token ? 2200 : 6500));
  return (await res.json()).items || [];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) {
    validateBreakout(JSON.parse(fs.readFileSync(FILE, 'utf8')));
    console.log('breakout.json is valid');
  } else {
    const date = new Date().toISOString().slice(0, 10);
    const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const items = [];
    for (const q of QUERIES) items.push(...await search(q, since));
    const doc = validateBreakout({ date, since, source: 'https://api.github.com/search/repositories', repos: pickBreakouts(items, { since }) });
    fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + '\n');
    console.log(`Recorded ${doc.repos.length} breakout repositories created since ${since}.`);
  }
}
