/* =========================================================================
   প্রিয়জন প্ল্যান — Dark mode toggle
   Persists the visitor's theme choice in localStorage and applies it
   instantly (a pre-paint snippet in base.html already avoids the flash).
   ========================================================================= */

(function (window) {
  'use strict';

  var STORAGE_KEY = 'ppplan_theme';

  function getTheme() {
    var stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  }

  function applyTheme() {
    var theme = getTheme();
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    var icon = document.getElementById('theme-toggle-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';

    var toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function toggleTheme() {
    window.localStorage.setItem(STORAGE_KEY, getTheme() === 'dark' ? 'light' : 'dark');
    applyTheme();
  }

  window.ppTheme = {
    get: getTheme,
    toggle: toggleTheme,
    apply: applyTheme,
  };

  document.addEventListener('DOMContentLoaded', applyTheme);
})(window);
