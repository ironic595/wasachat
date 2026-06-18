(function() {
  'use strict';
  const scriptTag = document.currentScript;
  const BOT_ID = scriptTag.getAttribute('data-bot-id');

  if (!BOT_ID) {
    console.error('[WasaChat] Falta data-bot-id');
    return;
  }

  // 1. CACHE PARA NO PEGARLE A CLOUDFLARE EN CADA REFRESH
  const CACHE_KEY = 'wasa_config_' + BOT_ID;
  const cached = localStorage.getItem(CACHE_KEY);
  const cacheTime = localStorage.getItem(CACHE_KEY + '_time');
  const UNA_HORA = 3600000;

  // Si hay cache de menos de 1 hora, usamos eso
  if (cached && Date.now() - cacheTime < UNA_HORA) {
    const BOT_CONFIG = JSON.parse(cached);
    if (!checkEstado(BOT_CONFIG)) return;
    renderWidget(BOT_CONFIG);
    return;
  }

  // 2. SI NO HAY CACHE, PEDIR CONFIG AL WORKER
  fetch('https://api.wasa.chat/config', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ bot_id: BOT_ID })
  })
.then(r => r.json())
.then(BOT_CONFIG => {
     if (BOT_CONFIG.error || BOT_CONFIG.estado!== 'activo') {
    console.log('[WasaChat] Bot desactivado por falta de pago');
    return; // No dibuja nada, 0 requests
  }

    // GUARDAMOS CACHE
    localStorage.setItem(CACHE_KEY, JSON.stringify(BOT_CONFIG));
    localStorage.setItem(CACHE_KEY + '_time', Date.now());

    // CHEQUEAMOS SI PAGÓ
    if (!checkEstado(BOT_CONFIG)) return;

    // SI PAGÓ, RENDERIZAMOS
    renderWidget(BOT_CONFIG);
})
.catch(err => {
    console.error('[WasaChat] Error cargando config:', err);
});

  // FUNCIÓN: VALIDAR SUSCRIPCIÓN
  function checkEstado(config) {
    // Estados válidos: 'activo' y 'gratis'. Todo lo demás se oculta.
    if (config.estado!== 'activo' && config.estado!== 'gratis') {
      console.log('[WasaChat] Bot desactivado. Estado:', config.estado);
      return false; // No renderiza nada, 0 requests a /chat
    }
    if (config.error) {
      console.log('[WasaChat] Error:', config.error);
      return false;
    }
    return true;
  }

  // FUNCIÓN: DIBUJAR TODO EL WIDGET
  function renderWidget(BOT_CONFIG) {
    // 2. CSS + HTML VAN ACÁ ADENTRO - ESTO DIBUJA TODO
    const styles = `
      #wasa-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      #wasa-btn {
        position: fixed;
        bottom: 20px;
        ${BOT_CONFIG.pos === 'left'? 'left: 20px;' : 'right: 20px;'}
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${BOT_CONFIG.color};
        color: #fff;
        border: none;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }
      #wasa-btn:hover { transform: scale(1.1); }
      #wasa-chat {
        position: fixed;
        bottom: 90px;
        ${BOT_CONFIG.pos === 'left'? 'left: 20px;' : 'right: 20px;'}
        width: 360px;
        height: 520px;
        max-height: calc(100vh - 120px);
        max-width: calc(100vw - 40px);
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        display: none;
        flex-direction: column;
        z-index: 999999;
        overflow: hidden;
      }
      #wasa-header {
        background: ${BOT_CONFIG.color};
        color: #fff;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }
      #wasa-header img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 10px;
        background: #fff;
      }
      #wasa-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        padding: 0 5px;
      }
      #wasa-msgs {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: #f7f7f8;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
     .wasa-msg {
        padding: 10px 14px;
        border-radius: 18px;
        max-width: 75%;
        word-wrap: break-word;
        line-height: 1.4;
        font-size: 14px;
      }
     .wasa-user {
        background: ${BOT_CONFIG.color};
        color: #fff;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }
     .wasa-bot {
        background: #fff;
        border: 1px solid #e5e5e5;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      #wasa-input-area {
        display: flex;
        padding: 12px;
        border-top: 1px solid #e5e5e5;
        background: #fff;
      }
      #wasa-input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 24px;
        padding: 10px 16px;
        outline: none;
        font-size: 14px;
      }
      #wasa-input:focus { border-color: ${BOT_CONFIG.color}; }
      #wasa-send {
        background: ${BOT_CONFIG.color};
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        margin-left: 8px;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #wasa-send:disabled { opacity: 0.5; cursor: not-allowed; }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const avatarHTML = BOT_CONFIG.avatar?
      `<img src="${BOT_CONFIG.avatar}" alt="">` : '';

    const chatHTML = `
      <div id="wasa-widget">
        <button id="wasa-btn">💬</button>
        <div id="wasa-chat">
          <div id="wasa-header">
            <div style="display:flex;align-items:center;">
              ${avatarHTML}
              <span>${BOT_CONFIG.nombre}</span>
            </div>
            <button id="wasa-close">×</button>
          </div>
          <div id="wasa-msgs"></div>
          <div id="wasa-input-area">
            <input id="wasa-input" type="text" placeholder="Escribí tu mensaje...">
            <button id="wasa-send">➤</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // 3. LÓGICA DE ABRIR/CERRAR Y MANDAR MSJ
    const btn = document.getElementById('wasa-btn');
    const chat = document.getElementById('wasa-chat');
    const closeBtn = document.getElementById('wasa-close');
    const input = document.getElementById('wasa-input');
    const sendBtn = document.getElementById('wasa-send');
    const msgs = document.getElementById('wasa-msgs');

    let abierto = false;

    function toggleChat() {
      abierto =!abierto;
      chat.style.display = abierto? 'flex' : 'none';
      if (abierto) input.focus();
    }

    btn.onclick = toggleChat;
    closeBtn.onclick = toggleChat;

    function addMsg(text, esUser) {
      const div = document.createElement('div');
      div.className = 'wasa-msg ' + (esUser? 'wasa-user' : 'wasa-bot');
      div.innerText = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
      return div;
    }

    // 4. ÚNICA LÓGICA: FETCH AL WORKER - NO HAY CEREBRO ACÁ
    async function enviarMensaje() {
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      sendBtn.disabled = true;
      addMsg(text, true);

      const loadingMsg = addMsg('Escribiendo...', false);

      try {
        const res = await fetch('https://api.wasa.chat/chat', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ message: text, bot_id: BOT_ID })
        });

        msgs.removeChild(loadingMsg);
        const data = await res.json();
        addMsg(data.reply, false);

      } catch(e) {
        msgs.removeChild(loadingMsg);
        addMsg('Error de conexión 😢 Intentá de nuevo.', false);
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    }

    sendBtn.onclick = enviarMensaje;
    input.onkeypress = (e) => {
      if(e.key === 'Enter' &&!sendBtn.disabled) enviarMensaje();
    };

    // Mensaje de bienvenida usando el config de Firestore
    addMsg(BOT_CONFIG.saludo, false);
  }

})();
