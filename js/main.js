/* Akshat Tiwari — portfolio · small vanilla JS (no dependencies) */
(function () {
  'use strict';
  var d = document;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobile menu ---- */
  var nav = d.querySelector('.nav');
  var toggle = d.querySelector('.nav__toggle');
  var menu = d.getElementById('menu');
  if (nav && toggle && menu) {
    var label = toggle.querySelector('.nav__toggle-txt');
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'CLOSE' : 'MENU';
    };
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---- fade-in on scroll ---- */
  var revealEls = d.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    /* safety net: if nothing has been revealed after 4s (observer never fired), show everything */
    setTimeout(function () {
      if (!d.querySelector('.rv.in')) revealEls.forEach(function (el) { el.classList.add('in'); });
    }, 4000);
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- active section link in the nav ---- */
  var links = Array.prototype.slice.call(d.querySelectorAll('.menu a[href^="#"]'));
  var sections = links.map(function (a) { return d.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---- typing line in the hero ---- */
  var typed = d.getElementById('typed');
  var lines = ['M.Sc. Artificial Intelligence Student', 'I build apps with AI', 'Turning ideas into working systems'];
  if (typed && !reduceMotion) {
    var li = 0, ci = lines[0].length, deleting = true, started = false;
    var tick = function () {
      var t = lines[li];
      ci += deleting ? -1 : 1;
      typed.textContent = t.slice(0, ci);
      var wait = deleting ? 38 : 68;
      if (!deleting && ci === t.length) { wait = 1700; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; li = (li + 1) % lines.length; wait = 320; }
      setTimeout(tick, wait);
    };
    setTimeout(function () { if (!started) { started = true; tick(); } }, 2200);
  }

  /* ---- GitHub stat cards: show a note when the stats service is down ---- */
  var markOffline = function (img) { var f = img.closest('.stat'); if (f) f.classList.add('is-offline'); };
  d.querySelectorAll('img[data-stat]').forEach(function (img) {
    img.addEventListener('error', function () { markOffline(img); });
    if (img.complete && img.naturalWidth === 0 && img.src) markOffline(img);
  });

  /* ---- footer year ---- */
  var y = d.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
