// escritor.js - USA TU TTF DE /fnts/ - Fixedsys para VALID FROM
async function editarYEnviarHolograma({slots, codeId, email, nombre, accessCode, tx_hash, percent}) {
  const WEBHOOK = window.WASA_WEBHOOK_URL || 'https://founderswasablocks.javimsites.workers.dev';
  const slotNum = Math.max(1, Math.min(50, Math.round(slots)||1));
  const url = `/images/${slotNum}.png?v=${Date.now()}`;
  const el = document.getElementById('txStatus');
  if(el) { el.style.display='block'; el.textContent = `Generando ${codeId} en Fixedsys TTF...`; }
  const loadImg = (src) => new Promise((res,rej)=>{ let i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src; });
  let baseImg;
  try { baseImg = await loadImg(url); } catch { baseImg = await loadImg(`/images/1.png?v=${Date.now()}`); }
  const W=baseImg.width, H=baseImg.height;

  // Esperar a que cargue Fixedsys desde /fnts/
  try {
    await document.fonts.load(`20px FixedsysTTF`);
    await document.fonts.ready;
  } catch(e) { console.log('fonts load fail', e); }

  const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d'); ctx.drawImage(baseImg,0,0);

  // SIN FRANJA NEGRA - Fuente Fixedsys TTF igual que VALID FROM APRIL
  const fontSize = Math.floor(W * 0.032); // tamaño similar a VALID FROM
  const yPos = H - Math.floor(H * 0.055);
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font = `${fontSize}px 'FixedsysTTF', 'Fixedsys', monospace`;

  // Sombra para relieve pixelado
  ctx.fillStyle='rgba(0,0,0,0.8)';
  ctx.fillText(codeId, W/2 + 1, yPos + 1);

  // Color dorado igual que VALID FROM en tu captura
  ctx.fillStyle='#FFC94A'; // o #E8F0FF si lo querés blanco
  ctx.fillText(codeId, W/2, yPos);

  const b64=canvas.toDataURL('image/png').split(',')[1];
  const r=await fetch(WEBHOOK,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'sendEditedImage',email,codeId,slots,slotNum,nombre,accessCode,tx_hash,percent,image_b64:b64,image_filename:`${codeId}-${slotNum}.png`})});
  const j=await r.json(); if(!j.ok) throw new Error(j.error);
  if(el){ el.style.background='#DCFCE7'; el.textContent=`Holograma ${codeId} Fixedsys enviado`; }
  return j;
}
window.editarYEnviarHolograma=editarYEnviarHolograma;
