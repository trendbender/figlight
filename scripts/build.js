// Builds dist/ from src/figlight.js: the plain file, the minified file and an ES module.
const fs = require('fs');
const path = require('path');
const {minify} = require('terser');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'src/figlight.js'), 'utf8');

(async () => {
  fs.mkdirSync(path.join(root, 'dist'), {recursive: true});
  fs.writeFileSync(path.join(root, 'dist/figlight.js'), src);

  const min = await minify(src, {compress: true, mangle: true, format: {comments: /^!/}});
  fs.writeFileSync(path.join(root, 'dist/figlight.min.js'), min.code + '\n');

  const esm =
    'var __m = {exports: {}};\n(function (module) {\n' + src + '\n})(__m);\n' +
    'export default __m.exports;\nexport var create = __m.exports.create;\nexport var version = __m.exports.version;\n';
  fs.writeFileSync(path.join(root, 'dist/figlight.mjs'), esm);
})();
