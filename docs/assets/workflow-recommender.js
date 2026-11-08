/**
 * Task-based, local matching against the supplied directory snapshot.
 * No model call, network request, storage, installation or execution happens here.
 * Role choices are editorial suggestions, not checks of a project's constraints.
 */
const MAX_PROMPT_LENGTH = 2000;

export const WORKFLOW_EXAMPLES = [
  { label: 'Launch a SaaS landing page', prompt: 'Launch a SaaS landing page that explains my product and collects early signups.' },
  { label: 'Get found in AI search', prompt: 'Get my business found in AI search with useful content and measurable SEO improvements.' },
  { label: 'Create a social campaign', prompt: 'Turn one idea into a social campaign with a clear angle and posts in my voice.' },
];

const choice = (id, terms = [], requiredTerms = []) => ({ id, terms, requiredTerms });
const phase = (title, choices, why, output, required = false) => ({ title, choices, why, output, required });
const signal = (weight, ...terms) => ({ weight, terms });

// Exact IDs, capabilities and phase order are grounded in search-index.json and
// directory/editorial/stacks. Scores never substitute for task suitability.
const FLOWS = [
  {
    id: 'landing-page', title: 'From offer to launch-ready landing page',
    signals: [signal(18, 'landing page', 'landing pages'), signal(13, 'launch page', 'waitlist page', 'signup page', 'product page', 'marketing website'), signal(8, 'homepage')],
    summary: 'Task-based match: clarify the offer, build the page, check the experience, and measure signups.',
    phases: [
      phase('Write the offer and call to action', [choice('coreyhaines31/marketingskills/copywriting'), choice('mblode/agent-skills/ghostwriter')],
        'Clear page copy gives the design one audience, one promise and one next step.', 'A headline, supporting proof, section outline and primary call to action.'),
      phase('Build the landing page experience', [choice('agiwhitelist/auteur/auteur'), choice('anthropics/skills/frontend-design'), choice('mblode/agent-skills/ui-design')],
        'Turn the copy into a coherent web interface before adding more sections.', 'A working page with a consistent layout, typography and signup path.', true),
      phase('Polish hierarchy and accessibility', [choice('pbakaus/impeccable/impeccable')],
        'Review responsive layouts, readable type, interaction states and UX copy together.', 'A prioritized interface fix list and a cleaner mobile layout.'),
      phase('Test the visitor journey', [choice('anthropics/skills/webapp-testing'), choice('lackeyjb/playwright-skill/playwright-skill')],
        'Browser checks catch broken forms and interactions before launch traffic arrives.', 'Repeatable checks for the main call to action, form and confirmation state.'),
      phase('Measure the conversion path', [choice('coreyhaines31/marketingskills/analytics')],
        'A defined conversion event makes it possible to evaluate the page after launch.', 'An event plan for visits, signup attempts and completed conversions.'),
    ],
    tips: [
      'Write one sentence naming the audience, offer and primary call to action before building.',
      'Test the signup path on a phone and with the keyboard, including validation and success states.',
      'Verify the conversion event before launch; collect a baseline before changing the headline.',
    ],
  },
  {
    id: 'web-app', title: 'From product idea to tested web app',
    signals: [signal(15, 'web app', 'web application', 'saas app', 'dashboard app'), signal(8, 'saas', 'website', 'next js', 'nextjs'), signal(4, 'frontend', 'dashboard')],
    summary: 'Task-based match: scope the core flow, build its web interface, test it, and review security before release.',
    phases: [
      phase('Scope the smallest useful release', [choice('obra/superpowers/writing-plans')],
        'A concrete implementation plan keeps the first version focused on one useful user journey.', 'An ordered build plan with acceptance checks for the core user flow.'),
      phase('Build the core web interface', [choice('agiwhitelist/auteur/auteur'), choice('jeffallan/claude-skills/nextjs-developer', ['next js', 'nextjs'], ['next js', 'nextjs']), choice('anthropics/skills/frontend-design')],
        'Use a web-building skill to turn the core flow into working screens.', 'The primary screens and their navigation, loading, empty and error states.', true),
      phase('Refine the interaction design', [choice('pbakaus/impeccable/impeccable'), choice('mblode/agent-skills/ui-design')],
        'Check hierarchy, responsive behavior and UX copy before expanding the feature set.', 'A focused list of accessibility, layout and interaction improvements.'),
      phase('Exercise the main user journey', [choice('anthropics/skills/webapp-testing'), choice('lackeyjb/playwright-skill/playwright-skill')],
        'Test actual browser behavior instead of assuming that a successful build proves the app works.', 'Browser checks for the main journey plus failure and empty states.'),
      phase('Review security before release', [choice('getsentry/skills/security-review')],
        'Review authentication, authorization and input handling before connecting real user data.', 'Prioritized code findings with evidence and specific fixes to verify.'),
    ],
    tips: [
      'Choose one end-to-end user journey and write its success condition before adding features.',
      'Use sample data first; define API permissions and server-side access checks before connecting real accounts.',
      'Run the core journey on desktop and mobile, including slow loading and failed requests.',
    ],
  },
  {
    id: 'seo-and-ai-search', title: 'From search audit to measurable visibility',
    signals: [signal(18, 'ai search', 'ai answers', 'cited by ai', 'search visibility'), signal(12, 'seo', 'search rankings', 'search engine optimization', 'rank in google', 'rank on google'), signal(8, 'aeo', 'geo optimization', 'indexing')],
    summary: 'Task-based match: audit search access, plan useful content, improve answer readiness, and track results.',
    phases: [
      phase('Audit search access and demand', [choice('mblode/agent-skills/seo'), choice('agricidaniel/claude-seo/seo')],
        'Start with crawlability, technical issues and the questions your audience actually searches for.', 'A prioritized SEO fix list and a search-demand brief.', true),
      phase('Plan the content that answers demand', [choice('coreyhaines31/marketingskills/content-strategy')],
        'Use the audit to choose topics and page purposes instead of producing disconnected articles.', 'A focused content plan mapping audience questions to pages.'),
      phase('Make answers clear and supportable', [choice('coreyhaines31/marketingskills/ai-seo')],
        'Structure useful, attributable content for AI-generated answers as well as human readers.', 'An answer-first revision plan with sources, clear entities and useful page structure.'),
      phase('Track search and conversion outcomes', [choice('coreyhaines31/marketingskills/analytics')],
        'Measure qualified visits and conversions so visibility work has a business outcome.', 'A baseline report and a repeatable check of channels, landing pages and conversions.'),
    ],
    tips: [
      'Check that important pages are crawlable, indexable and linked before writing more content.',
      'Answer a real buyer question on each page and cite the evidence behind factual claims.',
      'Record a baseline for search traffic, citations and conversions, then compare the same measures over time.',
    ],
  },
  {
    id: 'content-and-social', title: 'From one idea to a focused social campaign',
    signals: [signal(16, 'social campaign', 'social media campaign', 'content campaign'), signal(12, 'social posts', 'social media', 'content strategy', 'content marketing', 'marketing campaign'), signal(8, 'linkedin posts', 'blog posts', 'newsletter', 'write posts', 'write content')],
    summary: 'Task-based match: choose an audience and angle, draft in your voice, edit, and measure the response.',
    phases: [
      phase('Choose the campaign angle and topics', [choice('coreyhaines31/marketingskills/content-strategy')],
        'A clear audience and topic plan give each post a job in the campaign.', 'A campaign brief with an audience, core idea and a short sequence of posts.', true),
      phase('Draft the posts in a consistent voice', [choice('mblode/agent-skills/ghostwriter')],
        'Turn the brief into channel-sized drafts using examples of your own writing.', 'A first set of posts with distinct hooks and one clear next action each.'),
      phase('Edit for clarity and specificity', [choice('danjdewhurst/story-skills/line-editing')],
        'Tighten sentences and check grammar without losing the intended voice.', 'Polished drafts with repetitive phrasing, vague claims and clutter removed.'),
      phase('Define how the campaign will be measured', [choice('coreyhaines31/marketingskills/analytics')],
        'Decide how links and conversions will be tracked before distributing the posts.', 'A simple campaign measurement plan with tagged links and one outcome metric.'),
    ],
    tips: [
      'Bring two or three examples of your writing and the audience question the campaign should answer.',
      'Adapt the hook and format for each channel; verify every claim and permission before publishing.',
      'Use one primary outcome metric and tagged links so the next campaign learns from real responses.',
    ],
  },
  {
    id: 'agent-building', title: 'From agent brief to tested tool workflow',
    signals: [signal(17, 'ai agent', 'ai agents', 'mcp server', 'mcp tools', 'multi agent', 'agentic workflow'), signal(12, 'chatbot', 'mcp', 'build an agent', 'build agents', 'llm agent'), signal(8, 'agent workflow', 'agent tools')],
    summary: 'Task-based match: define prompts and checks, design tools, build integrations, and verify the workflow.',
    phases: [
      phase('Define behavior and evaluation cases', [choice('getsentry/skills/prompt-optimizer')],
        'Write down the agent behavior and examples of success and failure before connecting tools.', 'A prompt specification and representative evaluation cases.'),
      phase('Design the tool interfaces', [choice('muratcankoylan/agent-skills-for-context-engineering/tool-design')],
        'Clear schemas, responses and error messages make external tools easier to use correctly.', 'Tool descriptions, input schemas, response shapes and recovery rules.'),
      phase('Build the service integration layer', [choice('anthropics/skills/mcp-builder')],
        'Implement the MCP tools that expose the services needed by the workflow.', 'A small MCP server with the minimum tools required for the first use case.', true),
      phase('Budget context for repeatable runs', [choice('muratcankoylan/agent-skills-for-context-engineering/context-optimization')],
        'Bound tool outputs and retained context so long runs do not become unmanageable.', 'A context budget and rules for trimming or partitioning tool observations.'),
      phase('Run checks before claiming completion', [choice('obra/superpowers/verification-before-completion')],
        'Verify actual command results and evaluation outcomes before shipping the integration.', 'Recorded check results for happy paths, tool failures and permission boundaries.'),
    ],
    tips: [
      'Start with one read-only tool and a small set of representative tasks before expanding access.',
      'Require explicit approval for consequential actions and keep secrets out of prompts and logs.',
      'Test tool errors, missing permissions and misleading inputs; record cost and latency alongside task success.',
    ],
  },
  {
    id: 'documents-and-data', title: 'From raw data to a decision-ready report',
    signals: [signal(16, 'analyze data', 'analyse data', 'sales data', 'data analysis', 'analyze a csv', 'analyse a csv'), signal(12, 'csv', 'spreadsheet', 'dataset', 'data report', 'sql server', 'mssql'), signal(7, 'excel', 'data visualization')],
    summary: 'Task-based match: prepare the data, analyze the business question, and turn the evidence into a report.',
    phases: [
      phase('Prepare and inspect the source data', [choice('anthropics/skills/xlsx'), choice('sanjay3290/ai-skills/mssql', ['sql server', 'mssql'], ['sql server', 'mssql'])],
        'Inspect the source, missing values and field definitions before drawing conclusions.', 'An inspected data extract or workbook with clear fields and data-quality notes.'),
      phase('Analyze the question and check assumptions', [choice('tronghieu/agent-skills/data-scientist')],
        'Connect the analysis to the decision, using data profiling and appropriate validation.', 'A reproducible analysis with charts, assumptions and a supported conclusion.', true),
      phase('Write the decision-ready report', [choice('anthropics/skills/docx')],
        'Package the evidence and proposed next step in a structured document people can review.', 'A report with the question, method, key results, caveats and next action.'),
    ],
    tips: [
      'Define the decision, date range, units and metric denominator before calculating results.',
      'Use a copy or read-only extract; inspect missing values and duplicate rows before comparing groups.',
      'Separate observations from causal claims and include a small reproducible calculation in the report.',
    ],
  },
  {
    id: 'research', title: 'From research question to sourced findings',
    signals: [signal(16, 'market research', 'company research', 'literature review', 'research competitors', 'research papers'), signal(12, 'compare companies', 'research a market', 'research a company', 'scientific research', 'academic research'), signal(8, 'competitors', 'research report', 'research paper')],
    summary: 'Task-based match: gather relevant sources, read the evidence, and assemble a traceable research report.',
    phases: [
      phase('Find sources for the research question', [choice('k-dense-ai/claude-scientific-skills/literature-review'), choice('browserbase/skills/company-research', ['company', 'companies', 'competitors', 'market', 'business'], ['company', 'companies', 'competitors', 'market', 'business'])],
        'Use a focused source-gathering workflow for the research domain and comparison criteria.', 'A source list with the research scope, inclusion criteria and initial findings.', true),
      phase('Read and extract supporting evidence', [choice('tronghieu/agent-skills/deep-reader')],
        'Page-anchored notes preserve the connection between a source and what it actually says.', 'Evidence notes with source locations, key claims and unanswered questions.'),
      phase('Assemble the sourced research report', [choice('anthropics/skills/docx')],
        'Organize evidence into a reviewable report rather than a pile of unconnected summaries.', 'A structured comparison with source references, uncertainties and next questions.'),
    ],
    tips: [
      'Write the research question, time window and comparison criteria before gathering sources.',
      'Keep a source link or page reference beside every important claim and check publication dates.',
      'Separate source statements from your conclusions and flag gaps that could change the decision.',
    ],
  },
  {
    id: 'video-and-creative', title: 'From creative concept to reviewed video',
    signals: [signal(18, 'explainer video', 'product video', 'video production', 'video campaign'), signal(14, 'create a video', 'create video', 'make a video', 'produce a video', 'edit a video', 'video editing'), signal(10, 'video', 'short film', 'shorts', 'storyboard')],
    summary: 'Task-based match: choose the concept, produce the scenes, edit the sequence, and review the finished video.',
    phases: [
      phase('Choose the creative concept', [choice('smixs/creative-director-skill/creative-director')],
        'Choose an idea that serves the audience and message before spending time producing assets.', 'A concept brief with the key message, hook and visual direction.'),
      phase('Plan and produce the video scenes', [choice('coreyhaines31/marketingskills/video')],
        'Translate the concept into a production workflow using appropriate video tools.', 'A script, scene plan and first video draft with the intended delivery format.', true),
      phase('Edit timing and captions', [choice('renezander030/capcut-cli/capcut-edit')],
        'Use the editing pass to refine timing, subtitles, audio and the final sequence in CapCut.', 'An edited CapCut project with checked timing, audio levels and captions.'),
      phase('Review the finished picture and audio', [choice('huangchihhungleo/claude-real-video/claude-real-video-for-agents')],
        'Inspect scene-aware keyframes and the transcript to catch mismatches in the finished video.', 'A review of scenes and spoken content with a concrete correction list.'),
    ],
    tips: [
      'Set the audience, target duration and aspect ratio before producing any assets.',
      'Confirm rights and consent for footage, music and voices, and check tool setup and service costs first.',
      'Review the exported video with and without sound; check caption accuracy, safe areas and the final call to action.',
    ],
  },
];

function normalize(value) {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[.!?;](?=\s|$)/g, ' | ').replace(/\bbut\b/g, ' | ')
    .replace(/[^\p{L}\p{N}|]+/gu, ' ').replace(/\s+/g, ' ').replace(/^[ |]+|[ |]+$/g, '');
}

function containsTerm(text, term) {
  const haystack = ` ${text} `;
  const needle = ` ${term} `;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    // Reject nearby explicit negation; this is a bounded lexical rule, not a
    // claim to understand every constraint or the meaning of the entire brief.
    const prefix = haystack.slice(Math.max(haystack.lastIndexOf('|', index) + 1, index - 100), index);
    if (!/(?:^| )(?:no|not|without|avoid|instead of|don t)(?: [\p{L}\p{N}]+){0,6}$/u.test(prefix)) return true;
    index = haystack.indexOf(needle, index + 1);
  }
  return false;
}

function safeCatalogEntry(entry) {
  if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || typeof entry.name !== 'string' || typeof entry.repo !== 'string') return false;
  // Allow only the catalog's exact owner/repository/skill paths. URL parsing
  // alone would normalize traversal, encoded separators and hostile origins.
  const parts = entry.id.split('/');
  if (parts.length !== 3 || !parts.every(part => /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(part))) return false;
  const repoPath = parts.slice(0, 2).join('/');
  if (entry.repo.toLowerCase() !== repoPath.toLowerCase() || entry.name !== parts[2]) return false;
  const prefixes = ['/directory/', '/'];
  const safeHref = prefixes.some(prefix => entry.href === `${prefix}${entry.id}/` || entry.href === `${prefix}${repoPath}/#${entry.name}`);
  const safeReport = entry.report == null || prefixes.some(prefix => entry.report === `${prefix}${entry.id}/report.json`);
  return safeHref && safeReport;
}

function state(status, title, summary) {
  return { status, title, summary, steps: [], tips: [], matchedTerms: [] };
}

const REQUIRED_PLATFORMS = {
  'anthropics/skills/mcp-builder': ['mcp', 'mcp server', 'mcp servers'],
  'renezander030/capcut-cli/capcut-edit': ['capcut', 'jianying'],
  'jeffallan/claude-skills/nextjs-developer': ['next js', 'nextjs'],
};

function chooseSkill(choices, catalog, used, text) {
  const ranked = choices.flatMap((candidate, index) => {
    const skill = catalog.get(candidate.id);
    if (!skill || used.has(skill.id)) return [];
    const requiredPlatforms = REQUIRED_PLATFORMS[skill.id] || [];
    if (requiredPlatforms.some(term => ` ${text} `.includes(` ${term} `) && !containsTerm(text, term))) return [];
    if (candidate.requiredTerms.length && !candidate.requiredTerms.some(term => containsTerm(text, term))) return [];
    const relevance = (index === 0 ? 2 : 0) + candidate.terms.filter(term => containsTerm(text, term)).length * 10;
    return [{ skill, relevance }];
  });
  ranked.sort((a, b) => b.relevance - a.relevance
    || (Number.isFinite(b.skill.score) ? b.skill.score : 0) - (Number.isFinite(a.skill.score) ? a.skill.score : 0)
    || a.skill.id.localeCompare(b.skill.id));
  return ranked[0]?.skill;
}

function rankFlows(text) {
  // A site's subject is not its deliverable: "build a social media website"
  // asks for a site, not a set of social posts. Keep coordinated goals subject
  // to the existing ambiguity check rather than letting this bonus decide.
  const websiteBuild = [...text.matchAll(/\b(?:build|create|launch|ship|develop|make) (?:[\p{L}\p{N}]+ ){0,6}website\b/gu)]
    .some(match => containsTerm(text, match[0]));
  const separateGoals = /\b(?:and|or) (?:build|create|launch|ship|develop|make)\b/u.test(text);
  return FLOWS.map((flow, index) => {
    const matchedTerms = [];
    let score = 0;
    for (const group of flow.signals) {
      const matches = group.terms.filter(term => containsTerm(text, term));
      if (matches.length) {
        score += group.weight;
        matchedTerms.push(...matches);
      }
    }
    if (flow.id === 'web-app' && websiteBuild && !separateGoals) score += 16;
    return { flow, index, score, matchedTerms };
  }).filter(match => match.score >= 8).sort((a, b) => b.score - a.score || a.index - b.index);
}

/**
 * @param {string} prompt A build brief, processed only up to 2,000 characters.
 * @param {Array<object>} catalog Current search-index entries (either host).
 * @returns {{status: string, title: string, summary: string, steps: Array, tips: string[], matchedTerms: string[], intent?: string}}
 */
export function recommendWorkflow(prompt, catalog) {
  const text = typeof prompt === 'string' ? normalize(prompt.slice(0, MAX_PROMPT_LENGTH)) : '';
  if (!text) return state('empty', 'What would you like to make?', 'Describe the project, who it is for and the result you want.');
  const noMatch = () => state('no-match', 'Add a little more direction', 'Name the thing you are making and the outcome you want, or try one of the example briefs.');
  if (text.split(' ').length < 2 || !Array.isArray(catalog)) return noMatch();

  // Prefer an explicit artifact before a purpose clause: a web app "for a
  // social campaign" is still a web app. If that prefix has no task signal,
  // use the whole brief (for example, "looking for an AI agent workflow").
  let focused = [];
  for (const clause of text.matchAll(/\b(?:for|to)\b/gu)) {
    focused = rankFlows(text.slice(0, clause.index).trim());
    if (focused.length) break;
  }
  const ranked = focused.length ? focused : rankFlows(text);
  if (!ranked.length) return noMatch();
  if (ranked[1]?.score >= 12 && ranked[0].score - ranked[1].score <= 3) {
    return state('no-match', 'Choose one outcome to start', 'This brief matches more than one task. Start with the main thing you want to make, then build the next workflow separately.');
  }
  const { flow, matchedTerms } = ranked[0];

  const entries = new Map();
  for (const entry of catalog) {
    if (safeCatalogEntry(entry) && !entries.has(entry.id)) entries.set(entry.id, entry);
  }
  const steps = [];
  const used = new Set();
  for (const role of flow.phases) {
    // A named capability exclusion invalidates this editorial preset. Returning
    // fewer steps while retaining its measurement summary/tips would claim a
    // constraint-aware workflow that we have not actually authored.
    const excludesCapability = role.choices.some(candidate => {
      const entry = entries.get(candidate.id);
      if (!entry) return false;
      const term = normalize(entry.name);
      return ` ${text} `.includes(` ${term} `) && !containsTerm(text, term);
    });
    if (excludesCapability) return state('no-match', 'Choose a workflow that fits your constraints', 'This preset includes a capability you excluded. Try a narrower task or browse the skill listings to choose the remaining steps.');
    const skill = chooseSkill(role.choices, entries, used, text);
    if (!skill) {
      if (role.required) return noMatch();
      continue;
    }
    used.add(skill.id);
    steps.push({ title: role.title, skill, why: role.why, output: role.output });
  }
  if (steps.length < 3) return noMatch();
  return { status: 'ready', intent: flow.id, title: flow.title, summary: flow.summary, steps, tips: [...flow.tips], matchedTerms: [...new Set(matchedTerms)] };
}
