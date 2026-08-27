// escritor.js - adaptado al estilo VALID FROM APRIL 15 2027 - Courier New emboss 3D - usa wasa-config.js
async function editarYEnviarHolograma({slots, codeId, email, nombre, accessCode, tx_hash, percent}) {
  const WORKER_URL = window.WASA_WORKER_URL || 'https://founderswasablocks.javimsites.workers.dev';
  const WORKER_KEY = window.WASA_WORKER_KEY || 'wasa_2026_f0und3rs_9k2j4l8x';
  const slotNum = Math.max(1, Math.min(50, Math.round(slots)||1));
  const url = `/images/${slotNum}.png?v=${Date.now()}`;
  const el = document.getElementById('txStatus');
  if(el) { el.style.display='block'; el.textContent = `Generando ${codeId} estilo tarjeta...`; }
  const loadImg = (src) => new Promise((res,rej)=>{ let i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src; });
  let baseImg;
  try { baseImg = await loadImg(url); } catch { baseImg = await loadImg(`/images/1.png?v=${Date.now()}`); }
  const W=baseImg.width, H=baseImg.height;

  const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d');
  // pixel perfect
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(baseImg,0,0);

  // --- ESTILO COMO .fixedsys-card-text ---
  const code = (codeId||'').toString().toUpperCase();
  const fontSize = Math.floor(W * 0.044); // un poco más grande que antes para calcar 3.2rem
  const yPos = H - Math.floor(H * 0.076);
  const xPos = W/2;

  ctx.textAlign='center';
  ctx.textBaseline='middle';
  // Courier New Bold = tu .fixedsys-card-text
  ctx.font = `700 ${fontSize}px "Courier New", Courier, monospace`;
  // letter-spacing 4px -> en canvas
  try { ctx.letterSpacing = '4px'; } catch {}

  // Sombras estilo tarjeta pixelada sin blur (copia tu CSS)
  const shadows = [
    {dx: 3, dy: 3, color: '#091721'}, // sombra caída fondo azul
    {dx: 2, dy: 2, color: '#210d02'}, // sombra proyectada
    {dx: 1, dy: 1, color: '#5e2a09'},  // borde corte oscuro
    {dx: -1, dy: 1, color: '#944d1a'}, // extrusión inf izq
    {dx: 1, dy: -1, color: '#944d1a'}, // extrusión sup der
    {dx: -1, dy: -1, color: '#ffcc99'}, // brillo sup izq
  ];

  // dibujar sombras primero (de atrás hacia adelante)
  for(const s of shadows){
    ctx.fillStyle = s.color;
    ctx.fillText(code, xPos + s.dx, yPos + s.dy);
  }

  // color base naranja ocre metalizado
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
  if(el){ el.style.background='#DCFCE7'; el.textContent=`Holograma ${codeId} estilo VALID FROM enviado`; }
  return j;
}
window.editarYEnviarHolograma=editarYEnviarHolograma;
