#!/usr/bin/env python3
"""Compare top-level component boxes live vs build (lift-g2 outputs). cmp-g2.py live.json build.json [depth]"""
import json, sys
L = json.load(open(sys.argv[1])); B = json.load(open(sys.argv[2])); depth = int(sys.argv[3]) if len(sys.argv) > 3 else 0
def top(d):
    return [e for e in d['els'] if e['p'].count('/') <= depth]
lt, bt = top(L), top(B)
print('docH live', L['docH'], 'build', B['docH'], 'delta', B['docH'] - L['docH'])
li = [e for e in lt if '/' not in e['p']]; bi = [e for e in bt if '/' not in e['p']]
for a, b in zip(li, bi):
    flag = '' if abs(a['rect'][3] - b['rect'][3]) < 1 and abs(a['rect'][1] - b['rect'][1]) < 1 else '  <<<'
    print(f"{a['p']:>3} live y={a['rect'][1]:>6} h={a['rect'][3]:>7}  build y={b['rect'][1]:>6} h={b['rect'][3]:>7}  {'.'.join(a['c'].split()[:1])} / {'.'.join(b['c'].split()[:2])}{flag}")
