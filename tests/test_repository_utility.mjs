import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const data = JSON.parse(read('directory/skills.json'));
const updatesPath = 'directory/intake/first-party-listing-updates.json';
const updates = new Map((fs.existsSync(new URL('../' + updatesPath, import.meta.url)) ? JSON.parse(read(updatesPath)) : [])
  .map(update => [`${update.repository}/${update.listing.slug}`, update]));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const groups = Map.groupBy(data.skills.map(s => updates.get(`${s.repo}/${s.slug}`)?.listing || s), (s) => s.repo);
const published = [...groups].flatMap(([repo, skills]) => {
  const route = `directory/${repo.split('/').map(slug).join('/')}/`;
  try { return [{ repo, skills, route, html: read('docs/' + route + 'index.html') }]; }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
});

test('every published collection puts selection and installation utility before promotions', () => {
  assert.ok(published.length > 100);
  for (const { repo, html } of published) {
    for (const id of ['collection-overview', 'choose-skill', 'collection-install', 'collection-compare']) {
      assert.ok(html.includes(`id="${id}"`), `${repo}: missing ${id}`);
      assert.ok(html.indexOf(`id="${id}"`) < html.indexOf('id="badge"'), `${repo}: ${id} follows badge promotion`);
    }
    assert.match(html, /Select one skill/);
    assert.match(html, /Check the result/);
    assert.match(html, /snapshot.*score|score.*snapshot/is);
  }
});

test('small collections expose every complete description, exact score evidence and source', () => {
  for (const { repo, skills, html } of published.filter((p) => p.skills.length <= 6)) {
    for (const skill of skills) {
      assert.ok(html.includes(escape(skill.description)), `${repo}/${skill.slug}: truncated description`);
      assert.ok(html.includes(`id="choice-${skill.slug}"`), `${repo}: no decision card for ${skill.slug}`);
      assert.ok(html.includes(`${skill.score}/100`));
      assert.ok(html.includes(`>${skill.slug}/report.json</a>`) || html.includes(`href="${skill.slug}/report.json"`), `${repo}: no exact report`);
      const rev = updates.get(`${repo}/${skill.slug}`)?.source_revision || data.repos[repo].commit_sha;
      if (rev) assert.ok(html.includes(`/blob/${rev}/`), `${repo}: source revision absent`);
    }
    // Generated HTML must not introduce duplicate controls or fragment targets.
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${repo}: duplicate element id`);
  }
});

test('single-skill pages explain real tasks and preserve scoped install and licensing behavior', () => {
  const digidai = published.find((p) => p.repo === 'Digidai/product-manager-skills').html;
  const vercel = published.find((p) => p.repo === 'vercel-labs/agent-browser').html;
  assert.match(digidai, /Example workflow: critique a PRD/);
  assert.match(digidai, /CC-BY-NC-SA-4\.0 allows non-commercial use/);
  assert.match(digidai, /Example request to adapt/);
  assert.match(vercel, /Example workflow: inspect a web journey/);
  assert.match(vercel, /agent-browser skills get core/);
  assert.match(vercel, /href="agent-browser\/">Read the full agent-browser review and install guide/);
  assert.match(vercel, /npx skills add https:\/\/github.com\/vercel-labs\/agent-browser\/tree\/main\/skills\/agent-browser/);
  for (const { repo, skills, html } of published) {
    if (skills.every((s) => /proprietary|all rights reserved/i.test(s.license))) {
      assert.ok(!html.includes('npx skills add'), `${repo}: generic copying command for restricted files`);
    }
    if (data.repos[repo].withheld || data.repos[repo].scoped_install || (skills.length > 1 && skills.some((s) => s.dir === '.'))) {
      assert.match(html, /Select one skill/, `${repo}: no scoped-install guidance`);
    }
  }
});

test('collection downloads cover every listed skill with exact evidence and usable install scope', () => {
  for (const { repo, route, skills, html } of published) {
    const manifest = JSON.parse(read('docs/' + route + 'collection.json'));
    assert.ok(html.includes('href="collection.json" download='), repo);
    assert.equal(manifest.repository, repo);
    assert.equal(manifest.snapshot.id, data.snapshot_id);
    assert.equal(manifest.listed_skill_count, skills.length);
    assert.equal(manifest.skills.length, skills.length);
    assert.equal(manifest.security_scan_status, 'not_scanned');
    for (const s of skills) {
      const record = manifest.skills.find((r) => r.id.endsWith('/' + s.slug));
      assert.ok(record, `${repo}/${s.slug}`);
      assert.equal(record.description, s.description.replace(/\bskills\.sh\b/gi, "…"));
      assert.equal(record.quality.score, s.score);
      const update = updates.get(`${repo}/${s.slug}`);
      assert.equal(record.source.revision, update?.source_revision || data.repos[repo].commit_sha || null);
      assert.ok(record.report_url.endsWith('/' + s.slug + '/report.json'));
      if (/proprietary|all rights reserved/i.test(s.license)) assert.equal(record.install.skills_cli, null);
      else {
        const argument = record.install.skills_cli.slice('npx skills add '.length);
        // Some real source folders contain parentheses and require shell quoting.
        const target = argument.startsWith("'") ? argument.slice(1, -1).replaceAll("'\\''", "'") : argument;
        assert.ok(target.startsWith('https://github.com/' + repo), `${repo}: wrong source repository`);
        if (s.dir !== '.') assert.ok(target.endsWith('/' + s.dir), `${repo}: wrong skill folder`);
        if (update) assert.equal(target, `https://github.com/${repo}/tree/${update.source_branch || 'main'}/${s.dir}`);
      }
    }
  }
});
