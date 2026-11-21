const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state;const me=S.me||(S.me={id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]});
const out=[A.dual.selfTest().report];
for(const mode of ['off','real','fantasy']){let ent=0,pg=0,n=30,ex='';for(let k=0;k<n;k++){S.dual=null;A.dual.makeMom(me);A.dual.rollRivals(me);S.dualPick.preg=mode;S.dualPick.rounds=3;A.dual.start(me,A.dual.libraryMom());let m=S.dual,g=0;while(!m.over&&g++<150){if(m.phase==='play'){const h=m.hands.momA.filter(c=>c.cost<=m.energy.momA).sort((a,b)=>b.p-a.p)[0]||m.hands.momA[0];A.dual.play(me,h.id)}else A.dual.accept(me)}
ent+=m.fertLog.length;pg+=m.preg.length;if(!ex&&m.preg.length)ex=m.log[m.log.length-1].line.slice(-170);
if(k===0&&mode!=='off'){const pr=A.dual.prompt(me,'Me');out.push(mode+' prompt has <pregnancy> '+/<pregnancy>/.test(pr)+' html preg '+/ผลการตั้งครรภ์/.test(A.dual.html()))}
const uniq=new Set(m.preg.map(x=>x.wid));if(uniq.size!==m.preg.length)out.push('DUP PREG');}
out.push(mode+': finishes '+ent+' pregnancies '+pg+' '+ex)}
const ids=new Set();return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}});
console.log(r);console.log('ERRS',errs.join('|'));await b.close()})();
