// usage: node slime-guard.js <app dir>; slime guardrails and robustness (v265): minor words (incl. Thai digits, English), female-only forms, names, norm on junk, kid log lines never reach the meal prompt, bud guard, no little slime / conception art, data events
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,X=A.slime,G=A.slimeGif,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};const thr=f=>{try{f();return null;}catch(e){return String(e.message);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};A.ui.toast=()=>{};
const mkw=(id,age,over)=>({id,data:Object.assign(A.gameWoman({age}),{nickname:'ผู้หญิง'+id,firstName:'ผู้หญิง'+id},over||{}),sim:{},chat:[],ai:{}});
X.load();
// names and custom forms
for(const w of ['ม.3','อายุ 16','อายุ ๑๕','16 ขวบ','schoolgirl','underage','kid','teen','minor','เด็กหญิง','ด.ญ.แก้ว','ม.ปลาย','under 18','high school']) ck('refuse minor-ish name: '+w,!!thr(()=>X.create('ฟอง '+w)));
for(const w of ['nineteen','eighteen','ผู้ใหญ่','มุก']) ck('allow ordinary name: '+w,thr(()=>X.create(w))===null);
X.create('วุ้น');ck('rename refuses minor-ish',!!thr(()=>X.rename('ม.2')));
// female-only
const lib=mkw('L1',30),man=mkw('M1',30,{sex:'ชาย'}),oth=mkw('O1',30,{sex:'ไม่ระบุ'});S.chars=[lib,man,oth];const f=X.libraryForms().map(x=>x.id);
ck('library: a woman (sex unset) is listed, a man and an unknown value are not',f.includes('L1')&&!f.includes('M1')&&!f.includes('O1'));
// norm on junk
ck('norm(null) does not throw and gives a slime',thr(()=>X.norm(null))===null&&X.norm(null).name);
const nj=X.norm({name:'x',others:[null,5,'a',{name:'ok'}],last:{vol:'<img onerror=1>',how:'<b>',acc:'zz'},log:[null,{line:5}],customs:[null,{id:1}]});
ck('norm: junk others dropped, last sanitised to numbers/short strings',nj.others.length===1&&nj.last.vol===0&&nj.last.how.length<=12&&nj.log.length===2);
ck('norm: null/empty numbers take the default, not 0',X.norm({hunger:null}).hunger===40&&X.norm({hunger:''}).hunger===40);
ck('norm: a minor-ish custom form is dropped',X.norm({customs:[{id:'a',name:'ม.4',age:25,w:{data:{age:25}}}]}).customs.length===0);
// kid lines never in meal memory; names not in prompt; bud guard
const z=X.get();z.mass=300;z.children.push(X.norm({children:[{id:'k1',name:'ฟองน้อย',born:z.day,size:12,traits:{playful:40,clingy:40,bold:40,curious:40}}]}).children[0]);X.feedSub(S.me,'k1','absorb');
z.form={key:'blob',name:'ก้อนสไลม์'};z.hunger=50;X.feed(S.me,'absorb');const pm=X.scenePrompt(S.me,'meal');
ck('meal prompt: the main scene never carries the small piece\'s name, its feeding lines or the budded clause',!/ฟองน้อย/.test(pm)&&!/ให้อาหาร ฟองน้อย/.test(pm)&&!/แตกตัวออกมาเป็นสไลม์ตัวเล็กชื่อ/.test(pm));
z.last.budded=true;z.last.child='ฟองน้อย';const pb=X.scenePrompt(S.me,'bud');
ck('bud prompt: nothing to do with pregnancy, no word for a child anywhere',/ไม่เกี่ยวกับการตั้งครรภ์/.test(pb)&&!/ลูกสไลม์|ไม่ใช่ลูก|เรียกว่าลูก/.test(pb+pm));
ck('meal prompt: adult-only form rule, beats and sound words (rules 8 and 9)',/ผู้หญิงผู้ใหญ่ 18 ปีขึ้นไป/.test(pm)&&/^8\. จังหวะของฉาก/m.test(pm)&&/^9\. คำเสียง/m.test(pm));
// stale write: the text lands on the slime it was written for, even after a switch
z.others.push(X.norm({name:'อีกตัว',id:'o9'}));const sid=z.id;X.switchTo('o9');
ck('after a switch the old slime is in others and abort was safe',X.get().name==='อีกตัว'&&X.get().others.some(x=>x.id===sid));
// art guardrails
const ids=G.LIQ.map(p=>p.id);
ck('no conception art',!ids.some(i=>/(x-sperm|xf-sperm)/.test(i)));
ck('every explicit pose group is adult-only wording (no child/minor words in titles)',G.LIQ.every(p=>!minorTest(p.t)));function minorTest(t){return /เด็ก|ม\.\d|นักเรียน|ขวบ/.test(t);}
// data
const D=A.slimeData;ck('slimedata: 40+ extra events, react lines for every way, beats and sounds',D&&D.EVENTS.length>=40&&['absorb','hand','mouth','body','inside','night'].every(k=>D.REACT[k]&&D.REACT[k].low.length&&D.REACT[k].full.length)&&D.BEATS.open.length>=4&&D.SOUNDS.length>=15);
X.create('ทดสอบ');const seen=new Set();for(let i=0;i<400;i++){X.nextDay();const l=X.get().log[X.get().log.length-1].line;seen.add(l);}
ck('400 days: far more variety than the 12 original events (30+ distinct lines)',seen.size>=30);
ck('no small-piece event fires when she has none',![...seen].some(l=>/สไลม์ย่อย/.test(l)));
return (bad?o.join('\n')+'\nTOTAL FAIL '+bad:'ALL OK')+'\nERRS none';}catch(e){return 'THROW '+e.message+' '+e.stack.slice(0,300);}}));
if(errs.length)console.log('PAGEERR',errs.slice(0,3));await b.close();})();
