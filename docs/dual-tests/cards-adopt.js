const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state,C=A.cards,G=A.guess;S.me=S.me||{id:'me-profile',data:{age:30,nickname:'ติม',firstName:'ติม',sex:'ชาย'},chat:[]};
const out=[];const w=A.ui.createChar(A.gameWoman({age:31}));const r0=G.givePartner(w);out.push('before: relStatus='+w.data.relStatus+' people='+JSON.stringify((w.data.people||[]).filter(x=>/แฟน|คู่สมรส/.test(x.rel)).map(x=>x.rel+' '+x.name+' ['+x.status+']'))+' partnerOf='+JSON.stringify(A.partnerOf(w,S.me)));
S.game=S.game||{};S.game.mode='cards';
const rr=C.onAct('cdpicka',{dataset:{v:w.id}});
out.push('after pick: relStatus='+w.data.relStatus+' sim.rel='+w.sim.rel+' people='+JSON.stringify((w.data.people||[]).filter(x=>/แฟน|คู่สมรส/.test(x.rel)).map(x=>x.rel+' '+x.name+' ['+x.status+']'))+' partnerOf='+JSON.stringify(A.partnerOf(w,S.me)));
out.push('meRel herPartner='+A.meRel(w,S.me,w.sim).herPartner+' other='+A.meRel(w,S.me,w.sim).other+' mismatch='+(A.meRel(w,S.me,w.sim).mismatch||'none'));
out.push('note shown '+/ปรับความสัมพันธ์แล้ว/.test(String((C.html&&C.html())||'')));
C.onAct('cdundoadopt',{dataset:{}});
out.push('after undo: relStatus='+w.data.relStatus+' sim.rel='+w.sim.rel+' people='+JSON.stringify((w.data.people||[]).filter(x=>/แฟน|คู่สมรส/.test(x.rel)).map(x=>x.rel+' '+x.name+' ['+x.status+']'))+' backup='+!!w.sim.adoptBackup);
// pick two different women: first adopted should restore when switching
const w2=A.ui.createChar(A.gameWoman({age:27}));G.givePartner(w2);
C.onAct('cdpicka',{dataset:{v:w.id}});C.onAct('cdpicka',{dataset:{v:w2.id}});
out.push('switch: first restored='+(!w.sim.adoptBackup&&/แต่งงานแล้ว|มีแฟน/.test(w.data.relStatus))+' second adopted='+!!w2.sim.adoptBackup);
// start table commits
const w3=A.ui.createChar(A.gameWoman({age:29}));G.givePartner(w3);const pk=C.pickOf();pk.a=w3.id;pk.b=w2.id; // w2 is adopted as A earlier; use w3 as A, w2 B
C.onAct('cdpicka',{dataset:{v:w3.id}});
const st=C.onAct('cdstart',{dataset:{}});out.push('start ok '+(!!S.cards)+' adopted kept='+!!w3.sim.adoptBackup+' relStatus='+w3.data.relStatus);
return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}});
console.log(r);console.log('ERRS',errs.join('|')||'none');await b.close()})();
