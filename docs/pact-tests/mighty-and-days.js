// usage: node mighty-and-days.js <app dir>; pact: (1) today's list can be skipped to the next day / re-rolled / brought back to the real day, (2) the giver's superhuman force: every inside finish on the giver side sends the flood through to the womb for every woman (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};const pk=S.pactPick;Object.assign(pk,{role:'give',ent:'random',mode:'B',rank:'random'});
const toasts=[];A.ui.toast=m=>toasts.push(m);
// ---- days
S.pactDayOff=0;S.pactSalt=0;S.pactToday=null;S.pactCodex=[];const d0=X.todayVisitors(S.me),k0=d0.date;
let h=X.html();ck('page has the three day buttons logic: next day always, re-roll always, back only when skipped',/data-act="ptnextday"/.test(h)&&/data-act="ptreroll"/.test(h)&&!/data-act="ptdayreset"/.test(h));
ck('not everything handled: no "all done" line',!/จัดการครบทุกคนแล้ว/.test(h));
d0.list.forEach((v,i)=>{if(i%2)X.passVisitor(v.id);else X.takeVisitor(S.me,v.id);S.pact=null;});h=X.html();
ck('everything taken or passed: the page says so and makes the next-day button the main one',/จัดการครบทุกคนแล้ว/.test(h)&&/class="btn primary" data-act="ptnextday"/.test(h));
X.onAct('ptnextday',{dataset:{}});const d1=S.pactToday;ck('next day: a new date, a fresh list with nothing handled',d1.date!==k0&&S.pactDayOff===1&&Object.keys(d1.st).length===0&&d1.list.length>=3&&d1.list.length<=5);
h=X.html();ck('after skipping: the list says +1 day and offers the way back',/ข้ามมา \+1 วัน/.test(h)&&/data-act="ptdayreset"/.test(h)&&!/จัดการครบทุกคนแล้ว/.test(h));
ck('a toast says the day moved',toasts.some(t=>/ข้ามไปวันถัดไป|วันถัดไป/.test(t)));
const idsBefore=d1.list.map(v=>v.id+v.her).join();X.onAct('ptreroll',{dataset:{}});const d1b=S.pactToday;ck('re-roll: same date, a different list ('+d1b.salt+')',d1b.date===d1.date&&d1b.salt===1&&d1b.list.map(v=>v.id+v.her).join()!==idsBefore);
X.onAct('ptnextday',{dataset:{}});X.onAct('ptnextday',{dataset:{}});ck('three skips = +3 days and salt reset',S.pactDayOff===3&&S.pactSalt===0);
X.save();const raw=JSON.parse(localStorage.getItem('anima.pact.v1')||localStorage.getItem(Object.keys(localStorage).find(k=>/pact/.test(k))||'x')||'null');ck('the skipped days are saved',raw&&raw.dayOff===3);
X.onAct('ptdayreset',{dataset:{}});ck('back to the real day',S.pactDayOff===0&&S.pactToday.date===k0&&S.pactSalt===0);
// a woman who came is not back the day after but is eligible after a skip (codex entries dated before the day)
S.pactCodex=[0,1,2,3,4,5].map(i=>{const dd=A.gameWoman({age:26+i});return {seed:'z'+i,at:Date.now(),role:'give',her:A.callName(dd),age:A.ageOf(dd),occ:'x',wish:'งานใหม่',paid:5,tier:'ล้น',w:{id:'oldz'+i,data:dd,sim:{},chat:[],ai:{}}};});
S.pactDayOff=0;S.pactSalt=0;S.pactToday=null;const todayBack=X.todayVisitors(S.me).list.filter(v=>v.kind==='return').length;let later=0;for(let n=0;n<10;n++){X.nextDay(S.me);later+=S.pactToday.list.filter(v=>v.kind==='return').length;}
ck('women who came today are not back today, but come back on later days ('+todayBack+' today, '+later+' over 10 skipped days)',todayBack===0&&later>=6);
S.pactDayOff=0;S.pactSalt=0;S.pactToday=null;
// ---- the giver's force
const night=(rung,ent)=>{Object.assign(pk,{role:'give',mode:'B',ent:ent});const g=X.newPerson(S.me,ent,'B','mid');S.pact=g;g.rung=rung;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);if(g.stage==='offer'){if(g.offer.paid>=5)g.confirmed5=true;X.perform(S.me);return g;}return null;};
let n5=0,mighty5=0,flood5=0,n4=0,mighty4=0,ents=new Set(),forceLine=0;for(let i=0;i<120&&n5<14;i++){const ent=['deity','playful','demon','unclear'][i%4],g=night(5,ent);if(!g||!g.night||g.night.paid<5)continue;n5++;ents.add(ent);const t=g.night.relText||'';if(/พลังเหนือมนุษย์ของ/.test(t)&&/ทุกคน ทุกท่า ทุกความลึก/.test(t))mighty5++;if(/ฉากน้ำทะลักเข้ามดลูก/.test(t))flood5++;if(/ทะลุปากมดลูกเข้ามดลูก|ทะลวง|อัดฉีด|ทะลุ/.test(t))forceLine++;}
for(let i=0;i<10;i++){const g=night(4,'demon');if(!g||!g.night||g.night.paid!==4)continue;n4++;if(/พลังเหนือมนุษย์ของ/.test(g.night.relText||''))mighty4++;}
o.push('giver rung 5: '+n5+' nights, mighty '+mighty5+', flood scene '+flood5+', force wording '+forceLine+' · rung 4 (outside): '+n4+' nights, mighty '+mighty4);
ck('giver, finish inside: every night carries the superhuman line and the flood scene',n5>=8&&mighty5===n5&&flood5===n5&&ents.size>=3);
ck('giver, finish outside (step 4): no flood force line',n4===0||mighty4===0);
// the same for any woman, any position: reach and depth of the ordinary roll no longer decide it
const F=A.finishLib,mk=(pid)=>({pattern:{n:8,strong:3,force:'ไหลเป็นจังหวะ',interval:'1.0'},semen:{vol:1.5,color:'ขาวข้น',visc:'ข้น',warm:'อุ่น'},buildup:30,posId:pid,her:{came:false}});
const short=F.flood(Object.assign(mk('st'),{}),{call:'ก',him:'ข',cm:8,mighty:true}),plain=F.flood(mk('st'),{call:'ก',him:'ข',cm:8});
ck('mighty overrides a weak, shallow ordinary roll (force '+(plain&&plain.ft)+' -> '+(short&&short.ft)+', depth '+(plain&&plain.dp)+' -> '+(short&&short.dp)+')',short&&plain&&short.ft===3&&short.dp===2&&short.reachK==='over'&&short.mighty&&plain.ft<3&&!plain.mighty);
// the ask side (a human man) is not mighty
Object.assign(pk,{role:'ask',ent:'random',mode:'B',cat:'auto',size:0,rank:'mid',wishText:'ให้ได้เลื่อนตำแหน่ง'});let mAsk=null;for(let t=0;t<30&&!mAsk;t++){const q=X.summon(S.me);S.pact=q;let n=0;while(q.stage==='meetG'&&n<5){X.offerAsk(S.me,[1,2,3,4,5]);n++}if(q.stage==='offerG'&&q.offer.paid>0){q.confirmed5=true;X.perform(S.me);if(q.night&&q.night.paid>=5)mAsk=q;}}
if(mAsk)ck('ask side (a human man): no superhuman force line',!/พลังเหนือมนุษย์ของ/.test(mAsk.night.relText||''));else o.push('(no ask night reached)');
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
