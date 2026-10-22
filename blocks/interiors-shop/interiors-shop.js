/**
 * interiors-shop — "One-stop shop for all things interiors": intro + three cards
 * (a slide-by-one carousel below 900 px).
 * Row 1: heading + description. Card rows: [picture] [title (bold paragraph), text, CTA link].
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

/* slide-by-one carousel (prototype index-b.js), optional media query gate */
function slider(block, viewport, slides, move, prev, next, bullets, mq) {
  if (!viewport || slides.length < 2) return;
  let index = 0;
  const step = () => {
    const a = slides[0].getBoundingClientRect();
    const b = slides[1].getBoundingClientRect();
    return Math.abs(b.left - a.left) || a.width;
  };
  const maxIndex = () => {
    const s = step();
    const span = viewport.clientWidth + (s - slides[0].offsetWidth);
    const visible = Math.max(1, Math.floor(span / s));
    return Math.max(0, slides.length - visible);
  };
  const setDisabled = (b, off) => {
    if (!b) return;
    if (b.tagName === 'BUTTON') b.disabled = off;
    else b.setAttribute('aria-disabled', String(off));
  };
  const render = () => {
    const active = !mq || window.matchMedia(mq).matches;
    const offset = active ? -index * step() : 0;
    if (move) move.style.transform = offset ? `translateX(${offset}px)` : '';
    else {
      slides.forEach((s) => {
        s.style.transform = offset ? `translateX(${offset}px)` : '';
      });
    }
    setDisabled(prev, index === 0);
    setDisabled(next, index >= maxIndex());
    bullets.forEach((d, i) => d.classList.toggle('is-active', i === index));
  };
  const go = (i) => {
    const last = Math.max(maxIndex(), bullets.length ? bullets.length - 1 : 0);
    index = Math.min(Math.max(i, 0), last);
    index = Math.min(index, slides.length - 1);
    render();
  };
  [prev, next].forEach((b, k) => {
    if (!b) return;
    const activate = () => {
      if (b.disabled || b.getAttribute('aria-disabled') === 'true') return;
      go(index + (k ? 1 : -1));
    };
    b.addEventListener('click', activate);
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
  bullets.forEach((d, i) => d.addEventListener('click', () => go(i)));
  let x0 = null;
  viewport.addEventListener('pointerdown', (e) => {
    x0 = e.clientX;
  });
  viewport.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  });
  window.addEventListener('resize', () => {
    index = 0;
    render();
  });
}

export default function decorate(block) {
  if (block.querySelector(':scope > .interiors-shop-grid')) return;
  const rows = [...block.children];
  const grid = el('div', 'interiors-shop-grid');
  if (rows[0] && !rows[0].querySelector('picture, img')) {
    const intro = rows.shift();
    const text = el('div', 'interiors-shop-text');
    intro.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((n) => {
      text.append(el('div', /^H/.test(n.tagName) ? 'interiors-shop-heading' : 'interiors-shop-description', n));
    });
    grid.append(text);
  }
  const pos = ['card-left', 'card-middle', 'card-right'];
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const content = el('div', 'interiors-shop-card-content');
    const textCell = cells[1] || cells[0];
    const nodes = [...textCell.children].filter((n) => !n.matches('picture, img') && !n.querySelector('picture, img'));
    nodes.forEach((n, k) => {
      const a = n.querySelector('a[href]') || (n.tagName === 'A' ? n : null);
      if (a) {
        a.className = 'interiors-shop-button';
        a.append(el('span', 'arrow'));
        content.append(el('div', 'interiors-shop-button-wrap', textUnit(a, textCell)));
      } else if (k === 0) {
        content.append(el('div', 'title', n));
      } else {
        content.append(n);
      }
    });
    grid.append(el(
      'div',
      `interiors-shop-card ${pos[i] || ''}`.trim(),
      el('div', 'interiors-shop-card-image', pictures(cells[0])),
      content,
    ));
  });
  const slides = [...grid.querySelectorAll('.interiors-shop-card')];
  const bullets = slides.map((s, k) => el('span', `is-bullet${k === 0 ? ' is-active' : ''}`));
  block.replaceChildren(grid, el('div', 'interiors-shop-pagination', bullets));
  slider(block, grid, slides, null, null, null, bullets, '(width < 900px)');
}
