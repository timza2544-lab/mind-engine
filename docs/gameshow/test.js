const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});await p.route(/fonts\./,r=>r.abort());
const html=require('fs').readFileSync(process.argv[2],'utf8');
await p.addInitScript(()=>{let n=0;window.claude={use:async name=>{if(name==='sample'){const f=async()=>({});f.json=async(pr)=>{n++;window.__prompts=(window.__prompts||[]);window.__prompts.push(pr);if(/ฉากจบรายการ/.test(pr))return {text:'จบแล้ว'};return {text:'ฉากทดสอบที่ '+n,choices:[{t:'กล้า',nerve:20,trust:-3,time:-4,score:5},{t:'ระวัง',nerve:0,trust:12,time:-7,score:4},{t:'ขี้เล่น',nerve:5,trust:5,time:-5,score:3}],art:{fx:['blush','heart'],pose:'hold'}}};return f}if(name==='downloads'){return {save:async o=>{window.__saved=o.filename+':'+o.data.size}}}return null}}});
await p.route('http://t.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto('http://t.test/');await p.waitForTimeout(500);
const out={};
out.setup=await p.locator('h1').innerText();
await p.fill('#fAge','17');await p.click('text=เริ่มรายการ');out.young=await p.locator('#smsg').innerText();
await p.fill('#fAge','27');await p.click('text=เริ่มรายการ');await p.waitForTimeout(600);
out.scene=await p.locator('.story').innerText();
await p.screenshot({path:'/tmp/gs1.png'});
for(let i=0;i<7;i++){await p.locator('.choices button').first().click();await p.waitForTimeout(300);}
out.act=await p.locator('.act').innerText();
await p.locator('.choices button').nth(1).click();await p.waitForTimeout(400);
out.end=await p.locator('.act').innerText()+' | '+await p.locator('.story').innerText();
out.np=await p.evaluate(()=>(window.__prompts||[]).length);out.prompt=((await p.evaluate(()=>(window.__prompts||[])[3]))||"").slice(0,900);
await p.click('text=บันทึก GIF ของฉากนี้');await p.waitForTimeout(300);out.saved=await p.evaluate(()=>window.__saved);
out.overflow=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
console.log(JSON.stringify(out,null,1));console.log('ERRS',errs);await b.close();})();
