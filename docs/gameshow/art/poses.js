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
  const lie = (x, y, f, a) => { const aa = a || [88, 90, 92]; return Object.assign({ x, y, f, a: aa }, Math.abs(aa[1]) >= 68 ? { sup: true } : {}); };
  const legK = (x, f, y) => [{ kneel: true, k: [x + f * 3, (y || 51)], a: [x - f * 11, (y || 51) + 1.5] }, { kneel: true, k: [x + f * 3 + 2, (y || 51) - 1.5], a: [x - f * 11 + 2, (y || 51)] }]; // kneeling: knee + shin lying behind
  const legP = (x, y, f, dx, fy, bend) => [{ ft: [x + f * dx, fy], b: bend === undefined ? -f : bend }, { ft: [x + f * dx + 2.5, fy - 1.2], b: bend === undefined ? -f : bend }]; // planted feet (IK)
  const legX = (x, y, tx, ty, b, tx2, ty2, b2) => [{ ft: [tx, ty], b }, { ft: [tx2 === undefined ? tx + 2 : tx2, ty2 === undefined ? ty - 1 : ty2], b: b2 === undefined ? b : b2 }];
  const arm = (hx, hy, b, hx2, hy2) => [{ h: [hx, hy], b }, { h: [hx2 === undefined ? hx + 2 : hx2, hy2 === undefined ? hy : hy2], b }];
  /* ---------- skeleton rig: joints first, skin second ---------- */
  const dot = (p, q) => p[0] * q[0] + p[1] * q[1], sub = (p, q) => [p[0] - q[0], p[1] - q[1]], nrm = p => { const d = Math.hypot(p[0], p[1]) || 1; return [p[0] / d, p[1] / d]; }, angBetween = (p, q) => Math.acos(Math.max(-1, Math.min(1, dot(nrm(p), nrm(q))))) * 180 / Math.PI;
  function ventral(sp, ang) { if (sp.vent) return sp.vent; if (sp.face === 'down' || sp.prone) return [0, 1]; if (sp.sup) return [0, -1]; const ff = sp.f; return [ff * Math.cos(rad(ang)), Math.sin(rad(ang))]; }
  // ventral normal of a limb segment: the trunk's down-axis e and front V, rotated with the segment (flexion theta toward the front)
  function limbNormal(t, e, V) { const th = Math.atan2(dot(t, V), dot(t, e)); return [-Math.sin(th) * e[0] + Math.cos(th) * V[0], -Math.sin(th) * e[1] + Math.cos(th) * V[1]]; }
  function solveFigure(sp, sc) {
    const ff = sp.f, hx = sp.x, hy = sp.y, a = sp.a || [10, 20, 20];
    const L1 = P(hx, hy, LEN.lum, a[0], ff), S = P(L1[0], L1[1], LEN.tho, a[1], ff), N = P(S[0], S[1], LEN.neck, a[2], ff), Hd = P(N[0], N[1], 5.2, a[2] + 5, ff), V = ventral(sp, a[1]), Vp = ventral(sp, a[0]), u = nrm(sub(S, [hx, hy])), eDown = [-u[0], -u[1]], warn = [];
    const legs = [0, 1].map(i => { let L = (sp.legs || [])[i]; if (!L) return null; const far = i === 1, hip = [hx + (far ? 1 : 0), hy + 1]; let knee, ankle, clampd = 0, l1 = L.l1 || LEN.thigh, l2 = L.l2 || LEN.shin;
      if (L.k && L.kneel) { knee = L.k; ankle = L.a; } else {
        if (L.k) { L = { ft: L.ft || L.a, kk: L.k, l1: L.l1, l2: L.l2, wrap: L.wrap }; }
        let ft = L.ft.slice(); const dd = Math.hypot(ft[0] - hip[0], ft[1] - hip[1]), rc = l1 + l2 - 0.3; if (dd > rc) { const sy = surfaceY(sc, ft[0]); if (Math.abs(ft[1] - sy) < 4 || Math.abs(ft[1] - 52.8) < 2.5) { const dy = ft[1] - hip[1], dx = Math.sqrt(Math.max(0, rc * rc - dy * dy)) * (ft[0] >= hip[0] ? 1 : -1); ft = [hip[0] + dx, ft[1]]; } } L.ft = ft;
        const c = [ik(hip[0], hip[1], ft[0], ft[1], l1, l2, 1), ik(hip[0], hip[1], ft[0], ft[1], l1, l2, -1)];
        const info = c.map(r => { const t = nrm(sub(r.j, hip)), sv = nrm(sub(r.e, r.j)), nt = limbNormal(t, eDown, Vp), valid = dot(sv, nt) <= 0.2, above = r.j[1] <= surfaceY(sc, r.j[0]) + 1.5; return { r, valid, above, score: (valid ? 2 : 0) + (above ? 1 : 0) }; });
        let best = info[0].score >= info[1].score ? info[0] : info[1]; if (info[0].score === info[1].score) { const ref = L.kk || null; if (ref) best = Math.hypot(info[0].r.j[0] - ref[0], info[0].r.j[1] - ref[1]) <= Math.hypot(info[1].r.j[0] - ref[0], info[1].r.j[1] - ref[1]) ? info[0] : info[1]; else best = (L.b > 0 ? info[0] : info[1]); }
        if (L.force) best = (L.b > 0 ? info[0] : info[1]); knee = best.r.j; ankle = best.r.e; clampd = Math.hypot(ft[0] - hip[0], ft[1] - hip[1]) - (l1 + l2); }
      const dir = nrm(sub(ankle, knee)), onGround = Math.abs(dir[1]) > 0.45 && Math.abs(ankle[1] - (surfaceY(sc, ankle[0]) - 1.2)) < 3.2, toe = onGround ? [ankle[0] + (Vp[0] >= 0 ? 1 : -1) * 5.5, ankle[1] + 0.2] : [ankle[0] + dir[0] * 5.5, ankle[1] + dir[1] * 5.5], heel = onGround ? [ankle[0] - (Vp[0] >= 0 ? 1 : -1) * 2, ankle[1] + 0.8] : [ankle[0] - dir[0] * 2, ankle[1] - dir[1] * 2];
      const t = nrm(sub(knee, hip)), sh = nrm(sub(ankle, knee)), hipFlex = Math.atan2(dot(t, Vp), dot(t, eDown)) * 180 / Math.PI, kneeFlex = angBetween(t, sh), nt2 = limbNormal(t, eDown, Vp), wrongSide = !L.kneel && kneeFlex > 14 && dot(sh, nt2) > 0.25, thighLen = Math.hypot(knee[0] - hip[0], knee[1] - hip[1]), shinLen = Math.hypot(ankle[0] - knee[0], ankle[1] - knee[1]);
      const nm = far ? 'ขาข้างไกล' : 'ขาข้างใกล้';
      if (!L.kk && !L.wrap && !L.kneel && hipFlex > 150) warn.push(nm + ': สะโพกงอเกิน ' + Math.round(hipFlex) + '°'); if (!L.kk && !L.wrap && !L.kneel && hipFlex < -30) warn.push(nm + ': สะโพกแอ่นเกิน ' + Math.round(-hipFlex) + '°');
      if (kneeFlex > 150 && !(L && L.kneel)) warn.push(nm + ': เข่างอเกิน ' + Math.round(kneeFlex) + '°'); if (wrongSide) warn.push(nm + ': เข่างอย้อนทิศ'); if (clampd > 4) warn.push(nm + ': เอื้อมไม่ถึง ขาด ' + clampd.toFixed(1) + ' px');
      if (thighLen > 16 || shinLen > 15.5) warn.push(nm + ': กระดูกยาวเกิน (ต้นขา ' + thighLen.toFixed(1) + ' / แข้ง ' + shinLen.toFixed(1) + ')');
      return { hip, knee, ankle, toe, heel, far, hipFlex, kneeFlex, bad: wrongSide }; });
    const arms = [0, 1].map(i => { const R = (sp.arms || [])[i]; if (!R) return null; const far = i === 1, sh = [S[0] + (far ? -1.2 : 0), S[1] + 1]; { const dd = Math.hypot(R.h[0] - sh[0], R.h[1] - sh[1]), rc = LEN.up + LEN.fore - 0.3; if (dd > rc) { const sy = surfaceY(sc, R.h[0]); if (Math.abs(R.h[1] - sy) < 4.5) { const dy = R.h[1] - sh[1], dx = Math.sqrt(Math.max(0, rc * rc - dy * dy)) * (R.h[0] >= sh[0] ? 1 : -1); R.h = [sh[0] + dx, R.h[1]]; } } }
      const c = [ik(sh[0], sh[1], R.h[0], R.h[1], LEN.up, LEN.fore, 1), ik(sh[0], sh[1], R.h[0], R.h[1], LEN.up, LEN.fore, -1)], eArm = nrm(sub([hx, hy], S));
      const info = c.map((r, k) => { const t = nrm(sub(r.j, sh)), f2 = nrm(sub(r.e, r.j)), nu = limbNormal(t, eArm, V), valid = R.free ? true : dot(f2, nu) >= -0.25, above = r.j[1] <= surfaceY(sc, r.j[0]) + 4; return { r, valid, above, score: (valid ? 2 : 0) + (above ? 1 : 0), k }; });
      let best = info[0].score >= info[1].score ? info[0] : info[1]; if (info[0].score === info[1].score) best = R.b > 0 ? info[0] : info[1]; if (R.free) best = R.b > 0 ? info[0] : info[1]; const pick = best.r, reach = Math.hypot(R.h[0] - sh[0], R.h[1] - sh[1]) - (LEN.up + LEN.fore), t = nrm(sub(pick.j, sh)), f2 = nrm(sub(pick.e, pick.j)), elbowFlex = angBetween(t, f2), nm = far ? 'แขนข้างไกล' : 'แขนข้างใกล้';
      if (reach > 6) warn.push(nm + ': เอื้อมไม่ถึง ขาด ' + reach.toFixed(1) + ' px'); if (elbowFlex > 158 && !R.free) warn.push(nm + ': ข้อศอกงอเกิน');
      const tipDir = nrm(sub(pick.e, pick.j)); return { shoulder: sh, elbow: pick.j, wrist: pick.e, tip: [pick.e[0] + tipDir[0] * 4, pick.e[1] + tipDir[1] * 4], far, elbowFlex }; });
    const dA = [a[1] - a[0], a[2] - a[1]]; if (Math.abs(dA[0]) > 42) warn.push('หลัง: เอวกับอกบิดต่างกัน ' + Math.round(dA[0]) + '°'); if (Math.abs(dA[1]) > 48) warn.push('คอ: ศีรษะงอต่างจากอก ' + Math.round(dA[1]) + '°');
    return { P0: [hx, hy], L1, S, N, Hd, V, Vp, legs, arms, warn, f: ff };
  }
  function surfaceY(sc, x) { return sc === 'bed' ? 53 : sc === 'edge' ? (x < 66 ? 49 : 62) : sc === 'chair' ? 62 : 70; }
  function analyze(spec) { const out = []; ['him', 'her'].forEach(who => { const J = solveFigure(spec[who], spec.sc), nm = who === 'her' ? 'เธอ' : 'เขา'; J.warn.forEach(w => out.push(nm + ' · ' + w)); const pts = [[J.Hd, 'ศีรษะ']]; J.legs.forEach(l => { if (l) { pts.push([l.knee, 'เข่า'], [l.ankle, 'ข้อเท้า'], [l.toe, 'ปลายเท้า']); } }); J.arms.forEach(r => { if (r) pts.push([r.wrist, 'ข้อมือ'], [r.elbow, 'ศอก']); });
      let touch = false; pts.forEach(([p, jn]) => { const sy = surfaceY(spec.sc, p[0]); if (p[1] > sy + (jn === 'ศอก' ? 5.5 : 2.5) && spec.sc !== 'wall') out.push(nm + ' · ' + jn + 'ทะลุพื้น (x=' + Math.round(p[0]) + ', y=' + Math.round(p[1]) + ' พื้นที่ ' + sy + ')'); if (Math.abs(p[1] - sy) <= 4.5) touch = true; }); if (Math.abs(J.P0[1] - sy0(spec)) <= 8) touch = true; const other = spec[who === 'her' ? 'him' : 'her']; const close = Math.hypot(other.x - spec[who].x, other.y - spec[who].y) < 16; if (!touch && !close) out.push(nm + ' · ลอย ไม่มีจุดรับน้ำหนัก'); }); return out; }
  function sy0(spec) { return surfaceY(spec.sc, 60); }
  /* ---------- drawing ---------- */
  function ctxFor(g) { const px = (x, y, k) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y * W + x] = k; }; const rect = (x, y, w, h, k) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, k); }; const disc = (cx, cy, r, k) => { const R = Math.ceil(r); for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) if (i * i + j * j <= r * r + 0.35) px(cx + i, cy + j, k); }; const cap = (x0, y0, x1, y1, r0, r1, k, sh, soft) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5)); if (sh !== undefined) for (let i = 0; i <= n; i++) { const u = i / n; disc(x0 + (x1 - x0) * u + (soft ? 0.8 : 0), y0 + (y1 - y0) * u + (soft ? 0.8 : 0), r0 + (r1 - r0) * u + (soft ? 0 : 0.95), sh); } for (let i = 0; i <= n; i++) { const u = i / n; disc(x0 + (x1 - x0) * u - 0.2, y0 + (y1 - y0) * u - 0.2, r0 + (r1 - r0) * u, k); } }; return { px, rect, disc, cap }; }
  function scene(c, kind, t) {
    const { px, rect, disc } = c; rect(0, 0, W, 54, 2); for (let x = 0; x < W; x += 16) rect(x, 6, 1, 48, 3); rect(0, 54, W, 26, 1); rect(0, 70, W, 1, 0);
    if (kind === 'bed') { rect(2, 14, 8, 50, 21); rect(2, 14, 8, 2, 18); rect(0, 62, 118, 6, 21); rect(2, 53, 108, 9, 14); rect(2, 60, 108, 2, 15); }
    else if (kind === 'edge') { rect(0, 54, W, 8, 1); rect(0, 49, 66, 4, 14); rect(0, 53, 66, 9, 15); rect(0, 62, W, 18, 1); rect(0, 62, W, 1, 0); }
    else if (kind === 'chair') { rect(0, 62, W, 18, 1); rect(0, 62, W, 1, 0); rect(30, 49, 26, 3, 21); rect(30, 52, 3, 10, 21); rect(53, 52, 3, 10, 21); rect(30, 25, 3, 26, 21); }
    else { rect(0, 70, W, 10, 1); if (kind === 'wall') rect(96, 0, 32, 70, 3); if (kind === 'table') { rect(70, 42, 40, 3, 21); rect(72, 45, 3, 25, 21); rect(105, 45, 3, 25, 21); } }
    disc(112, 14, 4, 22); for (let y = 6; y < 28; y++) for (let x = 100; x < 124; x++) if ((x + y) % 3 === 0 && Math.hypot(x - 112, y - 14) < 12 && kind !== 'wall') px(x, y, 3);
  }
  function person(c, sp, who, st, sc0) { // st: {e, lag, outfit}
    const { px, rect, disc, cap } = c, her = who === 'her', SK = her ? SKH : SKM, SKS = her ? SKHS : SKMS, ff = sp.f, hx = sp.x, hy = sp.y, a = sp.a || [10, 20, 20];
    const L1 = P(hx, hy, LEN.lum, a[0], ff), S = P(L1[0], L1[1], LEN.tho, a[1], ff), N = P(S[0], S[1], LEN.neck, a[2], ff), Hd = P(N[0], N[1], 5.2, a[2] + 5, ff), hairK = her ? 8 : 9, shade = (far) => far ? (her ? SKS : 7) : SKS;
    const J = solveFigure(sp, sc0);
    const leg = (Lg, far) => { if (!Lg) return; const kc = far ? SKS : SK, ks = far ? 7 : SKS; cap(Lg.hip[0], Lg.hip[1], Lg.knee[0], Lg.knee[1], 4.2, 3.1, kc, ks); cap(Lg.knee[0], Lg.knee[1], Lg.ankle[0], Lg.ankle[1], 3.1, 2.1, kc, ks); disc(Lg.knee[0], Lg.knee[1], 2.9, kc); cap(Lg.ankle[0], Lg.ankle[1], Lg.toe[0], Lg.toe[1], 1.9, 1.4, kc); };
    const armf = (R, far) => { if (!R) return; const kc = far ? SKS : SK, ks = far ? 7 : SKS; cap(R.shoulder[0], R.shoulder[1], R.elbow[0], R.elbow[1], 2.6, 2.1, kc, ks); cap(R.elbow[0], R.elbow[1], R.wrist[0], R.wrist[1], 2.1, 1.8, kc, ks); disc(R.wrist[0], R.wrist[1], 1.7, kc); };
    const L = J.legs, Ar = J.arms;
    leg(L[1], true); armf(Ar[1], true);
    disc(hx, hy, her ? 5.6 : 5.5, SK); cap(hx, hy, L1[0], L1[1], her ? 4.6 : 5, her ? 3.9 : 4.4, SK, SKS, true); cap(L1[0], L1[1], S[0], S[1], her ? 3.9 : 4.4, her ? 4.6 : 5.4, SK, SKS, true);
    if (her) { const bx = (L1[0] + S[0]) / 2 + ff * 3.6 * (sp.prone ? -1 : 1), by = (L1[1] + S[1]) / 2 - 0.5; disc(bx, by, 3.3, SK); px(bx + ff * 2.5, by + 2, SKS); if (st.outfit === 'dress') { cap(hx, hy, S[0], S[1], 4.8, 4.8, 16, 17); disc(bx, by, 3.4, 16); } else if (st.outfit === 'half') { cap(S[0], S[1] + 1, S[0] - ff * 2, S[1] + 3, 4.6, 4.6, 16, 17); } }
    leg(L[0], false); armf(Ar[0], false);
    cap(S[0], S[1], N[0], N[1], 2, 2, SK); disc(Hd[0], Hd[1], 4.7, SK);
    const hmode = sp.face || (sp.prone ? 'profile' : a[1] >= 70 ? 'up' : 'profile'); if (hmode === 'profile') { if (her) { cap(Hd[0] - ff * 2, Hd[1] - 1, Hd[0] - ff * 6 + Math.round(st.lag * 2), Hd[1] + 11, 3.2, 2.6, hairK); rect(Math.round(Hd[0] - 5), Math.round(Hd[1] - 6), 11, 3, hairK); disc(Hd[0] - ff, Hd[1] - 3, 4, hairK); } else { rect(Math.round(Hd[0] - 5), Math.round(Hd[1] - 6), 11, 3, hairK); disc(Hd[0] - ff * 1, Hd[1] - 3, 3.6, hairK); } } else if (!her) { disc(Hd[0] + (hmode === 'up' ? ff * 2.5 : -ff * 2), Hd[1] + (hmode === 'up' ? 0 : -3), 3.6, hairK); }
    const horiz = a[1] >= 70, mode = sp.face || (sp.prone ? 'profile' : horiz ? 'up' : 'profile'), F = mode === 'up' ? [0, -1] : mode === 'down' ? [0.4 * ff, 0.9] : [ff, 0], U = mode === 'up' ? [ff, 0] : mode === 'down' ? [-0.9 * ff, 0.4] : [0, -1], at = (fa, ub) => [Hd[0] + F[0] * fa + U[0] * ub, Hd[1] + F[1] * fa + U[1] * ub], e = her ? st.e : 0;
    if (her && mode !== 'profile') { if (mode === 'up') cap(Hd[0], Hd[1] + 1, Hd[0] + U[0] * 11, Hd[1] + 3, 3.4, 2.8, hairK); else cap(Hd[0], Hd[1], Hd[0] + 1, Hd[1] + 10, 3.2, 2.4, hairK); disc(Hd[0] + U[0] * 2.5 - F[0] * 0.5, Hd[1] + U[1] * 2.5 - F[1] * 0.5, 3.6, hairK); }
    const nose = at(5, -1.2); px(nose[0], nose[1], SK); const eye = at(2, -0.3), ey2 = at(2, 1.2);
    if (e === 0) { px(eye[0], eye[1], 11); } else if (e === 1) { px(eye[0], eye[1], 11); px(ey2[0], ey2[1], 11); } else { px(eye[0], eye[1], 11); px(ey2[0], ey2[1], 11); px(at(1, 0.5)[0], at(1, 0.5)[1], 11); }
    if (her && e >= 1) { const ch = at(1, -2.2); px(ch[0], ch[1], 12); const ch2 = at(0, -2.2); px(ch2[0], ch2[1], 12); }
    const mo = at(3, -3.2); if (e === 2) { rect(Math.round(mo[0]), Math.round(mo[1]), 2, 2, 11); px(mo[0], mo[1] + 1, 13); } else if (e === 1) { px(mo[0], mo[1], 13); px(at(2, -3.2)[0], at(2, -3.2)[1], 13); } else px(mo[0], mo[1], SKS);
    return { Hd, S };
  }
  /* ---------- catalogue ---------- */
  const POSES = []; const add = (id, t, g, sc, fn) => POSES.push({ id, t, g, sc, fn });
  const him0 = () => Object.assign(lie(54, 49.5, -1), { legs: legX(54, 49.5, 82, 51.5, 1, 83, 51, 1), arms: arm(22, 44, -1) });
  const himKU = () => Object.assign(lie(54, 49.5, -1), { legs: legX(54, 49.5, 66, 52.5, -1, 68, 52.5, -1), arms: arm(22, 44, -1) });
  const hold = (hx, hy) => arm(hx, hy, 1); // his hands on her hips
  // --- A: she on top, he lies on his back
  const cow = (o) => (t) => { const h = o.him ? o.him() : him0(); const x = o.x || 57, y = (o.y || 41), her = { x, y, f: o.f || -1, a: o.a, legs: o.legs || legK(x, o.f || -1), arms: o.arms, prone: o.prone, face: o.face }; if (o.hhand) h.arms = o.hhand(x, y); return { sc: 'bed', her, him: h, mover: 'her', axis: o.axis || [0.15, 1], sheet: [66, 100] }; };
  add('A-face-thighs', 'คร่อมหันหน้า มือวางที่ต้นขาตัวเอง', 'บนตัวเขา', 'bed', cow({ a: [4, 8, 8], arms: arm(53, 46, 1) }));
  add('A-face-behind-head', 'คร่อมหันหน้า มือประสานหลังศีรษะ', 'บนตัวเขา', 'bed', cow({ a: [2, 4, 0], arms: [{ h: [60, 17], b: -1, free: true }, { h: [58, 18], b: -1, free: true }] }));
  add('A-face-clasped', 'คร่อมหันหน้า จับมือเขาโน้มตัว', 'บนตัวเขา', 'bed', cow({ a: [12, 24, 22], arms: arm(41, 47, 1), hhand: (x, y) => arm(41, 46, -1) }));
  add('A-face-his-hips', 'คร่อมหันหน้า เขาจับสะโพก', 'บนตัวเขา', 'bed', cow({ a: [6, 12, 12], arms: arm(50, 44, 1), hhand: (x, y) => arm(x - 3, y + 3, -1) }));
  add('A-face-shoulders', 'คร่อมหันหน้า มือยันไหล่เขา', 'บนตัวเขา', 'bed', cow({ a: [16, 30, 28], arms: arm(38, 46, 1) }));
  add('A-face-arch-knees', 'คร่อมหันหน้า เอนหลังมือยันเข่าเขา (เขาชันเข่า)', 'บนตัวเขา', 'bed', cow({ him: himKU, x: 52, y: 38, a: [-12, -30, -22], arms: arm(64, 41, 1) }));
  add('A-face-one-knee', 'คร่อมหันหน้า ตั้งเข่าข้างหนึ่ง', 'บนตัวเขา', 'bed', cow({ a: [8, 16, 14], legs: [{ kneel: true, k: [54, 51], a: [68, 52.5] }, { ft: [59, 52.8], b: 1, l1: 10, l2: 14 }], arms: arm(47, 44.5, 1) }));
  add('A-face-feet-leanback', 'นั่งยองเอนหลังมือยันต้นขาเขาด้านหลัง', 'บนตัวเขา', 'bed', cow({ x: 56, y: 37, a: [-10, -24, -20], legs: legP(56, 37, -1, -3, 52.8, 1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: arm(70, 47, 1) }));
  add('A-squat-knees', 'นั่งยอง มือเท้าเข่าตัวเอง', 'บนตัวเขา', 'bed', cow({ x: 59, y: 37, a: [14, 26, 22], legs: legP(59, 37, -1, 3, 52.8, 1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: [{ h: [49, 43], b: 1 }, { h: [51, 43], b: 1 }] }));
  add('A-squat-lean', 'นั่งยอง โน้มตัวมือยันอกเขา', 'บนตัวเขา', 'bed', cow({ x: 59, y: 38, a: [20, 36, 32], legs: legP(59, 38, -1, 3, 52.8, 1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: arm(46, 44.5, 1) }));
  add('A-squat-upright-hair', 'นั่งยอง ยืดตัว มือเสยผม', 'บนตัวเขา', 'bed', cow({ x: 59, y: 36, a: [2, 4, 0], legs: legP(59, 36, -1, 3, 52.8, 1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: [{ h: [58, 14], b: -1, free: true }, { h: [60, 15], b: -1, free: true }] }));
  add('A-kiss', 'นอนทับ จูบ', 'บนตัวเขา', 'bed', cow({ x: 62, y: 44, a: [52, 76, 70], legs: legK(62, -1), arms: [{ h: [34, 52.5], b: -1 }, { h: [31, 52.5], b: -1 }], axis: [0.3, 1], face: 'down' }));
  add('A-neck', 'นอนทับ ซบซอกคอ', 'บนตัวเขา', 'bed', cow({ x: 62, y: 44, a: [60, 82, 80], legs: legK(62, -1), arms: [{ h: [40, 49], b: -1 }, { h: [36, 51], b: -1 }], axis: [0.3, 1], face: 'down' }));
  add('A-forearms', 'นอนทับ ยันศอกสองข้างศีรษะเขา', 'บนตัวเขา', 'bed', cow({ x: 61, y: 43, a: [44, 66, 60], legs: legK(61, -1), arms: [{ h: [30, 52.5], b: -1 }, { h: [27, 52.5], b: -1 }], axis: [0.3, 1], face: 'down' }));
  add('A-chest-to-chest', 'นอนทับตัวเขา ขาชิดกัน', 'บนตัวเขา', 'bed', cow({ x: 60, y: 45, a: [70, 84, 82], legs: legX(60, 45, 90, 50, 1), arms: [{ h: [38, 51], b: -1 }, { h: [35, 52], b: -1 }], axis: [0.5, 0.5], face: 'down' }));
  add('A-back-thighs', 'คร่อมหันหลัง มือวางต้นขาตัวเอง', 'บนตัวเขา', 'bed', cow({ f: 1, x: 56, a: [8, 12, 10], legs: legK(56, 1), arms: arm(62, 46, -1) }));
  add('A-back-shins', 'คร่อมหันหลัง โน้มตัวมือยันหน้าแข้งเขา', 'บนตัวเขา', 'bed', cow({ f: 1, x: 56, a: [30, 48, 42], legs: legK(56, 1), arms: arm(80, 51, -1) }));
  add('A-back-far', 'คร่อมหันหลัง โน้มไปข้างหน้ามากสุด', 'บนตัวเขา', 'bed', cow({ f: 1, x: 56, y: 42, a: [48, 66, 58], legs: legK(56, 1), arms: arm(84, 52, -1) }));
  add('A-back-squat', 'หันหลัง นั่งยอง', 'บนตัวเขา', 'bed', cow({ f: 1, x: 55, y: 37, a: [12, 22, 20], legs: legP(55, 37, 1, 3, 52.8, -1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: arm(66, 45, -1) }));
  add('A-back-squat-lean', 'หันหลัง นั่งยอง โน้มหน้า', 'บนตัวเขา', 'bed', cow({ f: 1, x: 55, y: 39, a: [30, 46, 40], legs: legP(55, 39, 1, 3, 52.8, -1).map(l => Object.assign(l, { l1: 10, l2: 14 })), arms: arm(76, 46, -1) }));
  add('A-back-lie', 'หันหลัง เอนหลังพิงอกเขา', 'บนตัวเขา', 'bed', cow({ f: 1, x: 58, y: 44, a: [-50, -72, -70], legs: legK(58, 1), arms: [{ h: [52, 46], b: 1, free: true }, { h: [54, 46], b: 1, free: true }], him: () => Object.assign(lie(54, 49.5, -1, [60, 70, 72]), { legs: legX(54, 49.5, 88, 52, 1), arms: arm(52, 46, -1) }), axis: [0.3, 1] }));
  add('A-back-hands-head', 'หันหลัง มือประสานหลังศีรษะ', 'บนตัวเขา', 'bed', cow({ f: 1, x: 56, a: [-4, -8, -6], legs: legK(56, 1), arms: [{ h: [52, 16], b: 1, free: true }, { h: [54, 17], b: 1, free: true }] }));
  add('A-back-one-knee', 'หันหลัง ตั้งเข่าข้างหนึ่ง', 'บนตัวเขา', 'bed', cow({ f: 1, x: 56, a: [14, 22, 20], legs: [{ kneel: true, k: [60, 51], a: [46, 52.5] }, { ft: [52, 52.8], b: -1, l1: 10, l2: 14 }], arms: arm(70, 45, -1) }));
  // --- B: seated and lap
  const sit = (x, y) => Object.assign(lie(x, y, -1, [4, 6, 8]), { legs: legX(x, y, x + 32, 52, 1), arms: arm(x - 8, 40, 1) });
  const lapHim = () => Object.assign(lie(31, 52, 1, [-4, -6, -6]), { legs: legX(31, 52, 56, 53, 1, 57, 52.5, 1), arms: arm(44, 42, 1) });
  const lap = (o) => (t) => { const him = lapHim(); const her = { x: 45, y: 46, f: -1, a: o.a || [6, 12, 12], legs: o.legs || [{ k: [40, 51], a: [36, 52.6] }, { k: [42.5, 49.6], a: [37, 51.2] }], arms: o.arms || arm(29, 33.5, -1) }; if (o.hhand) him.arms = o.hhand; if (o.him) Object.assign(him, o.him); return { sc: 'bed', her, him, mover: 'her', axis: [0.2, 1], sheet: null, gap: 15 }; };
  add('B-lap-lotus', 'นั่งตัก ไขว้ขาโอบเอวเขา', 'นั่งและตัก', 'bed', lap({ legs: [{ k: [41, 51], a: [35, 52] }, { k: [43, 49], a: [34, 50.5] }] }));
  add('B-lap-leanback', 'นั่งตัก เอนหลัง เขาประคองหลัง', 'นั่งและตัก', 'bed', lap({ a: [-16, -30, -28], arms: arm(52, 38, 1), hhand: arm(48, 42, 1) }));
  add('B-lap-kiss', 'นั่งตัก จูบ', 'นั่งและตัก', 'bed', lap({ a: [8, 16, 18], arms: arm(30, 28, -1) }));
  add('B-lap-reverse', 'นั่งตักหันหลัง พิงอกเขา', 'นั่งและตัก', 'bed', (t) => ({ sc: 'bed', her: { x: 40, y: 47, f: 1, a: [-10, -18, -16], legs: legX(40, 47, 60, 53, -1, 62, 52, -1), arms: arm(55, 44, -1) }, him: lapHim(), mover: 'her', axis: [0.2, 1] }));
  add('B-lap-reverse-lean', 'นั่งตักหันหลัง โน้มหน้ามือยันเข่า', 'นั่งและตัก', 'bed', (t) => ({ sc: 'bed', her: { x: 42, y: 46, f: 1, a: [22, 34, 30], legs: legX(42, 46, 62, 53, -1), arms: arm(58, 49, -1) }, him: lapHim(), mover: 'her', axis: [0.2, 1] }));
  add('B-lap-kneel', 'นั่งตัก คุกเข่าตัวตรง', 'นั่งและตัก', 'bed', lap({ x: 0, a: [4, 8, 8], legs: [{ kneel: true, k: [40, 51], a: [54, 52.5] }, { kneel: true, k: [42, 49.5], a: [56, 51.5] }], arms: arm(29, 32, -1) }));
  add('B-lap-side', 'นั่งตัก นั่งตะแคง', 'นั่งและตัก', 'bed', lap({ a: [4, 8, 8], legs: legK(45, -1, 46), arms: arm(32, 34, -1) }));
  const chairHim = () => Object.assign(lie(43, 44, 1, [-4, -6, -6]), { legs: [{ k: [58, 45.5], a: [58, 60] }, { k: [59, 44.5], a: [59, 59] }], arms: arm(50, 40, -1) });
  const chairLegs = (x, f, y) => [{ kneel: true, k: [x + f * 4, y || 46.5], a: [x - f * 9, (y || 46.5) + 1.5] }, { kneel: true, k: [x + f * 4 + 2, (y || 46.5) - 1.5], a: [x - f * 9 + 2, y || 46.5] }];
  add('B-chair-face', 'บนเก้าอี้ หันหน้า', 'นั่งและตัก', 'chair', () => ({ sc: 'chair', her: { x: 47, y: 36, f: -1, a: [8, 14, 14], legs: chairLegs(47, -1), arms: arm(36, 28, -1) }, him: chairHim(), mover: 'her', axis: [0.1, 1], gap: 12 }));
  add('B-chair-reverse', 'บนเก้าอี้ หันหลัง', 'นั่งและตัก', 'chair', () => ({ sc: 'chair', her: { x: 47, y: 36, f: 1, a: [10, 18, 16], legs: chairLegs(47, 1), arms: arm(60, 47, -1) }, him: chairHim(), mover: 'her', axis: [0.1, 1], gap: 12 }));
  add('B-chair-leanback', 'บนเก้าอี้ เอนหลังพิงเขา', 'นั่งและตัก', 'chair', () => ({ sc: 'chair', her: { x: 47, y: 36, f: 1, a: [-14, -26, -24], legs: chairLegs(47, 1), arms: arm(52, 36, -1) }, him: chairHim(), mover: 'her', axis: [0.1, 1], gap: 12 }));
  const edgeHim = () => Object.assign(lie(52, 44, 1, [-2, -4, -4]), { legs: [{ k: [67, 45.5], a: [67, 60] }, { k: [68, 44.5], a: [68, 59] }], arms: arm(60, 44, -1) });
  add('B-edge-face', 'ปลายเตียง หันหน้า', 'นั่งและตัก', 'edge', () => ({ sc: 'edge', her: { x: 54, y: 36, f: -1, a: [6, 12, 12], legs: [{ kneel: true, k: [50, 46], a: [62, 47.5] }, { kneel: true, k: [52, 44.5], a: [64, 46] }], arms: arm(42, 28, -1) }, him: edgeHim(), mover: 'her', axis: [0.1, 1], gap: 12 }));
  add('B-edge-reverse', 'ปลายเตียง หันหลัง', 'นั่งและตัก', 'edge', () => ({ sc: 'edge', her: { x: 54, y: 36, f: 1, a: [8, 14, 12], legs: [{ kneel: true, k: [58, 46], a: [46, 47.5] }, { kneel: true, k: [60, 44.5], a: [48, 46] }], arms: arm(66, 46, -1) }, him: edgeHim(), mover: 'her', axis: [0.1, 1], gap: 12 }));
  add('B-edge-she-sits', 'เธอนั่งขอบเตียง เขายืนระหว่างขา', 'นั่งและตัก', 'edge', () => ({ sc: 'edge', her: { x: 50, y: 44, f: 1, a: [-14, -24, -22], legs: [{ k: [64, 46], a: [64, 60.5] }, { k: [66, 45], a: [66, 59.5] }], arms: arm(40, 46, 1) }, him: { x: 72, y: 32.5, f: -1, a: [14, 26, 24], legs: legX(72, 32.5, 74, 62, -1, 76, 62, -1), arms: arm(60, 40, 1) }, mover: 'him', axis: [1, 0], gap: 20 }));
  // --- C: he on top, she lies on her back (her legs given as knee + ankle points: hip flexion, then the shin, so they read anatomically)
  const KA = (kx, ky, ax, ay) => ({ k: [kx, ky], a: [ax, ay] });
  const herLie = (legs, arms, a) => Object.assign(lie(54, 49.5, -1, a), { legs, arms });
  const miss = (o) => () => ({ sc: 'bed', her: herLie(o.legs, o.arms || arm(22, 44, -1), o.herA), him: Object.assign({ x: o.hx || 62, y: o.hy || 43, f: -1, a: o.a || [34, 56, 50], legs: legK(o.hx || 62, -1), arms: [{ h: [34, 52.5], b: -1 }, { h: [31, 52.5], b: -1 }] }, o.him || {}), mover: 'him', axis: [0.8, 0.5] });
  add('C-wrap', 'ท่ามิชชันนารี เธอใช้ขาโอบเอว', 'เขาอยู่ข้างบน', 'bed', miss({ legs: [KA(62, 38, 70, 47), KA(64, 40, 71.5, 48.5)] }));
  add('C-apart', 'เธอกางเข่าขึ้น เท้าราบ', 'เขาอยู่ข้างบน', 'bed', miss({ legs: [KA(66, 41, 76, 52), KA(62, 44, 72, 52.5)] }));
  add('C-shoulder', 'ยกขาพาดไหล่เขา', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 64, hy: 41, a: [20, 36, 30], legs: [{ ft: [58, 26], force: false }, KA(64, 44, 76, 52)], him: { arms: [{ h: [38, 52], b: -1 }, { h: [35, 52], b: -1 }] } }));
  add('C-knees-chest', 'ชันเข่าชิดอก', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 62, hy: 41, a: [24, 40, 36], legs: [KA(58, 35, 66, 42), KA(60, 37, 68, 43.5)] }));
  add('C-pillow', 'หนุนสะโพกด้วยหมอน', 'เขาอยู่ข้างบน', 'bed', miss({ hy: 41, legs: [KA(64, 40, 74, 48), KA(66, 42, 76, 50)], herA: [80, 88, 90] }));
  add('C-ankles', 'ไขว้ข้อเท้าที่หลังเขา', 'เขาอยู่ข้างบน', 'bed', miss({ legs: [KA(61, 37, 69, 46), KA(63, 39, 69, 46.5)] }));
  add('C-straight', 'ขาชิดเหยียดตรง', 'เขาอยู่ข้างบน', 'bed', miss({ legs: legX(54, 49.5, 86, 52, 1), hx: 66, hy: 44 }));
  add('C-one-shoulder', 'ยกขาข้างเดียวพาดไหล่', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 63, hy: 42, legs: [{ ft: [62, 25] }, KA(66, 44, 76, 52)] }));
  add('C-low', 'เขาก้มต่ำ ศอกยันที่นอน', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 63, hy: 45, a: [56, 76, 72], legs: [KA(64, 43, 74, 51), KA(62, 45, 72, 52.5)], him: { arms: [{ h: [34, 52], b: -1 }, { h: [31, 52], b: -1 }] } }));
  add('C-pushup', 'เขายันแขนตรง', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 66, hy: 40, a: [20, 32, 28], legs: [KA(62, 38, 70, 47), KA(64, 40, 71.5, 48.5)], him: { arms: [{ h: [38, 52], b: -1 }, { h: [36, 52], b: -1 }] } }));
  add('C-kneel-hips', 'เขาคุกเข่าตัวตรง ยกสะโพกเธอวางบนต้นขา', 'เขาอยู่ข้างบน', 'bed', () => ({ sc: 'bed', her: herLie([KA(62, 38, 69, 45), KA(64, 40, 70, 46.5)], arm(22, 44, -1), [72, 84, 88]), him: { x: 68, y: 40, f: -1, a: [4, 8, 8], legs: legK(68, -1), arms: arm(58, 44, -1) }, mover: 'him', axis: [1, 0.3] }));
  add('C-hands-up', 'เธอยกมือเหนือศีรษะ', 'เขาอยู่ข้างบน', 'bed', miss({ legs: [KA(62, 38, 70, 47), KA(64, 40, 71.5, 48.5)], arms: arm(12, 46, 1) }));
  add('C-hug', 'เธอกอดหลังเขา', 'เขาอยู่ข้างบน', 'bed', miss({ legs: [KA(62, 38, 70, 47), KA(64, 40, 71.5, 48.5)], arms: arm(50, 44, -1), a: [46, 66, 60] }));
  add('C-wide', 'เธอกางขาออกกว้าง', 'เขาอยู่ข้างบน', 'bed', miss({ legs: [KA(68, 41, 80, 51), KA(63, 44, 77, 52.5)] }));
  add('C-bridge', 'เธอเกร็งแอ่นสะโพก', 'เขาอยู่ข้างบน', 'bed', miss({ herA: [70, 84, 88], legs: [KA(63, 38, 66, 52.5), KA(65, 40, 69, 52)] }));
  add('C-foot-chest', 'เท้าเธอยันอกเขา', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 64, hy: 42, a: [18, 32, 28], legs: [{ ft: [58, 33] }, KA(66, 44, 76, 52)] }));
  add('C-over-arms', 'เขาคล้องขาเธอไว้ที่แขน', 'เขาอยู่ข้างบน', 'bed', miss({ hx: 64, hy: 41, a: [26, 44, 38], legs: [KA(60, 35, 66, 42), KA(62, 37, 68, 43.5)] }));
  add('C-edge', 'เธอนอนที่ขอบเตียง เขายืน', 'เขาอยู่ข้างบน', 'edge', () => ({ sc: 'edge', her: { x: 58, y: 44.5, f: -1, a: [86, 90, 92], legs: [{ ft: [68, 40], k: [58, 37] }, { ft: [70, 42], k: [60, 39] }], arms: arm(26, 43, 1) }, him: { x: 72, y: 33, f: -1, a: [8, 14, 12], legs: legX(72, 33, 72, 62, -1, 74, 62, -1), arms: arm(62, 40, 1) }, mover: 'him', axis: [1, 0], gap: 18 }));
  // --- D: from behind
  const allf = (o) => () => { const x = o.x || 52, y = o.y || 36; return { sc: 'bed', her: { x, y, f: -1, a: o.a || [84, 88, 86], prone: true, legs: o.legs || [{ k: [x + 12, 50], a: [x + 26, 52.5] }, { k: [x + 14, 48.5], a: [x + 28, 51] }], arms: o.arms || [{ h: [x - 20, 52.5], b: 1 }, { h: [x - 22, 52.5], b: 1 }] }, him: o.him || { x: x + 22, y: 38, f: -1, a: [10, 18, 16], legs: legK(x + 22, -1), arms: arm(x + 8, 38, -1) }, mover: 'him', axis: [1, 0] }; };
  add('D-allfours', 'คุกเข่าสี่เท้า มือใต้ไหล่', 'จากด้านหลัง', 'bed', allf({}));
  add('D-elbows', 'ศอกยัน อกต่ำ สะโพกสูง', 'จากด้านหลัง', 'bed', allf({ a: [64, 74, 70], arms: [{ h: [30, 52.5], b: -1 }, { h: [28, 52.5], b: -1 }] }));
  add('D-prone', 'นอนคว่ำราบ', 'จากด้านหลัง', 'bed', () => ({ sc: 'bed', her: { x: 56, y: 49.5, f: -1, a: [88, 90, 90], prone: true, legs: legX(56, 49.5, 88, 52, 1), arms: [{ h: [26, 50.5], b: -1, free: true }, { h: [24, 50.5], b: -1, free: true }] }, him: { x: 72, y: 41, f: -1, a: [40, 60, 54], legs: legK(72, -1), arms: [{ h: [50, 46], b: -1 }, { h: [48, 47], b: -1 }] }, mover: 'him', axis: [0.8, 0.5] }));
  add('D-prone-pillow', 'นอนคว่ำ หมอนรองสะโพก', 'จากด้านหลัง', 'bed', () => ({ sc: 'bed', her: { x: 56, y: 46, f: -1, a: [80, 88, 90], prone: true, legs: legX(56, 46, 88, 52, 1), arms: arm(26, 52, 1) }, him: { x: 72, y: 39, f: -1, a: [34, 56, 50], legs: legK(72, -1), arms: [{ h: [50, 44], b: -1 }, { h: [48, 45], b: -1 }] }, mover: 'him', axis: [0.8, 0.5] }));
  add('D-arch', 'คุกเข่า แอ่นหลัง เงยหน้า', 'จากด้านหลัง', 'bed', allf({ a: [78, 84, 70] }));
  add('D-look-back', 'คุกเข่า หันมองข้างหลัง', 'จากด้านหลัง', 'bed', allf({ a: [84, 88, 60] }));
  add('D-leg-up', 'คุกเข่า ยกขาข้างหนึ่ง', 'จากด้านหลัง', 'bed', allf({ legs: [{ k: [64, 50], a: [78, 52.5] }, { ft: [74, 36], b: -1 }] }));
  add('D-kneel-up', 'คุกเข่าตัวตรงทั้งคู่ เธอเอนพิงเขา', 'จากด้านหลัง', 'bed', () => ({ sc: 'bed', her: { x: 54, y: 41, f: -1, a: [-6, -12, -10], legs: legK(54, -1), arms: arm(40, 34, 1) }, him: { x: 64, y: 41, f: -1, a: [4, 8, 8], legs: legK(64, -1), arms: arm(52, 32, -1) }, mover: 'him', axis: [1, 0.3] }));
  add('D-kneel-headboard', 'คุกเข่า มือยึดหัวเตียง', 'จากด้านหลัง', 'bed', () => ({ sc: 'bed', her: { x: 44, y: 41, f: -1, a: [6, 12, 12], legs: legK(44, -1), arms: [{ h: [10, 28], b: 1 }, { h: [11, 30], b: 1 }] }, him: { x: 58, y: 41, f: -1, a: [8, 14, 12], legs: legK(58, -1), arms: arm(48, 42, -1) }, mover: 'him', axis: [1, 0.3] }));
  const edgeBent = (o) => () => ({ sc: 'edge', her: Object.assign({ x: 76, y: 38, f: -1, a: [78, 92, 90], prone: true, legs: legX(76, 38, 78, 62, 1, 80, 62, 1), arms: arm(50, 47, 1) }, o.her || {}), him: { x: 86, y: 33, f: -1, a: [8, 12, 10], legs: legX(86, 33, 86, 62, -1, 88, 62, -1), arms: arm(74, 38, -1) }, mover: 'him', axis: [1, 0], gap: 14 });
  add('D-edge-bent', 'ก้มตัวบนขอบเตียง เขายืนด้านหลัง', 'จากด้านหลัง', 'edge', edgeBent({}));
  add('D-edge-onefoot', 'ก้มขอบเตียง ยกเท้าข้างหนึ่ง', 'จากด้านหลัง', 'edge', edgeBent({ her: { legs: [{ ft: [78, 62], b: 1 }, { ft: [90, 40], b: -1 }] } }));
  add('D-edge-kneel', 'คุกเข่าบนขอบเตียง เขายืน', 'จากด้านหลัง', 'edge', () => ({ sc: 'edge', her: { x: 58, y: 40, f: -1, a: [82, 88, 70], prone: true, legs: [{ kneel: true, k: [58, 47], a: [66, 48.5] }, { kneel: true, k: [60, 45.5], a: [68, 47] }], arms: arm(34, 47, 1) }, him: { x: 72, y: 33, f: -1, a: [8, 12, 10], legs: legX(72, 33, 72, 62, -1, 74, 62, -1), arms: arm(60, 38, -1) }, mover: 'him', axis: [1, 0], gap: 14 }));
  add('D-wall-bent', 'ก้มตัว มือยันกำแพง', 'จากด้านหลัง', 'wall', () => ({ sc: 'wall', her: { x: 58, y: 40, f: 1, a: [66, 76, 72], prone: true, legs: legX(58, 40, 52, 70, 1), arms: arm(94, 34, 1) }, him: { x: 42, y: 41, f: 1, a: [8, 12, 10], legs: legX(42, 41, 42, 70, -1), arms: arm(54, 41, 1) }, mover: 'him', axis: [1, 0] }));
  add('D-table', 'ก้มตัวคว่ำบนโต๊ะ', 'จากด้านหลัง', 'table', () => ({ sc: 'table', her: { x: 90, y: 41, f: 1, a: [80, 86, 84], prone: true, legs: legX(90, 41, 84, 70, 1), arms: arm(112, 44, 1) }, him: { x: 72, y: 41, f: 1, a: [8, 12, 10], legs: legX(72, 41, 72, 70, -1), arms: arm(84, 41, 1) }, mover: 'him', axis: [1, 0] }));
  // --- E: side-lying (both on their sides facing right; viewed from the side)
  const side = (o) => () => ({ sc: 'bed', her: Object.assign({ face: 'profile', sup: true, x: 58, y: 49, f: -1, a: [84, 88, 90], legs: [{ ft: [78, 50], b: 1 }, { ft: [80, 52], b: 1 }], arms: arm(28, 49, 1) }, o.her || {}), him: Object.assign({ face: 'profile', sup: true, x: 70, y: 49, f: -1, a: [84, 88, 90], legs: [{ ft: [92, 50], b: 1 }, { ft: [94, 52], b: 1 }], arms: arm(44, 46, -1) }, o.him || {}), mover: 'him', axis: [1, 0] });
  add('E-spoon', 'นอนตะแคงช้อนหลัง', 'นอนตะแคง', 'bed', side({}));
  add('E-spoon-leg', 'ช้อนหลัง เธอยกขาพาดขาเขา', 'นอนตะแคง', 'bed', side({ her: { legs: [{ ft: [74, 40], b: -1 }, { ft: [80, 52], b: 1 }] } }));
  add('E-spoon-hip', 'ช้อนหลัง เขากอดเอว', 'นอนตะแคง', 'bed', side({ him: { arms: arm(52, 44, -1) } }));
  add('E-spoon-curl', 'ช้อนหลัง เธอขดตัว', 'นอนตะแคง', 'bed', side({ her: { a: [70, 80, 86], legs: [{ ft: [70, 49], b: -1 }, { ft: [72, 51], b: -1 }] } }));
  add('E-scissor', 'ท่ากรรไกร ขาไขว้', 'นอนตะแคง', 'bed', () => ({ sc: 'bed', her: { sup: true, x: 54, y: 49.5, f: -1, a: [88, 90, 90], legs: [{ ft: [76, 52], b: 1 }, { ft: [74, 44], b: -1 }], arms: arm(24, 50, 1) }, him: { sup: true, x: 68, y: 49.5, f: 1, a: [88, 90, 90], legs: [{ ft: [58, 42], b: -1 }, { ft: [52, 48], b: -1 }], arms: arm(78, 47, -1) }, mover: 'him', axis: [1, 0] }));
  add('E-her-on-arm', 'นอนตะแคง ศีรษะหนุนแขนเขา', 'นอนตะแคง', 'bed', side({ her: { arms: arm(26, 47, 1) }, him: { arms: arm(34, 48, -1) } }));
  add('E-leg-over', 'นอนตะแคง เธอพาดขาเหนือสะโพกเขา', 'นอนตะแคง', 'bed', () => ({ sc: 'bed', her: { sup: true, x: 58, y: 49, f: -1, a: [84, 88, 90], legs: [{ ft: [70, 40], b: -1 }, { ft: [74, 52], b: 1 }], arms: [{ h: [42, 46], b: -1, free: true }, { h: [40, 46], b: -1, free: true }] }, him: { sup: true, x: 66, y: 49, f: 1, a: [84, 88, 90], legs: legX(66, 49, 52, 52, 1), arms: arm(76, 44, 1) }, mover: 'him', axis: [1, 0] }));
  // --- F: standing
  const standFace = (o) => () => ({ sc: o.sc || 'floor', her: Object.assign({ x: 54, y: 41, f: 1, a: [4, 8, 8], legs: legX(54, 41, 54, 70, -1), arms: arm(66, 28, 1) }, o.her || {}), him: Object.assign({ x: 64, y: 41, f: -1, a: [4, 8, 8], legs: legX(64, 41, 66, 70, 1), arms: arm(54, 42, -1) }, o.him || {}), mover: 'him', axis: [1, 0] });
  add('F-face', 'ยืนหันหน้ากอดกัน', 'ยืน', 'floor', standFace({}));
  add('F-lift', 'เขาอุ้มเธอ เธอเกี่ยวขาโอบเอว', 'ยืน', 'floor', () => ({ sc: 'floor', her: { x: 55, y: 36, f: 1, a: [4, 8, 8], legs: legX(55, 36, 66, 36, 1, 68, 35, 1), arms: arm(66, 22, 1) }, him: { x: 64, y: 41, f: -1, a: [2, 4, 4], legs: legX(64, 41, 66, 70, 1), arms: arm(54, 40, -1) }, mover: 'him', axis: [0.2, 1] }));
  add('F-wall-lift', 'พิงกำแพง เขาอุ้มเธอ', 'ยืน', 'wall', () => ({ sc: 'wall', her: { x: 92, y: 36, f: -1, a: [-4, -8, -8], legs: legX(92, 36, 80, 36, -1, 78, 35, -1), arms: arm(84, 22, -1) }, him: { x: 80, y: 41, f: 1, a: [2, 4, 4], legs: legX(80, 41, 78, 70, -1), arms: arm(90, 40, 1) }, mover: 'him', axis: [1, 0.2] }));
  add('F-wall-leg', 'พิงกำแพง เขาประคองขาเธอข้างหนึ่ง', 'ยืน', 'wall', () => ({ sc: 'wall', her: { x: 92, y: 41, f: -1, a: [-4, -8, -8], legs: [{ ft: [82, 34], b: -1 }, { ft: [90, 70], b: 1 }], arms: arm(80, 26, -1) }, him: { x: 80, y: 41, f: 1, a: [4, 8, 8], legs: legX(80, 41, 76, 70, -1), arms: arm(84, 36, 1) }, mover: 'him', axis: [1, 0] }));
  add('F-back-hug', 'ยืนกอดจากด้านหลัง', 'ยืน', 'floor', () => ({ sc: 'floor', her: { x: 56, y: 41, f: -1, a: [-2, -4, -4], legs: legX(56, 41, 58, 70, 1), arms: arm(46, 42, 1) }, him: { x: 64, y: 41, f: -1, a: [4, 8, 8], legs: legX(64, 41, 66, 70, 1), arms: arm(52, 36, -1) }, mover: 'him', axis: [1, 0] }));
  add('F-sit-counter', 'เธอนั่งบนโต๊ะ เขายืนระหว่างขา', 'ยืน', 'table', () => ({ sc: 'table', her: { x: 90, y: 38, f: -1, a: [-10, -18, -16], legs: [{ ft: [76, 40], b: -1 }, { ft: [78, 38], b: -1 }], arms: arm(104, 38, 1) }, him: { x: 76, y: 41, f: 1, a: [4, 8, 8], legs: legX(76, 41, 74, 70, -1), arms: arm(86, 36, 1) }, mover: 'him', axis: [1, 0] }));
  add('F-wall-kiss', 'พิงกำแพง จูบ เท้าเธอยกขึ้นพาดเขา', 'ยืน', 'wall', () => ({ sc: 'wall', her: { x: 92, y: 41, f: -1, a: [-4, -8, -6], legs: [{ ft: [80, 44], b: -1 }, { ft: [90, 70], b: 1 }], arms: arm(82, 24, -1) }, him: { x: 80, y: 41, f: 1, a: [6, 12, 12], legs: legX(80, 41, 76, 70, -1), arms: arm(90, 38, 1) }, mover: 'him', axis: [0.8, 0] }));
  add('F-chair-bent', 'ยืนก้มพิงพนักเก้าอี้', 'ยืน', 'chair', () => ({ sc: 'chair', her: { x: 44, y: 33, f: -1, a: [62, 74, 70], prone: true, legs: legX(44, 33, 50, 62, 1), arms: arm(32, 28, 1) }, him: { x: 62, y: 33, f: -1, a: [8, 12, 10], legs: legX(62, 33, 64, 62, 1), arms: arm(50, 40, -1) }, mover: 'him', axis: [1, 0] }));
  add('F-carry-back', 'เขาอุ้มเธอ หันหลังชิดอกเขา', 'ยืน', 'floor', () => ({ sc: 'floor', her: { x: 56, y: 38, f: 1, a: [-8, -14, -14], legs: [{ ft: [72, 28], b: -1 }, { ft: [70, 36], b: -1 }], arms: arm(60, 20, 1) }, him: { x: 66, y: 41, f: -1, a: [2, 4, 4], legs: legX(66, 41, 68, 70, 1), arms: arm(56, 36, -1) }, mover: 'him', axis: [1, 0.2] }));
  add('F-lean-chair', 'ยืนยันพนักเก้าอี้ สะโพกยื่นกลับ', 'ยืน', 'chair', () => ({ sc: 'chair', her: { x: 46, y: 33, f: -1, a: [30, 42, 38], legs: legX(46, 33, 48, 62, 1), arms: arm(33, 30, 1) }, him: { x: 62, y: 33, f: -1, a: [6, 10, 8], legs: legX(62, 33, 64, 62, 1), arms: arm(52, 40, -1) }, mover: 'him', axis: [1, 0] }));
  // --- G: start (before)
  add('G-straddle-clothed', 'ขึ้นคร่อมทั้งที่สวมชุด', 'ช่วงเริ่ม', 'bed', cow({ a: [10, 20, 18], arms: arm(46, 45, 1) }));
  add('G-sit-beside', 'นั่งข้างกัน หันหากัน', 'ช่วงเริ่ม', 'bed', () => ({ sc: 'bed', her: { x: 50, y: 47, f: 1, a: [6, 10, 10], legs: legX(50, 47, 66, 52, -1), arms: arm(64, 40, -1) }, him: { x: 66, y: 47, f: -1, a: [6, 10, 10], legs: legX(66, 47, 54, 52.5, 1, 52, 51.5, 1), arms: arm(56, 42, 1) }, mover: 'her', axis: [0, 0.3] }));
  add('G-push-down', 'เธอดันเขาลงนอน', 'ช่วงเริ่ม', 'bed', () => ({ sc: 'bed', her: { x: 60, y: 42, f: -1, a: [28, 44, 40], legs: legK(60, -1), arms: arm(44, 47, 1) }, him: Object.assign(lie(54, 49.5, -1, [60, 70, 72]), { legs: legX(54, 49.5, 88, 52, 1), arms: [{ h: [28, 49], b: -1, free: true }, { h: [26, 49], b: -1, free: true }] }), mover: 'her', axis: [0, 0.4] }));
  add('G-back-massage', 'เธอนั่งบนหลังเขา นวดไหล่', 'ช่วงเริ่ม', 'bed', () => ({ sc: 'bed', her: { x: 62, y: 42, f: -1, a: [10, 18, 16], legs: legK(62, -1), arms: arm(44, 44, 1) }, him: { x: 56, y: 49.5, f: -1, a: [88, 90, 90], prone: true, legs: legX(56, 49.5, 88, 52, 1), arms: [{ h: [26, 50.5], b: -1, free: true }, { h: [24, 50.5], b: -1, free: true }] }, mover: 'her', axis: [0.5, 0.3] }));
  add('G-kneel-over', 'คุกเข่าคร่อมเหนือเขา ยังไม่ลง', 'ช่วงเริ่ม', 'bed', cow({ y: 36, a: [6, 10, 10], arms: arm(46, 44, 1) }));
  /* ---------- render ---------- */
  function shiftPerson(sp, dx) { sp.x += dx; (sp.legs || []).forEach(L => { if (L.k) { L.k = [L.k[0] + dx, L.k[1]]; L.a = [L.a[0] + dx, L.a[1]]; } if (L.ft) L.ft = [L.ft[0] + dx, L.ft[1]]; }); (sp.arms || []).forEach(R => { R.h = [R.h[0] + dx, R.h[1]]; }); }
  function snap(spec) { const mv = spec.mover === 'him' ? spec.him : spec.her, ot = spec.mover === 'him' ? spec.her : spec.him, T = spec.gap || 8; const dx = ot.x - mv.x, dy = ot.y - mv.y, d = Math.hypot(dx, dy); if (d <= T + 1) return; const want = Math.sqrt(Math.max(0, T * T - dy * dy)) * (dx >= 0 ? 1 : -1); shiftPerson(ot, mv.x + want - ot.x); }
  // when a hand target is out of reach, lean the trunk toward it a few degrees at a time (like a person would) instead of stretching the arm
  function reachFix(sp) { if (!sp.arms || !sp.a || sp.sup || Math.abs(sp.a[1]) >= 68) return; const orig = sp.a.slice(); for (let it = 0; it < 14; it++) { const ff = sp.f, a = sp.a, L1 = P(sp.x, sp.y, LEN.lum, a[0], ff), S = P(L1[0], L1[1], LEN.tho, a[1], ff); let worst = 0, dir = 0; sp.arms.forEach(R => { if (!R || R.free) return; const d = Math.hypot(R.h[0] - S[0], R.h[1] - (S[1] + 1)) - (LEN.up + LEN.fore - 0.6); if (d > worst) { worst = d; dir = (R.h[0] - S[0]) * ff >= 0 ? 1 : -1; } }); if (worst <= 0.4) break; if (Math.abs(sp.a[1] - orig[1]) > 40) break; sp.a = a.map(v => v + dir * 3); } }
  function buildSpec(id, t, o) {
    o = Object.assign({ rhythm: 'mid', outfit: 'half', heat: 55, hair: 'brown', climax: false }, o || {}); const def = POSES.find(p => p.id === id); if (!def) throw new Error('no pose ' + id);
    const spec = JSON.parse(JSON.stringify(def.fn(t))), R = A.RHY[o.rhythm] || A.RHY.mid, phi = t / FR * 6.2832 * R.cyc; snap(spec);
    const m = o.climax ? ((t % 2) ? 1 : -1) * 0.6 : (o.rhythm === 'slow' ? Math.sin(phi) * 1.0 : o.rhythm === 'mid' ? Math.sin(phi) * 2.0 : Math.sin(phi) * 1.6), mv = spec.mover === 'him' ? spec.him : spec.her, ax = spec.axis || [0, 1]; mv.x += ax[0] * m; mv.y += ax[1] * m; ['him', 'her'].forEach(w => reachFix(spec[w])); spec.o = o; spec.phi = phi; spec.def = def; return spec;
  }
  function renderPose(id, t, o) {
    const spec = buildSpec(id, t, o); o = spec.o; PAL[8] = A.HAIRS[o.hair] || A.HAIRS.brown;
    const g = new Uint8Array(W * H), c = ctxFor(g), e = o.climax ? 2 : o.heat < 40 ? 0 : o.heat < 75 ? 1 : 2;
    scene(c, spec.sc, t); const st = { e, lag: Math.sin(spec.phi - 0.9), outfit: o.outfit };
    person(c, spec.him, 'him', st, spec.sc); const g2 = new Uint8Array(W * H).fill(255), c2 = ctxFor(g2); person(c2, spec.her, 'her', st, spec.sc);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (g2[i] === 255) { if ((x > 0 && g2[i - 1] !== 255) || (x < W - 1 && g2[i + 1] !== 255) || (y > 0 && g2[i - W] !== 255) || (y < H - 1 && g2[i + W] !== 255)) { const q = g[i]; if (q === 6 || q === 7 || q === 19 || q === 9) g[i] = 11; } } }
    for (let i = 0; i < g.length; i++) if (g2[i] !== 255) g[i] = g2[i];
    if (spec.sc === 'bed' || spec.sc === 'edge') { const x0 = spec.sheet === null ? 0 : spec.sheet ? spec.sheet[0] : 0, x1 = spec.sheet === null ? 0 : spec.sheet ? spec.sheet[1] : 0; for (let x = x0; x < x1; x++) { const yy = 49 + Math.round(Math.sin((x + t) / 4) * 0.7); for (let y = yy; y < 56; y++) c.px(x, y, 15); c.px(x, yy, 14); } }
    if (e >= 1) { c.px(spec.her.x + 4 - (t % 2), spec.her.y - 16 + (t * 2) % 8, 23); }
    if (o.climax) for (let i = 0; i < 6; i++) { const x = 28 + i * 14, y = 20 - ((t * 3 + i * 4) % 16); [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(p => c.px(x + p[0], y + p[1] + 6, 13)); }
    return g;
  }
  /* skeleton view: bones as lines, spine with rib ticks, joints as squares, amber = touching a surface, red = rule broken, small amber arrow = which way the front faces */
  function renderStick(id, t, o) {
    const spec = buildSpec(id, t, Object.assign({}, o || {}, { rhythm: (o && o.rhythm) || 'mid' })), g = new Uint8Array(W * H), c = ctxFor(g); scene(c, spec.sc, t);
    const px = c.px, line = (a, b, k) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2) || 1; for (let i = 0; i <= n; i++) px(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n, k); };
    const sq = (p, k) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) px(p[0] + i, p[1] + j, k); }, dotp = (p, k) => px(p[0], p[1], k), lerp = (p, q, u) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
    ['him', 'her'].forEach(who => { const sp = spec[who], J = solveFigure(sp, spec.sc), her = who === 'her', col = her ? 16 : 19, colF = her ? 17 : 15, V = J.V, Vp = J.Vp;
      // complete spine: vertebrae along pelvis -> lumbar -> thorax -> neck, with rib pairs on the thoracic part, sternum, clavicle, pelvis wing
      const path = [J.P0, J.L1, J.S, J.N], vert = []; for (let i = 0; i < 17; i++) { const u = i / 16 * 3, k = Math.min(2, Math.floor(u)), p = lerp(path[k], path[k + 1], u - k); vert.push(p); }
      line(J.P0, J.L1, col); line(J.L1, J.S, col); line(J.S, J.N, col); vert.forEach((p, i) => { dotp(p, 10); if (i % 4 === 0) sq(p, 10); });
      for (let k = 1; k <= 7; k++) { const p = lerp(J.L1, J.S, k / 7.5), len = 2.5 + Math.sin(k / 7.5 * 3.14) * 2.5, e = [p[0] + V[0] * len, p[1] + V[1] * len + 1.2]; line(p, e, col); }
      line([J.S[0] + V[0] * 3.5, J.S[1] + V[1] * 3.5], [J.S[0] + V[0] * 4 + (J.L1[0] - J.S[0]) * 0.75, J.S[1] + V[1] * 4 + (J.L1[1] - J.S[1]) * 0.75], colF); line(J.S, [J.S[0] + V[0] * 4, J.S[1] + V[1] * 4], col);
      line(J.P0, [J.P0[0] + Vp[0] * 4.5, J.P0[1] + Vp[1] * 4.5], col); line(J.P0, [J.P0[0] - Vp[0] * 3, J.P0[1] - Vp[1] * 3], col); line([J.P0[0] + Vp[0] * 4.5, J.P0[1] + Vp[1] * 4.5], J.L1, colF);
      // skull, jaw, neck
      for (let a = 0; a < 40; a++) px(J.Hd[0] + Math.cos(a / 40 * 6.283) * 4.7, J.Hd[1] + Math.sin(a / 40 * 6.283) * 4.7, col); line(J.N, J.Hd, col); const jaw = [J.Hd[0] + V[0] * 3.2 + (J.N[0] - J.Hd[0]) * 0.3, J.Hd[1] + V[1] * 3.2 + (J.N[1] - J.Hd[1]) * 0.3]; line(J.Hd, jaw, colF); dotp([J.Hd[0] + V[0] * 2.2, J.Hd[1] + V[1] * 2.2], 10);
      J.legs.forEach(l => { if (!l) return; const cc = l.far ? colF : col; line(l.hip, l.knee, cc); line(l.knee, l.ankle, cc); line(l.heel, l.ankle, cc); line(l.ankle, l.toe, cc); line(l.heel, l.toe, cc); [l.hip, l.knee, l.ankle].forEach((p, i) => { const sy = surfaceY(spec.sc, p[0]), touch = Math.abs(p[1] - sy) <= 2.8 && i > 0; sq(p, i === 1 && l.bad ? 13 : touch ? 18 : 10); }); [l.heel, l.toe].forEach(p => { const sy = surfaceY(spec.sc, p[0]); dotp(p, Math.abs(p[1] - sy) <= 2.2 ? 18 : 10); }); });
      J.arms.forEach(r => { if (!r) return; const cc = r.far ? colF : col; line(r.shoulder, r.elbow, cc); line(r.elbow, r.wrist, cc); line(r.wrist, r.tip, cc); const fd = nrm(sub(r.tip, r.wrist)), pd = [-fd[1], fd[0]]; [-1, 0, 1].forEach(q => line([r.wrist[0] + pd[0] * q, r.wrist[1] + pd[1] * q], [r.tip[0] + pd[0] * q * 1.5, r.tip[1] + pd[1] * q * 1.5], cc)); [r.shoulder, r.elbow, r.wrist].forEach((p, i) => { const sy = surfaceY(spec.sc, p[0]); sq(p, i === 2 && Math.abs(p[1] - sy) <= 2.8 ? 18 : 10); }); });
      sq(J.P0, 10); sq(J.S, 10); line(J.P0, [J.P0[0] + Vp[0] * 9, J.P0[1] + Vp[1] * 9], 18); px(J.P0[0] + Vp[0] * 9, J.P0[1] + Vp[1] * 9, 22); });
    return g;
  }
  function analyzePose(id, t) { const spec = buildSpec(id, t || 0, {}); return analyze(spec); }
  A.renderStick = renderStick; A.analyzePose = analyzePose; A.solveFigure = solveFigure; A.buildSpec = buildSpec;
  ['F-lift', 'F-wall-lift', 'F-wall-leg', 'F-carry-back', 'F-wall-kiss', 'F-sit-counter', 'C-wrap', 'C-ankles', 'C-hug', 'C-hands-up', 'C-wide', 'C-apart', 'A-back-squat-lean', 'G-sit-beside', 'E-spoon-curl'].forEach(id => { const p = POSES.find(q => q.id === id); if (p) { const fn = p.fn; p.fn = t => { const sp = fn(t); [sp.her, sp.him].forEach(q => (q.legs || []).forEach(L => { L.wrap = true; })); return sp; }; } });
  A.POSES2 = POSES; A.renderPose = renderPose;
  if (typeof module !== 'undefined') module.exports = A;
})(typeof window !== 'undefined' ? window : globalThis);
