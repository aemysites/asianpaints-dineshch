/**
 * explore-split — "Explore beyond colours": textures + wallpapers.
 * One row per panel: [desktop cell: heading, CTA, pictures] [mobile cell: pictures, CTA].
 * Desktop shows both panels side by side; mobile shows tabs (presentational clones of the
 * panel headings, EW4) switching between the mobile cells.
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

function stripInstrumentation(node) {
  [node, ...node.querySelectorAll('*')].forEach((n) => {
    [...n.attributes].filter((at) => at.name.startsWith('data-')).forEach((at) => n.removeAttribute(at.name));
  });
  return node;
}

function units(cell, desktop) {
  const out = [];
  let img = desktop ? 1 : 0;
  [...cell.children].forEach((n) => {
    if (/^H[1-6]$/.test(n.tagName)) {
      out.push(n);
      return;
    }
    const a = n.querySelector('a[href]') || (n.tagName === 'A' ? n : null);
    if (a && !n.querySelector('picture, img')) {
      a.className = 'button';
      const wrap = el('div', 'es-item button-container', textUnit(a, cell));
      if (desktop) wrap.classList.add('img-1');
      out.push(wrap);
      return;
    }
    const pics = pictures(n).concat(n.matches('picture, img') ? [n] : []);
    pics.forEach((p) => {
      img += 1;
      out.push(el('div', `es-item img-${img}`, p));
    });
  });
  return out;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .explore-split-desktop')) return;
  const rows = [...block.children];
  const desktop = el('div', 'explore-split-desktop');
  const tabs = el('div', 'explore-mobile-tabs');
  tabs.setAttribute('role', 'tablist');
  const mobile = el('div', 'explore-split-mobile', tabs);
  const kinds = ['textures', 'wallpapers'];
  const panels = [];
  rows.forEach((row, i) => {
    const kind = kinds[i] || `panel-${i + 1}`;
    const [dCell, mCell] = row.children;
    const heading = dCell?.querySelector('h1, h2, h3, h4, h5, h6');
    desktop.append(el('div', `${kind}-desktop`, units(dCell, kind === 'textures')));
    const tab = heading ? stripInstrumentation(heading.cloneNode(true)) : el('h3', '', kind);
    tab.removeAttribute('id');
    tab.className = `explore-tab${i === 0 ? ' active' : ''}`;
    tab.setAttribute('role', 'tab');
    tab.tabIndex = 0;
    tab.setAttribute('aria-selected', String(i === 0));
    tab.dataset.panel = kind;
    tabs.append(tab);
    const panel = el('div', `${kind}-mobile`, mCell ? units(mCell, false) : []);
    panel.dataset.panel = kind;
    if (i > 0) panel.hidden = true;
    panels.push(panel);
    mobile.append(panel);
  });
  block.replaceChildren(desktop, mobile);

  const textures = panels[0];
  const layout = () => {
    if (!textures || textures.hidden) return;
    const h = (n) => {
      const img = textures.querySelector(`.img-${n} img`);
      if (!img || !img.naturalWidth) return 0;
      return Math.round((img.offsetWidth / img.naturalWidth) * img.naturalHeight);
    };
    const h1 = h(1);
    const h2 = h(2);
    if (h1) textures.style.setProperty('--es-h1', `${h1}px`);
    if (h2) textures.style.setProperty('--es-h2', `${h2}px`);
  };
  textures?.querySelectorAll('img').forEach((img) => img.addEventListener('load', layout));
  window.addEventListener('resize', layout);
  layout();
  const tabEls = [...tabs.children];
  tabEls.forEach((tab, i) => {
    const activate = () => {
      tabEls.forEach((t) => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      panels.forEach((p, k) => {
        p.hidden = k !== i;
      });
      layout();
    };
    tab.addEventListener('click', activate);
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}
