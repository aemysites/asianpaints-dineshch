/**
 * accordion (faq) — question/answer rows; the first five show, "VIEW ALL" reveals the rest.
 * Row: [question] [answer]. The question paragraph is hosted in a div[role=button] (EW7: no
 * <summary>/<button> hosts authored text); the first item starts open.
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

const VISIBLE = 5;

export default function decorate(block) {
  if (block.querySelector(':scope > .accordion-item')) return;
  const rows = [...block.children];
  const items = rows.map((row, i) => {
    const [q, a] = row.children;
    const label = el('div', 'accordion-item-label', q ? textUnit(q.firstElementChild || q.firstChild, q) : null);
    label.setAttribute('role', 'button');
    label.tabIndex = 0;
    const body = el('div', 'accordion-item-body', a ? [...a.childNodes] : []);
    const item = el('div', `accordion-item${i >= VISIBLE ? ' accordion-faq-hidden' : ''}${i === 0 ? ' is-open' : ''}`, label, body);
    label.setAttribute('aria-expanded', String(i === 0));
    const toggle = () => {
      const open = item.classList.toggle('is-open');
      label.setAttribute('aria-expanded', String(open));
    };
    label.addEventListener('click', toggle);
    label.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
    return item;
  });
  block.replaceChildren(...items);
  if (rows.length > VISIBLE) {
    const btn = el('button', 'accordion-faq-view-all', 'VIEW ALL');
    btn.type = 'button';
    btn.addEventListener('click', () => {
      block.classList.add('is-expanded');
      btn.remove();
    });
    block.append(btn);
  }
}
