<!-- stardust:provenance
writtenBy: stardust:replica
writtenAt: 2026-09-18T08:30:00Z
againstInput: "migrate https://sciex.com to EDS with stardust as a same-design replica; full plan, 3 pages to final fidelity"
readArtifacts:
  - /tmp/sciex-urls.txt (sitemap, 2,826 URLs)
  - stardust/current/pages/*.json + *.html (73 captured pages)
  - stardust/current/assets/screenshots/*.png
  - stardust/.work/page-types.json
  - stardust/dynamic-features.md
synthesized: family sizing (sitemap path grouping), archetype choice, wave plan, effort model
authored: everything else
-->

# sciex.com → AEM Edge Delivery — same-design replica migration plan

**Flow:** `replica` → `migrate` (sibling tier) → `deploy` / `rollout`. No `prepare-migration`
step exists in this flow — replica runs its own preserve-mode prep (extract `--prep --dynamics`,
mechanical direction promotion, gated archetype recreation).
**Mode:** hands-off (`state.json.handsOff: true`) — gates run at full strength; interactive
pauses auto-resolve and are recorded as named assumptions.
**Target:** `aemcoder/sdt-sciex` (private GitHub repo, boilerplate `adobe/aem-boilerplate`),
content on da.live (`content.da.live/aemcoder/sdt-sciex/`), preview
`https://main--sdt-sciex--aemcoder.aem.page/`, live `https://main--sdt-sciex--aemcoder.aem.live/`.

## 1. Source inventory (from `https://www.sciex.com/sitemap.xml`, fetched 2026-09-18)

2,826 URLs, single host `sciex.com`, AEM 6.x publish behind Fastly (headless Chromium renders it;
no bot wall). AEM template names (`<meta name="template">`) map to visual families:

| Family (from `stardust/.work/page-types.json`) | AEM template / front end | Sitemap est. | Sample (of 73) | Type | Representative page |
|---|---|---:|---:|---|---|
| home-landing | page-template (v3) | 1 | 1 | landing | `/` |
| kb-article | knowledge-base-article-template (legacy body, v3 chrome) | 1,789 | 2 | article | `/support/knowledge-base-articles/resetting-root-director-…_en_us` |
| press-release-article | page-template (v3) | 278 | 2 | article | `/about-us/press-releases/2026/sciex-software-solutions-…` |
| v3-application-page | page-template (v3) | 148 | 10 | program | `/applications/pharma-and-biopharma` |
| v3-product-detail | page-template (v3) | 113 | 5 | program | `/products/mass-spectrometers/…/x500r-qtof-system` |
| login-gated (`/training/*`, `/support/login`) | — (Danaher Auth0) | 110 | 3 | unique | `/support/login` |
| v3-static-content (product stewardship, history…) | page-template (v3) | 99 | 5 | static | `/about-us/product-stewardship/weee-compliance/austria` |
| legacy-detail-page (methods, spectral library) | detail-page (legacy) | 77 | 2 | program | `/products/methods/imethod-application-…` |
| sciex-now-legacy (support shell) | generic-page-template / globalpage | 70 | 5 | static | `/support` |
| v3-profile-article | page-template (v3) | 59 | 2 | article | `/about-us/customer-profiles/jennifer-van-eyk` |
| press-release-listing (index + year pages) | page-template (v3) | 20 | 3 | listing | `/about-us/press-releases/2026` |
| v3-technology-detail | page-template (v3) | 16 | 3 | program | `/technology/qtof-technology` |
| v3-product-category | page-template (v3) | 10 | 11 | listing | `/products/mass-spectrometers` |
| v3-section-hub | page-template (v3) | 7 | 7 | landing | `/applications` |
| legacy-intermediate | intermediate-template | 7 | 5 | listing | `/products/accessories` |
| v3-profile-listing | page-template (v3) | 2 | 2 | listing | `/about-us/customer-profiles` |
| eds-contact / eds-resource-hub / eds-search-results | **already Edge Delivery on sciex.com** (`/blocks/*` public) | 3 | 3 | form / listing | `/about-us/contact-us`, `/support/knowledge-base-articles`, `/support/customer-documents` |
| legacy-microsite | page-template (legacy skin) | 1 | 1 | unique | `/about-us/whitepapers` |
| external-danaher-careers | jobs.danaher.com embed | 0 | 1 | unique | `/about-us/Career-Opportunities` |

Three front ends share the host: **v3** (AEM Sites, Tailwind + Alpine.js + Splide; ~55 of 73
sampled pages), **SCIEX Now legacy** (AEM Sites, Bootstrap; owns the KB body template and the
support shell), and **Edge Delivery already** (3 pages whose block code is publicly served at
`sciex.com/blocks/*` — a port-not-recreate family, pending owner confirmation).
Type counts (sample): landing 8 · program 21 · listing 21 · article 6 · static 11 · form 1 · unique 5.

Sample capture: 73 pages, all live Playwright renders (73/73 provenance), 0 failures, headless.
Per-page evidence lives in `stardust/current/pages/<slug>.json#_provenance` and
`stardust/state.json`. Page-type inference per slug: `stardust/.work/page-types.json`
(merged into `state.json.pages[].type`).

## 2. Archetypes chosen for THIS run (3 pages to final fidelity)

| # | Page | Family | Why this one |
|---|---|---|---|
| 1 | `/` (home) | landing | Required by the brief. Owns the shared chrome (header with search/locale/login/shop/quote CTAs + mega-menu nav, "SCIEX Now support network" band, footer with partner-logo strip) that every other page inherits, plus the hero, promo carousel, product cards, tabbed portfolio, icon grid and story cards. |
| 2 | `/applications/pharma-and-biopharma` | program (marketing landing, `page-template`) | The most-reused marketing template: full-bleed image hero + breadcrumb, sub-nav tabs (Overview / Applications / Perspectives / Stories), overview prose, image-card grid, "Perspectives" quote carousel, thought-leader story cards, "Let's connect" band. The same module set renders ~300 pages across `/applications`, `/products` (category level), `/technology`, `/diagnostics` and most `/about-us` marketing pages — the highest block-reuse payoff after home. |
| 3 | `/support/knowledge-base-articles/resetting-root-director-to-analyst-data-folder-restores-selexion-functionality-in-analyst_en_us` | article (`knowledge-base-article-template`) | 1,789 of 2,826 URLs (63 %). Rollout volume is dominated by this family, so proving it (title, date/categories meta row, rating stars, print/rate controls, question + answer prose, "Connect" CTA) de-risks most of the site's page count. Structurally simple, but it is the family whose importer must be measured per page (content-count acceptance). |

Runner-up archetypes, first in line for the next run: press-release article (291 pages; a
`page-template` prose article whose modules are a subset of #2 + #3), product detail
(`/products/…/x500r-qtof-system`: eyebrow + split hero with product image, key-feature grid,
resource tiles, featured-application list, key-facts grid), and press-release year index (listing).

## 3. Phases (what runs in this run vs. later)

| Phase | Owner skill | This run | Later |
|---|---|---|---|
| 0 EDS repo | eds-new-site (personal) | ✅ `aemcoder/sdt-sciex` private, fstab → da.live, Code Sync registered, config verified | — |
| 1 Extract | `extract --prep --dynamics` | ✅ 73-page stratified roster; brand surface, descriptive PRODUCT/DESIGN, fonts, logo, archetype media, page typing, module candidates | Widen roster per wave (`--pages`) as families are rolled out; refresh KB sample before wave 3 |
| 2 Preserve direction | `replica` (mechanical) | ✅ verbatim promotion, `direction.md`, empty inconsistency register (pure replica), dynamics Phases 1–3 triage | Register entries only if the user adds them |
| 3 Recreate | `replica` | ✅ 3 archetype prototypes (canon CSS + per-archetype CSS), CSS lifted at 1440/360/1920 | +1 prototype per additional family (press release, product detail, listing, support legacy, method detail, stewardship) |
| 4 Source-fidelity gate | `replica` | ✅ per archetype × {1440, 360}: content-diff 0 🔴, visual-diff justified, pixel ≤10 %, |Δh| ≤8px, chrome crops ≤2 %, motion observed → implemented | Same per new archetype |
| 5a Deploy archetypes | `deploy` | ✅ blocks + `styles.css` + header/footer blocks + `/nav`, `/footer`, 3 content pages → DA → preview → live; published-origin gate | — |
| 5b Siblings | `migrate` (sibling tier) → `rollout` | ✗ planned only | Waves below; sibling-variance probe per template before cloning; content-count acceptance per page |
| 5c Dynamics Phases 4–5 | `dynamics` via `rollout` D2 | ✗ triage only | Implement `self`-reproducible rows; owner decision batch |
| 6 QA | `qa` | ✗ | After each wave |

## 4. Rollout waves (full site)

Volume caps under hands-off default are proposals; the real rollout is one wave at a time with
a `qa` sweep between waves.

| Wave | Scope | Pages | Prereq | Method |
|---|---|---:|---|---|
| 0 (this run) | Home + 2 archetypes | 3 | — | replica gate → deploy |
| 1 | Marketing landings: `/applications/**`, `/products` category level, `/technology/**`, `/diagnostics/**`, `/about-us` marketing pages, `/extraordinary-science` | ~200 | Archetype #2 approved; sibling-variance probe on 8–10 siblings (hero height/scrim, sub-nav presence, card-grid column counts, quote carousel presence) | `migrate` sibling tier → `rollout` |
| 2 | Product detail + method detail + spectral-library detail (`detail-page`) | ~140 | New archetype: `/products/…/x500r-qtof-system` gated; `detail-page` archetype (`/products/methods/…`) gated | replica (2 archetypes) → migrate siblings → rollout |
| 3 | Knowledge-base articles | 1,789 | Archetype #3 approved; importer measured on a 50-page sample (content-count acceptance); locale suffixes (`_en_us`, `_ja`, `_de`…) mapped to a per-language tree or kept as slugs (owner decision); KB search → results page decided (dynamics) | batch importer from the rendered DOM sidecars; `deploy-batch.mjs` with ledger; `qa` per 500 pages |
| 4 | Press releases (291 articles + 19 year indexes + index), profiles (59) | ~370 | Press-release archetype gated; year-index listing archetype (index-backed or authored rows) | migrate siblings → rollout; listing via `helix-query.yaml` or authored rows (document-first) |
| 5 | Support: SCIEX Now legacy pages (`/support/**`, `generic-page-template`), product stewardship (94 compliance pages), contact/careers | ~180 | Support-legacy archetype gated (different chrome: left sidebar); decision on the SCIEX Now personalization surface (login, "My …" links) | replica → migrate → rollout |
| Out of scope | `/training/**` (109, login-gated → `/support/login`), `/support/login`, `/support/create-account`, `/support/manage-my-instruments`, account dashboards | ~115 | Owner decision: these are authenticated SCIEX Now surfaces, not public content | Redirect map to the existing portal or keep on current host |

## 5. Block catalogue (draft — locked in `stardust/eds-conversion-log.md` at deploy time)

Naming follows Block Collection patterns where they match (D11) and stays variant-driven (D9):

- Chrome: `header` (template-slotted; utility row + nav row + mega-menu; search box; locale; login; shop; quote CTA; login-nudge tooltip state), `footer` (social row + language selector + 4 link columns + legal row + disclaimer + Danaher logo + partner-logo strip).
- `hero` variants: `hero` (home, dark media hero), `hero image` (marketing landing full-bleed image + h1 + lede), `hero split` (product detail, image right), default-content title block for articles (D1).
- `carousel` (home promo tiles; landing "Perspectives" quotes as `carousel quotes`).
- `cards` variants: `cards products` (3-up product cards), `cards image` (landing application grid), `cards icons` (7-item icon grid), `cards stories` (2-up / 3-up story cards), `cards connect` (Let's connect tiles).
- `tabs` (Why SCIEX portfolio; landing sub-nav as `tabs subnav` anchors).
- `support-band` (SCIEX Now support network) — one block, everywhere.
- `breadcrumb` (from page path; authored or JS-generated from metadata).
- `article-meta` (KB: date, categories, rating stars, print/rate controls) + `rating` behaviour (dynamics: client-only, interim static).
- `columns` for two-column prose/media bands; default content + section `style` for everything else (D1).

## 6. Dynamic surface (summary — full triage in `stardust/dynamic-features.md`)

53 triaged rows (class: S 4 · F 6 · M 10 · V 4 · T 14 · A 5 · X 4 · I18N 1 · D 2 · CR 1 · L 2).
Dispositions: rebuild-native 17 · embed-passthrough 14 · decided-out 10 · static-snapshot 5 ·
data-fed 3 · index-backed 2 · resolved/no-op 2. Reproducibility: **self 30**, owner batch 23
(15 business decisions, 7 need a backend, 1 needs human capture). No regulated-PII form exists.
Every first-party API path is host-bound on the target (`/bin/sciex/*`, `/placeholders.json`,
`/hreflang.json`, `/search-results`). Surfaces:
Header search (implies a results page), locale/language switcher, Login + personalization
(`/bin/sciex/currentuserdetails`, 403 anonymous), Shop (external store — link), "Request a quote"
(form/funnel), mega-menu, login-nudge tooltip, OneTrust consent, dreamdata + analytics tags, promo
carousel, portfolio tabs, quote carousel, embedded video players, KB rating/print/connect, KB
landing search with category select + "My favorite resources" accordion, footer language selector.
Every row carries a disposition; owner decisions are batched in `stardust/dynamic-features-plan.md`.

## 7. Risks and assumptions (named, hands-off)

- **Fonts.** Policy per `recreation-procedure.md` § Fonts policy — self-hosted faces are reused; a licensed kit is substituted metric-matched with the brand family first in the stack. Resolution recorded in `stardust/replica/progress.json#fontsPolicy`.
- **Crawl sample vs. plan.** `--prep` ran on 73 of 2,826 URLs (stratified by family); the plan sizes families from the sitemap, not the sample. Each wave re-extracts its roster.
- **KB locale suffixes** (`_en_us`, `_ja`, …) and encoded slugs (`%25C3%25A8`) need a URL-normalisation rule before wave 3; EDS paths must be lowercase, extensionless, no trailing slash.
- **Consent banner** appears in the crawl's home screenshot; the gate dismisses it (`--dismiss`) so it never enters the fidelity number.
- **SCIEX Now personalization** (logged-in state, "My …" links, dashboard) is out of scope for a static replica; interim tier is anonymous state + links to the existing portal (owner decision).
- **Training pages** are login-gated; they are excluded from the public roster.
- **Published-origin regime.** Final numbers are judged on the published origin (6.9–9.9 % is the field precedent for faithful EDS pages), not the prototype regime.

## 8. Effort model (order-of-magnitude, for review)

| Item | Unit cost | Notes |
|---|---|---|
| New archetype (prototype + 2-breakpoint gate + motion) | 0.5–1 day agent time | 6 more archetypes → waves 1–5 |
| Sibling family (variance probe + importer + measured content-fidelity) | 0.5 day per template + minutes per page | KB family needs an importer run in 4 batches with QA between |
| Deploy per page (atomic contract) | minutes (batch driver) | Token expiry is the only hard stop |
| QA sweep per wave | hours | `qa` skill, read-only |

## 9. What the reviewer decides next

1. Approve or amend the three archetypes' gate results (`stardust/replica/progress.json`, evidence under `stardust/replica/gates/`).
2. Confirm the wave order (default: 1 → 2 → 3 → 4 → 5) or reprioritise (e.g. KB first if support traffic dominates).
3. Owner decisions batched in `stardust/dynamic-features-plan.md` (search backend, login/personalization, quote form endpoint, KB locale tree, analytics tags on the new host).
4. Whether to seed any inconsistency-register entries (default: none — pure replica).
