// usage: node positions.js <app dir>; penetrative steps (4,5) carry a full explicit position on both sides, the main one goes with the peak step; both scene prompts hold the release rules and the position rule
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
const FR=A.world.FIN_RULE.slice(0,25),RR=A.RELEASE_RULE.slice(0,25);
Object.assign(pk,{role:'ask',ent:'random',mode:'B',cat:'auto',size:0,rank:'mid',wishText:'ให้ได้เลื่อนตำแหน่ง'});
let got=0,t=0;while(!got&&t++<40){const m=X.summon(S.me);S.pact=m;let n=0;while(m.stage==='meetG'&&n<5){X.offerAsk(S.me,[[4,5]][0]);n++}if(m.stage==='offerG'&&m.offer.paid>=5){m.confirmed5=true;X.perform(S.me);got=1;const sp=X.scenePrompt(S.me);o.push('ASK prompt: FIN '+sp.includes(FR)+' REL '+sp.includes(RR)+' POSRULE '+sp.includes('ท่าทางต้องเห็นภาพ'));m.night.steps.forEach((s,i)=>{const k=s.indexOf('ท่าที่ใช้ในขั้นนี้');o.push('step '+(i+1)+': '+(k>=0?s.slice(k,k+700):'(no position) '+s.slice(-200)))});o.push('pose '+JSON.stringify(X.posesOf(m)).slice(0,140))}}
Object.assign(pk,{role:'give',mode:'B',ent:'demon'});const g=X.newPerson(S.me,'demon','B','mid');S.pact=g;g.rung=5;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'){g.confirmed5=true;X.perform(S.me);const sp=X.scenePrompt(S.me);o.push('GIVE prompt: FIN '+sp.includes(FR)+' POSRULE '+sp.includes('ท่าทางต้องเห็นภาพ')+' last step has position '+/ท่าที่ใช้ในขั้นนี้/.test(g.night.steps[g.night.steps.length-1]))}
X._test=false;return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
