/* ===== LOADER ===== */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2100);
});

/* ===== CUSTOM CURSOR ===== */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top = my + 'px';
});

function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
}
animRing();

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

/* ===== PARTICLES ===== */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H, particles = [];
const COLORS = ['#e11d2c', '#ff4757', '#9b0a15', '#dc2626', '#b91c1c'];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function Particle() {
  this.x = Math.random() * W;
  this.y = Math.random() * H;
  this.vx = (Math.random() - 0.5) * 0.6;
  this.vy = (Math.random() - 0.5) * 0.6;
  this.r = Math.random() * 2.5 + 0.8;
  this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  this.alpha = Math.random() * 0.5 + 0.2;
}

for (let i = 0; i < 90; i++) particles.push(new Particle());

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x, dy = p.y - q.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = p.color + Math.floor((1 - dist / 130) * 0.2 * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ===== INTERSECTION OBSERVER – skill bars ===== */
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('visible');
      const bar = en.target.querySelector('.skill-bar');
      if (bar) {
        setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 200);
      }
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.skill-item').forEach(el => skillObs.observe(el));

/* ===== INTERSECTION OBSERVER – project cards ===== */
const cardObs = new IntersectionObserver((entries) => {
  entries.forEach((en, i) => {
    if (en.isIntersecting) {
      setTimeout(() => en.target.classList.add('visible'), i * 100);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.project-card').forEach(el => cardObs.observe(el));

/* ===== INTERSECTION OBSERVER – edu cards ===== */
const eduObs = new IntersectionObserver((entries) => {
  entries.forEach((en, i) => {
    if (en.isIntersecting) {
      setTimeout(() => en.target.classList.add('visible'), i * 150);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.edu-card').forEach(el => eduObs.observe(el));

/* ===== HAMBURGER MENU ===== */
document.getElementById('hamburger')?.addEventListener('click', () => {
  const ul = document.querySelector('.nav-links');
  if (ul.style.display === 'flex') {
    ul.style.display = 'none';
  } else {
    ul.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:100%;right:0;background:rgba(7,7,15,0.97);padding:1.5rem 2rem;gap:1.5rem;border:1px solid rgba(255,255,255,0.07);border-radius:0 0 12px 12px;width:100%;left:0;';
  }
});
