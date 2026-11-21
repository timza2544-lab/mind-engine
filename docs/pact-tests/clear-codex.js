// usage: node clear-codex.js <app dir>; pact: the people who came to ask can be cleared (all at once, or one by one), with the app's own confirm box (window.confirm is refused in a sandboxed page, so it never cleared before); clearing also takes returning visitors out of today's list and the come-back box (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};Object.assign(S.pactPick,{role:'give',ent:'random',mode:'B',rank:'random'});
// a browser that refuses window.confirm, as a sandboxed page does
window.confirm=()=>false;
const entry=(i,paid,role)=>{const d=A.gameWoman({age:24+i});return {seed:'k'+i+'-'+(role||'give'),at:Date.now()-86400000*(3+i),role:role||'give',her:A.callName(d)+i,age:A.ageOf(d),occ:'งานประจำ',ent:'deity',mode:'B',wish:'งานใหม่',size:3,paid,target:paid,tier:'เต็ม',w:{id:'pact-k'+i,data:d,sim:{},chat:[],ai:{}}};};
const fill=()=>{S.pactCodex=[0,1,2,3,4,5].map(i=>entry(i,5)).concat([entry(8,3,'ask'),entry(9,2,'ask')]);S.pactToday=null;S.pactDayOff=0;S.pactSalt=0;X.dayKey=()=>'2033-01-05';};
const toasts=[];A.ui.toast=m=>toasts.push(m);
// find a day with returners
fill();let day=null;for(let n=1;n<=40&&!day;n++){X.dayKey=()=>'2033-01-'+String(n).padStart(2,'0');S.pactToday=null;const t=X.todayVisitors(S.me);if(t.list.filter(v=>v.kind==='return').length>=2)day=n;}
ck('setup: a day with 2+ returners',!!day);
// the page offers the buttons
let h=X.html();ck('page: a visible clear button in today\'s card with the count (give-side entries exist)',/data-act="ptclear"/.test(h)&&/ล้างคนที่เคยมาขอพร \(8\)/.test(h));
ck('page: the codex list has a "forget" cross for every person and a clear-all',(h.match(/data-act="ptcodexx"/g)||[]).length===8&&/🗑 ล้างทั้งหมด/.test(h));
// 1. with the real confirm box: cancelling keeps everything
const real=A.ui.confirmBox;let shown=null;A.ui.confirmBox=(title,body,okLabel,fn)=>{shown={title,body,okLabel,fn};};
X._autoConfirm=false;X.onAct('ptclear',{dataset:{}});
ck('click: the app\'s own confirm box is asked (title, count, warning), nothing cleared yet',shown&&/ล้างคนที่เคยมาขอพร/.test(shown.title)&&/ทั้งหมด 8 รายการ/.test(shown.body)&&/ย้อนกลับไม่ได้/.test(shown.body)&&shown.okLabel==='ล้างทั้งหมด'&&X.codex().length===8);
const before=S.pactToday.list.filter(v=>v.kind==='return').length;shown.fn();
ck('OK pressed: all 8 cleared although window.confirm says no',X.codex().length===0&&toasts.some(t=>/ล้างแล้ว 8 รายการ/.test(t)));
ck('the returning visitors left today\'s list and the come-back box ('+before+' returners before)',before>=2&&S.pactToday.list.every(v=>v.kind!=='return')&&X.returnersToday(S.me).length===0&&!/pt-back/.test(X.html()));
ck('the others in today\'s list stay (new visitors untouched)',S.pactToday.list.length>=1&&S.pactToday.list.every(v=>v.kind==='new'));
ck('the visible clear button is gone when nothing is left',!/data-act="ptclear"/.test(X.html())&&(X.onAct('ptclear',{dataset:{}}),toasts.some(t=>/ยังไม่มีคนในคลังคำขอพร/.test(t))));
// 2. one by one
fill();X.dayKey=()=>'2033-01-'+String(day).padStart(2,'0');S.pactToday=null;let T=X.todayVisitors(S.me);const ret=T.list.find(v=>v.kind==='return'),seed=ret.codexSeed;
X.onAct('ptcodexx',{dataset:{v:seed}});ck('forget one: only her entry is gone ('+X.codex().length+' left of 8), and she left today\'s list',X.codex().length===7&&!X.codex().some(x=>x.seed===seed)&&!S.pactToday.list.some(v=>v.codexSeed===seed)&&toasts.some(t=>/ลืมเธอแล้ว/.test(t)));
ck('forgetting an unknown seed does nothing',X.forgetCodex('nope')===false&&X.codex().length===7);
// 3. the real modal (not replaced): press the OK button in the DOM
A.ui.confirmBox=real;fill();X.dayKey=()=>'2033-01-'+String(day).padStart(2,'0');S.pactToday=null;X.todayVisitors(S.me);X._autoConfirm=false;X.onAct('ptclear',{dataset:{}});await new Promise(r=>setTimeout(r,150));
const okBtn=document.querySelector('[data-act="ok"]');ck('the real modal shows an OK button',!!okBtn&&/ล้างทั้งหมด/.test(okBtn.textContent));
if(okBtn){okBtn.click();await new Promise(r=>setTimeout(r,200));ck('the real modal: OK clears the codex',X.codex().length===0);}
// 4. patrons: forget all through the confirm box too
S.pactPatrons=[{id:'p1',name:'ก',deals:[]},{id:'p2',name:'ข',deals:[]}];S.pactPick.patron='p1';shown=null;A.ui.confirmBox=(t,b,ok,fn)=>{shown={t,b,ok,fn};};X.onAct('ptpatronx',{dataset:{v:'all'}});
ck('patrons: forgetting all asks the confirm box, then clears and unsets the chosen patron',shown&&/ลืมฉัน/.test(shown.b)&&X.patrons().length===2&&(shown.fn(),X.patrons().length===0&&S.pactPick.patron===''));
A.ui.confirmBox=real;
// 5. saved: after a clear the stored codex is empty too
X._test=false;fill();X.clearCodex();const raw=JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>/pact/.test(k))||'x')||'null');ck('the empty codex is saved',raw&&Array.isArray(raw.codex)&&raw.codex.length===0);
X._test=true;
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
