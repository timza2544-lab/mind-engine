const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:1600}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(()=>{window.claude={use:async()=>null}});
const html=require('fs').readFileSync(process.argv[2],'utf8');
await p.route('http://t.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto('http://t.test/');await p.waitForTimeout(400);
const mk=(n,o)=>({data:Object.assign({firstName:n,age:28,sex:'หญิง',skinTone:'สองสี'},o)});
const exp={characters:[
mk('ออมสิน',{innerRidge:'เฉียงคล้ายเกลียว',innerWall:'สันหยาบชัดทั้งทาง ครูดผ่านปลายทุกจังหวะ',innerSqueeze:'บีบค้างแน่นตอนเข้า แล้วค่อยคลาย',pelvicFloor:'แข็งแรง ควบคุมได้ดี ขมิบได้ชัด',wetPattern:'เปียกมากจนไหลลงต้นขา',innerHeat:'ร้อนกว่าผิวชัด'}),
mk('พิม',{innerRidge:'เรียงขวาง',innerWall:'ขรุขระละเอียดเหมือนกำมะหยี่',innerSqueeze:'กระตุกถี่ ๆ ตอนใกล้ถึง แล้วรัดเป็นชุดตอนถึง',pelvicFloor:'ปกติ',wetPattern:'เปียกช้า ต้องใช้เวลา',innerHeat:'ร้อนขึ้นเมื่อใกล้ถึง'}),
mk('นุ่น',{innerRidge:'ไม่ชัด',innerWall:'เรียบลื่นเกือบตลอดทาง',innerSqueeze:'รัดเป็นวงที่ปากทางมากกว่าข้างใน',pelvicFloor:'เกร็งเกินไป เจ็บเวลาสอดใส่หรือตรวจภายใน',wetPattern:'เปียกเป็นช่วง ๆ แห้งแล้วกลับมา'}),
mk('แพร',{innerSqueeze:'แทบไม่ขมิบเอง นิ่งและนุ่ม',innerWall:'เป็นคลื่นนูนเป็นช่วง ๆ',pelvicFloor:'อ่อนแรง เล็ดเวลาไอจามหรือกระโดด (ราว 16%)'})],me:{data:{mLength:14,mGirth:12}}};
await p.fill('#impt',JSON.stringify(exp));await p.click('#impgo');await p.waitForTimeout(800);
const o=await p.evaluate(()=>{const T=window.__t;let amps=[];for(let m=0;m<5;m++){const q=T.norm({innerSqueeze:m,pelvicFloor:0});let mx=0,mn=1;for(let t=0;t<14;t+=0.05){const a=T.squeezeAmp(q,0.1,t);mx=Math.max(mx,a);mn=Math.min(mn,a)}amps.push([m,+mn.toFixed(2),+mx.toFixed(2)])}return {amps,tiles:document.querySelectorAll('#cmp canvas').length}});
console.log(JSON.stringify(o));
await p.click('#tabs [data-v=in]');await p.waitForTimeout(300);await p.locator('#inn').screenshot({path:'/tmp/in1.png'});
await p.locator('#cmp').screenshot({path:'/tmp/in_cmp.png'});
await p.click('button:has-text("แสดงเขาในภาพ")');await p.waitForTimeout(300);await p.locator('#inn').screenshot({path:'/tmp/in2.png'});
const r=await p.evaluate(()=>{const T=window.__t,cv=document.createElement('canvas');cv.width=640;cv.height=400;let n=0;for(let a=0;a<3;a++)for(let b=0;b<5;b++)for(let w=0;w<5;w++)for(let f=0;f<6;f++)for(const h of [false,true]){T.drawIn(cv,T.norm({innerRidge:a,innerSqueeze:b,innerWall:w,pelvicFloor:f,him:h,wetPattern:(a+b)%4,innerHeat:(w)%3}),3.3*(n%7),n%2===0);n++}return n});
console.log('renders',r,errs);
await p.setViewportSize({width:390,height:800});console.log('overflowM',await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth));
await b.close();})();
