/**
 * scripts/sx/scripts.js — helpers the ported sciex.com EDS blocks import from the source's
 * `scripts/scripts.js` (https://sciex.com/scripts/scripts.js, fetched 2026-09-18, sx-port).
 *
 * Only the exported helpers are ported; the source's page boot (loadPage, templates, WalkMe,
 * Qualtrics survey) stays on the source. Our own scripts/scripts.js is untouched — the ported
 * blocks import `../../scripts/sx/scripts.js` instead of `../../scripts/scripts.js`.
 */

export function getCookie(name) {
  let cookieVal = null;
  const cookieArr = document.cookie.split(';');
  cookieArr.forEach((elem) => {
    const cookie = elem.trim();
    if (cookie.startsWith(`${name}=`)) {
      cookieVal = decodeURIComponent(cookie.substring(name.length + 1));
    }
  });
  return cookieVal;
}

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

export const applyClasses = (element, classes) => element?.classList.add(...classes.split(' '));

/**
 * create an element.
 * @param {string} tagName the tag for the element
 * @param {string|Array<string>} classes classes to apply
 * @param {object} props properties to apply
 * @param {string|Element} html content to add
 * @returns the element
 */
export function createElement(tagName, classes, props, html) {
  const elem = document.createElement(tagName);
  if (classes) {
    const classesArr = (typeof classes === 'string') ? [classes] : classes;
    elem.classList.add(...classesArr);
  }
  if (props) {
    Object.keys(props).forEach((propName) => {
      elem.setAttribute(propName, props[propName]);
    });
  }

  if (html) {
    const appendEl = (el) => {
      if (el instanceof HTMLElement || el instanceof SVGElement) {
        elem.append(el);
      } else {
        elem.insertAdjacentHTML('beforeend', el);
      }
    };

    if (Array.isArray(html)) {
      html.forEach(appendEl);
    } else {
      appendEl(html);
    }
  }

  return elem;
}
