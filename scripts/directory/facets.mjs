// Browse facets for the Agent Skills Directory: the cost-and-license lanes
// (what a tool directory calls pricing) and the capability flags (what a tool
// directory calls features), each derived only from published fields of
// directory/skills.json so a reader can recompute them. Pure functions over the
// expanded skill records scripts/build-directory.mjs builds.
//
// Lanes partition every listed skill by what it costs to use: the license it
// ships under, and whether its files name a paid or account-based service.
// Flags are independent yes/no facts; a skill carries any number of them. Flags
// marked scope "install" come from the install record the refresh writes for
// skills with full pages (the only skills whose files the directory reads in
// full), so their pages count those skills only and say so.

export const LANES = [
  {
    id: "free-open-source",
    label: "Free and open source",
    short: "free and open-source",
    title: "Free Open-Source Skills for Claude Code and Codex",
    lede: "Skills under an open-source or open-content license whose files name no paid service, API key or hosted account. Install them and run them as they are.",
    noun: "free open-source",
  },
  {
    id: "free-with-service",
    label: "Free skill, needs a service",
    short: "free, needs a service",
    title: "Open-Source Skills That Need an API Key or Account",
    lede: "Skills under an open license whose files read an API key, call an outside host or connect to an MCP server. The skill is free; the service it talks to may not be.",
    noun: "service-backed",
  },
  {
    id: "noncommercial",
    label: "Non-commercial license",
    short: "non-commercial",
    title: "Non-Commercial License Skills for Claude Code and Codex",
    lede: "Skills published under a license that allows personal, research or other non-commercial use only. Check the license before using one in paid work.",
    noun: "non-commercial",
  },
  {
    id: "restricted",
    label: "Restricted license",
    short: "restricted-license",
    title: "Restricted-License Skills for Claude Code and Codex",
    lede: "Skills whose repository reserves rights, uses a proprietary license or states terms only in a LICENSE file the directory could not classify. Read the terms at the source before installing.",
    noun: "restricted-license",
  },
];
export const laneById = new Map(LANES.map((l) => [l.id, l]));

const NONCOMMERCIAL_RE = /\bNC\b|noncommercial|non-commercial/i;
const SERVICE_RE = /\b(api key|api token|access token|requires? (?:a |an |the )?(?:[\w.-]+ )?(?:mcp server|account|subscription|api)|paid|premium|credentials?|oauth|sign ?up|mcp server)\b/i;

// Whether the skill's files name a service to sign up for: the install record
// for full pages, else the compatibility line the author wrote.
export function needsService(s) {
  const i = s.install;
  if (i) return Boolean(i.mcp || (i.mcp_tools || []).length || (i.env_docs || []).length || (i.env_read || []).length || (i.hosts || []).length || i.net);
  return SERVICE_RE.test(String(s.compatibility || ""));
}

export function costLane(s) {
  if (NONCOMMERCIAL_RE.test(String(s.license || ""))) return "noncommercial";
  if (!s.open_license) return "restricted";
  return needsService(s) ? "free-with-service" : "free-open-source";
}

const hasInstall = (s) => Boolean(s.install);
const mcp = (s) => Boolean(s.install && (s.install.mcp || (s.install.mcp_tools || []).length));
const env = (s) => Boolean(s.install && ((s.install.env_docs || []).length || (s.install.env_read || []).length));
const net = (s) => Boolean(s.install && (s.install.net || (s.install.hosts || []).length));
const runs = (s) => Boolean(s.install && (s.install.runs || []).length);

export const FLAGS = [
  { id: "official", label: "Official publisher", scope: "all", test: (s) => Boolean(s.official), lede: "Skills published by the company behind the product, framework or service they work with." },
  { id: "full-page", label: "Full directory page", scope: "all", test: (s) => Boolean(s.featured), lede: "Skills with a full page: an editorial summary, the files and commands found in the skill folder, install routes and a downloadable report." },
  { id: "badge-eligible", label: "Quality badge", scope: "all", test: (s) => Boolean(s.shielded), lede: "Skills scoring 80 to 99 on the Suede Skill Check, which offer numeric and letter README badges." },
  { id: "scripts", label: "Bundles scripts", scope: "all", test: (s) => Boolean(s.has_scripts), lede: "Skills that ship a scripts/ folder, so the agent runs code the author wrote instead of improvising it." },
  { id: "references", label: "Bundles reference files", scope: "all", test: (s) => Boolean(s.has_references), lede: "Skills that ship a references/, reference/ or docs/ folder the agent reads on demand." },
  { id: "assets", label: "Bundles assets or templates", scope: "all", test: (s) => Boolean(s.has_assets), lede: "Skills that ship templates, assets or other files the agent copies into its work." },
  { id: "markdown-only", label: "SKILL.md only", scope: "all", test: (s) => s.file_count === 1, lede: "Skills that are one SKILL.md file: nothing to run, nothing to configure, easy to read before you install." },
  { id: "allowed-tools", label: "Declares tool permissions", scope: "all", test: (s) => Boolean(s.allowed_tools), lede: "Skills whose frontmatter declares allowed-tools, so you can see which tools the agent may call before installing." },
  { id: "compatibility", label: "Declares compatibility", scope: "all", test: (s) => Boolean(s.compatibility), lede: "Skills whose frontmatter states the agents, versions or services they were written for." },
  { id: "mcp", label: "Uses an MCP server", scope: "install", test: mcp, lede: "Skills whose files connect to a Model Context Protocol server or name MCP tools." },
  { id: "api-key", label: "Needs an API key or account", scope: "install", test: env, lede: "Skills whose files read an API key or other credential from the environment." },
  { id: "network", label: "Calls outside services", scope: "install", test: net, lede: "Skills whose scripts or instructions call hosts outside your machine." },
  { id: "runs-commands", label: "Runs commands", scope: "install", test: runs, lede: "Skills whose files run package managers, CLIs or other commands." },
  { id: "no-setup", label: "No setup required", scope: "install", test: (s) => hasInstall(s) && !mcp(s) && !env(s) && !net(s) && !runs(s), lede: "Skills whose files read no credential, call no outside host, connect to no MCP server and run no command: install and go." },
];
export const flagById = new Map(FLAGS.map((f) => [f.id, f]));

export const skillFlags = (s) => FLAGS.filter((f) => f.test(s)).map((f) => f.id);

// Every lane and flag with its skills, in listing order (full pages first,
// then by name), for the browse pages and the search index.
const byListing = (a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name) || a.repo.localeCompare(b.repo);
export function planFacets(skills) {
  const lanes = LANES.map((lane) => ({ lane, rows: skills.filter((s) => costLane(s) === lane.id).sort(byListing) }));
  const flags = FLAGS.map((flag) => ({ flag, rows: skills.filter((s) => flag.test(s)).sort(byListing), universe: flag.scope === "install" ? skills.filter(hasInstall).length : skills.length }));
  return { lanes, flags };
}
