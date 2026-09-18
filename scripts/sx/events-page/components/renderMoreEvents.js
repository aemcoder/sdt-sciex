/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/scripts/events-page/components/renderMoreEvents.js (2026-09-18); Coveo Headless CDN import rewritten to ../coveo-headless-shim.js where present. See stardust/eds-port-log.md */
export default function fetchMoreEvents(eventResultsListController) {
  const hasMoreResult = eventResultsListController.state.moreResultsAvailable;

  const eventWrapper = document.createElement('div');
  eventWrapper.className = 'more-events-button-wrapper';

  const moreEventIcon = document.createElement('span');
  moreEventIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16" fill="none">
        <path d="M6.5 0L6.5 15" stroke="white"/>
        <path d="M12.5 9L6.5 15L0.500001 9" stroke="white"/>
    </svg>`;

  const moreEventsButton = document.createElement('button');
  moreEventsButton.textContent = 'More Events';
  moreEventsButton.className = 'more-events-button';
  moreEventsButton.appendChild(moreEventIcon);

  if (!hasMoreResult) {
    moreEventsButton.style.display = 'none';
  }

  moreEventsButton.onclick = () => {
    if (hasMoreResult) {
      eventResultsListController.fetchMoreResults();
    }
  };

  eventWrapper.append(moreEventsButton);
  return eventWrapper;
}
