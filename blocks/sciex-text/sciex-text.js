/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/blocks/sciex-text/sciex-text.js (2026-09-18); only import paths changed. See stardust/eds-port-log.md */
import { } from '../../scripts/aem.js';

export default function decorate(block) {
  const children = Array.from(block.children);
  if (children.length < 3) {
    return;
  }
  // Map fields directly based on model
  const idEl = children[0];
  const alignmentEl = children[1];
  const contentEl = children[2];

  // Extract values
  const blockId = idEl?.textContent?.trim() || 'sciex-text';
  const alignment = alignmentEl?.textContent?.trim() || 'text-left';

  // Set block properties
  block.id = `${blockId}-content`;
  block.classList.add('sciex-text');

  block.parentElement?.classList.add('tabs-container-wrapper');
  block.textContent = '';

  // Handle content
  if (contentEl) {
    contentEl.classList.add(alignment || 'text-left');
    block.append(contentEl);
  }
}
