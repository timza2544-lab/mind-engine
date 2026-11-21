// usage: node speech-and-extra.js <app dir>; every finish carries short spoken lines and ~65% an aftermath detail; the new insideFeel option exists
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,F=A.finishLib,o=[];
const f=F.pick({seed:'sp1',n:1,came:1,w:null,buildup:60});o.push(F.block(f).split('\n').slice(-4).join('\n').slice(0,900));
let say=0,ex=0;const hs=new Set();for(let i=0;i<300;i++){F.recent.length=0;const g=F.pick({seed:'q'+i,n:1,came:1,w:null,buildup:60});if(g.say&&g.say.length===3)say++;if(g.extra){ex++;hs.add(g.extra)}}o.push('say '+say+'/300 extra '+ex+'/300 distinct extra '+hs.size);
const opts=A.fields.insideFeel.o;o.push('insideFeel options '+opts.length+' last: '+opts[opts.length-1]);
return o.join('\n')}catch(e){return 'THROW '+e.message}}));console.log(errs.join('|')||'none');await b.close()})();
