# Stardust improvement notes — sciex.com replica run (2026-09-18)

Potential general improvements to the stardust plugin surfaced while running
`replica` on https://sciex.com. Each entry: what happened, why it matters,
suggested change. Project-specific quirks stay out; only plugin-level items.

## N-01 — eds-new-site DA-folder guard treats an empty listing as "exists"
- **Observed:** `admin.da.live/list/aemcoder/sdt-sciex/` returned HTTP 200 with
  body `[]` for a folder that had never been created. The skill text says
  "200 with content means the folder exists — stop and ask"; a bare 200 check
  would have false-stopped.
- **Suggest:** guard on `200 && body != "[]"` explicitly (the skill is
  Paolo's personal skill, but the same pattern applies to stardust deploy's
  DA pre-flight).

## N-02 — crawl.mjs has no `--help`
- **Observed:** `node crawl.mjs --help` → `fatal: unknown arg: --help`.
  Flags are only discoverable from the header comment.
- **Suggest:** print the usage block on `--help`/`-h`.

## N-03 — `--prep` on a 2,800-URL sitemap needs a documented roster policy
- **Observed:** sciex.com's sitemap lists 2,826 URLs (1,790 knowledge-base
  articles). `--prep` "implies --all"; the hands-off default (100 pages, 20
  per template) is the only cap guidance and lives in the master skill, not
  in extract/prep-mode.md. The crawler also has no "sample N per path
  family" mode, so the roster had to be hand-built from the sitemap.
- **Suggest:** add `--sample-per-family <n>` (group by first two path
  segments) to crawl.mjs, and state in prep-mode.md that `--prep` on large
  inventories runs on a stratified sample while the *plan* covers the full
  sitemap.

## N-04 — Consent banner survived into the crawl's home screenshot
- **Observed:** `_crawl-log.json#consent.method` = `auto`, yet `assets/screenshots/index.png`
  shows the OneTrust banner over the hero (inner pages are clean — the banner only
  renders on the first navigation of a context). Downstream vision checks and
  recreation "ground truth" are polluted for the most important page.
- **Suggest:** after dismissal, re-check `#onetrust-banner-sdk:visible` (and the
  generic `[id*=consent]`, `[class*=cookie]` set) before the screenshot; retry
  the dismissal or re-navigate once when it is still visible; record
  `consent.dismissedOn[]` per page.

## N-05 — crawl.mjs does not harvest fonts / logo / media, but SKILL.md implies it does
- **Observed:** extract SKILL.md § Phase 2 lists font network-intercept, logo chain,
  media save; the bundled crawler only writes pages/*.json|html, screenshots and
  favicon. Every run re-implements the harvest ad hoc (and replica's recreation
  agents need the woff2 + stylesheets on disk).
- **Suggest:** add `--assets fonts,css,logo,media[:archetypes]` to crawl.mjs
  (response interception is already in place for `--dynamics`), or state plainly
  in SKILL.md that the harvest is agent work and point to the recipe sections.

## N-06 — Login-gated pages are reported as DUP-OF the login page
- **Observed:** `/training/*` redirected to `/support/login`; the crawler logged
  `DUP  … DUP-OF:support-login` — correct signal, wrong name. A reader has to
  infer "gated" from "duplicate".
- **Suggest:** when `finalUrl` differs from the requested URL AND matches a
  login/auth pattern, log `GATED → <login-url>` and set `_signals.loginGated: true`
  so prep-mode typing can mark the family out of scope automatically.

## N-07 — replica needs a "pick the archetypes" helper for large inventories
- **Observed:** choosing the 2 most representative template families required
  hand-grouping the sitemap by path prefix and reading AEM `<meta name="template">`
  from the HTML sidecars. Both signals are cheap and generic (most CMSs emit a
  template hint: AEM `template`, WordPress body classes, Drupal `page--*`).
- **Suggest:** prep-mode typing should record `templateHint` per page and emit a
  `families[]` summary (count in sample, estimated count in sitemap by prefix,
  representative slug) in the prep summary; replica can then propose archetypes
  by (sitemap volume × module reuse).

## N-08 — dynamics-detect `--from-state` silently shrinks to 2 URLs when `type` is null
- **Observed:** state.json pages had `type: null` (typing runs later in the same prep
  pass); `--from-state` picked 2 URLs. The agent fell back to `--urls`.
- **Suggest:** when no page carries a type, fall back to "home + every page whose
  AEM/CMS template hint is unique in the roster", and print the selected list.

## N-09 — dynamics detector misses AEM servlets and fragments
- **Observed:** `/bin/sciex/currentuserdetails` (text/html 403), `/bin/sciex/partners`,
  `*.plain.html`, `/resource-hub` were not classed as endpoints; also the AEM CSRF
  token (`/libs/granite/csrf/token.json`) was classed `D` and `c360a.salesforce.com`
  resolved to "form backend: Pardot".
- **Suggest:** widen `API_PATH` to `/bin/`, `/libs/`, `*.plain.html`, `*.json` on the
  same host; add vendors.json rows for WalkMe, Dreamdata, MaxMind, OneTrust
  geolocation, Salesforce MC Personalization / Data Cloud; classify CSRF tokens as
  infrastructure (`X`/no-op).

## N-10 — dynamics/migrate SKILL.md still require `playwright-cli` on PATH
- **Observed:** not installed here; Phases 1–3 ran fine on the playwright module.
- **Suggest:** drop the hard requirement from the frontmatter, or make the
  scripts that need it degrade to the module.

## N-11 — Source sites can already be partly on Edge Delivery
- **Observed:** three sciex.com pages are served by EDS today (contact-us,
  customer-documents → /search-results, the KB landing) with block code public at
  `sciex.com/blocks/*`. Extract/dynamics treat every page as foreign; replica
  could port those blocks verbatim (with owner confirmation) instead of recreating.
- **Suggest:** extract records `platformHint` per page (`aem-6`, `eds`, `wordpress`…
  from `scripts/aem.js`, `data-block-name`, generator meta); replica's plan lists
  "already-EDS" pages as a port-not-recreate family.

## N-12 — AGENTS.md in the boilerplate says `helix-query.yaml` is retired
- **Observed:** dynamics `reference/listings.md` still names `helix-query.yaml` as the
  listings mechanism; the boilerplate's AGENTS.md says it is retired in favour of
  the tools.aem.live index config.
- **Suggest:** update listings.md / rollout to the current index-config mechanism.

## N-13 — Rendered-DOM sidecars (`pages/*.html`) are tracked by default and weigh 121 MB here
- **Observed:** 73 sidecars average 1.6 MB each (the mega-menu is repeated on every
  page); `stardust/.gitignore` tracks them by policy ("captured a site that will not
  exist after launch"). The first phase-end commit of this project is ~140 MB.
- **Suggest:** either add `current/pages/*.html` to the default ignore list with a
  documented opt-in, or have crawl.mjs strip repeated chrome (header/footer/megamenu,
  fingerprinted across pages) from the sidecar into a single `_chrome.html`.
