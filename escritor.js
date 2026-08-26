// escritor.js - Edita holograma en el navegador (canvas real) y lo manda al worker para email
// Uso: editarYEnviarHolograma(slots, codeId, email, nombre, accessCode, tx_hash, percent)

async function editarYEnviarHolograma({slots, codeId, email, nombre, accessCode, tx_hash, percent}) {
  const IMAGE_BASE = '/images/'; // wasa.chat/images/(slots).png
  const WEBHOOK = window.WASA_WEBHOOK_URL || 'https://founderswasablocks.javimsites.workers.dev';
  const slotNum = Math.max(1, Math.min(50, Math.round(slots)||1));
  const url = `${IMAGE_BASE}${slotNum}.png`;

  const statusEl = document.getElementById('txStatus');
  if(statusEl) { statusEl.style.display='block'; statusEl.textContent = `🎨 Generando holograma ${slotNum}.png con código ${codeId}...`; }

  try {
    // 1. Cargar imagen base
    let img = new Image();
    img.crossOrigin = 'anonymous';
    const loadImg = (src) => new Promise((res, rej) => { let i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src; });
    let baseImg;
    try {
      baseImg = await loadImg(url);
    } catch {
      // fallback a 1.png si no existe la de slots
      try { baseImg = await loadImg(`${IMAGE_BASE}1.png`); } catch(e) { throw new Error(`No se encontró ${url} ni 1.png`); }
    }

    // 2. Canvas oculto
    const W = baseImg.width;
    const H = baseImg.height;
    const barH = Math.floor(H * 0.12);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(baseImg, 0, 0);

    // Barra negra abajo estilo tu ejemplo
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, H - barH, W, barH);

    // Texto codigo - blanco centrado
    ctx.fillStyle = '#FFFFFF';
    const fontSize = Math.floor(W * 0.055);
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(codeId, W/2, H - barH/2);

    // 3. Convertir a base64 PNG
    const b64Full = canvas.toDataURL('image/png').split(',')[1]; // solo base64 sin prefix

    // 4. Guardar en cache local (opcional) - images/cache/
    try {
      localStorage.setItem(`wasa_cache_${codeId}`, b64Full.slice(0,100)); // marker
    } catch {}

    // 5. Enviar al worker para que adjunte al email
    if(statusEl) statusEl.textContent = `📤 Enviando holograma editado ${codeId}-${slotNum}.png al email...`;

    const resp = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'sendEditedImage',
        email: email,
        codeId: codeId,
        slots: slots,
        slotNum: slotNum,
        nombre: nombre,
        accessCode: accessCode,
        tx_hash: tx_hash,
        percent: percent,
        image_b64: b64Full,
        image_filename: `${codeId}-${slotNum}.png`
      })
    });

    const j = await resp.json();
    if(!j.ok) throw new Error(j.error||'Error worker sendEditedImage');

    if(statusEl) {
      statusEl.style.background = '#DCFCE7';
      statusEl.style.borderColor = '#22C55E';
      statusEl.textContent = `✅ Holograma ${codeId}-${slotNum}.png enviado a ${email} con código quemado abajo`;
    }

    return j;

  } catch(e) {
    console.error('escritor.js error', e);
    if(statusEl) {
      statusEl.style.background = '#FEE2E2';
      statusEl.style.borderColor = '#DC2626';
      statusEl.textContent = `❌ Error generando imagen: ${e.message}. Se envió mail sin imagen editada, revisa /images/${slotNum}.png`;
    }
    // Fallback: avisa al worker que mande mail sin imagen editada pero con datos
    try {
      await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'sendEditedImageFallback',
          email: email,
          codeId: codeId,
          slots: slots,
          nombre: nombre,
          accessCode: accessCode,
          tx_hash: tx_hash,
          error: e.message
        })
      });
    } catch {}
    throw e;
  }
}

// Exponer global
window.editarYEnviarHolograma = editarYEnviarHolograma;
