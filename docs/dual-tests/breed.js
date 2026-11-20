// usage: node breed.js <app dir>; the "เส้นทางของเธอ" narrative mode (v283)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.breed,D=X.data,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};const thr=f=>{try{f();return null;}catch(e){return String(e.message);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.game=S.game||{};A.ui.toast=()=>{};
const mkw=(id,age,over)=>({id,data:Object.assign(A.gameWoman({age}),{nickname:'หญิง'+id,firstName:'หญิง'+id},over||{}),sim:{},chat:[],ai:{}});
S.chars=[mkw('W1',30),mkw('W19',19),mkw('W20',20),mkw('M1',30,{sex:'ชาย'})];
ck('data: 5 arcs incl. cold→hooked and flat; 5 secrecy forms incl. front (he is present, unaware); 4 reasons; 10 hooks',D.ARCS.length===5&&D.ARCS.some(a=>a.id==='cold')&&D.ARCS.some(a=>a.id==='flat')&&D.SECRECY.length===5&&D.SECRECY.some(a=>a.id==='front')&&D.REASONS.length===4&&D.HOOKS.length===10);
ck('women: 20+ only, no men',X.women().map(w=>w.id).join()==='W1,W20');
ck('the page lists the women and the hub tile target exists',/data-act="brdsel" data-v="W20"/.test(X.html())&&!/data-v="W19"/.test(X.html()));
ck('prompt needs a woman, then the form',/ผู้หญิงอายุ 20/.test(thr(()=>X.prompt(S.me))||'')&&(X.st.sel='W1',/ให้ครบ/.test(thr(()=>X.prompt(S.me))||'')));
X.st.sel='W19';ck('a woman under 20 is refused even if forced into sel',!!thr(()=>X.prompt(S.me)));
X.st.sel='W1';X.roll();const f=X.st.form;ck('roll fills everything',f.arc&&f.sec&&f.place&&f.end&&f.hooks.length===2);
for(const a of D.ARCS)for(const s of D.SECRECY){X.set('arc',a.id);X.set('sec',s.id);const pr=X.prompt(S.me);if(!(pr.includes(a.w)&&pr.includes(s.w))){ck('prompt holds arc '+a.id+' and secrecy '+s.id,false);}}
const pr=X.prompt(S.me);ck('prompt: adult, willing, stop at once, no blackmail or drugging, husband not harmed, no pregnancy result, no minor, direct words, reason',/ผู้ใหญ่ เต็มใจ/.test(pr)&&/ไม่มีการขู่หรือแบล็กเมล์ ไม่มีการวางยา/.test(pr)&&/ทุกอย่างหยุดทันที/.test(pr)&&/สามีไม่ถูกทำร้าย/.test(pr)&&/ไม่มีเด็ก/.test(pr)&&/ไม่มีการเขียนผลการตั้งครรภ์/.test(pr)&&/เซ็กส์ตรง ๆ/.test(pr)&&pr.includes(D.REASONS[f.reason])&&/<woman>/.test(pr));
X.set('hook','กลิ่นตัวเขา');X.set('hook','เสียงทุ้มที่กระซิบข้างหู');X.set('hook','น้ำหนักตัวที่ทับลงมา');X.set('hook','มือใหญ่ที่จับสะโพกแน่น');X.set('hook','ความร้อนที่ไหลลึก');ck('at most 4 hooks, a repeat press toggles',X.st.form.hooks.length===4&&(X.set('hook','ความร้อนที่ไหลลึก'),X.st.form.hooks.length===3));
X.st.pov='her';X.set('arc','cold');X.set('sec','secret');ck('her-POV prompt says "ฉัน" is the woman',/"ฉัน" คือ หญิงW1/.test(X.prompt(S.me)));
ck('junk set refused',!!thr(()=>X.set('zzz','x')));
const n=X.norm({pov:'x',sel:'q',form:{arc:'zzz',sec:'front',reason:99,hooks:['x','กลิ่นตัวเขา'],place:'x',end:'x',n:'99'},txt:5});ck('norm cleans junk',n.pov==='him'&&n.form.arc===''&&n.form.sec==='front'&&n.form.reason===3&&n.form.hooks.join()==='กลิ่นตัวเขา'&&n.form.place===''&&n.form.n===30&&typeof n.txt==='string'&&thr(()=>X.norm(null))===null);
S.game.mode=null;X.onAct('brdopen',{dataset:{}});ck('open sets the mode; back leaves',S.game.mode==='breed'&&(X.onAct('brdback',{dataset:{}}),S.game.mode===null));
ck('act: sel/pov/set/roll work and a bad woman is refused',(X.onAct('brdsel',{dataset:{v:'W20'}}),X.st.sel==='W20')&&(X.onAct('brdsel',{dataset:{v:'W19'}}),X.st.sel==='W20')&&(X.onAct('brdset',{dataset:{v:'sec:near'}}),X.st.form.sec==='near')&&(X.onAct('brdpov',{dataset:{v:'her'}}),X.st.pov==='her'));
return (bad?o.join('\n')+'\nTOTAL FAIL '+bad:'ALL OK');}catch(e){return 'THROW '+e.message+' '+e.stack.slice(0,300);}}));
if(errs.length)console.log('PAGEERR',errs.slice(0,3));await b.close();})();
