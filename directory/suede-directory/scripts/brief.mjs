#!/usr/bin/env node
// Personal weekly briefing from the Suede AI Skills Directory feed.
//   node brief.mjs --interests "marketing, sales, video" [--save] [--limit 5]
//   node brief.mjs                       # uses saved interests
// Reads only https://suedeai.directory/weekly.json. Interests stay on this
// machine (saved under $XDG_CONFIG_HOME or ~/.config/suede-directory/).
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

// Node's built-in fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY=1 (Node 22.21+).
// Agents in cloud sandboxes and company networks sit behind such proxies, so a
// failed fetch with a proxy configured is retried once with proxy support on.
export function proxyRetryEnv(error, env = process.env) {
  const proxy = env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy;
  if (!proxy || env.NODE_USE_ENV_PROXY === '1' || !/fetch failed/i.test(String(error?.message))) return null;
  return { ...env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' };
}

export const FEED_URL = 'https://suedeai.directory/weekly.json';
const ORIGIN = new URL(FEED_URL).origin;
export const interestsFile = (env = process.env) =>
  path.join(env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'suede-directory', 'interests.json');

export function parseInterests(text) {
  const list = [...new Set(String(text).toLowerCase().split(/[,;\n]+/).map(s => s.trim()).filter(Boolean))];
  if (!list.length) throw new Error('Provide at least one interest, for example --interests "marketing, sales"');
  if (list.length > 12 || list.some(s => s.length > 60)) throw new Error('Use up to 12 interests of up to 60 characters');
  return list;
}

const words = s => String(s).toLowerCase().match(/[\p{L}\p{N}+#]+/gu) || [];
const matches = (interest, ...fields) => {
  const hay = fields.join(' ').toLowerCase().replace(/-/g, ' ');
  return words(interest).every(w => hay.includes(w));
};

export function brief(feed, interests, { limit = 5 } = {}) {
  if (!feed || typeof feed.skills !== 'object' || !Array.isArray(feed.topics)) throw new Error('Invalid weekly feed');
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error('limit must be 1–20');
  const skills = feed.skills;
  for (const s of Object.values(skills)) {
    const u = new URL(s.listing);
    if (u.origin !== ORIGIN || u.username || u.password) throw new Error('Unexpected directory link');
  }
  const topicById = new Map(feed.topics.map(t => [t.id, t]));
  const card = id => skills[id] && { ...skills[id] };
  const sections = interests.map(interest => {
    const topics = feed.topics.filter(t => matches(interest, t.id, t.name));
    const topicIds = new Set(topics.map(t => t.id));
    const fits = s => s && (s.topics.some(t => topicIds.has(t)) || matches(interest, s.name, s.description, ...s.topics.map(t => topicById.get(t)?.name || t)));
    const pick = ids => ids.map(card).filter(fits).slice(0, limit);
    return {
      interest,
      topics: topics.slice(0, limit).map(t => ({ name: t.name, skills: t.skills, weekly_installs: t.weekly_installs, change_pct: t.change_pct, best: t.best.map(card).filter(Boolean) })),
      rising: pick(feed.rising), climbing: pick(feed.climbing), new_listings: pick(feed.new_listings),
    };
  });
  const repos = new Set(sections.flatMap(s => [...s.rising, ...s.climbing, ...s.new_listings, ...s.topics.flatMap(t => t.best)].map(c => c.repo)));
  return {
    source: FEED_URL, quality_snapshot: feed.quality_snapshot, install_snapshot: feed.install_snapshot, stars_snapshot: feed.stars_snapshot, stars_since: feed.stars_since,
    interests, sections,
    repositories: (feed.repositories || []).filter(r => repos.has(r.repo)).slice(0, limit * 2),
    empty: sections.every(s => !s.topics.length && !s.rising.length && !s.climbing.length && !s.new_listings.length),
  };
}

export async function fetchFeed(fetcher = fetch) {
  const response = await fetcher(FEED_URL, { signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (!response.ok) throw new Error(`Directory returned HTTP ${response.status}`);
  const chunks = []; let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.byteLength;
    if (bytes > 5 * 1024 * 1024) throw new Error('Weekly feed exceeds 5 MiB');
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function main(args, env = process.env) {
  let interests, save = false, limit = 5, feedFile;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--interests' || a === '--limit' || a === '--feed') {
      const v = args[++i];
      if (!v || v.startsWith('--')) throw new Error(`Missing value for ${a}`);
      if (a === '--interests') interests = parseInterests(v); else if (a === '--limit') limit = Number(v); else feedFile = v;
    } else if (a === '--save') save = true;
    else throw new Error(`Unknown option ${a}`);
  }
  const file = interestsFile(env);
  if (!interests) {
    try { interests = parseInterests(JSON.parse(await fs.readFile(file, 'utf8')).interests.join(',')); }
    catch { throw new Error('No saved interests. Run with --interests "marketing, sales" --save'); }
  }
  if (save) { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify({ interests }, null, 2) + '\n'); }
  const feed = feedFile ? JSON.parse(await fs.readFile(feedFile, 'utf8')) : await fetchFeed();
  return { ...brief(feed, interests, { limit }), ...(save ? { saved_to: file } : {}) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(r => process.stdout.write(JSON.stringify(r, null, 2) + '\n'))
    .catch(error => {
      const env = proxyRetryEnv(error);
      if (env) {
        const retry = spawnSync(process.execPath, process.argv.slice(1), { env, stdio: 'inherit' });
        process.exitCode = retry.status ?? 1;
        return;
      }
      process.stderr.write(`Briefing failed: ${error.message}\n`); process.exitCode = 1;
    });
}
