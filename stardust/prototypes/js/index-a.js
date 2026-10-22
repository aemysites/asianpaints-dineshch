/* index-a — behaviour for <main> sections 0–6. Initial frame is static HTML; this only adds
   timer/click behaviour (hero autoplay + arrows, carousel arrows, explore tabs, form message). */
(() => {
  const ready = (fn) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());

  ready(() => {
    /* hero: video rendition chosen at load like the source (innerWidth < 768 → mobile) */
    document.querySelectorAll('.carousel-hero-banner .hero-video').forEach((v) => {
      v.src = window.innerWidth < 768 ? v.dataset.srcMobile : v.dataset.srcDesktop;
      v.muted = true;
      v.play?.().catch(() => {});
    });

    /* hero: image-link labels follow the rendition the source picks at load (mobile < 768) */
    if (window.innerWidth < 768) {
      document.querySelectorAll('.carousel-hero-banner [data-label-mobile]').forEach((a) => a.setAttribute('aria-label', a.dataset.labelMobile));
    }

    /* live swiper state classes (observed classMutations), mirrored so the state machine matches */
    const markSwiperState = (slides, i, bullets, prev, next, atStart, atEnd) => {
      slides.forEach((s, k) => {
        s.classList.toggle('swiper-slide-active', k === i);
        s.classList.toggle('swiper-slide-next', k === i + 1);
        s.classList.toggle('swiper-slide-prev', k === i - 1);
      });
      bullets.forEach((b, k) => b.classList.toggle('swiper-pagination-bullet-active', k === Math.min(i, bullets.length - 1)));
      prev?.classList.toggle('swiper-button-disabled', atStart);
      next?.classList.toggle('swiper-button-disabled', atEnd);
    };

    /* live swiper init stamps (observed classMutations at init; no styling attached here) */
    const stamp = (sel, ...cls) => document.querySelectorAll(sel).forEach((el) => el.classList.add(...cls));
    stamp('.color-gallery-swiper, .featured-products-images, .tools-carousel-track', 'swiper-initialized', 'swiper-horizontal', 'swiper-backface-hidden');
    stamp('.carousel-hero-banner', 'swiper-initialized', 'swiper-horizontal', 'swiper-watch-progress', 'swiper-backface-hidden');
    stamp('.carousel-hero-banner .hero-slide.is-active', 'swiper-slide-visible', 'swiper-slide-fully-visible');
    stamp('.color-gallery-pagination, .featured-products-pagination, .carousel-hero-banner .hero-pagination', 'swiper-pagination-bullets', 'swiper-pagination-horizontal');

    /* hero: fade carousel, slide 1 holds 18 s, others 5 s (source data-swiper-autoplay) */
    const hero = document.querySelector('.carousel-hero-banner');
    if (hero) {
      const slides = [...hero.querySelectorAll('.hero-slide')];
      const bullets = [...hero.querySelectorAll('.hero-bullet')];
      const prev = hero.querySelector('.hero-prev');
      const next = hero.querySelector('.hero-next');
      const delays = [18000, 5000, 5000, 5000];
      let idx = 0;
      let timer;
      const go = (i) => {
        const from = idx;
        idx = (i + slides.length) % slides.length;
        if (from !== idx) {
          const out = slides[from];
          out.classList.add('is-leaving');
          setTimeout(() => out.classList.remove('is-leaving'), 800);
        }
        slides.forEach((s, k) => s.classList.toggle('is-active', k === idx));
        markSwiperState(slides, idx, bullets, prev, next, idx === 0, idx === slides.length - 1);
        bullets.forEach((b, k) => b.classList.toggle('is-active', k === idx));
        if (prev) prev.disabled = idx === 0;
        if (next) next.disabled = idx === slides.length - 1;
        clearTimeout(timer);
        timer = setTimeout(() => go(idx + 1), delays[idx] || 5000);
      };
      bullets.forEach((b, k) => b.addEventListener('click', () => go(k)));
      prev?.addEventListener('click', () => go(idx - 1));
      next?.addEventListener('click', () => go(idx + 1));
      timer = setTimeout(() => go(1), delays[0]);
    }

    /* simple translate carousels with prev/next buttons */
    const slider = (trackSel, slideSel, prevSel, nextSel, bulletSel, autoplay) => {
      const track = document.querySelector(trackSel);
      if (!track) return;
      const slides = [...track.querySelectorAll(slideSel)];
      const prev = document.querySelector(prevSel);
      const next = document.querySelector(nextSel);
      const bullets = bulletSel ? [...document.querySelectorAll(bulletSel)] : [];
      let idx = 0;
      const step = () => {
        const s = slides[0];
        const cs = getComputedStyle(s);
        return s.getBoundingClientRect().width + parseFloat(cs.marginRight || 0);
      };
      const maxIdx = () => {
        const viewport = track.parentElement.getBoundingClientRect().width;
        const total = slides.length * step();
        return Math.max(0, Math.ceil((total - viewport) / step()));
      };
      const go = (i) => {
        idx = Math.max(0, Math.min(i, maxIdx()));
        track.style.transform = idx ? `translateX(${-idx * step()}px)` : '';
        if (prev) prev.disabled = idx === 0;
        if (next) next.disabled = idx >= maxIdx();
        bullets.forEach((b, k) => b.classList.toggle('is-active', k === Math.min(idx, bullets.length - 1)));
        markSwiperState(slides, idx, bullets, prev, next, idx === 0, idx >= maxIdx());
      };
      /* observed autoplay (featured products: delay 4000, loop, pause on hover, not disabled by interaction) */
      if (autoplay) {
        let hovering = false;
        const root = track.closest('.block') || track;
        root.addEventListener('mouseenter', () => { hovering = true; });
        root.addEventListener('mouseleave', () => { hovering = false; });
        const tick = () => {
          if (!hovering) go(idx >= maxIdx() ? 0 : idx + 1);
          setTimeout(tick, autoplay);
        };
        setTimeout(tick, autoplay);
      }
      prev?.addEventListener('click', () => go(idx - 1));
      next?.addEventListener('click', () => go(idx + 1));
      bullets.forEach((b, k) => b.addEventListener('click', () => go(k)));
    };
    slider('.color-gallery-track', '.color-gallery-slide', '.color-gallery-prev', '.color-gallery-next', '.color-gallery-pagination .cg-bullet');
    slider('.featured-products-track', '.featured-products-slide', '.featured-products-prev', '.featured-products-next', '.featured-products-pagination .fp-bullet', 4000);
    slider('.tools-carousel-wrapper-inner', '.tools-carousel-slide', '.tools-carousel-prev', '.tools-carousel-next');

    /* explore split (mobile): tabs + masonry offsets from rendered image heights (source runLayout) */
    const textures = document.querySelector('.textures-mobile');
    const wallpapers = document.querySelector('.wallpapers-mobile');
    const layout = () => {
      if (!textures || textures.hidden) return;
      const h = (n) => {
        const img = textures.querySelector(`.img-${n} img`);
        return img && img.naturalWidth ? Math.round((img.offsetWidth / img.naturalWidth) * img.naturalHeight) : 0;
      };
      const h1 = h(1);
      const h2 = h(2);
      if (h1) textures.style.setProperty('--es-h1', `${h1}px`);
      if (h2) textures.style.setProperty('--es-h2', `${h2}px`);
    };
    textures?.querySelectorAll('img').forEach((img) => img.addEventListener('load', layout));
    window.addEventListener('resize', layout);
    layout();
    document.querySelectorAll('.explore-tab').forEach((tab) => {
      const activate = () => {
        const isTex = tab.dataset.panel === 'textures';
        document.querySelectorAll('.explore-tab').forEach((t) => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', String(t === tab));
        });
        if (textures) textures.hidden = !isTex;
        if (wallpapers) wallpapers.hidden = isTex;
        layout();
      };
      tab.addEventListener('click', activate);
      tab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    });

    /* BHPS form: client-side required check, then a "no backend" notice (prototype has no submission endpoint) */
    const form = document.querySelector('.form-container form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      let ok = true;
      form.querySelectorAll('.form-input').forEach((input) => {
        const err = input.parentElement.querySelector('.form-field-error');
        const empty = !input.value.trim();
        if (err) err.textContent = empty ? 'This field is required' : '';
        if (empty) ok = false;
      });
      if (status) {
        status.hidden = false;
        status.textContent = ok ? 'No backend connected — this prototype does not submit enquiries.' : 'Please fill in the required fields.';
      }
    });
  });
})();
