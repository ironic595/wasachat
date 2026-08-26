async function editarYEnviarHolograma({slots, codeId, email, nombre, accessCode, tx_hash, percent}) {
  const WEBHOOK = window.WASA_WEBHOOK_URL || 'https://founderswasablocks.javimsites.workers.dev';
  const slotNum = Math.max(1, Math.min(50, Math.round(slots)||1));
  const url = `/images/${slotNum}.png?v=${Date.now()}`;
  const el = document.getElementById('txStatus');
  if(el) { el.style.display='block'; el.textContent = `Generando ${codeId} sin franja negra...`; }
  const loadImg = (src) => new Promise((res,rej)=>{ let i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=rej; i.src=src; });
  let baseImg;
  try { baseImg = await loadImg(url); } catch { baseImg = await loadImg(`/images/1.png?v=${Date.now()}`); }
  const W=baseImg.width, H=baseImg.height;
  const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d'); ctx.drawImage(baseImg,0,0);
  const fontSize=Math.floor(W*0.025); const yPos=H-Math.floor(H*0.085);
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=`750 ${fontSize}px 'Fixedsys','Courier New', monospace`;
  ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillText(codeId, W/2+1.5, yPos+1.5);
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillText(codeId, W/2-0.8, yPos-0.8);
  ctx.fillStyle='#db9651'; ctx.strokeStyle='rgba(0,0,0,0)'; ctx.lineWidth=Math.max(1,fontSize*0.07);
  ctx.strokeText(codeId, W/2, yPos); ctx.fillText(codeId, W/2, yPos);
  const b64=canvas.toDataURL('image/png').split(',')[1];
  const r=await fetch(WEBHOOK,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'sendEditedImage',email,codeId,slots,slotNum,nombre,accessCode,tx_hash,percent,image_b64:b64,image_filename:`${codeId}-${slotNum}.png`})});
  const j=await r.json(); if(!j.ok) throw new Error(j.error);
  if(el){ el.style.background='#DCFCE7'; el.textContent=`Holograma ${codeId} enviado sin franja`; }
  return j;
}
window.editarYEnviarHolograma=editarYEnviarHolograma;
console.log('escritor v6 SIN FRANJA',Date.now());
