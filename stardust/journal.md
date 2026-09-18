# Journal — sciex.com same-design replica → AEM Edge Delivery

Chronological log of every prompt execution. Most recent at the bottom.
See `skills/stardust/reference/journal-format.md` for entry format.

---

## 2026-09-18T06:45:00Z — Run start: EDS repo + replica Phase 1 (extract --prep --dynamics)

**Prompt:** Migrate https://sciex.com to EDS as a same-design replica. Set up a new private EDS repo with the personal `eds-new-site` skill. Define the full-site migration plan, but bring only 3 pages to final fidelity (home + 2 distinct archetypes, chosen from the extract with stated reasons). Proceed without asking; track general stardust improvement ideas in a notes file.

**Decisions:**
- Flow: `replica` → `migrate` (siblings, later) → `deploy` (3 archetypes now). No `prepare-migration`.
- Repo slug `sdt-sciex` (stardust prefix per eds-new-site), org `aemcoder`, private. DA folder listing returned `200 []` (empty) — treated as non-existent, proceeded.
- Hands-off mode activated by the user's "proceed without asking my input" → `state.json.handsOff: true`.
- Sitemap has 2,826 URLs; `--prep` ran on a hand-built stratified roster of 73 pages (all families, every section landing) under the hands-off volume cap (100 / 20 per template). The plan covers the full sitemap by family.
- Archetypes: home; `/applications/pharma-and-biopharma` (marketing landing, the most-reused `page-template` module set, ~300 pages); a knowledge-base article (`knowledge-base-article-template`, 1,789 pages = 63 % of the sitemap).
- Phases 2–4 delegated to three parallel agents (brand surface + descriptive spec; dynamics triage; home recreation + canon chrome). Two more recreation agents follow for the second and third archetypes once the canon layer exists.

**Artifacts touched:**
- `fstab.yaml`, `.gitignore` (stardust block), `.hlxignore` (`stardust/`) — created/updated
- `stardust/state.json`, `stardust/status.jsonl`, `stardust/.gitignore` — created
- `stardust/current/pages/*` (73), `stardust/current/assets/screenshots/*`, `_crawl-log.json` — created by crawl.mjs
- `stardust/scripts/{crawl.mjs,replica/,diff/}` — copied from the plugin
- `stardust/replica/migration-plan.md` — created (draft, finalised at end of run)
- `stardust/notes/stardust-improvements.md` — created

**Findings worth flagging:**
- sciex.com is AEM 6.x on Fastly; headless Chromium renders it without a bot wall.
- `/training/*` pages redirect to `/support/login` (login-gated); `crawl.mjs` flagged them as duplicates of the login page.
- The crawler's consent dismissal did not remove the OneTrust banner from the home screenshot (it is visible in `assets/screenshots/index.png`); inner-page screenshots are clean.
- `crawl.mjs` alone writes no fonts/logo/media — those are agent-side harvests (delegated).

**Open questions:**
- KB locale-suffix URL policy (`_en_us`, `_ja`) for wave 3 — owner decision, recorded in the plan.

**Next:** finish Phases 2–4 for the three archetypes, then `deploy` them and run the published-origin gate.

---
## 2026-09-18T09:15:00Z — Phases 2–4: promotion, dynamics triage, home archetype gated; deploy of home + chrome started

**Prompt:** (same run) continue the replica autonomously.

**Decisions:**
- Verbatim promotion of `current/PRODUCT.md`, `DESIGN.md`, `DESIGN.json` to the root; `direction.md` in preserve mode; empty inconsistency register (pure replica; no audit requested).
- Fonts: Geogrotesque (Emtype) is self-hosted by SCIEX → reused verbatim in prototypes and in the EDS repo, licence confirmation recorded as a pending owner decision. proxima-nova (Typekit; legacy pages) is never rehosted.
- Third-party overlays (OneTrust, WalkMe login balloon/copilot tab, chat launcher) are not page content: excluded from prototypes, masked out of the fidelity number, scaffolded disabled in delivery.
- Home archetype approved hands-off after passing every gate: 1440 → 0.40 % pixel (0.00 % with the fixed-widget seams masked), Δh 0, 0 🔴, header 0.00 % / footer 0.25 % / support band 1.94 %; 360 → 0.00 %, Δh 0. Motion: all observed behaviours implemented; hovers and header scroll morph observed dead and left out.
- Deploy of home + foundation + chrome dispatched to one agent while the pharma and KB recreations gate against the now-stable canon.

**Artifacts touched:**
- `PRODUCT.md`, `DESIGN.md`, `DESIGN.json` (root) — created (verbatim copies)
- `stardust/direction.md`, `stardust/replica/inconsistency-register.md` — created
- `stardust/state.json` — 73 pages typed (`type`, `family`, `aemTemplate`) and moved to `directed`
- `stardust/dynamic-features.md`, `stardust/dynamic-features-plan.md`, `stardust/current/_dynamics.json` — created by the dynamics agent (53 rows)
- `stardust/prototypes/home-proposed.html`, `css/canon.css`, `css/home.css`, `js/motion.js`, `js/home.js`, `interaction-spec.md`, `assets/` — created by the home agent
- `stardust/replica/progress.json`, `replica/gates/home-1440|360/`, `replica/motion/home*.json`, `replica/capture/` — created
- `stardust/runtime-contract.json`, `stardust/scripts/deploy/` — created
- `stardust/replica/migration-plan.md` — family table and dynamics summary updated

**Findings worth flagging:**
- sciex.com is three front ends on one host: AEM v3 (Tailwind/Alpine/Splide), SCIEX Now legacy (Bootstrap), and three pages already on Edge Delivery with public block code at `sciex.com/blocks/*`.
- Every first-party API path is host-bound on the target (404): search, personalization, placeholders, hreflang.
- The home promo "carousel" is a static 2-up grid at capture time (no Splide DOM fired); the hero is a Dynamic Media picture, not a video.

**Open questions:**
- Geogrotesque licence for the new host (owner).
- Coveo search reuse on the new origin; `/kr` locale scope; tag ids to enable (owner batch in `dynamic-features-plan.md`).

**Next:** gate the pharma and KB prototypes, deploy them on the shared foundation, run the published-origin gate on all three, finalise plan + report.

---
## 2026-09-18T11:20:00Z — Home delivered to Edge Delivery; deploy agent stalled after delivery; work re-split

**Prompt:** (same run; user typed "retry" after the deploy agent stalled.)

**Decisions:**
- The stalled agent had already committed and pushed the foundation, chrome and home blocks (commit f0f8090) and delivered /nav, /footer, /index (all `live` in content/.deploy-ledger.json). Nothing was redone; the coordinator measured the published home: 1440 → 0.47 % pixel, Δh 0; 360 → 1.05 %, Δh −5 px. Eyeball found one defect: stories-rail controls visible at desktop.
- Remaining work re-dispatched as three lean agents that do not commit or write to DA (avoids concurrent-commit races and the watchdog): home finisher (stories fix, published chrome gates, conversion log, state), pharma convert, KB convert. The coordinator commits once, pushes, forces Code Sync, then resumes the page agents for delivery + published-origin gates.
- KB page keeps its legacy footer as captured via a `footer: /footer-legacy` metadata override and a `legacy` footer variant (register R-01 stays deferred).

**Artifacts touched:** blocks/, styles/, fonts/, img/flags/, scripts/site-config.js, content/{nav,footer,index}.html (by the deploy agent, committed); stardust/replica/gates/home-published-{1440,360}/ (coordinator); stardust/notes/stardust-improvements.md (N-13…N-21).

**Open questions:** none new.

**Next:** commit the three agents' outputs, push, deliver pharma + KB, run their published gates, finalise plan/report.

---
## 2026-09-18T13:45:00Z — Three archetypes live on Edge Delivery; published-origin gates pass; run complete pending review

**Prompt:** (same run) finish delivery.

**Decisions:**
- Home, pharma landing and KB article delivered to da.live and published; every archetype passes the published-origin gate at 1440 and 360 (numbers in `stardust/replica/migration-plan.md` § 2b and `stardust/replica/progress.json`).
- Coordinator fixes in shared chrome: footer copyright modelled as live's 23px inline line box (removed a +5px mobile delta on every page); footer disclaimer code now reads page metadata `Disclaimer Code` (live footers carry a per-page marketing code).
- KB slug policy decided by evidence: the admin API normalises `_en_us` to `-en-us`; wave 3 publishes hyphenated slugs with a redirect map.
- Legacy-template pages keep their own footer (`/footer-legacy`, register R-01 deferred) and template scope (`template: kb-article`).
- Third-party tags (OneTrust, GTM, WalkMe, Dreamdata, …) are scaffolded disabled in `scripts/site-config.js`; enabling them is an owner decision.

**Artifacts touched:** blocks/ (11 blocks), styles/, fonts/, content/ (index, nav, footer, footer-legacy, applications/pharma-and-biopharma, support/knowledge-base-articles/…-en-us), stardust/eds-conversion-log*.md, stardust/eds-schema/, stardust/replica/progress.json, stardust/state.json (3 pages `migrated`), stardust/replica/migration-plan.md (final), stardust/notes/stardust-improvements.md (N-01…N-24).

**Findings worth flagging:**
- Pixel probes rate small colour/specificity defects as noise; a coordinator side-by-side eyeball found the only real defect (KB Comment label) and the desktop stories controls.
- Splitting deploy into "convert + local gates" and "deliver + published gate" with a single coordinator commit avoided both the watchdog stall and concurrent-commit races.

**Open questions (owner):** Geogrotesque licence on the new host; Coveo search reuse; unify footers or keep the legacy variant; KB locale tree for non-English suffixes; which tags to enable; roster for `/form-pages/*`.

**Next:** user review of the three pages and the plan; then wave 1 (`migrate` sibling tier for ~200 marketing landings → `rollout`).

---
## 2026-09-18T14:10:00Z — Wave "L2": migrate every second-level menu item (user request)

**Prompt:** "continue the migration, migrate all the second level menu items (for all the first levels)" with a screenshot of the Applications mega-menu left column.

**Decisions:**
- Second level = the left column of each top-level mega-menu panel (+ its "View all" page), resolved to landing URLs from `stardust/replica/capture/megamenu-desktop.json`: 27 items across Products (7), Applications (7), Training (1), Support (3), Service (3), Resource hub (1), About us (5, one external), Events (2 query variants of `/events`). Pharma is already live.
- Nine missing pages captured (`/applications/cannabis-testing`, `/education/grant-support`, `/education/clinical-mass-spec-knowledge-center`, `/resource-hub`, `/resource-hub/regulatory-documents`, `/support/professional-lab-services`, `/stories`, `/events?event=upcoming|on-demand`); state.json now has 82 pages.
- Component inventory of the v3 pages (`stardust/.work/coord/v3-components.json`): 25 AEM components; the pharma archetype implements 7. Rather than clone pharma blindly, five parallel groups build cumulative prototypes: G1 products (8 pages), G2 applications (8), G3 about/support v3 (6, incl. the `page-content` template and the XF-driven `/stories`), G4 legacy templates (3 archetypes: `/support`, `/support/software-support`, `/education/grant-support`), G5 port of the four pages already on Edge Delivery (`/events`, `/resource-hub`, `/resource-hub/regulatory-documents`, `/about-us/contact-us`) with `sx-` prefixing on block-name collisions and Coveo disabled (owner decision named).
- Each group writes its own ledger (`progress-g<n>.json`) and CSS file; the coordinator dedupes duplicate components at deploy time and commits once per phase (the stall/race lesson from the first run).
- External targets stay links: community.sciex.com, the shop (eProcurement redirects to shop.sciex.com).

**Artifacts touched:** stardust/current/pages/ (+9), stardust/state.json (82 pages), stardust/.work/coord/{nav-l2.json,v3-components.json}, stardust/replica/siblings/ (variance probe), stardust/journal.md.

**Open questions:** Coveo reuse (search results, resource hub); events data source cadence; whether `/support` should keep the SCIEX Now shell or move to the v3 template (replicated as captured).

**Next:** gate the prototypes per group → deploy phase (convert → coordinator commit → deliver + published gate) → siblings importer for the remaining v3 pages.

---
## 2026-09-18T14:20:00Z — L2 wave converted end to end; delivery blocked on the DA-write permission

**Prompt:** (same wave) continue.

**Decisions:**
- All 25 second-level pages are recreated, gated (24 pass every bar; professional-lab-services carries a documented Δh residual from the live tracking-pixel tail) and converted to EDS blocks + content pages; four pages already on Edge Delivery were ported and are LIVE with body-band fidelity 0.15–1.52 %.
- Block library grown to 11 new blocks (hero-band, section-tabs, accordion, statement-cards, event-rows, hero-video, expertise-rows, support-shell, support-hero, image-map, search-band, video, page-title, embed) plus cards/columns/carousel variants and a small closed set of section styles; template classes `kb-article`, `legacy`, `sciex-now`, `page-content`, `sx-port` scope chrome compensations.
- Shared-chrome fixes by the coordinator: footer disclaimer slot appends when the fragment has no code; breadcrumb `legacy` variant does not self-link the last crumb.
- The session's permission classifier denied the batch DA content writes for the new pages (classified as a production deploy). Not retried from the coordinator; delivery waits for the user's approval. Runbook: `stardust/.work/deploy/l2-delivery.md`; per-group commands in `stardust/.work/deploy/g<n>/ready.json`.

**Artifacts touched:** blocks/, styles/, fonts/, content/ (23 new pages), stardust/eds-conversion-log-g{1,2,3,4}.md, stardust/eds-port-log.md, stardust/eds-schema/, stardust/replica/progress-g{1..5}.json, stardust/replica/gates/, stardust/prototypes/ (+25), stardust/state.json (5 ported slugs migrated), .impeccable/config.json (replica-mode suppressions).

**Open questions:** approval to deliver (23 pages + 142 media files) to da.live; Coveo reuse; events snapshot cadence; keep or unify legacy footer/header recolour.

**Next:** on approval — upload media for g2/g3/g4, deliver per runbook, run published gates, update state/plan, commit.

---
## 2026-09-18T16:30:00Z — Wave L2 delivered and gated: 29 second-level pages live

**Prompt:** user typed "deliver" (approval of the DA content writes).

**Decisions:**
- Coordinator ran the delivery: 142 media uploads (G2/G3/G4), 25 content pages + relinked chrome/earlier pages via deploy-batch, tab pages previewed first (data-tab/data-accordion emitted by the pipeline) then published.
- Coordinator eyeball found the stories page 550 px short: the pipeline delivers multi-value section styles as ONE hyphen-joined class. Fixed at runtime in `scripts/scripts.js` (`splitCompoundSectionStyles`, tokens read from styles.css); all four groups re-measured after the fix.
- One reconcile round per group (spacer style, split-lede margins, alphanumeric tab labels; cover-cell padding, arrow gap, ticks spacing; headless card margin, picture-only split cell; sciex-now nav height, grant geometry, legacy footer rem, embed/hero aspect ratios) — all CSS/JS, four content pages regenerated and redelivered.
- Final: 26 of 29 pages pass every bar at both widths; 3 carry documented residuals (mass-spectrometers 360 trailing-nbsp wrap, forensics 360 trailing margin, environmental dropped junk anchor). Results table in `stardust/replica/migration-plan.md` § 2c.

**Artifacts touched:** scripts/scripts.js, blocks/*, styles/styles.css, content/* (localised, sanitised), content/.deploy-ledger.json, stardust/replica/progress-g{1..5}.json, stardust/replica/gates/*-published-*, stardust/state.json (33 pages migrated), stardust/replica/migration-plan.md, stardust/notes (N-33…N-35).

**Open questions (owner):** unify legacy footer / header recolour; Coveo; events snapshot cadence; back-to-top button (site-wide, not yet recreated); enable third-party tags.

**Next:** wave 1 siblings (remaining marketing pages) via `migrate` sibling tier + the v3 component→block importer; press-release and product-detail archetypes.

---
