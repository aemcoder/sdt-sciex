# Font licensing — SCIEX replica (stardust:deploy, 2026-09-18)

Policy: **self-hosted-reuse, licence confirmation pending (owner).** The live site
(sciex.com) self-hosts these faces from its own clientlib; the replica targets the same
owner, so the harvested woff2 files are reused for fidelity. The owner must confirm the
webfont/embedding licence covers the new host before publishing to `aem.live`.

| file | family | foundry | status |
|---|---|---|---|
| `geogrotesque-sharp-vf.woff2` | Geogrotesque Sharp VF (wght 0–1000, wdth 0–1000, ital) | Emtype Foundry | licence confirmation pending |
| `geogrotesque-ultlt.woff2` | Geogrotesque UltraLight (weight 200 face) | Emtype Foundry | licence confirmation pending |

Remove path (if the licence cannot be confirmed): delete both `.woff2` files and every
`@font-face` rule in `styles/fonts.css`. Every stack names `geogrotesque-fallback`
(metric-matched local Arial, declared in `styles/styles.css`) second, so the site falls
back to Arial with matching line metrics and no layout shift.
