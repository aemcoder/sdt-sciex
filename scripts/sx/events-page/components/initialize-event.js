/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/scripts/events-page/components/initialize-event.js (2026-09-18); Coveo Headless CDN import rewritten to ../coveo-headless-shim.js where present. See stardust/eds-port-log.md */
import { eventResultsListController, eventQuerySummary } from '../controller/event-page-controllers.js';
import fetchMoreEvents from './renderMoreEvents.js';
import renderEventFacets from './renderEventFacets.js';
import renderEventList from './renderEventList.js';

function getActiveTabName() {
  const activeTab = document.querySelector('.tab-nav .tab.active');
  const tabId = activeTab ? activeTab.dataset.tab : null;
  if (tabId === 'upcoming') {
    return 'Upcoming events';
  } if (tabId === 'on-demand') {
    return 'On-demand';
  }
  return '';
}

export default function renderEvents() {
  const querySummaryState = eventQuerySummary.state;

  const section = document.createElement('section');
  section.className = 'event-details active';
  section.id = 'upcoming';

  const eventHeader = document.createElement('div');
  eventHeader.className = 'event-header';
  eventHeader.id = 'eventHeader';

  const title = document.createElement('h1');
  title.className = 'event-title';
  title.textContent = getActiveTabName();
  title.id = 'eventTitle';

  const searchTermContainer = document.createElement('div');
  searchTermContainer.className = 'search-term-container';
  searchTermContainer.id = 'searchTermContainer';

  const label = document.createElement('div');
  label.className = 'search-term-label';
  label.textContent = 'Search term';

  const value = document.createElement('div');
  value.className = 'search-term-value';
  value.id = 'searchTermValue';

  const wrapper = document.createElement('div');
  wrapper.id = 'query-summary';
  wrapper.className = 'tw-text-sm';

  const content = document.createElement('div');

  const text1 = document.createTextNode('Results ');
  const spanRange = document.createElement('span');
  spanRange.textContent = `${querySummaryState.firstResult} - ${querySummaryState.lastResult} `;

  const text2 = document.createTextNode('of ');
  const spanTotal = document.createElement('span');
  spanTotal.textContent = querySummaryState.total;

  content.append(text1, spanRange, text2, spanTotal);
  wrapper.appendChild(content);

  searchTermContainer.append(label, value);

  const { filterSection, mobileButton } = renderEventFacets();

  // Add title and search term container to the header
  eventHeader.appendChild(title);
  eventHeader.appendChild(searchTermContainer);
  eventHeader.appendChild(filterSection);
  eventHeader.appendChild(mobileButton);

  section.append(
    eventHeader,
    wrapper,
    renderEventList(eventResultsListController),
    fetchMoreEvents(eventResultsListController),
  );

  // Restore search term from localStorage if it exists
  const storedSearchTerm = localStorage.getItem('searchTerm');
  searchTermContainer.style.display = 'none';
  if (storedSearchTerm && storedSearchTerm.trim() !== '') {
    searchTermContainer.style.display = 'block';
    wrapper.style.display = 'block';
    title.style.display = 'none';
    value.textContent = storedSearchTerm;
  } else {
    searchTermContainer.style.display = 'none';
    wrapper.style.display = 'none';
    title.style.display = 'block';
    value.textContent = '';
  }

  // Set up the search input toggle logic
  const eventSearch = document.getElementById('eventSearch');
  if (eventSearch) {
    eventSearch.addEventListener('keydown', (event) => {
      const searchTerm = event.target.value.trim();
      if (event.key === 'Enter') {
        if (searchTerm !== '') {
          localStorage.setItem('searchTerm', searchTerm);
        }
      }
      if (event.key === 'Backspace') {
        localStorage.removeItem('searchTerm');
      }
    });
  }

  return section;
}
