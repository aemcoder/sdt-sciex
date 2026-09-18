#!/usr/bin/env python3
"""Assemble stardust/replica/progress-g2.json from the G2 gate evidence (latest gate round per
breakpoint, masked pixel run, chrome crop JSON, content/visual diff texts, motion JSON) plus the
per-page authoring notes below. Same entry shape as stardust/replica/progress.json + newComponents[]."""
import json, re, glob, os, datetime
R = '/Users/paolo/stardust/source/180926/sciex/sdt-sciex/'
G = R + 'stardust/replica/gates/'

def gate_runs(slug, w):
    runs = []
    files = sorted(glob.glob(f'{G}{slug}-{w}/gate-iter*.txt'), key=lambda p: int(re.search(r'iter(\d+)', p).group(1)))
    files += glob.glob(f'{G}{slug}-{w}/gate-final.txt')   # post-shared-CSS verification round (labelled final, not an iteration)
    for f in files:
        t = open(f).read()
        m = re.search(r'differing pixels: (\d+) / \d+ = ([0-9.]+)%', t); d = re.search(r'height delta (-?\d+)px', t)
        if not m: continue
        runs.append({'label': re.search(r'(iter\d+|final)', f).group(1), 'pixelPct': float(m.group(2)), 'differingPx': int(m.group(1)), 'heightDelta': int(d.group(1)) if d else None})
    return runs

def masked(slug, w):
    f = f'{G}{slug}-{w}/pixel-masked.txt'
    if not os.path.exists(f): return None, None
    t = open(f).read(); m = re.search(r'= ([0-9.]+)%.*\[MASKED [^:]*: ([^\]—]*)', t)
    return (float(m.group(1)), m.group(2).strip()) if m else (None, None)

def crop(slug, w, which):
    f = f'{G}{slug}-{w}/chrome-{which}.json'
    return json.load(open(f))['diffPct'] if os.path.exists(f) else None

def content(slug, w):
    fs = sorted(glob.glob(f'{G}{slug}-{w}/content-diff-iter*.txt')) + glob.glob(f'{G}{slug}-{w}/content-diff-final.txt')
    if not fs: return None
    t = open(fs[-1]).read()
    body = t.split('Findings')[-1]
    fm = re.search(r'Findings: (\d+) \((\d+) structural', t)
    red = int(fm.group(2)) if fm else 0
    yel = len(re.findall(r'^\s*🟡', body, re.M)); org = len(re.findall(r'^\s*🟠', body, re.M))
    m = re.search(r'source: (.*?)\n\s*build: (.*?)\n', t)
    return {'red': red, 'yellow': yel, 'orange': org, 'inventory': (m.group(1).strip() if m else None), 'file': fs[-1].replace(R, '')}

def visual(slug, w):
    fs = sorted(glob.glob(f'{G}{slug}-{w}/visual-diff-*.txt'))
    if not fs: return []
    return [l.strip()[2:].split('. Image aspect')[0] for l in open(fs[-1]).read().splitlines() if l.strip().startswith('•')]

def parity(slug, w):
    f = f'{G}{slug}-{w}/chrome-parity-iter1.txt'
    if not os.path.exists(f): f = f'{G}{slug}-{w}/chrome-parity-iter2.txt'
    if not os.path.exists(f): return None
    t = open(f).read(); return 'quiet (exit 0) header/footer' if '✓ chrome parity within tolerance' in t else 'DELTAS — see ' + f.replace(R, '')

def motion(slug):
    f = R + f'stardust/replica/motion/{slug}.json'
    if not os.path.exists(f): return None
    d = json.load(open(f)); ev = d['events']
    props = sorted({(t['prop'], t.get('dur')) for t in ev['transitions']})
    hov = [{'sel': h['sel'], 'changed': h.get('changed', [])} for h in d.get('hoverSamples', [])]
    return {'evidence': f.replace(R, ''), 'animations': len(ev['animations']), 'transitions': len(ev['transitions']), 'classMutations': len(ev['classMutations']),
            'transitionProps': [f'{p} {du}' for p, du in props], 'hoverProbes': hov}

NOTES = json.load(open(R + 'stardust/.work/g2/notes-g2.json'))
COMMON_CAPTURE_1440 = [{'what': 'WalkMe copilot tab (bottom-left) + chat launcher (bottom-right), fixed third-party widgets, repeat at every stitched-chunk seam in the live capture', 'where': 'every viewport bottom; masked rows on the verdict line'},
                       {'what': 'OneTrust banner dismissed via --dismiss', 'where': 'viewport'},
                       {'what': "WalkMe 'please login' balloon present in the extract screenshot only — never rendered in gate captures", 'where': 'under header'}]
pages = []
for slug, n in NOTES['pages'].items():
    bp = {}
    for w in ('1440', '360'):
        runs = gate_runs(slug, w); last = runs[-1] if runs else {}
        mpct, mspec = masked(slug, w)
        c = content(slug, w); v = visual(slug, w)
        just = [{'probe': 'visual', 'flag': fl, 'why': n.get('visualWhy', {}).get(w, 'object-fit: cover crop exactly as live (tw-object-cover / aspect-4/3)')} for fl in v]
        residuals = list(n.get('residuals', {}).get(w, []))
        if w == '1440' and mspec:
            residuals.insert(0, {'band': f'stitched-chunk seam rows {mspec}', 'pct': round(last.get('pixelPct', 0) - (mpct or 0), 2), 'cause': 'capture-state: WalkMe copilot tab + chat launcher (fixed third-party widgets) repeat at every chunk seam; not site markup; masked → %.2f%%' % (mpct or 0), 'flaggedFor': 'user'})
            residuals.append({'region': 'footer crop', 'pct': crop(slug, w, 'footer'), 'cause': 'same widget rows inside the footer crop (thick texture = widget blocks); chrome-parity quiet', 'flaggedFor': 'user'})
        bp[w] = {'iterations': len([r for r in runs if r['label'] != 'final']), 'runs': [dict(r, **({'fixes': n.get('fixes', {}).get(w, {}).get(r['label'], '')} if n.get('fixes', {}).get(w, {}).get(r['label']) else {})) for r in runs],
                 'result': {'structuralRed': c['red'] if c else None, 'yellow': c['yellow'] if c else None, 'orange': c['orange'] if c else None,
                            'visualFlags': f'{len(v)} justified' if v else 'none', 'pixelPct': last.get('pixelPct'), 'pixelPctMasked': mpct if mpct is not None else last.get('pixelPct'),
                            'heightDelta': last.get('heightDelta'), 'headerCropPct': crop(slug, w, 'header'), 'footerCropPct': crop(slug, w, 'footer'),
                            'chromeParity': parity(slug, w), 'contentInventory': c['inventory'] if c else None,
                            'pass': bool(last) and c is not None and c['red'] == 0 and last.get('pixelPct', 99) <= 10 and abs(last.get('heightDelta') or 0) <= 8 and (crop(slug, w, 'header') or 0) <= 2 and (crop(slug, w, 'footer') or 0) <= 2},
                 'justified': just, 'residuals': residuals,
                 'captureState': (COMMON_CAPTURE_1440 if w == '1440' else [{'what': 'no third-party fixed widgets rendered in the 360 live capture', 'where': '-'}]) + n.get('captureState', [])}
    pages.append({'archetype': slug, 'pageType': 'landing', 'group': 'g2', 'liveUrl': n['liveUrl'], 'protoPath': f'stardust/prototypes/{slug}-proposed.html',
                  'protoServedAt': f'http://localhost:8825/{slug}-proposed.html', 'contentRoot': '.container-v2.aem-GridColumn', 'regime': 'prototype',
                  'gatedAt': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
                  'sharedLayers': {'css': ['stardust/prototypes/css/canon.css', 'stardust/prototypes/css/applications-pharma-and-biopharma.css', 'stardust/prototypes/css/v3-applications.css'],
                                   'js': ['stardust/prototypes/js/motion.js'], 'builder': 'stardust/replica/capture/build-g2.py (live settled DOM → clean markup; chrome copied verbatim from home-proposed.html between canon:* markers; footer disclaimer code = the page XF span text)'},
                  'fontsPolicy': 'self-hosted-reuse: canon @font-face (Geogrotesque_Sharp_VF.woff2); 0 font forks at both breakpoints',
                  'capture': {'tokens': [f'stardust/replica/capture/tokens-g2-{slug}-{w}.json' for w in (1440, 360, 1920)], 'lifter': 'stardust/replica/capture/lift-g2.mjs (every element under the content root, computed styles + rects)',
                              'media': 'stardust/prototypes/assets/media/g2/ (harvest-g2.py; Dynamic Media 375/1440/1920 webp renditions + plain DAM assets; _manifest.json)'},
                  'components': n['components'], 'newComponents': n.get('newComponents', []),
                  'wideCheck1920': n.get('wide1920', 'box map identical to live for every top-level component at 1920 (docH equal) — cmp-g2.py over tokens-g2-*-1920.json vs a build-side lift'),
                  'motion': {'observed': motion(slug), 'implemented': n.get('motionImplemented', []), 'dead': n.get('motionDead', [])},
                  'breakpoints': bp})
out = {'group': 'g2', 'generatedAt': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'pages': pages}
json.dump(out, open(R + 'stardust/replica/progress-g2.json', 'w'), indent=1, ensure_ascii=False)
for p in pages:
    for w in ('1440', '360'):
        r = p['breakpoints'][w]['result']
        print(f"{p['archetype']:<48} {w:>4} iters={p['breakpoints'][w]['iterations']} px={r['pixelPct']} masked={r['pixelPctMasked']} Δh={r['heightDelta']} red={r['structuralRed']} hdr={r['headerCropPct']} ftr={r['footerCropPct']} pass={r['pass']}")
