// usage: node cards-mood.js <app dir>; each man's mood in each round of the card night (bitter when his woman was finished inside, harder next round), the <mood> block and rule, and the check list at the end of long scene prompts (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,C=A.cards,H=A.himMood,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me=S.me||{id:'me-profile',data:{age:30,nickname:'ติม',firstName:'ติม',sex:'ชาย',mVolume:'ปานกลาง',mLength:15},chat:[]};S.game=S.game||{};S.game.mode='cards';
// 1. the mapping
const T=(ev)=>H.of(ev).id;
ck('inside + lost + she came -> rage 3',T({partnerInside:true,lostGame:true,partnerCame:true})==='rage'&&H.of({partnerInside:true,lostGame:true,partnerCame:true}).level===3);
ck('inside, he lost -> rage',T({partnerInside:true,lostGame:true})==='rage');ck('inside by right, he won -> jealous',T({partnerInside:true,wonGame:true})==='jealous');
ck('she came, liked -> jealous (more if watched)',T({partnerCame:true,partnerLiked:true,watched:true})==='jealous'&&H.of({partnerCame:true,partnerLiked:true,watched:true}).level===3);
ck('she came, not liked -> hurt',T({partnerCame:true})==='hurt');ck('lost only -> humiliated',T({lostGame:true})==='humiliated');ck('won only -> triumph',T({wonGame:true})==='triumph');
ck('the other woman better -> guilty',T({otherBetter:true})==='guilty');ck('partner shaken -> tender',T({partnerShaken:true})==='tender');ck('nothing -> hungry',T({})==='hungry');
ck('7 moods + 1 default have a full pool',['rage','jealous','hurt','humiliated','triumph','guilty','tender','hungry'].every(k=>{const M=H.MOODS[k];return M&&['thrust','hands','says','look','finish','after','herRead'].every(f=>M[f]&&M[f].length>=1)&&M.thrust.length>=3&&M.says.length>=4;}));
// 2. a real night, forced to the story of the owner's example
C.onAct('cdnewa',{dataset:{}});C.onAct('cdnewb',{dataset:{}});C.onAct('cdstart',{dataset:{}});C.onAct('cdgo',{dataset:{}});const m=S.cards;
const setup=(loser,order,first,aIn,aCame,bIn,bCame)=>{m.results=m.results||{};if(!m.results.a)m.results.a={call:m.a.call,k:1,nth:1,pct:12,position:'ท่าหมาจากข้างหลัง (doggy)'};if(!m.results.b)m.results.b={call:m.b.call,k:1,nth:1,pct:12,position:'มองหน้ากัน (missionary)'};m.swap.loser=loser;m.swap.order=order;m.swap.firstPair=first;if(m.results.a){m.results.a.inside=aIn;m.results.a.came=aCame;m.results.a.liked='ชอบ';m.results.a.position='ท่าหมาจากข้างหลัง (doggy)';}if(m.results.b){m.results.b.inside=bIn;m.results.b.came=bCame;m.results.b.liked='ชอบ';}m.home=Object.assign({},m.home||{},{on:true});m.hook=Object.assign({},m.hook,{himToB:20,rivalToA:20});};
setup('a','seq','a',true,true,false,false);
let t1=C.moodOf(m,'him','swap'),h1=C.moodOf(m,'him','home'),r1=C.moodOf(m,'rival','swap');
ck('Tim lost, the rival finished inside his woman and she came: bitter at the table ('+t1.id+' '+t1.level+') and at home ('+h1.id+')',t1.id==='rage'&&t1.level===3&&h1.id==='rage');
ck('cause names the facts (the rival, her, the position, that she came, that he lost)',h1.cause.includes(m.rival.name)&&h1.cause.includes(m.a.call)&&/แตกใน/.test(h1.cause)&&/ถึง/.test(h1.cause)&&/doggy|หมา/.test(h1.cause)&&/แพ้เกม/.test(h1.cause));
ck('the rival (who won) is not bitter',r1.id==='triumph'||r1.id==='hungry');
// a simultaneous night: at the table he does not know yet
setup('a','sim','',true,true,false,false);t1=C.moodOf(m,'him','swap');h1=C.moodOf(m,'him','home');
ck('simultaneous: at the table he cannot know what happened to her ('+t1.id+', not rage)',t1.id!=='rage'&&!/แตกในตัว/.test(t1.cause));ck('but at home he knows ('+h1.id+')',h1.id==='rage');
// symmetric: the rival loses, Tim finishes inside his woman
setup('b','seq','b',false,false,true,true);let rh=C.moodOf(m,'rival','home'),th=C.moodOf(m,'him','home');
ck('symmetry: the rival lost and Tim finished inside his woman -> rage at home ('+rh.id+'); Tim triumphant ('+th.id+')',rh.id==='rage'&&th.id==='triumph'&&rh.cause.includes(m.me.call));
// condom: not the same as inside
setup('a','seq','a',false,true,false,false);h1=C.moodOf(m,'him','home');ck('a condom night does not make him bitter about the inside ('+h1.id+')',h1.id!=='rage'&&/ถุงยาง/.test(h1.cause));
// 3. the block in the prompt
setup('a','seq','a',true,true,false,false);const text=C.prompt(m,{start:2}).text;
ck('prompt has the <mood> block and the rule',/^<mood>$/m.test(text)&&text.includes('<mood> คืออารมณ์ของผู้ชายแต่ละคนในแต่ละรอบ'));
const mb=C.moodBlock(m,2);ck('block: 4 rounds (two men x table/home), safety text, size '+mb.length+' <= 7000',(mb.match(/ · รอบที่/g)||[]).length===4&&mb.includes('ความแรงเป็นแค่ลีลาของเขา ไม่ใช่ความรุนแรง')&&mb.length<=7000);
const mc=C.moodBlock(m,5);ck('compact at level 5 (one line per round, much shorter)',mc.length<mb.length*.45&&!mc.includes('ความแรงเป็นแค่ลีลา'));
setup('b','seq','b',false,false,true,true);ck('a different night, a different block',C.moodBlock(m,2)!==mb);
ck('the block is the same for the same night',C.moodBlock(m,2)===C.moodBlock(m,2));
// 4. the check list
setup('a','seq','a',true,true,false,false);const tx=C.prompt(m,{start:2}).text,ci=tx.indexOf('ก่อนส่งงาน ตรวจรายการนี้');
ck('long scene prompt ends with a check list naming what is really in it',ci>0&&/อารมณ์ของผู้ชายแต่ละรอบ/.test(tx.slice(ci))&&/<release>/.test(tx.slice(ci)));
ck('...as the last thing',tx.slice(ci).split('\n').length<=12);
const sf=C.prompt(m,{start:2,soFar:'ฉากที่เขียนค้างไว้ '.repeat(30)}).text;const si=sf.indexOf('<so-far>'),ck2=sf.indexOf('ก่อนส่งงาน ตรวจรายการนี้');ck('a continuation keeps its so-far text last (list before it)',si>0&&ck2>0&&ck2<si);
ck('short prompts are left alone',A.promptCheck('สั้น ๆ')==='สั้น ๆ');
ck('a long prompt with fewer than 3 known blocks is left alone',A.promptCheck('x'.repeat(40000)+'\n<release>\nx\n</release>')==='x'.repeat(40000)+'\n<release>\nx\n</release>');
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
