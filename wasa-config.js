// wasa-config.js CON CLAVE Y CACHE BUSTER
const WASA_WORKER_URL = 'https://founderswasablocks.javimsites.workers.dev';
const WASA_WORKER_KEY = 'wasa_blocks_f0und3rs_uidf8923hryuwe3987'; // CAMBIA ESTO
const WASA_VERSION = 'v' + Date.now(); // cache buster automatico

const WEBHOOK_URL = WASA_WEBHOOK_URL;
const SHEET_WEBHOOK_URL = WASA_WEBHOOK_URL;
const BASE_CONFIG = { SHEET_WEBHOOK_URL: WASA_WEBHOOK_URL, CHAIN_ID: 56 };

// Helper para fetch seguro al worker
async function wasaFetchWorker(payload) {
  return fetch(WASA_WORKER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'X-WASA-KEY': WASA_WORKER_KEY
    },
    body: JSON.stringify(payload)
  });
}
