/**
 * testimonial-carousel — "What our clients say about us!" heading + slide-by-one carousel.
 * Row 1: heading. Slide rows: [photo] [quote] [name (bold) + location].
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
  if (block.querySelector(':scope > .testimonial-carousel-container')) return;
  const rows = [...block.children];
  const heading = rows[0]?.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && !rows[0].querySelector('picture, img')) rows.shift();
  const track = el('div', 'testimonial-track swiper-wrapper');
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const play = el('button', 'testimonial-play-button');
    play.type = 'button';
    play.setAttribute('aria-label', 'Play testimonial video');
    const playImg = el('img');
    playImg.src = '/icons/play-button.png';
    playImg.alt = '';
    playImg.width = 202;
    playImg.height = 202;
    play.append(playImg);
    const quoteBg = el('img');
    quoteBg.src = '/icons/b-tc-quote.webp';
    quoteBg.alt = '';
    quoteBg.loading = 'lazy';
    const unitOf = (c) => (c ? textUnit(c.firstElementChild || c.firstChild, c) : null);
    const quote = unitOf(cells[1]);
    const attr = unitOf(cells[2]);
    const slide = el(
      'div',
      'testimonial-slide',
      el('div', 'testimonial-image', pictures(cells[0]), play),
      el(
        'div',
        'testimonial-content',
        el('div', 'testimonial-logo-bg', quoteBg),
        el('div', 'testimonial-quote', quote),
        el('div', 'testimonial-attribution', attr),
      ),
    );
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', `${i + 1} / ${rows.length}`);
    track.append(slide);
  });
  const slides = [...track.children];
  const bullets = slides.map((s, k) => {
    const b = el('span', `tc-bullet${k === 0 ? ' is-active' : ''}`);
    b.setAttribute('aria-label', `Go to slide ${k + 1}`);
    return b;
  });
  const prev = el('button', 'testimonial-prev');
  const next = el('button', 'testimonial-next');
  [prev, next].forEach((b, k) => {
    b.type = 'button';
    b.setAttribute('aria-label', k ? 'Next slide' : 'Previous slide');
  });
  prev.disabled = true;
  const swiper = el('div', 'testimonial-swiper', track);
  block.replaceChildren(el(
    'div',
    'testimonial-carousel-container',
    el('div', 'testimonial-heading', heading),
    el(
      'div',
      'testimonial-carousel-inner-wrapper',
      swiper,
      el('div', 'testimonial-pagination', bullets),
      el('div', 'testimonial-nav-buttons', prev, next),
    ),
  ));
  block.classList.add('swiper-ready');
  slider(block, swiper, slides, track, prev, next, bullets);
}
