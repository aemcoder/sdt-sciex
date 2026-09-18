/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/scripts/events-page/components/renderEventSeachBox.js (2026-09-18); Coveo Headless CDN import rewritten to ../coveo-headless-shim.js where present. See stardust/eds-port-log.md */
import { eventSearchBoxController } from '../controller/event-page-controllers.js';

export default function renderEventSearchBox() {
  const searchBox = document.createElement('div');
  searchBox.className = 'event-search-box';
  searchBox.innerHTML = `<span id="search-icon" class="search-icon"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0065 7.33324C12.0065 9.7264 10.0664 11.6665 7.67318 11.6665C5.27993 11.6665 3.33984 9.7264 3.33984 7.33324C3.33984 4.94007 5.27993 3 7.67318 3C10.0664 3 12.0065 4.94007 12.0065 7.33324ZM11.0743 11.4414C10.1512 12.2066 8.96589 12.6665 7.67318 12.6665C4.72766 12.6665 2.33984 10.2787 2.33984 7.33324C2.33984 4.38777 4.72766 2 7.67318 2C10.6187 2 13.0065 4.38777 13.0065 7.33324C13.0065 8.62593 12.5466 9.81119 11.7815 10.7343L14.0267 12.9796L14.3803 13.3331L13.6732 14.0402L13.3196 13.6867L11.0743 11.4414Z" fill="#707070"></path>
  </svg></span> <input type="text" placeholder="Search" />`;
  searchBox.id = 'eventSearch';

  searchBox.addEventListener('input', (event) => {
    const query = event.target.value;
    if (query.length > 0) {
      eventSearchBoxController.updateText(query);
      eventSearchBoxController.showSuggestions();
    } else {
      eventSearchBoxController.updateText('');
    }
  });

  searchBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.value.trim() !== '') {
      eventSearchBoxController.submit();
    }
  });

  searchBox.addEventListener('input', () => {
    if (eventSearchBoxController.state.value === '') {
      eventSearchBoxController.clear();
      eventSearchBoxController.submit();
    }
  });

  return searchBox;
}
