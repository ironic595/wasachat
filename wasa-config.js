// wasa.chat - Config centralizada
// Cambiá SOLO esta URL cada vez que deployás nuevo Apps Script y se actualiza todo el sitio
const WASA_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxxIOnvSCVe6_OZd8Ekd6VF9urFQN5sWIoycG5Lh5pshI-Kcu3gbg89WDOTe0xoTsjMWA/exec';

// Compatibilidad con código viejo que usa WEBHOOK_URL o SHEET_WEBHOOK_URL
const WEBHOOK_URL = WASA_WEBHOOK_URL;
const SHEET_WEBHOOK_URL = WASA_WEBHOOK_URL;
const BASE_CONFIG = { SHEET_WEBHOOK_URL: WASA_WEBHOOK_URL, CHAIN_ID: 56 };

// Opcional: log para debug
console.log('WASA Config cargada:', WASA_WEBHOOK_URL.slice(-20));
