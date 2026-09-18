#!/usr/bin/env python3
"""Harvest every content-root image of the G2 pages into stardust/prototypes/assets/media/g2/.
Dynamic Media renditions: 375 / 1440 / 1920 webp (the widths the two gate breakpoints + the
1920 spot check select); plain DAM assets as-is. Manifest: g2/_manifest.json (url -> local)."""
import json, os, re, sys, urllib.request, urllib.parse
from bs4 import BeautifulSoup
ROOT = '/Users/paolo/stardust/source/180926/sciex/sdt-sciex/'
OUT = ROOT + 'stardust/prototypes/assets/media/g2/'
os.makedirs(OUT, exist_ok=True)
MAN = OUT + '_manifest.json'
man = json.load(open(MAN)) if os.path.exists(MAN) else {}
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
WIDTHS = [375, 1440, 1920]

def fetch(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0: return True
    url = urllib.parse.quote(url, safe=':/?&=%-._~')
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'image/webp,image/*,*/*'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r, open(dest, 'wb') as f: f.write(r.read())
        return True
    except Exception as e:
        print('FAIL', url, e); return False

def clean(name):
    name = re.sub(r'[^A-Za-z0-9._-]+', '-', name).strip('-').lower()
    return name

def dm_base(src):
    # /adobe/dynamicmedia/deliver/dm-aid--<id>/<name>.<ext>?quality=75&width=N
    m = re.match(r'(/adobe/dynamicmedia/deliver/dm-aid--[0-9a-f-]+/)([^?]+)\.(webp|jpg|jpeg|png)(\?.*)?$', src)
    return (m.group(1), m.group(2)) if m else None

for slug in sys.argv[1:]:
    html = open(ROOT + f'stardust/current/pages/{slug}.html').read()
    soup = BeautifulSoup(html, 'html.parser')
    root = soup.select_one('.container-v2.aem-GridColumn')
    urls = set()
    for img in root.find_all('img'):
        for a in ('src', 'data-src'):
            if img.get(a): urls.add(img[a])
        for s in (img.get('srcset') or '').split(','):
            s = s.strip().split(' ')[0]
            if s: urls.add(s)
    for src in root.find_all('source'):
        for s in (src.get('srcset') or '').split(','):
            s = s.strip().split(' ')[0]
            if s: urls.add(s)
    for el in root.find_all(style=True):
        for u in re.findall(r'url\((["\']?)([^)"\']+)\1\)', el['style']): urls.add(u[1])
    for el in root.find_all(attrs={'data-poster': True}): urls.add(el['data-poster'])
    for v in root.find_all('video'):
        if v.get('poster'): urls.add(v['poster'])
    bases = {}
    plain = set()
    for u in urls:
        u = u.replace('&amp;', '&')
        if u.startswith('http') and 'sciex.com' not in u: continue
        if u.startswith('http'): u = urllib.parse.urlparse(u).path + ('?' + urllib.parse.urlparse(u).query if urllib.parse.urlparse(u).query else '')
        b = dm_base(u)
        if b: bases[b] = True
        elif u.startswith('/content/dam'): plain.add(u)
    n = 0
    for (pre, name) in bases:
        stem = clean(name)
        for w in WIDTHS:
            url = f'https://sciex.com{pre}{name}.webp?quality=75&width={w}'
            dest = f'{OUT}{stem}-w{w}.webp'
            if fetch(url, dest): man[url] = f'g2/{stem}-w{w}.webp'; n += 1
        man[f'dm:{pre}{name}'] = f'g2/{stem}'
    for u in plain:
        dest = OUT + clean(os.path.basename(u.split('?')[0]))
        if fetch('https://sciex.com' + u, dest): man['https://sciex.com' + u.split('?')[0]] = 'g2/' + os.path.basename(dest); n += 1
    print(slug, 'dm bases', len(bases), 'plain', len(plain), 'files', n)
json.dump(man, open(MAN, 'w'), indent=1, sort_keys=True)
