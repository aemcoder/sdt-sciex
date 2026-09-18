# SCIEX prototypes — shared interaction spec (canon chrome)

Source of truth: runtime observation of https://sciex.com/ on 2026-09-18
(`stardust/replica/motion/home.json`, `home-360.json`,
`home-interact-1440.json`, `home-interact-360.json`). Everything below
FIRED live; anything not listed did not fire and is NOT implemented.
Implementation: `stardust/prototypes/js/motion.js` (canon, every archetype
loads it) + open-state CSS at the end of `css/canon.css`. All behaviour is
click-driven (live = Alpine.js state); nothing runs at t=0, so the static
gate is unaffected (re-verified: 0.40% @1440, 0.00% @360, byte-identical
differing-pixel counts before and after the motion layer).

## Header (static — no scroll morph)
- `#mega-menu` is `position: static` at every width; the header scrolls away.
  No sticky/fixed state, no class changes on scroll (headerTimeline empty).
  Prototypes: `.site-header` static — do not add a scroll morph.

## Desktop primary nav → mega menu (≥1024, click)
- Click a nav item `a` → its `li` gets `menu-active`: `border-bottom-color`
  → #0068fa (transition `all .2s ease`), chevron `span` rotates 180°
  (`all .3s ease`). Page overlay `fixed inset-0 #000 opacity .6` appears
  (z 11, below the header stack). A 32×32 round "Close navigation" button
  (bg rgba(17,24,39,.3), `margin: 24px auto 0`) appears under the panel.
- The panel is IN FLOW (white, `padding 32px 0 40px`): opening pushes the
  page down (live: tabs bar moved 1987→2491 when Products opened).
- Panel layout: left column 25% (`border-right`, `padding-right 24px`) with
  the submenu list — rows 18px/26px weight 330, 12px apart (live rects
  64,163 → 64,391 at 38px pitch) and a "View all X" link (`margin-top 32px`,
  weight 450, blue, 1px underline span); middle column 50% (75% for
  Applications/Support/Services/Resource hub/About/Events) with link groups
  (head 16/24 weight 450 #141414; children 14/20 #707070 `margin-top 2px`,
  each with a 6×10 chevron span); promo column 25% with 16:9 images
  (`padding-top 56.25%`, cover). Training is a single flat 4-column tile grid.
- Left submenu item click → switches the panel inside the same menu;
  the active item carries `submenu-active` = 2px blue bar via `::before`
  at `left: -12px`, full height (lifted rule).
- Click the same nav item, the overlay or the close button → everything closes.
- Menu → panel mapping: Products(7) · Applications(7) · Training(1) ·
  Support(3) · Service→"Services"(3) · Resource hub(1) · About us(3) ·
  Events(2). Live also carries dead "Stories"/"Community" panels with no
  nav item — not reproduced.

## Header dropdowns (≥1024, click)
- Search category "All ▾" → `.dropdown-content` `display: block`
  (live rect 630,72 = button left, button bottom + 20px; 10 links,
  `padding 10px`, min-width 180, shadow 0 8px 16px rgba(0,0,0,.2), radius 4).
- Account "▾" next to Login → account panel `display: flex`
  (240px wide, padding 16, gap 16, `margin-left -57px`, shadow
  −2px 3px 18.4px rgba(19,19,19,.15)): "Create an account" button,
  "Already have an account? / Sign in now", "My profile", "My favorite resources".
- Any click outside a dropdown closes it (observed: the tab click closed
  the open search dropdown). Live also has a CSS `:hover` opener on
  `.dropdown` — NOT observed firing in the hover probes → not implemented.

## Mobile top bar (<1024, click)
- Search icon → `.hdr-mob-search` (46px tall form) `display: flex`; the
  "Search" li hides and "Close search" li shows; the menu panel closes.
- Hamburger → `.hdr-mob-nav` (`height: calc(100vh - 119px)`, level-1 list
  Products…Events at 20/26 weight 330 with right chevrons; resources
  "Shop", "My account"; fixed bottom "Request a quote" bar) `display: flex`
  + mobile overlay (z 50); "Open menu" ↔ "Close menu" li swap. Level-2
  panels were not probed → not implemented (log as follow-up).

## Footer
- Mobile link columns (<768): button click → `ul.style.maxHeight = '250px'`
  (transition `all .7s`), chevron gets rotate(180deg) (`.2s`); only one open.
- Language button (footer, observed on the mobile button; desktop button
  shares the component) → `.lang-modal` `display: flex`, fade in
  `opacity 0→1 .5s ease-out`; scrim click closes (`.2s ease-in`);
  `body.overflow` hidden while open. Choosing a language just closes
  (no locale routing in the prototype).

## Home-only widgets (`js/home.js`)
- "Why SCIEX portfolio" tabs: click swaps `is-active` on the tab item /
  mobile button and on the panel grid (`grid-template-rows 1fr/0fr`;
  `.3s ease-in-out` below 768, none at ≥768; mobile chevron rotate .3s).
- "SCIEX Stories" rail (Splide mechanics): controls (prev/next 24px round
  buttons, "1 / 2" pagination) exist ONLY when the rail overflows (360:
  one slide per view, 12px gap; ≥768 both slides fit → no controls, as live).
  Arrow → `translateX(-index × pitch)` with inline
  `transition: transform 600ms ease-in-out`; slide classes
  `is-active / is-visible / is-prev / is-next`; pagination `is-active`;
  arrows disabled at the ends (transparent bg, blue glyph, no border).

## Dead at runtime (observed, NOT implemented)
- Every hover probe returned no change: image `scale(1.05)` on cards/tiles,
  arrow-link underline slide / arrow shift, nav link colour, footer link
  colour, primary-button gradient fill, Login/Shop colour. Keep the
  `transition` declarations (they are in the computed styles) but add no
  `:hover` rules.
- No scroll-entrance animations (0 animations recorded on the full traversal).
- `prefers-reduced-motion`: live only uses it to cancel hover transforms
  (dead anyway) — nothing to mirror.
