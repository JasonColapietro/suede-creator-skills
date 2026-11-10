#!/usr/bin/env node
// Read public application issues only. Never execute submission content.
// Full pagination prevents silent loss as the issue tracker grows.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { importApplications, validateApplications } from './applications.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repo = 'JasonColapietro/suede-creator-skills';
const gh = args => JSON.parse(execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
const metadata = gh(['api', `repos/${repo}`]);
if (metadata.private !== false || metadata.full_name !== repo) throw new Error('Application source must be the canonical public repository');
const pages = gh(['api', '--paginate', '--slurp', `repos/${repo}/issues?state=all&per_page=100`]);
const issues = pages.flat();
const data = validateApplications({schema_version: 1, updated: new Date().toISOString().slice(0, 10), applications: importApplications(issues)});
// Empty or unexpectedly smaller results need a human check before replacing history.
const target = path.join(root, 'directory/applications.json');
const previous = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : null;
if (!data.applications.length || (previous && previous.applications.some(a => !data.applications.some(next => next.issue === a.issue)))) throw new Error('Application history would shrink; review removed or edited requests before updating the register');
fs.writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
console.log(`Recorded ${data.applications.length} public application issues; no issue bodies or contacts copied.`);
