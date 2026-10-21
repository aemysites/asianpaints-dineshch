/**
 * tools-carousel — "Colour Tools": heading + linked tool slides.
 * Row 1: heading. Slide rows: [desktop + mobile picture] [link — its label is the slide
 * title; card-as-link unwraps it (EW6)].
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
  if (block.querySelector(':scope > .tools-carousel-heading')) return;
  const rows = [...block.children];
  const heading = rows[0]?.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) rows.shift();
  const inner = el('div', 'tools-carousel-wrapper-inner swiper-wrapper');
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const a = row.querySelector('a[href]');
    const slide = el('a', 'tools-carousel-slide', artDirect(pictures(cells[0])));
    slide.setAttribute('aria-label', `${i + 1} / ${rows.length}`);
    if (a) {
      slide.href = a.href;
      const unit = textUnit(a, a.closest('div'));
      unwrap(a);
      slide.append(el('div', 'tools-carousel-title', unit));
    }
    inner.append(slide);
  });
  const prev = el('button', 'tools-carousel-nav tools-carousel-prev');
  const next = el('button', 'tools-carousel-nav tools-carousel-next');
  [prev, next].forEach((b, k) => {
    b.type = 'button';
    b.setAttribute('aria-label', k ? 'Next slide' : 'Previous slide');
  });
  prev.disabled = true;
  block.replaceChildren(
    el('div', 'tools-carousel-heading', heading),
    el(
      'div',
      'tools-carousel-items',
      el('div', 'tools-carousel-nav-container', prev, next),
      el('div', 'tools-carousel-track', inner),
    ),
  );
  const slides = [...inner.children];
  let idx = 0;
  const step = () => {
    const s = slides[0];
    return s.getBoundingClientRect().width + parseFloat(getComputedStyle(s).marginRight || 0);
  };
  const maxIdx = () => {
    const w = inner.parentElement.getBoundingClientRect().width;
    return Math.max(0, Math.ceil((slides.length * step() - w) / step()));
  };
  const go = (i) => {
    idx = Math.max(0, Math.min(i, maxIdx()));
    inner.style.transform = idx ? `translateX(${-idx * step()}px)` : '';
    prev.disabled = idx === 0;
    next.disabled = idx >= maxIdx();
  };
  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
}
