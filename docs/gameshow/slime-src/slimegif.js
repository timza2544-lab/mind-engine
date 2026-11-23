/* slimegif.js (v252, owner: "I want to make a GIF of the slime in many poses")
   Pixel-art slime sprites drawn from code (32x32, 16 colours, transparent background), animated right on the page (inline SVG, no scripts)
   and saved as a real .gif (own LZW encoder, scaled up 8x). The mascot poses are plain cute art; the explicit adult poses live in slimeliquid.js (adult women only, never the little slimes). */
(function () {
  'use strict';
  const A = window.ANIMA = window.ANIMA || {}, G = A.slimeGif = {};
  const W = 32, SCALE = 8;
  /* colour slots: 0 transparent, 1 outline, 2 body, 3 body light, 4 highlight, 5 eye white, 6 cheek, 7 spark, 8 drop, 9 hair, 10 heart, 11 text, 12 body shade, 13 mouth, 14 dress, 15 dress shade */
  const THEMES = [
    { id: 'blue', t: 'ฟ้า', c: ['#00000000', '#1d3557', '#5fb3ff', '#9ad0ff', '#e8f6ff', '#ffffff', '#ff9ab3', '#ffe066', '#e9fbff', '#3a2a55', '#ff4d6d', '#ffffff', '#3d8ce0', '#5a1f3a', '#7ad0c0', '#4aa898'] },
    { id: 'pink', t: 'ชมพู', c: ['#00000000', '#5a1f3a', '#ff8fb8', '#ffb8d3', '#fff0f6', '#ffffff', '#ff6f91', '#ffe066', '#fff5fa', '#3a2a55', '#e0245e', '#ffffff', '#e0629a', '#5a1f3a', '#8fb8ff', '#6a8fe0'] },
    { id: 'green', t: 'เขียว', c: ['#00000000', '#1f4a2e', '#6fdc8c', '#a6efb8', '#eafff0', '#ffffff', '#ff9ab3', '#ffe066', '#f3fff6', '#3a2a55', '#ff4d6d', '#ffffff', '#3fb860', '#5a1f3a', '#ffc4d8', '#e08fb0'] },
    { id: 'purple', t: 'ม่วง', c: ['#00000000', '#32205a', '#b08cff', '#d2baff', '#f4edff', '#ffffff', '#ff9ab3', '#ffe066', '#f8f4ff', '#2b2b4a', '#ff4d6d', '#ffffff', '#8a62e0', '#5a1f3a', '#ffd27a', '#e0a83a'] },
    { id: 'orange', t: 'ส้ม', c: ['#00000000', '#5a2a12', '#ffa95c', '#ffc78f', '#fff3e6', '#ffffff', '#ff7a9a', '#fff27a', '#fffaf2', '#3a2a55', '#e0245e', '#ffffff', '#e08a3a', '#5a1f3a', '#9ad0ff', '#6aa0e0'] }
  ];
  const EXTRA = ['#ffcfa8', '#e0a070', '#ffe6d0', '#ffffff', '#fff6b0']; THEMES.forEach(t => { t.c = t.c.concat(EXTRA); while (t.c.length < 32) t.c.push('#000000'); });
  G.THEMES = THEMES;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const mk = () => Array.from({ length: W }, () => Array(W).fill(0));
  const put = (g, x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && y < W && x < g[0].length) g[y][x] = c; };

  /* a jelly dome: centre cx, flat bottom at `base`, half-width rx, height ry */
  function blob(g, cx, base, rx, ry, o) {
    o = o || {};
    const inside = (x, y) => { if (y > base || y < base - ry) return false; const dy = (base - y) / ry, dx = (x - cx) / rx; return dx * dx + dy * dy <= 1; };
    for (let y = 0; y < W; y++) for (let x = 0; x < g[0].length; x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      if (edge) { put(g, x, y, 1); continue; }
      const u = (base - y) / ry, l = (x - cx) / rx;
      let c = 2;
      if (u < .25 || l > .55) c = 12;
      if (u > .62 && l < -.1) c = 3;
      if (u > .78 && l < -.35 && u < .92) c = 4;
      put(g, x, y, c);
    }
  }
  function face(g, cx, ey, kind) {
    const L = cx - 3, R = cx + 3;
    if (kind === 'sleep') { put(g, L, ey, 1); put(g, L + 1, ey, 1); put(g, R - 1, ey, 1); put(g, R, ey, 1); put(g, cx, ey + 2, 13); return; }
    if (kind === 'happy') { put(g, L, ey + 1, 1); put(g, L + 1, ey, 1); put(g, L + 2, ey + 1, 1); put(g, R - 2, ey + 1, 1); put(g, R - 1, ey, 1); put(g, R, ey + 1, 1); }
    else { [[L, ey], [L + 1, ey], [L, ey + 1], [L + 1, ey + 1]].forEach(p => put(g, p[0], p[1], 1)); [[R - 1, ey], [R, ey], [R - 1, ey + 1], [R, ey + 1]].forEach(p => put(g, p[0], p[1], 1)); put(g, L, ey, 5); put(g, R - 1, ey, 5); }
    put(g, L - 1, ey + 3, 6); put(g, L, ey + 3, 6); put(g, R, ey + 3, 6); put(g, R + 1, ey + 3, 6);
    if (kind === 'open') { put(g, cx - 1, ey + 3, 13); put(g, cx, ey + 3, 13); put(g, cx - 1, ey + 4, 13); put(g, cx, ey + 4, 13); put(g, cx - 1, ey + 5, 13); put(g, cx, ey + 5, 13); }
    else if (kind === 'o') { put(g, cx - 1, ey + 4, 13); put(g, cx, ey + 4, 13); }
    else { put(g, cx - 2, ey + 3, 13); put(g, cx - 1, ey + 4, 13); put(g, cx, ey + 4, 13); put(g, cx + 1, ey + 3, 13); }
  }
  const spark = (g, x, y) => { put(g, x, y, 7); put(g, x - 1, y, 7); put(g, x + 1, y, 7); put(g, x, y - 1, 7); put(g, x, y + 1, 7); };
  const heart = (g, x, y) => { [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(p => put(g, x + p[0] - 1, y + p[1], 10)); put(g, x, y, 10); put(g, x + 1, y, 0); };
  const zed = (g, x, y, s) => { for (let i = 0; i < s; i++) { put(g, x + i, y, 11); put(g, x + i, y + s - 1, 11); put(g, x + s - 1 - i, y + i, 11); } };
  const drop = (g, x, y) => { put(g, x, y, 8); put(g, x, y + 1, 8); put(g, x - 1, y + 1, 8); put(g, x + 1, y + 1, 8); put(g, x, y + 2, 8); };

  /* the poses: each returns the grid for frame f of n */
  const POSES = [
    { id: 'idle', t: 'นั่งหายใจ', n: 4, d: 18, fn(f) { const g = mk(), b = [0, 1, 2, 1][f]; blob(g, 16, 27, 11 + (b === 2 ? 1 : 0), 16 - b, {}); face(g, 16, 17 - b, 'smile'); return g; } },
    { id: 'bounce', t: 'เด้งดึ๋ง', n: 8, d: 9, fn(f) { const g = mk(), P = [[27, 14, 11, 'smile'], [27, 10, 13, 'smile'], [24, 17, 9, 'o'], [19, 15, 9, 'o'], [16, 15, 9, 'o'], [21, 16, 9, 'o'], [27, 10, 13, 'smile'], [27, 14, 11, 'smile']][f]; blob(g, 16, P[0], P[2] + 1, P[1], {}); face(g, 16, P[0] - P[1] + 5, P[3]); if (f === 4) { spark(g, 6, 5); spark(g, 26, 7); } return g; } },
    { id: 'eat', t: 'กินน้ำ (ยุ่งยิ่งตะกละ)', n: 8, d: 12, fn(f) { const g = mk(), big = f >= 5 && f <= 6 ? 1 : 0; blob(g, 16, 27, 11 + big, 15 + big, {}); face(g, 16, 17 - big, f >= 2 && f <= 4 ? 'open' : f >= 5 ? 'happy' : 'smile'); if (f <= 3) drop(g, 16, 2 + f * 3 + (f === 3 ? 1 : 0)); if (f >= 5) { spark(g, 6, 8); spark(g, 26, 12); } return g; } },
    { id: 'grow', t: 'โตขึ้น', n: 8, d: 12, fn(f) { const g = mk(), k = [0, 1, 2, 3, 4, 4, 3, 2][f]; blob(g, 16, 28, 7 + k * 1.2, 9 + k * 2.2, {}); face(g, 16, 28 - (9 + k * 2.2) + 5, k >= 3 ? 'happy' : 'smile'); if (f >= 3 && f <= 5) { spark(g, 5, 6 + (f % 2) * 2); spark(g, 27, 9); spark(g, 16, 2); } return g; } },
    { id: 'melt', t: 'ละลายเป็นกอง', n: 8, d: 12, fn(f) { const g = mk(), ry = [16, 13, 9, 5, 3, 3, 9, 14][f], rx = [11, 12, 14, 15, 15, 15, 13, 11][f]; blob(g, 16, 27, rx, ry, {}); if (ry >= 9) face(g, 16, 27 - ry + 5, ry > 12 ? 'smile' : 'o'); else { put(g, 12, 25, 1); put(g, 13, 25, 1); put(g, 19, 25, 1); put(g, 20, 25, 1); } if (f >= 3 && f <= 5) { put(g, 8, 24, 3); put(g, 24, 25, 3); } return g; } },
    { id: 'wave', t: 'โบกมือ', n: 6, d: 12, fn(f) { const g = mk(); blob(g, 15, 27, 11, 15, {}); const up = [0, 1, 2, 1, 0, 1][f]; [[27, 17 - up * 2], [28, 16 - up * 2], [28, 15 - up * 2], [29, 14 - up * 2 + (f % 2)]].forEach(p => { put(g, p[0], p[1], 2); put(g, p[0] + 1, p[1], 1); put(g, p[0], p[1] - 1, 1); put(g, p[0], p[1] + 1, 1); }); face(g, 15, 17, 'happy'); return g; } },
    { id: 'sleep', t: 'หลับ', n: 6, d: 20, fn(f) { const g = mk(), b = [0, 1, 2, 2, 1, 0][f]; blob(g, 16, 27, 12, 14 - (b > 1 ? 0 : 0) + (b === 2 ? 1 : 0), {}); face(g, 16, 18, 'sleep'); if (f >= 1) zed(g, 24, 10 - (f > 3 ? 1 : 0), 3); if (f >= 3) zed(g, 27, 5, 4); return g; } },
    { id: 'bud', t: 'แตกตัวเป็นสไลม์ย่อย', n: 10, d: 11, fn(f) { const g = mk(), pinch = clamp(f - 1, 0, 4); blob(g, f < 5 ? 14 : 12, 27, 10, 15, {}); face(g, f < 5 ? 14 : 12, 17, f >= 4 ? 'o' : 'smile'); if (f >= 1) { const bx = 23 + (f >= 5 ? Math.min(f - 5, 4) : 0), by = f < 7 ? 24 - pinch : 27; blob(g, bx, 28 - (f >= 6 ? 0 : 0), 4, 5, {}); if (f >= 6) { put(g, bx - 1, 25, 1); put(g, bx + 1, 25, 1); } } if (f >= 7) { spark(g, 27, 18); spark(g, 4, 8); } return g; } },
    { id: 'human', t: 'ร่างคน (เงาเยลลี่)', n: 6, d: 14, fn(f) { const g = mk(), sw = [0, 1, 1, 0, -1, -1][f], c = 15 + sw; for (let y = 3; y < 10; y++) for (let x = c - 5; x <= c + 4; x++) { const dx = (x - c + .5) / 5, dy = (y - 6.5) / 3.6; if (dx * dx + dy * dy <= 1) put(g, x, y, 9); } for (let y = 6; y < 13; y++) for (let x = c - 3; x <= c + 2; x++) { const dx = (x - c + .5) / 3.4, dy = (y - 9.5) / 3.6; if (dx * dx + dy * dy <= 1) put(g, x, y, y > 11 ? 3 : 3); }
      put(g, c - 2, 10, 1); put(g, c + 1, 10, 1); put(g, c - 2, 12, 6); put(g, c + 1, 12, 6); put(g, c - 1, 13, 13); put(g, c, 13, 13);
      for (let y = 14; y < 26; y++) { const w = 3 + Math.floor((y - 14) * .55); for (let x = c - w; x <= c + w - 1; x++) put(g, x, y, y > 22 ? 15 : 14); put(g, c - w - 1, y, 1); put(g, c + w, y, 1); }
      for (let x = c - 9; x <= c + 8; x++) put(g, x, 26, 1);
      for (let y = 15; y < 22; y++) { put(g, c - 5 - (y - 15) * .2 - (f % 2 ? 1 : 0), y, 3); put(g, c + 4 + (y - 15) * .2 + (f % 2 ? 0 : 1), y, 3); }
      for (let y = 27; y < 30; y++) { put(g, c - 3, y, 2); put(g, c - 2, y, 1); put(g, c + 1, y, 2); put(g, c + 2, y, 1); }
      for (let i = 0; i < 3; i++) { put(g, c - 6 + i * 6, 17 + (f + i) % 3, 4); }
      if (f === 2 || f === 5) spark(g, c + 9, 5); return g; } },
    { id: 'love', t: 'หัวใจลอย', n: 8, d: 12, fn(f) { const g = mk(), b = [0, 1, 2, 1][f % 4]; blob(g, 16, 27, 11 + (b === 2 ? 1 : 0), 15 - b, {}); face(g, 16, 17 - b, 'happy'); heart(g, 8 + (f % 3) * 8, 10 - Math.floor(f / 2)); if (f >= 2) heart(g, 22 - (f % 2) * 3, 12 - Math.floor((f - 2) / 2)); return g; } },
    { id: 'stretch', t: 'ยืดตัวสูง', n: 8, d: 12, fn(f) { const g = mk(), k = [0, 1, 2, 3, 3, 2, 1, 0][f]; blob(g, 16, 28, 11 - k * 1.2, 14 + k * 2.4, {}); face(g, 16, 28 - (14 + k * 2.4) + 5, k > 1 ? 'o' : 'smile'); return g; } },
    { id: 'scared', t: 'ตัวสั่น (หิว)', n: 6, d: 8, fn(f) { const g = mk(), o = [0, 1, 0, -1, 0, 1][f]; blob(g, 16 + o, 27, 10, 13, {}); face(g, 16 + o, 17, 'o'); put(g, 25 + o, 10, 8); put(g, 25 + o, 11, 8); return g; } }
  ];

  G.POSES = POSES.map(p => ({ id: p.id, t: p.t, n: p.n, d: p.d, x: !!p.x }));

  G.frames = function (poseId) { if (/^l-/.test(poseId) && G.liquidFrames) { const L = G.liquidFrames(poseId); if (L) return L; } const p = POSES.find(x => x.id === poseId) || POSES[0], out = []; for (let f = 0; f < p.n; f++) out.push(p.fn(f)); return { id: p.id, t: p.t, d: p.d, frames: out }; };
  const themeOf = id => THEMES.find(t => t.id === id) || THEMES[0];

  /* ---------- on-page animation: inline SVG, frames shown one after another (SMIL) ---------- */
  G.svg = function (poseId, themeId, opt) {
    opt = opt || {}; const P = G.frames(poseId), GW = P.frames[0][0].length, GH = P.frames[0].length, th = themeOf(themeId), pc = (P.pal === 'L' || P.pal === 'P' || P.pal === 'H') ? G.liquidColors(themeId, P.pal) : themeOf(themeId).c, px = opt.px || 4, dur = (P.frames.length * P.d / 100).toFixed(2);
    const rects = g => { let s = ''; const gw = g[0].length; for (let y = 0; y < g.length; y++) { let x = 0; while (x < gw) { const c = g[y][x]; if (!c) { x++; continue; } let x2 = x; while (x2 + 1 < gw && g[y][x2 + 1] === c) x2++; s += `<rect x="${x}" y="${y}" width="${x2 - x + 1}" height="1" fill="${pc[c]}"/>`; x = x2 + 1; } } return s; };
    const n = P.frames.length, kt = i => (i / n).toFixed(4);
    const groups = P.frames.map((g, i) => `<g visibility="hidden"><animate attributeName="visibility" dur="${dur}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${Array.from({ length: n + 1 }, (_, j) => kt(j)).join(';')}" values="${Array.from({ length: n + 1 }, (_, j) => (j === i ? 'visible' : 'hidden')).join(';')}"/>${rects(g)}</g>`).join('');
    return `<svg class="slime-px" viewBox="0 0 ${GW} ${GH}" width="${GW * px}" height="${GH * px}" shape-rendering="crispEdges" role="img" aria-label="${P.t}" style="image-rendering:pixelated">${groups}</svg>`;
  };

  /* ---------- the .gif file ---------- */
  function hexRGB(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function lzw(idx, minCode) {
    const clear = 1 << minCode, eoi = clear + 1, out = []; let size = minCode + 1, next = eoi + 1, dict = new Map(), cur = 0, bits = 0;
    const emit = c => { cur |= c << bits; bits += size; while (bits >= 8) { out.push(cur & 255); cur >>>= 8; bits -= 8; } };
    emit(clear); let p = idx[0];
    for (let i = 1; i < idx.length; i++) {
      const k = idx[i], key = p * 256 + k, v = dict.get(key);
      if (v !== undefined) { p = v; continue; }
      emit(p);
      if (next < 4096) { dict.set(key, next++); if (next - 1 === (1 << size) + 0 && size < 12) { /* grown below */ } if (next > (1 << size) && size < 12) size++; }
      else { emit(clear); dict.clear(); size = minCode + 1; next = eoi + 1; }
      p = k;
    }
    emit(p); emit(eoi); if (bits > 0) out.push(cur & 255); return out;
  }
  /* seq: array of pose frame sets [{frames, d}] -> Uint8Array of a looping GIF */
  G.encode = function (seq, themeId, scale) {
    if (!seq || !seq.length) throw new Error('no poses to encode');
    const th = themeOf(themeId), sc = P => P.scale || scale || SCALE, MW = Math.max.apply(null, seq.map(P => P.frames[0][0].length * sc(P))), MH = Math.max.apply(null, seq.map(P => P.frames[0].length * sc(P)));
    let buf = new Uint8Array(1 << 16), len = 0; const ensure = n => { if (len + n > buf.length) { const nb = new Uint8Array(Math.max(buf.length * 2, len + n)); nb.set(buf.subarray(0, len)); buf = nb; } };
    const b1 = v => { ensure(1); buf[len++] = v & 255; }, w16 = v => { b1(v); b1(v >> 8); }, push = (...a) => a.forEach(b1), table = cols => { for (let i = 0; i < 32; i++) { const h = cols[i], rgb = i === 0 || !h ? [255, 0, 255] : hexRGB(h); push(rgb[0], rgb[1], rgb[2]); } };
    'GIF89a'.split('').forEach(c => b1(c.charCodeAt(0)));
    w16(MW); w16(MH); push(0xF4, 0, 0); table(th.c);
    push(0x21, 0xFF, 0x0B); 'NETSCAPE2.0'.split('').forEach(c => b1(c.charCodeAt(0))); push(3, 1, 0, 0, 0);
    seq.forEach(P => { const k = sc(P), cols = (P.pal === 'L' || P.pal === 'P' || P.pal === 'H') ? G.liquidColors(themeId, P.pal) : th.c; P.frames.forEach(g => {
      const gw = g[0].length * k, gh = g.length * k, ox = ((MW - gw) / 2) | 0, oy = ((MH - gh) / 2) | 0;
      push(0x21, 0xF9, 4, 0x09, P.d & 255, (P.d >> 8) & 255, 0, 0); /* disposal 2, transparent index 0 */
      push(0x2C); w16(ox); w16(oy); w16(gw); w16(gh); push(0x84); table(cols); /* local colour table, 32 entries */
      const idx = new Uint8Array(gw * gh); for (let y = 0; y < gh; y++) { const row = g[(y / k) | 0]; for (let x = 0; x < gw; x++) idx[y * gw + x] = row[(x / k) | 0]; }
      push(5); const data = lzw(idx, 5); for (let i = 0; i < data.length; i += 255) { const n = Math.min(255, data.length - i); b1(n); ensure(n); for (let j = 0; j < n; j++) buf[len++] = data[i + j]; } push(0);
    }); });
    push(0x3B); return buf.slice(0, len);
  };
  /* a small animated preview for the page: a real (small) GIF as a data URI, cached; far lighter than hundreds of SVG rects per frame */
  const PREV = new Map();
  G.preview = function (poseId, themeId) {
    const key = poseId + '|' + (themeId || ''), hit = PREV.get(key); if (hit) return hit;
    const P = G.frames(poseId), big = P.frames[0].length >= 64, bytes = G.encode([Object.assign({}, P, { scale: big ? 2 : 4 })], themeId); let bin = ''; for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    const uri = 'data:image/gif;base64,' + btoa(bin); if (PREV.size > 150) PREV.clear(); PREV.set(key, uri); return uri;
  };
  G.gifFor = function (poseIds, themeId) { return G.encode((Array.isArray(poseIds) ? poseIds : [poseIds]).map(G.frames), themeId); };
  G.THEME_DEFAULT = 'blue';
})();
