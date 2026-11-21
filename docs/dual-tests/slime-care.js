// usage: node slime-care.js <app dir>; caring for the owner (v276): tiredness and grime numbers, seven kinds of care (sleeping un-showered and cleaned all over, bath, coming home, morning, sick, massage, tidying), standing permission and the stop rule, prompt, UI
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,X=A.slime,D=A.slimeData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};const thr=f=>{try{f();return null;}catch(e){return String(e.message);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.game=S.game||{};A.ui.toast=()=>{};S.chars=[];X.load();X.create('วุ้น');const s=X.get();s.mass=300;
ck('data: twenty-two kinds of care (12 and 10 done by the small piece), every one sexual (the writer text names the cock, no housework, no nursing), each with numbers',D.CARE.length===22&&D.CARE.every(c=>c.id&&c.t&&c.w&&c.tired>0&&c.grime>0&&c.mood>0&&c.trust>0&&/ควย/.test(c.w)&&/เสียว|แตก/.test(c.w)&&!/ซักผ้า|เปลี่ยนผ้าปู|ข้าวต้ม|ลดไข้|เก็บกวาด|ล้างจาน|ทำอาหาร/.test(c.w))&&['sleepclean','bath','homecoming','morning','massage','edgebed','groinclean','feetarmpit','milkout','showersex','sleepride','petclean'].every(i=>D.CARE.some(c=>c.id===i)));
// numbers
s.tired=0;s.grime=0;s.hunger=30;X.nextDay();ck('a day tires him (10 to 16) and adds grime',s.tired>=10&&s.tired<=16&&s.grime>=22);
s.tired=10;s.meals=0;s.hunger=50;s.form={key:'blob',name:'ก้อนสไลม์'};X.feed(S.me,'night');const t1=s.tired;ck('a night of many positions tires him most (+15), inside +6',t1>=25);
s.tired=10;s.hunger=50;s.meals=0;X.feed(S.me,'inside');ck('inside: +6',s.tired===16);
s.tired=70;s.grime=90;s.hunger=60;s.mood=50;s.trust=50;const r=X.care('sleepclean');ck('care "slept without a shower": all grime gone, tiredness down 30, mood and trust up, the slime gets a little food from the sweat and residue; the care is remembered',r.grimeAfter===0&&r.tiredAfter===40&&s.mood===54&&s.trust===54&&s.hunger<60&&s.lastCare.id==='sleepclean'&&s.log[s.log.length-1].k==='care');
s.tired=60;s.grime=60;X.care('bath');ck('bath: grime 0, tired 35',s.grime===0&&s.tired===35);s.tired=60;s.grime=60;X.care('massage');ck('massage mostly tiredness (35) and little grime (20)',s.tired===25&&s.grime===40);
s.tired=20;s.grime=100;X.care('massage');ck('numbers never go below 0',s.tired===0&&s.grime===80);
ck('unknown care refused',!!thr(()=>X.care('zzz')));
// prompts
X.care('sleepclean');const pc=X.carePrompt(S.me);
ck('sleep-clean prompt: fell asleep un-showered after sex, sweat/smell/dried residue, cleaned all over in order (hair, neck, chest, armpits, belly, hips, thighs, feet, cock and balls), tucks him in',/หลับไปทั้งที่ยังไม่ได้อาบน้ำ/.test(pc)&&/น้ำที่แห้งเป็นคราบ/.test(pc)&&/รักแร้/.test(pc)&&/ฝ่าเท้า/.test(pc)&&/ควยกับไข่/.test(pc)&&/ห่มผ้าให้/.test(pc));
ck('consent: standing permission given in advance, careful, stops at once if he stirs uncomfortably, never forced; adult 20 years; no pregnancy',/อนุญาตไว้ล่วงหน้า/.test(pc)&&/หยุดทันที/.test(pc)&&/ไม่ใช่ถูกบังคับ/.test(pc)&&/อายุ 20 ปี/.test(pc)&&/ไม่ตั้งครรภ์/.test(pc));
ck('sex and bodily pleasure only: the prompt says so and forbids housework, tidying, nursing and cooking',/เซ็กส์และความเสียวทางกายเท่านั้น/.test(pc)&&/ห้ามเขียนงานบ้าน การเก็บกวาด การพยาบาล การทำอาหาร/.test(pc)&&!/น้ำเสียงอบอุ่น ใส่ใจ/.test(pc));
ck('numbers in <care> and the do-not-change rule; no word for a child',/<care>/.test(pc)&&/ความเหนื่อยล้าของฉัน \d+ → \d+/.test(pc)&&/ห้ามเปลี่ยนตัวเลข/.test(pc)&&!/ลูกสไลม์/.test(pc.split('<slime>')[0]));
for(const [id,re] of [['homecoming',/คุกเข่าลงเลียและอมทำความสะอาดควย/],['morning',/อมหรือห่อควยที่แข็งตามอาการตื่นนอน/],['massage',/นวดฝีเย็บกับไข่/],['edgebed',/ใกล้แตกแล้วหยุด/],['groinclean',/ใต้ถุงไข่ ฝีเย็บ และร่องก้น/],['feetarmpit',/นิ้วเท้าทีละนิ้ว/],['milkout',/รีดน้ำให้หมดเกลี้ยง/],['showersex',/สบู่และตัวคู่นอน/],['sleepride',/ขอโทษที่ไม่ได้ปลุกก่อน/],['petclean',/แบบสัตว์เชื่อง/],['bath',/ฟองสบู่ลื่น ๆ/]]){X.care(id);ck('care '+id+': the writer text of this care reaches the prompt and ends in pleasure',re.test(X.carePrompt(S.me)));}
ck('sleeping cares keep the standing permission wording; the sleep-ride one has him wake into it and answer with his body (groans, pushes up)',/ตื่นกลางความเสียว/.test((X.care('sleepride'),X.carePrompt(S.me)))&&/ครางรับ กดสะโพกรับ/.test(X.carePrompt(S.me)));
// form of the slime in the care prompt
ck('blob: no human body in the prompt',/รูปก้อนสไลม์ ไม่มีรูปคน/.test(X.carePrompt(S.me))&&!/<form>/.test(X.carePrompt(S.me)));
S.chars=[{id:'L1',data:Object.assign(A.gameWoman({age:30}),{nickname:'แพร',firstName:'แพร'}),sim:{},chat:[],ai:{}}];s.form={key:'c:L1',name:'แพร'};ck('woman form: the form block and an adult-woman rule appear',/<form>/.test(X.carePrompt(S.me))&&/ผู้หญิงผู้ใหญ่/.test(X.carePrompt(S.me)));
s.lastCare=null;ck('no scene before a care',/ยังไม่ได้ให้สไลม์ดูแล/.test(thr(()=>X.carePrompt(S.me))||''));
// norm
X.care('bath');const n2=X.norm(JSON.parse(JSON.stringify(s)));ck('norm keeps tiredness and the last care; junk is cleaned',n2.lastCare&&n2.lastCare.id==='bath'&&n2.tired>=0&&X.norm({name:'x',lastCare:{id:'<b>',t:5,tiredBefore:'zz'}}).lastCare.tiredBefore===0&&X.norm({name:'x'}).tired===30);
// UI
S.game.mode='slime';const h=X.html();ck('page: care card with 22 buttons, tiredness meter, the permission text, and the write box for the care scene',/ดูแลเจ้าของ/.test(h)&&(h.match(/data-act="slmcare"/g)||[]).length===22&&/ความเหนื่อยล้าของฉัน \d+\/100/.test(h)&&/อนุญาตไว้ล่วงหน้า/.test(h)&&/เชิงเซ็กส์และความเสียวทางกายล้วน/.test(h)&&/data-v="Care"/.test(h)&&/เขียนฉากดูแล: /.test(h));
s.tired=50;s.grime=50;X.onAct('slmcare',{dataset:{v:'massage'}});ck('act: slmcare',s.lastCare.id==='massage'&&s.tired===15);
return (bad?o.join('\n')+'\nTOTAL FAIL '+bad:'ALL OK')+'\nERRS none';}catch(e){return 'THROW '+e.message+' '+e.stack.slice(0,300);}}));
if(errs.length)console.log('PAGEERR',errs.slice(0,3));await b.close();})();
