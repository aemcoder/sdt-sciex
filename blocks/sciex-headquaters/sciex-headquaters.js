/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/sciex-headquaters/sciex-headquaters.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
import { div } from '../../scripts/sx/dom-builder.js';
import { moveInstrumentation } from '../../scripts/sx/scripts.js';

export default async function decorate(block) {
  const rows = [...block.children];

  const blockId = rows[0]?.querySelector('p')?.textContent?.trim();
  const headingText = rows[1]?.querySelector('p')?.textContent?.trim();
  const columnCount = parseInt(rows[2]?.querySelector('p')?.textContent?.trim(), 10) || 4;

  if (blockId) block.id = blockId;

  block.classList.add('sciex-hq');

  const wrapper = div({ class: 'sciex-hq__wrapper' });

  /* ---------------------------
     HEADING (Row 1)
  ---------------------------- */
  const headingWrapper = div({ class: 'sciex-hq__heading-wrapper' });
  headingWrapper.innerHTML = `<h2 class="sciex-hq__heading">${headingText}</h2>`;

  // Move instrumentation from heading authored row → heading wrapper
  moveInstrumentation(rows[1], headingWrapper);

  wrapper.append(headingWrapper);

  /* ---------------------------
     GRID
  ---------------------------- */
  const grid = div({ class: 'sciex-hq__grid' });
  grid.style.setProperty('--columns', columnCount);

  rows.slice(3).forEach((row) => {
    const label = row.children[0]?.querySelector('p')?.textContent?.trim() || '';
    const rawValue = row.children[1]?.querySelector('p')?.innerHTML || '';

    const item = div({ class: 'sciex-hq__item' });

    const labelEl = div({ class: 'sciex-hq__label' });
    labelEl.textContent = label;

    const valueEl = div({ class: 'sciex-hq__value' });
    valueEl.innerHTML = rawValue;

    item.append(labelEl, valueEl);

    // Move instrumentation from authored row → item
    moveInstrumentation(row, item);

    grid.append(item);
  });

  wrapper.append(grid);
  block.innerHTML = '';
  block.append(wrapper);
}