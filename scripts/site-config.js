/**
 * scripts/site-config.js — owner-facing site configuration for the SCIEX replica.
 *
 * Every third-party tag observed on sciex.com (stardust/dynamic-features.md, rows T-01…T-09,
 * S-01/S-02) is recorded here with its ids and endpoints, all `enabled: false`. Nothing in
 * this file loads anything by itself: `scripts/consented.js` (the consent-gated phase) may
 * call `loadEnabledTags()` once the owner flips a vendor on and confirms the ids for the
 * new host. Status in the parity report: scaffolded-awaiting-owner — never "dropped".
 */

export const site = {
  sourceHost: 'https://sciex.com',
  // S-01: header search box redirects here (interim: index-backed results page)
  searchResultsPath: '/search-results',
  // S-01 content-type facet values (header dropdown) — authored in /nav section 5
  // X-01 (decided-out): logged-out chrome; every account entry point stays on the source
  login: 'https://sciex.com/bin/sciex/login',
  createAccount: 'https://sciex.com/support/create-account',
  profile: 'https://sciex.com/support/profile',
  favourites: 'https://sciex.com/resource-hub/myfavorite',
  dashboard: 'https://sciex.com/support',
  requestQuote: 'https://sciex.com/form-pages/product-request',
  shop: 'https://us-store.sciex.com/USD', // X-02: external store (Segment ajs_aid dropped)
};

export const tags = {
  onetrust: { enabled: false, domainScript: '0dec26b6-99d0-4899-bb84-862e1aef78ce', src: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js' }, // T-01
  gtm: { // T-02 (+ T-03 pixels ride inside)
    enabled: false,
    containers: ['GTM-WMZL3B'],
    ga4: 'G-KD23C87L58',
    alternates: ['GTM-5J97L4S', 'GTM-KX7X4W', 'GTM-PDRV95V', 'GTM-WW7MKD'],
  },
  decibel: { enabled: false, host: 'cdn.decibelinsight.net' }, // T-04 session replay
  salesforce: { enabled: false, personalization: 'cdn.evgnet.com', dataCloud: 'cdn.c360a.salesforce.com' }, // T-05
  dreamdata: { enabled: false, host: 'cdn.dreamdata.cloud', loader: 'cdn.drda.io' }, // T-06
  fathom: { enabled: false, host: 'cdn.usefathom.com' }, // T-07
  qualtrics: { enabled: false, zones: ['ZN_1o1ioypsMWWxBmB', 'ZN_b4z8pJnZ6X9z32B'] }, // T-08
  walkme: { enabled: false, user: '1e111ec6', host: 's3.walkmeusercontent.com' }, // T-09 (carries the M-10 login nudge)
  maxmind: { enabled: false, endpoint: 'https://geoip-js.com/geoip/v2.1/country/me' }, // T-12 (consumer unidentified)
  coveo: { enabled: false, org: 'danaherproductionrfl96bkr', searchHub: 'SCIEXMainSearch' }, // S-01 suggestions / S-02 results
};

/**
 * Loads every enabled vendor script. Called from the consented phase only; with every
 * vendor disabled this is a no-op.
 */
export function loadEnabledTags() {
  Object.entries(tags).forEach(([name, cfg]) => {
    if (!cfg.enabled || !cfg.src) return;
    const s = document.createElement('script');
    s.src = cfg.src;
    s.async = true;
    s.dataset.vendor = name;
    if (name === 'onetrust') s.dataset.domainScript = cfg.domainScript;
    document.head.append(s);
  });
}

/**
 * sxPort — the pages ported from the source's OWN Edge Delivery code base (sciex.com/blocks/*,
 * see stardust/eds-port-log.md): /events, /resource-hub, /resource-hub/regulatory-documents,
 * /about-us/contact-us. Every off-origin fetch those blocks made on sciex.com is answered from a
 * committed snapshot under /data (off-origin-data.md Tier 2) — the block code is unchanged apart
 * from import paths; the endpoints live here.
 */
export const sxPort = {
  coveo: {
    // OWNER DECISION (S-02/S-03/L-01): may the replica reuse Coveo org `danaherproductionrfl96bkr`
    // (search hubs below) with its public tokens from the new host? Until decided the ported
    // code runs against scripts/sx/coveo-headless-shim.js over the snapshots listed here.
    enabled: false,
    org: 'danaherproductionrfl96bkr',
    headless: 'https://static.cloud.coveo.com/headless/v3/headless.esm.js',
    hubs: {
      SCIEXEventListing: { // blocks/events (L-01)
        snapshots: ['/data/events/upcoming.json', '/data/events/on-demand.json'],
        provenance: '/data/events/_provenance.json',
        pageSize: 10,
        blockSelector: '.events.block',
      },
      // blocks/resourcehub-search (S-03): query suggestions off in the snapshot tier
      SCIEXMainSearch: { snapshots: [], suggestions: false },
    },
  },
  partners: { // blocks/contact-information (A-03) — was GET /bin/sciex/partners
    url: '/data/partners/partners.json',
    provenance: '/data/partners/_provenance.json',
    source: 'https://sciex.com/bin/sciex/partners',
  },
  // The S-02 results page (/search-results) is not on this host yet: search submits from the
  // ported resource-hub search complete on the source host. Set to '' once /search-results ships.
  searchResultsOrigin: 'https://sciex.com',
};
