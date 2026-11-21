// usage: node wish-category.js <app dir>; the category is read from the wish text only (no manual picker): revenge/health/work/money/love/child/mate/... sentences land in the right category
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const X=ANIMA.pact;const T=[
['ผมอยากแก้แค้นคนที่หักหลังผม','justice'],['ขอให้คนที่โกงฉันได้รับกรรม','justice'],['ผมอยากให้มันเจ็บเหมือนที่ผมเจ็บ','justice'],['ขอให้แม่หายป่วย','health'],['ให้ได้เลื่อนตำแหน่ง','work'],['ขอเงินก้อนหนึ่งใช้หนี้','money'],['ให้คนที่ชอบกลับมาคุยกับผม','love'],['ขอลูกสักคน','child'],['ให้เธอมาเป็นแฟนผม','mate'],['ให้ผมหล่อขึ้น','beauty'],['อยากลืมผู้หญิงคนนั้นไปให้ได้','letgo'],['ผมอยากให้ผมได้เจอกับพ่อที่หายไป','find'],['ขอให้ฝนตกที่สวน','harvest'],['ผมอยากให้ครอบครัวสงบ','peace'],['ขอให้ปลอดภัย','protect'],['อยากสอบผ่าน','talent'],['ให้ผมเก่งขึ้น','talent'],['ขอให้บริษัทผมขายดี','work']];
return T.map(([t,e])=>{const g=X.catOf(t);return (g===e?'ok ':'MISS ')+t+' -> '+g+(g===e?'':' (want '+e+')')}).join('\n')}));console.log(errs.join('|')||'none');await b.close()})();
