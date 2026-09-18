/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/scripts/events-page/event-engine.js (2026-09-18); Coveo Headless CDN import rewritten to ../coveo-headless-shim.js where present. See stardust/eds-port-log.md */
/* eslint-disable */
import { buildSearchEngine } from '../coveo-headless-shim.js';

let accessToken = '';
let organizationId = '';

let mainDiv = document.querySelector('main');
const sections = mainDiv.querySelector('.events').children;
Array.from(sections).forEach((section, index) => {
  const iteration = index + 1;
  if(iteration === 2){
    organizationId = section.querySelector('div').innerText;
  } else if(iteration === 3){
    accessToken = section.querySelector('div').innerText;
  }
});

export const eventSearchEngine = buildSearchEngine({
  configuration: {
    organizationId: organizationId,
    accessToken: accessToken,
    search: {
      searchHub: 'SCIEXEventListing',
    },
    analytics: {
      analyticsMode: 'next',
      trackingId: 'sciex_us'
    },
  },
});

export default { eventSearchEngine };