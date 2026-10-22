/**
 * featured-products — heading + product card carousel (autoplay 4000 ms, loop, pause on hover).
 * Row 1: heading. Card rows: [desktop picture] [mobile picture] [link — its label is the card's
 * accessible name; card-as-link unwraps it (EW6)].
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
  if (block.querySelector(':scope > .featured-products-header')) return;
  const rows = [...block.children];
  const heading = rows[0]?.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) rows.shift();
  const prev = el('button', 'featured-products-prev');
  const next = el('button', 'featured-products-next');
  [prev, next].forEach((b, k) => {
    b.type = 'button';
    b.setAttribute('aria-label', k ? 'Next slide' : 'Previous slide');
  });
  const header = el('div', 'featured-products-header', heading ? el('div', 'featured-products-title', heading) : null, el('div', 'featured-products-nav', prev, next));
  const track = el('div', 'featured-products-track swiper-wrapper');
  rows.forEach((row) => {
    const cells = [...row.children];
    const pics = cells.flatMap((c) => pictures(c));
    const a = row.querySelector('a[href]');
    const card = el(
      'a',
      'featured-products-card',
      el('div', 'featured-products-image featured-products-image-desktop', pics[0]),
      el('div', 'featured-products-image featured-products-image-mobile', pics[1]),
    );
    if (a) {
      card.href = a.href;
      card.setAttribute('aria-label', a.textContent.trim());
      const unit = textUnit(a, a.closest('div'));
      unwrap(a);
      card.append(el('div', 'featured-products-label', unit));
    }
    track.append(el('div', 'featured-products-slide', card));
  });
  const slides = [...track.children];
  const bullets = slides.map((s, k) => el('span', `fp-bullet${k === 0 ? ' is-active' : ''}`));
  block.replaceChildren(
    header,
    el(
      'div',
      'featured-products-carousel',
      el('div', 'featured-products-images', track),
      el('div', 'featured-products-pagination', bullets),
    ),
  );

  let idx = 0;
  let hovering = false;
  const step = () => {
    const s = slides[0];
    return s.getBoundingClientRect().width + parseFloat(getComputedStyle(s).marginRight || 0);
  };
  const maxIdx = () => {
    const w = track.parentElement.getBoundingClientRect().width;
    return Math.max(0, Math.ceil((slides.length * step() - w) / step()));
  };
  const go = (i) => {
    idx = Math.max(0, Math.min(i, maxIdx()));
    track.style.transform = idx ? `translateX(${-idx * step()}px)` : '';
    bullets.forEach((b, k) => b.classList.toggle('is-active', k === Math.min(idx, bullets.length - 1)));
  };
  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  bullets.forEach((b, k) => b.addEventListener('click', () => go(k)));
  block.addEventListener('mouseenter', () => {
    hovering = true;
  });
  block.addEventListener('mouseleave', () => {
    hovering = false;
  });
  /* swiper timing: delay 4000 ms, then the next delay starts after the 600 ms slide */
  const tick = () => {
    if (!hovering && slides.length > 1 && step() > 0) go(idx >= maxIdx() ? 0 : idx + 1);
    setTimeout(tick, 4600);
  };
  /* the source's first slide change lands about 8 s after navigation (its swiper starts late) */
  setTimeout(tick, Math.max(4000, 8000 - performance.now()));
}
