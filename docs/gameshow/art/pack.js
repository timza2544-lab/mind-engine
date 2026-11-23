// node pack.js <outdir> → packs the GIFs into a few binary files + a small manifest (the review wall fetches packs on demand, no base64)
const fs = require('fs'), path = require('path'), out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const main = JSON.parse(fs.readFileSync('manifest.json')), sl = JSON.parse(fs.readFileSync('slime-manifest.json')), packs = [], items = [];
const LIMIT = 7.5e6; let cur = null;
const open = name => { cur = { name, bufs: [], size: 0 }; packs.push(cur); };
const put = (file) => { const b = fs.readFileSync(file); if (!cur || cur.size + b.length > LIMIT) open('pack-' + packs.length + '.gif'); const ref = [packs.indexOf(cur), cur.size, b.length]; cur.bufs.push(b); cur.size += b.length; return ref; };
const byGroup = k => main.items.filter(i => k(i));
const order = [['skin', main.items], ['stick', main.items.filter(i => i.stick)], ['overlay', main.items.filter(i => i.overlay)], ['slime', sl.items]];
const refs = new Map(); const slot = (id) => { if (!refs.has(id)) refs.set(id, {}); return refs.get(id); };
for (const [kind, list] of order) { cur = null; for (const it of list) { const f = kind === 'skin' || kind === 'slime' ? it.file : it[kind]; slot(it.id)[kind === 'slime' ? 'skin' : kind] = put(f); } }
for (const it of main.items.concat(sl.items)) { const o = { id: it.id, tags: it.tags, p: refs.get(it.id) }; if (it.warn) o.warn = it.warn; items.push(o); }
packs.forEach(p => fs.writeFileSync(path.join(out, p.name), Buffer.concat(p.bufs)));
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({ packs: packs.map(p => p.name), items }));
console.log(packs.map(p => p.name + ' ' + (p.size / 1e6).toFixed(1) + 'MB').join(', '), items.length + ' items');
