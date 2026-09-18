#!/usr/bin/env python3
"""Derive the --mask spec for pixel-compare from a diff PNG: rows whose differing pixels all sit in
the fixed third-party widget columns (WalkMe copilot tab bottom-left, chat launcher bottom-right),
which repeat at every stitched-chunk seam. Prints the mask spec + the residual (non-widget) count.
  mask-rows-g2.py diff.png <width>"""
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB'); W = int(sys.argv[2]); w, h = im.size
px = im.load()
# widget x-bands (fractions of width; measured 1440: tab x 61–142, launcher x 1350–1418; 360: tab 24–110, launcher 280–350)
bands = [(0.03 * W, 0.11 * W), (0.77 * W, 0.99 * W)] if W < 800 else [(50, 150), (1330, 1430)]
rows = []; other = 0; widget = 0
for y in range(h):
    n = 0; inb = 0
    for x in range(w):
        r, g, b = px[x, y]
        if r > 200 and g < 80 and b < 80:
            n += 1
            if any(a <= x <= c for a, c in bands): inb += 1
    if n and inb == n: rows.append(y); widget += n
    elif n: other += n
# group rows into runs
runs = []
for y in rows:
    if runs and y <= runs[-1][1] + 3: runs[-1][1] = y
    else: runs.append([y, y])
runs = [(a, b) for a, b in runs if b - a >= 20]
print('mask', ','.join(f'{a}:{b - a + 1}' for a, b in runs))
print('widget-row px', widget, 'other px', other, 'runs', len(runs))
