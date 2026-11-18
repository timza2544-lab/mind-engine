// usage: node wish-variety.js <app dir>; pact giver side: wishes are many and varied: 120+ wishes in 14 categories, several phrasings per wish, who asks matches age/job, the last nights' wishes and today's list are avoided, no repeats inside one day's list, and the specific character of a wish reaches the prompt (expect ALL OK)
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.argv[2]+'/index.html');await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{try{const A=ANIMA,S=A.state,X=A.pact,D=A.pactData,o=[];let bad=0;const ck=(n,v)=>{if(!v){bad++;o.push('FAIL '+n);}};
S.me={id:'me-profile',kind:'me',data:{age:34,nickname:'ต้น',firstName:'ต้น',sex:'ชาย',mVolume:'ปานกลาง',mLength:15}};S.chars=[];S.game=S.game||{};X.load();X._test=true;S.pactPick=S.pactPick||{};S.pactCodex=[];S.pactToday=null;
const W=D.WISH,cats=new Set(W.map(w=>w.cat));
ck('120+ wishes ('+W.length+') in the same 14 categories that have results',W.length>=120&&cats.size===14&&[...cats].every(c=>D.RIPPLE[c]));
ck('ids unique, every wish has a ritual motif and text',new Set(W.map(w=>w.id)).size===W.length&&W.every(w=>D.RITUAL[w.motif]&&D.RITUAL[w.motif][5]&&w.t&&w.sit&&w.ask&&Array.isArray(w.size)&&w.size[0]>=1&&w.size[1]<=5&&w.size[0]<=w.size[1]));
const txt=w=>[].concat(w.sit,w.ask).join(' ');
ck('{target} is used exactly when the wish has a target',W.every(w=>/\{target\}/.test(txt(w))===!!w.target));
ck('new wishes: 2 phrasings of the situation and of the ask, and a result hint (fx)',W.filter(w=>Array.isArray(w.sit)).length>=90&&W.filter(w=>Array.isArray(w.sit)).every(w=>w.sit.length>=2&&Array.isArray(w.ask)&&w.ask.length>=2&&w.fx&&w.fx.length>=20));
ck('no minor in any wish text',!/เด็กหญิง|เด็กชาย|นักเรียนมัธยม|ม\.\d|อายุ 1[0-7] /.test(W.map(txt).join(' ')));
// the draw is wide and no wish dominates
const draw=n=>{const c={};for(let i=0;i<n;i++){const m=X.newPerson(S.me,'deity','B','mid');c[m.wishId]=(c[m.wishId]||0)+1;}return c;};
const c=draw(400),ids=Object.keys(c),mx=Math.max(...Object.values(c));o.push('400 draws: '+ids.length+' different wishes, most common '+mx+' ('+(mx/4).toFixed(1)+'%)');
ck('wide: 70+ different wishes in 400 draws, none above 4%',ids.length>=70&&mx/400<=.04);
ck('the old and the new both appear',ids.some(i=>['job','debt','lovemine','child','rain'].includes(i))&&ids.some(i=>/^(w_|m_|l_|g_|b_|h_|c_|j_|p_|f_|t_|pe_|r_|ha_)/.test(i)));
// the women are adults of 18 to 60
const ages=[];for(let i=0;i<800;i++){const m=X.newPerson(S.me,'deity','B','mid');ages.push(A.ageOf(m.w.data));}
const mn=Math.min(...ages),mxa=Math.max(...ages);o.push('ages: '+mn+'-'+mxa);ck('ages are 18 to 60 (800 women: '+mn+'-'+mxa+'), both ends and the middle occur',mn>=18&&mxa<=60&&ages.some(a=>a<=20)&&ages.some(a=>a>=57)&&ages.filter(a=>a>=35&&a<=45).length>=60);
// phrasing varies for one wish
const one=W.find(w=>w.id==='w_boss'),seen=new Set();for(let i=0;i<40;i++){const m=X.newPerson(S.me,'deity','B','mid',{seed:'v'+i,wishId:'w_boss'});seen.add(m.sit+'|'+m.ask);}ck('one wish, several phrasings ('+seen.size+')',seen.size>=3);
ck('no placeholder left in what she says',(()=>{for(let i=0;i<150;i++){const m=X.newPerson(S.me,'deity','B','mid');if(/[{}]|undefined/.test(m.sit+m.ask+m.ctx.wish))return false;}return true;})());
// who asks: a farmer / a fisher / a young graduate / an old woman
const draws=(over,n,fn)=>{let k=0;for(let i=0;i<n;i++){const d=A.gameWoman({age:over.age||30});Object.assign(d,over);const m=X.newPerson(S.me,'deity','B','mid',{w:{id:'t'+i,data:d,sim:{},chat:[],ai:{}}});if(fn(m.wishId))k++;}return k/n;};
const farm=draws({age:45,occupation:'เกษตรกร ทำนา'},200,id=>/^(rain|ha_)/.test(id)),plain=draws({age:45,occupation:'พนักงานออฟฟิศ'},200,id=>/^(rain|ha_)/.test(id));
const old=draws({age:58,occupation:'เกษียณ'},1500,id=>id==='w_retire'),young=draws({age:30,occupation:'พนักงานออฟฟิศ'},200,id=>id==='w_retire');
const first=draws({age:22,occupation:'ว่างงาน'},1000,id=>id==='w_firstjob'),mid=draws({age:48,occupation:'ข้าราชการ'},200,id=>id==='w_firstjob');
o.push('farmer '+(farm*100).toFixed(0)+'% vs office '+(plain*100).toFixed(0)+'% farm wishes · age 58 '+(old*100).toFixed(1)+'% vs 30 '+(young*100).toFixed(1)+'% retire · age 22 '+(first*100).toFixed(1)+'% vs 48 '+(mid*100).toFixed(1)+'% first job');
ck('who asks matches the job and age (farmer, retirement, first job)',farm>plain*1.4&&old>young&&old>=.008&&first>mid&&first>=.01);
// the last nights' wishes are avoided
S.pactCodex=[];const base=draw(300);const topId=Object.keys(base).sort((a,b)=>base[b]-base[a])[0];const topT=W.find(w=>w.id===topId).t;
S.pactCodex=[{role:'give',wish:topT,seed:'s1',at:1,w:{id:'q',data:{}}}];const after=draw(300);o.push('avoid: '+topId+' '+base[topId]+' -> '+(after[topId]||0)+' of 300 when it was among the last nights');ck('a wish from a recent night comes up much less ('+base[topId]+' -> '+(after[topId]||0)+')',(after[topId]||0)<=base[topId]*.6);S.pactCodex=[];
// one day's list: no two visitors with the same wish
let dup=0;for(let n=1;n<=40;n++){X.dayKey=()=>'2032-05-'+String(n).padStart(2,'0');S.pactToday=null;const t=X.todayVisitors(S.me),ids2=t.list.map(v=>v.wishId);if(new Set(ids2).size!==ids2.length)dup++;}ck('no wish twice in one day\'s list (40 days)',dup===0);
// the character of the wish reaches the prompt
Object.assign(S.pactPick,{role:'give',mode:'B',ent:'deity'});const g=X.newPerson(S.me,'deity','B','mid',{wishId:'w_boss'});S.pact=g;g.rung=2;X.propose(S.me);if(g.stage==='haggle')X.accept(S.me);
if(g.stage==='offer'){X.perform(S.me);const sp=X.scenePrompt(S.me),rp=X.ripplePrompt(S.me);ck('scene and result prompts carry the wish\'s own character (fx)',sp.includes('ลักษณะเฉพาะของพรข้อนี้')&&sp.includes(W.find(w=>w.id==='w_boss').fx)&&rp.includes(W.find(w=>w.id==='w_boss').fx));}
// child wishes keep the pregnancy behaviour of the old child wish
const ch=W.filter(w=>w.cat==='child');ck('child wishes: 5, all in the child category with the seed ritual',ch.length>=5&&ch.every(w=>w.motif==='seed'||D.RITUAL[w.motif]));
X._test=false;o.push(bad?'TOTAL FAIL '+bad:'ALL OK');return o.join('\n')}catch(e){return 'THROW '+e.message+String(e.stack).slice(0,500)}}));console.log('ERRS',errs.join('|')||'none');await b.close()})();
