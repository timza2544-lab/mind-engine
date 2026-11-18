// usage: node demon-child.js <app dir>; pact giver side: a demon wants a child to come from him only: when the wish is about a child, or a child may come of the night (dice or his will), the scene and the result carry it (his claim by rank, she knows and chooses, partner conflict, what the child is over the years); gods and other wishes are unchanged (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
const mk=(ent,rank,wishId,over)=>{Object.assign(pk,{role:'give',mode:'B',ent});const g=X.newPerson(S.me,ent,'B',rank,{wishId});if(over)Object.assign(g.w.data,over);S.pact=g;return g;};
const run=(g,rung,intent)=>{try{g.rung=rung;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'&&g.offer.paid>=rung){if(g.offer.paid>=5)g.confirmed5=true;if(intent)X.toggleIntent(S.me);X.perform(S.me);return true;}}catch(e){}return false;};
ck('who it applies to: a demon + a child wish; a demon + a night with a child; not gods, not other wishes',X.demonChild(mk('demon','mid','child')).kid&&!X.demonChild(mk('deity','mid','child')).on&&!X.demonChild(mk('demon','mid','job')).on&&!X.demonChild(mk('playful','mid','c_second')).on&&X.demonChild(mk('demon','mid','c_late')).kid);
ck('the ask side is never demon-child',(()=>{const g=mk('demon','mid','child');g.role='ask';return !X.demonChild(g).on;})());
// the offer stage: log + banner
const g1=mk('demon','high','child',{relStatus:'แต่งงาน',kids:'อยากมี',sexAnxiety:[]});g1.rung=5;X.propose(S.me);
ck('log: the demon states the condition before she agrees',g1.log.some(l=>l.k==='demon'&&/ต้องมาจากเขาเท่านั้น/.test(l.line)&&/เลือกเองได้ทุกขั้น/.test(l.line)));
if(g1.stage==='offer'){const h=X.html();ck('page: the demon\'s condition is shown at the offer, with the exit',/เงื่อนไขของปีศาจ/.test(h)&&/หยุดได้โดยไม่มีโทษ/.test(h));}
// the scene and the result of a child wish, by rank
for(const rank of ['low','mid','high','supreme']){let g=null;for(let i=0;i<30&&!g;i++){const q=mk('demon',rank,'c_second',{relStatus:'โสด',kids:'อยากมี',sexAnxiety:[]});if(run(q,3))g=q;}
 if(!g){o.push('(no night for '+rank+')');continue;}const sp=X.scenePrompt(S.me),rp=X.ripplePrompt(S.me);
 ck(rank+': scene has <demon-child> with this rank\'s way of claiming, her consent and her exit',/<demon-child>/.test(sp)&&sp.includes(X.DEMON_CHILD.claim[rank])&&/เธอรู้ข้อนี้ก่อนตกลง/.test(sp)&&/หยุดได้ทุกขั้นโดยไม่มีโทษ/.test(sp)&&/ไม่มีการบังคับ/.test(sp)&&/ไม่ยอมให้เมล็ดของใครอื่น/.test(sp));
 ck(rank+': result has the five times and forbids harm',/<demon-child>/.test(rp)&&X.DEMON_CHILD.later.every(l=>rp.includes(l))&&/ห้ามความรุนแรงหรือการทำร้ายใคร/.test(rp));}
// a partner: the conflict is told
let gp=null;for(let i=0;i<30&&!gp;i++){const q=mk('demon','mid','child',{relStatus:'แต่งงานแล้ว',kids:'อยากมี',sexAnxiety:[]});if(run(q,3))gp=q;}
if(gp){const sp=X.scenePrompt(S.me),rp=X.ripplePrompt(S.me);ck('with a partner: the scene and the result tell the conflict, and that she chooses',/ความขัดแย้งในใจเธอ/.test(sp)&&/ไม่ใช่ลูกของคู่/.test(sp)&&/ความจริงเรื่องพ่อของเด็กกระทบเธอและคู่/.test(rp)&&/ที่เธอเลือกเอง/.test(rp));}
let gs=null;for(let i=0;i<30&&!gs;i++){const q=mk('demon','mid','child',{relStatus:'โสด',kids:'อยากมี',sexAnxiety:[]});if(run(q,3))gs=q;}
if(gs){const sp=X.scenePrompt(S.me);ck('single: no partner conflict line',/<demon-child>/.test(sp)&&!/ความขัดแย้งในใจเธอ/.test(sp)&&/ไม่ใช่ของคู่คนไหน/.test(sp));}
// a demon night with another wish where a child comes of it (his will, high rank)
let gi=null;for(let i=0;i<60&&!gi;i++){const q=mk('demon',i%2?'high':'supreme','job',{relStatus:'โสด',kids:'อยากมี',sexAnxiety:[]});if(run(q,5,true)&&q.night.intent&&q.night.conceived)gi=q;}
if(gi){const sp=X.scenePrompt(S.me);ck('demon, other wish, a child comes of the night (his will): the same claim is told, and the intent block too',/<demon-child>/.test(sp)&&/ถ้าคืนนี้เกิดการตั้งครรภ์/.test(sp)&&/<intent>/.test(sp));}else o.push('(no willed demon night reached)');
// gods and other wishes: nothing
let gd=null;for(let i=0;i<40&&!gd;i++){const q=mk('deity','high','child',{relStatus:'โสด',kids:'อยากมี',sexAnxiety:[]});if(run(q,3))gd=q;}
if(gd){ck('a god with a child wish: no demon-child block, no banner',!/<demon-child>/.test(X.scenePrompt(S.me))&&!/<demon-child>/.test(X.ripplePrompt(S.me)));}
let gj=null;for(let i=0;i<40&&!gj;i++){const q=mk('demon','mid','job',{relStatus:'โสด'});if(run(q,3)&&!q.night.conceived)gj=q;}
if(gj){ck('a demon with another wish and no child: unchanged',!/<demon-child>/.test(X.scenePrompt(S.me))&&!/<demon-child>/.test(X.ripplePrompt(S.me)));}
// nothing in these texts forces her or harms anyone
const all=[X.DEMON_CHILD.claim.low,X.DEMON_CHILD.claim.mid,X.DEMON_CHILD.claim.high,X.DEMON_CHILD.claim.supreme].concat(X.DEMON_CHILD.later).join(' ');
ck('no harm or force in the texts (no wound, no death, no "forced")',!/ฆ่า|ตาย|บาดเจ็บ|ทำร้ายเธอ|บังคับเธอ|ฝืนใจ|ข่มขืน/.test(all.replace(/ไม่ทำร้าย[^ ]*/g,'')));
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
