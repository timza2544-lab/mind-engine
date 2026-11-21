// usage: node plea-direct.js <app dir>; when she asks him to finish inside, the speech is plain and direct (แตกใน / ปล่อยใน / อย่าถอน / อย่าถอย): the prompt gives a direct word stock, forbids the stilted stage-direction phrases and gives him short direct lines (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,F=A.finishLib,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};A.state.me=me;
const LIKE={insideFeel:'ชอบ รู้สึกใกล้ชิดที่สุดตอนนั้น',finishPref:'ข้างใน ไม่ใส่ถุง (creampie)',sexAnxiety:[],contraception:'ยาคุมรายเดือน',sexSelf:'พูดเยอะ ขอตรง ๆ',sexCommunicate:'บอกตรง ๆ ได้สบาย',initiate:'เริ่มตรง ๆ ด้วยคำพูด'};
let got=0,tot=0;const texts=[];
for(let i=0;i<40&&got<12;i++){const c={id:'pd'+i,data:Object.assign(A.gameWoman({age:27+i%8}),LIKE),sim:{rel:'แฟน'},chat:[],ai:{}};A.state.chars=[c];const r=A.release(c,me,{k:i+1,seed:i*7,position:'มองหน้ากัน (missionary)',round:1,inside:true});const pl=F.plea(r,{call:'มีน',him:'ต้น',w:c});tot++;if(pl&&pl.asks){got++;texts.push({pl,t:F.pleaText(pl,{him:'ต้น'})});}}
ck('got asking nights ('+got+' of '+tot+')',got>=6);
const DIRECT=/แตก|เอาออก|ชักออก|ฉีด|เติม|อัด|น้ำรัก|ท้อง|เสร็จข้างใน/;
ck('every prompt carries a direct word stock with direct words in it',texts.every(x=>/คำตรงที่ต้องใช้เป็นคำขอของเธอ/.test(x.t)&&x.pl.ask.length>=8&&x.pl.ask.some(a=>DIRECT.test(a))));
ck('every prompt carries the speech rule: spoken words, written words banned by name',texts.every(x=>/กฎคำพูด/.test(x.t)&&/ภาษาพูด ไม่ใช่ภาษาเขียน/.test(x.t)&&/จบ ปล่อย ถอย ถอด ถอน/.test(x.t)));
ck('the old "do not copy the words" wording is gone',texts.every(x=>!/ไม่ต้องคัดลอกตรง ๆ/.test(x.t)&&/ห้ามแปลงคำหลักให้อ้อมหรือสละสลวย/.test(x.t)));
// no spoken line anywhere uses the written-style words
const WR=/จบ|ปล่อย|ถอย|ถอด|ถอน/;const said=[];texts.forEach(x=>{x.pl.say.forEach(l=>said.push(l));x.pl.ask.forEach(l=>said.push(l));x.pl.hisSay.forEach(l=>said.push(l));});
for(let i=0;i<60;i++){const st=['bold','coax','tender','shy'][i%4],c={id:'pw'+i,data:Object.assign(A.gameWoman({age:19+i}),LIKE,{swear:i%2?80:10,typeDialect:['อีสาน','เหนือ','ใต้','ไม่มี'][i%4],kids:i%3?'อยากมี':'ไม่อยากมี'})};F.pleaLines(c.data,st,'ต้น',L=>L[Math.floor(Math.random()*L.length)],Math.random).forEach(l=>said.push(l));}
(F.SAY_HER.slice(0,10).concat(F.SAY_HIS.slice(0,5))).forEach(l=>said.push(l));
const badSay=said.filter(l=>WR.test(l));ck('no spoken line uses จบ / ปล่อย / ถอย / ถอด / ถอน ('+said.length+' lines, '+badSay.length+' hits'+(badSay[0]?': '+badSay[0]:'')+')',badSay.length===0);
ck('his answer carries short direct lines',texts.every(x=>x.pl.hisSay.length===4&&/ถ้า.*พูดด้วย ให้พูดแบบภาษาพูด ตรงและสั้น/.test(x.t)));
ck('no stage direction in the pools is a quotable stilted phrase',texts.every(x=>!/ที่เหลือต้องเสร็จข้างในท่านี้/.test(x.pl.when)));
// swearing and wanting a child widen the stock (หี / เติมน้ำให้เต็มหี / ทำให้ฉันท้องที ...), a shy woman gets neither
const mk=(over,i)=>{const c={id:'pk'+i,data:Object.assign(A.gameWoman({age:30}),LIKE,over),sim:{rel:'แฟน'},chat:[],ai:{}};A.state.chars=[c];for(let n=0;n<40;n++){const r=A.release(c,me,{k:n+1,seed:n*11+i,position:'มองหน้ากัน (missionary)',round:1,inside:true});const pl=F.plea(r,{call:'มีน',him:'ต้น',w:c});if(pl&&pl.asks)return pl;}return null;};
const sw=mk({swear:80,kids:'อยากมี'},1),shy=mk({swear:90,kids:'อยากมี',sexSelf:'ขี้อายมาก',sexCommunicate:'พูดไม่เป็นเลย',initiate:'ไม่เคยเป็นฝ่ายเริ่ม'},2);
ck('a swearing woman who wants a child gets coarse and child words ('+(sw&&sw.ask.length)+' words)',sw&&sw.ask.length>=11&&sw.ask.some(a=>/หี|ควย/.test(a))&&sw.ask.some(a=>/ท้อง|ลูก/.test(a)));
ck('a shy woman gets plain words only',!shy||!shy.ask.some(a=>/หี|ควย|ท้อง/.test(a)));
ck('asks are split by moment (before / while he comes / after) and the prompt says so',texts.every(x=>x.pl.askBy&&x.pl.askBy.before.length===3&&x.pl.askBy.during.length===3&&x.pl.askBy.after.length===2&&/ก่อนเขาถึง:/.test(x.t)&&/ตอนเขากำลังแตก:/.test(x.t)&&/หลังแตกแล้ว:/.test(x.t)&&/ไม่ใช่ "ควยอย่าเอาออกนะ"/.test(x.t)));
ck('word order is spoken order: no "ควยอย่า..." in any ask line',said.every(l=>!/ควยอย่า|ควยห้าม|หีอย่า/.test(l)));
const big=new Set();for(let i=0;i<80;i++){const q=mk({swear:80,kids:'อยากมี'},100+i);if(q)q.ask.forEach(a=>big.add(a));}
ck('wide variety over many nights ('+big.size+' different words)',big.size>=70);
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
