/**
 * services-grid — "Everything a home needs": intro text + linked image cards.
 * Row 1: heading + description. Card rows: [picture] [link — label shown on the card;
 * card-as-link unwraps it (EW6)].
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  kids.flat().forEach((k) => {
    if (k) n.append(k);
  });
  return n;
}

/* authored pictures in a cell (a bare <img> when the pipeline did not wrap it) */
function pictures(cell) {
  if (!cell) return [];
  return [...cell.querySelectorAll('picture, img')]
    .filter((n) => n.tagName === 'PICTURE' || !n.closest('picture'));
}

/* the authored paragraph holding `node`; a single-paragraph cell is delivered without
   its <p>, so its child nodes are MOVED into one (EW1 — never rebuilt from text) */
function textUnit(node, cell) {
  const host = node.nodeType === 1 ? node : node.parentElement;
  const p = host && host.closest('p, h1, h2, h3, h4, h5, h6, li');
  if (p && cell.contains(p)) return p;
  const w = document.createElement('p');
  w.append(...cell.childNodes);
  return w;
}

function unwrap(a) {
  a.replaceWith(...a.childNodes);
}

export default function decorate(block) {
  if (block.querySelector(':scope > .services-grid-text')) return;
  const rows = [...block.children];
  const text = el('div', 'services-grid-text');
  if (rows[0] && !rows[0].querySelector('a[href]')) {
    const intro = rows.shift();
    text.append(...intro.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
  }
  const cards = el('div', 'services-grid-cards');
  rows.forEach((row) => {
    const cells = [...row.children];
    const a = row.querySelector('a[href]');
    const card = el('a', 'services-grid-card', el('div', 'services-grid-card-image', pictures(cells[0])));
    if (a) {
      card.href = a.href;
      const unit = textUnit(a, a.closest('div'));
      unwrap(a);
      card.append(el('div', 'services-grid-card-text', unit));
    }
    const arrow = el('div', 'services-grid-card-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    card.append(arrow);
    cards.append(card);
  });
  block.replaceChildren(text, el('div', 'services-grid-images', cards));
}
