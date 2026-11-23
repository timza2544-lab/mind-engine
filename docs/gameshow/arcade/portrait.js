  /* ---------- portrait: a big pixel-art bust drawn per frame (160x200, ordered dither, outlines) ---------- */
  const PW = 160, PH = 200, BAYR = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const hx = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mixc = (a, b, t) => { const x = hx(a), y = hx(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const dth = (v, x, y, n) => { const f = clamp(v, 0, 0.999) * (n - 1), i = Math.floor(f), fr = f - i; return i + (fr > (BAYR[y & 3][x & 3] + 0.5) / 16 ? 1 : 0); };
  const hsh = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 1274126177) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
  const SKINT = { fair: '#f4d2bc', tan: '#e3a87c', deep: '#a8704c' }, EYEC = { brown: '#7a4a2a', violet: '#7a58c8', teal: '#2fa3a3' };
  const THEMES = {
    casino: { sign: 'VIP CASINO', f1: '#cfc6e8', f2: '#2b1f47', neon: '#ff4fa3', glow: 'rgba(255,79,163,.38)', bd: '#b79cff', bg: ['#2a1245', '#08040f'], dress: '#17323a', trim: '#e9c46a' },
    hotel: { sign: 'MOONLIGHT HOTEL', f1: '#e4d7b3', f2: '#1a2440', neon: '#ffd36b', glow: 'rgba(255,211,107,.35)', bd: '#ffd36b', bg: ['#1a2a52', '#060a16'], dress: '#5a1b32', trim: '#f2d98b' },
    onsen: { sign: 'ONSEN LOUNGE', f1: '#cfe9e4', f2: '#173a40', neon: '#5eead4', glow: 'rgba(94,234,212,.33)', bd: '#7dd3c8', bg: ['#14484f', '#06161a'], dress: '#a4425d', trim: '#ffe3ec' },
    space: { sign: 'STAR CABIN', f1: '#c4d2f2', f2: '#141c3d', neon: '#6ec6ff', glow: 'rgba(110,198,255,.35)', bd: '#8db4ff', bg: ['#1a2260', '#04061a'], dress: '#26344f', trim: '#7fe0ff' }
  };
  function portraitPal(o) {
    const th = THEMES[o.theme] || THEMES.casino, sk = SKINT[o.skin] || SKINT.fair, hr = o.hairHex, ey = EYEC[o.eye] || EYEC.brown, dr = th.dress;
    const P = [];
    [0, 1, 2, 3].forEach(i => P.push(mixc(th.bg[0], th.bg[1], 0.15 + i * 0.28)));           // 0-3 background
    P.push(mixc(sk, '#ffffff', 0.28), sk, mixc(sk, '#b4606a', 0.28), mixc(sk, '#5a2a3a', 0.45)); // 4-7 skin
    P.push(mixc(hr, '#ffffff', 0.35), hr, mixc(hr, '#1a0f2a', 0.35), mixc(hr, '#08040f', 0.6)); // 8-11 hair
    P.push(mixc(dr, '#ffffff', 0.38), dr, mixc(dr, '#000000', 0.35), mixc(dr, '#000000', 0.6)); // 12-15 outfit
    P.push('#ff9ab0', '#e0557a', '#9a2850');                                                   // 16-18 lips
    P.push(mixc(ey, '#000000', 0.45), ey, mixc(ey, '#ffffff', 0.45));                          // 19-21 iris
    P.push('#1a0f1e', '#fffaf6', '#2a1420', '#ff6f91', th.trim, mixc(th.trim, '#ffffff', 0.5), '#ff3b5c', '#9fe6ff', '#4a1220', '#ff7a8e', th.neon); // 22-32
    return P;
  }
  const C = { BG: 0, SK: 4, HR: 8, OF: 12, LP: 16, IR: 19, OUT: 22, WH: 23, EYE: 24, BL: 25, GD: 26, GDH: 27, HRT: 28, SW: 29, MIN: 30, TON: 31, NEON: 32 };
  function drawPortrait(cv, o, t) {
    const g = new Uint8Array(PW * PH), cl = new Uint8Array(PW * PH), CX = 80, h = clamp(o.heat / 100, 0, 1), cli = !!o.climax, bob = Math.round(Math.sin(t / 6 * 6.283) * (0.6 + h * 0.8)), fx = o.fx || [];
    const put = (x, y, c, k) => { x |= 0; y |= 0; if (x >= 0 && x < PW && y >= 0 && y < PH) { const i = y * PW + x; g[i] = c; if (k >= 0) cl[i] = k; } };
    const sway = Math.sin(t / 6 * 6.283) * 1.2;
    // background glow
    for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) { const dx = x - CX, dy = y - 78, v = 0.12 + 0.5 * (1 - y / PH) * 0.6 + 0.55 * Math.exp(-(dx * dx + dy * dy) / 3600); put(x, y, C.BG + dth(v, x, y, 4), 0); }
    for (let i = 0; i < 9; i++) { const bx = (hsh(i, 1, 7) * PW) | 0, by = (hsh(i, 2, 7) * 120) | 0, br = 3 + (hsh(i, 3, 7) * 6 | 0); for (let a = 0; a < 40; a++) { const q = a / 40 * 6.283; put(bx + Math.cos(q) * br, by + Math.sin(q) * br + Math.sin(t / 6 * 6.283 + i) , C.BG + 3, 0); } }
    // back hair
    for (let y = 16; y < PH; y++) for (let x = 0; x < PW; x++) { const dx = (x - CX) / 62, dy = (y - 78) / 74, ax = Math.abs(x - CX), dome = dx * dx + dy * dy <= 1 && y < 135, lock = y >= 96 && ax >= 28 && ax <= 66 - (y - 96) * 0.1 + Math.sin(y * 0.06 + sway * 0.4) * 2 + (x < CX ? 0 : 0); if (dome || lock) { const v = 0.74 - 0.38 * (ax / 66) + 0.07 * Math.sin(x * 0.45 + Math.sin(y * 0.05) * 2 + t * 0.25) - (y > 150 ? (y - 150) * 0.004 : 0); put(x, y, C.HR + dth(v, x, y, 4), 1); } }
    // torso in the outfit
    const dressTone = (x, y, v) => C.OF + dth(v + 0.3 * Math.exp(-((x - 52) * (x - 52)) / 70) * (y > 150 ? 1 : 0.4), x, y, 4);
    for (let y = 126 + bob; y < PH; y++) for (let x = 0; x < PW; x++) { const hw = Math.min(50 + (y - 126) * 0.34, 18 + (y - 126 - bob) * 5), ax = Math.abs(x - CX); if (ax <= hw) { const v = 0.55 - 0.22 * (ax / hw) + 0.1 * Math.sin((y - 150) * 0.12); put(x, y, dressTone(x, y, v), 2); } }
    // chest (the neckline shows skin, bust shaped by two soft highlights)
    for (let y = 132 + bob; y < 164 + bob; y++) for (let x = 0; x < PW; x++) { const vy = y - 132 - bob, ax = Math.abs(x - CX); if (ax < vy * 0.34 + 1 && ax < 13) { const v = 0.78 - 0.32 * (vy / 44) - 0.2 * Math.exp(-(ax * ax) / 10) * (vy > 14 ? 1 : 0.3); put(x, y, C.SK + dth(v, x, y, 4), 3); } }
    for (let y = 132 + bob; y < 166 + bob; y++) for (let x = 0; x < PW; x++) { const vy = y - 132 - bob, ax = Math.abs(x - CX), e = ax - (vy * 0.34 + 1); if (e >= 0 && e < 1.6 && ax < 15) put(x, y, C.GD + (ax % 4 < 2 ? 0 : 1), -1); }
    // mandarin collar and neck
    for (let y = 100 + bob; y < 134 + bob; y++) for (let x = CX - 9; x <= CX + 9; x++) { const v = 0.62 - 0.28 * Math.max(0, (112 + bob - y) / 12) * 0 - (y < 112 + bob ? 0.25 : 0); put(x, y, C.SK + dth(v, x, y, 4), 4); }
    for (let y = 118 + bob; y < 134 + bob; y++) for (let x = CX - 14; x <= CX + 14; x++) { const ax = Math.abs(x - CX), top = 118 + bob + ax * 0.25; if (y >= top && !(ax < (y - 126 - bob) * 0.34 + 1 && y > 126 + bob)) put(x, y, dressTone(x, y, 0.62 - 0.2 * (ax / 14)), 2); }
    put(CX - 7, 119 + bob, C.GD, -1); put(CX + 7, 119 + bob, C.GD, -1); put(CX, 132 + bob, C.GD, -1); put(CX, 133 + bob, C.GDH, -1);
    // face
    const faceHW = y => y <= 72 ? 31 * Math.sqrt(Math.max(0, 1 - ((72 - y) / 36) * ((72 - y) / 36))) : 31 * Math.pow(Math.max(0, 1 - Math.pow((y - 72) / 42, 2.2)), 0.6);
    for (let y = 36; y <= 114; y++) { const hw = faceHW(y); for (let x = Math.ceil(CX - hw); x <= CX + hw; x++) { const ax = Math.abs(x - CX), v = 0.74 - 0.14 * ((x - CX) / 31) - 0.1 * ((y - 72) / 40) - (ax > hw - 2.5 ? 0.22 : 0) - (y > 100 ? 0.12 : 0); put(x, y, C.SK + dth(v, x, y, 4), 5); } }
    // blush
    const bh = clamp(0.12 + h * 0.95, 0, 1); for (const s of [-1, 1]) for (let y = 78; y < 94; y++) for (let x = CX + s * 30; x < CX + s * 12; x += 1) { /* placeholder to keep loop shape */ }
    for (const s of [-1, 1]) for (let y = 80; y < 94; y++) for (let x = CX + s * 31; x !== CX + s * 10; x += -s) { const dx = (x - (CX + s * 21)) / 11, dy = (y - 87) / 5; if (dx * dx + dy * dy <= 1) { const thr = (BAYR[y & 3][x & 3] + 0.5) / 16; if (bh > thr * (0.9 + 0.1 * (dx * dx + dy * dy)) && cl[y * PW + x] === 5) put(x, y, C.BL, -1); } }
    // eyes
    const lid = cli ? 1 : clamp(0.1 + h * 0.55, 0, 0.75), blink = !cli && (Math.floor(t * 1.7) % 7 === 6), gaz = h > 0.6 ? 0 : Math.round(Math.sin(t / 6 * 6.283 * 0.5) * 1);
    for (const s of [-1, 1]) { const ex = CX + s * 15, ey = 70;
      for (let x = ex - 12; x <= ex + 12; x++) { const u = (x - ex) / 10.5; if (Math.abs(u) > 1) continue; const q = Math.sqrt(1 - u * u), up = ey - 5.2 * q + lid * 4.2 * q, lo = ey + 3.6 * q; for (let y = Math.floor(up - 2); y <= Math.ceil(lo + 1); y++) {
        if (cli || blink) { const cy = ey + 1 + (cli ? 0.8 : 0) * (1 - u * u) * 2.2 * (s * 0 + 1) * (cli ? 1 : 0.2); if (Math.abs(y - (ey + 2 - 2.2 * q * (cli ? 1 : 0.3))) < 1.1) put(x, y, C.EYE, -1); continue; }
        if (y < up - 1.6 || y > lo) continue; if (y < up) { put(x, y, C.EYE, -1); continue; } const di = Math.hypot(x - (ex + gaz), y - (ey + 0.5 + lid * 0.8)); if (di <= 4.4) { put(x, y, C.IR + (di < 2 ? 0 : (y > ey + 0.5 ? 2 : 1)), -1); if (di < 2) put(x, y, C.EYE, -1); } else put(x, y, C.WH, -1); }
        if (!cli && !blink) { put(ex + gaz - 2, ey - 1 + lid * 1.4, C.WH, -1); put(ex + gaz - 1, ey - 2 + lid * 1.4, C.WH, -1); } }
      if (!cli && !blink) { put(ex + s * 11, ey - 3, C.EYE, -1); put(ex + s * 12, ey - 4, C.EYE, -1); }
      for (let u = -9; u <= 9; u++) { const by = 58 - h * 2 + Math.abs(u) * 0.12 * (1 + h) * -s * s + (u * s > 0 ? 1.2 : 0) * (1 - h) - (h > 0.5 ? (s * u < 0 ? 2 : 0) : 0); put(ex + u, Math.round(by), C.HR + 2, -1); put(ex + u, Math.round(by) + 1, C.HR + 2, -1); } }
    put(CX, 83, C.SK + 2, -1); put(CX + 1, 84, C.SK + 2, -1); put(CX - 1, 84, C.SK + 3, -1);
    // mouth by heat
    const my = 96; if (cli || h > 0.82) { const rx = cli ? 7.5 : 6, ry = cli ? 6 : 4; for (let y = my - 7; y <= my + 8; y++) for (let x = CX - 9; x <= CX + 9; x++) { const dx = (x - CX) / rx, dy = (y - my) / ry, d = dx * dx + dy * dy; if (d <= 1) put(x, y, y > my + ry * 0.25 && d < 0.8 ? C.TON : C.MIN, -1); else if (d <= 1.45) put(x, y, C.LP + (y < my ? 0 : 1), -1); } }
    else if (h > 0.4) { for (let x = CX - 7; x <= CX + 7; x++) for (let y = my - 3; y <= my + 3; y++) { const dx = (x - CX) / 6.5, dy = (y - my) / 2.6, d = dx * dx + dy * dy; if (d <= 1) put(x, y, C.MIN, -1); else if (d <= 1.7) put(x, y, C.LP + (y < my ? 0 : 1), -1); } }
    else { for (let x = CX - 6; x <= CX + 6; x++) { const yy = my + Math.round(0.05 * (x - CX) * (x - CX) * -1 + 1.6); put(x, yy, C.LP + 2, -1); put(x, yy + 1, C.LP + 1, -1); if (Math.abs(x - CX) < 3) put(x, yy - 1, C.LP, -1); } }
    // front hair (bangs with a parting, side locks), clip
    for (let y = 18; y < 114; y++) for (let x = 40; x <= 120; x++) { const ax = Math.abs(x - CX), dx = (x - CX) / 38, dy = (y - 62) / 46, dome = dx * dx + dy * dy <= 1, edge = ax < 26 ? 44 + ax * 0.62 + Math.sin(x * 0.9 + t * 0.2) * 1.4 : 60 - (ax - 26) * 0.3, side = ax >= 28 && ax <= 39 && y > 58 && y < 112 - (ax - 28) * 1.6 + Math.sin(y * 0.2) * 1.3;
      if ((dome && y <= edge) || (side && dome)) { const v = 0.66 + 0.1 * Math.sin((x - CX) * 0.5 + 0.4) - 0.12 * Math.max(0, (y - 20) / 60) + 0.3 * Math.exp(-((y - 38) * (y - 38)) / 22) * (ax < 30 ? 1 : 0.3); put(x, y, C.HR + dth(v, x, y, 4), 7); } }
    const cx0 = CX - 40, cy0 = 44; [[0, -3], [0, 3], [-3, 0], [3, 0], [0, 0], [-1, -1], [1, 1], [1, -1], [-1, 1]].forEach(([a, b]) => put(cx0 + a, cy0 + b, a || b ? C.GD : C.GDH, -1));
    // arms and hands: one on the collar, the other to the lips as heat rises
    const cap = (x0, y0, x1, y1, r, rank, tone) => { const x_a = Math.min(x0, x1) - r, x_b = Math.max(x0, x1) + r, y_a = Math.min(y0, y1) - r, y_b = Math.max(y0, y1) + r; for (let y = Math.floor(y_a); y <= y_b; y++) for (let x = Math.floor(x_a); x <= x_b; x++) { const vx = x1 - x0, vy = y1 - y0, tt = clamp(((x - x0) * vx + (y - y0) * vy) / (vx * vx + vy * vy), 0, 1), d = Math.hypot(x - (x0 + vx * tt), y - (y0 + vy * tt)); if (d <= r) put(x, y, C.SK + dth(0.75 - 0.35 * (d / r) + tone, x, y, 4), rank); } };
    cap(26, 205, 58 + (h * 4), 150 + bob, 8, 9, 0); [[58, 146], [63, 148], [66, 152]].forEach(([a, b]) => { const px = a + (h * 4) | 0; for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) if (i * i + j * j <= 9) put(px + i, b + j + bob, C.SK + dth(0.7 - (i + j) * 0.02, px + i, b + j, 4), 10); });
    if (h > 0.45 || cli) { cap(142, 205, 98, 118 + bob, 8, 9, 0.05); [[93, 106], [97, 103], [101, 106]].forEach(([a, b]) => { for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) if (i * i + j * j <= 9) put(a + i, b + j + bob, C.SK + dth(0.72 - (i + j) * 0.02, a + i, b + j, 4), 10); }); }
    // outlines between layers
    const out = g.slice(); for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) { const i = y * PW + x, k = cl[i]; if (k === 0) continue; const nb = [x > 0 ? cl[i - 1] : 0, x < PW - 1 ? cl[i + 1] : 0, y > 0 ? cl[i - PW] : 0, y < PH - 1 ? cl[i + PW] : 0]; if (nb.some(n => n < k && !(k === 7 && n === 1) && !(k === 5 && n === 4 && y > 106))) out[i] = (k === 1 || k === 7) ? C.HR + 3 : C.OUT; }
    // fx
    const FX = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && x < PW && y >= 0 && y < PH) out[y * PW + x] = c; };
    if (fx.includes('sweat') || h > 0.55) { const yy = 74 + (t * 3 % 14); FX(CX + 36, yy, C.SW); FX(CX + 36, yy + 1, C.SW); FX(CX + 35, yy + 2, C.SW); FX(CX + 37, yy + 2, C.SW); }
    if (fx.includes('heart') || cli) for (let i = 0; i < 3; i++) { const hx0 = 22 + i * 52 + Math.sin(t + i) * 3, hy0 = 36 - ((t * 5 + i * 9) % 30); [[0, 0], [1, 0], [3, 0], [4, 0], [-0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 2], [2, 2], [3, 2], [2, 3]].forEach(([a, b]) => FX(hx0 + a, hy0 + b + 30, C.HRT)); }
    if (fx.includes('spark') || cli) for (let i = 0; i < 7; i++) { const sx = (hsh(i, 5, (t | 0) + 3) * PW) | 0, sy = (hsh(i, 6, (t | 0) + 3) * 110) | 0; FX(sx, sy, C.GDH); FX(sx + 1, sy, C.GDH); FX(sx, sy + 1, C.GDH); FX(sx - 1, sy, C.GDH); FX(sx, sy - 1, C.GDH); }
    const pal = portraitPal(o).map(hx), c2 = cv.getContext('2d'), im = c2.createImageData(PW, PH); for (let i = 0; i < out.length; i++) { const q = pal[out[i]] || pal[0], p4 = i * 4; im.data[p4] = q[0]; im.data[p4 + 1] = q[1]; im.data[p4 + 2] = q[2]; im.data[p4 + 3] = 255; } c2.putImageData(im, 0, 0);
  }
