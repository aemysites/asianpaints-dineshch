/**
 * color-gallery — "Colour of the years": text panel + slide-by-one card carousel.
 * Row 1 (template-slotted): logo pictures (desktop, mobile), heading, description, CTA.
 * Card rows (reconstructive): [top pictures] [bottom pictures] [link — label becomes the
 * card's accessible name; the card-as-link unwraps it (EW6)].
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

const ARROW = '<svg class="swiper-navigation-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"></path></svg>';

function stripInstrumentation(node) {
  [node, ...node.querySelectorAll('*')].forEach((n) => {
    [...n.attributes].filter((at) => at.name.startsWith('data-')).forEach((at) => n.removeAttribute(at.name));
  });
  return node;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .color-gallery-text')) return;
  const rows = [...block.children];
  const intro = rows.shift();
  const text = el('div', 'color-gallery-text');
  let ctaUnit;
  if (intro) {
    const cell = intro.firstElementChild || intro;
    const logo = pictures(cell).slice(0, 2);
    if (logo.length) text.append(el('div', 'color-gallery-logo', artDirect(logo)));
    const cta = cell.querySelector('a[href]');
    [...cell.querySelectorAll('h1, h2, h3, h4, h5, h6, p')].forEach((n) => {
      if (n.querySelector('picture, img') || (cta && n.contains(cta)) || !n.textContent.trim()) return;
      text.append(n);
    });
    if (cta) {
      cta.className = 'button';
      ctaUnit = textUnit(cta, cell);
      text.append(el('div', 'button-container', ctaUnit));
    }
  }

  const track = el('div', 'color-gallery-track swiper-wrapper');
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const a = row.querySelector('a[href]');
    const card = el('a', 'color-gallery-card');
    card.append(
      el('div', 'color-gallery-card-top', artDirect(pictures(cells[0]))),
      el('div', 'color-gallery-card-bottom', artDirect(pictures(cells[1]))),
    );
    if (a) {
      card.href = a.href;
      card.setAttribute('aria-label', a.textContent.trim());
      const unit = textUnit(a, a.closest('div'));
      unwrap(a);
      card.append(el('div', 'color-gallery-label', unit));
    }
    track.append(el('div', `color-gallery-slide${i === 0 ? ' is-active' : ''}`, card));
  });

  const prev = el('button', 'color-gallery-nav color-gallery-prev');
  const next = el('button', 'color-gallery-nav color-gallery-next');
  [prev, next].forEach((b, k) => {
    b.type = 'button';
    b.setAttribute('aria-label', k ? 'Next slide' : 'Previous slide');
    b.innerHTML = ARROW;
  });
  prev.disabled = true;
  const slides = [...track.children];
  const bullets = slides.map((s, k) => {
    const b = el('span', `cg-bullet${k === 0 ? ' is-active' : ''}`);
    b.setAttribute('aria-label', `Go to slide ${k + 1}`);
    return b;
  });
  const carousel = el(
    'div',
    'color-gallery-carousel',
    el('div', 'color-gallery-swiper', track, el('div', 'color-gallery-navigation', prev, next)),
    el('div', 'color-gallery-pagination', bullets),
  );
  const parts = [text, carousel];
  if (ctaUnit) {
    /* presentational clone of the CTA for the mobile layout (EW4) */
    const mob = stripInstrumentation(ctaUnit.querySelector('a').cloneNode(true));
    mob.removeAttribute('class');
    mob.className = 'button';
    parts.push(el('div', 'color-gallery-mobile-cta', mob));
  }
  block.replaceChildren(...parts);

  let idx = 0;
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
    prev.disabled = idx === 0;
    next.disabled = idx >= maxIdx();
    bullets.forEach((b, k) => b.classList.toggle('is-active', k === Math.min(idx, bullets.length - 1)));
  };
  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  bullets.forEach((b, k) => b.addEventListener('click', () => go(k)));
}
