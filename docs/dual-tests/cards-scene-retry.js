// usage: node cards-scene-retry.js <app dir>; the card night's scene is rebuilt one trimming level lower when the host refuses the prompt as too long, until it goes through (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,C=A.cards,G=A.guess,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me=S.me||{id:'me-profile',data:{age:30,nickname:'ติม',firstName:'ติม',sex:'ชาย',mVolume:'ปานกลาง',mLength:15},chat:[]};S.game=S.game||{};S.game.mode='cards';
const wa=A.ui.createChar(A.gameWoman({age:29})),wb=A.ui.createChar(A.gameWoman({age:33}));G.givePartner(wb);
C.onAct('cdpicka',{dataset:{v:wa.id}});C.onAct('cdpickb',{dataset:{v:wb.id}});C.onAct('cdstart',{dataset:{}});C.onAct('cdgo',{dataset:{}});const m=S.cards;
const first=C.prompt(m,{}).size;o.push('first prompt '+first+' chars');
const toasts=[];const ui=A.ui;const t0=ui.toast;ui.toast=x=>{toasts.push(String(x));};
// 1. the host refuses anything over (first - 3000): the scene must still be written, with a smaller prompt
let calls=[];S.cap={sample:async(text)=>{calls.push(text.length);if(text.length>first-3000){const e=new Error('too long');e.code='prompt_too_large';throw e;}return {text:'ฉากทดสอบของคืนนี้'};}};
S.promptCap=undefined;await C.scene(false,'him');
ck('refused once or more, then written ('+calls.join(' > ')+')',calls.length>=2&&m.scene&&m.scene.includes('ฉากทดสอบ'));
ck('each retry is smaller than the one before',calls.every((n,i)=>i===0||n<calls[i-1]));
ck('the refused size is remembered',!!S.promptCap&&S.promptCap<first);
ck('the writer is told it is trying again',toasts.some(x=>/กำลังลองใหม่/.test(x)));
ck('not left busy',!m.busy);
// 2. his side is written; the women\'s inner sides retry too
calls=[];await C.scene(false,'a');ck('inner side a written ('+calls.join(',')+')',m.scene2&&m.scene2.includes('ฉากทดสอบ'));
// 3. refused at every level: stops, says so, never loops forever
calls=[];toasts.length=0;S.promptCap=undefined;m.scene='';S.cap={sample:async(text)=>{calls.push(text.length);const e=new Error('too long');e.code='prompt_too_large';throw e;}};
await C.scene(false,'him');ck('stops after the smallest level ('+calls.length+' tries)',calls.length>=2&&calls.length<=6);ck('says even the smallest was refused',toasts.some(x=>/แม้ย่อถึงระดับสุดท้าย/.test(x)));ck('not left busy after failing',!m.busy);
// 4. another kind of error: no retry
calls=[];toasts.length=0;S.cap={sample:async(text)=>{calls.push(1);throw new Error('boom');}};await C.scene(false,'him');ck('other errors: one try only',calls.length===1);
ui.toast=t0;S.promptCap=undefined;
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
