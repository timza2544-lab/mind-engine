// usage: node personality-pull.js <app dir>; shy vs bold women should get visibly different finish families
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,F=A.finishLib,o=[];
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};A.state.me=me;
const doms=[...new Set(A.FACETS.map(f=>f.dom))];o.push('domains '+doms.join(','));
const mkB=(E,Ag)=>{const b={};A.FACETS.forEach(f=>{b[f.id]=f.dom==='E'?E:f.dom==='A'?Ag:50});return b};
const mk=(id,b)=>{const d=A.gameWoman({age:30});d.big5=b;const w={id,data:d,game:{n:1,at:Date.now(),attempts:[]}};A.state.chars=(A.state.chars||[]).concat([w]);return w};
const types={shy:mk('shy',mkB(10,70)),bold:mk('bold',mkB(92,35)),none:mk('none',null)};
const tally={};
for(const k in types){const w=types[k],c={};let wild=0,tw=0,whys={};
 for(let i=0;i<150;i++){const r=A.release(w,me,{k:i+1,days:i%7,round:1});if(i===0)o.push(k+' wid '+r.wid);
  const f=F.pick({seed:'s'+i,n:1+i%3,came:i%2,w:A.state.chars.find(x=>x.id===r.wid),buildup:r.buildup});
  (F.TAGS[f.id]||'').split(' ').forEach(t=>c[t]=(c[t]||0)+1);wild+=f.wild?1:0;tw+=f.twist?1:0;if(f.why)whys[f.why]=1}
 o.push(k+' tags '+JSON.stringify(c)+' wild '+wild+' twist '+tw+' distinctIds '+0)}
const w=types.shy,g=A.gameRoll(w,me,{k:1,status:'single',nth:1,base:{vol:3},days:2,rounds:1,timed:false});
const t=A.releaseText(g.release,'พลอย','ต้น',null,{});o.push('wid '+g.release.wid+'\n'+t.split('\n').slice(-3).join('\n'));
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
