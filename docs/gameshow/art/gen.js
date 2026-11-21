// node gen.js  → gifs/*.gif + manifest.json
const fs = require('fs'), A = require('./art.js'); require('./poses.js');
const out = [];
const put = (id, tags, frames, delay) => { fs.writeFileSync(`gifs/${id}.gif`, A.gif(frames, 5, delay)); out.push({ id, file: `gifs/${id}.gif`, tags }); };
const hairs = 'brown';
for (const p of A.POS) for (const r of Object.keys(A.RHY)) for (const o of Object.keys(A.OUT)) {
  const heat = r === 'slow' ? 30 : r === 'mid' ? 55 : 80, fr = []; for (let t = 0; t < A.FR; t++) fr.push(A.render({ pos: p.id, rhythm: r, outfit: o, heat, hair: hairs }, t));
  put(`${p.id}-${r}-${o}`, { group: 'pose', pos: p.id, rhythm: r, outfit: o }, fr, r === 'fast' ? 8 : r === 'mid' ? 10 : 14);
}
for (const p of A.POS) { const fr = []; for (let t = 0; t < A.FR; t++) fr.push(A.render({ pos: p.id, rhythm: 'fast', outfit: 'half', heat: 100, climax: true, hair: hairs }, t)); put(`climax-${p.id}`, { group: 'climax', pos: p.id }, fr, 9); }
for (const k of ['hug', 'laugh', 'cover']) { const fr = []; for (let t = 0; t < A.FR; t++) fr.push(A.renderAfter({ kind: k }, t)); put(`after-${k}`, { group: 'after', kind: k }, fr, 16); }
for (const p of A.POSES2) { const fr = []; for (let t = 0; t < A.FR; t++) fr.push(A.renderPose(p.id, t, { rhythm: 'mid', outfit: 'half', heat: 55 })); fs.writeFileSync(`gifs/${p.id}.gif`, A.gif(fr, 4, 11)); out.push({ id: p.id, file: `gifs/${p.id}.gif`, tags: { group: 'pose2', fam: p.g, label: p.t } }); }
fs.writeFileSync('manifest.json', JSON.stringify({ size: [A.W, A.H], scale: 5, items: out }, null, 1));
console.log(out.length + ' gifs');
