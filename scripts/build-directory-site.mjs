#!/usr/bin/env node
// Builds the standalone Suede AI Skills Directory site for https://suedeai.directory
// from the pages scripts/build-directory.mjs already wrote to docs/directory/.
//
//   node scripts/build-directory-site.mjs [--out dist/suedeai-directory]
//
// The directory moves from skills.suedeai.ai/directory/<path> to
// suedeai.directory/<path>. This script copies docs/directory/ to the root of the
// output, copies docs/assets/ beside it, and rewrites URLs:
//   - https://skills.suedeai.ai/directory/... becomes https://suedeai.directory/...
//   - root-absolute /directory/... becomes /...
//   - relative links that leave the directory (to the Suede AI Skills pack,
//     its blog or its home page) become absolute https://skills.suedeai.ai/... links,
//     except /assets/..., which ships with this site
//   - relative links that stay inside the directory are left alone: every page
//     moves up one level together, so they still resolve
// It also writes robots.txt, sitemap.xml, llms.txt and 404.html for the new host.
// Nothing under docs/ is modified. vercel.json runs this as the build command.
import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const OLD = "https://skills.suedeai.ai";
export const NEW = "https://suedeai.directory";
const TEXT = new Set([".html", ".json", ".xml", ".txt", ".js", ".svg", ".css", ".webmanifest"]);
const ATTR_RE = /\b(href|src|action|poster)="([^"]*)"/g;
const SKIP_RE = /^(#|mailto:|tel:|data:|javascript:|blob:)/i;
const OLD_DIR_RE = /https:\/\/skills\.suedeai\.ai\/directory(?=[/"'\s<>)?#,\]}\\]|$)/g;

// Rewrites one URL found in a page that was published at `pageUrl` on the old host.
export function rewriteUrl(value, pageUrl) {
  if (!value || SKIP_RE.test(value) || value.startsWith("//")) return value;
  let abs;
  try { abs = new URL(value, pageUrl); } catch { return value; }
  if (abs.origin !== OLD) return value;
  const isRelative = !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("/");
  const pageInDirectory = new URL(pageUrl).pathname.startsWith("/directory/");
  const p = abs.pathname;
  const tail = abs.search + abs.hash;
  if (p === "/directory" || p.startsWith("/directory/")) {
    if (isRelative && pageInDirectory) return value;
    const moved = p.slice("/directory".length) || "/";
    return value.startsWith(OLD) ? `${NEW}${moved}${tail}` : `${moved}${tail}`;
  }
  if (p.startsWith("/assets/")) return `${p}${tail}`;
  return `${OLD}${p}${tail}`;
}

export function rewriteText(text, ext, pageUrl) {
  let out = text;
  if (ext === ".html" || ext === ".svg") out = out.replace(ATTR_RE, (_, attr, v) => `${attr}="${rewriteUrl(v, pageUrl)}"`);
  out = out.replace(OLD_DIR_RE, NEW);
  // The search index and report files carry root-absolute listing paths.
  if (ext === ".json" || ext === ".js") out = out.replace(/(["'])\/directory\//g, "$1/");
  return out;
}

function copyTree(src, dest, transform) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyTree(s, d, transform);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (transform && TEXT.has(ext)) fs.writeFileSync(d, transform(fs.readFileSync(s, "utf8"), ext, s));
      else fs.copyFileSync(s, d);
    }
  }
}

export function build(out) {
  const docs = path.join(ROOT, "docs");
  const dirSrc = path.join(docs, "directory");
  if (!fs.existsSync(path.join(dirSrc, "index.html"))) throw new Error("docs/directory is missing; run node scripts/build-directory.mjs first");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const reports = [];
  copyTree(dirSrc, out, (text, ext, file) => {
    const rel = path.relative(dirSrc, file).split(path.sep).join("/");
    const rewritten = rewriteText(text, ext, `${OLD}/directory/${rel}`);
    if (path.basename(file) !== "report.json") return rewritten;
    const { report_version: previousVersion, ...evidence } = JSON.parse(rewritten);
    // Match the original directory report verifier: hash compact evidence in
    // its existing property order, excluding the report identity itself.
    const report_version = createHash("sha256").update(JSON.stringify(evidence)).digest("hex");
    reports.push({ rel, previousVersion, report_version });
    return JSON.stringify({ ...evidence, report_version }, null, 2) + "\n";
  });
  for (const { rel, previousVersion, report_version } of reports) {
    const listing = path.join(out, path.dirname(rel), "index.html");
    // Compact repository rows link reports without displaying a version.
    if (!fs.existsSync(listing)) continue;
    const html = fs.readFileSync(listing, "utf8");
    const previous = `Report version <code>${previousVersion.slice(0, 12)}</code>`;
    if (!html.includes(previous)) throw new Error(`Missing report version in ${listing}`);
    fs.writeFileSync(listing, html.replaceAll(previous, `Report version <code>${report_version.slice(0, 12)}</code>`));
  }
  fs.mkdirSync(path.join(out, "assets"), { recursive: true });
  copyTree(path.join(docs, "assets"), path.join(out, "assets"), null);

  const notFound = path.join(docs, "404.html");
  if (fs.existsSync(notFound)) fs.writeFileSync(path.join(out, "404.html"), rewriteText(fs.readFileSync(notFound, "utf8"), ".html", `${OLD}/404.html`));

  const sitemap = fs.readFileSync(path.join(docs, "sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/  <url>[\s\S]*?<\/url>\n/g)].map((m) => m[0]).filter((u) => u.includes(`<loc>${OLD}/directory/`));
  fs.writeFileSync(path.join(out, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => u.replace(OLD_DIR_RE, NEW)).join("")}</urlset>\n`);

  const robots = fs.readFileSync(path.join(docs, "robots.txt"), "utf8")
    .replace(/^# skills\.suedeai\.ai:/m, "# suedeai.directory:")
    .replace(/^Sitemap: .*$/m, `Sitemap: ${NEW}/sitemap.xml`);
  fs.writeFileSync(path.join(out, "robots.txt"), robots);

  const llmsLines = fs.readFileSync(path.join(docs, "llms.txt"), "utf8").split("\n").filter((l) => l.includes(`${OLD}/directory`));
  fs.writeFileSync(path.join(out, "llms.txt"), [
    "# Suede AI Skills Directory",
    "",
    "> A curated, graded index of public Agent Skills for Claude Code, Codex and Cursor. Every listing links to the author's GitHub repository, states its license and shows a 0–99 Suede Skill Check score. Published by Suede AI; edited by Jason Colapietro.",
    "",
    ...llmsLines.map((l) => l.replace(OLD_DIR_RE, NEW)),
    "",
    `Suede AI's own skill pack, Suede AI Skills: ${OLD}/`,
    "",
  ].join("\n"));
  return { urls: urls.length, llms: llmsLines.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf("--out");
  const out = path.resolve(ROOT, i > 0 ? process.argv[i + 1] : "dist/suedeai-directory");
  const r = build(out);
  console.log(`Wrote ${path.relative(ROOT, out)} for ${NEW} (${r.urls} sitemap URLs, ${r.llms} llms.txt lines).`);
}
