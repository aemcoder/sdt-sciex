/* SCIEX canon motion layer — shared by every archetype prototype.
   Every behaviour here was OBSERVED firing on the live home
   (stardust/replica/motion/home.json, home-360.json, home-interact-*.json);
   nothing is inferred from static classes. Same state machine as live
   (Alpine click state → class / inline-style toggles), same durations.
   Inert at t=0: nothing runs without a click, so the static gate is
   unaffected. No hover rules: every live hover probe returned no change. */
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  if (!header) return;

  /* ---------- desktop mega menu (click on a primary nav item) ---------- */
  var navItems = Array.prototype.slice.call(header.querySelectorAll('.hdr-nav__row > ul > li'));
  var mega = header.querySelector('.hdr-mega');
  var menus = mega ? Array.prototype.slice.call(mega.querySelectorAll('.hdr-mega__menu')) : [];
  var closeBtn = header.querySelector('.hdr-mega__close');
  var overlay = header.querySelector('.hdr-overlay');
  var openIndex = -1;

  function closeMega() {
    navItems.forEach(function (li) { li.classList.remove('menu-active'); });
    menus.forEach(function (m) { m.classList.remove('is-open'); });
    if (mega) mega.classList.remove('is-open');
    if (closeBtn) closeBtn.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    openIndex = -1;
  }
  function openMega(i) {
    closeMega();
    var li = navItems[i], menu = menus[i];
    if (!li || !menu) return;
    li.classList.add('menu-active');
    mega.classList.add('is-open');
    menu.classList.add('is-open');
    // first submenu panel active on open (live: submenu-active on the first item)
    var panels = menu.querySelectorAll('.hdr-mega__panel');
    var subs = menu.querySelectorAll('.hdr-mega__sub');
    if (panels.length && !menu.querySelector('.hdr-mega__panel.is-open')) panels[0].classList.add('is-open');
    if (subs.length && !menu.querySelector('.hdr-mega__sub.submenu-active')) subs[0].classList.add('submenu-active');
    if (closeBtn) closeBtn.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    openIndex = i;
  }
  navItems.forEach(function (li, i) {
    var a = li.querySelector('a');
    if (!a || !menus[i]) return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (openIndex === i) closeMega(); else openMega(i);
    });
  });
  menus.forEach(function (menu) {
    var subs = Array.prototype.slice.call(menu.querySelectorAll('.hdr-mega__sub'));
    var panels = Array.prototype.slice.call(menu.querySelectorAll('.hdr-mega__panel'));
    subs.forEach(function (sub, k) {
      sub.addEventListener('click', function (e) {
        if (!panels[k]) return;
        e.preventDefault();
        subs.forEach(function (s) { s.classList.remove('submenu-active'); });
        panels.forEach(function (p) { p.classList.remove('is-open'); });
        // the same submenu list is rendered in every panel of a menu — sync the active item everywhere
        menu.querySelectorAll('.hdr-mega__sub[data-sub="' + k + '"]').forEach(function (s) { s.classList.add('submenu-active'); });
        panels[k].classList.add('is-open');
      });
    });
  });
  if (closeBtn) closeBtn.addEventListener('click', closeMega);
  if (overlay) overlay.addEventListener('click', closeMega);

  /* ---------- header dropdowns (search category, account) — click toggles ---------- */
  var dropbtns = Array.prototype.slice.call(header.querySelectorAll('.hdr-dropbtn'));
  function closeDropdowns(except) {
    header.querySelectorAll('.hdr-dropdown__content.is-open').forEach(function (d) { if (d !== except) d.classList.remove('is-open'); });
  }
  dropbtns.forEach(function (btn) {
    var content = btn.parentNode.querySelector('.hdr-dropdown__content');
    if (!content) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = content.classList.contains('is-open');
      closeDropdowns();
      if (!open) content.classList.add('is-open');
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.hdr-dropdown')) closeDropdowns();
  });

  /* ---------- mobile top bar: search / menu (observed at 360) ---------- */
  var mobSearch = header.querySelector('.hdr-mob-search');
  var mobNav = header.querySelector('.hdr-mob-nav');
  var mobOverlay = header.querySelector('.hdr-mob-overlay');
  var actions = header.querySelector('.hdr-mobile-actions');
  var liSearch = actions && actions.querySelector('[data-action="search"]');
  var liCloseSearch = actions && actions.querySelector('[data-action="close-search"]');
  var liMenu = actions && actions.querySelector('[data-action="menu"]');
  var liCloseMenu = actions && actions.querySelector('[data-action="close-menu"]');
  function setMobile(searchOpen, menuOpen) {
    if (mobSearch) mobSearch.classList.toggle('is-open', searchOpen);
    if (mobNav) mobNav.classList.toggle('is-open', menuOpen);
    if (mobOverlay) mobOverlay.classList.toggle('is-open', menuOpen);
    if (liSearch) liSearch.hidden = searchOpen;
    if (liCloseSearch) liCloseSearch.hidden = !searchOpen;
    if (liMenu) liMenu.hidden = menuOpen;
    if (liCloseMenu) liCloseMenu.hidden = !menuOpen;
    var mb = liMenu && liMenu.querySelector('button'); if (mb) mb.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
    if (searchOpen && mobSearch) { var inp = mobSearch.querySelector('input'); if (inp) inp.focus(); }
  }
  if (liSearch) liSearch.addEventListener('click', function () { setMobile(true, false); });
  if (liCloseSearch) liCloseSearch.addEventListener('click', function () { setMobile(false, false); });
  if (liMenu) liMenu.addEventListener('click', function () { setMobile(false, true); });
  if (liCloseMenu) liCloseMenu.addEventListener('click', function () { setMobile(false, false); });
  if (mobOverlay) mobOverlay.addEventListener('click', function () { setMobile(false, false); });

  /* ---------- footer mobile accordions (observed: inline max-height 250px, chevron rotate) ---------- */
  document.querySelectorAll('.ftr-col--mobile > button').forEach(function (btn) {
    var col = btn.parentNode, ul = col.querySelector('ul');
    btn.addEventListener('click', function () {
      var open = !col.classList.contains('is-open');
      document.querelectorAll && null;
      document.querySelectorAll('.ftr-col--mobile.is-open').forEach(function (c) { c.classList.remove('is-open'); var u = c.querySelector('ul'); if (u) u.style.maxHeight = ''; var b = c.querySelector('button'); if (b) b.setAttribute('aria-expanded', 'false'); });
      col.classList.toggle('is-open', open);
      if (ul) ul.style.maxHeight = open ? '250px' : '';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- language modal (observed at 360 via the footer language button) ---------- */
  var modal = document.querySelector('.lang-modal');
  if (modal) {
    var scrim = modal.querySelector('.lang-modal__scrim');
    function openModal() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () { requestAnimationFrame(function () { modal.classList.add('is-visible'); }); });
    }
    function closeModal() {
      modal.classList.remove('is-visible');
      document.body.style.overflow = 'auto';
      setTimeout(function () { modal.classList.remove('is-open'); }, 200);
    }
    document.querySelectorAll('.ftr-lang button').forEach(function (b) { b.addEventListener('click', openModal); });
    if (scrim) scrim.addEventListener('click', closeModal);
    modal.querySelectorAll('.lang-modal__list button').forEach(function (b) { b.addEventListener('click', closeModal); });
  }
})();
