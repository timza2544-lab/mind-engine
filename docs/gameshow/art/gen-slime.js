// node gen-slime.js → slime/*.gif + slime-manifest.json (all mascot and liquid slime clips from the Anima slime modules)
const fs = require('fs'), path = require('path'); global.window = global;
const SRC = process.env.SLIME_SRC || path.join(__dirname, '../../../slime-src/');
(0, eval)(fs.readFileSync(SRC + 'slimegif.js', 'utf8')); (0, eval)(fs.readFileSync(SRC + 'slimeliquid.js', 'utf8'));
const G = ANIMA.slimeGif, items = [], grp = Object.fromEntries(G.LGROUPS), liq = Object.fromEntries(G.LIQ.map(p => [p.id, p]));
fs.mkdirSync(path.join(__dirname, 'slime'), { recursive: true });
let bytes = 0;
for (const p of G.POSES) { if (/^l-/.test(p.id)) continue; for (const th of G.THEMES) { const b = G.encode([Object.assign({}, G.frames(p.id), { scale: 6 })], th.id), id = `slime-${p.id}-${th.id}`; fs.writeFileSync(path.join(__dirname, 'slime', id + '.gif'), b); bytes += b.length; items.push({ id, file: `slime/${id}.gif`, tags: { group: 'slime', fam: 'สไลม์มาสคอต (น่ารัก)', label: p.t + ' · ' + th.t, theme: th.id } }); } }
for (const p of G.LIQ) { const b = G.encode([Object.assign({}, G.frames(p.id), { scale: 4 })], 'blue'), id = 'slime-' + p.id; fs.writeFileSync(path.join(__dirname, 'slime', id + '.gif'), b); bytes += b.length; items.push({ id, file: `slime/${id}.gif`, tags: { group: 'slime', fam: grp[p.grp] || p.grp, label: p.t, theme: 'blue' } }); }
fs.writeFileSync(path.join(__dirname, 'slime-manifest.json'), JSON.stringify({ items }, null, 1));
console.log(items.length + ' slime clips, ' + (bytes / 1e6).toFixed(1) + ' MB');
