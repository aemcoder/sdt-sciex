#!/usr/bin/env python3
"""Assemble stardust/prototypes/home-proposed.html from verbatim captured strings,
harvested SVGs (svgs-home.json) and the local media manifest. Clean semantic
markup + BEM-ish classes; every string verbatim from current/pages/index.json /
index.html (content-preservation rules)."""
import json, re, html as H

ROOT = '/Users/paolo/stardust/source/180926/sciex/sdt-sciex/'
SV = json.load(open(ROOT + 'stardust/replica/capture/svgs-home.json'))
WIDTHS = [320, 375, 416, 640, 768, 1024, 1440]
SIZES = "(max-width: 320px) 320px, (max-width: 375px) 375px, (max-width: 416px) 416px, (max-width: 640px) 640px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, (max-width: 1440px) 1440px, 1920px"

def svg(s, cls=None):
    """Harvested live SVG verbatim; optionally replace the class attribute."""
    s = re.sub(r'\s(data-di-[a-z-]+|:class|x-[a-z:.-]+)="[^"]*"', '', s)
    if cls is not None:
        s = re.sub(r'^<svg([^>]*?)\sclass="[^"]*"', r'<svg\1', s)
        s = s.replace('<svg', f'<svg class="{cls}"', 1) if cls else s
    return s

def picture(base, alt, img_class='', img_attrs=''):
    m = 'assets/media/'
    src = ''.join(f'<source media="(max-width: {w}px)" srcset="{m}{base}-w{w}.webp {w}w" type="image/webp">' for w in WIDTHS)
    src += f'<source srcset="{m}{base}-w1920.webp 1920w" type="image/webp">'
    jpg = ', '.join(f'{m}{base}-w{w}.jpg {w}w' for w in WIDTHS + [1920])
    return (f'<picture>{src}<img alt="{H.escape(alt, quote=True)}" class="{img_class}" sizes="{SIZES}" '
            f'src="{m}{base}-w1920.jpg" srcset="{jpg}"{img_attrs}></picture>')

ARROW_CTA = svg(SV['ctaArrow'], '')
ARROW_LINK = svg(SV['linkArrow'], '')
CHEV_NAV = svg(SV['navChevron'], '')

def link_arrow(label, href, extra_cls='', target='_self', bold=False):
    return (f'<a class="link-arrow {extra_cls}" href="{href}" target="{target}">'
            f'<div class="link-arrow__label"><span>{label}</span><span class="link-arrow__underline"></span></div>{ARROW_LINK}</a>')

def btn(label, href, extra_cls=''):
    return (f'<a class="btn-primary {extra_cls}" href="{href}" target="_self"><div class="btn-primary__inner"><span>{label}</span>{ARROW_CTA}</div></a>')


# ---------------------------------------------------------------- MEGA MENU (desktop, observed click-open) + mobile level-1
MM = json.load(open(ROOT + 'stardust/replica/capture/megamenu-desktop.json'))
MX = json.load(open(ROOT + 'stardust/replica/capture/megamenu-extra.json'))
GROUP_ARROW = svg(MX['groupArrow'], '')
TOP_MAP = {'Products': 'Products', 'Applications': 'Applications', 'Training': 'Training', 'Support': 'Support', 'Service': 'Services', 'Resource hub': 'Resource hub', 'About us': 'About us', 'Events': 'Events'}
import os as _os
def mm_link(l):
    cls = 'hdr-mega__head' if l['head'] else 'hdr-mega__link'
    return f'<a href="{l["href"]}"><span class="{cls}"><span>{H.escape(l["label"])}</span><span>{GROUP_ARROW}</span></span></a>'
def mm_panel(p, k, subs):
    left = ''.join(f'<li><a class="hdr-mega__sub{" submenu-active" if j == k else ""}" href="#" data-sub="{j}"><span>{H.escape(s["label"])}</span></a></li>' for j, s in enumerate(subs))
    vall = p.get('viewAll')
    viewall = f'<a class="hdr-mega__viewall" href="{vall["href"]}"><div>{H.escape(vall["label"])}<span class="link-arrow__underline"></span></div>{ARROW_LINK}</a>' if vall and vall.get('label') else ''
    groups = ''.join(f'<div class="hdr-mega__group{" hdr-mega__group--mt" if "tw-mt-24" in g["cls"] else ""}">{"".join(mm_link(l) for l in g["links"])}</div>' for g in p['groups'])
    midcls = 'hdr-mega__mid' + (' hdr-mega__mid--wide' if any('tw-w-9/12' in c for c in p['colsCls']) else '') + (' hdr-mega__mid--border' if any('tw-border-r' in c for c in p['colsCls'][1:2]) else '')
    promos = ''.join(f'<div><a href="{pr["href"]}"><div class="hdr-mega__promo-img"><img alt="{H.escape(pr["alt"] or "", quote=True)}" src="assets/media/megamenu/{_os.path.basename(pr["img"])}"></div></a></div>' + ('<br>' if i < len(p['promos']) - 1 else '') for i, pr in enumerate(p['promos']) if pr['img'])
    promo_col = f'<div class="hdr-mega__promo">{promos}</div>' if promos else ''
    return (f'<div class="hdr-mega__panel{" is-open" if k == 0 else ""}"><div class="container hdr-mega__cols" style="display:flex">'
            f'<div class="hdr-mega__left"><ul>{left}</ul>{viewall}</div><div class="{midcls}"><div class="hdr-mega__groups">{groups}</div></div>{promo_col}</div></div>')
def mm_training():
    tiles = ''.join(f'<div class="hdr-mega__tile{" hdr-mega__tile--mt" if "tw-mt-24" in t["cls"] else ""}"><a href="{t["href"]}"><span class="hdr-mega__head"><span>{H.escape(t["label"])}</span><span>{GROUP_ARROW}</span></span><p>{H.escape(t["desc"])}</p></a></div>' for t in MX['training'] if t['label'])
    return (f'<div class="hdr-mega__panel hdr-mega__panel--training is-open"><div class="container" style="display:flex"><div class="hdr-mega__tiles"><div>{tiles}</div></div></div>'
            f'<div class="container" style="display:flex"><a class="hdr-mega__viewall" href="/support/training"><div>View all Training<span class="link-arrow__underline"></span></div>{ARROW_LINK}</a></div></div>')
def mm_menus():
    out = ''
    for i, nav in enumerate(NAV):
        top = TOP_MAP[nav]
        panels = [p for p in MM if p['top'] == top]
        if top == 'Training':
            out += f'<div class="hdr-mega__menu" data-menu="{i}">{mm_training()}</div>'; continue
        subs = panels[0]['left'] if panels and panels[0]['left'] else [{'label': p['sub'], 'href': '#'} for p in panels]
        out += f'<div class="hdr-mega__menu" data-menu="{i}">' + ''.join(mm_panel(p, k, subs) for k, p in enumerate(panels)) + '</div>'
    return out
MOB_L1 = ''.join(f'<li><a href="{it["href"]}"><span>{H.escape(it["label"])}</span>{svg(it["svg"], "")}</a></li>' for it in MX['mobLevel1'])
MOB_RES = ''.join(f'<li{" hidden" if it["style"] else ""}>' + (f'<a href="{it["href"]}">{svg(it["svg"], "")}{H.escape(it["label"])}</a>' if it['href'] else f'<button type="button">{svg(it["svg"], "")}{H.escape(it["label"])}</button>') + '</li>' for it in MX['mobResources'])
ACCOUNT_DD = ('<div class="hdr-dropdown__content hdr-dropdown__content--account"><div><a href="/support/create-account"><button class="hdr-create-account" type="button">Create an account</button></a></div>'
              '<a href="/bin/sciex/login" id="signInNowLink">Already have an account?<span class="hdr-sign-in">Sign in now</span></a>'
              '<a class="hdr-myprofile" href="/support/profile"><svg fill="none" height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="9" r="8.4727" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.125"></circle><circle cx="9" cy="7.8702" r="3.3891" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.125"></circle><path d="M3.945 15.8C4.216 13.248 6.376 11.26 9 11.26C11.624 11.26 13.784 13.248 14.055 15.8" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.125"></path></svg>My profile</a>'
              '<a class="hdr-myprofile" href="/resource-hub/myfavorite"><svg fill="none" height="18" viewBox="0 0 30 30" width="18" stroke="black" xmlns="http://www.w3.org/2000/svg"><path d="M15 3.5l3.3 6.9 7.5 1-5.5 5.2 1.4 7.5L15 20.5l-6.7 3.6 1.4-7.5-5.5-5.2 7.5-1z" stroke-width="1.5" stroke-linejoin="round"></path></svg>My favorite resources</a><a href="#"></a></div>')
SEARCH_DD = '<div class="hdr-dropdown__content">' + ''.join(f'<a href="{h}">{H.escape(l)}</a>' for l, h in MX['searchDropdownLinks']) + '</div>'

# ---------------------------------------------------------------- HEADER
NAV = ['Products', 'Applications', 'Training', 'Support', 'Service', 'Resource hub', 'About us', 'Events']
header = f'''
<header class="site-header" data-section="site-header" data-intent="navigate" data-layout="edge-to-edge" data-canon>
  <nav class="hdr-top" id="mega-menu" aria-label="Main menu">
    <div class="container hdr-top__inner">
      <a class="hdr-logo" href="/" aria-label="Go to Sciex homepage">{svg(SV['logoDesktop'], 'hdr-logo__desktop')}{svg(SV['logoMobile'], 'hdr-logo__mobile')}</a>
      <div class="hdr-mobile-actions">
        <ul>
          <li data-action="search"><button type="button"><span aria-hidden="true">{svg(SV['mobSearch'], '')}</span><span class="sr-only">Search</span></button></li>
          <li data-action="close-search" hidden><button type="button"><span aria-hidden="true">{svg(SV['mobCloseSearch'], '')}</span><span class="sr-only">Close search</span></button></li>
          <li data-action="menu"><button type="button" aria-expanded="false"><span aria-hidden="true">{svg(SV['mobMenu'], '')}</span><span class="sr-only">Open menu</span></button></li>
          <li data-action="close-menu" hidden><button type="button" aria-expanded="true"><span aria-hidden="true">{svg(SV['mobCloseMenu'], '')}</span><span class="sr-only">Close menu</span></button></li>
        </ul>
      </div>
      <div class="hdr-search">
        <input class="hdr-search__box" id="standalone-search-box" type="text" placeholder="Search" aria-label="Search">
        <div class="hdr-dropdown"><button class="hdr-dropbtn" type="button">All{svg(SV['dropbtnChevron'], '')}</button>{SEARCH_DD}</div>
        <button class="hdr-search__btn" type="button" aria-label="Search">{svg(SV['searchBtn'], '')}</button>
      </div>
      <div class="hdr-utility">
        <ul>
          <li class="hdr-utility__link" id="login"><a href="#">{svg(SV['loginIcon'], '')}Login</a><div class="hdr-dropdown" id="accountDropdown"><button class="hdr-dropbtn hdr-dropbtn--account" type="button" aria-label="Account menu">{svg(SV['accountChevron'], '')}</button>{ACCOUNT_DD}</div></li>
          <li class="hdr-utility__link" id="shop"><a href="https://us-store.sciex.com/USD">{svg(SV['shopIcon'], '')}Shop</a></li>
          <li class="hdr-rfq" id="request-a-quote"><a href="/form-pages/product-request">Request a quote</a></li>
          <li><a class="hdr-dash" id="sciex-now-dash" href="/support" target="_self"><div><span>SCIEX Now Dashboard</span></div></a></li>
        </ul>
      </div>
    </div>
  </nav>
  <div class="hdr-mob-search"><form class="hdr-mob-search__form" role="search" action="https://sciex.com/search-results" method="get"><label class="sr-only" for="search-input-mobile">Enter search term</label><input id="search-input-mobile" name="term" type="text" placeholder="Search..."><button type="submit">Search</button></form></div>
  <div class="hdr-mob-nav"><div class="hdr-mob-nav__inner"><div class="container"><ul class="hdr-mob-nav__list">{MOB_L1}</ul><ul class="hdr-mob-nav__resources">{MOB_RES}</ul></div>
    <a class="hdr-mob-rfq" href="/form-pages/product-request" id="header-request-info"><div class="container"><span>Request a quote</span><span>{ARROW_CTA}</span></div></a></div></div>
  <div class="hdr-nav">
    <div class="container">
      <div class="hdr-nav__row">
        <ul>{''.join(f'<li><a href="#">{n}<span>{CHEV_NAV}</span></a></li>' for n in NAV)}</ul>
        <div class="hdr-nav__spacer"></div>
      </div>
    </div>
  </div>
  <div class="hdr-mega">{mm_menus()}</div>
  <button class="hdr-mega__close" type="button"><span class="sr-only">Close navigation</span><span>{svg(MX['closeNav'], '')}</span></button>
  <div class="hdr-mob-overlay" aria-label="Close menu"></div>
  <div class="hdr-overlay" aria-label="Close menu"></div>
</header>'''

# ---------------------------------------------------------------- HERO
hero = f'''
<section class="hero-wrap" data-section="hero" data-intent="emotional hook" data-layout="full-bleed" data-media="image">
  <div class="hero" id="hero-small">
    <div class="hero__inner">
      {picture('ce-systems-hero-2880x1024', '', 'hero__img')}
      <div class="hero__overlay"></div>
      <div class="container hero__container">
        <div class="hero__row">
          <div class="hero__copy">
            <h1 class="t-bravo hero__title">The leader in mass spectrometry and capillary electrophoresis solutions</h1>
            <div class="richtext t-base hero__lede"><p>There, where it counts. Time and time again. Providing the precision detection and quantitation of molecules needed for scientists to make discoveries that change the world.</p></div>
            <div class="hero__ctas"><div>{btn('Our products', 'https://sciex.com/products')}</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>'''

# ---------------------------------------------------------------- PROMO GRID
tiles = [
  ('https://sciex.com/products/mass-spectrometers/triple-quad-systems/novus-v55-system', 'built-for-business-impact-novus-v55-1280x800-homepage', 'Built for Business Impact'),
  ('https://sciex.com/events/sciex-summit', 'sciex-summit-2026-registration-1280x800', 'SCIEX Summit 2026'),
]
media_grid = f'''
<section class="media-grid" data-section="promo-tiles" data-intent="drive action" data-layout="grid" data-items="2" data-media="image">
  <div class="container">
    <div class="media-grid__row">
      {''.join(f'<div class="media-grid__item"><a href="{h}" target="_blank"><div class="media-grid__box">{picture(b, a)}</div></a></div>' for h, b, a in tiles)}
    </div>
  </div>
</section>'''

# ---------------------------------------------------------------- THREE CARDS
cards = [
  ('ZenoTOF 8600 system', '<p>Unlock the proof that powers extraordinary discoveries</p><p><b>Confidence when it counts</b></p>', 'Explore now', 'https://sciex.com/products/mass-spectrometers/qtof-systems/8600-system', 'evo-launch-webpage-8600-2000x1500'),
  ('SCIEX OS software', '<p>Now suports Windows 11 to help labs meet internal and external IT security policies and reduces cybersecurity vulnerabilities for the lab ecosystem.</p>', 'Explore the software', 'https://sciex.com/products/software/sciex-os-software', 'sciex-os-2000x1500'),
  ('Intabio ZT system', '<p>Be unstoppable with comprehensive charge variant analysis on a single system.</p>', 'Explore the system', 'https://sciex.com/products/integrated-solutions/intabio-zt-system', 'intabio-system-menu-2000x1500'),
]
def card(title, body, cta, href, img):
    return (f'<div class="card"><div class="card__media"><a aria-label="{cta}" href="{href}" target="_self">{picture(img, "")}</a></div>'
            f'<div class="card__body"><div class="t-lg-bolder card__title">{title}</div><div class="t-base card__text richtext">{body}</div>{link_arrow(cta, href)}</div></div>')
three_card = f'''
<section class="three-card" id="three-card" data-section="product-cards" data-intent="value proposition" data-layout="grid" data-items="3" data-media="image">
  <div class="container"><div class="three-card__grid">{''.join(card(*c) for c in cards)}</div></div>
</section>'''

# ---------------------------------------------------------------- TABS
tabs = [
  ('Mass Spectrometers', 'Mass Spectrometers', 'SCIEX mass spectrometers are designed to help you break new ground by pushing the limits of speed and sensitivity in quantitative and qualitative analyses.', 'https://sciex.com/products/mass-spectrometers', '8600-homepage-menu2-2000x1250'),
  ('Clinical Medical Devices', 'Clinical Medical Devices', 'Best-in-class in vitro diagnostic mass spec solutions that are extremely easy to adopt and powerful enough to handle the everyday demands of the clinical lab.', 'https://sciex.com/products/in-vitro-diagnostics/medical-devices', 'citrine-menu-2000x1250'),
  ('CE Instruments', 'CE Instruments', 'Optimize your workflow efficiency with capillary electrophoresis systems that deliver exceeding sensitivity, resolution, and performance.', 'https://sciex.com/products/capillary-electrophoresis', 'ce-service-2000x1250'),
  ('HPLC MS', 'HPLC MS', 'The largest, most advanced range of front-end technologies to enhance the power of your mass spec, from analytical flow LC-MS to ultra-low flow CESI-MS.', 'https://sciex.com/products/hplc-products', 'exionlc-2000x1500'),
  ('Software', 'Software', 'Intelligent, fast, secure, and intuitive software that delivers better results and meets the analytical needs of world’s most demanding labs.', 'https://sciex.com/products/software', 'sciex-os-2000x1250'),
  ('Integrated Solutions', 'Integrated Solutions', 'Integrated end-to-end mass spec workflows that give you everything you need to get the most out of your sample from start to finish.', 'https://sciex.com/products/integrated-solutions', 'intabio-system-menu-2000x1250'),
  ('Technologies', 'Technology', 'SCIEX continues to revolutionize the industry with groundbreaking LC-MS/MS and capillary electrophoresis technology that influences life-changing research.', 'https://sciex.com/technology', 'zeno-menu2-2000x1250'),
]
TAB_CHEV = svg(SV['tabMobChevron'], '')
tab_bar = ''.join(f'<div class="{"is-active" if i == 0 else ""}"><button class="t-base-bolder" type="button" aria-expanded="{"true" if i == 0 else "false"}" aria-controls="tabContent{i}" data-tab="{i}"><span>{lbl}</span></button></div>' for i, (lbl, *_rest) in enumerate(tabs))
panels = ''
for i, (lbl, h3, p, href, img) in enumerate(tabs):
    act = ' is-active' if i == 0 else ''
    panels += (f'<button class="tabs__mob-btn t-base-bolder{act}" type="button" aria-expanded="{"true" if i == 0 else "false"}" aria-controls="tabContent{i}" data-tab="{i}">'
               f'<div class="container"><span>{lbl}</span><div class="tabs__mob-btn__icon">{TAB_CHEV}</div></div></button>'
               f'<div class="container tabs__panel-grid{act}"{"" if i == 0 else " aria-hidden=\"true\""}><div class="tabs__panel" id="tabContent{i}"><div class="tabs__panel-inner">'
               f'{picture(img, "")}'
               f'<div class="tabs__panel-text"><h3 class="t-lg-bolder">{h3}</h3><p class="t-base">{p}</p><div class="tabs__panel-link">{link_arrow("Learn more", href)}</div></div>'
               f'</div></div></div>')
tabs_html = f'''
<section class="tabs" data-section="why-sciex-portfolio" data-intent="explain mechanic" data-layout="contained" data-items="7" data-interactive="tabs" data-media="image">
  <div class="tabs__col">
    <div class="container tabs__head"><div><h2 class="t-charlie tabs__title">Why SCIEX portfolio</h2><p class="t-lg tabs__lede">Pioneering solutions that inspire life-changing research and revolutionize the industry.</p></div></div>
    <div class="container tabs__bar">{tab_bar}</div>
    {panels}
  </div>
</section>'''

# ---------------------------------------------------------------- ICON GRID
icons = [
  ('SCIEX Applications', 'SCIEX mass spec and capillary electrophoresis solutions are designed by scientists with your applications in mind. From routine testing to the most complex analytical experiments, we constantly innovate to enable you to transform your workflows.', 'https://sciex.com/applications'),
  ('Clinical Diagnostics', 'Improve the quality of results, achieve faster turnaround times, and reduce costs. Routine diagnostic testing that delivers excellent accuracy and robust performance with our in vitro diagnostic medical device mass spectrometers', 'https://sciex.com/diagnostics'),
  ('Environmental Testing', 'Overcome complex matrices and measure more compounds in every sample. Our solutions deliver the lowest possible detection limits at trace levels with the ultimate accuracy.', 'https://sciex.com/applications/environmental-testing'),
  ('Food and Beverage Testing', 'Meet maximum residue limits (MRLs) with high-quality data that you can genuinely count upon. With SCIEX your lab can quickly and easily react to diverse market needs.', 'https://sciex.com/applications/food-and-beverage-testing'),
  ('Forensics Analysis', 'Accurately detect even the smallest compounds to deliver evidence that stands. Get fast, highly accurate data across a multitude of compounds and biomarkers.', 'https://sciex.com/applications/forensics-testing'),
  ('Life Science Research', 'Capture the best data, integrate results cross-omics, and gain relevant insights to make your next discovery. Get more reliable information on the key genes, proteins, lipids, and metabolites for your research.', 'https://sciex.com/applications/life-science-research'),
  ('Pharma and BioPharma Research', 'Transform the capacity and capability of your biologics pipeline with innovative end-to-end mass spec and capillary electrophoresis solutions that help you to make better development decisions, faster.', 'https://sciex.com/applications/pharma-and-biopharma'),
]
icon_cards = ''.join(
  f'<div class="icon-card"><div class="icon-card__icon">{svg(SV["appIcons"][i], "")}</div><h3 class="t-lg-bolder">{h3}</h3>'
  f'<div class="t-base icon-card__text richtext">{txt}</div><div class="icon-card__link">{link_arrow("Learn more", href)}</div></div>'
  for i, (h3, txt, href) in enumerate(icons))
icon_grid = f'''
<section class="icon-grid" data-section="why-sciex-applications" data-intent="value proposition" data-layout="grid" data-items="7">
  <div class="container">
    <div class="icon-grid__head"><h2 class="t-charlie icon-grid__title">Why SCIEX for your application</h2></div>
    <div class="icon-grid__grid">{icon_cards}</div>
  </div>
</section>'''

# ---------------------------------------------------------------- STORIES
stories = [
  ('A cast of thousands', '<p>A contract research organization in Colorado Springs works hard to get quality data for clients. Scientists at Aliri Bioanalysis help make drug products that result in better outcomes for patients.</p>', 'https://sciex.com/stories/articles/a-cast-of-thousands', 'thoughtleader-aliri'),
  ('Pioneering future treatments', '<p>A focus on the patient is easy to see at Sutro Biopharma. Tyler Heibeck directs a team developing innovating cancer therapeutics that deliver better treatment options.</p>', 'https://sciex.com/stories/articles/pioneering-future-treatments', 'thoughtleader-sutro'),
]
slides = ''.join(
  f'<li class="stories__slide card" id="splide01-slide0{i+1}" role="tabpanel" aria-label="{i+1} of 2">'
  f'<div class="card__media"><a href="{href}" aria-label="Learn more" target="_blank">{picture(img, "")}</a></div>'
  f'<div class="card__body"><div class="t-lg-bolder card__title">{t}</div><div class="t-base card__text richtext">{b}</div>{link_arrow("Learn more", href, target="_blank")}</div></li>'
  for i, (t, b, href, img) in enumerate(stories))
stories_html = f'''
<section class="stories" id="splide01" data-section="stories" data-intent="build trust" data-layout="contained" data-items="2" data-interactive="carousel" data-media="image">
  <div class="container">
    <div class="stories__track" id="splide01-track">
      <div>
        <div class="stories__head">
          <div class="stories__title-wrap"><h2 class="t-delta stories__title">SCIEX Stories</h2></div>
          <div class="stories__controls" data-controls></div>
        </div>
      </div>
      <ul class="stories__list" id="splide01-list" role="presentation">{slides}</ul>
    </div>
  </div>
</section>'''

# ---------------------------------------------------------------- SUPPORT BAND + FOOTER
support = f'''
<div class="footer-spacer" data-canon></div>
<section class="support-band" data-section="support-network" data-intent="drive action" data-layout="full-bleed" data-canon>
  <div class="container"><div class="support-band__row">
    <div class="support-band__copy"><h5 class="support-band__title">SCIEX Now support network</h5><h5 class="support-band__sub">The destination for all your support needs.</h5></div>
    <div class="support-band__cta">{btn('Contact support', 'https://sciex.com/about-us/contact-us')}</div>
  </div></div>
</section>'''

cols = [
  ('Products', [('Mass spectrometers', 'https://sciex.com/products/mass-spectrometers'), ('Capillary electrophoresis', 'https://sciex.com/products/capillary-electrophoresis'), ('Software', 'https://sciex.com/products/software'), ('Integrated solutions', 'https://sciex.com/products/integrated-solutions'), ('Front-end HPLC MS', 'https://sciex.com/products/hplc-products'), ('Ion mobility', 'https://sciex.com/products/ion-mobility-spectrometry'), ('Ion sources', 'https://sciex.com/products/ion-sources'), ('Spectral libraries', 'https://sciex.com/products/spectral-library'), ('Consumables', 'https://sciex.com/products/consumables')]),
  ('Applications', [('Pharma and biopharma', 'https://sciex.com/applications/pharma-and-biopharma'), ('Clinical', 'https://sciex.com/applications/clinical'), ('Environmental', 'https://sciex.com/applications/environmental-testing'), ('Food and beverage', 'https://sciex.com/applications/food-and-beverage-testing'), ('Forensic testing', 'https://sciex.com/applications/forensics-testing'), ('Life science research', 'https://sciex.com/applications/life-science-research')]),
  ('Connect', [('Support', 'https://sciex.com/support'), ('Training', 'https://sciex.com/support/training'), ('Professional services', 'https://sciex.com/support/professional-lab-services'), ('Careers', 'https://jobs.danaher.com/global/en/sciex'), ('Contact', 'https://sciex.com/about-us/contact-us'), ('Resource library', 'https://sciex.com/resource-library?view=knowledge%20base%20articles'), ('Innovation advisory board', 'https://community.sciex.com/innovation-advisory-board/')]),
  ('Company', [('About SCIEX', 'https://sciex.com/about-us'), ('Our history', 'https://sciex.com/about-us/our-history'), ('SCIEX stories', 'https://sciex.com/stories'), ('Latest news', 'https://sciex.com/about-us/press-releases'), ('Executive management', 'https://sciex.com/about-us/executive-management')]),
]
FCHEV = svg(SV['footerColChevron'], '')
def col_pair(head, links):
    desk = f'<div class="ftr-col ftr-col--desktop"><div class="ftr-col__head">{head}</div><ul>{"".join(f"<li><a href=\"{h}\">{t}</a></li>" for t, h in links)}</ul></div>'
    mob = f'<div class="ftr-col ftr-col--mobile"><button type="button" aria-expanded="false"><span>{head}</span>{FCHEV}</button><ul>{"".join(f"<li><a href=\"{h}\">{t}</a></li>" for t, h in links)}</ul></div>'
    return desk + mob
flags_desk = ''.join(f'<img alt="" src="assets/media/{c}.png"{"" if i == 0 else " style=\"display: none;\""}>' for i, c in enumerate(['us', 'jp', 'cn', 'kr']))
flags_mob = ''.join(f'<img alt="" src="assets/media/{c}.png"{"" if i == 0 else " style=\"display: none;\""}>' for i, c in enumerate(['us', 'jp', 'cn', 'kr', 'es']))
LCHEV = svg(SV['langChevron'], '')
social = [('https://www.linkedin.com/company/sciex', 'Linkedin'), ('https://x.com/SCIEXnews', 'X'), ('https://www.facebook.com/SCIEXnews', 'Facebook'), ('https://instagram.com/instasciex', 'Instagram')]
legal = [('https://sciex.com/legal-pages/privacy-policy', 'Privacy Policy', ''), ('#', 'Cookies Settings', ' ot-sdk-show-settings'), ('/legal-pages/organizational-model-and-code-of-ethics-d-lgs-231-2001', 'Organizational Model and Code of Ethics D.Lgs 231/2001', ''), ('https://sciex.com/legal-pages/legal-information', 'Legal Info', ''), ('https://sciex.com/legal-pages/do-not-sell-my-data', 'Do Not Sell My Data', '')]
partners = ''.join(f'<li><a href="{p["href"]}" aria-label="{p["aria"]}" target="_blank">{svg(p["svg"], None)}</a></li>' for p in SV['lsig'])
footer = f'''
<footer class="site-footer" id="footer" data-section="footer" data-intent="navigate" data-layout="contained" data-canon>
  <div class="container">
    <div class="ftr-top">
      <nav class="ftr-social" aria-label="Social media"><ul>{''.join(f'<li><a href="{h}"><span class="sr-only">{t}</span>{svg(SV["social"][i], "")}</a></li>' for i, (h, t) in enumerate(social))}</ul></nav>
      <div class="ftr-lang ftr-lang--desktop"><button type="button">{flags_desk}<div class="ftr-lang__label"><span>English</span>{LCHEV}</div></button></div>
    </div>
    <nav class="ftr-links" aria-label="Footer">{''.join(col_pair(h, l) for h, l in cols)}</nav>
    <div class="ftr-lang ftr-lang--mobile"><button type="button">{flags_mob}<div class="ftr-lang__label"><span>English</span>{svg(SV['langMobChevron'], '')}</div></button></div>
  </div>
  <div class="ftr-legal">
    <div class="container">
      <div class="ftr-legal__row">
        <span class="ftr-copy t-sm">© Copyright
            2026 SCIEX</span>
        <nav class="ftr-legal__nav" aria-label="Legal"><ul class="t-sm">{''.join(f'<li><a class="t-sm{c}" href="{h}">{t}</a></li>' for h, t, c in legal)}</ul></nav>
      </div>
      <div class="ftr-bottom">
        <p class="ftr-disclaimer t-sm" id="disclaimer">
					The SCIEX clinical diagnostic portfolio is For In Vitro Diagnostic Use. Rx Only. Product(s) not available in all countries. For information on availability, please contact your local sales representative or refer to www.sciex.com/diagnostics. All other products are For Research Use Only. Not for use in Diagnostic Procedures.
					Trademarks and/or registered trademarks mentioned herein, including associated logos, are the property of AB Sciex Pte. Ltd. or their respective owners in the United States and/or certain other countries (see www.sciex.com/trademarks).
					Echo<sup>®</sup> and Echo<sup>®</sup> MS + system are trademarks or registered trademarks of Labcyte, Inc. in the United States and other countries, and are being used under license.
			  <span>GEN-MKT-18-7897-A</span></p>
        <p class="ftr-danaher t-sm"><picture><img alt="danher-logo" width="98" height="128" src="assets/media/danaher-logo.png"></picture></p>
      </div>
    </div>
  </div>
  <div class="lang-modal" data-section="language-selector" data-intent="navigate" data-layout="edge-to-edge" data-canon>
    <div class="lang-modal__scrim"></div>
    <div class="lang-modal__panel"><div class="container lang-modal__row"><div style="flex:1 1 0%"><div class="lang-modal__label">Choose your Language:</div>
      <ul class="lang-modal__list"><li><button type="button" class="is-current"><img alt="" src="assets/media/us.png"><span>English</span></button></li><li><button type="button" class=""><img alt="" src="assets/media/jp.png"><span>Japanese</span></button></li><li><button type="button" class=""><img alt="" src="assets/media/cn.png"><span>Chinese</span></button></li><li><button type="button" class=""><img alt="" src="assets/media/kr.png"><span>Korean</span></button></li></ul></div></div></div>
  </div>
  <div class="ftr-partners container" data-section="partner-logos" data-intent="build trust" data-layout="grid" data-items="9"><ul>{partners}</ul></div>
</footer>'''

JS = '<script src="js/motion.js"></script>\n<script src="js/home.js"></script>'

page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LC-MS, CE, and software solutions | SCIEX</title>
<meta name="description" content="As a leader in life science industries, SCIEX provides the precision detection and quantitation of molecules needed for scientists to make discoveries that change the world.">
<link rel="stylesheet" href="css/canon.css">
<link rel="stylesheet" href="css/home.css">
</head>
<body class="page basicpage" data-template="landing" data-archetype="home">
{header}
<main class="container-v2 aem-GridColumn" id="main">
{hero}
{media_grid}
{three_card}
{tabs_html}
{icon_grid}
{stories_html}
</main>
{support}
{footer}
{JS}
</body>
</html>
'''
open(ROOT + 'stardust/prototypes/home-proposed.html', 'w').write(page)
print('wrote home-proposed.html', len(page), 'bytes')
