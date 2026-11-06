// Runs against the built files in dist/. Run: npm test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');

const dist = (f) => fs.readFileSync(path.join(__dirname, '../dist', f), 'utf8');

const BODY = `
  <figure id="a"><img id="i1" src="small.jpg" alt="One"
    srcset="small.jpg 800w, big.jpg 1600w"><figcaption>Photo by <a href="https://example.com/">Ann</a></figcaption></figure>
  <figure id="b"><img id="i2" src="two.jpg" alt="Two &lt;b&gt;"></figure>
  <figure id="c"><img id="icon" src="icon.png" alt="Icon"></figure>
  <figure id="d"><a id="link" href="#x"><img id="linked" src="linked.jpg" alt="Linked"></a></figure>`;

function page(file, attrs = '') {
  return new JSDOM(`<!doctype html><html><head></head><body>${BODY}
    <script ${attrs}>${dist(file)}</script></body></html>`, {runScripts: 'dangerously', pretendToBeVisual: true});
}
const click = (w, el) => el.dispatchEvent(new w.MouseEvent('click', {bubbles: true, cancelable: true}));
const key = (w, k) => w.document.dispatchEvent(new w.KeyboardEvent('keydown', {key: k, bubbles: true}));

for (const file of ['figlight.js', 'figlight.min.js']) {
  test(`${file}: a script tag starts by itself and carries the caption as HTML`, () => {
    const {window: w} = page(file);
    assert.ok(w.figlight.auto, 'auto-start');
    click(w, w.document.getElementById('i1'));
    const back = w.document.querySelector('.fl-back');
    assert.ok(back, 'overlay opens');
    assert.strictEqual(back.getAttribute('role'), 'dialog');
    assert.strictEqual(back.getAttribute('aria-modal'), 'true');
    assert.strictEqual(back.querySelector('img').getAttribute('src'), 'big.jpg', 'largest srcset candidate');
    const a = back.querySelector('.fl-cap a');
    assert.ok(a, 'caption link kept');
    assert.strictEqual(a.getAttribute('href'), 'https://example.com/');
    assert.strictEqual(w.document.documentElement.style.overflow, 'hidden', 'page locked');
  });

  test(`${file}: keys move and close, focus returns`, () => {
    const {window: w} = page(file);
    const i1 = w.document.getElementById('i1');
    i1.setAttribute('tabindex', '0');
    i1.focus();
    click(w, i1);
    assert.strictEqual(w.document.activeElement.className, 'fl-x', 'focus on close button');
    key(w, 'ArrowRight');
    assert.strictEqual(w.document.querySelector('.fl-back img').getAttribute('src'), w.document.getElementById('i2').src);
    assert.match(w.document.querySelector('.fl-i').textContent, /^2 \/ /);
    assert.strictEqual(w.document.querySelector('.fl-cap').innerHTML, 'Two &lt;b&gt;', 'alt text is escaped');
    key(w, 'Escape');
    assert.strictEqual(w.document.querySelector('.fl-back'), null);
    assert.strictEqual(w.document.documentElement.style.overflow, '');
    assert.strictEqual(w.document.activeElement, i1);
  });

  test(`${file}: icons and linked images do not open`, () => {
    const {window: w} = page(file);
    const icon = w.document.getElementById('icon');
    Object.defineProperty(icon, 'naturalWidth', {value: 64});
    click(w, icon);
    assert.strictEqual(w.document.querySelector('.fl-back'), null, 'icon skipped');
    click(w, w.document.getElementById('linked'));
    assert.strictEqual(w.document.querySelector('.fl-back'), null, 'link wins');
  });

  test(`${file}: data-figlight="manual" stops the auto-start`, () => {
    const {window: w} = page(file, 'data-figlight="manual"');
    assert.strictEqual(w.figlight.auto, undefined);
    const api = w.figlight.create({selector: '#b img', caption: () => 'Custom'});
    click(w, w.document.getElementById('i2'));
    assert.strictEqual(w.document.querySelector('.fl-cap').textContent, 'Custom');
    api.destroy();
    assert.strictEqual(w.document.querySelector('.fl-back'), null);
  });
}

test('require by package name exports the API and does not start', () => {
  const m = require('figlight');
  assert.strictEqual(typeof m.create, 'function');
  assert.strictEqual(m.auto, undefined);
});

test('import by package name gives a default export and create', async () => {
  const m = await import('figlight');
  assert.strictEqual(typeof m.default.create, 'function');
  assert.strictEqual(m.create, m.default.create);
  assert.strictEqual(m.default.auto, undefined);
});
