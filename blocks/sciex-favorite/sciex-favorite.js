/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/sciex-favorite/sciex-favorite.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
/* eslint-disable */
import { decorateIcons } from '../../scripts/aem.js';

const CATEGORY_MAP = [
  {
    key: 'knowledge',
    title: 'Knowledge base articles',
    icon: 'knowledge',
    match: (p) => p.includes('/resource-hub/knowledge-base-articles/'),
  },
  {
    key: 'tech-notes',
    title: 'Technical notes',
    icon: 'tech-notes',
    match: (p) => p.includes('/tech-notes/'),
  },
  {
    key: 'regulatory',
    title: 'Regulatory documents',
    icon: 'regulatory',
    match: (p) => p.includes('/regulatory-docs/'),
  },
  {
    key: 'user-guides',
    title: 'User guides',
    icon: 'user-guides',
    match: (p) => p.includes('/customer-docs/'),
  },
];

/**
 * Main initialization function for the Favorites accordion component.
 */
export default async function decorate(block) {
  const id = block.children[0]?.textContent?.trim() || 'my-favorites';
  const title = block.children[1]?.textContent?.trim() || 'My favorite resources';

  const logoutText =
    block.children[2]?.textContent?.trim() ||
    'Save your go-to articles and access them anytime. Sign in to keep your favorites in one place.';

  const loginUrl = block.children[3]?.textContent?.trim() || '/login';
  const createAccountUrl =
    block.children[4]?.textContent?.trim() || '/create-account';

  const FAVORITES_API = '/bin/sciex/favorite-all-content';

  const viewAllUrlText = block.children[5]?.textContent?.trim() || "View all resources";

  const viewAllUrl = block.children[6]?.textContent?.trim() || '#';

  block.textContent = '';

  const section = document.createElement('section');
  section.id = id;
  section.className = 'favorites-accordion';

  const headerWrapper = document.createElement('div');
  headerWrapper.className = 'sciex-favorite-wrapper';

  const header = document.createElement('sciex-header');
  header.className = 'accordion-header';
  header.innerHTML = `
  <h2>${title}</h2>
  <button class="accordion-toggle" aria-expanded="false" aria-label="ExpandIcon">
    <span class="icon icon-resource-hub-down" aria-hidden="true"></span>
  </button>
`;
  decorateIcons(header, '/blocks/sciex-favorite');
  const content = document.createElement('div');
  content.className = 'accordion-content';

  headerWrapper.appendChild(header);
  section.append(headerWrapper, content);
  block.append(section);

  header.addEventListener('click', () => {
    const toggleBtn = header.querySelector('.accordion-toggle');
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';

    toggleBtn.setAttribute('aria-expanded', String(!expanded));
    header.classList.toggle('open', !expanded);
    content.classList.toggle('open', !expanded);
  });
  

  if (!FAVORITES_API) {
    console.error('Favorites block: Missing API endpoints');
    return;
  }

  try {
    let isLoggedIn = false;

    try {
      const user = JSON.parse(localStorage.getItem('userDetails'));
      isLoggedIn = user?.loggedIn === true;
    } catch (e) {
      console.warn('Favorites block: treating user as logged out', e);
      isLoggedIn = false;
    }

    if (!isLoggedIn) {
      renderLoggedOut(content, logoutText, loginUrl, createAccountUrl);
      return;
    }

    const favResp = await fetch(FAVORITES_API, { credentials: 'include' });
    const favorites = await favResp.json();
    if (!Array.isArray(favorites)) {
      console.error('Favorites block: Invalid favorites response', favorites);
      return;
    }

    renderFavorites(content, favorites, viewAllUrl, viewAllUrlText);
  } catch (e) {
    console.error('Favorites block error', e);
  }
}

/**
 * Renders the logged-out state UI.
 * Displays message, Login CTA, and Create Account CTA.
 * */
function renderLoggedOut(container, text, loginUrl, createUrl) {
  container.innerHTML = `
    <div class="favorites-logged-out">
      <p>${text}</p>
      <div class="cta-row">
        <a class="btn secondary" href="${loginUrl}">Login</a>
        <a class="btn primary" href="${createUrl}">Create an account</a>
      </div>
    </div>
  `;
}

/**
 * Renders logged-in user's favorite resources grouped by category.
 * - Buckets paths into CATEGORY_MAP categories.
 * - Supports URL filtering through ?type= query parameter.
 * - Creates category tiles with icons, titles, and up to 5 links per category.
 * - Shows an empty state for categories with no saved items.
 * - Appends a "View All Resources" button when configured.
 * - Runs decorateIcons() to load icon assets.
 **/
function renderFavorites(container, items, viewAllUrl, viewAllUrlText) {
  const allowedTypes = getAllowedTypesFromURL();
  const buckets = {};

 // Initialize known categories
  CATEGORY_MAP.forEach((c) => {
    buckets[c.key] = [];
  });

  // Initialize training categories explicitly
  buckets['self-paced'] = [];
  buckets['instructor'] = [];

  // Bucket items by trainingType (from response) or path-based category matching
  items.forEach(({ path, title, trainingType }) => {
    // Only use trainingType if the property exists and is a non-empty string
    if (trainingType && typeof trainingType === 'string' && trainingType.trim()) {
      const normalized = trainingType.trim().toLowerCase();

      if (normalized === 'self-paced-learning') {
        buckets['self-paced'].push({ path, title });
        return;
      }

      if (normalized === 'instructor-led-training') {
        buckets['instructor'].push({ path, title });
        return;
      }
    }

    // Fall back to path-based category matching for non-training items
    const category = CATEGORY_MAP.find((c) => c.match(path));
    if (category) {
      buckets[category.key].push({ path, title });
    }
  });

  const grid = document.createElement('div');
  grid.className = 'favorites-grid';

  if (allowedTypes) {
    grid.classList.add('single-column');
  }

  const allTypes = [
    ...CATEGORY_MAP.map((c) => c.key),
    'self-paced',
    'instructor',
  ];

  const typesToRender = allowedTypes || allTypes;

  typesToRender.forEach((typeKey) => {
    const categoryConfig = CATEGORY_MAP.find((c) => c.key === typeKey);

    let title;
    let icon;
    const paths = buckets[typeKey] || [];

    if (categoryConfig) {
      title = categoryConfig.title;
      icon = categoryConfig.icon;
    } else if (typeKey === 'self-paced') {
      title = 'Self-paced learning';
      icon = 'self-paced';
    } else if (typeKey === 'instructor') {
      title = 'Instructor led training';
      icon = 'instructor';
    } else {
      title = humanizeType(typeKey);
      icon = 'empty';
    }
    const section = document.createElement('section');
    section.className = 'favorites-category';

    const h3 = document.createElement('h3');
    h3.className = 'favorites-category-title';

    const iconSpan = document.createElement('span');
    iconSpan.className = `icon icon-${icon}`;
    iconSpan.setAttribute('aria-hidden', 'true');

    const textSpan = document.createElement('span');
    textSpan.textContent = title;

    h3.append(iconSpan, textSpan);
    section.appendChild(h3);

    if (paths.length) {
      const ul = document.createElement('ul');

      paths.slice(0, 3).forEach(({ path, title }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = path;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = (title && title.trim()) || decodeTitleFromPath(path);

        li.appendChild(a);
        ul.appendChild(li);
      });

      section.appendChild(ul);
    } else {
      const empty = document.createElement('div');
      empty.className = 'favorites-empty';

      const emptyIcon = document.createElement('span');
      emptyIcon.className = 'icon icon-empty';
      emptyIcon.setAttribute('aria-hidden', 'true');

      const emptyText = document.createElement('p');
      emptyText.textContent = `No ${title.toLowerCase()} saved`;

      empty.append(emptyIcon, emptyText);
      section.appendChild(empty);
    }

    grid.appendChild(section);
  });

  container.appendChild(grid);

  if (viewAllUrl) {
    const viewAllWrapper = document.createElement('div');
    viewAllWrapper.className = 'favorites-view-all';
    viewAllWrapper.innerHTML = `
      <a class="btn secondary" href="${viewAllUrl}">
        ${viewAllUrlText}
      </a>
    `;
    container.appendChild(viewAllWrapper);
  }

  decorateIcons(container, '/blocks/sciex-favorite');
}

/**
 * Converts a URL path into a readable title.
 * Example: "/support/abc-my-page.html" → "abc my page"
 **/
function decodeTitleFromPath(path) {
  const last = path.split('/').pop();
  return decodeURIComponent(
    last.replace(/[_-]/g, ' ').replace(/\.(html)?$/, '')
  );
}

/**
 * Reads the `type` query parameter from the URL to determine
 * which category keys should be displayed.
 **/
function getAllowedTypesFromURL() {
  const params = new URLSearchParams(window.location.search);
  const typeParam = params.get('type');

  if (!typeParam) return null;

  return typeParam
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Converts unknown category keys into readable labels.
 * Useful when API returns paths that don't match CATEGORY_MAP.
 **/
function humanizeType(type) {
  return type
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
  
