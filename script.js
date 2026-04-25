/**
 * script.js — Madhuke Jayalath | Premium Finance Website
 * Handles: Loading, Theme, Navbar, Cursor, Canvas, Typing, Counters,
 *          Scroll Reveal, Tilt Cards, Magnetic Buttons, Form Validation
 * Author: MJ Web Studio | Version: 1.0
 */

/* ═══════════════════════════════════════════════════════════════════
   UTILS
   ═══════════════════════════════════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/* ═══════════════════════════════════════════════════════════════════
   1. LOADING SCREEN
   ═══════════════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  // Ensure minimum display time for premium feel
  const minDelay = 1800;
  const startTime = Date.now();

  window.addEventListener('load', () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDelay - elapsed);

    setTimeout(() => {
      loader.classList.add('hidden');
      // Trigger initial animations after loader is gone
      setTimeout(() => {
        triggerHeroAnimations();
      }, 200);
    }, remaining);
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   2. THEME TOGGLE (Dark / Light) with localStorage
   ═══════════════════════════════════════════════════════════════════ */
(function initTheme() {
  const html = document.documentElement;
  const btn  = $('#themeToggle');
  if (!btn) return;

  // Load saved preference or default to dark
  const saved = localStorage.getItem('mj-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';

    // Brief flash overlay for dramatic transition
    const overlay = document.createElement('div');
    overlay.className = 'theme-transition-overlay';
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '0.06';
      setTimeout(() => {
        html.setAttribute('data-theme', next);
        localStorage.setItem('mj-theme', next);
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      }, 150);
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   3. NAVBAR — scroll behaviour + active link
   ═══════════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileMenu= $('#mobileMenu');
  const navLinks  = $$('.nav-link');
  const mobLinks  = $$('.mob-link');
  const backToTop = $('#backToTop');
  let   ticking   = false;

  // Scroll handler
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;

        // Sticky solid background
        navbar.classList.toggle('scrolled', y > 40);

        // Back to top visibility
        if (backToTop) backToTop.classList.toggle('visible', y > 400);

        // Active nav link based on scroll position
        const sections = $$('section[id]');
        sections.forEach(sec => {
          const top    = sec.offsetTop - 100;
          const bottom = top + sec.offsetHeight;
          const id     = sec.getAttribute('id');

          if (y >= top && y < bottom) {
            navLinks.forEach(l => l.classList.toggle('active', l.dataset.nav === id));
          }
        });

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      mobileMenu.setAttribute('aria-hidden', !open);
      hamburger.setAttribute('aria-expanded', open);
    });

    // Close on link click
    mobLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Back to top
  if (backToTop) {
    backToTop.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Footer year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ═══════════════════════════════════════════════════════════════════
   4. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════════════ */
(function initCursor() {
  // Only on pointer devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  const cursor = $('#cursor');
  const trail  = $('#cursorTrail');
  if (!cursor || !trail) return;

  let curX = 0, curY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', e => {
    curX = e.clientX;
    curY = e.clientY;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
  });

  // Smooth trailing cursor
  function animateTrail() {
    trailX += (curX - trailX) * 0.15;
    trailY += (curY - trailY) * 0.15;
    trail.style.left = trailX + 'px';
    trail.style.top  = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Hover state on interactive elements
  const hoverEls = $$('a, button, .service-card, .insight-card, .comp-tile, input, textarea');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   5. HERO PARTICLE CANVAS
   ═══════════════════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = Math.random() * 1.5 + 0.3;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = (Math.random() - 0.5) * 0.3;
      this.alpha= Math.random() * 0.5 + 0.1;
      this.gold = Math.random() > 0.6;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.fillStyle = this.gold
        ? `rgba(201, 168, 76, ${this.alpha})`
        : isDark
          ? `rgba(61, 127, 255, ${this.alpha * 0.6})`
          : `rgba(13, 27, 53, ${this.alpha * 0.3})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = clamp(Math.floor((W * H) / 10000), 40, 120);
    particles = Array.from({ length: count }, () => new Particle());
  }

  // Draw connecting lines between nearby particles
  function drawLines() {
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const a = (1 - dist / maxDist) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
          ctx.strokeStyle = isDark
            ? `rgba(201, 168, 76, ${a})`
            : `rgba(13, 27, 53, ${a * 0.5})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    animId = requestAnimationFrame(tick);
  }

  resize();
  initParticles();
  tick();

  const ro = new ResizeObserver(() => {
    resize();
    initParticles();
  });
  ro.observe(canvas);
})();

/* ═══════════════════════════════════════════════════════════════════
   6. TYPING EFFECT
   ═══════════════════════════════════════════════════════════════════ */
(function initTyping() {
  const el = $('#typedText');
  if (!el) return;

  const words  = ['Advisory', 'Strategy', 'Analytics', 'Excellence', 'Precision'];
  let wi = 0, ci = 0, deleting = false;

  function type() {
    const word = words[wi];

    if (!deleting) {
      el.textContent = word.substring(0, ci + 1);
      ci++;
      if (ci === word.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      el.textContent = word.substring(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
      }
    }

    setTimeout(type, deleting ? 60 : 100);
  }

  setTimeout(type, 1200);
})();

/* ═══════════════════════════════════════════════════════════════════
   7. ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════════ */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start    = performance.now();

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(easeOutExpo(progress) * target);
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* ═══════════════════════════════════════════════════════════════════
   8. SCROLL REVEAL & INTERSECTION OBSERVER
   ═══════════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const revealEls = $$('.reveal-up, .reveal-left, .reveal-right');
  const counterEls= $$('.metric__num');
  const skillBars = $$('.skill-bar__fill');

  const countersStarted = new WeakSet();
  const barsStarted     = new WeakSet();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  // Counters observer
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted.has(entry.target)) {
        countersStarted.add(entry.target);
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));

  // Skill bars observer
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !barsStarted.has(entry.target)) {
        barsStarted.add(entry.target);
        entry.target.classList.add('animated');
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => barObserver.observe(bar));
})();

/* ═══════════════════════════════════════════════════════════════════
   9. HERO ENTRANCE ANIMATIONS (triggered after loader)
   ═══════════════════════════════════════════════════════════════════ */
function triggerHeroAnimations() {
  const heroReveals = $$('.hero .reveal-up');
  heroReveals.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 80);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   10. 3D TILT CARDS
   ═══════════════════════════════════════════════════════════════════ */
(function initTiltCards() {
  // Only on pointer devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  const cards = $$('.tilt-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect    = card.getBoundingClientRect();
      const cx      = rect.left + rect.width / 2;
      const cy      = rect.top  + rect.height / 2;
      const dx      = (e.clientX - cx) / (rect.width / 2);
      const dy      = (e.clientY - cy) / (rect.height / 2);
      const tiltX   = clamp(-dy * 10, -12, 12);
      const tiltY   = clamp(dx  * 10, -12, 12);

      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
      card.style.transition = 'transform 0.1s';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s var(--ease-out-expo), border-color 0.4s, box-shadow 0.4s';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   11. MAGNETIC BUTTONS
   ═══════════════════════════════════════════════════════════════════ */
(function initMagneticButtons() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  const buttons = $$('.magnetic');
  const strength = 0.3;

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx   = e.clientX - rect.left - rect.width / 2;
      const dy   = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      btn.style.transition = 'transform 0.1s';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform   = '';
      btn.style.transition  = 'transform 0.5s var(--ease-out-expo)';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   12. CONTACT FORM VALIDATION
   ═══════════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;

  function showError(input, msg) {
    input.classList.add('error');
    const err = input.closest('.form-group').querySelector('.form-error');
    if (err) err.textContent = msg;
  }

  function clearError(input) {
    input.classList.remove('error');
    const err = input.closest('.form-group').querySelector('.form-error');
    if (err) err.textContent = '';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Live validation
  $$('input, textarea', form).forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim()) clearError(input);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const name    = $('#fname');
    const email   = $('#femail');
    const subject = $('#fsubject');
    const message = $('#fmessage');

    if (!name.value.trim()) {
      showError(name, 'Please enter your full name.');
      valid = false;
    } else { clearError(name); }

    if (!email.value.trim()) {
      showError(email, 'Please enter your email address.');
      valid = false;
    } else if (!validateEmail(email.value)) {
      showError(email, 'Please enter a valid email address.');
      valid = false;
    } else { clearError(email); }

    if (!subject.value.trim()) {
      showError(subject, 'Please enter a subject.');
      valid = false;
    } else { clearError(subject); }

    if (!message.value.trim() || message.value.trim().length < 20) {
      showError(message, 'Message must be at least 20 characters.');
      valid = false;
    } else { clearError(message); }

    if (valid) {
      const btn = $('#formSubmit');
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Sending…';

      // Simulate async send (replace with actual fetch/EmailJS)
      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Send Message';
        if (success) {
          success.classList.add('visible');
          setTimeout(() => success.classList.remove('visible'), 5000);
        }
      }, 1400);
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   13. SMOOTH SCROLL for anchor links
   ═══════════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = $(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   14. RIPPLE EFFECT on buttons
   ═══════════════════════════════════════════════════════════════════ */
(function initRipple() {
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect   = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height) * 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        background: rgba(255,255,255,0.15);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-anim 0.5s linear;
        pointer-events: none;
      `;

      // Inject ripple keyframes once
      if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
          @keyframes ripple-anim {
            to { transform: scale(1); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   15. PARALLAX on hero shapes
   ═══════════════════════════════════════════════════════════════════ */
(function initParallax() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  const shapes = $$('.shape');
  const speeds = [0.03, 0.05, 0.08, 0.02];

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    shapes.forEach((shape, i) => {
      const s = speeds[i] || 0.04;
      shape.style.transform = `translate(${dx * s}px, ${dy * s}px)`;
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   16. PAGE VISIBILITY — pause canvas when hidden
   ═══════════════════════════════════════════════════════════════════ */
document.addEventListener('visibilitychange', () => {
  const canvas = $('#heroCanvas');
  if (canvas) {
    canvas.style.animationPlayState =
      document.hidden ? 'paused' : 'running';
  }
});

/* ═══════════════════════════════════════════════════════════════════
   INIT COMPLETE
   ═══════════════════════════════════════════════════════════════════ */
console.log('%c Madhuke Jayalath | Professional Website v1.0 ', 'background:#c9a84c;color:#050c1a;padding:4px 12px;border-radius:4px;font-weight:700;');
