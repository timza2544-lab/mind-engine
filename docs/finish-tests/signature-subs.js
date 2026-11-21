// usage: node signature-subs.js <app dir>; run-up/coda styles come only from the allowed lists, and an archetype's signature sub-styles show up far more often than without bias
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const F=ANIMA.finishLib,D=ANIMA.pactData,o=[];
let bad=0,n=0;for(let i=0;i<600;i++){F.recent.length=0;const f=F.pick({seed:'r'+i,n:1+i%3,came:1,w:null,buildup:50+i%40});f.mix.forEach(x=>{n++;if((x.role==='lead'?F.LEAD_OK:F.CODA_OK).indexOf(x.id)<0)bad++})}
o.push('plain: subs '+n+' role violations '+bad);
for(const k of ['serpent','music','temple','dawn']){const bias=D.FIN_BIAS.ask[k];let withSub=0,sig=0,tot=0,nonsig=0;const plain={sig:0,tot:0};
 for(let i=0;i<500;i++){F.recent.length=0;const f=F.pick({seed:'s'+i,n:1+i%3,came:1,w:null,buildup:60,bias});tot++;if(f.mix.length)withSub++;f.mix.forEach(x=>{if(bias.sub.indexOf(x.id)>=0)sig++;else nonsig++});
  F.recent.length=0;const g=F.pick({seed:'s'+i,n:1+i%3,came:1,w:null,buildup:60});g.mix.forEach(x=>{plain.tot++;if(bias.sub.indexOf(x.id)>=0)plain.sig++})}
 o.push(k+' sub: ['+bias.sub+'] nights with sub '+withSub+'/'+tot+' signature share '+Math.round(100*sig/(sig+nonsig))+'% (without bias '+Math.round(100*plain.sig/Math.max(1,plain.tot))+'%)')}
o.push('give '+JSON.stringify(D.FIN_BIAS.give.demon.sub));
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
