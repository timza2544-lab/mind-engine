// usage: node giver-signatures.js <app dir>; give-side: each of the 4 giver kinds has a signature for steps 1-5 and every step of a performed night carries it
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
o.push('SIG_GIVE complete '+['deity','playful','demon','unclear'].every(k=>D.SIG_GIVE[k]&&D.SIG_GIVE[k].length===6&&D.SIG_GIVE[k].slice(1).every(Boolean)));
const by={},leak=[];let tot=0,withSig=0;
for(let i=0;i<48;i++){Object.assign(pk,{role:'give',mode:i%2?'A':'B',ent:['deity','playful','demon','unclear'][i%4],rank:'random',size:0});
 try{S.pact=null;S.pactNew=null;const m=X.newPerson(S.me,pk.ent,pk.mode,'mid');S.pact=m;
  for(let a=0;a<3&&m.stage!=='offer'&&m.stage!=='ripple';a++){ if(m.stage==='meet'){m.rung=5;X.propose(S.me)} else if(m.stage==='haggle'){X.accept(S.me)} }
  if(m.stage==='offer'){ if(m.offer.paid>=5)m.confirmed5=true; if(m.offer.paid>=1){X.perform(S.me);tot++;if(m.night.steps.every(s=>/ลักษณะของ/.test(s)))withSig++;const sp=X.scenePrompt(S.me);if(/\{her\}|\{him\}|undefined/.test(sp))leak.push(m.ent);(by[m.ent]=by[m.ent]||0)+1}}
 }catch(e){o.push('ERR '+e.message.slice(0,80))}}
o.push('nights '+tot+' all steps have signature '+withSig+' leaks '+leak.length+' by '+JSON.stringify(by));
if(S.pact&&S.pact.night)o.push('sample '+S.pact.night.steps[S.pact.night.steps.length-1].slice(-170));
X._test=false;return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
