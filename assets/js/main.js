/* =========================================================
   Arthlens — Core interactions
   Nav toggle, accordion, tabs, cookie banner, TOC scroll-spy
   ========================================================= */
(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Mobile nav toggle ---------- */
  const toggle = $('.menu-toggle');
  const navLinks = $('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      navLinks.dataset.open = String(!open);
    });
    // Close on link tap (mobile)
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && window.matchMedia('(max-width: 900px)').matches) {
        toggle.setAttribute('aria-expanded', 'false');
        navLinks.dataset.open = 'false';
      }
    });
  }

  /* ---------- Accordion ---------- */
  $$('.accordion-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.dataset.open = String(!open);
    });
  });

  /* ---------- Tabs ---------- */
  $$('[data-tabs]').forEach((group) => {
    const tabs = $$('.tab', group);
    const panels = $$('.tab-panel', group.parentElement);
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        panels.forEach((p) => (p.dataset.active = String(p.id === target)));
      });
    });
  });

  /* ---------- TOC scroll-spy ---------- */
  const tocLinks = $$('.toc a[href^="#"]');
  if (tocLinks.length) {
    const ids = tocLinks.map((a) => a.getAttribute('href').slice(1));
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            tocLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ---------- Cookie banner ---------- */
  const KEY = 'arthlens.consent';
  const banner = $('.cookie-banner');
  if (banner) {
    const saved = localStorage.getItem(KEY);
    if (!saved) {
      setTimeout(() => (banner.dataset.open = 'true'), 800);
    }
    banner.addEventListener('click', (e) => {
      const act = e.target.closest('[data-consent]');
      if (!act) return;
      localStorage.setItem(KEY, act.dataset.consent);
      banner.dataset.open = 'false';
    });
  }

  /* ---------- Reveal on scroll (optional) ---------- */
  const revealEls = $$('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.dataset.revealed = 'true';
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Sticky mobile ad: dismissable + body padding ---------- */
  const stickyAd = $('.ad-sticky-mobile');
  if (stickyAd) {
    const DISMISS_KEY = 'arthlens.stickyAd.dismissed';
    if (sessionStorage.getItem(DISMISS_KEY) === '1') {
      stickyAd.dataset.dismissed = 'true';
    } else if (window.matchMedia('(max-width: 900px)').matches) {
      document.body.classList.add('has-sticky-ad');
    }
    const closeBtn = $('.close', stickyAd);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        stickyAd.dataset.dismissed = 'true';
        document.body.classList.remove('has-sticky-ad');
        try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (_) {}
      });
    }
  }

  /* ---------- Read-progress bar (article pages) ---------- */
  const rp = $('#read-progress');
  if (rp) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      rp.style.width = pct + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Current-year in footer ---------- */
  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
