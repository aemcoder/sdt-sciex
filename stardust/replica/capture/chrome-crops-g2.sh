#!/bin/bash
# Header + footer crop gates (pass bar item 5) for a G2 page at one width, from the gate's stitched PNGs.
# Footer band read off the build-side anchor probe (free); header band = live header height (131 @1440, 60 @360).
cd /Users/paolo/stardust/source/180926/sciex/sdt-sciex
S=$1; W=$2; G=stardust/replica/gates/$S-$W; B=http://localhost:8825/$S-proposed.html
[ -f $G/build.png ] || { echo "$S $W: no build.png"; exit 0; }
read FY FH < <(node stardust/scripts/replica/anchor.mjs "$B" --width $W 2>&1 | grep footer | awk '{print $2, $4}')
HH=$([ $W = 1440 ] && echo 131 || echo 60)
node stardust/scripts/replica/crop-compare.mjs $G/live.png $G/build.png --y 0 --height $HH --out $G/chrome-header-diff.png --json > $G/chrome-header.json 2>/dev/null
node stardust/scripts/replica/crop-compare.mjs $G/live.png $G/build.png --y $FY --y-b $FY --height $((FH-1)) --out $G/chrome-footer-diff.png --json > $G/chrome-footer.json 2>/dev/null
python3 -c "
import json,sys
h=json.load(open('$G/chrome-header.json')); f=json.load(open('$G/chrome-footer.json'))
print('$S $W header %.2f%% footer %.2f%% (footer y=$FY h=$FH)' % (h.get('diffPct',h.get('pct',-1)), f.get('diffPct',f.get('pct',-1))))"
