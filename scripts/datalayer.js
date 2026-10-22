/**
 * Page-level data layer, carried over from the source's /eds/scripts/analytics_1.js.
 * Fills `digitalData`, pushes `pageLoad` to `adobeDataLayer` (Launch's rules start on it)
 * and `page_view` to `dataLayer` (GTM), once per page, before the tag managers load.
 * Also exposes `window.apDataLayer` and `window.getAdobeBasePayload` for Launch custom code.
 */

const params = () => new URLSearchParams(window.location.search);

/** `in::<path segments joined by ':'>`, `.html` stripped; a `pagename` meta wins. */
export function getPageName() {
  const override = document.querySelector('meta[name="pagename"]')?.content?.trim();
  if (override) return override.toLowerCase();
  const country = (document.querySelector('meta[name="country"]')?.content || 'in').toLowerCase();
  const segments = window.location.pathname.split('/').filter(Boolean)
    .map((s) => s.replace(/\.html?$/i, '').toLowerCase());
  return `${country}::${segments.join(':')}`;
}

/** A `section` meta, else the first path segment. */
export function getSection() {
  const meta = document.querySelector('meta[name="section"]')?.content;
  if (meta) return meta.toLowerCase();
  return (window.location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase();
}

/** 'logged in' / 'not logged in' from the persisted Keycloak state, as on the source. */
export function getLoginStatus() {
  try {
    if (localStorage.getItem('keycloak-token') && localStorage.getItem('userProfile')) return 'logged in';
  } catch {
    // storage blocked: fall back to the cookie
  }
  return /(^|;\s*)keycloak_authToken=[^;]+/.test(document.cookie) ? 'logged in' : 'not logged in';
}

/** The `_ga` cookie's `<random>.<timestamp>` part (GA's client id). */
export function getClientId() {
  const parts = (document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/) || [])[1]?.split('.') || [];
  return parts.length > 3 ? `${parts[2]}.${parts[3]}` : '';
}

function getGaId() {
  const ga = (document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/) || [])[1] || '';
  return decodeURIComponent(ga).replace(/^GA\d+\.\d+\./, '');
}

function getMcid() {
  return (document.cookie.match(/MCMID(?:%7C|\|)(\d+)/) || [])[1] || '';
}

function getUtm() {
  const p = params();
  return {
    source: p.get('utm_source') || p.get('source') || '',
    medium: p.get('utm_medium') || p.get('medium') || '',
    campaign: p.get('utm_campaign') || p.get('campaign') || '',
    cid: p.get('cid') || '',
  };
}

function getPageSections() {
  const parts = window.location.pathname.split('/').filter(Boolean)
    .map((s) => s.replace(/\.html?$/i, ''));
  return {
    pageName: `in::${parts.join(':')}`,
    section1: parts[0] || '',
    section2: parts[1] || '',
    section3: parts[2] || '',
    section4: parts[3] || '',
  };
}

const fields = (names) => Object.fromEntries(names.map((n) => [n, '']));

/** The empty `adobeDataLayer` payload, in the source's shape. */
export function apDataLayer() {
  return {
    event: '',
    eventInfo: fields(['category', 'cta', 'destinationUrl', 'detail', 'detail2', 'errorCode',
      'errorMessage', 'filter', 'flowType', 'location', 'output', 'parentTitle', 'rating',
      'resultCount', 'searchTerm', 'selectedValue', 'shadeCode', 'shadeName', 'shareType', 'status',
      'stepDetails1', 'stepDetails2', 'stepDetails3', 'stepDetails4', 'subFlow', 'title',
      'subSection', 'subSectionOne', 'subSectionTwo', 'target', 'toolType', 'pdfName',
      'appDownloads']),
    login: fields(['loginFunction', 'loginMethod', 'loginStatus', 'loginType',
      'registrationSource', 'userId', 'userType']),
    form: fields(['address1', 'address2', 'construction', 'dataDestination', 'defect',
      'formCampaignId', 'formError', 'formName', 'gstNo', 'landmark', 'language', 'localPainter',
      'pincode', 'selectedDate', 'selectedServices', 'selectedTime', 'shopAddress', 'userType',
      'whatsappOptIn']),
    product: {
      productInfo: [fields(['category', 'price', 'productCoat', 'productCode', 'productName',
        'productSku', 'quantity', 'subProduct'])],
      ...fields(['Product', 'date', 'mcvid', 'productList', 'productUrl', 'productdetails',
        'promoCode', 'time', 'topProducts', 'totalPrice', 'transactionId']),
    },
    page: fields(['pageName', 'pageURL', 'referringUrl', 'pageType', 'section1', 'section2',
      'section3', 'section4', 'timestamp', 'checkPincodeDelivery']),
    user: fields(['loginStatus', 'loginId', 'loginFunction', 'mcid', 'gaID', 'ipAddress']),
    device: fields(['deviceType', 'channel']),
    utmValues: fields(['source', 'medium', 'campaign', 'cid', 'icid']),
  };
}

/** `apDataLayer()` filled with the page, user, device and UTM context. */
export function getAdobeBasePayload() {
  const payload = apDataLayer();
  const { pageName, ...sections } = getPageSections();
  payload.utmValues = getUtm();
  payload.user = {
    loginStatus: getLoginStatus(),
    loginId: '',
    mcid: getMcid(),
    gaID: getGaId(),
    ipAddress: '',
  };
  payload.device = {
    deviceType: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    channel: 'Web',
  };
  payload.page = {
    pageName,
    pageURL: window.location.href,
    referringUrl: document.referrer || '',
    pageType: '',
    ...sections,
    timestamp: new Date().toISOString(),
  };
  return payload;
}

function setDigitalData() {
  const digitalData = window.digitalData || {};
  window.digitalData = digitalData;
  const { pageName, ...sections } = getPageSections();
  const utm = getUtm();
  digitalData.page = { destinationURL: window.location.href, pageName, ...sections };
  digitalData.utmValues = { ...utm, cid: utm.cid || 'null' };
  digitalData.product = {
    productName: '', productCode: '', productPrice: '', productQuantity: 1, relatedProduct: '',
  };
  digitalData.skuCodeList = { skuCodes: '' };
  digitalData.device = { deviceType: navigator.userAgent };
  digitalData.user = {
    loginStatus: digitalData.user?.loginStatus || getLoginStatus(),
    mcid: digitalData.user?.mcid || getMcid(),
    gaID: digitalData.user?.gaID || getGaId(),
    ipAddress: digitalData.user?.ipAddress || '',
    emailId: digitalData.user?.emailId || '',
    mobileNumber: digitalData.user?.mobileNumber || '',
    loginFunction: digitalData.user?.loginFunction || '',
  };
  digitalData.event = digitalData.event || '';
}

let pushed = false;

export function pushPageData() {
  if (pushed) return;
  pushed = true;
  window.apDataLayer = apDataLayer;
  window.getAdobeBasePayload = getAdobeBasePayload;
  setDigitalData();
  window.addEventListener('pageshow', (e) => { if (e.persisted) setDigitalData(); });

  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({ ...getAdobeBasePayload(), event: 'pageLoad' });

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_location: window.location.href,
    page_referrer: document.referrer || '',
    page_title: document.title || '',
  });
}
