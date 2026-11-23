// usage: node cards-inside-right.js <app dir>; the inside right (the last stake) is over the OTHER couple's wife; when she does not go to the winner tonight (only one couple swaps) the round says so and it becomes the right to forbid the other man (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,C=A.cards,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me=S.me||{id:'me-profile',data:{age:30,nickname:'ติม',firstName:'ติม',sex:'ชาย',mVolume:'ปานกลาง',mLength:15},chat:[]};S.game=S.game||{};S.game.mode='cards';
C.onAct('cdnewa',{dataset:{}});C.onAct('cdnewb',{dataset:{}});C.onAct('cdstart',{dataset:{}});
let m=S.cards;S.cards=null;const seen={unusable:0,usableOne:0,both:0};let mism=null;
for(let i=0;i<80;i++){C.onAct('cdnewa',{dataset:{}});C.onAct('cdnewb',{dataset:{}});C.onAct('cdstart',{dataset:{}});m=S.cards;if(!m)continue;m.opt.both=i%5===0?'yes':'no';C.onAct('cdgo',{dataset:{}});m=S.cards;const inR=m.rounds.find(r=>r.kind==='inside');if(!inR||!m.swap){S.cards=null;continue;}const sw=m.swap,wA=inR.winner==='a';
 const oneSided=sw.a!==sw.b,usable=wA?sw.b:sw.a;
 if(sw.a&&sw.b){seen.both++;ck('both swap: the right keeps its text and is usable',inR.unusable===false&&/สิทธิ์แตกในเมียของอีกฝ่ายเป็นของเขา/.test(inR.line));}
 else if(!usable){seen.unusable++;if(!mism)mism=m;ck('one-sided and unusable: flagged',inR.unusable===true);}
 else{seen.usableOne++;ck('one-sided but the winner\'s right has a wife to act on: unchanged',inR.unusable===false&&/สิทธิ์แตกในเมียของอีกฝ่ายเป็นของเขา/.test(inR.line));}
 S.cards=null;}
o.push('seen: '+JSON.stringify(seen));ck('the mismatch case turned up in 80 nights',!!mism);
if(mism){const inR=mism.rounds.find(r=>r.kind==='inside'),wA=inR.winner==='a',wName=wA?mism.me.call:mism.rival.name,loserWife=wA?mism.b.call:mism.a.call,goneWife=wA?mism.a.call:mism.b.call,other=wA?mism.rival.name:mism.me.call;
 ck('the round line names the winner, the wife who is NOT going, the wife who is, and the other man',inR.line.includes(wName+'ชนะ')&&inR.line.includes(loserWife+'ไม่ได้ไปกับเขา')&&inR.line.includes('สลับกันแค่'+goneWife+'กับ'+other)&&/สิทธิ์ห้าม/.test(inR.line));
 ck('it no longer says the right is to finish inside the other wife',!/สิทธิ์แตกในเมียของอีกฝ่ายเป็นของเขา/.test(inR.line));
 ck('the night lines carry the explanation too',mism.swap.lines.some(l=>/^สิทธิ์ข้างใน: .*ไม่ได้ไปกับเขา/.test(l)));
 const side=wA?'a':'b';const winnerPair=wA?'b':'a';ck('the pair that does swap is told: the other man holds back (pull out or condom), "the right is the winner\'s"',(()=>{const x=mism.swap.inside[wA?'a':'b'];return x&&(x.ok===true||(/สิทธิ์ข้างในเป็นของ/.test(x.why)&&x.why.includes(wName)));})());
 ck('the pair that does not swap has no inside line',mism.swap.inside[wA?'b':'a']===null);
 ck('the rounds shown to the writer use the new line',mism.rounds.find(r=>r.kind==='inside').line===inR.line);
 const text=C.prompt(mism,{start:2}).text;ck('the scene prompt is told the same (no right left over)',text.includes('ไม่ได้ไปกับเขา')&&text.includes('สิทธิ์ห้าม'));}
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
