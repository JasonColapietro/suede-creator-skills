// Whole sentences from the start of a summary, or null if the first cannot fit.
export function fitSentences(text, max) {
  let t = String(text || "").replace(/\s+/g, " ").trim();
  if (!/[.!?…]["'”’)\]]*$/.test(t)) t += ".";
  if (t.length <= max) return t;
  let out = "";
  // Look for endings, then slice from zero: embedded periods in domains,
  // filenames, versions and names such as Next.js must never discard a prefix.
  for (const ending of t.matchAll(/[.!?]+["'”’)\]]*(?=\s|$)/g)) {
    const end = ending.index + ending[0].length;
    if (end > max) break;
    const prefix = t.slice(0, end);
    // Be conservative around common English abbreviations and initials when
    // more text follows. An uncertain boundary should use the caller's normal
    // truncation fallback, not produce a fragment ending in "e.g." or "Dr.".
    if (/^\.["'”’)\]]*$/.test(ending[0]) && end < t.length &&
        /\b(?:(?:e\.g|i\.e|etc|vs|mr|mrs|ms|dr|prof|sr|jr|st|no|fig|dept|approx)|(?:[a-z]\.)*[a-z])\.["'”’)\]]*$/i.test(prefix)) continue;
    out = prefix;
  }
  return out || null;
}
