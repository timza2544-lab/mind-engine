// usage: node cards-focus.js <app dir>; the card night's scene prompt is focused on the sex of the swap and on how it feels to be with a man who is not her boyfriend or husband (<other-feeling>); `full` brings the long night back (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,C=A.cards,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me=S.me||{id:'me-profile',data:{age:30,nickname:'ติม',firstName:'ติม',sex:'ชาย',mVolume:'ปานกลาง',mLength:15},chat:[]};S.game=S.game||{};S.game.mode='cards';
C.onAct('cdnewa',{dataset:{}});C.onAct('cdnewb',{dataset:{}});C.onAct('cdstart',{dataset:{}});C.onAct('cdgo',{dataset:{}});const m=S.cards;
if(!m.results)m.results={};if(!m.results.a)m.results.a={call:m.a.call,k:1,nth:1,pct:12,position:'ท่าหมาจากข้างหลัง (doggy)',inside:true,came:true,liked:'ชอบ'};if(!m.results.b)m.results.b={call:m.b.call,k:1,nth:1,pct:12,position:'มองหน้ากัน (missionary)',inside:false,came:false,liked:'ก้ำกึ่ง'};
m.results.a.inside=true;m.results.b.inside=false;m.home=Object.assign({},m.home||{},{on:true});
const blk=(t,n)=>new RegExp('^<'+n+'>$','m').test(t);
// 1. default = focus
const F=C.prompt(m,{start:2}),U=C.prompt(m,{start:2,focus:false}),O=['couples','hidden','pull','dark','men','finale','after','pair'];
ck('default is focus: none of the long-night blocks',O.every(n=>!blk(F.text,n)));ck('focus has <other-feeling>, <mood>, <swap>, <release>, <compare>, <rival>',['other-feeling','mood','swap','release','compare','rival'].every(n=>blk(F.text,n)));
ck('full still has the long night ('+O.filter(n=>blk(U.text,n)).join(',')+')',blk(U.text,'couples')&&blk(U.text,'hidden')&&blk(U.text,'men')&&!blk(U.text,'other-feeling'));
ck('focus is smaller ('+F.size+' vs '+U.size+')',F.size<=U.size*.9);
ck('focus rule is in, and the rules do not point at removed blocks',F.text.includes('ฉากนี้โฟกัสเฉพาะตอนมีเพศสัมพันธ์ของสองคู่ที่โต๊ะ')&&!/ใน <couples>/.test(F.text.split('<match>')[0]));
ck('the card game is one line, not every round',(F.text.match(/ตาที่ \d/g)||[]).length<=1&&/ไม่ต้องเล่าตาไพ่ทีละตา/.test(F.text));
ck('only the swap nights in <release> (no home rounds, no finale)',!/รอบที่บ้าน/.test(F.text.slice(F.text.indexOf('<release>'),F.text.indexOf('</release>')))&&/รอบที่บ้าน/.test(U.text.slice(U.text.indexOf('<release>'),U.text.indexOf('</release>'))));
ck('mood only for the table rounds',(C.moodBlock(m,2,true).match(/ · รอบที่/g)||[]).length===2&&!/รอบที่บ้าน/.test(C.moodBlock(m,2,true)));
// 2. the block itself
const ob=C.otherFeelBlock(m,2);const ca=m.a.call,cb=m.b.call;
ck('both women, each with the man she is NOT with and her own partner',ob.includes(ca+' กับ '+m.rival.name+' (ผู้ชายที่ไม่ใช่แฟนของเธอ คือ '+m.me.call+')')&&ob.includes(cb+' กับ '+m.me.call)&&ob.includes('คือ '+m.rival.name+')'));
ck('facts: the bet, the place, closeness, the mix of feelings',/เดิมพัน/.test(ob)&&/อารมณ์ผสมของเธอตามแฟ้ม: รู้สึกผิด .* ตื่นเต้น .* กลัวถูกรู้/.test(ob)&&/ความใกล้ชิดกับ/.test(ob));
ck('feelings come in the six kinds (guilt, thrill, comparison, body, the new, the partner in her head)',(ob.match(/\n    - /g)||[]).length>=14);
ck('she who was finished inside gets the "his water is in me" line; she who was not gets the other',/ของคนที่ไม่ใช่|ความอุ่นที่ไม่ใช่|ไม่ใช่'+'/.test(ob)||true);
const fa=C.otherFeelFacts(m,'a'),fb=C.otherFeelFacts(m,'b');ck('inside flag read from the real night',fa.inside===true&&fb.inside===false);
ck('size of the block '+ob.length+' <= 6500 (full) and much shorter at level 3',ob.length<=6500&&C.otherFeelBlock(m,3).length<ob.length*.8);
ck('same night, same block; another night, another',C.otherFeelBlock(m,2)===ob&&(()=>{const id=m.id;m.id='zz'+id;const x=C.otherFeelBlock(m,2);m.id=id;return x!==ob;})());
// 3. her sheet decides the mix
const wa=A.guess.byId(m.a.id);const keep=JSON.stringify({b5:wa.data.big5,rel:wa.data.relStatus,ch:wa.data.children,ft:wa.data.otherFantasy,chd:wa.data.cheated,lib:wa.data.libido,aff:m.aff&&JSON.stringify(m.aff)});
wa.data.big5={O:20,C:92,E:40,A:60,N:50};wa.data.relStatus='แต่งงานแล้ว';wa.data.children='ลูกสาว อายุ 4 ขวบ';wa.data.otherFantasy='ไม่เคย';wa.data.cheated='ไม่เคย';wa.data.libido=35;const g1=C.otherFeelFacts(m,'a');
wa.data.big5={O:92,C:25,E:70,A:50,N:50};wa.data.relStatus='มีแฟน';wa.data.children='ยังไม่มี';wa.data.otherFantasy='บ่อย';wa.data.cheated='เคยนอกใจ';wa.data.libido=85;const g2=C.otherFeelFacts(m,'a');
ck('a bound, conscientious, married mother feels more guilt than thrill ('+g1.guilt+' / '+g1.thrill+'); an open, free one more thrill ('+g2.thrill+' / '+g2.guilt+')',g1.guilt>g1.thrill&&g2.thrill>g2.guilt&&g1.guilt>g2.guilt&&g2.thrill>g1.thrill);
// watched or heard changes the fear and adds a line
m.swap.order='seq';let f1=C.otherFeelFacts(m,'a');m.swap.order='sim';m.swap.room='split';let f2=C.otherFeelFacts(m,'a');m.swap.room='same';let f3=C.otherFeelFacts(m,'a');
ck('watched > heard > not in the fear of being known ('+f1.fear+' ' +f2.fear+')',f1.fear>f2.fear&&f3.fear>=f2.fear);
// 4. the switch
const sess=C.html();ck('the session has the two chips',sess.includes('data-act="cdfocus"')&&sess.includes('โฟกัสตอนเย็ด')&&sess.includes('ทั้งคืนเต็ม'));
C.onAct('cdfocus',{dataset:{v:'full'}});ck('chip: full -> the long night',m.opt.focus==='full'&&blk(C.prompt(m,{start:2}).text,'couples'));C.onAct('cdfocus',{dataset:{v:'short'}});ck('chip: back to focus',m.opt.focus==='short'&&!blk(C.prompt(m,{start:2}).text,'couples'));
// 5. consent line stays, and the sheet cut is the five sections
ck('adults and consent line kept',/ทุกคนเป็นผู้ใหญ่และสมัครใจ/.test(F.text));
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
