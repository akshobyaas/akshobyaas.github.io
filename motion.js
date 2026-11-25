/* =====================================================================
   motion.js — lights-out intro + scroll animations (GSAP + ScrollTrigger)
   Everything degrades gracefully: no GSAP or reduced motion = static page.
   ===================================================================== */
(function () {
  const root = document.documentElement;
  const body = document.body;
  const loader = document.getElementById('loader');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  let seen = false;
  try { seen = sessionStorage.getItem('lights_seen') === '1'; sessionStorage.setItem('lights_seen', '1'); } catch (e) {}

  /* ---------- split hero name into letters (for the launch) ---------- */
  function splitLetters(el) {
    if (!el || el.dataset.split) return [];
    el.dataset.split = '1';
    const letters = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((word) => {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(word)); return; }
            const w = document.createElement('span');
            w.className = 'word';            // keeps the word on one line
            [...word].forEach((ch) => {
              const s = document.createElement('span');
              s.className = 'ltr';
              s.textContent = ch;
              w.appendChild(s);
              letters.push(s);
            });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    };
    walk(el);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    return letters;
  }

  /* ---------- count-up for telemetry numbers ---------- */
  function countUp(el) {
    const target = el.textContent.trim();
    const num = parseFloat(target);
    if (isNaN(num)) return;
    const decimals = (target.split('.')[1] || '').length;
    const pad = /^0\d/.test(target) ? target.length : 0;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: num, duration: 1.4, ease: 'power3.out',
      onUpdate() {
        let t = obj.v.toFixed(decimals);
        if (pad) t = t.padStart(pad, '0');
        el.textContent = t;
      },
    });
  }

  /* ---------- the race start: runs once the lights go out ---------- */
  let started = false;
  function raceStart() {
    if (started) return;
    started = true;
    if (loader) loader.classList.add('hidden');
    body.classList.add('go');

    const rpmBar = document.getElementById('rpm-bar');
    if (rpmBar) setTimeout(() => { rpmBar.style.width = '86%'; }, 450);

    if (!hasGsap || reduce) return;

    const letters = splitLetters(document.querySelector('.hero-name'));
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from(letters, { yPercent: 110, xPercent: -30, skewX: -18, opacity: 0, duration: 0.7, stagger: 0.035 })
      .from('.hero-role', { x: -40, opacity: 0, duration: 0.5 }, '-=0.35')
      .from('.hero-bio, .hero-btns, .rpm-wrap', { y: 24, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.3')
      .from('.telemetry-card', { x: 60, opacity: 0, duration: 0.7 }, 0.15)
      .add(() => document.querySelectorAll('.telem-val').forEach(countUp), 0.4);
  }

  /* ---------- lights-out sequence ---------- */
  function lightsOut() {
    const cols = loader ? [...loader.querySelectorAll('.gantry-col')] : [];
    const label = document.getElementById('loader-label');
    const skip = document.getElementById('loader-skip');
    const STEP = 260;                       // one column every 260 ms
    const HOLD = 300 + Math.random() * 350;  // random hold, like a real start
    const timers = [];

    cols.forEach((c, i) => timers.push(setTimeout(() => c.classList.add('on'), 150 + i * STEP)));
    timers.push(setTimeout(() => {
      cols.forEach((c) => c.classList.remove('on'));
      if (label) label.textContent = 'AND AWAY WE GO';
      if (loader) loader.classList.add('out');
      setTimeout(raceStart, 380);
    }, 150 + cols.length * STEP + HOLD));

    const bail = () => { timers.forEach(clearTimeout); raceStart(); };
    if (skip) skip.addEventListener('click', bail);
    document.addEventListener('keydown', bail, { once: true });
  }

  if (!loader || reduce || seen) {
    if (loader) loader.classList.add('hidden', 'instant');
    raceStart();
  } else {
    lightsOut();
  }

  if (!hasGsap || reduce) return;

  /* =================== SCROLL ANIMATIONS =================== */
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('gsap-on');

  // Hero drives away as you scroll past it
  gsap.to('.hero-left', {
    yPercent: -18, opacity: 0.15, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero-right', {
    yPercent: -35, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Giant outlined section numbers drift behind the titles
  gsap.utils.toArray('.sec-num').forEach((n) => {
    gsap.fromTo(n, { yPercent: 35 }, {
      yPercent: -35, ease: 'none',
      scrollTrigger: { trigger: n.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Section titles: each word wipes up from behind a mask
  gsap.utils.toArray('.sec-title').forEach((t) => {
    const words = [];
    [...t.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          const m = document.createElement('span'); m.className = 'wmask';
          const s = document.createElement('span'); s.className = 'w'; s.textContent = w;
          m.appendChild(s); frag.appendChild(m); words.push(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        const m = document.createElement('span'); m.className = 'wmask';
        n.replaceWith(m); m.appendChild(n); n.classList.add('w', 'hl'); words.push(n);
      }
    });
    gsap.from(words, {
      yPercent: 110, duration: 0.8, ease: 'power4.out', stagger: 0.08,
      scrollTrigger: { trigger: t, start: 'top 85%' },
    });
  });

  // Tech marquee: drifts on its own, speeds up and flips with scroll direction
  const track = document.querySelector('.marquee-track');
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    let dir = 1;
    ScrollTrigger.create({
      onUpdate(self) {
        const v = self.getVelocity();
        if (v !== 0) dir = v > 0 ? 1 : -1;
        const boost = Math.min(Math.abs(v) / 250, 6);
        gsap.to(loop, { timeScale: dir * (1 + boost), duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2, overwrite: false });
      },
    });
  }

  // Project cards drive in from the right, row by row
  ScrollTrigger.batch('.project-card', {
    start: 'top 88%',
    onEnter: (batch) => gsap.fromTo(batch,
      { x: 80, opacity: 0, skewX: -6 },
      { x: 0, opacity: 1, skewX: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12, overwrite: true,
        onComplete() { batch.forEach((b) => { b.classList.add('visible'); gsap.set(b, { clearProps: 'transform' }); }); } }),
  });

  // Podium: steps rise, P3 lights up
  gsap.from('.podium-step', {
    scaleY: 0, transformOrigin: 'bottom', duration: 0.7, ease: 'back.out(1.6)', stagger: 0.12,
    scrollTrigger: { trigger: '.result-card', start: 'top 80%' },
  });
  gsap.from('.result-body > *', {
    y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: '.result-card', start: 'top 80%' },
  });
  ScrollTrigger.create({
    trigger: '.result-card', start: 'top 70%', once: true,
    onEnter: () => document.querySelector('.podium-step.is-me')?.classList.add('lit'),
  });

  // Timeline track draws itself as you scroll
  gsap.fromTo('.timeline-line', { scaleY: 0 }, {
    scaleY: 1, transformOrigin: 'top', ease: 'none',
    scrollTrigger: { trigger: '.timeline-wrap', start: 'top 75%', end: 'bottom 60%', scrub: true },
  });

  // Magnetic buttons (mouse only)
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn, .proj-link').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
