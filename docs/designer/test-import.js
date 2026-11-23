const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:1500}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(()=>{window.claude={use:async()=>null}});
const html=require('fs').readFileSync(process.argv[2],'utf8');
await p.route('http://t.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto('http://t.test/');await p.waitForTimeout(500);
const exp={app:'Anima Character Studio',version:2,characters:[
{id:'a',kind:'person',data:{firstName:'มิ้นท์',nickname:'มิ้นท์',age:29,sex:'หญิง',skinTone:'ผิวแทน',hairColor:'ดำอมน้ำตาล',hairColorBody:'เส้นแข็งและหยิก',pubicHair:'เล็มสั้นเป็นประจำ',pubicPattern:'สามเหลี่ยมคว่ำตามปกติ',vulva:['แคมในยื่นพ้นแคมนอกเห็นได้ (พบบ่อยมาก)'],vulvaColor:'น้ำตาลเข้มกว่าผิวรอบ ๆ (พบมากที่สุด)',labiaMinoraMm:70,labiaWidthMm:30,clitMm:6,vulvaDetail:['แคมในขอบหยักเป็นลอน']}},
{id:'b',kind:'person',data:{firstName:'เด็ก',age:15,sex:'หญิง'}},
{id:'c',kind:'person',data:{firstName:'ชาย',age:30,sex:'ชาย'}},
{id:'d',kind:'person',data:{firstName:'ฟ้า',age:34,sex:'หญิง',skinTone:'ขาวอมชมพู'}}]};
const o={};
o.read=await p.evaluate(t=>{const r=window.__t.readExport(t);return {ok:r.ok.map(c=>c.name),skip:r.skip}},JSON.stringify(exp));
await p.fill('#impt',JSON.stringify(exp));await p.click('#impgo');
o.info=await p.locator('#impinfo').innerText();o.sel=await p.locator('#impsel option').allInnerTexts();
o.P1=await p.evaluate(()=>{const q=window.__t.P();return {skin:q.skin,hairHex:q.hairHex,hairBody:q.hairBody,ph:q.pubicHair,pp:q.pubicPattern,vulva:q.vulva,col:q.vulvaColor,mm:[q.minoraMm,q.widthMm,q.clitMm],det:q.detail}});
await p.locator('#cv').screenshot({path:'/tmp/imp1.png'});
await p.selectOption('#impsel','1');o.info2=await p.locator('#impinfo').innerText();
o.P2=await p.evaluate(()=>{const q=window.__t.P();return {skin:q.skin,mm:[q.minoraMm,q.widthMm,q.clitMm],vulva:q.vulva}});
await p.locator('#cv').screenshot({path:'/tmp/imp2.png'});
o.bad=await p.evaluate(()=>window.__t.readExport('xx').err);
o.desc=(await p.locator('#desc').innerText()).slice(0,200);
console.log(JSON.stringify(o,null,1),errs);await b.close();})();
