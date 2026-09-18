<!-- stardust:provenance
  writtenBy: stardust:extract
  writtenAt: 2026-09-18T07:20:00Z
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/pages/*.json (73)
    - stardust/current/pages/*.html (73)
    - stardust/current/assets/screenshots/*.png
    - stardust/.work/page-types.json
    - https://sciex.com/
  synthesizedInputs: []
  stardustVersion: 0.10.0
  mode: descriptive current state (replica target = current state)
-->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Scientists and laboratory staff who run or buy LC-MS and capillary-electrophoresis instrumentation: pharma and biopharma researchers (bioanalysis/DMPK, biomarker quantitation, biologics characterization), clinical and clinical-diagnostics laboratories, environmental, food-and-beverage and forensic testing labs, and biomedical/omics researchers. The site addresses them in the second person as "your lab" / "your team" and routes them by application (`/applications/*`) and by product line (`/products/*`).

A second, authenticated audience is the existing customer: SCIEX Now users who log in (Danaher One Login) to reach the dashboard, support cases, software downloads, registered instruments, training (110 login-gated `/training/*` URLs) and 1,789 knowledge-base articles.

Sources: `pages/index.json` headings ("Why SCIEX for your application": Clinical Diagnostics, Environmental Testing, Food and Beverage Testing, Forensics Analysis, Life Science Research, Pharma and BioPharma Research); `pages/support.json` ("SCIEX Now gives you everything you need" list); `/tmp/sciex-urls.txt` path counts.

## Product Purpose

sciex.com is the corporate and product web presence of SCIEX, a Danaher life-sciences operating company that makes mass spectrometers, capillary-electrophoresis systems, front-end HPLC, ion sources, software (SCIEX OS, Analyst) and consumables. The site (a) presents the portfolio and the applications it serves, (b) converts interest into "Request a quote" / "Contact support" / "Shop" actions, and (c) hosts the SCIEX Now support network (dashboard, KB, downloads, training, service).

Captured description (`meta[name=description]`, home): "As a leader in life science industries, SCIEX provides the precision detection and quantitation of molecules needed for scientists to make discoveries that change the world."

## Positioning

Observed claim on the home hero: "The leader in mass spectrometry and capillary electrophoresis solutions — There, where it counts. Time and time again." Product copy leans on speed/sensitivity/robustness ("Unlock the proof that powers extraordinary discoveries", "Confidence when it counts", "Be unstoppable with comprehensive charge variant analysis on a single system") and on being a partner ("collaborating with a team that is devoted to advancing pharma and biopharma research"). The parent brand is present but subordinate: Danaher logo in the footer, "A Danaher company" in press releases, and a 9-logo strip of sibling Danaher life-sciences companies (Beckman Coulter Life Sciences, Genedata, IDBS, Leica Microsystems, Molecular Devices, Phenomenex, Aldevron, IDT, abcam).

## Operating Context

- Regulated laboratory context: recurring disclaimers "For research use only. Not for use in diagnostic procedures." and the footer statement "The SCIEX clinical diagnostic portfolio is For In Vitro Diagnostic Use. Rx Only." (footer `p#disclaimer`, 64 pages).
- Product nomenclature is dense and trademarked (ZenoTOF 8600, X500R QTOF, QTRAP, Triple Quad 7500+, Echo MS+, Intabio ZT, BioPhase 8800, SCIEX OS, Analyst, SelexION) and appears with ®/™ marks in headings.
- Content types in the live inventory (sitemap, 2,826 URLs): KB articles 1,789 · press releases 278 (+20 year indexes) · application pages ~148 · product detail ~113 · product stewardship/WEEE country pages ~94 · methods and spectral libraries 77 · login-gated training 110 · profiles 59 · technology 16.
- Commerce is external (`us-store.sciex.com` "Shop"); quotes go through `/form-pages/product-request`; support cases and downloads sit behind login.
- Third-party layers observed on every page: OneTrust consent, WalkMe nudges (the "please login to sciex.com" tooltip), Coveo search, Qualtrics feedback tab, a chat launcher, Dreamdata/Eloqua/Salesforce analytics.

## Capabilities and Constraints

- Platform: Adobe Experience Manager Sites (`/etc.clientlibs`, `/content/dam`, `aem-GridColumn`, experience fragments for header/footer) behind Fastly; Alpine.js for menu/tab state, Splide carousels, Plyr video CSS.
- Three front-ends co-exist and must be told apart when reading captures:
  1. **v3 Tailwind** (`clientlib-site.min.css`, `body.stretch-text`) — 51 of 73 sample pages; home, hubs, products, applications, technology, about, press.
  2. **Legacy "globalpage"** (`clientlib-base` + `clientlib-global`, `body.globalpage`) — 15 of 73; KB articles, SCIEX Now support shell, intermediate and detail templates, whitepapers microsite; proxima-nova + teal/orange palette; FontAwesome icons.
  3. **Edge Delivery blocks** (`/styles/styles.css`, `/blocks/*`, `/nav.plain.html`, `/footer.plain.html`) — 3 of 73; contact-us, KB landing, customer-documents search. These pages already run on the target architecture.
- The header and footer are shared across all three (legacy pages load `header-footer/header.css`; EDS pages load `/blocks/header`), so the brand chrome is consistent even where the body design system differs.
- Search is Coveo (`/search-results?contentType=…`, 1,098 user guides indexed); KB filtering by product taxonomy (`?filter=sciex:products/...`).
- Localisation: hreflang to `sciex.com.cn` (zh-CN), `sciex.jp` (ja-JP), `sciex.com/kr` (ko-KR); footer language selector with flag PNGs.
- Undecided / not captured: authenticated SCIEX Now screens, the quote form, the store, and the Coveo result templates beyond one page.

## Brand Commitments

- **Register: brand** (marketing landing surface dominates; a support-portal surface sits behind Support/Login — noted, not ambiguous).
- Name and mark: "SCIEX" italic-slanted wordmark, inline SVG 95×32 white on `#141414` (`assets/logo.svg`); mobile 88×28 variant in the same header; favicon `assets/favicon.png`.
- Personality as observed: precise, technical, confident, benefit-led imperatives; sentence-case headings (4.0% uppercase across 681 headings); very light display weight (Geogrotesque 270) against a single saturated blue (`#0068fa`); square-cornered photography; flat surfaces with no shadows.
- Typeface: Geogrotesque (Emtype) — the variable "Sharp VF" cut on v3/EDS pages, static Ge2003 cuts on legacy pages; proxima-nova (Adobe Fonts kit) only on legacy pages. Both are commercially licensed; verify rights before redeploying (`_brand-extraction.json#type.files[].licensingFlag`).
- Observed anti-references (things the v3 system does not do): no drop shadows on cards, no rounded imagery, no gradients except the button hover fill, no uppercase headings, no icon fonts (inline SVG line icons only), no serif type.
- Recurring signature moves: fill-up button hover (blue-800 rises from the bottom), arrow-link with sliding 1px underline, 50% black scrim over hero photos, grey-800 "SCIEX Now support network" band above every footer, 9-logo Danaher partner strip.

## Evidence on Hand

- `stardust/current/pages/<slug>.json` + `.html` — 73 live Playwright captures (headings, body text, CTAs, links, media, custom properties, rendered DOM).
- `stardust/current/assets/screenshots/<slug>.png` — 73 full-page 1440px captures (home shows the OneTrust banner; interior pages show the WalkMe login tooltip).
- `stardust/current/_brand-extraction.json` — palette, type, motifs, component style, 9 system components, voice tables, cross-promo, 55 font files.
- `stardust/current/assets/logo.svg`, `assets/favicon.png`.
- `stardust/current/assets/fonts/` — 55 files: Geogrotesque_Sharp_VF (woff2/woff), Geogrotesque-Lt/UltLt, 28 static Ge2003-* cuts, 18 proxima-nova Typekit files, FontAwesome 4.2, Glyphicons.
- `stardust/current/assets/css/` — `clientlib-site.min.*.css` (v3), `legacy/` (clientlib-base, clientlib-global, clientlib-sciex-now, clientlib-hero, stormtrooper), `eds/` (18 block/style sheets), `header.*.css`, OneTrust CSS.
- `stardust/current/assets/media/` — 42 content images from the three archetype pages with `_manifest.json` (url → file, natural dimensions, HTTP status); megamenu images deliberately excluded.
- `stardust/.work/page-types.json` — 73 typed pages, 21 visual families, sitemap sizing.
- Absent (do not fabricate): authenticated SCIEX Now screens, quote/contact form fields, store pages, video posters (4 mp4 sources have no poster), a dark-on-light logo variant, brand guidelines.

## Product Principles

_provenance: inferred — derived from repeated copy patterns and structural choices across the 73 captures; not stated by the site._

1. **Route by the scientist's problem, then by the instrument.** Every hub leads with applications (pharma, clinical, environmental, food, forensics, omics) and only then with product lines; the mega-menu mirrors both.
2. **Proof before promise.** Copy pairs each claim with a mechanism (sensitivity, speed, "on a single system", "compliant-ready"), and product pages carry "Key features", resources grids and spectral/method data tables.
3. **One conversion vocabulary.** "Request a quote" (header, 69 pages) and "Contact support" (band, 52 pages) are the two persistent actions; "Learn more" (287×) is the universal in-page step.
4. **Support is part of the product.** The SCIEX Now band, dashboard cell and login popover appear on every page; the support portal and KB are the largest content mass on the site.
5. **Precision as a visual stance.** Light display type, hairline rules, square imagery, one blue — the visual system stays out of the way of instrument photography and data.

## Accessibility & Inclusion

Observed on v3 pages: `focus-visible` outline/ring utilities on links and buttons (2px `#0068fa`, 2px offset); `tw-sr-only` labels on icon-only social links; `motion-reduce:` variants disable hover transforms and transitions; `aria-label="Breadcrumb"` on breadcrumb nav; `data-cmp-link-accessibility-text="opens in a new tab"`. Gaps observed (recorded, not judged): 71.1% of non-megamenu images carry empty `alt` (1,664 images across 73 pages); one content-free link label ("here", applications-clinical); legacy KB template repeats "Home" three times in the breadcrumb. Body copy `#707070` on white measures 4.7:1; footer links `#8a8a8a` on `#141414` 4.6:1.
