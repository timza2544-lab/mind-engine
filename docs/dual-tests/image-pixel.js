// usage: node image-pixel.js <app dir>; the climax moments (inside, womb, mouth, hand) draw an 8-bit pixel prompt by default; other pictures and style:'photo' are unchanged (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
const w={id:'px1',data:A.gameWoman({age:31})};
const BLUNT=/เย็ด|ควย|หี\b|แตก|น้ำแตก|น้ำเงี่ยน|อวัยวะ|สอดใส่|หัวนม|ปากช่องคลอด|ปากมดลูก|แคม|คลิตอริส|โม๊ก|อมควย|cum|sperm|penis|vagina|genital|ejacul/i;
for(const m of ['inside','womb','mouth','hand']){const r=A.imgScene.compose(w,{n:2,seed:'p',venue:'ห้องนอน',pos:'ท่าช้อน',intimate:true,moment:m});
 ck(m+': returns a pixel prompt',r&&r.pixel===true&&r.moment===m);
 ck(m+': style says 8-bit, 16 colours, no anti-aliasing',/8 บิต/.test(r.th)&&/16/.test(r.th)&&/8-bit pixel art/.test(r.th)&&/no anti-aliasing/.test(r.th));
 ck(m+': no blunt word',!BLUNT.test(Object.keys(r.parts).filter(k=>k!=='ตัวละคร').map(k=>r.parts[k]).join('\n')));
 ck(m+': adults only, her sheet kept',/ผู้ใหญ่/.test(r.th)&&/\[ ใบหน้า \]/.test(r.th));
 ck(m+': negative blocks photoreal and minors',/photorealistic/.test(r.neg)&&/minor/.test(r.neg));}
ck('moments differ from each other',new Set(['inside','womb','mouth','hand'].map(m=>A.imgScene.compose(w,{n:1,seed:'p',moment:m}).parts['ฉากเด็ด'])).size===4);
const ph=A.imgScene.compose(w,{n:1,seed:'p',pos:'ท่าช้อน',intimate:true,moment:'inside',style:'photo'});ck("style:'photo' keeps the old photo prompt",!ph.pixel&&/ภาพถ่ายจริง/.test(ph.parts['สไตล์']));
const no=A.imgScene.compose(w,{n:1,seed:'p',pos:'ท่าช้อน',intimate:true});ck('no moment: unchanged, not pixel',!no.pixel&&/ภาพถ่ายจริง/.test(no.parts['สไตล์']));
const kid={id:'k',data:Object.assign({},w.data,{age:15,birthday:''})};if(A.minor(kid.data))ck('minor: no prompt',A.imgScene.compose(kid,{n:1,moment:'inside'})===null);
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
