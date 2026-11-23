// usage: node euphemism-rule.js <app dir>; vague words in a sex scene ("ท่อนล่าง", "ส่วนล่าง", "ข้างล่าง", "ปากช่อง", "น้องชาย" ...) are named and given their plain Thai word (หี / ควย / น้ำควย / เย็ด / แตก ...) in the lexicon rule that every sexual-scene prompt carries; the authored pools of the pact demon/god, the finish library and the lexicon lists no longer use the vague words (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
const r=A.STYLE_RULE({}, {}),rn=A.STYLE_RULE({}, {noLex:true});
ck('the table: 9 groups of vague words with the plain word for each',A.EUPH.length>=9&&A.EUPH.every(x=>x[0]&&x[1]));
ck('the style rule carries it (and the old lexicon text is still there)',/คำเลี่ยงที่ห้ามใช้ในฉากเซ็กซ์/.test(r)&&/คำพูดจริงของคนจริง/.test(r)&&!/คำเลี่ยงที่ห้ามใช้ในฉากเซ็กซ์/.test(rn));
ck('the owner\'s sentence is the example, with its plain form',r.includes('"ท่อนล่างฉันบีบรัดเขาเป็นจังหวะ" ไม่ได้ ให้เขียนว่า "หีฉันบีบรัดควยเขาเป็นจังหวะ"'));
ck('the vague words are named: ท่อนล่าง ส่วนล่าง ข้างล่าง ช่วงล่าง ใต้สะดือ ตรงนั้น ของลับ น้องชาย ปากช่อง ช่องคลอด น้ำอสุจิ ร่วมรัก มีเพศสัมพันธ์ หลั่ง ถึงจุดสุดยอด หน้าอก',['ท่อนล่าง','ส่วนล่าง','ข้างล่าง','ช่วงล่าง','ใต้สะดือ','ตรงนั้น','ของลับ','น้องชาย','ปากช่อง','ช่องคลอด','น้ำอสุจิ','ร่วมรัก','มีเพศสัมพันธ์','หลั่ง','ถึงจุดสุดยอด','หน้าอก'].every(w=>A.EUPH_RULE().includes(w)));
ck('the plain words are given: หี ควย ปากหี น้ำควย น้ำหี เย็ด แตก เสร็จ นม ตูด',['หี','ควย','ปากหี','น้ำควย','น้ำหี','เย็ด','แตก','เสร็จ','นม','ตูด'].every(w=>A.EUPH_RULE().includes(w)));
ck('narration and the body are always plain; only a really shy voice may go around it, in dialogue; not for medical or place uses',/การเล่า การบรรยายร่างกาย และความคิดในใจใช้คำตรงเสมอ/.test(r)&&/เฉพาะในคำพูดของเขา/.test(r)&&/ไม่ใช่เซ็กซ์/.test(r));
// the prompts of the modes carry it (they all use STYLE_RULE)
const X=A.pact,D=A.pactData;
// the authored pools: no vague word for the parts
const vague=/ท่อนล่าง|ส่วนล่างของเขา|แค่ข้างล่าง|ปากช่อง|ผนังข้างในเธอ|ของลับ/;
const pools=[X.DARKSEX,X.GODSEX].map(x=>JSON.stringify(x)).join(' ');
ck('pact demon / god pools: no vague word for the parts (ท่อนล่าง / ปากช่อง / ผนังข้างในเธอ ...)',!vague.test(pools));
ck('the demon\'s lines say the part: "หีเธอบีบรัดควยเขา", "ปากหี", "น้ำควย", "น้ำหี"',/หีเธอบีบรัดควยเขาเป็นระลอก/.test(pools)&&/ปากหีของเธอ/.test(pools)&&/น้ำควยของเขา/.test(pools)&&/น้ำหีของเธอ/.test(pools)&&/หีเธอรัดควยฉัน/.test(pools));
ck('the pact spoken rule names the vague words too',/ท่อนล่าง ส่วนล่าง ข้างล่าง ของลับ น้องชาย ส่วนนั้น/.test(X.spokenRule({seed:'q',night:{paid:5},role:'give',rung:5,offer:{paid:5},ent:'demon'})));
// the finish library and its flood text (a sample of nights)
const F=A.finishLib;let txt='';for(let i=0;i<40;i++){try{const f=F.pick({seed:'e'+i,n:1,came:i%2===0,w:null,buildup:60+i%30,r:null});txt+=JSON.stringify(f);}catch(e){}}
ck('the finish library draws: no "ส่วนล่างของเขา" and no "ปากช่อง" ('+txt.length+' chars sampled)',txt.length>2000&&!/ส่วนล่างของเขา|ปากช่อง/.test(txt));
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
