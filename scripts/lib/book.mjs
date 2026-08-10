#!/usr/bin/env node
// Shared source model for the book: the page manifest, part groupings, and the
// small Markdown renderer. Imported by scripts/build-book-site.mjs (the site
// section) and scripts/build-book-pdf.mjs (the print edition) so both read one
// manifest and render chapters identically.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const bookDir = path.join(repoRoot, "book");

export const BASE = "https://skills.suedeai.ai";
export const REPO = "https://github.com/JasonColapietro/suede-creator-skills";
export const PUBLISHED = "2026-08-10";

// Counted from disk, never typed. The pack size appears on every generated
// page, and a number written into a template is exactly the kind of duplicated
// claim scripts/validate-skill-pack.mjs exists to catch.
export const SKILL_COUNT = fs
  .readdirSync(path.join(repoRoot, "skills"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory()).length;

// Deks are authored here rather than sliced out of the prose: the first
// sentence of a chapter is written to land, not to describe, and a truncated
// opener makes a bad meta description and a worse contents listing.
export const PAGES = [
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

export const PARTS = {
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

export function renderMarkdown(md) {
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


// One place that reads the Markdown off disk and stamps word counts, so the
// site build and the PDF build can never disagree about the book's length.
export function loadSources() {
  return PAGES.map((page) => {
    const md = fs.readFileSync(path.join(bookDir, page.file), "utf8");
    const words = md.split(/\s+/).filter(Boolean).length;
    return { ...page, md, words, minutes: Math.max(1, Math.round(words / 230)) };
  });
}
