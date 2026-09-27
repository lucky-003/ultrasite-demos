/* Vikas Marwah's Salon — demo interactions. Zero frameworks beyond GSAP (CDN). */
(function () {
  'use strict';

  var WA_NUMBER = '919000000000'; // DEMO placeholder — replaced with client's number on launch
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- footer year ---------- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  /* ---------- reveal on scroll (works with or without GSAP) ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- cursor glow (desktop, fine pointer only) ---------- */
  var glow = document.querySelector('.cursor-glow');
  if (glow && !reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var x = -999, y = -999, cx = -999, cy = -999, raf = null;
    function tick() {
      cx += (x - cx) * 0.12; cy += (y - cy) * 0.12;
      glow.style.left = cx + 'px'; glow.style.top = cy + 'px';
      if (Math.abs(x - cx) > 0.5 || Math.abs(y - cy) > 0.5) raf = requestAnimationFrame(tick);
      else raf = null;
    }
    document.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  /* ---------- animated stat counters ---------- */
  var counters = document.querySelectorAll('.stat-num[data-count]');
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target;
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.textContent = fmt(target) + suffix; return; }
      var start = null, dur = 1400;
      function fmt(n) {
        return decimals ? n.toFixed(decimals)
          : n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
      }
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.25 });
  counters.forEach(function (el) { cio.observe(el); });

  /* ---------- GSAP: signature scroll moment (manifesto) ---------- */
  function lightManifestoFallback() {
    // no-GSAP path: light lines one by one as they enter
    var lines = document.querySelectorAll('.m-line');
    var lio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('lit'); }
      });
    }, { threshold: 0.7 });
    lines.forEach(function (l) { lio.observe(l); });
  }

  if (!reduceMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    var lines = gsap.utils.toArray('.m-line');
    var section = document.querySelector('.manifesto');
    if (section && lines.length) {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: '+=140%', pin: '.manifesto-pin', scrub: 0.6 }
      });
      lines.forEach(function (line) {
        tl.to(line, { duration: 1, onStart: function () { line.classList.add('lit'); },
          onReverseComplete: function () { line.classList.remove('lit'); } });
        tl.to({}, { duration: 0.6 }); // dwell
      });
    }
    // gentle parallax on hero art
    var art = document.querySelector('.hero-art');
    if (art) {
      gsap.to(art, {
        y: 90, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  } else {
    lightManifestoFallback();
  }

  /* ---------- booking: build the WhatsApp message ---------- */
  function openBooking(service, name, day) {
    var msg = 'Hi Vikas Marwah\'s Salon! I\'d like to book.\n'
      + 'Name: ' + (name || '—') + '\n'
      + 'Service: ' + service + '\n'
      + 'Preferred: ' + (day || 'Flexible');
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  var form = document.getElementById('bookForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      openBooking(
        document.getElementById('fService').value,
        document.getElementById('fName').value.trim(),
        document.getElementById('fDay').value
      );
    });
  }

  /* service card "Book" buttons → prefill + scroll to booking */
  var serviceSelect = document.getElementById('fService');
  document.querySelectorAll('[data-service]').forEach(function (btn) {
    // only wire actual buttons/links, not the card articles themselves
    if (btn.tagName !== 'BUTTON' && btn.tagName !== 'A') return;
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      var svc = btn.getAttribute('data-service') || btn.getAttribute('data-service-link');
      if (serviceSelect && svc) {
        Array.prototype.forEach.call(serviceSelect.options, function (opt) {
          if (opt.value === svc) serviceSelect.value = svc;
        });
      }
      document.getElementById('book').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* nav shrink shadow on scroll */
  var navEl = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    navEl.style.boxShadow = window.scrollY > 10 ? '0 8px 30px rgba(0,0,0,.45)' : 'none';
  }, { passive: true });

})();

/* ============ CRAZY LAYER — unforgettable, still fast ============ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- 1. cinematic preloader ---------- */
  (function preloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    var killed = false;
    function kill() {
      if (killed) return; killed = true;
      pre.classList.add('done');
      setTimeout(function () { pre.remove(); }, 1100);
      document.dispatchEvent(new CustomEvent('ultrasite:ready'));
    }
    // hard failsafe: never trap the visitor
    setTimeout(kill, 3200);
    if (reduceMotion) { kill(); return; }
    var words = ['CUT', 'TRAIN', 'GLOW'];
    var wEl = document.getElementById('preWord');
    var cEl = document.getElementById('preCount');
    var bEl = document.getElementById('preBarFill');
    var wi = 0;
    var wordTimer = setInterval(function () {
      wi++;
      if (wi >= words.length) { clearInterval(wordTimer); return; }
      wEl.textContent = words[wi];
      wEl.classList.remove('swap'); void wEl.offsetWidth; wEl.classList.add('swap');
    }, 480);
    var start = null, dur = 1450;
    function step(ts) {
      if (killed) return;
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var v = Math.round(p * 100);
      if (cEl) cEl.textContent = v;
      if (bEl) bEl.style.width = v + '%';
      if (p < 1) requestAnimationFrame(step); else setTimeout(kill, 200);
    }
    requestAnimationFrame(step);
  })();

  /* ---------- 2. split hero + manifesto into letters ---------- */
  function splitLetters(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.textContent.split('').forEach(function (ch) {
        if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
        var s = document.createElement('span');
        s.className = 'ch'; s.textContent = ch;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  document.querySelectorAll('.hero-title .line-inner').forEach(splitLetters);
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.manifesto .m-line').forEach(splitLetters);
  }

  /* ---------- 3. pointer-reactive kinetic hero type ---------- */
  if (finePointer && !reduceMotion) {
    var hero = document.querySelector('.hero');
    var chars = Array.prototype.slice.call(document.querySelectorAll('.hero-title .ch'));
    var rects = [], px = -9999, py = -9999, active = false, rafId = null;
    function refreshRects() {
      rects = chars.map(function (c) { var r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, dx: 0, dy: 0 }; });
    }
    refreshRects();
    window.addEventListener('resize', refreshRects);
    var scrollT = null;
    window.addEventListener('scroll', function () {
      clearTimeout(scrollT); scrollT = setTimeout(refreshRects, 160);
    }, { passive: true });
    var R = 150, FORCE = 34;
    function loop() {
      var anyNear = false;
      for (var i = 0; i < chars.length; i++) {
        var rc = rects[i]; if (!rc) continue;
        var vx = rc.x - px, vy = rc.y - py;
        var d = Math.sqrt(vx * vx + vy * vy);
        var tx = 0, ty = 0;
        if (d < R && d > 1) { var f = (1 - d / R) * FORCE; tx = (vx / d) * f; ty = (vy / d) * f; anyNear = true; }
        rc.dx += (tx - rc.dx) * 0.18; rc.dy += (ty - rc.dy) * 0.18;
        if (Math.abs(rc.dx) > 0.1 || Math.abs(rc.dy) > 0.1) {
          chars[i].style.transform = 'translate(' + rc.dx.toFixed(1) + 'px,' + rc.dy.toFixed(1) + 'px)';
          anyNear = true;
        } else if (chars[i].style.transform) { chars[i].style.transform = ''; }
      }
      if (active || anyNear) rafId = requestAnimationFrame(loop);
      else rafId = null;
    }
    if (hero) {
      hero.addEventListener('pointermove', function (e) {
        px = e.clientX; py = e.clientY;
        if (!active) { active = true; if (!rafId) rafId = requestAnimationFrame(loop); }
      });
      hero.addEventListener('pointerleave', function () { active = false; px = -9999; py = -9999; });
    }
  }

  /* ---------- 4. magnetic glow CTAs ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      var bx = 0, by = 0, tx = 0, ty = 0, raf = null, hovering = false;
      function tick() {
        bx += (tx - bx) * 0.22; by += (ty - by) * 0.22;
        btn.style.transform = 'translate(' + bx.toFixed(1) + 'px,' + by.toFixed(1) + 'px)';
        if (hovering || Math.abs(tx - bx) > 0.3 || Math.abs(ty - by) > 0.3) raf = requestAnimationFrame(tick);
        else { raf = null; btn.style.transform = ''; }
      }
      function kick() { if (!raf) raf = requestAnimationFrame(tick); }
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        tx = Math.max(-20, Math.min(20, (e.clientX - (r.left + r.width / 2)) * 0.35));
        ty = Math.max(-20, Math.min(20, (e.clientY - (r.top + r.height / 2)) * 0.35));
        hovering = true; kick();
      });
      btn.addEventListener('pointerleave', function () { hovering = false; tx = 0; ty = 0; kick(); });
    });
  }

  /* ---------- 5. bento hover-tilt + glare ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var raf = null;
      card.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var r = card.getBoundingClientRect();
          var pxr = (e.clientX - r.left) / r.width, pyr = (e.clientY - r.top) / r.height;
          card.style.transition = 'transform .08s linear';
          card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - pyr) * 9).toFixed(2) + 'deg) rotateY(' + ((pxr - 0.5) * 11).toFixed(2) + 'deg) translateY(-4px)';
          card.style.setProperty('--mx', (pxr * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (pyr * 100).toFixed(1) + '%');
        });
      });
      card.addEventListener('pointerleave', function () {
        card.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1)';
        card.style.transform = '';
      });
    });
  }

  /* ---------- 6. clip-path wipe reveals ---------- */
  (function wipes() {
    var els = document.querySelectorAll('.wipe');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var wio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); wio.unobserve(en.target); }
      });
    }, { threshold: 0.18 });
    els.forEach(function (el) { wio.observe(el); });
    // safety: never leave content hidden
    setTimeout(function () { els.forEach(function (el) { el.classList.add('in'); }); }, 6000);
  })();

  /* ---------- 7. custom cursor: dot + trailing ring ---------- */
  if (finePointer && !reduceMotion) {
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    var mx = -100, my = -100, rx = -100, ry = -100, craf = null;
    function cloop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      if (ring) ring.style.transform = 'translate(' + (rx - 19) + 'px,' + (ry - 19) + 'px)';
      if (Math.abs(mx - rx) > 0.4 || Math.abs(my - ry) > 0.4) craf = requestAnimationFrame(cloop);
      else craf = null;
    }
    document.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (dot) dot.style.transform = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px)';
      if (!craf) craf = requestAnimationFrame(cloop);
      var t = e.target;
      var onField = t && t.closest && t.closest('input,select,textarea,label');
      document.body.classList.toggle('cursor-off', !!onField);
      var onHot = t && t.closest && t.closest('a,button,.link-book,[data-tilt]');
      if (ring) ring.classList.toggle('hot', !!onHot);
    }, { passive: true });
  }

})();

/* ============ TECH MOTION PASS — vanilla, fast, mobile-first ============ */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. stagger card reveals within groups (bento / reviews / visit) */
  ['.bento', '.reviews', '.visit-grid'].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (group) {
      var kids = group.querySelectorAll(':scope > .reveal');
      for (var i = 0; i < kids.length; i++) {
        kids[i].style.setProperty('--rd', Math.min(i * 0.09, 0.45).toFixed(2) + 's');
      }
    });
  });

  /* 2. scroll progress bar — rAF-throttled, transform-only */
  if (!reduceMotion) {
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    var fill = document.createElement('span');
    bar.appendChild(fill);
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var y = window.scrollY || doc.scrollTop || 0;
      fill.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0).toFixed(3) + ')';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* 3. hero entrance: play once the preloader lifts */
  function heroGo() { document.body.classList.add('hero-go'); }
  if (reduceMotion) { heroGo(); }
  else {
    var pre = document.getElementById('preloader');
    if (!pre) { heroGo(); }
    else {
      document.addEventListener('ultrasite:ready', heroGo);
      setTimeout(heroGo, 4000); /* failsafe: never leave hero hidden */
    }
  }
})();
