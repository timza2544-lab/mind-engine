// usage: node mothers-inside-history.js <app dir>; no randomly generated woman who has children may say she was never finished inside (expect 0)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const A=ANIMA,o=[];let n=0,bad=0,ex=[];const kv={};
for(let i=0;i<1500;i++){const d=A.gameWoman({age:22+i%40});n++;const k=String(d.children||'');kv[k.slice(0,12)]=(kv[k.slice(0,12)]||0)+1;
 const has=(d.kids==='มีแล้ว')||(k&&!/ยังไม่มี|^$/.test(k));
 if(/ไม่เคยถูกแตกใน/.test(d.insideFeel||'')&&has){bad++;if(ex.length<3)ex.push(JSON.stringify({kids:d.kids,children:d.children,partners:d.partners,mateInside:d.mateInside,age:A.ageOf(d)}))}}
o.push('women '+n+' with kids but "never inside": '+bad);o.push(ex.join('\n'));o.push('children sample '+Object.entries(kv).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x.join(':')).join(' | '));
return o.join('\n')}));console.log(errs.join('|')||'none');await b.close()})();
