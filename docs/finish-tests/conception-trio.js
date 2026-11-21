// usage: node conception-trio.js <app dir>; trio night: no scene when neither woman conceived, one scene per woman who did, the rule only when someone did
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,o=[];
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};
const mk=id=>({id,data:A.gameWoman({age:30}),game:{n:1,at:Date.now(),attempts:[]}});const a=mk('ta'),b=mk('tb');S.chars=[a,b];
const R=A.trioRoll(a,b,S.me,{timed:false,k:1,mode:'rand2',finish:'rounds',unlimited:true,nth:1,base:{vol:3},days:2});
for(const [ca,cb] of [[false,false],[true,false],[true,true]]){R.ga.conceived=ca;R.gb.conceived=cb;let pr;try{pr=A.trioPrompt(a,b,S.me,R.ga,R.gb,{})}catch(e){o.push('trio ERR '+e.message.slice(0,100));continue}const t=pr.text||String(pr);o.push('trio a='+ca+' b='+cb+': scenes '+(t.match(/<conception-scene>/g)||[]).length+' rule '+t.includes('ข้อยกเว้นของข้อห้ามเฉลยผลตั้งครรภ์'))}
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
