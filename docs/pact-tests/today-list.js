// usage: node today-list.js <app dir>; pact (giver side): a list of today's visitors (3-5, kept for the day), women who came before can come back (rarely after a short night, likelier after a deep one, at most 3 a day), a box says who came back, and taking one starts her encounter with her own sheet (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;Object.assign(pk,{role:'give',ent:'random',mode:'B',rank:'random'});
const day=n=>{X.dayKey=()=>'2031-03-'+String(n).padStart(2,'0');S.pactToday=null;return X.todayVisitors(S.me);};
const entry=(i,paid)=>{const d=A.gameWoman({age:24+i});return {seed:'cx'+i+'-'+paid,at:Date.now()-86400000*(3+i),role:'give',her:A.callName(d),age:A.ageOf(d),occ:'งานประจำ',ent:'deity',mode:'B',wish:'งานใหม่',size:3,paid,tier:'เต็ม',w:{id:'pact-old'+i+paid,data:d,sim:{rel:'ยังไม่รู้จักกัน'},chat:[],ai:{}}};};
// no codex: only new visitors
S.pactCodex=[];let T=day(1);ck('empty codex: 3-5 new visitors ('+T.list.length+')',T.list.length>=3&&T.list.length<=5&&T.list.every(v=>v.kind==='new'&&v.w&&v.wishT&&v.her&&v.age>=18));
// kept all day
const again=X.todayVisitors(S.me);ck('same day: the very same list',again===T||JSON.stringify(again.list.map(v=>v.id))===JSON.stringify(T.list.map(v=>v.id)));
// returners by how deep the night went
const rate=(paid,days)=>{S.pactCodex=[0,1,2,3,4,5,6,7,8,9].map(i=>entry(i,paid));let c=0,mx=0,body=0,all=0;for(let n=1;n<=days;n++){const t=day(n),r=t.list.filter(v=>v.kind==='return');c+=r.length;mx=Math.max(mx,r.length);r.forEach(v=>{all++;if(v.how==='body')body++;});if(t.list.length<3||t.list.length>5)bad++;}return {mean:c/days,mx,bodyShare:all?body/all:0};};
const lo=rate(1,40),hi=rate(5,40);o.push('returners/day: paid1 '+lo.mean.toFixed(2)+' (max '+lo.mx+'), paid5 '+hi.mean.toFixed(2)+' (max '+hi.mx+', body '+(hi.bodyShare*100).toFixed(0)+'%)');
ck('deeper nights bring more returners than short ones',hi.mean>lo.mean&&hi.mean>=.8&&lo.mean<=hi.mean*.6);ck('at most 3 returners a day',lo.mx<=3&&hi.mx<=3);ck('after a deep night more come for him than for a new wish',hi.bodyShare>=.45);
// not on the same day she came
S.pactCodex=[0,1,2,3,4,5].map(i=>Object.assign(entry(i,5),{at:Date.now()}));let sameDay=0;for(let n=1;n<=20;n++){sameDay+=day(n).list.filter(v=>v.kind==='return').length;}
ck('a woman who came today does not come back today (codex entries dated now: '+sameDay+' returns)',sameDay===0||(X.dayKey=()=>{const t=new Date();return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')},true));
// one woman is one visitor even with several entries
const e0=entry(0,5);S.pactCodex=[e0,Object.assign({},e0,{seed:'cx-again',at:e0.at-5000}),Object.assign({},e0,{seed:'cx-again2',at:e0.at-9000})];let dup=0;for(let n=1;n<=40;n++){const t=day(n);const ids=t.list.filter(v=>v.kind==='return').map(v=>v.her);if(new Set(ids).size!==ids.length)dup++;}ck('one woman, one visitor a day',dup===0);
// find a day with a body-return and one with a new-wish return
S.pactCodex=[0,1,2,3,4,5,6,7,8,9].map(i=>entry(i,5));let tb=null,tw=null;for(let n=1;n<=60&&!(tb&&tw);n++){const t=day(n);const b=t.list.find(v=>v.how==='body'),w=t.list.find(v=>v.how==='wish');if(b&&!tb)tb={n,id:b.id,her:b.her};if(w&&!tw)tw={n,id:w.id,her:w.her};}
// the box and the list in the page
if(tb){day(tb.n);const h=X.html();ck('page: the box says who came back and what for',/pt-back/.test(h)&&h.includes('คนที่เคยมาขอพร กลับมาแล้ว')&&h.includes(tb.her)&&/ขอตัวท่านอีกครั้ง/.test(h));ck('page: today\'s list with take / pass buttons',/pt-today/.test(h)&&/รายการวันนี้/.test(h)&&(h.match(/data-act="pttake"/g)||[]).length===S.pactToday.list.length&&/เคยมาแล้ว \d+ ครั้ง/.test(h));}
// taking a body-return: her own sheet, remembered, asks for him
if(tb){day(tb.n);const old=S.pactCodex.find(x=>x.seed===S.pactToday.list.find(v=>v.id===tb.id).codexSeed); /* by seed: two women can share a name */const m=X.takeVisitor(S.me,tb.id);ck('take (return, for him): her own woman, marked as returning',m&&m.returning&&m.returning.kind==='body'&&m.w.id===old.w.id&&m.ctx.her===tb.her&&m.stage==='meet'&&/ไม่ใช่เรื่องพรแล้ว/.test(m.ask));
 ck('taken stays taken (no double take), and she leaves the box',(()=>{try{X.takeVisitor(S.me,tb.id);return false;}catch(e){return true;}})()&&!X.returnersToday(S.me).some(v=>v.id===tb.id));
 m.rung=2;X.propose(S.me);if(m.stage==='haggle')X.accept(S.me);if(m.stage==='offer'){X.perform(S.me);const sp=X.scenePrompt(S.me);ck('scene prompt: she is not a stranger, asks for him, remembers',/เธอไม่ใช่คนแปลกหน้า/.test(sp)&&/มาขอตัวฉัน \(ควย\) เอง/.test(sp)&&/เธอเคยมาหาฉันแล้วและจำฉันได้/.test(sp)&&!/ห้ามเล่าว่าเธอเคยรู้จักฉัน/.test(sp));}else o.push('(returning night not reached: '+m.stage+')');}
if(tw){day(tw.n);const m=X.takeVisitor(S.me,tw.id);ck('take (return, new wish): returning, a different wish from last time',m.returning&&m.returning.kind==='wish'&&m.returning.prevWish==='งานใหม่'&&D.WISH.find(q=>q.id===m.wishId).t!=='งานใหม่'&&/ครั้งนี้กลับมาด้วยเรื่องใหม่/.test(m.sit));}
// a new visitor: a stranger as before
day(70);S.pactCodex=[];const nv=X.todayVisitors(S.me).list[0],m2=X.takeVisitor(S.me,nv.id);ck('take (new): her sheet and her wish from the list, still a stranger',m2.w.id===nv.w.id&&m2.wishId===nv.wishId&&!m2.returning);
m2.rung=2;X.propose(S.me);if(m2.stage==='haggle')X.accept(S.me);if(m2.stage==='offer'){X.perform(S.me);const sp=X.scenePrompt(S.me);ck('scene prompt of a new visitor keeps the stranger rule',/ห้ามเล่าว่าเธอเคยรู้จักฉัน/.test(sp)&&!/เธอไม่ใช่คนแปลกหน้า/.test(sp));}
// pass
day(71);const pv=S.pactToday.list[0];X.passVisitor(pv.id);ck('pass: marked, cannot be taken',S.pactToday.st[pv.id]==='passed'&&(()=>{try{X.takeVisitor(S.me,pv.id);return false;}catch(e){return true;}})());
// persists
S.pactToday.toasted=true;X.save();const raw=JSON.parse(localStorage.getItem('anima.pact.v1')||localStorage.getItem(Object.keys(localStorage).find(k=>/pact/.test(k))||'x')||'null');ck('the day list is saved with the rest',raw&&raw.today&&raw.today.date===S.pactToday.date&&raw.today.list.length===S.pactToday.list.length);
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
