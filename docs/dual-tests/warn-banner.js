const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const A=ANIMA,S=A.state;S.me=S.me||{id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]};
const orig=A.gameRoll;A.gameRoll=function(){throw new Error('จำลองเครื่องคำนวณพัง')};
S.dual=null;A.dual.makeMom(S.me);A.dual.rollRivals(S.me);A.dual.start(S.me,A.dual.libraryMom());let m=S.dual,g=0;while(!m.over&&g++<200){if(m.phase==='play'){const h=m.hands.momA[0];A.dual.play(S.me,h.id)}else A.dual.accept(S.me)}
A.gameRoll=orig;const h=A.dual.html();return 'finished '+m.over+' warns '+m.warns.length+' sample '+JSON.stringify(m.warns[0])+' banner '+/ระบบบางส่วนถูกข้าม/.test(h)+' prompt has no warn text '+!/ถูกข้ามเพราะ/.test(A.dual.prompt(S.me,'Me'))});
console.log(r);console.log('pageerrors',errs.join('|')||'none');await b.close()})();
