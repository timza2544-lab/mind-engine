/* art.js — pixel-art engine for the main-act clips (128x80, 24 colours, own GIF encoder). Works in Node and the browser.
   Bodies are built from capsules with a shade pass; faces change with heat; outfits come in three states; a sheet covers the join (no anatomical detail). Adults only. */
(function (root) {
  'use strict';
  const W = 128, H = 80, FR = 6;
  const PAL = ['#14101c', '#241d30', '#35294a', '#2a2038', '#f4cba8', '#d9a07c', '#c88b68', '#9a6a4f', '#3b2418', '#15101a', '#f4f0f8', '#0b0910', '#ff7a9a', '#d93b3b', '#6b5a9e', '#54467f', '#e0457b', '#b8335f', '#ffb000', '#2fa3a3', '#e8e0f0', '#3a2a22', '#ffd36b', '#bfe9ff'];
  const HAIRS = { brown: '#3b2418', black: '#15101a', blonde: '#e8b868' };
  const POS = [
    { id: 'face', t: 'คร่อมหันหน้า' }, { id: 'back', t: 'คร่อมหันหลัง' }, { id: 'squat', t: 'นั่งยอง' }, { id: 'lean', t: 'โน้มตัวกระซิบ' }, { id: 'brace', t: 'เอนหลังยันต้นขา' }, { id: 'lap', t: 'นั่งตักพิงหัวเตียง' }, { id: 'turn', t: 'หมุนตัวครึ่งรอบ' }
  ];
  const RHY = { slow: { t: 'ช้าและลึก', per: 6, cyc: 1, amp: 1 }, mid: { t: 'ปานกลาง', per: 6, cyc: 2, amp: 1.4 }, fast: { t: 'เร็ว', per: 6, cyc: 3, amp: 1.6 } };
  const OUT = { dress: 'ชุดนอนสวมอยู่', half: 'เปิดบางส่วน', bare: 'เปลือย (มีผ้าห่มคลุม)' };
  function render(o, t) {
    o = Object.assign({ pos: 'face', rhythm: 'mid', outfit: 'half', heat: 50, hair: 'brown', climax: false, hud: false }, o || {});
    const g = new Uint8Array(W * H), px = (x, y, k) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y * W + x] = k; };
    const rect = (x, y, w, h, k) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, k); };
    const disc = (cx, cy, r, k) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.6) px(cx + i, cy + j, k); };
    const cap = (x0, y0, x1, y1, r, k, sh) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); if (sh !== undefined) for (let i = 0; i <= n; i++) disc(Math.round(x0 + (x1 - x0) * i / n) + 1, Math.round(y0 + (y1 - y0) * i / n) + 1, r, sh); for (let i = 0; i <= n; i++) disc(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), r, k); };
    const heat = o.heat, e = o.climax ? 2 : heat < 40 ? 0 : heat < 75 ? 1 : 2, R = RHY[o.rhythm] || RHY.mid, ph = o.climax ? ((t % 2) ? 1 : -1) * 0.6 : Math.sin(t / R.per * 6.2832 * R.cyc), bob = Math.round(ph * R.amp * (o.pos === 'lean' ? 0.6 : o.pos === 'squat' ? 1.5 : 1));
    // room
    rect(0, 0, W, 54, 2); for (let x = 0; x < W; x += 16) rect(x, 6, 1, 48, 3); rect(0, 54, W, 26, 1); rect(0, 70, W, 1, 0);
    rect(2, 14, 8, 50, 21); rect(2, 14, 8, 2, 18); rect(0, 62, 118, 6, 21); rect(2, 52, 108, 10, 14); rect(2, 60, 108, 2, 15);
    disc(112, 14, 4, 22); for (let y = 6; y < 28; y++) for (let x = 100; x < 124; x++) if ((x + y) % 3 === 0 && Math.hypot(x - 112, y - 14) < 12) px(x, y, 3);
    const skinH = 4, skinHs = 5, skinM = 6, skinMs = 7, hairK = 8, top = 16, topS = 17;
    PAL[8] = HAIRS[o.hair] || HAIRS.brown;
    const bare = o.outfit === 'bare', half = o.outfit === 'half', dress = o.outfit === 'dress';
    // him lying
    const himLie = () => { rect(10, 49, 22, 4, 20); cap(30, 50, 64, 50, 5, skinM, skinMs); cap(64, 50, 88, 49, 4, skinM, skinMs); cap(88, 49, 106, 54, 3, skinM, skinMs); disc(22, 49, 5, skinM); rect(17, 43, 11, 4, 9); if (!bare) { cap(30, 48, 50, 48, 4, 19, 19); if (dress) cap(30, 50, 56, 50, 5, 19); } };
    const face = (x, y, flip) => { const d = flip ? -1 : 1; if (e === 0) { px(x - 2 * d, y, 11); px(x + 1 * d, y, 11); } else if (e === 1) { px(x - 2 * d, y, 11); px(x - 1 * d, y, 11); px(x + 1 * d, y, 11); px(x + 2 * d, y, 11); } else { px(x - 2 * d, y - 1, 11); px(x - 1 * d, y, 11); px(x + 1 * d, y, 11); px(x + 2 * d, y - 1, 11); } if (e >= 1) { px(x - 3 * d, y + 2, 12); px(x - 2 * d, y + 2, 12); } if (e === 2) { rect(x - 1, y + 3, 3, 2, 11); px(x, y + 4, 13); } else if (e === 1) { px(x, y + 3, 13); px(x - 1, y + 3, 13); } else px(x, y + 3, skinHs); };
    const her = (hx, hy, sx, sy, headx, heady, facing, bust) => {
      // hips + legs are drawn by the caller; torso/arms/head here. facing: -1 left, +1 right
      cap(hx, hy, sx, sy, 5, skinH, skinHs);
      if (!bare && !half) cap(hx, hy, sx, sy, 5, top, topS); else if (half) { cap(hx + (sx - hx) * 0.15, hy + (sy - hy) * 0.15, hx, hy, 5, top, topS); cap(sx, sy, sx + (sx - hx) * 0.1, sy + (sy - hy) * 0.1, 3, top, topS); }
      if (bust) { disc(bust[0], bust[1], 3, skinH); px(bust[0] + facing, bust[1] + 2, skinHs); if (dress) disc(bust[0], bust[1], 3, top); }
      disc(headx, heady, 5, skinH); const sway = Math.round(ph * 2); cap(headx - facing * 2, heady - 2, headx - facing * 6 + sway, heady + 10, 3, hairK); rect(headx - 5, heady - 6, 11, 3, hairK); rect(headx - 5 + (facing > 0 ? 0 : 6), heady - 4, 5, 3, hairK);
      face(headx + facing, heady + 1, facing < 0);
    };
    const sheet = (x, w) => { const w2 = Math.round(ph); for (let i = 0; i < w; i++) { const yy = 50 - Math.round(Math.sin((i + t) / 3) * 0.8) + (i % 9 === 0 ? 1 : 0) - (bob > 0 ? 0 : 0); for (let y = yy + w2 * 0; y < 58; y++) px(x + i, y, (y - yy) < 2 ? 14 : 14); px(x + i, yy, 15); } };
    const skirt = (x, y, w) => { if (dress || half) { rect(x - w, y - 1, w * 2, 5, 16); rect(x - w, y + 3, w * 2, 1, 17); } };
    if (o.pos === 'lap') {
      rect(2, 22, 9, 36, 21); cap(34, 52, 18, 38, 5, skinM, skinMs); disc(14, 30, 5, skinM); rect(9, 24, 11, 4, 9); if (!bare) cap(30, 50, 20, 40, 4, 19);
      const hy = 46 + bob, hx = 36; cap(hx, hy, hx + 3, 56, 4, skinH, skinHs); cap(hx + 3, 56, hx + 16, 58, 3, skinH, skinHs); cap(hx - 6, hy - 14, hx, hy, 5, skinH, skinHs); if (dress) cap(hx - 6, hy - 14, hx, hy, 5, top); else if (half) cap(hx - 6, hy - 14, hx - 3, hy - 8, 4, top);
      cap(hx - 6, hy - 12, 20, 33, 2, skinH, skinHs); cap(hx - 6, hy - 12, 20, 36, 2, skinH); disc(hx - 10, hy - 18, 5, skinH); cap(hx - 6, hy - 22, hx + 4, hy - 4, 3, hairK); rect(hx - 15, hy - 24, 10, 3, hairK); face(hx - 12, hy - 17, true); disc(hx - 11, hy - 10, 3, skinH); if (dress) disc(hx - 11, hy - 10, 3, top); sheet(34, 26);
    } else {
      himLie();
      if (o.pos === 'face') { const hx = 60, hy = 44 + bob; cap(hx, hy, hx + 14, 54, 4, skinH, skinHs); cap(hx + 14, 54, hx + 26, 57, 3, skinH, skinHs); cap(hx - 2, hy + 1, hx + 12, 55, 4, skinH); skirt(hx, hy, 7); her(hx, hy, hx - 2, hy - 17, hx - 4, hy - 25, -1, [hx - 8, hy - 12]); cap(hx - 4, hy - 16, 46, 49, 2, skinH, skinHs); cap(hx - 4, hy - 16, 48, 50, 2, skinH); cap(30, 50, 44, 50, 2, skinM); sheet(48, 30); }
      else if (o.pos === 'back') { const hx = 60, hy = 44 + bob; cap(hx, hy, hx - 10, 54, 4, skinH, skinHs); cap(hx - 10, 54, hx - 24, 57, 3, skinH, skinHs); skirt(hx, hy, 7); her(hx, hy, hx + 5, hy - 16, hx + 9, hy - 23, 1, [hx + 8, hy - 11]); cap(hx + 5, hy - 14, 78, 50, 2, skinH, skinHs); sheet(46, 32); }
      else if (o.pos === 'squat') { const hx = 60, hy = 39 + Math.round(bob * 1.2); cap(hx, hy, hx + 12, 46, 4, skinH, skinHs); cap(hx + 12, 46, hx + 10, 56, 3, skinH, skinHs); rect(hx + 8, 56, 8, 2, skinHs); cap(hx - 2, hy + 1, hx - 14, 47, 4, skinH); cap(hx - 14, 47, hx - 12, 56, 3, skinH); rect(hx - 16, 56, 8, 2, skinHs); skirt(hx, hy, 7); her(hx, hy, hx - 1, hy - 17, hx - 3, hy - 25, -1, [hx - 7, hy - 12]); cap(hx - 3, hy - 14, 48, 49, 2, skinH); sheet(46, 30); }
      else if (o.pos === 'lean') { const hx = 62, hy = 46 + bob; cap(hx, hy, hx + 14, 54, 4, skinH, skinHs); cap(hx + 14, 54, hx + 26, 57, 3, skinH, skinHs); skirt(hx, hy, 7); her(hx, hy, hx - 20, hy - 7, hx - 28, hy - 10, -1, [hx - 15, hy - 3]); cap(hx - 20, hy - 6, 36, 47, 2, skinH); cap(hx - 20, hy - 6, 24, 46, 2, skinH); cap(hx - 24, hy - 12, 26, 44, 3, hairK); sheet(48, 30); }
      else if (o.pos === 'brace') { const hx = 62, hy = 44 + bob; cap(hx, hy, hx + 14, 54, 4, skinH, skinHs); cap(hx + 14, 54, hx + 26, 57, 3, skinH, skinHs); skirt(hx, hy, 7); her(hx, hy, hx + 9, hy - 15, hx + 13, hy - 22, 1, [hx + 12, hy - 10]); cap(hx + 8, hy - 12, 82, 50, 2, skinH, skinHs); sheet(48, 32); }
      else { // turn: face -> side -> back across the frames
        const hx = 60, hy = 44 + bob, st = t < 2 ? 0 : t < 4 ? 1 : 2; cap(hx, hy, hx + (st === 2 ? -10 : 14), 54, 4, skinH, skinHs); cap(hx + (st === 2 ? -10 : 14), 54, hx + (st === 2 ? -24 : 26), 57, 3, skinH, skinHs); skirt(hx, hy, 7);
        if (st === 0) her(hx, hy, hx - 2, hy - 17, hx - 4, hy - 25, -1, [hx - 8, hy - 12]); else if (st === 1) { her(hx, hy, hx, hy - 17, hx, hy - 25, -1, [hx - 4, hy - 12]); disc(hx + 4, hy - 12, 3, skinH); } else her(hx, hy, hx + 5, hy - 16, hx + 9, hy - 23, 1, [hx + 8, hy - 11]);
        sheet(46, 32); }
    }
    if (o.climax) for (let i = 0; i < 5; i++) { const x = 30 + i * 17, y = 28 - ((t * 3 + i * 4) % 20); [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(p => px(x + p[0], y + p[1] + 6, 13)); }
    if (o.climax) for (let i = 0; i < 8; i++) px((i * 43 + t * 11) % W, (i * 19 + t * 5) % 34, 18);
    if (e >= 1) { const sx = o.pos === 'lap' ? 28 : 72 - (t % 2); px(sx, 22 + (t * 2) % 8, 23); px(sx + 4, 18 + (t * 3) % 8, 23); }
    if (o.hud) { rect(96, 68, 28, 6, 11); rect(97, 69, Math.round(heat / 100 * 26), 4, heat > 75 ? 13 : 18); }
    return g;
  }
  function renderAfter(o, t) { // lying together: hug / laugh / cover
    o = Object.assign({ kind: 'hug', outfit: 'bare', hair: 'brown' }, o || {}); PAL[8] = HAIRS[o.hair] || HAIRS.brown;
    const g = new Uint8Array(W * H), px = (x, y, k) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y * W + x] = k; }, rect = (x, y, w, h, k) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, k); }, disc = (cx, cy, r, k) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.6) px(cx + i, cy + j, k); }, cap = (x0, y0, x1, y1, r, k, sh) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); if (sh !== undefined) for (let i = 0; i <= n; i++) disc(Math.round(x0 + (x1 - x0) * i / n) + 1, Math.round(y0 + (y1 - y0) * i / n) + 1, r, sh); for (let i = 0; i <= n; i++) disc(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), r, k); };
    rect(0, 0, W, 54, 2); for (let x = 0; x < W; x += 16) rect(x, 6, 1, 48, 3); rect(0, 54, W, 26, 1); rect(2, 14, 8, 50, 21); rect(0, 62, 118, 6, 21); rect(2, 52, 108, 10, 14); rect(2, 60, 108, 2, 15); disc(112, 14, 4, 22);
    const br = Math.round(Math.sin(t / 6 * 6.2832) * 0.8), sh = o.kind === 'laugh' ? ((t % 2) ? 1 : -1) : 0;
    rect(12, 47, 24, 4, 20); disc(22, 47, 5, 6); rect(17, 41, 11, 4, 9); cap(30, 49 + br, 64, 49 + br, 5, 6, 7);
    disc(34, 46 + sh, 5, 4); cap(34, 46 + sh, 60, 50 + br, 4, 4, 5); cap(36, 42 + sh, 52, 48, 3, 8); rect(28, 40 + sh, 11, 3, 8); px(32, 46 + sh, 11); px(36, 46 + sh, 11); px(34, 49 + sh, 12 + 0); if (o.kind === 'laugh') { rect(33, 48 + sh, 3, 2, 11); }
    px(31, 48 + sh, 12); px(30, 48 + sh, 12); cap(30, 47, 44, 46, 2, 4, 5);
    const cover = o.kind === 'cover' ? 40 : 52; for (let x = 24; x < 100; x++) { const yy = cover + Math.round(Math.sin((x + t * 2) / 5) * 0.9); for (let y = yy; y < 58; y++) px(x, y, y - yy < 2 ? 14 : 14); px(x, yy, 15); }
    if (o.kind === 'hug') cap(52, 49, 70, 50, 2, 4, 5);
    if (o.kind === 'cover') cap(48, 44, 40, 42, 2, 4, 5);
    for (let i = 0; i < 3; i++) { const x = 30 + i * 22, y = 30 - ((t * 2 + i * 5) % 16); [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(p => px(x + p[0], y + p[1] + 6, 13)); }
    return g;
  }
  /* ---------- gif ---------- */
  function lzw(idx, minCode) {
    const clear = 1 << minCode, eoi = clear + 1, out = []; let size = minCode + 1, next = eoi + 1, dict = new Map(), cur = 0, bits = 0;
    const emit = c => { cur |= c << bits; bits += size; while (bits >= 8) { out.push(cur & 255); cur >>>= 8; bits -= 8; } };
    emit(clear); let p = idx[0];
    for (let i = 1; i < idx.length; i++) { const k = idx[i], key = p * 256 + k, v = dict.get(key); if (v !== undefined) { p = v; continue; } emit(p); if (next < 4096) { dict.set(key, next++); if (next > (1 << size) && size < 12) size++; } else { emit(clear); dict.clear(); size = minCode + 1; next = eoi + 1; } p = k; }
    emit(p); emit(eoi); if (bits > 0) out.push(cur & 255); return out;
  }
  function gif(frames, k, delay) {
    const w = W * k, h = H * k, b = []; const w16 = v => b.push(v & 255, (v >> 8) & 255);
    'GIF89a'.split('').forEach(c => b.push(c.charCodeAt(0))); w16(w); w16(h); b.push(0xF4, 0, 0); for (let i = 0; i < 32; i++) { const x = PAL[i] || '#000000'; b.push(parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16)); }
    b.push(0x21, 0xFF, 0x0B); 'NETSCAPE2.0'.split('').forEach(c => b.push(c.charCodeAt(0))); b.push(3, 1, 0, 0, 0);
    frames.forEach(g => { b.push(0x21, 0xF9, 4, 0, delay || 12, 0, 0, 0, 0x2C); w16(0); w16(0); w16(w); w16(h); b.push(0); const idx = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) idx[y * w + x] = g[((y / k) | 0) * W + ((x / k) | 0)]; b.push(5); const data = lzw(idx, 5); for (let i = 0; i < data.length; i += 255) { const n = Math.min(255, data.length - i); b.push(n); for (let j = 0; j < n; j++) b.push(data[i + j]); } b.push(0); });
    b.push(0x3B); return new Uint8Array(b);
  }
  root.ART = { W, H, FR, PAL, HAIRS, POS, RHY, OUT, render, renderAfter, gif };
  if (typeof module !== 'undefined') module.exports = root.ART;
})(typeof window !== 'undefined' ? window : globalThis);
