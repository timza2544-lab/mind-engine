// usage: node cards-image-prompts.js <app dir>; the card night (วงไพ่สองคู่) gives text-only image prompts for both women: body sheets in the setup and the plan, one scene prompt per night after the deal (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,C=A.cards,G=A.guess,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me=S.me||{id:'me-profile',data:{age:30,nickname:'ติม',firstName:'ติม',sex:'ชาย',mVolume:'ปานกลาง',mLength:15},chat:[]};S.game=S.game||{};S.game.mode='cards';
const wa=A.ui.createChar(A.gameWoman({age:29})),wb=A.ui.createChar(A.gameWoman({age:33}));G.givePartner(wb);
C.onAct('cdpicka',{dataset:{v:wa.id}});C.onAct('cdpickb',{dataset:{v:wb.id}});
let h=C.html();const na=A.callName(wa.data),nb=A.callName(wb.data);
ck('setup: prompt block for both women',h.includes('พรอมต์สร้างภาพผู้หญิงสองคน')&&h.split('data-act="copytext"').length-1>=6);
ck('setup: both names in the prompt block',h.includes('พรอมต์สร้างภาพ คู่ของเขา: '+na)&&h.includes('พรอมต์สร้างภาพ อีกคู่: '+nb));
C.onAct('cdstart',{dataset:{}});h=C.html();ck('plan: two body prompts',(h.match(/🖼 พรอมต์สร้างภาพ/g)||[]).length===2);
C.onAct('cdgo',{dataset:{}});const m=S.cards;h=C.html();
const L=C.imgScenes(m);const atts=[wa,wb].reduce((n,w)=>n+((w.game.attempts||[]).filter(x=>x&&x.cards&&x.cards.id===m.id).length),0);
ck('one scene prompt per attempt ('+L.length+' of '+atts+')',L.length===atts&&L.length>=2);
ck('scene html shown after the deal',h.includes('พรอมต์ภาพของผู้หญิง '+L.length+' ภาพ'));
ck('each scene: her sheet + place + position',L.every(it=>it.im.th.includes('[ ตัวละคร ]')&&it.im.th.includes('[ สถานที่ ]')&&it.im.th.includes('[ ท่าทาง ]')));
for(const w of [wa,wb]){const mine=L.filter(it=>it.key.startsWith(w.id+':'));const outs=mine.map(it=>it.im.outfit);ck(A.callName(w.data)+': outfits differ between her pictures',new Set(outs).size===outs.length);}
ck('each scene is labelled with the man of that night (the picture itself only shows a shoulder or a hand of him)',L.every(it=>/กับ\S+/.test(it.label)));
ck('stable: same prompts on a second render',JSON.stringify(C.imgScenes(m).map(x=>x.im.th))===JSON.stringify(L.map(x=>x.im.th)));
// adults only: a minor gets nothing, a missing tool never throws
const kid={id:'kid',data:Object.assign({},wa.data,{age:15,birthday:''})};ck('minor: no body prompt',C.imgBody(kid)===null||!A.minor(kid.data));
const is=A.imgScene;A.imgScene=null;let thr=false;try{C.imgScenes(m);C.imgScenesHTML(m);}catch(e){thr=true;}A.imgScene=is;ck('no imgScene: no throw',!thr);
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
