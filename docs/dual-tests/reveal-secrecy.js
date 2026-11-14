const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{const A=ANIMA,S=A.state;const me=S.me||(S.me={id:'me-profile',data:{age:28,nickname:'ต้น',firstName:'ต้น',sex:'ชาย'},chat:[]});
const out=[A.dual.selfTest().report];let revealed=0,matches=0,sample='',early='',late='';
for(let k=0;k<12;k++){S.dual=null;A.dual.makeMom(me);A.dual.rollRivals(me);S.dualPick.rounds=5;A.dual.start(me,A.dual.libraryMom());let m=S.dual,g=0;while(!m.over&&g++<150){if(m.phase==='play'){const h=m.hands.momA.filter(c=>c.cost<=m.energy.momA).sort((a,b)=>b.p-a.p)[0]||m.hands.momA[0];A.dual.play(me,h.id)}else A.dual.accept(me)}
matches++;const rv=m.log.filter(x=>x.k==='reveal');revealed+=rv.length;rv.forEach(x=>{S.__rv=(S.__rv||[]).concat(x.line)});
const tl=m.log.filter(x=>x.k==='talk');if(tl[0]&&!early)early=tl[0].line;}
out.push('matches '+matches+' reveals '+revealed+'\n'+(S.__rv||[]).slice(0,4).join('\n'));out.push('first talk: '+early);
// prompt secrecy
S.dual=null;A.dual.makeMom(me);A.dual.rollRivals(me);A.dual.start(me,A.dual.libraryMom());let m=S.dual;const pr=A.dual.prompt(me,'Me');const sh=pr.slice(pr.lastIndexOf('<shared>'));out.push(sh.slice(0,420));
const h=A.dual.html();out.push('ui spoiler '+/ดูข้อมูลลับ/.test(h)+' hidden pct visible outside details? '+(h.replace(/<details>[\s\S]*?<\/details>/g,'').match(/ประสบการณ์ร่วมกัน <b>/)?'YES(bad)':'no'));
out.push('lexrule '+/ใช้ให้ตรง/.test(A.LEX_RULE()));
return out.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}});
console.log(r);console.log('ERRS',errs.join('|'));await b.close()})();
