/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/scripts/events-page/components/renderEventFacets.js (2026-09-18); Coveo Headless CDN import rewritten to ../coveo-headless-shim.js where present. See stardust/eds-port-log.md */
import {
  eventregionController,
  eventapplicationsController,
  eventeventyearController,
  eventeventmonthController,
} from '../controller/event-page-controllers.js';

// Global list to track all dropdown menus
const allDropdownMenus = [];

const CONTROLLERS = {
  Region: eventregionController,
  Application: eventapplicationsController,
  Year: eventeventyearController,
  Month: eventeventmonthController,
};

function createSvgFromPath(paths, options = {}) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  Object.entries(options).forEach(([key, value]) => svg.setAttribute(key, value));

  paths.forEach((pathAttrs) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    Object.entries(pathAttrs).forEach(([key, val]) => path.setAttribute(key, val));
    svg.appendChild(path);
  });

  return svg;
}

function createMobileFilterButton(onClick) {
  const button = document.createElement('div');
  button.id = 'event-mobile-filters';

  const textSpan = document.createElement('span');
  textSpan.textContent = 'Filter';

  const iconSpan = document.createElement('span');
  iconSpan.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M5 2L0 2" stroke="#0068FA"/>
      <path d="M11 10L16 10" stroke="#0068FA"/>
      <path d="M16 2L10 2" stroke="#0068FA"/>
      <path d="M0 10H6" stroke="#0068FA"/>
      <circle cx="6" cy="2" r="1.5" stroke="#0068FA"/>
      <circle cx="2" cy="2" r="1.5" transform="matrix(-1 0 0 1 12 8)" stroke="#0068FA"/>
    </svg>`;

  button.append(textSpan, iconSpan);
  button.addEventListener('click', onClick);
  return button;
}

function createDropdown(label, items, onSelect) {
  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown';

  const dropdownToggle = document.createElement('div');
  dropdownToggle.className = 'dropdown-toggle';
  dropdownToggle.id = `${label.toLowerCase()}DropdownToggle`;

  const toggleText = document.createElement('span');
  toggleText.textContent = label;

  const arrowSvg = createSvgFromPath(
    [{ d: 'M14 5L8 11L2 5', stroke: '#141414' }],
    {
      width: '16', height: '16', viewBox: '0 0 16 16', fill: 'none', class: 'dropdown-arrow',
    },
  );

  dropdownToggle.append(toggleText, arrowSvg);

  const dropdownMenu = document.createElement('div');
  dropdownMenu.className = 'dropdown-menu';
  dropdownMenu.id = `${label.toLowerCase()}DropdownMenu`;

  allDropdownMenus.push(dropdownMenu);

  items.forEach((item) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'dropdown-item';
    itemDiv.textContent = item.value;

    if (item.state === 'selected') toggleText.textContent = item.value;

    itemDiv.addEventListener('click', () => {
      toggleText.textContent = item.value;
      dropdownMenu.classList.remove('active');
      onSelect?.(item);
    });

    dropdownMenu.appendChild(itemDiv);
  });

  dropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    allDropdownMenus.forEach((menu) => {
      if (menu !== dropdownMenu) menu.classList.remove('active');
    });
    dropdownMenu.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) dropdownMenu.classList.remove('active');
  });

  dropdown.append(dropdownToggle, dropdownMenu);
  return dropdown;
}

function createClearAllButton(updateVisibilityCallback) {
  const button = document.createElement('button');
  button.className = 'clear-all-button';
  button.innerHTML = `Clear All <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
    <path d="M13 13.5L3.0001 3.5001" stroke="#3C8DFF"/>
    <path d="M13 3.5L3.0001 13.4999" stroke="#3C8DFF"/>
  </svg>`;
  button.style.display = 'none';

  button.addEventListener('click', () => {
    Object.values(CONTROLLERS).forEach((ctrl) => ctrl.deselectAll());

    document.querySelectorAll('.dropdown-toggle span').forEach((span) => {
      const { id } = span.parentElement;

      if (id.includes('region')) {
        span.textContent = 'Region';
      } else if (id.includes('application')) {
        span.textContent = 'Application';
      } else if (id.includes('year')) {
        span.textContent = 'Year';
      } else if (id.includes('month')) {
        span.textContent = 'Month';
      } else {
        span.textContent = '';
      }
    });

    updateVisibilityCallback();
  });

  return button;
}

function isAnyFilterSelected() {
  return Object.values(CONTROLLERS).some((ctrl) => ctrl.state.values.some((v) => v.state === 'selected'));
}

function createFilterSection(dropdownsConfig) {
  const filters = document.createElement('div');
  filters.className = 'filters';

  const updateVisibility = () => {
    // eslint-disable-next-line no-use-before-define
    clearAllBtn.style.display = isAnyFilterSelected()
      ? 'flex' : 'none';
  };

  const clearAllBtn = createClearAllButton(updateVisibility);
  filters.append(...dropdownsConfig.map(
    ({ label, items, onSelect }) => createDropdown(label, items, onSelect),
  ));

  filters.appendChild(clearAllBtn);
  updateVisibility();
  return filters;
}

function createEventModal() {
  const modal = document.getElementById('event-filter-modal');

  const content = document.createElement('div');
  content.className = 'event-modal-content';

  const header = document.createElement('div');
  header.className = 'event-modal-header';

  const title = document.createElement('h3');
  title.textContent = 'Filter';

  const closeBtn = document.createElement('span');
  closeBtn.id = 'close-filter';
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
      <path d="M13 13.5L3.0001 3.5001" stroke="#141414"/>
      <path d="M13 3.5L3.0001 13.4999" stroke="#141414"/>
    </svg>`;

  closeBtn.addEventListener('click', () => {
    document.body.classList.remove('event-modal-open');
    document.body.style.top = '';
    window.scrollTo(0, 0);
    modal.classList.add('hidden');
  });

  header.append(title, closeBtn);

  const body = document.createElement('div');
  body.className = 'event-modal-body';

  Object.entries(CONTROLLERS).forEach(([label, controller]) => {
    body.appendChild(createDropdown(
      label,
      controller.state.values,
      (val) => controller.toggleSelect(val),
    ));
  });

  const footer = document.createElement('div');
  footer.className = 'event-modal-footer';

  const clearBtn = document.createElement('button');
  clearBtn.id = 'clear-event-filters';
  clearBtn.textContent = 'Clear All';
  clearBtn.addEventListener('click', () => Object.values(CONTROLLERS).forEach((ctrl) => ctrl.deselectAll()));

  const resultsBtn = document.createElement('button');
  resultsBtn.id = 'show-event-results';
  resultsBtn.textContent = 'Results';
  resultsBtn.addEventListener('click', () => {
    document.body.classList.remove('event-modal-open');
    document.body.style.top = '';
    window.scrollTo(0, 0);
    modal.classList.add('hidden');
  });

  footer.append(clearBtn, resultsBtn);
  content.append(header, body, footer);
  modal.appendChild(content);
}

export default function renderEventFacets() {
  const scrollTopRef = { value: 0 };

  const mobileButton = createMobileFilterButton(() => {
    scrollTopRef.value = window.scrollY;
    document.body.style.top = `-${scrollTopRef.value}px`;
    document.body.classList.add('event-modal-open');
    document.getElementById('event-filter-modal')?.classList.remove('hidden');
  });

  createEventModal();

  const dropdownsConfig = Object.entries(CONTROLLERS).map(([label, controller]) => ({
    label,
    items: controller.state.values,
    onSelect: (val) => {
      const latest = controller.state.values.find(
        (v) => v.value === val.value,
      );
      if (!latest) return;

      // If the clicked item is already selected, toggle it back to idle
      if (latest.state === 'selected') {
        controller.toggleSelect(latest);
        return;
      }

      // Make the previous selected item idle
      controller.state.values.forEach((v) => {
        if (v.state === 'selected') {
          controller.toggleSelect(v);
        }
      });

      // make the newly clicked item to selected
      controller.toggleSelect(latest);
    },
  }));

  const filterSection = createFilterSection(dropdownsConfig);

  return { filterSection, mobileButton };
}
