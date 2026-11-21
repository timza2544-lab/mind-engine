// usage: node story-pregnancy.js <app dir>; story nights roll a real conception (rate ~6% per inside night), the state machine (unknown -> pregnant -> born / loss / early) follows the story's days, prompts carry the right block per state
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};A.state.me=me;
const mkc=i=>({id:'pc'+i,data:A.gameWoman({age:26+i%10}),story:{at:Date.now(),eps:[]},sim:{rel:'แฟน',relSet:1},chat:[],ai:{}});
// 1 conception rates over many inside nights
let n=0,con=0,outs={},withFert=0;for(let i=0;i<300;i++){const c=mkc(i);A.state.chars=[c];const ep={k:1,at:1000,kind:'night',plan:{scope:'full'},days:5};const r=A.storyRoll(c,me,ep,{});if(r.finish==='inside'&&r.scopeEnd==='full'){n++;if(r.fert){withFert++;if(r.fert.conceived){con++;outs[r.fert.outcome]=(outs[r.fert.outcome]||0)+1}}}}
o.push('inside full nights '+n+' with fert '+withFert+' conceived '+con+' ('+Math.round(100*con/Math.max(1,withFert))+'%) outcomes '+JSON.stringify(outs));
// 2 state machine on a forged chain
const c=mkc(7);A.state.chars=[c];const E=(k,at,days,fert)=>({k,at,days,kind:'night',roll:{fert,release:null},scene:'x'});
const mk=(outc)=>[{k:1,at:1000,days:0,kind:'night',roll:{finish:'inside',fert:{conceived:true,outcome:outc,sex:'ชาย',twins:false,pct:20,day:13,len:28,ov:14,lossWeek:9}},scene:'x'}];
const kindsAt=(outc,days)=>{c.story.eps=mk(outc);const ep={k:2,at:2000,kind:'meet',days};return A.storyPregAt(c,me,ep)};
for(const outc of ['live','clin','early']){const row=[7,20,40,70,120,200,300].map(dd=>{const s=kindsAt(outc,dd);return dd+'d:'+s.kind+(s.kind==='pregnant'?'('+s.weeks+'w)':s.kind==='born'?'('+s.months+'m)':'')});o.push(outc+' -> '+row.join(' '))}
// 3 prompts
const first=(()=>{const e={k:1,at:1000,kind:'night',plan:{scope:'full'},days:0,scene:'x'};const r=A.storyRoll(c,me,e,{});r.finish='inside';r.fert={conceived:true,outcome:'live',sex:'ชาย',twins:false,pct:20,day:13,len:28,ov:14,vol:3.4,rel:'วันไข่ตก'};e.roll=r;return e})();
for(const dd of [6,100,320]){const ep={k:2,at:2000,kind:'night',plan:{scope:'full'},days:dd};const r=A.storyRoll(c,me,ep,{});ep.roll=r;if(r.finish!=='none'&&!r.release){}c.story.eps=[first,ep];let pr;try{pr=A.storyPrompt(c,me,ep,{})}catch(e){o.push('prompt ERR '+e.message.slice(0,100));continue}const t=pr.text||String(pr);
 o.push('days '+dd+': secret '+t.includes('<pregnancy-secret>')+' pregnancy '+t.includes('<pregnancy>')+' postpartum '+t.includes('<postpartum>')+' | positions '+(r.posPath||[]).join('>')+' | fert '+(r.fert?'yes':'no(preg/not inside)'))}
o.push('status line: '+A.storyPregLine(c,me).replace(/<[^>]+>/g,''));
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}}));console.log(errs.join('|')||'none');await b.close()})();
