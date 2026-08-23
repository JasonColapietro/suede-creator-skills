#!/usr/bin/env node
// Renders book/*.md into a single print edition at docs/book/s-tier.pdf.
//
// Same manifest and Markdown renderer as the site build (scripts/lib/book.mjs),
// different presentation: a dark cover, light pages, one chapter per page
// break. Headless Chrome does the paging, so no PDF library is required.
//
// Usage:
//   node scripts/build-book-pdf.mjs
//   node scripts/build-book-pdf.mjs --html-only   # write the print HTML, skip Chrome
//
// The PDF is not byte-reproducible (Chrome stamps a creation date), so there is
// no --check mode. Rebuild it when the chapters change.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { PARTS, PUBLISHED, SKILL_COUNT, loadSources, renderMarkdown, repoRoot } from "./lib/book.mjs";
import { PDF_PROVENANCE_RELATIVE, bookPdfDigest, bookPdfInputDigest } from "./lib/book-pdf-provenance.mjs";

const htmlOnly = process.argv.includes("--html-only");
const outPdf = path.join(repoRoot, "docs", "book", "s-tier.pdf");

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

const inputDigestBefore = bookPdfInputDigest(repoRoot);
const sources = loadSources();
const totalWords = sources.reduce((sum, page) => sum + page.words, 0);

// ------------------------------------------------------------------- style

// Light pages, dark cover. A dark interior would be unreadable on paper and
// wasteful in ink, so the brand surfaces appear on the cover and part pages
// while the reading pages behave like a book.
const PRINT_CSS = `
  @page { size: letter; margin: 20mm 19mm 22mm; }
  @page :first { margin: 0; }

  :root {
    --ink: #16130f;
    --ink-soft: #55504a;
    --rule: #d9d2c6;
    --gold: #8a6a33;
    --gold-bright: #c8a96e;
    --red: #8b1a1a;
    --paper: #ffffff;
    --panel: #f6f2ea;
    --mono: "SFMono-Regular", Menlo, Consolas, monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size: 10.6pt;
    line-height: 1.58;
  }

  p { margin-bottom: 9pt; orphans: 3; widows: 3; }
  strong { font-weight: 700; }
  a { color: var(--ink); text-decoration: none; border-bottom: 0.5pt solid var(--gold); }
  code { font-family: var(--mono); font-size: 0.88em; color: var(--gold); }

  /* ---- cover ---- */
  .cover {
    background: #080808;
    color: #f0ece4;
    height: 100vh;
    padding: 30mm 24mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    break-after: page;
  }
  .cover-mark { font-size: 9pt; letter-spacing: 0.24em; text-transform: uppercase; color: var(--gold-bright); }
  .cover-title { font-size: 76pt; font-weight: 800; letter-spacing: -0.045em; line-height: 0.92; margin-bottom: 10pt; }
  .cover-sub { font-size: 15pt; font-weight: 600; color: #f0ece4; letter-spacing: -0.01em; margin-bottom: 14pt; }
  .cover-dek { font-size: 11pt; color: #a9a49a; max-width: 105mm; line-height: 1.55; }
  .cover-rule { height: 1pt; background: #2a2724; margin: 16pt 0; }
  .cover-foot { font-size: 9.5pt; color: #a9a49a; display: flex; justify-content: space-between; gap: 10pt; }
  .cover-foot b { color: #f0ece4; font-weight: 600; }

  /* ---- colophon and contents ---- */
  .front { break-after: page; padding-top: 4mm; }
  .front h2, .contents h2 {
    font-size: 20pt; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 10pt;
  }
  .colophon-row { display: flex; gap: 6pt; font-size: 9.6pt; color: var(--ink-soft); margin-bottom: 5pt; }
  .colophon-row b { color: var(--ink); font-weight: 600; min-width: 26mm; }

  .contents { break-after: page; padding-top: 4mm; }
  .toc-part {
    font-size: 8.5pt; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--red); margin: 14pt 0 6pt;
  }
  .toc-line { display: flex; align-items: baseline; gap: 6pt; font-size: 10.4pt; margin-bottom: 4.5pt; }
  .toc-line .num { font-family: var(--mono); font-size: 8.5pt; color: var(--gold); min-width: 22mm; }
  .toc-line .name { font-weight: 600; }
  .toc-line .len { margin-left: auto; font-size: 8.5pt; color: var(--ink-soft); font-family: var(--mono); }

  /* ---- part dividers ---- */
  .part-page {
    break-before: page;
    height: 92vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .part-page .kicker { font-size: 9pt; letter-spacing: 0.24em; text-transform: uppercase; color: var(--red); margin-bottom: 8pt; }
  .part-page h2 { font-size: 40pt; font-weight: 800; letter-spacing: -0.035em; line-height: 1; margin-bottom: 10pt; }
  .part-page p { font-size: 12pt; color: var(--ink-soft); max-width: 110mm; }

  /* ---- chapters ---- */
  .chapter { break-before: page; }
  .chapter-kicker { font-size: 8.5pt; letter-spacing: 0.2em; text-transform: uppercase; color: var(--red); margin-bottom: 6pt; }
  .chapter h1 { font-size: 27pt; font-weight: 800; letter-spacing: -0.03em; line-height: 1.06; margin-bottom: 8pt; }
  .chapter-dek { font-size: 11pt; color: var(--ink-soft); margin-bottom: 12pt; padding-bottom: 12pt; border-bottom: 0.75pt solid var(--rule); }

  h2 {
    font-size: 14pt; font-weight: 800; letter-spacing: -0.015em;
    margin: 16pt 0 6pt; break-after: avoid;
  }
  h3 { font-size: 11pt; font-weight: 700; margin: 11pt 0 4pt; break-after: avoid; }

  ul, ol { margin: 0 0 9pt; padding-left: 0; list-style: none; }
  li { position: relative; padding-left: 12pt; margin-bottom: 4pt; break-inside: avoid; }
  ul li::before { content: ""; position: absolute; left: 0; top: 7pt; width: 6pt; height: 0.75pt; background: var(--gold); }
  ol { counter-reset: item; }
  ol li { counter-increment: item; padding-left: 15pt; }
  ol li::before { content: counter(item) "."; position: absolute; left: 0; font-family: var(--mono); font-size: 8.5pt; color: var(--gold); }

  pre {
    background: var(--panel);
    border: 0.5pt solid var(--rule);
    border-radius: 2pt;
    padding: 7pt 9pt;
    margin: 8pt 0;
    font: 8.4pt/1.5 var(--mono);
    color: #4a3d24;
    white-space: pre-wrap;
    break-inside: avoid;
  }
  pre code { color: inherit; font-size: inherit; }

  .table-wrap { margin: 9pt 0; break-inside: avoid; }
  table { border-collapse: collapse; width: 100%; font-size: 9.2pt; }
  th, td { text-align: left; padding: 5pt 7pt; border-bottom: 0.5pt solid var(--rule); vertical-align: top; }
  th { font-size: 7.6pt; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-soft); background: var(--panel); }
  td:first-child code { white-space: nowrap; }

  .panel.move {
    border: 0.75pt solid var(--gold);
    background: var(--panel);
    border-radius: 2pt;
    padding: 9pt 11pt;
    margin: 14pt 0 0;
    break-inside: avoid;
  }
  .move-label { font-size: 8pt; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 5pt; }
  .panel.move p:last-child { margin-bottom: 0; }

  .end { break-before: page; padding-top: 40mm; text-align: center; }
  .end p { font-size: 11pt; color: var(--ink-soft); }
  .end .line { font-size: 17pt; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); margin-bottom: 10pt; }
`;

// -------------------------------------------------------------------- body

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// PUBLISHED is an ISO date; render it the way a title page would.
const editionDate = new Date(`${PUBLISHED}T00:00:00Z`).toLocaleDateString("en-US", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

const front = sources.find((p) => p.label === "Front matter");
const chapters = sources.filter((p) => p.part);
const appendices = sources.filter((p) => !p.part && p.label !== "Front matter");

const tocGroups = [
  { kicker: "Front matter", pages: [front] },
  ...Object.entries(PARTS).map(([key, part]) => ({
    kicker: `${part.name} &middot; ${part.title}`,
    pages: chapters.filter((p) => String(p.part) === key),
  })),
  { kicker: "Appendices", pages: appendices },
];

const tocHtml = tocGroups
  .map(
    (group) => `      <p class="toc-part">${group.kicker}</p>
${group.pages
  .map(
    (p) => `      <div class="toc-line"><span class="num">${p.label === "Front matter" ? "&mdash;" : p.label}</span><span class="name">${escape(p.label === "Front matter" ? "Why this book exists" : p.title)}</span><span class="len">${p.words.toLocaleString()} w</span></div>`
  )
  .join("\n")}`
  )
  .join("\n");

const chapterHtml = (page, opts = {}) => {
  const part = page.part ? PARTS[page.part] : null;
  const kicker = part ? `${part.name} &middot; ${page.label}` : page.label;
  const partPage =
    opts.openPart
      ? `    <section class="part-page">
      <p class="kicker">${part.name}</p>
      <h2>${escape(part.title)}</h2>
      <p>${escape(part.blurb)}</p>
    </section>
`
      : "";
  return `${partPage}    <section class="chapter">
      <p class="chapter-kicker">${kicker}</p>
      <h1>${escape(page.title)}</h1>
      <p class="chapter-dek">${escape(page.dek)}</p>
      ${renderMarkdown(page.md)}
    </section>
`;
};

let lastPart = null;
const bodyHtml = [
  chapterHtml(front),
  ...chapters.map((page) => {
    const openPart = page.part !== lastPart;
    lastPart = page.part;
    return chapterHtml(page, { openPart });
  }),
  ...appendices.map((page) => chapterHtml(page)),
].join("\n");

const printHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>S-Tier: The Builder's Book Behind the Suede Skills</title>
    <style>${PRINT_CSS}</style>
  </head>
  <body>
    <section class="cover">
      <div>
        <p class="cover-mark">Suede Creator Skills &middot; ${SKILL_COUNT} open-source agent skills</p>
      </div>
      <div>
        <p class="cover-title">S-Tier</p>
        <p class="cover-sub">The Builder's Book Behind the Suede Skills</p>
        <div class="cover-rule"></div>
        <p class="cover-dek">How agent skills actually work, and how a builder gets good enough that the work keeps running without them.</p>
      </div>
      <div>
        <div class="cover-rule"></div>
        <p class="cover-foot"><span><b>Jason Colapietro</b> &middot; Suede Labs AI</span><span>${totalWords.toLocaleString()} words &middot; book prose MIT</span></p>
      </div>
    </section>

    <section class="front">
      <h2>Colophon</h2>
      <div class="colophon-row"><b>Title</b><span>S-Tier: The Builder's Book Behind the Suede Skills</span></div>
      <div class="colophon-row"><b>Author</b><span>Jason Colapietro, founder of Suede Labs AI</span></div>
      <div class="colophon-row"><b>Edition</b><span>First, ${editionDate}</span></div>
      <div class="colophon-row"><b>Length</b><span>${totalWords.toLocaleString()} words across ${chapters.length} chapters, front matter, and ${appendices.length} appendices</span></div>
      <div class="colophon-row"><b>Licence</b><span>Book prose is MIT. The adapted Graph of Thoughts workflow carries its upstream BSD terms.</span></div>
      <div class="colophon-row"><b>Read online</b><span>skills.suedeai.ai/book/</span></div>
      <div class="colophon-row"><b>Source</b><span>github.com/JasonColapietro/suede-creator-skills &rarr; book/</span></div>
      <br>
      <p>Every claim in this book points at a file in a public repository. Checking claims is most of what the book argues for, so the citations are paths rather than footnotes: open the repo and read the skill.</p>
      <p>The prose was written against the same anti-slop rules the pack enforces, which is why it contains no em dashes. Quoted repo material keeps its own punctuation.</p>
      <p>Thirty-eight of the marketing and growth skills referenced here are adapted from <b>marketingskills</b> by Corey Haines under the MIT Licence. That project is the origin of the material and the credit belongs there.</p>
      <p>The <b>suede-graph-flo-xr</b> operation graph and thought-state model adapt Graph of Thoughts by ETH Zurich: Maciej Besta et al. (2024), <i>Graph of Thoughts: Solving Elaborate Problems with Large Language Models</i>, AAAI 38(16), 17682-17690, doi:10.1609/aaai.v38i16.29720.</p>
    </section>

    <section class="contents">
      <h2>Contents</h2>
${tocHtml}
    </section>

${bodyHtml}
    <section class="end">
      <p class="line">Never end your allocation above zero.</p>
      <p>skills.suedeai.ai/book/</p>
    </section>
  </body>
</html>
`;

// ------------------------------------------------------------------- write

const tmpHtml = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "suede-book-")), "s-tier.print.html");
fs.writeFileSync(tmpHtml, printHtml);

if (htmlOnly) {
  console.log(`print HTML written to ${tmpHtml}`);
  process.exit(0);
}

const chrome = CHROME_CANDIDATES.find((candidate) => fs.existsSync(candidate));
if (!chrome) {
  console.error("No Chrome, Chromium, or Edge binary found. Install one, or run with --html-only and print the HTML yourself.");
  console.error(`Print HTML is at ${tmpHtml}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outPdf), { recursive: true });
const tempPdfDir = fs.mkdtempSync(path.join(path.dirname(outPdf), ".s-tier-pdf-"));
const tempPdf = path.join(tempPdfDir, "s-tier.pdf");
const result = spawnSync(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    // Tags the output, which gives the PDF a real heading structure for
    // screen readers and gives most viewers a navigable outline.
    "--export-tagged-pdf",
    "--virtual-time-budget=20000",
    `--print-to-pdf=${tempPdf}`,
    `file://${tmpHtml}`,
  ],
  { encoding: "utf8" }
);

if (result.status !== 0 || !fs.existsSync(tempPdf) || fs.statSync(tempPdf).size === 0) {
  fs.rmSync(tempPdfDir, { recursive: true, force: true });
  console.error(result.stderr || "Chrome did not write a PDF.");
  process.exit(1);
}

const inputDigestAfter = bookPdfInputDigest(repoRoot);
if (inputDigestAfter !== inputDigestBefore) {
  fs.rmSync(tempPdfDir, { recursive: true, force: true });
  console.error("Book inputs changed while Chrome rendered the PDF; existing output was left untouched.");
  process.exit(1);
}
fs.renameSync(tempPdf, outPdf);
fs.rmSync(tempPdfDir, { recursive: true, force: true });
const bytes = fs.statSync(outPdf).size;
const provenancePath = path.join(repoRoot, PDF_PROVENANCE_RELATIVE);
fs.writeFileSync(provenancePath, `${JSON.stringify({
  schemaVersion: 1,
  inputSha256: inputDigestBefore,
  pdfSha256: bookPdfDigest(repoRoot),
}, null, 2)}\n`);
console.log(`docs/book/s-tier.pdf written — ${(bytes / 1024).toFixed(0)} KB, ${totalWords.toLocaleString()} words.`);
