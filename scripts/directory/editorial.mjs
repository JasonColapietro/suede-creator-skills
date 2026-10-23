// Renders the directory guides in directory/editorial/*.md to HTML for
// scripts/build-directory.mjs. The Markdown is Suede AI's own editorial copy,
// so the renderer supports exactly what those files use: H2 and H3 headings,
// paragraphs, bullet and numbered lists, pipe tables, fenced code, and inline
// code, bold, italic and links. Anything else renders as escaped text.

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const headingId = (text) =>
  text.toLowerCase().replace(/`/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";

// Inline Markdown to HTML. resolveHref maps a Markdown link target to the href
// the page should print (and may throw for a target that does not exist).
export function inline(text, resolveHref) {
  const parts = String(text).split(/(`[^`]+`)/);
  return parts
    .map((part) => {
      if (/^`[^`]+`$/.test(part)) return `<code>${esc(part.slice(1, -1))}</code>`;
      let out = "";
      let rest = part;
      const linkRe = /\[([^\]]+)\]\(([^)\s]+)\)/;
      let m;
      while ((m = rest.match(linkRe))) {
        out += emphasis(esc(rest.slice(0, m.index)));
        const { href, external } = resolveHref(m[2]);
        out += `<a href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ""}>${emphasis(esc(m[1]))}</a>`;
        rest = rest.slice(m.index + m[0].length);
      }
      return out + emphasis(esc(rest));
    })
    .join("");
}

function emphasis(html) {
  return html.replace(/\*\*(?=\S)(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*\w])\*(?=\S)([^*]+?)\*(?!\w)/g, "$1<em>$2</em>");
}

// Splits a guide into blocks. The H1 and the two paragraphs after it (the
// byline and the Reviewed line) are dropped: the template renders both from
// the manifest.
export function parseGuide(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  let h1 = null;
  let skipParagraphs = 0;
  const isBlank = (l) => !l.trim();
  const isSpecial = (l) => /^(#{1,3} |```|\| |- |\d+\. )/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) { i++; continue; }
    if (line.startsWith("# ")) {
      if (h1 !== null) throw new Error("guide has more than one H1");
      h1 = line.slice(2).trim();
      skipParagraphs = 2;
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      if (i >= lines.length) throw new Error("unclosed code fence");
      i++;
      blocks.push({ type: "code", lang, text: body.join("\n") });
      continue;
    }
    const heading = line.match(/^(#{2,3}) (.+)$/);
    if (heading) {
      blocks.push({ type: `h${heading[1].length}`, text: heading[2].trim() });
      i++;
      continue;
    }
    if (line.startsWith("| ")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\|\s*/, "").replace(/\s*\|\s*$/, "").split(/\s*\|\s*/);
      if (rows.length < 2 || !/^\|[\s:|-]+\|$/.test(rows[1])) throw new Error(`table without a separator row: ${rows[0]}`);
      const align = cells(rows[1]).map((c) => (/^-+:$/.test(c) ? "right" : null));
      blocks.push({ type: "table", head: cells(rows[0]), align, rows: rows.slice(2).map(cells) });
      continue;
    }
    if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items = [];
      while (i < lines.length && (ordered ? /^\d+\. /.test(lines[i]) : lines[i].startsWith("- "))) {
        items.push(lines[i].replace(/^(- |\d+\. )/, "").trim());
        i++;
      }
      blocks.push({ type: ordered ? "ol" : "ul", items });
      continue;
    }
    const para = [];
    while (i < lines.length && !isBlank(lines[i]) && !isSpecial(lines[i])) para.push(lines[i++].trim());
    if (skipParagraphs > 0) { skipParagraphs--; continue; }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  if (h1 === null) throw new Error("guide has no H1");
  return { h1, blocks };
}

// Renders parsed blocks. The first paragraph (the direct answer) gets the
// answer class; the FAQ and Quotable facts sections get stable hooks.
export function renderGuideBody(blocks, resolveHref) {
  const out = [];
  const ids = new Set();
  const uniqueId = (text) => {
    const base = headingId(text);
    let id = base;
    for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
    ids.add(id);
    return id;
  };
  const tableLinks = [];
  let section = null;
  let firstParagraph = true;
  let open = false;
  const close = () => { if (open) { out.push("      </section>"); open = false; } };
  for (const b of blocks) {
    if (b.type === "h2") {
      close();
      section = b.text;
      const id = uniqueId(b.text);
      const cls = /^FAQ$/i.test(b.text) ? "panel faq" : "panel";
      out.push(`      <section class="${cls}" aria-labelledby="${id}">`, `        <h2 id="${id}">${inline(b.text, resolveHref)}</h2>`);
      open = true;
      continue;
    }
    const pad = open ? "        " : "      ";
    if (b.type === "h3") out.push(`${pad}<h3 id="${uniqueId(b.text)}">${inline(b.text, resolveHref)}</h3>`);
    else if (b.type === "p") {
      out.push(`${pad}<p${firstParagraph && !open ? ' class="answer guide-answer"' : ""}>${inline(b.text, resolveHref)}</p>`);
      firstParagraph = false;
    } else if (b.type === "ul" || b.type === "ol") {
      const facts = b.type === "ul" && /^Quotable facts$/i.test(section || "") ? ' id="facts"' : "";
      out.push(`${pad}<${b.type}${facts}>`, ...b.items.map((it) => `${pad}  <li>${inline(it, resolveHref)}</li>`), `${pad}</${b.type}>`);
    } else if (b.type === "code") {
      out.push(`${pad}<div class="snippet"><pre><code${b.lang ? ` class="language-${esc(b.lang)}"` : ""}>${esc(b.text)}</code></pre></div>`);
    } else if (b.type === "table") {
      const cell = (tag, c, k) => `<${tag}${tag === "th" ? ' scope="col"' : ""}${b.align[k] ? ` class="num"` : ""}>${inline(c, resolveHref)}</${tag}>`;
      for (const r of b.rows) {
        const link = r.map((c) => c.match(/\[([^\]]+)\]\(([^)\s]+)\)/)).find(Boolean);
        if (link) tableLinks.push({ name: link[1], target: link[2] });
      }
      out.push(
        `${pad}<div class="table-wrap">`,
        `${pad}  <table class="guide-table">`,
        `${pad}    <thead><tr>${b.head.map((c, k) => cell("th", c, k)).join("")}</tr></thead>`,
        `${pad}    <tbody>`,
        ...b.rows.map((r) => `${pad}      <tr>${r.map((c, k) => cell("td", c, k)).join("")}</tr>`),
        `${pad}    </tbody>`,
        `${pad}  </table>`,
        `${pad}</div>`,
      );
    }
  }
  close();
  return { html: out.join("\n"), tableLinks };
}

// Every Markdown link target in a guide, for link validation.
export function linkTargets(markdown) {
  return [...markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map((m) => m[1]);
}
