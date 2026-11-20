import { recommendSkills } from '/assets/workflow-recommender.js';

let index;
async function loadRecords() {
  if (globalThis.loadSuedeSkillIndex) return globalThis.loadSuedeSkillIndex();
  if (!index) {
    index = fetch('/search-index.json').then(response => {
      if (!response.ok) throw new Error('Skill index unavailable');
      return response.json();
    }).catch(error => { index = undefined; throw error; });
  }
  return index;
}

function sameTitle(skill, text) {
  return [skill.name, skill.slug, skill.repo, skill.repo.split('/')[0]].some(value => value?.toLowerCase() === text);
}

// These pairs connect everyday descriptions to the directory's published topic
// vocabulary. Require both a context and an outcome so "board", "screen" or
// "call" alone cannot redirect an otherwise unrelated search.
const taskTopics = [
  {
    context: /\b(meetings?|calls?|standups?|discussions?|conversations?|huddles?|coworkers?|teammates?)\b/,
    outcome: /\b(minutes|recaps?|decisions?|commitments?|promis\w*|follow[ -]?ups?|next steps?|action (?:items?|owners?)|who (?:owns|agreed|will|does)|responsibilit\w*|assigned tasks?)\b/,
    topics: ['meeting-assistant'],
    description: 'meeting recap minutes after meeting summarize decisions action items task owners follow up'
  },
  {
    context: /\b(board|audiences?|executives?|stakeholders?|investors?|present(?:ing|ation)?|keynote|projector|slides?|deck)\b/,
    outcome: /\b(slides?|decks?|talking points?|speaker notes?|visuals?|charts?|project(?:or|ed)|big screen|pitch|present to|showcase)\b/,
    topics: ['presentations'],
    description: 'create a presentation slide deck with charts speaker notes and a visual story for an audience'
  },
  {
    context: /\b(websites?|web|pages?|interfaces?|screens?|apps?|forms?|buttons?|controls?|navigation|keyboard|design|site|audit)\b/,
    outcome: /\b(accessib\w*|assistive|screen readers?|wcag|a11y|disabilit\w*|low[ -]vision|poor eyesight|visually impaired|blind|keyboard[ -]only|mouse[ -]free|without (?:using )?(?:a |the |my )?(?:mouse|trackpad)|(?:can(?:not|['’]t)|unable to) use (?:a |the |my )?(?:mouse|trackpad)|visual impairments?|(?:people|users|visitors) (?:who )?(?:cannot|can.t) see)\b/,
    topics: ['accessibility-testing'],
    description: 'accessibility audit test website interface barriers screen readers keyboard navigation and contrast'
  },
  {
    context: /\b(audio|recordings?|panels?|interviews?|conversations?|voices?|videos?|footage|webinars?|lectures?|episodes?|podcasts?|speech|spoken|speakers?|talks?)\b/,
    outcome: /\b(transcri\w*|captions?|subtitles?|hard[ -]of[ -]hearing|hearing (?:loss|impairment)|(?:can(?:not|['’]t)|unable to) hear|deaf|read along|readable text|written text|read (?:it|what)|speech to text|in writing|written record)\b/,
    topics: ['speech-to-text','subtitles-captions'],
    description: 'transcribe a recording into readable text with timestamps speaker identification and accessible captions'
  }
];

function matchTask(rule, records, model, queryHits) {
  if (!rule) return [];
  const candidates = records.filter(row => row.topics?.some(topic => rule.topics.includes(topic)));
  const literal = recommendSkills(rule.description, candidates, { limit: 12 });
  if (!model || !candidates.length) return literal;
  // Rank the topic's actual entries with the model. The original prompt still
  // influences which variant to prefer, e.g. a webinar recording vs film subtitles.
  const inferred = new Map(model.search(rule.description, records.length).map(hit => [hit.id, hit.score]));
  const original = new Map(queryHits.map(hit => [hit.id, hit.score]));
  const literalRanks = new Map(literal.map((row, i) => [row.id, i]));
  return candidates.map(row => {
    const rank = literalRanks.get(row.id);
    const score = .7 * (inferred.get(row.id) || 0) + .3 * (original.get(row.id) || 0)
      + (rank === undefined ? 0 : .04 / (1 + rank));
    return { row, score };
  }).filter(hit => hit.score > .25).sort((a, b) => b.score - a.score).slice(0, 6).map(hit => hit.row);
}

export async function findSkills(query, limit = 12) {
  // Start the local pretrained model only when someone submits a search.
  const [records, model] = await Promise.all([
    loadRecords(),
    import('/assets/suede-semantic/search.mjs').then(module => module.createSemanticSearch()).catch(() => null)
  ]);
  const normalized = query.trim().toLowerCase();
  const exact = records.filter(row => sameTitle(row, normalized)).sort((a, b) => b.score - a.score);
  const lexical = recommendSkills(query, records, { limit: 12 });
  const lexicalRanks = new Map(lexical.map((row, index) => [row.id, index]));
  const byId = new Map(records.map(row => [row.id, row]));
  const rule = taskTopics.find(task => task.context.test(normalized) && task.outcome.test(normalized));
  const queryHits = model?.search(query, rule ? records.length : 80) || [];
  const semantic = queryHits.slice(0, 80)
    .filter(hit => hit.score >= (lexicalRanks.has(hit.id) ? .50 : .55) && byId.has(hit.id))
    .map(hit => {
      const rank = lexicalRanks.get(hit.id);
      return { row: byId.get(hit.id), score: hit.score + (rank === undefined ? 0 : .07 / (1 + rank / 5)) };
    })
    .sort((a, b) => b.score - a.score);
  const task = matchTask(rule, records, model, queryHits);
  const ordered = [...exact, ...task, ...semantic.map(hit => hit.row), ...lexical];
  const seen = new Set();
  const items = ordered.filter(row => {
    const key = row.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
  return { items, mode: model && (semantic.length || task.length) ? 'semantic' : 'keyword' };
}
