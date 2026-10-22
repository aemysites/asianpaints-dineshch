/**
 * carousel-hero-banner — template-slotted fade carousel (one row per slide).
 * Row: [media cell: desktop + mobile picture, optional video links (desktop, mobile) for a
 * video slide whose pictures become the text overlay] [CTA link].
 * Restored behaviour: fade 800 ms, slide 1 holds 18 s then 5 s each, pause on hover.
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

function artDirect(pics) {
  const [d, m] = pics;
  if (!m) return [el('div', 'ad-both', d)];
  return [el('div', 'ad-desk', d), el('div', 'ad-mob', m)];
}

const VIDEO = /\.(webm|mp4)(\?|#|$)/i;

export default function decorate(block) {
  if (block.querySelector(':scope > .hero-track')) return;
  const rows = [...block.children];
  const track = el('div', 'hero-track');
  rows.forEach((row, i) => {
    const [mediaCell, ctaCell] = row.children;
    const links = [...row.querySelectorAll('a[href]')];
    const videos = links.filter((a) => VIDEO.test(a.getAttribute('href')));
    const cta = links.find((a) => !VIDEO.test(a.getAttribute('href')));
    const pics = pictures(mediaCell);
    const slide = el('div', `hero-slide${i === 0 ? ' is-active' : ''}`);
    slide.dataset.slide = String(i);
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', `${i + 1} / ${rows.length}`);
    const media = el('div', 'hero-media');
    if (videos.length) {
      const [desk, mob = desk] = videos.map((a) => a.getAttribute('href'));
      const video = document.createElement('video');
      video.className = 'hero-video';
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.src = window.innerWidth < 768 ? mob : desk;
      const vlink = el('a', 'hero-video-link', video);
      if (cta) {
        vlink.href = cta.href;
        vlink.setAttribute('aria-label', cta.textContent.trim());
      }
      const sources = el('div', 'hero-video-sources', videos.map((a) => textUnit(a, mediaCell)));
      media.append(vlink, el('div', 'hero-image', artDirect(pics)), el('div', 'video-overlay'), sources);
      video.play?.().catch(() => {});
    } else {
      const link = el('a', 'hero-media-link', artDirect(pics));
      if (cta) link.href = cta.href;
      const img = pics[0]?.querySelector?.('img') || pics[0];
      if (img?.alt) link.setAttribute('aria-label', img.alt);
      media.append(link);
    }
    if (cta) {
      cta.className = 'hero-cta';
      media.append(el('div', 'hero-cta-wrap', textUnit(cta, ctaCell || mediaCell)));
    }
    slide.append(media);
    track.append(slide);
  });

  const prev = el('button', 'hero-arrow hero-prev');
  const next = el('button', 'hero-arrow hero-next');
  prev.type = 'button';
  next.type = 'button';
  prev.setAttribute('aria-label', 'Previous slide');
  next.setAttribute('aria-label', 'Next slide');
  const slides = [...track.children];
  const bullets = slides.map((s, k) => {
    const b = el('button', `hero-bullet${k === 0 ? ' is-active' : ''}`);
    b.type = 'button';
    b.setAttribute('aria-label', `Go to slide ${k + 1}`);
    return b;
  });
  block.replaceChildren(track, el('div', 'hero-pagination', prev, bullets, next));

  const delays = [18000];
  let idx = 0;
  let timer;
  let hovering = false;
  const schedule = () => {
    clearTimeout(timer);
    if (hovering || slides.length < 2) return;
    // eslint-disable-next-line no-use-before-define
    timer = setTimeout(() => go(idx + 1), delays[idx] || 5000);
  };
  const go = (i) => {
    const from = idx;
    idx = (i + slides.length) % slides.length;
    if (from !== idx) {
      const out = slides[from];
      out.classList.add('is-leaving');
      setTimeout(() => out.classList.remove('is-leaving'), 800);
    }
    slides.forEach((s, k) => s.classList.toggle('is-active', k === idx));
    bullets.forEach((b, k) => b.classList.toggle('is-active', k === idx));
    prev.disabled = idx === 0;
    next.disabled = idx === slides.length - 1;
    schedule();
  };
  prev.disabled = true;
  next.disabled = slides.length < 2;
  bullets.forEach((b, k) => b.addEventListener('click', () => go(k)));
  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  block.addEventListener('mouseenter', () => {
    hovering = true;
    clearTimeout(timer);
  });
  block.addEventListener('mouseleave', () => {
    hovering = false;
    schedule();
  });
  schedule();
}
