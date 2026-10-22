/**
 * store-banner — full-width "find a store" banner.
 * Row: [desktop picture, mobile picture] [link — its label is the banner's accessible name;
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

function artDirect(pics) {
  const [d, m] = pics;
  if (!m) return [el('div', 'ad-both', d)];
  return [el('div', 'ad-desk', d), el('div', 'ad-mob', m)];
}

export default function decorate(block) {
  if (block.querySelector(':scope > .store-banner-link')) return;
  const pics = pictures(block);
  const a = block.querySelector('a[href]');
  const link = el('a', 'store-banner-link', artDirect(pics));
  if (a) {
    link.href = a.href;
    link.setAttribute('aria-label', a.textContent.trim());
    const unit = textUnit(a, a.closest('div'));
    unwrap(a);
    link.append(el('div', 'store-banner-label', unit));
  }
  block.replaceChildren(link);
}
