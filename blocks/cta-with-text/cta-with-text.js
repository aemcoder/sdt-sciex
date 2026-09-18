/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/cta-with-text/cta-with-text.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
import { } from '../../scripts/aem.js';

export default function decorate(block) {
  const child = block.children;

  // --- Map fields from model order ---
  const heading = child[0]?.textContent.trim();
  const description = child[1]?.textContent.trim();
  const variation = child[2]?.textContent.trim(); // card | banner
  const alignment = child[3]?.textContent.trim(); // left | right | center (buttons only)

  const contactConfig = child[4]?.textContent.trim(); // dark,contact-middle
  
  const primaryText = child[5]?.textContent.trim();
  const primaryLink = child[7]?.textContent.trim();
  const primaryTarget = child[8]?.textContent.trim();
  
  const secondaryText = child[9]?.textContent.trim();
  const secondaryLink = child[11]?.textContent.trim();
  const secondaryTarget = child[12]?.textContent.trim();
  
  const linkText = child[13]?.textContent.trim();
  const linkUrl = child[15]?.textContent.trim();
  const linkTarget = child[16]?.textContent.trim();

  // Clear original author markup
  block.innerHTML = '';

  // Root
  const section = document.createElement('div');
  section.classList.add('support-cta-block');

  // Variation
  if (variation === 'card') {
    section.classList.add('support-cta--card');
  } else {
    section.classList.add('support-cta--banner');
  }

  // Alignment
  if (alignment) {
    section.classList.add(`support-cta--align-${alignment}`);
  } else {
    section.classList.add('support-cta--align-right');
  }

  // Inner wrapper
  const inner = document.createElement('div');
  inner.className = 'support-cta-inner';

  /* ======================================================
     CONTACT CONFIG (Theme + Whole Content Alignment)
     Default contact alignment = right
  ====================================================== */

  let themeValue = null;
  let contactAlignment = 'contact-right'; // default

  if (contactConfig) {
    const values = contactConfig.split(',').map(val => val.trim());

    // Extract theme
    themeValue = values.find(val => val === 'dark' || val === 'light');

    // Extract contact alignment
    const alignmentValue = values.find(val =>
      val === 'contact-left' ||
      val === 'contact-middle' ||
      val === 'contact-right'
    );

    if (alignmentValue) {
      contactAlignment = alignmentValue;
    }
  }

  // Apply theme to section
  if (themeValue) {
    section.classList.add(`support-cta--${themeValue}`);
  }

  // Apply contact alignment to INNER only
  inner.classList.add(`support-cta--${contactAlignment}`);

  /* ======================================================
     TEXT WRAPPER
  ====================================================== */

  const textWrap = document.createElement('div');
  textWrap.className = 'support-cta-text';

  if (heading) {
    const titleEl = document.createElement('h3');
    titleEl.className = 'support-cta-title';
    titleEl.textContent = heading;
    textWrap.appendChild(titleEl);
  }

  if (description) {
    const descEl = document.createElement('p');
    descEl.className = 'support-cta-desc';
    descEl.textContent = description;
    textWrap.appendChild(descEl);
  }

  /* ======================================================
     ACTION WRAPPER (Buttons Only Alignment)
     Default = right
  ====================================================== */

  const actionWrap = document.createElement('div');
  actionWrap.className = 'support-cta-action';

  // --- Primary Button ---
  if (primaryText && primaryLink) {
    const primaryBtn = document.createElement('a');
    primaryBtn.className = 'support-cta-button support-cta-button--primary';
    primaryBtn.textContent = primaryText;
    primaryBtn.href = primaryLink;

    if (primaryTarget) {
      primaryBtn.target = primaryTarget;
      if (primaryTarget === '_blank') {
        primaryBtn.rel = 'noopener noreferrer';
      }
    }

    actionWrap.appendChild(primaryBtn);
  }

  // --- Secondary Button ---
  if (secondaryText && secondaryLink) {
    const secondaryBtn = document.createElement('a');
    secondaryBtn.className = 'support-cta-button support-cta-button--secondary';
    secondaryBtn.textContent = secondaryText;
    secondaryBtn.href = secondaryLink;

    if (secondaryTarget) {
      secondaryBtn.target = secondaryTarget;
      if (secondaryTarget === '_blank') {
        secondaryBtn.rel = 'noopener noreferrer';
      }
    }

    actionWrap.appendChild(secondaryBtn);
  }

  // --- Text Link CTA ---
  if (linkText && linkUrl) {
    const linkEl = document.createElement('a');
    linkEl.className = 'support-cta-link';
    linkEl.textContent = linkText;
    linkEl.href = linkUrl;

    if (linkTarget) {
      linkEl.target = linkTarget;
      if (linkTarget === '_blank') {
        linkEl.rel = 'noopener noreferrer';
      }
    }

    actionWrap.appendChild(linkEl);
  }

  // Assemble based on alignment
  if (alignment === 'left') {
    inner.appendChild(actionWrap);
    inner.appendChild(textWrap);
  } else {
    // right & bottom default order
  inner.appendChild(textWrap);
  inner.appendChild(actionWrap);
  }

  section.appendChild(inner);
  block.appendChild(section);
}
