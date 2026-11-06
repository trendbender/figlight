/*!
 * figlight 1.0.1: a tiny lightbox that keeps your captions.
 * https://github.com/trendbender/figlight
 * MIT License. Free for any use, commercial included.
 *
 * No dependencies, no build step, no network calls. Injects its own styles.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.figlight = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULTS = {
    /* Which images open. Any CSS selector. */
    selector: 'figure img',
    /* Images narrower than this are treated as icons and ignored. 0 disables the check. */
    minWidth: 400,
    /* Where the caption comes from: 'figcaption' | 'alt' | function(img) -> html string */
    caption: 'figcaption',
    /* Arrows, swipe and the counter. */
    gallery: true,
    /* Add a zoom-in cursor to images that will open. */
    markCursor: true,
    /* Visible labels, for translation. */
    labels: {close: 'Close', prev: 'Previous image', next: 'Next image'},
    /* Prefix for every class name, in case of a collision. */
    prefix: 'fl'
  };

  var CSS = function (p) {
    return '' +
      '.' + p + '-back{position:fixed;inset:0;z-index:9999;background:rgba(10,10,12,.92);display:flex;' +
        'flex-direction:column;align-items:center;justify-content:center;padding:24px;overscroll-behavior:contain}' +
      '.' + p + '-back img{max-width:100%;max-height:calc(100vh - 150px);width:auto;height:auto;margin:0;' +
        'border-radius:6px;box-shadow:0 10px 40px rgba(0,0,0,.5);background:#222}' +
      '.' + p + '-cap{color:#f2f2f2;font:14px/1.5 system-ui,sans-serif;max-width:900px;margin-top:14px;text-align:center}' +
      '.' + p + '-cap a{color:#cfe3ff}' +
      '.' + p + '-x,.' + p + '-p,.' + p + '-n{position:absolute;border:0;background:rgba(255,255,255,.14);' +
        'color:#fff;cursor:pointer;border-radius:999px;font:400 22px/1 system-ui,sans-serif;width:44px;height:44px;' +
        'display:flex;align-items:center;justify-content:center}' +
      '.' + p + '-x{top:16px;right:16px}' +
      '.' + p + '-p{left:16px;top:50%;margin-top:-22px}' +
      '.' + p + '-n{right:16px;top:50%;margin-top:-22px}' +
      '.' + p + '-x:hover,.' + p + '-p:hover,.' + p + '-n:hover{background:rgba(255,255,255,.28)}' +
      '.' + p + '-i{position:absolute;top:22px;left:20px;color:#bbb;font:13px/1 system-ui,sans-serif}' +
      '.' + p + '-open{cursor:zoom-in}' +
      '@media(max-width:640px){.' + p + '-p,.' + p + '-n{display:none}}';
  };

  function create(options) {
    var o = {};
    var k;
    for (k in DEFAULTS) if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) o[k] = DEFAULTS[k];
    for (k in (options || {})) if (Object.prototype.hasOwnProperty.call(options, k)) o[k] = options[k];
    o.labels = Object.assign({}, DEFAULTS.labels, (options || {}).labels || {});

    var p = o.prefix;
    var style = document.createElement('style');
    style.textContent = CSS(p);
    document.head.appendChild(style);

    var list = [], at = -1, back = null, lastFocus = null, startX = null;

    function collect() {
      list = [].slice.call(document.querySelectorAll(o.selector)).filter(function (im) {
        return !o.minWidth || im.naturalWidth === 0 || im.naturalWidth > o.minWidth;
      });
    }

    /** Largest candidate in srcset, otherwise the plain src. */
    function bigSrc(im) {
      var set = im.getAttribute('srcset');
      if (set) {
        var best = null, bw = -1;
        set.split(',').forEach(function (part) {
          var bits = part.trim().split(/\s+/);
          var w = parseInt((bits[1] || '').replace('w', ''), 10) || 0;
          if (w >= bw) { bw = w; best = bits[0]; }
        });
        if (best) return best;
      }
      return im.currentSrc || im.src;
    }

    function captionOf(im) {
      if (typeof o.caption === 'function') return o.caption(im) || '';
      if (o.caption === 'alt') return escapeHtml(im.getAttribute('alt') || '');
      var fig = im.closest('figure');
      var cap = fig && fig.querySelector('figcaption');
      return cap ? cap.innerHTML : escapeHtml(im.getAttribute('alt') || '');
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c];
      });
    }

    function show(i) {
      if (!back) return;
      at = (i + list.length) % list.length;
      var im = list[at];
      var pic = back.querySelector('img');
      pic.src = bigSrc(im);
      pic.alt = im.getAttribute('alt') || '';
      back.querySelector('.' + p + '-cap').innerHTML = captionOf(im);
      var counter = back.querySelector('.' + p + '-i');
      if (counter) counter.textContent = (at + 1) + ' / ' + list.length;
    }

    function close() {
      if (!back) return;
      back.remove();
      back = null;
      document.documentElement.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function open(i) {
      lastFocus = document.activeElement;
      back = document.createElement('div');
      back.className = p + '-back';
      back.setAttribute('role', 'dialog');
      back.setAttribute('aria-modal', 'true');
      var nav = (o.gallery && list.length > 1)
        ? '<span class="' + p + '-i"></span>' +
          '<button type="button" class="' + p + '-p" aria-label="' + escapeHtml(o.labels.prev) + '">&#8249;</button>' +
          '<button type="button" class="' + p + '-n" aria-label="' + escapeHtml(o.labels.next) + '">&#8250;</button>'
        : '';
      back.innerHTML = nav +
        '<button type="button" class="' + p + '-x" aria-label="' + escapeHtml(o.labels.close) + '">&times;</button>' +
        '<img alt=""><div class="' + p + '-cap"></div>';
      back.addEventListener('click', function (ev) {
        if (ev.target === back || ev.target.closest('.' + p + '-x')) return close();
        if (ev.target.closest('.' + p + '-p')) return show(at - 1);
        if (ev.target.closest('.' + p + '-n')) return show(at + 1);
      });
      document.body.appendChild(back);
      document.documentElement.style.overflow = 'hidden';
      back.querySelector('.' + p + '-x').focus();
      show(i);
    }

    function onClick(ev) {
      var im = ev.target.closest && ev.target.closest(o.selector);
      if (!im || ev.target.closest('a')) return;   // an image inside a link belongs to the link
      collect();
      var i = list.indexOf(im);
      if (i < 0) return;
      ev.preventDefault();
      open(i);
    }

    function onKey(ev) {
      if (!back) return;
      if (ev.key === 'Escape') close();
      else if (o.gallery && ev.key === 'ArrowLeft') show(at - 1);
      else if (o.gallery && ev.key === 'ArrowRight') show(at + 1);
    }

    function onTouchStart(ev) { if (back) startX = ev.touches[0].clientX; }
    function onTouchEnd(ev) {
      if (!back || startX === null || !o.gallery) { startX = null; return; }
      var dx = ev.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 60) show(at + (dx < 0 ? 1 : -1));
      startX = null;
    }

    function mark() {
      collect();
      if (o.markCursor) list.forEach(function (im) { im.classList.add(p + '-open'); });
    }

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('touchstart', onTouchStart, {passive: true});
    document.addEventListener('touchend', onTouchEnd, {passive: true});
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mark);
    else mark();
    window.addEventListener('load', mark);

    return {
      open: open,
      close: close,
      refresh: mark,
      destroy: function () {
        close();
        document.removeEventListener('click', onClick);
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('touchstart', onTouchStart);
        document.removeEventListener('touchend', onTouchEnd);
        style.remove();
      }
    };
  }

  /* A plain <script> tag starts with the defaults unless it opts out with data-figlight="manual".
     An import or require has no current script, so it never starts on its own: call create(). */
  var api = {create: create, version: '1.0.1'};
  if (typeof document !== 'undefined') {
    var tag = document.currentScript;
    if (tag && tag.dataset.figlight !== 'manual') api.auto = create();
  }
  return api;
}));
