# EDS port log — pages already served by the source's own Edge Delivery code base

```json
{
  "_provenance": {
    "writtenBy": "stardust:deploy (sx-port:convert sub-project, agent g5)",
    "writtenAt": "2026-09-18T12:05:00Z",
    "pages": ["/events (?event=upcoming|on-demand)", "/resource-hub", "/resource-hub/regulatory-documents", "/about-us/contact-us"],
    "sourceCodeBase": "https://sciex.com/{scripts/aem.js, scripts/scripts.js, blocks/*, scripts/**, styles/{styles,site,fonts}.css} — fetched 2026-09-18 with a real-Chrome UA (--compressed; the origin serves brotli)",
    "readArtifacts": [
      "stardust/current/pages/{events,events-f4f6,resource-hub,resource-hub-regulatory-documents,about-us-contact-us}.{json,html}",
      "stardust/current/assets/screenshots/<slug>.png", "stardust/dynamic-features.md (S-02, S-03, A-03, M-09, CR-01, L-01, D-01)",
      "$SK/dynamics/reference/off-origin-data.md", "$SK/deploy/SKILL.md §9 + Local QA", "scripts/{aem,scripts,site-config}.js", "styles/styles.css", "content/applications/pharma-and-biopharma.html (cell shape oracle)"
    ],
    "policy": "port, don't recreate — block JS/CSS copied verbatim, only import paths (and the sx- prefix on the one colliding block) changed; every deviation is listed under ‘Adaptations’",
    "workDir": "stardust/.work/g5/ (source copies under src/, blocks/, scripts/, styles/; downloaded media under media/; gate script gate.mjs; screenshots shots/)"
  }
}
```

## 0. How the source pages are built (what the `.plain.html` told us)

| page | fetch | blocks (in order) | section metadata |
|---|---|---|---|
| `/events` | `/events.plain.html` 301→`/events.plain` 404 (a redirect rule strips `.html`); the delivered HTML (`GET /events?event=upcoming`, 2.4 kB EDS shell) carries the whole `<main>` inline | `breadcrumb` (cells `1`,`1`,``,``) · `events` (cells `events`, `danaherproductionrfl96bkr`, public Coveo search token) | none (one section: `breadcrumb-container events-container`) |
| `/resource-hub` | 200 | `breadcrumb` · `sciex-text` · `sciex-favorite` · `resourcehub-search` · `categories` · `featured-key-workflows` · `cta-with-text` | none |
| `/resource-hub/regulatory-documents` | 200 | `sciex-text` · `sciex-favorite` · `resourcehub-search` · `categories` · `cta-with-text` | none |
| `/about-us/contact-us` | 200 | `hero-small` · `sciex-headquaters` · `icon-card` · `contact-information` · `cta-with-text` | none |

`?event=upcoming` and `?event=on-demand` are ONE page: `blocks/events/events.js` reads `event` (and `region`, `application`, `year`, `month`) from the query string, preselects the tab/facets client-side, then `history.replaceState`s the clean URL. Content: one page `content/events.html`.

Source runtime facts that matter: their `aem.js` (v2024+, with `wrapTextNodes`) wraps bare text cells in `<p>` before `decorate()` — ours does the same (`scripts/aem.js` L379/L553), so the `rows[n].querySelector('p')` reads in their blocks work unchanged. Their `styles.css` is the boilerplate base + search-results CSS; `site.css` is the Tailwind bundle of their header/footer (a preflight that zeroes heading/paragraph margins and sets heading `font-size: inherit`). Their `head.html` loads `styles.css` then `site.css`.

## 1. Block inventory → action

| source block | used by | imports (source) | collides with ours? | action |
|---|---|---|---|---|
| `header`, `footer` | all | — | yes (our chrome) | **not ported** — our `/nav`, `/footer` render |
| `breadcrumb` | events, resource-hub | `scripts.js#createElement`; `fetch(<ancestor>)` for page titles (KB paths only) | **yes** (`blocks/breadcrumb`) | ported as **`sx-breadcrumb`** — dir, class in content, and every internal selector renamed (`.sx-breadcrumb-{container,wrapper,link,separator,resource-link}`); its unscoped `main > .section > div { padding: 15px 47px }` rule (a global side effect on the source) scoped to `main:has(.sx-breadcrumb) > .section > div` |
| `events` | events | `scripts/events-page/**` → Coveo Headless CDN | no | ported as-is; imports → `scripts/sx/events-page/**`; Headless → `scripts/sx/coveo-headless-shim.js` (see §4) |
| `sciex-text` | resource-hub, regulatory | `aem.js` (empty import) | no | ported as-is |
| `sciex-favorite` | resource-hub, regulatory | `aem.js#decorateIcons`; `fetch('/bin/sciex/favorite-all-content')` logged-in only (M-09/X-01) | no | ported as-is; icons via `decorateIcons(el, '/blocks/sciex-favorite')` (§3); logged-out state renders (no fetch) |
| `resourcehub-search` | resource-hub, regulatory | `scripts/header-search/headerSearchController.js` → Coveo `buildStandaloneSearchBox` (token in `headerSearchEngine.js`) | no | ported as-is; Coveo → shim (suggestions empty, submit redirects, §4) |
| `categories` | resource-hub, regulatory | `aem.js#decorateIcons`, `scripts.js#moveInstrumentation` | no (`cards` is ours, this is `categories`) | ported as-is |
| `featured-key-workflows` | resource-hub | `scripts.js#moveInstrumentation`; CSS `url("/icons/right-arrow.svg")` | no | ported as-is; CSS url → `/blocks/featured-key-workflows/icons/right-arrow.svg` |
| `cta-with-text` | all three hub/contact pages | `aem.js` (empty import) | no | ported as-is |
| `hero-small` | contact-us | `dom-builder.js#span`, `aem.js#decorateIcons` (`icon-arrow`, `icon-arrow-blue`) | no (ours is `hero`) | ported as-is; icons via prefix `/blocks/hero-small` |
| `sciex-headquaters` | contact-us | `dom-builder.js#div`, `scripts.js#moveInstrumentation` | no | ported as-is (source spelling kept) |
| `icon-card` | contact-us | `dom-builder.js#span`, `aem.js#decorateIcons`, `scripts.js#moveInstrumentation` | no | ported as-is; icons via prefix `/blocks/icon-card` |
| `contact-information` | contact-us | `scripts/blocks-controllers/partner-controller.js` → `GET /bin/sciex/partners` | no | ported as-is; controller → snapshot (§4) |

Shared scripts → `scripts/sx/` (never `scripts/aem.js` / `scripts/scripts.js`):

| source | ported to | change |
|---|---|---|
| `scripts/scripts.js` (exports only: `getCookie`, `moveAttributes`, `moveInstrumentation`, `applyClasses`, `createElement`) | `scripts/sx/scripts.js` | page boot / WalkMe / Qualtrics NOT ported |
| `scripts/dom-builder.js` | `scripts/sx/dom-builder.js` | verbatim |
| `scripts/blocks-controllers/partner-controller.js` | `scripts/sx/blocks-controllers/partner-controller.js` | endpoint → `sxPort.partners.url`; exposes `data-snapshot` |
| `scripts/events-page/{event-engine, controller/event-page-controllers, components/*}.js` (9 files) | `scripts/sx/events-page/**` | verbatim; `https://static.cloud.coveo.com/headless/v3/headless.esm.js` → `../coveo-headless-shim.js` |
| `scripts/header-search/{headerSearchController,headerSearchEngine}.js` | `scripts/sx/header-search/` | verbatim; same import rewrite |
| — | `scripts/sx/coveo-headless-shim.js` | NEW (ours) — §4 |

Their `styles/` are not ported wholesale (§2). Their icons `/icons/{arrow,arrow-blue,resource-hub-down,empty,knowledge,tech-notes,regulatory,user-guides,self-paced,instructor,right-arrow}.svg` are shipped under the owning block (`blocks/<name>/icons/`) because `icons/` is outside this phase's write scope; `decorateIcons(el, prefix)` (vanilla signature) points there. The coordinator may move them to `/icons/` and drop the prefixes.

## 2. Styles — `body.sx-port` scope (styles/styles.css, marked section at the end)

Each ported page carries `Template: sx-port` → `decorateTemplateAndTheme()` adds `body.sx-port`. The section reproduces only what the four pages' block CSS leans on, taken from the EFFECTIVE cascade of `styles.css` + `site.css` (preflight wins ties): source tokens with their exact names (`--Blue-700`, `--Grey-100/200/500/700/900`, `--Neutrals-900`, `--link-color` …; names are load-bearing in the ported CSS, so `custom-property-pattern` is disabled around them), `main > .section` 40px rhythm + 1200px/24px→32px wrappers, the ≥1440 `90pc` widening of the named `*-wrapper`s, headings with margin 0 / size inherit / "Geogrotesque MD", links `#3b63fb` + hover underline, the `button` / `a.button` chrome, `.icon` unsized, the `.text-echo`/`.text-blue` utilities the icon-card content carries, `body.event-modal-open` scroll lock, and `@font-face` aliases mapping "Geogrotesque Sharp VF" and "Geogrotesque MD" onto our self-hosted VF file ("Geogrotesque" matches our `geogrotesque` face case-insensitively).

**Specificity lesson (fixed during the eyeball):** the first cut used `body.sx-port main h1 {…}` (0,1,2), which out-ranked the ported block rules (`.sciex-text h1`, `.more-events-button` …) and flattened every heading and the "More Events" button. All base rules now use `:where(body.sx-port) …` so they keep the SOURCE specificity — they tie with our own base rules and win by order, while the ported block CSS out-ranks them exactly as on sciex.com.

## 3. Adaptations (every deviation from verbatim)

1. Import paths: `../../scripts/scripts.js` → `../../scripts/sx/scripts.js`; `dom-builder`, `blocks-controllers`, `events-page`, `header-search` → under `scripts/sx/`; `../../scripts/aem.js` unchanged (ours exports the same `decorateIcons`).
2. Coveo Headless CDN import → `scripts/sx/coveo-headless-shim.js` (3 files).
3. `decorateIcons(x)` → `decorateIcons(x, '/blocks/<block>')` in hero-small, icon-card, sciex-favorite, categories (icons shipped per block, see §1).
4. `featured-key-workflows.css`: `url("/icons/right-arrow.svg")` → block-local path.
5. `sx-breadcrumb`: rename (dir, block class, 5 internal class names) + scoping of one global rule (§1).
6. Every ported file got a one-line provenance header (`/* eslint-disable -- sx-port: ported verbatim from … */`, `/* stylelint-disable -- … */`); ported CSS was run through `stylelint --fix` (formatting only — 192 formatting findings; 204 source-authoring findings remain and are silenced by the header). Ported JS is otherwise byte-for-byte the source (CRLF → LF).
7. Content: `events` block row 3 (the public Coveo search token) is authored as `coveo-token-disabled`; the shim ignores it, and the value is readable in the live page's HTML for the owner who re-enables Coveo.

Not adapted (kept as source, worth knowing): `sciex-favorite` still points its logged-in fetch at `/bin/sciex/favorite-all-content` (X-01 decided-out; never called while logged out); `sx-breadcrumb` fetches ancestor page titles only under `/resource-hub/knowledge-base-articles` (not our pages); `contact-information` builds a `document.querySelector('.filters')` global lookup (fine on a page with one instance); `events` appends `#event-filter-modal` to `<body>`.

## 4. Off-origin data → snapshots (off-origin-data.md Tier 2, fed through `scripts/site-config.js#sxPort`)

| feature | source fetch | snapshot | rows | consumer |
|---|---|---|---|---|
| events listing (L-01) | `POST https://danaherproductionrfl96bkr.org.coveo.com/rest/search/v2` searchHub `SCIEXEventListing`, tab `Upcoming` (`cq: NOT @eventtype==On-demand`) / `OnDemand` | `data/events/upcoming.json`, `data/events/on-demand.json` (raw Search API v2 responses, ranking/highlight noise stripped) + `_provenance.json` | 71 + 54 (= totalCount) | `blocks/events` via the shim (`sxPort.coveo.hubs.SCIEXEventListing`) |
| contact-us country finder (A-03) | `GET https://sciex.com/bin/sciex/partners` (public) | `data/partners/partners.json` + `_provenance.json` | 4 regions · 131 countries · 171 companies | `blocks/contact-information` via `partner-controller.js` (`sxPort.partners`) |
| resource-hub search suggestions (S-03) | Coveo querySuggest, searchHub `SCIEXMainSearch` | none (suggestions disabled) | — | `resourcehub-search` via the shim's `buildStandaloneSearchBox` |
| `/placeholders.json`, `/hreflang.json`, `/bin/sciex/currentuserdetails` (403) | fetched by THEIR header/scripts, not by these blocks | not needed | — | — |

**The shim** (`scripts/sx/coveo-headless-shim.js`) implements only the builders the ported code imports — `buildSearchEngine`, `buildTab`, `buildFacet`, `buildResultList`, `buildPager`, `buildQuerySummary`, `buildContext`, `buildSearchBox`, `buildStandaloneSearchBox` — over the merged snapshots: tab expressions (`@field==Value` / `NOT@…`) filter by `raw.eventtype`; facets are counted over the tab-filtered set (5 values, alphabetical, selected first — same as the live dropdowns); "More Events" pages by 10; the search box does a case-insensitive substring match over title/excerpt/facet fields (an approximation of Coveo relevancy, named as such). Snapshot date is exposed as `data-snapshot` on `.events.block` and `.contact-information.block`.

**Decisions named (owner):**
- **Coveo reuse (S-02/S-03/L-01):** `sxPort.coveo.enabled = false`. Re-enable = flip the flag, restore the three CDN imports (URL recorded in `sxPort.coveo.headless`), put the public token back in the events block row 3, and allow the new host on the token. Until then: snapshot tier as above.
- **Events cadence:** one-time snapshot (2026-09-18); the listing will age — refresh by re-running the two POSTs (request shape in `data/events/_provenance.json`) or by re-enabling Coveo. Upcoming events dated before "today" are not filtered by the shim (Coveo's index does that on the source); at refresh time this is moot.
- **Partners cadence (A-03):** one-time snapshot; refresh cadence or a same-origin proxy later.
- **Search submits (S-02 host-bound):** `sxPort.searchResultsOrigin = 'https://sciex.com'` — the resource-hub search box redirects to the SOURCE `/search-results?term=…&contentType=…` so the flow completes; set to `''` once our `/search-results` exists.
- **"My favorite resources" (M-09):** logged-out state only, copy from the authored cells; Login / Create-account links stay `/bin/sciex/login`, `/support/create-account` (root-relative, as authored — `localize-links.mjs` decides later).

## 5. Content (DA body fragments, §9)

`content/events.html`, `content/resource-hub.html`, `content/resource-hub/regulatory-documents.html`, `content/about-us/contact-us.html` — metadata block first (`Title` = live `<title>`; `Description` = live meta where present, written for events/contact-us which have none; `Template: sx-port`), body = the `.plain.html` sections verbatim with: `class="breadcrumb"` → `class="sx-breadcrumb"`; every `<picture>` collapsed to `<img src="https://content.da.live/aemcoder/sdt-sciex/media/sx/<media_hash.ext>" alt width height>` (the pipeline rebuilds the `<picture>`); non-ASCII entity-encoded with `sanitise.js`. Internal links left as authored (root-relative or absolute `https://sciex.com/…`) for `localize-links.mjs`. **18 media uploads** needed (17 SVG icons, pure vector — checked for `data:image`/`<image>` — + 1 PNG hero 1.6 MB); local copies and DA targets in `stardust/.work/g5/media-uploads.json`.

`davids-model-lint`: 0 🔴 on all four; 18 🟡 total (D1 single-column prose blocks, D3 ragged rows, D10 >4 columns, D4 SVG) — all are the SOURCE's own block models (their UE models: id/variant/config rows before card rows), kept on purpose; none breaks our pipeline.

## 6. Local gates (harness through `aem up --port 8828`, Playwright 1440×900, `stardust/.work/g5/gate.mjs`)

Harness caveat: `build-harness.mjs` output has no `<meta name="template">`, a "QA harness" title, bare `<img>` (no pipeline `<picture>`) and un-uploaded DA media — the harness files were patched (meta injected, real titles, `<img>` wrapped in `<picture>`, media pointed at the downloaded copies) to be pipeline-representative. The one failure this exposed before patching (`featured-key-workflows` throwing on a missing `<picture>`) is a harness artefact, not a deployed-page defect.

| page | blocks loaded | pageerrors / console / failed req / broken img | rows rendered | drive | eyeball vs `stardust/current/assets/screenshots/<slug>.png` |
|---|---|---|---|---|---|
| events (`?event=upcoming` and `?event=on-demand`) | 2/2 | 0 / 0 / 0 / 0 | 10 cards, months Oct + Nov 2026 (= live), 4 facet dropdowns; on-demand: 10 cards, May + Jun 2026 (= live) | tab switch ✓ · Region=Europe → Clear All ✓ · More Events 10→20 ✓ · search "PFAS" → 4 results, summary "1 - 4 of 4" ✓ | match after the specificity fix (title, filters, cards, blue "More Events"); doc 3008 vs 2887 |
| resource-hub | 6/6 | 0 / 0 / 0 / 0 | 6 categories, 6 workflow cards, favorites logged-out, search box | — | match (h1 52px, favorites band, categories, workflows grid, CTA banner); doc 3561 vs 3454 |
| resource-hub/regulatory-documents | 4/4 | 0 / 0 / 0 / 0 | 4 categories, favorites, search | — | match; doc 2594 vs 2473 |
| about-us/contact-us | 5/5 | 0 / 0 / 0 / 0 | hero, 3 HQ items, 3 icon-cards, 2 default US contact cards (= live), 5 region options | Region=EMEAI → 120 cards / 104 countries ✓ · search "Germ" → 1 card "SCIEX Germany" ✓ · Clear → 2 ✓ | match (after adding `.text-echo`/`.text-blue`); doc 3359 vs 3239 |

Remaining visible differences (accepted): the resource-hub search icon button is dark-filled here (their own block CSS `background: var(--Grey-600) !important`) while the live page shows it outlined — their HEADER CSS restyles `.global-search-btn` on the source; footer partner-logo order differs (our chrome). Height deltas ±120 px come from our chrome, not the ported bands.

`grep -rn "sciex.com/blocks\|http://localhost" blocks/ scripts/sx` → empty. `eslint` + `stylelint` clean on everything written (ported files carry disable headers, §3.6).

## 7. Risks

- Their blocks depend on their chrome/global CSS in two known places: `.global-search-btn` look (above) and the `tabs-container-wrapper` class that `sciex-text`/`icon-card` add to their wrapper (only the ≥1440 width rule is ported for it).
- Snapshots age (events especially); no sync step ships in this phase.
- `sx-breadcrumb` labels the current page from `document.title` (= metadata Title) and links "Home" to `window.location.origin` — correct on the deployed page, unverifiable in the harness beyond the patched title.
- The events block writes `localStorage.searchTerm` and `history.replaceState` (source behaviour); harmless.
- DA: 17 SVGs must upload as pure vector (verified) — an SVG with an embedded raster 409s the page preview (#99).
