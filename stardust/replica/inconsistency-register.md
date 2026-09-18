<!-- stardust:provenance writtenBy=stardust:replica againstInput=https://sciex.com sources=gate evidence (kb-article recreation); no audit run, no --register file -->
# Inconsistency register — sciex.com replica

No `applied` entries — pure replica. Everything not listed as `applied` here is frozen; any
design delta found by the gate is a defect, not an improvement. The `deferred` entries below
change nothing in this run; they are source-site inconsistencies surfaced by the gates and
ride along as a handover list for the owner.

## R-01 — Two live footers (v3 footer XF vs legacy `--new-footer` XF)

- **Evidence:** `stardust/replica/gates/kb-article-1440/chrome-parity-*.json` and
  `chrome-footer-diff.png` vs `stardust/replica/gates/home-1440/`; live KB article footer
  shows the Twitter bird icon (v3 shows X), "© Copyright 2025" (v3: 2026 with a GEN-MKT
  code), no mobile language toggle, 32px column padding and `grid-cols-4` without the 32px
  gap, unpadded partner-logo `li`, disclaimer weight 330. Root cause: legacy pages set
  `html{font-size:62.5%}` so Tailwind rem utilities resolve at a 10px rem, and load a
  different footer experience fragment.
- **Finding:** the footer is not one component on the live site — legacy-template pages
  (KB articles ×1,789, SCIEX Now support, detail-page) render an older footer variant with
  stale copyright and an outdated social icon.
- **Minimal change:** serve the v3 footer on every migrated page (one `/footer` document),
  which changes the legacy family's footer to the current one; no other footer change.
- **Status:** deferred (this run replicates each template's footer as captured, compensated
  in `stardust/prototypes/css/kb-article.css` under `.page--kb`).
- **Where:** kb-article, sciex-now-legacy, legacy-detail-page, legacy-intermediate families.

## R-02 — Legacy pages render Geogrotesque weight 400 from the static Ge2003 face

- **Evidence:** `stardust/replica/capture/tokens-kb-1440.json` (chrome copyright line
  139px vs 149px wide on v3); legacy pages load the static `Ge2003-*` cuts alongside the
  variable face, so weight-400 chrome text resolves to the static Regular.
- **Finding:** the same chrome text renders in two different Geogrotesque cuts depending on
  the page template.
- **Minimal change:** load only the variable face site-wide (drop the static Ge2003 cuts).
- **Status:** deferred (replicated as captured: `Ge2003-Rg.woff2` declared at 400 on the
  KB prototype only).
- **Where:** same families as R-01.
