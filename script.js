/* ===== LOADER with percentage counter ===== */
window.addEventListener('load', () => {
  const pct = document.getElementById('loader-pct');
  let count = 0;
  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 8) + 3;
    if (count >= 100) { count = 100; clearInterval(interval); }
    if (pct) pct.textContent = count + '%';
  }, 60);

  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    // Animate RPM bar after loader
    setTimeout(() => {
      const rpmBar = document.getElementById('rpm-bar');
      if (rpmBar) rpmBar.style.width = '86%';
    }, 400);
  }, 2100);
});

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

/* ===== INTERSECTION OBSERVER – skill bars (fix #10: unobserve after firing) ===== */
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('visible');
      const bar = en.target.querySelector('.skill-bar');
      if (bar) setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 200);
      skillObs.unobserve(en.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.skill-item').forEach(el => skillObs.observe(el));

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
