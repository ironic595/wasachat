async function editarYEnviarHolograma({slots, codeId, email, nombre, accessCode, tx_hash, percent}) {
  const IMAGE_BASE = '/images/';
  const WEBHOOK = window.WASA_WEBHOOK_URL || 'https://founderswasablocks.javimsites.workers.dev';
  const slotNum = Math.max(1, Math.min(50, Math.round(slots)||1));
  const url = `${IMAGE_BASE}${slotNum}.png`;

  const statusEl = document.getElementById('txStatus');
  if(statusEl) { statusEl.style.display='block'; statusEl.textContent = `🎨 Generando holograma ${slotNum} con código ${codeId}...`; }

  try {
    const loadImg = (src) => new Promise((res, rej) => { let i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src; });
    let baseImg;
    try { baseImg = await loadImg(url); }
    catch { try { baseImg = await loadImg(`${IMAGE_BASE}1.png`); } catch(e) { throw new Error(`No se encontró ${url}`); } }

    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(baseImg, 0, 0);

    // === TEXTO CON RELIEVE ESTILO VALID FROM APRIL - SIN FRANJA NEGRA ===
    // Posicion: abajo, justo encima del borde, donde iba la franja
    const code = codeId; // Ej: WASA-SN4H-CEQ8-6Z6U

    // Configuracion tipografia igual a VALID FROM APRIL
    const fontSize = Math.floor(W * 0.038); // similar a VALID FROM
    const yPos = H - Math.floor(H * 0.065); // 6.5% desde abajo

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Efecto relieve: sombra + highlight + fill
    // 1. Sombra oscura abajo-derecha
    ctx.font = `800 ${fontSize}px 'Courier New', monospace`;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillText(code, W/2 + 1.5, yPos + 1.5);

    // 2. Highlight claro arriba-izquierda (relieve)
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText(code, W/2 - 0.8, yPos - 0.8);

    // 3. Texto principal con color holografico claro + stroke fino
    ctx.fillStyle = '#E8F0FF'; // blanco azulado como VALID FROM
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = Math.max(1, fontSize * 0.08);
    ctx.strokeText(code, W/2, yPos);
    ctx.fillText(code, W/2, yPos);

    // Opcional: brillo extra para que resalte sobre holograma
    ctx.shadowColor = 'rgba(0,200,255,0.6)';
    ctx.shadowBlur = 8;
    ctx.fillText(code, W/2, yPos);
    ctx.shadowBlur = 0;

    // 4. Convertir a base64
    const b64Full = canvas.toDataURL('image/png').split(',')[1];

    if(statusEl) statusEl.textContent = `📤 Enviando ${code}-${slotNum}.png con relieve...`;

    const resp = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'sendEditedImage',
        email, codeId, slots, slotNum, nombre, accessCode, tx_hash, percent,
        image_b64: b64Full,
        image_filename: `${codeId}-${slotNum}.png`
      })
    });

    const j = await resp.json();
    if(!j.ok) throw new Error(j.error||'Error worker');

    if(statusEl) {
      statusEl.style.background = '#DCFCE7';
      statusEl.style.borderColor = '#22C55E';
      statusEl.textContent = `✅ Holograma ${codeId} enviado con letra en relieve sin franja negra`;
    }
    return j;

  } catch(e) {
    console.error('escritor v2 error', e);
    if(statusEl) {
      statusEl.style.background = '#FEE2E2';
      statusEl.style.borderColor = '#DC2626';
      statusEl.textContent = `❌ ${e.message}`;
    }
    throw e;
  }
}
window.editarYEnviarHolograma = editarYEnviarHolograma;
