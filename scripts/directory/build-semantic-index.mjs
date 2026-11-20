#!/usr/bin/env node
import { readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [corpusPath, modelPath, outputPath] = process.argv.slice(2);
if (!outputPath) {
  throw new Error('Usage: node build-index.mjs corpus.json model-v1.bin documents.bin');
}
const runtime = await import(pathToFileURL(resolve(dirname(modelPath), 'search.mjs')));
const weights = await readFile(modelPath);
const model = runtime.readModel(weights.buffer.slice(weights.byteOffset, weights.byteOffset + weights.byteLength));
const input = JSON.parse(await readFile(corpusPath, 'utf8'));
if (!Array.isArray(input) || !input.length) throw new Error('Expected a nonempty array of records.');
const ids = [], seen = new Set();
const vectors = new Int8Array(input.length * model.dimensions);
for (let i = 0; i < input.length; i++) {
  const row = input[i];
  const title = row.title || row.name;
  if (typeof row.id !== 'string' || !row.id || seen.has(row.id) || !title) throw new Error('Missing title or invalid ID at row ' + i);
  seen.add(row.id);
  ids.push(row.id);
  const tags = [row.keywords, row.topics, row.label, row.category, row.repo].flat().filter(Boolean);
  const text = [title, title, row.description, ...tags].filter(Boolean).join(' ').replace(/[-_/]/g, ' ');
  const embedding = model.embed(text);
  const amplitude = Math.max(...embedding.map(Math.abs));
  if (!amplitude) continue;
  const offset = i * model.dimensions;
  for (let j = 0; j < model.dimensions; j++) vectors[offset + j] = Math.round(embedding[j] * 127 / amplitude);
}
const header = Buffer.from(JSON.stringify({ model: model.name, ids }));
const metadata = Buffer.alloc(20);
metadata.write('SUEDESI1');
metadata.writeUInt32LE(ids.length, 8);
metadata.writeUInt32LE(model.dimensions, 12);
metadata.writeUInt32LE(header.length, 16);
const output = Buffer.concat([metadata, header, Buffer.from(vectors.buffer)]);
const temporary = outputPath + '.' + process.pid + '.tmp';
await writeFile(temporary, output);
await rename(temporary, outputPath);
console.log('Embedded ' + ids.length + ' records in ' + output.byteLength + ' bytes.');
