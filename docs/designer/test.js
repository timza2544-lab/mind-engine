const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:1200}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
const html=require('fs').readFileSync(process.argv[2],'utf8');
await p.addInitScript(()=>{window.claude={use:async n=>n==='downloads'?{save:async o=>{window.__saved=o.filename+':'+o.data.size}}:null}});
await p.route('http://t.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto('http://t.test/');await p.waitForTimeout(800);
const o={};o.presets=await p.locator('#presets .pc').count();o.desc=await p.locator('#desc').innerText();
// contact sheet of presets via page canvases
await p.locator('#presets').screenshot({path:'/tmp/des_presets.png'});
await p.click('#rnd');o.afterRnd=await p.locator('#desc').innerText();
await p.locator('#s-arousal').fill('90');o.ar=await p.locator('#o-arousal').innerText();
await p.click('#fav');o.favs=await p.locator('#favs .pc').count();
await p.click('#gif');await p.waitForTimeout(300);o.saved=await p.evaluate(()=>window.__saved);
o.overflow=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
await p.locator('#cv').screenshot({path:'/tmp/des_cv.png'});
await p.setViewportSize({width:390,height:800});o.overflowM=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
console.log(JSON.stringify(o,null,1),errs);await b.close();})();
