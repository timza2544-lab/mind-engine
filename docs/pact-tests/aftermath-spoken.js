// usage: node aftermath-spoken.js <app dir>; pact: (1) the scene and the result speak spoken Thai (rule + stock by last step, no written-style words in the stocks), (2) the result of the wish carries what the LAST step left behind, (3) she sometimes comes back to ask for him, likelier the further the ceremony went (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
// stocks are spoken: none of the written-style words
const WR=/จบ|ปล่อย|ถอย|ถอน|ถอด|กั้น|ข้างใน/;const all=[].concat(...Object.values(X.SPOKEN),...Object.values(X.AFTER.give),...Object.values(X.AFTER.ask),X.RETURN.give,X.RETURN.ask);
ck('spoken stocks, aftermath and return lines have no written-style word ('+all.length+' lines)',all.every(l=>!WR.test(l)));
ck('act labels use แตก, not ปล่อย',/แตกนอก/.test(D.RUNG_ASK[4])&&/แตกใน/.test(D.RUNG_ASK[5])&&!/ปล่อย/.test(D.RUNG_ASK.join()));
ck('ritual texts say แตกใน / แตกนอก for the act',!/ปล่อย(ใน|ข้างใน|นอก|บน)/.test(JSON.stringify(D.RITUAL))&&!/ปล่อย(ใน|ข้างใน|นอก|บน)/.test(JSON.stringify(D.RITUAL_ASK)));
// the giver mode, ceremonies of different length
const givenight=(rung,ent)=>{Object.assign(pk,{role:'give',mode:'B',ent:ent||'deity'});const g=X.newPerson(S.me,ent||'deity','B','mid');S.pact=g;g.rung=rung;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'){if(g.offer.paid>=5)g.confirmed5=true;X.perform(S.me);return g;}return null;};
const g5=givenight(5);if(g5){const rp=X.ripplePrompt(S.me),sp=X.scenePrompt(S.me),K=g5.night.paid;
 ck('give: scene prompt has the spoken rule and a stock for the last step ('+K+')',/ภาษาพูดในคำพูดทุกคำ/.test(sp)&&X.SPOKEN[K].some(l=>sp.includes(l))&&/ห้ามภาษาเขียนหรือคำอ้อม/.test(sp));
 ck('give: ripple prompt has <aftermath> tied to the last step ('+K+') and her own lines',/<aftermath>/.test(rp)&&new RegExp('ขั้น '+K+': ').test(rp)&&X.AFTER.give[K].some(l=>rp.includes(l)));
 ck('give: ripple prompt asks for traces at least twice (early and late)',/อย่างน้อยสองครั้ง/.test(rp)&&/ภาษาพูด/.test(rp));}else o.push('(giver step-5 night not reached)');
const g2=givenight(2);if(g2){const rp=X.ripplePrompt(S.me);ck('give step 2: the aftermath is about the mouth, not the womb',/<aftermath>/.test(rp)&&X.AFTER.give[2].some(l=>rp.includes(l))&&!X.AFTER.give[5].some(l=>rp.includes(l))&&!X.AFTER.give[4].some(l=>rp.includes(l)));}
// the return: rate by how far it went
const rate=(rung,n)=>{let c=0,t=0;for(let i=0;i<n;i++){const g=givenight(rung,['deity','playful','demon','unclear'][i%4]);if(!g)continue;t++;if(X.returnRoll(g))c++;}return t?c/t:-1;};
const r1=rate(1,60),r5=rate(5,60);ck('return is rarer after a short ceremony than a full one ('+r1.toFixed(2)+' vs '+r5.toFixed(2)+')',r1>=0&&r5>=0&&r1<r5&&r5>=.55&&r1<=.55);
// a night that rolled a return carries the <return> block with plain, coarse spoken requests
let withRet=null;for(let i=0;i<40&&!withRet;i++){const g=givenight(5);if(g&&X.returnRoll(g))withRet=g;}
if(withRet){const rp=X.ripplePrompt(S.me);ck('return block: not another wish, asks for him in spoken words, does not change the ripple',/<return>/.test(rp)&&/ไม่ใช่เพื่อขอพรใหม่/.test(rp)&&/ไม่เปลี่ยนผลของพร/.test(rp)&&X.RETURN.give.some(l=>rp.includes(l)));
 const noRet=(()=>{for(let i=0;i<60;i++){const g=givenight(1);if(g&&!X.returnRoll(g))return g;}return null;})();if(noRet){const rp2=X.ripplePrompt(S.me);ck('no return block when the roll says no',!/<return>/.test(rp2));}}else o.push('(no return rolled in 40 nights)');
// the ask mode
for(const want of [2,5]){let m=null;for(let t=0;t<40&&!m;t++){Object.assign(pk,{role:'ask',ent:'random',mode:'B',cat:'auto',size:0,rank:'mid',wishText:'ให้ได้เลื่อนตำแหน่ง'});const q=X.summon(S.me);S.pact=q;let n=0;while(q.stage==='meetG'&&n<5){X.offerAsk(S.me,Array.from({length:want},(_,i)=>i+1));n++}if(q.stage==='offerG'&&q.offer.paid>0){if(q.offer.paid>=5)q.confirmed5=true;X.perform(S.me);if(q.night.steps.length===want)m=q;}}
 if(!m){o.push('(no ask night with '+want+' steps)');continue;}const rp=X.ripplePrompt(S.me),sp=X.scenePrompt(S.me);
 ck('ask '+want+': spoken rule in scene and ripple',/ภาษาพูดในคำพูดทุกคำ/.test(sp)&&/ภาษาพูดในคำพูดทุกคำ/.test(rp));
 ck('ask '+want+': aftermath on his side, tied to step '+want,/<aftermath>/.test(rp)&&new RegExp('ขั้น '+want+': ').test(rp)&&X.AFTER.ask[want].some(l=>rp.includes(l)));}
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
