#!/usr/bin/env node
// Generates the README artwork in docs/assets/readme/ from mcp/catalog.json:
//
//   hero.svg          wordmark, headline, install terminal, total skill count
//   pack-map.svg      the six specialties with lane bars and every skill slug
//   how-it-works.svg  request -> NOT FOR routing -> one specialist -> evidence
//   ship-grade.svg    the suede-code A-F grade card (illustrative run)
//
// It also writes the README skill catalog between the skills:start and
// skills:end markers.
//
// Every number drawn here is read from the catalog, so the art cannot drift
// from the pack the way the old hand-drawn pack map did (it summed to 63).
//
// GitHub renders README images through <img>, which cannot fetch web fonts, so
// each SVG embeds the brand faces (Fraunces, Geist, Geist Mono; OFL, see
// licenses/) as base64 WOFF2, subset to exactly the glyphs that SVG uses.
// Subsetting needs fontTools: `python3 -m pip install fonttools brotli`.
//
// Usage:
//   node scripts/build-readme-art.mjs           # write the SVGs and README catalog
//   node scripts/build-readme-art.mjs --check   # exit 1 if any output would change
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(repoRoot, "docs", "assets", "readme");
const fontDir = path.join(repoRoot, "docs", "assets", "fonts");
const checkOnly = process.argv.includes("--check");

const catalog = JSON.parse(fs.readFileSync(path.join(repoRoot, "mcp", "catalog.json"), "utf8"));
const skills = catalog.skills;
const specialties = catalog.specialties;
const TOTAL = skills.length;

const C = {
  bg: "#080808",
  surface: "#111111",
  card: "#161616",
  border: "#222222",
  text: "#f0ece4",
  dim: "#888880",
  gold: "#c8a96e",
  goldHi: "#e6cf9c",
  goldLo: "#8f7444",
  red: "#8b1a1a",
  redHi: "#c0392b",
};

const FONTS = {
  display: { family: "SuedeDisplay", file: "fraunces-var.woff2", stack: "Georgia, 'Times New Roman', serif" },
  displayItalic: { family: "SuedeDisplayItalic", file: "fraunces-var-italic.woff2", stack: "Georgia, serif", style: "italic" },
  sans: { family: "SuedeSans", file: "geist-var-latin.woff2", stack: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" },
  mono: { family: "SuedeMono", file: "geist-mono-var-latin.woff2", stack: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace" },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// One drawing context per SVG: records which glyphs each face draws so the
// embedded font can be subset to them.
function canvas() {
  const used = Object.fromEntries(Object.keys(FONTS).map((k) => [k, new Set()]));
  const attrs = (a) =>
    Object.entries(a)
      .filter(([, v]) => v !== undefined && v !== null && v !== false)
      .map(([k, v]) => `${k}="${esc(v)}"`)
      .join(" ");
  return {
    used,
    // text(font, attributes, content). `letter-spacing` is emitted last on
    // purpose: the count guard in validate-skill-pack.mjs reads
    // letter-spacing="-12">N</text> from hero.svg.
    text(font, a, content) {
      for (const ch of String(content)) used[font].add(ch);
      const { ls, ...rest } = a;
      const tail = ls !== undefined ? ` letter-spacing="${ls}"` : "";
      return `<text class="f-${font}" ${attrs(rest)}${tail}>${esc(content)}</text>`;
    },
    // Rich text: [[font, content, extraAttrs?], ...] inside one <text>.
    spans(a, parts) {
      const inner = parts
        .map(([font, content, extra = {}]) => {
          for (const ch of String(content)) used[font].add(ch);
          return `<tspan class="f-${font}" ${attrs(extra)}>${esc(content)}</tspan>`;
        })
        .join("");
      return `<text ${attrs(a)}>${inner}</text>`;
    },
    attrs,
  };
}

let tmpDir;
function subsetFont(fontKey, chars) {
  if (!chars.size) return null;
  tmpDir ??= fs.mkdtempSync(path.join(os.tmpdir(), "readme-art-"));
  const out = path.join(tmpDir, `${fontKey}.woff2`);
  const text = [...chars, " "].join("");
  execFileSync("pyftsubset", [
    path.join(fontDir, FONTS[fontKey].file),
    `--text=${text}`,
    "--flavor=woff2",
    "--layout-features=kern,liga,tnum,lnum",
    "--no-hinting",
    "--desubroutinize",
    `--output-file=${out}`,
  ]);
  return fs.readFileSync(out).toString("base64");
}

function styleBlock(cv, extraCss = "") {
  const faces = [];
  const rules = [];
  for (const [key, f] of Object.entries(FONTS)) {
    const b64 = subsetFont(key, cv.used[key]);
    if (!b64) continue;
    faces.push(
      `@font-face{font-family:${f.family};src:url(data:font/woff2;base64,${b64}) format("woff2");font-weight:100 900;font-style:${f.style || "normal"}}`
    );
    rules.push(`.f-${key}{font-family:${f.family},${f.stack};${f.style ? "font-style:italic;" : ""}}`);
  }
  return `<style>${faces.join("")}${rules.join("")}${extraCss}</style>`;
}

// Shared backdrop: near-black canvas, a gold glow, a faded dot grid and film
// grain, inside a hairline frame. Per DESIGN.md, grain keeps the canvas from
// reading as a flat fill.
function backdrop(id, w, h, { glowX = 0.82, glowY = 0.1, glow = 0.22 } = {}) {
  return `
  <defs>
    <radialGradient id="${id}-glow" cx="${glowX}" cy="${glowY}" r="0.75">
      <stop offset="0" stop-color="${C.gold}" stop-opacity="${glow}"/>
      <stop offset="0.45" stop-color="${C.gold}" stop-opacity="${(glow / 4).toFixed(3)}"/>
      <stop offset="1" stop-color="${C.gold}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="${id}-dots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.1" fill="${C.text}" fill-opacity="0.07"/>
    </pattern>
    <radialGradient id="${id}-fade" cx="0.5" cy="0.35" r="0.8">
      <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="${id}-mask"><rect width="${w}" height="${h}" fill="url(#${id}-fade)"/></mask>
    <filter id="${id}-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0"/>
    </filter>
    <clipPath id="${id}-clip"><rect width="${w}" height="${h}" rx="18"/></clipPath>
  </defs>
  <g clip-path="url(#${id}-clip)">
    <rect width="${w}" height="${h}" fill="${C.bg}"/>
    <rect width="${w}" height="${h}" fill="url(#${id}-glow)"/>
    <rect width="${w}" height="${h}" fill="url(#${id}-dots)" mask="url(#${id}-mask)"/>
    <rect width="${w}" height="${h}" filter="url(#${id}-grain)"/>
  </g>
  <rect x="0.75" y="0.75" width="${w - 1.5}" height="${h - 1.5}" rx="17.5" fill="none" stroke="${C.border}" stroke-width="1.5"/>`;
}

const MOTION_OFF = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

function svgDoc(w, h, title, desc, body, cv, css = "") {
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
  <title id="t">${esc(title)}</title>
  <desc id="d">${esc(desc)}</desc>
  ${styleBlock(cv, css + MOTION_OFF)}
${body}
</svg>
`;
  return doc.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
}

// ---------------------------------------------------------------- hero.svg
function hero() {
  const W = 1200;
  const H = 600;
  const cv = canvas();
  const x0 = 64;
  const termX = x0;
  const termY = 352;
  const termW = 640;
  const termH = 168;
  const chipY = 548;
  const chipGap = 10;
  const chipW = (W - x0 * 2 - chipGap * (specialties.length - 1)) / specialties.length;

  const chips = specialties
    .map((s, i) => {
      const x = x0 + i * (chipW + chipGap);
      return `
    <g>
      <rect x="${x}" y="${chipY - 26}" width="${chipW}" height="38" rx="4" fill="${C.surface}" fill-opacity="0.85" stroke="${C.border}"/>
      ${cv.text("mono", { x: x + 14, y: chipY - 1, fill: C.gold, "font-size": 15, "font-weight": 600 }, String(s.count))}
      ${cv.text("sans", { x: x + 42, y: chipY - 1, fill: C.text, "font-size": 14.5, "font-weight": 540 }, s.label)}
    </g>`;
    })
    .join("");

  const body = `${backdrop("h", W, H, { glowX: 0.86, glowY: 0.28, glow: 0.26 })}
  <defs>
    <linearGradient id="h-num" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.goldHi}"/>
      <stop offset="0.55" stop-color="${C.gold}"/>
      <stop offset="1" stop-color="${C.goldLo}"/>
    </linearGradient>
  </defs>

  <!-- top bar -->
  ${cv.text("sans", { x: x0, y: 66, fill: C.text, "font-size": 19, "font-weight": 700, ls: 5 }, "SUEDE")}
  ${cv.text("sans", { x: x0 + 102, y: 66, fill: C.dim, "font-size": 13, "font-weight": 600, ls: 3.5 }, "SKILLS")}
  <circle cx="${x0 + 89}" cy="60" r="2.5" fill="${C.gold}"/>
  ${cv.text("mono", { x: W - x0, y: 66, fill: C.dim, "font-size": 12.5, "text-anchor": "end", ls: 2 }, "CLAUDE CODE · CODEX · HERMES · MCP")}
  <path d="M${x0} 88H${W - x0}" stroke="${C.border}"/>

  <!-- headline -->
  ${cv.text("display", { x: x0 - 3, y: 172, fill: C.text, "font-size": 66, "font-weight": 600, ls: -1.4 }, "The ship discipline")}
  ${cv.spans({ x: x0 - 3, y: 246, fill: C.text, "font-size": 66, "font-weight": 600, "letter-spacing": -1.4 }, [
    ["display", "your agent is "],
    ["displayItalic", "missing.", { "font-weight": 500 }],
  ])}
  <rect x="${x0 + 370}" y="262" width="222" height="5" fill="${C.red}"/>

  ${cv.text("sans", { x: x0, y: 300, fill: C.dim, "font-size": 19 }, "Open-source skills for SEO, copy, growth, code review and app delivery.")}
  ${cv.text("sans", { x: x0, y: 326, fill: C.dim, "font-size": 19 }, "Readable instructions, one install, evidence in every output.")}

  <!-- install terminal -->
  <rect x="${termX}" y="${termY}" width="${termW}" height="${termH}" rx="8" fill="#0c0c0c" stroke="${C.border}"/>
  <path d="M${termX} ${termY + 34}H${termX + termW}" stroke="${C.border}"/>
  <circle cx="${termX + 20}" cy="${termY + 17}" r="5" fill="#2a2a2a"/>
  <circle cx="${termX + 38}" cy="${termY + 17}" r="5" fill="#2a2a2a"/>
  <circle cx="${termX + 56}" cy="${termY + 17}" r="5" fill="#2a2a2a"/>
  ${cv.text("mono", { x: termX + termW / 2, y: termY + 22, fill: C.dim, "font-size": 12, "text-anchor": "middle", ls: 1 }, "claude code — install")}
  ${cv.spans({ x: termX + 22, y: termY + 68, "font-size": 15.5 }, [
    ["mono", "› ", { fill: C.gold }],
    ["mono", "/plugin marketplace add JasonColapietro/suede-creator-skills", { fill: C.text }],
  ])}
  ${cv.spans({ x: termX + 22, y: termY + 98, "font-size": 15.5 }, [
    ["mono", "› ", { fill: C.gold }],
    ["mono", "/plugin install suede-skills@suede", { fill: C.text }],
  ])}
  ${cv.spans({ x: termX + 22, y: termY + 138, "font-size": 15.5 }, [
    ["mono", "✓ ", { fill: C.gold }],
    ["mono", `${TOTAL} skills loaded`, { fill: C.gold }],
    ["mono", " · ready to route", { fill: C.dim }],
  ])}
  <rect class="cursor" x="${termX + 358}" y="${termY + 124}" width="9" height="18" fill="${C.gold}"/>

  <!-- the count -->
  ${cv.text("display", { x: W - x0 + 8, y: 438, fill: "url(#h-num)", "font-size": 280, "font-weight": 650, "text-anchor": "end", ls: -12 }, String(TOTAL))}
  ${cv.text("mono", { x: W - x0, y: 486, fill: C.dim, "font-size": 13, "text-anchor": "end", ls: 3 }, `SKILLS · ${specialties.length} SPECIALTIES · MIT`)}

  <!-- specialties -->
${chips}`;

  const css = `.cursor{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`;
  return svgDoc(
    W,
    H,
    "Suede Skills",
    `${TOTAL} open-source agent skills for Claude Code, Codex, Hermes and MCP clients across ${specialties.length} specialties. Install with /plugin marketplace add JasonColapietro/suede-creator-skills, then /plugin install suede-skills@suede.`,
    body,
    cv,
    css
  );
}

// ------------------------------------------------------------ pack-map.svg
function wrapTokens(tokens, maxChars) {
  const lines = [];
  let line = "";
  for (const t of tokens) {
    const next = line ? `${line} · ${t}` : t;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = t;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function packMap() {
  const W = 1200;
  const x0 = 64;
  const cols = 2;
  const gap = 20;
  const cardW = (W - x0 * 2 - gap * (cols - 1)) / cols;
  const skillLines = specialties.map(s => wrapTokens(
    skills.filter(k => k.specialty === s.key).map(k => k.name.replace(/^suede-/, "")).sort(),
    52
  ));
  const cardH = Math.max(380, ...specialties.map((s, i) =>
    194 + s.lanes.length * 28 + 14 + (skillLines[i].length - 1) * 23 + 20
  ));
  const top = 196;
  const rows = Math.ceil(specialties.length / cols);
  const H = top + rows * cardH + (rows - 1) * gap + 48;
  const cv = canvas();
  const laneShades = [C.gold, "#a88c58", "#6f5c3a"];

  const cards = specialties
    .map((s, i) => {
      const cx = x0 + (i % cols) * (cardW + gap);
      const cy = top + Math.floor(i / cols) * (cardH + gap);
      const inner = cardW - 56;
      // stacked lane bar
      let bx = cx + 28;
      const bar = s.lanes
        .map((lane, li) => {
          const w = (lane.count / s.count) * inner;
          const seg = `<rect class="grow" style="animation-delay:${(i * 0.08 + li * 0.05).toFixed(2)}s" x="${bx.toFixed(1)}" y="${cy + 152}" width="${Math.max(w - 3, 2).toFixed(1)}" height="8" rx="1" fill="${laneShades[li % laneShades.length]}"/>`;
          bx += w;
          return seg;
        })
        .join("");
      const legend = s.lanes
        .map((lane, li) => {
          const ly = cy + 194 + li * 28;
          return `
      <rect x="${cx + 28}" y="${ly - 11}" width="11" height="11" rx="1" fill="${laneShades[li % laneShades.length]}"/>
      ${cv.text("sans", { x: cx + 48, y: ly, fill: C.text, "font-size": 16 }, lane.label)}
      ${cv.text("mono", { x: cx + cardW - 28, y: ly, fill: C.dim, "font-size": 15, "text-anchor": "end" }, String(lane.count))}`;
        })
        .join("");
      const slugTop = cy + 194 + s.lanes.length * 28 + 14;
      const slugLines = skillLines[i]
        .map((line, li) => cv.text("mono", { x: cx + 28, y: slugTop + li * 23, fill: C.dim, "font-size": 14 }, line))
        .join("\n      ");
      return `
    <g>
      <rect x="${cx}" y="${cy}" width="${cardW}" height="${cardH}" rx="6" fill="${C.surface}" fill-opacity="0.9" stroke="${C.border}"/>
      <path d="M${cx + 28} ${cy}H${cx + 92}" stroke="${C.gold}" stroke-width="2"/>
      ${cv.text("mono", { x: cx + 28, y: cy + 40, fill: C.gold, "font-size": 13, ls: 2.5 }, `0${i + 1} · ${s.key.toUpperCase()}`)}
      ${cv.text("display", { x: cx + 26, y: cy + 84, fill: C.text, "font-size": 36, "font-weight": 600, ls: -0.4 }, s.label)}
      ${cv.text("display", { x: cx + cardW - 26, y: cy + 88, fill: C.gold, "font-size": 60, "font-weight": 600, "text-anchor": "end", ls: -1 }, String(s.count))}
      ${cv.text("sans", { x: cx + 28, y: cy + 126, fill: C.dim, "font-size": 17 }, s.summary)}
      <rect x="${cx + 28}" y="${cy + 152}" width="${inner}" height="8" rx="1" fill="${C.card}"/>
      ${bar}
      ${legend}
      <path d="M${cx + 28} ${slugTop - 20}H${cx + cardW - 28}" stroke="${C.border}"/>
      ${slugLines}
    </g>`;
    })
    .join("");

  const body = `${backdrop("p", W, H, { glowX: 0.12, glowY: 0.02, glow: 0.18 })}
  ${cv.text("mono", { x: x0, y: 74, fill: C.gold, "font-size": 13, ls: 3 }, `THE PACK · ${TOTAL} SKILLS · ${specialties.length} SPECIALTIES`)}
  ${cv.text("display", { x: x0 - 2, y: 130, fill: C.text, "font-size": 46, "font-weight": 600, ls: -0.8 }, "From first commit to paying customer.")}
  ${cv.text("sans", { x: x0, y: 166, fill: C.dim, "font-size": 18 }, "Every specialty, every lane, every skill in the pack. Slugs shown without the suede- prefix.")}
${cards}
`;

  const css = `.grow{transform-box:fill-box;transform-origin:left;animation:grow 1.1s cubic-bezier(.16,1,.3,1) both}@keyframes grow{from{transform:scaleX(0)}}`;
  return svgDoc(
    W,
    H,
    "The pack at a glance",
    `${TOTAL} skills in ${specialties.length} specialties: ` +
      specialties.map((s) => `${s.label} ${s.count} (${s.lanes.map((l) => `${l.label} ${l.count}`).join(", ")})`).join("; ") +
      ".",
    body,
    cv,
    css
  );
}

// -------------------------------------------------------- how-it-works.svg
function howItWorks() {
  const W = 1200;
  const H = 430;
  const cv = canvas();
  const x0 = 64;
  const gap = 36;
  const n = 4;
  const nodeW = (W - x0 * 2 - gap * (n - 1)) / n;
  const nodeY = 150;
  const nodeH = 214;
  const steps = [
    {
      k: "01 · ASK",
      title: "Say the job",
      lines: [["mono", "“audit this site", C.text], ["mono", " for SEO”", C.text]],
      foot: "plain words, no skill name",
    },
    {
      k: "02 · ROUTE",
      title: "NOT FOR decides",
      lines: [["sans", `${TOTAL} descriptions, each`, C.text], ["sans", "naming its neighbors", C.text]],
      foot: "no two skills claim one job",
    },
    {
      k: "03 · LOAD",
      title: "One specialist",
      lines: [["mono", "suede-seo-audit", C.gold], ["sans", "references load on demand", C.text]],
      foot: "the rest stay unread",
    },
    {
      k: "04 · PROVE",
      title: "Evidence back",
      lines: [["sans", "A–F lanes and", C.text], ["sans", "exact fixes", C.text]],
      foot: "report you can check",
    },
  ];

  const nodes = steps
    .map((s, i) => {
      const x = x0 + i * (nodeW + gap);
      const last = i === n - 1;
      return `
    <g>
      <rect x="${x}" y="${nodeY}" width="${nodeW}" height="${nodeH}" rx="6" fill="${last ? "#14110b" : C.surface}" fill-opacity="0.92" stroke="${last ? C.gold : C.border}" stroke-width="${last ? 1.5 : 1}"/>
      ${cv.text("mono", { x: x + 22, y: nodeY + 36, fill: C.gold, "font-size": 12, ls: 2.5 }, s.k)}
      ${cv.text("display", { x: x + 21, y: nodeY + 78, fill: C.text, "font-size": 26, "font-weight": 600, ls: -0.3 }, s.title)}
      ${s.lines.map(([f, t, fill], li) => cv.text(f, { x: x + 22, y: nodeY + 120 + li * 24, fill, "font-size": f === "mono" ? 16 : 17 }, t)).join("\n      ")}
      <path d="M${x + 22} ${nodeY + 172}H${x + nodeW - 22}" stroke="${C.border}"/>
      ${cv.text("sans", { x: x + 22, y: nodeY + 197, fill: C.dim, "font-size": 14.5 }, s.foot)}
    </g>`;
    })
    .join("");

  const arrows = steps
    .slice(0, -1)
    .map((_, i) => {
      const xa = x0 + (i + 1) * nodeW + i * gap + 4;
      const xb = xa + gap - 8;
      const y = nodeY + nodeH / 2;
      return `<path class="flow" d="M${xa} ${y}H${xb - 6}" stroke="${C.gold}" stroke-width="1.5" stroke-dasharray="3 4"/><path d="M${xb - 8} ${y - 5}L${xb} ${y}L${xb - 8} ${y + 5}" fill="none" stroke="${C.gold}" stroke-width="1.5"/>`;
    })
    .join("\n  ");

  const body = `${backdrop("w", W, H, { glowX: 0.95, glowY: 0.6, glow: 0.16 })}
  ${cv.text("mono", { x: x0, y: 74, fill: C.gold, "font-size": 13, ls: 3 }, "HOW A REQUEST RUNS")}
  ${cv.text("display", { x: x0 - 2, y: 120, fill: C.text, "font-size": 40, "font-weight": 600, ls: -0.6 }, "One ask. One specialist. Proof back.")}
${nodes}
  ${arrows}
  ${cv.text("sans", { x: x0, y: H - 30, fill: C.dim, "font-size": 14.5 }, "Example: suede-seo-audit. Every skill follows the same path, from a page audit to a multi-agent repo change.")}`;

  const css = `.flow{animation:dash 1.2s linear infinite}@keyframes dash{to{stroke-dashoffset:-14}}`;
  return svgDoc(
    W,
    H,
    "How a request runs",
    "You describe the job in plain words. Each skill description ends with a NOT FOR clause naming its neighbors, so exactly one specialist claims it. That skill loads its references on demand and returns evidence: for suede-seo-audit, A to F lanes and exact fixes.",
    body,
    cv,
    css
  );
}

// ---------------------------------------------------------- ship-grade.svg
function shipGrade() {
  const W = 1200;
  const H = 540;
  const cv = canvas();
  const x0 = 64;
  const lanes = [
    ["Correctness", "A", 0.95],
    ["Security & permissions", "B", 0.78],
    ["Data & state", "A−", 0.9],
    ["Domain truth", "B+", 0.83],
    ["UX & release behavior", "A−", 0.9],
    ["Tests & verification", "B", 0.78],
    ["Deploy readiness", "A", 0.95],
  ];
  const rowY = 140;
  const rowH = 42;
  const barX = 330;
  const barW = 330;

  const rows = lanes
    .map(([label, grade, v], i) => {
      const y = rowY + i * rowH;
      const top = grade.startsWith("A");
      return `
    ${cv.text("sans", { x: x0, y: y + 6, fill: C.text, "font-size": 18, "font-weight": 520 }, label)}
    <rect x="${barX}" y="${y - 4}" width="${barW}" height="6" rx="1" fill="${C.card}"/>
    <rect class="grow" style="animation-delay:${(i * 0.06).toFixed(2)}s" x="${barX}" y="${y - 4}" width="${(barW * v).toFixed(1)}" height="6" rx="1" fill="${top ? C.gold : "#6f5c3a"}"/>
    <rect x="${barX + barW + 22}" y="${y - 16}" width="50" height="30" rx="3" fill="${C.card}" stroke="${top ? C.gold : C.border}"/>
    ${cv.text("mono", { x: barX + barW + 47, y: y + 5, fill: top ? C.gold : C.text, "font-size": 15, "font-weight": 600, "text-anchor": "middle" }, grade)}`;
    })
    .join("");

  const vx = 812;
  const vy = 112;
  const vw = W - x0 - vx;
  const vh = 300;
  const body = `${backdrop("g", W, H, { glowX: 0.82, glowY: 0.45, glow: 0.2 })}
  ${cv.text("mono", { x: x0, y: 74, fill: C.gold, "font-size": 13, ls: 3 }, "SUEDE-CODE · SHIP GRADE")}
  ${cv.text("mono", { x: W - x0, y: 74, fill: C.dim, "font-size": 12.5, "text-anchor": "end", ls: 2 }, "7 LANES · ILLUSTRATIVE RUN")}
  <path d="M${x0} 96H${W - x0}" stroke="${C.border}"/>
${rows}

  <rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" rx="6" fill="#14110b" stroke="${C.gold}" stroke-width="1.5"/>
  ${cv.text("mono", { x: vx + vw / 2, y: vy + 46, fill: C.dim, "font-size": 12.5, "text-anchor": "middle", ls: 3 }, "SHIP VERDICT")}
  ${cv.text("display", { x: vx + vw / 2, y: vy + 210, fill: C.gold, "font-size": 160, "font-weight": 600, "text-anchor": "middle", ls: -4 }, "B+")}
  ${cv.text("sans", { x: vx + vw / 2, y: vy + 262, fill: C.dim, "font-size": 14.5, "text-anchor": "middle" }, "the weakest lane caps the grade")}

  <rect x="${x0}" y="${H - 92}" width="${W - x0 * 2}" height="48" rx="4" fill="#140a0a" stroke="${C.red}" stroke-width="1.5"/>
  ${cv.text("mono", { x: x0 + 22, y: H - 62, fill: C.redHi, "font-size": 14, "font-weight": 700, ls: 1.5 }, "INSTANT-F")}
  ${cv.text("sans", { x: x0 + 132, y: H - 62, fill: C.text, "font-size": 15 }, "Hardcoded secret, or a permission check bypassable via a request param → grade locks to F, with the exact file and line.")}`;

  const css = `.grow{transform-box:fill-box;transform-origin:left;animation:grow 1.1s cubic-bezier(.16,1,.3,1) both}@keyframes grow{from{transform:scaleX(0)}}`;
  return svgDoc(
    W,
    H,
    "The A to F ship grade",
    "Seven graded lanes produce one ship verdict; the weakest lane caps the grade. Instant-F triggers such as a hardcoded secret lock the grade to F with the exact file and line.",
    body,
    cv,
    css
  );
}

const outputs = {
  "hero.svg": hero(),
  "pack-map.svg": packMap(),
  "how-it-works.svg": howItWorks(),
  "ship-grade.svg": shipGrade(),
};

// ------------------------------------------------- README skill catalog
// The README's skill list lives between <!-- skills:start --> and
// <!-- skills:end --> and is written from the catalog: one table per
// specialty, every skill with its lane and the example request quoted in its
// own description.
const SKILLS_START = "<!-- skills:start -->";
const SKILLS_END = "<!-- skills:end -->";
const mdCell = (s) => String(s).replace(/\|/g, "\\|");
function exampleAsk(skill) {
  const m = skill.description.match(/["“]([^"”]{6,80})["”]/);
  if (!m) throw new Error(`${skill.name}: description has no quoted example request`);
  return m[1].replace(/[.]$/, "");
}
function readmeCatalog() {
  const out = [SKILLS_START, ""];
  for (const s of specialties) {
    const rows = skills.filter((k) => k.specialty === s.key);
    const laneOrder = s.lanes.map((l) => l.label);
    rows.sort((a, b) => laneOrder.indexOf(a.lane) - laneOrder.indexOf(b.lane) || a.name.localeCompare(b.name));
    out.push(`### ${s.label} · ${s.count}`, "", `*${s.summary}*`, "");
    out.push("| Skill | Lane | Try asking |", "|---|---|---|");
    for (const k of rows) {
      out.push(`| [\`${k.name}\`](skills/${k.name}) | ${mdCell(k.lane)} | “${mdCell(exampleAsk(k))}” |`);
    }
    out.push("");
  }
  out.push(SKILLS_END);
  return out.join("\n");
}
const readmePath = path.join(repoRoot, "README.md");
const readme = fs.readFileSync(readmePath, "utf8");
const a = readme.indexOf(SKILLS_START);
const b = readme.indexOf(SKILLS_END);
if (a < 0 || b < a) throw new Error("README.md is missing the skills:start / skills:end markers");
const nextReadme = readme.slice(0, a) + readmeCatalog() + readme.slice(b + SKILLS_END.length);

let stale = 0;
if (checkOnly && nextReadme !== readme) {
  console.error("stale: README.md skill catalog (run node scripts/build-readme-art.mjs)");
  stale++;
} else if (!checkOnly) {
  fs.writeFileSync(readmePath, nextReadme);
  console.log("wrote README.md skill catalog");
}
for (const [name, svg] of Object.entries(outputs)) {
  const file = path.join(outDir, name);
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (checkOnly) {
    if (current !== svg) {
      console.error(`stale: docs/assets/readme/${name} (run node scripts/build-readme-art.mjs)`);
      stale++;
    }
  } else {
    fs.writeFileSync(file, svg);
    console.log(`wrote docs/assets/readme/${name} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB)`);
  }
}
if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
if (stale) process.exit(1);
