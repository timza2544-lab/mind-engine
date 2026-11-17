// usage: node image-tease.js <app dir>; the climax picture prompts (A.imgScene.compose, used by the card night, dual and pact) are glimpses: no plain act or organ words, the position becomes a framing, her sheet is cut to what a picture needs (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
const w={id:'tz1',data:A.gameWoman({age:29})};
const BLUNT=/เย็ด|ควย|หี\b|แตก|น้ำเงี่ยน|น้ำแตก|อวัยวะ|สอดใส่|มิชชันนารี|missionary|doggy|cowgirl|spooning|หัวนม|ปากช่องคลอด|ปากมดลูก|แคม|คลิตอริส|โม๊ก|อมควย|ถลกขึ้น|ปลดออกไปครึ่งหนึ่ง|ไม่ใส่กางเกง|เห็นสะโพก/;
// every position the app writes (library, bed positions, dual's list) goes through
const pos=[];Object.values(A.positionLib.POS).forEach(q=>pos.push(q.t));A.positionLib.ACT[1].concat(A.positionLib.ACT[2]).forEach(q=>pos.push(q.t));
['ท่านอนหงาย ฉันอยู่บน (มิชชันนารี)','ท่าเธออยู่บน cowgirl','ท่าหมาจากข้างหลัง (doggy)','ตะแคงกอดจากหลัง (spooning)','นั่งตัก lotus','ยืนพิงผนัง','บนโต๊ะหรือเคาน์เตอร์','ขาพาดไหล่','ท่า 69 โม๊กควย','ครบพิธี: เธอรับเขาเข้าไปทั้งตัว'].forEach(t=>pos.push(t));
let nBlunt=0,nShown=0,fams=new Set();
for(const t of pos){for(let n=1;n<=4;n++){const r=A.imgScene.compose(w,{n,seed:'s'+n,venue:'ห้องนอน',pos:t,intimate:true,finishId:n===1?'deep':undefined});if(!r){bad++;o.push('FAIL null for '+t);continue;}
 const rest=Object.keys(r.parts).filter(k=>k!=='ตัวละคร').map(k=>r.parts[k]).join('\n');nShown++;if(BLUNT.test(rest)){nBlunt++;if(nBlunt<4)o.push('BLUNT in '+JSON.stringify(t)+': '+(rest.match(BLUNT)||[])[0]);}fams.add(r.parts['ท่าทาง']);}}
ck('no blunt word in '+nShown+' climax prompts ('+nBlunt+' hits)',nBlunt===0);ck('positions become varied glimpses ('+fams.size+' distinct poses)',fams.size>=18);
// shape of one prompt
const r=A.imgScene.compose(w,{n:1,seed:'x',venue:'ห้องนอน',pos:'ท่าหมาจากข้างหลัง (doggy)',intimate:true});
ck('has a framing line',!!r.parts['การจัดภาพ (เห็นแค่บางส่วน)']);ck('style says glimpse, covered, other person partial',/เห็นแวบ ๆ/.test(r.parts['สไตล์'])&&/อีกคนหนึ่งในภาพ/.test(r.parts['สไตล์']));
ck('negative keeps the explicit-content terms, mildly worded',/explicit nudity/.test(r.neg)&&/sexual act/.test(r.neg)&&/topless/.test(r.neg)&&!/genitals|penis|vagina/.test(r.neg));ck('the sheet is cut (head, build, skin, face, hair only)',/\[ ใบหน้า \]/.test(r.th)&&!/\[ มือและปากเมื่อถูกสัมผัส/.test(r.th)&&!/\[ สภาพตอนนี้/.test(r.th));
const raw=A.imgScene.compose(w,{n:1,seed:'x',venue:'ห้องนอน',pos:'ท่าหมาจากข้างหลัง (doggy)',raw:true});
ck('raw: the old blunt text is still there on request',/doggy/.test(raw.parts['ท่าทาง'])&&/\[ มือและปากเมื่อถูกสัมผัส/.test(raw.th)&&raw.th.length>r.th.length*1.5);o.push('tease '+r.th.length+' chars vs raw '+raw.th.length);
// outfits and states are softened
const outs=new Set();for(let i=1;i<=30;i++){const q=A.imgScene.compose({id:'o'+i,data:A.gameWoman({age:20+i})},{n:1,seed:'o'+i,pos:'ท่าช้อน',intimate:true});outs.add(q.outfit);}
ck('outfits: nothing bare ('+[...outs].some(x=>/ไม่ใส่กางเกง|ถลกขึ้น|ปลดออกไปครึ่งหนึ่ง|ชุดชั้นใน/.test(x))+')',![...outs].some(x=>/ไม่ใส่กางเกง|ถลกขึ้น|ปลดออกไปครึ่งหนึ่ง|ชุดชั้นใน/.test(x)));
// a portrait keeps its own words (not turned into an embrace)
const por=A.imgScene.compose(w,{n:1,seed:'y',venue:'ห้องโถง',pos:'ปรากฏตัวตรงหน้าฉันในฐานะเทพี ยืนนิ่ง สายตามองทะลุ',intimate:false});ck('portrait keeps its pose and has no framing line',/ยืนนิ่ง/.test(por.parts['ท่าทาง'])&&!por.parts['การจัดภาพ (เห็นแค่บางส่วน)']);
const por2=A.imgScene.compose(w,{n:1,seed:'y',pos:'ยืนตรงหน้าเขาที่โต๊ะอาหาร มือกุมกัน'});ck('auto: a standing figure at a table is not read as a position',/โต๊ะอาหาร/.test(por2.parts['ท่าทาง']));
ck('look slot kept apart from the pose',(()=>{const q=A.imgScene.compose(w,{n:1,seed:'y',pos:'ท่าช้อน',intimate:true,look:'เขาโค้งสีเงินบนหน้าผาก'});return q.th.includes('[ ลักษณะเฉพาะ ]\nเขาโค้งสีเงินบนหน้าผาก')&&!q.parts['ท่าทาง'].includes('เขาโค้ง');})());
// minors never
const kid={id:'k',data:Object.assign({},w.data,{age:15,birthday:''})};if(A.minor(kid.data))ck('minor: no prompt',A.imgScene.compose(kid,{n:1,pos:'ท่าช้อน'})===null);
// the modes: cards (needs a match), dual, pact
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
