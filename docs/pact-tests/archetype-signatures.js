// usage: node archetype-signatures.js <app dir>; each of the 28 archetypes has a signature line for steps 1-5 and every step of a performed night carries it
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
o.push('sig complete '+D.GODDESS.every(g=>D.SIG_ASK[g.id]&&D.SIG_ASK[g.id].length===6&&D.SIG_ASK[g.id].slice(1).every(Boolean)));
let ok=0,withSig=0,leak=0,tot=0;const orig=D.GODDESS.slice();
for(const g of orig){D.GODDESS=[g];for(let i=0;i<4;i++){Object.assign(pk,{role:'ask',ent:'random',mode:'B',cat:'auto',size:0,rank:'mid',wishText:'ให้ได้เลื่อนตำแหน่ง'});const m=X.summon(S.me);S.pact=m;let n=0;while(m.stage==='meetG'&&n<5){X.offerAsk(S.me,[[2,5],[3,5],m.ask,5,4][n%5]);n++}
 if(m.stage==='offerG'&&m.offer.paid>0){if(m.offer.paid>=5)m.confirmed5=true;X.perform(S.me);ok++;tot++;const sp=X.scenePrompt(S.me);if(m.night.steps.every(s=>/ลายเซ็นของ/.test(s)))withSig++;if(/\{she\}|\{me\}|\{wish\}|undefined/.test(sp))leak++}}}
D.GODDESS=orig;o.push('nights '+ok+' every step has signature '+withSig+' placeholder leaks '+leak);
const m=S.pact;o.push('sample: '+m.night.steps[m.night.steps.length-1].slice(-160));
X._test=false;return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
