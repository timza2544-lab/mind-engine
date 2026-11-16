// usage: node sub-mix.js <app dir>; 600 picks: 0/1/2 sub-styles around the main one, no clashing families, no duplicates, stable on rebuild and kept through JSON
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,F=A.finishLib,o=[];
const CONF=[['quiet','loud'],['shy','loud'],['shy','lead'],['quiet','lead']];let n=0,cnt=[0,0,0],clash=0,roles={lead:0,coda:0},dup=0;const ids=new Set();
for(let i=0;i<600;i++){F.recent.length=0;const f=F.pick({seed:'m'+i,n:1+i%3,came:i%2,w:null,buildup:50+i%40});n++;cnt[f.mix.length]++;
 const all=[f.id].concat(f.mix.map(x=>x.id));if(new Set(all).size!==all.length)dup++;
 const tags=all.map(id=>(F.TAGS[id]||'').split(' '));for(let a=0;a<tags.length;a++)for(let c=a+1;c<tags.length;c++)for(const [x,y] of CONF){if((tags[a].includes(x)&&tags[c].includes(y))||(tags[a].includes(y)&&tags[c].includes(x)))clash++}
 f.mix.forEach(x=>{roles[x.role]++;ids.add(x.id)});
 if(i<2)o.push(F.block(f).split('\n').slice(-2).join('\n').slice(0,420))}
o.push('mix size 0/1/2: '+cnt.join('/')+' clashes '+clash+' dup '+dup+' roles '+JSON.stringify(roles)+' distinct sub-styles '+ids.size);
// stability + keep
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};A.state.me=me;const w={id:'mx1',data:A.gameWoman({age:30}),game:{n:1,at:Date.now(),attempts:[]}};A.state.chars=[w];
let stable=0;for(let k=1;k<=12;k++){const g=A.gameRoll(w,me,{k,status:'single',nth:1,base:{vol:3},days:2+k%5,rounds:1,timed:false});w.game.attempts.push(g);const t1=A.releaseText(g.release,'พลอย','ต้น',null,{}),t2=A.releaseText(g.release,'พลอย','ต้น',null,{});if(t1===t2)stable++}
const w2=JSON.parse(JSON.stringify(w));const a5=w2.game.attempts[5].release;o.push('stable '+stable+'/12 json keeps mx '+JSON.stringify(a5.fin&&a5.fin.mx)+' same text '+(A.releaseText(a5,'พลอย','ต้น',null,{})===A.releaseText(w.game.attempts[5].release,'พลอย','ต้น',null,{})));
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
