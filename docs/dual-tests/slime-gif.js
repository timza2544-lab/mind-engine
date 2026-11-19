// usage: node slime-gif.js <app dir>; slime GIF art (v252): pixel poses drawn from code, on-page animated SVG, real .gif file, saved through the downloads capability
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,X=A.slime,G=A.slimeGif,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};
ck('module, 12 poses and 5 colours',G&&G.POSES.filter(p=>!p.x).length>=12&&G.LIQ.length===142&&G.LGROUPS.length===10&&G.THEMES.length===5);
for(const p of G.POSES.filter(p=>!p.x)){const F=G.frames(p.id);ck('pose '+p.id+': frames drawn, every pixel a legal palette slot, something visible',F.frames.length===p.n&&F.frames.every(g=>g.length===32&&g.every(r=>(r.length===32||r.length===48)&&r.every(c=>c>=0&&c<=20))&&g.some(r=>r.some(c=>c))));
 const sv=G.svg(p.id,'pink');ck('pose '+p.id+': animated svg without scripts',/<svg/.test(sv)&&/<animate /.test(sv)&&!/<script/.test(sv)&&(sv.match(/<g visibility/g)||[]).length===p.n);}
const bytes=G.gifFor('bounce','blue');const hd=String.fromCharCode(...bytes.slice(0,6));let frames=0;for(let i=0;i<bytes.length-9;i++){if(bytes[i]===0x21&&bytes[i+1]===0xF9&&bytes[i+2]===4)frames++;}
ck('gif: header GIF89a, trailer, 8 frames, 256x256 or wider',hd==='GIF89a'&&bytes[bytes.length-1]===0x3B&&frames>=8&&bytes[6]+bytes[7]*256===256&&bytes[8]+bytes[9]*256===256);
const all=G.gifFor(G.POSES.map(p=>p.id),'green');ck('gif of all poses is bigger and valid',all.length>bytes.length&&all[all.length-1]===0x3B);
for(const p of G.LIQ){const F=G.frames(p.id);ck('liquid pose '+p.id+': 64x64 frames, legal palette, visible slime',F.frames.length===p.n&&(F.pal==='L'||F.pal==='P')&&F.frames.every(g=>g.length===64&&g.every(r=>r.length===64&&r.every(c=>c>=0&&c<=31))&&g.some(r=>r.some(c=>c>=2&&c<=13||c>=29&&c<=31))));if(p.id==='l-slow'){const sv=G.svg(p.id,'green');ck('liquid svg animates and has the green palette',/<animate /.test(sv)&&!/<script/.test(sv));}}
ck('liquid palette: 32 colours, the slime colour follows the theme',G.liquidColors('pink').length===32&&G.liquidColors('pink')[4]!==G.liquidColors('blue')[4]);
const lb=G.gifFor(['l-glow','bounce'],'blue');ck('a gif that mixes 64x64 liquid frames and 32x32 mascot frames still decodes structurally (local colour tables)',lb[lb.length-1]===0x3B&&String.fromCharCode(...lb.slice(0,6))==='GIF89a');
// the page card
X.load();X.create('วุ้น');S.game.mode='slime';const h=X.html();ck('page: gif card with every pose, colours, save buttons',/ท่าสไลม์/.test(h)&&(h.match(/data-act="slmgif"/g)||[]).length>=12&&/data-act="slmgiftab"/.test(h)&&/data-act="slmgifall"/.test(h)&&(h.match(/data-act="slmcolor"/g)||[]).length===5);
X.onAct('slmgiftab',{dataset:{v:'cum'}});ck('a tab shows only its liquid poses',(X.html().match(/data-act="slmgif" data-v="l-/g)||[]).length===G.LIQ.filter(p=>p.grp==='cum').length);X.onAct('slmgiftab',{dataset:{v:'mascot'}});
X.onAct('slmcolor',{dataset:{v:'purple'}});ck('colour is kept on the slime',X.get().color==='purple'&&X.norm(X.get()).color==='purple');
// saving goes through downloads
let saved=null;S.cap.downloads={save:async r=>{saved=r;return {status:'saved'};}};
X.onAct('slmgif',{dataset:{v:'eat'}});await new Promise(r=>setTimeout(r,60));ck('save: a gif Blob named slime-eat.gif',saved&&saved.filename==='slime-eat.gif'&&saved.data instanceof Blob&&saved.data.size>1000&&saved.data.type==='image/gif');
saved=null;X.onAct('slmgifall',{dataset:{}});await new Promise(r=>setTimeout(r,80));ck('save all: one gif',saved&&saved.filename==='slime-all.gif'&&saved.data.size>5000);
S.cap.downloads=null;const t0=[];A.ui.toast=m=>t0.push(m);X.onAct('slmgif',{dataset:{v:'idle'}});ck('no downloads capability: a polite toast, no crash',t0.length===1);
return (bad?o.join('\n')+'\nTOTAL FAIL '+bad:'ALL OK')+'\nERRS '+(window.__e||'none');}catch(e){return 'THROW '+e.message+' '+e.stack.slice(0,300);}}));
if(errs.length)console.log('PAGEERR',errs.slice(0,3));await b.close();})();
