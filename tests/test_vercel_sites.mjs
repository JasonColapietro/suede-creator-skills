// skills.suedeai.ai on Vercel: the pack site without /directory/, linking to suedeai.directory.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildSkills, toDirectoryHost, skillsText } from "../scripts/build-vercel.mjs";

const OLD = "https://skills.suedeai.ai";
const NEW = "https://suedeai.directory";
const vercel = JSON.parse(fs.readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));

test("every /directory URL 301s to the same path on suedeai.directory, from either host", () => {
  const r = vercel.redirects;
  assert.deepEqual(r.find((x) => x.source === "/directory/:path*"), { source: "/directory/:path*", destination: `${NEW}/:path*`, permanent: true });
  assert.deepEqual(r.find((x) => x.source === "/directory"), { source: "/directory", destination: `${NEW}/`, permanent: true });
  assert.equal(vercel.outputDirectory, "dist/out");
});

test("links into the directory move to the new host; other links stay", () => {
  assert.equal(toDirectoryHost("directory/obra/superpowers/", `${OLD}/index.html`), `${NEW}/obra/superpowers/`);
  assert.equal(toDirectoryHost("/directory/", `${OLD}/skills/x.html`), `${NEW}/`);
  assert.equal(toDirectoryHost("../directory/marketing-seo/#top", `${OLD}/blog/post.html`), `${NEW}/marketing-seo/#top`);
  assert.equal(toDirectoryHost("guide.html", `${OLD}/index.html`), "guide.html");
  assert.equal(toDirectoryHost("https://github.com/x", `${OLD}/index.html`), "https://github.com/x");
});

test("skills-site directory links keep shared query state and fragments", () => {
  const tail = "?q=anthropics%2Fskills&pick=a&pick=b#results";
  for (const link of [`${OLD}/directory/check/${tail}`, `/directory/check/${tail}`, `directory/check/${tail}`]) {
    assert.equal(toDirectoryHost(link, `${OLD}/index.html`), `${NEW}/check/${tail}`);
  }
});

test("the sitemap drops directory URLs and keeps the rest", () => {
  const xml = `<urlset>\n  <url>\n    <loc>${OLD}/</loc>\n  </url>\n  <url>\n    <loc>${OLD}/directory/obra/</loc>\n  </url>\n</urlset>\n`;
  const out = skillsText(xml, ".xml", `${OLD}/sitemap.xml`);
  assert.ok(out.includes(`<loc>${OLD}/</loc>`));
  assert.ok(!out.includes("/directory/"));
});

test("the built skills site has no directory pages, no old directory URLs and no broken links", () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "skills-site-"));
  try {
    buildSkills(out);
    assert.ok(!fs.existsSync(path.join(out, "directory")));
    assert.ok(!fs.existsSync(path.join(out, "CNAME")));
    for (const f of ["index.html", "404.html", "robots.txt", "sitemap.xml", "llms.txt", "assets/site.css"]) assert.ok(fs.existsSync(path.join(out, f)), f);
    const broken = [];
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { walk(p); continue; }
        if (!/\.(html|xml|txt|json)$/.test(e.name)) continue;
        const text = fs.readFileSync(p, "utf8");
        assert.ok(!text.includes(`${OLD}/directory`), `${path.relative(out, p)} still links to ${OLD}/directory`);
        if (!e.name.endsWith(".html")) continue;
        const rel = path.relative(out, p).split(path.sep).join("/");
        for (const m of text.matchAll(/\b(?:href|src|action)="([^"]*)"/g)) {
          if (!m[1] || /^(#|mailto:|tel:|data:|javascript:)/.test(m[1])) continue;
          const u = new URL(m[1], `${OLD}/${rel}`);
          if (u.origin !== OLD) continue;
          const t = path.join(out, decodeURIComponent(u.pathname));
          const ok = u.pathname.endsWith("/") ? fs.existsSync(path.join(t, "index.html")) : fs.existsSync(t) || fs.existsSync(path.join(t, "index.html"));
          if (!ok) broken.push(`${rel} -> ${u.pathname}`);
        }
      }
    };
    walk(out);
    assert.deepEqual(broken.slice(0, 10), []);
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});
