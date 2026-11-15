const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state,C=A.cards,G=A.guess;S.me=S.me||{id:'me-profile',data:{age:30,nickname:'ติม',firstName:'ติม',sex:'ชาย'},chat:[]};
const out=[];const st=w=>w.data.relStatus+' | rel='+((w.sim||{}).rel)+' | '+(w.data.people||[]).filter(x=>/แฟน|คู่สมรส/.test(x.rel)).map(x=>x.rel+' '+x.name).join(',')+' | adopted='+!!(w.sim&&w.sim.adoptBackup);
const w=A.ui.createChar(A.gameWoman({age:31}));G.givePartner(w);const w2=A.ui.createChar(A.gameWoman({age:28}));G.givePartner(w2);
S.game=S.game||{};S.game.mode='cards';
out.push('0 before: '+st(w));
C.onAct('cdpicka',{dataset:{v:w.id}});C.cur();out.push('1 picked (setup open): '+st(w));
C.onAct('cdpick'+'b',{dataset:{v:w2.id}});
C.onAct('cdstart',{dataset:{}});C.cur();out.push('2 table running: '+st(w)+' session='+!!S.cards);
C.onAct('cdclose',{dataset:{}});C.cur();out.push('3 table closed: '+st(w));
// leaving setup without starting
S.game.mode='cards';C.onAct('cdpicka',{dataset:{v:w.id}});out.push('4 picked again: adopted='+!!(w.sim&&w.sim.adoptBackup));C.onAct('cdback',{dataset:{}});out.push('5 back: '+st(w));
// page-reload-like: adopted record left behind, mode not cards
C.onAct('cdpicka',{dataset:{v:w.id}});S.game.mode=null;C.cur();out.push('6 left mode w/o back: '+st(w));
return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}});
console.log(r);console.log('ERRS',errs.join('|')||'none');await b.close()})();
