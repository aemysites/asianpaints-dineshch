/**
 * Adobe Analytics variables on the Web SDK (`alloy1`) page view, as the source's
 * /eds/scripts/analytics_1.js sets them (`data.__adobe.analytics`).
 * Used as the aem-martech `onBeforeEventSend` handler; only page views are touched.
 */
import {
  getClientId, getLoginStatus, getPageName, getSection,
} from './datalayer.js';

const ORG_ID = '5FFF4CAB563CB2507F000101@AdobeOrg';
const PREV_PAGE_KEY = 'ap_prev_pagename';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// 'Repeat' when the AMCV cookie predates the SDK; read before the SDK (idMigration) writes it
const visitorType = /AMCV_[^=]+=/.test(document.cookie) ? 'Repeat' : 'New';

function scrollPercent() {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  return range > 0 ? Math.min(100, Math.round((window.scrollY / range) * 100)) : 100;
}

const scroll = { initial: scrollPercent(), highest: 0 };
scroll.highest = scroll.initial;
window.addEventListener('scroll', () => {
  scroll.highest = Math.max(scroll.highest, scrollPercent());
}, { passive: true });

/** 'year=2026 | month=May | date=27 | day=Wednesday | time=8:19 PM' */
function getDateString() {
  const d = new Date();
  const time = `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
  return `year=${d.getFullYear()} | month=${MONTHS[d.getMonth()]} | date=${d.getDate()} | day=${DAYS[d.getDay()]} | time=${time}`;
}

/** The ECID from the Web SDK identity cookie, else the legacy AMCV cookie. */
function getEcid() {
  const name = `kndctr_${ORG_ID.replace(/@/g, '_')}_identity`;
  const value = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1];
  if (value) {
    try {
      const ecid = atob(value.replace(/-/g, '+').replace(/_/g, '/')).match(/\d{38}/)?.[0];
      if (ecid) return ecid;
    } catch {
      // not base64: fall back to AMCV
    }
  }
  return (document.cookie.match(/MCMID(?:%7C|\|)(\d+)/) || [])[1] || '';
}

/** Deciseconds since requestStart, as the legacy s_getLoadTime(). */
function getPageLoadTime() {
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  return nav ? Math.round((performance.now() - nav.requestStart) / 100) : '';
}

function session(key, value) {
  try {
    if (value === undefined) return sessionStorage.getItem(key) || '';
    sessionStorage.setItem(key, value);
  } catch {
    // storage blocked
  }
  return '';
}

function pageViewVariables() {
  const pageName = getPageName();
  const timestamp = getDateString();
  const clientId = getClientId();
  const section = getSection();
  const utm = new URLSearchParams(window.location.search);
  const vars = {
    pageName,
    eVar2: visitorType,
    eVar5: timestamp,
    prop5: timestamp,
    eVar6: window.location.href,
    prop6: window.location.href,
    eVar9: getLoginStatus(),
    eVar12: getEcid(),
    eVar51: getPageLoadTime(),
    eVar54: pageName,
    prop54: pageName,
    ...(clientId && { eVar120: clientId }),
    ...(section && { prop1: section }),
    prop12: session(PREV_PAGE_KEY),
    prop13: `highestPercentViewed = ${scroll.highest} | initialPercentViewed=${scroll.initial}`,
    server: window.location.hostname,
    currencyCode: 'INR',
  };
  [['utm_source', 'eVar38'], ['utm_medium', 'eVar39'], ['utm_campaign', 'eVar87'], ['cid', 'eVar0']]
    .forEach(([param, name]) => { if (utm.get(param)) vars[name] = utm.get(param); });
  session(PREV_PAGE_KEY, pageName);
  return vars;
}

export default function beforeSend(payload) {
  if (payload.xdm?.eventType !== 'web.webpagedetails.pageViews') return;
  // eslint-disable-next-line no-underscore-dangle
  Object.assign(payload.data.__adobe.analytics, pageViewVariables());
}
