// escritor.js - lee WASA_WORKER_URL y WASA_WORKER_KEY de wasa-config.js - SIN LOGS
async function editarYEnviarHolograma({slots, codeId, email, nombre, accessCode, tx_hash, percent}) {
  const WORKER_URL = window.WASA_WORKER_URL || 'https://founderswasablocks.javimsites.workers.dev';
  const WORKER_KEY = window.WASA_WORKER_KEY || 'wasa_2026_f0und3rs_9k2j4l8x';
  const slotNum = Math.max(1, Math.min(50, Math.round(slots)||1));
  const url = `/images/${slotNum}.png?v=${Date.now()}`;
  const el = document.getElementById('txStatus');
  if(el) { el.style.display='block'; el.textContent = `Generando ${codeId}...`; }
  const loadImg = (src) => new Promise((res,rej)=>{ let i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src; });
  let baseImg;
  try { baseImg = await loadImg(url); } catch { baseImg = await loadImg(`/images/1.png?v=${Date.now()}`); }
  const W=baseImg.width, H=baseImg.height;
  try { await document.fonts.load(`20px Fixedsys`); await document.fonts.ready; } catch {}
  const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d'); ctx.drawImage(baseImg,0,0);
  const fontSize = Math.floor(W * 0.032);
  const yPos = H - Math.floor(H * 0.076);
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font = `${fontSize}px 'Fixedsys', 'courier new', monospace`;
  ctx.fillStyle='rgba(0,0,0,0.8)';
  ctx.fillText(codeId, W/2 + 1, yPos + 1);
  ctx.fillStyle='#FFC94A';
  ctx.fillText(codeId, W/2, yPos);
  const b64=canvas.toDataURL('image/png').split(',')[1];
  let r;
  if (typeof window.wasaFetchWorker === 'function') {
    r = await window.wasaFetchWorker({action:'sendEditedImage',email,codeId,slots,slotNum,nombre,accessCode,tx_hash,percent,image_b64:b64,image_filename:`${codeId}-${slotNum}.png`});
  } else {
    r = await fetch(WORKER_URL,{method:'POST',headers:{'Content-Type':'text/plain','X-WASA-KEY': WORKER_KEY},body:JSON.stringify({action:'sendEditedImage',email,codeId,slots,slotNum,nombre,accessCode,tx_hash,percent,image_b64:b64,image_filename:`${codeId}-${slotNum}.png`})});
  }
  const j=await r.json(); if(!j.ok) throw new Error(j.error);
  if(el){ el.style.background='#DCFCE7'; el.textContent=`Holograma ${codeId} enviado`; }
  return j;
}
window.editarYEnviarHolograma=editarYEnviarHolograma;
