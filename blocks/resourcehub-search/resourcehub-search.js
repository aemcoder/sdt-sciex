/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/resourcehub-search/resourcehub-search.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
import { } from '../../scripts/sx/scripts.js';
import { } from '../../scripts/aem.js';

import { standaloneSearchBoxController } from '../../scripts/sx/header-search/headerSearchController.js';

const HISTORY_KEY = 'searchHistory';
function getSearchHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}

function saveQueryToLocalHistory(query) {
  let history = getSearchHistory();
  if (!history.includes(query)) {
    history.unshift(query);
    history = history.slice(0, 5); // Keep max 5 items
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

const showSuggestions = (selectedContentType, queryString, showHistoryOnly = false) => {
  const suggestionPopup = document.getElementById('resourcehub-search-suggestion');
  const searchBox = document.getElementById('resourcehub-search-box');
  const suggestions = standaloneSearchBoxController.state.suggestions || [];
  const history = getSearchHistory();

  const rect = searchBox.getBoundingClientRect();
  suggestionPopup.style.top = `${rect.bottom + window.scrollY + 20}px`;
  suggestionPopup.style.left = `${rect.left + window.scrollX - 18}px`;

  const shouldShowSuggestions = showHistoryOnly && suggestions.length > 0;
  const shouldShowHistory = history.length > 0;

  if (shouldShowSuggestions || shouldShowHistory) {
    let html = '';

    if (shouldShowHistory) {
      html += '<div style="padding: 8px; font-weight: 330; font-size: 14px; color: #8A8A8A;">Search History</div>';
      html += history
        .map((query) => `
          <div class="resourcehub-search-history-item" style="padding: 8px; cursor: pointer;" data-query="${query}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <g clip-path="url(#clip0_746_95421)">
              <path d="M8 16C12.4107 16 16 12.4107 16 8C16 3.58934 12.4107 0 8 0C3.5893 0 0 3.58934 0 8C0 12.4107 3.58934 16 8 16ZM8 1.06665C11.824 1.06665 14.9334 4.17597 14.9334 8C14.9334 11.824 11.824 14.9334 8 14.9334C4.17597 14.9334 1.06665 11.824 1.06665 8C1.06665 4.17597 4.17602 1.06665 8 1.06665Z" fill="#707070"/>
              <path d="M10.3335 10.5494C10.4321 10.6294 10.5494 10.6667 10.6668 10.6667C10.8241 10.6667 10.9788 10.5974 11.0828 10.4667C11.2668 10.2374 11.2294 9.90138 11.0001 9.71737L8.53345 7.74403V3.73337C8.53345 3.44003 8.29346 3.20004 8.00012 3.20004C7.70678 3.20004 7.4668 3.44003 7.4668 3.73337V8.00005C7.4668 8.16273 7.54148 8.31472 7.66679 8.41603L10.3335 10.5494Z" fill="#707070"/>
            </g>
            <defs>
              <clipPath id="clip0_746_95421">
                <rect width="16" height="16" fill="white"/>
              </clipPath>
            </defs>
          </svg> ${query}
          </div>`)
        .join('');
    }

    if (shouldShowSuggestions) {
      html += '<div style="padding: 8px; font-weight: 330; font-size: 14px; color: #8A8A8A;">Trending Search</div>';
      html += suggestions
        .map((suggestion) => `
          <div class="resourcehub-search-suggestion-item" style="padding: 8px; cursor: pointer;" data-raw-value="${suggestion.rawValue}">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0065 7.33324C12.0065 9.7264 10.0664 11.6665 7.67318 11.6665C5.27993 11.6665 3.33984 9.7264 3.33984 7.33324C3.33984 4.94007 5.27993 3 7.67318 3C10.0664 3 12.0065 4.94007 12.0065 7.33324ZM11.0743 11.4414C10.1512 12.2066 8.96589 12.6665 7.67318 12.6665C4.72766 12.6665 2.33984 10.2787 2.33984 7.33324C2.33984 4.38777 4.72766 2 7.67318 2C10.6187 2 13.0065 4.38777 13.0065 7.33324C13.0065 8.62593 12.5466 9.81119 11.7815 10.7343L14.0267 12.9796L14.3803 13.3331L13.6732 14.0402L13.3196 13.6867L11.0743 11.4414Z" fill="#707070"/>
          </svg> ${suggestion.highlightedValue}
          </div>`)
        .join('');
    }

    suggestionPopup.innerHTML = html;
    suggestionPopup.style.display = 'block';

    // Event bindings
    if (shouldShowSuggestions) {
      suggestions.forEach((suggestion, index) => {
        const item = suggestionPopup.querySelectorAll('.resourcehub-search-suggestion-item')[index];
        item.addEventListener('click', () => {
          const { rawValue } = suggestion;
          searchBox.value = rawValue;
          saveQueryToLocalHistory(rawValue);
          standaloneSearchBoxController.updateRedirectUrl(`/search-results?term=${rawValue}&contentType=${selectedContentType}${queryString}`);
          standaloneSearchBoxController.selectSuggestion(rawValue);
          suggestionPopup.style.display = 'none';
        });
      });
    }
    if (shouldShowHistory) {
      const historyItems = suggestionPopup.querySelectorAll('.resourcehub-search-history-item');
      historyItems.forEach((item) => {
        item.addEventListener('click', () => {
          const rawValue = item.getAttribute('data-query');
          searchBox.value = rawValue;
          saveQueryToLocalHistory(rawValue);
          standaloneSearchBoxController.updateRedirectUrl(`/search-results?term=${rawValue}&contentType=${selectedContentType}${queryString}`);
          standaloneSearchBoxController.submit();
          suggestionPopup.style.display = 'none';
        });
      });
    }
  } else {
    suggestionPopup.style.display = 'none';
  }
};
/**
 *
 * @param {Element} block
 */
function registerDropdown(dropdown) {
  if (!dropdown) return;
  const btn = dropdown.querySelector('.dropbtn');
  const content = dropdown.querySelector('.dropdown-content');
  if (!btn || !content) return;
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = content.style.display === 'block';
    document.querySelectorAll('.dropdown-content').forEach((c) => {
      c.style.display = 'none';
    });

    // Toggle current one
    content.style.display = isOpen ? 'none' : 'block';
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
  content.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => {
    content.style.display = 'none';
    btn.setAttribute('aria-expanded', 'false');
  });
}
export default async function decorate(block) {
  block.className = 'resourcehub-search-block';
  block.id = block.firstElementChild.textContent.trim().toLowerCase().replace(/\s+/g, '-');

  // Hide dropdown if URL contains ?type=
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');

  const resourceHubText = document.createElement('div');
  resourceHubText.className = 'resourcesearch-text ';
  resourceHubText.textContent = block.children[1].textContent;
  // resourceHubText.className = 'resourcehub-search-text';

  const searchContainer = document.createElement('div');
  searchContainer.className = 'resourcesearch-container ';
  // hide by default on mobile; will be toggled by the search button
  // searchContainer.classList.add('tw-hidden-mobile');
  const searchBox = document.createElement('input');
  searchBox.type = 'text';
  searchBox.placeholder = 'Search';
  searchBox.className = 'resourcehub-search-box';
  searchBox.id = 'resourcehub-search-box';
  searchBox.maxLength = 200;

  const tooltip = document.createElement('div');
  tooltip.id = 'char-limit-tooltip';
  tooltip.className = 'char-limit-tooltip';
  tooltip.textContent = 'Input exceeds the limit. Please search within 200 characters';
  tooltip.style.display = 'none';
  const suggestionPopupDiv = document.createElement('div');
  suggestionPopupDiv.id = 'resourcehub-search-suggestion';
  suggestionPopupDiv.style.display = 'none';

  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown';

  if (typeParam) {
    dropdown.style.display = 'none';
  }
  const dropbtn = document.createElement('button');
  dropbtn.className = 'dropbtn';
  const downArrow = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path d="M14.7344 5L8.73437 11L2.73438 5" stroke="#141414"/>
    </svg>`;
  dropbtn.innerHTML = `All ${downArrow}`;

  const dropdownContent = document.createElement('div');
  dropdownContent.className = 'dropdown-content';
  dropdownContent.style.display = 'none';

  const menuItems = {
    All: 'resourcehubAll',
    'Knowledge base articles': 'Knowledge base articles',
    'Self paced learning': 'Training',
    'Instructor led training': 'Training',
    'Technical notes': 'Technical notes',
    'Regulatory documents': 'Regulatory documents',
    'User guides': 'User guides',

  };
  let selectedContentType = 'resourcehubAll';
  if (typeParam) {
    selectedContentType = typeParam;
  }
  let selectedfacet = '';
  let queryString = '';
  
  if (typeParam === 'Self paced learning' || typeParam === 'Instructor led training') {
    selectedContentType = 'Training';
    queryString = `&facetId=trainingcoursetype&value=${typeParam}`;
  }

  /* searchBox.addEventListener('blur', () => {
    const suggestionPopup = document.getElementById('resourcehub-search-suggestion');
    setTimeout(() => {
      if (suggestionPopup) suggestionPopup.style.display = 'none';
    }, 150);
  }); */

  Object.keys(menuItems).forEach((key) => {
    const value = menuItems[key];
    const anchorElement = document.createElement('a');
    anchorElement.href = '#';
    anchorElement.textContent = key;
    anchorElement.addEventListener('click', (event) => {
      event.preventDefault();
      dropbtn.innerHTML = key + downArrow;
      dropdownContent.style.display = 'none';
      selectedContentType = value;
      selectedfacet = key;
      if (
        key === 'Self paced learning'
        || key === 'Instructor led training'
      ) {
        queryString = `&facetId=trainingcoursetype&value=${selectedfacet}`;
      } else {
        queryString = '';
      }
    });
    dropdownContent.appendChild(anchorElement);
  });

  dropdown.appendChild(dropbtn);
  dropdown.appendChild(dropdownContent);
  searchContainer.appendChild(searchBox);
  searchContainer.appendChild(tooltip);
  searchContainer.appendChild(dropdown);

  // Register dropdown behaviour (click to toggle, click outside to close)
  registerDropdown(dropdown);

  standaloneSearchBoxController.subscribe(() => {
    const suggestions = standaloneSearchBoxController.state.suggestions || [];
    if (suggestions.length > 0 && searchBox.value) {
      showSuggestions(selectedContentType, queryString, true);
    }
  });

  searchBox.addEventListener('focus', () => {
    standaloneSearchBoxController.showSuggestions();
  });
  searchBox.addEventListener('input', () => {
    standaloneSearchBoxController.showSuggestions();
  });

  const searchBtn = document.createElement('button');
  searchBtn.className = 'global-search-btn';
  searchBtn.setAttribute('aria-label', 'SearchIcon');
  const searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.5677 9.16655C15.5677 12.2961 13.0307 14.8331 9.90104 14.8331C6.77141 14.8331 4.23438 12.2961 4.23438 9.16655C4.23438 6.03702 6.77141 3.5 9.90104 3.5C13.0307 3.5 15.5677 6.03702 15.5677 9.16655ZM14.2483 14.2209C13.0811 15.2257 11.562 15.8331 9.90104 15.8331C6.21914 15.8331 3.23438 12.8484 3.23438 9.16655C3.23438 5.48471 6.21914 2.5 9.90104 2.5C13.5829 2.5 16.5677 5.48471 16.5677 9.16655C16.5677 10.8275 15.9603 12.3466 14.9554 13.5138L17.7546 16.3129L18.1081 16.6664L17.401 17.3735L17.0475 17.02L14.2483 14.2209Z" fill="white"/>
    </svg>`;
  searchBtn.innerHTML = searchIcon;
  searchContainer.appendChild(searchBtn);

  searchBtn.addEventListener('click', (event) => {
    if (searchBox.value.trim() !== '') {
      standaloneSearchBoxController.updateRedirectUrl(`/search-results?term=${searchBox.value}&contentType=${selectedContentType}${queryString}`);
      standaloneSearchBoxController.submit();
    } else {
      standaloneSearchBoxController.updateRedirectUrl(`/search-results?contentType=${selectedContentType}${queryString}`);

      standaloneSearchBoxController.submit();
    }
    event.stopPropagation();
  });

  document.addEventListener('click', (event) => {
    const suggestionPopup = document.getElementById('resourcehub-search-suggestion');

    if (!suggestionPopup || suggestionPopup.style.display !== 'block') return;

    if (!searchContainer.contains(event.target)) {
      suggestionPopup.style.display = 'none';
    }
  });

  dropbtn.addEventListener('click', () => {
    const suggestionPopup = document.getElementById('resourcehub-search-suggestion');
    if (suggestionPopup) {
      suggestionPopup.style.display = 'none';
    }
  });

  searchBox.addEventListener('input', (event) => {
    const query = event.target.value;
    if (query.length > 0) {
      standaloneSearchBoxController.updateText(query);
      standaloneSearchBoxController.showSuggestions();
    } else {
      standaloneSearchBoxController.updateText('');
      const suggestionPopup = document.getElementById('resourcehub-search-suggestion');
      if (suggestionPopup) suggestionPopup.style.display = 'none';
    }
  });

  searchBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.value.trim() !== '') {
      standaloneSearchBoxController.updateRedirectUrl(`/search-results?term=${event.target.value}&contentType=${selectedContentType}${queryString}`);
      standaloneSearchBoxController.submit();
    }
  });

  searchBox.addEventListener('input', () => {
    if (searchBox.value.length >= 200) {
      tooltip.style.display = 'block';
      searchContainer.classList.add('char-limit-reached');
    } else {
      tooltip.style.display = 'none';
      searchContainer.classList.remove('char-limit-reached');
    }
  });

  searchBox.addEventListener('blur', () => {
    tooltip.style.display = 'none';
  });
  // document.body.appendChild(suggestionPopupDiv);
  // block.appendChild(tooltip);
  block.textContent = '';
  block.appendChild(resourceHubText);
  block.appendChild(suggestionPopupDiv);
  block.appendChild(searchContainer);
}
