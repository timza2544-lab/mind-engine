// usage: node archetype-poses.js <app dir>; every archetype has 3 poses (first = the original), the night's main pose reaches the scene prompt, the alternate shows on multi-step nights, the image prompt carries it
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
o.push('all have poses '+D.GODDESS.every(g=>Array.isArray(g.poses)&&g.poses.length>=3&&g.poses[0]===g.pos)+' counts '+[...new Set(D.GODDESS.map(g=>g.poses.length))]);
const seen={};let ok=0,hit=0,altN=0;
for(let i=0;i<60;i++){Object.assign(pk,{role:'ask',ent:'random',mode:'B',cat:'auto',size:0,rank:'mid',wishText:'ให้ได้เลื่อนตำแหน่ง'});const m=X.summon(S.me);S.pact=m;let n=0;while(m.stage==='meetG'&&n<5){X.offerAsk(S.me,[[2,5],[2,4],[3,5],m.ask,5][n%5]);n++}
 if(m.stage==='offerG'&&m.offer.paid>0){if(m.offer.paid>=5)m.confirmed5=true;X.perform(S.me);ok++;const sp=X.scenePrompt(S.me),ps=X.posesOf(m);if(sp.includes(ps.main))hit++;if(m.night.acts.length>1&&ps.alt&&sp.includes(ps.alt))altN++;(seen[m.arch]=seen[m.arch]||new Set()).add(ps.main);
  if(/undefined/.test(sp))o.push('undefined in prompt '+m.arch)}}
o.push('nights '+ok+' main pose in prompt '+hit+' alt shown '+altN);
const rep=Object.keys(seen).filter(k=>seen[k].size>1).length;o.push('archetypes seen with >1 distinct pose across nights: '+rep);
const ip=(()=>{const m=S.pact;return X.imagePrompt(m,'night')})();o.push('image prompt has pose '+ip.includes('ท่าประจำตนของเธอ'));
X._test=false;return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
