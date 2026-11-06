/* ===== LOADER — short, skipped on repeat visits and for reduced motion ===== */
(function () {
  const loader = document.getElementById('loader');
  const pct = document.getElementById('loader-pct');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false;
  try { seen = sessionStorage.getItem('loader_seen') === '1'; sessionStorage.setItem('loader_seen', '1'); } catch (e) {}

  function startRpm() {
    setTimeout(() => {
      const rpmBar = document.getElementById('rpm-bar');
      if (rpmBar) rpmBar.style.width = '86%';
    }, 300);
  }

  if (!loader) { startRpm(); return; }
  if (reduce || seen) { loader.classList.add('hidden'); startRpm(); return; }

  const DURATION = 900; // was 2100ms after full page load; don't make recruiters wait
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min(100, Math.round(((now - t0) / DURATION) * 100));
    if (pct) pct.textContent = p + '%';
    if (p < 100) requestAnimationFrame(tick);
  })(t0);

  setTimeout(() => { loader.classList.add('hidden'); startRpm(); }, DURATION);
})();

/* ===== CUSTOM CURSOR — pointer devices only (fix #2) ===== */
if (window.matchMedia('(pointer: fine)').matches) {
  document.body.classList.add('has-pointer');

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  }, { passive: true });

  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .btn, .chip, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
      ring.style.borderColor = 'rgba(225,29,44,0.9)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.borderColor = 'rgba(225,29,44,0.7)';
    });
  });
}

/* ===== PARTICLES — 40 on desktop, 0 on touch/mobile (fix #11) ===== */
const canvas = document.getElementById('particles');
const isTouch = window.matchMedia('(pointer: coarse)').matches;

if (!isTouch) {
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COLORS = ['#e11d2c', '#ff4757', '#9b0a15', '#dc2626', '#b91c1c'];
  const COUNT = 40;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function Particle() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.45; this.vy = (Math.random() - 0.5) * 0.45;
    this.r = Math.random() * 1.6 + 0.4;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.35 + 0.1;
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = p.color + Math.floor((1 - dist / 120) * 0.12 * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
} else {
  // Hide canvas entirely on touch devices
  canvas.style.display = 'none';
}

/* ===== INTERSECTION OBSERVER – stack cards ===== */
const stackObs = new IntersectionObserver((entries) => {
  entries.forEach((en, i) => {
    if (en.isIntersecting) {
      setTimeout(() => en.target.classList.add('visible'), i * 80);
      stackObs.unobserve(en.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.stack-card').forEach(el => stackObs.observe(el));

/* ===== INTERSECTION OBSERVER – project cards ===== */
const cardObs = new IntersectionObserver((entries) => {
  entries.forEach((en, i) => {
    if (en.isIntersecting) {
      setTimeout(() => en.target.classList.add('visible'), i * 120);
      cardObs.unobserve(en.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.project-card').forEach(el => cardObs.observe(el));

/* ===== INTERSECTION OBSERVER – timeline items ===== */
const timelineObs = new IntersectionObserver((entries) => {
  entries.forEach((en, i) => {
    if (en.isIntersecting) {
      setTimeout(() => en.target.classList.add('visible'), i * 200);
      timelineObs.unobserve(en.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.timeline-item').forEach(el => timelineObs.observe(el));

/* ===== INTERSECTION OBSERVER – section headers ===== */
const secHeaderObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add('visible');
      secHeaderObs.unobserve(en.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.sec-header').forEach(el => secHeaderObs.observe(el));

/* ===== INTERSECTION OBSERVER – contact cards ===== */
const contactObs = new IntersectionObserver((entries) => {
  entries.forEach((en, i) => {
    if (en.isIntersecting) {
      setTimeout(() => en.target.classList.add('visible'), i * 100);
      contactObs.unobserve(en.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.contact-card').forEach(el => contactObs.observe(el));

/* ===== HAMBURGER MENU — class-based toggle (fix #1) ===== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}
/* ===== SCROLL PROGRESS BAR ===== */
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  let ticking = false;

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  updateProgress();
})();

/* ===== NAV ACTIVE-SECTION INDICATOR ===== */
(function () {
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'))
    .filter(a => a.getAttribute('href').length > 1);
  if (!navAnchors.length) return;

  const linkBySection = new Map();
  navAnchors.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) linkBySection.set(section, a);
  });

  const navSectionObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const link = linkBySection.get(en.target);
      if (!link) return;
      if (en.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' });

  linkBySection.forEach((_, section) => navSectionObs.observe(section));
})();

/* ===== WHATSAPP LINK OBFUSCATION ===== */
document.querySelectorAll('.wa-link').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    const num = el.dataset.wa;
    if (num) window.open('https://wa.me/' + num, '_blank', 'noopener');
  });
});

/* ===== COOKIE CONSENT (Microsoft Clarity) =====
   Clarity is only loaded after the visitor accepts, so nothing is tracked before consent. */
(function () {
  const STORAGE_KEY = 'clarity_consent';
  const CLARITY_ID = 'x92de1m5vc';
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');

  function getStored() { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }
  function setStored(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {} }

  function loadClarity() {
    if (window.clarity) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
    window.clarity('consent');
  }

  function hideBanner() { if (banner) banner.classList.add('hidden'); }

  const stored = getStored();
  if (stored !== null) {
    if (stored === 'granted') loadClarity();
    hideBanner();
  }

  if (acceptBtn) acceptBtn.addEventListener('click', () => { setStored('granted'); loadClarity(); hideBanner(); });
  if (declineBtn) declineBtn.addEventListener('click', () => { setStored('denied'); hideBanner(); });
})();
