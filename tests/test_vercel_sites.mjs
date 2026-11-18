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

test("both builds add the agent-view switch once, only to full pages", async () => {
  const { injectAgentView, rewriteText } = await import("../scripts/build-directory-site.mjs");
  const tag = '<script src="https://suedeai.ai/agent-view.js" defer></script>';
  const page = "<html><body><p>x</p></body></html>";
  const once = injectAgentView(page);
  assert.equal(once, `<html><body><p>x</p>${tag}\n</body></html>`);
  assert.equal(injectAgentView(once), once);
  assert.equal(injectAgentView("<!-- verification -->"), "<!-- verification -->");
  assert.equal(skillsText(page, ".html", `${OLD}/index.html`).split("agent-view.js").length, 2);
  assert.equal(rewriteText(page, ".html", `${OLD}/directory/index.html`).split("agent-view.js").length, 2);
});

test("directory index.html aliases permanently consolidate without changing pack-site routes", () => {
  const root = vercel.redirects.find((r) => r.source === "/index.html");
  const nested = vercel.redirects.find((r) => r.source === "/:path+/index.html");
  assert.deepEqual(root, { source: "/index.html", destination: "/", permanent: true, has: [{ type: "host", value: "suedeai.directory" }] });
  assert.deepEqual(nested, { source: "/:path+/index.html", destination: "/:path*/", permanent: true, has: [{ type: "host", value: "suedeai.directory" }] });
  // Only literal index.html URLs match: assets, verification files, canonical
  // directory paths and the separate skills host retain their current routing.
  const matches = (host, pathname) => host === root.has[0].value &&
    (pathname === root.source || /^\/.+\/index\.html$/.test(pathname));
  for (const p of ["/index.html", "/featured/index.html", "/topics/seo/index.html"]) assert.ok(matches("suedeai.directory", p));
  for (const p of ["/", "/featured/", "/robots.txt", "/sitemap.xml", "/badges/featured.svg", "/google4b0bcf0a4950299c.html"]) assert.ok(!matches("suedeai.directory", p));
  assert.ok(!matches("skills.suedeai.ai", "/index.html"));
});
