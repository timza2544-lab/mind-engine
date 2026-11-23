const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:1300}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});await p.route(/fonts\./,r=>r.abort());
const html=require('fs').readFileSync(process.argv[2],'utf8');
await p.addInitScript(()=>{window.claude={use:async n=>n==='downloads'?{save:async o=>{window.__saved=o.filename+':'+o.data.size}}:null}});
await p.route('http://t.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto('http://t.test/');await p.waitForTimeout(900);
const o={};o.presets=await p.locator('#presets .pc').count();o.desc=await p.locator('#desc').innerText();
await p.locator('#presets').screenshot({path:'/tmp/des2_presets.png'});
// rules: toggling a conflicting vulva option removes the opposite one
o.rules=await p.evaluate(()=>{const T=window.__t,p=T.norm(null);T.addVulva(p,T.OPT.vulva.findIndex(x=>x.includes('อิ่มเต็ม')));T.addVulva(p,T.OPT.vulva.findIndex(x=>x.includes('ยื่นพ้น')));const a=p.vulva.map(i=>T.OPT.vulva[i]);T.addVulva(p,T.OPT.vulva.findIndex(x=>x.includes('บาง แบนราบ')));return {a,b:p.vulva.map(i=>T.OPT.vulva[i])}});
// consistency warnings
o.warn=await p.evaluate(()=>{const T=window.__t,p=T.norm({vulva:[T.OPT.vulva.findIndex(x=>x.includes('ยื่นพ้น'))],widthMm:10});return T.problems(p).map(x=>x.t)});
o.randOk=await p.evaluate(()=>{let bad=0,detOver=0;for(let i=0;i<300;i++){const q=window.__t.randomAnima();if(window.__t.problems(q).length)bad++;if(q.vulva.length>3||q.detail.length>3)detOver++}return {bad,detOver}});
await p.click('#rnd');o.afterRnd=await p.locator('#desc').innerText();
await p.click('#cj');o.msg=await p.locator('#msg').innerText();
await p.click('#fav');o.favs=await p.locator('#favs .pc').count();
await p.click('#gif');await p.waitForTimeout(400);o.saved=await p.evaluate(()=>window.__saved);
o.overflow=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
await p.locator('#cv').screenshot({path:'/tmp/des2_cv.png'});
await p.setViewportSize({width:390,height:800});o.overflowM=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
console.log(JSON.stringify(o,null,1),errs);await b.close();})();
