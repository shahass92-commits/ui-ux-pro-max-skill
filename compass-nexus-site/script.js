/* ═══════════════════════════════════════════
   COMPASS NEXUS — Interactive JS
   Butterfly canvas · Counters · Mobile nav
════════════════════════════════════════════= */

// ── Butterfly Canvas ──────────────────────────
(function() {
  const canvas = document.getElementById('butterfly-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, butterflies = [], raf;

  // Reduce motion guard
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) { canvas.style.display = 'none'; return; }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // ── Butterfly class ────────────────────────
  class Butterfly {
    constructor() { this.reset(true); }

    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : (Math.random() > 0.5 ? -60 : H + 60);
      this.size    = 6 + Math.random() * 14;
      this.speed   = 0.3 + Math.random() * 0.7;
      this.drift   = (Math.random() - 0.5) * 0.6;
      this.phase   = Math.random() * Math.PI * 2;
      this.flapSpd = 2 + Math.random() * 4;
      this.alpha   = 0.08 + Math.random() * 0.18;
      this.hue     = [
        [245, 158, 11],   // amber
        [20,  184, 166],  // teal
        [167, 139, 250],  // violet
        [236,  72, 153],  // pink
      ][Math.floor(Math.random() * 4)];
      this.angle   = Math.random() * Math.PI * 2;
      this.wobble  = 0;
    }

    draw(t) {
      this.wobble += 0.01;
      this.angle  += this.drift * 0.01;
      this.x += Math.cos(this.angle) * this.speed;
      this.y -= this.speed * 0.4;
      this.y += Math.sin(this.wobble) * 0.6;

      // Flap angle: 0 = wings open flat, PI/3 = wing tips up
      const flap = Math.abs(Math.sin(t * 0.001 * this.flapSpd + this.phase));

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      const [r, g, b] = this.hue;
      const col  = `rgba(${r},${g},${b},${this.alpha})`;
      const col2 = `rgba(${r},${g},${b},${this.alpha * 0.5})`;

      // Draw two symmetrical wings using bezier curves
      // Wing span shrinks as flap angle increases (wing folding effect)
      const ws = this.size * (0.5 + 0.5 * (1 - flap));

      // Left upper wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -ws * 1.4, -ws * 0.4 - flap * ws * 0.8,
        -ws * 2.0, -ws * 0.2,
        -ws * 2.2, ws * 0.6
      );
      ctx.bezierCurveTo(
        -ws * 1.8, ws * 1.1,
        -ws * 0.6, ws * 0.9,
        0, ws * 0.4
      );
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();

      // Left lower wing
      ctx.beginPath();
      ctx.moveTo(0, ws * 0.4);
      ctx.bezierCurveTo(
        -ws * 0.8, ws * 1.2,
        -ws * 1.6, ws * 1.4,
        -ws * 1.3, ws * 2.0
      );
      ctx.bezierCurveTo(
        -ws * 0.5, ws * 2.2,
        -ws * 0.1, ws * 1.6,
        0, ws * 1.1
      );
      ctx.closePath();
      ctx.fillStyle = col2;
      ctx.fill();

      // Right upper wing (mirror)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        ws * 1.4, -ws * 0.4 - flap * ws * 0.8,
        ws * 2.0, -ws * 0.2,
        ws * 2.2, ws * 0.6
      );
      ctx.bezierCurveTo(
        ws * 1.8, ws * 1.1,
        ws * 0.6, ws * 0.9,
        0, ws * 0.4
      );
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();

      // Right lower wing
      ctx.beginPath();
      ctx.moveTo(0, ws * 0.4);
      ctx.bezierCurveTo(
        ws * 0.8, ws * 1.2,
        ws * 1.6, ws * 1.4,
        ws * 1.3, ws * 2.0
      );
      ctx.bezierCurveTo(
        ws * 0.5, ws * 2.2,
        ws * 0.1, ws * 1.6,
        0, ws * 1.1
      );
      ctx.closePath();
      ctx.fillStyle = col2;
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.ellipse(0, ws * 0.55, ws * 0.12, ws * 0.65, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha * 1.5})`;
      ctx.fill();

      // Antennae
      ctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha * 0.8})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-ws * 0.5, -ws * 1.0, -ws * 0.2, -ws * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(ws * 0.5, -ws * 1.0, ws * 0.2, -ws * 1.6);
      ctx.stroke();
      // Antenna tips
      ctx.beginPath();
      ctx.arc(-ws * 0.2, -ws * 1.6, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc( ws * 0.2, -ws * 1.6, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Recycle when off-screen
      if (this.y < -80 || this.x < -80 || this.x > W + 80) this.reset(false);
    }
  }

  function init() {
    resize();
    butterflies = [];
    const count = Math.min(22, Math.floor((W * H) / 60000));
    for (let i = 0; i < count; i++) butterflies.push(new Butterfly());
  }

  function loop(t) {
    ctx.clearRect(0, 0, W, H);
    butterflies.forEach(b => b.draw(t));
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  raf = requestAnimationFrame(loop);
})();


// ── Counter animation ─────────────────────────
function animateCounter(el, target, duration, suffix) {
  const start    = performance.now();
  const isFloat  = target % 1 !== 0;
  const decimals = isFloat ? 1 : 0;

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const val  = (target * ease).toFixed(decimals);
    el.textContent = val + (suffix || '');
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(decimals) + (suffix || '');
  }
  requestAnimationFrame(tick);
}

// ── Intersection observer for counters ────────
function setupCounters() {
  const heroVals = document.querySelectorAll('.stat-val[data-target]');
  const metricVals = document.querySelectorAll('.metric-val[data-target]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        const el     = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        // Suffix may be in adjacent span for hero stats
        animateCounter(el, target, 2000, '');
      }
    });
  }, { threshold: 0.3 });

  [...heroVals, ...metricVals].forEach(el => obs.observe(el));
}

// ── Mobile nav toggle ─────────────────────────
function setupMobileNav() {
  const btn  = document.getElementById('mobile-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('open');
  });

  // Close on link click
  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    }
  });
}

// ── Nav scroll shadow ─────────────────────────
function setupNavShadow() {
  const wrapper = document.querySelector('.nav-wrapper');
  if (!wrapper) return;
  const onScroll = () => {
    wrapper.style.paddingTop = window.scrollY > 20 ? '8px' : '16px';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Bento card entrance animations ────────────
function setupBentoReveal() {
  const cards = document.querySelectorAll('.bento-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = Array.from(cards).indexOf(entry.target) * 60;
        entry.target.style.transitionDelay = `${delay}ms`;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(24px)';
    c.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    obs.observe(c);
  });
}

// ── Boot ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupCounters();
  setupMobileNav();
  setupNavShadow();
  setupBentoReveal();
});
