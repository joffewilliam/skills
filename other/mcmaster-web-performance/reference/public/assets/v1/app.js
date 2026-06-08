// Prefetch-on-hover client navigation - the core "feels instant" trick.
// Hover/touch/focus an internal link -> fetch its fragment and memoize it.
// Click -> swap #app from cache, pushState, sync the active sidebar item. No reload.
(function () {
  'use strict';
  var cache = new Map();          // href -> Promise<html>, fetched at most once
  var app = document.getElementById('app');
  var flash = document.getElementById('flash');

  function note(msg) {
    if (!flash) return;
    flash.textContent = msg; flash.classList.add('on');
    clearTimeout(note._t); note._t = setTimeout(function () { flash.classList.remove('on'); }, 1000);
  }
  function fragUrl(href) { return href === '/' ? '/fragment/home' : '/fragment' + href; }
  function prefetch(href) {
    if (cache.has(href)) return cache.get(href);
    var pr = fetch(fragUrl(href), { headers: { 'x-fragment': '1' } }).then(function (r) { return r.text(); });
    cache.set(href, pr);
    return pr;
  }
  function setActive(href) {
    document.querySelectorAll('.sidebar a[data-nav]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === href);
    });
  }
  function navLink(e) { return e.target.closest && e.target.closest('a[data-nav]'); }

  ['mouseover', 'focusin'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { var a = navLink(e); if (a) prefetch(a.getAttribute('href')); });
  });
  document.addEventListener('touchstart', function (e) { var a = navLink(e); if (a) prefetch(a.getAttribute('href')); }, { passive: true });

  document.addEventListener('click', function (e) {
    var a = navLink(e);
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    var href = a.getAttribute('href'), t = performance.now();
    prefetch(href).then(function (html) {
      app.innerHTML = html;
      history.pushState({ href: href }, '', href);
      setActive(href); window.scrollTo(0, 0);
      note('navigated in ' + Math.round(performance.now() - t) + 'ms');
    });
  });

  window.addEventListener('popstate', function () {
    var href = location.pathname;
    prefetch(href).then(function (html) { app.innerHTML = html; setActive(href); });
  });

  history.replaceState({ href: location.pathname }, '', location.href);
  setActive(location.pathname);
})();
