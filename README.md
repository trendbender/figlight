# figlight

A tiny lightbox that keeps your captions. One file, no dependencies, **2.3 KB gzipped**, MIT.

Click a photo and it opens full screen with the caption your page already wrote, credits, licence and links included. Arrow keys and swipe move between images, `Esc` closes.

**[Live demo](https://trendbender.github.io/figlight/demo/)** · **[Home page](https://4queries.com/tools/figlight/)**

## Why another lightbox

Fancybox is the usual answer, and it is excellent. It also needs a [paid licence](https://fancyapps.com/license/) for every live site, [from €29](https://fancyapps.com/pricing/). figlight is MIT: free for anything, commercial work included, with no attribution banner.

figlight does one job: photos with captions. If you need more, use something else.

**What figlight does not do:** no zoom or pinch, no thumbnails, no video, iframes or PDF, no themes. It has no separate React or Vue layer.

## How it compares

Checked on 6 November 2026. Size is the published JS plus CSS from npm, compressed with `gzip -9`.

| | figlight 1.0.1 | Fancybox 6.1.15 | PhotoSwipe 5.4.4 | GLightbox 3.3.1 | baguetteBox 1.13.0 |
|---|---|---|---|---|---|
| Licence | MIT | Paid for every live site | MIT | MIT | MIT |
| Size | 2.3 KB | 43.2 KB | 23.5 KB | 17.9 KB | 4.6 KB |
| Captions | Reads `<figcaption>`, keeps HTML | Yes | Custom code or plugin | `title` and `description`, HTML allowed | `title` or `data-caption` |
| Zoom | No | Yes | Yes | Yes | Not in its docs |
| Video | No | Yes | Not in its docs | Yes | Not in its docs |

Need zoom or video on a commercial site without a licence fee? GLightbox and PhotoSwipe are good choices. Pick figlight when the page already has captions and you want one line and nothing else.

## Install

Drop one line at the end of the page:

```html
<script src="https://cdn.jsdelivr.net/gh/trendbender/figlight@1.0.1/dist/figlight.min.js"></script>
```

That is it. Every `<figure><img></figure>` on the page becomes clickable.

With a bundler (npm package pending):

```js
import figlight from 'figlight';
figlight.create({selector: '.gallery img'});
```

An import does not start on its own, so you always call `create()`. A plain script tag starts by itself.

## Options

Pass them to `figlight.create()`. To stop the automatic start of a script tag, add `data-figlight="manual"` to it.

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

A caption function returns HTML that figlight inserts as is, so escape anything that comes from your users.

## Keyboard and screen readers

| Key | Action |
|---|---|
| `Esc` | Close |
| `←` `→` | Previous and next image |
| `Tab` | Moves through close and arrow buttons |

The overlay is a `role="dialog"` with `aria-modal="true"`, focus moves to the close button on open and returns to the opening image on close. Buttons carry `aria-label`s you can translate.

## Browser support

Any browser with `Element.closest`: Chrome, Edge, Firefox, Safari and their mobile versions. No polyfills, no transpiling. Tests run in jsdom, not in real browsers: please [open an issue](https://github.com/trendbender/figlight/issues) if a device misbehaves.

## Development

```bash
npm install
npm run build
npm test
```

## Licence

MIT. Use it anywhere, commercial included. Attribution is welcome, not required.

Built by [4Queries](https://4queries.com/tools/) for articles with credited photos, where the caption under the photo is a licence requirement. More free tools: [4queries.com/tools](https://4queries.com/tools/).
