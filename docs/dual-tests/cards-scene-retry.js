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
// 5. v216: two more tiers below the library's five (the smallest level used to stay near 88K and was still refused)
S.promptCap=undefined;const L4=C.prompt(m,{start:4}),L5=C.prompt(m,{start:5}),L6=C.prompt(m,{start:6});
ck('tier sizes shrink: '+L4.size+' > '+L5.size+' > '+L6.size,L4.size>L5.size&&L5.size>L6.size&&L5.level===5&&L6.level===6);
ck('tier 5 is at least 15% below tier 4',L5.size<L4.size*.85);ck('tier 6 under 60K',L6.size<60000);
ck('tier 5: no closing-feelings block',/^<after>$/m.test(L4.text)?!/^<after>$/m.test(L5.text):true);
ck('tier 6: no flood scene, no lexicon, and a conception scene (if any) does not claim a flood was told',!L6.text.includes('ฉากย่อยของตอนเสร็จ')&&!L6.text.includes('คลังคำ:')&&!L6.text.includes('เล่าจบไปก่อนแล้ว ฉากนี้เริ่มจากน้ำ'));
ck('the labels exist for the two new tiers',C.LEVEL_LABELS.length===7&&C.LEVEL_LABELS[5]&&C.LEVEL_LABELS[6]);
S.promptCap=L5.size+500;ck('a lowered budget (just above tier 5) skips tiers 2-4 on its own',C.prompt(m,{}).level>=5);
S.promptCap=L6.size+500;ck('a lower one reaches tier 6',C.prompt(m,{}).level===6);
// the host refuses anything near the size of tier 5 and up: the retry walks down tier by tier until one goes through
S.promptCap=undefined;m.scene='';calls=[];toasts.length=0;S.cap={sample:async(text)=>{calls.push(text.length);if(text.length>=L5.size+4000){const e=new Error('too long');e.code='prompt_too_large';throw e;}return {text:'ฉากทดสอบระดับห้า'};}};
await C.scene(false,'him');ck('written after walking down ('+calls.join('>')+')',m.scene&&m.scene.includes('ระดับห้า')&&calls[calls.length-1]<L5.size+4000);
ck('the writer saw the tier named',toasts.some(x=>/ย่อพิเศษ|ย่อสุด/.test(x)||/กำลังลองใหม่/.test(x)));
ui.toast=t0;S.promptCap=undefined;
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
