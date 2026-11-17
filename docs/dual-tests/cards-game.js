// usage: node cards-game.js <app dir>; the card night has one game, ป๊อกเด้ง (the other five are gone); old picks and saved matches still work (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,C=A.cards,D=A.CARDS_DATA,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me=S.me||{id:'me-profile',data:{age:30,nickname:'ติม',firstName:'ติม',sex:'ชาย',mVolume:'ปานกลาง',mLength:15},chat:[]};S.game=S.game||{};S.game.mode='cards';
ck('one game in the data: pokdeng',D.GAMES.length===1&&D.GAMES[0].id==='pokdeng'&&D.GAMES[0].t==='ป๊อกเด้ง');
const pk=C.pickOf();pk.game='poker'; // an old saved pick
C.onAct('cdnewa',{dataset:{}});C.onAct('cdnewb',{dataset:{}});
const h=C.html();ck('pick screen: no game chips, says ป๊อกเด้ง is the only game',!/data-act="cdgame"/.test(h)&&/เกม: <b>ป๊อกเด้ง<\/b>/.test(h));
const ids=new Set();let n=0;for(let i=0;i<20;i++){C.onAct('cdnewa',{dataset:{}});C.onAct('cdnewb',{dataset:{}});C.onAct('cdstart',{dataset:{}});const m=S.cards;if(m){n++;ids.add(m.game.id);ck('prompt and card say ป๊อกเด้ง',C.cardHTML(m).includes('ป๊อกเด้ง'));if(i%5===0){C.onAct('cdgo',{dataset:{}});ck('match block names it',C.prompt(S.cards,{start:2}).text.includes('เกม: ป๊อกเด้ง'));}}S.cards=null;}
ck('20 new tables, all ป๊อกเด้ง ('+n+' started: '+[...ids].join(',')+')',n>=15&&ids.size===1&&ids.has('pokdeng'));
// a match saved with another game keeps its own text and still loads
C.onAct('cdnewa',{dataset:{}});C.onAct('cdnewb',{dataset:{}});C.onAct('cdstart',{dataset:{}});const m=S.cards;const keep=JSON.parse(JSON.stringify(m));keep.game={id:'blackjack',t:'แบล็กแจ็ก',how:'ไล่ให้ใกล้ 21',pace:'fast'};S.cards=keep;
ck('an old saved match (blackjack) is still valid and shows its own game',C.ok(S.cards)&&C.cardHTML(S.cards).includes('แบล็กแจ็ก'));
ck('replan of the old match moves to ป๊อกเด้ง',(()=>{try{const r=C.replan(S.cards,S.me);return !r||r.game.id==='pokdeng';}catch(e){return false;}})());
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
