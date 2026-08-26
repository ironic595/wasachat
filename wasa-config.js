// wasa-config.js - UNICO PUNTO - usado por founders.html, refer-register.html, referrals.html, marketplace.html, dashboard.html, etc
const WASA_WORKER_URL = 'https://founderswasablocks.javimsites.workers.dev';
const WASA_WORKER_KEY = 'wasa_2026_f0und3rs_9k2j4l8x';
const WASA_WEBHOOK_URL = WASA_WORKER_URL;

const WEBHOOK_URL = WASA_WORKER_URL;
const SHEET_WEBHOOK_URL = WASA_WORKER_URL;
const BASE_CONFIG = { SHEET_WEBHOOK_URL: WASA_WORKER_URL, CHAIN_ID: 56 };

async function wasaFetchWorker(payload) {
  return fetch(WASA_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain', 'X-WASA-KEY': WASA_WORKER_KEY },
    body: JSON.stringify(payload)
  });
}
// helper para GETs
async function wasaFetchGET(action, extra='') {
  const url = WASA_WORKER_URL + '?action=' + action + (extra ? '&' + extra : '') + '&v=' + Date.now();
  return fetch(url);
}
window.WASA_WORKER_URL = WASA_WORKER_URL;
window.WASA_WORKER_KEY = WASA_WORKER_KEY;
window.WASA_WEBHOOK_URL = WASA_WEBHOOK_URL;
window.WEBHOOK_URL = WASA_WORKER_URL;
window.wasaFetchWorker = wasaFetchWorker;
window.wasaFetchGET = wasaFetchGET;
