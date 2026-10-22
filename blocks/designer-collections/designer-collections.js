/**
 * designer-collections — heading + slide-by-one card carousel.
 * Row 1: heading. Card rows: [logo pictures desktop, mobile] [video link] [title, text, CTA].
 * Videos are served root-relative from the code origin; paused on the first frame, click plays.
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

const VIDEO = /\.(webm|mp4)(\?|#|$)/i;

export default function decorate(block) {
  if (block.querySelector(':scope > .designer-collections-header')) return;
  const rows = [...block.children];
  const heading = rows[0]?.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && !rows[0].querySelector('picture, img')) rows.shift();
  const prev = el('button', 'designer-collections-nav designer-collections-prev');
  const next = el('button', 'designer-collections-nav designer-collections-next');
  [prev, next].forEach((b, k) => {
    b.type = 'button';
    b.setAttribute('aria-label', k ? 'Next slide' : 'Previous slide');
  });
  prev.disabled = true;
  const track = el('div', 'designer-collections-track swiper-wrapper');
  rows.forEach((row) => {
    const cells = [...row.children];
    const pics = pictures(cells[0]);
    const vlink = [...row.querySelectorAll('a[href]')].find((a) => VIDEO.test(a.getAttribute('href')));
    const content = el('div', 'designer-collections-content');
    const ctaWrap = el('div', 'designer-collections-cta-wrap');
    const textCell = cells.find((c) => c.querySelector('h1, h2, h3, h4, h5, h6')) || cells[cells.length - 1];
    [...textCell.children].forEach((n) => {
      const a = n.querySelector('a[href]') || (n.tagName === 'A' ? n : null);
      if (a && !VIDEO.test(a.getAttribute('href'))) {
        a.className = 'designer-collections-cta';
        const title = textCell.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim() || '';
        a.setAttribute('aria-label', `${a.textContent.trim()} - ${title}`);
        const icon = el('img', 'designer-collections-cta-icon');
        icon.src = '/icons/download-icon-shade-tool.svg';
        icon.alt = '';
        icon.width = 18;
        icon.height = 18;
        a.append(icon);
        ctaWrap.append(textUnit(a, textCell));
      } else {
        content.append(n);
      }
    });
    const image = el('div', 'designer-collections-image');
    if (vlink) {
      const video = document.createElement('video');
      video.className = 'designer-collections-video';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.src = vlink.getAttribute('href');
      video.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
      image.append(video, el('div', 'designer-collections-video-source', textUnit(vlink, vlink.closest('div'))));
    }
    track.append(el(
      'div',
      'designer-collections-card',
      el(
        'div',
        'designer-collections-logo',
        el('div', 'designer-collections-logo-image designer-collections-logo-image-desktop', pics[0]),
        el('div', 'designer-collections-logo-image designer-collections-logo-image-mobile', pics[1]),
      ),
      image,
      content,
      ctaWrap,
    ));
  });
  const slides = [...track.children];
  const bullets = slides.map((s, k) => {
    const b = el('span', `dc-bullet${k === 0 ? ' is-active' : ''}`);
    b.setAttribute('aria-label', `Go to slide ${k + 1}`);
    return b;
  });
  const viewport = el('div', 'designer-collections-carousel', track, el('div', 'designer-collections-pagination', bullets));
  block.replaceChildren(
    el('div', 'designer-collections-header', heading ? el('div', 'designer-collections-title', heading) : null, el('div', 'designer-collections-nav-wrapper', prev, next)),
    viewport,
  );
  slider(block, viewport, slides, track, prev, next, bullets);
}
