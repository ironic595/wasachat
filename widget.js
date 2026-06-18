(function() {
  'use strict';
  const scriptTag = document.currentScript;
  const BOT_ID = scriptTag.getAttribute('data-bot-id');

  if (!BOT_ID) {
    console.error('[WasaChat] Falta data-bot-id');
    return;
  }

  // 1. PEDIR CONFIG AL WORKER PARA EL COLOR, NOMBRE, SALUDO
  fetch('https://api.wasa.chat/config', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ botId: BOT_ID })
  })
 .then(r => r.json())
 .then(BOT_CONFIG => {

    // 2. CREAR HTML DEL CHAT - ESTO SÍ VA EN EL WIDGET
    const styles = `
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
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #wasa-chat {
        position: fixed;
        bottom: 90px;
        ${BOT_CONFIG.pos === 'left'? 'left: 20px;' : 'right: 20px;'}
        width: 350px;
        height: 500px;
        max-height: 80vh;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        display: none;
        flex-direction: column;
        z-index: 999999;
        font-family: Arial, sans-serif;
      }
      #wasa-header {
        background: ${BOT_CONFIG.color};
        color: #fff;
        padding: 15px;
        border-radius: 12px 12px 0 0;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #wasa-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
      }
      #wasa-msgs {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        background: #f5f5f5;
      }
     .wasa-msg {
        margin: 8px 0;
        padding: 8px 12px;
        border-radius: 8px;
        max-width: 80%;
        word-wrap: break-word;
      }
     .wasa-user {
        background: ${BOT_CONFIG.color};
        color: #fff;
        margin-left: auto;
        text-align: right;
      }
     .wasa-bot {
        background: #fff;
        border: 1px solid #ddd;
      }
      #wasa-input-area {
        display: flex;
        border-top: 1px solid #ddd;
        padding: 10px;
      }
      #wasa-input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 8px 12px;
        outline: none;
      }
      #wasa-send {
        background: ${BOT_CONFIG.color};
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        margin-left: 8px;
        cursor: pointer;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const chatHTML = `
      <button id="wasa-btn">💬</button>
      <div id="wasa-chat">
        <div id="wasa-header">
          <span>${BOT_CONFIG.nombre}</span>
          <button id="wasa-close">×</button>
        </div>
        <div id="wasa-msgs"></div>
        <div id="wasa-input-area">
          <input id="wasa-input" type="text" placeholder="Escribí tu mensaje...">
          <button id="wasa-send">➤</button>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = chatHTML;
    document.body.appendChild(wrapper);

    // 3. LÓGICA DE ABRIR/CERRAR - ESTO ES LO QUE TE BORRÉ COMO UN GIL
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
    }

    // 4. LA ÚNICA LÓGICA: MANDAR AL WORKER
    async function enviarMensaje() {
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      addMsg(text, true);
      addMsg('Escribiendo...', false);

      try {
        const res = await fetch('https://api.wasa.chat/chat', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ message: text, botId: BOT_ID })
        });

        // Borrar el "Escribiendo..."
        msgs.removeChild(msgs.lastChild);

        const data = await res.json();
        addMsg(data.reply, false);

      } catch(e) {
        msgs.removeChild(msgs.lastChild);
        addMsg('Error de conexión 😢', false);
      }
    }

    sendBtn.onclick = enviarMensaje;
    input.onkeypress = (e) => {
      if(e.key === 'Enter') enviarMensaje();
    };

    // Mensaje de bienvenida
    addMsg(BOT_CONFIG.saludo, false);

  })
 .catch(err => {
    console.error('[WasaChat] Error cargando config:', err);
  });

})();
