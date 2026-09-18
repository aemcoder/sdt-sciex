# EDS conversion log — G4 legacy SCIEX Now templates (`/support`, `/support/software-support`, `/education/grant-support`)

Skill `stardust:deploy`, phase `g4:<slug>:convert` (2026-09-18). Visual spec = the gated replica prototypes
(`stardust/prototypes/{support,support-software-support,education-grant-support}-proposed.html` + `css/legacy-shared.css`
+ per-page CSS; ledger `stardust/replica/progress-g4.json`). Raw schemas `stardust/eds-schema/<slug>.raw.json`
(section-schema.mjs over the served prototype), re-cut per block into `stardust/eds-schema/<slug>.json`
(qa-gate matches `sections` to page blocks BY ORDER; D1 prose lives in `defaultContentSections`).
Titles are the captured `<title>` values verbatim (`stardust/current/pages/<slug>.json`); the captured records carry
`description: null` (live pages ship no meta description) → the Description is composed from each page's own lede
sentence (recorded here, not invented copy).

## 1. Step-2 triage (D1 first, then D11), per prototype module

### /support (`Template: sciex-now`)

| # | prototype module | D1: block? | D11 | EDS result | tier / shape |
|---|---|---|---|---|---|
| 0 | page metadata | — | — | `metadata`: Title `Support`, Description (lede), `Template: sciex-now`, `Footer: /footer-legacy`, `Disclaimer Code: MKT` | config |
| 1 | `.sn-bar` + `.sn-side` (SCIEX Now brand bar, toggler, sidebar search, Get Help, 3 nav groups) | yes — bespoke interactive chrome-in-content (stuck bar, mini toggle, search form) | none | **`support-shell`** block. Rows: brand (`<a href="/support"><img></a>`), search (`<p><a href="https://sciex.com/search-results">Search online help...</a></p>` — link text = input placeholder + hidden label, href = form action), help (`<p><strong><a href="#getHelpModal">Get Help</a></strong></p>`), then ONE ROW PER NAV GROUP `label \| <ul><li><a>`. Layout: the block's section floats left 292px (50px mini); every other section takes `margin-left` — the flex shell becomes `body.sciex-now main` CSS (§ 3) | container; template-slotted fixed rows + reconstructive groups |
| 2 | `.sn-hero` (one slide: image, grey bar with title + orange CTA, square indicator) | yes — bespoke composition | `hero` (D11 name kept archetype-prefixed: `support-hero` — the v3 `hero`/`hero-small` blocks are different patterns) | **`support-hero`**: rows picture / `<p>` title / `<p><strong><a>` CTA. The title stays a `<p>` (live: `h4 > span`, classified *body* by the inventory; the page h1 is the intro heading) | simple; template-slotted |
| 3 | `.richtext` intro (h2 + 2 p) | **no** — prose | — | **default content**: `<h1>You have CE, LC, mass spec questions? SCIEX has the answers.</h1>` (the page's single h1 — live has none; styled exactly like the 28px teal h2) + 2 `<p>` | — |
| 4 | `.ig-comp` support-network image map (7 hexagon PNG states, copy swap on hover, mobile stacked list ≤1024) | yes — repeating states + bespoke hover mechanic | none | **`image-map`**: ONE ROW PER HOTSPOT STATE `picture \| <h2>title</h2><h3>copy</h3>` (7 rows; row 1 = rest state). Hotspot geometry (7 rect areas in the 1140×400 artwork's coordinate space) is FIXED in block JS, tied to the artwork, rows map to hotspots by order (D15: coordinates are code, not authored text). Mobile list = the same authored copy elements (rows 2–7), one DOM, two layouts | container; reconstructive |
| 5 | `.sn-band` green search band (lede + search form) | yes — form | none | **`search-band`**: rows `<p>` lede / `<p><a href="https://sciex.com/search-results">Search articles, discussions, FAQs, and more</a></p>` (text → placeholder + hidden label; href → action; hidden `source=portal` input generated) | simple; template-slotted |
| 6 | `.sn-video` (mp4 player, poster, empty h1, " min" length line) | yes — media | `video` (Block Collection) | **`video`**: one cell — poster `<img>` + `<p><a href="https://sciex.com/content/dam/SCIEX/videos/support/sciexnow-dashboard-video.mp4">…</a></p>` (embed-passthrough, V-02; the live URL answers 206 video/mp4). Poster `<picture>` stays in a hidden authorable wrapper; the link `<p>` moves into an sr-only wrapper (editable, hidden). The empty `h1`/`span` and the JS-filled " min" line (never populated on live; white on white) are NOT authored — their 39px of line boxes are block padding (#112) | simple (Block Collection shape) |
| 7 | `.richtext` benefits (h2 + 10-item ul + flyer link between two `<p>&nbsp;</p>`) | **no** — prose | — | **default content**, section style `sn-benefits` (the two dropped `&nbsp;` line boxes = margins on the link paragraph, #112) | — |
| 8 | `.sn-contact` teal "Contact Support" bar (+ hidden `#reqSupportPath`, empty eq-height row) | **no** — one heading | — | **default content** `<h2>Contact Support</h2>`, section style `contact-bar` (also carries the shell's trailing 40px). Hidden path `<p>` / empty row not authored | — |
| X | logged-in dashboard (`display:none`), Get Help modal (`.mfp-hide`), `#modaladdinstrument`, hidden tokens | — | — | **decided-out** (dynamics X-01 / M-02): DOM parity only in the prototype; never authored. The round-trip runs against a fixture copy of the prototype with the modal removed (`stardust/.work/deploy/g4/fixtures/support-proposed.html`, served with `<base href="/prototypes/">`) — the same fixture technique the pharma pass used | — |

### /support/software-support (`Template: legacy`)

| # | module | D1: block? | D11 | EDS result | tier / shape |
|---|---|---|---|---|---|
| 0 | metadata | — | — | Title `Software Support`, Description (lede), `Template: legacy`, `Footer: /footer-legacy`, `Disclaimer Code: GEN-MKT-18-5103-C` | config |
| 1 | `.lg-pagetitle` (teal 250px band, 16% icon cell, h1, zero-height brand colour bar) | yes — bespoke composition | none | **`page-title`** block, variant **`legacy`**: rows picture / `<h1>`. Empty `h1.heading-1` not authored; the 4 colour-bar cells are generated decoration | simple; template-slotted |
| 2 | `.lg-breadcrumb` (Home › Support › Software Support) | yes (navigation with glyph separators, hidden ≤992) | `breadcrumb` (shared) | **`breadcrumb legacy`** — REUSED as-is (KB contract: one `<ul>`, last item plain text → decode self-links it). `body.legacy` re-tunes the KB's 48px lead padding to 8px top / 48px bottom (the legacy 40px lead spacer sits BELOW the crumb on these templates) | reuse |
| 3 | `.richtext` (h2 + 3 p, inline link) | **no** | — | **default content** (template type: h2 24px #0084a9, p 16/24 #5f6062, links #00afdb) | — |
| 4 | `.title > .lg-band` (teal band, white 28px h1) | **no** — one heading with a background | — | **default content** `<h2>` + section style **`legacy-band`** (second h1 on live → h2: one h1 per page) | — |
| 5 | `.lg-cards` (2 half-width cards: icon square, h4, p, chevron link) | yes — repeating units | `cards` | **`cards legacy`** — CSS-ONLY variant over the canonical block's default card template (append-only to cards.css; cards.js untouched — the default `decorateProducts` path already yields `.card > .card-media + .card-body(.card-title h3, .card-text p, p>a)`). Rows `picture \| <h3>title</h3><p>copy</p><p><a>Learn more</a></p>` (h4 → h3 per the outline rule); the chevron is an `a::after` FontAwesome glyph. Side effect accepted: the block links the icon to the card CTA (`mediaLink`), aria-label = CTA text | container; reconstructive (reuse) |
| — | `#support-comp`, empty `.htmlInjectionContainer` | — | — | nothing (empty on live) | — |

### /education/grant-support (`Template: legacy`)

| # | module | D1: block? | D11 | EDS result | tier / shape |
|---|---|---|---|---|---|
| 0 | metadata | — | — | Title `Grant Support Programs`, Description (lede), `Template: legacy`, `Footer: /footer-legacy`, `Disclaimer Code: RUO-MKT-18-10525-A` | config |
| 1 | `.lg-breadcrumb` (Home › Grant Support Programs) | yes | `breadcrumb` | **`breadcrumb legacy`** reused; section style `grant-crumb` (mobile spacer 20px instead of 40px, as live `.lg-grant__crumbspacer`) | reuse |
| 2 | `.lg-feature` hero image | **no** — one image | — | **default content** `<p><img></p>`, section style `grant-hero` (`line-height: 0` on the picture paragraph, #111; 30px below) | — |
| 3 | `.lg-grant__intro` (bold h2, h2, p, ul, p, orange `.btn-legacy` → `#grantsform`) | **no** — prose + one CTA | — | **default content**, section style `grant-intro legacy-cta orange`: `<h1><strong>Grant funding support &amp; resource tools</strong></h1>` (page h1; live h2>strong, inventory role *body* — the `<strong>` is the captured mark), `<h2>`, `<p>`, `<ul>`, `<p>`, `<p><strong><a href="#grantsform">Contact a grant writing expert</a></strong></p>`. `legacy-cta` (KB, `.btn` metrics) reused + new modifier **`orange`** (live `.btn.orange` paint, hover rgb(206,129,40)) | — |
| 4 | `.lg-grant__research` (h2 + 8 `.lg-tile`) | yes — repeating units | `cards` | section style `grant-research`: `<h2>` as DEFAULT CONTENT head + **`cards tiles`** — CSS-ONLY variant (same default card template). Rows `picture \| <h3>title</h3><p><a>…</a></p>[<p><a>…</a></p>]` (1–2 links, `uniform:false` honoured by the flat p list). The two per-image background tints (live `img.darkforensics-bg` / `.darkenvt-bg`, tiles 4 and 8) ride `:nth-child` on the generated card wrapper — artwork-bound decoration | container; reconstructive (reuse) |
| 5 | `#grantsform` (centred h2 + 50% Marketo iframe `https://info.sciex.com/LP=2259`, 900px) | yes — third-party frame | `embed` (Block Collection) | section style `grant-form` + section-metadata `id: grantsform` (the CTA target) + **`embed legacy`**: one cell `<p><a href="https://info.sciex.com/LP=2259">https://info.sciex.com/LP=2259</a></p>` (URL as link text = the collection convention). `scripts/scripts.js` has no embed auto-block and is out of scope, so the block is authored (the brief's explicit fallback); the iframe mounts on intersection; the link `<p>` moves into an sr-only wrapper | simple (Block Collection shape) |
| 6 | `p#ruoNum` `RUO-MKT-18-8016-A` (11px) | **no** | — | **default content** `<p>`, section style `ruo-note` (displayed copy verbatim — an ALL-CAPS code the lint may advise on; it IS the live page text) | — |
| — | trailing empty `.sciex-section` (40px lead spacer) | — | — | `ruo-note` section `padding-bottom: 40px`; `body.legacy main { padding-bottom: 50px }` = `.home-section` 40 + the legacy footer XF's 10px strip (as KB) | — |

## 2. Blocks (names locked; component-model shapes)

| block | tier | shape | schema section (re-cut) | @ew-exempt |
|---|---|---|---|---|
| `support-shell` | template-slotted (bar/search/help) + reconstructive (nav groups) | container | `support.json § support-shell` (UL ×3 groups → `li` count proxy) | none (label `<p>`, link `<p>`s and `<ul>`s all MOVE) |
| `support-hero` | template-slotted | simple | `§ support-hero` | none |
| `image-map` | reconstructive | container (1 row per state) | `§ image-map` (6 mobile units; 7 rows) | none |
| `search-band` | template-slotted | simple | `§ search-band` | none |
| `video` | template-slotted (Block Collection `video`) | simple | `§ video` | none (link `<p>` hidden but editable) |
| `page-title` (+`legacy`) | template-slotted | simple | `support-software-support.json § page-title` | none |
| `embed` (+`legacy`) | template-slotted (Block Collection `embed`) | simple | `education-grant-support.json § grant-form` | none |
| `cards legacy`, `cards tiles` | reuse (CSS-only variants) | container | `§ cards`, `§ grant-research` | — |
| `breadcrumb legacy` | reuse | simple | `§ breadcrumb` | — |
| `header`, `footer` (legacy variant by Twitter link) | reuse | — | chrome | — |

Not created: `legacy-band` (D1 → section style, one heading), `sn-contact` (D1 → section style `contact-bar`).

## 3. Template-class mechanism, section styles, chrome

- **`Template: legacy`** → `body.legacy` (pages 2–3). `Template: sciex-now` → `body.sciex-now` (page 1). Both APPENDED to
  `styles/styles.css` as new sections; the existing `body.kb-article` rules are untouched (their declarations are repeated
  under the new body classes where the templates share them: Helvetica stack + grey ink, 1170px column, p rhythm,
  `--body-font-family: geogrotesque-legacy` so weight-400 chrome renders the static Ge2003 cut).
- **`body.sciex-now main`** replaces the prototype's flex `.sn-shell`: `main { position: relative; font 14/22.4 Helvetica;
  color #212529; padding-bottom 10px (the footer XF's white strip); background = two layers (sidebar tint 292px | body tint,
  white 10px bottom band) }`; the `support-shell` section `float: left; width: 292px`; every other section
  `margin-left: 292px; padding: 0 26px` (`.sn-body` 6 + `.sn-body__pad` 20) with `> div { max-width: 1170px; margin: 0 auto;
  padding: 0 15px }` (`.no-bleed`). Sections stay in normal flow (NOT grid/flex items, which are BFCs) so the module margins
  collapse exactly as the prototype's single `.no-bleed` flow. `main.sn-mini` = 50px column; 768–991 `margin-left: 337px`
  (live `.main-body{margin-left:45px}`); ≤767 shell hidden, full width. No `html{font-size:14px}` — the EDS chrome is px-based,
  the rem compensations are explicit px (`.page--sn` rules → `body.sciex-now header/footer …`).
- **Section styles (closed set added):** `legacy-band`, `grant-hero`, `grant-intro`, `grant-research`, `grant-form`, `grant-crumb`,
  `ruo-note` (legacy); `sn-benefits`, `contact-bar` (sciex-now); modifier `orange` on the reused `legacy-cta`.
- **Chrome:** `header.css` append — `body.legacy header .hdr-dropbtn` (weight 400, padding 0, as kb-article) and
  `body.sciex-now header .hdr-nav-row > ul > li > a, .hdr-dropbtn { 14px/22.4px }`. `footer.css` append — `body.sciex-now footer`
  14px/22.4 heads/links/social, `.ftr-links > * ~ * 17.5px` ≥640, `.ftr-lang-label 10.5px`, `.ftr-col-mobile 17.5px 0` + its
  controls 14/22.4. The legacy variant itself is keyed on the Twitter link of `/footer-legacy` (all three pages point at it).
- **Fonts:** `fonts/hs-admin-icons.woff` (Unify admin icon font, open) + `fonts/glyphicons-halflings-regular.woff` (MIT) copied
  from the prototype assets; `@font-face` appended to `styles/fonts.css` (`hs-admin-icons`, `glyphicons-halflings`) and, for
  the sidebar glyphs, also declared in `blocks/support-shell/support-shell.css` (fonts.css loads lazily — same trick as the
  KB pass's FontAwesome). `proxima-nova` is never rehosted: `search-band` keeps the stack `proxima-nova, Arial, Verdana`
  (permanent justified 🟠).
- **Media:** every editorial image → `https://content.da.live/aemcoder/sdt-sciex/media/legacy/<file>` (uploads listed in
  `stardust/.work/deploy/g4/ready.json`); `search-white.png` (30×30 submit glyph, a CSS background) is inlined as a data URI in
  `search-band.css` (fixed asset; `img/` is outside this agent's write scope).

## 4. Decisions / justifications

- **Get Help** keeps the live `href="#getHelpModal"`: the modal is decided-out, the button is an inert in-page anchor exactly as
  the prototype renders it. Authoring the modal as rows was rejected per the brief (X-01).
- **Hotspot coordinates in code**, rows by order: authors can swap copy/artwork per state; changing the geometry is a developer task
  (the 7 PNG states and the hexagon hit-rects are one design asset).
- **Sidebar link glyphs are `::before/::after` CSS content** on the authored `<a>` (no inner spans): the editor re-renders a `<ul>`
  without spans, so a span-based icon would vanish and shift every row in edit mode; pseudo-elements on the surviving `<a>` do not.
- **Hero title as `<p>`, intro heading as `<h1>`**: live `/support` has no h1 (the video's is empty); the intro h2 is the page's
  real headline. Round-trip roles stay identical (title *body*→*body*).
- **Second h1 on live** (`/support/software-support` band) → `<h2>`; page 3's bold `h2` → `<h1><strong>` (one h1 per page).
- **Video** `preload="metadata"` instead of live `auto` (the real mp4 would otherwise download in full for every anonymous visitor);
  poster + controls + duration render identically. Not `content.da.live` (#103) — the live mp4 URL is authored (V-02 passthrough).
- **`cards` variants are CSS-only** so `cards.js` is not modified while the G1 agent extends it concurrently; the default card
  template already carries every element the legacy cards need. Consequence recorded above (icon linked to the CTA).
- **Disclaimer Code risk (footer owner):** `footer.js` only *replaces* an existing trailing hyphenated code
  (`/\b[A-Z]{2,}(?:-[A-Z0-9]+)+\.?\s*$/`); `/footer-legacy` ends "…under license." with no code, so `MKT` /
  `GEN-MKT-18-5103-C` / `RUO-MKT-18-10525-A` will not render until footer.js appends the code when no match exists (and `MKT`
  alone has no hyphen group). Metadata is authored as specified so the fix is code-only.
- **Harness:** `Template`, section-metadata `style`/`id` and `Footer:` are pipeline-applied; the local copy is post-processed by
  `stardust/.work/deploy/g4/harness-pipeline.mjs` (KB's script + `id` support). The deployed page is the load-bearing proof.
- **Links:** root-relative only for the migration set (`/`, `/support`, `/support/software-support`, `/education/grant-support`,
  `/resource-hub`, `/products`, `/products/software`, …); everything else `https://sciex.com/...` (login, search-results,
  sidebar SCIEX Now pages, DAM PDFs, sw-support-plns, software-downloads).

## 5. Gate findings and fixes (local, 2026-09-18)

- **Foundation BFC vs live margin collapse.** `main > .section > .default-content-wrapper { display: flow-root }` (styles.css)
  turns every prose section into a BFC, so live's collapsing module margins ADD across sections (+14px above the image
  map, +18px above the contact bar, measured at 1440). Appended override: `display: block` under `body.sciex-now` /
  `body.legacy`. Likewise `main li { font-size: 16px; line-height: 24px }` inflated the 10-item benefits list by 16px →
  `li { font-size: inherit; line-height: inherit }` under both templates. After the fix every /support module anchor is
  within 2px of the prototype (the +2 is the v3 header's own height), pages 2–3 within ±1px.
- **`cards legacy` chevron row.** First modelled as live does (an ABSOLUTE `.lg-card__more`); the EW probe reported
  blockΔh +44px in edit mode: Chromium gives an empty `contenteditable` root a caret line box when its only child is out
  of flow, so an absolutely positioned authored paragraph always drifts in the workspace. Re-modelled as a flex column
  (`.card-body` flex, row `margin-top: auto`, `.card-text` padding-bottom 15 → text→rule 35px, rule→edge 20px as live);
  blockΔh 0, anchors identical. Also pinned `font-weight: 400; letter-spacing: normal` on the variant's paragraphs (a
  generic cards rule sets 330 / 0.08px, which wrapped the description to two lines) and `align-items: stretch`.
- **`breadcrumb legacy` on these templates:** `padding: 8px 0 48px` (the 15px inset already comes from the column wrapper).
- **Shared `breadcrumb.js` self-links the current item** (`<a aria-current>`), while the legacy templates render plain
  bold text: block-roundtrip flags ROLE SWAP body→cta (🔴) on pages 2–3. The block is the pharma/KB agents' (out of this
  brief's write scope); the owned-block round-trips (`--blocks page-title,cards` / `cards,embed`) exit 0, and an appended
  `.breadcrumb.legacy a[aria-current]` rule keeps the self-link visually inert (no hover recolour, default cursor).
  Recommended fix for the breadcrumb owner: skip the self-link when the block carries `.legacy`.
- **qa-gate on /education/grant-support: 17 ok, 1 fail = `pageerror` "jQuery is not defined" ×3.** The drive proves the
  attribution: 0 pageerrors before the Marketo frame mounts, 3 after — they are `info.sciex.com/LP=2259`'s own console
  errors (the live page carries the same frame). Everything else passes; accepted as a third-party finding.
- **Image-map hotspots need `href`** — an `<area>` without one is not hit-tested in Chromium; `href="#"` as live, click inert.
- **Harness images** (`content.da.live`, auth-gated → 401 locally) render as alt text; the drives and anchor probes run
  on `*-img.html` copies whose media URLs point at the locally served prototype assets (harness only, content untouched).
- **stylelint:** all G4 files clean; `blocks/cards/cards.css` reports two errors in the G1 agent's `.cards.media` rules
  (deprecated `clip`, longhand `gap`), outside the G4 append — left for that agent.
- **Text 🟡/🟠 left standing:** round-trip EXTRA cta for the two search links and the two media/embed source links (authored
  form actions / media URLs, hidden but editable), MISSING BODY " min" (dropped junk); lint D1 advisories on the
  template-slotted single-column blocks (bespoke widgets/media) and D3 on `support-shell` (container shape).

## 6. Phase 2 — published-origin verification (2026-09-18)

- **Compound section styles were inert on the published origin:** the pipeline delivers a multi-value `style` as ONE
  hyphen-joined class (`grant-intro legacy-cta orange` → `class="grant-intro-legacy-cta-orange"`, seen in `.plain.html`;
  comma-separated joins too). Fixed at runtime by the coordinator (commit b7794f1, `splitCompoundSectionStyles` in
  scripts/scripts.js, token set read from styles.css) — content styles unchanged. Every grant-page measurement taken
  before that commit was discarded and re-run.
- **Published gates (1440):** pixel 3.19/3.11 % (support; Δh −2 = header), 1.19/1.00 % (software-support), 0.98/0.59 % (grant); header crops 100 %/99.66 %, footer crops 98.5–99.7 %; anchors within ±2px on all three; content-diff clean on pages 2–3 (grant: 1 🟠 embed URL), /support 34 🔴 all inside the decided-out dashboard/modal; ai-readability 100/100 ×3; drives 30/30 against the origin (hover swap works on the real `<picture>` once it has loaded).
- **Reconcile round 1 (tree, needsCommit):** (a) /support header 131 vs live 129 → `body.sciex-now { --nav-height: 129px }` ≥1024; (b) footer rem compensations (17.5px mobile columns, 10.5 label, 17.5 gaps) lost to the legacy variant's `:has()` specificity → restated (support-360 footer crop 93.6 % → the missing 40px); (c) grant 360 was +122px: live's app-page row is `main + 30px` (390px @−15 at 360; hero/RUO the full 360) → `grant-*`/`ruo-note` wrappers `width: min(100% + 30px, 1170px)` centred by calc, `grant-hero` 1140 unpadded — harness re-measure 14/14 anchors at 360, 15/15 at 1440; (d) CLS 0.14 on grant = the hero `<picture>` without intrinsic size → `aspect-ratio: 1140/300` (and 847/350 on the support hero); (e) the Marketo frame mounts into a reserved 907px box (`min-height`, shift 0). Pending commit → re-stitch support/grant at 360 and re-run the guards.
- **Findings left standing:** grant qa-gate/guard pageerrors = the Marketo frame's own jQuery errors; chrome-parity "All" facet `<button>`→`<span>` (header block, site-wide); family-name fork `geogrotesque → geogrotesque-legacy` (scoped alias, same file).
- **Round 1 verified on the origin:** support 2.73/2.58 % @1440 (Δh +2 at the footer bottom; header now 129 = live), 3.54/3.41 % @360 (Δh 0, footer 1588 = live); grant 1.78/1.55 % @360 (Δh −1; was 19.43 %), CLS 0.144 → 0.0003 @1440; guards 6/6 PASS. Residual: support-360 footer crop 96.25 % = a uniform ≤1px thin-edge outline on the footer's 14px-rem type (fractional 22.4px line boxes) + the IDT partner logo box — no missing paint, footer owner / site-wide.
