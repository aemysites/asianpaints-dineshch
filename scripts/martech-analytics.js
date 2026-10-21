/**
 * Web SDK `onBeforeEventSend` for the aem-martech `alloy1` instance: adds the Adobe Analytics
 * variables asianpaints.com sends on every page view (data.__adobe.analytics), so the report
 * suite keeps the same pageName / eVar / prop values as on the source.
 */

const ORG_ID = '5FFF4CAB563CB2507F000101@AdobeOrg';
const PREV_PAGE_KEY = 'ap_prev_pagename';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// 'Repeat' when the AMCV cookie existed before the Web SDK ran, read once at import
const visitorType = /AMCV_[^=]+=/.test(document.cookie) ? 'Repeat' : 'New';

const getCookie = (pattern) => (document.cookie.match(pattern) || [])[1] || '';

function getPageName() {
  const override = document.querySelector('meta[name="pagename"]')?.content?.trim();
  if (override) return override.toLowerCase();
  const country = (document.querySelector('meta[name="country"]')?.content || 'in').toLowerCase();
  const segments = window.location.pathname.split('/').filter(Boolean)
    .map((s) => s.replace(/\.html?$/i, '').toLowerCase());
  return `${country}::${segments.join(':')}`;
}

function getSection() {
  const meta = document.querySelector('meta[name="section"]')?.content;
  if (meta) return meta.toLowerCase();
  return (window.location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase();
}

function getDateString() {
  const d = new Date();
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  const min = String(d.getMinutes()).padStart(2, '0');
  return `year=${d.getFullYear()} | month=${MONTHS[d.getMonth()]} | date=${d.getDate()} | day=${DAYS[d.getDay()]} | time=${d.getHours() % 12 || 12}:${min} ${ampm}`;
}

function getLoginStatus() {
  try {
    if (localStorage.getItem('keycloak-token') && localStorage.getItem('userProfile')) return 'logged in';
  } catch (e) {
    // localStorage blocked, fall through to the cookie
  }
  return getCookie(/(?:^|;\s*)keycloak_authToken=([^;]+)/) ? 'logged in' : 'not logged in';
}

function getEcid() {
  const identity = getCookie(new RegExp(`(?:^|;\\s*)kndctr_${ORG_ID.replace('@', '_')}_identity=([^;]+)`));
  if (identity) {
    try {
      const id = atob(identity.replace(/-/g, '+').replace(/_/g, '/')).match(/\d{38}/);
      if (id) return id[0];
    } catch (e) {
      // not base64, fall back to the AMCV cookie
    }
  }
  return getCookie(/MCMID(?:%7C|\|)(\d+)/);
}

function getGaClientId() {
  const parts = getCookie(/(?:^|;\s*)_ga=([^;]+)/).split('.');
  return parts.length > 3 ? `${parts[2]}.${parts[3]}` : '';
}

function getScrollPercent() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable > 0 ? Math.min(100, Math.round((window.scrollY / scrollable) * 100)) : 0;
}

function getPageLoadTime() {
  const start = window.performance?.timing?.requestStart;
  return start ? Math.round((Date.now() - start) / 100) : '';
}

function readPreviousPageName(pageName) {
  try {
    const previous = sessionStorage.getItem(PREV_PAGE_KEY) || '';
    sessionStorage.setItem(PREV_PAGE_KEY, pageName);
    return previous;
  } catch (e) {
    return '';
  }
}

function pageViewVariables() {
  const pageName = getPageName();
  const timestamp = getDateString();
  const params = new URLSearchParams(window.location.search);
  const scroll = getScrollPercent();
  const vars = {
    pageName,
    eVar5: timestamp,
    prop5: timestamp,
    eVar6: window.location.href,
    prop6: window.location.href,
    eVar9: getLoginStatus(),
    eVar12: getEcid(),
    eVar54: pageName,
    prop54: pageName,
    server: window.location.hostname,
    currencyCode: 'INR',
    eVar2: visitorType,
    prop12: readPreviousPageName(pageName),
    prop13: `highestPercentViewed = ${scroll} | initialPercentViewed=${scroll}`,
    eVar51: getPageLoadTime(),
  };
  const optional = {
    eVar120: getGaClientId(),
    eVar38: params.get('utm_source'),
    eVar39: params.get('utm_medium'),
    eVar87: params.get('utm_campaign'),
    eVar0: params.get('cid'),
    prop1: getSection(),
  };
  Object.entries(optional).forEach(([key, value]) => { if (value) vars[key] = value; });
  return vars;
}

// eslint-disable-next-line import/prefer-default-export
export function onBeforeEventSend(payload) {
  if (payload.xdm?.eventType !== 'web.webpagedetails.pageViews') return;
  // eslint-disable-next-line no-underscore-dangle
  const adobe = payload.data.__adobe;
  adobe.analytics = { ...adobe.analytics, ...pageViewVariables() };
}
