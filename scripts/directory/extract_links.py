import re, sys, json, collections, pathlib
root = pathlib.Path(sys.argv[1])
pat = re.compile(r'https?://github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)(/(?:tree|blob)/[^\s\)\]>"#]+)?')
skip_owner = {'sponsors','topics','features','orgs','marketplace','apps','settings','collections'}
repo_lists = collections.defaultdict(set)
paths = collections.defaultdict(set)
for readme in root.glob('*/README.md'):
    lst = readme.parent.name
    for m in pat.finditer(readme.read_text(errors='ignore')):
        o, r, p = m.group(1), m.group(2), m.group(3)
        r = re.sub(r'\.git$', '', r)
        if o.lower() in skip_owner: continue
        key = f"{o}/{r}".lower()
        repo_lists[key].add(lst)
        if p: paths[key].add(p)
rows = sorted(repo_lists.items(), key=lambda kv: (-len(kv[1]), kv[0]))
out = [{"repo": k, "lists": sorted(v), "n": len(v), "paths": sorted(paths[k])[:50]} for k, v in rows]
json.dump(out, open(sys.argv[2], 'w'), indent=1)
print(len(out), "repos")
for row in out[:80]: print(row["n"], row["repo"], len(row["paths"]))
