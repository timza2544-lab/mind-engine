// usage: node story-positions-beats.js <app dir>; story nights roll a position path that respects her avoid list and prompts carry <positions> + <beats> + the rules for every finish kind
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};A.state.me=me;
o.push('scopes '+A.PLAN_SCOPES.map(x=>x[0]).join(','));
const c={id:'sc2',data:A.gameWoman({age:30}),story:{at:Date.now(),eps:[]},sim:{rel:'แฟน',relSet:1},chat:[],ai:{}};A.state.chars=[c];
const bp=A.bedPositions(c,me);o.push('her avoid: '+bp.avoid.map(x=>x.t).join(' | ')+' best: '+bp.best.map(x=>x.t).join(' | '));
let withPath=0,bad=0,seqs=new Set(),lens={};
for(let i=0;i<80;i++){const ep={k:i+1,at:1000+i,kind:'night',plan:{scope:'full'}};const r=A.storyRoll(c,me,ep,{});if(r.scopeEnd==='full'){withPath++;seqs.add(r.posPath.join('>'));lens[r.posPath.length]=(lens[r.posPath.length]||0)+1;
  const av=A.positionLib.avoidIds(bp.avoid.map(x=>x.t));if(r.posPath.slice(1).some(x=>av.has(x)))bad++}}
o.push('full nights '+withPath+' distinct paths '+seqs.size+' lengths '+JSON.stringify(lens)+' avoided-position violations (after the first) '+bad);
// prompts
for(const fin of ['inside','condom','outside','mouth','hand']){const ep={k:1,at:5000,kind:'night',plan:{scope:'full'}};const r=A.storyRoll(c,me,ep,{});ep.roll=r;r.finish=fin;if(['mouth','hand'].includes(fin))r.scopeEnd=fin==='mouth'?'oral':'hand';c.story.eps=[ep];
 const pr=A.storyPrompt(c,me,ep,{});const t=pr.text||String(pr);const i=t.indexOf('<positions>\nลำดับ')>=0?t.indexOf('<positions>\nลำดับ'):t.indexOf('<positions>\nคืนนี้');
 o.push(fin+': positions block '+(i>=0)+' beats block '+t.includes('<beats>\n-')+' rule '+t.includes('ท่าทางต้องเห็นภาพ')+' beatsRule '+t.includes('<beats> คือคลังจังหวะพลิกแพลง'));
 if(fin==='inside'||fin==='mouth')o.push(t.slice(i,i+1100));}
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
