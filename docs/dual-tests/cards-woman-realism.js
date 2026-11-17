// usage: node cards-woman-realism.js <app dir>; the women drawn for the card night (new girlfriend, the other couple's woman) are experienced, seated and free of self-contradictions; a saved one is mended by the button (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,C=A.cards,G=A.guess,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me=S.me||{id:'me-profile',data:{age:30,nickname:'ติม',firstName:'ติม',sex:'ชาย',mVolume:'ปานกลาง',mLength:15},chat:[]};S.game=S.game||{};S.game.mode='cards';const me=S.me;
const v=(d,k)=>Array.isArray(d[k])?d[k].join(' '):d[k]==null?'':String(d[k]);
// 1. fresh draws
let nA=0,nB=0,badA=0,badB=0,seatBad=0,conceivedVirgin=0;const why={};
for(let i=0;i<60;i++){C.onAct('cdnewa',{dataset:{}});const wa=S.chars.find(c=>c.id===C.pickOf().a);C.onAct('cdnewb',{dataset:{}});const wb=S.chars.find(c=>c.id===C.pickOf().b);
 const pa=C.problemsOf(wa.data,'A'),pb=C.problemsOf(wb.data,'B');nA++;nB++;if(pa.length){badA++;pa.forEach(x=>why['A:'+x]=(why['A:'+x]||0)+1);}if(pb.length){badB++;pb.forEach(x=>why['B:'+x]=(why['B:'+x]||0)+1);}
 if(!(v(wa.data,'relStatus')==='มีแฟน'&&wa.sim.rel==='แฟน'&&(wa.data.people||[]).some(x=>A.isHim(x,me))&&!wa.sim.adoptBackup))seatBad++;
 if(!(/^(มีแฟน|อยู่ด้วยกันโดยไม่แต่งงาน|หมั้นแล้ว|แต่งงานแล้ว)$/.test(v(wb.data,'relStatus'))&&(wb.data.people||[]).some(x=>/^(แฟน|คู่สมรส)$/.test(x.rel))))seatBad++;
 C.onAct('cdstart',{dataset:{}});if(S.cards){C.onAct('cdgo',{dataset:{}});[wa,wb].forEach(w=>((w.game&&w.game.attempts)||[]).filter(x=>x&&x.cards&&x.conceived).forEach(()=>{if(/ยังไม่เคย|^ไม่เคย/.test(v(w.data,'partners')+' '+v(w.data,'sexExp')))conceivedVirgin++;}));}S.cards=null;}
ck('120 fresh women: contradictions '+(badA+badB)+' (allow 2) '+JSON.stringify(why),badA+badB<=2);ck('every seat is right (his girlfriend is "มีแฟน" with him in her people; the other woman has a partner row)',seatBad===0);ck('no virgin conceives tonight',conceivedVirgin===0);
// 2. mending saved women
const mk=(over,role)=>{const w=A.ui.createChar(Object.assign(A.gameWoman(),over));return w;};
const virginWife=mk({relStatus:'แต่งงานแล้ว',partners:'ยังไม่เคย',sexExp:'ไม่เคย',firstAge:'ยังไม่เคย',firstTime:'ยังไม่เคย',insideFeel:'ไม่เคยถูกแตกใน จึงไม่รู้',kids:'ไม่เคยคิด',pregHist:'ไม่เคย',mateInside:'ไม่เคย เธอไม่ให้'});
ck('detected: virgin wife',C.problemsOf(virginWife.data,'B').includes('virgin'));let r=C.repairWoman(virginWife,'B',me);ck('repaired: virgin wife ('+r.fixed.length+' edits, left '+JSON.stringify(r.left)+')',r.fixed.length>=3&&!r.left.includes('virgin')&&v(virginWife.data,'partners')!=='ยังไม่เคย'&&v(virginWife.data,'sexExp')!=='ไม่เคย'&&v(virginWife.data,'firstAge')!=='ยังไม่เคย');
const mum=mk({relStatus:'มีแฟน',partners:'2–4 คน (พบมากที่สุด)',sexExp:'ปานกลาง',firstAge:'18–20',firstTime:'กับคนรัก ตามที่ตั้งใจ',kids:'มีแล้ว',children:'ลูกชาย อายุ 4 ขวบ',pregHist:'ไม่เคย',insideFeel:'ไม่เคยถูกแตกใน จึงไม่รู้',belly:'หน้าท้องย้วยหลังคลอด'});
const pm=C.problemsOf(mum.data,'B');ck('detected: kids but never inside / pregHist never ('+pm.join(',')+')',pm.includes('kids_never_inside')&&pm.includes('kids_preghist_never'));r=C.repairWoman(mum,'B',me);ck('repaired: mother ('+JSON.stringify(r.left)+')',r.left.length===0&&/คลอดแล้ว/.test(v(mum.data,'pregHist'))&&!/^ไม่เคยถูกแตกใน/.test(v(mum.data,'insideFeel')));
const preg=mk({pregHist:'กำลังตั้งครรภ์',relStatus:'มีแฟน',partners:'1 คน',sexExp:'น้อย',firstAge:'18–20',firstTime:'กับคนรัก ตามที่ตั้งใจ'});r=C.repairWoman(preg,'A',me);ck('repaired: pregnant before the table',!/กำลังตั้งครรภ์/.test(v(preg.data,'pregHist')));
const lockd=mk({relStatus:'แต่งงานแล้ว',partners:'ยังไม่เคย',sexExp:'ไม่เคย',firstAge:'ยังไม่เคย'});lockd.locked=true;const before=JSON.stringify(lockd.data);r=C.repairWoman(lockd,'B',me);ck('a locked woman is not touched',r.locked&&JSON.stringify(lockd.data)===before);
const fine=C.newWoman('B');const wf=A.ui.createChar(fine);r=C.repairWoman(wf,'B',me);ck('a fine woman: nothing to mend',r.fixed.length===0||r.left.length===0);
// 3. the button and the warning
const pk=C.pickOf();S.cards=null;const bad1=mk({relStatus:'มีแฟน',partners:'ยังไม่เคย',sexExp:'ไม่เคย',firstAge:'ยังไม่เคย',firstTime:'ยังไม่เคย'}),bad2=mk({relStatus:'แต่งงานแล้ว',partners:'ยังไม่เคย',sexExp:'ไม่เคย',firstAge:'ยังไม่เคย',firstTime:'ยังไม่เคย'});
pk.a=bad1.id;pk.b=bad2.id;let h=C.html();ck('the pick screen warns and offers the button',h.includes('ข้อมูลที่ขัดกันเองในแฟ้ม')&&h.includes('data-act="cdfix"')&&h.includes('ไม่เคยมีเพศสัมพันธ์เลย'));
const t0=A.ui.toast,toasts=[];A.ui.toast=x=>toasts.push(String(x));C.onAct('cdfix',{dataset:{}});A.ui.toast=t0;
ck('the button mends both ('+toasts.join('|').slice(0,160)+')',C.problemsOf(bad1.data,'A').length===0&&C.problemsOf(bad2.data,'B').length===0&&toasts.some(x=>/ซ่อมแล้ว/.test(x)));
h=C.html();ck('nothing wrong: no warning',!h.includes('ข้อมูลที่ขัดกันเองในแฟ้ม'));
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
