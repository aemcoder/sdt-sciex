/**
 * scripts/sx/coveo-headless-shim.js — snapshot-fed stand-in for `@coveo/headless` v3
 * (https://static.cloud.coveo.com/headless/v3/headless.esm.js), sx-port 2026-09-18.
 *
 * WHY. The four pages ported from the source's EDS code base drive their listings/search boxes
 * through Coveo Headless against org `danaherproductionrfl96bkr` with public tokens authored in
 * the page (events) or in `scripts/header-search/headerSearchEngine.js` (resource-hub search).
 * Reusing that org / those tokens from the new host is an OWNER DECISION (S-02/S-03/L-01 in
 * stardust/dynamic-features.md; `sxPort.coveo.enabled` in scripts/site-config.js). Until it is
 * taken, the ported code keeps its controller vocabulary and this module answers it from the
 * committed snapshots under /data (off-origin-data.md Tier 2/3): the events listing filters,
 * tabs, facets, search and "More events" all work client-side over the snapshot; query
 * suggestions are disabled (empty); search-box submits redirect exactly as before.
 *
 * SCOPE. Only the builders the ported code imports are implemented, with only the members it
 * uses: buildSearchEngine, buildSearchBox, buildStandaloneSearchBox, buildResultList,
 * buildPager, buildQuerySummary, buildContext, buildTab, buildFacet. Subscribe callbacks fire
 * after every state change like Headless (synchronously, after the change). Query matching is a
 * case-insensitive substring over title/excerpt/facet fields — an approximation of Coveo
 * relevancy, named as such. Snapshot order (Coveo relevancy at fetch time) is preserved.
 *
 * Re-enabling Coveo: flip `sxPort.coveo.enabled` and point the imports in scripts/sx back at
 * the Headless CDN URL (recorded in stardust/eds-port-log.md); nothing else in the ported code
 * changed.
 */
/* eslint-disable no-underscore-dangle -- engine._internal is the controller/engine seam */
import { sxPort } from '../site-config.js';

const codeBase = () => (window.hlx && window.hlx.codeBasePath) || '';

/* ------------------------------------------------------------------ helpers */

function fieldValues(result, field) {
  const raw = result && result.raw ? result.raw : {};
  const key = Object.keys(raw).find((k) => k.toLowerCase() === String(field).toLowerCase());
  if (!key) return [];
  const v = raw[key];
  if (Array.isArray(v)) return v.map(String);
  if (v === undefined || v === null) return [];
  return [String(v)];
}

/**
 * Evaluates the tiny subset of Coveo query syntax the ported code uses as tab expressions:
 *   `@field==Value`  ·  `NOT@field==Value`  ·  `NOT @field==Value`
 * Anything else evaluates to true (no filter) so an unknown expression never hides results.
 */
function matchesExpression(result, expression) {
  if (!expression) return true;
  const m = String(expression).trim().match(/^(NOT)?\s*@([\w-]+)\s*==\s*"?([^"]+?)"?\s*$/i);
  if (!m) return true;
  const [, not, field, value] = m;
  const has = fieldValues(result, field).some((v) => v.toLowerCase() === value.toLowerCase());
  return not ? !has : has;
}

function matchesQuery(result, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  const hay = [
    result.title, result.Title, result.excerpt, result.Excerpt,
    ...fieldValues(result, 'eventtype'), ...fieldValues(result, 'region'),
    ...fieldValues(result, 'applications'), ...fieldValues(result, 'eventmonth'),
    ...fieldValues(result, 'eventyear'),
  ].filter(Boolean).join(' ').toLowerCase();
  return hay.includes(needle);
}

function uniqueKey(result) {
  return result.uniqueId || result.UniqueId || result.uri || result.clickUri || result.title;
}

/* ------------------------------------------------------------------- engine */

export function buildSearchEngine({ configuration = {} } = {}) {
  const hub = (configuration.search && configuration.search.searchHub) || '';
  const hubConfig = (sxPort.coveo.hubs && sxPort.coveo.hubs[hub]) || {};
  const pageSize = hubConfig.pageSize || 10;
  const listeners = new Set();
  const facetControllers = new Map(); // facetId -> controller state holder

  const state = {
    hub,
    loaded: false,
    all: [], // every snapshot result, snapshot order, de-duplicated
    q: '',
    tab: null, // { id, expression }
    selections: {}, // facetId -> Set of selected values
    shown: pageSize,
    filtered: [],
    snapshot: null, // provenance (fetchedAt, url) once known
  };

  let loadPromise = null;

  function notify() {
    listeners.forEach((fn) => {
      try { fn(); } catch (e) { console.error('[sx coveo shim] subscriber failed', e); } // eslint-disable-line no-console
    });
  }

  function baseFiltered(excludeFacetId) {
    return state.all.filter((r) => matchesExpression(r, state.tab && state.tab.expression))
      .filter((r) => matchesQuery(r, state.q))
      .filter((r) => Object.entries(state.selections).every(([facetId, set]) => {
        if (facetId === excludeFacetId || !set || set.size === 0) return true;
        const field = facetControllers.get(facetId)?.field || facetId;
        const values = fieldValues(r, field).map((v) => v.toLowerCase());
        return [...set].some((sel) => values.includes(sel.toLowerCase()));
      }));
  }

  function recompute() {
    state.filtered = baseFiltered();
    facetControllers.forEach((fc, facetId) => {
      const pool = baseFiltered(facetId);
      const counts = new Map();
      pool.forEach((r) => fieldValues(r, fc.field)
        .forEach((v) => counts.set(v, (counts.get(v) || 0) + 1)));
      const selected = state.selections[facetId] || new Set();
      selected.forEach((v) => { if (!counts.has(v)) counts.set(v, 0); });
      const values = [...counts.entries()]
        .map(([value, numberOfResults]) => ({
          value,
          numberOfResults,
          state: selected.has(value) ? 'selected' : 'idle',
        }))
        .sort((a, b) => {
          if (a.state !== b.state) return a.state === 'selected' ? -1 : 1;
          return a.value.localeCompare(b.value, undefined, { numeric: true });
        })
        // live shows every value Coveo returned (8 regions, 12 months), not the 5 requested
        .slice(0, Math.max(fc.numberOfValues, 20));
      fc.state.values = values;
      fc.state.hasActiveValues = selected.size > 0;
    });
  }

  function resetPage() { state.shown = pageSize; }

  async function load() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      const urls = hubConfig.snapshots || [];
      const seen = new Set();
      const all = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const url of urls) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const resp = await fetch(`${codeBase()}${url}`);
          // eslint-disable-next-line no-await-in-loop
          const json = resp.ok ? await resp.json() : { results: [] };
          (json.results || []).forEach((r) => {
            const k = uniqueKey(r);
            if (seen.has(k)) return;
            seen.add(k);
            all.push(r);
          });
        } catch (e) {
          console.error('[sx coveo shim] snapshot load failed', url, e); // eslint-disable-line no-console
        }
      }
      state.all = all;
      state.loaded = true;
      if (hubConfig.provenance) {
        try {
          const resp = await fetch(`${codeBase()}${hubConfig.provenance}`);
          if (resp.ok) state.snapshot = await resp.json();
        } catch (e) { /* informational only */ }
      }
      // expose the snapshot date in the DOM (off-origin-data.md: snapshots age; show it)
      document.querySelectorAll(hubConfig.blockSelector || '.events.block').forEach((el) => {
        el.dataset.snapshot = (state.snapshot && state.snapshot.fetchedAt) || 'local-snapshot';
        el.dataset.snapshotRows = String(all.length);
      });
    })();
    return loadPromise;
  }

  const engine = {
    configuration,
    get state() { return state; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    async executeFirstSearch() {
      await load();
      recompute();
      notify();
    },
    // internal API for the controllers below
    _internal: {
      state, pageSize, facetControllers, notify, recompute, resetPage, load,
    },
  };
  return engine;
}

/* -------------------------------------------------------------- controllers */

export function buildTab(engine, { options }) {
  const {
    state, recompute, resetPage, notify,
  } = engine._internal;
  return {
    get state() { return { isActive: state.tab && state.tab.id === options.id }; },
    select() {
      state.tab = { id: options.id, expression: options.expression };
      resetPage();
      recompute();
      notify();
    },
    subscribe: engine.subscribe,
  };
}

export function buildFacet(engine, { options }) {
  const {
    state, facetControllers, recompute, resetPage, notify,
  } = engine._internal;
  const facetId = options.facetId || options.field;
  const fc = {
    field: options.field,
    numberOfValues: options.numberOfValues || 8,
    state: { facetId, values: [], hasActiveValues: false },
  };
  facetControllers.set(facetId, fc);
  state.selections[facetId] = state.selections[facetId] || new Set();
  if (state.loaded) recompute();

  const controller = {
    get state() { return fc.state; },
    toggleSelect(value) {
      const set = state.selections[facetId];
      if (set.has(value.value)) set.delete(value.value); else set.add(value.value);
      resetPage();
      recompute();
      notify();
    },
    toggleSingleSelect(value) {
      const set = state.selections[facetId];
      const was = set.has(value.value);
      set.clear();
      if (!was) set.add(value.value);
      resetPage();
      recompute();
      notify();
    },
    deselectAll() {
      const set = state.selections[facetId];
      if (set.size === 0) return;
      set.clear();
      resetPage();
      recompute();
      notify();
    },
    isValueSelected(value) { return state.selections[facetId].has(value.value); },
    subscribe: engine.subscribe,
  };
  return controller;
}

export function buildResultList(engine) {
  const { state, pageSize } = engine._internal;
  return {
    get state() {
      return {
        results: state.filtered.slice(0, state.shown),
        moreResultsAvailable: state.filtered.length > state.shown,
        isLoading: !state.loaded,
        hasResults: state.filtered.length > 0,
      };
    },
    fetchMoreResults() {
      state.shown += pageSize;
      engine._internal.recompute();
      engine._internal.notify();
    },
    subscribe: engine.subscribe,
  };
}

export function buildPager(engine) {
  const { state, pageSize } = engine._internal;
  return {
    get state() {
      const maxPage = Math.max(1, Math.ceil(state.filtered.length / pageSize));
      return {
        currentPage: 1,
        maxPage,
        hasNextPage: maxPage > 1,
        hasPreviousPage: false,
        currentPages: [1],
      };
    },
    nextPage() {
      state.shown += pageSize;
      engine._internal.recompute();
      engine._internal.notify();
    },
    previousPage() {},
    selectPage() {},
    subscribe: engine.subscribe,
  };
}

export function buildQuerySummary(engine) {
  const { state } = engine._internal;
  return {
    get state() {
      const total = state.filtered.length;
      return {
        firstResult: total ? 1 : 0,
        lastResult: Math.min(state.shown, total),
        total,
        query: state.q,
        hasQuery: Boolean(state.q),
        hasResults: total > 0,
        hasError: false,
        isLoading: !state.loaded,
        firstSearchExecuted: state.loaded,
      };
    },
    subscribe: engine.subscribe,
  };
}

export function buildContext() {
  const values = {};
  return {
    get state() { return { values }; },
    add(key, value) { values[key] = value; },
    remove(key) { delete values[key]; },
    set(v) { Object.assign(values, v); },
  };
}

export function buildSearchBox(engine) {
  const {
    state, recompute, resetPage, notify,
  } = engine._internal;
  const box = {
    value: '', suggestions: [], isLoading: false, isLoadingSuggestions: false,
  };
  return {
    get state() { return box; },
    updateText(text) { box.value = text || ''; },
    // query suggestions were a Coveo POST (querySuggest); disabled in the snapshot tier
    showSuggestions() { box.suggestions = []; },
    selectSuggestion() {},
    clear() { box.value = ''; box.suggestions = []; },
    submit() {
      state.q = box.value.trim();
      resetPage();
      recompute();
      notify();
    },
    subscribe: engine.subscribe,
  };
}

export function buildStandaloneSearchBox(engine, { options = {} } = {}) {
  const listeners = new Set();
  const box = {
    value: '', suggestions: [], redirectTo: '', isLoading: false, isLoadingSuggestions: false, analytics: {},
  };
  let redirectionUrl = options.redirectionUrl || '/search-results';
  const notify = () => listeners.forEach((fn) => { try { fn(); } catch (e) { /* noop */ } });
  const absolutize = (url) => {
    if (/^https?:\/\//i.test(url)) return url;
    const origin = sxPort.searchResultsOrigin || '';
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  return {
    get state() { return box; },
    updateText(text) { box.value = text || ''; notify(); },
    showSuggestions() { box.suggestions = []; },
    selectSuggestion() {},
    clear() { box.value = ''; box.suggestions = []; notify(); },
    updateRedirectUrl(url) { redirectionUrl = url; },
    afterRedirection() { box.redirectTo = ''; },
    submit() {
      box.redirectTo = absolutize(redirectionUrl);
      notify();
      window.location.assign(box.redirectTo);
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

export default {
  buildSearchEngine,
  buildTab,
  buildFacet,
  buildResultList,
  buildPager,
  buildQuerySummary,
  buildContext,
  buildSearchBox,
  buildStandaloneSearchBox,
};
