// usage: node prompt-tidy.js <app dir>; A.promptTidy drops only whole lines (>=40 chars) of <her>/<heuristics> that another block of the same prompt already carries word for word; every mode that builds through A.fitPrompt is tidied (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};const L='เธอชอบเล่นตามจังหวะของตัวเองและไม่ชอบให้ใครเร่งเด็ดขาด';
const T='กติกา <her> อยู่ในข้อ\n<her>\n- '+L+'\n- สั้น ๆ\n- ข้อที่มีแค่ในนี้ ยาวพอที่จะผ่านเกณฑ์สี่สิบตัวอักษรได้แน่นอน\n</her>\n\n<her-signature>\n- '+L+'\n</her-signature>\n\n<heuristics>\n- '+L+'\n- กฎอื่น\n</heuristics>';
const t=A.promptTidy(T);ck('dup line left out of her',t.split(L).length===2);ck('kept in the signature',/<her-signature>\n- เธอชอบ/.test(t));ck('short line kept','- สั้น ๆ'.length&&t.includes('- สั้น ๆ'));ck('unique long line kept',t.includes('ข้อที่มีแค่ในนี้'));ck('heuristics other line kept',t.includes('- กฎอื่น'));ck('rules mention untouched',t.startsWith('กติกา <her> อยู่ในข้อ'));ck('idempotent',A.promptTidy(t)===t);
ck('no blocks: unchanged',A.promptTidy('ไม่มีบล็อก\nบรรทัดเดียว')==='ไม่มีบล็อก\nบรรทัดเดียว');ck('empty ok',A.promptTidy('')===''&&A.promptTidy(null)==='');
// the signature itself is never trimmed (only her / heuristics are targets)
const T2='<her-signature>\n- '+L+'\n</her-signature>\n\n<her-body>\n- '+L+'\n</her-body>';ck('other blocks untouched',A.promptTidy(T2)===T2);
// a real story prompt: tidied, every block still there, no line lost from the prompt as a whole
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};A.state.me=me;const real=A.promptTidy;let saved=0;
for(let k=0;k<4;k++){const c={id:'pt'+k,data:A.gameWoman({age:24+k*4}),story:{at:Date.now(),eps:[]},sim:{rel:'แฟน',relSet:1},chat:[],ai:{}};A.state.chars=[c];const ep={k:1,at:1000,kind:'night',plan:{scope:'full'},days:5};ep.roll=A.storyRoll(c,me,ep,{});c.story.eps=[ep];
 A.promptTidy=x=>x;const a=A.storyPrompt(c,me,ep,{}).text;A.promptTidy=real;const d=A.storyPrompt(c,me,ep,{}).text;saved+=a.length-d.length;
 ck('woman '+k+': not longer',d.length<=a.length);ck('woman '+k+': same blocks',(a.match(/^<[a-z-]+>$/gm)||[]).join()===(d.match(/^<[a-z-]+>$/gm)||[]).join());
 const lost=a.split('\n').filter(l=>l.trim().length>=40&&!d.includes(l));ck('woman '+k+': every dropped line still in the prompt once',lost.length===0||lost.every(l=>d.split(l.trim()).length>=2));}
o.push('saved over 4 stories: '+saved+' chars');
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
