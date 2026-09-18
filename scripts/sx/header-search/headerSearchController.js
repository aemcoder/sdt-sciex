/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/scripts/header-search/headerSearchController.js (2026-09-18); Coveo Headless CDN import rewritten to ../coveo-headless-shim.js where present. See stardust/eds-port-log.md */
/* eslint-disable */
import { buildStandaloneSearchBox } from '../coveo-headless-shim.js';
import { searchEngine }  from './headerSearchEngine.js';

export const standaloneSearchBoxController = buildStandaloneSearchBox(searchEngine, {
  options: {
    redirectionUrl: '/search-results',
    numberOfSuggestions: 5,
    highlightOptions: {
      notMatchDelimiters: {
        open: '<strong>',
        close: '</strong>&nbsp;',
      },
      correctionDelimiters: {
        open: '<i>',
        close: '</i>&nbsp;',
      },
    },
  },
});