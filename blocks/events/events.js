/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/events/events.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
import { } from '../../scripts/aem.js';
import renderEvents from '../../scripts/sx/events-page/components/initialize-event.js';
import renderEventSearchBox from '../../scripts/sx/events-page/components/renderEventSeachBox.js';
import { eventSearchEngine } from '../../scripts/sx/events-page/event-engine.js';
import {
  tabController,
  eventregionController,
  eventapplicationsController,
  eventeventyearController,
  eventeventmonthController,
} from '../../scripts/sx/events-page/controller/event-page-controllers.js';

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    event: params.get('event') || null,
    region: params.get('region') || null,
    application: params.get('application') || null,
    year: params.get('year') || null,
    month: params.get('month') || null,
  };
}

function clearQueryParams() {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
}

const PARAM_CONTROLLER_MAP = {
  region: eventregionController,
  application: eventapplicationsController,
  year: eventeventyearController,
  month: eventeventmonthController,
};

function applyQueryParamPreselections(queryParams) {
  Object.entries(PARAM_CONTROLLER_MAP).forEach(([paramKey, controller]) => {
    const paramValue = queryParams[paramKey];
    if (!paramValue) return;

    let applied = false;

    const unsubscribe = controller.subscribe(() => {
      if (applied) return;

      const { values } = controller.state;
      if (!values || values.length === 0) return;

      const match = values.find(
        (v) => v.value.toLowerCase() === paramValue.toLowerCase(),
      );

      if (match) {
        applied = true;   // set flag BEFORE unsubscribe and toggleSelect
        unsubscribe();    // unsubscribe BEFORE toggleSelect to prevent re-fire loop
        controller.toggleSelect(match);
      }
    });
  });
}

export default async function decorate(block) {
  const queryParams = getQueryParams();
  if (Object.values(queryParams).some(Boolean)) {
    applyQueryParamPreselections(queryParams);
  }
 
  const eventsDiv = document.createElement('div');
  eventsDiv.id = 'events';

  const modal = document.createElement('div');
  modal.id = 'event-filter-modal';
  modal.className = 'event-modal hidden';
  document.body.appendChild(modal);

  // Create tab navigation
  const nav = document.createElement('nav');
  nav.className = 'tab-nav';

  const tabs = document.createElement('div');
  tabs.className = 'tabs';

  const tabUpcoming = document.createElement('button');
  tabUpcoming.className = 'tab active';
  tabUpcoming.dataset.tab = 'upcoming';
  tabUpcoming.textContent = 'Upcoming events';

  const tabOnDemand = document.createElement('button');
  tabOnDemand.className = 'tab';
  tabOnDemand.dataset.tab = 'on-demand';
  tabOnDemand.textContent = 'On-demand';

  tabs.appendChild(tabUpcoming);
  tabs.appendChild(tabOnDemand);

  const searchBox = renderEventSearchBox();

  nav.appendChild(tabs);
  nav.appendChild(searchBox);
  eventsDiv.appendChild(nav);

  // Render and store references to section containers
  let upcomingSection = renderEvents();

  eventsDiv.appendChild(upcomingSection);

  // Tab switching logic
  eventsDiv.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      eventsDiv.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      eventsDiv.querySelectorAll('.event-details').forEach((section) => section.classList.remove('active'));

      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      if (tabName === 'upcoming') {
        tabController('NOT@eventType==On-demand', 'Upcoming');
      } else {
        tabController('@eventtype==On-demand', 'OnDemand');
      }
      const target = eventsDiv.querySelector(`#${tabName}`);
      if (target) target.classList.add('active');
    });
  });

  localStorage.removeItem('searchTerm');

  block.textContent = '';
  block.append(eventsDiv);

  try {
    eventSearchEngine.executeFirstSearch();

    if (queryParams.event === 'on-demand') {
      tabOnDemand.classList.add('active');
      tabUpcoming.classList.remove('active');
    
      tabController('@eventtype==On-demand', 'OnDemand');
    } else {
      tabUpcoming.classList.add('active');
      tabOnDemand.classList.remove('active');
    
      tabController('NOT@eventType==On-demand', 'Upcoming');
    }

    clearQueryParams();

    eventSearchEngine.subscribe(() => {
      const newUpcoming = renderEvents();
    
      eventsDiv.replaceChild(newUpcoming, upcomingSection);
    
      upcomingSection = newUpcoming;
    });
  } catch (error) {
    eventSearchEngine.executeFirstSearch();
  }
}
