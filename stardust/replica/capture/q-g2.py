#!/usr/bin/env python3
"""Query a lift-g2 tokens file.
  q-g2.py <tokens.json> <needle> [props...]      needle matches class / text / path prefix / tag
  q-g2.py <tokens.json> --tree [maxdepth]        outline: path tag.class rect text
Default props: rect + box model + type."""
import json, sys
d = json.load(open(sys.argv[1]))
els = d['els']
DEF = ['display','position','width','height','minHeight','marginTop','marginBottom','marginLeft','marginRight','paddingTop','paddingBottom','paddingLeft','paddingRight','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','gap','columnGap','rowGap','gridTemplateColumns','flexDirection','alignItems','justifyContent','aspectRatio','objectFit','borderRadius','textAlign','transform','opacity','borderTopWidth','boxShadow']
if sys.argv[2] == '--tree':
    md = int(sys.argv[3]) if len(sys.argv) > 3 else 4
    for e in els:
        dep = e['p'].count('/')
        if dep > md: continue
        cls = '.'.join(e['c'].split()[:4])
        print(f"{'  '*dep}{e['p']} {e['t']}.{cls} {e['rect']} {e.get('text','')[:50]}")
    print('docH', d['docH'])
    sys.exit()
needle = sys.argv[2]; props = sys.argv[3:] or DEF
for e in els:
    hit = needle in e.get('c','') or needle in e.get('text','') or e['p'] == needle or e['p'].startswith(needle + '/') or e['t'] == needle
    if not hit: continue
    line = f"{e['p']} <{e['t']}> .{'.'.join(e['c'].split()[:5])} rect={e['rect']} {e.get('text','')[:40]!r}"
    print(line)
    print('   ', ' '.join(f"{k}={e[k]}" for k in props if k in e and e[k] not in ('none','normal','auto','0px','rgba(0, 0, 0, 0)','static','visible','stretch','flex-start','row')))
    for k in ('src','nat','href','svg','poster','backgroundImage'):
        if k in e and e[k] not in ('none',): print('   ', k, '=', str(e[k])[:300])
