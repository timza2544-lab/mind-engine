// usage: node patron-memory.js <app dir>; a goddess who finished a dealing becomes a known patron: she returns as herself, remembers debt/good standing, price shifts, memory reaches the scene prompt
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,o=[];
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};S.chars=[];S.game=S.game||{};
X.load();S.pactPick=S.pactPick||{};const pk=S.pactPick;Object.assign(pk,{role:'ask',ent:'random',mode:'B',cat:'auto',size:0,rank:'random'});pk.wishText='ให้แม่หายป่วย';
const deal=(offer)=>{const m=X.summon(S.me);S.pact=m;let n=0;while(m.stage==='meetG'&&n<4){X.offerAsk(S.me,offer);n++}
 if(m.stage==='offerG'&&m.offer.paid>0){ if(m.offer.paid>=5&&X.askPregOK(m)&&!m.confirmed5){m.confirmed5=true} X.perform(S.me)}
 return m};
let m=deal(5);o.push('1st: arch '+m.arch+' name '+m.ctx.her+' stage '+m.stage+' left '+!!m.left+' patrons '+X.patrons().length);
const pat=X.patrons()[0];o.push('patron '+(pat&&pat.name)+' deals '+(pat&&pat.deals.length)+' standing '+JSON.stringify(X.standing(pat)));
if(!pat)return o.join('\n');
// make her owed money, then call her back
pat.deals.push({seed:'fake1',at:1,wish:'x',cat:'any',ask:3,paid:1,short:2,over:0,how:'done',good:1,bad:1});
pk.patron=pat.id;const m2=X.summon(S.me);o.push('2nd: same arch '+(m2.arch===pat.arch)+' same name '+(m2.ctx.her===pat.name)+' rank '+m2.rank+' memo '+JSON.stringify(m2.memo));
o.push('log '+m2.log.filter(x=>x.k==='memory').map(x=>x.line).join('|').slice(0,350));
S.pact=m2;o.push('adj '+X.priceAdj(pat)+' ask '+m2.ask);
o.push('html has patron note '+/จำฉันได้/.test(X.html()));
// good record -> regular
pat.deals=[1,2,3].map(i=>({seed:'g'+i,at:i,wish:'w',cat:'any',ask:3,paid:3,short:0,over:0,how:'done',good:3,bad:0}));o.push('regular adj '+X.priceAdj(pat)+' '+JSON.stringify(X.standing(pat)));
S.pact=null;S.game.mode='pact';const h=X.html();o.push('setup shows patrons '+/ผู้ให้พรที่รู้จักฉัน/.test(h));
// facts reach the prompt
S.pact=m2;m2.stage='ripple';
pk.patron=pat.id;pat.deals=[{seed:'d1',at:1,wish:'ขอเงิน',cat:'any',ask:3,paid:1,short:2,over:0,how:'done',good:1,bad:1}];const m3=deal(5);const sp=X.scenePrompt(S.me);o.push('prompt has memory '+/ความทรงจำของเธอที่มีต่อฉัน/.test(sp)+' patron deals now '+X.patrons()[0].deals.length+' same patron '+(m3.patron===pat.id)+' count patrons '+X.patrons().length);
// persistence
X.save();const raw=JSON.parse(localStorage.getItem('anima.pact.v1'));o.push('saved patrons '+(raw.patrons||[]).length);
o.push('selfTest '+JSON.stringify(X.selfTest()).slice(0,90)+' patrons after '+X.patrons().length);
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}}));console.log(errs.join('|')||'none');await b.close()})();
