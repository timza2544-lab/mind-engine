// usage: node mothers-realism.js <app dir>; dual mothers: zero coherence issues, never 'never finished inside', no child born before she was 16 (expect 0 / 0 / 0)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const A=ANIMA,D=A.dual,o=[];A.state.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'}};
try{let bad=0,never=0,gap=0,c={};for(let i=0;i<300;i++){const m=D.makeMom(A.state.me,{seed:'m'+i});const d=(m&&m.data)||m;if(!d){o.push('no data '+JSON.stringify(Object.keys(m||{})));break}
 const is=A.coherenceIssues(d);if(is.length){bad++;is.forEach(x=>c[x.id]=(c[x.id]||0)+1)}
 if(/^ไม่เคยถูกแตกใน/.test(d.insideFeel||''))never++;
 const ch=[...String(d.children||'').matchAll(/อายุ (\d+) (ปี|ขวบ)/g)].map(x=>+x[1]);if(ch.length&&A.ageOf(d)-Math.max(...ch)<16)gap++}
 o.push('makeMom: issues '+bad+'/300 '+JSON.stringify(c)+' never-inside '+never+' agegap<16 '+gap)}catch(e){o.push('makeMom err '+e.message.slice(0,100))}
return o.join('\n')}));console.log(errs.join('|')||'none');await b.close()})();
