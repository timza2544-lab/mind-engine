const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const A=ANIMA,S=A.state;S.me=S.me||{id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]};const eras={
 'v3-ก่อนเรื่อง/ท้อง/ท่าผู้ชาย':['sigs','sigUsed','recent','usedDet','cyc','preg','fertLog','nthMan','warns','reveals'],
 'ก่อนท่าผู้ชาย (v22)':['sigs','sigUsed'],
 'ก่อนท้อง (v19)':['cyc','preg','fertLog','nthMan','warns','sigs','sigUsed','recent','usedDet'],
 'ไม่มี exp/pov/story (บั๊กเก่า)':['exp','pov','story','sigs','sigUsed','recent','usedDet','cyc','preg','fertLog','nthMan','warns','reveals']};
const out=[];
for(const [name,drop] of Object.entries(eras)){try{
 S.dual=null;A.dual.makeMom(S.me);A.dual.rollRivals(S.me);A.dual.start(S.me,A.dual.libraryMom());let m=S.dual;
 for(let i=0;i<3&&m.phase==='play';i++){const h=m.hands.momA.filter(c=>c.cost<=m.energy.momA)[0]||m.hands.momA[0];A.dual.play(S.me,h.id)}
 const raw=JSON.parse(JSON.stringify(m));drop.forEach(k=>delete raw[k]);
 localStorage.setItem('anima.dual.v1',JSON.stringify({v:1,m:raw,pick:S.dualPick||{}}));S.dual=null;S.dualLoaded=false;A.dual.load();m=S.dual;
 if(!m){out.push(name+': NO MATCH');continue}
 const h0=A.dual.html();let bad=/หน้า dual มีปัญหา|แมตช์เก่าใช้ต่อไม่ได้/.test(h0);
 let g=0;while(!m.over&&g++<200){if(m.phase==='play'){const hand=m.hands.momA.filter(c=>c.cost<=m.energy.momA)[0]||m.hands.momA[0];A.dual.play(S.me,hand.id,(m.sigs&&m.sigs.me&&m.sigs.me[0])||'flow')}else A.dual.accept(S.me)}
 const pr=A.dual.prompt(S.me,'Me'),pr2=A.dual.prompt(S.me,'Mom');
 out.push(name+': finished '+m.over+' banner '+bad+' warns '+((m.warns||[]).map(w=>w.where+':'+w.msg).join(';')||'none')+' prompt '+pr.length+'/'+pr2.length+' html '+A.dual.html().length)}catch(e){out.push(name+': THROW '+e.message+' @ '+String(e.stack).split('\n')[1].trim())}}
return out.join('\n')});
console.log(r);console.log('pageerrors',errs.join('|')||'none');await b.close()})();
