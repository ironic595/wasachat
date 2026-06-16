(function() {
  'use strict';

  // 1. LEER CONFIG DEL SCRIPT TAG DEL CLIENTE
  const scriptTag = document.currentScript;
  const CLIENT_EMAIL = scriptTag.getAttribute('data-client-email');
  const FIREBASE_CONFIG = JSON.parse(scriptTag.getAttribute('data-firebase-config'));

  if (!CLIENT_EMAIL ||!FIREBASE_CONFIG) {
    console.error('[WasaChat] Faltan data-client-email o data-firebase-config');
    return;
  }

  // 2. CARGAR FIREBASE SDK DINÁMICAMENTE - así el cliente pega 1 sola línea
  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }

  async function init() {
    await loadScript('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js');

    firebase.initializeApp(FIREBASE_CONFIG);
    const db = firebase.firestore();

    let PRODUCTOS = [];
    let FAQS = [];
    let ULTIMOS_PRODUCTOS_MOSTRADOS = [];
    let NOMBRES_COLECCIONES = { productos: "Productos", faq: "FAQ" };

    const FRASES = {
      hola: ["¡Holaa! 👋 ¿Qué andás buscando hoy?", "¡Ey! 😄 Decime qué necesitás"],
      encontreUno: ["¡Mirá lo que encontré para vos! 👇", "Creo que esto te sirve 😎"],
      encontreVarios: ["Encontré varias opciones 👇", "Fijate cuál te gusta más:"],
      listaCompleta: ["Te paso todas las {categoria} que tenemos: 👇", "Estas son todas las {categoria} disponibles:"],
      noHay: ["No tengo ese exacto 😅 Pero mirá estos:", "No lo encontré, pero capaz te sirve alguno:"],
      suspendido: ["Este chat está temporalmente suspendido. Contactá a soporte.", "Servicio pausado. Regularizá tu suscripción para activarlo."],
      cta: ["Comprar ahora 😉", "Ver en la tienda", "¿Te paso el link?"]
    };

    function fraseRandom(tipo, vars = {}) {
      let frase = FRASES[tipo][Math.floor(Math.random() * FRASES[tipo].length)];
      Object.keys(vars).forEach(k => frase = frase.replace(`{${k}}`, vars[k]));
      return frase;
    }

    // CARGAR DATOS + VALIDAR SUSCRIPCIÓN
    async function cargarDatos() {
      try {
        const botDoc = await db.collection('bots').doc(CLIENT_EMAIL).get();
        if (!botDoc.exists) return false;

        const data = botDoc.data();

        // VALIDACIÓN DE SUSCRIPCIÓN - Si no está activo, no carga nada
        if (data.estado!== 'activo' && data.estado!== 'gratis') {
          agregarMensaje('bot', fraseRandom('suspendido'));
          return false;
        }

        if (data.hojas) {
          NOMBRES_COLECCIONES.productos = data.hojas.productos || "Productos";
          NOMBRES_COLECCIONES.faq = data.hojas.faq || "FAQ";
        }

        const [prod, faqs] = await Promise.all([
          db.collection('bots').doc(CLIENT_EMAIL).collection(NOMBRES_COLECCIONES.productos).get(),
          db.collection('bots').doc(CLIENT_EMAIL).collection(NOMBRES_COLECCIONES.faq).get()
        ]);

        PRODUCTOS = prod.docs.map(d => ({id: d.id,...d.data()}));
        FAQS = faqs.docs.map(d => d.data());
        return true;

      } catch(e) {
        console.error('[WasaChat] Error:', e);
        return false;
      }
    }

    function buscarProductos(texto) {
      const limpiar = (str) => {
        if (!str) return '';
        return str.toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[¿?¡!,.;:]/g, '');
      }
      const palabrasUsuario = limpiar(texto).split(' ').filter(p => p.length > 2);
      if(palabrasUsuario.length === 0) return [];

      return PRODUCTOS.filter(p => {
        const textoCompleto = limpiar(`
          ${p.nombre || ''} ${p.modelo || ''} ${p.descripcion || ''}
          ${p.categoria || ''} ${p.keywords?.join(' ') || ''}
        `);
        return palabrasUsuario.every(palabra => textoCompleto.includes(palabra));
      });
    }

    function esBusquedaAmplia(texto, resultados) {
      const t = texto.toLowerCase().trim();
      const esSoloMarca = PRODUCTOS.some(p => p.keywords?.map(k=>k.toLowerCase()).includes(t));
      const esSoloCategoria = PRODUCTOS.some(p => p.categoria?.toLowerCase() === t);
      return (esSoloMarca || esSoloCategoria || t.split(' ').length === 1) && resultados.length >= 3;
    }

    function armarListaProductos(productos) {
      ULTIMOS_PRODUCTOS_MOSTRADOS = productos;
      return productos.map((p,i) => `
        <div onclick="window.WasaChat.verProducto(${i})" style="display:flex;gap:8px;padding:8px;border:1px solid #ddd;border-radius:8px;margin:6px 0;cursor:pointer;background:#fff">
          <img src="${p.imagen}" style="width:50px;height:50px;object-fit:cover;border-radius:6px">
          <div style="flex:1">
            <div style="font-weight:600;font-size:13px">${p.nombre}</div>
            ${p.modelo? `<div style="font-size:11px;color:#64748b">${p.modelo}</div>` : ''}
            <div style="color:green;font-size:13px">$${p.precio?.toLocaleString('es-AR')}</div>
          </div>
        </div>
      `).join('');
    }

    function fichaProducto(p) {
      return `
        <b>${p.nombre}</b><br>
        ${p.modelo? `<div style="font-size:12px;color:#64748b;margin-bottom:4px">Modelo: ${p.modelo}</div>` : ''}
        <img src="${p.imagen}" style="width:100%;border-radius:8px;margin:8px 0"><br>
        ${p.descripcion}<br>
        <b>$${p.precio?.toLocaleString('es-AR')}</b><br>
        <a href="${p.link}" target="_blank" style="background:#2563eb;color:#fff;padding:8px 14px;border-radius:6px;display:inline-block;margin-top:8px;text-decoration:none;font-weight:600">
          ${fraseRandom('cta')}
        </a>
      `;
    }

    function responder(texto) {
      if(/hola|buenas|hey/.test(texto.toLowerCase())) return fraseRandom('hola');
      const faq = FAQS.find(f => texto.toLowerCase().includes(f.pregunta.toLowerCase()));
      if(faq) return faq.respuesta;

      const encontrados = buscarProductos(texto);
      if(esBusquedaAmplia(texto, encontrados)) {
        const categoria = encontrados[0].categoria || texto;
        return `${fraseRandom('listaCompleta', {categoria})}<br>${armarListaProductos(encontrados)}`;
      }
      if(encontrados.length === 1) return `${fraseRandom('encontreUno')}<br><br>${fichaProducto(encontrados[0])}`;
      if(encontrados.length > 1) return `${fraseRandom('encontreVarios')}<br>${armarListaProductos(encontrados.slice(0,6))}`;

      const top = PRODUCTOS.slice(0,6);
      ULTIMOS_PRODUCTOS_MOSTRADOS = top;
      return `${fraseRandom('noHay')}<br>${armarListaProductos(top)}`;
    }

    // UI
    const root = document.createElement('div');
    root.id = 'wasachat-root';
    root.innerHTML = `
      <style>
        #wasachat-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
     .wc-bubble { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background: #2563eb; border-radius: 50%; color: #fff; font-size: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.2); z-index: 99999; }
     .wc-window { position: fixed; bottom: 90px; right: 20px; width: 90vw; max-width: 360px; height: 500px; background: #fff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,.2); display: none; flex-direction: column; overflow: hidden; z-index: 99999; }
     .wc-window.open { display: flex; }
     .wc-header { background: #2563eb; color: #fff; padding: 14px; font-weight: 600; }
     .wc-msgs { flex: 1; padding: 12px; overflow-y: auto; background: #f5f5f5; font-size: 14px; }
     .wc-input { display: flex; padding: 8px; border-top: 1px solid #ddd; }
     .wc-input input { flex: 1; border: 1px solid #ccc; border-radius: 20px; padding: 8px 12px; outline: none; }
     .wc-msg { margin: 8px 0; }
     .wc-msg.user { text-align: right; }
     .wc-bubble-msg { display: inline-block; padding: 8px 12px; border-radius: 12px; max-width: 85%; text-align: left; }
     .wc-msg.bot.wc-bubble-msg { background: #fff; border: 1px solid #eee; }
     .wc-msg.user.wc-bubble-msg { background: #2563eb; color: #fff; }
      </style>
      <div class="wc-bubble">💬</div>
      <div class="wc-window">
        <div class="wc-header">Asistente de tienda</div>
        <div class="wc-msgs"></div>
        <div class="wc-input">
          <input placeholder="Escribí acá...">
        </div>
      </div>
    `;
    document.body.appendChild(root);

    const bubble = root.querySelector('.wc-bubble');
    const window = root.querySelector('.wc-window');
    const msgs = root.querySelector('.wc-msgs');
    const input = root.querySelector('.wc-input input');

    function agregarMensaje(tipo, html) {
      const div = document.createElement('div');
      div.className = `wc-msg ${tipo}`;
      div.innerHTML = `<div class="wc-bubble-msg">${html}</div>`;
      msgs.appendChild(div);
      msgs.scrollTop = 999999;
    }

    bubble.onclick = () => window.classList.toggle('open');
    input.onkeydown = e => {
      if(e.key === 'Enter' && input.value.trim()) {
        const texto = input.value.trim();
        agregarMensaje('user', texto);
        input.value = '';
        setTimeout(() => agregarMensaje('bot', responder(texto)), 400);
      }
    };

    // Exponer función global para clicks en cards
    window.WasaChat = {
      verProducto: (index) => {
        const p = ULTIMOS_PRODUCTOS_MOSTRADOS[index];
        agregarMensaje('user', p.nombre);
        agregarMensaje('bot', fichaProducto(p));
      }
    };

    // ARRANCAR
    const ok = await cargarDatos();
    if(ok) agregarMensaje('bot', fraseRandom('hola'));
  }

  init();
})();
