const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state;const me=S.me||(S.me={id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]});
const out=[A.dual.selfTest().report];let reps=0,tot=0,dets=0,detUniq=0,cards=new Set();
for(let k=0;k<10;k++){S.dual=null;A.dual.makeMom(me);A.dual.rollRivals(me);S.dualPick.rounds=5;A.dual.start(me,A.dual.libraryMom());let m=S.dual,g=0;const names=[],dl=[];while(!m.over&&g++<250){if(m.phase==='play'){const h=m.hands.momA.filter(c=>c.cost<=m.energy.momA).sort((a,b)=>b.p-a.p)[0]||m.hands.momA[0];A.dual.play(me,h.id)}else A.dual.accept(me)}
const turns=m.log.filter(x=>x.k==='turn').map(x=>(x.line.match(/ใช้ "([^"]+)"/g)||[]).join('|'));const dd=m.log.filter(x=>x.k==='detail').map(x=>x.line);const ps=m.rounds.map(r=>r.finale&&r.finale.pos);
dets+=dd.length;detUniq+=new Set(dd).size;const cb=m.log.filter(x=>x.k==='turn').map(x=>(x.line.match(/ใช้ "([^"]+)"/g)||[])[1]);for(let i=1;i<cb.length;i++){tot++;if(cb[i]===cb[i-1])reps++}
if(k===0)out.push('finale pos '+ps.join(' / '));}
out.push('details '+dets+' unique '+detUniq+' ; momB consecutive repeats '+reps+'/'+tot);
// codex library button
const R=A.dual.cx();if(R.length){A.dual.onAct('dlcxlib',{dataset:{v:R[0].id}});out.push('lib added: '+(R[0].libId&&!!S.chars.find(c=>c.id===R[0].libId)))}
return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}});
console.log(r);console.log('ERRS',errs.join('|'));await b.close()})();
