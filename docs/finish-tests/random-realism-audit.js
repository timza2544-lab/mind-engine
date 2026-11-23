// usage: node random-realism-audit.js <app dir>; women from every random path (gameWoman, fillRandom) must carry zero coherence issues (expect 0/500 each); run after adding or changing a generator
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const A=ANIMA,o=[];
// dual family: mothers and sons
const D=A.dual;o.push('dual keys '+Object.keys(D).filter(k=>/gen|cast|new|person|mom|son|family/i.test(k)).slice(0,12).join(','));
// women from every generator path with coherence check
const paths={gameWoman:()=>A.gameWoman({age:24+Math.floor(Math.random()*30)}),fill:()=>{const d={};A.fillRandom(d,null,false);return d}};
for(const k in paths){let bad=0;const c={};for(let i=0;i<500;i++){const d=paths[k]();const is=A.coherenceIssues(d);if(is.length){bad++;is.forEach(x=>c[x.id]=(c[x.id]||0)+1)}}o.push(k+': '+bad+'/500 with issues '+JSON.stringify(c))}
return o.join('\n')}));console.log(errs.join('|')||'none');await b.close()})();
