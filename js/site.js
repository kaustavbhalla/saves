/* USICT Cybersecurity Club — page behaviour.
   Everything here is progressive: without this file every word and picture is already on the page. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var Scene = function () { return window.Scene || { set: noop, hero: noop, touch: noop, color: noop, reveal: noop }; };
  function noop() {}
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- theme ---------- */
  var toggle = $('.theme-toggle');
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return !matchMedia('(prefers-color-scheme: light)').matches;
  }
  function paintToggle() {
    if (!toggle) return;
    var dark = isDark();
    toggle.setAttribute('aria-label', dark ? 'Switch to light' : 'Switch to dark');
    toggle.innerHTML = dark
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="5"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></g></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg>';
  }
  if (toggle) {
    paintToggle();
    toggle.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next); store('theme', next);
      paintToggle(); requestAnimationFrame(function () { Scene().color(); });
    });
  }

  /* ---------- nav ---------- */
  var nav = $('.nav'), lastY = 0;
  function onScrollNav(y) {
    if (!nav) return;
    nav.classList.toggle('at-top', y < 12);
    if (y > 240 && y > lastY + 4) nav.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 240) nav.classList.remove('is-hidden');
    lastY = y;
  }
  onScrollNav(scrollY);
  var menuBtn = $('.menu-btn'), drawer = $('.drawer');
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? 'Close' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* ---------- the live thing: today's flag ---------- */
  var FLAGS = [
    { kind: 'Rotate by thirteen', cipher: 'hfvpg{guvf_vf_bayl_ebg13}', answer: 'usict{this_is_only_rot13}', hint: 'Every letter moved thirteen places. Do it again and it moves back.' },
    { kind: 'Not a secret, just an encoding', cipher: 'dXNpY3R7YmFzZTY0X2lzX25vdF9lbmNyeXB0aW9ufQ==', answer: 'usict{base64_is_not_encryption}', hint: 'Sixty-four symbols and two equals signs of padding at the end.' },
    { kind: 'Bytes, written out', cipher: '75 73 69 63 74 7b 68 65 78 5f 6d 61 72 6b 73 5f 74 68 65 5f 73 70 6f 74 7d', answer: 'usict{hex_marks_the_spot}', hint: 'Each pair is one byte in base sixteen. 75 is the letter u.' },
    { kind: 'Shift of an emperor', cipher: 'xvlfw{yhql_ylgl_ylfl}', answer: 'usict{veni_vidi_vici}', hint: 'Caesar is said to have shifted by three.' },
    { kind: 'Read it the other way', cipher: '}rorrim_eht_ni_kool{tcisu', answer: 'usict{look_in_the_mirror}', hint: 'The closing brace came first.' },
    { kind: 'The alphabet, folded', cipher: 'fhrxg{zgyzhs_uorkh_gsv_zokszyvg}', answer: 'usict{atbash_flips_the_alphabet}', hint: 'a becomes z, b becomes y. An old Hebrew cipher called Atbash.' }
  ];
  var flagBox = $('.flag-box');
  if (flagBox) {
    var day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    var F = FLAGS[day % FLAGS.length];
    var key = 'flag-' + day;
    $('.flag-kind', flagBox).textContent = F.kind;
    $('.flag-cipher', flagBox).textContent = F.cipher;
    var hint = $('.flag-hint', flagBox), msg = $('.flag-msg', flagBox), form = $('.flag-form', flagBox), input = $('#flag-input');
    hint.addEventListener('click', function () { msg.textContent = F.hint; });
    function solved() {
      msg.textContent = 'Flag accepted. For a moment, the gap is closed. Show this screen at Flag Night for a sticker.';
      input.value = F.answer; input.setAttribute('readonly', '');
      Scene().touch(true);
    }
    if (store(key) === '1') solved();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim().toLowerCase().replace(/\s+/g, '');
      if (!v) { msg.textContent = 'Type the flag first. It looks like usict{...}.'; return; }
      if (v === F.answer) { store(key, '1'); solved(); }
      else if (v.indexOf('usict{') !== 0) msg.textContent = 'Close, but flags start with usict{ and end with }.';
      else msg.textContent = 'Not this one. Decode the whole line, braces included.';
    });
  }

  /* ---------- newsletter ---------- */
  $$('.signup').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = $('input[type="email"]', f), out = $('.signup-msg', f);
      if (!inp.value || !inp.checkValidity()) { out.textContent = 'That address looks incomplete. Try name@example.com.'; inp.focus(); return; }
      out.textContent = 'Thanks. The mailing list is not connected in this preview, so ' + inp.value + ' was not stored anywhere.';
    });
  });

  /* ---------- archive: object on the split disc ---------- */
  var arch = $('.archive');
  if (arch) {
    var opts = $$('.archive-list button', arch), imgs = $$('.disc-obj img', arch), fact = $('.disc-fact', arch);
    opts.forEach(function (b, i) {
      b.addEventListener('click', function () {
        opts.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        imgs.forEach(function (im, n) { im.classList.toggle('on', n === i); });
        fact.textContent = b.getAttribute('data-fact');
        if (hasGsap && !reduce) gsap.fromTo($$('.disc i', arch), { x: function (n) { return n ? 14 : -14; } }, { x: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  }

  /* ---------- roster: a monogram follows the pointer ---------- */
  var mono = $('.monogram');
  if (mono && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var a = $$('i', mono), mx = 0, my = 0, px = 0, py = 0, raf = 0;
    function follow() { px += (mx - px) * 0.2; py += (my - py) * 0.2; mono.style.left = px + 'px'; mono.style.top = py + 'px'; raf = requestAnimationFrame(follow); }
    $$('.roster li').forEach(function (li) {
      li.addEventListener('pointerenter', function (e) {
        var n = li.getAttribute('data-initials') || '';
        a[0].textContent = n.charAt(0); a[1].textContent = n.charAt(1);
        mx = px = e.clientX + 140; my = py = e.clientY;
        mono.classList.add('on'); if (!raf) follow();
      });
      li.addEventListener('pointermove', function (e) { mx = e.clientX + 140; my = e.clientY; });
      li.addEventListener('pointerleave', function () { mono.classList.remove('on'); cancelAnimationFrame(raf); raf = 0; });
    });
  }

  /* ---------- events filter ---------- */
  var filters = $('.filters');
  if (filters) {
    var fb = $$('button', filters);
    fb.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-kind');
        fb.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        $$('.ev-list li').forEach(function (li) { li.hidden = !(k === 'all' || li.getAttribute('data-kind') === k); });
        if (hasGsap && !reduce) gsap.from($$('.ev-list li:not([hidden])'), { y: 16, opacity: 0, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
        if (hasGsap) ScrollTrigger.refresh();
      });
    });
  }

  /* ---------- one frame, contents change ---------- */
  var frame = $('.frame');
  if (frame) {
    var fi = $$('img', frame), cap = $('.frame-cap'), at = 0, timer = 0;
    function show(n) { at = (n + fi.length) % fi.length; fi.forEach(function (im, i) { im.classList.toggle('on', i === at); }); if (cap) cap.textContent = fi[at].getAttribute('data-cap'); }
    function cycle() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(at + 1); }, 3000); }
    frame.addEventListener('click', function () { show(at + 1); cycle(); });
    frame.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(at + 1); cycle(); } });
    show(0); cycle();
  }

  /* ---------- footer year ---------- */
  $$('.year').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* =================== motion =================== */
  var loader = $('.loader');
  if (!hasGsap) {
    if (loader) loader.remove();
    Scene().reveal();
    addEventListener('scroll', function () { onScrollNav(scrollY); }, { passive: true });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', function (e) { ScrollTrigger.update(); onScrollNav(e.scroll); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (l) {
      l.addEventListener('click', function (e) { var t = $(l.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -60 }); } });
    });
  } else {
    addEventListener('scroll', function () { onScrollNav(scrollY); }, { passive: true });
  }

  /* split headings into characters for the 3D turn */
  function split(el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (word) {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            Array.from(word).forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = c; w.appendChild(s); });
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    $$('.w', el).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
    el.classList.add('split');
    return $$('.ch', el);
  }

  /* field chapters: the whole page turns black or white */
  function setField(f) {
    if (f === 'invert') root.setAttribute('data-field', 'invert'); else root.removeAttribute('data-field');
    requestAnimationFrame(function () { Scene().color(); });
  }
  $$('[data-field]').forEach(function (sec) {
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onEnter: function () { setField(sec.getAttribute('data-field')); },
      onEnterBack: function () { setField(sec.getAttribute('data-field')); }
    });
  });
  $$('[data-scene]').forEach(function (sec) {
    ScrollTrigger.create({
      trigger: sec, start: 'top 60%', end: 'bottom 40%',
      onEnter: function () { Scene().set(sec.getAttribute('data-scene')); },
      onEnterBack: function () { Scene().set(sec.getAttribute('data-scene')); }
    });
  });

  var heroH1 = $('.hero h1, .page-hero h1');
  var heroChars = heroH1 ? split(heroH1) : [];

  if (reduce) {
    if (loader) loader.remove();
    Scene().reveal();
    return;
  }

  /* --- section entrances: heading turns in 3D, then the parts arrive in reading order --- */
  $$('h2.split-me, .split-me').forEach(function (h) {
    var chars = split(h);
    gsap.from(chars, { rotateX: -100, yPercent: 35, opacity: 0, stagger: 0.016, duration: 0.95, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });
  $$('[data-rv-group]').forEach(function (g) {
    var items = $$('[data-rv]', g);
    if (!items.length) return;
    gsap.from(items, { y: 26, opacity: 0, duration: 0.85, stagger: 0.075, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 80%', once: true } });
  });

  /* statement: words come up from the dark as you read */
  $$('.statement p').forEach(function (p) {
    var words = [];
    Array.prototype.slice.call(p.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
          var s = document.createElement('span'); s.textContent = w; s.style.display = 'inline-block'; words.push(s); frag.appendChild(s);
        });
        p.replaceChild(frag, n);
      } else words.push(n);
    });
    gsap.fromTo(words, { opacity: 0.16 }, { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    gsap.from($$('.thumb', p), { scale: 0, transformOrigin: '50% 60%', stagger: 0.12, duration: 0.8, ease: 'back.out(1.4)', scrollTrigger: { trigger: p, start: 'top 75%', once: true } });
  });

  /* the gap band: two tips reach for each other and stop short */
  $$('.gapband').forEach(function (band) {
    var t = $$('i', band);
    gsap.fromTo(t[0], { scaleX: 0.35 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'top 35%', scrub: true } });
    gsap.fromTo(t[1], { scaleX: 0.35 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'top 35%', scrub: true } });
  });

  /* the signature move: the shaped picture opens like a shutter */
  $$('.shutter').forEach(function (s) {
    var im = $('img', s);
    var tl = gsap.timeline({ scrollTrigger: { trigger: s, start: 'top 85%', once: true } });
    tl.fromTo(s, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' })
      .fromTo(im, { scale: 1.14 }, { scale: 1, duration: 1.5, ease: 'expo.out' }, 0);
  });

  /* the fresco opens outward from the gap between the fingers */
  $$('.fresco-band').forEach(function (band) {
    var pic = $('.pic', band), im = $('img', band);
    gsap.fromTo(pic, { clipPath: 'inset(46% 49.4% 46% 49.4%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: band, start: 'top 85%', end: 'center 50%', scrub: true } });
    gsap.fromTo(im, { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: band, start: 'top 85%', end: 'bottom top', scrub: true } });
  });

  /* pictures drift slowly against the scroll */
  $$('[data-drift]').forEach(function (p) {
    gsap.fromTo(p, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: p.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* hero: the particles turn toward the gap as you leave */
  var hero = $('.hero, .page-hero');
  if (hero) {
    ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', scrub: true, onUpdate: function (s) { Scene().hero(s.progress); } });
    gsap.to($$('[data-hero-fade]', hero), { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* events: a horizontal track that turns in 3D as it passes */
  var pin = $('.events-pin'), track = $('.track');
  if (pin && track) {
    ScrollTrigger.matchMedia({
      '(min-width: 861px)': function () {
        var cards = $$('.ev', track);
        function dist() { return Math.max(0, track.scrollWidth - innerWidth + 40); }
        function tilt() {
          var cx = innerWidth / 2;
          cards.forEach(function (c) {
            var r = c.getBoundingClientRect(), d = (r.left + r.width / 2 - cx) / innerWidth;
            gsap.set(c, { rotateY: d * -18, z: -Math.abs(d) * 120, transformPerspective: 1400 });
          });
        }
        gsap.to(track, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: pin, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, refreshPriority: 1, onUpdate: tilt, onRefresh: tilt }
        });
        tilt();
      }
    });
  }

  /* roster rows slide in from alternating sides */
  $$('.roster').forEach(function (r) {
    $$('li', r).forEach(function (li, i) {
      gsap.from(li, { x: i % 2 ? 40 : -40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 92%', once: true } });
    });
  });

  /* the cta word rises out of its band */
  $$('.cta').forEach(function (c) {
    gsap.from($('.cta-word', c), { yPercent: 60, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom bottom', scrub: true } });
  });
  /* footer mark: the tips settle into place */
  $$('.bigmark').forEach(function (m) {
    var t = $$('i', m);
    gsap.from(t[0], { xPercent: -30, scaleY: 0.6, transformOrigin: 'left bottom', ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom bottom', scrub: true } });
    gsap.from(t[1], { xPercent: 30, scaleY: 0.6, transformOrigin: 'right bottom', ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom bottom', scrub: true } });
  });

  /* ---------- the preloader, then the hero ---------- */
  function heroIn() {
    Scene().reveal();
    if (heroChars.length) gsap.from(heroChars, { rotateX: -100, yPercent: 40, opacity: 0, stagger: 0.025, duration: 1.1, ease: 'power4.out' });
    gsap.from($$('[data-hero-in]'), { y: 24, opacity: 0, stagger: 0.08, duration: 0.9, delay: 0.35, ease: 'power3.out' });
  }
  if (loader && !sessionStorageSeen()) {
    if (lenis) lenis.stop();
    var tips = $$('.tips i', loader), count = $('.count', loader), o = { v: 0 };
    var done = false;
    function finish() { if (done) return; done = true; tl.progress(1); }
    var tl = gsap.timeline({ onComplete: function () { done = true; loader.remove(); if (lenis) lenis.start(); ['wheel', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) { removeEventListener(ev, finish); }); } });
    ['wheel', 'touchstart', 'keydown', 'scroll'].forEach(function (ev) { addEventListener(ev, finish, { passive: true }); });
    setTimeout(finish, 3600);
    tl.to(o, { v: 100, duration: 1.05, ease: 'power2.inOut', onUpdate: function () { count.textContent = String(Math.round(o.v)).padStart(3, '0'); } }, 0)
      .to(tips[0], { x: 0, duration: 1.05, ease: 'expo.out' }, 0)
      .to(tips[1], { x: 0, duration: 1.05, ease: 'expo.out' }, 0)
      .to([count, $('.note', loader)], { opacity: 0, duration: 0.2 }, 1.05)
      .to(tips[0], { x: '-55vw', duration: 0.75, ease: 'expo.inOut' }, 1.1)
      .to(tips[1], { x: '55vw', duration: 0.75, ease: 'expo.inOut' }, 1.1)
      .to($('.half.l', loader), { xPercent: -100, duration: 0.75, ease: 'expo.inOut' }, 1.1)
      .to($('.half.r', loader), { xPercent: 100, duration: 0.75, ease: 'expo.inOut' }, 1.1)
      .add(heroIn, 1.3);
  } else {
    if (loader) loader.remove();
    heroIn();
  }
  function sessionStorageSeen() {
    try { if (sessionStorage.getItem('seen-loader')) return true; sessionStorage.setItem('seen-loader', '1'); } catch (e) {}
    return false;
  }

  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
