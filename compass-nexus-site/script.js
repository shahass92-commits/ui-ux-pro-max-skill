/* ══════════════════════════════════════════════════════════════
   COMPASS NEXUS iQ — Landing page behaviour
   Theme toggle · mobile menu · copy buttons
══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'cnq-theme';

  // ── Theme ──────────────────────────────────────────────────
  // No stored choice → follow the OS (no data-theme attribute).
  function readTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function saveTheme(value) {
    try { localStorage.setItem(THEME_KEY, value); } catch (e) { /* storage blocked */ }
  }
  function effectiveTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'dark' || set === 'light') return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var stored = readTheme();
  if (stored === 'dark' || stored === 'light') root.setAttribute('data-theme', stored);

  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    var label = function () {
      themeBtn.setAttribute('aria-label', effectiveTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    };
    label();
    themeBtn.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      saveTheme(next);
      label();
    });
  }

  // ── Mobile menu ────────────────────────────────────────────
  var menuBtn = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    var setOpen = function (open) {
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuBtn.addEventListener('click', function () { setOpen(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setOpen(false); menuBtn.focus(); } });
    window.matchMedia('(min-width: 1061px)').addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  }

  // ── Copy buttons ───────────────────────────────────────────
  // Falls back to selecting the text when clipboard access is refused.
  function selectText(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');
      var target = btn.parentElement.querySelector('dd');
      var done = function (text) {
        btn.textContent = text;
        setTimeout(function () { btn.textContent = 'Copy'; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { done('Copied'); }, function () {
          if (target) selectText(target);
          done('Selected');
        });
      } else {
        if (target) selectText(target);
        done('Selected');
      }
    });
  });

  // ── Footer year ────────────────────────────────────────────
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
