// usage: node interview-bed-real.js <app dir>; the interview's bed scene (A.bedChatPrompt) carries positions in order, twists, a real conception roll and the pregnancy state (own night / game / story)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};A.state.me=me;
const mk=id=>({id,data:A.gameWoman({age:28}),chat:[{role:'user',content:'สวัสดี'},{role:'assistant',content:'ค่ะ'}],sim:{rel:'แฟน',relSet:1},ai:{}});
const realNP=A.nightPlan, realRoll=A.gameRoll; let force=null;
A.nightPlan=function(w,m,op){const N=realNP.apply(this,arguments);return force?Object.assign({},N,force):N;};
const FERT={conceived:true,outcome:'live',sex:'หญิง',twins:false,pct:22,perCycle:25,live:80,day:13,len:28,ov:14,vol:3.4,rel:'',blocked:'',factors:[],lossWeek:0};
const full={scope:'full',scopeEnd:'full',finish:'inside',finish0:'inside',condom:false};
const P=(c,m)=>A.bedChatPrompt(c,me,Object.assign({styleN:1},m||{}),c.chat).text;
// 1. an inside night that conceives
let c=mk('ib1');force=full;A.gameRoll=function(){return {conceived:true,outcome:'live',sex:'หญิง',twins:false,pct:22,perCyclePct:25,livePct:80,day:13,len:28,ov:14,factors:[]};};
let t=P(c);ck('positions',t.includes('<positions>'));ck('beats',t.includes('<beats>'));ck('conception scene',t.includes('<conception-scene>'));ck('fert on roll',A.bedLast&&A.bedLast.fert&&A.bedLast.fert.conceived);ck('positions rule',t.includes(A.positionLib.RULE.slice(0,30)));
o.push('conceived: '+t.length+' chars, path '+A.bedLast.posPath.join('>'));
// the same night twice says the same (cache)
const f1=JSON.stringify(A.bedLast.fert);A.gameRoll=function(){return {conceived:false,pct:5,day:2,len:28,ov:14,factors:[]};};P(c);ck('cached roll stable',JSON.stringify(A.bedLast.fert)===f1);
// a continuation reads the stored roll, never rolls again
t=P(c,{bedFert:null});ck('more: no new conception',!t.includes('<conception-scene>')&&A.bedLast.fert===null);
// 2. not inside: no roll, no conception
A.gameRoll=function(){throw new Error('must not roll');};force=Object.assign({},full,{finish:'outside'});c=mk('ib2');t=P(c);ck('outside: positions yes, scene no',t.includes('<positions>')&&!t.includes('<conception-scene>')&&A.bedLast.fert===null);
// touch only: no positions block
force={scope:'touch',scopeEnd:'touch',finish:'none',finish0:'none'};c=mk('ib3');t=P(c);ck('touch: no positions',!t.includes('<positions>'));
// 3. own earlier night: n scenes later
A.gameRoll=function(){throw new Error('must not roll while she carries');};force=full;
for(const [n,kind] of [[0,'<pregnancy-secret>'],[1,'<pregnancy>'],[5,'<pregnancy>'],[8,'<pregnancy>']]){c=mk('ib4'+n);c.bedPreg={fert:FERT,n};t=P(c);ck('n='+n+' '+kind,t.includes(kind)&&A.bedLast.src==='bed');
 if(n>=1){const wk=A.bedLast.PS.weeks,avoid=A.positionLib.pregAvoid(wk);ck('n='+n+' no unsafe position (wk '+wk+')',A.bedLast.posPath.every(i=>!avoid.has(i)));ck('n='+n+' pregnancy rule',t.includes('ท้องของเธออยู่ในทุกการสัมผัส'));ck('n='+n+' no conception',!t.includes('<conception-scene>'));o.push('n='+n+' wk '+wk+' path '+A.bedLast.posPath.join('>'));}}
c=mk('ib5');c.bedPreg={fert:FERT,n:11};t=P(c);ck('born after ~10 scenes',t.includes('<postpartum>'));
// 4. the game and the story carry it too
c=mk('ib6');const gs=A.gameStatus;A.gameStatus=()=>({kind:'pregnant',k0:0,weeks:10,now:12,twins:false,sex:'ชาย'});c.game={attempts:[{conceived:true}]};t=P(c);ck('game pregnant',t.includes('<pregnancy>')&&A.bedLast.src==='game');A.gameStatus=gs;
c=mk('ib7');c.story={at:1,eps:[{k:1,at:100,roll:{fert:FERT},days:0},{k:2,at:200,days:70}]};t=P(c);ck('story pregnant',t.includes('<pregnancy>')&&A.bedLast.src==='story');
// the interview line only for its own night
c=mk('ib8');c.bedPreg={fert:FERT,n:3};const L=A.bedPregLine(c,me);ck('line',/ท้อง 14 สัปดาห์/.test(L)&&/bedpregclear/.test(L));c.bedPreg=null;ck('no line when free',A.bedPregLine(c,me)==='');
// 5. conception can come again after a birth, never while carrying
c=mk('ib9');c.bedPreg={fert:FERT,n:11};A.gameRoll=function(){return {conceived:true,outcome:'live',sex:'หญิง',pct:20,day:12,len:28,ov:14,factors:[]};};force=full;t=P(c);ck('born: may conceive again',t.includes('<conception-scene>'));
A.nightPlan=realNP;A.gameRoll=realRoll;
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}}));console.log(errs.join('|')||'none');await b.close()})();
