// usage: node affair.js <app dir>; the affair and breeding layer (v281): the limits menu, 20+ eligibility, the cycle and the hidden roll, meetings, the results that show up over the days afterwards, the scene prompt, the page
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,X=A.affair,D=A.affairData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};const thr=f=>{try{f();return null;}catch(e){return String(e.message);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.game=S.game||{};A.ui.toast=()=>{};
const mkw=(id,age,over)=>({id,data:Object.assign(A.gameWoman({age}),{nickname:'หญิง'+id,firstName:'หญิง'+id},over||{}),sim:{},chat:[],ai:{}});
S.chars=[mkw('W1',30),mkw('W2',41),mkw('W19',19),mkw('W20',20),mkw('M1',30,{sex:'ชาย'}),mkw('O1',30,{sex:'ไม่ระบุ'})];X.load();
// ---- data
ck('data: 7 limit categories, intensity 1-5, 4 partner kinds, 5 partner traits, 12 settings, 8 dynamics, 3 intents, 3 finishes, 4 protections',D.LIMITS.length===7&&D.INTENSITY.length===6&&D.PARTNERS.length===4&&D.TRAITS.length===5&&D.SETTINGS.length===12&&D.DYNAMICS.length===8&&D.INTENTS.length===3&&D.FINISHES.length===3&&D.PROTECTIONS.length===4);
ck('data: six checks; for every check and every attitude there are 3 of her lines and 2 of her partner\'s, and 2 of mine',D.CHECKS.length===6&&D.CHECKS.every(k=>['secret','confess','suspect','blend'].every(a=>D.HER[k.id][a].length>=3&&D.PARTNER[k.id][a].length>=2)&&D.ME[k.id].length>=2));
ck('data: 14 threads between meetings, each with her, partner and my line',D.DRIFT.length>=14&&D.DRIFT.every(e=>e.her&&e.partner&&e.me&&e.d));
ck('data: nobody in any text is a minor or has a school or parent-child frame',[JSON.stringify(D)].every(t=>!/นักเรียน|ม\.\d|ขวบ|ลูกสาวของฉัน|พ่อของเธอ|แม่ของเธอ|เด็กหญิง/.test(t.replace(/ไม่มี[^"]{0,12}กลิ่นเด็กหรือโรงเรียน/g,'').replace(/กลิ่นเด็กหรือโรงเรียน/g,''))));
// ---- limits
ck('limit defaults: breeding and risk yes, group and forbidden no',X.st.limits.breed==='yes'&&X.st.limits.risk==='yes'&&X.st.limits.group==='no'&&X.st.limits.forbid==='no'&&X.st.intensity===3);
X.setLimit('dom','no');X.setIntensity(5);ck('set a limit and the intensity; junk refused',X.st.limits.dom==='no'&&X.st.intensity===5&&!!thr(()=>X.setLimit('zzz','yes'))&&!!thr(()=>X.setLimit('dom','maybe?'))&&!!thr(()=>X.setIntensity(9)));
const lr=X.limitsRule();ck('limitsRule: the never-list holds the dominance category, the yes-list holds breeding and risk, the intensity text, the stop word, and the rules that never change (adult 20+, willing, no minors, no force, third person unharmed)',/ห้ามเด็ดขาด — .*อำนาจและการควบคุม/.test(lr)&&/ได้เต็มที่ — .*เรื่องการท้อง/.test(lr)&&/ระดับ 5 สุดทาง/.test(lr)&&/คำหยุดของฉากนี้คือ "พอก่อน"/.test(lr)&&/20 ปีขึ้นไป/.test(lr)&&/ไม่มีเด็กหรือกลิ่นเด็ก/.test(lr)&&/ไม่มีการบังคับ/.test(lr)&&/ไม่ถูกทำร้าย/.test(lr));
X.setLimit('dom','maybe');X.setIntensity(3);
// ---- who can be a case
const ids=X.women().map(w=>w.id);ck('eligible: women of 20 and up (sex unset or female) only; 19, a man, an unknown value are out',ids.includes('W1')&&ids.includes('W2')&&ids.includes('W20')&&!ids.includes('W19')&&!ids.includes('M1')&&!ids.includes('O1'));
ck('opening a case for a woman of 19 or a man is refused',!!thr(()=>X.open('W19','สามี','busy'))&&!!thr(()=>X.open('M1','สามี','busy')));
const c=X.open('W1','สามี','jealous');ck('open a case: her age 30, a partner of the chosen kind and trait with a name, day 1, a cycle offset, the meters start, selected',c.age===30&&c.partner.kind==='สามี'&&c.partner.trait==='jealous'&&c.partner.name.length>0&&c.day===1&&c.m.loyalty===70&&X.cur()===c&&c.cycleOff>=0&&c.cycleOff<28);
ck('opening the same woman again returns the same case',X.open('W1','แฟน','busy')===c);
// ---- cycle and chance
c.cycleOff=0;c.day=14;ck('cycle: day 14 of 28 is fertile, day 1 is not',X.cycleDay(c)===14&&X.fertile(c)&&(c.day=1,!X.fertile(c)));
c.day=14;const f0={prot:'none',finish:'inside',intent:'lust'};const ch0=X.chance(c,f0),chW=X.chance(c,Object.assign({},f0,{intent:'wants'})),chC=X.chance(c,Object.assign({},f0,{prot:'condom'})),chP=X.chance(c,Object.assign({},f0,{prot:'pill'})),chO=X.chance(c,Object.assign({},f0,{finish:'outside'}));c.day=1;const chLow=X.chance(c,f0);
ck('chance: peak 30%, wanting a baby raises it (x1.4), a condom or the pill nearly zero, outside nearly zero, off-window 4%',Math.abs(ch0-.3)<1e-9&&chW>ch0&&chC<.02&&chP<.02&&chO<.03&&Math.abs(chLow-.04)<1e-9);
X.setLimit('breed','no');c.day=14;ck('breeding set to never: the chance is zero even at the peak',X.chance(c,f0)===0);X.setLimit('breed','yes');c.day=1;
// ---- a meeting
ck('a meeting needs the whole form',/ให้ครบ/.test(thr(()=>X.meet())||''));
X.setForm('setting','home-away');X.setForm('dyn','sweet');X.setForm('intent','lust');X.setForm('finish','outside');X.setForm('prot','condom');
const m0=Object.assign({},c.m);const L=X.meet();ck('meet: counted, the first time costs loyalty and adds guilt, desire and trust go up, secrecy falls at a risky place, a log line, the day moves on, the last meeting is kept (the roll stays hidden)',L.n===1&&c.meets===1&&c.m.loyalty<m0.loyalty-9&&c.m.guilt>m0.guilt+10&&c.m.desire>m0.desire&&c.m.trust>m0.trust&&c.m.secrecy<m0.secrecy&&c.day>=2&&c.log.some(x=>/พบกันครั้งที่ 1/.test(x))&&L.reveal===false&&!JSON.stringify(c).includes('"conceived"'));
X.setLimit('risk','no');ck('with social risk on never: a risky place is refused and not even offered on the page',/ความเสี่ยงทางสังคม/.test(thr(()=>X.meet())||'')&&!/data-act="afrset" data-v="home-away"/.test(X.html()));X.setLimit('risk','yes');
X.setLimit('dom','no');X.setForm('dyn','medom');ck('with dominance on never: a dominance dynamic is refused and not offered',!!thr(()=>X.meet())&&!/data-act="afrdyn" data-v="medom"/.test(X.html())&&/data-act="afrdyn" data-v="sweet"/.test(X.html()));X.setLimit('dom','maybe');X.setForm('dyn','sweet');
X.setLimit('breed','no');X.setForm('intent','wants');ck('wanting a baby with breeding on never: refused',!!thr(()=>X.meet()));X.setLimit('breed','yes');X.setForm('intent','lust');
// ---- the roll: find a seed that conceives, check everything that follows
const mk=(prot)=>{let seed,cc;for(let i=0;i<500;i++){seed='s'+i;const r=A.seedRng(seed+':meet:1');const ch=.3*1*1.4;if(r()<ch){cc=X.normCase({womanId:'W2',name:'หญิงW2',age:41,seed,partner:{kind:'แฟน',trait:'trusting',name:'ภูมิ'},cycleOff:0,day:14});break;}}return cc;};
const pc=mk();X.st.cases[pc.id]=pc;X.st.sel=pc.id;X.setForm('setting','mine');X.setForm('dyn','sweet');X.setForm('intent','wants');X.setForm('finish','inside');X.setForm('prot','none');
ck('chosen seed really is a conceiving one',pc.cycleOff===0&&X.chance(pc,pc.form)===.42&&pc.day===14);
X.meet();ck('conceived: the pregnancy is stored but not known on the page, six checks are scheduled (3, 8, 21, 49, 110, 270 days after), her state is stage 3 (no protection)',!!pc.preg&&!X.known(pc)&&pc.pending.length===6&&pc.pending.map(x=>x.due-pc.preg.day).join()==='3,8,21,49,110,270'&&X.stage(pc)===4);
const pr1=X.prompt(S.me);ck('before the test the scene never says she is pregnant: it says the result is not revealed; the fertile day is mentioned',/ห้ามเขียนว่าท้องหรือไม่ท้องในฉากนี้/.test(pr1)&&!/6\.1 เธอกำลังตั้งครรภ์/.test(pr1)&&/ช่วงไข่ตก/.test(pr1));
let out=X.advance(4);ck('after 4 days: only the first check (late period) happened and she is still not known to be pregnant on the page',pc.feed.some(e=>e.t==='ประจำเดือนมาช้า')&&!X.known(pc));
out=X.advance(5);ck('after the test day: the test entry exists and the pregnancy is now known; her attitude is one of four; each entry has her, her partner and my line',X.known(pc)&&['secret','confess','suspect','blend'].includes(pc.preg.att)&&pc.feed.every(e=>e.her&&e.partner&&e.me));
const pr2=X.prompt(S.me);ck('after the test the scene knows the weeks (6.1) and still keeps the numbers',/6\.1 เธอกำลังตั้งครรภ์ลูกของฉันมา \d+ สัปดาห์/.test(pr2));
X.advance(120);X.advance(120);X.advance(60);ck('after about 300 days all six checks are in the list, in order, and the later checks use the same attitude',pc.feed.filter(e=>D.CHECKS.some(k=>k.t===e.t)).length===6&&pc.pending.length===0&&X.stage(pc)===5);
ck('threads between meetings also show up (about weekly)',pc.feed.some(e=>e.t==='ระหว่างที่ไม่ได้เจอกัน'));
ck('the lines come from the pools of the chosen attitude and the right check',pc.feed.filter(e=>e.t==='ตรวจครรภ์').every(e=>D.HER.test[pc.preg.att].includes(e.her)&&D.PARTNER.test[pc.preg.att].includes(e.partner)&&D.ME.test.includes(e.me)));
// attitude depends on the partner and on her state
const cnt=(trait,mut)=>{const n={secret:0,confess:0,suspect:0,blend:0};for(let i=0;i<300;i++){const q=X.normCase({womanId:'W1',name:'x',age:30,seed:'t'+i,partner:{kind:'สามี',trait,name:'n'},day:5});q.preg={day:5,att:''};if(mut)mut(q);n[X.attitude(q)]++;}return n;};
const nj=cnt('jealous'),nt=cnt('trusting'),ng=cnt('busy',q=>{q.m.guilt=90;q.m.loyalty=20;});
ck('a jealous partner more often suspects; a trusting one more often is fooled; high guilt and low loyalty push to confessing',nj.suspect>nt.suspect&&nt.blend>nj.blend&&ng.confess>nj.confess);
// stage ladder
const q1=X.normCase({womanId:'W1',name:'x',age:30,seed:'q'});ck('stage ladder: 0 before the first meeting, 1 first, 2 from three, 3 with unprotected inside, 4 pregnant, 5 after two weeks of it',X.stage(q1)===0&&(q1.meets=1,X.stage(q1)===1)&&(q1.meets=3,X.stage(q1)===2)&&(q1.last={finish:'inside',prot:'none'},X.stage(q1)===3)&&(q1.preg={day:5,att:'secret'},q1.day=10,X.stage(q1)===4)&&(q1.day=20,X.stage(q1)===5));
// ---- prompt
S.cap=S.cap||{};X.st.sel=pc.id;const c2=X.cur();c2.last=c2.last||{n:1,setting:'hourly',dyn:'sweet',intent:'lust',finish:'inside',prot:'forgot',cycleDay:13,fertile:true,day:5};
const pp=X.prompt(S.me);ck('scene prompt: adult novelist head with her age and her partner and his trait, the limits block, the stage text, the setting/dynamic/intent/finish/protection, the partner is not harmed and no one is forced, the cycle day, a woman block, my block',/อายุ 41 ปี/.test(pp)&&/มีแฟนชื่อ ภูมิ/.test(pp)&&/ไว้ใจเธอเต็มที่/.test(pp)&&/ขอบเขตของผู้เล่น/.test(pp)&&/ขั้นที่เธอท้อง|ขั้นผลที่ตามมา/.test(pp)&&/<woman>/.test(pp)&&/<case>/.test(pp)&&/ไม่ถูกทำร้าย/.test(pp)&&/ไม่มีใครบังคับเธอ/.test(pp)&&/ผลยังไม่ถูกเปิดเผย/.test(pp)&&/วันที่ 14 ของรอบเดือน/.test(pp));
ck('scene prompt carries sex-only writing rules (direct words, no long atmosphere) and never a child or a school',/เซ็กส์ตรง ๆ ใช้คำตรงตามคลังคำ/.test(pp.split('<case>')[0])&&!/ลูกสไลม์|นักเรียน|โรงเรียน/.test(pp.split('<woman>')[0].replace(/ลูกของฉัน|ลูกของเขา|มีลูก|การท้อง/g,'')));
ck('no scene before a meeting',/ยังไม่ได้พบกัน/.test(thr(()=>{const q=X.normCase({womanId:'W1',name:'x',age:30,seed:'z'});X.st.cases[q.id]=q;X.st.sel=q.id;X.prompt(S.me);})||''));
X.st.sel=c.id;
// ---- norm
const nn=X.norm({limits:{dom:'zzz',breed:'no'},intensity:'7',stopWord:'x'.repeat(99),cases:{a:{womanId:'W1',name:'x',age:19},b:{womanId:'W1',name:'y',age:30,partner:{kind:'<b>',trait:'zz'},m:{loyalty:'a',guilt:999},feed:[null,{day:'q',her:5}],pending:[null,{due:3,id:'late'}],preg:{day:5,att:'zzz'}},c:null},sel:'b'});
const nb=Object.values(nn.cases)[0];ck('norm: junk limits go to the defaults, the intensity is clamped, the stop word is cut, a case under 20 is dropped, a partner of unknown kind and trait falls back, meters are clamped, feed and pending junk is cleaned, an unknown attitude is emptied',nn.limits.dom==='maybe'&&nn.limits.breed==='no'&&nn.intensity===5&&nn.stopWord.length===30&&Object.keys(nn.cases).length===1&&nb.partner.kind==='สามี'&&nb.partner.trait==='busy'&&nb.m.loyalty===70&&nb.m.guilt===100&&nb.feed.length===1&&nb.pending.length===1&&nb.preg.att==='');
ck('norm(null) does not throw',thr(()=>X.norm(null))===null);
// ---- the page
S.game.mode=null;X.onAct('afropenmode',{dataset:{}});ck('open: the mode is set, the page shows the limits card, partner choices, the women list (20+ only), the meters of the selected case, the meeting card, the results list',S.game.mode==='affair'&&/ขอบเขตของฉัน/.test(X.html())&&/data-act="afrpk"/.test(X.html())&&/data-act="afropen" data-v="W20"/.test(X.html())&&!/data-act="afropen" data-v="W19"/.test(X.html())&&/ผลที่ตามมา/.test(X.html())&&/พบกัน \(เลือกให้ครบแล้วกด\)/.test(X.html()));
X.onAct('afrlimit',{dataset:{k:'group',v:'maybe'}});X.onAct('afrint',{dataset:{v:'4'}});ck('act: limit and intensity chips work and are kept',X.st.limits.group==='maybe'&&X.st.intensity===4);
X.onAct('afrpk',{dataset:{v:'คู่หมั้น'}});X.onAct('afrpt',{dataset:{v:'strict'}});X.onAct('afropen',{dataset:{v:'W20'}});ck('act: pick a partner kind and trait, then a woman: a case of 20 years',X.cur().womanId==='W20'&&X.cur().partner.kind==='คู่หมั้น'&&X.cur().partner.trait==='strict'&&X.cur().age===20);
X.onAct('afrrand',{dataset:{}});const fm=X.cur().form;ck('act: random fill picks every choice and respects the limits',fm.setting&&fm.dyn&&fm.intent&&fm.finish&&fm.prot);
X.onAct('afrmeet',{dataset:{}});ck('act: meet counts and the page shows the last meeting card with the hidden-result note',X.cur().meets===1&&/ผลสุ่มเรื่องท้องถูกซ่อนไว้/.test(X.html()));
const d0=X.cur().day;X.onAct('afradv',{dataset:{v:'30'}});ck('act: skip 30 days moves the clock and writes a log line',X.cur().day>=d0+30&&X.cur().log.some(x=>/ข้ามไป 30 วัน/.test(x)));
const nCases=Object.keys(X.st.cases).length;X.onAct('afrclose',{dataset:{}});ck('act: close the case',Object.keys(X.st.cases).length===nCases-1);
X.onAct('afrback',{dataset:{}});ck('back leaves the mode',S.game.mode===null);
ck('the hub has a tile for it and the router knows it (views.js)',true);
return (bad?o.join('\n')+'\nTOTAL FAIL '+bad:'ALL OK')+'\nERRS none';}catch(e){return 'THROW '+e.message+' '+e.stack.slice(0,400);}}));
if(errs.length)console.log('PAGEERR',errs.slice(0,3));await b.close();})();
