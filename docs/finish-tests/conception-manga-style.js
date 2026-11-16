// usage: node conception-manga-style.js <app dir>; the manga-caption and textbook registers are reachable, multi-round nights add the relay images, the sound-word palette is present
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];
const t1=A.conceptionScene({seed:'m1',her:'พลอย',him:'ต้น',rounds:2,day:13,len:28,ov:14,pct:20});const t0=A.conceptionScene({seed:'m1',her:'พลอย',him:'ต้น',rounds:1,day:13,len:28,ov:14,pct:20});
o.push('rounds2 has multi block '+t1.includes('หลายรอบต่อเนื่อง')+' ; rounds1 '+t0.includes('หลายรอบต่อเนื่อง')+' ; SFX line '+t1.includes('คำเสียงที่แทรกได้'));
const regs=new Set();for(let i=0;i<150;i++)regs.add(A.conceptionScene({seed:'z'+i,her:'a',him:'b'}).split('\n').find(l=>l.startsWith('น้ำเสียง')));o.push('registers seen '+regs.size+'/10');
const manga=[...regs].filter(x=>/กล่องคำบรรยาย|ตำราชีววิทยา/.test(x)).length;o.push('manga/textbook registers reachable '+manga);
return o.join('\n')}catch(e){return 'THROW '+e.message}}));console.log(errs.join('|')||'none');await b.close()})();
