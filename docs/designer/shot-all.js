const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:1600}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(()=>{window.claude={use:async()=>null}});
const html=require('fs').readFileSync(process.argv[2],'utf8');const tag=process.argv[3]||'a';
await p.route('http://t.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto('http://t.test/');await p.waitForTimeout(400);
await p.evaluate(()=>{const T=window.__t;});
await p.locator('#cv').screenshot({path:`/tmp/${tag}_out.png`});
for(const v of ['sag','ax','in']){await p.click('#tabs [data-v='+v+']');await p.waitForTimeout(250);await p.locator(v==='sag'?'#xr':v==='ax'?'#ax':'#inn').screenshot({path:`/tmp/${tag}_${v}.png`});}
console.log(errs);await b.close();})();
