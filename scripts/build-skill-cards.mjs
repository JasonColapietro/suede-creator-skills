#!/usr/bin/env node
// Generates one CARD.md per skill plus the SKILL-CARDS.md index, following the
// NVIDIA skill-card template (https://docs.nvidia.com/skills/skill-cards): a
// release record a reviewer can read — purpose, owner, license, use case,
// geography, dependencies, risks, references, output, version, ethics —
// without opening the skill source first.
//
// Per-skill fields derive from that skill's own SKILL.md (description, its
// boundary/safety section, bundled files, output-contract headings); pack-wide
// fields derive from VERSION, LICENSE, plugin.json, and SECURITY.md. Cards are
// deterministic: same tree in, same cards out, no timestamps.
//
// Usage:
//   node scripts/build-skill-cards.mjs          # write skills/*/CARD.md + SKILL-CARDS.md
//   node scripts/build-skill-cards.mjs --check  # exit 1 if any card would change
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = path.join(repoRoot, "skills");
const checkOnly = process.argv.includes("--check");

const version = fs.readFileSync(path.join(repoRoot, "VERSION"), "utf8").trim();
const plugin = JSON.parse(fs.readFileSync(path.join(repoRoot, ".claude-plugin", "plugin.json"), "utf8"));

const BUNDLE_DIRS = ["agents", "scripts", "references", "workflows", "assets", "templates", "fixtures", "examples", "data"];

// Sections that state what the skill must not do, in the order the pack uses
// them. Every skill has at least one; failing loudly beats an empty risk field.
const RISK_HEADINGS = [
  { pattern: /^## Boundaries\b/, label: "Boundaries" },
  { pattern: /^## Evidence boundaries/i, label: "Evidence boundaries" },
  { pattern: /^## Public Safety Rules/i, label: "Public Safety Rules" },
  { pattern: /^## Red [Ff]lags/, label: "Red flags" },
  { pattern: /^## App Store 4\.2 Gate/, label: "App Store 4.2 Gate" },
];

function countFiles(dir) {
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    // Interpreter caches are build residue, not bundled files. Counting them
    // makes the card depend on whether the Python suite has been run in this
    // checkout, so a second `npm test` fails `build:cards --check` locally
    // while CI's fresh clone disagrees.
    if (entry.name === "__pycache__") continue;
    if (entry.isDirectory()) n += countFiles(path.join(dir, entry.name));
    else n += 1;
  }
  return n;
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return null;
  const description = match[1].match(/^description:\s*(?:"([\s\S]*?)"|(.*(?:\n(?!\w+:)[ \t]+.*)*))\s*$/m);
  if (!description) return null;
  return (description[1] ?? description[2]).replace(/\s+/g, " ").trim();
}

// Extract the first risk section present: its lead-in prose (which carries the
// "must not" / "stop when" framing) and its bullets, re-joining lines that the
// 80-column body wrapping split. A prose-only section yields its paragraphs
// (up to the first subheading) as the statements instead.
function extractRiskSection(body) {
  const lines = body.split("\n");
  for (const { pattern, label } of RISK_HEADINGS) {
    const start = lines.findIndex((line) => pattern.test(line));
    if (start === -1) continue;
    const leadInLines = [];
    const bullets = [];
    let current = null;
    for (let i = start + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (/^## /.test(line)) break;
      const bullet = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
      if (bullet) {
        if (current) bullets.push(current);
        current = bullet[1].trim();
      } else if (current && line.trim() && !/^#/.test(line)) {
        current += ` ${line.trim()}`;
      } else if (current) {
        bullets.push(current);
        current = null;
      } else if (!bullets.length && line.trim() && !/^#/.test(line)) {
        leadInLines.push(line.trim());
      }
    }
    if (current) bullets.push(current);
    const leadIn = leadInLines.join(" ").trim();
    if (bullets.length) return { label, leadIn, bullets };
    // Prose section (no bullets): use its paragraphs up to the first
    // subheading, one paragraph per risk statement.
    const paragraphs = [];
    let paragraph = [];
    for (let i = start + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (/^#/.test(line)) break;
      if (line.trim()) paragraph.push(line.trim());
      else if (paragraph.length) {
        paragraphs.push(paragraph.join(" "));
        paragraph = [];
      }
    }
    if (paragraph.length) paragraphs.push(paragraph.join(" "));
    if (paragraphs.length) return { label, leadIn: "", bullets: paragraphs };
  }
  return null;
}

function extractOutputHeadings(body) {
  const headings = [];
  for (const line of body.split("\n")) {
    const match = line.match(/^#{2,3}\s+(.*Output.*)$/);
    if (match) headings.push(match[1].trim());
  }
  return [...new Set(headings)];
}

function firstSentence(text) {
  const match = text.match(/^[\s\S]*?\.(?=\s|$)/);
  return match ? match[0].trim() : text.trim();
}

function useWhen(description) {
  const match = description.match(/Use (?:when|for|this skill when|it when)[\s\S]*?(?=\s*NOT FOR\b|$)/);
  return match ? match[0].trim().replace(/[.;]$/, "") : null;
}

function notFor(description) {
  const match = description.match(/NOT FOR:?\s*([\s\S]*)$/);
  return match ? match[1].trim() : null;
}

function buildCard(name) {
  const dir = path.join(skillsDir, name);
  const source = fs.readFileSync(path.join(dir, "SKILL.md"), "utf8");
  const description = parseFrontmatter(source);
  if (!description) throw new Error(`${name}: could not parse frontmatter description`);
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, "");
  const title = body.match(/^# (.+)$/m)?.[1]?.trim() ?? name;

  const risks = extractRiskSection(body);
  if (!risks) throw new Error(`${name}: no Boundaries/Evidence boundaries/Public Safety Rules/Red flags section found`);
  const outputs = extractOutputHeadings(body);

  const bundles = BUNDLE_DIRS.filter((sub) => fs.existsSync(path.join(dir, sub))).map(
    (sub) => `\`${sub}/\` (${countFiles(path.join(dir, sub))} file${countFiles(path.join(dir, sub)) === 1 ? "" : "s"})`,
  );
  const bundledLicenses = fs.readdirSync(dir).filter((f) => /^LICENSE/i.test(f)).sort();

  const sitePage = path.join(repoRoot, "docs", "skills", `${name}.html`);
  if (!fs.existsSync(sitePage)) throw new Error(`${name}: expected docs/skills/${name}.html to exist`);

  const when = useWhen(description);
  const scope = notFor(description);

  const lines = [];
  lines.push(`# Skill Card — ${title}`);
  lines.push("");
  lines.push("<!-- Generated by scripts/build-skill-cards.mjs — do not hand-edit. -->");
  lines.push("<!-- Regenerate with: npm run build:cards -->");
  lines.push("");
  lines.push(
    `Release record for the \`${name}\` skill, following the NVIDIA skill-card template (<https://docs.nvidia.com/skills/skill-cards>). It tells a reviewer what the skill does, who owns it, what it needs, what could go wrong, and what evidence backs the release — without requiring them to open the source first.`,
  );
  lines.push("");
  lines.push("## Description");
  lines.push("");
  lines.push(firstSentence(description));
  lines.push("");
  lines.push(
    `Status: production. Ships in the \`suede-skills\` plugin (the full pack) at release ${version}; loads as a Claude Code / Codex agent skill from this directory's [SKILL.md](./SKILL.md).`,
  );
  lines.push("");
  lines.push("## Owner");
  lines.push("");
  lines.push(`${plugin.author.name}, Suede Labs AI (<${plugin.author.url}>). Security contact: \`info@suedeai.ai\` per [SECURITY.md](../../SECURITY.md).`);
  lines.push("");
  lines.push("## License / Terms of Use");
  lines.push("");
  if (bundledLicenses.length) {
    lines.push(
      `Pack license: MIT ([LICENSE](../../LICENSE)). This skill additionally bundles third-party licensed material — see ${bundledLicenses
        .map((f) => `[\`${f}\`](./${f})`)
        .join(", ")} in this directory. The pack's combined license expression is \`${plugin.license}\`.`,
    );
  } else {
    lines.push(`MIT ([LICENSE](../../LICENSE)). The pack's combined license expression is \`${plugin.license}\`; this skill bundles no third-party licensed material of its own.`);
  }
  lines.push("");
  lines.push("## Use Case");
  lines.push("");
  lines.push("Target users: developers and creators running the skill inside a Claude Code or Codex CLI session.");
  if (when) {
    lines.push("");
    lines.push(`${when}.`);
  }
  if (scope) {
    lines.push("");
    lines.push(`Out of scope — ${scope}`);
  }
  lines.push("");
  lines.push("## Deployment Geography");
  lines.push("");
  lines.push("Global. The skill is a prompt-and-script package that runs locally inside the invoking agent session; it pins no region-specific service of its own.");
  lines.push("");
  lines.push("## Requirements / Dependencies");
  lines.push("");
  lines.push("- A Claude Code or Codex CLI session with the `suede-skills` plugin installed (install options: <https://skills.suedeai.ai/>).");
  if (bundles.length) {
    lines.push(`- Bundled files loaded relative to this directory: ${bundles.join(", ")}.`);
  } else {
    lines.push("- No bundled files beyond SKILL.md; the skill is a single-file instruction set.");
  }
  lines.push(
    "- Credentials: none are bundled or required by the skill files. Any tool or API credentials come from the host session; never paste credentials into skill files, prompts, or outputs.",
  );
  lines.push("");
  lines.push("## Known Risks and Mitigations");
  lines.push("");
  lines.push(
    "- Risk: an agent treats a quality gate as autonomous authority. Mitigation: every gate in the pack is advisory — it changes what is reported, never what the user decided; only extreme-risk findings (data loss, credential exposure, legal/rights violations, payment mistakes, irreversible public damage) pause for the user's explicit choice.",
  );
  lines.push(
    `- Risk: a skill instruction is used to act outside its mandate. Mitigation: the hard limits in the skill body's "${risks.label}" section, quoted below.`,
  );
  lines.push("");
  lines.push(risks.leadIn ? `From "${risks.label}" — ${risks.leadIn}` : `From "${risks.label}":`);
  lines.push("");
  for (const bullet of risks.bullets) {
    lines.push(`- ${bullet}`);
  }
  lines.push("");
  lines.push("## References");
  lines.push("");
  lines.push(`- Skill source: [\`skills/${name}/SKILL.md\`](./SKILL.md)`);
  lines.push(`- Rendered reference page: <https://skills.suedeai.ai/skills/${name}.html>`);
  lines.push(
    "- Security policy and reviewed scanner exceptions: [SECURITY.md](../../SECURITY.md) and [`.plugin-scanner.toml`](../../.plugin-scanner.toml) at the repo root",
  );
  lines.push("");
  lines.push("## Skill Output");
  lines.push("");
  const outputCaveat =
    "The skill publishes, posts, and sends nothing without the user's explicit authorization; delivery decisions stay with the user.";
  if (outputs.length) {
    lines.push(
      `Structured Markdown returned in the agent's response, shaped by the output contract${outputs.length === 1 ? "" : "s"} defined in the skill body: ${outputs
        .map((h) => `"${h}"`)
        .join(", ")}. ${outputCaveat}`,
    );
  } else {
    lines.push(`Markdown analysis and recommendations returned in the agent's response. ${outputCaveat}`);
  }
  lines.push("");
  lines.push("## Skill Version");
  lines.push("");
  lines.push(
    `${version} — the pack is single-versioned, so every skill releases together; see [VERSION](../../VERSION) and [CITATION.cff](../../CITATION.cff) for the release identifier this card describes.`,
  );
  lines.push("");
  lines.push("## Ethical Considerations");
  lines.push("");
  lines.push("- The skill produces recommendations for a human decision-maker. Publishing, sending, payment, and rights decisions stay with the user.");
  lines.push("- Its gates require verifiable claims and honest reporting; do not use the skill to fabricate claims, evidence, metrics, or attribution.");
  lines.push("- Report suspected misuse or a security concern privately per [SECURITY.md](../../SECURITY.md); do not open a public issue for it.");
  lines.push("");
  return lines.join("\n");
}

const names = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(skillsDir, entry.name, "SKILL.md")))
  .map((entry) => entry.name)
  .sort();

const files = new Map();
for (const name of names) {
  files.set(path.join(skillsDir, name, "CARD.md"), buildCard(name));
}

const index = [];
index.push("# Skill Cards");
index.push("");
index.push("<!-- Generated by scripts/build-skill-cards.mjs — do not hand-edit. -->");
index.push("<!-- Regenerate with: npm run build:cards -->");
index.push("");
index.push(
  `One release record per skill, following the NVIDIA skill-card template (<https://docs.nvidia.com/skills/skill-cards>): description, owner, license, use case, deployment geography, requirements, known risks and mitigations, references, output, version, and ethical considerations. ${names.length} skills, ${names.length} cards, all stamped for release ${version}. Each card derives from its skill's own SKILL.md plus pack-wide release facts, and \`npm run build:cards\` regenerates the set; \`npm test\` fails when any card is stale.`,
);
index.push("");
index.push("| Skill | Card |");
index.push("| --- | --- |");
for (const name of names) {
  index.push(`| \`${name}\` | [skills/${name}/CARD.md](skills/${name}/CARD.md) |`);
}
index.push("");
files.set(path.join(repoRoot, "SKILL-CARDS.md"), index.join("\n"));

let stale = 0;
for (const [file, content] of files) {
  const rel = path.relative(repoRoot, file);
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (existing === content) continue;
  if (checkOnly) {
    console.error(`stale: ${rel}`);
    stale += 1;
  } else {
    fs.writeFileSync(file, content);
    console.log(`wrote: ${rel}`);
  }
}

if (checkOnly) {
  if (stale) {
    console.error(`${stale} skill-card file(s) stale — run: npm run build:cards`);
    process.exit(1);
  }
  console.log(`skill cards current — ${names.length} cards + index`);
} else {
  console.log(`skill cards built — ${names.length} cards + index at release ${version}`);
}
