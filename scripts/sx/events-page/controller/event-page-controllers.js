/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/scripts/events-page/controller/event-page-controllers.js (2026-09-18); Coveo Headless CDN import rewritten to ../coveo-headless-shim.js where present. See stardust/eds-port-log.md */
/* eslint-disable */
import {
    buildSearchBox,
    buildFacet,
    buildResultList,
    buildPager,
    buildQuerySummary,
    buildContext,
    buildTab
} from '../../coveo-headless-shim.js';
import { eventSearchEngine }  from '../event-engine.js';

export const eventSearchBoxController = buildSearchBox(eventSearchEngine, {
    options: {
        numberOfSuggestions: 5,
        highlightOptions: {
        notMatchDelimiters: {
            open: '<strong>',
            close: '</strong>',
        },
        correctionDelimiters: {
            open: '<i>',
            close: '</i>',
        },
        },
    },
});

export const eventResultsListController = buildResultList(eventSearchEngine, {
  options: {
    fieldsToInclude: ['eventyear', 'eventmonth', 'eventtype', 'eventdate']
  },
});

export const tabController = (expression, id) => {
  const tab = buildTab(eventSearchEngine, {
    options: {
      expression,
      id,
    },
  });
  tab.select();
};

export const eventQuerySummary = buildQuerySummary(eventSearchEngine);

export const eventPaginationController = buildPager(eventSearchEngine);

const facetFields = ['region', 'applications', 'eventyear', 'eventmonth'];

const createFacetControllers = (fields) => {
  const controllers = {};
  fields.forEach((field) => {
    const controllerName = `event${field}Controller`;
    controllers[controllerName] = buildFacet(eventSearchEngine, {
      options: {
        numberOfValues: 5,
        field: field,
        facetId: field,
        basePath: [],
        delimitingCharacter: '|',
      },
    });
  });
  return controllers;
};

const controllers = createFacetControllers(facetFields);

// Export each controller individually
export const eventregionController = controllers.eventregionController;
export const eventapplicationsController = controllers.eventapplicationsController;
export const eventeventyearController = controllers.eventeventyearController;
export const eventeventmonthController = controllers.eventeventmonthController;


const context = buildContext(eventSearchEngine)
context.add('host', window.location.origin);
context.add('lang', document.documentElement.lang || 'en');
  