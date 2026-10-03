// TRUMBO STUDIO: Play developer icon (512x512) and header (4096x2304), 24-bit PNG, drawn with the game's own sprites
const { chromium } = require('playwright'); const fs = require('fs'), zlib = require('zlib');
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = b => { let c = -1; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
function png(w, h, rgb) { const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]); }
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://127.0.0.1:8766/gfx4.html'); await p.waitForTimeout(1500);
  await p.evaluate(async () => {
    const ff = new FontFace('VT323x', 'url(fonts/VT323.ttf)'); await ff.load(); document.fonts.add(ff);
    const G = __gfx4, R = G.R;
    const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
    const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
    const dog = { face: -1, flash: 0, moving: false, barkT: 0, biteT: 0, anim: 0 };
    const heart = (x, cx, cy, s, col, hi) => { const rows = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000']; rows.forEach((r, j) => [...r].forEach((v, i) => { if (v === '1') R(x, cx - Math.round(3.5 * s) + i * s, cy - 3 * s + j * s, s, s, col); })); if (hi) R(x, cx - Math.round(3.5 * s) + s, cy - 2 * s, s, s, hi); };
    const title = (x, text, cx, y, size, col, sh, off) => { x.font = `${size}px VT323x`; x.textAlign = 'center'; x.textBaseline = 'top'; x.fillStyle = sh; x.fillText(text, cx + off, y + off); x.fillStyle = col; x.fillText(text, cx, y); };
    const sky = (x, w, h, bands) => { const bh = Math.ceil(h / bands.length); bands.forEach((c, i) => R(x, 0, i * bh, w, bh, c)); };
    // ---------- developer icon: 64x64 pixels x8
    { const [s, x] = cv(64, 64), Rn = rng(7);
      sky(x, 64, 64, ['#1e1240', '#2a1a5a', '#3a2a7a', '#5a3a9a', '#7a4fb0', '#a05ab8', '#c86ab0', '#ef8aa8']);
      for (let i = 0; i < 22; i++) R(x, Math.floor(Rn() * 64), Math.floor(Rn() * 30), 1, 1, Rn() < 0.3 ? '#fff' : '#c9b8e8');
      heart(x, 32, 32, 4, '#ff4d6d', '#ff9ab0');
      R(x, 0, 52, 64, 12, '#6ab04c'); R(x, 0, 52, 64, 1, '#86c860');
      G.drawKid(x, 17, 54, 'trump', 'down', 0); G.drawKid(x, 29, 54, 'poly', 'down', 0); G.drawDog(x, 46, 55, dog);
      const [c, cx] = cv(512, 512); cx.drawImage(s, 0, 0, 512, 512);
      title(cx, 'TRUMBO', 256, 2, 150, '#ffd23f', '#7a1f5a', 7);
      cx.fillStyle = 'rgba(30,18,64,.75)'; cx.fillRect(0, 434, 512, 78);
      title(cx, 'S T U D I O', 256, 436, 74, '#ffffff', '#4a1f6a', 4);
      window.__icon = c; }
    // ---------- header: 256x144 pixels x16
    { const [s, x] = cv(256, 144), Rn = rng(11);
      sky(x, 256, 108, ['#2a1a5a', '#3a2a7a', '#5a3a9a', '#7a4fb0', '#a05ab8', '#c86ab0', '#ef8aa8', '#ffb08f', '#ffd08a']);
      for (let i = 0; i < 60; i++) R(x, Math.floor(Rn() * 256), Math.floor(Rn() * 40), 1, 1, Rn() < 0.3 ? '#fff' : '#c9b8e8');
      for (let r = 16; r > 0; r--) { const w = Math.round(Math.sqrt(256 - (16 - r) ** 2)); R(x, 128 - w, 92 - 16 + (16 - r), w * 2, 1, '#fff2a8'); }
      const mount = (x0, w, h, col, cap) => { for (let i = 0; i < h; i++) { const ww = Math.round(w * i / h); R(x, x0 - ww, 108 - h + i, ww * 2, 1, col); if (cap && i < h * 0.3) R(x, x0 - ww, 108 - h + i, ww * 2, 1, cap); } };
      mount(30, 40, 52, '#4a2a6a'); R(x, 27, 56, 6, 3, '#ff7a2f'); R(x, 29, 52, 2, 4, '#ffb13b');
      mount(70, 30, 34, '#5a3a7a');
      mount(222, 42, 56, '#8aa0c8', '#f4faff'); mount(186, 28, 36, '#9ab0d0', '#ffffff');
      const cloud = (cx, cy, w, col) => { R(x, cx, cy, w, 4, col); R(x, cx + 3, cy - 3, w - 6, 3, col); R(x, cx + 7, cy - 5, w - 14, 2, col); };
      cloud(96, 30, 26, '#f4e8ff'); cloud(150, 22, 20, '#f4e8ff'); cloud(14, 18, 22, '#e8d8ff'); cloud(224, 14, 18, '#e8d8ff');
      // ground: jungle | home | snow
      R(x, 0, 108, 256, 36, '#6ab04c'); R(x, 0, 108, 90, 36, '#3f7a2a'); R(x, 166, 108, 90, 36, '#e8f2fa'); R(x, 0, 108, 256, 1, '#86c860'); R(x, 166, 108, 90, 1, '#ffffff');
      for (let i = 0; i < 40; i++) { const gx = Math.floor(Rn() * 256), gy = 110 + Math.floor(Rn() * 33); R(x, gx, gy, 2, 1, gx < 90 ? '#346a22' : gx > 166 ? '#d0e0f0' : '#5a9a3e'); }
      for (let y = 108; y < 144; y += 2) { R(x, 88 + (y % 4), y, 2, 1, '#6ab04c'); R(x, 166 - (y % 4), y, 2, 1, '#e8f2fa'); }
      const tree = (tx, ty) => { R(x, tx - 1, ty - 16, 3, 16, '#6b4226'); R(x, tx - 9, ty - 24, 18, 9, '#24561a'); R(x, tx - 7, ty - 27, 14, 4, '#2f6a22'); R(x, tx - 6, ty - 22, 6, 3, '#3f8a2a'); };
      const pine = (tx, ty) => { R(x, tx - 1, ty - 4, 2, 4, '#6b4226'); for (let k = 0; k < 5; k++) R(x, tx - k - 1, ty - 22 + k * 4, 2 + k * 2, 4, k % 2 ? '#e8f4ff' : '#2f6a4a'); };
      tree(10, 110); tree(80, 112); pine(176, 112); pine(250, 110); pine(240, 116);
      G.drawTrex(x, 44, 132, { flash: 0, mouth: 1, dead: 0, step: 0 });
      x.save(); x.translate(214, 132); x.scale(-1, 1); G.drawMammoth(x, 0, 0, { flash: 0, dead: 0, step: 0, trunkUp: 1 }); x.restore();
      G.drawHouse(x, 128, 114);
      for (const wx of [-26, 14]) { R(x, 128 + wx + 1, 114 - 29, 10, 10, '#ffd86a'); R(x, 128 + wx + 5, 114 - 29, 1, 10, '#5a3a20'); R(x, 128 + wx + 1, 114 - 25, 10, 1, '#5a3a20'); }
      G.drawFam(x, 98, 138, 'dad'); G.drawFam(x, 111, 138, 'mom'); G.drawFam(x, 123, 138, 'sister');
      G.drawKid(x, 135, 138, 'trump', 'down', 0); G.drawKid(x, 147, 138, 'poly', 'down', 0); G.drawDog(x, 164, 139, dog);
      heart(x, 128, 62, 1, '#ff4d6d');
      const [c, cx] = cv(4096, 2304); cx.drawImage(s, 0, 0, 4096, 2304);
      const gr = cx.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(20,10,48,.55)'); gr.addColorStop(1, 'rgba(20,10,48,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 4096, 760);
      title(cx, 'TRUMBO STUDIO', 2048, 110, 420, '#ffd23f', '#7a1f5a', 18);
      title(cx, 'Pixel adventures, made by a family', 2048, 530, 150, '#ffffff', '#4a1f6a', 8);
      window.__head = c; }
  });
  const grab = async (name, w, h, file) => {
    const parts = [];
    for (let y = 0; y < h; y += 256) parts.push(Buffer.from(await p.evaluate(([n, y, w, h]) => { const c = window[n], d = c.getContext('2d').getImageData(0, y, w, Math.min(256, h - y)).data, o = new Uint8Array(d.length / 4 * 3); for (let i = 0, j = 0; i < d.length; i += 4) { o[j++] = d[i]; o[j++] = d[i + 1]; o[j++] = d[i + 2]; } let s = ''; for (let i = 0; i < o.length; i += 32768) s += String.fromCharCode.apply(null, o.subarray(i, i + 32768)); return btoa(s); }, [name, y, w, h]), 'base64'));
    const out = png(w, h, Buffer.concat(parts)); fs.writeFileSync(file, out); console.log(file, out.length, 'bytes');
  };
  await grab('__icon', 512, 512, 'studio/trumbo-studio-icon-512.png');
  await grab('__head', 4096, 2304, 'studio/trumbo-studio-header-4096x2304.png');
  await b.close();
})();
