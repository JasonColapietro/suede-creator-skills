#!/usr/bin/env python3
"""Call each title test WIN, LOSS, CONFOUNDED, LOST VISIBILITY, or INCONCLUSIVE.

Usage:
  python3 scripts/title_test_verdict.py TESTS.csv [--alpha 0.05]

TESTS.csv columns (one row per page; equal-length windows, e.g. 14d vs 14d):
  page, group, pre_clicks, pre_impr, pre_pos, post_clicks, post_impr, post_pos
  group = "test" (title changed) or "control" (untouched comparable pages).

Method:
- Difference-in-differences on CTR: effect = (test post - test pre) - (control
  post - control pre), using the pooled control group. Standard error combines
  all four proportions, so a page that only moved with the controls is not a win.
- Holm correction across all test pages in the cohort, so running 25 tests at
  once does not manufacture false wins.
- Position shift over 1.0 = CONFOUNDED (rank moved; CTR not comparable).
- Impressions dropping to near zero = LOST VISIBILITY (check indexing/rewrites).
- Impressions are treated as independent trials, which overstates certainty a
  little; that is why the floor is 1,000 impressions per window and why the
  next cycle re-reads winners.
"""
import argparse
import csv
import math
import sys

REQUIRED = ["page", "group", "pre_clicks", "pre_impr", "pre_pos",
            "post_clicks", "post_impr", "post_pos"]
FLOOR = 1000


def num(v, field, page):
    s = str(v if v is not None else "").replace(",", "").strip()
    if s in ("", "-", "—", "–"):
        return 0.0
    try:
        return float(s)
    except ValueError:
        sys.exit(f"bad number {v!r} in column {field} for {page}")


def phi(z):
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))


def var(c, n):
    if n <= 0:
        return 0.0
    p = (c + 0.5) / (n + 1)  # small continuity tweak keeps 0-click windows usable
    return p * (1 - p) / n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tests")
    ap.add_argument("--alpha", type=float, default=0.05)
    a = ap.parse_args()

    with open(a.tests, newline="", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        cols = [c.strip().lower() for c in (reader.fieldnames or [])]
        missing = [c for c in REQUIRED if c not in cols]
        if missing:
            sys.exit(f"missing columns: {', '.join(missing)}")
        rows = []
        for r in reader:
            r = {(k or "").strip().lower(): v for k, v in r.items()}
            if not any((v or "").strip() for v in r.values() if isinstance(v, str)):
                continue
            g = (r.get("group") or "").strip().lower()
            if g not in ("test", "control"):
                sys.exit(f"group must be 'test' or 'control', got {r.get('group')!r} for {r.get('page')}")
            page = (r.get("page") or "").strip()
            rows.append({"page": page, "group": g,
                         **{k: num(r.get(k), k, page) for k in REQUIRED[2:]}})

    ctrl = [r for r in rows if r["group"] == "control"]
    tests = [r for r in rows if r["group"] == "test"]
    if not tests:
        sys.exit("no test rows")

    cpc = sum(r["pre_clicks"] for r in ctrl); cpi = sum(r["pre_impr"] for r in ctrl)
    cqc = sum(r["post_clicks"] for r in ctrl); cqi = sum(r["post_impr"] for r in ctrl)
    have_ctrl = cpi > 0 and cqi > 0
    c_pre = cpc / cpi if cpi else 0.0
    c_post = cqc / cqi if cqi else 0.0
    c_delta = (c_post - c_pre) if have_ctrl else 0.0
    c_var = (var(cpc, cpi) + var(cqc, cqi)) if have_ctrl else 0.0
    if have_ctrl and cpc == 0:
        print("Warning: control pages had 0 clicks before the change; the control baseline is weak.")
    if have_ctrl:
        print(f"Control CTR: {c_pre:.2%} -> {c_post:.2%} ({c_delta*100:+.2f} pts), "
              f"{len(ctrl)} pages, {cpi:.0f}/{cqi:.0f} impressions")
    else:
        print("No usable control pages: effects are raw before/after and cannot "
              "separate the title from seasonality.")
    print()

    results = []
    for r in tests:
        pc, pi, pp = r["pre_clicks"], r["pre_impr"], r["pre_pos"]
        qc, qi, qp = r["post_clicks"], r["post_impr"], r["post_pos"]
        pre = pc / pi if pi else 0.0
        post = qc / qi if qi else 0.0
        effect = (post - pre) - c_delta
        se = math.sqrt(var(pc, pi) + var(qc, qi) + c_var) if pi and qi else 0.0
        z = effect / se if se else 0.0
        p = 2 * (1 - phi(abs(z)))
        shift = round(qp - pp, 6)
        results.append(dict(r, pre=pre, post=post, effect=effect, z=z, p=p, shift=shift))

    # Holm step-down over pages that are readable (enough impressions, rank stable)
    readable = [x for x in results if min(x["pre_impr"], x["post_impr"]) >= FLOOR
                and abs(x["shift"]) <= 1.0]
    m = len(readable)
    for rank, x in enumerate(sorted(readable, key=lambda x: x["p"])):
        x["holm_alpha"] = a.alpha / (m - rank)
    still = True
    for x in sorted(readable, key=lambda x: x["p"]):
        x["sig"] = still and x["p"] <= x["holm_alpha"]
        still = x["sig"]

    print("page | pre ctr | post ctr | effect vs control | pos shift | z | p | verdict")
    for x in results:
        if x["pre_impr"] >= FLOOR and x["post_impr"] < 0.2 * x["pre_impr"]:
            v = "LOST VISIBILITY (impressions collapsed: check indexing, rewrite, cannibalization)"
        elif min(x["pre_impr"], x["post_impr"]) < FLOOR:
            v = f"INCONCLUSIVE (under {FLOOR} impressions per window; extend)"
        elif abs(x["shift"]) > 1.0:
            v = "CONFOUNDED (rank moved more than 1 position)"
        elif x.get("sig") and x["effect"] > 0:
            v = "WIN (keep new title)"
        elif x.get("sig") and x["effect"] < 0:
            v = "LOSS (revert)"
        else:
            v = "INCONCLUSIVE (no clear difference after correction)"
        print(f"{x['page']} | {x['pre']:.2%} | {x['post']:.2%} | {x['effect']*100:+.2f} pts | "
              f"{x['shift']:+.1f} | {x['z']:+.2f} | {x['p']:.3f} | {v}")
    print(f"\nHolm-corrected across {m} readable test pages at alpha {a.alpha}.")


if __name__ == "__main__":
    main()
