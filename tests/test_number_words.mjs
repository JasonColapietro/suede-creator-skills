// The count guard reads a spelled-out number out of the book's prose and
// writes the live measurement back in the same spelling. If the reader and the
// writer disagree by even one word, `--fix` produces prose the guard then
// rejects, and the pack is back to hand-editing figures across eight files.
//
// These tests pin the pair against each other across the whole domain rather
// than spot-checking a few values, because the failures that actually happened
// were at the boundaries: teens (unreachable from either the ones map or the
// tens map) and round tens (whose ordinal is "fortieth", not "forty-th").

import test from "node:test";
import assert from "node:assert/strict";
import {
  wordNumber,
  wordOrdinal,
  numberToWords,
  numberToOrdinalWords,
  matchCase,
} from "../scripts/lib/number-words.mjs";

test("cardinal words round-trip across the whole 0-99 domain", () => {
  for (let n = 0; n <= 99; n += 1) {
    const word = numberToWords(n);
    assert.ok(word, `no cardinal word for ${n}`);
    assert.equal(wordNumber(word), n, `"${word}" did not read back as ${n}`);
  }
});

test("ordinal words round-trip across the whole 0-99 domain", () => {
  for (let n = 0; n <= 99; n += 1) {
    const word = numberToOrdinalWords(n);
    assert.ok(word, `no ordinal word for ${n}`);
    assert.equal(wordOrdinal(word), n, `"${word}" did not read back as ${n}`);
  }
});

// The teens are the specific hole that made the guard go quiet instead of
// failing: wordNumber() returned null for them, and the loop treats null as
// "could not parse" — a warning, not a failure.
test("teens parse rather than returning null", () => {
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  teens.forEach((word, i) => assert.equal(wordNumber(word), i + 10, `"${word}" should read as ${i + 10}`));
});

test("known spellings are exact, not merely round-trippable", () => {
  assert.equal(numberToWords(45), "forty-five");
  assert.equal(numberToWords(70), "seventy");
  assert.equal(numberToWords(12), "twelve");
  assert.equal(numberToOrdinalWords(25), "twenty-fifth");
  assert.equal(numberToOrdinalWords(40), "fortieth");
  assert.equal(numberToOrdinalWords(12), "twelfth");
  assert.equal(numberToOrdinalWords(3), "third");
});

test("out-of-domain values return null instead of inventing a word", () => {
  for (const bad of [-1, 100, 1000, 1.5, NaN, "71"]) {
    assert.equal(numberToWords(bad), null, `numberToWords(${bad}) should be null`);
    assert.equal(numberToOrdinalWords(bad), null, `numberToOrdinalWords(${bad}) should be null`);
  }
});

test("unparseable prose returns null rather than a wrong number", () => {
  for (const bad of ["", "eleventy", "forty-twelve", "banana", "twenty-"]) {
    assert.equal(wordNumber(bad), null, `wordNumber("${bad}") should be null`);
  }
});

// "Forty-five of them add a `metadata` block" opens its sentence. Writing back
// a lowercase word there would be a grammar regression introduced by the fixer.
test("matchCase follows the sample it replaces", () => {
  assert.equal(matchCase("Forty-five", "seventy"), "Seventy");
  assert.equal(matchCase("forty-five", "seventy"), "seventy");
  assert.equal(matchCase("Sixty-nine", "twenty-five"), "Twenty-five");
});
