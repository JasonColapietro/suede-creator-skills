#!/usr/bin/env node
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const INDEX_URL = 'https://suedeai.directory/search-index.json';
const own = /^(jasoncolapietro\/suede-creator-skills|suede-ai\/)/i;
const absolute = value => {
  const url = new URL(value, INDEX_URL);
  if (url.origin !== new URL(INDEX_URL).origin || url.username || url.password) throw new Error('Unexpected directory link');
  return url.href;
};

export function search(index, query, { minScore = 0, limit = 5, free = false } = {}) {
  if (!Array.isArray(index)) throw new Error('Invalid directory index');
  if (!Number.isInteger(minScore) || minScore < 0 || minScore > 99) throw new Error('min-score must be 0–99');
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error('limit must be 1–20');
  const words = String(query).toLowerCase().match(/[\p{L}\p{N}+#.-]+/gu) || [];
  if (!words.length) throw new Error('Provide a task or skill name to search');
  return index.filter(s => !own.test(s.repo) && Number.isInteger(s.score) && s.score >= minScore && s.score <= 99 && (!free || (s.lane === 'free-open-source' && s.install_reviewed === true)))
    .map(s => {
      const name = `${s.name} ${s.slug || ''}`.toLowerCase();
      const text = `${name} ${s.repo} ${s.description} ${s.category} ${(s.topics || []).join(' ')}`.toLowerCase();
      return { s, match: words.every(w => text.includes(w)), relevance: words.reduce((n, w) => n + (name.includes(w) ? 3 : text.includes(w) ? 1 : 0), 0) };
    }).filter(x => x.match)
    .sort((a, b) => b.relevance - a.relevance || b.s.score - a.s.score || a.s.id.localeCompare(b.s.id))
    .slice(0, limit).map(({ s }) => ({
      name: s.name, repository: s.repo, description: s.description, score: s.score, grade: s.grade,
      license: s.license, cost_lane: s.lane, installation_reviewed: s.install_reviewed === true, snapshot: s.snapshot, methodology: s.method,
      listing: absolute(s.href), report: absolute(s.report), install: s.install || null,
      security_scan_status: 'not_scanned',
    }));
}

export async function fetchIndex(fetcher = fetch) {
  const response = await fetcher(INDEX_URL, { signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (!response.ok) throw new Error(`Directory returned HTTP ${response.status}`);
  const chunks = []; let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.byteLength;
    if (bytes > 10 * 1024 * 1024) throw new Error('Directory index exceeds 10 MiB');
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function main(args) {
  const options = {}; const words = []; let indexFile;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--min-score' || a === '--limit' || a === '--index') {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${a}`);
      if (a === '--index') indexFile = value;
      else options[a === '--limit' ? 'limit' : 'minScore'] = Number(value);
    } else if (a === '--free') options.free = true;
    else if (a.startsWith('--')) throw new Error(`Unknown option ${a}`);
    else words.push(a);
  }
  if (!words.length) throw new Error('Usage: node search.mjs "task keywords" [--min-score 80] [--limit 5] [--free]');
  const index = indexFile ? JSON.parse(await fs.readFile(indexFile, 'utf8')) : await fetchIndex();
  return { source: INDEX_URL, query: words.join(' '), results: search(index, words.join(' '), options) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then(result => process.stdout.write(JSON.stringify(result, null, 2) + '\n'))
    .catch(error => { process.stderr.write(`Directory search failed: ${error.message}\n`); process.exitCode = 1; });
}
