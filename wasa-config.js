// wasa.chat - Config centralizada V2 - Cloudflare Worker
// Cambiá SOLO esta URL y todo tu sitio pasa de Apps Script a Cloudflare
// Apps Script viejo: https://script.google.com/macros/s/AKfycby.../exec
// Nuevo Worker: https://api.wasa.chat

const WASA_WEBHOOK_URL = 'https://founderswasablocks.javimsites.workers.dev/';

// Compatibilidad con código viejo que usa WEBHOOK_URL o SHEET_WEBHOOK_URL
const WEBHOOK_URL = WASA_WEBHOOK_URL;
const SHEET_WEBHOOK_URL = WASA_WEBHOOK_URL;
const BASE_CONFIG = { SHEET_WEBHOOK_URL: WASA_WEBHOOK_URL, CHAIN_ID: 56 };

console.log('WASA Config V2 (Cloudflare Worker):', WASA_WEBHOOK_URL);
