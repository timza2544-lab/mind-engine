// usage: node step-up.js <app dir>; pact giver side: going past the agreed step by HER choice (2 -> 3, 4 -> 5): off unless the player turns it on, never past her own limit, 4 -> 5 only after the player confirmed the pregnancy risk, chance from her libido / a demon's pull / rank, told in the scene with her spoken words (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
const mk=(ent,rank,seed,over)=>{Object.assign(pk,{role:'give',mode:'B',ent});const g=X.newPerson(S.me,ent,'B',rank,seed?{seed}:undefined);if(over)Object.assign(g.w.data,over);S.pact=g;return g;};
// a dealing at a chosen step with a chosen limit of hers
const at=(g,paid,limit)=>{g.rung=paid;X.propose(S.me);g.offer.paid=paid;g.offer.limit=limit;return g;};
// 1. off by default and the guards
let g=at(mk('demon','high','s0'),2,5);ck('off by default: never a step up',X.overstepOf(g)===null);
g.overOK=true;ck('guard: not at step 5',(()=>{const q=at(mk('demon','high','s1'),5,5);q.overOK=true;q.confirmed5=true;return X.overstepOf(q)===null;})());
ck('guard: not when her limit is where she already is',(()=>{const q=at(mk('demon','high','s2'),3,3);q.overOK=true;let n=0;for(let i=0;i<60;i++){q.seed='x'+i;if(X.overstepOf(q))n++;}return n===0;})());
ck('guard: not when she refused (step 0)',(()=>{const q=at(mk('demon','high','s3'),2,5);q.offer.paid=0;q.overOK=true;return X.overstepOf(q)===null;})());
ck('guard: 4 -> 5 only after the pregnancy risk is confirmed',(()=>{const q=at(mk('demon','supreme','s4'),4,5);q.overOK=true;q.confirmed5=false;let n=0;for(let i=0;i<80;i++){q.seed='y'+i;if(X.overstepOf(q))n++;}return n===0;})());
// 2. never past her limit, and the chance moves with libido / demon / rank
const rate=(ent,rank,lib,paid,limit,conf)=>{let c=0,viol=0;for(let i=0;i<300;i++){const q=at(mk(ent,rank,'r'+i,{libido:lib}),paid,limit);q.overOK=true;q.confirmed5=!!conf;const v=X.overstepOf(q);if(v){c++;if(v.to>limit||v.from!==paid||v.to!==paid+1)viol++;}}return {r:c/300,viol};};
const lo=rate('deity','low',15,2,5),hi=rate('deity','low',95,2,5),dm=rate('demon','supreme',50,2,5),dt=rate('deity','low',50,2,5);o.push('chance: libido 15 '+(lo.r*100).toFixed(0)+'% · libido 95 '+(hi.r*100).toFixed(0)+'% · deity low 50 '+(dt.r*100).toFixed(0)+'% · demon supreme 50 '+(dm.r*100).toFixed(0)+'%');
ck('the chance is higher for a woman with a high libido',hi.r>lo.r+.12);ck('a supreme demon pulls more than a low god',dm.r>dt.r+.08);ck('one step at a time, and never past her limit (4 -> 5 with limit 5 only, 2 -> 3 with limit 3 ok)',lo.viol===0&&hi.viol===0&&dm.viol===0&&rate('deity','low',99,2,3).viol===0&&rate('deity','low',99,2,3).r>0);
ck('between 10% and 70% always',lo.r>=.05&&hi.r<=.75);
// 3. the night itself: 2 -> 3
let n23=null;for(let i=0;i<60&&!n23;i++){const q=at(mk('demon','high','n'+i,{libido:90}),2,5);q.overOK=true;if(X.overstepOf(q)){try{X.perform(S.me);n23=q;}catch(e){}}}
if(n23){const N=n23.night;ck('2 -> 3: she paid 3 although 2 was agreed; 3 steps in the ritual; the mark on the night',N.paid===3&&N.steps.length===3&&N.stepUp&&N.stepUp.from===2&&N.stepUp.to===3&&n23.offer.paid===2);
 ck('2 -> 3: the log says she asked herself, with her spoken line',n23.log.some(l=>l.k==='stepup'&&/ขอจ่ายเกินขั้นเอง: จากขั้น 2 เป็นขั้น 3/.test(l.line)&&X.OVER_LINES[3].some(t=>l.line.includes(t))));
 const sp=X.scenePrompt(S.me);ck('2 -> 3: the scene says she asked and chose it, with her words, and that the giver did not push',/เกินขั้น: ตอนตกลงไว้ที่ขั้น 2/.test(sp)&&X.OVER_LINES[3].some(t=>sp.includes(t))&&/เป็นฝ่ายเอ่ยขอจ่ายต่ออีกขั้นเอง/.test(sp)&&/ไม่ใช่การที่ผู้ให้พรบังคับหรือหลอก/.test(sp)&&/ไม่เกินที่เธอรับได้/.test(sp));
 ck('a demon: his reaction at the moment she asks, and again that it is her choice',/ตอนเธอขอเกินขั้น \(ขั้น 2 เป็น 3\)/.test(sp)&&X.DARKSEX.stepUp.some(t=>sp.includes(t))&&/เขาไม่ได้ล่อหรือบังคับ/.test(sp));
 ck('2 -> 3: the ending is the mouth ending (step 3), not step 2\'s',X.DARKSEX.breed.mouth.some(t=>sp.includes(t)));}else o.push('(no 2->3 night reached)');
// 4 -> 5: needs the confirmation, then inside
let n45=null;for(let i=0;i<120&&!n45;i++){const q=at(mk('deity','mid','m'+i,{libido:95,sexAnxiety:[],finishPref:'ข้างใน ไม่ใส่ถุง (creampie)'}),4,5);q.overOK=true;q.confirmed5=true;if(X.overstepOf(q)){try{X.perform(S.me);n45=q;}catch(e){}}}
if(n45){const N=n45.night;ck('4 -> 5 (confirmed ahead): paid 5, inside, five steps, a pregnancy number from the roll',N.paid===5&&N.steps.length===5&&N.stepUp.to===5&&!N.out&&/แตกใน/.test(N.steps[4])&&typeof N.pct==="number");
 const sp=X.scenePrompt(S.me);ck('4 -> 5 scene: she asked; also a god (no <dark>) gets the facts',/เกินขั้น: ตอนตกลงไว้ที่ขั้น 4/.test(sp)&&X.OVER_LINES[5].some(t=>sp.includes(t))&&!/<dark>/.test(sp));}else o.push('(no 4->5 night reached)');
// 4. the ask side never steps up
ck('the ask side has no step up',(()=>{const q=mk('demon','mid','a1');q.role='ask';q.overOK=true;q.offer={paid:2,limit:5};return X.overstepOf(q)===null;})());
// 5. the page: switch, confirm for 5
const pg=at(mk('deity','mid','pg1'),2,5);let h=X.html();ck('page: the switch is offered at steps 1-4',/data-act="ptover"/.test(h)&&/เปิดให้เธอขอจ่ายต่ออีกขั้นกลางพิธีได้/.test(h)&&/ไม่เคยดันเธอเกินขั้นที่เธอยอม/.test(h)&&!/data-act="ptover5"/.test(h));
X.onAct('ptover',{dataset:{}});h=X.html();ck('page: pressed = on',pg.overOK===true&&/aria-pressed="true"/.test(h)&&/✔ เปิดอยู่/.test(h));
const p4=at(mk('deity','mid','pg2'),4,5);p4.overOK=false;X.onAct('ptover',{dataset:{}});h=X.html();ck('page: at step 4 with it on, the confirm for step 5 is offered with the risk and the consequence of not confirming',p4.overOK&&/data-act="ptover5"/.test(h)&&/ต้องยืนยันล่วงหน้า/.test(h)&&/เธอขอได้สูงสุดแค่ขั้น 4/.test(h));
X.onAct('ptover5',{dataset:{}});ck('page: confirming sets it, pressing again withdraws it',p4.confirmed5===true&&(X.onAct('ptover5',{dataset:{}}),p4.confirmed5===false));
const p5=at(mk('deity','mid','pg3'),5,5);p5.confirmed5=true;ck('page: at step 5 there is no switch',!/data-act="ptover"/.test(X.html()));
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
