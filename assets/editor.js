'use strict';
// Local-only replacement editor. No uploads, accounts or external libraries.
const replacements = new Map();
const grid = document.querySelector('.grid');
const status = document.querySelector('.status');
const exportButton = document.querySelector('#export');
window.PORTFOLIO_IMAGES.forEach(path => {
  const card = document.createElement('section'); card.className = 'card';
  const image = document.createElement('img'); image.src = path; image.alt = path; image.loading = 'lazy';
  const label = document.createElement('p'); label.textContent = path;
  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/jpeg,image/png,image/webp'; input.setAttribute('aria-label', path + ' ersetzen');
  card.append(image, label, input); grid.append(card);
  let revision = 0;
  async function replace(file) {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) { status.textContent = 'Bitte eine JPEG-, PNG- oder WebP-Datei wählen.'; return; }
    if (file.size > 30 * 1024 * 1024) { status.textContent = 'Bitte ein Bild mit weniger als 30 MB wählen.'; return; }
    const current = ++revision;
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext('2d');
      if (!path.endsWith('.png')) { context.fillStyle = '#000'; context.fillRect(0,0,canvas.width,canvas.height); }
      context.drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, path.endsWith('.png') ? 'image/png' : 'image/jpeg', .9));
      if (!blob) throw new Error('Bild konnte nicht konvertiert werden.');
      if (current !== revision) return;
      if (image.dataset.localUrl) URL.revokeObjectURL(image.dataset.localUrl);
      image.src = image.dataset.localUrl = URL.createObjectURL(blob); replacements.set(path,blob);
      card.classList.add('changed'); exportButton.disabled = false;
      status.textContent = `${replacements.size} Bild(er) geändert. Jetzt herunterladen und die Dateien im Website-Ordner ersetzen.`;
    } catch { status.textContent = 'Dieses Bild konnte nicht gelesen werden. Bitte eine andere Datei wählen.'; }
  }
  input.addEventListener('change', () => replace(input.files[0]));
  card.addEventListener('dragover', event => { event.preventDefault(); card.classList.add('drag'); });
  card.addEventListener('dragleave', () => card.classList.remove('drag'));
  card.addEventListener('drop', event => { event.preventDefault(); card.classList.remove('drag'); replace(event.dataTransfer.files[0]); });
});
// ZIP STORE format with CRC32. Output opens in Finder, Explorer and standard ZIP tools.
const table = Uint32Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function header(size){const bytes=new Uint8Array(size);return{bytes,view:new DataView(bytes.buffer)};}
exportButton.addEventListener('click', async () => {
  exportButton.disabled = true;
  try {
    const files = [...replacements.entries()]; const chunks=[], central=[]; let offset=0, centralSize=0;
    for(const [path,blob] of files){
      const name=new TextEncoder().encode(path), data=new Uint8Array(await blob.arrayBuffer()), crc=crc32(data);
      const local=header(30);const l=local.view;l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);l.setUint16(6,0x800,true);l.setUint32(14,crc,true);l.setUint32(18,data.length,true);l.setUint32(22,data.length,true);l.setUint16(26,name.length,true);
      chunks.push(local.bytes,name,data);
      const cent=header(46);const c=cent.view;c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x800,true);c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);
      central.push(cent.bytes,name);centralSize+=46+name.length;offset+=30+name.length+data.length;
    }
    const end=header(22);const v=end.view;v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,centralSize,true);v.setUint32(16,offset,true);
    const zip=new Blob([...chunks,...central,end.bytes],{type:'application/zip'});const url=URL.createObjectURL(zip);const link=document.createElement('a');link.href=url;link.download='Portfolio_Bildaustausch.zip';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
    status.textContent='ZIP erstellt. Die neuen Dateien müssen noch in deinem Website-Ordner und auf GitHub ersetzt werden.';
  } catch { status.textContent='Export fehlgeschlagen. Bitte erneut versuchen.'; }
  finally { exportButton.disabled = replacements.size===0; }
});
