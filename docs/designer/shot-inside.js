const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:1500}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(()=>{window.claude={use:async()=>null}});
const html=require('fs').readFileSync(process.argv[2],'utf8');
await p.route('http://t.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto('http://t.test/');await p.waitForTimeout(500);
await p.click('#tabs [data-v=sag]');await p.waitForTimeout(200);await p.locator('#xr').screenshot({path:'/tmp/xr1.png'});
await p.evaluate(()=>{});await p.click('button:has-text("แสดงเขาในภาพ")');await p.waitForTimeout(200);await p.locator('#xr').screenshot({path:'/tmp/xr2.png'});
await p.click('#tabs [data-v=ax]');await p.waitForTimeout(200);await p.locator('#ax').screenshot({path:'/tmp/ax1.png'});
console.log(await p.locator('#dist').innerText());console.log(errs);await b.close();})();
