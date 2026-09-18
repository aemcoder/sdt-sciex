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
