<!-- stardust:provenance
  writtenBy: stardust:extract
  writtenAt: 2026-09-18T07:20:00Z
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/assets/css/clientlib-site.min.69142de3.css
    - stardust/current/assets/css/legacy/clientlib-global.min.css
    - stardust/current/assets/css/eds/styles__styles.css
    - stardust/.work/probe-index.json
    - stardust/.work/probe-applications-pharma-and-biopharma.json
    - stardust/.work/probe2-home.json
    - stardust/.work/probe3-home.json
    - stardust/.work/tw-class-counts.json
  synthesizedInputs: []
  stardustVersion: 0.10.0
  mode: descriptive current state (replica target = current state); every value is a captured value
-->
---
name: SCIEX (sciex.com) — current state
description: Precision-instrument marketing site — light Geogrotesque display type, one electric blue, square photography, flat hairline-ruled surfaces, near-black chrome.
colors:
  sciex-blue: "#0068fa"
  sciex-blue-deep: "#005bdb"
  sciex-blue-active: "#004ebc"
  ink: "#141414"
  graphite: "#2c2c2c"
  divider-dark: "#434343"
  control-grey: "#5b5b5b"
  body-grey: "#707070"
  footer-grey: "#8a8a8a"
  placeholder-grey: "#a1a1a1"
  hairline: "#ececec"
  mist: "#f5f5f5"
  white: "#ffffff"
  scrim-black: "#000000"
typography:
  display:
    fontFamily: "Geogrotesque, Helvetica, Arial, sans-serif"
    fontSize: "clamp(34px, calc(7.53px + 4.41vw), 64px)"
    fontWeight: 270
    lineHeight: 1.2
    letterSpacing: "normal"
  display-home:
    fontFamily: "Geogrotesque, Helvetica, Arial, sans-serif"
    fontSize: "clamp(31px, calc(12.47px + 3.09vw), 52px)"
    fontWeight: 270
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "Geogrotesque, Helvetica, Arial, sans-serif"
    fontSize: "clamp(27px, calc(15.53px + 1.91vw), 40px)"
    fontWeight: 270
    lineHeight: 1.3
    letterSpacing: "normal"
  headline-sm:
    fontFamily: "Geogrotesque, Helvetica, Arial, sans-serif"
    fontSize: "clamp(23px, calc(15.06px + 1.32vw), 32px)"
    fontWeight: 270
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Geogrotesque, Helvetica, Arial, sans-serif"
    fontSize: "clamp(20px, calc(14.59px + 0.74vw), 24px)"
    fontWeight: 270
    lineHeight: 1.3
    letterSpacing: "normal"
  card-title:
    fontFamily: "Geogrotesque, Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 530
    lineHeight: 1.444
    letterSpacing: "0.048px"
  lead:
    fontFamily: "Geogrotesque, Helvetica, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 330
    lineHeight: 1.444
    letterSpacing: "0.048px"
  body:
    fontFamily: "Geogrotesque, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 330
    lineHeight: 1.5
    letterSpacing: "0.08px"
  body-strong:
    fontFamily: "Geogrotesque, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 530
    lineHeight: 1.5
    letterSpacing: "0.08px"
  label:
    fontFamily: "Geogrotesque, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 330
    lineHeight: 1.43
    letterSpacing: "0.07px"
rounded:
  none: "0px"
  search: "3px"
  control: "4px"
  pill: "9999px"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "32": "32px"
  "48": "48px"
  "64": "64px"
  "80": "80px"
  "96": "96px"
components:
  button-primary:
    backgroundColor: "{colors.sciex-blue}"
    textColor: "{colors.white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.sciex-blue-deep}"
    textColor: "{colors.white}"
  button-primary-active:
    backgroundColor: "{colors.sciex-blue-active}"
    textColor: "{colors.white}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "50px"
  button-secondary-hover:
    backgroundColor: "{colors.sciex-blue-deep}"
    textColor: "{colors.white}"
  link-arrow:
    backgroundColor: "transparent"
    textColor: "{colors.sciex-blue}"
    typography: "{typography.body}"
  link-arrow-hover:
    textColor: "{colors.sciex-blue-deep}"
  header-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    height: "64px"
  header-cell-quote:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.sciex-blue}"
    typography: "{typography.body-strong}"
    padding: "20px 32px"
    height: "64px"
  header-cell-dashboard:
    backgroundColor: "{colors.sciex-blue}"
    textColor: "{colors.white}"
    typography: "{typography.body}"
    padding: "20px 32px"
    height: "64px"
  nav-row:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    height: "67px"
  input-search:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.placeholder-grey}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    height: "40px"
  card:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0px"
  popover-account:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "16px"
    width: "240px"
  band-support:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.white}"
    padding: "48px 0"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.footer-grey}"
    padding: "32px 0 64px"
---

# Design System: SCIEX (sciex.com) — current state

## Overview

**Creative North Star: "There, where it counts"** _(provenance: inferred — the phrase is the site's own hero sub-line; used here as a label for the observed visual stance, not as an authored intent)_

The live sciex.com is a precision-instrument brochure rendered with restraint: a very light Geogrotesque display face (weight 270) at 40–64px, one electric blue (`#0068fa`) used for every action, and near-black chrome (`#141414`) framing white content. Photography of instruments and labs is square-cornered and full-bleed; the only softening anywhere is a 4px radius on buttons. Surfaces are flat — no card shadows, no borders around cards — and sections are separated by 1px hairlines and generous 48–64px padding. Density is low: a 1440px container with 64px gutters and 32px grid gaps, 3–4 cards per row.

Three front-ends co-exist. This document describes the **v3 Tailwind system** (51 of 73 captured pages; home, hubs, products, applications, technology, about, press) because it owns the brand surface. The **legacy "globalpage" system** (15 pages: KB articles, SCIEX Now support shell, intermediate/detail templates) uses proxima-nova body text with teal `#0084a9`/`#00afdb` headings and orange `#f99d31` buttons; the **Edge Delivery blocks** (3 pages: contact-us, KB landing, customer documents) reuse Geogrotesque Sharp VF and a `#0072ce` primary. Both are recorded in `_brand-extraction.json#type.subsystems` and `paletteDropped`; the shared header/footer chrome is identical across all three.

**Key Characteristics:**
- Light display type (270) with mid-weight (530) card titles and 330 body — never bold, never uppercase (4% of 681 headings).
- One saturated colour; hover is the same hue one step deeper (`#005bdb`), active two steps (`#004ebc`).
- Square imagery, 4:3 cards, 50% black scrim on hero photos.
- Flat: shadows only on the account popover; hairlines `#ececec` do the separating.
- Two signature micro-interactions: the fill-up button (blue-800 rises from the bottom edge) and the arrow-link whose 1px underline slides out to the right.
- Persistent dark bands: 64px header bar, grey-800 "SCIEX Now support network" band, grey-900 footer with a 9-logo partner strip.

## Colors

A single electric blue against a black-white-grey ladder; every other hue on the site belongs to legacy templates or third-party overlays.

### Primary
- **SCIEX Blue** (`#0068fa`, Tailwind `blue-700`): every primary button fill, the "SCIEX Now Dashboard" header cell, arrow-link text and underline bars, active tab text and underline, the mega-menu's active-item 2px left rule, focus rings. 1,883 utility uses inside `<main>` across 51 pages.
- **SCIEX Blue Deep** (`#005bdb`, `blue-800`): hover fill of every button (gradient grows from the bottom) and hover colour of arrow links. 1,439 uses.
- **SCIEX Blue Active** (`#004ebc`, `blue-900`): `:active` state of buttons only.

### Neutral
- **Ink** (`#141414`, `grey-900`): headings, nav items, card titles, and the fill of the 64px header bar, the footer and the dark testimonial band. 1,301 uses.
- **Graphite** (`#2c2c2c`, `grey-800`): the "SCIEX Now support network" band above the footer (52 pages).
- **Divider Dark** (`#434343`, `grey-700`): 1px rules above footer columns.
- **Control Grey** (`#5b5b5b`, `grey-600`): the 30×30 search submit button.
- **Body Grey** (`#707070`, `grey-500`): all paragraph and card copy, breadcrumb items. 1,102 uses.
- **Footer Grey** (`#8a8a8a`, `grey-400`): footer links, copyright, disclaimer, testimonial role lines.
- **Placeholder Grey** (`#a1a1a1`, `grey-300`): search placeholder and scope button; the band's sub-line "The destination for all your support needs."
- **Hairline** (`#ececec`, `grey-100`): section top rules, tab rail, sticky sub-nav bottom rule, icon-card top rules; occasional light section ground.
- **Mist** (`#f5f5f5`, `grey-50`): search field, "Request a quote" header cell, product-detail hero band.
- **White** (`#ffffff`): page canvas, mega-menu panel, text on dark bands.
- **Scrim Black** (`#000000` at 50%): `div.overlay` over hero and media-image photos.

### Named Rules (observed)
**The One Blue Rule.** On v3 pages the only chromatic colour is `#0068fa` and its two darker steps; success/warning/error tints exist in the compiled CSS (`#30855d`, `#e98614`, `#ce3939`) but were not observed rendered on any of the 73 pages.
**The Dark Frame Rule.** Content is white; everything that frames it (header bar, support band, footer, testimonial) is `#141414`/`#2c2c2c` with white and grey-400 text.

## Typography

**Display Font:** Geogrotesque Sharp VF (variable; with Helvetica, Arial, sans-serif)
**Body Font:** Geogrotesque Sharp VF (same file; weights 330/450/530)
**Label/Mono Font:** none (legacy pages: proxima-nova 300–700 via Adobe Fonts; KB article content computed as Helvetica, Arial)

**Character:** one variable grotesque doing everything — hairline-light at display sizes, medium at card-title and link sizes. `body.stretch-text` sets `font-variation-settings: "wdth" 550`. Weights are the site's own axis stops (270, 330, 370, 450, 530) rather than the 300/400/700 convention. Font loading is `font-display: swap` from `/etc.clientlibs/sciex-v3/clientlibs/clientlib-site/resources/fonts/Geogrotesque_Sharp_VF.woff2` (preloaded).

### Hierarchy
- **Display** (270, `text-alfa` 34px → 64px at ≥1280, line-height 1.2): interior page H1 (37 hero-text pages), e.g. "Biopharma / pharma research".
- **Display-home** (270, `text-bravo` 31px → 52px, 1.2): the home hero H1 in white on the photo; also product-detail heroes.
- **Headline** (270, `text-charlie` 27px → 40px, 1.3): section H2 ("Overview", "Why SCIEX portfolio", "Pharma and biopharma applications").
- **Headline-sm** (270, `text-delta` 23px → 32px, 1.3): secondary H2 ("SCIEX Stories") and the testimonial quote (330 white).
- **Title** (270 / 450, `text-echo` 20px → 24px, 1.3): section H3 ("Let's connect"); the support band H5 uses it at 450 white.
- **Card title** (530, 18px / 26px, +0.048px): `text-lg-bolder` on every card, tab-panel H3 and mega-menu group heading (450 at 16px).
- **Lead** (330, 18px / 26px): `text-lg` intro paragraph under H1/H2 in `#707070`.
- **Body** (330, 16px / 24px, +0.08px; 15px / 23px below 600px): `text-base`; paragraphs, footer links, nav items, buttons.
- **Body-strong** (530, 16px): `text-base-bolder` — tab buttons, sticky sub-nav anchors, "Request a quote" header link, `<b>`/`<a>` default.
- **Label** (330 / 400, 14px / 20px): `text-sm` — copyright, disclaimer, Login/Shop utility links, breadcrumb.

Scale audit: **ad-hoc** — 64 → 52 → 40 → 32 → 24 → 18 → 16 → 14 gives ratios 1.23 / 1.30 / 1.25 / 1.33 / 1.33 / 1.125 / 1.14; the steps are named (alfa…echo) rather than derived from one ratio. Sizes are fluid between 600px and 1280px via `calc()`.

### Named Rules (observed)
**The Light Display Rule.** Every H1/H2 renders at weight 270; emphasis is carried by size and colour, never by weight.
**The Sentence-Case Rule.** Headings and buttons are sentence case; the only uppercase on the site is legacy "BUY NOW / CONTACT SUPPORT" buttons.

## Layout

- Container `.tw-container`: `max-width: 1440px`, `padding: 0 64px` at ≥1280 (content 1312px), `0 24px` on mobile. Full-bleed bands (hero-small 1440×512, media-image 1440×636, support band, footer) break out of it.
- Grid: `tw-grid md:tw-grid-cols-2 lg:tw-grid-cols-4 md:tw-gap-x-32 md:tw-gap-y-48` for card grids; 3-up variants at 416px cards; 2-up media cards at 640px; mega-menu uses a 12-column flex (`tw-columns-12`).
- Vertical rhythm (px-named Tailwind scale, base 4): components pad `tw-pt-32 md:tw-pt-48 / tw-pb-32 md:tw-pb-48`; section headers sit on a 1px hairline with 24–32px top padding; card title 20–32px under the image, copy 6–8px under the title, link 12–16px under the copy. Footer top padding 64px → 96px.
- Breakpoints observed in CSS: 600, 640, 768 (dominant, 317 rules), 1024, 1280, 1440, 1536; `lg:` (1024) toggles desktop nav/mega-menu vs. mobile; `<lg` shows a fixed bottom "Request a quote" bar.
- Header is 131px (64px bar + 67px nav row), not sticky; the page-sub-nav (application pages) is `position: sticky; top: 0; z-index: 40`.
- Alignment is flush-left throughout; the only centred element is the mega-menu close chevron.

## Elevation & Depth

Flat by observation. Across the three probed pages and 51 v3 sidecars no card, hero, tab or button carries a `box-shadow` at rest. Depth is conveyed by (a) tone — white content against `#141414`/`#2c2c2c` bands, (b) the 50% black scrim on photos, and (c) hairlines. The compiled CSS defines two soft shadows (`0 8px 16px 0 hsla(0,0%,7%,.05)` and `-24px 8px 16px 0 hsla(0,0%,7%,.05)`) for hover/panel use, but they were not observed rendered.

### Shadow Vocabulary
- **Popover** (`box-shadow: rgba(19,19,19,0.15) -2px 3px 18.4px 0px`): the account/login popover only.

### Named Rules (observed)
**The Flat Surface Rule.** Cards are transparent regions on the white canvas; separation is a 1px `#ececec` rule or whitespace, never a shadow or border box.

## Shapes

Square by default. Images (hero, 4:3 cards, 16:9 media cards, mega-menu tiles), inputs, tabs, bands and the header cells are 0px radius. Radius exists only on: buttons and the outline button (4px, `tw-rounded`), the account popover (4px), the search submit button (3px), and round controls — carousel prev/next arrows (32px, `9999px`), the mega-menu close chevron. Borders are 1px: blue on buttons (`tw-border-blue-700`), `#ececec` hairlines on content, `#434343` on footer columns. Icons are 16–24px line SVGs (stroke `currentColor`), 48px in icon-card grids.

## Components

### Buttons
- **Shape:** softly squared (4px), 1px border, 50px tall, 12px 20px padding, 16px/24px text, arrow SVG 16×14 with 8px left margin.
- **Primary:** `#0068fa` fill, white text, `1px solid #0068fa`. Hover: `background-image: linear-gradient(#005bdb)` grows from `background-size: 100% 0` to `100% 100%` (bottom-up fill, `.3s cubic-bezier(.4,0,.2,1)`), arrow moves to 12px. Active: `#004ebc`. Focus: 2px blue ring, 2px offset. Labels: "Our products", "Request a quote", "Contact support", "Create an account" (14px, 180px wide in the popover).
- **Secondary (outline):** transparent, `#141414` text, `1px solid #0068fa`; same fill-up hover with white text; paired right of the primary in product-detail heroes ("Contact support").
- **Arrow link (ghost):** `#0068fa` 16px (400 on cards, 530 in heroes), no underline decoration; a 1px `#0068fa` bar sits under the label and slides to `left: 100%` on hover (`.5s`), text turns `#005bdb`, arrow shifts 8→12px. 287 "Learn more" instances on 37 pages.
- **Header cells:** "Request a quote" 222×64 `#f5f5f5` with `#0068fa` 530 text; "SCIEX Now Dashboard" 222×64 `#0068fa` white 330 with the fill-up hover.
- **Legacy (15 pages):** `.btn.blue` `#00afdb` white 14px/300, `.btn.orange` `#f99d31` uppercase, 0px radius.

### Cards
- **Corner Style:** 0px.
- **Background:** transparent on white; no border, no shadow.
- **Image:** 4:3 (`tw-aspect-4/3`), `object-fit: cover`, hover `scale(1.05)` over .5s (disabled under `motion-reduce`), 416×312 at 3-up, 304×228 at 4-up; media cards 640×480.
- **Text:** title 18px/530 `#141414`; copy 16px/330 `#707070`; arrow link "Learn more".
- **Variants:** image-card (13 pages), three-card (8), icon-3/4-col with 48px line icon and 1px top rule (7), resources-grid (6), media-card-carousel and image-card-carousel (Splide, pagination "1 / 3" + 32px round blue arrows).

### Inputs / Fields
- **Search (header):** 348×40, `#f5f5f5`, no border, 0px radius, 12px 16px padding, 16px text, placeholder `#a1a1a1`, inline "All" scope dropdown (16px/330 `#a1a1a1`), 30×30 `#5b5b5b` submit with 3px radius and magnifier SVG.
- **Focus:** `focus-visible:tw-ring-2 tw-ring-blue-700 tw-ring-offset-2`.
- Forms (quote, contact) were not captured; EDS contact page uses `select` controls with 1px `#c9cace` borders.

### Navigation
- **Header bar (64px, `#141414`):** wordmark 95×32 white left; search; "Login" (user icon) with popover; "Shop" (basket) → store; two 222px CTA cells flush right.
- **Nav row (67px, white):** 8 items 16px/330 `#141414` with 24px chevrons, 64px left gutter; hover `#0068fa`; open item gets a 2px blue bottom rule and the chevron flips.
- **Mega-menu:** full-width white panel 448px tall under the header (z 100); left column 7 items 18px/330 with a 2px blue left rule on the active one and "View all Products" arrow-link; middle two columns of groups (heading 16px/450 with chevron, children 16px `#707070` with chevron) and "View all Mass spectrometers"; right column two 296×166 promo tiles. Page dims under the 50% black overlay; a grey band with a round chevron-up closes it.
- **Breadcrumb:** home icon + chevrons, 14px `#707070`, current item `#141414`, 16px top / 32px bottom padding.
- **Sticky sub-nav (application pages):** white, 65px, anchors 16px/530, active blue, hairline bottom.
- **Footer:** `#141414`; social row (16px SVGs) + language selector; 4 columns (Products, Applications, Connect, Company) with 16px/530 white heads and 16px/330 `#8a8a8a` links on `#434343` top rules; legal row 14px; disclaimer + Danaher logo; 294px partner strip of 9 white logos (~96px each).
- **Mobile (<1024):** hamburger nav; fixed bottom blue "Request a quote" bar.

### Signature Component — SCIEX Now support band
Full-width `#2c2c2c` band, `48px 0` padding, inside the footer fragment on 52 pages: H5 "SCIEX Now support network" 24px/450 white over H5 "The destination for all your support needs." 24px/400 `#a1a1a1`, primary button "Contact support" (189×50) right-aligned. It is the site's cross-promo (`_brand-extraction.json#crossPromo`).

### Signature Component — Account popover
240px white panel (4px radius, 16px padding, `rgba(19,19,19,.15) -2px 3px 18.4px` shadow) opened from "Login": primary "Create an account", "Already have an account? Sign in now" (16px blue underlined), then "My profile" and "My favorite resources" rows with 18px line icons. Distinct from the WalkMe "please login to sciex.com" tooltip seen in screenshots, which is a third-party overlay styled in legacy teal.

## Do's and Don'ts

Conventions the live v3 pages follow (descriptive; the replica target is the current state).

### Do:
- **Do** set H1/H2 in Geogrotesque 270 at 64/40px (52px on home) with 1.2–1.3 line-height, sentence case, `#141414` (white on photo heroes).
- **Do** use `#0068fa` for every action, `#005bdb` for hover (fill-up gradient on buttons, text on links) and `#004ebc` for active.
- **Do** keep buttons 4px-radius, 50px tall, 12px 20px padding, with the 16×14 arrow; pair primary + outline in product heroes.
- **Do** build cards as transparent regions: 4:3 square image, 18px/530 title, 16px/330 `#707070` copy, "Learn more" arrow-link.
- **Do** separate sections with 1px `#ececec` rules and 48px component padding inside a 1440px/64px-gutter container.
- **Do** place a 50% black scrim over hero photography behind white type.
- **Do** end every page with the `#2c2c2c` support band, the `#141414` footer and the 9-logo partner strip.

### Don't:
- **Don't** round images, cards, inputs or bands — radius belongs to buttons and round controls only.
- **Don't** add drop shadows to cards or heroes; the only shadow on the site is the account popover.
- **Don't** use bold (≥600) or uppercase headings; the heaviest weight in use is 530 on 16–18px titles.
- **Don't** introduce a second hue on v3 pages — the teal/orange family exists only in legacy templates and `#0072ce` only in the EDS contact hero.
- **Don't** use icon fonts on v3 pages; icons are inline 16–48px stroke SVGs.
