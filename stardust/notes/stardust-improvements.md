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

## N-14 — motion-observe misses Alpine/inline-style state (reads as "dead")
- **Observed (home agent):** motion-observe.mjs records class mutations and track
  transforms only; Alpine.js `x-show`/inline-style toggles (dropdowns, footer
  accordion, language modal, mobile panels) read as dead until probed with a
  before/after computed-style snapshot. The agent wrote a `probe-interact.mjs`
  pattern (stardust/replica/capture/) worth upstreaming. `headerTimeline` is all
  null when live has no `<header>` element.
- **Suggest:** add a style-snapshot diff (display/opacity/max-height/transform on
  the clicked element's subtree) to motion-observe; fall back to `[role=banner]` /
  the first fixed/sticky top element when `<header>` is absent.

## N-15 — Fixed third-party widgets contaminate every stitched-chunk seam
- **Observed:** WalkMe copilot tab (bottom-left) and a chat launcher (bottom-right)
  repeat at the bottom of every 900px stitched chunk on the live capture; the
  entire 0.40 % home residual at 1440 is these widgets. The prototype correctly
  excludes them.
- **Suggest:** stitch-shot `--hide <selector,…>` (inject `display:none` for known
  widget roots before each chunk) and a documented `--mask` recipe in
  source-fidelity-gate.md § Hardening for "fixed third-party widgets".

## N-16 — Small instrument issues (home run)
- chrome-parity `--json` writes `regions` as a list while the doc implies a dict.
- anchor.mjs section discovery expects `main > section` on the build side.
- The suggested gate port 8791 was grabbed by another stardust project between the
  lsof check and the server launch; gate.sh's marker check is the right backstop —
  make the default port project-hashed (e.g. 8700 + hash(slug) % 200).

## N-17 — Instrument notes from the KB-article run
- chrome-parity / anchor default regions `header`/`footer` miss sites whose header is a
  `<nav>` without `<header>`; `--no-defaults --region header=<sel>|<sel>` was needed —
  add the hint to the usage text (see also N-14).
- pixel-compare `--mask` is row-band only; fixed corner widgets (WalkMe copilot tab,
  Qualtrics launcher) force masking legitimate content in the same rows. A rect mask
  (`x:y:w:h[@yB]`) would make the widget-masked number honest.
- The motion behaviour-match run caught a static link-colour specificity defect the pixel
  probes rated as noise — a computed-colour parity probe for link families inside the
  content root would catch it earlier.
- `lift.mjs` (the CSS-lift probe) is copy-and-edit per page; a generic
  `--selectors <json>` flag would remove that step.
- Ports: 8794 was held by a 13-day-old foreign `http.server`; two of three archetype agents
  had to move ports (see N-16).

## N-18 — Template-conditional chrome should be first-class in the canon model
- **Observed:** the legacy template has no support band, a different footer XF, a 10px
  rem base and a static font cut. The cumulative-prototype model assumes ONE canon
  chrome; the KB agent compensated everything under a page class (`.page--kb`).
- **Suggest:** recreation-procedure.md § Cumulative archetype prototypes should allow
  `canon.css` + `canon-<variant>.css` chrome variants keyed by template family, and the
  deploy chrome step should map them to per-page `nav:`/`footer:` metadata overrides.

## N-19 — Instrument notes from the pharma-landing run
- anchor.mjs lists only the footer under an AEM content root that is a single hashed
  `#container-…` wrapper — section discovery needs a fallback to "direct children with
  a heading".
- motion-observe: a hover on a 0×0 anchor wrapping an absolutely positioned image reads
  "no change"; hovers run AFTER clicks so end-state arrows read "no hover" — run hovers
  in a separate pass; `widgetSamples.trackTransform` is null for Splide; pagination TEXT
  changes ("2 / 3") are not recorded.
- The footer disclaimer carries a per-page marketing code (GEN-MKT-18-7897-A on home,
  MKT-27286-A on pharma): the canon footer needs a per-page slot, and deploy's `/footer`
  fragment needs a page-metadata override for it.
- `html{scroll-behavior:smooth}`, `.breadcrumb`, `.link-arrow:hover`, `.t-alfa/.t-echo`
  belong in canon.css (interior-page chrome the home page never exercises) — the
  cumulative model should let the SECOND archetype promote shared rules into canon under
  the coordinator's review instead of forbidding canon edits outright.
- zsh expands a leading `=====` echo separator as `=cmd`; agents should avoid `=`-led
  separators in chained commands (hit by two agents).

## N-20 — Pixel probes rate small colour defects as noise; eyeball found a real one
- **Observed:** the KB "Comment" button rendered its label in the button's own colour
  (specificity fight); content-diff matched the node, chrome-parity was out of scope,
  pixel-compare read 0.01 %. A 1-minute side-by-side eyeball found it.
- **Suggest:** make the coordinator-level side-by-side eyeball (live.png | build.png at
  reduced scale) a required gate output per breakpoint, and add a computed
  foreground/background contrast probe over CTAs inside the content root.

## N-21 — A single "deploy the whole page + foundation + chrome" agent stalled after delivery
- **Observed:** the home deploy agent (foundation, fonts, header/footer blocks, /nav + /footer
  docs, 5 home blocks, content page, DA delivery) committed, pushed and delivered
  successfully, then was killed by the harness's 600 s no-progress watchdog during the
  published-origin gate, leaving no conversion log, no ledger update and the sanitised
  content uncommitted. The coordinator re-measured (0.47 % / 1.05 %) and split the rest
  into three lean agents that do NOT commit or write to DA (the coordinator commits once
  and resumes them for delivery).
- **Suggest:** deploy SKILL.md § 7 should prescribe the two-phase split (convert + local
  gates → coordinator commit → deliver + published gate) as the default for parallel page
  agents, and every long instrument (stitch-shot, chrome-parity, CLS probe) should be
  invoked via `run-capped.mjs` with a progress file — the same rule the master skill
  already states for replica's gate.sh. Add "the deploy-batch ledger is the resume point;
  never treat a killed agent as a failed deploy" to § Deploy.

## N-22 — admin.hlx.page normalises `_` to `-` in web paths; the PUT succeeds, the preview 404s
- **Observed:** the KB slug `…-in-analyst_en_us` PUT to DA returned 201, but
  `POST /preview/…_en_us` returned 404 — the admin API looks the source up at the
  normalised path `…-in-analyst-en-us`. 1,789 KB URLs carry `_<locale>` suffixes, so
  this is a family-wide redirect requirement, not a one-off.
- **Suggest:** deploy's path discipline (§ Deploy, "lowercase every segment…") should add
  "no underscores — the admin API normalises `_` to `-`"; `deploy-batch.mjs` should
  normalise and emit a `redirects.tsv` row automatically; `localize-links.mjs` must map
  the captured `_en_us` hrefs to the normalised target.

## N-23 — Footer marketing codes are per page on the live site
- **Observed:** every live page's footer experience fragment ends with its own code
  (home GEN-MKT-18-7897-A, pharma MKT-27286-A, KB legacy none). A single `/footer`
  document cannot carry them; the coordinator added a `Disclaimer Code` page-metadata
  slot that the footer block substitutes at decorate time.
- **Suggest:** replica's canon-chrome model should have a notion of "per-page slot inside
  shared chrome" (captured per page during extract, mapped to page metadata at deploy),
  and deploy § 6 Chrome should document the metadata-substitution pattern.

## N-24 — Inline elements with vertical margins are a recurring lift trap
- **Observed:** live footer copyright is an inline `<span>` with `margin-bottom: 20px`
  (no effect) sitting in a 23px line box; the block-level recreation honoured the margin
  → +5px on every page at 360. Computed-style lifts record the margin but not that it is
  inert.
- **Suggest:** the CSS-lift probe should flag `display: inline` elements carrying
  vertical margin/padding as "inert vertical box" and record the containing line-box
  height instead.

## N-25 — Tailwind sites need a "live DOM → clean markup" builder, not a CSS-rule lift
- **Observed (G1, 8 pages):** component classes carry no rules in a Tailwind stylesheet;
  the values live in utility classes on the DOM. The group agent wrote a builder
  (`stardust/.work/g1/build-g1.py`) that reads the settled DOM sidecar, maps utility
  classes + computed styles to clean component markup, and reads per-instance variant
  flags (overlay present/absent, ruled borders, injected page CSS) from the live DOM.
  6 of 8 pages converged in ONE gate iteration.
- **Suggest:** recreation-procedure.md § CSS lifting should name this path for
  utility-class sites, and replica could ship a generic builder skeleton (sidecar in,
  section list + per-instance flags out).

## N-26 — Instrument notes from G1
- `pixel-compare --mask` without `--timeout` can hang (gate.sh's reaper caught a 14-min
  stale process); always pass `--timeout`, or default it.
- A `--mask-seams <chunkHeight>` convenience flag would replace the per-page seam-row
  analysis for fixed third-party widgets (every 1440 page needed it; never at 360).
- content-diff inventories `<style>` text injected inside `main` as body copy (AEM
  `htmlInjectionContainer`); the prototype had to mirror the `<style>` element verbatim
  to zero the 🟡 — the classifier should skip `style`/`script` text nodes.
- The component inventory (`v3-components.json`) missed `tabs` + nested `accordion`
  on products-software — nested AEM components are not `aem-GridColumn` direct children.
