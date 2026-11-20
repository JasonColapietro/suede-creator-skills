/** Local inference for the pretrained Potion 2M WordPiece embedding model. */
const decoder = new TextDecoder();
const modelName = 'potion-base-2M@389b9f64:int8-v1';

function readHeader(buffer, expectedMagic) {
  if (buffer.byteLength < 20 || decoder.decode(new Uint8Array(buffer, 0, 8)) !== expectedMagic) {
    throw new Error('Unrecognized semantic search asset.');
  }
  const view = new DataView(buffer);
  return {
    count: view.getUint32(8, true),
    dimensions: view.getUint32(12, true),
    textBytes: view.getUint32(16, true)
  };
}

// Implements the published lowercase BertNormalizer, BertPreTokenizer and
// greedy WordPiece settings. Unknown words have no vector in the pooled text.
const cleanControl = /[\u0000\ufffd\p{Cc}\p{Cf}]/gu;
const chinese = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u{20000}-\u{2fa1f}]/gu;
const punctuation = /([\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e\p{P}])/gu;
function words(text) {
  return text.replace(/[\t\n\r]/g, ' ')
    .replace(cleanControl, '').replace(chinese, ' $& ')
    .toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '')
    .replace(punctuation, ' $1 ').trim().split(/\s+/u);
}

export function readModel(buffer) {
  const { count, dimensions, textBytes } = readHeader(buffer, 'SUEDEMV1');
  const scaleOffset = 20 + Math.ceil(textBytes / 4) * 4;
  const tableOffset = scaleOffset + count * 4;
  if (dimensions !== 64 || count !== 29528 || tableOffset + count * dimensions !== buffer.byteLength) {
    throw new Error('Incomplete semantic model.');
  }
  const tokens = decoder.decode(new Uint8Array(buffer, 20, textBytes)).split('\n');
  if (tokens.length !== count) throw new Error('Incomplete WordPiece vocabulary.');
  const vocabulary = new Map(tokens.map((token, index) => [token, index]));
  const scales = new Float32Array(buffer, scaleOffset, count);
  const table = new Int8Array(buffer, tableOffset);

  function pieces(word) {
    const whole = vocabulary.get(word);
    if (whole !== undefined) return [whole];
    const characters = Array.from(word);
    if (characters.length > 100) return [];
    const result = [];
    let start = 0;
    while (start < characters.length) {
      let stop = characters.length;
      let id;
      while (stop > start) {
        const part = characters.slice(start, stop).join('');
        id = vocabulary.get(start === 0 ? part : '##' + part);
        if (id !== undefined) break;
        stop--;
      }
      if (id === undefined) return [];
      result.push(id);
      start = stop;
    }
    return result;
  }

  function embed(text, requireWordCoverage = false) {
    const vector = new Float32Array(dimensions);
    if (typeof text !== 'string' || !/[\p{L}\p{N}]/u.test(text)) return vector;
    let covered = !requireWordCoverage;
    for (const word of words(text)) {
      const ids = pieces(word);
      // Random identifiers can split into single letters with spuriously high
      // cosine similarity. The site's literal search can still match these.
      if (!covered && /\p{L}/u.test(word) && !/(.)\1{3}/u.test(word) && ids.length) {
        const wellSegmented = ids.length <= 2 || (tokens[ids[0]].length >= 3 && word.length >= ids.length * 2.6);
        if (wellSegmented && word.length >= 2) covered = true;
      }
      for (const id of ids) {
        if (id < 5) continue;
        const offset = id * dimensions;
        const scale = scales[id];
        for (let j = 0; j < dimensions; j++) vector[j] += table[offset + j] * scale;
      }
    }
    if (!covered) return vector.fill(0);
    const norm = Math.hypot(...vector);
    if (norm) for (let i = 0; i < dimensions; i++) vector[i] /= norm;
    return vector;
  }
  return { dimensions, name: modelName, embed };
}

export function readSearchIndex(model, buffer) {
  const { count, dimensions, textBytes } = readHeader(buffer, 'SUEDESI1');
  if (dimensions !== model.dimensions || 20 + textBytes + count * dimensions !== buffer.byteLength) {
    throw new Error('Incomplete semantic index.');
  }
  const header = JSON.parse(decoder.decode(new Uint8Array(buffer, 20, textBytes)));
  if (header.model !== model.name || !Array.isArray(header.ids) || header.ids.length !== count) {
    throw new Error('The search index belongs to a different model.');
  }
  const rows = new Int8Array(buffer, 20 + textBytes);
  const inverseLengths = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    let squareSum = 0;
    const start = i * dimensions;
    for (let j = 0; j < dimensions; j++) squareSum += rows[start + j] ** 2;
    if (squareSum) inverseLengths[i] = 1 / Math.sqrt(squareSum);
  }
  function search(text, limit = 8) {
    if (typeof text !== 'string' || !(limit > 0)) return [];
    const query = model.embed(text.slice(0, 4096), true);
    if (!query.some(value => value !== 0)) return [];
    const hits = [];
    for (let i = 0; i < count; i++) {
      let dot = 0;
      const offset = i * dimensions;
      for (let j = 0; j < dimensions; j++) dot += query[j] * rows[offset + j];
      const score = dot * inverseLengths[i];
      if (score > 0) hits.push({ id: header.ids[i], score: Math.min(score, 1) });
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, limit);
  }
  return { search, count, model: model.name };
}

async function getFile(name) {
  const response = await fetch(new URL(name, import.meta.url));
  if (!response.ok) throw new Error('Semantic search assets are unavailable.');
  return response.arrayBuffer();
}

let pending;
export function createSemanticSearch() {
  if (!pending) {
    pending = Promise.all([getFile('model-v1.bin'), getFile('documents.bin')])
      .then(([weights, documents]) => readSearchIndex(readModel(weights), documents))
      .catch(error => { pending = undefined; throw error; });
  }
  return pending;
}
