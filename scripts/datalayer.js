/**
 * Page-level data layer, matching what asianpaints.com exposes to its tags:
 *   window.digitalData        legacy page/user/utm context
 *   window.adobeDataLayer     `pageLoad` event read by the Adobe Launch (ACDL) rules
 *   window.dataLayer          `page_view` event read by Google Tag Manager
 * Pushes queue until Launch and GTM load in the delayed phase.
 */

function toUrl(urlLike) {
  try {
    return new URL(urlLike, window.location.origin);
  } catch (e) {
    return new URL(window.location.href);
  }
}

function getParam(url, key) {
  return url.searchParams.get(key) || '';
}

function getCookie(pattern) {
  return (document.cookie.match(pattern) || [])[1] || '';
}

function getLoginStatus() {
  try {
    if (localStorage.getItem('keycloak-token') && localStorage.getItem('userProfile')) return 'logged in';
  } catch (e) {
    // localStorage blocked, fall through to the cookie
  }
  return getCookie(/(?:^|;\s*)keycloak_authToken=([^;]+)/) ? 'logged in' : 'not logged in';
}

const getMcid = () => getCookie(/MCMID(?:%7C|\|)(\d+)/);

const getGaId = () => decodeURIComponent(getCookie(/(?:^|;\s*)_ga=([^;]+)/)).replace(/^GA\d+\.\d+\./, '');

function getUtm(url) {
  const pick = (...keys) => keys.map((key) => getParam(url, key)).find(Boolean) || '';
  return {
    source: pick('utm_source', 'source'),
    medium: pick('utm_medium', 'medium'),
    campaign: pick('utm_campaign', 'campaign'),
    cid: getParam(url, 'cid'),
  };
}

function buildPageData(url) {
  const parts = url.pathname.split('/').filter(Boolean).map((s) => s.replace(/\.html?$/i, ''));
  return {
    destinationURL: url.href,
    pageName: `in::${parts.join(':')}`,
    section1: parts[0] || '',
    section2: parts[1] || '',
    section3: parts[2] || '',
    section4: parts[3] || '',
  };
}

const blank = (keys) => Object.fromEntries(keys.map((key) => [key, '']));

/** The empty ACDL event shape used by every asianpaints.com push. */
export function apDataLayer() {
  return {
    event: '',
    eventInfo: blank(['category', 'cta', 'destinationUrl', 'detail', 'detail2', 'errorCode',
      'errorMessage', 'filter', 'flowType', 'location', 'output', 'parentTitle', 'rating',
      'resultCount', 'searchTerm', 'selectedValue', 'shadeCode', 'shadeName', 'shareType', 'status',
      'stepDetails1', 'stepDetails2', 'stepDetails3', 'stepDetails4', 'subFlow', 'title',
      'subSection', 'subSectionOne', 'subSectionTwo', 'target', 'toolType', 'pdfName',
      'appDownloads']),
    login: blank(['loginFunction', 'loginMethod', 'loginStatus', 'loginType', 'registrationSource',
      'userId', 'userType']),
    form: blank(['address1', 'address2', 'construction', 'dataDestination', 'defect',
      'formCampaignId', 'formError', 'formName', 'gstNo', 'landmark', 'language', 'localPainter',
      'pincode', 'selectedDate', 'selectedServices', 'selectedTime', 'shopAddress', 'userType',
      'whatsappOptIn']),
    product: {
      productInfo: [blank(['category', 'price', 'productCoat', 'productCode', 'productName',
        'productSku', 'quantity', 'subProduct'])],
      ...blank(['Product', 'date', 'mcvid', 'productList', 'productUrl', 'productdetails',
        'promoCode', 'time', 'topProducts', 'totalPrice', 'transactionId']),
    },
    page: blank(['pageName', 'pageURL', 'referringUrl', 'pageType', 'section1', 'section2',
      'section3', 'section4', 'timestamp', 'checkPincodeDelivery']),
    user: blank(['loginStatus', 'loginId', 'loginFunction', 'mcid', 'gaID', 'ipAddress']),
    device: blank(['deviceType', 'channel']),
    utmValues: blank(['source', 'medium', 'campaign', 'cid', 'icid']),
  };
}

/** An ACDL event pre-filled with the current page, user, device and UTM context. */
export function getAdobeBasePayload() {
  const url = toUrl(window.location.href);
  const page = buildPageData(url);
  const payload = apDataLayer();
  payload.utmValues = getUtm(url);
  payload.user = {
    loginStatus: getLoginStatus(), loginId: '', mcid: getMcid(), gaID: getGaId(), ipAddress: '',
  };
  payload.device = {
    deviceType: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    channel: 'Web',
  };
  payload.page = {
    pageName: page.pageName,
    pageURL: page.destinationURL,
    referringUrl: document.referrer || '',
    pageType: '',
    section1: page.section1,
    section2: page.section2,
    section3: page.section3,
    section4: page.section4,
    timestamp: new Date().toISOString(),
  };
  return payload;
}

/** Pushes an ACDL event, e.g. pushAdobeEvent('custom_cta_click', { eventInfo: { cta } }). */
export function pushAdobeEvent(event, { eventInfo = {}, ...rest } = {}) {
  const payload = getAdobeBasePayload();
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    ...payload, ...rest, event, eventInfo: { ...payload.eventInfo, ...eventInfo },
  });
}

function setDigitalData() {
  const url = toUrl(window.location.href);
  const digitalData = window.digitalData || {};
  window.digitalData = digitalData;
  digitalData.page = buildPageData(url);
  digitalData.utmValues = { ...getUtm(url), cid: getParam(url, 'cid') || 'null' };
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

/** Once per page: digitalData, the ACDL `pageLoad` and the GTM `page_view`. */
export function pushPageLoad() {
  setDigitalData();
  window.addEventListener('pageshow', (e) => { if (e.persisted) setDigitalData(); });
  // Launch custom code on the source reads these globals
  window.apDataLayer = apDataLayer;
  window.getAdobeBasePayload = getAdobeBasePayload;
  pushAdobeEvent('pageLoad');
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_location: window.location.href,
    page_referrer: document.referrer || '',
    page_title: document.title || '',
  });
}
