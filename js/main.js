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

  /* ---- screenshot gallery: click-to-enlarge lightbox ---- */
  var lb = d.getElementById('lightbox');
  var galleries = Array.prototype.slice.call(d.querySelectorAll('.gallery'));
  if (lb && galleries.length) {
    var lbImg = lb.querySelector('.lightbox__img');
    var lbCap = lb.querySelector('.lightbox__cap');
    var items = [], current = -1, lastFocus = null;
    var show = function (i) {
      current = (i + items.length) % items.length;
      var b = items[current];
      lbImg.src = b.getAttribute('data-full');
      lbImg.alt = b.querySelector('img').alt;
      lbCap.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0') + ' — ' + b.getAttribute('data-caption');
    };
    var open = function (list, i) {
      items = list; /* arrows and counter stay inside the gallery that was clicked */
      lastFocus = d.activeElement;
      show(i);
      lb.hidden = false;
      d.body.classList.add('lightbox-open');
      lb.querySelector('.lightbox__close').focus();
    };
    var close = function () {
      lb.hidden = true;
      d.body.classList.remove('lightbox-open');
      lbImg.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    galleries.forEach(function (g) {
      var list = Array.prototype.slice.call(g.querySelectorAll('.gallery__item'));
      list.forEach(function (b, i) { b.addEventListener('click', function () { open(list, i); }); });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(current - 1); });
    lb.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'ArrowLeft') show(current - 1);
    });
  }

  /* ---- footer year ---- */
  var y = d.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
