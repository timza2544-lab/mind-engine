const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});p.on('dialog',d=>d.accept());await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state;S.me=S.me||{id:'me-profile',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]};
const out=['pact '+typeof A.pact,'data wishes '+A.pactData.WISH.length];
const st=A.pact.selfTest();out.push('selfTest '+JSON.stringify(st).slice(0,360));
// full manual flow via onAct
S.game=S.game||{};A.pact.onAct('ptopen',{dataset:{}});out.push('mode '+S.game.mode);
A.pact.onAct('ptnew',{dataset:{}});let m=S.pact;out.push('stage '+m.stage+' her '+m.ctx.her+' age '+A.ageOf(m.w.data)+' wish '+m.wishId+' size '+m.size+' ent '+m.ent);
out.push('html meet len '+A.pact.html().length+' has ladder '+/ราคาของ/.test(A.pact.html()));
A.pact.onAct('ptrung',{dataset:{v:'5'}});A.pact.onAct('ptpropose',{dataset:{}});m=S.pact;out.push('offer '+JSON.stringify(m.offer)+' g0 '+JSON.stringify(m.g0));
let h=A.pact.html();out.push('offer html '+/คำตอบของเธอ/.test(h)+' confirm5 '+/ยืนยันทั้งสองฝ่าย/.test(h));
if(m.offer.paid>=5){A.pact.onAct('ptconfirm5',{dataset:{}})}
if(m.offer.paid>=1){A.pact.onAct('ptperform',{dataset:{}});m=S.pact;out.push('stage '+m.stage+' tier '+m.night.tier+' vol '+m.night.vol+' came '+m.night.came+' conceived '+m.night.conceived+' ripple '+m.ripple.length);out.push('ritual5: '+(m.night.steps[4]||m.night.steps[m.night.steps.length-1]).slice(0,120));
 h=A.pact.html();out.push('ripple html '+/ผลของพร/.test(h)+' write btn '+/ptwrite/.test(h));
 try{out.push('scene prompt len '+A.pact.scenePrompt(S.me).length+' ripple prompt len '+A.pact.ripplePrompt(S.me).length)}catch(e){out.push('PROMPT ERR '+e.message)}}
else out.push('she refused');
out.push('codex '+A.pact.codex().length);
// hub lists the mode
return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}});
console.log(r);await new Promise(r=>setTimeout(r,300));console.log('ERRS',errs.join('|')||'none');await b.close()})();
