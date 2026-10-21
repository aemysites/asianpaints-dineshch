import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Header — template-slotted chrome (prototype stardust/prototypes/fragments/header.html).
 * Content comes from the authored /nav document, classified by content, never by position:
 *   brands  — a list whose items carry a picture + link (+ an optional second, mobile picture);
 *             a paragraph with picture(s) + link after it is the B2B badge
 *   main    — logo paragraph (picture + link), search placeholder paragraph, the action list
 *             (links led by :contractor: / :store: / :profile: / :cart: icons), the CTA (bold link)
 *   nav     — the list with nested lists (dropdowns); a nested item with its own list is a titled
 *             column, a nested link is a row of an untitled column
 *   links   — the remaining plain link list (secondary nav, right of the nav row)
 * Authored nodes are moved into the prototype's DOM; nothing is rebuilt from text.
 * @ew-exempt cart badge count and dropdown back-row label are presentational UI state.
 */

const DESKTOP = window.matchMedia('(width >= 992px)');
const MOBILE = window.matchMedia('(width <= 991px)');
const ACTIONS = {
  contractor: 'contractor-icon',
  store: 'store-btn',
  profile: 'profile-btn',
  cart: 'cart-btn',
};
const ACTION_ORDER = Object.keys(ACTIONS);
const SPLIT_AT = 7;

function el(tag, className = '', attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

/** unwrap `<p>` wrappers the pipeline adds inside list items (#98) */
function unwrapParagraphs(root) {
  root.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
}

function eagerImages(root) {
  root.querySelectorAll('img').forEach((img) => {
    img.loading = 'eager';
  });
}

/**
 * Composes a logo link: the authored pictures move into the authored link,
 * the authored link text becomes its visually hidden label.
 */
function composeLogoLink(container, className, withMobile = true) {
  const link = container.querySelector('a[href]');
  if (!link) return null;
  const pictures = [...container.querySelectorAll('picture')];
  const label = el('span', 'chrome-sr-only');
  label.append(...link.childNodes);
  link.className = className;
  if (!withMobile) {
    if (pictures[0]) link.append(pictures[0]);
    link.append(label);
    return link;
  }
  const wrap = el('span', 'brand-item-picture-wrap');
  const desktop = el('span', 'brand-item-picture-desktop');
  const mobile = el('span', 'brand-item-picture-mobile');
  if (pictures[0]) desktop.append(pictures[0]);
  if (pictures[1]) mobile.append(pictures[1]);
  else if (pictures[0]) mobile.append(desktop.firstElementChild.cloneNode(true));
  wrap.append(desktop, mobile);
  link.append(wrap, label);
  return link;
}

function isSameSite(link) {
  try {
    const url = new URL(link.href, window.location.href);
    return url.origin === window.location.origin && url.pathname === '/';
  } catch {
    return false;
  }
}

function buildBrands(section) {
  const bar = el('div', 'header-brands');
  const inner = el('div', 'header-brands-inner');
  bar.append(inner);
  if (!section) return bar;
  const list = section.querySelector('ul');
  const items = list ? [...list.children] : [];
  const links = items.map((li) => composeLogoLink(li, 'brand-item')).filter(Boolean);
  const active = links.find(isSameSite) || links[0];
  if (active) active.classList.add('active');
  inner.append(...links);
  [...section.querySelectorAll(':scope > p')].forEach((p) => {
    if (!p.querySelector('picture') || !p.querySelector('a[href]')) return;
    const b2b = composeLogoLink(p, 'brand-b2b');
    if (b2b) bar.append(b2b);
  });
  eagerImages(bar);
  return bar;
}

function buildAction(link, index) {
  const icon = link.querySelector('.icon');
  const iconName = icon ? [...icon.classList].find((c) => c.startsWith('icon-'))?.slice(5) : null;
  const name = ACTIONS[iconName] ? iconName : ACTION_ORDER[index];
  if (!name) return null;
  link.className = `action-btn ${ACTIONS[name]}`;
  let img = icon?.querySelector('img');
  if (!img) {
    img = el('img', '', { src: `${window.hlx.codeBasePath}/icons/${name}.svg`, alt: '' });
  }
  img.alt = '';
  img.loading = 'eager';
  if (icon) icon.remove();
  const tooltip = el('span', 'icon-tooltip-text');
  tooltip.append(...link.childNodes);
  link.setAttribute('aria-label', tooltip.textContent.trim());
  link.append(img, tooltip);
  if (name === 'cart') link.append(Object.assign(el('span', 'cart-badge'), { textContent: '0' }));
  if (name === 'profile') {
    link.classList.add('profile-auth-link');
    const wrapper = el('div', 'profile-dropdown-wrapper');
    wrapper.append(link);
    return wrapper;
  }
  return link;
}

function buildMain(section, homeHref) {
  const main = el('div', 'header-main');
  const inner = el('div', 'header-main-inner');
  main.append(inner);

  const burger = el('button', 'nav-hamburger', {
    type: 'button',
    'aria-label': 'Open navigation',
    'aria-expanded': 'false',
    'aria-controls': 'nav',
  });
  burger.append(el('span', 'hamburger-icon'), el('span', 'hamburger-cross'));
  inner.append(burger);

  const paragraphs = section ? [...section.querySelectorAll(':scope > p')] : [];
  const logoP = paragraphs.find((p) => p.querySelector('picture') && p.querySelector('a[href]'));
  const ctaP = paragraphs.find((p) => p.querySelector('strong a, em a, a.button'));
  const searchP = paragraphs.find((p) => p !== logoP && p !== ctaP && !p.querySelector('a, picture'));

  if (logoP) {
    const logo = composeLogoLink(logoP, 'header-logo', false);
    eagerImages(logo);
    inner.append(logo);
  }

  const search = el('div', 'header-search');
  const field = el('div', 'search-field');
  const input = el('input', 'search-input', {
    type: 'text',
    'aria-label': 'Search',
    name: 'global-search',
    autocomplete: 'off',
    placeholder: searchP ? searchP.textContent.trim() : 'Search',
  });
  const placeholder = el('div', 'search-placeholder');
  if (searchP) placeholder.append(...searchP.childNodes);
  field.append(input, placeholder);
  search.append(
    el('span', 'search-icon'),
    field,
    el('button', 'camera-btn', { type: 'button', 'aria-label': 'Search by image' }),
  );
  search.addEventListener('click', () => input.focus());
  // site search stays on the source (results + autosuggest are host-bound): Enter repoints there
  input.addEventListener('keydown', (e) => {
    const q = input.value.trim();
    if (e.key !== 'Enter' || !q) return;
    window.location.href = `https://www.asianpaints.com/searchresult.html?q=${encodeURIComponent(q)}`;
  });
  inner.append(search);

  const actions = el('div', 'header-actions');
  actions.append(el('button', 'mobile-search-btn', { type: 'button', 'aria-label': 'Search' }));
  const actionList = section?.querySelector('ul');
  if (actionList) {
    unwrapParagraphs(actionList);
    [...actionList.querySelectorAll(':scope > li > a[href]')].forEach((a, i) => {
      const action = buildAction(a, i);
      if (action) actions.append(action);
    });
  }
  inner.append(actions);

  if (ctaP) {
    const cta = el('div', 'header-cta');
    const link = ctaP.querySelector('a');
    link.className = 'cta-btn';
    cta.append(ctaP);
    inner.append(cta);
  }

  const home = el('a', 'mobile-home-btn', { href: homeHref || '/', 'aria-label': 'Home' });
  inner.append(home);
  return main;
}

/** the nodes of a list item before its nested list, unwrapped from a `<p>` */
function labelNodes(li) {
  const nodes = [];
  [...li.childNodes].some((n) => {
    if (n.nodeName === 'UL' || n.nodeName === 'OL') return true;
    if (n.nodeName === 'P') nodes.push(...n.childNodes);
    else nodes.push(n);
    return false;
  });
  return nodes;
}

function linkList(items) {
  const ul = el('ul', 'dropdown-links');
  ul.append(...items);
  items.forEach((li) => li.querySelectorAll('a strong').forEach((s) => s.classList.add('new-badge')));
  return ul;
}

function buildColumn(items, titleNodes) {
  const column = el('div', 'dropdown-column');
  if (titleNodes) {
    const title = el('h4', 'dropdown-title');
    title.append(...titleNodes);
    column.append(title);
  } else {
    column.classList.add('dropdown-column-no-title');
  }
  if (items.length > SPLIT_AT) {
    column.classList.add('dropdown-column-wide');
    const split = el('div', 'dropdown-links-split');
    for (let i = 0; i < items.length; i += SPLIT_AT) {
      split.append(linkList(items.slice(i, i + SPLIT_AT)));
    }
    column.append(split);
  } else {
    column.append(linkList(items));
  }
  return column;
}

function buildDropdown(sub, labelText) {
  const dropdown = el('div', 'nav-dropdown');
  const back = el('div', 'dropdown-back', { role: 'button', tabindex: '0' });
  const arrow = el('span', 'back-arrow');
  arrow.textContent = '‹';
  back.append(arrow, labelText);
  const inner = el('div', 'dropdown-inner');
  const children = [...sub.children];
  const leaves = [];
  children.forEach((li) => {
    const nested = li.querySelector(':scope > ul, :scope > ol');
    if (nested) {
      if (leaves.length) inner.append(buildColumn(leaves.splice(0)));
      inner.append(buildColumn([...nested.children], labelNodes(li)));
    } else {
      leaves.push(li);
    }
  });
  if (leaves.length) inner.append(buildColumn(leaves.splice(0)));
  sub.remove();
  dropdown.append(back, inner);
  return dropdown;
}

function buildNavList(list) {
  list.className = 'nav-list';
  unwrapParagraphs(list);
  [...list.children].forEach((li, i) => {
    li.className = `nav-item nav-item-${i + 1}`;
    const sub = li.querySelector(':scope > ul, :scope > ol');
    if (sub) {
      li.classList.add('has-dropdown');
      const label = labelNodes(li);
      const trigger = el('a', 'nav-link', { href: '#', 'aria-expanded': 'false' });
      trigger.append(...label);
      const labelText = trigger.textContent.trim();
      trigger.append(el('span', 'nav-chevron'));
      const dropdown = buildDropdown(sub, labelText);
      li.replaceChildren(trigger, dropdown);
      return;
    }
    const link = li.querySelector('a[href]');
    if (!link) return;
    link.className = 'nav-link';
    if (isSameSite(link)) {
      li.classList.add('nav-home');
      link.setAttribute('aria-label', link.textContent.trim());
      const label = el('span', 'chrome-sr-only');
      label.append(...link.childNodes);
      link.append(label);
    }
  });
  return list;
}

function buildNavBar(navSection, linksSection) {
  const bar = el('div', 'header-nav-bar', { id: 'nav' });
  const inner = el('div', 'header-nav-inner');
  const left = el('div', 'nav-left');
  const right = el('div', 'nav-right');
  const mainNav = el('nav', 'main-nav', { 'aria-label': 'Main navigation' });
  const navList = navSection?.querySelector('ul');
  if (navList) mainNav.append(buildNavList(navList));
  left.append(mainNav);
  const secondary = el('nav', 'secondary-nav', { 'aria-label': 'Secondary navigation' });
  const linksList = linksSection?.querySelector('ul');
  if (linksList) {
    unwrapParagraphs(linksList);
    linksList.className = 'secondary-nav-list';
    secondary.append(linksList);
  }
  right.append(secondary);
  inner.append(left, right);
  bar.append(inner);
  return bar;
}

function classify(fragment) {
  const wrappers = [...fragment.querySelectorAll(':scope > .section')]
    .map((s) => s.querySelector('.default-content-wrapper') || s)
    .filter((w) => w.children.length);
  const roles = {};
  wrappers.forEach((w) => {
    if (!roles.nav && w.querySelector('ul ul, ol ol')) roles.nav = w;
    else if (!roles.brands && w.querySelector('li picture')) roles.brands = w;
    else if (!roles.main && w.querySelector('.icon, strong a, em a, a.button')) roles.main = w;
    else if (!roles.links && w.querySelector('ul')) roles.links = w;
  });
  return roles;
}

function wireBehaviour(header) {
  let ticking = false;
  const updateScroll = () => {
    ticking = false;
    const scrolled = (window.scrollY || 0) > 8;
    header.classList.toggle('desktop-scrolled', DESKTOP.matches && scrolled);
    header.classList.toggle('mobile-scrolled', !DESKTOP.matches && scrolled);
  };
  updateScroll();
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });

  const burger = header.querySelector('.nav-hamburger');
  const navBar = header.querySelector('.header-nav-bar');
  const items = [...header.querySelectorAll('.nav-item.has-dropdown')];

  const setItem = (li, open) => {
    li.classList.toggle('active', open);
    li.querySelector(':scope > .nav-link').setAttribute('aria-expanded', String(open));
  };
  const closeAll = () => items.forEach((li) => setItem(li, false));
  const setDrawer = (open) => {
    navBar.classList.toggle('mobile-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('nav-open', open);
    if (!open) closeAll();
  };

  burger.addEventListener('click', () => setDrawer(!navBar.classList.contains('mobile-open')));

  items.forEach((li) => {
    const trigger = li.querySelector(':scope > .nav-link');
    li.addEventListener('mouseenter', () => {
      if (!MOBILE.matches) setItem(li, true);
    });
    li.addEventListener('mouseleave', () => {
      if (!MOBILE.matches) setItem(li, false);
    });
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      // desktop: hover already opened it, a click keeps it open (as the source); the drawer toggles
      const was = !MOBILE.matches ? false : li.classList.contains('active');
      closeAll();
      setItem(li, !was);
    });
    const back = li.querySelector('.dropdown-back');
    const closeItem = () => {
      setItem(li, false);
      trigger.focus();
    };
    back.addEventListener('click', closeItem);
    back.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeItem();
      }
    });
    li.addEventListener('focusout', (e) => {
      if (!MOBILE.matches && !li.contains(e.relatedTarget)) setItem(li, false);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = items.find((li) => li.classList.contains('active'));
    if (open) {
      setItem(open, false);
      open.querySelector(':scope > .nav-link').focus();
    } else if (navBar.classList.contains('mobile-open')) {
      setDrawer(false);
      burger.focus();
    }
  });

  DESKTOP.addEventListener('change', () => {
    setDrawer(false);
    updateScroll();
  });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const roles = classify(fragment);
  const homeLink = roles.main?.querySelector('p a[href]');
  const homeHref = homeLink ? homeLink.getAttribute('href') : '/';

  const brands = buildBrands(roles.brands);
  const sticky = el('div', 'header-sticky');
  sticky.append(buildMain(roles.main, homeHref), buildNavBar(roles.nav, roles.links));

  block.replaceChildren(brands, sticky);
  wireBehaviour(block);
}
