#!/usr/bin/env bash
# Файл для seo-engine: библиотека figlight плюс наш селектор.
# Статьи движка держат фото в figure.media, карта маршрутов — в карточках .rm-big и .rm-tm.
# Запуск: bash build-seo-engine.sh > media-view.js
set -euo pipefail
cd "$(dirname "$0")"
cat dist/figlight.js
cat <<'TAIL'

/* seo-engine: тот же figlight, но со своим селектором.
   Автозапуск библиотеки берёт figure img, а карточки карты маршрутов лежат не в figure. */
(function () {
  if (!window.figlight) return;
  if (window.figlight.auto) window.figlight.auto.destroy();
  window.figlight.auto = window.figlight.create({
    selector: 'figure.media img, .route-map img.rm-big, .route-map img.rm-tm',
    caption: function (img) {
      var fig = img.closest('figure');
      var cap = fig && fig.querySelector('figcaption');
      if (cap) return cap.innerHTML;
      var card = img.closest('.rm-card, td');
      var cr = card && card.querySelector('.rm-cr');
      var name = card && card.querySelector('h3');
      return (name ? '<b>' + name.textContent.trim() + '</b><br>' : '') +
             (cr ? cr.innerHTML : (img.getAttribute('alt') || ''));
    }
  });
})();
TAIL
