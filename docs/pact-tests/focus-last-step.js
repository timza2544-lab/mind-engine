// usage: node focus-last-step.js <app dir>; the pact scene puts its weight on the last step: step 1..n-1 short, the last step slow and detailed, with the word shares written into <ritual> and one rule (both the giver and the ask mode) (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
// the arithmetic
const W='1,800–2,600';[[1,null],[2,.15],[3,.2],[4,.25],[5,.28]].forEach(([n,pre])=>{const F=X.focusPlan({steps:new Array(n).fill('x')},W);if(!pre){ck('one step: no focus plan',F===null);return;}
 ck('n='+n+': earlier steps short, last step gets the rest ('+F.preEach+' each, '+F.last+' last)',F&&F.preEach>0&&F.last>=F.preEach*3&&Math.abs(F.preEach*(n-1)+F.last-2200)<=20&&F.last/2200>=.7);});
ck('different word budgets scale',X.focusPlan({steps:[1,2,3]},'800–1,200').last<X.focusPlan({steps:[1,2,3]},'2,200–3,000').last);
ck('no focus for a single step in the text either',X.focusRule({steps:['x']},W)===''&&X.ritualText({steps:['ขั้นเดียว']},W)==='ขั้น 1: ขั้นเดียว');
// the ask mode, paid 3 and paid 5
const run=(want)=>{for(let t=0;t<40;t++){Object.assign(pk,{role:'ask',ent:'random',mode:'B',cat:'auto',size:0,rank:'mid',wishText:'ให้ได้เลื่อนตำแหน่ง'});const m=X.summon(S.me);S.pact=m;let n=0;while(m.stage==='meetG'&&n<5){X.offerAsk(S.me,Array.from({length:want},(_,i)=>i+1));n++}
 if(m.stage==='offerG'&&m.offer.paid>0){if(m.offer.paid>=5)m.confirmed5=true;X.perform(S.me);if(m.night.steps.length===want)return m;}}return null;};
for(const want of [3,5]){const m=run(want);if(!m){o.push('(no ask night with '+want+' steps this run)');continue;}const sp=X.scenePrompt(S.me),k=m.night.steps.length,F=X.focusPlan(m.night,(sp.match(/ร้อยแก้ว ([\d,–]+) คำ/)||[])[1]);
 ck('ask '+k+' steps: rule in the prompt',F&&sp.includes('น้ำหนักของฉาก: ฉากทั้งหมดมุ่งไปที่ขั้นสุดท้าย (ขั้น '+k+')'));
 ck('ask '+k+' steps: the last ritual line is marked as the weight, the others short',F&&sp.includes('[จุดหนักของฉาก: เล่าให้ละเอียดที่สุด ราว '+F.last+' คำ]')&&(sp.match(/\[เล่าสั้น ราว \d+ คำ\]/g)||[]).length===k-1);
 ck('ask '+k+' steps: every step still in <ritual>',(sp.match(/^ขั้น \d+: /gm)||[]).length>=k);}
// the giver mode
Object.assign(pk,{role:'give',mode:'B',ent:'demon'});const g=X.newPerson(S.me,'demon','B','mid');S.pact=g;g.rung=5;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'){g.confirmed5=true;X.perform(S.me);const sp=X.scenePrompt(S.me),k=g.night.steps.length;ck('give '+k+' steps: rule + marked last step',k>=2?sp.includes('น้ำหนักของฉาก: ฉากทั้งหมดมุ่งไปที่ขั้นสุดท้าย (ขั้น '+k+')')&&/\[จุดหนักของฉาก/.test(sp):true);}else o.push('(giver night not reached)');
// a one-step night carries no rule
Object.assign(pk,{role:'give',mode:'B',ent:'deity'});const h=X.newPerson(S.me,'deity','B','mid');S.pact=h;h.rung=1;X.propose(S.me);if(h.stage==='haggle')X.accept(S.me);if(h.stage==='offer'&&h.offer.paid===1){X.perform(S.me);const sp=X.scenePrompt(S.me);ck('one step: no weight rule, no markers',!sp.includes('น้ำหนักของฉาก')&&!/\[จุดหนักของฉาก/.test(sp));}
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
