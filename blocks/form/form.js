/**
 * form — BHPS lead form (template-slotted). Rows are keyed by their first cell:
 *   title    | small title, large title, subtitle paragraphs
 *   field    | label | placeholder          (one row per input)
 *   checkbox | label
 *   choice   | question | list of options   (radio group)
 *   consent  | consent note (with links)
 *   submit   | button label
 * There is no submission backend: a valid submit shows "No backend connected".
 * @ew-exempt row keys and input placeholders are configuration
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

const TYPES = [[/mail/i, 'email'], [/mobile|phone/i, 'tel']];
const MAXLEN = [[/mobile|phone/i, 10], [/pin/i, 6]];

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function decorate(block) {
  if (block.querySelector(':scope > form')) return;
  block.classList.add('white-form');
  const form = el('form', 'form-row form-attributes');
  form.noValidate = true;
  const desc = el('div', 'form-description-cell');
  const grid = el('div', 'form-inputs-grid');
  const questions = el('div', 'new-questions-wrapper');
  const disclaimers = el('div', 'new-disclaimer-questions');
  const footer = el('div', 'form-bhps-footer');
  const button = el('button', 'form-submit');
  button.type = 'submit';
  const status = el('p', 'form-status');
  status.setAttribute('role', 'status');
  status.hidden = true;
  let choiceN = 0;

  [...block.children].forEach((row) => {
    const [keyCell, ...cells] = [...row.children];
    const key = (keyCell?.textContent || '').trim().toLowerCase();
    const paras = (cell) => (cell ? [...cell.querySelectorAll(':scope > p, :scope > h2, :scope > h3')] : []);
    const unit = (cell) => {
      if (paras(cell)[0]) return paras(cell)[0];
      return cell && cell.textContent.trim() ? textUnit(cell.firstChild, cell) : null;
    };
    if (key === 'title') {
      const ps = paras(cells[0]);
      const list = ps.length ? ps : [unit(cells[0])];
      ['form-title-small', 'form-title-large', 'form-subtitle'].forEach((c, k) => {
        if (list[k]) desc.append(el('div', c, list[k]));
      });
    } else if (key === 'field') {
      const label = unit(cells[0]);
      const name = (label?.textContent || '').trim();
      const placeholder = (cells[1]?.textContent || '').trim();
      const id = `enquire-${slug(name)}`;
      const input = el('input', 'form-input');
      input.id = id;
      input.name = `ENQUIRE_${slug(name).toUpperCase().replace(/-/g, '_')}`;
      const [, type] = TYPES.find(([re]) => re.test(name)) || [0, 'text'];
      input.type = type;
      const [, max] = MAXLEN.find(([re]) => re.test(name)) || [];
      if (max) input.maxLength = max;
      input.placeholder = placeholder;
      const lab = el('label', 'form-field-label', label, el('span', 'form-field-required', '*'));
      lab.htmlFor = id;
      grid.append(el('div', 'form-input-cell', el('div', 'form-field', lab, input, el('div', 'form-field-error'))));
    } else if (key === 'checkbox') {
      const input = el('input', 'form-checkbox-input');
      input.type = 'checkbox';
      input.name = 'CUSTOM_CHECKBOX';
      input.checked = true;
      const custom = el('span', 'form-checkbox-custom');
      custom.setAttribute('aria-label', 'whatsapp toggle button');
      const text = el('span', 'form-custom-label-text', unit(cells[0]));
      questions.prepend(el('label', 'form-whatsapp-consent', input, custom, text));
    } else if (key === 'choice') {
      choiceN += 1;
      const legend = el('legend', '', unit(cells[0]), el('span', 'form-required', '*'));
      const list = cells[1]?.querySelector('ul, ol');
      const opts = el('div', 'radio-options-wrapper');
      if (list) {
        [...list.children].forEach((li) => {
          const input = el('input', 'form-radio-input');
          input.type = 'radio';
          input.name = `NEW_CUSTOM_CHECKBOX_customer_response_${choiceN}`;
          input.value = li.textContent.trim();
          li.prepend(input, el('span', 'form-radio-custom'));
          li.addEventListener('click', (e) => {
            if (e.target !== input) input.checked = true;
          });
        });
        opts.append(list);
      }
      disclaimers.append(el('div', `disclaimer-group disclaimer-ques-${choiceN}`, el('fieldset', '', legend, opts)));
    } else if (key === 'consent') {
      const note = unit(cells[0]);
      note?.querySelectorAll('a').forEach((a) => a.classList.add('form-consent-note-link'));
      footer.prepend(el('div', 'form-consent-note', note));
    } else if (key === 'submit') {
      button.append(el('span', 'form-submit-label', unit(cells[0])), el('span', 'form-submit-arrow'));
    }
  });

  if (!button.firstChild) button.append(el('span', 'form-submit-arrow'));
  footer.append(el('div', 'form-button-cell', button), status);
  questions.append(disclaimers);
  form.append(desc, el('div', 'form-fields-area', grid, el('div', 'form-consent-area', questions), footer));
  block.replaceChildren(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('.form-input').forEach((input) => {
      const err = input.parentElement.querySelector('.form-field-error');
      const empty = !input.value.trim();
      if (err) err.textContent = empty ? 'This field is required' : '';
      if (empty) ok = false;
    });
    status.hidden = false;
    status.textContent = ok ? 'No backend connected' : 'Please fill in the required fields.';
  });
}
