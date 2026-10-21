import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/*
 * Footer — template-slotted chrome (prototype stardust/prototypes/fragments/footer.html).
 * Content comes from the authored /footer document, classified by content:
 *   brand     — the section with tel:/mailto: links (logo paragraph, contact list, public notice)
 *   groups    — sections of heading + link list; the last one is the "about" column, the others
 *               fill the white panel in order: left, middle, then one right column each
 *   banner    — the section with pictures and no list (desktop picture, mobile picture, label)
 *   logos     — heading + list of picture/link items: first = global presence, second = divisions
 *   bottom    — list of picture/link items without a heading (social), copyright, sitemap link
 * Authored nodes are moved into the prototype's DOM; nothing is rebuilt from text.
 */

const NARROW = window.matchMedia('(width < 768px)');

function el(tag, className = '', attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

function icon(name, className = '') {
  return el('img', className, {
    src: `${window.hlx.codeBasePath}/icons/${name}`,
    alt: '',
    loading: 'lazy',
  });
}

/** picture + link item → the authored link holding the picture and a hidden label */
function logoLink(container, className, visibleLabelClass) {
  const link = container.querySelector('a[href]');
  if (!link) return null;
  const picture = container.querySelector('picture');
  const label = el('span', visibleLabelClass || 'chrome-sr-only');
  label.append(...link.childNodes);
  link.className = className;
  if (picture) link.append(picture);
  link.append(label);
  return link;
}

function buildBrand(section) {
  const col = el('div', 'mega-col mega-col-brand');
  if (!section) return col;
  const logoP = [...section.querySelectorAll(':scope > p')].find((p) => p.querySelector('picture'));
  if (logoP) {
    const logo = logoLink(logoP, 'footer-brand-logo');
    logo.setAttribute('aria-label', logo.textContent.trim());
    col.append(logo);
  }
  const contact = el('div', 'footer-brand-contact');
  section.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach((a) => {
    const mail = a.getAttribute('href').startsWith('mailto:');
    a.className = mail ? 'contact-row email-row' : 'contact-row';
    const text = el('span', mail ? 'email-label' : '');
    text.append(...a.childNodes);
    if (mail) {
      const node = text.firstChild;
      const at = node?.nodeType === Node.TEXT_NODE ? node.textContent.indexOf('@') : -1;
      if (at > 0) node.splitText(at);
      [...text.childNodes].forEach((n) => {
        const line = el('span', 'email-line');
        n.replaceWith(line);
        line.append(n);
      });
    }
    a.append(icon(mail ? 'email.svg' : 'phone.svg'), text);
    contact.append(a);
  });
  col.append(contact);
  const notes = [...section.querySelectorAll(':scope > p')].filter((p) => p !== logoP);
  if (notes.length) {
    const notice = el('div', 'footer-public-notice');
    const [first, ...rest] = notes;
    const labelled = notes.length > 1 && first.querySelector('strong');
    if (labelled) {
      const label = el('div', 'notice-label');
      label.append(first);
      notice.append(label);
    }
    (labelled ? rest : notes).forEach((p) => {
      p.classList.add('notice-body');
      notice.append(p);
    });
    col.append(notice);
  }
  return col;
}

/** heading + list pairs of one section → link groups */
function linkGroups(section, { panel = false, product = false } = {}) {
  const groups = [];
  section.querySelectorAll(':scope > :is(h2, h3, h4, h5, h6)').forEach((heading) => {
    const list = heading.nextElementSibling;
    const group = el('div', panel ? 'link-group panel-group' : 'link-group');
    const titleLink = heading.querySelector('a[href]');
    let title;
    if (panel) {
      title = el('div', 'link-group-title group-header', {
        role: 'button',
        tabindex: '0',
        'aria-expanded': 'false',
      });
      heading.className = `group-title clickable-title${product ? ' product-title' : ''}`;
      const plus = el('span', 'accordion-icon');
      plus.textContent = '+';
      title.append(heading, plus);
    } else if (titleLink) {
      titleLink.className = 'link-group-title';
      const span = el('span');
      span.append(...titleLink.childNodes);
      titleLink.append(span);
      title = heading;
    } else {
      title = el('div', 'link-group-title');
      title.append(heading);
    }
    group.append(title);
    if (list && (list.tagName === 'UL' || list.tagName === 'OL')) {
      list.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
      list.className = panel ? 'link-group-list group-links' : 'link-group-list';
      [...list.children].forEach((li) => li.classList.add('group-link'));
      group.append(list);
    }
    groups.push(group);
  });
  return groups;
}

function buildCenter(sections) {
  const center = el('div', 'mega-center');
  const grid = el('nav', 'mega-center-grid footer-col col-two', { 'aria-label': 'Footer links' });
  center.append(grid);
  const [left, middle, ...right] = sections;
  [['panel-left', left], ['panel-middle', middle]].forEach(([cls, section]) => {
    if (!section) return;
    const panel = el('div', `panel-section ${cls} mega-col-links`);
    panel.append(...linkGroups(section, { panel: true }));
    grid.append(panel);
  });
  if (right.length) {
    const panel = el('div', 'panel-section panel-right mega-col-links');
    const inner = el('div', 'right-inner');
    right.forEach((section) => {
      const col = el('div', 'right-col');
      col.append(...linkGroups(section, { panel: true, product: true }));
      inner.append(col);
    });
    panel.append(inner);
    grid.append(panel);
  }
  return center;
}

function buildBanner(section) {
  const banner = el('section', 'footer-video-banner');
  const bg = el('div', 'video-bg');
  const pictures = [...section.querySelectorAll('picture')];
  // full-bleed banner: the source serves a ~2886w rendition, the pipeline default is 2000w
  pictures.forEach((pic) => pic.querySelectorAll('source[media]').forEach((s) => {
    s.srcset = s.srcset.replace('width=2000', 'width=3000');
  }));
  bg.append(...pictures);
  const overlay = el('div', 'video-overlay');
  const label = [...section.querySelectorAll(':scope > p')].find((p) => p.textContent.trim());
  if (label) {
    const btn = el('div', 'watch-now-btn');
    const yt = el('picture', 'yt-icon');
    yt.append(icon('youtube.png', 'yt-icon'));
    const text = el('span');
    text.append(...label.childNodes);
    btn.append(yt, text);
    overlay.append(btn);
  }
  banner.append(bg, el('div', 'video-gradient'), overlay);
  return banner;
}

function titleRow(section) {
  const row = el('div', 'section-title-row');
  const heading = section.querySelector(':scope > :is(h2, h3, h4, h5, h6)');
  if (heading) heading.className = 'section-title';
  row.append(el('span', 'title-line'), heading || '', el('span', 'title-line'));
  return row;
}

function buildLogos(section, kind) {
  const global = kind === 'global';
  const wrap = el('section', global ? 'footer-global' : 'footer-divisions', {
    'aria-label': section.querySelector('h2, h3, h4')?.textContent.trim() || '',
  });
  const inner = el('div', global ? 'footer-global-inner' : 'footer-divisions-inner');
  const list = el('div', global ? 'country-list' : 'division-logos');
  section.querySelectorAll('li').forEach((li) => {
    const link = global
      ? logoLink(li, 'country-item', 'country-name')
      : logoLink(li, 'division-logo');
    if (!link) return;
    if (global) link.querySelector('img')?.classList.add('country-flag');
    list.append(link);
  });
  inner.append(titleRow(section), list);
  wrap.append(inner);
  return wrap;
}

function buildBottom(section) {
  const bottom = el('section', 'footer-bottom', { 'aria-label': 'Footer info' });
  const inner = el('div', 'footer-bottom-inner');
  const social = el('div', 'bottom-social');
  section.querySelectorAll('li').forEach((li) => {
    const link = logoLink(li, 'social-icon');
    if (link) {
      link.setAttribute('aria-label', link.textContent.trim());
      social.append(link);
    }
  });
  inner.append(social);
  section.querySelectorAll(':scope > p').forEach((p) => {
    const link = p.querySelector('a[href]');
    if (link) {
      const sitemap = el('div', 'bottom-sitemap');
      const arrow = el('span', 'sitemap-arrow');
      arrow.textContent = '›';
      link.append(arrow);
      sitemap.append(link);
      inner.append(sitemap);
    } else {
      const copy = el('div', 'bottom-copyright');
      copy.append(p);
      inner.append(copy);
    }
  });
  bottom.append(inner);
  return bottom;
}

function classify(fragment) {
  const wrappers = [...fragment.querySelectorAll(':scope > .section')]
    .map((s) => s.querySelector('.default-content-wrapper') || s)
    .filter((w) => w.children.length);
  const roles = { groups: [], logos: [] };
  wrappers.forEach((w) => {
    const heading = w.querySelector(':scope > :is(h2, h3, h4, h5, h6)');
    const pictureItems = w.querySelector('li picture');
    if (!roles.brand && w.querySelector('a[href^="tel:"], a[href^="mailto:"]')) roles.brand = w;
    else if (heading && pictureItems) roles.logos.push(w);
    else if (heading && w.querySelector('ul, ol')) roles.groups.push(w);
    else if (pictureItems) roles.bottom = w;
    else if (w.querySelector('picture')) roles.banner = w;
  });
  return roles;
}

function wireAccordions(block) {
  block.querySelectorAll('.mega-center .group-header').forEach((t) => {
    const toggle = () => {
      if (!NARROW.matches) return;
      t.setAttribute('aria-expanded', String(t.getAttribute('aria-expanded') !== 'true'));
    };
    t.addEventListener('click', toggle);
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const roles = classify(fragment);
  const content = el('div', 'footer-content');

  const mega = el('section', 'footer-mega', { 'aria-label': 'Footer navigation' });
  const megaInner = el('div', 'footer-mega-inner');
  const grid = el('div', 'mega-grid');
  const about = roles.groups.length > 1 ? roles.groups.pop() : null;
  grid.append(buildBrand(roles.brand), buildCenter(roles.groups));
  if (about) {
    const aboutCol = el('div', 'mega-col mega-col-links mega-col-about');
    aboutCol.append(...linkGroups(about));
    grid.append(aboutCol);
  }
  megaInner.append(grid);
  mega.append(megaInner);
  content.append(mega);

  if (roles.banner) content.append(buildBanner(roles.banner));

  if (roles.logos.length) {
    const band = el('div', 'footer-global-divisions');
    roles.logos.forEach((section, i) => band.append(buildLogos(section, i === 0 ? 'global' : 'divisions')));
    content.append(band);
  }

  if (roles.bottom) content.append(buildBottom(roles.bottom));

  block.replaceChildren(content);
  wireAccordions(block);
}
