/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/featured-key-workflows/featured-key-workflows.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
import { moveInstrumentation } from '../../scripts/sx/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  const workflowContainer = document.createElement('div');
  workflowContainer.className = 'workflow-container-block';

  moveInstrumentation(block, workflowContainer);
  const headingRow = rows[0];
  const headingText = headingRow.querySelector('p')?.textContent;

  if (headingText) {
    const heading = document.createElement('h2');
    heading.className = 'featured-key-workflows-title';
    heading.textContent = headingText;
    workflowContainer.appendChild(heading);
  }

  const grid = document.createElement('div');
  grid.className = 'featured-key-workflows-grid';
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const columns = row.children;

    const card = document.createElement('div');
    card.className = 'workflow-card';

    // Icon
    const picture = columns[1].querySelector('picture');
    const icon = document.createElement('div');
    icon.className = 'workflow-card-icon';
    icon.appendChild(picture);
    card.appendChild(icon);

    // Title
    const title = columns[0].querySelector('p');
    const h3 = document.createElement('h3');
    h3.textContent = title.textContent;
    card.appendChild(h3);

     //check link to open link in New Tab
    const openInNewTab =columns[3]?.textContent?.trim().toLowerCase() === 'true';

    // Links
    const linksWrapper = document.createElement('div');
    linksWrapper.className = 'workflow-card-links';

    const links = columns[2].querySelectorAll('a');
    links.forEach((a) => {
      const link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent;
      link.className = 'workflow-card-link';

      // ✅ Apply target if enabled
      if (openInNewTab) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      linksWrapper.appendChild(link);
    });

    card.appendChild(linksWrapper);
    grid.appendChild(card);
    moveInstrumentation(row, card);
  }
  workflowContainer.appendChild(grid);
  block.innerHTML = '';
  block.append(workflowContainer);
}

