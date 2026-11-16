// usage: node giver-bias.js <app dir>; 400 picks per archetype bias: families shift toward the giver's character but all 48 styles stay reachable
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const F=ANIMA.finishLib,D=ANIMA.pactData,o=[];
const run=(bias)=>{const c={},ids={};for(let i=0;i<400;i++){F.recent.length=0;const f=F.pick({seed:'k'+i,n:3,came:1,w:null,buildup:60,bias});ids[f.id]=(ids[f.id]||0)+1;(F.TAGS[f.id]||'').split(' ').forEach(t=>c[t]=(c[t]||0)+1)}return {c:Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x.join(':')).join(' '),distinct:Object.keys(ids).length,top:Object.entries(ids).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x.join(':')).join(' ')}};
o.push('none '+JSON.stringify(run(null)));for(const k of ['serpent','music','volcano','temple','hearth'])o.push(k+' '+JSON.stringify(run(D.FIN_BIAS.ask[k])));return o.join('\n')}));await b.close()})();
