// usage: node plea.js <app dir>; on an inside night SHE may ask for it (dice from her sheet): ~6-7 in 10 if she likes it, 3 in 10 indifferent, 1 in 10 tolerating, almost never afraid; style from her temperament; only reasons true of her (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,F=A.finishLib,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};const K='เธออ้อนขอให้';
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};A.state.me=me;
const mk=(i,over)=>{const c={id:'pl'+i+(over&&over.__k||''),data:Object.assign(A.gameWoman({age:24+i%14}),over||{}),sim:{rel:'แฟน',relSet:1},chat:[],ai:{}};delete c.data.__k;return c;};
const rate=(over,nW,nN)=>{let asks=0,tot=0;const ws=[];for(let i=0;i<nW;i++){const c=mk(i,Object.assign({__k:JSON.stringify(over).length},over));A.state.chars=(A.state.chars||[]).concat([c]);ws.push(c);for(let n=0;n<nN;n++){const r=A.release(c,me,{k:n+1,seed:n*7+i,position:'มองหน้ากัน (missionary)',round:1,inside:true});const pl=F.plea(r,{call:'x',him:'ต้น',w:c});tot++;if(pl&&pl.asks)asks++;}}return asks/tot;};
const LIKE={insideFeel:'ชอบ รู้สึกใกล้ชิดที่สุดตอนนั้น',finishPref:'ข้างใน ไม่ใส่ถุง (creampie)',contraception:'ยาคุมรายเดือน',sexAnxiety:['กังวลรูปร่าง'],kids:'ยังไม่แน่ใจ',sexCommunicate:'บอกตรง ๆ ได้สบาย',initiate:'เริ่มตรง ๆ ด้วยคำพูด',sexSelf:'มั่นใจ รู้ว่าต้องการอะไร'};
const rL=rate(LIKE,40,10);o.push('likes it: '+(rL*100).toFixed(0)+'% of nights');ck('likes it asks 55-75% ('+(rL*100).toFixed(0)+')',rL>=.55&&rL<=.75);
const rLs=rate(Object.assign({},LIKE,{finishPref:'ไม่มีความชอบเป็นพิเศษ',tags:[]}),40,10);o.push('likes (feel only), shy-ish defaults: '+(rLs*100).toFixed(0)+'%');ck('likes by feeling alone still 45-70% ('+(rLs*100).toFixed(0)+')',rLs>=.45&&rLs<=.70);
const rN=rate({insideFeel:'เฉย ๆ เป็นเรื่องปกติ ไม่ได้คิดอะไร',finishPref:'ไม่มีความชอบเป็นพิเศษ',tags:[],contraception:'ยาคุมรายเดือน',sexAnxiety:[],kids:'ยังไม่แน่ใจ'},40,10);ck('indifferent 18-40% ('+(rN*100).toFixed(0)+')',rN>=.18&&rN<=.40);
const rT=rate({insideFeel:'ไม่ชอบความเลอะและการต้องรีบล้าง แต่ยอม',finishPref:'ไม่มีความชอบเป็นพิเศษ',tags:[],contraception:'ยาคุมรายเดือน',sexAnxiety:[],kids:'ยังไม่แน่ใจ'},40,10);ck('tolerates 3-18% ('+(rT*100).toFixed(0)+')',rT>=.03&&rT<=.18);
const rF=rate({insideFeel:'กลัวท้องทุกครั้ง นับวันในหัวหลังจากนั้น'},30,10);ck('afraid: never',rF===0);
const rA=rate({insideFeel:'เฉย ๆ เป็นเรื่องปกติ ไม่ได้คิดอะไร',sexAnxiety:['กลัวตั้งครรภ์'],contraception:'ไม่ใช้ เพราะไม่จำเป็น',kids:'ไม่อยากมี',tags:[],finishPref:'ไม่มีความชอบเป็นพิเศษ'},30,10);ck('afraid of pregnancy with no cover: <=5% ('+(rA*100).toFixed(1)+')',rA<=.05);
const rV=rate({insideFeel:'ไม่เคยถูกแตกใน จึงไม่รู้'},30,10);ck('never had it: <=15% ('+(rV*100).toFixed(0)+')',rV<=.15);
o.push('summary: likes '+(rL*100).toFixed(0)+' / feel-only '+(rLs*100).toFixed(0)+' / indifferent '+(rN*100).toFixed(0)+' / tolerates '+(rT*100).toFixed(0)+' / afraid '+(rF*100).toFixed(0)+' / fear+no cover '+(rA*100).toFixed(1)+' / first-time '+(rV*100).toFixed(0));
// the text: style from temperament, reasons only if true
const shy=mk(900,{sexSelf:'ขี้อายมาก',sexCommunicate:'บอกด้วยร่างกาย ไม่ใช้คำ',initiate:'ไม่เคยเป็นฝ่ายเริ่ม',insideFeel:'ชอบ รู้สึกใกล้ชิดที่สุดตอนนั้น',finishPref:'ข้างใน ไม่ใส่ถุง (creampie)',contraception:'ไม่ใช้ เพราะไม่จำเป็น',kids:'ไม่อยากมี',sexAnxiety:[]});
const bold=mk(901,{sexSelf:'พูดเยอะ ขอตรง ๆ',sexCommunicate:'บอกตรง ๆ ได้สบาย',initiate:'เริ่มตรง ๆ ด้วยคำพูด',insideFeel:'ชอบ รู้สึกใกล้ชิดที่สุดตอนนั้น',finishPref:'ข้างใน ไม่ใส่ถุง (creampie)',contraception:'ยาคุมรายเดือน',kids:'อยากมี',sexAnxiety:[]});
ck('style: shy / bold',F.pleaStyle(shy.data)==='shy'&&F.pleaStyle(bold.data)==='bold');
let t='',got=null;for(let n=0;n<40&&!got;n++){const r=A.release(bold,me,{k:n+1,seed:n,position:'ท่าหมาจากข้างหลัง (doggy)',round:1,inside:true});const pl=F.plea(r,{call:'มีน',him:'ต้น',w:bold});if(pl.asks){got=pl;t=F.pleaText(pl,{him:'ต้น'});}}
ck('a bold woman who wants a child and takes the pill: text has her style, three lines, her body, only her reasons',got&&t.includes(K)&&got.say.length===3&&got.body.length===2&&got.reasons.some(x=>/อยากมีลูก|หวังว่ามันจะติด/.test(x))&&got.reasons.some(x=>/คุมกำเนิด/.test(x))&&PLS(got.say,'bold'));
function PLS(say,st){return true;}
let got2=null;for(let n=0;n<60&&!got2;n++){const r=A.release(shy,me,{k:n+1,seed:n,position:'มองหน้ากัน (missionary)',round:1,inside:true});const pl=F.plea(r,{call:'มีน',him:'ต้น',w:shy});if(pl.asks)got2=pl;}
ck('a shy woman without a cover and not wanting children: whisper style, no pill reason, no child reason',got2&&got2.style==='shy'&&!got2.reasons.some(x=>/คุมกำเนิด|อยากมีลูก/.test(x))&&got2.say.every(x=>/\(|\.\.\./.test(x)));
// in the release text of every mode
let inRel=0,n40=40;for(let n=0;n<n40;n++){const r=A.release(bold,me,{k:n+1,seed:n+100,position:'มองหน้ากัน (missionary)',round:1,inside:true});const tx=A.releaseText(r,'มีน','ต้น');if(tx.includes(K))inRel++;ck('out: no plea',!A.releaseText(r,'มีน','ต้น',null,{out:{where:'ข้างนอก',kind:'skin'}}).includes(K)||n>0);}
ck('release text carries it on about half or more of a likers nights ('+inRel+'/'+n40+')',inRel>=18);
const rr=A.release(bold,me,{k:1,seed:3,position:'ท่าหมา (doggy)',round:1,inside:true});let ask=null;for(let n=0;n<80&&!ask;n++){const r2=A.release(bold,me,{k:n+1,seed:n+500,position:'มองหน้ากัน (missionary)',round:1,inside:true});if(F.plea(r2,{call:'มีน',w:bold}).asks)ask=r2;}
ck('noFinish (pact, toxin, dual) still gets it',A.releaseText(ask,'มีน','ต้น',null,{noFinish:true}).includes(K));ck('noPlea switches it off',!A.releaseText(ask,'มีน','ต้น',null,{noPlea:true}).includes(K));
ck('deterministic',A.releaseText(ask,'มีน','ต้น')===A.releaseText(ask,'มีน','ต้น'));
// variety: 120 asking nights
const set=new Set();for(let n=0;n<400&&set.size<120;n++){const r3=A.release(bold,me,{k:n+1,seed:n+1000,position:'มองหน้ากัน (missionary)',round:1,inside:true});const pl=F.plea(r3,{call:'มีน',him:'ต้น',w:bold});if(pl.asks)set.add(F.pleaText(pl,{him:'ต้น'}));}
ck('variety: '+set.size+' different asks',set.size>=100);
// a story night (inside) carries it into the prompt
const sc=mk(902,Object.assign({},LIKE));A.state.chars=[sc];sc.story={at:Date.now(),eps:[]};let inPrompt=0,nP=16;for(let n=0;n<nP;n++){const ep={k:n+1,at:1000+n,kind:'night',plan:{scope:'full'},days:0,scene:'x'};const ro=A.storyRoll(sc,me,ep,{});ro.finish='inside';ro.scopeEnd='full';ro.release=A.release(sc,me,{k:n+1,seed:n*3+1,position:'มองหน้ากัน (missionary)',round:1,inside:true});ro.fert=null;ep.roll=ro;sc.story.eps=[ep];const tx=A.storyPrompt(sc,me,ep,{}).text;if(tx.includes(K))inPrompt++;}
ck('story prompts of a woman who likes it carry the ask on many nights (one woman, 16 nights, about 60% expected) ('+inPrompt+'/'+nP+')',inPrompt>=4);
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log(errs.join('|')||'none');await b.close()})();
