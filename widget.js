(function() {
  'use strict';
  const scriptTag = document.currentScript;
  const BOT_ID = scriptTag.getAttribute('data-bot-id'); // Cambiamos email por botId

  if (!BOT_ID) {
    console.error('[WasaChat] Falta data-bot-id');
    return;
  }

  // TODO: Tu HTML/CSS del chat acá. Eso no cambia.
  // Botón, caja, input, etc. Dejálo igual.

  const input = document.getElementById('wasa-input');
  const msgs = document.getElementById('wasa-msgs');

  function addMsg(text, user) {
    // Tu función para mostrar mensajes. No cambia.
  }

  // LA ÚNICA LÓGICA QUE QUEDA
  input.onkeypress = async (e) => {
    if(e.key === 'Enter' && input.value) {
      const text = input.value;
      input.value = '';
      addMsg(text, true);

      // Le pega al Worker. Acá no hay cerebro.
      const res = await fetch('https://api.wasa.chat/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: text, botId: BOT_ID })
      });
      const data = await res.json();
      addMsg(data.reply, false);
    }
  };

  // Mensaje de bienvenida hardcodeado o lo pedís al Worker
  addMsg('¡Hola! ¿En qué te ayudo?', false);
})();
