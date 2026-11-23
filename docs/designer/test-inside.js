const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1000,height:1500}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.addInitScript(()=>{window.claude={use:async()=>null}});
const html=require('fs').readFileSync(process.argv[2],'utf8');
await p.route('http://t.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));await p.goto('http://t.test/');await p.waitForTimeout(400);
const exp={characters:[{data:{firstName:'มิ้นท์',age:29,sex:'หญิง',skinTone:'ผิวแทน',vagLength:'ลึกกว่าค่าเฉลี่ย (10 ซม. ขึ้นไป)',vagDepthCm:11,vagWidth:'กระชับ',uterus:'มดลูกคว่ำหลัง (ราว 1 ใน 6)',pelvicFloor:'แข็งแรง ควบคุมได้ดี ขมิบได้ชัด',innerWall:'สันหยาบชัดทั้งทาง ครูดผ่านปลายทุกจังหวะ'}}],me:{data:{mLength:16,mGirth:13,mFlaccid:10,mGlansLen:4,mCurve:'โค้งขึ้นชัด'}}};
await p.fill('#impt',JSON.stringify(exp));await p.click('#impgo');
const o=await p.evaluate(()=>{const q=window.__t.P();return {d:q.vagDepthCm,vl:q.vagLength,vw:q.vagWidth,ut:q.uterus,pf:q.pelvicFloor,iw:q.innerWall,him:q.him,L:q.mLength,g:q.mGirth,cu:q.mCurve,prob:window.__t.problems(q).length}});
console.log(JSON.stringify(o));
for(const v of ['sag','ax']){await p.click('#tabs [data-v='+v+']');await p.waitForTimeout(150);await p.locator(v==='sag'?'#xr':'#ax').screenshot({path:'/tmp/imp_'+v+'.png'});}
// every uterus option / pelvic floor / curve renders without error
const r=await p.evaluate(()=>{const T=window.__t,cv=document.createElement('canvas');cv.width=640;cv.height=580;let n=0;for(let u=0;u<5;u++)for(let f=0;f<6;f++)for(let c=0;c<7;c++)for(const h of [false,true]){const q=T.norm({uterus:u,pelvicFloor:f,mCurve:c,him:h,innerWall:(u+f)%5,vagWidth:(c)%5,mLength:20,vagDepthCm:6});T.drawSag(cv,q);T.drawAx(cv,q);n++}return n});
console.log('renders',r,errs);await b.close();})();
