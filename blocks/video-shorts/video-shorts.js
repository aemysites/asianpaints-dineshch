/**
 * video-shorts — "Inspiring ideas for you": heading + free-scrolling row of short videos.
 * Row 1: heading. Tile rows: [video link] [view count] [CTA link].
 * Videos are served root-relative from the code origin and autoplay muted in a loop.
 * @ew-exempt video source links are configuration (kept, visually hidden)
 */

function el(tag, cls, ...kids) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  kids.flat().forEach((k) => {
    if (k) n.append(k);
  });
  return n;
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

const EYE = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 16 12"><path d="M8 0C4.364 0 1.248 2.292 0 6c1.248 3.708 4.364 6 8 6s6.752-2.292 8-6c-1.248-3.708-4.364-6-8-6zm0 10.2c-2.363 0-4.483-1.590-5.525-4.200C3.517 3.390 5.637 1.800 8 1.800s4.483 1.590 5.525 4.200c-1.042 2.610-3.162 4.200-5.525 4.200zm0-6.600A2.400 2.400 0 1 0 10.400 6 2.400 2.400 0 0 0 8 3.600z" fill="#fff"></path></svg>';
const CART = '<svg class="vs-cta-icon" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"></path></svg>';
const PREV = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM271 135c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-87 87 87 87c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L167 273c-9.4-9.4-9.4-24.600 0-33.900L271 135z"></path></svg>';
const NEXT = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM241 377c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l87-87-87-87c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L345 239c9.4 9.4 9.4 24.6 0 33.9L241 377z"></path></svg>';
const VIDEO = /\.(webm|mp4)(\?|#|$)/i;

export default function decorate(block) {
  if (block.querySelector(':scope > .vs-root')) return;
  const rows = [...block.children];
  const heading = rows[0]?.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && !rows[0].querySelector('a[href]')) rows.shift();
  const track = el('div', 'vs-track swiper-wrapper');
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const links = [...row.querySelectorAll('a[href]')];
    const vlink = links.find((a) => VIDEO.test(a.getAttribute('href')));
    const cta = links.find((a) => !VIDEO.test(a.getAttribute('href')));
    const countCell = cells.find((c) => !c.querySelector('a[href]'));
    const media = el('div', 'vs-media');
    if (vlink) {
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'auto';
      ['muted', 'loop', 'autoplay', 'playsinline'].forEach((at) => video.setAttribute(at, ''));
      video.src = vlink.getAttribute('href');
      media.append(video, el('div', 'vs-video-source', textUnit(vlink, vlink.closest('div'))));
      video.play?.().catch(() => {});
    }
    const count = el('div', 'vs-count');
    count.innerHTML = EYE;
    if (countCell && countCell.textContent.trim()) {
      const unit = textUnit(countCell.firstElementChild || countCell.firstChild, countCell);
      count.append(el('div', 'vs-count-text', unit));
    }
    const tile = el('div', 'vs-tile', media, el('div', 'vs-caption', count));
    if (cta) {
      cta.className = 'vs-cta-link';
      cta.target = '_blank';
      cta.rel = 'noopener';
      const label = el('span', 'vs-cta');
      label.innerHTML = CART;
      label.append(...cta.childNodes);
      cta.append(label);
      tile.append(el('div', 'vs-cta-wrap', textUnit(cta, cta.closest('div'))));
    }
    tile.setAttribute('role', 'group');
    tile.setAttribute('aria-label', `${i + 1} / ${rows.length}`);
    track.append(tile);
  });
  const prev = el('div', 'vs-nav vs-prev');
  const next = el('div', 'vs-nav vs-next');
  prev.innerHTML = PREV;
  next.innerHTML = NEXT;
  [prev, next].forEach((b, k) => {
    b.setAttribute('role', 'button');
    b.tabIndex = k ? 0 : -1;
    b.setAttribute('aria-label', k ? 'Next slide' : 'Previous slide');
  });
  prev.setAttribute('aria-disabled', 'true');
  const viewport = el('div', 'vs-viewport', track);
  block.replaceChildren(
    el('div', 'video-shorts-heading', heading),
    el('div', 'vs-root', viewport, prev, next),
  );
  slider(block, viewport, [...track.children], track, prev, next, []);
}
