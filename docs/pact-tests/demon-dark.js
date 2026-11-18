// usage: node demon-dark.js <app dir>; pact: "dark" for the demon is his sex and the pregnancy (not fear): he owns and breeds, fucks hard by rank, holds her, talks possessively in plain words, comes inside and stays, fills again, marks the womb; by the last step (hand / mouth / outside / inside); adults who agree, she can stop at once; gods unchanged; the demon goddess on the ask side pins and keeps him inside (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
const mk=(ent,rank,wishId)=>{Object.assign(pk,{role:'give',mode:'B',ent});const g=X.newPerson(S.me,ent,'B',rank,wishId?{wishId}:undefined);S.pact=g;return g;};
const run=(g,rung)=>{try{g.rung=rung;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'&&g.offer.paid>=rung){if(g.offer.paid>=5)g.confirmed5=true;X.perform(S.me);return g.night.paid===rung;}}catch(e){}return false;};
const Q=X.DARKSEX,all=[].concat(Object.values(Q.force.pen),Object.values(Q.force.oral),Q.hold,Q.claim,Q.breed.in,Q.breed.out,Q.breed.mouth,Q.breed.hand,Q.after,Q.ask.force,Q.ask.claim,Q.ask.breed,[Q.rules]).join(' ');
ck('the kit: force for 4 ranks x (penetration, mouth), 6 ways of holding, 7 possessive lines, 6 ways of breeding inside, outside / mouth / hand, 3 afterwards',Object.keys(Q.force.pen).length===4&&Object.keys(Q.force.oral).length===4&&Q.hold.length>=6&&Q.claim.length>=7&&Q.breed.in.length>=6&&Q.breed.out.length>=2&&Q.breed.mouth.length>=2&&Q.breed.hand.length>=2&&Q.after.length>=3);
ck('adults who agree: the rule says she can stop at any moment, he stops at once, no wound, no real pain',/หยุดได้ทุกเมื่อ/.test(Q.rules)&&/เขาหยุดทันที/.test(Q.rules)&&/ไม่มีบาดแผลหรือความเจ็บจริง/.test(Q.rules));
ck('no wound, blood, killing or torture anywhere in the kit',!/ฆ่า|ตาย|เลือด|ทรมาน|ข่มขืน|บาดเจ็บ|ฉีกขาด|ตบ|ทุบ/.test(all));
ck('plain spoken words in his lines (เย็ด / แตกใน / หี / ควย), no written-style words',/เย็ด/.test(all)&&/แตกใน/.test(all)&&/หี/.test(all)&&/ควย/.test(all)&&!/ปล่อย|ถอย|ถอด|จบ/.test(Q.claim.concat(Q.breed.in).join(' ')));
// the scene, by rank, at the full ceremony (step 5)
for(const rank of ['low','mid','high','supreme']){let g=null;for(let i=0;i<60&&!g;i++){const q=mk('demon',rank,'job');if(run(q,5))g=q;}
 if(!g){o.push('(no step-5 demon night for '+rank+')');continue;}const sp=X.scenePrompt(S.me);
 ck(rank+' step 5: <dark> with the rules, THIS rank\'s force, holding, possessive lines, breeding inside, afterwards',/<dark>/.test(sp)&&sp.includes(Q.rules)&&sp.includes(Q.force.pen[rank])&&Q.hold.some(h=>sp.includes(h))&&Q.claim.some(c=>sp.includes(c))&&Q.breed.in.some(x=>sp.includes(x))&&Q.after.some(x=>sp.includes(x)));
 ck(rank+': the other ranks\' force is not there',['low','mid','high','supreme'].filter(r=>r!==rank).every(r=>!sp.includes(Q.force.pen[r])));
 ck(rank+': no <twist>, no fear-atmosphere block',!/<twist>/.test(X.ripplePrompt(S.me))&&!/สิ่งที่เธอรู้สึกผิดปกติในห้อง/.test(sp)&&!g.log.some(l=>l.k==='tell'));}
// by the last step
const byStep={};for(const [rung,kind] of [[4,'out'],[3,'mouth'],[2,'mouth'],[1,'hand']]){let g=null;for(let i=0;i<80&&!g;i++){const q=mk('demon','high','job');if(run(q,rung))g=q;}
 if(!g){o.push('(no night at step '+rung+')');continue;}const sp=X.scenePrompt(S.me);byStep[rung]=1;
 ck('step '+rung+': the ending is the '+kind+' one, not the inside one',Q.breed[kind].some(x=>sp.includes(x))&&!Q.breed.in.some(x=>sp.includes(x))&&/<dark>/.test(sp));
 if(rung<=3)ck('step '+rung+': the mouth/hand force text, not the penetration one',sp.includes(Q.force.oral.high)&&!sp.includes(Q.force.pen.high));
 else ck('step 4: penetration force',sp.includes(Q.force.pen.high));}
// seeded and varied
const a=mk('demon','mid','job');a.night={paid:5};const t1=X.darkText(a),t2=X.darkText(a);ck('same night, same text',t1===t2);
const vs=new Set();for(let i=0;i<30;i++){const q=mk('demon','mid','job');q.night={paid:5};vs.add(X.darkText(q));}ck('30 demons, many different texts ('+vs.size+')',vs.size>=20);
// the pregnancy, dark: body and desire, claim; no harm
const later=X.DEMON_CHILD.later.join(' ');ck('the years after a child: body and desire (heat, wet dreams, tight breasts, he marks the child) and still no harm',/ความต้องการ/.test(later)&&/เปียกและร้อน/.test(later)&&/หน้าอกตึง/.test(later)&&/เครื่องหมายเล็ก ๆ ของเขา/.test(later)&&!/ฆ่า|ตาย|เลือด|ทรมาน/.test(later));
// gods and others: none
for(const ent of ['deity','playful','unclear']){const g=mk(ent,'mid','job');g.night={paid:5};ck(ent+': no <dark>',X.darkText(g)==='');}
let gd=null;for(let i=0;i<30&&!gd;i++){const q=mk('deity','mid','job');if(run(q,3))gd=q;}if(gd){ck('a god\'s scene: no <dark>',!/<dark>/.test(X.scenePrompt(S.me)));}
// ask side: a demon goddess
let ga=null;for(let t=0;t<80&&!ga;t++){Object.assign(pk,{role:'ask',ent:'demon',mode:'B',cat:'auto',size:0,rank:'mid',wishText:'ให้ได้เลื่อนตำแหน่ง'});const q=X.summon(S.me);S.pact=q;let n=0;while(q.stage==='meetG'&&n<5){X.offerAsk(S.me,[1,2,3,4,5]);n++}if(q.stage==='offerG'&&q.offer.paid>=5){q.confirmed5=true;try{X.perform(S.me);ga=q;}catch(e){}}}
if(ga){const sp=X.scenePrompt(S.me);ck('ask side demon goddess: <dark> where she pins, rides and keeps him inside, with her own lines',/<dark>/.test(sp)&&Q.ask.force.some(x=>sp.includes(x))&&Q.ask.claim.some(x=>sp.includes(x))&&Q.ask.breed.some(x=>sp.includes(x))&&/เธอเป็นฝ่ายคุมและเป็นฝ่ายเก็บเขาไว้ข้างใน/.test(sp));}else o.push('(no ask demon night)');
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
