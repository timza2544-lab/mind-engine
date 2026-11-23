// usage: node story-pregnancy-prompts.js <app dir>; a conceived night carries the conception scene and rule, the episode note keeps the result, pregnancy-safe position paths per trimester (expect 0 violations)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};A.state.me=me;
const c={id:'pc9',data:A.gameWoman({age:28}),story:{at:Date.now(),eps:[]},sim:{rel:'แฟน',relSet:1},chat:[],ai:{}};A.state.chars=[c];
const e1={k:1,at:1000,kind:'night',plan:{scope:'full'},days:0,scene:'x'};const r=A.storyRoll(c,me,e1,{});r.finish='inside';r.fert={conceived:true,outcome:'live',sex:'หญิง',twins:false,pct:22,day:13,len:28,ov:14,vol:3.6,rel:'วันไข่ตก'};e1.roll=r;c.story.eps=[e1];
const t=(A.storyPrompt(c,me,e1,{}).text||'');o.push('conceived night: scene '+t.includes('<conception-scene>')+' rule '+t.includes('ข้อยกเว้นของข้อห้ามเฉลยผลตั้งครรภ์')+' secret-block-for-self '+t.includes('<pregnancy-secret>'));
// pregnancy-safe positions by trimester
const lens={};const bad={t2:0,t3:0};
for(const [wk,key] of [[18,'t2'],[32,'t3']]){for(let i=0;i<60;i++){const rng=A.seedRng('z'+wk+i);const path=A.positionLib.path(rng,{full:true,first:'มองหน้ากัน (missionary)',rounds:2,avoid:[],preg:wk});const av=A.positionLib.pregAvoid(wk);if(path.some(x=>av.has(x)))bad[key]++;lens[key+path.join('')]=1}}
o.push('safe-position violations '+JSON.stringify(bad)+' ; t3 example '+A.positionLib.path(A.seedRng('q'),{full:true,first:'อยู่บน',rounds:2,avoid:[],preg:32}).join('>'));
// episode note carries the fert result
o.push('note: '+A.storyEpNote(e1,1).split('\n').filter(l=>/การตั้งครรภ์/.test(l)).join(' | ').slice(0,260));
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}}));console.log(errs.join('|')||'none');await b.close()})();
