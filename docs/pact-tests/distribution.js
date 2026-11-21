const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
const r=await p.evaluate(()=>{const A=ANIMA,S=A.state;S.me=S.me||{id:'me-profile',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]};localStorage.removeItem('anima.pact.v1');S.pactCodex=null;const out=[];let tot={ref:0,part:0,full:0,five:0,preg:0};
for(let k=0;k<6;k++){const r=A.pact.selfTest();const m=r.report.match(/ปฏิเสธ (\d+) · จ่ายบางส่วน (\d+) · จ่ายครบ (\d+) · ถึงขั้น 5 (\d+) · ตั้งครรภ์ (\d+)/);if(!m){out.push('ST FAIL '+r.report);continue}tot.ref+=+m[1];tot.part+=+m[2];tot.full+=+m[3];tot.five+=+m[4];tot.preg+=+m[5]}
out.push('240 nights '+JSON.stringify(tot));out.push('localStorage polluted: '+!!localStorage.getItem('anima.pact.v1'));
// text sample
A.pact.onAct('ptnew',{dataset:{}});A.pact.onAct('ptrung',{dataset:{v:'3'}});A.pact.onAct('ptpropose',{dataset:{}});const m=S.pact;out.push(m.log.map(x=>x.line).join(' || '));if(m.offer.paid>=1){if(m.offer.paid>=5)A.pact.onAct('ptconfirm5',{dataset:{}});A.pact.onAct('ptperform',{dataset:{}});out.push(S.pact.night.steps[S.pact.night.steps.length-1]);out.push(S.pact.ripple.map(x=>x.t+'·'+x.domain+': '+x.text).slice(0,4).join('\n'))}
return out.join('\n')});
console.log(r);console.log('ERRS',errs.join('|')||'none');await b.close()})();
