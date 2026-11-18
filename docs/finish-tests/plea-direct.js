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
const DIRECT=/แตกใน|ปล่อยใน|ปล่อยข้างใน|อย่าถอน|อย่าถอย|อย่าดึงออก|ไม่ต้องถอนออก/;
ck('every prompt carries a direct word stock with direct words in it',texts.every(x=>/คำตรงที่ต้องใช้เป็นคำขอของเธอ/.test(x.t)&&x.pl.ask.length===6&&x.pl.ask.some(a=>DIRECT.test(a))));
ck('every prompt carries the speech rule and bans the stilted phrases',texts.every(x=>/กฎคำพูด/.test(x.t)&&/ห้ามใช้คำอ้อม/.test(x.t)&&/เสร็จข้างใน/.test(x.t)&&/เข้ามาลึก ๆ แล้วปล่อย/.test(x.t)));
ck('the old "do not copy the words" wording is gone',texts.every(x=>!/ไม่ต้องคัดลอกตรง ๆ/.test(x.t)&&/ห้ามแปลงคำหลักให้อ้อมหรือสละสลวย/.test(x.t)));
ck('his answer carries short direct lines',texts.every(x=>x.pl.hisSay.length===3&&/ถ้า.*พูดด้วย ให้พูดตรงและสั้น/.test(x.t)));
ck('no stage direction in the pools is a quotable stilted phrase',texts.every(x=>!/ที่เหลือต้องเสร็จข้างในท่านี้/.test(x.pl.when)));
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
