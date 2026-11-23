// usage: node new-archetypes.js <app dir>; forces each of the 10 archetypes added in v189 through summon/offer/perform and checks their price rules
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};S.chars=[];S.game=S.game||{};X.load();X._test=true;
S.pactPick=S.pactPick||{};const pk=S.pactPick;const ids=['death','memory','serpent','music','temple','bargain','weaver','celestial','contract','dawn'];
const orig=D.GODDESS.slice();const res={};
for(const id of ids){const g=orig.find(x=>x.id===id);D.GODDESS=[g];let ok=0,gone=0,err=0,asks=new Set(),html=0;
 for(let i=0;i<24;i++){Object.assign(pk,{role:'ask',ent:'random',mode:'B',cat:'auto',size:0,rank:['low','mid','high','supreme'][i%4],wishText:['ให้แม่หายป่วย','ให้ได้เลื่อนตำแหน่ง','ให้คนที่ชอบกลับมาคุย','ขอเงินก้อนหนึ่ง'][i%4]});
  try{const m=X.summon(S.me);S.pact=m;asks.add(m.ask);let n=0;while(m.stage==='meetG'&&n<5){X.offerAsk(S.me,[1,3,5,m.ask,[2,5]][n%5]);n++}
   if(m.stage==='offerG'&&m.offer.paid>0){ if(m.offer.paid>=5)m.confirmed5=true; X.perform(S.me);ok++; if(/\{|undefined/.test(X.scenePrompt(S.me).slice(0,0)))err++; if(X.html().length>500)html++} else gone++;
  }catch(e){err++;if(err<3)o.push(id+' ERR '+e.message)}}
 res[id]=`ok ${ok} gone ${gone} err ${err} asks ${[...asks].sort().join('')}`}
D.GODDESS=orig;
for(const id of ids)o.push(id+': '+res[id]);
// rule checks
const mk=(id)=>{D.GODDESS=[orig.find(x=>x.id===id)];Object.assign(pk,{rank:'mid',wishText:'ขอเงิน',cat:'auto',size:0});const m=X.summon(S.me);D.GODDESS=orig;return m};
let mins={death:9,contract:9},bad=0;for(let i=0;i<30;i++){const d=mk('death');mins.death=Math.min(mins.death,d.ask);const c=mk('contract');mins.contract=Math.min(mins.contract,c.ask);const s=mk('serpent');if(![3,4,5].includes(s.ask))bad++}
o.push('min ask death '+mins.death+' contract '+mins.contract+' serpent bad '+bad);
X._test=false;return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}}));console.log(errs.join('|')||'none');await b.close()})();
