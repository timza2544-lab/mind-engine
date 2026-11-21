const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state;const me=S.me||(S.me={id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]});
const out=[A.dual.selfTest().report];
const mom=A.dual.makeMom(me);A.dual.rollRivals(me);A.dual.start(me,mom);
let m=S.dual,guard=0;while(!m.over&&guard++<200){if(m.phase==='play'){const h=m.hands.momA.filter(c=>c.cost<=m.energy.momA).sort((a,b)=>b.p-a.p)[0]||m.hands.momA[0];A.dual.play(me,h.id)}else if(m.phase==='punish'){A.dual.accept(me)}}
const kinds={};m.log.forEach(x=>kinds[x.k]=(kinds[x.k]||0)+1);out.push('over '+m.over+' rounds '+m.round+' kinds '+JSON.stringify(kinds));
out.push('detail: '+(m.log.find(x=>x.k==='detail')||{}).line);out.push('event: '+(m.log.find(x=>x.k==='event')||{}).line);out.push('open: '+String((m.log.find(x=>x.k==='story')||{}).line).slice(0,160));
out.push('epi: '+String(m.log[m.log.length-1].line).slice(-220));
S.dualPick.tone=2;const pr=A.dual.prompt(me,'Me');out.push('prompt len '+pr.length+' voices '+/<voices>/.test(pr)+' tone '+/เข้มข้นสุด/.test(pr));
const vo=pr.match(/<voices>[\s\S]*?<\/voices>/)[0];out.push(vo.slice(0,700));
out.push('html '+A.dual.html().length+' chips '+/dltone/.test(A.dual.html()));
return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}});
console.log(r);console.log('ERRS',errs.join('|'));await b.close()})();
