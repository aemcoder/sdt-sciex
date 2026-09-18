import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */

/**
 * Section styles authored with several values (`style: lead compact`) reach the
 * browser as ONE hyphen-joined class (`lead-compact`) on current pipelines, so no
 * `.section.lead.compact` rule can match. Split such classes back into the known
 * style tokens (read from styles.css `main .section.<token>` rules, with a static
 * fallback) BEFORE sections become visible. Tokens may themselves contain hyphens
 * (`flush-top`, `big-lede`), so the split is a tokenisation over hyphen parts.
 */
const SECTION_STYLE_FALLBACK = ['article-body', 'big-lede', 'bravo', 'center', 'compact', 'contact-bar',
  'dark', 'flush-bottom', 'flush-top', 'gap-top', 'grant-crumb', 'grant-form', 'grant-hero', 'grant-intro',
  'grant-research', 'grey', 'hero-side-image', 'hero-text', 'lead', 'legacy-band', 'legacy-cta', 'legacy-hero',
  'loose-bottom', 'loose-top', 'media-video', 'mid-bottom', 'mid-top', 'orange', 'page-image', 'quote-solo',
  'ruled', 'ruled-after', 'ruo-note', 'small', 'sn-benefits', 'spaced', 'ticks', 'tight-bottom', 'tight-top',
  'video-split'];

function knownSectionStyleTokens() {
  const tokens = new Set(SECTION_STYLE_FALLBACK);
  [...document.styleSheets].forEach((sheet) => {
    let rules;
    try { rules = sheet.cssRules; } catch { return; }
    if (!rules) return;
    [...rules].forEach((rule) => {
      const text = rule.selectorText || '';
      if (!text.includes('.section.')) return;
      text.split(',').forEach((sel) => {
        const m = sel.match(/\.section((?:\.[a-z0-9-]+)+)/);
        if (m) m[1].split('.').filter(Boolean).forEach((t) => tokens.add(t));
      });
    });
  });
  return tokens;
}

function tokeniseStyle(cls, tokens) {
  const parts = cls.split('-');
  const memo = new Map();
  const walk = (i) => {
    if (i === parts.length) return [];
    if (memo.has(i)) return memo.get(i);
    let best = null;
    for (let j = parts.length; j > i; j -= 1) {
      const cand = parts.slice(i, j).join('-');
      if (tokens.has(cand)) {
        const rest = walk(j);
        if (rest) { best = [cand, ...rest]; break; }
      }
    }
    memo.set(i, best);
    return best;
  };
  const out = walk(0);
  return out && out.length > 1 ? out : null;
}

function splitCompoundSectionStyles(main) {
  const tokens = knownSectionStyleTokens();
  main.querySelectorAll(':scope > div.section').forEach((section) => {
    [...section.classList].forEach((cls) => {
      if (cls === 'section' || cls.endsWith('-container') || tokens.has(cls)) return;
      const split = tokeniseStyle(cls, tokens);
      if (split) split.forEach((t) => section.classList.add(t));
    });
  });
}

// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  splitCompoundSectionStyles(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
