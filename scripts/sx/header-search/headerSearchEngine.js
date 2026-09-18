/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/scripts/header-search/headerSearchEngine.js (2026-09-18); Coveo Headless CDN import rewritten to ../coveo-headless-shim.js where present. See stardust/eds-port-log.md */
/* eslint-disable */
import { buildSearchEngine } from '../coveo-headless-shim.js';

export const searchEngine = buildSearchEngine({
  configuration: {
    organizationId: 'danaherproductionrfl96bkr',
    accessToken: 'xx2136ae2c-554b-41a7-8afd-1ad8c7ffcb07',
    search: {
      searchHub: 'SCIEXMainSearch',
    },
    analytics: {
      analyticsMode: 'next',
      trackingId: 'sciex_us'
    },
  },
});

export default { searchEngine };