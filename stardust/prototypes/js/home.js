/* SCIEX home archetype — page widgets. Observed live (motion/home*.json):
   - "Why SCIEX portfolio" tabs: click swaps active classes; panel grid rows
     1fr/0fr (0.3s ease-in-out at <768, none at ≥768); mobile chevron rotate.
   - "SCIEX Stories" rail (Splide): controls exist only when the rail
     overflows (360: perPage 1, gap 12; ≥768 both slides fit → no controls);
     arrow click → list translateX(-index*pitch) with an inline
     "transform 600ms ease-in-out" transition; slide classes
     is-active/is-visible/is-prev/is-next; pagination is-active; prev/next
     disabled at the ends. Initial state is static (slide 1, t=0). */
(function () {
  'use strict';
  /* ---------- tabs ---------- */
  var tabBtns = document.querySelectorAll('[data-tab]');
  var grids = document.querySelectorAll('.tabs__panel-grid');
  function setTab(i) {
    tabBtns.forEach(function (b) {
      var on = b.getAttribute('data-tab') === String(i);
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (b.classList.contains('tabs__mob-btn')) b.classList.toggle('is-active', on); else b.parentNode.classList.toggle('is-active', on);
    });
    grids.forEach(function (g, k) { g.classList.toggle('is-active', k === i); if (k === i) g.removeAttribute('aria-hidden'); else g.setAttribute('aria-hidden', 'true'); });
  }
  tabBtns.forEach(function (b) { b.addEventListener('click', function () { setTab(Number(b.getAttribute('data-tab'))); }); });

  /* ---------- stories rail ---------- */
  var rail = document.getElementById('splide01');
  if (!rail) return;
  var list = document.getElementById('splide01-list');
  var ctl = rail.querySelector('[data-controls]');
  var slides = list.children;
  var index = 0;
  function gap() { return parseFloat(getComputedStyle(slides[0]).marginRight) || 0; }
  function pitch() { return slides[0].getBoundingClientRect().width + gap(); }
  function overflow() { return (pitch() * slides.length - gap()) > list.getBoundingClientRect().width + 1; }
  function paint(animate) {
    var over = overflow();
    rail.classList.toggle('is-overflow', over);
    if (!over) { ctl.innerHTML = ''; index = 0; list.style.transition = ''; list.style.transform = 'translateX(0px)'; setSlideClasses(); return; }
    if (!ctl.firstChild) {
      ctl.innerHTML = '<div class="stories__controls-inner" data-arrows><div class="stories__arrows">' +
        '<button class="stories__arrow stories__arrow--prev" type="button" aria-label="Previous slide" aria-controls="splide01-track"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 14.0037L4 8.00366L10 2.00366" stroke="currentColor"></path></svg></button>' +
        '<ul class="stories__pagination" role="tablist" aria-label="Select a slide to show">' +
        '<li role="presentation"><button class="t-base" type="button" role="tab" aria-controls="splide01-slide01" aria-label="Go to slide 1" tabindex="-1" aria-hidden="true">1&nbsp;/&nbsp;</button></li>' +
        '<li role="presentation"><button class="t-base" type="button" role="tab" aria-controls="splide01-slide02" aria-label="Go to slide 2" tabindex="-1" aria-hidden="true">2</button></li></ul>' +
        '<button class="stories__arrow stories__arrow--next" type="button" aria-label="Next slide" aria-controls="splide01-track"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2.00366L12 8.00366L6 14.0037" stroke="currentColor"></path></svg></button></div></div>';
      ctl.querySelector('.stories__arrow--prev').addEventListener('click', function () { go(index - 1); });
      ctl.querySelector('.stories__arrow--next').addEventListener('click', function () { go(index + 1); });
      ctl.querySelectorAll('.stories__pagination button').forEach(function (b, k) { b.addEventListener('click', function () { go(k); }); });
    }
    ctl.querySelector('.stories__arrow--prev').disabled = index <= 0;
    ctl.querySelector('.stories__arrow--next').disabled = index >= slides.length - 1;
    ctl.querySelectorAll('.stories__pagination button').forEach(function (b, k) { b.classList.toggle('is-active', k === index); b.setAttribute('aria-selected', k === index ? 'true' : 'false'); });
    list.style.transition = animate ? 'transform 600ms ease-in-out' : '';
    list.style.transform = 'translateX(' + (-index * pitch()) + 'px)';
    setSlideClasses();
  }
  function setSlideClasses() {
    Array.prototype.forEach.call(slides, function (s, k) {
      s.classList.toggle('is-active', k === index);
      s.classList.toggle('is-visible', k === index || !overflow());
      s.classList.toggle('is-prev', k === index - 1);
      s.classList.toggle('is-next', k === index + 1);
    });
  }
  function go(i) { index = Math.max(0, Math.min(slides.length - 1, i)); paint(true); }
  paint(false);
  window.addEventListener('resize', function () { paint(false); });
  window.addEventListener('load', function () { paint(false); });
})();
