#!/usr/bin/env node
// Appends a GitHub stargazer snapshot for every listed repository to
// directory/growth/github-stars.json, keeping the last eight snapshots so the
// weekly feed can report stars gained between consecutive snapshots.
//
//   node scripts/directory/github-stars.mjs           # fetch and append today's snapshot
//   node scripts/directory/github-stars.mjs --check   # validate the committed file
//
// Reads the public GitHub search API, five repositories per query. Set
// GITHUB_TOKEN for the authenticated rate limit (30 searches a minute);
// unauthenticated runs pause between queries to stay under 10 a minute.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(root, 'directory/growth/github-stars.json');
const KEEP = 8;

export function validateStars(doc) {
  if (!doc || !Array.isArray(doc.snapshots) || !doc.snapshots.length) throw new Error('github-stars.json: snapshots must be a non-empty array');
  let last = '';
  for (const s of doc.snapshots) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date || '') || s.date <= last) throw new Error('github-stars.json: snapshot dates must be YYYY-MM-DD and ascending');
    last = s.date;
    for (const [repo, n] of Object.entries(s.stars || {})) {
      if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !Number.isInteger(n) || n < 0) throw new Error(`github-stars.json: bad entry ${repo}`);
    }
  }
  if (doc.snapshots.length > KEEP) throw new Error(`github-stars.json: keep at most ${KEEP} snapshots`);
  return doc;
}

// Stars gained between the two latest snapshots, for repositories present in both.
export function starGains(doc) {
  const cur = doc.snapshots.at(-1), prev = doc.snapshots.length > 1 ? doc.snapshots.at(-2) : null;
  const out = {};
  for (const [repo, n] of Object.entries(cur.stars)) {
    out[repo] = { stars: n, gained: prev && Number.isInteger(prev.stars[repo]) ? n - prev.stars[repo] : null };
  }
  return { date: cur.date, since: prev ? prev.date : null, repos: out };
}

async function fetchStars(repos) {
  const token = process.env.GITHUB_TOKEN;
  const stars = {};
  for (let i = 0; i < repos.length; i += 5) {
    const q = repos.slice(i, i + 5).map((r) => `repo:${r}`).join(' ');
    const res = await fetch(`https://api.github.com/search/repositories?per_page=10&q=${encodeURIComponent(q)}`, {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'suede-directory-stars', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`GitHub search returned HTTP ${res.status}`);
    const byLower = new Map(repos.slice(i, i + 5).map((r) => [r.toLowerCase(), r]));
    for (const item of (await res.json()).items || []) {
      const repo = byLower.get(item.full_name.toLowerCase());
      if (repo) stars[repo] = item.stargazers_count;
    }
    await new Promise((r) => setTimeout(r, token ? 2200 : 6500));
  }
  return stars;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const doc = validateStars(JSON.parse(fs.readFileSync(FILE, 'utf8')));
  if (!process.argv.includes('--check')) {
    const index = JSON.parse(fs.readFileSync(path.join(root, 'docs/directory/search-index.json'), 'utf8'));
    const repos = [...new Set(index.map((s) => s.repo))].sort();
    const date = new Date().toISOString().slice(0, 10);
    const stars = Object.fromEntries(Object.entries(await fetchStars(repos)).sort());
    doc.snapshots = [...doc.snapshots.filter((s) => s.date !== date), { date, stars }].slice(-KEEP);
    fs.writeFileSync(FILE, JSON.stringify(validateStars(doc), null, 2) + '\n');
    console.log(`Recorded stars for ${Object.keys(stars).length} of ${repos.length} repositories on ${date}.`);
  } else console.log(`github-stars.json is valid (${doc.snapshots.length} snapshots).`);
}
