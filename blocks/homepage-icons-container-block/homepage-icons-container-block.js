/**
 * homepage-icons-container-block — the "Transform your space" panel over the hero.
 * Row 1: heading. Then one row per icon: [desktop + mobile picture] [link].
 * Card-as-link (EW6): the link's href moves to the tile, the inner anchor is unwrapped.
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
  if (block.querySelector(':scope > .home-icon-content-wrapper')) return;
  const rows = [...block.children];
  const wrap = el('div', 'home-icon-content-wrapper');
  const heading = rows[0]?.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    wrap.append(el('div', 'default-content-wrapper', heading));
    rows.shift();
  }
  const grid = el('div', 'homepage-icons-container');
  rows.forEach((row) => {
    const cells = [...row.children];
    const a = row.querySelector('a[href]');
    const pics = pictures(cells[0]);
    const item = el('a', 'icon-item');
    const cap = el('figcaption');
    if (a) {
      item.href = a.href;
      const unit = textUnit(a, a.closest('div'));
      unwrap(a);
      /* the last word sits on its own line (source figcaption) */
      const texts = [...unit.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
      const last = texts[texts.length - 1];
      const m = last && last.textContent.match(/^(.*\S)\s+(\S+\s*)$/s);
      if (m) {
        const tail = last.splitText(m[1].length + 1);
        const span = el('span', 'last-word');
        tail.before(span);
        span.append(tail);
      }
      cap.append(unit);
    }
    item.append(el('figure', '', el('div', 'icon-wrapper', artDirect(pics)), cap));
    grid.append(item);
  });
  wrap.append(grid);
  block.replaceChildren(wrap);
}
