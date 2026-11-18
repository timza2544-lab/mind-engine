// usage: node story-share.js <app dir>; one woman's written story can be put into another as shared memory ('lived' = she was there, name swapped; 'told' = she knows but was not there): the story prompt and the interview read it, the source story is untouched, minors refused, the panel lists and removes it (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/fonts\./,r=>r.abort());
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};A.state.me=me;
const mkc=(id,age,nick)=>({id,data:Object.assign(A.gameWoman({age}),{nickname:nick,firstName:nick}),story:{at:Date.now(),eps:[]},sim:{rel:'แฟน',relSet:1},chat:[],ai:{}});
const a=mkc('sa',27,'มินตรา'),c=mkc('sb',31,'พลอยใส');A.state.chars=[a,c];
const ep=(k)=>{const e={k,at:1000+k*100,id:'e'+k,kind:'night',plan:{scope:'full'},days:3};e.roll=A.storyRoll(a,me,e,{});e.scene='ฉากที่ '+k+' ของมินตรา';e.summary='มินตรากับต้นไปดูหนังด้วยกันแล้วกลับมาที่ห้อง ตอนที่ '+k;return e;};
a.story.eps=[ep(1),ep(2),ep(3)];
ck('sources: only others with written episodes',A.storyShareSources([a,c,{id:'example',data:{},story:{eps:[ep(9)]}}],c).length===1&&A.storyShareSources([a,c],a).length===0);
const before=JSON.stringify(a.story);
const e1=A.storyShareAdd(c,a,{mode:'lived'});
ck('lived: entry made with 3 episodes',e1&&e1.eps.length===3&&e1.mode==='lived');
ck('lived: her name replaces the source woman\'s name in the memory',e1.eps.every(x=>x.text.includes('พลอยใส')&&!x.text.includes('มินตรา')));
ck('source story untouched',JSON.stringify(a.story)===before);
// the prompt for c's first episode
const mine=(()=>{const e={k:1,at:5000,id:'ee1',kind:'night',plan:{scope:'full'},days:5};e.roll=A.storyRoll(c,me,e,{});c.story.eps=[e];return e;})();
let txt=A.storyPrompt(c,me,mine,{}).text;
ck('story prompt carries <shared-memory> with the rule and the lived wording',/^<shared-memory>$/m.test(txt)&&/ความทรงจำร่วมของพลอยใสกับต้น/.test(txt)&&/ไม่ขัดกับ <history>/.test(txt)&&/พลอยใส/.test(txt));
// told
const e2=A.storyShareAdd(c,a,{mode:'told',ks:[1,2]});ck('told: only the chosen episodes, name kept',e2&&e2.eps.length===2&&e2.eps.every(x=>x.text.includes('มินตรา')));
ck('lived and told from the same woman live side by side',A.storyShared(c).length===2);
txt=A.storyPrompt(c,me,mine,{}).text;ck('told wording: she was not there',/ไม่ได้อยู่ในเหตุการณ์/.test(txt)&&/มินตรา/.test(txt));
// the same mode again replaces, not duplicates
A.storyShareAdd(c,a,{mode:'told'});ck('same source and mode replaces the earlier entry',A.storyShared(c).length===2);
// the interview
const note=A.storyChatNote(c,me);ck('interview hears the shared memory',/ความทรงจำร่วมของพลอยใสกับต้น/.test(note)&&/สิ่งที่พลอยใสรู้เกี่ยวกับต้นกับมินตรา/.test(note));
c.story.eps=[];const note2=A.storyChatNote(c,me);ck('interview with no episodes of her own still hears it (told memory + the rule)',/สิ่งที่พลอยใสรู้เกี่ยวกับต้นกับมินตรา/.test(note2)&&/ไม่ขัดกับ <history>/.test(note2));
// remove
ck('remove works',A.storyShareRemove(c,e1.id)&&A.storyShared(c).length===1&&!A.storyShareRemove(c,'nope'));
// refusals
const kid={id:'kd',data:Object.assign({},a.data,{age:15,birthday:''}),story:{eps:[ep(1)]}};if(A.minor(kid.data)){ck('minor source refused',A.storyShareAdd(c,kid,{mode:'told'})===null);ck('minor target refused',A.storyShareAdd(kid,a,{mode:'told'})===null);}
ck('empty source refused',A.storyShareAdd(c,mkc('sz',30,'ว่าง'),{mode:'told'})===null);ck('self refused',A.storyShareAdd(c,c,{mode:'told'})===null);
// cap
for(let i=0;i<8;i++){const x=mkc('sx'+i,25+i,'คนที่'+i);x.story.eps=[ep(1)];A.storyShareAdd(c,x,{mode:'told'});}ck('at most 6 shared entries',A.storyShared(c).length<=6);
// the panel
o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));const ui=await p.evaluate(async()=>{try{const A=ANIMA,S=A.state,U=A.ui,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.me=me;
const a=U.createChar(Object.assign(A.gameWoman({age:27}),{nickname:'มินตรา',firstName:'มินตรา'})),c=U.createChar(Object.assign(A.gameWoman({age:31}),{nickname:'พลอยใส',firstName:'พลอยใส'}));
const e={k:1,at:1000,id:'e1',kind:'night',plan:{scope:'full'},days:3};e.roll=A.storyRoll(a,me,e,{});e.scene='ฉาก';e.summary='มินตรากับต้นไปดูหนัง';a.story={at:Date.now(),eps:[e]};
S.view='talk';S.talk.mode='story';S.talk.charId=c.id;S.curId=c.id;U.renderAll();
ck('panel shows the share card with a source list',!!document.querySelector('.story-share')&&!!document.querySelector('#shareSrc')&&/มินตรา \(1 ตอน\)/.test(document.querySelector('#shareSrc').textContent));
document.querySelector('#shareMode').value='lived';document.querySelector('[data-act="storyshare"]').click();await new Promise(r=>setTimeout(r,200));
ck('click: the memory is stored on her',A.storyShared(c).length===1&&A.storyShared(c)[0].mode==='lived');
ck('panel lists it with a remove button',/มินตรา · จำร่วมกัน · 1 ตอน/.test(document.querySelector('.story-share').textContent)&&!!document.querySelector('[data-act="storyshareoff"]'));
document.querySelector('[data-act="storyshareoff"]').click();await new Promise(r=>setTimeout(r,200));
ck('click remove: gone',A.storyShared(c).length===0);
o.push(bad?'TOTAL FAIL '+bad:'UI ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,400)}});console.log(ui);
console.log('ERRS',errs.join('|')||'none');await b.close()})();
