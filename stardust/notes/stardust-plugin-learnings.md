# Stardust plugin — learnings and improvement suggestions from the sciex.com replica (2026-09-18)

Scope of the session: `replica` end to end on https://sciex.com (2,826-URL sitemap, three front
ends on one host), 82 pages captured, 33 delivered to Edge Delivery and gated against the published
origin, orchestrated hands-off with 20+ parallel agents. The detailed, dated observations are in
`stardust-improvements.md` (N-01 … N-35); this document groups them into learnings a maintainer can
act on, ordered by impact. Each item names the skill/file to change.

---

## A. What worked (keep and codify)

1. **Measured recreation converges fast.** With the CSS lift + captured DOM, 6 of 8 product pages
   converged in ONE gate iteration; 24 of 25 second-level prototypes passed every bar (masked pixel
   diff 0.00–0.5 %, Δh 0). The gate-driven loop (band breakdown → first hot band → fix) is the right
   model. *(replica)*
2. **Group prototypes beat blind sibling cloning.** The variance probe showed every one of 20 "same
   template" pages differed in 6–11 template-defining values. Prototyping pages in groups that share
   a component set (products / applications / about-support / legacy) and letting each group add
   only its NEW components to the canon was the efficient path. Worth documenting as the default
   for template families with mixed component compositions. *(replica § Cumulative archetype
   prototypes, migrate fidelity-tiers)*
3. **Two-phase deploy with a single coordinator commit.** Convert + local gates (no commit, no DA
   write) → coordinator commits once, forces Code Sync → deliver + published gate. It removed both
   the concurrent-commit races and the watchdog stall that killed the first one-shot deploy agent.
   *(deploy § 7 should prescribe it for multi-agent runs; see N-21)*
4. **The "live DOM → clean markup" builder** for Tailwind/utility-class sites (a script that reads
   the settled DOM sidecar, maps utility classes + computed styles to component markup and reads
   per-instance variant flags) is what made groups converge in one iteration. Ship a skeleton.
   *(replica recreation-procedure § CSS lifting; N-25)*
5. **Ported already-EDS pages** instead of recreating them (four pages served by an EDS code base
   on sciex.com itself) — `sx-` prefixing on block-name collisions, vendor calls behind a shim over
   committed snapshots, owner decision named. Worth a small "port, don't recreate" reference.
   *(replica/extract; N-11)*

## B. Defects only a human eye caught (add instruments)

6. **Multi-value section styles are delivered as ONE hyphen-joined class** (`style: lead compact`
   → `lead-compact`; comma-separated too). Four conversion agents authored compound styles because
   the harness emulator split them; every compound style was inert on the published origin and the
   stories page rendered 550 px short. No gate flagged it — the coordinator's side-by-side eyeball
   did. Fix shipped as a runtime tokeniser in `scripts/scripts.js`. **Actions:** correct deploy
   SKILL.md #120 (current behaviour is "join", not "first value wins"); make `build-harness.mjs`
   reproduce the join; add a `davids-model-lint` 🟡 for multi-value `style` rows. *(N-34)*
7. **Pixel probes rate small colour/specificity defects as noise.** A CTA whose label rendered in
   the button's own colour (invisible) scored 0.01 %; desktop carousel controls that live hides
   scored under 1 %. **Actions:** make a reduced side-by-side eyeball (live | build) a required
   gate output per breakpoint, and add a computed foreground/background contrast probe over CTAs
   and link families inside the content root. *(N-20, KB run)*
8. **First-party fixed UI vs third-party widgets.** Every group masked the seam rows of fixed
   elements as "widgets"; one of them (`#back-to-top`) is first-party site UI and was never
   recreated. **Action:** during the chrome lift, list every fixed/sticky element with its owner
   (same-origin script vs vendor) and require a disposition per element. *(N-28, N-15)*

## C. Pipeline behaviours to document in deploy

9. `admin.hlx.page` normalises `_` to `-` in web paths: the PUT succeeds, the preview 404s. The KB
   family (1,789 `…_en_us` URLs) needs a redirect map. Add to path discipline; have `deploy-batch`
   normalise and emit `redirects.tsv`; make `localize-links` map the captured hrefs. *(N-22)*
10. The pipeline strips a paragraph's trailing `&nbsp;`; live wraps one extra line in one card at
    360 (a permanent 23 px residual on one page). Document as a #112-class justified residual.
11. Per-page slots inside shared chrome exist on real sites (the footer's trailing marketing text
    differs per page: `GEN-MKT-…`, `Related to …`, none on legacy). Pattern shipped: a page-metadata
    row substituted by the footer block at decorate time. Document in deploy § 6 and capture the
    slot per page at extract. *(N-23, N-27)*
12. Template-conditional chrome (legacy footer XF, blue header recolour via inline CSS, 10 px / 14 px
    rem bases) is common on multi-front-end sites. Canon should support chrome variants keyed by a
    template class (`Template:` metadata → body class) and expose `--chrome-rem` / `--chrome-type`
    variables; split `canon.css` into tokens+chrome vs. Tailwind preflight. *(N-18, N-29)*
13. `deploy-batch`'s ledger does not accumulate across `--paths` runs, so slice-wise delivery loses
    idempotent skipping. Merge on load, key by web path. *(N-33)*
14. Blocks that measure layout at decorate time must not rely on `window.load` (EDS decorates
    before block CSS applies); use ResizeObserver + rAF. Add to § 8 scaffold notes.

## D. Instruments (replica/diff scripts)

15. `pixel-compare`: add a rect mask (`x:y:w:h[@yB]`) and a `--mask-seams <chunkHeight>`
    convenience; always default `--timeout` (a masked compare hung 14 min). *(N-16, N-17, N-26)*
16. `stitch-shot`: report body height alongside `documentElement.scrollHeight`; a body scroll
    container with a tracking-pixel tail failed the Δh bar with nothing visible different. Add a
    `--hide <selector,…>` for known fixed widget roots. *(N-31, N-15)*
17. `motion-observe`: record inline-style state changes (Alpine `x-show`, `display`/`max-height`
    toggles) and pagination TEXT changes; run hovers in a separate pass; fall back to
    `[role=banner]` when there is no `<header>`. *(N-14, N-19)*
18. `chrome-parity` / `anchor`: default regions miss sites whose header is a `<nav>`; document
    `--no-defaults --region header=<sel>|<sel>`; `--json` writes `regions` as a list. *(N-16, N-17)*
19. `content-diff` / `content-inventory`: skip `<style>`/`<script>` text nodes inside the content
    root (AEM `htmlInjectionContainer` produced permanent 🟡s). *(N-26)*
20. `gate.sh`: scope the stale-instrument reaper to the gate dir (it killed other agents'
    instruments); never `rm -rf` a gate dir — write iteration subdirs; document a per-run evidence
    root for concurrent groups. *(N-30, N-35)*
21. `sibling-variance`: takes `--json` without a path (stdout) — document; zsh callers must use
    arrays (unquoted vars do not word-split). *(coordinator run)*
22. Video-heavy pages: posters vs. decoded frames are a permanent residual class; add a policy
    (`--video-poster`: mask `<video>` rects on both sides) and the harvest rule "first frame + 5 s
    clip; never rehost the mp4". *(N-32)*

## E. Extract / dynamics

23. `crawl.mjs` writes no fonts/logo/media although SKILL.md implies it; add
    `--assets fonts,css,logo,media[:archetypes]` or state plainly that the harvest is agent work.
    *(N-05)*
24. Consent banner survived into the home screenshot (OneTrust on the first navigation of a
    context); re-check visibility after dismissal, retry once. *(N-04)*
25. Login-gated redirects are logged as `DUP-OF <login page>`; log `GATED →` and set
    `_signals.loginGated`. *(N-06)*
26. Large inventories need a stratified roster policy for `--prep` and a `families[]` summary
    (template hint per page, sitemap count by prefix) so replica can propose archetypes. Also
    record a `platformHint` (aem-6 / eds / wordpress) — part of this site was already EDS.
    *(N-03, N-07, N-11)*
27. Rendered-DOM sidecars weigh ~1.6 MB per page (mega-menu repeated); 82 pages = 130 MB tracked
    by default. Ignore by default with opt-in, or strip repeated chrome into `_chrome.html`. *(N-13)*
28. `dynamics-detect --from-state` shrinks to 2 URLs when `type` is null; the detector misses AEM
    servlets (`/bin/*`), fragments (`*.plain.html`) and classifies the AEM CSRF token as data;
    vendors.json lacks WalkMe / Dreamdata / MaxMind / Salesforce MC rows. `playwright-cli` should
    not be a hard requirement. Listings docs still cite the retired `helix-query.yaml`. *(N-08…N-12)*

## F. Orchestration (master skill)

29. **Anti-stall rules belong in every delegated brief:** read by heading/line range, no tool call
    over ~5 minutes, long instruments in the background with a progress file, page-by-page ledgers
    so a killed agent resumes, no sleep over 30 s. The one agent that violated them was killed by
    the 600 s watchdog *after* delivering successfully, leaving no ledger.
30. **Shared-file discipline for parallel agents:** append-only via `cat >>`, re-read before each
    edit, per-group ledgers (`progress-g<n>.json`) merged by the coordinator, per-group CSS files
    deduplicated at deploy, explicit block ownership (one conversion point per block) and port
    assignment (the suggested 8791 was taken by a foreign project; several defaults were busy).
31. **Permission boundary:** the auto-mode classifier denied subagents' DA content writes
    (classified as a production deploy) while allowing media PUTs; the coordinator must not route
    around a denial. Pattern that worked: finish everything up to the write, ask the user once
    ("deliver"), then run the writes from the coordinator. Document in deploy § Deploy.
32. **Design-hook interplay:** impeccable's design hook flags replica prototypes for "cramped
    padding", "overused font: Helvetica", "layout transition" — all sanctioned in preserve mode.
    Replica should ship a documented ignore recipe (value-scoped ignores with the replica reason),
    or the master skill should set a `stardust/prototypes/**` file ignore with user approval.
33. **Fonts policy nuance:** self-hosted commercial faces (Geogrotesque, owner already self-hosts)
    were reused with licence confirmation pending; Typekit kits (proxima-nova) never rehosted. The
    policy text should distinguish "owner self-hosts" from "hosted kit" explicitly, and warn that a
    public repo exposes the binaries.

## G. Numbers worth keeping as calibration

| Regime | Typical result this session |
|---|---|
| Prototype vs live, v3 marketing pages | 0.00–0.5 % masked, Δh 0, 1–2 iterations |
| Prototype vs live, legacy Bootstrap templates | 0.3–1.4 % masked, Δh ≤ 1, 2–3 iterations |
| Published origin vs live, after one reconcile round | 0.01–3.5 % masked; Δh 0 on 26 of 29 pages |
| Ported EDS pages, body band | 0.15–1.5 % |
| Residual classes that recur | fixed third-party widgets at seams; posters vs decoded video; pipeline `&nbsp;` strip; 1 px inert spacers; glyph antialiasing in dense footers |
