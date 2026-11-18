// usage: node demon-dark.js <app dir>; pact: the demon is darker and more real: what she senses (by rank), how he speaks and touches, what he notices, one small clause he adds, and a literal-letter twist in the result; control not cruelty (no harm, no force, she can stop); gods are unchanged (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
const mk=(ent,rank,wishId)=>{Object.assign(pk,{role:'give',mode:'B',ent});const g=X.newPerson(S.me,ent,'B',rank,wishId?{wishId}:undefined);S.pact=g;return g;};
const run=(g,rung)=>{try{g.rung=rung;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'&&g.offer.paid>=Math.min(rung,3)){if(g.offer.paid>=5)g.confirmed5=true;X.perform(S.me);return true;}}catch(e){}return false;};
const D0=X.DARK;
ck('the kit: tells for every rank + common, 9 speech tricks, 6 touches, 4 notices, 6 clauses, 5 twists',['low','mid','high','supreme','all'].every(k=>D0.tells[k].length>=3)&&D0.speech.length>=9&&D0.touch.length>=6&&D0.notice.length>=4&&D0.clause.length>=6&&D0.twist.length>=5);
const all=[].concat(...Object.values(D0.tells),D0.speech,D0.touch,D0.notice,D0.clause,D0.twist).join(' ');
ck('control, not cruelty: no killing, blood, torture, rape or force in any of the kit',!/ฆ่า|ตาย|เลือด|ทรมาน|ข่มขืน|บังคับเธอ|ฝืนใจ|ทุบ|ตบ/.test(all));
ck('he never takes the choice from her: the touches say she can close her eyes or stop',D0.touch.some(t=>/หลับตาหรือบอกหยุดได้เสมอ/.test(t)));
// the scene, by rank
const seenTells={};for(const rank of ['low','mid','high','supreme']){let g=null;for(let i=0;i<30&&!g;i++){const q=mk('demon',rank,'job');if(run(q,3))g=q;}
 if(!g){o.push('(no demon night for '+rank+')');continue;}const sp=X.scenePrompt(S.me),T=X.darkTells(g);seenTells[rank]=T;
 ck(rank+': <dark> with the rules, 3 sensed details of this rank, speech, touch, what he notices, the quiet clause',/<dark>/.test(sp)&&/ไม่ทำร้ายเธอ ไม่ขู่ ไม่บังคับ/.test(sp)&&T.length===3&&T.every(t=>sp.includes(t))&&/วิธีพูดของเขา:/.test(sp)&&/วิธีสัมผัสของเขา:/.test(sp)&&/สิ่งที่เขาสังเกตเห็นในตัวเธอ:/.test(sp)&&/ข้อแม้เล็ก ๆ ข้อหนึ่ง/.test(sp)&&/ไม่เฉลยในฉาก/.test(sp));
 ck(rank+': the tells come from this rank or the common list, not another rank',T.every(t=>D0.tells[rank].includes(t)||D0.tells.all.includes(t)));
 const rp=X.ripplePrompt(S.me);ck(rank+': the result has <twist> with a technique, the clause, and a guard against harm',/<twist>/.test(rp)&&D0.twist.some(t=>rp.includes(t))&&D0.clause.some(c=>rp.includes(c))&&/ไม่ลงโทษเธอ ไม่รุนแรง/.test(rp)&&/ไม่ใช่ความเจ็บปวด/.test(rp));
 ck(rank+': the meeting log has what she noticed',g.log.some(l=>l.k==='tell'&&/สิ่งที่.+สังเกตเห็นผิดปกติ/.test(l.line)));}
ck('rank matters: a low and a supreme demon do not sense the same things (pools differ, no overlap of the rank-only lists)',!D0.tells.low.some(t=>D0.tells.supreme.includes(t)));
// the same demon is stable (seed), different demons differ
const a=mk('demon','mid','job'),a2=X.darkText(a),a3=X.darkText(a);ck('same night, same text',a2===a3);
const kinds=new Set();for(let i=0;i<30;i++){kinds.add(X.darkText(mk('demon','mid','job')));}ck('30 demons, many different dark texts ('+kinds.size+')',kinds.size>=24);
// the twist differs by night
const tw=new Set();for(let i=0;i<30;i++){tw.add(X.demonTwist(mk('demon','high','job')));}ck('twists vary ('+tw.size+')',tw.size>=11);
// gods and the ask side
for(const ent of ['deity','playful','unclear']){const g=mk(ent,'mid','job');ck(ent+': no <dark>, no <twist>, no tell in the log',X.darkText(g)===''&&X.demonTwist(g)===''&&!g.log.some(l=>l.k==='tell'));}
let gd=null;for(let i=0;i<30&&!gd;i++){const q=mk('deity','mid','job');if(run(q,3))gd=q;}if(gd){ck('a god\'s scene and result have none of it',!/<dark>/.test(X.scenePrompt(S.me))&&!/<twist>/.test(X.ripplePrompt(S.me)));}
// ask side: a demon goddess gets the dark block in the scene (not the twist, her own archetype twist stays)
let ga=null;for(let t=0;t<60&&!ga;t++){Object.assign(pk,{role:'ask',ent:'demon',mode:'B',cat:'auto',size:0,rank:'mid',wishText:'ให้ได้เลื่อนตำแหน่ง'});const q=X.summon(S.me);S.pact=q;let n=0;while(q.stage==='meetG'&&n<5){X.offerAsk(S.me,[1,2,3]);n++}if(q.stage==='offerG'&&q.offer.paid>0){try{X.perform(S.me);ga=q;}catch(e){}}}
if(ga){const sp=X.scenePrompt(S.me),rp=X.ripplePrompt(S.me);ck('ask side demon goddess: <dark> in the scene, no giver <twist> in the result',/<dark>/.test(sp)&&!/<twist>/.test(rp));}
else o.push('(no ask demon night)');
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
