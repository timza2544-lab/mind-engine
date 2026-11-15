// usage: node central-finish.js <dir with all app files>
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + process.argv[2] + '/index.html'); await p.waitForTimeout(1800);
const r = await p.evaluate(() => { try {
  const A = ANIMA, out = [], S = A.state; out.push('finishLib ' + !!A.finishLib + ' styles ' + (A.finishLib && A.finishLib.styles.length));
  const POISON = /พิษ|เรืองแสง/; out.push('poison-free ' + !A.finishLib.styles.some(s => POISON.test(s.his + s.her + s.t)));
  const me = { id: 'me-profile', data: { age: 34, nickname: 'ต้น', sex: 'ชาย', mVolume: 'ปานกลาง' } };
  const w = { id: 'w1', data: { age: 30, nickname: 'พลอย', sex: 'หญิง' } };
  const g = A.gameRoll(w, me, { k: 1, status: A.gameStatus ? A.gameStatus(w) : 'single', nth: 1, base: { vol: 3 }, days: 2, rounds: 1, timed: false });
  const t1 = A.releaseText(g.release, 'พลอย', 'ต้น', null, {}), t2 = A.releaseText(g.release, 'พลอย', 'ต้น', null, {}), t3 = A.releaseText(g.release, 'พลอย', 'ต้น', null, { noFinish: true }), t4 = A.releaseText(g.release, 'พลอย', 'ต้น', null, { out: { where: 'บนท้อง', kind: 'skin' } });
  out.push('inside has finish ' + /รูปแบบการแตกใน/.test(t1) + ' stable ' + (t1 === t2) + ' noFinish ' + !/รูปแบบการแตกใน/.test(t3) + ' out ' + !/รูปแบบการแตกใน/.test(t4));
  const ids = new Set(); for (let i = 0; i < 20; i++) { const x = A.gameRoll(w, me, { k: i + 2, status: 'single', nth: 1, base: { vol: 3 }, days: i, rounds: 1, timed: false }); const m = /"([^"]+)" — ฝั่งเขา/.exec(A.releaseText(x.release, 'พลอย', 'ต้น', null, {})); if (m) ids.add(m[1]); } out.push('variety in 20 ' + ids.size);
  out.push('rules: dual FIN ' + /FIN_RULE/.test(String(A.dual.prompt)) + ' mirror pregLine ' + typeof A.guess.pregLine);
  const pl = A.guess.pregLine({ pct: 12.3, conceived: false }, true); out.push('pregLine ' + pl.slice(0, 60) + ' | outside "' + A.guess.pregLine({ pct: 5 }, false) + '"');
  return out.join('\n'); } catch (e) { return 'THROW ' + e.message + String(e.stack).slice(0, 400); } });
console.log(r); console.log('ERRS', errs.join('|') || 'none'); await b.close(); })();
