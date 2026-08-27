// The number<->word mapping the book's count guard reads and writes.
//
// Both directions live here on purpose. The guard in validate-skill-pack.mjs
// reads a spelled-out number out of prose and compares it to a live
// measurement; --fix writes the measurement back in the same spelling. If the
// reader and the writer disagree about what "forty-five" means, --fix produces
// prose the guard then rejects, so the two are defined together and tested
// against each other in tests/test_number_words.mjs.
//
// Domain is 0-99. The pack size is two digits and so is every ratio the prose
// spells out. Out-of-range returns null rather than inventing a word, and the
// caller turns that null into a hard failure.

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const ORDINAL_ONES = ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth"];

const ONES_TO_N = Object.fromEntries(ONES.map((w, i) => [w, i]));
const TEENS_TO_N = Object.fromEntries(TEENS.map((w, i) => [w, i + 10]));
const TENS_TO_N = Object.fromEntries(TENS.map((w, i) => [w, i * 10]).filter(([w]) => w));
const ORDINAL_ONES_TO_N = Object.fromEntries(ORDINAL_ONES.map((w, i) => [w, i]));

// "sixty-seven" -> 67, "sixty" -> 60, "three" -> 3, "twelve" -> 12.
//
// Teens are their own words, reachable through neither the ones map nor the
// tens map. Before they were handled here a count drifting into 10-19 parsed as
// null, and a null downgrades the guard from a failure to a warning — it went
// quiet exactly when the number was wrong.
export function wordNumber(word) {
  const parts = String(word).toLowerCase().split("-");
  if (parts.length === 1) {
    if (ONES_TO_N[parts[0]] !== undefined) return ONES_TO_N[parts[0]];
    if (TEENS_TO_N[parts[0]] !== undefined) return TEENS_TO_N[parts[0]];
    return TENS_TO_N[parts[0]] ?? null;
  }
  const tens = TENS_TO_N[parts[0]];
  if (tens === undefined) return null;
  const ones = ONES_TO_N[parts[1]];
  return ones === undefined ? null : tens + ones;
}

// "twenty-fourth" -> 24, "fortieth" -> 40, "twelfth" -> 12.
export function wordOrdinal(word) {
  const parts = String(word).toLowerCase().split("-");
  const last = parts[parts.length - 1];
  if (parts.length === 1) {
    if (ORDINAL_ONES_TO_N[last] !== undefined) return ORDINAL_ONES_TO_N[last];
    if (last === "twelfth") return 12;
    const teen = TEENS_TO_N[last.replace(/th$/, "")];
    if (teen !== undefined) return teen;
    return TENS_TO_N[last.replace(/ieth$/, "y")] ?? null;
  }
  const tens = TENS_TO_N[parts[0]];
  const ones = ORDINAL_ONES_TO_N[last];
  return tens === undefined || ones === undefined ? null : tens + ones;
}

// Inverse of wordNumber().
export function numberToWords(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) return null;
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const ones = n % 10;
  const tens = TENS[Math.floor(n / 10)];
  return ones === 0 ? tens : `${tens}-${ONES[ones]}`;
}

// Inverse of wordOrdinal().
export function numberToOrdinalWords(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) return null;
  if (n < 10) return ORDINAL_ONES[n];
  if (n < 20) return n === 12 ? "twelfth" : `${TEENS[n - 10]}th`;
  const ones = n % 10;
  if (ones === 0) return TENS[Math.floor(n / 10)].replace(/y$/, "ieth");
  return `${TENS[Math.floor(n / 10)]}-${ORDINAL_ONES[ones]}`;
}

// Follow the sample's capitalization so "Forty-five of them add a `metadata`
// block" does not come back lowercased at the head of its sentence.
export function matchCase(sample, replacement) {
  if (!replacement) return replacement;
  return /^[A-Z]/.test(sample) ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
}
