const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state;S.me=S.me||{id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]};
const out=[A.dual.selfTest().report];localStorage.removeItem('anima.dual.codex.v1');S.dualCx=null;S.dual=null;
A.dual.makeMom(S.me);const R=A.dual.rollRivals(S.me);let h=A.dual.html();
out.push('pre-start prompt block '+/พรอมต์สร้างภาพแม่อีกฝั่ง/.test(h)+' buttons '+['dlrvimg','dlrvimgneg','dlrvimgth','dlrvson'].map(k=>k+':'+h.includes(k)).join(' ')+' clear btn (codex empty) '+/dlcxclear/.test(h));
// preview prompt equals the codex prompt after start
const pv=A.imageSpec(R.mom.data,R.seed).en;A.dual.start(S.me,A.dual.libraryMom());const it=A.dual.cx()[0];out.push('codex entry '+!!it+' prompt same as preview '+(A.imageSpec(it.mom.data,it.seed).en===pv));
S.dual=null;A.dual.rollRivals(S.me);A.dual.start(S.me,A.dual.libraryMom());S.dual=null;
h=A.dual.html();out.push('clear btn visible '+/dlcxclear/.test(h)+' count '+A.dual.cx().length);
// clipboard stub
window.__cp=[];navigator.clipboard.writeText=async t=>{window.__cp.push(t)};
A.dual.rollRivals(S.me);A.dual.onAct('dlrvimg',{dataset:{}});A.dual.onAct('dlrvimgth',{dataset:{}});A.dual.onAct('dlrvson',{dataset:{}});
out.push('copies '+window.__cp.length);
A.dual.onAct('dlcxclear',{dataset:{}});out.push('after clear '+A.dual.cx().length+' stored '+JSON.parse(localStorage.getItem('anima.dual.codex.v1')).items.length+' html still ok '+(A.dual.html().length>1000)+' clearbtn gone '+!/dlcxclear/.test(A.dual.html()));
return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}});
console.log(r);await new Promise(r=>setTimeout(r,300));console.log('ERRS',errs.join('|')||'none');await b.close()})();
