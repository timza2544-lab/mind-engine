// usage: node memory-callback.js <app dir>; 30 nights for one woman: picks stay stable on rebuild, survive a JSON round trip, and some nights call back a favourite
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,F=A.finishLib,o=[];
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};A.state.me=me;
const w={id:'mem1',data:A.gameWoman({age:30}),game:{n:1,at:Date.now(),attempts:[]}};A.state.chars=[w];
let cbs=0,bored=0,stable=0,total=0;const seq=[];
for(let k=1;k<=30;k++){const g=A.gameRoll(w,me,{k,status:'single',nth:1,base:{vol:3},days:2+k%5,rounds:1,timed:false});w.game.attempts.push(g);
 const t1=A.releaseText(g.release,'พลอย','ต้น',null,{}),t2=A.releaseText(g.release,'พลอย','ต้น',null,{});total++;if(t1===t2)stable++;
 if(/ความทรงจำของเธอ: ท่านี้/.test(t1))cbs++;if(/ความทรงจำของเธอ: สองคืน/.test(t1))bored++;if(!g.release.fin){try{F.pick({seed:'q',n:1,w,buildup:50,r:g.release})}catch(e){o.push('ERR '+e.message+' '+e.stack.slice(0,250))}o.push('nofin hasline '+/รูปแบบการแตกใน/.test(t1)+' keys '+Object.keys(g.release).join(',')+' k'+k+' preg '+!!g.preg+' conceived '+g.conceived);continue}seq.push(g.release.fin.id+(g.release.her.came?'*':''))}
o.push('stable '+stable+'/'+total+' callbacks '+cbs+' bored '+bored);o.push(seq.join(' '));
// roundtrip json keeps the pick
const w2=JSON.parse(JSON.stringify(w));const g0=w2.game.attempts[5];o.push('json fin kept '+JSON.stringify(g0.release.fin)+' text same '+(A.releaseText(g0.release,'พลอย','ต้น',null,{})===A.releaseText(w.game.attempts[5].release,'พลอย','ต้น',null,{})));
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
