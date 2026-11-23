// usage: node body-arrangement.js <app dir>; every performed step carries a body-arrangement line (hands, legs, gaze) on both sides of the mode
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
Object.assign(pk,{role:'ask',ent:'random',mode:'B',cat:'auto',size:0,rank:'mid',wishText:'ให้ได้เลื่อนตำแหน่ง'});
const m=X.summon(S.me);S.pact=m;let n=0;while(m.stage==='meetG'&&n<5){X.offerAsk(S.me,[[2,5]][0]);n++}
if(m.stage==='offerG'&&m.offer.paid>=5){m.confirmed5=true;X.perform(S.me)}
o.push('steps '+m.night.steps.length);m.night.steps.forEach(s=>o.push('- '+s.slice(-420)));
const sp=X.scenePrompt(S.me);const i=sp.indexOf('<finish>');o.push(sp.slice(i,i+1500));
// give side
Object.assign(pk,{role:'give',mode:'B',ent:'deity'});const g=X.newPerson(S.me,'deity','B','mid');S.pact=g;g.rung=5;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'){g.confirmed5=true;X.perform(S.me);o.push('give last step: '+g.night.steps[g.night.steps.length-1].slice(-330))}
X._test=false;return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
