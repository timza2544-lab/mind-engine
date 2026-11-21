// usage: node conception-and-act-positions.js <app dir>; steps 1-3 carry explicit positions, a conceived night adds the <conception> block and rule, normal nights do not, womb-passage lines and styles appear more often
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,F=A.finishLib,o=[];
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
Object.assign(pk,{role:'ask',ent:'random',mode:'B',cat:'child',size:0,rank:'mid',wishText:'ขอลูกสักคน'});
let m,ok=0,t=0;while(!ok&&t++<60){m=X.summon(S.me);S.pact=m;let n=0;while(m.stage==='meetG'&&n<5){X.offerAsk(S.me,[1,2,3,4,5][0]);n++}if(m.stage==='offerG'&&m.offer.paid>=1){X.offerAsk&&0;ok=1}}
// make a night with steps 1,2,3 and 5
m=X.summon(S.me);S.pact=m;m.stage='meetG';let k=0;while(m.stage==='meetG'&&k++<5)X.offerAsk(S.me,[1,2,3,5]);if(m.stage==='offerG'&&m.offer.paid>=5){m.confirmed5=true;X.perform(S.me);
 m.night.steps.forEach((s,i)=>{const q=s.indexOf('ท่าที่ใช้ในขั้นนี้');o.push('step '+(i+1)+': '+(q>=0?s.slice(q,q+330):'(none)'))});
 const sp0=X.scenePrompt(S.me);o.push('normal night has <conception>: '+sp0.includes('<conception>'));
 m.night.conceived=true;m.night.pct=14.2;m.g0=m.g0||{day:13,len:28,ov:14,pct:14.2};const sp=X.scenePrompt(S.me);const i=sp.indexOf('<conception>\nข้อเท็จจริง');o.push('conceived: block '+(i>=0)+' rule8 '+sp.includes('ข้อยกเว้นของข้อห้ามเฉลยผลตั้งครรภ์'));o.push(sp.slice(i,i+1100))}
else o.push('no tier-5 night this run (price/refusal)');
let w=0,n=0;for(let i=0;i<300;i++){F.recent.length=0;const f=F.pick({seed:'w'+i,n:1+i%3,came:1,w:null,buildup:60});n++;if(f.womb)w++}o.push('womb line in '+w+'/'+n+' picks');
const cnt={};for(let i=0;i<600;i++){F.recent.length=0;const f=F.pick({seed:'v'+i,n:1,came:1,w:null,buildup:60});cnt[f.id]=(cnt[f.id]||0)+1}o.push('womb-ish style share: '+['womb','deep','lock','draw'].map(x=>x+':'+(cnt[x]||0)).join(' ')+' (uniform would be ~12 each)');
X._test=false;return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
