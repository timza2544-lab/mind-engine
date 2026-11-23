const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state;const me=S.me||(S.me={id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]});
localStorage.removeItem('anima.dual.codex.v1');S.dualCx=null;
const out=[];A.dual.makeMom(me);const R=A.dual.rollRivals(me);const mom=A.dual.libraryMom();
for(let k=0;k<3;k++){S.dual=null;if(k>0)A.dual.rollRivals(me);A.dual.start(me,mom);let m=S.dual,g=0;while(!m.over&&g++<150){if(m.phase==='play'){const h=m.hands.momA[0];A.dual.play(me,h.id)}else A.dual.accept(me)}}
const L=A.dual.cx();out.push('items '+L.length+' matches '+L.map(x=>x.matches.length).join(','));
S.dual=null;const h=A.dual.html();out.push('html cx '+/คลังครอบครัวอีกฝั่ง/.test(h)+' dossier '+/แฟ้มประวัติ/.test(h)+' imgbtn '+/dlcximg/.test(h)+' len '+h.length);
const sp=A.imageSpec(L[0].mom.data,L[0].id);out.push('img en '+sp.en.slice(0,120)+' | th '+sp.th.slice(0,100));
// persistence: reload items from storage
S.dualCx=null;out.push('reloaded '+A.dual.cx().length);
// use + delete via onAct simulation
const el={dataset:{v:L[1].id}};A.dual.onAct('dlcxuse',el);out.push('use -> rivals '+(S.dualPick.rivals&&S.dualPick.rivals.seed===L[1].seed));
A.dual.onAct('dlcxdel',{dataset:{v:L[2].id}});out.push('after del '+A.dual.cx().length);
return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}});
console.log(r);console.log('ERRS',errs.join('|'));await b.close()})();
