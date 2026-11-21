const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state;const me=S.me||(S.me={id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]});
const out=[A.dual.selfTest().report];let lines=0,mine=0,theirs=0,dist={},wins=0,n=20,ex='';
for(let k=0;k<n;k++){S.dual=null;A.dual.makeMom(me);A.dual.rollRivals(me);S.dualPick.rounds=3;A.dual.start(me,A.dual.libraryMom());let m=S.dual,g=0;
if(k===0){out.push('sigs me '+m.sigs.me.join(',')+' rival '+m.sigs.rival.join(','));out.push('chips '+/✦/.test(A.dual.html()))}
while(!m.over&&g++<200){if(m.phase==='play'){const h=m.hands.momA.filter(c=>c.cost<=m.energy.momA).sort((a,b)=>b.p-a.p)[0]||m.hands.momA[0];const free=m.sigs.me.filter(x=>!m.sigUsed.me.includes(x));A.dual.play(me,h.id,free[0]||'flow')}else A.dual.accept(me)}
const d=m.log.filter(x=>/^ท่าประจำตัว/.test(x.line));lines+=d.length;d.forEach(x=>{if(/ของตัวฉัน/.test(x.line))mine++;else theirs++});if(!ex&&d[0])ex=d[0].line;
if(m.score.me>m.score.rival)wins++; m.sigs.me.concat(m.sigs.rival).forEach(x=>dist[x]=(dist[x]||0)+1)}
out.push('sig lines '+lines+' (mine '+mine+', rival '+theirs+') my win rate '+wins+'/'+n);out.push(ex);out.push(JSON.stringify(dist));
return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}});
console.log(r);console.log('ERRS',errs.join('|'));await b.close()})();
