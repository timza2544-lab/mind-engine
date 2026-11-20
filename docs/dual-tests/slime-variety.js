// usage: node slime-variety.js <app dir>; much more variety (v278): scene themes (47 for the main slime, 24 for the small piece), a theme per meal picked by seed without repeats or chosen by hand, cares done by the small piece alone in tight places
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,X=A.slime,D=A.slimeData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};const thr=f=>{try{f();return null;}catch(e){return String(e.message);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.game=S.game||{};A.ui.toast=()=>{};S.chars=[];X.load();X.create('วุ้น');const s=X.get();s.mass=300;
ck('themes: 47 for the main slime in 5 groups, 24 for the small piece; every one has an id, group, title and a writer text; ids unique; nothing about a child',D.THEMES.length>=47&&D.SUBTHEMES.length>=24&&D.THEME_GROUPS.length===5&&[...D.THEMES,...D.SUBTHEMES].every(t=>t.id&&t.g&&t.t&&t.w&&t.w.length>20&&!/เด็ก|ทารก|ลูกสไลม์/.test(t.t+t.w))&&new Set(D.THEMES.map(t=>t.id)).size===D.THEMES.length&&D.THEME_GROUPS.every(g=>D.THEMES.some(t=>t.g===g[0])));
ck('positions are broad: at least 10 positions, 10 places, 7 tempos, 7 shape tricks, 6 moods',['pos','place','tempo','shape','mood'].every((g,i)=>D.THEMES.filter(t=>t.g===g).length>=[10,10,7,7,6][i]));
// a theme rolls with every meal and never repeats inside the last 8
s.form={key:'blob',name:'ก้อนสไลม์'};const seen=[];for(let i=0;i<30;i++){s.hunger=60;s.meals=0;X.feed(S.me,'absorb');seen.push(s.last.theme);}
ck('every meal has a theme; no theme repeats within 8 meals; at least 25 different themes in 30 meals',seen.every(x=>x&&X.themeOf('main',x))&&seen.every((x,i)=>!seen.slice(Math.max(0,i-7),i).includes(x))&&new Set(seen).size>=25);
// choose by hand / reroll
s.hunger=60;s.meals=0;X.feed(S.me,'absorb');X.setTheme('main','car');ck('choose a theme by hand (in a car); prompt rule 11 carries it and still says to keep the meal numbers and consent',s.last.theme==='car'&&/^11\. ธีมของฉากนี้/m.test(X.scenePrompt(S.me,'meal'))&&/ในรถที่จอดมืด/.test(X.scenePrompt(S.me,'meal'))&&/ห้ามเปลี่ยนตัวเลข/.test(X.scenePrompt(S.me,'meal').split('11. ธีม')[1]));
const t0=s.last.theme;const rr=X.rerollTheme('main');ck('reroll gives another theme',rr&&rr.id!==t0&&s.last.theme===rr.id);
ck('unknown theme refused; no theme before a meal for a piece',!!thr(()=>X.setTheme('main','zzz'))&&!!thr(()=>X.setTheme('sub','tip-ring','nope')));
// the small piece
s.hunger=30;const c=X.budOff(s);S.slime=s;X.subSel=c.id;c.feeds=40;c.hunger=60;X.feedSub(S.me,c.id,'mouth');
ck('the small piece gets its own theme from its own list, and rule 11 uses it in the alone and the both-together scenes',!!c.last.theme&&X.themeOf('sub',c.last.theme)&&/^11\. ธีมของฉากนี้/m.test(X.subPrompt(S.me,'sub',c.id))&&/^11\. ธีมของฉากนี้/m.test(X.subPrompt(S.me,'duo',c.id)));
X.setTheme('sub','mini-ride',c.id);const pm=X.subPrompt(S.me,'sub',c.id);ck('chosen small-body theme: a palm-sized adult woman rides the head; adult shape',/ผู้หญิงผู้ใหญ่ขนาดฝ่ามือ/.test(pm)&&c.last.theme==='mini-ride');
const sw=new Set();for(let i=0;i<24;i++){c.hunger=60;X.feedSub(S.me,c.id,'hand');sw.add(c.last.theme);}ck('24 meals: the piece rolls 15+ different themes',sw.size>=15);
// cares done by the small piece
const sc=D.CARE.filter(x=>x.sub);ck('ten cares done by the small piece alone, each in a tight place, sexual and ending in pleasure; none for a child',sc.length===10&&sc.every(x=>/ตัวย่อยทำเอง/.test(x.t)&&/ควย/.test(x.w)&&/เสียว|แตก/.test(x.w)&&!/เด็ก|ทารก|ลูกสไลม์/.test(x.w)));
s.children.length=0;ck('without a piece the sub cares are refused',/ต้องมีสไลม์ย่อยก่อน/.test(thr(()=>X.care('sub-groin'))||''));
const c2=X.budOff(s);X.subSel=c2.id;c2.feeds=5;X.care('sub-groin');const pcs=X.carePrompt(S.me);
ck('sub care prompt: the small piece does it alone, its age (20) and its level of mind are given, the main slime only watches or sleeps; <sub> block; no comparison to a child or nursing',/3\.1 ฉากนี้สไลม์ย่อยชื่อ/.test(pcs)&&/อายุ 20 ปี/.test(pcs)&&/สัญชาตญาณเด่น/.test(pcs)&&/สไลม์หลักเป็นผู้ดูอยู่หรือหลับอยู่ ไม่ลงมือ/.test(pcs)&&/<sub>/.test(pcs)&&/ห้ามเปรียบสไลม์ย่อยกับเด็ก ทารก หรือการให้นม/.test(pcs));
for(const id of ['sub-pants','sub-sleep','sub-nipple','sub-ear','sub-toes','sub-navel','sub-glans','sub-crack','sub-wake']){X.care(id);ck('sub care '+id+': its text reaches the prompt',X.carePrompt(S.me).includes(D.CARE.find(x=>x.id===id).w.slice(0,30)));}
// norm
const n2=X.norm(JSON.parse(JSON.stringify(s)));ck('norm keeps the theme of the last meal, of the piece, and the history; junk is cleaned',n2.last.theme===s.last.theme&&n2.themeHist.length>0&&n2.children[0].last===null||n2.children[0].last.theme!==undefined);
ck('norm cleans a junk theme id',X.norm({name:'x',last:{theme:'<b>'.repeat(30)}}).last.theme.length<=30);
// UI
S.game.mode='slime';s.hunger=60;s.meals=0;X.feed(S.me,'absorb');X.feedSub(S.me,c2.id,'absorb');const h=X.html();
ck('page: a theme box for the meal (title, text, reroll, a hand-pick list of 47) and one for the piece (24); sub cares are listed apart and enabled',/ธีมฉากรอบนี้/.test(h)&&(h.match(/data-act="slmtheme" data-k="main"/g)||[]).length===47&&(h.match(/data-act="slmtheme" data-k="sub"/g)||[]).length===24&&/data-act="slmthemeroll" data-k="main"/.test(h)&&/ตัวย่อยทำเองในซอกเล็ก/.test(h)&&!/data-act="slmcare" data-v="sub-groin"[^>]*disabled/.test(h));
X.onAct('slmtheme',{dataset:{k:'main',v:'rain',s:''}});ck('act: pick a theme',s.last.theme==='rain');X.onAct('slmthemeroll',{dataset:{k:'sub',s:c2.id}});ck('act: reroll the piece\'s theme',!!c2.last.theme);
return (bad?o.join('\n')+'\nTOTAL FAIL '+bad:'ALL OK')+'\nERRS none';}catch(e){return 'THROW '+e.message+' '+e.stack.slice(0,300);}}));
if(errs.length)console.log('PAGEERR',errs.slice(0,3));await b.close();})();
