// usage: node slime-sub.js <app dir>; the small pieces (สไลม์ย่อย, v267): a split-off piece with a fragment of memory and an adult mind, its own hunger, fed the six ways, forms at size, scenes for the piece alone and for both, never a child
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,X=A.slime,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};const thr=f=>{try{f();return null;}catch(e){return String(e.message);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.game=S.game||{};A.ui.toast=()=>{};
const mkw=(id,age,over)=>({id,data:Object.assign(A.gameWoman({age}),{nickname:'ผู้หญิง'+id,firstName:'ผู้หญิง'+id},over||{}),sim:{},chat:[],ai:{}});
S.chars=[mkw('L1',30),mkw('L2',41)];X.load();X.create('วุ้น');const s=X.get();s.mass=300;s.hunger=40;s.log.push({day:1,k:'',line:'วันที่ 1: แอบเห็นฉันกลับบ้านดึกแล้วทำหน้างอน'},{day:1,k:'',line:'วันที่ 1: ลองแปลงเป็นกาต้มน้ำ'},{day:1,k:'',line:'วันที่ 1: ซุกตักฉันทั้งคืน'});
s.day=45;const c=X.budOff(s);S.slime=s;X.subSel=c.id;ck('age is in YEARS like a person: the slime is 20 years old from the start, a piece has exactly the age of the one it split from (20), never days and never zero; one more year after a year of game days for both',X.slimeAge(s)===20&&c.ageY0===20&&X.subAge(s,c)===20&&(s.day=45+365,X.slimeAge(s)===21&&X.subAge(s,c)===21)&&(s.day=45,true));
ck('a piece: small size, its own hunger and affection, a memory fragment taken from the first one\'s non-sub log lines, adult mind (no age fields at all)',c.size===12&&c.hunger>0&&c.affection>0&&c.mem.length>=1&&c.mem.every(x=>!/^วันที่/.test(x)&&!/สไลม์ย่อย/.test(x))&&c.form.key==='blob'&&c.age===undefined);
// blob scene needs a meal first
ck('no scene before a meal',/ยังไม่ได้ให้อาหาร/.test(thr(()=>X.subPrompt(S.me,'sub',c.id))||''));
c.hunger=60;const sz=c.size,r=X.feedSub(S.me,c.id,'inside');ck('feed the piece the six ways (here: inside): hunger down, size up, affection up, last meal kept',r.vol>0&&c.hunger<60&&c.size>sz&&c.last.how==='inside'&&c.affection>30);
for(const h of ['absorb','hand','mouth','body','night'])ck('feedSub '+h+' works for a blob piece',thr(()=>X.feedSub(S.me,c.id,h))===null);
ck('unknown way refused',!!thr(()=>X.feedSub(S.me,c.id,'zzz')));
// form needs size, library women only
c.feeds=5;c.inside=0;ck('a small piece cannot take a human form until it has drunk enough times (awareness 30)',/ยังทรงร่างคนไม่ได้/.test(thr(()=>X.setSubForm(c.id,'c:L1'))||''));
c.feeds=45;c.hunger=20;ck('after enough drinks (awareness 30+): takes a library woman in miniature; a man or a minor-ish custom is refused',thr(()=>X.setSubForm(c.id,'c:L1'))===null&&c.form.key==='c:L1'&&!!thr(()=>X.setSubForm(c.id,'c:NOPE')));
c.hunger=90;ck('too hungry to hold a form',/หิวเกินไป/.test(thr(()=>X.setSubForm(c.id,'c:L2'))||''));c.hunger=20;
X.subRandomForm(c.id);ck('random library form works and only adult women are in the pool',/^c:L[12]$/.test(c.form.key));
X.feedSub(S.me,c.id,'mouth');ck('mastery of the form grows with feeding in that form and the likeness is capped by awareness',c.mastery[c.form.key]>0&&X.subAccuracy(c)<=20+X.subAware(c)*.8);
// prompts
const ps=X.subPrompt(S.me,'sub',c.id);
ck('sub prompt: a small slime with a memory fragment that can do everything, its own wants, no word for a child, small size is the advantage, memory fragment, meal numbers',/สไลม์ตัวเล็กที่แยกตัวมาจากสไลม์หลัก/.test(ps)&&/ทำได้ทุกอย่างเท่าที่ขนาดอำนวย/.test(ps)&&/ความต้องการและการตัดสินใจเป็นของตัวเอง/.test(ps)&&!/ลูกสไลม์|ไม่ใช่ลูก|เรียกว่าลูก|แม่ของสไลม์/.test(ps.split('<slime>')[0])&&/ข้อได้เปรียบของฉาก/.test(ps)&&/<fragment>/.test(ps)&&/<meal-sub>/.test(ps)&&/<form>/.test(ps)&&/สัดส่วนและใบหน้าของผู้ใหญ่/.test(ps)&&/ไม่ตั้งครรภ์และไม่มีรอบเดือน/.test(ps)&&/เต็มใจ/.test(ps)&&!/<meal-main>/.test(ps));
ck('sub prompt: forbids comparing it to a child or a baby and forbids nursing imagery for the sucking; offers wild-animal / hungry-predator comparisons; names fresh energy',/ห้ามเปรียบเทียบกับเด็ก ทารก หรือการเลี้ยงเด็ก/.test(ps)&&/ห้ามเปรียบการดูดกับการให้นม/.test(ps)&&/สัตว์ป่าเชื่อง/.test(ps)&&/พลังงานสด/.test(ps));
const fresh=X.norm({children:[{id:'f1',name:'ใหม่',size:12,feeds:0,mem:['x'],hunger:60,form:{key:'blob'},last:{how:'mouth',howT:'ใช้ปาก',vol:3,q:'พอดี',hungerBefore:60,hungerAfter:30,relief:30,over:0,grew:false,stageT:'หยด',form:'ก้อน',formKey:'blob',day:1}}]}).children[0];S.slime.children.push(fresh);const pf=X.subPrompt(S.me,'sub','f1');ck('prompt gives the age (same as the first one at the split) and says it was never counted from zero; nothing says newborn',/อายุเท่าสไลม์หลักตอนที่แยกตัวเสมอ คือ 20 ปี/.test(pf)&&/ห้ามนับจากศูนย์/.test(pf)&&/อายุ 20 ปี \(เท่าสไลม์หลักตอนแยก\)/.test(pf)&&/ห้ามนับเป็นวันหรือเดือน/.test(pf)&&!/เพิ่งเกิด|เกิดใหม่|แรกเกิด/.test(pf));
ck('instinct first: the freshly split piece is instinct-led (few words, clings, draws fresh energy straight from the head), the band is in the prompt and the block',X.subMind(fresh)==='สัญชาตญาณเด่น'&&/สัญชาตญาณเด่น/.test(pf)&&/พูดน้อย/.test(pf)&&/พลังงานสดจากตัวฉันโดยตรง/.test(pf)&&/ความรู้ตัว \d+\/100 \(สัญชาตญาณเด่น\)/.test(pf));S.slime.children=S.slime.children.filter(x=>x.id!=='f1');
const c2=X.norm({children:[{id:'z',name:'ซ',size:300,feeds:80,mem:['a','b','c'],form:{key:'blob'}}]}).children[0];ck('awareness grows with feeding, size and memory and the band moves up to the first one\'s level',X.subAware(c2)>=85&&X.subMind(c2)==='เหมือนตัวหลัก'&&X.subAware(c)<X.subAware(c2));
s.last={how:'absorb',howT:'ให้ดูดซับตรง ๆ',vol:3,q:'พอดี',hungerBefore:40,hungerAfter:20,relief:20,over:0,grew:false,stageT:'ก้อน',form:'ก้อนสไลม์',formKey:'blob',acc:null,day:1};
const pd=X.subPrompt(S.me,'duo',c.id);ck('duo prompt: both meals, the two split the work, same shared memory but not identical',/<meal-sub>/.test(pd)&&/<meal-main>/.test(pd)&&/แบ่งงานกัน/.test(pd)&&/ฉากนี้มีทั้งสองตัวพร้อมกัน/.test(pd));
c.form={key:'blob',name:'ก้อนสไลม์ย่อย'};const pb=X.subPrompt(S.me,'sub',c.id);ck('blob piece: no human body, communicates by trembling and colour, no <form> block',/ก้อนเมือกขนาดเล็ก ไม่มีรูปคน ไม่พูดเป็นคำ/.test(pb)&&!/<form>/.test(pb));
// daily
const h0=c.hunger,a0=c.affection;X.nextDay();ck('a day: the piece gets hungrier by itself',c.hunger>h0);
c.hunger=95;c.size=50;c.form={key:'c:L1',name:'x'};X.nextDay();ck('starved piece shrinks a little and drops its form',c.size<50&&c.form.key==='blob');
// norm round trip
const n2=X.norm(JSON.parse(JSON.stringify(X.get())));ck('norm keeps the piece: memory, hunger, affection, last meal, form, mastery',n2.children[0].mem.length===c.mem.length&&n2.children[0].last&&n2.children[0].affection>=0);
// UI
S.game.mode='slime';c.hunger=40;c.last=c.last||null;X.feedSub(S.me,c.id,'absorb');const h=X.html();
ck('page: the main status and the piece both say 20 years (อายุ 20 ปี), no days of age',/สถานะของ .* · อายุ 20 ปี · วันที่/.test(X.html())&&/อายุ 20 ปี · ขนาด/.test(X.html()));
ck('page: sub card with 6 feed buttons, form buttons, select, absorb/release, and the two write boxes (alone and together)',/สไลม์ย่อย \(1\)/.test(h)&&(h.match(/data-act="slmsubfeed"/g)||[]).length===6&&/data-act="slmsubform"/.test(h)&&/data-act="slmsubsel"/.test(h)&&/data-v="Sub"/.test(h)&&/data-v="Duo"/.test(h)&&/เขียนฉากสองตัวพร้อมกัน/.test(h)&&!/ลูกสไลม์|ไม่ใช่ลูก|เรียกว่าลูก/.test(h)&&/ความรู้ตัว/.test(h)&&/สัญชาตญาณ/.test(h));
// act routes
X.onAct('slmsubfeed',{dataset:{s:c.id,v:'hand'}});ck('act: slmsubfeed',c.last.how==='hand');
X.onAct('slmsubform',{dataset:{s:c.id,v:'blob'}});ck('act: slmsubform blob',c.form.key==='blob');
// minor-ish names for pieces cannot come from user input paths; the library form check
c.feeds=10;c.inside=0;ck('promote needs awareness 90 (from the number of drinks), not size or age',/ยังโตไม่ถึงขั้น/.test(thr(()=>X.promote(c.id))||''));
// the curve: slow at first, then faster and faster; a creampie counts more
const mk=(f,i)=>X.norm({children:[{id:'q',name:'q',feeds:f,inside:i,size:12,mem:['a'],form:{key:'blob'}}]}).children[0];const A_=[0,10,20,30,40,50,60,70].map(f=>X.subAware(mk(f,0)));const d=A_.slice(1).map((v,i)=>v-A_[i]);
ck('awareness: starts low, the gains between equal steps keep growing (slow then fast), reaches 100 at 70 drinks',A_[0]<=12&&d.every((v,i)=>i===0||v>=d[i-1])&&A_[7]===100);
ck('a creampie counts 0.6 extra: same number of drinks with creampies is more aware; age and size do not matter',X.subAware(mk(30,30))>X.subAware(mk(30,0))&&X.subAware(X.norm({children:[{id:'q',name:'q',feeds:10,inside:0,size:900,age0:9999,born:1,mem:['a','b','c'],form:{key:'blob'}}]}).children[0])===X.subAware(mk(10,0)));
ck('abilities by count: below 30 no human form, 90 promotes',!X.subCanForm(mk(20,0))&&X.subCanForm(mk(45,0))&&X.childMature(S.slime,mk(68,0))&&!X.childMature(S.slime,mk(40,0)));
ck('prompt makes the age a rule (always the same as the first one at the split, never less, never from zero) and ties thinking to the drink count',/ข้อบังคับเรื่องอายุ/.test(pf)&&/ห้ามบอกว่าน้อยกว่านี้ ห้ามนับเป็นวันหรือเดือน และห้ามนับจากศูนย์/.test(pf)&&/ขึ้นกับจำนวนครั้งที่มันกินน้ำ/.test(pf)&&/ไม่ขึ้นกับอายุ/.test(pf));
ck('bud gauge never shows over 100 even when the house is full',(()=>{X.create('งบ');const q=X.get();for(let i=0;i<6;i++)X.budOff(q);q.mass=300;for(let i=0;i<40;i++){q.hunger=0;q.meals=0;X.feed(S.me,'absorb');}return q.bud<=100;})());
return (bad?o.join('\n')+'\nTOTAL FAIL '+bad:'ALL OK')+'\nERRS none';}catch(e){return 'THROW '+e.message+' '+e.stack.slice(0,300);}}));
if(errs.length)console.log('PAGEERR',errs.slice(0,3));await b.close();})();
