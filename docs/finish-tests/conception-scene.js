// usage: node conception-scene.js <app dir>; the shared conception scene: facts, voices x8, viewpoints x8, per-stage image menus, rule, main-game wiring, the secret-mode switch and its toggle on guess/mirror/hole/dual
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,o=[];
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};
// 1 central variety
const sc=[];for(let i=0;i<6;i++)sc.push(A.conceptionScene({seed:'s'+i,her:'พลอย',him:'ต้น',vol:3.4,day:13,len:28,ov:14,pct:21.5}));
o.push('len '+sc[0].length+' distinct '+new Set(sc).size+' has rule '+sc[0].includes('ข้อกำหนด: ข้อยกเว้น')+' twins '+A.conceptionScene({seed:'t',her:'พลอย',him:'ต้น',twins:true}).includes('ภาพแฝด'));
o.push(sc[1].split('\n').slice(0,7).join('\n').slice(0,900));
// registers/viewpoints coverage
const regs=new Set(),vps=new Set();for(let i=0;i<80;i++){const t=A.conceptionScene({seed:'r'+i,her:'a',him:'b'});regs.add(t.split('\n').find(l=>l.startsWith('น้ำเสียง')));vps.add(t.split('\n').find(l=>l.startsWith('มุมมอง')))}
o.push('registers seen '+regs.size+'/8 viewpoints '+vps.size+'/8');
// 2 main game
const w={id:'cw1',data:A.gameWoman({age:30}),game:{n:1,at:Date.now(),attempts:[]}};S.chars=[w];
const g=A.gameRoll(w,S.me,{k:1,status:'single',nth:1,base:{vol:3},days:2,rounds:1,timed:false});
g.conceived=false;let pr=A.gamePrompt(w,S.me,g,{});let txt=pr.text||String(pr);o.push('main not conceived: scene '+txt.includes('<conception-scene>'));
g.conceived=true;g.outcome='live';pr=A.gamePrompt(w,S.me,g,{});txt=pr.text||String(pr);o.push('main conceived: scene '+txt.includes('<conception-scene>')+' rule in rule4 '+txt.includes('ข้อยกเว้นของข้อห้ามเฉลยผลตั้งครรภ์'));
// 3 secret mode switch
const G=A.guess;A.conception.setReveal(false);const a={conceived:true,pct:12,vol:3,day:13,len:28,ov:14,k:1};
o.push('off: pregLine bans reveal '+/ห้ามเฉลย/.test(G.pregLine(a,true))+' conScene "'+G.conScene(a,w,'พลอย','ต้น')+'"');
A.conception.setReveal(true);o.push('on: pregLine mentions scene '+/conception-scene/.test(G.pregLine(a,true))+' conScene len '+G.conScene(a,w,'พลอย','ต้น').length);
const nc={conceived:false,pct:12};o.push('on but not conceived: "'+G.conScene(nc,w,'พลอย','ต้น')+'"');
// toggle html
const T=A.conception.toggleHTML();o.push('toggle '+T.slice(0,120));
for(const [k,m,f] of [['guess',A.guess,'html'],['mirror',A.mirror,'html'],['hole',A.hole,'html'],['dual',A.dual,'html']]){try{const h=m[f]();o.push(k+' html has toggle '+(typeof h==='string'&&h.includes('data-conc="tog"'))+' wrapped '+!!m[f]._conc)}catch(e){o.push(k+' html err '+e.message.slice(0,60))}}
A.conception.setReveal(false);return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
