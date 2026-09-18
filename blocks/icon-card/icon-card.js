/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/icon-card/icon-card.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
import { span } from '../../scripts/sx/dom-builder.js';
import { decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/sx/scripts.js';

export default function decorate(block) {
  const iconCardContainer = document.createElement('div');
  iconCardContainer.className = 'icon-card-container-text';
  moveInstrumentation(block, iconCardContainer);

  const rows = [...block.children];
  let id = '';
  let heading = '';
  let description = '';
  let columns = 2;
  let typeOfCard = '';
  let fontType = 'icon-card-title';
  let headingType = '';

  rows.forEach((row, index) => {
    const text = row.textContent.trim();
    if (index === 0) id = text;
    else if (index === 1) heading = text;
    else if (index === 2) fontType = text;
    else if (index === 3) headingType = text;
    else if (index === 4) description = text;
    else if (index === 5) columns = parseInt(text, 10) || 2;
    else if (index === 6) typeOfCard = text;
  });

  if (id) iconCardContainer.id = `${id}-content`;

  if (heading) {
    const h2 = document.createElement('h2');
    h2.className = 'icon-card-heading';
    h2.textContent = heading;
    iconCardContainer.append(h2);
  }

  if (description) {
    const desc = document.createElement('p');
    desc.className = 'icon-card-description';
    desc.textContent = description;
    iconCardContainer.append(desc);
  }

  const gridContainer = document.createElement('div');
  gridContainer.className = `icon-card-grid columns-${columns}`;
  iconCardContainer.append(gridContainer);

  rows.slice(7).forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    // const iconHTML = cells[0]?.innerHTML?.trim() || '';
    const headingHTML = cells[1]?.innerHTML?.trim() || '';
    const descriptionHTML = cells[2]?.innerHTML?.trim() || '';
    const linkLabel = cells[3]?.textContent?.trim() || '';
    const linkHref = cells[4]?.textContent?.trim() || '';
    const linkTarget = cells[5]?.textContent?.trim() || '_self';
    const brand = cells[6]?.textContent?.trim() || '';

    const card = document.createElement('div');
    card.className = 'icon-card-sub-container';
    moveInstrumentation(row, card);

    if (typeOfCard) iconCardContainer.classList.add(typeOfCard);

    if (cells[0] && typeOfCard !== 'contact-type') {
      const iconWrap = document.createElement('div');
      iconWrap.className = 'icon-card-image';

      // Brand label above image
      if (brand) {
        const brandLabel = document.createElement('div');
        brandLabel.className = 'icon-card-brand';
        brandLabel.textContent = brand;
        iconWrap.append(brandLabel);
      }

      const picture = cells[0].querySelector('picture');
      const img = cells[0].querySelector('img');

      if (picture) {
        iconWrap.append(picture.cloneNode(true));
      } else if (img) {
        iconWrap.append(img.cloneNode(true));
      }

      card.append(iconWrap);
    }

    const contentWrap = document.createElement('div');
    contentWrap.className = 'icon-card-content';

    if (headingHTML) {
      const h3 = document.createElement('h3');
      h3.className = 'icon-card-title';
      h3.innerHTML = headingHTML;
      if (fontType) {
        h3.classList.add(fontType);
      }

      if (headingType) {
        h3.classList.add(headingType);
      }
      contentWrap.append(h3);
    }

    if (descriptionHTML) {
      const p = document.createElement('p');
      p.className = 'icon-card-text';
      p.innerHTML = descriptionHTML;
      contentWrap.append(p);
    }

    if (linkHref && linkLabel) {
      // CONTACT TYPE → Render Button
      if (typeOfCard === 'contact-type') {
        const button = document.createElement('button');
        button.className = 'icon-card-button';
        button.type = 'button';

        const textSpan = document.createElement('span');
        textSpan.className = 'button-text';
        textSpan.textContent = linkLabel;

        const iconSpan = span({ class: 'icon icon-arrow' });

        button.append(textSpan);
        button.append(iconSpan);

        button.addEventListener('click', () => {
          if (linkTarget === '_blank') {
            window.open(linkHref, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = linkHref;
          }
        });

        contentWrap.append(button);
      } else {
        // DEFAULT → Anchor Link
        const link = document.createElement('a');
        link.className = 'icon-card-link';
        link.href = linkHref;
        link.target = linkTarget;
        link.textContent = linkLabel;

        if (linkTarget === '_blank') {
          link.rel = 'noopener noreferrer';
        }

        const iconSpan = span({ class: 'icon icon-arrow-blue' });
        link.append(iconSpan);

        contentWrap.append(link);
      }
    }

    if (linkHref && !linkLabel) {
      card.classList.add('card-clickable');

      card.addEventListener('click', () => {
        if (linkTarget === '_blank') {
          window.open(linkHref, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = linkHref;
        }
      });

      // Accessibility improvement
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');

      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          card.click();
        }
      });
    }

    // Append content only if it has children (prevents empty wrapper)
    if (contentWrap.childElementCount) {
      card.append(contentWrap);
    }

    gridContainer.append(card);
  });

  decorateIcons(iconCardContainer, '/blocks/icon-card');

  // Replace block content
  block.innerHTML = '';
  block.append(iconCardContainer);

  block.id = `${id}-content`;
  block.parentElement?.classList.add('tabs-container-wrapper');
}
