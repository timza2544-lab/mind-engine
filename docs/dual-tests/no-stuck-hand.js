const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const A=ANIMA,S=A.state;S.me=S.me||{id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]};let stuck=0,turns=0,throws=0;
for(let k=0;k<60;k++){S.dual=null;A.dual.makeMom(S.me);A.dual.rollRivals(S.me);S.dualPick.rounds=5;A.dual.start(S.me,A.dual.libraryMom());let m=S.dual,g=0;while(!m.over&&g++<300){if(m.phase==='play'){turns++;const ok=m.hands.momA.filter(c=>c.cost<=m.energy.momA);if(!ok.length){stuck++;break}
 // always pick the most expensive affordable card to drain energy as fast as possible
 const h=ok.sort((a,b)=>b.cost-a.cost)[0];try{A.dual.play(S.me,h.id)}catch(e){throws++}}else A.dual.accept(S.me)}}
return 'turns '+turns+' stuck '+stuck+' throws '+throws});
console.log(r,errs.join('|')||'');await b.close()})();
