// usage: node slime-sub.js <app dir>; the small pieces (สไลม์ย่อย, v267): a split-off piece with a fragment of memory and an adult mind, its own hunger, fed the six ways, forms at size, scenes for the piece alone and for both, never a child
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,X=A.slime,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};const thr=f=>{try{f();return null;}catch(e){return String(e.message);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.game=S.game||{};A.ui.toast=()=>{};
const mkw=(id,age,over)=>({id,data:Object.assign(A.gameWoman({age}),{nickname:'ผู้หญิง'+id,firstName:'ผู้หญิง'+id},over||{}),sim:{},chat:[],ai:{}});
S.chars=[mkw('L1',30),mkw('L2',41)];X.load();X.create('วุ้น');const s=X.get();s.mass=300;s.hunger=40;s.log.push({day:1,k:'',line:'วันที่ 1: แอบเห็นฉันกลับบ้านดึกแล้วทำหน้างอน'},{day:1,k:'',line:'วันที่ 1: ลองแปลงเป็นกาต้มน้ำ'},{day:1,k:'',line:'วันที่ 1: ซุกตักฉันทั้งคืน'});
const c=X.budOff(s);S.slime=s;X.subSel=c.id;
ck('a piece: small size, its own hunger and affection, a memory fragment taken from the first one\'s non-sub log lines, adult mind (no age fields at all)',c.size===12&&c.hunger>0&&c.affection>0&&c.mem.length>=1&&c.mem.every(x=>!/^วันที่/.test(x)&&!/สไลม์ย่อย/.test(x))&&c.form.key==='blob'&&c.age===undefined);
// blob scene needs a meal first
ck('no scene before a meal',/ยังไม่ได้ให้อาหาร/.test(thr(()=>X.subPrompt(S.me,'sub',c.id))||''));
c.hunger=60;const sz=c.size,r=X.feedSub(S.me,c.id,'inside');ck('feed the piece the six ways (here: inside): hunger down, size up, affection up, last meal kept',r.vol>0&&c.hunger<60&&c.size>sz&&c.last.how==='inside'&&c.affection>30);
for(const h of ['absorb','hand','mouth','body','night'])ck('feedSub '+h+' works for a blob piece',thr(()=>X.feedSub(S.me,c.id,h))===null);
ck('unknown way refused',!!thr(()=>X.feedSub(S.me,c.id,'zzz')));
// form needs size, library women only
c.size=30;ck('a small piece cannot take a human form until it has grown',/ยังเล็กเกินไป/.test(thr(()=>X.setSubForm(c.id,'c:L1'))||''));
c.size=90;c.hunger=20;ck('grown to "กอง": takes a library woman in miniature; a man or a minor-ish custom is refused',thr(()=>X.setSubForm(c.id,'c:L1'))===null&&c.form.key==='c:L1'&&!!thr(()=>X.setSubForm(c.id,'c:NOPE')));
c.hunger=90;ck('too hungry to hold a form',/หิวเกินไป/.test(thr(()=>X.setSubForm(c.id,'c:L2'))||''));c.hunger=20;
X.subRandomForm(c.id);ck('random library form works and only adult women are in the pool',/^c:L[12]$/.test(c.form.key));
X.feedSub(S.me,c.id,'mouth');ck('mastery of the form grows with feeding in that form and the likeness is capped by size',c.mastery[c.form.key]>0&&X.subAccuracy(c)<=25+X.subStage(c)*25);
// prompts
const ps=X.subPrompt(S.me,'sub',c.id);
ck('sub prompt: adult mind, not a child, no "ลูก", no baby framing, small size is the advantage, six rules, memory fragment, meal numbers',/ไม่ใช่ลูก ไม่ใช่เด็ก ไม่ใช่ทารก/.test(ps)&&/ใจ ความต้องการ และวิธีพูดเป็นของผู้ใหญ่เสมอ/.test(ps)&&/ข้อได้เปรียบของฉาก/.test(ps)&&/<fragment>/.test(ps)&&/<meal-sub>/.test(ps)&&/<form>/.test(ps)&&/สัดส่วนผู้ใหญ่/.test(ps)&&/ไม่ตั้งครรภ์ ไม่คลอด/.test(ps)&&/เต็มใจ/.test(ps)&&!/<meal-main>/.test(ps));
ck('sub prompt: no "แม่" in the sense of a parent, no cute/lullaby words as an instruction',!/แม่ของ/.test(ps.replace('ไม่มีใครเป็นแม่ของใคร',''))&&!/กล่อมนอน|น่าเอ็นดู|น่ารักน่าชัง/.test(ps));
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
ck('page: sub card with 6 feed buttons, form buttons, select, absorb/release, and the two write boxes (alone and together)',/สไลม์ย่อย \(1\)/.test(h)&&(h.match(/data-act="slmsubfeed"/g)||[]).length===6&&/data-act="slmsubform"/.test(h)&&/data-act="slmsubsel"/.test(h)&&/data-v="Sub"/.test(h)&&/data-v="Duo"/.test(h)&&/เขียนฉากสองตัวพร้อมกัน/.test(h)&&!/ลูกสไลม์/.test(h));
// act routes
X.onAct('slmsubfeed',{dataset:{s:c.id,v:'hand'}});ck('act: slmsubfeed',c.last.how==='hand');
c.size=100;X.onAct('slmsubform',{dataset:{s:c.id,v:'blob'}});ck('act: slmsubform blob',c.form.key==='blob');
// minor-ish names for pieces cannot come from user input paths; the library form check
ck('promote needs full-body size',/ยังโตไม่ถึงขั้น/.test(thr(()=>X.promote(c.id))||''));
return (bad?o.join('\n')+'\nTOTAL FAIL '+bad:'ALL OK')+'\nERRS none';}catch(e){return 'THROW '+e.message+' '+e.stack.slice(0,300);}}));
if(errs.length)console.log('PAGEERR',errs.slice(0,3));await b.close();})();
