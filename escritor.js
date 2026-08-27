// escritor.js - Usa /fnts/Fixedsys.ttf + estilo VALID FROM APRIL 15 2027 (tarjeta emboss) - con wasa-config.js
async function editarYEnviarHolograma({slots, codeId, email, nombre, accessCode, tx_hash, percent}) {
  const WORKER_URL = window.WASA_WORKER_URL || 'https://founderswasablocks.javimsites.workers.dev';
  const WORKER_KEY = window.WASA_WORKER_KEY || 'wasa_2026_f0und3rs_9k2j4l8x';
  const slotNum = Math.max(1, Math.min(50, Math.round(slots)||1));
  const url = `/images/${slotNum}.png?v=${Date.now()}`;
  const el = document.getElementById('txStatus');
  if(el) { el.style.display='block'; el.textContent = `Cargando Fixedsys desde /fnts/ para ${codeId}...`; }

  const loadImg = (src) => new Promise((res,rej)=>{ let i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src; });
  let baseImg;
  try { baseImg = await loadImg(url); } catch { baseImg = await loadImg(`/images/1.png?v=${Date.now()}`); }
  const W=baseImg.width, H=baseImg.height;

  // --- CARGAR FUENTE FIXEDSYS DESDE /fnts/Fixedsys.ttf ---
  // Esta es la que está en tu screenshot
  try {
    // Intentar cargar como FontFace explicita (más confiable para canvas)
    const fontFace = new FontFace('FixedsysTTF', 'url(/fnts/Fixedsys.ttf)', { weight: '200' });
    await fontFace.load();
    document.fonts.add(fontFace);
    await document.fonts.ready;
    // Forzar carga
    await document.fonts.load(`200 14px FixedsysTTF`);
  } catch(e) {
    console.warn('No se pudo cargar /fnts/Fixedsys.ttf, fallback a Courier New', e);
    try { await document.fonts.load(`200 14px Fixedsys`); await document.fonts.ready; } catch {}
  }

  const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false; // pixelated como tu CSS image-rendering: pixelated
  ctx.drawImage(baseImg,0,0);

  // --- ESTILO COMO .fixedsys-card-text + Fixedsys ---
  const code = (codeId||'').toString().toUpperCase();
  const fontSize = Math.floor(W * 0.028); 
  const yPos = H - Math.floor(H * 0.072);
  const xPos = W/2;

  ctx.textAlign='center';
  ctx.textBaseline='middle';
  // Usamos FixedsysTTF primero, si no existe cae a Courier New (tu CSS pide Courier new)
  ctx.font = `200 ${fontSize}px "FixedsysTTF", "Fixedsys", "Courier New", Courier, monospace`;
  try { ctx.letterSpacing = '4px'; } catch {}

  // Relieve estilo tarjeta pixelada - tu CSS exacto
  const shadows = [
    {dx: 3, dy: 3, color: '#091721'},  // 3px 3px #091721
    {dx: 2, dy: 2, color: '#210d02'},  // 2px 2px #210d02
    {dx: 1, dy: 1, color: '#5e2a09'},  // 1px 1px #5e2a09
    {dx: -1, dy: 1, color: '#944d1a'}, // -1px 1px #944d1a
    {dx: 1, dy: -1, color: '#944d1a'}, // 1px -1px #944d1a
    {dx: -1, dy: -1, color: '#ffcc99'},// -1px -1px #ffcc99 brillo
  ];

  for(const s of shadows){
    ctx.fillStyle = s.color;
    ctx.fillText(code, xPos + s.dx, yPos + s.dy);
  }

  // Color base #d99152 naranja ocre metalizado
  ctx.fillStyle = '#d99152';
  ctx.fillText(code, xPos, yPos);

  const b64=canvas.toDataURL('image/png').split(',')[1];
  let r;
  if (typeof window.wasaFetchWorker === 'function') {
    r = await window.wasaFetchWorker({action:'sendEditedImage',email,codeId,slots,slotNum,nombre,accessCode,tx_hash,percent,image_b64:b64,image_filename:`${codeId}-${slotNum}.png`});
  } else {
    r = await fetch(WORKER_URL,{method:'POST',headers:{'Content-Type':'text/plain','X-WASA-KEY': WORKER_KEY},body:JSON.stringify({action:'sendEditedImage',email,codeId,slots,slotNum,nombre,accessCode,tx_hash,percent,image_b64:b64,image_filename:`${codeId}-${slotNum}.png`})});
  }
  const j=await r.json(); if(!j.ok) throw new Error(j.error);
  if(el){ el.style.background='#DCFCE7'; el.textContent=`Holograma ${codeId} con Fixedsys /fnts/ enviado`; }
  return j;
}
window.editarYEnviarHolograma=editarYEnviarHolograma;
