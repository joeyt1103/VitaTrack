/* ═══════════════════════════════════════════════════════════════════
   script.js — VitaTrack Apple-style animations & interactions
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Scroll Progress Bar ──────────────────────────────────────── */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scrollProgress';
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
    }, { passive: true });
  }

  /* ─── Nav Scroll Effect ────────────────────────────────────────── */
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      lastScrollY = y;
    }, { passive: true });
  }

  /* ─── Mobile Hamburger Menu ────────────────────────────────────── */
  function initMobileMenu() {
    const btn = document.getElementById('navHamburger');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      const isOpen = menu.classList.contains('open');
      menu.classList.toggle('open');
      btn.classList.toggle('open');
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close on link click
    menu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open') &&
          !menu.contains(e.target) &&
          !btn.contains(e.target)) {
        menu.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ─── Smooth Scroll for Anchor Links ──────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navH = document.getElementById('nav')?.offsetHeight || 52;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ─── Scroll Reveal (IntersectionObserver) ─────────────────────── */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = parseInt(el.dataset.revealDelay || '0', 10);

        setTimeout(() => {
          el.classList.add('visible');
          // Trigger nested animations once element is visible
          triggerNestedAnimations(el);
        }, delay);

        observer.unobserve(el);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -48px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  /* ─── Nested: counter, ring, bar fill ─────────────────────────── */
  function triggerNestedAnimations(el) {
    // Counters
    el.querySelectorAll('[data-count]').forEach(animateCounter);
    // Ring arcs
    el.querySelectorAll('.ring-arc').forEach(animateRing);
    // Macro bars
    el.querySelectorAll('.macro-bar-fill').forEach(animateBar);
  }

  /* ─── Number Counter ───────────────────────────────────────────── */
  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = 'true';

    const target = parseInt(el.dataset.count, 10);
    if (target === 0) { el.textContent = '0'; return; }

    const duration = 1600;
    const start = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutExpo(progress) * target);
      el.textContent = value >= 1000000
        ? (value / 1000000).toFixed(1) + 'M'
        : value.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ─── SVG Ring Arc ─────────────────────────────────────────────── */
  function animateRing(arc) {
    if (arc.dataset.animated) return;
    arc.dataset.animated = 'true';

    const targetOffset = parseFloat(arc.dataset.offset || '0');
    // Brief delay so the transition fires after element is visible
    requestAnimationFrame(() => {
      arc.style.strokeDashoffset = targetOffset;
    });
  }

  /* ─── Macro Bar Fill ───────────────────────────────────────────── */
  function animateBar(bar) {
    if (bar.dataset.animated) return;
    bar.dataset.animated = 'true';

    const targetW = parseFloat(bar.dataset.fillW || '0');
    requestAnimationFrame(() => {
      bar.style.width = targetW + '%';
    });
  }

  /* ─── Stats Section observer ────────────────────────────────────── */
  function initStats() {
    const statNums = document.querySelectorAll('.stat-num');
    if (!statNums.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    statNums.forEach(el => observer.observe(el));
  }

  /* ─── Hero Phone Parallax (mouse tracking) ─────────────────────── */
  function initPhoneParallax() {
    const frame = document.getElementById('phoneFrame');
    const phone = document.getElementById('heroPhone');
    if (!frame || !phone) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let raf;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      currentX = lerp(currentX, targetX, 0.08);
      currentY = lerp(currentY, targetY, 0.08);

      phone.style.transform = `
        translateX(${currentX * 0.4}px)
        translateY(${currentY * 0.4}px)
        rotateY(${currentX * 0.02}deg)
        rotateX(${-currentY * 0.015}deg)
      `;

      raf = requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = (e.clientX - cx) / cx * 12;
      targetY = (e.clientY - cy) / cy * 10;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    raf = requestAnimationFrame(animate);
  }

  /* ─── Magnetic Buttons ─────────────────────────────────────────── */
  function initMagneticButtons() {
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      let raf;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.22;

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
        });
      });

      btn.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        setTimeout(() => { btn.style.transition = ''; }, 400);
      });
    });
  }

  /* ─── Feature Card Hover 3D Tilt ──────────────────────────────── */
  function initCardTilt() {
    document.querySelectorAll('.feature-card, .health-item').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        card.style.transform =
          `translateY(-8px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) scale(1.01)`;
        card.style.boxShadow = `
          ${-x * 16}px ${-y * 16 + 20}px 60px rgba(0,0,0,0.12),
          0 4px 20px rgba(0,0,0,0.06)
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.transition =
          'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.5s ease';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  }

  /* ─── Marquee Pause on Hover ───────────────────────────────────── */
  function initMarquee() {
    const track = document.getElementById('marqueeTrack');
    if (!track) return;

    const content = track.querySelector('.marquee-content');
    if (!content) return;

    track.addEventListener('mouseenter', () => {
      content.style.animationPlayState = 'paused';
    });

    track.addEventListener('mouseleave', () => {
      content.style.animationPlayState = 'running';
    });
  }

  /* ─── Ripple effect on buttons ─────────────────────────────────── */
  function initRipple() {
    document.querySelectorAll('.btn-appstore').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
          position:absolute;
          width:${size}px;height:${size}px;
          left:${x}px;top:${y}px;
          border-radius:50%;
          background:rgba(255,255,255,0.2);
          pointer-events:none;
          transform:scale(0);
          animation:ripple-expand 0.6s ease forwards;
        `;

        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });

    // Inject ripple keyframes
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes ripple-expand {
          to { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ─── Hero section scroll fade ─────────────────────────────────── */
  function initHeroScrollFade() {
    const hero = document.getElementById('hero');
    const heroText = hero?.querySelector('.hero-text');
    if (!hero || !heroText) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const heroH = hero.offsetHeight;
      const progress = Math.min(scrolled / (heroH * 0.5), 1);

      heroText.style.opacity = 1 - progress * 0.6;
      heroText.style.transform = `translateY(${progress * -20}px)`;
    }, { passive: true });
  }

  /* ─── Section entrance stagger ─────────────────────────────────── */
  function initStagger() {
    // Give feature cards slightly different delays when their row enters
    const grids = document.querySelectorAll('.features-grid, .health-grid');
    grids.forEach(grid => {
      const cards = grid.querySelectorAll('.reveal');
      cards.forEach((card, i) => {
        if (!card.dataset.revealDelay) {
          card.dataset.revealDelay = String(i * 80);
        }
      });
    });
  }

  /* ─── Privacy card entrance animation ─────────────────────────── */
  function initPrivacyRows() {
    const rows = document.querySelectorAll('.privacy-row');
    const parent = document.querySelector('.privacy-card');
    if (!parent) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        rows.forEach((row, i) => {
          setTimeout(() => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            row.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            requestAnimationFrame(() => {
              row.style.opacity = '1';
              row.style.transform = 'translateX(0)';
            });
          }, i * 80);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    observer.observe(parent);
  }

  /* ─── Active nav link highlight ────────────────────────────────── */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === '#' + id;
          link.style.color = isActive ? 'var(--text-primary)' : '';
          link.style.fontWeight = isActive ? '500' : '';
        });
      });
    }, { threshold: 0.35, rootMargin: '-52px 0px 0px 0px' });

    sections.forEach(section => observer.observe(section));
  }

  /* ─── Init All ─────────────────────────────────────────────────── */
  function init() {
    initScrollProgress();
    initNavScroll();
    initMobileMenu();
    initSmoothScroll();
    initStagger();
    initScrollReveal();
    initStats();
    initPhoneParallax();
    initMagneticButtons();
    initCardTilt();
    initMarquee();
    initRipple();
    initHeroScrollFade();
    initPrivacyRows();
    initActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
