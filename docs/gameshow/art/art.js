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
  /* ---------- skeleton model (v2): segment lengths from one height H=60; joints by forward kinematics; arms and legs by two-bone IK so hands and feet really touch what they should ---------- */
  const LEN = { lum: 8, tho: 10, neck: 3, thigh: 15, shin: 14.5, up: 10, fore: 9 };
  const rad = d => d * Math.PI / 180;
  function ik(ax, ay, tx, ty, l1, l2, bend) { let dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy), reach = l1 + l2 - 0.05; if (d > reach) { tx = ax + dx / d * reach; ty = ay + dy / d * reach; dx = tx - ax; dy = ty - ay; d = reach; } if (d < 0.5) d = 0.5; const base = Math.atan2(dy, dx), c = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))), a = Math.acos(c) * bend; return { j: [ax + Math.cos(base + a) * l1, ay + Math.sin(base + a) * l1], e: [tx, ty] }; }
  function render(o, t) {
    o = Object.assign({ pos: 'face', rhythm: 'mid', outfit: 'half', heat: 50, hair: 'brown', climax: false, hud: false }, o || {});
    const g = new Uint8Array(W * H), px = (x, y, k) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y * W + x] = k; };
    const rect = (x, y, w, h, k) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, k); };
    const disc = (cx, cy, r, k) => { const R = Math.ceil(r); for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) if (i * i + j * j <= r * r + 0.35) px(cx + i, cy + j, k); };
    const cap = (x0, y0, x1, y1, r0, r1, k, sh, soft) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5)); if (sh !== undefined) for (let i = 0; i <= n; i++) { const u = i / n; disc(x0 + (x1 - x0) * u + (soft ? 0.8 : 0), y0 + (y1 - y0) * u + (soft ? 0.8 : 0), r0 + (r1 - r0) * u + (soft ? 0 : 0.95), sh); } for (let i = 0; i <= n; i++) { const u = i / n; disc(x0 + (x1 - x0) * u - 0.2, y0 + (y1 - y0) * u - 0.2, r0 + (r1 - r0) * u, k); } };
    const heat = o.heat, e = o.climax ? 2 : heat < 40 ? 0 : heat < 75 ? 1 : 2, RY = RHY[o.rhythm] || RHY.mid, phi = t / FR * 6.2832 * RY.cyc;
    let dx = 0, dy = 0; if (o.climax) { dy = ((t % 2) ? 1 : -1) * 0.6; } else if (o.rhythm === 'slow') { dx = Math.cos(phi) * 1.4; dy = Math.sin(phi) * 1.0; } else if (o.rhythm === 'mid') { dy = Math.sin(phi) * 2.6; dx = Math.sin(phi) * 0.4; } else { dy = Math.sin(phi) * 2.0; }
    const lag = Math.sin(phi - 0.9), bare = o.outfit === 'bare', half = o.outfit === 'half', dress = o.outfit === 'dress';
    PAL[8] = HAIRS[o.hair] || HAIRS.brown;
    // room
    rect(0, 0, W, 54, 2); for (let x = 0; x < W; x += 16) rect(x, 6, 1, 48, 3); rect(0, 54, W, 26, 1); rect(0, 70, W, 1, 0); rect(2, 14, 8, 50, 21); rect(2, 14, 8, 2, 18); rect(0, 62, 118, 6, 21); rect(2, 53, 108, 9, 14); rect(2, 60, 108, 2, 15); disc(112, 14, 4, 22); for (let y = 6; y < 28; y++) for (let x = 100; x < 124; x++) if ((x + y) % 3 === 0 && Math.hypot(x - 112, y - 14) < 12) px(x, y, 3);
    const SK = 4, SKS = 5, MK = 6, MKS = 7, TOP = 16, TOPS = 17;
    // ----- him (lying on his back, or sitting for 'lap')
    const himPose = () => {
      if (o.pos === 'lap') { rect(12, 30, 20, 3, 20); cap(31, 52, 28, 36, 5, 4.6, MK, MKS); disc(29, 29, 4.6, MK); rect(24, 24, 11, 4, 9); cap(31, 52, 47, 52, 4, 3.4, MK, MKS); cap(47, 52, 61, 53, 3.4, 2.6, MK, MKS); cap(61, 53, 65, 53, 2, 2, MK); return; }
      const bent = o.pos === 'brace';
      rect(18, 46, 22, 4, 20); disc(30, 48.5, 4.6, MK); rect(25, 43, 11, 4, 9); cap(35, 49, 50, 49.5, 5, 4.4, MK, MKS); disc(54, 49.5, 5, MK);
      if (bent) { cap(55, 49.5, 66, 40, 4, 3.2, MK, MKS); cap(66, 40, 72, 51, 3.2, 2.4, MK, MKS); rect(70, 51, 7, 2, MKS); cap(55, 50, 68, 41, 4, 3.2, MK); } else { cap(55, 50, 71, 50, 4, 3.2, MK, MKS); cap(71, 50, 85, 52, 3.2, 2.4, MK, MKS); cap(85, 52, 91, 52, 2, 1.6, MK); }
      if (!bare) { cap(36, 48, 50, 48.5, 4.2, 4.2, 19); }
    };
    // ----- her
    const f = (o.pos === 'back') ? 1 : -1;
    const P = (x, y, len, a, ff) => [x + ff * Math.sin(rad(a)) * len, y - Math.cos(rad(a)) * len];
    function herFigure(sp) {
      const hx = sp.hx + dx, hy = sp.hy + dy, ff = sp.f;
      const L1 = P(hx, hy, LEN.lum, sp.a1, ff), S = P(L1[0], L1[1], LEN.tho, sp.a2, ff), N = P(S[0], S[1], LEN.neck, sp.a3, ff), Hd = P(N[0], N[1], 5.2, sp.a3 + 5, ff);
      // far leg (behind everything)
      if (sp.legs) sp.legs(hx, hy, true); if (sp.arm) sp.arm(S, true);
      himPose(); if (o.pos !== 'lap') drawBlanket(sp);
      // pelvis, torso
      disc(hx, hy, 5.6, SK); cap(hx, hy, L1[0], L1[1], 4.6, 3.9, SK, SKS, true); cap(L1[0], L1[1], S[0], S[1], 3.9, 4.6, SK, SKS, true);
      const bx = (L1[0] + S[0]) / 2 + ff * 3.6, by = (L1[1] + S[1]) / 2 - 0.5 + lag * 0.5; disc(bx, by, 3.3, SK); px(bx + ff * 2.5, by + 2, SKS);
      if (dress) { cap(hx, hy, S[0], S[1], 4.8, 4.8, TOP, TOPS); disc(bx, by, 3.4, TOP); rect(Math.round(hx - 7), Math.round(hy + 1), 14, 4, TOP); rect(Math.round(hx - 7), Math.round(hy + 4), 14, 1, TOPS); }
      else if (half) { cap(S[0], S[1] + 1, S[0] - ff * 2, S[1] + 3, 4.6, 4.6, TOP, TOPS); rect(Math.round(hx - 7), Math.round(hy + 1), 14, 4, TOP); rect(Math.round(hx - 7), Math.round(hy + 4), 14, 1, TOPS); }
      if (sp.legs) sp.legs(hx, hy, false);
      if (sp.arm) sp.arm(S, false);
      // neck, head
      cap(S[0], S[1], N[0], N[1], 2, 2, SK); disc(Hd[0], Hd[1], 4.7, SK); const sw = Math.round(lag * 2);
      cap(Hd[0] - ff * 2, Hd[1] - 1, Hd[0] - ff * 6 + sw, Hd[1] + 11, 3.2, 2.6, 8); rect(Math.round(Hd[0] - 5), Math.round(Hd[1] - 6), 11, 3, 8); disc(Hd[0] - ff * 1, Hd[1] - 3, 4, 8);
      px(Hd[0] + ff * 5, Hd[1] + 1, SK); const ex = Hd[0] + ff * 2, ey = Hd[1] - 0.5;
      if (e === 0) { px(ex, ey, 11); px(ex + ff, ey - 1, 11); } else if (e === 1) { px(ex, ey, 11); px(ex - ff, ey, 11); px(ex + ff, ey - 1, 11); } else { px(ex - ff, ey, 11); px(ex, ey - 1, 11); px(ex + ff, ey, 11); }
      if (e >= 1) { px(ex - ff * 2, ey + 2, 12); px(ex - ff * 3, ey + 2, 12); } const mx = Hd[0] + ff * 3, my = Hd[1] + 3; if (e === 2) { rect(Math.round(mx - (ff > 0 ? 0 : 1)), Math.round(my), 2, 2, 11); px(mx, my + 1, 13); } else if (e === 1) { px(mx, my, 13); px(mx - ff, my, 13); } else px(mx, my, SKS);
      return { hx, hy, S, Hd };
    }
    function drawBlanket(sp) { const x0 = sp.blank ? sp.blank[0] : 60, x1 = sp.blank ? sp.blank[1] : 100; for (let x = x0; x < x1; x++) { const yy = 47 + Math.round(Math.sin((x + t) / 4) * 0.7) + ((x - x0) < 3 ? 2 : 0); for (let y = yy; y < 56; y++) px(x, y, 15); px(x, yy, 14); px(x, yy + 1, 14); } }
    const knee = (hx, hy, kx, ky, far) => ({ k: [kx + (far ? 1.5 : 0), ky - (far ? 1.5 : 0)] });
    function kneeling(back, shinDir) { return (hx, hy, far) => { const ox = far ? 2 : 0, oy = far ? -1.5 : 0, kxo = back ? 3 : -3, k = [hx + kxo + ox, 51 + oy], tw = 8.5; const hipx = hx, hipy = hy, shade = far; const c = far ? MKS : SK, cs = far ? 17 : SKS; cap(hipx + (far ? 1 : 0), hipy + 1, k[0], k[1], 4.4, 3.2, far ? SKS : SK, far ? 7 : SKS); const a = [k[0] + shinDir * 14, 52.5 + oy], toe = [a[0] + shinDir * 5.5, 51.5 + oy]; cap(k[0], k[1], a[0], a[1], 3.1, 2.1, far ? SKS : SK, far ? 7 : SKS); cap(a[0], a[1], toe[0], toe[1], 1.8, 1.4, far ? SKS : SK); if (dress || half) { /* skirt over the thigh top */ } }; }
    function arms(target, bend) { return (S, far) => { const ox = far ? -1.2 : 0, tgt = [target[0] + (far ? 2 : 0), target[1]], r = ik(S[0] + ox, S[1] + 1, tgt[0], tgt[1], LEN.up, LEN.fore, bend); cap(S[0] + ox, S[1] + 1, r.j[0], r.j[1], 2.6, 2.1, far ? SKS : SK, far ? 7 : SKS); cap(r.j[0], r.j[1], r.e[0], r.e[1], 2.1, 1.8, far ? SKS : SK, far ? 7 : SKS); disc(r.e[0], r.e[1], 1.7, far ? SKS : SK); }; }
    let spec;
    const pos = o.pos;
    if (pos === 'face') spec = { f: -1, hx: 57, hy: 41, a1: 12, a2: 24, a3: 22, legs: kneeling(false, 1), arm: arms([47, 44.5], 1), blank: [66, 100] };
    else if (pos === 'back') spec = { f: 1, hx: 56, hy: 41, a1: 24, a2: 38, a3: 34, legs: kneeling(true, -1), arm: arms([73, 44.5], -1), blank: [62, 100] };
    else if (pos === 'squat') spec = { f: -1, hx: 57, hy: 35, a1: 6, a2: 12, a3: 10, legs: (hx, hy, far) => { const ox = far ? 2.5 : 0, foot = [hx - 1 + ox, 52.8 - (far ? 1.2 : 0)], r = ik(hx, hy + 1, foot[0], foot[1], 11.5, 14, 1); cap(hx, hy + 1, r.j[0], r.j[1], 4.6, 3.3, far ? SKS : SK, far ? 7 : SKS); cap(r.j[0], r.j[1], r.e[0], r.e[1], 3.2, 2.2, far ? SKS : SK, far ? 7 : SKS); cap(r.e[0], r.e[1], r.e[0] - 6.5, r.e[1] + 0.3, 2, 1.5, far ? SKS : SK); }, arm: arms([48, 44.5], 1), blank: [66, 100] };
    else if (pos === 'lean') spec = { f: -1, hx: 60, hy: 42, a1: 52, a2: 76, a3: 70, legs: kneeling(false, 1), arm: (S, far) => { const tgt = [far ? 31 : 36, 52.5], r = ik(S[0], S[1] + 1, tgt[0], tgt[1], LEN.up, LEN.fore, -1); cap(S[0], S[1] + 1, r.j[0], r.j[1], 2.6, 2.1, far ? SKS : SK, far ? 7 : SKS); cap(r.j[0], r.j[1], r.e[0], r.e[1], 2.1, 1.8, far ? SKS : SK); }, blank: [66, 100] };
    else if (pos === 'brace') spec = { f: -1, hx: 52, hy: 38, a1: -12, a2: -30, a3: -22, legs: kneeling(false, 1), arm: arms([64, 41], 1), blank: [74, 100] };
    else if (pos === 'lap') spec = { f: -1, hx: 43, hy: 47, a1: 6, a2: 12, a3: 12, legs: (hx, hy, far) => { const k = [hx + 2 + (far ? 2 : 0), 51 - (far ? 1.5 : 0)]; cap(hx, hy + 1, k[0], k[1], 4.4, 3.2, far ? SKS : SK, far ? 7 : SKS); const a = [k[0] + 13, 52.5 - (far ? 1.5 : 0)]; cap(k[0], k[1], a[0], a[1], 3.1, 2.1, far ? SKS : SK, far ? 7 : SKS); cap(a[0], a[1], a[0] + 5, a[1] - 1, 1.8, 1.4, far ? SKS : SK); }, arm: (S, far) => { const tgt = [far ? 30 : 29, 33.5], r = ik(S[0], S[1] + 1, tgt[0], tgt[1], LEN.up, LEN.fore, -1); cap(S[0], S[1] + 1, r.j[0], r.j[1], 2.6, 2.1, far ? SKS : SK, far ? 7 : SKS); cap(r.j[0], r.j[1], r.e[0], r.e[1], 2.1, 1.8, far ? SKS : SK); } };
    else { // turn: face -> lift one leg over -> side-on -> back (the pivot is slow, hands on his thighs)
      const st = t < 2 ? 0 : t < 3 ? 1 : t < 4 ? 2 : 3;
      if (st === 0) spec = { f: -1, hx: 57, hy: 41, a1: 12, a2: 24, a3: 22, legs: kneeling(false, 1), arm: arms([60, 44.5], 1), blank: [66, 100] };
      else if (st === 1) spec = { f: -1, hx: 57, hy: 38, a1: 10, a2: 18, a3: 18, legs: (hx, hy, far) => { if (far) { kneeling(false, 1)(hx, hy, true); return; } const k = [hx - 9, hy - 8], r = ik(hx, hy, k[0], k[1], LEN.thigh * 0.8, 1, 1); cap(hx, hy + 1, k[0], k[1], 4.4, 3.2, SK, SKS); cap(k[0], k[1], k[0] + 3, k[1] + 12, 3.1, 2.1, SK, SKS); cap(k[0] + 3, k[1] + 12, k[0] - 2, k[1] + 14, 1.9, 1.5, SK); }, arm: arms([62, 44.5], 1), blank: [66, 100] };
      else if (st === 2) spec = { f: 1, hx: 57, hy: 39, a1: 14, a2: 26, a3: 22, legs: kneeling(true, -1), arm: arms([72, 44.5], -1), blank: [66, 100] };
      else spec = { f: 1, hx: 56, hy: 41, a1: 24, a2: 38, a3: 34, legs: kneeling(true, -1), arm: arms([73, 44.5], -1), blank: [62, 100] };
    }
    herFigure(spec);
    if (o.climax) for (let i = 0; i < 5; i++) { const x = 30 + i * 17, y = 24 - ((t * 3 + i * 4) % 16); [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(p => px(x + p[0], y + p[1] + 6, 13)); }
    if (o.climax) for (let i = 0; i < 8; i++) px((i * 43 + t * 11) % W, (i * 19 + t * 5) % 30, 18);
    if (e >= 1) { const sx = (spec.hx || 56) - spec.f * 3; px(sx, 20 + (t * 2) % 8, 23); px(sx + 3, 16 + (t * 3) % 8, 23); }
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
