// usage: node god-sex.js <app dir>; pact giver side: gods get their own character as the demon has (a god is tender and overwhelming, a playful god plays, a formless one is felt everywhere): pace by rank, touches, spoken lines, what he says near his end and when she comes, how he finishes by step, after; and the demon gets near-the-end and she-comes talk too (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
const mk=(ent,rank,wishId)=>{Object.assign(pk,{role:'give',mode:'B',ent});const g=X.newPerson(S.me,ent,'B',rank,wishId?{wishId}:undefined);S.pact=g;return g;};
const run=(g,rung)=>{try{g.rung=rung;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'&&g.offer.paid>=rung){if(g.offer.paid>=5)g.confirmed5=true;X.perform(S.me);return g.night.paid===rung;}}catch(e){}return false;};
const G=X.GODSEX,KINDS=['deity','playful','unclear'],RK=['low','mid','high','supreme'];
const flat=x=>Array.isArray(x)?x:typeof x==='string'?[x]:Object.values(x).flatMap(flat);
// the kit
ck('rules for the three kinds',KINDS.every(k=>G.rules[k]&&/ผู้ใหญ่ทั้งคู่สมัครใจ/.test(G.rules[k])&&/หยุดได้ทุกเมื่อ/.test(G.rules[k])));
ck('pace: 2 lines per rank for every kind',KINDS.every(k=>RK.every(r=>G.pace[k][r].length>=2)));
ck('touches 8 / 8 / 6, talk 12 / 10 / 6, near 5 / 4 / 4, she-comes 4 / 4 / 3 (god / playful / formless)',G.touch.deity.length>=8&&G.touch.playful.length>=8&&G.touch.unclear.length>=6&&G.talk.deity.length>=12&&G.talk.playful.length>=10&&G.talk.unclear.length>=6&&G.near.deity.length>=5&&G.near.playful.length>=4&&G.near.unclear.length>=4&&G.herCome.deity.length>=4&&G.herCome.playful.length>=4&&G.herCome.unclear.length>=3);
ck('endings per kind: inside 6 / 5 / 4, outside, mouth, hand 2 each; after 5 / 4 / 3; second round 2; step-up reaction 2',G.breed.deity.in.length>=6&&G.breed.playful.in.length>=5&&G.breed.unclear.in.length>=4&&KINDS.every(k=>['out','mouth','hand'].every(t=>G.breed[k][t].length>=2))&&G.after.deity.length>=5&&G.after.playful.length>=4&&G.after.unclear.length>=3&&KINDS.every(k=>G.round2[k].length>=2&&G.stepUp[k].length>=2));
const all=flat(G).join(' ');
ck('plain spoken words only: none of จบ / ปล่อย / ถอย / ถอด / ถอน in any god line',!/จบ|ปล่อย|ถอย|ถอด|ถอน/.test(all));
ck('no wound, blood, killing, torture or force in any god line',!/ฆ่า|ตาย|เลือด|ทรมาน|ข่มขืน|บังคับเธอ|บาดเจ็บ|ฉีกขาด/.test(all));
const quoted=L=>L.flatMap(l=>l.match(/"[^"]*"/g)||[]);
ck('he speaks เรา/เจ้า (god, playful) and ฉัน/เธอ or no pronoun (formless): checked on the quoted speech only',quoted([...G.talk.deity,...G.talk.playful,...G.near.deity,...G.near.playful,...G.herCome.deity,...G.herCome.playful]).every(l=>!/ฉัน|เธอ/.test(l))&&quoted([...G.talk.unclear,...G.near.unclear,...G.herCome.unclear]).every(l=>!/เรา|เจ้า/.test(l))&&quoted(G.talk.unclear).some(l=>/ฉัน|เธอ/.test(l)));
ck('the demon got near-the-end and she-comes talk too',X.DARKSEX.near.length>=8&&X.DARKSEX.nearBody.length>=4&&X.DARKSEX.herCome.length>=6&&X.DARKSEX.herComeState.length>=4&&X.DARKSEX.slow.length>=2&&!/จบ|ปล่อย|ถอย|ถอด|ถอน/.test([].concat(X.DARKSEX.near,X.DARKSEX.herCome).join(' ')));
// the scene by kind: step 5 and step 2, came or not
let seenCame=false,seenNot=false,nights=0;
for(const ent of KINDS){for(const rank of RK){let g=null;for(let i=0;i<60&&!g;i++){const q=mk(ent,rank,'job');if(run(q,5))g=q;}
 if(!g){o.push('(no step-5 '+ent+' '+rank+' night)');continue;}nights++;const sp=X.scenePrompt(S.me),N=g.night;if(N.came)seenCame=true;else seenNot=true;
 ck(ent+' '+rank+' step 5: <divine>, no <dark>, this kind\'s rules and this rank\'s pace',/<divine>/.test(sp)&&!/<dark>/.test(sp)&&sp.includes(G.rules[ent])&&G.pace[ent][rank].some(x=>sp.includes(x)));
 ck(ent+' '+rank+': touches (3), talk (3), near (line + body), her coming or not, the inside ending (2), a second round, after',G.touch[ent].filter(x=>sp.includes(x)).length===3&&G.talk[ent].filter(x=>sp.includes(x)).length===3&&G.near[ent].some(x=>sp.includes(x))&&sp.includes(G.nearBody[ent])&&G.breed[ent].in.filter(x=>sp.includes(x)).length===2&&G.round2[ent].some(x=>sp.includes(x))&&G.after[ent].some(x=>sp.includes(x)));
 ck(ent+' '+rank+': '+(N.came?'she came: his words and her state':'she has not come: he adjusts first'),N.came?G.herCome[ent].some(x=>sp.includes(x))&&sp.includes(G.herComeState[ent])&&/ตอนเธอเสร็จ:/.test(sp):/ตอนเธอยังไม่ถึง: เขาปรับให้เธอตามทัน/.test(sp)&&!/ตอนเธอเสร็จ:/.test(sp));}}
o.push('real nights seen: '+nights+' (she came: '+seenCame+', not: '+seenNot+')');
for(const ent of KINDS){const q=mk(ent,'mid','job');q.night={paid:5,came:true};const t1=X.divineText(q);q.night={paid:5,came:false};const t0=X.divineText(q);ck(ent+': she came -> his words and her state; she did not -> he adjusts, no coming lines',/ตอนเธอเสร็จ:/.test(t1)&&G.herCome[ent].some(x=>t1.includes(x))&&/ตอนเธอยังไม่ถึง: เขาปรับให้เธอตามทัน/.test(t0)&&!/ตอนเธอเสร็จ:/.test(t0));}
for(const [rung,kind] of [[4,'out'],[3,'mouth'],[2,'mouth'],[1,'hand']]){let g=null;for(let i=0;i<80&&!g;i++){const q=mk('playful','mid','job');if(run(q,rung))g=q;}
 if(!g){o.push('(no playful night at step '+rung+')');continue;}const sp=X.scenePrompt(S.me);ck('playful step '+rung+': the '+kind+' ending, not the inside one',G.breed.playful[kind].some(x=>sp.includes(x))&&G.breed.playful.in.every(x=>!sp.includes(x)));}
// the demon: near / she comes lines
for(const rank of ['mid','supreme']){let g=null;for(let i=0;i<60&&!g;i++){const q=mk('demon',rank,'job');if(run(q,5))g=q;}if(!g){o.push('(no demon night '+rank+')');continue;}const sp=X.scenePrompt(S.me),Q=X.DARKSEX;
 ck('demon '+rank+': <dark> with his near-the-end line and body, and her coming (or his slowing), no <divine>',/<dark>/.test(sp)&&!/<divine>/.test(sp)&&Q.near.some(x=>sp.includes(x))&&Q.nearBody.some(x=>sp.includes(x))&&(g.night.came?Q.herCome.some(x=>sp.includes(x))&&Q.herComeState.some(x=>sp.includes(x)):Q.slow.some(x=>sp.includes(x))));}
// step-up reaction by kind
let su=null;for(let i=0;i<150&&!su;i++){const q=mk('deity','mid','job');Object.assign(q.w.data,{libido:95});q.rung=2;X.propose(S.me);q.offer.paid=2;q.offer.limit=5;q.overOK=true;if(X.overstepOf(q)){try{X.perform(S.me);su=q;}catch(e){}}}
if(su){const sp=X.scenePrompt(S.me);ck('a god: his reaction when she asks for more (and that it is her choice)',/ตอนเธอขอเกินขั้น/.test(sp)&&G.stepUp.deity.some(x=>sp.includes(x))&&/เธอเลือกเองและไม่เกินที่เธอรับได้/.test(sp));}else o.push('(no god step-up night)');
// variety and stability
const a=mk('deity','mid','job');a.night={paid:5,came:true};const t1=X.divineText(a),t2=X.divineText(a);ck('same night, same text',t1===t2&&t1.length>200);
const vs=new Set();for(let i=0;i<30;i++){const q=mk('playful','high','job');q.night={paid:5,came:true};vs.add(X.divineText(q));}ck('30 playful gods, almost all different texts ('+vs.size+')',vs.size>=27);
// the demon and the ask side are not touched by <divine>; a demon on the ask side keeps <dark>
for(const ent of ['demon']){const g=mk(ent,'mid','job');g.night={paid:5,came:true};ck('demon: no <divine> text',X.divineText(g)==='');}
ck('ask side: no <divine>',(()=>{const g=mk('deity','mid','job');g.role='ask';g.night={paid:5,came:true};return X.divineText(g)==='';})());
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
