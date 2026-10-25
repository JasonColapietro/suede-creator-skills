#!/usr/bin/env node
// Vercel build entry for both sites served from this repository.
//
//   SUEDE_SITE=directory node scripts/build-vercel.mjs   # https://suedeai.directory (default)
//   SUEDE_SITE=skills    node scripts/build-vercel.mjs   # https://skills.suedeai.ai
//
// Each Vercel project sets SUEDE_SITE; both write dist/out, the outputDirectory in
// vercel.json. The directory build is scripts/build-directory-site.mjs. The skills
// build serves docs/ the way GitHub Pages did, minus docs/directory/: those pages
// now live on suedeai.directory, and vercel.json 301s every /directory/ URL there.
// Links into the directory are rewritten to the new host and the directory's
// URLs leave the skills sitemap. Nothing under docs/ is modified.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as buildDirectory, OLD, NEW } from "./build-directory-site.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEXT = new Set([".html", ".xml", ".txt", ".json", ".js", ".svg"]);
const SKIP = new Set(["directory", "CNAME", ".nojekyll"]);
const ATTR_RE = /\b(href|src|action)="([^"]*)"/g;
const OLD_DIR_RE = /https:\/\/skills\.suedeai\.ai\/directory(?=[/"'\s<>)?#,\]}\\]|$)/g;

// A link on a skills.suedeai.ai page that points into /directory/ goes to suedeai.directory.
export function toDirectoryHost(value, pageUrl) {
  if (!value || /^(#|mailto:|tel:|data:|javascript:)/i.test(value)) return value;
  let u;
  try { u = new URL(value, pageUrl); } catch { return value; }
  if (u.origin !== OLD || !(u.pathname === "/directory" || u.pathname.startsWith("/directory/"))) return value;
  return `${NEW}${u.pathname.slice("/directory".length) || "/"}${u.search}${u.hash}`;
}

export function skillsText(text, ext, pageUrl) {
  let out = ext === ".html" ? text.replace(ATTR_RE, (_, a, v) => `${a}="${toDirectoryHost(v, pageUrl)}"`) : text;
  if (ext === ".xml" && path.basename(new URL(pageUrl).pathname) === "sitemap.xml") {
    out = out.replace(/  <url>\s*<loc>https:\/\/skills\.suedeai\.ai\/directory[\s\S]*?<\/url>\n/g, "");
  }
  return out.replace(OLD_DIR_RE, NEW);
}

function copySkills(src, dest, relBase = "") {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const rel = relBase ? `${relBase}/${e.name}` : e.name;
    if (!relBase && SKIP.has(e.name)) continue;
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copySkills(s, d, rel); continue; }
    if (!e.isFile()) continue;
    const ext = path.extname(e.name).toLowerCase();
    if (TEXT.has(ext)) fs.writeFileSync(d, skillsText(fs.readFileSync(s, "utf8"), ext, `${OLD}/${rel}`));
    else fs.copyFileSync(s, d);
  }
}

export function buildSkills(out) {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  copySkills(path.join(ROOT, "docs"), out);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const site = (process.env.SUEDE_SITE || "directory").toLowerCase();
  const out = path.join(ROOT, "dist/out");
  if (site === "skills") buildSkills(out);
  else if (site === "directory") buildDirectory(out);
  else throw new Error(`SUEDE_SITE must be "directory" or "skills", got "${site}"`);
  console.log(`Built ${site} site in dist/out`);
}
