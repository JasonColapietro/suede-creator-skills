#!/usr/bin/env node
// Renders book/*.md into docs/book/ as static HTML in the site's design
// language. Source of truth is the Markdown: never hand-edit docs/book/*.html,
// edit the chapter and re-run this script.
//
// Usage:
//   node scripts/build-book-site.mjs          # write docs/book/
//   node scripts/build-book-site.mjs --check  # exit 1 if any page would change

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bookDir = path.join(repoRoot, "book");
const outDir = path.join(repoRoot, "docs", "book");
const checkOnly = process.argv.includes("--check");

const BASE = "https://skills.suedeai.ai";
const REPO = "https://github.com/JasonColapietro/suede-creator-skills";
const PUBLISHED = "2026-08-10";

// Counted from disk, never typed. The pack size appears on every generated
// page, and a number written into a template is exactly the kind of duplicated
// claim scripts/validate-skill-pack.mjs exists to catch.
const SKILL_COUNT = fs
  .readdirSync(path.join(repoRoot, "skills"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory()).length;

// Deks are authored here rather than sliced out of the prose: the first
// sentence of a chapter is written to land, not to describe, and a truncated
// opener makes a bad meta description and a worse contents listing.
const PAGES = [
  {
    file: "00-front-matter.md",
    slug: "front-matter",
    part: null,
    label: "Front matter",
    title: "Front matter",
    dek: "Why the book exists, who it is for, how to read it, and the four ideas every chapter leans on.",
  },
  {
    file: "01-the-competence-gap.md",
    slug: "the-competence-gap",
    part: 1,
    label: "Chapter 1",
    title: "The Competence Gap",
    dek: "A capable model plus a vague prompt produces confident mediocrity. The gap is not intelligence, it is procedure, and procedure is now a file you own.",
  },
  {
    file: "02-anatomy-of-a-skill.md",
    slug: "anatomy-of-a-skill",
    part: 1,
    label: "Chapter 2",
    title: "Anatomy of a Skill",
    dek: "A real SKILL.md taken apart: frontmatter, routing description, body, bundled references and scripts, and the advisory-gate policy that keeps a grader from blocking you.",
  },
  {
    file: "03-the-description-contract.md",
    slug: "the-description-contract",
    part: 1,
    label: "Chapter 3",
    title: "The Description Contract",
    dek: "The description field is the router. Trigger words, NOT FOR boundaries, overlapping descriptions, and what a dead route costs inside your agent.",
  },
  {
    file: "04-full-send.md",
    slug: "full-send",
    part: 2,
    label: "Chapter 4",
    title: "Full Send",
    dek: "Outcome-bound work: freeze the mission before you mutate anything, fill useful non-colliding lanes, and bring back a decision instead of a workshop.",
  },
  {
    file: "05-lanes-fleets-and-collisions.md",
    slug: "lanes-fleets-and-collisions",
    part: 2,
    label: "Chapter 5",
    title: "Lanes, Fleets, and Collisions",
    dek: "Multi-agent work that is not theater: disjoint file ownership, isolated worktrees, atomic leases, and the measured cost of a fan-out that should have been one agent.",
  },
  {
    file: "06-evidence-or-it-didnt-ship.md",
    slug: "evidence-or-it-did-not-ship",
    part: 2,
    label: "Chapter 6",
    title: "Evidence or It Did Not Ship",
    dek: "The verification discipline the rest of the book rests on, built from three real failures: a truncated test log, a page that passed a colour check while rendering unreadable, and a test file serving traffic in production.",
  },
  {
    file: "07-grading-your-own-work.md",
    slug: "grading-your-own-work",
    part: 3,
    label: "Chapter 7",
    title: "Grading Your Own Work",
    dek: "Seven scored lanes, instant-F triggers, grade caps on auth and payment surfaces, and the actual skill: predicting the grade before you run it.",
  },
  {
    file: "08-design-and-copy-are-engineering.md",
    slug: "design-and-copy-are-engineering",
    part: 3,
    label: "Chapter 8",
    title: "Design and Copy Are Engineering",
    dek: "Tokens instead of hex codes chosen in the moment, numeric thresholds instead of opinions, and an anti-slop gate for prose that reads fine sentence by sentence and hollow paragraph by paragraph.",
  },
  {
    file: "09-getting-found.md",
    slug: "getting-found",
    part: 3,
    label: "Chapter 9",
    title: "Getting Found",
    dek: "Distribution as an engineering surface: the shift from ranking to being cited, nine audit lanes, an A-F visibility grade, and why a page that cannot be quoted will not be cited.",
  },
  {
    file: "10-shipping-into-the-real-world.md",
    slug: "shipping-into-the-real-world",
    part: 3,
    label: "Chapter 10",
    title: "Shipping Into the Real World",
    dek: "The last mile: App Store and Play Store gauntlets, release evidence gates, and a procedure that recovered $448.31 by running outside a repo entirely.",
  },
  {
    file: "11-the-s-tier-ladder.md",
    slug: "the-s-tier-ladder",
    part: 4,
    label: "Chapter 11",
    title: "The S-Tier Ladder",
    dek: "Five tiers defined by observable behavior, with the week, the transcript fingerprint, the failure that holds you there, and the move that promotes you. Most readers place themselves one rung high.",
  },
  {
    file: "12-taste-judgment-and-stopping.md",
    slug: "taste-judgment-and-stopping",
    part: 4,
    label: "Chapter 12",
    title: "Taste, Judgment, and Knowing When to Stop",
    dek: "The layer no procedure supplies: which decisions are yours, why a bug fix that becomes a refactor is a judgment failure, and how to tell finished from merely different.",
  },
  {
    file: "13-write-your-own.md",
    slug: "write-your-own",
    part: 4,
    label: "Chapter 13",
    title: "Write Your Own",
    dek: "Authoring skills: when to write one, what goes in the body versus references, the competent-stranger test, and how to lint an estate before a dead route bites.",
  },
  {
    file: "14-the-first-ninety-days.md",
    slug: "the-first-ninety-days",
    part: 4,
    label: "Chapter 14",
    title: "The First Ninety Days",
    dek: "A real practice plan in three phases, a list of anti-goals, two honest measurements, and the close: never end your allocation above zero.",
  },
  {
    file: "A1-skill-index.md",
    slug: "skill-index",
    part: null,
    label: "Appendix A",
    title: "The Skill Index, by Intent",
    dek: "Every public skill in the pack, grouped by what you are trying to do rather than by what it is called.",
  },
  {
    file: "A2-the-rules.md",
    slug: "the-rules",
    part: null,
    label: "Appendix B",
    title: "The Rules, on One Page",
    dek: "Everything the book argues for, compressed to 29 rules across evidence, decisions, scope, parallelism, skills, craft, and stopping.",
  },
];

const PARTS = {
  1: { name: "Part I", title: "The Machinery", blurb: "What a skill is, how it is built, and how an agent decides to load it." },
  2: { name: "Part II", title: "The Operating System", blurb: "Outcome-bound work, agent lanes and worker fleets, and the verification discipline underneath both." },
  3: { name: "Part III", title: "The Craft Lanes", blurb: "Grading code, treating design and copy as systems, distribution, and the last mile." },
  4: { name: "Part IV", title: "Becoming S-Tier", blurb: "The ladder, the judgment layer, authoring your own skills, and ninety days of practice." },
};

const slugToFile = new Map(PAGES.map((p) => [p.file, `${p.slug}.html`]));

// ---------------------------------------------------------------- markdown

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inline(text) {
  // Code spans are extracted first so their contents never get bold/link
  // treatment, then restored. Without this, a span like `**/*.md` becomes bold.
  const spans = [];
  let out = text.replace(/`([^`]+)`/g, (_, code) => {
    spans.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000${spans.length - 1}\u0000`;
  });
  out = escapeHtml(out);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    let url = href;
    if (slugToFile.has(href)) url = slugToFile.get(href);
    else if (href === "BOOK.md" || href === "STYLE.md") url = `${REPO}/blob/main/book/${href}`;
    const external = /^https?:/.test(url);
    const attrs = external ? ' target="_blank" rel="noopener"' : "";
    return `<a href="${url}"${attrs}>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => spans[Number(i)]);
}

function renderMarkdown(md) {
  const lines = md.split("\n");
  const html = [];
  let i = 0;
  let inMove = false;

  const flushMove = () => {
    if (inMove) {
      html.push("</div>");
      inMove = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      i += 1;
      html.push(`<pre><code>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    if (/^# /.test(line)) { i += 1; continue; } // page h1 is rendered by the shell

    if (/^### /.test(line)) {
      const text = line.slice(4).trim();
      if (/^The move$/i.test(text)) {
        flushMove();
        html.push('<div class="panel move"><p class="move-label">The move</p>');
        inMove = true;
      } else {
        html.push(`<h3>${inline(text)}</h3>`);
      }
      i += 1;
      continue;
    }

    if (/^## /.test(line)) {
      flushMove();
      const text = line.slice(3).trim();
      html.push(`<h2 id="${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}">${inline(text)}</h2>`);
      i += 1;
      continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (row) => row.split("|").slice(1, -1).map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      html.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`
      );
      continue;
    }

    if (/^(\s*)([-*]|\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\.\s/.test(line);
      const items = [];
      while (i < lines.length && /^(\s*)([-*]|\d+\.)\s/.test(lines[i])) {
        let text = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, "");
        i += 1;
        // Continuation lines of a wrapped list item.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^(\s*)([-*]|\d+\.)\s/.test(lines[i])) {
          text += ` ${lines[i].trim()}`;
          i += 1;
        }
        items.push(`<li>${inline(text)}</li>`);
      }
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    if (line.trim() === "" || line.trim() === "---") { i += 1; continue; }

    const para = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,3} |```|\||\s*([-*]|\d+\.)\s)/.test(lines[i])) {
      para.push(lines[i++].trim());
    }
    html.push(`<p>${inline(para.join(" "))}</p>`);
  }

  flushMove();
  return html.join("\n      ");
}

// ------------------------------------------------------------------ shell

const css = fs.readFileSync(path.join(repoRoot, "docs", "blog", "why-breadth-is-free.html"), "utf8")
  .match(/<style>([\s\S]*?)<\/style>/)[1];

const BOOK_CSS = `
      .book-meta { display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 13px; color: var(--muted); letter-spacing: 0.04em; margin-bottom: 28px; }
      ol { list-style: none; counter-reset: item; margin: 0 0 16px; }
      ol li { counter-increment: item; }
      ol li::before { content: counter(item); top: 0; width: auto; height: auto; background: none; color: var(--gold); font-size: 13px; font-weight: 700; font-family: var(--mono); }
      .table-wrap { overflow-x: auto; margin: 20px 0; border: 1px solid var(--border); border-radius: 6px; }
      table { border-collapse: collapse; width: 100%; font-size: 15px; }
      th, td { text-align: left; padding: 11px 14px; border-bottom: 1px solid var(--hairline); vertical-align: top; }
      th { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); font-weight: 600; background: var(--surface); }
      td:first-child code { white-space: nowrap; }
      tbody tr:last-child td { border-bottom: none; }
      .panel.move { border-color: rgba(200, 169, 110, 0.45); background: rgba(200, 169, 110, 0.06); margin-top: 36px; }
      .move-label { font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
      .pager { display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; margin-top: 48px; border-top: 1px solid var(--hairline); padding-top: 24px; }
      .pager a { display: block; max-width: 47%; min-width: 220px; flex: 1 1 220px; border: 1px solid var(--border); border-radius: 6px; padding: 14px 16px; border-bottom: 1px solid var(--border); }
      .pager a:hover { border-color: var(--gold); }
      .pager .dir { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 4px; }
      .pager .to { font-size: 15.5px; font-weight: 700; color: var(--cream); }
      .pager .next { text-align: right; margin-left: auto; }
      .part-head { margin: 52px 0 6px; }
      .part-head .part-name { font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--red-text); }
      .part-head h2 { margin: 6px 0 4px; }
      .part-blurb { font-size: 15px; color: var(--muted); margin-bottom: 18px; }
      .toc { display: grid; gap: 10px; }
      .toc-row { display: block; border: 1px solid var(--border); border-radius: 6px; padding: 16px 18px; background: var(--card); border-bottom: 1px solid var(--border); }
      .toc-row:hover { border-color: var(--gold); }
      .toc-num { font-size: 11px; font-family: var(--mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
      .toc-title { font-size: 18px; font-weight: 700; color: var(--cream); margin: 4px 0 6px; letter-spacing: -0.01em; }
      .toc-dek { font-size: 14.5px; color: var(--muted); line-height: 1.6; margin: 0; }
      .stat-row { display: flex; flex-wrap: wrap; gap: 10px 36px; margin: 26px 0 8px; padding: 18px 0; border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); }
      .stat b { display: block; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: var(--cream); }
      .stat span { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
`;

function shell({ title, description, canonical, jsonLd, body, depth }) {
  const up = depth === 0 ? "../" : "../";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="author" content="Jason Colapietro">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="${up}assets/suede-ai-logo-transparent.png" type="image/png">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${BASE}/assets/og-image-v2.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${BASE}/assets/og-image-v2.png">
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
    <style>${css}${BOOK_CSS}    </style>
  </head>
  <body>
<a class="skip-link" href="#main">Skip to content</a>

    <header class="nav">
      <nav class="nav-inner" aria-label="Main navigation">
        <a href="${up}" class="nav-logo" aria-label="Suede Creator Skills home">
          <img src="${up}assets/suede-ai-logo-transparent.png" alt="Suede AI" width="28" height="28" onerror="this.style.display='none'">
          <span class="nav-logo-wordmark">Suede <span>Creator Skills</span></span>
        </a>
        <div class="nav-links">
          <a href="${up}">Home</a>
          <a href="${up}skills/">Skills</a>
          <a href="${up}guide.html">Guide</a>
          <a href="./" aria-current="page">Book</a>
          <a href="${up}blog/">Blog</a>
          <a href="${up}copy.html">Copy Bank</a>
          <a href="${up}plugins.html" class="nav-cta">Install</a>
        </div>
      </nav>
    </header>
    <main id="main" tabindex="-1" class="shell">
${body}
    </main>
    <section class="ship-strip" aria-label="Install the pack">
      <div class="ship-strip-shell">
        <p class="ship-strip-head">Proof is part of the release.</p>
        <p class="ship-strip-sub">First install takes two commands. After the marketplace is added, install is one. Every skill is plain Markdown.</p>
        <div class="ship-strip-row">
          <code><span class="prompt">$</span> /plugin marketplace add JasonColapietro/suede-creator-skills &rarr; /plugin install suede-skills@suede</code>
          <a href="${up}plugins.html">All install paths</a>
        </div>
      </div>
    </section>
    <footer>
      <div class="footer-shell">
        <p class="footer-note">Suede Creator Skills is a ${SKILL_COUNT}-skill, MIT-licensed pack for Claude Code and OpenAI Codex: outcome-bound orchestration, code review with an A-F ship grade, AI evals, design and copy, SEO/AEO/AI EO, iOS and Android app shipping, and a creator toolkit for music rights and release prep.</p>
        <div class="footer-inner">
          <div class="footer-brand">
            <img src="${up}assets/suede-ai-logo-transparent.png" alt="Suede AI" onerror="this.style.display='none'">
            <span>Built by <strong>Jason Colapietro</strong> / Suede Labs AI</span>
          </div>
          <div class="footer-links">
            <a href="https://x.com/johnnysuede" target="_blank" rel="noopener">@johnnysuede</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="https://suedeai.ai" target="_blank" rel="noopener">suedeai.ai</a>
            <span class="footer-divider" aria-hidden="true">|</span>
            <a href="${REPO}" target="_blank" rel="noopener">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  </body>
</html>
`;
}

// ------------------------------------------------------------------ build

const written = new Map();
let totalWords = 0;

const sources = PAGES.map((page) => {
  const md = fs.readFileSync(path.join(bookDir, page.file), "utf8");
  const words = md.split(/\s+/).filter(Boolean).length;
  totalWords += words;
  return { ...page, md, words, minutes: Math.max(1, Math.round(words / 230)) };
});

sources.forEach((page, index) => {
  const prev = sources[index - 1];
  const next = sources[index + 1];
  const part = page.part ? PARTS[page.part] : null;
  const eyebrow = part ? `${part.name} &middot; ${page.label}` : page.label;
  const canonical = `${BASE}/book/${page.slug}.html`;

  const pager = [];
  if (prev) pager.push(`<a class="prev" href="${prev.slug}.html"><span class="dir">Previous</span><span class="to">${prev.label}. ${prev.title}</span></a>`);
  if (next) pager.push(`<a class="next" href="${next.slug}.html"><span class="dir">Next</span><span class="to">${next.label}. ${next.title}</span></a>`);

  const body = `      <p class="eyebrow">${eyebrow}</p>
      <h1>${page.title}</h1>
      <p class="post-meta">${page.dek}</p>
      <div class="book-meta"><span>${page.words.toLocaleString()} words</span><span>${page.minutes} min read</span><span><a href="./">S-Tier: contents</a></span></div>

      ${renderMarkdown(page.md)}

      <nav class="pager" aria-label="Chapter navigation">
        ${pager.join("\n        ")}
      </nav>`;

  const html = shell({
    title: `${page.label}. ${page.title} | S-Tier, the builder's book`,
    description: page.dek,
    canonical,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Chapter",
      "@id": `${canonical}#chapter`,
      name: `${page.label}. ${page.title}`,
      headline: page.title,
      description: page.dek,
      url: canonical,
      position: index + 1,
      wordCount: page.words,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      inLanguage: "en",
      isPartOf: { "@type": "Book", "@id": `${BASE}/book/#book`, name: "S-Tier: The Builder's Book Behind the Suede Skills" },
      author: { "@type": "Person", name: "Jason Colapietro", url: "https://github.com/JasonColapietro" },
      publisher: { "@type": "Organization", name: "Suede Labs AI", url: "https://suedeai.ai" },
      mainEntityOfPage: canonical,
    },
    body,
    depth: 1,
  });

  written.set(path.join(outDir, `${page.slug}.html`), html);
});

// ------------------------------------------------------------- index page

const tocGroups = [];
let current = null;
for (const page of sources) {
  const key = page.part ?? (page.label === "Front matter" ? "front" : "appendix");
  if (!current || current.key !== key) {
    current = { key, pages: [] };
    tocGroups.push(current);
  }
  current.pages.push(page);
}

const groupHeading = (group) => {
  if (group.key === "front") return "";
  if (group.key === "appendix") {
    return `      <div class="part-head"><p class="part-name">Appendices</p><h2 id="appendices">Reference</h2></div>
      <p class="part-blurb">The pack indexed by intent, and every rule the book argues for on one page.</p>\n`;
  }
  const part = PARTS[group.key];
  return `      <div class="part-head"><p class="part-name">${part.name}</p><h2 id="part-${group.key}">${part.title}</h2></div>
      <p class="part-blurb">${part.blurb}</p>\n`;
};

// The front-matter card is rendered separately in the index body, so drop its
// group here rather than slicing the joined string later: group markup already
// contains blank lines, and a string split would cut in the wrong place.
const toc = tocGroups
  .filter((group) => group.key !== "front")
  .map(
    (group) =>
      `${groupHeading(group)}      <div class="toc">
${group.pages
  .map(
    (p) => `        <a class="toc-row" href="${p.slug}.html">
          <span class="toc-num">${p.label} &middot; ${p.minutes} min</span>
          <p class="toc-title">${p.title}</p>
          <p class="toc-dek">${p.dek}</p>
        </a>`
  )
  .join("\n")}
      </div>`
  )
  .join("\n\n");

const indexDek =
  "A free book on how agent skills actually work and how a builder gets genuinely good with them. Fourteen chapters, grounded in a public " + SKILL_COUNT + "-skill repo you can check line by line.";

const indexBody = `      <p class="eyebrow">Book &middot; August 10, 2026</p>
      <h1>S-Tier</h1>
      <p class="post-meta">The builder's book behind the Suede Skills. Free, MIT-licensed, and written against the same anti-slop rules the pack enforces.</p>

      <p class="lead">Most advice about building with agents stops at prompting. This goes past it: what a skill is mechanically, how an agent decides to load one, how to run several without them colliding, what counts as evidence, and what separates a builder who produces output from one who builds systems that keep producing verified output without them.</p>

      <div class="stat-row">
        <div class="stat"><b>${totalWords.toLocaleString()}</b><span>words</span></div>
        <div class="stat"><b>14</b><span>chapters</span></div>
        <div class="stat"><b>${SKILL_COUNT}</b><span>skills referenced</span></div>
        <div class="stat"><b>MIT</b><span>licensed</span></div>
      </div>

      <p>Every claim in it points at a file in the public repo, so you can check the ones you doubt. Checking claims is most of what the book argues for, so please do. You do not need the pack installed to read it.</p>

      <p><a class="button" href="the-competence-gap.html">Start reading: Chapter 1</a> <a class="button secondary" href="${REPO}/blob/main/book/BOOK.md" target="_blank" rel="noopener">Read it as one Markdown file</a></p>

      <div class="divider"></div>

      <h2 id="contents">Contents</h2>
      <div class="toc">
        <a class="toc-row" href="front-matter.html">
          <span class="toc-num">Front matter &middot; ${sources[0].minutes} min</span>
          <p class="toc-title">Why this book exists</p>
          <p class="toc-dek">${sources[0].dek}</p>
        </a>
      </div>

${toc}

      <div class="divider"></div>

      <h2 id="about">About the prose</h2>
      <p>The pack ships <code>suede-deslop</code>, a skill that strips AI writing patterns out of text before it goes public: filler openers, manufactured enthusiasm, false agency, formulaic contrast, metronomic rhythm, and em dashes. Publishing a book that tripped every rule in it would have been a poor advertisement.</p>
      <p>So the book was written against those constraints, and the prose carries no em dashes. Quoted repo material keeps its own punctuation, because editing a quotation to fit a style rule is the kind of small dishonesty this pack exists to catch.</p>
      <p>Source lives in <a href="${REPO}/tree/main/book" target="_blank" rel="noopener">book/</a>. Skill counts written into the prose are guarded by the repo's validator, so a chapter that goes stale fails the same way a stale meta tag does.</p>`;

written.set(
  path.join(outDir, "index.html"),
  shell({
    title: "S-Tier: The Builder's Book Behind the Suede Skills",
    description: indexDek,
    canonical: `${BASE}/book/`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Book",
      "@id": `${BASE}/book/#book`,
      name: "S-Tier: The Builder's Book Behind the Suede Skills",
      description: indexDek,
      url: `${BASE}/book/`,
      inLanguage: "en",
      bookFormat: "https://schema.org/EBook",
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT",
      numberOfPages: sources.length,
      datePublished: PUBLISHED,
      author: { "@type": "Person", name: "Jason Colapietro", url: "https://github.com/JasonColapietro" },
      publisher: { "@type": "Organization", name: "Suede Labs AI", url: "https://suedeai.ai" },
      hasPart: sources.map((p, i) => ({
        "@type": "Chapter",
        "@id": `${BASE}/book/${p.slug}.html#chapter`,
        name: `${p.label}. ${p.title}`,
        url: `${BASE}/book/${p.slug}.html`,
        position: i + 1,
      })),
    },
    body: indexBody,
    depth: 0,
  })
);

// ------------------------------------------------------------------ write

fs.mkdirSync(outDir, { recursive: true });
let changed = 0;
for (const [file, html] of written) {
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (existing === html) continue;
  changed += 1;
  if (!checkOnly) fs.writeFileSync(file, html);
}

if (checkOnly) {
  if (changed > 0) {
    console.error(`docs/book is stale — ${changed} page(s) would change. Run: node scripts/build-book-site.mjs`);
    process.exit(1);
  }
  console.log(`docs/book is current — ${written.size} pages, ${totalWords.toLocaleString()} words.`);
} else {
  console.log(`docs/book written — ${written.size} pages (${changed} changed), ${totalWords.toLocaleString()} words.`);
}
