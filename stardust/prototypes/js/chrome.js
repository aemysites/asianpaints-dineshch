// Chrome behaviour: mobile drawer (hamburger), nav dropdowns, footer mobile accordions.
// Everything starts closed; nothing here changes the initial frame.
(() => {
  const header = document.querySelector('header .header');
  if (header) {
    const desktop = window.matchMedia('(min-width: 992px)');
    let ticking = false;
    const updateScroll = () => {
      ticking = false;
      const scrolled = (window.scrollY || 0) > 8;
      header.classList.toggle('desktop-scrolled', desktop.matches && scrolled);
      header.classList.toggle('mobile-scrolled', !desktop.matches && scrolled);
    };
    updateScroll();
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); } }, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    const burger = header.querySelector('.nav-hamburger');
    const navBar = header.querySelector('.header-nav-bar');
    const mobile = window.matchMedia('(width <= 991px)');
    const closeAll = () => header.querySelectorAll('.nav-item.active').forEach((li) => li.classList.remove('active'));

    burger?.addEventListener('click', () => {
      const open = !navBar.classList.contains('mobile-open');
      navBar.classList.toggle('mobile-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('nav-open', open);
      if (!open) closeAll();
    });

    header.querySelectorAll('.nav-item.has-dropdown').forEach((li) => {
      li.addEventListener('mouseenter', () => { if (!mobile.matches) li.classList.add('active'); });
      li.addEventListener('mouseleave', () => { if (!mobile.matches) li.classList.remove('active'); });
      li.querySelector(':scope > .nav-link').addEventListener('click', (e) => {
        e.preventDefault();
        const was = li.classList.contains('active');
        closeAll();
        li.classList.toggle('active', !was);
      });
      li.querySelector('.dropdown-back')?.addEventListener('click', () => li.classList.remove('active'));
    });
  }

  const narrow = window.matchMedia('(width < 768px)');
  document.querySelectorAll('footer .mega-center .group-header').forEach((t) => {
    const toggle = () => {
      if (!narrow.matches) return;
      t.setAttribute('aria-expanded', String(t.getAttribute('aria-expanded') !== 'true'));
    };
    t.addEventListener('click', toggle);
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
})();
