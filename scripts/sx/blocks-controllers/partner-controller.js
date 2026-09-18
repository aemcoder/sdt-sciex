/**
 * scripts/sx/blocks-controllers/partner-controller.js — ported from
 * https://sciex.com/scripts/blocks-controllers/partner-controller.js (sx-port, 2026-09-18).
 *
 * Source behaviour: `fetch('/bin/sciex/partners')` (public AEM servlet, A-03 in
 * stardust/dynamic-features.md). That endpoint exists only on the source host, so here the
 * block is fed from the committed snapshot `data/partners/partners.json` (off-origin-data.md
 * Tier 2); the source URL and fetch date live in `data/partners/_provenance.json`, and the
 * fetch date is exposed on the block as `data-snapshot`. Refresh cadence is an owner decision
 * (named in stardust/eds-port-log.md).
 */
import { sxPort } from '../../site-config.js';

const codeBase = () => (window.hlx && window.hlx.codeBasePath) || '';

async function exposeSnapshotDate() {
  try {
    const resp = await fetch(`${codeBase()}${sxPort.partners.provenance}`);
    if (!resp.ok) return;
    const prov = await resp.json();
    document.querySelectorAll('.contact-information.block').forEach((el) => {
      el.dataset.snapshot = prov.fetchedAt || '';
      el.dataset.snapshotSource = prov.url || '';
    });
  } catch (e) {
    // provenance is informational only
  }
}

export default async function getPartnersData() {
  try {
    const endpoint = `${codeBase()}${sxPort.partners.url}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    exposeSnapshotDate();
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Fetch error:', error);
    return null;
  }
}
