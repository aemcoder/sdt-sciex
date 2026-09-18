#!/usr/bin/env python3
"""Assemble stardust/prototypes/<slug>-proposed.html for the G2 "applications" group.

Every string is copied verbatim from the settled live DOM (stardust/current/pages/<slug>.html);
the live Tailwind utility DOM is re-expressed as clean semantic markup + BEM classes whose CSS
(css/v3-applications.css) carries the lifted values. Chrome (header, footer-spacer, support band,
footer) is copied VERBATIM from the gated home prototype between canon:* markers (same technique as
splice-chrome-pharma.py); the footer disclaimer code is the page's own XF variant.

  python3 build-g2.py <slug> [<slug> ...]
"""
import json, os, re, sys, html as H
from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = '/Users/paolo/stardust/source/180926/sciex/sdt-sciex/'
PROTO = ROOT + 'stardust/prototypes/'
MAN = json.load(open(PROTO + 'assets/media/g2/_manifest.json'))
HOME = open(PROTO + 'home-proposed.html').read()
HDR = re.search(r'<header class="site-header".*?</header>', HOME, re.S).group(0)
FTR = re.search(r'<div class="footer-spacer".*?</footer>', HOME, re.S).group(0)
PLYR_SPRITE = open(ROOT + 'stardust/replica/capture/plyr-sprite.svg').read() if os.path.exists(ROOT + 'stardust/replica/capture/plyr-sprite.svg') else ''

# ---- live SVGs, harvested verbatim from the settled DOM (data-di-* stripped) ----------------
SVG_HOME = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.33398 13.0039V5.67057L8.00065 2.00391L12.6673 5.67057V13.0039H9.33398V8.67057H6.66732V13.0039H3.33398Z" stroke="currentColor"></path></svg>'
SVG_CHEV = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.75 10.5L8.25 6L3.75 1.5" stroke="currentColor"></path></svg>'
SVG_ARROW = '<svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 7L15 7" stroke="currentColor"></path><path d="M9 1L15 7L9 13" stroke="currentColor"></path></svg>'

TEXT_MAP = {'text-alfa': 't-alfa', 'text-bravo': 't-bravo', 'text-charlie': 't-charlie', 'text-delta': 't-delta', 'text-echo': 't-echo',
            'text-echo-bolder': 't-echo-bolder', 'text-lg': 't-lg', 'text-lg-bolder': 't-lg-bolder', 'text-base': 't-base',
            'text-base-bolder': 't-base-bolder', 'text-sm': 't-sm', 'text-sm-bolder': 't-sm-bolder', 'text-xs': 't-xs'}

def tclass(el):
    for c in el.get('class', []):
        if c in TEXT_MAP: return TEXT_MAP[c]
    return ''

def classes(el): return el.get('class', []) if isinstance(el, Tag) else []
def has(el, c): return c in classes(el)
def sec_pad(el):
    """Section padding modifiers from the live tw-pt/pb utilities."""
    cs = classes(el); mods = []
    if 'tw-pt-0' in cs and 'md:tw-pt-48' not in cs: mods.append('sec--pt0')
    if 'tw-pb-0' in cs and 'md:tw-pb-48' not in cs: mods.append('sec--pb0')
    if 'tw-pb-24' in cs and 'md:tw-pb-32' in cs: mods.append('sec--pb24-32')
    if 'tw-pt-24' in cs and 'md:tw-pt-32' in cs: mods.append('sec--pt24-32')
    if 'tw-pt-16' in cs and 'md:tw-pt-24' in cs: mods.append('sec--pt16-24')
    return ' '.join(mods)

def clean_svg(svg):
    s = str(svg)
    s = re.sub(r'\s(data-di-[a-z-]+|class|xmlns:xlink)="[^"]*"', '', s)
    s = re.sub(r'>\s+<', '><', s)
    return s

def inner_html(el):
    """Verbatim inner markup of a richtext node (tags + entities as captured), tailwind noise removed."""
    out = []
    for ch in el.children:
        if isinstance(ch, NavigableString): out.append(H.escape(str(ch), quote=False).replace('\xa0', '&nbsp;'))
        else:
            s = str(ch)
            s = re.sub(r'\s(data-di-[a-z-]+|data-di-rand)="[^"]*"', '', s)
            out.append(s.replace('\xa0', '&nbsp;'))
    return ''.join(out).strip()

def text(el): return H.escape(el.get_text(strip=True), quote=False)

def picture(el, img_class='', extra=''):
    """Live <picture>/<img> -> local harvested renditions (375 / 1440 / 1920 for Dynamic Media)."""
    img = el if el.name == 'img' else el.find('img')
    src = img.get('src') or ''
    alt = H.escape(img.get('alt') or '', quote=True)
    m = re.match(r'(?:https?://sciex\.com)?(/adobe/dynamicmedia/deliver/dm-aid--[0-9a-f-]+/)([^?]+)\.(webp|jpg|jpeg|png)', src)
    if m:
        stem = MAN.get(f'dm:{m.group(1)}{m.group(2)}')
        if not stem: raise SystemExit('unharvested DM asset ' + src)
        p = f'assets/media/{stem}'
        return (f'<picture><source media="(max-width: 375px)" srcset="{p}-w375.webp" type="image/webp">'
                f'<source media="(max-width: 1440px)" srcset="{p}-w1440.webp" type="image/webp">'
                f'<img src="{p}-w1920.webp" alt="{alt}"{(" class=%s" % chr(34) + img_class + chr(34)) if img_class else ""}{extra}></picture>')
    key = 'https://sciex.com' + src.split('?')[0] if src.startswith('/') else src.split('?')[0]
    loc = MAN.get(key)
    if not loc: raise SystemExit('unharvested asset ' + src)
    return f'<img src="assets/media/{loc}" alt="{alt}"{(" class=%s" % chr(34) + img_class + chr(34)) if img_class else ""}{extra}>'

def link_arrow(a, extra_cls=''):
    label = a.select_one('span')
    href = a.get('href', '#'); tgt = a.get('target', '_self')
    cls = 'link-arrow' + (' ' + extra_cls if extra_cls else '')
    return (f'<a class="{cls}" href="{href}" target="{tgt}"><div class="link-arrow__label"><span>{text(label)}</span>'
            f'<span class="link-arrow__underline"></span></div>{SVG_ARROW}</a>')

def button(a):
    cs = classes(a)
    kind = 'btn-primary' if 'tw-bg-blue-700' in cs else 'btn-secondary'
    label = a.select_one('span')
    href = a.get('href', '#'); tgt = a.get('target', '_self')
    return f'<a class="{kind}" href="{href}" target="{tgt}"><div class="btn-primary__inner"><span>{text(label)}</span>{SVG_ARROW}</div></a>'

# ---- atomic children (shared by text containers and split columns) -------------------------
def atomic_blocks(container, ctx):
    """container = .cmp-container. Returns the .ab blocks in live order."""
    out = []
    for ch in container.find_all(recursive=False):
        if not isinstance(ch, Tag): continue
        if has(ch, 'atomic-media'):
            out.append(media_block(ch, ctx)); continue
        if not has(ch, 'atomic-child'): raise SystemExit(f'unknown atomic child {classes(ch)} in {ctx}')
        inner = ch.find(recursive=False)
        if inner is None and not ch.get_text(strip=True): continue   # empty authored slot, 0 px on live
        # heading (wrapped once more in a bare div for .atomic-heading)
        head = ch.select_one('.atomic-heading, .atomic-heading-minimal')
        rich = ch.select_one('.atomic-richtext-content, .atomic-textarea-minimal, .atomic-textarea')
        btns = ch.select_one('.atomic-buttons')
        res = ch.select_one('.atomic-resource-list')
        ticks = ch.select_one('.atomic-tick-list')
        imgw = inner if (inner and inner.find('img', recursive=False) is not None) else None
        if head is not None:
            parts = []
            for h in head.find_all(recursive=False):
                if h.name in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'):
                    tc = tclass(h); col = ' c-grey-500' if 'tw-text-grey-500' in classes(h) else ''
                    parts.append(f'<{h.name} class="{tc}{col}">{inner_html(h)}</{h.name}>')
                else: raise SystemExit(f'heading child {h.name} in {ctx}')
            out.append(f'<div class="ab ab--heading">{"".join(parts)}</div>')
        elif rich is not None:
            tc = tclass(rich) or 't-base'
            out.append(f'<div class="ab ab--rich richtext {tc}">{inner_html(rich)}</div>')
        elif btns is not None:
            items = ''.join(f'<div class="ab__btn{" ab__btn--link" if "tw-inline-flex" in classes(a) else ""}">{link_arrow(a) if "tw-inline-flex" in classes(a) else button(a)}</div>' for a in btns.select('a'))
            out.append(f'<div class="ab ab--buttons">{items}</div>')
        elif res is not None:
            box = res.find(recursive=False)
            title = box.find('p', recursive=False)
            lis = []
            for li in box.select('ul > li'):
                icon = li.find('svg')
                a = li.find('a')
                lis.append(f'<li><span class="resources__icon">{clean_svg(icon)}</span>{link_arrow(a, "link-arrow--bold")}</li>')
            out.append(f'<div class="ab ab--resources"><div class="resources"><p class="resources__title t-base-bolder">{inner_html(title)}</p>'
                       f'<ul class="resources__list">{"".join(lis)}</ul></div></div>')
        elif ticks is not None:
            ul = ticks.find('ul')
            lis = []
            for li in ul.find_all('li', recursive=False):
                icon = li.find('svg')
                txt = ''.join(H.escape(str(x), quote=False) if isinstance(x, NavigableString) else '' for x in li.children).strip()
                lis.append(f'<li><span class="ticks__icon">{clean_svg(icon)}</span>{txt}</li>')
            out.append(f'<div class="ab ab--ticks"><ul class="ticks t-base">{"".join(lis)}</ul></div>')
        elif imgw is not None:
            img = imgw.find('img', recursive=False)
            out.append(f'<div class="ab ab--image">{picture(img, "split__img")}</div>')
        else:
            raise SystemExit(f'unhandled atomic child in {ctx}: {str(ch)[:300]}')
    return ''.join(out)

def media_block(am, ctx):
    """Live .atomic-media = Splide fade carousel with n slides (1 captured everywhere in this group)."""
    slides = am.select('.splide__list > li')
    inner = []
    for li in slides:
        pl = li.select_one('.plyr')
        if pl is not None: inner.append(plyr_block(pl, ctx))
        elif li.find('picture') is not None: inner.append(picture(li.find('picture'), 'media-frame__img'))
        elif li.find('img') is not None: inner.append(picture(li.find('img'), 'media-frame__img'))
        # empty slide (captured as such on live) -> nothing
    n = len(slides)
    lis = ''.join(f'<li class="media-frame__slide">{x}</li>' for x in inner) or '<li class="media-frame__slide"></li>' * n
    return (f'<div class="ab ab--media"><div class="media-frame" data-items="{n}">'
            f'<ul class="media-frame__track">{lis}</ul><div class="media-frame__pager"></div></div></div>')

def plyr_block(pl, ctx):
    """Plyr video player, captured paused/stopped state. DOM mirrored verbatim (controls, hidden
    settings menu, sr-only labels) so content-diff sees the same widget; CSS ported (v3-applications.css
    PORTED:plyr block). The 134 MB mp4 is NOT harvested (delivery asset) -> <source> omitted, poster kept."""
    s = str(pl)
    s = re.sub(r'\s(data-di-[a-z-]+|data-di-rand)="[^"]*"', '', s)
    s = re.sub(r'<source[^>]*>', '', s)
    s = re.sub(r'\s+', ' ', s)
    # poster + data-poster -> local
    def loc(m):
        u = m.group(0)
        key = 'https://sciex.com' + re.search(r'/content/dam[^"&)]+', u).group(0)
        return u.replace(re.search(r'/content/dam[^"&)]+', u).group(0), 'assets/media/' + MAN[key])
    s = re.sub(r'/content/dam/[^"&)]+', loc, s)
    s = s.replace('<video class="js-video-player"', '<video class="js-video-player media-frame__video"')
    return s

# ---- components -----------------------------------------------------------------------------
def c_breadcrumb(comp, ctx):
    lis = comp.select('ol > li')
    items = [f'<li><a class="breadcrumb__home" href="/" aria-label="Go to homepage">{SVG_HOME}</a></li>']
    for i, li in enumerate(lis[1:], 1):
        a = li.find('a'); last = (i == len(lis) - 1)
        items.append(f'<li{" aria-current=%spage%s" % (chr(34), chr(34)) if last else ""} itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">'
                     f'<div class="breadcrumb__sep">{SVG_CHEV}</div><a class="breadcrumb__link" href="{a.get("href")}"><span itemprop="name">{text(a)}</span></a>'
                     f'<meta itemprop="position" content="{i}"></li>')
    return ('<nav class="breadcrumb" aria-label="Breadcrumb" data-section="breadcrumb" data-intent="navigate" data-layout="contained" data-canon>\n'
            f'  <div class="container">\n    <ol class="breadcrumb__list">\n      ' + '\n      '.join(items) + '\n    </ol>\n  </div>\n</nav>\n')

def c_hero_text(comp, ctx):
    sec = comp.find('section')
    cs = classes(sec)
    pb = ' hero-text--pb' if 'tw-pb-32' in cs else ''
    h1 = comp.find('h1')
    lede = h1.find_next_sibling('div') if h1 else None
    lede_html = f'<div class="hero-text__lede-wrap"><div class="hero-text__lede richtext t-base" data-slot="lede">{inner_html(lede.find(recursive=False) or lede)}</div></div>' if lede else ''
    return (f'<section class="hero-text container{pb}" data-section="hero-text" data-intent="value proposition" data-layout="contained" data-media="none" data-module="hero-text">\n'
            f'  <div class="hero-text__row"><div class="hero-text__cols"><div class="hero-text__col">\n'
            f'    <h1 class="t-alfa" data-slot="title">{inner_html(h1)}</h1>\n    {lede_html}\n  </div></div></div>\n</section>\n')

def c_hero_small(comp, ctx):
    pic = comp.find('picture')
    inner = comp.select_one('.tw-container')
    col = inner.select_one('.tw-w-full')
    content = ''
    for ch in col.find_all(recursive=False):
        if ch.name in ('h1', 'h2', 'h3', 'p'):
            content += f'<{ch.name} class="{tclass(ch)} hero-small__title">{inner_html(ch)}</{ch.name}>'
        else:
            parts = []
            for x in ch.find_all(recursive=False):
                if x.name == 'a': parts.append(button(x))
                elif x.name in ('h1', 'h2', 'h3', 'p', 'div'): parts.append(f'<{x.name} class="{tclass(x)}">{inner_html(x)}</{x.name}>')
            content += f'<div class="hero-small__actions">{"".join(parts)}</div>'
    fixed = ' hero-small--h512' if 'hero' in PAGE_KINDS else ''
    overlay = '<div class="hero-small__overlay" aria-hidden="true"></div>' if comp.select_one('.overlay') is not None else ''   # live clientlib-hero.min.css (loaded by the `hero` component): .hero-small{height:512px}
    return (f'<section class="hero-small{fixed}" data-section="hero-small" data-intent="emotional hook" data-layout="full-bleed" data-media="image" data-module="hero-small">\n'
            f'  <div class="hero-small__frame">\n    {picture(pic, "hero-small__img", " fetchpriority=%shigh%s" % (chr(34), chr(34)))}{overlay}\n'
            f'    <div class="container hero-small__inner"><div class="hero-small__row"><div class="hero-small__col">{content}</div></div></div>\n'
            f'  </div>\n</section>\n')

def c_hero_shell(comp, ctx):
    # live `hero` component renders only a <link rel=stylesheet clientlib-hero.min.css> (0 px) — its only effect is .hero-small{height:512px}
    return '<div class="hero-shell" data-section="hero" data-deviation="live hero component is an empty stylesheet loader; its .hero-small{height:512px} rule is carried by .hero-small--h512"></div>\n'

def c_text_1col(comp, ctx, align='left'):
    sec = comp.find('section')
    cont = comp.select_one('.atomic-container .cmp-container')
    mods = sec_pad(sec)
    al = ' textblock--center' if align == 'center' else ''
    sid = cont.get('id') if cont and cont.get('id') and not cont['id'].startswith('atomiccontainer-') else None
    idattr = f' id="{sid}"' if sid else ''
    acol = comp.select_one('.atomic-container')
    bt = ' textblock__col--bt' if has(acol, 'atomic-container-border-t') else ''
    if not sid and sec.get('id'): idattr = f' id="{sec.get(chr(105)+chr(100))}"'
    return (f'<section class="textblock textblock--1col{al} sec {mods}"{idattr} data-section="text" data-intent="explain mechanic" data-layout="contained" data-module="text-container">\n'
            f'  <div class="container"><div class="textblock__row"><div class="textblock__col{bt}"><div>\n    {atomic_blocks(cont, ctx)}\n  </div></div></div></div>\n</section>\n')

def c_text_2col(comp, ctx):
    sec = comp.find('section')
    mods = sec_pad(sec)
    cols = comp.select('.atomic-container')
    colhtml = ''
    for col in cols:
        cont = col.select_one('.cmp-container')
        colhtml += f'    <div class="textblock__col textblock__col--half"><div>{atomic_blocks(cont, ctx) if cont else ""}</div></div>\n'
    return (f'<section class="textblock textblock--2col sec {mods}" data-section="text" data-intent="explain mechanic" data-layout="split" data-module="text-container">\n'
            f'  <div class="container"><div class="textblock__row">\n{colhtml}  </div></div>\n</section>\n')

def c_split(comp, ctx, side):
    row = comp.select_one('.tw-container')
    cols = []
    for col in row.find_all(recursive=False):
        cont = col.select_one('.cmp-container')
        kind = 'content' if has(col, 'split-component-content') else 'media'
        cols.append(f'    <div class="split__{kind}">{atomic_blocks(cont, ctx)}</div>\n')
    return (f'<section class="split split--{side} sec" data-section="split-{side}" data-intent="value proposition" data-layout="split-media" data-module="split-{side}">\n'
            f'  <div class="container split__row">\n{"".join(cols)}  </div>\n</section>\n')

def c_ghost(comp, ctx):
    return '<div class="ghost" aria-hidden="true" data-section="ghost"></div>\n'

def c_media_card(comp, ctx):
    sec = comp.find('section'); scs = classes(sec)
    tight = ' media-cards--tight' if 'tw-pt-16' in scs else ''
    grid = comp.select_one('.tw-grid')
    g2 = ' media-cards__grid--2' if 'lg:tw-grid-cols-4' not in classes(grid) else ''
    head = None
    for d in comp.select('.tw-container > div'):
        if d is not grid and d.find(['h1', 'h2', 'h3', 'h4']): head = d
    hh = ''
    if head is not None:
        h = head.find(['h1', 'h2', 'h3', 'h4'])
        rule = ' media-cards__head--rule' if 'tw-border-t' in classes(head) else ''
        hh = f'<div class="media-cards__head{rule}"><{h.name} class="{tclass(h)}">{inner_html(h)}</{h.name}></div>'
    cards = []
    for it in comp.select('.media-card-item'):
        media = it.select_one('.tw-aspect-4\\/3')
        a = media.find('a') if media else None
        pic = (media.find('picture') or media.find('img')) if media else None
        body = it.select_one('.media-card-text')
        title = body.find(recursive=False)
        rich = body.select_one('.atomic-richtext-content')
        link = body.find('a', recursive=False)
        mb0 = ' media-cards__item--mb0' if ('tw-mb-0' in classes(it) and 'tw-mb-32' not in classes(it)) else ''
        mhtml = f'<div class="card__media"><a href="{a.get("href")}" target="{a.get("target", "_self")}">{picture(pic)}</a></div>' if a else (f'<div class="card__media">{picture(pic)}</div>' if pic else '')
        cards.append(f'<div class="card media-cards__item{mb0}" data-fragment="media-card">{mhtml}<div class="card__body">'
                     f'<div class="card__title {tclass(title)}">{inner_html(title)}</div>'
                     f'<div class="card__text richtext {tclass(rich) or "t-base"}">{inner_html(rich)}</div>'
                     f'{link_arrow(link) if link else ""}</div></div>')
    return (f'<section class="media-cards sec{tight}" data-section="media-cards" data-intent="value proposition" data-layout="grid" data-items="{len(cards)}" data-media="image" data-module="media-card">\n'
            f'  <div class="container">\n    {hh}\n    <div class="media-cards__grid{g2}">\n      ' + '\n      '.join(cards) + '\n    </div>\n  </div>\n</section>\n')

def c_media_image(comp, ctx):
    pic = comp.find('picture') or comp.find('img')
    return ('<section class="page-image sec" data-section="page-image" data-intent="emotional hook" data-layout="full-bleed" data-media="image" data-module="media-image">\n'
            f'  <div><div><div class="page-image__frame">{picture(pic)}</div></div></div>\n</section>\n')

def c_image_card(comp, ctx):
    sec = comp.find('section'); sid = f' id="{sec.get("id")}"' if sec.get('id') else ''
    head = comp.select_one('.tw-container > div.tw-flex-col')
    hh = ''
    if head is not None:
        parts = ''.join(f'<{x.name} class="{tclass(x)}">{inner_html(x)}</{x.name}>' for x in head.find_all(recursive=False) if x.name in ('h1', 'h2', 'h3', 'p'))
        hh = f'<div class="app-cards__head">{parts}</div>'
    cards = []
    for it in comp.select('.tw-grid > div'):
        media = it.find(recursive=False); a = media.find('a'); img = media.find('picture') or media.find('img')
        body = it.find_all(recursive=False)[1]
        title = body.find(recursive=False); rich = body.select_one('.atomic-richtext-content'); link = body.find('a', recursive=False)
        mhtml = f'<div class="card__media"><a href="{a.get("href")}" target="{a.get("target", "_self")}" aria-label="{text(link.select_one("span")) if link else ""}">{picture(img)}</a></div>' if a else f'<div class="card__media">{picture(img)}</div>'
        cards.append(f'<div class="card" data-fragment="application-card">{mhtml}<div class="card__body">'
                     f'<div class="card__title {tclass(title)}">{inner_html(title)}</div>'
                     f'<div class="card__text richtext {tclass(rich) or "t-base"}">{inner_html(rich)}</div>{link_arrow(link) if link else ""}</div></div>')
    return (f'<section class="app-cards sec"{sid} data-section="applications" data-intent="value proposition" data-layout="grid" data-items="{len(cards)}" data-media="image" data-module="image-card-grid">\n'
            f'  <div class="container">\n    {hh}\n    <div class="app-cards__grid">\n      ' + '\n      '.join(cards) + '\n    </div>\n  </div>\n</section>\n')

def c_events_row(comp, ctx):
    head = comp.select_one('.tw-container > div')
    h = head.find(['h2', 'h3'])
    hh = f'<div class="events__head"><{h.name} class="{tclass(h)}">{inner_html(h)}</{h.name}></div>'
    rows = comp.select('.tw-container > div')[1:]
    out = []
    for i, row in enumerate(rows):
        a = row.find('a', recursive=False)
        cols = a.find_all(recursive=False)
        thumb = cols[0].find('picture') or cols[0].find('img')
        meta, body = cols[1].find_all(recursive=False)
        kicker = meta.find('p'); icons = meta.find_all('span')
        ic = ''.join(f'<span class="events__icon events__icon--{"lg" if k == 0 else "sm"}">{clean_svg(sp.find("svg"))}</span>' for k, sp in enumerate(icons))
        bps = body.find_all('p', recursive=False)
        cta = cols[2].find(recursive=False); lbl = cta.select_one('span')
        last = ' events__row--last' if i == len(rows) - 1 else ''
        out.append(f'<div class="events__row{last}"><a class="events__item" href="{a.get("href")}" target="{a.get("target", "_self")}">'
                   f'<div class="events__thumb-col"><div class="events__thumb">{picture(thumb)}</div></div>'
                   f'<div class="events__mid"><div class="events__meta t-sm"><p class="events__status">{inner_html(kicker)}</p><div>{ic}</div></div>'
                   f'<div class="events__body"><p class="events__kicker t-sm">{inner_html(bps[0])}</p><p class="events__title t-lg">{inner_html(bps[1])}</p></div></div>'
                   f'<div class="events__cta"><div class="link-arrow"><div class="link-arrow__label"><span>{text(lbl)}</span><span class="link-arrow__underline"></span></div>{SVG_ARROW}</div></div>'
                   f'</a></div>')
    return (f'<section class="events sec" data-section="events" data-intent="drive action" data-layout="contained" data-items="{len(rows)}" data-media="image" data-module="events-row">\n'
            f'  <div class="container">\n    {hh}\n    ' + '\n    '.join(out) + '\n  </div>\n</section>\n')

def c_image_text_2col(comp, ctx):
    wrap = comp.select_one('.tw-container > div')
    kids = wrap.find_all(recursive=False)
    head = kids[0] if not has(kids[0], 'image-text-2-col-content') else None
    hh = ''
    if head is not None:
        parts = ''.join(f'<{x.name} class="{tclass(x)}">{inner_html(x)}</{x.name}>' for x in head.find_all(recursive=False) if x.name in ('h1', 'h2', 'h3', 'p'))
        hh = f'<div class="imgtext__head">{parts}</div>'
    items = []
    for it in comp.select('.image-text-2-col-content'):
        thumb, textcol = it.find_all(recursive=False)[:2]
        a = thumb.find('a'); img = thumb.find('picture') or thumb.find('img')
        th = f'<div class="imgtext__thumb"><a href="{a.get("href")}" target="{a.get("target", "_self")}">{picture(img)}</a></div>' if a else f'<div class="imgtext__thumb">{picture(img)}</div>'
        inner = textcol.find(recursive=False)
        title = inner.find(['p', 'h3', 'h4', 'div'], recursive=False)
        rich = inner.select_one('.atomic-richtext-content')
        link = textcol.find('a', recursive=False)
        items.append(f'<div class="imgtext__item">{th}<div class="imgtext__text"><div>'
                     f'<{title.name} class="imgtext__title t-lg-bolder">{inner_html(title)}</{title.name}>'
                     f'<div class="imgtext__body richtext {tclass(rich) or "t-base"}">{inner_html(rich)}</div></div>{link_arrow(link) if link else ""}</div></div>')
    mods = sec_pad(comp.find('section'))
    return (f'<section class="imgtext sec {mods}" data-section="image-text" data-intent="value proposition" data-layout="grid" data-items="{len(items)}" data-media="image" data-module="image-text-2-col">\n'
            f'  <div class="container"><div class="imgtext__wrap">\n    {hh}\n    ' + '\n    '.join(items) + '\n  </div></div>\n</section>\n')

def c_spacer(comp, ctx):
    # live .spacer renders a 1px-tall empty div at both widths (lift) — an authoring spacer with no visible paint
    return '<div class="spacer" data-section="spacer" aria-hidden="true"><div></div></div>\n'

def c_social_wall(comp, ctx):
    # live .social-media-wall is EMPTY in the settled DOM and in every capture (third-party wall embed never rendered
    # headless) — replicated as captured (0 px); logged as capture-state
    return '<div class="social-wall" data-section="social-media-wall" data-deviation="third-party social wall embed: empty on live in every capture (capture-state); replicated empty"></div>\n'

def c_statement_3card(comp, ctx):
    items = []
    for it in comp.select('.tw-grid > div'):
        cs = classes(it)
        if it.select_one('.writing-mode-vertical-rl') is not None:
            h4 = it.find('h4'); spans = h4.find_all('span', recursive=False)
            sp = ''.join(f'<span class="statement__s{k + 1}">{inner_html(x) or "&nbsp;"}</span>' for k, x in enumerate(spans))
            items.append(f'<div class="statement__item statement__item--word"><div class="statement__word t-alfa"><div><div class="statement__rot"><h4>{sp}</h4></div></div></div></div>')
            continue
        media = it.find(recursive=False); a = media.find('a'); img = media.find('picture') or media.find('img')
        body = it.find_all(recursive=False)[1]
        title = body.find(recursive=False); ptext = body.find('p', recursive=False); link = body.find('a', recursive=False)
        last = ' statement__item--last' if 'tw-mb-0' in cs and 'tw-mb-32' not in cs else ''
        items.append(f'<div class="statement__item card{last}" data-fragment="statement-card"><div class="card__media"><a href="{a.get("href")}" target="{a.get("target", "_self")}">{picture(img)}</a></div>'
                     f'<div class="card__body"><div class="statement__title {tclass(title)}">{inner_html(title)}</div><p class="statement__text {tclass(ptext)}">{inner_html(ptext)}</p>{link_arrow(link) if link else ""}</div></div>')
    return (f'<section class="statement sec" data-section="statement-3-card" data-intent="build trust" data-layout="grid" data-items="{len(items)}" data-media="image" data-module="statement-3-card">\n'
            f'  <div class="container"><div class="statement__grid">\n    ' + '\n    '.join(items) + '\n  </div></div>\n</section>\n')

HANDLERS = {
    'breadcrumb': c_breadcrumb, 'hero-text': c_hero_text, 'hero-small': c_hero_small,
    'text-container-left-aligned-1-col': c_text_1col,
    'text-container-center-aligned-1-col': lambda c, x: c_text_1col(c, x, 'center'),
    'text-container-left-aligned-2-col': c_text_2col,
    'split-right': lambda c, x: c_split(c, x, 'right'), 'split-left': lambda c, x: c_split(c, x, 'left'),
    'ghost': c_ghost, 'media-card': c_media_card, 'hero': c_hero_shell,
    'media-image': c_media_image, 'image-card': c_image_card, 'events-row': c_events_row, 'image-text-2-col': c_image_text_2col,
    'spacer': c_spacer, 'social-media-wall': c_social_wall, 'statement-3-card': c_statement_3card,
}
PAGE_KINDS = []
try:
    from build_g2_more import HANDLERS as MORE  # later-page components live next to this file
    HANDLERS.update(MORE)
except ImportError:
    pass

def build(slug):
    html = open(ROOT + f'stardust/current/pages/{slug}.html').read()
    meta = json.load(open(ROOT + f'stardust/current/pages/{slug}.json'))
    soup = BeautifulSoup(html, 'html.parser')
    root = soup.select_one('.container-v2.aem-GridColumn')
    grid = root.select_one(':scope > .cmp-container > .aem-Grid')
    body = []
    PAGE_KINDS[:] = [[c for c in classes(x) if not c.startswith('aem-')][0] for x in grid.find_all(recursive=False)]
    for i, comp in enumerate(grid.find_all(recursive=False)):
        kind = [c for c in classes(comp) if not c.startswith('aem-')]
        kind = kind[0] if kind else '?'
        fn = HANDLERS.get(kind)
        if not fn: raise SystemExit(f'{slug}: no handler for component {kind} (#{i})')
        body.append(f'<!-- {i}: {kind} -->\n' + fn(comp, f'{slug}#{i}:{kind}'))
    fseg = html[html.find('id="footer"'):]
    code = re.search(r'<span>([^<]*MKT-[0-9A-Z-]+)</span>\s*</p>', fseg)
    code = code.group(1).strip() if code else 'GEN-MKT-18-7897-A'
    ftr = FTR.replace('<span>GEN-MKT-18-7897-A</span>', f'<span data-deviation="footer disclaimer code varies per page XF: {code} on this page">{code}</span>')
    page_css = f'\n<link rel="stylesheet" href="css/{slug}.css">' if os.path.exists(PROTO + f'css/{slug}.css') else ''
    needs_plyr = any('plyr' in b for b in body)
    sprite = ('\n<div id="sprite-plyr" hidden>' + re.sub(r'\s(data-di-[a-z-]+)="[^"]*"', '', PLYR_SPRITE) + '</div>') if needs_plyr else ''
    title = H.escape(meta.get('title') or '', quote=False); desc = H.escape(meta.get('description') or '', quote=True)
    page_js = f'\n<script src="js/{slug}.js"></script>' if os.path.exists(PROTO + f'js/{slug}.js') else ''
    out = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="stylesheet" href="css/canon.css">
<link rel="stylesheet" href="css/applications-pharma-and-biopharma.css">
<link rel="stylesheet" href="css/v3-applications.css">{page_css}
</head>
<body class="page basicpage" data-template="landing" data-archetype="{slug}">

<!-- canon:header:start -->
{HDR}
<!-- canon:header:end -->
<main class="container-v2 aem-GridColumn" id="main">

{''.join(body)}
</main>
<!-- canon:footer:start -->
{ftr}
<!-- canon:footer:end -->
{sprite}
<script src="js/motion.js"></script>{page_js}
</body>
</html>
'''
    open(PROTO + f'{slug}-proposed.html', 'w').write(out)
    print(slug, 'written', len(out), 'bytes; components', len(body), 'footer code', code)

for s in sys.argv[1:]: build(s)
