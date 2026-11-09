/**
 * Task-based, local matching against the supplied directory snapshot.
 * No model call, network request, storage, installation or execution happens here.
 * Role choices are editorial suggestions, not checks of a project's constraints.
 */
const MAX_PROMPT_LENGTH = 2000;

export const WORKFLOW_EXAMPLES = [
  { label: 'Get more signups', prompt: 'I’m launching a new product and want a landing page that turns visitors into early signups.' },
  { label: 'Get found on Google and in AI answers', prompt: 'I run a small business and want more customers to find us on Google and in AI answers like ChatGPT.' },
  { label: 'Grow my audience', prompt: 'I want to grow my audience with a social campaign and posts in my own voice.' },
];

const choice = (id, terms = [], requiredTerms = []) => ({ id, terms, requiredTerms });
const phase = (title, choices, why, output, required = false) => ({ title, choices, why, output, required });
const signal = (weight, ...terms) => ({ weight, terms });

// Exact IDs, capabilities and phase order are grounded in search-index.json and
// directory/editorial/stacks. Scores never substitute for task suitability.
const FLOWS = [
  {
    id: 'landing-page', title: 'From offer to launch-ready landing page',
    signals: [signal(18, 'landing page', 'landing pages'), signal(13, 'launch page', 'waitlist page', 'signup page', 'product page', 'marketing website'), signal(8, 'homepage'), signal(12, 'more signups', 'get signups', 'conversion rate', 'convert visitors', 'convert more visitors')],
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
    signals: [signal(18, 'ai search', 'ai answers', 'cited by ai', 'search visibility'), signal(12, 'seo', 'search rankings', 'search engine optimization', 'rank in google', 'rank on google'), signal(8, 'aeo', 'geo optimization', 'indexing'), signal(12, 'found on google', 'found in google', 'show up on google', 'show up in google', 'customers from google', 'traffic from google', 'find us on google', 'find me on google', 'find us online', 'find us in google', 'organic traffic', 'google rankings', 'cited by chatgpt', 'found in chatgpt')],
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
    signals: [signal(16, 'social campaign', 'social media campaign', 'content campaign'), signal(12, 'social posts', 'social media', 'content strategy', 'content marketing', 'marketing campaign'), signal(8, 'linkedin posts', 'blog posts', 'newsletter', 'write posts', 'write content'), signal(12, 'grow my audience', 'grow our audience', 'more followers', 'grow my following', 'grow our following')],
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
  // A listing with a display name ("Suede AI Copy Skills") carries its
  // directory name as slug; the slug, not the display text, must match the id.
  const slug = entry.slug === undefined ? entry.name : entry.slug;
  if (entry.repo.toLowerCase() !== repoPath.toLowerCase() || slug !== parts[2]) return false;
  const prefixes = ['/directory/', '/'];
  const safeHref = prefixes.some(prefix => entry.href === `${prefix}${entry.id}/` || entry.href === `${prefix}${repoPath}/#${slug}`);
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

// The composable API is intentionally separate from the original single-goal
// matcher. These are authored paths, not model responses or constraint proofs.
const PLAN_LABELS = {
  'landing-page': ['Landing page', 'Build a landing page'],
  'web-app': ['Web app', 'Build a web app'],
  'seo-and-ai-search': ['Search visibility', 'Improve SEO and AI search visibility'],
  'content-and-social': ['Social campaign', 'Create a social campaign'],
  'agent-building': ['AI agent', 'Build an AI agent with MCP tools'],
  'documents-and-data': ['Data report', 'Analyze CSV sales data and prepare a report'],
  research: ['Research report', 'Research competitors and compare companies'],
  'video-and-creative': ['Explainer video', 'Create an explainer video'],
};
const SIMPLE_PHASES = {
  'landing-page': [0, 1, 3], 'web-app': [0, 1, 3],
  'seo-and-ai-search': [0, 1, 2], 'content-and-social': [0, 1, 2],
  'agent-building': [0, 2, 4], 'documents-and-data': [0, 1, 2],
  research: [0, 1, 2], 'video-and-creative': [0, 1, 3],
};
const PLAN_SCOPE = 'Local task matching suggests catalog skills. Budgets, deadlines, compliance, tool compatibility and other project constraints still need review.';
// A bounded directive cue, shared by scope boundaries and unsupported-task
// detection. The verb + determiner shape catches unfamiliar commands such as
// "prepare an email" without needing a list of every unsupported activity.
const DIRECTIVE_START = /^(?:(?:i|we) (?:want|need) (?:to )?)?(?:(?:build|create|launch|develop|make|produce|write|design|analyze|analyse|research|improve|generate|book|buy|reserve|pay|send|schedule|translate|cook|repair|invest|cure)\b|(?!(?:for|to|with|without|in|on|at|by|under|over|from|of|as|a|an|the|my|our|your|their|this|that|it|its|is|are|has|have|who|which|what|so)\b)[\p{L}]+ (?:a|an|the|my|our|your|their|this|that)\b)/u;

function focusedPlanMatches(text) {
  for (const clause of text.matchAll(/\b(?:for|to)\b/gu)) {
    const focused = rankFlows(text.slice(0, clause.index).trim());
    if (focused.length) return { matches: focused, purpose: true };
  }
  return { matches: rankFlows(text), purpose: false };
}

function findPlanGoals(text) {
  const goals = new Map();
  const unsupported = [];
  let unclear = false;
  let negationScope = null;
  let purposeScope = false;
  // Only recognizable conjunctions introduce independent goals. A purpose
  // clause stays with its artifact, so an app "for social media" stays an app.
  const clauses = text.split(/(\s*\|\s*|\b(?:and then|and|plus|then|also|or)\b)/u).map(part => part.trim()).filter(Boolean);
  for (const clause of clauses) {
    if (/^(?:\||and then|and|plus|then|also|or)$/u.test(clause)) {
      if (clause === '|') { negationScope = null; purposeScope = false; }
      if (clause === 'then' || clause === 'and then') {
        purposeScope = false;
        if (negationScope === 'modifier') negationScope = null;
      }
      continue;
    }
    const positiveAction = DIRECTIVE_START.test(clause);
    if (negationScope === 'goal' && !(positiveAction && /\binstead\b/u.test(clause))) continue;
    if (negationScope === 'modifier' && !positiveAction) continue;
    if (purposeScope && !positiveAction) continue;
    const { matches, purpose } = focusedPlanMatches(clause);
    const hasNegation = /\b(?:not|no|without|avoid|don t)\b/u.test(clause);
    // A recognized positive artifact before an exclusion keeps that exclusion
    // on its modifier list, not on the next independent positive action.
    negationScope = hasNegation ? (matches.length ? 'modifier' : 'goal') : null;
    purposeScope = purpose;
    if (!matches.length) {
      // Explicit unsupported actions must not disappear from a partial plan.
      // Other context is not interpreted as a promise to satisfy constraints.
      if (!hasNegation && (positiveAction || /^(?:a|an|another)\b/u.test(clause))) unsupported.push(clause);
      continue;
    }
    if (matches[1]?.score >= 12 && matches[0].score - matches[1].score <= 3) unclear = true;
    const match = matches[0];
    const existing = goals.get(match.flow.id);
    if (existing) {
      existing.matchedTerms = [...new Set([...existing.matchedTerms, ...match.matchedTerms])];
      existing.text += ` | ${clause}`;
    } else goals.set(match.flow.id, { ...match, text: clause });
  }
  const includesReport = goals.has('documents-and-data') || goals.has('research');
  const includesPageCopy = goals.has('landing-page');
  if (unsupported.some(clause => {
    const report = includesReport && /^(?:write|create|prepare|assemble|generate|deliver|produce) (?:a |an |the )?(?:(?:decision ready|sourced|data|research|business) )?report$/u.test(clause);
    const pageCopy = includesPageCopy && /^write (?:the )?(?:(?:page|landing page|marketing) )?copy$/u.test(clause);
    return !report && !pageCopy;
  })) unclear = true;
  if (/\bor\b/u.test(text) && goals.size > 1) unclear = true;
  return { goals: [...goals.values()], unclear };
}

function planRoles(flow, entries, text, mode, exclusions = text) {
  const used = new Set();
  const roles = mode === 'simple' ? flow.phases.filter((_, index) => SIMPLE_PHASES[flow.id].includes(index)) : flow.phases;
  // Check the complete preset for explicit exclusions even in simple mode.
  // Otherwise shortening it could silently bypass a requested constraint.
  const excluded = flow.phases.some(role => role.choices.some(candidate => {
    const entry = entries.get(candidate.id);
    if (!entry) return false;
    const term = normalize(entry.name);
    return ` ${exclusions} `.includes(` ${term} `) && !containsTerm(exclusions, term);
  }));
  if (excluded) return null;
  const steps = [];
  for (const role of roles) {
    // Suitability belongs to this goal, while explicit platform exclusions can
    // still appear in another sentence of the same brief.
    const choices = role.choices.filter(candidate => !(REQUIRED_PLATFORMS[candidate.id] || [])
      .some(term => ` ${exclusions} `.includes(` ${term} `) && !containsTerm(exclusions, term)));
    const skill = chooseSkill(choices, entries, used, text);
    if (!skill) {
      if (role.required) return null;
      continue;
    }
    const alternatives = [];
    const excludedIds = new Set([...used, skill.id]);
    for (let alternative = chooseSkill(choices, entries, excludedIds, text); alternative;
      alternative = chooseSkill(choices, entries, excludedIds, text)) {
      alternatives.push(alternative);
      excludedIds.add(alternative.id);
    }
    used.add(skill.id);
    steps.push({ id: skill.id, title: role.title, skill, why: role.why, output: role.output,
      intentIds: [flow.id], required: role.required, alternatives });
  }
  return steps.length >= 3 ? steps : null;
}

function composePlanSteps(sequences) {
  const nodes = new Map();
  const after = new Map();
  for (const sequence of sequences) {
    for (const [index, step] of sequence.entries()) {
      const existing = nodes.get(step.id);
      if (existing) {
        existing.intentIds.push(...step.intentIds.filter(id => !existing.intentIds.includes(id)));
        existing.required ||= step.required;
        if (!existing.output.includes(step.output)) existing.output += ` ${step.output}`;
        // An alternative for a shared skill must fit every role it replaces.
        existing.alternatives = existing.alternatives.filter(skill => step.alternatives.some(other => other.id === skill.id));
      } else {
        nodes.set(step.id, { ...step, intentIds: [...step.intentIds] });
        after.set(step.id, new Set());
      }
      if (index) after.get(step.id).add(sequence[index - 1].id);
    }
  }
  // Stable topological order preserves each workflow's handoffs. In particular,
  // shared measurement belongs after both the page and the campaign drafts.
  const result = [];
  const remaining = new Set(nodes.keys());
  while (remaining.size) {
    const id = [...remaining].find(key => [...after.get(key)].every(dependency => !remaining.has(dependency)));
    if (!id) return null;
    remaining.delete(id);
    const step = nodes.get(id);
    step.alternatives = step.alternatives.filter(skill => !nodes.has(skill.id));
    result.push(step);
  }
  return result;
}

/**
 * Compose recognized independent goals using the supplied directory snapshot.
 * Input is processed locally, bounded to 2,000 characters and never reflected
 * into result text. The caller owns displaying/exporting the original brief.
 * freeOnly selects the free-open-source catalog lane, not zero runtime cost.
 * @param {string} prompt
 * @param {Array<object>} catalog
 * @param {{freeOnly?: boolean, mode?: 'full'|'simple'}} options
 * @returns {{status:string, title:string, summary:string, intent?:string,
 * intents:Array, steps:Array, tips:string[], matchedTerms:string[],
 * constraints:object, notices:string[], choices:Array}}
 */
export function planWorkflow(prompt, catalog, options = {}) {
  const constraints = { freeOnly: options?.freeOnly === true, mode: options?.mode === 'simple' ? 'simple' : 'full' };
  const notices = [PLAN_SCOPE];
  if (constraints.freeOnly) notices.push('Only catalog entries labeled free and open source are included. Runtime tools, hosting and external services can still cost money.');
  if (constraints.mode === 'simple') notices.push('Simple mode keeps three essential roles per goal and combines shared skills. Add specialist reviews when the project needs them.');
  const entries = new Map();
  for (const entry of Array.isArray(catalog) ? catalog : []) {
    if (safeCatalogEntry(entry) && (!constraints.freeOnly || entry.lane === 'free-open-source') && !entries.has(entry.id)) entries.set(entry.id, entry);
  }
  const text = typeof prompt === 'string' ? normalize(prompt.slice(0, MAX_PROMPT_LENGTH)
    .replace(/[+,]/g, ' plus ').replace(/\bnot (?:just|only)\b/gi, '')) : '';
  const { goals, unclear } = findPlanGoals(text);
  const intents = goals.map(({ flow, matchedTerms }) => ({ id: flow.id, title: PLAN_LABELS[flow.id][0], matchedTerms }));
  const metadata = { intents, matchedTerms: [...new Set(goals.flatMap(goal => goal.matchedTerms))], constraints, notices };
  const choices = () => FLOWS.filter(flow => planRoles(flow, entries, normalize(PLAN_LABELS[flow.id][1]), constraints.mode))
    .map(flow => ({ label: PLAN_LABELS[flow.id][0], prompt: PLAN_LABELS[flow.id][1] }));
  const clarify = (title, summary) => ({ ...state('clarify', title, summary), ...metadata, choices: choices() });
  if (!text) return { ...state('empty', 'What would you like to make?', 'Describe the project, audience and outcome, or choose a starting idea.'), ...metadata, choices: [] };
  if (text.split(' ').length < 2 || !goals.length || unclear) return clarify('Choose a concrete outcome', 'Choose the result you want to make. You can combine supported goals with “and”, or start with one of these workflows.');
  const sequences = goals.map(goal => planRoles(goal.flow, entries, goal.text, constraints.mode, text));
  if (sequences.some(sequence => !sequence)) return clarify('Choose a workflow that fits', 'The current catalog and selected filters do not cover every requested goal or exclusion. Try an available workflow below or revise the brief and filters.');
  const steps = composePlanSteps(sequences);
  if (!steps || steps.length > 10) return clarify('Start with fewer outcomes', 'This combination needs more than 10 steps or conflicting handoffs. Choose one or two outcomes first, or try simple mode for a shorter plan.');
  const labels = intents.map(intent => intent.title);
  const multiple = goals.length > 1;
  const partial = sequences.some((sequence, index) => sequence.length < (constraints.mode === 'simple' ? 3 : goals[index].flow.phases.length));
  if (partial) notices.push('Some supporting roles are unavailable under the current catalog and filters. The plan includes only the available roles shown below.');
  const summary = multiple || constraints.mode === 'simple' || partial
    ? `Task-based ${constraints.mode === 'simple' ? 'starter ' : ''}plan: ${steps.length} ordered steps for ${labels.join(' + ')}. Shared skills appear once; review the handoff from each step before moving on.`
    : goals[0].flow.summary;
  return { status: 'ready', intent: goals[0].flow.id,
    title: multiple ? `${labels.join(' + ')} workflow` : goals[0].flow.title,
    summary, steps, tips: [...new Set(goals.flatMap(({ flow }) => flow.tips))],
    ...metadata, choices: [] };
}

// Goal-first recommendations. A person can describe what they are doing in
// their own words; these helpers rank catalog skills and authored articles for
// that goal even when no authored workflow preset matches it. Matching is
// lexical and local: the brief is never sent anywhere or echoed into results.
const STOPWORDS = new Set(('a about above after again all also am an and any are as at be because been before being below between both '
  + 'but by can could did do does doing done down during each else ever every few for from further get gets getting got had has have having '
  + 'he her here hers him his how i if in into is it its itself just let lets like ll me might more most much must my myself need needs no nor '
  + 'not now of off on once one only or other our ours out over own please re really same she should so some something someone such than '
  + 'that the their them then there these they thing things this those through to too try trying under until up us use using ve very want wants '
  + 'was way we well were what when where which while who whom why will with without would you your yours able better best build building '
  + 'create creating help helping make making start starting new good great lot lots work working doing currently am im ive id dont cant '
  + 'kind sort stuff anything everything etc maybe sure think know looking look figure out achieve achieving goal goals project projects '
  + 'currently plan planning next first ai agent agents skill skills claude codex cursor run running small own bit little big lots').split(' '));

// Everyday goal language mapped to the words skill descriptions use. With
// replace, the trigger word is dropped: "customers from Google" is an SEO
// goal, not a request for Google Cloud skills.
const EXPANSIONS = [
  { terms: ['from google', 'on google', 'in google', 'google search', 'google rankings', 'google maps', 'rank on google', 'rank in google'], add: ['seo'], replace: ['google', 'maps', 'rankings'] },
  { terms: ['organic traffic', 'website traffic', 'more traffic', 'search results', 'found online', 'show up'], add: ['seo'] },
  { terms: ['chatgpt', 'perplexity', 'ai search', 'ai answers', 'ai overviews'], add: ['seo', 'citations'] },
  { terms: ['customers', 'clients', 'more sales', 'sell more'], add: ['marketing'], replace: ['customers', 'clients'] },
  { terms: ['get leads', 'more leads', 'find clients', 'find customers'], add: ['leads', 'prospects'] },
  { terms: ['subscribers', 'mailing list', 'newsletter'], add: ['newsletter', 'email'] },
  { terms: ['followers', 'audience', 'instagram', 'tiktok', 'linkedin', 'twitter', 'youtube'], add: ['social', 'content'] },
  { terms: ['musician', 'musicians', 'artist', 'band', 'song', 'songs', 'album', 'record label', 'my single', 'new single', 'my music'], add: ['music', 'release', 'song'] },
  { terms: ['app store', 'ios app', 'iphone app', 'testflight'], add: ['ios', 'aso'], replace: ['store'] },
  { terms: ['play store', 'google play', 'android app'], add: ['android', 'play'], replace: ['google', 'store'] },
  { terms: ['inbox', 'emails', 'gmail'], add: ['email'] },
  { terms: ['investors', 'fundraising', 'raise money', 'pitch deck'], add: ['pitch', 'investor', 'deck'] },
  { terms: ['podcast', 'podcasts'], add: ['podcast', 'audio'] },
  { terms: ['bug', 'bugs', 'broken', 'crash', 'crashes'], add: ['debugging', 'debug'] },
  { terms: ['ads', 'advertising', 'paid ads'], add: ['ads', 'advertising'] },
  { terms: ['price', 'pricing', 'charge'], add: ['pricing'] },
  { terms: ['thesis', 'dissertation', 'essay', 'term paper', 'homework'], add: ['academic', 'writing', 'research'], replace: ['thesis'] },
];

function goalTokens(text) {
  const added = [];
  const dropped = new Set();
  for (const rule of EXPANSIONS) {
    if (!rule.terms.some(term => containsTerm(text, term))) continue;
    added.push(...rule.add);
    for (const word of rule.replace || []) dropped.add(word);
  }
  const tokens = contentTokens(text).filter(token => !dropped.has(token));
  for (const token of added) if (!tokens.some(other => stems(other).includes(token) || stems(token).includes(other))) tokens.push(token);
  return tokens.slice(0, 28);
}

function contentTokens(text) {
  const words = text.replace(/\|/g, ' ').split(' ').filter(Boolean);
  const tokens = [];
  for (const word of words) {
    if (word.length < 3 || STOPWORDS.has(word) || /^\d+$/.test(word) || tokens.some(other => stems(other).includes(word) || stems(word).includes(other))) continue;
    tokens.push(word);
    if (tokens.length >= 24) break;
  }
  return tokens;
}

function stems(token) {
  const forms = new Set([token]);
  if (token.length > 4 && token.endsWith('ies')) forms.add(token.slice(0, -3) + 'y');
  else if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) forms.add(token.slice(0, -1));
  else forms.add(token + 's');
  if (token.length > 5 && token.endsWith('ing')) { forms.add(token.slice(0, -3)); forms.add(token.slice(0, -3) + 'e'); }
  return [...forms];
}

const hasWord = (haystack, token) => stems(token).some(form => haystack.includes(` ${form} `));

// A Suede AI skill leads the list when it is at least this share as relevant
// as the best match; weaker Suede matches keep their place by relevance.
const LEAD_SHARE = 0.35;
const FIRST_PARTY_REPO = 'jasoncolapietro/suede-creator-skills';
/** True for a skill published in the Suede AI skill pack. */
export const isFirstParty = entry => typeof entry?.repo === 'string' && entry.repo.toLowerCase() === FIRST_PARTY_REPO;

/**
 * Rank catalog skills for a free-form goal. Matching Suede AI skills come
 * first, each group ordered by relevance.
 * @param {string} prompt
 * @param {Array<object>} catalog search-index entries
 * @param {{exclude?: Iterable<string>, freeOnly?: boolean, limit?: number}} options
 * @returns {Array<object>} catalog entries, best match first
 */
export function recommendSkills(prompt, catalog, options = {}) {
  const text = typeof prompt === 'string' ? normalize(prompt.slice(0, MAX_PROMPT_LENGTH)) : '';
  const tokens = goalTokens(text);
  if (!tokens.length || !Array.isArray(catalog)) return [];
  const limit = Number.isInteger(options?.limit) && options.limit > 0 ? Math.min(options.limit, 12) : 6;
  const exclude = new Set(options?.exclude || []);
  const words = text.replace(/\|/g, ' ').split(' ').filter(Boolean);
  const phrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (!STOPWORDS.has(words[i]) && !STOPWORDS.has(words[i + 1]) && words[i].length > 1 && words[i + 1].length > 1) phrases.push(`${words[i]} ${words[i + 1]}`);
  }
  const rows = [];
  const frequency = new Array(tokens.length).fill(0);
  let considered = 0;
  for (const entry of catalog) {
    if (!safeCatalogEntry(entry) || exclude.has(entry.id)) continue;
    if (options?.freeOnly && entry.lane !== 'free-open-source') continue;
    considered++;
    const fields = {
      name: ` ${normalize(`${typeof entry.slug === 'string' ? entry.slug : ''} ${entry.name}`.replace(/[-_]+/g, ' '))} `,
      topics: ` ${normalize((Array.isArray(entry.topics) ? entry.topics : []).join(' ').replace(/-/g, ' '))} `,
      // A NOT FOR clause names what the skill does not do; it is not a match.
      description: ` ${normalize(typeof entry.description === 'string' ? entry.description.split(/\bNOT FOR\b/i)[0] : '')} `,
      label: ` ${normalize(typeof entry.label === 'string' ? entry.label : '')} `,
    };
    const hits = tokens.map(token => ({ name: hasWord(fields.name, token), topics: hasWord(fields.topics, token),
      description: hasWord(fields.description, token), label: hasWord(fields.label, token) }));
    if (!hits.some(hit => hit.name || hit.topics || hit.description || hit.label)) continue;
    hits.forEach((hit, i) => { if (hit.name || hit.topics || hit.description || hit.label) frequency[i]++; });
    rows.push({ entry, fields, hits });
  }
  // Rare words carry the goal ("music", "bakery"); common ones ("release",
  // "content") only support it. Weight each word by how few skills use it.
  const weight = frequency.map(count => Math.max(0.5, Math.log((considered + 1) / (1 + count))));
  const needed = tokens.length >= 3 ? 2 : 1;
  const ranked = [];
  for (const { entry, fields, hits } of rows) {
    let relevance = 0;
    let matched = 0;
    hits.forEach((hit, i) => {
      if (hit.name || hit.topics || hit.description || hit.label) matched++;
      relevance += weight[i] * ((hit.name ? 5 : 0) + (hit.topics ? 3 : 0) + (hit.description ? 2 : 0) + (hit.label ? 1 : 0));
    });
    for (const phrase of phrases) {
      if (fields.name.includes(` ${phrase} `)) relevance += 12;
      else if (fields.description.includes(` ${phrase} `) || fields.topics.includes(` ${phrase} `)) relevance += 8;
    }
    if (matched < needed || relevance < 6) continue;
    const quality = Number.isFinite(entry.score) ? entry.score / 20 : 0;
    const reach = Number.isFinite(entry.installs) && entry.installs > 0 ? Math.log10(entry.installs) / 2 : 0;
    ranked.push({ entry, relevance, total: relevance + quality + reach });
  }
  // Suede AI's own skills lead when they are a solid match for the goal.
  const best = ranked.reduce((top, item) => Math.max(top, item.relevance), 0);
  const leads = item => isFirstParty(item.entry) && item.relevance >= best * LEAD_SHARE;
  ranked.sort((a, b) => Number(leads(b)) - Number(leads(a))
    || b.total - a.total || a.entry.id.localeCompare(b.entry.id));
  const picks = [];
  const seenNames = new Set();
  for (const { entry } of ranked) {
    const key = entry.name.toLowerCase();
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    picks.push(entry);
    if (picks.length >= limit) break;
  }
  return picks;
}

const ARTICLE_HREF = /^https:\/\/(?:suedeai\.directory\/(?:stacks|guides)\/[a-z0-9-]+\/|skills\.suedeai\.ai\/(?:blog|book)\/(?:[a-z0-9-]+\.html)?)$/;

/** True for an authored article the reading list may display. */
export function isPublishableArticle(item) {
  return Boolean(item && typeof item === 'object' && item.author === 'Jason Colapietro'
    && typeof item.title === 'string' && item.title && typeof item.summary === 'string' && item.summary
    && typeof item.href === 'string' && ARTICLE_HREF.test(item.href)
    && Array.isArray(item.intents) && item.intents.every(intent => typeof intent === 'string')
    && (item.intents.length || (Array.isArray(item.keywords) && item.keywords.length)));
}

/**
 * Pick authored articles for a goal: the best article for each matched
 * workflow first, then the strongest keyword matches.
 * @param {string} prompt
 * @param {string[]} intentIds workflow ids the plan matched, in order
 * @param {Array<object>} articles published workflow-articles entries
 * @param {number} limit
 */
export function recommendArticles(prompt, intentIds, articles, limit = 3) {
  const text = typeof prompt === 'string' ? normalize(prompt.slice(0, MAX_PROMPT_LENGTH)) : '';
  const intents = Array.isArray(intentIds) ? intentIds.filter(id => typeof id === 'string') : [];
  const tokens = goalTokens(text);
  const pool = (Array.isArray(articles) ? articles : []).filter(isPublishableArticle);
  // A one-word keyword also matches an expanded goal word, so "releasing a
  // single" reaches an article keyed on "music" or "release".
  const keywordMatches = keyword => {
    const term = normalize(keyword);
    if (!term) return false;
    if (containsTerm(text, term)) return true;
    return !term.includes(' ') && tokens.some(token => stems(token).includes(term) || stems(term).includes(token));
  };
  const scored = pool.map((article, index) => {
    const keywordHits = (Array.isArray(article.keywords) ? article.keywords : [])
      .filter(keyword => typeof keyword === 'string' && keywordMatches(keyword)).length;
    const copy = ` ${normalize(`${article.title} ${article.summary}`)} `;
    const wordHits = tokens.filter(token => token.length >= 4 && hasWord(copy, token)).length;
    const intentRank = intents.findIndex(id => article.intents.includes(id));
    const intentScore = intentRank === -1 ? 0 : 10 - Math.min(intentRank, 3);
    return { article, index, intentRank, keywordHits, score: intentScore + keywordHits * 6 + wordHits * 2 };
  });
  const order = (a, b) => b.score - a.score || a.index - b.index;
  const picked = [];
  for (const intent of intents) {
    const best = scored.filter(item => item.article.intents.includes(intent) && !picked.includes(item)).sort(order)[0];
    if (best && picked.length < limit) picked.push(best);
  }
  for (const item of [...scored].sort(order)) {
    if (picked.length >= limit) break;
    if (picked.includes(item) || item.score < 6 || (!item.keywordHits && item.intentRank === -1 && item.score < 8)) continue;
    picked.push(item);
  }
  return picked.map(item => item.article);
}
