// usage: node flood-scene.js <app dir>; the flood into the womb is its own scene in every inside finish (pregnant or not), built from the last position, force, throbs, arousal and the water; with a conception it comes first (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};const F=A.finishLib,K='ฉากน้ำทะลักเข้ามดลูก';
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};A.state.me=me;
const c={id:'fl1',data:A.gameWoman({age:30}),sim:{rel:'แฟน',relSet:1},chat:[],ai:{}};A.state.chars=[c];
const mk=(over)=>{const r=A.release(c,me,{k:1,seed:3,position:'มองหน้ากัน (missionary)',round:1,inside:true});return Object.assign(r,over||{});};
const base=mk();
let t=A.releaseText(base,'มีน','ต้น');ck('inside release carries the flood scene',t.includes(K));ck('with the facts: position, depth, force, throbs, arousal, water',['ท่าสุดท้ายและมุมที่เข้า','ความลึก','แรงฉีด','การกระตุกของเขา','ความเงี่ยนของเขา','ลักษณะน้ำ','สิ่งที่อยู่ข้างในเธอ'].every(x=>t.includes(x)));
ck('says it comes before any conception scene',t.includes('ฉากนี้ต้องเล่าให้จบก่อนแล้วจึงเริ่มฉากปฏิสนธิ'));
ck('not inside (out): no flood',!A.releaseText(base,'มีน','ต้น',null,{out:{where:'ข้างนอก',kind:'skin'}}).includes(K));
ck('noFlood: none',!A.releaseText(base,'มีน','ต้น',null,{noFlood:true}).includes(K));
ck('noFinish (pact/toxin): flood still there, finish style not',(()=>{const x=A.releaseText(base,'มีน','ต้น',null,{noFinish:true});return x.includes(K)&&!x.includes('รูปแบบการแตกใน');})());
ck('old single womb line not repeated next to the scene',(()=>{const x=A.releaseText(base,'มีน','ต้น');return !x.includes('น้ำทะลุเข้าไปในมดลูก (รายละเอียดที่เจ้าของชอบ');})());
// each factor changes the scene
const fl=r=>F.flood(r,{call:'มีน',him:'ต้น',her:'มีน'});
const ent=['ms','dg','cg','sp','lu','lp','st','ed'].map(id=>fl(Object.assign({},base,{posId:id})).entry);ck('8 positions -> 8 different entry lines',new Set(ent).size===8);
const fT=[0,1,2,3].map(i=>fl(Object.assign({},base,{pattern:Object.assign({},base.pattern,{force:['เนิบ ค่อย ๆ','ไหลเป็นจังหวะ ไม่แรงนัก','พุ่งเป็นจังหวะชัด','พุ่งแรงเป็นสาย รัวถี่ ครั้งแรก ๆ แรงที่สุด'][i]}),semen:Object.assign({},base.semen,{vol:2.5})})).ft);ck('force tiers 0..3 map ('+fT.join(',')+')',fT.join()==='0,1,2,3');
const fH=[10,50,70,90].map(bu=>fl(Object.assign({},base,{buildup:bu})).ht);ck('arousal tiers ('+fH.join(',')+')',fH.join()==='0,1,2,3');
const tcs=[4,9,14].map(n=>fl(Object.assign({},base,{pattern:Object.assign({},base.pattern,{n})})).tc);ck('throb classes ('+tcs.join(',')+')',tcs.join()==='0,1,2');
ck('shallow vs deep position -> depth',fl(Object.assign({},base,{posId:'sp'})).dp===0&&fl(Object.assign({},base,{posId:'lu'})).dp===2);
const wat=fl(Object.assign({},base,{semen:Object.assign({},base.semen,{color:'เหลืองจาง',visc:'ใสเหลวมาก',warm:'อุ่นจัด',vol:4.2})})).semen;ck('water traits come straight from the release',/เหลืองจาง/.test(wat)&&/ใสเหลวมาก/.test(wat)&&/4.2/.test(wat));
ck('position text alone also works (no posId)',fl(Object.assign({},base,{posId:undefined,posT:'ท่าหมาจากข้างหลัง (doggy)'})).pid==='dg');
// same night = same scene, different nights = different words
ck('deterministic',F.floodText(fl(base),{him:'ต้น'})===F.floodText(fl(base),{him:'ต้น'}));
const many=new Set();for(let i=0;i<30;i++)many.add(F.floodText(fl(Object.assign({},base,{buildup:60+i%3,semen:Object.assign({},base.semen,{vol:2+i/10,nth:i})})),{him:'ต้น'}));ck('30 nights -> '+many.size+' different scenes',many.size>=25);
// the position stamp on A.release
const rr=A.release(c,me,{k:2,seed:9,position:'ท่าหมาจากข้างหลัง (doggy)',round:1,inside:true});ck('A.release stamps the position text',rr.posT==='ท่าหมาจากข้างหลัง (doggy)');
// conception: the scene follows the flood, never repeats the release
const cs=A.conceptionScene({seed:'z',her:'มีน',him:'ต้น',vol:3,day:13,len:28,ov:14,pct:20});
ck('conception scene: no stage 1 (release) any more',!cs.includes('1. ตอนปล่อย ผ่านปากมดลูกเข้ามดลูก')&&cs.includes('1. การเดินทางของน้ำเชื้อ'));ck('conception scene says the flood was already told',cs.includes('เล่าจบไปก่อนแล้ว')&&cs.includes('ห้ามเล่าตอนปล่อยและการทะลักซ้ำ'));
const cs2=A.conceptionScene({seed:'z',her:'มีน',him:'ต้น',flood:false});ck('flood:false keeps the old first stage',cs2.includes('1. ตอนปล่อย ผ่านปากมดลูกเข้ามดลูก'));
ck('CON_RULE orders it',A.CON_RULE.includes('ฉากน้ำทะลักต้องเล่าก่อนและจบก่อนเสมอ'));
// a story night: not pregnant -> flood only; pregnant -> flood first, then the conception scene
const sc={id:'fl2',data:A.gameWoman({age:28}),story:{at:Date.now(),eps:[]},sim:{rel:'แฟน',relSet:1},chat:[],ai:{}};A.state.chars=[sc];
const ep={k:1,at:1000,kind:'night',plan:{scope:'full'},days:0,scene:'x'};const ro=A.storyRoll(sc,me,ep,{});ro.finish='inside';ro.scopeEnd='full';ro.release=A.release(sc,me,{k:1,seed:5,position:'มองหน้ากัน (missionary)',round:1,inside:true});ro.release.posId=ro.posPath&&ro.posPath.length?ro.posPath[ro.posPath.length-1]:'ms';ro.fert=null;ep.roll=ro;sc.story.eps=[ep];
let st=A.storyPrompt(sc,me,ep,{}).text;const cIdx=t=>{const m=/^<conception-scene>$/m.exec(t);return m?m.index:-1;};ck('story, not pregnant: flood yes, conception block no',st.includes(K)&&cIdx(st)<0);
ro.fert={conceived:true,outcome:'live',sex:'หญิง',twins:false,pct:22,day:13,len:28,ov:14,vol:3.4,rel:''};st=A.storyPrompt(sc,me,ep,{}).text;
ck('story, pregnant: flood comes before the conception block',st.indexOf(K)>0&&cIdx(st)>st.indexOf(K));
ck('story: the flood uses the LAST position of the path',(()=>{const last=ro.posPath[ro.posPath.length-1];return fl(Object.assign({},ro.release)).pid===last;})());
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log(errs.join('|')||'none');await b.close()})();
