# figlight

A tiny lightbox that keeps your captions. One file, no dependencies, **2.3 KB gzipped**.

Click a photo, it opens full screen with the caption your page already wrote — credits, licence and links included. Arrow keys and swipe move between images, `Esc` closes.

**[Live demo](https://trendbender.github.io/figlight/demo/)**

## Why another lightbox

Fancybox is the usual answer, and it is excellent — but its free licence is GPLv3, so a commercial site needs a paid one. figlight is MIT: free for anything, including commercial work, with no licence to buy and no attribution banner.

It is also small. The whole thing is 2.3 KB gzipped against roughly 20 KB for the alternatives, and it adds no `<link>`, no font, no network request of its own.

## Install

Drop one line at the end of the page:

```html
<script src="figlight.js"></script>
```

That is it. Every `<figure><img></figure>` on the page becomes clickable.

From a CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/trendbender/figlight@1.0.0/dist/figlight.min.js"></script>
```

As a module:

```js
import figlight from './figlight.js';
figlight.create({selector: '.gallery img'});
```

## Options

Pass them to `figlight.create()`. To stop the automatic start, add `data-figlight="manual"` to the script tag.

| Option | Default | What it does |
|---|---|---|
| `selector` | `'figure img'` | Which images open. Any CSS selector. |
| `minWidth` | `400` | Images narrower than this are treated as icons and skipped. `0` turns the check off. |
| `caption` | `'figcaption'` | Where the caption comes from: `'figcaption'`, `'alt'`, or a function `(img) => html`. |
| `gallery` | `true` | Arrows, swipe and the counter. `false` opens one image at a time. |
| `markCursor` | `true` | Adds a zoom-in cursor to images that will open. |
| `labels` | `{close, prev, next}` | Button labels for screen readers, for translation. |
| `prefix` | `'fl'` | Class-name prefix, in case of a collision. |

```js
figlight.create({
  selector: 'article img, .cards img',
  caption: function (img) { return img.dataset.credit || img.alt; },
  labels: {close: 'Schließen', prev: 'Zurück', next: 'Weiter'}
});
```

Returns `{open(i), close(), refresh(), destroy()}`. Call `refresh()` after you add images to the page.

## What it does for you

- **Picks the largest image.** If the thumbnail has a `srcset`, the full-screen view uses the widest candidate, not the small one on the page.
- **Keeps the caption.** The `<figcaption>` is shown under the enlarged photo as HTML, so author names and licence links stay clickable. That matters when you publish Wikimedia Commons or Unsplash photos and have to credit them.
- **Leaves links alone.** An image wrapped in an `<a>` still follows the link.
- **Skips icons.** Anything under `minWidth` is ignored, so logos and sprites do not open.
- **Locks the page behind the overlay** and gives focus back to where it was on close.

## Keyboard and screen readers

| Key | Action |
|---|---|
| `Esc` | Close |
| `←` `→` | Previous and next image |
| `Tab` | Moves through close and arrow buttons |

The overlay is a `role="dialog"` with `aria-modal="true"`, focus moves to the close button on open and returns to the opening image on close. Buttons carry `aria-label`s you can translate.

## Browser support

Any browser with `Element.closest` and `:is` — Chrome, Edge, Firefox, Safari, and their mobile versions. No polyfills, no transpiling.

## Licence

MIT. Use it anywhere, commercial included. Attribution is welcome, not required.

Built for [seo-engine](https://github.com/trendbender), which publishes articles with maps and credited photos, where the caption under the photo is not decoration but a licence requirement.
