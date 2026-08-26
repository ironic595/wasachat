// wasa.chat - Config centralizada
// Cambiá SOLO esta URL cada vez que deployás nuevo Apps Script y se actualiza todo el sitio
const WASA_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzLPOPZLUoS7BwpqDXT4S1gKRwcd3nwKnL8ewQfQA8A96tDoRbcU1Jn2c_pWqZx2hJpug/exec';

// Compatibilidad con código viejo que usa WEBHOOK_URL o SHEET_WEBHOOK_URL
const WEBHOOK_URL = WASA_WEBHOOK_URL;
const SHEET_WEBHOOK_URL = WASA_WEBHOOK_URL;
const BASE_CONFIG = { SHEET_WEBHOOK_URL: WASA_WEBHOOK_URL, CHAIN_ID: 56 };

// Opcional: log para debug
console.log('WASA Config cargada:', WASA_WEBHOOK_URL.slice(-20));
