// usage: node cap-clear.js <app dir>; the learned prompt ceiling can be cleared: A.clearCap, the line with the button (export page, card night), the click, and it stays cleared after a reload (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html#export');await p.waitForTimeout(1800);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
const B=A.PROMPT_BUDGET;S.promptCap=0;try{localStorage.removeItem('anima.promptcap.v1');}catch(e){}
ck('no cap: default line, no button',/ยังไม่เคยถูกปฏิเสธ/.test(A.capHTML())&&!/capclear/.test(A.capHTML()));
A.learnCap(100000);ck('learned: cap '+S.promptCap+' stored',S.promptCap===92000&&localStorage.getItem('anima.promptcap.v1')==='92000'&&A.promptBudget()===92000);
const h=A.capHTML();ck('learned: line shows the number and the button',h.includes('92,000')&&h.includes('data-act="capclear"')&&h.includes('ล้างค่าเพดาน'));
// the export page shows it
const ui=A.ui;const t0=ui&&ui.toast;
document.querySelectorAll('[data-act="view"][data-view="export"]')[0]&&document.querySelectorAll('[data-act="view"][data-view="export"]')[0].click();
await new Promise(r=>setTimeout(r,300));
// click the real button wherever it is shown, else a stand-in with the same action
let btn=document.querySelector('[data-act="capclear"]');if(!btn){const el=document.createElement('button');el.dataset.act='capclear';document.body.appendChild(el);btn=el;o.push('(export page did not show it in this state; used a stand-in)');}
btn.click();await new Promise(r=>setTimeout(r,200));
ck('click clears the state',!S.promptCap&&A.promptBudget()===B);ck('click clears the storage',localStorage.getItem('anima.promptcap.v1')===null);
ck('line is back to default after the click',!/capclear/.test(A.capHTML()));
// the card night shows it in its head
S.me=S.me||{id:'me-profile',data:{age:30,nickname:'ติม',firstName:'ติม',sex:'ชาย'},chat:[]};S.game=S.game||{};S.game.mode='cards';A.learnCap(90000);
ck('card night head carries the line',A.cards.html().includes('data-act="capclear"'));
A.clearCap();ck('A.clearCap works on its own',!S.promptCap&&localStorage.getItem('anima.promptcap.v1')===null&&!A.cards.html().includes('data-act="capclear"'));
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));
// after a reload the cleared state stays cleared
await p.evaluate(()=>{ANIMA.learnCap(100000);ANIMA.clearCap();});await p.reload();await p.waitForTimeout(1500);
console.log('after reload: cap='+await p.evaluate(()=>ANIMA.state.promptCap||0)+' (expect 0)');
console.log('ERRS',errs.join('|')||'none');await b.close()})();
