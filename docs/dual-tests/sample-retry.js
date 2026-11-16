// usage: node sample-retry.js <app dir>; A.sampleRetry (every scene mode: hole, mirror, guess, pact, toxin, dual) builds the prompt again, smaller, when the host refuses it as too long (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
const big=()=>{const e=new Error('long');e.code='prompt_too_large';return e;};
// 1. the helper itself
S.promptCap=undefined;let sizes=[10000,8000,7000,6000],i=0,sent=[],toasts=[];
let r=await A.sampleRetry(()=>'x'.repeat(sizes[Math.min(i++,3)]),async t=>{sent.push(t.length);if(t.length>8500)throw big();return {text:'ok'};},{toast:x=>toasts.push(x)});
ck('goes through after one refusal ('+sent.join('>')+')',r.text==='ok'&&sent.length===2&&sent[1]<sent[0]);ck('the refused size is learned (floor 20000: '+S.promptCap+')',S.promptCap===20000);ck('tells the writer',toasts.length===1&&/ลองใหม่/.test(toasts[0]));
S.promptCap=undefined;sent=[];let thrown=null;try{await A.sampleRetry(()=>'y'.repeat(5000),async t=>{sent.push(t.length);throw big();});}catch(e){thrown=e;}
ck('cannot get smaller: stops after the second build, no wasted call ('+sent.length+')',thrown&&thrown.code==='prompt_too_large'&&sent.length===1);
S.promptCap=undefined;sent=[];i=0;thrown=null;try{await A.sampleRetry(()=>'z'.repeat(20000-(i++)*500),async t=>{sent.push(t.length);throw big();});}catch(e){thrown=e;}
ck('always refused: at most 5 sends ('+sent.length+')',thrown&&sent.length===5);
sent=[];thrown=null;try{await A.sampleRetry(()=>'w',async t=>{sent.push(1);throw new Error('boom');});}catch(e){thrown=e;}ck('other errors: one send, thrown as is',thrown&&thrown.message==='boom'&&sent.length===1);
r=await A.sampleRetry(()=>({text:'obj',level:2}),async t=>({text:t}));ck('builders that return {text} work',r.text==='obj');
// 2. the real budget: a refusal lowers it, so the next build of a real mode is smaller
S.promptCap=undefined;const me=S.me||(S.me={id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]});
const mom=A.dual.makeMom(me);A.dual.rollRivals(me);A.dual.start(me,mom);const m=S.dual;
const first=A.dual.prompt(me,'Me').length;sent=[];S.cap={sample:async t=>{sent.push(t.length);if(t.length>=first-200)throw big();return {text:'ฉากทดสอบ'};}};
const ui=A.ui,t0=ui.toast;ui.toast=x=>toasts.push(String(x));toasts.length=0;
await A.dual.scene('Me');
const small=sent.length>=2&&sent[sent.length-1]<first;o.push('dual sends: '+sent.join('>')+' first '+first);ck('dual scene: written after a refusal',m.sceneMe&&m.sceneMe.includes('ฉากทดสอบ')&&(small||first<20000));
// 3. dual says so when even the smallest is refused
S.promptCap=undefined;m.sceneMe='';sent=[];toasts.length=0;S.cap={sample:async t=>{sent.push(t.length);throw big();}};await A.dual.scene('Me');ck('dual: stops and says it ('+sent.length+' sends)',sent.length>=1&&sent.length<=5&&toasts.some(x=>/ยาวเกิน/.test(x)));
ui.toast=t0;S.promptCap=undefined;
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
