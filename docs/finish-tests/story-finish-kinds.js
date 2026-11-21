// usage: node story-finish-kinds.js <app dir>; a continuous-story night: only an inside finish gets the finish-style/womb lines, every finish kind gets the peak rule (FIN_RULE)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{try{const A=ANIMA,o=[];const me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง'}};A.state.me=me;
const c={id:'sc1',data:A.gameWoman({age:30}),story:{at:Date.now(),eps:[]},sim:{rel:'แฟน',relSet:1},chat:[],ai:{}};A.state.chars=[c];
const FR=A.world.FIN_RULE.slice(0,25);
for(const fin of ['inside','outside','condom','mouth','hand']){const ep={k:1,at:Date.now(),kind:'night',plan:{},role:'',ctx:''};const roll=A.storyRoll(c,me,ep,{});ep.roll=roll;if(!roll.release){o.push(fin+': no release rolled');continue}roll.finish=fin;c.story.eps=[ep];
 let pr;try{pr=A.storyPrompt(c,me,ep,{})}catch(e){o.push(fin+': ERR '+e.message.slice(0,90));continue}const t=pr.text||String(pr);
 o.push(fin+': finish line '+/รูปแบบการแตกใน/.test(t)+' | FIN_RULE '+t.includes(FR)+' | womb '+/น้ำทะลุเข้าไปในมดลูก/.test(t)+' | out text '+/ข้างนอก|ในถุงยาง|ในปาก|บนมือ/.test(t.slice(t.indexOf('<release>'),t.indexOf('<release>')+1800)))}
return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,300)}}));console.log(errs.join('|')||'none');await b.close()})();
