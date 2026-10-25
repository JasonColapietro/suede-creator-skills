// Source-only Google Search eligibility and policy signals. No fetching.
// Each rule cites the Google page it comes from in references/google-search-guidance.md.
import { markdownText } from "./offline-reports.mjs";
import { GOOGLEBOT_FETCH_LIMIT } from "./page-technical.mjs";

// Heuristic review threshold (not a Google number): 75% of the fetch limit.
const BUDGET_REVIEW = Math.round(GOOGLEBOT_FETCH_LIMIT * 0.75);

// Markup that no longer produces a Google rich result. The vocabulary stays
// valid schema.org; Google says unsupported markup causes no Search issues.
const RETIRED = [
  { type: "FAQPage", feature: "FAQ rich result", ended: "May 7, 2026" },
  { type: "HowTo", feature: "How-to rich result", ended: "2023" },
  { type: "ClaimReview", feature: "Fact check (ClaimReview) rich result", ended: "June 2025" },
  { type: "SpecialAnnouncement", feature: "Special announcement rich result", ended: "June 2025" },
  { type: "Occupation", needs: "estimatedSalary", feature: "Estimated salary rich result", ended: "June 2025" },
  { type: "Quiz", feature: "Practice problems rich result", ended: "January 2026" },
  { type: "WebSite", needs: "SearchAction", feature: "Sitelinks search box", ended: "November 21, 2024" },
];

const typeNames = (node) => [].concat(node?.["@type"] ?? []).filter((t) => typeof t === "string")
  .map((t) => t.replace(/^https?:\/\/schema\.org\//i, "").replace(/^schema:/i, ""));

function nodes(value, out = [], depth = 0) {
  if (depth > 64 || value === null || typeof value !== "object") return out;
  if (Array.isArray(value)) { for (const v of value) nodes(v, out, depth + 1); return out; }
  if (typeNames(value).length) out.push(value);
  for (const v of Object.values(value)) nodes(v, out, depth + 1);
  return out;
}

function retiredMatch(node, rule) {
  if (!typeNames(node).includes(rule.type)) return false;
  if (rule.needs === "estimatedSalary") return node.estimatedSalary !== undefined;
  if (rule.needs === "SearchAction") return [].concat(node.potentialAction ?? []).some((a) => typeNames(a).includes("SearchAction"));
  return true;
}

const directive = (content, pattern) => content.toLowerCase().split(/[,;]/).map((s) => s.trim()).some((s) => pattern.test(s));

export function checkSearchEligibility(pages) {
  return pages.map((page) => {
    const t = page.technical;
    const issues = [];
    const row = { url: page.url, path: page.path, status: t ? "checked" : "unmeasured", htmlBytes: t?.fetchBudget?.bytes ?? null,
      inlineScripts: 0, externalScripts: 0, issues };
    if (!t) return row;
    const add = (severity, code, message, remediation, evidence = {}) => issues.push({ severity, code, message, remediation, ...evidence });

    const budget = t.fetchBudget;
    if (budget && budget.bytes > budget.limit) {
      add("error", "fetch-limit-exceeded", `HTML is ${budget.bytes} bytes; Googlebot for Search indexes only the first 2MB.${budget.beyondLimit.length ? ` Lost past the cutoff: ${budget.beyondLimit.join(", ")}.` : ""}`,
        "Move canonical, robots, hreflang, JSON-LD and primary content near the top, and cut inline data, SVG or CSS so the document fits well under 2MB.", { target: budget.beyondLimit.join(", ") });
    } else if (budget && budget.bytes >= BUDGET_REVIEW) {
      add("warn", "fetch-limit-review", `HTML is ${budget.bytes} bytes, close to Googlebot's 2MB fetch limit.`,
        "Check what pushes the size up (inline data, SVG, CSS) before routine growth crosses the limit.");
    }

    if (t.robotsOutsideHead > 0) add("info", "robots-outside-head", `${t.robotsOutsideHead} robots meta tag(s) sit outside <head>. Google Search respects them there; other parsers may not.`,
      "Move robots meta tags into <head> so every crawler and tool reads the same directive.");
    for (const r of t.robots) {
      if (directive(r.content, /^(?:nosnippet|max-snippet\s*:\s*0)$/)) add("info", "snippet-restricted", `${r.agent} meta sets "${r.content}". Google uses no text snippet, and nosnippet also keeps the content out of AI Overviews and AI Mode inputs.`,
        "Confirm the owner intends this. Remove the directive, or use data-nosnippet on specific passages instead.", { target: r.agent });
    }
    if (t.dataNosnippet > 0) add("info", "data-nosnippet-review", `${t.dataNosnippet} element(s) carry data-nosnippet.`,
      "Confirm the primary answer is not inside a data-nosnippet element.");

    const seen = new Set();
    for (const block of page.jsonLd ?? []) {
      if (!block.valid) continue;
      for (const node of nodes(block.value)) for (const rule of RETIRED) {
        if (seen.has(rule.feature) || !retiredMatch(node, rule)) continue;
        seen.add(rule.feature);
        add("info", "retired-rich-result", `${rule.type} markup targets the ${rule.feature}, which Google stopped showing (${rule.ended}).`,
          "Keep the markup only if it mirrors visible content or serves a named consumer; never report it as rich-result eligible.", { target: rule.type });
      }
    }

    row.inlineScripts = t.scripts.filter((s) => !s.external).length;
    row.externalScripts = t.scripts.filter((s) => s.external).length;
    const trap = t.scripts.findIndex((s) => !s.external && s.popstate && s.historyWrite);
    if (trap >= 0) add("warn", "back-button-review", "An inline script both listens for popstate and writes browser history. This is the pattern behind back button hijacking, a Google spam policy since April 2026, and also normal single-page-app routing.",
      "Check in a browser that Back returns to the previous page. Remove any code that traps or redirects Back; review ad and third-party scripts too, which this source check cannot read.", { target: `inline script ${trap + 1}` });
    return row;
  });
}

export function renderSearchEligibility(rows = []) {
  const cell = markdownText;
  const lines = ["## 11. Search eligibility and policy signals", "",
    "HTML source only. HTTP headers (X-Robots-Tag), the Search Console Search generative AI control, external script behavior and live rendering are unmeasured. Byte size covers the supplied HTML, not headers. A back-button finding is a review prompt, not a spam verdict.", "",
    "| Page URL | HTML bytes | Inline scripts | External scripts (unmeasured) |", "|---|---:|---:|---:|"];
  for (const r of rows) lines.push(`| ${cell(r.url)} | ${r.htmlBytes ?? "unmeasured"} | ${r.inlineScripts} | ${r.externalScripts} |`);
  lines.push("", "| Page URL | Severity | Code | Target | Evidence | Next action |", "|---|---|---|---|---|---|");
  for (const r of rows) for (const i of r.issues) lines.push(`| ${cell(r.url)} | ${i.severity} | ${i.code} | ${cell(i.target)} | ${cell(i.message)} | ${cell(i.remediation)} |`);
  if (!rows.some((r) => r.issues.length)) lines.push("| – | – | – | – | No source findings in the inspected set. | – |");
  lines.push("");
  return lines.join("\n");
}
