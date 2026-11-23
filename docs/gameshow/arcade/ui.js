  /* ---------- arcade ui: cabinet frame, typed dialogue, menu, portrait, action window with an x-ray option ---------- */
  const AR = window.ART, RIG = { face: 'K-face', back: 'K-back', squat: 'K-squat', lean: 'K-lean', grip: 'K-brace', lap: 'K-lap', turn: 'K-turn' }, REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ordering = false, xray = false, typedDone = '', typeTimer = null, rf = 0, pt = 0;
  const su = { her: 'ฟ้า', him: 'ภัทร', host: 'พิธีกรโอ๋', age: 27, hair: 'brown', skin: 'fair', eye: 'brown', theme: 'casino', lvl: 3, mode: 'core', arc: 'ไม่ชอบตอนแรก แล้วค่อยติดใจ' };
  function el(tag, props, kids) { const e = document.createElement(tag); Object.entries(props || {}).forEach(([k, v]) => { if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); }); (kids || []).forEach(c => e.append(c)); return e; }
  const themeKey = () => (st && st.setup.theme) || su.theme, setupOf = () => st ? st.setup : su;
  const heatNow = () => st ? (st.core ? (st.core.done ? 32 : st.core.heat) : clamp(st.act * 9 + st.v.score * 0.5, 4, 70)) : 8;
  const HAIRX = { brown: '#4a2c1c', black: '#241a30', blonde: '#e8b868' };
  const portraitOpts = () => { const s = setupOf(), sc = st && st.scene; return { heat: heatNow(), climax: !!(st && st.core && st.core.climax && !st.core.done), theme: s.theme || 'casino', skin: s.skin || 'fair', eye: s.eye || 'brown', hairHex: HAIRX[s.hair] || HAIRX.brown, fx: sc && sc.art && sc.art.fx || [] }; };
  const xp = () => ({ vagDepthCm: 8.5, arousal: clamp(heatNow() / 100, 0, 1), him: true, mLength: 13.1, mGirth: 11.7, mGlansLen: 3.5, mCurve: 0, mGlans: 0, vagWidth: 2, pelvicFloor: 1, innerWall: 1, innerRidge: 1, innerSqueeze: 2, innerHeat: 2, wetPattern: 0 });
  function paintPal(cv, g, pal, w, h) { const c = cv.getContext('2d'), im = c.createImageData(w, h), pr = pal.map(hx); for (let i = 0; i < g.length; i++) { const q = pr[g[i]] || pr[0], o = i * 4; im.data[o] = q[0]; im.data[o + 1] = q[1]; im.data[o + 2] = q[2]; im.data[o + 3] = 255; } c.putImageData(im, 0, 0); }
  function startType(node, full) {
    clearInterval(typeTimer); if (!full) return; if (REDUCED || typedDone === full) { node.textContent = full; return; }
    let i = 0; node.textContent = ''; node.onclick = () => { clearInterval(typeTimer); node.textContent = full; typedDone = full; };
    typeTimer = setInterval(() => { i += 2; node.textContent = full.slice(0, i); node.scrollTop = node.scrollHeight; if (i >= full.length) { clearInterval(typeTimer); typedDone = full; node.textContent = full; } }, 22);
  }
  const chip = (txt, on, fn) => el('button', { type: 'button', class: 'chip', 'aria-pressed': String(on), text: txt, onclick: fn });
  function setupLeft() {
    const rowOf = (lab, items, key, after) => { const r = el('div', { class: 'row' }); items.forEach(([v, t]) => r.append(chip(t, su[key] === v, () => { su[key] = v; if (after) after(); render(); }))); return [el('label', { text: lab }), r]; };
    const inp = (id, label, val, type) => el('div', {}, [el('label', { for: id, text: label }), el('input', { id, type: type || 'text', value: val, maxlength: 24 })]);
    const msg = el('p', { class: 'muted', id: 'smsg' });
    const form = el('div', { class: 'form' }, [el('div', { class: 'grid' }, [inp('fHer', 'ชื่อของเธอ (ผู้เล่น)', su.her), inp('fAge', 'อายุของเธอ (20 ขึ้นไป)', su.age, 'number'), inp('fHim', 'ชื่อคู่แข่ง', su.him), inp('fHost', 'ชื่อพิธีกร', su.host)]),
      ...rowOf('ธีมของห้อง', [['casino', 'คาสิโนลับ'], ['hotel', 'โรงแรมใต้แสงจันทร์'], ['onsen', 'ออนเซ็น'], ['space', 'ห้องโดยสารดาว']], 'theme'),
      ...rowOf('ผมของเธอ', [['brown', 'น้ำตาล'], ['black', 'ดำ'], ['blonde', 'บลอนด์']], 'hair'), ...rowOf('ผิว', [['fair', 'ขาว'], ['tan', 'สองสี'], ['deep', 'แทน']], 'skin'), ...rowOf('สีตา', [['brown', 'น้ำตาล'], ['violet', 'ม่วง'], ['teal', 'เขียวน้ำทะเล']], 'eye'),
      ...rowOf('ระดับความแรง (1–5)', [1, 2, 3, 4, 5].map(n => [n, String(n)]), 'lvl'), ...rowOf('แบบเกม', [['core', 'ฉากหลักเท่านั้น (แนะนำ)'], ['show', 'เกมโชว์ครบ 8 ด่าน']], 'mode'),
      ...rowOf('ท่าทีของเธอ', ['ไม่ชอบตอนแรก แล้วค่อยติดใจ', 'เฉยๆ แต่ชอบบางจุด', 'เธออยากเอง', 'ยอมเพราะเดิมพัน แต่ใจสู้'].map(a => [a, a]), 'arc'), msg]);
    const start = el('button', { class: 'pbtn go', type: 'button', text: 'START', onclick() {
      const her = $('#fHer').value.trim(), him = $('#fHim').value.trim(), host = $('#fHost').value.trim(), age = parseInt($('#fAge').value, 10); su.her = her; su.him = him; su.host = host; su.age = age;
      if (!her || !him || !host) { msg.textContent = 'ใส่ชื่อให้ครบทั้งสามช่อง'; return; } if (!(age >= 20 && age <= 90)) { msg.textContent = 'ผู้เล่นต้องเป็นผู้ใหญ่ อายุ 20–90 ปี'; return; } if (MINOR_RX.test(her + ' ' + him + ' ' + host)) { msg.textContent = 'ตัวละครทุกคนต้องเป็นผู้ใหญ่'; return; }
      st = fresh({ her, him, host, age, hair: su.hair, skin: su.skin, eye: su.eye, theme: su.theme, lvl: su.lvl, arc: su.arc, mode: su.mode }); PAL[6] = HAIR[su.hair]; typedDone = '';
      if (su.mode === 'core') { st.core = newCore(); save(); coreStep('เริ่มฉาก', null); } else { save(); step('เริ่มรายการ', null); } } });
    return [el('div', { class: 'dlg' }, [el('div', { class: 'dlg-h', text: 'ตั้งค่าตัวละคร · ผู้ใหญ่ทุกคน ปัดภารกิจได้ทุกข้อ' }), form]), el('div', { class: 'row' }, [start])];
  }
  function gameLeft() {
    const core = st.setup.mode === 'core', c = st.core, sc = core ? (st.scene || coreFallback(c)) : (st.scene || fallback(0)), A = ACTS[Math.min(Math.max(st.act - 1, 0), 7)];
    const phase = core ? 'ช่วง: ' + phaseOf(c) : (st.over ? 'จบรายการ' : `ด่าน ${st.act}/8 · ${A.n}`);
    const t = el('div', { class: 'dlg-t', id: 'dlgt' }); const dlg = el('div', { class: 'dlg' }, [el('div', { class: 'dlg-h', text: phase }), t, el('div', { class: 'more', text: '▼', 'aria-hidden': 'true' })]);
    if (busy) t.append(el('span', { class: 'spin' }), document.createTextNode('กำลังเขียนฉาก…'));
    else { t.dataset.full = sc.text; if (!cap) dlg.append(el('div', { class: 'hint', text: 'ยังไม่ได้เชื่อม Claude ตอนนี้เป็นข้อความย่อ เปิดหน้านี้ในแอป Claude เพื่อให้เขียนฉากเต็ม' })); }
    const kids = [dlg], menu = el('div', { class: 'menu', role: 'group', 'aria-label': 'ตัวเลือก' }), mi = (txt, fn, cls) => menu.append(el('button', { type: 'button', class: 'mi ' + (cls || ''), text: txt, onclick: fn }));
    if (!busy && !st.over) {
      if (core && !c.climax) { sc.choices.forEach(x => mi(x.t + `   (ร้อน ${x.heat >= 0 ? '+' : ''}${x.heat} · คุม ${x.control >= 0 ? '+' : ''}${x.control})`, () => coreStep(x.t, x))); mi('ค้างไว้ ชะลอให้ใจเย็น (ร้อนลด คุมตัวเองคืนมา)', () => { c.edges++; c.rhythm = 'slow'; coreStep('ค้างไว้ ชะลอจังหวะ', { heat: -14, control: 14, rhythm: 'slow' }); }); if (c.heat >= 60) mi('ไปให้ถึงจุดสูงสุดตามที่ตั้งใจ', () => coreStep('ไปให้ถึงจุดสูงสุด', { heat: 20, control: -10 }, 'climax'), 'hot'); }
      else if (core && c.climax && !c.done) mi('ต่อ: ช่วงหลังจบ', () => coreStep('หลังจบ', null, 'after'), 'hot');
      else if (!core) { sc.choices.forEach(x => mi(x.t + `   (${[x.nerve && 'กล้า ' + (x.nerve > 0 ? '+' : '') + x.nerve, x.trust && 'ไว้ใจ ' + (x.trust > 0 ? '+' : '') + x.trust].filter(Boolean).join(' · ') || 'ไม่เปลี่ยนค่า'})`, () => step(x.t, x))), mi('ปัดภารกิจนี้ (ข้ามไปด่านถัดไป)', () => step('ปัดภารกิจนี้ พิธีกรยอมรับ', { nerve: 0, trust: 0, time: 0, score: -3 })); }
    }
    if (st.over) mi('เริ่มเรื่องใหม่', () => { st = null; typedDone = ''; try { localStorage.removeItem(KEY); } catch (e) {} render(); }, 'hot');
    if (menu.children.length) kids.push(menu);
    // action window (a pose from the rig, or the x-ray cut) and the order panel
    const mw = xray ? 320 : core ? AR.W : W, mh = xray ? 200 : core ? AR.H : H, mini = el('canvas', { id: 'mini', width: mw, height: mh, role: 'img', 'aria-label': xray ? 'ภาพตัดแบบเอ็กซเรย์ของฉากนี้' : 'ภาพฉากที่ผู้เล่นเลือก' }); mini.style.aspectRatio = `${mw}/${mh}`;
    const tools = el('div', { class: 'tools' }); if (core && !st.over) tools.append(el('button', { class: 'pbtn', type: 'button', 'aria-pressed': String(ordering), text: 'ORDER', onclick() { ordering = !ordering; render(); } })); tools.append(el('button', { class: 'pbtn', type: 'button', 'aria-pressed': String(xray), text: 'X-RAY', onclick() { xray = !xray; render(); } }));
    if (!st.over) tools.append(el('button', { class: 'pbtn stop', type: 'button', text: 'STOP', title: 'พอก่อน', onclick() { if (busy) { wantStop = true; if (ctl) ctl.abort(); } else step('stop', null); } }));
    tools.append(el('button', { class: 'pbtn', type: 'button', text: 'SHOT', title: 'บันทึกภาพตัวละคร', onclick: saveShot }));
    kids.push(el('div', { class: 'mini' }, [mini, tools]));
    if (ordering && core && !st.over && !busy) { const pr = el('div', { class: 'row' }), rr = el('div', { class: 'row' }); POS.forEach(p => pr.append(chip(p.t, c.pos === p.id, () => { c.pos = p.id; save(); render(); }))); Object.keys(RHY).forEach(k => rr.append(chip(RHY[k].t, c.rhythm === k, () => { c.rhythm = k; save(); render(); }))); kids.push(el('div', { class: 'dlg order' }, [el('div', { class: 'dlg-h', text: 'ORDER · ท่า (ภาพเปลี่ยนทันที) และจังหวะ' }), pr, el('label', { text: 'จังหวะ' }), rr])); }
    if (tmsg) { kids.push(el('p', { class: 'muted', text: tmsg })); tmsg = ''; }
    const lg = core ? c.log : st.log; if (lg && lg.length) kids.push(el('details', {}, [el('summary', { class: 'muted', text: 'เส้นทางที่เลือกมา' }), el('ol', { class: 'log' }, lg.map(l => el('li', { text: l })))]));
    return kids;
  }
  function hud() {
    const seg = (v, cls) => el('i', { class: 'seg ' + (cls || '') }, [el('b', { style: 'width:' + clamp(v, 0, 100) + '%' })]), item = (lab, node, title) => el('div', { class: 'hi', title: title || '' }, [el('span', { class: 'px', text: lab }), node]);
    const num = v => el('strong', { class: 'px dg', text: String(Math.round(v)).padStart(3, '0') });
    if (!st) return el('div', { class: 'hud' }, [item('HEAT', num(0)), item('CTRL', seg(0)), el('span', { class: 'vip px', text: 'VIP' })]);
    if (st.core) return el('div', { class: 'hud' }, [item('HEAT', num(st.core.heat), 'ความร้อน'), item('CTRL', seg(st.core.control, 't'), 'ที่เธอคุมตัวเองได้'), item('BEAT', num(st.core.beats), 'จังหวะที่ผ่านมา'), el('span', { class: 'vip px', text: 'VIP' })]);
    return el('div', { class: 'hud' }, [item('NERVE', seg(st.v.nerve), 'ความกล้า'), item('TRUST', seg(st.v.trust, 't'), 'ความไว้ใจ'), item('TIME', num(st.v.time), 'นาทีที่เหลือ'), item('SCORE', num(st.v.score), 'คะแนน'), el('span', { class: 'vip px', text: 'VIP' })]);
  }
  async function saveShot() { const pc = $('#pc'); if (!pc) return; const dl = await window.claude?.use?.('downloads'); if (!dl) { toast('เปิดหน้านี้ในแอป Claude เพื่อบันทึกไฟล์'); return; } const o = document.createElement('canvas'); o.width = PW * 4; o.height = PH * 4; const c = o.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(pc, 0, 0, o.width, o.height); o.toBlob(async b => { try { await dl.save({ filename: 'arcade-portrait.png', data: b }); } catch (e) { toast('ยังไม่ได้บันทึก'); } }, 'image/png'); }
  function render() {
    const k = themeKey(), th = THEMES[k] || THEMES.casino, s = setupOf();
    const cab = el('div', { class: 'cab', style: `--f1:${th.f1};--f2:${th.f2};--neon:${th.neon};--glow:${th.glow};--bd:${th.bd}` });
    const pc = el('canvas', { id: 'pc', width: PW, height: PH, role: 'img', 'aria-label': 'ภาพวาดพิกเซลของเธอ สีหน้าเปลี่ยนตามความร้อนของฉาก' });
    const right = el('div', { class: 'right' }, [pc, el('div', { class: 'plate' }, [el('b', { text: st ? st.setup.her : su.her }), el('span', { class: 'muted', text: st ? (st.core ? 'ผู้เล่น · ฉากหลัก' : 'ผู้เข้าแข่งขัน') : 'พร้อมเริ่ม' })])]);
    const left = el('div', { class: 'left' }, st ? gameLeft() : setupLeft());
    cab.append(el('div', { class: 'sign', 'aria-hidden': 'true' }, [el('span', { text: th.sign })]), el('div', { class: 'screen' }, [right, left]), hud());
    app.replaceChildren(el('h1', { class: 'sr', text: 'ห้องลับคาสิโน เกมเลือกคำตอบ' }), cab);
    const t = $('#dlgt'); if (t && t.dataset.full) startType(t, t.dataset.full); else clearInterval(typeTimer);
    drawPortrait(pc, portraitOpts(), pt); const m = $('#mini'); if (m) drawMini(m);
  }
  function drawMini(m) {
    if (xray) drawIn(m, xp(), pt * 0.5, true);
    else if (st && st.core) { const c = st.core; rf += ({ slow: 0.28, mid: 0.5, fast: 0.9 })[c.rhythm] || 0.5; const g = AR.renderPose(RIG[c.pos] || 'K-face', Math.floor(rf) % AR.FR, { hair: st.setup.hair, heat: c.heat, climax: c.climax }); paintPal(m, g, AR.PAL, AR.W, AR.H); }
    else if (st) { const a = ACTS[Math.min(Math.max(st.act - 1, 0), 7)]; paint(m, frame(sceneArt(Math.max(st.act - 1, 0), st.scene && st.scene.art), tick % FR)); }
  }
  function loop() { if (document.hidden) return; pt += 0.18; tick++; const pc = $('#pc'); if (pc) drawPortrait(pc, portraitOpts(), pt); const m = $('#mini'); if (m) drawMini(m); }
  load(); if (st) PAL[6] = HAIR[st.setup.hair] || PAL[6]; render();
  if (!REDUCED) timer = setInterval(loop, 100);
  window.claude?.use?.('sample').then(s => { cap = s || null; if (st && st.scene && !busy) render(); }).catch(() => {});
  if (st && !st.scene && !busy) { if (st.setup.mode === 'core') coreStep('ต่อจากเดิม', null); else step('ต่อจากเดิม', null); }
})();
