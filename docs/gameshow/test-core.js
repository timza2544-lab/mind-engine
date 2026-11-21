const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
const html=require('fs').readFileSync(process.argv[2],'utf8');
await p.addInitScript(()=>{let n=0;window.claude={use:async name=>{if(name==='sample'){const f=async()=>({});f.json=async(pr)=>{n++;(window.__p=window.__p||[]).push(pr);if(/เขียนจุดสูงสุด/.test(pr))return{text:'จุดสูงสุด'};if(/ช่วงหลังจบ/.test(pr))return{text:'หลังจบ'};return{text:'จังหวะที่ '+n,choices:[{t:'กล้า',heat:15,control:-3},{t:'ระวัง',heat:2,control:8},{t:'ขี้เล่น',heat:6,control:2}],art:{fx:['blush']}}};return f}if(name==='downloads'){return{save:async o=>{window.__saved=o.filename+':'+o.data.size}}}return null}}});
await p.route('http://t.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto('http://t.test/');await p.waitForTimeout(400);
const out={};await p.click('text=เริ่มรายการ');await p.waitForTimeout(500);
out.phase=await p.locator('.act').innerText();
const names=['คร่อมหันหน้า','คร่อมหันหลัง','นั่งยอง','โน้มตัวกระซิบ','ยึดหัวเตียง','นั่งตักพิงหัวเตียง','หมุนตัวครึ่งรอบ'];
for(const n of names){await p.locator('button',{hasText:n}).first().click();await p.waitForTimeout(150);await p.locator('#cv').screenshot({path:'/tmp/core_'+names.indexOf(n)+'.png'});}
await p.locator('button',{hasText:'เร็ว'}).click();
let guard=0;while(!(await p.locator('text=ต่อ: ช่วงหลังจบ').count())&&guard++<20){await p.locator('.choices button').first().click();await p.waitForTimeout(250);}
out.beats=guard;out.climax=await p.locator('.story').innerText();
await p.click('text=ต่อ: ช่วงหลังจบ');await p.waitForTimeout(300);out.after=await p.locator('.story').innerText()+' | '+await p.locator('.act').innerText();
out.saved=null;await p.click('text=บันทึก GIF');await p.waitForTimeout(200);out.saved=await p.evaluate(()=>window.__saved);
out.overflow=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
out.prompt=(await p.evaluate(()=>window.__p[3])).slice(0,1500);
// stop path
await p.click('text=เริ่มเรื่องใหม่');await p.click('text=เริ่มรายการ');await p.waitForTimeout(400);await p.click('button.stop');await p.waitForTimeout(300);out.stop=await p.locator('.story').innerText();
console.log(JSON.stringify(out,null,1));console.log('ERRS',errs);await b.close();})();
