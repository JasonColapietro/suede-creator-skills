#!/usr/bin/env python3
"""Rank Google Search Console rows by click opportunity from a title/snippet test.

Usage:
  python3 scripts/gsc_opportunities.py PAGES.csv [--queries QUERIES.csv]
      [--brand "acme,acme inc"] [--min-impressions 300] [--top 25]

PAGES.csv columns (GSC "Pages" export, any order, case-insensitive):
  page, clicks, impressions, ctr, position
QUERIES.csv (optional) adds: query, page  -> used for cannibalization + branded split.

Why: a title test can only move clicks on pages Google already shows. Pages
ranking 1-15 with lots of impressions and below-expected CTR are where a better
title pays off fastest. Pages past ~15 need content/links first, not a title.

Expected CTR uses the site's own position curve when there are enough rows
(>= 8 rows with impressions), blended with a conservative industry-style
fallback curve. The output is a priority list.
"""
import argparse
import csv
import re
import sys
from urllib.parse import urlparse
from collections import defaultdict

FALLBACK_CTR = {1: 0.28, 2: 0.15, 3: 0.10, 4: 0.075, 5: 0.06, 6: 0.048,
                7: 0.04, 8: 0.032, 9: 0.027, 10: 0.023}
FALLBACK_TAIL = 0.01  # positions 11-20


def fallback_ctr(pos):
    p = max(1, int(round(pos)))
    return FALLBACK_CTR.get(p, FALLBACK_TAIL if p <= 20 else 0.003)


def num(v):
    v = (v or "").strip()
    if v in ("", "-", "\u2014", "\u2013"):
        return 0.0
    if re.fullmatch(r"\d+,\d{1,2}%?", v):  # European decimal comma, e.g. "6,1"
        v = v.replace(",", ".")
    v = v.replace(",", "")
    try:
        return float(v[:-1]) / 100 if v.endswith("%") else float(v)
    except ValueError:
        sys.exit(f"bad number {v!r}")


def norm(url):
    """Canonical key: host without www, path without trailing slash, no query."""
    u = urlparse(url if "://" in url else "https://x" + (url if url.startswith("/") else "/" + url))
    host = u.netloc.lower().removeprefix("www.")
    path = u.path.rstrip("/") or "/"
    return (host if "://" in url else ""), path


def read_rows(path):  # noqa: C901
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = []
        for r in reader:
            r = {k.strip().lower(): v for k, v in r.items() if k}
            # GSC UI exports use "Top pages"/"Top queries"/"CTR"/"Position".
            for alias in ("top pages", "landing page", "landing pages", "url", "address"):
                if "page" not in r and alias in r:
                    r["page"] = r[alias]
            for alias in ("top queries", "queries"):
                if "query" not in r and alias in r:
                    r["query"] = r[alias]
            rows.append(r)
        if rows and "page" not in rows[0] and "query" not in rows[0]:
            sys.exit(f"{path}: no page column (expected page / Top pages / Landing page)")
        return rows


def site_curve(rows):
    buckets = defaultdict(lambda: [0.0, 0.0])
    for r in rows:
        b = min(int(round(r["position"])), 11)
        buckets[b][0] += r["clicks"]
        buckets[b][1] += r["impressions"]
    return {b: c / i for b, (c, i) in buckets.items() if i >= 500}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pages")
    ap.add_argument("--queries")
    ap.add_argument("--brand", default="", help="comma-separated brand terms to exclude")
    ap.add_argument("--min-impressions", type=float, default=300)
    ap.add_argument("--max-position", type=float, default=15)
    ap.add_argument("--top", type=int, default=25)
    a = ap.parse_args()

    brand = [b.strip().lower() for b in a.brand.split(",") if b.strip()]
    merged = {}
    for r in read_rows(a.pages):
        if "page" not in r:
            sys.exit(f"{a.pages}: no page column (expected page / Top pages / Landing page)")
        if not (r.get("page") or "").strip():
            continue
        try:
            c, i, pos = num(r["clicks"]), num(r["impressions"]), num(r["position"])
        except KeyError as e:
            sys.exit(f"missing column {e} in {a.pages}")
        k = norm(r["page"].strip())
        m = merged.setdefault(k, {"page": r["page"].strip(), "clicks": 0.0, "impressions": 0.0, "_posw": 0.0})
        m["clicks"] += c; m["impressions"] += i; m["_posw"] += pos * i
    rows = []
    for m in merged.values():
        m["position"] = m["_posw"] / m["impressions"] if m["impressions"] else 0.0
        m["ctr"] = m["clicks"] / m["impressions"] if m["impressions"] else 0.0
        rows.append(m)

    curve = site_curve(rows) if len([r for r in rows if r["impressions"]]) >= 8 else {}
    brand_re = re.compile(r"\b(" + "|".join(re.escape(b) for b in brand) + r")\b") if brand else None

    def expected(pos):
        fb = fallback_ctr(pos)
        own = curve.get(min(int(round(pos)), 11))
        return (own + fb) / 2 if own is not None else fb

    cannibal, branded_pages = defaultdict(set), set()
    if a.queries:
        for q in read_rows(a.queries):
            query = (q.get("query") or "").lower()
            page = q.get("page") or ""
            if brand_re and brand_re.search(query):
                branded_pages.add(norm(page)[1])
                continue
            if num(q.get("impressions")) >= 100:
                cannibal[query].add(norm(page)[1])

    def short(p):
        return norm(p)[1]

    test, later, skip = [], [], []
    for r in rows:
        exp = expected(r["position"])
        r["expected_ctr"] = exp
        r["gap_clicks"] = max(0.0, (exp - r["ctr"]) * r["impressions"])
        is_home = short(r["page"]) == "/"
        if r["position"] <= 0:
            r["why"] = "no position data"
            skip.append(r)
        elif r["impressions"] < a.min_impressions:
            r["why"] = f"too few impressions (<{a.min_impressions:g}/period) to read a test"
            skip.append(r)
        elif r["position"] > a.max_position:
            r["why"] = "ranks past page 1-2: fix content/links/intent first, title later"
            later.append(r)
        elif r["ctr"] >= exp:
            r["why"] = "already at/above expected CTR: low upside"
            skip.append(r)
        elif is_home or short(r["page"]) in branded_pages:
            r["why"] = "brand-driven page: test last, brand demand skews CTR"
            later.append(r)
        else:
            r["why"] = "TEST: page-1 visibility, CTR below expected"
            test.append(r)

    test.sort(key=lambda r: r["gap_clicks"], reverse=True)
    print("# Title-test priority list\n")
    print("rank | page | impr | ctr | exp_ctr | pos | est. missed clicks/period")
    for i, r in enumerate(test[: a.top], 1):
        print(f"{i} | {short(r['page'])} | {r['impressions']:.0f} | {r['ctr']:.2%} | "
              f"{r['expected_ctr']:.2%} | {r['position']:.1f} | {r['gap_clicks']:.0f}")
    if later:
        print("\n# Not a title problem yet")
        for r in later:
            print(f"- {short(r['page'])} (pos {r['position']:.1f}): {r['why']}")
    if skip:
        print("\n# Skip for now")
        for r in skip:
            print(f"- {short(r['page'])}: {r['why']}")
    clashes = {q: p for q, p in cannibal.items() if len(p) > 1}
    if clashes:
        print("\n# Cannibalization: one query, several pages (consolidate before testing)")
        for q, pages in sorted(clashes.items()):
            print(f"- '{q}': " + ", ".join(sorted(pages)))
    print("\nCurve:", "site+fallback blend" if curve else "fallback only (too little data)")


if __name__ == "__main__":
    main()
