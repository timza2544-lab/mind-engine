const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state;S.me=S.me||{id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]};
const out=['imgScene '+typeof A.imgScene,A.dual.selfTest().report];
S.dual=null;A.dual.makeMom(S.me);A.dual.rollRivals(S.me);S.dualPick.rounds=5;A.dual.start(S.me,A.dual.libraryMom());let m=S.dual,g=0;
let phaseHtml='';while(!m.over&&g++<200){if(m.phase==='play'){const h=m.hands.momA.filter(c=>c.cost<=m.energy.momA)[0]||m.hands.momA[0];A.dual.play(S.me,h.id)}else{ if(!phaseHtml)phaseHtml=A.dual.html(); A.dual.accept(S.me)}}
out.push('punish-phase html has image block '+/พรอมต์ภาพของแม่ รอบที่/.test(phaseHtml)+' buttons '+/dlimgr/.test(phaseHtml));
const n=m.rounds.length;const imgs=[];for(let i=1;i<=n;i++){const im=A.dual.roundImg(S.me,i);if(im)imgs.push(im)}
out.push('rounds '+n+' images '+imgs.length+' unique outfits '+new Set(imgs.map(x=>x.outfit)).size+' unique faces '+new Set(imgs.map(x=>x.face)).size);
out.push('woman only: '+!/ผู้ชาย|ตัวฉัน/.test(imgs[0].th.replace(/ผู้หญิงเพียงคนเดียว/,'')));
out.push(imgs[0].th.slice(0,1300));
// stable for the same seed
const again=A.dual.roundImg(S.me,1);out.push('stable '+(again.th===imgs[0].th));
const h2=A.dual.html();out.push('rounds list has image details '+/🖼/.test(h2));
window.__cp=[];navigator.clipboard.writeText=async t=>{window.__cp.push(t)};A.dual.onAct('dlimgr',{dataset:{v:'1'}});A.dual.onAct('dlimgrneg',{dataset:{v:'1'}});out.push('copied '+window.__cp.length+' neg len '+(window.__cp[1]||'').length);
return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}});
console.log(r);await new Promise(r=>setTimeout(r,300));console.log('ERRS',errs.join('|')||'none');await b.close()})();
