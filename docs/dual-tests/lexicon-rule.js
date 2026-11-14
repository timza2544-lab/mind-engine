const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const A=ANIMA;const a=A.STYLE_RULE({}, {});const b=A.STYLE_RULE({}, {noLex:true});return JSON.stringify({lex:!!A.LEX,withLex:/คำพูดจริงของคนจริง/.test(a),noLex:!/คำพูดจริงของคนจริง/.test(b),dual:JSON.stringify(A.dual.selfTest()).slice(0,300),cards:JSON.stringify(A.cards.selfTest?A.cards.selfTest():'n/a').slice(0,200)})});
console.log(r,errs.join('|'));await b.close()})();
