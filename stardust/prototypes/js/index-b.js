/* index-b.js — sections 7–14: slide-by-one carousels (designer collections, interiors shop on
   mobile, testimonials, video shorts) and the FAQ "View All" toggle. The initial frame is the
   static markup (first slide); nothing here runs until the user interacts. */
(() => {
  const CONFIG = {
    dc: { viewport: '.designer-collections-carousel', slide: '.designer-collections-card', move: '.designer-collections-track', prev: '.designer-collections-prev', next: '.designer-collections-next', bullet: '.dc-bullet' },
    is: { viewport: '.interiors-shop-grid', slide: '.interiors-shop-card', move: null, bullet: '.is-bullet', mq: '(width < 900px)' },
    tc: { viewport: '.testimonial-swiper', slide: '.testimonial-slide', move: '.testimonial-track', prev: '.testimonial-prev', next: '.testimonial-next', bullet: '.tc-bullet' },
    vs: { viewport: '.vs-viewport', slide: '.vs-tile', move: '.vs-track', prev: '.vs-prev', next: '.vs-next' },
  };

  function setDisabled(el, off) {
    if (!el) return;
    if (el.tagName === 'BUTTON') el.disabled = off;
    else el.setAttribute('aria-disabled', String(off));
  }

  function initCarousel(block) {
    const cfg = CONFIG[block.dataset.carousel];
    if (!cfg) return;
    const viewport = block.querySelector(cfg.viewport);
    /* live swiper init stamps (observed classMutations at init; no styling attached here) */
    if (viewport && cfg.move) viewport.classList.add('swiper-initialized', 'swiper-horizontal', 'swiper-backface-hidden');
    if (block.dataset.carousel === 'vs' && viewport) {
      viewport.classList.add('swiper-free-mode');
      block.querySelector('.vs-root')?.classList.add('saleassist-video-shorts-root-container');
    }
    if (block.dataset.carousel === 'tc') {
      block.classList.add('swiper-ready');
      block.querySelector('.testimonial-pagination')?.classList.add('swiper-pagination-clickable', 'swiper-pagination-bullets', 'swiper-pagination-horizontal');
    }
    const slides = [...block.querySelectorAll(cfg.slide)];
    const move = cfg.move ? block.querySelector(cfg.move) : null;
    const prev = cfg.prev ? block.querySelector(cfg.prev) : null;
    const next = cfg.next ? block.querySelector(cfg.next) : null;
    const bullets = cfg.bullet ? [...block.querySelectorAll(cfg.bullet)] : [];
    if (!viewport || slides.length < 2) return;
    let index = 0;

    const step = () => {
      const a = slides[0].getBoundingClientRect();
      const b = slides[1].getBoundingClientRect();
      return Math.abs(b.left - a.left) || a.width;
    };
    const maxIndex = () => {
      const s = step();
      const visible = Math.max(1, Math.floor((viewport.clientWidth + (s - slides[0].offsetWidth)) / s));
      return Math.max(0, slides.length - visible);
    };

    function render() {
      const active = !cfg.mq || window.matchMedia(cfg.mq).matches;
      const offset = active ? -index * step() : 0;
      if (move) move.style.transform = offset ? `translateX(${offset}px)` : '';
      else slides.forEach((s) => { s.style.transform = offset ? `translateX(${offset}px)` : ''; });
      setDisabled(prev, index === 0);
      setDisabled(next, index >= maxIndex());
      bullets.forEach((d, i) => d.classList.toggle('is-active', i === index));
      /* live swiper state classes (observed classMutations) */
      slides.forEach((sl, k) => {
        sl.classList.toggle('swiper-slide-active', k === index);
        sl.classList.toggle('swiper-slide-next', k === index + 1);
        sl.classList.toggle('swiper-slide-prev', k === index - 1);
      });
      bullets.forEach((d, i) => d.classList.toggle('swiper-pagination-bullet-active', i === index));
      prev?.classList.toggle('swiper-button-disabled', index === 0);
      next?.classList.toggle('swiper-button-disabled', index >= maxIndex());
    }

    function go(i) {
      index = Math.min(Math.max(i, 0), Math.max(maxIndex(), bullets.length ? bullets.length - 1 : 0));
      index = Math.min(index, slides.length - 1);
      render();
    }

    [prev, next].forEach((btn) => btn && btn.addEventListener('click', () => {
      if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
      go(index + Number(btn.dataset.dir));
    }));
    bullets.forEach((d, i) => d.addEventListener('click', () => go(i)));

    let x0 = null;
    viewport.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    viewport.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    });
    window.addEventListener('resize', () => { index = 0; render(); });
  }

  function initFaq(block) {
    const btn = block.querySelector('.accordion-faq-view-all');
    if (!btn) return;
    btn.addEventListener('click', () => {
      block.classList.add('is-expanded');
      btn.hidden = true;
    });
  }

  function init() {
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
    document.querySelectorAll('.accordion.faq').forEach(initFaq);
    document.querySelectorAll('.designer-collections-video').forEach((v) => {
      v.addEventListener('click', () => (v.paused ? v.play() : v.pause()));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
