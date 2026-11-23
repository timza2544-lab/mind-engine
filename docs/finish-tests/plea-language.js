// usage: node plea-language.js <app dir>; the words she uses when she asks him to finish inside: large pools, built from parts, shaped by her sheet (particles, drawl, dialect, swearing, age, cover, wish for a child) and only what is true of her (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,F=A.finishLib,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};A.state.me=me;
const LIKE={insideFeel:'ชอบ รู้สึกใกล้ชิดที่สุดตอนนั้น',finishPref:'ข้างใน ไม่ใส่ถุง (creampie)',sexAnxiety:[]};
const ST={bold:{sexSelf:'พูดเยอะ ขอตรง ๆ',sexCommunicate:'บอกตรง ๆ ได้สบาย',initiate:'เริ่มตรง ๆ ด้วยคำพูด'},coax:{sexSelf:'สลับได้ตามอารมณ์',sexCommunicate:'บอกผ่านมุกตลก',initiate:'เริ่มทางอ้อม (แต่งตัว แตะ มอง)',tags:[]},tender:{sexSelf:'ชอบเป็นฝ่ายตาม',sexCommunicate:'บอกผ่านมุกตลก',initiate:'เริ่มทางอ้อม (แต่งตัว แตะ มอง)',tags:['ช้าและละเมียด (slow & sensual)']},shy:{sexSelf:'ขี้อายมาก',sexCommunicate:'บอกด้วยร่างกาย ไม่ใช้คำ',initiate:'ไม่เคยเป็นฝ่ายเริ่ม'}};
let ctr=0;const asks=(over,st,nW,nN)=>{const out=[];for(let i=0;i<nW;i++){const c={id:'pl2'+(ctr++),data:Object.assign(A.gameWoman({age:(over.age||28)+i%6}),LIKE,ST[st],over),sim:{rel:'แฟน'},chat:[],ai:{}};A.state.chars=[c];for(let n=0;n<nN;n++){const r=A.release(c,me,{k:n+1,seed:n*5+i,position:'มองหน้ากัน (missionary)',round:1,inside:true});const pl=F.plea(r,{call:'มีน',him:'ต้น',w:c});if(pl&&pl.asks)out.push(pl);}}return out;};
// 1. volume and variety
const all=[];['bold','coax','tender','shy'].forEach(st=>asks({contraception:'ยาคุมรายเดือน',kids:'อยากมี',swear:60,particles:['ขา','นะ'],typeDialect:'ไม่มี'},st,30,12).forEach(x=>all.push(x)));
const lines=all.flatMap(x=>x.say),uniq=new Set(lines);o.push('asks '+all.length+', lines '+lines.length+', distinct '+uniq.size);ck('distinct lines >= 70% ('+(uniq.size/lines.length*100).toFixed(0)+'%)',uniq.size/lines.length>=.70);
const cores=new Set();lines.forEach(l=>cores.add(l.replace(/^[\s(][^)]*\)\s*/,'').replace(/(นะะะ|ขาาา|[ะา]+)$/,'').slice(0,18)));ck('wide spread of what is asked ('+cores.size+' different openings)',cores.size>=150);
ck('forms, sounds and inner lines vary',new Set(all.map(x=>x.form)).size>=10&&new Set(all.flatMap(x=>x.sfx)).size>=10&&new Set(all.map(x=>x.inner).filter(Boolean)).size>=8);
ck('three lines climb: the last one is the broken one',all.filter(x=>/^\(|\.\.\./.test(x.say[2])).length/all.length>=.85);
// 2. her sheet shapes the words
const noSwear=asks({contraception:'ยาคุมรายเดือน',swear:10,particles:['นะ'],typeDialect:'ไม่มี'},'bold',30,12);ck('swear 10: no coarse words ('+noSwear.length+' asks)',noSwear.length>50&&noSwear.every(x=>x.say.every(l=>!/หี|ควย/.test(l))));
const swears=asks({contraception:'ยาคุมรายเดือน',swear:85,particles:['นะ'],typeDialect:'ไม่มี'},'bold',30,12);ck('swear 85: coarse words do appear',swears.some(x=>x.say.some(l=>/หี|ควย/.test(l))));
const isan=asks({typeDialect:'อีสาน (บ่ เด้อ)',swear:10,particles:['นะ']},'coax',30,12),north=asks({typeDialect:'เหนือ (เจ้า ก่อ)',swear:10,particles:['นะ']},'coax',30,12),south=asks({typeDialect:'ใต้ (หรอย แหลง)',swear:10,particles:['นะ']},'coax',30,12),none=asks({typeDialect:'ไม่มี',swear:10,particles:['นะ']},'coax',30,12);
const has=(L,rx)=>L.some(x=>x.say.some(l=>rx.test(l)));ck('Isan woman: "เด้อ" shows, others never',has(isan,/เด้อ/)&&!has(north,/เด้อ/)&&!has(south,/เด้อ/)&&!has(none,/เด้อ/));ck('Northern: "เน้อ/เจ้า"; Southern: "เหอ"; none: none of them',has(north,/เน้อ|เจ้า/)&&has(south,/เหอ/)&&!has(none,/เน้อ|เหอ|เจ้า/));
const dr=asks({typeDrawl:'ลากแทบทุกประโยค',particles:['ขา','นะ'],swear:10,typeDialect:'ไม่มี'},'coax',30,12),nodr=asks({typeDrawl:'ไม่ลาก',particles:['ขา','นะ'],swear:10,typeDialect:'ไม่มี'},'coax',30,12);ck('drawl: elongated particles only for a woman who drawls',has(dr,/(ขาาา|นะะะ)/)&&!has(nodr,/(ขาาา|นะะะ|นะะ)/));
const par=asks({particles:['ขา'],typeDrawl:'ไม่ลาก',swear:10,typeDialect:'ไม่มี'},'coax',30,12);ck('her particle ends many lines (ขา)',par.flatMap(x=>x.say).filter(l=>/ขา$/.test(l)).length>=par.length*.5);
const nopar=asks({particles:[],typeDrawl:'ไม่ลาก',swear:10,typeDialect:'ไม่มี',contraception:'ไม่ใช้ เพราะไม่จำเป็น',kids:'ไม่แน่ใจ'},'tender',30,12);ck('no particles: none added (no ขา/จ้ะ/ค่ะ/คะ endings)',nopar.length>30&&nopar.every(x=>x.say.every(l=>!/(ขา|จ้ะ|จ๊ะ|ค่ะ|คะ)$/.test(l))));
// 3. only what is true of her
const noPill=asks({contraception:'ไม่ใช้ เพราะไม่จำเป็น',kids:'ไม่แน่ใจ',swear:10,particles:['นะ'],typeDialect:'ไม่มี'},'coax',40,12);ck('no hormonal cover: no pill lines ('+noPill.length+' asks)',noPill.length>50&&noPill.every(x=>x.say.every(l=>!/กินยา|คุมไว้แล้ว|วันนี้ฉันปลอดภัย/.test(l))));
const noKid=asks({contraception:'ยาคุมรายเดือน',kids:'ไม่อยากมี',swear:10,particles:['นะ'],typeDialect:'ไม่มี'},'coax',40,12);ck('does not want children: no child lines',noKid.length>40&&noKid.every(x=>x.say.every(l=>!/มีลูก|ให้มันติด|มันติด/.test(l))));
const yesKid=asks({contraception:'ไม่ใช้ เพราะไม่จำเป็น',kids:'อยากมี',swear:10,particles:['นะ'],typeDialect:'ไม่มี'},'tender',40,12);ck('wants children: child lines appear and the reason is listed',has(yesKid,/มีลูก|ให้มันติด|มันติด/)&&yesKid.some(x=>x.reasons.some(y=>/อยากมีลูก|หวังว่ามันจะติด/.test(y))));
const young=asks({age:21,swear:10,particles:['นะ'],typeDialect:'ไม่มี',contraception:'ไม่ใช้ เพราะไม่จำเป็น',kids:'ไม่แน่ใจ'},'bold',40,12),mature=asks({age:44,swear:10,particles:['นะ'],typeDialect:'ไม่มี',contraception:'ไม่ใช้ เพราะไม่จำเป็น',kids:'ไม่แน่ใจ'},'bold',40,12);
ck('age: slang for the young, composed lines for the mature, not the other way',has(young,/อ่ะ|ดิ|ป่าว/)&&!has(mature,/อ่ะ|ดิ|ป่าว/)&&has(mature,/ฉันโตแล้ว|ตัดสินใจเองแล้ว|รอมานานแล้ว|ไม่เคยขอ/)&&!has(young,/ฉันโตแล้ว|รอมานานแล้ว/));
// 4. the shy one stays shy
const shy=asks({swear:90,contraception:'ยาคุมรายเดือน',kids:'อยากมี',particles:['ขา'],typeDialect:'เหนือ (เจ้า ก่อ)'},'shy',40,12);
ck('shy: every line is a whisper or a fragment, never coarse or bargaining ('+shy.length+' asks)',shy.length>50&&shy.every(x=>x.say.every(l=>/\(|\.\.\./.test(l)&&!/หี|ควย/.test(l)&&!/ทั้งคืน|อีกรอบ|เก่งมาก/.test(l))));
ck('shy forms never shout',shy.every(x=>!/ร้องออกมาดัง|เหมือนสั่ง/.test(x.form)));
const loud=asks({speechVolume:85,swear:10,particles:['นะ'],typeDialect:'ไม่มี'},'bold',30,12),quiet=asks({speechVolume:15,swear:10,particles:['นะ'],typeDialect:'ไม่มี'},'bold',30,12);ck('volume: a loud woman shouts it, a quiet one whispers it',loud.every(x=>/ร้องออกมาดัง/.test(x.form))&&quiet.every(x=>/กระซิบข้างหู/.test(x.form)));
// 5. the text for the writer
const t=F.pleaText(all[0],{him:'ต้น'});ck('text: arc, form, sounds, inner, his answer',/\(1\)/.test(t)&&/\(2\)/.test(t)&&/\(3\)/.test(t)&&/รูปแบบการพูด/.test(t)&&/เสียงที่หลุดออกมา/.test(t)&&/ตอบรับ/.test(t)&&/ไล่ระดับสามช่วง/.test(t));
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log(errs.join('|')||'none');await b.close()})();
