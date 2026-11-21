// usage: node might-rank-intent.js <app dir>; pact giver side: the superhuman force depends on the kind (god / playful / demon / unclear) and the rank (what the break-through is like, what the seed is), and a high or supreme giver can will a pregnancy for a woman who is open to a child (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;
const ENTS=['deity','playful','demon','unclear'],RANKS=['low','mid','high','supreme'];
const mk=(ent,rank,over)=>{Object.assign(pk,{role:'give',mode:'B',ent});const g=X.newPerson(S.me,ent,'B',rank);if(over)Object.assign(g.w.data,over);return g;};
// the text differs by kind and by rank
const texts={};ENTS.forEach(e=>RANKS.forEach(r=>{const g=mk(e,r);texts[e+':'+r]=X.mightyOf(g);}));
ck('16 kind x rank texts, all different',new Set(Object.values(texts)).size===16);
ck('kind decides the way through and the seed (god leads, playful knocks, demon presses, unclear is formless)',/นำทาง/.test(texts['deity:mid'])&&/เคาะ/.test(texts['playful:mid'])&&/กดทะลุ/.test(texts['demon:mid'])&&/ไม่มีใครบอกได้/.test(texts['unclear:mid'])&&/อสุจิของเทพส่องแสง/.test(texts['deity:mid'])&&/อสุจิของปีศาจดำแดง/.test(texts['demon:mid']));
ck('rank decides what it is like afterwards (low: a flash and a fading warmth ... supreme: to the ovaries, no backflow)',/ชั้นต่ำ/.test(texts['deity:low'])&&/ชั้นกลาง/.test(texts['deity:mid'])&&/ท่อนำไข่/.test(texts['demon:high'])&&/รังไข่/.test(texts['playful:supreme'])&&/ไม่มีน้ำไหลย้อนออกมาเลย/.test(texts['unclear:supreme']));
ck('rank changes the seed too (same kind, different rank, different seed words)',/หิ่งห้อย/.test(texts['deity:low'])&&/ดวงจันทร์/.test(texts['deity:supreme'])&&/ตะกั่ว/.test(texts['demon:high'])&&/เตาถ่าน/.test(texts['demon:supreme']));
ck('nothing harms her: no wound words in any text',Object.values(texts).every(t=>!/เลือดออก|บาดเจ็บสาหัส|ฉีกขาด/.test(t.replace(/ห้ามเขียนว่า[^·]*/g,''))));
// the night carries it
const night=(ent,rank,over,intent)=>{try{const g=mk(ent,rank,over);S.pact=g;g.rung=5;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'&&g.offer.paid>=5){g.confirmed5=true;if(intent)X.toggleIntent(S.me);X.perform(S.me);return g;}return null;}catch(e){return null;}};
let seen=0,okTxt=0;for(let i=0;i<40&&seen<8;i++){const e=ENTS[i%4],r=RANKS[(i>>2)%4],g=night(e,r);if(!g||g.night.paid<5)continue;seen++;const t=g.night.relText||'';if(t.includes(X.mightyOf(g))&&/พลังเหนือมนุษย์ของ/.test(t))okTxt++;}
ck('the flood text of a real night carries that kind-and-rank text ('+okTxt+'/'+seen+')',seen>=4&&okTxt===seen);
// the willed pregnancy
const ic=(ent,rank,over)=>X.intentCheck(mk(ent,rank,over));
ck('the ability: only high and supreme',!ic('deity','low').has&&!ic('demon','mid').has&&ic('deity','high').has&&ic('demon','supreme').has);
ck('open to a child: ok',ic('deity','high',{sexAnxiety:[],kids:'อยากมี'}).ok&&ic('demon','supreme',{sexAnxiety:[],kids:'ไม่แน่ใจ'}).ok);
const fear=ic('demon','supreme',{sexAnxiety:['กลัวตั้งครรภ์'],kids:'อยากมี'}),no=ic('deity','high',{sexAnxiety:[],kids:'ไม่อยากมี'});
ck('her limit is never overridden: fear of pregnancy / no child: not ok, with the reason',fear.has&&!fear.ok&&/กลัวการตั้งครรภ์/.test(fear.why)&&no.has&&!no.ok&&/ไม่อยากมีลูก/.test(no.why));
// toggling and performing
let w=null;for(let i=0;i<40&&!w;i++){w=night(['deity','demon','playful','unclear'][i%4],i%2?'high':'supreme',{sexAnxiety:[],kids:'อยากมี'},true);if(w&&!w.night.intent)w=null;}
if(w){const N=w.night;ck('willed night: conceived for certain, 100%, marked',N.conceived===true&&N.pct===100&&N.intent===true);
 ck('the log says it was willed',w.log.some(l=>l.k==='intent'&&/ตั้งใจให้/.test(l.line)));
 const sp=X.scenePrompt(S.me);ck('scene prompt: <intent> block with the kind\'s way of willing, and the conception scene',/<intent>/.test(sp)&&X.MIGHT.will[w.ent]&&sp.includes(X.MIGHT.will[w.ent])&&/<conception>/.test(sp)&&/ขีดจำกัดของเธอยังเป็นของเธอ/.test(sp));
 ck('the result of the wish shows the pregnancy',w.ripple.some(r=>r.preg));}else o.push('(no willed night reached)');
// not willed: ordinary dice, no block
let nw=null;for(let i=0;i<40&&!nw;i++){nw=night('demon','supreme',{sexAnxiety:[],kids:'อยากมี'},false);}
if(nw){ck('not willed: no <intent>, no intent mark',!nw.night.intent&&!/<intent>/.test(X.scenePrompt(S.me)));}
// the button / explanation on the page
let pg=null;for(let i=0;i<40&&!pg;i++){const g=mk('demon','supreme',{sexAnxiety:[],kids:'อยากมี'});S.pact=g;g.rung=5;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'&&g.offer.paid>=5)pg=g;}
if(pg){let h=X.html();ck('page: the willing-pregnancy button is offered to a high giver (woman open to a child)',/data-act="ptintent"/.test(h)&&/ตั้งใจให้เธอท้องได้ ติดแน่นอน/.test(h));
 X.onAct('ptintent',{dataset:{}});h=X.html();ck('page: after pressing it is shown as on',pg.intent===true&&/ตั้งใจให้เธอท้อง<\/button>/.test(h)&&/aria-pressed="true"/.test(h));}
let pf=null;for(let i=0;i<40&&!pf;i++){const g=mk('demon','supreme',{sexAnxiety:['กลัวตั้งครรภ์'],kids:'อยากมี'});S.pact=g;g.rung=5;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'&&g.offer.paid>=5)pf=g;}
if(pf){const h=X.html();ck('page: an unwilling woman gets no button, only the reason',!/data-act="ptintent"/.test(h)&&/ใช้ไม่ได้ — /.test(h)&&/กลัวการตั้งครรภ์/.test(h));let thrown=false;try{X.toggleIntent(S.me);}catch(e){thrown=true;}ck('toggling anyway is refused',thrown&&!pf.intent);}
let pl=null;for(let i=0;i<40&&!pl;i++){const g=mk('deity','low',{sexAnxiety:[],kids:'อยากมี'});S.pact=g;g.rung=5;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'&&g.offer.paid>=5)pl=g;}
if(pl){ck('page: a low giver has no such ability, nothing is shown',!/data-act="ptintent"/.test(X.html())&&!/พลังตั้งใจให้ท้อง/.test(X.html()));}
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
