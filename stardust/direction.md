---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-18T07:33:47Z
  againstInput: https://sciex.com
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
    - stardust/.work/page-types.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://sciex.com,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-09-18T07:33:47Z). Provenance: verbatim `--prep` promotion
(full-prep branch; `stardust/current/PRODUCT.md` existed).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

## Hands-off activation

Activated 2026-09-18T07:33:47Z by the user's instruction "proceed without asking for my input".
`state.json.handsOff: true`. Every gate runs at full strength; interactive pauses
auto-resolve and are recorded here as named assumptions.

## Named assumptions (hands-off)

- **Volume cap for extract --prep:** 73-page stratified roster (every section landing +
  samples of every template family) of the 2,826-URL sitemap; the migration plan sizes
  families from the sitemap. (Master skill default: 100 overall / 20 per template.)
- **Archetypes for this run:** home (`/`), `/applications/pharma-and-biopharma`
  (v3 application/marketing landing — the most reused module set, ~150 application pages
  and the same modules on product/technology/about pages), and the knowledge-base article
  `/support/knowledge-base-articles/resetting-root-director-…_en_us` (1,789 pages,
  63 % of the inventory). Reasoning in stardust/replica/migration-plan.md § 2.
- **Fonts:** Geogrotesque (commercial, Emtype) is self-hosted by SCIEX on sciex.com; the
  replica reuses the captured variable woff2 (same owner, same site) with licence
  confirmation pending as an owner decision. proxima-nova (Typekit, legacy pages only) is
  not rehosted.
- **Login-gated surfaces** (`/training/*`, SCIEX Now dashboards, account) are out of
  scope; chrome is rendered in the anonymous state.
- **Third-party overlays** (OneTrust consent, WalkMe login-nudge balloon) are not page
  content; they are dismissed/masked in the gate and scaffolded disabled in delivery.
- **Inconsistency register:** empty. No audit was run because the user asked for a
  replica, not improvements.
