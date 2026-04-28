(() => {
  'use strict';

  // ── Mobile navigation toggle ──────────────────────────────────────────────
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  // ── Code-tab switcher (format tabs on examples/landing) ───────────────────
  // Language tabs (data-lang-group) and format tabs (data-fmt-group) each sync
  // globally within their own group type when a tab is clicked.
  let activeLang = 'js';
  let activeFmt  = 'json';
  let syncing = false;

  function applyTab(tabBtns, panelEls, targetTab) {
    tabBtns.forEach(t => {
      const active = t.dataset.tab === targetTab;
      t.className = active ? 'tab-btn-active flex-shrink-0' : 'tab-btn-inactive flex-shrink-0';
      t.setAttribute('aria-selected', String(active));
    });
    panelEls.forEach(p => {
      p.classList.toggle('hidden', p.dataset.panel !== targetTab);
    });
  }

  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const groupName   = group.dataset.tabGroup;
    const tabs        = group.querySelectorAll('[data-tab]');
    const panels      = document.querySelectorAll(`[data-panel-group="${groupName}"] [data-panel]`);
    const isLangGroup = group.hasAttribute('data-lang-group');
    const isFmtGroup  = group.hasAttribute('data-fmt-group');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        const lang   = tab.dataset.lang;
        const fmt    = tab.dataset.fmt;

        applyTab(tabs, panels, target);

        if (!syncing) {
          if (isLangGroup && lang) {
            syncing = true;
            activeLang = lang;
            document.querySelectorAll('[data-lang-group]').forEach(otherGroup => {
              if (otherGroup === group) return;
              const matchBtn = [...otherGroup.querySelectorAll('[data-tab]')]
                .find(t => t.dataset.lang === lang);
              if (matchBtn && matchBtn.getAttribute('aria-selected') !== 'true') {
                matchBtn.click();
              }
            });
            syncing = false;
          }

          if (isFmtGroup && fmt) {
            syncing = true;
            activeFmt = fmt;
            document.querySelectorAll('[data-fmt-group]').forEach(otherGroup => {
              if (otherGroup === group) return;
              const matchBtn = [...otherGroup.querySelectorAll('[data-tab]')]
                .find(t => t.dataset.fmt === fmt);
              if (matchBtn && matchBtn.getAttribute('aria-selected') !== 'true') {
                matchBtn.click();
              }
            });
            syncing = false;
          }
        }
      });
    });
  });

  // ── Smooth active nav highlight ────────────────────────────────────────────
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-href]').forEach(el => {
    if (el.dataset.navHref === currentPath) {
      el.classList.remove('nav-link');
      el.classList.add('nav-link-active');
    }
  });

  // ── Scroll-spy for anchor sections (landing page only) ────────────────────
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const link = document.querySelector(`[data-anchor="${entry.target.id}"]`);
          if (link) {
            link.classList.toggle('text-lex-600', entry.isIntersecting);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    sections.forEach(s => observer.observe(s));
  }

  // ── Copy-to-clipboard for code blocks ─────────────────────────────────────
  document.querySelectorAll('[data-copy-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copyBtn;
      const target = document.getElementById(targetId);
      if (!target) return;

      navigator.clipboard.writeText(target.innerText.trim()).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        setTimeout(() => { btn.innerHTML = original; }, 1800);
      });
    });
  });
})();
