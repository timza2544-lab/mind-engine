// node gen.js  → gifs/*.gif + manifest.json  (core poses and the extra catalogue both come from the skeleton rig in poses.js)
const fs = require('fs'), A = require('./art.js'); require('./poses.js');
const out = [], G = (fr, k, d) => A.gif(fr, k, d);
const frames = (fn) => { const f = []; for (let t = 0; t < A.FR; t++) f.push(fn(t)); return f; };
const warnOf = id => Array.from(new Set([].concat(...[1, 3, 5].map(t => A.analyzePose(id, t)), ...[1, 3, 5].map(t => A.alignCheck(id, t)))));
const CORE = { face: 'K-face', back: 'K-back', squat: 'K-squat', lean: 'K-lean', brace: 'K-brace', lap: 'K-lap', turn: 'K-turn' };
const add = (id, tags, skin, delay, extra) => { fs.writeFileSync(`gifs/${id}.gif`, G(skin, 3, delay)); out.push(Object.assign({ id, file: `gifs/${id}.gif`, tags }, extra || {})); };
for (const p of A.POS) for (const r of Object.keys(A.RHY)) for (const o of Object.keys(A.OUT)) {
  const rid = CORE[p.id], heat = r === 'slow' ? 30 : r === 'mid' ? 55 : 80, d = r === 'fast' ? 8 : r === 'mid' ? 10 : 14, id = `${p.id}-${r}-${o}`, opt = { rhythm: r, outfit: o, heat };
  let extra = null;
  if (r === 'mid' && o === 'half') { fs.writeFileSync(`gifs/${id}-stick.gif`, G(frames(t => A.renderStick(rid, t, opt)), 3, d)); fs.writeFileSync(`gifs/${id}-overlay.gif`, G(frames(t => A.renderOverlay(rid, t, opt)), 3, d)); extra = { stick: `gifs/${id}-stick.gif`, overlay: `gifs/${id}-overlay.gif`, warn: warnOf(rid) }; }
  add(id, { group: 'pose', pos: p.id, rhythm: r, outfit: o }, frames(t => A.renderPose(rid, t, opt)), d, extra);
}
for (const p of A.POS) add(`climax-${p.id}`, { group: 'climax', pos: p.id }, frames(t => A.renderPose(CORE[p.id], t, { rhythm: 'fast', outfit: 'half', heat: 100, climax: true })), 9);
for (const k of ['hug', 'laugh', 'cover']) add(`after-${k}`, { group: 'after', kind: k }, frames(t => A.renderAfter({ kind: k }, t)), 16);
for (const p of A.POSES2) { if (/^K-/.test(p.id)) continue; const opt = { rhythm: 'mid', outfit: 'half', heat: 55 };
  fs.writeFileSync(`gifs/${p.id}-stick.gif`, G(frames(t => A.renderStick(p.id, t)), 3, 11)); fs.writeFileSync(`gifs/${p.id}-overlay.gif`, G(frames(t => A.renderOverlay(p.id, t, opt)), 3, 11));
  add(p.id, { group: 'pose2', fam: p.g, label: p.t }, frames(t => A.renderPose(p.id, t, opt)), 11, { stick: `gifs/${p.id}-stick.gif`, overlay: `gifs/${p.id}-overlay.gif`, warn: warnOf(p.id) }); }
fs.writeFileSync('manifest.json', JSON.stringify({ size: [A.W, A.H], scale: 3, items: out }, null, 1));
console.log(out.length + ' items, ' + out.filter(i => i.warn && i.warn.length).length + ' with warnings');
