// usage: node slime.js <app dir>; slime mode (v248): a slime companion fed with the man's semen, forms = adult women only (library / typed / invented, never men, never minors), stages by mass, mastery of forms, hunger and day ticks, budding of little slimes that never enter a sexual scene, prompts, page and actions (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.slime,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};
const toasts=[];A.ui.toast=m=>toasts.push(m);const thr=f=>{try{f();return null;}catch(e){return String(e.message);}};
const mkw=(id,age,over)=>{const d=Object.assign(A.gameWoman({age}),{nickname:'ผู้หญิง'+id,firstName:'ผู้หญิง'+id},over||{});return {id,data:d,sim:{},chat:[],ai:{}};};
// ---- the mode is on the hub and opens
ck('module and the hub tile',typeof X.html==='function'&&typeof X.onAct==='function');
S.game.mode=null;X.onAct('slmopen',{dataset:{}});ck('open: mode set, the panel renders (no slime yet: a start card)',S.game.mode==='slime'&&/data-act="slmnew"/.test(X.html())&&/ไม่เข้าฉากเซ็กซ์/.test(X.html()));
// ---- create and persist
const s0=X.create('วุ้น');ck('created: a drop, hunger 40, mood 60, trust 20, name kept',s0.name==='วุ้น'&&X.stageOf(s0)===0&&s0.hunger===40&&s0.mood===60&&s0.trust===20&&s0.log.length===1);
ck('saved to localStorage and restores through norm()',(()=>{const raw=JSON.parse(localStorage.getItem('anima.slime.v1'));const n=X.norm(raw.s);return raw.v===1&&n.name==='วุ้น'&&n.hunger===40&&n.traits.playful>=25;})());
ck('norm clamps junk',(()=>{const n=X.norm({name:'x'.repeat(99),hunger:500,mood:-5,trust:'a',mass:'zz',children:[{name:'k',size:9999}],customs:[{id:'q',name:'m',age:12,w:{data:{age:12}}}]});return n.name.length===30&&n.hunger===100&&n.mood===0&&n.trust===20&&n.mass===3&&n.children[0].size===9999&&n.customs.length===0;})());
// ---- feeding: the blob can absorb; human ways need a woman's form
let s=X.get();ck('every way works even as a blob (no refusal)',thr(()=>X.feed(S.me,'inside'))===null||thr(()=>X.feed(S.me,'inside'))===''||thr(()=>X.feed(S.me,'inside'))===undefined);
s.hunger=40;const m0=s.mass,h0=s.hunger;const f1=X.feed(S.me,'absorb');ck('absorb: volume from the owner\'s range, hunger down, mass up, trust up, a log line',f1.vol>0&&s.hunger<h0&&s.mass>m0&&s.trust>20&&/ให้อาหาร \(ให้ดูดซับตรง ๆ\)/.test(s.log[s.log.length-1].line));
const f2=X.feed(S.me,'absorb');ck('feeding is unlimited: many meals a day, all counted',(()=>{for(let i=0;i<30;i++)X.feed(S.me,'absorb');return X.get().meals>=32&&X.get().fedTotal>50;})());
ck('the next day resets the count of meals and brings hunger and an event',(()=>{const h=s.hunger,ev=X.nextDay();return s.meals===0&&s.day===2&&s.hunger>h&&ev&&ev.t&&/วันที่ 2: /.test(s.log[s.log.length-1].line);})());
// ---- stages by mass; the human form is locked until ร่างเต็ม
ck('stages are about mass: drop, lump, heap, full body, big body',['หยด','ก้อน','กอง','ร่างเต็ม','ร่างใหญ่'].every((t,i)=>X.STAGES[i].t===t)&&X.STAGES.map(x=>x.min).join()==='0,25,80,200,450');
const lib=mkw('L1',30),lib2=mkw('L2',41),kid=mkw('K1',30),man=Object.assign(mkw('M1',30),{});kid.data.age=16;kid.data.birthday='';man.data.sex='ชาย';S.chars=[lib,lib2,kid,man];
ck('library forms: adult women only (a minor and a man are left out)',(()=>{const L=X.libraryForms().map(c=>c.id);return L.includes('L1')&&L.includes('L2')&&!L.includes('K1')&&!L.includes('M1');})());
ck('a small slime cannot take a human form',/ยังเล็กเกินไป/.test(thr(()=>X.setForm('c:L1'))||''));
s.mass=210;s.hunger=30;ck('now a full body: stage 3',X.stageOf(s)===3&&X.mature(s));
ck('a minor / a man / an unknown id cannot be a form',/ใช้ไม่ได้/.test(thr(()=>X.setForm('c:K1'))||'')&&/ใช้ไม่ได้/.test(thr(()=>X.setForm('c:M1'))||'')&&/ใช้ไม่ได้/.test(thr(()=>X.setForm('c:nope'))||''));
X.setForm('c:L1');ck('an adult library woman: the form is set, mastery starts, a log line',s.form.key==='c:L1'&&s.mastery['c:L1']>=4&&/ลองแปลงเป็น/.test(s.log[s.log.length-1].line));
s.hunger=88;ck('too hungry to hold a human form',/หิวเกินไป/.test(thr(()=>X.setForm('c:L2'))||''));s.hunger=40;
// ---- human feeding and mastery
const mb=s.mastery['c:L1'];const f3=X.feed(S.me,'inside');ck('inside in her form: the best absorption, mastery up, clingy up, a record of the meal',f3.formKey==='c:L1'&&f3.acc>=0&&s.mastery['c:L1']>mb&&f3.relief>0&&s.last.how==='inside');
X.nextDay();s.hunger=60;const rel={};for(const h of ['hand','mouth','body','inside','night']){const q=X.get();q.meals=0;q.feeds+=0;const r=X.feed(S.me,h);rel[h]=r.relief/r.vol;}ck('absorption: inside 8.0 per ml > night > mouth > body > hand',rel.inside>rel.night&&rel.night>rel.mouth&&rel.mouth>rel.body&&rel.body>rel.hand);
ck('accuracy is capped by the stage (mastery 100 at stage 3 still reads 100, at stage 2 is 75)',(()=>{const q=X.norm(JSON.parse(JSON.stringify(s)));q.mastery['c:L1']=100;q.mass=100;const a2=X.accuracy(q,'c:L1');q.mass=210;return a2===75&&X.accuracy(q,'c:L1')===100;})());
ck('tells by accuracy band: rough / alike / very alike / real',[10,45,75,95].every(a=>{const q=X.norm(JSON.parse(JSON.stringify(s)));q.mass=450;q.mastery['c:L1']=a;const t=X.tells(q,'c:L1');return t.tells.length>=1&&t.label;})&&X.tells(Object.assign(X.norm(JSON.parse(JSON.stringify(s))),{mass:450,mastery:{'c:L1':10}}),'c:L1').label==='ร่างยังหยาบ'&&X.tells(Object.assign(X.norm(JSON.parse(JSON.stringify(s))),{mass:450,mastery:{'c:L1':95}}),'c:L1').label==='ร่างเหมือนจริง');
// ---- custom, invented, random forms
ck('typed form: age must be 18+ ',/อายุ 18–90/.test(thr(()=>X.addCustom({name:'น้ำฝน',age:17,look:''}))||'')&&/อายุ 18–90/.test(thr(()=>X.addCustom({name:'น้ำฝน',age:'',look:''}))||'')&&/อายุ 18–90/.test(thr(()=>X.addCustom({name:'น้ำฝน',age:120,look:''}))||''));
ck('typed form: words that say minor are refused (นักเรียน / ม.5 / เด็ก / อายุ 17 ปี / loli)',['นักเรียนม.5','เด็กน้อย','อายุ 17 ปี','loli','อนุบาล'].every(w=>/เด็กหรือผู้เยาว์/.test(thr(()=>X.addCustom({name:'ก',age:25,look:w}))||'')));
ck('typed form: a name is needed',/ใส่ชื่อ/.test(thr(()=>X.addCustom({name:'',age:25,look:''}))||''));
X.addCustom({name:'น้ำฝน',age:27,look:'ผมยาว ยิ้มเก่ง'});ck('typed form (adult): saved and taken',s.form.key.startsWith('u:')&&s.form.name==='น้ำฝน'&&s.customs.length===1&&s.customs[0].age===27&&X.formOf(s,s.form.key).w.data.sex!=='ชาย');
X.inventForm();const iv=s.customs[s.customs.length-1];ck('invented by the slime: an adult woman of 21-52, marked as invented',iv.inv===true&&iv.age>=21&&iv.age<=52&&(A.ageOf(iv.w.data)||0)>=18&&s.form.key==='u:'+iv.id);
X.randomForm();ck('random from the library: one of the adult women',/^c:L[12]$/.test(s.form.key));
S.chars=[];ck('random with an empty library is refused with a way out',/ยังไม่มีผู้หญิงในคลัง/.test(thr(()=>X.randomForm())||''));S.chars=[lib,lib2,kid,man];
// ---- being starved
s.hunger=95;X.nextDay();ck('very hungry on the day tick: back to a blob',s.form.key==='blob'&&s.log.some(l=>/ทรงร่างผู้หญิงไม่ไหว/.test(l.line)));
// ---- budding
const z=X.norm({name:'ซ',mass:250,hunger:0,seed:'z1'});S.slime=z;z.mood=60;let budded=0,tries=0;while(!z.children.length&&tries++<30){z.hunger=0;z.meals=0;const r=X.feed(S.me,'absorb');if(r.budded)budded++;}
ck('overfeeding (fed while she is full) charges the gauge and a small piece splits off ('+tries+' meals)',z.children.length===1&&budded===1&&z.children[0].size===12&&z.children[0].name&&z.bud<100&&/สไลม์ย่อย: อายุเท่าตัวที่แยกมา/.test(z.log.map(l=>l.line).join(' ')));
ck('a small piece has traits mixed from the first, a fragment of memory (1-3 lines, no dates), its own hunger and affection, and starts as a blob',(()=>{const c=z.children[0];return ['playful','clingy','bold','curious'].every(k=>c.traits[k]>=0&&c.traits[k]<=100)&&c.mem.length>=1&&c.mem.length<=3&&!c.mem.some(x=>/^วันที่/.test(x))&&c.hunger>0&&c.affection>0&&c.form.key==='blob'&&!z.customs.some(x=>x.name===c.name)&&thr(()=>X.setForm('c:'+c.id))!==null;})());
for(let i=0;i<8&&z.children.length<6;i++){z.bud=100;X.budOff(z);}ck('at most 6 little slimes',(()=>{z.bud=500;const n=z.children.length;z.hunger=0;z.meals=0;X.feed(S.me,'absorb');return n===6&&z.children.length===6;})());
// ---- the small pieces: their own hunger, they grow only by eating, forms need size, absorb / release / promote
const c0=z.children[0];z.mass=300;const sz=c0.size,hg=c0.hunger;X.nextDay();ck('a day: a small piece gets hungrier on its own and does not borrow the first one\'s mass',c0.hunger>hg&&c0.size===sz);
c0.feeds=70;ck('mature when the drink count carries awareness to 90, a young one is not',X.childMature(z,c0)&&!X.childMature(z,z.children[1]));c0.feeds=0;
ck('a young one cannot be promoted',/ยังโตไม่ถึงขั้น/.test(thr(()=>X.promote(z.children[1].id))||''));
const mAbs=z.mass,idA=z.children[1].id;X.absorb(idA);ck('absorb: back into the first one (mass returns), gone from the list',z.mass>mAbs&&!z.children.some(c=>c.id===idA));
const idR=z.children[1].id;X.release(idR);ck('release: gone, a log line',!z.children.some(c=>c.id===idR)&&/ออกไปใช้ชีวิตเอง/.test(z.log[z.log.length-1].line));
const idP=c0.id,nameP=c0.name,mother=z.name;c0.feeds=70;const np=X.promote(idP);ck('promote: a new main slime, adult stage (full body), the origin mentioned in its first log line, saved',np.name===nameP&&X.mature(np)&&np.hunger<=40&&/โตเต็มแล้ว/.test(np.log[0].line)&&np.log[0].line.includes(mother)&&!/แม่/.test(np.log[0].line)&&S.slime===np&&np.children.length===0);
ck('after promoting, the mother stays in the house and can be switched back to',np.others.length===1&&np.others[0].name===mother);
const back=X.switchTo(np.others[0].id);ck('switch: mother is main again, the grown one is kept in the house, nothing lost',back.name===mother&&back.others.length===1&&back.others[0].name===nameP&&back.mass>=0);
const again=X.switchTo(back.others[0].id);ck('switch back and forth keeps exactly 1 other',again.name===nameP&&again.others.length===1&&X.mature(again));
const fk=X.get();fk.children.push(X.norm({children:[{id:'ck1',name:'ฟอง',born:fk.day,size:12,traits:{playful:40,clingy:40,bold:40,curious:40}}]}).children[0]);const ck1=fk.children.find(c=>c.id==='ck1');ck1.hunger=70;const fr=X.feedSub(S.me,'ck1','absorb');ck('a small piece is fed the same six ways as the first one: hunger drops, size grows, affection rises, last meal kept, a sub log line',fr.vol>0&&ck1.size>12&&ck1.hunger<70&&ck1.affection>30&&ck1.last&&ck1.last.how==='absorb'&&fk.log[fk.log.length-1].k==='sub'&&/ให้อาหาร ฟอง/.test(fk.log[fk.log.length-1].line));
ck1.feeds=70;ck1.born=fk.day-1;const pp=X.promote('ck1');ck('a grown small piece rises to a full adult slime that can take adult forms',X.mature(pp)&&pp.others.length===2&&pp.name==='ฟอง');
// ---- prompts
const q=X.norm({name:'ข้าวปั้น',mass:260,hunger:50,mood:70,trust:60,seed:'p1',traits:{playful:80,clingy:30,bold:20,curious:50},customs:[],children:[{id:'c9',name:'ติ๋ม',born:1,size:3}]});S.slime=q;S.chars=[lib,lib2];q.form={key:'c:L1',name:'ผู้หญิงL1'};q.mastery['c:L1']=62;q.day=5;
ck('no meal yet: the meal prompt is refused',/ยังไม่ได้ให้อาหาร/.test(thr(()=>X.scenePrompt(S.me,'meal'))||''));
X.feed(S.me,'inside');const pr=X.scenePrompt(S.me,'meal');
ck('meal prompt: adult rule (stage is mass, not age), her will, stopping at any time',/ผู้ใหญ่ทั้งคู่/.test(pr)&&/ขั้นของมวลไม่ใช่อายุ/.test(pr)&&/ถ้าเธอหรือฉันบอกหยุด ก็หยุด/.test(pr));
ck('meal prompt: the form, her accuracy % and tells, the slime\'s own mind, no real person in the room',/ร่างที่สไลม์ลอก: ผู้หญิงL1/.test(pr)&&/ความเหมือนของร่างตอนนี้ \d+%/.test(pr)&&/ใจและความต้องการเป็นของสไลม์/.test(pr)&&/ห้ามเขียนว่าคนจริงคนนั้นอยู่ในห้อง/.test(pr)&&/<form>/.test(pr));
ck('meal prompt: the numbers of the meal and of the slime, memory',/<meal>/.test(pr)&&/แตกในตัวเธอ/.test(pr)&&/ปริมาณ [\d.]+ มล\./.test(pr)&&/ความหิว \d+ → \d+/.test(pr)&&/<slime>/.test(pr)&&/ขี้เล่น/.test(pr)&&/<memory>/.test(pr));
ck('meal prompt: no pregnancy (a slime is not fertile), the budding is about mass',/ร่างสไลม์ไม่ตั้งครรภ์และไม่มีรอบเดือน/.test(pr)&&/ไม่เกี่ยวกับการตั้งครรภ์/.test(pr));
ck('meal prompt: the main scene has only the main slime, the small pieces have their own scene',/สไลม์ย่อย \(ถ้ามี\) มีฉากของมันเองแยกต่างหาก/.test(pr)&&/มีแค่ฉันกับสไลม์หลัก/.test(pr));
ck('meal prompt carries the lexicon rule with the plain-words table (หี / ควย / น้ำควย) and his profile',/คำเลี่ยงที่ห้ามใช้ในฉากเซ็กซ์/.test(pr)&&/คำพูดจริงของคนจริง/.test(pr)&&/<him>/.test(pr));
q.form={key:'blob',name:'ก้อนสไลม์'};q.hunger=50;q.meals=0;X.feed(S.me,'absorb');const pb=X.scenePrompt(S.me,'meal');ck('blob meal prompt: no human body, communicates by trembling and colour, still no pregnancy',/ร่างก้อนสไลม์ ไม่มีรูปคน ไม่พูดเป็นคำ/.test(pb)&&!/<form>/.test(pb));
const pbud=X.scenePrompt(S.me,'bud');ck('budding prompt: a short scene of a piece splitting off (a fragment of memory, instinct first, no word for child), the scene itself has no sex',/ฉากนี้ไม่มีเรื่องเพศเลย/.test(pbud)&&/ไม่เกี่ยวกับการตั้งครรภ์/.test(pbud)&&/เสี้ยวความทรงจำ/.test(pbud)&&/สัญชาตญาณ/.test(pbud)&&!/ลูกสไลม์|ไม่ใช่ลูก|เรียกว่าลูก/.test(pbud)&&!/<meal>/.test(pbud)&&!/<him>/.test(pbud));
// ---- the page
q.form={key:'c:L1',name:'ผู้หญิงL1'};q.hunger=40;q.last=null;let h=X.html();
ck('page: meters, the five ways to feed, forms (chips: library women, no minor, no man), custom form box, little slimes, log',/สถานะของ ข้าวปั้น/.test(h)&&(h.match(/data-act="slmfeed"/g)||[]).length===6&&/data-v="c:L1"/.test(h)&&/data-v="c:L2"/.test(h)&&!/data-v="c:K1"/.test(h)&&!/data-v="c:M1"/.test(h)&&/slmCuName/.test(h)&&/สไลม์ย่อย \(1\)/.test(h)&&/บันทึกของ ข้าวปั้น/.test(h));
q.mass=50;h=X.html();ck('page: a small slime sees no forms but a reason',/ยังโตไม่ถึงขั้น "ร่างเต็ม"/.test(h)&&!/data-act="slmform"/.test(h));
q.mass=260;q.form={key:'blob',name:'ก้อนสไลม์'};h=X.html();ck('page: every feeding button is enabled even as a blob',/data-v="inside"/.test(h)&&!/data-act="slmfeed"[^>]*disabled/.test(h));
// clicks
X.onAct('slmform',{dataset:{v:'c:L2'}});ck('click: a form chip sets the form',q.form.key==='c:L2');
const d0=q.day;X.onAct('slmday',{dataset:{}});ck('click: next day',q.day===d0+1&&toasts.length>0);
q.hunger=60;q.meals=0;X.onAct('slmfeed',{dataset:{v:'mouth'}});ck('click: feed shows what happened in a toast',/ใช้ปาก: [\d.]+ มล\. หิว/.test(toasts[toasts.length-1]));
X.onAct('slmrename',{dataset:{}});document.body.insertAdjacentHTML('beforeend','<input id="slmRename" value="ฟองฟอง"><input id="slmCuName" value="ใบบัว"><input id="slmCuAge" value="31"><textarea id="slmCuLook">ผมสั้น</textarea>');X.onAct('slmrename',{dataset:{}});ck('click: rename',q.name==='ฟองฟอง');
X.onAct('slmcustom',{dataset:{}});ck('click: the typed form is added from the boxes and taken',q.form.name==='ใบบัว'&&q.customs.some(c=>c.name==='ใบบัว'&&c.age===31));
document.getElementById('slmCuAge').value='16';const nBefore=q.customs.length;X.onAct('slmcustom',{dataset:{}});ck('click: a typed age of 16 is refused with a toast, nothing added',q.customs.length===nBefore&&/อายุ 18–90/.test(toasts[toasts.length-1]));
X.onAct('slminvent',{dataset:{}});ck('click: invent',q.form.key.startsWith('u:')&&q.customs.length===nBefore+1);
q.bud=0;const kidsN=q.children.length;
// reset through the confirm box
const real=A.ui.confirmBox;let shown=null;A.ui.confirmBox=(t,b,okL,fn)=>{shown={t,b,okL,fn};};X._autoConfirm=false;X.onAct('slmreset',{dataset:{}});ck('reset: asks the app\'s own confirm box first, nothing deleted yet',shown&&/เริ่มสไลม์ใหม่/.test(shown.t)&&/ย้อนกลับไม่ได้/.test(shown.b)&&!!S.slime);shown.fn();ck('reset: after OK the slime is gone and the start card is back',S.slime===null&&/data-act="slmnew"/.test(X.html())&&JSON.parse(localStorage.getItem('anima.slime.v1')).s===null);A.ui.confirmBox=real;
// back
X.onAct('slmback',{dataset:{}});ck('back leaves the mode',S.game.mode===null);
// the hub: the tile exists in the page and the panel is reachable through the app's own router
S.view='game';S.game.mode='slime';X.create('ทดสอบ');A.ui.renderAll();const wrap=document.querySelector('.game-wrap');ck('through the app: the game page shows the slime panel with its meters',!!wrap&&/สถานะของ ทดสอบ/.test(wrap.innerHTML));
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,600)}}));console.log('ERRS',errs.filter(x=>!/ERR_FAILED/.test(x)).join('|')||'none');await b.close()})();
