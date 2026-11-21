// usage: node conception-language.js <app dir>; the expanded vocabulary: 39 womb-passage lines all reachable, a per-night word palette, the two-men race with names, scenes never repeat
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,F=A.finishLib,o=[];
const t=A.conceptionScene({seed:'x1',her:'แนน',him:'บอส',rival:'ต้น',note:'เธออยู่กับต้นในรอบนี้ แต่พ่อของเด็กคือบอส ความจริงนี้ยังไม่มีใครในเรื่องรู้',vol:4.1,day:13,len:28,ov:14,pct:24});
const i=t.indexOf('ภาพการแข่ง');o.push(t.slice(0,420));o.push('...');o.push(t.slice(i,i+900));const k=t.indexOf('คลังคำ');o.push(t.slice(k,k+420));
o.push('rival lines use names: '+/บอส/.test(t)+' '+/ต้น/.test(t));
// womb pool and variety
o.push('WOMB size '+F.WOMB.length+' S1 '+'?');const seen=new Set();for(let i=0;i<400;i++){F.recent.length=0;const f=F.pick({seed:'w'+i,n:1+i%3,came:1,w:null,buildup:60});if(f.womb)seen.add(f.womb)}o.push('distinct womb lines seen in 400 picks: '+seen.size);
const f=F.pick({seed:'zq',n:1,came:1,w:null,buildup:60});o.push(F.wombLine(f).slice(0,500));
const lens=new Set();for(let i=0;i<60;i++)lens.add(A.conceptionScene({seed:'k'+i,her:'a',him:'b'}));o.push('distinct scenes in 60: '+lens.size);
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
