/* Akshat Tiwari — portfolio · small vanilla JS (no dependencies)
   Motion rules: transform/opacity only, IntersectionObserver for reveals, rAF-throttled pointer work,
   everything off under prefers-reduced-motion, 4 s safety net so content never stays hidden. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var reduceMotion = mq('(prefers-reduced-motion: reduce)');
  var finePointer = mq('(hover: hover) and (pointer: fine)');
  var wide = window.innerWidth > 768;
  var rich = finePointer && wide && !reduceMotion; /* desktop-only extras: name decode, card tilt */

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

  /* ---- reveals: .rv elements fade/rise, [data-stagger] containers reveal their children one by one ---- */
  var revealEls = Array.prototype.slice.call(d.querySelectorAll('.rv, [data-stagger]'));
  var revealAll = function () { revealEls.forEach(function (el) { el.classList.add('in'); }); };
  d.querySelectorAll('[data-stagger]').forEach(function (box) {
    Array.prototype.forEach.call(box.children, function (child, i) { child.style.setProperty('--i', i); });
  });
  var revealsStarted = false;
  var startReveals = function () {
    if (revealsStarted) return;
    revealsStarted = true;
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealAll();
    }
  };
  /* safety net: whatever happens, nothing stays hidden after 4 s */
  setTimeout(function () { if (!d.querySelector('.rv.in')) revealAll(); }, 4000);

  /* ---- hero entrance: corner texts stagger in; on desktop the name letters settle with a short glitch ---- */
  var heroStarted = false;
  var startHero = function () {
    if (heroStarted) return;
    heroStarted = true;
    var hero = d.querySelector('.hero');
    if (hero) hero.classList.add('live');
    var h1 = d.getElementById('hero-name');
    if (h1 && rich) {
      var text = h1.textContent;
      h1.textContent = '';
      for (var i = 0; i < text.length; i++) {
        var s = d.createElement('span');
        s.className = 'ch';
        s.style.setProperty('--i', i);
        s.textContent = text[i] === ' ' ? ' ' : text[i];
        h1.appendChild(s);
      }
      h1.classList.add('decode', 'in');
    }
  };

  /* ---- boot intro (once per session; html.intro was set by the inline gate in <head>, the overlay itself is #boot) ---- */
  var boot = d.getElementById('boot');
  var begin = function () { startHero(); startReveals(); };
  if (html.classList.contains('intro') && boot && !reduceMotion) {
    var log = d.getElementById('boot-log');
    var full = ['> FILE 001 // OPERATION: BUILD', '> LOADING MODULES .......... OK', '> SYSTEMS ONLINE // OPENING CASE FILE'].join('\n');
    var k = 0, done = false, bootStarted = false, timers = [];
    var finish = function () {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      try { sessionStorage.setItem('ak-boot', '1'); } catch (e) { /* storage blocked: intro simply shows again next time */ }
      boot.classList.add('out');       /* 300 ms dissolve; the overlay is still fully opaque in this frame... */
      html.classList.remove('intro');  /* ...so the hero snaps back to its pre-reveal state unseen and scrolling unlocks */
      setTimeout(begin, 150);
      setTimeout(function () { boot.hidden = true; }, 320);
    };
    var type = function () {
      if (done) return;
      k++;
      if (log) log.textContent = full.slice(0, k);
      if (k < full.length) timers.push(setTimeout(type, 7));
    };
    var run = function () {
      if (done || bootStarted) return;
      bootStarted = true;
      timers.push(setTimeout(function () { boot.classList.add('run'); }, 60));
      timers.push(setTimeout(type, 120));
      timers.push(setTimeout(finish, 1250));
    };
    /* start only once style.css is applied (the overlay computes to display:flex) so the whole intro is actually seen; "load" is the fallback */
    var armed = function () { if (done || bootStarted) return; if (getComputedStyle(boot).display === 'flex') run(); else requestAnimationFrame(armed); };
    armed();
    window.addEventListener('load', run, { once: true });
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { d.addEventListener(ev, finish, { once: true, passive: true }); });
  } else {
    html.classList.remove('intro');
    if (boot) boot.hidden = true;
    begin();
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
    setTimeout(function () { if (!started) { started = true; tick(); } }, 3200);
  }

  /* ---- project cards: tiny 3D tilt + a glow that follows the cursor (desktop, fine pointer only; one rAF per move) ---- */
  if (rich) {
    d.querySelectorAll('[data-tilt]').forEach(function (card) {
      var glow = d.createElement('i');
      glow.className = 'proj__glow';
      glow.setAttribute('aria-hidden', 'true');
      card.appendChild(glow);
      var ev = null, raf = 0;
      var paint = function () {
        raf = 0;
        if (!ev) return;
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        card.style.setProperty('--ry', ((x - 0.5) * 5).toFixed(2) + 'deg');   /* max 2.5 degrees */
        card.style.setProperty('--rx', ((0.5 - y) * 5).toFixed(2) + 'deg');
        glow.style.transform = 'translate(' + Math.round(x * r.width) + 'px,' + Math.round(y * r.height) + 'px)';
      };
      card.addEventListener('pointermove', function (e) { ev = e; if (!raf) raf = requestAnimationFrame(paint); });
      card.addEventListener('pointerleave', function () {
        ev = null;
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---- numbers count up when they scroll into view ---- */
  var counters = Array.prototype.slice.call(d.querySelectorAll('[data-count]'));
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        co.unobserve(en.target);
        var el = en.target, target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '', t0 = 0;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 650), e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * e) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        el.textContent = '0' + suffix;
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---- GitHub stat cards: show a note when the stats service is down ---- */
  var markOffline = function (img) { var f = img.closest('.stat'); if (f) f.classList.add('is-offline'); };
  d.querySelectorAll('img[data-stat]').forEach(function (img) {
    img.addEventListener('error', function () { markOffline(img); });
    if (img.complete && img.naturalWidth === 0 && img.src) markOffline(img);
  });

  /* ---- screenshot galleries: click-to-enlarge lightbox (one per page, scoped to the clicked gallery) ---- */
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
      items = list;
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
