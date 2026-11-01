#!/usr/bin/env node
// Tuning aid for directory/topics.json: prints how many listed skills each
// topic matches and whether it would publish. Give a topic id to list its
// matches with the reason, or --unmatched to list skills no topic claims.
//
//   node scripts/directory/topics-count.mjs [topics.json] [topic-id|--unmatched|--json]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadTopicConfig, planTopics, topicsBySkill, TOPIC_GATE } from "./topics.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const file = args.find((a) => a.endsWith(".json")) || path.join(repoRoot, "directory", "topics.json");
const pick = args.find((a) => !a.endsWith(".json"));
const data = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "skills.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(repoRoot, "directory", "categories.json"), "utf8"));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "skill";
const skills = data.skills.map((c) => {
  const [owner, name] = c.repo.split("/");
  const repoSlug = `${slugify(owner)}/${slugify(name)}`;
  return { ...c, id: `${repoSlug}/${c.slug}`, owner, repo_slug: repoSlug, featured: Boolean(c.featured), lists: data.repos[c.repo].lists };
});
const cfg = loadTopicConfig(file, new Set(categories.map((c) => c.slug)));
const plan = planTopics(cfg, skills);
if (pick === "--json") {
  console.log(JSON.stringify(plan.topics.map((t) => ({ id: t.topic.id, name: t.topic.name, group: t.topic.group, listed: t.rows.length, full_pages: t.rows.filter((s) => s.featured).length, published: t.published })), null, 1));
} else if (pick === "--unmatched") {
  const by = topicsBySkill(plan);
  const un = skills.filter((s) => !by.has(s.id));
  console.log(`${un.length} of ${skills.length} skills match no published topic`);
  for (const s of un) console.log(`${s.category}\t${s.repo}/${s.slug}\t${(s.summary || s.description).slice(0, 110)}`);
} else if (pick) {
  const t = plan.topics.find((x) => x.topic.id === pick);
  if (!t) throw new Error(`no topic ${pick}`);
  console.log(`${t.topic.name}: ${t.rows.length} listed (${t.rows.filter((s) => s.featured).length} full pages), ${t.published ? "publishes" : `needs ${TOPIC_GATE.minListed}`}`);
  for (const s of t.rows) console.log(`${t.reasons.get(s.id)}\t${s.category}\t${s.repo}/${s.slug}\t${(s.summary || s.description).slice(0, 100)}`);
} else {
  for (const g of plan.groups) {
    console.log(`\n## ${g.group.name}`);
    for (const t of g.topics) console.log(`${String(t.rows.length).padStart(5)}  ${t.published ? "+" : "-"}  ${t.topic.id}  (${t.rows.filter((s) => s.featured).length} full pages)`);
  }
  const by = topicsBySkill(plan);
  console.log(`\n${plan.topics.filter((t) => t.published).length} of ${plan.topics.length} topics publish; ${by.size} of ${skills.length} skills belong to at least one published topic.`);
}
