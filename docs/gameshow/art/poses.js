/* poses.js — generic two-person pose engine on top of art.js: a catalogue of ~100 poses defined as skeleton specs.
   Each person: pelvis (x,y), facing f (±1), torso angles a=[lumbar,thorax,head] measured from vertical toward f, legs and arms as IK targets.
   Adults only; silhouettes with shading, no anatomical detail. */
(function (root) {
  'use strict';
  const A = root.ART || require('./art.js'), W = A.W, H = A.H, FR = A.FR, PAL = A.PAL, LEN = { lum: 8, tho: 10, neck: 3, thigh: 15, shin: 14.5, up: 10, fore: 9 };
  const rad = d => d * Math.PI / 180, SKH = 4, SKHS = 5, SKM = 6, SKMS = 7;
  function ik(ax, ay, tx, ty, l1, l2, bend) { let dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy), reach = l1 + l2 - 0.05; if (d > reach) { tx = ax + dx / d * reach; ty = ay + dy / d * reach; dx = tx - ax; dy = ty - ay; d = reach; } if (d < 0.5) d = 0.5; const base = Math.atan2(dy, dx), c = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))), a = Math.acos(c) * bend; return { j: [ax + Math.cos(base + a) * l1, ay + Math.sin(base + a) * l1], e: [tx, ty] }; }
  const P = (x, y, len, a, ff) => [x + ff * Math.sin(rad(a)) * len, y - Math.cos(rad(a)) * len];
  /* ---------- spec helpers ---------- */
  const lie = (x, y, f, a) => ({ x, y, f, a: a || [88, 90, 92] });
  const legK = (x, f, y) => [{ k: [x + f * 3, (y || 51)], a: [x - f * 11, (y || 51) + 1.5] }, { k: [x + f * 3 + 2, (y || 51) - 1.5], a: [x - f * 11 + 2, (y || 51)] }]; // kneeling: knee + shin lying behind
  const legP = (x, y, f, dx, fy, bend) => [{ ft: [x + f * dx, fy], b: bend === undefined ? -f : bend }, { ft: [x + f * dx + 2.5, fy - 1.2], b: bend === undefined ? -f : bend }]; // planted feet (IK)
  const legX = (x, y, tx, ty, b, tx2, ty2, b2) => [{ ft: [tx, ty], b }, { ft: [tx2 === undefined ? tx + 2 : tx2, ty2 === undefined ? ty - 1 : ty2], b: b2 === undefined ? b : b2 }];
  const arm = (hx, hy, b, hx2, hy2) => [{ h: [hx, hy], b }, { h: [hx2 === undefined ? hx + 2 : hx2, hy2 === undefined ? hy : hy2], b }];
  /* ---------- drawing ---------- */
  function ctxFor(g) { const px = (x, y, k) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y * W + x] = k; }; const rect = (x, y, w, h, k) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, k); }; const disc = (cx, cy, r, k) => { const R = Math.ceil(r); for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) if (i * i + j * j <= r * r + 0.35) px(cx + i, cy + j, k); }; const cap = (x0, y0, x1, y1, r0, r1, k, sh, soft) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5)); if (sh !== undefined) for (let i = 0; i <= n; i++) { const u = i / n; disc(x0 + (x1 - x0) * u + (soft ? 0.8 : 0), y0 + (y1 - y0) * u + (soft ? 0.8 : 0), r0 + (r1 - r0) * u + (soft ? 0 : 0.95), sh); } for (let i = 0; i <= n; i++) { const u = i / n; disc(x0 + (x1 - x0) * u - 0.2, y0 + (y1 - y0) * u - 0.2, r0 + (r1 - r0) * u, k); } }; return { px, rect, disc, cap }; }
  function scene(c, kind, t) {
    const { px, rect, disc } = c; rect(0, 0, W, 54, 2); for (let x = 0; x < W; x += 16) rect(x, 6, 1, 48, 3); rect(0, 54, W, 26, 1); rect(0, 70, W, 1, 0);
    if (kind === 'bed') { rect(2, 14, 8, 50, 21); rect(2, 14, 8, 2, 18); rect(0, 62, 118, 6, 21); rect(2, 53, 108, 9, 14); rect(2, 60, 108, 2, 15); }
    else if (kind === 'edge') { rect(0, 50, 66, 4, 14); rect(0, 54, 66, 16, 15); rect(0, 54, 66, 2, 14); rect(0, 70, W, 10, 1); }
    else if (kind === 'chair') { rect(0, 70, W, 10, 1); rect(30, 44, 26, 3, 21); rect(30, 47, 3, 23, 21); rect(53, 47, 3, 23, 21); rect(30, 20, 3, 26, 21); }
    else { rect(0, 70, W, 10, 1); if (kind === 'wall') rect(96, 0, 32, 70, 3); if (kind === 'table') { rect(70, 42, 40, 3, 21); rect(72, 45, 3, 25, 21); rect(105, 45, 3, 25, 21); } }
    disc(112, 14, 4, 22); for (let y = 6; y < 28; y++) for (let x = 100; x < 124; x++) if ((x + y) % 3 === 0 && Math.hypot(x - 112, y - 14) < 12 && kind !== 'wall') px(x, y, 3);
  }
  function person(c, sp, who, st) { // st: {e, lag, outfit}
    const { px, rect, disc, cap } = c, her = who === 'her', SK = her ? SKH : SKM, SKS = her ? SKHS : SKMS, ff = sp.f, hx = sp.x, hy = sp.y, a = sp.a || [10, 20, 20];
    const L1 = P(hx, hy, LEN.lum, a[0], ff), S = P(L1[0], L1[1], LEN.tho, a[1], ff), N = P(S[0], S[1], LEN.neck, a[2], ff), Hd = P(N[0], N[1], 5.2, a[2] + 5, ff), hairK = her ? 8 : 9, shade = (far) => far ? (her ? SKS : 7) : SKS;
    const leg = (L, far) => { if (!L) return; const kc = far ? SKS : SK, ks = far ? 7 : SKS; if (L.k) { cap(hx + (far ? 1 : 0), hy + 1, L.k[0], L.k[1], 4.2, 3.1, kc, ks); cap(L.k[0], L.k[1], L.a[0], L.a[1], 3.1, 2.1, kc, ks); cap(L.a[0], L.a[1], L.a[0] - Math.sign(L.a[0] - L.k[0]) * -5, L.a[1] - 0.5, 1.9, 1.4, kc); return; } const r = ik(hx, hy + 1, L.ft[0], L.ft[1], L.l1 || LEN.thigh, L.l2 || LEN.shin, L.b); cap(hx, hy + 1, r.j[0], r.j[1], 4.2, 3.1, kc, ks); cap(r.j[0], r.j[1], r.e[0], r.e[1], 3.1, 2.1, kc, ks); disc(r.j[0], r.j[1], 2.9, kc); const tx = r.e[0] + (r.e[0] >= r.j[0] ? 1 : -1) * 5; cap(r.e[0], r.e[1], tx, r.e[1] + (L.up ? -2 : 0.3), 1.9, 1.4, kc); };
    const armf = (R, far) => { if (!R) return; const kc = far ? SKS : SK, ks = far ? 7 : SKS, o = far ? -1.2 : 0, r = ik(S[0] + o, S[1] + 1, R.h[0], R.h[1], LEN.up, LEN.fore, R.b); cap(S[0] + o, S[1] + 1, r.j[0], r.j[1], 2.6, 2.1, kc, ks); cap(r.j[0], r.j[1], r.e[0], r.e[1], 2.1, 1.8, kc, ks); disc(r.e[0], r.e[1], 1.7, kc); };
    const L = sp.legs || [], Ar = sp.arms || [];
    leg(L[1], true); armf(Ar[1], true);
    disc(hx, hy, her ? 5.6 : 5.5, SK); cap(hx, hy, L1[0], L1[1], her ? 4.6 : 5, her ? 3.9 : 4.4, SK, SKS, true); cap(L1[0], L1[1], S[0], S[1], her ? 3.9 : 4.4, her ? 4.6 : 5.4, SK, SKS, true);
    if (her) { const bx = (L1[0] + S[0]) / 2 + ff * 3.6 * (sp.prone ? -1 : 1), by = (L1[1] + S[1]) / 2 - 0.5; disc(bx, by, 3.3, SK); px(bx + ff * 2.5, by + 2, SKS); if (st.outfit === 'dress') { cap(hx, hy, S[0], S[1], 4.8, 4.8, 16, 17); disc(bx, by, 3.4, 16); } else if (st.outfit === 'half') { cap(S[0], S[1] + 1, S[0] - ff * 2, S[1] + 3, 4.6, 4.6, 16, 17); } }
    leg(L[0], false); armf(Ar[0], false);
    cap(S[0], S[1], N[0], N[1], 2, 2, SK); disc(Hd[0], Hd[1], 4.7, SK);
    if (her) { cap(Hd[0] - ff * 2, Hd[1] - 1, Hd[0] - ff * 6 + Math.round(st.lag * 2), Hd[1] + 11, 3.2, 2.6, hairK); rect(Math.round(Hd[0] - 5), Math.round(Hd[1] - 6), 11, 3, hairK); disc(Hd[0] - ff, Hd[1] - 3, 4, hairK); } else { rect(Math.round(Hd[0] - 5), Math.round(Hd[1] - 6), 11, 3, hairK); disc(Hd[0] - ff * 1, Hd[1] - 3, 3.6, hairK); }
    px(Hd[0] + ff * 5, Hd[1] + 1, SK); const ex = Hd[0] + ff * 2, ey = Hd[1] - 0.5, e = her ? st.e : 0;
    if (e === 0) { px(ex, ey, 11); px(ex + ff, ey - 1, 11); } else if (e === 1) { px(ex, ey, 11); px(ex - ff, ey, 11); px(ex + ff, ey - 1, 11); } else { px(ex - ff, ey, 11); px(ex, ey - 1, 11); px(ex + ff, ey, 11); }
    if (her && e >= 1) { px(ex - ff * 2, ey + 2, 12); px(ex - ff * 3, ey + 2, 12); } const mx = Hd[0] + ff * 3, my = Hd[1] + 3; if (e === 2) { rect(Math.round(mx - (ff > 0 ? 0 : 1)), Math.round(my), 2, 2, 11); px(mx, my + 1, 13); } else if (e === 1) { px(mx, my, 13); px(mx - ff, my, 13); } else px(mx, my, SKS);
    return { Hd, S };
  }
  /* ---------- catalogue ---------- */
  const POSES = []; const add = (id, t, g, sc, fn) => POSES.push({ id, t, g, sc, fn });
  const him0 = () => Object.assign(lie(54, 49.5, -1), { legs: legX(54, 49.5, 88, 52, 1), arms: arm(22, 44, -1) });
  const himKU = () => Object.assign(lie(54, 49.5, -1), { legs: legX(54, 49.5, 66, 52.5, -1, 68, 52.5), arms: arm(22, 44, -1) });
  const hold = (hx, hy) => arm(hx, hy, 1); // his hands on her hips
  // --- A: she on top, he lies on his back
  const cow = (o) => (t) => { const h = o.him ? o.him() : him0(); const x = o.x || 57, y = (o.y || 41), her = { x, y, f: o.f || -1, a: o.a, legs: o.legs || legK(x, o.f || -1), arms: o.arms, prone: o.prone }; if (o.hhand) h.arms = o.hhand(x, y); return { sc: 'bed', her, him: h, mover: 'her', axis: o.axis || [0.15, 1], sheet: [66, 100] }; };
  add('A-face-thighs', 'คร่อมหันหน้า มือวางที่ต้นขาตัวเอง', 'บนตัวเขา', 'bed', cow({ a: [4, 8, 8], arms: arm(53, 46, 1) }));
  add('A-face-behind-head', 'คร่อมหันหน้า มือประสานหลังศีรษะ', 'บนตัวเขา', 'bed', cow({ a: [2, 4, 0], arms: [{ h: [60, 17], b: -1 }, { h: [58, 18], b: -1 }] }));
  add('A-face-clasped', 'คร่อมหันหน้า จับมือเขาโน้มตัว', 'บนตัวเขา', 'bed', cow({ a: [12, 24, 22], arms: arm(41, 47, 1), hhand: (x, y) => arm(41, 46, -1) }));
  add('A-face-his-hips', 'คร่อมหันหน้า เขาจับสะโพก', 'บนตัวเขา', 'bed', cow({ a: [6, 12, 12], arms: arm(50, 44, 1), hhand: (x, y) => arm(x - 3, y + 3, -1) }));
  add('A-face-shoulders', 'คร่อมหันหน้า มือยันไหล่เขา', 'บนตัวเขา', 'bed', cow({ a: [16, 30, 28], arms: arm(38, 46, 1) }));
  add('A-face-arch-knees', 'คร่อมหันหน้า เอนหลังมือยันเข่าเขา (เขาชันเข่า)', 'บนตัวเขา', 'bed', cow({ him: himKU, x: 52, y: 38, a: [-12, -30, -22], arms: arm(64, 41, 1) }));
  add('A-face-one-knee', 'คร่อมหันหน้า ตั้งเข่าข้างหนึ่ง', 'บนตัวเขา', 'bed', cow({ a: [8, 16, 14], legs: [{ k: [54, 51], a: [68, 52.5] }, { ft: [59, 52.8], b: 1, l1: 10, l2: 14 }], arms: arm(47, 44.5, 1) }));
  add('A-face-feet-leanback', 'นั่งยองเอนหลังมือยันต้นขาเขาด้านหลัง', 'บนตัวเขา', 'bed', cow({ x: 56, y: 37, a: [-10, -24, -20], legs: legP(56, 37, -1, -3, 52.8, 1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: arm(70, 47, 1) }));
  add('A-squat-knees', 'นั่งยอง มือเท้าเข่าตัวเอง', 'บนตัวเขา', 'bed', cow({ x: 59, y: 37, a: [14, 26, 22], legs: legP(59, 37, -1, 3, 52.8, 1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: [{ h: [49, 43], b: 1 }, { h: [51, 43], b: 1 }] }));
  add('A-squat-lean', 'นั่งยอง โน้มตัวมือยันอกเขา', 'บนตัวเขา', 'bed', cow({ x: 59, y: 38, a: [20, 36, 32], legs: legP(59, 38, -1, 3, 52.8, 1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: arm(46, 44.5, 1) }));
  add('A-squat-upright-hair', 'นั่งยอง ยืดตัว มือเสยผม', 'บนตัวเขา', 'bed', cow({ x: 59, y: 36, a: [2, 4, 0], legs: legP(59, 36, -1, 3, 52.8, 1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: [{ h: [58, 14], b: -1 }, { h: [60, 15], b: -1 }] }));
  add('A-kiss', 'นอนทับ จูบ', 'บนตัวเขา', 'bed', cow({ x: 62, y: 44, a: [52, 76, 70], legs: legK(62, -1), arms: [{ h: [34, 52.5], b: -1 }, { h: [31, 52.5], b: -1 }], axis: [0.3, 1] }));
  add('A-neck', 'นอนทับ ซบซอกคอ', 'บนตัวเขา', 'bed', cow({ x: 62, y: 44, a: [60, 82, 80], legs: legK(62, -1), arms: [{ h: [40, 49], b: -1 }, { h: [36, 51], b: -1 }], axis: [0.3, 1] }));
  add('A-forearms', 'นอนทับ ยันศอกสองข้างศีรษะเขา', 'บนตัวเขา', 'bed', cow({ x: 61, y: 43, a: [44, 66, 60], legs: legK(61, -1), arms: [{ h: [30, 52.5], b: -1 }, { h: [27, 52.5], b: -1 }], axis: [0.3, 1] }));
  add('A-chest-to-chest', 'นอนทับตัวเขา ขาชิดกัน', 'บนตัวเขา', 'bed', cow({ x: 60, y: 45, a: [70, 84, 82], legs: legX(60, 45, 90, 50, 1), arms: [{ h: [38, 51], b: -1 }, { h: [35, 52], b: -1 }], axis: [0.5, 0.5] }));
  add('A-back-thighs', 'คร่อมหันหลัง มือวางต้นขาตัวเอง', 'บนตัวเขา', 'bed', cow({ f: 1, x: 56, a: [8, 12, 10], legs: legK(56, 1), arms: arm(62, 46, -1) }));
  add('A-back-shins', 'คร่อมหันหลัง โน้มตัวมือยันหน้าแข้งเขา', 'บนตัวเขา', 'bed', cow({ f: 1, x: 56, a: [30, 48, 42], legs: legK(56, 1), arms: arm(80, 51, -1) }));
  add('A-back-far', 'คร่อมหันหลัง โน้มไปข้างหน้ามากสุด', 'บนตัวเขา', 'bed', cow({ f: 1, x: 56, y: 42, a: [48, 66, 58], legs: legK(56, 1), arms: arm(84, 52, -1) }));
  add('A-back-squat', 'หันหลัง นั่งยอง', 'บนตัวเขา', 'bed', cow({ f: 1, x: 55, y: 37, a: [12, 22, 20], legs: legP(55, 37, 1, 3, 52.8, -1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: arm(66, 45, -1) }));
  add('A-back-squat-lean', 'หันหลัง นั่งยอง โน้มหน้า', 'บนตัวเขา', 'bed', cow({ f: 1, x: 55, y: 39, a: [30, 46, 40], legs: legP(55, 39, 1, 3, 52.8, -1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: arm(76, 46, -1) }));
  add('A-back-lie', 'หันหลัง เอนหลังพิงอกเขา', 'บนตัวเขา', 'bed', cow({ f: 1, x: 58, y: 44, a: [-50, -72, -70], legs: legK(58, 1), arms: arm(66, 47, -1), him: () => Object.assign(lie(54, 49.5, -1, [60, 70, 72]), { legs: legX(54, 49.5, 88, 52, 1), arms: arm(70, 40, -1) }), axis: [0.3, 1] }));
  add('A-back-hands-head', 'หันหลัง มือประสานหลังศีรษะ', 'บนตัวเขา', 'bed', cow({ f: 1, x: 56, a: [-4, -8, -6], legs: legK(56, 1), arms: [{ h: [52, 16], b: 1 }, { h: [54, 17], b: 1 }] }));
  add('A-back-one-knee', 'หันหลัง ตั้งเข่าข้างหนึ่ง', 'บนตัวเขา', 'bed', cow({ f: 1, x: 56, a: [14, 22, 20], legs: [{ k: [60, 51], a: [46, 52.5] }, { ft: [52, 52.8], b: -1, l1: 10, l2: 14 }], arms: arm(70, 45, -1) }));
  // --- B: seated and lap
  const sit = (x, y) => Object.assign(lie(x, y, -1, [4, 6, 8]), { legs: legX(x, y, x + 32, 52, 1), arms: arm(x - 8, 40, 1) });
  const lapHim = () => Object.assign(lie(31, 52, -1, [6, 8, 8]), { legs: legX(31, 52, 62, 53, 1), arms: arm(44, 42, 1) });
  const lap = (o) => (t) => { const him = lapHim(); const her = { x: 43, y: 46, f: -1, a: o.a || [6, 12, 12], legs: o.legs || [{ k: [40, 51], a: [36, 52.6] }, { k: [42.5, 49.6], a: [37, 51.2] }], arms: o.arms || arm(29, 33.5, -1) }; if (o.hhand) him.arms = o.hhand; if (o.him) Object.assign(him, o.him); return { sc: 'bed', her, him, mover: 'her', axis: [0.2, 1], sheet: null }; };
  add('B-lap-lotus', 'นั่งตัก ไขว้ขาโอบเอวเขา', 'นั่งและตัก', 'bed', lap({ legs: [{ k: [41, 51], a: [35, 52] }, { k: [43, 49], a: [34, 50.5] }] }));
  add('B-lap-leanback', 'นั่งตัก เอนหลัง เขาประคองหลัง', 'นั่งและตัก', 'bed', lap({ a: [-16, -30, -28], arms: arm(52, 38, 1), hhand: arm(48, 42, 1) }));
  add('B-lap-kiss', 'นั่งตัก จูบ', 'นั่งและตัก', 'bed', lap({ a: [8, 16, 18], arms: arm(30, 28, -1) }));
  add('B-lap-reverse', 'นั่งตักหันหลัง พิงอกเขา', 'นั่งและตัก', 'bed', (t) => ({ sc: 'bed', her: { x: 40, y: 47, f: 1, a: [-10, -18, -16], legs: legX(40, 47, 60, 53, -1, 62, 52, -1), arms: arm(55, 44, -1) }, him: lapHim(), mover: 'her', axis: [0.2, 1] }));
  add('B-lap-reverse-lean', 'นั่งตักหันหลัง โน้มหน้ามือยันเข่า', 'นั่งและตัก', 'bed', (t) => ({ sc: 'bed', her: { x: 42, y: 46, f: 1, a: [22, 34, 30], legs: legX(42, 46, 62, 53, -1), arms: arm(58, 49, -1) }, him: lapHim(), mover: 'her', axis: [0.2, 1] }));
  add('B-lap-kneel', 'นั่งตัก คุกเข่าตัวตรง', 'นั่งและตัก', 'bed', lap({ x: 0, a: [4, 8, 8], legs: [{ k: [40, 51], a: [54, 52.5] }, { k: [42, 49.5], a: [56, 51.5] }], arms: arm(29, 32, -1) }));
  add('B-lap-side', 'นั่งตัก นั่งตะแคง', 'นั่งและตัก', 'bed', lap({ a: [4, 8, 8], legs: legX(43, 46, 62, 53, 1), arms: arm(32, 34, -1) }));
  const chairHim = () => Object.assign(lie(43, 44, -1, [4, 6, 6]), { legs: [{ k: [58, 45], a: [58, 68] }, { k: [60, 44], a: [60, 67] }], arms: arm(36, 40, 1) });
  const chair = (o) => () => ({ sc: 'chair', her: Object.assign({ x: 46, y: 38, f: -1, a: [8, 14, 14], legs: [{ k: [41, 42], a: [55, 43.5] }, { k: [43, 40.5], a: [57, 42] }], arms: arm(36, 28, -1) }, o), him: chairHim(), mover: 'her', axis: [0.1, 1] });
  add('B-chair-face', 'บนเก้าอี้ หันหน้า', 'นั่งและตัก', 'chair', chair({}));
  add('B-chair-reverse', 'บนเก้าอี้ หันหลัง', 'นั่งและตัก', 'chair', () => ({ sc: 'chair', her: { x: 41, y: 38, f: 1, a: [10, 18, 16], legs: [{ k: [46, 42], a: [32, 43.5] }, { k: [48, 40.5], a: [34, 42] }], arms: arm(58, 52, -1) }, him: chairHim(), mover: 'her', axis: [0.1, 1] }));
  add('B-chair-leanback', 'บนเก้าอี้ เอนหลังพิงเขา', 'นั่งและตัก', 'chair', () => ({ sc: 'chair', her: { x: 41, y: 38, f: 1, a: [-14, -26, -24], legs: [{ k: [46, 42], a: [32, 43.5] }, { k: [48, 40.5], a: [34, 42] }], arms: arm(50, 38, -1) }, him: chairHim(), mover: 'her', axis: [0.1, 1] }));
  const edgeHim = () => Object.assign(lie(52, 45, -1, [2, 4, 4]), { legs: [{ k: [67, 46], a: [67, 68] }, { k: [69, 45], a: [69, 67] }], arms: arm(50, 44, 1) });
  add('B-edge-face', 'ปลายเตียง หันหน้า', 'นั่งและตัก', 'edge', () => ({ sc: 'edge', her: { x: 56, y: 38, f: -1, a: [6, 12, 12], legs: [{ k: [52, 47], a: [60, 48.5] }, { k: [54, 45.5], a: [62, 47] }], arms: arm(44, 29, -1) }, him: edgeHim(), mover: 'her', axis: [0.1, 1] }));
  add('B-edge-reverse', 'ปลายเตียง หันหลัง', 'นั่งและตัก', 'edge', () => ({ sc: 'edge', her: { x: 54, y: 38, f: 1, a: [8, 14, 12], legs: [{ k: [58, 47], a: [46, 48.5] }, { k: [60, 45.5], a: [48, 47] }], arms: arm(62, 48, -1) }, him: edgeHim(), mover: 'her', axis: [0.1, 1] }));
  add('B-edge-she-sits', 'เธอนั่งขอบเตียง เขายืนระหว่างขา', 'นั่งและตัก', 'edge', () => ({ sc: 'edge', her: { x: 50, y: 45, f: 1, a: [-14, -24, -22], legs: [{ ft: [64, 49], b: -1 }, { ft: [66, 47], b: -1 }], arms: arm(40, 46, 1) }, him: { x: 66, y: 41, f: -1, a: [14, 26, 24], legs: legX(66, 41, 70, 70, 1), arms: arm(54, 46, 1) }, mover: 'him', axis: [1, 0] }));
  // --- C: he on top, she lies on her back
  const herLie = (legs, arms, a) => Object.assign(lie(54, 49.5, -1, a), { legs, arms });
  const miss = (o) => () => ({ sc: 'bed', her: herLie(o.legs, o.arms || arm(22, 44, -1), o.herA), him: Object.assign({ x: o.hx || 62, y: o.hy || 43, f: -1, a: o.a || [34, 56, 50], legs: legK(o.hx || 62, -1), arms: [{ h: [34, 52.5], b: -1 }, { h: [31, 52.5], b: -1 }] }, o.him || {}), mover: 'him', axis: [0.8, 0.5] });
  add('C-wrap', 'ท่ามิชชันนารี เธอใช้ขาโอบเอว', 'เขาอยู่ข้างบน', 'bed', miss({ legs: legX(54, 49.5, 70, 46, -1, 72, 47, -1) }));
  add('C-apart', 'เธอกางเข่าราบ', 'เขาอยู่ข้างบน', 'bed', miss({ legs: legX(54, 49.5, 76, 52.5, 1, 78, 52.5, -1) }));
  add('C-shoulder', 'ยกขาพาดไหล่เขา', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 64, hy: 41, a: [20, 36, 30], legs: legX(54, 49.5, 62, 22, 1, 64, 21, 1), him: { arms: [{ h: [38, 52], b: -1 }, { h: [35, 52], b: -1 }] } }));
  add('C-knees-chest', 'ชันเข่าชิดอก', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 62, hy: 41, a: [24, 40, 36], legs: legX(54, 49.5, 58, 32, -1, 60, 31, -1) }));
  add('C-pillow', 'หนุนสะโพกด้วยหมอน', 'เขาอยู่ข้างบน', 'bed', miss({ hy: 41, legs: legX(54, 46, 72, 46, 1, 74, 47, -1), herA: [80, 88, 90] }));
  add('C-ankles', 'ไขว้ข้อเท้าที่หลังเขา', 'เขาอยู่ข้างบน', 'bed', miss({ legs: legX(54, 49.5, 68, 44, -1, 69, 45, -1) }));
  add('C-straight', 'ขาชิดเหยียดตรง', 'เขาอยู่ข้างบน', 'bed', miss({ legs: legX(54, 49.5, 86, 52, 1), hx: 66, hy: 44 }));
  add('C-one-shoulder', 'ยกขาข้างเดียวพาดไหล่', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 63, hy: 42, legs: [{ ft: [62, 25], b: 1 }, { ft: [74, 52], b: 1 }] }));
  add('C-low', 'เขาก้มต่ำ ศอกยันที่นอน', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 63, hy: 45, a: [56, 76, 72], legs: legX(54, 49.5, 76, 52.5, 1), him: { arms: [{ h: [34, 52], b: -1 }, { h: [31, 52], b: -1 }] } }));
  add('C-pushup', 'เขายันแขนตรง', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 66, hy: 40, a: [20, 32, 28], legs: legX(54, 49.5, 72, 46, -1), him: { arms: [{ h: [38, 52], b: -1 }, { h: [36, 52], b: -1 }] } }));
  add('C-kneel-hips', 'เขาคุกเข่าตัวตรง ยกสะโพกเธอวางบนต้นขา', 'เขาอยู่ข้างบน', 'bed', () => ({ sc: 'bed', her: herLie(legX(54, 46, 66, 38, -1, 68, 39, -1), arm(22, 44, -1), [72, 84, 88]), him: { x: 68, y: 40, f: -1, a: [4, 8, 8], legs: legK(68, -1), arms: arm(58, 44, -1) }, mover: 'him', axis: [1, 0.3] }));
  add('C-hands-up', 'เธอยกมือเหนือศีรษะ', 'เขาอยู่ข้างบน', 'bed', miss({ legs: legX(54, 49.5, 70, 46, -1), arms: arm(12, 46, 1) }));
  add('C-hug', 'เธอกอดหลังเขา', 'เขาอยู่ข้างบน', 'bed', miss({ legs: legX(54, 49.5, 70, 46, -1), arms: arm(60, 36, -1), a: [46, 66, 60] }));
  add('C-wide', 'เธอกางขาออกกว้าง', 'เขาอยู่ข้างบน', 'bed', miss({ legs: legX(54, 49.5, 80, 44, 1, 82, 46, -1) }));
  add('C-bridge', 'เธอเกร็งแอ่นสะโพก', 'เขาอยู่ข้างบน', 'bed', miss({ herA: [70, 84, 88], legs: legX(54, 44, 66, 52.5, -1, 68, 52.5, -1) }));
  add('C-foot-chest', 'เท้าเธอยันอกเขา', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 64, hy: 42, a: [18, 32, 28], legs: [{ ft: [52, 36], b: -1 }, { ft: [76, 52], b: 1 }] }));
  add('C-over-arms', 'เขาคล้องขาเธอไว้ที่แขน', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 64, hy: 41, a: [26, 44, 38], legs: legX(54, 49.5, 62, 34, -1, 64, 35, -1) }));
  add('C-edge', 'เธอนอนที่ขอบเตียง เขายืน', 'เขาอยู่ข้างบน', 'edge', () => ({ sc: 'edge', her: { x: 46, y: 47, f: -1, a: [86, 90, 92], legs: legX(46, 47, 66, 40, 1, 68, 41, 1), arms: arm(12, 46, 1) }, him: { x: 70, y: 41, f: -1, a: [8, 14, 12], legs: legX(70, 41, 70, 70, 1), arms: arm(58, 43, 1) }, mover: 'him', axis: [1, 0] }));
  // --- D: from behind
  const allf = (o) => () => { const x = o.x || 52, y = o.y || 36; return { sc: 'bed', her: { x, y, f: -1, a: o.a || [84, 88, 86], prone: true, legs: o.legs || [{ k: [x + 12, 50], a: [x + 26, 52.5] }, { k: [x + 14, 48.5], a: [x + 28, 51] }], arms: o.arms || [{ h: [x - 20, 52.5], b: 1 }, { h: [x - 22, 52.5], b: 1 }] }, him: o.him || { x: x + 22, y: 38, f: -1, a: [10, 18, 16], legs: legK(x + 22, -1), arms: arm(x + 8, 38, -1) }, mover: 'him', axis: [1, 0] }; };
  add('D-allfours', 'คุกเข่าสี่เท้า มือใต้ไหล่', 'จากด้านหลัง', 'bed', allf({}));
  add('D-elbows', 'ศอกยัน อกต่ำ สะโพกสูง', 'จากด้านหลัง', 'bed', allf({ a: [64, 74, 70], arms: [{ h: [30, 52.5], b: -1 }, { h: [28, 52.5], b: -1 }] }));
  add('D-prone', 'นอนคว่ำราบ', 'จากด้านหลัง', 'bed', () => ({ sc: 'bed', her: { x: 56, y: 49.5, f: -1, a: [88, 90, 90], prone: true, legs: legX(56, 49.5, 88, 52, 1), arms: arm(26, 52, 1) }, him: { x: 72, y: 41, f: -1, a: [40, 60, 54], legs: legK(72, -1), arms: [{ h: [50, 46], b: -1 }, { h: [48, 47], b: -1 }] }, mover: 'him', axis: [0.8, 0.5] }));
  add('D-prone-pillow', 'นอนคว่ำ หมอนรองสะโพก', 'จากด้านหลัง', 'bed', () => ({ sc: 'bed', her: { x: 56, y: 46, f: -1, a: [80, 88, 90], prone: true, legs: legX(56, 46, 88, 52, 1), arms: arm(26, 52, 1) }, him: { x: 72, y: 39, f: -1, a: [34, 56, 50], legs: legK(72, -1), arms: [{ h: [50, 44], b: -1 }, { h: [48, 45], b: -1 }] }, mover: 'him', axis: [0.8, 0.5] }));
  add('D-arch', 'คุกเข่า แอ่นหลัง เงยหน้า', 'จากด้านหลัง', 'bed', allf({ a: [78, 84, 70] }));
  add('D-look-back', 'คุกเข่า หันมองข้างหลัง', 'จากด้านหลัง', 'bed', allf({ a: [84, 88, 60] }));
  add('D-leg-up', 'คุกเข่า ยกขาข้างหนึ่ง', 'จากด้านหลัง', 'bed', allf({ legs: [{ k: [64, 50], a: [78, 52.5] }, { ft: [74, 36], b: -1 }] }));
  add('D-kneel-up', 'คุกเข่าตัวตรงทั้งคู่ เธอเอนพิงเขา', 'จากด้านหลัง', 'bed', () => ({ sc: 'bed', her: { x: 54, y: 41, f: -1, a: [-6, -12, -10], legs: legK(54, -1), arms: arm(40, 34, 1) }, him: { x: 64, y: 41, f: -1, a: [4, 8, 8], legs: legK(64, -1), arms: arm(52, 32, -1) }, mover: 'him', axis: [1, 0.3] }));
  add('D-kneel-headboard', 'คุกเข่า มือยึดหัวเตียง', 'จากด้านหลัง', 'bed', () => ({ sc: 'bed', her: { x: 44, y: 41, f: -1, a: [6, 12, 12], legs: legK(44, -1), arms: [{ h: [10, 28], b: 1 }, { h: [11, 30], b: 1 }] }, him: { x: 58, y: 41, f: -1, a: [8, 14, 12], legs: legK(58, -1), arms: arm(48, 42, -1) }, mover: 'him', axis: [1, 0.3] }));
  const edgeBent = (o) => () => ({ sc: 'edge', her: Object.assign({ x: 44, y: 41, f: -1, a: [60, 72, 68], prone: true, legs: legX(44, 41, 50, 52, 1), arms: arm(24, 49, 1) }, o.her || {}), him: { x: 62, y: 41, f: -1, a: [8, 12, 10], legs: legX(62, 41, 62, 70, 1), arms: arm(50, 42, -1) }, mover: 'him', axis: [1, 0] });
  add('D-edge-bent', 'ก้มตัวบนขอบเตียง เขายืนด้านหลัง', 'จากด้านหลัง', 'edge', edgeBent({}));
  add('D-edge-onefoot', 'ก้มขอบเตียง ยกเท้าข้างหนึ่ง', 'จากด้านหลัง', 'edge', edgeBent({ her: { legs: [{ ft: [50, 70], b: 1 }, { ft: [58, 44], b: -1 }] } }));
  add('D-edge-kneel', 'คุกเข่าบนขอบเตียง เขายืน', 'จากด้านหลัง', 'edge', () => ({ sc: 'edge', her: { x: 40, y: 38, f: -1, a: [82, 88, 70], prone: true, legs: [{ k: [50, 49], a: [62, 49.5] }, { k: [52, 47.5], a: [64, 48] }], arms: arm(18, 49, 1) }, him: { x: 64, y: 42, f: -1, a: [8, 12, 10], legs: legX(64, 42, 64, 70, 1), arms: arm(54, 42, -1) }, mover: 'him', axis: [1, 0] }));
  add('D-wall-bent', 'ก้มตัว มือยันกำแพง', 'จากด้านหลัง', 'wall', () => ({ sc: 'wall', her: { x: 58, y: 40, f: 1, a: [66, 76, 72], prone: true, legs: legX(58, 40, 52, 70, 1), arms: arm(94, 34, 1) }, him: { x: 42, y: 41, f: 1, a: [8, 12, 10], legs: legX(42, 41, 42, 70, -1), arms: arm(54, 41, 1) }, mover: 'him', axis: [1, 0] }));
  add('D-table', 'ก้มตัวคว่ำบนโต๊ะ', 'จากด้านหลัง', 'table', () => ({ sc: 'table', her: { x: 90, y: 41, f: 1, a: [80, 86, 84], prone: true, legs: legX(90, 41, 84, 70, 1), arms: arm(112, 44, 1) }, him: { x: 72, y: 41, f: 1, a: [8, 12, 10], legs: legX(72, 41, 72, 70, -1), arms: arm(84, 41, 1) }, mover: 'him', axis: [1, 0] }));
  // --- E: side-lying (both on their sides facing right; viewed from the side)
  const side = (o) => () => ({ sc: 'bed', her: Object.assign({ x: 58, y: 49, f: -1, a: [84, 88, 90], legs: [{ ft: [78, 50], b: 1 }, { ft: [80, 52], b: 1 }], arms: arm(28, 49, 1) }, o.her || {}), him: Object.assign({ x: 70, y: 49, f: -1, a: [84, 88, 90], legs: [{ ft: [92, 50], b: 1 }, { ft: [94, 52], b: 1 }], arms: arm(44, 46, -1) }, o.him || {}), mover: 'him', axis: [1, 0] });
  add('E-spoon', 'นอนตะแคงช้อนหลัง', 'นอนตะแคง', 'bed', side({}));
  add('E-spoon-leg', 'ช้อนหลัง เธอยกขาพาดขาเขา', 'นอนตะแคง', 'bed', side({ her: { legs: [{ ft: [74, 40], b: -1 }, { ft: [80, 52], b: 1 }] } }));
  add('E-spoon-hip', 'ช้อนหลัง เขากอดเอว', 'นอนตะแคง', 'bed', side({ him: { arms: arm(52, 44, -1) } }));
  add('E-spoon-curl', 'ช้อนหลัง เธอขดตัว', 'นอนตะแคง', 'bed', side({ her: { a: [70, 80, 86], legs: [{ ft: [64, 50], b: -1 }, { ft: [66, 52], b: -1 }] } }));
  add('E-face', 'นอนตะแคงหันหน้า', 'นอนตะแคง', 'bed', () => ({ sc: 'bed', her: { x: 58, y: 49, f: -1, a: [84, 88, 90], legs: [{ ft: [76, 48], b: 1 }, { ft: [78, 51], b: 1 }], arms: arm(44, 44, -1) }, him: { x: 72, y: 49, f: 1, a: [84, 88, 90], legs: legX(72, 49, 60, 50, 1), arms: arm(50, 46, 1) }, mover: 'him', axis: [1, 0] }));
  add('E-scissor', 'ท่ากรรไกร ขาไขว้', 'นอนตะแคง', 'bed', () => ({ sc: 'bed', her: { x: 54, y: 49.5, f: -1, a: [88, 90, 90], legs: [{ ft: [76, 52], b: 1 }, { ft: [74, 44], b: -1 }], arms: arm(24, 50, 1) }, him: { x: 68, y: 49.5, f: 1, a: [88, 90, 90], legs: [{ ft: [58, 44], b: -1 }, { ft: [46, 51], b: 1 }], arms: arm(78, 47, -1) }, mover: 'him', axis: [1, 0] }));
  add('E-her-on-arm', 'นอนตะแคง ศีรษะหนุนแขนเขา', 'นอนตะแคง', 'bed', side({ her: { arms: arm(26, 47, 1) }, him: { arms: arm(34, 48, -1) } }));
  add('E-leg-over', 'นอนตะแคง เธอพาดขาเหนือสะโพกเขา', 'นอนตะแคง', 'bed', () => ({ sc: 'bed', her: { x: 58, y: 49, f: -1, a: [84, 88, 90], legs: [{ ft: [70, 40], b: -1 }, { ft: [74, 52], b: 1 }], arms: arm(42, 46, -1) }, him: { x: 66, y: 49, f: 1, a: [84, 88, 90], legs: legX(66, 49, 52, 52, 1), arms: arm(48, 42, 1) }, mover: 'him', axis: [1, 0] }));
  // --- F: standing
  const standFace = (o) => () => ({ sc: o.sc || 'floor', her: Object.assign({ x: 54, y: 41, f: 1, a: [4, 8, 8], legs: legX(54, 41, 54, 70, -1), arms: arm(66, 28, 1) }, o.her || {}), him: Object.assign({ x: 64, y: 41, f: -1, a: [4, 8, 8], legs: legX(64, 41, 66, 70, 1), arms: arm(54, 42, -1) }, o.him || {}), mover: 'him', axis: [1, 0] });
  add('F-face', 'ยืนหันหน้ากอดกัน', 'ยืน', 'floor', standFace({}));
  add('F-lift', 'เขาอุ้มเธอ เธอเกี่ยวขาโอบเอว', 'ยืน', 'floor', () => ({ sc: 'floor', her: { x: 55, y: 36, f: 1, a: [4, 8, 8], legs: legX(55, 36, 66, 36, 1, 68, 35, 1), arms: arm(66, 22, 1) }, him: { x: 64, y: 41, f: -1, a: [2, 4, 4], legs: legX(64, 41, 66, 70, 1), arms: arm(54, 40, -1) }, mover: 'him', axis: [0.2, 1] }));
  add('F-wall-lift', 'พิงกำแพง เขาอุ้มเธอ', 'ยืน', 'wall', () => ({ sc: 'wall', her: { x: 92, y: 36, f: -1, a: [-4, -8, -8], legs: legX(92, 36, 80, 36, -1, 78, 35, -1), arms: arm(84, 22, -1) }, him: { x: 80, y: 41, f: 1, a: [2, 4, 4], legs: legX(80, 41, 78, 70, -1), arms: arm(90, 40, 1) }, mover: 'him', axis: [1, 0.2] }));
  add('F-wall-leg', 'พิงกำแพง เขาประคองขาเธอข้างหนึ่ง', 'ยืน', 'wall', () => ({ sc: 'wall', her: { x: 92, y: 41, f: -1, a: [-4, -8, -8], legs: [{ ft: [82, 34], b: -1 }, { ft: [90, 70], b: 1 }], arms: arm(80, 26, -1) }, him: { x: 80, y: 41, f: 1, a: [4, 8, 8], legs: legX(80, 41, 76, 70, -1), arms: arm(84, 36, 1) }, mover: 'him', axis: [1, 0] }));
  add('F-back-hug', 'ยืนกอดจากด้านหลัง', 'ยืน', 'floor', () => ({ sc: 'floor', her: { x: 56, y: 41, f: -1, a: [-2, -4, -4], legs: legX(56, 41, 58, 70, 1), arms: arm(46, 42, 1) }, him: { x: 64, y: 41, f: -1, a: [4, 8, 8], legs: legX(64, 41, 66, 70, 1), arms: arm(52, 36, -1) }, mover: 'him', axis: [1, 0] }));
  add('F-sit-counter', 'เธอนั่งบนโต๊ะ เขายืนระหว่างขา', 'ยืน', 'table', () => ({ sc: 'table', her: { x: 90, y: 38, f: -1, a: [-10, -18, -16], legs: [{ ft: [76, 40], b: -1 }, { ft: [78, 38], b: -1 }], arms: arm(104, 38, 1) }, him: { x: 76, y: 41, f: 1, a: [4, 8, 8], legs: legX(76, 41, 74, 70, -1), arms: arm(86, 36, 1) }, mover: 'him', axis: [1, 0] }));
  add('F-wall-kiss', 'พิงกำแพง จูบ เท้าเธอยกขึ้นพาดเขา', 'ยืน', 'wall', () => ({ sc: 'wall', her: { x: 92, y: 41, f: -1, a: [-4, -8, -6], legs: [{ ft: [80, 44], b: -1 }, { ft: [90, 70], b: 1 }], arms: arm(82, 24, -1) }, him: { x: 80, y: 41, f: 1, a: [6, 12, 12], legs: legX(80, 41, 76, 70, -1), arms: arm(90, 38, 1) }, mover: 'him', axis: [0.8, 0] }));
  add('F-chair-bent', 'ยืนก้มพิงพนักเก้าอี้', 'ยืน', 'chair', () => ({ sc: 'chair', her: { x: 44, y: 41, f: -1, a: [62, 74, 70], prone: true, legs: legX(44, 41, 50, 70, 1), arms: arm(32, 28, 1) }, him: { x: 62, y: 41, f: -1, a: [8, 12, 10], legs: legX(62, 41, 64, 70, 1), arms: arm(50, 40, -1) }, mover: 'him', axis: [1, 0] }));
  add('F-carry-back', 'เขาอุ้มเธอ หันหลังชิดอกเขา', 'ยืน', 'floor', () => ({ sc: 'floor', her: { x: 56, y: 38, f: 1, a: [-8, -14, -14], legs: [{ ft: [72, 28], b: -1 }, { ft: [70, 36], b: -1 }], arms: arm(60, 20, 1) }, him: { x: 66, y: 41, f: -1, a: [2, 4, 4], legs: legX(66, 41, 68, 70, 1), arms: arm(56, 36, -1) }, mover: 'him', axis: [1, 0.2] }));
  add('F-lean-chair', 'ยืนยันพนักเก้าอี้ สะโพกยื่นกลับ', 'ยืน', 'chair', () => ({ sc: 'chair', her: { x: 46, y: 41, f: -1, a: [30, 42, 38], legs: legX(46, 41, 48, 70, 1), arms: arm(33, 30, 1) }, him: { x: 62, y: 41, f: -1, a: [6, 10, 8], legs: legX(62, 41, 64, 70, 1), arms: arm(52, 40, -1) }, mover: 'him', axis: [1, 0] }));
  // --- G: start (before)
  add('G-straddle-clothed', 'ขึ้นคร่อมทั้งที่สวมชุด', 'ช่วงเริ่ม', 'bed', cow({ a: [10, 20, 18], arms: arm(46, 45, 1) }));
  add('G-sit-beside', 'นั่งข้างกัน หันหากัน', 'ช่วงเริ่ม', 'bed', () => ({ sc: 'bed', her: { x: 50, y: 47, f: 1, a: [6, 10, 10], legs: legX(50, 47, 66, 52, -1), arms: arm(64, 40, -1) }, him: { x: 66, y: 47, f: -1, a: [6, 10, 10], legs: legX(66, 47, 80, 52, 1), arms: arm(54, 40, -1) }, mover: 'her', axis: [0, 0.3] }));
  add('G-push-down', 'เธอดันเขาลงนอน', 'ช่วงเริ่ม', 'bed', () => ({ sc: 'bed', her: { x: 60, y: 42, f: -1, a: [28, 44, 40], legs: legK(60, -1), arms: arm(44, 47, 1) }, him: Object.assign(lie(54, 49.5, -1, [60, 70, 72]), { legs: legX(54, 49.5, 88, 52, 1), arms: arm(40, 44, -1) }), mover: 'her', axis: [0, 0.4] }));
  add('G-back-massage', 'เธอนั่งบนหลังเขา นวดไหล่', 'ช่วงเริ่ม', 'bed', () => ({ sc: 'bed', her: { x: 62, y: 42, f: -1, a: [10, 18, 16], legs: legK(62, -1), arms: arm(44, 44, 1) }, him: { x: 56, y: 49.5, f: -1, a: [88, 90, 90], prone: true, legs: legX(56, 49.5, 88, 52, 1), arms: arm(26, 52, 1) }, mover: 'her', axis: [0.5, 0.3] }));
  add('G-kneel-over', 'คุกเข่าคร่อมเหนือเขา ยังไม่ลง', 'ช่วงเริ่ม', 'bed', cow({ y: 36, a: [6, 10, 10], arms: arm(46, 44, 1) }));
  add('G-kiss-side', 'นอนตะแคงจูบกัน', 'ช่วงเริ่ม', 'bed', () => ({ sc: 'bed', her: { x: 58, y: 49, f: -1, a: [84, 88, 90], legs: legX(58, 49, 78, 51, 1), arms: arm(44, 44, -1) }, him: { x: 74, y: 49, f: 1, a: [84, 88, 90], legs: legX(74, 49, 62, 51, 1), arms: arm(50, 46, 1) }, mover: 'her', axis: [0, 0.3] }));
  /* ---------- render ---------- */
  function renderPose(id, t, o) {
    o = Object.assign({ rhythm: 'mid', outfit: 'half', heat: 55, hair: 'brown', climax: false }, o || {}); const def = POSES.find(p => p.id === id); if (!def) throw new Error('no pose ' + id); PAL[8] = A.HAIRS[o.hair] || A.HAIRS.brown;
    const spec = def.fn(t), g = new Uint8Array(W * H), c = ctxFor(g), R = A.RHY[o.rhythm] || A.RHY.mid, phi = t / FR * 6.2832 * R.cyc, e = o.climax ? 2 : o.heat < 40 ? 0 : o.heat < 75 ? 1 : 2;
    let m = o.climax ? ((t % 2) ? 1 : -1) * 0.6 : (o.rhythm === 'slow' ? Math.sin(phi) * 1.0 : o.rhythm === 'mid' ? Math.sin(phi) * 2.0 : Math.sin(phi) * 1.6);
    const mv = spec.mover === 'him' ? spec.him : spec.her, ax = spec.axis || [0, 1]; mv.x += ax[0] * m; mv.y += ax[1] * m;
    scene(c, spec.sc, t); const st = { e, lag: Math.sin(phi - 0.9), outfit: o.outfit };
    person(c, spec.him, 'him', st); person(c, spec.her, 'her', st);
    if (spec.sc === 'bed' || spec.sc === 'edge') { const x0 = spec.sheet === null ? 0 : spec.sheet ? spec.sheet[0] : 0, x1 = spec.sheet === null ? 0 : spec.sheet ? spec.sheet[1] : 0; for (let x = x0; x < x1; x++) { const yy = 49 + Math.round(Math.sin((x + t) / 4) * 0.7); for (let y = yy; y < 56; y++) c.px(x, y, 15); c.px(x, yy, 14); } }
    if (e >= 1) { c.px(spec.her.x + 4 - (t % 2), spec.her.y - 16 + (t * 2) % 8, 23); }
    if (o.climax) for (let i = 0; i < 6; i++) { const x = 28 + i * 14, y = 20 - ((t * 3 + i * 4) % 16); [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(p => c.px(x + p[0], y + p[1] + 6, 13)); }
    return g;
  }
  A.POSES2 = POSES; A.renderPose = renderPose;
  if (typeof module !== 'undefined') module.exports = A;
})(typeof window !== 'undefined' ? window : globalThis);
