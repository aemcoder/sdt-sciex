# EDS conversion log — SCIEX same-design replica

```json
{
  "_provenance": {
    "writtenBy": "stardust:deploy",
    "writtenAt": "2026-09-18T09:58:00Z",
    "page": "home (/index)",
    "commit": "f0f8090 Home foundation, chrome and blocks for the SCIEX replica (stardust:deploy)",
    "readArtifacts": [
      "stardust/prototypes/home-proposed.html", "stardust/prototypes/css/{canon,home}.css", "stardust/prototypes/js/home.js",
      "stardust/prototypes/interaction-spec.md", "stardust/eds-schema/index.json", "stardust/runtime-contract.json",
      "blocks/*/*.js (JSDoc)", "content/{index,nav,footer}.html", "scripts/site-config.js", "styles/{styles,fonts}.css",
      "stardust/replica/progress.json", "stardust/dynamic-features.md"
    ],
    "notes": "Written by the follow-on agent after the blocks/content had been authored and delivered by a previous agent. Decisions marked (inferred) are reconstructed from the code and JSDoc, not from that agent's notes."
  }
}
```

## Runtime contract (stardust/runtime-contract.json)

vanilla EDS, `@adobe/aem-boilerplate 1.3.0`; block wrapper `.block` inside `div.<name>-wrapper`, section gains `.<name>-container`; buttonization is formatted-only (`strong` = primary, `em` = secondary, `strong+em` = accent; a bare `<a>` alone in a `<p>` is NOT a button); chrome loads `/nav` and `/footer` through `blocks/fragment` (inert-innerHTML script policy); empty sections collapse; `--nav-height` 60px / 131px (≥1024) retuned to the SCIEX header.

## Home page — section triage (prototype `home-proposed.html` → `content/index.html`)

Order in `content/index.html`: metadata → hero → cards promo → cards products → [h2 + lede] tabs → [h2] cards icons → [h2] cards stories → support-band. No section `style` value is used on the home page (no section-metadata rows).

| # | Prototype section (schema key) | Live component | Triage | Locked block · variant | Decode tier | Authoring shape (rows × cells) | Images |
|---|---|---|---|---|---|---|---|
| 1 | `hero` | `.hero-small` dark media hero | D11 block | `hero` | template-slotted (#95): prototype inner DOM is the template, authored nodes MOVE into role slots | 1 row × 1 cell, flat siblings in any order: `<img>` background, `<h1>`, `<p>` lede, `<p><strong><a>` primary CTA (also tolerates one-element-per-row) | DA `/media/home/…hero…-w1920.jpg` |
| 2 | `promo-tiles` (2 units) | `.media-grid` 2-up linked image tiles | D11 block (lint 🟡 "single-column 2-row prose" — justified: two linked image tiles are a genuine grid, not default content) | `cards promo` | reconstructive (authors add/remove tiles) | ONE ROW PER CARD × 1 cell: `<p><a href><img alt></a></p>` | DA `/media/home/*-1280x800-w1920.jpg` |
| 3 | `product-cards` (3 units) | `.three-card` product cards | D11 block | `cards products` | reconstructive | ONE ROW PER CARD × 2 cells: picture \| body (`<h3>` title, `<p>` text, `<p><em><a>Explore now</a></em></p>`) | DA `/media/home/*-2000x1500-w1920.jpg` |
| 4 | `why-sciex-portfolio` (7 units) | `.tab` tabs (desktop) / accordion (<768) | D1 head + D11 block | default content `<h2>Why SCIEX portfolio</h2><p>lede</p>` then `tabs` | reconstructive (Block Collection `tabs` model) — block reabsorbs the section head by MOVING the wrapper children (EW8) | ONE ROW PER TAB × 2 cells: label \| content (`<img>`, `<h3>`, `<p>`, `<p><em><a>Learn more</a></em></p>`) | DA `/media/home/*-2000x1250-w1920.jpg` |
| 5 | `why-sciex-applications` (7 units) | `.icon-4-col` icon cards, 4 per row | D1 head + D11 block | default `<h2>` then `cards icons` | reconstructive; head reabsorbed (EW8) | ONE ROW PER CARD × 2 cells: icon \| body — icon cell is an EDS icon span `<span class="icon icon-app-…">` (authored as `:app-…:` in DA) | repo `/icons/app-*.svg` (7 SVGs) |
| 6 | `stories` (2 units) | `.media-card-carousel` (Splide) | D1 head + D11 block | default `<h2>SCIEX Stories</h2>` then `cards stories` | reconstructive; head reabsorbed (EW8) | ONE ROW PER CARD × 2 cells: picture \| body (`<h3>`, `<p>`, `<p><em><a>` CTA) | DA `/media/home/thoughtleader-*-w1920.jpg` |
| 7 | (outside prototype `<main>`) `.support-band` in the footer XF | "SCIEX Now support network" band | D11 block (lint 🟡 — justified: bespoke full-bleed dark band with its own container and CTA layout; reused as the LAST section of every page) | `support-band` | template-slotted | 1 row × 1 cell, flat siblings: `<h2>`, `<p>`, `<p><strong><a>Contact support</a></strong></p>` | none |

`metadata` block rows: Title, Description. `columns` (boilerplate) and `widget` (dynamic-features scaffold) exist in `blocks/` but are not used on the home page.

Decisions evident in the code (inferred unless stated):
- **One `cards` block, four variants** (promo | products | icons | stories) instead of four blocks — D9/D11, Block Collection `cards` model (stated in `blocks/cards/cards.js` JSDoc). Every authored node MOVES into the card template (EW1–EW3, EW6, EW8).
- **Card titles authored as `<h3>`** although live/prototype paint them as `<p>` — semantic upgrade for authoring and AI-readability; content-diff (proto→published) reports these as 5 "ROLE SWAP body→heading" reds on `products` and `stories`. Accepted (inferred): same text, same paint; the reds are a classification artefact of the upgrade, not dropped content.
- **CTA link text doubles as the media link's `aria-label`** (attribute only, not rendered text) — keeps one editable string per card.
- **Stories pagination "1 / 2" is generated** (allowlisted runtime numerals) and the rail controls mount only when the rail overflows (360: perPage 1; ≥768 both slides fit → no controls), exactly as `js/home.js` in the prototype. Fix applied in this phase: EDS decorates before `cards.css` has applied and after `window.load` has fired for the lazy block, so the first measurement saw full-width slides and mounted the controls at desktop on the published page. `decorateStories()` now re-measures via a `ResizeObserver` on the list/first slide plus a double-`requestAnimationFrame` repaint. Verified on the harness: 1440 → no controls / no `.is-overflow`; 360 → controls present.
- **Section head as default content** (D1) for tabs / icons / stories; the blocks reabsorb it (EW8) so the prototype's head-inside-section layout is preserved without a "title row" in the block table.
- **Full-bleed**: `hero` and `support-band` span the viewport; `main > .section` and `main > .section > div` carry no padding/max-width — blocks own their padding and recreate the 1340px container (#13). qa-gate's `wide-1600` warnings for cards/tabs (content 1536px at 1600 viewport) are expected: the prototype's `.container` is fluid with 40px gutters below its cap.

## Chrome contracts

### `/nav` (content/nav.html) — 5 top-level sections, in this order
1. **brand** — `<p><a href="/">Go to Sciex homepage</a></p>` (text → sr-only; inline SVG logos are template assets).
2. **sections** — one `<ul>` with 8 top-level items; **authored depth = 4 nested lists** (L1 primary item → L2 mega-menu panel labels / trailing "View all …" link → L3 link groups, promo tiles `<a><img></a>`, Training tiles `<a>title</a> text` → L4 links). 238 `<li>`, 32 promo images (DA `/media/…`).
3. **tools** (utility) — `<ul>` Login · Shop · Request a quote · SCIEX Now Dashboard · My account (mobile).
4. **account** — logged-out dropdown list (Create an account · Already have an account? `<strong>Sign in now</strong>` · My profile · My favorite resources).
5. **search** — `<ul>` content-type facet values (All first).

Decode tier: template-slotted (#95) — the prototype `<header>` is the template; sections fill fixed role slots. Dispositions (stardust/dynamic-features.md): S-01 search = redirecting GET form to `/search-results` (no Coveo suggestions); X-01 account = logged-out chrome with absolute sciex.com links; X-02 Shop = external link; M-01 mega menu rebuilt native — level-2 mobile panels are a logged follow-up (level-1 items link to their section landing page). `@ew-exempt all` (chrome fragment).

### `/footer` (content/footer.html) — 6 top-level sections, in this order
1 social `<ul>` (LinkedIn · X · Facebook · Instagram; icon by link host) · 2 language `<p>Choose your Language:</p><ul>` (English/Japanese/Chinese/Korean; flags are fixed repo assets `/img/flags/{us,jp,cn,kr}.png`, I18N-01 switcher = links) · 3 four `<h3>` + `<ul>` link columns (accordions <768) · 4 legal `<p>© Copyright 2026 SCIEX</p><ul>` (Cookies Settings → OneTrust hook, T-01 disabled) · 5 disclaimer `<p>…</p><p><img alt="danher-logo" src="…/media/footer/danaher-logo.png"></p>` · 6 partners `<ul>` (inline logo SVG by link host, text → sr-only). Template-slotted, `@ew-exempt all`.

## Section `style` vocabulary (styles/styles.css — D1, default-content sections only, closed set)
- `grey` — `--grey-50` background, `var(--section-padding)` vertical padding (32px, 48px ≥ 768).
- `dark` — `--grey-900` background, white text incl. headings.
Both defer their paint until `[data-section-status='loaded']`. Neither is used on the home page.

## Tags (scripts/site-config.js) — all `enabled: false`, loaded only by `loadEnabledTags()` from the consented phase
onetrust (T-01, domainScript recorded), gtm (T-02 + T-03 pixels; container GTM-WMZL3B + 4 alternates), decibel (T-04 session replay), salesforce personalization/data cloud (T-05), dreamdata (T-06), fathom (T-07), qualtrics (T-08, 2 zones), walkme (T-09, carries the M-10 login nudge), maxmind geoip (T-12), coveo (S-01/S-02; org + searchHub recorded).

## Fonts policy
Self-hosted reuse of the live faces (`fonts/geogrotesque-sharp-vf.woff2` variable + `geogrotesque-ultlt.woff2`), `@font-face` family `geogrotesque` declared at the discrete live weights 200/270/300/330/450/530 with `font-display: swap` (400 resolves to the 450 face as on sciex.com). Licence confirmation is pending with the owner (see `fonts/LICENSING.md` and progress.json `fontsPolicy`). No Typekit/Barlow substitute in the build.

## Images strategy
All editorial imagery is authored as absolute DA URLs (`https://content.da.live/aemcoder/sdt-sciex/media/{home,footer,…}/…-w1920.jpg`, 15 on `/index`, 32 in `/nav`, 1 in `/footer`), so `createOptimizedPicture` renditions come from DA `/media`. Only fixed template assets live in the repo: `/img/flags/*.png`, `/icons/app-*.svg` + `search.svg`, `favicon.png`.

## Published-origin gate (home, https://main--sdt-sciex--aemcoder.aem.live/) — 2026-09-18
- 1440: pixel 0.47 %, Δh 0 (5502px both); header crop 100 % (0.00 %), footer crop 99.75 % (0.25 %, thick texture = partner-logo strip antialiasing / sub-pixel); chrome-parity `--no-defaults --region header=#mega-menu|header --region footer=#footer|footer`: header 13 pairs / 2 findings (live "All" facet is a `<button>` with 8px padding vs EDS `<span>`; EDS sr-only "Go to Sciex homepage" has no live text source), footer 44 pairs / 18 findings (column labels `<div>`→`<h3>`, © `<span>`→`<p>`, disclaimer/`GEN-MKT-18-7897-A` text split differently, partner names present as sr-only text in EDS only) — all semantic/sr-only, no geometry drift.
- 360: pixel 1.05 %, Δh −5px (published 8384 vs live 8379). anchor.mjs: every `main` section top is identical through the footer top (6359 both); the delta is inside the **footer block**: `.ftr-legal` band 772px vs live 767px (social/link-column container 360 = 360, partners 860 = 860). Not a section-rhythm delta → not fixed here (blocks/footer is out of this phase's write scope); logged as residual for the footer owner.
- content-diff proto→published (`--profile eds`, root `main`): 10 findings — 5 🔴 ROLE SWAP body→heading (card `<h3>` upgrade, accepted above), 3 🟠 EXTRA support-band strings (the band sits outside the prototype `<main>` — expected), 2 🟡 generated pagination numerals (allowlisted). live→published with root `main` is not comparable (live `main` wraps the mega-menu: 755 CTAs) — file kept as `content-diff.txt` for the record only.
- ai-readability: strict 100 %, code 100 % (gate 98). CLS (fonts throttled 1.5s, slow scroll): 1440 0.0002, 360 0.0117 (< 0.1). Computed-style guard: 7/7 main blocks decorated (`data-block-status=loaded`), 7/7 compute grid/flex, header + footer loaded, 18 visible imgs all clientWidth > 0, 0 pageerrors (both widths).
