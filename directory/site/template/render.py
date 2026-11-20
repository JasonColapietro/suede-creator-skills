"""Render either Suede landing page from its site's own product data."""

import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent
ASSETS = "/assets/suede-landing"
AGENTS = [
    ("Claude Code", "claudecode-color.svg"),
    ("Codex", "codex-color.svg"),
    ("OpenClaw", "openclaw-color.svg"),
    ("Hermes", "hermesagent.svg"),
    ("OpenCode", "opencode.svg"),
    ("Pi", "pi.svg"),
]


def esc(value):
    return html.escape(str(value), quote=True)


def safe_url(value):
    value = str(value).strip()
    parsed = urlsplit(value)
    if parsed.scheme.lower() not in ("", "https", "http", "mailto", "tel"):
        raise ValueError(f"Unsupported link scheme: {parsed.scheme}")
    return esc(value)


def link(pair, css="", extra=""):
    return f'<a href="{safe_url(pair[1])}" class="{css}" {extra}>{esc(pair[0])}</a>'


def image(url, css="", alt="", lazy=False):
    loading = ' loading="lazy"' if lazy else ""
    return f'<img class="{css}" src="{safe_url(url)}" alt="{esc(alt)}"{loading} decoding="async">'


def pair_title(parts):
    return f'{esc(parts[0])} <i>{esc(parts[1])}</i>'


def json_html(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


def render(config):
    c = config
    categories = c["categories"]
    roles = c["roles"]
    if not all(group["items"] for group in categories) or not categories or not roles:
        raise ValueError("Specify at least one populated category and role")
    benefits = c["benefits"]
    if len(benefits) != 3:
        raise ValueError("Specify three benefits")
    brand = esc(c["brand"])
    logo = c["logo"]
    def brand_link():
        return f'<a href="/" class="brand">{image(logo, "brand-mark")}<span>{brand}</span></a>'

    def item_info(item):
        return [item[0], item[1], item[2], item[3] if len(item) > 3 and item[3] else logo]

    groups = [{**group, "items": [item_info(item) for item in group["items"]]} for group in categories]
    agents = [(name, f"{ASSETS}/assets/{file}") for name, file in AGENTS]
    role_entries = []
    for role in roles:
        group = groups[role["category"]]
        scene_items = group["items"][:6]
        role_entries.append({
            "name": role["name"], "tag": role["tag"], "steps": role["steps"],
            "tools": [[item[0], item[3]] for item in scene_items],
            "belt": role.get("belt", group["name"]),
            "more": role.get("more", group.get("more", "Explore the catalog")),
            "foot": role.get("foot", group["name"] + " · " + c["brand"]),
            "cli": role.get("cli", scene_items[0][2].split("://")[-1]),
        })
    first = role_entries[0]
    def tool_buttons(items):
        return "".join(
            f'<button type="button" class="htool" data-tool="{i}" aria-pressed="false" aria-label="Highlight {esc(name)}">{image(icon)}<span>{esc(name)}</span></button>'
            for i, (name, icon) in enumerate(items))
    def step_list(steps):
        return "".join(f'<li class="hst"><span class="step-icon" aria-hidden="true">{image(logo)}</span><span>{esc(step)}</span><i aria-hidden="true">✓</i></li>' for step in steps)
    def card(item):
        name, sub, href, icon = item
        return f'<a class="pcard" href="{safe_url(href)}"><span class="ph">{image(icon, lazy=True)}</span><span class="pt"><b>{esc(name)}</b><small>{esc(sub)}</small></span></a>'

    panels = []
    tabs = []
    for i, group in enumerate(groups):
        label = esc(group["name"])
        tabs.append(f'<button type="button" class="ctab" role="tab" id="tab-{i}" aria-controls="cat-{i}" aria-selected="{str(i == 0).lower()}" tabindex="{0 if i == 0 else -1}">{esc(group.get("short", group["name"]))}</button>')
        off = "" if i == 0 else " off"
        panels.append(f'<h2 class="pcat{off}" data-cat="{i}">{label}</h2><div id="cat-{i}" class="pgrid{off}" data-cat="{i}" aria-label="{label}">{"".join(card(item) for item in group["items"])}</div>')

    # The wall uses actual products and skills from the configured catalog.
    all_items = [item for group in groups for item in group["items"]]
    wall = []
    for i in range(3):
        entries = all_items[i::3][:8] or all_items
        while len(entries) < 6:
            entries = entries + entries
        chips = "".join(f'<span class="kw-chip">{image(item[3], lazy=True)}{esc(item[0])}</span>' for item in entries[:8])
        reverse = ' rev' if i % 2 else ''
        wall.append(f'<div class="kw-row"><div class="kw-track{reverse}" aria-hidden="true"><div>{chips}</div><div>{chips}</div></div></div>')

    def benefit_text(index):
        ben = benefits[index]
        return f'<div class="bentext"><span class="bennum">0{index+1}</span><h2>{pair_title(ben["title"])}</h2><p>{esc(ben["body"])}</p><div class="benmeta">{"".join(f"<span>{esc(tag)}</span>" for tag in ben["tags"])}</div></div>'

    def demo_rows(items):
        return "".join(f'<div class="cap-row"><span class="cap-logo">{image(item[3], lazy=True)}</span><b>{esc(item[0])}</b><small>{esc(item[1])}</small><em>✓</em></div>' for item in items)

    demo_sets = []
    for role in roles:
        group = groups[role["category"]]
        demo_sets.append(dict(ask=role.get("ask", role["steps"][0]), title=group["name"],
                              items=group["items"][:5], result=role.get("result", group["items"][0][0])))
    ledger = c.get("ledger") or [[item[0], "Find", item[1], item[3]] for item in all_items[:5]]
    ledger_rows = "".join(
        f'<div class="lrow"><span class="litem">{image(row[3] if len(row)>3 and row[3] else logo, lazy=True)}<b>{esc(row[0])}</b></span><span class="lprice"><s>{esc(row[1])}</s><em>{esc(row[2])}</em></span></div>' for row in ledger)
    secondary = c.get("secondary", c["nav"][0])
    primary = c["cta"]
    catalog_cta = c.get("catalogCta", primary)
    modal = c.get("modal", {})
    modal_links = modal.get("links", [secondary])
    search = modal.get("search")
    modal_search = ""
    if search:
        modal_search = f'<form method="get" action="{safe_url(search["action"])}"><label for="start-query">{esc(search["label"])}</label><input id="start-query" name="{esc(search["param"])}" placeholder="{esc(search["placeholder"])}" type="search" inputmode="search"><button class="candy" type="submit">{esc(search["submit"])}</button></form>'
    benefits_css = ""
    if c.get("wordmark"):
        benefits_css = f'--mark-length:{max(len(c["wordmark"]),4)}'
    footer = "".join(f'<div class="foot-col"><h2>{esc(group["title"])}</h2>{"".join(link(a) for a in group["links"])}</div>' for group in c["footer"])
    schema = c.get("schema", {"@context":"https://schema.org","@type":"WebSite","name":c["brand"],"url":c["url"],"description":c["description"]})
    share = c.get("socialImage")
    nav_links = []
    for index, entry in enumerate(c["nav"]):
        label, href = entry[:2]
        icon = ''
        if 'github' in href.lower():
            icon = '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#repo-icon"/></svg>'
        elif 'community' in label.lower() or 'discussion' in label.lower():
            icon = '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#chat-icon"/></svg>'
        optional = ' nav-optional' if index < max(0, len(c["nav"])-3) else ''
        nav_links.append(f'<a class="nav-link{optional}" href="{safe_url(href)}">{icon}{esc(label)}</a>')
    values = {
        "support": " ".join(f'data-{key}="{safe_url(value)}"' for key,value in zip(("contact", "help"), c.get("support", []))),
        "style": (HERE / "landing.css").read_text(), "script": (HERE / "landing.js").read_text(),
        "asset": ASSETS, "title": esc(c["title"]), "description": esc(c["description"]), "url": safe_url(c["url"]),
        "logo": safe_url(logo), "share": f'<meta property="og:image" content="{safe_url(share)}"><meta name="twitter:image" content="{safe_url(share)}">' if share else "",
        "schema": json_html(schema), "brand": brand, "brandLink": brand_link(), "nav": "".join(nav_links),
        "cta": link(primary,"candy start", 'data-start'), "kicker":link(c["kicker"]), "secondaryKicker": link(c.get("kickerSecondary", secondary)),
        "headline": esc(c["headline"]), "leadA":esc(c.get("heroLead",["Turn","into"])[0]), "leadB":esc(c.get("heroLead",["Turn","into"])[1]),
        "agentImages": "".join(image(url,alt=name) for name,url in agents[:3]), "allAgents":"".join(image(url,alt=name) for name,url in agents),
        "agentImage":image(agents[0][1]), "firstRole":esc(first["name"]), "firstTag":esc(first["tag"]),
        "steps":step_list(first["steps"]), "tools":tool_buttons(first["tools"]), "belt":esc(first["belt"]),
        "more":esc(first["more"]), "foot":esc(first["foot"]), "cli":esc(first["cli"]), "mark":image(logo),
        "command":esc(c["command"]), "commandLabel":esc(c.get("commandLabel","Give this to your agent")),
        "catalogLabel":esc(c.get("catalogLabel","The catalog")), "tabs":"".join(tabs), "panels":"".join(panels),
        "catalogCta":link(catalog_cta,"ghostbtn"), "catalogMore":esc(c.get("catalogMore","Explore the full catalog")),
        "benefitOne":benefit_text(0), "benefitTwo":benefit_text(1),"benefitThree":benefit_text(2),
        "wall": "".join(wall), "keyText":esc(c.get("keyText", c["brand"].lower().replace(" ","_") + "_")),
        "demoTitle":esc(c.get("demoTitle", "find a match")), "demoRequest":esc(demo_sets[0]["ask"]),
        "capTitle":esc(demo_sets[0]["title"]), "capRows":demo_rows(demo_sets[0]["items"]),
        "capResult":esc(demo_sets[0]["result"]), "capNote":esc(c.get("demoNote", benefits[1]["tags"][0])),
        "ledgerTitle":esc(c.get("ledgerTitle", "workflow")), "ledger":ledger_rows,
        "ledgerNote":esc(c.get("ledgerNote", benefits[2]["tags"][0])),
        "equationTitle":pair_title(c.get("equationTitle", c["closing"])), "equation":"".join(f"<b>{esc(t)}</b>" if i==1 else esc(t) for i,t in enumerate(c["equation"])),
        "equationNote":esc(c.get("equationNote","")), "closing":pair_title(c["closing"]),
        "closeDescription":esc(c.get("closeDescription",c["description"])), "secondary":link(secondary,"ghostbtn"),
        "note":esc(c.get("note","")), "proof":"".join(f"<span>{esc(ben['tags'][0])}</span>" for ben in benefits),
        "footer":footer, "brandCaption":esc(c.get("footerCaption", c["kicker"][0])),
        "wordmark":esc(c.get("wordmark",c["brand"])), "wordmarkStyle":benefits_css,
        "modalTitle":esc(modal.get("title",c["brand"])), "modalDescription":esc(modal.get("description",c["description"])),
        "modalSearch":modal_search, "modalPrimary":link(modal.get("primary",primary), "ghostbtn" if search else "candy"),
        "modalLinks":"".join(link(a,"ghostbtn") for a in modal_links),
        "data":json_html(dict(roles=role_entries,agents=agents[:3],logo=logo,demos=demo_sets,equation=c["equation"])),
    }
    template = (HERE / "landing.html").read_text()
    return re.sub(r"\{\{(\w+)\}\}", lambda match: values[match[1]], template)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("config", type=Path)
    parser.add_argument("output", type=Path)
    options = parser.parse_args()
    options.output.parent.mkdir(parents=True, exist_ok=True)
    options.output.write_text(render(json.loads(options.config.read_text())))
