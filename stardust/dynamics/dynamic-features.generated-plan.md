<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-09-18T07:01:16.089Z · input stardust/current/_dynamics.json (5 pages, 48 findings) · target probe https://main--sdt-sciex--aemcoder.aem.live -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 5/5 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 2 | a-unknown-third-party-host-www-google-com | A | unknown third-party host www.google.com | 4/5 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 3 | a-unknown-third-party-host-px-ads-linkedin-com | A | unknown third-party host px.ads.linkedin.com | 4/5 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 4 | a-unknown-third-party-host-v55685555553mx3rf3h3n3n3i09155019 | A | unknown third-party host v55685555553mx3rf3h3n3n3i091550196.us-1.evergage.com | 4/5 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 5 | a-cms-app-settings-object-granite | A | CMS / app settings object Granite | 4/5 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 6 | a-unknown-third-party-host-t-co | A | unknown third-party host t.co | 3/5 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 7 | a-cms-app-settings-object-digitaldata | A | CMS / app settings object digitalData | 2/5 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 8 | cr-client-rendered-slot-js-scroll-container-tw-flex-tw-pr-24 | CR | client-rendered slot js-scroll-container tw-flex tw-pr-24 | 1/5 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 9 | cr-main-empty-at-load-filled-after-client-rendered-page | CR | main empty at load, filled after (client-rendered page) | 1/5 | static-snapshot | needs-human-capture | pending | client-rendered-page | human-browser capture; never migrate blank |  |
| 10 | d-first-party-data-file-get-libs-granite-csrf-token-json | D | first-party data file GET /libs/granite/csrf/token.json | 4/5 (reach 66/73) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 11 | d-first-party-data-file-get-hreflang-json | D | first-party data file GET /hreflang.json | 1/5 (reach 3/73) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 12 | d-first-party-data-file-get-placeholders-json | D | first-party data file GET /placeholders.json | 1/5 (reach 3/73) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 13 | f-form-backend-salesforce-pardot | F | form backend: Salesforce / Pardot | 4/5 | rebuild-native | needs-backend | pending | forms | production backend (vendor form id + field mapping) |  |
| 14 | f-form-protection-captcha-antibot | F | form protection: captcha / antibot | 2/5 | rebuild-native | needs-backend | pending | forms | production backend (vendor form id + field mapping) |  |
| 15 | f-form-u-header-search-origin-search-results-1-fields | F | form "u-header--search" → origin /search-results (1 fields) | 1/5 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 16 | f-form-nohtml-origin-search-results-1-fields | F | form "nohtml" → origin /search-results (1 fields) | 1/5 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 17 | f-form-add-instrument-form-no-action-js-wired-2-fields-token | F | form "add-instrument-form" → no action (JS-wired) (2 fields, tokens: token,token2) | 1/5 | client-only | self | pending | client-compute | none |  |
| 18 | i18n-locale-variants-en-us-zh-cn-ja-jp-ko-kr-x-default | I18N | locale variants en-US,zh-CN,ja-JP,ko-KR,x-default | 4/5 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 19 | i18n-locale-variants-en-us-x-default | I18N | locale variants en-US,x-default | 1/5 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 20 | l-listing-candidate-listing-spaced-row-flex-grow-1-6-cards | L | listing candidate listing-spaced-row flex-grow-1 (6 cards) | 1/5 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 21 | m-modal-trigger-aria-haspopup-chrome-only-button-content | M | modal trigger aria-haspopup (chrome only) → button:content | 5/5 (reach 24/73) | rebuild-native | self | pending | chrome-interaction | none (motion-observe evidence) |  |
| 22 | m-modal-trigger-popup-target-outside-dom-at-capture | M | modal trigger popup → target outside DOM at capture | 1/5 (reach 2/73) | rebuild-native | self | pending | modal-loader | none |  |
| 23 | m-modal-trigger-data-modal-target-target-outside-dom-at-capt | M | modal trigger data-modal-target → target outside DOM at capture | 1/5 (reach 1/73) | rebuild-native | self | pending | modal-loader | none |  |
| 24 | s-search-hosted-search-service | S | search: hosted search service | 5/5 | index-backed | self | pending | search-index-backed | replace the hosted search service? |  |
| 25 | s-site-search-form-js-submitted | S | site search form → (JS-submitted) | 4/5 (reach 2/73) | index-backed | self | pending | search-index-backed | results page scope (second corpora stay out) |  |
| 26 | t-guidance-walkme-digital-adoption-overlay | T | guidance: WalkMe digital adoption overlay | 5/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 27 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 5/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 28 | t-consent-onetrust | T | consent: OneTrust | 5/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | CMP domain script reuse on the new host |  |
| 29 | t-unknown-third-party-host-cdn-drda-io | T | unknown third-party host cdn.drda.io | 5/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 30 | t-analytics-dreamdata-b2b-attribution | T | analytics: Dreamdata B2B attribution | 5/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 31 | t-unknown-third-party-host-s3-walkmeusercontent-com | T | unknown third-party host s3.walkmeusercontent.com | 5/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 32 | t-feedback-survey-voc-badge | T | feedback: survey / VoC badge | 4/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 33 | t-analytics-google-analytics-ads | T | analytics: Google Analytics / Ads | 4/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 34 | t-unknown-third-party-host-img04-en25-com | T | unknown third-party host img04.en25.com | 4/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 35 | t-unknown-third-party-host-static-ads-twitter-com | T | unknown third-party host static.ads-twitter.com | 4/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 36 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 4/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 37 | t-unknown-third-party-host-www-google-ch | T | unknown third-party host www.google.ch | 4/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 38 | t-analytics-session-replay | T | analytics: session replay | 4/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 39 | t-unknown-third-party-host-cdn-evgnet-com | T | unknown third-party host cdn.evgnet.com | 4/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 40 | t-unknown-third-party-host-analytics-twitter-com | T | unknown third-party host analytics.twitter.com | 4/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 41 | t-unknown-third-party-host-cdn-usefathom-com | T | unknown third-party host cdn.usefathom.com | 2/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 42 | t-unknown-third-party-host-cloud-tinymce-com | T | unknown third-party host cloud.tinymce.com | 2/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 43 | t-unknown-third-party-host-cdn-tiny-cloud | T | unknown third-party host cdn.tiny.cloud | 2/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 44 | t-unknown-third-party-host-sp-tinymce-com | T | unknown third-party host sp.tinymce.com | 2/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 45 | t-rum-error-monitoring | T | RUM: error monitoring | 2/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 46 | t-chat-live-chat-widget | T | chat: live chat widget | 1/5 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 47 | v-iframe-without-src-runtime-injected-embed | V | iframe without src (runtime-injected embed) | 5/5 | embed-passthrough | needs-human-capture | pending | embed-passthrough | resolve the runtime src from a rendered capture |  |
| 48 | x-sign-in-account-links | X | sign-in / account links | 5/5 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 13 row(s) — read-settings, settled-dom-snapshot, sheet-sync, client-compute, chrome-interaction, modal-loader, search-index-backed.
- **One owner decision batch:** 34 row(s) — inspect the XHR, add a vendor row · human-browser capture; never migrate blank · production backend (vendor form id + field mapping) · production endpoint; interim capture ships now · scope of the locale trees · index-driven or editorially curated?.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 3 of 3 probed API paths — the off-origin data work.

## Phases

- **tags** — 21
- **detect** — 7
- **forms** — 4
- **data** — 3
- **interactive** — 3
- **capture** — 2
- **locale wave** — 2
- **search** — 2
- **client tools** — 1
- **listings** — 1
- **embeds** — 1
- **register** — 1
